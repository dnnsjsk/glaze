---
title: "Introduction"
description: "Utility-based animations for the web"
path: "."
order: 10
meta_title: "Introduction"
meta_description: "Utility-based animations for the web"
---

# Introduction

Glaze brings the Tailwind approach to animations. Instead of writing JavaScript animation code, you describe animations right in your HTML using data attributes.

```html
<div
  class="h-20 w-20 rounded-xl bg-amber-500"
  data-animate="from:opacity-0|rotate-180|duration-1|ease-power2.inOut"
></div>
```


```html preview
<div
class="h-20 w-20 rounded-xl bg-amber-500 sm:invisible"
data-animate="@sm:from:duration-1|autoAlpha-0|rotate-180|y-50|ease-power2.inOut|scrollTrigger.trigger-[&]">
</div>
```


That's it. No JavaScript animation code, just a string that describes what you want.

## What you get

- **Responsive animations** - Use `@sm:`, `@lg:` etc. to animate differently at different screen sizes. Uses GSAP's [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
- **Timeline support** - Chain animations together with `tl`
- **Dot notation** - Control nested properties like `scrollTrigger.trigger-[&]` or `scale.x-2`
- **All of GSAP** - ScrollTrigger, easing, stagger, and everything else GSAP offers
- **Tiny footprint** - ~3kb minified and gzipped

## How it works

Glaze parses your `data-animate` strings and converts them into GSAP animations. The syntax mirrors GSAP's API, so if you know GSAP, you already know most of Glaze.

```html
<!-- This Glaze string... -->
<div data-animate="from:opacity-0|y-50|duration-1"></div>

<!-- ...becomes this GSAP call -->
gsap.from(element, { opacity: 0, y: 50, duration: 1 })
```

## Why Glaze?

Writing animations in JavaScript gets messy fast. You end up with animation code scattered across files, disconnected from the elements it animates.

Glaze keeps animations next to the elements they affect. You can see exactly what an element does just by looking at its HTML.

## GSAP required

Glaze is a syntax layer on top of [GSAP](https://gsap.com/). GSAP is the only animation library it supports. You need to install GSAP yourself and pass it to Glaze during setup (see [Getting Started](/docs/install)).

GSAP has its own [licensing terms](https://gsap.com/community/standard-license/) - make sure you're compliant before using it commercially.

Glaze itself is MIT licensed. For more details, see the LICENSE file in the repository.

## Credits

The API and syntax of Glaze is heavily inspired by [Tailwind](https://tailwindcss.com) and [MasterCSS](https://css.master.co/).
