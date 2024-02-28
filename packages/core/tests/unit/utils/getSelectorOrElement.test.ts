import { describe, it, expect, beforeEach } from "vitest";
import getSelectorOrElement from "../../../src/utils/getSelectorOrElement";
import { GlazeAnimationObject } from "@/types.ts";

describe("getSelectorOrElement", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <div class="child" id="first-child"></div>
        <div class="child" id="second-child"></div>
      </div>
    `;
    container = document.getElementById("test-container") as HTMLElement;
  });

  it("returns the element if no valid selector is provided", () => {
    const result = getSelectorOrElement(container, "");
    expect(result).toBe(container);
  });

  it("returns the element if a string is provided", () => {
    const selector = ".child";
    const result = getSelectorOrElement(container, selector);
    expect(result).toBe(container);
  });

  it('queries all elements within the container if the selector starts with "&" and replace spaces', () => {
    const data: GlazeAnimationObject = { selector: { value: "&_.child" } };
    const result = getSelectorOrElement(container, data);
    expect(result).toBeInstanceOf(NodeList);
    expect(result).toHaveLength(2);
  });

  it('queries a single element within the container if the selector starts with "&" and single is true', () => {
    const data: GlazeAnimationObject = { selector: { value: "&>.child" } };
    const result = getSelectorOrElement(container, data, true);
    expect(result).toBeInstanceOf(Element);
    expect(result).toHaveProperty("id", "first-child");
  });
});
