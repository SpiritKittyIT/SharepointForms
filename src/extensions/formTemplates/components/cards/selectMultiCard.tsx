import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'
import { LocaleStrings } from '../formTemplates'

interface ISelectMultiCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<string[]>
  choices: IChoice[]
  selected: IHandle<IChoice[]>
  choiceFilter?: (choice: IChoice) => boolean
  getDisplayText?:  (choice: IChoice) => string
}

function useOutsideHider(ref: React.MutableRefObject<any>, setActive: (val: boolean) => void): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}

const SelectMultiCard: React.FC<ISelectMultiCard> = ({id, title, displayMode, required, itemHandle, choices, selected,
                                                          choiceFilter = (choice) => true, getDisplayText = (choice) => {return choice.Title}}) => {
  const wrapperRef = React.useRef(null)
  const [search, setSearch] = React.useState<string>('')
  const [active, setActive] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  useOutsideHider(wrapperRef, setActive)

  const isSelected: (id: string) => boolean = (id) => {
    for (const item of selected.value){
      if (item.Id === id) { return true }
    }
    return false
  }

  const select: (choice: IChoice) => void  = (choice) => {
    if (isSelected(choice.Id)) { return }
    const newSelected =  selected.value.concat([choice])
    selected.setValue(newSelected)
    itemHandle.setValue(newSelected.map((item) => {return item.Id}))
  }

  const unSelect: (id: string) => void  = (id) => {
    const newSelected = selected.value.filter((item) => {return id !== item.Id})
    selected.setValue(newSelected)
    itemHandle.setValue(newSelected.map((item) => {return item.Id}))
  }

  React.useEffect(() => {
    if (required && !itemHandle.value) {
      setErrorMessage(`${LocaleStrings.Cards.PleaseFill} ${title ? title : LocaleStrings.Cards.ThisField}`)
      return
    }
    setErrorMessage(``)
  }, [itemHandle.value, required])
  
  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} ref={wrapperRef} className='card-select-menu'>
          <div className={`card-dropdown-input-d ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            { selected.value.length > 0
              ? selected.value.map((item) => {return (
                <div key={item.Id} className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(item)}</div>
                </div>
                )}) 
              : ``}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected-d ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              { selected.value.length > 0
                ? selected.value.map((item) => {return (
                  <div key={item.Id} className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(item)}</div>
                  </div>
                  )})
                : ``}
            </div>
          </div>
        </div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} ref={wrapperRef} className='card-select-menu'>
          <div className={`card-dropdown-input ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            { selected.value.length > 0
              ? selected.value.map((item) => {return (
                <div key={item.Id} className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(item)}</div>
                </div>
                )}) 
                : `${LocaleStrings.Cards.Select} ${title}...`}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              { selected.value.length > 0
                ? selected.value.map((item) => {return (
                  <div key={item.Id} className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(item)}</div>
                    <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); unSelect(item.Id)}}>X</div>
                  </div>
                  )})
                : `${LocaleStrings.Cards.Select} ${title}...`}
            </div>
            <div className='card-select-filter'>
              <input type='text' className='card-select-input' placeholder={LocaleStrings.Cards.Placeholder} value={search} onChange={(event) => {setSearch(event.target.value)}} />
            </div>
            <div className='card-select-options'>
              { choices?.filter((choice) => {
                  return choiceFilter(choice) && getDisplayText(choice).toLowerCase().indexOf(search.toLowerCase()) >= 0
                })
                .map((choice) => {return(
                  <div className='option' key={`${id}-${choice.Id}`} onClick={(event) => {document.getElementById(`${id}-${choice.Id}`)?.click()}}>
                    <input type='checkbox' className='radio' id={`${id}-${choice.Id}`} value={choice.Id} name={id} checked={isSelected(choice.Id)} onChange={(event) => {select(choice)}} />
                    <label className='option-label' htmlFor={`${id}-${choice.Id}`}>{getDisplayText(choice)}</label>
                  </div>
                )})
              }
            </div>
          </div>
        </div>
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

export default SelectMultiCard;
