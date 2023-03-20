import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import {
  SPHttpClient
} from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import { FC } from 'react';
import Error from './error';
import './formTemplates.module.css'

export interface IFormTemplatesProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: (item: {}, etag?: string) => void;
  onClose: () => void;
}

export interface IColumn {
  Title: string,
  InternalName: string,
  TypeAsString: string,
  TypeDisplayName: string,
  Choices?: [string],
  LookupField?: string,
  LookupList?: string,
  LookupWebId?: string
}

const FormTemplate: FC<IFormTemplatesProps> = (props) => {
  const [item, setItem] = React.useState<{[key: string]:string}>({})
  const [cols, setCols] = React.useState<IColumn[]>([])
  const [etag, setEtag] = React.useState<string>("")
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (props.displayMode !== FormDisplayMode.New) {
      props.context.spHttpClient
      .get(props.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('${props.context.list.title}')/items(${props.context.itemId})`, SPHttpClient.configurations.v1, {
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
          setShow(true)
          return Promise.reject(res.statusText);
        }
      })
      .then(body => {
        setItem(body)
        return Promise.resolve();
      });
    }
    
    if (props.displayMode !== FormDisplayMode.New) {
      props.context.spHttpClient
      .get(props.context.pageContext.web.absoluteUrl + `/_api/web/lists/getbytitle('${props.context.list.title}')/fieldsr?$select=Title,TypeAsString,TypeDisplayName,Choices$filter=Hidden eq false`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        else {
          setShow(true)
          return Promise.reject(res.statusText);
        }
      })
      .then(body => {
        setCols(body)
        console.log(cols)
        return Promise.resolve();
      });
    }
  }, [props])

  if (props.displayMode === FormDisplayMode.Display) {
    return (<div className="formTemplates">
        <label>title: {item["Title"]}</label>
        <button onClick={() => {props.onClose()}}>Close</button>
      </div>
  )}

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({
      ...item,
      [event.target.id]: event.target.value,
    })
    console.log(item)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    props.onSave(item, etag)
  }
  
  return (
    <>
      <Error show={show} setShow={setShow} />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="Title">Title</label>
          <input
            id="Title"
            type="text"
            value={item["Title"]}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Save</button>
        <button onClick={() => {props.onClose()}}>Close</button>
      </form>
    </>
  )
}

export default FormTemplate
