---
title: "Timelines"
description: "Chain animations together"
path: "timelines"
order: 60
section: "Usage"
meta_title: "Timelines"
meta_description: "Chain animations together"
---

# Timelines

GSAP [Timelines](https://gsap.com/docs/v3/GSAP/Timeline) let you chain animations together. Glaze supports them with the `tl` keyword.

## Basic timeline

Add `tl` to create a timeline container:

```html
<div data-animate="tl defaults:ease-elastic|duration-1">
  <div data-animate="to:rotate-360"></div>
  <div data-animate="to:rotate-360"></div>
</div>
```

By design, Glaze incorporates all child elements of a timeline-declared element into the timeline's scope - you don't need to explicitly include them.

## Timeline defaults

Set defaults for the whole timeline:

```html
<div data-animate="tl defaults:ease-elastic|duration-4 repeat-1 yoyo-true">
  ...
</div>
```

On a timeline element, the string after `tl` sets the options of the GSAP timeline itself. A plain `key-value` segment sets a top-level option (`repeat-1`, `yoyo-true`), and `key:` followed by pipe-separated values sets a nested one: `defaults:ease-elastic|duration-4` becomes `defaults: { ease: "elastic", duration: 4 }`, and `scrollTrigger:trigger-[&]` becomes `scrollTrigger: { trigger: element }`. Dot notation such as `scrollTrigger.trigger-[&]` only works inside an element's `from:` or `to:` properties.

## Timing control

Adjust when child animations start using `tl:`:

```html
<div data-animate="tl defaults:ease-elastic|duration-4">
  <div data-animate="to:rotate-360"></div>
  <div data-animate="tl:[-=3] to:rotate-360"></div>
</div>
```


```html preview
<div class="grid gap-8" data-animate="tl defaults:ease-elastic|duration-4 scrollTrigger:trigger-[&]">
  <div
    class="h-20 w-20 rounded-xl bg-amber-500"
    data-animate="to:rotate-360"
  ></div>
  <div
    class="h-20 w-20 rounded-xl bg-green-500"
    data-animate="tl:[-=3] to:rotate-360"
  ></div>
</div>
```


`tl:[-=3]` means "start 3 seconds before the previous animation ends" (overlap).

Common timing values:
- `tl:[+=1]` - Start 1 second after previous ends
- `tl:[-=1]` - Start 1 second before previous ends (overlap)
- `tl:[<]` - Start at same time as previous

## Responsive timelines

Combine breakpoints with timelines:

```html
<div data-animate="tl defaults:ease-power2.inOut|duration-2">
  <div data-animate="to:rotate-360 @lg:to:xPercent-[50]"></div>
  <div data-animate="tl:[-=1] to:rotate-360 @lg:to:xPercent-[-50]"></div>
</div>
```


```html preview
<div class="grid gap-8" data-animate="tl defaults:ease-power2.inOut|duration-2 scrollTrigger:trigger-[&]">
  <div
    class="h-20 w-20 rounded-xl bg-amber-500"
    data-animate="to:rotate-360 @lg:to:xPercent-[100]"
  ></div>
  <div
    class="h-20 w-20 rounded-xl bg-green-500"
    data-animate="tl:[-=1] to:rotate-360 @lg:to:xPercent-[-100]"
  ></div>
</div>
```


The rotation always happens, but the horizontal movement only kicks in on large screens.

## Named timelines

Give your timeline a name to reference it from anywhere:

```html
<div data-animate="tl/main defaults:ease-power2.inOut|duration-2">
  <div data-animate="to:rotate-360"></div>
</div>

<!-- Somewhere else in the DOM -->
<div data-animate="tl:main-[-=1] to:scale-1.5">
  ...
</div>
```


```html preview
<div class="grid w-full grid-cols-2 justify-items-center">
  <div
    class="grid gap-8"
    data-animate="tl/main defaults:ease-power2.inOut|duration-2 scrollTrigger:trigger-[&]"
  >
    <div
      class="h-20 w-20 rounded-xl bg-amber-500"
      data-animate="to:rotate-360"
    ></div>
    <div
      class="h-20 w-20 rounded-xl bg-green-500"
      data-animate="tl:[-=1] to:rotate-360"
    ></div>
  </div>
  <div
    class="tl grid gap-8"
    data-animate="tl:main-[-=1] [&>div]:to:rotate-360|stagger-0.25"
  >
    <div class="h-20 w-20 rounded-xl bg-rose-500"></div>
    <div class="h-20 w-20 rounded-xl bg-red-500"></div>
  </div>
</div>
```


Use `tl/name` to create a named timeline, and `tl:name` to join it.
