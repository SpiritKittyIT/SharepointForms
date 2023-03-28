import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IDateCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string}>
}

const DateCard: React.FC<IDateCard> = ({id, colProps, displayMode, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue({
      ...itemHandle.value,
      [event.target.id]: event.target.value,
    })
  }

  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <input
        className='card-input'
        id={id}
        type={colProps?.DisplayFormat ? "datetime-local" : "date"}
        value={itemHandle.value[id]}
        onChange={onChange}
        {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
      />
    </div>
  )
};

export default DateCard;
