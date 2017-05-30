interface CacheItems {
    [key: string]: CacheItem
}

interface CacheItem {
    key: string;
    value: any;
    date: Date;
}