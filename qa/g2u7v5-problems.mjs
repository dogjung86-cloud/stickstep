// 중2 Ⅶ v5의 문제 도구 세 가지를 한 번에 돌린다(개발 서버 필요: PORT=5587).
//   1) 정답 없는 문제지(problems-blind.md)와 정답표(key.md, 다른 폴더)를 뽑는다. 만든 세션이 아닌 풀이에게 문제지만 넘긴다.
//   2) 새 문제와 랩의 글을 16자 창으로 밀어 단원 종합 평가 문제 은행(g2u7)에 같은 16자가 있는지 본다.
//   3) 레슨마다 문제 스텝을 열어 정답 보기를 눌렀을 때 정답으로 채점되는지 본다(선택형, 복수 선택, OX).
// 실행: PORT=5587 node qa/g2u7v5-problems.mjs <문제지 폴더> <정답표 폴더>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, openLesson, W, ctaState, cta } from "./g2u7v5-lib.mjs";

const [OUT, KEY] = process.argv.slice(2);
if (!OUT || !KEY) throw new Error("문제지 폴더와 정답표 폴더를 적어 주세요");
if (path.resolve(OUT) === path.resolve(KEY)) throw new Error("정답표는 문제지와 다른 폴더에 둔다");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(KEY, { recursive: true });
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 랩 안의 판정 질문(slot.ask)과 랩의 글: 랩 소스에서 그대로 읽는다
const LAB_DIR = path.join(ROOT, "src/lessons/steps/g2u7v5");
const labTexts = [];
const labAsks = [];
for (const f of fs.readdirSync(LAB_DIR).filter((x) => x.endsWith("Lab.ts"))) {
  const src = fs.readFileSync(path.join(LAB_DIR, f), "utf8");
  const code = src.replace(/^\s*\/\/.*$/gm, "");
  for (const m of code.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) labTexts.push({ where: f, t: m[1] });
  const scene = (src.match(/^\/\/ 한 통찰: (.*)$/m) ?? [])[1] ?? "";
  for (const m of code.matchAll(/slot\.ask\(\s*"([^"]+)",\s*\[([^\]]+)\]/g)) {
    const opts = [...m[2].matchAll(/t: "([^"]+)"(, ok: true)?/g)].map((x) => ({ t: x[1], ok: !!x[2] }));
    if (!opts.some((o) => o.ok)) opts[0].ok = true; // 첫 보기를 정답으로 두고 map으로 표시한 꼴(rubLab)
    labAsks.push({ lab: f.replace(".ts", ""), scene, q: m[1], opts });
  }
}

const { page, close } = await launch();
await openLesson(page, "g2u7l1");
const data = await page.evaluate(async ({ labTexts }) => {
  const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  const tight = (h) => strip(h).replace(/\s+/g, "");
  const m = await import("/src/content/g2/unit7.ts");
  const ex = await import("/src/content/exams/index.ts");
  const unit = m.G2_UNIT7;
  const probs = [];
  const steps = {};
  unit.lessons.forEach((l) => {
    steps[l.id] = l.steps.map((s) => ({ type: s.type, mode: s.mode ?? "", answer: s.answer }));
    l.steps.forEach((s, si) => {
      if (!["quiz", "binSort", "order", "pairMatch"].includes(s.type)) return;
      probs.push({
        lesson: l.id, step: si + 1, type: s.type, kind: s.mode ?? "", prompt: strip(s.prompt ?? s.title), lead: strip(s.lead), hasFigure: !!s.figure,
        options: (s.options ?? []).map(strip), answer: s.answer,
        items: (s.items ?? []).map((o) => (typeof o === "string" ? o : { label: strip(o.label), bin: o.bin })),
        bins: (s.bins ?? []).map((b) => ({ id: b.id, label: strip(b.label) })),
        good: strip(s.explainGood), bad: strip(s.explainBad),
      });
    });
  });
  // 겹침: 시험 문항의 글을 16자 창의 집합으로
  const N = 16;
  const exam = ex.examForUnit("g2u7");
  const bank = new Map();
  (exam?.pool ?? []).forEach((it) =>
    [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => {
      const s = tight(t);
      for (let i = 0; i + N <= s.length; i++) if (!bank.has(s.slice(i, i + N))) bank.set(s.slice(i, i + N), it.id);
    }),
  );
  const mine = [];
  probs.forEach((p) => [p.prompt, p.lead, ...p.options, ...p.items.map((i) => (typeof i === "string" ? i : i.label)), p.good, p.bad].forEach((t) => mine.push({ where: `${p.lesson} 문제 ${p.step}`, t: tight(t) })));
  labTexts.forEach((x) => mine.push({ where: x.where, t: tight(x.t) }));
  const hits = [];
  mine.forEach((x) => {
    for (let i = 0; i + N <= x.t.length; i++) {
      const id = bank.get(x.t.slice(i, i + N));
      if (id) { hits.push(`${x.where} ↔ ${id}: ${x.t.slice(i, i + N)}`); break; }
    }
  });
  return { probs, steps, hits, pool: exam?.pool.length ?? 0 };
}, { labTexts });

