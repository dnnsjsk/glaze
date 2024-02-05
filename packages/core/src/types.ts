type GlazeAnimationCollection = {
  data: GlazeAnimationObject;
  element: Element;
  matchMedia: string;
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
  matchMedia: string;
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
