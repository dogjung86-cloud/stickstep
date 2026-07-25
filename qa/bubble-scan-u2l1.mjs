// u2l1 말풍선 자리 탐색 — 컷마다 '그림 위에 아무것도 없는' 사각형을 전수 탐색해
// 인물(머리) 가까운 순으로 후보 좌표를 뽑는다. 프레임(1:1 cover 크롭) 기준 %.
// 사용: PORT=<포트> node qa/bubble-scan-u2l1.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5211";
// w·h = shot-u2l1-bubbles.mjs로 실측한 말풍선 크기(%), head = 말이 나올 인물 머리 중심(프레임 %)
const SPEC = [
  { n: 0, w: 28.8, h: 8.9, head: [31, 24] },
  { n: 1, w: 34.9, h: 8.9, head: [40, 30] },
  { n: 2, w: 28.8, h: 8.9, head: [33, 23] },
  { n: 3, w: 24.3, h: 8.9, head: [50, 20] },
  { n: 4, w: 26.9, h: 8.9, head: [13, 32] },
  { n: 5, w: 28.0, h: 8.9, head: [15, 31] },
  { n: 6, w: 33.0, h: 8.9, head: [27, 49] },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });

for (const s of SPEC) {
  const best = await page.evaluate(async (s) => {
    const img = new Image();
    img.src = `/comics/u2l1/${s.n}.webp`;
    await img.decode();
    const S = 400;
    const c = document.createElement("canvas");
    c.width = S;
    c.height = S;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, S, S);
    const sc = Math.max(S / img.naturalWidth, S / img.naturalHeight);
    g.drawImage(img, (S - img.naturalWidth * sc) / 2, (S - img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
    const d = g.getImageData(0, 0, S, S).data;
    // 적분 영상(잉크 픽셀 누적합)으로 사각형 잉크량을 O(1)에 구한다
    const sum = new Int32Array((S + 1) * (S + 1));
    for (let y = 0; y < S; y += 1)
      for (let x = 0; x < S; x += 1) {
        const i = (y * S + x) * 4;
        const ink = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 232 ? 1 : 0;
        sum[(y + 1) * (S + 1) + (x + 1)] = ink + sum[y * (S + 1) + (x + 1)] + sum[(y + 1) * (S + 1) + x] - sum[y * (S + 1) + x];
      }
    const inkPct = (x0p, y0p, x1p, y1p) => {
      const x0 = Math.max(0, Math.round((x0p / 100) * S));
      const x1 = Math.min(S, Math.round((x1p / 100) * S));
      const y0 = Math.max(0, Math.round((y0p / 100) * S));
      const y1 = Math.min(S, Math.round((y1p / 100) * S));
      if (x1 <= x0 || y1 <= y0) return 100;
      const a = sum[y1 * (S + 1) + x1] - sum[y0 * (S + 1) + x1] - sum[y1 * (S + 1) + x0] + sum[y0 * (S + 1) + x0];
      return (a / ((x1 - x0) * (y1 - y0))) * 100;
    };
    const out = [];
    for (let x = 12; x <= 88; x += 1)
      for (let y = 8; y <= 86; y += 1)
        for (const flip of [false, true]) {
          const x0 = x - s.w / 2 - 1;
          const x1 = x + s.w / 2 + 1;
          const y0 = flip ? y - 2.4 : y - s.h - 1;
          const y1 = flip ? y + s.h + 1 : y + 2.4;
          if (x0 < 3 || x1 > 97 || y0 < 3 || y1 > 97) continue;
          const ink = inkPct(x0, y0, x1, y1);
          if (ink > 0.6) continue;
          const cx = x;
          const cy = flip ? y + s.h / 2 : y - s.h / 2;
          const dist = Math.hypot(cx - s.head[0], cy - s.head[1]);
          out.push({ x, y, flip, ink: +ink.toFixed(2), dist: +dist.toFixed(1) });
        }
    out.sort((a, b) => a.dist - b.dist);
    // 좌표가 촘촘히 겹치지 않게 12% 이상 떨어진 후보만 남긴다
    const picked = [];
    for (const o of out) {
      if (picked.some((p) => Math.hypot(p.x - o.x, p.y - o.y) < 12 && p.flip === o.flip)) continue;
      picked.push(o);
      if (picked.length >= 6) break;
    }
    return picked;
  }, s);
  console.log(`cut ${s.n} (머리 ${s.head})  후보:`, best.map((b) => `x=${b.x} y=${b.y}${b.flip ? " flip" : ""} (잉크 ${b.ink}%, 거리 ${b.dist})`).join(" | ") || "없음");
}
await browser.close();
