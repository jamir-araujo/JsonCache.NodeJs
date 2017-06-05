import { assert, expect } from "chai";
import { IndexedKeyDependency } from "../keyDependency";

describe("IndexedKeyDependency", () => {
    describe("constructor", () => {

        it("should throw exception if propertyName is null", () => {
            var nullValue: any = null;
            expect(() => new IndexedKeyDependency(nullValue, "", 0))
                .to
                .throw("parameter propertyName can not be null");
        });

        it("should throw exception if dependentKey is null", () => {
            var nullValue: any = null;
            expect(() => new IndexedKeyDependency("", nullValue, -1))
                .to
                .throw("parameter dependentKey can not be null");
        });

        it("should throw exception if index is less than zero", () => {
            expect(() => new IndexedKeyDependency("", "", -1))
                .to
                .throw("parameter index should be greater than zero");
        });
    });

    describe("getValue(object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new IndexedKeyDependency("innerObject", "gibberish", 0);

            var theObject: any = null;
            expect(() => keyDependency.getValue(theObject))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if the property do not exists", () => {
            var keyDependency = new IndexedKeyDependency("theArray", "gibberish", 0);

            var value = keyDependency.getValue({});

            assert.isNull(value, "value should be null");
        });

        it("should return null if the index is greater than the array", () => {
            var keyDependency = new IndexedKeyDependency("theArray", "gibberish", 1);

            var value = keyDependency.getValue({ theArray: [{}] });

            assert.isNull(value, "value should be null");
        });

        it("should return the correct value for the index of the array", () => {
            var keyDependency = new IndexedKeyDependency("theArray", "gibberish", 0);
            var theObject = {};

            var value = keyDependency.getValue({ theArray: [theObject] });

            assert.equal(value, theObject, "value should be equal to testObject");
        });

    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new IndexedKeyDependency("innerObject", "gibberish", 0);

            var theObject: any = null;
            expect(() => keyDependency.setValue(theObject, null))
                .to
                .throw("parameter owner can not be null");
        });

        it("should do nothing if the index do not exist on the array", () => {
            var keyDependency = new IndexedKeyDependency("theArray", "gibberish", 0);
            var arrayObject = {};
            var theObject = { theArray: [] };

            keyDependency.setValue(theObject, arrayObject);

            assert.equal(theObject.theArray.length, 0, "theObject.theArray.length should be 0");
        });

        it("should ", () => {
            var keyDependency = new IndexedKeyDependency("theArray", "gibberish", 0);
            var arrayObject = {};
            var theObject = { theArray: [] };

            keyDependency.setValue(theObject, arrayObject);

            assert.equal(theObject.theArray.length, 0, "theObject.theArray.length should be 0");
        });

    });
});