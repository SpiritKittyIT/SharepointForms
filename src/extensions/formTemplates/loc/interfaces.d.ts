declare interface IColProps {
    Title: string,
    InternalName: string,
    TypeAsString: string,
    TypeDisplayName: string,
    Choices?: string[],
    LookupField?: string,
    LookupList?: string,
    LookupWebId?: string
}

declare interface IHandle<T> {
    value: T
    setValue: React.Dispatch<React.SetStateAction<T>>
}
