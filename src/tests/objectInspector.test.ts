import { assert } from "chai";
import ObjectInspector from "../objectInspector";

describe("ObjectInspector", () => {
    let objectInspector: ObjectInspector;

    beforeEach(() => {
        objectInspector = new ObjectInspector();
    });;

    describe("inspectObject", () => {

        it("should cacheItemFounded only once for shallow object", () => {
            var shallowObject = { value: 1 };
            var callCount = 0;

            objectInspector.inspectObject(shallowObject, value => {
                callCount += 1;
            });

            assert.equal(1, callCount, "callCount should be 1");
        });

    });
});