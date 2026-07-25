// 중2 Ⅵ 동물과 에너지 v2 — 실플레이 E2E.
// 각 랩을 **실제 조작**으로 목표 칩 3개까지 켜고 CTA가 열리는지 확인한다(플레이북 §2 ④ 게이트).
// 캔버스 랩은 논리 좌표(BASE_W=360)를 rect.width/360으로 변환해 canvas에 PointerEvent를 직접 dispatch.
//   PORT=3000 node qa/e2e-g2u6v2.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });

let PASS = 0, FAIL = 0, pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("  PAGEERROR:", e.message); });
const ok = (cond, label) => { if (cond) { PASS++; console.log("  ✓", label); } else { FAIL++; console.log("  ✗", label); } };

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
    premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
  }));
});
await page.route("**/@vite/client", (r) =>
  r.fulfill({
    contentType: "application/javascript",
    body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
  }),
);
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1000);

const W = (ms) => page.waitForTimeout(ms);
const BASE_W = 360;

const openLesson = (id) =>
  page.evaluate(async (lessonId) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    const found = findLesson(lessonId);
    if (!found) throw new Error("레슨 없음: " + lessonId);
    nav.go(createLessonPlayer(found.lesson, { onExit: () => {}, onComplete: () => {} }));
    return found.lesson.steps.map((s) => s.type);
  }, id);

const fwd = () =>
  page.evaluate(() => {
    const b = document.querySelector(".screen.active .xbtn.fwd");
    if (b && b.style.visibility !== "hidden") { b.click(); return true; }
    return false;
  });

const stepType = () => page.evaluate(() => document.querySelector(".screen.active .an-canvas") ? "lab" : "other");

/** 캔버스 논리 좌표에 포인터 이벤트를 쏜다. kind: "tap" | "down" | "up" */
const canvasPoint = (x, y, kind = "tap", pid = 7) =>
  page.evaluate(({ x, y, kind, pid, baseW }) => {
    const cv = document.querySelector(".screen.active .an-canvas");
    if (!cv) return false;
    const r = cv.getBoundingClientRect();
    const k = r.width / baseW;
    const cx = r.left + x * k;
    const cy = r.top + y * k;
    const mk = (type) => new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: pid, clientX: cx, clientY: cy, isPrimary: true, pointerType: "touch" });
    if (kind === "tap") { cv.dispatchEvent(mk("pointerdown")); cv.dispatchEvent(mk("pointerup")); }
    else cv.dispatchEvent(mk(kind === "down" ? "pointerdown" : "pointerup"));
    return true;
  }, { x, y, kind, pid, baseW: BASE_W });

/** 탭-탭 문법: 대상을 집고(down+up 제자리) 목적지를 탭한다. */
async function tapTap(from, to, wait = 200) {
  await canvasPoint(from.x, from.y, "down");
  await canvasPoint(from.x, from.y, "up");
  await W(wait);
  await canvasPoint(to.x, to.y, "down");
  await W(wait);
}

const goals = () => page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.anim.on").length);
const ctaOpen = () =>
  page.evaluate(() => {
    const c = document.querySelector(".screen.active .btn.cta");
    return !!c && !c.disabled;
  });
const clickBtn = (text) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll(".screen.active .an-btn")].find((x) => x.textContent.includes(t));
    if (b) { b.click(); return true; }
    return false;
  }, text);

async function labGate(name) {
  const g = await goals();
  const c = await ctaOpen();
  ok(g === 3, `${name}: 목표 칩 3개 점등 (실제 ${g})`);
  ok(c, `${name}: CTA 개방`);
}

