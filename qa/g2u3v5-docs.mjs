// 중2 Ⅲ v5의 글 자료를 뽑는다(브라우저에서 단원 표를 읽어 온다. 개발 모드에서 내놓는 window.__g2u3v5 와 __g2u3base).
//   1) 시험 풀과의 겹침 검사: 새로 쓴 문제와 랩의 글에서 16자 창을 밀어, 같은 16자가 단원 종합 평가(g2u3)의 문항에 있으면 잡는다.
//   2) 개념 글의 전과 후: <출력 폴더>/concept-before-after.md (지금의 정리 카드와 새 용어 스텝, 새 정리 카드)
//   3) 검산용 문제지(정답 없음): <출력 폴더>/problems-blind.md, 정답표는 <정답 폴더>/problems-key.json (검산하는 쪽에 보여 주지 않는다)
// 실행: PORT=5583 node qa/g2u3v5-docs.mjs <출력 폴더> <정답 폴더>   (또는 DIST=<개발 모드 번들 폴더>)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as L from "./g2u3v5-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ?? "qa/shots/g2u3v5";
const KEYDIR = process.argv[3] ?? OUT;
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(KEYDIR, { recursive: true });
const N = 16;
const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<b class='rm-h'>([^<]*)<\/b>/g, " [$1] ").replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const tight = (h) => strip(h).replace(/\s+/g, "");

const { browser, page } = await L.launch();
await page.goto(`${L.BASE}/?g2u3v5`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.__g2u3v5 && !!window.__g2u3base, null, { timeout: 25000 });
const { v5, base } = await page.evaluate(() => {
  const slim = (u) => u.lessons.map((l) => ({ id: l.id, title: l.title, steps: l.steps.map((s) => JSON.parse(JSON.stringify(s, (k, v) => (k === "svg" || k === "figure" || k === "art" ? (v ? "[그림]" : v) : v)))) }));
  return { v5: slim(window.__g2u3v5), base: slim(window.__g2u3base) };
});
await L.shutdown(browser);

const PROBLEM = ["quiz", "binSort", "order", "pairMatch", "hotspot"];
let fail = 0;

