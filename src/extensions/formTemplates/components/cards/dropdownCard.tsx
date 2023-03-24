import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IDropDownCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string}>
}

const DropDownCard: React.FC<IDropDownCard> = ({id, colProps, displayMode, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void  = (event) => {
    console.log(event)
    itemHandle.setValue({
      ...itemHandle.value,
      [event.target.id]: event.target.value,
    })
  }
  
  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <select id={id} onChange={onChange} disabled={displayMode === FormDisplayMode.Display}>
        { itemHandle.value[id] === "" ? <option value="" selected /> : <option value="" /> }
        { colProps?.Choices?.map((choice) => choice === itemHandle.value[id] ? <option value={choice} selected>{choice}</option> : <option value={choice}>{choice}</option>) }
      </select>
    </div>
  )
};

export default DropDownCard;
