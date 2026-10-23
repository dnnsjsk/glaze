import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"

// Develop against the same entry points that the published archive exposes.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "glazejs/motion",
        replacement: fileURLToPath(
          new URL("../../packages/core/src/motion.ts", import.meta.url)
        ),
      },
      {
        find: "glazejs/gsap",
        replacement: fileURLToPath(
          new URL("../../packages/core/src/gsap.ts", import.meta.url)
        ),
      },
      {
        find: /^glazejs$/,
        replacement: fileURLToPath(
          new URL("../../packages/core/src/index.ts", import.meta.url)
        ),
      },
    ],
  },
  build: {
    rolldownOptions: {
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        legacy: fileURLToPath(new URL("./legacy/index.html", import.meta.url)),
      },
    },
  },
})
