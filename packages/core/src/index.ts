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
import debounce from "@/utils/debounce.ts";

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

  const defaultBp = state.breakpoints?.default;
  const breakpoints = state.breakpoints;
  const timelines: GlazeTimeline[] = [];

  const getAttributeString = (withBrackets = false) =>
    `${withBrackets ? "[" : ""}${state.dataAttribute}${withBrackets ? "]" : ""}`;

  const getClassnameString = () =>
    state.className
      ? `, [class^="${state.className}"], [class*="${state.className}"]`
      : "";

  const getAttribute = (element: Element) => {
    const attribute = element.getAttribute(getAttributeString()) || "";
    let classes = "";
    if (state?.className) {
      const className = element.getAttribute("class") || "";
      const classNameArray = className.split(" ");
      classes = classNameArray
        .filter((c) => c.includes(<string>state.className))
        .map((c) => c.replace(`${state?.className}-`, ""))
        .join(" ");
    }

    return `${attribute} ${classes}`.trim();
  };

  const getElements = (element: Document | Element = state.element) =>
    Array.from(
      element.querySelectorAll(
        `${getAttributeString(true)}${getClassnameString()}`,
      ),
    );

  const getId = () => Math.random().toString(36).substring(2, 15);

  const matchesTl = (attr: string) =>
    attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl");

  const findTimeline = (element: Element) =>
    timelines.find((timeline) => timeline.elements.has(element));

  const addOrReplaceTimeline = (timeline: GlazeTimeline, id = "") => {
    if (id) {
      const index = timelines.findIndex((timeline) => timeline.id === id);
      if (index === -1) return;
      timelines[index] = timeline;
      return;
    } else {
      timelines.push(timeline);
    }
  };

  const debouncedHandleMutation = debounce(
    handleMutation,
    typeof state.watch === "object" ? state.watch.debounceTime || 500 : 500,
  );

  function handleMutation(mutation: MutationRecord) {
    const timeline = findTimeline(mutation.target as Element);

    if (!timeline?.timeline) return;
    timeline.timeline.progress(0).clear();
    start(
      [
        ...Array.from(timeline.elements.keys()),
        ...(timeline?.timelineElement ? [timeline?.timelineElement] : []),
      ],
      timeline?.id || "",
    );
  }

  function watch() {
    const target = state.element;
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        const isAttribute =
          mutation.type === "attributes" &&
          mutation.attributeName === state.dataAttribute;
        const isClass =
          state.className &&
          mutation.attributeName === "class" &&
          (mutation.target as Element)
            .getAttribute("class")
            ?.includes(state.className);

        if (!isAttribute && !isClass) return;
        const newData = getTimelineElement(mutation.target as Element);
        const oldData = timelines
          .find((timeline) => {
            return timeline.elements.has(mutation.target as Element);
          })
          ?.elements.get(mutation.target as Element);
        if (JSON.stringify(newData) === JSON.stringify(oldData)) return;
        if (!oldData || !newData) return;

        debouncedHandleMutation(mutation);
      });
    });

    const mutationConfig = {
      attributes: true,
      attributeFilter: [
        state.dataAttribute,
        ...(state.className ? ["class"] : []),
      ],
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

  function getTimeline(element: Element, id = "") {
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
              `[${state.dataAttribute}*="tl:${timelineData.id}"]${
                state.className
                  ? `, [class^="${state.className}-tl:${timelineData.id}"], [class*="${state.className}-tl:${timelineData.id}"]`
                  : ""
              }`,
            )
          : []),
      ].forEach((el) => {
        if (el === element) return;

        elements.set(el, getTimelineElement(el));
        processedElements.push(el);
      });

      const parsedData = parseToObject(
        attributes.filter((attr) => !matchesTl(attr)).join(" "),
        true,
        element,
      );

      const timelineBp = timelineData?.breakpoint || defaultBp;
      addOrReplaceTimeline(
        {
          breakpoint: timelineBp,
          data: parsedData,
          elements,
          id: timelineData?.id || getId(),
          timelineElement: element,
          timeline: gsap.timeline({ ...parsedData, paused: true }),
        },
        id,
      );
    }

    return processedElements;
  }

  function collect(els = getElements(), id = "") {
    const processedElements: Element[] = [];

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
      if (!timeline || id !== "") {
        elements.set(element, getTimelineElement(element));
        addOrReplaceTimeline(
          {
            breakpoint: timelineMatchMedia || defaultBp,
            data: {},
            elements,
            id: timeline?.id || getId(),
            timelineElement: element,
            timeline: gsap.timeline({ paused: true }),
          },
          id,
        );
      }
    });

    console.log("breakpoints:", breakpoints);
    console.log("timelines:", timelines);
  }

  function applyAnimationSet(
    element: Element,
    data: GlazeAnimationObject,
    timeline: gsap.core.Timeline,
  ) {
    const tlValue = data.tl ? Object.values(data.tl)?.[0] : undefined;

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
  }

  function start(els = getElements(), id = "") {
    collect(els, id);

    const mm: gsap.MatchMedia = gsap.matchMedia();

    mm.add(
      Object.fromEntries(
        Object.values({
          ...{ [defaultBp]: defaultBp },
          ...(breakpoints || {}),
        }).map((key) => [key, key]),
      ),
      (context) => {
        (
          (id
            ? [timelines.find((timeline) => timeline.id === id)]
            : timelines) as GlazeTimeline[]
        )
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

            const timeline = findTimeline(element);
            if (!timeline) return;

            if (id) timeline.timeline.progress(0).clear();

            timeline.elements.forEach((data, element) => {
              gsap.set(element, {
                clearProps: "all",
              });
              Object.values(data).forEach((data) => {
                if (data.selector) {
                  gsap.set(getSelectorOrElement(element, data), {
                    clearProps: "all",
                  });
                }
              });
            });
            applyAnimationSet(element, animationObject, timeline.timeline);
            timeline.timeline.restart();
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
