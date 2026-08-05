// 사회 Ⅷ 데이터 정합 검산 — "눈대중 0건" 규율의 문화 단원판(audit-soc7-data 계보).
//   ① judgeLab(JUDGES 전체 — Ⅷ 신규 isculture·cultview 포함): answer·traps 키 정합 ·
//      개념당 케이스 ≥1 · 함정 카드 덱당 1 · 문장 중복 0 · final options ≥2(첫 항목=정답 규약).
//   ② Ⅷ 전용 랩 데이터: kimchiLab PHASES(options 2·good/wrong 상이·속성 5종 정확) ·
//      factLab TOOLS(4종·options 2·target 유효) · feastLab(ok ⊆ 음식 id · wrong 키는 ok 밖 ·
//      셋 다 먹는 공통 음식 = 교집합 {비빔밥·두부김치·달걀말이}).
//   ③ 용어 표기 일치: '문화 상대주의·자문화 중심주의·문화 사대주의·다문화 사회·미디어 리터러시'
//      붙여쓰기 변형 0건 + 이모지 0 + UI 문구 '교과서' 0(주석 제외) + 출판사명 0.
//   ④ 퀴즈 정합(unit8 실로드): mcq/multi answer 범위 · shuffle:false 첫 칸 정답 금지 ·
//      binSort bin 존재 · order ≥3 · judgeLab def 존재 · recap 전 카드 more ≥300자+미니아트+fun ·
//      레슨마다 그림 문제 ≥1 · 능동형(binSort/order/pairMatch) ≥1.
//   ⑤ 에셋 존재: 개념 컷 u8l1~7.webp · 만화 s1u8l7/0~3.webp · 실사 culture 6종.
// node qa/audit-soc8-data.mjs
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
  const dir = mkdtempSync(join(tmpdir(), "soc8audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ① judgeKit(JUDGES 전체 — Ⅷ 신규 포함) ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES } = kit;
ok(!!JUDGES.isculture && !!JUDGES.cultview, "Ⅷ judge def 2종(isculture·cultview) 존재");

for (const [id, def] of Object.entries(JUDGES)) {
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

// cultview 전용: 3개념 판별 — 오답 교정(traps)이 두 오답 개념 모두를 덮는가
{
  const cv = JUDGES.cultview;
  for (const c of cv.cases) {
    const trapKeys = Object.keys(c.traps ?? {});
    ok(trapKeys.length === 2, `[cultview] "${c.text.slice(0, 12)}…" 오답 개념 2종 교정 완비 (${trapKeys.length})`);
  }
}

// ── ② Ⅷ 전용 랩 데이터 ──
{
  const { KIMCHI_PHASES } = await load("src/lessons/steps/kimchiLab.ts");
  ok(KIMCHI_PHASES.length === 5, `kimchiLab 국면 5 (${KIMCHI_PHASES.length})`);
  const props = KIMCHI_PHASES.map((p) => p.prop);
  ok(JSON.stringify(props) === JSON.stringify(["공유성", "학습성", "축적성", "변동성", "전체성"]), `kimchiLab 속성 순서 정확 (${props.join("·")})`);
  for (const p of KIMCHI_PHASES) {
    ok(p.options.length === 2, `[kimchi:${p.id}] options 2`);
    ok(p.good !== p.wrong, `[kimchi:${p.id}] good ≠ wrong`);
    ok(p.good.includes(p.prop), `[kimchi:${p.id}] 정답 문구가 속성(${p.prop})을 명명`);
  }
}
{
  const { FACT_TOOLS } = await load("src/lessons/steps/factLab.ts");
  ok(FACT_TOOLS.length === 4, `factLab 도구 4 (${FACT_TOOLS.length})`);
  const targets = new Set(["head", "ground", "bias", "tail"]);
  for (const t of FACT_TOOLS) {
    ok(targets.has(t.target), `[fact:${t.id}] target(${t.target}) 유효`);
    ok(t.options.length === 2 && t.good !== t.wrong, `[fact:${t.id}] options 2 · good≠wrong`);
  }
}
{
  const { FEAST } = await load("src/lessons/steps/feastLab.ts");
  const foodIds = new Set(FEAST.FOODS.map((f) => f.id));
  ok(FEAST.GUESTS.length === 3, `feastLab 손님 3 (${FEAST.GUESTS.length})`);
  for (const g of FEAST.GUESTS) {
    for (const f of g.ok) ok(foodIds.has(f), `[feast:${g.id}] ok(${f})가 음식 id`);
    for (const w of Object.keys(g.wrong)) {
      ok(foodIds.has(w), `[feast:${g.id}] wrong(${w})가 음식 id`);
      ok(!g.ok.includes(w), `[feast:${g.id}] wrong(${w})는 ok 밖(모순 0)`);
    }
    ok(g.ok.length + Object.keys(g.wrong).length === FEAST.FOODS.length, `[feast:${g.id}] 전 음식 판정 완비(ok+wrong=${FEAST.FOODS.length})`);
  }
  const common = FEAST.GUESTS.reduce((acc, g) => acc.filter((f) => g.ok.includes(f)), FEAST.FOODS.map((f) => f.id));
  ok(JSON.stringify(common.sort()) === JSON.stringify(["bibim", "dubu", "eggroll"].sort()), `feast 공통 음식 = 교집합 정확 (${common.join("·")})`);
}

// ── ③ 용어 표기 일치 + 언어 가드 ──
{
  const src = readFileSync("src/content/soc/unit8.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const labs = ["kimchiLab", "factLab", "feastLab", "hookSoc8"].map((f) => readFileSync(`src/lessons/steps/${f}.ts`, "utf8")).join("\n");
  const both = src + kitSrc + labs;
  ok(!/자문화중심주의/.test(both), "용어: '자문화 중심주의' 띄어쓰기 통일");
  ok(!/문화사대주의/.test(both), "용어: '문화 사대주의' 띄어쓰기 통일");
  ok(!/문화상대주의/.test(both), "용어: '문화 상대주의' 띄어쓰기 통일");
  ok(!/다문화사회/.test(both), "용어: '다문화 사회' 띄어쓰기 통일");
  ok(!/미디어리터러시/.test(both), "용어: '미디어 리터러시' 띄어쓰기 통일");
  ok(!/고정관념/.test(both), "용어: '고정 관념' 띄어쓰기 통일");
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  const noComment = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  ok(!/교과서/.test(noComment), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(noComment), "출판사명 노출 0건(주석 제외)");
  // 존중 워딩: 식문화 금기는 "먹지 않-"(존중)로 서술 — "못 먹는" 0건(레슨 본문)
  ok(!/못 먹는/.test(noComment), "식문화 금기 존중 워딩('못 먹는' 0건)");
}

// ── ④ 퀴즈 정합(unit8 실로드) ──
const unitMod = await load("src/content/soc/unit8.ts");
const UNIT = unitMod.S1_UNIT8;
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
    if (s.type === "kimchiLab" || s.type === "factLab" || s.type === "feastLab") activeCount += 1;
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

// ── ⑤ 에셋 존재 ──
for (let i = 1; i <= 7; i++) ok(existsSync(`public/soc/cuts/u8l${i}.webp`), `개념 컷 u8l${i}.webp 존재`);
for (let i = 0; i <= 3; i++) ok(existsSync(`public/comics/s1u8l7/${i}.webp`), `만화 컷 ${i}.webp 존재`);
for (const f of ["ganggang", "tinikling", "flamenco", "tteokguk", "buuz", "banhchung"]) {
  ok(existsSync(`public/soc/culture/${f}.webp`), `실사 ${f}.webp 존재`);
}

console.log(`\n===== audit-soc8-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
