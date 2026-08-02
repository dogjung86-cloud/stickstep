// g2u5 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u1 v2판 계승 · 부분 검증 모드 내장).
// node qa/render-g2u5v2-full.mjs  → 존재하는 스테이징만 부분 검증(저작 중간 게이트 · 파일럿 검수 겸용)
// 전 파일(pilot + rest-a~f) 존재 시 → 160 전수 검증 + tmp/g2u5v2-full/index.html 렌더.
// 사진: public/exam/g2u5(신규 발주)와 public/plant(레슨 자산 재사용)을 tmp로 복사한다.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/g2u5v2-pilot.ts", "POOL_G2U5_PILOT"],
  ["qa/g2u5v2-rest-a.ts", "POOL_G2U5_REST_A"],
  ["qa/g2u5v2-rest-b.ts", "POOL_G2U5_REST_B"],
  ["qa/g2u5v2-rest-c.ts", "POOL_G2U5_REST_C"],
  ["qa/g2u5v2-rest-d.ts", "POOL_G2U5_REST_D"],
  ["qa/g2u5v2-rest-e.ts", "POOL_G2U5_REST_E"],
  ["qa/g2u5v2-rest-f.ts", "POOL_G2U5_REST_F"],
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
console.log(`로드: ${present.map(([p]) => p.replace("qa/g2u5v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " — 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/g2u5-v2-blueprint.md §4) ──
const LESSON = {
  g2u5l1: { start: 201, end: 227, m: 24, M: 3, d: [11, 11, 5], fig: 19, bogi: 4, name: "L1 잎 속 양분 공장" },
  g2u5l2: { start: 228, end: 254, m: 24, M: 3, d: [11, 11, 5], fig: 21, bogi: 4, name: "L2 광합성의 증거 찾기" },
  g2u5l3: { start: 255, end: 281, m: 24, M: 3, d: [11, 11, 5], fig: 21, bogi: 4, name: "L3 광합성을 바꾸는 세 조건" },
  g2u5l4: { start: 282, end: 307, m: 24, M: 2, d: [10, 10, 6], fig: 15, bogi: 4, name: "L4 식물도 숨을 쉬어요" },
  g2u5l5: { start: 308, end: 334, m: 24, M: 3, d: [11, 11, 5], fig: 20, bogi: 4, name: "L5 광합성과 호흡의 맞물림" },
  g2u5l6: { start: 335, end: 360, m: 24, M: 2, d: [10, 10, 6], fig: 16, bogi: 4, name: "L6 잎에서 열매까지, 양분의 여행" },
};
// 언어 가드(설계표 §0 금지어 — 미도입 어휘). 도입어(광합성·엽록체·기공·물관·체관·호흡 등)는 제외.
const BAN = [
  "명반응", "암반응", "캘빈", "틸라코이드", "스트로마", "엽록소 a", "엽록소 b", "ATP", "NADPH",
  "광포화점", "광보상점", "보상점", "보상 상태", "증산", "삼투", "유관속", "형성층", "책상 조직",
  "해면 조직", "표피 세포", "수크로스", "셀룰로스", "효소", "촉매", "이화 작용", "동화 작용",
  "유기물", "탄수화물", "총광합성량", "겉보기광합성량", "분자", "⭕",
];

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u5e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u5e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    // 사진은 src=, 도해 베이스 라스터는 SVG <image href=> 로 들어온다(둘 다 실재 검사).
    for (const m of f.matchAll(/(?:src|href)="\/?((?:exam|plant)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 이미지 파일 없음: public/${m[1]}`);
    }
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
    // 짧은 라벨형 보기(㉠·(가)·ㄱ 조합)는 셔플하면 관례 순서가 깨진다(u4 v2 관행).
    // 라벨형 = 보기가 기호(㉠~㉭·①~⑩·ㄱㄴㄷ·(가)(나))와 구분 기호만으로 이루어진 경우.
    // 내용어가 조금이라도 남으면 완비 서술·완비 짝이라 셔플을 허용한다(g2u3 v2 예외).
    const bare = (s) => s.replace(/\([가-힣]\)/g, "").replace(/[㉠-㉭①-⑩ㄱ-ㅎ,·\s]/g, "");
    const labelish = (it.options ?? []).map(plain).every((o) => bare(o) === "");
    if (labelish && it.shuffle !== false) fail(`${it.id} 짧은 라벨형 보기인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer ${Array.isArray(it.answer) ? it.answer.length : "형식"}`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) fail(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답 하나씩 격파/.test(String(it.explain))) fail(`${it.id} 해설 '오답 하나씩 격파' 소제목 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const w of ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"]) {
    if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  }
  if (!it.core) fail(`${it.id} core 없음`);
  // 사진 alt · 그림 aria 정답 유출
  if (it.type === "mcq" && it.figure) {
    const f = String(it.figure);
    const alt = (f.match(/alt="([^"]*)"/) ?? [])[1] ?? (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length >= 3 && ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 그림 alt/aria에 정답 "${ansText}" 유출`);
  }
}

