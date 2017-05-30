"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = (function () {
    function Cache(items) {
        if (items === void 0) { items = {}; }
        this._items = items;
    }
    Cache.prototype.get = function (key) {
        var cacheItem = this._items[key];
        if (cacheItem == null) {
            return;
        }
        return cacheItem.value;
    };
    Cache.prototype.add = function (key, value, expiringDate) {
        if (this._items[key])
            return false;
        this._items[key] = new LocalItem(key, value, expiringDate);
        return true;
    };
    return Cache;
}());
exports.default = Cache;
var LocalItem = (function () {
    function LocalItem(key, value, date) {
        this.key = key;
        this.value = value;
        this.date = date;
    }
    return LocalItem;
}());

//# sourceMappingURL=cache.js.map
