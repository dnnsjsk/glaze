import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

test("validates angle-bracket links without rejecting formatted engine URLs", async () => {
  const root = await mkdtemp(join(tmpdir(), "glaze-docs-"))
  const frontmatter = [
    "---",
    "title: Test",
    "description: Test",
    "path: .",
    "order: 0",
    "meta_title: Test",
    "meta_description: Test",
    "---",
    "",
  ].join("\n")
  const check = () =>
    spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("./check-docs-content.ts", import.meta.url)),
        "--root",
        root,
        "--expected-docs",
        "1",
        "--expected-nav",
        "1",
      ],
      { encoding: "utf8", timeout: 10_000 }
    )
  try {
    await writeFile(join(root, "meta.json"), '{"pages":["index"]}')
    await writeFile(join(root, "file with spaces.txt"), "Documentation asset")
    await writeFile(
      join(root, "index.md"),
      `${frontmatter}
[GSAP](<https://gsap.com/docs/v3/GSAP/gsap.fromTo()>)
[Asset](<file with spaces.txt>)
`
    )
    const valid = check()
    assert.equal(valid.status, 0, valid.stderr)
    await writeFile(
      join(root, "index.md"),
      `${frontmatter}\n[Missing](<missing.md>)\n`
    )
    const invalid = check()
    assert.equal(invalid.status, 1)
    assert.match(invalid.stderr, /broken relative link <missing.md>/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
