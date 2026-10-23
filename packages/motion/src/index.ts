import type {
  AnimationMedia,
  AnimationPosition,
  AnimationTargets,
  AnimationTimeline,
  AnimationValues,
  GlazeAdapter,
} from "@glazejs/shared"
import { readStyleValue, scopeMotion } from "motion"
import type {
  AnimationPlaybackControls,
  AnimationSequence,
  DOMKeyframesDefinition,
  Easing,
  MotionScope,
  SegmentTransitionOptions,
  SequenceOptions,
  stagger,
} from "motion"

/** The Motion APIs used to animate DOM elements and distribute delays. */
export interface MotionLibrary {
  animate(
    sequence: AnimationSequence,
    options?: SequenceOptions
  ): AnimationPlaybackControls
  stagger: typeof stagger
}

const transitionKeys = new Set([
  "duration",
  "delay",
  "ease",
  "repeat",
  "repeatDelay",
  "yoyo",
  "stagger",
])
const unsupportedKeys = new Set([
  "scrollTrigger",
  "autoAlpha",
  "xPercent",
  "yPercent",
  "svgOrigin",
  "clearProps",
  "overwrite",
  "immediateRender",
  "runBackwards",
  "startAt",
  "onStart",
  "onUpdate",
  "onComplete",
  "onRepeat",
  "onReverseComplete",
  "callbackScope",
  "repeatRefresh",
  "yoyoEase",
  "keyframes",
  "motionPath",
  "drawSVG",
  "morphSVG",
  "inertia",
  "snap",
  "modifiers",
  "attr",
  "css",
  "paused",
])
const aliases: Record<string, string> = {
  rotation: "rotate",
  rotationX: "rotateX",
  rotationY: "rotateY",
  rotationZ: "rotateZ",
}

function unsupported(key: string): never {
  throw new Error(
    `Glaze Motion adapter does not support "${key}". Use the GSAP adapter for GSAP-specific features.`
  )
}

function numberOption(value: unknown, key: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      `Glaze Motion adapter requires a finite number for "${key}".`
    )
  }
  return value
}

function easing(value: unknown): Easing {
  if (typeof value !== "string") unsupported("ease")
  if (value === "none" || value === "linear") return "linear"
  const named: Record<string, Easing> = {
    easeIn: "easeIn",
    easeOut: "easeOut",
    easeInOut: "easeInOut",
    circIn: "circIn",
    circOut: "circOut",
    circInOut: "circInOut",
    backIn: "backIn",
    backOut: "backOut",
    backInOut: "backInOut",
    anticipate: "anticipate",
  }
  if (Object.hasOwn(named, value)) return named[value]
  const match = value.match(
    /^(power[0-4]|sine|expo|circ|back)(?:\.(in|out|inOut))?$/
  )
  if (!match) unsupported(`ease: ${value}`)
  const family = match[1]
  const direction = match[2] ?? "out"
  if (family === "circ" || family === "back") {
    return `${family}${direction[0].toUpperCase()}${direction.slice(1)}` as Easing
  }
  const power = family.startsWith("power") ? Number(family.slice(5)) + 1 : 0
  const easeIn = (progress: number) => {
    if (family === "sine") return 1 - Math.cos((progress * Math.PI) / 2)
    if (family === "expo") return progress === 0 ? 0 : 2 ** (10 * progress - 10)
    return progress ** power
  }
  if (direction === "in") return easeIn
  if (direction === "out") return (progress) => 1 - easeIn(1 - progress)
  return (progress) =>
    progress < 0.5
      ? easeIn(progress * 2) / 2
      : 1 - easeIn((1 - progress) * 2) / 2
}

function transition(values: AnimationValues): SegmentTransitionOptions {
  const result: SegmentTransitionOptions = {}
  for (const key of ["duration", "delay", "repeatDelay"] as const) {
    if (values[key] !== undefined) result[key] = numberOption(values[key], key)
  }
  if (values.ease !== undefined) result.ease = easing(values.ease)
  if (values.repeat !== undefined) {
    const repeat = numberOption(values.repeat, "repeat")
    if (!Number.isInteger(repeat) || repeat < 0 || repeat >= 20) {
      unsupported("element repeat outside 0–19; put repeat on the timeline")
    }
    result.repeat = repeat
  }
  if (values.yoyo !== undefined) {
    if (typeof values.yoyo !== "boolean") unsupported("non-boolean yoyo")
    result.repeatType = values.yoyo ? "reverse" : "loop"
  }
  return result
}

function keyframes(values: AnimationValues): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(values)) {
    if (transitionKeys.has(key)) continue
    if (unsupportedKeys.has(key)) unsupported(key)
    if (typeof value !== "string" && typeof value !== "number") unsupported(key)
    if (typeof value === "string" && /^[+-]=/.test(value)) {
      unsupported(`relative value for ${key}`)
    }
    result[aliases[key] ?? key] = value
  }
  return result
}

function resolveTargets(targets: AnimationTargets): Element[] {
  if (typeof targets === "string")
    return Array.from(document.querySelectorAll(targets))
  return targets instanceof Element ? [targets] : Array.from(targets)
}

function naturalValue(element: HTMLElement | SVGElement, key: string) {
  const value = readStyleValue(element, key)
  return typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
    ? Number(value)
    : value
}

function position(value?: AnimationPosition): AnimationPosition {
  if (value === undefined) return "+0"
  if (typeof value === "number") return numberOption(value, "timeline position")
  if (value.trim() !== "" && Number.isFinite(Number(value)))
    return Number(value)
  if (value === ">") return "+0"
  if (value === "<") return value
  if (/^(?:[+-]=|<[+-]=?|<)(?:\d+(?:\.\d+)?|\.\d+)$/.test(value))
    return value.replace("=", "")
  unsupported(`timeline position: ${value}`)
}

