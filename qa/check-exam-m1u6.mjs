// m1u6(수학 중1 Ⅵ 통계) 시험 풀 기계 검사 v2 · 2026-07 재출제 규격(정본 qa/m1u6-v2-blueprint.md).
//   ① shuffle:false && answer===0 ② id 유일·연번(m1u6e001~e200 3자리) ③ 유형 m/M/n 파일별 정확값·word 0 FAIL
//   ④ 레슨 배분(34/33/34/35/36/28) ⑤ num 계약(문자열·int는 unitLabel 또는 "의 값을 구하세요" 면제·
//     dec는 "소수로" 문두 또는 unitLabel) ⑥ 해설 길이(태그 제외 250~450자) ⑦ diff 파일별 표(합 80/80/40)
//   ⑧ 시각자료 파일별 정확값(31/31/31/33/33/13 = 172) ⑨ 언어 가드(em대시 전면 금지·Ⅵ 금지어:
//     산포도/분산/표준편차/계급값/경우의 수/확률/범위/누적도수/편차/표본/모집단/수형도)
//   ⑩ 문장형 mcq 상한(지정 8슬롯 14·131·167·179·182·184·191·198 밖 FAIL)
// readFileSync 직후 \r\n 정규화 유지(CRLF 사본에서 0문항 파싱으로 조용히 죽던 실사고의 재발 방지).
// node qa/check-exam-m1u6.mjs
import { readFileSync } from "node:fs";

const QUOTA = {
  m1u6l1: { total: 34, m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l2: { total: 33, m: 16, M: 2, n: 15, d: [13, 13, 7], vis: 31 },
  m1u6l3: { total: 34, m: 17, M: 2, n: 15, d: [14, 13, 7], vis: 31 },
  m1u6l4: { total: 35, m: 18, M: 2, n: 15, d: [14, 14, 7], vis: 33 },
  m1u6l5: { total: 36, m: 17, M: 2, n: 17, d: [15, 14, 7], vis: 33 },
  m1u6l6: { total: 28, m: 19, M: 2, n: 7, d: [10, 13, 5], vis: 13 },
};
const SENTENCE_MCQ = new Set([14, 131, 167, 179, 182, 184, 191, 198]);
const BAN = ["산포도", "표준편차", "계급값", "경우의 수", "누적도수", "표본", "모집단", "수형도"];
const files = Object.keys(QUOTA);
let all = [];
let bad = 0;
const say = (m) => { console.log("FAIL", m); bad++; };

for (const f of files) {
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8").replace(/\r\n/g, "\n");
  const em = [...src.matchAll(/—/g)].length;
  if (em > 0) say(`${f}: em대시(—) ${em}건(주석 포함 전면 금지 · 가운뎃점으로)`);
  for (const w of BAN) if (src.includes(w)) say(`${f}: 금지어 "${w}" 발견`);
  // 어간 겹침 오탐을 피하는 단어들: 분산(동사 '분산되다'와 구분 불요 · 통계 풀에 어느 쪽도 금지),
  // 확률(중2 선행), 범위('~범위'는 통계 용어 미도입이라 서술 자체를 회피), 편차(모든 활용 금지)
  for (const w of ["분산", "확률", "범위", "편차"]) if (src.includes(w)) say(`${f}: 금지어 "${w}" 발견`);

  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const id = b.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const type = b.match(/type: "(\w+)"/)?.[1];
    const shuffle = /shuffle: false/.test(b);
    const ansRaw = b.match(/answer: (\[[^\]]*\]|"[^"]*"|\d+)/)?.[1] ?? "";
    const unitLabel = b.match(/unitLabel: "([^"]+)"/)?.[1];
    const numKind = b.match(/numKind: "(\w+)"/)?.[1];
    const diff = b.match(/diff: (\d)/)?.[1];
    const hasFigure = /figure: /.test(b);
    const prompt = b.match(/prompt:\s*\n?\s*"([\s\S]*?)",\n/)?.[1] ?? "";
    const options = [...(b.match(/options: \[([\s\S]*?)\],\n/)?.[1] ?? "").matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    const explain = b.match(/explain:\s*\n?\s*"([\s\S]*?)",\n    core/)?.[1] ?? "";
    all.push({ file: f, id, slot: Number(id.replace("m1u6e", "")), type, shuffle, ansRaw, unitLabel, numKind, diff, hasFigure, prompt, options, explain });
  }
}

// ① shuffle:false && answer===0
for (const it of all) if (it.shuffle && it.ansRaw === "0") say(`${it.id}: shuffle:false인데 answer=0(첫 보기 정답 금지)`);

// ② id 유일·연번(3자리 제로패딩)
const ids = all.map((a) => a.id);
if (new Set(ids).size !== ids.length) say("id 중복 존재");
for (let i = 0; i < ids.length; i++) {
  const want = `m1u6e${String(i + 1).padStart(3, "0")}`;
  if (ids[i] !== want) { say(`연번 어긋남: ${ids[i]} (기대 ${want})`); break; }
}

