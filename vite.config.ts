import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// public/qa-*(검수 갤러리 html·샷 폴더)는 개발 산출물 — 프로덕션 배포(dist)에서 걷어낸다
// (2026-08-14 토스PG 심사 정리: 미완성으로 보이는 공개 URL 차단). dev 서버·갤러리 검수는 그대로
// (public/ 원본 불변, qa- 접두 = QA 전용이라는 기존 명명 관례가 제거 기준).
// 경로는 configResolved의 root/outDir에서 받는다(__dirname은 ESM 로드 시 없음 — 모드 무관 안전).
function stripQaHtml(): Plugin {
  let cfg: ResolvedConfig | null = null;
  return {
    name: "strip-qa-html",
    apply: "build",
    configResolved(c) {
      cfg = c;
    },
    closeBundle() {
      try {
        const dist = join(cfg?.root ?? process.cwd(), cfg?.build.outDir ?? "dist");
        for (const f of readdirSync(dist)) {
          if (/^qa-/.test(f)) rmSync(join(dist, f), { recursive: true, force: true });
        }
      } catch {
        /* dist 없음 등 — 빌드 실패가 아니라 무시 */
      }
    },
  };
}

// 앱은 웹 표준만 사용해 나중에 Capacitor로 포장 가능하도록 유지한다.
export default defineConfig({
  base: "./",
  // 포트: 프리뷰 하니스가 PORT를 넘기면 그대로 쓰고(strict), 아니면 5199(5173은 다른 세션 몫).
  server: { host: true, port: Number(process.env.PORT) || 5199, strictPort: !!process.env.PORT },
  build: { target: "es2021", outDir: "dist" },
  plugins: [stripQaHtml()],
  // three(3D 스텝)·supabase-js(로그인)·matter-js(코스모 머지 물리)는 동적 import —
  // dev 첫 로드 시 최적화 리로드가 나지 않게 미리 포함.
  optimizeDeps: { include: ["three", "@supabase/supabase-js", "matter-js"] },
});
