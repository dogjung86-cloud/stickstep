// 중1 Ⅱ v5 검산용 문제지 뽑기: 새로 쓰거나 고쳐 쓴 문제 스텝을 '정답 없는 문제지'와 '정답표'로 나눠 적는다.
// 쓰는 까닭: 만든 사람이 다시 푸는 것으로는 "답이 둘"인 문제를 잡지 못한다(실플레이 검사는 표시해 둔 정답이 눌리는지만 본다).
//   문제지(blind.md)만 다른 풀이에게 넘기고, 돌아온 답을 정답표(key.md)와 견준다. 정답표는 문제지와 다른 폴더에 둔다.
//   PORT=5547 node qa/u2v5-blind.mjs <문제지 폴더> <정답표 폴더>
// 보기와 카드는 정해진 씨앗으로 섞는다(같은 문제지를 다시 뽑을 수 있다). 그림이 딸린 문제는 표시만 한다(그림은 캡처로 따로 넘긴다).
// 랩 안의 질문(slot.ask)은 여기서 뽑지 않는다. 랩 소스에서 질문과 보기를 옮겨 적고, 랩에서 본 장면을 배경으로 함께 적어 준다.
import fs from "node:fs";
import path from "node:path";
import { launch } from "./u2v5-lib.mjs";

const [OUT, KEY] = process.argv.slice(2);
if (!OUT || !KEY) throw new Error("문제지 폴더와 정답표 폴더를 적어 주세요");
if (path.resolve(OUT) === path.resolve(KEY)) throw new Error("정답표는 문제지와 다른 폴더에 둔다");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(KEY, { recursive: true });

const { browser, page } = await launch();
const data = await page.evaluate(async () => {
  const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  const c = await import("/src/content/curriculum.ts");
  const v3 = await import("/src/content/unit2v3.ts");
  const u = c.CURRICULUM.find((x) => x.id === "u2");
  // v3 스텝인지는 글자로 견준다(객체가 같은지로 보면 안 된다: dev 서버가 다른 사본을 줄 수 있다)
  const j = (x) => JSON.stringify(x, (k, v) => (k === "n" || k === "of" ? undefined : v));
  const v3steps = new Set(v3.UNIT2_V3.lessons.flatMap((l) => l.steps.map(j)));
  const out = [];
  u.lessons.forEach((l) =>
    l.steps.forEach((s, si) => {
      if (!["quiz", "binSort", "order", "pairMatch"].includes(s.type) || v3steps.has(j(s))) return;
      out.push({
        lesson: l.id, step: si + 1, type: s.type, kind: s.mode ?? "",
        prompt: strip(s.prompt ?? s.title), lead: strip(s.lead), hasFigure: !!s.figure,
        options: (s.options ?? []).map(strip), answer: s.answer,
        items: (s.items ?? []).map((o) => (typeof o === "string" ? o : { label: strip(o.label), bin: o.bin })),
        bins: (s.bins ?? []).map((b) => ({ id: b.id, label: strip(b.label), hint: strip(b.hint) })),
        pairs: (s.pairs ?? []).map((p) => ({ a: strip(p.a), b: strip(p.b) })),
        good: strip(s.explainGood), bad: strip(s.explainBad),
      });
    }),
  );
  return out;
});
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
function shuffled(arr, r) {
  const a = arr.map((v, i) => ({ v, i }));
  for (let k = a.length - 1; k > 0; k--) {
    const m = Math.floor(r() * (k + 1));
    [a[k], a[m]] = [a[m], a[k]];
  }
  return a;
}

const L = "①②③④⑤⑥⑦⑧⑨⑩".split("");
let blind = "";
let key = "";
data.forEach((q, n) => {
  const r = rng(1000 + (n + 1) * 37);
  const id = `Q${String(n + 1).padStart(2, "0")}`;
  blind += `\n### ${id} (${q.lesson} · ${q.type}${q.kind ? "/" + q.kind : ""})\n`;
  key += `\n### ${id} (${q.lesson} 스텝 ${q.step} · ${q.type})\n`;
  if (q.type === "quiz") {
    blind += `${q.prompt}\n`;
    if (q.hasFigure) blind += `(그림이 딸린 문제다. 그림은 캡처로 따로 본다.)\n`;
    if (typeof q.answer === "boolean") {
      blind += `- 맞아요 / 아니에요 가운데 고른다.\n`;
      key += `정답: ${q.answer ? "맞아요" : "아니에요"}\n`;
    } else {
      const sh = shuffled(q.options, r);
      sh.forEach((o, k) => (blind += `- ${L[k]} ${o.v}\n`));
      const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
      if (Array.isArray(q.answer)) blind += `(옳은 것을 모두 고른다.)\n`;
      key += `정답: ${sh.map((o, k) => (ans.includes(o.i) ? L[k] : "")).join("")} = ${ans.map((a) => q.options[a]).join(" / ")}\n`;
    }
  } else if (q.type === "order") {
    blind += `${q.prompt}${q.lead ? " / " + q.lead : ""}\n(아래 항목을 옳은 차례로 늘어놓는다.)\n`;
    shuffled(q.items, r).forEach((o, k) => (blind += `- ${L[k]} ${o.v}\n`));
    key += `정답 차례: ${q.items.join(" → ")}\n`;
  } else if (q.type === "binSort") {
    blind += `${q.prompt}${q.lead ? " / " + q.lead : ""}\n통: ${q.bins.map((b) => `[${b.label}${b.hint ? "(" + b.hint + ")" : ""}]`).join(" ")}\n(카드마다 알맞은 통을 고른다.)\n`;
    shuffled(q.items, r).forEach((o, k) => (blind += `- ${L[k]} ${o.v.label}\n`));
    key += q.items.map((o) => `${o.label} → ${q.bins.find((b) => b.id === o.bin)?.label}`).join("\n") + "\n";
  } else if (q.type === "pairMatch") {
    const left = shuffled(q.pairs.map((p) => p.a), r).map((o) => o.v).join(", ");
    const right = shuffled(q.pairs.map((p) => p.b), r).map((o) => o.v).join(", ");
    blind += `${q.prompt}${q.lead ? " / " + q.lead : ""}\n왼쪽: ${left}\n오른쪽: ${right}\n(왼쪽과 오른쪽을 하나씩 짝짓는다.)\n`;
    key += q.pairs.map((p) => `${p.a} ↔ ${p.b}`).join("\n") + "\n";
  }
  key += `정답 해설: ${q.good}\n오답 해설: ${q.bad}\n`;
});
fs.writeFileSync(path.join(OUT, "blind.md"), blind.trim() + "\n");
fs.writeFileSync(path.join(KEY, "key.md"), key.trim() + "\n");
console.log(`문제지 ${data.length}문항: ${path.join(OUT, "blind.md")} · 정답표: ${path.join(KEY, "key.md")}`);
console.log(data.map((q) => `${q.lesson}#${q.step}:${q.type}${q.hasFigure ? "(그림)" : ""}`).join(" "));
