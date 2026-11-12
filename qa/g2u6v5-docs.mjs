// 중2 Ⅵ v5 판정 자료 뽑기와 겹침 검사(개발 서버가 떠 있어야 한다).
//   1) 정답 없는 문제지(problems-blind.md)와 문제 그림(figs/*.png): 새로 쓴 문제 스텝 + 랩 안의 판정 질문. 정답표는 다른 폴더에 둔다.
//   2) 개념 글의 전과 후(concept-before-after.md): 정본의 개념 스텝과 정리 카드, 새 판의 개념 스텝과 정리 카드를 레슨마다 나란히.
//   3) 단원 종합 평가 문제 은행(g2u6)과의 겹침: 새 문제와 랩 글에서 16자 창을 밀어 같은 16자가 시험 문항에 있는지 본다.
// 실행: PORT=5586 node qa/g2u6v5-docs.mjs <판정 자료 폴더> <정답표 폴더>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launch, BASE } from "./u4v5-lib.mjs";

const [OUT, KEY] = process.argv.slice(2);
if (!OUT || !KEY) throw new Error("판정 자료 폴더와 정답표 폴더를 적어 주세요");
if (path.resolve(OUT) === path.resolve(KEY)) throw new Error("정답표는 문제지와 다른 폴더에 둔다");
fs.mkdirSync(path.join(OUT, "figs"), { recursive: true });
fs.mkdirSync(KEY, { recursive: true });
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const N = 16;

// 랩 소스에서 판정 질문과 한글 문자열을 뽑는다
const LAB_DIR = path.join(ROOT, "src/lessons/steps/g2u6v5");
const labJudges = [];
const labTexts = [];
const LAB_LESSON = { nutrientLabs: "g2u6l1", digestLabs: "g2u6l2", circLabs: "g2u6l3", breathLabs: "g2u6l4", kidneyLab: "g2u6l5", energyLabs: "g2u6l6" };
for (const f of fs.readdirSync(LAB_DIR).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(LAB_DIR, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/[가-힣]/.test(m[1])) labTexts.push({ where: f, t: m[1] });
  const grab = (q, body) => {
    const choices = [...body.matchAll(/\{ t: "([^"]+)"(, ok: true)? \}/g)].map((c) => ({ t: c[1], ok: !!c[2] }));
    if (choices.length) labJudges.push({ lab: f.replace(".ts", ""), q, choices });
  };
  for (const m of src.matchAll(/lab\.judge\(\s*"([^"]+)",\s*\[([^\]]+)\]/g)) grab(m[1], m[2]);
  for (const m of src.matchAll(/q: "([^"]+)",\s*choices: \[([^\]]+)\]/g)) grab(m[1], m[2]);
}

const { browser, page } = await launch();
await page.goto(BASE + "/?g2u6v5", { waitUntil: "domcontentloaded" });
const data = await page.evaluate(async ({ N, labTexts }) => {
  const text = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<sub>(\d+)<\/sub>/g, (_, d) => [...d].map((c) => "₀₁₂₃₄₅₆₇₈₉"[+c]).join("")).replace(/<sup>([^<]+)<\/sup>/g, "^($1)").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  const tight = (h) => String(h ?? "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").replace(/\s+/g, "");
  const base = (await import("/src/content/g2/unit6v3.ts")).G2_UNIT6_V3;
  const v5 = (await import("/src/content/g2/unit6v5.ts")).G2_UNIT6_V5;
  const ex = await import("/src/content/exams/index.ts");
  const exam = ex.examForUnit("g2u6");
  const QT = ["quiz", "binSort", "order", "pairMatch"];
  const probs = [];
  const figs = [];
  v5.lessons.forEach((l) =>
    l.steps.forEach((s, si) => {
      if (!QT.includes(s.type)) return;
      if (s.figure) figs.push({ name: `${l.id}-s${si + 1}`, svg: s.figure });
      probs.push({
        lesson: l.id, step: si + 1, type: s.type, kind: s.mode ?? "", prompt: text(s.prompt ?? s.title), lead: text(s.lead), fig: s.figure ? `${l.id}-s${si + 1}` : "",
        figAria: s.figure ? (s.figure.match(/aria-label="([^"]+)"/)?.[1] ?? "") : "",
        options: (s.options ?? []).map(text), answer: s.answer, shuffle: s.shuffle !== false,
        items: (s.items ?? []).map((o) => (typeof o === "string" ? o : { label: text(o.label), bin: o.bin })),
        bins: (s.bins ?? []).map((b) => ({ id: b.id, label: text(b.label) })),
        pairs: (s.pairs ?? []).map((p) => ({ a: text(p.a), b: text(p.b) })),
      });
    }),
  );
  // 개념 글의 전과 후
  const readable = (unit) =>
    unit.lessons.map((l) => ({
      id: l.id, title: l.title,
      steps: l.steps.map((s) => s.type).join(" → "),
      concepts: l.steps.filter((s) => s.type === "concept").map((s) => ({
        title: text(s.title), lead: text(s.lead),
        blocks: (s.blocks ?? []).map((b) => (b.k === "term" ? `[용어] ${text(b.name)}: ${text(b.def)}` : b.k === "note" || b.k === "callout" ? `[메모] ${b.title ? text(b.title) + ": " : ""}${text(b.html)}` : b.k === "p" ? text(b.html) : b.k === "list" ? b.items.map((x) => "· " + text(x)).join(" / ") : b.k === "figure" ? `[그림] ${text(b.cap)}` : "")).filter(Boolean),
      })),
      recap: l.steps.filter((s) => s.type === "recap").map((s) => ({
        title: text(s.title), narrator: text(s.narrator),
        cards: s.cards.map((c) => ({ name: text(c.name), text: text(c.text), examples: (c.examples ?? []).join(" / "), more: String(c.more ?? "").replace(/<b class='rm-h'>(.*?)<\/b>/g, "\n  ▸ $1: ").replace(/<span class='fun'>/g, "\n  ▸ ").replace(/<img[^>]*>/g, "").replace(/<[^>]+>/g, "").trim(), len: text(c.more).length })),
        note: text(s.note?.html),
      })),
    }));
  // 겹침
  const pool = [];
  (exam?.pool ?? []).forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => pool.push({ id: it.id, t: tight(t) })));
  const mine = [];
  v5.lessons.forEach((l) =>
    l.steps.forEach((s, si) => {
      if (!QT.includes(s.type)) return;
      const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: tight(t) });
      add("문두", s.prompt); add("제목", s.title); add("안내", s.lead);
      (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
      (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
      add("정답 해설", s.explainGood); add("오답 해설", s.explainBad);
    }),
  );
  labTexts.forEach((x) => mine.push({ where: `랩 ${x.where}`, t: tight(x.t) }));
  const hits = [];
  for (const q of mine) for (let i = 0; i + N <= q.t.length; i++) {
    const w = q.t.slice(i, i + N);
    const p = pool.find((x) => x.t.includes(w));
    if (p) { hits.push(`${q.where} / 시험 ${p.id}: "${w}"`); break; }
  }
  return { probs, figs, before: readable(base), after: readable(v5), overlap: { pool: exam?.pool.length ?? 0, mine: mine.length, hits } };
}, { N, labTexts });

