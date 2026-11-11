// 중1 Ⅵ v5의 글을 다루는 도구(서버 없이 돈다: 내용 파일을 esbuild로 묶어 node에서 읽는다).
//   node qa/u6v5-text.mjs overlap                      새로 쓴 문제와 단원 종합 평가 문제 은행(u6)의 16자 겹침 검사
//   node qa/u6v5-text.mjs blind <문제지 폴더> <정답표 폴더>  검산용: 새 문제를 정답 없는 문제지와 정답표로 나눠 적는다
//   node qa/u6v5-text.mjs before-after <출력.md>        개념과 정리 글의 전과 후
//   node qa/u6v5-text.mjs lint                          새 글 전체(개념, 정리, 문제)의 금지 표현 검사
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [cmd, a1, a2] = process.argv.slice(2);
const tmp = path.resolve(".u6v5-dev-text.mjs");
await build({
  stdin: {
    contents: `export { UNIT6 } from "./src/content/unit6"; export { UNIT6_V5 } from "./src/content/unit6v5"; export { U6_EXAM } from "./src/content/exams/u6";`,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  logLevel: "error",
  define: { "import.meta.env": "{}" },
});
const { UNIT6, UNIT6_V5, U6_EXAM } = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);
fs.rmSync(tmp);

const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const QTYPES = ["quiz", "binSort", "order", "pairMatch"];
const j = (x) => JSON.stringify(x);
const oldSteps = new Set(UNIT6.lessons.flatMap((l) => l.steps.map(j)));
/** 새로 쓴 스텝만(정본의 것을 그대로 쓴 스텝은 뺀다) */
const fresh = [];
UNIT6_V5.lessons.forEach((l) => l.steps.forEach((s, si) => !oldSteps.has(j(s)) && fresh.push({ l, s, si })));
const freshQ = fresh.filter((x) => QTYPES.includes(x.s.type));

if (cmd === "overlap") {
  const N = 16;
  const sq = (h) => strip(h).replace(/\s+/g, "");
  const pool = [];
  U6_EXAM.pool.forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => t && pool.push({ id: it.id, t: sq(t) })));
  const hits = [];
  for (const { l, s, si } of freshQ) {
    const parts = [s.prompt, s.title, s.lead, ...(s.options ?? []), ...(s.items ?? []).map((o) => (typeof o === "string" ? o : o.label)), s.explainGood, s.explainBad];
    for (const part of parts) {
      const t = sq(part);
      for (let i = 0; i + N <= t.length; i++) {
        const w = t.slice(i, i + N);
        const hit = pool.find((p) => p.t.includes(w));
        if (hit) {
          hits.push(`${l.id} 스텝 ${si + 1}: "${w}" ↔ ${hit.id}`);
          break;
        }
      }
    }
  }
  console.log(`새 문제 스텝 ${freshQ.length}개, 시험 문항 ${U6_EXAM.pool.length}개, 겹침 ${hits.length}건`);
  hits.forEach((h) => console.log("  " + h));
  process.exit(hits.length ? 1 : 0);
}

if (cmd === "blind") {
  if (!a1 || !a2 || path.resolve(a1) === path.resolve(a2)) throw new Error("문제지 폴더와 정답표 폴더를 따로 적어 주세요");
  fs.mkdirSync(a1, { recursive: true });
  fs.mkdirSync(a2, { recursive: true });
  // 정해진 씨앗으로 섞는다(같은 문제지를 다시 뽑을 수 있다)
  let seed = 20261112;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const shuffle = (arr) => {
    const a = arr.map((v, i) => [v, i]);
    for (let i = a.length - 1; i > 0; i--) {
      const k = Math.floor(rnd() * (i + 1));
      [a[i], a[k]] = [a[k], a[i]];
    }
    return a;
  };
  const L = "①②③④⑤";
  let q = "# 중1 과학 Ⅵ 기체의 성질: 새 문제 문제지(정답 없음)\n\n중1 학생이 푸는 문제입니다. 문항마다 답과, 답이 둘일 수 있거나 전제가 모자란 곳이 있으면 적어 주세요.\n\n";
  let k = "# 정답표\n\n";
  freshQ.forEach(({ l, s }, n) => {
    const no = n + 1;
    if (s.type === "quiz" && s.mode === "ox") {
      q += `**${no}.** (${l.id}, O/X) ${strip(s.prompt)}\n\n`;
      k += `${no}. ${s.answer ? "O" : "X"}\n`;
    } else if (s.type === "quiz") {
      const opts = s.shuffle === false ? s.options.map((v, i) => [v, i]) : shuffle(s.options);
      q += `**${no}.** (${l.id}, ${s.mode === "multi" ? "모두 고르기" : "하나 고르기"}) ${strip(s.prompt)}\n\n${opts.map(([v], i) => `- ${L[i]} ${strip(v)}`).join("\n")}\n\n`;
      const ans = [].concat(s.answer).map((ai) => L[opts.findIndex(([, i]) => i === ai)]).sort();
      k += `${no}. ${ans.join(", ")}\n`;
    } else if (s.type === "binSort") {
      const items = shuffle(s.items);
      q += `**${no}.** (${l.id}, 나눠 담기) ${strip(s.lead)} 통: ${s.bins.map((b) => `[${strip(b.label)}: ${strip(b.hint)}]`).join(" ")}

${items.map(([v], i) => `- (${"가나다라마바사"[i]}) ${strip(v.label)}`).join("\n")}

`;
      k += `${no}. ${items.map(([v], i) => `${"가나다라마바사"[i]} ${s.bins.find((b) => b.id === v.bin).label}`).join(", ")}
`;
    } else if (s.type === "order") {
      const items = shuffle(s.items);
      q += `**${no}.** (${l.id}, 차례대로 놓기) ${strip(s.lead)}\n\n${items.map(([v], i) => `- (${"가나다라마"[i]}) ${strip(v)}`).join("\n")}\n\n`;
      k += `${no}. ${s.items.map((_, oi) => "가나다라마"[items.findIndex(([, i]) => i === oi)]).join(" → ")}\n`;
    }
  });
  fs.writeFileSync(path.join(a1, "u6v5-blind.md"), q);
  fs.writeFileSync(path.join(a2, "u6v5-key.md"), k);
  console.log(`문제 ${freshQ.length}개: ${path.join(a1, "u6v5-blind.md")} / ${path.join(a2, "u6v5-key.md")}`);
}

