import { describe, it, expect } from "vitest";
import mergeDeep from "../../src/utils/mergeDeep";

describe("mergeDeep", () => {
  it("merges two simple objects", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const expected = { a: 1, b: 2 };
    expect(mergeDeep({}, obj1, obj2)).toEqual(expected);
  });

  it("overwrites properties in the target with those from the source", () => {
    const target = { a: 1, b: { c: 1 } };
    const source = { b: { d: 2 }, e: 3 };
    const expected = { a: 1, b: { c: 1, d: 2 }, e: 3 };
    expect(mergeDeep(target, source)).toEqual(expected);
  });

  it("performs deep merging", () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 }, d: 3 };
    const expected = { a: { b: 1, c: 2 }, d: 3 };
    expect(mergeDeep(target, source)).toEqual(expected);
  });

  it("does not modify source objects", () => {
    const target = { a: 1 };
    const source = { b: 2 };
    mergeDeep(target, source);
    expect(source).toEqual({ b: 2 });
  });

  it("handles non-object values gracefully", () => {
    const target = { a: 1 };
    const source = "not an object";
    const expected = { a: 1 };
    expect(mergeDeep(target, source as any)).toEqual(expected);
  });

  it("skips merging HTML elements", () => {
    const target = { a: 1 };
    const element = document.createElement("div");
    const source = { b: element };
    const result = mergeDeep({}, target, source);
    expect(result).toEqual({ a: 1, b: element });
    expect(result.b).toBeInstanceOf(HTMLElement);
  });

  it("skips merging functions", () => {
    const target = { a: 1 };
    const source = { b: () => console.log("test") };
    const result = mergeDeep({}, target, source);
    expect(result).toEqual({ a: 1, b: source.b });
    expect(typeof result.b).toBe("function");
  });

  it("correctly merges objects with array properties", () => {
    const target = { a: [1, 2] };
    const source = { a: [3, 4], b: 2 };
    const expected = { a: [3, 4], b: 2 };
    expect(mergeDeep(target, source)).toEqual(expected);
  });

  it("ignores null and undefined sources", () => {
    const target = { a: 1 };
    const resultWithNull = mergeDeep({}, target, null as any);
    const resultWithUndefined = mergeDeep({}, target, undefined as any);
    expect(resultWithNull).toEqual({ a: 1 });
    expect(resultWithUndefined).toEqual({ a: 1 });
  });

  it("does not merge __proto__ properties", () => {
    const target = {};
    const source = JSON.parse('{"__proto__": {"polluted": "yes"}}');
    mergeDeep(target, source);
    expect(({} as any).polluted).toBeUndefined();
  });
});
