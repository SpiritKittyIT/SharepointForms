import { FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { SPHttpClient } from '@microsoft/sp-http'
import * as React from 'react';

interface IDropDownCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string}>
    pageContext?: FormCustomizerContext
}

const DropDownCard: React.FC<IDropDownCard> = ({id, colProps, displayMode, itemHandle, pageContext}) => {
  const [filter, setFilter] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)
  const [choices, setChoices] = React.useState<{id: string, text: string}[]>([])
  const [chosen, setChosen] = React.useState<{id: string, text: string}>({id: '', text: ''})

  const getPropId: () => string = () => {
    return colProps?.TypeAsString === "User" ? `${id}Id` : id
  }

  React.useEffect(() => {
    if (colProps?.TypeAsString === "Choice" || colProps?.TypeAsString === "OutcomeChoice"){
      setChoices(colProps.Choices.map((choice) => {
        if (choice === itemHandle.value[getPropId()]) {setChosen({id: choice, text: choice})}
        return {id: choice, text: choice}
      }))
    }
    if (colProps?.TypeAsString === "User"){
      pageContext.spHttpClient
      .get(`${pageContext.pageContext.web.absoluteUrl}/_api/web/siteusers`, SPHttpClient.configurations.v1, {
        headers: {
          accept: 'application/json;odata.metadata=none'
        }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        else {
          return Promise.reject(res.statusText);
        }
      })
      .then(body => {
        setChoices(body.value.filter((user: User) => {
          switch (user.LoginName) {
            case "c:0(.s|true":
              return false
            case "i:0#.w|nt service\\spsearch":
              return false
            case "i:0i.t|00000003-0000-0ff1-ce00-000000000000|app@sharepoint":
              return false
            case "SHAREPOINT\\system":
              return false
            default:
              break;
          }
          if (colProps?.SelectionGroup === 0) {
            return true
          }
          if (colProps?.SelectionGroup > 0){
            return user.LoginName.startsWith("i:0#.f|membership|")
          }
          return false
        }).map((user: User) => {
          console.log(`${user.Id}, ${itemHandle.value[getPropId()]}`)
          if (`${user.Id}` === itemHandle.value[getPropId()]) {setChosen({id: `${user.Id}`, text: user.Title})}
          return {id: user.Id, text: user.Title}
        }))
        return Promise.resolve();
      })
      .catch(err => {
        console.log(true)
        console.error(err)
      })
    }  
  }, [colProps])

  const setSelected: (newVal: string, selectedText: string) => void  = (newVal, selectedText) => {
    setChosen({id: newVal, text: selectedText})
    itemHandle.setValue({
      ...itemHandle.value,
      [getPropId()]: newVal,
    })
  }
  
  return (
    <div className='card'>
      <button type="button" className='button button-blue' onClick={() => {
          console.log(choices)
          console.log(chosen)
        }}>Test Info</button>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <div id={id} className="card-select-menu">
        <div className={`card-dropdown-input ${itemHandle.value[getPropId()] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
          {itemHandle.value[getPropId()]
            ? <div className='card-selected'>
                <div className='card-selected-value'>{chosen.text}</div>
              </div>
            : "Select Item Type..."}
        </div>
        <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
          <div className={`card-filter-selected ${itemHandle.value[getPropId()] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            {itemHandle.value[getPropId()]
              ? <div className='card-selected'>
                  <div className='card-selected-value'>{chosen.text}</div>
                  <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); if(displayMode !== FormDisplayMode.Display) {setSelected('', '')}}}>X</div>
                </div>
              : "Select Item Type..."}
          </div>
          <div className="card-select-filter">
            <input type="text" className="card-select-input" placeholder="Start Typing..." value={filter} onChange={(event) => {setFilter(event.target.value)}}  disabled={displayMode === FormDisplayMode.Display}/>
          </div>
          <div className="card-select-options">
            {choices.filter((choice) => {return choice.text.indexOf(filter) >= 0}).map((choice) => {return(
              <div className="option" key={`${id}-${choice.id}`} onClick={(event) => {document.getElementById(`${id}-${choice.id}`)?.click()}}>
                <input type="radio" className="radio" id={`${id}-${choice.id}`} value={choice.id} name={id} checked={choice.id === itemHandle.value[getPropId()]} onChange={(event) => {setSelected(choice.id, choice.text)}} disabled={displayMode === FormDisplayMode.Display}/>
                <label className="option-label" htmlFor={`${id}-${choice.id}`}>{choice.text}</label>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
};

export default DropDownCard;
