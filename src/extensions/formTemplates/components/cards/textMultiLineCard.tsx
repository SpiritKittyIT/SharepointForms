import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import { TextField } from '@mui/material'

interface ITextMultiLineCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<string>
  valueVerify?: (value: string) => string
}

const TextMultiLineCard: React.FC<ITextMultiLineCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value): string => null}) => {
  const [error, setError] = React.useState<boolean>(itemHandle.value ? false : required)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    itemHandle.setValue(event.target.value)
  }

  React.useEffect(() => {
    const verifyResult = valueVerify(itemHandle.value)
    const isErrorVal = itemHandle.value ? false : required || verifyResult ? true : false
    setError(isErrorVal)
    setErrorMessage(isErrorVal ? (
      !itemHandle.value && required
      ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`
      : verifyResult) : null)
  }, [itemHandle.value, required])

  try {
    return (
      <TextField
        id={id}
        disabled={displayMode === FormDisplayMode.Display}
        fullWidth
        multiline
        rows={4}
        label={title}
        variant='standard'
        required={required}
        value={itemHandle.value}
        onChange={onChange}
        error={error}
        helperText={errorMessage}
      />
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>{LocaleStrings.Cards.RenderError}</div>
    )
  }
};

export default TextMultiLineCard;
