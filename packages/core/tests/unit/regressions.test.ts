import type { AnimationMediaContext, GlazeAdapter } from "@glazejs/shared"
import { afterEach, describe, expect, it, vi } from "vitest"
import glaze from "../../src/index.ts"
import type { GlazeInstance } from "../../src/index.ts"

const instances: GlazeInstance[] = []

function recordingAdapter(
  conditions: Record<string, boolean> = { "(min-width: 1px)": true }
) {
  const created: ReturnType<typeof makeTimeline>[] = []
  let callback:
    | ((context: AnimationMediaContext) => void | (() => void))
    | undefined
  let cleanup: void | (() => void)
  const revert = vi.fn(() => {
    cleanup?.()
    cleanup = undefined
  })
  function makeTimeline() {
    return {
      from: vi.fn(),
      to: vi.fn(),
      fromTo: vi.fn(),
      progress: vi.fn(),
      clear: vi.fn(),
      restart: vi.fn(),
      pause: vi.fn(),
      kill: vi.fn(),
    }
  }
  const add = vi.fn(
    (_queries: Record<string, string>, handler: typeof callback) => {
      callback = handler
      cleanup = callback?.({ conditions })
    }
  )
  const adapter: GlazeAdapter = {
    name: "recording",
    createTimeline: vi.fn(() => {
      const timeline = makeTimeline()
      created.push(timeline)
      return timeline
    }),
    createMedia: vi.fn(() => ({ add, revert })),
  }
  return {
    adapter,
    created,
    add,
    revert,
    resize(next: Record<string, boolean>) {
      cleanup?.()
      cleanup = callback?.({ conditions: next })
    },
  }
}

function start(config: Parameters<typeof glaze>[0]) {
  const instance = glaze(config)
  instances.push(instance)
  return instance
}

afterEach(() => {
  for (const instance of instances.splice(0)) instance.destroy()
  vi.useRealTimers()
  document.body.replaceChildren()
})

describe("element defaults", () => {
  it("applies shared settings to existing states and explicit values win", () => {
    document.body.innerHTML = `<div data-animate="to:x-40|duration-0.25"></div>`
    const { adapter, created } = recordingAdapter()
    start({
      adapter,
      defaults: {
        elementSettings: "duration-2|ease-linear",
        element: "duration-1 to:opacity-0.8 from:opacity-0",
      },
    })
    expect(created[0].to).toHaveBeenCalledWith(
      document.body.firstElementChild,
      { x: 40, duration: 0.25, ease: "linear", opacity: 0.8 },
      undefined
    )
    expect(created[0].fromTo).not.toHaveBeenCalled()
    expect(created[0].restart).toHaveBeenCalledTimes(1)
  })

  it("keeps from-only animations and deep-merges state defaults", () => {
    document.body.innerHTML = `<div data-animate="from:x-50|duration-0.1"></div>`
    const { adapter, created } = recordingAdapter()
    start({
      adapter,
      defaults: { element: "duration-1 from:opacity-0 to:x-100" },
    })
    expect(created[0].from).toHaveBeenCalledWith(
      document.body.firstElementChild,
      { x: 50, opacity: 0, duration: 0.1 },
      undefined
    )
    expect(created[0].fromTo).not.toHaveBeenCalled()
  })
})

