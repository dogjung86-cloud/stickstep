// 중1 Ⅳ v5의 글 자료를 뽑는다(브라우저에서 단원 표를 읽어 온다. 개발 모드 번들이 내놓는 window.__u4v5 와 __u4base).
//   1) 시험 풀과의 겹침 검사: 새로 쓴 문제와 랩의 글에서 16자 창을 밀어, 같은 16자가 단원 종합 평가(u4)의 문항에 있으면 잡는다.
//   2) 개념 글의 전과 후: <출력 폴더>/concept-before-after.md (지금의 정리 카드와 새 용어 스텝, 새 정리 카드)
//   3) 검산용 문제지(정답 없음): <출력 폴더>/problems-blind.md, 정답표는 <정답 폴더>/problems-key.json (검산하는 쪽에 보여 주지 않는다)
// 실행: DIST=<개발 모드 번들 폴더> node qa/u4v5-docs.mjs <출력 폴더> <정답 폴더>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as L from "./u4v5-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ?? "qa/shots/u4v5";
const KEYDIR = process.argv[3] ?? OUT;
const N = 16;
const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const tight = (h) => strip(h).replace(/\s+/g, "");

const { browser, page } = await L.launch();
await page.goto(`${L.BASE}/?u4v5`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.__u4v5, null, { timeout: 20000 });
const { v5, base } = await page.evaluate(() => {
  const slim = (u) => u.lessons.map((l) => ({ id: l.id, title: l.title, steps: l.steps.map((s) => JSON.parse(JSON.stringify(s, (k, v) => (k === "svg" || k === "figure" || k === "art" ? (v ? "[그림]" : v) : v)))) }));
  return { v5: slim(window.__u4v5), base: slim(window.__u4base) };
});
await browser.close();

const key = (s) => JSON.stringify(s, (k, v) => (k === "n" || k === "of" ? undefined : v));
const PROBLEM = ["quiz", "binSort", "order", "pairMatch", "hotspot"];
let fail = 0;

// ── 1) 겹침 검사 ──
const pool = [];
for (const f of fs.readdirSync(path.join(ROOT, "src/content/exams")).filter((x) => /^u4(l\d+)?\.ts$/.test(x))) {
  const src = fs.readFileSync(path.join(ROOT, "src/content/exams", f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const t = m[1] ?? m[2];
    if (/[가-힣]/.test(t)) pool.push({ f, t: tight(t) });
  }
}
const mine = [];
const newProblems = [];
v5.forEach((l, li) => {
  const old = new Set(base[li].steps.map(key));
  l.steps.forEach((s, si) => {
    if (old.has(key(s)) || !PROBLEM.includes(s.type)) return;
    newProblems.push({ lesson: l.id, s });
    const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: tight(t) });
    add("문두", s.prompt);
    add("제목", s.title);
    (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
    (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
    add("정답 해설", s.explainGood);
    add("오답 해설", s.explainBad);
  });
});
for (const f of fs.readdirSync(path.join(ROOT, "src/lessons/steps/u4v5")).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(ROOT, "src/lessons/steps/u4v5", f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) mine.push({ where: `랩 ${f}`, t: tight(m[1]) });
}
const hits = [];
for (const q of mine) {
  for (let i = 0; i + N <= q.t.length; i++) {
    const w = q.t.slice(i, i + N);
    const p = pool.find((x) => x.t.includes(w));
    if (p) {
      hits.push(`${q.where} / 시험 ${p.f}: "${w}"`);
      break;
    }
  }
}
console.log(`겹침 검사: 새 문제 ${newProblems.length}개와 랩의 글 ${mine.length}토막을 시험 풀 ${pool.length}토막과 견줌. 겹침 ${hits.length}건`);
hits.forEach((h) => console.log("  " + h));
if (hits.length) fail++;

// ── 2) 개념 글의 전과 후 ──
const md = ["# Ⅳ단원 개념 글의 전과 후", "", "지금(정본)에는 개념 스텝이 없고 개념 설명이 정리 카드에만 있다. v5는 레슨마다 용어 스텝을 두고(u4l4는 새 용어가 없어 두지 않았다) 정리 카드를 새 랩의 장면으로 다시 썼다.", "글은 화면의 굵은 글씨와 줄바꿈을 걷어 낸 것이다.", ""];
const recapMd = (s) => {
  const out = [`- 제목: ${strip(s.title)}`, `- 쌤의 말: ${strip(s.narrator)}`];
  (s.cards ?? []).forEach((c) => {
    out.push(`- 카드 「${strip(c.name)}」: ${strip(c.text)}`);
    out.push(`  - 예: ${(c.examples ?? []).join(", ")}`);
    out.push(`  - 자세히: ${strip(c.more)}`);
  });
  if (s.note) out.push(`- 메모 「${strip(s.note.title)}」: ${strip(s.note.html)}`);
  return out;
};
v5.forEach((l, li) => {
  md.push(`## ${l.id} ${strip(l.title)}`, "", "### 지금(정본)의 정리", "");
  base[li].steps.filter((s) => s.type === "recap").forEach((s) => md.push(...recapMd(s)));
  md.push("", "### v5의 용어 스텝", "");
  const cs = l.steps.filter((s) => s.type === "concept");
  if (!cs.length) md.push("(없음: 이 소단원에는 새로 정의할 용어가 없다)");
  cs.forEach((s) => {
    md.push(`- 제목: ${strip(s.title)}`, `- 이끄는 말: ${strip(s.lead)}`);
    (s.blocks ?? []).forEach((b) => md.push(b.k === "term" ? `- 용어 「${b.name}」: ${strip(b.def)}` : `- 메모: ${strip(b.html)}`));
  });
  md.push("", "### v5의 정리", "");
  l.steps.filter((s) => s.type === "recap").forEach((s) => md.push(...recapMd(s)));
  md.push("");
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), md.join("\n"));

// ── 3) 검산용 문제지 ──
let seed = 20261112;
const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
const sheet = ["# Ⅳ단원 v5 새 문제(검산용, 정답 없음)", "", "보기의 차례는 섞었다. 선택형은 하나, '모두 고르세요'는 여러 개를 고른다.", ""];
const answers = [];
let no = 0;
newProblems.filter((p) => p.s.type === "quiz").forEach(({ lesson, s }) => {
  no += 1;
  const order = (s.options ?? []).map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  sheet.push(`## ${no}. (${lesson}) ${strip(s.prompt)}`, "");
  order.forEach((oi, k) => sheet.push(`${k + 1}) ${strip(s.options[oi])}`));
  sheet.push("");
  const ans = Array.isArray(s.answer) ? s.answer : [s.answer];
  answers.push({ no, lesson, answer: ans.map((a) => order.indexOf(a) + 1).sort() });
});
fs.writeFileSync(path.join(OUT, "problems-blind.md"), sheet.join("\n"));
fs.mkdirSync(KEYDIR, { recursive: true });
fs.writeFileSync(path.join(KEYDIR, "problems-key.json"), JSON.stringify(answers, null, 1));
console.log(`개념 글의 전과 후, 문제지(${no}문항)를 ${OUT} 에 씀. 정답표는 ${KEYDIR}`);
process.exit(fail ? 1 : 0);
