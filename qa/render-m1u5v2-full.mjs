// m1u5 v2 전체 200문항 검증 + 시험지 렌더(m2u3·m2u4 full 사이클 계승).
// 스테이징 6파일(pilot+rest-a~e)을 슬롯 순으로 합쳐 검증하고 tmp/m1u5v2-full/index.html로 렌더한다.
// 일부 파일만 있으면 있는 것만 검증(저작 중간 게이트), 6파일 전부면 200 총량·레슨 쿼터까지 강제.
// node qa/render-m1u5v2-full.mjs
import { build } from "esbuild";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const FILES = [
  ["qa/m1u5v2-pilot.ts", "POOL_M1U5V2_PILOT"],
  ["qa/m1u5v2-rest-a.ts", "POOL_M1U5V2_REST_A"],
  ["qa/m1u5v2-rest-b.ts", "POOL_M1U5V2_REST_B"],
  ["qa/m1u5v2-rest-c.ts", "POOL_M1U5V2_REST_C"],
  ["qa/m1u5v2-rest-d.ts", "POOL_M1U5V2_REST_D"],
  ["qa/m1u5v2-rest-e.ts", "POOL_M1U5V2_REST_E"],
];
// 레슨 쿼터(§0·§4): [count, mcq, multi, num, diff1, diff2, diff3, figures]
const SPEC = [
  [14, 6, 2, 6, 6, 5, 3, 6],
  [14, 5, 2, 7, 5, 6, 3, 13],
  [14, 6, 2, 6, 6, 5, 3, 7],
  [14, 6, 2, 6, 5, 6, 3, 10],
  [14, 8, 2, 4, 6, 6, 2, 12],
  [14, 7, 2, 5, 5, 6, 3, 12],
  [15, 6, 2, 7, 6, 6, 3, 12],
  [14, 6, 2, 6, 6, 5, 3, 7],
  [14, 7, 2, 5, 5, 6, 3, 2],
  [14, 8, 2, 4, 6, 6, 2, 13],
  [15, 6, 2, 7, 6, 6, 3, 12],
  [15, 6, 2, 7, 6, 6, 3, 13],
  [15, 6, 2, 7, 6, 6, 3, 9],
  [14, 6, 2, 6, 6, 5, 3, 11],
];
const START = [1, 15, 29, 43, 57, 71, 85, 100, 114, 128, 142, 157, 172, 187];
// 언어 가드(§0): 위학년 용어 금지 — 내각·외각은 이 단원 도입이라 허용(m1u4와 반대).
const BAN = ["기울기", "닮음", "피타고라스", "삼각비", "원주각", "중선", "동측내각", "벡터", "좌표기하", "무리수", "호도법", "√"];

async function loadPool(entry, key) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  if (!Array.isArray(mod[key])) throw new Error(`${entry}: ${key} export 없음`);
  return mod[key];
}

