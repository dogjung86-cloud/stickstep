// m2u3 v2 200제(파일럿 40 + 확대 160) 조립 검증 + 전체 시험지 갤러리 렌더.
// node qa/render-m2u3v2-full.mjs  →  tmp/m2u3v2-full/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

const FILES = [
  ["qa/m2u3v2-pilot.ts", "POOL_M2U3V2_PILOT"],
  ["qa/m2u3v2-rest-a.ts", "POOL_M2U3V2_REST_A"],
  ["qa/m2u3v2-rest-b.ts", "POOL_M2U3V2_REST_B"],
  ["qa/m2u3v2-rest-c.ts", "POOL_M2U3V2_REST_C"],
  ["qa/m2u3v2-rest-d.ts", "POOL_M2U3V2_REST_D"],
  ["qa/m2u3v2-rest-e.ts", "POOL_M2U3V2_REST_E"],
];

async function loadPool(entry, key) {
  const result = await build({
    entryPoints: [entry],
    bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent",
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  if (!Array.isArray(mod[key])) throw new Error(`${entry}: ${key} export 없음`);
  return mod[key];
}

let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warns = [];
const warn = (m) => warns.push(m);
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// ── 소스 레벨 검사(em대시·금지어 — 주석 포함) ──
for (const [file] of FILES) {
  const src = readFileSync(file, "utf8");
  if (src.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  for (const word of ["정의역", "치역", "공역", "연립부등식", "이차함수", "이차방정식", "근의 공식", "상수함수", "x축의 방향"]) {
    if (src.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
}

// ── 조립 ──
const all = [];
for (const [entry, key] of FILES) {
  const pool = await loadPool(entry, key);
  console.log(`${entry}: ${pool.length}문항`);
  all.push(...pool);
}
if (all.length !== 200) fail(`총 문항 ${all.length} ≠ 200`);

// 슬롯 1~200 정확 일치(중복·누락 동시 검출)
const idNums = all.map((it) => Number(String(it.id).replace("m2u3e", "")));
const seen = new Set();
for (const n of idNums) {
  if (seen.has(n)) fail(`슬롯 ${n} id 중복`);
  seen.add(n);
}
for (let n = 1; n <= 200; n += 1) if (!seen.has(n)) fail(`슬롯 ${n} 누락`);
all.sort((a, b) => Number(a.id.replace("m2u3e", "")) - Number(b.id.replace("m2u3e", "")));

// ── 레슨별 쿼터 검증 ──
const FIG_TARGET = { m2u3l1: 7, m2u3l2: 3, m2u3l3: 8, m2u3l4: 9, m2u3l5: 9, m2u3l6: 11, m2u3l7: 7, m2u3l8: 8, m2u3l9: 8, m2u3l10: 11 };
// 설계표(§3+§2-1) 기준 그림 슬롯 정본
const FIG_SLOTS = new Set([
  1, 6, 7, 9, 16, 17, 19,
  32, 36, 38,
  43, 45, 51, 53, 54, 55, 57, 59,
  62, 65, 66, 72, 73, 76, 77, 79, 80,
  82, 83, 85, 89, 90, 94, 96, 97, 99,
  102, 104, 105, 106, 109, 111, 112, 113, 115, 116, 117,
  124, 125, 127, 131, 133, 136, 138,
  144, 146, 149, 151, 153, 157, 158, 159,
  164, 168, 169, 171, 173, 175, 177, 178,
  183, 185, 186, 187, 191, 192, 194, 195, 196, 197, 198,
]);
const byLesson = new Map();
for (const it of all) {
  const g = byLesson.get(it.lessonId) ?? [];
  g.push(it);
  byLesson.set(it.lessonId, g);
}
for (let l = 1; l <= 10; l += 1) {
  const lid = `m2u3l${l}`;
  const g = byLesson.get(lid) ?? [];
  if (g.length !== 20) fail(`${lid}: ${g.length}문항 ≠ 20`);
  const ty = { mcq: 0, multi: 0, num: 0, word: 0 };
  const di = { 1: 0, 2: 0, 3: 0 };
  let fig = 0;
  const numAns = [];
  for (const it of g) {
    ty[it.type] += 1;
    di[it.diff] += 1;
    if (it.figure) fig += 1;
    if (it.type === "num") numAns.push(String(it.answer));
  }
  if (ty.mcq !== 10 || ty.multi !== 2 || ty.num !== 8 || ty.word !== 0)
    fail(`${lid}: 유형 ${ty.mcq}/${ty.multi}/${ty.num}/${ty.word} ≠ 10/2/8/0`);
  if (di[1] !== 8 || di[2] !== 8 || di[3] !== 4) fail(`${lid}: diff ${di[1]}/${di[2]}/${di[3]} ≠ 8/8/4`);
  if (fig !== FIG_TARGET[lid]) fail(`${lid}: 그림 ${fig} ≠ ${FIG_TARGET[lid]}`);
  const dup = numAns.filter((v, i) => numAns.indexOf(v) !== i);
  if (dup.length) fail(`${lid}: num 정답 레슨 내 중복 ${dup.join(",")}`);
}

// ── 문항 단위 검증 ──
for (const it of all) {
  const slot = Number(it.id.replace("m2u3e", ""));
  if (it.figure && !FIG_SLOTS.has(slot)) fail(`${it.id}: 설계표 무그림 슬롯인데 figure 있음`);
  if (!it.figure && FIG_SLOTS.has(slot)) fail(`${it.id}: 설계표 그림 슬롯인데 figure 없음`);
  if (it.figure) {
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    if (String(it.figure).length < 200) fail(`${it.id} figure 빈약`);
  }
  if (it.type === "mcq") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= 5) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false인데 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 개수`);
  }
  if (it.type === "num") {
    if (!/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}" 비정수`);
    if (it.numKind && it.numKind !== "int") fail(`${it.id} numKind ${it.numKind}`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!it.diff) fail(`${it.id} diff 없음`);
}

// ── 레슨 내 num 정답 유출 휴리스틱(|답|≥10이 이웃 노출면에 그대로 인쇄되면 WARN) ──
for (const [lid, g] of byLesson) {
  for (const it of g) {
    if (it.type !== "num") continue;
    const v = String(it.answer);
    if (Math.abs(Number(v)) < 10) continue;
    for (const other of g) {
      if (other.id === it.id) continue;
      const face = plain(other.prompt) + " " + (other.options ?? []).map(plain).join(" ");
      if (new RegExp(`(^|[^0-9.])${v.replace("-", "−")}([^0-9]|$)`).test(face) || new RegExp(`(^|[^0-9.−-])${v}([^0-9]|$)`).test(face))
        warn(`${lid}: ${it.id} 정답 ${v}이(가) ${other.id} 노출면에 등장(유출 검토)`);
    }
  }
}

console.log(warns.length ? `\nWARN ${warns.length}건:\n` + warns.map((w) => "  " + w).join("\n") : "\nWARN 0건");
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("조립 검증 ALL PASS\n");

// ── 전체 시험지 렌더 ──
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const LESSON_TITLE = {
  m2u3l1: "L1 함수: 하나에 하나씩", m2u3l2: "L2 일차함수: y=ax+b", m2u3l3: "L3 평행이동",
  m2u3l4: "L4 절편", m2u3l5: "L5 기울기", m2u3l6: "L6 그래프의 성질", m2u3l7: "L7 일차함수의 식 구하기",
  m2u3l8: "L8 일차함수의 활용", m2u3l9: "L9 일차함수와 일차방정식", m2u3l10: "L10 그래프와 연립방정식",
};
let lastLesson = "";
const cards = all.map((it, i) => {
  const slot = it.id.replace("m2u3e", "");
  const isPilot = readFileSync("qa/m2u3v2-pilot.ts", "utf8").includes(`"${it.id}"`);
  const tag = `슬롯 ${slot} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}${isPilot ? " · 파일럿" : ""}`;
  let head = "";
  if (it.lessonId !== lastLesson) {
    head = `<h2 class="lsn">${LESSON_TITLE[it.lessonId]}</h2>`;
    lastLesson = it.lessonId;
  }
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `${head}<article class="q">${body}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m2u3 v2 200제 전체 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28;
         -webkit-font-smoothing: antialiased; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2;
           border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #191F28; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.5; }
  .lsn { column-span: all; font-size: 15px; margin: 18px 0 4px; padding: 8px 12px; background: #EEF4FF;
         border-radius: 8px; color: #1B64DA; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 17px; font-weight: 800; color: #1B64DA; }
  .q-tag { font-size: 10.5px; color: #97A1AE; letter-spacing: 0; }
  .q-prompt { font-size: 13.8px; line-height: 1.62; word-break: keep-all; }
  .q-fig { margin: 10px auto 4px; max-width: 300px; }
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
  /* 변수 서체 통일: 앱(tokens.css --font-mvar) 그대로 — .mv·.mx-v·SVG 이탤릭 라벨 동일 스택 */
  .mv { font-family: "STIX Two Text", "Pretendard Variable", Pretendard, sans-serif;
        font-style: italic; font-weight: 700; padding: 0 .02em; }
  svg text[font-style="italic"] { font-family: "STIX Two Text", "Pretendard Variable", Pretendard, sans-serif; }
  .mx { display: inline-flex; align-items: center; flex-wrap: wrap; gap: .08em;
        font-variant-numeric: tabular-nums; font-weight: 700; color: #191F28; }
  .mx .mx-op { margin: 0 .14em; font-weight: 700; color: #454F5D; }
  .mx .mx-pos { color: #1B64DA; }
  .mx .mx-neg { color: #C2255C; }
  .mx .mx-par { color: #8B95A3; font-weight: 600; }
  .mx sup { font-size: .6em; font-weight: 800; line-height: 1; margin-left: .05em;
            align-self: flex-start; vertical-align: .66em; }
  .mx .mx-frac { display: inline-flex; flex-direction: column; align-items: center;
                 margin: 0 .1em; line-height: 1.12; position: relative; top: -.09em; }
  .mx .mx-frac > .fr-n { padding: 0 .28em .06em; font-size: .82em; }
  .mx .mx-frac > .fr-d { padding: .06em .28em 0; border-top: .09em solid currentColor; font-size: .82em; }
  .mx .mx-v { font-family: "STIX Two Text", "Pretendard Variable", Pretendard, sans-serif;
              font-style: italic; font-weight: 700; font-size: 1.05em; padding: 0 .02em; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중2 수학 Ⅲ. 일차함수 v2 전체 200제(파일럿 40 + 확대 160)</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2 · 레슨 구획별 슬롯 순 정렬. 실제 앱에서는 20문항씩 추출됩니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m2u3v2-full", { recursive: true });
writeFileSync("tmp/m2u3v2-full/index.html", html);
console.log(`렌더 완료: tmp/m2u3v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${all.length})`);
