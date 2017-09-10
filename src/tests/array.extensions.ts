
interface Array<T> {
    except(array: T[]): T[];
    any(): boolean;
    distinct(): T[];
}

Array.prototype.except = function (this: any[], array: any[]): any[] {
    var set = new Set();

    array.forEach(item => set.add(item));

    var result = [];
    for (var i = 0; i < this.length; i++) {
        if (!set.has(this[i])) {
            result.push(this[i]);
        }
    }

    return result;
};

Array.prototype.any = function (this: any[]): boolean {
    return this.length > 0;
}

Array.prototype.distinct = function(this: any[]): any[] {
    var set = new Set();

    this.forEach(item => set.add(item));

    var result: any[] = [];
    set.forEach(item => result.push(item));

    return result;
}