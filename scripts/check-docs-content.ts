#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import {
  basename,
  dirname,
  extname,
  join,
  normalize,
  relative,
  resolve,
  sep,
} from "node:path"

const args = process.argv.slice(2)
const option = (name: string, fallback = ""): string => {
  const index = args.indexOf(name)
  return index >= 0 && typeof args[index + 1] === "string"
    ? (args[index + 1] ?? fallback)
    : fallback
}

const cwd = process.cwd()
const configuredRoot = option("--root")
const root = resolve(cwd, configuredRoot || "docs")
const expectedDocs = Number.parseInt(option("--expected-docs", "0"), 10) || 0
const expectedNav = Number.parseInt(option("--expected-nav", "0"), 10) || 0

if (!root || !existsSync(root)) {
  console.error("Could not resolve a documentation content root.")
  process.exit(1)
}

const normalizePath = (value: string) => value.split(sep).join("/")
const walk = (directory: string): string[] => {
  const files = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(path))
    } else if (entry.isFile()) {
      files.push(path)
    }
  }
  return files
}

const files = walk(root)
const markdownFiles = files.filter((file) => extname(file) === ".md").sort()
const mdxFiles = files.filter((file) => extname(file) === ".mdx").sort()
const metaFiles = files.filter((file) => basename(file) === "meta.json").sort()
const problems: string[] = []

if (mdxFiles.length > 0) {
  for (const file of mdxFiles) {
    problems.push(
      `${normalizePath(relative(root, file))}: canonical content must be .md, not .mdx`
    )
  }
}

if (expectedDocs > 0 && markdownFiles.length !== expectedDocs) {
  problems.push(
    `expected ${expectedDocs} Markdown documents, found ${markdownFiles.length}`
  )
}
if (expectedNav > 0 && metaFiles.length !== expectedNav) {
  problems.push(
    `expected ${expectedNav} navigation files, found ${metaFiles.length}`
  )
}

const unquote = (value: string): string => {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return trimmed.startsWith('"')
        ? String(JSON.parse(trimmed))
        : trimmed.slice(1, -1).replaceAll("''", "'")
    } catch {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed
}

const parseDocument = (
  file: string
): { source: string; body: string; data: Record<string, string> } => {
  const source = readFileSync(file, "utf8").replaceAll("\r\n", "\n")
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) {
    problems.push(`${normalizePath(relative(root, file))}: missing frontmatter`)
    return { source, body: source, data: {} }
  }

  const data: Record<string, string> = {}
  for (const line of (match[1] ?? "").split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) {
      continue
    }
    const field = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!field?.[1] || field[2] === undefined) {
      problems.push(
        `${normalizePath(relative(root, file))}: malformed frontmatter line ${JSON.stringify(line)}`
      )
      continue
    }
    if (field[1] in data) {
      problems.push(
        `${normalizePath(relative(root, file))}: duplicate frontmatter field ${field[1]}`
      )
      continue
    }
    data[field[1]] = unquote(field[2])
  }

  return { source, body: source.slice(match[0].length), data }
}

