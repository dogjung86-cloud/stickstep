// m1u5(중1 수학 Ⅴ 평면도형과 입체도형) 단원 종합 평가 200제 기계 검사 · v2(2026-07 교과서 준거 재출제).
// v1(obj/num/word 합산·word 20)에서 규격 교체: 레슨별 mcq/multi/num 분리 배분(word 0 = FAIL),
// diff는 현행 계승(80/80/40), **그림 파일별 정확값**(합 139 · 정본 qa/m1u5-v2-blueprint.md §4)+전체 ≥132,
// 금지어에 닮음·원주각·중선·동측내각·기울기·무리수·√ 추가(**내각·외각·중심각은 이 단원 도입어라 절대
// 금지 목록에 넣지 말 것** · m1u4 검사기 복사 금지), num unitLabel은 "의 값을 구하세요" 부품 문항만 면제.
// node qa/check-exam-m1u5.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// [file, count, mcq, multi, num, word, diff[1,2,3], figures]
const specs = [
  ["m1u5l1", 14, 6, 2, 6, 0, [6, 5, 3], 6],
  ["m1u5l2", 14, 5, 2, 7, 0, [5, 6, 3], 13],
  ["m1u5l3", 14, 6, 2, 6, 0, [6, 5, 3], 7],
  ["m1u5l4", 14, 6, 2, 6, 0, [5, 6, 3], 10],
  ["m1u5l5", 14, 8, 2, 4, 0, [6, 6, 2], 12],
  ["m1u5l6", 14, 7, 2, 5, 0, [5, 6, 3], 12],
  ["m1u5l7", 15, 6, 2, 7, 0, [6, 6, 3], 12],
  ["m1u5l8", 14, 6, 2, 6, 0, [6, 5, 3], 7],
  ["m1u5l9", 14, 7, 2, 5, 0, [5, 6, 3], 2],
  ["m1u5l10", 14, 8, 2, 4, 0, [6, 6, 2], 13],
  ["m1u5l11", 15, 6, 2, 7, 0, [6, 6, 3], 12],
  ["m1u5l12", 15, 6, 2, 7, 0, [6, 6, 3], 13],
  ["m1u5l13", 15, 6, 2, 7, 0, [6, 6, 3], 9],
  ["m1u5l14", 14, 6, 2, 6, 0, [6, 5, 3], 11],
];
const START_ID = [1, 15, 29, 43, 57, 71, 85, 100, 114, 128, 142, 157, 172, 187];

let failures = 0;
const warns = [];
const fail = (message) => {
  failures += 1;
  console.error("FAIL", message);
};
const warn = (message) => warns.push(message);
const plain = (value) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const visibleText = (item) =>
  [item.prompt, ...(item.options ?? []), item.explain, item.core, ...(item.bank ?? [])].map(plain).join(" ");

async function loadPool(file) {
  const entry = `src/content/exams/${file}.ts`;
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString("base64");
  const mod = await import(`data:text/javascript;base64,${encoded}`);
  const key = Object.keys(mod).find((name) => name.startsWith("POOL_"));
  if (!key || !Array.isArray(mod[key])) throw new Error(`${entry}: POOL export를 찾지 못함`);
  return mod[key];
}

