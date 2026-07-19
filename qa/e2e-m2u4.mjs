// 중2 수학 Ⅳ 삼각형과 사각형의 성질, 10레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u4.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(untilChip), 실행 중 src 편집 금지,
// 드릴 종료 후는 완료 화면 "홈으로" 버튼, 보기 클릭은 data-oi(저작 인덱스).
// 조작 좌표는 매번 getBoundingClientRect + svg viewBox로 재계산(고정 좌표 캐시 금지).
// 드래그 대상(핀·핸들)의 시작점은 DOM에서 실좌표를 읽는다(조작 후 위치가 변하므로).
// e2e-m2u3.mjs 문법 계승.
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
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons: {
      // 중2 수학 Ⅰ·Ⅱ·Ⅲ 완료 시딩(Ⅳ 단원 진입 전제)
      m2u1l1: done, m2u1l2: done, m2u1l3: done, m2u1l4: done, m2u1l5: done,
      m2u1l6: done, m2u1l7: done, m2u1l8: done, m2u1l9: done, m2u1l10: done,
      m2u2l1: done, m2u2l2: done, m2u2l3: done, m2u2l4: done, m2u2l5: done,
      m2u2l6: done, m2u2l7: done, m2u2l8: done, m2u2l9: done,
      m2u3l1: done, m2u3l2: done, m2u3l3: done, m2u3l4: done, m2u3l5: done,
      m2u3l6: done, m2u3l7: done, m2u3l8: done, m2u3l9: done, m2u3l10: done,
    },
    minigame: {},
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
const waitBtn = async (re, wait = 420, timeout = 24000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice, .hook-choices .hook-choice", { timeout: 20000 });
  await page.evaluate(() => document.querySelector(".hook-choices .hook-choice").click());
  await W(420);
};
/* 장면 버튼(swapbtn)을 선택지가 뜰 때까지 반복 탭 → 예측 → (증거 샷) → CTA */
const hookPlay = async (shotName) => {
  for (let i = 0; i < 7; i++) {
    if (await page.$(".hook-choices .hook-choice")) break;
    const t = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".swapbtn")].find((x) => x.offsetParent && !x.disabled);
      if (b) { b.click(); return true; }
      return false;
    });
    await W(t ? 2600 : 900);
  }
  await hookChoice();
  if (shotName) await shot(shotName); // 예측 피드백까지 뜬 훅 장면
  await clickCTA();
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
// 보기 클릭은 저작 인덱스(data-oi) 기준, 표시 셔플(quiz.ts) 무관. dev 전용 키.
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
const chipOn = (id) => page.evaluate((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on") ?? false, id);
const untilChip = async (id, fn, tries = 8, label = "") => {
  for (let t = 0; t < tries; t++) {
    if (await chipOn(id)) return;
    await fn(t);
    await W(650);
  }
  if (!(await chipOn(id))) throw new Error(`untilChip 실패: ${id} ${label} @ ${await h1()}`);
};
const waitChip = (id, timeout = 14000) =>
  page.waitForFunction((id) => document.querySelector(`[data-g="${id}"]`)?.classList.contains("on"), id, { timeout });
const homeFromDone = async () => {
  await waitBtn("홈으로", 900, 30000);
};
const log = (m) => console.log("  ·", m);

const tapIf = async (sel, wait = 420) => {
  const t = await page.evaluate((sel) => {
    const e = [...document.querySelectorAll(sel)].find((x) => x.offsetParent);
    if (!e) return false;
    if (e instanceof HTMLElement) e.click();
    return true;
  }, sel);
  if (t) await W(wait);
  return t;
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

/* 랩 SVG 위 드래그 — viewBox를 런타임에 읽어 스케일 환산(모든 좌표는 viewBox 기준) */
const labDrag = async (pts, wait = 700) => {
  await page.evaluate(async (pts) => {
    const svg = document.querySelector(".screen.active .mcl-plane svg");
    if (!svg) return;
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
/* 드래그 대상의 현재 위치(viewBox 좌표)를 DOM에서 읽는다 */
const svgCircleAt = (sel) => page.evaluate((sel) => {
  const c = document.querySelector(sel);
  if (!c) return null;
  if (c.tagName === "circle") return [+c.getAttribute("cx"), +c.getAttribute("cy")];
  const b = c.getBBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
}, sel);
/* mq6 판단 질문: 정규식에 맞는 선택지(없으면 첫 번째) 탭 */
const mq6 = async (re = ".", wait = 2100) => {
  await page.waitForSelector(".mq6-choice", { timeout: 14000 });
  await page.evaluate((re) => {
    const list = [...document.querySelectorAll(".mq6-choice")].filter((b) => b.offsetParent && !b.disabled);
    (list.find((b) => new RegExp(re).test(b.textContent)) ?? list[0])?.click();
  }, re);
  await W(wait);
};
const mq6Card = async (re, wait = 500) => {
  await page.waitForSelector(".mq6-choice", { timeout: 12000 });
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".mq6-choice")].find((x) => x.offsetParent && !x.disabled && new RegExp(re).test(x.textContent));
    b?.click();
  }, re);
  await W(wait);
};

/* ══════════ 랩 드라이버 ══════════ */

const LAB = {
  /* isoFoldLab: 접기×3(모양 3종) → 한계 판정 → 보조선 → 근거 3개(가짜 회피) →
     도장·대응각·피날레는 걸음 버튼 3개(자동 진행 폐기, 2026-07-19 실사용 피드백) */
  async isoFoldLab() {
    await page.waitForSelector(".ifl-counter", { timeout: 9000 });
    for (let i = 0; i < 3; i++) {
      await waitBtn("반으로 접기", 1600);
      await waitBtn("펼치기", 1000);
      if (i < 2) await waitBtn("다른 모양으로", 700);
    }
    await mq6("아무리 접어도", 2900);
    await waitBtn("가르는 선 긋기", 1500);
    for (const re of ["AB = AC", "BAD", "AD는 공통"]) await mq6Card(re, 380);
    await waitBtn("합동 도장 찍기", 1300);
    await waitBtn("확인하기", 1800);
    await waitBtn("모양 바꿔서 시험하기", 700);
    await waitChip("prove", 16000);
    await shot("m2u4-lab"); // 목표 칩 3/3 + 피날레 배지 증거
    await clickCTA();
  },

  /* isoBuildLab: ∠B 40→50·∠C 65→50 일치 → 55·55 재일치 → 방향 판정 */
  async isoBuildLab() {
    await page.waitForSelector(".ibl-len", { timeout: 9000 });
    await untilChip("same", async () => {
      for (let i = 0; i < 2; i++) await ariaBtnIf("각 B 키우기", 170);
      for (let i = 0; i < 3; i++) await ariaBtnIf("각 C 줄이기", 170);
      await W(700);
    }, 4, "ibl-same");
    await untilChip("again", async () => {
      await ariaBtnIf("각 B 키우기", 170);
      await ariaBtnIf("각 C 키우기", 170);
      await W(700);
    }, 6, "ibl-again");
    await untilChip("state", () => mq6("두 변의 길이가 같다", 3200), 5, "ibl-state");
    await clickCTA();
  },

  /* rhCongLab: 주문서 ①(RHA 성공)·②(RHS 성공)·③(함정 실패) → 판정 */
  async rhCongLab() {
    await page.waitForSelector(".rhc-order", { timeout: 9000 });
    await waitBtn("이 정보로 복제", 3600);
    await waitBtn("이 정보로 복제", 3600);
    await waitBtn("이 정보로 복제", 2800);
    await mq6("빗변의 길이", 3400);
    await clickCTA();
  },

  /* circumLab: 감 드래그(누적 260px) → 밴드 2개 → 교점 스냅 → 원 → 마을 2곳 탐사 → 판정 */
  async circumLab() {
    await page.waitForSelector(".ccl-reads", { timeout: 9000 });
    const pin = async () => (await svgCircleAt(".screen.active .ccl-pin circle")) ?? [150, 150];
    await untilChip("hunt", async () => {
      const p = await pin();
      await labDrag([p, [240, 90], [90, 200], [250, 170], [120, 100]], 600);
    }, 5, "ccl-hunt");
    await waitBtn("지우네·하람이네", 1000);
    await waitBtn("하람이네·도윤이네", 1000);
    await untilChip("snap", async () => {
      const p = await pin();
      await labDrag([p, [175.5, 171.5]], 1000);
    }, 6, "ccl-snap");
    await waitBtn("세 집을 지나는 원", 3400);
    await waitBtn("반듯한 직각 마을로", 3200);
    await waitBtn("길쭉한 마을로", 3200);
    await untilChip("spot", () => mq6("한가운데", 3000), 5, "ccl-spot");
    await clickCTA();
  },

  /* inCircleLab: 내심(162,165)으로 드래그(90% 도달) → 이등분선 2개 → 교점 스냅 → 거리 판정 */
  async inCircleLab() {
    await page.waitForSelector(".icl-read", { timeout: 9000 });
    const hd = async () => (await svgCircleAt(".screen.active .icl-hd")) ?? [166, 170];
    await untilChip("grow", async () => {
      const p = await hd();
      await labDrag([p, [162.3, 165.4]], 1300);
    }, 6, "icl-grow");
    await waitBtn("각 B의 이등분선", 1200);
    await waitBtn("각 C의 이등분선", 1400);
    await untilChip("meet", async () => {
      const p = await hd();
      await labDrag([p, [150, 150], [162.3, 165.4]], 1500);
    }, 6, "icl-meet");
    await untilChip("dist", () => mq6("모두 같아요", 3800), 5, "icl-dist");
    await clickCTA();
  },

  /* paraSpinLab: 사본 반 바퀴 드래그 → 성질 카드 3장 → 꼭짓점 변형 → 재회전 */
  async paraSpinLab() {
    await page.waitForSelector(".psl-dial", { timeout: 9000 });
    await untilChip("spin", () => labDrag([[250, 100], [174, 52], [95, 80], [70, 150], [98, 178]], 1000), 5, "psl-spin");
    for (const re of ["변 AB", "각 A", "선분 OA"]) await mq6Card(re, 600);
    await waitChip("collect", 12000);
    await W(400);
    const hd = (await svgCircleAt(".screen.active .psl-handle circle:last-of-type")) ?? [104, 86];
    await labDrag([hd, [140, 118]], 900);
    await waitBtn("다시 반 바퀴", 1800);
    await waitChip("vary", 12000);
    await clickCTA();
  },

  /* paraCondLab: 생성·검사 버튼을 판정 질문이 뜰 때까지 반복 → 함정 판정 */
  async paraCondLab() {
    await page.waitForSelector(".pcd-card", { timeout: 9000 });
    for (let i = 0; i < 26; i++) {
      if (await page.$(".mq6-choice")) break;
      const t = await page.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find(
          (x) => x.offsetParent && !x.disabled && /생성|검사/.test(x.textContent) && !/확인하기/.test(x.textContent),
        );
        if (b) { b.click(); return true; }
        return false;
      });
      await W(t ? 1500 : 800);
    }
    await mq6("따로", 3200);
    await clickCTA();
  },

  /* diagRigLab: 잇기 → 길이 같게·잇기 → 수직·잇기 → 둘 다·잇기 → 정사각형 판정 */
  async diagRigLab() {
    await page.waitForSelector(".mcl-plane", { timeout: 9000 });
    await waitBtn("네 끝 점 잇기", 1600);
    await waitBtn("길이 같게", 1400);
    await waitBtn("네 끝 점 잇기", 1600);
    await waitBtn("길이 같게", 1400);
    await waitBtn("수직으로", 1400);
    await waitBtn("네 끝 점 잇기", 1600);
    await waitBtn("길이 같게", 1400);
    await waitBtn("네 끝 점 잇기", 1800);
    await mq6("셋 다", 3600);
    await clickCTA();
  },

  /* quadFamilyLab: 직사각형 경로 → 자동 되감기 → 마름모 경로 → 포함 판정 */
  async quadFamilyLab() {
    await page.waitForSelector(".qf-name", { timeout: 9000 });
    await waitBtn("평행하게", 1500);
    await waitBtn("다른 한 쌍도", 1500);
    await waitBtn("직각으로", 1500);
    await waitBtn("길이를 같게", 2800);
    await waitBtn("길이를 같게", 1500, 26000);
    await waitBtn("직각으로", 2400);
    await mq6("갖췄으니", 3400);
    await clickCTA();
  },

  /* areaSlideLab: A 레일 왕복(누적 240px) → 이유 판정 → 대각선·레일 → D를 E까지 */
  async areaSlideLab() {
    await page.waitForSelector(".asl-read", { timeout: 9000 });
    const railPt = () => page.evaluate(() => {
      const svg = document.querySelector(".screen.active .mcl-plane svg");
      if (!svg) return null;
      const cs = [...svg.querySelectorAll("circle")]
        .map((c) => [+c.getAttribute("cx"), +c.getAttribute("cy")])
        .filter(([x, y]) => Math.abs(y - 100) < 10 && x > 10 && x < 350);
      return cs[0] ?? null;
    });
    await untilChip("slide", async () => {
      const p = (await railPt()) ?? [170, 100];
      await labDrag([p, [p[0] > 180 ? 40 : 320, 100]], 900);
    }, 6, "asl-slide");
    await untilChip("why", () => mq6("높이도 그대로", 3200), 5, "asl-why");
    await waitBtn("대각선 AC", 2400);
    // D 핸들 = 고정 꼭짓점(A·B·C·유령 E)이 아닌 원 = 레일 (180,100)+(160,140)t 위의 원
    const dHandle = () => page.evaluate(() => {
      const svg = document.querySelector(".screen.active .mcl-plane svg");
      if (!svg) return null;
      const FIX = [[80, 100], [60, 240], [240, 240], [340, 240]];
      const cs = [...svg.querySelectorAll("circle")]
        .map((c) => [+c.getAttribute("cx"), +c.getAttribute("cy")])
        .filter(([x, y]) => Number.isFinite(x) && !FIX.some(([fx, fy]) => Math.hypot(fx - x, fy - y) < 7));
      const onRail = cs.filter(([x, y]) => Math.abs((x - 180) * 140 - (y - 100) * 160) < 900);
      return onRail[0] ?? cs[0] ?? null;
    });
    await untilChip("fence", async () => {
      const p = (await dHandle()) ?? [180, 100];
      await labDrag([p, [340, 240]], 1400);
    }, 6, "asl-fence");
    await clickCTA();
  },
};

