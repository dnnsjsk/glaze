---
title: "Selectors"
description: "Target elements with data attributes or classes"
path: "selectors"
order: 40
section: "Usage"
meta_title: "Selectors"
meta_description: "Target elements with data attributes or classes"
---

# Selectors

By default, Glaze searches for elements with the `data-animate` attribute and builds the animation based on the value of that attribute. You can change this behavior.

## Custom attribute

Use a different data attribute:

```js
glaze({
  lib: { gsap: { core: gsap } },
  dataAttribute: "data-move",
});
```

Now Glaze will look for `data-move` instead of `data-animate`:

```html
<div data-move="from:opacity-0"></div>
```

## Class-based syntax

Prefer classes over data attributes? Enable class mode:

```js
glaze({
  lib: { gsap: { core: gsap } },
  className: "animate",
});
```

Now you can write animations as classes:

```html
<div class="animate-from:opacity-0|duration-1"></div>
```

This works well if you're already using utility-first CSS and want your animations to feel similar.

Every class that contains the prefix is read, with the `animate-` part removed, so you can split an animation over several classes. Class mode does not turn off the data attribute: when an element has both, Glaze joins the attribute string and the class strings into one.

```html
<div
  class="animate-from:opacity-0 animate-@lg:from:y-50"
  data-animate="from:duration-1"
></div>
```

## Limiting the search

Glaze searches the whole `document` by default. Pass `element` to only animate elements inside a container:

```js
glaze({
  lib: { gsap: { core: gsap } },
  element: document.querySelector("#app"),
});
```
