<p align="center">
  <a href="https://glaze.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./.github/logo-light.svg">
      <img alt="Glaze" src="./.github/logo-light.svg" height="50">
    </picture>
  </a>
</p>

<p align="center">
  Declarative animations for GSAP and Motion
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/glazejs"><img src="https://img.shields.io/npm/v/glazejs.svg" alt="npm version"></a>
  <a href="https://github.com/inline0/glaze/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/glazejs.svg" alt="license"></a>
</p>

Glaze turns HTML animation utilities into GSAP or Motion animations. Choose an
engine once, then use the same responsive presets, selectors and timelines.

## Install

Choose the engine used by your application:

```sh
pnpm add glazejs gsap
# Or use Motion:
pnpm add glazejs motion
```

Both engines are declared optional peers. Install the engine you use; Glaze does
not bundle either one.

## GSAP

Initialize once after the elements are in the DOM. Pass every option in that call:

```ts
import glaze from "glazejs"
import { gsap } from "gsap"

const animations = glaze({
  lib: { gsap: { core: gsap } },
  element: document,
  watch: true,
  defaults: { element: "duration-0.6" },
  breakpoints: { md: "(min-width: 768px)" },
  presets: { rise: "from:opacity-0|y-24" },
})
```

```html
<div data-animate="from:opacity-0|y-24"></div>
<div data-animate="@md:preset-rise from:duration-1"></div>
```

## Motion

The explicit adapter API also works with GSAP through `createGsapAdapter` from
`glazejs/gsap`. To use Motion:

```ts
import glaze from "glazejs"
import { createMotionAdapter } from "glazejs/motion"
import { animate, stagger } from "motion"

const animations = glaze({
  adapter: createMotionAdapter({ animate, stagger }),
  defaults: { element: "duration-0.6" },
})
```

Motion supports from/to animations, sequences, relative timeline positions,
stagger and responsive rebuilds. GSAP-specific plugins, including ScrollTrigger,
remain GSAP features. See the [Motion adapter guide](docs/motion.md) for supported
values and explicit limits.

## Lifecycle

`animations.refresh()` rebuilds the current DOM with the existing configuration.
`animations.destroy()` stops animations, removes listeners and observers, and
restores original styles. Call `destroy()` when unmounting a framework component.
Watch mode owns the same cleanup path and produces no debug console output.

## Workspace packages

| Package                                          | Description                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| [glazejs](packages/core/README.md)               | Declarative animations with GSAP and Motion adapters.                |
| [@glazejs/shared](packages/shared/README.md)     | Engine-neutral animation contracts for Glaze.                        |
| [@glazejs/gsap](packages/gsap/README.md)         | GSAP adapter for Glaze animations.                                   |
| [@glazejs/motion](packages/motion/README.md)     | Motion adapter for Glaze animations.                                 |
| [@glazejs/playground](apps/playground/README.md) | Interactive GSAP and Motion examples using the public Glaze package. |

Only `glazejs` is published. The private workspaces are bundled into its public
entry points, so applications never depend on unpublished packages.

## Development

Use Node from `.nvmrc` and pnpm from `package.json#packageManager`.

```sh
pnpm run setup
pnpm dev
pnpm verify
```

| Command                                    | Purpose                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| `pnpm run setup`                           | Install the frozen lockfile and Chromium. Add `--with-deps` on Linux.        |
| `pnpm dev`                                 | Run the playground, including the legacy compatibility examples.             |
| `pnpm build`                               | Build the public package and playground.                                     |
| `pnpm format` / `pnpm format:check`        | Format or check with Oxfmt.                                                  |
| `pnpm lint` / `pnpm lint:fix`              | Run Oxlint, workspace policy and documentation checks.                       |
| `pnpm typecheck`                           | Check repository tooling and every workspace with tsc-rs.                    |
| `pnpm test`                                | Run unit and tooling tests.                                                  |
| `pnpm test:unit`                           | Run the animation and parser unit tests.                                     |
| `pnpm test:tooling`                        | Test workspace rules and documentation lint rules.                           |
| `pnpm test:e2e`                            | Run Chromium tests; Playwright starts and stops its server.                  |
| `pnpm test:package`                        | Pack and install GSAP-only and Motion-only consumers, including type checks. |
| `pnpm audit:workspace` / `pnpm audit:docs` | Check package boundaries, manifests and portable docs.                       |
| `pnpm check`                               | Run formatting, lint, types, unit tests and builds.                          |
| `pnpm verify`                              | Run `check`, browser tests and installed-package checks.                     |

`pnpm --filter glazejs test:watch` is available for interactive test development.
CI runs the same verification and audits production dependencies. Build output,
local caches and release archives are not committed.

## Documentation and releases

Read the [documentation](docs/index.md), [installation guide](docs/install.md),
and [changelog](CHANGELOG.md). Release titles are version tags and release bodies
link to the changelog. The release-format workflow keeps them consistent.

## License

Glaze is MIT licensed. GSAP and Motion retain their own licenses.
