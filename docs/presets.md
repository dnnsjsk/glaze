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

You can create presets for your animations to apply the same settings to multiple elements. This is useful when you want consistent animations across your site.

## Setup

Define presets in your config:

```js
glaze({
  lib: { gsap: { core: gsap } },
  presets: {
    fadeIn: "from:opacity-0|duration-1",
    slideUp: "from:y-50|opacity-0|duration-0.5",
    helicopter: "from:rotate-2160|duration-5",
  },
});
```

## Usage

Reference presets with `preset-`:

```html
<div data-animate="preset-fadeIn"></div>
<div data-animate="preset-slideUp"></div>
<div data-animate="preset-helicopter"></div>
```


```html preview
<div
    class="h-20 w-20 rounded-xl bg-amber-500"
    data-animate="preset-helicopter"
  ></div>
```


## With classes

If you're using class-based syntax:

```html
<div class="animate-preset-helicopter h-20 w-20 rounded-xl bg-amber-500"></div>
```

## Combining presets

You can use presets alongside other animation strings:

```html
<div data-animate="preset-fadeIn from:scrollTrigger.trigger-[&]"></div>
```

Every extra property still needs its state, here `from:`. A segment without one, such as a bare `scrollTrigger.trigger-[&]`, is ignored.

Presets are just shortcuts - Glaze appends each preset's string to the end of the element's own string before processing it. Because the preset comes last, it wins when both set the same property: `preset-fadeIn from:duration-3` still runs for 1 second, the preset's duration.

## Presets and breakpoints

A preset is only recognised as the exact token `preset-<name>`, so a breakpoint modifier in front of it, such as `@md:preset-fadeIn`, does not apply the preset ([#13](https://github.com/inline0/glaze/issues/13)). Put the breakpoint into the preset's value instead:

```js
presets: {
  fadeInMd: "@md:from:opacity-0|duration-1",
},
```

```html
<div data-animate="preset-fadeInMd"></div>
```

The `md` breakpoint must be defined in your config (see [Breakpoints](/docs/breakpoints)).
