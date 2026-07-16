// 파비콘 재생성 — "발자국 2개 지그재그" 마크(2026-07-16 사용자 확정, 시안 g3):
// 블루 그라데이션 라운드 사각 + 흰 발자국 2(홈 트레일 도장 #bsfp 실루엣) + 입체 옆면(#175BC4) + 키라이트.
// 각 크기를 벡터로 직접 렌더(512 축소보다 선명) → public/favicon.ico(16·32·48 PNG-in-ICO) +
// public/brand/favicon-{16,32,48,180,192,512}.png. 180(apple-touch)은 풀블리드(iOS가 자체 마스크).
// 실행: node qa/make-favicon.mjs (dev 서버 불필요, 시스템 Chrome 필요)
// 참고: 스틱맨 앱 아이콘(public/brand/icon.png, make-icon.mjs)은 별개로 보존 — Capacitor 포장용.
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = path.join(REPO, "public/brand");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
await page.goto("about:blank");

const out = await page.evaluate(() => {
  /* g3 확정 레시피 — 전 좌표를 S 비율로 파라미터화해 크기별 네이티브 렌더 */
  function render(S, opts = {}) {
    const fullBleed = !!opts.fullBleed; // apple-touch: 모서리 클립 없이 꽉 채움
    const cv = document.createElement("canvas");
    cv.width = S; cv.height = S;
    const c = cv.getContext("2d");
    c.save();
    if (!fullBleed) {
      c.beginPath();
      c.roundRect(0, 0, S, S, S * (116 / 512));
      c.clip();
    }
    // 배경: 브랜드 블루 그라데이션 + 좌상단 키라이트
    const g = c.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, "#54A0F7"); g.addColorStop(0.52, "#3182F6"); g.addColorStop(1, "#2068DF");
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    const hl = c.createRadialGradient(S * 0.24, S * 0.16, S * 0.02, S * 0.24, S * 0.16, S * 0.9);
    hl.addColorStop(0, "rgba(255,255,255,.16)"); hl.addColorStop(0.5, "rgba(255,255,255,.04)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = hl; c.fillRect(0, 0, S, S);
    // 발자국(홈 트레일 도장 #bsfp) — 왼발 미러·좌우 스플레이, 옆면(아래 오프셋) 뒤 면 순서
    const FOOT = new Path2D("M0,-5.6 C1.8,-5.6 3.2,-4.4 3.2,-2.6 C3.2,-0.8 2.5,0.8 1.7,1.4 C1.2,1.8 -1.2,1.8 -1.7,1.4 C-2.5,0.8 -3.2,-0.8 -3.2,-2.6 C-3.2,-4.4 -1.8,-5.6 0,-5.6 Z");
    const sc = S * (23.5 / 512);
    const foot = (tx, ty, rot, mir) => {
      const draw = (fill, dy) => {
        c.save(); c.translate(tx, ty); c.rotate(rot); c.scale(mir * sc, sc); c.translate(0, dy);
        c.fillStyle = fill;
        c.fill(FOOT);
        c.beginPath(); c.roundRect(-2, 2.9, 4, 2.7, 1.35); c.fill();
        c.restore();
      };
      draw("#175BC4", 0.55); // 입체 옆면(지도 스텝 노드 문법)
      draw("#FFFFFF", 0);
    };
    foot(S * 0.345, S * 0.655, -0.14, -1);
    foot(S * 0.655, S * 0.345, 0.14, 1);
    c.restore();
    return cv.toDataURL("image/png");
  }
  return {
    p16: render(16), p32: render(32), p48: render(48),
    p192: render(192), p512: render(512),
    p180: render(180, { fullBleed: true }),
  };
});

const buf = (dataUrl) => Buffer.from(dataUrl.split(",")[1], "base64");
const pngs = { 16: buf(out.p16), 32: buf(out.p32), 48: buf(out.p48), 180: buf(out.p180), 192: buf(out.p192), 512: buf(out.p512) };
for (const [size, b] of Object.entries(pngs)) fs.writeFileSync(path.join(BRAND, `favicon-${size}.png`), b);

// favicon.ico — PNG-in-ICO(16·32·48): ICONDIR(6) + ICONDIRENTRY(16×n) + PNG 원본
function makeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
  let offset = 6 + 16 * entries.length;
  const dirs = entries.map(({ size, b }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(b.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += b.length;
    return e;
  });
  return Buffer.concat([header, ...dirs, ...entries.map((x) => x.b)]);
}
fs.writeFileSync(path.join(REPO, "public/favicon.ico"), makeIco([16, 32, 48].map((size) => ({ size, b: pngs[size] }))));

console.log("saved: public/favicon.ico + public/brand/favicon-{16,32,48,180,192,512}.png");
await browser.close();
