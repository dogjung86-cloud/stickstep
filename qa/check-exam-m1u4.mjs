// m1u4(중1 수학 Ⅳ 기본 도형) 시험 풀 기계 검사.
// node qa/check-exam-m1u4.mjs
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const files = Array.from({ length: 13 }, (_, i) => `m1u4l${i + 1}`);
const totals = [15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16];
const typeQuota = [
  [9, 5, 1], [9, 5, 1], [9, 4, 2], [9, 4, 2], [9, 5, 1], [9, 4, 2], [9, 5, 1],
  [9, 4, 2], [9, 5, 2], [10, 5, 1], [10, 4, 2], [10, 5, 1], [9, 5, 2],
];
// diff 배분(2026.07 개보수): 균일 쿼터를 폐기하고 내용 기준으로 재캘리브레이션(MATH_GUIDE 규격 항목 참조).
// 전체 합 80/80/40 불변 — 아래 배열이 레슨별 확정값이다(L7·L9·L11은 공간·평행선·결정조건이라 심화 4).
const diffQuota = [
  [6, 7, 2], [7, 5, 3], [6, 7, 2], [6, 6, 3], [6, 6, 3], [6, 6, 3], [6, 5, 4],
  [6, 6, 3], [6, 6, 4], [6, 7, 3], [6, 6, 4], [7, 6, 3], [6, 7, 3],
];
let bad = 0;
const warnings = [];
const fail = (m) => { console.error("FAIL", m); bad++; };
const warn = (m) => warnings.push(m);
const strip = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const runtimeText = (it) => [it.prompt, ...(it.bogi ?? []), ...(it.options ?? []), it.explain, it.core].map(strip).join(" ");

const sources = new Map();
for (const f of files) {
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8");
  sources.set(f, src);
  const em = [...src.matchAll(/—/g)].length;
  if (em) fail(`${f}: em대시 ${em}건`);
  for (const w of ["기울기", "닮음", "피타고라스", "삼각비", "원주각", "벡터", "좌표기하", "무리수"]) {
    if (src.includes(w)) fail(`${f}: 금지어 "${w}"`);
  }
  if (/\d\s*-\s*\d/.test(src)) warn(`${f}: ASCII 하이픈 뺄셈 후보, U+2212 여부 수동 확인`);
  if (/[↔―]/.test(src.replaceAll('"line"', "").replaceAll('"ray"', "").replaceAll('"seg"', ""))) {
    warn(`${f}: 직접 입력 기하 기호 후보, gsym 사용 여부 확인`);
  }
}

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const pools = [];
for (let i = 0; i < files.length; i++) {
  const mod = await vite.ssrLoadModule(`/src/content/exams/${files[i]}.ts`);
  const pool = mod[`POOL_M1U4L${i + 1}`];
  if (!Array.isArray(pool)) { fail(`${files[i]}: POOL export 없음`); continue; }
  pools.push(pool);
}
await vite.close();
const all = pools.flat();

if (all.length !== 200) fail(`총 문항 ${all.length} != 200`);
const ids = all.map((it) => it.id);
if (new Set(ids).size !== ids.length) fail("ID 중복");
for (let i = 0; i < all.length; i++) {
  const want = `m1u4e${String(i + 1).padStart(3, "0")}`;
  if (all[i].id !== want) fail(`ID 연번 ${all[i].id}, 기대 ${want}`);
}

for (let li = 0; li < pools.length; li++) {
  const pool = pools[li];
  const lid = `m1u4l${li + 1}`;
  if (pool.length !== totals[li]) fail(`${lid}: ${pool.length}문항, 기대 ${totals[li]}`);
  for (const it of pool) if (it.lessonId !== lid) fail(`${it.id}: lessonId ${it.lessonId}, 기대 ${lid}`);
  const mcqMulti = pool.filter((it) => it.type === "mcq" || it.type === "multi").length;
  const num = pool.filter((it) => it.type === "num").length;
  const word = pool.filter((it) => it.type === "word").length;
  if ([mcqMulti, num, word].join("/") !== typeQuota[li].join("/")) fail(`${lid}: 유형 ${mcqMulti}/${num}/${word}`);
  const dc = [1, 2, 3].map((d) => pool.filter((it) => it.diff === d).length);
  if (dc.join("/") !== diffQuota[li].join("/")) fail(`${lid}: diff ${dc.join("/")}`);
}

const typeTotal = {
  mcqMulti: all.filter((it) => it.type === "mcq" || it.type === "multi").length,
  num: all.filter((it) => it.type === "num").length,
  word: all.filter((it) => it.type === "word").length,
};
if ([typeTotal.mcqMulti, typeTotal.num, typeTotal.word].join("/") !== "120/60/20") fail(`전체 유형 ${JSON.stringify(typeTotal)}`);
const diffTotal = [1, 2, 3].map((d) => all.filter((it) => it.diff === d).length);
if (diffTotal.join("/") !== "80/80/40") fail(`전체 diff ${diffTotal.join("/")}`);

