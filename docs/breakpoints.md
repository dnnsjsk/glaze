---
title: "Breakpoints"
description: "Responsive animations with media queries"
path: "breakpoints"
order: 50
section: "Usage"
meta_title: "Breakpoints"
meta_description: "Responsive animations with media queries"
---

# Breakpoints

Glaze responds to media-query changes through its chosen adapter. GSAP uses its
[matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>) context; Motion uses
native media-query listeners. Both rebuild animations and clean up previous
styles when the matching queries change.

## Setup

Define your breakpoints in the config:

```js
glaze({
  lib: { gsap: { core: gsap } },
  breakpoints: {
    default: "(min-width: 1px)",
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
  },
})
```

The `default` breakpoint runs when no other breakpoint is specified. If you don't set one, it defaults to `(min-width: 1px)`.

`default` is the only breakpoint Glaze ships with. Every other name, such as `sm` or `lg`, works only once you define it here. A segment that uses an undefined breakpoint is ignored without a warning, so a typo like `@xl:` when only `lg` exists silently drops that animation.

## Usage

Add `@breakpoint:` before your animation:

```html
<div
  class="h-20 w-20 rounded-xl bg-lime-500"
  data-animate="@lg:from:opacity-0|rotate-180|duration-1"
></div>
```

```html preview
<div
  class="h-20 w-20 rounded-xl bg-lime-500 lg:invisible"
  data-animate="@lg:from:duration-1|autoAlpha-0|rotate-360|xPercent-[-100]|ease-power2.inOut|scrollTrigger.trigger-[&]"
></div>
```

This animation only runs on `lg` screens (1024px+).

## Multiple breakpoints

Stack multiple breakpoints by separating them with spaces:

```html
<div data-animate="@sm:from:opacity-0|y-50 @lg:from:scale-0.5"></div>
```

On small screens, it fades in from below. On large screens, it also scales up.

```html preview
<div
  class="h-20 w-20 rounded-xl bg-orange-500 lg:invisible"
  data-animate="@sm:from:duration-1|autoAlpha-0|rotate-360|xPercent-[-100]|ease-power2.inOut|scrollTrigger.trigger-[&] @lg:from:background-[red]"
></div>
```

The animations combine - every breakpoint whose media query matches contributes its properties. When two matching breakpoints set the same property, the one written later in the string wins, regardless of screen size. Write breakpoints from small to large, as above, so that larger breakpoints override smaller ones.
