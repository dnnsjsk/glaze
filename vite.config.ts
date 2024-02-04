import { defineConfig, ViteDevServer } from "vite";

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
  build: {
    lib: {
      entry: "./packages/core/index.ts",
      name: "Glaze",
      fileName: (format) => `glaze.${format}.js`,
    },
    rollupOptions: {
      external: ["gsap"],
    },
    minify: "esbuild",
  },
  plugins: [removeConsolePlugin(), forceFullReloadPlugin()],
});
