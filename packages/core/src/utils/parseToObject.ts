import getSelectorFromBracket from "./getSelectorFromBracket.ts";
import castValue from "./castValue.ts";

function parseToObject(input: string, isTimeline = false, element: Element) {
  const result: Record<string, any> = {};

  const segments = input.split(" ");

  segments.forEach((segment) => {
    const selector = getSelectorFromBracket(segment);
    if (selector) {
      segment = selector.restOfString;
      result.selector = {};
      result.selector.value = selector.content;
    }

    const split = segment.split(":").filter((item) => !item.includes("@"));
    const [rootKey, propertiesString] = split;

    if (!propertiesString && isTimeline) {
      const obj = segment.split("-");
      const key = obj[0];
      const value = obj[1];

      if (!key || !value) return;
      result[key] = castValue(value, element, key);
      return;
    }

    if (rootKey === "tl" && propertiesString.startsWith("[")) {
      result.tl = {
        value: getSelectorFromBracket(propertiesString + ":")?.content,
      };
      return;
    }

    if (!propertiesString) return;
    const properties = propertiesString.split("|");
    if (!result[rootKey]) result[rootKey] = {};

    properties.forEach((property) => {
      if (!property) return;
      let [key, value]: any = property.split(/-(.+)/);

      value = castValue(value, element, key);

      const keyParts = key.split(".");
      let currentObj = result[rootKey];
      keyParts.forEach((part: string | number, index: number) => {
        if (index === keyParts.length - 1) {
          currentObj[part] = value;
        } else {
          if (!currentObj[part]) currentObj[part] = {};
          currentObj = currentObj[part];
        }
      });
    });
  });

  return result;
}

export default parseToObject;
