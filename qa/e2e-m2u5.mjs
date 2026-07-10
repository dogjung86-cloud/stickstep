// 중2 수학 Ⅴ 도형의 닮음과 피타고라스 정리, 11레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u5.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(untilChip), 실행 중 src 편집 금지,
// 보기 클릭은 data-oi(저작 인덱스), 드릴 종료 후는 완료 화면 "홈으로" 버튼.
// 조작 좌표는 svg viewBox 환산 + 드래그 대상은 DOM 실좌표(svgCircleAt). e2e-m2u4.mjs 문법 계승.
// 특이: 훅 traytrick은 swapbtn이 아니라 .tt5-spot 3곳 탭(hookM2u5), scaleTileLab은 svg 스윕 탭.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  const done = { done: true, acc: 100, bestXp: 10 };
  const lessons = {};
  for (let i = 1; i <= 10; i++) lessons[`m2u1l${i}`] = done;
  for (let i = 1; i <= 9; i++) lessons[`m2u2l${i}`] = done;
  for (let i = 1; i <= 10; i++) lessons[`m2u3l${i}`] = done;
  for (let i = 1; i <= 10; i++) lessons[`m2u4l${i}`] = done;
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const ctaEnabled = () => page.evaluate(() => { const b = document.querySelector("button.cta"); return !!b && !b.disabled; });
const clickCTA = async (timeout = 30000) => {
  await page.waitForFunction(() => { const b = document.querySelector("button.cta"); return b && !b.disabled; }, { timeout });
  await page.evaluate(() => document.querySelector("button.cta").click());
  await W(560);
};
const clickBtnIf = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (t) await W(wait);
  return t;
};
const waitBtn = async (re, wait = 420, timeout = 26000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  if (!(await clickBtnIf(re, wait))) throw new Error(`waitBtn 실패: /${re}/ @ ${await h1()}`);
};
const ariaBtnIf = async (re, wait = 400) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].find(
      (x) => x.offsetParent && !x.disabled && new RegExp(re).test(x.getAttribute("aria-label") ?? ""),
    );
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (t) await W(wait);
  return t;
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices .hook-choice", { timeout: 22000 });
  await page.evaluate(() => document.querySelector(".hook-choices .hook-choice").click());
  await W(420);
};
const hookPlay = async (shotName) => {
  for (let i = 0; i < 8; i++) {
    if (await page.$(".hook-choices .hook-choice")) break;
    const t = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".swapbtn")].find((x) => x.offsetParent && !x.disabled);
      if (b) { b.click(); return true; }
      return false;
    });
    await W(t ? 2700 : 900);
  }
  await hookChoice();
  if (shotName) await shot(shotName);
  await clickCTA();
};
/* traytrick: 쟁반 위 후보점 3곳(svg .tt5-spot) 탭 → 예측 */
const hookTraytrick = async () => {
  for (let i = 0; i < 3; i++) {
    await page.evaluate((i) => {
      const spots = [...document.querySelectorAll(".tt5-spot")];
      const s = spots.find((x) => x.getAttribute("data-i") === String(i)) ?? spots[i];
      s?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 9, isPrimary: true }));
      s?.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 9, isPrimary: true }));
      s?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, i);
    await W(2100);
  }
  await hookChoice();
  await clickCTA();
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
const pickOpt = (i) => page.evaluate((i) => {
  const byKey = document.querySelector(`.opts .opt[data-oi="${i}"]`);
  (byKey ?? document.querySelectorAll(".opts .opt")[i]).click();
}, i);
const quiz = async (i) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await pickOpt(i);
  await W(220); await clickCTA(); await sheetContinue();
};
const multiPick = async (idxs) => {
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  for (const i of idxs) { await pickOpt(i); await W(180); }
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
  await page.waitForFunction(
    (label) => [...document.querySelectorAll(".mnp-k")].some((x) => x.textContent.trim() === label && !x.disabled && x.offsetParent),
    label,
    { timeout: 6000 },
  );
  await page.evaluate((label) => {
    [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled && x.offsetParent).click();
  }, label);
  await W(70);
};
const typeAns = async (ans) => {
  let s = String(ans);
  let neg = false;
  if (s.startsWith("-")) { neg = true; s = s.slice(1); }
  for (const ch of s) {
    if (ch === ".") await npKey("·");
    else await npKey(ch);
  }
  if (neg) await npKey("+/−");
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) {
    await typeAns(a);
    await clickCTA();
    await W(1050);
    await page.evaluate(() => {
      const b = document.querySelector("button.cta");
      if (b && !b.disabled && /계속하기/.test(b.textContent)) b.click();
    });
    await W(250);
  }
  await clickCTA();
};
const openLessonAt = async (idx) => {
  await page.waitForSelector(".screen.active .gm-node", { timeout: 12000 });
  await page.evaluate((idx) => document.querySelectorAll(".screen.active .gm-node")[idx]?.click(), idx);
  await W(950);
};
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 8, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(700);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};
const waitChip = (id, timeout = 16000) =>
  page.waitForFunction((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on"), id, { timeout });
const homeFromDone = async () => { await waitBtn("홈으로", 950, 32000); };
const log = (m) => console.log("  ·", m);
const tapIf = async (sel, wait = 420) => {
  const t = await page.evaluate((sel) => {
    const e = [...document.querySelectorAll(sel)].find((x) => x.getBoundingClientRect().width > 0);
    if (!e) return false;
    e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }, sel);
  if (t) await W(wait);
  return t;
};

/* svg viewBox 좌표 탭(스크롤 보정 + elementFromPoint) */
const svgTap = async (x, y, wait = 260) => {
  await page.evaluate(([x, y]) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    svg.scrollIntoView({ block: "center" });
    const vb = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const cx = r.left + ((x - vb.x) / vb.width) * r.width;
    const cy = r.top + ((y - vb.y) / vb.height) * r.height;
    const t = document.elementFromPoint(cx, cy) ?? svg;
    const opts = { bubbles: true, pointerId: 7, isPrimary: true, clientX: cx, clientY: cy };
    t.dispatchEvent(new PointerEvent("pointerdown", opts));
    t.dispatchEvent(new PointerEvent("pointerup", opts));
    t.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: cx, clientY: cy }));
  }, [x, y]);
  await W(wait);
};
/* svg 전체를 성긴 격자로 스윕 탭(레이아웃 몰라도 채우기류 조작 가능) */
const svgSweep = async (x0, y0, x1, y1, nx = 7, ny = 5, wait = 60) => {
  for (let iy = 0; iy <= ny; iy++) {
    for (let ix = 0; ix <= nx; ix++) {
      await svgTap(x0 + ((x1 - x0) * ix) / nx, y0 + ((y1 - y0) * iy) / ny, wait);
    }
  }
};
const labDrag = async (pts, wait = 700) => {
  await page.evaluate(async (pts) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
    svg.scrollIntoView({ block: "center" });
    const vb = svg.viewBox.baseVal;
    const r = svg.getBoundingClientRect();
    const cx = (x) => r.left + ((x - vb.x) / vb.width) * r.width;
    const cy = (y) => r.top + ((y - vb.y) / vb.height) * r.height;
    const fire = (t, x, y) =>
      svg.dispatchEvent(new PointerEvent(t, { bubbles: true, pointerId: 44, isPrimary: true, clientX: cx(x), clientY: cy(y) }));
    fire("pointerdown", pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      for (let k = 1; k <= 5; k++) {
        fire("pointermove", x0 + ((x1 - x0) * k) / 5, y0 + ((y1 - y0) * k) / 5);
        await new Promise((res) => setTimeout(res, 30));
      }
    }
    fire("pointerup", pts[pts.length - 1][0], pts[pts.length - 1][1]);
  }, pts);
  await W(wait);
};
const svgCircleAt = (sel) => page.evaluate((sel) => {
  const c = document.querySelector(sel);
  if (!c) return null;
  if (c.tagName === "circle") return [+c.getAttribute("cx"), +c.getAttribute("cy")];
  const b = c.getBBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}, sel);
