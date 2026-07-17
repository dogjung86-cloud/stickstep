// m2u6(중2 수학 Ⅵ 확률) 단원 종합 평가 200제 기계 검사.
// m2u2 검사기(esbuild 실로드)를 22×7+23×2 배분 그대로 계승하고, 금지어를 중2 Ⅵ 표로 교체 +
// frac numKind(첫 도입 — 기약·형식·문두 "기약분수로" 검사) + 합·곱 조건 서술 이형 검출 +
// m2ExamSpinnerFig 중심각 합 360 검산 + pairGridFig 빈 상태(()=>false) 강제를 얹었다.
// node qa/check-exam-m2u6.mjs
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const specs = [
  ["m2u6l1", 22, 13, 7, 2, [9, 9, 4]],
  ["m2u6l2", 22, 13, 7, 2, [9, 9, 4]],
  ["m2u6l3", 22, 13, 7, 2, [9, 9, 4]],
  ["m2u6l4", 22, 13, 7, 2, [9, 9, 4]],
  ["m2u6l5", 22, 14, 6, 2, [9, 9, 4]],
  ["m2u6l6", 22, 14, 6, 2, [9, 9, 4]],
  ["m2u6l7", 22, 14, 6, 2, [9, 9, 4]],
  ["m2u6l8", 23, 13, 7, 3, [8, 9, 6]],
  ["m2u6l9", 23, 13, 7, 3, [9, 8, 6]],
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
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

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
  const source = readFileSync(`src/content/exams/${file}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (source.includes("—")) fail(`${file}: em대시(—) 발견(주석 포함 전면 금지)`);
  if (source.includes("figureDark")) fail(`${file}: figureDark 금지(이 단원 그림은 전부 밝음)`);
  // 중2 Ⅵ 언어 가드: 본문 미도입(여사건·시행·수형도)·고교(순열·조합·nPr·nCr·조건부·독립·기댓값·
  // 배반·표본)·지도서 전용(수학적/통계적 확률)·다음 학년(복원·비복원 용어 — 서술 "다시 넣은"만).
  for (const word of [
    "여사건", "시행", "수형도", "순열", "조합", "nPr", "nCr", "조건부", "독립",
    "수학적 확률", "통계적 확률", "기댓값", "배반", "표본", "복원",
  ]) {
    if (source.includes(word)) fail(`${file}: 금지어 "${word}" 발견`);
  }
  // 합·곱 조건 서술 통일 검사: 이형 표현이 있으면 실격(정본 = "동시에 일어나지 않을 때" /
  // "서로 영향을 끼치지 않을 때"). '겹치지 않게'(L1 철칙 어휘)는 무해하므로 조건꼴만 잡는다.
  for (const [pat, label] of [
    [/영향을 (주지|미치지) 않/g, "곱셈 조건 이형(영향을 주지/미치지 않)"],
    [/서로 무관/g, "곱셈 조건 이형(서로 무관)"],
    [/겹치지 않(을 때|는 경우)/g, "덧셈 조건 이형(겹치지 않을 때)"],
    [/겹칠 수 없을 때/g, "덧셈 조건 이형(겹칠 수 없을 때)"],
  ]) {
    if (pat.test(source)) fail(`${file}: ${label} — 정본 서술로 통일할 것`);
  }
  // raw 태그 함정: 허용 태그 밖 <영문(mfmt 밖 부등호 등). 주석·mfmt 리터럴 제거 후 스캔.
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
  if (/<i>(?!<)/.test(source)) fail(`${file}: 맨몸 <i> 발견(변수는 <i class='mv'>p</i>)`);
  // pairGridFig는 빈 상태만(강조 칸 = 세기 과제 유출)
  const pgCalls = (source.match(/pairGridFig\(/g) ?? []).length;
  const pgSafe = (source.match(/pairGridFig\(\s*\(\)\s*=>\s*false/g) ?? []).length;
  if (pgCalls !== pgSafe) fail(`${file}: pairGridFig ${pgCalls}회 중 빈 상태(()=>false)가 ${pgSafe}회 — 강조 칸 금지`);
  // m2ExamSpinnerFig 중심각 합 360 검산(실비 원칙)
  for (const m of source.matchAll(/m2ExamSpinnerFig\(\{[\s\S]*?slices:\s*\[([\s\S]*?)\]/g)) {
    const degs = [...m[1].matchAll(/deg:\s*(\d+)/g)].map((d) => Number(d[1]));
    const sum = degs.reduce((s, n) => s + n, 0);
    if (sum !== 360) fail(`${file}: m2ExamSpinnerFig 중심각 합 ${sum}° (360° 필요 — ${degs.join("+")})`);
  }

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
      if (!["int", "dec", "frac"].includes(kind)) fail(`${item.id}: numKind ${kind}, int/dec/frac만 허용`);
      const ans = String(item.answer);
      if (kind === "int" && !/^-?\d+$/.test(ans)) fail(`${item.id}: int 정답 형식 오류 ${ans}`);
      if (kind === "dec" && !/^-?\d+\.\d+$/.test(ans)) fail(`${item.id}: dec 정답 형식 오류 ${ans}`);
      if (kind === "frac") {
        if (!/^\d+\/\d+$/.test(ans)) fail(`${item.id}: frac 정답 형식 오류 ${ans}(확률은 음수 없음 — "a/b" ASCII)`);
        else {
          const [a, b] = ans.split("/").map(Number);
          if (!b || a >= b) fail(`${item.id}: frac 정답 ${ans} — 확률 분수는 0<a/b<1(0·1은 int로)`);
          else if (gcd(a, b) !== 1) fail(`${item.id}: frac 정답 ${ans}이 기약분수가 아님`);
        }
        if (!plain(item.prompt).includes("기약분수로")) fail(`${item.id}: frac 문두에 "기약분수로" 명시 필요`);
        if (item.unitLabel) fail(`${item.id}: frac 확률 답은 unitLabel 생략(무단위)`);
      }
      if (kind === "dec" && !plain(item.prompt).includes("소수로")) fail(`${item.id}: dec 문두에 "소수로" 명시 필요`);
      if (kind === "int" && ["m2u6l1", "m2u6l2", "m2u6l3"].includes(file) && item.unitLabel !== "가지")
        fail(`${item.id}: 경우의 수 int는 unitLabel "가지" 필요`);
      if (kind === "int" && !["m2u6l1", "m2u6l2", "m2u6l3"].includes(file) && !["0", "1"].includes(ans) && !item.unitLabel)
        fail(`${item.id}: 확률 파트 int는 0/1(확률값) 또는 unitLabel 있는 개수 역산만(확률값은 frac/dec)`);
      if (/[−]/.test(ans)) fail(`${item.id}: num answer에 U+2212(ASCII여야 채점 일치)`);
      if (Math.abs(parseFloat(ans)) > 9999) fail(`${item.id}: 정답 절댓값 4자리 초과(넘패드 슬롯 제한)`);
    } else if (item.type === "word") {
      if (!Array.isArray(item.bank)) fail(`${item.id}: word bank 없음`);
      else {
        if (item.bank.length < 8 || item.bank.length > 10)
          fail(`${item.id}: word bank ${item.bank.length}개, 8~10개 필요`);
        if (new Set(item.bank).size !== item.bank.length) fail(`${item.id}: word bank 중복`);
        if (item.bank[0] !== item.answer) fail(`${item.id}: answer가 bank[0]이 아님`);
        // '확률'↔'상대도수' 상호 오염 금지(극한 서사로 문장이 참이 될 수 있음)
        if (item.answer === "확률" && item.bank.includes("상대도수"))
          fail(`${item.id}: '확률' 답 문장 bank에 '상대도수' 칩 금지`);
        if (item.answer === "상대도수" && item.bank.includes("확률"))
          fail(`${item.id}: '상대도수' 답 문장 bank에 '확률' 칩 금지`);
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
  const expected = `m2u6e${String(index + 1).padStart(3, "0")}`;
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

// (a) 같은 파일 num 정답 중복 FAIL + 파일 간 값 일치 WARN
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

// 동일 문두는 실패, 숫자만 바꾼 동형 문두·높은 유사도는 후보 보고.
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
