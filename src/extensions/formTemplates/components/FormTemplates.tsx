import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import { FC } from 'react';
import Error from './error';
import './formTemplates.module.css'
import './cards/cardStyles.css'
import './dataDisplays/dataDisplayStyles.css'
import './customFormStyles.css'
import { isNull } from 'lodash';
import CurrencyCard from './cards/currencyCard';
import { localeCurrencies } from '../loc/dictionaries';
import NumberCard from './cards/numberCard';
import PercentCard from './cards/percentCard';
import TextCard from './cards/textCard';
import SelectCard from './cards/selectCard';
import DateCard from './cards/dateCard';
import SelectMultiCard from './cards/selectMultiCard';
import CheckboxCard from './cards/checkboxCard';
import ToggleButtonCard from './cards/toggleButtonCard';
import UrlCard from './cards/urlCard';
import ImgCard from './cards/imgCard';
import TextMultiLineCard from './cards/textMultiLineCard';
import TextRichCard from './cards/textRichCard';
import ListDisplay from './dataDisplays/listDisplay';

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
      setErrorMessage(``)
      const itemKeys = Object.keys(item)
      itemKeys.forEach((colName) => {
        if (!contains(keys, colName)) {
          delete item[colName]
          return
        }
        const colProps = getColProps(colName, cols)
        if (!colProps){
          return
        }
        if (colProps.Required && (item[colName] === "" || isNull(item[colName]))){
          valid = false
          setErrorMessage(`${errorMessage}\n${colProps.Title} cannot be left empty`)
        }
      })
      const cardErrors = document.getElementsByClassName('card-error')
      if (cardErrors.length > 0) { valid = false }
      for (let i = 0; i < cardErrors.length; i++) {
        setErrorMessage(cardErrors[i].textContent)
      }
      if (!valid){
        setShow(true)
        return
      }
      if (props.displayMode === FormDisplayMode.Display){
        setErrorMessage(`${errorMessage}\nYou can not submit form in Display mode`)
        setShow(true)
        return
      }
      await props.onSave(item, etag).catch((error: Error) => {
        console.error(error.message)
        if (error.message.indexOf("The request ETag value") !== -1){
          setErrorMessage(`${errorMessage}\nETag value mismatch during form submission. Prease reload the site and re-submit.`)
        }
        else {
          setErrorMessage(`${errorMessage}\nAn unspecified error occured during form submission. Prease leave the site and try again later.`)
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
    const [siteUsers, setSiteUsers] = React.useState<User[]>([])
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
    }, [siteUsers, siteGroups])
  //#endregion

  //#region PDF
    //just a prototype for generating a pdf file to download
    //uncomment if used
    const [fileUrl, fileUrlSet] = React.useState<string>("")
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
    }, [cols])
  //#endregion

  // Enter your code here

  //#region TEST_STUFF
    /* eslint-disable */
    const acColCurrencyProps = () => {return getColProps("acColCurrency", cols)}
    const acColCurrencySymbol = () => {return acColCurrencyProps()?.CurrencyLocaleId ? localeCurrencies[acColCurrencyProps()?.CurrencyLocaleId].symbol : ""}
    const acColCurrencySet = (value: number) => {
      setItem({
        ...item,
        ["acColCurrency"]: value,
      })
    }
    const acColCurrencyHandle = {value: item["acColCurrency"], setValue: acColCurrencySet}

    const acColNumDecimalProps = () => {return getColProps("acColNumDecimal", cols)}
    const acColNumDecimalSet = (value: number) => {
      setItem({
        ...item,
        ["acColNumDecimal"]: value,
      })
    }
    const acColNumDecimalHandle = {value: item["acColNumDecimal"], setValue: acColNumDecimalSet}

    const acColNumPercentProps = () => {return getColProps("acColNumPercent", cols)}
    const acColNumPercentSet = (value: number) => {
      setItem({
        ...item,
        ["acColNumPercent"]: value,
      })
    }
    const acColNumPercentHandle = {value: item["acColNumPercent"], setValue: acColNumPercentSet}

    const acColNumRangeProps = () => {return getColProps("acColNumRange", cols)}
    const acColNumRangeSet = (value: number) => {
      setItem({
        ...item,
        ["acColNumRange"]: value,
      })
    }
    const acColNumRangeHandle = {value: item["acColNumRange"], setValue: acColNumRangeSet}

    const acColNumberProps = () => {return getColProps("acColNumber", cols)}
    const acColNumberSet = (value: number) => {
      setItem({
        ...item,
        ["acColNumber"]: value,
      })
    }
    const acColNumberHandle = {value: item["acColNumber"], setValue: acColNumberSet}

    const TitleProps = () => {return getColProps("Title", cols)}
    const TitleSet = (value: string) => {
      setItem({
        ...item,
        ["Title"]: value,
      })
    }
    const TitleVerify = (value: string) => {return value.indexOf("Item") === 0 ? '' : 'Title needs to start with "Item"'}
    const TitleHandle = {value: item["Title"], setValue: TitleSet}

    const acColChoiceProps = () => {return getColProps("acColChoice", cols)}
    const acColChoiceSet = (value: string) => {
      setItem({
        ...item,
        ["acColChoice"]: value,
      })
    }
    const [acColChoiceChoices, acColChoiceChoicesSet] = React.useState<IChoice[]>([])
    const [acColChoiceSelected, acColChoiceSelectedSet] = React.useState<IChoice>()
    React.useEffect(() => {
      acColChoiceChoicesSet(acColChoiceProps()?.Choices.map((choice) => {return {Id: choice, Title: choice}}))
      acColChoiceSelectedSet({Id: item["acColChoice"], Title: item["acColChoice"]})
    }, [cols, keys])
    const acColChoiceHandle = {value: item["acColChoice"], setValue: acColChoiceSet}

    const acColOutcomeProps = () => {return getColProps("acColOutcome", cols)}
    const acColOutcomeSet = (value: string) => {
      setItem({
        ...item,
        ["acColOutcome"]: value,
      })
    }
    const [acColOutcomeChoices, acColOutcomeChoicesSet] = React.useState<IChoice[]>([])
    const [acColOutcomeSelected, acColOutcomeSelectedSet] = React.useState<IChoice>()
    React.useEffect(() => {
      acColOutcomeChoicesSet(acColOutcomeProps()?.Choices.map((choice) => {return {Id: choice, Title: choice}}))
      acColOutcomeSelectedSet({Id: item["acColOutcome"], Title: item["acColOutcome"]})
    }, [cols, keys])
    const acColOutcomeHandle = {value: item["acColOutcome"], setValue: acColOutcomeSet}

    const [acColGroupProps, acColGroupPropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      acColGroupPropsSet(getColProps("acColGroup", cols))
    }, [cols])
    const acColGroupSet = (value: string) => {
      setItem({
        ...item,
        ["acColGroupId"]: +value,
        ["acColGroupStringId"]: value,
      })
    }
    const [acColGroupChoices, acColGroupChoicesSet] = React.useState<IChoice[]>(choiceGroups)
    const [acColGroupSelected, acColGroupSelectedSet] = React.useState<IChoice>()
    React.useEffect(() => {
      const groupChoices = choiceGroups.concat(choiceUsers)
      acColGroupChoicesSet(groupChoices)
      acColGroupSelectedSet(() => {
        for (const choice of groupChoices) {
          if (choice.Id === item["acColGroupStringId"]) {
            return choice
          }
        }
      })
    }, [choiceUsers, choiceGroups, keys])
    const acColGroupHandle = {value: item["acColGroupId"], setValue: acColGroupSet}

    const [acColPersonProps, acColPersonPropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      acColPersonPropsSet(getColProps("acColPerson", cols))
    }, [cols])
    const acColPersonSet = (value: string[]) => {
      setItem({
        ...item,
        ["acColPersonId"]: value.map((val) => {return +val}),
        ["acColPersonStringId"]: value,
      })
    }
    const [acColPersonChoices, acColPersonChoicesSet] = React.useState<IChoice[]>(choiceGroups)
    const [acColPersonSelected, acColPersonSelectedSet] = React.useState<IChoice[]>([])
    React.useEffect(() => {
      const isChosen: (id: string) => boolean = (id) => {
        const items: string[] = item["acColPersonStringId"]
        if (items) {
          for (const item of items){
            if (item === id) { return true }
          }
        }
        return false
      }
      acColPersonChoicesSet(choiceUsers)
      acColPersonSelectedSet(choiceUsers.filter((choice) => {return isChosen(choice.Id)}))
    }, [choiceUsers, choiceGroups, keys])
    const acColPersonHandle = {value: item["acColPersonId"], setValue: acColPersonSet}

    const acColDateProps = () => {return getColProps("acColDate", cols)}
    const acColDateSet = (value: string) => {
      setItem({
        ...item,
        ["acColDate"]: value,
      })
    }
    const acColDateHandle = {value: item["acColDate"], setValue: acColDateSet}

    const acColDateTimeProps = () => {return getColProps("acColDateTime", cols)}
    const acColDateTimeSet = (value: string) => {
      setItem({
        ...item,
        ["acColDateTime"]: value,
      })
    }
    const acColDateTimeHandle = {value: item["acColDateTime"], setValue: acColDateTimeSet}

    const acColCheckProps = () => {return getColProps("acColCheck", cols)}
    const acColCheckSet = (value: boolean) => {
      setItem({
        ...item,
        ["acColCheck"]: value,
      })
    }
    const acColCheckHandle = {value: item["acColCheck"], setValue: acColCheckSet}

    const acColToggleProps = () => {return getColProps("acColToggle", cols)}
    const acColToggleSet = (value: boolean) => {
      setItem({
        ...item,
        ["acColToggle"]: value,
      })
    }
    const acColToggleHandle = {value: item["acColToggle"], setValue: acColToggleSet}

    const acColHyperlinkProps = () => {return getColProps("acColHyperlink", cols)}
    const acColHyperlinkSet = (value: {Description: string, Url: string}) => {
      setItem({
        ...item,
        ["acColHyperlink"]: value,
      })
    }
    const acColHyperlinkHandle = {value: item["acColHyperlink"], setValue: acColHyperlinkSet}

    const acColPictureProps = () => {return getColProps("acColPicture", cols)}
    const acColPictureSet = (value: {Description: string, Url: string}) => {
      setItem({
        ...item,
        ["acColPicture"]: value,
      })
    }
    const acColPictureHandle = {value: item["acColPicture"], setValue: acColPictureSet}

    const [acColMultiPlainProps, acColMultiPlainPropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      acColMultiPlainPropsSet(getColProps("acColMultiPlain", cols))
    }, [cols])
    const acColMultiPlainSet = (value: string) => {
      setItem({
        ...item,
        ["acColMultiPlain"]: value,
      })
    }
    const acColMultiPlainVerify = (value: string) => {
      const lines = value.split('\n')
      if (lines.length > acColMultiPlainProps.NumberOfLines){
        return `acColMultiPlain can only contain ${acColMultiPlainProps.NumberOfLines} lines of text`
      }
      for (let index = 0; index < lines.length; index++) {
        if(lines[index].length > 255){
          return `Line ${index + 1} is too long, can only contain 255 characters`
        }
      }
      return ''
    }
    const acColMultiPlainHandle = {value: item["acColMultiPlain"], setValue: acColMultiPlainSet}

    const [acColMultiRichProps, acColMultiRichPropsSet] = React.useState<IColProps>()
    React.useEffect(() => {
      acColMultiRichPropsSet(getColProps("acColMultiRich", cols))
    }, [cols])
    const acColMultiRichSet = (value: string) => {
      setItem({
        ...item,
        ["acColMultiRich"]: value,
      })
    }
    const acColMultiRichHandle = {value: item["acColMultiRich"], setValue: acColMultiRichSet}

    const style1: React.CSSProperties = {width: '1.2rem', display: 'grid', placeItems: 'center'}
    const style2: React.CSSProperties = {width: '3rem', display: 'grid', placeItems: 'center'}
    const style3: React.CSSProperties = {width: '2rem', display: 'grid', placeItems: 'center'}

    interface ITest {id: number; name: string; age: string}
    const testList: ITest[] = [{id: 0, name: 'aaa', age:'16'},{id: 1, name: 'bbb', age:'17'},{id: 2, name: 'ccc', age:'23'},
                      {id: 3, name: 'ddd', age:'10'},{id: 4, name: 'eee', age:'48'},{id: 5, name: 'fff', age:'31'}]
    const testFuncList = [(val: ITest) => {return (<div style={style1}>{val.id}</div>)},(val: ITest) => {return (<div style={style2}>{val.name}</div>)},(val: ITest) => {return (<div style={style3}>{val.age}</div>)}]
    const headerList = [<div style={style1}><b>Id</b></div>, <div style={style2}><b>Name</b></div>, <div style={style3}><b>Age</b></div>]

    const displayMode = props.displayMode

    /* eslint-enable */
  //#endregion

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form>
        <div className='cards'>
          <div className='area-a'>
            <div className='title'>
              <TextCard id="Title" title={TitleProps() ? TitleProps().Title : ''} displayMode={displayMode}
                  required={TitleProps() ? TitleProps().Required : false} itemHandle={TitleHandle} valueVerify={TitleVerify}/>
            </div>
            <div className='check'>
              <CheckboxCard id="acColCheck" title={acColCheckProps() ? acColCheckProps().Title : ''} displayMode={displayMode}
                  required={acColCheckProps() ? acColCheckProps().Required : false} itemHandle={acColCheckHandle}/>
            </div>
            <div className='toggle'>
              <ToggleButtonCard id="acColToggle" title={acColToggleProps() ? acColToggleProps().Title : ''} displayMode={displayMode}
                  required={acColToggleProps() ? acColToggleProps().Required : false} itemHandle={acColToggleHandle}/>
            </div>
          </div>
          <div className='area-b'>
            <div className='number'>
              <NumberCard id="acColNumber" title={acColNumberProps() ? acColNumberProps().Title : ''} displayMode={displayMode}
                  required={acColNumberProps() ? acColNumberProps().Required : false} itemHandle={acColNumberHandle}/>
            </div>
            <div className='range'>
              <NumberCard id="acColNumRange" title={acColNumRangeProps() ? acColNumRangeProps().Title : ''} displayMode={displayMode}
                  required={acColNumRangeProps() ? acColNumRangeProps().Required : false} itemHandle={acColNumRangeHandle}
                  minValue={acColNumRangeProps() ? acColNumRangeProps().MinimumValue : null} maxValue={acColNumRangeProps() ? acColNumRangeProps().MaximumValue : null}/>
            </div>
            <div className='deci'>
              <NumberCard id="acColNumDecimal" title={acColNumDecimalProps() ? acColNumDecimalProps().Title : ''} displayMode={displayMode}
                  required={acColNumDecimalProps() ? acColNumDecimalProps().Required : false} itemHandle={acColNumDecimalHandle}/>
            </div>
            <div className='photo'>
              <ImgCard id="acColPicture" title={acColPictureProps() ? acColPictureProps().Title : ''} displayMode={displayMode}
                  required={acColPictureProps() ? acColPictureProps().Required : false} itemHandle={acColPictureHandle}/>
            </div>
          </div>
          <div className='area-c'>
            <div className='plain'>
              <TextMultiLineCard id="acColMultiPlain" title={acColMultiPlainProps ? acColMultiPlainProps.Title : ''} displayMode={displayMode}
                  required={acColMultiPlainProps ? acColMultiPlainProps.Required : false} itemHandle={acColMultiPlainHandle} valueVerify={acColMultiPlainVerify}/>
            </div>
            <div className='percent'>
              <PercentCard id="acColNumPercent" title={acColNumPercentProps() ? acColNumPercentProps().Title : ''} displayMode={displayMode}
                  required={acColNumPercentProps() ? acColNumPercentProps().Required : false} itemHandle={acColNumPercentHandle}/>
            </div>
            <div className='currency'>
              <CurrencyCard id="acColCurrency" title={acColCurrencyProps() ? acColCurrencyProps().Title : ''} currencySymbol={acColCurrencySymbol()} displayMode={displayMode}
                  required={acColCurrencyProps() ? acColCurrencyProps().Required : false} itemHandle={acColCurrencyHandle}/>
            </div>
            <div className='hyperlink'>
              <UrlCard id="acColHyperlink" title={acColHyperlinkProps() ? acColHyperlinkProps().Title : ''} displayMode={displayMode}
                  required={acColHyperlinkProps() ? acColHyperlinkProps().Required : false} itemHandle={acColHyperlinkHandle}/>
            </div>
          </div>
          <div className='area-d'>
            <div className='rich'>
              <TextRichCard id="acColMultiRich" title={acColMultiRichProps ? acColMultiRichProps.Title : ''} displayMode={displayMode}
                  required={acColMultiRichProps ? acColMultiRichProps.Required : false} itemHandle={acColMultiRichHandle}/>
            </div>
            <div className='date'>
              <DateCard id="acColDate" title={acColDateProps() ? acColDateProps().Title : ''} displayMode={displayMode}
                  required={acColDateProps() ? acColDateProps().Required : false} itemHandle={acColDateHandle} dateonly={true}/>
            </div>
            <div className='datetime'>
              <DateCard id="acColDateTime" title={acColDateTimeProps() ? acColDateTimeProps().Title : ''} displayMode={displayMode}
                  required={acColDateTimeProps() ? acColDateTimeProps().Required : false} itemHandle={acColDateTimeHandle} dateonly={false}/>
            </div>
            <div className='outcome'>
              <SelectCard id="acColOutcome" title={acColOutcomeProps() ? acColOutcomeProps().Title : ''} displayMode={displayMode}
                  required={acColOutcomeProps() ? acColOutcomeProps().Required : false} itemHandle={acColOutcomeHandle}
                  choices={acColOutcomeChoices} selected={{value: acColOutcomeSelected, setValue: acColOutcomeSelectedSet}}/>
            </div>
          </div>
          <div className='area-e'>
            <div className='person'>
              <SelectMultiCard id="acColPerson" title={acColPersonProps ? acColPersonProps.Title : ''} displayMode={displayMode}
                  required={acColPersonProps ? acColPersonProps.Required : false} itemHandle={acColPersonHandle}
                  choices={acColPersonChoices} selected={{value: acColPersonSelected, setValue: acColPersonSelectedSet}}/>
            </div>
            <div className='group'>
              <SelectCard id="acColGroup" title={acColGroupProps ? acColGroupProps.Title : ''} displayMode={displayMode}
                  required={acColGroupProps ? acColGroupProps.Required : false} itemHandle={acColGroupHandle}
                  choices={acColGroupChoices} selected={{value: acColGroupSelected, setValue: acColGroupSelectedSet}}/>
            </div>
            <div className='type'>
              <SelectCard id="acColChoice" title={acColChoiceProps() ? acColChoiceProps().Title : ''} displayMode={displayMode}
                  required={acColChoiceProps() ? acColChoiceProps().Required : false} itemHandle={acColChoiceHandle}
                  choices={acColChoiceChoices} selected={{value: acColChoiceSelected, setValue: acColChoiceSelectedSet}}/>
            </div>
          </div>
        </div>
        {displayMode !== FormDisplayMode.Display ? <button type="button" className='button button-green' onClick={handleSubmit}>Save</button> : <></>}
        <button type="button" className='button button-red' onClick={() => {props.onClose()}}>Close</button>
        <button type="button" className='button button-blue' onClick={() => {
          console.log(cols)
          console.log(item)
          console.log(keys)
        }}>Test Info</button>
        <a href={fileUrl} className='button button-orange' style={{textDecoration: 'none'}} download='TestForm.pdf'>pdf</a>
      </form>
      <ListDisplay id='test' headerList={headerList} dataList={testList} dataToColList={testFuncList} />
    </>
  )
}

export default FormTemplate
