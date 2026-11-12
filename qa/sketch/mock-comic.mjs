// 만화 미리보기: 장면 파일(scenes/comic-<레슨>.mjs)만으로 폰 화면의 만화 컷을 앱과 같은 모양으로 찍는다(앱을 띄우지 않는다).
// 실행: node qa/sketch/mock-comic.mjs comic-u2l1 [출력 PNG] [열 수]
//   앱(src)도 공개 그림(public/sketch)도 건드리지 않는다. 앱의 만화 CSS(ui.css)를 그대로 읽어 쓰고,
//   말풍선과 때와 곳 상자의 자리는 build.mjs 와 같은 계산(lib/bubble.mjs)을 쓴다.
//   앱 화면에서 끝까지 넘겨 보는 검사는 check-comics.mjs 다.
// 장면 파일 형식:
//   export const META = { title, lead?, narrator, cta }           만화 스텝 머리(앱의 comic(comicStory("<레슨>")))
//   export function panels() { return [{ sk, bubbles?, when?, whenPos?, stage, title, caption, term? }] }
//     when: "1665년, 영국 런던" 처럼 그 컷의 때와 곳(그림 속에 글자를 그리지 않으므로 앱이 상자로 얹는다)
//     whenPos: "tl"(기본, 왼쪽 위) | "tr"(오른쪽 위). 상자 자리에는 중요한 그림을 두지 않는다
//     stage: 이야기 단계 배지(궁금증, 발견 등). 연도는 넣지 않는다(연도는 when 으로)
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

import { FRAME_W, placeBubble, whenBox, hit, textRules } from "./lib/bubble.mjs";

