import * as UUID from "node-uuid";

export function tryGetKey(value: Object): string | null {
    if (value.hasOwnProperty("$$type")) {
        var anyValue = value as any;

        var keyPrefix = anyValue.$$type.toString() as string;
        var keyId = anyValue.id.toString() as string;

        return `${keyPrefix} = ${keyId}`;
    }

    return null;
}

export function addRandomTypeToObject(value: any) {
    return addTypeToObject(value, UUID.v4());
}

export function addTypeToObject(value: any, type: string): Object {
    value.$$type = type;

    return value;
}