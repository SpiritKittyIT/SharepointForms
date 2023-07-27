import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import { Autocomplete, TextField } from '@mui/material'

interface ISelectCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<string>
  choices: IChoice[]
  selected: IChoice
}

const SelectCard: React.FC<ISelectCard> = ({id, title, displayMode, required, itemHandle, choices, selected}) => {
  const [value, setValue] = React.useState<IChoice>(null)
  const [error, setError] = React.useState<boolean>(selected ? false : required)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const onChange = (event: React.SyntheticEvent<Element, Event>, newValue: IChoice): void => {
    if (!event && !newValue) {return}
    setValue(newValue)
    itemHandle.setValue(newValue ? newValue.value : null)
  }

  React.useEffect(() => {
    const isErrorVal = itemHandle.value ? false : required
    setError(isErrorVal)
    setErrorMessage(isErrorVal ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}` : null)
  }, [itemHandle.value, required])

  React.useEffect(() => {
    onChange(null, selected)
  }, [selected])

  try {
    return (
      <Autocomplete
          disablePortal
          id={id}
          disabled={displayMode === FormDisplayMode.Display}
          options={choices}
          fullWidth
          value={value}
          onChange={onChange}
          isOptionEqualToValue={(option, value) => {
            return option?.value === value?.value
          }}
          renderInput={(params) => 
            <TextField
              {...params}
              label={title}
              variant='standard'
              required={required}
              error={error}
              helperText={errorMessage}
            />
          }
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

export default SelectCard;
