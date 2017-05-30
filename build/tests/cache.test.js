"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var cache_1 = require("../cache");
describe("cache", function () {
    var items = {};
    var cache;
    beforeEach(function () {
        items = {};
        cache = new cache_1.default(items);
    });
    describe("get(string): any", function () {
        it("should return null when cache is empty", function () {
            var value = cache.get("invalid-key");
            chai_1.assert.equal(value, null, "value should be null");
        });
        it("should return the item when the item is in the cache", function () {
            var key = "the-key";
            var obj = { ok: true };
            items[key] = { value: obj, key: key, date: new Date() };
            var cachedObj = cache.get(key);
            chai_1.assert.equal(cachedObj, obj, "cachedObj as obj should be the same");
        });
    });
    describe("add(string, any, Date): boolean", function () {
        it("should add item to the items variable and return true", function () {
            var key = "the-key";
            var obj = { ok: true };
            var added = cache.add(key, obj, new Date());
            chai_1.assert.isNotNull(added, "added should be true");
            chai_1.assert.isNotNull(items[key], "items[key] should not be null");
            chai_1.assert.isNotNull(items[key].value, "items[key].value should not be null");
            chai_1.assert.equal(items[key].value, obj, "items[key].value and obj should be the same");
        });
        it("should return false when the key already exists", function () {
            var key = "the-key";
            var obj = { ok: true };
            items[key] = { key: key, value: obj, date: new Date() };
            var added = cache.add(key, obj, new Date());
            chai_1.assert.isFalse(added, "added should be null");
        });
    });
});

//# sourceMappingURL=cache.test.js.map
