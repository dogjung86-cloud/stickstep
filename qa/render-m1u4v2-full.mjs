// m1u4 v2 전체 200문항 검증 + 시험지 렌더(파일럿 40 + 확장 160 병합, 슬롯 순 — m2u5판 계승).
// node qa/render-m1u4v2-full.mjs  →  tmp/m1u4v2-full/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

const FILES = [
  ["qa/m1u4v2-pilot.ts", "POOL_M1U4V2_PILOT"],
  ["qa/m1u4v2-rest-a.ts", "POOL_M1U4V2_REST_A"],
  ["qa/m1u4v2-rest-b.ts", "POOL_M1U4V2_REST_B"],
  ["qa/m1u4v2-rest-c.ts", "POOL_M1U4V2_REST_C"],
  ["qa/m1u4v2-rest-d.ts", "POOL_M1U4V2_REST_D"],
  ["qa/m1u4v2-rest-e.ts", "POOL_M1U4V2_REST_E"],
];

async function loadPool(entry, key) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  if (!mod[key]) throw new Error(`${entry}: ${key} 없음`);
  return mod[key];
}

let pool = [];
for (const [f, k] of FILES) pool = pool.concat(await loadPool(f, k));
pool.sort((a, b) => a.id.localeCompare(b.id));

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 전수 검증 ──
if (pool.length !== 200) fail(`문항 수 ${pool.length} ≠ 200`);
for (let i = 1; i <= 200; i += 1) {
  const id = `m1u4e${String(i).padStart(3, "0")}`;
  if (!pool[i - 1] || pool[i - 1].id !== id) fail(`슬롯 ${i}: id ${pool[i - 1]?.id} ≠ ${id}`);
}

// 레슨별 쿼터(blueprint §0·§4): [mcq, multi, num, diff, 그림 정확값]
const LQ = {
  m1u4l1: [7, 2, 6, [6, 7, 2], 10], m1u4l2: [7, 2, 6, [7, 5, 3], 14], m1u4l3: [6, 2, 7, [6, 7, 2], 13],
  m1u4l4: [7, 2, 6, [6, 6, 3], 13], m1u4l5: [7, 2, 6, [6, 6, 3], 14], m1u4l6: [7, 2, 6, [6, 6, 3], 9],
  m1u4l7: [7, 2, 6, [6, 5, 4], 13], m1u4l8: [7, 2, 6, [6, 6, 3], 14], m1u4l9: [7, 2, 7, [6, 6, 4], 16],
  m1u4l10: [10, 2, 4, [6, 7, 3], 8], m1u4l11: [8, 2, 6, [6, 6, 4], 8], m1u4l12: [8, 2, 6, [7, 6, 3], 13],
  m1u4l13: [8, 2, 6, [6, 7, 3], 16],
};
const BAN = ["기울기", "닮음", "피타고라스", "삼각비", "원주각", "벡터", "좌표기하", "무리수", "내각", "외각", "동측내각"];
const byLesson = {};
for (const it of pool) (byLesson[it.lessonId] ??= []).push(it);
let figuredTotal = 0;
for (const [lid, spec] of Object.entries(LQ)) {
  const g = byLesson[lid] ?? [];
  const m = g.filter((x) => x.type === "mcq").length;
  const M = g.filter((x) => x.type === "multi").length;
  const n = g.filter((x) => x.type === "num").length;
  const w = g.filter((x) => x.type === "word").length;
  const d = [1, 2, 3].map((k) => g.filter((x) => x.diff === k).length);
  if (w) fail(`${lid} word ${w}문항(v2는 word 0)`);
  if (m !== spec[0] || M !== spec[1] || n !== spec[2]) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${spec.slice(0, 3).join("/")}`);
  if (d.join() !== spec[3].join()) fail(`${lid} diff ${d.join("/")} ≠ ${spec[3].join("/")}`);
  const figs = g.filter((x) => x.figure).length;
  if (figs !== spec[4]) fail(`${lid} 그림 ${figs} ≠ ${spec[4]}`);
  figuredTotal += figs;
  const nums = g.filter((x) => x.type === "num").map((x) => String(x.answer));
  const dup = nums.filter((v, i2) => nums.indexOf(v) !== i2);
  if (dup.length) fail(`${lid} num 정답 중복: ${dup.join(",")}`);
  for (const it of g) {
    if (it.type !== "num" && (!it.options || it.options.length !== 5)) fail(`${it.id} 보기 ${it.options?.length}개`);
    if (it.type === "mcq" && (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4)) fail(`${it.id} answer 범위`);
    if (it.type === "multi" && (!Array.isArray(it.answer) || it.answer.length < 2)) fail(`${it.id} multi answer`);
    if (it.type === "num" && !/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
    if (it.type === "num" && !it.unitLabel && !/값을 구하세요/.test(plain(it.prompt))) fail(`${it.id} num unitLabel 없음(면제 문구도 없음)`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false 첫 보기 정답`);
    const exp = plain(it.explain);
    if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
    if (exp.length > 470) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
    const all = plain(it.prompt) + (it.options ?? []).map(plain).join("") + exp + plain(it.core);
    if (all.includes("—")) fail(`${it.id} em대시`);
    for (const wd of BAN) if (all.includes(wd)) fail(`${it.id} 금지어 "${wd}"`);
    if (!it.core) fail(`${it.id} core 없음`);
    if (it.figure && !String(it.figure).startsWith("<svg")) fail(`${it.id} figure 형식`);
  }
}
console.log(`그림: ${figuredTotal}/200 (${Math.round(figuredTotal / 2)}%) — 기계 하한 152`);
if (figuredTotal < 152) fail(`그림 쿼터 ${figuredTotal} < 152`);
const byType = { mcq: 0, multi: 0, num: 0, word: 0 };
const byDiff = { 1: 0, 2: 0, 3: 0 };
for (const it of pool) { byType[it.type] += 1; byDiff[it.diff] += 1; }
console.log(`유형 합계: mcq ${byType.mcq} / multi ${byType.multi} / num ${byType.num} / word ${byType.word} · diff ${byDiff[1]}/${byDiff[2]}/${byDiff[3]}`);
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("전수 검증 ALL PASS\n");

