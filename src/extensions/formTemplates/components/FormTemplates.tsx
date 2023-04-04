import * as React from 'react';
import { FormDisplayMode } from '@microsoft/sp-core-library';
import { SPHttpClient } from '@microsoft/sp-http'
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';

import { FC } from 'react';
import Error from './error';
import './formTemplates.module.css'
import './cards/cardStyles.css'
import DropDownCard from './cards/dropdownCard';
import { isNull } from 'lodash';
import DateCard from './cards/dateCard';
import CheckboxCard from './cards/checkboxCard';
import ToggleButtonCard from './cards/toggleButtonCard';
import DropDownMultiCard from './cards/dropdownMultiCard';
import CurrencyCard from './cardsGeneric/currencyCard';
import { localeCurrencies } from '../loc/dictionaries';
import NumberCard from './cardsGeneric/numberCard';
import PercentCard from './cardsGeneric/percentCard';
import TextCard from './cardsGeneric/textCard';

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

  //#region ON_LOAD
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
          setKeys(Object.keys(body))
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
        return Promise.resolve();
      })
      .catch(err => {
        setShow(true)
        console.error(err)
      })
    }, [props])
  //#endregion

  //#region TEMPLATE_FUNCTIONS
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
      Object.keys(item).forEach(colName => {
        let isValidCol = false;
        for (const key of keys) {
          if (colName === key) {
            isValidCol = true;
            break
          }
        }
        if (!isValidCol) {
          valid = false
          setErrorMessage(`${errorMessage}\nAn extra key present in submitted item: ${colName}`)
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
    const TitleHandle = {value: item["Title"], setValue: TitleSet}
    /* eslint-enable */
  //#endregion

  return (
    <>
      <Error showHandle={{value: show, setValue: setShow}} message={errorMessage} />
      <form>
        <div className='cards'>
          <TextCard id="Title" title={TitleProps() ? TitleProps().Title : ''} displayMode={props.displayMode}
                        required={TitleProps() ? TitleProps().Required : false} itemHandle={TitleHandle}/>
          <DropDownCard id="acColChoice" colProps={getColProps("acColChoice", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <NumberCard id="acColNumber" title={acColNumberProps() ? acColNumberProps().Title : ''} displayMode={props.displayMode}
                        required={acColNumberProps() ? acColNumberProps().Required : false} itemHandle={acColNumberHandle}/>
          <NumberCard id="acColNumRange" title={acColNumRangeProps() ? acColNumRangeProps().Title : ''} displayMode={props.displayMode}
                        required={acColNumRangeProps() ? acColNumRangeProps().Required : false} itemHandle={acColNumRangeHandle}
                        minValue={acColNumRangeProps() ? acColNumRangeProps().MinimumValue : null} maxValue={acColNumRangeProps() ? acColNumRangeProps().MaximumValue : null}/>
          <PercentCard id="acColNumPercent" title={acColNumPercentProps() ? acColNumPercentProps().Title : ''} displayMode={props.displayMode}
                        required={acColNumPercentProps() ? acColNumPercentProps().Required : false} itemHandle={acColNumPercentHandle}/>
          <NumberCard id="acColNumDecimal" title={acColNumDecimalProps() ? acColNumDecimalProps().Title : ''} displayMode={props.displayMode}
                        required={acColNumDecimalProps() ? acColNumDecimalProps().Required : false} itemHandle={acColNumDecimalHandle}/>
          <CurrencyCard id="acColCurrency" title={acColCurrencyProps() ? acColCurrencyProps().Title : ''} currencySymbol={acColCurrencySymbol()} displayMode={props.displayMode}
                        required={acColCurrencyProps() ? acColCurrencyProps().Required : false} itemHandle={acColCurrencyHandle}/>
          <DateCard id="acColDate" colProps={getColProps("acColDate", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <DateCard id="acColDateTime" colProps={getColProps("acColDateTime", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <CheckboxCard id="acColCheck" colProps={getColProps("acColCheck", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <ToggleButtonCard id="acColToggle" colProps={getColProps("acColToggle", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <DropDownCard id="acColOutcome" colProps={getColProps("acColOutcome", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} />
          <DropDownMultiCard id="acColPerson" colProps={getColProps("acColPerson", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} pageContext={props.context} />
          <DropDownCard id="acColGroup" colProps={getColProps("acColGroup", cols)} displayMode={props.displayMode} itemHandle={{value: item, setValue: setItem}} pageContext={props.context} />
        </div>
        {props.displayMode !== FormDisplayMode.Display ? <button type="button" className='button button-green' onClick={handleSubmit}>Save</button> : <></>}
        <button type="button" className='button button-red' onClick={() => {props.onClose()}}>Close</button>
        <button type="button" className='button button-blue' onClick={() => {
          console.log(cols)
          console.log(item)
          console.log(keys)
        }}>Test Info</button>
      </form>
    </>
  )
}

export default FormTemplate
