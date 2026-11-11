// 중1 Ⅱ v6 판정 자료: 개념 글과 정리 글의 전과 후를 나란히 놓은 문서를 만든다.
// 글은 check-u2v6.mjs가 두 판의 화면에서 뽑아 둔 것을 쓴다(qa/shots/u2v6-base/struct.json, qa/shots/u2v6-v6/struct.json).
// 실행: node qa/check-u2v6.mjs base && node qa/check-u2v6.mjs v6 && node qa/u2v6-before-after.mjs [출력 파일]
import { readFileSync, writeFileSync } from "node:fs";

const OUT = process.argv[2] ?? "../output/g1-v5/u2/concept-before-after.md";
const load = (f) => JSON.parse(readFileSync(f, "utf8"));
const base = load("qa/shots/u2v6-base/struct.json");
const next = load("qa/shots/u2v6-v6/struct.json");
const mBase = load("qa/shots/u2v6-base/metrics.json");
const mNext = load("qa/shots/u2v6-v6/metrics.json");

const LESSON = {
  u2l1: "세포, 생명의 기본 단위", u2l2: "세포의 구조", u2l3: "현미경으로 직접 보기", u2l4: "모양이 다른 세포들", u2l5: "생물의 구성 단계",
  u2l6: "생물다양성, 세 가지 눈금", u2l7: "변이, 그리고 살아남는 것들", u2l8: "생물을 나누는 기준", u2l9: "다섯 개의 왕국, 5계", u2l10: "생물다양성을 지켜라",
};
const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/</g, "&lt;");
const conceptCell = (c) => (c ? [`**${esc(c.title)}**`, esc(c.lead), ...c.blocks.map(esc), `[버튼] ${esc(c.cta)}`].join("<br><br>") : "(없음. 한 스텝이던 것을 둘로 나눴다)");
const cardCell = (c) =>
  c ? [`**${esc(c.name)}**`, esc(c.text), c.ex.length ? `예: ${c.ex.map(esc).join(" / ")}` : "", ...c.more.map((m) => `▸ ${esc(m)}`)].filter(Boolean).join("<br><br>") : "(없음)";
const table = (rows) => ["| 지금(정본 v5) | 새 글(v6) |", "|---|---|", ...rows.map(([a, b]) => `| ${a} | ${b} |`)].join("\n");
const metric = (list, id, kind) => list.filter((m) => m.id === id && m.kind === kind);

const out = [
  "# 중1 과학 Ⅱ 개념 글과 정리 글, 전과 후",
  "",
  "왼쪽이 지금 운영 화면의 글(v5 정본), 오른쪽이 새로 쓴 글(v6, 주소 `?u2v6`)이다. 두 판의 화면에서 그대로 뽑았다(굵은 글씨 표시는 빠져 있다).",
  "`(컷)`은 스틱맨 컷의 캡션, `(메모)`는 색 상자 속 글, `(목록)`은 점 목록, `▸`는 정리 카드 '자세히'의 소제목이다. 랩, 문제, 만화는 두 판이 같아서 싣지 않았다.",
  "",
];
for (const id of Object.keys(LESSON)) {
  out.push(`## ${id} ${LESSON[id]}`, "");
  const oc = base.filter((s) => s.id === id && s.kind === "concept");
  const nc = next.filter((s) => s.id === id && s.kind === "concept");
  const len = (ms) => ms.map((m) => `용어 ${m.terms} · ${m.chars}자 · ${m.screens}화면`).join(" + ");
  out.push(`### 개념 스텝 (지금: ${len(metric(mBase, id, "개념"))} → 새 글: ${len(metric(mNext, id, "개념"))})`, "");
  const rows = [];
  // 한 스텝을 둘로 나눈 레슨(u2l5, u2l9)은 옛 스텝 하나에 새 스텝 둘이 맞선다
  const split = nc.length > oc.length;
  for (let i = 0; i < Math.max(oc.length, nc.length); i++) rows.push([conceptCell(split ? (i === 0 ? oc[0] : null) : oc[i]), conceptCell(nc[i])]);
  out.push(table(rows), "");
  const or = base.find((s) => s.id === id && s.kind === "recap");
  const nr = next.find((s) => s.id === id && s.kind === "recap");
  out.push("### 정리", "");
  const rrows = [[`**${esc(or.title)}**<br><br>쌤: ${esc(or.narrator)}`, `**${esc(nr.title)}**<br><br>쌤: ${esc(nr.narrator)}`]];
  for (let i = 0; i < Math.max(or.cards.length, nr.cards.length); i++) rrows.push([cardCell(or.cards[i]), cardCell(nr.cards[i])]);
  out.push(table(rrows), "");
}
writeFileSync(OUT, out.join("\n"), "utf8");
console.log(`${OUT} (${out.join("\n").length}자)`);
