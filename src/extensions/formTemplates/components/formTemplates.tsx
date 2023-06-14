import * as React from 'react'
import { FC } from 'react'
import { FormDisplayMode } from '@microsoft/sp-core-library'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
import { GraphFI } from '@pnp/graph'
import { SPFI } from '@pnp/sp'
import "@pnp/sp/site-users/web"
import "@pnp/sp/site-groups/web"
import "@pnp/sp/webs"
import "@pnp/sp/lists"
import "@pnp/sp/items"
import "@pnp/sp/fields"
// import { User, Group } from "@microsoft/microsoft-graph-types"

import './formTemplates.module.css'
import './cards/cardStyles.css'
import './dataDisplays/dataDisplayStyles.css'
import './customFormStyles.css'
//import { localeCurrencies } from '../loc/dictionaries'

import Error from './error'
import TextCard from './cards/textCard'
// import { ISiteUserInfo, ISiteUserProps, IWebEnsureUserResult } from '@pnp/sp/site-users/types'
// import { ISiteGroupInfo } from '@pnp/sp/site-groups/types'

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
    const [item, setItem] = React.useState<{[key: string]:any}>(props.displayMode === FormDisplayMode.New ? {} : props.context.item) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [cols, setCols] = React.useState<IColProps[]>([])
    const [show, setShow] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = React.useState<string>('')
  //#endregion

  //#region TEMPLATE_FUNCTIONS
    // const contains: <A,V>(arr: A[], val: V, getVal?: (x: A) => V) => boolean
    //               = <A,V>(arr: A[], val: V, getVal = (x: A) => {return x as unknown as V}) => {
    //   for (const arrItem of arr){
    //     if (getVal(arrItem) === val) {return true}
    //   }
    //   return false
    // }

    const getColProps: (colName: string, cols: IColProps[]) => (IColProps | null) = (colName, cols) => {
      let result: (IColProps | null) = null
      cols.forEach(col => {
        if (col.InternalName === colName) {
          result = col
        }
      })
      return result
    }

    const handleSubmit: (event: React.FormEvent<HTMLButtonElement>) => void = async (event) => {
      let valid = true
      let newErrorMessage = 'There were errors during form submission:'
      if (props.displayMode === FormDisplayMode.Display){
        setErrorMessage(`${newErrorMessage}\nYou can not submit form in Display mode`)
        setShow(true)
        return
      }
      const cardErrors = document.getElementsByClassName('card-error')
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
      await props.sp.web.lists.getById(props.context.list.guid.toString()).items.getById(5)().then((val) => {
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
        let tmpItem = item
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

  //#region PEOPLE_GROUP
    //uncomment if used
    /*const GetGroupUsers = async (spGroupId: number): Promise<ISiteUserProps[]> => {
      const spUsers: ISiteUserProps[] = []
      const userPrincipalNames: Set<string> = new Set()

      const spGroupMembers: ISiteUserInfo[] = await props.sp.web.siteGroups.getById(spGroupId).users()

      for (let index = 0; index < spGroupMembers.length; index++) {
        const loginName = spGroupMembers[index].LoginName.split('|')
        if (loginName.length !== 3) {continue}
        if (loginName[1] === 'membership') {
          userPrincipalNames.add(spGroupMembers[index].UserPrincipalName)
        }
        if (loginName[1] === 'tenant' || loginName[1] === 'federateddirectoryclaimprovider') {
          await props.graph.groups.getById(loginName[2]).members()
            .then((data) => {
              const users: User[] = data
              users.forEach((user) => {
                userPrincipalNames.add(user.userPrincipalName)
              })
            }).catch((err) => {
              console.error(err)
            })
        }
      }
      const names = Array.from(userPrincipalNames)
      
      for (let index = 0; index < names.length; index++) {
        await props.sp.web.ensureUser(names[index]).then((result: IWebEnsureUserResult) => {
          spUsers.push(result.data)
        }).catch((err) => {
          console.error(`Nepodarilo sa nájsť zadaného používateľa: ${names[index]}`)
        })
      }
  
      return spUsers
    }
  
    const CheckGroupMembership = async (groupId: number): Promise<boolean> => {
      let result = false
      await props.sp.web.currentUser.groups.getById(groupId)().then((found) => {
        result = true
      }).catch(() => {
        result = false
      })
  
      return result
    }*/
  //#endregion

  // Enter your code here

  //#region FORM_CODE
    const [TitleProps, TitlePropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      TitlePropsSet(getColProps('Title', cols))
    }, [cols])

    const StringValSet = (value: string, valueName: string) => {
      setItem({
        ...item,
        [valueName]: value,
      })
    }

    const TitleHandle = {value: item['Title'], setValue: (value: string) => StringValSet(value,'Title')}
  //#endregion

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form>
        <TextCard id='Title' title={TitleProps ? TitleProps.Title : ''} displayMode={props.displayMode}
            required={TitleProps ? TitleProps.Required : false} itemHandle={TitleHandle}/>
        {props.displayMode !== FormDisplayMode.Display ? <button type='button' className='button button-green' onClick={handleSubmit}>Save</button> : <></>}
        <button type='button' className='button button-red' onClick={() => {props.onClose()}}>Close</button>
        <button type='button' className='button button-blue' onClick={async () => {
          console.log('Get all users')
        }}>Info</button>
      </form>
    </>
  )
}

export default FormTemplate
