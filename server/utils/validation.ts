import {
    map,
    numberAdv,
    string,
    ValidationError,
    Validator,
    type NumberValidationProps,
} from "@solaris/common";
import { DBObjectId, objectIdFromString } from "../services/types/DBObjectId";

export const objectId: Validator<DBObjectId> = map(objectIdFromString, string);

/**
 * Query parameters arrive as strings. Coerces the value with Number() and
 * rejects non-numeric values (NaN), then applies the given number validation.
 */
export const integerFromQueryString = (
    props: NumberValidationProps,
): Validator<number> =>
    map(
        (n: number) => {
            if (!Number.isFinite(n)) {
                throw new ValidationError(
                    "Expected a number, but got a non-numeric value.",
                );
            }

            return numberAdv(props)(n);
        },
        map(Number, string),
    );

/**
 * Same as integerFromQueryString, but treats null, undefined and empty
 * strings as absent, resolving to the given default value.
 */
export const integerFromQueryStringOrDefault =
    <A>(defaultValue: A, props: NumberValidationProps): Validator<A | number> =>
    (v) => {
        if (v === undefined || v === null || v === "") {
            return defaultValue;
        }

        return integerFromQueryString(props)(v);
    };
