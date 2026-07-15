// m2u1(수학 중2 Ⅰ 유리수의 표현과 식의 계산) 시험 풀 기계 검사 — 커밋 전 스캔. m1u1 검사기의 20×10 판.
//   ① shuffle:false && answer===0 ② id 유일·연번(m2u1e01~e200) ③ 유형 구성(60/30/10 = 120/60/20)
//   ④ 레슨 분포(20×10) + 레슨별 유형 쿼터(mcq+multi 12 · num 6 · word 2)
//   ⑤ num 계약(문자열 answer · int /^-?\d+$/ · dec /^-?\d+\.\d+$/ · 절댓값 ≤ 9999)
//   ⑥ word 계약(bank 8~10 · 정답=bank[0] · 파일 간 word 정답 용어 중복 금지)
//   ⑦ 해설 길이(태그 제외 250~450자, 480+ 경고) ⑧ diff(레슨당 8/8/4 · 전체 80/80/40)
//   ⑨ 수학 언어 가드(em대시 — 금지 · 중2Ⅰ 금지어: 무리수/인수분해/곱셈 공식/기울기/항등식 ·
//      맨몸 <i> 금지(변수는 <i class='mv'>) · 지수 0·음의 지수 서술 백리스트는 수동)
//   ⑩ 핵심 수치 중복(같은 파일 num 정답 중복 FAIL · 파일 간 num 정답+단위 일치 WARN ·
//      mcq/multi 정답 보기 문구(10자+) 파일 간 일치 WARN) ⑪ 그림 문항 수 집계(보고)
// node qa/check-exam-m2u1.mjs
import { readFileSync } from "node:fs";

const files = ["m2u1l1", "m2u1l2", "m2u1l3", "m2u1l4", "m2u1l5", "m2u1l6", "m2u1l7", "m2u1l8", "m2u1l9", "m2u1l10"];
const SIZE = 20;
let all = [];
let bad = 0;
const say = (m) => { console.log("FAIL", m); bad++; };
const warn = (m) => console.log("WARN", m);

for (const f of files) {
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8").replace(/\r\n/g, "\n");
  // ⑨-a em대시는 파일 단위 검사(주석 포함 — 수학 텍스트 전면 금지)
  const em = [...src.matchAll(/—/g)].length;
  if (em > 0) say(`${f}: em대시(—) ${em}건, 수학 트랙 전면 금지(콜론·쉼표로)`);
  // ⑨-b 중2 Ⅰ 금지어(중3·고교 선행 + 타 단원 선점 용어)
  for (const w of ["무리수", "인수분해", "곱셈 공식", "곱셈공식", "기울기", "항등식"]) {
    if (src.includes(w)) say(`${f}: 금지어 "${w}" 발견`);
  }
  // ⑨-c 변수는 mv 클래스 필수 — 맨몸 <i> 금지
  if (/<i>(?!<)/.test(src)) say(`${f}: 맨몸 <i> 발견 — 변수는 <i class='mv'>x</i>로`);

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
    const optsRaw = b.match(/options: \[([\s\S]*?)\],\n/)?.[1] ?? "";
    all.push({ file: f, id, type, shuffle, ansRaw, bank, unitLabel, numKind, diff, hasFigure, explain, optsRaw });
  }
}

// ① shuffle:false && answer===0
for (const it of all) if (it.shuffle && it.ansRaw === "0") say(`${it.id}: shuffle:false인데 answer=0(첫 보기 정답 금지)`);

// ② id 유일·연번
const ids = all.map((a) => a.id);
if (new Set(ids).size !== ids.length) say("id 중복 존재");
for (let i = 0; i < ids.length; i++) {
  const want = `m2u1e${String(i + 1).padStart(2, "0")}`;
  const want2 = `m2u1e${i + 1}`;
  if (ids[i] !== want && ids[i] !== want2) { say(`연번 어긋남: ${ids[i]} (기대 ${want}|${want2})`); break; }
}

// ③ 유형 구성 — 60/30/10 = 120(mcq+multi)/60(num)/20(word)
const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
for (const it of all) cnt[it.type]++;
console.log("counts:", JSON.stringify(cnt), "total:", all.length);
if (all.length !== 200) say(`총 문항 ${all.length} ≠ 200`);
if (cnt.mcq + cnt.multi !== 120) say(`mcq+multi ${cnt.mcq + cnt.multi} ≠ 120`);
if (cnt.num !== 60) say(`num ${cnt.num} ≠ 60`);
if (cnt.word !== 20) say(`word ${cnt.word} ≠ 20`);

// ④ 레슨 분포 + 레슨별 유형 쿼터
const per = {};
for (const it of all) per[it.file] = (per[it.file] ?? 0) + 1;
console.log("per-lesson:", JSON.stringify(per));
for (const f of files) {
  if (per[f] !== SIZE) say(`${f}: ${per[f]}문항 ≠ ${SIZE}`);
  const mine = all.filter((a) => a.file === f);
  const c = { mm: 0, num: 0, word: 0 };
  for (const it of mine) { if (it.type === "num") c.num++; else if (it.type === "word") c.word++; else c.mm++; }
  if (c.mm !== 12) say(`${f}: mcq+multi ${c.mm} ≠ 12`);
  if (c.num !== 6) say(`${f}: num ${c.num} ≠ 6`);
  if (c.word !== 2) say(`${f}: word ${c.word} ≠ 2`);
}