/* ══════════ 레슨 시나리오 ══════════ */

console.log("=== 중2 수학 Ⅳ 삼각형과 사각형의 성질 E2E ===");

// Ⅳ 단원 탭으로 이동
await page.waitForSelector(".unit-tabs button, .unit-tab", { timeout: 12000 }).catch(() => {});
await page.evaluate(() => {
  const t = [...document.querySelectorAll("button")].find((b) => /IV\./.test(b.textContent));
  t?.click();
});
await W(800);

/* L1 이등변삼각형의 성질 */
{
  console.log("L1 이등변·증명");
  await openLesson("이등변·증명");
  await hookPlay("m2u4-hook");
  await LAB.isoFoldLab(); log("isoFoldLab 완료");
  await clickCTA(); // concept
  await tapIf(".rc-card", 700); // recap 자세히 펼침
  await shot("m2u4-recap");
  await clickCTA(); // recap → 문제
  await quiz(0);
  await page.waitForSelector(".opts .opt", { timeout: 9000 });
  await shot("m2u4-figquiz"); // 그림 문제(isoExtFig) 화면
  await quiz(0);
  await orderAuto(["이등분선을 그어", "공통임을 확인", "SAS", "대응각"]);
  await oxPick(false);
  await drill([64, 45, 38, 120, 7, 90]);
  await homeFromDone(); log("L1 완료");
}

