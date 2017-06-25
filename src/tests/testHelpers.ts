import * as UUID from "node-uuid";

export function tryGetKey(value: Object): string | null {
    if (value.hasOwnProperty("$$type") && value.hasOwnProperty("id")) {
        var anyValue = value as ConventionalObject;

        var keyPrefix = anyValue.$$type.toString();
        var keyId = anyValue.id.toString();

        return `${keyPrefix} = ${keyId}`;
    }

    return null;
}

export function addRandomTypeToObject<T extends Object>(value: T): T {
    return addTypeToObject(value, UUID.v4());
}

export function addTypeToObject<T>(value: T, type: string): T {
    var valueAsAny = value as any;

    valueAsAny.$$type = type;

    return value;
}

interface ConventionalObject {
    $$type: string;
    id: string | number;
}