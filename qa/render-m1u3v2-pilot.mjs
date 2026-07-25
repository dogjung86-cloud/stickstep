// m1u3 v2 파일럿 40문항 검증 + 시험지 모양 갤러리 렌더(m2u5·m1u4·m2u3·m1u5 사이클 계승).
// node qa/render-m1u3v2-pilot.mjs  →  tmp/m1u3v2-pilot/index.html
import { build } from "esbuild";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

async function loadPool() {
  const result = await build({
    entryPoints: ["qa/m1u3v2-pilot.ts"],
    bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  return mod.POOL_M1U3V2_PILOT;
}

const pool = await loadPool();
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// ── 검증 ──
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
if (pool.length !== 40) fail(`문항 수 ${pool.length} != 40`);
const ids = new Set();
const numAnswers = [];
const by = { mcq: 0, multi: 0, num: 0, word: 0 };
const byDiff = { 1: 0, 2: 0, 3: 0 };
let figured = 0;
// m1u3 언어 가드: v1 검사기 7종 + '함수'(3사 실측 0회 · 중1 III 미도입). '기울기'류는
// "가파르다/y축에 가까워진다"로 대체 서술이 원칙.
const BAN = ["함수", "기울기", "절편", "점근선", "정의역", "치역", "쌍곡선", "상수", "드론", "레이더", "비콘", "센서"];
for (const it of pool) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  by[it.type] += 1;
  byDiff[it.diff] += 1;
  if (it.figure) {
    figured += 1;
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    if (String(it.figure).length < 200) fail(`${it.id} figure 빈약(${String(it.figure).length}자)`);
  }
  if (it.type === "mcq") {
    if (!it.options || it.options.length !== 5) {
      // 개형·상황 카드 3~4장 세트(45·54)는 카드 수 = 보기 수(라벨 보기 관행)
      if (!(it.shuffle === false && it.options && it.options.length >= 3)) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
    }
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
    if (!Array.isArray(it.answer) || it.answer.length < 2) fail(`${it.id} multi answer`);
  }
  if (it.type === "num") {
    if (!/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
    numAnswers.push(`${it.lessonId}:${it.answer}`);
    const p = plain(it.prompt);
    if (!it.unitLabel && !/(의 값을 구하세요|넓이를 구하세요|번호를 쓰세요|좌표를 구하세요|알맞은 수를 구하세요)/.test(p))
      fail(`${it.id} num unitLabel 없음(무단위 면제 문구도 없음)`);
  }
  if (it.type === "word") fail(`${it.id} word 유형(v2는 word 0)`);
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/^m1u3e\d{3}$/.test(it.id)) fail(`${it.id} id 형식`);
  if (!/^m1u3l[1-9]$/.test(it.lessonId)) fail(`${it.id} lessonId ${it.lessonId}`);
}
// num 정답 유일성: 파일럿 40 안에서는 전역 유일(m2u3 §2-1 관행 — 값만 비교)
const values = numAnswers.map((v) => v.split(":")[1]);
const dupNum = values.filter((v, i) => values.indexOf(v) !== i);
if (dupNum.length) fail(`num 정답 중복: ${dupNum.join(",")}`);
console.log(`유형: mcq ${by.mcq} / multi ${by.multi} / num ${by.num} / word ${by.word}`);
console.log(`diff: ${byDiff[1]}/${byDiff[2]}/${byDiff[3]} · 그림 ${figured}/40 (${Math.round((figured / 40) * 100)}%)`);
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
  const slot = it.id.replace("m1u3e", "");
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m1u3", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
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
<title>m1u3 v2 파일럿 40문항 · 검수용 시험지</title>
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
  .q-fig { margin: 10px auto 4px; max-width: 340px; }
  .q-fig svg { width: 100%; height: auto; display: block; margin-top: 6px; }
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
  /* 변수 서체 = 앱과 동일한 STIX Two Text 로컬 번들(같은 폴더로 복사 서빙 — 스택 선언만 하면
     폴백 산세리프로 떨어지는 실사고의 재발 방지). unicode-range도 앱 math.css와 동일. */
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
  <h1>중1 수학 Ⅲ. 좌표평면과 그래프 · v2 파일럿 40문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(그림 52.5% 기준 · 판독-개형-교점 중심 · word 0 ·
  '함수' 미도입 언어 가드 · 반비례 두 갈래) 적용분. 실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만
  보여요. 각 문항의 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u3v2-pilot", { recursive: true });
writeFileSync("tmp/m1u3v2-pilot/index.html", html);
for (const f of ["stix-two-italic-latin.woff2", "stix-two-italic-greek.woff2"])
  copyFileSync(`src/styles/fonts/${f}`, `tmp/m1u3v2-pilot/${f}`);
console.log(`렌더 완료: tmp/m1u3v2-pilot/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length}, 변수 서체 번들 복사)`);
