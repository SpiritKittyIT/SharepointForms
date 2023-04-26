import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IImgCard {
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

const ImgCard: React.FC<IImgCard> = ({id, title, displayMode, required, itemHandle, valueVerify = (value) => {return ''}}) => {
  const wrapperRef = React.useRef(null)
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)

  useOutsideHider(wrapperRef, setActive)

  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    const newVal = event.target.id.indexOf("URL") === 0
                    ? {Description: itemHandle.value.Description, Url: event.target.value}
                    : {Description: event.target.value, Url: itemHandle.value.Url}
    itemHandle.setValue(newVal)
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
        <div id={id} className='card-input-d card-tall-display'>
          <img className='card-tall-img' src={itemHandle?.value?.Url} alt={itemHandle?.value?.Description} />
        </div>
      </div>
    )
    : (
      <div className='card-tall'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>
          {title}
        </label>
        <div id={id} ref={wrapperRef} className="card-select-menu">
          <div className='card-input card-tall-display' onClick={(event) => {setActive(!active)}}>
            <img className='card-tall-img' src={itemHandle?.value?.Url} alt={itemHandle?.value?.Description} />
          </div>
          {errorMessage && errorMessage !== '' ? <div className='card-error'>{errorMessage}</div> : <></>}
          <div className={`card-tall-dropdown ${active ? 'active' : ''}`}>
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

export default ImgCard;