// 문제 그림을 한 장씩 찍는다
for (const f of data.figs) {
  await page.setContent(`<body style="margin:0;background:#fff"><div id="f" style="width:344px;padding:8px">${f.svg}</div></body>`);
  await (await page.$("#f")).screenshot({ path: path.join(OUT, "figs", f.name + ".png") });
}
await browser.close();

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffled = (arr, r) => {
  const a = arr.map((v, i) => ({ v, i }));
  for (let k = a.length - 1; k > 0; k--) {
    const m = Math.floor(r() * (k + 1));
    [a[k], a[m]] = [a[m], a[k]];
  }
  return a;
};
const NUM = "①②③④⑤⑥⑦⑧";
const r = rng(20261112);
const blind = ["# 중2 Ⅵ 동물과 에너지 v5: 정답 없는 문제지", "", "새로 쓴 문제 스텝과 랩 안의 판정 질문이다. 보기의 차례는 섞어 적었다(차례를 고정한 문항은 그대로). 그림이 딸린 문항의 그림은 `figs/` 폴더에 있다.", ""];
const key = ["# 정답표 (문제지와 다른 폴더에 둔다)", ""];
let no = 0;
let lesson = "";
for (const p of data.probs) {
  if (p.lesson !== lesson) {
    lesson = p.lesson;
    blind.push(`## ${lesson}`, "");
  }
  no += 1;
  const head = `**문제 ${no}** (${p.lesson} 스텝 ${p.step}, ${p.type === "quiz" ? { mcq: "하나 고르기", ox: "O/X", multi: "모두 고르기" }[p.kind || "mcq"] : { binSort: "분류", order: "순서", pairMatch: "짝 잇기" }[p.type]})`;
  blind.push(head, "", p.prompt + (p.lead ? `: ${p.lead}` : ""), "");
  if (p.fig) blind.push(`(그림: figs/${p.fig}.png. 그림 설명: ${p.figAria})`, "");
  if (p.type === "quiz" && p.kind === "ox") {
    blind.push("O 또는 X", "");
    key.push(`문제 ${no}: ${p.answer ? "O" : "X"}`);
  } else if (p.type === "quiz") {
    const opts = p.shuffle ? shuffled(p.options, r) : p.options.map((v, i) => ({ v, i }));
    opts.forEach((o, i) => blind.push(`${NUM[i]} ${o.v}`));
    blind.push("");
    const ans = (Array.isArray(p.answer) ? p.answer : [p.answer]).map((a) => NUM[opts.findIndex((o) => o.i === a)]).sort();
    key.push(`문제 ${no}: ${ans.join(", ")}`);
  } else if (p.type === "binSort") {
    blind.push(`통: ${p.bins.map((b) => b.label).join(" / ")}`, `항목: ${shuffled(p.items, r).map((o) => o.v.label).join(" · ")}`, "");
    key.push(`문제 ${no}: ${p.bins.map((b) => `${b.label} = ${p.items.filter((i) => i.bin === b.id).map((i) => i.label).join(", ")}`).join(" / ")}`);
  } else if (p.type === "order") {
    blind.push(...shuffled(p.items, r).map((o, i) => `(${"가나다라마"[i]}) ${o.v}`), "");
    key.push(`문제 ${no}: ${p.items.join(" → ")}`);
  } else if (p.type === "pairMatch") {
    blind.push(`왼쪽: ${p.pairs.map((x) => x.a).join(" · ")}`, `오른쪽: ${shuffled(p.pairs, r).map((o) => o.v.b).join(" · ")}`, "");
    key.push(`문제 ${no}: ${p.pairs.map((x) => `${x.a}=${x.b}`).join(", ")}`);
  }
}
blind.push("## 랩 안의 판정 질문", "", "랩의 조작을 마친 뒤 같은 화면에서 묻는 질문이다. 괄호 안은 그 랩이 든 레슨이다.", "");
for (const j of labJudges) {
  no += 1;
  const opts = shuffled(j.choices, r);
  blind.push(`**문제 ${no}** (랩 ${j.lab}, ${LAB_LESSON[j.lab] ?? ""})`, "", j.q.replace(/<[^>]+>/g, ""), "", ...opts.map((o, i) => `${NUM[i]} ${o.v.t}`), "");
  key.push(`문제 ${no}: ${NUM[opts.findIndex((o) => o.v.ok)]}`);
}
fs.writeFileSync(path.join(OUT, "problems-blind.md"), blind.join("\n"));
fs.writeFileSync(path.join(KEY, "key.md"), key.join("\n"));

