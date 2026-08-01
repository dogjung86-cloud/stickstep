// g2u8 v2 이식 생성기(u1 v2판 계승 · 과학 재출제 4호): 스테이징 qa/g2u8v2-{pilot,rest-a~d}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/g2u8l1~l8.ts + g2u8.ts를 재생성하고,
// 신작 헬퍼를 ui/examFigures.ts 말미 "g2u8 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 승격 규칙(정본 출처): starOrbitPickFig 모드 확장판·starDistPairFig = rest-a / starFlowFig·
// starTopMarksFig = pilot / starMagBandFig·ctRowFig(→ starColorRowFig 개명)·msFigV2 = rest-b.
// msFigV2는 기존 starMagScatterFig의 "원본 패치"로 승격(파일럿 눈검수 반영판 · v1 폐기라 호출처는
// v2뿐 · rubFigV2 계보) · 생성 레슨의 msFigV2( 호출은 starMagScatterFig( 로 재작성.
// 섹션 교체는 시작·종료 마커 사이만(종료 마커 없으면 throw · u1 v2 §13 공유 파일 사고 재발 방지).
// 실행 후 반드시 npx tsc --noEmit(공유 파일 생성기 의무 · u1 v2 §13).
// node qa/build-g2u8v2-lessons.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/g2u8v2-pilot.ts", "qa/g2u8v2-rest-a.ts", "qa/g2u8v2-rest-b.ts", "qa/g2u8v2-rest-c.ts", "qa/g2u8v2-rest-d.ts"].filter((p) => existsSync(p));
const FULL = SRC.length === 5;
const LESSON = {
  g2u8l1: { start: 201, end: 221, label: "별까지의 거리(연주 시차)" },
  g2u8l2: { start: 222, end: 239, label: "별의 밝기와 거리" },
  g2u8l3: { start: 240, end: 260, label: "별의 등급" },
  g2u8l4: { start: 261, end: 279, label: "별의 색과 표면 온도" },
  g2u8l5: { start: 280, end: 299, label: "우리은하" },
  g2u8l6: { start: 300, end: 321, label: "성단과 성운" },
  g2u8l7: { start: 322, end: 341, label: "팽창하는 우주" },
  g2u8l8: { start: 342, end: 360, label: "우주 탐사" },
};
// 생성 레슨이 examFigures에서 import할 수 있는 헬퍼 전체(재사용 + 승격)
const EXAM_HELPERS = [
  "svgTable",
  "starParallax3Fig",
  "starShiftPairFig",
  "starBrightGridFig",
  "starMagScatterFig",
  "colorTempTrioFig",
  "starGalaxyQuizFig",
  "starClusterMapFig",
  "starExpandArrowFig",
  "starOrbitPickFig",
  "starDistPairFig",
  "starFlowFig",
  "starMagBandFig",
  "starTopMarksFig",
  "starColorRowFig",
];

const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

