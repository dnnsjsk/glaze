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
  element?: Document | Element;
  gsap: { core: typeof import("gsap").gsap };
};

type GlazeObjectSettings = {
  [key: string]: string | number | GlazeObjectSettings;
};

type GlazeTimeline = {
  id: string;
  data: GlazeObjectSettings;
  elements: Element[];
  breakpoint: string;
  timeline: typeof import("gsap").gsap.core.Timeline.prototype;
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
