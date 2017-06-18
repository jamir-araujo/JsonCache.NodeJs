import * as NodeCache from "node-cache";
import ObjectInspector from "./objectInspector";
import Convention from "./convention";
import { notNull, greaterThanZero } from "./check";

export default class Cache {
    constructor(private _cache: NodeCache, private _convention: Convention) {
        notNull(this._cache, "_cache");
        notNull(this._convention, "_convention");
    }

    add(value: Object, time: number): void {
        notNull(value, "value");
        greaterThanZero(time, "time");

        var key = this._convention.createKey(value);
        this._cache.set(key, value, time);
    }
}