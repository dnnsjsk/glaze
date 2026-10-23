import type { GlazeAnimationObject } from "../types.ts"

/**
 * Resolve relative selectors while leaving global selectors for the engine.
 * @param element - The originating element.
 * @param data - Parsed selector metadata or the original element's utility.
 * @param single - Whether a relative selector should return only one match.
 * @returns The element, selector, matching descendants, or null for no match.
 */
function getSelectorOrElement(
  element: Element,
  data: GlazeAnimationObject | string,
  single = false
) {
  let selector = typeof data !== "string" ? data?.selector?.value : ""

  if (selector) {
    selector = selector.replaceAll("_", " ")
    const startsWithAnd = selector.startsWith("&")
    if (startsWithAnd) {
      const string = selector?.replace("&", ":scope")
      if (string === ":scope") return element
      if (single) return element.querySelector(string)
      return element.querySelectorAll(string)
    }
    return selector
  }
  return element
}

export default getSelectorOrElement
