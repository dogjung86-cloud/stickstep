// 그림 시트: 구운 그림을 폰 카드 모양(그림 + 캡션)으로 늘어놓은 PNG 한 장. 검수와 판정용.
//   node qa/scifig-g2/sheet.mjs <출력 png> [키 …]   (키가 없으면 public/scifig/g2 의 모든 그림)
//   --cols=3  한 줄의 칸 수   --bare  캡션 없이 그림만(정답표를 빼고 검산을 맡길 때)
// 캡션은 단원 글 파일의 sciFig("키", "alt", "cap") / sciFigMore(…)에서 읽는다(정본은 단원 글 파일).
import { chromium } from "playwright-core";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const pos = args.filter((a) => !a.startsWith("--"));
const OUT = pos[0];
if (!OUT) {
  console.log("쓰는 법: node qa/scifig-g2/sheet.mjs <출력 png> [키 …] [--cols=3] [--bare]");
  process.exit(1);
}
const only = pos.slice(1);
const COLS = Number(opt.cols ?? 3);
const BARE = "bare" in opt;

// 캡션 모으기
const caps = {};
const where = {};
const cdir = join(REPO, "src", "content", "g2");
for (const f of readdirSync(cdir)) {
  if (!f.endsWith(".ts")) continue;
  const src = readFileSync(join(cdir, f), "utf8");
  const re = /sciFig(More)?\(\s*"(g2u\d+l\d+f\d+)",\s*"((?:[^"\\]|\\.)*)"(?:,\s*"((?:[^"\\]|\\.)*)")?/g;
  for (const m of src.matchAll(re)) {
    caps[m[2]] = m[4] ?? "";
    where[m[2]] = m[1] ? "정리 카드 자세히" : "개념 스텝";
  }
}
// 그림 모으기
const figs = [];
const base = join(REPO, "public", "scifig", "g2");
for (const u of existsSync(base) ? readdirSync(base).sort() : []) {
  if (!statSync(join(base, u)).isDirectory()) continue;
  for (const f of readdirSync(join(base, u)).sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
    const key = f.replace(/\.webp$/, "");
    if (only.length && !only.includes(key)) continue;
    figs.push({ key, b64: readFileSync(join(base, u, f)).toString("base64") });
  }
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cards = figs
  .map(
    (g) => `<div class="card"><div class="k">${g.key}${where[g.key] ? ` · ${where[g.key]}` : ""}</div><div class="f"><img src="data:image/webp;base64,${g.b64}"></div>${
      BARE || !caps[g.key] ? "" : `<div class="c">${esc(caps[g.key])}</div>`
    }</div>`,
  )
  .join("");
const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css"><style>
body{margin:0;padding:18px;background:#E9ECEF;font-family:"Pretendard Variable",Pretendard,sans-serif;letter-spacing:-.012em}
.grid{display:grid;grid-template-columns:repeat(${COLS},350px);gap:18px;align-items:start}
.k{font-size:13px;font-weight:800;color:#4E5968;padding:0 2px 6px}
.f{background:#fff;border:1px solid #E5E8EB;border-radius:20px 20px ${BARE ? "20px 20px" : "0 0"};padding:16px}
.f img{display:block;width:100%;border-radius:12px}
.c{background:#fff;border:1px solid #E5E8EB;border-top:none;border-radius:0 0 20px 20px;padding:10px 14px;font-size:12.5px;line-height:1.45;color:#8B95A1;text-align:center;word-break:keep-all}
</style><div class="grid">${cards}</div>`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 18 * 2 + COLS * 350 + (COLS - 1) * 18, height: 800 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log(`시트: 그림 ${figs.length}장 → ${OUT}`);
