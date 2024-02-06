import { describe, it, expect } from "vitest";
import getSelectorFromBracket from "../../src/utils/getSelectorFromBracket";

describe("getSelectorFromBracket", () => {
  it("extracts content and restOfString for matching inputs", () => {
    const input = "[button]:hover";
    const expected = {
      content: "button",
      restOfString: "hover",
    };
    const result = getSelectorFromBracket(input);
    expect(result).toEqual(expected);
  });

  it("returns null for inputs that do not match the pattern", () => {
    const input = "button:hover";
    const result = getSelectorFromBracket(input);
    expect(result).toBeNull();
  });

  it("handles inputs with multiple colons correctly", () => {
    const input = "[icon]:before:hover";
    const expected = {
      content: "icon",
      restOfString: "before:hover",
    };
    const result = getSelectorFromBracket(input);
    expect(result).toEqual(expected);
  });

  it("returns null for empty strings", () => {
    const input = "";
    const result = getSelectorFromBracket(input);
    expect(result).toBeNull();
  });

  it("returns null for strings without a colon", () => {
    const input = "[button]";
    const result = getSelectorFromBracket(input);
    expect(result).toBeNull();
  });
});
