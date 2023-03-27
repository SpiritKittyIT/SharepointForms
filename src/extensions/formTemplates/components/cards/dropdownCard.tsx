import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IDropDownCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string}>
}

const DropDownCard: React.FC<IDropDownCard> = ({id, colProps, displayMode, itemHandle}) => {
  const [filter, setFilter] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)

  const setSelected: (newVal: string) => void  = (newVal) => {
    itemHandle.setValue({
      ...itemHandle.value,
      [id]: newVal,
    })
  }
  
  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <div id={id} className="card-select-menu">
        <div className={`card-dropdown-input ${itemHandle.value[id] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
          {itemHandle.value[id]
            ? <div className='card-selected'>
                <div className='card-selected-value'>{itemHandle.value[id]}</div>
              </div>
            : "Select Item Type..."}
        </div>
        <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
          <div className={`card-filter-selected ${itemHandle.value[id] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            {itemHandle.value[id]
              ? <div className='card-selected'>
                  <div className='card-selected-value'>{itemHandle.value[id]}</div>
                  <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); if(displayMode !== FormDisplayMode.Display) {setSelected('')}}}>X</div>
                </div>
              : "Select Item Type..."}
          </div>
          <div className="card-select-filter">
            <input type="text" className="card-select-input" placeholder="Start Typing..." value={filter} onChange={(event) => {setFilter(event.target.value)}}  disabled={displayMode === FormDisplayMode.Display}/>
          </div>
          <div className="card-select-options">
            {colProps?.Choices?.filter((val) => {return val.indexOf(filter) >= 0}).map((val) => {return(
              <div className="option" key={`${id}-${val}`} onClick={(event) => {document.getElementById(`${id}-${val}`)?.click()}}>
                <input type="radio" className="radio" id={`${id}-${val}`} value={val} name={id} checked={val === itemHandle.value[id]} onChange={(event) => {setSelected(event.target.value)}} disabled={displayMode === FormDisplayMode.Display}/>
                <label className="option-label" htmlFor={`${id}-${val}`}>{val}</label>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
};

export default DropDownCard;
