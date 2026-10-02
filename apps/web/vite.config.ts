import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  envDir: "../..",
  server: {
    host: "127.0.0.1",
    proxy: {
      "/seller": {
        target: "http://127.0.0.1:5174",
        changeOrigin: true,
        ws: true,
      },
      "/admin": {
        target: "http://127.0.0.1:5175",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
