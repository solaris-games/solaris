export function makeCastFunc<T>(): (value: string) => T {
    return cast<T>;
}

function cast<T>(value: string): T {
    return value as T;
}