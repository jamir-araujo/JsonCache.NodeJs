import { assert, expect } from "chai";
import Convention from "../convention";


describe("Convention", () => {
    var convention: Convention;

    beforeEach(() => {
        convention = new Convention(["$$type", "id"]);
    });

    describe("constructor", () => {

        it("should throw exception when _properties is null", () => {
            var nullValue: any = null;
            expect(() => new Convention(nullValue))
                .to
                .throw("parameter _properties can not be null");
        });

        it("should throw exception when array is empty", () => {
            var emptyArray: string[] = [];
            expect(() => new Convention(emptyArray))
                .to
                .throw("parameter _properties must be an array with at lest one item");
        });
    });

    describe("fitsConvention(Object): boolean", () => {

        it("should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => convention.fitsConvention(nullValue))
                .to
                .throw("parameter value can not be null");
        });

        it("should return false when object do not have the required properties", () => {
            var fits = convention.fitsConvention({});

            assert.isFalse(fits, "fits is true");
        });

        it("should return true when object have the required properties", () => {
            var fits = convention.fitsConvention({ $$type: "System.My.Type", id: 123 });

            assert.isTrue(fits, "fits is false");
        });
    });

    describe("createKey(Object): string", () => {

        it("should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => convention.createKey(nullValue))
                .to
                .throw("parameter value can not be null");
        });

        it("should throw exception if object do not fits in convention", () => {
            expect(() => convention.createKey({}))
                .to
                .throw("Object do not fits convention");
        });

        it("should return the correct string for conventional object", () => {
            var key = convention.createKey({ $$type: "System.My.Type", id: 123 });

            assert.equal(key, "System.My.Type -> 123", "incorrect key");
        });
    });
});