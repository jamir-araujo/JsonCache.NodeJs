export function notNull<T>(value: T, parameterName: string): void {
    if (value === null) {
        throw `parameter ${parameterName} can not be null`;
    }
}

export function greaterThanZero(value: number, parameterName: string): void {
    if (value < 0) {
        throw `parameter ${parameterName} should be greater than zero`;
    }
}

export function notEmpty(array: any[], parameterName: string) {
    if (array.length < 1) {
        throw `parameter ${parameterName} must be an array with at lest one item`;
    }
}