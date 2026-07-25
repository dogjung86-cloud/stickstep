// m1u3(수학 중1 III 좌표평면과 그래프) 200문항 기계 검사 · v2(2026-07-25 재출제 6호 이식판).
// 전체: mcq 99/multi 20/num 81/word 0(1개라도 FAIL), diff 80/80/40, 그림 파일별 정확값 합 105.
// 정본 스펙 = qa/m1u3-v2-blueprint.md §0·§4. L1만 검사: LESSON_ONLY=m1u3l1 node qa/check-exam-m1u3.mjs
import { readFileSync, existsSync } from "node:fs";
import { createServer } from "vite";

// [file, total, mcq, multi, num, word, diff, fig, start, end]
const lessons = [
  ["m1u3l1", 22, 11, 2, 9, 0, [9, 9, 4], 12, 1, 22],
  ["m1u3l2", 22, 11, 2, 9, 0, [9, 9, 4], 5, 23, 44],
  ["m1u3l3", 22, 11, 2, 9, 0, [9, 9, 4], 16, 45, 66],
  ["m1u3l4", 23, 11, 3, 9, 0, [9, 9, 5], 20, 67, 89],
  ["m1u3l5", 22, 11, 2, 9, 0, [9, 9, 4], 6, 90, 111],
  ["m1u3l6", 22, 11, 2, 9, 0, [9, 8, 5], 13, 112, 133],
  ["m1u3l7", 22, 11, 2, 9, 0, [9, 9, 4], 5, 134, 155],
  ["m1u3l8", 22, 11, 2, 9, 0, [8, 9, 5], 14, 156, 177],
  ["m1u3l9", 23, 11, 3, 9, 0, [9, 9, 5], 14, 178, 200],
];

const only = process.env.LESSON_ONLY;
const active = only ? lessons.filter(([name]) => name === only) : lessons;
let bad = 0;
let warn = 0;
const fail = (message) => { console.log("FAIL", message); bad++; };
const caution = (message) => { console.log("WARN", message); warn++; };
const stripHtml = (value) => value.replace(/<[^>]*>/g, "").replaceAll("\\n", "");
const all = [];
const runtimePools = new Map();

const vite = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
try {
  for (const [file] of active) {
    if (!existsSync(`src/content/exams/${file}.ts`)) continue;
    const module = await vite.ssrLoadModule(`/src/content/exams/${file}.ts`);
    const pool = Object.values(module).find(Array.isArray);
    if (!pool) fail(`${file}: 런타임 pool export를 찾지 못함`);
    else runtimePools.set(file, pool);
  }
} finally {
  await vite.close();
}

