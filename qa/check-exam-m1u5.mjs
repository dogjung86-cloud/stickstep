// m1u5 수학 시험 풀 정적 검사. 기본은 14개 레슨 200문항, --lesson=1은 L1 정본 게이트용이다.
// node qa/check-exam-m1u5.mjs [--lesson=1]
import { existsSync, readFileSync } from "node:fs";

const lessonArg = process.argv.find((arg) => arg.startsWith("--lesson="));
const onlyLesson = lessonArg ? Number(lessonArg.split("=")[1]) : null;
const files = Array.from({ length: 14 }, (_, i) => `m1u5l${i + 1}`).filter((_, i) => !onlyLesson || i + 1 === onlyLesson);
const expected = [
  { total: 14, obj: 9, num: 4, word: 1, diff: [6, 5, 3] },
  { total: 14, obj: 9, num: 3, word: 2, diff: [5, 6, 3] },
  { total: 14, obj: 9, num: 3, word: 2, diff: [6, 5, 3] },
  { total: 14, obj: 9, num: 3, word: 2, diff: [5, 6, 3] },
  { total: 14, obj: 9, num: 4, word: 1, diff: [6, 6, 2] },
  { total: 14, obj: 8, num: 4, word: 2, diff: [5, 6, 3] },
  { total: 15, obj: 8, num: 6, word: 1, diff: [6, 6, 3] },
  { total: 14, obj: 9, num: 4, word: 1, diff: [6, 5, 3] },
  { total: 14, obj: 9, num: 4, word: 1, diff: [5, 6, 3] },
  { total: 14, obj: 9, num: 4, word: 1, diff: [6, 6, 2] },
  { total: 15, obj: 8, num: 5, word: 2, diff: [6, 6, 3] },
  { total: 15, obj: 8, num: 5, word: 2, diff: [6, 6, 3] },
  { total: 15, obj: 8, num: 6, word: 1, diff: [6, 6, 3] },
  { total: 14, obj: 8, num: 5, word: 1, diff: [6, 5, 3] },
];
const startId = [1, 15, 29, 43, 57, 71, 85, 100, 114, 128, 142, 157, 172, 187];
const bannedWords = ["피타고라스", "삼각비", "닮음비", "구분구적", "미적분", "좌표기하", "호도법"];
const romanRe = /[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/;
let bad = 0;
const fail = (msg) => { console.log("FAIL", msg); bad++; };
const warn = (msg) => console.log("WARN", msg);
const all = [];

function stringsIn(raw = "") {
  return [...raw.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]);
}

function plain(raw = "") {
  return raw.replace(/<br\s*\/?\s*>/gi, "").replace(/<[^>]*>/g, "").replace(/\\n/g, "");
}

