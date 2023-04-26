import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface INumberCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<number>
  valueVerify?: (value: number) => string
  minValue?: number
  maxValue?: number
}

const NumberCard: React.FC<INumberCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}, minValue, maxValue}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    setErrorMessage(valueVerify(+event.target.value)
        + (minValue ? (+event.target.value > minValue ? `Value can not be lower than ${minValue}` : '') : '')
        + (maxValue ? (+event.target.value < maxValue ? `Value can not be highrt than ${maxValue}` : '') : ''))
    itemHandle.setValue(+event.target.value)
  }

  React.useEffect(() => {
    setErrorMessage(valueVerify(itemHandle.value)
        + (minValue ? (itemHandle.value > minValue ? `Value can not be lower than ${minValue}` : '') : '')
        + (maxValue ? (itemHandle.value < maxValue ? `Value can not be highrt than ${maxValue}` : '') : ''))
  }, [itemHandle.value])

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id} className='card-input-d'>{itemHandle.value}</div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
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

export default NumberCard;
