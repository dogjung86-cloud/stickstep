// 컷 임베드 검증 — 전 커리큘럼(중1+중2)을 훑어 concept의 cut figure를 모두 찾아
// 실제 <img>로 로드(naturalWidth>0)되는지 확인한다. PORT=5199 node qa/check-cuts.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5199";
const BASE = `http://localhost:${PORT}/`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" });

// 데이터 계약: 전 트랙 레슨 스텝을 순회하며 cut src를 수집
const found = await page.evaluate(async () => {
  const cur = await import("/src/content/curriculum.ts");
  const mcur = await import("/src/content/math/curriculum.ts");
  const tracks = { ...(cur.CURRICULA || { g1: cur.CURRICULUM }) };
  for (const [g, units] of Object.entries(mcur.MATH_CURRICULA || {})) tracks[`math-${g}`] = units;
  const out = [];
  for (const [g, units] of Object.entries(tracks)) {
    for (const u of units) {
      for (const les of u.lessons || []) {
        for (const s of les.steps || []) {
          if (s.type !== "concept" || !Array.isArray(s.blocks)) continue;
          for (const b of s.blocks) {
            if (b && b.k === "figure" && typeof b.svg === "string" && b.svg.includes("/cuts/")) {
              const m = b.svg.match(/src="([^"]+cuts\/[^"]+\.webp)"/);
              if (m) out.push({ grade: g, unit: u.id, lesson: les.id, src: m[1] });
            }
          }
        }
      }
    }
  }
  return out;
});

console.log(`발견한 cut figure: ${found.length}개\n`);
let pass = 0, fail = 0;
for (const f of found) {
  const load = await page.evaluate((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ok: img.naturalWidth > 0, w: img.naturalWidth });
    img.onerror = () => resolve({ ok: false, w: 0 });
    img.src = src.startsWith("http") ? src : location.origin + (src.startsWith("/") ? src : "/" + src);
  }), f.src);
  const tag = `${f.grade} ${f.unit}/${f.lesson}`;
  if (load.ok) { console.log(`PASS ${tag}: ${f.src} → ${load.w}px`); pass++; }
  else { console.log(`FAIL ${tag}: ${f.src} naturalWidth=0`); fail++; }
}

console.log(`\n=== ${pass} PASS / ${fail} FAIL · pageerrors: ${errors.length} ===`);
if (errors.length) console.log(errors.slice(0, 5).join("\n"));
await browser.close();
process.exit(fail === 0 && found.length >= 12 && errors.length === 0 ? 0 : 1);
