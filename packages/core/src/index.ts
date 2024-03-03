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

  let idCounter = 0;
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

  const getId = () => {
    idCounter++;
    return `${Math.random().toString(36).substring(2, 15)}-${idCounter}`;
  };

  const matchesTl = (attr: string) =>
    attr === "tl" || attr.includes("tl/") || attr.endsWith(":tl");

  const findTimelineById = (id: string) =>
    timelines.find((timeline) => timeline.id === id);

  const findTimelineByElements = (element: Element) =>
    timelines.find((timeline) => timeline.elements.has(element));

  const findTimelineByTimelineElement = (element: Element) =>
    timelines.find(
      (timeline) =>
        timeline.timelineElement === element ||
        (timeline.timelineElement.id &&
          element.id &&
          timeline.timelineElement.id === element.id),
    );

  const addOrReplaceTimeline = (timeline: GlazeTimeline) => {
    const id = timeline.id;
    const index = timelines.findIndex((timeline) => timeline.id === id);

    if (id && index !== -1) {
      timelines[index] = {
        ...timeline,
        timeline: timelines[index].timeline,
      };
      return;
    }

    timelines.push(timeline);
  };

  function findClosestMatchingAncestor(element: Element): Element | null {
    let currentElement = element.parentElement;

    while (currentElement) {
      if (currentElement.hasAttribute(state.dataAttribute)) {
        return currentElement;
      }
      const classList = Array.from(currentElement.classList);
      const hasMatchingClass = classList.some((className) =>
        className.startsWith(state.className || ""),
      );
      if (hasMatchingClass && state.watch) return currentElement;
      currentElement = currentElement.parentElement;
    }

    return null;
  }

  function shouldMutate(element: Element) {
    const newData = getTimelineElement(element);
    const oldData = timelines
      .find((timeline) => {
        return timeline.elements.has(element);
      })
      ?.elements.get(element);
    if (JSON.stringify(newData) === JSON.stringify(oldData)) return false;
    return (
      !oldData ||
      !newData ||
      JSON.stringify(newData) !== JSON.stringify(oldData)
    );
  }

  const debouncedHandleMutation = debounce(
    handleMutation,
    typeof state.watch === "object" ? state.watch.debounceTime || 500 : 500,
  );

  function handleMutation(element: Element) {
    const timeline = findTimelineByElements(element);

    if (!timeline?.timeline) {
      let otherTimelineId = "";
      Object.values(getTimelineElement(element)).forEach((data) => {
        if (otherTimelineId) return;
        if (data.tl) {
          otherTimelineId = Object.keys(data.tl)[0];
        }
      });

      if (!otherTimelineId) {
        otherTimelineId = findTimelineByTimelineElement(element)?.id || "";
      }

      if (!otherTimelineId) {
        start([element], getId());
        return;
      }

      const otherTimeline = findTimelineById(otherTimelineId);
      const otherTimelineElements = [
        otherTimeline?.timelineElement,
        ...(otherTimeline?.elements.keys() || []),
        element,
      ] as Element[];
      otherTimeline?.timeline.progress(0).clear();
      start(otherTimelineElements, otherTimelineId);
      return;
    }

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

        if (!isAttribute && !isClass && mutation.type !== "childList") return;

        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.hasAttribute(state.dataAttribute) ||
                (state.className &&
                  element.getAttribute("class")?.includes(state.className))
              ) {
                if (!shouldMutate(element)) return;
                console.log("mutation - childList: attribute/class change");
                debouncedHandleMutation(element);
                return;
              } else {
                const closestMatchingAncestor =
                  findClosestMatchingAncestor(element);
                if (!closestMatchingAncestor) return;
                if (closestMatchingAncestor) {
                  console.log(
                    "mutation - childList: closest matching ancestor",
                  );
                  debouncedHandleMutation(closestMatchingAncestor);
                  return;
                }
              }
            }
          });

          return;
        }

        if (!shouldMutate(mutation.target as Element)) return;
        console.log("mutation - attribute/class change");
        debouncedHandleMutation(mutation.target as Element);
      });
    });

    const mutationConfig = {
      attributes: true,
      attributeFilter: [
        state.dataAttribute,
        ...(state.className ? ["class"] : []),
      ],
      subtree: true,
      childList: true,
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
      addOrReplaceTimeline({
        breakpoint: timelineBp,
        data: parsedData,
        elements,
        id: id || timelineData?.id || getId(),
        timelineElement: element,
        timeline: gsap.timeline({ ...parsedData, paused: true }),
      });
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

      const timeline = findTimelineByElements(element);
      const elements = new Map<Element, GlazeAnimationObject>();

      if (!timeline || id !== "") {
        const elementData = getTimelineElement(element);
        let elementScrollTrigger = null;
        Object.values(elementData).forEach((value) => {
          Object.values(value).forEach((val) => {
            if (val.scrollTrigger) {
              elementScrollTrigger = val.scrollTrigger;
              delete val.scrollTrigger;
            }
          });
        });
        elements.set(element, elementData);
        const timelineData = elementScrollTrigger
          ? { scrollTrigger: elementScrollTrigger }
          : {};
        addOrReplaceTimeline({
          breakpoint: timelineMatchMedia || defaultBp,
          data: timelineData as GlazeAnimationObject,
          elements,
          id: id || timeline?.id || getId(),
          timelineElement: element,
          timeline: gsap.timeline({ ...timelineData, paused: true }),
        });
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

  function reset(timeline: GlazeTimeline) {
    timeline.elements.forEach(
      (data: GlazeAnimationObject, element: Element) => {
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
      },
    );
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
        const resettedIds: string[] = [];

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

            const timeline = findTimelineByElements(element);
            if (!timeline) return;

            if (!resettedIds.includes(timeline.id)) {
              resettedIds.push(timeline.id);
              timeline.timeline.progress(0).clear();
              reset(timeline);
            }

            applyAnimationSet(element, animationObject, timeline.timeline);

            if (
              !timeline.timeline.scrollTrigger ||
              (timeline.timeline.scrollTrigger &&
                timeline.timeline.scrollTrigger.isActive)
            ) {
              timeline.timeline.restart();
            }
          });

        return () => timelines.forEach((timeline) => reset(timeline));
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
