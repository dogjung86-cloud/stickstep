// s1u2 v1 이식 생성기 — 스테이징(qa/s1u2-pilot.ts + s1u2-rest-a~h.ts) → content/exams/s1u2l1~l8.ts + s1u2.ts.
// 멱등(레슨·조립 파일 전량 재생성 · 직접 수정 금지 — 수정은 스테이징에서 후 재실행).
// index.ts 등록은 공유 파일이라 자동화하지 않는다(수동 1줄 · 커밋 시 타 세션 WIP 확인).
// 실행 직후 tsc 의무(공유 파일 생성기 관행 · EXAM_GUIDE u1 v2 §13).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = [
  "qa/s1u2-pilot.ts",
  "qa/s1u2-rest-a.ts",
  "qa/s1u2-rest-b.ts",
  "qa/s1u2-rest-c.ts",
  "qa/s1u2-rest-d.ts",
  "qa/s1u2-rest-e.ts",
  "qa/s1u2-rest-f.ts",
  "qa/s1u2-rest-g.ts",
  "qa/s1u2-rest-h.ts",
].filter((p) => existsSync(p));
const FULL = SRC.length === 9;

const LESSONS = [
  { n: 1, start: 1, end: 20 },
  { n: 2, start: 21, end: 40 },
  { n: 3, start: 41, end: 60 },
  { n: 4, start: 61, end: 80 },
  { n: 5, start: 81, end: 100 },
  { n: 6, start: 101, end: 120 },
  { n: 7, start: 121, end: 140 },
  { n: 8, start: 141, end: 160 },
];

// 헬퍼 import 후보(레슨 파일별로 실사용만 임포트)
const SOC2_FIGS = [
  "asiaRegionsFig", "asiaClimateFig", "monsoonPairFig", "religionMapFig",
  "asiaPopFig", "pyramidPairFig", "asiaIndustryFig", "factoryMoveFig",
];
const EXAM_FIGS = [
  "sxAsiaMapFig", "sxPyramidFig", "socTableFig", "socChatFig", "socFlowFig",
  "socDbox", "socLifeSceneFig", "socWorldFig",
];

const AIMG_HELPER = `const BASE = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
/** 기존 자산 재사용 사진(신규 발주 0 · 장당 1문항 · buddha.webp 금지) · lazy 금지, alt는 관찰 서술만. */
const aimg = (file: string, alt: string): string =>
  \`<img src="\${BASE}soc/asia/\${file}" alt="\${alt}" draggable="false" style="display:block;width:100%;border-radius:14px"/>\`;
`;

const byLesson = new Map(LESSONS.map((l) => [l.n, []]));
let total = 0;

for (const p of SRC) {
  const raw = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  let cur = null;
  for (const line of lines) {
    if (line === "  {") {
      cur = [line];
      continue;
    }
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(s1u2e\d{3})"/)?.[1];
        const lref = text.match(/lessonId: (L\d)/)?.[1];
        if (!id || !lref) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        const num = Number(id.slice(-3));
        const lesson = LESSONS.find((l) => num >= l.start && num <= l.end);
        if (!lesson) throw new Error(`${p}: ${id} 슬롯 대역 밖`);
        if (Number(lref.slice(1)) !== lesson.n) throw new Error(`${p}: ${id} lessonId(${lref})와 슬롯 대역 불일치`);
        byLesson.get(lesson.n).push({ id, num, text: text.replace(/lessonId: L\d/, "lessonId: L") });
        total++;
        cur = null;
      }
    }
  }
}

for (const l of LESSONS) {
  const items = byLesson.get(l.n);
  items.sort((a, b) => a.num - b.num);
  const dup = items.filter((it, i) => i > 0 && items[i - 1].id === it.id);
  if (dup.length) throw new Error(`s1u2l${l.n}: id 중복 ${dup.map((d) => d.id).join(",")}`);
  if (FULL && items.length !== l.end - l.start + 1)
    throw new Error(`s1u2l${l.n}: ${items.length}문항(기대 ${l.end - l.start + 1})`);
  const body = items.map((it) => it.text).join("\n");
  const usedSoc2 = SOC2_FIGS.filter((f) => new RegExp(`\\b${f}\\(`).test(body));
  const usedExam = EXAM_FIGS.filter((f) => new RegExp(`\\b${f}\\(`).test(body));
  const usesAimg = /\baimg\(/.test(body);
  const imports = [
    `import type { ExamItem } from "./types";`,
    usedSoc2.length ? `import { ${usedSoc2.join(", ")} } from "../../ui/socFigures2";` : "",
    usedExam.length ? `import { ${usedExam.join(", ")} } from "../../ui/examFiguresSoc";` : "",
  ].filter(Boolean).join("\n");
  const out = `// 중1 사회 II. 아시아 · 단원 종합 평가 풀 v1: 레슨 ${l.n} (s1u2e${String(l.start).padStart(3, "0")}~e${String(l.end).padStart(3, "0")})
// ! 이 파일은 qa/build-s1u2-lessons.mjs가 스테이징(qa/s1u2-*.ts)에서 재생성한다 · 직접 수정 금지.
// 사회 시험 2호(2026-08 · s1u1 v1 규격 계승) · 정본 설계표 qa/s1u2-v1-blueprint.md(실측·회피표·검산 기록).
// 규격: 20x8 균등 · num 0 · word 16(레슨당 2) · bogi 4보기(레슨당 3) · diff 8/8/4 · 사진은 기존 자산 재사용만.
// 언어 가드 금지어는 설계표 §6이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
${imports}

const L = "s1u2l${l.n}";
${usesAimg ? AIMG_HELPER : ""}
export const POOL_S1U2L${l.n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/s1u2l${l.n}.ts`, out);
  console.log(`s1u2l${l.n}.ts: ${items.length}문항`);
}

const asm = `// 중1 사회 II. 아시아 · 단원 종합 평가 문항 풀 v1(160제 = 20x8 균등, 8레슨 · 사회 시험 2호).
// 문항은 레슨 파일(s1u2l1~l8)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 128(bogi 24) / multi 16 / num 0 / word 16 · diff 64/64/32 · 시각은 설계표 §4 정본.
// 규격·회피표·검산 기록 정본 = qa/s1u2-v1-blueprint.md, 이식 = qa/build-s1u2-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_S1U2L1 } from "./s1u2l1";
import { POOL_S1U2L2 } from "./s1u2l2";
import { POOL_S1U2L3 } from "./s1u2l3";
import { POOL_S1U2L4 } from "./s1u2l4";
import { POOL_S1U2L5 } from "./s1u2l5";
import { POOL_S1U2L6 } from "./s1u2l6";
import { POOL_S1U2L7 } from "./s1u2l7";
import { POOL_S1U2L8 } from "./s1u2l8";

export const S1U2_EXAM: ExamDef = {
  id: "s1u2exam",
  unitId: "s1u2",
  title: "아시아",
  pick: 20,
  pool: [
    ...POOL_S1U2L1, ...POOL_S1U2L2, ...POOL_S1U2L3, ...POOL_S1U2L4,
    ...POOL_S1U2L5, ...POOL_S1U2L6, ...POOL_S1U2L7, ...POOL_S1U2L8,
  ],
};
`;
writeFileSync("src/content/exams/s1u2.ts", asm);
console.log(`s1u2.ts 조립 완료 · 총 ${total}문항${FULL ? "(전수)" : "(부분 — 스테이징 " + SRC.length + "/9)"}`);
console.log("다음 순서: index.ts 등록(수동 1줄) → npx tsc --noEmit");
