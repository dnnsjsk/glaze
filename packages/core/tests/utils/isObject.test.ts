import { describe, it, expect } from "vitest";
import isObject from "../../src/utils/isObject";

describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ key: "value" })).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it("returns false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isObject(undefined)).toBe(false);
  });

  it("returns false for HTMLElements", () => {
    const element = document.createElement("div");
    expect(isObject(element)).toBe(false);
  });

  it("returns false for other non-object types", () => {
    expect(isObject(123)).toBe(false);
    expect(isObject("string")).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(Symbol("symbol"))).toBe(false);
  });
});
