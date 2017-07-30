import { notNull } from "./check";
import IObjectInspector from "./IObjectInspector";
import { KeyDependency, DirectKeyDependency, ChainedIndexedKeyDependency, ChainedKeyDependency, DirectIndexedKeyDependency } from "./keyDependency";

type ObjectFound = (value: Object) => nullable<string>;
type KeyDependencyFound = (value: Object, keyDependency: KeyDependency) => void;

export default class ObjectInspector implements IObjectInspector {
    inspectObject(value: Object, objectFound: ObjectFound, KeyDependencyFound: KeyDependencyFound): void {
        notNull(value, "value");
        notNull(objectFound, "cacheItemFounded");
        notNull(KeyDependencyFound, "KeyDependencyFound");

        this.inspectObjectInternal(value, objectFound, KeyDependencyFound, new Set<any>(), null);
    }

    private inspectObjectInternal(
        value: object,
        objectFound: ObjectFound,
        keyDependencyFound: KeyDependencyFound,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>): void {

        if (value === null || !workingItems.add(value)) {
            return;
        }

        if (value instanceof Array) {
            for (let item of value) {
                this.inspectObjectInternal(item, objectFound, keyDependencyFound, workingItems, keyDependency);
            }
        } else if (value instanceof Object) {
            var key = objectFound(value);

            if (key !== null) {
                keyDependency = null;
            }

            this.inspectProperties(value, key, objectFound, keyDependencyFound, workingItems, keyDependency);
        }
    }

    private inspectProperties(
        value: Object,
        key: nullable<string>,
        cacheItemFounded: ObjectFound,
        keyDependencyFound: KeyDependencyFound,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>) {

        for (var propertyName in value) {
            if (value.hasOwnProperty(propertyName)) {
                var propertyValue = value[propertyName];
                if (propertyValue instanceof Array) {
                    this.inspectArrayProperty(key, cacheItemFounded, keyDependencyFound, workingItems, keyDependency, propertyName, propertyValue)
                }
                else if (propertyValue instanceof Object) {
                    this.inspectObjectProperties(key, cacheItemFounded, keyDependencyFound, workingItems, keyDependency, propertyName, propertyValue);
                }
            }
        }
    }

    private inspectObjectProperties(
        dependentKey: nullable<string>,
        cacheItemFounded: ObjectFound,
        keyDependencyFound: KeyDependencyFound,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>,
        propertyName: string,
        propertyValue: Object) {

        if (keyDependency === null) {
            if (dependentKey !== null) {
                keyDependency = new DirectKeyDependency(propertyName, dependentKey);
            }
        } else {
            keyDependency = new ChainedKeyDependency(propertyName, keyDependency);
        }

        this.inspectObjectInternal(propertyValue, cacheItemFounded, keyDependencyFound, workingItems, keyDependency);

        if (keyDependency !== null) {
            keyDependencyFound(propertyValue, keyDependency);
        }
    }

    private inspectArrayProperty(
        dependentKey: nullable<string>,
        cacheItemFounded: ObjectFound,
        keyDependencyFound: KeyDependencyFound,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>,
        propertyName: string,
        array: Array<any>) {

        for (var index = 0; index < array.length; index++) {
            var element = array[index];

            var keyDependencyForIndex = keyDependency;

            if (keyDependencyForIndex === null) {
                if (dependentKey !== null) {
                    keyDependencyForIndex = new DirectIndexedKeyDependency(propertyName, dependentKey, index);
                }
            } else {
                keyDependencyForIndex = new ChainedIndexedKeyDependency(propertyName, keyDependencyForIndex, index);
            }

            this.inspectObjectInternal(element, cacheItemFounded, keyDependencyFound, workingItems, keyDependencyForIndex);

            if (keyDependencyForIndex !== null) {
                keyDependencyFound(element, keyDependencyForIndex);
            }
        }
    }
}

class Set<T> {
    private _items: T[] = [];

    add(item: T): boolean {
        var index = this._items.indexOf(item);

        if (index > 0) return false;

        this._items.push(item);
        return true;
    }
}