// m1u6 v2 200문항 전수 검증 + 시험지 갤러리 렌더(m1u5판 render-full의 부분 검증 모드 계승).
// node qa/render-m1u6v2-full.mjs            → 존재하는 파일만 부분 검증(저작 중간 게이트)
// 전 파일(pilot + rest-a~f) 존재 시         → 200 전수 검증 + tmp/m1u6v2-full/index.html 렌더
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/m1u6v2-pilot.ts", "POOL_M1U6V2_PILOT"],
  ["qa/m1u6v2-rest-a.ts", "POOL_M1U6V2_REST_A"],
  ["qa/m1u6v2-rest-b.ts", "POOL_M1U6V2_REST_B"],
  ["qa/m1u6v2-rest-c.ts", "POOL_M1U6V2_REST_C"],
  ["qa/m1u6v2-rest-d.ts", "POOL_M1U6V2_REST_D"],
  ["qa/m1u6v2-rest-e.ts", "POOL_M1U6V2_REST_E"],
  ["qa/m1u6v2-rest-f.ts", "POOL_M1U6V2_REST_F"],
];

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const present = SRC.filter(([p]) => existsSync(p));
const items = [];
for (const [p, name] of present) items.push(...(await loadPool(p, name)));
const allPresent = present.length === SRC.length;
console.log(`로드: ${present.map(([p]) => p.replace("qa/m1u6v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 §0·§4 + §8 조정: 62·162 diff3, 178 mcq) ──
const LESSON = {
  m1u6l1: { start: 1, end: 34, m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l2: { start: 35, end: 67, m: 16, M: 2, n: 15, d: [13, 13, 7], vis: 31 },
  m1u6l3: { start: 68, end: 101, m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l4: { start: 102, end: 136, m: 18, M: 2, n: 15, d: [14, 14, 7], vis: 33 },
  m1u6l5: { start: 137, end: 172, m: 17, M: 2, n: 17, d: [15, 14, 7], vis: 33 },
  m1u6l6: { start: 173, end: 200, m: 19, M: 2, n: 7, d: [10, 13, 5], vis: 13 },
};
const SENTENCE_MCQ = new Set([14, 131, 167, 179, 182, 184, 191, 198]); // 문장형 mcq 지정 8슬롯(§0)
const BAN = ["산포도", "분산", "표준편차", "계급값", "경우의 수", "확률", "누적도수", "편차", "표본", "모집단", "범위", "수형도"];

// ── 문항 단위 검증 ──
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("m1u6e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^m1u6e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.figure) {
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    if (String(it.figure).length < 200) fail(`${it.id} figure 빈약`);
  }
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer ${Array.isArray(it.answer) ? it.answer.length : "형식"}`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") {
      if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`);
    } else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    const p = plain(it.prompt);
    const exemptDec = it.numKind === "dec" && /소수로/.test(p);
    const exemptVal = /의 값을 구하세요/.test(p);
    if (!it.unitLabel && !exemptDec && !exemptVal) fail(`${it.id} num unitLabel 없음(면제 문구도 없음)`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const noExp = plain(it.prompt) + (it.options ?? []).map(plain).join(" ");
  const all = noExp + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 문장형 mcq 상한: 지정 8슬롯 밖에서 보기 과반이 술어 문장(다/요 종결)인 mcq는 FAIL
  if (it.type === "mcq" && !SENTENCE_MCQ.has(slot)) {
    const sentencey = (it.options ?? []).filter((o) => /(다|요)[.!?]?$/.test(plain(o)) && plain(o).length > 12).length;
    if (sentencey >= 3) fail(`${it.id} 문장형 mcq(지정 8슬롯 밖) — 보기 ${sentencey}개가 술어 문장`);
  }
}

// ── 소스(주석 포함) em대시 0 ──
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
}

// ── 파일(레슨) 단위 쿼터 · 대역 완결 · num 유일 ──
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const [lid, arr] of byLesson) {
  const L = LESSON[lid];
  const want = L.end - L.start + 1;
  const complete = arr.length === want;
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const vis = arr.filter((i) => i.figure).length;
  const nums = arr.filter((i) => i.type === "num").map((i) => String(i.answer));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 파일 내 중복: ${dup.join(",")}`);
  if (complete) {
    if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
    if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (vis !== L.vis) fail(`${lid} 시각자료 ${vis} ≠ ${L.vis}`);
    const slots = arr.map((i) => Number(i.id.replace("m1u6e", ""))).sort((a, b) => a - b);
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${vis}${complete ? "" : " (미완)"}`);
}

if (allPresent) {
  if (items.length !== 200) fail(`전체 ${items.length} ≠ 200`);
  const vis = items.filter((i) => i.figure).length;
  if (vis !== 172) fail(`전체 시각자료 ${vis} ≠ 172`);
  const M = items.filter((i) => i.type === "multi").length;
  const sm = items.filter((i) => i.type === "mcq" && SENTENCE_MCQ.has(Number(i.id.replace("m1u6e", "")))).length;
  console.log(`전체: ${items.length} · 시각 ${vis}(86%) · 판별 상한 multi ${M}+문장형 ${sm} = ${M + sm} ≤ 20`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");
if (!allPresent) process.exit(0);

// ── 시험지 렌더(200) ──
items.sort((a, b) => Number(a.id.replace("m1u6e", "")) - Number(b.id.replace("m1u6e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const cards = items.map((it, i) => {
  const slot = it.id.replace("m1u6e", "");
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m1u6", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q">${body}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m1u6 v2 200문항 · 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28;
         -webkit-font-smoothing: antialiased; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2;
           border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #191F28; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.5; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 17px; font-weight: 800; color: #1B64DA; }
  .q-tag { font-size: 10.5px; color: #97A1AE; letter-spacing: 0; }
  .q-prompt { font-size: 13.8px; line-height: 1.62; word-break: keep-all; }
  .q-fig { margin: 10px auto 4px; max-width: 330px; }
  .q-fig svg { width: 100%; height: auto; display: block; }
  .q-opts { list-style: none; margin-top: 9px; display: flex; flex-direction: column; gap: 5px; }
  .q-opts li { display: flex; gap: 7px; font-size: 13.2px; line-height: 1.5; align-items: baseline; }
  .q-circ { color: #454F5D; font-weight: 600; flex: none; }
  .q-blank { margin-top: 11px; font-size: 13.2px; color: #454F5D; }
  .q-line { display: inline-block; width: 88px; border-bottom: 1.6px solid #8B95A3; height: 15px;
            vertical-align: -2px; margin: 0 4px; }
  .q-unit { color: #66707E; }
  .q-ans { margin-top: 10px; font-size: 12px; }
  .q-ans summary { cursor: pointer; color: #04B45F; font-weight: 700; font-size: 11.5px; }
  .q-exp { margin-top: 7px; background: #F5F7FA; border-radius: 8px; padding: 10px 12px;
           line-height: 1.66; color: #333D4B; }
  .q-exp .xh { display: block; font-weight: 800; color: #1B64DA; font-size: 11px; margin: 7px 0 3px; }
  .q-exp .xh:first-child { margin-top: 0; }
  .q-core { margin-top: 6px; font-size: 11.5px; color: #B4690E; font-weight: 700; }
  /* 변수 서체 = 앱과 동일한 STIX Two Text 로컬 번들(같은 폴더로 복사 서빙, m1u3 관행). */
  @font-face {
    font-family: "STIX Two Text";
    src: url("./stix-two-italic-latin.woff2") format("woff2");
    font-style: italic; font-weight: 400 700; font-display: swap;
    unicode-range: U+0041-005A, U+0061-007A;
  }
  @font-face {
    font-family: "STIX Two Text";
    src: url("./stix-two-italic-greek.woff2") format("woff2");
    font-style: italic; font-weight: 400 700; font-display: swap;
    unicode-range: U+03C0;
  }
  .mv { font-family: "STIX Two Text", "Pretendard Variable", Pretendard, sans-serif;
        font-style: italic; font-weight: 700; padding: 0 .02em; }
  svg text[font-style="italic"] { font-family: "STIX Two Text", "Pretendard Variable", Pretendard, sans-serif; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 수학 Ⅵ. 통계 · v2 재출제 200문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(시각자료 172/200 = 86% · 자료 상자 렌더(문두 나열 0) ·
  word 0 · 판별 10% 상한 · 상대도수 dec "소수로" · 도수 합=전체·상대도수 합=1 검산) 전량 적용.
  실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요. 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u6v2-full", { recursive: true });
writeFileSync("tmp/m1u6v2-full/index.html", html);
for (const f of ["stix-two-italic-latin.woff2", "stix-two-italic-greek.woff2"])
  copyFileSync(`src/styles/fonts/${f}`, `tmp/m1u6v2-full/${f}`);
console.log(`렌더 완료: tmp/m1u6v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length})`);
