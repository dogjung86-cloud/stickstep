// 사회 Ⅹ 데이터 정합 검산 — "눈대중 0건" 규율의 정치과정 단원판(audit-soc9 계보).
//   ① judgeLab(JUDGES — Ⅹ 신규 ruleguard·polactor): answer·traps 키 정합 · 개념당 케이스 ≥1 ·
//      함정 카드 덱당 1 · 문장 중복 0 · final options ≥2(첫 항목=정답 규약).
//      ★ 4개념 judge 첫 사례 — 오답 개념 3종 traps 완비가 관례(cultview 2종 완비의 확장).
//   ② Ⅹ 전용 기함 랩: electLab ELECT_PHASES(6단계 · 단계 이름 순서 정확 · 판정 quiz 3곳 ·
//      options[0]=정답 · good≠wrong) + policyLab POLICY_PHASES(5단계 · 정거장 순서 = 교과서 도식 ·
//      판정 quiz 3곳 — 집약·결정·집행 담당 함정) + POLICY_FINALE(환류 — options[0]이 순환을 명명).
//   ③ 용어 표기 일치: 교과서 표기 기준 — '정치과정'(붙임)·'시민단체'(붙임)·'이익 집단'(띄움)·
//      '지방 자치'(띄움)·'보통/평등/직접/비밀 선거'(띄움)·'주민 투표/소환/청원'(띄움) 변형 0건 +
//      이모지 0 + UI 문구 '교과서' 0(주석 제외) + 출판사명 0 + 유혈 어휘 0(정치 단원 가드).
//   ④ 퀴즈 정합(unit10 실로드): mcq/multi answer 범위 · shuffle:false 첫 칸 정답 금지 ·
//      binSort bin 존재 · order ≥3 · pairMatch ≥3 · judgeLab def 존재 · recap 전 카드 more ≥300자+
//      미니아트+fun · 레슨마다 그림 문제 ≥1 · 능동형 ≥1 · 만화 말풍선 y≤45.
//   ⑤ 서사 배선: L1 훅이 Ⅸ outro 예고("목소리→정책")를 회수 + L7 outro가 Ⅺ(법) 예고.
//   ⑥ 에셋 존재: 개념 컷 u10l1~7.webp · 만화 s1u10l6/0~3.webp.
// node qa/audit-soc10-data.mjs
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let fails = 0;
let checks = 0;
const ok = (cond, msg) => {
  checks += 1;
  console.log(`${cond ? "PASS" : "FAIL"} [${checks}] ${msg}`);
  if (!cond) fails += 1;
};

