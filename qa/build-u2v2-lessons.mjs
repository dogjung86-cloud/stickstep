// u2 v2 이식 생성기(u1 v2판 계승 · 과학 재출제 13호 · 마지막 단원): 스테이징 qa/u2v2-{pilot,rest-a~f}.ts의
// 문항 블록을 슬롯 순으로 재조립해 src/content/exams/u2l1~l10.ts + u2.ts를 생성하고,
// 신작 헬퍼 12종을 ui/examFigures.ts 말미 "u2 v2" 섹션으로 승격한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// 파일럿만 있으면 부분 이식 · 전 파일이 있으면 160 전수 검사.
// ⚠ 실행 직후 반드시 `npx tsc --noEmit` (공유 파일 examFigures.ts를 건드리므로 · u1 v2 §13 사고).
// node qa/build-u2v2-lessons.mjs
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/u2v2-pilot.ts",
  "qa/u2v2-rest-a.ts",
  "qa/u2v2-rest-b.ts",
  "qa/u2v2-rest-c.ts",
  "qa/u2v2-rest-d.ts",
  "qa/u2v2-rest-e.ts",
  "qa/u2v2-rest-f.ts",
].filter((p) => existsSync(p));
const FULL = SRC.length === 7;
const LESSON = {
  u2l1: { start: 201, end: 216, label: "세포, 생명의 기본 단위" },
  u2l2: { start: 217, end: 232, label: "세포의 구조와 기능" },
  u2l3: { start: 233, end: 248, label: "현미경으로 세포 보기" },
  u2l4: { start: 249, end: 264, label: "모양이 다르면 하는 일도 달라요" },
  u2l5: { start: 265, end: 280, label: "생물의 구성 단계" },
  u2l6: { start: 281, end: 296, label: "생물다양성" },
  u2l7: { start: 297, end: 312, label: "변이와 새로운 종" },
  u2l8: { start: 313, end: 328, label: "생물의 분류와 종" },
  u2l9: { start: 329, end: 344, label: "5계로 나눈 생물" },
  u2l10: { start: 345, end: 360, label: "생물다양성보전" },
};
// 레슨 파일이 examFigures에서 가져올 헬퍼(신작 승격 15종 + 공용·기존 재사용).
const EXAM_HELPERS = [
  "svgTable", "dbox",
  "sizeBandFig", "oneVsManyFig", "slideStepsFig",
  "vesselCrossFig", "orgLadderPairFig", "diversityPlotFig", "traitBarsFig",
  "rankNestFig", "dichotomyFig", "kingdomKeyQuizFig", "foodWebQuizFig", "habitatCutFig",
  "bioCellRolesExamFig", "bioFieldPairFig", "bioOrgFlowExamFig",
  "bioDiversityGridFig", "bioKingdomClueTableFig", "bioPopulationBarsFig",
];
const BIO3_HELPERS = ["classRankFig", "kingdomKeyFig", "orgLevelFig"];

// ── 1. 스테이징에서 문항 블록 + 최상위 로컬 상수 추출 ──
// 로컬 const(공유 자료셋 등)는 쓰는 레슨 파일에 함께 심는다(m1u3 v2 · u1 v2 이식 관행).
const LOCAL_SKIP = new Set([
  "IMG_BASE", "ximg", "bimg", "xpair", "cellPhotoFig", "cellShapeCardsFig", "NS", "SYM", "PAREN", "wrapKo",
  "OL_A", "OL_P", "RANKS", "KQ_Q", "KQ_SIDE", "KQ_LEAF", "KQ_LAST",
  "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10",
]);
const locals = [];
const blocks = [];
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const head = src.slice(0, src.indexOf("export const POOL_"));
  for (const m of head.matchAll(/^const (\w+)\s*=\s*([\s\S]*?);\n/gm)) {
    if (LOCAL_SKIP.has(m[1])) continue;
    locals.push({ name: m[1], text: `const ${m[1]} = ${m[2]};` });
  }
  let cur = null;
  for (const line of src.split("\n")) {
    if (line === "  {") { cur = [line]; continue; }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(u2e\d{3})"/)?.[1];
        const lref = text.match(/lessonId: (L\d{1,2})/)?.[1];
        if (!id || !lref) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("u2e", "")), id, lessonId: `u2l${lref.slice(1)}`, text });
        cur = null;
      }
    }
  }
}
if (FULL && blocks.length !== 160) throw new Error(`블록 ${blocks.length}개 ≠ 160`);
console.log(`스테이징 ${SRC.length}개 · 문항 ${blocks.length}개${FULL ? "" : " (부분 이식)"}`);

