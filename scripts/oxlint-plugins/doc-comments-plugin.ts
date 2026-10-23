// Oxlint rules for the doc comments on package source: every exported
// function, class, interface and type alias carries a /** */ comment, its
// `@param` tags read `@param name - text`, and no comment runs past the
// formatter's width. Oxlint's own jsdoc rules, enabled beside these in
// .oxlintrc.json, then hold each comment's parameters and return value
// complete. AGENTS.md states the rule and its scope.

import { definePlugin, defineRule } from "@oxlint/plugins"
import type { Context, ESTree, Fixer } from "@oxlint/plugins"
import formatter from "../../oxfmt.config.ts"

type Documented =
  | ESTree.Function
  | ESTree.Class
  | ESTree.TSInterfaceDeclaration
  | ESTree.TSTypeAliasDeclaration
  | ESTree.VariableDeclaration

const hasDocComment = (context: Context, node: ESTree.Node): boolean => {
  const comment = context.sourceCode.getCommentsBefore(node).at(-1)
  return comment?.type === "Block" && comment.value.startsWith("*")
}

const isFunctionValue = (
  node: ESTree.Expression | null | undefined
): boolean => {
  if (node === null || node === undefined) {
    return false
  }
  if (
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression"
  ) {
    return true
  }
  if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") {
    return isFunctionValue(node.expression)
  }
  return false
}

const kindOf = (node: Documented): string => {
  switch (node.type) {
    case "ClassDeclaration":
    case "ClassExpression":
      return "class"
    case "TSInterfaceDeclaration":
      return "interface"
    case "TSTypeAliasDeclaration":
      return "type alias"
    default:
      return "function"
  }
}

const nameOf = (node: Documented): string | undefined => {
  if (node.type === "VariableDeclaration") {
    const id = node.declarations[0]?.id
    return id?.type === "Identifier" ? id.name : undefined
  }
  return node.id?.name
}

// The declaration an export documents, when it is one this rule covers. A
// `const` counts only when its one declarator holds a function.
const documented = (
  node: ESTree.Node | null | undefined
): Documented | undefined => {
  switch (node?.type) {
    case "FunctionDeclaration":
    case "TSDeclareFunction":
    case "FunctionExpression":
    case "ClassDeclaration":
    case "ClassExpression":
    case "TSInterfaceDeclaration":
    case "TSTypeAliasDeclaration":
      return node
    case "VariableDeclaration":
      return node.declarations.length === 1 &&
        isFunctionValue(node.declarations[0]?.init)
        ? node
        : undefined
    default:
      return undefined
  }
}

const requireExportDocsRule = defineRule({
  meta: {
    type: "suggestion",
  },
  create(context: Context) {
    // Overloads share the comment on their first signature.
    const seen = new Set<string>()

    const check = (
      node: ESTree.Node | null | undefined,
      commented: ESTree.Node
    ): void => {
      const declaration = documented(node)
      if (declaration === undefined) {
        return
      }
      const name = nameOf(declaration)
      if (
        name !== undefined &&
        declaration.type !== "VariableDeclaration" &&
        seen.has(name)
      ) {
        return
      }
      if (name !== undefined) {
        seen.add(name)
      }
      if (hasDocComment(context, commented)) {
        return
      }
      context.report({
        node: commented,
        message: `Document the exported ${kindOf(declaration)}${name === undefined ? "" : ` ${name}`} with a /** */ comment.`,
      })
    }

    return {
      ExportNamedDeclaration(node: ESTree.ExportNamedDeclaration) {
        if (node.declaration !== null) {
          check(node.declaration, node)
        }
      },
      ExportDefaultDeclaration(node: ESTree.ExportDefaultDeclaration) {
        check(node.declaration, node)
      },
    }
  },
})

// `@param name description`, missing the hyphen between the name and its
// description.
const UNSEPARATED_PARAM =
  /(@param\s+(?:\{[^}]*\}\s+)?\[?[\w$.]+(?:=[^\]\s]*)?\]?)[ \t]+(?!-[ \t])(?=\S)/gu

const paramHyphenRule = defineRule({
  meta: {
    type: "layout",
    fixable: "code",
  },
  create(context: Context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type !== "Block" || !comment.value.startsWith("*")) {
            continue
          }
          // The comment's text starts two characters (`/*`) after its range.
          const start = comment.range[0] + 2
          for (const match of comment.value.matchAll(UNSEPARATED_PARAM)) {
            const end = start + match.index + match[0].length
            const nameEnd = start + match.index + (match[1] ?? "").length
            context.report({
              loc: {
                start: context.sourceCode.getLocFromIndex(nameEnd),
                end: context.sourceCode.getLocFromIndex(end),
              },
              message:
                'Separate a @param name from its description with " - ".',
              fix: (fixer: Fixer) =>
                fixer.replaceTextRange([nameEnd, end], " - "),
            })
          }
        }
      },
    }
  },
})

// Oxfmt's print width, which Oxfmt does not apply to comments.
const MAX_WIDTH = formatter.printWidth ?? 80

// A URL or another word this long cannot be wrapped.
const UNBREAKABLE = /\S{40,}/u

const commentWidthRule = defineRule({
  meta: {
    type: "layout",
  },
  create(context: Context) {
    return {
      Program() {
        const lines = context.sourceCode.lines
        const reported = new Set<number>()
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type === "Shebang") {
            continue
          }
          for (
            let line = comment.loc.start.line;
            line <= comment.loc.end.line;
            line += 1
          ) {
            const text = lines[line - 1] ?? ""
            if (
              reported.has(line) ||
              Array.from(text).length <= MAX_WIDTH ||
              UNBREAKABLE.test(text)
            ) {
              continue
            }
            reported.add(line)
            context.report({
              loc: {
                start: { line, column: MAX_WIDTH },
                end: { line, column: text.length },
              },
              message: `Wrap comments at ${String(MAX_WIDTH)} columns.`,
            })
          }
        }
      },
    }
  },
})

/**
 * The `sleekos-docs` Oxlint plugin: `require-export-docs` asks for a doc
 * comment on every exported function, class, interface and type alias,
 * `param-hyphen` writes `@param name - text`, and `comment-width` wraps
 * comments at the formatter's print width.
 */
export default definePlugin({
  meta: {
    name: "sleekos-docs",
  },
  rules: {
    "comment-width": commentWidthRule,
    "param-hyphen": paramHyphenRule,
    "require-export-docs": requireExportDocsRule,
  },
})
