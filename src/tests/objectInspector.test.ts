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

        it("should throw when value is null", () => {
            var anyValue: any = null;
            expect(() => objectInspector.inspectObject(anyValue, (a, b) => { return null }))
                .to
                .throw("parameter value can not be null", "should have thrown an exception");
        });

        it("should throw when cacheItemFounded is null", () => {
            var nullAction: any = null;
            expect(() => objectInspector.inspectObject({}, nullAction))
                .to
                .throw("parameter cacheItemFounded can not be null", "should have thrown an exception")
        });

        it("should call cacheItemFounded only once for shallow objects", () => {
            var shallowObject = addRandomTypeToObject({ id: 1 });
            var callCount = 0;

            objectInspector.inspectObject(shallowObject, (value, keyDependency) => {
                callCount += 1;

                return tryGetKey(value);
            });

            assert.equal(1, callCount, "callCount should be 1");
        });

        it("should call cacheItemFounded twice for object whit nested object", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });
            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 2, "callCount should be 2");
            assert.equal(objects[0], complexObject, "objects[0] and complexObject should the same");
            assert.equal(objects[1], complexObject.nested, "objects[1] and complexObject.nested should be same");
        });

        it("should not call cacheItemFounded for property when value is null", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nested: null });
            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 1, "callCount should be 1");
            assert.equal(objects[0], complexObject, "objects[0] and complexObject should the same");
        });

        it("should call for each individual item in the nested array", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nestedArray: [{}, {}] });

            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 3, "callCount should be 3");
            assert.equal(objects[0], complexObject, "objects[0] and complexObject should the same");
            assert.equal(objects[1], complexObject.nestedArray[0], "objects[1] and complexObject.nestedArray[0] should be the same");
            assert.equal(objects[2], complexObject.nestedArray[1], "objects[1] and complexObject.nestedArray[1] should be the same");
        });

        it("should not call cacheItemFounded for null item in the nested array", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nestedArray: [{}, null] });

            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 2, "callCount should be 2");
            assert.equal(objects[0], complexObject, "objects[0] and complexObject should the same");
            assert.equal(objects[1], complexObject.nestedArray[0], "objects[1] and complexObject.nestedArray[0] should be the same");
        });
    });
});