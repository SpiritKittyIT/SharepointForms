import * as React from 'react'
import { FC } from 'react'
import { FormDisplayMode } from '@microsoft/sp-core-library'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
import { GraphFI } from '@pnp/graph'
import { SPFI } from '@pnp/sp'
import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'

import './formTemplates.module.css'
import './cards/cardStyles.css'
import './dataDisplays/dataDisplayStyles.css'
import './customFormStyles.css'
//import { localeCurrencies } from '../help/dictionaries'

import Error from './error'
import TextCard from './cards/textCard'
import { ILang, getLangStrings } from '../loc/langHelper'
import { GetColProps } from '../help/helperFunctions'

export const LocaleStrings: ILang = getLangStrings('en')

export interface IFormTemplatesProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: (item: {}, etag?: string) => Promise<void>;
  onClose: () => void;
  graph: GraphFI
  sp: SPFI
}

const FormTemplate: FC<IFormTemplatesProps> = (props) => {
  //#region TEMPLATE_STATES
    const [item, setItem] = React.useState<Record<string, any>>(props.displayMode === FormDisplayMode.New ? {} : props.context.item) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [cols, setCols] = React.useState<IColProps[]>([])
    const [show, setShow] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = React.useState<string>('')
  //#endregion
  
  //#region TEMPLATE_FUNCTIONS
    const handleSubmit: (event: React.FormEvent<HTMLButtonElement>) => void = async (event) => {
      let valid = true
      let newErrorMessage = 'There were errors during form submission:'
      if (props.displayMode === FormDisplayMode.Display){
        setErrorMessage(`${newErrorMessage}\nYou can not submit form in Display mode`)
        setShow(true)
        return
      }
      const cardErrors = document.getElementsByClassName('Mui-error')
      if (cardErrors.length > 0) { valid = false }
      for (let i = 0; i < cardErrors.length; i++) {
        newErrorMessage = `${newErrorMessage}\n${cardErrors[i].textContent}`
      }
      if (!valid){
        setErrorMessage(newErrorMessage)
        setShow(true)
        return
      }
      let etag: string = ''
      await props.sp.web.lists.getById(props.context.list.guid.toString()).items.getById(item.Id)().then((val) => {
        etag = val['odata.etag']
      }).catch((error) => {
        console.error(error)
      })

      await props.onSave(item, etag).catch((error: Error) => {
        if (error.message.indexOf('The request ETag value') !== -1){
          setErrorMessage(`${newErrorMessage}\nETag value mismatch during form submission. Prease reload the site and re-submit.`)
        }
        else {
          setErrorMessage(`${newErrorMessage}\n${error.message}`)
        }
        setShow(true)
      })
    }
  //#endregion

  //#region ON_LOAD
    React.useEffect(() => {
      const removeFields = ['@odata.context', '@odata.editLink', '@odata.metadata', '@odata.etag', '@odata.id', '@odata.type',
        'OData__ColorTag', 'OData__dlc_DocId', 'OData__dlc_DocIdUrl', 'OData__CopySource', 'OData__UIVersionString',
        'MediaServiceImageTags', 'MediaServiceOCR']
  
      if (props.displayMode !== FormDisplayMode.New ) {
        const tmpItem = item
        removeFields.forEach(removeField => {
          delete tmpItem[removeField]
        })
        setItem(tmpItem)
      }
    
      props.sp.web.lists.getById(props.context.list.guid.toString()).fields.filter('Hidden eq false')()
      .then((fields) => {
        setCols(fields)
      })
      .catch(err => {
        setShow(true)
        console.error(err)
      })
    }, [props])
  //#endregion

  // Enter your code here

  //#region FORM_CODE
    const [TitleProps, TitlePropsSet] = React.useState<IColProps>()
    const [TestProps, TestPropsSet] = React.useState<IColProps>()
    const TestName = 'acColMultiPlain'
    React.useEffect(() => {
      TitlePropsSet(GetColProps('Title', cols))
      TestPropsSet(GetColProps(TestName, cols))
    }, [cols])

    const StringValSet = (value: string, valueName: string): void => {
      setItem({
        ...item,
        [valueName]: value,
      })
    }

    const TestValSet = (value: any, valueName: string): void => {
      setItem({
        ...item,
        [valueName]: value,
      })
    }

    const TitleHandle = {value: item['Title'], setValue: (value: string) => StringValSet(value,'Title')}
    const TestHandle = {value: item[TestName], setValue: (value: any) => TestValSet(value,TestName)}
  //#endregion

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form>
        <TextCard id='Title' title={TitleProps ? TitleProps.Title : ''} displayMode={props.displayMode}
            required={TitleProps ? TitleProps.Required : false} itemHandle={TitleHandle}/>
        <TextCard id={TestName} title={TestProps ? TestProps.Title : ''} displayMode={props.displayMode}
            required={true} itemHandle={TestHandle} multiLine />
        {props.displayMode !== FormDisplayMode.Display ? <button type='button' className='button button-green' onClick={handleSubmit}>{LocaleStrings.Buttons.Save}</button> : <></>}
        <button type='button' className='button button-red' onClick={() => {props.onClose()}}>{LocaleStrings.Buttons.Close}</button>
        <button type='button' className='button button-blue' onClick={async () => {
          console.log(item)
        }}>Info</button>
      </form>
    </>
  )
}

export default FormTemplate
