import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import dayjs, { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers'

interface IDateCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    dateonly: boolean
    valueVerify?: (value: string) => string
}

const DateCard: React.FC<IDateCard> = ({id, title, displayMode, required, itemHandle, dateonly, valueVerify = (value): string => {return null}}) => {
  const [value, setValue] = React.useState<Dayjs>(itemHandle.value ? dayjs(itemHandle.value.replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[0-9a-zA-Z:.-]*/, '$1')) : null)
  const [error, setError] = React.useState<boolean>(itemHandle.value ? false : required)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const onChange = (newValue: Dayjs): void => {
    itemHandle.setValue(newValue && newValue.isValid() ? newValue.toISOString() : null)
    setValue(newValue)
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
    return dateonly ? (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          disabled={displayMode === FormDisplayMode.Display}
          label={title}
          value={value}
          onChange={onChange}
          slotProps={{
            textField: {
              id: id,
              fullWidth: true,
              variant: 'standard',
              required: required,
              error: error,
              helperText: errorMessage,
            },
          }}
        />
      </LocalizationProvider>
    )
    : (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          disabled={displayMode === FormDisplayMode.Display}
          label={title}
          value={value}
          onChange={onChange}
          slotProps={{
            textField: {
              id: id,
              fullWidth: true,
              variant: 'standard',
              required: required,
              error: error,
              helperText: errorMessage,
            },
          }}
        />
      </LocalizationProvider>
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>{LocaleStrings.Cards.RenderError}</div>
    )
  }
};

export default DateCard;
