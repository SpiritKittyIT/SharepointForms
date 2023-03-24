declare interface IColProps {
    Title: string
    InternalName: string
    TypeAsString: string
    TypeDisplayName: string
    Required: boolean
    Choices?: string[]
    LookupField?: string
    LookupList?: string
    LookupWebId?: string
}

declare interface IHandle<T> {
    value: T
    setValue: React.Dispatch<React.SetStateAction<T>>
}
