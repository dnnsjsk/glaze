import type { AnimationValues } from "@glazejs/shared"
import type { GlazeAnimationObject } from "../types.ts"
import castValue from "./castValue.ts"
import getSelectorFromBracket from "./getSelectorFromBracket.ts"
import isObject from "./isObject.ts"

const forbidden = new Set(["__proto__", "constructor", "prototype"])

function assignProperties(
  target: AnimationValues,
  input: string,
  element: Element
) {
  for (const property of input.split("|")) {
    if (!property) continue
    const [key, rawValue] = property.split(/-(.+)/)
    const parts = key.split(".")
    if (parts.some((part) => !part || forbidden.has(part))) continue
    let current = target
    for (const [index, part] of parts.entries()) {
      if (index === parts.length - 1) {
        current[part] = castValue(rawValue, element, part)
      } else {
        const nested = current[part]
        if (isObject(nested)) current = nested
        else {
          const next: AnimationValues = {}
          current[part] = next
          current = next
        }
      }
    }
  }
}

/**
 * Parse states, selectors and nested animation settings from utilities.
 * @param input - Space-separated utilities.
 * @param isTimeline - Whether bare settings are allowed at the top level.
 * @param element - The element used to resolve relative selectors.
 * @returns Parsed values without prototype-modifying property paths.
 */
function parseToObject(
  input: string,
  isTimeline: true,
  element: Element
): AnimationValues
function parseToObject(
  input: string,
  isTimeline: false,
  element: Element
): GlazeAnimationObject
function parseToObject(
  input: string,
  isTimeline = false,
  element: Element
): AnimationValues {
  const result: AnimationValues = {}
  for (let segment of input.trim().split(/\s+/).filter(Boolean)) {
    segment = segment.replace(/^@[\w-]+:/, "")
    const selector = getSelectorFromBracket(segment)
    if (selector) {
      segment = selector.restOfString
      result.selector = { value: selector.content }
    }
    const separator = segment.indexOf(":")
    if (separator === -1) {
      if (isTimeline && segment.includes("-"))
        assignProperties(result, segment, element)
      continue
    }
    const rootKey = segment.slice(0, separator)
    const properties = segment.slice(separator + 1)
    if (!rootKey || !properties || forbidden.has(rootKey)) continue
    if (
      rootKey === "tl" &&
      properties.startsWith("[") &&
      properties.endsWith("]")
    ) {
      result.tl = { value: properties.slice(1, -1) }
      continue
    }
    const existing = result[rootKey]
    const target: AnimationValues = isObject(existing) ? existing : {}
    result[rootKey] = target
    assignProperties(target, properties, element)
  }
  return result
}

export default parseToObject
