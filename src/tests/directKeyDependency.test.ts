import { assert, expect } from "chai";
import { DirectKeyDependency } from "../keyDependency";

describe("DirectKeyDependency", () => {

    describe("constructor(string, string)", () => {

        it("should throw exception if propertyName is null", () => {
            var nullValue: any = null;
            expect(() => new DirectKeyDependency(nullValue, ""))
                .to
                .throw("parameter propertyName can not be null");
        });

        it("should throw exception if dependentKey is null", () => {
            var nullValue: any = null;
            expect(() => new DirectKeyDependency("", nullValue))
                .to
                .throw("parameter dependentKey can not be null");
        });
    });

    describe("getValue(object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var theObject: any = null;
            expect(() => keyDependency.getValue(theObject))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if the property do not exists", () => {
            var keyDependency = new DirectKeyDependency("nonExistingProperty", "gibberish");

            var value = keyDependency.getValue({});

            assert.isNull(value, "value should be null");
        });

        it("should return the correct value", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var innerObject = { value: 1 };
            var value = keyDependency.getValue({ innerObject: innerObject });

            assert.equal(value, innerObject, "value should be equal to innerObject");
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var theObject: any = null;
            expect(() => keyDependency.setValue(theObject, null))
                .to
                .throw("parameter owner can not be null");
        });

        it("should set the value for already existing property", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");
            var innerObject = { value: 2 };
            var theObject = { id: 1, innerObject: { id: 1 } };

            keyDependency.setValue(theObject, innerObject);

            assert.equal(theObject.innerObject, innerObject, "theObject.innerObject should be equal innerObject");
        });

        it("should not set the value if the property is null or does not exist", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");
            var innerObject = { value: 2 };
            var theObject: any = { id: 1 };

            keyDependency.setValue(theObject, innerObject);

            assert.isUndefined(theObject.innerObject, "theObject.innerObject should be undefined");
        });
    });
});