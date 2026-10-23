---
title: "Getting Started"
description: "Get Glaze set up in your project"
path: "install"
order: 20
meta_title: "Getting Started"
meta_description: "Get Glaze set up in your project"
---

# Getting Started

Install Glaze and the animation engine you use:

```sh
pnpm add glazejs gsap
# Or choose Motion:
pnpm add glazejs motion
```

GSAP and Motion are optional peer dependencies. Glaze bundles neither engine.

## Initialize once

Call `glaze()` after your elements are in the DOM. Supply the engine and all
configuration in **one call**:

```ts
import glaze from "glazejs"
import { gsap } from "gsap"

const root = document.querySelector("#app")
if (!root) throw new Error("Missing application root")

const animations = glaze({
  lib: { gsap: { core: gsap } },
  element: root,
  breakpoints: { md: "(min-width: 768px)" },
  defaults: { element: "duration-0.6" },
  presets: { rise: "from:opacity-0|y-24" },
  watch: { debounceTime: 200 },
})
```

```html
<div id="app">
  <div data-animate="preset-rise"></div>
  <div data-animate="@md:preset-rise from:duration-1"></div>
</div>
```

This scans the root and creates its animations. Calling `glaze()` again creates
another instance; it does not add configuration to an existing one.

The explicit adapter API is equivalent for GSAP:

```ts
import glaze from "glazejs"
import { createGsapAdapter } from "glazejs/gsap"
import { gsap } from "gsap"

const animations = glaze({ adapter: createGsapAdapter(gsap) })
```

For Motion, use `createMotionAdapter({ animate, stagger })` from
`glazejs/motion`. See the [Motion guide](/docs/motion) for setup and supported
features. Choose either `adapter` or `lib` in a single configuration.

## Options

| Option             | Default                           | Purpose                                                                         |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------- |
| `lib.gsap.core`    | none                              | GSAP instance for the original setup API.                                       |
| `adapter`          | none                              | Explicit GSAP or Motion adapter; alternative to `lib`.                          |
| `element`          | `document`                        | DOM root to scan and observe.                                                   |
| `dataAttribute`    | `"data-animate"`                  | Attribute containing animation utilities.                                       |
| `className`        | none                              | Class prefix for [class syntax](/docs/selectors).                               |
| `breakpoints`      | `{ default: "(min-width: 1px)" }` | Named [media queries](/docs/breakpoints).                                       |
| `defaults.tl`      | none                              | Default timeline settings.                                                      |
| `defaults.element` | none                              | Default animation properties; element utilities take precedence.                |
| `presets`          | none                              | Named reusable animation strings.                                               |
| `watch`            | `false`                           | Observe DOM changes; `true` uses a 500 ms debounce, or pass `{ debounceTime }`. |

Watch mode observes child additions/removals and animation attribute changes
within the root. In class mode it also observes class changes. A relevant DOM
mutation schedules a debounced rebuild. Inline animation style changes do not
trigger rebuilds.

## Refresh and cleanup

Keep the returned instance for lifecycle management:

```ts
// Rescan after rendering new elements when watch is disabled.
animations.refresh()

// On component unmount or page teardown:
animations.destroy()
```

`refresh()` rebuilds using the original configuration. `destroy()` stops the
animations, removes observers and media-query listeners, and restores original
inline styles. It is safe to call more than once. A destroyed instance cannot be
restarted with `refresh()`; create a new instance when mounting again.

The return value also includes `timelines`, `breakpoints`, and the resolved
`state`. Each timeline entry records its engine timeline, ID, media query, root
element, settings and animated elements. Keep engine-specific playback calls in
code that knows which adapter created the instance.

Refreshes and responsive rebuilds can replace the native timeline objects.
Read the current `timelines[index].timeline` when controlling playback after a
rebuild instead of retaining a previous native timeline reference.

## CDN

The public entry points are ES modules and can also be loaded from an ESM CDN:

```js
import glaze from "https://esm.sh/glazejs"
import { gsap } from "https://esm.sh/gsap@3.15.0"

const animations = glaze({ lib: { gsap: { core: gsap } } })
```
