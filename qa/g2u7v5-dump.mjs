// 중2 Ⅶ v5 판정 자료: 개념 글과 정리 카드의 전(정본)과 후(v5)를 레슨마다 나란히 적는다(concept-before-after.md).
// 실행: PORT=5587 node qa/g2u7v5-dump.mjs <출력 폴더>
import fs from "node:fs";
import path from "node:path";
import { launch, openLesson } from "./g2u7v5-lib.mjs";

const OUT = process.argv[2];
if (!OUT) throw new Error("출력 폴더를 적어 주세요");
fs.mkdirSync(OUT, { recursive: true });
const { page, close } = await launch();
await openLesson(page, "g2u7l1");
const data = await page.evaluate(async () => {
  const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<span class='fun'>/g, " (덤) ").replace(/<b class='rm-h'>([^<]*)<\/b>/g, " [$1] ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const a = await import("/src/content/g2/unit7.ts");
  const b = await import("/src/content/g2/unit7v5.ts");
  const pick = (unit) =>
    unit.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      steps: l.steps
        .filter((s) => s.type === "concept" || s.type === "recap")
        .map((s) =>
          s.type === "concept"
            ? { kind: "개념", title: strip(s.title), lead: strip(s.lead), blocks: (s.blocks ?? []).map((k) => (k.k === "term" ? `- 용어 **${strip(k.name)}**: ${strip(k.def)}` : k.k === "figure" ? `- (그림) ${strip(k.cap)}` : k.k === "list" ? k.items.map((i) => `- ${strip(i)}`).join("\n") : `- ${k.k === "note" ? "메모: " : ""}${strip(k.html)}`)) }
            : { kind: "정리", title: strip(s.title), lead: strip(s.narrator ?? s.lead), blocks: [...s.cards.map((c) => `- 카드 **${strip(c.name)}**: ${strip(c.text)}${c.examples?.length ? ` (예: ${c.examples.join(", ")})` : ""}\n  - 자세히: ${strip(c.more)}`), ...(s.note ? [`- 한마디: ${strip(s.note.html)}`] : [])] },
        ),
    }));
  return { before: pick(a.G2_UNIT7), after: pick(b.G2_UNIT7_V5) };
});
const fmt = (steps) => steps.map((s) => `**${s.kind}: ${s.title}**\n\n${s.lead ? s.lead + "\n\n" : ""}${s.blocks.join("\n")}`).join("\n\n") || "(없음)";
let md = "# 중2 Ⅶ 전기와 자기 v5: 개념 글과 정리 카드의 전과 후\n\n레슨마다 지금 운영 판의 글(전)과 새 글(후)을 차례로 적었어요. 새 개념 스텝에는 아직 컷이 없어요(그림 세션이 그려요).\n";
data.after.forEach((l, i) => {
  md += `\n## ${l.id} ${l.title}\n\n### 전(지금 운영 판)\n\n${fmt(data.before[i].steps)}\n\n### 후(v5)\n\n${fmt(l.steps)}\n`;
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), md);
// 눈검수에 넘길 새 글만 따로
let only = "# 중2 Ⅶ 전기와 자기 v5: 새 개념 글과 정리 글\n";
data.after.forEach((l) => (only += `\n## ${l.id} ${l.title}\n\n${fmt(l.steps)}\n`));
fs.writeFileSync(path.join(OUT, "concept-new.md"), only);
console.log(`적음: ${md.length}자`);
await close();
