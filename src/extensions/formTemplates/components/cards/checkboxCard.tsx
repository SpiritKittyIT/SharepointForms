import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface ICheckboxCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<boolean>
  valueVerify?: (value: boolean) => string
}

const CheckboxCard: React.FC<ICheckboxCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue(event.target.checked)
  }

  React.useEffect(() => {
    setErrorMessage(valueVerify(itemHandle.value))
  }, [itemHandle.value])

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <label className='card-checkbox-cover'>
          <input
            id={id}
            className='card-checkbox-input'
            type="checkbox"
            onChange={onChange}
            disabled={true}
            {...(itemHandle?.value  ? { checked: true } : {})}
          />
          <div className="card-checkbox-checkmark-d" />
        </label>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <label className='card-checkbox-cover'>
          <input
            id={id}
            className='card-checkbox-input'
            type="checkbox"
            onChange={onChange}
            {...(itemHandle?.value  ? { checked: true } : {})}
          />
          <div className="card-checkbox-checkmark" />
        </label>
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

export default CheckboxCard;
