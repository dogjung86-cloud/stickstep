// g2u7 시험 풀 기계 검사 v2(재출제 2호 규격) — 커밋 전 스캔. node qa/check-exam-g2u7.mjs
//   정본 쿼터 = qa/g2u7-v2-blueprint.md §4(파일별 유형·diff·그림 정확값) · word 0 · 개수 세기 num 0.
//   esbuild 실로드(백틱 해설 자연 처리) + 소스 스캔(CRLF 정규화 · em대시 · 금지어 · lazy 금지).
import { build } from "esbuild";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const result = await build({ entryPoints: ["src/content/exams/g2u7.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
const pool = mod.G2U7_EXAM.pool;

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let bad = 0;
const fail = (m) => { console.log("FAIL", m); bad++; };

// ── 정본 쿼터(설계표 §4) ──
const SPEC = {
  g2u7l1: { start: 201, m: 17, M: 2, n: 1, d: [8, 8, 4], fig: 13 },
  g2u7l2: { start: 221, m: 18, M: 2, n: 0, d: [8, 8, 4], fig: 13 },
  g2u7l3: { start: 241, m: 16, M: 2, n: 2, d: [8, 8, 4], fig: 8 },
  g2u7l4: { start: 261, m: 12, M: 2, n: 6, d: [8, 8, 4], fig: 13 },
  g2u7l5: { start: 281, m: 13, M: 2, n: 5, d: [8, 8, 4], fig: 14 },
  g2u7l6: { start: 301, m: 12, M: 2, n: 6, d: [8, 8, 4], fig: 10 },
  g2u7l7: { start: 321, m: 18, M: 2, n: 0, d: [8, 8, 4], fig: 10 },
  g2u7l8: { start: 341, m: 18, M: 2, n: 0, d: [8, 8, 4], fig: 10 },
};
const BAN = ["F=BIL", "플레밍", "오른손 법칙", "왼손 법칙", "솔레노이드", "자기력선", "쿨롱", "전위차", "기전력", "정류자", "브러시", "직류", "교류", "여사건", "⭕", "P=VI", "P = VI"];

// ── 문항 단위 ──
const ids = new Set();
for (const it of pool) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u7e", ""));
  const L = SPEC[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u7e\d{3}$/.test(it.id) || slot < L.start || slot > L.start + 19) fail(`${it.id} 슬롯 대역 위반`);
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
  if (![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 수`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") { if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`); }
    else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    if (!it.unitLabel) fail(`${it.id} num unitLabel 없음`);
    if (it.figure) {
      const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
      if (aria.includes(a)) fail(`${it.id} 그림 aria에 정답 수치 노출`);
    }
    // 인공 개수 세기 금지(감사 §6) = 무그림 목록 나열 + 개수 답. 그림 판독형 세기(모형 전자 수 등)는 정당.
    if (!it.figure && /모두 몇 (가지|개)/.test(plain(it.prompt))) fail(`${it.id} 개수 세기 num(목록 판정은 multi로)`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) console.log("WARN", `${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (all.includes("—")) fail(`${it.id} em대시`);
  if (it.figure && String(it.figure).includes('loading="lazy"')) fail(`${it.id} 발주 이미지 lazy 금지`);
}

// ── 슬롯 완전 커버리지 ──
for (let s = 201; s <= 360; s++) if (!ids.has(`g2u7e${s}`)) fail(`슬롯 ${s} 누락`);

// ── 파일(레슨) 단위 쿼터 ──
const byLesson = new Map();
for (const it of pool) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const [lid, L] of Object.entries(SPEC)) {
  const arr = byLesson.get(lid) ?? [];
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const figN = arr.filter((i) => i.figure).length;
  if (arr.length !== 20) fail(`${lid} ${arr.length}문항 ≠ 20`);
  if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
  if (d.join() !== L.d.join()) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (figN !== L.fig) fail(`${lid} 그림 ${figN} ≠ ${L.fig}`);
  const nums = arr.filter((i) => i.type === "num").map((i) => String(i.answer));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 파일 내 중복: ${dup.join(",")}`);
  console.log(`${lid}: m${m}/M${M}/n${n} · diff ${d.join("/")} · 그림 ${figN}`);
}
const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
for (const it of pool) cnt[it.type]++;
const bogiN = pool.filter((i) => i.bogi).length;
const figTotal = pool.filter((i) => i.figure).length;
console.log(`합계: ${pool.length} · ${JSON.stringify(cnt)} · bogi ${bogiN} · 그림 ${figTotal}`);
if (pool.length !== 160) fail(`총 ${pool.length} ≠ 160`);
if (cnt.mcq !== 124 || cnt.multi !== 16 || cnt.num !== 20 || cnt.word !== 0) fail(`유형 합계 ${cnt.mcq}/${cnt.multi}/${cnt.num}/${cnt.word} ≠ 124/16/20/0`);
if (bogiN < 26) fail(`bogi ${bogiN} < 26`);
if (figTotal !== 91) fail(`그림 합계 ${figTotal} ≠ 91`);

// ── 사진 참조 실재 검증 ──
const photoDir = "public/exam/g2u7";
const have = new Set(existsSync(photoDir) ? readdirSync(photoDir) : []);
for (const it of pool) {
  for (const mfile of String(it.figure ?? "").matchAll(/exam\/g2u7\/([a-z0-9-]+\.webp)/g)) {
    if (!have.has(mfile[1])) fail(`${it.id} 사진 없음: ${mfile[1]}`);
  }
}

// ── 소스 스캔(주석 포함) ──
for (const f of [..."12345678"].map((n) => `src/content/exams/g2u7l${n}.ts`).concat(["src/content/exams/g2u7.ts"])) {
  const src = readFileSync(f, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${f} 소스에 em대시`);
  for (const w of BAN) if (src.includes(w)) fail(`${f} 소스에 금지어 "${w}"`);
}

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