for (const [file, expectedTotal, expectedMcq, expectedMulti, expectedNum, expectedWord, expectedDiff, expectedFig, start, end] of active) {
  const path = `src/content/exams/${file}.ts`;
  if (!existsSync(path)) { fail(`${file}: 파일 없음`); continue; }
  // CRLF 정규화: autocrlf 체크아웃 사본에서 정규식 검사가 무증상으로 어긋나는 사고 계보(m1u6 검사기) 예방.
  const src = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const em = [...src.matchAll(/—/g)].length;
  if (em) fail(`${file}: em대시 ${em}개`);
  for (const word of ["기울기", "절편", "일차함수", "점근선", "정의역", "치역", "쌍곡선", "함수"]) {
    if (src.includes(word)) fail(`${file}: 중1 단원 금지어 '${word}'`);
  }
  const blocks = src.split(/\r?\n  \{\r?\n/).slice(1);
  for (const block of blocks) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const runtime = runtimePools.get(file)?.find((item) => item.id === id);
    if (!runtime) fail(`${id}: 런타임 pool에서 찾지 못함`);
    const type = runtime?.type ?? block.match(/type: "(mcq|multi|num|word)"/)?.[1];
    const diff = Number(runtime?.diff ?? block.match(/diff: ([123])/)?.[1] ?? 0);
    const figure = Boolean(runtime?.figure);
    const prompt = String(runtime?.prompt ?? "");
    const explain = String(runtime?.explain ?? "");
    const answerRaw = JSON.stringify(runtime?.answer ?? "");
    const numKind = runtime?.numKind;
    const bankRaw = runtime?.bank ? JSON.stringify(runtime.bank) : undefined;
    const shuffleFalse = runtime?.shuffle === false;
    const optionsRaw = runtime?.options ? JSON.stringify(runtime.options) : undefined;
    all.push({ file, id, type, diff, figure, prompt, explain, answerRaw, numKind, bankRaw, shuffleFalse, optionsRaw });

    if (!new RegExp(`^m1u3e\\d{3}$`).test(id)) fail(`${id}: ID 형식`);
    const n = Number(id.slice(-3));
    if (n < start || n > end) fail(`${id}: ${file} 범위 ${start}~${end} 밖`);
    if (!type) fail(`${id}: type 누락`);
    if (![1, 2, 3].includes(diff)) fail(`${id}: diff 누락/오류`);
    if (runtime?.lessonId !== file) fail(`${id}: 런타임 lessonId ${runtime?.lessonId} != ${file}`);
    if (/<\/i>[<>]0/.test(`${prompt}\n${optionsRaw ?? ""}\n${explain}`))
      fail(`${id}: HTML 문자열 안 부등호 미이스케이프 또는 변수 미서식 후보`);
    if (/<[^>]*<i\b|class=['"]<i\b|<i\s+cl<i\b/.test(`${prompt}\n${optionsRaw ?? ""}\n${explain}`))
      fail(`${id}: 변수 치환이 HTML 태그 내부를 훼손한 후보`);

    const plain = stripHtml(explain);
    if (!explain) fail(`${id}: explain 정적 문자열을 찾지 못함`);
    else if (plain.length < 250 || plain.length > 450) fail(`${id}: 해설 ${plain.length}자, 250~450 위반`);
    if (type === "mcq" && !explain.includes("오답")) fail(`${id}: mcq 해설에 오답 격파 없음`);

    if (type === "num") {
      if (!/^"-?(?:\d+)(?:\.\d+)?"$/.test(answerRaw)) fail(`${id}: num answer 문자열 형식 오류 ${answerRaw}`);
      if (!numKind || !["int", "dec"].includes(numKind)) fail(`${id}: numKind int/dec 누락`);
      const value = answerRaw.replaceAll('"', "");
      if (numKind === "int" && !/^-?\d+$/.test(value)) fail(`${id}: int 정답이 정수 아님 ${value}`);
      if (numKind === "dec" && !/^-?\d+\.\d+$/.test(value)) fail(`${id}: dec 정답이 유한소수 표기 아님 ${value}`);
      if (/^-/.test(value) && prompt.includes(value)) caution(`${id}: 학생 노출 문자열에 ASCII 음수 후보`);
      if (/^\([^)]*,[^)]*\)$/.test(value)) fail(`${id}: 좌표쌍을 num으로 받음`);
    }
    if (type === "word") {
      const answer = String(runtime?.answer ?? "");
      const chips = runtime?.bank ?? [];
      if (chips.length < 8 || chips.length > 10) fail(`${id}: word bank ${chips.length}개`);
      if (chips[0] !== answer) fail(`${id}: word 정답이 bank[0]이 아님`);
      if (new Set(chips).size !== chips.length) fail(`${id}: word bank 중복`);
    }
    if (type === "mcq" || type === "multi") {
      if (!runtime?.options) fail(`${id}: options 누락`);
      if (type === "mcq") {
        const idx = Number(runtime?.answer);
        const optionCount = runtime?.options?.length ?? 0;
        if (!Number.isInteger(idx) || idx < 0 || idx > 4) fail(`${id}: mcq answer 인덱스 ${answerRaw}`);
        // v2 예외: 그림 카드 매칭형((가)(나)(다)(라) 순수 라벨 보기 + shuffle:false + figure)은
        // 카드 수만큼 3~4지 허용(교과서 병·개형 매칭 실측 관행 · blueprint L3·L5 카드 슬롯).
        const labelCard = figure && shuffleFalse && (runtime?.options ?? []).every((opt) => /^\([가-라]\)$/.test(String(opt)));
        if (labelCard) {
          if (optionCount < 3 || optionCount > 5) fail(`${id}: 카드 매칭 보기 ${optionCount}개, 3~5개 요구`);
        } else if (optionCount !== 5) fail(`${id}: mcq 보기 ${optionCount}개, 5개 요구`);
      } else {
        const indexes = Array.isArray(runtime?.answer) ? runtime.answer : [];
        if (indexes.length < 2 || new Set(indexes).size !== indexes.length || indexes.some((i) => i < 0 || i > 4))
          fail(`${id}: multi answer 인덱스 ${answerRaw}`);
      }
      if (shuffleFalse && answerRaw === "0") fail(`${id}: shuffle:false인데 첫 보기 정답`);
    }
    if (/\([−-]?\d+(?:\.\d+)?,\s*[−-]?\d+(?:\.\d+)?\)/.test(prompt))
      caution(`${id}: 좌표쌍 표기 후보, 순서·부호 수동 확인`);
    if (/(x축|y축).*사분면|사분면.*(x축|y축)/.test(stripHtml(prompt)))
      caution(`${id}: 축 위 점을 사분면으로 분류하는 문장 후보`);
  }

  const rows = all.filter((item) => item.file === file);
  const mcq = rows.filter((item) => item.type === "mcq").length;
  const multi = rows.filter((item) => item.type === "multi").length;
  const num = rows.filter((item) => item.type === "num").length;
  const word = rows.filter((item) => item.type === "word").length;
  const figs = rows.filter((item) => item.figure).length;
  const ds = [1, 2, 3].map((d) => rows.filter((item) => item.diff === d).length);
  if (rows.length !== expectedTotal) fail(`${file}: ${rows.length}문항 != ${expectedTotal}`);
  rows.forEach((item, index) => {
    const expectedId = `m1u3e${String(start + index).padStart(3, "0")}`;
    if (item.id !== expectedId) fail(`${file}: ${index + 1}번째 ID ${item.id} != ${expectedId}`);
  });
  if (mcq !== expectedMcq || multi !== expectedMulti || num !== expectedNum || word !== expectedWord)
    fail(`${file}: 유형 m${mcq}/M${multi}/n${num}/w${word} != m${expectedMcq}/M${expectedMulti}/n${expectedNum}/w${expectedWord}`);
  if (word > 0) fail(`${file}: word ${word}문항 발견, v2는 0이 확정값(용어 빈칸형 금지)`);
  if (figs !== expectedFig) fail(`${file}: 그림 ${figs} != ${expectedFig}(파일별 정확값)`);
  if (ds.some((count, i) => count !== expectedDiff[i])) fail(`${file}: diff ${ds.join("/")} != ${expectedDiff.join("/")}`);
  const numAnswers = rows.filter((item) => item.type === "num").map((item) => item.answerRaw);
  for (const [value, count] of [...new Set(numAnswers)].map((v) => [v, numAnswers.filter((x) => x === v).length]))
    if (count > 1) fail(`${file}: num 정답 ${value} 파일 내 ${count}회 중복(블루프린트 값표 위반)`);
}