/* L2 되는 조건 */
{
  console.log("L2 되는 조건");
  await openLesson("되는 조건 —");
  await hookPlay();
  await LAB.isoBuildLab(); log("isoBuildLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["55°, 55°", "삼각형이다"], ["50°, 80°", "삼각형이다"], ["60°, 70°", "아니다"],
    ["90°, 45°", "삼각형이다"], ["24°, 132°", "삼각형이다"], ["85°, 40°", "아니다"],
  ]);
  await drill([46, 7, 1, 2, 1, 7]);
  await homeFromDone(); log("L2 완료");
}

/* L3 RHA·RHS */
{
  console.log("L3 RHA·RHS");
  await openLesson("RHA·RHS");
  await hookPlay();
  await LAB.rhCongLab(); log("rhCongLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(1); // (다) — shuffle:false 라벨형
  await quiz(0);
  await binSortAuto([
    ["빗변 6cm, 한 예각", "RHA"], ["밑변 4cm", "RHS"], ["두 예각 25°", "할 수 없다"],
    ["58°", "RHA"], ["빗변 아닌", "할 수 없다"], ["높이 7cm", "RHS"],
  ]);
  await drill([1, 2, 1, 2, 9, 56]);
  await homeFromDone(); log("L3 완료");
}

/* L4 외심 */
{
  console.log("L4 외심");
  await openLesson("외심");
  await hookPlay();
  await LAB.circumLab(); log("circumLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await multiPick([0, 2]);
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["60°, 70°, 50°", "삼각형 안"], ["∠C=90°", "중점"], ["100°", "삼각형 밖"],
    ["정삼각형", "삼각형 안"], ["90°, 45°, 45°", "중점"], ["120°", "삼각형 밖"],
  ]);
  await drill([9, 14, 5, 35, 62, 1]);
  await homeFromDone(); log("L4 완료");
}

