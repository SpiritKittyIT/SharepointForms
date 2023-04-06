import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IToggleButtonCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<boolean>
  valueVerify?: (value: boolean) => string
}

const ToggleButtonCard: React.FC<IToggleButtonCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    setErrorMessage(valueVerify(event.target.checked))
    itemHandle.setValue(event.target.checked)
  }

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <label className="card-toggle-cover">
          <input
            id={id}
            className='card-checkbox-input'
            type="checkbox"
            onChange={onChange}
            disabled={true}
            {...(itemHandle?.value  ? { checked: true } : {})}
          />
          <div className="card-toggle-slider-d" />
        </label>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <label className="card-toggle-cover">
          <input
            id={id}
            className='card-checkbox-input'
            type="checkbox"
            onChange={onChange}
            {...(itemHandle?.value  ? { checked: true } : {})}
          />
          <div className="card-toggle-slider" />
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

export default ToggleButtonCard;
