import {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeTimeline,
  PlainObject,
} from "@/types.ts";
import getSelectorOrElement from "@/utils/getSelectorOrElement.ts";
import mergeDeep from "@/utils/mergeDeep.ts";
import parseToObject from "@/utils/parseToObject.ts";

function glaze(config: GlazeConfig) {
  if (!config.gsap?.core) {
    throw new Error("GSAP not found");
  }

  const {
    gsap: { core: gsap },
    ...rest
  } = config;

  const state = mergeDeep(
    {
      dataAttribute: "data-animate",
      element: document,
      breakpoints: {
        default: "(min-width: 1px)",
      },
    },
    rest,
  ) as Omit<GlazeConfig, "gsap"> & {
    element: Document | Element;
    breakpoints: {
      default: string;
      [key: string]: string;
    };
  };

  const initialMm = state.breakpoints.default;
  const matchMedias = state.breakpoints;
  const elements: GlazeAnimationCollection[] = [];
  const timelines: GlazeTimeline[] = [];
  const animations: Map<
    Element,
    {
      [key: string]: GlazeAnimationObject;
    }
  > = new Map();

  const getAttribute = (element: Element) =>
    (element.getAttribute(getAttributeString()) || "").trim();

  const getElements = (element: Document | Element = state.element) =>
    element.querySelectorAll(getAttributeString(true));

  const getAttributeString = (withBrackets = false) =>
    `${withBrackets ? "[" : ""}${state.dataAttribute}${withBrackets ? "]" : ""}`;

  function parseTimeline(input: string) {
    const regex = /(?:@(\w+):)?tl(?:\/(\w+))?/;
    const match = input.match(regex);

    if (match) {
      const matchMedia = match[1];
      const id = match[2] ?? "";
      const result = { id, matchMedia: initialMm };

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
        if (!results[initialMm]) results[initialMm] = [];
        results[initialMm].push(segment);
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
                `[${state.dataAttribute}*="tl:${timelineData.id}"]`,
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
          matchMedia: timelineData?.matchMedia || initialMm,
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
      if (!animations.has(element.element)) {
        animations.set(element.element, {});
      }

      const data = {
        [element.matchMedia]: element.data,
      };
      animations.set(element.element, {
        ...animations.get(element.element),
        ...data,
      });
    });

    console.log("matchMedias:", matchMedias);
    console.log("timelines:", timelines);
    console.log("elements:", elements);
    console.log("animations", animations);
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
          ...{ [initialMm]: initialMm },
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

        animations.forEach((value, element) => {
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
