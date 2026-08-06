// 사회 Ⅺ 데이터 정합 검산 — "눈대중 0건" 규율의 법 단원판(audit-soc10 계보).
//   ① judgeLab(JUDGES — Ⅺ 신규 lawmoral·lawzone): answer·traps 키 정합 · 개념당 케이스 ≥1 ·
//      함정 카드 덱당 1 · 문장 중복 0 · final options ≥2(첫 항목=정답 규약).
//      2개념 judge — 오답 개념 1종 traps 완비(diffdisc 관례).
//   ② Ⅺ 전용 기함 랩: trialLab TRIAL_PHASES(6국면 · 민사 3+형사 3 순서 정확 · 판정 quiz 3곳 ·
//      options[0]=정답 · good≠wrong — 원고·민사 판사·검사 기소가 판정 과녁) +
//      fairTrialLab FAIRTRIAL_PHASES(4제도 순서 = 교과서 도식(독립→공개→증거→심급) · 판정 quiz 3곳 —
//      헌법과 법률·양심 / 적법 증거 / 항소 명명).
//   ③ 용어 표기 일치: 교과서 표기 기준 — '심급 제도'(띄움)·'사회 보장법'(띄움)·'근로 기준법'·
//      '최저 임금법'·'국민 기초 생활 보장법'(띄움)·'공개 재판주의/증거 재판주의'('재판 주의' 금지)·
//      '소송 대리인'(띄움) 변형 0건 + 이모지 0 + UI 문구 '교과서' 0(주석 제외) + 출판사명 0 +
//      유혈 어휘 0 + ★법 단원 가드: 실사건·실명 0(드레퓌스·인혁당·김병로류) + 수갑·감옥 어휘 0 +
//      가상 무대(스틱 시·동화 나라) 존재.
//   ④ 퀴즈 정합(unit11 실로드): mcq/multi answer 범위 · shuffle:false 첫 칸 정답 금지 ·
//      binSort bin 존재 · order ≥3 · judgeLab def 존재 · recap 전 카드 more ≥300자+미니아트+fun ·
//      레슨마다 그림 문제 ≥1 · 능동형 ≥1 · 만화 말풍선(있는 컷만) y≤45 · 만화 전체 말풍선 ≥2.
//   ⑤ 서사 배선: L1 훅이 Ⅹ outro 예고('약속')를 회수 + L7 outro가 Ⅻ(인권) 예고.
//   ⑥ 에셋 존재: 개념 컷 u11l1~7.webp · 만화 s1u11l4/0~3.webp.
// node qa/audit-soc11-data.mjs
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
  const dir = mkdtempSync(join(tmpdir(), "soc11audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ① judgeKit(JUDGES — Ⅺ 신규 2종, 2개념) ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES } = kit;
ok(!!JUDGES.lawmoral && !!JUDGES.lawzone, "Ⅺ judge def 2종(lawmoral·lawzone) 존재");

for (const id of ["lawmoral", "lawzone"]) {
  const def = JUDGES[id];
  const conceptIds = new Set(def.concepts.map((c) => c.id));
  ok(def.concepts.length === 2, `[judge:${id}] 2개념 선반 (${def.concepts.length})`);
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
    // 2개념 judge 관례: 오답 개념 1종 교정 완비
    ok(trapKeys.length === 1, `[judge:${id}] "${c.text.slice(0, 12)}…" 오답 개념 교정 완비 (${trapKeys.length})`);
  }
  for (const [cid, n] of Object.entries(perConcept)) ok(n >= 1, `[judge:${id}] 개념 ${cid} 케이스 ≥1 (${n})`);
  ok(trapCount === 1, `[judge:${id}] 함정 카드 덱당 1장 (${trapCount})`);
  ok((def.final?.options?.length ?? 0) >= 2, `[judge:${id}] final options ≥2`);
  ok(!!def.chips?.all && !!def.chips?.trap && !!def.chips?.final, `[judge:${id}] 목표 칩 라벨 3종`);
}
// lawmoral 함정 = 악성 댓글(법), lawzone 함정 = 절도 처벌(공법) — 함정 과녁 고정 검산
ok(JUDGES.lawmoral.cases.find((c) => c.trap)?.answer === "law", "[lawmoral] 함정 카드 정답 = 법(악성 댓글)");
ok(JUDGES.lawzone.cases.find((c) => c.trap)?.answer === "pub", "[lawzone] 함정 카드 정답 = 공법(절도 처벌)");

// ── ② Ⅺ 전용 기함 랩 데이터 ──
{
  const { TRIAL_PHASES } = await load("src/lessons/steps/trialLab.ts");
  ok(TRIAL_PHASES.length === 6, `trialLab 국면 6 (${TRIAL_PHASES.length})`);
  const names = TRIAL_PHASES.map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["소장 제출", "답변서·변론", "판결(민사)", "고소·수사", "기소", "공판·판결(형사)"]),
    `trialLab 국면 이름·순서 = 교과서 절차(민사 3→형사 3) (${names.join("→")})`,
  );
  const quizzes = TRIAL_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `trialLab 판정 quiz 3곳 (${quizzes.length})`);
  ok(TRIAL_PHASES[0].quiz?.options[0].includes("원고"), "[trl:소장] 정답 = 원고 명명");
  ok(/배상|지급/.test(TRIAL_PHASES[2].quiz?.options[0] ?? ""), "[trl:판결] 정답 = 분쟁 해결(배상·지급 — 형벌 함정)");
  ok(TRIAL_PHASES[4].quiz?.options[0].includes("검사"), "[trl:기소] 정답 = 검사(피해자 직접 함정)");
  for (const p of quizzes) {
    ok(p.quiz.options.length === 2, `[trl:${p.id}] options 2(첫 항목=정답)`);
    ok(p.quiz.good !== p.quiz.wrong, `[trl:${p.id}] good ≠ wrong`);
  }
}
{
  const { FAIRTRIAL_PHASES } = await load("src/lessons/steps/fairTrialLab.ts");
  ok(FAIRTRIAL_PHASES.length === 4, `fairTrialLab 장치 4 (${FAIRTRIAL_PHASES.length})`);
  const names = FAIRTRIAL_PHASES.map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["사법권의 독립", "공개 재판주의", "증거 재판주의", "심급 제도"]),
    `fairTrialLab 4제도 이름·순서 = 교과서 도식 (${names.join("→")})`,
  );
  const quizzes = FAIRTRIAL_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `fairTrialLab 판정 quiz 3곳 (${quizzes.length})`);
  ok(/헌법과 법률/.test(FAIRTRIAL_PHASES[0].quiz?.options[0] ?? ""), "[ftl:독립] 정답 = 헌법과 법률·양심");
  ok(/적법한 절차/.test(FAIRTRIAL_PHASES[2].quiz?.options[0] ?? ""), "[ftl:증거] 정답 = 적법 수집 증거(소문 함정)");
  ok(FAIRTRIAL_PHASES[3].quiz?.options[0] === "항소", "[ftl:심급] 정답 = 항소(상고 함정)");
  for (const p of quizzes) {
    ok(p.quiz.options.length === 2, `[ftl:${p.id}] options 2(첫 항목=정답)`);
    ok(p.quiz.good !== p.quiz.wrong, `[ftl:${p.id}] good ≠ wrong`);
  }
}

