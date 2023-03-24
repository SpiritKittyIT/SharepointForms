import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import { FC } from 'react';
import Error from './error';
import './formTemplates.module.css'
import TextCard from './cards/textCard';
import DropDownCard from './cards/dropdownCard';
import { isNull } from 'lodash';

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
  }, [props])

  const handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void = (event) => {
    let valid = true
    setErrorMessage(``)
    Object.keys(item).forEach(key => {
      let skip = false;
      ["FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "AuthorId", "EditorId", "OData__UIVersionString", "GUID"]
      .forEach(col => {
        if (key === col) {
          skip = true;
          return
        }})
      if (skip){return}

      const colProps = getColProps(key, cols)
      if (!colProps){
        valid = false
        setErrorMessage(`${errorMessage}\nAn extra key present in submitted item: ${key}`)
        return
      }
      if (colProps.Required && (item[key] === "" || isNull(item[key]))){
        valid = false
        setErrorMessage(`${errorMessage}\n${colProps.Title} cannot be left empty`)
      }
    })
    if (!valid){
      setShow(true)
      event.preventDefault()
      return
    }
    if (props.displayMode === FormDisplayMode.Display){
      setErrorMessage(`${errorMessage}\nYou can not submit form in Display mode`)
      setShow(true)
      event.preventDefault()
      return
    }
    props.onSave(item, etag)
  }

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form onSubmit={handleSubmit}>
        <TextCard id="Title" colProps={getColProps("Title", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
        <DropDownCard id="acColChoice" colProps={getColProps("acColChoice", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
        {props.displayMode !== FormDisplayMode.Display ? <button type="submit">Save</button> : <></>}
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
