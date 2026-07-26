// 중2 VII 전기와 자기 — 8레슨 전 스텝 실플레이 E2E. node qa/e2e-g2u7.mjs (PORT 기본 5173)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const lessons = {};
  // 앞 단원 완료 처리 — VII이 이번 목표 단원
  ["g2u3l1","g2u3l2","g2u3l3","g2u3l4","g2u3l5","g2u3l6","g2u3l7","g2u3l8",
   "g2u4l1","g2u4l2","g2u4l3","g2u4l4","g2u4l5","g2u4l6"].forEach((id) => lessons[id] = { done: true, acc: 95, bestXp: 120 });
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", premium: true, reviewMode: false,
    goalMin: 10, streak: 2, lastStudyDay: null, totalXp: 1400, lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
// 2026-07-21 공개 진입 플로우: 부팅은 항상 스플래시(상시 메인). 탭으로 플립북을 건너뛰고
// "한번 둘러보기"를 눌러야 온보딩 완료 상태가 홈으로 직행한다(정본 = qa/e2e-exam-m2u5.mjs).
// 고정 대기가 아니라 조건 대기 — 콜드 스타트 dev 서버에선 1.2초 뒤에도 스플래시가 아직 없어
// 버튼 클릭이 통째로 헛돌았다(2026-07-26 실사고).
await page.waitForSelector("#sc-splash", { timeout: 25000 });
await page.mouse.click(210, 300); // 플립북 건너뛰기
await page.waitForFunction(
  () => [...document.querySelectorAll("button")].some((b) => b.textContent.includes("둘러보기")),
  { timeout: 15000 },
);
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((b) => b.textContent.includes("둘러보기")).click();
});
await page.waitForSelector("#sc-home", { timeout: 15000 });
await page.waitForTimeout(600);

const W = (ms) => page.waitForTimeout(ms);
const log = (...a) => console.log(...a);
const clickCTA = async (timeout = 18000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 400) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return b.textContent.trim().slice(0, 24); }
    return null;
  }, re);
  if (t === null) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
  return t;
};
const h1 = () => page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 30));
const hookChoice = async (idx) => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 12000 });
  await page.evaluate((idx) => document.querySelectorAll(".hook-choices.show .hook-choice")[idx].click(), idx);
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(220);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelector(`.opts .opt[data-oi="${i}"]`).click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiPick = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) {
    await page.evaluate((i) => document.querySelector(`.opts .opt[data-oi="${i}"]`).click(), i);
    await W(180);
  }
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
    await W(180);
  }
  await clickCTA(); await sheetContinue();
};
const chipsOn = () => page.evaluate(() => [...document.querySelectorAll(".pn-badge")].filter((b) => b.className.includes(" on")).length);
// 보이는 px-sl 슬라이더 idx를 frac 위치로 탭(세로 무대)
const setSlider = async (idx, frac) => {
  await page.evaluate(([idx, frac]) => {
    const row = document.querySelectorAll(".px-sliders.show .px-sl")[idx];
    const tr = row.querySelector(".px-track").getBoundingClientRect();
    const x = tr.left + frac * tr.width;
    const y = tr.top + tr.height / 2;
    for (const type of ["pointerdown", "pointerup"]) {
      row.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 11, isPrimary: true, clientX: x, clientY: y }));
    }
  }, [idx, frac]);
  await W(300);
};
// 캔버스 포인터 시퀀스 — calc(w,h) => [[type,x,y],...] (캔버스 rect 기준 픽셀)
const canvasPtr = async (calc, wait) => {
  const r = await page.evaluate(() => {
    const cv = document.querySelector(".step canvas, .stage canvas");
    const b = cv.getBoundingClientRect();
    return { left: b.left, top: b.top, width: b.width, height: b.height };
  });
  const pts = calc(r.width, r.height);
  await page.evaluate(([pts, left, top]) => {
    const cv = document.querySelector(".step canvas, .stage canvas");
    for (const [type, x, y] of pts) {
      cv.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 7, isPrimary: true, pointerType: "touch",
        clientX: left + x, clientY: top + y,
      }));
    }
  }, [pts, r.left, r.top]);
  await W(wait ?? 200);
};
// 캔버스 키보드(랩들의 keydown 단축키)
const canvasKey = async (key, wait = 220) => {
  await page.evaluate((key) => {
    const cv = document.querySelector(".step canvas, .stage canvas");
    cv.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  }, key);
  await W(wait);
};

