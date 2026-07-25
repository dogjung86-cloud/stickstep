// m1u3 v2 200문항 조립 검증 + 시험지 갤러리 렌더(m1u5 부분 검증 모드 계승).
// node qa/render-m1u3v2-full.mjs            → 존재하는 스테이징 파일만 검증(저작 중간 게이트)
//                                              전 파일 존재 시 200 전수 조립 검증 + tmp/m1u3v2-full/index.html
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

const SOURCES = [
  ["qa/m1u3v2-pilot.ts", "POOL_M1U3V2_PILOT"],
  ["qa/m1u3v2-rest-a.ts", "POOL_M1U3V2_REST_A"],
  ["qa/m1u3v2-rest-b.ts", "POOL_M1U3V2_REST_B"],
  ["qa/m1u3v2-rest-c.ts", "POOL_M1U3V2_REST_C"],
  ["qa/m1u3v2-rest-d.ts", "POOL_M1U3V2_REST_D"],
  ["qa/m1u3v2-rest-e.ts", "POOL_M1U3V2_REST_E"],
];

async function loadPool(entry, name) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  return mod[name];
}

const present = SOURCES.filter(([p]) => existsSync(p));
const partial = present.length < SOURCES.length;
const pool = [];
for (const [p, name] of present) {
  const part = await loadPool(p, name);
  if (!part) { console.error(`FAIL ${p}: ${name} export 없음`); process.exit(1); }
  pool.push(...part);
}
pool.sort((x, y) => x.id.localeCompare(y.id));
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// ── 정본 명세(설계표 §0·§3·§4) ──
const LESSON_SPEC = {
  m1u3l1: { total: 22, m: 11, M: 2, n: 9, diff: [9, 9, 4], fig: 12, lo: 1, hi: 22 },
  m1u3l2: { total: 22, m: 11, M: 2, n: 9, diff: [9, 9, 4], fig: 5, lo: 23, hi: 44 },
  m1u3l3: { total: 22, m: 11, M: 2, n: 9, diff: [9, 9, 4], fig: 16, lo: 45, hi: 66 },
  m1u3l4: { total: 23, m: 11, M: 3, n: 9, diff: [9, 9, 5], fig: 20, lo: 67, hi: 89 },
  m1u3l5: { total: 22, m: 11, M: 2, n: 9, diff: [9, 9, 4], fig: 6, lo: 90, hi: 111 },
  m1u3l6: { total: 22, m: 11, M: 2, n: 9, diff: [9, 8, 5], fig: 13, lo: 112, hi: 133 },
  m1u3l7: { total: 22, m: 11, M: 2, n: 9, diff: [9, 9, 4], fig: 5, lo: 134, hi: 155 },
  m1u3l8: { total: 22, m: 11, M: 2, n: 9, diff: [8, 9, 5], fig: 14, lo: 156, hi: 177 },
  m1u3l9: { total: 23, m: 11, M: 3, n: 9, diff: [9, 9, 5], fig: 14, lo: 178, hi: 200 },
};
// 그림 슬롯 정본 집합(§3 행 단위 — 합 105)
const FIG_SLOTS = new Set([
  1, 2, 3, 5, 6, 8, 9, 12, 13, 19, 21, 22,
  23, 27, 32, 38, 39,
  45, 47, 48, 49, 50, 51, 53, 54, 55, 56, 57, 58, 60, 61, 64, 65,
  67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 84, 85, 87, 88, 89,
  93, 99, 101, 106, 109, 111,
  112, 113, 115, 116, 117, 119, 122, 124, 125, 128, 130, 131, 132,
  137, 143, 149, 150, 155,
  156, 157, 158, 159, 160, 161, 165, 166, 168, 169, 172, 174, 175, 177,
  178, 179, 181, 182, 183, 184, 185, 188, 189, 191, 194, 196, 197, 199,
]);
const BAN = ["함수", "기울기", "절편", "점근선", "정의역", "치역", "쌍곡선", "상수", "드론", "레이더", "비콘", "센서"];

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const ids = new Set();
const perLesson = new Map();
for (const it of pool) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("m1u3e", ""));
  const spec = LESSON_SPEC[it.lessonId];
  if (!spec) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (slot < spec.lo || slot > spec.hi) fail(`${it.id} ${it.lessonId} 범위 ${spec.lo}~${spec.hi} 밖`);
  const acc = perLesson.get(it.lessonId) ?? { m: 0, M: 0, n: 0, diff: [0, 0, 0], fig: 0, num: [], rel: [], items: 0 };
  perLesson.set(it.lessonId, acc);
  acc.items += 1;
  if (it.type === "mcq") acc.m += 1;
  else if (it.type === "multi") acc.M += 1;
  else if (it.type === "num") acc.n += 1;
  else fail(`${it.id} 유형 ${it.type}(v2는 word 0)`);
  acc.diff[it.diff - 1] += 1;
  if (it.figure) acc.fig += 1;
  if (Boolean(it.figure) !== FIG_SLOTS.has(slot)) fail(`${it.id} 그림 유무가 §3 정본과 불일치(슬롯 ${slot})`);

  if (it.figure) {
    if (!String(it.figure).startsWith("<svg")) fail(`${it.id} figure가 SVG가 아님`);
    // 부품 관계식 추출(레슨 내 배타 검사용) — lines a/b·곡선 a는 SVG에서 복원 불가라
    // 검산 노트 의무 + 노출면 문자열 스캔으로 보완(아래 relation 스캔).
  }
  if (it.type === "mcq") {
    const cardSet = it.shuffle === false && (it.options?.length ?? 0) >= 3;
    if (!cardSet && (!it.options || it.options.length !== 5)) fail(`${it.id} mcq 보기 ${it.options?.length}개`);
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} multi 보기 ${it.options?.length}개`);
    if (!Array.isArray(it.answer) || it.answer.length < 2) fail(`${it.id} multi answer`);
  }
  if (it.type === "num") {
    if (!/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
    acc.num.push(String(it.answer));
    const p = plain(it.prompt);
    if (!it.unitLabel && !/(의 값을 구하세요|넓이를 구하세요|번호를 쓰세요|좌표를 구하세요|알맞은 수를 구하세요)/.test(p))
      fail(`${it.id} num unitLabel 없음(무단위 면제 문구도 없음)`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ");
  const all = surface + " " + exp + " " + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 노출면 관계식 수집(y=Nx·y=N/x·xy=N — 레슨 내 부품·문두 배타 검사)
  for (const m of surface.matchAll(/y=(-?\d+(?:\.\d+)?)(x|\/x)/g)) acc.rel.push(`${it.id}:${m[2] === "x" ? "L" : "C"}${m[1]}`);
  for (const m of surface.matchAll(/xy=(-?\d+)/g)) acc.rel.push(`${it.id}:C${m[1]}`);
}

for (const [lesson, spec] of Object.entries(LESSON_SPEC)) {
  const acc = perLesson.get(lesson);
  if (!acc) { if (!partial) fail(`${lesson} 문항 없음`); continue; }
  const complete = acc.items === spec.total;
  if (!partial && !complete) fail(`${lesson} ${acc.items}문항 != ${spec.total}`);
  if (complete) {
    if (acc.m !== spec.m || acc.M !== spec.M || acc.n !== spec.n)
      fail(`${lesson} 유형 ${acc.m}/${acc.M}/${acc.n} != ${spec.m}/${spec.M}/${spec.n}`);
    if (acc.diff.join("/") !== spec.diff.join("/")) fail(`${lesson} diff ${acc.diff.join("/")} != ${spec.diff.join("/")}`);
    if (acc.fig !== spec.fig) fail(`${lesson} 그림 ${acc.fig} != ${spec.fig}`);
  }
  const dupNum = acc.num.filter((v, i) => acc.num.indexOf(v) !== i);
  if (dupNum.length) fail(`${lesson} num 정답 중복: ${[...new Set(dupNum)].join(",")}`);
  // 레슨 내 같은 관계식 중복 노출(부품·문두) — 값 기준, 다른 문항끼리면 WARN(사람 판정)
  const seenRel = new Map();
  for (const entry of acc.rel) {
    const [id, key] = entry.split(":");
    if (seenRel.has(key) && seenRel.get(key) !== id) warn(`${lesson} 관계식 ${key} 중복 노출: ${seenRel.get(key)} ↔ ${id}`);
    else seenRel.set(key, id);
  }
}

if (!partial) {
  for (let i = 1; i <= 200; i++) if (!ids.has(`m1u3e${String(i).padStart(3, "0")}`)) fail(`m1u3e${String(i).padStart(3, "0")} 누락`);
  const figured = pool.filter((it) => it.figure).length;
  console.log(`전체 ${pool.length}문항 · 그림 ${figured}(${Math.round((figured / pool.length) * 100)}%)`);
} else {
  console.log(`부분 검증 모드: ${present.map(([p]) => p.replace("qa/m1u3v2-", "").replace(".ts", "")).join("·")} — ${pool.length}문항`);
}
if (fails) { console.error(`\n${fails} FAIL, ${warns} WARN`); process.exit(1); }
console.log(`검증 ALL PASS (${warns} WARN)\n`);

// ── 시험지 렌더(전 파일 존재 시에만) ──
if (partial) process.exit(0);
const CIRC = ["①", "②", "③", "④", "⑤"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const cards = pool.map((it, i) => {
  const slot = it.id.replace("m1u3e", "");
  const pilot = ["001", "005", "009", "012", "023", "024", "033", "034", "045", "047", "051", "054", "058", "070", "071", "072", "075", "084", "090", "095", "099", "108", "113", "116", "119", "130", "131", "134", "141", "147", "155", "158", "161", "163", "165", "181", "183", "184", "194", "199"].includes(slot);
  const tag = `슬롯 ${slot} · ${it.lessonId.replace("m1u3", "")} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}${pilot ? " · 파일럿" : ""}`;
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
<title>m1u3 v2 200문항 · 검수용 시험지</title>
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
  <h1>중1 수학 Ⅲ. 좌표평면과 그래프 · v2 200문항 전량 교체분</h1>
  <p>검수용 시험지 렌더 · 교과서 준거 규격 v2(그림 105/200 = 52.5% 실측 정합 · word 0 · '함수' 미도입
  언어 가드 · 반비례 두 갈래 · 판독값 눈금 위) · 슬롯 번호 = 이식 후 문항 id. 실제 앱에서는 20문항씩
  추출되고 해설은 제출 후에만 보여요.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/m1u3v2-full", { recursive: true });
writeFileSync("tmp/m1u3v2-full/index.html", html);
for (const f of ["stix-two-italic-latin.woff2", "stix-two-italic-greek.woff2"])
  copyFileSync(`src/styles/fonts/${f}`, `tmp/m1u3v2-full/${f}`);
console.log(`렌더 완료: tmp/m1u3v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${pool.length}, 변수 서체 번들 복사)`);