function createMedia(): AnimationMedia {
  const disposers: Array<() => void> = []
  return {
    add(queries, callback) {
      const lists = Object.entries(queries).map(
        ([key, query]) => [key, window.matchMedia(query)] as const
      )
      let cleanup: void | (() => void)
      const update = () => {
        cleanup?.()
        cleanup = undefined
        const conditions = Object.fromEntries(
          lists.map(([key, list]) => [key, list.matches])
        )
        if (Object.values(conditions).some(Boolean))
          cleanup = callback({ conditions })
      }
      for (const [, list] of lists) list.addEventListener("change", update)
      disposers.push(() => {
        for (const [, list] of lists) list.removeEventListener("change", update)
        cleanup?.()
        cleanup = undefined
      })
      update()
    },
    revert() {
      for (const dispose of disposers.splice(0)) dispose()
    },
  }
}

function createTimeline(
  library: MotionLibrary,
  settings: AnimationValues
): AnimationTimeline {
  const options: SequenceOptions = {}
  const defaults: AnimationValues = { duration: 0.5, ease: "power1.out" }
  for (const [key, value] of Object.entries(settings)) {
    if (key === "paused") continue
    if (key === "defaults") {
      if (!value || typeof value !== "object" || Array.isArray(value))
        unsupported(key)
      Object.assign(defaults, value)
    } else if (key === "delay" || key === "repeatDelay") {
      options[key] = numberOption(value, key)
    } else if (key === "repeat") {
      const repeat = numberOption(value, key)
      if (!Number.isInteger(repeat) || repeat < -1) unsupported(key)
      options.repeat = repeat === -1 ? Infinity : repeat
    } else if (key === "yoyo" && typeof value === "boolean") {
      options.repeatType = value ? "reverse" : "loop"
    } else unsupported(key)
  }
  const sequence: AnimationSequence = []
  let controls: AnimationPlaybackControls | undefined
  let scope: MotionScope | undefined
  let group = 0

  function append(
    targets: AnimationTargets,
    from: AnimationValues | undefined,
    to: AnimationValues | undefined,
    at?: AnimationPosition
  ) {
    const values = { ...defaults, ...(from ?? {}), ...(to ?? {}) }
    const timing = transition(values)
    const fromValues = from ? keyframes({ ...defaults, ...from }) : undefined
    const toValues = to ? keyframes({ ...defaults, ...to }) : undefined
    // Validate defaults and timing even when the selector matches no elements.
    keyframes(values)
    const elements = resolveTargets(targets)
    if (!elements.length) return timeline
    const delay = timing.delay ?? 0
    const staggerDelay =
      values.stagger === undefined
        ? () => numberOption(delay, "delay")
        : library.stagger(numberOption(values.stagger, "stagger"), {
            startDelay: numberOption(delay, "delay"),
          })
    const label = `glaze-motion-${++group}`
    sequence.push({ name: label, at: position(at) })
    const entries = elements
      .map((element, index) => ({
        element,
        delay: staggerDelay(index, elements.length),
      }))
      .sort((a, b) => a.delay - b.delay)
    for (const { element, delay: elementDelay } of entries) {
      const frames: Record<string, string | number | Array<string | number>> =
        {}
      const properties = new Set([
        ...Object.keys(fromValues ?? {}),
        ...Object.keys(toValues ?? {}),
      ])
      for (const key of properties) {
        const fromValue = fromValues?.[key]
        const toValue = toValues?.[key]
        if (fromValue === undefined && toValue !== undefined)
          frames[key] = toValue
        else if (fromValue !== undefined) {
          if (
            !(element instanceof HTMLElement || element instanceof SVGElement)
          )
            unsupported("non-HTML/SVG targets")
          frames[key] = [fromValue, toValue ?? naturalValue(element, key)]
        }
      }
      sequence.push([
        element,
        frames as DOMKeyframesDefinition,
        { ...timing, delay: elementDelay, at: label },
      ])
    }
    return timeline
  }

  const timeline: AnimationTimeline = {
    from: (targets, values, at) => append(targets, values, undefined, at),
    to: (targets, values, at) => append(targets, undefined, values, at),
    fromTo: (targets, from, to, at) => append(targets, from, to, at),
    progress(value) {
      if (controls) controls.time = controls.duration * value
      return timeline
    },
    clear() {
      controls?.cancel()
      scope?.cancel()
      scope = undefined
      controls = undefined
      sequence.length = 0
      return timeline
    },
    restart() {
      controls?.cancel()
      scope?.cancel()
      scope = undefined
      if (sequence.length) {
        scope = scopeMotion(() => {})
        try {
          scope.run(() => {
            controls = library.animate(sequence, options)
          })
        } catch (error) {
          scope.cancel()
          scope = undefined
          controls = undefined
          throw error
        }
      }
      return timeline
    },
    pause() {
      controls?.pause()
      return timeline
    },
    kill() {
      timeline.clear()
      return timeline
    },
  }
  return timeline
}

/**
 * Create a Motion backend for declarative DOM animation utilities.
 * @param library - The animate and stagger exports from the motion package.
 * @returns An adapter with native media-query and playback cleanup.
 */
export function createMotionAdapter(library: MotionLibrary): GlazeAdapter {
  return {
    name: "motion",
    createTimeline: (values) => createTimeline(library, values),
    createMedia,
  }
}