const load = async (entry) => {
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: "esm",
    write: false,
    platform: "neutral",
    define: { "import.meta.env": JSON.stringify({ BASE_URL: "/", DEV: false }) },
    logLevel: "silent",
  });
  const dir = mkdtempSync(join(tmpdir(), "soc10audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ① judgeKit(JUDGES — Ⅹ 신규 2종) ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES } = kit;
ok(!!JUDGES.ruleguard && !!JUDGES.polactor, "Ⅹ judge def 2종(ruleguard·polactor) 존재");

for (const id of ["ruleguard", "polactor"]) {
  const def = JUDGES[id];
  const conceptIds = new Set(def.concepts.map((c) => c.id));
  ok(def.concepts.length === 4, `[judge:${id}] 4개념(2×2 선반) (${def.concepts.length})`);
  const texts = new Set();
  let trapCount = 0;
  const perConcept = Object.fromEntries([...conceptIds].map((c) => [c, 0]));
  for (const c of def.cases) {
    ok(conceptIds.has(c.answer), `[judge:${id}] "${c.text.slice(0, 14)}…" answer(${c.answer}) 존재`);
    perConcept[c.answer] = (perConcept[c.answer] ?? 0) + 1;
    ok(!texts.has(c.text), `[judge:${id}] 케이스 문장 중복 없음: "${c.text.slice(0, 14)}…"`);
    texts.add(c.text);
    if (c.trap) trapCount += 1;
    const trapKeys = Object.keys(c.traps ?? {});
    for (const k of trapKeys) {
      ok(conceptIds.has(k) && k !== c.answer, `[judge:${id}] trap 키(${k})가 오답 개념: "${c.text.slice(0, 12)}…"`);
    }
    // 4개념 judge 관례: 오답 개념 3종 교정 전부 완비
    ok(trapKeys.length === 3, `[judge:${id}] "${c.text.slice(0, 12)}…" 오답 개념 3종 교정 완비 (${trapKeys.length})`);
  }
  for (const [cid, n] of Object.entries(perConcept)) ok(n >= 1, `[judge:${id}] 개념 ${cid} 케이스 ≥1 (${n})`);
  ok(trapCount === 1, `[judge:${id}] 함정 카드 덱당 1장 (${trapCount})`);
  ok((def.final?.options?.length ?? 0) >= 2, `[judge:${id}] final options ≥2`);
  ok(!!def.chips?.all && !!def.chips?.trap && !!def.chips?.final, `[judge:${id}] 목표 칩 라벨 3종`);
}

// ── ② Ⅹ 전용 기함 랩 데이터 ──
{
  const { ELECT_PHASES } = await load("src/lessons/steps/electLab.ts");
  ok(ELECT_PHASES.length === 6, `electLab 단계 6 (${ELECT_PHASES.length})`);
  const names = ELECT_PHASES.map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["선거인 명부 작성", "후보자 등록", "선거 운동", "투표", "개표", "당선인 결정"]),
    `electLab 단계 이름·순서 정확 (${names.join("→")})`,
  );
  const quizzes = ELECT_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `electLab 판정 quiz 3곳 (${quizzes.length})`);
  for (const p of quizzes) {
    ok(p.quiz.options.length === 2, `[elc:${p.id}] options 2(첫 항목=정답)`);
    ok(p.quiz.good !== p.quiz.wrong, `[elc:${p.id}] good ≠ wrong`);
  }
}
{
  const { POLICY_PHASES, POLICY_FINALE, POLICY_STATIONS } = await load("src/lessons/steps/policyLab.ts");
  ok(POLICY_PHASES.length === 5, `policyLab 정거장 5 (${POLICY_PHASES.length})`);
  const names = POLICY_PHASES.map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["이익 표출", "이익 집약", "정책 결정", "정책 집행", "정책 평가"]),
    `policyLab 단계 이름·순서 = 교과서 도식 (${names.join("→")})`,
  );
  ok(JSON.stringify(POLICY_STATIONS) === JSON.stringify(names), "트랙 정거장 라벨이 단계 이름과 1:1");
  const quizzes = POLICY_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `policyLab 담당 판정 quiz 3곳 (${quizzes.length})`);
  ok(POLICY_PHASES[1].quiz?.options[0].includes("정당과 언론"), "[pcy:집약] 정답 = 정당과 언론(국가기관 함정)");
  ok(POLICY_PHASES[2].quiz?.options[0].includes("국회"), "[pcy:결정] 정답 = 국회");
  ok(POLICY_PHASES[3].quiz?.options[0] === "정부", "[pcy:집행] 정답 = 정부(국회 함정)");
  for (const p of quizzes) ok(p.quiz.good !== p.quiz.wrong, `[pcy:${p.id}] good ≠ wrong`);
  ok(POLICY_FINALE.options.length === 2, "policyLab 피날레 options 2(첫 항목=정답)");
  ok(/다시|순환/.test(POLICY_FINALE.options[0]), "피날레 정답이 환류(순환)를 명명");
}

// ── ③ 용어 표기 일치 + 언어 가드 ──
{
  const src = readFileSync("src/content/soc/unit10.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const labs = ["electLab", "policyLab", "hookSoc10"].map((f) => readFileSync(`src/lessons/steps/${f}.ts`, "utf8")).join("\n");
  const figs = readFileSync("src/ui/socFigures10.ts", "utf8");
  const both = src + kitSrc + labs + figs;
  ok(!/정치 과정/.test(both), "용어: '정치과정' 붙여쓰기 통일(교과서 표기)");
  ok(!/시민 단체/.test(both), "용어: '시민단체' 붙여쓰기 통일(교과서 표기)");
  ok(!/이익집단/.test(both), "용어: '이익 집단' 띄어쓰기 통일");
  ok(!/지방자치/.test(both), "용어: '지방 자치' 띄어쓰기 통일");
  ok(!/보통선거|평등선거|직접선거|비밀선거/.test(both), "용어: '○○ 선거' 띄어쓰기 통일");
  ok(!/주민투표|주민소환|주민청원/.test(both), "용어: '주민 ○○' 띄어쓰기 통일");
  ok(!/선거인명부|당선인결정/.test(both), "용어: '선거인 명부'·'당선인 결정' 띄어쓰기 통일");
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  const noComment = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/교과서/.test(noComment), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(noComment), "출판사명 노출 0건(주석 제외)");
  ok(!/총에 맞|최루탄|고문|시신|유혈|사살/.test(noComment), "비폭력 서술 가드(유혈 어휘 0건)");
  // 정치 단원 가드: 가상 무대 확인 — 쟁점 사례는 "스틱 시"로만
  ok(/스틱 시/.test(src), "쟁점 사례가 가상 무대(스틱 시)로 각색됨");
}

