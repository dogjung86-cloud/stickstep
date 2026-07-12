// m1u6(수학 중1 Ⅵ 통계) 시험 풀 기계 검사 — 커밋 전 스캔. 수학 시험 1호의 규격 검사기(이후 수학 단원 계승).
//   ① shuffle:false && answer===0 ② id 유일·연번(m1u6e01~e150) ③ 유형 구성(수학 규격 90/45/15)
//   ④ 레슨 분포(25×6) ⑤ num 계약(문자열 answer·int는 unitLabel 필수·dec 소수 형식) ⑥ word 계약(bank 8~10·정답=bank[0])
//   ⑦ 해설 길이(태그 제외 250~450자) ⑧ diff 태그(전 문항 필수·파일당 10/10/5·전체 60/60/30)
//   ⑨ 수학 언어 가드(em대시 — 금지·Ⅵ 금지어: 산포도/분산/표준편차/계급값/경우의 수) ⑩ 그림 문항 수 집계(보고)
// node qa/check-exam-m1u6.mjs
import { readFileSync } from "node:fs";

const files = ["m1u6l1", "m1u6l2", "m1u6l3", "m1u6l4", "m1u6l5", "m1u6l6"];
let all = [];
let bad = 0;
const say = (m) => { console.log("FAIL", m); bad++; };

for (const f of files) {
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8");
  // ⑨-a em대시는 파일 단위 검사(주석 포함 — 수학 텍스트 전면 금지)
  const em = [...src.matchAll(/—/g)].length;
  if (em > 0) say(`${f}: em대시(—) ${em}건 — 수학 트랙 전면 금지(콜론·쉼표로)`);
  // ⑨-b Ⅵ 금지어(코드 전체 스캔 — 주석 포함해도 오탐 거의 없음)
  for (const w of ["산포도", "분산", "표준편차", "계급값", "경우의 수"]) {
    if (src.includes(w)) say(`${f}: 금지어 "${w}" 발견`);
  }
  // "확률"은 단어 단위(중2 선행) — '확률적' 같은 표현 포함 일괄 검출
  if (/확률/.test(src)) say(`${f}: 금지어 "확률" 발견(중2 선행)`);

  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const id = b.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const type = b.match(/type: "(\w+)"/)?.[1];
    const shuffle = /shuffle: false/.test(b);
    const ansRaw = b.match(/answer: (\[[^\]]*\]|"[^"]*"|\d+)/)?.[1] ?? "";
    const bank = b.match(/bank: \[([^\]]*)\]/)?.[1];
    const unitLabel = b.match(/unitLabel: "([^"]+)"/)?.[1];
    const numKind = b.match(/numKind: "(\w+)"/)?.[1];
    const diff = b.match(/diff: (\d)/)?.[1];
    const hasFigure = /figure: /.test(b);
    const explain = b.match(/explain:\s*\n?\s*"([\s\S]*?)",\n    core/)?.[1] ?? "";
    all.push({ file: f, id, type, shuffle, ansRaw, bank, unitLabel, numKind, diff, hasFigure, explain });
  }
}

// ① shuffle:false && answer===0
for (const it of all) if (it.shuffle && it.ansRaw === "0") say(`${it.id}: shuffle:false인데 answer=0(첫 보기 정답 금지)`);

// ② id 유일·연번
const ids = all.map((a) => a.id);
if (new Set(ids).size !== ids.length) say("id 중복 존재");
for (let i = 0; i < ids.length; i++) {
  const want = `m1u6e${String(i + 1).padStart(2, "0")}`;
  const want2 = `m1u6e${i + 1}`;
  if (ids[i] !== want && ids[i] !== want2) { say(`연번 어긋남: ${ids[i]} (기대 ${want}|${want2})`); break; }
}

