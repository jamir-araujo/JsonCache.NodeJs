import { notNull, greaterThanZero } from "./check";

export abstract class KeyDependency {
    abstract dependedKey: string;

    abstract getValue(owner: Object): Object | null;
    abstract setValue(owner: Object, value: any): void;
}

export class ChainedIndexedKeyDependency extends KeyDependency {
    private _propertyName: string;
    private _keyDependency: KeyDependency;
    private _index: number;

    get dependedKey(): string {
        return this._keyDependency.dependedKey;
    }

    constructor(propertyName: string, keyDependency: KeyDependency, index: number) {
        super();

        this._propertyName = propertyName;
        this._keyDependency = keyDependency;
        this._index = index;
    }

    getValue(owner: Object): Object | null {
        var array = this.getArray(owner);

        if (array !== null && array.length > this._index) {
            return array[this._index];
        }

        return null;
    }

    setValue(owner: Object, value: any): void {
        var array = this.getArray(owner);

        if (array !== null && array.length > this._index) {
            array[this._index] = value;
        }
    }

    private getArray(owner: Object): Array<any> | null {
        var parentOwner = this._keyDependency.getValue(owner);

        if (parentOwner !== null) {
            return parentOwner[this._propertyName];
        }

        return null;
    }
}

export class DirectIndexedKeyDependency extends KeyDependency {
    private _propertyName: string;
    private _dependentKey: string;
    private _index: number;

    get dependedKey(): string {
        return this._dependentKey;
    }

    constructor(propertyName: string, dependentKey: string, index: number) {
        super();

        notNull(propertyName, "propertyName");
        notNull(dependentKey, "dependentKey");
        greaterThanZero(index, "index");

        this._propertyName = propertyName;
        this._dependentKey = dependentKey;
        this._index = index;
    }

    getValue(owner: Object): Object | null {
        notNull(owner, "owner");

        var array = owner[this._propertyName] as Array<any>;

        if (array !== undefined && array.length > this._index) {
            return array[this._index];
        }

        return null;
    }

    setValue(owner: Object, value: any): void {
        notNull(owner, "owner");

        var array = owner[this._propertyName] as Array<any>;

        if (array !== undefined && array.length > this._index) {
            array[this._index] = value;
        }
    }

}

export class ChainedKeyDependency extends KeyDependency {
    private _propertyName: string;
    private _keyDependency: KeyDependency;

    get dependedKey(): string {
        return this._keyDependency.dependedKey;
    }

    constructor(propertyName: string, keyDependency: KeyDependency) {
        super();

        notNull(propertyName, "propertyName");
        notNull(keyDependency, "keyDependency");

        this._propertyName = propertyName;
        this._keyDependency = keyDependency;
    }

    getValue(owner: Object): Object | null {
        notNull(owner, "owner");

        var parentOwner = this._keyDependency.getValue(owner);

        if (parentOwner !== null) {
            var value = parentOwner[this._propertyName];
            if (value !== undefined){
                return value;
            }
        }

        return null;
    }

    setValue(owner: Object, value: any): void {
        var parentOwner = this._keyDependency.getValue(owner);

        if (parentOwner !== null) {
            parentOwner[this._propertyName] = value;
        }
    }
}

export class DirectKeyDependency extends KeyDependency {
    private _propertyName: string;
    private _dependentKey: string;

    get dependedKey(): string {
        return this._dependentKey;
    }

    constructor(propertyName: string, dependentKey: string) {
        super();

        notNull(propertyName, "propertyName");
        notNull(dependentKey, "dependentKey");

        this._propertyName = propertyName;
        this._dependentKey = dependentKey;
    }

    getValue(owner: Object): Object | null {
        notNull(owner, "owner");

        var value = owner[this._propertyName];
        if (value !== undefined) {
            return value;
        }

        return null;
    }

    setValue(owner: Object, value: any): void {
        notNull(owner, "owner");

        owner[this._propertyName] = value;
    }
}