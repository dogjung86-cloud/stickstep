// m1u3 v2 이식 생성기(m1u6판 계승): 스테이징 qa/m1u3v2-{pilot,rest-a~e}.ts의 문항 블록을
// 슬롯 순으로 재조립해 src/content/exams/m1u3l1~l9.ts를 재생성한다. 재실행 가능(멱등).
// 수정은 반드시 스테이징 파일에서 한 뒤 이 스크립트를 다시 돌린다(레슨 파일 직접 수정 금지).
// m1u6판과의 차이 2가지:
//  ① 로컬 헬퍼 분배 · 스테이징마다 withVars의 변수 집합이 다르다([xy]~[xyabck]) → 레슨별 합집합
//    정의로 통합하되, 전 withVars("리터럴") 호출을 원본 집합·합집합 양쪽으로 재래핑해 결과가
//    바이트 동일함을 기계 증명한다(다르면 FAIL — 파일럿 눈검수본과 렌더가 달라지는 사고 차단).
//  ② 신작 헬퍼 승격 · 파일럿 로컬 nlFig·rdFig 호출을 examFiguresMath의 mExamNumLineFig·
//    mExamInvRectFig로 치환한다(승격 이식은 examFiguresMath.ts "m1u3 v2" 섹션이 담당).
// node qa/build-m1u3v2-lessons.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = [
  "qa/m1u3v2-pilot.ts",
  "qa/m1u3v2-rest-a.ts",
  "qa/m1u3v2-rest-b.ts",
  "qa/m1u3v2-rest-c.ts",
  "qa/m1u3v2-rest-d.ts",
  "qa/m1u3v2-rest-e.ts",
];
const LESSON = {
  m1u3l1: { start: 1, end: 22, label: "좌표: 위치를 수의 쌍으로", book: "책 104~107쪽", m: 11, M: 2, n: 9, d: [9, 9, 4], fig: 12 },
  m1u3l2: { start: 23, end: 44, label: "사분면: 부호의 네 구역", book: "책 108~109쪽", m: 11, M: 2, n: 9, d: [9, 9, 4], fig: 5 },
  m1u3l3: { start: 45, end: 66, label: "그래프: 변화를 그림 한 장으로", book: "책 110~112쪽", m: 11, M: 2, n: 9, d: [9, 9, 4], fig: 16 },
  m1u3l4: { start: 67, end: 89, label: "그래프 해석: 선 하나에 담긴 이야기", book: "책 113~117쪽", m: 11, M: 3, n: 9, d: [9, 9, 5], fig: 20 },
  m1u3l5: { start: 90, end: 111, label: "정비례: 2배는 2배를 부른다", book: "책 118~122쪽", m: 11, M: 2, n: 9, d: [9, 9, 4], fig: 6 },
  m1u3l6: { start: 112, end: 133, label: "정비례 그래프: 원점을 지나는 직선", book: "책 123~125쪽", m: 11, M: 2, n: 9, d: [9, 8, 5], fig: 13 },
  m1u3l7: { start: 134, end: 155, label: "반비례: 곱이 일정한 관계", book: "책 126~128쪽", m: 11, M: 2, n: 9, d: [9, 9, 4], fig: 5 },
  m1u3l8: { start: 156, end: 177, label: "반비례 그래프: 한 쌍의 매끄러운 곡선", book: "책 129~131쪽", m: 11, M: 2, n: 9, d: [8, 9, 5], fig: 14 },
  m1u3l9: { start: 178, end: 200, label: "정비례와 그래프의 활용", book: "책 132~139쪽", m: 11, M: 3, n: 9, d: [9, 9, 5], fig: 14 },
};
// 생성 파일 임포트 후보(본문·분배 const에서 사용 감지된 것만 임포트)
const KIT_FNS = ["planeSpec"];
const MATH_FIGS = ["miniGraphRow"];
const EXAM_FNS = ["mExamChangeGraphFig", "mExamPlaneFig", "mExamRelChoicesFig", "mExamRelationPlaneFig", "mExamTableFig", "mExamNumLineFig", "mExamInvRectFig"];
const EXAM_TYPES = ["MExamPlaneSpec", "MExamRelationPlaneSpec", "MExamChangeGraphSpec"];
// 승격 치환: 파일럿 로컬 이름 → examFiguresMath 정식 이름
const PROMOTE = { nlFig: "mExamNumLineFig", rdFig: "mExamInvRectFig" };
// withVars 합집합 전환 수용 슬롯: s131은 확대 중 재설계로 변수 k가 파일럿에 들어왔는데 파일럿
// 클래스([xyab])에 k가 없어 비이탤릭으로 렌더되던 잠복 표기 결함 · 합집합([xyabk]) 전환이 곧
// 교정이다(같은 레슨 rest-c 문항들은 k 이탤릭 — 변수 mv 이탤릭 관행 통일). 갤러리 재확인 대상.
const WAIVE_UNION = new Set(["m1u3e131"]);

