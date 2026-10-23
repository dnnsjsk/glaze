import { describe, it, expect } from "vitest"
import parseToObject from "../../../src/utils/parseToObject.ts"

describe("parseToObject", () => {
  const element = document.createElement("div")

  it("parses grouped bare defaults, negative values and nested settings", () => {
    expect(
      parseToObject(
        "duration-0.3|delay--1 defaults:duration-2|ease-linear",
        true,
        element
      )
    ).toEqual({
      duration: 0.3,
      delay: -1,
      defaults: { duration: 2, ease: "linear" },
    })
  })

  it("ignores prototype-modifying root and nested paths", () => {
    const parsed = parseToObject(
      "constructor:prototype.polluted-true to:__proto__.polluted-true|constructor.prototype.polluted-true|x-20",
      false,
      element
    )
    expect(parsed).toEqual({ to: { x: 20 } })
    expect(Object.hasOwn(Object.prototype, "polluted")).toBe(false)
    expect(Object.getPrototypeOf(parsed.to)).toBe(Object.prototype)
  })

  it("does not split colons inside encoded CSS values", () => {
    expect(
      parseToObject(
        "to:background-[url(https://example.test/image.png)]",
        false,
        element
      )
    ).toEqual({ to: { background: "url(https://example.test/image.png)" } })
  })

  it("parses basic properties into an object", () => {
    const input = "to:opacity-1|scale-0.5"
    const expected = { to: { opacity: 1, scale: 0.5 } }
    expect(parseToObject(input, false, element)).toEqual(expected)
  })

  it("processes timelines correctly", () => {
    const input = "tl:[-=5] from:opacity-0|scale-0"
    const expected = { tl: { value: "-=5" }, from: { opacity: 0, scale: 0 } }
    expect(parseToObject(input, true, element)).toEqual(expected)
  })

  it("assigns from and to properties correctly", () => {
    const input = "from:opacity-0|scale-0 to:opacity-1|scale-[1]"
    const expected = {
      from: { opacity: 0, scale: 0 },
      to: { opacity: 1, scale: 1 },
    }
    expect(parseToObject(input, false, element)).toEqual(expected)
  })

  it("assigns nested objects using dot notation correctly", () => {
    const input = "from:opacity-0|scale-0|scrollTrigger.trigger-[.test]"
    const expected = {
      from: { opacity: 0, scale: 0, scrollTrigger: { trigger: ".test" } },
    }
    expect(parseToObject(input, false, element)).toEqual(expected)
  })

  it("assigns nested objects using dot notation correctly", () => {
    const input = "from:opacity-0|scale-0|scrollTrigger.trigger-[.test]"
    const expected = {
      from: { opacity: 0, scale: 0, scrollTrigger: { trigger: ".test" } },
    }
    expect(parseToObject(input, false, element)).toEqual(expected)
  })

  it("assigns selector correctly", () => {
    const input =
      "[div]:from:opacity-0|scale-0|scrollTrigger.trigger-[.test]|scrollTrigger.start-[top_top]"
    const expected = {
      selector: { value: "div" },
      from: {
        opacity: 0,
        scale: 0,
        scrollTrigger: { trigger: ".test", start: "top top" },
      },
    }
    expect(parseToObject(input, false, element)).toEqual(expected)
  })
})
