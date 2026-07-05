import { defineConfig } from "vite";

// 앱은 웹 표준만 사용해 나중에 Capacitor로 포장 가능하도록 유지한다.
export default defineConfig({
  base: "./",
  server: { host: true, port: 5173 },
  build: { target: "es2021", outDir: "dist" },
});
