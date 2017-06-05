type nullable<T> = T | null

interface Action<T> {
    (value: T): void
}

interface CacheItemFounded<T1, T2, TResult> {
    (param1: T1, param2: T2): TResult
}

interface Object {
    [propertyName: string]: any;
}