/** 훅 — 조작 버튼 → 선택지 등장 → 오답 선택 시 정답이 초록으로 드러나는지. */
async function playHook(name) {
  await page.evaluate(() => document.querySelector(".screen.active .swapbtn")?.click());
  // 장면 연출 길이는 훅마다 다르다(twoloop은 5초가 넘는다) → 고정 대기 대신 선택지가 뜰 때까지 폴링.
  let n = 0;
  for (let waited = 0; waited < 12000 && n < 3; waited += 300) {
    await W(300);
    n = await page.evaluate(() => document.querySelectorAll(".screen.active .hook-choice").length);
  }
  ok(n >= 3, `${name} 훅: 예측 선택지 ${n}개 등장`);
  // 마지막 보기를 눌러 본다(셔플되므로 오답일 수도 정답일 수도 있다)
  await page.evaluate(() => {
    const cs = [...document.querySelectorAll(".screen.active .hook-choice")];
    cs[cs.length - 1]?.click();
  });
  await W(500);
  const state = await page.evaluate(() => ({
    picked: !!document.querySelector(".screen.active .hook-choice.sel, .screen.active .hook-choice.miss"),
    revealed: !!document.querySelector(".screen.active .hook-choice.reveal"),
    missed: !!document.querySelector(".screen.active .hook-choice.miss"),
    cta: (() => { const c = document.querySelector(".screen.active .btn.cta"); return !!c && !c.disabled; })(),
  }));
  ok(state.picked, `${name} 훅: 선택 반영`);
  ok(!state.missed || state.revealed, `${name} 훅: 오답 선택 시 정답이 초록으로 드러남`);
  ok(state.cta, `${name} 훅: CTA 개방`);
}

// ── 랩별 조작 시나리오 ────────────────────────────────────────────────────
const PICK1 = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ x: 30 + i * 50, y: 366 }));
const PICK2 = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 55 + i * 50, y: 424 }));
const FOOD = [...PICK1, ...PICK2];
const TRAY_MID = { x: 180, y: 112 };

async function playMealLab() {
  // 탄수화물만 3개 → 편식 체험
  for (const i of [0, 1, 2]) await tapTap(FOOD[i], TRAY_MID);
  await W(400);
  ok(await goals() >= 1, "식판 설계소: 편식(탄수화물만) 목표");
  // 에너지원 3종
  for (const i of [3, 6]) await tapTap(FOOD[i], TRAY_MID);
  await W(400);
  ok(await goals() >= 2, "식판 설계소: 에너지원 3종 목표");
  // 6영양소 균형
  for (const i of [8, 10, 12]) await tapTap(FOOD[i], TRAY_MID);
  await W(500);
  await labGate("식판 설계소");
}

const TUBE = { water: 46, rice: 110, onion: 174, egg: 238, oil: 302 };
const BOTTLE = { iodine: 58, biuret: 138, sudan: 218, benedict: 298 };
async function playReagentLab() {
  const pour = async (b, t) => {
    await tapTap({ x: BOTTLE[b], y: 350 }, { x: TUBE[t], y: 180 }, 260);
    await W(900); // pour()의 640ms 판정 지연
  };
  await pour("iodine", "rice");
  await pour("biuret", "egg");
  await pour("sudan", "oil");
  ok(await goals() >= 1, "검출 실험대: 세 가지 검출 목표");
  await pour("benedict", "onion");
  await clickBtn("뜨거운 물");
  await W(700);
  ok(await goals() >= 2, "검출 실험대: 가열 목표");
  await pour("iodine", "water");
  await W(400);
  await labGate("검출 실험대");
}

const ORGAN_TRAY = [46, 114, 182, 250, 318];
const ORGAN_TRAY_Y = [416, 466];
const ORGAN_POS = [
  { x: 180, y: 62 }, { x: 180, y: 118 }, { x: 140, y: 172 }, { x: 180, y: 258 },
  { x: 180, y: 326 }, { x: 180, y: 362 }, { x: 122, y: 58 }, { x: 238, y: 156 },
  { x: 224, y: 194 }, { x: 122, y: 216 },
];
async function playOrganLab() {
  for (let i = 0; i < 10; i++) {
    const from = { x: ORGAN_TRAY[i % 5], y: ORGAN_TRAY_Y[Math.floor(i / 5)] };
    await tapTap(from, ORGAN_POS[i], 170);
  }
  await W(500);
  ok(await goals() >= 2, "소화계 조립소: 소화관·소화샘 배치 목표");
  for (let i = 0; i < 6; i++) { await canvasPoint(ORGAN_POS[i].x, ORGAN_POS[i].y); await W(160); }
  await W(400);
  await labGate("소화계 조립소");
}

