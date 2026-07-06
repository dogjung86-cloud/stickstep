import { defineConfig } from "vite";

// 앱은 웹 표준만 사용해 나중에 Capacitor로 포장 가능하도록 유지한다.
export default defineConfig({
  base: "./",
  server: { host: true, port: 5173 },
  build: { target: "es2021", outDir: "dist" },
  // three는 3D 스텝에서 동적 import — dev에서 첫 로드 시 최적화 리로드가 나지 않게 미리 포함.
  optimizeDeps: { include: ["three"] },
});
