export default class Cache {
    private _items: CacheItems;

    constructor(items: CacheItems = {}) {
        this._items = items;
    }

    get(key: string): any {
        var cacheItem = this._items[key];

        if (cacheItem == null) {
            return;
        }

        return cacheItem.value;
    }

    add(key: string, value: any, expiringDate: Date): boolean {
        if (this._items[key]) return false;

        this._items[key] = new LocalItem(key, value, expiringDate);

        return true;
    }
}

class LocalItem implements CacheItem {
    constructor(
        public key: string,
        public value: any,
        public date: Date
    ) { }
}