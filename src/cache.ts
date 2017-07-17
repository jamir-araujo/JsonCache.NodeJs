import * as NodeCache from "node-cache";
import ObjectInspector from "./objectInspector";
import Convention from "./convention";
import { notNull, greaterThanZero } from "./check";
import { KeyDependency } from "./keyDependency";

export default class Cache {
    constructor(
        private _cache: NodeCache,
        private _convention: Convention,
        private _objectInspector: ObjectInspector) {

        notNull(this._cache, "_cache");
        notNull(this._convention, "_convention");
        notNull(this._objectInspector, "_objectInspector");
    }

    add(value: Object, time: number): void {
        notNull(value, "value");
        greaterThanZero(time, "time");

        this._objectInspector.inspectObject(value, value => {
            if (this._convention.fitsConvention(value)) {
                var key = this._convention.createKey(value);
                this._cache.set(key, value, time);

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

    update(value: Object, time: number): void {
        notNull(value, "value");
        greaterThanZero(time, "time");

        this._objectInspector.inspectObject(value, value => {
            if (this._convention.fitsConvention(value)) {
                return null;
            }
            else {
                return null;
            }
        }, (value, keyDependency) => {

        });
    }

    private storeKeyDependency(key: string, keyDependency: KeyDependency, time: number): void {
        var dependencyKey = this.createKeyForDependencies(key);

        var dependencies = this._cache.get<KeyDependency[]>(dependencyKey);
        if (dependencies) {
            this._cache.del(dependencyKey);

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