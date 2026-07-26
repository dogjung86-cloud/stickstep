// g2u2 시험 풀 기계 검사 v2 — 커밋 전 스캔(2026-07 재출제 1호 규격, 구 v1 검사 전면 교체).
//   ① 배분 160 = 18×7+17×2(17은 L4·L5) ② 유형 mcq 140/multi 20/num 0/word 0(파일별 정확값)
//   ③ diff 파일별 정확값(합 64/64/32) ④ 시각자료 파일별 정확값(합 111) ⑤ shuffle:false && answer 0
//   ⑥ 해설 250~450자(태그 제거)·xh 소제목 ⑦ 금지어(미도입 용어 — 소스 주석 포함) ⑧ id 연번·중복
//   ⑨ figure aria/alt 정답 이름 후보 WARN ⑩ mcq 정답 문구 교차 유출 후보 WARN
// esbuild 실로드(백틱 해설 자연 처리) + CRLF 정규화. node qa/check-exam-g2u2.mjs
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const FILES = ["g2u2l1", "g2u2l2", "g2u2l3", "g2u2l4", "g2u2l5", "g2u2l6", "g2u2l7", "g2u2l8", "g2u2l9"];
const LESSON = {
  g2u2l1: { start: 201, end: 218, m: 15, M: 3, d: [7, 7, 4], vis: 8 },
  g2u2l2: { start: 219, end: 236, m: 16, M: 2, d: [7, 7, 4], vis: 11 },
  g2u2l3: { start: 237, end: 254, m: 16, M: 2, d: [7, 7, 4], vis: 16 },
  g2u2l4: { start: 255, end: 271, m: 15, M: 2, d: [7, 8, 2], vis: 12 },
  g2u2l5: { start: 272, end: 288, m: 15, M: 2, d: [8, 7, 2], vis: 10 },
  g2u2l6: { start: 289, end: 306, m: 16, M: 2, d: [7, 7, 4], vis: 15 },
  g2u2l7: { start: 307, end: 324, m: 16, M: 2, d: [7, 7, 4], vis: 12 },
  g2u2l8: { start: 325, end: 342, m: 16, M: 2, d: [7, 7, 4], vis: 11 },
  g2u2l9: { start: 343, end: 360, m: 15, M: 3, d: [7, 7, 4], vis: 16 },
};
const BAN = ["습곡", "단층", "해령", "해구", "진앙", "진원", "P파", "S파", "맨틀 대류", "수렴형", "발산형", "보존형", "감람석", "편암", "석순", "종유석", "조산 운동"];
const NAMES = ["석영", "장석", "흑운모", "각섬석", "방해석", "자철석", "화강암", "현무암", "유문암", "반려암", "역암", "사암", "이암", "석회암", "규암", "대리암", "편마암"];

async function loadPool(lid) {
  const result = await build({ entryPoints: [`src/content/exams/${lid}.ts`], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  const mod = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);
  return mod[`POOL_${lid.toUpperCase()}`];
}

const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
let bad = 0;
const say = (m) => { console.log("FAIL", m); bad += 1; };
const warn = (m) => console.log("WARN", m);

const all = [];
for (const lid of FILES) {
  const pool = await loadPool(lid);
  const want = LESSON[lid];
  const per = { m: 0, M: 0, d: [0, 0, 0], vis: 0 };
  for (const it of pool) {
    all.push(it);
    if (it.lessonId !== lid) say(`${it.id} lessonId ${it.lessonId} ≠ ${lid}`);
    const slot = Number(it.id.replace("g2u2e", ""));
    if (!/^g2u2e\d{3}$/.test(it.id) || slot < want.start || slot > want.end) say(`${it.id} 슬롯 대역 위반`);
    if (it.type === "num" || it.type === "word") say(`${it.id} ${it.type} 금지(v2 규격)`);
    if (it.type === "mcq") per.m += 1;
    if (it.type === "multi") per.M += 1;
    if (!it.diff || ![1, 2, 3].includes(it.diff)) say(`${it.id} diff 누락/범위`);
    else per.d[it.diff - 1] += 1;
    if (it.figure) per.vis += 1;
    if ((it.type === "mcq" || it.type === "multi") && it.options?.length !== 5) say(`${it.id} 보기 ${it.options?.length}개(5지)`);
    if (it.type === "mcq") {
      if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 4) say(`${it.id} answer 범위`);
      if (it.shuffle === false && it.answer === 0) say(`${it.id} shuffle:false && 첫 보기 정답`);
    }
    if (it.type === "multi" && (!Array.isArray(it.answer) || it.answer.length < 2 || it.answer.length > 3)) say(`${it.id} multi answer 형식`);
    const exp = plain(it.explain);
    if (exp.length < 250 || exp.length > 450) say(`${it.id} 해설 ${exp.length}자`);
    if (!/<span class='xh'>/.test(it.explain)) say(`${it.id} xh 소제목 없음`);
    const faces = [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core, it.figure ?? ""].join(" ");
    for (const b of BAN) if (faces.includes(b)) say(`${it.id} 금지어 "${b}"`);
    if (it.figure) {
      const aria = [...String(it.figure).matchAll(/(?:aria-label|alt)="([^"]*)"/g)].map((m) => m[1]).join(" ");
      for (const nm of NAMES) if (aria.includes(nm)) warn(`${it.id} figure aria/alt 이름 "${nm}" — 유출 수동 확인`);
    }
  }
  if (pool.length !== want.end - want.start + 1) say(`${lid} ${pool.length}문항`);
  if (per.m !== want.m || per.M !== want.M) say(`${lid} 유형 m${per.m}/M${per.M} ≠ m${want.m}/M${want.M}`);
  if (per.d.join() !== want.d.join()) say(`${lid} diff ${per.d.join("/")} ≠ ${want.d.join("/")}`);
  if (per.vis !== want.vis) say(`${lid} 시각 ${per.vis} ≠ ${want.vis}`);
  console.log(`${lid}: ${pool.length}문항 · m${per.m}/M${per.M} · d${per.d.join("/")} · 시각 ${per.vis}`);
}

// id 중복·소스 금지어(주석 포함, CRLF 정규화)
const ids = all.map((i) => i.id);
if (new Set(ids).size !== ids.length) say("id 중복");
for (const lid of FILES) {
  const src = readFileSync(`src/content/exams/${lid}.ts`, "utf8").replace(/\r\n/g, "\n");
  for (const b of BAN) if (src.includes(b)) say(`${lid}.ts 소스(주석 포함) 금지어 "${b}"`);
}

// 교차 유출 후보(mcq 정답 문구 10자+ ↔ 타 문항 노출면)
const ans = all.filter((i) => i.type === "mcq").map((i) => ({ id: i.id, t: plain(i.options?.[i.answer] ?? "") })).filter((a) => a.t.length >= 10);
for (const a of ans) {
  for (const other of all) {
    if (other.id === a.id) continue;
    if (plain([other.prompt, ...(other.bogi ?? [])].join(" ")).includes(a.t)) warn(`교차 유출 후보: ${other.id} ← ${a.id} 정답 문구`);
  }
}

console.log(bad ? `\nFAIL ${bad}건` : `\nALL PASS (${all.length}문항)`);
process.exit(bad ? 1 : 0);
