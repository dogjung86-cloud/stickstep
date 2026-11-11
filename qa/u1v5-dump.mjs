// 중1 Ⅰ v5 판정 자료 뽑기: 개념과 정리 글의 전과 후(concept-before-after.md)를 적는다. 서버 없이 돈다.
// 단원 파일을 esbuild로 묶어 node에서 읽는다(화면 코드는 들어오지 않는다. 내용 파일은 글과 그림 문자열뿐이다).
//   node qa/u1v5-dump.mjs <출력 폴더>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const OUT = process.argv[2];
if (!OUT) throw new Error("출력 폴더를 적어 주세요");
fs.mkdirSync(OUT, { recursive: true });
const tmp = path.resolve("tmp/u1v5-dump.mjs");
await build({
  stdin: { contents: 'export { UNIT1 } from "./src/content/unit1"; export { UNIT1_V5 } from "./src/content/unit1v5";', resolveDir: process.cwd(), loader: "ts" },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: tmp,
  define: { "import.meta.env.DEV": "false", "import.meta.env.BASE_URL": '"/"', "import.meta.env": "{}" },
  logLevel: "silent",
});
const { UNIT1, UNIT1_V5 } = await import(pathToFileURL(tmp).href + `?t=${Date.now()}`);

const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<b class='rm-h'>(.*?)<\/b>/g, "\n  [$1] ").replace(/<span class='fun'>/g, "\n  ").replace(/<[^>]+>/g, "").replace(/[ \t]+/g, " ").trim();
const recapMd = (s) =>
  [`제목: ${strip(s.title)}`, `쌤의 말: ${strip(s.narrator)}`, ...s.cards.map((c, i) => `카드 ${i + 1} 「${c.name}」\n- 핵심: ${strip(c.text)}\n- 예: ${(c.examples ?? []).join(" / ")}\n- 자세히: ${strip(c.more)}`), s.note ? `메모 「${s.note.title}」 ${strip(s.note.html)}` : ""].filter(Boolean).join("\n\n");
const conceptMd = (s) => [`제목: ${strip(s.title)}`, `이끄는 말: ${strip(s.lead)}`, ...s.blocks.map((b) => (b.k === "term" ? `- 용어 「${b.name}」 ${strip(b.def)}` : b.k === "note" ? `- 메모: ${strip(b.html)}` : `- (${b.k})`))].join("\n");

let md = "# 중1 Ⅰ 개념과 정리 글의 전과 후 (2026-11-12)\n\n지금(정본)에는 개념 스텝이 없고 개념 설명이 정리 카드에만 있다. 새 판은 랩 뒤에 용어를 정의하는 개념 스텝을 두고 정리 카드를 새 랩에 맞춰 다시 썼다.\n레슨의 정리 글이 전과 같으면 \"그대로\"라고만 적는다.\n";
UNIT1.lessons.forEach((l, li) => {
  const n = UNIT1_V5.lessons[li];
  const before = l.steps.find((s) => s.type === "recap");
  const after = n.steps.find((s) => s.type === "recap");
  const concepts = n.steps.filter((s) => s.type === "concept");
  md += `\n## ${l.id} ${l.title}\n\n스텝 차례(새 판): ${n.steps.map((s) => s.type).join(" → ")}\n`;
  md += `\n### 새 개념 스텝\n\n${concepts.length ? concepts.map(conceptMd).join("\n\n") : "없음(만화의 컷마다 용어 카드가 정의를 한다)"}\n`;
  const same = JSON.stringify(before) === JSON.stringify(after);
  md += `\n### 정리: 지금\n\n${recapMd(before)}\n\n### 정리: 새 판\n\n${same ? "그대로" : recapMd(after)}\n`;
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), md);
console.log("saved", path.join(OUT, "concept-before-after.md"), md.length);
