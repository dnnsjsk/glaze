import { fileURLToPath } from "node:url"
import { dts } from "rolldown-plugin-dts"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [dts({ tsconfig: "../../tsconfig.build.json" })],
  oxc: { exclude: [/\.js$/, /\.d\.[cm]?ts$/] },
  build: {
    target: "es2022",
    lib: {
      entry: {
        index: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        gsap: fileURLToPath(new URL("./src/gsap.ts", import.meta.url)),
        motion: fileURLToPath(new URL("./src/motion.ts", import.meta.url)),
      },
      formats: ["es"],
      fileName: (_format, name) =>
        name.endsWith(".d") ? `${name}.ts` : `${name}.es.js`,
    },
    rolldownOptions: {
      external: [/^gsap(?:\/|$)/, /^motion(?:\/|$)/],
    },
  },
})
