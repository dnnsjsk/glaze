import type { PlainObject } from "../types.ts"
import isObject from "./isObject.ts"

/**
 * Merge own properties recursively, with later values taking precedence.
 * @param target - The object to update.
 * @param sources - Objects whose properties should be merged in order.
 * @returns The updated target.
 */
function mergeDeep(target: PlainObject, ...sources: unknown[]): PlainObject {
  for (const source of sources) {
    if (!isObject(source)) continue
    for (const [key, value] of Object.entries(source)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype")
        continue
      if (isObject(value)) {
        const current = target[key]
        const nested = isObject(current) ? current : {}
        target[key] = mergeDeep(nested, value)
      } else target[key] = value
    }
  }
  return target
}

export default mergeDeep