const present = FILES.filter(([f]) => existsSync(f));
const complete = present.length === FILES.length;
const pool = [];
for (const [f, k] of present) pool.push(...(await loadPool(f, k)));
pool.sort((a, b) => Number(a.id.replace("m1u5e", "")) - Number(b.id.replace("m1u5e", "")));
console.log(`로드: ${present.length}/6파일, ${pool.length}문항${complete ? "" : " (부분 검증 모드)"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warns = [];
const warn = (m) => warns.push(m);

const ids = new Set();
for (const it of pool) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  if (!/^m1u5e\d{3}$/.test(it.id)) fail(`${it.id} id 형식`);
  if (![1, 2, 3].includes(it.diff)) fail(`${it.id} diff`);
  if (it.figure) {
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    if (String(it.figure).length < 200) fail(`${it.id} figure 빈약`);
    if (it.figureDark) fail(`${it.id} figureDark 금지`);
  }
  if (it.type === "mcq") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
    if (new Set(it.options ?? []).size !== (it.options ?? []).length) fail(`${it.id} 보기 문자열 중복`);
    if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer >= 5) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  } else if (it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 개수`);
    else {
      const s = [...it.answer].sort((a, b) => a - b);
      if (JSON.stringify(s) !== JSON.stringify(it.answer)) fail(`${it.id} multi answer 오름차순 아님`);
      if (new Set(s).size !== s.length || s.some((n) => n < 0 || n >= 5)) fail(`${it.id} multi answer 인덱스`);
    }
  } else if (it.type === "num") {
    if (!/^\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
    if ((it.numKind ?? "int") !== "int") fail(`${it.id} numKind int 아님`);
    if (/π/.test(String(it.answer))) fail(`${it.id} num 답에 π`);
    if (!it.unitLabel && !/의 값을 구하세요/.test(plain(it.prompt))) fail(`${it.id} num unitLabel 없음(면제 문구도 없음)`);
  } else if (it.type === "word") {
    fail(`${it.id} v2는 word 0`);
  } else fail(`${it.id} type ${it.type}`);
  const exp = plain(it.explain);
  if (exp.length < 250 || exp.length > 450) fail(`${it.id} 해설 ${exp.length}자(250~450 위반)`);
  if (!String(it.explain).includes("class='xh'")) fail(`${it.id} xh 소제목 없음`);
  if (!it.core) fail(`${it.id} core 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/.test(all)) fail(`${it.id} 로마 숫자`);
  if (/(^|[^0-9a-zA-Z])-(?=\d)/.test(all)) fail(`${it.id} ASCII 하이픈 음수 후보(U+2212 필요)`);
}

// 레슨별 쿼터(그 레슨 슬롯이 전부 모였을 때만 검사 — 부분 모드 배려)
const byLesson = new Map();
for (const it of pool) {
  const n = Number(String(it.lessonId).replace("m1u5l", ""));
  if (!byLesson.has(n)) byLesson.set(n, []);
  byLesson.get(n).push(it);
}
for (const [n, items] of [...byLesson.entries()].sort((a, b) => a[0] - b[0])) {
  const [count, mq, Mq, nq, d1, d2, d3, figs] = SPEC[n - 1];
  if (items.length < count && !complete) { console.log(`l${n}: ${items.length}/${count}문항(부분)`); continue; }
  if (items.length !== count) { fail(`l${n}: ${items.length}문항, 기대 ${count}`); continue; }
  const t = { mcq: 0, multi: 0, num: 0 };
  const d = { 1: 0, 2: 0, 3: 0 };
  let f = 0;
  const numSeen = new Map();
  for (const it of items) {
    t[it.type] += 1;
    d[it.diff] += 1;
    if (it.figure) f += 1;
    if (it.type === "num") {
      if (numSeen.has(String(it.answer))) fail(`l${n} num 정답 중복 ${it.answer}: ${numSeen.get(String(it.answer))} ↔ ${it.id}`);
      numSeen.set(String(it.answer), it.id);
    }
  }
  if (t.mcq !== mq || t.multi !== Mq || t.num !== nq) fail(`l${n} 유형 ${t.mcq}/${t.multi}/${t.num}, 기대 ${mq}/${Mq}/${nq}`);
  if (d[1] !== d1 || d[2] !== d2 || d[3] !== d3) fail(`l${n} diff ${d[1]}/${d[2]}/${d[3]}, 기대 ${d1}/${d2}/${d3}`);
  if (f !== figs) fail(`l${n} 그림 ${f}, 기대 ${figs}`);
  const base = START[n - 1];
  const want = Array.from({ length: count }, (_, i) => `m1u5e${String(base + i).padStart(3, "0")}`);
  const got = items.map((x) => x.id);
  if (JSON.stringify(want) !== JSON.stringify(got)) fail(`l${n} 슬롯 연번 오류: ${got.join(",")}`);
  console.log(`l${n}: ${items.length}문항 유형 ${t.mcq}/${t.multi}/${t.num} diff ${d[1]}/${d[2]}/${d[3]} 그림 ${f} ✓`);
}

if (complete) {
  if (pool.length !== 200) fail(`총 ${pool.length}문항 ≠ 200`);
  const figs = pool.filter((x) => x.figure).length;
  const types = { mcq: 0, multi: 0, num: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  for (const it of pool) { types[it.type] += 1; diffs[it.diff] += 1; }
  console.log(`전체: mcq ${types.mcq}/multi ${types.multi}/num ${types.num} · diff ${diffs[1]}/${diffs[2]}/${diffs[3]} · 그림 ${figs}/200`);
  if (types.mcq !== 89 || types.multi !== 28 || types.num !== 83) fail(`전체 유형 ${types.mcq}/${types.multi}/${types.num} ≠ 89/28/83`);
  if (diffs[1] !== 80 || diffs[2] !== 80 || diffs[3] !== 40) fail(`전체 diff ≠ 80/80/40`);
  if (figs < 132) fail(`그림 ${figs} < 기계 하한 132`);
  // 파일 간 num 값 일치는 후보 보고(과제가 다른지 수동 판정 — m2u3 관행)
  const numGlobal = new Map();
  for (const it of pool.filter((x) => x.type === "num")) {
    const key = `${it.answer}|${it.unitLabel ?? ""}`;
    if (numGlobal.has(key)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(key)} ↔ ${it.id} (${key})`);
    else numGlobal.set(key, it.id);
  }
}

for (const m of [...new Set(warns)]) console.log("WARN", m);
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
  const slot = it.id.replace("m1u5e", "");
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m1u5", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
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
<title>m1u5 v2 전체 200문항: 검수용 시험지</title>
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
  .mv { font-style: italic; font-weight: 700; font-family: "STIX Two Text", Georgia, serif; }
  .gsym { font-weight: 800; white-space: nowrap; }
  .gsym.over { position: relative; display: inline-block; padding-top: .46em; line-height: 1.05; }
  .gsym-m { position: absolute; top: 0; left: 50%; transform: translateX(-50%);
            font-size: .62em; line-height: 1; letter-spacing: 0; font-weight: 700; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 수학 Ⅴ. 평면도형과 입체도형: v2 전체 ${pool.length}문항</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(그림 우선 · 값 구하기 중심 · 그림 라벨 단위 병기 · word 0 ·
  π 답은 "a의 값" 부품 문항). 실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요.
  각 문항의 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u5v2-full", { recursive: true });
writeFileSync("tmp/m1u5v2-full/index.html", html);
console.log(`렌더 완료: tmp/m1u5v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length})`);
