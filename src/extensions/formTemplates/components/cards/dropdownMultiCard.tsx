import { FormDisplayMode } from '@microsoft/sp-core-library';
import { FormCustomizerContext } from '@microsoft/sp-listview-extensibility';
import { SPHttpClient } from '@microsoft/sp-http'
import * as React from 'react';

interface IDropDownMultiCard {
    id: string
    colProps: IColProps
    displayMode: FormDisplayMode
    itemHandle: IHandle<{[key: string]:string[]}>
    pageContext?: FormCustomizerContext
}

function useOutsideHider(ref: React.MutableRefObject<any>, setActive: (val: boolean) => void): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target)) {
        setActive(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const DropDownMultiCard: React.FC<IDropDownMultiCard> = ({id, colProps, displayMode, itemHandle, pageContext}) => {
  const wrapperRef = React.useRef(null)
  const [filter, setFilter] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)
  const [choices, setChoices] = React.useState<{id: string, text: string}[]>([])
  const [chosen, setChosen] = React.useState<{id: string, text: string}[]>([])
  const [users, setUsers] = React.useState<{id: string, text: string}[]>([])
  const [groups, setGroups] = React.useState<{id: string, text: string}[]>([])

  const getPropId: (v2?: boolean) => string = (v2) => {
    if (v2) {return colProps?.TypeAsString === "UserMulti" ? `${id}StringId` : id}
    return colProps?.TypeAsString === "UserMulti" ? `${id}Id` : id
  }

  const contains: (list: string[], id: string) => boolean = (list, id) => {
    for (const item of list){
      if (item.toString() === id.toString()) { return true }
    }
    return false
  }

  React.useEffect(() => {
    if (colProps?.TypeAsString === "ChoiceMulti" || colProps?.TypeAsString === "OutcomeChoiceMulti"){
      setChoices(colProps.Choices.map((choice) => {
        return {id: choice, text: choice}
      }))
    }
    if (colProps?.TypeAsString === "UserMulti"){
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
        setUsers(body.value.filter((user: User) => {
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
          return {id: user.Id, text: user.Title}
        }).concat(choices))
        return Promise.resolve();
      })
      .catch(err => {
        console.error(err)
      })
      if (colProps?.SelectionGroup === 0){
        pageContext.spHttpClient
      .get(`${pageContext.pageContext.web.absoluteUrl}/_api/web/sitegroups`, SPHttpClient.configurations.v1, {
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
        setGroups(body.value.filter((group: Group) => {
          return group.OwnerTitle !== "System Account"
        }).map((group: Group) => {
          return {id: group.Id, text: group.Title}
        }).concat(choices))
        return Promise.resolve();
      })
      .catch(err => {
        console.error(err)
      })
      }
    }  
  }, [colProps])

  React.useEffect(() => {setChoices(users.concat(groups))}, [users, groups])
  React.useEffect(() => {
    setChosen(choices.filter((choice) => {return contains(itemHandle?.value[getPropId()], choice.id)}))
  }, [choices])

  const select: (id: string, text: string) => void  = (id, text) => {
    if (contains(chosen.map((item) => {return item.id}), id)) { return }
    const newChosen =  chosen.concat([{id: id, text: text}]) 
    setChosen(newChosen)
    itemHandle.setValue({
      ...itemHandle.value,
      [getPropId()]: newChosen.map((item) => {return item.id}),
      ...(colProps?.TypeAsString === "UserMulti" ? {[getPropId(true)]: newChosen.map((item) => {return item.id.toString()})} : {}),
    })
  }

  const unSelect: (id: string) => void  = (id) => {
    const newChosen = chosen.filter((item) => {return id !== item.id})
    setChosen(newChosen)
    itemHandle.setValue({
      ...itemHandle.value,
      [getPropId()]: newChosen.map((item) => {return item.id}),
      ...(colProps?.TypeAsString === "UserMulti" ? {[getPropId(true)]: newChosen.map((item) => {return item.id.toString()})} : {}),
    })
  }

  useOutsideHider(wrapperRef, setActive)
  
  return (
    <div className='card'>
      <label htmlFor={id} className={`card-label ${colProps?.Required ? 'card-required' : ''}`}>{colProps?.Title ? colProps.Title : ""}</label>
      <div id={id} ref={wrapperRef} className="card-select-menu">
        <div className={`card-dropdown-input ${itemHandle.value[getPropId()] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
          { chosen.length > 0
            ? chosen.map((item) => {return (
              <div key={item.id} className='card-selected'>
                <div className='card-selected-value'>{item.text}</div>
              </div>
              )}) 
              : `Select ${colProps?.Title}...`}
        </div>
        <div className={`card-select-dropdown ${active ? 'active' : ''}`}>
          <div className={`card-filter-selected ${itemHandle.value[getPropId()] ? '' : 'placeholder'}`} onClick={(event) => {setActive(!active)}}>
            { chosen.length > 0
              ? chosen.map((item) => {return (
                <div key={item.id} className='card-selected'>
                  <div className='card-selected-value'>{item.text}</div>
                  <div  className='card-selected-unselect' onClick={(event) => {event.stopPropagation(); if(displayMode !== FormDisplayMode.Display) {unSelect(item.id)}}}>X</div>
                </div>
                )})
              : `Select ${colProps?.Title}...`}
          </div>
          <div className="card-select-filter">
            <input type="text" className="card-select-input" placeholder="Start Typing..." value={filter} onChange={(event) => {setFilter(event.target.value)}}  disabled={displayMode === FormDisplayMode.Display}/>
          </div>
          <div className="card-select-options">
            {choices.filter((choice) => {return choice.text.toLowerCase().indexOf(filter.toLowerCase()) >= 0}).map((choice) => {return(
              <div className="option" key={`${id}-${choice.id}`} onClick={(event) => {document.getElementById(`${id}-${choice.id}`)?.click()}}>
                <input type="checkbox" className="radio" id={`${id}-${choice.id}`} value={choice.id} name={id} checked={contains(itemHandle.value[getPropId()], choice.id)} onChange={(event) => {select(choice.id, choice.text)}} disabled={displayMode === FormDisplayMode.Display}/>
                <label className="option-label" htmlFor={`${id}-${choice.id}`}>{choice.text}</label>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  )
};

export default DropDownMultiCard;
