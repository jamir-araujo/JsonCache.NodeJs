type nullable<T> = T | null

interface Action<T> {
    (value: T): void
}

interface Object {
    [propertyName: string]: any;
}
