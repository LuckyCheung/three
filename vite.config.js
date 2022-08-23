import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
const pathResolve = (dir) => {
  return resolve(__dirname, ".", dir);
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ["**/*.glb"],
  resolve: {
    alias: {
      "@": pathResolve("src"),
    },
  },
});
