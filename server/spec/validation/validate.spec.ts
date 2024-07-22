import {anyObject, bigInt, just, number, or, string} from "../../api/validate";

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
})