// ── 2. 신작 헬퍼 승격: 파일럿 헬퍼 구간을 examFigures "u2 v2" 섹션으로 ──
// 구간 추출은 인덱스 기반(정규식 게으른 확장이 파일을 삼킨 g2u7 사고 재발 방지).
const pilotSrc = readFileSync("qa/u2v2-pilot.ts", "utf8").replace(/\r\n/g, "\n");
const hStart = pilotSrc.indexOf("const SYM = [");
const hEnd = pilotSrc.indexOf(`const L1 = "u2l1";`);
if (hStart < 0 || hEnd < 0) throw new Error("파일럿 헬퍼 구간 마커를 찾지 못함");
let helperBlock = pilotSrc.slice(hStart, hEnd).trimEnd();
// 스테이징 로컬 이름을 섹션 전용으로(공용 파일 전역 충돌 방지 · u1 v2 wrapKo 관행)
for (const [from, to] of [
  ["wrapKo", "u2WrapKo"], ["SYM", "U2SYM"], ["PAREN", "U2PAREN"], ["RANKS", "U2RANKS"],
  ["OL_A", "U2_OL_A"], ["OL_P", "U2_OL_P"],
  ["KQ_Q", "U2_KQ_Q"], ["KQ_SIDE", "U2_KQ_SIDE"], ["KQ_LEAF", "U2_KQ_LEAF"], ["KQ_LAST", "U2_KQ_LAST"],
  ["ShapeKey", "U2ShapeKey"], ["ScopePart", "U2ScopePart"],
]) {
  helperBlock = helperBlock.replace(new RegExp(`\\b${from}\\b`, "g"), to);
}

const FIG = "src/ui/examFigures.ts";
let fig = readFileSync(FIG, "utf8").replace(/\r\n/g, "\n");
// ⚠ 섹션 교체는 반드시 시작·종료 마커 "사이"만 · "마커 이후 전부"로 지우면 그 뒤에 다른 세션이
// append한 섹션을 통째로 삼킨다(2026-08-01 u1 v2 §13 실사고: 타 세션 헬퍼 33종 소실).
const MARK = "// == u2 v2 신작(파일럿 승격 · 재출제 13호) ==";
const ENDMARK = "// == u2 v2 섹션 끝 ==";
const promoted = `${MARK}\n// 크기 띠·세포 한 개와 여럿·표본 단계·모양 카드·혈관 단면·구성 단계 사다리·분포 자료·\n// 특징 분포 막대·분류 중첩도·이분 순서도·5계 검색표·먹이 그물·서식지 분단.\n// 전부 파라미터형 · aria는 파라미터에서 파생 · 전 그림 의존 설계.\n// (세포 구조는 SVG 도해가 아니라 발주 실사 + 기호 배지 = 레슨 파일 로컬 cellPhotoFig가 담당한다.)\n${helperBlock}\n${ENDMARK}\n`;
const si = fig.indexOf(MARK);
if (si >= 0) {
  const ei = fig.indexOf(ENDMARK, si);
  if (ei < 0) throw new Error(`${FIG}: 시작 마커는 있는데 종료 마커가 없다 · 수동 확인 필요(다른 섹션 삼킴 위험)`);
  fig = fig.slice(0, si) + promoted + fig.slice(ei + ENDMARK.length + 1);
} else {
  fig = fig.trimEnd() + "\n\n" + promoted;
}
writeFileSync(FIG, fig);
console.log("examFigures.ts: u2 v2 섹션 승격(신작 12종 · 마커 구간 교체)");

// ── 3. 레슨 파일 생성 ──
const BASE_SNIPPET = `const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";`;
const XIMG_SNIPPET = `const ximg = (file: string, alt: string): string =>
  \`<img src="\${IMG_BASE}exam/u2/\${file}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;`;
const BIMG_SNIPPET = `const bimg = (path: string, alt: string, ratio = "4 / 3"): string =>
  \`<img src="\${IMG_BASE}bio3/\${path}" alt="\${alt}" style="display:block;width:100%;aspect-ratio:\${ratio};object-fit:cover;border-radius:14px;background:#EEF1F4" />\`;`;
