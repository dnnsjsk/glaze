import { GlazeConfig } from "@/types.ts";

function parseMediaQueries(
  input: string,
  breakpoints: GlazeConfig["breakpoints"],
  defaultBp: string,
) {
  const results: {
    [key: string]: string[];
  } = {};
  const segments = input.split(" ");

  segments.forEach((segment) => {
    const match = segment.match(/@(\w+):/);
    if (!match) {
      if (!results[defaultBp]) results[defaultBp] = [];
      results[defaultBp].push(segment);
      return;
    }

    const breakpoint = match[1];
    const bpValue = breakpoints?.[breakpoint];
    if (!bpValue) return;

    if (!results[bpValue]) results[bpValue] = [];
    results[bpValue].push(segment.replace(match[0], ""));
  });

  return results;
}

export default parseMediaQueries;
