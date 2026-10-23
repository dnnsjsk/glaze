import { describe, it } from "node:test"
import { RuleTester } from "oxlint/plugins-dev"
import plugin from "./doc-comments-plugin.ts"

// The tester registers its cases through node:test, whose functions return
// the promise of the suite they start.
RuleTester.describe = (text, run) => {
  describe(text, run)
}
RuleTester.it = (text, run) => {
  it(text, run)
}

const tester = new RuleTester({
  languageOptions: { sourceType: "module", parserOptions: { lang: "tsx" } },
})

const rule = (name: string) => {
  const found = plugin.rules[name]
  if (found === undefined) {
    throw new Error(`The plugin has no ${name} rule.`)
  }
  return found
}

tester.run("require-export-docs", rule("require-export-docs"), {
  valid: [
    "/** Adds two numbers. */\nexport function add(a: number, b: number) { return a + b }",
    "/** Settings. */\nexport interface Settings { name: string }",
    "/** A name. */\nexport type Name = string",
    "/** Fails. */\nexport class Failure extends Error {}",
    "/** Doubles. */\nexport const double = (value: number) => value * 2",
    "/** Reads. */\nexport const read = function (path: string) { return path }",
    "/** Typed. */\nexport const typed = ((value: string) => value) satisfies Reader",
    "/** The default page. */\nexport default function Page() {}",
    "/** The default store. */\nexport default class {}",
    // Overloads share the first signature's comment.
    "/** Reads. */\nexport function read(a: string): string\nexport function read(a: number): number\nexport function read(a: unknown) { return a }",
    // Constants that aren't functions, local declarations, re-exports and
    // default expressions are out of scope.
    "export const limit = 10",
    "export const layer = make(() => 1)",
    "export const first = () => 1, second = () => 2",
    "export const { pick } = { pick: () => 1 }",
    "function local() {}\ninterface Local {}\nexport { local }",
    "export { value } from './value.ts'",
    "export default defineConfig({})",
  ],
  invalid: [
    {
      code: "export function add(a: number, b: number) { return a + b }",
      errors: [
        {
          message: "Document the exported function add with a /** */ comment.",
        },
      ],
    },
    {
      code: "// A line comment is not documentation.\nexport interface Settings { name: string }",
      errors: [
        {
          message:
            "Document the exported interface Settings with a /** */ comment.",
        },
      ],
    },
    {
      code: "/* Neither is a plain block. */\nexport type Name = string",
      errors: [
        {
          message:
            "Document the exported type alias Name with a /** */ comment.",
        },
      ],
    },
    {
      code: "export class Failure extends Error {}",
      errors: [
        {
          message: "Document the exported class Failure with a /** */ comment.",
        },
      ],
    },
    {
      code: "export const double = (value: number) => value * 2",
      errors: [
        {
          message:
            "Document the exported function double with a /** */ comment.",
        },
      ],
    },
    {
      code: "export const read = (path => path) as Reader",
      errors: 1,
    },
    {
      code: "export default function () {}",
      errors: [
        { message: "Document the exported function with a /** */ comment." },
      ],
    },
    {
      code: "export declare function load(path: string): string",
      errors: [
        {
          message: "Document the exported function load with a /** */ comment.",
        },
      ],
    },
  ],
})

tester.run("comment-width", rule("comment-width"), {
  valid: [
    `// ${"word ".repeat(15)}`,
    `/**\n * ${"word ".repeat(15)}\n */`,
    `// See https://example.com/${"a".repeat(100)}`,
    `const text = "${"x ".repeat(60)}"`,
    "#!/usr/bin/env node\nconst value = 1",
  ],
  invalid: [
    {
      code: `// ${"word ".repeat(16)}`,
      errors: [{ message: "Wrap comments at 80 columns.", line: 1 }],
    },
    {
      code: `/**\n * Short.\n * ${"word ".repeat(16)}\n */`,
      errors: [{ message: "Wrap comments at 80 columns.", line: 3 }],
    },
    {
      code: `const value = 1 // ${"word ".repeat(14)}`,
      errors: 1,
    },
    {
      code: `/* ${"word ".repeat(16)} */ /* ${"word ".repeat(16)} */`,
      errors: 1,
    },
  ],
})

tester.run("param-hyphen", rule("param-hyphen"), {
  valid: [
    "/**\n * Adds.\n * @param a - The first.\n * @param b - The second.\n */\nfunction add(a, b) {}",
    "/**\n * Reads.\n * @param path\n */\nfunction read(path) {}",
    "// @param a not a doc comment\nfunction add(a) {}",
    "/* @param a not a doc comment either */\nfunction add(a) {}",
  ],
  invalid: [
    {
      code: "/**\n * Adds.\n * @param a The first.\n * @param b - The second.\n */\nfunction add(a, b) {}",
      output:
        "/**\n * Adds.\n * @param a - The first.\n * @param b - The second.\n */\nfunction add(a, b) {}",
      errors: [
        {
          message: 'Separate a @param name from its description with " - ".',
          line: 3,
        },
      ],
    },
    {
      code: "/** @param options.root   Where to start. */\nfunction walk(options) {}",
      output:
        "/** @param options.root - Where to start. */\nfunction walk(options) {}",
      errors: 1,
    },
    {
      code: "/** @param {string} [name=x] The name. */\nfunction greet(name) {}",
      output:
        "/** @param {string} [name=x] - The name. */\nfunction greet(name) {}",
      errors: 1,
    },
  ],
})