// ③ 유형 구성 — 수학 규격 60/30/10% = 90(mcq+multi)/45(num)/15(word)
const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
for (const it of all) cnt[it.type]++;
console.log("counts:", JSON.stringify(cnt), "total:", all.length);
if (all.length !== 150) say(`총 문항 ${all.length} ≠ 150`);
if (cnt.mcq + cnt.multi !== 90) say(`mcq+multi ${cnt.mcq + cnt.multi} ≠ 90`);
if (cnt.num !== 45) say(`num ${cnt.num} ≠ 45`);
if (cnt.word !== 15) say(`word ${cnt.word} ≠ 15`);

// ④ 레슨 분포
const per = {};
for (const it of all) per[it.file] = (per[it.file] ?? 0) + 1;
console.log("per-lesson:", JSON.stringify(per));
for (const f of files) if (per[f] !== 25) say(`${f}: ${per[f]}문항 ≠ 25`);

// ⑤ num 계약 — int는 unitLabel 필수, dec(상대도수 등 무단위)는 unitLabel 생략 허용
for (const it of all.filter((a) => a.type === "num")) {
  if (!it.ansRaw.startsWith('"')) say(`${it.id}: num answer가 문자열이 아님(${it.ansRaw})`);
  const kind = it.numKind ?? "int";
  if (kind === "int" && !it.unitLabel) say(`${it.id}: num(int)에 unitLabel 없음`);
  const v = it.ansRaw.replaceAll('"', "");
  if (kind === "int" && !/^\d+$/.test(v)) say(`${it.id}: int 정답이 자연수 아님(${v})`);
  if (kind === "dec" && !/^\d+\.\d+$/.test(v)) say(`${it.id}: dec 정답 형식 위반(${v})`);
}

// ⑥ word 계약 — bank 8~10, 정답=bank[0](표시 셔플은 exam.ts 몫)
for (const it of all.filter((a) => a.type === "word")) {
  const ans = it.ansRaw.replaceAll('"', "");
  if (!it.bank) { say(`${it.id}: word에 bank 없음`); continue; }
  const chips = [...it.bank.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!chips.includes(ans)) say(`${it.id}: 정답 "${ans}"이 bank에 없음`);
  if (chips[0] !== ans) say(`${it.id}: 정답이 bank[0]이 아님(관행 위반)`);
  if (chips.length < 8 || chips.length > 10) say(`${it.id}: bank ${chips.length}개(8~10 요구)`);
}

// ⑦ 해설 길이(태그·개행 이스케이프 제외)
for (const it of all) {
  const plain = it.explain.replace(/<\/?[a-z][^>]*>/gi, "").replace(/\\n/g, "");
  if (plain.length < 250) say(`${it.id}: 해설 ${plain.length}자 < 250`);
  if (plain.length > 480) console.log("WARN", `${it.id}: 해설 ${plain.length}자 > 480(수동 확인)`);
}

// ⑧ diff 태그 — 전 문항 필수, 파일당 1×10/2×10/3×5, 전체 60/60/30
const dTotal = { 1: 0, 2: 0, 3: 0 };
for (const f of files) {
  const d = { 1: 0, 2: 0, 3: 0 };
  for (const it of all.filter((a) => a.file === f)) {
    if (!it.diff) { say(`${it.id}: diff 태그 없음`); continue; }
    d[it.diff]++;
    dTotal[it.diff]++;
  }
  if (d[1] !== 10 || d[2] !== 10 || d[3] !== 5) say(`${f}: diff 분포 ${d[1]}/${d[2]}/${d[3]} ≠ 10/10/5`);
}
console.log("diff total:", JSON.stringify(dTotal));
if (dTotal[1] !== 60 || dTotal[2] !== 60 || dTotal[3] !== 30) say(`diff 전체 ${dTotal[1]}/${dTotal[2]}/${dTotal[3]} ≠ 60/60/30`);

// ⑩ 그림 문항 집계(보고 전용)
const figPer = {};
for (const it of all) if (it.hasFigure) figPer[it.file] = (figPer[it.file] ?? 0) + 1;
console.log("figures per lesson:", JSON.stringify(figPer));

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
