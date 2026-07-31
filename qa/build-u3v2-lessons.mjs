// u3 v2 이식 생성기(g2u2 v2판 계승 · 과학 재출제 10호): 스테이징 qa/u3v2-{pilot,rest-a~d}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/u3l1~l5.ts + u3.ts를 재생성하고,
// 신작 헬퍼 11종을 ui/examFigures.ts 말미 "u3 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 헬퍼 구간 추출은 인덱스 기반(g2u7 ⑥ 정규식 사고 재발 방지).
// node qa/build-u3v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/u3v2-pilot.ts", "qa/u3v2-rest-a.ts", "qa/u3v2-rest-b.ts", "qa/u3v2-rest-c.ts", "qa/u3v2-rest-d.ts"];

// ── 1. 스테이징에서 문항 블록 수집(최상위 "  {" ~ 짝 맞는 "  }") ──
const items = new Map();
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const arrStart = src.indexOf("ExamItem[] = [");
  const body = src.slice(src.indexOf("[", arrStart) + 1, src.lastIndexOf("];"));
  let i = 0;
  while (i < body.length) {
    const start = body.indexOf("\n  {", i);
    if (start === -1) break;
    let depth = 0;
    let j = start + 1;
    let inStr = null;
    let prev = "";
    for (; j < body.length; j++) {
      const ch = body[j];
      if (inStr) {
        if (ch === inStr && prev !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
      else if (ch === "{") depth += 1;
      else if (ch === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
      prev = ch;
    }
    const block = body.slice(start + 1, j + 1);
    const id = block.match(/id: "(u3e\d{3})"/)?.[1];
    if (id) items.set(id, block);
    i = j + 1;
  }
}
if (items.size !== 160) {
  console.error(`문항 ${items.size} ≠ 160 · 이식 중단`);
  process.exit(1);
}

const LESSONS = [
  ["u3l1", 201, 228, "온도와 입자 운동"],
  ["u3l2", 229, 258, "열평형"],
  ["u3l3", 259, 294, "열의 이동"],
  ["u3l4", 295, 328, "비열"],
  ["u3l5", 329, 360, "열팽창"],
];

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간(마커 ~ 부록 직전)을 examFigures.ts "u3 v2" 섹션으로 ──
const pilotSrc = readFileSync("qa/u3v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("/* ══════════ 신작 헬퍼(이식 때 examFigures");
const hEnd = pilotSrc.indexOf("/** 파일럿 부록");
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd);
helperBlock = helperBlock.replace(/const NS = `xmlns="http:\/\/www\.w3\.org\/2000\/svg"`;\n/, "");
helperBlock = helperBlock.replace(/\/\* ══════════ 신작 헬퍼[^\n]*\n/, "");

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
const MARK = "// ── u3 v2 신작(파일럿 승격 · 재출제 10호) ──";
const promoted = `${MARK}\n// 열 단원 문법: 입자 모형은 개수·크기 고정(온도 단서는 떨림 줄 수와 간격뿐 · 호 최대 2줄) ·\n// 균일 가열(뜨거운 물 담금)로 방향성 가열 논쟁 차단 · 회로형은 전류 경로 한 바퀴 검산.\n${helperBlock.trimEnd()}\n`;
if (fig.includes(MARK)) {
  fig = fig.replace(new RegExp(MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\s\\S]*$"), promoted);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u3 v2 섹션 승격(신작 11종)");

// ── 3. 레슨 파일 생성 ──
// examFigures에서 import할 심벌(기존 열 섹션 + 승격 신작)
const FROM_EXAM = [
  "eqGraph", "heatCurves", "svgTable", "thermometerRead", "seaBreeze", "ringSphere", "dbox",
  "htParticleBoxFig", "htSceneFig", "htRodsFig", "htRoomFig", "htFlowFig", "htBimetalFig",
  "htExpandGraphFig", "htInsulFig", "htLiquidTubesFig", "htPotFig", "htSunEarthFig",
];
const BASE_LOCAL = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_LOCAL = `/** 발주 실사 임베드 · loading=lazy 금지(사고 #14). alt는 관찰 서술만(정답·해석 금지). */
const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u3/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const XPAIR_LOCAL = `/** 실사 2연((가)(나) 캡션) · 계절 비교 등. */
const xpair = (a: string, altA: string, b: string, altB: string): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0"><img src="\${IMG_BASE}exam/u3/\${a}" alt="\${altA}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0"><img src="\${IMG_BASE}exam/u3/\${b}" alt="\${altB}" style="display:block;width:100%;border-radius:12px"/><figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;
const TMPAIR_LOCAL = `/** 온도계 2연 · 두 컵 판독 비교. */
const tmPair = (a: number, b: number): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <figure style="margin:0">\${thermometerRead(a)}<figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(가)</figcaption></figure>
    <figure style="margin:0">\${thermometerRead(b)}<figcaption style="text-align:center;font-size:12px;font-weight:700;color:#4E5968;margin-top:5px">(나)</figcaption></figure>
  </div>\`;`;

for (const [lid, s, e, title] of LESSONS) {
  const blocks = [];
  for (let n = s; n <= e; n++) {
    const id = `u3e${n}`;
    const b = items.get(id);
    if (!b) {
      console.error(`누락: ${id}`);
      process.exit(1);
    }
    blocks.push("  " + b);
  }
  const body = blocks.join(",\n") + ",";
  const used = (sym) => new RegExp(`\\b${sym}\\(`).test(body);
  const exImports = FROM_EXAM.filter(used);
  const usesXimg = used("ximg");
  const usesXpair = used("xpair");
  const usesTm = used("tmPair");
  const locals = [];
  if (usesXimg || usesXpair) locals.push(BASE_LOCAL);
  if (usesXimg) locals.push(XIMG_LOCAL);
  if (usesXpair) locals.push(XPAIR_LOCAL);
  if (usesTm) locals.push(TMPAIR_LOCAL);
  const n = Number(lid.replace("u3l", ""));
  const header = `// 중1 과학 III. 열 · 단원 종합 평가 풀 v2: 레슨 ${n} ${title} (u3e${s}~e${e}, ${e - s + 1}문항)
// ⚠ 이 파일은 qa/build-u3v2-lessons.mjs가 스테이징(qa/u3v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 재출제 10호(2026-07) · 정본 설계표 qa/u3-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: word 0 · num 16(전량 자료 동반) · diff 태그 · 그림은 자료 의존 설계 ·
// 열 검산(온도↑ = 운동 활발·간격↑ · 열은 고온→저온 · 비열 역관계 · 바이메탈은 덜 팽창한 쪽으로).
// 언어 가드 금지어 목록은 설계표 §0이 정본(검사기 v2가 소스 전체를 스캔한다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (exImports.length) importLines.push(`import { ${exImports.join(", ")} } from "../../ui/examFigures";`);
  const out = `${header}\n${importLines.join("\n")}\n${locals.length ? "\n" + locals.join("\n") + "\n" : ""}
export const POOL_U3L${n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${e - s + 1}문항 · examFigures ${exImports.length}종${usesXimg ? "+ximg" : ""}${usesXpair ? "+xpair" : ""}${usesTm ? "+tmPair" : ""})`);
}

// ── 4. 조립 파일 갱신 ──
const asm = `// 중1 과학 III. 열 · 단원 종합 평가 문항 풀 v2(160제 = 28+30+36+34+32, 5레슨 · 재출제 10호).
// 문항은 레슨 파일(u3l1~u3l5)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 129 / multi 15 / num 16 / word 0 · diff 64/64/32 · 시각 99(발주 실사 8장 포함).
// 규격·회피표·검산 기록 정본 = qa/u3-v2-blueprint.md, 이식 = qa/build-u3v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_U3L1 } from "./u3l1";
import { POOL_U3L2 } from "./u3l2";
import { POOL_U3L3 } from "./u3l3";
import { POOL_U3L4 } from "./u3l4";
import { POOL_U3L5 } from "./u3l5";

export const U3_EXAM: ExamDef = {
  id: "u3exam",
  unitId: "u3",
  title: "열",
  pick: 20,
  pool: [...POOL_U3L1, ...POOL_U3L2, ...POOL_U3L3, ...POOL_U3L4, ...POOL_U3L5],
};
`;
writeFileSync("src/content/exams/u3.ts", asm);
console.log("u3.ts 조립 갱신 · 이식 완료(160문항)");
