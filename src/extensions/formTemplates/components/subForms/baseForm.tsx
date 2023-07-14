import * as React from 'react'
import { FC } from 'react'
import { FormDisplayMode } from '@microsoft/sp-core-library'
import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'

//import { localeCurrencies } from '../help/dictionaries'

import { GetColProps } from '../../help/helperFunctions'
import { Button, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { TextCard } from '../cards'
import { FormSubmit, IFormTemplatesProps, LocaleStrings } from '../formTemplates'
import DevInfoButon from '../../help/devInfoButton'

/* eslint-disable @typescript-eslint/no-explicit-any */

const BaseForm: FC<IFormTemplatesProps> = (props) => {
  //#region TEMPLATE_STATES
    const [item, setItem] = React.useState<Record<string, any>>(props.displayMode === FormDisplayMode.New ? {} : props.context.item)
    const [cols, setCols] = React.useState<IColProps[]>([])
    const [show, setShow] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = React.useState<string>('')
    const [sourcePage, setSourcePage] = React.useState<string>('')
  //#endregion
  
  //#region TEMPLATE_FUNCTIONS
    const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>): Promise<void> => {
      await FormSubmit(props.sp, item, props.context.list.guid.toString(), props.displayMode, setErrorMessage, setShow, props.onSave)
    }
  //#endregion

  //#region ON_LOAD
    React.useEffect(() => {
      const urlParams = new URLSearchParams(window.location.href)
      setSourcePage(urlParams?.get('Source'))

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

  //#region FORM_CODE
    const [TitleProps, TitlePropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      TitlePropsSet(GetColProps('Title', cols))
    }, [cols])

    const StringValSet = (value: string, valueName: string): void => {
      setItem({
        ...item,
        [valueName]: value,
      })
    }

    const TitleHandle = {value: item['Title'], setValue: (value: string) => StringValSet(value,'Title')}
  //#endregion

  return (
    <>
      <Dialog
        open={show}
        onClose={() => {setShow(false)}}
      >
        <DialogTitle>
          {LocaleStrings.Form.DialogTitleError}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShow(false)}}>{LocaleStrings.Buttons.DialogClose}</Button>
        </DialogActions>
      </Dialog>
      <form>
        <Stack direction='column' spacing={2} sx={{maxWidth: '30rem', margin: '1rem'}}>
          <Stack direction='column' spacing={2}>
            <TextCard id='Title' title={TitleProps ? TitleProps.Title : ''} displayMode={props.displayMode}
                required={TitleProps ? TitleProps.Required : false} itemHandle={TitleHandle}/>
          </Stack>
          <Stack direction='row' spacing={2}>
            {props.displayMode === FormDisplayMode.Display
                ? <Button variant='contained' size='small' color='warning'
                  href={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/SPListForm.aspx?PageType=6&List=${props.context.list.guid}&ID=${props.context.itemId}&Source=${sourcePage}`}
                  >
                    {LocaleStrings.Buttons.Edit}
                  </Button>
                : <Button variant='contained' size='small' color='success' onClick={handleSubmit}>{LocaleStrings.Buttons.Save}</Button>}
            <Button variant='contained' size='small' color='error' onClick={() => {props.onClose()}}>{LocaleStrings.Buttons.Close}</Button>
            <DevInfoButon sp={props.sp} devListByEmail={[]} onClick={async () => {
              console.log(item)
            }}/>
          </Stack>
        </Stack>
      </form>
    </>
  )
}

export default BaseForm
