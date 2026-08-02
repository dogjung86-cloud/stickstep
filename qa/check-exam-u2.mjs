// u2(생물의 구성과 다양성) 단원 종합 평가 기계 검사 — v2 전면 교체(구 120제 6파일 검사기 폐기).
// 대상 = 이식된 레슨 파일 src/content/exams/u2l1~u2l10.ts (160제 · u2e201~e360).
// ⚠ 확대 120 저작 전(파일럿 40만 이식된 상태)에는 쿼터 검사가 당연히 FAIL한다 — 160 완주 후 통과가 정상.
//    저작 중간 게이트는 `node qa/render-u2v2-full.mjs`(부분 검증 모드)를 쓴다.
// 정본 쿼터·금지어 = qa/u2-v2-blueprint.md §0·§4. esbuild 실로드(백틱 해설 자연 처리) ·
// CRLF 정규화(검사기 무증상 사망 방지 · m1u6 계보).
// node qa/check-exam-u2.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

// §4 파일별 쿼터(정본). num·word는 전 파일 0.
const LESSON = {
  u2l1: { start: 201, end: 216, m: 15, M: 1, d: [7, 6, 3], fig: 8, bogi: 2 },
  u2l2: { start: 217, end: 232, m: 14, M: 2, d: [7, 6, 3], fig: 12, bogi: 2 },
  u2l3: { start: 233, end: 248, m: 15, M: 1, d: [7, 6, 3], fig: 11, bogi: 2 },
  u2l4: { start: 249, end: 264, m: 14, M: 2, d: [6, 7, 3], fig: 12, bogi: 2 },
  u2l5: { start: 265, end: 280, m: 14, M: 2, d: [6, 7, 3], fig: 11, bogi: 2 },
  u2l6: { start: 281, end: 296, m: 14, M: 2, d: [7, 6, 3], fig: 9, bogi: 3 },
  u2l7: { start: 297, end: 312, m: 14, M: 2, d: [6, 6, 4], fig: 9, bogi: 3 },
  u2l8: { start: 313, end: 328, m: 14, M: 2, d: [6, 7, 3], fig: 9, bogi: 3 },
  u2l9: { start: 329, end: 344, m: 13, M: 3, d: [6, 6, 4], fig: 10, bogi: 3 },
  u2l10: { start: 345, end: 360, m: 13, M: 3, d: [6, 7, 3], fig: 9, bogi: 2 },
};
// §0-3 언어 가드(미도입 어휘). 도입어(세포벽·핵막·엽록체·변이·적응·원핵생물계·조직계 등)는 제외.
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
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const path = `src/content/exams/${lid}.ts`;
  if (!existsSync(path)) { fail(`${path} 없음`); continue; }
  items.push(...(await loadPool(path, `POOL_U2L${lid.replace("u2l", "")}`)));
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

