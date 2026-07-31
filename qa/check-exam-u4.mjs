// u4(물질의 상태 변화) 단원 종합 평가 기계 검사 v2 — 재출제 160제(u4e201~e360) 규격.
// v1(100제)에는 전용 검사기가 없었다 · 정본 쿼터/금지어 = qa/u4-v2-blueprint.md §0·§4(+§8-3 재배분).
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-u4.mjs
import { build } from "esbuild";
import { readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const LESSON = {
  u4l1: { start: 201, end: 227, m: 24, M: 3, d: [11, 11, 5], fig: 14 },
  u4l2: { start: 228, end: 254, m: 24, M: 3, d: [11, 11, 5], fig: 17 },
  u4l3: { start: 255, end: 280, m: 23, M: 3, d: [10, 10, 6], fig: 15 },
  u4l4: { start: 281, end: 307, m: 24, M: 3, d: [11, 11, 5], fig: 15 },
  u4l5: { start: 308, end: 334, m: 24, M: 3, d: [11, 11, 5], fig: 15 },
  u4l6: { start: 335, end: 360, m: 23, M: 3, d: [10, 10, 6], fig: 16 },
};
// 언어 가드(설계표 §0) · 도입어(입자·확산·증발·끓음·융해·응고·기화·액화·승화·열에너지·수증기)는 제외.
const BAN = ["분자", "녹는점", "끓는점", "어는점", "용질", "용매", "응결", "밀도", "기화열", "융해열", "숨은열", "잠열", "열평형", "플라스마", "⭕"];
// '용해'는 "조용해"·"이용해"·"사용해"·"활용해"·"적용해" 부분열 오탐이 있어 lookbehind로 별도 검사.
const BAN_RE = [[/(?<![조이사활적])용해/, "용해"]];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_U4L${lid.replace("u4l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("u4e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^u4e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역 위반`);
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0)`);
  if (it.type === "num") fail(`${it.id} num 금지(v2 num 0 — 실측 계산 0 · "문두 수치 = 정답" 전면 소거)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    // 짧은 라벨 조합/짝 보기((가)~·㉠~·ㄱ~ 나열, 평균 16자 이하)인데 shuffle:false가 없으면 렌더
    // 셔플로 관례 순서가 깨진다 — 검산 A가 적발한 기계 검사 사각지대(e229)의 봉합. 완비 서술형
    // ("㉣ 구간의 용기 속에는…"·완비 짝 "(가) 액체, (나) 기체, (다) 고체")은 규격 예외라 셔플 허용.
    const opts = (it.options ?? []).map(plain);
    const labelStart = opts.length > 0 && opts.every((o) => /^[(（]?[가나다라마바㉠㉡㉢㉣㉤ㄱㄴㄷ①②③④⑤]/.test(o));
    const avgLen = opts.length ? opts.reduce((s, o) => s + o.length, 0) / opts.length : 0;
    if (labelStart && avgLen <= 16 && it.shuffle !== false) fail(`${it.id} 라벨형(짧은 조합/짝) 보기인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 형식/개수(2~3)`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<img") && f.includes("loading=")) fail(`${it.id} 발주 이미지 lazy 금지`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  const all = surface + " " + exp + " " + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const [re, name] of BAN_RE) if (re.test(all)) fail(`${it.id} 금지어 "${name}"`);
  // 그림 aria/alt에 짧은 정답 텍스트가 그대로 들어가는 유출의 최소 기계 검사.
  if (it.type === "mcq" && it.figure) {
    const meta = ((String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "") + ((String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "");
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length >= 2 && ansText.length <= 12 && meta.includes(ansText)) fail(`${it.id} 그림 aria/alt에 정답 "${ansText}" 노출`);
  }
}

// 소스(주석 포함) em대시·금지어 0 — 레슨 파일 전체 스캔.
for (const lid of Object.keys(LESSON)) {
  const src = readFileSync(`src/content/exams/${lid}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
  for (const [re, name] of BAN_RE) if (re.test(src)) fail(`${lid}.ts 소스에 금지어 "${name}"`);
}

// 파일(레슨) 단위 쿼터.
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
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} ≠ ${L.m}/${L.M}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  const slots = arr.map((i) => Number(i.id.replace("u4e", ""))).sort((a, b) => a - b);
  for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}`);
}

const fig = items.filter((i) => i.figure).length;
if (fig !== 92) fail(`전체 시각 ${fig} ≠ 92`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (bogi < 18) fail(`bogi 합답형 ${bogi} < 18`);
if (bogi + multi < 36) fail(`합답 총량(bogi+multi) ${bogi + multi} < 36`);

// 문두 정확 중복: 무그림끼리면 FAIL · 그림(자료 상자 포함) 문항끼리면 WARN(m2u5 v2 관례 —
// 교과서 반복 문형 "그림은 ~ 모형이에요" 수용 · 자료가 문항을 가른다).
const promptMap = new Map();
for (const it of items) {
  const p = plain(it.prompt);
  if (promptMap.has(p)) {
    const prev = promptMap.get(p);
    if (prev.figure && it.figure) warn(`문두 정확 중복(그림 문항): ${prev.id} ↔ ${it.id}`);
    else fail(`문두 정확 중복: ${prev.id} ↔ ${it.id}`);
  } else promptMap.set(p, { id: it.id, figure: !!it.figure });
}
const ansMap = new Map();
for (const it of items) {
  if (it.type !== "mcq") continue;
  const a = plain(it.options?.[it.answer] ?? "");
  if (a.length < 10) continue;
  if (ansMap.has(a)) warn(`mcq 정답 문구 일치 후보: ${ansMap.get(a)} ↔ ${it.id} "${a.slice(0, 30)}"`);
  else ansMap.set(a, it.id);
}

console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi}`);
if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`ALL PASS (${warns} WARN)`);
