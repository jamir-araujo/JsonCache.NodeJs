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

    describe("dependedKey", () => {
        
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

            assert.isNull(value, "value should be null");
        });

        it("should return null if property do not exist", () => {

            var getValueResult = { internalObject: {} };
            getValueResult.internalObject = { theObject: {} };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => getValueResult.internalObject);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var value = keyDependency.getValue(getValueResult);

            assert.isNull(value, "value should be null");
        });

        it("should return the correct value when the property exist", () => {

            var rootObject = { 
                childObject: {
                    innerObject: {}
                } 
            };

            keyDependencyMock
                .setup(kd => kd.getValue(It.isAny()))
                .returns(() => rootObject.childObject);

            var keyDependency = new ChainedKeyDependency("innerObject", keyDependencyMock.object);

            var value = keyDependency.getValue(rootObject);

            assert.equal(value, rootObject.childObject.innerObject, "value should be null");
        });
    });
});