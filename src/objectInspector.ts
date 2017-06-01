import { notNull } from "./check";

export default class ObjectInspector {
    inspectObject(value: Object, cacheItemFounded: Action<Object>): void {
        notNull(value, "value");
        notNull(cacheItemFounded, "cacheItemFounded");

        this.inspectObjectInternal(value, cacheItemFounded, new Set<any>());
    }

    private inspectObjectInternal(value: any, cacheItemFounded: Action<any>, workingItems: Set<any>): void {
        if (value === null || !workingItems.add(value)) {
            return;
        }

        if (value instanceof Array) {
            for (let item of value) {
                this.inspectObjectInternal(item, cacheItemFounded, workingItems);
            }
        } else if (value instanceof Object) {
            cacheItemFounded(value);

            this.inspectObjectProperties(value, cacheItemFounded, workingItems);
        }
    }

    private inspectObjectProperties(value: any, cacheItemFounded: Action<any>, workingItems: Set<any>) {
        for (var key in value) {
            if (value.hasOwnProperty(key)) {
                this.inspectObjectInternal(value[key], cacheItemFounded, workingItems);
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