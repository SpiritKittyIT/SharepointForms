import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface ITextCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    valueVerify?: (value: string) => string
}

const TextCard: React.FC<ITextCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    const verificationResult = valueVerify(event.target.value)
    if (verificationResult === ''){
      itemHandle.setValue(event.target.value)
      return
    }
    setErrorMessage(verificationResult)
  }

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title ? title : ''}
        </label>
        <div>{itemHandle.value}</div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title ? title : ''}
        </label>
        <input
          className='card-input'
          id={id}
          type='text'
          value={itemHandle.value}
          onChange={onChange}
        />
        <div>{errorMessage}</div>
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

export default TextCard;
