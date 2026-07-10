// 중2 III 빛과 파동 — 8레슨 전 스텝 실플레이 E2E (headless Chrome, rAF/포인터 실동작)
// node qa/e2e-g2u3.mjs  (dev 서버 필요 — 포트는 PORT 환경변수, 기본 5173)
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";

const log = (...a) => console.log("[e2e]", ...a);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => {
  pageErrors++;
  console.log("PAGEERROR:", e.message);
});

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  if (!localStorage.getItem(KEY)) {
    localStorage.setItem(KEY, JSON.stringify({
      version: 1, onboarded: true, grade: "g2", viewGrade: "g2", premium: true, reviewMode: false,
      goalMin: 10, streak: 0, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {},
    }));
  }
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// ── 공용 헬퍼 ──────────────────────────────────────────────
const W = (ms) => page.waitForTimeout(ms);
const clickCTA = async (timeout = 16000) => {
  await page.waitForFunction(() => {
    const b = document.querySelector("button.cta");
    return b && !b.disabled;
  }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(600);
};
const clickBtn = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
      .find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return b.textContent.trim().slice(0, 22); }
    return null;
  }, re);
  if (t === null) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
  return t;
};
const h1 = () => page.evaluate(() => document.querySelector(".h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 30));
const hookChoice = async (idx) => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 9000 });
  await page.evaluate((idx) => document.querySelectorAll(".hook-choices.show .hook-choice")[idx].click(), idx);
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(250);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(650);
};
// 퀴즈: n번 보기 → 확인 → 시트 계속
const quiz = async (optIdx) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelector(`.opts .opt[data-oi="${i}"]`).click(), optIdx);
  await W(240);
  await clickCTA();
  await sheetContinue();
};
const oxPick = async (val) => {
  await page.waitForSelector(".ox-btn", { timeout: 9000 });
  await page.evaluate((v) => document.querySelector(v ? ".ox-btn.o" : ".ox-btn.x").click(), val);
  await W(240);
  await clickCTA();
  await sheetContinue();
};
// binSort: [칩 텍스트 정규식, 통 라벨 정규식] 순서대로 탭-탭
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
  await clickCTA();
  await sheetContinue();
};
const orderAuto = async (res) => {
  for (const re of res) {
    await page.evaluate((re) => {
      const chip = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
        .find((x) => new RegExp(re).test(x.textContent) && !x.className.includes("cta"));
      chip?.click();
    }, re);
    await W(240);
  }
  await clickCTA();
  await sheetContinue();
};
// 캔버스 포인터 — 캔버스 rect 기준 픽셀 좌표 계산 함수를 페이지에서 실행
const canvasPtr = async (calc, seq) => {
  const r = await page.evaluate(() => {
    const cv = document.querySelector(".step canvas");
    const b = cv.getBoundingClientRect();
    return { left: b.left, top: b.top, width: b.width, height: b.height };
  });
  const pts = calc(r.width, r.height); // [[type, x, y], ...]
  await page.evaluate(([pts, left, top]) => {
    const cv = document.querySelector(".step canvas");
    for (const [type, x, y] of pts) {
      cv.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 7, isPrimary: true, pointerType: "touch",
        clientX: left + x, clientY: top + y,
      }));
    }
  }, [pts, r.left, r.top]);
  await W(seq ?? 120);
};
const chipsOn = () => page.evaluate(() => [...document.querySelectorAll(".pn-badge")].filter((b) => b.className.includes(" on")).length);
// 보이는 px-sl 슬라이더 idx를 frac 위치로 탭
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
  await W(260);
};

// 홈(중2 트랙 — viewGrade 시드)에서 "빛과 파동" 단원 탭 → 현재 노드 열기
const openNextLesson = async (expectTitle) => {
  await page.waitForSelector(".unit-tab", { timeout: 9000 });
  await page.evaluate(() => {
    const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.includes("빛과 파동"));
    t?.click();
  });
  await W(700);
  await page.waitForSelector(".gm-node.now", { timeout: 9000 });
  await page.evaluate(() => document.querySelector(".gm-node.now").click());
  await W(900);
  const t = await h1();
  log(`레슨 진입 → "${t}" (기대: ${expectTitle})`);
};
const finishLesson = async () => {
  await page.waitForSelector(".done-title", { timeout: 12000 });
  log("  레슨 완료 화면 OK");
  await clickBtn("홈으로", 900);
};

