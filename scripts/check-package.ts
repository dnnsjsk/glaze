import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { parse } from "yaml"

const root = fileURLToPath(new URL("../", import.meta.url))
const scratch = await mkdtemp(join(tmpdir(), "glaze-package-"))
const { catalog } = parse(
  await readFile(join(root, "pnpm-workspace.yaml"), "utf8")
) as {
  catalog: Record<string, string>
}
const run = (command: string, args: string[], cwd = root) =>
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: 180_000,
    stdio: ["ignore", "pipe", "pipe"],
  })
try {
  run("pnpm", ["--filter", "glazejs", "pack", "--pack-destination", scratch])
  const archives = (await readdir(scratch)).filter((name) =>
    name.endsWith(".tgz")
  )
  assert.equal(archives.length, 1, "Expected one production archive")
  const archive = join(scratch, archives[0] ?? "")
  const files = run("tar", ["-tzf", archive]).trim().split("\n")
  for (const file of files) {
    assert(
      /^package\/(?:dist\/|package\.json$|README\.md$|LICENSE$)/.test(file),
      `Development path shipped: ${file}`
    )
  }
  const manifest = JSON.parse(
    run("tar", ["-xOf", archive, "package/package.json"])
  ) as {
    name: string
    version: string
    repository: { url: string }
    peerDependencies: Record<string, string>
  }
  assert.equal(manifest.name, "glazejs")
  assert.equal(
    manifest.repository.url,
    "git+https://github.com/inline0/glaze.git"
  )
  assert(manifest.peerDependencies.gsap)
  assert(manifest.peerDependencies.motion)
  assert(!JSON.stringify(manifest).includes("workspace:"))
  assert(!JSON.stringify(manifest).includes("catalog:"))
  for (const engine of ["gsap", "motion"]) {
    const consumer = await mkdtemp(join(scratch, `${engine}-`))
    await writeFile(
      join(consumer, "package.json"),
      JSON.stringify({ name: "glaze-consumer", private: true, type: "module" })
    )
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        archive,
        `${engine}@${manifest.peerDependencies[engine]}`,
        ...(engine === "motion"
          ? [`@types/react@${catalog["@types/react"]}`]
          : []),
      ],
      consumer
    )
    assert(
      !existsSync(
        join(consumer, "node_modules", engine === "gsap" ? "motion" : "gsap")
      )
    )
    assert(!existsSync(join(consumer, "node_modules/react")))
    const entry =
      engine === "gsap"
        ? 'import { gsap } from "gsap"; import { createGsapAdapter } from "glazejs/gsap"; const adapter = createGsapAdapter(gsap);'
        : 'import { animate, stagger } from "motion"; import { createMotionAdapter } from "glazejs/motion"; const adapter = createMotionAdapter({ animate, stagger });'
    await writeFile(
      join(consumer, "smoke.mjs"),
      `import assert from 'node:assert/strict'; import glaze from 'glazejs'; ${entry} assert.equal(typeof glaze, 'function'); assert.equal(typeof adapter, 'object');`
    )
    run("node", ["smoke.mjs"], consumer)
    const legacyChecks =
      engine === "gsap"
        ? " instance.timelines.forEach(({ timeline }) => timeline.pause().reverse()); const legacy = glaze({ lib: { gsap: { core: gsap } } }); legacy.timelines.forEach(({ timeline }) => timeline.pause().reverse());"
        : ""
    await writeFile(
      join(consumer, "consumer.ts"),
      `import glaze from "glazejs"; ${entry} const instance = glaze({ adapter }); instance.refresh(); instance.destroy();${legacyChecks}`
    )
    await writeFile(
      join(consumer, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          types: engine === "motion" ? ["react"] : [],
          strict: true,
          noEmit: true,
        },
        include: ["consumer.ts"],
      })
    )
    run(
      join(root, "node_modules/.bin/tsc-rs"),
      ["--noEmit", "-p", join(consumer, "tsconfig.json")],
      consumer
    )
    const installed = JSON.parse(
      await readFile(
        join(consumer, "node_modules/glazejs/package.json"),
        "utf8"
      )
    ) as { version: string }
    assert.equal(installed.version, manifest.version)
    console.log(
      `Verified ${engine}-only consumer of glazejs@${manifest.version}.`
    )
  }
  console.log(
    `Verified ${files.length} production files and both public adapter exports.`
  )
} finally {
  await rm(scratch, { recursive: true, force: true })
}
