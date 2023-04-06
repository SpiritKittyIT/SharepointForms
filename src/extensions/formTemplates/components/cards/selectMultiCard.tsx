import { FormDisplayMode } from '@microsoft/sp-core-library'
import * as React from 'react'

interface IDropDownMultiCard {
  id: string
  title: string
  displayMode: FormDisplayMode
  required: boolean
  itemHandle: IHandle<string[]>
  choices: IChoice[]
  selected: IChoice[]
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

const DropDownMultiCard: React.FC<IDropDownMultiCard> = ({id, title, displayMode, required, itemHandle, choices, selected,
                                                          choiceFilter = (choice) => true, getDisplayText = (choice) => {return choice.Title}}) => {
  const wrapperRef = React.useRef(null)
  const [search, setSearch] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)
  const [chosen, setChosen] = React.useState<IChoice[]>([])

  useOutsideHider(wrapperRef, setActive)

  React.useEffect(() => {
    setChosen(selected)
  }, [selected])

  const isChosen: (id: string) => boolean = (id) => {
    for (const item of chosen){
      if (item.Id === id) { return true }
    }
    return false
  }

  const select: (choice: IChoice) => void  = (choice) => {
    if (isChosen(choice.id)) { return }
    const newChosen =  chosen.concat([choice])
    setChosen(newChosen)
    itemHandle.setValue(newChosen.map((item) => {return item.Id}))
  }

  const unSelect: (id: string) => void  = (id) => {
    const newChosen = chosen.filter((item) => {return id !== item.Id})
    setChosen(newChosen)
    itemHandle.setValue(newChosen.map((item) => {return item.Id}))
  }

  useOutsideHider(wrapperRef, setActive)
  
  try {
    return displayMode === FormDisplayMode.Display ? (
      <div className='card'>
        <label htmlFor={id} className={`card-label ${required ? 'card-required' : ''}`}>{title}</label>
        <div id={id} ref={wrapperRef} className="card-select-menu">
          <div className={`card-dropdown-input-d ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            { chosen.length > 0
              ? chosen.map((item) => {return (
                <div key={item.Id} className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(item)}</div>
                </div>
                )}) 
                : `Select ${title}...`}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected-d ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              { chosen.length > 0
                ? chosen.map((item) => {return (
                  <div key={item.Id} className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(item)}</div>
                  </div>
                  )})
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
          <div className={`card-dropdown-input ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            { chosen.length > 0
              ? chosen.map((item) => {return (
                <div key={item.Id} className='card-selected'>
                  <div className='card-selected-value'>{getDisplayText(item)}</div>
                </div>
                )}) 
                : `Select ${title}...`}
          </div>
          <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
            <div className={`card-filter-selected ${itemHandle.value ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
              { chosen.length > 0
                ? chosen.map((item) => {return (
                  <div key={item.Id} className='card-selected'>
                    <div className='card-selected-value'>{getDisplayText(item)}</div>
                    <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); unSelect(item.Id)}}>X</div>
                  </div>
                  )})
                : `Select ${title}...`}
            </div>
            <div className="card-select-filter">
              <input type="text" className="card-select-input" placeholder="Start Typing..." value={search} onChange={(event) => {setSearch(event.target.value)}} />
            </div>
            <div className="card-select-options">
              {choices.filter((choice) => {return getDisplayText(choice).toLowerCase().indexOf(search?.toLowerCase()) >= 0}).map((choice) => {return(
                <div className="option" key={`${id}-${choice.Id}`} onClick={(event) => {document.getElementById(`${id}-${choice.Id}`)?.click()}}>
                  <input type="checkbox" className="radio" id={`${id}-${choice.Id}`} value={choice.Id} name={id} checked={isChosen(choice.Id)} onChange={(event) => {select(choice)}} />
                  <label className="option-label" htmlFor={`${id}-${choice.Id}`}>{getDisplayText(choice)}</label>
                </div>
              )})}
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

export default DropDownMultiCard;
