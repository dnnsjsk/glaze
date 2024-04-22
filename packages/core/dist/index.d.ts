import { GlazeAnimationCollection, GlazeAnimationObject, GlazeConfig, GlazeTimeline, PlainObject } from './types.ts';

declare function glaze(config: GlazeConfig): {
    breakpoints: {
        [key: string]: string | undefined;
        default?: string | undefined;
    } & {
        [key: string]: string;
        default: string;
    };
    state: Omit<GlazeConfig, "gsap"> & {
        dataAttribute: string;
        element: Document | Element;
        breakpoints: {
            default: string;
            [key: string]: string;
        };
    };
    timelines: GlazeTimeline[];
};
export default glaze;
export type { GlazeAnimationCollection, GlazeAnimationObject, GlazeConfig, GlazeTimeline, PlainObject, };
