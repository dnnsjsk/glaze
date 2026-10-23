import { createGsapAdapter } from "@glazejs/gsap"
import type {
  AnimationMedia,
  AnimationTargets,
  AnimationTimeline,
  AnimationValues,
} from "@glazejs/shared"
import type {
  GlazeAnimationObject,
  GlazeConfig,
  GlazeInstance,
  GlazeState,
  GlazeTimeline,
} from "./types.ts"
import applyDefaults from "./utils/applyDefaults.ts"
import expandPresets from "./utils/expandPresets.ts"
import getSelectorOrElement from "./utils/getSelectorOrElement.ts"
import isObject from "./utils/isObject.ts"
import mergeDeep from "./utils/mergeDeep.ts"
import parseMediaQueries from "./utils/parseMediaQueries.ts"
import parseTimeline from "./utils/parseTimeline.ts"
import parseToObject from "./utils/parseToObject.ts"

/**
 * Animate declarative utilities with GSAP or an explicit animation adapter.
 * @param config - Engine, root element, defaults and responsive options.
 * @returns The running instance; destroy it when its DOM is unmounted.
 */
function glaze<Timeline extends AnimationTimeline = AnimationTimeline>(
  config: GlazeConfig<Timeline>
): GlazeInstance<Timeline> {
  if (!config || (!config.adapter && !config.lib?.gsap?.core)) {
    throw new Error(
      "GSAP not found. Provide lib.gsap.core or an animation adapter."
    )
  }
  const adapter = config.adapter ?? createGsapAdapter(config.lib.gsap.core)
  const { adapter: _adapter, lib: _lib, ...options } = config
  const state: GlazeState = {
    ...options,
    dataAttribute: options.dataAttribute ?? "data-animate",
    element: options.element ?? document,
    watch: options.watch ?? false,
    breakpoints: {
      default: "(min-width: 1px)",
      ...Object.fromEntries(
        Object.entries(options.breakpoints ?? {}).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      ),
    },
  }
  const breakpoints = state.breakpoints
  const defaultBp = breakpoints.default
  const timelines: GlazeTimeline<Timeline>[] = []
  const originalStyles = new Map<Element, string | null>()
  const utilityCache = new Map<Element, string>()
  const wrappers = new Set<GlazeTimeline<Timeline>>()
  const engineSettings = new Map<GlazeTimeline<Timeline>, AnimationValues>()
  let rendered = false
  let media: AnimationMedia | undefined
  let observer: MutationObserver | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let destroyed = false
  let idCounter = 0
  const getId = () => `glaze-${++idCounter}`
  const matchesTimeline = (attribute: string) =>
    /^(?:@[\w-]+:)?tl(?:\/[\w-]+)?$/.test(attribute)

  /**
   * Combine attribute and class utilities before expanding presets.
   * @param element - The element holding utility tokens.
   * @returns Expanded utilities in source order.
   */
  function getAttribute(element: Element) {
    const cached = utilityCache.get(element)
    if (cached !== undefined) return cached
    const attribute = element.getAttribute(state.dataAttribute) ?? ""
    const classes = state.className
      ? Array.from(element.classList)
          .map((name) => {
            const prefix = `${state.className}-`
            if (name.startsWith(prefix)) return name.slice(prefix.length)
            const responsive = name.match(/^(@[\w-]+:)(.*)$/)
            if (responsive?.[2]?.startsWith(prefix))
              return responsive[1] + responsive[2].slice(prefix.length)
            return ""
          })
          .filter(Boolean)
          .join(" ")
      : ""
    const utilities = expandPresets(`${attribute} ${classes}`, state.presets)
    utilityCache.set(element, utilities)
    return utilities
  }

  /**
   * Identify elements participating in this instance.
   * @param element - The candidate element.
   * @returns Whether the attribute or configured class prefix is present.
   */
  function isAnimated(element: Element) {
    return (
      element.hasAttribute(state.dataAttribute) ||
      Boolean(
        state.className &&
        Array.from(element.classList).some(
          (name) =>
            name.startsWith(`${state.className}-`) ||
            new RegExp(
              `^@[\\w-]+:${escapeRegExp(state.className ?? "")}-`
            ).test(name)
        )
      )
    )
  }

  /**
   * Collect matching descendants, including an animated root element.
   * @param root - The subtree to inspect.
   * @returns Animated elements in document order.
   */
  function getElements(root: Document | Element = state.element) {
    const elements = Array.from(root.querySelectorAll("*"))
    if (root instanceof Element && isAnimated(root)) elements.unshift(root)
    return elements.filter(isAnimated)
  }

  /**
   * Parse an element's utilities without applying defaults prematurely.
   * @param element - The source element.
   * @returns Parsed animation states grouped by media query.
   */
  function getElementData(
    element: Element
  ): Record<string, GlazeAnimationObject> {
    return Object.fromEntries(
      Object.entries(
        parseMediaQueries(getAttribute(element), breakpoints, defaultBp)
      ).map(([breakpoint, parts]) => [
        breakpoint,
        parseToObject(parts.join(" "), false, element),
      ])
    )
  }

  /**
   * Apply shared timeline defaults before explicit wrapper settings.
   * @param element - The source for relative selector values.
   * @param values - Explicit timeline settings.
   * @returns Merged timeline settings.
   */
  function timelineOptions(element: Element, values: AnimationValues) {
    return mergeDeep(
      {},
      state.defaults?.tl ? parseToObject(state.defaults.tl, true, element) : {},
      values
    )
  }

  /**
   * Keep active tokens in source order, including interleaved breakpoints.
   * @param element - The element with cached utility tokens.
   * @param conditions - Currently matching media queries.
   * @returns Active tokens with breakpoint and timeline markers removed.
   */
  function activeUtilities(
    element: Element,
    conditions: Record<string, boolean>
  ) {
    return getAttribute(element)
      .split(/\s+/)
      .flatMap((token) => {
        const match = token.match(/^@([\w-]+):/)
        const query = match ? breakpoints[match[1]] : defaultBp
        if (!query || !conditions[query] || matchesTimeline(token)) return []
        return [match ? token.slice(match[0].length) : token]
      })
      .join(" ")
  }

  function collect() {
    const elements = getElements()
    const owners = new Map<
      Element,
      NonNullable<ReturnType<typeof parseTimeline>>
    >()
    const named = new Map<string, Element>()
    for (const element of elements) {
      const data = getAttribute(element)
      if (!data.split(/\s+/).some(matchesTimeline)) continue
      const metadata = parseTimeline(data, breakpoints, defaultBp)
      if (!metadata) continue
      owners.set(element, metadata)
      if (metadata.id) named.set(metadata.id, element)
    }
    const memberships = new Map<Element, Element>()
    for (const element of elements) {
      if (owners.has(element)) continue
      const linked = getAttribute(element)
        .split(/\s+/)
        .map(
          (token) =>
            token
              .replace(/^@[\w-]+:/, "")
              .match(/^tl:([\w-]+?)(?:-\[.*\])?$/)?.[1]
        )
        .find((id) => id !== undefined && named.has(id))
      if (linked) {
        const owner = named.get(linked)
        if (owner) memberships.set(element, owner)
        continue
      }
      for (
        let ancestor = element.parentElement;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        if (owners.has(ancestor)) {
          memberships.set(element, ancestor)
          break
        }
      }
    }
    for (const [element, metadata] of owners) {
      const data = timelineOptions(
        element,
        parseToObject(
          getAttribute(element)
            .split(/\s+/)
            .filter((token) => !matchesTimeline(token))
            .join(" "),
          true,
          element
        )
      )
      const { scrollTrigger: _trigger, ...initialSettings } = data
      const timeline: GlazeTimeline<Timeline> = {
        breakpoint: metadata.breakpoint,
        data,
        elements: new Map(
          elements
            .filter((candidate) => memberships.get(candidate) === element)
            .map((candidate) => [candidate, getElementData(candidate)])
        ),
        id: metadata.id || getId(),
        timelineElement: element,
        timeline: adapter.createTimeline({ ...initialSettings, paused: true }),
      }
      wrappers.add(timeline)
      engineSettings.set(timeline, initialSettings)
      timelines.push(timeline)
    }
    for (const element of elements) {
      if (owners.has(element) || memberships.has(element)) continue
      const data = timelineOptions(element, {})
      const { scrollTrigger: _trigger, ...initialSettings } = data
      const timeline: GlazeTimeline<Timeline> = {
        breakpoint: defaultBp,
        data: {},
        elements: new Map([[element, getElementData(element)]]),
        id: getId(),
        timelineElement: element,
        timeline: adapter.createTimeline({ ...initialSettings, paused: true }),
      }
      engineSettings.set(timeline, initialSettings)
      timelines.push(timeline)
    }
  }

  /**
   * Resolve targets so their original inline styles can be retained.
   * @param targets - Targets accepted by the selected backend.
   * @returns The affected DOM elements.
   */
  function targetElements(targets: AnimationTargets) {
    if (typeof targets === "string") {
      const document = state.element.ownerDocument ?? state.element
      return Array.from(document.querySelectorAll(targets))
    }
    return targets instanceof Element ? [targets] : Array.from(targets)
  }

  /**
   * Save styles once before any backend mutates an element.
   * @param targets - Targets whose original styles should be retained.
   */
  function rememberTargets(targets: AnimationTargets) {
    for (const element of targetElements(targets)) {
      if (!originalStyles.has(element))
        originalStyles.set(element, element.getAttribute("style"))
    }
  }

  function restoreStyles() {
    for (const [element, style] of originalStyles) {
      adapter.reset?.(element)
      if (style === null) element.removeAttribute("style")
      else element.setAttribute("style", style)
    }
  }

  /**
   * Rebuild each timeline using only currently matching variants.
   * @param conditions - Active media query results from the backend.
   * @returns Cleanup to run before another media state is rendered.
   */
  function render(conditions: Record<string, boolean>) {
    for (const timeline of timelines) {
      timeline.timeline.pause?.()
      timeline.timeline.progress(0)
      timeline.timeline.clear()
    }
    restoreStyles()
    for (const timeline of timelines) {
      const active = Boolean(conditions[timeline.breakpoint])
      const animations = new Map<Element, GlazeAnimationObject>()
      const standaloneData: AnimationValues = {}
      if (active)
        for (const element of timeline.elements.keys()) {
          const animation = applyDefaults(
            parseToObject(activeUtilities(element, conditions), false, element),
            state.defaults,
            element
          )
          if (!wrappers.has(timeline))
            for (const name of ["from", "to"] as const) {
              const values = animation[name]
              if (values && Object.hasOwn(values, "scrollTrigger")) {
                standaloneData.scrollTrigger = values.scrollTrigger
                delete values.scrollTrigger
              }
            }
          animations.set(element, animation)
        }
      const settings = timelineOptions(
        timeline.timelineElement,
        wrappers.has(timeline)
          ? parseToObject(
              activeUtilities(timeline.timelineElement, conditions),
              true,
              timeline.timelineElement
            )
          : standaloneData
      )
      if (!active) delete settings.scrollTrigger
      if (rendered || !sameSettings(engineSettings.get(timeline), settings)) {
        timeline.timeline.kill?.()
        timeline.timeline = adapter.createTimeline({
          ...settings,
          paused: true,
        })
      }
      engineSettings.set(timeline, settings)
      timeline.data = wrappers.has(timeline) ? settings : standaloneData
      if (!active) continue
      for (const [element, values] of animations) {
        if (!values.from && !values.to) continue
        const targets = getSelectorOrElement(element, values)
        if (targets === null) continue
        rememberTargets(targets)
        const position = values.tl ? Object.values(values.tl)[0] : undefined
        const at =
          typeof position === "string" || typeof position === "number"
            ? position
            : undefined
        if (values.from && values.to)
          timeline.timeline.fromTo(targets, values.from, values.to, at)
        else if (values.to) timeline.timeline.to(targets, values.to, at)
        else if (values.from) timeline.timeline.from(targets, values.from, at)
      }
      if (timeline.timeline.scrollTrigger?.isActive !== false)
        timeline.timeline.restart()
    }
    rendered = true
    return () => {
      for (const timeline of timelines) {
        timeline.timeline.pause?.()
        timeline.timeline.progress(0)
        timeline.timeline.clear()
      }
      restoreStyles()
    }
  }

  function disposeAnimations() {
    media?.revert?.()
    media = undefined
    for (const timeline of timelines) timeline.timeline.kill?.()
    restoreStyles()
    originalStyles.clear()
    utilityCache.clear()
    wrappers.clear()
    engineSettings.clear()
    rendered = false
    timelines.length = 0
  }

  function refresh() {
    if (destroyed) return
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    disposeAnimations()
    try {
      collect()
      media = adapter.createMedia()
      media.add(
        Object.fromEntries(
          Object.values(breakpoints).map((query) => [query, query])
        ),
        (context) => {
          try {
            return render(context.conditions ?? {})
          } catch (error) {
            destroy()
            throw error
          }
        }
      )
    } catch (error) {
      destroy()
      throw error
    }
  }

  function destroy() {
    if (destroyed) return
    destroyed = true
    observer?.disconnect()
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    disposeAnimations()
  }

  /**
   * Check added, removed and reclassified nodes for animation relevance.
   * @param node - The changed DOM node or subtree.
   * @returns Whether this subtree contains an input or animation target.
   */
  function relevantNode(node: Node) {
    if (!(node instanceof Element)) return false
    const related = (element: Element) =>
      utilityCache.has(element) ||
      originalStyles.has(element) ||
      isAnimated(element)
    if (related(node) || Array.from(node.querySelectorAll("*")).some(related))
      return true
    for (const timeline of timelines)
      for (const [source, variants] of timeline.elements) {
        for (const values of Object.values(variants)) {
          if (!values.selector) continue
          const targets = getSelectorOrElement(source, values)
          if (
            targets &&
            targetElements(targets).some(
              (element) => element === node || node.contains(element)
            )
          )
            return true
        }
      }
    return false
  }

  /**
   * Include descendant mutations that change a relative selector's targets.
   * @param node - The parent whose descendants changed.
   * @returns Whether an animated relative-selector root contains the node.
   */
  function relativeSelectorParent(node: Node) {
    for (const timeline of timelines)
      for (const [source, variants] of timeline.elements) {
        if (source !== node && !source.contains(node)) continue
        if (
          Object.values(variants).some((values) =>
            values.selector?.value?.startsWith("&")
          )
        )
          return true
      }
    return false
  }

  refresh()
  if (state.watch) {
    const wait =
      typeof state.watch === "object" ? (state.watch.debounceTime ?? 500) : 500
    observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((mutation) => {
        if (mutation.type === "attributes")
          return (
            mutation.attributeName === state.dataAttribute ||
            relevantNode(mutation.target) ||
            relativeSelectorParent(mutation.target)
          )
        const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
        return (
          nodes.some(relevantNode) ||
          (nodes.some((node) => node instanceof Element) &&
            relativeSelectorParent(mutation.target))
        )
      })
      if (!relevant) return
      if (timer !== undefined) clearTimeout(timer)
      timer = setTimeout(refresh, wait)
    })
    observer.observe(state.element, {
      attributes: true,
      attributeFilter: [
        state.dataAttribute,
        ...(state.className ? ["class"] : []),
      ],
      subtree: true,
      childList: true,
    })
  }
  return { breakpoints, state, timelines, refresh, destroy }
}

function sameSettings(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!isObject(left) || !isObject(right)) return false
  const keys = Object.keys(left)
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && sameSettings(left[key], right[key])
    )
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export default glaze
export type {
  GlazeAnimationCollection,
  GlazeAnimationObject,
  GlazeConfig,
  GlazeInstance,
  GlazeObjectSettings,
  GlazeOptions,
  GlazeState,
  GlazeTimeline,
  PlainObject,
} from "./types.ts"
export type { GlazeAdapter } from "@glazejs/shared"
