import { FormDisplayMode } from '@microsoft/sp-core-library';
import { toNumber } from 'lodash';
import * as React from 'react';
import { localeCurrencies } from '../../loc/dictionaries';

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
      [event.target.id]: colProps?.ShowAsPercentage ? (toNumber(event.target.value) / 100).toString() : event.target.value,
    })
  }

  const inputType = (colProps?.TypeAsString === "Number" || colProps?.TypeAsString === "Currency") ? "number" : "text"

  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>
        {colProps?.Title ? `${colProps.Title}${colProps.ShowAsPercentage ? " %" : ""}${colProps.CurrencyLocaleId ? ` (${localeCurrencies[colProps.CurrencyLocaleId].symbol})` : ""}` : ""}
      </label>
      <input
        className='card-input'
        id={id}
        type={inputType}
        value={colProps?.ShowAsPercentage ? toNumber(itemHandle.value[id]) * 100 : itemHandle.value[id]}
        onChange={onChange}
        {...(displayMode === FormDisplayMode.Display ? { disabled: true } : {})}
        {...(inputType === "number" ? { step: "any" } : {})}
        {...(colProps?.MaximumValue?.valueOf() < 1.7976931348623157e+308 ? { max: colProps.MaximumValue } : {})}
        {...(colProps?.MinimumValue?.valueOf() > -1.7976931348623157e+308 ? { min: colProps.MinimumValue } : {})}
      />
    </div>
  )
};

export default TextCard;
