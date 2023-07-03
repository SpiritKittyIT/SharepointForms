import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import { InputAdornment, TextField } from '@mui/material'

interface IPercentCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<number>
  valueVerify?: (value: number) => string
  minValue?: number
  maxValue?: number
}

const PercentCard: React.FC<IPercentCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value): string => {return null}, minValue, maxValue}) => {
  const [error, setError] = React.useState<boolean>(itemHandle.value ? false : required)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue: number = event.target.value ? +event.target.value : null
    itemHandle.setValue(newValue / 100)
  }

  React.useEffect(() => {
    const verifyResult = valueVerify(itemHandle.value)
    if (required && !itemHandle.value) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`)
      setError(true)
      return
    }
    if ((minValue || minValue === 0) && itemHandle.value < minValue) {
      setErrorMessage(`${title ? title : LocaleStrings.Cards.ThisValue}  ${LocaleStrings.Cards.CanNotLower} ${minValue}`)
      setError(true)
      return
    }
    if ((maxValue || maxValue === 0) && itemHandle.value > maxValue) {
      setErrorMessage(`${title ? title : LocaleStrings.Cards.ThisValue} ${LocaleStrings.Cards.CanNotHigher} ${maxValue}`)
      setError(true)
      return
    }
    setErrorMessage(verifyResult)
    setError(verifyResult ? true : false)
  }, [itemHandle.value, required])

  try {
    return (
      <TextField
        id={id}
        disabled={displayMode === FormDisplayMode.Display}
        fullWidth
        InputProps={{
          endAdornment: <InputAdornment position='end'>%</InputAdornment>
        }}
        label={title}
        type='number'
        variant='standard'
        required={required}
        value={itemHandle.value || itemHandle.value === 0 ? itemHandle.value * 100 : null}
        onChange={onChange}
        error={error}
        helperText={errorMessage}
        InputLabelProps={{ shrink: itemHandle.value ? true : false }}
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

export default PercentCard;
