// g2u6(동물과 에너지) 단원 종합 평가 기계 검사 — 신규 출제 160제(g2u6e201~e360).
// 정본 쿼터·금지어 = qa/g2u6-v2-blueprint.md §0·§1·§4·§5-3. 이식된 레슨 파일을 검사한다.
// esbuild 실로드(백틱 해설 자연 처리) · CRLF 정규화(검사기 무증상 사망 방지 — m1u6 계보).
// node qa/check-exam-g2u6.mjs
import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";

async function loadPool(path, name) {
  const result = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

// §4 파일별 쿼터(정본). num·word는 전 파일 0.
const LESSON = {
  g2u6l1: { start: 201, end: 226, m: 24, M: 2, bogi: 4, d: [10, 10, 6], fig: 18 },
  g2u6l2: { start: 227, end: 253, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 21 },
  g2u6l3: { start: 254, end: 280, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 21 },
  g2u6l4: { start: 281, end: 307, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 20 },
  g2u6l5: { start: 308, end: 333, m: 24, M: 2, bogi: 4, d: [10, 10, 6], fig: 19 },
  g2u6l6: { start: 334, end: 360, m: 24, M: 3, bogi: 5, d: [11, 11, 5], fig: 17 },
};

// §1-2 언어 가드. 도입어(아밀레이스·펩신·트립신·라이페이스·쓸개즙·바이타민·토리·허파꽈리 등)는 제외.
const BAN = [
  "ATP", "해당 과정", "TCA", "전자 전달계", "헨레 고리", "사구체 여과율", "능동 수송", "삼투",
  "항체", "면역", "호르몬", "자율 신경", "교감", "부교감", "계면활성", "유화", "항상성",
  "마이토콘드리아", "미토콘드리아", "펩티드", "요산", "혈압", "심박출량",
  "아밀라아제", "리파아제", "모노글리세리드", "글리세롤", "폐포", "기관지", "사구체", "신장",
  "담즙", "비타민", "소장", "대장", "체순환", "림프관", "흉강",
  "CO2", "CO₂", "H2O", "H₂O", "C6H12O6", "O2", "O₂", "⭕",
];
// 도입어 '노폐물'이 부분열로 걸리므로 lookbehind 필수(파일럿 저작 중 자가 적발).
const LUNG = /(?<!노)폐(?!동맥|정맥)/;
const POSREF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];

// §5-3 무그림 화이트리스트(44 슬롯 · 전 슬롯 사유 태그 의무).
// W1 정의·구실 직문 · W2 짧은 대응 판별 · W3 오개념 교정 · W4 나열 판별.
// 실배정은 §8에 기록(계획 14/12/12/6 → 실측 10/19/11/4 · 판별 편중 가드 W1+W3+W4 ≤ 40 충족).
const NOFIG = {
  205: "W1", 209: "W4", 214: "W2", 215: "W3", 216: "W2", 219: "W2", 222: "W3", 223: "W2",
  230: "W1", 235: "W2", 242: "W2", 243: "W3", 244: "W4", 247: "W3",
  255: "W1", 258: "W1", 267: "W2", 273: "W3", 275: "W2", 279: "W1",
  284: "W2", 289: "W1", 294: "W3", 295: "W4", 301: "W1", 306: "W3", 307: "W1",
  308: "W1", 323: "W2", 324: "W3", 325: "W1", 327: "W2", 330: "W2", 333: "W3",
  337: "W2", 342: "W2", 343: "W2", 345: "W4", 350: "W3", 353: "W2", 355: "W3", 356: "W2",
  359: "W1", 360: "W3",
};
const WCAP = { W1: 14, W2: 24, W3: 12, W4: 6 };

