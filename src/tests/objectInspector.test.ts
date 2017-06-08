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
                .throw("parameter value can not be null", "did not thrown an exception");
        });

        it("should throw when cacheItemFounded is null", () => {
            var nullAction: any = null;
            expect(() => objectInspector.inspectObject({}, nullAction))
                .to
                .throw("parameter cacheItemFounded can not be null", "did not thrown an exception")
        });

        it("should call cacheItemFounded only once for shallow objects", () => {
            var shallowObject = addRandomTypeToObject({ id: 1 });
            var callCount = 0;

            objectInspector.inspectObject(shallowObject, (value, keyDependency) => {
                callCount += 1;

                return tryGetKey(value);
            });

            assert.equal(1, callCount, "callCount is not 1");
        });

        it("should call cacheItemFounded twice for object whit nested object", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });
            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 2, "callCount is not 2");
            assert.equal(objects[0], complexObject, "objects[0] is not equal to complexObject");
            assert.equal(objects[1], complexObject.nested, "objects[1] is not equal to complexObject.nested");
        });

        it("should not call cacheItemFounded for property when value is null", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nested: null });
            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 1, "callCount is not 1");
            assert.equal(objects[0], complexObject, "objects[0] is not equal to complexObject");
        });

        it("should call for each individual item in the nested array", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nestedArray: [{}, {}] });

            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 3, "callCount is not 3");
            assert.equal(objects[0], complexObject, "objects[0] is no equal to complexObject");
            assert.equal(objects[1], complexObject.nestedArray[0], "objects[1] is not equal to complexObject.nestedArray[0]");
            assert.equal(objects[2], complexObject.nestedArray[1], "objects[1] is not equal to complexObject.nestedArray[1]");
        });

        it("should not call cacheItemFounded for null item in the nested array", () => {
            var complexObject = addRandomTypeToObject({ id: 1, nestedArray: [{}, null] });

            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, (value, keyDependency) => {
                objects.push(value);

                return tryGetKey(value);
            });

            assert.equal(objects.length, 2, "callCount is not 2");
            assert.equal(objects[0], complexObject, "objects[0] is not equal to complexObject");
            assert.equal(objects[1], complexObject.nestedArray[0], "objects[1] is not equal to complexObject.nestedArray[0]");
        });
    });
});