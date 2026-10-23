---
title: "Motion"
description: "Run Glaze animations with the Motion adapter"
path: "motion"
order: 65
section: "Usage"
meta_title: "Motion"
meta_description: "Run Glaze animations with the Motion adapter"
---

# Motion

The Motion adapter uses Motion's DOM animation sequences. Install the public
package and Motion:

```sh
pnpm add glazejs motion
```

```ts
import glaze from "glazejs"
import { createMotionAdapter } from "glazejs/motion"
import { animate, stagger } from "motion"

const animations = glaze({
  adapter: createMotionAdapter({ animate, stagger }),
  breakpoints: { md: "(min-width: 768px)" },
  defaults: { element: "duration-0.6" },
  presets: { rise: "from:opacity-0|y-24" },
})
```

```html
<div data-animate="preset-rise"></div>
<div data-animate="from:opacity-0 to:opacity-1|x-120"></div>
<div data-animate="@md:from:rotate-180|scale-0.5"></div>
```

You do not need GSAP for this setup. Core parsing, defaults, selectors, presets,
watching and lifecycle methods are shared by both engines.

Motion 14.6's DOM declarations reference a type supplied by `@types/react`.
For strict TypeScript projects that check dependency declarations, also install
the types as a development dependency. React itself is not needed:

```sh
pnpm add -D @types/react
```

Include `"react"` in `compilerOptions.types` when your TypeScript configuration
restricts ambient type packages.

## Supported values

- Motion DOM properties with numeric or string values, including opacity,
  transforms and colors.
- `from`, `to`, and paired `from`/`to` states. A `from` animation ends at the
  element's natural style when no `to` value is supplied.
- Numeric `duration`, `delay`, `repeatDelay` and `stagger` values in seconds.
- Element `repeat` values from 0 through 19 and boolean `yoyo`. Use timeline
  repeat for longer or infinite repetition.
- Timeline `defaults`, `delay`, `repeatDelay`, `repeat` and `yoyo`; timeline
  `repeat--1` repeats indefinitely.
- Numeric timeline positions, sequential placement, `<`, `>`, and relative
  offsets such as `+=0.2`, `-=0.2` and `<+=0.2`.
- Motion named easing, `linear`/`none`, and common GSAP easing names:
  `power0` through `power4`, `sine`, `expo`, `circ` and `back`, with `.in`,
  `.out` or `.inOut` suffixes.
- GSAP rotation aliases such as `rotation` mapped to Motion's `rotate`.

For example, animate children in sequence with an overlap:

```html
<div data-animate="tl defaults:duration-0.6">
  <div data-animate="from:opacity-0|y-24"></div>
  <div data-animate="from:opacity-0|y-24 tl:[-=0.2]"></div>
</div>
```

## Engine-specific limits

The adapter throws an error for GSAP-only settings, including ScrollTrigger,
GSAP plugins, `autoAlpha`, percentage transforms such as `xPercent`, callback
utilities, nested `attr`/`css` objects, and relative property values such as
`x-+=100`. Percentage-based timeline positions and object-form stagger are also
unsupported. Use the GSAP adapter when those features are required.

Supported utilities do not imply identical interpolation between the two
engines. Motion owns its animation playback and property interpolation.

## Cleanup

Use `animations.refresh()` after DOM updates, or enable `watch`. Call
`animations.destroy()` on teardown. It cancels Motion playback, removes media
query listeners and observers, and restores original inline styles.
