import type { GsapLibrary } from "@glazejs/gsap"
import type {
  AnimationTimeline,
  AnimationValues,
  GlazeAdapter,
} from "@glazejs/shared"

/** Parsed utilities belonging to one element and one breakpoint. */
export interface GlazeAnimationCollection {
  data: GlazeAnimationObject
  element: Element
  breakpoint: string
}

/** Parsed animation states and optional selector or timeline metadata. */
export interface GlazeAnimationObject {
  from?: AnimationValues
  to?: AnimationValues
  selector?: { value?: string }
  tl?: AnimationValues
  [key: string]: AnimationValues | undefined
}

/** Engine-independent configuration for declarative DOM animations. */
export interface GlazeOptions {
  breakpoints?: Record<string, string | undefined>
  dataAttribute?: string
  defaults?: { tl?: string; element?: string; elementSettings?: string }
  className?: string
  element?: Document | Element
  presets?: Record<string, string>
  watch?: boolean | { debounceTime?: number }
}

/** Select either an explicit adapter or the backwards-compatible GSAP API. */
export type GlazeConfig<
  Timeline extends AnimationTimeline = AnimationTimeline,
> = GlazeOptions &
  (
    | { adapter: GlazeAdapter<Timeline>; lib?: never }
    | { lib: { gsap: { core: GsapLibrary<Timeline> } }; adapter?: never }
  )

/** Parsed settings supplied to a timeline. */
export type GlazeObjectSettings = AnimationValues

/** A timeline and the source elements whose utilities populate it. */
export interface GlazeTimeline<
  Timeline extends AnimationTimeline = AnimationTimeline,
> {
  breakpoint: string
  data: GlazeObjectSettings
  elements: Map<Element, Record<string, GlazeAnimationObject>>
  id: string
  timeline: Timeline
  timelineElement: Element
}

/** A plain object whose nested values may be merged into parsed utilities. */
export type PlainObject = AnimationValues

/** Normalized configuration exposed by a running Glaze instance. */
export interface GlazeState extends GlazeOptions {
  dataAttribute: string
  element: Document | Element
  breakpoints: { default: string; [key: string]: string }
}

/** A running Glaze instance with explicit refresh and cleanup controls. */
export interface GlazeInstance<
  Timeline extends AnimationTimeline = AnimationTimeline,
> {
  breakpoints: GlazeState["breakpoints"]
  state: GlazeState
  timelines: GlazeTimeline<Timeline>[]
  refresh(): void
  destroy(): void
}
