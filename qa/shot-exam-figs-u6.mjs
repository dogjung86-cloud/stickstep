// u6 v2 그림 눈검수 — 이식된 풀(u6l1~l5)에서 figure 문항을 자동 수집해 격자 시트로 캡처.
// esbuild 실로드라 dev 서버 불요(u3 v2판 계승 · 구판 v1 수동 나열 폐기). 사진은 public/exam/u6에서 복사.
// node qa/shot-exam-figs-u6.mjs → qa/shots/u6v2-figs/sheet-N.png
import { build } from "esbuild";
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, readdirSync, copyFileSync, existsSync } from "node:fs";

async function loadPool(path, name) {
  const r = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const items = [];
for (let n = 1; n <= 5; n++) {
  items.push(...(await loadPool(`src/content/exams/u6l${n}.ts`, `POOL_U6L${n}`)));
}
const figs = items.filter((i) => i.figure);
console.log(`figure 문항 ${figs.length}개 수집`);

mkdirSync("qa/shots/u6v2-figs", { recursive: true });
mkdirSync("tmp/u6v2-figs/exam/u6", { recursive: true });
if (existsSync("public/exam/u6")) {
  for (const f of readdirSync("public/exam/u6")) copyFileSync(`public/exam/u6/${f}`, `tmp/u6v2-figs/exam/u6/${f}`);
}

const PER = 12;
const sheets = [];
for (let i = 0; i < figs.length; i += PER) sheets.push(figs.slice(i, i + PER));

const css = `body{margin:0;background:#E8EAEE;font-family:"Pretendard","Malgun Gothic",sans-serif}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:14px}
.cell{background:#fff;border:1px solid #D5DAE2;border-radius:8px;padding:10px}
.tag{font-size:11px;font-weight:800;color:#1B64DA;margin-bottom:6px}
.q{font-size:11.5px;color:#4E5968;line-height:1.45;margin-bottom:8px;word-break:keep-all}
.fig{max-width:344px;margin:0 auto}
.fig.dark{background:#0B1524;border-radius:12px;padding:8px 6px}
.fig svg,.fig img{width:100%;height:auto;display:block}`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 1500 } });
for (let s = 0; s < sheets.length; s++) {
  const cells = sheets[s].map((it) => {
    const slot = it.id.replace("u6e", "");
    const q = String(it.prompt).replace(/<[^>]*>/g, "").slice(0, 70);
    // file:// 렌더라 절대 경로 src를 상대 경로로(발주 사진은 tmp로 복사해 둔다)
    const figHtml = String(it.figure).replace(/src="\/exam\/u6\//g, 'src="exam/u6/');
    return `<div class="cell"><div class="tag">슬롯 ${slot} · ${it.lessonId} · ${it.type}</div><div class="q">${q}</div><div class="fig${it.figureDark ? " dark" : ""}">${figHtml}</div></div>`;
  }).join("");
  writeFileSync("tmp/u6v2-figs/index.html", `<!doctype html><meta charset="utf-8"><style>${css}</style><div class="grid">${cells}</div>`);
  await page.goto(`file://${process.cwd().replace(/\\/g, "/")}/tmp/u6v2-figs/index.html`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/u6v2-figs/sheet-${s + 1}.png`, fullPage: true });
  console.log(`SHOT sheet-${s + 1}.png (${sheets[s].length}개)`);
}
await browser.close();
console.log(`DONE ${sheets.length}장`);
