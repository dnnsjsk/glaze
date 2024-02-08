![glaze image](https://raw.githubusercontent.com/dnnsjsk/glaze/main/image.png)

Glaze is an animation framework that combines the power of
[GSAP](https://greensock.com/gsap/) and utility-based document authoring à la
[Tailwind](https://tailwindcss.com) to create a simple, yet powerful, way to
compose declarative animations for the web.

```html copy
<div
  class="invisible h-20 w-20 rounded-xl bg-amber-500"
  data-animate="@sm:from:duration-1|autoAlpha-0|rotate-180|y-50|ease-power2.inOut"
></div>
```

## Features

- **Breakpoints** Define custom breakpoints and animate elements at different
  screen sizes using `@{size}` syntax. Uses GSAPs
  [matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>).
- **Timelines** Compose timelines using `@tl`.
- **Dot notation** Use dot notation to control nested properties inside the
  animation object, e.g. `to:scale-1.5|scrollTrigger.trigger-[&]`.
- **Lightweight** ~3kb minified and gzipped.
- **Library agnostic** Can be extended to work with other animation libraries.
  (coming soon)

## Credits

The API and syntax of Glaze is heavily inspired by [Tailwind](https://tailwindcss.com)
and [MasterCSS](https://css.master.co/).

To use Glaze, you must also include GSAP in your project.
GSAP is subject to its own licensing terms, which can be found here:
[GSAP Standard License](https://gsap.com/community/standard-license/).
