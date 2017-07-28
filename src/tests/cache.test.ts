import { assert, expect } from "chai";
import { IMock, Mock, It, Times, MockBehavior } from "typemoq";
import * as NodeCache from "node-cache";
import { tryGetKey, addRandomTypeToObject } from "./testHelpers";
import Convention from "../convention";
import Cache from "../cache";
import ObjectInspector from "../objectInspector";
import { KeyDependency } from "../keyDependency";

describe("Cache", () => {
    var cache: Cache;
    var nodeCacheMock: IMock<NodeCache>;
    var conventionMock: IMock<Convention>;
    var objectInspector: ObjectInspector;

    beforeEach(() => {
        nodeCacheMock = Mock.ofType<NodeCache>(NodeCache, MockBehavior.Strict);
        conventionMock = Mock.ofType<Convention>(Convention, MockBehavior.Strict, ["", ""]);
        objectInspector = new ObjectInspector();
        cache = new Cache(nodeCacheMock.object, conventionMock.object, objectInspector);
    });

    describe("constructor(NodeCache)", () => {

        it("it should throw exception when _cache is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nullValue, conventionMock.object, objectInspector))
                .to
                .throw("parameter _cache can not be null");
        });

        it("it should throw exception when _convention is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nodeCacheMock.object, nullValue, objectInspector))
                .to
                .throw("parameter _convention can not be null");
        });

        it("it should throw exception when _objectInspector is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nodeCacheMock.object, conventionMock.object, nullValue))
                .to
                .throw("parameter _objectInspector can not be null");
        });
    });

    describe("add(Object, number): void", () => {

        it("should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => cache.add(nullValue, 0))
                .to
                .throw("parameter value can not be null");
        });

        it("should throw exception when time less than zero", () => {
            expect(() => cache.add({}, -1))
                .to
                .throw("parameter time should be greater than zero");
        });

        it("should not call _cache.set when _convetion.fitsConvention returns false", () => {
            var object = {};

            conventionMock
                .setup(convention => convention.fitsConvention(object))
                .returns(() => false)
                .verifiable(Times.once());

            cache.add(object, 100);

            nodeCacheMock
                .verify(nodeCache => nodeCache.set(It.isAny(), It.isAny(), It.isAny()), Times.never());
        });

        it("should call _cache.set when _convetion.fitsConvention returns true", () => {
            var object = addRandomTypeToObject({ id: 1 });

            var key = "teste key";

            conventionMock
                .setup(convention => convention.fitsConvention(object))
                .returns(() => true)
                .verifiable(Times.once());

            conventionMock
                .setup(convention => convention.createKey(object))
                .returns(() => key)
                .verifiable(Times.once());

            nodeCacheMock
                .setup(nodeCache => nodeCache.set(key, object, 100))
                .returns(() => true)
                .verifiable(Times.once());

            cache.add(object, 100);

            conventionMock.verifyAll();
        });

        it("should call _cache.set for original object and neste object when _convention.fitsConvention returns true for both", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for teste -> ${object.id}`;
            var nestedKey = `key for teste -> ${object.nested.id}`;
            var dependencyKey = `${nestedKey} -> Dependencies`;
            var time = 100;

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency>>(It.isAny())).returns(() => null).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(dependencyKey, It.isAny(), time)).returns(() => true).verifiable(Times.once());

            cache.add(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });
    });

    describe("update(Object, time)", () => {

        it("it should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => cache.update(nullValue, 100))
                .to
                .throw("parameter value can not be null");
        });

        it("it should throw exception when time is less than zero", () => {
            expect(() => cache.update({}, -1))
                .to
                .throw("parameter time should be greater than zero");
        });

        it("should not call _cache.set when _convetion.fitsConvention returns false", () => {
            var value = {};

            conventionMock
                .setup(convention => convention.fitsConvention(value))
                .returns(() => false)
                .verifiable();

            cache.update(value, 100);

            conventionMock.verifyAll();
        });

        it("should call _cache.set when _convetion.fitsConvention returns true", () => {
            var value = addRandomTypeToObject({ id: 1 });
            var key = "my key"

            conventionMock
                .setup(convention => convention.fitsConvention(value))
                .returns(() => true)
                .verifiable();

            conventionMock
                .setup(convention => convention.createKey(value))
                .returns(() => key)
                .verifiable();

            nodeCacheMock
                .setup(nodeCache => nodeCache.set(key, value, 100))
                .returns(() => true)
                .verifiable();

            cache.update(value, 100);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

    });
});