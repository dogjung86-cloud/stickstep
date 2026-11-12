// 중2 Ⅱ v5의 판정 자료 뽑기와 겹침 검사(개발 서버가 떠 있어야 한다).
//   1) 새로 쓴 문제와 랩의 글을 16자 창으로 밀어 단원 종합 평가 문제 은행(g2u2)에 같은 16자가 있는지 본다.
//   2) 정답 없는 문제지(problems-blind.md)와 정답표(answers.json, 검산 대조용)를 뽑는다.
//   3) 개념 글의 전과 후(concept-before-after.md)를 뽑는다: 정본의 개념 스텝과 정리 카드, 새 판의 개념 스텝과 정리 카드.
// 실행: PORT=5582 node qa/g2u2v5-docs.mjs <출력 폴더> [정답표를 둘 폴더]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as L from "./u4v5-lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.argv[2] ?? "qa/shots/g2u2v5";
const KEYDIR = process.argv[3] ?? OUT;
fs.mkdirSync(OUT, { recursive: true });
const N = 16;

const labTexts = [];
for (const dir of ["src/lessons/steps/g2u2v5", "src/lessons/steps/opener/g2u2"]) {
  for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((x) => x.endsWith(".ts"))) {
    const src = fs.readFileSync(path.join(ROOT, dir, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
    for (const m of src.matchAll(/["`]((?:[^"`\\\n]|\\.)*)["`]/g)) if (/[가-힣]/.test(m[1])) labTexts.push({ where: f, t: m[1] });
  }
}

const { browser, page } = await L.launch();
await page.goto(`${L.BASE}/?g2u2v5`, { waitUntil: "domcontentloaded" });
const r = await page.evaluate(async ({ N, labTexts }) => {
  const strip = (h) => String(h ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, "");
  const plain = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<b class='rm-h'>([^<]*)<\/b>/g, "\n  [$1] ").replace(/<span class='fun'>/g, "\n  [덤] ").replace(/<[^>]+>/g, "").replace(/\s+\n/g, "\n").trim();
  const ex = await import("/src/content/exams/index.ts");
  const base = (await import("/src/content/g2/unit2.ts")).G2_UNIT2;
  const v5 = (await import("/src/content/g2/unit2v5.ts")).G2_UNIT2_V5;
  const exam = ex.examForUnit("g2u2");
  const pool = [];
  (exam?.pool ?? []).forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => pool.push({ id: it.id, t: strip(t) })));
  const mine = [];
  const blind = [], key = [];
  let qn = 0;
  v5.lessons.forEach((l) => {
    blind.push(`\n## ${l.id} ${l.title}\n`);
    let n = 0;
    l.steps.forEach((s, si) => {
      if (!["quiz", "binSort", "order", "pairMatch"].includes(s.type)) return;
      qn++; n++;
      const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: strip(t) });
      const id = `${l.id}-${n}`;
      if (s.type === "quiz") {
        add("문두", s.prompt); (s.options ?? []).forEach((o, i) => add(`보기${i + 1}`, o)); add("해설", s.explainGood); add("해설", s.explainBad);
        const mode = s.mode ?? "mcq";
        const fig = s.figure ? ` (그림 있음: ${(String(s.figure).match(/aria-label="([^"]*)"/) ?? String(s.figure).match(/alt="([^"]*)"/) ?? [, "그림"])[1].slice(0, 60)})` : "";
        blind.push(`**${id}** [${mode === "ox" ? "OX" : mode === "multi" ? "모두 고르기" : "하나 고르기"}] ${plain(s.prompt)}${fig}`);
        if (mode !== "ox") (s.options ?? []).forEach((o, i) => blind.push(`- (${i + 1}) ${plain(o)}`));
        blind.push("");
        key.push({ id, answer: mode === "ox" ? (s.answer ? "O" : "X") : (Array.isArray(s.answer) ? s.answer : [s.answer]).map((a) => a + 1).join(",") });
      } else if (s.type === "order") {
        add("제목", s.title); s.items.forEach((o, i) => add(`항목${i + 1}`, o)); add("해설", s.explainGood); add("해설", s.explainBad);
        const sh = s.items.map((t, i) => ({ t, i })).sort((a, b) => (a.t < b.t ? -1 : 1));
        blind.push(`**${id}** [순서 놓기] ${plain(s.title)}: ${plain(s.lead ?? "")}`);
        sh.forEach((o, i) => blind.push(`- (${"가나다라마"[i]}) ${plain(o.t)}`));
        blind.push("");
        key.push({ id, answer: s.items.map((_, i) => "가나다라마"[sh.findIndex((o) => o.i === i)]).join("→") });
      } else if (s.type === "pairMatch") {
        add("제목", s.title); s.pairs.forEach((p) => { add("짝", p.a); add("짝", p.b); }); add("해설", s.explainGood); add("해설", s.explainBad);
        const bs = s.pairs.map((p) => p.b).sort();
        blind.push(`**${id}** [짝 잇기] ${plain(s.title)}: ${plain(s.lead ?? "")}`);
        blind.push(`- 왼쪽: ${s.pairs.map((p) => p.a).join(" / ")}`);
        blind.push(`- 오른쪽: ${bs.join(" / ")}`);
        blind.push("");
        key.push({ id, answer: s.pairs.map((p) => `${p.a}-${p.b}`).join(", ") });
      }
    });
  });
  labTexts.forEach((x) => mine.push({ where: `랩/도입 ${x.where}`, t: strip(x.t) }));
  const hits = [];
  const seen = new Set();
  for (const m of mine) {
    if (m.t.length < N) continue;
    for (let i = 0; i + N <= m.t.length; i++) {
      const w = m.t.slice(i, i + N);
      const p = pool.find((x) => x.t.includes(w));
      if (p) { const k = m.where + p.id; if (!seen.has(k)) { seen.add(k); hits.push(`${m.where} ↔ 시험 ${p.id}: "${w}"`); } break; }
    }
  }
  // 개념 글의 전과 후
  const dump = (unit) => unit.lessons.map((l) => {
    const out = [];
    l.steps.forEach((s) => {
      if (s.type === "concept") {
        out.push(`**개념 스텝: ${plain(s.title)}**`, "", plain(s.lead ?? ""), "");
        (s.blocks ?? []).forEach((b) => {
          if (b.k === "term") out.push(`- 용어 「${b.name}」: ${plain(b.def)}`);
          else if (b.k === "note") out.push(`- 메모: ${plain(b.html)}`);
          else if (b.k === "figure") out.push(`- 그림: ${plain(b.cap ?? "")}`);
          else if (b.title || b.html || b.text) out.push(`- ${plain(b.title ?? "")} ${plain(b.html ?? b.text ?? "")}`);
        });
        out.push("");
      }
      if (s.type === "recap") {
        out.push(`**정리: ${plain(s.title)}**`, "", plain(s.narrator ?? ""), "");
        (s.cards ?? []).forEach((c) => out.push(`- 카드 「${c.name}」: ${plain(c.text)}`, `  - 예: ${(c.examples ?? []).join(" / ")}`, `  - 자세히: ${plain(c.more ?? "").replace(/\n/g, "\n    ")}`));
        if (s.note) out.push(`- 메모 「${plain(s.note.title ?? "")}」: ${plain(s.note.html ?? "")}`);
        out.push("");
      }
    });
    return { id: l.id, title: l.title, text: out.join("\n") };
  });
  return { quizSteps: qn, pool: pool.length, hits, blind: blind.join("\n"), key, before: dump(base), after: dump(v5) };
}, { N, labTexts });
await browser.close();

