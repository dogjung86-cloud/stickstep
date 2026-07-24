// m2u4 v2 전체 200문항(파일럿 40 + 확대 160) 검증 + 시험지 렌더(m1u4 render-full 계승).
// node qa/render-m2u4v2-full.mjs  →  tmp/m2u4v2-full/index.html
import { build } from "esbuild";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

async function loadPool(entry, name) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const SOURCES = [
  ["qa/m2u4v2-pilot.ts", "POOL_M2U4V2_PILOT"],
  ["qa/m2u4v2-rest-a.ts", "POOL_M2U4V2_REST_A"],
  ["qa/m2u4v2-rest-b.ts", "POOL_M2U4V2_REST_B"],
  ["qa/m2u4v2-rest-c.ts", "POOL_M2U4V2_REST_C"],
  ["qa/m2u4v2-rest-d.ts", "POOL_M2U4V2_REST_D"],
  ["qa/m2u4v2-rest-e.ts", "POOL_M2U4V2_REST_E"],
];
const pools = [];
for (const [entry, name] of SOURCES) pools.push(...(await loadPool(entry, name)));
const pool = pools.slice().sort((a, b) => a.id.localeCompare(b.id));
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// ── 검증 ──
let fails = 0;
const warns = [];
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => warns.push(m);
if (pool.length !== 200) fail(`문항 수 ${pool.length} ≠ 200`);
for (const [entry] of SOURCES) if (readFileSync(entry, "utf8").includes("—")) fail(`${entry}: em대시(—) 존재(주석 포함 금지)`);
for (let i = 0; i < 200; i += 1) {
  const expected = `m2u4e${String(i + 1).padStart(3, "0")}`;
  if (pool[i]?.id !== expected) fail(`ID 연번 오류: 위치 ${i + 1}=${pool[i]?.id}, 기대 ${expected}`);
}