let fails = 0;
const fail = (m) => { console.error("FAIL", m); fails += 1; };

// ── 스테이징 파싱: 블록(2칸 "  {" ~ "  },")·톱레벨 const·withVars 클래스 ──
const blocks = [];
const constDefs = new Map(); // name → { file, text }
const fileClass = new Map(); // file → withVars 문자 클래스(예: "xyabck")
for (const p of SRC) {
  const src = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const cls = src.match(/^const withVars[\s\S]*?\/\[([a-z]+)\]\/g/m)?.[1];
  if (!cls) fail(`${p}: withVars 클래스 추출 실패`);
  fileClass.set(p, cls ?? "");
  const lines = src.split("\n");
  let cur = null;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (cur) {
      cur.push(line);
      if (line === "  },") {
        const text = cur.join("\n");
        const id = text.match(/id: "(m1u3e\d{3})"/)?.[1];
        const lessonId = text.match(/lessonId: "(m1u3l\d)"/)?.[1];
        if (!id || !lessonId) throw new Error(`${p}: 블록 파싱 실패\n${text.slice(0, 160)}`);
        blocks.push({ slot: Number(id.replace("m1u3e", "")), id, lessonId, file: p, text });
        cur = null;
      }
      continue;
    }
    if (line === "  {") { cur = [line]; continue; }
    const cm = line.match(/^(?:export )?const ([A-Za-z0-9_]+)/);
    if (cm && !cm[1].startsWith("POOL_") && !(cm[1] in PROMOTE)) {
      // 정의 텍스트 캡처: 시작 줄부터 괄호 균형이 0으로 돌아오며 ;로 끝나는 줄까지
      let bal = 0;
      const buf = [];
      for (let j = i; j < lines.length; j += 1) {
        const l = lines[j];
        buf.push(l.replace(/^export /, ""));
        for (const ch of l) {
          if (ch === "{" || ch === "(" || ch === "[") bal += 1;
          else if (ch === "}" || ch === ")" || ch === "]") bal -= 1;
        }
        if (bal <= 0 && /;\s*$/.test(l)) { i = j; break; }
      }
      constDefs.set(`${p}::${cm[1]}`, { file: p, name: cm[1], text: buf.join("\n") });
    }
  }
}
if (blocks.length !== 200) fail(`블록 ${blocks.length}개 != 200`);

// ── withVars 합집합 동등성 기계 증명(레슨별) ──
const wrap = (s, cls) => s.replace(new RegExp(`[${cls}]`, "g"), (v) => `<i class='mv'>${v}</i>`);
const unionClassOf = (files) => {
  const set = new Set();
  for (const f of files) for (const ch of fileClass.get(f) ?? "") set.add(ch);
  return ["x", "y", ...[...set].filter((c) => c !== "x" && c !== "y").sort()].join("");
};

