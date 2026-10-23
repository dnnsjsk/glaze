/**
 * Expand named presets in place, preserving responsive and selector prefixes.
 * @param input - Attribute and class utility tokens.
 * @param presets - Named utility strings available to the element.
 * @returns Utilities with nested presets expanded and invocation order intact.
 */
function expandPresets(
  input: string,
  presets: Record<string, string> = {}
): string {
  /**
   * Expand one token while detecting a recursive preset definition.
   * @param token - The token or preset invocation.
   * @param stack - Presets already being expanded along this path.
   * @returns The expanded utility tokens.
   */
  function expand(token: string, stack: string[]): string[] {
    const match = token.match(/^(.*:)?preset-([\w-]+)$/)
    if (!match) return [token]
    const prefix = match[1] ?? ""
    const name = match[2] ?? ""
    if (!Object.hasOwn(presets, name)) return [token]
    if (stack.includes(name))
      throw new Error(`Circular Glaze preset: ${[...stack, name].join(" -> ")}`)
    return (presets[name] ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((part) => {
        const responsive = prefix.match(/^@[\w-]+:/)?.[0] ?? ""
        return expand(
          prefix + (responsive ? part.replace(/^@[\w-]+:/, "") : part),
          [...stack, name]
        )
      })
  }
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((token) => expand(token, []))
    .join(" ")
}

export default expandPresets