const LANE = { starch: 118, protein: 178, fat: 238 };
const TOOL = (i) => ({ x: 62 + (i % 4) * 78, y: 338 + Math.floor(i / 4) * 74 });
async function playEnzymeLab() {
  await tapTap(TOOL(0), { x: 200, y: LANE.starch }, 240); // 입: 아밀레이스 → 녹말
  await W(400);
  ok(await goals() >= 1, "소화효소 공방: 입 목표");
  await clickBtn("다음 기관으로"); await W(500);
  await tapTap(TOOL(0), { x: 200, y: LANE.protein }, 240); // 위: 펩신 → 단백질
  await W(400);
  ok(await goals() >= 2, "소화효소 공방: 위 목표");
  await clickBtn("다음 기관으로"); await W(500);
  await tapTap(TOOL(0), { x: 200, y: LANE.starch }, 240); // 이자액 아밀레이스
  await tapTap(TOOL(1), { x: 200, y: LANE.protein }, 240); // 트립신
  await tapTap(TOOL(2), { x: 200, y: LANE.fat }, 240); // 라이페이스
  await W(500);
  await labGate("소화효소 공방");
}

async function playVilliLab() {
  await clickBtn("영양소 흘려보내기"); await W(9000);
  ok(await goals() >= 1, "표면적 공장: 매끈한 벽 목표");
  await clickBtn("주름 + 융털"); await W(400);
  await clickBtn("영양소 흘려보내기"); await W(9000);
  ok(await goals() >= 2, "표면적 공장: 주름+융털 목표");
  await canvasPoint(180, 225); await W(500); // 융털 탭 → 속 구조
  await labGate("표면적 공장");
}

async function playHeartLab() {
  for (let i = 0; i < 3; i++) {
    await clickBtn("이완"); await W(1900);
    await clickBtn("수축"); await W(1900);
  }
  ok(await goals() >= 1, "심장 펌프실: 한 방향 흐름 목표");
  await clickBtn("판막 있음"); await W(400);
  await clickBtn("수축"); await W(2000);
  ok(await goals() >= 2, "심장 펌프실: 역류 목표");
  await canvasPoint(134, 140); await W(400); // 우심방
  await canvasPoint(226, 240); await W(400); // 좌심실
  await labGate("심장 펌프실");
}


// ── L7 혈액 관찰실 ────────────────────────────────────────────────────────
const CELLS = [
  { x: 58, y: 104, bin: 66 }, { x: 122, y: 84, bin: 66 }, { x: 186, y: 108, bin: 66 },
  { x: 250, y: 84, bin: 180 }, { x: 304, y: 112, bin: 180 }, { x: 156, y: 144, bin: 294 },
];
async function playBloodLab() {
  await clickBtn("원심분리기"); await W(1400);
  await canvasPoint(180, 160); await W(400);   // 위층 = 혈장
  await canvasPoint(180, 278); await W(400);   // 아래층 = 혈구
  ok(await goals() >= 1, "혈액 관찰실: 두 성분 목표");
  await clickBtn("다음 단계"); await W(600);
  for (const c of CELLS) { await tapTap({ x: c.x, y: c.y }, { x: c.bin, y: 254 }, 200); }
  await W(500);
  ok(await goals() >= 2, "혈액 관찰실: 혈구 분류 목표");
  await clickBtn("다음 단계"); await W(600);
  for (let i = 0; i < 3; i++) {
    await canvasPoint(180, 74 + i * 44 + 19); await W(220);
    await canvasPoint(68 + i * 112, 292); await W(320);
  }
  await W(400);
  await labGate("혈액 관찰실");
}

// ── L8 순환 경로 잇기 ──────────────────────────────────────────────────────
const PATH_TAPS = [
  { x: 296, y: 316 }, { x: 236, y: 428 }, { x: 116, y: 408 }, { x: 136, y: 226 },
  { x: 142, y: 282 }, { x: 62, y: 206 }, { x: 112, y: 88 }, { x: 278, y: 104 },
  { x: 214, y: 224 }, { x: 208, y: 278 },
];
async function playPathLab() {
  for (const p of PATH_TAPS) { await canvasPoint(p.x, p.y); await W(320); }
  await W(400);
  ok(await goals() >= 2, "순환 경로: 두 순환 완주 목표");
  for (const p of [{ x: 116, y: 408 }, { x: 136, y: 226 }, { x: 142, y: 282 }, { x: 62, y: 206 }]) {
    await canvasPoint(p.x, p.y); await W(280);
  }
  await W(400);
  await labGate("순환 경로 잇기");
}


