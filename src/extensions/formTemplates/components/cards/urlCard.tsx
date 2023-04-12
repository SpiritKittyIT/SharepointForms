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

function useOutsideHider(ref: React.MutableRefObject<any>, setActive: (val: boolean) => void): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const UrlCard: React.FC<IUrlCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const wrapperRef = React.useRef(null)
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)

  useOutsideHider(wrapperRef, setActive)

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
        <div id={id} className='card-input-d'>
          <a href={itemHandle?.value?.Url}>{itemHandle?.value?.Description}</a>
        </div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id} ref={wrapperRef} className="card-select-menu">
          <div className='card-input' onClick={(event) => {setActive(!active)}}>
            <a href={itemHandle?.value?.Url} onClick={(event) => {event.stopPropagation()}} >{itemHandle?.value?.Description}</a>
          </div>
          {errorMessage && errorMessage !== '' ? <div className='card-error'>{errorMessage}</div> : <></>}
          <div className={`card-select-dropdown ${active ? 'active' : ''}`} onClick={(event) => {setActive(!active)}}>
            <div className={`card-url-input-wrapper`} >
              <label htmlFor={`Description-${id}`} className={`card-label ${required ? 'card-required' : ''}`}>
                Description:
              </label>
              <input
                className='card-url-input'
                id={`Description-${id}`}
                type="text"
                value={itemHandle?.value?.Description}
                onChange={onChange}
                onClick={(event) => {event.stopPropagation()}}
              />
            </div>
            <div className={`card-url-input-wrapper`} >
              <label htmlFor={`URL-${id}`} className={`card-label ${required ? 'card-required' : ''}`}>
                URL:
              </label>
              <input
                className='card-url-input'
                id={`URL-${id}`}
                type="text"
                value={itemHandle?.value?.Url}
                onChange={onChange}
                onClick={(event) => {event.stopPropagation()}}
              />
            </div>
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