/* L5 내심 */
{
  console.log("L5 내심");
  await openLesson("내심");
  await hookPlay();
  await LAB.inCircleLab(); log("inCircleLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await oxPick(false);
  await binSortAuto([
    ["수직이등분선", "외심"], ["내각의 이등분선", "내심"], ["꼭짓점에 이르는", "외심"],
    ["변에 이르는", "내심"], ["밖에 있다", "외심"], ["안쪽에", "내심"],
  ]);
  await quiz(0);
  await drill([25, 4, 125, 24, 3, 1]);
  await homeFromDone(); log("L5 완료");
}

/* L6 평행사변형 */
{
  console.log("L6 평행사변형");
  await openLesson("평행사변형");
  await hookPlay();
  await LAB.paraSpinLab(); log("paraSpinLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["대변의 길이가 각각", "언제나"], ["이등분한다", "언제나"], ["대각선의 길이가 같다", "아닐"],
    ["합이 180", "언제나"], ["네 변의", "아닐"], ["직각", "아닐"],
  ]);
  await drill([8, 64, 116, 9, 7, 90]);
  await homeFromDone(); log("L6 완료");
}

/* L7 되는 조건 5 */
{
  console.log("L7 되는 조건 5");
  await openLesson("되는 조건 5");
  await hookPlay();
  await LAB.paraCondLab(); log("paraCondLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await multiPick([0, 1, 3]);
  await quiz(0);
  await orderAuto(["대각선 AC", "SSS", "대응각", "엇각"]);
  await drill([1, 1, 2, 1, 2, 1]);
  await homeFromDone(); log("L7 완료");
}

/* L8 대각선 */
{
  console.log("L8 대각선");
  await openLesson("대각선");
  await hookPlay();
  await LAB.diagRigLab(); log("diagRigLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await quiz(0);
  await binSortAuto([
    ["길이가 같다", "직사각형만"], ["서로 수직이다", "마름모만"], ["이등분한다", "둘 다"],
    ["직각이다", "직사각형만"], ["네 변의", "마름모만"], ["평행하다", "둘 다"],
  ]);
  await drill([14, 12, 90, 65, 9, 1]);
  await homeFromDone(); log("L8 완료");
}

/* L9 사각형 가족 */
{
  console.log("L9 사각형 가족");
  await openLesson("사각형 가족");
  await hookPlay();
  await LAB.quadFamilyLab(); log("quadFamilyLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await oxPick(true);
  await multiPick([0, 2]);
  await quiz(0);
  await binSortAuto([
    ["^마름모", "항상 수직"], ["정사각형", "항상 수직"], ["직사각형", "아닐"],
    ["평행사변형", "아닐"], ["사다리꼴", "아닐"],
  ]);
  await drill([1, 2, 1, 1, 1, 1, 1]);
  await homeFromDone(); log("L9 완료");
}

/* L10 평행선과 넓이 */
{
  console.log("L10 평행선과 넓이");
  await openLesson("평행선과 넓이");
  await hookPlay();
  await LAB.areaSlideLab(); log("areaSlideLab 완료");
  await clickCTA(); // concept
  await clickCTA(); // recap
  await quiz(0);
  await quiz(0);
  await orderAuto(["대각선 AC", "평행한 직선", "점을 E", "AE를 그으면"]);
  await oxPick(false);
  await drill([12, 21, 18, 7, 20, 34]);
  await homeFromDone(); log("L10 완료");
}

console.log(`\n=== 완료: 10레슨 전 스텝 통과, pageerror ${pageErrors}건 ===`);
await browser.close();
process.exit(pageErrors > 0 ? 1 : 0);