// ── L9 호흡운동 모형 ──────────────────────────────────────────────────────
async function playBreathLab() {
  await clickBtn("가로막 내리기"); await W(320);
  await clickBtn("갈비뼈 올리기"); await W(420);
  ok(await goals() >= 1, "호흡운동 모형: 들숨 목표");
  await clickBtn("가로막 올리기"); await W(320);
  await clickBtn("갈비뼈 내리기"); await W(420);
  ok(await goals() >= 2, "호흡운동 모형: 날숨 목표");
  await clickBtn("모형 ↔ 몸 짝짓기"); await W(500);
  // 오른쪽 열은 표시 순서를 엇갈리게 두었다: part i 의 짝은 row (i+2)%4
  for (let i = 0; i < 4; i++) {
    const j = (i + 2) % 4;
    await canvasPoint(91, 90 + i * 52 + 22); await W(220);
    await canvasPoint(269, 90 + j * 52 + 22); await W(300);
  }
  await W(400);
  await labGate("호흡운동 모형");
}

// ── L10 기체 교환소 ────────────────────────────────────────────────────────
async function playGasSwapLab() {
  const swap = async () => {
    for (const x of [62, 120]) { await canvasPoint(x, 158); await W(200); await canvasPoint(269, 184); await W(320); }
    for (const x of [240, 298]) { await canvasPoint(x, 224); await W(200); await canvasPoint(91, 184); await W(320); }
  };
  await swap(); await W(400);
  ok(await goals() >= 1, "기체 교환소: 허파꽈리 목표");
  await clickBtn("다음 장소로"); await W(500);
  await swap(); await W(400);
  ok(await goals() >= 2, "기체 교환소: 조직세포 목표");
  await clickBtn("다음 장소로"); await W(500);
  for (let k = 0; k < 4; k++) { await canvasPoint(180, 106 + k * 52 + 22); await W(300); }
  await W(400);
  await labGate("기체 교환소");
}

// ── L11 콩팥단위 여과실 ────────────────────────────────────────────────────
async function playNephronLab() {
  const BOWMAN = { x: 276, y: 104 };
  const TRAY_Y = (i) => 78 + i * 26;
  for (const i of [0, 1, 2, 3]) { await canvasPoint(36, TRAY_Y(i)); await W(200); await canvasPoint(BOWMAN.x, BOWMAN.y); await W(320); }
  // 큰 물질(혈구)도 한번 시도해야 "크기로 막힌다"를 겪은 것으로 인정된다
  await canvasPoint(36, TRAY_Y(5)); await W(200); await canvasPoint(BOWMAN.x, BOWMAN.y); await W(420);
  await canvasPoint(36, TRAY_Y(4)); await W(200); await canvasPoint(BOWMAN.x, BOWMAN.y); await W(420);
  ok(await goals() >= 1, "콩팥단위: 여과 목표");
  await clickBtn("다음 단계"); await W(500);
  for (const x of [176, 210, 244]) { await canvasPoint(x, 248); await W(200); await canvasPoint(240, 316); await W(320); }
  await W(400);
  ok(await goals() >= 2, "콩팥단위: 재흡수 목표");
  await clickBtn("다음 단계"); await W(500);
  await canvasPoint(300, 316); await W(240); await canvasPoint(240, 248); await W(420);
  await labGate("콩팥단위 여과실");
}

// ── L12 기관계 관제실 ──────────────────────────────────────────────────────
async function playEnergyLab() {
  const CIRC = { x: 180, y: 210 }, CELL = { x: 180, y: 344 }, RESP = { x: 180, y: 84 }, EXC = { x: 298, y: 196 };
  const hub = { x: 180, y: 270 }; // 순환계에 도착한 알갱이 자리
  await canvasPoint(62, 250); await W(220); await canvasPoint(CIRC.x, CIRC.y); await W(340);
  await canvasPoint(hub.x, hub.y); await W(220); await canvasPoint(CELL.x, CELL.y); await W(340);
  await canvasPoint(180, 138); await W(220); await canvasPoint(CIRC.x, CIRC.y); await W(340);
  await canvasPoint(hub.x, hub.y); await W(220); await canvasPoint(CELL.x, CELL.y); await W(600);
  ok(await goals() >= 2, "관제실: 배달 + 세포호흡 목표");
  // 세포호흡 뒤 조직세포에 4개(영양소·산소·이산화 탄소·요소)가 모여 자리가 벌어진다
  await canvasPoint(195, 402); await W(240); await canvasPoint(CIRC.x, CIRC.y); await W(340);
  await canvasPoint(hub.x, hub.y); await W(220); await canvasPoint(RESP.x, RESP.y); await W(400);
  await canvasPoint(210, 402); await W(240); await canvasPoint(CIRC.x, CIRC.y); await W(340);
  await canvasPoint(hub.x, hub.y); await W(220); await canvasPoint(EXC.x, EXC.y); await W(500);
  await labGate("기관계 관제실");
}