// §9-5 해설 정식 용어 — 해설은 기호에 이름을 붙여 주는 유일한 자리다.
// 돌려 말하고 끝난 해설을 잡기 위해, 해설에 이 단원의 정식 용어가 실제로 등장하는지 본다.
const TERMS = [
  "영양소", "탄수화물", "단백질", "지방", "바이타민", "무기염류", "아이오딘", "청람색", "베네딕트",
  "황적색", "뷰렛", "보라색", "수단", "선홍색", "녹말", "엿당", "포도당", "아미노산", "지방산",
  "모노글리세라이드", "열량", "대조군",
  "소화", "소화관", "소화샘", "소화액", "소화효소", "아밀레이스", "펩신", "트립신", "라이페이스",
  "염산", "쓸개즙", "쓸개", "간", "이자", "침샘", "위액", "융털", "모세혈관", "암죽관", "작은창자",
  "큰창자", "식도", "위", "항문", "흡수",
  "심장", "심방", "심실", "좌심방", "좌심실", "우심방", "우심실", "판막", "동맥", "정맥", "대동맥",
  "대정맥", "폐동맥", "폐정맥", "혈장", "적혈구", "백혈구", "혈소판", "헤모글로빈", "혈액응고",
  "병원체", "심장박동", "맥박", "허파순환", "온몸순환", "조직세포", "혈관",
  "코", "숨관", "숨관가지", "허파", "허파꽈리", "가슴우리", "갈비뼈", "가로막", "대기압", "확산",
  "들숨", "날숨", "섬모", "연골", "점액", "산소", "이산화 탄소",
  "배설", "콩팥", "콩팥겉질", "콩팥속질", "콩팥깔때기", "콩팥단위", "토리", "보먼주머니", "세뇨관",
  "오줌관", "방광", "요도", "여과", "재흡수", "분비", "암모니아", "요소", "물질대사", "배출", "혈구",
  "세포호흡", "기관계", "소화계", "순환계", "호흡계", "배설계", "에너지",
];
// 기호 판독 문항(§0-5) 판정용 기호.
const SYM = /[㉠-㉣㉮-㉰]|\([가-마]\)|(?:^|[^A-Za-z])[A-E](?:$|[^A-Za-z])/;

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
const LABEL_RE = /\([가-힣]\)|[㉠-㉣㉮-㉰]|[ㄱㄴㄷ]|[A-E]/g;
/** 순수 라벨(조합·짝 포함) 보기인가 — 내용어가 하나도 남지 않으면 표시 순서를 고정해야 한다. */
const isPureLabel = (s) => plain(s).replace(LABEL_RE, "").replace(/[과와및,·\s]/g, "").replace(/^만$|만$/, "") === "";

let fails = 0;
let warns = 0;
const fail = (m) => { fails += 1; console.error("FAIL", m); };
const warn = (m) => { warns += 1; console.warn("WARN", m); };

const items = [];
for (const lid of Object.keys(LESSON)) {
  const pool = await loadPool(`src/content/exams/${lid}.ts`, `POOL_G2U6L${lid.replace("g2u6l", "")}`);
  items.push(...pool);
}
if (items.length !== 160) fail(`전체 ${items.length} ≠ 160`);

