// g2u5 v2 설계표 §3 슬롯 표 ↔ §4 쿼터 기계 검산(저작 착수 전 게이트).
// 손으로 센 검산 줄이 아니라 표 자체를 파싱해 대조한다(u1 v2 §12에서 §3↔§4 불일치가 확대 단계에서
// 드러난 전례의 예방책). node qa/check-g2u5-blueprint.mjs
import { readFileSync } from "node:fs";

const SPEC = {
  g2u5l1: { start: 201, end: 227, m: 24, M: 3, d: [11, 11, 5], fig: 19, bogi: 4 },
  g2u5l2: { start: 228, end: 254, m: 24, M: 3, d: [11, 11, 5], fig: 21, bogi: 4 },
  g2u5l3: { start: 255, end: 281, m: 24, M: 3, d: [11, 11, 5], fig: 21, bogi: 4 },
  g2u5l4: { start: 282, end: 307, m: 24, M: 2, d: [10, 10, 6], fig: 15, bogi: 4 },
  g2u5l5: { start: 308, end: 334, m: 24, M: 3, d: [11, 11, 5], fig: 20, bogi: 4 },
  g2u5l6: { start: 335, end: 360, m: 24, M: 2, d: [10, 10, 6], fig: 16, bogi: 4 },
};
const TOTAL = { n: 160, m: 144, M: 16, fig: 112, blank: 48, bogi: 24, d: [64, 64, 32] };

const src = readFileSync("qa/g2u5-v2-blueprint.md", "utf8").replace(/\r\n/g, "\n");
const rows = [];
for (const line of src.split("\n")) {
  // | 201 🅟 | mcq | 1 | LF | ④ | ... |
  const m = line.match(/^\|\s*(\d{3})\s*(🅟)?\s*\|\s*(mcq|multi|num|word)\s*\|\s*([123])\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
  if (m) rows.push({ slot: Number(m[1]), pilot: !!m[2], type: m[3], diff: Number(m[4]), data: m[5].trim(), arch: m[6].trim() });
}

let fails = 0;
const fail = (s) => { fails += 1; console.error("FAIL", s); };

if (rows.length !== 160) fail(`슬롯 행 ${rows.length} != 160`);
const seen = new Set();
for (const r of rows) {
  if (seen.has(r.slot)) fail(`슬롯 ${r.slot} 중복`);
  seen.add(r.slot);
}

let pilots = 0;
const G = { fig: 0, blank: 0, bogi: 0, d: [0, 0, 0], m: 0, M: 0, disc: 0, ctrl: 0 };
const CTRL_SLOTS = new Set([230, 233, 234, 235, 238, 243, 246, 249, 250, 252, 261, 267, 271, 274, 279]);
for (const [lid, S] of Object.entries(SPEC)) {
  const arr = rows.filter((r) => r.slot >= S.start && r.slot <= S.end).sort((a, b) => a.slot - b.slot);
  const want = S.end - S.start + 1;
  if (arr.length !== want) { fail(`${lid} ${arr.length}행 != ${want}`); continue; }
  for (let s = S.start; s <= S.end; s++) if (!arr.some((r) => r.slot === s)) fail(`${lid} 슬롯 ${s} 누락`);
  const m = arr.filter((r) => r.type === "mcq").length;
  const M = arr.filter((r) => r.type === "multi").length;
  const nw = arr.filter((r) => r.type === "num" || r.type === "word").length;
  const d = [1, 2, 3].map((k) => arr.filter((r) => r.diff === k).length);
  const blank = arr.filter((r) => /^무[①②③④⑤]/.test(r.data)).length;
  const fig = arr.length - blank;
  const bogi = arr.filter((r) => /bogi/.test(r.data)).length;
  const disc = arr.filter((r) => /^무[①⑤]/.test(r.data)).length;
  const pil = arr.filter((r) => r.pilot).length;
  pilots += pil;
  if (nw) fail(`${lid} num/word ${nw}건(v2 전량 0)`);
  if (m !== S.m || M !== S.M) fail(`${lid} 유형 ${m}/${M} != ${S.m}/${S.M}`);
  if (d.join() !== S.d.join()) fail(`${lid} diff ${d.join("/")} != ${S.d.join("/")}`);
  if (fig !== S.fig) fail(`${lid} 시각 ${fig} != ${S.fig}`);
  if (bogi !== S.bogi) fail(`${lid} bogi ${bogi} != ${S.bogi}`);
  G.m += m; G.M += M; G.fig += fig; G.blank += blank; G.bogi += bogi; G.disc += disc;
  d.forEach((v, i) => { G.d[i] += v; });
  G.ctrl += arr.filter((r) => CTRL_SLOTS.has(r.slot)).length;
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · 무자료 ${blank} · bogi ${bogi} · 파일럿 ${pil}`);
}

if (G.m !== TOTAL.m) fail(`전체 mcq ${G.m} != ${TOTAL.m}`);
if (G.M !== TOTAL.M) fail(`전체 multi ${G.M} != ${TOTAL.M}`);
if (G.fig !== TOTAL.fig) fail(`전체 시각 ${G.fig} != ${TOTAL.fig}`);
if (G.blank !== TOTAL.blank) fail(`전체 무자료 ${G.blank} != ${TOTAL.blank}`);
if (G.bogi !== TOTAL.bogi) fail(`전체 bogi ${G.bogi} != ${TOTAL.bogi}`);
if (G.d.join() !== TOTAL.d.join()) fail(`전체 diff ${G.d.join("/")} != ${TOTAL.d.join("/")}`);
if (G.bogi + G.M < 36) fail(`합답 총량 ${G.bogi + G.M} < 36`);
if (G.bogi < 22) fail(`bogi ${G.bogi} < 22`);
if (G.disc > 40) fail(`판별형(무①+무⑤) ${G.disc} > 40`);
if (G.ctrl < 12) fail(`대조 실험 계열 ${G.ctrl} < 12`);
if (pilots !== 40) fail(`파일럿 ${pilots} != 40`);

// 아키타입 전종 커버(①~⑰·⑳) + 파일럿 커버리지
const TAGS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑳"];
const all = new Set(rows.map((r) => r.arch));
const pilotTags = new Set(rows.filter((r) => r.pilot).map((r) => r.arch));
for (const t of TAGS) {
  if (!all.has(t)) fail(`아키타입 ${t} 미사용`);
  if (!pilotTags.has(t)) console.warn(`WARN 파일럿에 아키타입 ${t} 없음`);
}

console.log(`\n전체: 160 · mcq ${G.m}/multi ${G.M} · diff ${G.d.join("/")} · 시각 ${G.fig}(${(G.fig / 1.6).toFixed(1)}%) · 무자료 ${G.blank} · bogi ${G.bogi} · 합답 ${G.bogi + G.M} · 판별 ${G.disc} · 대조 ${G.ctrl} · 파일럿 ${pilots}`);
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("설계표 ALL PASS");
