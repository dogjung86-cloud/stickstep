// u2 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u1 v2판 계승 · 부분 검증 모드 내장).
// node qa/render-u2v2-full.mjs   → 존재하는 스테이징만 부분 검증(저작 중간 게이트 · 파일럿 검수 겸용)
// 전 파일(pilot + rest-a~f) 존재 시 → 160 전수 검증 + tmp/u2v2-full/index.html 렌더
// 사진: public/exam/u2 · public/bio3 를 tmp로 복사한다.
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/u2v2-pilot.ts", "POOL_U2V2_PILOT"],
  ["qa/u2v2-rest-a.ts", "POOL_U2V2_REST_A"],
  ["qa/u2v2-rest-b.ts", "POOL_U2V2_REST_B"],
  ["qa/u2v2-rest-c.ts", "POOL_U2V2_REST_C"],
  ["qa/u2v2-rest-d.ts", "POOL_U2V2_REST_D"],
  ["qa/u2v2-rest-e.ts", "POOL_U2V2_REST_E"],
  ["qa/u2v2-rest-f.ts", "POOL_U2V2_REST_F"],
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
console.log(`로드: ${present.map(([p]) => p.replace("qa/u2v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " · 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/u2-v2-blueprint.md §4) ──
const LESSON = {
  u2l1: { start: 201, end: 216, m: 15, M: 1, d: [7, 6, 3], fig: 8, name: "L1 세포, 생명의 기본 단위" },
  u2l2: { start: 217, end: 232, m: 14, M: 2, d: [7, 6, 3], fig: 12, name: "L2 세포의 구조와 기능" },
  u2l3: { start: 233, end: 248, m: 15, M: 1, d: [7, 6, 3], fig: 11, name: "L3 현미경으로 세포 보기" },
  u2l4: { start: 249, end: 264, m: 14, M: 2, d: [6, 7, 3], fig: 12, name: "L4 세포의 모양과 기능" },
  u2l5: { start: 265, end: 280, m: 14, M: 2, d: [6, 7, 3], fig: 11, name: "L5 생물의 구성 단계" },
  u2l6: { start: 281, end: 296, m: 14, M: 2, d: [7, 6, 3], fig: 9, name: "L6 생물다양성" },
  u2l7: { start: 297, end: 312, m: 14, M: 2, d: [6, 6, 4], fig: 9, name: "L7 변이와 새로운 종" },
  u2l8: { start: 313, end: 328, m: 14, M: 2, d: [6, 7, 3], fig: 9, name: "L8 생물의 분류와 종" },
  u2l9: { start: 329, end: 344, m: 13, M: 3, d: [6, 6, 4], fig: 10, name: "L9 5계로 나눈 생물" },
  u2l10: { start: 345, end: 360, m: 13, M: 3, d: [6, 7, 3], fig: 9, name: "L10 생물다양성보전" },
};
// 언어 가드(설계표 §0-3 금지어). 도입어(세포벽·핵막·엽록체·변이·적응·원핵생물계 등)는 당연히 제외.
const BAN = [
  "총배율", "시야", "프레파라트", "회전판", "경통",
  "리보솜", "소포체", "골지체", "리소좀", "액포", "세포 소기관",
  "진핵", "원핵세포", "염색체", "유전자", "돌연변이",
  "엽록소", "기공", "세포 호흡", "삼투",
  "학명", "이명법", "계통수", "유연관계",
  "진화", "자연선택", "적자생존", "생존 경쟁",
  "개체군", "군집", "먹이사슬", "먹이그물", "생산자", "소비자", "분해자", "생태계 서비스",
  "종다양성", "유전적 다양성", "생태계다양성", "생물자원",
  "바이러스", "미생물", "무성생식", "유성생식",
  "분자", "⭕",
];
const POSREF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];

const ids = new Set();
const promptSeen = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u2e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u2e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  if (it.type === "word" || it.type === "num") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id} bogi 합답형인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer ${Array.isArray(it.answer) ? it.answer.length : "형식"}`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  // 그림·사진
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    if (/NaN|undefined|Infinity/.test(f)) fail(`${it.id} figure에 NaN·undefined 좌표`);
    if (/loading=["']lazy["']/.test(f)) fail(`${it.id} loading=lazy 사용(사고 #14)`);
    for (const m of f.matchAll(/src="([^"]*)"/g)) {
      const src = m[1];
      if (src.startsWith("exam/") && !existsSync(`public/${src}`)) fail(`${it.id} 사진 없음: public/${src}`);
      if (src.startsWith("bio3/") && !existsSync(`public/${src}`)) fail(`${it.id} 사진 없음: public/${src}`);
    }
    // alt·aria 정답 유출(짧은 명사형 정답이 그대로 낭독되면 FAIL)
    const alt = (f.match(/alt="([^"]*)"/) ?? [])[1] ?? (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ansText = plain(it.options?.[it.answer] ?? "");
      if (ansText.length >= 3 && ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 그림 alt·aria에 정답 "${ansText}" 유출`);
    }
  }
  // 해설·표기
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) console.warn(`WARN ${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답/.test(String(it.explain))) console.warn(`WARN ${it.id} 해설 '오답' 소제목 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const w of POSREF) if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  const key = plain(it.prompt);
  if (promptSeen.has(key)) fail(`${it.id} 문두가 ${promptSeen.get(key)}과 완전 동일`);
  else promptSeen.set(key, it.id);
}

// ── 소스(주석 포함) em대시 0 · 금지어 0 · CRLF 0 ──
for (const [p] of present) {
  const raw = readFileSync(p, "utf8");
  if (/\r\n/.test(raw)) fail(`${p} CRLF 줄바꿈`);
  const src = raw.replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${p} 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕" && b !== "시야")) if (src.includes(w)) fail(`${p} 소스에 금지어 "${w}"`);
}

// ── 파일(레슨) 단위 쿼터 ──
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const lid of Object.keys(LESSON)) {
  const arr = byLesson.get(lid) ?? [];
  if (!arr.length) continue;
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
    const slots = arr.map((i) => Number(i.id.replace("u2e", "")));
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}${complete ? "" : " (미완)"}`);
}

// ── 사진 장당 상한 2 + 질문 축 배타(수동) ──
const photoUse = new Map();
for (const it of items) {
  for (const m of String(it.figure ?? "").matchAll(/src="((?:exam|bio3)\/[^"]+)"/g)) {
    if (!photoUse.has(m[1])) photoUse.set(m[1], []);
    photoUse.get(m[1]).push(it.id);
  }
}
for (const [src, who] of photoUse) if (who.length > 2) fail(`사진 ${src} ${who.length}문항(상한 2): ${who.join(",")}`);

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 100) fail(`전체 시각 ${fig} ≠ 100`);
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22`);
  if (bogi + multi < 36) fail(`합답 총량(bogi+multi) ${bogi + multi} < 36`);
  const two = items.filter((i) => i.type === "multi" && i.answer.length === 2).length;
  const three = multi - two;
  if (Math.abs(two - three) > 4) fail(`multi 정답 개수 편중 2개 ${two} · 3개 ${three}`);
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}(2개 ${two}/3개 ${three}) · 사진 ${photoUse.size}종`);
} else {
  const fig = items.filter((i) => i.figure).length;
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  console.log(`부분: ${items.length} · 시각 ${fig} · bogi ${bogi} · multi ${multi} · 사진 ${photoUse.size}종`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더 ──
items.sort((a, b) => Number(a.id.replace("u2e", "")) - Number(b.id.replace("u2e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => (it.type === "mcq" ? CIRC[it.answer] : it.answer.map((i) => CIRC[i]).join(", "));
const cards = items
  .map((it, i) => {
    const slot = it.id.replace("u2e", "");
    const tag = `슬롯 ${slot} · ${LESSON[it.lessonId].name} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
    let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
    body += `<div class="q-prompt">${it.prompt}</div>`;
    if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
    if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
    if (it.options) body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
    body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
    return `<article class="q" data-id="${it.id}">${body}</article>`;
  })
  .join("\n");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>u2 v2 ${items.length}문항 · 검수용 시험지</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Pretendard", "Malgun Gothic", sans-serif; background: #E8EAEE; color: #191F28;
         -webkit-font-smoothing: antialiased; padding: 24px 12px; }
  .sheet { max-width: 980px; margin: 0 auto; background: #fff; border: 1px solid #D5DAE2;
           border-radius: 6px; padding: 34px 30px; }
  header { border-bottom: 3px solid #12B886; padding-bottom: 14px; margin-bottom: 6px; }
  header h1 { font-size: 19px; letter-spacing: -.02em; }
  header p { font-size: 12.5px; color: #66707E; margin-top: 5px; line-height: 1.55; }
  .cols { column-count: 2; column-gap: 34px; column-rule: 1px solid #E3E7ED; }
  @media (max-width: 760px) { .cols { column-count: 1; } }
  .q { break-inside: avoid; padding: 15px 2px 13px; border-bottom: 1px dashed #D9DEE6; }
  .q-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 7px; }
  .q-no { font-size: 17px; font-weight: 800; color: #0B6E4F; }
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
  .q-exp .xh { display: block; font-weight: 800; color: #0B6E4F; font-size: 11px; margin: 7px 0 3px; }
  .q-exp .xh:first-child { margin-top: 0; }
  .q-core { margin-top: 6px; font-size: 11.5px; color: #B4690E; font-weight: 700; }
</style></head><body>
<div class="sheet">
<header>
  <h1>중1 과학 Ⅱ. 생물의 구성과 다양성 · v2 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 전면 재출제(num 0 · word 0 · 시각 100/160 · diff 64/64/32 ·
  신작 헬퍼 15종 · 실사 신규 발주 0). 실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요.
  초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/u2v2-full/exam/u2", { recursive: true });
mkdirSync("tmp/u2v2-full/bio3", { recursive: true });
writeFileSync("tmp/u2v2-full/index.html", html);
let n = 0;
for (const f of readdirSync("public/exam/u2")) {
  if (f.endsWith(".webp")) { copyFileSync(`public/exam/u2/${f}`, `tmp/u2v2-full/exam/u2/${f}`); n += 1; }
}
for (const dir of ["micro", "figs", "eco", "vary"]) {
  if (!existsSync(`public/bio3/${dir}`)) continue;
  mkdirSync(`tmp/u2v2-full/bio3/${dir}`, { recursive: true });
  for (const f of readdirSync(`public/bio3/${dir}`)) {
    if (f.endsWith(".webp")) { copyFileSync(`public/bio3/${dir}/${f}`, `tmp/u2v2-full/bio3/${dir}/${f}`); n += 1; }
  }
}
console.log(`렌더 완료: tmp/u2v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · 사진 ${n}장 복사`);
