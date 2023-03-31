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
