import * as React from 'react';

interface IDropDownCard {
    id: string
    colProps: IColProps
    itemHandle: IHandle<{[key: string]:string}>
}

const DropDownCard: React.FC<IDropDownCard> = ({id, colProps, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void  = (event) => {
    console.log(event)
    itemHandle.setValue({
      ...itemHandle.value,
      [event.target.id]: event.target.value,
    })
  }
  
  return (
    <div className='card'>
      <label htmlFor={id} className='card-label'>Title</label>
      <select id={id} onChange={onChange}>
        { itemHandle.value[id] === "" ? <option value="" selected /> : <option value="" /> }
        { colProps?.Choices?.map((choice) => choice === itemHandle.value[id] ? <option value={choice} selected>{choice}</option> : <option value={choice}>{choice}</option>) }
      </select>
    </div>
  )
};

export default DropDownCard;
