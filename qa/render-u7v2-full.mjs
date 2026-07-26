// u7 v2 160문항 전수 검증 + 시험지 갤러리 렌더(g2u7 v2판 계승 · 다크 그림 패널 지원).
// node qa/render-u7v2-full.mjs            → 존재하는 스테이징만 부분 검증(저작 중간 게이트)
// 전 파일(pilot + rest-a~e) 존재 시        → 160 전수 검증 + tmp/u7v2-full/index.html 렌더
// 사진: public/exam/u7 + public/photos(루트 jpg·png 전부 + star/pluto.webp)를 tmp로 복사.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/u7v2-pilot.ts", "POOL_U7V2_PILOT"],
  ["qa/u7v2-rest-a.ts", "POOL_U7V2_REST_A"],
  ["qa/u7v2-rest-b.ts", "POOL_U7V2_REST_B"],
  ["qa/u7v2-rest-c.ts", "POOL_U7V2_REST_C"],
  ["qa/u7v2-rest-d.ts", "POOL_U7V2_REST_D"],
  ["qa/u7v2-rest-e.ts", "POOL_U7V2_REST_E"],
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
console.log(`로드: ${present.map(([p]) => p.replace("qa/u7v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/u7-v2-blueprint.md §4) ──
const LESSON = {
  u7l1: { start: 201, end: 227, m: 24, M: 3, n: 0, d: [11, 11, 5], fig: 17 },
  u7l2: { start: 228, end: 253, m: 23, M: 3, n: 0, d: [10, 10, 6], fig: 16 },
  u7l3: { start: 254, end: 280, m: 22, M: 3, n: 2, d: [11, 11, 5], fig: 19 },
  u7l4: { start: 281, end: 307, m: 24, M: 3, n: 0, d: [11, 11, 5], fig: 17 },
  u7l5: { start: 308, end: 333, m: 23, M: 3, n: 0, d: [10, 10, 6], fig: 20 },
  u7l6: { start: 334, end: 360, m: 24, M: 3, n: 0, d: [11, 11, 5], fig: 17 },
};
// 언어 가드(설계표 §0). '천구·황도·황도 12궁'은 허용 도입어라 제외.
const BAN = ["케플러", "남중", "삭망월", "백도", "본영", "반영", "델린저", "자기력선", "승교점", "강교점", "적경", "적위", "⭕"];

// ── 문항 단위 검증 ──
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u7e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u7e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
  }
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
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
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") {
      if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`);
    } else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    if (!it.unitLabel) fail(`${it.id} num unitLabel 없음`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  const noExp = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
  const all = noExp + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 그림 aria·alt에 num 정답 수치 노출 금지의 최소 기계 검사
  if (it.type === "num" && it.figure) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (aria.includes(String(it.answer))) fail(`${it.id} 그림 aria에 정답 수치 노출`);
  }
  // 사진 alt에 천체 이름 정답 유출 검사(동정 문항 한정 휴리스틱): mcq 정답 보기가 천체 단일명이고
  // alt에 그 이름이 들어가면 FAIL.
  if (it.type === "mcq" && it.figure && String(it.figure).startsWith("<img")) {
    const alt = (String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 12 && alt.includes(ansText.replace(/자리$/, ""))) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
  }
}

// ── 소스(주석 포함) em대시 0 ──
// 주석 스캔에서 "반영"은 제외: 그림자 용어(半影)가 아니라 "검수 반영"(反映)의 동형이의어 오탐.
// 문항 노출면·해설 스캔(위)에는 그대로 남는다.
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕" && b !== "반영")) if (src.includes(w)) fail(`${p} 소스에 금지어 "${w}"`);
}

// ── 파일(레슨) 단위 쿼터 · 대역 완결 · num 유일 ──
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
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  const nums = arr.filter((i) => i.type === "num").map((i) => String(i.answer));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 파일 내 중복: ${dup.join(",")}`);
  if (complete) {
    if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
    if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
    const slots = arr.map((i) => Number(i.id.replace("u7e", ""))).sort((a, b) => a - b);
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}${complete ? "" : " (미완)"}`);
}

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 106) fail(`전체 시각 ${fig} ≠ 106`);
  // 합답 기준(§8-1 재정의): 실측 합답 7/35 중 5지 제시형은 3(=bogi 등가 8.6%), 기입·"있는 대로"형은
  // multi 등가. bogi 단독 ≥30은 실측 오독 — bogi ≥12(5지 합답 비율 정합) + bogi+multi ≥30(합답 총량).
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi < 12) fail(`bogi 합답형 ${bogi} < 12`);
  if (bogi + multi < 30) fail(`합답 총량(bogi+multi) ${bogi + multi} < 30`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더(존재분 전부 — 파일럿 40 검수 게이트 겸용) ──
items.sort((a, b) => Number(a.id.replace("u7e", "")) - Number(b.id.replace("u7e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const LNAME = {
  u7l1: "L1 태양계 구성 천체", u7l2: "L2 행성 분류", u7l3: "L3 태양의 활동",
  u7l4: "L4 지구의 자전과 공전", u7l5: "L5 달의 위상 변화", u7l6: "L6 일식과 월식",
};
const cards = items.map((it, i) => {
  const slot = it.id.replace("u7e", "");
  const tag = `슬롯 ${slot} · ${LNAME[it.lessonId]} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig${it.figureDark ? " dark" : ""}">${it.figure}</div>`;
  if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q">${body}</article>`;
}).join("\n");

const previewCards = preview.length
  ? `<h2 class="pv-h">부록 — 파일럿 문항 미사용 신작 헬퍼 데뷔 눈검수</h2>
<div class="cols">${preview.map((p) => `<article class="q"><div class="q-head"><span class="q-tag">${p.name}</span></div><div class="q-fig${p.dark ? " dark" : ""}">${p.svg}</div></article>`).join("\n")}</div>`
  : "";

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>u7 v2 ${items.length}문항 · 검수용 시험지</title>
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
  .q-blank { margin-top: 11px; font-size: 13.2px; color: #454F5D; }
  .q-line { display: inline-block; width: 88px; border-bottom: 1.6px solid #8B95A3; height: 15px;
            vertical-align: -2px; margin: 0 4px; }
  .q-unit { color: #66707E; }
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
  <h1>중1 과학 Ⅶ. 태양계 · v2 재출제 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 규격 v2(word 0 · v1 산술 num 14 전량 소거(그래프 판독 num 2만) ·
  시각 106/160 · diff 64/64/32 · 신작 헬퍼 11종 데뷔 · 신규 NASA 실사 5장) 적용.
  실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요. 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
${previewCards}
</div></body></html>`;

mkdirSync("tmp/u7v2-full/exam/u7", { recursive: true });
mkdirSync("tmp/u7v2-full/photos/star", { recursive: true });
writeFileSync("tmp/u7v2-full/index.html", html);
for (const f of readdirSync("public/exam/u7")) copyFileSync(`public/exam/u7/${f}`, `tmp/u7v2-full/exam/u7/${f}`);
let nPhotos = 0;
for (const f of readdirSync("public/photos")) {
  if (/\.(jpg|jpeg|png)$/i.test(f)) {
    copyFileSync(`public/photos/${f}`, `tmp/u7v2-full/photos/${f}`);
    nPhotos += 1;
  }
}
if (existsSync("public/photos/star/pluto.webp")) copyFileSync("public/photos/star/pluto.webp", "tmp/u7v2-full/photos/star/pluto.webp");
console.log(`렌더 완료: tmp/u7v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · exam/u7 ${readdirSync("public/exam/u7").length}장 + photos ${nPhotos}장 복사`);