// 1) 문제지와 정답표
let seed = 20261112;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const shuffle = (a) => { const b = a.map((v, i) => ({ v, i })); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const NUM = "①②③④⑤⑥⑦⑧";
let blind = "# 중2 Ⅶ 전기와 자기 v5: 정답 없는 문제지\n\n레슨의 문제와 랩 안의 판정 질문이에요. 보기의 차례는 섞여 있어요. 그림이 딸린 문제는 [그림]으로 표시했어요.\n";
let key = "# 정답표\n\n";
let n = 0;
let lastLesson = "";
for (const p of data.probs) {
  if (p.lesson !== lastLesson) { blind += `\n## ${p.lesson}\n`; lastLesson = p.lesson; }
  n += 1;
  blind += `\n**${n}.** ${p.hasFigure ? "[그림] " : ""}${p.prompt}${p.lead ? ` (${p.lead})` : ""}\n\n`;
  if (p.type === "quiz" && p.kind === "ox") { blind += "- O / X\n"; key += `${n}. ${p.answer ? "O" : "X"}\n`; }
  else if (p.type === "quiz") {
    const sh = shuffle(p.options);
    sh.forEach((o, i) => (blind += `- ${NUM[i]} ${o.v}\n`));
    const ans = [].concat(p.answer);
    key += `${n}. ${sh.map((o, i) => (ans.includes(o.i) ? NUM[i] : "")).join("")}${p.kind === "multi" ? " (모두 고르기)" : ""}\n`;
    if (p.kind === "multi") blind += "\n(모두 고르기)\n";
  } else if (p.type === "binSort") {
    blind += `나눌 곳: ${p.bins.map((b) => b.label).join(" / ")}\n\n`;
    shuffle(p.items).forEach((o) => (blind += `- ${o.v.label}\n`));
    key += `${n}. ${p.bins.map((b) => `${b.label}: ${p.items.filter((i) => i.bin === b.id).map((i) => i.label).join(", ")}`).join(" | ")}\n`;
  } else if (p.type === "order") {
    blind += "차례대로 놓기:\n\n";
    shuffle(p.items).forEach((o) => (blind += `- ${o.v}\n`));
    key += `${n}. ${p.items.join(" → ")}\n`;
  }
}
blind += "\n## 랩 안의 판정 질문\n\n랩에서 학생이 직접 해 본 장면을 배경으로 묻는 질문이에요(배경을 함께 적었어요).\n";
for (const a of labAsks) {
  n += 1;
  blind += `\n**${n}.** (${a.lab}. 배경: ${a.scene})\n${a.q}\n\n`;
  const sh = shuffle(a.opts);
  sh.forEach((o, i) => (blind += `- ${NUM[i]} ${o.v.t}\n`));
  key += `${n}. ${sh.map((o, i) => (o.v.ok ? NUM[i] : "")).join("")}\n`;
}
fs.writeFileSync(path.join(OUT, "problems-blind.md"), blind);
fs.writeFileSync(path.join(KEY, "key.md"), key);
console.log(`문제지 ${n}문항(레슨 문제 ${data.probs.length}, 랩 판정 ${labAsks.length})`);

// 2) 겹침
console.log(`시험 풀 ${data.pool}문항과의 16자 겹침: ${data.hits.length}건`);
data.hits.slice(0, 20).forEach((h) => console.log("  " + h));

// 3) 정답 채점
let pass = 0, fail = 0;
for (const [id, steps] of Object.entries(data.steps)) {
  await openLesson(page, id);
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.type === "quiz") {
      await W(page, 300);
      if (s.mode === "ox") await page.evaluate((v) => document.querySelector(`.screen.active .ox-btn.${v ? "o" : "x"}`)?.click(), s.answer);
      else for (const a of [].concat(s.answer)) await page.evaluate((a) => document.querySelector(`.screen.active .opts .opt[data-oi="${a}"]`)?.click(), a);
      await W(page, 200);
      const c = await ctaState(page);
      if (c.enabled) await cta(page);
      await W(page, 500);
      const res = await page.evaluate(() => ({ no: document.querySelectorAll(".screen.active .opt.no, .screen.active .ox-btn.no").length, ok: document.querySelectorAll(".screen.active .opt.ok, .screen.active .ox-btn.ok").length }));
      if (res.no === 0 && res.ok > 0) pass++;
      else { fail++; console.log(`  FAIL ${id} 스텝 ${i + 1}: 정답을 눌렀는데 오답으로 채점됨(${JSON.stringify(res)})`); }
    }
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
    await W(page, 500);
  }
}
console.log(`정답 채점: ${pass}/${pass + fail}`);
await close();
process.exit(fail || data.hits.length ? 1 : 0);