// ── 소스(주석 포함) em대시 0 · 금지어 0 · CRLF 0 ──
for (const [p] of present) {
  const raw = readFileSync(p, "utf8");
  if (raw.includes("\r\n")) fail(`${p} CRLF 검출`);
  const src = raw.replace(/\r\n/g, "\n");
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
    if (d.join() !== L.d.join()) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
    if (bogi !== L.bogi) fail(`${lid} bogi ${bogi} ≠ ${L.bogi}`);
    const slots = arr.map((i) => Number(i.id.replace("g2u5e", "")));
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
  if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22`);
  if (bogi + multi < 36) fail(`합답 총량(bogi+multi) ${bogi + multi} < 36`);
  // 사진 장당 상한 2
  const photo = new Map();
  for (const it of items) {
    const src = (String(it.figure ?? "").match(/src="([^"]*)"/) ?? [])[1];
    if (src) photo.set(src, (photo.get(src) ?? 0) + 1);
  }
  for (const [src, n] of photo) if (n > 2) fail(`사진 ${src} ${n}문항(상한 2)`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi} · 사진 ${photo.size}종`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더 ──
items.sort((a, b) => Number(a.id.replace("g2u5e", "")) - Number(b.id.replace("g2u5e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => (it.type === "mcq" ? CIRC[it.answer] : it.answer.map((i) => CIRC[i]).join(", "));
const cards = items.map((it, i) => {
  const slot = it.id.replace("g2u5e", "");
  const tag = `슬롯 ${slot} · ${LESSON[it.lessonId].name} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
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
<title>g2u5 v2 ${items.length}문항 · 검수용 시험지</title>
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
  <h1>중2 과학 Ⅴ. 식물과 에너지 · v2 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 신규 출제(num 0 · word 0 · 시각 112/160 · diff 64/64/32 ·
  신작 헬퍼 9종 · 사진 16종). 실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요.
  초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

const COPY = [
  ["public/exam/g2u5", "tmp/g2u5v2-full/exam/g2u5"],
  ["public/exam/g2u5fig", "tmp/g2u5v2-full/exam/g2u5fig"],
  ["public/plant/figs", "tmp/g2u5v2-full/plant/figs"],
  ["public/plant/labs", "tmp/g2u5v2-full/plant/labs"],
];
for (const [, to] of COPY) mkdirSync(to, { recursive: true });
writeFileSync("tmp/g2u5v2-full/index.html", html);
let n = 0;
for (const [from, to] of COPY) {
  if (!existsSync(from)) continue;
  for (const f of readdirSync(from)) {
    if (f.endsWith(".webp")) { copyFileSync(`${from}/${f}`, `${to}/${f}`); n += 1; }
  }
}
console.log(`렌더 완료: tmp/g2u5v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · 사진 ${n}장 복사`);
