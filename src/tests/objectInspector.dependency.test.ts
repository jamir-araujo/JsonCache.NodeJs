import { assert, expect } from "chai";
import ObjectInspector from "../objectInspector";
import { KeyDependency } from "../KeyDependency";
import { addRandomTypeToObject, addTypeToObject, tryGetKey } from "./testHelpers";

describe("ObjectInspector", () => {
    let objectInspector: ObjectInspector;

    beforeEach(() => {
        objectInspector = new ObjectInspector();
    });

    describe("inspectObject(Object, CacheItemFounded<Object, nullable<KeyDependency>, nullable<string>>)", () => {

        it("should call cacheItemFounded only once with keyDependency null for shallow objects", () => {
            var shallowObject = addRandomTypeToObject({ id: 1 });
            var keyDependencies: nullable<KeyDependency>[] = [];

            objectInspector.inspectObject(shallowObject, (value, keyDependency) => {
                keyDependencies.push(keyDependency);

                return tryGetKey(value);
            });

            assert.equal(keyDependencies.length, 1, "callCount should be 1");
            assert.isNull(keyDependencies[0], "keyDependencies[0] should be null");
        });

        it("should call cacheItemFounded twice, one with keyDependency null and the second with value", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });
            var keyDependencies: nullable<KeyDependency>[] = [];
            var complexObjectKey = tryGetKey(complexObject);

            objectInspector.inspectObject(complexObject, (value, KeyDependency) => {
                keyDependencies.push(KeyDependency);

                return tryGetKey(value);
            });

            assert.equal(keyDependencies.length, 2, "keyDependencies.length should be 2");
            assert.isNull(keyDependencies[0], "keyDependencies[0] should be null");
            assert.isNotNull(keyDependencies[1], "keyDependencies[1] should not be null");

            var keyDependency = keyDependencies[1];
            if (keyDependency !== null) {
                assert.equal(complexObjectKey, keyDependency.dependedKey, "keyDependency.dependedKey should be equal to complexObjectKey");
            }
        });
    });
});