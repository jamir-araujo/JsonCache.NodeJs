import { notNull } from "./check";

export default class ObjectInspector {
    inspectObject(value: any, cacheItemFounded: Action<any>): void {
        notNull(value, "value");
        notNull(cacheItemFounded, "cacheItemFounded");

        this.inspectObjectInternal(value, cacheItemFounded, new HashSet<any>());
    }

    private inspectObjectInternal(value: any, cacheItemFounded: Action<any>, workingItems: HashSet<any>): void {
        if (value === null || !workingItems.add(value)) {
            return;
        }

        if (value instanceof Array) {

        } else if (value instanceof Object) {
            cacheItemFounded(value);

            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    this.inspectObjectInternal(value[key], cacheItemFounded, workingItems);
                }
            }
        }
    }
}

class HashSet<T> {
    private _items: T[] = [];

    add(item: T): boolean {
        var index = this._items.indexOf(item);

        if (index > 0) return false;

        this._items.push(item);
        return true;
    }
}