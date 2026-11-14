// audit-pc-quality.mjs 결과(JSON 여러 개)를 묶어 '흐린 것' 표를 만든다(2026-11-15, 분석용).
// node qa/sum-pc-quality.mjs <결과 JSON...> [--under 0.9]
//  · 캔버스는 그리는 코드(getContext를 부른 위치)별, 그림은 파일별로 묶고, 설정(화면 크기와 배율)마다 가장 낮은 값을 적는다.
//  · 값 = 그린(또는 원래) 픽셀 ÷ 화면에 보이는 장치 픽셀. 1 이상이면 또렷, 0.75 아래면 눈에 띄게 흐리다.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const ui = args.indexOf("--under");
const UNDER = ui >= 0 ? Number(args[ui + 1]) : 0.9;
const files = args.filter((a, i) => !a.startsWith("--") && (ui < 0 || i !== ui + 1));
// 뒤에 준 파일이 같은 설정·같은 레슨을 다시 쟀으면 그것으로 바꾼다(다시 잰 것이 앞선다).
let results = [];
const cfgs = new Set();
for (const f of files) {
  const j = JSON.parse(readFileSync(f, "utf8"));
  const again = new Set(j.results.map((r) => `${r.cfg}|${r.lesson}`));
  results = results.filter((r) => !again.has(`${r.cfg}|${r.lesson}`));
  for (const r of j.results) {
    results.push(r);
    cfgs.add(r.cfg);
  }
}
const CF = [...cfgs];
const items = new Map();
const add = (key, meta, r, v) => {
  const e = items.get(key) || { key, ...meta, by: {}, steps: new Map() };
  e.by[r.cfg] = Math.min(e.by[r.cfg] ?? 9, v);
  const sk = r.name;
  const s = e.steps.get(sk) || { name: r.name, unit: r.unit, unitTitle: r.unitTitle, lesson: r.lesson, lessonTitle: r.lessonTitle, step: r.step, type: r.type, kind: r.kind, title: r.title, by: {} };
  s.by[r.cfg] = Math.min(s.by[r.cfg] ?? 9, v);
  e.steps.set(sk, s);
  items.set(key, e);
};
for (const r of results) {
  for (const c of r.canvases) {
    const src = c.src
      .split(" < ")
      .map((x) => x.replace(/:\d+:\d+$/, ""))
      .filter((x, i, a) => a.indexOf(x) === i)
      .slice(0, 2)
      .join(" < ");
    add(`canvas|${c.ctx}|${src}|${c.cls}`, { what: "canvas", ctx: c.ctx, src, cls: c.cls, where: c.where, size: `${c.w}×${c.h}`, css: `${c.cw}×${c.ch}` }, r, Math.min(c.rx, c.ry));
  }
  for (const x of r.imgs) add(`${x.kind}|${x.src}`, { what: x.kind, src: x.src, where: x.where, size: `${x.nw}×${x.nh}`, cls: x.cls }, r, x.r);
}
const rows = [...items.values()].map((e) => ({ ...e, min: Math.min(...Object.values(e.by)), steps: [...e.steps.values()] }));
rows.sort((a, b) => a.min - b.min);
const low = rows.filter((e) => e.min < UNDER);
const ok = rows.filter((e) => e.min >= UNDER);
const f2 = (v) => (v == null ? "-" : v.toFixed(2));
let md = `설정: ${CF.join(", ")} · 스텝 ${new Set(results.map((r) => r.cfg + r.name)).size}개 측정\n\n`;
md += `## ${UNDER} 아래(흐린 것) ${low.length}개\n\n| 무엇 | 그리는 코드 또는 파일 | 자리 | ${CF.join(" | ")} | 스텝 |\n|---|---|---|${CF.map(() => "---").join("|")}|---|\n`;
for (const e of low)
  md += `| ${e.what}${e.ctx ? " " + e.ctx : ""} ${e.cls ? "`." + e.cls.split(" ")[0] + "`" : ""} | ${e.src} (${e.size}) | ${e.where} | ${CF.map((c) => f2(e.by[c])).join(" | ")} | ${e.steps.map((s) => `${s.name}(${s.type})`).join(" ")} |\n`;
md += `\n## ${UNDER} 이상(또렷한 것) ${ok.length}개\n\n| 무엇 | 그리는 코드 또는 파일 | 자리 | ${CF.join(" | ")} | 스텝 수 |\n|---|---|---|${CF.map(() => "---").join("|")}|---|\n`;
for (const e of ok) md += `| ${e.what}${e.ctx ? " " + e.ctx : ""} ${e.cls ? "`." + e.cls.split(" ")[0] + "`" : ""} | ${e.src} (${e.size}) | ${e.where} | ${CF.map((c) => f2(e.by[c])).join(" | ")} | ${e.steps.length} |\n`;
writeFileSync("sum-pc-quality.md", md);
writeFileSync("sum-pc-quality.json", JSON.stringify(rows, null, 1));
console.log(md);
