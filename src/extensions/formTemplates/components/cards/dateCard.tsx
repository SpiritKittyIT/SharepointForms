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
      [event.target.id]: colProps?.DisplayFormat ? `${event.target.value}Z` : `${event.target.value}T00:00:00Z`,
    })
  }

  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <input
        className='card-input'
        id={id}
        type={colProps?.DisplayFormat ? "datetime-local" : "date"}
        value={colProps?.DisplayFormat ? itemHandle?.value[id]?.split('Z')[0] : itemHandle?.value[id]?.split('T')[0]}
        onChange={onChange}
        {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
      />
    </div>
  )
};

export default DateCard;
