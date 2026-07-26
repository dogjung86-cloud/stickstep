// g2u2 v2 이식 생성기 — 스테이징(qa/g2u2v2-pilot.ts + rest-a~e.ts)에서 문항 블록을 잘라
// src/content/exams/g2u2l1~l9.ts를 재생성한다(레슨 파일 직접 수정 금지 — 수정은 스테이징에서, 재실행 가능).
// 헬퍼 참조는 승격본(ui/examFigures.ts "g2u2 v2" 섹션)·geoFigures import로 재작성, pic 계열은 파일 로컬 복제.
// node qa/build-g2u2v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = ["qa/g2u2v2-pilot.ts", "qa/g2u2v2-rest-a.ts", "qa/g2u2v2-rest-b.ts", "qa/g2u2v2-rest-c.ts", "qa/g2u2v2-rest-d.ts", "qa/g2u2v2-rest-e.ts"];

// 스테이징 전체에서 문항 블록(들여쓰기 2의 "  {" ~ 짝 맞는 "  },")을 id와 함께 수집
const items = new Map(); // id → block text
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const arrStart = src.indexOf("ExamItem[] = [");
  const body = src.slice(src.indexOf("[", arrStart) + 1, src.lastIndexOf("];"));
  // 블록 분리: 최상위 "  {"에서 시작해 중괄호 짝으로 끝 찾기
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
    const id = block.match(/id: "(g2u2e\d{3})"/)?.[1];
    if (id) items.set(id, block);
    i = j + 1;
  }
}
if (items.size !== 160) {
  console.error(`문항 ${items.size} ≠ 160 — 이식 중단`);
  process.exit(1);
}

const LESSONS = [
  ["g2u2l1", 201, 218, "지구계와 지구 내부"],
  ["g2u2l2", 219, 236, "광물의 특성"],
  ["g2u2l3", 237, 254, "화성암"],
  ["g2u2l4", 255, 271, "퇴적암"],
  ["g2u2l5", 272, 288, "변성암"],
  ["g2u2l6", 289, 306, "암석의 순환"],
  ["g2u2l7", 307, 324, "풍화와 토양"],
  ["g2u2l8", 325, 342, "대륙 이동설"],
  ["g2u2l9", 343, 360, "판의 경계"],
];

// import 매핑: 심벌 → 모듈
const FROM_EXAM = ["svgTable", "geoCycleQuizFig", "geoRockFlowFig", "geoDriftRateFig", "geoMagmaSiteFig", "geoKeyFiveFig", "geoQuakeBeltFig", "geoTwinMapsFig", "geoPlateArrowsFig", "geoCoastFitFig", "geoDriftPanelsFig", "geoPressFig", "geoPlateQuizFig", "geoGlacierMapFig"];
const FROM_GEO = ["earthLayersFig", "igneousGridFig", "soilLayersFig"];

const BASE_LOCAL = `
const IMG_BASE = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";
`;
const PIC_LOCAL = `
/** 실사 사진 임베드 — loading=lazy 금지(사고 #14). alt에 암석·광물 이름 등 정답 금지(관찰 서술만). */
const pic = (path: string, alt: string): string =>
  \`<img src="\${IMG_BASE}\${path}" alt="\${alt}" style="display:block;width:100%;border-radius:14px" />\`;
`;
const PIC2_LOCAL = `
/** 사진 2연((가)(나) 라벨 필) — 비교 관찰 문항용. */
const pic2 = (a: [string, string], b: [string, string], la = "(가)", lb = "(나)"): string => {
  const cell = (p: [string, string], label: string): string =>
    \`<span style="position:relative;display:block"><img src="\${IMG_BASE}\${p[0]}" alt="\${p[1]}" style="display:block;width:100%;border-radius:12px" /><b style="position:absolute;left:8px;top:8px;background:rgba(255,255,255,.94);border:1px solid #C4CAD2;border-radius:10px;padding:1px 8px;font-size:12px;font-weight:800;color:#4E5968">\${label}</b></span>\`;
  return \`<span style="display:grid;grid-template-columns:1fr 1fr;gap:8px">\${cell(a, la)}\${cell(b, lb)}</span>\`;
};
`;
const PIC3_LOCAL = `
/** 사진 3연((가)(나)(다)) — 구성 광물 관찰 등. */
const pic3 = (a: [string, string], b: [string, string], c: [string, string]): string => {
  const cell = (p: [string, string], label: string): string =>
    \`<span style="position:relative;display:block"><img src="\${IMG_BASE}\${p[0]}" alt="\${p[1]}" style="display:block;width:100%;border-radius:12px" /><b style="position:absolute;left:6px;top:6px;background:rgba(255,255,255,.94);border:1px solid #C4CAD2;border-radius:10px;padding:1px 7px;font-size:11.5px;font-weight:800;color:#4E5968">\${label}</b></span>\`;
  return \`<span style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">\${cell(a, "(가)")}\${cell(b, "(나)")}\${cell(c, "(다)")}</span>\`;
};
`;

