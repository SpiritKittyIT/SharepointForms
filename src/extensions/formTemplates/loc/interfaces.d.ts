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
}

declare interface IHandle<T> {
    value: T
    setValue: React.Dispatch<React.SetStateAction<T>>
}
