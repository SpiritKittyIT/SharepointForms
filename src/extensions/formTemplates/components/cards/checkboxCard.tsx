import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import { Checkbox, FormControlLabel } from '@mui/material'

interface ICheckboxCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  itemHandle: IHandle<boolean>
}

const CheckboxCard: React.FC<ICheckboxCard> = ({id, title, displayMode, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void  = (event, checked) => {
    itemHandle.setValue(checked)
  }

  try {
    return (
      <FormControlLabel
        label={title}
        control={
          <Checkbox
            id={id}
            disabled={displayMode === FormDisplayMode.Display}
            checked={itemHandle.value === undefined ? null : itemHandle.value}
            onChange={onChange}
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

export default CheckboxCard;
