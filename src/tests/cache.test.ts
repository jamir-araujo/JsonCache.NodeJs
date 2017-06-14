import * as NodeCache from "node-cache";
import { assert, expect } from "chai";
import { tryGetKey, addRandomTypeToObject } from "./testHelpers";
import Cache from "../cache";


describe("Cache", () => {
    var nodeCache: NodeCache;
    var cache: Cache;

    beforeEach(() => {
        nodeCache = new NodeCache();
        cache = new Cache(nodeCache);
    });

    describe("constructor(NodeCache)", () => {

        it("it should throw exception when _cache is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nullValue))
                .to
                .throw("parameter _cache can not be null");
        });
    });

    describe("add(Object, number): void", () => {

        it("should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => cache.add(nullValue, 0))
                .to
                .throw("parameter value can not be null");
        });

        it("should throw exception when time less than zero", () => {
            var nullValue: any = null;
            expect(() => cache.add({}, -1))
                .to
                .throw("parameter time should be greater than zero");
        });

        it("should add item to the _cache", () => {
            var complexObject = addRandomTypeToObject({ id: 1 });
            var key = tryGetKey(complexObject);

            cache.add(complexObject, 100);

            if (key != null) {
                var cacheObject = nodeCache.get(key);

                assert.isNotNull(cacheObject, "cacheObject is null");
                assert.equal(cacheObject, complexObject, "cacheObject is not equal to complexObject");
            }
        });
    });
});