const mq6 = async (re = ".", wait = 2300) => {
  await page.waitForSelector(".mq6-choice", { timeout: 16000 });
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
};
/* mq6 무해판: 선택지가 없으면 조용히 false(untilChip 재시도 루프 안에서 사용) */
const mq6If = async (re = ".", wait = 2300, timeout = 6000) => {
  const found = await page.waitForSelector(".mq6-choice", { timeout }).catch(() => null);
  if (!found) return false;
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
  return true;
};

/* ══════════ 랩 드라이버 ══════════ */

const readZoom = () => page.evaluate(() => {
  const t = document.querySelector(".zml-read b")?.textContent ?? "1";
  return parseFloat(t.replace(/[^\d.]/g, "")) || 1;
});
const LAB = {
  /* zoomLab: ×2.0 스냅 → ×0.5 스냅 → 가로만 2배 함정 → 판정 */
  async zoomLab() {
    await page.waitForSelector(".zml-read", { timeout: 9000 });
    const setScale = async (target) => {
      for (let i = 0; i < 9; i++) {
        const cur = await readZoom();
        if (Math.abs(cur - target) < 0.01) break;
        await ariaBtnIf(cur < target ? "배율 키우기" : "배율 줄이기", 280);
      }
      await W(1100);
    };
    await untilChip("two", () => setScale(2.0), 4, "zml-two");
    await untilChip("half", () => setScale(0.5), 5, "zml-half");
    await waitBtn("가로만 2배", 1700);
    await untilChip("ratio", () => mq6("같은 비율", 2700), 4, "zml-ratio");
    await clickCTA();
  },

  /* simHuntLab: 카드 6장 — helper의 패밀리명을 읽어 항상/반례 분기 */
  async simHuntLab() {
    await page.waitForSelector(".shl-prog", { timeout: 9000 });
    for (let i = 0; i < 46; i++) {
      if (await ctaEnabled()) break;
      const label = await page.evaluate(() => document.querySelector(".helper")?.textContent ?? "");
      const isCyl = /원기둥/.test(label);
      const isAlways = !isCyl && /(정삼각형|정육면체|두 원)/.test(label);
      await clickBtnIf("다르게 생겨", 500);
      if (isAlways) {
        await clickBtnIf("다르게 생겨", 500);
        await clickBtnIf("다르게 생겨", 500);
        await clickBtnIf("항상 같은 모양", 1700);
      } else {
        await clickBtnIf("반례 찾았다", 1000);
      }
    }
    await clickCTA();
  },

  /* scaleTileLab: 예측 → 스윕 탭 채우기(4·9·삼각4) → 층 쌓기 ×2 → 판정 */
  async scaleTileLab() {
    await mq6("4장", 1400);
    await untilChip("sq2", () => svgSweep(20, 20, 320, 230), 4, "sct-sq2");
    await untilChip("sq3", async () => { await svgSweep(20, 20, 320, 230); await W(600); }, 7, "sct-sq3");
    await waitBtn("한 층 쌓기", 2400);
    await waitBtn("한 층 쌓기", 2800);
    await untilChip("cube", () => mq6("27배", 2700), 4, "sct-cube");
    await clickCTA();
  },

  /* shapeLockLab: ①∠B·∠C → 다음 의뢰 → ②AB·BC·∠B → 다음 의뢰 → ③AB·BC·∠C → 판정 → CA */
  async shapeLockLab() {
    await page.waitForSelector(".slk-cards", { timeout: 9000 });
    await untilChip("aa", async () => {
      await ariaBtnIf("정보 카드 ∠B", 1400);
      await ariaBtnIf("정보 카드 ∠C", 1900);
      await W(1400);
    }, 4, "slk-aa");
    await waitBtn("다음 의뢰", 1800);
    await untilChip("sas", async () => {
      await ariaBtnIf("정보 카드 AB", 1100);
      await ariaBtnIf("정보 카드 BC", 1400);
      await ariaBtnIf("정보 카드 ∠B", 2000);
      await W(1400);
    }, 4, "slk-sas");
    await waitBtn("다음 의뢰", 1800);
    await untilChip("trap", async () => {
      await ariaBtnIf("정보 카드 AB", 1100);
      await ariaBtnIf("정보 카드 BC", 1400);
      await ariaBtnIf("정보 카드 ∠C", 2100);
      await mq6If("끼인각", 2700, 6000);
      await ariaBtnIf("정보 카드 CA", 2100);
      await W(1300);
    }, 6, "slk-trap");
    await clickCTA();
  },

  /* peelLab: 작은 삼각형 드래그(40px+) → 정렬·점등 연출 → 근거 "AA 닮음" → 다음 구도 */
  async peelLab() {
    await page.waitForSelector(".pel-src", { timeout: 9000 });
    for (const chip of ["s1", "s2", "s3"]) {
      await untilChip(chip, async () => {
        const p = await svgCircleAt(".screen.active .pel-src");
        if (p) await labDrag([p, [p[0] + 60, p[1] - 16], [p[0] + 120, p[1] - 26]], 3600);
        await mq6If("^AA", 2200, 7000);
        await W(800);
      }, 6, `pel-${chip}`);
      if (chip !== "s3") await waitBtn("다음 구도", 1800, 32000);
    }
    await clickCTA();
  },

  /* triSliceLab: 스냅 3곳 → 1:1에서 판정 → 기울이기 → 되돌리기 */
  async triSliceLab() {
    await page.waitForSelector(".tsl-read", { timeout: 9000 });
    const dragTo = async (yFrom, yTo) => labDrag([[170, yFrom], [170, yTo]], 900);
    await untilChip("ratio", async (t) => {
      const ys = [[130, 83], [83, 161], [161, 130], [130, 177], [177, 83]];
      const [a, b] = ys[t % ys.length];
      await dragTo(a, b);
    }, 8, "tsl-ratio");
    await untilChip("whole", async () => {
      await dragTo(83, 130); // 1:1 위치로
      await W(700);
      await mq6If("절반", 2700, 7000);
    }, 5, "tsl-whole");
    await waitBtn("기울이기", 2600);
    await untilChip("para", () => clickBtnIf("되돌리기", 2400), 5, "tsl-para");
    await clickCTA();
  },

  /* midpointLab: M·N 탭 → A 드래그 ×2 → 사각형 중점 4탭 → C 드래그 → 대각선 */
  async midpointLab() {
    await page.waitForSelector(".screen.active .mcl-plane svg", { timeout: 9000 });
    await untilChip("link", async (t) => {
      const dx = (t % 3) * 6 - 6;
      await svgTap(110 + dx, 131, 500);
      await svgTap(230 + dx, 131, 700);
    }, 6, "mpl-link");
    await untilChip("morph", async () => {
      await labDrag([[170, 44], [235, 92]], 900);
      await labDrag([[235, 92], [130, 58]], 900);
      await labDrag([[130, 58], [170, 44]], 900);
    }, 5, "mpl-morph");
    await untilChip("quad", async () => {
      for (const [x, y] of [[165, 62], [284, 122], [193, 216], [74, 156]]) await svgTap(x, y, 560);
      await labDrag([[296, 200], [246, 172]], 900);
      await labDrag([[246, 172], [296, 200]], 900);
      await clickBtnIf("대각선", 1600);
    }, 6, "mpl-quad");
    await clickCTA();
  },

  /* lineDivLab: 위 핸들을 1번 줄로(3등분) → 좌우 기울이기 ×2 → 다른 공책 → 판정 */
  async lineDivLab() {
    await page.waitForSelector(".screen.active .mcl-plane svg", { timeout: 9000 });
    const handles = () => page.evaluate(() => {
      const svg = document.querySelector(".screen.active .mcl-plane svg");
      if (!svg) return [];
      return [...svg.querySelectorAll("circle")]
        .map((c) => [+c.getAttribute("cx"), +c.getAttribute("cy"), +c.getAttribute("r")])
        .filter(([, , r]) => r >= 7)
        .sort((a, b) => a[1] - b[1]);
    });
    await untilChip("cut", async () => {
      const hs = await handles();
      if (hs.length >= 2) {
        const top = hs[0];
        await labDrag([[top[0], top[1]], [top[0], 42]], 900);
        const hs2 = await handles();
        const bot = hs2[hs2.length - 1];
        if (Math.abs(bot[1] - 168) > 8) await labDrag([[bot[0], bot[1]], [bot[0], 168]], 900);
      }
    }, 6, "ldv-cut");
    await untilChip("tilt", async (t) => {
      const hs = await handles();
      if (hs.length >= 2) {
        const bot = hs[hs.length - 1];
        const nx = Math.max(50, Math.min(300, bot[0] + (t % 2 ? -70 : 70)));
        await labDrag([[bot[0], bot[1]], [nx, bot[1]]], 900);
      }
    }, 6, "ldv-tilt");
    await waitBtn("다른 공책", 2200);
    await untilChip("gap", async () => {
      const hs = await handles();
      if (hs.length >= 2) {
        const top = hs[0];
        const bot = hs[hs.length - 1];
        if (Math.abs(top[1] - 60) > 8) await labDrag([[top[0], top[1]], [top[0], 60]], 800);
        if (Math.abs(bot[1] - 200) > 8) await labDrag([[bot[0], bot[1]], [bot[0], 200]], 800);
        await W(600);
        await mq6If("잘린 비는", 2600, 5000);
      }
    }, 6, "ldv-gap");
    await clickCTA();
  },

  /* centroidLab: 감 드래그 3회 좌절 → 선 3개 → A 드래그 ×2 (2:1 유지) */
  async centroidLab() {
    await page.waitForSelector(".ctd-read", { timeout: 9000 });
    await untilChip("hunt", async (t) => {
      const p = (await svgCircleAt(".screen.active .ctd-pin circle")) ?? [120, 150];
      const targets = [[240, 110], [90, 200], [250, 190]];
      await labDrag([[p[0], p[1]], targets[t % 3]], 1000);
    }, 6, "ctd-hunt");
    await waitBtn("A에서 긋기", 1400);
    await waitBtn("B에서 긋기", 2100);
    await waitBtn("C에서 긋기", 2400);
    await waitChip("tool", 16000);
    await W(2200);
    await untilChip("ratio", async () => {
      const a = (await svgCircleAt(".screen.active .ctd-plate > circle")) ?? [168, 44];
      await labDrag([[a[0], a[1]], [Math.min(250, a[0] + 55), Math.min(116, a[1] + 46)]], 1000);
      const a2 = (await svgCircleAt(".screen.active .ctd-plate > circle")) ?? [220, 90];
      await labDrag([[a2[0], a2[1]], [Math.max(98, a2[0] - 80), Math.max(36, a2[1] - 30)]], 1000);
    }, 5, "ctd-ratio");
    await shot("m2u5-lab-centroid");
    await clickCTA();
  },

  /* pythaLab: 세 정사각형 탭(9·16·25) → 퍼즐 옮겨 담기 → 판정 → a·b 바꿔 2회 */
  async pythaLab() {
    await page.waitForSelector(".pyl-strip", { timeout: 9000 });
    await svgTap(120, 140, 1500);
    await svgTap(190, 210, 1700);
    await svgTap(220, 100, 3400);
    await waitChip("count", 14000);
    await waitBtn("증명 퍼즐로 밝히기", 1500);
    await waitBtn("삼각형 옮겨 담기", 3400);
    await mq6("같아요", 3200);
    await waitChip("proof", 12000);
    await ariaBtnIf("a 키우기", 500);
    await waitBtn("^옮겨 담기", 3400);
    await ariaBtnIf("b 키우기", 500);
    await waitBtn("^옮겨 담기", 3400);
    await waitChip("any", 12000);
    await shot("m2u5-lab-pytha");
    await clickCTA();
  },

  /* rightCheckLab: 세트①② 조립 → ③ 직각 아님 → ④ 판정 후 조립 */
  async rightCheckLab() {
    await page.waitForSelector(".rck-cards", { timeout: 9000 });
    await untilChip("first", () => clickBtnIf("조립|다음", 4600), 5, "rck-first");
    await untilChip("both", () => clickBtnIf("조립|다음", 4600), 8, "rck-both");
    await untilChip("key", async () => {
      await mq6If("가장 긴", 2700, 5000);
      await clickBtnIf("조립|다음", 4600);
      await W(800);
    }, 8, "rck-key");
    await clickCTA();
  },
};