// 개념 글의 전과 후
const ba = ["# 중2 Ⅵ 동물과 에너지 v5: 개념 글의 전과 후", "", "레슨마다 지금의 글(정본 `unit6v3.ts`의 개념 스텝과 정리 카드)과 새 글(v5)을 나란히 적었다. 스텝의 차례도 함께 적었다.", ""];
const side = (L) => {
  const out = [`스텝 차례: ${L.steps}`, ""];
  if (!L.concepts.length) out.push("개념 스텝: 없음", "");
  L.concepts.forEach((c, i) => out.push(`개념 스텝 ${i + 1}: **${c.title}**`, "", `> ${c.lead}`, "", ...c.blocks.map((b) => `- ${b}`), ""));
  L.recap.forEach((rc) => {
    out.push(`정리: **${rc.title}**`, "", `> ${rc.narrator}`, "");
    rc.cards.forEach((c) => out.push(`- 카드 **${c.name}**: ${c.text}`, `  - 예: ${c.examples}`, `  - 자세히(${c.len}자): ${c.more.replace(/\n/g, "\n  ")}`));
    out.push("", `- 한 줄 메모: ${rc.note}`, "");
  });
  return out;
};
data.before.forEach((b, i) => {
  ba.push(`## ${b.id} ${b.title}`, "", "### 지금", "", ...side(b), "### 새 판(v5)", "", ...side(data.after[i]), "");
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), ba.join("\n"));

console.log(`문제 ${data.probs.length}개 + 랩 판정 ${labJudges.length}개 → problems-blind.md, 그림 ${data.figs.length}장`);
console.log(`정리 카드 '자세히' 글자 수: ${data.after.flatMap((l) => l.recap.flatMap((x) => x.cards.map((c) => c.len))).join(", ")}`);
console.log(`겹침 검사(${N}자 창): 시험 문항 ${data.overlap.pool}개와 새 글 ${data.overlap.mine}조각 · 겹침 ${data.overlap.hits.length}건`);
data.overlap.hits.forEach((h) => console.log(" -", h));
process.exit(data.overlap.hits.length ? 1 : 0);