// ── ③ 용어 표기 일치 + 언어 가드 ──
{
  const src = readFileSync("src/content/soc/unit11.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const labs = ["trialLab", "fairTrialLab", "hookSoc11"].map((f) => readFileSync(`src/lessons/steps/${f}.ts`, "utf8")).join("\n");
  const figs = readFileSync("src/ui/socFigures11.ts", "utf8");
  const both = src + kitSrc + labs + figs;
  ok(!/심급제도/.test(both), "용어: '심급 제도' 띄어쓰기 통일(교과서 표기)");
  ok(!/사회보장법/.test(both), "용어: '사회 보장법' 띄어쓰기 통일");
  ok(!/근로기준법|최저임금법/.test(both), "용어: '근로 기준법'·'최저 임금법' 띄어쓰기 통일");
  ok(!/기초생활/.test(both), "용어: '국민 기초 생활 보장법' 띄어쓰기 통일");
  ok(!/재판 주의/.test(both), "용어: '공개/증거 재판주의' 붙여쓰기 통일");
  ok(!/소송대리인/.test(both), "용어: '소송 대리인' 띄어쓰기 통일");
  ok(!/확정판결/.test(both), "용어: '확정 판결' 띄어쓰기 통일");
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  const noComment = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/교과서/.test(noComment), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(noComment), "출판사명 노출 0건(주석 제외)");
  ok(!/총에 맞|최루탄|고문|시신|유혈|사살/.test(noComment), "비폭력 서술 가드(유혈 어휘 0건)");
  // 법 단원 가드: 실사건·실명 0 + 수갑·감옥 어휘 0(처벌 프레임 대신 권리 보호 프레임)
  const allNoComment = both.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/드레퓌스|인혁당|김병로|이승만|서민호/.test(allNoComment), "실사건·실명 0건(불공정 재판 사례 가상화)");
  ok(!/수갑|감옥|철창|교도소/.test(allNoComment), "수갑·감옥 어휘 0건(권리 보호 프레임)");
  ok(/스틱 시/.test(src) && /동화 나라/.test(src), "분쟁 사례가 가상 무대(스틱 시·동화 나라)로 각색됨");
}

