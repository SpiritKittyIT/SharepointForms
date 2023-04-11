declare interface IColProps {
  Title: string
  InternalName: string
  TypeAsString: string
  TypeDisplayName: string
  Required: boolean
  ReadOnlyField: boolean
  Choices?: string[]
  LookupField?: string
  LookupList?: string
  LookupWebId?: string
  MaximumValue?: number
  MinimumValue?: number
  ShowAsPercentage?: boolean
  CurrencyLocaleId?: number
  DisplayFormat?: number
  SelectionGroup?: number
  NumberOfLines?: number
}

declare interface IHandle<T> {
  value: T
  setValue: React.Dispatch<React.SetStateAction<T>>
}

declare interface User {
  Id: number
  IsHiddenInUI: boolean
  LoginName: string
  Title: string
  PrincipalType: number
  Email: string
  Expiration: string
  IsEmailAuthenticationGuestUser: boolean
  IsShareByEmailGuestUser: boolean
  IsSiteAdmin: boolean
  UserId: {
      NameId: string
      NameIdIssuer: string
  },
  UserPrincipalName: string
}

declare interface Group {
  AllowMembersEditMembership: boolean
  AllowRequestToJoinLeave: boolean
  AutoAcceptRequestToJoinLeave: boolean
  Description: string
  Id: number
  IsHiddenInUI: boolean
  LoginName: string
  OnlyAllowMembersViewMembership: boolean
  OwnerTitle: string
  PrincipalType: number
  RequestToJoinLeaveEmailSetting: string
  Title: string
}

interface IChoice {
  Id: string,
  Title: string,
  [Key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}