// 각도 랩: 법선 기준 deg로 레이저 위치 탭
const angleSet = (deg, pivotY) => canvasPtr((w, h) => {
  const P = { x: w / 2, y: pivotY(w, h) };
  const rad = (deg * Math.PI) / 180;
  const x = P.x + Math.sin(rad) * 140;
  const y = P.y - Math.cos(rad) * 140;
  return [["pointerdown", x, y], ["pointerup", x, y]];
}, 160);

try {
  // ════ L1 빛의 반사 ════
  await openNextLesson("빛의 반사");
  await clickBtn("거울 돌리기", 500);
  await clickBtn("거울 돌리기", 500);
  await clickBtn("거울 돌리기", 900);
  await clickCTA(); // 훅 → 반사 랩
  log("  reflectLab:", await h1());
  const mirPivot = (w, h) => h - 64;
  await angleSet(52, mirPivot); await W(300);
  await angleSet(18, mirPivot); await W(700); // 탐색 26° 이상 → 예측 등장
  await hookChoice(1); // 60°가 된다
  await angleSet(60, mirPivot); await W(900); // 확인 홀드
  await angleSet(34, mirPivot); await W(900); // 과녁
  log("  reflect chips:", await chipsOn());
  await clickCTA();
  log("  diffuseLab:", await h1());
  await clickBtn("울퉁불퉁", 500);
  await canvasPtr((w, h) => [["pointerdown", 26 + (w - 52) * 0.32, h - 82], ["pointerup", 26 + (w - 52) * 0.32, h - 82]], 350);
  await canvasPtr((w, h) => [["pointerdown", 26 + (w - 52) * 0.68, h - 82], ["pointerup", 26 + (w - 52) * 0.68, h - 82]], 350);
  await clickCTA(); // → recap
  await clickCTA(); // recap → 문제
  await binSortAuto([
    ["잔잔한 호수", "정반사"], ["셀카", "정반사"], ["숟가락", "정반사"],
    ["글씨가 어느", "난반사"], ["스크린", "난반사"], ["칠판", "난반사"],
  ]);
  await quiz(3);
  await oxPick(true);
  await quiz(1);
  await finishLesson();

  // ════ L2 빛의 굴절 ════
  await openNextLesson("빛의 굴절");
  await clickBtn("물 붓기", 1100);
  await hookChoice(0);
  await clickCTA();
  log("  refractLab:", await h1());
  const ifPivot = (w, h) => h * 0.52;
  await angleSet(35, ifPivot); await W(250);
  await angleSet(20, ifPivot); await W(250);
  await angleSet(46, ifPivot); await W(700); // 탐색 → 예측
  await hookChoice(0); // 함께 커진다
  await angleSet(64, ifPivot); await W(900);
  await angleSet(0, ifPivot); await W(900);
  await clickCTA();
  await clickCTA(); // recap
  await quiz(1);
  await oxPick(true);
  await quiz(1);
  await quiz(0);
  await finishLesson();

  // ════ L3 물체를 보는 과정 ════
  await openNextLesson("보는 과정");
  await clickBtn("전등 켜기", 1100);
  await hookChoice(0);
  await clickCTA();
  log("  seeLab:", await h1());
  const tapSee = (fx, fyAbs) => canvasPtr((w, h) => {
    const [x, y] = [typeof fx === "function" ? fx(w, h) : fx * w, fyAbs(w, h)];
    return [["pointerdown", x, y], ["pointerup", x, y]];
  }, 420);
  const L = { x: (w) => w * 0.13, y: () => 86 };
  const EYE = { x: (w) => w * 0.6 - 4, y: (w, h) => h - 170 };
  const T = { x: (w) => w * 0.86, y: (w, h) => h - 92 };
  const F = { x: (w) => w * 0.24, y: (w, h) => h - 22 };
  // 미션 1: 랜턴 → 눈
  await tapSee(L.x, L.y); await tapSee(EYE.x, EYE.y); await W(500);
  // 미션 2: 랜턴 → 텐트 → 눈
  await tapSee(L.x, L.y); await tapSee(T.x, T.y); await tapSee(EYE.x, EYE.y); await W(500);
  // 미션 3: 랜턴 → 물고기 → 눈
  await tapSee(L.x, L.y); await tapSee(F.x, F.y); await tapSee(EYE.x, EYE.y); await W(900);
  // 작살: 실제 물고기 위치
  await tapSee(F.x, F.y); await W(1100);
  await clickCTA();
  await clickCTA(); // recap
  await binSortAuto([
    ["태양", "광원$|^광원"], ["전등", "^광원"], ["반딧불이", "^광원"],
    ["보름달", "아님"], ["손거울", "아님"], ["교재", "아님"],
  ]);
  await quiz(3);
  await oxPick(true);
  await quiz(0);
  await finishLesson();

  // ════ L4 평면거울의 상 ════
  await openNextLesson("평면거울의 상");
  for (let i = 0; i < 3; i++) await page.evaluate(() => document.querySelector(".hlm")?.click()).then(() => W(450));
  await hookChoice(0);
  await clickCTA();
  log("  mirrorImageLab:", await h1());
  const dragObj = (cellsTo) => canvasPtr((w, h) => {
    const mirX = w * 0.58;
    const y = h - 74 - 26;
    // 현재 위치를 몰라도 넓은 히트(46px)로 잡히도록 3.5칸 근처에서 시작 탐색 — 처음은 4칸
    return [
      ["pointerdown", mirX - 4 * 26, y],
      ["pointermove", mirX - cellsTo * 26, y],
      ["pointerup", mirX - cellsTo * 26, y],
    ];
  }, 350);
  // 거리 3번 바꾸기(마지막은 4칸으로 복귀해 다음 드래그의 시작점 유지)
  await dragObj(2.6); await canvasPtr((w, h) => [["pointerdown", w * 0.58 - 2.6 * 26, h - 100], ["pointermove", w * 0.58 - 4.8 * 26, h - 100], ["pointerup", w * 0.58 - 4.8 * 26, h - 100]], 350);
  await canvasPtr((w, h) => [["pointerdown", w * 0.58 - 4.8 * 26, h - 100], ["pointermove", w * 0.58 - 4 * 26, h - 100], ["pointerup", w * 0.58 - 4 * 26, h - 100]], 400);
  await clickBtn("연장", 600);
  // 상(거울 뒤 대칭점) 탭 — 물체가 4칸이므로 상도 4칸
  await canvasPtr((w, h) => [["pointerdown", w * 0.58 + 4 * 26, h - 100], ["pointerup", w * 0.58 + 4 * 26, h - 100]], 500);
  await clickCTA();
  await clickCTA(); // recap
  await orderAuto(["물체에서 반사된 빛", "눈에 들어온 반사", "그 점에서 빛"]);
  await quiz(1);
  await quiz(2);
  await oxPick(false);
  await finishLesson();

  // ════ L5 거울과 렌즈 ════
  await openNextLesson("거울과 렌즈");
  await clickBtn("볼록한 뒷면", 1300);
  await clickCTA();
  // 일반 랩: 3D 관찰소(opticView) — 모드마다 기본 u=300(멀리) → 슬라이더로 가까이
  log("  opticView(관찰소):", await h1());
  await page.waitForSelector(".stage .seg button", { timeout: 12000 });
  await W(1400); // three 동적 로드
  for (const label of ["볼록 거울", "오목 거울", "볼록 렌즈", "오목 렌즈"]) {
    await page.evaluate((label) => {
      const b = [...document.querySelectorAll(".stage-hud .seg button")].find((x) => x.textContent === label);
      b?.click();
    }, label);
    await W(500); // 멀리(기본) 관찰
    await setSlider(0, 0.02); // 가까이
    await W(600);
    log(`  관찰소 ${label} 관찰`);
  }
  await clickCTA();
  log("  mirrorLens(심화 벤치):", await h1());
  await clickBtn("가로 화면", 1400);
  await page.waitForSelector(".rot-overlay.in .sp3-canvas", { timeout: 9000 });
  const benchDrag = async (mode, u0, u1) => {
    await page.evaluate(([mode, u0, u1]) => {
      const overlay = document.querySelector(".rot-overlay");
      const cv = overlay.querySelector(".sp3-canvas");
      const r = overlay.getBoundingClientRect();
      const w = window.innerHeight; // 가로 무대 폭 = 화면 세로
      const h = window.innerWidth;
      const dx = mode.includes("Mirror") ? w * 0.62 : w * 0.5;
      const fire = (type, sx, sy) => cv.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId: 9, isPrimary: true, pointerType: "touch",
        clientX: r.right - sy, clientY: r.top + sx,
      }));
      const y = h * 0.56;
      fire("pointerdown", dx - u0, y);
      fire("pointermove", dx - (u0 + u1) / 2, y);
      fire("pointermove", dx - u1, y);
      fire("pointerup", dx - u1, y);
    }, [mode, u0, u1]);
    await page.waitForTimeout(420);
  };
  const modes = [["cvMirror", "볼록 거울"], ["ccMirror", "오목 거울"], ["cvLens", "볼록 렌즈"], ["ccLens", "오목 렌즈"]];
  for (const [key, label] of modes) {
    await page.evaluate((label) => {
      const b = [...document.querySelectorAll(".lb-seg button")].find((x) => x.textContent === label);
      b?.click();
    }, label);
    await W(400);
    await benchDrag(key, 230, 70); // 가까이
    await benchDrag(key, 70, 215); // 멀리
    log(`  벤치 ${label} 관찰`);
  }
  await W(600);
  await page.evaluate(() => document.querySelector(".rot-exit")?.click());
  await W(800);
  await clickCTA();
  await clickCTA(); // recap
  await binSortAuto([
    ["굽은 도로", "볼록 거울"], ["측면 거울", "볼록 거울"],
    ["화장 거울", "오목 거울"], ["치과", "오목 거울"],
    ["돋보기", "볼록 렌즈"], ["근시", "오목 렌즈"],
  ]);
  await quiz(1);
  await quiz(4);
  await oxPick(false);
  await finishLesson();

  // ════ L6 빛의 합성 ════
  await openNextLesson("빛의 합성");
  await page.evaluate(() => document.querySelector(".hlp")?.click());
  await W(1200);
  await hookChoice(0);
  await clickCTA();
  log("  뉴턴 만화:", await h1());
  for (let c = 0; c < 7; c++) await clickCTA(); // 7컷 — 여섯 번 넘기고 마지막 컷에서 다음 스텝
  log("  objectColorLab:", await h1());
  await hookChoice(2); // 거의 검은색
  const pickLight = async (name) => {
    await page.evaluate((name) => {
      const b = [...document.querySelectorAll(".stage-hud .seg button")].find((x) => x.textContent === name);
      b?.click();
    }, name);
    await W(500);
  };
  await pickLight("빨간");
  await pickLight("초록");
  await pickLight("파란");
  await clickCTA();
  log("  colorMixLab:", await h1());
  const dragLight = (fx0, fy0, fx1, fy1) => canvasPtr((w, h) => [
    ["pointerdown", fx0 * w, fy0 * h],
    ["pointermove", ((fx0 + fx1) / 2) * w, ((fy0 + fy1) / 2) * h],
    ["pointermove", fx1 * w, fy1 * h],
    ["pointerup", fx1 * w, fy1 * h],
  ], 420);
  await dragLight(0.7, 0.34, 0.35, 0.37); // G→R 노랑
  await dragLight(0.35, 0.37, 0.7, 0.34); // G 원위치
  await dragLight(0.5, 0.72, 0.31, 0.42); // B→R 자홍
  await dragLight(0.31, 0.42, 0.7, 0.42); // B→G 청록
  await dragLight(0.3, 0.34, 0.64, 0.38); // R→중앙 흰색
  await clickCTA();
  log("  pixelLab:", await h1());
  const loupeTo = (fx, fy) => canvasPtr((w, h) => {
    const r = { x: 14, y: 14, w: w - 28, h: h - 96 };
    return [["pointerdown", r.x + fx * r.w, r.y + fy * r.h], ["pointerup", r.x + fx * r.w, r.y + fy * r.h]];
  }, 500);
  await loupeTo(0.42, 0.44); // 노랑
  await loupeTo(0.15, 0.85); // 자홍
  await loupeTo(0.68, 0.2); // 흰색
  await page.waitForSelector(".px-sliders.show", { timeout: 9000 });
  await setSlider(1, 0.5); // 초록 절반
  await setSlider(2, 0.02); // 파랑 끄기 → 주황
  await clickCTA();
  await clickCTA(); // recap
  await quiz(3);
  await quiz(3);
  await quiz(1);
  await oxPick(true);
  await quiz(1);
  await finishLesson();

  // ════ L7 파동 ════
  await openNextLesson("파동");
  await clickBtn("돌 던지기", 1100);
  await hookChoice(0);
  await clickCTA();
  log("  waveLab:", await h1());
  await canvasPtr((w, h) => {
    const seq = [["pointerdown", 46, h * 0.46]];
    for (let i = 0; i < 26; i++) seq.push(["pointermove", 46, h * 0.46 + (i % 2 ? -30 : 30)]);
    seq.push(["pointerup", 46, h * 0.46]);
    return seq;
  }, 300);
  // 이벤트 사이 시간을 실제로 벌기 위해 짧게 여러 번 흔들기
  for (let k = 0; k < 6; k++) {
    await canvasPtr((w, h) => [
      ["pointerdown", 46, h * 0.46 - 28],
      ["pointermove", 46, h * 0.46 + 28],
      ["pointermove", 46, h * 0.46 - 28],
      ["pointerup", 46, h * 0.46],
    ], 260);
  }
  await W(1400); // 파동이 탁구공을 지나가길 대기
  await clickBtn("자동 진동 켜기", 700);
  await clickBtn("이름표", 600);
  await setSlider(1, 0.95);
  await W(400);
  await setSlider(1, 0.1);
  await W(600);
  await clickCTA();
  // hotspot find: 순서대로 마루→골→파장→진폭
  log("  hotspot:", await h1());
  for (let i = 0; i < 4; i++) {
    await page.evaluate((i) => document.querySelectorAll(".hs-dot")[i].click(), i);
    await W(420);
  }
  await sheetContinue();
  await clickCTA(); // recap → 문제
  await quiz(2);
  await oxPick(false);
  await quiz(2);
  await quiz(2);
  await finishLesson();

  // ════ L8 소리 ════
  await openNextLesson("소리의 특성");
  await clickBtn("긴 막대", 700);
  await clickBtn("짧은 막대", 900);
  await hookChoice(0);
  await clickCTA();
  log("  soundLab:", await h1());
  await clickBtn("소리 켜기", 600);
  await setSlider(0, 1);
  await W(250);
  await setSlider(0, 0.02);
  await W(250);
  await setSlider(1, 1);
  await W(250);
  await setSlider(1, 0.02);
  await W(250);
  await clickBtn("리코더풍", 400);
  await clickBtn("바이올린풍", 500);
  await clickCTA();
  await clickCTA(); // recap
  await binSortAuto([
    ["실로폰", "세기"], ["볼륨", "세기"],
    ["칼림바", "높낮이"], ["피아노", "높낮이"],
    ["플루트", "음색"], ["목소리", "음색"],
  ]);
  await quiz(1); // 파형 (가),(다) — shuffle:false 라벨 조합, 정답 2번째 칸
  await quiz(2); // 실로폰 ㉢
  await oxPick(true);
  await finishLesson();

  log(`\n완주! 8레슨 전부 통과. pageerror=${pageErrors}`);
} catch (e) {
  console.log("\nE2E 실패:", e.message);
  console.log("현재 화면 h1:", await h1());
  await page.screenshot({ path: "qa/e2e-g2u3-fail.png", fullPage: false });
  console.log("스크린샷: qa/e2e-g2u3-fail.png");
  process.exitCode = 1;
} finally {
  await browser.close();
}
