import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import { FC } from 'react';
import Error from './error';
import './formTemplates.module.css'
import TextCard from './cards/textCard';
import DropDownCard from './cards/dropdownCard';

export interface IFormTemplatesProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: (item: {}, etag?: string) => void;
  onClose: () => void;
}

const FormTemplate: FC<IFormTemplatesProps> = (props) => {
  const [item, setItem] = React.useState<{[key: string]:string}>({})
  const [cols, setCols] = React.useState<IColProps[]>([])
  const [etag, setEtag] = React.useState<string>("")
  const [show, setShow] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  const getColProps: (colName: string, cols: IColProps[]) => (IColProps | null) = (colName, cols) => {
    let result: (IColProps | null) = null
    cols.forEach(col => {
      if (col.InternalName === colName) {
        result = col
      }
    })
    return result
  }

  React.useEffect(() => {
    if (props.displayMode !== FormDisplayMode.New) {
      props.context.spHttpClient
      .get(`${props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetById('${props.context.list.guid}')/Items(${props.context.itemId})`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (res.ok) {
          // store etag in case we'll need to update the item
          const e = res.headers.get('ETag')
          setEtag(e ? e : "")
          return res.json();
        }
        else {
          return Promise.reject(res.statusText);
        }
      })
      .then(body => {
        setItem(body)
        return Promise.resolve();
      })
      .catch(err => {
        setShow(true)
        console.error(err)
      })
    }
    
    if (props.displayMode !== FormDisplayMode.New) {
      props.context.spHttpClient
      .get(`${props.context.pageContext.web.absoluteUrl}/_api/web/lists/GetById('${props.context.list.guid}')/Fields?$filter=Hidden eq false`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        else {
          return Promise.reject(res.statusText);
        }
      })
      .then(body => {
        setCols(body.value)
        return Promise.resolve();
      })
      .catch(err => {
        setShow(true)
        console.error(err)
      })
    }
  }, [props])

  const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (event) => {
    let valid = true
    Object.keys(item).forEach(key => {
      let skip = false;
      ["FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "AuthorId", "EditorId", "OData__UIVersionString", "GUID"]
      .forEach(col => {
        if (key === col) {
          skip = true;
          return
        }})
      if (skip){return}

      if (!getColProps(key, cols)){
        valid = false
        setErrorMessage(`${errorMessage}\nAn extra key present in submitted item: ${key}`)
      }
    })
    if (!valid){
      setShow(true)
      event.preventDefault()
      return
    }
    props.onSave(item, etag)
  }

  if (props.displayMode === FormDisplayMode.Display) {
    return (<div className="formTemplates">
        <label>title: {item["Title"]}</label>
        <button onClick={() => {props.onClose()}}>Close</button>
      </div>
  )}

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form onSubmit={handleSubmit}>
        <TextCard id="Title" colProps={getColProps("Title", cols)} itemHandle={{value: item, setValue: setItem}} />
        <DropDownCard id="acColChoice" colProps={getColProps("acColChoice", cols)} itemHandle={{value: item, setValue: setItem}} />
        <button type="submit">Save</button>
        <button type="button" onClick={() => {props.onClose()}}>Close</button>
        <button type="button" onClick={() => {
          console.log(cols)
          console.log(item)
        }}>Test Info</button>
      </form>
    </>
  )
}

export default FormTemplate
