import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface IDateCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    dateonly: boolean
    valueVerify?: (value: string) => string
}

const DateCard: React.FC<IDateCard> = ({id, title, displayMode, required, itemHandle, dateonly, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue(event.target.value ? (dateonly ? `${event.target.value}T00:00:00Z` : `${event.target.value}:00Z`) : null)
  }

  React.useEffect(() => {
    if (required && !itemHandle.value) {
      setErrorMessage(`${title ? title : 'This field'} can not be left empty`)
      return
    }
    setErrorMessage(valueVerify(itemHandle.value))
  }, [itemHandle.value, required])

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} className='card-input-d'>{itemHandle?.value?.replace(new RegExp("([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})Z"), "$3.$2.$1 $4:$5")}</div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <input
          className='card-input'
          id={id}
          type={dateonly ? "date" : "datetime-local"}
          value={dateonly ? itemHandle?.value?.split('T')[0] : itemHandle?.value?.split('Z')[0]}
          onChange={onChange}
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

export default DateCard;
