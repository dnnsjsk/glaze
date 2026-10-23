---
title: "Introduction"
description: "Utility-based animations for the web"
path: "."
order: 10
meta_title: "Introduction"
meta_description: "Utility-based animations for the web"
---

# Introduction

Glaze describes animations with HTML utilities and runs them through GSAP or
Motion. Configure an engine once, then keep animation settings next to the
elements they affect.

```html
<div
  data-animate="from:opacity-0|rotate-180|duration-1|ease-power2.inOut"
></div>
```

## Features

- `from` and `to` states, selectors, stagger and timelines.
- Named responsive breakpoints and reusable, composable presets.
- Element and timeline defaults that explicit utilities can override.
- GSAP integration, including registered plugins such as ScrollTrigger.
- A Motion adapter with documented supported features and explicit limits.
- Refresh, DOM watching and cleanup for framework lifecycle integration.

## How it works

Glaze parses the utility string and creates an animation through your chosen
adapter. For example, with GSAP:

```html
<div data-animate="from:opacity-0|y-50|duration-1"></div>
```

This describes the same values as:

```js
gsap.from(element, { opacity: 0, y: 50, duration: 1 })
```

Use the [installation guide](/docs/install) to initialize Glaze in a single call.
The [Motion guide](/docs/motion) explains which shared utilities its adapter
supports. GSAP-specific plugin settings continue to require GSAP.

## Packages and licensing

Install `glazejs` and your chosen engine. The public package exports `glazejs`,
`glazejs/gsap`, and `glazejs/motion`; its private workspace packages are bundled
into those entry points.

Glaze is MIT licensed. GSAP and Motion retain their own licenses.

## Credits

Glaze's utility syntax is inspired by [Tailwind](https://tailwindcss.com) and
[MasterCSS](https://css.master.co/).
