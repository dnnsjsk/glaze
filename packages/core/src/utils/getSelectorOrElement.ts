import { GlazeAnimationObject } from "@/types.ts";

function getSelectorOrElement(
  element: Element,
  data: GlazeAnimationObject | string,
  single = false,
) {
  let selector = typeof data !== "string" ? data?.selector?.value : "";

  if (selector) {
    selector = selector.replaceAll("_", " ");
    const startsWithAnd = selector.startsWith("&");
    if (startsWithAnd) {
      const string = selector?.replace("&", ":scope");
      if (string === ":scope") return element;
      if (single) return element.querySelector(string);
      return element.querySelectorAll(string);
    }
    return selector;
  }
  return element;
}

export default getSelectorOrElement;
