// g2u3 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u3 v2판 계승 · 과학 재출제 6호).
// node qa/render-g2u3v2-full.mjs          → 존재하는 스테이징만 부분 검증(저작 중간 게이트)
// 전 파일(pilot + rest-a~e) 존재 시        → 160 전수 검증 + tmp/g2u3v2-full/index.html 렌더
// 사진: public/exam/g2u3(webp)를 tmp로 복사.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/g2u3v2-pilot.ts", "POOL_G2U3V2_PILOT"],
  ["qa/g2u3v2-rest-a.ts", "POOL_G2U3V2_REST_A"],
  ["qa/g2u3v2-rest-b.ts", "POOL_G2U3V2_REST_B"],
  ["qa/g2u3v2-rest-c.ts", "POOL_G2U3V2_REST_C"],
  ["qa/g2u3v2-rest-d.ts", "POOL_G2U3V2_REST_D"],
  ["qa/g2u3v2-rest-e.ts", "POOL_G2U3V2_REST_E"],
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
console.log(`로드: ${present.map(([p]) => p.replace("qa/g2u3v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/g2u3-v2-blueprint.md §1) ──
const LESSON = {
  g2u3l1: { start: 201, end: 218, m: 13, M: 2, n: 3, d: [7, 7, 4], fig: 12 },
  g2u3l2: { start: 219, end: 237, m: 17, M: 2, n: 0, d: [8, 7, 4], fig: 11 },
  g2u3l3: { start: 238, end: 254, m: 15, M: 2, n: 0, d: [7, 7, 3], fig: 5 },
  g2u3l4: { start: 255, end: 272, m: 13, M: 2, n: 3, d: [7, 7, 4], fig: 9 },
  g2u3l5: { start: 273, end: 295, m: 21, M: 2, n: 0, d: [9, 9, 5], fig: 11 },
  g2u3l6: { start: 296, end: 318, m: 21, M: 2, n: 0, d: [9, 9, 5], fig: 8 },
  g2u3l7: { start: 319, end: 339, m: 15, M: 2, n: 4, d: [8, 9, 4], fig: 10 },
  g2u3l8: { start: 340, end: 360, m: 17, M: 2, n: 2, d: [9, 9, 3], fig: 10 },
};
// 언어 가드(설계표 §1). '매질'은 파동 단원 정식 어휘라 허용 · '실상'은 "사실상" 오탐 방지 lookbehind.
const BAN = ["초점", "허상", "분산", "스펙트럼", "전반사", "임계각", "굴절률", "파면", "회절", "간섭", "도플러", "데시벨", "옥타브", "공명", "⭕"];
const BAN_RE = [/(?<![사현진])실상/];
// 셔플 문항 해설의 보기 위치 지칭 금지(u1 check 계보).
const POS_RE = /(첫 번째 보기|두 번째 보기|세 번째 보기|네 번째 보기|다섯 번째 보기|마지막 보기)/;

// ── 문항 단위 검증 ──
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u3e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u3e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
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
  if (it.bogi && it.shuffle !== false) fail(`${it.id} bogi 조합 보기는 shuffle:false 의무`);
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
  if (it.shuffle !== false && POS_RE.test(exp)) fail(`${it.id} 셔플 문항 해설에 보기 위치 지칭`);
  const noExp = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
  const all = noExp + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const re of BAN_RE) if (re.test(all)) fail(`${it.id} 금지어(정규식) ${re}`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 그림 aria에 num 정답 수치 노출 금지의 최소 기계 검사.
  // 예외: 같은 수치가 문두에도 있으면 조건 값 서술(동등 접근)이라 허용 — 반사각=입사각처럼
  // 조건 값이 곧 정답인 아키타입(examFigures g2u3 헤더 규칙 계승).
  if (it.type === "num" && it.figure) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (aria.includes(String(it.answer)) && !plain(it.prompt).includes(String(it.answer))) fail(`${it.id} 그림 aria에 정답 수치 노출`);
  }
  // 사진 alt에 정답 유출 검사(짧은 정답 보기 텍스트가 alt에 그대로 들어가면 FAIL)
  if (it.type === "mcq" && it.figure && (String(it.figure).startsWith("<img") || String(it.figure).startsWith("<div"))) {
    const alts = [...String(it.figure).matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(" ");
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 12 && alts.includes(ansText)) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
  }
}

// ── 소스(주석 포함) em대시·금지어 0 ──
for (const [p] of present) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${p} 소스에 금지어 "${w}"`);
  for (const re of BAN_RE) if (re.test(src)) fail(`${p} 소스에 금지어(정규식) ${re}`);
}

