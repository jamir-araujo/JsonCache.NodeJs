import { assert } from "chai";
import Cache from "../cache";

describe("cache", () => {
    let items: CacheItems = {};
    let cache: Cache;

    beforeEach(() => {
        items = {};
        cache = new Cache(items);
    });

    describe("get(string): any", () => {

        it("should return null when cache is empty", () => {
            var value = cache.get("invalid-key");

            assert.equal(value, null, "value should be null");
        });

        it("should return the item when the item is in the cache", () => {
            var key = "the-key";
            var obj = { ok: true };
            items[key] = { value: obj, key: key, date: new Date() };

            var cachedObj = cache.get(key);

            assert.equal(cachedObj, obj, "cachedObj as obj should be the same");
        });

    });

    describe("add(string, any, Date): boolean", () => {

        it("should add item to the items variable and return true", () => {
            var key = "the-key";
            var obj = { ok: true };

            var added = cache.add(key, obj, new Date());

            assert.isNotNull(added, "added should be true");
            assert.isNotNull(items[key], "items[key] should not be null");
            assert.isNotNull(items[key].value, "items[key].value should not be null");
            assert.equal(items[key].value, obj, "items[key].value and obj should be the same");
        });

        it("should return false when the key already exists", () => {
            var key = "the-key";
            var obj = { ok: true };
            items[key] = { key: key, value: obj, date: new Date() };

            var added = cache.add(key, obj, new Date());

            assert.isFalse(added, "added should be null");
        });

    });
});