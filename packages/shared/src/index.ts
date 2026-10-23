/** Values parsed from Glaze animation utilities. */
export type AnimationValues = Record<string, unknown>

/** DOM targets accepted by an animation adapter. */
export type AnimationTargets =
  | Element
  | Element[]
  | NodeListOf<Element>
  | string

/** Position of a tween within its timeline. */
export type AnimationPosition = string | number

/** Timeline operations used by the engine-independent orchestrator. */
export interface AnimationTimeline {
  from(
    targets: AnimationTargets,
    values: AnimationValues,
    position?: AnimationPosition
  ): unknown
  to(
    targets: AnimationTargets,
    values: AnimationValues,
    position?: AnimationPosition
  ): unknown
  fromTo(
    targets: AnimationTargets,
    from: AnimationValues,
    to: AnimationValues,
    position?: AnimationPosition
  ): unknown
  progress(value: number): unknown
  clear(): unknown
  restart(): unknown
  pause?(): unknown
  kill?(): unknown
  scrollTrigger?: { isActive?: boolean }
}

/** Active named media queries passed to an adapter's render callback. */
export interface AnimationMediaContext {
  conditions?: Record<string, boolean>
}

/** Responsive context that owns its listeners and render cleanup. */
export interface AnimationMedia {
  add(
    queries: Record<string, string>,
    callback: (context: AnimationMediaContext) => void | (() => void)
  ): unknown
  revert?(): unknown
}

/** Engine boundary for timelines, responsive rendering and transform resets. */
export interface GlazeAdapter<
  Timeline extends AnimationTimeline = AnimationTimeline,
> {
  name: string
  createTimeline(values: AnimationValues): Timeline
  createMedia(): AnimationMedia
  reset?(targets: AnimationTargets): void
}
