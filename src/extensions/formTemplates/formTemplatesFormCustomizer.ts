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
  BaseFormCustomizer
} from '@microsoft/sp-listview-extensibility'

import FormTemplates, { IFormTemplatesProps } from './components/formTemplates'
import { IItemUpdateResult } from '@pnp/sp/items'
import { ValidateUpdateMemberMultiField } from './help/helperFunctions'

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

  private _onSave = async (item: Record<string, any>, etag: string): Promise<void> => {
    // disable all input elements while we're saving the item
    this.domElement.querySelectorAll('input').forEach(el => el.setAttribute('disabled', 'disabled'))

    // person or group multi select fields need to be validated
    const fieldsToValidate: {fieldName: string, fieldValue: number[]}[] = []

    switch (this.displayMode) {
      case FormDisplayMode.New:
        await this._sp.web.lists.getById(this.context.list.guid.toString()).items.add(item)
          .then((result: IItemUpdateResult) => {return},
          (reason: any) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw new Error('Form submit error.')
        }).catch((err) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw err
        })
        break
      case FormDisplayMode.Edit:
        await this._sp.web.lists.getById(this.context.list.guid.toString()).items.getById(this.context.itemId).update(item, etag)
        .then((result: IItemUpdateResult) => {return},
          (reason: any) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw new Error('Form submit error.')
        }).catch((err) => {
          this.domElement.querySelectorAll('input').forEach(el => el.removeAttribute('disabled'))
          throw err
        })

        if (fieldsToValidate.length > 0) {
          ValidateUpdateMemberMultiField(fieldsToValidate, this._sp)
          .then((validateFields) => {
            this._sp.web.lists.getById(this.context.list.guid.toString()).items.getById(this.context.itemId)
            .validateUpdateListItem(validateFields)
            .then((val) => {return})
            .catch((err) => {
              throw err
            })
          }).catch((err) => {
            throw err
          })
        }
        break
    }
    // You MUST call this.formSaved() after you save the form.
    this.formSaved()
  }

  private _onClose =  (): void => {
    // You MUST call this.formClosed() after you close the form.
    this.formClosed()
  }
}
