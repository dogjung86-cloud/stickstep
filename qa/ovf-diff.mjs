// ovf-hook 결과 비교: 새 판에서만 생긴 넘침·가림을 단원별로 보인다.
//   node qa/ovf-diff.mjs <기준 폴더 또는 .jsonl> <새 폴더 또는 .jsonl> [--all]
// 열쇠는 (단원, 종류, 레슨 id, 요소 경로, 짝 경로)다. 글은 열쇠에 넣지 않는다(글이 바뀌어도 같은 자리를 같은 것으로 본다).
// 같은 열쇠라도 넘친 양(d)이 기준보다 4px 넘게 커졌으면 "커짐"으로 보인다. --all이면 기준에도 있던 것까지 다 보인다.
import fs from "node:fs";
import path from "node:path";

const [A, B] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const ALL = process.argv.includes("--all");
const read = (p) => {
  if (!fs.existsSync(p)) return [];
  const files = fs.statSync(p).isDirectory() ? fs.readdirSync(p).filter((f) => f.endsWith(".jsonl")).map((f) => path.join(p, f)) : [p];
  const out = [];
  for (const f of files)
    for (const l of fs.readFileSync(f, "utf8").split("\n"))
      if (l.trim())
        try {
          out.push(JSON.parse(l));
        } catch {}
  return out;
};
const lessonOf = (ctx = "") => (ctx.match(/^(g2u\d+l\d+|u\d+l\d+)/) || [""])[0];
const keyOf = (o) => [o.tag, o.kind, lessonOf(o.ctx), o.path ?? "", o.path2 ?? ""].join("|");
const base = new Map();
for (const o of read(A)) {
  const k = keyOf(o);
  const p = base.get(k);
  if (!p || (o.d ?? 0) > (p.d ?? 0)) base.set(k, o);
}
const fresh = new Map();
for (const o of read(B)) {
  if (o.kind === "fit" || o.kind === "scanerr") continue;
  const k = keyOf(o);
  const b = base.get(k);
  const grew = b && (o.d ?? 0) > (b.d ?? 0) + 4;
  if (b && !grew && !ALL) continue;
  const p = fresh.get(k);
  if (!p || (o.d ?? 0) > (p.d ?? 0)) fresh.set(k, { ...o, grew: !!grew, was: b?.d });
}
const byUnit = {};
for (const o of fresh.values()) (byUnit[o.tag] ??= []).push(o);
let n = 0;
for (const [u, list] of Object.entries(byUnit).sort()) {
  console.log(`\n## ${u} (${list.length})`);
  list.sort((a, b) => (a.ctx || "").localeCompare(b.ctx || "") || a.kind.localeCompare(b.kind));
  for (const o of list) {
    n++;
    console.log(`- [${o.kind}${o.grew ? " 커짐 " + o.was + "→" + o.d : ""}] ${o.ctx} :: ${o.path}${o.path2 ? " ⟂ " + o.path2 : ""} :: ${(o.text || "").slice(0, 90)} (${o.d ?? ""})`);
  }
}
// 글 맞춤 경고 요약(새 판)
const fits = read(B).filter((o) => o.kind === "fit");
const fitBy = {};
for (const f of fits) {
  const k = f.tag + " " + f.text.split(":")[0];
  fitBy[k] = (fitBy[k] || 0) + 1;
}
console.log(`\n새로 생긴 넘침·가림 ${n}건`);
if (fits.length) {
  console.log(`글 맞춤 경고 ${fits.length}건:`);
  for (const [k, c] of Object.entries(fitBy).sort()) console.log(`  ${k} ×${c}`);
}
