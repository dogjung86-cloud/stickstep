// 중1 수학 Ⅳ 기본 도형 — 13레슨 전 스텝 실플레이 E2E. node qa/e2e-math4.mjs (PORT 기본 5173)
// 훅 13장면·랩 12종(자유 드로잉·각 드래그·회전 관측·수선 드래그·직선 조작·3D 상자 회전·
// 각 자리 탭·평행 스냅·작도 스테퍼·삼각형 공장·합동 감별)·넘패드 드릴·퀴즈 전 유형.
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(고정 횟수 금지), 실행 중 src 편집 금지.
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
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 2400, lessons, minigame: {},
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
const waitBtn = async (re, wait = 420, timeout = 20000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 16000 });
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
const orderAuto = async (chipRes) => {
  await page.waitForSelector(".ord-chip", { timeout: 9000 });
  for (const re of chipRes) {
    await page.evaluate((re) => {
      const c = [...document.querySelectorAll(".ord-chip")].find((x) => new RegExp(re).test(x.textContent));
      c?.click();
    }, re);
    await W(240);
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
  if (s.startsWith("-")) await npKey("+/−");
  for (const ch of s.replace(/^-/, "")) {
    if (ch === "/") await npKey("↓ 분모");
    else if (ch === ".") await npKey("·");
    else await npKey(ch);
  }
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

/* ── SVG viewBox 좌표 → pointer 이벤트(모든 기하 랩 공용) ── */
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
/** down → 중간 move들 → up 드래그 시퀀스. */
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
console.log("=== 중1 수학 Ⅳ e2e 시작 ===");

// 홈: Ⅳ 단원 탭으로
await page.waitForSelector(".unit-tab", { timeout: 9000 });
await clickBtn("IV\\. 기본 도형", 700);
const nodeCount = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
log(`홈 지도 노드: ${nodeCount}`);
await shot("math4-home");

/* ================= L1 점, 선, 면 ================= */
await openLesson("점·선·면");
log(`L1: ${await h1()}`);
await waitBtn("불꽃막대 휘두르기", 2100);
await hookChoice();
await shot("math4-l1-hook");
await clickCTA(); // traceLab 진입
await page.waitForSelector(".mtl-stage svg", { timeout: 9000 });
// 점 3개
for (const [x, y] of [[80, 60], [170, 90], [250, 60]]) { await svgPt(".mtl-stage svg", x, y, 340, 264); await W(300); }
await W(1700);
// 선(누적 120px 이상)
await svgDrag(".mtl-stage svg", [[60, 150], [120, 130], [190, 150], [260, 130]], 340, 264);
await W(1900);
// 면(손잡이 x=50, y=132에서 오른쪽으로 쓸기)
await untilChip("fc", async () => {
  await svgDrag(".mtl-stage svg", [[52, 132], [120, 132], [200, 132], [270, 132]], 340, 264, 60);
}, 6, "면 쓸기");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([8, 12, 6, 9, 5, 8]);
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 직선·반직선·선분 ================= */
await openLesson("직선·반직선·선분");
log(`L2: ${await h1()}`);
await waitBtn("건물 벽에 쏘기", 1400);
await waitBtn("밤하늘로 쏘기", 1400);
await hookChoice();
await clickCTA(); // rayLab
await page.waitForSelector(".mrl-mode", { timeout: 9000 });
// 미션: 선분 → 직선 → 반직선 AB → 반직선 BA → "다르다"
const rayMode = async (nameRe) => {
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".mrl-mode")].find((x) => x.offsetParent && new RegExp(re).test(x.textContent));
    b?.click();
  }, nameRe);
  await W(1500);
};
await rayMode("선분");
await rayMode("직선");
await rayMode("반직선AB|반직선.*AB");
// 반직선 BA 미션(모드 버튼 4번째)
await page.evaluate(() => { const bs = [...document.querySelectorAll(".mrl-mode")]; bs[3]?.click(); });
await W(1700);
await waitBtn("다르다", 1300);
// 기호 판독 3연속: 보이는 기호 마크(↔/→/―)에 맞는 그림 보기 클릭
for (let r = 0; r < 3; r++) {
  await page.waitForSelector(".mrl-opt", { timeout: 9000 });
  await page.evaluate(() => {
    const sym = document.querySelector(".mrl-sym")?.textContent ?? "";
    const want = sym.includes("↔") ? "양쪽" : sym.includes("→") ? "한쪽" : "두 점";
    const opt = [...document.querySelectorAll(".mrl-opt")].find((o) => (o.getAttribute("aria-label") ?? "").includes(want));
    opt?.click();
  });
  await W(1400);
}
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await oxPick(false);
await quiz(0);
await multiQuiz([0, 1]);
await drill([6, 14, 5, 15, "4.5", 1]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 각 ================= */
await openLesson("^각|레슨.*각");
log(`L3: ${await h1()}`);
await waitBtn("3시 정각으로", 1500);
await waitBtn("6시 정각으로", 2300);
await hookChoice();
await clickCTA(); // angleLab
await page.waitForSelector(".mal-stage svg", { timeout: 9000 });
// O(170,182)에서 각도별 위치 드롭: 예각 40° → 직각 90° → 둔각 125° → 평각 179°
const angleDrop = async (deg) => {
  const r = 105;
  const x = 170 + r * Math.cos((deg * Math.PI) / 180);
  const y = 182 - r * Math.sin((deg * Math.PI) / 180);
  await svgDrag(".mal-stage svg", [[x, y], [x, y]], 340, 222);
  await W(700);
};
await angleDrop(40);
await angleDrop(90);
await angleDrop(125);
await untilChip("straight", async (t) => { await angleDrop(178 + Math.min(t, 1)); }, 6, "평각");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await binSortAuto([
  ["35", "예각"], ["90", "직각"], ["118", "둔각"], ["180", "평각"], ["89", "예각"], ["152", "둔각"],
]);
await oxPick(false);
await quiz(0);
await drill([90, 180, 45, 30, 90, 90]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 맞꼭지각 ================= */
await openLesson("맞꼭지각");
log(`L4: ${await h1()}`);
await waitBtn("가위 벌리기", 2200);
await hookChoice();
await clickCTA(); // vertAngleLab
await page.waitForSelector(".mvl-stage svg", { timeout: 9000 });
// 관찰 기록 3회(서로 다른 각도로 회전 후 기록하기)
const mvlDrag = async (deg) => {
  const r = 108;
  const x = 170 + r * Math.cos((deg * Math.PI) / 180);
  const y = 128 - r * Math.sin((deg * Math.PI) / 180);
  await svgDrag(".mvl-stage svg", [[x, y], [x, y]], 340, 256);
  await W(300);
};
for (const d of [50, 95, 140]) {
  await mvlDrag(d);
  await waitBtn("기록하기", 800);
}
await waitBtn("비밀 보기", 600);
await W(6200); // 평각 연출 시퀀스 대기
// 정밀 조준: ∠a=50 부근 탐색
await untilChip("aim", async (t) => { await mvlDrag(62 + (t % 7)); }, 10, "정밀 조준");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([65, 115, 360, 40, 2, 48]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 수직과 수선 ================= */
await openLesson("수직과 수선");
log(`L5: ${await h1()}`);
await waitBtn("기록 재기", 2400);
await hookChoice();
await clickCTA(); // perpLab
await page.waitForSelector(".mpl-stage svg", { timeout: 9000 });
// 서로 다른 3곳 드롭(핸들 초기 x=260) → 최단(170)
await svgDrag(".mpl-stage svg", [[260, 188], [100, 188]], 340, 250);
await W(500);
await svgDrag(".mpl-stage svg", [[100, 188], [60, 188]], 340, 250);
await W(500);
await svgDrag(".mpl-stage svg", [[60, 188], [250, 188]], 340, 250);
await W(700);
await untilChip("min", async () => {
  await svgDrag(".mpl-stage svg", [[250, 188], [170, 188]], 340, 250);
  await W(4300); // 용어 카드 체인
}, 4, "최단");
await W(1600); // 판정 장면 전환
// (가) 수직 선분 탭: (184, 125) 부근
await untilChip("judge", async () => {
  await svgPt(".mpl-stage svg", 184, 125, 340, 250);
}, 6, "기록 판정");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await multiQuiz([0, 1]);
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([90, 3, 4, 8, 0, 90]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 평면의 위치 관계 ================= */
await openLesson("평면의 위치 관계");
log(`L6: ${await h1()}`);
await waitBtn("끝까지 바라보기", 2200);
await hookChoice();
await clickCTA(); // lineRelLab
await page.waitForSelector(".mlr-stage svg", { timeout: 9000 });
// 회전 손잡이는 m과 함께 움직이므로, 실제 위치(getBoundingClientRect)에서 잡아 목표점으로 끈다
const rotDrag = async (tx, ty) => {
  await page.evaluate(([tx, ty]) => {
    const svg = document.querySelector(".mlr-stage svg");
    const h = svg.querySelector(".mlr-hrot");
    const hr = h.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    const sx = hr.x + hr.width / 2;
    const sy = hr.y + hr.height / 2;
    const cx = sr.left + (tx / 340) * sr.width;
    const cy = sr.top + (ty / 250) * sr.height;
    const o = { bubbles: true, pointerId: 23, isPrimary: true };
    svg.dispatchEvent(new PointerEvent("pointerdown", { ...o, clientX: sx, clientY: sy }));
    svg.dispatchEvent(new PointerEvent("pointermove", { ...o, clientX: (sx + cx) / 2, clientY: (sy + cy) / 2 }));
    svg.dispatchEvent(new PointerEvent("pointermove", { ...o, clientX: cx, clientY: cy }));
    svg.dispatchEvent(new PointerEvent("pointerup", { ...o, clientX: cx, clientY: cy }));
  }, [tx, ty]);
  await W(600);
};
// ① 크게 기울여 만남
await untilChip("meet", async () => { await rotDrag(300, 130); }, 6, "만남");
// ② 수평 복귀 → 평행 스냅
await untilChip("para", async () => { await rotDrag(300, 75); }, 8, "평행");
// ③ 살짝 기울여(≈2°) 줌아웃 발견
await untilChip("zoom", async (t) => {
  await rotDrag(300, 78.5 + t * 0.8);
  await clickBtn("줌아웃", 1700).catch(() => {});
  await clickBtn("돌아오기", 1500).catch(() => {});
}, 8, "줌아웃");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await multiQuiz([0, 1]);
await oxPick(true);
await quiz(0);
await drill([3, 2, 1, 2, 2, 1]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

/* ================= L7 공간의 위치 관계(기함 boxRelLab) ================= */
await openLesson("공간의 위치 관계");
log(`L7: ${await h1()}`);
await waitBtn("차 보내기", 2700);
await hookChoice();
await clickCTA(); // boxRelLab
await page.waitForSelector(".mbx-stage svg", { timeout: 9000 });
// 탐정의 회전(누적 200° 이상): 좌우 스윙 드래그
for (let s = 0; s < 3; s++) {
  await svgDrag(".mbx-stage svg", [[70, 130], [140, 120], [220, 130], [290, 120]], 340, 262, 30);
  await svgDrag(".mbx-stage svg", [[290, 130], [200, 140], [110, 130], [70, 140]], 340, 262, 30);
}
// 판정 6연속: BC 만남 → CD 평행 → CG 꼬임 → EF 평행 → EH 꼬임 → AD 만남
for (const v of ["만나", "평행", "꼬인", "평행", "꼬인", "만나"]) {
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".mbx-vd")].find((x) => new RegExp(re).test(x.textContent));
    b?.click();
  }, v);
  await W(1500);
}
await shot("math4-l7-boxlab");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await shot("math4-l7-figquiz");
await sheetContinue().catch(() => {});
await quiz(0).catch(async () => {}); // 위 quiz(0)에서 이미 시트 처리된 경우 대비
await quiz(0);
await multiQuiz([0, 2]);
await drill([3, 4, 4, 1, 4, 2]);
await clickBtn("홈으로", 900).catch(() => {});
log("L7 완료");

/* ================= L8 동위각·엇각 ================= */
await openLesson("동위각·엇각");
log(`L8: ${await h1()}`);
await waitBtn("2번 출구의 짝 찾기", 2300);
await hookChoice();
await clickCTA(); // anglePairLab
await page.waitForSelector(".mqp-zone", { timeout: 9000 });
const zoneTap = async (id) => {
  await page.evaluate((id) => {
    const z = document.querySelector(`.mqp-zone[data-ang="${id}"]`);
    z?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, id);
  await W(1800);
};
await zoneTap("e"); // a의 동위각
await zoneTap("h"); // d의 동위각
await zoneTap("e"); // c의 엇각
await zoneTap("f"); // d의 엇각
await waitBtn("없어요", 1500); // 함정
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await multiQuiz([0, 2]);
await drill([8, 4, 2, 4, 2, 4]);
await clickBtn("홈으로", 900).catch(() => {});
log("L8 완료");

/* ================= L9 평행선의 성질(기함 parallelLab) ================= */
await openLesson("평행선의 성질");
log(`L9: ${await h1()}`);
await waitBtn("블라인드 살짝 열기", 2400);
await hookChoice();
await clickCTA(); // parallelLab
await page.waitForSelector(".mpr-stage svg", { timeout: 9000 });
// ① 기울여서 차이 관찰(θ≈10°: 손잡이 = P2(140,168) 기준 r128)
const prDrop = async (deg) => {
  const x = 140 + 128 * Math.cos((deg * Math.PI) / 180);
  const y = 168 - 128 * Math.sin((deg * Math.PI) / 180);
  await svgDrag(".mpr-stage svg", [[x, y], [x, y]], 340, 252);
  await W(400);
};
await untilChip("diff", async (t) => { await prDrop(9 + t); }, 6, "차이 관찰");
// ② 평행 스냅(θ≈0)
await untilChip("snap", async () => { await prDrop(0.6); }, 6, "평행 스냅");
// ③ 엇각 연출
await waitBtn("엇각도 재 보기", 1800);
await W(1400);
await shot("math4-l9-parallel");
await clickCTA(); // concept
await clickCTA(); // recap — 자세히 카드 펼쳐 보기
await page.evaluate(() => document.querySelector(".rc-card")?.click());
await W(600);
await shot("math4-l9-recap-more");
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([55, 124, 132, 63, 1, 0]);
await clickBtn("홈으로", 900).catch(() => {});
log("L9 완료");

/* ================= L10 작도 ================= */
await openLesson("^작도|작도$");
log(`L10: ${await h1()}`);
await waitBtn("끈으로 창문 폭 재기", 1800);
await waitBtn("끈 들고 가게 가기", 1800);
await hookChoice();
await clickCTA(); // compassLab
await page.waitForSelector(".mcp-choice", { timeout: 9000 });
await waitBtn("컴퍼스를 A와 B", 2200);
await waitBtn("C를 중심으로 원", 2600);
await waitBtn("확인", 1600);
await waitBtn("O를 중심으로", 2200);
await waitBtn("P를 중심으로 아까와|P를 중심으로 같은", 2200);
await waitBtn("컴퍼스로.*길이 재기", 2000);
await waitBtn("D를 중심으로", 3000);
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await multiQuiz([0, 1]);
await orderAuto(["점 O를 중심으로 원호", "점 P를 중심으로 같은 반지름", "벌어짐을 잰다", "반직선 PC"]);
await oxPick(false);
await quiz(0);
await drill([2, 3, 3, 2, 1, 0]);
await clickBtn("홈으로", 900).catch(() => {});
log("L10 완료");

/* ================= L11 삼각형의 작도 ================= */
await openLesson("삼각형의 작도");
log(`L11: ${await h1()}`);
await waitBtn("삼각형 만들기 도전", 4200);
await hookChoice();
await clickCTA(); // triBuildLab
await page.waitForSelector(".mtb-build", { timeout: 9000 });
const stepAria = async (label, times = 1) => {
  for (let i = 0; i < times; i++) {
    await page.evaluate((label) => {
      const b = document.querySelector(`[aria-label="${label}"]`);
      b?.click();
    }, label);
    await W(160);
  }
};
const buildIdle = () =>
  page.waitForFunction(() => { const b = document.querySelector(".mtb-build"); return b && !b.disabled; }, { timeout: 16000 }).catch(() => {});
await clickBtn("만들어 보기", 1200); // 7·9·16 실패 1
await buildIdle();
await stepAria("a 줄이기", 2); // 16 → 14
await clickBtn("만들어 보기", 1200); // 성공
await buildIdle();
await stepAria("a 늘리기", 4); // 14 → 18
await clickBtn("만들어 보기", 1200); // 실패 2(다른 조합)
await W(3400); // 규칙 배지 + 국면 전환
await page.waitForSelector(".mtb-modes", { timeout: 16000 }).catch(async () => {
  const btns = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => b.offsetParent).map((b) => b.textContent.trim().slice(0, 14)));
  console.log("L11 국면2 미도달, 보이는 버튼:", btns.join(" | "));
});
// 설계도 3장(모드 선택이 잠금에 먹힐 수 있어 .sel 확인 재시도)
for (const m of ["세 변", "두 변과 끼인각", "한 변과 양 끝 각"]) {
  for (let t = 0; t < 10; t++) {
    await clickBtn(m, 300).catch(() => {});
    const sel = await page.evaluate((mm) => {
      const b = [...document.querySelectorAll(".mtb-mode")].find((x) => x.textContent.includes(mm));
      return b?.classList.contains("sel") ?? false;
    }, m);
    if (sel) break;
    await W(650);
  }
  await waitBtn("^작도", 500);
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll(".mtb-build")].find((x) => /작도/.test(x.textContent));
    return b && !b.disabled;
  }, { timeout: 16000 }).catch(() => {});
  await W(400);
}
await waitBtn("끼인각이 아니면", 3600);
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await multiQuiz([0, 1]);
await multiQuiz([0, 2]);
await oxPick(false);
await quiz(0);
await drill([1, 0, 0, 1, 13, 25]);
await clickBtn("홈으로", 900).catch(() => {});
log("L11 완료");

