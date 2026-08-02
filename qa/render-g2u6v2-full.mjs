// g2u6 v2 160문항 전수 검증 + 시험지 갤러리 렌더(u1 v2판 계승 · 부분 검증 모드 내장).
// node qa/render-g2u6v2-full.mjs  → 존재하는 스테이징만 부분 검증(저작 중간 게이트 · 파일럿 검수 겸용)
// 전 파일(pilot + rest-a~f) 존재 시 → 160 전수 검증 + tmp/g2u6v2-full/index.html 렌더
// 사진: public/exam/g2u6 을 tmp로 복사(폴더가 없으면 건너뜀).
import { build } from "esbuild";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";

const SRC = [
  ["qa/g2u6v2-pilot.ts", "POOL_G2U6V2_PILOT"],
  ["qa/g2u6v2-rest-a.ts", "POOL_G2U6V2_REST_A"],
  ["qa/g2u6v2-rest-b.ts", "POOL_G2U6V2_REST_B"],
  ["qa/g2u6v2-rest-c.ts", "POOL_G2U6V2_REST_C"],
  ["qa/g2u6v2-rest-d.ts", "POOL_G2U6V2_REST_D"],
  ["qa/g2u6v2-rest-e.ts", "POOL_G2U6V2_REST_E"],
  ["qa/g2u6v2-rest-f.ts", "POOL_G2U6V2_REST_F"],
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
console.log(`로드: ${present.map(([p]) => p.replace("qa/g2u6v2-", "").replace(".ts", "")).join(" · ")} (${items.length}문항)${allPresent ? "" : " · 부분 검증 모드"}`);

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

// ── 정본 쿼터(설계표 qa/g2u6-v2-blueprint.md §4) ──
const LESSON = {
  g2u6l1: { start: 201, end: 226, m: 24, M: 2, bogi: 4, d: [10, 10, 6], fig: 18, name: "L1 영양소" },
  g2u6l2: { start: 227, end: 253, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 21, name: "L2 소화와 소화효소" },
  g2u6l3: { start: 254, end: 280, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 21, name: "L3 순환계" },
  g2u6l4: { start: 281, end: 307, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 20, name: "L4 호흡계와 호흡운동" },
  g2u6l5: { start: 308, end: 333, m: 24, M: 2, bogi: 4, d: [10, 10, 6], fig: 19, name: "L5 배설계" },
  g2u6l6: { start: 334, end: 360, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 17, name: "L6 세포호흡과 기관계의 통합" },
};
// 언어 가드(설계표 §1-2). 도입어(아밀레이스·펩신·트립신·라이페이스·쓸개즙·바이타민·토리·허파꽈리 등)는 제외.
const BAN = [
  "ATP", "해당 과정", "TCA", "전자 전달계", "헨레 고리", "사구체 여과율", "능동 수송", "삼투",
  "항체", "면역", "호르몬", "자율 신경", "교감", "부교감", "계면활성", "유화", "항상성",
  "마이토콘드리아", "미토콘드리아", "펩티드", "요산", "혈압", "심박출량",
  "아밀라아제", "리파아제", "모노글리세리드", "글리세롤", "폐포", "기관지", "사구체", "신장",
  "담즙", "비타민", "소장", "대장", "체순환", "림프관", "흉강",
  "CO2", "CO₂", "H2O", "H₂O", "C6H12O6", "O2", "O₂", "⭕",
];
// 노폐물이 부분열로 걸리므로 lookbehind 필수(파일럿 저작 중 자가 적발).
const LUNG = /(?<!노)폐(?!동맥|정맥)/;
const POSREF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];