function normPrompt(raw = "") {
  return plain(raw)
    .replace(/\d+(?:\.\d+)?/g, "#")
    .replace(/[A-Z가-힣](?=[A-Z가-힣]{1,8})/g, "문")
    .replace(/\s+/g, "")
    .replace(/["'.,!?():;<>/=+×÷−π°²³]/g, "");
}

function dice(a, b) {
  const aa = new Set([...a]);
  const bb = new Set([...b]);
  let hit = 0;
  for (const x of aa) if (bb.has(x)) hit++;
  return (2 * hit) / Math.max(1, aa.size + bb.size);
}

for (const file of files) {
  const path = `src/content/exams/${file}.ts`;
  if (!existsSync(path)) { fail(`${file}: 파일 없음`); continue; }
  const src = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${file}: em대시 발견`);
  for (const word of bannedWords) if (src.includes(word)) fail(`${file}: 금지어 '${word}' 발견`);
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const type = block.match(/type: "(mcq|multi|num|word)"/)?.[1];
    const prompt = block.match(/prompt:\s*(?:\n\s*)?"([\s\S]*?)",\n\s+(?:figure:|options:|answer:|bank:)/)?.[1] ?? "";
    const optionsRaw = block.match(/options:\s*\[([\s\S]*?)\],\n\s+answer:/)?.[1];
    const options = stringsIn(optionsRaw);
    const answerRaw = block.match(/answer:\s*(\[[^\]]*\]|"[^"]*"|\d+)/)?.[1] ?? "";
    const answer = answerRaw.startsWith("[")
      ? [...answerRaw.matchAll(/\d+/g)].map((m) => Number(m[0]))
      : answerRaw.startsWith('"') ? answerRaw.slice(1, -1) : Number(answerRaw);
    const diff = Number(block.match(/diff:\s*([123])/)?.[1]);
    const numKind = block.match(/numKind:\s*"(int|dec)"/)?.[1] ?? "int";
    const unitLabel = block.match(/unitLabel:\s*"([^"]+)"/)?.[1];
    const bankRaw = block.match(/bank:\s*\[([\s\S]*?)\],\n\s+diff:/)?.[1];
    const bank = stringsIn(bankRaw);
    const explain = block.match(/explain:\s*(?:\n\s*)?"([\s\S]*?)",\n\s+core:/)?.[1] ?? "";
    const figureCall = block.match(/figure:\s*([^,\n]+(?:\([^\n]*\))?)/)?.[1];
    const lessonNo = Number(file.match(/l(\d+)$/)?.[1]);
    const lessonId = block.match(/lessonId:\s*"([^"]+)"/)?.[1] ?? `m1u5l${lessonNo}`;
    all.push({ file, id, lessonId, type, prompt, options, answer, answerRaw, diff, numKind, unitLabel, bank, explain, figureCall, block });
  }
}

for (const file of files) {
  const n = Number(file.match(/l(\d+)$/)?.[1]);
  const exp = expected[n - 1];
  const items = all.filter((it) => it.file === file);
  const types = { mcq: 0, multi: 0, num: 0, word: 0 };
  const diffs = { 1: 0, 2: 0, 3: 0 };
  const pos = [0, 0, 0, 0, 0];
  for (const it of items) {
    types[it.type]++;
    diffs[it.diff]++;
    if (it.lessonId !== `m1u5l${n}`) fail(`${it.id}: lessonId ${it.lessonId}`);
    if (!it.diff) fail(`${it.id}: diff 누락`);
    if (plain(it.explain).length < 250 || plain(it.explain).length > 450) fail(`${it.id}: 해설 ${plain(it.explain).length}자, 250~450 위반`);
    if (!it.explain.includes("class='xh'")) fail(`${it.id}: xh 소제목 없음`);
    if (romanRe.test(it.prompt + it.options.join("") + it.explain)) fail(`${it.id}: 금지 로마 숫자 발견`);
    if (it.type === "mcq") {
      if (it.options.length !== 5) fail(`${it.id}: mcq 선택지 ${it.options.length}개`);
      if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer >= it.options.length) fail(`${it.id}: mcq answer 인덱스 오류`);
      else pos[it.answer]++;
      if (/shuffle:\s*false/.test(it.block) && it.answer === 0) fail(`${it.id}: shuffle:false + answer 0`);
      if (!it.explain.includes("오답") && !it.explain.includes("보기 하나씩")) fail(`${it.id}: mcq 오답 격파 소제목 없음`);
    }
    if (it.type === "multi") {
      if (it.options.length < 4 || it.options.length > 6) fail(`${it.id}: multi 선택지 ${it.options.length}개`);
      if (!Array.isArray(it.answer) || it.answer.length < 2 || new Set(it.answer).size !== it.answer.length || it.answer.some((x) => x < 0 || x >= it.options.length)) fail(`${it.id}: multi answer 오류`);
    }
    if (it.type === "num") {
      if (typeof it.answer !== "string") fail(`${it.id}: num answer 문자열 아님`);
      if (!it.unitLabel) fail(`${it.id}: num unitLabel 없음`);
      if (it.numKind === "int" && !/^\d+$/.test(it.answer)) fail(`${it.id}: int 답 형식 ${it.answer}`);
      if (it.numKind === "dec" && !/^\d+\.\d+$/.test(it.answer)) fail(`${it.id}: dec 답 형식 ${it.answer}`);
      if (/π|pi/i.test(it.answer)) fail(`${it.id}: num 답에 π 포함`);
    }
    if (it.type === "word") {
      if (it.bank.length < 8 || it.bank.length > 10) fail(`${it.id}: word bank ${it.bank.length}개`);
      if (it.bank[0] !== it.answer) fail(`${it.id}: word answer가 bank[0] 아님`);
    }
    if (/cm(?:2|3)|cm\^|cm<sup>|㎠|㎤/.test(it.prompt + it.options.join("") + it.explain)) warn(`${it.id}: cm 제곱·세제곱 표기 후보 수동 확인`);
  }
  if (items.length !== exp.total) fail(`${file}: ${items.length}문항, 기대 ${exp.total}`);
  if (types.mcq + types.multi !== exp.obj || types.num !== exp.num || types.word !== exp.word) fail(`${file}: 유형 ${types.mcq + types.multi}/${types.num}/${types.word}, 기대 ${exp.obj}/${exp.num}/${exp.word}`);
  if (diffs[1] !== exp.diff[0] || diffs[2] !== exp.diff[1] || diffs[3] !== exp.diff[2]) fail(`${file}: diff ${diffs[1]}/${diffs[2]}/${diffs[3]}, 기대 ${exp.diff.join("/")}`);
  console.log(`${file}: total=${items.length} types=${types.mcq + types.multi}/${types.num}/${types.word} diff=${diffs[1]}/${diffs[2]}/${diffs[3]} mcq-pos=${pos.join("/")}`);
  for (let i = 0; i < items.length; i++) {
    const want = `m1u5e${String(startId[n - 1] + i).padStart(3, "0")}`;
    if (items[i].id !== want) fail(`${file}: ID ${items[i].id}, 기대 ${want}`);
  }
}

const ids = all.map((it) => it.id);
if (new Set(ids).size !== ids.length) fail("ID 중복");
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const a = normPrompt(all[i].prompt);
    const b = normPrompt(all[j].prompt);
    if (Math.min(a.length, b.length) >= 14 && dice(a, b) >= 0.82) warn(`유사 문두 후보 ${all[i].id}/${all[j].id} score=${dice(a, b).toFixed(2)}`);
    if (all[i].figureCall && all[i].figureCall === all[j].figureCall) warn(`figure 호출 중복 후보 ${all[i].id}/${all[j].id}: ${all[i].figureCall}`);
  }
}

if (!onlyLesson) {
  const counts = { obj: 0, num: 0, word: 0, d1: 0, d2: 0, d3: 0, figures: 0 };
  for (const it of all) {
    if (it.type === "mcq" || it.type === "multi") counts.obj++; else counts[it.type]++;
    counts[`d${it.diff}`]++;
    if (it.figureCall) counts.figures++;
  }
  console.log("totals:", JSON.stringify(counts), `items=${all.length}`);
  if (all.length !== 200) fail(`총 문항 ${all.length}, 기대 200`);
  if (counts.obj !== 120 || counts.num !== 60 || counts.word !== 20) fail(`전체 유형 ${counts.obj}/${counts.num}/${counts.word}`);
  if (counts.d1 !== 80 || counts.d2 !== 80 || counts.d3 !== 40) fail(`전체 diff ${counts.d1}/${counts.d2}/${counts.d3}`);
}

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
