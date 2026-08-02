// g2u5 v2 시험 그림 눈검수 · 이식된 풀(src/content/exams/g2u5.ts)에서 figure 문항 112개를 자동
// 수집해 12개씩 격자 페이지로 나눠 캡처한다(손으로 파라미터를 옮겨 적지 않는 자동화판 · g2u8 v2 계승).
// dev 서버 불필요(esbuild 실로드) · 사진(exam/g2u5 · plant/figs · plant/labs)과 도해 베이스
// (exam/g2u5fig)는 tmp로 복사해 상대 경로로 로드한다.
// node qa/shot-exam-figs-g2u5.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const result = await build({ entryPoints: ["src/content/exams/g2u5.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const figs = mod.G2U5_EXAM.pool.filter((i) => i.figure);
console.log(`figure 문항 ${figs.length}개 수집`);

const COPY = [
  ["public/exam/g2u5", "tmp/g2u5v2-figs/exam/g2u5"],
  ["public/exam/g2u5fig", "tmp/g2u5v2-figs/exam/g2u5fig"],
  ["public/plant/figs", "tmp/g2u5v2-figs/plant/figs"],
  ["public/plant/labs", "tmp/g2u5v2-figs/plant/labs"],
];
fs.mkdirSync("qa/shots", { recursive: true });
for (const [from, to] of COPY) {
  fs.mkdirSync(to, { recursive: true });
  if (!fs.existsSync(from)) continue;
  for (const f of fs.readdirSync(from)) if (f.endsWith(".webp")) fs.copyFileSync(`${from}/${f}`, `${to}/${f}`);
}

/** 절대 경로(/exam/... · /plant/...)를 tmp 기준 상대 경로로 바꾼다(src·href 양쪽). */
const rel = (s) => String(s)
  .replaceAll('src="/exam/', 'src="./exam/')
  .replaceAll('src="/plant/', 'src="./plant/')
  .replaceAll('href="/exam/', 'href="./exam/')
  .replaceAll('href="/plant/', 'href="./plant/');

const CHUNK = 12;
const pages = [];
for (let i = 0; i < figs.length; i += CHUNK) pages.push(figs.slice(i, i + CHUNK));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
for (let p = 0; p < pages.length; p += 1) {
  const cells = pages[p]
    .map(
      (it) => `<div style="border:1px solid #ddd;border-radius:10px;padding:8px;background:#fff">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${it.id} · ${it.lessonId} · ${it.type}${it.diff ? " · d" + it.diff : ""}</div>
      <div style="max-width:352px">${rel(it.figure)}</div></div>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="background:#F2F4F6;margin:0;padding:12px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${cells}</div></body>`;
  const file = path.resolve(`tmp/g2u5v2-figs/page-${p + 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/exam-g2u5v2-figs-${p + 1}.png`, fullPage: true });
  console.log(`SAVED qa/shots/exam-g2u5v2-figs-${p + 1}.png (${pages[p].length}그림)`);
}
await browser.close();
