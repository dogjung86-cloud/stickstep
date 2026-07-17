// m1u2(중1 수학 II 문자와 식) 단원 종합 평가 200제 기계 검사.
// node qa/check-exam-m1u2.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// diff 배분(2026-07 개보수): 레슨별 균일 쿼터(9/9/4대)를 폐기하고 내용 기준으로 재캘리브레이션.
// 표현·개념 레슨(L1·L6)은 기초가 많고 방정식 풀이·활용(L8·L9)은 심화가 몰리는 게 자연스럽다.
// 전체 합 80/80/40(40/40/20%)은 불변 — 아래 배열이 레슨별 확정값이다.
const specs = [
  ["m1u2l1", 22, 13, 7, 2, [9, 11, 2]],
  ["m1u2l2", 22, 14, 6, 2, [10, 8, 4]],
  ["m1u2l3", 22, 13, 7, 2, [9, 10, 3]],
  ["m1u2l4", 22, 14, 6, 2, [9, 8, 5]],
  ["m1u2l5", 22, 13, 7, 2, [8, 8, 6]],
  ["m1u2l6", 22, 14, 6, 2, [10, 10, 2]],
  ["m1u2l7", 22, 13, 7, 2, [9, 9, 4]],
  ["m1u2l8", 23, 13, 7, 3, [9, 7, 7]],
  ["m1u2l9", 23, 13, 7, 3, [7, 9, 7]],
];

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
  [item.prompt, ...(item.options ?? []), item.explain, item.core, ...(item.bank ?? [])]
    .map(plain)
    .join(" ");

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
for (const [file, count, choiceCount, numCount, wordCount, diffSpec] of specs) {
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견`);
  if (source.includes("Ⅰ")) fail(`${file}: 금지 로마 숫자 Ⅰ 발견`);

  const pool = await loadPool(file);
  if (pool.length !== count) fail(`${file}: ${pool.length}문항, 기대 ${count}`);

  const types = { mcq: 0, multi: 0, num: 0, word: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  const mcqPositions = [0, 0, 0, 0, 0];
  for (const item of pool) {
    item.__file = file;
    all.push(item);
    if (!(item.type in types)) fail(`${item.id}: 알 수 없는 type ${item.type}`);
    else types[item.type] += 1;
    if (![1, 2, 3].includes(item.diff)) fail(`${item.id}: diff가 1|2|3이 아님`);
    else diffs[item.diff] += 1;
    if (item.lessonId !== file) fail(`${item.id}: lessonId ${item.lessonId}, 기대 ${file}`);

    const expLen = plain(item.explain).length;
    if (expLen < 250 || expLen > 450) fail(`${item.id}: 해설 ${expLen}자, 250~450자 필요`);
    const text = visibleText(item);
    if (/(^|[^\w])-(?=\d|[a-z])/i.test(text)) fail(`${item.id}: 노출 수식에 ASCII 하이픈 음수 후보`);
    if (/근의 공식|이차방정식|연립방정식/.test(text)) fail(`${item.id}: 중1 범위 밖 용어 후보`);

    if (item.type === "mcq" || item.type === "multi") {
      if (!Array.isArray(item.options) || item.options.length !== 5)
        fail(`${item.id}: 선택형 options가 5개가 아님`);
      if (new Set(item.options ?? []).size !== (item.options ?? []).length)
        fail(`${item.id}: 선택지 문자열 중복`);
      if (item.type === "mcq") {
        if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= 5)
          fail(`${item.id}: mcq answer 인덱스 오류 ${item.answer}`);
        else mcqPositions[item.answer] += 1;
        if (item.shuffle === false && item.answer === 0)
          fail(`${item.id}: shuffle:false인데 첫 선택지가 정답`);
      } else {
        if (!Array.isArray(item.answer) || item.answer.length < 2)
          fail(`${item.id}: multi answer는 2개 이상 인덱스 배열이어야 함`);
        else {
          const sorted = [...item.answer].sort((a, b) => a - b);
          if (new Set(sorted).size !== sorted.length || sorted.some((n) => !Number.isInteger(n) || n < 0 || n >= 5))
            fail(`${item.id}: multi answer 인덱스 오류 ${JSON.stringify(item.answer)}`);
          if (JSON.stringify(sorted) !== JSON.stringify(item.answer))
            fail(`${item.id}: multi answer 인덱스가 오름차순이 아님`);
        }
      }
    } else if (item.type === "num") {
      if (typeof item.answer !== "string") fail(`${item.id}: num answer는 문자열이어야 함`);
      const kind = item.numKind ?? "int";
      if (!['int', 'dec'].includes(kind)) fail(`${item.id}: numKind ${kind}, int/dec만 허용`);
      if (kind === "int" && !/^-?\d+$/.test(String(item.answer)))
        fail(`${item.id}: int 정답 형식 오류 ${item.answer}`);
      if (kind === "dec" && !/^-?\d+\.\d+$/.test(String(item.answer)))
        fail(`${item.id}: dec 정답 형식 오류 ${item.answer}`);
      if (/[\/⁄]/.test(String(item.answer))) fail(`${item.id}: num 분수 정답 금지`);
    } else if (item.type === "word") {
      if (!Array.isArray(item.bank)) fail(`${item.id}: word bank 없음`);
      else {
        if (item.bank.length < 8 || item.bank.length > 10)
          fail(`${item.id}: word bank ${item.bank.length}개, 8~10개 필요`);
        if (new Set(item.bank).size !== item.bank.length) fail(`${item.id}: word bank 중복`);
        if (item.bank[0] !== item.answer) fail(`${item.id}: answer가 bank[0]이 아님`);
      }
    }
  }

  if (types.mcq + types.multi !== choiceCount)
    fail(`${file}: mcq+multi ${types.mcq + types.multi}, 기대 ${choiceCount}`);
  if (types.num !== numCount) fail(`${file}: num ${types.num}, 기대 ${numCount}`);
  if (types.word !== wordCount) fail(`${file}: word ${types.word}, 기대 ${wordCount}`);
  if (diffs[1] !== diffSpec[0] || diffs[2] !== diffSpec[1] || diffs[3] !== diffSpec[2])
    fail(`${file}: diff ${diffs[1]}/${diffs[2]}/${diffs[3]}, 기대 ${diffSpec.join("/")}`);
  const used = mcqPositions.filter((n) => n > 0);
  if (used.length < 5 || Math.max(...used) - Math.min(...used) > 2)
    warn(`${file}: mcq 정답 위치 ${mcqPositions.join("/")} 수동 확인`);
  console.log(`${file}:`, JSON.stringify({ count: pool.length, types, diffs, mcqPositions }));
}

if (all.length !== 200) fail(`전체 ${all.length}문항, 기대 200`);
const ids = all.map((item) => item.id);
if (new Set(ids).size !== ids.length) fail("ID 중복 존재");
for (let index = 0; index < 200; index += 1) {
  const expected = `m1u2e${String(index + 1).padStart(3, "0")}`;
  if (ids[index] !== expected) fail(`ID 연번 오류: 위치 ${index + 1}=${ids[index]}, 기대 ${expected}`);
}

const totalTypes = { choice: 0, num: 0, word: 0 };
const totalDiffs = { 1: 0, 2: 0, 3: 0 };
for (const item of all) {
  if (item.type === "mcq" || item.type === "multi") totalTypes.choice += 1;
  else totalTypes[item.type] += 1;
  totalDiffs[item.diff] += 1;
}
if (totalTypes.choice !== 120 || totalTypes.num !== 60 || totalTypes.word !== 20)
  fail(`전체 유형 ${totalTypes.choice}/${totalTypes.num}/${totalTypes.word}, 기대 120/60/20`);
if (totalDiffs[1] !== 80 || totalDiffs[2] !== 80 || totalDiffs[3] !== 40)
  fail(`전체 diff ${totalDiffs[1]}/${totalDiffs[2]}/${totalDiffs[3]}, 기대 80/80/40`);

// 동일 문두는 실패, 숫자·변수만 바꾼 동형 문두와 높은 문자열 유사도는 후보로 보고한다.
const normalized = (item) =>
  plain(item.prompt)
    .replace(/[−-]?\d+(?:[.,]\d+)*/g, "#")
    .replace(/\b[a-z]\b/gi, "v")
    .replace(/[가-힣]{2,4}(?=의|가|는|은|에게)/g, "이름")
    .replace(/\s+/g, " ")
    .trim();
const exactPrompts = new Map();
const skeletons = new Map();
for (const item of all) {
  const p = plain(item.prompt);
  if (exactPrompts.has(p)) fail(`${item.id}/${exactPrompts.get(p)}: 문두 정확 중복`);
  else exactPrompts.set(p, item.id);
  const key = normalized(item);
  const prior = skeletons.get(key) ?? [];
  if (prior.length) warn(`동형 문두 후보 ${[...prior, item.id].join(", ")}: ${key}`);
  prior.push(item.id);
  skeletons.set(key, prior);
}

const grams = (s) => {
  const compact = normalized({ prompt: s }).replace(/\s/g, "");
  const out = new Set();
  for (let i = 0; i < compact.length - 1; i += 1) out.add(compact.slice(i, i + 2));
  return out;
};
const jaccard = (a, b) => {
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection || 1);
};
for (let i = 0; i < all.length; i += 1) {
  const a = grams(all[i].prompt);
  for (let j = i + 1; j < all.length; j += 1) {
    const score = jaccard(a, grams(all[j].prompt));
    if (score >= 0.86) warn(`문두 유사도 ${score.toFixed(2)}: ${all[i].id}/${all[j].id}`);
  }
}

const figures = all.filter((item) => item.figure).map((item) => item.id);
console.log("totals:", JSON.stringify({ count: all.length, types: totalTypes, diffs: totalDiffs, figures }));
for (const message of [...new Set(warns)]) console.log("WARN", message);
console.log(failures === 0 ? `ALL PASS (${warns.length} candidate warnings)` : `${failures} FAIL(S)`);
process.exit(failures === 0 ? 0 : 1);
