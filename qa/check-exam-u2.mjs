// 중1 과학 II 생물의 구성과 다양성 시험 풀 기계 검사.
// node qa/check-exam-u2.mjs
import { existsSync, readFileSync } from "node:fs";

const files = ["u2l1", "u2l2", "u2l3", "u2l4", "u2l5", "u2l6"];
const expectedByFile = {
  u2l1: { mcq: 14, multi: 2, num: 2, word: 2 },
  u2l2: { mcq: 12, multi: 2, num: 4, word: 2 },
  u2l3: { mcq: 13, multi: 1, num: 2, word: 4 },
  u2l4: { mcq: 13, multi: 2, num: 2, word: 3 },
  u2l5: { mcq: 14, multi: 2, num: 2, word: 2 },
  u2l6: { mcq: 14, multi: 1, num: 2, word: 3 },
};

let all = [];
let sources = "";
for (const file of files) {
  const path = `src/content/exams/${file}.ts`;
  if (!existsSync(path)) {
    console.log("FAIL", `${path} 없음`);
    process.exitCode = 1;
    continue;
  }
  const src = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  sources += `\n${src}`;
  for (const block of src.split(/\n  \{\n/).slice(1)) {
    const id = block.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const prompt = block.match(/prompt: "([^"]*)"/)?.[1] ?? "";
    const type = block.match(/type: "(mcq|multi|num|word)"/)?.[1];
    const lessonId = block.match(/lessonId: (?:L|"([^"]+)")/)?.[1] ?? file;
    const shuffle = /shuffle: false/.test(block);
    const ansRaw = block.match(/answer: (\[[^\]]*\]|"[^"]*"|\d+)/)?.[1] ?? "";
    const bank = block.match(/bank: \[([^\]]*)\]/)?.[1];
    const options = block.match(/options: \[([\s\S]*?)\],\n    answer:/)?.[1];
    const bogi = block.match(/bogi: \[([\s\S]*?)\],\n    options:/)?.[1];
    const explain = block.match(/explain:\s*\n?\s*"([\s\S]*?)",\n    core/)?.[1] ?? "";
    const core = block.match(/core: "([\s\S]*?)",\n  \}/)?.[1] ?? "";
    const figure = /\n    figure:/.test(block);
    const unitLabel = block.match(/unitLabel: "([^"]+)"/)?.[1];
    all.push({ file, id, prompt, type, lessonId, shuffle, ansRaw, bank, options, bogi, explain, core, figure, unitLabel });
  }
}

let bad = process.exitCode ? 1 : 0;
const fail = (m) => { console.log("FAIL", m); bad++; };
const warn = (m) => console.log("WARN", m);
const strings = (raw = "") => [...raw.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]);
const plain = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\\n|<br\s*\/?\s*>/gi, "").replace(/&[^;]+;/g, "가");

if (all.length !== 120) fail(`총 문항 ${all.length} ≠ 120`);
const ids = all.map((x) => x.id);
if (new Set(ids).size !== ids.length) fail("id 중복 존재");
for (let i = 0; i < ids.length; i++) {
  const wants = [`u2e${String(i + 1).padStart(2, "0")}`, `u2e${i + 1}`];
  if (!wants.includes(ids[i])) { fail(`연번 어긋남: ${ids[i]} (기대 ${wants.join("|")})`); break; }
}

const counts = { mcq: 0, multi: 0, num: 0, word: 0 };
for (const it of all) counts[it.type] = (counts[it.type] ?? 0) + 1;
console.log("counts:", JSON.stringify(counts), "total:", all.length);
if (counts.mcq !== 80) fail(`mcq ${counts.mcq} ≠ 80`);
if (counts.multi !== 10) fail(`multi ${counts.multi} ≠ 10`);
if (counts.num !== 14) fail(`num ${counts.num} ≠ 14`);
if (counts.word !== 16) fail(`word ${counts.word} ≠ 16`);

for (const file of files) {
  const items = all.filter((x) => x.file === file);
  if (items.length !== 20) fail(`${file}: ${items.length}문항 ≠ 20`);
  const got = { mcq: 0, multi: 0, num: 0, word: 0 };
  items.forEach((x) => got[x.type]++);
  for (const type of Object.keys(got)) if (got[type] !== expectedByFile[file][type]) fail(`${file} ${type}: ${got[type]} ≠ ${expectedByFile[file][type]}`);
  for (const it of items) if (it.lessonId !== file) fail(`${it.id}: lessonId ${it.lessonId} ≠ ${file}`);
}

