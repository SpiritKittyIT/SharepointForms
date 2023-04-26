import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface ITextMultiLineCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    valueVerify?: (value: string) => string
}

const TextMultiLineCard: React.FC<ITextMultiLineCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>("")

  const onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void  = (event) => {
    itemHandle.setValue(event.target.value)
  }

  React.useEffect(() => {
    setErrorMessage(valueVerify(itemHandle.value))
  }, [itemHandle.value])

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card-tall'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id} className='card-input-d card-tall-display'>{itemHandle.value}</div>
      </div>
    )
    : (
      <div className='card-tall'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <textarea
          className='card-input card-tall-display'
          id={id}
          value={itemHandle.value}
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

export default TextMultiLineCard;