/** codex 판 훅(type "hook") — 조작 버튼이 .body-action, 선택지는 .hook-choices.show 안. */
async function playCodexHook(name) {
  await page.waitForSelector(".screen.active .body-action", { timeout: 10000 });
  await page.evaluate(() => document.querySelector(".screen.active .body-action").click());
  let n = 0;
  for (let waited = 0; waited < 12000 && n < 3; waited += 300) {
    await W(300);
    n = await page.evaluate(() => document.querySelectorAll(".screen.active .hook-choices.show .hook-choice").length);
  }
  ok(n >= 3, `${name} 훅(codex): 예측 선택지 ${n}개 등장`);
  await page.evaluate(() => {
    const cs = [...document.querySelectorAll(".screen.active .hook-choices.show .hook-choice")];
    cs[cs.length - 1]?.click();
  });
  await W(500);
  const state = await page.evaluate(() => ({
    picked: !!document.querySelector(".screen.active .hook-choice.sel, .screen.active .hook-choice.miss"),
    revealed: !!document.querySelector(".screen.active .hook-choice.reveal"),
    missed: !!document.querySelector(".screen.active .hook-choice.miss"),
  }));
  ok(state.picked, `${name} 훅(codex): 선택 반영`);
  ok(!state.missed || state.revealed, `${name} 훅(codex): 오답 선택 시 정답이 초록으로 드러남`);
  ok(await ctaOpen(), `${name} 훅(codex): CTA 개방`);
}

// ── codex 판 랩(L4~L7 재사용분) 조작 ───────────────────────────────────────
// 캔버스 셀렉터·목표 칩 클래스가 다르다(.body-lab-canvas / .pn-badge.body).
// 좌표는 qa/e2e-g2u6.mjs(codex 하니스)에서 검증된 값을 그대로 가져왔다.
const bodyDrag = async (pts, pid = 9) => {
  await page.evaluate(({ pts, pid, baseW }) => {
    const cv = document.querySelector(".screen.active .body-lab-canvas");
    if (!cv) throw new Error("codex 랩 캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const k = r.width / baseW;
    const P = ([lx, ly]) => ({ x: r.left + lx * k, y: r.top + ly * k });
    const ev = (type, p, buttons) => cv.dispatchEvent(new PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: pid, isPrimary: true, pointerType: "touch",
      clientX: p.x, clientY: p.y, buttons,
    }));
    ev("pointerdown", P(pts[0]), 1);
    for (let i = 1; i < pts.length; i++) ev("pointermove", P(pts[i]), 1);
    ev("pointerup", P(pts[pts.length - 1]), 0);
  }, { pts, pid, baseW: BASE_W });
  await W(180);
};
const bodyTap = async (lx, ly, pid = 9) => {
  await page.evaluate(({ lx, ly, pid, baseW }) => {
    const cv = document.querySelector(".screen.active .body-lab-canvas");
    if (!cv) throw new Error("codex 랩 캔버스를 찾지 못했어요");
    cv.scrollIntoView({ block: "center" });
    const r = cv.getBoundingClientRect();
    const k = r.width / baseW;
    const p = { x: r.left + lx * k, y: r.top + ly * k };
    for (const type of ["pointerdown", "pointerup"]) {
      cv.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerId: pid, isPrimary: true, pointerType: "touch",
        clientX: p.x, clientY: p.y, buttons: type === "pointerdown" ? 1 : 0,
      }));
    }
  }, { lx, ly, pid, baseW: BASE_W });
  await W(180);
};
async function bodyGate(name) {
  const g = await page.evaluate(() => document.querySelectorAll(".screen.active .pn-badge.body.on").length);
  const c = await ctaOpen();
  ok(g === 3, `${name}: 목표 칩 3개 점등 (실제 ${g})`);
  ok(c, `${name}: CTA 개방`);
}

