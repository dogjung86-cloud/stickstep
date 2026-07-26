// g2u2 v2 전수 검증 + 시험지 갤러리 렌더(m1u6판 render-full의 과학 이식 — 부분 검증 모드 내장).
// node qa/render-g2u2v2-full.mjs            → 존재하는 스테이징 파일만 부분 검증(저작 중간 게이트)
// 전 파일(pilot + rest-*) 존재 시           → 160 전수 검증 + tmp/g2u2v2-full/index.html 렌더
// 사진 문항의 <img src="/...">는 public/에서 tmp/g2u2v2-full/ 아래로 복사해 갤러리 단독 서빙.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SRC = [
  ["qa/g2u2v2-pilot.ts", "POOL_G2U2V2_PILOT"],
  ["qa/g2u2v2-rest-a.ts", "POOL_G2U2V2_REST_A"],
  ["qa/g2u2v2-rest-b.ts", "POOL_G2U2V2_REST_B"],
  ["qa/g2u2v2-rest-c.ts", "POOL_G2U2V2_REST_C"],
  ["qa/g2u2v2-rest-d.ts", "POOL_G2U2V2_REST_D"],
  ["qa/g2u2v2-rest-e.ts", "POOL_G2U2V2_REST_E"],
];

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const present = SRC.filter(([p]) => existsSync(p));
const items = [];
for (const [p, name] of present) items.push(...(await loadPool(p, name)));
const allPresent = present.length === SRC.length;
console.log(`로드: ${present.map(([p]) => p.replace("qa/g2u2v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => console.warn("WARN", m);

// ── 정본 쿼터(설계표 §0·§4) ──
const LESSON = {
  g2u2l1: { start: 201, end: 218, m: 15, M: 3, d: [7, 7, 4], vis: 8 },
  g2u2l2: { start: 219, end: 236, m: 16, M: 2, d: [7, 7, 4], vis: 11 },
  g2u2l3: { start: 237, end: 254, m: 16, M: 2, d: [7, 7, 4], vis: 16 },
  g2u2l4: { start: 255, end: 271, m: 15, M: 2, d: [7, 8, 2], vis: 12 },
  g2u2l5: { start: 272, end: 288, m: 15, M: 2, d: [8, 7, 2], vis: 10 },
  g2u2l6: { start: 289, end: 306, m: 16, M: 2, d: [7, 7, 4], vis: 15 },
  g2u2l7: { start: 307, end: 324, m: 16, M: 2, d: [7, 7, 4], vis: 12 },
  g2u2l8: { start: 325, end: 342, m: 16, M: 2, d: [7, 7, 4], vis: 11 },
  g2u2l9: { start: 343, end: 360, m: 15, M: 3, d: [7, 7, 4], vis: 16 },
};
// 미도입 용어(노출면·해설 공통 금지 — 설계표 §0 언어 가드)
const BAN = ["습곡", "단층", "해령", "해구", "진앙", "진원", "P파", "S파", "맨틀 대류", "수렴형", "발산형", "보존형", "감람석", "편암", "석순", "종유석", "조산 운동"];

// ── 문항 단위 검증 ──
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u2e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u2e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.type === "word" || it.type === "num") fail(`${it.id} ${it.type} 금지(v2 규격 num 0·word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.includes("<img")) fail(`${it.id} figure가 SVG/사진이 아님`);
    if (f.length < (f.includes("<img") ? 60 : 120)) fail(`${it.id} figure 빈약`);
    // aria·alt에 정답 유출 후보(광물·암석 이름) — 수동 판정 보조
    const aria = [...f.matchAll(/aria-label="([^"]*)"/g), ...f.matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(" ");
    for (const nm of ["석영", "장석", "흑운모", "각섬석", "방해석", "자철석", "화강암", "현무암", "유문암", "반려암", "역암", "사암", "이암", "석회암", "규암", "대리암", "편마암"])
      if (aria.includes(nm)) warn(`${it.id} figure aria/alt에 이름 "${nm}" — 정답 유출 여부 수동 확인`);
  }
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer ${Array.isArray(it.answer) ? it.answer.length : "형식"}`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.bogi && (!Array.isArray(it.bogi) || it.bogi.length < 2)) fail(`${it.id} bogi 형식`);
  const exp = plain(it.explain);
  if (exp.length < 250 || exp.length > 450) fail(`${it.id} 해설 ${exp.length}자(250~450)`);
  if (!/<span class='xh'>/.test(it.explain)) fail(`${it.id} 해설 xh 소제목 없음`);
  if (!it.core || plain(it.core).length < 8) fail(`${it.id} core 부실`);
  const faces = [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core, it.figure ?? ""].join(" ");
  for (const b of BAN) if (faces.includes(b)) fail(`${it.id} 금지어 "${b}"`);
  if (/[—]/.test(plain(it.prompt) + (it.options ?? []).join(""))) warn(`${it.id} 노출면 em대시(과학은 허용이나 확인)`);
}

// ── 소스 수준 검사(CRLF 정규화 후 금지어 — 주석 포함) ──
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  for (const b of BAN) if (src.includes(b)) fail(`${p} 소스(주석 포함) 금지어 "${b}"`);
}

// ── 파일별 집계(부분 모드는 보고만 · 전 파일 모드는 정확값 검사) ──
const per = {};
for (const it of items) {
  const L = (per[it.lessonId] ??= { m: 0, M: 0, d: [0, 0, 0], vis: 0, n: 0 });
  L.n += 1;
  if (it.type === "mcq") L.m += 1;
  if (it.type === "multi") L.M += 1;
  if (it.diff) L.d[it.diff - 1] += 1;
  if (it.figure) L.vis += 1;
}
console.log("파일별 현황(문항/m/M/diff/시각):");
for (const [lid, v] of Object.entries(per)) console.log(`  ${lid}: ${v.n} · m${v.m}/M${v.M} · d${v.d.join("/")} · 시각 ${v.vis}`);
if (allPresent) {
  if (items.length !== 160) fail(`총 ${items.length} ≠ 160`);
  for (const [lid, want] of Object.entries(LESSON)) {
    const v = per[lid] ?? { m: 0, M: 0, d: [0, 0, 0], vis: 0, n: 0 };
    if (v.n !== want.end - want.start + 1) fail(`${lid} ${v.n}문항 ≠ ${want.end - want.start + 1}`);
    if (v.m !== want.m || v.M !== want.M) fail(`${lid} 유형 m${v.m}/M${v.M} ≠ m${want.m}/M${want.M}`);
    if (v.d.join() !== want.d.join()) fail(`${lid} diff ${v.d.join("/")} ≠ ${want.d.join("/")}`);
    if (v.vis !== want.vis) fail(`${lid} 시각 ${v.vis} ≠ ${want.vis}`);
  }
}

// ── 교차 유출 보조 스캔(num 없음 — mcq 정답 문구 10자+ 대조 후보만) ──
const ansText = items
  .filter((i) => i.type === "mcq")
  .map((i) => ({ id: i.id, t: plain(i.options?.[i.answer] ?? "") }))
  .filter((a) => a.t.length >= 10);
for (const a of ansText) {
  for (const other of items) {
    if (other.id === a.id) continue;
    const face = plain([other.prompt, ...(other.bogi ?? [])].join(" "));
    if (face.includes(a.t)) warn(`교차 유출 후보: ${other.id} 노출면이 ${a.id} 정답 문구 포함("${a.t.slice(0, 24)}…")`);
  }
}

if (fails) {
  console.error(`\n검증 실패 ${fails}건 — 갤러리 생략`);
  process.exit(1);
}
console.log(`\n검증 통과(${items.length}문항)`);

// ── 갤러리 렌더 ──
const OUT = "tmp/g2u2v2-full";
mkdirSync(OUT, { recursive: true });
// 사진 복사: figure의 <img src="/..."> 경로를 public/에서 복사
const imgPaths = new Set();
for (const it of items) {
  const f = String(it.figure ?? "");
  for (const m of f.matchAll(/(?:src|href)="\/((?:exam|geo)\/[^"]+)"/g)) imgPaths.add(m[1]);
}
for (const p of imgPaths) {
  const from = `public/${p}`;
  const to = `${OUT}/${p}`;
  if (!existsSync(from)) { fail(`사진 없음: ${from}`); continue; }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
}
console.log(`사진 복사 ${imgPaths.size}장`);

const TYPE_KO = { mcq: "5지선다", multi: "복수선택" };
const LESSON_TITLE = {
  g2u2l1: "L1 지구계와 지구 내부", g2u2l2: "L2 광물의 특성", g2u2l3: "L3 화성암",
  g2u2l4: "L4 퇴적암", g2u2l5: "L5 변성암", g2u2l6: "L6 암석의 순환",
  g2u2l7: "L7 풍화와 토양", g2u2l8: "L8 대륙 이동설", g2u2l9: "L9 판의 경계",
};
const cards = items
  .map((it) => {
    const slot = it.id.replace("g2u2", "");
    const bogi = it.bogi
      ? `<div class="bogi">${it.bogi.map((b, i) => `<div><b>${"ㄱㄴㄷㄹㅁ"[i]}.</b> ${b}</div>`).join("")}</div>`
      : "";
    const opts = (it.options ?? [])
      .map((o, i) => {
        const isAns = it.type === "multi" ? it.answer.includes(i) : it.answer === i;
        return `<li class="${isAns ? "ans" : ""}"><span class="oi">${"①②③④⑤"[i]}</span> ${o}</li>`;
      })
      .join("");
    return `<article class="card" id="${slot}">
      <header><b>${slot}</b> <span class="chips"><i>${LESSON_TITLE[it.lessonId]}</i><i>${TYPE_KO[it.type]}</i><i>diff ${it.diff}</i>${it.shuffle === false ? "<i>고정순서</i>" : ""}${it.figure ? "<i>자료</i>" : ""}</span></header>
      <div class="prompt">${it.prompt}</div>
      ${it.figure ? `<div class="fig">${it.figure}</div>` : ""}
      ${bogi}
      <ul class="opts">${opts}</ul>
      <details><summary>해설 · core</summary><div class="explain">${it.explain}</div><div class="core">${it.core}</div></details>
    </article>`;
  })
  .join("\n");

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>g2u2 v2 ${items.length}문항 검수 갤러리</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px 12px 80px; background: #F2F4F6; color: #191F28;
         font-family: Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
  h1 { font-size: 18px; margin: 4px 4px 2px; }
  .sum { color: #4E5968; font-size: 12.5px; margin: 0 4px 14px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px; }
  .card { background: #fff; border: 1px solid #E5E8EB; border-radius: 16px; padding: 14px; }
  .card header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .card header b { font-size: 14px; }
  .chips i { display: inline-block; font-style: normal; font-size: 11px; font-weight: 700; color: #4E5968;
             background: #F2F4F6; border-radius: 8px; padding: 2px 7px; margin-left: 4px; }
  .prompt { font-size: 14.5px; line-height: 1.55; margin-bottom: 8px; }
  .fig { margin: 8px 0; }
  .fig svg { width: 100%; height: auto; display: block; }
  .bogi { background: #F8FAFC; border: 1px solid #DCE0E6; border-radius: 12px; padding: 8px 12px;
          font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
  .opts { list-style: none; margin: 0; padding: 0; font-size: 13.5px; }
  .opts li { padding: 6px 10px; border: 1px solid #E5E8EB; border-radius: 10px; margin-bottom: 5px; line-height: 1.5; }
  .opts li.ans { border-color: #04B45F; background: #EAFBF2; }
  .oi { font-weight: 800; color: #8B95A1; margin-right: 2px; }
  .opts li.ans .oi { color: #04B45F; }
  details { margin-top: 8px; font-size: 13px; }
  summary { cursor: pointer; color: #3182F6; font-weight: 700; }
  .explain { margin-top: 8px; line-height: 1.65; color: #333D4B; }
  .explain .xh, .explain span.xh { display: block; font-weight: 800; color: #1B64DA; margin: 8px 0 2px; }
  .core { margin-top: 8px; padding: 8px 10px; background: #FFF8E6; border-radius: 10px; font-weight: 700; }
  @media (max-width: 420px) { .grid { grid-template-columns: 1fr; } }
</style>
<h1>g2u2 지권의 변화 — v2 재출제 검수 갤러리</h1>
<p class="sum">${items.length}문항${allPresent ? "(전수)" : "(파일럿)"} · mcq ${items.filter((i) => i.type === "mcq").length} · multi ${items.filter((i) => i.type === "multi").length} · 자료 ${items.filter((i) => i.figure).length} · 초록 테두리 = 정답(저작 인덱스)</p>
<div class="grid">
${cards}
</div>`;
writeFileSync(`${OUT}/index.html`, html);
console.log(`갤러리: ${OUT}/index.html`);