for (const it of all) {
  if (!it.type) fail(`${it.id}: type 누락`);
  if (!it.explain) fail(`${it.id}: explain 파싱 실패 또는 누락`);
  if (!it.core) fail(`${it.id}: core 누락`);
  const n = plain(it.explain).length;
  if (n < 250 || n > 450) fail(`${it.id}: 해설 ${n}자(250~450 요구)`);
  if (it.shuffle && it.ansRaw === "0") fail(`${it.id}: shuffle:false인데 첫 보기 정답`);

  if (it.type === "mcq") {
    const opts = strings(it.options);
    if (opts.length !== 5) fail(`${it.id}: mcq 보기 ${opts.length}개 ≠ 5`);
    if (it.bogi && !it.shuffle) fail(`${it.id}: bogi 합답형인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!it.ansRaw.startsWith("[")) fail(`${it.id}: multi answer가 배열이 아님`);
    const opts = strings(it.options);
    if (opts.length < 4 || opts.length > 6) fail(`${it.id}: multi 보기 ${opts.length}개(4~6 요구)`);
  }
  if (it.type === "num") {
    if (!it.ansRaw.startsWith('"')) fail(`${it.id}: num answer가 문자열이 아님`);
    if (!it.unitLabel) fail(`${it.id}: num unitLabel 없음`);
  }
  if (it.type === "word") {
    if (!it.bank) fail(`${it.id}: word bank 없음`);
    const chips = strings(it.bank);
    const ans = it.ansRaw.replaceAll('"', "");
    if (chips.length < 8 || chips.length > 10) fail(`${it.id}: word bank ${chips.length}개(8~10 요구)`);
    if (!chips.includes(ans)) fail(`${it.id}: word 정답 '${ans}'이 bank에 없음`);
  }
}

const bogiCount = all.filter((x) => x.bogi).length;
const figureCount = all.filter((x) => x.figure).length;
console.log(`bogi=${bogiCount} figureItems=${figureCount}`);
if (bogiCount < 10) fail(`ㄱㄴㄷ bogi 문항 ${bogiCount}개 < 10`);
if (figureCount < 30) fail(`그림·사진 문항 ${figureCount}개 < 30`);
if (figureCount > 36) warn(`그림·사진 문항 ${figureCount}개 > 권장 상한 36(피로도 수동 확인)`);
if (/loading=["']lazy["']/.test(sources)) fail("시험 풀에 loading=lazy 사용");

// ximg/xpair는 런타임에 경로를 이어 붙이므로 완성된 exam/u2 문자열뿐 아니라
// 소스 안의 이미지 파일명 리터럴도 수집한다.
const imageRefs = [
  ...[...sources.matchAll(/exam\/u2\/([^"'}]+\.(?:webp|png|jpg|jpeg))/gi)].map((m) => m[1]),
  ...[...sources.matchAll(/["']([^"']+\.(?:webp|png|jpg|jpeg))["']/gi)].map((m) => m[1]),
].filter((x) => !x.includes("${"));
const imageUse = new Map();
for (const file of imageRefs) imageUse.set(file, (imageUse.get(file) ?? 0) + 1);
for (const file of new Set(imageRefs)) {
  const webp = `public/exam/u2/${file.replace(/\.(png|jpg|jpeg)$/i, ".webp")}`;
  const original = `public/exam/u2/${file}`;
  if (!existsSync(webp) && !existsSync(original)) fail(`이미지 없음: ${file}`);
}
const reused = [...imageUse].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
console.log(`imageRefs=${new Set(imageRefs).size}`, reused.length ? `reused=${reused.map(([f, n]) => `${f}:${n}`).join(",")}` : "reused=none");

// 기존 레슨 퀴즈 문두의 그대로 복사를 막는다. 그림 재사용은 허용하지만 질문 각도는 새로워야 한다.
const lessonSource = readFileSync("src/content/unit2.ts", "utf8");
const normPrompt = (s) => s.replace(/<[^>]+>/g, "").replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
const lessonPrompts = new Set([...lessonSource.matchAll(/prompt:\s*"([^"]+)"/g)].map((m) => normPrompt(m[1])));
const copiedPrompts = all.filter((x) => x.prompt && lessonPrompts.has(normPrompt(x.prompt))).map((x) => x.id);
if (copiedPrompts.length) fail(`기존 레슨 문두 직복사 후보: ${copiedPrompts.join(", ")}`);

// 접근성 문구가 정답을 직접 말하는 전형적인 실수를 후보로 드러낸다.
const a11yCandidates = [...sources.matchAll(/(?:alt|aria-label)=["']([^"']+)["']/gi)]
  .map((m) => m[1])
  .filter((s) => /정답|옳은|틀린|답은|해답/.test(s));
if (a11yCandidates.length) fail(`alt·aria-label 정답 단서 후보: ${a11yCandidates.join(" | ")}`);

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
