# Changelog

## [2.1.0] - Unreleased

### Added

- A Motion adapter and explicit GSAP adapter, published through `glazejs/motion`
  and `glazejs/gsap`. Shared, private workspace packages keep engine contracts
  separate from parsing and orchestration. (#10)
- `refresh()` and `destroy()` instance lifecycle methods, including responsive
  listener, animation and mutation-observer cleanup.
- A real workspace playground, frozen pnpm catalog, Node 26 development pins,
  shared Oxlint/Oxfmt tooling, CI and production consumer checks.

### Fixed

- Responsive preset calls such as `@md:preset-fadeIn` work in attributes and
  class syntax. Nested presets preserve invocation order and reject cycles. (#13)
- Bare and state-specific element defaults apply before explicit animation
  values and do not create states that the element did not request. (#16)
- Normal initialization and watch-mode rebuilds produce no debug logs. (#15)
- Add public ESM exports, bundled declarations, optional engine peers and
  corrected repository metadata to the production package. (#17)
- Installation examples initialize once with all options and explain cleanup. (#8)
- Reject prototype-modifying utility paths before parsing nested properties.
- Preserve responsive utility order, assign nested timeline children once, and
  apply ScrollTrigger only when its breakpoint matches.
- Stop all engine work after responsive rebuild errors and ignore unrelated
  DOM mutations in watch mode.

### Changed

- Presets expand in place: later utility values override earlier values.
- Remove obsolete screenshots, generated bundles, Bun/Biome configuration and
  nested lockfiles. The GSAP entry keeps the `dist/index.es.js` compatibility path.

## 2.0.1

2024-06-05

- Fix: build package

## 2.0.0

2024-06-05

- Breaking: timeline defaults are not applied directly to `defaults` key anymore
- New: timeline defaults will also be applied to single elements (Glaze creates a new timeline for each element)

## 1.2.0

2024-04-23

- New: `presets` option to define presets for animations
- New: `defaults` option to define default values for timelines and animations

## 1.1.3

2024-03-03

- Fix: `from` animations flash of initial state #2

## 1.1.2

2024-03-03

- Fix: `from` animations flash of initial state

## 1.1.1

2024-02-29

- Fix: `watch` option not resetting properly when using `from` animations

## 1.1.0

2024-02-28

- New: `watch` option to watch changes to animation attributes in DOM, updating animations accordingly
- New: `className` option to add class prefixes and create animations from classes, e.g. `animate-to:x-500`
- Fix: element selector returning null when just using `&`
- Fix: `from` animations not restarting when using breakpoints

## 1.0.2

2024-02-10

- Enhancement: possibility to use dashes (spaces) in selector

## 1.0.1

2024-02-08

- Update licensing

## 1.0.0

2024-02-08

- Initial release
