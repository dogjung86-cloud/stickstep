// m2u5 v2 파일럿 40문항 검증 + 시험지 모양 갤러리 렌더.
// node qa/render-m2u5v2-pilot.mjs  →  tmp/m2u5v2-pilot/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

async function loadPool() {
  const result = await build({
    entryPoints: ["qa/m2u5v2-pilot.ts"],
    bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  return mod.POOL_M2U5V2_PILOT;
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
    if (!it.options || it.options.length !== 5) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
  }
  if (it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
    if (!Array.isArray(it.answer) || it.answer.length < 2) fail(`${it.id} multi answer`);
  }
  if (it.type === "num") {
    if (!/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
    numAnswers.push(String(it.answer));
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  if (!it.core) fail(`${it.id} core 없음`);
}
const dupNum = numAnswers.filter((v, i) => numAnswers.indexOf(v) !== i);
if (dupNum.length) fail(`num 정답 중복: ${dupNum.join(",")}`);
console.log(`유형: mcq ${by.mcq} / multi ${by.multi} / num ${by.num} / word ${by.word}`);
console.log(`diff: ${byDiff[1]}/${byDiff[2]}/${byDiff[3]} · 그림 ${figured}/40 (${Math.round(figured / 0.4)}%)`);
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
  const meta = `슬롯 ${it.id.replace("m2u5v2e", "")}회차없음`;
  void meta;
  const tag = `${it.lessonId.replace("m2u5", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}`;
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
<title>m2u5 v2 파일럿 40문항 — 검수용 시험지</title>
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
  .mv { font-style: italic; font-weight: 700; font-family: Georgia, serif; }
  .gsym { font-weight: 800; white-space: nowrap; }
  .gsym.over { position: relative; display: inline-block; padding-top: .46em; line-height: 1.05; }
  .gsym-m { position: absolute; top: 0; left: 50%; transform: translateX(-50%);
            font-size: .62em; line-height: 1; letter-spacing: 0; font-weight: 700; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중2 수학 Ⅴ. 도형의 닮음과 피타고라스 정리 — v2 파일럿 40문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(그림 우선 · 값 구하기 중심 · 그림 라벨 단위 병기) 적용분.
  실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요. 각 문항의 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m2u5v2-pilot", { recursive: true });
writeFileSync("tmp/m2u5v2-pilot/index.html", html);
console.log(`렌더 완료: tmp/m2u5v2-pilot/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length})`);
