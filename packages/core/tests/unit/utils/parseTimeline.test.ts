import { describe, it, expect } from "vitest";
import parseTimeline from "../../../src/utils/parseTimeline";

describe("parseTimeline", () => {
  const breakpoints = {
    default: "(min-width: 1px)",
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  };
  const defaultBp = "(min-width: 1px)";

  it("returns null for inputs that do not match the pattern", () => {
    const input = "non-matching input";
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toBeNull();
  });

  it("parses id without breakpoint", () => {
    const input = "tl/myAnimation";
    const expected = { id: "myAnimation", breakpoint: defaultBp };
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toEqual(expected);
  });

  it("parses breakpoint without id", () => {
    const input = "@sm:tl";
    const expected = { id: "", breakpoint: breakpoints.sm };
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toEqual(expected);
  });

  it("parses both id and breakpoint", () => {
    const input = "@md:tl/myAnimation";
    const expected = { id: "myAnimation", breakpoint: breakpoints.md };
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toEqual(expected);
  });

  it("returns null when the breakpoint does not exist", () => {
    const input = "@xl:tl/myAnimation";
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toBeNull();
  });

  it("uses default breakpoint when no breakpoint is specified", () => {
    const input = "tl/myAnimation";
    const expected = { id: "myAnimation", breakpoint: defaultBp };
    const result = parseTimeline(input, breakpoints, defaultBp);
    expect(result).toEqual(expected);
  });
});