describe("responsive presets", () => {
  it("preserves source order even when breakpoint tokens are interleaved", () => {
    document.body.innerHTML = `<div data-animate="@wide:to:x-50 @small:to:x-10 @wide:to:y-20"></div>`
    const { adapter, created } = recordingAdapter({
      "(min-width: 1px)": true,
      "(min-width: 800px)": true,
      "(min-width: 400px)": true,
    })
    start({
      adapter,
      breakpoints: { small: "(min-width: 400px)", wide: "(min-width: 800px)" },
    })
    expect(created[0].to).toHaveBeenCalledWith(
      document.body.firstElementChild,
      { x: 10, y: 20 },
      undefined
    )
  })

  it("expands responsive attribute and both class-prefix forms in place", () => {
    document.body.innerHTML = `
      <div data-animate="@wide:preset-slide @wide:to:x-40"></div>
      <div class="animate-@wide:preset-slide"></div>
      <div class="@wide:animate-preset-slide"></div>
    `
    const small = { "(min-width: 1px)": true, "(min-width: 800px)": false }
    const recorder = recordingAdapter(small)
    const instance = start({
      adapter: recorder.adapter,
      breakpoints: { wide: "(min-width: 800px)" },
      className: "animate",
      presets: { slide: "from:x-100 to:x-20|duration-1" },
    })
    expect(instance.timelines).toHaveLength(3)
    expect(recorder.add).toHaveBeenCalledTimes(1)
    for (const timeline of recorder.created)
      expect(timeline.fromTo).not.toHaveBeenCalled()
    recorder.resize({ ...small, "(min-width: 800px)": true })
    expect(instance.timelines[0].timeline.fromTo).toHaveBeenLastCalledWith(
      document.body.children[0],
      { x: 100 },
      { x: 40, duration: 1 },
      undefined
    )
    expect(instance.timelines[1].timeline.fromTo).toHaveBeenLastCalledWith(
      document.body.children[1],
      { x: 100 },
      { x: 20, duration: 1 },
      undefined
    )
    expect(instance.timelines[2].timeline.fromTo).toHaveBeenCalledTimes(1)
  })

  it("detects recursive presets without leaving animation resources alive", () => {
    document.body.innerHTML = `<div data-animate="preset-a"></div>`
    const { adapter, created } = recordingAdapter()
    expect(() =>
      glaze({ adapter, presets: { a: "preset-b", b: "preset-a" } })
    ).toThrow("Circular Glaze preset: a -> b -> a")
    expect(created).toHaveLength(0)
  })
})

describe("timeline ownership", () => {
  it("uses the closest wrapper unless an explicit timeline link overrides it", () => {
    document.body.innerHTML = `<div data-animate="tl/outer">
      <div data-animate="tl/inner">
        <div id="inner" data-animate="to:x-20"></div>
        <div id="linked" data-animate="tl:outer to:x-30"></div>
      </div>
    </div>`
    const { adapter, created } = recordingAdapter()
    const instance = start({ adapter })
    expect(
      instance.timelines.map((timeline) => timeline.elements.size)
    ).toEqual([1, 1])
    expect(created[0].to).toHaveBeenCalledExactlyOnceWith(
      document.querySelector("#linked"),
      { x: 30 },
      undefined
    )
    expect(created[1].to).toHaveBeenCalledExactlyOnceWith(
      document.querySelector("#inner"),
      { x: 20 },
      undefined
    )
  })

  it("creates ScrollTrigger only for a matching responsive state", () => {
    document.body.innerHTML = `<div data-animate="to:x-40 @wide:to:scrollTrigger.trigger-[&]"></div>`
    const small = { "(min-width: 1px)": true, "(min-width: 800px)": false }
    const recorder = recordingAdapter(small)
    const instance = start({
      adapter: recorder.adapter,
      breakpoints: { wide: "(min-width: 800px)" },
    })
    expect(recorder.adapter.createTimeline).toHaveBeenCalledExactlyOnceWith({
      paused: true,
    })
    recorder.resize({ ...small, "(min-width: 800px)": true })
    expect(recorder.adapter.createTimeline).toHaveBeenLastCalledWith({
      paused: true,
      scrollTrigger: { trigger: document.body.firstElementChild },
    })
    expect(instance.timelines[0].timeline.to).toHaveBeenLastCalledWith(
      document.body.firstElementChild,
      { x: 40 },
      undefined
    )
    recorder.resize(small)
    expect(recorder.adapter.createTimeline).toHaveBeenLastCalledWith({
      paused: true,
    })
  })
})

