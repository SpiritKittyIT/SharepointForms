import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface ISelectCard {
    id: string
    title: string
    displayMode: FormDisplayMode
    required: boolean
    itemHandle: IHandle<string>
    choices: IChoice[]
    selected: IChoice
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const SelectCard: React.FC<ISelectCard> = ({id, title, displayMode, required, itemHandle, choices, selected,
                                            choiceFilter = (choice) => true, getDisplayText = (choice) => {return choice.Title}}) => {
  const wrapperRef = React.useRef(null)
  const [search, setSearch] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)
  const [chosen, setChosen] = React.useState<IChoice>()

  useOutsideHider(wrapperRef, setActive)
  
  const setSelected: (choice: IChoice) => void  = (choice) => {
    setChosen(choice)
    itemHandle.setValue(choice?.Id)
  }

  React.useEffect(() => {
    setChosen(selected)
  }, [selected])

  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} ref={wrapperRef} className="card-select-menu">
          <div className={`card-dropdown-input ${chosen ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            {chosen
              ? <div className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(chosen)}</div>
                </div>
                : `Select ${title}...`}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected ${chosen ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              {chosen
                ? <div className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(chosen)}</div>
                  </div>
                : `Select ${title}...`}
            </div>
          </div>
        </div>
      </div>
    )
    : (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} ref={wrapperRef} className="card-select-menu">
          <div className={`card-dropdown-input ${chosen ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            {chosen
              ? <div className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(chosen)}</div>
                </div>
                : `Select ${title}...`}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected ${chosen ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              {chosen
                ? <div className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(chosen)}</div>
                    <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); setSelected(null)}}>X</div>
                  </div>
                : `Select ${title}...`}
            </div>
            <div className="card-select-filter">
              <input type="text" className="card-select-input" placeholder="Start Typing..." value={search} onChange={(event) => {setSearch(event.target.value)}} />
            </div>
            <div className="card-select-options">
              { choices?.filter((choice) => {
                  return choiceFilter(choice) && getDisplayText(choice).toLowerCase().indexOf(search.toLowerCase()) >= 0
                })
                .map((choice: IChoice) => {return(
                  <div className="option" key={`${id}-${choice.Id}`} onClick={(event) => {document.getElementById(`${id}-${choice.Id}`)?.click()}}>
                    <input type="radio" className="radio" id={`${id}-${choice.Id}`} value={choice.Id} name={id} checked={choice.Id === chosen?.Id} onChange={(event) => {setSelected(choice)}} />
                    <label className="option-label" htmlFor={`${id}-${choice.Id}`}>{getDisplayText(choice)}</label>
                  </div>
                )})
              }
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

export default SelectCard;
