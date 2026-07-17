// m2u5(중2 수학 Ⅴ 도형의 닮음과 피타고라스 정리) 단원 종합 평가 200제 기계 검사.
// m2u4 검사기(esbuild 실로드·raw 부등호 태그·파일 간 중복 후보)를 계승하되:
// ① 배분이 비균일(19×2+18×9) — 이 specs 표가 배분의 정본(m1u2 계보).
// ② 금지어를 중2 Ⅴ 표로 교체(√·제곱근·무리수·삼각비·닮음의 중심/위치·이등분선 정리·
//    "역이 성립"류(역수·영역 오탐 방지 — '역' 단독은 잡지 않음)·무게중심 좌표·원주각).
// ③ num 전 문항 자연수 강제(√ 금지 단원의 설계 결과 — 트리플·비·넓이 전부 자연수).
// ④ CRLF 정규화(autocrlf 사본에서 검사기 무증상 사망 예방 — m1u6 실사고 계보).
// node qa/check-exam-m2u5.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// [file, count, mcq, multi, num, word, diff[1,2,3]] — 19문항은 L4·L10(두 기둥), word 1은 그 둘.
const specs = [
  ["m2u5l1", 18, 9, 2, 5, 2, [8, 8, 2]],
  ["m2u5l2", 18, 8, 3, 5, 2, [7, 7, 4]],
  ["m2u5l3", 18, 8, 2, 6, 2, [7, 7, 4]],
  ["m2u5l4", 19, 10, 2, 6, 1, [8, 8, 3]],
  ["m2u5l5", 18, 9, 2, 5, 2, [7, 7, 4]],
  ["m2u5l6", 18, 9, 2, 5, 2, [7, 7, 4]],
  ["m2u5l7", 18, 9, 2, 5, 2, [7, 7, 4]],
  ["m2u5l8", 18, 8, 2, 6, 2, [7, 7, 4]],
  ["m2u5l9", 18, 8, 2, 6, 2, [7, 7, 4]],
  ["m2u5l10", 19, 10, 2, 6, 1, [8, 8, 3]],
  ["m2u5l11", 18, 8, 3, 5, 2, [7, 7, 4]],
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
  [item.prompt, ...(item.options ?? []), ...(item.bogi ?? []), item.explain, item.core, ...(item.bank ?? [])]
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
for (const [file, count, mcqCount, multiCount, numCount, wordCount, diffSpec] of specs) {
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  // 중2 Ⅴ 언어 가드: 중3(√·제곱근·무리수·삼각비·원주각), 교과서 미도입(닮음의 중심/위치·
  // 각의 이등분선 정리), 고교('역' 표현·무게중심 좌표). '역'은 "역이 성립"류만(역수·영역 오탐 방지).
  // 예각·둔각은 낱말 자체는 허용(판정 부등식만 금지 — 기계 검출 불가라 감수 몫).
  for (const word of [
    "√", "제곱근", "근호", "무리수", "삼각비", "원주각",
    "닮음의 중심", "닮음의 위치", "이등분선 정리",
    "역이 성립", "역은 성립", "역도 성립", "의 역도", "의 역은", "의 역이",
    "좌표", "정의역", "치역", "이차방정식", "인수분해",
  ]) {
    if (source.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}⭕]/u.test(source)) fail(`${file}: 이모지 발견(판정 마커는 ✓)`);
  // raw 부등호 태그 함정(주석 제거 후 스캔 — 기하 풀은 mfmt 미사용).
  const scanSrc = source.replace(/\/\/[^\n]*/g, "");
  for (const m of scanSrc.matchAll(/<([a-z]+)/g)) {
    const tag = m[1];
    const next = scanSrc[m.index + m[0].length] ?? "";
    const allowed = ["b", "br", "i", "span", "sub", "sup", "small"];
    if (!allowed.includes(tag)) fail(`${file}: raw "<${tag}" 발견(부등호/미지 태그)`);
    else if ((tag === "b" || tag === "i") && !(next === ">" || next === " ")) {
      fail(`${file}: "<${tag}${next}" 발견(부등호가 태그로 파싱될 함정)`);
    }
  }
  if (/<i>(?!<)/.test(source)) fail(`${file}: 맨몸 <i> 발견(변수는 <i class='mv'>x</i>)`);

  const pool = await loadPool(file);
  if (pool.length !== count) fail(`${file}: ${pool.length}문항, 기대 ${count}`);

  const types = { mcq: 0, multi: 0, num: 0, word: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  const mcqPositions = [0, 0, 0, 0, 0];
  let figCount = 0;
  for (const item of pool) {
    item.__file = file;
    all.push(item);
    if (item.figure) figCount += 1;
    if (!(item.type in types)) fail(`${item.id}: 알 수 없는 type ${item.type}`);
    else types[item.type] += 1;
    if (![1, 2, 3].includes(item.diff)) fail(`${item.id}: diff가 1|2|3이 아님`);
    else diffs[item.diff] += 1;
    if (item.lessonId !== file) fail(`${item.id}: lessonId ${item.lessonId}, 기대 ${file}`);
    if (item.figureDark) fail(`${item.id}: figureDark 금지(수학 그림은 밝은 카드)`);

    const expLen = plain(item.explain).length;
    if (expLen < 250 || expLen > 450) fail(`${item.id}: 해설 ${expLen}자, 250~450자 필요`);
    const text = visibleText(item);
    if (/(^|[^\w])-(?=\d|[a-z])/i.test(text)) fail(`${item.id}: 노출 텍스트에 ASCII 하이픈 음수 후보(U+2212 필요)`);

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
      if (Array.isArray(item.bogi) && item.shuffle !== false)
        fail(`${item.id}: bogi 합답형은 shuffle:false 필수`);
    } else if (item.type === "num") {
      if (typeof item.answer !== "string") fail(`${item.id}: num answer는 문자열이어야 함`);
      const kind = item.numKind ?? "int";
      if (kind !== "int") fail(`${item.id}: 이 단원 num은 전부 int(자연수 설계), numKind=${kind}`);
      if (!/^\d+$/.test(String(item.answer)))
        fail(`${item.id}: 자연수 정답 형식 오류 ${item.answer}(√ 금지 단원 — 음수·소수 없음)`);
      if (Math.abs(parseFloat(item.answer)) > 9999) fail(`${item.id}: 정답 절댓값 4자리 초과(넘패드 슬롯 제한)`);
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

  if (types.mcq !== mcqCount) fail(`${file}: mcq ${types.mcq}, 기대 ${mcqCount}`);
  if (types.multi !== multiCount) fail(`${file}: multi ${types.multi}, 기대 ${multiCount}`);
  if (types.num !== numCount) fail(`${file}: num ${types.num}, 기대 ${numCount}`);
  if (types.word !== wordCount) fail(`${file}: word ${types.word}, 기대 ${wordCount}`);
  if (diffs[1] !== diffSpec[0] || diffs[2] !== diffSpec[1] || diffs[3] !== diffSpec[2])
    fail(`${file}: diff ${diffs[1]}/${diffs[2]}/${diffs[3]}, 기대 ${diffSpec.join("/")}`);
  if (figCount < 4) warn(`${file}: 그림 문항 ${figCount}개(기하 시험 기준) — L11(판정 단원·그림이 결론 유출)만 3개 허용, 그 외 수동 확인`);
  const used = mcqPositions.filter((n) => n > 0);
  if (used.length < 5 || Math.max(...used) - Math.min(...used) > 2)
    warn(`${file}: mcq 정답 위치 ${mcqPositions.join("/")} 수동 확인`);
  console.log(`${file}:`, JSON.stringify({ count: pool.length, types, diffs, figCount, mcqPositions }));
}

if (all.length !== 200) fail(`전체 ${all.length}문항, 기대 200`);
const ids = all.map((item) => item.id);
if (new Set(ids).size !== ids.length) fail("ID 중복 존재");
for (let index = 0; index < 200; index += 1) {
  const expected = `m2u5e${String(index + 1).padStart(3, "0")}`;
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

// (a) 같은 파일 num 정답 중복 FAIL + 파일 간 값·단위 일치 WARN
const numByFile = new Map();
const numGlobal = new Map();
for (const item of all.filter((a) => a.type === "num")) {
  const v = `${item.answer}|${item.unitLabel ?? ""}`;
  const fk = `${item.__file}|${v}`;
  if (numByFile.has(fk)) fail(`같은 파일 num 정답 중복: ${numByFile.get(fk)} ↔ ${item.id} (${v})`);
  numByFile.set(fk, item.id);
  if (numGlobal.has(v)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(v)} ↔ ${item.id} (${v}) — 과제가 다른지 수동 판정`);
  else numGlobal.set(v, item.id);
}
// (b) word 정답 용어 파일 간 중복 FAIL
const wordAns = new Map();
for (const item of all.filter((a) => a.type === "word")) {
  if (wordAns.has(item.answer)) fail(`word 정답 용어 중복: "${item.answer}" (${wordAns.get(item.answer)} ↔ ${item.id})`);
  wordAns.set(item.answer, item.id);
}
// (c) mcq/multi 정답 보기 문구(10자+) 파일 간 일치 후보 WARN
const optAns = new Map();
for (const item of all.filter((a) => a.type === "mcq" || a.type === "multi")) {
  const idxs = item.type === "mcq" ? [item.answer] : item.answer;
  for (const i of idxs) {
    const t = plain((item.options ?? [])[i]);
    if (!t || t.length < 10) continue;
    if (optAns.has(t)) warn(`정답 보기 문구 일치 후보: ${optAns.get(t)} ↔ ${item.id} "${t.slice(0, 30)}…"`);
    else optAns.set(t, item.id);
  }
}

// 동일 문두는 실패, 숫자·변수만 바꾼 동형 문두와 높은 유사도는 후보 보고.
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
console.log("totals:", JSON.stringify({ count: all.length, types: totalTypes, diffs: totalDiffs, figures: figures.length }));
for (const message of [...new Set(warns)]) console.log("WARN", message);
console.log(failures === 0 ? `ALL PASS (${warns.length} candidate warnings)` : `${failures} FAIL(S)`);
process.exit(failures === 0 ? 0 : 1);
