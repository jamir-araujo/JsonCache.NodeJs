import { assert, expect } from "chai";
import { KeyDependency, ChainedKeyDependency } from "../keyDependency";
import { IMock, Mock, It, Times } from "typemoq";

describe("ChainedKeyDependency", () => {
    var keyDependencyMock: IMock<KeyDependency>;

    beforeEach(() => {
        keyDependencyMock = Mock.ofType<KeyDependency>();
    });

    describe("constructor(string, KeyDependency)", () => {

        it("should throw exception if propertyName is null", () => {
            var nullValue: any = null;

            expect(() => new ChainedKeyDependency(nullValue, keyDependencyMock.object))
                .to
                .throw("parameter propertyName can not be null");
        });

        it("should throw exception if keyDependency is null", () => {
            var nullValue: any = null;
            expect(() => new ChainedKeyDependency("", nullValue))
                .to
                .throw("parameter keyDependency can not be null");
        });
    });

    describe("dependentKey", () => {

        it("should return the key of the internal keyDependency", () => {
            var testKey = "TestKey";

            keyDependencyMock
                .setup(kd => kd.dependentKey)
                .returns(() => testKey);

            var keyDependency = new ChainedKeyDependency("property", keyDependencyMock.object);

            assert.equal(keyDependency.dependentKey, testKey, "keyDependency.dependentKey is not equal to testKey");
        });
    });

    describe("getValue(object): Object | null", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var theObject: any = null;
            expect(() => keyDependency.getValue(theObject))
                .to
                .throw("parameter owner can not be null");
        });

        it("should return null if _keyDependency.getValue(owner) return null", () => {
            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => null);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var value = keyDependency.getValue({});

            assert.isNull(value, "value is not null");
        });

        it("should return null if property do not exist", () => {

            var getValueResult = { internalObject: {} };
            getValueResult.internalObject = { theObject: {} };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => getValueResult.internalObject);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var value = keyDependency.getValue(getValueResult);

            assert.isNull(value, "value is not null");
        });

        it("should return the correct value when the property exist", () => {
            var rootObject = { childObject: { innerObject: {} } };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => rootObject.childObject);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var value = keyDependency.getValue(rootObject);

            assert.equal(value, rootObject.childObject.innerObject, "value is not null");
        });
    });

    describe("setValue(Object, any): void", () => {

        it("should throw exception if owner is null", () => {
            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);
            var nullValue: any = null;

            expect(() => keyDependency.setValue(nullValue, {}))
                .to
                .throw("parameter owner can not be null");
        });

        it("should not set the value if _keyDependency.getValue(owner) returns null", () => {
            var innerObject = { id: 1 };
            var owner = { childObject: { innerObject: innerObject } };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => null);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            keyDependency.setValue(owner, {});

            assert.equal(owner.childObject.innerObject, innerObject, "owner.childObject.innerObject is not equal to innerObject");
        });

        it("should not set if the current value of the property is null of undefined", () => {
            var owner1 = { childObject: {} as any };
            var owner2 = { childObject: { innerObject: null } };

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);
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

        it("should set the value for not null existing property", () => {
            var owner = { childObject: { innerObject: {} } };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => owner.childObject);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);
            var innerObject = { id: 1 };

            keyDependency.setValue(owner, innerObject);

            assert.equal(owner.childObject.innerObject, innerObject, "owner.childObject.innerObject is not equal to innerObject");
        });
    });
});