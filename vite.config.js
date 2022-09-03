import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
const pathResolve = (dir) => {
  return resolve(__dirname, ".", dir);
};
export default defineConfig({
  base: "/three/",
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
  server: {
    open: "/three/",
  },
  resolve: {
    alias: {
      "@": pathResolve("src"),
    },
  },
});
