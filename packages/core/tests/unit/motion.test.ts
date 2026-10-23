import { scopeMotion, stagger } from "motion"
import type { AnimationPlaybackControls, MotionScope } from "motion"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createMotionAdapter } from "../../src/motion.ts"
import type { MotionLibrary } from "../../src/motion.ts"

function driver() {
  const controls: AnimationPlaybackControls = {
    time: 0,
    speed: 1,
    startTime: 0,
    state: "running",
    duration: 2,
    iterationDuration: 2,
    finished: Promise.resolve(),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    complete: vi.fn(),
    attachTimeline: vi.fn(() => () => {}),
  }
  const animate = vi.fn<MotionLibrary["animate"]>(() => controls)
  const spread = vi.fn(stagger)
  return {
    controls,
    animate,
    spread,
    adapter: createMotionAdapter({ animate, stagger: spread }),
  }
}

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe("Motion backend", () => {
  it("cancels partially initialized Motion scopes when animate throws", () => {
    let nested: MotionScope | undefined
    const adapter = createMotionAdapter({
      stagger,
      animate: () => {
        nested = scopeMotion(() => {})
        throw new Error("Motion setup failed")
      },
    })
    const timeline = adapter.createTimeline({})
    timeline.to(document.body, { opacity: 0.5 })
    expect(() => timeline.restart()).toThrow("Motion setup failed")
    expect(nested?.state).toBe("cancelled")
    timeline.kill?.()
  })

  it("calls Motion with translated states, defaults, positions and stagger", () => {
    document.body.innerHTML = `<div></div><div></div>`
    const { adapter, animate, spread } = driver()
    const timeline = adapter.createTimeline({
      defaults: { duration: 1, ease: "none" },
      repeat: -1,
      yoyo: true,
    })
    timeline.fromTo(document.body.children[0], { x: -20 }, { x: 40 }, 0)
    timeline.to(
      Array.from(document.body.children),
      { rotation: 90, stagger: 0.2 },
      "-=0.5"
    )
    timeline.restart()
    expect(animate).toHaveBeenCalledTimes(1)
    const [sequence, options] = animate.mock.calls[0]
    expect(options).toEqual({ repeat: Infinity, repeatType: "reverse" })
    expect(sequence).toEqual([
      { name: "glaze-motion-1", at: 0 },
      [
        document.body.children[0],
        { x: [-20, 40] },
        { duration: 1, ease: "linear", delay: 0, at: "glaze-motion-1" },
      ],
      { name: "glaze-motion-2", at: "-0.5" },
      [
        document.body.children[0],
        { rotate: 90 },
        { duration: 1, ease: "linear", delay: 0, at: "glaze-motion-2" },
      ],
      [
        document.body.children[1],
        { rotate: 90 },
        { duration: 1, ease: "linear", delay: 0.2, at: "glaze-motion-2" },
      ],
    ])
    expect(spread).toHaveBeenCalledWith(0.2, { startDelay: 0 })
  })

  it("reads each element's natural endpoint for from animations", () => {
    document.body.innerHTML = `<div style="opacity: 0.8"></div><div style="opacity: 0.5"></div>`
    const { adapter, animate } = driver()
    const timeline = adapter.createTimeline({})
    timeline.from(Array.from(document.body.children), { opacity: 0 })
    timeline.restart()
    const sequence = animate.mock.calls[0][0]
    expect(sequence[1]).toEqual([
      document.body.children[0],
      { opacity: [0, 0.8] },
      expect.any(Object),
    ])
    expect(sequence[2]).toEqual([
      document.body.children[1],
      { opacity: [0, 0.5] },
      expect.any(Object),
    ])
  })

  it("seeks, pauses and cancels playback on clear and kill", () => {
    const { adapter, controls, animate } = driver()
    const timeline = adapter.createTimeline({})
    timeline.to(document.body, { opacity: 0 })
    timeline.restart()
    timeline.progress(0.5)
    expect(controls.time).toBe(1)
    timeline.pause?.()
    expect(controls.pause).toHaveBeenCalledTimes(1)
    timeline.kill?.()
    timeline.restart()
    expect(controls.cancel).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledTimes(1)
  })

  it("rejects GSAP-only settings and unsupported repeats explicitly", () => {
    const { adapter } = driver()
    expect(() =>
      adapter.createTimeline({ scrollTrigger: { trigger: document.body } })
    ).toThrow('does not support "scrollTrigger"')
    const timeline = adapter.createTimeline({})
    expect(() => timeline.to(document.body, { autoAlpha: 0 })).toThrow(
      "autoAlpha"
    )
    expect(() => timeline.to(document.body, { x: "+=20" })).toThrow(
      "relative value"
    )
    expect(() => timeline.to(document.body, { x: 20, repeat: -1 })).toThrow(
      "put repeat on the timeline"
    )
    expect(() => timeline.to(document.body, { x: 20 }, "+=50%")).toThrow(
      "timeline position"
    )
    expect(() =>
      timeline.to(document.body, { x: 20 }, "missing-label")
    ).toThrow("timeline position")
  })

  it("removes media listeners and callback cleanup on revert", () => {
    const listeners = new Set<() => void>()
    const query = {
      matches: true,
      addEventListener: vi.fn((_event: string, callback: () => void) =>
        listeners.add(callback)
      ),
      removeEventListener: vi.fn((_event: string, callback: () => void) =>
        listeners.delete(callback)
      ),
    }
    vi.stubGlobal("matchMedia", () => query)
    const { adapter } = driver()
    const media = adapter.createMedia()
    const cleanup = vi.fn()
    const render = vi.fn(() => cleanup)
    media.add({ wide: "(min-width: 800px)" }, render)
    expect(render).toHaveBeenLastCalledWith({ conditions: { wide: true } })
    query.matches = false
    for (const listener of listeners) listener()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(render).toHaveBeenCalledTimes(1)
    query.matches = true
    for (const listener of listeners) listener()
    expect(render).toHaveBeenCalledTimes(2)
    media.revert?.()
    media.revert?.()
    expect(cleanup).toHaveBeenCalledTimes(2)
    expect(listeners.size).toBe(0)
  })
})
