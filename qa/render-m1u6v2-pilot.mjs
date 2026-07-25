// m1u6 v2 파일럿 40문항 검증 + 시험지 모양 갤러리 렌더(m2u5·m1u5·m1u3 사이클 계승).
// node qa/render-m1u6v2-pilot.mjs  →  tmp/m1u6v2-pilot/index.html
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

async function loadPool() {
  const result = await build({
    entryPoints: ["qa/m1u6v2-pilot.ts"],
    bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  return mod.POOL_M1U6V2_PILOT;
}

const pool = await loadPool();
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// ── 검증 ──
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
if (pool.length !== 40) fail(`문항 수 ${pool.length} ≠ 40`);
const ids = new Set();
const numAnswers = [];
const by = { mcq: 0, multi: 0, num: 0, word: 0 };
const byDiff = { 1: 0, 2: 0, 3: 0 };
let figured = 0;
// m1u6 언어 가드: 위학년(산포도·분산·표준편차·확률·경우의 수)+미도입(계급값·범위·누적도수·편차·표본).
// '범위'는 통계 용어 미도입이라 일반 서술에서도 전면 회피("가장 큰 값과 작은 값의 차"로).
const BAN = ["산포도", "분산", "표준편차", "계급값", "경우의 수", "확률", "누적도수", "편차", "표본", "모집단", "범위", "수형도"];
for (const it of pool) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  if (!/^m1u6e\d{3}$/.test(it.id)) fail(`${it.id} id 형식(m1u6eNNN 3자리)`);
  by[it.type] += 1;
  byDiff[it.diff] += 1;
  if (it.figure) {
    figured += 1;
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    if (String(it.figure).length < 200) fail(`${it.id} figure 빈약(${String(it.figure).length}자)`);
  }
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2) fail(`${it.id} multi answer`);
  }
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") {
      if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`);
    } else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    numAnswers.push(`${it.lessonId}:${a}`);
    const p = plain(it.prompt);
    const exemptDec = it.numKind === "dec" && /소수로/.test(p);
    const exemptVal = /의 값을 구하세요/.test(p);
    if (!it.unitLabel && !exemptDec && !exemptVal) fail(`${it.id} num unitLabel 없음(면제 문구도 없음)`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
}
// 소스 전체(주석 포함) em대시 0 검사
const src = readFileSync("qa/m1u6v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
if (src.includes("—")) fail("소스(주석 포함)에 em대시 존재");
// 표집 쿼터(설계표 §5): mcq 16 / multi 4 / num 20 · diff 12/22/6 · 시각 34
if (by.mcq !== 16 || by.multi !== 4 || by.num !== 20 || by.word !== 0)
  fail(`유형 표집 ${by.mcq}/${by.multi}/${by.num}/${by.word} ≠ 16/4/20/0`);
if (byDiff[1] !== 12 || byDiff[2] !== 22 || byDiff[3] !== 6) fail(`diff 표집 ${byDiff[1]}/${byDiff[2]}/${byDiff[3]} ≠ 12/22/6`);
if (figured !== 34) fail(`시각자료 ${figured}/40 ≠ 34`);
// num 정답 전역 유일(파일럿 관행 — 값만 비교)
const values = numAnswers.map((v) => v.split(":")[1]);
const dupNum = values.filter((v, i) => values.indexOf(v) !== i);
if (dupNum.length) fail(`num 정답 중복: ${dupNum.join(",")}`);
console.log(`유형: mcq ${by.mcq} / multi ${by.multi} / num ${by.num} / word ${by.word}`);
console.log(`diff: ${byDiff[1]}/${byDiff[2]}/${byDiff[3]} · 시각자료 ${figured}/40 (${Math.round((figured / 40) * 100)}%)`);
console.log(`num 정답: ${numAnswers.join(", ")}`);
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS\n");

// ── 시험지 렌더 ──
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const cards = pool.map((it, i) => {
  const slot = it.id.replace("m1u6e", "");
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m1u6", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(2, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q">${body}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m1u6 v2 파일럿 40문항 · 검수용 시험지</title>
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
  /* 변수 서체 = 앱과 동일한 STIX Two Text 로컬 번들(같은 폴더로 복사 서빙 · 스택 선언만 하면
     폴백 산세리프로 떨어지는 실사고의 재발 방지, m1u3 관행). unicode-range도 앱 math.css와 동일. */
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
  <h1>중1 수학 Ⅵ. 통계 · v2 파일럿 40문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(시각자료 86% 기준 · 자료 상자 렌더(문두 나열 0) · word 0 ·
  판별 10% 상한 · 상대도수 dec "소수로" · 도수 합=전체·상대도수 합=1 검산) 적용분. 실제 앱에서는
  20문항씩 추출되고 해설은 제출 후에만 보여요. 각 문항의 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u6v2-pilot", { recursive: true });
writeFileSync("tmp/m1u6v2-pilot/index.html", html);
for (const f of ["stix-two-italic-latin.woff2", "stix-two-italic-greek.woff2"])
  copyFileSync(`src/styles/fonts/${f}`, `tmp/m1u6v2-pilot/${f}`);
console.log(`렌더 완료: tmp/m1u6v2-pilot/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length})`);
