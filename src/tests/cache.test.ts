import { assert, expect } from "chai";
import { IMock, Mock, It, Times, MockBehavior } from "typemoq";
import * as NodeCache from "node-cache";
import { tryGetKey, addRandomTypeToObject } from "./testHelpers";
import Convention from "../convention";
import Cache from "../cache";
import ObjectInspector from "../objectInspector";
import { KeyDependency } from "../keyDependency";
import { ObjectInspectorMock } from "./objectInspectorMock";

describe("Cache", () => {
    var cache: Cache;
    var nodeCacheMock: IMock<NodeCache>;
    var conventionMock: IMock<Convention>;
    var objectInspectorMock: ObjectInspectorMock;

    beforeEach(() => {
        nodeCacheMock = Mock.ofType<NodeCache>(NodeCache, MockBehavior.Strict);
        conventionMock = Mock.ofType<Convention>(Convention, MockBehavior.Strict, ["", ""]);
        objectInspectorMock = new ObjectInspectorMock();
        cache = new Cache(nodeCacheMock.object, conventionMock.object, objectInspectorMock);
    });

    describe("constructor(NodeCache)", () => {

        it("it should throw exception when _cache is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nullValue, conventionMock.object, objectInspectorMock))
                .to
                .throw("parameter _cache can not be null");
        });

        it("it should throw exception when _convention is null", () => {
            var nullValue: any = null;
            expect(() => new Cache(nodeCacheMock.object, nullValue, objectInspectorMock))
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

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => false).verifiable(Times.once());

            cache.add(object, 100);

            nodeCacheMock.verify(nc => nc.set(It.isAny(), It.isAny(), It.isAny()), Times.never());
        });

        it("should call _cache.set when _convetion.fitsConvention returns true", () => {
            var object = addRandomTypeToObject({ id: 1 });

            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;

            objectInspectorMock
                .addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(c => c.createKey(object)).returns(() => key).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.set(key, object, 100)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => null).verifiable();

            cache.add(object, 100);

            conventionMock.verifyAll();
        });

        it("should add a new array of KeyDependency on the cache when object on nested property fits convention", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var nestedKey = `key for test -> ${object.nested.id}`;
            var dependencyKey = `${nestedKey} -> Dependencies`;
            var dependencyKeyMock = Mock.ofType<KeyDependency>();
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, dependencyKeyMock.object))

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(It.isAny())).returns(() => null).verifiable(Times.atLeastOnce());
            nodeCacheMock.setup(nc => nc.set(dependencyKey, [dependencyKeyMock.object], time)).returns(() => true).verifiable(Times.once());

            cache.add(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should add a KeyDependency to already existing array on the cache when object on nested property fits convention", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var objectDependencyKey = `${objectKey} -> Dependencies`;
            var nestedKey = `key for testobjectKey -> ${object.nested.id}`;
            var nestedDependencyKey = `${nestedKey} -> Dependencies`;
            var oldKeyDependencyMock = Mock.ofType<KeyDependency>();
            var keyDependency = Mock.ofType<KeyDependency>().object;
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, keyDependency));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(objectDependencyKey)).returns(() => null).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nestedDependencyKey)).returns(() => [oldKeyDependencyMock.object]).verifiable(Times.atLeastOnce());
            oldKeyDependencyMock.setup(d => d.dependentKey).returns(() => "ownerKey").verifiable();
            nodeCacheMock.setup(nc => nc.get<any>("ownerKey")).returns(() => null).verifiable();

            nodeCacheMock.setup(nc => nc.set(nestedDependencyKey, [oldKeyDependencyMock.object, keyDependency], time)).returns(() => true).verifiable(Times.once());

            cache.add(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should replace when KeyDependency already exists", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var objectDependencyKey = `${objectKey} -> Dependencies`;
            var nestedKey = `key for test -> ${object.nested.id}`;
            var nestedDependencyKey = `${nestedKey} -> Dependencies`;
            var oldKeyDependencyMock = Mock.ofType<KeyDependency>();
            var newKeyDependencyMock = Mock.ofType<KeyDependency>();
            var time = 100;

            oldKeyDependencyMock.setup(keyDependency => keyDependency.dependentKey).returns(() => objectKey).verifiable();
            newKeyDependencyMock.setup(keyDependency => keyDependency.dependentKey).returns(() => objectKey).verifiable();

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, newKeyDependencyMock.object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(objectDependencyKey)).returns(() => null).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nestedDependencyKey)).returns(() => [oldKeyDependencyMock.object]).verifiable(Times.atLeastOnce());
            nodeCacheMock.setup(nodeCache => nodeCache.get<any>(objectKey)).returns(() => null).verifiable();

            nodeCacheMock.setup(nc => nc.set(nestedDependencyKey, [newKeyDependencyMock.object], time)).returns(() => true).verifiable(Times.once());

            cache.add(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should do nothing when trying to update KeyDependency but has none", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(c => c.createKey(object)).returns(() => key).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.set(key, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => null).verifiable();

            cache.add(object, time);

            nodeCacheMock.verifyAll();
        });

        it("should do nothing when trying to update KeyDependency but dependentKey does not exists in the cache", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var ownerKey = "owner key";
            var time = 100;
            var keyDependencyMock = Mock.ofType<KeyDependency>();

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(convention => convention.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(convention => convention.createKey(object)).returns(() => key).verifiable(Times.once());

            nodeCacheMock.setup(nodeCache => nodeCache.set(key, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nodeCache => nodeCache.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => [keyDependencyMock.object]).verifiable();

            keyDependencyMock.setup(dependency => dependency.dependentKey).returns(() => ownerKey).verifiable();

            nodeCacheMock.setup(nodeCache => nodeCache.get<any>(ownerKey)).returns(() => null).verifiable();

            cache.add(object, time);

            nodeCacheMock.verifyAll();
            keyDependencyMock.verifyAll();
        });

        it("should call setValue no KeyDependency when dependencyKey exists in cache", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var ownerKey = "owner key";
            var ownerObject = {};
            var time = 100;
            var keyDependencyMock = Mock.ofType<KeyDependency>();

            objectInspectorMock
                .addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(c => c.createKey(object)).returns(() => key).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(key, object, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => [keyDependencyMock.object]).verifiable();

            keyDependencyMock.setup(d => d.dependentKey).returns(() => ownerKey).verifiable();
            nodeCacheMock.setup(nc => nc.get<any>(ownerKey)).returns(() => ownerObject).verifiable();
            keyDependencyMock.setup(kd => kd.setValue(ownerObject, object)).verifiable();

            cache.add(object, time);

            nodeCacheMock.verifyAll();
            keyDependencyMock.verifyAll();
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

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(value));

            conventionMock.setup(convention => convention.fitsConvention(value)).returns(() => false).verifiable();

            cache.update(value, 100);

            conventionMock.verifyAll();
        });

        it("should call _cache.set when _convetion.fitsConvention returns true", () => {
            var value = addRandomTypeToObject({ id: 1 });
            var key = "my key";
            var dependencyKey = `${key} -> Dependencies`;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(value));

            conventionMock.setup(convention => convention.fitsConvention(value)).returns(() => true).verifiable();
            conventionMock.setup(convention => convention.createKey(value)).returns(() => key).verifiable();

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => null).verifiable();
            nodeCacheMock.setup(nc => nc.set(key, value, 100)).returns(() => true).verifiable();

            cache.update(value, 100);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should add a new array of KeyDependency on the cache when object on nested property fits convention", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var nestedKey = `key for test -> ${object.nested.id}`;
            var dependencyKey = `${nestedKey} -> Dependencies`;
            var dependencyKeyMock = Mock.ofType<KeyDependency>();
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, dependencyKeyMock.object))

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(It.isAny())).returns(() => null).verifiable(Times.atLeastOnce());
            nodeCacheMock.setup(nc => nc.set(dependencyKey, [dependencyKeyMock.object], time)).returns(() => true).verifiable(Times.once());

            cache.update(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should add a KeyDependency to already existing array on the cache when object on nested property fits convention", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var objectDependencyKey = `${objectKey} -> Dependencies`;
            var nestedKey = `key for test -> ${object.nested.id}`;
            var nestedDependencyKey = `${nestedKey} -> Dependencies`;
            var oldKeyDependencyMock = Mock.ofType<KeyDependency>();
            var keyDependency = Mock.ofType<KeyDependency>().object;
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, keyDependency));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(objectDependencyKey)).returns(() => null).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nestedDependencyKey)).returns(() => [oldKeyDependencyMock.object]).verifiable(Times.atLeastOnce());
            oldKeyDependencyMock.setup(d => d.dependentKey).returns(() => "ownerKey").verifiable();
            nodeCacheMock.setup(nc => nc.get<any>("ownerKey")).returns(() => null).verifiable();

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nestedDependencyKey)).returns(() => [oldKeyDependencyMock.object]).verifiable(Times.atLeastOnce());
            nodeCacheMock.setup(nc => nc.set(nestedDependencyKey, [oldKeyDependencyMock.object, keyDependency], time)).returns(() => true).verifiable(Times.once());

            cache.update(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should replace when KeyDependency already exists", () => {
            var object = addRandomTypeToObject({ id: 1, nested: addRandomTypeToObject({ id: 2 }) });

            var objectKey = `key for test -> ${object.id}`;
            var objectDependencyKey = `${objectKey} -> Dependencies`;
            var nestedKey = `key for test -> ${object.nested.id}`;
            var nestedDependencyKey = `${nestedKey} -> Dependencies`;
            var oldKeyDependencyMock = Mock.ofType<KeyDependency>();
            var newKeyDependencyMock = Mock.ofType<KeyDependency>();
            var time = 100;

            oldKeyDependencyMock.setup(keyDependency => keyDependency.dependentKey).returns(() => objectKey).verifiable();
            newKeyDependencyMock.setup(keyDependency => keyDependency.dependentKey).returns(() => objectKey).verifiable();

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));
            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object.nested));

            objectInspectorMock
                .addKeyDependencyFoundCalls(dependencyKeyFound => dependencyKeyFound(object.nested, newKeyDependencyMock.object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.fitsConvention(object.nested)).returns(() => true).verifiable(Times.atLeastOnce());

            conventionMock.setup(c => c.createKey(object)).returns(() => objectKey).verifiable(Times.atLeastOnce());
            conventionMock.setup(c => c.createKey(object.nested)).returns(() => nestedKey).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.set(objectKey, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(nestedKey, object.nested, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(objectDependencyKey)).returns(() => null).verifiable(Times.atLeastOnce());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nestedDependencyKey)).returns(() => [oldKeyDependencyMock.object]).verifiable(Times.atLeastOnce());
            nodeCacheMock.setup(nodeCache => nodeCache.get<any>(objectKey)).returns(() => null).verifiable();

            nodeCacheMock.setup(nc => nc.set(nestedDependencyKey, [newKeyDependencyMock.object], time)).returns(() => true).verifiable(Times.once());

            cache.update(object, time);

            conventionMock.verifyAll();
            nodeCacheMock.verifyAll();
        });

        it("should do nothing when trying to update KeyDependency but has none", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var time = 100;

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(c => c.createKey(object)).returns(() => key).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.set(key, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => null).verifiable();

            cache.update(object, time);

            nodeCacheMock.verifyAll();
        });

        it("should do nothing when trying to update KeyDependency but dependentKey does not exists in the cache", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var ownerKey = "owner key";
            var time = 100;
            var keyDependencyMock = Mock.ofType<KeyDependency>();

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(convention => convention.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(convention => convention.createKey(object)).returns(() => key).verifiable(Times.once());

            nodeCacheMock.setup(nodeCache => nodeCache.set(key, object, time)).returns(() => true).verifiable(Times.once());
            nodeCacheMock.setup(nodeCache => nodeCache.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => [keyDependencyMock.object]).verifiable();

            keyDependencyMock.setup(dependency => dependency.dependentKey).returns(() => ownerKey).verifiable();

            nodeCacheMock.setup(nodeCache => nodeCache.get<any>(ownerKey)).returns(() => null).verifiable();

            cache.update(object, time);

            nodeCacheMock.verifyAll();
            keyDependencyMock.verifyAll();
        });

        it("should call setValue no KeyDependency when dependencyKey exists in cache", () => {
            var object = addRandomTypeToObject({ id: 1 });
            var key = "teste key";
            var dependencyKey = `${key} -> Dependencies`;
            var ownerKey = "owner key";
            var ownerObject = {};
            var time = 100;
            var keyDependencyMock = Mock.ofType<KeyDependency>();

            objectInspectorMock
                .addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => true).verifiable(Times.once());
            conventionMock.setup(c => c.createKey(object)).returns(() => key).verifiable(Times.once());
            nodeCacheMock.setup(nc => nc.set(key, object, time)).returns(() => true).verifiable(Times.once());

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => [keyDependencyMock.object]).verifiable();

            keyDependencyMock.setup(d => d.dependentKey).returns(() => ownerKey).verifiable();
            nodeCacheMock.setup(nc => nc.get<any>(ownerKey)).returns(() => ownerObject).verifiable();
            keyDependencyMock.setup(kd => kd.setValue(ownerObject, object)).verifiable();

            cache.update(object, time);

            nodeCacheMock.verifyAll();
            keyDependencyMock.verifyAll();
        });
    });
});