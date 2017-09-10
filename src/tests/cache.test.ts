import { assert, expect } from "chai";
import { IMock, Mock, It, Times, MockBehavior } from "typemoq";
import * as NodeCache from "node-cache";
import { tryGetKey, addRandomTypeToObject } from "./testHelpers";
import Convention from "../convention";
import Cache from "../cache";
import ObjectInspector from "../objectInspector";
import { KeyDependency } from "../keyDependency";
import { ObjectInspectorMock } from "./objectInspectorMock";
import "./array.extensions";

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

    describe("set(Object, number): void", () => {

        it("should throw exception when value is null", () => {
            var nullValue: any = null;
            expect(() => cache.set(nullValue, 0))
                .to
                .throw("parameter value can not be null");
        });

        it("should throw exception when time less than zero", () => {
            expect(() => cache.set({}, -1))
                .to
                .throw("parameter time should be greater than zero");
        });

        it("should not call _cache.set when _convetion.fitsConvention returns false", () => {
            var object = {};

            objectInspectorMock.addObjectFoundCall(objectFound => objectFound(object));

            conventionMock.setup(c => c.fitsConvention(object)).returns(() => false).verifiable(Times.once());

            cache.set(object, 100);

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

            cache.set(object, 100);

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

            cache.set(object, time);

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

            cache.set(object, time);

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

            cache.set(object, time);

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

            cache.set(object, time);

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

            cache.set(object, time);

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

            cache.set(object, time);

            nodeCacheMock.verifyAll();
            keyDependencyMock.verifyAll();
        });
    });

    describe("get<T>(string): T", () => {

        it("should throw when keys is null", () => {
            var key: any = null;
            expect(() => cache.get(key))
                .to
                .throw("parameter key can not be null");
        });

        it("should return null when key does not exists", () => {
            nodeCacheMock.setup(nc => nc.get<nullable<Object>>(It.isAny())).returns(() => null).verifiable();

            var result = cache.get<Object>("non-existing-key");

            assert.isNull(result, "result is not null");
            nodeCacheMock.verifyAll();
        });

        it("should return the object when it exists", () => {
            var key = "key = 1";
            var value = { id: 1 };

            nodeCacheMock.setup(nc => nc.get(key)).returns(() => value).verifiable();

            var result = cache.get<Object>(key);

            assert.isNotNull(result, "result is null");
            assert.equal(result, value, "result and value are not equal");
            nodeCacheMock.verifyAll();
        });
    });

    describe("remove(string): void", () => {

        it("should throw when key is null", () => {
            var key: any = null;
            expect(() => cache.remove(key))
                .to
                .throw("parameter key can not be null");
        });

        it("should only call del for the given key when has no keyDependencies", () => {
            var key = "key = 1";
            var dependencyKey = `${key} -> Dependencies`;

            nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(dependencyKey)).returns(() => null).verifiable();
            nodeCacheMock.setup(nc => nc.del([key])).returns(() => 1).verifiable();

            cache.remove(key);

            nodeCacheMock.verifyAll();
        });

        it("should call del for the given key and for every dependencyKey", () => {
            var key = "key = 1";
            var dependencyKey = `${key} -> Dependencies`;

            var key1Children = ["key = 2", "key = 3", "key = 4", "key = 5"];

            var dependencyKeysObjs = key1Children.map(key => new DummyKeyDependency(key));
            var key1ChildrenDK = key1Children.map(key => `${key} -> Dependencies`);

            nodeCacheMock.setup(nc => nc.get<KeyDependency[]>(dependencyKey)).returns(() => dependencyKeysObjs).verifiable();

            for (var i = 0; i < key1ChildrenDK.length; i++) {
                nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(key1ChildrenDK[i])).returns(() => null).verifiable();
            }

            var keysToDelete = ["key = 1", "key = 2", "key = 3", "key = 4", "key = 5"];
            nodeCacheMock.setup(nc => nc.del(keysToDelete)).returns(() => keysToDelete.length).verifiable();

            cache.remove(key);

            nodeCacheMock.verifyAll();
        });

        it("should call del for the given key and for every dependencyKey recursively", () => {
            var key = "key = 1";
            var dependencyKey = `${key} -> Dependencies`;

            var key1Children = ["key = 2", "key = 3", "key = 4"];
            var key1ChildrenObjs = key1Children.map(key => new DummyKeyDependency(key));
            var key1ChildrenDK = key1Children.map(key1Child => `${key1Child} -> Dependencies`);

            var key2Children = ["key = 5", "key = 6", "key = 7"];
            var key2ChildrenObjs = key2Children.map(key => new DummyKeyDependency(key));

            var key3Children = ["key = 5", "key = 8", "key = 9"];
            var key3ChildrenObjs = key3Children.map(key => new DummyKeyDependency(key));

            var key4Children = [] as string[];
            var key4ChildrenObjs = key4Children.map(key => new DummyKeyDependency(key));

            nodeCacheMock.setup(nc => nc.get<KeyDependency[]>(dependencyKey)).returns(() => key1ChildrenObjs).verifiable();
            nodeCacheMock.setup(nc => nc.get<KeyDependency[]>(key1ChildrenDK[0])).returns(() => key2ChildrenObjs).verifiable();
            nodeCacheMock.setup(nc => nc.get<KeyDependency[]>(key1ChildrenDK[1])).returns(() => key3ChildrenObjs).verifiable();
            nodeCacheMock.setup(nc => nc.get<KeyDependency[]>(key1ChildrenDK[2])).returns(() => key4ChildrenObjs).verifiable();

            var nullKeyDependencies = ["key = 5", "key = 6", "key = 7", "key = 8", "key = 9"].map(key => `${key} -> Dependencies`);
            for (var i = 0; i < nullKeyDependencies.length; i++) {
                nodeCacheMock.setup(nc => nc.get<nullable<KeyDependency[]>>(nullKeyDependencies[i])).returns(() => null).verifiable();
            }

            var keysToDelete = [key]
                .concat(key1Children, key2Children, key3Children, key4Children)
                .distinct();

            var matchArray = It.is<any[]>(keys => !keysToDelete.except(keys).any() && !keys.except(keysToDelete).any())

            nodeCacheMock.setup(nc => nc.del(matchArray)).returns(() => dependencyKey.length).verifiable();

            cache.remove(key);

            nodeCacheMock.verifyAll();
        });
    });
});

class DummyKeyDependency extends KeyDependency {
    constructor(public dependentKey: string) {
        super();
    }

    getValue(owner: Object): Object | null {
        throw new Error("Method not implemented.");
    }
    setValue(owner: Object, value: any): void {
        throw new Error("Method not implemented.");
    }
}