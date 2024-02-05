import { PlainObject } from "../types.ts";

function isObject(item: PlainObject): item is PlainObject {
  return (
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    !(item instanceof HTMLElement)
  );
}

export default isObject;
