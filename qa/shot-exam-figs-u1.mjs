// u1 v2 시험 시각자료 눈검수 — 이식된 풀(src/content/exams/u1.ts)에서 figure 문항 112개를 자동
// 수집해 12개씩 격자 페이지로 나눠 캡처한다(손으로 파라미터를 옮겨 적지 않는 자동화판 · m1u6 관행).
// dev 서버 불필요(esbuild 실로드). node qa/shot-exam-figs-u1.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const result = await build({ entryPoints: ["src/content/exams/u1.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const figs = mod.U1_EXAM.pool.filter((i) => i.figure);
console.log(`figure 문항 ${figs.length}개 수집`);

fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp/u1v2-figs/exam", { recursive: true });
// 사진 참조 서빙(file:// 상대 경로) — public/exam/u1 복사
fs.mkdirSync("tmp/u1v2-figs/exam/u1", { recursive: true });
for (const f of fs.readdirSync("public/exam/u1")) fs.copyFileSync(`public/exam/u1/${f}`, `tmp/u1v2-figs/exam/u1/${f}`);

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
      <div style="max-width:352px">${String(it.figure).replaceAll('src="/exam/u1/', 'src="./exam/u1/')}</div></div>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="background:#F2F4F6;margin:0;padding:12px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${cells}</div></body>`;
  const file = path.resolve(`tmp/u1v2-figs/page-${p + 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/exam-u1v2-figs-${p + 1}.png`, fullPage: true });
  console.log(`SAVED qa/shots/exam-u1v2-figs-${p + 1}.png (${pages[p].length}그림)`);
}
await browser.close();
