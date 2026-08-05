// 인스타 세이프 존 검사 — out/*.mp4의 카드별 대표 프레임에서 "읽어야 하는 텍스트"의
// 바운딩 박스를 실측해 릴스 오버레이·피드 크롭·액션 레일과 겹치는지 기계 판정한다.
//
// 사용: node check-safezone.mjs [영상경로]        (기본 out/stickstep-marketing-9x16.mp4)
// 산출: 콘솔 판정표 + shots/safezone-<t>.png(가이드 오버레이 — 눈검수용)
//
// 배경(2026-08-05 사용자 지적 "인스타 버튼 때문에 자막 안 보이지 않나?"):
//  · 릴스 하단 오버레이(계정명·캡션·음원) = y ≥ 1536 → 텍스트 하한 가이드 1500(여유 36)
//  · 릴스 우측 액션 레일(좋아요·댓글·공유) = x ≥ 950 → 텍스트 우한 가이드 900(여유 50)
//  · 피드 4:5 미리보기 크롭 = y 285~1635만 노출 → 텍스트가 이 구간 안에 완결돼야 함
// 폰 목업 상단이 4:5에서 잘리는 것은 허용(카피 가독이 우선) — 검사 대상은 텍스트뿐이다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || path.join(__dirname, "out", "stickstep-marketing-9x16.mp4");
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });
const TMP = path.join(__dirname, ".sz-tmp");
fs.mkdirSync(TMP, { recursive: true });

const W = 1080, H = 1920;
const GUIDE = { bottom: 1500, right: 900, cropTop: 285, cropBot: 1635 };
const REAL = { overlay: 1536, rail: 950 }; // 실제 UI 시작점(가이드보다 바깥)

// [초, 라벨, 스캔 시작 y] — 카드는 폰 아래 카피만, 엔드카드는 풀프레임
const SAMPLES = [
  [1.4, "인트로", 200],
  [5.0, "지도", 1100],
  [9.6, "열", 1100],
  [15.0, "생생하게", 1100],
  [22.0, "달 3D", 1100],
  [27.0, "레이저", 1100],
  [31.3, "퀴즈", 1100],
  [35.5, "시험", 1100],
  [40.5, "오답노트", 1100],
  [47.0, "엔드카드", 700],
];

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error("ffmpeg 실패");
};

let bad = 0;
console.log(`검사: ${path.basename(SRC)}`);
console.log("카드        텍스트 y        텍스트 x        판정");
for (const [t, label, y0] of SAMPLES) {
  const png = path.join(TMP, `f${t}.png`);
  const raw = path.join(TMP, `f${t}.gray`);
  ff(["-ss", String(t), "-i", SRC, "-frames:v", "1", png]);
  ff(["-i", png, "-pix_fmt", "gray", "-f", "rawvideo", raw]);
  const b = fs.readFileSync(raw);

  // 밝은 텍스트 픽셀(>140)만 — 다크 무대 배경·폰 베젤은 훨씬 어둡다.
  let top = -1, bot = -1, left = W, right = 0;
  for (let y = y0; y < H; y++) {
    let n = 0, l = W, r = 0;
    for (let x = 0; x < W; x++) if (b[y * W + x] > 140) { n++; if (x < l) l = x; if (x > r) r = x; }
    if (n > 3) { if (top < 0) top = y; bot = y; if (l < left) left = l; if (r > right) right = r; }
  }
  if (top < 0) { console.log(`${label.padEnd(10)} (텍스트 없음)`); continue; }

  const fail = [];
  if (bot > GUIDE.bottom) fail.push(`하단 +${bot - GUIDE.bottom}${bot > REAL.overlay ? "(실오버레이 침범!)" : ""}`);
  if (right > GUIDE.right) fail.push(`우측 +${right - GUIDE.right}${right > REAL.rail ? "(실레일 침범!)" : ""}`);
  if (bot > GUIDE.cropBot || top < GUIDE.cropTop) fail.push("4:5 크롭 잘림");
  if (fail.length) bad++;
  console.log(
    `${label.padEnd(10)} ${String(top).padStart(4)}~${String(bot).padStart(4)}      ` +
    `${String(left).padStart(4)}~${String(right).padStart(4)}      ${fail.length ? "✗ " + fail.join(" · ") : "OK"}`,
  );

  // 가이드 오버레이 샷(눈검수용): 하단·우측 세이프 라인 + 4:5 크롭 라인
  ff(["-i", png, "-vf",
    `drawbox=x=0:y=${GUIDE.bottom}:w=${W}:h=3:color=red@0.9:t=fill,` +
    `drawbox=x=0:y=${REAL.overlay}:w=${W}:h=${H - REAL.overlay}:color=red@0.18:t=fill,` +
    `drawbox=x=${GUIDE.right}:y=0:w=3:h=${H}:color=orange@0.9:t=fill,` +
    `drawbox=x=${REAL.rail}:y=0:w=${W - REAL.rail}:h=${H}:color=orange@0.16:t=fill,` +
    `drawbox=x=0:y=0:w=${W}:h=${GUIDE.cropTop}:color=black@0.5:t=fill,` +
    `drawbox=x=0:y=${GUIDE.cropBot}:w=${W}:h=${H - GUIDE.cropBot}:color=black@0.5:t=fill`,
    path.join(SHOTS, `safezone-${label}.png`)]);
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(bad ? `\n${bad}개 카드가 세이프 존을 벗어났다.` : "\n전 카드 세이프 존 통과.");
console.log("가이드 오버레이 샷 → shots/safezone-*.png (빨강=하단 · 주황=우측 · 검정=4:5 크롭 제외 구간)");
process.exit(bad ? 1 : 0);
