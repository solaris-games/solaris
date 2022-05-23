export function getOrInsert<K, V>(map: Map<K, V>, key: K, defaultFunc: (K) => V): V {
    let value = map.get(key);
    if (!value) {
        value = defaultFunc(key);
        map.set(key, value);
    }
    return value;
}

export function intersectionOfSets<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set(Array.from(a).filter(x => b.has(x)));
}

export function maxBy<T>(max: (T) => number, list: T[]): number {
    let lastScore = Number.MIN_SAFE_INTEGER;
    for (let el of list) {
        const elScore = max(el);
        if (elScore > lastScore) {
            lastScore = elScore;
        }
    }

    return lastScore;
}

export function minBy<T>(min: (T) => number, list: T[]): number {
    let lastScore = Number.MAX_SAFE_INTEGER;
    for (let el of list) {
        const elScore = min(el);
        if (elScore < lastScore) {
            lastScore = elScore;
        }
    }

    return lastScore;
}

export function reverseSort<A>(sorter: (a: A, b: A) => number): (a: A, b: A) => number {
    return (a, b) => sorter(b, a);
}

export function notNull<T>(val: T | null): val is T {
    return val !== null;
}