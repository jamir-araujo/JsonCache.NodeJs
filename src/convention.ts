import { notNull, notEmpty } from "./check";

export default class Convention {
    constructor(private _properties: string[]) {
        notNull(this._properties, "_properties");
        notEmpty(this._properties, "_properties");
    }

    fitsConvention(value: Object): boolean {
        notNull(value, "value");

        for (var index = 0; index < this._properties.length; index++) {
            var property = this._properties[index];
            if (!value.hasOwnProperty(property)) {
                return false;
            }
        }

        return true;
    }

    createKey(value: Object): string {
        if (!this.fitsConvention(value)) {
            this.throwNotFitsConventionError();
        }

        var values = this._properties
            .map<string>(property => value[property].toString());

        return values.join(" -> ");
    }

    private throwNotFitsConventionError() {
        throw "Object do not fits convention";
    }
}