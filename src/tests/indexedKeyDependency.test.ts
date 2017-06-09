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

            var owner: any = null;
            expect(() => keyDependency.getValue(owner))
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
            var owner = { innerArray: [{}] }

            var keyDependency = new DirectIndexedKeyDependency("innerArray", "gibberish", 0);

            var value = keyDependency.getValue(owner);

            assert.equal(value, owner.innerArray[0], "value is not equal to owner.innerArray[0]");
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new DirectIndexedKeyDependency("innerObject", "gibberish", 0);

            var nullValue: any = null;
            expect(() => keyDependency.setValue(nullValue, null))
                .to
                .throw("parameter owner can not be null");
        });

        it("should do nothing if the index do not exist on the array", () => {
            var owner = { innerArray: [] };
            
            var keyDependency = new DirectIndexedKeyDependency("innerArray", "gibberish", 0);

            keyDependency.setValue(owner, {});

            assert.equal(owner.innerArray.length, 0, "owner.innerArray.length is not 0");
        });

        it("should do nothing if the index is greater than the array", () => {
            var owner = { innerArray: [] };
            var keyDependency = new DirectIndexedKeyDependency("innerArray", "gibberish", 1);

            keyDependency.setValue(owner, {});

            assert.equal(owner.innerArray.length, 0, "owner.innerArray.length is not 0");
        });

        it("should do nothing if the value on the index is null or undefined", () => {
            var keyDependency1 = new DirectIndexedKeyDependency("theArray", "gibberish", 0);
            var keyDependency2 = new DirectIndexedKeyDependency("theArray", "gibberish", 1);

            var owner = { theArray: [null, undefined] };

            keyDependency1.setValue(owner, {});
            keyDependency2.setValue(owner, {});

            assert.isNull(owner.theArray[0], "theObject.theArray[0] is not null");
            assert.isUndefined(owner.theArray[1], "theObject.theArray[0] is not undefined");
        });

        it("should update the value for the correct index", () => {
            var owner = { innerArray: [{}] };

            var keyDependency = new DirectIndexedKeyDependency("innerArray", "gibberish", 0)

            var newValue = { id: 1 };
            keyDependency.setValue(owner, newValue);

            assert.equal(owner.innerArray[0], newValue, "owner.innerArray[0] is not equal newValue")
        });
    });
});