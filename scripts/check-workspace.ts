import assert from "node:assert/strict"
import { readFile, readdir } from "node:fs/promises"
import { parse } from "yaml"
import { checkManifests } from "./workspace-policy.ts"
import type { Manifest } from "./workspace-policy.ts"

const root = new URL("../", import.meta.url)
const readManifest = async (path: string) =>
  JSON.parse(await readFile(new URL(path, root), "utf8")) as Manifest
const packages: { path: string; manifest: Manifest }[] = []
for (const group of ["packages", "apps"]) {
  for (const folder of await readdir(new URL(`${group}/`, root), {
    withFileTypes: true,
  })) {
    if (!folder.isDirectory()) continue
    const path = `${group}/${folder.name}`
    packages.push({
      path,
      manifest: await readManifest(`${path}/package.json`),
    })
  }
}
const workspace = parse(
  await readFile(new URL("pnpm-workspace.yaml", root), "utf8")
) as {
  catalog: Record<string, string>
}
checkManifests(
  await readManifest("package.json"),
  packages.map((item) => item.manifest),
  workspace.catalog
)
const readme = (await readFile(new URL("README.md", root), "utf8"))
  .split("\n")
  .map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .join("|")
  )
for (const { path, manifest } of packages) {
  assert(manifest.description, `${manifest.name} needs a description`)
  const row = `|[${manifest.name}](${path}/README.md)|${manifest.description}|`
  assert.equal(
    readme.filter((line) => line === row).length,
    1,
    `${manifest.name} must appear exactly once in the README package table`
  )
  await readFile(new URL(`${path}/README.md`, root))
}
console.log(
  `Validated ${packages.length} workspace packages, catalog and dependency graph.`
)
