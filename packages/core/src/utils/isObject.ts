/**
 * Distinguish mergeable objects from DOM nodes and other class instances.
 * @param item - The value to inspect.
 * @returns Whether the value is a plain object.
 */
function isObject(item: unknown): item is Record<string, unknown> {
  if (item === null || typeof item !== "object") return false
  const prototype: unknown = Object.getPrototypeOf(item)
  return prototype === Object.prototype || prototype === null
}

export default isObject
