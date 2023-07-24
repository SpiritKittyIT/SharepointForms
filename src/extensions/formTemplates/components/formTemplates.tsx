import * as React from 'react'
import { FC } from 'react'
import { FormDisplayMode } from '@microsoft/sp-core-library'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
import { GraphFI } from '@pnp/graph'
import { SPFI } from '@pnp/sp'

import './formTemplates.module.css'
import './cards/cardStyles.css'
//import { localeCurrencies } from '../help/dictionaries'

import BaseForm from './subForms/baseForm'

import { ILang, getLangStrings } from '../loc/langHelper'
import { Backdrop, CircularProgress } from '@mui/material'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const LocaleStrings: ILang = getLangStrings('en')

export interface IFormTemplatesProps {
  context: FormCustomizerContext
  displayMode: FormDisplayMode
  formSubmit: (
    sp: SPFI,
    item: Record<string, any>,
    listGuid: string,
    displayMode: FormDisplayMode,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    onSave: (item: {}, etag?: string) => Promise<void>
  ) => Promise<void>
  onSave: (item: {}, etag?: string) => Promise<void>
  onClose: () => void
  graph: GraphFI
  sp: SPFI
}

const FormTemplate: FC<IFormTemplatesProps> = (props) => {
  const urlParams = new URLSearchParams(window.location.href)
  const [isLoading, setIsLoading] = React.useState(false)

  const FormSubmit = async (
    sp: SPFI,
    item: Record<string, any>,
    listGuid: string,
    displayMode: FormDisplayMode,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    onSave: (item: {}, etag?: string) => Promise<void>
  ): Promise<void> => {

    setIsLoading(true)
    if (displayMode === FormDisplayMode.Display){
      setErrorMessage(LocaleStrings.Form.DisplaySubmitError)
      setIsLoading(false)
      setShow(true)
      return
    }
    if (document.getElementsByClassName('Mui-error').length > 0){
      setErrorMessage(LocaleStrings.Form.FormSubmitError)
      setIsLoading(false)
      setShow(true)
      return
    }
    let etag: string = ''
    await sp.web.lists.getById(listGuid).items.getById(item.Id)().then((val) => {
      etag = val['odata.etag']
    }).catch((error) => {
      console.error(error)
    })

    const submitItem = item
    const dateFields: string[] = []
    dateFields.forEach((fieldName) => {
      if (item[fieldName]) {
        const newTime1 = new Date(item[fieldName].replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1'))
        submitItem[fieldName] = newTime1.toISOString()
      }
    })
    const peopleFields: string[] = []
    peopleFields.forEach((fieldName) => {
      if (!item[`${fieldName}Id`]) {
        item[`${fieldName}Id`] = []
      }
      if (!item[`${fieldName}StringId`]) {
        item[`${fieldName}StringId`] = []
      }
    })
    const listFields: string[] = []
    listFields.forEach((fieldName) => {
      if (!item[`${fieldName}Id`]) {
        item[`${fieldName}Id`] = []
      }
    })

    await onSave(submitItem, etag).catch((error: Error) => {
      if (error.message.indexOf('The request ETag value') !== -1){
        setErrorMessage(LocaleStrings.Form.ETagValueError)
      }
      else {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
      setShow(true)
    })
  }

  if (props.displayMode === FormDisplayMode.Edit && +urlParams?.get('FormType') === 1) {
    return (
      <>
        <Backdrop open={isLoading}>
          <CircularProgress />
        </Backdrop>
        <BaseForm context={props.context} displayMode={props.displayMode} formSubmit={FormSubmit} onSave={props.onSave} onClose={props.onClose} graph={props.graph} sp={props.sp} />
      </>
    )
  }

  return (
    <>
      <Backdrop open={isLoading}>
        <CircularProgress />
      </Backdrop>
      <BaseForm context={props.context} displayMode={props.displayMode} onSave={props.onSave} formSubmit={FormSubmit} onClose={props.onClose} graph={props.graph} sp={props.sp} />
    </>
  )
}

export default FormTemplate