// ── 문항 단위 ──
const ids = new Set();
const promptSeen = new Map();
let symRead = 0;
const wCount = { W1: 0, W2: 0, W3: 0, W4: 0 };
for (const it of items) {
  if (ids.has(it.id)) fail(`${it.id} id 중복`);
  ids.add(it.id);
  const L = LESSON[it.lessonId];
  if (!L) { fail(`${it.id} lessonId ${it.lessonId}`); continue; }
  const slot = Number(it.id.replace("g2u6e", ""));
  if (!/^g2u6e\d{3}$/.test(it.id) || slot < L.start || slot > L.end) fail(`${it.id} 슬롯 대역(${L.start}~${L.end}) 위반`);

  // 유형: 실측 계산 0/40 · 개수 세기 0/40 · 용어 빈칸 1/40(선다형 환원)
  if (it.type === "num" || it.type === "word") fail(`${it.id} ${it.type} 금지(v2 num 0 · word 0)`);
  if (!it.diff || ![1, 2, 3].includes(it.diff)) fail(`${it.id} diff 태그 없음/범위 밖`);
  if (!it.options || it.options.length !== 5) fail(`${it.id} 보기 ${it.options?.length}개(5지 고정)`);
  if (it.bogi && it.bogi.length !== 3) fail(`${it.id} bogi ${it.bogi.length}개(ㄱㄴㄷ 3개 고정)`);
  if (it.type === "mcq") {
    if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4) fail(`${it.id} answer 범위`);
    if (it.shuffle === false && it.answer === 0) fail(`${it.id} shuffle:false && 첫 보기 정답`);
    if (it.bogi && it.shuffle !== false) fail(`${it.id} 합답형인데 shuffle 고정 없음`);
  }
  if (it.type === "multi") {
    if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${it.id} multi 정답 개수`);
  }
  // 짧은 라벨 조합·짝은 표시 순서를 고정해야 한다(u4 v2 계보 · 완비 서술형은 내용어 잔여로 예외)
  const pure = (it.options ?? []).filter(isPureLabel).length;
  if (pure >= 4 && it.shuffle !== false) fail(`${it.id} 순수 라벨 보기 ${pure}/5인데 shuffle 고정 없음`);
  // 라벨 multi shuffle:false 예외(g2u4 v2 신설) — 첫 라벨이 정답이면 안 된다
  if (it.type === "multi" && it.shuffle === false) {
    if (pure < 4) fail(`${it.id} multi shuffle:false는 순수 라벨 보기에만 허용`);
    if (it.answer.includes(0)) fail(`${it.id} 라벨 multi shuffle:false인데 첫 라벨이 정답`);
  }

  // 그림·라스터
  if (it.figure) {
    const f = String(it.figure);
    if (!f.startsWith("<svg") && !f.startsWith("<img") && !f.startsWith("<div")) fail(`${it.id} figure 형식`);
    if (f.startsWith("<svg") && f.length < 200) fail(`${it.id} figure 빈약`);
    for (const m of f.matchAll(/src="[^"]*?((?:exam\/g2u6|body\/figs(?:\/v2)?)\/[^"]+)"/g)) {
      if (!existsSync(`public/${m[1]}`)) fail(`${it.id} 라스터 없음: public/${m[1]}`);
    }
    // aria·alt 정답 유출(하한 2자 · 순수 라벨 정답 제외 · 문두 동일 문자열 제외 ·
    // 자료가 인쇄한 라벨이 보기 둘 이상에 등장하면 정답을 콕 집은 것이 아니므로 제외)
    const alt = (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? (f.match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ans = plain(it.options[it.answer]);
      const optsInAlt = it.options.filter((o) => plain(o) && alt.includes(plain(o))).length;
      if (!isPureLabel(ans) && optsInAlt < 2 && ans.length >= 2 && ans.length <= 14 && alt.includes(ans) && !plain(it.prompt).includes(ans)) {
        fail(`${it.id} 그림 aria/alt에 정답 "${ans}" 유출`);
      }
    }
  } else {
    const w = NOFIG[slot];
    if (!w) fail(`${it.id} 무그림인데 §5-3 사유 태그 없음`);
    else wCount[w] += 1;
  }
  if (it.figure && NOFIG[slot]) fail(`${it.id} 그림이 있는데 무그림 사유 태그가 붙어 있음`);

  // §0-5 기호 판독 집계
  const face = plain(it.prompt) + " " + (it.options ?? []).map(plain).join(" ") + " " + (it.bogi ?? []).map(plain).join(" ");
  if (it.figure && SYM.test(face)) symRead += 1;

  // 해설·표기
  const exp = plain(it.explain);
  if (exp.length < 250) fail(`${it.id} 해설 ${exp.length}자 < 250`);
  if (exp.length > 460) fail(`${it.id} 해설 ${exp.length}자 > 450`);
  if (!it.core) fail(`${it.id} core 없음`);
  if (!/xh'>정답 풀이/.test(String(it.explain))) fail(`${it.id} 해설 '정답 풀이' 소제목 없음`);
  if (!/xh'>오답/.test(String(it.explain))) fail(`${it.id} 해설 '오답' 소제목 없음`);
  for (const w of POSREF) if (exp.includes(w)) fail(`${it.id} 해설이 보기 위치 "${w}" 지칭`);
  // §9-5 해설 정식 용어: 기호로 지목했으면 이름을 밝혀야 한다(돌려 말하고 끝내면 결함)
  // 한 글자 용어(위·간·코·물…)는 "위로"·"간다" 같은 보통 낱말에 부분열로 걸려 오탐을 만든다
  // (검산 B가 e286·e287·e348에서 적발) → 두 글자 이상만 센다.
  const named = TERMS.filter((t) => t.length >= 2 && exp.includes(t)).length;
  const needs = it.figure && SYM.test(face) ? 2 : 1;
  if (named < needs) fail(`${it.id} 해설에 정식 용어 ${named}개(필요 ${needs}) — 돌려 말하고 끝났는지 확인`);

  const all = plain(it.prompt) + (it.options ?? []).map(plain).join(" ") + (it.bogi ?? []).map(plain).join(" ") + exp + plain(it.core);
  if (all.includes("—")) fail(`${it.id} em대시 검출`);
  for (const w of BAN) if (all.includes(w)) fail(`${it.id} 금지어 "${w}"`);
  if (LUNG.test(all)) fail(`${it.id} 금지어 "폐"(기관 이름은 허파 · 혈관만 폐동맥·폐정맥)`);
  if (it.type === "mcq" && !it.bogi) {
    const ans = plain(it.options[it.answer]);
    for (const w of ["전혀", "결코", "무조건"]) if (ans.includes(w)) fail(`${it.id} 정답 보기에 절대어 "${w}"`);
  }
  const key = plain(it.prompt);
  if (promptSeen.has(key)) {
    const prev = promptSeen.get(key);
    if (it.figure && prev.figure) warn(`${it.id} 문두가 ${prev.id}과 동일(그림 문항 · 수용 가능)`);
    else fail(`${it.id} 문두가 ${prev.id}과 완전 동일`);
  } else promptSeen.set(key, it);
}

// ── 소스(주석 포함) 금지어·em대시·CRLF ──
for (const lid of Object.keys(LESSON)) {
  const raw = readFileSync(`src/content/exams/${lid}.ts`, "utf8");
  if (raw.includes("\r\n")) fail(`${lid}.ts CRLF 검출`);
  const src = raw.replace(/\r\n/g, "\n");
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
  const bogi = arr.filter((i) => i.bogi).length;
  const d = [1, 2, 3].map((k) => arr.filter((i) => i.diff === k).length);
  const fig = arr.filter((i) => i.figure).length;
  if (m !== L.m || M !== L.M) fail(`${lid} 유형 ${m}/${M} ≠ ${L.m}/${L.M}`);
  if (bogi !== L.bogi) fail(`${lid} bogi ${bogi} ≠ ${L.bogi}`);
  if (d[0] !== L.d[0] || d[1] !== L.d[1] || d[2] !== L.d[2]) fail(`${lid} diff ${d.join("/")} ≠ ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid} 시각 ${fig} ≠ ${L.fig}`);
  for (let s = L.start; s <= L.end; s++) if (!arr.some((i) => Number(i.id.replace("g2u6e", "")) === s)) fail(`${lid} 슬롯 ${s} 누락`);
  console.log(`${lid}: ${arr.length} · m${m}/M${M} · bogi ${bogi} · diff ${d.join("/")} · 시각 ${fig}`);
}

// ── 전역 ──
const fig = items.filter((i) => i.figure).length;
const bogi = items.filter((i) => i.bogi).length;
const multi = items.filter((i) => i.type === "multi").length;
if (fig !== 116) fail(`전체 시각 ${fig} ≠ 116`);
if (bogi !== 28) fail(`bogi 합답형 ${bogi} ≠ 28`);
if (bogi + multi < 44) fail(`합답 총량 ${bogi + multi} < 44`);
const m2 = items.filter((i) => i.type === "multi" && i.answer.length === 2).length;
if (m2 !== 8 || multi - m2 !== 8) fail(`multi 정답 개수 분포 ${m2}/${multi - m2} ≠ 8/8`);

// bogi 조합·ㄱ 진위 분포(셔플이 위치는 가려도 개수는 못 가린다 — u1 v2 ④⑤)
const combo = new Map();
let gTrue = 0;
for (const it of items.filter((i) => i.bogi)) {
  const c = plain(it.options[it.answer]).replace(/\s/g, "");
  combo.set(c, (combo.get(c) ?? 0) + 1);
  if (c.includes("ㄱ")) gTrue += 1;
}
console.log(`bogi 조합: ${[...combo.entries()].map(([k, v]) => `${k} ${v}`).join(" · ")}`);
console.log(`bogi ㄱ 진위: 참 ${gTrue} · 거짓 ${bogi - gTrue}`);
if (gTrue === bogi || gTrue === 0) fail(`bogi ㄱ 진위가 한쪽으로 전부 쏠림(${gTrue}/${bogi})`);
const posCount = [0, 0, 0, 0, 0];
for (const it of items.filter((i) => i.bogi)) posCount[it.answer] += 1;
console.log(`bogi 정답 위치: ${posCount.map((n, i) => `${i + 1}번 ${n}`).join(" · ")}`);
if (posCount[0] > 0) fail(`bogi 정답이 첫 칸에 ${posCount[0]}건(순서 고정이라 금지)`);
for (let i = 0; i < 5; i++) if (posCount[i] > bogi * 0.45) fail(`bogi 정답이 ${i + 1}번 칸에 ${posCount[i]}건(전체 ${bogi}의 45% 초과 — 읽지 않고 맞히는 자리)`);
for (const [c, n] of combo) if (n > bogi * 0.45) fail(`bogi 조합 "${c}" ${n}개(전체 ${bogi}의 45% 초과)`);

// §5-3 무그림 사유 코드
const noFigTotal = Object.values(wCount).reduce((a, b) => a + b, 0);
if (noFigTotal !== 44) fail(`무그림 ${noFigTotal} ≠ 44`);
for (const [w, cap] of Object.entries(WCAP)) if (wCount[w] > cap) fail(`무그림 사유 ${w} ${wCount[w]}개 > 상한 ${cap}`);
const judge = wCount.W1 + wCount.W3 + wCount.W4;
if (judge > 40) fail(`무자료 진술 판별 ${judge}개 > 40(25%)`);
console.log(`무그림 44: W1 ${wCount.W1} · W2 ${wCount.W2} · W3 ${wCount.W3} · W4 ${wCount.W4} · 판별 합산 ${judge}(상한 40)`);

// §0-5 기호 판독 하한
if (symRead < 56) fail(`기호 판독 ${symRead}개 < 56(35%)`);
console.log(`기호 판독 ${symRead}개(${Math.round((symRead / 160) * 1000) / 10}%)`);

// 라스터 장당 ≤2문항
const use = new Map();
for (const it of items) {
  for (const m of String(it.figure ?? "").matchAll(/src="[^"]*?((?:exam\/g2u6|body\/figs(?:\/v2)?)\/[^"]+)"/g)) {
    use.set(m[1], (use.get(m[1]) ?? 0) + 1);
  }
}
for (const [src, n] of use) if (n > 2) fail(`라스터 ${src} ${n}문항(상한 2)`);
console.log(`전체: ${items.length} · 시각 ${fig}(${Math.round((fig / 160) * 1000) / 10}%) · bogi ${bogi} · multi ${multi} · 라스터 ${use.size}종/${[...use.values()].reduce((a, b) => a + b, 0)}문항`);

if (fails) { console.error(`\n${fails} FAIL · ${warns} WARN`); process.exit(1); }
console.log(`\nALL PASS (${warns} WARN)`);
