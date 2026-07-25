// m2u2 부등식과 연립방정식 시험 풀 소수리(2026-07-25) 교체·수정 슬롯 검수 갤러리.
// word 0화 20 + 판별형 전환 2(e069·e112) + 도형 그림화 4(e072·e086·e187·e194) = 26슬롯을
// 시험지 카드로 렌더한다(esbuild 실로드 — check와 동일 경로, m2u6-repair 갤러리 계보).
// node qa/render-m2u2-repair.mjs → tmp/m2u2-repair/index.html (루트 launch.json "m2u2-repair" 5997)
import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const FILES = ["m2u2l1", "m2u2l2", "m2u2l3", "m2u2l4", "m2u2l5", "m2u2l6", "m2u2l7", "m2u2l8", "m2u2l9"];
const WORD0 = new Set([
  "m2u2e021", "m2u2e022", "m2u2e043", "m2u2e044", "m2u2e065", "m2u2e066",
  "m2u2e087", "m2u2e088", "m2u2e109", "m2u2e110", "m2u2e131", "m2u2e132",
  "m2u2e153", "m2u2e154", "m2u2e175", "m2u2e176", "m2u2e177",
  "m2u2e198", "m2u2e199", "m2u2e200",
]);
const DISC = new Set(["m2u2e069", "m2u2e112"]);
const FIGZE = new Set(["m2u2e072", "m2u2e086", "m2u2e187", "m2u2e194"]);

async function loadPool(file) {
  const result = await build({
    entryPoints: [`src/content/exams/${file}.ts`],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[Object.keys(mod).find((k) => k.startsWith("POOL_"))];
}

const all = [];
for (const f of FILES) all.push(...(await loadPool(f)));
const shown = all.filter((it) => WORD0.has(it.id) || DISC.has(it.id) || FIGZE.has(it.id));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const typeTag = { mcq: "5지선다", multi: "합답형", num: "직접 입력", word: "word(잔존 시 결함)" };
const circled = ["①", "②", "③", "④", "⑤"];

const card = (it) => {
  const tag = FIGZE.has(it.id) ? "도형 그림화" : DISC.has(it.id) ? "판별형 전환" : "word→" + (it.type === "num" ? "num" : "mcq");
  let body = "";
  if (it.figure) body += `<div class="fig">${it.figure}</div>`;
  if (Array.isArray(it.bogi)) {
    body += `<div class="bogi">${it.bogi.map((b, i) => `<div>${"ㄱㄴㄷㄹㅁ"[i]}. ${b}</div>`).join("")}</div>`;
  }
  if (it.type === "mcq" || it.type === "multi") {
    const keys = it.type === "mcq" ? [it.answer] : it.answer;
    body += `<ol class="opts">${(it.options ?? [])
      .map((o, i) => `<li class="${keys.includes(i) ? "key" : ""}">${circled[i]} ${o}</li>`)
      .join("")}</ol>`;
  } else {
    body += `<div class="ans">정답: <b>${esc(it.answer)}</b>${it.unitLabel ? " " + esc(it.unitLabel) : ""} <span class="kind">(${esc(it.numKind ?? "int")})</span></div>`;
  }
  return `<article class="card">
    <header><span class="slot">${it.id.replace("m2u2", "")}</span><span class="tag">${tag}</span>
      <span class="meta">${it.lessonId} · ${typeTag[it.type] ?? it.type} · diff${it.diff}${it.shuffle === false ? " · 셔플 고정" : ""}</span></header>
    <div class="prompt">${it.prompt}</div>${body}
    <details><summary>해설 · 한 줄 핵심</summary><div class="explain">${it.explain}</div><div class="core">${esc(it.core ?? "")}</div></details>
  </article>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m2u2 부등식·연립방정식 소수리 검수 갤러리 (${shown.length}문항)</title>
<style>
  :root { --ink:#191F28; --n500:#8B95A1; --n700:#4E5968; --font-mvar:"STIX Two Text","Times New Roman",serif; }
  * { box-sizing:border-box; } body { margin:0; padding:28px 16px 80px; background:#F4F6F9; color:var(--ink);
    font-family:Pretendard,-apple-system,"Malgun Gothic",sans-serif; letter-spacing:-.012em; }
  h1 { font-size:20px; margin:0 auto 4px; max-width:1180px; }
  p.lead { margin:0 auto 20px; max-width:1180px; color:var(--n700); font-size:13px; }
  main { max-width:1180px; margin:0 auto; columns:2 480px; column-gap:16px; }
  .card { break-inside:avoid; background:#fff; border:1px solid #E5E8EB; border-radius:14px; padding:16px 18px; margin:0 0 16px; }
  header { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
  .slot { font-weight:900; font-size:15px; } .tag { background:#EEF4FF; color:#3182F6; font-size:11px; font-weight:800; padding:2px 8px; border-radius:99px; }
  .meta { color:var(--n500); font-size:11.5px; margin-left:auto; }
  .prompt { font-size:14.5px; line-height:1.6; }
  .fig { margin:10px 0 2px; } .fig svg { max-width:340px; width:100%; height:auto; display:block; }
  .bogi { margin:10px 0 0; padding:10px 12px; border:1px solid #E5E8EB; border-radius:10px; font-size:13.5px; line-height:1.65; background:#FAFBFC; }
  ol.opts { list-style:none; margin:10px 0 0; padding:0; font-size:13.5px; }
  ol.opts li { padding:5px 8px; border-radius:8px; line-height:1.55; }
  ol.opts li.key { background:#E8F7EF; font-weight:700; }
  .ans { margin-top:10px; font-size:14px; background:#E8F7EF; display:inline-block; padding:5px 12px; border-radius:8px; }
  .ans .kind { color:var(--n500); font-size:11.5px; font-weight:400; }
  details { margin-top:10px; font-size:13px; color:var(--n700); }
  summary { cursor:pointer; font-weight:700; color:#3182F6; }
  .explain { margin-top:8px; line-height:1.7; } .core { margin-top:6px; font-weight:800; color:#04B45F; }
  .xh { display:block; font-weight:900; color:var(--ink); margin:8px 0 3px; }
  .mx { white-space:nowrap; } .mx .mx-op { margin:0 .14em; font-weight:700; color:var(--n700); }
  .mx .mx-par { color:var(--n500); font-weight:600; }
  .mx .mx-frac { display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; line-height:1.05; }
  .mx .mx-frac > .fr-n { padding:0 .28em .06em; font-size:.82em; }
  .mx .mx-frac > .fr-d { padding:.06em .28em 0; border-top:.09em solid currentColor; font-size:.82em; }
  .mx .mx-v, .mv, i.mv { font-family:var(--font-mvar); font-style:italic; font-weight:700; padding:0 .02em; }
</style></head><body>
<h1>m2u2 부등식·연립방정식 소수리 검수 갤러리</h1>
<p class="lead">word→mcq/num ${shown.filter((i) => WORD0.has(i.id)).length}문항 + 판별형 전환 ${shown.filter((i) => DISC.has(i.id)).length}문항 +
도형 그림화 ${shown.filter((i) => FIGZE.has(i.id)).length}문항 · 초록 배경 = 정답(합답형은 정답 보기 전부) · 그림·발문·보기·해설을 눈검수하세요.</p>
<main>${shown.map(card).join("\n")}</main></body></html>`;

mkdirSync("tmp/m2u2-repair", { recursive: true });
writeFileSync("tmp/m2u2-repair/index.html", html);
console.log(`rendered ${shown.length} cards → tmp/m2u2-repair/index.html`);
