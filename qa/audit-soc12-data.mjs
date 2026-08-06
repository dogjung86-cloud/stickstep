// 사회 Ⅻ 데이터 정합 검산 — "눈대중 0건" 규율의 인권 단원판(audit-soc11 계보).
//   ① judgeLab(JUDGES — Ⅻ 신규 invade·limit3·rescue): answer·traps 키 정합 · 개념당 케이스 ≥1 ·
//      함정 카드 덱당 1 · 문장 중복 0 · final options ≥2(첫 항목=정답 규약).
//      2개념 judge(invade)는 오답 개념 1종, 3개념 judge(limit3·rescue)는 오답 개념 2종 traps 완비(cultview 관례).
//   ② Ⅻ 전용 기함 랩: shieldLab SHIELD_PHASES(5국면 · 평등→자유→참정→청구→사회 = 교과서 도해 순 ·
//      판정 quiz 3곳 — 차별 없이(획일 함정)/수단적 권리/적극적 권리) +
//      workRightLab WORKRIGHT_PHASES(관찰+3걸음 · 단결권→단체 교섭권→단체 행동권 · 판정 quiz 3곳 —
//      단결권 명명/교섭권 명명/'일정한 절차' 함정).
//   ③ 용어 표기 일치: 교과서(미래엔 정본) 표기 — '국가인권위원회'·'국민권익위원회'·'고용노동부'·
//      '헌법재판소'·'노동조합' 붙임, '노동 3권'('노동삼권/노동 삼권' 금지)·'최저 임금제'·'헌법 소원'·
//      '행복 추구권'·'인권 감수성'·'부당 해고'·'부당 노동 행위'·'임금 체불'·'공무 담임권' 띄움 + 이모지 0 +
//      UI 문구 '교과서' 0(주석 제외) + 출판사명 0 + 유혈 어휘 0 + ★인권 단원 가드: 실명 인물 0
//      (루스벨트류 — 만화도 익명 대표들로) + 수갑·감옥 어휘 0 + 피해 재현 어휘(따돌림·괴롭힘) 0.
//   ④ 퀴즈 정합(unit12 실로드): mcq/multi answer 범위 · shuffle:false 첫 칸 정답 금지 ·
//      binSort bin 존재 · pairMatch 5쌍 · judgeLab def 존재 · recap 전 카드 more ≥300자+미니아트+fun ·
//      레슨마다 그림 문제 ≥1 · 능동형 ≥1 · 만화 말풍선 y≤45 · 만화 전체 말풍선 ≥2(원경 컷 0 허용).
//   ⑤ 서사 배선: L1 만화 lead가 Ⅺ outro 예고('보물')를 회수 + L7 outro가 2막(안으로)·1막(밖으로)
//      회수 + 중2 사회 Ⅰ(헌법과 국가기관) 예고.
//   ⑥ 에셋 존재: 개념 컷 u12l1~7.webp · 만화 s1u12l1/0~3.webp.
// node qa/audit-soc12-data.mjs
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
  const dir = mkdtempSync(join(tmpdir(), "soc12audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ① judgeKit(JUDGES — Ⅻ 신규 3종: invade 2개념 · limit3/rescue 3개념) ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES } = kit;
ok(!!JUDGES.invade && !!JUDGES.limit3 && !!JUDGES.rescue, "Ⅻ judge def 3종(invade·limit3·rescue) 존재");

for (const [id, nConcept] of [["invade", 2], ["limit3", 3], ["rescue", 3]]) {
  const def = JUDGES[id];
  const conceptIds = new Set(def.concepts.map((c) => c.id));
  ok(def.concepts.length === nConcept, `[judge:${id}] ${nConcept}개념 선반 (${def.concepts.length})`);
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
    // 2개념 judge = 오답 1종, 3개념 judge = 오답 2종 전부 교정 완비(cultview 관례)
    ok(trapKeys.length === nConcept - 1, `[judge:${id}] "${c.text.slice(0, 12)}…" 오답 개념 교정 완비 (${trapKeys.length}/${nConcept - 1})`);
  }
  for (const [cid, n] of Object.entries(perConcept)) ok(n >= 1, `[judge:${id}] 개념 ${cid} 케이스 ≥1 (${n})`);
  ok(trapCount === 1, `[judge:${id}] 함정 카드 덱당 1장 (${trapCount})`);
  ok((def.final?.options?.length ?? 0) >= 2, `[judge:${id}] final options ≥2`);
  ok(!!def.chips?.all && !!def.chips?.trap && !!def.chips?.final, `[judge:${id}] 목표 칩 라벨 3종`);
}
// 함정 과녁 고정: invade = 청소년 요금(침해 아님) · limit3 = 드론(안전 보장) · rescue = 법률 심판(헌재)
ok(JUDGES.invade.cases.find((c) => c.trap)?.answer === "noviol", "[invade] 함정 카드 정답 = 침해 아님(청소년 요금 배려)");
ok(JUDGES.limit3.cases.find((c) => c.trap)?.answer === "safe", "[limit3] 함정 카드 정답 = 국가 안전 보장(드론)");
ok(JUDGES.rescue.cases.find((c) => c.trap)?.answer === "consti", "[rescue] 함정 카드 정답 = 헌법재판소(법률 자체 심판)");

// ── ② Ⅻ 전용 기함 랩 데이터 ──
{
  const { SHIELD_PHASES } = await load("src/lessons/steps/shieldLab.ts");
  ok(SHIELD_PHASES.length === 5, `shieldLab 국면 5 (${SHIELD_PHASES.length})`);
  const names = SHIELD_PHASES.map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["평등권", "자유권", "참정권", "청구권", "사회권"]),
    `shieldLab 5방패 이름·순서 = 교과서 도해 (${names.join("→")})`,
  );
  const quizzes = SHIELD_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `shieldLab 판정 quiz 3곳 (${quizzes.length})`);
  ok(/차별/.test(SHIELD_PHASES[0].quiz?.options[0] ?? ""), "[sdl:평등] 정답 = 차별받지 않기(획일 평등 함정)");
  ok(/도구/.test(SHIELD_PHASES[3].quiz?.options[0] ?? ""), "[sdl:청구] 정답 = 수단(도구)적 권리");
  ok(/인간다운 생활/.test(SHIELD_PHASES[4].quiz?.options[0] ?? ""), "[sdl:사회] 정답 = 인간다운 생활 보장(자유권 방향 함정)");
  for (const p of quizzes) {
    ok(p.quiz.options.length === 2, `[sdl:${p.id}] options 2(첫 항목=정답)`);
    ok(p.quiz.good !== p.quiz.wrong, `[sdl:${p.id}] good ≠ wrong`);
  }
}
{
  const { WORKRIGHT_PHASES } = await load("src/lessons/steps/workRightLab.ts");
  ok(WORKRIGHT_PHASES.length === 4, `workRightLab 국면 4(관찰+세 걸음) (${WORKRIGHT_PHASES.length})`);
  const names = WORKRIGHT_PHASES.filter((p) => p.stageName).map((p) => p.stageName);
  ok(
    JSON.stringify(names) === JSON.stringify(["단결권", "단체 교섭권", "단체 행동권"]),
    `workRightLab 세 걸음 이름·순서 = 노동 3권 (${names.join("→")})`,
  );
  const quizzes = WORKRIGHT_PHASES.filter((p) => p.quiz);
  ok(quizzes.length === 3, `workRightLab 판정 quiz 3곳 (${quizzes.length})`);
  ok(WORKRIGHT_PHASES[1].quiz?.options[0] === "단결권", "[wrl:union] 정답 = 단결권 명명");
  ok(WORKRIGHT_PHASES[2].quiz?.options[0] === "단체 교섭권", "[wrl:bargain] 정답 = 단체 교섭권 명명");
  ok(/일정한 절차/.test(WORKRIGHT_PHASES[3].quiz?.options[0] ?? ""), "[wrl:action] 정답 = 일정한 절차(아무 때나 함정)");
  for (const p of quizzes) {
    ok(p.quiz.options.length === 2, `[wrl:${p.id}] options 2(첫 항목=정답)`);
    ok(p.quiz.good !== p.quiz.wrong, `[wrl:${p.id}] good ≠ wrong`);
  }
}

