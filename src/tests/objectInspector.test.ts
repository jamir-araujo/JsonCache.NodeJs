import { assert } from "chai";
import ObjectInspector from "../objectInspector";

describe("ObjectInspector", () => {
    let objectInspector: ObjectInspector;

    beforeEach(() => {
        objectInspector = new ObjectInspector();
    });

    describe("inspectObject", () => {

        it("should call cacheItemFounded only once for shallow objects", () => {
            var shallowObject = { value: 1 };
            var callCount = 0;

            objectInspector.inspectObject(shallowObject, value => {
                callCount += 1;
            });

            assert.equal(1, callCount, "callCount should be 1");
        });

        it("should call cacheItemFounded twice for object whit nested object", () => {
            var complexObject = { value: 1, nested: { value: 2 } };
            var objects: any[] = [];

            objectInspector.inspectObject(complexObject, value => {
                objects.push(value);
            });

            assert.equal(2, objects.length, "callCount should be 2");

            assert.equal(objects[0], complexObject, "objects[0] and complexObject should the same");
            assert.equal(objects[1], complexObject.nested, "objects[1] and complexObject.nested should be same");
        });

    });
});