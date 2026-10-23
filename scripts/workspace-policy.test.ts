import assert from "node:assert/strict"
import { test } from "node:test"
import { checkManifests } from "./workspace-policy.ts"

const root = { name: "@glazejs/workspace", private: true, type: "module" }
const shared = { name: "@glazejs/shared", private: true, type: "module" }
const core = {
  name: "glazejs",
  type: "module",
  devDependencies: { "@glazejs/shared": "workspace:*", vite: "catalog:" },
}

test("accepts catalog dependencies and private bundled workspaces", () => {
  checkManifests(root, [core, shared], { vite: "8.3.5" })
})

test("rejects undeclared catalog entries and publishable internals", () => {
  assert.throws(
    () => checkManifests(root, [core, shared], {}),
    /missing from the catalog/
  )
  assert.throws(
    () =>
      checkManifests(root, [core, { ...shared, private: false }], {
        vite: "8.3.5",
      }),
    /must stay private/
  )
})

test("rejects dependency cycles and unpinned dependencies", () => {
  assert.throws(
    () =>
      checkManifests(
        root,
        [core, { ...shared, dependencies: { glazejs: "workspace:*" } }],
        { vite: "8.3.5" }
      ),
    /dependency cycle/
  )
  assert.throws(
    () =>
      checkManifests(
        root,
        [{ ...core, devDependencies: { vite: "^8" } }, shared],
        { vite: "8.3.5" }
      ),
    /must use catalog:/
  )
})
