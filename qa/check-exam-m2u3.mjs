// m2u3(중2 수학 Ⅲ 일차함수) 단원 종합 평가 200제 기계 검사 — v2(2026-07 교과서 준거 재출제).
// v1(20×10·120/60/20·word 2)에서 규격 교체: 레슨당 mcq 10+multi 2+num 8(word 0), diff 8/8/4,
// **그림 파일별 정확값**(합 81 — 정본 qa/m2u3-v2-blueprint.md §4), 문두 정확 중복은 그림 문항끼리면
// WARN(교과서 반복 문형 수용 — m2u5 v2 계승), **레슨 내 직선 함수식(lines의 a·b/vert) 문항 간 중복
// WARN**(v2 검산 교훈: 같은 레슨 두 문항이 같은 직선을 그리면 동일 그래프 반복·유출 위험).
// node qa/check-exam-m2u3.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

// [file, count, mcq, multi, num, word, diff[1,2,3], figures]
const specs = [
  ["m2u3l1", 20, 10, 2, 8, 0, [8, 8, 4], 7],
  ["m2u3l2", 20, 10, 2, 8, 0, [8, 8, 4], 3],
  ["m2u3l3", 20, 10, 2, 8, 0, [8, 8, 4], 8],
  ["m2u3l4", 20, 10, 2, 8, 0, [8, 8, 4], 9],
  ["m2u3l5", 20, 10, 2, 8, 0, [8, 8, 4], 9],
  ["m2u3l6", 20, 10, 2, 8, 0, [8, 8, 4], 11],
  ["m2u3l7", 20, 10, 2, 8, 0, [8, 8, 4], 7],
  ["m2u3l8", 20, 10, 2, 8, 0, [8, 8, 4], 8],
  ["m2u3l9", 20, 10, 2, 8, 0, [8, 8, 4], 8],
  ["m2u3l10", 20, 10, 2, 8, 0, [8, 8, 4], 11],
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

// 소스 레벨: 레슨 내 직선 함수식 중복 후보(lines 배열의 {a, b}·{vert}만 — LC의 items 배열은 lines:
// 키가 없어 자동 제외, dots도 제외). 같은 (a, b)가 두 문항에 나오면 동일 직선 반복 렌더.
function lineDupScan(file, source) {
  const src = source.replace(/\r\n/g, "\n");
  const idMatches = [...src.matchAll(/id: "(m2u3e\d{3})"/g)];
  const perItem = [];
  for (let i = 0; i < idMatches.length; i += 1) {
    const from = idMatches[i].index;
    const to = i + 1 < idMatches.length ? idMatches[i + 1].index : src.length;
    const block = src.slice(from, to);
    const keys = new Set();
    for (const lm of block.matchAll(/lines: \[([\s\S]*?)\]/g)) {
      for (const om of lm[1].matchAll(/\{[^{}]*\}/g)) {
        const obj = om[0];
        const vert = obj.match(/vert: ([-\d./ ]+)/)?.[1];
        if (vert != null) {
          keys.add(`v${vert.replace(/\s/g, "")}`);
          continue;
        }
        const a = obj.match(/(?:^|[,{\s])a: ([-\d./ ]+)/)?.[1];
        const b = obj.match(/(?:^|[,{\s])b: ([-\d./ ]+)/)?.[1];
        if (a != null || b != null) keys.add(`${(a ?? "1").replace(/\s/g, "")}|${(b ?? "0").replace(/\s/g, "")}`);
      }
    }
    perItem.push({ id: idMatches[i][1], keys });
  }
  const owner = new Map();
  for (const it of perItem) {
    for (const k of it.keys) {
      if (owner.has(k) && owner.get(k) !== it.id)
        warn(`${file}: 직선 함수식 중복 후보 (${k}) ${owner.get(k)} ↔ ${it.id} — 동일 그래프 반복/유출 수동 판정`);
      else owner.set(k, it.id);
    }
  }
}

const all = [];
for (const [file, count, mcqCount, multiCount, numCount, wordCount, diffSpec, figCount] of specs) {
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  // 중2 Ⅲ 언어 가드: 고교(정의역·치역·공역·연립부등식)·중3(이차함수·이차방정식·근의 공식)·
  // 명칭 금지(상수함수 — y=7은 "일차함수가 아니다"로만)·교과서 제외 개념(x축의 방향 평행이동).
  for (const word of ["정의역", "치역", "공역", "연립부등식", "이차함수", "이차방정식", "근의 공식", "상수함수", "x축의 방향"]) {
    if (source.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
  // raw 부등호 태그 함정: 허용 태그 밖의 <영문, <b·<i가 곧장 >·공백으로 닫히지 않는 경우.
  // 주석과 mfmt("...") 리터럴 안의 <는 무해(mfmt가 이스케이프·주석은 미렌더)라 제거 후 스캔.
  const scanSrc = source.replace(/\/\/[^\n]*/g, "").replace(/mfmt\(\s*"[^"\n]*"\s*\)/g, "mfmt()");
  for (const m of scanSrc.matchAll(/<([a-z]+)/g)) {
    const tag = m[1];
    const next = scanSrc[m.index + m[0].length] ?? "";
    const allowed = ["b", "br", "i", "span", "sub", "sup", "small"];
    if (!allowed.includes(tag)) fail(`${file}: raw "<${tag}" 발견(mfmt 밖 부등호/미지 태그)`);
    else if ((tag === "b" || tag === "i") && !(next === ">" || next === " ")) {
      fail(`${file}: "<${tag}${next}" 발견(부등호가 태그로 파싱될 함정 — mfmt로 감쌀 것)`);
    }
  }
  if (/<i>(?!<)/.test(source)) fail(`${file}: 맨몸 <i> 발견(변수는 <i class='mv'>x</i>)`);
  lineDupScan(file, source);

  const pool = await loadPool(file);
  if (pool.length !== count) fail(`${file}: ${pool.length}문항, 기대 ${count}`);

  const types = { mcq: 0, multi: 0, num: 0, word: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  const mcqPositions = [0, 0, 0, 0, 0];
  let figures = 0;
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
        if (!Array.isArray(item.answer) || item.answer.length < 2 || item.answer.length > 3)
          fail(`${item.id}: multi answer는 2~3개 인덱스 배열이어야 함`);
        else {
          const sorted = [...item.answer].sort((a, b) => a - b);
          if (new Set(sorted).size !== sorted.length || sorted.some((n) => !Number.isInteger(n) || n < 0 || n >= 5))
            fail(`${item.id}: multi answer 인덱스 오류 ${JSON.stringify(item.answer)}`);
          if (JSON.stringify(sorted) !== JSON.stringify(item.answer))
            fail(`${item.id}: multi answer 인덱스가 오름차순이 아님`);
        }
      }
      if (Array.isArray(item.bogi)) fail(`${item.id}: v2는 bogi 미사용(합답 진술은 multi options로)`);
    } else if (item.type === "num") {
      if (typeof item.answer !== "string") fail(`${item.id}: num answer는 문자열이어야 함`);
      const kind = item.numKind ?? "int";
      if (kind !== "int") fail(`${item.id}: numKind ${kind}, v2는 int만(분수 값은 mcq 우회)`);
      if (!/^-?\d+$/.test(String(item.answer))) fail(`${item.id}: int 정답 형식 오류 ${item.answer}`);
      if (/[−]/.test(String(item.answer))) fail(`${item.id}: num answer에 U+2212(ASCII 하이픈이어야 채점 일치)`);
      if (Math.abs(parseFloat(item.answer)) > 9999) fail(`${item.id}: 정답 절댓값 4자리 초과(넘패드 슬롯 제한)`);
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
  if (figures !== figCount) fail(`${file}: 그림 ${figures}문항, 기대 ${figCount}(설계표 정본)`);
  const used = mcqPositions.filter((n) => n > 0);
  if (used.length < 5 || Math.max(...used) - Math.min(...used) > 2)
    warn(`${file}: mcq 정답 위치 ${mcqPositions.join("/")} 수동 확인`);
  console.log(`${file}:`, JSON.stringify({ count: pool.length, types, diffs, figures }));
}

if (all.length !== 200) fail(`전체 ${all.length}문항, 기대 200`);
const ids = all.map((item) => item.id);
if (new Set(ids).size !== ids.length) fail("ID 중복 존재");
for (let index = 0; index < 200; index += 1) {
  const expected = `m2u3e${String(index + 1).padStart(3, "0")}`;
  if (ids[index] !== expected) fail(`ID 연번 오류: 위치 ${index + 1}=${ids[index]}, 기대 ${expected}`);
}

const totalTypes = { choice: 0, num: 0, word: 0 };
const totalDiffs = { 1: 0, 2: 0, 3: 0 };
let totalFigures = 0;
for (const item of all) {
  if (item.type === "mcq" || item.type === "multi") totalTypes.choice += 1;
  else totalTypes[item.type] += 1;
  totalDiffs[item.diff] += 1;
  if (item.figure) totalFigures += 1;
}
if (totalTypes.choice !== 120 || totalTypes.num !== 80 || totalTypes.word !== 0)
  fail(`전체 유형 ${totalTypes.choice}/${totalTypes.num}/${totalTypes.word}, 기대 120/80/0`);
if (totalDiffs[1] !== 80 || totalDiffs[2] !== 80 || totalDiffs[3] !== 40)
  fail(`전체 diff ${totalDiffs[1]}/${totalDiffs[2]}/${totalDiffs[3]}, 기대 80/80/40`);
if (totalFigures < 80) fail(`그림 ${totalFigures}문항 < 쿼터 80(설계 81)`);

// (a) 같은 파일 num 정답 중복 FAIL + 파일 간 값·단위 일치 WARN
const numByFile = new Map();
const numGlobal = new Map();
for (const item of all.filter((a) => a.type === "num")) {
  const v = `${item.answer}|${item.unitLabel ?? ""}`;
  const fk = `${item.__file}|${item.answer}`;
  if (numByFile.has(fk)) fail(`같은 파일 num 정답 중복: ${numByFile.get(fk)} ↔ ${item.id} (${item.answer})`);
  numByFile.set(fk, item.id);
  if (numGlobal.has(v)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(v)} ↔ ${item.id} (${v}) — 과제가 다른지 수동 판정`);
  else numGlobal.set(v, item.id);
}
// (b) mcq/multi 정답 보기 문구(10자+) 파일 간 일치 후보 WARN
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

// 동일 문두: 그림 문항끼리면 WARN(교과서 반복 문형 "그래프의 x절편을 구하세요" 수용 — m2u5 v2 계승),
// 무그림이 끼면 FAIL. 동형 문두·유사도는 후보 보고.
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
  if (exactPrompts.has(p)) {
    const prev = exactPrompts.get(p);
    if (prev.figure && item.figure) warn(`문두 정확 중복(그림 문항끼리 — 수용): ${prev.id}/${item.id}`);
    else fail(`${item.id}/${prev.id}: 문두 정확 중복`);
  } else exactPrompts.set(p, { id: item.id, figure: !!item.figure });
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

console.log("totals:", JSON.stringify({ count: all.length, types: totalTypes, diffs: totalDiffs, figures: totalFigures }));
for (const message of [...new Set(warns)]) console.log("WARN", message);
console.log(failures === 0 ? `ALL PASS (${warns.length} candidate warnings)` : `${failures} FAIL(S)`);
process.exit(failures === 0 ? 0 : 1);
