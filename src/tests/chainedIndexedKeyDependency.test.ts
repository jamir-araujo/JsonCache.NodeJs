import { assert, expect } from "chai";
import { KeyDependency, ChainedIndexedKeyDependency } from "../keyDependency";
import { IMock, Mock, It, Times } from "typemoq";

describe("ChainedIndexedKeyDependency", () => {
    var keyDependencyMock: IMock<KeyDependency>;

    beforeEach(() => {
        keyDependencyMock = Mock.ofType<KeyDependency>();
    });

    describe("constructor", () => {

        it("should throw exception if propertyName is null", () => {
            var nullValue: any = null;
            expect(() => new ChainedIndexedKeyDependency(nullValue, keyDependencyMock.object, 0))
                .to
                .throw("parameter propertyName can not be null");
        });

        it("should throw exception if keyDependency is null", () => {
            var nullValue: any = null;
            expect(() => new ChainedIndexedKeyDependency("", nullValue, -1))
                .to
                .throw("parameter keyDependency can not be null");
        });

        it("should throw exception if index is less than zero", () => {
            expect(() => new ChainedIndexedKeyDependency("", keyDependencyMock.object, -1))
                .to
                .throw("parameter index should be greater than zero");
        });
    });

    describe("dependentKey", () => {

        it("should return the key of the internal keyDependency", () => {
            var testKey = "TestKey";

            keyDependencyMock
                .setup(kd => kd.dependentKey)
                .returns(() => testKey);

            var keyDependency = new ChainedIndexedKeyDependency("property", keyDependencyMock.object, 0);

            assert.equal(keyDependency.dependentKey, testKey, "keyDependency.dependentKey is not equal to testKey");
        });
    });

    describe("getValue(Object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new ChainedIndexedKeyDependency("innerObject", keyDependencyMock.object, 0);

            var theObject: any = null;
            expect(() => keyDependency.getValue(theObject))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if _keyDependency.getValue(owner) returns null ", () => {
            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => null);

            var keyDependency = new ChainedIndexedKeyDependency("innerObject", keyDependencyMock.object, 0);

            var value = keyDependency.getValue({});

            assert.isNull(value, "value is not null");
        });

        it("should return null if the property is null or undefined", () => {
            var owner1 = { childObject: {} };
            var owner2 = { childObject: { innerObject: null } };

            var keyDependency = new ChainedIndexedKeyDependency("innerObject", keyDependencyMock.object, 0);

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner1.childObject);

            var value1 = keyDependency.getValue(owner1);

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner2.childObject);

            var value2 = keyDependency.getValue(owner2);

            assert.isNull(value1, "value1 is not null");
            assert.isNull(value2, "value2 is not null");
        });

        it("should return null if index is greater than the array", () => {
            var owner = { childObject: { innerArray: [] } };

            var keyDependency = new ChainedIndexedKeyDependency("innerArray", keyDependencyMock.object, 0);

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner.childObject);

            var value = keyDependency.getValue(owner);

            assert.isNull(value, "value is not null");
        });

        it("should return the correct value por the index of the array", () => {
            var owner = { childObject: { innerArray: [{}] } };

            var keyDependency = new ChainedIndexedKeyDependency("innerArray", keyDependencyMock.object, 0);

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner.childObject);

            var value = keyDependency.getValue(owner);

            assert.equal(value, owner.childObject.innerArray[0], "value is not equal to owner.childObject.innerArray[0]")
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new ChainedIndexedKeyDependency("innerObject", keyDependencyMock.object, 0);
            var nullValue: any = null;

            expect(() => keyDependency.setValue(nullValue, {}))
                .to
                .throw("parameter owner can not be null");
        });

        it("should do nothing if _keyDependency.getValue(owner) returns null", () => {
            var innerObject = { id: 1 };
            var owner = { childObject: { innerObject: innerObject } };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => null);

            var keyDependency = new ChainedIndexedKeyDependency("innerObject", keyDependencyMock.object, 0);

            keyDependency.setValue(owner, {});

            assert.equal(owner.childObject.innerObject, innerObject, "owner.childObject.innerObject is not equal to innerObject");
        });

        it("should do nothing if the current value of the property is null of undefined", () => {
            var owner1 = { childObject: {} as any };
            var owner2 = { childObject: { innerObject: null } };

            var keyDependency = new ChainedIndexedKeyDependency("innerArray", keyDependencyMock.object, 0);
            var innerObject = { id: 1 };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner1.childObject);

            keyDependency.setValue(owner1, innerObject);

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner2.childObject);

            keyDependency.setValue(owner2, innerObject);

            assert.isUndefined(owner1.childObject.innerObject, "owner1.childObject.innerObject is not undefined");
            assert.isNull(owner2.childObject.innerObject, "owner2.childObject.innerObject is not null");
        });

        it("should do nothing if the index is graeter than the array", () => {
            var owner = { childObject: { innerArray: [] } };

            var keyDependency = new ChainedIndexedKeyDependency("innerArray", keyDependencyMock.object, 0);
            var innerObject = { id: 1 };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner.childObject);
        });
    });
});