// g2u6 v2 시험 시각자료 눈검수 — 이식된 풀(src/content/exams/g2u6.ts)에서 figure 문항 116개를
// 자동 수집해 12개씩 격자 페이지로 나눠 캡처한다(손으로 파라미터를 옮겨 적지 않는 자동화판).
// 발주 라스터 하이브리드가 섞여 있어 exam/g2u6 · body/figs · body/figs/v2 를 tmp로 복사해 서빙한다.
// dev 서버 불필요(esbuild 실로드). node qa/shot-exam-figs-g2u6.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const result = await build({ entryPoints: ["src/content/exams/g2u6.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const figs = mod.G2U6_EXAM.pool.filter((i) => i.figure);
console.log(`figure 문항 ${figs.length}개 수집`);

fs.mkdirSync("qa/shots", { recursive: true });
const ROOT = "tmp/g2u6v2-figs";
fs.mkdirSync(ROOT, { recursive: true });
for (const dir of ["exam/g2u6", "body/figs", "body/figs/v2"]) {
  if (!fs.existsSync(`public/${dir}`)) continue;
  fs.mkdirSync(`${ROOT}/${dir}`, { recursive: true });
  for (const f of fs.readdirSync(`public/${dir}`)) {
    if (f.endsWith(".webp")) fs.copyFileSync(`public/${dir}/${f}`, `${ROOT}/${dir}/${f}`);
  }
}

const CHUNK = 12;
const pages = [];
for (let i = 0; i < figs.length; i += CHUNK) pages.push(figs.slice(i, i + CHUNK));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
for (let p = 0; p < pages.length; p++) {
  const cells = pages[p]
    .map(
      (it) => `<div style="border:1px solid #ddd;border-radius:10px;padding:8px;background:#fff">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${it.id} · ${it.lessonId} · ${it.type}${it.diff ? " · d" + it.diff : ""}</div>
      <div style="max-width:352px;position:relative">${String(it.figure).replaceAll('src="/', 'src="./')}</div></div>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="background:#F2F4F6;margin:0;padding:12px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-items:start">${cells}</div></body>`;
  const file = path.resolve(`${ROOT}/page-${p + 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/exam-g2u6v2-figs-${p + 1}.png`, fullPage: true });
  console.log(`SAVED qa/shots/exam-g2u6v2-figs-${p + 1}.png (${pages[p].length}그림)`);
}
await browser.close();
