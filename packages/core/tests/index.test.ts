import { describe, it, expect, beforeEach, vi } from "vitest";
import glaze from "../src";
import { gsap } from "gsap";

vi.mock("gsap", () => {
  return {
    gsap: {
      to: vi.fn(),
      from: vi.fn(),
      timeline: vi.fn(),
      matchMedia: () => ({
        add: vi.fn(),
      }),
    },
  };
});

expect.extend({
  toBeArrayOfSize(received, expected) {
    if (Array.isArray(received) && received.length === expected) {
      return {
        message: () => `expected array is of length ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected array of length ${expected} but received ${received.length}`,
        pass: false,
      };
    }
  },
});

describe("glaze", () => {
  let container: HTMLElement;
  let glazeInstance: ReturnType<typeof glaze>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <div data-animate="tl/main defaults:ease-linear yoyo-true">
          <div data-animate="from:opacity-0 @md:from:opacity-0.25 @md:from:opacity-0.5"></div>
          <div data-animate="from:opacity-0"></div>
        </div>
        <div data-animate="tl:main-[-=3]"></div>
        <div data-animate="@md:tl/md">
          <div data-animate="from:opacity-0"></div>
          <div data-animate="from:opacity-0"></div>
        </div>
        <div data-animate="tl:md-[-=3] from:opacity-0"></div>
        <div data-animate="@lg:tl">
          <div data-animate="from:opacity-0"></div>
          <div data-animate="from:opacity-0 to:opacity-10"></div>
        </div>
        <div data-animate="@lg:[&>div]:from:opacity-0|x-50">
          <div></div>
          <div></div>
        </div>
      </div>
    `;
    container = document.getElementById("test-container") as HTMLElement;
    glazeInstance = glaze({
      lib: { gsap: { core: gsap } },
      breakpoints: {
        default: "(min-width: 640px)",
        md: "(min-width: 768px)",
        lg: "(min-width: 1024px)",
      },
      element: container,
    });
  });

  it("throws an error if GSAP is not provided", () => {
    // @ts-ignore
    expect(() => glaze()).toThrow("GSAP not found");
  });

  it("returns correct base element", () => {
    expect(glazeInstance.data.state.element).toBe(container);
  });

  it("returns correct default breakpoint", () => {
    expect(glazeInstance.data.breakpoints.default).toEqual(
      "(min-width: 640px)",
    );
  });

  it("returns correct breakpoints", () => {
    const result = {
      default: "(min-width: 640px)",
      md: "(min-width: 768px)",
      lg: "(min-width: 1024px)",
    };
    expect(glazeInstance.data.breakpoints).toEqual(result);
  });

  it("returns correct elements", () => {
    expect(glazeInstance.data.elements).toHaveLength(10);
  });

  it("returns correct main timeline", () => {
    const result = {
      id: "main",
      data: {
        defaults: {
          ease: "linear",
        },
        yoyo: true,
      },
      // @ts-ignore
      elements: expect.toBeArrayOfSize(3),
      breakpoint: "(min-width: 640px)",
      timeline: undefined,
    };
    expect(glazeInstance.data.timelines[0]).toStrictEqual(result);
  });

  it("returns correct md timeline", () => {
    const result = {
      id: "md",
      data: {},
      // @ts-ignore
      elements: expect.toBeArrayOfSize(3),
      breakpoint: "(min-width: 768px)",
      timeline: undefined,
    };
    expect(glazeInstance.data.timelines[1]).toStrictEqual(result);
  });

  it("returns correct lg timeline", () => {
    const result = {
      id: expect.any(String),
      data: {},
      // @ts-ignore
      elements: expect.toBeArrayOfSize(2),
      breakpoint: "(min-width: 1024px)",
      timeline: undefined,
    };
    expect(glazeInstance.data.timelines[2]).toStrictEqual(result);
  });

  it("returns correct animations", () => {
    expect(glazeInstance.data.animations).toHaveLength(9);
  });

  it("second last animation returns correct animation object", () => {
    const result = {
      breakpoint: "(min-width: 640px)",
      data: {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 10,
        },
      },
      element: expect.any(HTMLElement),
    };
    expect(
      glazeInstance.data.elements[glazeInstance.data.elements.length - 2],
    ).toStrictEqual(result);
  });

  it("last animation returns correct animation object", () => {
    const result = {
      breakpoint: "(min-width: 1024px)",
      data: {
        from: {
          opacity: 0,
          x: 50,
        },
        selector: {
          value: "&>div",
        },
      },
      element: expect.any(HTMLElement),
    };
    expect(
      glazeInstance.data.elements[glazeInstance.data.elements.length - 1],
    ).toStrictEqual(result);
  });
});