// ── ③ 용어 표기 일치 + 언어 가드 ──
{
  const src = readFileSync("src/content/soc/unit12.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const labs = ["shieldLab", "workRightLab", "hookSoc12"].map((f) => readFileSync(`src/lessons/steps/${f}.ts`, "utf8")).join("\n");
  const figs = readFileSync("src/ui/socFigures12.ts", "utf8");
  const both = src + kitSrc + labs + figs;
  ok(!/국가 인권 위원회|국가인권 위원회|국가 인권위원회/.test(both), "용어: '국가인권위원회' 붙임 통일(미래엔 정본)");
  ok(!/국민 권익 위원회|국민권익 위원회/.test(both), "용어: '국민권익위원회' 붙임 통일");
  ok(!/고용 노동부/.test(both), "용어: '고용노동부' 붙임 통일");
  ok(!/헌법 재판소/.test(both), "용어: '헌법재판소' 붙임 통일");
  ok(!/노동 조합/.test(both), "용어: '노동조합' 붙임 통일");
  ok(!/노동삼권|노동 삼권|노동3권/.test(both), "용어: '노동 3권' 표기 통일(미래엔 정본)");
  ok(!/최저임금/.test(both), "용어: '최저 임금(제)' 띄어쓰기 통일");
  ok(!/헌법소원/.test(both), "용어: '헌법 소원' 띄어쓰기 통일");
  ok(!/행복추구권/.test(both), "용어: '행복 추구권' 띄어쓰기 통일");
  ok(!/인권감수성/.test(both), "용어: '인권 감수성' 띄어쓰기 통일");
  ok(!/부당해고|부당노동행위|임금체불/.test(both), "용어: '부당 해고'·'부당 노동 행위'·'임금 체불' 띄어쓰기 통일");
  ok(!/공무담임권|국민투표권|재판청구권|국가배상/.test(both), "용어: 참정·청구권 세부 권리 띄어쓰기 통일");
  ok(!/근로기준법/.test(both), "용어: '근로 기준법' 띄어쓰기 통일");
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  const noComment = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/교과서/.test(noComment), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(noComment), "출판사명 노출 0건(주석 제외)");
  ok(!/총에 맞|최루탄|고문|시신|유혈|사살|학살/.test(noComment), "비폭력 서술 가드(유혈 어휘 0건)");
  // 인권 단원 가드: 실명 0(만화도 익명 대표) + 수갑·감옥 0 + 피해 장면 재현 어휘 0
  const allNoComment = both.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/루스벨트|루비 브리지스|누스바움|마틴 루서/.test(allNoComment), "실명 인물 0건(세계 인권 선언 서사도 익명 대표들)");
  ok(!/수갑|감옥|철창|교도소/.test(allNoComment), "수갑·감옥 어휘 0건(구제·회복 프레임)");
  ok(!/따돌림|괴롭힘|성희롱/.test(allNoComment), "피해 장면 재현 어휘 0건(교과서 범주 사례만)");
}

