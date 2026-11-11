// 배선 전 만화 미리보기: 장면 파일(scenes/v2/comic-<레슨>.mjs)만으로 폰 화면의 만화 컷을 앱과 같은 모양으로 찍는다.
// 실행: node qa/sketch/mock-comic.mjs v2/comic-u2l1 [출력 PNG] [열 수]
//   앱(src)도 공개 그림(public/sketch)도 건드리지 않는다. 앱의 만화 CSS(ui.css)를 그대로 읽어 쓰고,
//   말풍선 자리는 build.mjs 와 같은 계산(placeBubble)을 쓴다.
//   새로 들어가는 것: 그림 안 왼쪽 위(또는 오른쪽 위)의 "때와 곳" 상자(when). 배선할 때 comic.ts 와 ui.css 에 같은 것을 옮긴다.
// 장면 파일 형식(v2):
//   export const META = { title, lead?, narrator, cta }           만화 스텝 머리(앱의 comic({ ... }))
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

/* ---------- 말풍선 자리(build.mjs 와 같은 계산. 고치면 양쪽을 함께 고친다) ---------- */
const FRAME_W = 350;
export function textWidth(line) {
  let w = 0;
  for (const ch of line.replace(/<[^>]+>/g, "")) w += /[가-힣]/.test(ch) ? 11.6 : ch === " " ? 3.2 : /[0-9A-Za-z]/.test(ch) ? 7.2 : 4.8;
  return w;
}
export function placeBubble(sk, b, where, warn) {
  const a = sk.anchors[b.who];
  if (!a) throw new Error(`${where}: 기준점 '${b.who}' 가 없다`);
  const FH = FRAME_W * sk.h / sk.w;
  const ax = a.x / sk.w * FRAME_W + (b.dx ?? 0), ay = a.y / sk.h * FH + (b.dy ?? 0);
  const lines = b.text.split("<br>");
  const bw = Math.min(FRAME_W * 0.52, Math.max(84, Math.max(...lines.map(textWidth)) + 25.2));
  const bh = lines.length * 15.6 + 16.2;
  let cx = ax, by = ay - 9, tail = b.side;
  if (!tail && ax - bw / 2 < 5) tail = "left";
  else if (!tail && (ax + bw / 2 > FRAME_W - 5 || FRAME_W - ax < Math.max(84, bw) - 1)) tail = "right";
  if (tail === "left") { cx = ax + 16 + bw / 2; by = ay - 29; }
  if (tail === "right") { cx = ax - 16 - bw / 2; by = ay - 29; }
  const box = { l: cx - bw / 2, r: cx + bw / 2, t: by - bh, b: by };
  if (box.l < 2 || box.r > FRAME_W - 2 || box.t < 2) warn(`${where}: 말풍선 "${b.text}" 이 컷 밖으로 나간다 ${JSON.stringify(box)}`);
  if (bw > Math.max(84, FRAME_W - cx) + 1) warn(`${where}: 말풍선 "${b.text}" 이 오른쪽 폭(${Math.round(FRAME_W - cx)}px)보다 넓다. <br> 로 줄을 나누거나 side: "right"`);
  const out = { text: b.text, x: +(cx / FRAME_W * 100).toFixed(1), y: +(by / FH * 100).toFixed(1), box };
  if (tail) out.tail = tail;
  return out;
}
// 때와 곳 상자의 자리(350px 컷 기준). 앱에 옮길 CSS 도 이 수치를 쓴다: 위 10px, 옆 10px, 글자 12px, 안쪽 여백 4px 8px
export function whenBox(text, pos = "tl") {
  const w = textWidth(text) * (12 / 12.5) + 16 + 3.2, h = 12 * 1.25 + 8 + 3.2;
  const l = pos === "tr" ? FRAME_W - 10 - w : 10;
  return { l, r: l + w, t: 10, b: 10 + h };
}
const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

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
// 배선 때 ui.css 에 옮길 새 규칙(때와 곳 상자)과 미리보기 전용 틀
const EXTRA = `
.comic-when { position: absolute; top: 10px; left: 10px; z-index: 2; padding: 4px 8px; border-radius: 6px; border: 1.6px solid #39424E;
  background: #FFF4D2; color: #1E2A38; font-size: 12px; font-weight: 800; line-height: 1.25; white-space: nowrap; letter-spacing: -.01em;
  box-shadow: 0 2px 6px -2px rgba(42, 58, 94, .28); pointer-events: none; }
.comic-when.tr { left: auto; right: 10px; }
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
  if (/[—–]/.test(texts)) warnings.push("글: 대시(—, –)가 있다");
  if (/교과서/.test(texts)) warnings.push("글: '교과서'가 있다");
  if (/너의|네 몸|너희/.test(texts)) warnings.push("글: 학생을 '너'로 부르는 말이 있다(사람의, 우리 등으로)");
  if (/이해에|그해에|그 해에/.test(texts)) warnings.push("글: '이해에, 그해에'처럼 연도를 가리키기만 하는 말이 있다(연도를 글에 직접 쓴다)");
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
  if (!modPath) { console.log("쓰는 법: node qa/sketch/mock-comic.mjs v2/comic-u2l1 [출력 PNG] [열 수]"); process.exit(1); }
  const r = await mockComic(modPath, out, Number(cols ?? 4));
  console.log(r.out);
  for (const w of r.warnings) console.log("  ! " + w);
}
