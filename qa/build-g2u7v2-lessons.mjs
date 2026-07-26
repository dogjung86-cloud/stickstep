// g2u7 v2 이식 생성기(m1u6 v2판 계승 · 과학 1호): 스테이징 qa/g2u7v2-{pilot,rest-a~d}.ts의 문항
// 블록을 슬롯 순으로 재조립해 src/content/exams/g2u7l1~l8.ts + g2u7.ts를 재생성하고,
// 신작 헬퍼 7종(HG·PF·SC·CF·EB·CP·SW)을 ui/examFigures.ts 말미 "g2u7 v2" 섹션으로 승격하며,
// elecRubExamFig는 확대판(rubFigV2 · 파일럿 검수 반영)으로 본문을 패치한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// node qa/build-g2u7v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/g2u7v2-pilot.ts", "qa/g2u7v2-rest-a.ts", "qa/g2u7v2-rest-b.ts", "qa/g2u7v2-rest-c.ts", "qa/g2u7v2-rest-d.ts"];
const LESSON = {
  g2u7l1: { start: 201, end: 220, label: "마찰 전기" },
  g2u7l2: { start: 221, end: 240, label: "정전기 유도" },
  g2u7l3: { start: 241, end: 260, label: "전류와 전압" },
  g2u7l4: { start: 261, end: 280, label: "옴의 법칙" },
  g2u7l5: { start: 281, end: 300, label: "저항의 연결" },
  g2u7l6: { start: 301, end: 320, label: "전기 에너지의 전환" },
  g2u7l7: { start: 321, end: 340, label: "전류가 만드는 자기장" },
  g2u7l8: { start: 341, end: 360, label: "코일이 받는 힘" },
};
const EXAM_HELPERS = [
  "elecRubExamFig",
  "elecCanExamFig",
  "elecScopeFig",
  "elecScopeChoicesFig",
  "elecViExamFig",
  "elecViChoicesFig",
  "elecTwoCircuitFig",
  "elecPointsFig",
  "elecFlowFig",
  "elecLabelFig",
  "elecMotorExamFig",
  "elecCoilCompassFig",
  "elecCircuitFig",
  "elecEnergyBarFig",
  "elecCoilPolesFig",
  "elecSwingExamFig",
  "elecHangFig",
  "elecPairForceFig",
];

// ── 1. 스테이징에서 문항 블록 추출("  {" ~ "  },") ──
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const lines = src.split("\n");
  let cur = null;
  for (const line of lines) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(g2u7e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(g2u7l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("g2u7e", "")), id, lessonId, text: text.replace(/rubFigV2\(/g, "elecRubExamFig(") });
        cur = null;
      }
    }
  }
}
if (blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);

