// m2u6 시험 그림 "저작 전" 샘플 렌더 눈검수(브리프 시그니처 고정용) — m2u4판 문법 계승.
// 신작 4종(m2ExamBranchFig·m2ExamSpinnerFig·m2ExamAreaFig·m2ExamRoadsFig) + 재사용 6종
// (pairGridFig 빈 상태·probLineFig·restGridFig·spinnerFig·mExamTableFig·mExamCardsFig).
// PORT=<포트> node qa/shot-exam-figs-m2u6-sample.mjs (dev 서버 필수)
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5236";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 3000 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });

const count = await page.evaluate(async () => {
  const m = await import("/src/ui/examFiguresMath.ts");
  const f2 = await import("/src/ui/mathFigures2.ts");
  const S = [];
  const add = (t, svg) => S.push([t, svg]);
  // 1. m2ExamBranchFig 완전형(2×3)
  add("branch 완전형: 음료 2 × 사이드 3", m.m2ExamBranchFig({
    head1: "음료", head2: "사이드",
    first: ["콜라", "사이다"],
    second: [["감자", "치즈볼", "너겟"], ["감자", "치즈볼", "너겟"]],
  }));
  // 2. m2ExamBranchFig 재사용 금지형(카드 두 자리)
  add("branch 재사용 금지형: 카드 1·3·5 두 자리", m.m2ExamBranchFig({
    head1: "십의 자리", head2: "일의 자리",
    first: ["1", "3", "5"],
    second: [["3", "5"], ["1", "5"], ["1", "3"]],
  }));
  // 3. m2ExamBranchFig fold형(일부만 그린 그림)
  add("branch fold형: 첫 가지만 펼치고 ㉠", m.m2ExamBranchFig({
    head1: "모자", head2: "옷",
    first: ["가", "나", "다", "라"],
    second: [["티", "후드"], [], [], []],
    fold: [1, 2, 3],
  }));
  // 4. m2ExamSpinnerFig 불균등(반원 당첨 — 칸 수 함정)
  add("spinner 불균등: 당첨 180° + 꽝 90°×2", m.m2ExamSpinnerFig({
    slices: [{ deg: 180, label: "당첨", win: true }, { deg: 90, label: "꽝" }, { deg: 90, label: "꽝" }],
  }));
  // 5. m2ExamSpinnerFig 불균등 3칸
  add("spinner 불균등: 120°·90°·150°", m.m2ExamSpinnerFig({
    slices: [{ deg: 120, label: "가" }, { deg: 90, label: "나", win: true }, { deg: 150, label: "다" }],
  }));
  // 6. m2ExamAreaFig(1/3 × 2/5, 겹침 ㉠)
  add("area 1/3 × 2/5 + ㉠", m.m2ExamAreaFig({
    pn: 1, pd: 3, qn: 2, qd: 5, aLabel: "A, 1/3", bLabel: "B, 2/5", mark: "㉠",
  }));
  // 7. m2ExamRoadsFig 두 구간(경유)
  add("roads 두 구간: 집 2길 서점 3길 학교", m.m2ExamRoadsFig({ stops: ["집", "서점", "학교"], counts: [2, 3] }));
  // 8. m2ExamRoadsFig 한 구간
  add("roads 한 구간: A~B 4길", m.m2ExamRoadsFig({ stops: ["A", "B"], counts: [4] }));
  // 9. pairGridFig 빈 상태(시험 표준 — 강조 금지)
  add("pairGrid 빈 상태(도구 제공용)", f2.pairGridFig(() => false, "두 주사위의 모든 경우"));
  // 10. probLineFig 새 마커
  add("probLine ㉠ 0.25 · ㉡ 1", f2.probLineFig([
    { at: 0.25, label: "㉠", tone: "blue" }, { at: 1, label: "㉡", tone: "green" },
  ]));
  // 11. restGridFig 12칸 중 5
  add("restGrid 12칸 중 5칸(값 라벨 없이)", f2.restGridFig(12, 5, "당첨", "꽝"));
  // 12. spinnerFig 균등 10등분(재사용)
  add("spinner 균등 10등분 별 3칸", f2.spinnerFig(10, [1, 4, 6], "별"));
  // 13. mExamTableFig 기록 표(L9)
  add("table 기록 표(확률 열 없음)", m.mExamTableFig(
    ["버스", "운행(회)", "지연(회)"],
    [["가", "1200", "30"], ["나", "800", "24"], ["다", "1500", "30"]],
    { aria: "버스 회사별 운행 기록 표" },
  ));
  // 14. mExamCardsFig 카드 4장
  add("cards 4장", m.mExamCardsFig(["2", "5", "8", "11"], { title: "카드 4장 중 한 장을 뽑는다" }));

  const box = ([t, svg]) =>
    `<div style="margin:10px;padding:10px;border-radius:12px;background:#fff;border:1px solid #ddd">
      <div style="font:700 12px sans-serif;color:#333;margin-bottom:6px">${t}</div>${svg}</div>`;
  document.body.innerHTML = `<div style="background:#F2F4F6">${S.map(box).join("")}</div>`;
  return S.length;
});
await page.waitForTimeout(400);
const total = await page.evaluate(() => document.body.scrollHeight);
const slices = Math.ceil(total / 2400);
await page.setViewportSize({ width: 420, height: 2400 });
for (let i = 0; i < slices; i++) {
  await page.evaluate((y) => window.scrollTo(0, y), i * 2400);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `qa/shots/exam-m2u6-samples-${i + 1}.png` });
}
console.log(`SAVED qa/shots/exam-m2u6-samples-{1..${slices}}.png — 샘플 ${count}개, 총 높이 ${total}`);
await browser.close();
