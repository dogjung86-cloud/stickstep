// g2u4 시험 풀 기계 검사 v2 — 이식본(src/content/exams/g2u4l1~l6.ts) 대상 · 커밋 전 게이트.
// v1(150제 정규식판) 전면 교체(2026-08-01 · 재출제 8호): esbuild 실로드 · §4 쿼터 파일별 정확값 ·
// word/num 규칙 · diff · 금지어(소스 주석 포함) · CRLF 정규화 · em대시 · aria/alt 유출 ·
// shuffle:false 규칙 · 해설 길이(태그 제거 250~450) · 보기 위치 지칭 · num 자료 동반 · 사진 실재.
// node qa/check-exam-g2u4.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

const FILES = ["g2u4l1", "g2u4l2", "g2u4l3", "g2u4l4", "g2u4l5", "g2u4l6"];
let fails = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };

async function loadPool(name) {
  const r = await build({ entryPoints: [`src/content/exams/${name}.ts`], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  return mod[`POOL_${name.toUpperCase()}`];
}

// §4 정확값(§7-3 재배분 반영 — blueprint 정본)
const SPEC = {
  g2u4l1: { start: 201, end: 227, m: 24, M: 3, n: 0, d: [11, 11, 5], fig: 16, bogi: 4 },
  g2u4l2: { start: 228, end: 254, m: 23, M: 2, n: 2, d: [11, 11, 5], fig: 15, bogi: 4 },
  g2u4l3: { start: 255, end: 281, m: 21, M: 2, n: 4, d: [11, 11, 5], fig: 15, bogi: 4 },
  g2u4l4: { start: 282, end: 307, m: 24, M: 2, n: 0, d: [10, 10, 6], fig: 15, bogi: 4 },
  g2u4l5: { start: 308, end: 334, m: 18, M: 3, n: 6, d: [11, 11, 5], fig: 18, bogi: 4 },
  g2u4l6: { start: 335, end: 360, m: 24, M: 2, n: 0, d: [10, 10, 6], fig: 16, bogi: 4 },
};
const BAN = ["껍질", "최외각", "옥텟", "공유 결합", "이온 결합", "금속 결합", "분자식", "실험식", "반응식", "아보가드로", "동위", "알칼리", "할로젠", "할로겐", "전해질", "전리", "이온화", "전기 영동", "전기영동", "앙금", "불꽃 반응", "스펙트럼", "질량수", "란타넘", "악티늄", "원자량", "분자량"];
const BAN_RE = [/주기율(?!표)/];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let total = 0;
let figTotal = 0;
let bogiTotal = 0;
let multiTotal = 0;
const photoUsed = new Map();

for (const f of FILES) {
  const pool = await loadPool(f);
  const S = SPEC[f];
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${f}.ts 소스(주석 포함) em대시`);
  for (const w of BAN) if (src.includes(w)) fail(`${f}.ts 소스 금지어 "${w}"`);
  for (const r of BAN_RE) if (r.test(src)) fail(`${f}.ts 소스 금지어 패턴 ${r}`);

  const want = S.end - S.start + 1;
  if (pool.length !== want) fail(`${f} 문항 수 ${pool.length} ≠ ${want}`);
  const m = pool.filter((i) => i.type === "mcq").length;
  const M = pool.filter((i) => i.type === "multi").length;
  const n = pool.filter((i) => i.type === "num").length;
  const w2 = pool.filter((i) => i.type === "word").length;
  if (w2 !== 0) fail(`${f} word ${w2}(v2 word 0)`);
  if (m !== S.m || M !== S.M || n !== S.n) fail(`${f} 유형 ${m}/${M}/${n} ≠ ${S.m}/${S.M}/${S.n}`);
  const d = [1, 2, 3].map((k) => pool.filter((i) => i.diff === k).length);
  if (d.join() !== S.d.join()) fail(`${f} diff ${d.join("/")} ≠ ${S.d.join("/")}`);
  const fig = pool.filter((i) => i.figure).length;
  if (fig !== S.fig) fail(`${f} 시각 ${fig} ≠ ${S.fig}`);
  const bogi = pool.filter((i) => i.bogi).length;
  if (bogi !== S.bogi) fail(`${f} bogi ${bogi} ≠ ${S.bogi}`);
  total += pool.length;
  figTotal += fig;
  bogiTotal += bogi;
  multiTotal += M;

  const nums = [];
  for (const it of pool) {
    const slot = Number(it.id.replace("g2u4e", ""));
    if (!/^g2u4e\d{3}$/.test(it.id) || slot < S.start || slot > S.end) fail(`${it.id} 슬롯 대역 위반`);
    if (it.lessonId !== f) fail(`${it.id} lessonId ${it.lessonId} ≠ ${f}`);
    if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그`);
    if ((it.type === "mcq" || it.type === "multi") && it.options?.length !== 5) fail(`${it.id} 보기 ${it.options?.length}개`);
    if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개`);
    if (it.type === "mcq") {
      if (typeof it.answer !== "number") fail(`${it.id} answer 형식`);
      if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false 첫 보기 정답`);
      if (it.bogi && it.shuffle !== false) fail(`${it.id} bogi인데 셔플 고정 아님`);
    }
    if (it.type === "multi") {
      if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer`);
      // 순수 라벨 보기(전부 ㉮~/㉠~/(가)~ 꼴)는 shuffle:false 허용 — 관례 순서 유지가 우선
      // (CLAUDE.md 라벨형 고정 규칙 · blueprint §7-5 F12 · 이때 첫 라벨은 비정답이어야 한다).
      const allLabel = (it.options ?? []).every((o) => /^[㉮㉯㉰㉱㉲㉠㉡㉢㉣㉤]$|^\((가|나|다|라|마)\)$/.test(String(o).trim()));
      if (it.shuffle === false && !allLabel) fail(`${it.id} multi shuffle:false 비관행(라벨 보기 아님)`);
      if (it.shuffle === false && allLabel && Array.isArray(it.answer) && it.answer.includes(0)) fail(`${it.id} 라벨 multi shuffle:false 첫 라벨 정답`);
    }
    if (it.type === "num") {
      if (!/^-?\d+$/.test(String(it.answer))) fail(`${it.id} num answer "${it.answer}"`);
      if (!it.unitLabel) fail(`${it.id} num unitLabel 없음`);
      if (!it.figure) fail(`${it.id} num 자료 동반 위반`);
      nums.push(String(it.answer));
    }
    const exp = plain(it.explain);
    if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
    if (exp.length > 460) console.warn(`WARN ${it.id} 해설 ${exp.length}자`);
    if (/첫 번째 보기|두 번째 보기|세 번째 보기|네 번째 보기|다섯 번째 보기|마지막 보기/.test(exp)) fail(`${it.id} 해설 보기 위치 지칭`);
    if (!it.core) fail(`${it.id} core 없음`);
    const exposed = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ");
    const allTxt = exposed + exp + plain(it.core);
    if (allTxt.includes("—")) fail(`${it.id} em대시`);
    if (allTxt.includes("⭕")) fail(`${it.id} ⭕ 마커(✓로)`);
    for (const w of BAN) if (allTxt.includes(w)) fail(`${it.id} 금지어 "${w}"`);
    for (const r of BAN_RE) if (r.test(allTxt)) fail(`${it.id} 금지어 패턴 ${r}`);
    if (/[A-Z][a-z]?[0-9]/.test(exposed)) fail(`${it.id} 노출면 ASCII 첨자 의심`);
    if (it.type === "num" && it.figure) {
      const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
      if (new RegExp(`(?<![\\d.])${it.answer}(?![\\d.])`).test(aria)) fail(`${it.id} aria 정답 수치`);
    }
    if (it.figure && /^<(img|div)/.test(String(it.figure))) {
      for (const mm of String(it.figure).matchAll(/exam\/g2u4\/([\w-]+\.webp)/g)) {
        photoUsed.set(mm[1], (photoUsed.get(mm[1]) ?? 0) + 1);
        if (!existsSync(`public/exam/g2u4/${mm[1]}`)) fail(`${it.id} 사진 없음 ${mm[1]}`);
      }
      const alts = [...String(it.figure).matchAll(/alt="([^"]*)"/g)].map((x) => x[1]).join(" ");
      if (it.type === "mcq" && typeof it.answer === "number") {
        const ansText = plain(it.options?.[it.answer] ?? "");
        if (ansText.length >= 2 && ansText.length <= 12 && alts.includes(ansText)) fail(`${it.id} alt 정답 유출`);
      }
    }
  }
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${f} num 정답 파일 내 중복 ${dup.join(",")}`);
  console.log(`${f}: ${pool.length} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}`);
}

if (total !== 160) fail(`전체 ${total} ≠ 160`);
if (figTotal !== 95) fail(`시각 ${figTotal} ≠ 95`);
if (bogiTotal < 22) fail(`bogi ${bogiTotal} < 22`);
if (bogiTotal + multiTotal < 36) fail(`합답 총량 ${bogiTotal + multiTotal} < 36`);
for (const [file, cnt] of photoUsed) if (cnt > 2) fail(`사진 ${file} ${cnt}문항(장당 ≤2)`);
console.log(`전체: ${total} · 시각 ${figTotal} · bogi ${bogiTotal} · multi ${multiTotal} · 사진 ${photoUsed.size}종`);
if (fails) { console.error(`\n${fails} FAIL`); process.exit(1); }
console.log("check v2 ALL PASS");