const ids = all.map((item) => item.id);
for (const [id, count] of [...new Set(ids)].map((id) => [id, ids.filter((x) => x === id).length])) {
  if (count > 1) fail(`${id}: ID 중복 ${count}`);
}
if (!only) {
  for (let i = 1; i <= 200; i++) {
    const id = `m1u3e${String(i).padStart(3, "0")}`;
    if (!ids.includes(id)) fail(`${id}: ID 누락`);
  }
  const counts = {
    mcq: all.filter((item) => item.type === "mcq").length,
    multi: all.filter((item) => item.type === "multi").length,
    num: all.filter((item) => item.type === "num").length,
    word: all.filter((item) => item.type === "word").length,
  };
  const diff = [1, 2, 3].map((d) => all.filter((item) => item.diff === d).length);
  const figs = all.filter((item) => item.figure).length;
  if (all.length !== 200) fail(`전체 ${all.length} != 200`);
  if (counts.mcq !== 99 || counts.multi !== 20 || counts.num !== 81 || counts.word !== 0)
    fail(`전체 유형 m${counts.mcq}/M${counts.multi}/n${counts.num}/w${counts.word} != m99/M20/n81/w0`);
  if (diff.join("/") !== "80/80/40") fail(`전체 diff ${diff.join("/")}`);
  if (figs !== 105) fail(`figure ${figs}개 != 105(v2 파일별 정확값 합)`);
}

