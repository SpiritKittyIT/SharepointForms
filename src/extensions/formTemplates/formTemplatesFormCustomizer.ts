import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { SPFI, spfi, SPFx } from '@pnp/sp'
import { LogLevel, PnPLogging } from '@pnp/logging'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/batching'

import { GraphFI, graphfi, SPFx as graphSPFx } from '@pnp/graph'
import '@pnp/graph/sites'
import '@pnp/graph/groups'
import '@pnp/graph/members'
import { FormDisplayMode, Log } from '@microsoft/sp-core-library'
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http'
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility'

import FormTemplates, { IFormTemplatesProps } from './components/formTemplates'

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormTemplatesFormCustomizerProperties {}

const LOG_SOURCE: string = 'FormTemplatesFormCustomizer'

export default class FormTemplatesFormCustomizer
  extends BaseFormCustomizer<IFormTemplatesFormCustomizerProperties> {

  private _graph: GraphFI
  private _sp: SPFI

  public onInit(): Promise<void> {
    // The framework will wait for the returned promise to resolve before rendering the form.
    Log.info(LOG_SOURCE, 'Activated FormTemplatesFormCustomizer with properties:')
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2))
    this._sp = spfi().using(SPFx(this.context)).using(PnPLogging(LogLevel.Warning))
    this._graph = graphfi().using(graphSPFx(this.context)).using(PnPLogging(LogLevel.Warning))

    return Promise.resolve()
  }

  public render(): void {
    const formTemplates: React.ReactElement<{}> =
      React.createElement(FormTemplates, {
        context: this.context,
        displayMode: this.displayMode,
        onSave: this._onSave,
        onClose: this._onClose,
        graph: this._graph,
        sp: this._sp,
       } as IFormTemplatesProps)

    ReactDOM.render(formTemplates, this.domElement)
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    ReactDOM.unmountComponentAtNode(this.domElement)
    super.onDispose()
  }

  private _onSave = async (item: {}, etag: string): Promise<void> => {
    // disable all input elements while we're saving the item
    this.domElement.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'))
  
    let request: Promise<SPHttpClientResponse> = new Promise<SPHttpClientResponse>(() => {return})
  
    switch (this.displayMode) {
      case FormDisplayMode.New:
        request = this._createItem(item)
        break
      case FormDisplayMode.Edit:
        request = this._updateItem(item, etag)
    }
  
    const res: SPHttpClientResponse = await request
  
    if (res.ok) {
      // You MUST call this.formSaved() after you save the form.
      this.formSaved()
    }
    else {
      const error: { error: { message: string } } = await res.json()
      
      this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
      throw new Error(error.error.message)
    }
  }

  private _createItem(item: {[key: string]:string}): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetById('${this.context.list.guid}')/items`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none'
        },
        body: JSON.stringify(item)
      })
  }

  private _updateItem(item: {[key: string]:string}, etag: string): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/GetById('${this.context.list.guid}')/items(${this.context.itemId})`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          'if-match': etag,
          'x-http-method': 'MERGE'
        },
        body: JSON.stringify(item)
      })
  }

  private _onClose =  (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed()
  }
}
