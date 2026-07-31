// u1 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u7 v2판 계승 · 부분 검증 모드 내장).
// node qa/render-u1v2-full.mjs   → 존재하는 스테이징만 부분 검증(저작 중간 게이트 · 파일럿 검수 겸용)
// 전 파일(pilot + rest-a~e) 존재 시 → 160 전수 검증 + tmp/u1v2-full/index.html 렌더
// 사진: public/exam/u1 을 tmp로 복사.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/u1v2-pilot.ts", "POOL_U1V2_PILOT"],
  ["qa/u1v2-rest-a.ts", "POOL_U1V2_REST_A"],
  ["qa/u1v2-rest-b.ts", "POOL_U1V2_REST_B"],
  ["qa/u1v2-rest-c.ts", "POOL_U1V2_REST_C"],
  ["qa/u1v2-rest-d.ts", "POOL_U1V2_REST_D"],
  ["qa/u1v2-rest-e.ts", "POOL_U1V2_REST_E"],
];

async function loadMod(path) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
}

const present = SRC.filter(([p]) => existsSync(p));
const items = [];
for (const [p, name] of present) {
  const mod = await loadMod(p);
  items.push(...mod[name]);
}
const allPresent = present.length === SRC.length;
console.log(`로드: ${present.map(([p]) => p.replace("qa/u1v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/u1-v2-blueprint.md §4) ──
const LESSON = {
  u1l1: { start: 201, end: 232, m: 27, M: 5, d: [13, 13, 6], fig: 22 },
  u1l2: { start: 233, end: 264, m: 27, M: 5, d: [13, 13, 6], fig: 28 },
  u1l3: { start: 265, end: 296, m: 27, M: 5, d: [13, 13, 6], fig: 22 },
  u1l4: { start: 297, end: 328, m: 27, M: 5, d: [13, 13, 6], fig: 18 },
  u1l5: { start: 329, end: 360, m: 27, M: 5, d: [12, 12, 8], fig: 22 },
};
// 언어 가드(설계표 §0 금지어). 도입어(변인 통제·조작 변인·대조군 등)는 당연히 제외.
const BAN = [
  "독립 변인", "종속 변인", "실험군", "재현성", "귀납", "연역", "유효 숫자", "정밀도", "상관관계",
  "온실 효과", "화석 연료", "신재생 에너지", "탄소 중립", "탄소 발자국", "나노 기술", "빅데이터",
  "블록체인", "메타버스", "자율 주행", "분자", "⭕",
];

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u1e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u1e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    // 사진 실재 검사
    const src = (f.match(/src="([^"]*)"/) ?? [])[1];
    if (src && src.startsWith("exam/") && !existsSync(`public/${src}`)) fail(`${it.id} 사진 파일 없음: public/${src}`);
  }
  if (it.type === "word" || it.type === "num") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
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
  if (!it.core) fail(`${it.id} core 없음`);
  // 사진 alt에 정답 유출(동정 문항 휴리스틱): mcq 정답 보기가 짧은 명사구고 alt에 그대로 들어가면 FAIL
  if (it.type === "mcq" && it.figure && String(it.figure).startsWith("<img")) {
    const alt = (String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
  }
  // 그림 aria에 정답 보기 문구 유출
  if (it.figure && String(it.figure).startsWith("<svg") && it.type === "mcq") {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length >= 4 && ansText.length <= 12 && aria.includes(ansText)) fail(`${it.id} 그림 aria에 정답 "${ansText}" 유출`);
  }
}

// ── 소스(주석 포함) em대시 0 · 금지어 0 ──
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${p} 소스에 금지어 "${w}"`);
}

// ── 파일(레슨) 단위 쿼터 ──
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
    const slots = arr.map((i) => Number(i.id.replace("u1e", ""))).sort((a, b) => a - b);
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}${complete ? "" : " (미완)"}`);
}

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 112) fail(`전체 시각 ${fig} ≠ 112`);
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi < 16) fail(`bogi 합답형 ${bogi} < 16`);
  if (bogi + multi < 38) fail(`합답 총량(bogi+multi) ${bogi + multi} < 38`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더 ──
items.sort((a, b) => Number(a.id.replace("u1e", "")) - Number(b.id.replace("u1e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => (it.type === "mcq" ? CIRC[it.answer] : it.answer.map((i) => CIRC[i]).join(", "));
const LNAME = {
  u1l1: "L1 과학적 탐구 방법", u1l2: "L2 직접 탐구하기", u1l3: "L3 과학과 인류 문명",
  u1l4: "L4 첨단 과학기술", u1l5: "L5 지속가능한 삶",
};
const cards = items.map((it, i) => {
  const slot = it.id.replace("u1e", "");
  const tag = `슬롯 ${slot} · ${LNAME[it.lessonId]} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
  if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q">${body}</article>`;
}).join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>u1 v2 ${items.length}문항 · 검수용 시험지</title>
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
  .q-tag { font-size: 10.5px; color: #97A1AE; }
  .q-prompt { font-size: 13.8px; line-height: 1.62; word-break: keep-all; }
  .q-fig { margin: 10px auto 4px; max-width: 344px; }
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
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 과학 Ⅰ. 과학과 인류의 지속가능한 삶 · v2 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 신규 출제(num 0 · word 0 · 시각 112/160 · diff 64/64/32 ·
  신작 헬퍼 9종 · 실사 15장). 실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요.
  초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/u1v2-full/exam/u1", { recursive: true });
writeFileSync("tmp/u1v2-full/index.html", html);
let n = 0;
for (const f of readdirSync("public/exam/u1")) {
  if (f.endsWith(".webp")) { copyFileSync(`public/exam/u1/${f}`, `tmp/u1v2-full/exam/u1/${f}`); n += 1; }
}
console.log(`렌더 완료: tmp/u1v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · 사진 ${n}장 복사`);
