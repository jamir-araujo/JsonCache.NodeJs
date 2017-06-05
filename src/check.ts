export function notNull<T>(value: T, parameterName: string): void {
    if (value === null) {
        throw `parameter ${parameterName} can not be null`;
    }
}

export function greaterThanZero(value: number, parameterName: string): void {
    if (value < 0){
        throw `parameter ${parameterName} should be greater than zero`;
    }
}