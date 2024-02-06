import { defineConfig, ViteDevServer } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

const removeConsolePlugin = () => {
  return {
    name: "remove-console", // name of the plugin
    renderChunk(code: string) {
      return code.replace(/console\.log\(.*\);?/g, "");
    },
  };
};

const forceFullReloadPlugin = () => {
  return {
    name: "force-full-reload",
    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      if (file.endsWith(".ts")) {
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };
};

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "Glaze",
      fileName: (format) => `index.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["gsap"],
    },
    minify: "esbuild",
  },
  plugins: [
    removeConsolePlugin(),
    forceFullReloadPlugin(),
    dts({
      include: ["./src/index.ts"],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
});