const stripInlineCode = (line: string) => line.replace(/`[^`]*`/g, "")
const inspectPortableBody = (file: string, body: string) => {
  let fence = ""
  const lines = body.split("\n")
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1]?.[0] ?? ""
      if (fence === "") {
        fence = marker
      } else if (fence === marker) {
        fence = ""
      }
      continue
    }
    if (fence !== "") {
      continue
    }

    const visible = stripInlineCode(line)
    if (/^\s*(import|export)\s/.test(visible)) {
      problems.push(
        `${normalizePath(relative(root, file))}:${index + 1}: module syntax outside a code fence`
      )
    }
    if (/<\/?[A-Z][A-Za-z0-9]*(?:\s|>|\/)/.test(visible)) {
      problems.push(
        `${normalizePath(relative(root, file))}:${index + 1}: executable JSX/MDX component outside a code fence`
      )
    }
  }
  if (fence !== "") {
    problems.push(`${normalizePath(relative(root, file))}: unclosed code fence`)
  }
}

const requiredFields = [
  "title",
  "description",
  "path",
  "order",
  "meta_title",
  "meta_description",
]
const routeOwners = new Map<string, string>()
const orderOwners = new Map<string, string>()
const documentByRelativePath = new Map<string, string>()

for (const file of markdownFiles) {
  const parsed = parseDocument(file)
  const fileRelative = normalizePath(relative(root, file))
  documentByRelativePath.set(fileRelative.replace(/\.md$/, ""), file)
  for (const field of requiredFields) {
    if (!(field in parsed.data) || String(parsed.data[field]).trim() === "") {
      problems.push(`${fileRelative}: missing frontmatter field ${field}`)
    }
  }

  const route = String(parsed.data.path ?? "").trim()
  if (routeOwners.has(route)) {
    problems.push(
      `${fileRelative}: duplicate path ${JSON.stringify(route)} also used by ${routeOwners.get(route)}`
    )
  } else if (route !== "") {
    routeOwners.set(route, fileRelative)
  }

  const orderValue = String(parsed.data.order ?? "").trim()
  const order = Number.parseInt(orderValue, 10)
  if (!/^(0|[1-9][0-9]*)$/.test(orderValue)) {
    problems.push(`${fileRelative}: order must be a non-negative integer`)
  } else {
    const section = String(parsed.data.section ?? "").trim()
    const orderKey = `${section}\0${order}`
    if (orderOwners.has(orderKey)) {
      problems.push(
        `${fileRelative}: duplicate order ${order} in section ${JSON.stringify(section)} also used by ${orderOwners.get(orderKey)}`
      )
    } else {
      orderOwners.set(orderKey, fileRelative)
    }
  }

  inspectPortableBody(file, parsed.body)
}

const referencedDocuments = new Set<string>()
const visitedMeta = new Set<string>()
const separator = /^---.+---$/

const resolveDocumentEntry = (
  directory: string,
  entry: string,
  metaFile: string
) => {
  const markdown = join(directory, `${entry}.md`)
  const indexMarkdown = join(directory, entry, "index.md")
  const childDirectory = join(directory, entry)
  if (existsSync(markdown)) {
    referencedDocuments.add(normalizePath(relative(root, markdown)))
    return
  }
  let resolved = false
  if (existsSync(indexMarkdown)) {
    referencedDocuments.add(normalizePath(relative(root, indexMarkdown)))
    resolved = true
  }
  if (existsSync(childDirectory) && statSync(childDirectory).isDirectory()) {
    const childMeta = join(childDirectory, "meta.json")
    if (existsSync(childMeta)) {
      validateMeta(childMeta)
      return
    }
  }
  if (resolved) {
    return
  }
  problems.push(
    `${normalizePath(relative(root, metaFile))}: unresolved navigation entry ${JSON.stringify(entry)}`
  )
}

const validateMeta = (metaFile: string) => {
  const normalizedMeta = normalizePath(relative(root, metaFile))
  if (visitedMeta.has(normalizedMeta)) {
    return
  }
  visitedMeta.add(normalizedMeta)

  let data: Record<string, unknown>
  try {
    data = JSON.parse(readFileSync(metaFile, "utf8")) as Record<string, unknown>
  } catch (error) {
    problems.push(
      `${normalizedMeta}: invalid JSON (${error instanceof Error ? error.message : String(error)})`
    )
    return
  }

  const directory = dirname(metaFile)
  for (const field of ["pages", "folders"]) {
    const entries = data[field] ?? []
    if (!Array.isArray(entries)) {
      problems.push(`${normalizedMeta}: ${field} must be an array`)
      continue
    }
    for (const entry of entries) {
      if (typeof entry !== "string" || entry.trim() === "") {
        problems.push(
          `${normalizedMeta}: ${field} entries must be non-empty strings`
        )
        continue
      }
      if (separator.test(entry)) {
        continue
      }
      resolveDocumentEntry(directory, entry, metaFile)
    }
  }
}

const rootMeta = join(root, "meta.json")
if (!existsSync(rootMeta)) {
  problems.push("missing root meta.json")
} else {
  validateMeta(rootMeta)
}

for (const file of metaFiles) {
  const normalizedMeta = normalizePath(relative(root, file))
  if (!visitedMeta.has(normalizedMeta)) {
    problems.push(
      `${normalizedMeta}: navigation file is unreachable from root meta.json`
    )
  }
}
for (const file of markdownFiles) {
  const fileRelative = normalizePath(relative(root, file))
  if (!referencedDocuments.has(fileRelative)) {
    problems.push(`${fileRelative}: document is unreachable from navigation`)
  }
}

const resolveRelativeLink = (sourceFile: string, target: string) => {
  const clean = target.replace(/^<|>$/g, "").split(/[?#]/)[0] ?? ""
  if (
    clean === "" ||
    clean.startsWith("/") ||
    clean.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(clean)
  ) {
    return true
  }
  const decoded = decodeURIComponent(clean)
  const candidate = normalize(resolve(dirname(sourceFile), decoded))
  const options = extname(candidate)
    ? [candidate]
    : [candidate, `${candidate}.md`, join(candidate, "index.md")]
  return options.some((path) => existsSync(path))
}

for (const file of markdownFiles) {
  const { body } = parseDocument(file)
  for (const match of body.matchAll(
    /!?\[[^\]]*\]\((<[^>\n]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g
  )) {
    if (!resolveRelativeLink(file, match[1] ?? "")) {
      problems.push(
        `${normalizePath(relative(root, file))}: broken relative link ${match[1]}`
      )
    }
  }
}

if (problems.length > 0) {
  console.error(
    `Documentation content check failed with ${problems.length} problem(s):`
  )
  for (const problem of problems) {
    console.error(`- ${problem}`)
  }
  process.exit(1)
}

console.log(
  JSON.stringify({
    root: normalizePath(root),
    documents: markdownFiles.length,
    uniqueRoutes: routeOwners.size,
    navigationFiles: metaFiles.length,
    problems: 0,
  })
)
