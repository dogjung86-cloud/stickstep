// 중2 VIII 별과 우주 — 8레슨 전 스텝 실플레이 E2E. PORT=3000 node qa/e2e-g2u8.mjs
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  localStorage.setItem("science-app.v1", JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", premium: true, reviewMode: true,
    goalMin: 10, streak: 2, lastStudyDay: null, totalXp: 1400, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

const W = (ms) => page.waitForTimeout(ms);
const log = (...a) => console.log(...a);
const h1 = () => page.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 30));
const openLesson = async (id) => {
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, { onExit: () => {}, onComplete: () => {} }));
  }, id);
  await W(900);
  log(`[${id}] →`, await h1());
};
const clickCTA = async (timeout = 18000) => {
  await page.waitForFunction(() => { const b = document.querySelector(".screen.active button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector(".screen.active button.cta").click());
  await W(560);
};
const clickBtn = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".screen.active button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return null;
  }, re);
  if (t === null) throw new Error(`clickBtn 실패: /${re}/`);
  await W(wait);
};
const hookChoice = async (idx = 0) => {
  await page.waitForSelector(".screen.active .hook-choices.show .hook-choice", { timeout: 12000 });
  await page.evaluate((idx) => document.querySelectorAll(".screen.active .hook-choices.show .hook-choice")[idx].click(), idx);
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(220);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const quiz = async (i) => {
  await page.waitForSelector(".screen.active .opts .opt", { timeout: 9000 });
  await page.evaluate((i) => document.querySelectorAll(".screen.active .opts .opt")[i].click(), i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiPick = async (idxs) => {
  await page.waitForSelector(".screen.active .opts .opt", { timeout: 9000 });
  for (const i of idxs) {
    await page.evaluate((i) => document.querySelectorAll(".screen.active .opts .opt")[i].click(), i);
    await W(160);
  }
  await clickCTA(); await sheetContinue();
};
const oxPick = async (v) => {
  await page.waitForSelector(".screen.active .ox-btn", { timeout: 9000 });
  await page.evaluate((v) => document.querySelector(v ? ".screen.active .ox-btn.o" : ".screen.active .ox-btn.x").click(), v);
  await W(220); await clickCTA(); await sheetContinue();
};
const binSortAuto = async (pairs) => {
  await page.waitForSelector(".screen.active .bin-chip", { timeout: 9000 });
  for (const [chipRe, binRe] of pairs) {
    const ok = await page.evaluate(([cRe, bRe]) => {
      const chip = [...document.querySelectorAll(".screen.active .bin-tray .bin-chip")].find((c) => new RegExp(cRe).test(c.textContent));
      if (!chip) return `NO_CHIP ${cRe}`;
      chip.click();
      const bin = [...document.querySelectorAll(".screen.active .bin")].find((b) => new RegExp(bRe).test(b.querySelector(".bin-label")?.textContent ?? ""));
      if (!bin) return `NO_BIN ${bRe}`;
      (bin.querySelector(".bin-head") ?? bin).click();
      return true;
    }, [chipRe, binRe]);
    if (ok !== true) throw new Error(`binSort: ${ok}`);
    await W(180);
  }
  await clickCTA(); await sheetContinue();
};
const orderAuto = async (res) => {
  await page.waitForSelector(".screen.active .ord-chip", { timeout: 9000 });
  for (const re of res) {
    const ok = await page.evaluate((re) => {
      const chip = [...document.querySelectorAll(".screen.active .ord-pool .ord-chip")].find((c) => new RegExp(re).test(c.textContent));
      if (!chip) return `NO ${re}`;
      chip.click();
      return true;
    }, re);
    if (ok !== true) throw new Error(`order: ${ok}`);
    await W(200);
  }
  await clickCTA(); await sheetContinue();
};
const figTabsAll = async () => {
  await page.waitForSelector(".screen.active .figtabs", { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .seg button").length);
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => document.querySelectorAll(".screen.active .seg button")[i].click(), i);
    await W(360);
  }
  await clickCTA();
};
const hotspotAll = async () => {
  await page.waitForSelector(".screen.active .hs-dot", { timeout: 9000 });
  const n = await page.evaluate(() => document.querySelectorAll(".screen.active .hs-dot").length);
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => document.querySelectorAll(".screen.active .hs-dot")[i].click(), i);
    await W(420);
  }
  await clickCTA();
};
const cvRect = () => page.evaluate(() => {
  const c = document.querySelector(".screen.active canvas");
  const r = c.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
const chipsOn = () => page.evaluate(() => [...document.querySelectorAll(".screen.active .pn-badge")].filter((b) => b.className.includes(" on")).length);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png`, clip: { x: 0, y: 0, width: 420, height: 800 } });

// ══════════ L1 연주 시차 ══════════
await openLesson("g2u8l1");
await clickBtn("왼눈"); await clickBtn("오른눈"); await clickBtn("왼눈");
await hookChoice(0); await shot("g2u8-hook-thumbjump"); await clickCTA(); // hook →
await clickCTA(); // concept →
for (const [re, wait] of [["3월의 지구", 2800], ["여섯 달 뒤", 3600], ["두 방향의 차이", 1100], ["연주 시차는", 1500], ["별을 움직여", 400]]) {
  await clickBtn(re, wait);
}
{
  const r = await cvRect();
  const cx = r.x + r.w / 2;
  await page.mouse.move(cx, r.y + 148); await page.mouse.down();
  for (let y = 148; y <= 204; y += 7) { await page.mouse.move(cx, r.y + y); await W(18); }
  await W(320);
  for (let y = 204; y >= 94; y -= 7) { await page.mouse.move(cx, r.y + y); await W(18); }
  await page.mouse.up(); await W(700);
}
log("  parallax chips:", await chipsOn());
await clickCTA(); // lab →
await clickCTA(); // recap →
await quiz(0); await quiz(0); await oxPick(true); await quiz(0); await multiPick([0, 1, 3]);
log("L1 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700); // 완료 화면 이탈(닫기)

// ══════════ L2 밝기와 거리 ══════════
await openLesson("g2u8l2");
await hookChoice(0); await clickCTA();
{
  const r = await cvRect();
  const cy = r.y + r.h / 2;
  const dPer = (r.w * 0.55) / 2;
  const drag = async (fromX, toX) => {
    await page.mouse.move(r.x + fromX, cy); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { await page.mouse.move(r.x + fromX + ((toX - fromX) * i) / 10, cy); await W(22); }
    await page.mouse.up(); await W(850);
  };
  await drag(60, 60 + dPer); // ×2
  await drag(60, 60 + dPer); // ×3
  await drag(60 + dPer * 2.2, 60 - dPer * 0.2); // ×1
}
log("  starlight chips:", await chipsOn());
await shot("g2u8-starlight-lab");
await clickCTA(); // lab →
await clickCTA(); // concept →
await clickCTA(); // recap →
await quiz(0); await quiz(0); await oxPick(false); await quiz(0);
log("L2 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L3 등급 ══════════
await openLesson("g2u8l3");
await hookChoice(0); await clickCTA();
await clickCTA(); // concept 히파르코스
await figTabsAll(); await shot("g2u8-figtabs-mag");
await clickCTA(); // concept 겉보기/절대
await clickCTA(); // recap
await quiz(0); await quiz(0);
await binSortAuto([
  ["눈에 보이는", "겉보기"], ["거리의 영향", "겉보기"], ["진짜 밝기", "절대"],
  ["10 pc", "절대"], ["−26.7", "겉보기"], ["\\+4.8", "절대"],
]);
await oxPick(true); await quiz(0);
log("L3 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L4 색과 표면 온도 ══════════
await openLesson("g2u8l4");
await hookChoice(0); await clickCTA();
{
  await page.waitForSelector(".screen.active .px-sliders.show .px-track", { timeout: 9000 });
  const tr = await page.evaluate(() => {
    const t = document.querySelector(".screen.active .px-track").getBoundingClientRect();
    return { x: t.left, y: t.top + t.height / 2, w: t.width };
  });
  const slide = async (frac) => {
    await page.mouse.move(tr.x + tr.w * frac, tr.y);
    await page.mouse.down(); await W(80); await page.mouse.up(); await W(750);
  };
  await slide(0.02); await slide(0.29); await slide(0.97);
}
log("  starcolor chips:", await chipsOn());
await clickCTA(); // lab →
await clickCTA(); // recap →
await quiz(0); await quiz(0); await oxPick(false); await quiz(0);
log("L4 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L5 우리은하 (galaxy3d 가로 랩) ══════════
await openLesson("g2u8l5");
await W(1100); await shot("g2u8-hook-milkyband");
await hookChoice(0); await clickCTA();
await clickCTA(); // concept(용어)
await clickBtn("가로 화면", 1600);
await page.waitForSelector(".rot-overlay canvas", { timeout: 9000 });
await W(1600); // three 로드
// 초기 카메라(azim .9, polar .62) 기준 월드 좌표 → 무대 → 뷰포트 좌표로 탭
const tapWorld = async (wx, wy, wz) => {
  await page.evaluate(([wx, wy, wz]) => {
    const overlay = document.querySelector(".rot-overlay");
    const cv = overlay.querySelector("canvas");
    const r = overlay.getBoundingClientRect();
    const w = r.height, h = r.width; // 가로 무대: 논리 폭 = 화면 세로
    const az = 0.9, po = 0.62, D = 20.5, t = Math.tan((40 * Math.PI) / 360);
    const eye = [Math.cos(az) * Math.cos(po) * D, Math.sin(po) * D, Math.sin(az) * Math.cos(po) * D];
    const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
    const zA = norm(eye);
    const xA = norm([zA[2], 0, -zA[0]]);
    const yA = [zA[1] * xA[2] - zA[2] * xA[1], zA[2] * xA[0] - zA[0] * xA[2], zA[0] * xA[1] - zA[1] * xA[0]];
    const v = [wx - eye[0], wy - eye[1], wz - eye[2]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const xv = dot(v, xA), yv = dot(v, yA), zv = dot(v, zA);
    const xn = (xv / -zv) / (t * (w / h)), yn = (yv / -zv) / t;
    const mx = ((xn + 1) / 2) * w, my = ((1 - yn) / 2) * h;
    const cx = r.right - my, cy = r.top + mx;
    for (const type of ["pointerdown", "pointerup"]) {
      cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 9, isPrimary: true, pointerType: "touch", clientX: cx, clientY: cy }));
    }
  }, [wx, wy, wz]);
  await W(700);
};
await tapWorld(0, 0, 0); // 은하 중심 → 은하수 사진 카드
const photoShown = await page.evaluate(() => document.querySelector(".g3d-photo")?.classList.contains("show"));
log("  galaxy photo card:", photoShown);
await shot("g2u8-galaxy3d-photo");
await page.evaluate(() => document.querySelector(".g3d-photo-x")?.click()); await W(400);
await tapWorld(6 * Math.cos(-0.55), 0.05, 6 * Math.sin(-0.55)); // 태양계 마커
// 세로 드래그(azim 유지)로 위 → 옆 시점
const dragV = async (fromY, toY) => {
  await page.evaluate(([fromY, toY]) => {
    const overlay = document.querySelector(".rot-overlay");
    const cv = overlay.querySelector("canvas");
    const r = overlay.getBoundingClientRect();
    const w = r.height;
    const mmap = (mx, my) => ({ cx: r.right - my, cy: r.top + mx });
    const seq = [["pointerdown", w / 2, fromY]];
    const steps = 12;
    for (let i = 1; i <= steps; i++) seq.push(["pointermove", w / 2, fromY + ((toY - fromY) * i) / steps]);
    seq.push(["pointerup", w / 2, toY]);
    for (const [type, mx, my] of seq) {
      const { cx, cy } = mmap(mx, my);
      cv.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: 10, isPrimary: true, pointerType: "touch", clientX: cx, clientY: cy }));
    }
  }, [fromY, toY]);
  await W(900);
};
await dragV(100, 270); // polar +0.78 → 탑뷰(>1.25)
await shot("g2u8-galaxy3d-top");
await dragV(300, 8); // polar −1.34 → 에지온(<0.2)
await shot("g2u8-galaxy3d-side");
log("  galaxy chips:", await chipsOn());
await page.evaluate(() => document.querySelector(".rot-exit")?.click()); await W(900);
await clickCTA(); // lab →
await clickCTA(); // recap →
await quiz(0); await quiz(0); await oxPick(false); await quiz(0);
log("L5 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L6 성단과 성운 ══════════
await openLesson("g2u8l6");
await clickBtn("망원경으로"); await hookChoice(0); await clickCTA();
await clickCTA(); await clickCTA(); // concept ×2
await binSortAuto([
  ["플레이아데스", "산개"], ["M5", "구상"], ["오리온", "성운"], ["말머리", "성운"], ["M78", "성운"],
]);
await clickCTA(); // recap
await quiz(0); await quiz(0); await quiz(0); await oxPick(true);
log("L6 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L7 팽창하는 우주 ══════════
await openLesson("g2u8l7");
await W(900);
const comicImg = await page.evaluate(() => {
  const img = document.querySelector(".screen.active .comic-img");
  return img ? { complete: img.complete, nw: img.naturalWidth } : null;
});
log("  comic img loaded:", JSON.stringify(comicImg));
await shot("g2u8-comic-hubble");
for (let i = 0; i < 7; i++) await clickCTA(); // comic 7컷
{
  const r = await cvRect();
  const CX = r.x + r.w / 2;
  const CY = r.y + 356 / 2 + 8;
  await page.mouse.click(CX + Math.cos(-2.35) * 74, CY + Math.sin(-2.35) * 74 * 0.92); await W(380);
  await page.mouse.click(CX + Math.cos(0.25) * 74, CY + Math.sin(0.25) * 74 * 0.92); await W(450);
  const pump = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".screen.active .swapbtn")].find((x) => /바람 넣기/.test(x.textContent));
    const rr = b.getBoundingClientRect();
    return { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 };
  });
  await page.mouse.move(pump.x, pump.y); await page.mouse.down(); await W(3200); await page.mouse.up(); await W(600);
}
log("  balloon chips:", await chipsOn());
await shot("g2u8-balloon-lab");
await clickCTA(); // lab →
await clickCTA(); // recap →
await quiz(0); await oxPick(true); await multiPick([0, 1, 3]); await quiz(0);
log("L7 DONE");
await page.evaluate(() => document.querySelector(".screen.active .xbtn")?.click()); await W(700);

// ══════════ L8 우주 탐사 ══════════
await openLesson("g2u8l8");
await clickBtn("망원경으로"); await hookChoice(0); await clickCTA();
await figTabsAll(); await shot("g2u8-figtabs-explore");
await orderAuto(["스푸트니크", "아폴로", "허블", "제임스 웹"]);
await clickCTA(); // concept
await clickCTA(); // recap
await quiz(0); await quiz(0); await oxPick(true); await quiz(0);
log("L8 DONE");

console.log(pageErrors === 0 ? "E2E PASS" : `E2E FAIL — page errors: ${pageErrors}`);
await browser.close();
