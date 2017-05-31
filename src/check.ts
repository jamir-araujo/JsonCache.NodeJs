export function notNull<T>(value: T, parameterName: string): void {
    if (value === null) {
        throw `parameter ${parameterName} can not be null`;
    }
}