import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IUrlCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<{Description: string, Url: string}>
  valueVerify?: (value: {Description: string, Url: string}) => string
}

const UrlCard: React.FC<IUrlCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    const newVal = event.target.id.indexOf("URL") === 0
                    ? {Description: itemHandle.value.Description, Url: event.target.value}
                    : {Description: event.target.value, Url: itemHandle.value.Url}
    setErrorMessage(valueVerify(newVal))
    itemHandle.setValue(newVal)
  }

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id}>
          <a href={itemHandle?.value?.Url}>{itemHandle?.value?.Description}</a>
        </div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id}>
          <a href={itemHandle?.value?.Url}>{itemHandle?.value?.Description}</a>
          {errorMessage && errorMessage !== '' ? <div className='card-error'>{errorMessage}</div> : <></>}
          <div>
            <label htmlFor={`Description-${id}`} className={`card-label ${required ? 'card-required' : ''}`}>
              Description
            </label>
            <input
              className='card-input'
              id={`Description-${id}`}
              type="text"
              value={itemHandle?.value?.Description}
              onChange={onChange}
            />
            <label htmlFor={`URL-${id}`} className={`card-label ${required ? 'card-required' : ''}`}>
              URL
            </label>
            <input
              className='card-input'
              id={`URL-${id}`}
              type="text"
              value={itemHandle?.value?.Url}
              onChange={onChange}
            />
          </div>
        </div>
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

export default UrlCard;
