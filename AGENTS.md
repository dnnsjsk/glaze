# Working in Glaze

- Use Node 26.12.0 from `.nvmrc` and pnpm 12.14.0 from `packageManager`.
- `pnpm run setup` installs the lockfile and Chromium. Use `pnpm verify` as the
  final gate: formatting, lint, types, unit/tooling tests, builds, browser tests
  and real packed-package consumers. Browser tests own and stop their server.
- Add direct dependency pins to the root pnpm catalog. External dependencies use
  `catalog:`; internal dependencies use `workspace:*`; peer ranges stay normal.
- `packages/core` publishes `glazejs`. Shared contracts and engine adapters are
  private workspaces bundled into it. `apps/playground` is a real consumer.
- Keep the legacy `lib.gsap.core` setup compatible. New engines implement the
  contracts in `@glazejs/shared`. Do not make core depend on an engine runtime.
- Use SleekOS's Oxlint/Oxfmt conventions: double quotes, no semicolons, 80-column
  lines, separate type imports and explicit relative `.ts`/`.tsx` extensions.
  Keep exported API doc comments complete. The copied doc rules retain their
  provenance in `scripts/oxlint-plugins/README.md`.
- Keep runtime behavior in its owning package and tooling under `scripts/`.
  Repository tooling runs as TypeScript with plain Node. Do not add editor files.
- README package descriptions and commands must match manifests. Portable docs
  live in `docs/`; update examples when semantics change. Edit the root README;
  packaging creates the npm copy with absolute image and documentation links.
- Test real engine behavior, responsive presets, defaults, teardown and packed
  consumers. Never silence errors or delete regression coverage to pass a gate.
- Clean up all test processes, browsers, servers and temporary directories.
- Keep build output, obsolete lockfiles and unused screenshots out of Git.

## Releases

`CHANGELOG.md` is the source of truth. Use the tag as the release title and this
single sentence as the body, replacing TAG:

```text
See [CHANGELOG.md](https://github.com/inline0/glaze/blob/main/CHANGELOG.md) for the full release notes for `TAG`.
```

`.github/workflows/release-format.yml` follows the shared `_cp` template.
Publish only `glazejs`, from a verified production archive. Keep the adapter
workspaces private and verify the packed package has no workspace references.
