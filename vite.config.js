import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
const pathResolve = (dir) => {
  return resolve(__dirname, ".", dir);
};
// https://vitejs.dev/config/
export default defineConfig({
  base: "/three/",
  plugins: [vue()],
  // assetsInclude: ["**/*.glb"],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": pathResolve("src"),
    },
  },
});