const ids = new Set();
const promptSeen = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  const slot = Number(it.id.replace("g2u6e", ""));
  if (!/^g2u6e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);

  if (it.type === "num" || it.type === "word") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (!it.options || it.options.length !== 5) fail(`${it.id} 보기 ${it.options?.length}개(5지 고정)`);
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id} 합답형인데 shuffle 고정 없음`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi 정답 개수`);
  }
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    // 하이브리드 그림이 참조하는 라스터는 exam/g2u6(신규 발주)과 body/figs(재사용) 두 갈래다.
    for (const m of f.matchAll(/src="[^"]*?((?:exam\/g2u6|body\/figs(?:\/v2)?)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 라스터 없음: public/${m[1]}`);
    }
    // aria·alt 정답 유출(하한 2자 · 순수 라벨 정답은 제외 · 문두와 같은 문자열도 제외)
    const alt = (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? (f.match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ans = plain(it.options[it.answer]);
      // 순수 라벨 정답(A~E · (가)~(마) · ㉠~㉣)은 라벨 자체가 정오 정보가 아니라 유출 검사에서 뺀다.
      const pureLabel = /^(?:[A-E]|\([가-힣]\)|[㉠㉡㉢㉣])$/.test(ans);
      // 자료가 인쇄한 라벨(표 머리글·행 이름 등)이 그대로 보기가 된 문항은 유출이 아니다.
      // alt가 정답만 콕 집어 말할 때가 유출이므로, 보기 둘 이상이 alt에 나오면 판정에서 뺀다
      // (g2u3 v2 "순수 라벨 정답 제외"의 표 자료판 · 파일럿 e346이 이 사각에서 오탐).
      const optsInAlt = it.options.filter((o) => plain(o) && alt.includes(plain(o))).length;
      if (!pureLabel && optsInAlt < 2 && ans.length >= 2 && ans.length <= 14 && alt.includes(ans) && !plain(it.prompt).includes(ans)) {
        fail(`${it.id} 그림 aria/alt에 정답 "${ans}" 유출`);
      }
    }
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) fail(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) fail(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답/.test(String(it.explain))) fail(`${it.id} 해설 '오답' 소제목 없음`);
  for (const w of POSREF) if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  if (it.type === "mcq" && !it.bogi) {
    const ans = plain(it.options[it.answer]);
    for (const w of ["전혀", "결코", "무조건"]) if (ans.includes(w)) fail(`${it.id} 정답 보기에 절대어 "${w}"`);
  }
  const all = plain(it.prompt) + it.options.map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (LUNG.test(all)) fail(`${it.id} 금지어 "폐"(기관 이름은 허파 · 혈관만 폐동맥·폐정맥)`);
  const key = plain(it.prompt);
  if (promptSeen.has(key)) fail(`${it.id} 문두가 ${promptSeen.get(key)}과 완전 동일`);
  else promptSeen.set(key, it.id);
}

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
    if (bogi !== L.bogi) fail(`${lid} bogi ${bogi} ≠ ${L.bogi}`);
    if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
    if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
    const slots = arr.map((i) => Number(i.id.replace("g2u6e", "")));
    for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  }
  console.log(`${lid}: ${arr.length}/${want} · m${m}/M${M} · bogi ${bogi} · diff ${d.join("/")} · 시각 ${fig}${complete ? "" : " (미완)"}`);
}

if (allPresent) {
  if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);
  const fig = items.filter((i) => i.figure).length;
  if (fig !== 116) fail(`전체 시각 ${fig} ≠ 116`);
  const bogi = items.filter((i) => i.bogi).length;
  const multi = items.filter((i) => i.type === "multi").length;
  if (bogi !== 28) fail(`bogi 합답형 ${bogi} ≠ 28`);
  if (bogi + multi < 44) fail(`합답 총량(bogi+multi) ${bogi + multi} < 44`);
  const m2 = items.filter((i) => i.type === "multi" && i.answer.length === 2).length;
  console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}(정답 2개 ${m2} · 3개 ${multi - m2})`);
  const photoUse = new Map();
  for (const it of items) {
    for (const m of String(it.figure ?? "").matchAll(/src="[^"]*?((?:exam\/g2u6|body\/figs(?:\/v2)?)\/[^"]+)"/g)) {
      photoUse.set(m[1], (photoUse.get(m[1]) ?? 0) + 1);
    }
  }
  for (const [src, n] of photoUse) if (n > 2) fail(`라스터 ${src} ${n}문항(상한 2)`);
  console.log(`라스터 ${photoUse.size}종 · ${[...photoUse.values()].reduce((a, b) => a + b, 0)}문항 사용`);
}
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("검증 ALL PASS");

// ── 시험지 렌더 ──
items.sort((a, b) => Number(a.id.replace("g2u6e", "")) - Number(b.id.replace("g2u6e", "")));
const CIRC = ["①", "②", "③", "④", "⑤"];
const GNL = ["ㄱ", "ㄴ", "ㄷ"];
const answerText = (it) => (it.type === "mcq" ? CIRC[it.answer] : it.answer.map((i) => CIRC[i]).join(", "));
const cards = items
  .map((it, i) => {
    const slot = it.id.replace("g2u6e", "");
    const tag = `슬롯 ${slot} · ${LESSON[it.lessonId].name} · ${it.type}${it.diff ? " · 난이도 " + "●".repeat(it.diff) + "○".repeat(3 - it.diff) : ""}${it.shuffle === false ? " · 순서고정" : ""}`;
    let body = `<div class="q-head"><span class="q-no">${String(i + 1).padStart(3, "0")}</span><span class="q-tag">${tag}</span></div>`;
    body += `<div class="q-prompt">${it.prompt}</div>`;
    if (it.figure) body += `<div class="q-fig">${it.figure}</div>`;
    if (it.bogi) body += `<div class="q-bogi"><span class="q-bogi-t">보기</span>${it.bogi.map((b, j) => `<div class="q-bogi-r"><b>${GNL[j]}.</b> ${b}</div>`).join("")}</div>`;
    body += `<ol class="q-opts">${it.options.map((o, j) => `<li><span class="q-circ">${CIRC[j]}</span><span>${o}</span></li>`).join("")}</ol>`;
    body += `<details class="q-ans"><summary>정답 ${answerText(it)} · 해설 보기</summary><div class="q-exp">${it.explain}</div><div class="q-core">핵심: ${it.core}</div></details>`;
    return `<article class="q">${body}</article>`;
  })
  .join("\n");

let html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>g2u6 v2 ${items.length}문항 · 검수용 시험지</title>
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
  <h1>중2 과학 Ⅵ. 동물과 에너지 · v2 ${allPresent ? "160문항" : `파일럿 ${items.length}문항`}</h1>
  <p>검수용 시험지 렌더 · 교과서 3사 준거 <b>신규 출제</b>(계산 0/40 · 개수 세기 0/40 · 그래프 0/40 실측 →
  num 0 · word 0 · 시각 116/160 72.5% · diff 64/64/32 · 기호 판독 본진 · 신작 헬퍼 24종).
  실제 앱에서는 20문항씩 추출되고 해설은 제출 후에만 보여요. 초록 줄을 누르면 정답·해설이 열립니다.</p>
</header>
<div class="cols">
${cards}
</div>
</div></body></html>`;

mkdirSync("tmp/g2u6v2-full", { recursive: true });
// 라스터를 재발주하면 파일 이름이 그대로라 브라우저가 옛 그림을 캐시로 계속 보여 준다(실사고).
// 갤러리 HTML의 이미지 주소에만 파일 수정 시각을 붙여 캐시를 무효화한다(풀 소스는 건드리지 않는다).
html = html.replace(/src="((?:exam\/g2u6|body\/figs(?:\/v2)?)\/[^"?]+)"/g, (m, rel) => {
  try { return `src="${rel}?v=${Math.round(statSync(`public/${rel}`).mtimeMs)}"`; } catch { return m; }
});
writeFileSync("tmp/g2u6v2-full/index.html", html);
// 하이브리드 그림이 참조하는 발주 라스터를 전부 tmp로 복사한다(exam/g2u6 신규 2장 + body/figs 재사용분).
let n = 0;
for (const dir of ["exam/g2u6", "body/figs", "body/figs/v2"]) {
  if (!existsSync(`public/${dir}`)) continue;
  mkdirSync(`tmp/g2u6v2-full/${dir}`, { recursive: true });
  for (const f of readdirSync(`public/${dir}`)) {
    if (f.endsWith(".webp")) { copyFileSync(`public/${dir}/${f}`, `tmp/g2u6v2-full/${dir}/${f}`); n += 1; }
  }
}
console.log(`렌더 완료: tmp/g2u6v2-full/index.html (${Math.round(html.length / 1024)}KB, 문항 ${items.length}) · 사진 ${n}장 복사`);
