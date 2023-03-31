import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface IToggleButtonCard {
  id: string
  colProps: IColProps
  displayMode: FormDisplayMode
  itemHandle: IHandle<{[key: string]:boolean}>
}

const ToggleButtonCard: React.FC<IToggleButtonCard> = ({id, colProps, displayMode, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue({
      ...itemHandle.value,
      [event.target.id]: event.target.checked,
    })
  }

  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <label className="card-toggle-cover">
        <input
          id={id}
          className='card-checkbox-input'
          type="checkbox"
          onChange={onChange}
          {...(itemHandle?.value[id]  ? { checked: true } : {})}
          {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
        />
        <div className="card-toggle-slider" />
      </label>
    </div>
  )
};

export default ToggleButtonCard;
