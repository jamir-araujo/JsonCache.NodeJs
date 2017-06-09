import { notNull } from "./check";
import { KeyDependency, DirectKeyDependency, ChainedIndexedKeyDependency, ChainedKeyDependency, DirectIndexedKeyDependency } from "./keyDependency";

type CallBack = CacheItemFounded<Object, nullable<KeyDependency>, nullable<string>>;

export default class ObjectInspector {
    inspectObject(value: Object, cacheItemFounded: CallBack): void {
        notNull(value, "value");
        notNull(cacheItemFounded, "cacheItemFounded");

        this.inspectObjectInternal(value, cacheItemFounded, new Set<any>(), null);
    }

    private inspectObjectInternal(value: object, cacheItemFounded: CallBack, workingItems: Set<any>, keyDependency: nullable<KeyDependency>): void {
        if (value === null || !workingItems.add(value)) {
            return;
        }

        if (value instanceof Array) {
            for (let item of value) {
                this.inspectObjectInternal(item, cacheItemFounded, workingItems, keyDependency);
            }
        } else if (value instanceof Object) {
            var key = cacheItemFounded(value, keyDependency);

            if (key !== null) {
                keyDependency = null;
            }

            this.inspectProperties(value, key, cacheItemFounded, workingItems, keyDependency);
        }
    }

    private inspectProperties(
        value: Object,
        key: string | null,
        cacheItemFounded: CallBack,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>) {

        for (var propertyName in value) {
            if (value.hasOwnProperty(propertyName)) {
                var propertyValue = value[propertyName];
                if (propertyValue instanceof Array) {
                    this.inspectArrayProperty(key, cacheItemFounded, workingItems, keyDependency, propertyName, propertyValue)
                }
                else if (propertyValue instanceof Object) {
                    this.inspectObjectProperties(key, cacheItemFounded, workingItems, keyDependency, propertyName, propertyValue);
                }
            }
        }
    }

    private inspectObjectProperties(
        dependentKey: string | null,
        cacheItemFounded: CallBack,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>,
        propertyName: string,
        propertyValue: Object) {

        if (keyDependency === null) {
            if (dependentKey !== null) {
                keyDependency = new DirectKeyDependency(propertyName, dependentKey);
            } else {
                throw "needed to create DirectKeyDependency but dependentKey was null";
            }
        } else {
            keyDependency = new ChainedKeyDependency(propertyName, keyDependency);
        }

        this.inspectObjectInternal(propertyValue, cacheItemFounded, workingItems, keyDependency);
    }

    private inspectArrayProperty(
        dependentKey: string | null,
        cacheItemFounded: CallBack,
        workingItems: Set<any>,
        keyDependency: nullable<KeyDependency>,
        propertyName: string,
        array: Array<any>) {

        for (var index = 0; index < array.length; index++) {
            var element = array[index];

            var keyDependencyForIndex = keyDependency;

            if (keyDependencyForIndex === null) {
                if (keyDependencyForIndex !== null) {
                    keyDependencyForIndex = new DirectIndexedKeyDependency(propertyName, keyDependencyForIndex, index);
                } else {
                    throw "needed to create IndexedKeyDependency but dependentKey was null";
                }
            } else {
                keyDependencyForIndex = new ChainedIndexedKeyDependency(propertyName, keyDependencyForIndex, index);
            }

            this.inspectObjectInternal(element, cacheItemFounded, workingItems, keyDependencyForIndex);
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