const all = [];
for (const [file, count, mcqCount, multiCount, numCount, wordCount, diffSpec, figCount] of specs) {
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  // 언어 가드(§0): 위학년 용어 금지. 내각·외각·중심각·엇각은 이 단원 도입어라 검사하지 않는다.
  for (const word of ["닮음", "피타고라스", "삼각비", "원주각", "중선", "동측내각", "기울기", "무리수", "√", "구분구적", "미적분", "좌표기하", "호도법", "벡터"]) {
    if (source.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
  if (/[ⅠⅡⅢⅣⅥⅦⅧⅨⅩ]/.test(source.replace(/^\/\/.*$/gm, ""))) fail(`${file}: 주석 밖 로마 숫자 후보`);
  if (/<i>(?!<)/.test(source)) fail(`${file}: 맨몸 <i> 발견(변수는 <i class='mv'>x</i>)`);

  const pool = await loadPool(file);
  if (pool.length !== count) fail(`${file}: ${pool.length}문항, 기대 ${count}`);

  const types = { mcq: 0, multi: 0, num: 0, word: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  const mcqPositions = [0, 0, 0, 0, 0];
  let figures = 0;
  const numSeen = new Map();
  for (const item of pool) {
    item.__file = file;
    all.push(item);
    if (!(item.type in types)) fail(`${item.id}: 알 수 없는 type ${item.type}`);
    else types[item.type] += 1;
    if (![1, 2, 3].includes(item.diff)) fail(`${item.id}: diff가 1|2|3이 아님`);
    else diffs[item.diff] += 1;
    if (item.lessonId !== file) fail(`${item.id}: lessonId ${item.lessonId}, 기대 ${file}`);
    if (item.figure) {
      figures += 1;
      if (!String(item.figure).startsWith("<svg")) fail(`${item.id}: figure가 SVG가 아님`);
      if (item.figureDark) fail(`${item.id}: figureDark 금지(수학 그림은 밝은 배경)`);
    }

    const expLen = plain(item.explain).length;
    if (expLen < 250 || expLen > 450) fail(`${item.id}: 해설 ${expLen}자, 250~450자 필요`);
    if (!String(item.explain).includes("class='xh'")) fail(`${item.id}: xh 소제목 없음`);
    if (!item.core) fail(`${item.id}: core 없음`);
    const text = visibleText(item);
    if (/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/.test(text)) fail(`${item.id}: 노출 텍스트에 로마 숫자`);
    if (/(^|[^0-9a-zA-Z])-(?=\d|[a-z])/i.test(text)) fail(`${item.id}: ASCII 하이픈 음수 후보(U+2212 필요)`);

    if (item.type === "mcq" || item.type === "multi") {
      if (!Array.isArray(item.options) || item.options.length !== 5) fail(`${item.id}: 선택형 options가 5개가 아님`);
      if (new Set(item.options ?? []).size !== (item.options ?? []).length) fail(`${item.id}: 선택지 문자열 중복`);
      if (item.type === "mcq") {
        if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= 5) fail(`${item.id}: mcq answer 인덱스 오류 ${item.answer}`);
        else mcqPositions[item.answer] += 1;
        if (item.shuffle === false && item.answer === 0) fail(`${item.id}: shuffle:false인데 첫 선택지가 정답`);
      } else {
        if (!Array.isArray(item.answer) || item.answer.length < 2 || item.answer.length > 3)
          fail(`${item.id}: multi answer는 2~3개 인덱스 배열이어야 함`);
        else {
          const sorted = [...item.answer].sort((a, b) => a - b);
          if (new Set(sorted).size !== sorted.length || sorted.some((n) => !Number.isInteger(n) || n < 0 || n >= 5))
            fail(`${item.id}: multi answer 인덱스 오류 ${JSON.stringify(item.answer)}`);
          if (JSON.stringify(sorted) !== JSON.stringify(item.answer)) fail(`${item.id}: multi answer 인덱스가 오름차순이 아님`);
        }
      }
    } else if (item.type === "num") {
      if (typeof item.answer !== "string") fail(`${item.id}: num answer는 문자열이어야 함`);
      const kind = item.numKind ?? "int";
      if (kind !== "int") fail(`${item.id}: numKind ${kind}, v2는 int만`);
      if (!/^\d+$/.test(String(item.answer))) fail(`${item.id}: int 정답 형식 오류 ${item.answer}(음수·소수 없음)`);
      if (/π|pi/i.test(String(item.answer))) fail(`${item.id}: num 답에 π 포함`);
      if (Math.abs(parseFloat(item.answer)) > 9999) fail(`${item.id}: 정답 절댓값 4자리 초과(넘패드 슬롯 제한)`);
      // π 부품 문항("aπ ...일 때 a의 값")만 unitLabel 면제(§0 발문 표준).
      if (!item.unitLabel && !/의 값을 구하세요/.test(plain(item.prompt))) fail(`${item.id}: num unitLabel 없음(면제 문구도 없음)`);
      const numKey = String(item.answer);
      if (numSeen.has(numKey)) fail(`${file}: num 정답 중복 ${numKey}: ${numSeen.get(numKey)} ↔ ${item.id}`);
      numSeen.set(numKey, item.id);
    } else if (item.type === "word") {
      fail(`${item.id}: v2는 word 0(용어 빈칸형 폐기)`);
    }
  }

  if (types.mcq !== mcqCount) fail(`${file}: mcq ${types.mcq}, 기대 ${mcqCount}`);
  if (types.multi !== multiCount) fail(`${file}: multi ${types.multi}, 기대 ${multiCount}`);
  if (types.num !== numCount) fail(`${file}: num ${types.num}, 기대 ${numCount}`);
  if (types.word !== wordCount) fail(`${file}: word ${types.word}, 기대 ${wordCount}`);
  if (diffs[1] !== diffSpec[0] || diffs[2] !== diffSpec[1] || diffs[3] !== diffSpec[2])
    fail(`${file}: diff ${diffs[1]}/${diffs[2]}/${diffs[3]}, 기대 ${diffSpec.join("/")}`);
  if (figures !== figCount) fail(`${file}: 그림 ${figures}문항, 기대 ${figCount}(설계표 §4 정본)`);
  const used = mcqPositions.filter((n) => n > 0);
  if (used.length && Math.max(...mcqPositions) - Math.min(...mcqPositions) > 3)
    warn(`${file}: mcq 정답 위치 ${mcqPositions.join("/")} 수동 확인(표시 셔플이 있어 로그 강등)`);
  console.log(`${file}:`, JSON.stringify({ count: pool.length, types, diffs, figures }));
}

// 전역: ID 연번(레슨 시작 번호 §0 startId 계승)·총량·그림 하한
if (all.length !== 200) fail(`전체 ${all.length}문항, 기대 200`);
const ids = all.map((item) => item.id);
if (new Set(ids).size !== ids.length) fail("ID 중복 존재");
let cursor = 0;
specs.forEach(([file, count], li) => {
  for (let i = 0; i < count; i += 1) {
    const want = `m1u5e${String(START_ID[li] + i).padStart(3, "0")}`;
    if (ids[cursor] !== want) fail(`ID 연번 오류: 위치 ${cursor + 1}=${ids[cursor]}, 기대 ${want}`);
    cursor += 1;
  }
});

const totalTypes = { mcq: 0, multi: 0, num: 0, word: 0 };
const totalDiffs = { 1: 0, 2: 0, 3: 0 };
let totalFigures = 0;
for (const item of all) {
  totalTypes[item.type] += 1;
  totalDiffs[item.diff] += 1;
  if (item.figure) totalFigures += 1;
}
if (totalTypes.mcq !== 89 || totalTypes.multi !== 28 || totalTypes.num !== 83 || totalTypes.word !== 0)
  fail(`전체 유형 ${totalTypes.mcq}/${totalTypes.multi}/${totalTypes.num}/${totalTypes.word}, 기대 89/28/83/0`);
if (totalDiffs[1] !== 80 || totalDiffs[2] !== 80 || totalDiffs[3] !== 40)
  fail(`전체 diff ${totalDiffs[1]}/${totalDiffs[2]}/${totalDiffs[3]}, 기대 80/80/40`);
if (totalFigures < 132) fail(`그림 ${totalFigures}문항 < 기계 하한 132(설계 139)`);

// 파일 간 num 값·단위 일치 후보(과제가 다른지 수동 판정 · m2u3 관행)
const numGlobal = new Map();
for (const item of all.filter((a) => a.type === "num")) {
  const v = `${item.answer}|${item.unitLabel ?? ""}`;
  if (numGlobal.has(v)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(v)} ↔ ${item.id} (${v})`);
  else numGlobal.set(v, item.id);
}
// mcq/multi 정답 보기 문구(10자+) 파일 간 일치 후보
const optAns = new Map();
for (const item of all.filter((a) => a.type === "mcq" || a.type === "multi")) {
  const idxs = item.type === "mcq" ? [item.answer] : item.answer;
  for (const i of idxs ?? []) {
    const t = plain((item.options ?? [])[i]);
    if (!t || t.length < 10) continue;
    if (optAns.has(t)) warn(`정답 보기 문구 일치 후보: ${optAns.get(t)} ↔ ${item.id} "${t.slice(0, 30)}"`);
    else optAns.set(t, item.id);
  }
}

// 문두 정확 중복: 그림 문항끼리면 WARN(교과서 반복 문형 수용 · m2u5 계승), 무그림이 끼면 FAIL.
const exactPrompts = new Map();
for (const item of all) {
  const p = plain(item.prompt);
  if (exactPrompts.has(p)) {
    const prev = exactPrompts.get(p);
    if (prev.figure && item.figure) warn(`문두 정확 중복(그림 문항끼리 · 수용): ${prev.id}/${item.id}`);
    else fail(`${item.id}/${prev.id}: 문두 정확 중복`);
  } else exactPrompts.set(p, { id: item.id, figure: !!item.figure });
}
// figure 호출 문자열 일치(같은 표준 그림 반복은 질문이 다르면 수용 · WARN)
const figSeen = new Map();
for (const item of all.filter((a) => a.figure)) {
  const key = String(item.figure);
  if (figSeen.has(key)) warn(`figure 동일 렌더 반복: ${figSeen.get(key)} ↔ ${item.id}(질문 다르면 수용)`);
  else figSeen.set(key, item.id);
}

// 문두 유사도 후보(참고용)
const normalized = (item) =>
  plain(item.prompt)
    .replace(/[−-]?\d+(?:[.,]\d+)*/g, "#")
    .replace(/\b[a-z]\b/gi, "v")
    .replace(/\s+/g, " ")
    .trim();
const grams = (s) => {
  const compact = s.replace(/\s/g, "");
  const out = new Set();
  for (let i = 0; i < compact.length - 1; i += 1) out.add(compact.slice(i, i + 2));
  return out;
};
const jaccard = (a, b) => {
  let hit = 0;
  for (const v of a) if (b.has(v)) hit += 1;
  return hit / (a.size + b.size - hit || 1);
};
const normed = all.map((item) => grams(normalized(item)));
for (let i = 0; i < all.length; i += 1) {
  for (let j = i + 1; j < all.length; j += 1) {
    const score = jaccard(normed[i], normed[j]);
    if (score >= 0.88) warn(`문두 유사도 ${score.toFixed(2)}: ${all[i].id}/${all[j].id}`);
  }
}

console.log("totals:", JSON.stringify({ count: all.length, types: totalTypes, diffs: totalDiffs, figures: totalFigures }));
for (const message of [...new Set(warns)]) console.log("WARN", message);
console.log(failures === 0 ? `ALL PASS (${warns.length} candidate warnings)` : `${failures} FAIL(S)`);
process.exit(failures === 0 ? 0 : 1);
