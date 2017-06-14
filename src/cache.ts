import * as NodeCache from "node-cache";
import ObjectInspector from "./objectInspector";
import { notNull, greaterThanZero } from "./check";

export default class Cache {
    constructor(private _cache: NodeCache) {
        notNull(this._cache, "_cache");
    }

    add(value: Object, time: number): void {
        notNull(value, "value");
        greaterThanZero(time, "time");
    }
}