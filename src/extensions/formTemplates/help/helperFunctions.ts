import { GraphFI } from "@pnp/graph"
import { SPFI } from "@pnp/sp"
import { ISiteUserInfo, ISiteUserProps, IWebEnsureUserResult } from "@pnp/sp/site-users/types"
// import { ISiteGroupInfo } from '@pnp/sp/site-groups/types'
import { User/*, Group*/ } from '@microsoft/microsoft-graph-types'
import { LocaleStrings } from "../components/formTemplates"

import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups/web'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/fields'

export function Contains<A,V>(arr: A[], val: V, getVal: (x: A) => V = (x: A) => {return x as unknown as V}): boolean {
  for (const arrItem of arr){
    if (getVal(arrItem) === val) {return true}
  }
  return false
}

export function GetColProps(colName: string, cols: IColProps[]): IColProps {
  let result: IColProps = null
  cols.forEach(col => {
    if (col.InternalName === colName) {
      result = col
    }
  })
  return result
}

export async function GetGroupUsersGraph(spGroupId: number, sp: SPFI, graph: GraphFI): Promise<ISiteUserProps[]> {
  const spUsers: ISiteUserProps[] = []
  const userPrincipalNames: Set<string> = new Set()

  const spGroupMembers: ISiteUserInfo[] = await sp.web.siteGroups.getById(spGroupId).users()

  for (let index = 0; index < spGroupMembers.length; index++) {
    const loginName = spGroupMembers[index].LoginName.split('|')
    if (loginName.length !== 3) {continue}
    if (loginName[1] === 'membership') {
      userPrincipalNames.add(spGroupMembers[index].UserPrincipalName)
    }
    if (loginName[1] === 'tenant' || loginName[1] === 'federateddirectoryclaimprovider') {
      await graph.groups.getById(loginName[2]).members()
        .then((data) => {
          const users: User[] = data
          users.forEach((user) => {
            userPrincipalNames.add(user.userPrincipalName)
          })
        }).catch((err) => {
          console.error(err)
        })
    }
  }
  const names = Array.from(userPrincipalNames)
  
  for (let index = 0; index < names.length; index++) {
    await sp.web.ensureUser(names[index]).then((result: IWebEnsureUserResult) => {
      spUsers.push(result.data)
    }).catch((err) => {
      console.error(`${LocaleStrings.Helper.UserNotFound}: ${names[index]}`)
    })
  }

  return spUsers
}

export async function CheckGroupMembership(groupId: number, sp: SPFI): Promise<boolean> {
  let result = false
  await sp.web.currentUser.groups.getById(groupId)().then((found) => {
    result = true
  }).catch(() => {
    result = false
  })

  return result
}

export async function GetAllChoiceUsers(sp: SPFI): Promise<IChoice[]> {
  return sp.web.siteUsers.select('*')().then((users) => {
    return users.filter((user) => {
      const claim = user.LoginName.split('|')
      return claim.length > 2 && claim[1] === 'membership'
    }).map((member) => {
      return {value: `${member.Id}`, label: member.Title}
    })
  })
}

export async function GetGroupChoiceUsers(groupId: number, sp: SPFI): Promise<IChoice[]> {
  return sp.web.siteGroups.getById(groupId).users.select('*')().then((users) => {
    return users.filter((user) => {
      const claim = user.LoginName.split('|')
      return claim.length > 2 && claim[1] === 'membership'
    }).map((member) => {
      return {value: `${member.Id}`, label: member.Title}
    })
  })
}