// ⑤ num 계약 — 음수 허용(ASCII 하이픈), 무단위 순수 수는 unitLabel 생략 허용
for (const it of all.filter((a) => a.type === "num")) {
  if (!it.ansRaw.startsWith('"')) say(`${it.id}: num answer가 문자열이 아님(${it.ansRaw})`);
  const kind = it.numKind ?? "int";
  const v = it.ansRaw.replaceAll('"', "");
  if (kind === "int" && !/^-?\d+$/.test(v)) say(`${it.id}: int 정답 형식 위반(${v})`);
  if (kind === "dec" && !/^-?\d+\.\d+$/.test(v)) say(`${it.id}: dec 정답 형식 위반(${v})`);
  if (Math.abs(parseFloat(v)) > 9999) say(`${it.id}: 정답 절댓값 4자리 초과(${v}) — 넘패드 슬롯 제한`);
  if (/−/.test(v)) say(`${it.id}: num answer에 U+2212 사용(ASCII 하이픈이어야 채점 일치)`);
}

// ⑥ word 계약 + 파일 간 word 정답 중복 금지
const wordAns = new Map();
for (const it of all.filter((a) => a.type === "word")) {
  const ans = it.ansRaw.replaceAll('"', "");
  if (!it.bank) { say(`${it.id}: word에 bank 없음`); continue; }
  const chips = [...it.bank.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!chips.includes(ans)) say(`${it.id}: 정답 "${ans}"이 bank에 없음`);
  if (chips[0] !== ans) say(`${it.id}: 정답이 bank[0]이 아님(관행 위반)`);
  if (chips.length < 8 || chips.length > 10) say(`${it.id}: bank ${chips.length}개(8~10 요구)`);
  if (new Set(chips).size !== chips.length) say(`${it.id}: bank 칩 중복`);
  if (wordAns.has(ans)) say(`word 정답 용어 중복: "${ans}" (${wordAns.get(ans)} ↔ ${it.id})`);
  wordAns.set(ans, it.id);
}

// ⑦ 해설 길이(태그·개행 이스케이프 제외)
for (const it of all) {
  const plain = it.explain.replace(/<\/?[a-z][^>]*>/gi, "").replace(/\\n/g, "");
  if (plain.length < 250) say(`${it.id}: 해설 ${plain.length}자 < 250`);
  if (plain.length > 480) warn(`${it.id}: 해설 ${plain.length}자 > 480(수동 확인)`);
}

// ⑧ diff — 레슨당 8/8/4, 전체 80/80/40
const dTotal = { 1: 0, 2: 0, 3: 0 };
for (const f of files) {
  const d = { 1: 0, 2: 0, 3: 0 };
  for (const it of all.filter((a) => a.file === f)) {
    if (!it.diff) { say(`${it.id}: diff 태그 없음`); continue; }
    d[it.diff]++;
    dTotal[it.diff]++;
  }
  if (d[1] !== 8 || d[2] !== 8 || d[3] !== 4) say(`${f}: diff 분포 ${d[1]}/${d[2]}/${d[3]} ≠ 8/8/4`);
}
console.log("diff total:", JSON.stringify(dTotal));
if (dTotal[1] !== 80 || dTotal[2] !== 80 || dTotal[3] !== 40) say(`diff 전체 ${dTotal[1]}/${dTotal[2]}/${dTotal[3]} ≠ 80/80/40`);

// ⑩ 핵심 수치 중복 — (a) 같은 파일 내 num 정답 중복 FAIL (b) 파일 간 num 정답+단위 일치 WARN
const numByFile = new Map();
const numGlobal = new Map();
for (const it of all.filter((a) => a.type === "num")) {
  const v = it.ansRaw.replaceAll('"', "") + "|" + (it.unitLabel ?? "");
  const fk = it.file + "|" + v;
  if (numByFile.has(fk)) say(`같은 파일 num 정답 중복: ${numByFile.get(fk)} ↔ ${it.id} (${v})`);
  numByFile.set(fk, it.id);
  if (numGlobal.has(v)) warn(`파일 간 num 정답 일치 후보: ${numGlobal.get(v)} ↔ ${it.id} (${v}) — 과제가 다른지 수동 판정`);
  else numGlobal.set(v, it.id);
}
// (c) mcq/multi 정답 보기 문구(10자 이상) 파일 간 일치 후보
const optAns = new Map();
for (const it of all.filter((a) => a.type === "mcq" || a.type === "multi")) {
  const opts = [...it.optsRaw.matchAll(/"([^"]{2,})"/g)].map((m) => m[1]);
  const idxs = it.type === "mcq" ? [parseInt(it.ansRaw, 10)] : [...it.ansRaw.matchAll(/\d+/g)].map((m) => +m[0]);
  for (const i of idxs) {
    const t = opts[i];
    if (!t || t.length < 10) continue;
    if (optAns.has(t)) warn(`정답 보기 문구 일치 후보: ${optAns.get(t)} ↔ ${it.id} "${t.slice(0, 30)}…"`);
    else optAns.set(t, it.id);
  }
}

// ⑪ 그림 문항 집계(보고 전용)
const figPer = {};
for (const it of all) if (it.hasFigure) figPer[it.file] = (figPer[it.file] ?? 0) + 1;
console.log("figures per lesson:", JSON.stringify(figPer));

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
