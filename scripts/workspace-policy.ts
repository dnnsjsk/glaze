import assert from "node:assert/strict"

interface Manifest {
  name: string
  type?: string
  private?: boolean
  description?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

export function checkManifests(
  root: Manifest,
  packages: Manifest[],
  catalog: Record<string, string>
) {
  const names = new Set(packages.map((item) => item.name))
  assert.equal(
    names.size,
    packages.length,
    "Workspace package names must be unique"
  )
  const graph = new Map<string, string[]>()
  for (const manifest of [root, ...packages]) {
    assert.equal(
      manifest.type,
      "module",
      `${manifest.name} must use ES modules`
    )
    assert(
      manifest.name === "glazejs" || manifest.private === true,
      `${manifest.name} must stay private`
    )
    const edges: string[] = []
    for (const group of [
      manifest.dependencies,
      manifest.devDependencies,
      manifest.optionalDependencies,
    ]) {
      for (const [name, version] of Object.entries(group ?? {})) {
        if (names.has(name)) {
          assert.equal(
            version,
            "workspace:*",
            `${manifest.name}: ${name} must use workspace:*`
          )
          edges.push(name)
        } else {
          assert.equal(
            version,
            "catalog:",
            `${manifest.name}: ${name} must use catalog:`
          )
          assert(catalog[name], `${name} is missing from the catalog`)
        }
      }
    }
    graph.set(manifest.name, edges)
  }
  const done = new Set<string>()
  const active = new Set<string>()
  const visit = (name: string) => {
    assert(!active.has(name), `Workspace dependency cycle through ${name}`)
    if (done.has(name)) return
    active.add(name)
    for (const dependency of graph.get(name) ?? []) visit(dependency)
    active.delete(name)
    done.add(name)
  }
  for (const name of graph.keys()) visit(name)
}

export type { Manifest }
