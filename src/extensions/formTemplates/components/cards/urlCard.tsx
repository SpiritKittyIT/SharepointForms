import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'
import { TextField } from '@mui/material'

interface IUrlCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<{Description: string, Url: string}>
}

const UrlCard: React.FC<IUrlCard> = ({id, title, displayMode, required, itemHandle}) => {
  const [error, setError] = React.useState<boolean>(itemHandle.value ? false : required)
  const [errorMessage, setErrorMessage] = React.useState<string>()

  const [errorUrl, setErrorUrl] = React.useState<boolean>(itemHandle.value ? false : required)
  const [errorUrlMessage, setErrorUrlMessage] = React.useState<string>()
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    itemHandle.setValue({Description: event.target.value, Url: itemHandle.value.Url})
  }
  
  const onChangeUrl = (event: React.ChangeEvent<HTMLInputElement>): void => {
    itemHandle.setValue({Description: itemHandle.value.Description, Url: event.target.value})
  }

  React.useEffect(() => {
    const isErrorVal = itemHandle.value.Description ? false : required
    setError(isErrorVal)
    setErrorMessage(isErrorVal ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}` : null)

    const isUrlErrorVal = itemHandle.value.Url ? false : required
    setErrorUrl(isUrlErrorVal)
    setErrorUrlMessage(isUrlErrorVal ? `${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField} Url` : null)
  }, [itemHandle.value, required])

  try {
    return (
      <div>
        <TextField
          id={`${id}-describtion`}
          disabled={displayMode === FormDisplayMode.Display}
          sx={{ width: '49.5%' }}
          label={title}
          variant='standard'
          required={required}
          value={itemHandle.value.Description}
          onChange={onChange}
          error={error}
          helperText={errorMessage}
        />
        <TextField
          id={`${id}-url`}
          disabled={displayMode === FormDisplayMode.Display}
          sx={{ width: '49.5%', float: 'right' }}
          label={`${title} Url`}
          variant='standard'
          required={required}
          value={itemHandle.value.Url}
          onChange={onChangeUrl}
          error={errorUrl}
          helperText={errorUrlMessage}
        />
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

export default UrlCard;