/* ══════════ 레슨 러너 ══════════ */

/* concept → (recap: 첫 카드 펼쳐 more 확인) → 퀴즈 시퀀스 */
const conceptAndRecap = async (recapShot) => {
  await clickCTA(); // concept
  await W(400);
  if (recapShot) {
    await tapIf(".rc-card", 700);
    await shot(recapShot);
  }
  await clickCTA(); // recap
};

const LESSONS = [
  {
    name: "L1 도형의 닮음", node: 0,
    run: async () => {
      await hookPlay("m2u5-hook-photoedit");
      await LAB.zoomLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0); await shot("m2u5-quiz-simquad");
      await binSortAuto([
        ["1\\.5배", "닮음이다"], ["70%", "닮음이다"], ["한 변만", "아니다"],
        ["가로만", "아니다"], ["합동인 도형", "닮음이다"], ["정사각형을 늘여", "아니다"],
      ]);
      await oxPick(true);
      await drill([12, 15, 3, 4, 9, 2]);
    },
  },
  {
    name: "L2 항상 닮은 도형", node: 1,
    run: async () => {
      await hookPlay();
      await LAB.simHuntLab();
      await conceptAndRecap();
      await multiPick([0, 2, 4]);
      await quiz(0);
      await oxPick(true);
      await quiz(0);
      await drill([1, 2, 1, 2, 12, 4]);
    },
  },
  {
    name: "L3 넓이·부피의 비", node: 2,
    run: async () => {
      await hookPlay();
      await LAB.scaleTileLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await oxPick(false);
      await quiz(0);
      await drill([16, 125, 63, 3, 18, 128]);
    },
  },
  {
    name: "L4 닮음 조건", node: 3,
    run: async () => {
      await hookPlay();
      await LAB.shapeLockLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await binSortAuto([
        ["세 쌍의 변의 비", "닮음 확정"], ["그 끼인각이 같다", "닮음 확정"], ["대응각이 각각", "닮음 확정"],
        ["끼인각 아닌", "확정할 수 없다"], ["세 각이 모두", "닮음 확정"], ["둘레", "확정할 수 없다"],
      ]);
      await oxPick(true);
      await drill([1, 3, 2, 0, 0, 3]);
    },
  },
  {
    name: "L5 숨은 닮음", node: 4,
    run: async () => {
      await hookPlay();
      await LAB.peelLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await quiz(0);
      await orderAuto(["같은 각", "분리해", "기호", "비례식"]);
      await drill([12, 5, 4, 12, 15, 12]);
    },
  },
  {
    name: "L6 삼각형과 평행선", node: 5,
    run: async () => {
      await hookPlay();
      await LAB.triSliceLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await oxPick(true);
      await binSortAuto([
        ["AB:AD", "아니다"], ["AD:DB=2:1, AE:EC=2:1", "평행이다"], ["3:2, AE:EC=3:2", "평행이다"],
        ["AE:EC=3:2", "아니다"], ["AD=6", "평행이다"], ["AD=4", "아니다"],
      ]);
      await drill([3, 12, 9, 10, 1, 2]);
    },
  },
  {
    name: "L7 중점연결정리", node: 6,
    run: async () => {
      await hookPlay();
      await LAB.midpointLab();
      await conceptAndRecap("m2u5-recap-more");
      await quiz(0);
      await quiz(0);
      await oxPick(true);
      await quiz(0);
      await drill([9, 22, 58, 2, 24, 15]);
    },
  },
  {
    name: "L8 평행선 사이 비", node: 7,
    run: async () => {
      await hookPlay();
      await LAB.lineDivLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await oxPick(false);
      await orderAuto(["공책을 편다", "첫 번째 줄", "여섯 번째 줄", "네 점에 표시"]);
      await drill([6, 7, 3, 7, 12, 1]);
    },
  },
  {
    name: "L9 무게중심", node: 8,
    run: async () => {
      await hookTraytrick();
      await LAB.centroidLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await quiz(0);
      await binSortAuto([
        ["수직이등분선", "외심"], ["내각의 이등분선", "내심"], ["세 중선의 교점", "무게중심"],
        ["꼭짓점에서 같은", "외심"], ["세 변에서 같은", "내심"], ["2:1로 나눔", "무게중심"],
      ]);
      await drill([16, 21, 5, 14, 24, 8]);
    },
  },
  {
    name: "L10 피타고라스 정리", node: 9,
    run: async () => {
      await hookPlay("m2u5-hook-tvsize");
      await LAB.pythaLab();
      await conceptAndRecap();
      await quiz(0);
      await quiz(0);
      await quiz(0);
      await quiz(0);
      await oxPick(true);
      await drill([5, 10, 5, 24, 15, 40]);
    },
  },
  {
    name: "L11 직각 조건", node: 10,
    run: async () => {
      await hookPlay();
      await LAB.rightCheckLab();
      await conceptAndRecap();
      await multiPick([0, 2]);
      await quiz(0);
      await quiz(0);
      await oxPick(true);
      await drill([1, 2, 1, 2, 20, 15]);
    },
  },
];

/* V 단원 탭 선택 */
await page.waitForSelector(".unit-tab", { timeout: 12000 });
await page.evaluate(() => {
  const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.trim().startsWith("V."));
  t?.click();
});
await W(800);

let failed = 0;
for (const L of LESSONS) {
  try {
    console.log(`\n■ ${L.name}`);
    await openLessonAt(L.node);
    await L.run();
    await homeFromDone();
    await page.evaluate(() => {
      const t = [...document.querySelectorAll(".unit-tab")].find((x) => x.textContent.trim().startsWith("V."));
      t?.click();
    });
    await W(700);
    log("완료");
  } catch (e) {
    failed++;
    console.log(`  ✗ 실패: ${e.message}`);
    await shot(`m2u5-fail-${L.node}`);
    break;
  }
}

const doneCount = await page.evaluate(() => {
  const st = JSON.parse(localStorage.getItem("science-app.v1") ?? "{}");
  return Object.keys(st.lessons ?? {}).filter((k) => k.startsWith("m2u5") && st.lessons[k].done).length;
});
console.log(`\n결과: 완료 레슨 ${doneCount}/11, pageErrors=${pageErrors}, 실패=${failed}`);
await browser.close();
process.exit(failed || doneCount < 11 ? 1 : 0);