// 레슨별 쿼터(§0): 기본 mcq10/multi2/num8, L7·L9만 9/3/8. diff 8/8/4. 그림 파일별 정확값.
const FIG_QUOTA = { m2u4l1: 18, m2u4l2: 15, m2u4l3: 16, m2u4l4: 16, m2u4l5: 17, m2u4l6: 16, m2u4l7: 11, m2u4l8: 17, m2u4l9: 10, m2u4l10: 19 };
const BAN = [
  "닮음", "피타고라스", "무게중심", "중선", "중점연결", "등변사다리꼴", "이등변사다리꼴", "점대칭",
  "삼각비", "√", "원주각", "역이 성립", "역은 성립", "역도 성립", "의 역도", "의 역은", "의 역이",
  "2∠", "90°+½", "½∠",
];
const byLesson = new Map();
for (const it of pool) {
  const g = byLesson.get(it.lessonId) ?? [];
  g.push(it);
  byLesson.set(it.lessonId, g);
}
let totalFig = 0;
for (const [lesson, items] of byLesson) {
  if (items.length !== 20) fail(`${lesson}: ${items.length}문항 ≠ 20`);
  const t = { mcq: 0, multi: 0, num: 0, word: 0 };
  const d = { 1: 0, 2: 0, 3: 0 };
  const numAns = new Map();
  let fig = 0;
  for (const it of items) {
    t[it.type] += 1;
    d[it.diff] += 1;
    if (it.figure) {
      fig += 1;
      if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    }
    if (it.figureDark) fail(`${it.id} figureDark 금지`);
    if (it.type === "mcq") {
      if (!it.options || it.options.length !== 5) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
      if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4) fail(`${it.id} mcq answer 범위`);
      if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
      if (new Set(it.options ?? []).size !== 5) fail(`${it.id} 보기 문자열 중복`);
    } else if (it.type === "multi") {
      if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
      if (!Array.isArray(it.answer) || it.answer.length < 2) fail(`${it.id} multi answer 부족`);
      else if (JSON.stringify([...it.answer].sort((a, b) => a - b)) !== JSON.stringify(it.answer)) fail(`${it.id} multi answer 오름차순 아님`);
    } else if (it.type === "num") {
      if (!/^\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"(자연수 아님)`);
      const key = `${it.answer}|${it.unitLabel ?? ""}`;
      if (numAns.has(key)) fail(`${lesson} num 정답 중복: ${numAns.get(key)} ↔ ${it.id} (${key})`);
      numAns.set(key, it.id);
      if (!it.unitLabel && !/의 값을 구하세요/.test(plain(it.prompt))) fail(`${it.id} num unitLabel 없음(면제 문구도 없음)`);
    } else {
      fail(`${it.id} word 유형(v2는 word 0)`);
    }
    const exp = plain(it.explain);
    if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
    if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
    const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + exp + plain(it.core);
    for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
    if (/(^|[^\w])-(?=\d|[a-z])/i.test(all)) fail(`${it.id} ASCII 하이픈 음수 후보(U+2212 필요)`);
    if (!it.core) fail(`${it.id} core 없음`);
  }
  const isBig = lesson === "m2u4l7" || lesson === "m2u4l9";
  const em = isBig ? 9 : 10;
  const eM = isBig ? 3 : 2;
  if (t.mcq !== em || t.multi !== eM || t.num !== 8 || t.word !== 0)
    fail(`${lesson}: 유형 ${t.mcq}/${t.multi}/${t.num}/${t.word}, 기대 ${em}/${eM}/8/0`);
  if (d[1] !== 8 || d[2] !== 8 || d[3] !== 4) fail(`${lesson}: diff ${d[1]}/${d[2]}/${d[3]} ≠ 8/8/4`);
  if (fig !== FIG_QUOTA[lesson]) fail(`${lesson}: 그림 ${fig} ≠ 설계 ${FIG_QUOTA[lesson]}`);
  totalFig += fig;
}
// 파일 간 num 일치 후보(과제 다름 수동 판정)
const numGlobal = new Map();
for (const it of pool.filter((a) => a.type === "num")) {
  const v = `${it.answer}|${it.unitLabel ?? ""}`;
  if (numGlobal.has(v)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(v)} ↔ ${it.id} (${v})`);
  else numGlobal.set(v, it.id);
}
// 문두 정확 중복(그림 문항끼리는 WARN — 교과서 반복 문형 수용)
const prompts = new Map();
for (const it of pool) {
  const p = plain(it.prompt);
  if (prompts.has(p)) {
    const other = prompts.get(p);
    if (it.figure && other.figure) warn(`문두 정확 중복(그림 문항끼리): ${other.id} ↔ ${it.id}`);
    else fail(`문두 정확 중복: ${other.id} ↔ ${it.id}`);
  } else prompts.set(p, it);
}
console.log(`전체 ${pool.length}문항 · 그림 ${totalFig}/200 (${(totalFig / 2).toFixed(1)}%)`);
const tt = { mcq: 0, multi: 0, num: 0 };
for (const it of pool) tt[it.type] += 1;
console.log(`유형 합계: mcq ${tt.mcq} / multi ${tt.multi} / num ${tt.num} (기대 98/22/80)`);
if (tt.mcq !== 98 || tt.multi !== 22 || tt.num !== 80) fail("유형 합계 불일치");
for (const m of warns) console.log("WARN", m);
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS\n");

// ── 시험지 렌더 ──
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const LESSON_NAME = {
  m2u4l1: "L1 이등변삼각형의 성질", m2u4l2: "L2 이등변삼각형이 되는 조건", m2u4l3: "L3 직각삼각형의 합동 조건",
  m2u4l4: "L4 삼각형의 외심", m2u4l5: "L5 삼각형의 내심", m2u4l6: "L6 평행사변형의 성질",
  m2u4l7: "L7 평행사변형이 되는 조건", m2u4l8: "L8 직사각형·마름모·정사각형", m2u4l9: "L9 여러 가지 사각형의 관계",
  m2u4l10: "L10 평행선과 넓이",
};
let lastLesson = "";
const cards = pool.map((it, i) => {
  const slot = it.id.replace("m2u4e", "");
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m2u4", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let head = "";
  if (it.lessonId !== lastLesson) {
    lastLesson = it.lessonId;
    head = `<h2 class="sec">${LESSON_NAME[it.lessonId]}</h2>`;
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
<title>m2u4 v2 전체 200문항: 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28;
         -webkit-font-smoothing: antialiased; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2;
           border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #191F28; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.5; }
  .sec { column-span: all; font-size: 15px; color: #1B64DA; border-left: 4px solid #1B64DA;
         padding: 3px 0 3px 10px; margin: 18px 0 4px; background: #F4F8FF; border-radius: 0 8px 8px 0; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 16px; font-weight: 800; color: #1B64DA; }
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
  <h1>중2 수학 Ⅳ. 삼각형과 사각형의 성질: v2 전체 200문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2 · 파일럿 40(승인분)+확대 160. 실제 앱에서는 20문항씩
  추출되고 해설은 제출 후에만 보여요. 각 문항의 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m2u4v2-full", { recursive: true });
writeFileSync("tmp/m2u4v2-full/index.html", html);
console.log(`렌더 완료: tmp/m2u4v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length})`);
