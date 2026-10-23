---
title: "Presets"
description: "Reusable animation presets"
path: "presets"
order: 90
section: "Usage"
meta_title: "Presets"
meta_description: "Reusable animation presets"
---

# Presets

Presets are named animation strings expanded where you reference them.

## Setup

```ts
glaze({
  lib: { gsap: { core: gsap } },
  breakpoints: { md: "(min-width: 768px)" },
  presets: {
    fadeIn: "from:opacity-0|duration-1",
    slideUp: "preset-fadeIn from:y-50|duration-0.5",
    helicopter: "from:rotate-2160|duration-5",
  },
})
```

```html
<div data-animate="preset-fadeIn"></div>
<div data-animate="preset-slideUp"></div>
<div data-animate="preset-helicopter"></div>
```

## Overrides and composition

Presets expand inline. Later values for the same state and property win:

```html
<!-- Override the preset's one-second duration. -->
<div data-animate="preset-fadeIn from:duration-3"></div>

<!-- The later preset wins and uses one second. -->
<div data-animate="from:duration-3 preset-fadeIn"></div>
```

Every additional property needs its state, such as `from:duration-3`. A preset
can reference another preset, as `slideUp` does above. Circular references throw
an error identifying the cycle instead of recursing forever.

## Responsive presets

Prefix a preset with a configured breakpoint:

```html
<div data-animate="@md:preset-helicopter"></div>
```

The `md` media query applies to the expanded utilities, including nested presets.
An outer breakpoint modifier takes precedence over breakpoint modifiers inside
the preset. Without an outer modifier, a preset keeps its own modifiers:

```ts
presets: {
  responsiveRise: "from:opacity-0 @md:from:y-50",
}
```

See [Breakpoints](/docs/breakpoints) for media-query configuration.

## Class syntax

With `className: "animate"`, the same presets work in classes:

```html
<div class="animate-preset-fadeIn"></div>
<div class="animate-@md:preset-helicopter"></div>
```

The alternate responsive prefix `@md:animate-preset-helicopter` is also supported.