for (const [lid, s, e, title] of LESSONS) {
  const blocks = [];
  for (let n = s; n <= e; n++) {
    const id = `g2u2e${n}`;
    const b = items.get(id);
    if (!b) {
      console.error(`누락: ${id}`);
      process.exit(1);
    }
    blocks.push("  " + b.replace(/drFig\(/g, "geoDriftRateFig("));
  }
  let body = blocks.join(",\n") + ",";
  const used = (sym) => new RegExp(`\\b${sym}\\(`).test(body);
  const exImports = FROM_EXAM.filter(used);
  const geoImports = FROM_GEO.filter(used);
  let helpers = "";
  const usePic = used("pic");
  const usePic2 = used("pic2");
  const usePic3 = used("pic3");
  if (usePic || usePic2 || usePic3) {
    helpers = BASE_LOCAL + (usePic ? PIC_LOCAL : "") + (usePic2 ? PIC2_LOCAL : "") + (usePic3 ? PIC3_LOCAL : "");
  }
  const importLines = [
    'import type { ExamItem } from "./types";',
    geoImports.length ? `import { ${geoImports.join(", ")} } from "../../ui/geoFigures";` : "",
    exImports.length ? `import { ${exImports.join(", ")} } from "../../ui/examFigures";` : "",
  ].filter(Boolean).join("\n");
  const header = `// 중2 II. 지권의 변화 — 단원 종합 평가 풀 v2: ${title} (g2u2e${s}~e${e})
// 2026-07-26 교과서 준거 전면 재출제(과학 재출제 1호) — 정본 소스는 qa/g2u2v2-*.ts 스테이징,
// 이 파일은 qa/build-g2u2v2-lessons.mjs가 재생성한다(직접 수정 금지 — 수정은 스테이징에서).
// 규격·회피표·검산 기록 = qa/g2u2-v2-blueprint.md, 관행 = EXAM_GUIDE.md "g2u2 v2" 항목.
`;
  const out = `${header}${importLines}
${helpers}
export const POOL_${lid.toUpperCase()}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}.ts — ${e - s + 1}문항`);
}

// 조립 파일 주석 갱신(구조 불변 — 문항 수만)
const asm = readFileSync("src/content/exams/g2u2.ts", "utf8").replace(/\r\n/g, "\n")
  .replace(/^\/\/ 중2 과학 II.*\n\/\/ 문항은 레슨 파일.*\n\/\/ 유형 구성.*\n/m,
    `// 중2 과학 II. 지권의 변화 — 단원 종합 평가 문항 풀 v2(160제 = 18×7 + 17×2, 9레슨 — 17은 L4·L5).
// 문항은 레슨 파일(g2u2l1~g2u2l9)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 2026-07 교과서 준거 재출제 1호: mcq 140/multi 20/num 0/word 0 — 정본 기록은 qa/g2u2-v2-blueprint.md.
`);
writeFileSync("src/content/exams/g2u2.ts", asm);
console.log("g2u2.ts 헤더 갱신");