const cardMd = (c) => `- **${strip(c.name)}**: ${strip(c.text)}\n  - 예: ${(c.examples ?? []).join(" / ")}\n  - 자세히: ${strip(String(c.more ?? "").replace(/<b class='rm-h'>(.*?)<\/b>/g, " [$1] ").replace(/<span class='fun'>/g, " [상식] "))}`;
const recapMd = (s) => `쌤의 말: ${strip(s.narrator)}\n\n${s.cards.map(cardMd).join("\n")}\n\n한 줄: ${strip(s.note?.html)}`;

if (cmd === "before-after") {
  let md = "# 중1 과학 Ⅵ 기체의 성질: 개념과 정리 글의 전과 후\n\n지금 판에는 개념 스텝이 없고 개념 설명이 정리 카드에만 있다. 새 판은 랩 바로 뒤에 \"과학 용어 정복하기\"(개념 스텝)를 두고 정리 카드를 새 랩에 맞춰 다시 썼다.\n스틱맨 컷은 아직 없다(필요한 컷은 `concept-cuts.md`).\n";
  UNIT6_V5.lessons.forEach((l, li) => {
    const old = UNIT6.lessons[li].steps.find((s) => s.type === "recap");
    const con = l.steps.filter((s) => s.type === "concept");
    const rec = l.steps.find((s) => s.type === "recap");
    md += `\n## ${l.id} ${l.title}\n\n### 지금(정리 카드)\n\n${recapMd(old)}\n\n### 새 판\n\n`;
    if (!con.length) md += "개념 스텝: 없음(새로 정의할 용어가 없다. 열기구와 탁구공은 샤를 법칙을 옮겨 쓰는 레슨이다)\n\n";
    con.forEach((c) => {
      md += `개념 스텝 「${strip(c.title)}」: ${strip(c.lead)}\n\n${c.blocks.map((b) => (b.k === "term" ? `- 용어 **${b.name}**: ${strip(b.def)}` : `- 메모: ${strip(b.html)}`)).join("\n")}\n\n`;
    });
    md += `정리\n\n${recapMd(rec)}\n`;
  });
  fs.writeFileSync(a1, md);
  console.log("saved", a1);
}

if (cmd === "lint") {
  const BAD = [/[—–]/, /\s-\s/, /교과서/, /분자/, /\p{Extended_Pictographic}/u];
  let n = 0;
  let bad = 0;
  const walk = (v, where) => {
    if (typeof v === "string") {
      if (/^<svg|^<img|^data:/.test(v) || !/[가-힣]/.test(v)) return;
      n++;
      const t = strip(v);
      for (const re of BAD) {
        if (re.test(t)) {
          bad++;
          console.log(`  ${where}: ${re} ${t.slice(0, 50)}`);
        }
      }
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, where));
    else if (v && typeof v === "object") Object.entries(v).forEach(([key, x]) => key !== "art" && key !== "figure" && key !== "svg" && walk(x, where));
  };
  fresh.forEach(({ l, s, si }) => walk(s, `${l.id} 스텝 ${si + 1}(${s.type})`));
  console.log(`새 스텝 ${fresh.length}개, 글 ${n}조각, 금지 표현 ${bad}건`);
  console.log(UNIT6_V5.lessons.map((l) => `${l.id}: ${l.steps.map((s) => (s.type === "quiz" ? s.mode : s.type)).join(" > ")}`).join("\n"));
  process.exit(bad ? 1 : 0);
}
