// 중2 Ⅰ v5 판정 자료 도구(개발 서버 필요): 시험 풀과의 겹침 검사, 정답 없는 문제지, 정답표, 문제 그림 묶음, 개념 글의 전과 후.
//   PORT=5581 node qa/g2u1v5-tools.mjs <판정 자료 폴더> <정답표 폴더>
//   겹침: 새 문제(문두, 보기, 해설)와 랩 소스의 한글 글을 16자 창으로 밀어 단원 종합 평가 문제 은행(g2u1)에 같은 16자가 있는지 본다.
//   문제지에는 정답과 해설을 싣지 않는다(정답표는 다른 폴더에). 랩 안의 판정 질문은 랩 소스에서 옮겨 적은 LAB_Q를 싣는다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const [OUT, KEY] = process.argv.slice(2);
if (!OUT || !KEY) throw new Error("판정 자료 폴더와 정답표 폴더를 적어 주세요");
if (path.resolve(OUT) === path.resolve(KEY)) throw new Error("정답표는 문제지와 다른 폴더에 둔다");
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(KEY, { recursive: true });
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = `http://localhost:${process.env.PORT || "5581"}`;

// 랩 소스의 한글 문자열
const labTexts = [];
const LABDIR = path.join(ROOT, "src/lessons/steps/g2u1v5");
for (const f of fs.readdirSync(LABDIR).filter((x) => x.endsWith(".ts"))) {
  const src = fs.readFileSync(path.join(LABDIR, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
  for (const m of src.matchAll(/["`]((?:[^"`\\\n]|\\.)*)["`]/g)) if (/[가-힣]{6,}/.test(m[1])) labTexts.push({ where: f, t: m[1] });
}

// 랩 안의 판정 질문(랩 소스에서 옮겨 적었다. 첫 보기가 정답이라 문제지에서는 섞는다)
const LAB_Q = [
  ["g2u1l1 측정 랩", "네 금속 조각의 질량 ÷ 부피를 계산했더니 가 7.9, 나 2.7, 다 7.9, 라 2.7이었다(가와 나는 크기가 같고, 다는 가장 작고, 라는 가장 크다).", "조각 가와 같은 물질인 조각은?", ["조각 다 (크기는 가보다 작다)", "조각 나 (크기가 가와 같다)", "조각 라 (가장 크다)"]],
  ["g2u1l1 크기 랩", "철 조각과 알루미늄 조각의 크기를 바꿔 가며 질량과 부피를 쟀다. 철은 어떤 크기에서도 질량 ÷ 부피가 7.87, 알루미늄은 2.70이었다.", "조각의 크기를 바꿔도 변하지 않은 값은?", ["질량 ÷ 부피", "질량", "부피"]],
  ["g2u1l2 층 쌓기 랩", "컵에 아래부터 물(1.00), 식용유(0.91), 에탄올(0.79)이 층을 이뤘다. 얼음(0.92)을 넣었더니 식용유와 물 사이에서 멈췄다.", "얼음(0.92)이 식용유 아래, 물 위에 멈춘 까닭은?", ["식용유보다 밀도가 크고 물보다 작아서", "세 액체보다 밀도가 작아서", "차가워서 식용유보다 무거워져서"]],
  ["g2u1l3 녹이기 랩", "실온의 물 10 g에 0.5 g씩 넣으며 저었다. 질산 칼륨은 3.0 g까지 다 녹고 3.5 g째에 바닥에 남았다.", "질산 칼륨은 물 10 g에 3.0 g까지 녹았어요. 같은 온도의 물이 100 g이라면?", ["약 30 g까지 녹는다", "똑같이 3.0 g까지 녹는다", "넣는 대로 모두 녹는다"]],
  ["g2u1l3 데우기 랩", "질산 칼륨의 용해도 곡선(물 100 g에 녹는 양)이 그려져 있다. 세로 눈금은 40, 80, 120, 160이고 곡선은 20 ℃에서 31.6, 40 ℃에서 63.9, 60 ℃에서 110, 80 ℃에서 169를 지난다.", "분홍 곡선에서 60 ℃의 물 100 g에 질산 칼륨은 최대 얼마나 녹나요?", ["약 110 g", "약 60 g", "약 32 g"]],
  ["g2u1l4 기포 랩(온도)", "차가운 탄산음료가 든 시험관을 얼음물(5 ℃), 실온의 물(20 ℃), 뜨거운 물(60 ℃)에 담갔더니 10초 동안 기포가 4개, 11개, 38개 올라왔다.", "뜨거운 물에서 기포가 가장 많이 올라온 까닭은?", ["온도가 높아 이산화 탄소가 덜 녹게 되어서", "뜨거운 물이 시험관 속으로 들어가서", "음료 속에서 이산화 탄소가 새로 만들어져서"]],
  ["g2u1l4 기포 랩(압력)", "차가운 탄산음료를 넣은 용기의 공기를 빼내자 압력계의 바늘이 내려가며 기포가 많아졌고, 공기를 다시 넣자 기포가 줄었다. 음료의 온도는 그대로였다.", "용기 속의 압력이 낮아지자 기포가 많아진 까닭은?", ["압력이 낮아 이산화 탄소가 덜 녹게 되어서", "빼낸 공기가 음료 속으로 들어가서", "음료의 온도가 높아져서"]],
  ["g2u1l5 녹이기 곡선 랩", "로르산 1 g과 2 g을 가열한 그래프: 둘 다 43.8 ℃에서 온도가 멈췄고, 2 g은 멈춘 구간이 더 길었으며 다 녹는 데 더 오래 걸렸다.", "로르산 1 g과 2 g의 그래프에서 같은 것은?", ["온도가 멈춘 구간의 온도", "온도가 멈춘 구간의 길이", "다 녹을 때까지 걸린 시간"]],
  ["g2u1l5 끓이기 랩", "뚜껑 없는 냄비에서 물 100 mL와 200 mL는 100 ℃에서, 에탄올 100 mL는 78 ℃에서 끓었다. 뚜껑을 잠근 압력솥의 물은 120 ℃에서 끓었다.", "압력솥의 물이 100 ℃가 되어도 끓지 않은 까닭은?", ["솥 안의 압력이 높아 더 높은 온도에서 끓어서", "솥 안의 물이 더 많아서", "뚜껑이 열을 막아 덜 뜨거워져서"]],
  ["g2u1l6 소금물 랩", "물은 100 ℃에서 끓으며 온도가 멈췄다. 소금 10 g을 녹인 소금물은 약 102 ℃에서, 30 g을 녹인 소금물은 약 105 ℃에서 끓기 시작해 끓는 동안에도 온도가 조금씩 올랐다.", "소금물이 끓는 동안 온도는 어떻게 됐나요?", ["멈추지 않고 조금씩 계속 올랐다", "물처럼 한 온도에서 멈췄다", "끓기 시작하자 내려갔다"]],
  ["g2u1l7 분별 깔때기 랩", "분별 깔때기 속에서 위층은 식용유(약 0.91), 아래층은 물(1.00)이었다. 꼭지로 아래층을 비커 (가)에 받고, 위층은 입구로 비커 (나)에 따랐다.", "꼭지로 먼저 받은 액체와 그 까닭은?", ["물, 밀도가 더 커서 아래층에 있어서", "식용유, 밀도가 더 커서 아래층에 있어서", "물, 식용유보다 양이 많아서"]],
  ["g2u1l7 볍씨 랩", "속이 찬 볍씨의 밀도는 1.16, 덜 여문 볍씨는 1.06이다. 소금물의 밀도가 1.06 이하일 때는 둘 다 가라앉고, 1.16보다 크면 둘 다 떴다.", "두 볍씨를 가르려면 소금물의 밀도는 어때야 할까요?", ["덜 여문 볍씨보다 크고 속이 찬 볍씨보다 작게", "두 볍씨 모두보다 크게", "두 볍씨 모두보다 작게"]],
  ["g2u1l8 재결정 랩", "물 10 g에 질산 칼륨 10 g과 염화 나트륨 2 g을 넣고 가열해 모두 녹인 뒤 5 ℃까지 식혀 걸렀다. 거름종이에는 질산 칼륨 결정만 남았다. 염화 나트륨의 용해도는 0 ℃에서도 물 100 g에 약 36 g이다.", "식혔을 때 염화 나트륨이 결정으로 나오지 않은 까닭은?", ["식혀도 2 g은 물 10 g에 다 녹아 있을 수 있어서", "염화 나트륨은 물에 녹지 않아서", "질산 칼륨보다 먼저 거름종이에 걸려서"]],
  ["g2u1l9 증류 랩", "물과 에탄올 혼합물을 가열하자 온도가 약 78 ℃에서 한 번, 100 ℃에서 한 번 거의 일정했다. 첫 구간에서 모은 액체에서는 소독용 알코올 냄새가 났고, 둘째 구간의 액체는 푸른색 염화 코발트 종이를 붉게 바꿨다.", "첫 번째 평평한 구간에서 주로 끓어 나온 물질과 그 까닭은?", ["에탄올, 물보다 끓는점이 낮아서", "물, 에탄올보다 끓는점이 낮아서", "에탄올, 물보다 양이 많아서"]],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 800 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/?g2u1v5`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => !!window.__g2u1v5, null, { timeout: 30000 });

const data = await page.evaluate(async ({ labTexts }) => {
  const N = 16;
  const strip = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  const tight = (h) => strip(h).replace(/\s+/g, "");
  const ex = await import("/src/content/exams/index.ts");
  const exam = ex.examForUnit("g2u1");
  const pool = [];
  exam.pool.forEach((it) => [it.prompt, ...(it.options ?? []), ...(it.bogi ?? []), it.explain, it.core].forEach((t) => pool.push({ id: it.id, t: tight(t) })));
  const v5 = window.__g2u1v5;
  const base = window.__g2u1base;
  const mine = [];
  const probs = [];
  const figs = [];
  v5.lessons.forEach((l) =>
    l.steps.forEach((s, si) => {
      if (!["quiz", "binSort", "order", "pairMatch"].includes(s.type)) return;
      const add = (k, t) => t && mine.push({ where: `${l.id} 스텝 ${si + 1}(${s.type}) ${k}`, t: tight(t) });
      add("문두", s.prompt); add("제목", s.title); add("안내", s.lead);
      (s.options ?? []).forEach((o, i) => add(`보기 ${i + 1}`, o));
      (s.items ?? []).forEach((o, i) => add(`항목 ${i + 1}`, typeof o === "string" ? o : o.label));
      add("정답 해설", s.explainGood); add("오답 해설", s.explainBad);
      if (s.figure) figs.push({ id: `${l.id}-${si + 1}`, svg: s.figure });
      probs.push({ lesson: l.id, step: si + 1, type: s.type, kind: s.mode ?? "", prompt: strip(s.prompt ?? s.title), lead: strip(s.lead), fig: s.figure ? `${l.id}-${si + 1}` : "", options: (s.options ?? []).map(strip), answer: s.answer, shuffle: s.shuffle !== false,
        items: (s.items ?? []).map((o) => (typeof o === "string" ? o : { label: strip(o.label), bin: o.bin })), bins: (s.bins ?? []).map((b) => ({ id: b.id, label: strip(b.label) })), good: strip(s.explainGood), bad: strip(s.explainBad) });
    }),
  );
  labTexts.forEach((x) => mine.push({ where: `랩 ${x.where}`, t: tight(x.t) }));
  const hits = [];
  for (const q of mine) for (let i = 0; i + N <= q.t.length; i++) {
    const w = q.t.slice(i, i + N);
    const p = pool.find((x) => x.t.includes(w));
    if (p) { hits.push(`${q.where} / 시험 ${p.id}: "${w}"`); break; }
  }
  // 개념 글의 전과 후
  const texts = (unit) => unit.lessons.map((l) => ({
    id: l.id, title: l.title,
    parts: l.steps.flatMap((s) => {
      if (s.type === "concept") return [`[개념] ${strip(s.title)}: ${strip(s.lead)} ${(s.blocks ?? []).map((b) => (b.k === "term" ? `〔${b.name}〕 ${strip(b.def)}` : b.k === "note" ? `(메모) ${strip(b.html)}` : b.k === "figure" ? `(컷) ${strip(b.cap)}` : "")).filter(Boolean).join(" ")}`];
      if (s.type === "table") return [`[표] ${strip(s.title)}: ${strip(s.lead)} ${(s.rows ?? []).map((r) => r.map((c) => (typeof c === "string" ? c : c.v)).join(" / ")).join(" ; ")}`];
      if (s.type === "recap") return [`[정리] ${strip(s.title)}`, ...s.cards.map((c) => `· 카드 「${c.name}」 ${strip(c.text)}\n  자세히: ${strip(c.more)}`), s.note ? `· 메모 「${s.note.title}」 ${strip(s.note.html)}` : ""].filter(Boolean);
      return [];
    }),
  }));
  return { hits, checked: mine.length, pool: pool.length, probs, figs, before: texts(base), after: texts(v5) };
}, { labTexts });

// 문제 그림 묶음
if (data.figs.length) {
  await page.setContent(`<html><body style="margin:0;padding:16px;background:#fff;font-family:sans-serif;display:grid;grid-template-columns:repeat(2,380px);gap:18px">${data.figs.map((f) => `<div style="border:1px solid #ccc;border-radius:12px;padding:10px"><div style="font-weight:700;margin-bottom:6px">그림 ${f.id}</div><div style="width:344px">${f.svg}</div></div>`).join("")}</body></html>`);
  await page.setViewportSize({ width: 830, height: 300 });
  await page.screenshot({ path: path.join(OUT, "problem-figs.png"), fullPage: true });
}
await browser.close();

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = (arr, r) => { const a = arr.map((v, i) => [v, i]); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const r = rng(20261112);
const NUM = ["①", "②", "③", "④", "⑤"];
let blind = "# 중2 Ⅰ 물질의 특성 v5: 정답 없는 문제지\n\n검산용이다. 정답과 해설은 싣지 않았다. 그림이 있는 문제는 `problem-figs.png`의 같은 번호 그림을 본다.\n\n## 가. 랩 안의 판정 질문\n\n";
let key = "# 정답표\n\n## 가. 랩 안의 판정 질문\n\n";
LAB_Q.forEach(([where, ctx, q, ch], i) => {
  const sh = shuffle(ch, r);
  blind += `### 가${i + 1}. ${where}\n\n배경: ${ctx}\n\n질문: ${q}\n\n${sh.map(([t], k) => `${NUM[k]} ${t}`).join("\n")}\n\n`;
  key += `가${i + 1}: ${NUM[sh.findIndex(([, idx]) => idx === 0)]} ${ch[0]}\n`;
});
blind += "## 나. 레슨 뒤의 문제\n\n";
key += "\n## 나. 레슨 뒤의 문제\n\n";
data.probs.forEach((p, i) => {
  const head = `### 나${i + 1}. ${p.lesson} (${p.type === "quiz" ? (p.kind === "ox" ? "OX" : p.kind === "multi" ? "모두 고르기" : "하나 고르기") : p.type === "order" ? "순서" : "분류"})${p.fig ? ` [그림 ${p.fig}]` : ""}\n\n`;
  if (p.type === "quiz" && p.kind === "ox") {
    blind += `${head}${p.prompt}\n\n(O / X)\n\n`;
    key += `나${i + 1}: ${p.answer ? "O" : "X"}\n`;
  } else if (p.type === "quiz") {
    const sh = p.shuffle ? shuffle(p.options, r) : p.options.map((v, k) => [v, k]);
    blind += `${head}${p.prompt}\n\n${sh.map(([t], k) => `${NUM[k]} ${t}`).join("\n")}\n\n`;
    const ans = (Array.isArray(p.answer) ? p.answer : [p.answer]).map((a) => NUM[sh.findIndex(([, idx]) => idx === a)]).sort().join(", ");
    key += `나${i + 1}: ${ans}\n`;
  } else if (p.type === "order") {
    const sh = shuffle(p.items, r);
    blind += `${head}${p.prompt} ${p.lead}\n\n(아래 항목을 알맞은 차례로 놓는다)\n\n${sh.map(([t]) => `- ${t}`).join("\n")}\n\n`;
    key += `나${i + 1}: ${p.items.join(" → ")}\n`;
  } else {
    const sh = shuffle(p.items, r);
    blind += `${head}${p.prompt} ${p.lead}\n\n칸: ${p.bins.map((b) => b.label).join(" / ")}\n\n${sh.map(([t]) => `- ${t.label}`).join("\n")}\n\n`;
    key += `나${i + 1}: ${p.bins.map((b) => `${b.label} = ${p.items.filter((x) => x.bin === b.id).map((x) => x.label).join(", ")}`).join(" / ")}\n`;
  }
});
fs.writeFileSync(path.join(OUT, "problems-blind.md"), blind);
fs.writeFileSync(path.join(KEY, "problems-key.md"), key);

let ba = "# 중2 Ⅰ 물질의 특성 v5: 개념 글의 전과 후\n\n레슨마다 지금의 글(개념 스텝, 표, 정리 카드)과 새 글을 나란히 적었다. 새 개념 스텝에는 아직 컷이 없다(컷 목록은 `concept-cuts.md`).\n\n";
data.before.forEach((b, i) => {
  const a = data.after[i];
  ba += `## ${b.id} ${b.title}\n\n### 지금의 글\n\n${b.parts.join("\n\n") || "(없음)"}\n\n### 새 글\n\n${a.parts.join("\n\n") || "(없음)"}\n\n`;
});
fs.writeFileSync(path.join(OUT, "concept-before-after.md"), ba);

console.log(`겹침 검사: 내 글 ${data.checked}토막, 시험 글 ${data.pool}토막, 겹침 ${data.hits.length}건`);
data.hits.forEach((h) => console.log("  " + h));
console.log(`문제 ${data.probs.length}개 + 랩 판정 ${LAB_Q.length}개, 그림 ${data.figs.length}장`);
process.exit(data.hits.length ? 1 : 0);
