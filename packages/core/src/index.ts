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
import parseTimeline from "@/utils/parseTimeline.ts";
import parseMediaQueries from "@/utils/parseMediaQueries.ts";

function glaze(config: GlazeConfig) {
  if (!config || !config?.lib?.gsap?.core) {
    throw new Error("GSAP not found");
  }

  const {
    lib: {
      gsap: { core: gsap },
    },
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

  const defaultBp = state.breakpoints.default;
  const breakpoints = state.breakpoints;

  let elements: GlazeAnimationCollection[] = [];
  let timelines: GlazeTimeline[] = [];
  let animations: Map<
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

  function collect() {
    const processedElements: Element[] = [];
    const els = getElements();

    const matchesTl = (attr: string) =>
      attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl");

    els.forEach((element) => {
      const data = getAttribute(element);
      const attributes = data.split(" ");

      if (attributes.some((attr) => matchesTl(attr))) {
        const timelineData = parseTimeline(data, breakpoints, defaultBp);
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
          breakpoint: timelineData?.breakpoint || defaultBp,
          elements: elementsInTimeline,
          timeline: gsap.timeline(parsedData),
        });

        return;
      }
    });

    els.forEach((element) => {
      if (processedElements.includes(element)) return;
      const timelineMatchMedia = timelines.find(
        (timeline) =>
          timeline.elements.some((el) => el === element) && timeline.breakpoint,
      )?.breakpoint;

      elements.push(
        ...Object.entries(
          parseMediaQueries(getAttribute(element), breakpoints, defaultBp),
        ).map(([key, value]) => ({
          breakpoint: key ?? timelineMatchMedia,
          element,
          data: parseToObject(value.join(" "), false, element),
        })),
      );
    });

    elements.forEach((element) => {
      if (!animations.has(element.element)) {
        animations.set(element.element, {});
      }

      const data = {
        [element.breakpoint]: element.data,
      };
      animations.set(element.element, {
        ...animations.get(element.element),
        ...data,
      });
    });

    console.log("breakpoints:", breakpoints);
    console.log("timelines:", timelines);
    console.log("elements:", elements);
    console.log("animations", animations);
  }

  function start() {
    clear();
    collect();

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
          ...{ [defaultBp]: defaultBp },
          ...(breakpoints || {}),
        }).map((key) => [key, key]),
      ),
      (context) => {
        animations.forEach((value, element) => {
          let animationObject = {};

          Object.entries(value).forEach(([key, value]) => {
            if (context.conditions?.[key]) {
              animationObject = mergeDeep(animationObject, value);
            }
          });

          const timeline = timelines.find(({ elements }) =>
            elements.includes(element),
          )?.timeline;

          applyAnimationSet(element, animationObject, timeline);
        });
      },
    );
  }

  function clear() {
    elements = [];
    timelines = [];
    animations = new Map();
  }

  function kill() {
    timelines.forEach(({ timeline }) => {
      timeline.kill();
    });
    animations.forEach((_value, element) => {
      gsap.killTweensOf(element);
    });
    clear();
  }

  function restart() {
    kill();
    collect();
    start();
  }

  start();

  return {
    start,
    kill,
    restart,
    data: {
      state,
      breakpoints,
      elements,
      timelines,
      animations,
    },
  };
}

export default glaze;
export type {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeTimeline,
  PlainObject,
};
