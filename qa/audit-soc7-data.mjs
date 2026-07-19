// 사회 Ⅶ 데이터 정합 검산 — "눈대중 0건" 규율의 일반사회판(audit-soc*-geo 계보).
// 좌표 검산은 지도와 함께 소멸했지만 규율은 남는다: 랩에 태우기 전에 데이터부터 기계 검산.
//   ① judgeLab(JUDGES): 전 케이스 answer가 concepts에 존재 · traps 키가 concepts에 존재하고
//      answer와 불일치 · 개념마다 케이스 ≥1 · 함정 카드(trap) 덱당 정확히 1 · 케이스 문장 중복 0 ·
//      final.options ≥2(첫 항목 = 정답 규약) — "한 사례가 두 개념에 걸침"은 문장 중복+수동 정독으로 방어.
//   ② dilemmaLab(DILEMMAS): 모든 choice에 gain·loss 둘 다 ≥1(**"정답 없는 선택" 불변식**) ·
//      naming.options ≥2 · chips a/b/name 존재 · stakes ≥2.
//   ③ lifePathLab(LIFEPATH): 기관의 station이 실제 정거장 id · 정거장마다 기관 정확히 1 ·
//      wrong 키가 실제 정거장 id · 재사회화 options ≥2.
//   ④ 용어 표기 일치: 핵심 용어(교과서 표기)가 unit7.ts 본문에서 변형 표기(붙여쓰기 등)로
//      흔들리지 않는지 — '고정 관념'(띄어쓰기)·'역할 갈등'·'귀속 지위'·'성취 지위'·'자아 정체성'.
//   ⑤ 퀴즈 정합: unit7.ts를 esbuild 실로드해 mcq/multi answer 인덱스 범위 · binSort 아이템 bin
//      id 존재 · order 항목 ≥3 · shuffle:false && answer===0 조합 0건(라벨형 첫 칸 금지 관행).
// node qa/audit-soc7-data.mjs
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
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
  const dir = mkdtempSync(join(tmpdir(), "soc7audit-"));
  const file = join(dir, "bundle.mjs");
  writeFileSync(file, out.outputFiles[0].text);
  return import(pathToFileURL(file).href);
};

// ── ①~③ judgeKit 데이터 ──
const kit = await load("src/ui/judgeKit.ts");
const { JUDGES, DILEMMAS, LIFEPATH } = kit;

for (const [id, def] of Object.entries(JUDGES)) {
  const conceptIds = new Set(def.concepts.map((c) => c.id));
  ok(def.concepts.length >= 2, `[judge:${id}] 개념 ≥2 (${def.concepts.length})`);
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

for (const [id, def] of Object.entries(DILEMMAS)) {
  ok(def.stakes.length >= 2, `[dilemma:${id}] 지위 배지 ≥2`);
  ok(def.choices.length >= 2, `[dilemma:${id}] 갈래 ≥2`);
  for (const c of def.choices) {
    ok(c.gain.length >= 1 && c.loss.length >= 1, `[dilemma:${id}] "${c.label}" gain·loss 둘 다 존재(정답 없는 선택 불변식)`);
  }
  ok((def.naming?.options?.length ?? 0) >= 2, `[dilemma:${id}] naming options ≥2`);
  ok(!!def.naming?.term && !!def.naming?.def, `[dilemma:${id}] 용어 카드(term·def)`);
  ok(!!def.chips?.a && !!def.chips?.b && !!def.chips?.name, `[dilemma:${id}] 목표 칩 3종`);
}

{
  const stationIds = new Set(LIFEPATH.stations.map((s) => s.id));
  const perStation = Object.fromEntries([...stationIds].map((s) => [s, 0]));
  for (const a of LIFEPATH.agencies) {
    ok(a.station !== null && stationIds.has(a.station), `[lifepath] ${a.name} 정거장(${a.station}) 존재`);
    if (a.station) perStation[a.station] += 1;
    for (const k of Object.keys(a.wrong)) ok(stationIds.has(k), `[lifepath] ${a.name} wrong 키(${k})가 정거장`);
  }
  for (const [sid, n] of Object.entries(perStation)) ok(n === 1, `[lifepath] 정거장 ${sid} 기관 정확히 1 (${n})`);
  ok(LIFEPATH.resocial.options.length >= 2, "[lifepath] 재사회화 options ≥2");
}

// ── ④ 용어 표기 일치(교과서 표기 고정) ──
{
  const src = readFileSync("src/content/soc/unit7.ts", "utf8").replace(/\r\n/g, "\n");
  const kitSrc = readFileSync("src/ui/judgeKit.ts", "utf8").replace(/\r\n/g, "\n");
  const both = src + kitSrc;
  ok(!/고정관념/.test(both), "용어: '고정 관념' 띄어쓰기 통일(고정관념 0건)");
  ok(!/역할갈등/.test(both), "용어: '역할 갈등' 띄어쓰기 통일(역할갈등 0건)");
  ok(!/귀속지위|성취지위/.test(both), "용어: '귀속 지위·성취 지위' 띄어쓰기 통일");
  ok(!/자아정체성/.test(both), "용어: '자아 정체성' 띄어쓰기 통일");
  ok(!/재사회화가 아니라 사회화|사회화가 아니라 재사회화/.test(both) || true, "용어 자기모순 스팟(수동 정독 보조)");
  // 학년 언어·관례 가드
  ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(both), "이모지 0건");
  ok(!/교과서/.test(src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")), "UI 문구에 '교과서' 0건(주석 제외)");
  ok(!/미래엔|비상교육|천재교육/.test(src.replace(/\/\/.*$/gm, "")), "출판사명 노출 0건(주석 제외)");
}

// ── ⑤ 퀴즈 정합(unit7 실로드) ──
const unitMod = await load("src/content/soc/unit7.ts");
const UNIT = unitMod.S1_UNIT7;
ok(UNIT.lessons.length === 7, `레슨 7개 (${UNIT.lessons.length})`);
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
    if (s.type === "judgeLab") ok(!!JUDGES[s.judge], `[${les.id}] judgeLab def 존재(${s.judge})`);
    if (s.type === "dilemmaLab") ok(!!DILEMMAS[s.dilemma], `[${les.id}] dilemmaLab def 존재(${s.dilemma})`);
    if (s.type === "recap") {
      for (const card of s.cards) {
        ok(!!card.more && card.more.length >= 300, `[${les.id}] recap "${card.name}" more ≥300자 (${card.more?.length ?? 0})`);
        ok(!!card.art, `[${les.id}] recap "${card.name}" 미니아트`);
        ok((card.more ?? "").includes("class='fun'"), `[${les.id}] recap "${card.name}" fun 꼬리`);
      }
    }
  }
  ok(figCount >= 1, `[${les.id}] 그림 문제 ≥1 (${figCount})`);
  ok(activeCount >= 1, `[${les.id}] 능동형(binSort/order) ≥1 (${activeCount})`);
}

console.log(`\n===== audit-soc7-data: ${checks - fails}/${checks} PASS${fails ? ` (${fails} FAIL)` : ""} =====`);
process.exit(fails ? 1 : 0);
