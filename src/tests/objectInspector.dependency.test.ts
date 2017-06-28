import { assert, expect } from "chai";
import ObjectInspector from "../objectInspector";
import { KeyDependency, DirectKeyDependency, ChainedKeyDependency } from "../KeyDependency";
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

            objectInspector.inspectObject(shallowObject, value => {
                return tryGetKey(value);
            }, (value, keyDependency) => {
                keyDependencies.push(keyDependency);
            });

            assert.equal(keyDependencies.length, 0, "callCount is not 0");
        });

        it("should call cacheItemFounded twice, one with keyDependency null and the second with value", () => {
            var complexObject = addRandomTypeToObject({ id: 1, childObject: addRandomTypeToObject({ id: 2 }) });
            var keyDependencies: nullable<KeyDependency>[] = [];
            var complexObjectKey = tryGetKey(complexObject);

            objectInspector.inspectObject(complexObject, value => {
                return tryGetKey(value);
            }, (value, keyDependency) => {
                keyDependencies.push(keyDependency);
            });

            assert.equal(keyDependencies.length, 1, "keyDependencies.length is not 1");
            assert.isNotNull(keyDependencies[0], "keyDependencies[0] is null");

            var keyDependency = keyDependencies[0];
            if (keyDependency !== null) {
                assert.equal(complexObjectKey, keyDependency.dependentKey, "keyDependency.dependedKey is not equal to complexObjectKey");
            }
        });

        it("should call cacheItemFounded four times, three with keyDependency null and the last with value", () => {
            var complexObject = {
                childObject: {
                    innerObject: addRandomTypeToObject({
                        id: 1,
                        lastObject: addRandomTypeToObject({ id: 2 })
                    })
                }
            };

            var keyDependencies: nullable<KeyDependency>[] = [];
            var objects: Object[] = [];

            objectInspector.inspectObject(complexObject, value => {
                objects.push(value);
                return tryGetKey(value);
            }, (value, keyDependency) => {
                keyDependencies.push(keyDependency);
            });

            assert.equal(objects[0], complexObject, "objects[0] is not equal to complexObject");
            assert.equal(objects[1], complexObject.childObject, "objects[1] is not equal to complexObject.childObject");
            assert.equal(objects[2], complexObject.childObject.innerObject, "objects[2] is not equal to complexObject.childObject.innerObject");
            assert.equal(objects[3], complexObject.childObject.innerObject.lastObject, "objects[3] is not equal to complexObject.childObject.innerObject.lastObject");

            assert.isNotNull(keyDependencies[0], "keyDependencies[0] is null");

            var keyDependency = keyDependencies[0];
            if (keyDependency !== null) {
                var dependentKey = tryGetKey(complexObject.childObject.innerObject);
                assert.equal(keyDependency.dependentKey, dependentKey, "keyDependency.dependentKey is not equal to dependentKey");
            }
        });

        it("should call three cacheItemFounded times, one with KeyDependency null, one with DirectKeyDependency and one with ChainedKeyDependency", () => {
            var complexObject = addRandomTypeToObject({ id: 1, childObject: { innerObject: addRandomTypeToObject({ id: 2 }) } });
            var keyDependencies: nullable<KeyDependency>[] = [];
            var objects: Object[] = [];

            objectInspector.inspectObject(complexObject, value => {
                objects.push(value);
                return tryGetKey(value);
            }, (value, keyDependency) => {
                keyDependencies.push(keyDependency);
            });

            assert.equal(objects[0], complexObject, "objects[0] is not equal to complexObject");
            assert.equal(objects[1], complexObject.childObject, "objects[1] is not equal to complexObject.childObject");
            assert.equal(objects[2], complexObject.childObject.innerObject, "objects[2] is not equal to complexObject.childObject.innerObject");

            assert.isNotNull(keyDependencies[0], "keyDependencies[0] is null");
            assert.isNotNull(keyDependencies[1], "keyDependencies[1] is null");
        });
    });
});