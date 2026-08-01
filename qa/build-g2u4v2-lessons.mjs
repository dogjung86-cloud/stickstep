// g2u4 v2 이식 생성기 · 스테이징(qa/g2u4v2-pilot.ts + rest-a~f.ts)에서 문항·신작 헬퍼를 추출해
//   ① ui/examFigures.ts 말미 "g2u4 v2" 섹션 승격(시작·종료 마커 사이만 교체 · 종료 마커 없으면 throw)
//   ② src/content/exams/g2u4l1~l6.ts 재생성(레슨 파일 직접 수정 금지 · 수정은 항상 스테이징에서)
// 멱등: 재실행 시 같은 결과. 실행 후 반드시 npx tsc(공유 파일 생성 직후 · u1 v2 §13 관행).
// node qa/build-g2u4v2-lessons.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const nl = (s) => s.replace(/\r\n/g, "\n");

// ── 1. 스테이징 로드 ──
const STAGE = [
  "qa/g2u4v2-pilot.ts",
  "qa/g2u4v2-rest-a.ts",
  "qa/g2u4v2-rest-b.ts",
  "qa/g2u4v2-rest-c.ts",
  "qa/g2u4v2-rest-d.ts",
  "qa/g2u4v2-rest-e.ts",
  "qa/g2u4v2-rest-f.ts",
];
for (const p of STAGE) if (!existsSync(p)) throw new Error(`스테이징 없음: ${p}`);
const src = Object.fromEntries(STAGE.map((p) => [p, nl(readFileSync(p, "utf8"))]));

