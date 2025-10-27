import type {RandomGen} from "./random";

export function getOrInsert<K, V>(map: Map<K, V>, key: K, defaultFunc: (arg0: K) => V): V {
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

export const maxBy = <T>(max: (a: T) => number, list: T[]): number => {
    let lastScore = Number.MIN_SAFE_INTEGER;
    for (let el of list) {
        const elScore = max(el);
        if (elScore > lastScore) {
            lastScore = elScore;
        }
    }

    return lastScore;
}

export const minBy = <T>(min: (a: T) => number, list: T[]): number => {
    let lastScore = Number.MAX_SAFE_INTEGER;
    for (let el of list) {
        const elScore = min(el);
        if (elScore < lastScore) {
            lastScore = elScore;
        }
    }

    return lastScore;
}

export function maxOf<T>(max: (arg0: T) => number, list: T[]): T | undefined {
    let lastScore = Number.MIN_SAFE_INTEGER;
    let largest: T | undefined = undefined;

    for (let el of list) {
        const elScore = max(el);
        if (elScore > lastScore) {
            lastScore = elScore;
            largest = el;
        }
    }

    return largest;
}


export function reverseSort<A>(sorter: (a: A, b: A) => number): (a: A, b: A) => number {
    return (a, b) => sorter(b, a);
}

export function notNull<T>(val: T | null): val is T {
    return val !== null;
}

export function sorterByProperty<T>(prop: keyof T): (a: T, b: T) => number {
    return (a, b) => {
        if (a[prop] < b[prop]) {
            return -1;
        } else if (a[prop] > b[prop]) {
            return 1;
        } else {
            return 0;
        }
    }
}

export function shuffle<T>(rand: RandomGen, a: Array<T>) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const groupBy = <T, K>(list: T[], keyFunc: (item: T) => K): Map<K, T[]> => {
    const map = new Map<K, T[]>();

    for (const item of list) {
        const key = keyFunc(item);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)!.push(item);
    }

    return map;
}