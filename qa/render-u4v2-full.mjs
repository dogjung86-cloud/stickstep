// u4 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u7 v2판 계승 · 다크 그림 패널 지원).
// node qa/render-u4v2-full.mjs            → 존재하는 스테이징만 부분 검증(저작 중간 게이트)
// 전 파일(pilot + rest-a~f) 존재 시        → 160 전수 검증 + tmp/u4v2-full/index.html 렌더
// 사진: public/exam/u4 전부를 tmp로 복사.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/u4v2-pilot.ts", "POOL_U4V2_PILOT"],
  ["qa/u4v2-rest-a.ts", "POOL_U4V2_REST_A"],
  ["qa/u4v2-rest-b.ts", "POOL_U4V2_REST_B"],
  ["qa/u4v2-rest-c.ts", "POOL_U4V2_REST_C"],
  ["qa/u4v2-rest-d.ts", "POOL_U4V2_REST_D"],
  ["qa/u4v2-rest-e.ts", "POOL_U4V2_REST_E"],
  ["qa/u4v2-rest-f.ts", "POOL_U4V2_REST_F"],
];

async function loadMod(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}

const present = SRC.filter(([p]) => existsSync(p));
const items = [];
let preview = [];
for (const [p, name] of present) {
  const mod = await loadMod(p);
  items.push(...mod[name]);
  if (mod.PILOT_PREVIEW) preview = mod.PILOT_PREVIEW;
}
const allPresent = present.length === SRC.length;
console.log(`로드: ${present.map(([p]) => p.replace("qa/u4v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/u4-v2-blueprint.md §4) ──
const LESSON = {
  u4l1: { start: 201, end: 227, m: 24, M: 3, d: [11, 11, 5], fig: 14 },
  u4l2: { start: 228, end: 254, m: 24, M: 3, d: [11, 11, 5], fig: 17 },
  u4l3: { start: 255, end: 280, m: 23, M: 3, d: [10, 10, 6], fig: 15 },
  u4l4: { start: 281, end: 307, m: 24, M: 3, d: [11, 11, 5], fig: 15 },
  u4l5: { start: 308, end: 334, m: 24, M: 3, d: [11, 11, 5], fig: 15 },
  u4l6: { start: 335, end: 360, m: 23, M: 3, d: [10, 10, 6], fig: 16 },
};
// 언어 가드(설계표 §0). '입자·확산·증발·끓음·융해·응고·기화·액화·승화·열에너지'는 도입어라 제외.
// '용해'는 "조용해진다"·"이용해야"·"사용해"류 부분열 오탐이 있어 정규식(lookbehind)으로 별도 검사.
const BAN = ["분자", "녹는점", "끓는점", "어는점", "용질", "용매", "응결", "밀도", "기화열", "융해열", "숨은열", "잠열", "열평형", "플라스마", "⭕"];
const BAN_RE = [[/(?<![조이사활적])용해/, "용해"]];

// ── 문항 단위 검증 ──
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u4e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u4e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
  }
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
  if (it.type === "num") fail(`${it.id} num 금지(v2 num 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer ${Array.isArray(it.answer) ? it.answer.length : "형식"}`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const noExp = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
  const all = noExp + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const [re, name] of BAN_RE) if (re.test(all)) fail(`${it.id} 금지어 "${name}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 그림 aria가 판독 결과(상태·변화 이름)를 낭독하는지의 최소 휴리스틱:
  // 모형 판독형(mcq 정답 보기가 상태 짝·이름 단독)일 때 aria에 그 텍스트가 들어가면 FAIL.
  if (it.type === "mcq" && it.figure && String(it.figure).startsWith("<svg")) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 14 && ansText.length >= 2 && aria.includes(ansText)) fail(`${it.id} 그림 aria에 정답 "${ansText}" 노출`);
  }
  if (it.type === "mcq" && it.figure && String(it.figure).startsWith("<img")) {
    const alt = (String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
  }
}

