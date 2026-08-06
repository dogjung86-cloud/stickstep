// s1u2 v1 기계 검사 — 이식된 레슨 파일(content/exams/s1u2l1~l8) 대상.
// 부분 모드: 풀이 160 미만이면 쿼터·전역 검사를 건너뛰고 문항 단위 검사만 수행.
// 정본 규격 = qa/s1u2-v1-blueprint.md §4(파일별 정확값)·§6(언어 가드)·§1(사진 규칙).
// 실행: node qa/check-exam-s1u2.mjs
import { build } from "esbuild";
import { readFileSync, existsSync } from "node:fs";

async function loadPool(path, name) {
  const r = await build({ entryPoints: [path], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
  return mod[name];
}

let FAILS = 0;
let WARNS = 0;
const fail = (m) => { FAILS++; console.log("FAIL " + m); };
const warn = (m) => { WARNS++; console.log("WARN " + m); };
const plain = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// §4 파일별 정확값(저작 실측 확정 — 시각 60(37.5%), 갱신 근거는 블루프린트 §8-4)
const LESSON = {
  s1u2l1: { start: 1, end: 20, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 9 },
  s1u2l2: { start: 21, end: 40, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 9 },
  s1u2l3: { start: 41, end: 60, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 9 },
  s1u2l4: { start: 61, end: 80, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 6 },
  s1u2l5: { start: 81, end: 100, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 6 },
  s1u2l6: { start: 101, end: 120, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 8 },
  s1u2l7: { start: 121, end: 140, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 6 },
  s1u2l8: { start: 141, end: 160, m: 16, M: 2, w: 2, bogi: 3, d: [8, 8, 4], fig: 6 },
};

// §6 언어 가드(소스 전체 · 주석 포함) — Ⅰ 계승('계절풍' 제외!) + Ⅱ 신규
const BAN = [
  "경도", "시차", "날짜변경선", "본초 자오선", "절대적 위치", "상대적 위치", "장소 마케팅",
  "초국적 기업", "다국적 기업", "세계 무역 기구", "WTO", "열대 우림", "사바나", "스텝 기후",
  "사막 기후", "지중해성", "서안 해양성", "대륙성 기후", "편서풍", "백야", "극야",
  "오로라", "인구 밀도", "문화 상대주의", "자문화 중심주의", "세방화", "글로컬", "공정 여행",
  "플랜테이션", "기후 그래프", "강수량 그래프",
  "카스트", "가공 무역", "합계 출산율", "인구 부양력", "기대 수명", "유대교", "무슬림",
  "이스라엘", "몬순", "라마단", "히잡", "수니파", "시아파", "분쟁", "부양비",
  "인더스", "황허", "중위 연령", "⭕",
];
const POSREF = ["첫 번째 보기", "두 번째 보기", "세 번째 보기", "네 번째 보기", "다섯 번째 보기", "마지막 보기"];
const ABSOLUTE = ["전혀 ", "결코 ", "무조건 "];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
// 사진 화이트리스트(§1 — 기존 자산 재사용만 · buddha 금지) · 장당 1문항
const PHOTO_OK = new Set([
  "samarkand.webp", "temple-sea.webp", "gopuram.webp", "mosque.webp", "cathedral.webp",
  "ganges.webp", "terrace.webp", "himalaya.webp", "dubai.webp", "halal.webp",
]);

const pools = [];
for (const lid of Object.keys(LESSON)) {
  const path = `src/content/exams/${lid}.ts`;
  if (!existsSync(path)) { fail(`${lid}.ts 없음`); continue; }
  const raw = readFileSync(path, "utf8");
  if (/\r\n/.test(raw)) fail(`${lid}.ts CRLF 줄바꿈`);
  const src = raw.replace(/\r\n/g, "\n");
  if (src.includes("—")) fail(`${lid}.ts em대시 잔존`);
  for (const w of BAN) {
    // 연접 오탐 예외: "경도"는 환경도·국경도·배경도의 부분열로 걸린다(s1u1 lookbehind 계보)
    if (w === "경도") {
      if (/(?<![환국배])경도/.test(src)) fail(`${lid}.ts 금지어 "경도"(소스 전체 스캔)`);
      continue;
    }
    if (src.includes(w)) fail(`${lid}.ts 금지어 "${w}"(소스 전체 스캔)`);
  }
  const pool = await loadPool(path, `POOL_S1U2L${lid.slice(-1)}`);
  pools.push({ lid, pool, src });
}

const items = pools.flatMap((p) => p.pool);
const FULL = items.length === 160;
console.log(`총 ${items.length}문항 ${FULL ? "(전수 모드)" : "(부분 모드 — 쿼터·전역 검사 생략)"}`);

// 레슨 원문 유출 스캔용(unit2.ts quiz 문두·보기 직복사)
const lessonSrc = readFileSync("src/content/soc/unit2.ts", "utf8").replace(/\r\n/g, "\n");
const lessonChunks = [...lessonSrc.matchAll(/(?:prompt|label):\s*"([^"]{18,})"/g)].map((m) => m[1]);

const seenIds = new Set();
const seenPrompts = new Map();
const photoUse = new Map();
for (const it of items) {
  const tag = it.id;
  if (seenIds.has(it.id)) fail(`${tag} id 중복`);
  seenIds.add(it.id);
  if (!/^s1u2e\d{3}$/.test(it.id)) fail(`${tag} id 형식`);
  const num = Number(it.id.slice(-3));
  const les = LESSON[it.lessonId];
  if (!les) { fail(`${tag} lessonId ${it.lessonId} 미상`); continue; }
  if (num < les.start || num > les.end) fail(`${tag} 슬롯 대역(${les.start}~${les.end}) 밖`);

  if (it.type === "num") fail(`${tag} num 유형(사회 s1u2는 num 0 규격)`);
  if (!["mcq", "multi", "word", "num"].includes(it.type)) fail(`${tag} 유형 ${it.type}`);
  if (![1, 2, 3].includes(it.diff)) fail(`${tag} diff 태그 없음/이상`);
  if (it.figureDark) fail(`${tag} figureDark(사회 시험 금지)`);

  if (it.type === "mcq" || it.type === "multi") {
    if ((it.options?.length ?? 0) !== 5) fail(`${tag} 보기 ${it.options?.length}개(5지 고정)`);
    if (it.type === "mcq" && typeof it.answer !== "number") fail(`${tag} mcq answer 형식`);
    if (it.type === "multi") {
      if (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3) fail(`${tag} multi 정답 ${it.answer?.length}개(2~3)`);
      if (it.shuffle === false) warn(`${tag} multi shuffle:false(비관행)`);
    }
  }
  if (it.bogi) {
    if (it.type !== "mcq") fail(`${tag} bogi는 mcq 전용`);
    if (it.bogi.length !== 4) fail(`${tag} bogi ${it.bogi.length}개(사회판 ㄱㄴㄷㄹ 4개 고정)`);
    if (it.shuffle !== false) fail(`${tag} bogi인데 shuffle:false 누락`);
  }
  if (it.shuffle === false && it.type === "mcq" && it.answer === 0) fail(`${tag} shuffle:false 첫 보기 정답`);
  // 라벨형(원문자·자모 라벨 지칭 보기) 셔플 고정 누락 검사 — 독립 명사 보기는 셔플 허용이라 제외
  if (it.type === "mcq" && it.shuffle !== false && it.options) {
    const GLYPH = /[㉮㉯㉰㉱㉠㉡㉢㉣㉤①②③④⑤ㄱㄴㄷㄹ]/;
    const labelish = it.options.every((o) => GLYPH.test(plain(o)) && plain(o).length <= 10);
    if (labelish) fail(`${tag} 라벨형인데 shuffle:false 누락`);
  }

  if (it.type === "word") {
    if (!Array.isArray(it.bank) || it.bank.length < 8 || it.bank.length > 10) fail(`${tag} word bank ${it.bank?.length}개(8~10)`);
    if (it.bank && it.bank[0] !== it.answer) fail(`${tag} word bank[0] != answer(저작 규약)`);
    if (it.bank && new Set(it.bank).size !== it.bank.length) fail(`${tag} word bank 중복 칩`);
    if (typeof it.answer !== "string") fail(`${tag} word answer 형식`);
  }

  if (it.figure) {
    const f = it.figure;
    if (!/^\s*<(svg|img|div)/.test(f)) fail(`${tag} figure 형식(<svg|<img|<div 시작 아님)`);
    // 사진 <img>는 원래 짧다(사진 허용 규격의 보정) — svg/div만 200자 하한
    if (f.length < (/^\s*<img/.test(f) ? 100 : 200)) fail(`${tag} figure 길이 미달`);
    if (/NaN|undefined|Infinity/.test(f)) fail(`${tag} figure에 NaN/undefined/Infinity`);
    if (f.includes('loading="lazy"')) fail(`${tag} figure loading=lazy(사고 #14)`);
    // 사진 규칙(§1): 화이트리스트·장당 1문항·buddha 0
    const photos = [...f.matchAll(/soc\/asia\/([a-z0-9-]+\.webp)/g)].map((m) => m[1]);
    for (const ph of photos) {
      if (ph === "buddha.webp") fail(`${tag} buddha.webp 사용(신앙 대상 그림 금지)`);
      else if (!PHOTO_OK.has(ph)) fail(`${tag} 사진 화이트리스트 밖 "${ph}"`);
      if (!existsSync(`public/soc/asia/${ph}`)) fail(`${tag} 사진 실재하지 않음 "${ph}"`);
      photoUse.set(ph, (photoUse.get(ph) ?? []).concat(tag));
    }
    const alt = (f.match(/aria-label="([^"]*)"/) ?? [])[1] ?? (f.match(/alt="([^"]*)"/) ?? [])[1] ?? "";
    if (it.type === "mcq" && alt) {
      const ansText = plain(it.options?.[it.answer] ?? "");
      if (ansText.length >= 3 && ansText.length <= 12 && alt.includes(ansText)) fail(`${tag} 그림 aria/alt에 정답 "${ansText}" 유출`);
    }
    if (it.type === "word" && alt && alt.includes(String(it.answer))) fail(`${tag} 그림 aria/alt에 word 정답 유출`);
  }

  const ex = plain(it.explain);
  if (ex.length < 250) fail(`${tag} 해설 ${ex.length}자(250 미만)`);
  if (ex.length > 460) warn(`${tag} 해설 ${ex.length}자(460 초과)`);
  if (!it.core) fail(`${tag} core 없음`);
  if (!it.explain.includes("xh'>정답 풀이")) warn(`${tag} 해설 '정답 풀이' 소제목 없음`);
  if (!it.explain.includes("xh'>오답")) warn(`${tag} 해설 '오답' 소제목 없음`);
  for (const p of POSREF) if (it.explain.includes(p)) fail(`${tag} 해설 보기 위치 지칭 "${p}"`);

  const rendered = [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), ...(it.bank ?? []), it.explain, it.core].map(plain).join(" ");
  if (EMOJI.test(rendered)) fail(`${tag} 이모지`);
  if (rendered.includes("교과서")) fail(`${tag} '교과서' 노출`);
  if (it.type === "mcq" && typeof it.answer === "number") {
    const ansText = plain(it.options?.[it.answer] ?? "");
    for (const a of ABSOLUTE) if (ansText.includes(a)) warn(`${tag} 정답 보기 절대어 "${a.trim()}"`);
  }

  // 레슨 원문 직복사(18자 이상 문구 일치)
  for (const chunk of lessonChunks) {
    if (rendered.includes(plain(chunk))) fail(`${tag} 레슨 원문 직복사 의심: "${chunk.slice(0, 30)}..."`);
  }

  const pKey = plain(it.prompt);
  if (seenPrompts.has(pKey)) {
    const other = seenPrompts.get(pKey);
    if (it.figure && other.figure) warn(`${tag}↔${other.id} 문두 정확 중복(그림 문항끼리)`);
    else fail(`${tag}↔${other.id} 문두 정확 중복`);
  } else seenPrompts.set(pKey, it);
}

// 사진 장당 1문항(§1 — md5 대신 파일명 기준: asia 자산은 전부 상이 원본)
for (const [ph, users] of photoUse) {
  if (users.length > 1) fail(`사진 "${ph}" ${users.length}문항 사용(장당 1 상한): ${users.join(",")}`);
}

if (FULL) {
  for (const { lid, pool } of pools) {
    const les = LESSON[lid];
    const m = pool.filter((i) => i.type === "mcq").length;
    const M = pool.filter((i) => i.type === "multi").length;
    const w = pool.filter((i) => i.type === "word").length;
    const bogi = pool.filter((i) => i.bogi).length;
    const fig = pool.filter((i) => i.figure).length;
    const d = [1, 2, 3].map((k) => pool.filter((i) => i.diff === k).length);
    if (pool.length !== les.end - les.start + 1) fail(`${lid} ${pool.length}문항`);
    if (m !== les.m) fail(`${lid} mcq ${m}(기대 ${les.m})`);
    if (M !== les.M) fail(`${lid} multi ${M}(기대 ${les.M})`);
    if (w !== les.w) fail(`${lid} word ${w}(기대 ${les.w})`);
    if (bogi !== les.bogi) fail(`${lid} bogi ${bogi}(기대 ${les.bogi})`);
    if (fig !== les.fig) fail(`${lid} 시각 ${fig}(기대 ${les.fig})`);
    if (d[0] !== les.d[0] || d[1] !== les.d[1] || d[2] !== les.d[2]) fail(`${lid} diff ${d.join("/")}(기대 ${les.d.join("/")})`);
    // 판별형 상한(레슨당 5 — 20문항 비례)
    const judge = pool.filter((i) => /옳은 것|옳지 않은 것|알맞지 않은 것|볼 수 없는 것/.test(plain(i.prompt))).length;
    if (judge > 5) fail(`${lid} 판별형 ${judge}(레슨 상한 5)`);
  }
  const M2 = items.filter((i) => i.type === "multi" && i.answer.length === 2).length;
  const M3 = items.filter((i) => i.type === "multi" && i.answer.length === 3).length;
  if (M2 !== 8 || M3 !== 8) fail(`multi 정답 개수 분산 ${M2}/${M3}(기대 8/8)`);
  const judgeAll = items.filter((i) => /옳은 것|옳지 않은 것|알맞지 않은 것|볼 수 없는 것/.test(plain(i.prompt))).length;
  if (judgeAll > 40) fail(`판별형 전역 ${judgeAll}(상한 40)`);
  // bogi 정답 조합·ㄱ 진위 분산(참고 출력)
  const combos = {};
  let firstTrue = 0;
  for (const it of items.filter((i) => i.bogi)) {
    const c = plain(it.options?.[it.answer] ?? "");
    combos[c] = (combos[c] ?? 0) + 1;
    if (c.includes("ㄱ")) firstTrue++;
  }
  console.log("bogi 정답 조합 분포:", JSON.stringify(combos), `· ㄱ 포함 정답 ${firstTrue}/24`);
  for (const [c, n] of Object.entries(combos)) if (n > 5) warn(`bogi 정답 조합 "${c}" ${n}회(몰림)`);
  // word 정답이 타 word bank에 등장 금지
  const wordAns = items.filter((i) => i.type === "word").map((i) => i.answer);
  for (const it of items.filter((i) => i.type === "word")) {
    for (const a of wordAns) {
      if (a !== it.answer && it.bank.includes(a)) fail(`${it.id} bank에 타 word 정답 "${a}"`);
    }
  }
}

// 교차 유출 후보 보조 스캔(6어절 연속 일치 · 수동 판정용 후보 출력)
const norm = (s) => plain(s);
const expose = items.map((it) => ({
  id: it.id,
  text: [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), ...(it.bank ?? [])].map(norm).join(" "),
  ansText: it.type === "mcq" ? norm(it.options?.[it.answer] ?? "") : it.type === "word" ? String(it.answer) : (it.answer ?? []).map?.((k) => norm(it.options?.[k])).join(" ") ?? "",
}));
let leakCand = 0;
for (const a of expose) {
  if (!a.ansText || a.ansText.length < 10) continue;
  const words = a.ansText.split(" ");
  if (words.length < 6) continue;
  for (let k = 0; k + 6 <= words.length; k++) {
    const seg = words.slice(k, k + 6).join(" ");
    for (const b of expose) {
      if (b.id === a.id) continue;
      if (b.text.includes(seg)) {
        console.log(`LEAK? ${a.id} 정답 6어절이 ${b.id} 노출면에: "${seg}"`);
        leakCand++;
        break;
      }
    }
  }
}
console.log(`교차 유출 후보 ${leakCand}건(수동 판정 대상)`);

console.log(`\n검사 종료: FAIL ${FAILS} · WARN ${WARNS}`);
process.exit(FAILS ? 1 : 0);