describe("lifecycle", () => {
  it("stops all playback and listeners if a responsive rebuild fails", () => {
    document.body.innerHTML = `<div data-animate="to:x-10"></div><div data-animate="to:x-20"></div>`
    const recorder = recordingAdapter()
    const instance = start({ adapter: recorder.adapter })
    const createTimeline = recorder.adapter.createTimeline
    recorder.adapter.createTimeline = (settings) => {
      const timeline = createTimeline(settings)
      if (recorder.created.length === 4)
        timeline.to = () => {
          throw new Error("Resize failed")
        }
      return timeline
    }
    expect(() => recorder.resize({ "(min-width: 1px)": true })).toThrow(
      "Resize failed"
    )
    expect(instance.timelines).toHaveLength(0)
    expect(recorder.created[2].kill).toHaveBeenCalledTimes(1)
    expect(recorder.created[3].kill).toHaveBeenCalledTimes(1)
    expect(recorder.revert).toHaveBeenCalledTimes(1)
    instance.refresh()
    expect(recorder.created).toHaveLength(4)
  })

  it("does not restart animations for unrelated class or text changes", async () => {
    vi.useFakeTimers()
    document.body.innerHTML = `<div data-animate="to:x-10"></div><button>Counter: 0</button>`
    const { adapter, created } = recordingAdapter()
    start({ adapter, className: "animate", watch: { debounceTime: 0 } })
    const button = document.querySelector("button")
    if (!button) throw new Error("Missing fixture")
    button.className = "hover"
    button.textContent = "Counter: 1"
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1)
    expect(created).toHaveLength(1)
    button.className = "animate-to:x-40"
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1)
    expect(created).toHaveLength(3)
  })

  it("cleans resources and original styles when initialization fails", () => {
    document.body.innerHTML = `<div style="opacity: 0.8" data-animate="to:x-20"></div>`
    const element = document.body.firstElementChild
    if (!element) throw new Error("Missing fixture")
    const { adapter, created, revert } = recordingAdapter()
    const createTimeline = adapter.createTimeline
    adapter.createTimeline = (settings) => {
      const timeline = createTimeline(settings)
      timeline.to = () => {
        element.setAttribute("style", "transform: translateX(20px)")
        throw new Error("Backend initialization failed")
      }
      return timeline
    }
    expect(() => glaze({ adapter })).toThrow("Backend initialization failed")
    expect(created[0].kill).toHaveBeenCalledTimes(1)
    expect(revert).toHaveBeenCalledTimes(1)
    expect(element.getAttribute("style")).toBe("opacity: 0.8")
  })

  it("restores detached targets when watched DOM nodes are removed", async () => {
    vi.useFakeTimers()
    document.body.innerHTML = `<div style="color: red" data-animate="to:x-20"></div>`
    const element = document.body.firstElementChild
    if (!element) throw new Error("Missing fixture")
    const { adapter, created } = recordingAdapter()
    const instance = start({ adapter, watch: { debounceTime: 10 } })
    element.setAttribute("style", "transform: translateX(20px)")
    element.remove()
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(10)
    expect(element.getAttribute("style")).toBe("color: red")
    expect(created[0].kill).toHaveBeenCalledTimes(1)
    expect(instance.timelines).toHaveLength(0)
  })

  it("restores exact inline styles and refreshes without accumulating timelines", () => {
    document.body.innerHTML = `<div style="color: red; transform: translateX(5px)" data-animate="to:x-50"></div>`
    const element = document.body.firstElementChild
    if (!element) throw new Error("Missing fixture")
    const original = element.getAttribute("style")
    const { adapter, created, revert } = recordingAdapter()
    const instance = start({ adapter })
    element.setAttribute("style", "transform: translateX(50px)")
    instance.refresh()
    expect(element.getAttribute("style")).toBe(original)
    expect(instance.timelines).toHaveLength(1)
    expect(created[0].kill).toHaveBeenCalledTimes(1)
    element.setAttribute("style", "opacity: 0")
    instance.destroy()
    instance.destroy()
    instance.refresh()
    expect(element.getAttribute("style")).toBe(original)
    expect(created[1].kill).toHaveBeenCalledTimes(1)
    expect(revert).toHaveBeenCalledTimes(2)
    expect(instance.timelines).toHaveLength(0)
  })

  it("watches changed attributes and added elements quietly, then disconnects", async () => {
    vi.useFakeTimers()
    document.body.innerHTML = `<div data-animate="to:x-5"></div>`
    const log = vi.spyOn(console, "log")
    const debug = vi.spyOn(console, "debug")
    const { adapter, created } = recordingAdapter()
    const instance = start({ adapter, watch: { debounceTime: 20 } })
    document.body.firstElementChild?.setAttribute("data-animate", "to:x-10")
    const added = document.createElement("div")
    added.setAttribute("data-animate", "from:opacity-0")
    document.body.append(added)
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(20)
    expect(instance.timelines).toHaveLength(2)
    expect(created[1].to).toHaveBeenCalledWith(
      document.body.firstElementChild,
      { x: 10 },
      undefined
    )
    expect(log).not.toHaveBeenCalled()
    expect(debug).not.toHaveBeenCalled()
    instance.destroy()
    added.setAttribute("data-animate", "to:x-20")
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(20)
    expect(created).toHaveLength(3)
  })
})