// ── 소스(주석 포함) em대시 0 · 금지어 0 ──
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${p} 소스에 금지어 "${w}"`);
  for (const [re, name] of BAN_RE) if (re.test(src)) fail(`${p} 소스에 금지어 "${name}"`);
}

// ── 파일(레슨) 단위 쿼터 · 대역 완결 ──
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const [lid, arr] of byLesson) {
  const L = LESSON[lid];
  const want = L.end - L.start + 1;
  const complete = arr.length === want;
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  if (complete) {
    if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} ≠ ${L.m}/${L.M}`);
    if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
    const slots = arr.map((i) => Number(i.id.replace("u4e", ""))).sort((a, b) => a - b);
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}${complete ? "" : " (미완)"}`);
}

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 92) fail(`전체 시각 ${fig} ≠ 92`);
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi < 18) fail(`bogi 합답형 ${bogi} < 18`);
  if (bogi + multi < 36) fail(`합답 총량(bogi+multi) ${bogi + multi} < 36`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더(존재분 전부 — 파일럿 40 검수 게이트 겸용) ──
items.sort((a, b) => Number(a.id.replace("u4e", "")) - Number(b.id.replace("u4e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => {
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const LNAME = {
  u4l1: "L1 입자의 운동", u4l2: "L2 물질의 상태", u4l3: "L3 상태 변화의 이름",
  u4l4: "L4 상태 변화와 입자 배열", u4l5: "L5 열에너지를 흡수하는 상태 변화", u4l6: "L6 열에너지를 방출하는 상태 변화",
};
const cards = items.map((it, i) => {
  const slot = it.id.replace("u4e", "");
  const tag = `슬롯 ${slot} · ${LNAME[it.lessonId]} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig${it.figureDark ? " dark" : ""}">${it.figure}</div>`;
  if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q">${body}</article>`;
}).join("\n");

const previewCards = preview.length
  ? `<h2 class="pv-h">부록 — 파일럿 문항 미사용 신작 헬퍼 데뷔 눈검수</h2>
<div class="cols">${preview.map((p) => `<article class="q"><div class="q-head"><span class="q-tag">${p.name}</span></div><div class="q-fig${p.dark ? " dark" : ""}">${p.svg}</div></article>`).join("\n")}</div>`
  : "";

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>u4 v2 ${items.length}문항 · 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28;
         -webkit-font-smoothing: antialiased; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2;
           border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #191F28; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.55; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 17px; font-weight: 800; color: #1B64DA; }
  .q-tag { font-size: 10.5px; color: #97A1AE; letter-spacing: 0; }
  .q-prompt { font-size: 13.8px; line-height: 1.62; word-break: keep-all; }
  .q-fig { margin: 10px auto 4px; max-width: 344px; }
  .q-fig.dark { background: #0B1524; border-radius: 14px; padding: 10px 8px; }
  .q-fig svg, .q-fig img { width: 100%; height: auto; display: block; }
  .q-bogi { margin: 10px 0 2px; border: 1.4px solid #D9DFE6; border-radius: 10px; padding: 9px 12px; }
  .q-bogi-t { display: inline-block; font-size: 10.5px; font-weight: 800; color: #4E5968;
              border: 1px solid #C4CAD2; border-radius: 999px; padding: 1px 9px; margin-bottom: 6px; }
  .q-bogi-r { font-size: 12.8px; line-height: 1.55; margin-top: 3px; word-break: keep-all; }
  .q-opts { list-style: none; margin-top: 9px; display: flex; flex-direction: column; gap: 5px; }
  .q-opts li { display: flex; gap: 7px; font-size: 13.2px; line-height: 1.5; align-items: baseline; }
  .q-circ { color: #454F5D; font-weight: 600; flex: none; }
  .q-ans { margin-top: 10px; font-size: 12px; }
  .q-ans summary { cursor: pointer; color: #04B45F; font-weight: 700; font-size: 11.5px; }
  .q-exp { margin-top: 7px; background: #F5F7FA; border-radius: 8px; padding: 10px 12px;
           line-height: 1.66; color: #333D4B; }
  .q-exp .xh { display: block; font-weight: 800; color: #1B64DA; font-size: 11px; margin: 7px 0 3px; }
  .q-exp .xh:first-child { margin-top: 0; }
  .q-core { margin-top: 6px; font-size: 11.5px; color: #B4690E; font-weight: 700; }
  .pv-h { font-size: 14px; margin: 26px 0 8px; color: #4E5968; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 과학 Ⅳ. 물질의 상태 변화 · v2 재출제 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 규격 v2(word 0 · num 0(구 "문두 수치 = 정답" 전량 소거 ·
  곡선은 정성 판독) · 시각 92/160 · diff 64/64/32 · 신작 헬퍼 데뷔 · 사진 8장 전량 재사용) 적용.
  실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요. 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
${previewCards}
</div></body></html>`;

mkdirSync("tmp/u4v2-full/exam/u4", { recursive: true });
writeFileSync("tmp/u4v2-full/index.html", html);
for (const f of readdirSync("public/exam/u4")) copyFileSync(`public/exam/u4/${f}`, `tmp/u4v2-full/exam/u4/${f}`);
console.log(`렌더 완료: tmp/u4v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · exam/u4 ${readdirSync("public/exam/u4").length}장 복사`);
