---
title: "Getting Started"
description: "Get Glaze set up in your project"
path: "install"
order: 20
meta_title: "Getting Started"
meta_description: "Get Glaze set up in your project"
---

# Getting Started

Install Glaze together with GSAP:

```bash
npm install glazejs gsap
```

GSAP is not a dependency of the `glazejs` package, so it is not installed for you. Glaze throws `GSAP not found` when you call it without passing GSAP in.


## Setup

Import GSAP and Glaze, then initialize:

```js
import gsap from "gsap";
import glaze from "glazejs";

glaze({
  lib: {
    gsap: {
      core: gsap,
    },
  },
});
```

That's the minimum setup. Glaze will now find all elements with `data-animate` attributes and animate them.

Glaze scans the page once, when you call it. Call it after your elements are in the DOM, for example after your framework has rendered them. Elements added later are only picked up when `watch` is enabled (see [Options](#options)).

## CDN

You can also use ES modules from a CDN:

```js
import glaze from "https://esm.sh/glazejs";
import gsap from "https://esm.sh/gsap";

glaze({
  lib: { gsap: { core: gsap } },
});
```

## Configuration

Pass every option in the same `glaze()` call. Each call scans the page and builds its own animations, so calling it a second time with more options does not update the first call, it animates the same elements again.

```js
glaze({
  lib: { gsap: { core: gsap } },

  // Search within a specific element (default: document)
  element: document.querySelector("#app"),

  // Use a different attribute (default: "data-animate")
  dataAttribute: "data-move",

  // Define responsive breakpoints
  breakpoints: {
    default: "(min-width: 1px)",
    sm: "(min-width: 640px)",
    lg: "(min-width: 1024px)",
  },

  // Defaults for every timeline (Glaze creates one per animated element)
  defaults: {
    tl: "defaults:ease-power2.inOut|duration-1",
  },

  // Reusable animation presets
  presets: {
    fadeIn: "from:opacity-0|duration-1",
    slideUp: "from:y-50|opacity-0",
  },

  // Watch for DOM changes and re-animate (default: false)
  watch: { debounceTime: 500 },
});
```

Most of these are optional - the only required option is `lib.gsap.core`.

## Options

| Option | Default | What it does |
|--------|---------|--------------|
| `lib.gsap.core` | none (required) | The GSAP instance Glaze creates its tweens and timelines with. |
| `element` | `document` | The element Glaze searches for animated elements, and the element `watch` observes. |
| `dataAttribute` | `"data-animate"` | The attribute Glaze reads animation strings from. See [Selectors](/docs/selectors). |
| `className` | none | A class prefix that enables class-based syntax, such as `animate-from:opacity-0`. See [Selectors](/docs/selectors). |
| `breakpoints` | `{ default: "(min-width: 1px)" }` | Named media queries for `@name:` modifiers. Only `default` is built in. See [Breakpoints](/docs/breakpoints). |
| `defaults.tl` | none | A timeline string applied to every timeline. See [Defaults](/docs/defaults). |
| `defaults.element` | none | Currently has no reliable effect. See [Defaults](/docs/defaults#element-defaults). |
| `presets` | none | Named animation strings used with `preset-<name>`. See [Presets](/docs/presets). |
| `watch` | `false` | `true` or `{ debounceTime }` to re-run animations when the DOM changes. |

With `watch` enabled, Glaze observes `element` with a `MutationObserver`. When an animation attribute (or, in class mode, a matching class) changes, or an element with one is added, Glaze rebuilds that element's animation. When a plain element is added inside an animated element, Glaze rebuilds the animated ancestor. Changes are debounced by `debounceTime` milliseconds, 500 by default.

## Return value

`glaze()` returns an object with three properties:

| Property | What it holds |
|----------|---------------|
| `timelines` | An array with one entry per timeline Glaze created. Each entry has the GSAP timeline as `timeline`, its `id`, its `breakpoint` (a media query), the element that owns it as `timelineElement`, its parsed timeline settings as `data`, and `elements`, a `Map` from each animated element to its parsed animation data. |
| `breakpoints` | The breakpoints in use, including `default`. |
| `state` | The resolved configuration, with defaults filled in (without `lib`). |

You can use the GSAP timelines directly, for example to pause or reverse them:

```js
const { timelines } = glaze({ lib: { gsap: { core: gsap } } });

timelines.forEach(({ timeline }) => timeline.pause());
```
