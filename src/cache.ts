import * as NodeCache from "node-cache";
import IObjectInspector from "./IObjectInspector";
import Convention from "./convention";
import { notNull, greaterThanZero } from "./check";
import { KeyDependency } from "./keyDependency";

export default class Cache {
    constructor(
        private _cache: NodeCache,
        private _convention: Convention,
        private _objectInspector: IObjectInspector) {

        notNull(this._cache, "_cache");
        notNull(this._convention, "_convention");
        notNull(this._objectInspector, "_objectInspector");
    }

    set(value: Object, time: number): void {
        notNull(value, "value");
        greaterThanZero(time, "time");

        this._objectInspector.inspectObject(value, value => {
            if (this._convention.fitsConvention(value)) {
                var key = this._convention.createKey(value);
                this._cache.set(key, value, time);

                this.updateDependencies(key, value);

                return key;
            }
            else {
                return null;
            }
        }, (value, keyDependency) => {
            if (this._convention.fitsConvention(value)) {
                var key = this._convention.createKey(value);

                this.storeKeyDependency(key, keyDependency, time);
            }
        });
    }

    get<T>(key: string): nullable<T> {
        notNull(key, "key");

        return this._cache.get<T>(key);
    }

    remove(key: string): void {
        notNull(key, "key");

        var keys = new Set<string>();
        this.loadDependencykeysRecursive(keys, key);

        var keysToDelete: string[] = [];
        keys.forEach(key => keysToDelete.push(key));

        this._cache.del(keysToDelete);
    }

    private loadDependencykeysRecursive(keys: Set<string>, key: string): void {
        if (keys.has(key)) {
            return;
        }

        keys.add(key);

        var dependenciesKey = this.createKeyForDependencies(key);
        var dependencies = this._cache.get<KeyDependency[]>(dependenciesKey);
        if (dependencies) {
            for (var i = 0; i < dependencies.length; i++) {
                var keyDependency = dependencies[i];
                this.loadDependencykeysRecursive(keys, keyDependency.dependentKey);
            }
        }
    }

    private updateDependencies(key: string, value: Object): void {
        var dependencyKey = this.createKeyForDependencies(key);

        var dependencies = this._cache.get<KeyDependency[]>(dependencyKey);
        if (dependencies) {
            for (var index = 0; index < dependencies.length; index++) {
                var keyDependency = dependencies[index];

                var owner = this._cache.get(keyDependency.dependentKey);
                if (owner) {
                    keyDependency.setValue(owner, value);
                }
            }
        }
    }

    private storeKeyDependency(key: string, keyDependency: KeyDependency, time: number): void {
        var dependencyKey = this.createKeyForDependencies(key);

        var dependencies = this._cache.get<KeyDependency[]>(dependencyKey);
        if (dependencies) {
            var index = dependencies.findIndex(value => value.dependentKey === keyDependency.dependentKey);
            if (index >= 0) {
                dependencies.splice(index, 1);
            }

            dependencies.push(keyDependency);
        }
        else {
            dependencies = [keyDependency];
        }

        this._cache.set(dependencyKey, dependencies, time);
    }

    private createKeyForDependencies(key: string): string {
        return `${key} -> Dependencies`;
    }
}