/* ---------- 앱 CSS 에서 만화 규칙만 뽑기 ---------- */
function pickCss() {
  const ui = readFileSync(join(ROOT, "src", "styles", "ui.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const keep = [];
  let depth = 0, buf = "";
  for (const ch of ui) {
    buf += ch;
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) { if (/^\s*[^@][^{]*(\.comic-|\.cut-bubble|\.cut-tail|\.term)/.test(buf)) keep.push(buf.trim()); buf = ""; } }
  }
  const tokens = readFileSync(join(ROOT, "src", "styles", "tokens.css"), "utf8");
  return tokens + "\n" + keep.join("\n");
}
const BULB = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z"/></svg>`;
const TAIL = `<svg class="cut-tail" viewBox="0 0 70 34" aria-hidden="true"><path d="M1 0 L62 27 L30 0 Z" fill="#FFFFFF"/><path d="M1 0 L62 27 L30 0" fill="none" stroke="#39424E" stroke-width="1.6" stroke-linejoin="miter" stroke-miterlimit="8"/></svg>`;
// 미리보기 전용 틀(때와 곳 상자 .comic-when 은 ui.css 에서 함께 뽑아 온다)
const EXTRA = `
body { margin: 0; background: #E9ECEF; font-family: "Pretendard Variable", Pretendard, "Malgun Gothic", sans-serif; letter-spacing: -.012em; }
.grid { display: grid; gap: 22px; padding: 22px; align-items: start; }
.phone { width: 390px; background: #fff; border-radius: 26px; box-shadow: 0 2px 14px rgba(0,0,0,.10); padding: 10px 22px 26px; box-sizing: border-box; }
.phone.head h1 { font-size: 24px; font-weight: 800; line-height: 1.3; margin: 18px 0 10px; color: var(--ink); }
.phone.head h1 em { font-style: normal; color: var(--blue); }
.phone.head .lead { color: var(--sub); font-size: 15px; line-height: 1.6; }
.phone.head .narr { margin-top: 14px; background: var(--n0, #fff); border: 1px solid var(--n200, #E5E8EB); border-radius: 16px; padding: 12px 14px; font-size: 14.5px; line-height: 1.6; color: var(--sub); }
.phone.head .cta { margin-top: 18px; color: var(--n500, #8B95A1); font-size: 13px; }
.comic-art svg { display: block; width: 100%; height: 100%; }
.warn { font: 12px/1.4 monospace; color: #C92A2A; margin-top: 8px; white-space: pre-wrap; }
`;
const STAGE_TINT = ["#3182F6", "#FF9500", "#8A6BFF", "#12B886", "#0CA6C0", "#04B45F", "#F04452", "#E8850C"];

export async function mockComic(modPath, out, cols = 4) {
  const mod = await import(pathToFileURL(resolve(HERE, "scenes", modPath.endsWith(".mjs") ? modPath : modPath + ".mjs")).href + "?" + Date.now());
  const list = mod.panels();
  const warnings = [];
  const cells = [];
  const meta = mod.META;
  if (meta) cells.push(`<div class="phone head"><h1>${meta.title ?? ""}</h1>${meta.lead ? `<div class="lead">${meta.lead}</div>` : ""}<div class="narr">${meta.narrator ?? ""}</div><div class="cta">마지막 컷 버튼: ${meta.cta ?? ""}</div></div>`);
  const stageColor = new Map();
  list.forEach((p, i) => {
    const where = `컷 ${i + 1}`;
    const warn = m => warnings.push(m);
    const bs = (p.bubbles ?? []).map(b => placeBubble(p.sk, b, where, warn));
    let whenHtml = "";
    if (p.when) {
      const wb = whenBox(p.when, p.whenPos);
      for (const b of bs) if (hit(wb, b.box)) warn(`${where}: 때와 곳 상자가 말풍선 "${b.text}" 과 겹친다`);
      if (wb.r > FRAME_W - 4) warn(`${where}: 때와 곳 상자 "${p.when}" 이 너무 길다`);
      whenHtml = `<span class="comic-when${p.whenPos === "tr" ? " tr" : ""}">${p.when}</span>`;
    }
    for (let a = 0; a < bs.length; a++) for (let b = a + 1; b < bs.length; b++) if (hit(bs[a].box, bs[b].box)) warn(`${where}: 말풍선 둘이 겹친다`);
    if (/\d/.test(p.stage ?? "")) warn(`${where}: 단계 배지 "${p.stage}" 에 숫자가 있다(연도는 when 으로)`);
    if (!stageColor.has(p.stage)) stageColor.set(p.stage, STAGE_TINT[stageColor.size % STAGE_TINT.length]);
    const bubbleHtml = bs.map(b => `<span class="cut-bubble wrap${b.tail ? ` tail-${b.tail === "right" ? "r" : "l"}` : ""}" style="left:${b.x}%;top:${b.y}%">${b.tail ? b.text + TAIL : b.text}</span>`).join("");
    // 용어 카드: 앱(blocks.ts 의 term)과 같은 구조. 규칙은 ui.css 에서 뽑아 온 .term-card 그대로
    const term = p.term ? `<div class="term-card"><div class="term-ic">${BULB}</div><div><div class="term-name">${p.term.name}</div><div class="term-def">${p.term.def}</div></div></div>` : "";
    const myWarn = warnings.filter(w => w.startsWith(where + ":"));
    cells.push(`<div class="phone"><div class="comic-panel in"><div class="comic-head"><span class="comic-badge" style="--bc:${stageColor.get(p.stage)}">${p.stage ?? ""}</span><span class="comic-nav"><span class="comic-count">${i + 1} / ${list.length}</span></span></div>
      <div class="comic-title">${p.title ?? ""}</div>
      <div class="comic-art" style="aspect-ratio:${p.sk.w} / ${p.sk.h}">${p.sk.svg({ inline: true })}${whenHtml}${bubbleHtml}</div>
      <div class="comic-caption">${p.caption ?? ""}</div>${term}${myWarn.length ? `<div class="warn">${myWarn.join("\n")}</div>` : ""}</div></div>`);
  });
  // 화면 글 규칙 검사: 대시, '교과서', '너의'
  const texts = [meta?.title, meta?.lead, meta?.narrator, meta?.cta, ...list.flatMap(p => [p.when, p.stage, p.title, p.caption, p.term?.name, p.term?.def, ...(p.bubbles ?? []).map(b => b.text)])].filter(Boolean).join("\n");
  for (const m of textRules(texts)) warnings.push("글: " + m);
  const n = cells.length, c = Math.min(cols, n);
  const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pretendard/1.3.9/variable/pretendardvariable-dynamic-subset.min.css"><style>${pickCss()}${EXTRA}.grid{grid-template-columns:repeat(${c},390px)}</style><div class="grid">${cells.join("")}</div>`;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const ctx = await browser.newContext({ viewport: { width: c * 412 + 22, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const outPath = out ?? join(ROOT, "qa", "shots", `mock-${modPath.replace(/[\\/]/g, "-")}.png`);
  mkdirSync(dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  return { out: outPath, warnings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const [modPath, out, cols] = process.argv.slice(2);
  if (!modPath) { console.log("쓰는 법: node qa/sketch/mock-comic.mjs comic-u2l1 [출력 PNG] [열 수]"); process.exit(1); }
  const r = await mockComic(modPath, out, Number(cols ?? 4));
  console.log(r.out);
  for (const w of r.warnings) console.log("  ! " + w);
}
