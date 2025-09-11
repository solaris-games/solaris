import {anyObject, array, bigInt, just, number, object, or, record, string} from "../../../common/src/validation/validate";

describe("validate", () => {
    it("validates strings correctly", () => {
        const res = string("asdf");

        expect(res).toBe("asdf");
    });

    it("does not accept non-string-values", () => {
        expect(() => string(2)).toThrow();

        expect(() => string({})).toThrow();

        expect(() => string([])).toThrow();

        expect(() => string(true)).toThrow();

        expect(() => string(null)).toThrow();

        expect(() => string(undefined)).toThrow();

        expect(() => string(BigInt(2))).toThrow();
    });

    it("validates numbers correctly", () => {
        const res = number(2);

        expect(res).toBe(2);
    });

    it("does not accept non-number-values", () => {
        expect(() => number("asdf")).toThrow();

        expect(() => number({})).toThrow();

        expect(() => number([])).toThrow();

        expect(() => number(true)).toThrow();

        expect(() => number(null)).toThrow();

        expect(() => number(undefined)).toThrow();

        expect(() => number(BigInt(2))).toThrow();
    });

    it("validates BigInt correctly", () => {
        const res = bigInt(BigInt(2));

        expect(res).toBe(BigInt(2));
    });

    it("does not accept non-BigInt-values", () => {
        expect(() => bigInt("asdf")).toThrow();

        expect(() => bigInt({})).toThrow();

        expect(() => bigInt([])).toThrow();

        expect(() => bigInt(true)).toThrow();

        expect(() => bigInt(null)).toThrow();

        expect(() => bigInt(undefined)).toThrow();

        expect(() => bigInt(2)).toThrow();
    });

    it("validates objects correctly", () => {
        const res = anyObject({});

        expect(res).toEqual({});

        const res2 = anyObject({a: 2, b: "asdf"});

        expect(res2).toEqual({a: 2, b: "asdf"});

        const res3 = anyObject([]);

        expect(res3).toEqual([]);
    });

    it("does not accept non-object-values", () => {
        expect(() => anyObject("asdf")).toThrow();

        expect(() => anyObject(2)).toThrow();

        expect(() => anyObject(true)).toThrow();

        expect(() => anyObject(undefined)).toThrow();

        expect(() => anyObject(null)).toThrow();

        expect(() => anyObject(BigInt(2))).toThrow();
    });

    it("validates just correctly", () => {
        const res = just(2)(2);

        expect(res).toBe(2);

        const res2 = just("asdf")("asdf");

        expect(res2).toBe("asdf");
    });

    it("does not accept non-just-values", () => {
        expect(() => just(2)(3)).toThrow();

        expect(() => just("asdf")("asf")).toThrow();
    });

    it("validates or correctly", () => {
        const val = or(string, number);

        const res1 = val("asdf");
        expect(res1).toBe("asdf");

        const res2 = val(2);
        expect(res2).toBe(2);
    });

    it("does not accept non-or-values", () => {
        const val = or(string, number);

        expect(() => val(true)).toThrow();

        expect(() => val({})).toThrow();

        expect(() => val([])).toThrow();

        expect(() => val(null)).toThrow();

        expect(() => val(undefined)).toThrow();

        expect(() => val(BigInt(2))).toThrow();
    });

    it("validates records correctly", () => {
        const val = record(number);

        const res = val({a: 2, b: 3});
        expect(res).toEqual({a: 2, b: 3});

        expect(val({})).toEqual({});
    });

    it("does not accept non-record-values", () => {
        const val = record(number);

        expect(() => val("asdf")).toThrow();

        expect(() => val(2)).toThrow();

        expect(() => val(true)).toThrow();

        expect(() => val({ a: "test" })).toThrow();
    });

    it("validates arrays correctly", () => {
        const val = array(string);

        const res = val(["a", "b", "c"]);
        expect(res).toEqual(["a", "b", "c"]);

        const res2 = val([]);
        expect(res2).toEqual([]);

        const res3 = val(["a"]);
        expect(res3).toEqual(["a"]);
    });

    it("does not accept non-array-values", () => {
        const val = array(string);

        expect(() => val("asdf")).toThrow();

        expect(() => val(2)).toThrow();

        expect(() => val(true)).toThrow();

        expect(() => val({ a: "test" })).toThrow();

        expect(() => val([12, 43.5])).toThrow();

        expect(() => val(["test", 43.5])).toThrow();
    });

    it("validates objects correctly", () => {
        const val = object({
            a: string,
            b: number
        });

        const res = val({a: "test", b: 2});
        expect(res).toEqual({a: "test", b: 2});
    });

    it("does not accept non-object-values", () => {
        const val = object({
            a: string,
            b: number
        });

        expect(() => val("asdf")).toThrow();

        expect(() => val(2)).toThrow();

        expect(() => val(true)).toThrow();

        expect(() => val({ a: "test" })).toThrow();

        expect(() => val([12, 43.5])).toThrow();

        expect(() => val(["test", 43.5])).toThrow();

        expect(() => val({ c: 2 })).toThrow();
    });

    it("validates nested objects correctly", () => {
        const val = object({
            a: string,
            b: object({
                c: number,
                d: string
            })
        });

        const res = val({a: "test", b: {c: 2, d: "test"}});
        expect(res).toEqual({a: "test", b: {c: 2, d: "test"}});
    });
})