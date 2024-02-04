import {
  GlazeConfig,
  GlazeAnimationCollection,
  GlazeAnimationObject,
  PlainObject,
  GlazeTimeline,
} from "./types.ts";

class Glaze {
  private static bp = "(min-width: 1px)";
  private static gsap: typeof import("gsap").gsap;
  private static config = {
    dataAttribute: "data-animate",
  };

  private static matchMedias: { [p: string]: string } | undefined = {};
  private static elements: GlazeAnimationCollection[] = [];
  private static timelines: GlazeTimeline[] = [];

  private static data: Map<
    Element,
    {
      [key: string]: GlazeAnimationObject;
    }
  > = new Map();

  static isObject(item: PlainObject): item is PlainObject {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  static mergeDeep(
    target: PlainObject,
    ...sources: PlainObject[]
  ): PlainObject {
    if (!sources.length) return target;
    const source = sources.shift()!;

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return sources.length ? this.mergeDeep(target, ...sources) : target;
  }

  static adjustValuesByKey(
    obj: PlainObject,
    keysToAdjust: string[],
    adjustmentFunction: (currentValue: string) => string | Element,
  ): void {
    Object.keys(obj).forEach((key) => {
      if (keysToAdjust.includes(key)) {
        obj[key] = adjustmentFunction(obj[key]);
      } else if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        this.adjustValuesByKey(obj[key], keysToAdjust, adjustmentFunction);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: PlainObject | null) => {
          if (typeof item === "object" && item !== null) {
            this.adjustValuesByKey(item, keysToAdjust, adjustmentFunction);
          }
        });
      }
    });
  }

  static generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static getAttributeString = (withBrackets = false) =>
    `${withBrackets ? "[" : ""}${this.config.dataAttribute}${
      withBrackets ? "]" : ""
    }`;

  static getAttribute = (element: Element) =>
    (element.getAttribute(this.getAttributeString()) || "").trim();

  static getElements = (element: Document | Element = document) =>
    element.querySelectorAll(this.getAttributeString(true));

  static getSelectorOrElement = (
    element: Element,
    data: GlazeAnimationObject | string,
    single = false,
  ) => {
    const selector = typeof data !== "string" ? data?.selector?.value : "";

    if (selector) {
      const startsWithAnd = selector.startsWith("&");
      if (startsWithAnd) {
        const string = selector?.replace("&", ":scope");
        if (single) return element.querySelector(string);
        return element.querySelectorAll(string);
      }
      return selector;
    }
    return element;
  };

  static getSelectorFromBracket(inputString: string) {
    const regex = /^\[([^\]]+)]:(.*)/;
    const match = inputString.match(regex);

    if (match) {
      return {
        content: match[1],
        restOfString: match[2],
      };
    }
    return null;
  }

  static castValue(value: string | null): string | number | boolean | null {
    if (typeof value !== "string") return value;

    const cleanedValue = value.replace(/^\[|]$/g, "");

    if (cleanedValue === "true" || cleanedValue === "false") {
      return cleanedValue === "true";
    } else if (!isNaN(Number(cleanedValue))) {
      return cleanedValue.includes(".")
        ? parseFloat(cleanedValue)
        : parseInt(cleanedValue, 10);
    }

    return cleanedValue;
  }

  static parseTimeline(input: string) {
    const regex = /(?:@(\w+):)?tl(?:\/(\w+))?/;
    const match = input.match(regex);

    if (match) {
      const matchMedia = match[1];
      const id = match[2] ?? "";
      const result = { id, matchMedia: this.bp };

      if (matchMedia) {
        if (!this.matchMedias?.[matchMedia]) return null;
        result.matchMedia = this.matchMedias[matchMedia];
      }

      return result;
    } else {
      return null;
    }
  }

  static parseMediaQueries(input: string) {
    const results: {
      [key: string]: string[];
    } = {};
    const segments = input.split(" ");

    segments.forEach((segment) => {
      const match = segment.match(/@(\w+):/);
      if (!match) {
        if (!results[this.bp]) results[this.bp] = [];
        results[this.bp].push(segment);
        return;
      }

      const matchMedia = match[1];
      if (!this.matchMedias?.[matchMedia]) return;
      if (!results[this.matchMedias[matchMedia]])
        results[this.matchMedias[matchMedia]] = [];

      results[this.matchMedias[matchMedia]].push(segment.replace(match[0], ""));
    });
    return results;
  }

  static parseToObject(input: string, isTimeline = false) {
    // eslint-disable-next-line
    const result: Record<string, any> = {};

    const segments = input.split(" ");

    segments.forEach((segment) => {
      const selector = this.getSelectorFromBracket(segment);
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
        result[key] = this.castValue(value);
        return;
      }

      if (rootKey === "tl" && propertiesString.startsWith("[")) {
        result.tl = {
          value: this.getSelectorFromBracket(propertiesString + ":")?.content,
        };
        return;
      }

      const properties = propertiesString.split("|");
      if (!result[rootKey]) result[rootKey] = {};

      properties.forEach((property) => {
        if (!property) return;
        // eslint-disable-next-line
        let [key, value]: any = property.split(/-(.+)/);

        value = this.castValue(value);

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

  static collect() {
    const processedElements: Element[] = [];
    const elements = this.getElements();

    elements.forEach((element) => {
      const data = this.getAttribute(element);
      const attributes = data.split(" ");

      if (
        attributes.some(
          (attr) =>
            attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl"),
        )
      ) {
        const timelineData = this.parseTimeline(data);
        const elementsInTimeline: Element[] = [];
        [
          ...this.getElements(element),
          ...(timelineData?.id
            ? document.querySelectorAll(
                `[${this.config.dataAttribute}*="tl:${timelineData.id}"]`,
              )
            : []),
        ].forEach((el) => {
          elementsInTimeline.push(el);
        });

        processedElements.push(element);
        this.timelines.push({
          id: timelineData?.id || this.generateUniqueId(),
          data: this.parseToObject(
            attributes
              .filter(
                (attr) =>
                  attr !== "tl" &&
                  !attr.includes("tl/") &&
                  !attr.endsWith(":tl"),
              )
              .join(" "),
            true,
          ),
          matchMedia: timelineData?.matchMedia || this.bp,
          elements: elementsInTimeline,
        });

        return;
      }
    });

    elements.forEach((element) => {
      if (processedElements.includes(element)) return;
      const timelineMatchMedia = this.timelines.find(
        (timeline) =>
          timeline.elements.some((el) => el === element) && timeline.matchMedia,
      )?.matchMedia;

      this.elements.push(
        ...Object.entries(
          this.parseMediaQueries(this.getAttribute(element)),
        ).map(([key, value]) => ({
          matchMedia: key ?? timelineMatchMedia,
          element,
          data: this.parseToObject(value.join(" ")),
        })),
      );
    });

    this.elements.forEach((element) => {
      if (!this.data.has(element.element)) {
        this.data.set(element.element, {});
      }

      const data = {
        [element.matchMedia]: element.data,
      };
      this.data.set(element.element, {
        ...this.data.get(element.element),
        ...data,
      });
    });

    console.log("matchMedias:", this.matchMedias);
    console.log("timelines:", this.timelines);
    console.log("elements:", this.elements);
    console.log("data", this.data);
  }

  static init() {
    const mm: gsap.MatchMedia = this.gsap.matchMedia();

    const applyAnimationSet = (
      element: Element,
      data: GlazeAnimationObject,
      timeline?: gsap.core.Timeline,
    ) => {
      const tlValue = data.tl ? Object.values(data.tl)?.[0] : undefined;

      if (data.to && data.from) {
        if (timeline) {
          timeline.fromTo(
            this.getSelectorOrElement(element, data),
            data.from,
            data.to,
            tlValue,
          );
        } else {
          this.gsap.fromTo(
            this.getSelectorOrElement(element, data),
            data.from,
            data.to,
          );
        }
        return;
      }
      if (data.to || data.from) {
        const key = data.to ? "to" : "from";
        if (timeline) {
          timeline[key](
            this.getSelectorOrElement(element, data),
            data[key],
            tlValue,
          );
        } else {
          this.gsap[key](this.getSelectorOrElement(element, data), data[key]);
        }
      }
    };

    mm.add(
      Object.fromEntries(
        Object.values({
          ...{ [this.bp]: this.bp },
          ...(this.matchMedias || {}),
        }).map((key) => [key, key]),
      ),
      (context) => {
        const timelines: {
          elements: Element[];
          timeline: gsap.core.Timeline;
        }[] = [];

        this.timelines.forEach((timeline) => {
          const tl = this.gsap.timeline(timeline.data || {});
          timelines.push({
            elements: timeline.elements,
            timeline: tl,
          });
        });

        this.data.forEach((value, element) => {
          let animationObject = {};

          Object.entries(value).forEach(([key, value]) => {
            if (context.conditions?.[key]) {
              animationObject = this.mergeDeep(animationObject, value);
            }
          });

          this.adjustValuesByKey(animationObject, ["trigger"], (value) => {
            return this.getSelectorOrElement(element, value, true);
          });

          const timeline = timelines.find(({ elements }) =>
            elements.includes(element),
          )?.timeline;

          applyAnimationSet(element, animationObject, timeline);
        });
      },
    );
  }

  constructor(config: GlazeConfig) {
    if (!config.gsap.core) {
      console.error("Glaze: GSAP is not defined");
      return;
    }

    Glaze.config = {
      ...Glaze.config,
      ...config,
    };
    Glaze.matchMedias = config.breakpoints;
    Glaze.gsap = config.gsap.core;

    Glaze.collect();
    Glaze.init();

    return {
      gsap: Glaze.gsap,
      config: Glaze.config,
      matchMedias: Glaze.matchMedias,
      elements: Glaze.elements,
      timelines: Glaze.timelines,
      data: Glaze.data,
    };
  }
}

export { Glaze };
