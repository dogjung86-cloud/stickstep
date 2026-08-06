// s1u1 v1 이식 생성기 — 스테이징(qa/s1u1-pilot.ts + s1u1-rest-a~f.ts) → content/exams/s1u1l1~l6.ts + s1u1.ts.
// 멱등(레슨·조립 파일 전량 재생성 · 직접 수정 금지 — 수정은 스테이징에서 후 재실행).
// index.ts 등록은 공유 파일이라 자동화하지 않는다(수동 1줄 · 커밋 시 타 세션 WIP 확인).
// 실행 직후 tsc 의무(공유 파일 생성기 관행 · EXAM_GUIDE u1 v2 §13).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = [
  "qa/s1u1-pilot.ts",
  "qa/s1u1-rest-a.ts",
  "qa/s1u1-rest-b.ts",
  "qa/s1u1-rest-c.ts",
  "qa/s1u1-rest-d.ts",
  "qa/s1u1-rest-e.ts",
  "qa/s1u1-rest-f.ts",
].filter((p) => existsSync(p));
const FULL = SRC.length === 7;

const LESSONS = [
  { n: 1, start: 1, end: 27 },
  { n: 2, start: 28, end: 54 },
  { n: 3, start: 55, end: 81 },
  { n: 4, start: 82, end: 107 },
  { n: 5, start: 108, end: 134 },
  { n: 6, start: 135, end: 160 },
];

// 헬퍼 import 후보(레슨 파일별로 실사용만 임포트)
const SOC_FIGS = ["climateMapFig", "gerFig", "jeansFig", "terrainFig"];
const EXAM_FIGS = [
  "socWorldFig", "socLatBeamFig", "socLifeSceneFig", "socEraCardsFig", "socTimeBarsFig",
  "socScaleRingsFig", "socTableFig", "socChatFig", "socFlowFig", "socStrategySceneFig", "socDbox",
];

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
        const id = text.match(/id: "(s1u1e\d{3})"/)?.[1];
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
  if (dup.length) throw new Error(`s1u1l${l.n}: id 중복 ${dup.map((d) => d.id).join(",")}`);
  if (FULL && items.length !== l.end - l.start + 1)
    throw new Error(`s1u1l${l.n}: ${items.length}문항(기대 ${l.end - l.start + 1})`);
  const body = items.map((it) => it.text).join("\n");
  const usedSoc = SOC_FIGS.filter((f) => new RegExp(`\\b${f}\\(`).test(body));
  const usedExam = EXAM_FIGS.filter((f) => new RegExp(`\\b${f}\\(`).test(body));
  const imports = [
    `import type { ExamItem } from "./types";`,
    usedSoc.length ? `import { ${usedSoc.join(", ")} } from "../../ui/socFigures";` : "",
    usedExam.length ? `import { ${usedExam.join(", ")} } from "../../ui/examFiguresSoc";` : "",
  ].filter(Boolean).join("\n");
  const out = `// 중1 사회 I. 세계화 시대, 지리의 힘 · 단원 종합 평가 풀 v1: 레슨 ${l.n} (s1u1e${String(l.start).padStart(3, "0")}~e${String(l.end).padStart(3, "0")})
// ! 이 파일은 qa/build-s1u1-lessons.mjs가 스테이징(qa/s1u1-*.ts)에서 재생성한다 · 직접 수정 금지.
// 사회 트랙 첫 시험 풀(2026-08) · 정본 설계표 qa/s1u1-v1-blueprint.md(실측·회피표·검산 기록).
// 규격: num 0(실측 계산 0/11) · word 16(비상 용어 단답 실측 계승) · bogi 4보기(ㄱㄴㄷㄹ) · diff 태그.
// 언어 가드 금지어는 설계표 §6이 정본(검사기가 소스 전체를 스캔하므로 여기 나열하지 않는다).
${imports}

const L = "s1u1l${l.n}";

export const POOL_S1U1L${l.n}: ExamItem[] = [
${body}
];
`;
  writeFileSync(`src/content/exams/s1u1l${l.n}.ts`, out);
  console.log(`s1u1l${l.n}.ts: ${items.length}문항`);
}

const asm = `// 중1 사회 I. 세계화 시대, 지리의 힘 · 단원 종합 평가 문항 풀 v1(160제 = 27x4+26x2, 6레슨 · 사회 첫 시험).
// 문항은 레슨 파일(s1u1l1~l6)에 산다. 풀 등장 순서 = 교과 진도 순서(추출·시험지 정렬의 기준).
// 유형 구성: mcq 128(bogi 24) / multi 16 / num 0 / word 16 · diff 64/64/32 · 시각은 설계표 §4 정본.
// 규격·회피표·검산 기록 정본 = qa/s1u1-v1-blueprint.md, 이식 = qa/build-s1u1-lessons.mjs(재실행 가능).
import type { ExamDef } from "./types";
import { POOL_S1U1L1 } from "./s1u1l1";
import { POOL_S1U1L2 } from "./s1u1l2";
import { POOL_S1U1L3 } from "./s1u1l3";
import { POOL_S1U1L4 } from "./s1u1l4";
import { POOL_S1U1L5 } from "./s1u1l5";
import { POOL_S1U1L6 } from "./s1u1l6";

export const S1U1_EXAM: ExamDef = {
  id: "s1u1exam",
  unitId: "s1u1",
  title: "세계화 시대, 지리의 힘",
  pick: 20,
  pool: [...POOL_S1U1L1, ...POOL_S1U1L2, ...POOL_S1U1L3, ...POOL_S1U1L4, ...POOL_S1U1L5, ...POOL_S1U1L6],
};
`;
writeFileSync("src/content/exams/s1u1.ts", asm);
console.log(`s1u1.ts 조립 완료 · 총 ${total}문항${FULL ? "(전수)" : "(부분 — 스테이징 " + SRC.length + "/7)"}`);
console.log("다음 순서: index.ts 등록(수동 1줄) → npx tsc --noEmit");
