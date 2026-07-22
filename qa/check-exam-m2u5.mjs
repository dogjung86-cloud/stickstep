// m2u5(중2 수학 Ⅴ) 단원 종합 평가 200제 기계 검사 v2 — 2026-07 교과서 준거 재출제판.
// v1에서 바뀐 것(정본 = qa/m2u5-v2-blueprint.md):
// ① 유형 쿼터 word 0(교과서 실측 0~6% 계승): 18문항 = mcq 9+multi 2+num 7 · 19문항(L4·L10) = 10+2+7.
// ② **그림 쿼터 기계 검사 첫 도입** — 전체 ≥150(75%) + 파일별 정확값(figSpec, 무그림은 전부
//    화이트리스트 사유 보유분만). 그림 부족으로 저작이 텍스트로 도피하는 구조를 기계가 차단한다.
// ③ diff 배분 갱신(합 80/80/40): L1 7/8/3 · L4·L10 8/8/3 · L11 8/7/3 · 나머지 7/7/4.
// ④ num 정답 파일 내 유일 강제(파일 간은 WARN 후보), 해설 250자+(태그 제거), 셔플 규칙.
// 유지: 금지어 표·이모지·raw 부등호·CRLF 정규화·em대시 전면 금지·자연수 num.
// node qa/check-exam-m2u5.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// [file, count, mcq, multi, num, diff[1,2,3], fig]
const specs = [
  ["m2u5l1", 18, 9, 2, 7, [7, 8, 3], 15],
  ["m2u5l2", 18, 9, 2, 7, [7, 7, 4], 14],
  ["m2u5l3", 18, 9, 2, 7, [7, 7, 4], 15],
  ["m2u5l4", 19, 10, 2, 7, [8, 8, 3], 16],
  ["m2u5l5", 18, 9, 2, 7, [7, 7, 4], 18],
  ["m2u5l6", 18, 9, 2, 7, [7, 7, 4], 18],
  ["m2u5l7", 18, 9, 2, 7, [7, 7, 4], 18],
  ["m2u5l8", 18, 9, 2, 7, [7, 7, 4], 18],
  ["m2u5l9", 18, 9, 2, 7, [7, 7, 4], 17],
  ["m2u5l10", 19, 10, 2, 7, [8, 8, 3], 19],
  ["m2u5l11", 18, 9, 2, 7, [8, 7, 3], 5],
];
const FIG_TOTAL_MIN = 150;

let failures = 0;
const warns = [];
const fail = (m) => { failures += 1; console.error("FAIL", m); };
const warn = (m) => warns.push(m);
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

async function loadPool(file) {
  const entry = `src/content/exams/${file}.ts`;
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  const key = Object.keys(mod).find((n) => n.startsWith("POOL_"));
  if (!key || !Array.isArray(mod[key])) throw new Error(`${entry}: POOL export를 찾지 못함`);
  return mod[key];
}

