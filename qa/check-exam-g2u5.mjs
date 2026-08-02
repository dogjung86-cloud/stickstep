// g2u5(식물과 에너지) 단원 종합 평가 기계 검사 · 신규 출제 160제(g2u5e201~e360) 규격.
// 정본 쿼터/금지어 = qa/g2u5-v2-blueprint.md §0·§4. esbuild 실로드(백틱 해설 자연 처리) ·
// CRLF 정규화(검사기 무증상 사망 방지 · m1u6 계보).
// u1·u4·u5·g2u8 check의 신설 검사 이식: 해설 보기 위치 지칭 · 짧은 라벨형 shuffle:false 누락 ·
// 사진 실재 + 장당 사용 상한 · aria/alt 정답 유출 · 문두 정확 중복.
// ⚠ 사진 상한은 `src=`(발주·재사용 사진)만 센다. `public/exam/g2u5fig`의 도해 베이스는 SVG
//    <image href=>로 들어오는 밑그림이라 성격이 다르다(§12-5) · 실재 검사만 하고 상한에서 제외한다.
// node qa/check-exam-g2u5.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

// §4 파일별 정확값(mcq/multi/diff/시각/무자료/bogi).
const LESSON = {
  g2u5l1: { start: 201, end: 227, m: 24, M: 3, d: [11, 11, 5], fig: 19, nofig: 8, bogi: 4 },
  g2u5l2: { start: 228, end: 254, m: 24, M: 3, d: [11, 11, 5], fig: 21, nofig: 6, bogi: 4 },
  g2u5l3: { start: 255, end: 281, m: 24, M: 3, d: [11, 11, 5], fig: 21, nofig: 6, bogi: 4 },
  g2u5l4: { start: 282, end: 307, m: 24, M: 2, d: [10, 10, 6], fig: 15, nofig: 11, bogi: 4 },
  g2u5l5: { start: 308, end: 334, m: 24, M: 3, d: [11, 11, 5], fig: 20, nofig: 7, bogi: 4 },
  g2u5l6: { start: 335, end: 360, m: 24, M: 2, d: [10, 10, 6], fig: 16, nofig: 10, bogi: 4 },
};
// 언어 가드(설계표 §0 정본) · 레슨 도입어(광합성·엽록체·엽록소·기공·물관·체관·포도당·산소·
// 이산화 탄소·녹말·설탕·아이오딘 용액·청람색·에탄올·물중탕·암처리·광합성량·제한 요인·호흡·
// 마이토콘드리아·생명활동·무기 양분·질소 성분·광합성산물·순변화·확산·기체 교환·덩이줄기·공변세포)는 제외.
const BAN = [
  "명반응", "암반응", "캘빈", "틸라코이드", "스트로마", "엽록소 a", "엽록소 b", "ATP", "NADPH",
  "광포화점", "광보상점", "보상점", "보상 상태", "증산", "삼투", "유관속", "형성층", "책상 조직",
  "해면 조직", "표피 세포", "수크로스", "셀룰로스", "효소", "촉매", "이화 작용", "동화 작용",
  "유기물", "탄수화물", "총광합성량", "겉보기광합성량", "분자", "⭕",
];
// 보기 위치 지칭 · 표시 순서가 셔플되므로 어떤 형태든 어긋난다(u1 v2 §14 ⑦ · 저작 습관이라 재발한다).
const POS_REF = [
  "첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기",
  "마지막 설명", "첫 번째 설명", "마지막 선택", "위의 보기", "아래의 보기",
];
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_G2U5L${lid.replace("g2u5l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} != 160`);

const ids = new Set();
const photoUse = new Map();
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const slot = Number(it.id.replace("g2u5e", ""));
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  if (!/^g2u5e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);
  // 실측 계산 0/38 · 개수 세기 0/38 · 정의 빈칸 0 → num·word는 즉시 실격(§0).
  if (it.type === "num" || it.type === "word") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (it.type === "mcq" || it.type === "multi") {
    if (!it.options || it.options.length !== 5) fail(`${it.id} ${it.type} 보기 ${it.options?.length}개(5지 고정)`);
  }
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer >= (it.options?.length ?? 0)) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    const opts = (it.options ?? []).map(plain);
    // ① 순수 라벨형(기호와 구분 기호만 남기고 지웠을 때 빈 문자열) · §10-6에서 확정한 정의.
    const bare = (s) => s.replace(/\([가-힣]\)/g, "").replace(/[㉠-㉭①-⑩ㄱ-ㅎ,·\s]/g, "");
    const pureLabel = opts.length > 0 && opts.every((o) => bare(o) === "");
    // ② 짧은 라벨 조합/짝(u4 v2 계보) · 전 보기가 라벨로 시작하고 평균 16자 이하.
    const labelStart = opts.length > 0 && opts.every((o) => /^[(（]?[가나다라마바㉮㉯㉰㉠㉡㉢㉣㉤ㄱㄴㄷ①②③④⑤ABCDEF]/.test(o));
    const avgLen = opts.length ? opts.reduce((s, o) => s + o.length, 0) / opts.length : 0;
    if ((pureLabel || (labelStart && avgLen <= 16)) && it.shuffle !== false) {
      fail(`${it.id} 라벨형 보기인데 shuffle:false 누락(관례 순서가 깨진다)`);
    }
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi answer 형식/개수(2~3)`);
    if (it.shuffle === false) fail(`${it.id} multi shuffle:false 비관행`);
  }
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    if (f.includes("loading=")) fail(`${it.id} 발주 이미지 lazy 금지(사고 #14)`);
    for (const m of f.matchAll(/src="\/?((?:exam|plant|photos)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 사진 없음: public/${m[1]}`);
      photoUse.set(m[1], (photoUse.get(m[1]) ?? 0) + 1);
    }
    // 도해 베이스 라스터(SVG <image href=>)는 실재만 검사하고 장당 상한에서는 제외한다(§12-5).
    for (const m of f.matchAll(/href="\/?((?:exam|plant|photos)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 도해 베이스 없음: public/${m[1]}`);
    }
  }
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) warn(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) fail(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답 하나씩 격파/.test(String(it.explain))) fail(`${it.id} 해설 '오답 하나씩 격파' 소제목 없음`);
  if (!it.core) fail(`${it.id} core 없음`);
  for (const p of POS_REF) if (String(it.explain ?? "").includes(p)) fail(`${it.id} 해설 보기 위치 지칭 "${p}"(셔플과 어긋남)`);
  const surface = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  const all = surface + " " + exp + " " + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  // mcq 짧은 정답 텍스트의 aria/alt 유출(u4 계보 · 하한 3자 · 1~2자 정답의 부분열 오탐 차단)
  if (it.type === "mcq" && it.figure) {
    const f = String(it.figure);
    const meta = ((f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? "") + " " + ((f.match(/alt="([^"]*)"/) ?? [])[1] ?? "");
    const ansText = plain(it.options?.[it.answer] ?? "");
    if (ansText.length >= 3 && ansText.length <= 12 && meta.includes(ansText)) fail(`${it.id} 그림 aria/alt에 정답 "${ansText}" 노출`);
  }
}

// 같은 사진 사용 상한(설계표 §0 · 장당 최대 2문항 + 질문 축까지 배타는 눈검수 몫)
for (const [rel, cnt] of photoUse) if (cnt > 2) fail(`사진 ${rel} 사용 ${cnt}문항 > 2(장당 상한)`);

// 소스(주석 포함) em대시·금지어·위치 지칭 0 · 생성 레슨 파일 전체 스캔(CRLF 정규화).
for (const lid of Object.keys(LESSON)) {
  const raw = readFileSync(`src/content/exams/${lid}.ts`, "utf8");
  if (raw.includes("\r\n")) fail(`${lid}.ts CRLF 검출`);
  const src = raw.replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts 소스(주석 포함)에 em대시 존재`);
  for (const w of BAN.filter((b) => b !== "⭕")) if (src.includes(w)) fail(`${lid}.ts 소스에 금지어 "${w}"`);
  for (const p of POS_REF) if (src.includes(p)) fail(`${lid}.ts 소스에 보기 위치 지칭 "${p}"`);
}

// 파일(레슨) 단위 쿼터(§4 정확값)
const byLesson = new Map();
for (const it of items) {
  if (!byLesson.has(it.lessonId)) byLesson.set(it.lessonId, []);
  byLesson.get(it.lessonId).push(it);
}
for (const [lid, arr] of byLesson) {
  const L = LESSON[lid];
  const want = L.end - L.start + 1;
  if (arr.length !== want) fail(`${lid} ${arr.length}문항 != ${want}`);
  const m = arr.filter((i) => i.type === "mcq").length;
  const M = arr.filter((i) => i.type === "multi").length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  const nofig = arr.length - fig;
  const bogi = arr.filter((i) => i.bogi).length;
  if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} != ${L.m}/${L.M}`);
  if (d.join() !== L.d.join()) fail(`${lid} diff ${d.join("/")} != ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} != ${L.fig}`);
  if (nofig !== L.nofig) fail(`${lid} 무자료 ${nofig} != ${L.nofig}`);
  if (bogi !== L.bogi) fail(`${lid} bogi ${bogi} != ${L.bogi}`);
  const slots = arr.map((i) => Number(i.id.replace("g2u5e", "")));
  for (let s = L.start; s <= L.end; s++) if (!slots.includes(s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · diff ${d.join("/")} · 시각 ${fig} · 무자료 ${nofig} · bogi ${bogi}`);
}

// 전역 쿼터
const fig = items.filter((i) => i.figure).length;
if (fig !== 112) fail(`전체 시각 ${fig} != 112`);
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
const mcq = items.filter((i) => i.type === "mcq").length;
if (mcq !== 144) fail(`mcq ${mcq} != 144`);
if (multi !== 16) fail(`multi ${multi} != 16`);
if (bogi < 22) fail(`bogi 합답형 ${bogi} < 22(설계 24)`);
if (bogi + multi < 36) fail(`합답 총량(bogi+multi) ${bogi + multi} < 36(설계 40)`);

// 문두 정확 중복: 무그림끼리면 FAIL · 그림 문항끼리면 WARN(반복 문형 수용 · m2u5 관례).
const promptMap = new Map();
for (const it of items) {
  const p = plain(it.prompt);
  if (promptMap.has(p)) {
    const prev = promptMap.get(p);
    if (prev.figure && it.figure) warn(`문두 정확 중복(그림 문항): ${prev.id} ↔ ${it.id}`);
    else fail(`문두 정확 중복: ${prev.id} ↔ ${it.id}`);
  } else promptMap.set(p, { id: it.id, figure: !!it.figure });
}
// mcq 정답 문구가 통째로 같으면 쌍둥이 후보(교차 유출 스캔의 기계 보조).
const ansMap = new Map();
for (const it of items) {
  if (it.type !== "mcq") continue;
  const a = plain(it.options?.[it.answer] ?? "");
  if (a.length < 10) continue;
  if (ansMap.has(a)) warn(`mcq 정답 문구 일치 후보: ${ansMap.get(a)} ↔ ${it.id} "${a.slice(0, 30)}"`);
  else ansMap.set(a, it.id);
}

console.log(`전체: ${items.length} · mcq ${mcq}/multi ${multi} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · 합답 ${bogi + multi} · 사진 ${photoUse.size}종`);
if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`ALL PASS (${warns} WARN)`);
