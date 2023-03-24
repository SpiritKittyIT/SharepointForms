import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';

interface ITextCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string}>
}

const TextCard: React.FC<ITextCard> = ({id, colProps, displayMode, itemHandle}) => {
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
            type="text"
            value={itemHandle.value[id]}
            onChange={onChange}
            disabled={displayMode === FormDisplayMode.Display}
          />
    </div>
  )
};

export default TextCard;
