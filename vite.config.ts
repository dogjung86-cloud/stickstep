import { defineConfig } from "vite";

// 앱은 웹 표준만 사용해 나중에 Capacitor로 포장 가능하도록 유지한다.
export default defineConfig({
  base: "./",
  // 포트: 프리뷰 하니스가 PORT를 넘기면 그대로 쓰고(strict), 아니면 5199(5173은 다른 세션 몫).
  server: { host: true, port: Number(process.env.PORT) || 5199, strictPort: !!process.env.PORT },
  build: { target: "es2021", outDir: "dist" },
  // three는 3D 스텝에서 동적 import — dev에서 첫 로드 시 최적화 리로드가 나지 않게 미리 포함.
  optimizeDeps: { include: ["three"] },
});