const ids = new Set();
const promptSeen = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  const slot = Number(it.id.replace("u2e", ""));
  if (!/^u2e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);

  if (it.type === "num" || it.type === "word") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id} bogi 합답형인데 shuffle:false 누락`);
    const opts = (it.options ?? []).map(plain);
    const avg = opts.reduce((s, o) => s + o.length, 0) / Math.max(1, opts.length);
    const labelish = opts.every((o) => /^[㉠㉡㉢㉣㉤①②③④⑤가나다라마A-E()\s,·]+$/.test(o) || /^[㉠㉡㉢㉣㉤]\s/.test(o) || /^\([가-마]\)\s/.test(o));
    if (labelish && avg <= 16 && it.shuffle !== false) fail(`${it.id} 짧은 라벨형 보기인데 shuffle:false 누락(평균 ${avg.toFixed(1)}자)`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 개수`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }

  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    if (/NaN|undefined|Infinity/.test(f)) fail(`${it.id} figure에 NaN·undefined 좌표`);
    if (/loading=["']lazy["']/.test(f)) fail(`${it.id} loading=lazy 사용(사고 #14)`);
    for (const m of f.matchAll(/src="[^"]*?((?:exam\/u2|bio3)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 사진 파일 없음: public/${m[1]}`);
    }
    const alt = (f.match(/alt="([^"]*)"/) ?? [])[1] ?? (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ansText = plain(it.options?.[it.answer] ?? "");
      if (ansText.length >= 3 && ansText.length <= 12 && alt.includes(ansText)) fail(`${it.id} 그림 alt·aria에 정답 "${ansText}" 유출`);
    }
  }

  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) warn(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답/.test(String(it.explain))) warn(`${it.id} 해설 '오답' 소제목 없음`);
  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const w of POSREF) if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  if (it.type === "mcq" && !it.bogi) {
    const ans = plain(it.options?.[it.answer] ?? "");
    for (const w of ["전혀", "결코", "무조건"]) if (ans.includes(w)) fail(`${it.id} 정답 보기에 절대어 "${w}"`);
  }
  const key = plain(it.prompt);
  if (promptSeen.has(key)) {
    const prev = promptSeen.get(key);
    if (it.figure && prev.figure) warn(`${it.id} 문두가 ${prev.id}과 동일(그림 문항 · 수용 가능)`);
    else fail(`${it.id} 문두가 ${prev.id}과 완전 동일`);
  } else promptSeen.set(key, it);
}

for (const lid of Object.keys(LESSON)) {
  const path = `src/content/exams/${lid}.ts`;
  if (!existsSync(path)) continue;
  const raw = readFileSync(path, "utf8");
  if (/\r\n/.test(raw)) fail(`${lid}.ts CRLF 줄바꿈`);
  const src = raw.replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
}

const lessonSrc = readFileSync("src/content/unit2.ts", "utf8").replace(/\r\n/g, "\n");
const norm = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const lessonPrompts = new Set([...lessonSrc.matchAll(/prompt:\s*"([^"]+)"/g)].map((m) => norm(m[1])));
for (const it of items) if (it.prompt && lessonPrompts.has(norm(it.prompt))) fail(`${it.id} 레슨 퀴즈 문두 직복사`);

for (const [lid, L] of Object.entries(LESSON)) {
  const arr = items.filter((i) => i.lessonId === lid);
  const want = L.end - L.start + 1;
  if (arr.length !== want) { fail(`${lid} ${arr.length}문항 ≠ ${want}`); continue; }
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} ≠ ${L.m}/${L.M}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  if (bogi !== L.bogi) fail(`${lid} bogi ${bogi} ≠ ${L.bogi}`);
  for (let s = L.start; s <= L.end; s++) if (!arr.some((i) => Number(i.id.replace("u2e", "")) === s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}`);
}

const fig = items.filter((i) => i.figure).length;
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (fig !== 100) fail(`전체 시각 ${fig} ≠ 100`);
if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22`);
if (bogi + multi < 36) fail(`합답 총량 ${bogi + multi} < 36`);
const two = items.filter((i) => i.type === "multi" && i.answer.length === 2).length;
if (Math.abs(two - (multi - two)) > 4) fail(`multi 정답 개수 편중 2개 ${two} · 3개 ${multi - two}`);
const photoUse = new Map();
for (const it of items) {
  for (const m of String(it.figure ?? "").matchAll(/src="[^"]*?((?:exam\/u2|bio3)\/[^"]+)"/g)) {
    photoUse.set(m[1], (photoUse.get(m[1]) ?? 0) + 1);
  }
}
for (const [src, n] of photoUse) if (n > 2) fail(`사진 ${src} ${n}문항(상한 2)`);
// 장당 상한 2는 **경로가 아니라 실물(해시) 기준**으로 센다 — bio3/micro/{cheek,elodea}.webp와
// exam/u2/{cheek-cells,elodea-cells}.webp는 md5가 같은 같은 이미지다(u2 v2 검산 A 적발).
const byHash = new Map();
for (const [src, n] of photoUse) {
  const p = `public/${src}`;
  if (!existsSync(p)) continue;
  const h = createHash("md5").update(readFileSync(p)).digest("hex");
  const cur = byHash.get(h) ?? { n: 0, paths: [] };
  cur.n += n;
  cur.paths.push(`${src}(${n})`);
  byHash.set(h, cur);
}
for (const { n, paths } of byHash.values()) {
  if (n > 2) fail(`같은 이미지가 ${n}문항에 쓰임(상한 2): ${paths.join(" = ")}`);
}
console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}(2개 ${two}/3개 ${multi - two}) · 사진 ${photoUse.size}종/${[...photoUse.values()].reduce((a, b) => a + b, 0)}문항`);

if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`\nALL PASS (${warns} WARN)`);
