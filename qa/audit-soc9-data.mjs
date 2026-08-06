// 사회 Ⅸ 데이터 정합 검산 — "눈대중 0건" 규율의 정치 단원판(audit-soc7/soc8 계보).
//   ① judgeLab(JUDGES 전체 — Ⅸ 신규 ispolitics·demoway 포함): answer·traps 키 정합 ·
//      개념당 케이스 ≥1 · 함정 카드 덱당 1 · 문장 중복 0 · final options ≥2(첫 항목=정답 규약).
//      demoway(3개념)는 cultview 관례 — 오답 개념 2종 traps 완비.
//   ② dilemmaLab(DILEMMAS.speedvote): 모든 choice에 gain·loss 완비("정답 없는 선택" 불변식) ·
//      naming options ≥2(첫 항목=정답) · stakes 2 · chips 3종.
//   ③ Ⅸ 전용 기함 랩: suffrageLab ERAS(정거장 6 · lit 키 유효 · 점등 단조 증가 · 1918 여성=1(부분)) ·
//      principleLab PHASES(4국면 · 원리 순서 정확 · options 2 · good이 원리를 명명) + FINALE(options 2).
//   ④ 용어 표기 일치: '국민 주권·국민 자치·권력 분립·정치적 무관심·보통 선거·직접/간접 민주주의'
//      붙여쓰기 변형 0건 + 이모지 0 + UI 문구 '교과서' 0(주석 제외) + 출판사명 0.
//   ⑤ 퀴즈 정합(unit9 실로드): mcq/multi answer 범위 · shuffle:false 첫 칸 정답 금지 ·
//      binSort bin 존재 · order ≥3 · judgeLab/dilemmaLab def 존재 · recap 전 카드 more ≥300자+
//      미니아트+fun · 레슨마다 그림 문제 ≥1 · 능동형 ≥1 · 만화 말풍선 y≤45.
//   ⑥ 에셋 존재: 개념 컷 u9l1~7.webp · 만화 s1u9l3/0~3.webp.
// node qa/audit-soc9-data.mjs
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
  const dir = mkdtempSync(join(tmpdir(), "soc9audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ① judgeKit(JUDGES — Ⅸ 신규 포함) ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES, DILEMMAS } = kit;
ok(!!JUDGES.ispolitics && !!JUDGES.demoway, "Ⅸ judge def 2종(ispolitics·demoway) 존재");

for (const id of ["ispolitics", "demoway"]) {
  const def = JUDGES[id];
  const conceptIds = new Set(def.concepts.map((c) => c.id));
  ok(def.concepts.length >= 2 && def.concepts.length <= 3, `[judge:${id}] 개념 2~3 (${def.concepts.length})`);
  const texts = new Set();
  let trapCount = 0;
  const perConcept = Object.fromEntries([...conceptIds].map((c) => [c, 0]));
  for (const c of def.cases) {
    ok(conceptIds.has(c.answer), `[judge:${id}] "${c.text.slice(0, 14)}…" answer(${c.answer}) 존재`);
    perConcept[c.answer] = (perConcept[c.answer] ?? 0) + 1;
    ok(!texts.has(c.text), `[judge:${id}] 케이스 문장 중복 없음: "${c.text.slice(0, 14)}…"`);
    texts.add(c.text);
    if (c.trap) trapCount += 1;
    for (const k of Object.keys(c.traps ?? {})) {
      ok(conceptIds.has(k) && k !== c.answer, `[judge:${id}] trap 키(${k})가 오답 개념: "${c.text.slice(0, 12)}…"`);
    }
  }
  for (const [cid, n] of Object.entries(perConcept)) ok(n >= 1, `[judge:${id}] 개념 ${cid} 케이스 ≥1 (${n})`);
  ok(trapCount === 1, `[judge:${id}] 함정 카드 덱당 1장 (${trapCount})`);
  ok((def.final?.options?.length ?? 0) >= 2, `[judge:${id}] final options ≥2`);
  ok(!!def.chips?.all && !!def.chips?.trap && !!def.chips?.final, `[judge:${id}] 목표 칩 라벨 3종`);
}

// demoway 전용: 3개념 판별 — 오답 교정(traps)이 두 오답 개념 모두를 덮는가(cultview 관례)
for (const c of JUDGES.demoway.cases) {
  const trapKeys = Object.keys(c.traps ?? {});
  ok(trapKeys.length === 2, `[demoway] "${c.text.slice(0, 12)}…" 오답 개념 2종 교정 완비 (${trapKeys.length})`);
}

// ── ② dilemmaLab(speedvote — "정답 없는 선택" 불변식) ──
{
  const d = DILEMMAS.speedvote;
  ok(!!d, "Ⅸ dilemma def(speedvote) 존재");
  ok(d.choices.length === 2, `[speedvote] 갈림길 2 (${d.choices.length})`);
  for (const c of d.choices) {
    ok(c.gain.length >= 1 && c.gain.every((g) => g.trim().length > 0), `[speedvote:${c.id}] gain 완비`);
    ok(c.loss.length >= 1 && c.loss.every((l) => l.trim().length > 0), `[speedvote:${c.id}] loss 완비(정답 없는 선택)`);
  }
  ok(d.stakes.length === 2, `[speedvote] stakes 2 (${d.stakes.length})`);
  ok((d.naming?.options?.length ?? 0) >= 2, "[speedvote] naming options ≥2(첫 항목=정답)");
  ok(!!d.naming.term && !!d.naming.def, "[speedvote] 용어 카드(term·def) 완비");
  ok(!!d.chips?.a && !!d.chips?.b && !!d.chips?.name, "[speedvote] 목표 칩 라벨 3종");
}

// ── ③ Ⅸ 전용 기함 랩 데이터 ──
{
  const { SUFFRAGE_ERAS, SUFFRAGE_VOTERS } = await load("src/lessons/steps/suffrageLab.ts");
  ok(SUFFRAGE_ERAS.length === 6, `suffrageLab 정거장 6 (${SUFFRAGE_ERAS.length})`);
  const voterIds = new Set(SUFFRAGE_VOTERS.map((v) => v.id));
  let prevSum = -1;
  SUFFRAGE_ERAS.forEach((era, i) => {
    const keys = Object.keys(era.lit);
    ok(keys.length === voterIds.size && keys.every((k) => voterIds.has(k)), `[sfr:${era.year}] lit 키가 유형과 1:1`);
    const sum = Object.values(era.lit).reduce((a, b) => a + b, 0);
    ok(sum >= prevSum, `[sfr:${era.year}] 점등 단조 증가 (${prevSum} → ${sum})`);
    prevSum = sum;
    if (i === 4) ok(era.lit.women === 1, `[sfr:1918] 여성 부분 점등(30세 이상만) = 1 (${era.lit.women})`);
    if (i === 5) ok(Object.values(era.lit).every((v) => v === 2), `[sfr:1928] 전 유형 완전 점등`);
    if (i === 0) ok(Object.values(era.lit).every((v) => v === 0), `[sfr:${era.year}] 첫 정거장 전 유형 소등`);
  });
}
{
  const { PRINCIPLE_PHASES, PRINCIPLE_FINALE } = await load("src/lessons/steps/principleLab.ts");
  ok(PRINCIPLE_PHASES.length === 4, `principleLab 국면 4 (${PRINCIPLE_PHASES.length})`);
  const props = PRINCIPLE_PHASES.map((p) => p.prop);
  ok(
    JSON.stringify(props) === JSON.stringify(["국민 주권", "국민 자치", "입헌주의", "권력 분립"]),
    `principleLab 원리 순서 정확 (${props.join("·")})`,
  );
  for (const p of PRINCIPLE_PHASES) {
    ok(p.options.length === 2, `[ppl:${p.id}] options 2`);
    ok(p.good !== p.wrong, `[ppl:${p.id}] good ≠ wrong`);
    ok(p.good.includes(p.prop), `[ppl:${p.id}] 정답 문구가 원리(${p.prop})를 명명`);
  }
  ok(PRINCIPLE_FINALE.options.length === 2, "principleLab 피날레 options 2(첫 항목=정답)");
  ok(PRINCIPLE_FINALE.options[0].includes("존엄성"), "피날레 정답이 이념(존엄성)을 가리킴");
}

// ── ④ 용어 표기 일치 + 언어 가드 ──
{
  const src = readFileSync("src/content/soc/unit9.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const labs = ["suffrageLab", "principleLab", "hookSoc9"].map((f) => readFileSync(`src/lessons/steps/${f}.ts`, "utf8")).join("\n");
  const both = src + kitSrc + labs;
  ok(!/국민주권/.test(both), "용어: '국민 주권' 띄어쓰기 통일");
  ok(!/국민자치/.test(both), "용어: '국민 자치' 띄어쓰기 통일");
  ok(!/권력분립/.test(both), "용어: '권력 분립' 띄어쓰기 통일");
  ok(!/정치적무관심/.test(both), "용어: '정치적 무관심' 띄어쓰기 통일");
  ok(!/보통선거/.test(both), "용어: '보통 선거' 띄어쓰기 통일");
  ok(!/직접민주주의|간접민주주의/.test(both), "용어: '직접/간접 민주주의' 띄어쓰기 통일");
  ok(!/시민혁명/.test(both), "용어: '시민 혁명' 띄어쓰기 통일");
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  const noComment = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/교과서/.test(noComment), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(noComment), "출판사명 노출 0건(주석 제외)");
  // 정치 단원 가드: 시민 혁명·민주화 서술에 유혈 어휘 0(광장·요구·제도 변화로만 서술)
  ok(!/총에 맞|최루탄|고문|시신|유혈|사살/.test(noComment), "비폭력 서술 가드(유혈 어휘 0건)");
}

// ── ⑤ 퀴즈 정합(unit9 실로드) ──
const unitMod = await load("src/content/soc/unit9.ts");
const UNIT = unitMod.S1_UNIT9;
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
    if (s.type === "dilemmaLab") {
      activeCount += 1;
      ok(!!DILEMMAS[s.dilemma], `[${les.id}] dilemmaLab def 존재(${s.dilemma})`);
    }
    if (s.type === "suffrageLab" || s.type === "principleLab") activeCount += 1;
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

// 서사 배선: Ⅷ 예고 회수(L1 lead) + L7 outro가 Ⅹ 예고
{
  const l1 = UNIT.lessons[0];
  const l7 = UNIT.lessons[6];
  const hookLead = l1.steps.find((s) => s.type === "hook")?.lead ?? "";
  ok(/이해|눈/.test(hookLead), "L1 훅이 Ⅷ(이해의 눈) 예고를 회수");
  const outro = l7.steps.find((s) => s.type === "recap")?.outro ?? "";
  ok(/다음 단원/.test(outro) && /정치가 굴러가는|과정/.test(outro), "L7 outro가 Ⅹ(정치과정) 예고");
}

// ── ⑥ 에셋 존재 ──
for (let i = 1; i <= 7; i++) ok(existsSync(`public/soc/cuts/u9l${i}.webp`), `개념 컷 u9l${i}.webp 존재`);
for (let i = 0; i <= 3; i++) ok(existsSync(`public/comics/s1u9l3/${i}.webp`), `만화 컷 ${i}.webp 존재`);

console.log(`\n===== audit-soc9-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
