---
title: "Syntax"
description: "How to write Glaze animation strings"
path: "syntax"
order: 30
section: "Usage"
meta_title: "Syntax"
meta_description: "How to write Glaze animation strings"
---

# Syntax

Glaze animation strings follow a simple pattern:

```
[breakpoint][selector]:state:properties
```

Let's break that down.

## States

Every animation needs a state - either `from`, `to`, or both.

### from

Start from these values and animate to the element's natural state:

```html
<div data-animate="from:opacity-0"></div>
```

### to

Animate from the current state to these values:

```html
<div data-animate="to:xPercent-50"></div>
```

### fromTo

Use both to animate between two specific states ([fromTo in GSAP](<https://gsap.com/docs/v3/GSAP/gsap.fromTo()>)):

```html
<div data-animate="from:opacity-0.5 to:opacity-1"></div>
```

## Properties

After the state, list your animation properties separated by pipes (`|`):

```html
<div data-animate="to:opacity-1|yPercent-10|duration-0.5"></div>
```

The string is parsed by splitting at the dash (`-`), where the first part is the property name, and the second part is its value. Values are automatically converted to the right type (number, boolean, or string).

### Nested properties

Use dots for nested values:

```html
<div data-animate="to:scale.x-2|scale.y-2"></div>
```

This creates `{ scale: { x: 2, y: 2 } }`.

### Negative values

Wrap negative values in brackets:

```html
<div data-animate="to:xPercent-[-50]"></div>
```

### Values with spaces

Use underscores instead of spaces:

```html
<div data-animate="to:boxShadow-[0_0_50px_20px_red]"></div>
```

## Breakpoints

Add `@breakpoint:` at the start to only run the animation at certain screen sizes:

```html
<div data-animate="@sm:from:opacity-0"></div>
```

This only animates on screens matching your `sm` breakpoint.

## Selectors

Target child elements instead of the element itself using bracket notation:

```html
<div data-animate="[&>h1]:to:opacity-1|stagger-0.25">
  <h1>One</h1>
  <h1>Two</h1>
  <h1>Three</h1>
</div>
```

The `&` refers to the parent element, so `[&>h1]` means "all h1 children".

You can combine selectors with breakpoints:

```html
<div data-animate="@sm:[&>h1]:to:opacity-1|stagger-0.25">
  <h1>...</h1>
  <h1>...</h1>
  <h1>...</h1>
</div>
```

## Putting it together

Here's a complex example:

```html
<div
  data-animate="@lg:[&>div]:from:opacity-0|y-50|stagger-0.1|duration-0.5|ease-power2.out"
>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

This reads as: "On large screens, animate all div children from opacity 0 and y 50, with stagger."
