import getSelectorOrElement from "./getSelectorOrElement.ts"

/**
 * Convert utility values into numbers, booleans, selectors or strings.
 * @param value - The encoded value following a property name.
 * @param element - The element used to resolve relative selectors.
 * @param key - The property name, including single-element trigger settings.
 * @returns The decoded value or a resolved DOM target.
 */
function castValue(
  value: string | null | undefined,
  element: Element,
  key: string
):
  | string
  | number
  | boolean
  | Element
  | NodeListOf<Element>
  | null
  | undefined {
  if (typeof value !== "string") return value
  const cleanedValue = value.replace(/^\[|]$/g, "").replaceAll("_", " ")

  if (cleanedValue.startsWith("&")) {
    return getSelectorOrElement(
      element,
      { selector: { value: cleanedValue } },
      ["scrollTrigger", "trigger"].includes(key)
    )
  }

  if (cleanedValue === "true" || cleanedValue === "false") {
    return cleanedValue === "true"
  } else if (
    cleanedValue.trim() !== "" &&
    Number.isFinite(Number(cleanedValue))
  ) {
    return Number(cleanedValue)
  }

  return cleanedValue
}

export default castValue
