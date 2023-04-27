import * as React from 'react'
import { FC } from 'react'
import { FormDisplayMode } from '@microsoft/sp-core-library'
import { SPHttpClient } from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility'
//import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import './formTemplates.module.css'
import './cards/cardStyles.css'
import './dataDisplays/dataDisplayStyles.css'
import './customFormStyles.css'
//import { localeCurrencies } from '../loc/dictionaries'

import Error from './error'
import TextCard from './cards/textCard'

export interface IFormTemplatesProps {
  context: FormCustomizerContext;
  displayMode: FormDisplayMode;
  onSave: (item: {}, etag?: string) => Promise<void>;
  onClose: () => void;
}

const FormTemplate: FC<IFormTemplatesProps> = (props) => {
  //#region TEMPLATE_STATES
    const [item, setItem] = React.useState<{[key: string]:any}>({}) // eslint-disable-line @typescript-eslint/no-explicit-any
    const [cols, setCols] = React.useState<IColProps[]>([])
    const [etag, setEtag] = React.useState<string>("")
    const [keys, setKeys] = React.useState<string[]>([])
    const [show, setShow] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = React.useState<string>("")
  //#endregion

  //#region TEMPLATE_FUNCTIONS
    const contains: <A,V>(arr: A[], val: V, getVal?: (x: A) => V) => boolean
                  = <A,V>(arr: A[], val: V, getVal = (x: A) => {return x as unknown as V}) => {
      for (const arrItem of arr){
        if (getVal(arrItem) === val) {return true}
      }
      return false
    }

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
      const itemKeys = Object.keys(item)
      itemKeys.forEach((colName) => {
        if (!contains(keys, colName)) {
          delete item[colName]
          return
        }
      })
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
      await props.onSave(item, etag).catch((error: Error) => {
        if (error.message.indexOf("The request ETag value") !== -1){
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
    const keySettings = {
      add:[
        "FileSystemObjectType",
        "Id",
        "ServerRedirectedEmbedUri",
        "ServerRedirectedEmbedUrl",
        "OData__UIVersionString",
        "GUID"
      ],
      skipName:[
        "_UIVersionString",
        "Edit",
        "LinkTitleNoMenu",
        "LinkTitle",
        "DocIcon",
        "ItemChildCount",
        "FolderChildCount",
        "_ComplianceFlags",
        "_ComplianceTag",
        "_ComplianceTagWrittenTime",
        "_ComplianceTagUserId",
        "_IsRecord",
        "AppAuthor",
        "AppEditor"
      ],
      idOnlyName:[
        "ContentType",
        "Author",
        "Editor"
      ],
      idOnly:[
        "Lookup"
      ],
      stringId:[
        "User",
        "UserMulti"
      ]
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
        setKeys(keySettings.add.concat(body.value.flatMap((field: IColProps) => {
          if (contains(keySettings.skipName, field.InternalName)) { return [] }
          if (contains(keySettings.idOnlyName, field.InternalName)) { return `${field.InternalName}Id` }
          if (contains(keySettings.idOnly, field.TypeAsString)) { return `${field.InternalName}Id` }
          if (contains(keySettings.stringId, field.TypeAsString)) {
            return [`${field.InternalName}Id`, `${field.InternalName}StringId`]
          }
          return field.InternalName
        })))
        return Promise.resolve();
      })
      .catch(err => {
        setShow(true)
        console.error(err)
      })
    }, [props])
  //#endregion

  //#region PEOPLE_GROUP
    //uncomment if used
    /*const [siteUsers, setSiteUsers] = React.useState<User[]>([])
    const [siteGroups, setSiteGroups] = React.useState<Group[]>([])
    const [choiceUsers, setChoiceUsers] = React.useState<IChoice[]>([])
    const [choiceGroups, setChoiceGroups] = React.useState<IChoice[]>([])

    React.useEffect(() => {
      props.context.spHttpClient
        .get(`${props.context.pageContext.web.absoluteUrl}/_api/web/siteusers`, SPHttpClient.configurations.v1, {
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
          setSiteUsers(body.value.filter((user: User) => {
            switch (user.LoginName) {
              case "c:0(.s|true":
                return false
              case "i:0#.w|nt service\\spsearch":
                return false
              case "i:0i.t|00000003-0000-0ff1-ce00-000000000000|app@sharepoint":
                return false
              case "SHAREPOINT\\system":
                return false
              default:
                return true
            }
          }))
          return Promise.resolve();
        })
        .catch(err => {
          console.error(err)
        })
        props.context.spHttpClient
          .get(`${props.context.pageContext.web.absoluteUrl}/_api/web/sitegroups`, SPHttpClient.configurations.v1, {
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
            setSiteGroups(body.value.filter((group: Group) => {
              return group.OwnerTitle !== "System Account"
            }))
            return Promise.resolve();
          })
          .catch(err => {
            console.error(err)
          })
    }, [props])
    
    React.useEffect(() => {
      setChoiceUsers(siteUsers.filter((siteUser) => {
        return siteUser.LoginName.startsWith("i:0#.f|membership|")
      }).map((item) => {return {...item, Id: `${item.Id}`}}))

      const groupUsers: IChoice[] = siteUsers.filter((siteUser) => {
        return !siteUser.LoginName.startsWith("i:0#.f|membership|")
      }).map((item) => {return {...item, Id: `${item.Id}`}})
      const groups: IChoice[] = siteGroups.map((item) => {return {...item, Id: `${item.Id}`}})

      setChoiceGroups(groups.concat(groupUsers))
    }, [siteUsers, siteGroups])*/
  //#endregion

  //#region PDF
    //just a prototype for generating a pdf file to download
    //uncomment if used
    /*const [fileUrl, fileUrlSet] = React.useState<string>("")
    async function fillForm() {
      const pdfDoc = await PDFDocument.create()
      pdfDoc.setTitle('TestPdf')
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

      const page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      const fontSize = 30
      page.drawText('Creating PDFs in JavaScript is awesome!', {
        x: width*0 + 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0.53, 0.71),
      })

      const blob = new Blob([await pdfDoc.save()], {type: 'application/pdf'})
      fileUrlSet(URL.createObjectURL(blob))
    }

    React.useEffect(() => {
      fillForm()
    }, [cols])*/
  //#endregion


  //#region LOOKUP
    //uncomment if used
    /* eslint-disable */
    /*const [Lst, acLstSet] = React.useState<IChoice[]>([])
    const [LstSelected, LstSelectedSet] = React.useState<IChoice>()

    React.useEffect(() => {
      props.context.spHttpClient
        .get(`${props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbyid('3b8e8b9e-8abf-43cd-b9ea-46359a784bc6')/items`, SPHttpClient.configurations.v1, {
          headers: {
            accept: 'application/json'
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
          if(!body.value) {return}
          const listItems: IChoice[] = body.value
          acLstSet(listItems)
          for(const listItem of listItems){
            if(item["LstLookupId"]?.toString() === listItem.Id.toString()){
              LstSelectedSet(listItem)
            }
          }
          return Promise.resolve();
        })
        .catch(err => {
          console.error(err)
        })
    }, [props, keys])*/
    /* eslint-enable */
  //#endregion

  // Enter your code here

  //#region FORM_CODE
    /* eslint-disable */
    const [TitleProps, TitlePropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      TitlePropsSet(getColProps("Title", cols))
    }, [cols])

    const StringValSet = (value: string, valueName: string) => {
      setItem({
        ...item,
        [valueName]: value,
      })
    }

    const TitleHandle = {value: item["Title"], setValue: (value: string) => StringValSet(value,'Title')}
    /* eslint-enable */
  //#endregion

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form>
        <TextCard id="Title" title={TitleProps ? TitleProps.Title : ''} displayMode={props.displayMode}
            required={TitleProps ? TitleProps.Required : false} itemHandle={TitleHandle}/>
        {props.displayMode !== FormDisplayMode.Display ? <button type="button" className='button button-green' onClick={handleSubmit}>Save</button> : <></>}
        <button type="button" className='button button-red' onClick={() => {props.onClose()}}>Close</button>
      </form>
    </>
  )
}

export default FormTemplate
