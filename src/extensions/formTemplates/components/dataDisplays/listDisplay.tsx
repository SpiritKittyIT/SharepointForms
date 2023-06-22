import * as React from 'react'
import { LocaleStrings } from '../formTemplates'

interface IListDisplay<T> {
  id: string
  headerList: React.ReactElement[]
  dataList: T[]
  dataToColList: ((data: T) => React.ReactElement)[]
  dataFilter?: (data: T) => boolean
}

const ListDisplay: React.FC<IListDisplay<object>> = ({id, headerList, dataList, dataToColList, dataFilter = (data) => {return true}}) => {
  try {
    return (
      <div className='data-list-wrapper'>
        <div className='data-list-row data-list-header'>
          {headerList.map((header, headI) => {
            return (
              <div key={`${id}-header-${headI}`} className='data-list-cell'>{header}</div>
            )
          })}
        </div>
        {dataList.map((data, dataI) => {
          return (
            <div key={`${id}-data-${dataI}`} className='data-list-row'>
              {dataToColList.filter(dataFilter).map((func, funcI) => {
                return (
                  <div key={`${id}-func-${funcI}`} className='data-list-cell'>{func(data)}</div>
                )
              })}
            </div>)
        })}
      </div>
    )
  }
  catch (error) {
    console.error(error)
    return (
      <div className='card card-error'>{LocaleStrings.Display.RenderError}</div>
    )
  }
};

export default ListDisplay;
