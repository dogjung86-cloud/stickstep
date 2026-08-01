// g2u8(별과 우주) 단원 종합 평가 기계 검사 v2 — 재출제 160제(g2u8e201~e360) 규격.
// 구 150제 정규식판 전면 교체(2026-08) · 정본 쿼터/금지어 = qa/g2u8-v2-blueprint.md §0·§4.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// u1·u4 check의 신설 검사 이식: 해설 보기 위치 지칭 6표현 · 짧은 라벨형 shuffle:false 누락 ·
// 사진 실재+장당 사용 상한 · num 정답 aria 숫자 경계 대조.
// node qa/check-exam-g2u8.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

const LESSON = {
  g2u8l1: { start: 201, end: 221, m: 17, M: 2, n: 2, d: [8, 9, 4], fig: 13 },
  g2u8l2: { start: 222, end: 239, m: 12, M: 2, n: 4, d: [7, 7, 4], fig: 7 },
  g2u8l3: { start: 240, end: 260, m: 17, M: 2, n: 2, d: [9, 8, 4], fig: 10 },
  g2u8l4: { start: 261, end: 279, m: 17, M: 2, n: 0, d: [8, 7, 4], fig: 12 },
  g2u8l5: { start: 280, end: 299, m: 18, M: 2, n: 0, d: [8, 8, 4], fig: 10 },
  g2u8l6: { start: 300, end: 321, m: 20, M: 2, n: 0, d: [9, 9, 4], fig: 15 },
  g2u8l7: { start: 322, end: 341, m: 18, M: 2, n: 0, d: [8, 8, 4], fig: 9 },
  g2u8l8: { start: 342, end: 360, m: 17, M: 2, n: 0, d: [7, 8, 4], fig: 9 },
};
// 언어 가드(설계표 §0 정본) · 도입어(시차·연주 시차·pc·광년·겉보기/절대 등급·색·표면 온도·우리은하·
// 은하수·나선팔·막대·헤일로·산개/구상 성단·방출/반사/암흑 성운·외부 은하·우주 팽창·대폭발·인공위성·
// 탐사선·우주 망원경·우주 정거장·우주 쓰레기)는 제외. '블랙홀'은 오답 보기 단독 허용이라 제외(v1 관행).
const BAN = ["세페이드", "광도", "H-R", "적색 편이", "적색편이", "도플러", "스펙트럼", "허블 법칙", "우주 배경", "타원 은하", "불규칙 은하", "성간 물질", "팽대부", "벌지", "변광성", "초신성", "⭕"];
const POS_REF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_G2U8L${lid.replace("g2u8l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} != 160`);

const ids = new Set();
const photoUse = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u8e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u8e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역 위반`);
  if (it.type === "word") fail(`${it.id} word 금지(v2 word 0 · 실측 용어 빈칸 0/36)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    // 짧은 라벨 조합/짝 보기(평균 16자 이하)인데 shuffle:false가 없으면 관례 순서가 깨진다(u4 계보).
    const opts = (it.options ?? []).map(plain);
    const labelStart = opts.length > 0 && opts.every((o) => /^[(（]?[가나다라마바㉮㉯㉰㉠㉡㉢㉣㉤ㄱㄴㄷ①②③④⑤ABCDEF]/.test(o));
    const avgLen = opts.length ? opts.reduce((s, o) => s + o.length, 0) / opts.length : 0;
    if (labelStart && avgLen <= 16 && it.shuffle !== false) fail(`${it.id} 라벨형(짧은 조합/짝) 보기인데 shuffle:false 누락`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 형식/개수(2~3)`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.type === "num") {
    const a = String(it.answer);
    if (it.numKind === "dec") {
      if (!/^\d+\.\d+$/.test(a)) fail(`${it.id} dec answer "${a}"`);
    } else if (!/^-?\d+$/.test(a)) fail(`${it.id} int answer "${a}"`);
    if (!it.unitLabel) fail(`${it.id} num unitLabel 없음`);
  }
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.includes("loading=")) fail(`${it.id} 발주 이미지 lazy 금지`);
    // 사진 실재 + 장당 사용 상한(같은 사진 최대 2문항 · 설계표 §0)
    for (const m of f.matchAll(/src="\/([^"]+)"/g)) {
      const rel = m[1];
      if (!existsSync(`public/${rel}`)) fail(`${it.id} 사진 없음: public/${rel}`);
      photoUse.set(rel, (photoUse.get(rel) ?? 0) + 1);
    }
    for (const m of f.matchAll(/href="\/([^"]+)"/g)) {
      const rel = m[1];
      if (!existsSync(`public/${rel}`)) fail(`${it.id} svg image 없음: public/${rel}`);
    }
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  for (const p of POS_REF) if (String(it.explain ?? "").includes(p)) fail(`${it.id} 해설 보기 위치 지칭 "${p}"(셔플과 어긋남)`);
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  const all = surface + " " + exp + " " + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  // num 정답 수치의 그림 aria/alt 노출(숫자 경계 — u5 관행: 한 자리 답의 부분열 오탐 차단)
  if (it.type === "num" && it.figure) {
    const meta = ((String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "") + " " + ((String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "");
    const re = new RegExp(`(?<![\\d.])${String(it.answer).replace(".", "\\.")}(?![\\d.])`);
    if (re.test(meta)) fail(`${it.id} 그림 aria/alt에 num 정답 ${it.answer} 노출`);
  }
  // mcq 짧은 정답 텍스트의 aria/alt 유출(u4 계보 · 하한 2자)
  if (it.type === "mcq" && it.figure) {
    const meta = ((String(it.figure).match(/aria-label="([^"]*)"/) ?? [])[1] ?? "") + ((String(it.figure).match(/alt="([^"]*)"/) ?? [])[1] ?? "");
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length >= 2 && ansText.length <= 12 && meta.includes(ansText)) fail(`${it.id} 그림 aria/alt에 정답 "${ansText}" 노출`);
  }
}

// 같은 사진 사용 상한(경로 기준 · xpair 쌍은 두 파일이 각각 집계된다)
for (const [rel, cnt] of photoUse) if (cnt > 2) fail(`사진 ${rel} 사용 ${cnt}문항 > 2(장당 상한)`);

// 소스(주석 포함) em대시·금지어·위치 지칭 0 — 생성 레슨 파일 전체 스캔(CRLF 정규화).
for (const lid of Object.keys(LESSON)) {
  const src = readFileSync(`src/content/exams/${lid}.ts`, "utf8").replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
  for (const p of POS_REF) if (src.includes(p)) fail(`${lid}.ts 소스에 보기 위치 지칭 "${p}"`);
}

// 파일(레슨) 단위 쿼터(§4 정확값) · num 정답 파일 내 유일.
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
const numAnswers = new Map();
for (const [lid, arr] of byLesson) {
  const L = LESSON[lid];
  const want = L.end - L.start + 1;
  if (arr.length !== want) fail(`${lid} ${arr.length}문항 != ${want}`);
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const n = arr.filter((i) => i.type === "num").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const bogi = arr.filter((i) => i.bogi).length;
  if (m !== L.m || M !== L.M || n !== L.n) fail(`${lid} 유형 ${m}/${M}/${n} != ${L.m}/${L.M}/${L.n}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} != ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} != ${L.fig}`);
  const slots = arr.map((i) => Number(i.id.replace("g2u8e", ""))).sort((a, b) => a - b);
  for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  const nums = arr.filter((i) => i.type === "num").map((i) => String(i.answer));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) fail(`${lid} num 정답 파일 내 중복: ${dup.join(",")}`);
  for (const i of arr.filter((x) => x.type === "num")) {
    if (numAnswers.has(String(i.answer))) warn(`num 정답 파일 간 중복 후보: ${numAnswers.get(String(i.answer))} ↔ ${i.id} (${i.answer})`);
    else numAnswers.set(String(i.answer), i.id);
  }
  console.log(`${lid}: ${arr.length} · m${m}/M${M}/n${n} · diff ${d.join("/")} · 시각 ${fig} · bogi ${bogi}`);
}

const fig = items.filter((i) => i.figure).length;
if (fig !== 85) fail(`전체 시각 ${fig} != 85`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
const num = items.filter((i) => i.type === "num").length;
if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22`);
if (multi !== 16) fail(`multi ${multi} != 16`);
if (num !== 8) fail(`num ${num} != 8`);

// 문두 정확 중복: 무그림끼리면 FAIL · 그림 문항끼리면 WARN(교과서 반복 문형 수용 · m2u5 관례).
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
