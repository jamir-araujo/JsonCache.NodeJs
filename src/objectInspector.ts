import { notNull } from "./check";

export default class ObjectInspector {
    inspectObject(value: any, cacheItemFounded: (value: any) => void): void {
        notNull(value, "value");
        notNull(cacheItemFounded, "cacheItemFounded");

        this.inspectObjectInternal(value, cacheItemFounded, new HashSet<any>());
    }

    private inspectObjectInternal(value: any, cacheItemFounded: Action<any>, workingItems: HashSet<any>): void {
        if (value === null || !workingItems.add(value)) {
            return;
        }

        if (value instanceof Array){

        } else {
            cacheItemFounded(value);

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