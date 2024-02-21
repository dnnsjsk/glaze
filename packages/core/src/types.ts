type GlazeAnimationCollection = {
  data: GlazeAnimationObject;
  element: Element;
  breakpoint: string;
};

type GlazeAnimationObject = {
  [key: string]: {
    [key: string]: any;
  };
};

type GlazeConfig = {
  breakpoints?: {
    default?: string;
    [key: string]: string | undefined;
  };
  dataAttribute?: string;
  className?: string;
  element?: Document | Element;
  lib: {
    gsap: {
      core: typeof import("gsap").gsap;
    };
  };
  watch?:
    | boolean
    | {
        debounceTime?: number;
      };
};

type GlazeObjectSettings = {
  [key: string]: string | number | GlazeObjectSettings;
};

type GlazeTimeline = {
  breakpoint: string;
  data: GlazeObjectSettings;
  elements: Map<Element, GlazeAnimationObject>;
  id: string;
  timeline: gsap.core.Timeline;
  timelineElement: Element;
};

type PlainObject = { [key: string]: any };

export type {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeObjectSettings,
  GlazeTimeline,
  PlainObject,
};
