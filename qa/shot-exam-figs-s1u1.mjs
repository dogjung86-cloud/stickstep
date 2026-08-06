// s1u1 그림 문항 눈검수 시트 — esbuild 실로드 자동 수집(dev 서버 불요) · 12칸/시트.
// 실행: node qa/shot-exam-figs-s1u1.mjs → qa/shots/exam-s1u1-figs-N.png (+깨진 이미지 검사).
// climateMapFig의 /soc/climate.webp는 tmp 복사 + 상대 경로 치환으로 file://에서도 로드한다.
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";

const result = await build({ entryPoints: ["src/content/exams/s1u1.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const figs = mod.S1U1_EXAM.pool.filter((i) => i.figure);
console.log(`그림 문항 ${figs.length}개 수집`);

fs.mkdirSync("tmp/s1u1-figs/soc", { recursive: true });
fs.mkdirSync("qa/shots", { recursive: true });
if (fs.existsSync("public/soc/climate.webp")) fs.copyFileSync("public/soc/climate.webp", "tmp/s1u1-figs/soc/climate.webp");

const CHUNK = 12;
const pages = [];
for (let i = 0; i < figs.length; i += CHUNK) pages.push(figs.slice(i, i + CHUNK));

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
let broken = [];
for (let p = 0; p < pages.length; p++) {
  const cells = pages[p]
    .map((it) => `<div class="cell"><h4>${it.id} · ${it.lessonId} · ${it.type}${it.diff ? " · d" + it.diff : ""}</h4>${it.figure.replaceAll('href="/soc/', 'href="./soc/')}</div>`)
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font-family:"Pretendard","Malgun Gothic",sans-serif;background:#F6F7F9;margin:0;padding:14px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .cell{background:#fff;border:1px solid #E2E6EA;border-radius:12px;padding:10px}
    .cell h4{margin:0 0 8px;font-size:11.5px;color:#556}
    .cell svg{width:100%;height:auto;display:block}
  </style><div class="grid">${cells}</div>`;
  fs.writeFileSync(`tmp/s1u1-figs/page-${p + 1}.html`, html);
  await page.goto(`file:///${process.cwd().replace(/\\/g, "/")}/tmp/s1u1-figs/page-${p + 1}.html`);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `qa/shots/exam-s1u1-figs-${p + 1}.png`, fullPage: true });
  const bad = await page.evaluate(() => [...document.images].filter((im) => !im.complete || im.naturalWidth <= 0).map((im) => im.src));
  broken.push(...bad);
  console.log(`saved qa/shots/exam-s1u1-figs-${p + 1}.png (${pages[p].length}칸)`);
}
await browser.close();
if (broken.length) { console.log("BROKEN IMAGES:", broken); process.exit(1); }
console.log("전 시트 이미지 로드 정상");
