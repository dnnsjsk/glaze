import type { AnimationValues } from "@glazejs/shared"
import type { GlazeAnimationObject, GlazeOptions } from "../types.ts"
import mergeDeep from "./mergeDeep.ts"
import parseToObject from "./parseToObject.ts"

/**
 * Supply defaults only for animation states already present on an element.
 * @param animation - Active responsive animation states.
 * @param defaults - Shared element settings and state-specific values.
 * @param element - Element used to resolve selector-valued utilities.
 * @returns A fresh object with explicit element values taking priority.
 */
function applyDefaults(
  animation: GlazeAnimationObject,
  defaults: GlazeOptions["defaults"],
  element: Element
): GlazeAnimationObject {
  const result: GlazeAnimationObject = { ...animation }
  const common: AnimationValues = {}
  const states: GlazeAnimationObject = {}
  for (const token of `${defaults?.elementSettings ?? ""} ${defaults?.element ?? ""}`
    .trim()
    .split(/\s+/)) {
    if (!token) continue
    if (/^(from|to):/.test(token))
      mergeDeep(states, parseToObject(token, false, element))
    else mergeDeep(common, parseToObject(token, true, element))
  }
  for (const state of ["from", "to"] as const) {
    if (animation[state])
      result[state] = mergeDeep(
        {},
        common,
        states[state] ?? {},
        animation[state]
      )
  }
  return result
}

export default applyDefaults