// ── ④ 퀴즈 정합(unit11 실로드) ──
const unitMod = await load("src/content/soc/unit11.ts");
const UNIT = unitMod.S1_UNIT11;
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
    if (s.type === "judgeLab") {
      activeCount += 1;
      ok(!!JUDGES[s.judge], `[${les.id}] judgeLab def 존재(${s.judge})`);
    }
    if (s.type === "trialLab" || s.type === "fairTrialLab") activeCount += 1;
    if (s.type === "comic") {
      let totalBubbles = 0;
      for (const p of s.panels) {
        ok(existsSync(`public/${p.img}`), `[${les.id}] 만화 컷 존재: ${p.img}`);
        totalBubbles += p.bubbles?.length ?? 0;
        for (const b of p.bubbles ?? []) ok(b.y <= 45, `[${les.id}] 말풍선 상단 여백 존(y≤45): "${b.text.slice(0, 10)}…" y=${b.y}`);
      }
      // Ⅺ 만화는 원경(c1)·은유(c2) 컷이 말풍선 0 — 캡션이 서사 담당(컷별 ≥1 관례의 예외, 전체 ≥2로 검사)
      ok(totalBubbles >= 2, `[${les.id}] 만화 전체 말풍선 ≥2 (${totalBubbles})`);
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

// ── ⑤ 서사 배선: Ⅹ 예고 회수(L1) + L7 outro가 Ⅻ(인권) 예고 ──
{
  const l1 = UNIT.lessons[0];
  const l7 = UNIT.lessons[6];
  const hookLead = l1.steps.find((s) => s.type === "hook")?.lead ?? "";
  ok(/약속/.test(hookLead), "L1 훅이 Ⅹ outro 예고(길 위의 약속)를 회수");
  const outro = l7.steps.find((s) => s.type === "recap")?.outro ?? "";
  ok(/인권/.test(outro) && /만나요/.test(outro), "L7 outro가 Ⅻ(인권과 기본권) 예고");
}

// ── ⑥ 에셋 존재 ──
for (let i = 1; i <= 7; i++) ok(existsSync(`public/soc/cuts/u11l${i}.webp`), `개념 컷 u11l${i}.webp 존재`);
for (let i = 0; i <= 3; i++) ok(existsSync(`public/comics/s1u11l4/${i}.webp`), `만화 컷 ${i}.webp 존재`);

console.log(`\n===== audit-soc11-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
