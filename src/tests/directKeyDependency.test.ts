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

    describe("dependentKey", () => {

        it("should return the correct value", () => {
            var testKey = "TestKey";
            var keyDependency = new DirectKeyDependency("property", testKey);

            assert.equal(keyDependency.dependentKey, testKey, "keyDependency.dependentKey is not equal to testKey");
        });
    });

    describe("getValue(object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var owner: any = null;
            expect(() => keyDependency.getValue(owner))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if the property do not exists", () => {
            var keyDependency = new DirectKeyDependency("nonExistingProperty", "gibberish");

            var value = keyDependency.getValue({});

            assert.isNull(value, "value is not null");
        });

        it("should return the correct value", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var innerObject = { value: 1 };
            var owner = { innerObject: innerObject };
            var value = keyDependency.getValue(owner);

            assert.equal(value, innerObject, "value is not equal to innerObject");
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            var nullValue: any = null;
            expect(() => keyDependency.setValue(nullValue, null))
                .to
                .throw("parameter owner can not be null");
        });

        it("should not set the value if the property is null or undefined", () => {
            var innerObject = { value: 2 };
            var owner: any = { id: 1 };
            
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");

            keyDependency.setValue(owner, innerObject);

            assert.isUndefined(owner.innerObject, "theObject.innerObject is not undefined");
        });

        it("should set the value for already existing property", () => {
            var owner = { id: 1, innerObject: { id: 1 } };
            
            var keyDependency = new DirectKeyDependency("innerObject", "gibberish");
            var innerObject = { value: 2 };

            keyDependency.setValue(owner, innerObject);

            assert.equal(owner.innerObject, innerObject, "theObject.innerObject is not equal to innerObject");
        });
    });
});