/* ================= L12 삼각형의 합동 ================= */
await openLesson("삼각형의 합동");
log(`L12: ${await h1()}`);
await waitBtn("붕어빵 굽기", 3200);
await hookChoice();
await clickCTA(); // congLab
await page.waitForSelector(".mcg-card", { timeout: 9000 });
const cardTap = async (nameRe) => {
  await page.evaluate((re) => {
    const c = [...document.querySelectorAll(".mcg-card")].find((x) => new RegExp(re).test(x.textContent));
    c?.click();
  }, nameRe);
  await W(500);
};
const judgeTap = async (basis) => {
  await page.waitForSelector(".mcg-jbtn", { timeout: 9000 });
  await page.evaluate((b) => {
    const btn = [...document.querySelectorAll(".mcg-jbtn")].find((x) => x.textContent.includes(b));
    btn?.click();
  }, basis);
  await W(1400);
};
await cardTap("ABC"); await cardTap("MNO"); await judgeTap("SSS");
await cardTap("DEF"); await cardTap("JKL"); await judgeTap("ASA");
await cardTap("GHI"); await cardTap("PQR"); await judgeTap("SAS");
// 대응 순서 미니 문제
await page.waitForSelector(".mcg-quiz.show", { timeout: 9000 });
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".mcg-quiz button")].find((x) => /대응/.test(x.textContent));
  b?.click();
});
await W(1200);
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await multiQuiz([0, 1]);
await oxPick(false);
await quiz(0);
await drill([8, 60, 24, 0, 3, 3]);
await clickBtn("홈으로", 900).catch(() => {});
log("L12 완료");

/* ================= L13 보스전 ================= */
await openLesson("보스전");
log(`L13: ${await h1()}`);
await waitBtn("탈레스의 방법 보기", 3200);
await hookChoice();
await clickCTA(); // concept(브리핑)
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await multiQuiz([0, 2]);
await orderAuto(["거리 BC를 잰다", "배를 보는 각", "교점 D", "BD를 재면"]);
await drill([8, 9, 150, 35, 90, 4, 63, 65, 5, 52]);
await clickBtn("홈으로", 900).catch(() => {});
log("L13 완료");

await W(800);
const done = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("science-app.v1") ?? "{}");
  return Object.keys(st.lessons ?? {}).filter((k) => k.startsWith("m1u4") && st.lessons[k].done).length;
});
await shot("math4-home-done");
console.log(`=== Ⅳ e2e 완료: 완료 레슨 ${done}/13, pageErrors=${pageErrors} ===`);
if (done < 13 || pageErrors > 0) process.exit(1);
await browser.close();
