type GlazeAnimationCollection = {
  data: GlazeAnimationObject;
  element: Element;
  matchMedia: string;
};

type GlazeAnimationObject = {
  [key: string]: {
    // eslint-disable-next-line
    [key: string]: any;
  };
};

type GlazeConfig = {
  breakpoints?: {
    [key: string]: string;
  };
  dataAttribute?: string;
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

// eslint-disable-next-line
type PlainObject = { [key: string]: any };

export type {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeObjectSettings,
  GlazeTimeline,
  PlainObject,
};