for (const it of all) {
  const plainExplain = strip(it.explain);
  if (plainExplain.length < 250 || plainExplain.length > 450) fail(`${it.id}: 해설 ${plainExplain.length}자`);
  if (![1, 2, 3].includes(it.diff)) fail(`${it.id}: diff 없음/오류`);
  const text = runtimeText(it);
  if (/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/.test(text)) fail(`${it.id}: 본문 로마 숫자 후보`);
  if (text.includes("—")) fail(`${it.id}: 런타임 em대시`);

  if (it.type === "mcq") {
    if (!Array.isArray(it.options) || it.options.length !== 5) fail(`${it.id}: mcq 선택지 5개 아님`);
    if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id}: answer 인덱스 오류`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.options) || it.options.length !== 5) fail(`${it.id}: multi 선택지 5개 아님`);
    if (!Array.isArray(it.answer) || !it.answer.length || new Set(it.answer).size !== it.answer.length) fail(`${it.id}: multi answer 오류`);
    for (const a of it.answer ?? []) if (!Number.isInteger(a) || a < 0 || a >= (it.options?.length ?? 0)) fail(`${it.id}: multi 인덱스 ${a}`);
  }
  if ((it.type === "mcq" || it.type === "multi") && new Set((it.options ?? []).map(strip)).size !== (it.options ?? []).length) {
    fail(`${it.id}: 중복 선택지`);
  }
  if (it.shuffle === false && it.answer === 0) fail(`${it.id}: shuffle:false && answer 0`);

  if (it.type === "num") {
    if (typeof it.answer !== "string") fail(`${it.id}: num answer 문자열 아님`);
    const kind = it.numKind ?? "int";
    if (!['int', 'dec'].includes(kind)) fail(`${it.id}: numKind ${kind}`);
    if (kind === "int" && !/^\d+$/.test(String(it.answer))) fail(`${it.id}: int 형식 ${it.answer}`);
    if (kind === "dec" && !/^\d+\.\d+$/.test(String(it.answer))) fail(`${it.id}: dec 형식 ${it.answer}`);
    // MATH_GUIDE: x의 값처럼 무단위인 답은 unitLabel 생략(2026-07 개보수 — 각도 방정식 신작 2건).
    if (!it.unitLabel && !/의 값을 구하세요/.test(strip(it.prompt))) fail(`${it.id}: num unitLabel 없음`);
  }
  if (it.type === "word") {
    if (!Array.isArray(it.bank) || it.bank.length < 8 || it.bank.length > 10) fail(`${it.id}: bank 8~10 위반`);
    if (it.bank?.[0] !== it.answer) fail(`${it.id}: word answer != bank[0]`);
    if (new Set(it.bank).size !== it.bank.length) fail(`${it.id}: bank 중복`);
  }

  if (it.figure && !/^<svg[\s>]/.test(it.figure.trim())) fail(`${it.id}: figure가 SVG 아님`);
  if (it.figure && /aria-label=["'][^"']*(정답|옳은|같은 각|평행한 선은)/.test(it.figure)) warn(`${it.id}: figure aria-label 정답 단서 후보`);
  if (it.figure && String(it.answer).length && new RegExp(`aria-label=["'][^"']*${String(it.answer).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(it.figure)) {
    warn(`${it.id}: aria-label에 정답값 후보`);
  }
}

const pos = [0, 1, 2, 3, 4].map((p) => all.filter((it) => it.type === "mcq" && it.answer === p).length);
if (Math.max(...pos) - Math.min(...pos) > 6) fail(`mcq 정답 위치 편중 ${pos.join("/")}`);

const norm = (s) => strip(s).toLowerCase().replace(/\d+(?:\.\d+)?/g, "#").replace(/[a-z]/g, "x").replace(/\s+/g, "");
const grams = (s) => new Set(Array.from({ length: Math.max(0, s.length - 1) }, (_, i) => s.slice(i, i + 2)));
const jac = (a, b) => {
  const A = grams(norm(a)), B = grams(norm(b));
  if (!A.size || !B.size) return 0;
  let n = 0; for (const x of A) if (B.has(x)) n++;
  return n / (A.size + B.size - n);
};
const similar = [];
for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
  const score = jac(all[i].prompt, all[j].prompt);
  if (score >= 0.82) similar.push([all[i].id, all[j].id, Number(score.toFixed(2))]);
}

const figCalls = [];
for (const [file, src] of sources) {
  for (const m of src.matchAll(/figure:\s*([A-Za-z_]\w*)\(([^\n]*)\)/g)) figCalls.push([file, m[1], m[2].trim()]);
}
const figKey = new Map();
for (const row of figCalls) {
  const key = `${row[1]}(${row[2]})`;
  if (figKey.has(key)) warn(`동일 figure 호출 ${key}: ${figKey.get(key)}, ${row[0]}`);
  else figKey.set(key, row[0]);
}

console.log("counts:", JSON.stringify(typeTotal), "total:", all.length);
console.log("diff:", diffTotal.join("/"));
console.log("per lesson:", pools.map((p) => p.length).join("/"));
console.log("mcq answer positions:", pos.join("/"));
console.log("figures:", all.filter((it) => it.figure).length, "calls:", figCalls.length);
console.log("similarity candidates:", JSON.stringify(similar));
for (const w of warnings) console.log("WARN", w);
console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad ? 1 : 0);
