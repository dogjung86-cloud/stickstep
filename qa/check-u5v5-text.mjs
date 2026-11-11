// 중1 Ⅴ v5의 글 검사(개념, 정리, 문제). 개발 서버 필요: PORT=5575 node qa/check-u5v5-text.mjs [판정 자료 폴더]
//  1) 새로 쓴 문제의 글과 랩, 도입의 글을 16자 창으로 밀어 단원 종합 평가 문제 은행(u5)과 겹치는지 본다.
//  2) 새로 쓴 선택형, OX, 복수 선택 문제를 화면에서 정답으로 한 번씩 눌러 정답으로 채점되는지 본다(data-oi).
//  3) 금지어(대시, '교과서', '분자', 이모지)를 새 글에서 찾는다.
//  4) 판정 자료를 뽑는다: 정답 없는 문제지(blind.md), 정답표(key.json), 개념 글의 전과 후(concept-before-after.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, openLesson, fwd, W, ctaState, cta } from "./u5v5-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ?? "qa/shots/u5v5";
fs.mkdirSync(OUT, { recursive: true });
const N = 16;
let pass = 0, fail = 0;
const ok = (c, msg) => { if (c) pass++; else { fail++; console.log("  FAIL " + msg); } };

const labTexts = [];
for (const dir of ["src/lessons/steps/u5v5", "src/lessons/steps/opener/u5"]) {
  for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((x) => x.endsWith(".ts"))) {
    const src = fs.readFileSync(path.join(ROOT, dir, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
    for (const m of src.matchAll(/["`]((?:[^"`\\\n]|\\.)*)["`]/g)) if (/[가-힣]/.test(m[1])) labTexts.push({ where: f, t: m[1] });
  }
}

const { browser, page, errors } = await launch();
await openLesson(page, "u5l1");
const r = await page.evaluate(async ({ N, labTexts }) => {
  const strip = (h) => String(h ?? "").replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ");
  const tight = (h) => strip(h).replace(/\s+/g, "");
  const ex = await import("/src/content/exams/index.ts");
  const base = (await import("/src/content/unit5.ts")).UNIT5;
  const v5 = (await import("/src/content/unit5v5.ts")).UNIT5_V5;
  const exam = ex.examForUnit("u5");
  const pool = [];
  exam.pool.forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => pool.push({ id: it.id, t: tight(t) })));
  const j = (x) => JSON.stringify(x, (k, v) => (k === "n" || k === "of" ? undefined : v));
  const oldSteps = new Set(base.lessons.flatMap((l) => l.steps.map(j)));
  const mine = [], quiz = [], blind = [], key = [], ba = [];
  v5.lessons.forEach((l, li) => {
    const bl = base.lessons[li];
    // 개념 글의 전과 후
    const oldRecap = bl.steps.find((s) => s.type === "recap");
    const newRecap = l.steps.find((s) => s.type === "recap");
    const newCon = l.steps.find((s) => s.type === "concept");
    ba.push(`## ${l.id} ${l.title}\n\n### 전(정본의 정리 카드)\n- 쌤의 말: ${strip(oldRecap.narrator)}\n` + oldRecap.cards.map((c) => `- **${c.name}**: ${strip(c.text)}\n  - 자세히: ${strip(c.more)}`).join("\n") + `\n- 메모: ${strip(oldRecap.note?.html)}\n\n### 후\n` +
      (newCon ? `**개념 스텝 「${strip(newCon.title.replace("<br>", " "))}」**\n- 이끄는 글: ${strip(newCon.lead)}\n` + newCon.blocks.map((b) => (b.k === "term" ? `- 용어 **${b.name}**: ${strip(b.def)}` : b.k === "note" ? `- 메모: ${strip(b.html)}` : "")).filter(Boolean).join("\n") + "\n\n" : "(개념 스텝 없음: 만화가 중력, 무게, 질량을 용어 카드로 정의한다)\n\n") +
      `**정리 「${strip(newRecap.title.replace("<br>", " "))}」**\n- 쌤의 말: ${strip(newRecap.narrator)}\n` + newRecap.cards.map((c) => `- **${c.name}**: ${strip(c.text)}\n  - 자세히: ${strip(c.more)}`).join("\n") + `\n- 메모: ${strip(newRecap.note?.html)}\n`);
    l.steps.forEach((s, si) => {
      if (oldSteps.has(j(s)) || !["quiz", "binSort", "order", "pairMatch", "concept", "recap"].includes(s.type)) return;
      const isQ = ["quiz", "binSort", "order", "pairMatch"].includes(s.type); // 겹침은 문제 글만 본다(정의와 정리 글은 표준 표현이라 시험 해설과 닮을 수밖에 없다)
      const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: tight(t), raw: strip(t), q: isQ });
      add("문두", s.prompt); add("제목", s.title); add("안내", s.lead); add("쌤의 말", s.narrator);
      (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
      (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
      (s.blocks ?? []).forEach((b, i) => add(`블록 ${i + 1}`, b.def ?? b.html));
      (s.cards ?? []).forEach((c, i) => { add(`카드 ${i + 1}`, c.text); add(`카드 ${i + 1} 자세히`, c.more); (c.examples ?? []).forEach((e) => add(`카드 ${i + 1} 예`, e)); });
      add("메모", s.note?.html); add("정답 해설", s.explainGood); add("오답 해설", s.explainBad);
      if (s.type === "quiz") {
        quiz.push({ id: l.id, si, mode: s.mode, answer: s.answer });
        const no = blind.length + 1;
        blind.push(`${no}. [${l.id}, ${s.mode === "multi" ? "모두 고르기" : s.mode === "ox" ? "OX" : "하나 고르기"}${s.figure ? ", 그림 있음" : ""}] ${strip(s.prompt)}\n` + (s.options ?? []).map((o, i) => `   (${i + 1}) ${strip(o)}`).join("\n"));
        key.push({ no, id: l.id, answer: s.mode === "ox" ? (s.answer ? "O" : "X") : [].concat(s.answer).map((a) => a + 1) });
      }
      if (s.type === "order") {
        const no = blind.length + 1;
        const sh = s.items.map((t, i) => ({ t, i })).sort((a, b) => a.t.localeCompare(b.t));
        blind.push(`${no}. [${l.id}, 순서 놓기] ${strip(s.title.replace("<br>", " "))} ${strip(s.lead)}\n` + sh.map((o, i) => `   (${"가나다라마"[i]}) ${o.t}`).join("\n"));
        key.push({ no, id: l.id, answer: s.items.map((t) => "가나다라마"[sh.findIndex((o) => o.t === t)]).join(" → ") });
      }
    });
  });
  labTexts.forEach((x) => mine.push({ where: `랩과 도입 ${x.where}`, t: tight(x.t), raw: strip(x.t), q: true }));
  const hits = [];
  for (const q of mine.filter((x) => x.q)) for (let i = 0; i + N <= q.t.length; i++) {
    const w = q.t.slice(i, i + N);
    const p = pool.find((x) => x.t.includes(w));
    if (p) { hits.push(`${q.where} / 시험 ${p.id}: "${w}"`); break; }
  }
  const bad = mine.filter((q) => /[—–]|교과서|분자|\p{Extended_Pictographic}/u.test(q.raw)).map((q) => `${q.where}: ${q.raw.slice(0, 40)}`);
  const seq = v5.lessons.map((l) => `${l.id}: ${l.steps.map((s) => (s.type === "quiz" ? s.mode : s.type)).join(" → ")}`);
  return { pool: exam.pool.length, mine: mine.length, hits, bad, quiz, blind, key, ba, seq };
}, { N, labTexts });

