function isObject(item: any): item is Record<string, any> {
  return (
    item !== null &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    !(item instanceof HTMLElement)
  );
}

export default isObject;