// ── 1. 스테이징에서 문항 블록 추출(lessonId는 리터럴 문자열 저작이라 재작성 불요) ──
const blocks = [];
for (const p of SRC) {
  const src = read(p);
  let cur = null;
  for (const line of src.split("\n")) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(g2u8e\d{3})"/)?.[1];
        const lid = text.match(/lessonId: "(g2u8l\d)"/)?.[1];
        if (!id || !lid) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("g2u8e", "")), id, lessonId: lid, text });
        cur = null;
      }
    }
  }
}
if (FULL && blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 != 160`);
console.log(`스테이징 ${SRC.length}개 · 문항 ${blocks.length}개${FULL ? "" : " (부분 이식)"}`);

// ── 2. 헬퍼 소스 추출(인덱스 기반 · 함수는 열 0의 "}"에서, const 화살표는 열 0의 "};"에서 끝난다) ──
function extractFn(src, name, file) {
  const fnAt = src.indexOf(`export function ${name}(`);
  if (fnAt < 0) throw new Error(`${file}: ${name} 없음`);
  const docAt = src.lastIndexOf("/**", fnAt);
  if (docAt < 0) throw new Error(`${file}: ${name} JSDoc 없음`);
  const endAt = src.indexOf("\n}\n", fnAt);
  if (endAt < 0) throw new Error(`${file}: ${name} 끝(열 0 "}") 없음`);
  return src.slice(docAt, endAt + 2).trimEnd();
}
function extractConst(src, name, file) {
  const at = src.indexOf(`const ${name} = `);
  if (at < 0) throw new Error(`${file}: const ${name} 없음`);
  const docAt = src.lastIndexOf("/**", at);
  const endAt = src.indexOf("\n};\n", at);
  if (endAt < 0) throw new Error(`${file}: const ${name} 끝 없음`);
  return src.slice(docAt >= 0 && at - docAt < 200 ? docAt : at, endAt + 3).trimEnd();
}

const pilotSrc = read("qa/g2u8v2-pilot.ts");
const restA = read("qa/g2u8v2-rest-a.ts");
const restB = read("qa/g2u8v2-rest-b.ts");

const vstarSrc = extractConst(restA, "vstar", "rest-a");
const opSrc = extractFn(restA, "starOrbitPickFig", "rest-a");
const dpSrc = extractFn(restA, "starDistPairFig", "rest-a");
const flSrc = extractFn(pilotSrc, "starFlowFig", "pilot");
const tmSrc = extractFn(pilotSrc, "starTopMarksFig", "pilot").replaceAll("${IMG_BASE}", "${G2U8_IMG_BASE}");
const mbSrc = extractFn(restB, "starMagBandFig", "rest-b");
const ctSrc = extractFn(restB, "ctRowFig", "rest-b").replaceAll("ctRowFig", "starColorRowFig");
const msSrc = extractFn(restB, "msFigV2", "rest-b");

// ── 3. examFigures.ts 반영 ──
const FIG = "src/ui/examFigures.ts";
let fig = read(FIG);

// 3-0. v1 헬퍼 소급 패치 2건(검산 반영 · replace는 부재 시 무시라 멱등):
// ① starParallax3Fig 별 반지름 동일화(검산 A-7: 반지름 차등이 "더 밝게 그려져서" 미끼를
//    사실-참으로 만든다 · MB의 동일 크기 문법과 통일) ② starClusterMapFig ㉮·㉯ 라벨 색 통일
//    (검산 B-6: 파랑/앰버 라벨이 산개=파랑·구상=붉음 속성 짝의 미세 단서 · "점 색 통일" 관행의 라벨판).
fig = fig
  .replace("xstar(s.x, 102, 6 - i * 0.8, \"#EDE2BE\")", "xstar(s.x, 102, 6, \"#EDE2BE\")")
  .replace("fill=\"#7ED6FF\">㉮</text>", "fill=\"#DCE8FF\">㉮</text>")
  .replace("fill=\"#FFC45A\">㉯</text>", "fill=\"#DCE8FF\">㉯</text>");

// 3-1. starMagScatterFig 원본 패치(msFigV2 승격 · 방향 라벨 제거판 · aria 라벨 파생판).
// 교체 구간 = 원본 JSDoc 시작 ~ 다음 함수 JSDoc 직전(양끝 문자열이 없으면 throw).
const MS_NEW_DOC = "/** 색(가로 7단) × 겉보기 등급(세로) 산점도(다크 · g2u8 v2 패치판 msFigV2 승격).";
const MS_OLD_DOC = "/** 색(가로 7단) × 겉보기 등급(세로) 산점도(다크) — 별 점은 그 색으로 칠한다.";
const MS_END = "\n/** 색이 다른 별 셋(다크) — 레슨 colorTempFig의 시험판(라벨·색 구성 파라미터). */";
const msStart = fig.indexOf(MS_NEW_DOC) >= 0 ? fig.indexOf(MS_NEW_DOC) : fig.indexOf(MS_OLD_DOC);
const msEnd = fig.indexOf(MS_END);
if (msStart < 0 || msEnd < 0 || msEnd < msStart) throw new Error("starMagScatterFig 패치 경계를 찾지 못함");
const msBody = msSrc
  .replace(/^\/\*\*[\s\S]*?\*\//, "")
  .trim()
  .replace("export function msFigV2", "export function starMagScatterFig");
const msPatched = `${MS_NEW_DOC}
 *  파일럿 눈검수 반영 2건: 하단 "표면 온도 높음·낮음" 방향 라벨 제거(정답 인쇄) · col 5 이상 별
 *  라벨 왼쪽 배치(가장자리 잘림). mag: 1(위, 밝음)~5(아래, 어둠) · col: 0(청)~6(적). */
${msBody}
`;
fig = fig.slice(0, msStart) + msPatched + fig.slice(msEnd + 1);
console.log("examFigures.ts: starMagScatterFig 원본 패치(msFigV2 승격)");

// 3-2. "g2u8 v2" 섹션 승격(시작·종료 마커 사이만 교체 · 없으면 말미 append).
const MARK = "// ── g2u8 v2 신작(파일럿·확대 승격 · 과학 재출제 4호) ──";
const ENDMARK = "// ── g2u8 v2 섹션 끝 ──";
const promoted = `${MARK}
// 공전 궤도 관측 시점(pick/year/quarter)·거리 2관측점·거리 밝기 순서도·등급 눈금 띠·
// 우리은하 실사 마커·색 별 나열. 전부 파라미터형 · aria는 파라미터 파생(정답 미낭독).
const G2U8_IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
${vstarSrc}

${opSrc}

${dpSrc}

${flSrc}

${mbSrc}

${tmSrc}

${ctSrc}
${ENDMARK}
`;
const si = fig.indexOf(MARK);
if (si >= 0) {
  const ei = fig.indexOf(ENDMARK, si);
  if (ei < 0) throw new Error(`${FIG}: 시작 마커는 있는데 종료 마커가 없다(다른 섹션 삼킴 위험) — 수동 확인 필요`);
  fig = fig.slice(0, si) + promoted + fig.slice(ei + ENDMARK.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: g2u8 v2 섹션 승격(vstar + 헬퍼 6종 · 마커 구간 교체)");

// ── 4. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const PIMG_SNIPPET = `const pimg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}photos/star/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/g2u8/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const SPAIR_SNIPPET = `const spair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}photos/star/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}photos/star/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;
const XPAIR_SNIPPET = `const xpair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u8/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}exam/g2u8/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (FULL) {
    if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 != ${want}`); fails++; continue; }
    for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  } else if (!arr.length) { console.error(`FAIL ${lid}: 문항 0`); fails++; continue; }
  let body = arr.map((b) => b.text).join("\n");
  body = body.replaceAll("msFigV2(", "starMagScatterFig(").replaceAll("ctRowFig(", "starColorRowFig(");
  const usedExam = EXAM_HELPERS.filter((h) => body.includes(h + "("));
  const n = Number(lid.replace("g2u8l", ""));
  const header = `// 중2 과학 VIII. 별과 우주 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (g2u8e${L.start}~e${L.end}${FULL ? "" : " 중 " + arr.length + "문항"})
// 이 파일은 qa/build-g2u8v2-lessons.mjs가 스테이징(qa/g2u8v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 전면 재출제(2026-08) · 정본 설계표 qa/g2u8-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · 개수 세기 num 0 · diff 태그 · 그림은 자료 의존 설계 · 언어 가드 목록은 설계표 §0.`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  const local = [];
  if (body.includes("pimg(") || body.includes("ximg(") || body.includes("spair(") || body.includes("xpair(")) local.push(BASE_SNIPPET);
  if (body.includes("pimg(")) local.push(PIMG_SNIPPET);
  if (body.includes("ximg(")) local.push(XIMG_SNIPPET);
  if (body.includes("spair(")) local.push(SPAIR_SNIPPET);
  if (body.includes("xpair(")) local.push(XPAIR_SNIPPET);
  const out = `${header}\n${importLines.join("\n")}\n${local.length ? "\n" + local.join("\n") : ""}\nexport const POOL_G2U8L${n}: ExamItem[] = [\n${body}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종)`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 5. 조립 파일 ──
const asm = `// 중2 과학 VIII. 별과 우주 · 단원 종합 평가 문항 풀 v2(160제 = 21/18/21/19/20/22/20/19, 8레슨).
// 문항은 레슨 파일(g2u8l1~g2u8l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 136 / multi 16 / num 8 / word 0 · diff 64/64/32 · 시각 85(사진 37 포함) · bogi 합답 22.
// 규격·회피표·검산 기록 정본 = qa/g2u8-v2-blueprint.md, 이식 = qa/build-g2u8v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_G2U8L1 } from "./g2u8l1";
import { POOL_G2U8L2 } from "./g2u8l2";
import { POOL_G2U8L3 } from "./g2u8l3";
import { POOL_G2U8L4 } from "./g2u8l4";
import { POOL_G2U8L5 } from "./g2u8l5";
import { POOL_G2U8L6 } from "./g2u8l6";
import { POOL_G2U8L7 } from "./g2u8l7";
import { POOL_G2U8L8 } from "./g2u8l8";

export const G2U8_EXAM: ExamDef = {
  id: "g2u8exam",
  unitId: "g2u8",
  title: "별과 우주",
  pick: 20,
  pool: [
    ...POOL_G2U8L1,
    ...POOL_G2U8L2,
    ...POOL_G2U8L3,
    ...POOL_G2U8L4,
    ...POOL_G2U8L5,
    ...POOL_G2U8L6,
    ...POOL_G2U8L7,
    ...POOL_G2U8L8,
  ],
};
`;
writeFileSync("src/content/exams/g2u8.ts", asm);
console.log(`g2u8.ts 조립 ${FULL ? "완료(160문항)" : "생성(부분 " + blocks.length + "문항)"}`);
