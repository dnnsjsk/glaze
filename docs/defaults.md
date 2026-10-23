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

Apply default values once in the same `glaze()` call as the engine configuration.
An element's own utilities override matching defaults.

## Element defaults

Bare properties apply to every existing `from` or `to` animation state:

```ts
glaze({
  lib: { gsap: { core: gsap } },
  defaults: { element: "duration-1|ease-power2.inOut" },
})
```

```html
<!-- Uses a one-second duration and the default easing. -->
<div data-animate="from:opacity-0"></div>

<!-- Explicit values win over defaults. -->
<div data-animate="from:opacity-0|duration-0.5"></div>
```

State-specific defaults apply only to that state:

```ts
defaults: {
  element: "duration-1 from:opacity-0 to:ease-linear",
}
```

A `to` animation receives the common duration and `to` easing, but no `from`
state is added. Defaults never create an animation state that the element did
not request. For a `from`/`to` animation, common defaults apply to both states,
then state-specific defaults, then the element's explicit values.

The older `elementSettings` configuration key remains a common-default alias.
Prefer `element` in new code; `element` wins when both specify the same value.

## Timeline defaults

Use `defaults.tl` for settings on every timeline:

```ts
glaze({
  lib: { gsap: { core: gsap } },
  defaults: {
    tl: "defaults:ease-power2.inOut|duration-1",
  },
})
```

Glaze creates a timeline even for standalone animated elements. Values under
`defaults:` are passed to the engine's timeline defaults. Element properties
still take precedence. A timeline's own settings override configured values
while retaining defaults it does not replace.

Timeline settings use a colon for nested properties:

```ts
defaults: {
  tl: "defaults:duration-1 scrollTrigger:trigger-[&]",
}
```

Here `[&]` resolves to the timeline's owning element. ScrollTrigger requires
GSAP and a registered [ScrollTrigger plugin](/docs/scrolltrigger). The Motion
adapter rejects GSAP-only settings explicitly.
