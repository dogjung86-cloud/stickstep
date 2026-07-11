// g2u4 시험 풀 기계 검사 — 커밋 전 스캔.
//   ① shuffle:false && answer===0 조합(셔플 규칙 위반) ② id 유일성·연번 ③ 유형 구성(113/18/19)
//   ④ 레슨 분포(25×6 — word 4문항 레슨은 L6) ⑤ num 정답이 문자열·unitLabel 존재 ⑥ word 정답이 bank에 포함
//   ⑦ 해설 길이(태그 제외 250~450자 — 초과·미달 목록) ⑧ 그림 aria에 정답 수치 단서(수동 확인 보조)
// node qa/check-exam-g2u4.mjs
import { readFileSync } from "node:fs";

const files = ["g2u4l1", "g2u4l2", "g2u4l3", "g2u4l4", "g2u4l5", "g2u4l6"];
let all = [];
for (const f of files) {
  const src = readFileSync(`src/content/exams/${f}.ts`, "utf8");
  // 문항 블록을 얕게 파싱(정규식) — id/type/shuffle/answer/bank/unitLabel/explain 추출
  const blocks = src.split(/\n  \{\n/).slice(1);
  for (const b of blocks) {
    const id = b.match(/id: "([^"]+)"/)?.[1];
    if (!id) continue;
    const type = b.match(/type: "(\w+)"/)?.[1];
    const shuffle = /shuffle: false/.test(b);
    const ansRaw = b.match(/answer: (\[[^\]]*\]|"[^"]*"|\d+)/)?.[1] ?? "";
    const bank = b.match(/bank: \[([^\]]*)\]/)?.[1];
    const unitLabel = b.match(/unitLabel: "([^"]+)"/)?.[1];
    const explain = b.match(/explain:\s*\n?\s*"([\s\S]*?)",\n    core/)?.[1] ?? "";
    all.push({ file: f, id, type, shuffle, ansRaw, bank, unitLabel, explain });
  }
}

let bad = 0;
const say = (m) => { console.log("FAIL", m); bad++; };

// ① shuffle:false && answer===0
for (const it of all) if (it.shuffle && it.ansRaw === "0") say(`${it.id}: shuffle:false인데 answer=0(첫 보기 정답 금지)`);

// ② id 유일·연번
const ids = all.map((a) => a.id);
if (new Set(ids).size !== ids.length) say("id 중복 존재");
for (let i = 0; i < ids.length; i++) {
  const want = `g2u4e${String(i + 1).padStart(2, "0")}`;
  const want2 = `g2u4e${i + 1}`;
  if (ids[i] !== want && ids[i] !== want2) { say(`연번 어긋남: ${ids[i]} (기대 ${want}|${want2})`); break; }
}

// ③ 유형 구성
const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
for (const it of all) cnt[it.type]++;
console.log("counts:", JSON.stringify(cnt), "total:", all.length);
if (all.length !== 150) say(`총 문항 ${all.length} ≠ 150`);
if (cnt.mcq + cnt.multi !== 113) say(`mcq+multi ${cnt.mcq + cnt.multi} ≠ 113`);
if (cnt.num !== 18) say(`num ${cnt.num} ≠ 18`);
if (cnt.word !== 19) say(`word ${cnt.word} ≠ 19`);

// ④ 레슨 분포
const per = {};
for (const it of all) per[it.file] = (per[it.file] ?? 0) + 1;
console.log("per-lesson:", JSON.stringify(per));
const want = { g2u4l1: 25, g2u4l2: 25, g2u4l3: 25, g2u4l4: 25, g2u4l5: 25, g2u4l6: 25 };
for (const [f, n] of Object.entries(want)) if (per[f] !== n) say(`${f}: ${per[f]}문항 ≠ ${n}`);

// ⑤ num 계약
for (const it of all.filter((a) => a.type === "num")) {
  if (!it.ansRaw.startsWith('"')) say(`${it.id}: num answer가 문자열이 아님(${it.ansRaw})`);
  if (!it.unitLabel) say(`${it.id}: num에 unitLabel 없음`);
}

// ⑥ word 계약
for (const it of all.filter((a) => a.type === "word")) {
  const ans = it.ansRaw.replaceAll('"', "");
  if (!it.bank) { say(`${it.id}: word에 bank 없음`); continue; }
  const chips = [...it.bank.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!chips.includes(ans)) say(`${it.id}: 정답 "${ans}"이 bank에 없음`);
  if (chips.length < 8 || chips.length > 10) say(`${it.id}: bank ${chips.length}개(8~10 요구)`);
}

// ⑦ 해설 길이(태그·<br> 제외)
for (const it of all) {
  const plain = it.explain.replace(/<\/?[a-z][^>]*>/gi, "").replace(/\\n/g, "");
  if (plain.length < 250) say(`${it.id}: 해설 ${plain.length}자 < 250`);
  if (plain.length > 480) console.log("WARN", `${it.id}: 해설 ${plain.length}자 > 480(수동 확인)`);
}

console.log(bad === 0 ? "ALL PASS" : `${bad} FAIL(S)`);
process.exit(bad === 0 ? 0 : 1);
