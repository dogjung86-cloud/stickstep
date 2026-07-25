// m1u2 문자와 식 시험 풀 소수리(2026-07-25) 교체·수정 슬롯 검수 갤러리.
// word 0화 20 + 그림화 대상 교체 1(e063) + 그림 부착 4(e129·e164·e195·e196) = 25슬롯을
// 시험지 카드로 렌더한다(esbuild 실로드 · check와 동일 경로, m2u2-repair 갤러리 계보).
// node qa/render-m1u2-repair.mjs → tmp/m1u2-repair/index.html (루트 launch.json "m1u2-repair" 5998)
import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const FILES = ["m1u2l1", "m1u2l2", "m1u2l3", "m1u2l4", "m1u2l5", "m1u2l6", "m1u2l7", "m1u2l8", "m1u2l9"];
const WORD0 = new Set([
  "m1u2e021", "m1u2e022", "m1u2e043", "m1u2e044", "m1u2e065", "m1u2e066",
  "m1u2e087", "m1u2e088", "m1u2e109", "m1u2e110", "m1u2e131", "m1u2e132",
  "m1u2e153", "m1u2e154", "m1u2e175", "m1u2e176", "m1u2e177",
  "m1u2e198", "m1u2e199", "m1u2e200",
]);
const SWAP = new Set(["m1u2e063"]);
const FIGAT = new Set(["m1u2e129", "m1u2e164", "m1u2e195", "m1u2e196"]);

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
const shown = all.filter((it) => WORD0.has(it.id) || SWAP.has(it.id) || FIGAT.has(it.id));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const typeTag = { mcq: "5지선다", multi: "합답형", num: "직접 입력", word: "word(잔존 시 결함)" };
const circled = ["①", "②", "③", "④", "⑤"];

const card = (it) => {
  const tag = SWAP.has(it.id) ? "그림화 대상 교체" : FIGAT.has(it.id) ? "그림 부착" : "word→" + (it.type === "num" ? "num" : "mcq");
  let body = "";
  if (it.figure) body += `<div class="fig">${it.figure}</div>`;
  if (it.type === "mcq" || it.type === "multi") {
    const keys = it.type === "mcq" ? [it.answer] : it.answer;
    body += `<ol class="opts">${(it.options ?? [])
      .map((o, i) => `<li class="${keys.includes(i) ? "key" : ""}">${circled[i]} ${o}</li>`)
      .join("")}</ol>`;
  } else {
    body += `<div class="ans">정답: <b>${esc(it.answer)}</b>${it.unitLabel ? " " + esc(it.unitLabel) : ""} <span class="kind">(${esc(it.numKind ?? "int")})</span></div>`;
  }
  return `<article class="card">
    <header><span class="slot">${it.id.replace("m1u2", "")}</span><span class="tag">${tag}</span>
      <span class="meta">${it.lessonId} · ${typeTag[it.type] ?? it.type} · diff${it.diff}${it.shuffle === false ? " · 셔플 고정" : ""}</span></header>
    <div class="prompt">${it.prompt}</div>${body}
    <details><summary>해설 · 한 줄 핵심</summary><div class="explain">${it.explain}</div><div class="core">${esc(it.core ?? "")}</div></details>
  </article>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m1u2 문자와 식 소수리 검수 갤러리 (${shown.length}문항)</title>
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
<h1>m1u2 문자와 식 소수리 검수 갤러리</h1>
<p class="lead">word→mcq/num ${shown.filter((i) => WORD0.has(i.id)).length}문항 + 그림화 대상 교체 ${shown.filter((i) => SWAP.has(i.id)).length}문항 +
그림 부착 ${shown.filter((i) => FIGAT.has(i.id)).length}문항 · 초록 배경 = 정답(합답형은 정답 보기 전부) · 그림·발문·보기·해설을 눈검수하세요.</p>
<main>${shown.map(card).join("\n")}</main></body></html>`;

mkdirSync("tmp/m1u2-repair", { recursive: true });
writeFileSync("tmp/m1u2-repair/index.html", html);
console.log(`rendered ${shown.length} cards → tmp/m1u2-repair/index.html`);
