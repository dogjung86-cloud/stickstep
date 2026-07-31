// u3(열) 단원 종합 평가 기계 검사 v2 — 재출제 160제(u3e201~e360) 규격.
// v1(100제) 검사는 존재하지 않았다(u3는 시험 시스템 파일럿 단원) · 정본 쿼터/금지어 = qa/u3-v2-blueprint.md §0·§4.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-u3.mjs
import { build } from "esbuild";
import { readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const LESSON = {
  u3l1: { start: 201, end: 228, m: 24, M: 3, n: 1, d: [11, 11, 6], fig: 17 },
  u3l2: { start: 229, end: 258, m: 23, M: 3, n: 4, d: [12, 12, 6], fig: 20 },
  u3l3: { start: 259, end: 294, m: 33, M: 3, n: 0, d: [14, 14, 8], fig: 22 },
  u3l4: { start: 295, end: 328, m: 23, M: 3, n: 8, d: [14, 14, 6], fig: 22 },
  u3l5: { start: 329, end: 360, m: 26, M: 3, n: 3, d: [13, 13, 6], fig: 18 },
};
// 언어 가드(설계표 §0). 중1은 '분자' 금지(입자) · 도입어(단열·비열·열량·kcal)는 제외.
const BAN = ["분자", "열용량", "칼로리", "절대 온도", "절대온도", "켈빈", "화씨", "열전도율", "전도율", "대류권", "열역학", "엔트로피", "⭕"];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_U3L${lid.replace("u3l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u3e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u3e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역 위반`);
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id} bogi 합답형인데 shuffle 고정 아님`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 형식/개수`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") {
      if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`);
    } else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    if (!it.unitLabel) fail(`${it.id} num unitLabel 없음`);
    // num은 전량 자료 동반(설계표 §0 — 문두 나열만으로 푸는 num 금지)
    if (!it.figure) fail(`${it.id} num인데 자료(그림·표·조건 상자) 없음`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  const exposed = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
  const all = exposed + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 그림 aria·alt에 num 정답 수치 노출 금지
  if (it.type === "num" && it.figure) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (aria.includes(String(it.answer))) fail(`${it.id} 그림 aria에 정답 수치 노출`);
  }
  // 사진 alt에 짧은 정답 보기 텍스트 유출
  if (it.type === "mcq" && it.figure && /<(img|div)/.test(String(it.figure))) {
    const alts = [...String(it.figure).matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(" ");
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length <= 12 && alts.includes(ansText)) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
  }
}

// 소스(주석 포함) em대시·금지어 — 저작 주석까지 스캔(m1u6 ⑦ 계보)
for (const lid of Object.keys(LESSON)) {
  const src = readFileSync(`src/content/exams/${lid}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
}

// 파일별 쿼터
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const [lid, arr] of byLesson) {
  const L = LESSON[lid];
  const want = L.end - L.start + 1;
  if (arr.length !== want) fail(`${lid} ${arr.length}문항 ≠ ${want}`);
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  const nums = arr.filter((i) => i.type === "num").map((i) => String(i.answer));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 중복: ${dup.join(",")}`);
}

// 전체: 시각·합답(§8-2 재정의: bogi ≥24 · bogi+multi ≥39)·무그림·판별 상한
const fig = items.filter((i) => i.figure).length;
if (fig !== 99) fail(`전체 시각 ${fig} ≠ 99`);
const nofig = items.filter((i) => !i.figure).length;
if (nofig !== 61) fail(`무그림 ${nofig} ≠ 61`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (bogi < 24) fail(`bogi ${bogi} < 24`);
if (bogi + multi < 39) fail(`합답 총량 ${bogi + multi} < 39`);
// 판별 편중 가드: 설계표 §0의 상한 48은 "무자료 성질·진술 판별"(화이트리스트 ①②) 기준이라
// 무그림 총량(61 = ①~⑤ 전부)과 다르다. 분류는 수동 태그 몫이므로 기계 검사는 총량만 본다(u7 v2 관행).
const judge = items.filter((i) => !i.figure && (i.type === "mcq" || i.type === "multi")).length;

console.log(`u3 v2: ${items.length}문항 · 시각 ${fig} · 무그림 ${nofig} · bogi ${bogi} · multi ${multi} · 판별 ${judge} · WARN ${warns}`);
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log("check-exam-u3 v2 ALL PASS");
