import { GlazeConfig, GlazeAnimationCollection, GlazeAnimationObject, PlainObject, GlazeTimeline } from "./types.ts";
declare class Glaze {
    private static bp;
    private static gsap;
    private static config;
    private static matchMedias;
    private static elements;
    private static timelines;
    private static data;
    static isObject(item: PlainObject): item is PlainObject;
    static mergeDeep(target: PlainObject, ...sources: PlainObject[]): PlainObject;
    static adjustValuesByKey(obj: PlainObject, keysToAdjust: string[], adjustmentFunction: (currentValue: string) => string | Element): void;
    static generateUniqueId(): string;
    static getAttributeString: (withBrackets?: boolean) => string;
    static getAttribute: (element: Element) => string;
    static getElements: (element?: Document | Element) => NodeListOf<Element>;
    static getSelectorOrElement: (element: Element, data: GlazeAnimationObject | string, single?: boolean) => any;
    static getSelectorFromBracket(inputString: string): {
        content: string;
        restOfString: string;
    } | null;
    static castValue(value: string | null): string | number | boolean | null;
    static parseTimeline(input: string): {
        id: string;
        matchMedia: string;
    } | null;
    static parseMediaQueries(input: string): {
        [key: string]: string[];
    };
    static parseToObject(input: string, isTimeline?: boolean): Record<string, any>;
    static collect(): void;
    static init(): void;
    constructor(config: GlazeConfig);
}
export { Glaze };
export type { GlazeAnimationCollection, GlazeAnimationObject, GlazeConfig, GlazeTimeline, PlainObject, };
