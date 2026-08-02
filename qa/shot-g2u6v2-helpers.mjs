// g2u6 v2 신작 헬퍼 24종 **저작 전** 샘플 갤러리 눈검수(m2u4·m1u5 계보).
// 문항을 저작하기 전에 기하·겹침·잘림·라벨 대비를 먼저 확인한다.
// dev 서버 불필요(esbuild 실로드). node qa/shot-g2u6v2-helpers.mjs
import { build } from "esbuild";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const result = await build({ entryPoints: ["qa/g2u6v2-pilot.ts"], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
const F = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

const S = [];
const add = (name, note, svg) => S.push({ name, note, svg });

// ── L1 ──
add("NT 검출 시험관 4관", "청람·변화없음·보라·황적(가열)", F.bodyTestTubesFig({
  tubes: [
    { label: "(가)", tint: "navy", reagent: "아이오딘 용액" },
    { label: "(나)", tint: "none", reagent: "뷰렛 용액" },
    { label: "(다)", tint: "purple", reagent: "뷰렛 용액" },
    { label: "(라)", tint: "orange", reagent: "베네딕트 용액", heated: true },
  ],
}));
add("NT 결과 가림 3관", "가운데 관 결과를 ?로", F.bodyTestTubesFig({
  tubes: [
    { label: "A", tint: "navy" },
    { label: "B", tint: "none" },
    { label: "C", tint: "red" },
  ],
  hideTint: 1,
}));
add("NC 영양소 분류 도표", "3열 · ㉠㉡ 가림", F.nutrientChartFig({
  title: "영양소를 하는 일에 따라 묶은 표",
  cols: [
    { head: "에너지를 내요", items: ["탄수화물", "단백질", "지방"] },
    { head: "몸을 이루어요", items: ["단백질", "무기염류", "물"] },
    { head: "몸을 조절해요", items: ["바이타민", "무기염류", "물"] },
  ],
  masks: [{ col: 0, row: 2, sym: "㉠" }, { col: 2, row: 0, sym: "㉡" }],
}));
add("FT 식품 성분 표", "3열 한글 ≤8자", F.foodTableFig(["식품", "가장 많은 성분", "두 번째"], [["가", "탄수화물", "물"], ["나", "물", "단백질"], ["다", "지방", "단백질"]]));

// ── L2 ──
add("DG 소화기관 A~E", "이름 미인쇄 · 기호만", F.digestOrganFig({
  spots: [{ key: "mouth", sym: "A" }, { key: "liver", sym: "B" }, { key: "stomach", sym: "C" }, { key: "pancreas", sym: "D" }, { key: "small", sym: "E" }],
}));
add("DG 소화샘 지목", "간·쓸개·이자만", F.digestOrganFig({
  spots: [{ key: "liver", sym: "㉠" }, { key: "gall", sym: "㉡" }, { key: "pancreas", sym: "㉢" }],
}));
add("EG 효소 격자", "3행×3열 · ㉠㉡ 기호", F.enzymeGridFig({
  cols: ["탄수화물", "단백질", "지방"],
  rows: ["입", "위", "작은창자"],
  cells: [["arrow", "", ""], ["", "arrow", ""], ["㉠", "㉡", "arrow"]],
  note: "화살표는 분해가 일어나는 자리예요",
}));
add("ST 침 대조 실험", "A 증류수 / B 침 희석액", F.salivaSetupFig({
  tubes: [
    { label: "A", add: ["녹말 용액", "증류수"], result: "navy" },
    { label: "B", add: ["녹말 용액", "침 희석액"], result: "none" },
  ],
  temp: "35 ℃ 물에 10분 담근 뒤 아이오딘 용액을 넣음",
}));
add("VL 융털 기호판", "통로 2개 · 물질 점", F.villusFig({ symOuter: "㉠", symInner: "㉡", showTokens: true }));
add("DF 소화 흐름도", "4칸 · ㉠ 빈칸", F.digestFlowFig({
  steps: ["녹말", "엿당", "포도당", "융털로 흡수"],
  blank: 1,
  arrowLabels: ["침", null, null],
  caption: "화살표 위는 작용한 곳이에요",
}));

// ── L3 ──
add("HT 심장 네 방", "㉠~㉣ · 벽 두께 판독", F.heartQuizFig({ syms: ["㉠", "㉡", "㉢", "㉣"], showValves: true }));
add("HT 혈관 기호", "네 큰 혈관만", F.heartQuizFig({ syms: [null, null, null, null], vesselSyms: ["A", "B", "C", "D"] }));
add("VC 혈관 3종", "벽·속공간·판막 차등", F.vesselTrioFig({
  cards: [
    { sym: "(가)", wall: 14, lumen: 16 },
    { sym: "(나)", wall: 2, lumen: 12, thin: true },
    { sym: "(다)", wall: 5, lumen: 24, valve: true },
  ],
}));
add("BC 혈액 성분", "순서 섞음 · 이름 미인쇄", F.bloodCellsFig({
  cards: [{ sym: "(가)", kind: "platelet" }, { sym: "(나)", kind: "rbc" }, { sym: "(다)", kind: "wbc" }, { sym: "(라)", kind: "plasma" }],
}));
add("CP 두 순환 · 고리 기호", "색 있음", F.circulationPathFig({ loopSyms: ["(가)", "(나)"] }));
add("CP 혈관 기호 · 무채색", "색 단서 제거", F.circulationPathFig({ vesselSyms: ["㉠", "㉡", "㉢", "㉣"], showColor: false }));

// ── L4 ──
add("RS 호흡계 기호", "부위 4곳", F.respOrganFig({
  spots: [{ key: "nose", sym: "A" }, { key: "trachea", sym: "B" }, { key: "bronchus", sym: "C" }, { key: "diaphragm", sym: "D" }],
}));
add("RS 허파꽈리 확대", "확대 원 + 기호", F.respOrganFig({ spots: [{ key: "lung", sym: "㉠" }, { key: "alveoli", sym: "㉡" }], zoom: true }));
add("BM 호흡 모형 · 당김", "고무막 아래 · 풍선 큼", F.breathModelFig({ pull: true, syms: ["A", "B", "C", "D"], hand: true }));
add("BM 호흡 모형 · 제자리", "고무막 위 · 풍선 작음", F.breathModelFig({ pull: false, syms: ["A", "B", "C", "D"] }));
add("BR 들숨·날숨 2패널", "(가)(나) · 이름 미인쇄", F.breathCompare2Fig({ panels: [{ label: "(가)", up: true }, { label: "(나)", up: false }], arrow: true }));
add("AL 허파꽈리 기체", "㉠㉡ 양쪽 배치", F.alveoliQuizFig({ symA: "㉠", symB: "㉡", showArrows: true }));
add("GT 들숨·날숨 성분 표", "3열", F.gasTableFig(["기체", "들숨", "날숨"], [["산소", "많음", "적음"], ["이산화 탄소", "적음", "많음"], ["질소", "비슷", "비슷"]]));

// ── L5 ──
add("ES 배설계 기호", "부위 4곳 + 단면", F.excretoryFig({
  spots: [{ key: "kidney", sym: "㉠" }, { key: "ureter", sym: "㉡" }, { key: "bladder", sym: "㉢" }, { key: "urethra", sym: "㉣" }],
  cut: true,
}));
add("NP 콩팥단위 화살표", "이름 전면 미인쇄", F.nephronQuizFig({ syms: ["(가)", "(나)", "(다)"] }));
add("UT 성분 표", "혈액·여과액·오줌", F.urineTableFig(["물질", "여과액", "오줌"], [["포도당", "있음", "없음"], ["요소", "있음", "많음"], ["단백질", "없음", "없음"]]));
add("HC 검사 결과지", "정상 범위 대조", F.checkupFig([["오줌 속 포도당", "나옴", "나오지 않음"], ["오줌 속 단백질", "나오지 않음", "나오지 않음"]]));

// ── L6 ──
add("CR 세포호흡 · 결과 가림", "오른쪽 칸 ㉠", F.cellRespQuizFig({ inItems: ["영양소", "산소"], outItems: ["이산화 탄소", "물"], hide: "out", symOut: "㉠" }));
add("CR 세포호흡 · 전부 표시", "가림 없음", F.cellRespQuizFig({ inItems: ["영양소", "산소"], outItems: ["이산화 탄소", "물"] }));
add("SI 기관계 상자", "(가)~(다) 역산 · 방향 파라미터", F.systemsQuizFig({
  boxes: [
    { sym: "(가)", inLabel: "음식물", outLabel: "영양소", dir: "toCenter" },
    { sym: "(나)", inLabel: "산소", outLabel: "이산화 탄소", dir: "both" },
    { sym: "(다)", outLabel: "오줌", dir: "fromCenter" },
    { sym: "", label: "조직세포", dir: "both" },
  ],
}));
add("AT 활동 강도 표", "한 지표만 추세 반대", F.activityTableFig(["활동", "심장박동", "숨쉬기"], [["쉬기", "느림", "느림"], ["걷기", "보통", "보통"], ["달리기", "빠름", "빠름"]]));

console.log(`샘플 ${S.length}종 렌더`);
fs.mkdirSync("qa/shots", { recursive: true });
fs.mkdirSync("tmp/g2u6v2-helpers", { recursive: true });

const CHUNK = 8;
const pages = [];
for (let i = 0; i < S.length; i += CHUNK) pages.push(S.slice(i, i + CHUNK));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
for (let p = 0; p < pages.length; p++) {
  const cells = pages[p]
    .map(
      (s) => `<div style="border:1px solid #ddd;border-radius:10px;padding:8px;background:#fff">
      <div style="font:700 12px sans-serif;color:#333">${s.name}</div>
      <div style="font:600 11px sans-serif;color:#888;margin-bottom:6px">${s.note}</div>
      <div style="max-width:352px">${s.svg}</div></div>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><body style="background:#F2F4F6;margin:0;padding:12px;font-family:Pretendard,-apple-system,sans-serif">
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">${cells}</div></body>`;
  const file = path.resolve(`tmp/g2u6v2-helpers/page-${p + 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto(`file:///${file.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `qa/shots/g2u6v2-helpers-${p + 1}.png`, fullPage: true });
  console.log(`SAVED qa/shots/g2u6v2-helpers-${p + 1}.png (${pages[p].length}종)`);
}
await browser.close();
