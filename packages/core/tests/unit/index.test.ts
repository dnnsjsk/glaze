import { describe, it, expect, beforeEach, vi } from "vitest";
import glaze from "../../src/index.ts";
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
        <div class="group animate-tl/main" data-animate="defaults:duration-3|ease-power2.inOut">
          <div class="box tl-main animate-to:x-500|background-red"></div>
          <div class="box tl-main" data-animate="tl:[-=2] to:x-500|background-red"></div>
        </div>
        <div class="box tl-main" data-animate="tl:main to:x-500|background-red"></div>
        <div class="group" data-animate="tl defaults:duration-3|ease-power2.inOut">
          <div class="box tl-two" data-animate="to:x-500|background-blue"></div>
          <div class="box tl-two" data-animate="tl:[-=2] to:x-500|background-blue @lg:to:background-navy"></div>
        </div>
        <div
          class="box tl-three animate-to:duration-2|x-500|background-green|ease-power2.inOut"
        ></div>
        <div
          class="tl-four"
          data-animate="to:duration-3|x-500|background-yellow|ease-power2.inOut @lg:to:background-purple"
        ></div>
        <div
          class="box tl-five"
          data-animate="to:duration-3|x-500|background-yellow|ease-power2.inOut @lg:to:background-purple"
        ></div>
        <div class="box tl-main" data-animate="tl:main-[-=2] to:x-500|background-red"></div>
        <div class="box tl-main animate-tl:main-[-=2]" data-animate="to:x-500|background-red"></div>
        <div class="group tl-six animate-@lg:[&>div]:to:x-500|background-yellow|duration-3|stagger-1.5|ease-power2.inOut">
          <div class="box"></div>
          <div class="box"></div>
          <div class="box"></div>
        </div>
      </div>
    `;
    container = document.getElementById("test-container") as HTMLElement;
    glazeInstance = glaze({
      lib: { gsap: { core: gsap } },
      breakpoints: {
        default: "(min-width: 640px)",
        lg: "(min-width: 1024px)",
      },
      element: container,
      className: "animate",
    });
  });

  it("throws an error if GSAP is not provided", () => {
    // @ts-ignore
    expect(() => glaze()).toThrow("GSAP not found");
  });

  it("returns correct base element", () => {
    expect(glazeInstance.state.element).toBe(container);
  });

  it("returns correct default breakpoint", () => {
    expect(glazeInstance.breakpoints.default).toEqual("(min-width: 640px)");
  });

  it("returns correct breakpoints", () => {
    const result = {
      default: "(min-width: 640px)",
      lg: "(min-width: 1024px)",
    };
    expect(glazeInstance.breakpoints).toEqual(result);
  });

  it("returns correct elements", () => {
    expect(
      glazeInstance.timelines
        .map((tl) => Array.from(tl.elements.keys()))
        .flat(),
    ).toHaveLength(11);
  });

  it("returns correct main timeline", () => {
    const tl = glazeInstance.timelines.find((tl) => tl.id === "main");
    console.log(tl);
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.id).toBe("main");
    expect(tl.data).toEqual({
      defaults: {
        duration: 3,
        ease: "power2.inOut",
      },
    });
    expect(elements).toHaveLength(5);
    expect(values[0]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          x: 500,
          background: "red",
        },
      },
    });
    expect(values[1]).toStrictEqual({
      "(min-width: 640px)": {
        tl: {
          value: "-=2",
        },
        to: {
          x: 500,
          background: "red",
        },
      },
    });
    expect(values[2]).toStrictEqual({
      "(min-width: 640px)": {
        tl: { main: undefined },
        to: {
          x: 500,
          background: "red",
        },
      },
    });
    expect(values[3]).toStrictEqual({
      "(min-width: 640px)": {
        tl: {
          main: "-=2",
        },
        to: {
          x: 500,
          background: "red",
        },
      },
    });
    expect(values[4]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          x: 500,
          background: "red",
        },
        tl: {
          main: "-=2",
        },
      },
    });
  });

  it("returns correct second timeline", () => {
    const tl = glazeInstance.timelines[1];
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.data).toStrictEqual({
      defaults: {
        duration: 3,
        ease: "power2.inOut",
      },
    });
    expect(elements).toHaveLength(2);
    expect(values[0]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          x: 500,
          background: "blue",
        },
      },
    });
    expect(values[1]).toStrictEqual({
      "(min-width: 640px)": {
        tl: {
          value: "-=2",
        },
        to: {
          x: 500,
          background: "blue",
        },
      },
      "(min-width: 1024px)": {
        to: {
          background: "navy",
        },
      },
    });
  });

  it("returns correct third timeline", () => {
    const tl = glazeInstance.timelines[2];
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.data).toStrictEqual({});
    expect(elements).toHaveLength(1);
    expect(values[0]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          duration: 2,
          x: 500,
          background: "green",
          ease: "power2.inOut",
        },
      },
    });
  });

  it("returns correct fourth timeline", () => {
    const tl = glazeInstance.timelines[3];
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.data).toStrictEqual({});
    expect(elements).toHaveLength(1);
    expect(values[0]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          duration: 3,
          x: 500,
          background: "yellow",
          ease: "power2.inOut",
        },
      },
      "(min-width: 1024px)": {
        to: {
          background: "purple",
        },
      },
    });
  });

  it("returns correct fifth timeline", () => {
    const tl = glazeInstance.timelines[4];
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.data).toStrictEqual({});
    expect(elements).toHaveLength(1);
    expect(values[0]).toStrictEqual({
      "(min-width: 640px)": {
        to: {
          duration: 3,
          x: 500,
          background: "yellow",
          ease: "power2.inOut",
        },
      },
      "(min-width: 1024px)": {
        to: {
          background: "purple",
        },
      },
    });
  });

  it("returns correct sixth timeline", () => {
    const tl = glazeInstance.timelines[5];
    if (!tl) throw new Error("Timeline not found");

    const elements = Array.from(tl.elements.keys());
    const values = Array.from(tl.elements.values());

    expect(tl.data).toStrictEqual({});
    expect(elements).toHaveLength(1);
    expect(values[0]).toStrictEqual({
      "(min-width: 1024px)": {
        selector: {
          value: "&>div",
        },
        to: {
          x: 500,
          background: "yellow",
          duration: 3,
          stagger: 1.5,
          ease: "power2.inOut",
        },
      },
    });
  });
});