// ── 시험지 렌더 ──
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => it.type === "num" ? `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}` : it.type === "mcq" ? CIRC[it.answer] : it.answer.map((i) => CIRC[i]).join(", ");
const cards = pool.map((it, i) => {
  const tag = `${it.lessonId.replace("m1u4", "")} · ${it.type} · 난이도 ${"●".repeat(it.diff)}${"○".repeat(3 - it.diff)}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q" id="q${i + 1}">${body}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m1u4 v2 200문항 — 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2; border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #191F28; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.5; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 16px; font-weight: 800; color: #1B64DA; }
  .q-tag { font-size: 10.5px; color: #97A1AE; }
  .q-prompt { font-size: 13.8px; line-height: 1.62; word-break: keep-all; }
  .q-fig { margin: 10px auto 4px; max-width: 330px; }
  .q-fig svg { width: 100%; height: auto; display: block; }
  .q-opts { list-style: none; margin-top: 9px; display: flex; flex-direction: column; gap: 5px; }
  .q-opts li { display: flex; gap: 7px; font-size: 13.2px; line-height: 1.5; align-items: baseline; }
  .q-circ { color: #454F5D; font-weight: 600; flex: none; }
  .q-blank { margin-top: 11px; font-size: 13.2px; color: #454F5D; }
  .q-line { display: inline-block; width: 88px; border-bottom: 1.6px solid #8B95A3; height: 15px; vertical-align: -2px; margin: 0 4px; }
  .q-unit { color: #66707E; }
  .q-ans { margin-top: 10px; font-size: 12px; }
  .q-ans summary { cursor: pointer; color: #04B45F; font-weight: 700; font-size: 11.5px; }
  .q-exp { margin-top: 7px; background: #F5F7FA; border-radius: 8px; padding: 10px 12px; line-height: 1.66; color: #333D4B; }
  .q-exp .xh { display: block; font-weight: 800; color: #1B64DA; font-size: 11px; margin: 7px 0 3px; }
  .q-exp .xh:first-child { margin-top: 0; }
  .q-core { margin-top: 6px; font-size: 11.5px; color: #B4690E; font-weight: 700; }
  .mv { font-style: italic; font-weight: 700; font-family: Georgia, serif; }
  .gsym { font-weight: 800; white-space: nowrap; }
  .gsym.over { position: relative; display: inline-block; padding-top: .46em; line-height: 1.05; }
  .gsym-m { position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-size: .62em; line-height: 1; font-weight: 700; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 수학 Ⅳ. 기본 도형 — v2 전체 200문항</h1>
  <p>검수용 시험지 렌더(슬롯 번호순 · 파일럿 40 + 확장 160). 규격 v2 적용: 그림 80.5% · 값 구하기 중심 · word 0 ·
  그림 라벨 단위 병기 · 실각 렌더. 실제 앱에서는 응시마다 레슨 균형으로 20문항이 추출돼요.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u4v2-full", { recursive: true });
writeFileSync("tmp/m1u4v2-full/index.html", html);
console.log(`렌더 완료: tmp/m1u4v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length})`);
