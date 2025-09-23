import { ValidationError } from "./error";

export type Validator<T> = (value: any) => T;

const failed = (expected: string, value: any) => {
    const got = value === null ? "null" : value === undefined ? "undefined" : value.toString().substring(1000);

    return new ValidationError(`Expected ${expected}, but got: ${got} (type ${typeof value})`);
}

export const ok = <T>(value: T): Validator<T> => {
    return (_) => value;
}

const primitive = (t: string) => (value: any) => {
    if (value === null || value === undefined || typeof value !== t) {
        throw failed(t, value);
    }

    return value;
}

export const string: Validator<string> = primitive("string");

export const number: Validator<number> = primitive("number");

export const boolean: Validator<boolean> = primitive("boolean");

export const bigInt: Validator<BigInt> = primitive("bigint")

export const anyObject: Validator<Object> = primitive("object");

export const date: Validator<Date> = v => {
    if (typeof v === "string") {
        return new Date(v);
    }

    throw failed("date", v);
}


export const map = <A, B>(mapper: (a: A) => B, validator: Validator<A>): Validator<B> => {
    return v => mapper(validator(v));
}

export const bind = <A, B>(binder: (a: A) => Validator<B>, validator: Validator<A>): Validator<B> => {
    return v => {
        const res: A = validator(v);
        const bi: Validator<B> = binder(res);
        return bi(v);
    }
}

export const named = <A>(name: string, validator: Validator<A>) => {
    return (v: any) => {
        try {
            return validator(v);
        } catch (e) {
            throw new ValidationError(`${name} validation failed: ${e}`);
        }
    }
}

export const andR = <A, B>(a: Validator<A>, b: Validator<B>): Validator<B> => {
    return v => {
        a(v);
        return b(v);
    }
}

export const andL = <A, B>(a: Validator<A>, b: Validator<B>): Validator<A> => {
    return v => {
        b(v);
        return a(v);
    }
}

export const or = <A, B>(a: Validator<A>, b: Validator<B>): Validator<A | B> => {
    return v => {
        try {
            return a(v);
        } catch (e) {
            return b(v);
        }
    }
}

export const nullish: Validator<null> = v => {
    if (v === null || v === undefined) {
        return null;
    }

    throw failed("null or undefined", v);
}

export const undefinedish: Validator<undefined> = v => {
    if (v === undefined || v === null) {
        return undefined;
    }

    throw failed("null or undefined", v);
}

export const maybeNull = <A>(validator: Validator<A>): Validator<A | null> => or(validator, nullish);

export const maybeUndefined = <A>(validator: Validator<A>): Validator<A | undefined> => or(validator, undefinedish);

export const just = <A>(value: A): Validator<A> => {
    return v => {
        if (v !== value) {
            throw failed(`${value}`, v);
        }

        return value;
    }
}

export const record = <A>(validator: Validator<A>): Validator<Record<string, A>> => {
    return v => {
        if (typeof v !== "object") {
            throw failed("object", v);
        }

        const res: Record<string, A> = {};

        for (const key in v) {
            res[key] = validator(v[key]);
        }

        return res;
    }
}

export const array = <A>(validator: Validator<A>): Validator<A[]> => {
    return v => {
        if (!Array.isArray(v)) {
            throw failed("array", v);
        }

        return v.map(validator);
    }
}

export type ObjectValidator<T> = {
    [Property in keyof T]: Validator<T[Property]>
}

export const object = <T>(objValidator: ObjectValidator<T>): Validator<T> => {
    return v => {
        if (typeof v !== "object") {
            throw failed("object", v);
        }

        let n: any = {};

        for (const key of Object.keys(objValidator)) {
            try {
                const validator: Validator<any> = objValidator[key as keyof T];
                n[key] = validator(v[key]);
            } catch (e) {
                const err = e as ValidationError;
                throw new ValidationError(`Error in field ${key}: ${err.message}`);
            }
        }

        return n;
    }
}

