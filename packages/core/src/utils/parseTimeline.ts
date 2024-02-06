import { GlazeConfig } from "@/types.ts";

function parseTimeline(
  input: string,
  breakpoints: GlazeConfig["breakpoints"],
  defaultBp: string,
) {
  const regex = /(?:@(\w+):)?tl(?:\/(\w+))?/;
  const match = input.match(regex);

  if (match) {
    const breakpoint = match[1];
    const id = match[2] ?? "";
    const result = { id, breakpoint: defaultBp };

    if (breakpoint) {
      if (!breakpoints?.[breakpoint]) return null;
      result.breakpoint = breakpoints[breakpoint] ?? defaultBp;
    }

    return result;
  } else {
    return null;
  }
}

export default parseTimeline;