// ── ④ 퀴즈 정합(unit10 실로드) ──
const unitMod = await load("src/content/soc/unit10.ts");
const UNIT = unitMod.S1_UNIT10;
ok(UNIT.lessons.length === 7, `레슨 7개 (${UNIT.lessons.length})`);
ok(UNIT.lessons.filter((l) => l.premium).length === 4, "프리미엄 4(무료 3)");
for (const les of UNIT.lessons) {
  let figCount = 0;
  let activeCount = 0;
  for (const st of les.steps) {
    const s = st;
    if (s.type === "quiz") {
      if (s.figure) figCount += 1;
      if (s.mode === "mcq") {
        ok(Number.isInteger(s.answer) && s.answer >= 0 && s.answer < s.options.length, `[${les.id}] mcq answer 범위: "${s.prompt.slice(0, 16)}…"`);
        if (s.shuffle === false) ok(s.answer !== 0, `[${les.id}] shuffle:false 첫 칸 정답 금지: "${s.prompt.slice(0, 16)}…"`);
      }
      if (s.mode === "multi") {
        ok(Array.isArray(s.answer) && s.answer.every((a) => a >= 0 && a < s.options.length), `[${les.id}] multi answer 범위`);
      }
    }
    if (s.type === "binSort") {
      activeCount += 1;
      const binIds = new Set(s.bins.map((b) => b.id));
      for (const it of s.items) ok(binIds.has(it.bin), `[${les.id}] binSort "${it.label.slice(0, 12)}…" bin 존재`);
    }
    if (s.type === "order") {
      activeCount += 1;
      ok(s.items.length >= 3, `[${les.id}] order 항목 ≥3 (${s.items.length})`);
    }
    if (s.type === "pairMatch") {
      activeCount += 1;
      ok(s.pairs.length >= 3, `[${les.id}] pairMatch 짝 ≥3 (${s.pairs.length})`);
    }
    if (s.type === "judgeLab") {
      activeCount += 1;
      ok(!!JUDGES[s.judge], `[${les.id}] judgeLab def 존재(${s.judge})`);
    }
    if (s.type === "electLab" || s.type === "policyLab") activeCount += 1;
    if (s.type === "comic") {
      for (const p of s.panels) {
        ok(existsSync(`public/${p.img}`), `[${les.id}] 만화 컷 존재: ${p.img}`);
        ok((p.bubbles?.length ?? 0) >= 1, `[${les.id}] 컷 말풍선 ≥1: ${p.img}`);
        for (const b of p.bubbles ?? []) ok(b.y <= 45, `[${les.id}] 말풍선 상단 여백 존(y≤45): "${b.text.slice(0, 10)}…" y=${b.y}`);
      }
    }
    if (s.type === "recap") {
      for (const card of s.cards) {
        ok(!!card.more && card.more.length >= 300, `[${les.id}] recap "${card.name}" more ≥300자 (${card.more?.length ?? 0})`);
        ok(!!card.art, `[${les.id}] recap "${card.name}" 미니아트`);
        ok((card.more ?? "").includes("class='fun'"), `[${les.id}] recap "${card.name}" fun 꼬리`);
      }
    }
  }
  ok(figCount >= 1, `[${les.id}] 그림 문제 ≥1 (${figCount})`);
  ok(activeCount >= 1, `[${les.id}] 능동형 스텝 ≥1 (${activeCount})`);
}

// ── ⑤ 서사 배선: Ⅸ 예고 회수(L1) + L7 outro가 Ⅺ(법) 예고 ──
{
  const l1 = UNIT.lessons[0];
  const l7 = UNIT.lessons[6];
  const hookLead = l1.steps.find((s) => s.type === "hook")?.lead ?? "";
  ok(/목소리|정책이 될까/.test(hookLead), "L1 훅이 Ⅸ outro 예고(목소리→정책)를 회수");
  const outro = l7.steps.find((s) => s.type === "recap")?.outro ?? "";
  ok(/다음 단원/.test(outro) && /법/.test(outro), "L7 outro가 Ⅺ(법) 예고");
}

// ── ⑥ 에셋 존재 ──
for (let i = 1; i <= 7; i++) ok(existsSync(`public/soc/cuts/u10l${i}.webp`), `개념 컷 u10l${i}.webp 존재`);
for (let i = 0; i <= 3; i++) ok(existsSync(`public/comics/s1u10l6/${i}.webp`), `만화 컷 ${i}.webp 존재`);

console.log(`\n===== audit-soc10-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