export const stringEnumeration = <A extends string, M extends A[]>(members: readonly [any, ...M]): Validator<A> => {
    return v => {
        const s = string(v);
        if (members.includes(s as A)) {
            return s as A;
        } else {
            throw failed(members.join(", "), v)
        }
    }
}

export const numberEnumeration = <A extends number, M extends A[]>(members: readonly [any, ...M]): Validator<A> => {
    return v => {
        const n = number(v);
        if (members.includes(n as A)) {
            return n as A;
        }

        throw failed(members.join(", "), v)
    }
}

type NumberValidationProps = {
    sign?: 'positive' | 'negative',
    integer?: boolean,
    range?: {
        from?: number,
        to?: number
    },
}

export const numberAdv = (props: NumberValidationProps) => (v: any) => {
    const n = number(v);

    if (props.sign) {
        const sign = Math.sign(n);
        if (props.sign === 'positive') {
            if (sign === -1) {
                throw failed('positive number', v);
            }
        } else if (props.sign === 'negative') {
            if (sign !== -1) {
                throw failed('negative number', v);
            }
        }
    }

    if (props.integer) {
        if (!Number.isInteger(n)) {
            throw failed('integer', v);
        }
    }

    if (props.range) {
        if (props.range.from !== undefined) {
            if (n < props.range.from) {
                throw failed(`number over ${props.range.from}`, v);
            }
        }

        if (props.range.to !== undefined) {
            if (n > props.range.to) {
                throw failed(`number below ${props.range.to}`, v);
            }
        }
    }

    return n;
}

export const positiveInteger = numberAdv({
    integer: true,
    sign: 'positive'
});

export const withDefault = <A>(defaultValue: A, validator: Validator<A>): Validator<A> => {
    return v => {
        if (v === undefined || v === null) {
            return defaultValue;
        }

        return validator(v);
    }
}

type StringValidationProps = {
    minLength?: number,
    maxLength?: number,
    trim?: boolean,
    ignoreForLengthCheck?: RegExp,
    matches?: RegExp,
}

export const stringValue = (props: StringValidationProps) => (v: any) => {
    let s = string(v);

    if (props.trim) {
        s = s.trim();
    }

    let sForLengthCheck = s;

    if (props.ignoreForLengthCheck) {
        sForLengthCheck = sForLengthCheck.replace(props.ignoreForLengthCheck, '');
    }

    if (props.minLength && sForLengthCheck.length < props.minLength) {
        throw failed(`string with length at least ${props.minLength}`, v);
    }

    if (props.maxLength && sForLengthCheck.length > props.maxLength) {
        throw failed(`string with length at most ${props.maxLength}`, v);
    }

    if (props.matches && !props.matches.test(s)) {
        throw failed(`string matching ${props.matches}`, v);
    }

    return s
}

export const UNICODE_PRINTABLE_CHARACTERS_NON_WHITESPACE =  /^[\p{L}\p{N}\p{M}\p{Cf}\p{S}\p{P}]+$/u;

export const UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE = /^[\p{L}\p{N}\p{M}\p{Cf}\p{S}\p{P}\p{Z}]+$/u;

export const UNICODE_INVISIBLE_CHARACTERS = /[\p{C}\p{Mn}\p{Me}]+/u;

export const UNICODE_LETTERS_NUMBERS_PUNCTUATION = /^[\p{L}\p{N}\p{P}]+$/u;

export const username = stringValue({
    minLength: 3,
    maxLength: 30,
    trim: true,
    matches: UNICODE_LETTERS_NUMBERS_PUNCTUATION,
});

export const email = stringValue({
    minLength: 3,
    maxLength: 100,
    trim: true,
    matches: /^.+@.+$/u,
});

export const password = stringValue({
    minLength: 8,
    maxLength: 100,
    matches: UNICODE_PRINTABLE_CHARACTERS_NON_WHITESPACE,
});