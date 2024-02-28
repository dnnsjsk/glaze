import getSelectorOrElement from "./getSelectorOrElement.ts";

function castValue(
  value: string | null,
  element: Element,
  key: string,
): string | number | boolean | Element | null {
  if (typeof value !== "string") return value;
  const cleanedValue = value.replace(/^\[|]$/g, "").replaceAll("_", " ");

  if (cleanedValue.startsWith("&")) {
    return getSelectorOrElement(
      element,
      { selector: { value: cleanedValue } },
      ["scrollTrigger", "trigger"].includes(key),
    );
  }

  if (cleanedValue === "true" || cleanedValue === "false") {
    return cleanedValue === "true";
  } else if (!isNaN(Number(cleanedValue))) {
    return cleanedValue.includes(".")
      ? parseFloat(cleanedValue)
      : parseInt(cleanedValue, 10);
  }

  return cleanedValue;
}

export default castValue;
