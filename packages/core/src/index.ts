import {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeTimeline,
  PlainObject,
} from "./types.ts";
import getSelectorOrElement from "./utils/getSelectorOrElement.ts";
import mergeDeep from "./utils/mergeDeep.ts";
import parseToObject from "./utils/parseToObject.ts";

function glaze(config: GlazeConfig) {
  if (!config.gsap?.core) {
    throw new Error("GSAP not found");
  }

  const state = {
    dataAttribute: "data-animate",
    breakpoints: {
      default: "(min-width: 1px)",
      ...(config?.breakpoints || {}),
    },
  };

  const dataAttribute = state.dataAttribute;
  const gsap = config.gsap.core;
  const initialBp = state.breakpoints.default;
  const matchMedias: { [p: string]: string } | undefined = state.breakpoints;

  const elements: GlazeAnimationCollection[] = [];
  const timelines: GlazeTimeline[] = [];
  const data: Map<
    Element,
    {
      [key: string]: GlazeAnimationObject;
    }
  > = new Map();

  const getAttribute = (element: Element) =>
    (element.getAttribute(getAttributeString()) || "").trim();

  const getElements = (element: Document | Element = document) =>
    element.querySelectorAll(getAttributeString(true));

  const getAttributeString = (withBrackets = false) =>
    `${withBrackets ? "[" : ""}${dataAttribute}${withBrackets ? "]" : ""}`;

  function parseTimeline(input: string) {
    const regex = /(?:@(\w+):)?tl(?:\/(\w+))?/;
    const match = input.match(regex);

    if (match) {
      const matchMedia = match[1];
      const id = match[2] ?? "";
      const result = { id, matchMedia: initialBp };

      if (matchMedia) {
        if (!matchMedias?.[matchMedia]) return null;
        result.matchMedia = matchMedias[matchMedia];
      }

      return result;
    } else {
      return null;
    }
  }

  function parseMediaQueries(input: string) {
    const results: {
      [key: string]: string[];
    } = {};
    const segments = input.split(" ");

    segments.forEach((segment) => {
      const match = segment.match(/@(\w+):/);
      if (!match) {
        if (!results[initialBp]) results[initialBp] = [];
        results[initialBp].push(segment);
        return;
      }

      const matchMedia = match[1];
      if (!matchMedias?.[matchMedia]) return;
      if (!results[matchMedias[matchMedia]])
        results[matchMedias[matchMedia]] = [];

      results[matchMedias[matchMedia]].push(segment.replace(match[0], ""));
    });
    return results;
  }

  function collect() {
    const processedElements: Element[] = [];
    const els = getElements();

    const matchesTl = (attr: string) =>
      attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl");

    els.forEach((element) => {
      const data = getAttribute(element);
      const attributes = data.split(" ");

      if (attributes.some((attr) => matchesTl(attr))) {
        const timelineData = parseTimeline(data);
        const elementsInTimeline: Element[] = [];
        [
          ...getElements(element),
          ...(timelineData?.id
            ? document.querySelectorAll(
                `[${dataAttribute}*="tl:${timelineData.id}"]`,
              )
            : []),
        ].forEach((el) => {
          elementsInTimeline.push(el);
        });

        const parsedData = parseToObject(
          attributes.filter((attr) => !matchesTl(attr)).join(" "),
          true,
          element,
        );

        processedElements.push(element);
        timelines.push({
          id: timelineData?.id || Math.random().toString(36).substring(2, 15),
          data: parsedData,
          matchMedia: timelineData?.matchMedia || initialBp,
          elements: elementsInTimeline,
        });

        return;
      }
    });

    els.forEach((element) => {
      if (processedElements.includes(element)) return;
      const timelineMatchMedia = timelines.find(
        (timeline) =>
          timeline.elements.some((el) => el === element) && timeline.matchMedia,
      )?.matchMedia;

      elements.push(
        ...Object.entries(parseMediaQueries(getAttribute(element))).map(
          ([key, value]) => ({
            matchMedia: key ?? timelineMatchMedia,
            element,
            data: parseToObject(value.join(" "), false, element),
          }),
        ),
      );
    });

    elements.forEach((element) => {
      if (!data.has(element.element)) {
        data.set(element.element, {});
      }

      const d = {
        [element.matchMedia]: element.data,
      };
      data.set(element.element, {
        ...data.get(element.element),
        ...d,
      });
    });

    console.log("matchMedias:", matchMedias);
    console.log("timelines:", timelines);
    console.log("elements:", elements);
    console.log("data", data);
  }

  function init() {
    const mm: gsap.MatchMedia = gsap.matchMedia();

    const applyAnimationSet = (
      element: Element,
      data: GlazeAnimationObject,
      timeline?: gsap.core.Timeline,
    ) => {
      const tlValue = data.tl ? Object.values(data.tl)?.[0] : undefined;

      if (data.to && data.from) {
        if (timeline) {
          timeline.fromTo(
            getSelectorOrElement(element, data),
            data.from,
            data.to,
            tlValue,
          );
        } else {
          gsap.fromTo(getSelectorOrElement(element, data), data.from, data.to);
        }
        return;
      }
      if (data.to || data.from) {
        const key = data.to ? "to" : "from";
        if (timeline) {
          timeline[key](
            getSelectorOrElement(element, data),
            data[key],
            tlValue,
          );
        } else {
          gsap[key](getSelectorOrElement(element, data), data[key]);
        }
      }
    };

    mm.add(
      Object.fromEntries(
        Object.values({
          ...{ [initialBp]: initialBp },
          ...(matchMedias || {}),
        }).map((key) => [key, key]),
      ),
      (context) => {
        const tls: {
          elements: Element[];
          timeline: gsap.core.Timeline;
        }[] = [];

        timelines.forEach((timeline) => {
          const tl = gsap.timeline(timeline.data || {});
          tls.push({
            elements: timeline.elements,
            timeline: tl,
          });
        });

        data.forEach((value, element) => {
          let animationObject = {};

          Object.entries(value).forEach(([key, value]) => {
            if (context.conditions?.[key]) {
              animationObject = mergeDeep(animationObject, value);
            }
          });

          const timeline = tls.find(({ elements }) =>
            elements.includes(element),
          )?.timeline;

          applyAnimationSet(element, animationObject, timeline);
        });
      },
    );
  }

  collect();
  init();
}

export { glaze };
export type {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeTimeline,
  PlainObject,
};