// ── 파일(레슨) 단위 쿼터 · 대역 완결 · num 유일 ──
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
const numAll = [];
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
  numAll.push(...nums);
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 파일 내 중복: ${dup.join(",")}`);
  if (complete) {
    if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
    if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
    const slots = arr.map((i) => Number(i.id.replace("g2u3e", ""))).sort((a, b) => a - b);
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}${complete ? "" : " (미완)"}`);
}
{
  const dup = numAll.filter((v, i) => numAll.indexOf(v) !== i);
  if (dup.length) fail(`num 정답 파일 간 중복: ${dup.join(",")}`);
}

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 76) fail(`전체 시각 ${fig} ≠ 76`);
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22`);
  if (bogi + multi < 38) fail(`합답 총량(bogi+multi) ${bogi + multi} < 38`);
  const nofig = items.filter((i) => !i.figure).length;
  if (nofig !== 84) fail(`무그림 ${nofig} ≠ 84`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더(존재분 전부 — 파일럿 40 검수 게이트 겸용) ──
items.sort((a, b) => Number(a.id.replace("g2u3e", "")) - Number(b.id.replace("g2u3e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => {
  if (it.type === "num") return `${it.answer}${it.unitLabel ? " " + it.unitLabel : ""}`;
  if (it.type === "mcq") return CIRC[it.answer];
  return it.answer.map((i) => CIRC[i]).join(", ");
};
const LNAME = {
  g2u3l1: "L1 빛의 반사", g2u3l2: "L2 빛의 굴절", g2u3l3: "L3 물체를 보는 과정", g2u3l4: "L4 평면거울의 상",
  g2u3l5: "L5 거울과 렌즈", g2u3l6: "L6 빛의 합성", g2u3l7: "L7 파동의 발생과 전달", g2u3l8: "L8 소리의 특성",
};
const cards = items.map((it, i) => {
  const slot = it.id.replace("g2u3e", "");
  const tag = `슬롯 ${slot} · ${LNAME[it.lessonId]} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
  let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
  body += `<div class="q-prompt">${it.prompt}</div>`;
  if (it.figure) body += `<div class="q-fig${it.figureDark ? " dark" : ""}">${it.figure}</div>`;
  if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
  if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
  if (it.type === "num") body += `<div class="q-blank">답: <span class="q-line"></span>${it.unitLabel ? `<span class="q-unit">${it.unitLabel}</span>` : ""}</div>`;
  body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
  return `<article class="q" data-id="${it.id}">${body}</article>`;
}).join("\n");

const previewCards = preview.length
  ? `<h2 class="pv-h">부록 — 파일럿 문항 미사용 신작 헬퍼·모드 데뷔 눈검수(확대분에서 사용 예정)</h2>
<div class="cols">${preview.map((p) => `<article class="q"><div class="q-head"><span class="q-tag">${p.name}</span></div><div class="q-fig${p.dark ? " dark" : ""}">${p.svg}</div></article>`).join("\n")}</div>`
  : "";

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>g2u3 v2 ${items.length}문항 · 검수용 시험지</title>
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
    <h1>중2 과학 Ⅲ. 빛과 파동 — v2 문항 풀 검수용 시험지 (${items.length}문항)</h1>
    <p>과학 재출제 6호 · 정본 설계표 qa/g2u3-v2-blueprint.md · 문항마다 [정답·해설 보기]를 펼쳐 검수해 주세요.
    슬롯 태그의 난이도(●)와 순서고정(shuffle:false) 표시는 검수 편의를 위한 것으로 실제 앱 화면에는 노출되지 않아요.</p>
  </header>
  <div class="cols">${cards}</div>
  ${previewCards}
</div>
</body></html>`;

mkdirSync("tmp/g2u3v2-full", { recursive: true });
// 사진 복사(실이미지 검수)
const photoSrc = "public/exam/g2u3";
if (existsSync(photoSrc)) {
  mkdirSync("tmp/g2u3v2-full/exam/g2u3", { recursive: true });
  for (const f of readdirSync(photoSrc)) copyFileSync(`${photoSrc}/${f}`, `tmp/g2u3v2-full/exam/g2u3/${f}`);
}
writeFileSync("tmp/g2u3v2-full/index.html", html.replaceAll(`src="/exam/g2u3/`, `src="exam/g2u3/`), "utf8");
console.log(`갤러리: tmp/g2u3v2-full/index.html (${items.length}문항${preview.length ? ` + 부록 ${preview.length}카드` : ""})`);
