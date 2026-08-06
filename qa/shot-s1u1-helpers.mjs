// s1u1 v1 시험 그림 헬퍼 "저작 전" 샘플 갤러리(눈검수) — esbuild 실로드 · dev 서버 불요.
// 실행: node qa/shot-s1u1-helpers.mjs → qa/shots/s1u1-helpers-{1,2}.png
// 합격 기준(주석 명문화 관례): ① 지도 마커·경로가 육지/의도 지점 위(lon/lat 검산과 별개의 눈검수)
// ② socLatBeamFig 세 띠 길이가 ㉮<㉯<㉰로 뚜렷 ③ 장면 6종이 라벨 없이도 정체가 읽힘
// ④ 표·카드·순서도 텍스트 잘림 0 ⑤ 전략 장면 4종 오독 없음(글자 인쇄 0).
import { build } from "esbuild";
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

async function loadMod(entry) {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
  return import(`data:text/javascript;base64,${Buffer.from(r.outputFiles[0].text).toString("base64")}`);
}

const F = await loadMod("src/ui/examFiguresSoc.ts");
const S = await loadMod("src/ui/socFigures.ts");

const cells = [
  // ── 1. 세계지도 계열 ──
  ["socWorldFig 마커", F.socWorldFig({ marks: [{ lon: -60, lat: -3, t: "㉠" }, { lon: 100, lat: 62, t: "㉡" }, { lon: 134, lat: -25, t: "㉢" }], eq: true })],
  ["socWorldFig 경로(하늘길)", F.socWorldFig({ routes: [{ from: [127, 37.5], to: [-74, 40.7], kind: "air" }], marks: [{ lon: 127, lat: 37.5, t: "가" }, { lon: -74, lat: 40.7, t: "나" }] })],
  ["socWorldFig 케이블+바닷길", F.socWorldFig({ routes: [{ from: [127, 35], to: [-122, 37], kind: "cable" }, { from: [5, 52], to: [-48, -24], kind: "sea" }] })],
  ["climateMapFig 레터(재사용)", S.climateMapFig({ letters: [{ lon: -60, lat: -3, t: "㉠" }, { lon: -42, lat: 72, t: "㉡" }] })],
  // ── 2. 위도 광선 ──
  ["socLatBeamFig 기본", F.socLatBeamFig()],
  ["socLatBeamFig 2지점", F.socLatBeamFig({ marks: [{ lat: 4, t: "가" }, { lat: 64, t: "나" }] })],
  // ── 3. 생활 장면 6종 ──
  ["socLifeSceneFig stilt", F.socLifeSceneFig("stilt")],
  ["socLifeSceneFig ger", F.socLifeSceneFig("ger")],
  ["socLifeSceneFig igloo", F.socLifeSceneFig("igloo")],
  ["socLifeSceneFig desertwear", F.socLifeSceneFig("desertwear")],
  ["socLifeSceneFig tundrawear", F.socLifeSceneFig("tundrawear")],
  ["socLifeSceneFig oasis", F.socLifeSceneFig("oasis")],
  // ── 4. 시대 카드·시간 막대 ──
  ["socEraCardsFig 이름", F.socEraCardsFig()],
  ["socEraCardsFig hide", F.socEraCardsFig({ hide: true })],
  ["socTimeBarsFig", F.socTimeBarsFig([{ name: "돛단배", frac: 1 }, { name: "증기선", frac: 0.45 }, { name: "항공기", frac: 0.08 }, { name: "인터넷", frac: 0.015 }])],
  // ── 5. 동심원·표·대화·순서도 ──
  ["socScaleRingsFig 기본", F.socScaleRingsFig()],
  ["socScaleRingsFig 라벨+점", F.socScaleRingsFig({ labels: ["동네", "우리나라", "세계"], dots: [{ ring: 0, t: "가" }, { ring: 1, t: "나" }, { ring: 2, t: "다" }] })],
  ["socTableFig 2열", F.socTableFig(["기후", "주로 먹는 곡물"], [["덥고 비 많음", "쌀"], ["서늘·건조", "밀"], ["사막 오아시스", "대추야자"]], { firstColHead: true, aria: "기후와 곡물 표" })],
  ["socTableFig 3열", F.socTableFig(["구분", "나르는 것", "보기"], [["교통", "사람·물자", "항공기"], ["통신", "정보", "인터넷"]], { firstColHead: true, aria: "교통과 통신 표" })],
  ["socChatFig 2장", F.socChatFig([{ name: "초록", text: "우리 반 친구들이 해외 드라마를 즐겨 봐요." }, { name: "하늘", text: "세계 어느 도시를 가도 비슷한 카페가 있어요." }])],
  ["socFlowFig 4칸", F.socFlowFig(["위치", "자연환경", "생활 모습", "지역의 개성"], {})],
  ["socFlowFig ㉠", F.socFlowFig(["위치", "자연환경", "생활 모습"], { blank: 1 })],
  // ── 6. 전략 장면 4종 + dbox ──
  ["socStrategySceneFig brand", F.socStrategySceneFig("brand")],
  ["socStrategySceneFig gi", F.socStrategySceneFig("gi")],
  ["socStrategySceneFig festival", F.socStrategySceneFig("festival")],
  ["socStrategySceneFig local", F.socStrategySceneFig("local")],
  ["socDbox", F.socDbox([["(가)", "지역의 이름을 믿고 찾는 상표로 만드는 전략이에요."], ["(나)", "그 지역의 기후와 땅 덕분에 특별해진 상품임을 보증해요."]])],
  ["gerFig(재사용)", S.gerFig()],
  ["jeansFig(재사용)", S.jeansFig()],
  ["terrainFig(재사용)", S.terrainFig()],
];

const CHUNK = 15;
mkdirSync("qa/shots", { recursive: true });
const pages = [];
for (let i = 0; i < cells.length; i += CHUNK) pages.push(cells.slice(i, i + CHUNK));

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2 });
for (let p = 0; p < pages.length; p++) {
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{font-family:"Pretendard","Malgun Gothic",sans-serif;background:#F6F7F9;margin:0;padding:14px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .cell{background:#fff;border:1px solid #E2E6EA;border-radius:12px;padding:10px}
    .cell h4{margin:0 0 8px;font-size:12px;color:#556}
    .cell svg{width:100%;height:auto;display:block}
  </style><div class="grid">${pages[p].map(([t, svg]) => `<div class="cell"><h4>${t}</h4>${svg}</div>`).join("")}</div>`;
  writeFileSync(`qa/shots/_s1u1-helpers-${p + 1}.html`, html);
  await page.goto(`file:///${process.cwd().replace(/\\/g, "/")}/qa/shots/_s1u1-helpers-${p + 1}.html`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `qa/shots/s1u1-helpers-${p + 1}.png`, fullPage: true });
  console.log(`saved qa/shots/s1u1-helpers-${p + 1}.png (${pages[p].length} cells)`);
}
await browser.close();
