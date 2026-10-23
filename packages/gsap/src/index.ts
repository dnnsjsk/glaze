import type {
  AnimationMedia,
  AnimationTargets,
  AnimationTimeline,
  AnimationValues,
  GlazeAdapter,
} from "@glazejs/shared"

/** Structural GSAP API, so Motion consumers need no GSAP type dependency. */
export interface GsapLibrary<
  Timeline extends AnimationTimeline = AnimationTimeline,
> {
  timeline(values?: AnimationValues): Timeline
  matchMedia(): AnimationMedia
  set(targets: AnimationTargets, values: AnimationValues): unknown
}

/**
 * Adapt an existing GSAP instance, retaining its native timeline controls.
 * @param gsap - The GSAP instance configured by the application.
 * @returns The adapter used by Glaze's shared DOM orchestrator.
 */
export function createGsapAdapter<Timeline extends AnimationTimeline>(
  gsap: GsapLibrary<Timeline>
): GlazeAdapter<Timeline> {
  return {
    name: "gsap",
    createTimeline: (values) => gsap.timeline(values),
    createMedia: () => gsap.matchMedia(),
  }
}