const openNextLesson = async () => {
  await page.evaluate(() => {
    const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("전기와 자기"));
    t?.click();
  });
  await W(650);
  await page.waitForSelector(".gm-node.now", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".gm-node.now").click());
  await W(900);
  log("[e2e] 레슨 진입 →", await h1());
};
const finishLesson = async () => {
  await page.waitForSelector(".done-title", { timeout: 12000 });
  log("  레슨 완료 OK");
  await clickBtn("홈으로", 850);
};

try {
  // ════ L1 마찰 전기 ════
  await openNextLesson();
  // 훅 wintershock: 3컷 코믹 카드 탭 → 예측
  await page.waitForSelector(".he-wcard", { timeout: 9000 });
  for (let i = 0; i < 3; i++) {
    await page.evaluate((i) => document.querySelectorAll(".he-wcard")[i].click(), i);
    await W(750);
  }
  await hookChoice(0);
  await clickCTA();
  log("  frictionLab:", await h1());
  // 기본 도구 = 파란 빨대(척력 먼저) — 빨대 끝(오른쪽)으로 끌기
  await W(700);
  await canvasPtr((w) => {
    const sx = Math.max(52, w * 0.16), sy = 234;
    const tx = w / 2 + 66, ty = 162;
    const seq = [["pointerdown", sx, sy]];
    for (let k = 1; k <= 6; k++) seq.push(["pointermove", sx + (tx - sx) * (k / 6), sy + (ty - sy) * (k / 6)]);
    seq.push(["pointerup", tx, ty]);
    return seq;
  }, 300);
  await W(2800); // 척력 + 근접(빠른 회전) 판정 대기
  log("   칩:", await chipsOn());
  await clickBtn("털가죽", 400);
  await canvasPtr((w) => {
    const sx = w / 2 + 66, sy = 162; // 직전 위치에서 다시 잡기
    return [["pointerdown", sx, sy], ["pointermove", w / 2 + 78, 160], ["pointerup", w / 2 + 78, 160]];
  }, 300);
  await W(2600); // 인력 판정 대기
  log("   칩:", await chipsOn());
  await clickCTA();
  log("  rubLab:", await h1());
  await W(700);
  await canvasPtr((w) => {
    const hx = Math.min(w - 92, w * 0.74), fx = Math.max(96, w * 0.27);
    const seq = [["pointerdown", hx, 148]];
    for (let k = 1; k <= 4; k++) seq.push(["pointermove", hx + (fx - hx) * (k / 4), 148]);
    for (let k = 0; k < 18; k++) seq.push(["pointermove", fx + (k % 2 ? -32 : 32), 148]); // 왕복 문지르기
    seq.push(["pointerup", fx, 148]);
    return seq;
  }, 400);
  await W(2400); // 전자 3개 점프 + 복귀
  await clickBtn("\\(−\\)전기", 700);
  await clickBtn("끌어당김", 900);
  log("   칩:", await chipsOn());
  await clickCTA(); // → recap
  await clickCTA(); // → 문제
  await quiz(2); await quiz(0); await oxPick(true); await quiz(0);
  await finishLesson();

  // ════ L2 정전기 유도 ════
  await openNextLesson();
  // 훅 balloondoll: 그림 탭 반복(문지르기) → 예측 → 끌림 확인
  await page.waitForSelector(".he-bd", { timeout: 9000 });
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => document.querySelector(".he-bd").click());
    await W(550);
  }
  await hookChoice(0);
  await W(1400); // 끌려 붙는 애니
  await clickCTA();
  log("  inductionLab:", await h1());
  await W(700);
  await canvasPtr(() => [["pointerdown", 150, 200], ["pointerup", 150, 200]], 300); // 막대를 깡통 근처로
  await W(3200); // 전자 쏠림(340ms 유지) + 깡통 굴림 60px
  log("   칩:", await chipsOn());
  await clickBtn("\\(\\+\\)막대", 400);
  await canvasPtr(() => [["pointerdown", 56, 200], ["pointerup", 56, 200]], 300);
  await W(2800); // (+)막대 굴림 42px
  log("   칩:", await chipsOn());
  await clickCTA(); // → concept(끌려온 이유)
  log("  concept(유도 원리):", await h1());
  await clickCTA(); await clickCTA(); // recap → 문제
  await quiz(3); await oxPick(false); await quiz(0);
  await finishLesson();

  // ════ L3 전류와 전압 ════
  await openNextLesson();
  // 훅 deadclock: 전지 칸 탭 → 교체 애니 → 예측
  await page.waitForSelector(".he-dc", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".he-dc").click());
  await W(1700);
  await hookChoice(0);
  await clickCTA();
  log("  waterCircuit3d:", await h1());
  await clickBtn("가로 화면", 1500);
  await page.waitForSelector(".rot-overlay.in canvas", { timeout: 9000 });
  await W(2000); // 3D 부팅(space3d 동적 import)
  const ewx = async (fn, ...args) => page.evaluate(([f, a]) => window.__ewx[f](...a), [fn, args]);
  // ① 진짜 포인터 탭 1회 — 레이캐스트 히트 경로 검증(좌표는 DEV 훅이 무대 좌표로 알려 준다)
  await page.evaluate(() => {
    const p = window.__ewx.screenOf("pump");
    const overlay = document.querySelector(".rot-overlay");
    const r = overlay.getBoundingClientRect();
    const native = window.innerWidth > window.innerHeight;
    const cx = native ? r.left + p.x : r.right - p.y;
    const cy = native ? r.top + p.y : r.top + p.x;
    const cv = overlay.querySelector("canvas");
    for (const type of ["pointerdown", "pointerup"])
      cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, isPrimary: true, pointerType: "touch", clientX: cx, clientY: cy }));
  });
  await W(420);
  const pumpCard = await page.evaluate(() => document.querySelector(".ew-card.show")?.textContent ?? "");
  log("   실탭 카드:", pumpCard.includes("펌프") ? "OK" : `FAIL(${pumpCard.slice(0, 20)})`);
  // ② 대응 5쌍 — 물 요소 → 전기 요소 순서로 탭
  for (const [a, b] of [["pump", "battery"], ["flow", "current"], ["wheel", "bulb"], ["pipe", "wire"], ["valve", "switch"]]) {
    await ewx("tap", a); await W(200); await ewx("tap", b); await W(260);
  }
  const pairCard = await page.evaluate(() => document.querySelector(".ew-card.show")?.textContent ?? "");
  log("   짝 카드:", pairCard.includes("밸브") && pairCard.includes("스위치") ? "OK" : "FAIL");
  // ③ 세기 3단 — 약하게·세게를 모두 시험(높이 차·물살이 함께 변한다)
  await ewx("setStep", 2); await W(1500);
  const strong = await page.evaluate(() => window.__ewx.state());
  await ewx("setStep", 0); await W(1700);
  const weak = await page.evaluate(() => window.__ewx.state());
  log("   높이 차:", `${weak.level.toFixed(0)}→${strong.level.toFixed(0)}`, strong.level > weak.level + 20 ? "OK" : "FAIL");
  log("   물살:", `${weak.rate.toFixed(2)}→${strong.rate.toFixed(2)}`, strong.rate > weak.rate ? "OK" : "FAIL");
  // ④ 물레방아가 실제로 돈다
  await ewx("setStep", 2); await W(1000);
  const a1 = (await page.evaluate(() => window.__ewx.state())).ang;
  await W(700);
  const a2 = (await page.evaluate(() => window.__ewx.state())).ang;
  log("   물레방아 회전:", Math.abs(a2 - a1).toFixed(2), Math.abs(a2 - a1) > 0.2 ? "OK" : "FAIL");
  // ⑤ 밸브·스위치 잠갔다 열기 — 물도 전류도 함께 멈춘다
  await clickBtn("밸브·스위치 잠그기", 1600);
  const closed = await page.evaluate(() => window.__ewx.state());
  log("   잠금 물살:", closed.rate.toFixed(2), closed.rate < 0.12 ? "OK" : "FAIL");
  await clickBtn("밸브·스위치 열기", 900);
  log("   칩:", await chipsOn());
  await page.evaluate(() => document.querySelector(".rot-exit")?.click());
  await W(900);
  await clickCTA(); // → concept
  log("  concept(전류 방향):", await h1());
  await clickCTA(); await clickCTA(); // recap → 문제
  await quiz(4); await quiz(2); await oxPick(true); await quiz(0);
  await finishLesson();

  // ════ L4 옴의 법칙 ════
  await openNextLesson();
  // 훅 brightpair: ① 빈 슬롯 탭(전지 끼우기, 밝아짐 관찰) → ② "전류는?" 예측
  await page.waitForSelector(".he-bp", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".he-bp").click());
  await W(1700); // 밝아짐 + 질문 등장(1.2s 뒤 ask)
  await hookChoice(0);
  await clickCTA();
  log("  ohmLab:", await h1());
  await W(600);
  for (const v of [1, 2, 3, 4]) { await setSlider(0, v / 6); await clickBtn("이 지점 기록", 500); }
  await clickBtn("짧은", 500);
  for (const v of [1, 2, 3, 4]) { await setSlider(0, v / 6); await clickBtn("이 지점 기록", 500); }
  // ② 저항 바꾸기 — 3V 고정, 길이 1·2·3배 기록 → 반비례 곡선
  await clickBtn("저항 바꾸기", 600);
  await clickBtn("이 지점 기록", 500); // 길이 1배(기본)
  await clickBtn("길이 2배", 400); await clickBtn("이 지점 기록", 500);
  await clickBtn("길이 3배", 400); await clickBtn("이 지점 기록", 500);
  log("   칩:", await chipsOn());
  await clickCTA(); // → concept(V=IR 유도)
  log("  concept(옴):", await h1());
  await clickCTA(); await clickCTA(); // recap → 문제
  await quiz(2); await quiz(2);
  await binSortAuto([["구리", "도체"], ["은수저", "도체"], ["철못", "도체"], ["유리", "부도체"], ["고무", "부도체"], ["플라스틱", "부도체"]]);
  await oxPick(false);
  await finishLesson();

  // ════ L5 저항의 연결 ════
  await openNextLesson();
  // 훅 multitap: ① 플러그 셋 꽂기 → ② 예측 → ③ 하나 뽑아 검증
  await page.waitForSelector(".he-mt .he-plug", { timeout: 9000 });
  for (let i = 0; i < 3; i++) {
    await page.evaluate((i) => {
      document.querySelectorAll(".he-mt .he-plug")[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, i);
    await W(650);
  }
  await hookChoice(0);
  await page.evaluate(() => {
    const plug = document.querySelector(".he-mt .he-plug");
    plug?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await W(1400);
  await clickCTA();
  log("  circuitLab:", await h1());
  await W(600);
  await canvasKey("Enter", 900); // 스위치 닫기 → 기준 밝기
  await W(800);
  await clickBtn("직렬", 500); await W(1000);
  await clickBtn("병렬", 500); await W(1000);
  await canvasKey("1", 700); // 병렬에서 하나 빼기 → 생존
  await canvasKey("1", 500); // 다시 끼우기
  await clickBtn("직렬", 500);
  await canvasKey("1", 700); // 직렬에서 하나 빼기 → 전멸
  log("   칩:", await chipsOn());
  await clickCTA(); // → concept
  log("  concept(직렬·병렬):", await h1());
  await clickCTA(); await clickCTA(); // recap → 문제
  await quiz(0);
  await binSortAuto([["1개일 때와 같다", "병렬"], ["다른 전구도 꺼진다", "직렬"], ["전압이 모두 같다", "병렬"], ["어두워진다", "직렬"], ["멀티탭", "병렬"], ["어디서나 같다", "직렬"]]);
  await quiz(0); await oxPick(true);
  await finishLesson();

  // ════ L6 전기 에너지 ════
  await openNextLesson();
  // 훅 labelpeek: 다리미·충전기 카드 두 장 플립
  await page.waitForSelector(".he-lcard", { timeout: 9000 });
  for (let i = 0; i < 2; i++) {
    await page.evaluate((i) => document.querySelectorAll(".he-lcard")[i].click(), i);
    await W(900);
  }
  await clickCTA();
  log("  concept(소비 전력):", await h1());
  await clickCTA(); // → binSort
  await binSortAuto([["LED", "빛"], ["무대", "빛"], ["선풍기", "운동"], ["세탁기", "운동"], ["다리미", "열"], ["난로", "열"]]);
  await clickCTA(); // recap → 문제
  await quiz(4); await quiz(0); await oxPick(true);
  await finishLesson();

  // ════ L7 전류의 자기장 ════
  await openNextLesson();
  // 훅 compasswire: ① 스위치를 먼저 켠다(바늘 홱) → ② "왜 움직였을까" 예측
  await page.waitForSelector(".he-cw", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".he-cw").click());
  await W(1700); // 홱 + 질문 등장(1.2s 뒤 ask)
  await hookChoice(0);
  await clickCTA();
  log("  coilFieldLab:", await h1());
  await W(600);
  await clickBtn("전류 켜기", 1400);
  await clickBtn("방향 바꾸기", 1400);
  await setSlider(0, 0.97); await W(900);
  await setSlider(0, 0.03); await W(900);
  log("   칩:", await chipsOn());
  await clickCTA(); // → concept(오른손 감싸쥐기 팁)
  log("  concept(오른손 팁):", await h1());
  await clickCTA(); await clickCTA(); // recap → 문제
  await quiz(2); await oxPick(true); await quiz(0); // ox 정답 O("멀수록 바늘이 덜 돈다" 정정 반영)
  await finishLesson();

  // ════ L8 자기장 속 전류가 받는 힘 ════
  await openNextLesson();
  // 훅 ebike: 출발 버튼 → 달리기 애니 → 예측
  await clickBtn("출발", 1800);
  await hookChoice(0);
  await clickCTA();
  log("  swingLab3d:", await h1());
  await W(1400); // three.js 로드
  await clickBtn("전류 켜기", 1600);
  await clickBtn("방향 바꾸기", 1400);
  await clickBtn("자석 극 바꾸기", 1400);
  await setSlider(0, 0.97); await W(800);
  await setSlider(0, 0.05); await W(800);
  log("   칩:", await chipsOn());
  await clickCTA(); // → figTabs(그네 세 장면)
  log("  figTabs(그네 3상태):", await h1());
  await clickBtn("전류 방향 반전", 500);
  await clickBtn("자석 극 반전", 500);
  await clickCTA(); // → concept(오른손)
  log("  concept(오른손):", await h1());
  await clickCTA(); // → hotspot(전동기 구조와 원리)
  log("  hotspot(전동기):", await h1());
  await page.waitForSelector(".hs-dot", { timeout: 9000 });
  for (let i = 0; i < 2; i++) {
    await page.evaluate((i) => document.querySelectorAll(".hs-dot")[i].click(), i);
    await W(700);
  }
  await clickCTA(); await clickCTA(); // recap → 문제
  await multiPick([0, 2]); await multiPick([0, 1]);
  await binSortAuto([["선풍기", "받는 힘"], ["드론", "받는 힘"], ["이어폰", "받는 힘"], ["전기 자동차", "받는 힘"], ["기중기", "자기장"], ["잠금장치", "자기장"]]);
  await oxPick(true);
  await finishLesson();

  log(pageErrors === 0 ? "\n✅ 중2 VII 전 레슨 통과 (pageerror 0)" : `\n⚠️ 완주했지만 pageerror ${pageErrors}건`);
} catch (e) {
  console.log("\n❌ 실패:", e.message);
  console.log("   현재 h1:", await h1());
  await page.screenshot({ path: "qa/fail-g2u7.png" });
  process.exitCode = 1;
} finally {
  await browser.close();
}