// ── 랩의 채점 판정(소스에서 읽는다) ──
const labDir = path.join(ROOT, "src/lessons/steps/g2u3v5");
const labAsks = [];
const mine = [];
for (const f of fs.readdirSync(labDir).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(labDir, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) mine.push({ where: `랩 ${f}`, t: tight(m[1]) });
  for (const m of src.matchAll(/slot\.ask\(\s*"([^"]+)",\s*\[([^\]]+)\]/g)) {
    const choices = [...m[2].matchAll(/\{\s*t:\s*"([^"]+)"(,\s*ok:\s*true)?\s*\}/g)].map((c) => ({ t: c[1], ok: !!c[2] }));
    if (choices.some((c) => c.ok)) labAsks.push({ file: f, q: m[1], choices });
  }
}

// ── 1) 겹침 검사 ──
const pool = [];
for (const f of fs.readdirSync(path.join(ROOT, "src/content/exams")).filter((x) => /^g2u3(l\d+)?\.ts$/.test(x))) {
  const src = fs.readFileSync(path.join(ROOT, "src/content/exams", f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
    const t = m[1] ?? m[2];
    if (/[가-힣]/.test(t)) pool.push({ f, t: tight(t) });
  }
}
const problems = [];
v5.forEach((l) => {
  l.steps.forEach((s, si) => {
    if (!PROBLEM.includes(s.type)) return;
    problems.push({ lesson: l.id, s });
    const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: tight(t) });
    add("문두", s.prompt);
    add("제목", s.title);
    (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
    (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
    (s.pairs ?? []).forEach((o, i) => add(`짝 ${i + 1}`, `${o.a} ${o.b}`));
    add("정답 해설", s.explainGood);
    add("오답 해설", s.explainBad);
  });
});
const hits = [];
for (const m of mine) {
  if (m.t.length < N) continue;
  for (let i = 0; i + N <= m.t.length; i++) {
    const w = m.t.slice(i, i + N);
    const p = pool.find((x) => x.t.includes(w));
    if (p) {
      hits.push(`${m.where} ↔ ${p.f}: "${w}"`);
      break;
    }
  }
}
console.log(`겹침 검사: 내 글 ${mine.length}토막, 시험 풀 ${pool.length}토막, 겹침 ${hits.length}건`);
hits.forEach((h) => console.log("  -", h));
if (hits.length) fail++;

// ── 2) 개념 글의 전과 후 ──
const md = ["# 중2 Ⅲ 빛과 파동 v5: 개념 글의 전과 후", "", "레슨마다 지금 판(정본)의 개념 스텝과 정리 카드, 새 판의 용어 스텝과 정리 카드를 나란히 적었다. 지금 판의 Ⅲ단원에는 개념 스텝이 하나도 없다(도입, 랩, 정리, 문제 구성이었다).", ""];
const cardLines = (c) => [`- **${strip(c.name)}**: ${strip(c.text)}`, ...(c.examples?.length ? [`  - 예: ${c.examples.map(strip).join(" / ")}`] : []), ...(c.more ? [`  - 자세히: ${strip(c.more)}`] : [])];
v5.forEach((l, li) => {
  md.push(`## ${l.id} ${strip(l.title)}`, "", "### 지금(정본)");
  const oldConcepts = base[li].steps.filter((s) => s.type === "concept");
  md.push(oldConcepts.length ? `개념 스텝 ${oldConcepts.length}개` : "개념 스텝: 없음");
  base[li].steps.filter((s) => s.type === "recap").forEach((r) => {
    md.push("", `정리: ${strip(r.title)}`, `쌤의 말: ${strip(r.narrator)}`, ...r.cards.flatMap(cardLines));
    if (r.note) md.push(`- 메모(${strip(r.note.title)}): ${strip(r.note.html)}`);
  });
  md.push("", "### 새 판(v5)");
  l.steps.filter((s) => s.type === "concept").forEach((c) => {
    md.push("", `용어 스텝: ${strip(c.title)}`, `머리말: ${strip(c.lead)}`);
    (c.blocks ?? []).forEach((b) => {
      if (b.k === "term") md.push(`- **${strip(b.name)}**: ${strip(b.def)}`);
      else if (b.k === "note") md.push(`- 메모: ${strip(b.html)}`);
    });
  });
  l.steps.filter((s) => s.type === "recap").forEach((r) => {
    md.push("", `정리: ${strip(r.title)}`, `쌤의 말: ${strip(r.narrator)}`, ...r.cards.flatMap(cardLines));
    if (r.note) md.push(`- 메모(${strip(r.note.title)}): ${strip(r.note.html)}`);
  });
  md.push("");
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), md.join("\n"));

// ── 3) 검산용 문제지와 정답표 ──
const blind = ["# 중2 Ⅲ 빛과 파동 v5: 검산용 문제지(정답 없음)", "", "랩 안의 채점 판정(가)과 랩 뒤의 문제(나)다. 보기의 차례는 화면에서 섞인다(차례를 고정한 문항은 따로 적었다). 그림이 있는 문항은 레슨별 화면 그림을 함께 본다.", "", "## 가. 랩의 채점 판정", ""];
const keyOut = { lab: [], problems: [] };
labAsks.forEach((a, i) => {
  const order = a.choices.map((c) => c.t).sort((x, y) => x.localeCompare(y, "ko"));
  blind.push(`${i + 1}. (${a.file}) ${a.q}`, ...order.map((t, k) => `   - ${"①②③④⑤"[k]} ${t}`), "");
  keyOut.lab.push({ n: i + 1, q: a.q, answer: a.choices.find((c) => c.ok).t });
});
blind.push("## 나. 랩 뒤의 문제", "");
let n = 0;
problems.forEach(({ lesson, s }) => {
  n++;
  const head = `${n}. [${lesson}]`;
  if (s.type === "quiz") {
    const mode = s.mode ?? "mcq";
    blind.push(`${head} ${mode === "ox" ? "(OX)" : mode === "multi" ? "(모두 고르기)" : "(하나 고르기)"}${s.shuffle === false ? " (보기 차례 고정)" : ""} ${strip(s.prompt)}${s.figure ? " [그림 있음]" : ""}`);
    if (mode !== "ox") {
      const opts = s.shuffle === false ? s.options : [...s.options].sort((x, y) => strip(x).localeCompare(strip(y), "ko"));
      opts.forEach((o, k) => blind.push(`   - ${"①②③④⑤"[k]} ${strip(o)}`));
    }
    keyOut.problems.push({ n, lesson, mode, answer: mode === "ox" ? (s.answer ? "O" : "X") : (Array.isArray(s.answer) ? s.answer : [s.answer]).map((a) => strip(s.options[a])) });
  } else if (s.type === "binSort") {
    blind.push(`${head} (분류) ${strip(s.title)}: 통은 ${s.bins.map((b) => strip(b.label)).join(", ")}`);
    [...s.items].sort((x, y) => x.label.localeCompare(y.label, "ko")).forEach((it) => blind.push(`   - ${strip(it.label)}`));
    keyOut.problems.push({ n, lesson, mode: "binSort", answer: s.items.map((it) => `${strip(it.label)} → ${s.bins.find((b) => b.id === it.bin).label}`) });
  } else if (s.type === "order") {
    blind.push(`${head} (순서) ${strip(s.title)}: ${strip(s.lead)}`);
    [...s.items].sort((x, y) => x.localeCompare(y, "ko")).forEach((it) => blind.push(`   - ${strip(it)}`));
    keyOut.problems.push({ n, lesson, mode: "order", answer: s.items.map(strip) });
  } else if (s.type === "pairMatch") {
    blind.push(`${head} (짝 잇기) ${strip(s.title)}`, `   - 왼쪽: ${s.pairs.map((p) => strip(p.a)).join(" / ")}`, `   - 오른쪽: ${[...s.pairs].map((p) => strip(p.b)).sort((x, y) => x.localeCompare(y, "ko")).join(" / ")}`);
    keyOut.problems.push({ n, lesson, mode: "pairMatch", answer: s.pairs.map((p) => `${strip(p.a)} → ${strip(p.b)}`) });
  }
  blind.push("");
});
fs.writeFileSync(path.join(OUT, "problems-blind.md"), blind.join("\n"));
fs.writeFileSync(path.join(KEYDIR, "problems-key.json"), JSON.stringify(keyOut, null, 1));
console.log(`문제지: 랩 판정 ${labAsks.length}개, 문제 ${problems.length}개 → ${path.join(OUT, "problems-blind.md")}`);
console.log(`개념 글의 전과 후 → ${path.join(OUT, "concept-before-after.md")}`);
process.exit(fail ? 1 : 0);
