// u5(힘의 작용) 단원 종합 평가 기계 검사 v2 — 재출제 160제(u5e201~e360) 규격.
// v1(100제)에는 전용 검사기가 없었다 · 정본 쿼터/금지어 = qa/u5-v2-blueprint.md §0·§4.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-u5.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const LESSON = {
  u5l1: { start: 201, end: 220, m: 17, M: 2, n: 1, d: [8, 8, 4], fig: 14 },
  u5l2: { start: 221, end: 242, m: 16, M: 2, n: 4, d: [9, 9, 4], fig: 16 },
  u5l3: { start: 243, end: 265, m: 17, M: 2, n: 4, d: [9, 9, 5], fig: 13 },
  u5l4: { start: 266, end: 288, m: 15, M: 2, n: 6, d: [9, 9, 5], fig: 15 },
  u5l5: { start: 289, end: 312, m: 20, M: 2, n: 2, d: [10, 9, 5], fig: 15 },
  u5l6: { start: 313, end: 336, m: 15, M: 2, n: 7, d: [9, 10, 5], fig: 17 },
  u5l7: { start: 337, end: 360, m: 22, M: 2, n: 0, d: [10, 10, 4], fig: 16 },
};
// 언어 가드(설계표 §0) · '속도'가 '가속도'까지 함께 잡는다 · 도입어(알짜힘·평형·속력·작용점 등)는 제외.
const BAN = ["관성", "작용 반작용", "작용반작용", "수직 항력", "수직항력", "등속", "훅", "가속도", "속도", "힘 센서", "합력", "중량", "뉴턴의 운동 법칙", "최대 정지 마찰", "m/s", "⭕"];
const POS_REF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_U5L${lid.replace("u5l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

const photoUse = new Map();
const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u5e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u5e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역 위반`);
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
  for (const bad of POS_REF) if (exp.includes(bad)) fail(`${it.id} 해설 보기 위치 지칭 "${bad}"`);
  const exposed = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
  const all = exposed + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (!it.core) fail(`${it.id} core 없음`);
  // 그림 aria에 num 정답 수치 노출 금지(숫자 경계 매칭 — 한 자리 답의 부분열 오탐 방지)
  if (it.type === "num" && it.figure) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    const numRe = new RegExp(`(?<![0-9.])${String(it.answer).replace(/\./g, "\\.")}(?![0-9])`);
    if (numRe.test(aria)) fail(`${it.id} 그림 aria에 정답 수치 노출`);
  }
  // 사진 alt에 짧은 정답 보기 텍스트 유출 + 사진 실재·장당 사용 수 집계
  if (it.figure && /<img/.test(String(it.figure))) {
    const files = [...String(it.figure).matchAll(/exam\/u5\/([a-z0-9-]+\.webp)/g)].map((m) => m[1]);
    for (const f of files) {
      if (!existsSync(`public/exam/u5/${f}`)) fail(`${it.id} 사진 파일 없음: ${f}`);
      photoUse.set(f, (photoUse.get(f) ?? 0) + 1);
    }
    if (it.type === "mcq") {
      const alts = [...String(it.figure).matchAll(/alt="([^"]*)"/g)].map((m) => m[1]).join(" ");
      const ansText = plain(it.options?.[it.answer] ?? "");
      if (ansText.length <= 12 && alts.includes(ansText)) fail(`${it.id} 사진 alt에 정답 "${ansText}" 유출`);
    }
  }
}
for (const [f, n] of photoUse) if (n > 2) fail(`사진 ${f} 사용 ${n}문항 > 2(장당 상한)`);

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

// 전체: 시각·합답 하한·무그림·num 총량
const fig = items.filter((i) => i.figure).length;
if (fig !== 106) fail(`전체 시각 ${fig} ≠ 106`);
const nofig = items.filter((i) => !i.figure).length;
if (nofig !== 54) fail(`무그림 ${nofig} ≠ 54`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (bogi < 17) fail(`bogi ${bogi} < 17`);
if (bogi + multi < 31) fail(`합답 총량 ${bogi + multi} < 31`);
const nums = items.filter((i) => i.type === "num").length;
if (nums !== 24) fail(`num ${nums} ≠ 24`);
// 판별 편중 가드: 상한 40은 무자료 성질·진술 판별(화이트리스트 ①②) 기준 — 분류는 수동 태그 몫이라
// 기계 검사는 무그림 선택형 총량만 참고 출력한다(u7·u3 v2 관행).
const judge = items.filter((i) => !i.figure && (i.type === "mcq" || i.type === "multi")).length;

console.log(`u5 v2: ${items.length}문항 · 시각 ${fig} · 무그림 ${nofig} · bogi ${bogi} · multi ${multi} · num ${nums} · 무그림 선택형 ${judge} · 사진 ${photoUse.size}종 · WARN ${warns}`);
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log("check-exam-u5 v2 ALL PASS");