const mcqPositions = all.filter((item) => item.type === "mcq").map((item) => Number(item.answerRaw));
const pos = [0, 1, 2, 3, 4].map((i) => mcqPositions.filter((x) => x === i).length);
if (mcqPositions.length && Math.max(...pos) - Math.min(...pos) > Math.max(2, Math.ceil(mcqPositions.length * 0.15)))
  caution(`mcq 저작 정답 위치 편중 ${pos.join("/")} · v2는 정답 첫 보기 저작 관행+표시 셔플이라 로그 강등(m1u5 검사기 계보), shuffle:false만 별도 FAIL`);

// 숫자·좌표만 바꾼 동형 문두와 핵심 좌표+정답의 정확 중복은 후보만 출력하고 사람이 판정한다.
const normalizedGroups = new Map();
const coordinateGroups = new Map();
for (const item of all) {
  const plainPrompt = stripHtml(item.prompt).replaceAll("&lt;", "<").replaceAll("&gt;", ">");
  const normalized = plainPrompt
    .replace(/\([−-]?\d+(?:\.\d+)?,\s*[−-]?\d+(?:\.\d+)?\)/g, "(#,#)")
    .replace(/[−-]?\d+(?:\.\d+)?/g, "#")
    .replace(/\s+/g, "")
    .replace(/[A-Z가-힣]{1,8}(?=(?:이|가|은|는|에서|의))/g, "소재");
  if (normalized.length >= 18) {
    const group = normalizedGroups.get(normalized) ?? [];
    group.push(item.id);
    normalizedGroups.set(normalized, group);
  }
  const coords = [...`${item.prompt} ${item.optionsRaw ?? ""}`.matchAll(/\(([−-]?\d+(?:\.\d+)?),\s*([−-]?\d+(?:\.\d+)?)\)/g)]
    .map((match) => `${match[1].replace("−", "-")},${match[2].replace("−", "-")}`);
  if (coords.length) {
    const signature = `${[...new Set(coords)].sort().join(";")}|${item.answerRaw}`;
    const group = coordinateGroups.get(signature) ?? [];
    group.push(item.id);
    coordinateGroups.set(signature, group);
  }
}
for (const ids2 of normalizedGroups.values()) if (ids2.length > 1) caution(`동형 문두 후보: ${ids2.join(", ")}`);
for (const ids2 of coordinateGroups.values()) if (ids2.length > 1) caution(`핵심 좌표+정답 정확 중복 후보: ${ids2.join(", ")}`);

console.log("counts", JSON.stringify({ total: all.length, figures: all.filter((item) => item.figure).length, answerPositions: pos }));
console.log(bad === 0 ? `ALL PASS (${warn} WARN)` : `${bad} FAIL(S), ${warn} WARN(S)`);
process.exitCode = bad ? 1 : 0;
