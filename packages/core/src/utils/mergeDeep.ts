import { PlainObject } from "../types.ts";
import isObject from "./isObject.ts";

function mergeDeep(
  target: PlainObject,
  ...sources: PlainObject[]
): PlainObject {
  if (!sources.length) return target;
  const source = sources.shift()!;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return sources.length ? mergeDeep(target, ...sources) : target;
}

export default mergeDeep;
