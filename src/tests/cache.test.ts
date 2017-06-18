import { assert, expect } from "chai";
import { IMock, Mock, It, Times } from "typemoq";
import * as NodeCache from "node-cache";
import { tryGetKey, addRandomTypeToObject } from "./testHelpers";
import Convention from "../convention";
import Cache from "../cache";


describe("Cache", () => {
    var cache: Cache;
    var nodeCacheMock: IMock<NodeCache>;
    var conventionMock: IMock<Convention>;

    beforeEach(() => {
        nodeCacheMock = Mock.ofType<NodeCache>();
        conventionMock = Mock.ofType<Convention>();
        cache = new Cache(nodeCacheMock.object, conventionMock.object);
    });

    describe("constructor(NodeCache)", () => {

        it("it should throw exception when _cache is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nullValue, conventionMock.object))
                .to
                .throw("parameter _cache can not be null");
        });

        it("it should throw exception when _convention is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nodeCacheMock.object, nullValue))
                .to
                .throw("parameter _convention can not be null");
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
            var nullValue: any = null;
            expect(() => cache.add({}, -1))
                .to
                .throw("parameter time should be greater than zero");
        });

        it("should add item to the _cache", () => {
            var complexObject = addRandomTypeToObject({ id: 1 });
            var key = tryGetKey(complexObject) as string;
            var time = 100;

            var expectedInvocation = (nodeCache: NodeCache) => nodeCache.set(key, complexObject, time);

            nodeCacheMock
                .setup(expectedInvocation)
                .returns(() => true);

            conventionMock
                .setup(convention => convention.createKey(complexObject))
                .returns(() => key);

            cache.add(complexObject, time);

            nodeCacheMock.verify(expectedInvocation, Times.once());
        });
    });
});