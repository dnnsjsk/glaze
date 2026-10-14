---
title: "ScrollTrigger"
description: "Animate on scroll"
path: "scrolltrigger"
order: 70
section: "Usage"
meta_title: "ScrollTrigger"
meta_description: "Animate on scroll"
---

# ScrollTrigger

There is no special syntax needed to use [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) with Glaze. Since it is defined inside the `scrollTrigger` property of the animation object, dot notation can be used to adjust its settings.

## Setup

First, register ScrollTrigger with GSAP:

```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Then initialize Glaze as usual.

## Usage

Add `scrollTrigger.*` properties to your animation:

```html
<div
  data-animate="from:opacity-0|y-50|scrollTrigger.trigger-[&]"
></div>
```

The `[&]` means "use this element as the trigger" (same as the `&` in selectors).

On a standalone element, Glaze moves the `scrollTrigger` settings from the animation onto the timeline it creates for that element, so the whole animation is driven by scroll.

## Inside timelines

Children of a `tl` element are tweens in a shared timeline, and Glaze leaves their `scrollTrigger` settings on the tween. GSAP does not support a ScrollTrigger on a tween nested inside a timeline, so put it on the timeline element instead, using the colon form for timeline settings:

```html
<div data-animate="tl scrollTrigger:trigger-[&]|start-[top_center]">
  <div data-animate="to:rotate-360"></div>
  <div data-animate="to:rotate-360"></div>
</div>
```

To scroll-trigger every element at once, set it in the [timeline defaults](/docs/defaults).

## Common options

```html
<div
  data-animate="from:opacity-0|y-50|scrollTrigger.trigger-[&]|scrollTrigger.start-[top_center]|scrollTrigger.end-[bottom_top]|scrollTrigger.scrub-true"
></div>
```


```html preview
<div class="flex h-[50vh] items-center">
  <div
    class="h-20 w-20 rounded-xl bg-amber-500 sm:invisible"
    data-animate="from:autoAlpha-0|rotate-180|y-50|scrollTrigger.trigger-[&]|boxShadow-[0_0_100px_20px_orange]|scrollTrigger.scrub-true|scrollTrigger.start-[top_center]|scrollTrigger.end-[-=200]"
  ></div>
</div>
```


| Option | What it does |
|--------|--------------|
| `scrollTrigger.trigger-[&]` | Element that triggers the animation |
| `scrollTrigger.start-[top_center]` | When to start (element position + viewport position) |
| `scrollTrigger.end-[bottom_top]` | When to end |
| `scrollTrigger.scrub-true` | Link animation progress to scroll position |
| `scrollTrigger.markers-true` | Show debug markers (helpful during dev) |

Remember to use underscores instead of spaces in values: `[top_center]` not `[top center]`.
