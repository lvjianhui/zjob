import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

const projectRoot = path.resolve(__dirname);

export default defineConfig({
  root: projectRoot,
  plugins: [uni()],
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 5.2 仍使用 legacy JS API 调用 sass,在等待升级到 Vite 5.4+ 的 modern API 前,
        // 显式静音该弃用警告,避免开发与构建日志被污染。
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
