import * as React from 'react';

interface ITextCard {
    id: string
    colProps: IColProps
    itemHandle: IHandle<{[key: string]:string}>
}

const TextCard: React.FC<ITextCard> = ({id, colProps, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue({
      ...itemHandle.value,
      [event.target.id]: event.target.value,
    })
  }

  return (
    <div className='card'>
      <label htmlFor={id} className='card-label'>Title</label>
          <input
            className='card-input'
            id={id}
            type="text"
            value={itemHandle.value[id]}
            onChange={onChange}
          />
    </div>
  )
};

export default TextCard;
