import { assert, expect } from "chai";
import { DirectIndexedKeyDependency } from "../keyDependency";

describe("DirectIndexedKeyDependency", () => {
    describe("constructor(string, string, number)", () => {

        it("should throw exception if propertyName is null", () => {
            var nullValue: any = null;
            expect(() => new DirectIndexedKeyDependency(nullValue, "", 0))
                .to
                .throw("parameter propertyName can not be null");
        });

        it("should throw exception if dependentKey is null", () => {
            var nullValue: any = null;
            expect(() => new DirectIndexedKeyDependency("", nullValue, -1))
                .to
                .throw("parameter dependentKey can not be null");
        });

        it("should throw exception if index is less than zero", () => {
            expect(() => new DirectIndexedKeyDependency("", "", -1))
                .to
                .throw("parameter index should be greater than zero");
        });
    });

    describe("dependentKey", () => {

        it("should return the correct value", () => {
            var testKey = "TestKey";
            var keyDependency = new DirectIndexedKeyDependency("array", testKey, 0);

            assert.equal(keyDependency.dependentKey, testKey, "keyDependency.dependentKey is not equal to testKey");
        });
    });

    describe("getValue(object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectIndexedKeyDependency("innerObject", "gibberish", 0);

            var theObject: any = null;
            expect(() => keyDependency.getValue(theObject))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if the property do not exists", () => {
            var keyDependency = new DirectIndexedKeyDependency("theArray", "gibberish", 0);

            var value = keyDependency.getValue({});

            assert.isNull(value, "value is not null");
        });

        it("should return null if the index is greater than the array", () => {
            var keyDependency = new DirectIndexedKeyDependency("theArray", "gibberish", 1);

            var value = keyDependency.getValue({ theArray: [{}] });

            assert.isNull(value, "value is not null");
        });

        it("should return the correct value for the index of the array", () => {
            var keyDependency = new DirectIndexedKeyDependency("theArray", "gibberish", 0);
            var theObject = {};

            var value = keyDependency.getValue({ theArray: [theObject] });

            assert.equal(value, theObject, "value is not equal to testObject");
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectIndexedKeyDependency("innerObject", "gibberish", 0);

            var theObject: any = null;
            expect(() => keyDependency.setValue(theObject, null))
                .to
                .throw("parameter owner can not be null");
        });

        it("should do nothing if the index do not exist on the array", () => {
            var keyDependency = new DirectIndexedKeyDependency("theArray", "gibberish", 0);
            var arrayObject = {};
            var theObject = { theArray: [] };

            keyDependency.setValue(theObject, arrayObject);

            assert.equal(theObject.theArray.length, 0, "theObject.theArray.length is not 0");
        });

        it("should do nothing if the index is graeter than the array", () => {
            var keyDependency = new DirectIndexedKeyDependency("theArray", "gibberish", 1);
            var arrayObject = {};
            var theObject = { theArray: [] };

            keyDependency.setValue(theObject, arrayObject);

            assert.equal(theObject.theArray.length, 0, "theObject.theArray.length is not 0");
        });

        it("should do nothing if the value on the index is null or undefined", () => {
            var keyDependency1 = new DirectIndexedKeyDependency("theArray", "gibberish", 0);
            var keyDependency2 = new DirectIndexedKeyDependency("theArray", "gibberish", 1);

            var arrayObject = {};
            var theObject = { theArray: [null, undefined] };

            keyDependency1.setValue(theObject, arrayObject);
            keyDependency2.setValue(theObject, arrayObject);

            assert.isNull(theObject.theArray[0], "theObject.theArray[0] is not null");
            assert.isUndefined(theObject.theArray[1], "theObject.theArray[0] is not undefined");
        });
    });
});