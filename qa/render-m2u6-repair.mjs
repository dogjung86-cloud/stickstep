// m2u6 확률 시험 풀 중수리(2026-07-25) 교체·신작 슬롯 검수 갤러리.
// 수리 44슬롯 + 그림 보강 슬롯을 시험지 카드로 렌더한다(esbuild 실로드 — check와 동일 경로).
// node qa/render-m2u6-repair.mjs → tmp/m2u6-repair/index.html (launch.json "m2u6-repair" 5996)
import { mkdirSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const FILES = ["m2u6l1", "m2u6l2", "m2u6l3", "m2u6l4", "m2u6l5", "m2u6l6", "m2u6l7", "m2u6l8", "m2u6l9"];
// 중수리 슬롯(word 0화 20 + multi 전환 9 + multi 재설계 9 + 문장 mcq 교체 5 + e128 발문 = 44)
// + 검산 2병렬 반영으로 추가 수리된 잔존 쌍둥이 3슬롯(e013·e017·e019)
const REPAIRED = new Set([
  "m2u6e013", "m2u6e017", "m2u6e019",
  "m2u6e003", "m2u6e007", "m2u6e009", "m2u6e012", "m2u6e018",
  "m2u6e025", "m2u6e029", "m2u6e031", "m2u6e040",
  "m2u6e047", "m2u6e051", "m2u6e053", "m2u6e062",
  "m2u6e078", "m2u6e079", "m2u6e087", "m2u6e088",
  "m2u6e091", "m2u6e098", "m2u6e101", "m2u6e102", "m2u6e109", "m2u6e110",
  "m2u6e123", "m2u6e124", "m2u6e128", "m2u6e131", "m2u6e132",
  "m2u6e145", "m2u6e146", "m2u6e153", "m2u6e154",
  "m2u6e162", "m2u6e166", "m2u6e167", "m2u6e175", "m2u6e176", "m2u6e177",
  "m2u6e188", "m2u6e189", "m2u6e190", "m2u6e198", "m2u6e199", "m2u6e200",
]);
// 그림만 보강된 기존 문항(발문에 표 안내 추가)
const FIG_ONLY = new Set(["m2u6e034", "m2u6e152"]);

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
// FULL=1이면 200문항 전체(수리 슬롯은 태그로 구분), 기본은 수리분만.
const shown = process.env.FULL === "1" ? all : all.filter((it) => REPAIRED.has(it.id) || FIG_ONLY.has(it.id));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const typeTag = { mcq: "5지선다", multi: "합답형", num: "직접 입력", word: "word(잔존 시 결함)" };
const circled = ["①", "②", "③", "④", "⑤"];

const card = (it) => {
  const tag = FIG_ONLY.has(it.id) ? "그림 보강" : REPAIRED.has(it.id) ? "교체·신작" : "기존";
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
    <header><span class="slot">${it.id.replace("m2u6", "")}</span><span class="tag ${tag === "기존" ? "old" : ""}">${tag}</span>
      <span class="meta">${it.lessonId} · ${typeTag[it.type] ?? it.type} · diff${it.diff}${it.shuffle === false ? " · 셔플 고정" : ""}</span></header>
    <div class="prompt">${it.prompt}</div>${body}
    <details><summary>해설 · 한 줄 핵심</summary><div class="explain">${it.explain}</div><div class="core">${esc(it.core ?? "")}</div></details>
  </article>`;
};

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>m2u6 확률 중수리 검수 갤러리 (${shown.length}문항)</title>
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
  .tag.old { background:#F2F4F6; color:#8B95A1; }
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
<h1>m2u6 확률 중수리 검수 갤러리${process.env.FULL === "1" ? " · 200제 전체" : ""}</h1>
<p class="lead">교체·신작 ${shown.filter((i) => REPAIRED.has(i.id)).length}문항 + 그림 보강 ${shown.filter((i) => FIG_ONLY.has(i.id)).length}문항${
  process.env.FULL === "1" ? ` + 기존 ${shown.filter((i) => !REPAIRED.has(i.id) && !FIG_ONLY.has(i.id)).length}문항(회색 태그)` : ""
} ·
초록 배경 = 정답(합답형은 정답 보기 전부) · 그림·발문·보기·해설을 눈검수하세요.</p>
<main>${shown.map(card).join("\n")}</main></body></html>`;

mkdirSync("tmp/m2u6-repair", { recursive: true });
writeFileSync("tmp/m2u6-repair/index.html", html);
console.log(`rendered ${shown.length} cards → tmp/m2u6-repair/index.html`);