const all = [];
let figTotal = 0;
for (const [file, count, mcqCount, multiCount, numCount, diffSpec, figSpec] of specs) {
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  for (const word of [
    "√", "제곱근", "근호", "무리수", "삼각비", "원주각",
    "닮음의 중심", "닮음의 위치", "이등분선 정리",
    "역이 성립", "역은 성립", "역도 성립", "의 역도", "의 역은", "의 역이",
    "좌표", "정의역", "치역", "이차방정식", "인수분해",
  ]) {
    if (source.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}⭕]/u.test(source.replace(/✓/g, ""))) fail(`${file}: 이모지 발견(판정 마커는 ✓)`);
  const scanSrc = source.replace(/\/\/[^\n]*/g, "");
  for (const m of scanSrc.matchAll(/[^=<']<([a-z][a-z0-9]*)\b/g)) {
    if (!["b", "br", "i", "span", "svg", "path", "circle", "ellipse", "line", "rect", "text", "g", "defs", "marker", "polygon", "polyline", "tspan", "sup", "sub"].includes(m[1]))
      warn(`${file}: 미확인 태그 후보 <${m[1]}`);
  }

  const pool = await loadPool(file);
  if (pool.length !== count) fail(`${file}: ${pool.length}문항 ≠ ${count}`);
  const by = { mcq: 0, multi: 0, num: 0, word: 0 };
  const byDiff = { 1: 0, 2: 0, 3: 0 };
  let fig = 0;
  const numAnswers = [];
  for (const it of pool) {
    by[it.type] = (by[it.type] ?? 0) + 1;
    byDiff[it.diff] = (byDiff[it.diff] ?? 0) + 1;
    if (it.figure) {
      fig += 1;
      if (!String(it.figure).startsWith("<svg")) fail(`${it.id}: figure가 SVG 문자열이 아님`);
      if (it.figureDark) fail(`${it.id}: figureDark 금지(수학 시험은 밝은 그림)`);
    }
    if (it.type === "word") fail(`${it.id}: word 유형 금지(규격 v2)`);
    if (it.type !== "num") {
      if (!it.options || it.options.length !== 5) fail(`${it.id}: 보기 ${it.options?.length ?? 0}개(5지 고정)`);
      if (it.shuffle === false && it.answer === 0) fail(`${it.id}: shuffle:false 첫 보기 정답`);
    }
    if (it.type === "mcq" && (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4)) fail(`${it.id}: mcq answer 범위`);
    if (it.type === "multi" && (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.some((a) => a < 0 || a > 4))) fail(`${it.id}: multi answer`);
    if (it.type === "num") {
      if (!/^\d+$/.test(String(it.answer))) fail(`${it.id}: num answer "${it.answer}"(자연수 강제)`);
      numAnswers.push(String(it.answer));
    }
    const exp = plain(it.explain);
    if (exp.length < 250) fail(`${it.id}: 해설 ${exp.length}자 < 250`);
    if (exp.length > 460) warn(`${it.id}: 해설 ${exp.length}자 > 450`);
    if (!it.core) fail(`${it.id}: core 없음`);
    if (!/^m2u5l\d+$/.test(it.lessonId) || it.lessonId !== file) fail(`${it.id}: lessonId ${it.lessonId} ≠ ${file}`);
  }
  if (by.mcq !== mcqCount || by.multi !== multiCount || by.num !== numCount) fail(`${file}: 유형 ${by.mcq}/${by.multi}/${by.num} ≠ ${mcqCount}/${multiCount}/${numCount}`);
  if ([1, 2, 3].map((k) => byDiff[k]).join() !== diffSpec.join()) fail(`${file}: diff ${byDiff[1]}/${byDiff[2]}/${byDiff[3]} ≠ ${diffSpec.join("/")}`);
  if (fig !== figSpec) fail(`${file}: 그림 ${fig}문항 ≠ ${figSpec}(무그림 신설·삭제는 blueprint 화이트리스트 갱신과 세트)`);
  figTotal += fig;
  const dupNum = numAnswers.filter((v, i) => numAnswers.indexOf(v) !== i);
  if (dupNum.length) fail(`${file}: num 정답 파일 내 중복 ${dupNum.join(",")}`);
  all.push(...pool);
}

if (all.length !== 200) fail(`총 ${all.length}문항 ≠ 200`);
if (figTotal < FIG_TOTAL_MIN) fail(`그림 쿼터 미달: ${figTotal} < ${FIG_TOTAL_MIN}`);
const ids = new Set(all.map((i) => i.id));
if (ids.size !== all.length) fail("id 중복");
// 문두 정확 중복(파일 간 포함) — 그림 문항끼리의 최소 발문("그림에서 x를 구하세요") 반복은
// 교과서 표준이라 WARN(그림이 문항을 구분), 무그림이 끼면 FAIL. num 정답 파일 간 중복도 WARN 후보.
const promptSeen = new Map();
for (const it of all) {
  const p = plain(it.prompt);
  if (promptSeen.has(p)) {
    const prev = promptSeen.get(p);
    if (it.figure && prev.figure) warn(`${it.id}: 문두가 ${prev.id}와 동일(둘 다 그림 문항 — 교과서 반복 문형, 수용)`);
    else fail(`${it.id}: 문두가 ${prev.id}와 정확히 중복(무그림 포함 — 동형 신호)`);
  } else promptSeen.set(p, it);
}
const numByVal = new Map();
for (const it of all) {
  if (it.type !== "num") continue;
  const v = String(it.answer);
  if (numByVal.has(v)) warn(`num 정답 ${v}: ${numByVal.get(v)} ↔ ${it.id}(파일 간 — 후보만, 수동 판정)`);
  else numByVal.set(v, it.id);
}

console.log(`총 ${all.length}문항 · 그림 ${figTotal}/200 (${Math.round(figTotal / 2)}%)`);
if (warns.length) {
  console.log(`\nWARN ${warns.length}건:`);
  for (const w of warns) console.log("  -", w);
}
if (failures) {
  console.error(`\n${failures} FAIL`);
  process.exit(1);
}
console.log("\nALL PASS");
