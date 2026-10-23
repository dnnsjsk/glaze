import type { GlazeConfig } from "../types.ts"

/**
 * Find a timeline marker and its optional breakpoint and identifier.
 * @param input - The element's utilities.
 * @param breakpoints - Named media queries.
 * @param defaultBp - The query for timelines without a prefix.
 * @returns Timeline metadata, or null for absent or unknown markers.
 */
function parseTimeline(
  input: string,
  breakpoints: GlazeConfig["breakpoints"],
  defaultBp: string
) {
  const regex = /(?:^|\s)(?:@([\w-]+):)?tl(?:\/([\w-]+))?(?=\s|$)/
  const match = input.match(regex)

  if (match) {
    const breakpoint = match[1]
    const id = match[2] ?? ""
    const result = { id, breakpoint: defaultBp }

    if (breakpoint) {
      if (!breakpoints?.[breakpoint]) return null
      result.breakpoint = breakpoints[breakpoint] ?? defaultBp
    }

    return result
  } else {
    return null
  }
}

export default parseTimeline
