import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path'
import historyPlugin from "./plugins/history";
import buildInfoPlugin from "./plugins/build-info";
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), historyPlugin(), buildInfoPlugin(), topLevelAwait()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    cors: true
  },
  root: ".",
  resolve: {
    alias: {
      "@public": resolve(__dirname, "src-public"),
      "@locale": resolve(__dirname, "src-public/locale"),
      "@utils": resolve(__dirname, "src-public/utils"),
      "@hooks": resolve(__dirname, "src-public/hooks"),
      "@plugins": resolve(__dirname, "src-public/plugins"),
      "@components": resolve(__dirname, "src-public/components"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.html'),
        monitor: resolve(__dirname, 'monitor.html'),
      },
    },
  },
}));