console.log(r.seq.join("\n"));
console.log(`겹침 검사(${N}자 창): 시험 문항 ${r.pool}개와 새 글 ${r.mine}조각, 겹침 ${r.hits.length}건`);
r.hits.forEach((h) => console.log(" -", h));
ok(r.hits.length === 0, `시험 풀과 겹침 ${r.hits.length}건`);
ok(r.bad.length === 0, `금지어 ${r.bad.length}건: ${r.bad.slice(0, 4).join(" / ")}`);
fs.writeFileSync(path.join(OUT, "blind.md"), "# Ⅴ단원 새 문제(정답 없음)\n\n" + r.blind.join("\n\n") + "\n");
fs.writeFileSync(path.join(OUT, "key.json"), JSON.stringify(r.key, null, 1));
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), "# Ⅴ단원 개념 글의 전과 후\n\n전은 지금 운영 중인 정본(정리 카드에만 개념 설명이 있다), 후는 `?u5v5`의 새 개념 스텝과 새 정리다.\n\n" + r.ba.join("\n\n") + "\n");

// 새 문제를 정답으로 한 번씩 눌러 본다
for (const q of r.quiz) {
  await openLesson(page, q.id);
  for (let i = 0; i < q.si; i++) await fwd(page);
  if (q.mode === "ox") await page.evaluate((v) => document.querySelector(`.screen.active .ox-btn.${v ? "o" : "x"}`)?.click(), q.answer);
  else for (const a of [].concat(q.answer)) await page.evaluate((a) => document.querySelector(`.screen.active .opts .opt[data-oi="${a}"]`)?.click(), a);
  await W(page, 250);
  const c = await ctaState(page);
  ok(c.enabled && c.text === "확인하기", `${q.id} 스텝 ${q.si + 1}: 확인 버튼 "${c.text}" enabled=${c.enabled}`);
  await cta(page);
  const good = await page.evaluate(() => document.querySelector(".screen.active .sheet")?.classList.contains("good") ?? null);
  ok(good === true, `${q.id} 스텝 ${q.si + 1}(${q.mode}): 정답으로 채점되지 않음(${good})`);
}
// 개념과 정리, 순서 스텝이 오류 없이 열리는지
for (const id of ["u5l1", "u5l2", "u5l3", "u5l4", "u5l5", "u5l6", "u5l7"]) {
  await openLesson(page, id);
  const n = await page.evaluate(async (id) => (await import("/src/content/unit5v5.ts")).UNIT5_V5.lessons.find((l) => l.id === id).steps.length, id);
  for (let i = 1; i < n; i++) {
    await fwd(page);
    const has = await page.evaluate(() => (document.querySelector(".screen.active .step")?.textContent ?? "").length);
    ok(has > 20, `${id} 스텝 ${i + 1}: 화면이 비어 있음`);
    if (i === 2 || i === 3) await page.screenshot({ path: path.join(OUT, `${id}-text${i}.png`) });
  }
}
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