// ── 레슨별 조립·검산·쓰기 ──
for (const [lid, L] of Object.entries(LESSON)) {
  const arr = blocks.filter((b) => b.lessonId === lid).sort((a, b) => a.slot - b.slot);
  const want = L.end - L.start + 1;
  if (arr.length !== want) { fail(`${lid}: ${arr.length}문항 != ${want}`); continue; }
  for (let s = L.start; s <= L.end; s += 1) if (!arr.some((b) => b.slot === s)) fail(`${lid}: 슬롯 ${s} 누락`);

  const srcFiles = [...new Set(arr.map((b) => b.file))];
  const uCls = unionClassOf(srcFiles);
  // 동등성 증명: 각 블록의 withVars("리터럴") 인자를 원본 클래스·합집합 클래스로 각각 래핑해 비교
  for (const b of arr) {
    const own = fileClass.get(b.file) ?? "";
    const litCalls = [...b.text.matchAll(/withVars\("([^"]*)"\)/g)];
    const allCalls = [...b.text.matchAll(/withVars\(/g)];
    if (litCalls.length !== allCalls.length) fail(`${b.id}: withVars 비리터럴 호출 존재(수동 확인 필요)`);
    for (const c of litCalls) {
      if (wrap(c[1], own) !== wrap(c[1], uCls)) {
        if (WAIVE_UNION.has(b.id)) console.log(`  waive ${b.id}: "${c[1]}" 합집합 전환 수용(변수 이탤릭 통일 교정)`);
        else fail(`${b.id}: withVars 합집합 전환 시 렌더 변화 "${c[1]}" (own [${own}] vs union [${uCls}])`);
      }
    }
  }
  let body = arr.map((b) => b.text).join("\n");
  for (const [from, to] of Object.entries(PROMOTE)) body = body.replaceAll(`${from}(`, `${to}(`);

  // 로컬 const 분배: 본문에서 이름이 실제 쓰인 것만, 블록 출처 파일 우선으로 1회 포함.
  // 간접 의존(coord → minus)까지 고정점 반복으로 닫는다.
  const picked = [];
  const pickedNames = new Set();
  let grew = true;
  while (grew) {
    grew = false;
    const scan = body + picked.join("\n");
    for (const f of srcFiles) {
      for (const def of constDefs.values()) {
        if (def.file !== f || pickedNames.has(def.name)) continue;
        if (def.name === "withVars") continue; // 아래에서 합집합판 단일 정의
        if (new RegExp(`\\b${def.name}\\b`).test(scan)) { picked.push(def.text); pickedNames.add(def.name); grew = true; }
      }
    }
  }
  // 정의 순서: 헬퍼(민자 함수)가 spec보다 앞에 오도록 참조 역순 정렬(minus가 coord보다 먼저)
  picked.sort((a, b) => {
    const an = a.match(/^const (\w+)/)?.[1] ?? "";
    const bn = b.match(/^const (\w+)/)?.[1] ?? "";
    const aRefsB = new RegExp(`\\b${bn}\\b`).test(a.slice(a.indexOf("=")));
    const bRefsA = new RegExp(`\\b${an}\\b`).test(b.slice(b.indexOf("=")));
    if (aRefsB && !bRefsA) return 1;
    if (bRefsA && !aRefsB) return -1;
    return 0;
  });
  const needWithVars = /\bwithVars\(/.test(body);
  const helperBlock = [
    ...(needWithVars
      ? [`const withVars = (text: string): string =>\n  text.replace(/[${uCls}]/g, (variable) => \`<i class='mv'>\${variable}</i>\`);`]
      : []),
    ...picked,
  ];
  // withVars 합집합판이 minus를 요구하진 않지만, 분배된 coord류가 minus를 참조하면 함께 왔는지 검사
  const merged = helperBlock.join("\n") + body;
  for (const nm of ["minus", "coord", "coordPair"]) {
    if (new RegExp(`\\b${nm}\\(`).test(merged) && !helperBlock.some((t) => t.startsWith(`const ${nm} `)))
      fail(`${lid}: ${nm} 사용처가 있는데 정의 미분배`);
  }

  const cnt = { mcq: 0, multi: 0, num: 0, word: 0 };
  const d = { 1: 0, 2: 0, 3: 0 };
  let fig = 0;
  for (const b of arr) {
    cnt[b.text.match(/type: "(\w+)"/)?.[1]] += 1;
    d[b.text.match(/diff: (\d)/)?.[1]] += 1;
    if (/\n\s*figure:/.test(b.text)) fig += 1;
  }
  if (cnt.word) fail(`${lid}: word ${cnt.word}문항(v2는 0)`);
  if (cnt.mcq !== L.m || cnt.multi !== L.M || cnt.num !== L.n) fail(`${lid}: 유형 ${cnt.mcq}/${cnt.multi}/${cnt.num} != ${L.m}/${L.M}/${L.n}`);
  if (d[1] !== L.d[0] || d[2] !== L.d[1] || d[3] !== L.d[2]) fail(`${lid}: diff ${d[1]}/${d[2]}/${d[3]} != ${L.d.join("/")}`);
  if (fig !== L.fig) fail(`${lid}: 그림 ${fig} != ${L.fig}`);

  const usedKit = KIT_FNS.filter((f) => merged.includes(`${f}(`));
  const usedMath = MATH_FIGS.filter((f) => merged.includes(`${f}(`));
  const usedExamFns = EXAM_FNS.filter((f) => merged.includes(`${f}(`));
  const usedExamTypes = EXAM_TYPES.filter((t) => new RegExp(`: ${t}\\b`).test(merged));
  const examImports = [...usedExamFns, ...usedExamTypes.map((t) => `type ${t}`)];
  const n = lid.replace("m1u3l", "");
  let out = `// 수학 중1 Ⅲ. 좌표평면과 그래프 v2 재출제 문항 풀 · L${n} ${L.label}(${L.book}) 슬롯 ${L.start}~${L.end}(${want}문항).\n`;
  out += `// 생성 파일: 수정은 qa/m1u3v2-*.ts(스테이징 정본)에서 한 뒤 node qa/build-m1u3v2-lessons.mjs 재실행.\n`;
  out += `// 규격 v2(정본 qa/m1u3-v2-blueprint.md · §3-0 우선): mcq ${L.m}/multi ${L.M}/num ${L.n}·word 0 · diff ${L.d.join("/")} ·\n`;
  out += `// 그림 ${L.fig} · mfmt 미사용(slash 분수·withVars·U+2212) · 무그림은 화이트리스트 사유 태그 · em대시 금지.\n`;
  out += `import type { ExamItem } from "./types";\n`;
  if (usedKit.length) out += `import { ${usedKit.join(", ")} } from "../../ui/mathKit";\n`;
  if (usedMath.length) out += `import { ${usedMath.join(", ")} } from "../../ui/mathFigures";\n`;
  if (examImports.length) out += `import { ${examImports.join(", ")} } from "../../ui/examFiguresMath";\n`;
  if (helperBlock.length) out += `\n${helperBlock.join("\n")}\n`;
  out += `\nexport const POOL_M1U3L${n}: ExamItem[] = [\n${body}\n];\n`;
  writeFileSync(`src/content/exams/${lid}.ts`, out);
  console.log(`${lid}: ${want}문항 · m${cnt.mcq}/M${cnt.multi}/n${cnt.num} · diff ${d[1]}/${d[2]}/${d[3]} · 그림 ${fig} · withVars [${uCls}] → src/content/exams/${lid}.ts`);
}
if (fails) { console.error(`${fails} FAIL`); process.exit(1); }
console.log("이식 완료(200문항). 다음: node qa/check-exam-m1u3.mjs");
