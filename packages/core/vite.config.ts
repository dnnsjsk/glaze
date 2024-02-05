import { defineConfig, ViteDevServer } from "vite";
import dts from "vite-plugin-dts";

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
    forceFullReloadPlugin(),
    dts({
      include: ["./src/index.ts"],
    }),
  ],
});
