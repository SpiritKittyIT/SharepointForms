import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FormDisplayMode, Log } from '@microsoft/sp-core-library';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http'
import {
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility';

import FormTemplates, { IFormTemplatesProps } from './components/formTemplates';

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormTemplatesFormCustomizerProperties {}

const LOG_SOURCE: string = 'FormTemplatesFormCustomizer';

export default class FormTemplatesFormCustomizer
  extends BaseFormCustomizer<IFormTemplatesFormCustomizerProperties> {

  public onInit(): Promise<void> {
    // The framework will wait for the returned promise to resolve before rendering the form.
    Log.info(LOG_SOURCE, 'Activated FormTemplatesFormCustomizer with properties:');
    Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
    return Promise.resolve();
  }

  public render(): void {
    const formTemplates: React.ReactElement<{}> =
      React.createElement(FormTemplates, {
        context: this.context,
        displayMode: this.displayMode,
        onSave: this._onSave,
        onClose: this._onClose
       } as IFormTemplatesProps);

    ReactDOM.render(formTemplates, this.domElement);
  }

  public onDispose(): void {
    // This method should be used to free any resources that were allocated during rendering.
    ReactDOM.unmountComponentAtNode(this.domElement);
    super.onDispose();
  }

  private _onSave = async (item: {}, etag: string): Promise<void> => {
    // disable all input elements while we're saving the item
    this.domElement.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'));
  
    let request: Promise<SPHttpClientResponse> = new Promise<SPHttpClientResponse>(() => {})
  
    switch (this.displayMode) {
      case FormDisplayMode.New:
        request = this._createItem(item);
        break;
      case FormDisplayMode.Edit:
        request = this._updateItem(item, etag);
    }
  
    const res: SPHttpClientResponse = await request;
  
    if (res.ok) {
      // You MUST call this.formSaved() after you save the form.
      this.formSaved();
    }
    else {
      const error: { error: { message: string } } = await res.json();
      
      console.log(`An error has occurred while saving the item. Please try again. Error: ${error.error.message}`)
      this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'));
    }
  }

  private _createItem(item: {[key: string]:string}): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('${this.context.list.title}')/items`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none'
        },
        body: JSON.stringify(item)
      });
  }

  private _updateItem(item: {[key: string]:string}, etag: string): Promise<SPHttpClientResponse> {
    return this.context.spHttpClient
      .post(this.context.pageContext.web.absoluteUrl + `/_api/web/lists/getByTitle('${this.context.list.title}')/items(${this.context.itemId})`, SPHttpClient.configurations.v1, {
        headers: {
          'content-type': 'application/json;odata.metadata=none',
          'if-match': etag,
          'x-http-method': 'MERGE'
        },
        body: JSON.stringify(item)
      });
  }

  private _onClose =  (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed();
  }
}