const LUNG_PATH = [[163, 224], [120, 184], [110, 130], [150, 104], [180, 96], [210, 104], [250, 130], [240, 184], [197, 184]];
const BODY_PATH = [[197, 224], [250, 234], [300, 244], [316, 272], [300, 296], [240, 302], [170, 284], [163, 239]];
async function playCirculationLab() {
  await page.waitForSelector(".screen.active .body-lab-canvas", { timeout: 9000 });
  await bodyTap(180, 199);
  await bodyDrag(LUNG_PATH);
  await bodyDrag(BODY_PATH);
  await bodyGate("순환 여행");
}

async function playBreathModelLab() {
  await page.waitForSelector(".screen.active .bml-controls button", { timeout: 9000 });
  for (const action of ["down", "up", "match"]) {
    await page.evaluate((a) => document.querySelector(`.screen.active .bml-controls button[data-action="${a}"]`).click(), action);
    await W(260);
  }
  await bodyGate("호흡 모형");
}

async function playCodexNephronLab() {
  await page.waitForSelector(".screen.active .body-lab-canvas", { timeout: 9000 });
  const FILTER = [88, 203], CAPIL = [233, 142], TUBULE = [214, 204];
  for (const home of [[44, 70], [98, 70], [150, 70]]) await bodyDrag([home, FILTER]);
  for (const slot of [[162, 204], [214, 204]]) await bodyDrag([slot, CAPIL]);
  await bodyDrag([[300, 142], TUBULE]);
  await bodyGate("네프론");
}

const HUB_C = [180, 182];
async function playBodyIntegrateLab() {
  await page.waitForSelector(".screen.active .body-lab-canvas", { timeout: 9000 });
  const plan = [
    { start: [60, 230], hub: [136, 234], dest: [180, 316] },
    { start: [180, 108], hub: [224, 234], dest: [180, 316] },
    { start: [110, 316], hub: [136, 130], dest: [180, 58] },
    { start: [250, 316], hub: [224, 130], dest: [300, 182] },
  ];
  for (const m of plan) {
    await bodyDrag([m.start, HUB_C]);
    await bodyDrag([m.hub, m.dest]);
  }
  await bodyGate("기관계 통합");
}

// 7레슨 재편(2026-07-26): 내 랩 2종(L1 검출·L3 효소) + codex 랩 4종(L4~L7).
// 나머지 an*Lab 시나리오는 파일에 남겨 둔다(레슨에서 빠졌을 뿐 랩 자체는 살아 있다).
const LAB_PLAY = {
  anReagentLab: playReagentLab,
  anEnzymeLab: playEnzymeLab,
  circulationLab: playCirculationLab,
  breathModelLab: playBreathModelLab,
  nephronLab: playCodexNephronLab,
  bodyIntegrateLab: playBodyIntegrateLab,
};

const LESSONS = (process.env.LESSON ? [process.env.LESSON] : ["g2u6l1", "g2u6l2", "g2u6l3", "g2u6l4", "g2u6l5", "g2u6l6", "g2u6l7"]);

for (const id of LESSONS) {
  const types = await openLesson(id);
  await W(900);
  console.log(`\n== ${id} (${types.length}스텝)`);
  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    if (t === "animalHook") await playHook(id);
    else if (t === "hook") await playCodexHook(id);
    else if (LAB_PLAY[t]) {
      await W(400);
      await LAB_PLAY[t]();
    } else if (t === "concept" || t === "recap") {
      const has = await page.evaluate(() => !!document.querySelector(".screen.active .h1"));
      ok(has, `${id} ${t}: 렌더`);
      if (t === "recap") {
        const n = await page.evaluate(() => {
          const cards = [...document.querySelectorAll(".screen.active .rc-more, .screen.active .rc-more-btn, .screen.active [class*='more']")];
          cards.forEach((c) => c.click?.());
          return document.querySelectorAll(".screen.active .rm-h").length;
        });
        ok(n >= 2, `${id} recap: 자세히 소제목 ${n}개`);
      }
    }
    if (i < types.length - 1) {
      const moved = await fwd();
      if (!moved) { FAIL++; console.log(`  ✗ ${id} 스텝 ${i}(${t}) 이동 실패`); }
      await W(520);
    }
  }
}

console.log(`\n${"=".repeat(46)}`);
console.log(`PASS ${PASS} · FAIL ${FAIL} · PAGEERRORS ${pageErrors}`);
await browser.close();
process.exit(FAIL === 0 && pageErrors === 0 ? 0 : 1);