// ── ④ 퀴즈 정합(unit12 실로드) ──
const unitMod = await load("src/content/soc/unit12.ts");
const UNIT = unitMod.S1_UNIT12;
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
    if (s.type === "pairMatch") {
      activeCount += 1;
      ok(s.pairs.length === 5 && s.pairs.every((p) => p.a && p.b), `[${les.id}] pairMatch 5쌍 완비 (${s.pairs.length})`);
      ok(new Set(s.pairs.map((p) => p.b)).size === 5, `[${les.id}] pairMatch 권리 5종 중복 없음`);
    }
    if (s.type === "judgeLab") {
      activeCount += 1;
      ok(!!JUDGES[s.judge], `[${les.id}] judgeLab def 존재(${s.judge})`);
    }
    if (s.type === "shieldLab" || s.type === "workRightLab") activeCount += 1;
    if (s.type === "comic") {
      let totalBubbles = 0;
      for (const p of s.panels) {
        ok(existsSync(`public/${p.img}`), `[${les.id}] 만화 컷 존재: ${p.img}`);
        totalBubbles += p.bubbles?.length ?? 0;
        for (const b of p.bubbles ?? []) ok(b.y <= 45, `[${les.id}] 말풍선 상단 여백 존(y≤45): "${b.text.slice(0, 10)}…" y=${b.y}`);
      }
      // Ⅻ 만화는 원경(c1) 컷이 말풍선 0 — 캡션 서사(Ⅺ 관례 계승, 전체 ≥2로 검사)
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

// ── ⑤ 서사 배선: Ⅺ 예고 회수(L1 만화 lead) + L7 outro 3중 피날레 ──
{
  const l1 = UNIT.lessons[0];
  const l7 = UNIT.lessons[6];
  const comicLead = l1.steps.find((s) => s.type === "comic")?.lead ?? "";
  ok(/보물/.test(comicLead), "L1 만화 lead가 Ⅺ outro 예고(법이 지키려는 보물)를 회수");
  const outro = l7.steps.find((s) => s.type === "recap")?.outro ?? "";
  ok(/밖으로/.test(outro) && /안으로/.test(outro), "L7 outro가 1막(밖으로)·2막(안으로) 중1 사회 완결 회수");
  ok(/헌법과 국가기관/.test(outro) && /만나요/.test(outro), "L7 outro가 중2 사회 Ⅰ(헌법과 국가기관) 예고");
}

// ── ⑥ 에셋 존재 ──
for (let i = 1; i <= 7; i++) ok(existsSync(`public/soc/cuts/u12l${i}.webp`), `개념 컷 u12l${i}.webp 존재`);
for (let i = 0; i <= 3; i++) ok(existsSync(`public/comics/s1u12l1/${i}.webp`), `만화 컷 ${i}.webp 존재`);

console.log(`\n===== audit-soc12-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