// ── 2. 신작 헬퍼 승격: 파일럿의 헬퍼 구간을 변환해 examFigures.ts에 반영 ──
const pilotSrc = readFileSync("qa/g2u7v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼 7종");
const hEnd = pilotSrc.indexOf("/* ══════════ 파일럿 40문항");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
// NS는 examFigures 상단 것을 쓴다(중복 선언 제거)
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
// rubFigV2 함수를 분리(elecRubExamFig 본문 패치용) 후 블록에서 제거
const rubM = helperBlock.match(/\/\*\* RB rubFigV2[\s\S]*?\nexport function rubFigV2\(o: \{ moved: number \}\): string \{([\s\S]*?)\n\}\n/);
if (!rubM) throw new Error("rubFigV2 정의를 찾지 못함");
const rubBody = rubM[1];
helperBlock = helperBlock.replace(rubM[0], "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼 7종[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
// 2-a. elecRubExamFig 본문 패치(확대판) · 멱등: 이미 패치됐으면 같은 결과
const rubNew = `/** 마찰 전/후 전하 분포 모형 · v2 확대판(헝겊 폭 128·깊이 54, moved 3 = 9알갱이 수용 · 파일럿 검수 반영).
 *  (가) 막대 = 전자를 잃는 쪽 · (나) 헝겊 = 얻는 쪽 · 시작은 (+)3·(−)3 중성. */
export function elecRubExamFig(o: { moved: number }): string {${rubBody.replace(/\bpch\(/g, "g7p(").replace(/\bmch\(/g, "g7m(")}
}`;
// 인덱스 기반 교체(정규식의 선행 JSDoc 게으른 확장이 파일 중간부를 삼킨 실사고 재발 방지):
// 시작 = elecRubExamFig 선언(바로 붙은 문서 주석이 있으면 포함) · 끝 = 다음 문서 주석/함수 선언 직전.
const fnIdx = fig.indexOf("export function elecRubExamFig");
if (fnIdx < 0) throw new Error("examFigures의 elecRubExamFig를 찾지 못함");
let cutStart = fnIdx;
const before = fig.slice(0, fnIdx);
const docOpen = before.lastIndexOf("\n/**");
if (docOpen >= 0) {
  const between = before.slice(docOpen);
  if (!between.includes("export function") && between.trimEnd().endsWith("*/")) cutStart = docOpen + 1;
}
const nextDoc = fig.indexOf("\n/**", fnIdx + 10);
const nextFn = fig.indexOf("\nexport function", fnIdx + 10);
const cutEndCands = [nextDoc, nextFn].filter((i) => i >= 0);
if (!cutEndCands.length) throw new Error("elecRubExamFig 뒤 경계를 찾지 못함");
const cutEnd = Math.min(...cutEndCands);
fig = fig.slice(0, cutStart) + rubNew + "\n" + fig.slice(cutEnd + 1);
// 2-b. g2u7 v2 섹션 추가(멱등: 마커 있으면 통째로 교체)
const MARK = "// ── g2u7 v2 신작(파일럿 승격 · 재출제 2호) ──";
const promoted =
  `${MARK}\n` +
  helperBlock
    .replace(/\bpch\b/g, "g7p")
    .replace(/\bmch\b/g, "g7m")
    .trimEnd() +
  "\n";
if (fig.includes(MARK)) {
  fig = fig.replace(new RegExp(MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*$"), promoted);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: elecRubExamFig 확대판 패치 + g2u7 v2 섹션 승격");

// ── 3. 레슨 파일 생성 ──
const XIMG_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u7/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const XPAIR_SNIPPET = `const xpair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u7/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u7/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (arr.length !== 20) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ 20`); fails++; continue; }
  for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  const body = arr.map((b) => b.text).join("\n");
  const used = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const usesEF = body.includes("electronFlowFig(");
  const usesXimg = body.includes("ximg(");
  const usesXpair = body.includes("xpair(");
  const n = Number(lid.replace("g2u7l", ""));
  const header = `// 중2 VII. 전기와 자기 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (g2u7e${L.start}~e${L.end}, 20문항)
// ⚠ 이 파일은 qa/build-g2u7v2-lessons.mjs가 스테이징(qa/g2u7v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 2호(2026-07) · 정본 설계표 qa/g2u7-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · 개수 세기 num 0(목록 판정은 multi) · diff 태그 · 그림은 자료 의존 설계.
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (used.length) importLines.push(`import { ${used.join(", ")} } from "../../ui/examFigures";`);
  if (usesEF) importLines.push(`import { electronFlowFig } from "../../ui/elecFigures";`);
  const local = [`const L = "${lid}";`];
  if (usesXimg || usesXpair) local.push(XIMG_SNIPPET);
  if (usesXpair) local.push(XPAIR_SNIPPET);
  // 블록의 lessonId 리터럴을 L 상수로 통일(v1 파일 관례)
  const bodyL = body.replaceAll(`lessonId: "${lid}"`, "lessonId: L");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_G2U7L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · 헬퍼 ${used.length}종${usesEF ? "+EF" : ""}${usesXimg ? "+ximg" : ""}${usesXpair ? "+xpair" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 갱신 ──
const asm = `// 중2 과학 VII. 전기와 자기 · 단원 종합 평가 문항 풀 v2(160제 = 20×8, 8레슨 · 재출제 2호).
// 문항은 레슨 파일(g2u7l1~g2u7l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 124 / multi 16 / num 20 / word 0 · diff 64/64/32 · 그림 91(사진 12장 재사용).
// 규격·회피표·검산 기록 정본 = qa/g2u7-v2-blueprint.md, 이식 = qa/build-g2u7v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U7L1 } from "./g2u7l1";
import { POOL_G2U7L2 } from "./g2u7l2";
import { POOL_G2U7L3 } from "./g2u7l3";
import { POOL_G2U7L4 } from "./g2u7l4";
import { POOL_G2U7L5 } from "./g2u7l5";
import { POOL_G2U7L6 } from "./g2u7l6";
import { POOL_G2U7L7 } from "./g2u7l7";
import { POOL_G2U7L8 } from "./g2u7l8";

export const G2U7_EXAM: ExamDef = {
  id: "g2u7exam",
  unitId: "g2u7",
  title: "전기와 자기",
  pick: 20,
  pool: [
    ...POOL_G2U7L1,
    ...POOL_G2U7L2,
    ...POOL_G2U7L3,
    ...POOL_G2U7L4,
    ...POOL_G2U7L5,
    ...POOL_G2U7L6,
    ...POOL_G2U7L7,
    ...POOL_G2U7L8,
  ],
};
`;
writeFileSync("src/content/exams/g2u7.ts", asm);
console.log("g2u7.ts 조립 갱신 · 이식 완료(160문항)");