fs.writeFileSync(path.join(OUT, "problems-blind.md"), `# 중2 Ⅱ 지권의 변화 v5: 새로 쓴 문제(정답 없음)\n\n새로 쓴 문제 ${r.quizSteps}개다. 보기의 차례는 저작 차례이고 앱에서는 섞여 나온다(차례를 고정한 보기는 그대로). 순서 놓기의 항목은 가나다 차례로 다시 늘어놓았다.\n${r.blind}\n`);
fs.writeFileSync(path.join(KEYDIR, "answers.json"), JSON.stringify(r.key, null, 1));
const ba = ["# 중2 Ⅱ 지권의 변화 v5: 개념 글의 전과 후", "", "레슨마다 지금의 글(정본의 개념 스텝과 정리 카드)과 새 글(v5의 개념 스텝과 정리 카드)을 차례로 적었다. 새 개념 스텝에는 컷이 없다(그림 세션이 concept-cuts.md를 보고 그린다)."];
r.before.forEach((b, i) => ba.push("", `## ${b.id} ${b.title}`, "", "### 지금(정본)", "", b.text || "(개념 스텝과 정리가 없다)", "", "### 새 판(v5)", "", r.after[i].text));
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), ba.join("\n") + "\n");
console.log(`문제 ${r.quizSteps}개, 시험 풀 글 조각 ${r.pool}개, 겹침 ${r.hits.length}건`);
r.hits.forEach((h) => console.log("  " + h));
process.exit(r.hits.length ? 1 : 0);
