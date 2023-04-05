import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface ICurrencyCard {
  id: string
  title: string
  currencySymbol: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<number>
  valueVerify?: (value: number) => string
  minValue?: number
  maxValue?: number
}

const CurrencyCard: React.FC<ICurrencyCard> = ({id, title, currencySymbol, displayMode, required, itemHandle, valueVerify = (value) => {return ''}, minValue, maxValue}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    setErrorMessage(valueVerify(+event.target.value))
    itemHandle.setValue(+event.target.value)
  }

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title ? `${title} ${currencySymbol}` : ` ${currencySymbol}`}
        </label>
        <div>{itemHandle.value} {currencySymbol}</div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title ? `${title} ${currencySymbol}` : ` ${currencySymbol}`}
        </label>
        <input
          className='card-input'
          id={id}
          type='number'
          value={itemHandle.value}
          onChange={onChange}
          step='any'
          {...(minValue ? { min: minValue } : {})}
          {...(maxValue ? { max: maxValue } : {})}
        />
        {errorMessage && errorMessage !== '' ? <div className='card-error'>{errorMessage}</div> : <></>}
      </div>
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>Sorry, something went wrong with this form card. This card can not be rendered properly.</div>
    )
  }
};

export default CurrencyCard;
