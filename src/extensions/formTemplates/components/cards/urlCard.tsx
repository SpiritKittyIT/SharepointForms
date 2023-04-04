import { FormDisplayMode } from '@microsoft/sp-core-library';
import * as React from 'react';
import { localeCurrencies } from '../../loc/dictionaries';

interface IUrlCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:{Description: string, Url: string}}>
}

const UrlCard: React.FC<IUrlCard> = ({id, colProps, displayMode, itemHandle}) => {
  const onChange: (event: React.ChangeEvent<HTMLInputElement>) => void  = (event) => {
    itemHandle.setValue({
      ...itemHandle.value,
      [id]: event.target.id.indexOf("URL") === 0 ? {Description: itemHandle.value[id].Description, Url: event.target.value} : {Description: event.target.value, Url: itemHandle.value[id].Url}
    })
  }

  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>
        {colProps?.Title ? `${colProps.Title}${colProps.ShowAsPercentage ? " %" : ""}${colProps.CurrencyLocaleId ? ` (${localeCurrencies[colProps.CurrencyLocaleId].symbol})` : ""}` : ""}
      </label>
      <div id={id}>
        { colProps?.DisplayFormat === 1
          ? <img src={itemHandle?.value[id]?.Url} alt={itemHandle?.value[id]?.Description} />
          : <a href={itemHandle?.value[id]?.Url}>{itemHandle?.value[id]?.Description}</a>}
        <div>
          <label htmlFor={`Description-${id}`} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>
            {colProps?.Title ? `${colProps.Title}${colProps.ShowAsPercentage ? " %" : ""}${colProps.CurrencyLocaleId ? ` (${localeCurrencies[colProps.CurrencyLocaleId].symbol})` : ""}` : ""}
          </label>
          <input
            className='card-input'
            id={`Description-${id}`}
            type="text"
            value={itemHandle?.value[id]?.Description}
            onChange={onChange}
            {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
          />
          <label htmlFor={`URL-${id}`} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>
            {colProps?.Title ? `${colProps.Title}${colProps.ShowAsPercentage ? " %" : ""}${colProps.CurrencyLocaleId ? ` (${localeCurrencies[colProps.CurrencyLocaleId].symbol})` : ""}` : ""}
          </label>
          <input
            className='card-input'
            id={`URL-${id}`}
            type="text"
            value={itemHandle?.value[id]?.Url}
            onChange={onChange}
            {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
          />
        </div>
      </div>
    </div>
  )
};

export default UrlCard;