// ③·④·⑦·⑧ 파일별 유형·배분·diff·시각자료 정확값
console.log("total:", all.length);
if (all.length !== 200) say(`총 문항 ${all.length} ≠ 200`);
if (all.some((a) => a.type === "word")) say("word 문항 존재(v2 word 0)");
const dTotal = { 1: 0, 2: 0, 3: 0 };
for (const f of files) {
  const q = QUOTA[f];
  const arr = all.filter((a) => a.file === f);
  const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
  const d = { 1: 0, 2: 0, 3: 0 };
  let vis = 0;
  for (const it of arr) {
    cnt[it.type]++;
    if (!it.diff) say(`${it.id}: diff 태그 없음`);
    else { d[it.diff]++; dTotal[it.diff]++; }
    if (it.hasFigure) vis++;
  }
  console.log(`${f}: ${arr.length} · m${cnt.mcq}/M${cnt.multi}/n${cnt.num}/w${cnt.word} · diff ${d[1]}/${d[2]}/${d[3]} · 시각 ${vis}`);
  if (arr.length !== q.total) say(`${f}: ${arr.length}문항 ≠ ${q.total}`);
  if (cnt.mcq !== q.m || cnt.multi !== q.M || cnt.num !== q.n) say(`${f}: 유형 ${cnt.mcq}/${cnt.multi}/${cnt.num} ≠ ${q.m}/${q.M}/${q.n}`);
  if (d[1] !== q.d[0] || d[2] !== q.d[1] || d[3] !== q.d[2]) say(`${f}: diff ${d[1]}/${d[2]}/${d[3]} ≠ ${q.d.join("/")}`);
  if (vis !== q.vis) say(`${f}: 시각자료 ${vis} ≠ ${q.vis}`);
}
if (dTotal[1] !== 80 || dTotal[2] !== 80 || dTotal[3] !== 40) say(`diff 전체 ${dTotal[1]}/${dTotal[2]}/${dTotal[3]} ≠ 80/80/40`);
const visTotal = all.filter((a) => a.hasFigure).length;
if (visTotal !== 172) say(`시각자료 전체 ${visTotal} ≠ 172`);

// ⑤ num 계약
const strip = (s) => s.replace(/<\/?[a-z][^>]*>/gi, "").replace(/\\n/g, "");
for (const it of all.filter((a) => a.type === "num")) {
  if (!it.ansRaw.startsWith('"')) say(`${it.id}: num answer가 문자열이 아님(${it.ansRaw})`);
  const kind = it.numKind ?? "int";
  const v = it.ansRaw.replaceAll('"', "");
  const p = strip(it.prompt);
  if (kind === "int") {
    if (!/^-?\d+$/.test(v)) say(`${it.id}: int 정답 형식 위반(${v})`);
    if (!it.unitLabel && !/의 값을 구하세요/.test(p)) say(`${it.id}: num(int)에 unitLabel 없음(면제 문구도 없음)`);
  }
  if (kind === "dec") {
    if (!/^\d+\.\d+$/.test(v)) say(`${it.id}: dec 정답 형식 위반(${v})`);
    if (!it.unitLabel && !/소수로/.test(p)) say(`${it.id}: num(dec)에 "소수로" 문두 없음(무단위 관행 위반)`);
  }
}

// num 정답 파일 내 중복 FAIL·파일 간 일치 WARN(m1u1 관행)
for (const f of files) {
  const nums = all.filter((a) => a.file === f && a.type === "num").map((a) => a.ansRaw.replaceAll('"', ""));
  const dup = nums.filter((v, i) => nums.indexOf(v) !== i);
  if (dup.length) say(`${f}: num 정답 파일 내 중복 ${dup.join(",")}`);
}
const numAll = all.filter((a) => a.type === "num").map((a) => ({ f: a.file, v: a.ansRaw.replaceAll('"', "") }));
const crossDup = [...new Set(numAll.filter((x, i) => numAll.some((y, j) => j !== i && y.v === x.v && y.f !== x.f)).map((x) => x.v))];
if (crossDup.length) console.log("WARN", `num 정답 파일 간 일치 후보(수동 판정): ${crossDup.join(", ")}`);

// ⑥ 해설 길이
for (const it of all) {
  const plain = strip(it.explain);
  if (plain.length < 250) say(`${it.id}: 해설 ${plain.length}자 < 250`);
  if (plain.length > 480) console.log("WARN", `${it.id}: 해설 ${plain.length}자 > 480(수동 확인)`);
}

// ⑩ 문장형 mcq 상한(지정 슬롯 밖에서 보기 과반이 술어 문장이면 FAIL)
for (const it of all.filter((a) => a.type === "mcq" && !SENTENCE_MCQ.has(a.slot))) {
  const sentencey = it.options.filter((o) => /(다|요)[.!?]?$/.test(strip(o)) && strip(o).length > 12).length;
  if (sentencey >= 3) say(`${it.id}: 문장형 mcq(지정 8슬롯 밖) · 보기 ${sentencey}개가 술어 문장`);
}

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
