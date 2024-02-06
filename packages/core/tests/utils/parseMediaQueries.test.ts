import { describe, it, expect } from "vitest";
import parseMediaQueries from "../../src/utils/parseMediaQueries";

describe("parseMediaQueries", () => {
  const breakpoints = {
    default: "(min-width: 1px)",
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  };
  const defaultBp = breakpoints.default;

  it("parses segments without breakpoints into the default group", () => {
    const input = "opacity:1 scale:0.5";
    const expected = {
      [defaultBp]: ["opacity:1", "scale:0.5"],
    };
    expect(parseMediaQueries(input, breakpoints, defaultBp)).toEqual(expected);
  });

  it("groups segments by specified breakpoints", () => {
    const input = "@sm:opacity:1 @lg:scale:0.5";
    const expected = {
      [breakpoints.sm]: ["opacity:1"],
      [breakpoints.lg]: ["scale:0.5"],
    };
    expect(parseMediaQueries(input, breakpoints, defaultBp)).toEqual(expected);
  });

  it("ignores segments with non-existent breakpoints", () => {
    const input = "@sm:opacity:1 @xl:scale:0.5";
    const expected = {
      [breakpoints.sm]: ["opacity:1"],
    };
    expect(parseMediaQueries(input, breakpoints, defaultBp)).toEqual(expected);
  });

  it("combines segments with and without breakpoints correctly", () => {
    const input = "opacity:1 @sm:scale:0.5 transform:rotate(45deg)";
    const expected = {
      [defaultBp]: ["opacity:1", "transform:rotate(45deg)"],
      [breakpoints.sm]: ["scale:0.5"],
    };
    expect(parseMediaQueries(input, breakpoints, defaultBp)).toEqual(expected);
  });
});
