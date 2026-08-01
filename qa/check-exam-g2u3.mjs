// g2u3(빛과 파동) 단원 종합 평가 기계 검사 v2 — 재출제 160제(g2u3e201~e360) 규격.
// 구 150제(v1) 검사기는 폐기 · 정본 쿼터/금지어/§8 조정 = qa/g2u3-v2-blueprint.md.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-g2u3.mjs
import { build } from "esbuild";
import { readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const LESSON = {
  g2u3l1: { start: 201, end: 218, m: 13, M: 2, n: 3, d: [7, 7, 4], fig: 12 },
  g2u3l2: { start: 219, end: 237, m: 17, M: 2, n: 0, d: [8, 7, 4], fig: 11 },
  g2u3l3: { start: 238, end: 254, m: 15, M: 2, n: 0, d: [7, 7, 3], fig: 5 },
  g2u3l4: { start: 255, end: 272, m: 13, M: 2, n: 3, d: [7, 7, 4], fig: 9 },
  g2u3l5: { start: 273, end: 295, m: 21, M: 2, n: 0, d: [9, 9, 5], fig: 11 },
  g2u3l6: { start: 296, end: 318, m: 21, M: 2, n: 0, d: [9, 9, 5], fig: 8 },
  g2u3l7: { start: 319, end: 339, m: 15, M: 2, n: 4, d: [8, 9, 4], fig: 10 },
  g2u3l8: { start: 340, end: 360, m: 17, M: 2, n: 2, d: [9, 9, 3], fig: 10 },
};
// 언어 가드(설계표 §1). '매질'은 파동 단원 정식 어휘라 허용 · '실상'은 "사실상" 오탐 방지 lookbehind.
const BAN = ["초점", "허상", "분산", "스펙트럼", "전반사", "임계각", "굴절률", "파면", "회절", "간섭", "도플러", "데시벨", "옥타브", "공명", "⭕"];
const BAN_RE = [[/(?<![사현진])실상/, "실상"]];
// 셔플 문항 해설의 보기 위치 지칭 금지(u1 check 계보).
const POS_RE = /(첫 번째 보기|두 번째 보기|세 번째 보기|네 번째 보기|다섯 번째 보기|마지막 보기)/;
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_G2U3L${lid.replace("g2u3l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

const ids = new Set();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u3e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u3e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역 위반`);
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0 — 실측 word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    // 짧은 라벨 조합/짝 보기((가)~·㉠~·ㄱ~ 나열, 평균 16자 이하)인데 shuffle:false가 없으면 렌더
    // 셔플로 관례 순서가 깨진다 — u4 v2 신설 검사 계승. 완비 서술형은 규격 예외라 셔플 허용.
    const opts = (it.options ?? []).map(plain);
    const labelStart = opts.length > 0 && opts.every((o) => /^[(（]?[가나다라마바㉠㉡㉢㉣㉤ㄱㄴㄷ①②③④⑤]/.test(o));
    const avgLen = opts.length ? opts.reduce((s, o) => s + o.length, 0) / opts.length : 0;
    if (labelStart && avgLen <= 16 && it.shuffle !== false) fail(`${it.id} 라벨형(짧은 조합/짝) 보기인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 형식/개수(2~3)`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.type === "num") {
    if (typeof it.answer !== "string") fail(`${it.id} num answer가 문자열이 아님`);
    if (!it.unitLabel) fail(`${it.id} num에 unitLabel 없음`);
    if (!it.figure) fail(`${it.id} num인데 그림 없음(v2 num 전량 그림 판독 동반)`);
  }
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.includes("loading=")) fail(`${it.id} 발주 이미지 lazy 금지`);
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (it.shuffle !== false && POS_RE.test(exp)) fail(`${it.id} 셔플 문항 해설이 보기 위치를 지칭`);
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  const all = surface + " " + exp + " " + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  for (const [re, name] of BAN_RE) if (re.test(all)) fail(`${it.id} 금지어 "${name}"`);
  // 그림 aria에 num 정답 수치 노출 금지 — 예외: 같은 수치가 문두에도 있으면 조건 값 서술(동등 접근).
  if (it.type === "num" && it.figure) {
    const aria = (String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "";
    if (aria.includes(String(it.answer)) && !plain(it.prompt).includes(String(it.answer))) fail(`${it.id} 그림 aria에 정답 수치 노출`);
  }
  // 사진 alt·그림 aria에 짧은 정답 텍스트 유출 검사.
  if (it.type === "mcq" && it.figure) {
    const meta = [...String(it.figure).matchAll(/(?:aria-label|alt)="([^"]*)"/g)].map((m) => m[1]).join(" ");
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
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} ≠ ${L.m}/${L.M}/${L.n}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  const slots = arr.map((i) => Number(i.id.replace("g2u3e", ""))).sort((a, b) => a - b);
  for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}`);
}

const fig = items.filter((i) => i.figure).length;
if (fig !== 76) fail(`전체 시각 ${fig} ≠ 76`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
const num = items.filter((i) => i.type === "num").length;
if (bogi !== 25) fail(`bogi 합답형 ${bogi} ≠ 25`);
if (multi !== 16) fail(`multi ${multi} ≠ 16`);
if (num !== 12) fail(`num ${num} ≠ 12`);

// 문두 정확 중복: 무그림끼리면 FAIL · 그림 문항끼리면 WARN(자료가 문항을 가른다 — m2u5 v2 관례).
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

console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi} · num ${num}`);
if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`ALL PASS (${warns} WARN)`);
