import { describe, it, expect, vi } from "vitest";
import castValue from "../../../src/utils/castValue.ts";
import getSelectorOrElement from "../../../src/utils/getSelectorOrElement.ts";

vi.mock("../../../src/utils/getSelectorOrElement", () => ({
  default: vi.fn((_element, selector) => {
    return `Mocked: ${selector}`;
  }),
}));

describe("castValue", () => {
  it('returns boolean true for "true" string', () => {
    expect(castValue("true", document.createElement("div"), "")).toBe(true);
  });

  it('returns boolean false for "false" string', () => {
    expect(castValue("false", document.createElement("div"), "")).toBe(false);
  });

  it("returns a number for numeric string", () => {
    expect(castValue("123", document.createElement("div"), "")).toBe(123);
  });

  it("returns a float for floating point string", () => {
    expect(castValue("123.45", document.createElement("div"), "")).toBe(123.45);
  });

  it("cleans up and returns the original string without brackets and underscores", () => {
    expect(castValue("[hello_world]", document.createElement("div"), "")).toBe(
      "hello world",
    );
  });

  it('returns the result of getSelectorOrElement for strings starting with "&"', () => {
    const element = document.createElement("div");
    const result = castValue("&selector", element, "trigger");
    expect(getSelectorOrElement).toHaveBeenCalledWith(
      element,
      "&selector",
      true,
    );
    expect(result).toBe("Mocked: &selector");
  });
});