const XPAIR_SNIPPET = `const xpair = (a: [string, string], b: [string, string]): string =>
  \`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">\${[a, b]
    .map(
      ([f, alt], i) =>
        \`<figure style="margin:0;position:relative"><img src="\${IMG_BASE}exam/u2/\${f}" alt="\${alt}" style="display:block;width:100%;border-radius:12px" /><figcaption style="position:absolute;left:7px;top:7px;background:rgba(255,255,255,.94);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:900;color:#1F3A5F">\${
          i ? "(나)" : "(가)"
        }</figcaption></figure>\`,
    )
    .join("")}</div>\`;`;
const CELLPHOTO_SNIPPET = `/** 발주 세포 실사 위에 기호 배지를 얹는다(라스터+벡터 하이브리드 · SCI_GUIDE 관례).
 *  좌표는 "이미지 상자 기준 %"(0~100) · 배지는 여백으로 빼도 되게 음수·100 초과를 허용한다. */
const cellPhotoFig = (o: { photo: string; alt: string; marks: { sym: string; bx: number; by: number; tx: number; ty: number }[] }): string => {
  const ov = o.marks
    .map(
      (m) => \`<line x1="\${m.bx}" y1="\${m.by}" x2="\${m.tx}" y2="\${m.ty}" stroke="#20262E" stroke-width="0.8" stroke-linecap="round"/>
        <circle cx="\${m.tx}" cy="\${m.ty}" r="1.7" fill="#20262E"/>
        <circle cx="\${m.bx}" cy="\${m.by}" r="5.4" fill="#FFFFFF" stroke="#20262E" stroke-width="0.9"/>
        <text x="\${m.bx}" y="\${m.by + 2.3}" text-anchor="middle" font-size="6.4" font-weight="900" fill="#20262E">\${m.sym}</text>\`,
    )
    .join("");
  return \`<div style="position:relative;width:100%;background:#F4F7F6;border-radius:14px;padding:26px 0">
    <div style="position:relative;width:74%;margin:0 auto">
      <img src="\${IMG_BASE}bio3/\${o.photo}" alt="\${o.alt}" style="display:block;width:100%;border-radius:8px" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true">\${ov}</svg>
    </div>
  </div>\`;
};`;

const SHAPECARDS_SNIPPET = `/** 세포 모양 후보 카드 ①~⑤ · 발주 실사 5종을 3+2 격자로(라벨형 shuffle:false 전용). */
const cellShapeCardsFig = (shapes: { photo: string; alt: string }[]): string =>
  \`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">\${shapes
    .map(
      (s, i) =>
        \`<figure style="margin:0;position:relative"><img src="\${IMG_BASE}bio3/\${s.photo}" alt="\${s.alt}" style="display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;background:#F7F8FA" /><figcaption style="position:absolute;left:6px;top:6px;background:rgba(255,255,255,.95);border-radius:999px;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;font-weight:900;color:#20262E;box-shadow:0 1px 4px rgba(10,20,40,.22)">\${"①②③④⑤"[i]}</figcaption></figure>\`,
    )
    .join("")}</div>\`;`;

