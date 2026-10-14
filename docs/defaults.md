---
title: "Defaults"
description: "Set global animation defaults"
path: "defaults"
order: 80
section: "Usage"
meta_title: "Defaults"
meta_description: "Set global animation defaults"
---

# Defaults

Set default animation values that apply to all timelines, and with them to every animated element.

## Setup

```js
glaze({
  lib: { gsap: { core: gsap } },
  defaults: {
    tl: "defaults:ease-power2.inOut|duration-1 scrollTrigger:trigger-[&]",
  },
});
```

## Timeline defaults

The `tl` default applies to every timeline:

```js
defaults: {
  tl: "defaults:ease-power2.inOut|duration-1 scrollTrigger:trigger-[&]",
}
```

Now every element with a timeline will automatically:
- Use `power2.inOut` easing
- Run for 1 second unless the element sets its own `duration`
- Trigger its animation when scrolled into view (this needs [ScrollTrigger](/docs/scrolltrigger) registered)

The `tl` string uses the same syntax as a `tl` attribute (see [Timelines](/docs/timelines)). Nested timeline settings use a colon: `scrollTrigger:trigger-[&]` sets `scrollTrigger.trigger`. The dot form `scrollTrigger.trigger-[&]` that works inside an element's animation does not work here, it creates a setting literally named `scrollTrigger.trigger` and no ScrollTrigger.

The `[&]` resolves to the element that owns the timeline, so each element triggers its own animation.

## Element defaults

The config also accepts `defaults.element`, but it currently has no reliable effect ([#16](https://github.com/inline0/glaze/issues/16)):

- A value without a state, such as `element: "duration-1"`, is ignored.
- A value with a state, such as `element: "from:duration-1"`, is applied after the element's own values, so it overrides them instead of acting as a default, and it adds that state to every element.

To set a default duration or ease, use `defaults.tl` with `defaults:` as shown above.

## How it works

Glaze creates a timeline for each element internally, even if you don't explicitly use `tl`. This means `tl` defaults effectively apply to everything - useful for setting up global ScrollTrigger behavior or easing.

Values inside `defaults:` become the [defaults](https://gsap.com/docs/v3/GSAP/Timeline#defaults) of each GSAP timeline, so an element can always override them:

```html
<!-- Uses the default 1s duration -->
<div data-animate="from:opacity-0"></div>

<!-- Overrides to 0.5s -->
<div data-animate="from:opacity-0|duration-0.5"></div>
```

A timeline element that sets its own `defaults:` replaces the configured `defaults:` values it repeats and keeps the rest.
