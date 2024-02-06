import { GlazeAnimationCollection, GlazeAnimationObject, GlazeConfig, GlazeTimeline, PlainObject } from './types.ts';
declare function glaze(config: GlazeConfig): {
    start: () => void;
    kill: () => void;
    restart: () => void;
    data: {
        state: Omit<GlazeConfig, "gsap"> & {
            element: Document | Element;
            breakpoints: {
                [key: string]: string;
                default: string;
            };
        };
        breakpoints: {
            [key: string]: string | undefined;
            default?: string | undefined;
        } & {
            [key: string]: string;
            default: string;
        };
        elements: GlazeAnimationCollection[];
        timelines: GlazeTimeline[];
        animations: Map<Element, {
            [key: string]: GlazeAnimationObject;
        }>;
    };
};
export { glaze };
export type { GlazeAnimationCollection, GlazeAnimationObject, GlazeConfig, GlazeTimeline, PlainObject, };
