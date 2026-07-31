// u1(과학과 인류의 지속가능한 삶) 단원 종합 평가 기계 검사 — 신규 출제 160제(u1e201~e360).
// 정본 쿼터·금지어 = qa/u1-v2-blueprint.md §0·§4. 이식된 레슨 파일(src/content/exams/u1l1~l5)을 검사한다.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-u1.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

// §4 파일별 쿼터(정본). num·word는 전 파일 0.
const LESSON = {
  u1l1: { start: 201, end: 232, m: 27, M: 5, d: [13, 13, 6], fig: 22 },
  u1l2: { start: 233, end: 264, m: 27, M: 5, d: [13, 13, 6], fig: 28 },
  u1l3: { start: 265, end: 296, m: 27, M: 5, d: [13, 13, 6], fig: 22 },
  u1l4: { start: 297, end: 328, m: 27, M: 5, d: [13, 13, 6], fig: 18 },
  u1l5: { start: 329, end: 360, m: 27, M: 5, d: [12, 12, 8], fig: 22 },
};
// §0 언어 가드(미도입 어휘). 도입어(변인 통제·조작 변인·대조군·온실 기체·업사이클링 등)는 제외.
const BAN = [
  "독립 변인", "종속 변인", "실험군", "재현성", "귀납", "연역", "유효 숫자", "정밀도", "상관관계",
  "온실 효과", "화석 연료", "신재생 에너지", "탄소 중립", "탄소 발자국", "나노 기술", "빅데이터",
  "블록체인", "메타버스", "자율 주행", "분자", "⭕",
];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_U1L${lid.replace("u1l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

// ── 문항 단위 ──
const ids = new Set();
const promptSeen = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  const slot = Number(it.id.replace("u1e", ""));
  if (!/^u1e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);

  // 유형: num·word 즉시 FAIL(실측 계산 0/22 · 개수 세기 0/22 · 용어 빈칸 자료 판독 산출)
  if (it.type === "num" || it.type === "word") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
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
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 개수`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }

  // 그림·사진
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    const src = (f.match(/src="[^"]*?(exam\/u1\/[^"]+)"/) ?? [])[1];
    if (src && !existsSync(`public/${src}`)) fail(`${it.id} 사진 파일 없음: public/${src}`);
    // alt/aria 유출: 짧은 명사형 정답이 그대로 낭독되면 FAIL
    const alt = (f.match(/alt="([^"]*)"/) ?? [])[1] ?? (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ansText = plain(it.options?.[it.answer] ?? "");
      if (ansText.length >= 3 && ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 그림 alt/aria에 정답 "${ansText}" 유출`);
    }
  }

  // 해설·표기
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) warn(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답/.test(String(it.explain))) warn(`${it.id} 해설 '오답' 소제목 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  // 보기 위치 지칭 금지(ㄱㄴㄷ은 고정 라벨이라 허용)
  for (const w of ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"]) {
    if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  }
  // 정답 보기에 절대어 금지(§8-6 개정판) — 오답 쪽 상한은 유형 판정이 필요해 수동 검수 몫
  if (it.type === "mcq" && !it.bogi) {
    const ans = plain(it.options?.[it.answer] ?? "");
    for (const w of ["전혀", "결코", "무조건"]) if (ans.includes(w)) fail(`${it.id} 정답 보기에 절대어 "${w}"`);
  }
  // 문두 정확 중복(그림 문항끼리는 교과서 반복 문형이라 WARN)
  const key = plain(it.prompt);
  if (promptSeen.has(key)) {
    const prev = promptSeen.get(key);
    if (it.figure && prev.figure) warn(`${it.id} 문두가 ${prev.id}과 동일(그림 문항 · 수용 가능)`);
    else fail(`${it.id} 문두가 ${prev.id}과 완전 동일`);
  } else promptSeen.set(key, it);
}

// ── 소스(주석 포함) 금지어·em대시 ──
for (const lid of Object.keys(LESSON)) {
  const src = readFileSync(`src/content/exams/${lid}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
}

// ── 파일 단위 쿼터 ──
for (const [lid, L] of Object.entries(LESSON)) {
  const arr = items.filter((i) => i.lessonId === lid);
  const want = L.end - L.start + 1;
  if (arr.length !== want) { fail(`${lid} ${arr.length}문항 ≠ ${want}`); continue; }
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} ≠ ${L.m}/${L.M}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  for (let s = L.start; s <= L.end; s++) if (!arr.some((i) => Number(i.id.replace("u1e", "")) === s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig}`);
}

// ── 전역 ──
const fig = items.filter((i) => i.figure).length;
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (fig !== 112) fail(`전체 시각 ${fig} ≠ 112`);
if (bogi < 16) fail(`bogi 합답형 ${bogi} < 16`);
if (bogi + multi < 38) fail(`합답 총량 ${bogi + multi} < 38`);
// 사진 문항은 같은 사진 최대 2문항
const photoUse = new Map();
for (const it of items) {
  const f = String(it.figure ?? "");
  const src = (f.match(/src="[^"]*?(exam\/u1\/[^"]+)"/) ?? [])[1];
  if (src) photoUse.set(src, (photoUse.get(src) ?? 0) + 1);
}
for (const [src, n] of photoUse) if (n > 2) fail(`사진 ${src} ${n}문항(상한 2)`);
console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi} · 사진 ${photoUse.size}종/${[...photoUse.values()].reduce((a, b) => a + b, 0)}문항`);

if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`\nALL PASS (${warns} WARN)`);
