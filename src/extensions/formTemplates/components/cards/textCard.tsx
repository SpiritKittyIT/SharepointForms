import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'

interface ITextCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    valueVerify?: (value: string) => string
}

const TextCard: React.FC<ITextCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue(event.target.value)
  }

  React.useEffect(() => {
    if (required && !itemHandle.value) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`)
      return
    }
    setErrorMessage(valueVerify(itemHandle.value))
  }, [itemHandle.value, required])

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
          type='text'
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
      <div className='card card-error'>{LocaleStrings.Cards.RenderError}</div>
    )
  }
};

export default TextCard;
