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
});
