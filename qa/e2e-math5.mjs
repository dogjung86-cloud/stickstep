// 중1 수학 Ⅴ 평면도형과 입체도형 — 14레슨 전 스텝 실플레이 E2E. node qa/e2e-math5.mjs (PORT 기본 5173)
// 훅 14장면·랩 13종(대각선 탭·각 조각 드래그·부채살 탭·둘레 걷기·원 부품·부채꼴 2모드·
// 3D 다면체 회전·정다면체 접기·물레 스와이프·전개도 펼치기·모래 붓기·구 실험)·넘패드 드릴·퀴즈 전 유형.
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(고정 횟수 금지), 실행 중 src 편집 금지,
// 조작 후 위치가 변하는 핸들은 getBoundingClientRect 실좌표(원 위 손잡이 등)로 잡는다.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5173";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  for (let i = 1; i <= 12; i++) lessons[`m1u1l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 9; i++) lessons[`m1u2l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 9; i++) lessons[`m1u3l${i}`] = { done: true, acc: 95, bestXp: 120 };
  for (let i = 1; i <= 13; i++) lessons[`m1u4l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 3200, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 26000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (!t) throw new Error(`clickBtn 실패: /${re}/ @ ${await h1()}`);
  await W(wait);
};
const waitBtn = async (re, wait = 420, timeout = 22000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 18000 });
  await page.evaluate(() => document.querySelector(".hook-choices.show .hook-choice").click());
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiQuiz = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) { await page.evaluate((i) => document.querySelectorAll(".opts .opt")[i].click(), i); await W(160); }
  await clickCTA(); await sheetContinue();
};
const oxPick = async (v) => {
  await page.waitForSelector(".ox-btn", { timeout: 9000 });
  await page.evaluate((v) => document.querySelector(v ? ".ox-btn.o" : ".ox-btn.x").click(), v);
  await W(220); await clickCTA(); await sheetContinue();
};
const binSortAuto = async (pairs) => {
  await page.waitForSelector(".bin-chip", { timeout: 9000 });
  for (const [chipRe, binRe] of pairs) {
    const ok = await page.evaluate(([cRe, bRe]) => {
      const chip = [...document.querySelectorAll(".bin-tray .bin-chip")].find((c) => new RegExp(cRe).test(c.textContent));
      if (!chip) return `NO_CHIP ${cRe}`;
      chip.click();
      const bin = [...document.querySelectorAll(".bin")].find((b) => new RegExp(bRe).test(b.querySelector(".bin-label")?.textContent ?? ""));
      if (!bin) return `NO_BIN ${bRe}`;
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, [chipRe, binRe]);
    if (ok !== true) throw new Error(`binSort: ${ok}`);
    await W(200);
  }
  await clickCTA(); await sheetContinue();
};
const npKey = async (label) => {
  await page.evaluate((label) => {
    const k = [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled);
    if (!k) throw new Error(`no key ${label}`);
    k.click();
  }, label);
  await W(70);
};
const typeAns = async (ans) => {
  const s = String(ans);
  for (const ch of s) await npKey(ch);
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) { await typeAns(a); await clickCTA(); await W(1050); }
  await clickCTA();
};
const openLesson = async (labelRe) => {
  await page.waitForSelector(".gm-node", { timeout: 9000 });
  const ok = await page.evaluate((re) => {
    const n = [...document.querySelectorAll(".gm-node")].find((x) => new RegExp(re).test(x.getAttribute("aria-label") ?? ""));
    if (!n) return false;
    n.click();
    return true;
  }, labelRe);
  if (!ok) throw new Error(`레슨 노드 없음: ${labelRe}`);
  await W(900);
};

/* ── SVG viewBox 좌표 → pointer 이벤트 ── */
const svgPt = async (sel, vx, vy, VW, VH, kinds = ["pointerdown", "pointerup"], pid = 21) => {
  await page.evaluate(([sel, vx, vy, VW, VH, kinds, pid]) => {
    const svg = document.querySelector(sel);
    if (!svg) throw new Error(`no svg ${sel}`);
    const r = svg.getBoundingClientRect();
    const cx = r.left + (vx / VW) * r.width;
    const cy = r.top + (vy / VH) * r.height;
    const o = { bubbles: true, pointerId: pid, isPrimary: true, clientX: cx, clientY: cy };
    for (const k of kinds) svg.dispatchEvent(new PointerEvent(k, o));
  }, [sel, vx, vy, VW, VH, kinds, pid]);
};
const svgDrag = async (sel, pts, VW, VH, stepWait = 40) => {
  const [x0, y0] = pts[0];
  await svgPt(sel, x0, y0, VW, VH, ["pointerdown"]);
  for (const [x, y] of pts.slice(1)) {
    await svgPt(sel, x, y, VW, VH, ["pointermove"]);
    await W(stepWait);
  }
  const [xe, ye] = pts[pts.length - 1];
  await svgPt(sel, xe, ye, VW, VH, ["pointerup"]);
  await W(280);
};
/** 하위 요소(핸들·카드)에 직접 pointerdown(위치 불변 탭 대상). */
const tapEl = async (sel, idx = 0, wait = 300) => {
  const ok = await page.evaluate(([sel, idx]) => {
    const t = document.querySelectorAll(sel)[idx];
    if (!t) return false;
    t.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 22, isPrimary: true }));
    return true;
  }, [sel, idx]);
  if (!ok) throw new Error(`tapEl 실패: ${sel}[${idx}] @ ${await h1()}`);
  await W(wait);
};
/** 무대 전체 가로 스와이프(물레·전개도 펼치기 — 누적량 채우기). */
const swipeAcross = async (sel, rounds = 4) => {
  for (let r = 0; r < rounds; r++) {
    await svgDrag(sel, [[24, 120], [110, 120], [200, 120], [300, 120]], 340, 240, 30);
  }
};
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 8, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(650);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};

const log = (m) => console.log("  ·", m);
console.log("=== 중1 수학 Ⅴ e2e 시작 ===");

await page.waitForSelector(".unit-tab", { timeout: 9000 });
await clickBtn("V\\. 평면도형과 입체도형", 700);
const nodeCount = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
log(`홈 지도 노드: ${nodeCount}`);
await shot("math5-home");

/* ================= L1 다각형: 대각선 ================= */
await openLesson("대각선");
log(`L1: ${await h1()}`);
await waitBtn("한붓에 별 긋기", 2300);
await waitBtn("꼭짓점 이어 보기", 2500);
await hookChoice();
await clickCTA();
// diagLab: A(0)-C(2), A(0)-D(3) → 국면2: B(1)-D(3), B(1)-E(4), C(2)-E(4) → 비밀 보기
await page.waitForSelector(".mdg-v", { timeout: 9000 });
const dgPair = async (i, j) => { await tapEl(".mdg-v .hit", i, 220); await tapEl(".mdg-v .hit", j, 620); };
await dgPair(0, 2);
await dgPair(0, 3);
await W(2600);
await dgPair(1, 3);
await dgPair(1, 4);
await dgPair(2, 4);
await W(2300);
await waitBtn("비밀 보기", 4600);
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0);
await multiQuiz([0, 1]);
await oxPick(false);
await drill([9, 5, 54, 4, 17, 8]);
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 삼각형의 각 ================= */
await openLesson("삼각형의 각");
log(`L2: ${await h1()}`);
await waitBtn("사다리 더 벌리기", 2100);
await hookChoice();
await clickCTA();
// triSumLab: 조각 3개를 O(170,258/340×300)로 드래그(조각 위치는 transform에서 실시간으로 읽는다)
await page.waitForSelector(".mts-pc", { timeout: 9000 });
const dragPiece = async (idx) => {
  const from = await page.evaluate((idx) => {
    const pc = document.querySelectorAll(".mts-pc")[idx];
    const m = pc?.getAttribute("transform")?.match(/translate\(([\d.]+) ([\d.]+)\)/);
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
  }, idx);
  if (!from) return;
  await page.evaluate(([idx, x, y]) => {
    const svg = document.querySelector(".mts-stage svg");
    const pc = document.querySelectorAll(".mts-pc")[idx];
    const r = svg.getBoundingClientRect();
    const cx = r.left + (x / 340) * r.width;
    const cy = r.top + (y / 300) * r.height;
    pc.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 23, isPrimary: true, clientX: cx, clientY: cy }));
  }, [idx, from[0], from[1]]);
  await svgPt(".mts-stage svg", (from[0] + 170) / 2, (from[1] + 258) / 2, 340, 300, ["pointermove"], 23);
  await W(60);
  await svgPt(".mts-stage svg", 170, 258, 340, 300, ["pointermove"], 23);
  await W(60);
  await svgPt(".mts-stage svg", 170, 258, 340, 300, ["pointerup"], 23);
  await W(620);
};
await dragPiece(0);
await dragPiece(1);
await dragPiece(2);
await W(2200);
// 국면 2: 꼭짓점 드래그(누적 210 넘게 세 번 왕복)
await untilChip("always", async () => {
  await svgDrag(".mts-stage svg", [[152, 46], [230, 60], [110, 100], [180, 44]], 340, 300, 50);
}, 6, "꼭짓점 흔들기");
await W(1400);
await waitBtn("변 BC 늘려 보기", 5200);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([75, 62, 103, 60, 50, 30]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 내각의 합 ================= */
await openLesson("내각의 합");
log(`L3: ${await h1()}`);
await waitBtn("정오각형으로 지어 보기", 2400);
await waitBtn("정육각형으로 지어 보기", 3600);
await hookChoice();
await clickCTA();
// polySplitLab: 오각형 C(2)·D(3) → 육각형 C(2)·D(3)·E(4) → 120° 선택
await page.waitForSelector(".mps-v", { timeout: 9000 });
await tapEl(".mps-v .hit", 2, 750);
await tapEl(".mps-v .hit", 3, 900);
await W(2600);
await tapEl(".mps-v .hit", 2, 700);
await tapEl(".mps-v .hit", 3, 700);
await tapEl(".mps-v .hit", 4, 900);
await W(3400);
await waitBtn("^120°$", 3200);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([360, 1260, 108, 10, 162, 5]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 외각의 합 ================= */
await openLesson("외각의 합");
log(`L4: ${await h1()}`);
await waitBtn("벽 따라 한 바퀴 청소", 8200);
await hookChoice();
await clickCTA();
// walkLab: 오각형 5모퉁이 + 삼각형 3모퉁이 + 45° 선택
await page.waitForSelector(".mwk-btn", { timeout: 9000 });
for (let i = 0; i < 5; i++) await waitBtn("모퉁이", 2300);
await W(2200);
for (let i = 0; i < 3; i++) await waitBtn("모퉁이", 2300);
await W(2400);
await waitBtn("^45°$", 1800);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([60, 360, 9, 30, 9, 135]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 원과 부채꼴 ================= */
await openLesson("원과 부채꼴");
log(`L5: ${await h1()}`);
await waitBtn("웨지로 자르기", 1500);
await waitBtn("반달로 자르기", 2500);
await hookChoice();
await clickCTA();
// circleLab: B 드래그 → 현 긋기 → 부채꼴/활꼴 탭 → 반원 드래그
await page.waitForSelector(".mcl-stage svg", { timeout: 9000 });
const onCircle = (deg) => [170 + 100 * Math.cos((deg * Math.PI) / 180), 140 - 100 * Math.sin((deg * Math.PI) / 180)];
await svgDrag(".mcl-stage svg", [onCircle(320), onCircle(300), onCircle(280), onCircle(258)], 340, 276, 60);
await waitBtn("현 긋기", 2200);
await tapEl('.mcl-tap[data-k="sector"]', 0, 700);
await tapEl('.mcl-tap[data-k="segment"]', 0, 2000);
await untilChip("half", async () => {
  await svgDrag(".mcl-stage svg", [onCircle(300), onCircle(340), onCircle(20), onCircle(25)], 340, 276, 60);
}, 6, "반원 만들기");
await W(1500);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await binSortAuto([["피자", "부채꼴"], ["반달", "활꼴"], ["부채", "부채꼴"], ["식빵", "활꼴"]]);
await oxPick(true);
await drill([180, 2, 4, 2]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 부채꼴의 성질 ================= */
await openLesson("부채꼴 성질");
log(`L6: ${await h1()}`);
await waitBtn("30° 조각 자르기", 1100);
await waitBtn("옆 사람은 60° 조각", 2200);
await hookChoice();
await clickCTA();
// sectorLab ratio: 30→60, 60→90, "짧다" 선택
await page.waitForSelector(".msc-stage svg", { timeout: 9000 });
const onDial = (deg, R = 104) => [170 + R * Math.cos((deg * Math.PI) / 180), 138 - R * Math.sin((deg * Math.PI) / 180)];
await untilChip("x2", async () => {
  await svgDrag(".msc-stage svg", [onDial(30), onDial(42), onDial(54), onDial(60)], 340, 268, 55);
}, 6, "60°");
await untilChip("x3", async () => {
  await svgDrag(".msc-stage svg", [onDial(60), onDial(72), onDial(84), onDial(90)], 340, 268, 55);
}, 6, "90°");
await W(1700);
await waitBtn("3배보다 짧다", 2400);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await oxPick(false);
await multiQuiz([0, 1]);
await drill([12, 35, 90, 60, 90, 20]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

/* ================= L7 호와 넓이: π ================= */
await openLesson("호 길이·넓이");
log(`L7: ${await h1()}`);
await waitBtn("곡선 구간 비교하기", 3200);
await hookChoice();
await clickCTA();
await clickCTA(); // concept(π)
// sectorLab calc: r 5→6, 90→60 / r 6→4, 60→180 / 계산해 보기
await page.waitForSelector(".msc-stepper", { timeout: 9000 });
const onDialR = (deg, r) => {
  const RP = 30 + r * 9;
  return [170 + RP * Math.cos((deg * Math.PI) / 180), 138 - RP * Math.sin((deg * Math.PI) / 180)];
};
await clickBtn("^\\+$", 350);
await untilChip("arc", async () => {
  await svgDrag(".msc-stage svg", [onDialR(90, 6), onDialR(78, 6), onDialR(66, 6), onDialR(60, 6)], 340, 268, 55);
}, 6, "호 2π");
await clickBtn("^−$", 300);
await clickBtn("^−$", 350);
await untilChip("area", async () => {
  await svgDrag(".msc-stage svg", [onDialR(60, 4), onDialR(100, 4), onDialR(140, 4), onDialR(180, 4)], 340, 268, 55);
}, 6, "넓이 8π");
await W(1500);
await waitBtn("계산해 보기", 2300);
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([3, 10, 2, 6, 25, 12]);
await clickBtn("홈으로", 900).catch(() => {});
log("L7 완료");

/* ================= L8 다면체 ================= */
await openLesson("^다면체");
log(`L8: ${await h1()}`);
await waitBtn("불빛에 비춰 보기", 2300);
await hookChoice();
await clickCTA();
// solidLab: 다면체 3종 카드 → 7개 → 자르기 → 오각뿔대
await page.waitForSelector(".msd-card", { timeout: 9000 });
for (const name of ["사각기둥", "삼각뿔", "사각뿔대"]) {
  await page.evaluate((n) => {
    const c = [...document.querySelectorAll(".msd-card")].find((x) => x.textContent.includes(n));
    c?.click();
  }, name);
  await W(420);
}
await W(1900);
await svgDrag(".msd-stage svg", [[120, 120], [200, 140], [260, 110]], 340, 250, 50);
await waitBtn("^7개$", 2400);
await waitBtn("평행하게 자르기", 2800);
await waitBtn("오각뿔대", 1800);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await multiQuiz([0, 1]);
await oxPick(false);
await drill([8, 16, 8, 21, 11, 10]);
await clickBtn("홈으로", 900).catch(() => {});
log("L8 완료");

/* ================= L9 정다면체 ================= */
await openLesson("정다면체");
log(`L9: ${await h1()}`);
await waitBtn("6종 주사위 찾아보기", 2300);
await hookChoice();
await clickCTA();
// platonicLab: 삼각형 3·4·5·6, 사각형 3·4, 오각형 3
await page.waitForSelector(".mpt-fold", { timeout: 9000 });
const setN = async (target) => {
  for (let guard = 0; guard < 8; guard++) {
    const n = await page.evaluate(() => parseInt(document.querySelector(".mpt-nread").textContent));
    if (n === target) return;
    await clickBtn(n < target ? "^\\+$" : "^−$", 200);
  }
};
const fold = async (wait = 1900) => { await clickBtn("^접기!$", wait); };
await setN(3); await fold();
await setN(4); await fold();
await setN(5); await fold();
await setN(6); await fold(1500);
await clickBtn("정사각형", 400);
await fold();
await setN(4); await fold(1500);
await clickBtn("정오각형", 400);
await fold(2200);
await W(1400);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([5, 4, 3, 5, 360, 3]);
await clickBtn("홈으로", 900).catch(() => {});
log("L9 완료");

/* ================= L10 회전체 ================= */
await openLesson("회전체");
log(`L10: ${await h1()}`);
await waitBtn("물레 돌리기", 3400);
await hookChoice();
await clickCTA();
// latheLab: 스핀×3 + 이름, 단면 2방향, 원뿔대
await page.waitForSelector(".mlt-stage svg", { timeout: 9000 });
const spinFull = async () => {
  for (let r = 0; r < 6; r++) {
    const spun = await page.evaluate(() => parseInt(document.querySelector(".mlt-gauge b")?.textContent ?? "0"));
    if (spun >= 360) break;
    await svgDrag(".mlt-stage svg", [[24, 126], [120, 126], [220, 126], [316, 126]], 340, 252, 26);
  }
  await W(900);
};
await spinFull(); await waitBtn("^원기둥$", 1700);
await spinFull(); await waitBtn("^원뿔$", 1700);
await spinFull(); await waitBtn("^구$", 1900);
await W(1200);
await waitBtn("세로로", 500);
await waitBtn("이등변삼각형", 900);
await waitBtn("가로로", 500);
await waitBtn("^원$", 2400);
await spinFull(); await waitBtn("원뿔대", 1700);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await multiQuiz([0, 1, 2]);
await oxPick(true);
await clickBtn("홈으로", 900).catch(() => {});
log("L10 완료");

/* ================= L11 기둥 계산 ================= */
await openLesson("기둥 계산");
log(`L11: ${await h1()}`);
await waitBtn("같은 양 담는 캔 대결", 2400);
await hookChoice();
await clickCTA();
// prismLab: 펼치기 스와이프 → 6π → 5층
await page.waitForSelector(".mpr-stage svg", { timeout: 9000 });
await untilChip("unroll", async () => { await swipeAcross(".mpr-stage svg", 3); }, 6, "펼치기");
await W(1700);
await waitBtn("6π", 3600);
await W(1700);
for (let i = 0; i < 5; i++) await waitBtn("한 층 쌓기", 420);
await W(1800);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([28, 64, 25, 60, 48, 72]);
await clickBtn("홈으로", 900).catch(() => {});
log("L11 완료");

/* ================= L12 뿔 계산 ================= */
await openLesson("뿔 계산");
log(`L12: ${await h1()}`);
await waitBtn("옆선 가위로 자르기", 2600);
await hookChoice();
await clickCTA();
// coneLab: 펼치기 → 15π → 3번(모래)
await page.waitForSelector(".mcn-stage svg", { timeout: 9000 });
await untilChip("unroll", async () => { await swipeAcross(".mcn-stage svg", 3); }, 6, "고깔 펼치기");
await W(1800);
await waitBtn("15π", 3600);
await W(1700);
await waitBtn("^3번$", 5400);
await W(1400);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([21, 36, 40, 14, 3, 50]);
await clickBtn("홈으로", 900).catch(() => {});
log("L12 완료");

/* ================= L13 구 계산 ================= */
await openLesson("구 계산");
log(`L13: ${await h1()}`);
await waitBtn("두 배 크기로 불기", 2300);
await hookChoice();
await clickCTA();
// sphereLab: 4개 → 2/3 → 36π
await page.waitForSelector(".msp-choice", { timeout: 9000 });
await waitBtn("^4개$", 5400);
await page.waitForFunction(() => [...document.querySelectorAll(".msp-choice")].some((b) => b.offsetParent && !b.disabled), { timeout: 12000 });
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".msp-choice")].find((x) => x.textContent.replace(/\s+/g, "").includes("23"));
  b?.click();
});
await W(3800);
await waitBtn("36π", 3600);
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([36, 144, 4, 8, 18, 36]);
await clickBtn("홈으로", 900).catch(() => {});
log("L13 완료");

/* ================= L14 보스전 ================= */
await openLesson("보스전");
log(`L14: ${await h1()}`);
await waitBtn("이끼 걷어 내기", 2600);
await hookChoice();
await clickCTA();
await clickCTA(); // 브리핑
await clickCTA(); // recap
await quiz(0);
await oxPick(true);
await quiz(0);
await drill([44, 60, 1080, 15, 25, 2, 9, 5, 20, 36]);
await clickBtn("홈으로", 900).catch(() => {});
log("L14 완료");

await W(900);
await shot("math5-done");
console.log(`=== 중1 수학 Ⅴ e2e 완료 (pageErrors: ${pageErrors}) ===`);
await browser.close();
process.exit(pageErrors > 0 ? 1 : 0);