// ── 2. 문항 블록 추출(각 파일의 배열 리터럴에서 { id: "g2u4eNNN" ... } 블록을 중괄호 균형으로 절단) ──
function extractItems(text) {
  const items = [];
  const re = /\{\s*\n\s*\/\/ \[/g; // 각 문항은 "{\n    // [슬롯]" 주석으로 시작
  let m;
  while ((m = re.exec(text))) {
    const start = m.index;
    let depth = 0;
    let end = -1;
    let inStr = null;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      const prev = text[i - 1];
      if (inStr) {
        if (inStr === "`" && ch === "`" && prev !== "\\") inStr = null;
        else if (inStr === '"' && ch === '"' && prev !== "\\") inStr = null;
        else if (inStr === "'" && ch === "'" && prev !== "\\") inStr = null;
        continue;
      }
      if (ch === "`" || ch === '"' || ch === "'") { inStr = ch; continue; }
      if (ch === "{") depth += 1;
      if (ch === "}") {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end < 0) throw new Error("문항 블록 중괄호 불균형");
    const block = text.slice(start, end + 1);
    const id = (block.match(/id: "(g2u4e\d{3})"/) || [])[1];
    if (!id) throw new Error("문항 id 없음: " + block.slice(0, 120));
    items.push({ id, slot: Number(id.replace("g2u4e", "")), block });
    re.lastIndex = end;
  }
  return items;
}
const all = [];
for (const p of STAGE) all.push(...extractItems(src[p]));
if (all.length !== 160) throw new Error(`문항 ${all.length} ≠ 160`);
const seen = new Set();
for (const it of all) {
  if (seen.has(it.slot)) throw new Error(`중복 슬롯 ${it.slot}`);
  seen.add(it.slot);
}
all.sort((a, b) => a.slot - b.slot);

// ── 3. 신작 헬퍼 승격(스테이징의 로컬 정의를 원문 그대로 절단해 examFigures 섹션으로) ──
// cut은 endMark를 "제외"하고 반환한다(exclusive) · 호출부가 닫는 토큰("\n}" 등)을 직접 이어
// 붙이는 계약. 포함(inclusive)으로 바꾸면 전 블록에 닫는 괄호가 이중으로 붙는다(실사고 · // tsc TS1128 12건·레슨 파일 </div> 중복의 원인).
function cut(text, startMark, endMark, label) {
  const s = text.indexOf(startMark);
  if (s < 0) throw new Error(`헬퍼 절단 시작 못 찾음: ${label}`);
  const e = text.indexOf(endMark, s);
  if (e < 0) throw new Error(`헬퍼 절단 끝 못 찾음: ${label}`);
  return text.slice(s, e);
}
const P = src["qa/g2u4v2-pilot.ts"];
const RA = src["qa/g2u4v2-rest-a.ts"];
const RE_ = src["qa/g2u4v2-rest-e.ts"];
const RF = src["qa/g2u4v2-rest-f.ts"];

const helperBlocks = [
  // pilot: cellQuiz2Fig(CQ2) · molsFig2(AM2 파츠 포함) · structQuiz2Fig(SQ2) · pieFig2
  cut(P, "/** CQ2 주기율표 칸 확대(파라미터판)", "\n}", "cellQuiz2Fig") + "\n}",
  cut(P, "/** AM2 분자 모형 확장판(파일 로컬)", "export function molsFig2", "molsFig2-head") +
    cut(P, "export function molsFig2", "\n}", "molsFig2") + "\n}",
  cut(P, "/** SQ2 원자 구조 ㉠㉡㉢ 판독(교과서 그림 Ⅳ-4 문법판)", "\n}", "structQuiz2Fig") + "\n}",
  cut(P, "/** PIE2 이온 조성 원그래프(범례 좌측 이동판)", "\n}", "pieFig2") + "\n}",
  // rest-a: n2CoFig(NM 파츠 포함)
  cut(RA, "const NM_EL", "export function n2CoFig", "n2Co-head") +
    cut(RA, "export function n2CoFig", "\n}", "n2CoFig") + "\n}",
  // rest-e: n2Fig · ionFormBeforeFig
  cut(RE_, "/** N2 단독 분자 모형(파일 로컬", "\n}", "n2Fig") + "\n}",
  cut(RE_, "/** IF2 이온 생성 예측판(파일 로컬)", "\n}", "ionFormBeforeFig") + "\n}",
  // rest-f: imBase + still/duo/mask
  cut(RF, "const imBase", "/** IM-still", "imBase"),
  cut(RF, "/** IM-still 중립 초기 상태", "\n}", "ionMoveStillFig") + "\n}",
  cut(RF, "/** IM-duo 두 색 반대 번짐", "\n}", "ionMoveDuoFig") + "\n}",
  cut(RF, "/** IM-mask 극 가림판", "\n}", "ionMoveMaskFig") + "\n}",
];

const SEC_START = "/* ══════════════ g2u4 v2 재출제 전용(빌드 승격 · 수정은 qa/g2u4v2-*.ts에서) ══════════════ */";
const SEC_END = "/* ══════════════ g2u4 v2 end ══════════════ */";
const section = `${SEC_START}
// 신작·개조 헬퍼 · build-g2u4v2-lessons.mjs가 스테이징 로컬 정의를 그대로 승격한다(멱등).
// 중성자 표기 = 교과서 그림 Ⅳ-4 문법(양성자 + 표시 · 중성자 무표시 회색 · 구 atomStructQuizFig의
// "0" 라벨 폐기 사유는 blueprint §7-2). 구판(atomStructQuizFig·atomCellQuizFig·atomPieFig)은
// v1 폐기로 참조가 사라지지만 하위 호환을 위해 유지한다.
${helperBlocks.join("\n\n")}
${SEC_END}`;

// examFigures.ts 마커 사이 교체(없으면 말미 append · "마커 이후 전부" 패턴 금지)
const EF = "src/ui/examFigures.ts";
let ef = nl(readFileSync(EF, "utf8"));
const s0 = ef.indexOf(SEC_START);
if (s0 >= 0) {
  const e0 = ef.indexOf(SEC_END, s0);
  if (e0 < 0) throw new Error("examFigures: 시작 마커만 있고 종료 마커 없음 · 수동 확인 필요");
  ef = ef.slice(0, s0) + section + ef.slice(e0 + SEC_END.length);
} else {
  ef = ef.trimEnd() + "\n\n" + section + "\n";
}
writeFileSync(EF, ef);
console.log(`examFigures.ts "g2u4 v2" 섹션 승격(${helperBlocks.length} 블록)`);

// ── 4. 레슨 파일 재생성 ──
const LESSONS = [
  { file: "g2u4l1", name: "레슨 1 원소와 화합물", range: [201, 227] },
  { file: "g2u4l2", name: "레슨 2 원소 기호와 화학식", range: [228, 254] },
  { file: "g2u4l3", name: "레슨 3 원자의 구조", range: [255, 281] },
  { file: "g2u4l4", name: "레슨 4 주기율표", range: [282, 307] },
  { file: "g2u4l5", name: "레슨 5 원자·분자·이온", range: [308, 334] },
  { file: "g2u4l6", name: "레슨 6 이온의 이동", range: [335, 360] },
];
// 헬퍼 → import 소스 매핑(로컬 래퍼는 레슨 파일 로컬로 복제)
const EXAM_FIG_FNS = ["atomMolsFig", "atomPeriodicExamFig", "atomFlowFig", "atomElectrolysisFig", "atomIonMoveExamFig", "atomCondFig", "atomIonFormExamFig", "svgTable", "dbox", "cellQuiz2Fig", "molsFig2", "structQuiz2Fig", "pieFig2", "n2CoFig", "n2Fig", "ionFormBeforeFig", "ionMoveStillFig", "ionMoveDuoFig", "ionMoveMaskFig"];
const ATOM_FIG_FNS = ["atomModelFig", "fourModelFig"];
const WRAPPERS = {
  ionFormPair: cut(P, "/** 이온 생성 모형 두 벌 세로 배치 래퍼", "\n  </div>`;", "ionFormPair") + "\n  </div>`;",
  sq2Pair: cut(src["qa/g2u4v2-rest-c.ts"], "/** SQ2 두 벌 세로 배치 래퍼", "\n  </div>`;", "sq2Pair") + "\n  </div>`;",
  cq2Pair: cut(src["qa/g2u4v2-rest-d.ts"], "/** CQ2 두 칸 세로 스택 래퍼", "\n  </div>`;", "cq2Pair") + "\n  </div>`;",
};
const IMG_BASE_DECL = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_DECL = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u4/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const XPAIR_DECL = `const xpair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u4/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u4/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

for (const L of LESSONS) {
  const items = all.filter((it) => it.slot >= L.range[0] && it.slot <= L.range[1]);
  const body = items.map((it) => "  " + it.block.split("\n").join("\n  ")).join(",\n") + ",";
  // 래퍼는 본문 사용 기준으로 선별하고, import 검출은 본문+래퍼 합산으로(래퍼가 부르는 헬퍼 누락 방지)
  const wrappers = Object.entries(WRAPPERS).filter(([k]) => new RegExp(`\\b${k}\\(`).test(body)).map(([, v]) => v);
  const scanText = body + "\n" + wrappers.join("\n");
  const used = (fn) => new RegExp(`\\b${fn}\\(`).test(scanText);
  const efImports = EXAM_FIG_FNS.filter(used);
  const afImports = ATOM_FIG_FNS.filter(used);
  const needXimg = /\bximg\(/.test(body);
  const needXpair = /\bxpair\(/.test(body);
  const locals = [
    needXimg || needXpair ? IMG_BASE_DECL : "",
    needXimg ? XIMG_DECL : "",
    needXpair ? XPAIR_DECL : "",
    ...wrappers,
  ].filter(Boolean);
  const out = `// 중2 IV. 물질의 구성 · 단원 종합 평가 풀 v2: ${L.name} (e${L.range[0]}~e${L.range[1]})
// 재출제 8호(2026-08-01) · 교과서 3사 준거 · 정본 설계표 qa/g2u4-v2-blueprint.md.
// 이 파일은 build-g2u4v2-lessons.mjs가 스테이징(qa/g2u4v2-*.ts)에서 재생성한다 · 직접 수정 금지.
import type { ExamItem } from "./types";
${efImports.length ? `import { ${efImports.join(", ")} } from "../../ui/examFigures";\n` : ""}${afImports.length ? `import { ${afImports.join(", ")} } from "../../ui/atomFigures";\n` : ""}
${locals.length ? locals.join("\n") + "\n" : ""}
export const POOL_${L.file.toUpperCase()}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${L.file}.ts`, out);
  console.log(`${L.file}.ts 재생성 (${items.length}문항)`);
}
console.log("이식 완료 · 반드시 npx tsc --noEmit 실행(공유 파일 검증)");