let fails = 0;
for (const [lid, L] of Object.entries(LESSON)) {
  const want = L.end - L.start + 1;
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  if (FULL) {
    if (arr.length !== want) { console.error(`FAIL ${lid}: ${arr.length}문항 ≠ ${want}`); fails++; continue; }
    for (let s = L.start; s <= L.end; s++) if (!arr.some((b) => b.slot === s)) { console.error(`FAIL ${lid}: 슬롯 ${s} 누락`); fails++; }
  } else if (!arr.length) { console.error(`FAIL ${lid}: 문항 0`); fails++; continue; }
  const body = arr.map((b) => b.text).join("\n");
  const usedExam = EXAM_HELPERS.filter((h) => new RegExp(`\\b${h}\\(`).test(body));
  const usedBio3 = BIO3_HELPERS.filter((h) => new RegExp(`\\b${h}\\(`).test(body));
  const n = Number(lid.replace("u2l", ""));
  const header = `// 중1 과학 Ⅱ. 생물의 구성과 다양성 · 단원 종합 평가 풀 v2: 레슨 ${n} ${L.label} (u2e${L.start}~e${L.end}${FULL ? "" : " 중 " + arr.length + "문항"})
// ⚠ 이 파일은 qa/build-u2v2-lessons.mjs가 스테이징(qa/u2v2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 교과서 3사 준거 전면 재출제(2026-08) · 정본 설계표 qa/u2-v2-blueprint.md(실측·회피표·검산 기록).
// 규격: num 0 · word 0(3사 실측 계산 0/39 · 개수 세기 0/39) · diff 태그 · 전 그림 의존 설계.
// 언어 가드 금지어 목록은 설계표 §0-3이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).`;
  const importLines = [`import type { ExamItem } from "./types";`];
  if (usedExam.length) importLines.push(`import { ${usedExam.join(", ")} } from "../../ui/examFigures";`);
  if (usedBio3.length) importLines.push(`import { ${usedBio3.join(", ")} } from "../../ui/bio3Figures";`);
  const local = [`const L = "${lid}";`];
  // 스니펫 검출은 문항 본문뿐 아니라 **함께 심을 로컬 const 본문까지** 훑는다 —
  // ecoPair처럼 로컬 헬퍼가 bimg를 감싸 쓰면 본문만 봐서는 bimg가 안 잡혀 tsc가 죽는다(실사고).
  const usedLocals = locals.filter((c) => new RegExp(`\\b${c.name}\\b`).test(body));
  const scan = `${body}\n${usedLocals.map((c) => c.text).join("\n")}`;
  const needsBase = /\bximg\(|\bbimg\(|\bxpair\(|\bcellPhotoFig\(|\bcellShapeCardsFig\(/.test(scan);
  if (needsBase) local.push(BASE_SNIPPET);
  if (/\bximg\(/.test(scan)) local.push(XIMG_SNIPPET);
  if (/\bbimg\(/.test(scan)) local.push(BIMG_SNIPPET);
  if (/\bxpair\(/.test(scan)) local.push(XPAIR_SNIPPET);
  if (/\bcellPhotoFig\(/.test(scan)) local.push(CELLPHOTO_SNIPPET);
  if (/\bcellShapeCardsFig\(/.test(scan)) local.push(SHAPECARDS_SNIPPET);
  for (const c of usedLocals) local.push(c.text);
  const bodyL = body.replaceAll(`lessonId: L${n},`, "lessonId: L,");
  const out = `${header}\n${importLines.join("\n")}\n\n${local.join("\n")}\n\nexport const POOL_U2L${n}: ExamItem[] = [\n${bodyL}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts 생성(${arr.length}문항 · examFigures ${usedExam.length}종${usedBio3.length ? " + bio3 " + usedBio3.length : ""}${needsBase ? " +사진" : ""})`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }

// ── 4. 조립 파일 ──
const asm = `// 중1 과학 Ⅱ. 생물의 구성과 다양성 · 단원 종합 평가 문항 풀 v2(160제 = 16×10, 레슨 1:1).
// 문항은 레슨 파일(u2l1~u2l10)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 140 / multi 20 / num 0 / word 0 · diff 64/64/32 · 시각 100(도해·순서도·검색표·분포 자료·실사).
// 구 풀 120제(u2e01~e120 · 6파일)는 2026-08 전량 폐기 · id 대역을 e201~e360으로 분리했다.
// 규격·회피표·검산 기록 정본 = qa/u2-v2-blueprint.md, 이식 = qa/build-u2v2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
${Object.keys(LESSON).map((lid) => `import { POOL_U2L${lid.replace("u2l", "")} } from "./${lid}";`).join("\n")}

export const U2_EXAM: ExamDef = {
  id: "u2exam",
  unitId: "u2",
  title: "생물의 구성과 다양성",
  pick: 20,
  pool: [${Object.keys(LESSON).map((lid) => `...POOL_U2L${lid.replace("u2l", "")}`).join(", ")}],
};
`;
writeFileSync("src/content/exams/u2.ts", asm);
console.log(`u2.ts 조립 ${FULL ? "완료(160문항)" : "생성(부분 " + blocks.length + "문항)"}`);
console.log("→ 이제 반드시 `npx tsc --noEmit` 을 돌린다(공유 파일 examFigures.ts 승격 검증).");
