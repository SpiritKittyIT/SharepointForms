export function StringValSet(value: string, valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [valueName]: value,
  })
}

export function NumValSet(value: number, valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [valueName]: value,
  })
}

export function LookupValSet(value: string, valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [`${valueName}Id`]: value ? +value : null,
  })
}

export function LookupMultiValSet(value: string[], valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [`${valueName}Id`]: value ? value.map((v) => {return +v}) : null,
  })
}

export function PersonValSet(value: string, valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [`${valueName}Id`]: value ? +value : null,
    [`${valueName}StringId`]: value ? value : '',
  })
}

export function PersonMultiValSet(value: string[], valueName: string, itemHandle: IHandle<Record<string, any>>): void {
  itemHandle.setValue({
    ...itemHandle.value,
    [`${valueName}Id`]: value ? value.map((v) => {return +v}) : null,
    [`${valueName}StringId`]: value ? value : '',
  })
}