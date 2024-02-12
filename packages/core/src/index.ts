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
      breakpoints: { default: "(min-width: 1px)" },
      dataAttribute: "data-animate",
      element: document,
      watch: false,
    },
    rest,
  ) as Omit<GlazeConfig, "gsap"> & {
    dataAttribute: string;
    element: Document | Element;
    breakpoints: {
      default: string;
      [key: string]: string;
    };
  };

  const defaultBp = state.breakpoints.default;
  const breakpoints = state.breakpoints;
  const timelines: GlazeTimeline[] = [];

  const getAttribute = (element: Element) =>
    (element.getAttribute(getAttributeString()) || "").trim();

  const getElements = (element: Document | Element = state.element) =>
    element.querySelectorAll(getAttributeString(true));

  const getAttributeString = (withBrackets = false) =>
    `${withBrackets ? "[" : ""}${state.dataAttribute}${withBrackets ? "]" : ""}`;

  const getId = () => Math.random().toString(36).substring(2, 15);

  const matchesTl = (attr: string) =>
    attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl");

  function watch() {
    const target = state.element;
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === state.dataAttribute
        ) {
          console.log(mutation.target, "changed", mutation.attributeName);
        }
      });
    });

    const mutationConfig = {
      attributes: true,
      attributeFilter: [state.dataAttribute],
      subtree: true,
    };

    observer.observe(target, mutationConfig);
  }

  function getTimelineElement(element: Element) {
    const data = [
      ...Object.entries(
        parseMediaQueries(getAttribute(element), breakpoints, defaultBp),
      ).map(([key, value]) => ({
        breakpoint: key,
        element,
        data: parseToObject(value.join(" "), false, element),
      })),
    ];

    const bps: {
      [key: string]: GlazeAnimationObject;
    } = {};
    data.forEach((el) => {
      if (!bps?.[el.breakpoint]) bps[el.breakpoint] = {};
      bps[el.breakpoint] = el.data;
    });

    return bps;
  }

  function getTimeline(element: Element) {
    const processedElements: Element[] = [];
    const data = getAttribute(element);
    const attributes = data.split(" ");

    if (attributes.some((attr) => matchesTl(attr))) {
      const timelineData = parseTimeline(data, breakpoints, defaultBp);
      const elements = new Map<Element, GlazeAnimationObject>();
      [
        ...getElements(element),
        ...(timelineData?.id
          ? document.querySelectorAll(
              `[${state.dataAttribute}*="tl:${timelineData.id}"]`,
            )
          : []),
      ].forEach((el) => {
        elements.set(el, getTimelineElement(el));
        processedElements.push(el);
      });

      const parsedData = parseToObject(
        attributes.filter((attr) => !matchesTl(attr)).join(" "),
        true,
        element,
      );

      const timelineBp = timelineData?.breakpoint || defaultBp;
      timelines.push({
        breakpoint: timelineBp,
        data: parsedData,
        elements,
        id: timelineData?.id || getId(),
      });
    }

    return processedElements;
  }

  function collect() {
    const processedElements: Element[] = [];
    const els = getElements();

    els.forEach((element) => {
      const data = getAttribute(element);
      const attributes = data.split(" ");

      if (attributes.some((attr) => matchesTl(attr))) {
        processedElements.push(...getTimeline(element));
        processedElements.push(element);
      }
    });

    els.forEach((element) => {
      if (processedElements.includes(element)) return;
      const timelineMatchMedia = timelines.find(
        (timeline) => timeline.elements?.has(element) && timeline.breakpoint,
      )?.breakpoint;

      const timeline = timelines.find((timeline) =>
        timeline.elements?.has(element),
      );

      const elements = new Map<Element, GlazeAnimationObject>();
      if (!timeline) {
        elements.set(element, getTimelineElement(element));
        timelines.push({
          breakpoint: timelineMatchMedia || defaultBp,
          data: {},
          elements,
          id: getId(),
        });
      }
    });

    console.log("breakpoints:", breakpoints);
    console.log("timelines:", timelines);
  }

  function start() {
    collect();

    const mm: gsap.MatchMedia = gsap.matchMedia();

    const applyAnimationSet = (
      element: Element,
      data: GlazeAnimationObject,
      timeline: gsap.core.Timeline,
    ) => {
      const tlValue = data.tl ? Object.values(data.tl)?.[0] : undefined;

      console.log(tlValue);

      if (data.to && data.from) {
        timeline.fromTo(
          getSelectorOrElement(element, data),
          data.from,
          data.to,
          tlValue,
        );
        return;
      }
      if (data.to || data.from) {
        const key = data.to ? "to" : "from";
        timeline[key](getSelectorOrElement(element, data), data[key], tlValue);
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
        const tl: {
          [key: string]: gsap.core.Timeline;
        } = {};

        timelines
          .reduce((acc, obj) => new Map([...acc, ...obj.elements]), new Map())
          .forEach((value, element) => {
            let animationObject = {};

            Object.entries(value).forEach(([key, value]) => {
              if (context.conditions?.[key]) {
                animationObject = mergeDeep(
                  animationObject,
                  value as PlainObject,
                );
              }
            });

            const timeline = timelines.find((t) => t.elements.has(element));
            if (!timeline) return;

            if (!tl?.[timeline?.id]) {
              tl[timeline?.id] = gsap.timeline(timeline?.data);
            }

            applyAnimationSet(element, animationObject, tl[timeline?.id]);
          });
      },
    );
  }

  start();
  if (state.watch) watch();

  return {
    breakpoints,
    state,
    timelines,
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
