// 중2 수학 Ⅱ 부등식과 연립방정식 — 9레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u2.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(untilChip), 실행 중 src 편집 금지,
// 드릴 종료 후는 CTA가 아니라 완료 화면 "홈으로" 버튼. e2e-m2u1.mjs 문법 계승.
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
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0,
    lessons: {
      // 중2 수학 Ⅰ 완료 시딩(Ⅱ 단원 탭 진입·순차 해금 전제)
      m2u1l1: { done: true, acc: 100, bestXp: 10 }, m2u1l2: { done: true, acc: 100, bestXp: 10 },
      m2u1l3: { done: true, acc: 100, bestXp: 10 }, m2u1l4: { done: true, acc: 100, bestXp: 10 },
      m2u1l5: { done: true, acc: 100, bestXp: 10 }, m2u1l6: { done: true, acc: 100, bestXp: 10 },
      m2u1l7: { done: true, acc: 100, bestXp: 10 }, m2u1l8: { done: true, acc: 100, bestXp: 10 },
      m2u1l9: { done: true, acc: 100, bestXp: 10 }, m2u1l10: { done: true, acc: 100, bestXp: 10 },
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
const waitBtn = async (re, wait = 420, timeout = 22000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice, .hook-choices .hook-choice", { timeout: 18000 });
  await page.evaluate(() => document.querySelector(".hook-choices .hook-choice").click());
  await W(420);
};
const sheetContinue = async (timeout = 9000) => {
  await page.waitForSelector(".sheet.open", { timeout });
  await W(240);
  await page.evaluate(() => document.querySelector(".sheet.open .sheet-card button").click());
  await W(560);
};
// 보기 클릭은 저작 인덱스(data-oi) 기준 — 표시 셔플(quiz.ts) 무관. dev 전용 키.
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
  for (const i of idxs) {
    await pickOpt(i);
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
const pairMatchAuto = async (pairs) => {
  await page.waitForSelector(".pm-chip", { timeout: 9000 });
  for (const [aRe, bRe] of pairs) {
    const ok = await page.evaluate(([aRe, bRe]) => {
      const alive = (c) => c.offsetParent && !c.disabled && !c.classList.contains("done") && !c.classList.contains("ok");
      const a = [...document.querySelectorAll(".pm-chip.pm-a")].filter(alive).find((c) => new RegExp(aRe).test(c.textContent));
      if (!a) return `NO_A ${aRe}`;
      a.click();
      const b = [...document.querySelectorAll(".pm-chip.pm-b")].filter(alive).find((c) => new RegExp(bRe).test(c.textContent));
      if (!b) return `NO_B ${bRe}`;
      b.click();
      return true;
    }, [aRe, bRe]);
    if (ok !== true) throw new Error(`pairMatch: ${ok}`);
    await W(500);
  }
  await sheetContinue(); // 짝 완성 시 CTA가 아니라 시트가 열린다(onContinue=next)
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
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    for (const ch of n) await npKey(ch);
    await npKey("↓ 분모");
    for (const ch of d) await npKey(ch);
  } else {
    for (const ch of s) {
      if (ch === ".") await npKey("·");
      else await npKey(ch);
    }
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
const homeFromDone = async () => {
  await waitBtn("홈으로", 900, 30000);
};
const log = (m) => console.log("  ·", m);

// 실패해도 던지지 않는 보조들 — untilChip 재시도 루프와 짝
const clickBtnIf = async (re, wait = 420) => {
  const t = await page.evaluate((re) => {
    const b = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled).find((x) => new RegExp(re).test(x.textContent));
    if (b) { b.click(); return true; }
    return false;
  }, re);
  if (t) await W(wait);
  return t;
};
const tapIf = async (sel, wait = 420) => {
  const t = await page.evaluate((sel) => {
    const e = [...document.querySelectorAll(sel)].find((x) => x.offsetParent);
    if (!e) return false;
    e.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 31, isPrimary: true }));
    e.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 31, isPrimary: true }));
    if (e instanceof HTMLElement) e.click();
    return true;
  }, sel);
  if (t) await W(wait);
  return t;
};
/* aria-label 정확 매칭 버튼 클릭(있을 때만) */
const ariaBtnIf = async (re, wait = 500) => {
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
/* SVG viewBox 좌표에 pointerdown+up(탭) */
const svgPtE = async (sel, vx, vy, VW, VH, wait = 900) => {
  await page.evaluate(([sel, vx, vy, VW, VH]) => {
    const svg = document.querySelector(sel);
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const cx = r.left + (vx / VW) * r.width;
    const cy = r.top + (vy / VH) * r.height;
    const o = { bubbles: true, pointerId: 35, isPrimary: true, clientX: cx, clientY: cy };
    svg.dispatchEvent(new PointerEvent("pointerdown", o));
    svg.dispatchEvent(new PointerEvent("pointerup", o));
  }, [sel, vx, vy, VW, VH]);
  await W(wait);
};

/* ══════════ 랩 드라이버(각 랩의 실제 DOM 기준) ══════════ */

const LAB = {
  /* ineqTruthLab: 행 대입 판정 → 경계(≥) 예측 → 해 개수 예측 (truth·edge·many) */
  async ineqTruthLab() {
    await page.waitForSelector(".itl-row", { timeout: 9000 });
    const tapRows = async () => {
      await page.evaluate(() => {
        const r = [...document.querySelectorAll(".itl-row")].find(
          (x) => x.offsetParent && !x.classList.contains("ok") && !x.classList.contains("no"),
        );
        r?.click();
      });
      await W(1300);
      await tapIf(".mq6-choice", 1700); // 경계 질문이 떠 있으면 답(예측 미채점)
    };
    await untilChip("truth", tapRows, 10, "참거짓 4행");
    await W(2700); // 국면 2 행 재생성 대기
    await untilChip("edge", tapRows, 12, "경계 5행");
    // 경계 칩은 x=3 예측에 켜진다 — 남은 행(x=4·5)을 마저 판정해야 국면 3이 열린다
    await untilChip("many", async () => {
      await tapRows();
      await clickBtnIf("여러 개예요", 1400);
    }, 12, "해 개수 예측");
  },
  /* flipLab: 레버 +3/−5 → ×2 → 예측 → ×(−1) (add·mul·flip) */
  async flipLab() {
    await page.waitForSelector(".fpl-stage", { timeout: 9000 });
    await untilChip("add", async () => {
      await ariaBtnIf("양변에 더하기", 1500);
      await ariaBtnIf("양변에서 빼기", 1500);
    }, 8, "나란히 이동");
    await W(1900);
    await untilChip("mul", async () => { await ariaBtnIf("양수 곱하기", 1500); }, 8, "양수 곱");
    await W(1900);
    await untilChip("flip", async () => {
      await tapIf(".fpl-choice", 1100); // 예측 먼저(있을 때만)
      await ariaBtnIf("음수 곱하기", 1800);
    }, 8, "원점 반사");
  },
  /* ineqSolveLab: 탭탭 이항(칩→반대편) + 예측 + 나누기 버튼 (move·flip·dot) */
  async ineqSolveLab() {
    await page.waitForSelector(".mboard", { timeout: 9000 });
    const tapTap = async (chipRe, side) => {
      await page.evaluate(([re, side]) => {
        const chip = [...document.querySelectorAll(".tm-chip")]
          .filter((c) => c.offsetParent)
          .find((c) => new RegExp(re).test(c.textContent.replace(/\s+/g, "")));
        if (!chip) return;
        const tap = (el, x, y) => {
          const o = { bubbles: true, pointerId: 41, isPrimary: true, clientX: x, clientY: y };
          el.dispatchEvent(new PointerEvent("pointerdown", o));
          el.dispatchEvent(new PointerEvent("pointerup", o));
        };
        const r = chip.getBoundingClientRect();
        tap(chip, r.left + r.width / 2, r.top + r.height / 2);
        const board = document.querySelector(".mboard");
        if (!board) return;
        const br = board.getBoundingClientRect();
        const bx = side === "L" ? br.left + br.width * 0.25 : br.left + br.width * 0.75;
        setTimeout(() => tap(board, bx, br.top + br.height * 0.34), 260);
      }, [chipRe, side]);
      await W(1400);
    };
    // 미션 1: 3x−1>5 — −1을 오른쪽으로(첫 시도에 이항 예측) → ÷3
    await untilChip("move", async () => {
      await tapTap("^[−-]1$", "R");
      await clickBtnIf("부등호는 그대로예요", 1700);
      await clickBtnIf("양변 ÷ 3", 2400);
    }, 10, "이항");
    await W(3300);
    // 미션 2: 2(x−3)>5x+3 — 괄호 풀기 → 5x 왼쪽·−6 오른쪽 → 반전 예측 → ÷(−3)
    await untilChip("flip", async () => {
      await clickBtnIf("괄호 풀기", 1800);
      await tapTap("^5x$", "L");
      await tapTap("^[−-]6$", "R");
      await tapTap("^[+]?3$", "L");
      await clickBtnIf("홱 뒤집혀요", 1700);
      await clickBtnIf("양변 ÷ \\(−3\\)", 2600);
    }, 12, "반전");
    await W(3300);
    // 미션 3: −7x+5≥−2 — +5 오른쪽 → ÷(−7) → 포함 판단(●)
    await untilChip("dot", async () => {
      await tapTap("^[+]?5$", "R");
      await clickBtnIf("양변 ÷ \\(−7\\)", 2800);
      await clickBtnIf("해예요", 1600);
    }, 10, "포함 점");
  },
  /* vsLab: 예측 → 인원 스테퍼(18→21 역전) → 검산 2회+최종 판단 (guess·cross·verify) */
  async vsLab() {
    await page.waitForSelector(".vsl-stage", { timeout: 9000 });
    await untilChip("guess", async () => { await tapIf(".mq6-choice", 1100); }, 6, "예측");
    await W(900);
    await untilChip("cross", async () => { await ariaBtnIf("^인원 1명 늘리기$", 800); }, 14, "역전");
    await W(1400);
    await untilChip("verify", async () => {
      await clickBtnIf("20명 검산", 1700);
      await clickBtnIf("21명 검산", 1700);
      await clickBtnIf("이득은 아니에요", 1700);
    }, 8, "검산");
  },
  /* pairLab: 다이얼로 순서쌍 대입 수집 → 순서 판단 → 새 식 (find·order·more) */
  async pairLab() {
    await page.waitForSelector(".prl-stage", { timeout: 9000 });
    const setDial = async (tx, ty) => {
      for (let k = 0; k < 16; k++) {
        const cur = await page.evaluate(() => [...document.querySelectorAll(".prl-dv")].map((d) => parseInt(d.textContent, 10)));
        if (cur.length < 2 || (cur[0] === tx && cur[1] === ty)) return;
        await page.evaluate(([tx, ty, cx, cy]) => {
          const btn = (label) => [...document.querySelectorAll("button")].find(
            (b) => b.offsetParent && !b.disabled && (b.getAttribute("aria-label") ?? "") === label,
          );
          if (cx < tx) btn("x 값 1 늘리기")?.click();
          else if (cx > tx) btn("x 값 1 줄이기")?.click();
          else if (cy < ty) btn("y 값 1 늘리기")?.click();
          else btn("y 값 1 줄이기")?.click();
        }, [tx, ty, cur[0], cur[1]]);
        await W(190);
      }
    };
    const submit = async (x, y) => { await setDial(x, y); await clickBtnIf("^대입$", 2400); };
    await untilChip("find", async () => {
      await submit(1, 3); await submit(3, 2); await submit(5, 1);
    }, 5, "해 3개 수집");
    await W(900);
    await untilChip("order", async () => {
      await clickBtnIf("아니요", 1700);
      await W(3400); // (2,3) 자동 대입 연출
    }, 6, "순서 판단");
    await W(1200);
    await untilChip("more", async () => { await submit(1, 8); await submit(2, 5); }, 6, "새 식 수집");
  },
  /* crossLab: 격자 탭 — 파랑 5해 → 주황 2해 → 공통점 (blue·orange·both) */
  async crossLab() {
    await page.waitForSelector(".crl-grid svg", { timeout: 9000 });
    const SIZE = 340, PAD = 26, UNIT = (SIZE - PAD * 2) / 7;
    const gpt = async (x, y) => {
      await svgPtE(".crl-grid svg", PAD + x * UNIT, SIZE - PAD - y * UNIT, SIZE, SIZE, 750);
    };
    await untilChip("blue", async () => {
      for (const [x, y] of [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]]) await gpt(x, y);
    }, 4, "파랑 5해");
    await W(1500);
    await untilChip("orange", async () => {
      for (const [x, y] of [[1, 4], [4, 2]]) await gpt(x, y);
    }, 4, "주황 2해");
    await W(1500);
    await untilChip("both", async () => { await gpt(4, 2); }, 5, "공통점 지목");
  },
  /* subSlotLab: 칩→슬롯 탭탭 + 정리/나누기 버튼 (slot·back·wrap) */
  async subSlotLab() {
    await page.waitForSelector(".ssl-stage", { timeout: 9000 });
    const chipToSlot = async () => {
      await page.evaluate(() => {
        const tap = (el) => {
          const r = el.getBoundingClientRect();
          const o = { bubbles: true, pointerId: 44, isPrimary: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
          el.dispatchEvent(new PointerEvent("pointerdown", o));
          el.dispatchEvent(new PointerEvent("pointerup", o));
          if (el instanceof HTMLElement) el.click();
        };
        const chip = [...document.querySelectorAll(".ssl-chip")].find((c) => c.offsetParent);
        if (chip) tap(chip);
        setTimeout(() => {
          const slot = document.querySelector(".ssl-slot.live") ?? document.querySelector(".ssl-slot:not(.filled)");
          if (slot) tap(slot);
        }, 320);
      });
      await W(1700);
    };
    await untilChip("slot", async () => {
      await chipToSlot();
      await clickBtnIf("정리하기", 1800);
      await clickBtnIf("양변 ÷3", 2000);
    }, 8, "식 꽂기");
    await W(2100);
    await untilChip("back", async () => {
      await chipToSlot();
      await clickBtnIf("계산하기", 2000);
    }, 8, "거꾸로 대입");
    await clickBtnIf("다음 판", 1700);
    await untilChip("wrap", async () => {
      await clickBtnIf("이항하기", 1900);
      await chipToSlot();
      await clickBtnIf("괄호째", 2000);
      await clickBtnIf("정리하기", 1700);
      await clickBtnIf("양변 ÷5", 1700);
      await clickBtnIf("x도 구하기", 1700);
    }, 10, "괄호째 꽂기");
  },
  /* elimLab: 변끼리 빼기/더하기 + 확대경 ×2·×3 (minus·plus·zoom) */
  async elimLab() {
    await page.waitForSelector(".eml-stage", { timeout: 9000 });
    await untilChip("minus", async () => {
      await clickBtnIf("변끼리 빼기", 2400);
      await clickBtnIf("양변 ÷2", 2000);
      await clickBtnIf("②에 대입하기", 2000);
    }, 8, "빼서 지우기");
    await clickBtnIf("다음 판", 1800);
    await untilChip("plus", async () => {
      await clickBtnIf("변끼리 더하기", 2600);
      await clickBtnIf("양변 ÷4", 2000);
    }, 8, "더해서 지우기");
    await clickBtnIf("다음 판", 1800);
    await untilChip("zoom", async () => {
      await clickBtnIf("변끼리 (더하기|빼기)", 4400); // 교육적 실패 → 확대경 개방
      await ariaBtnIf("① 양변에 2 곱하기", 1100);
      await ariaBtnIf("② 양변에 3 곱하기", 1400);
      await clickBtnIf("다시 맞추기", 900); // 오조합 리셋(있을 때만)
      await clickBtnIf("변끼리 빼기", 2800);
      await clickBtnIf("양변 ÷19", 2000);
    }, 10, "확대경");
  },
};

// 실패 시 화면·상태 증거를 남긴다
process.on("uncaughtException", async (e) => {
  console.log("FATAL:", e.message);
  try {
    const st = await page.evaluate(() => JSON.stringify({
      h1: document.querySelector(".step .h1")?.textContent?.slice(0, 30),
      chips: [...document.querySelectorAll("[data-g]")].map((c) => `${c.getAttribute("data-g")}:${c.classList.contains("on") ? 1 : 0}`),
      sheet: !!document.querySelector(".sheet.open"),
      cta: document.querySelector("button.cta")?.textContent?.trim(),
      btns: [...document.querySelectorAll("button")].filter((b) => b.offsetParent && !b.disabled).map((b) => b.textContent.trim().slice(0, 18)).slice(0, 12),
    }));
    console.log("STATE:", st);
    await page.screenshot({ path: "qa/shots/m2u2-fail.png" });
  } catch {}
  await browser.close();
  process.exit(1);
});

console.log("=== 중2 수학 Ⅱ e2e 시작 (9레슨) ===");
await page.waitForSelector(".unit-tab", { timeout: 9000 });
// Ⅱ 단원 탭으로 전환
await page.evaluate(() => {
  const t = [...document.querySelectorAll(".unit-tab")].find((x) => /II|Ⅱ/.test(x.textContent) && !/III|Ⅲ/.test(x.textContent));
  t?.click();
});
await W(800);
const nodeCount = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
log(`홈 지도 노드: ${nodeCount}`);
await shot("m2u2-home");

/* ================= L1 부등식과 그 해 ================= */
await openLesson("부등식 — 학습");
log(`L1: ${await h1()}`);
await waitBtn("등급 확인하기", 1600);
await hookChoice();
await clickCTA();
await LAB.ineqTruthLab();
await clickCTA(); // 랩 → concept
await clickCTA(); // concept → recap
await clickCTA(); // recap → binSort
await binSortAuto([
  ["2<5", "^부등식$"], ["x\\+3=7", "아님"], ["≥9", "^부등식$"],
  ["3x−5", "아님"], ["≤2x", "^부등식$"], ["7=7", "아님"],
]);
await quiz(0);
await oxPick(false);
await drill([1, 2, 1, 2, 1, 2]);
await homeFromDone();
log("L1 완료");

/* ================= L2 부등식의 성질 ================= */
await openLesson("성질 — 학습");
log(`L2: ${await h1()}`);
await waitBtn("예보 비교하기", 1600);
await hookChoice();
await clickCTA();
await LAB.flipLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await binSortAuto([
  ["\\+3을 더한다", "유지"], ["곱한다", "반전"], ["5를 뺀다", "유지"],
  ["나눈다", "반전"], ["−7", "유지"], ["4로 나눈다", "유지"],
]);
await oxPick(true);
await drill([1, 2, 1, 2, 1, 1]);
await homeFromDone();
log("L2 완료");

/* ================= L3 일차부등식의 풀이 ================= */
await openLesson("풀이 — 학습");
log(`L3: ${await h1()}`);
await waitBtn("키 재 보기", 1600);
await hookChoice();
await clickCTA();
await LAB.ineqSolveLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await orderAuto(["우변으로 이항", "동류항 정리", "양수 3으로 나누기", "○로 표시"]);
await oxPick(false);
await drill([4, 2, -4, 3, 3, 4]);
await homeFromDone();
log("L3 완료");
await shot("m2u2-l3-done");

/* ================= L4 일차부등식의 활용 ================= */
await openLesson("활용 — 학습");
log(`L4: ${await h1()}`);
await waitBtn("요금표 보기", 1600);
await hookChoice();
await clickCTA();
await LAB.vsLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await binSortAuto([
  ["10개 이상", "같음 포함"], ["20명 미만", "미포함"], ["5000원 이하", "같음 포함"],
  ["150cm 초과", "미포함"], ["45명까지", "같음 포함"], ["8을 넘는다", "미포함"],
]);
await oxPick(false);
await drill([7, 19, 21, 11, 6, 7]);
await homeFromDone();
log("L4 완료");

/* ================= L5 미지수가 2개인 일차방정식 ================= */
await openLesson("미지수 2개");
log(`L5: ${await h1()}`);
await waitBtn("출력해 보기", 1600);
await hookChoice();
await clickCTA();
await LAB.pairLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await pairMatchAuto([["x=1", "y=3"], ["x=3", "y=2"], ["x=5", "y=1"]]);
await oxPick(false);
await drill([2, 3, 4, 2, 7, 1]);
await homeFromDone();
log("L5 완료");

/* ================= L6 연립방정식과 그 해 ================= */
await openLesson("연립방정식");
log(`L6: ${await h1()}`);
await waitBtn("보트 세어 보기", 1600);
await hookChoice();
await clickCTA();
await LAB.crossLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await binSortAuto([
  ["\\(3, 2\\)", "두 식 모두"], ["\\(4, 1\\)", "한 식만"], ["\\(2, 3\\)", "한 식만"],
  ["\\(1, 0\\)", "한 식만"], ["\\(2, 1\\)", "한 식만"],
]);
await oxPick(false);
await drill([4, 2, 1, 2, 4, 1]);
await homeFromDone();
log("L6 완료");
await shot("m2u2-l6-done");

/* ================= L7 대입법 ================= */
await openLesson("대입법");
log(`L7: ${await h1()}`);
await waitBtn("주문서 보기", 1600);
await hookChoice();
await clickCTA();
await LAB.subSlotLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await orderAuto(["통째로 대입", "4x=8", "되넣기", "해는"]);
await oxPick(false);
await drill([2, 3, 8, 4, 2, 6]);
await homeFromDone();
log("L7 완료");

/* ================= L8 가감법 ================= */
await openLesson("가감법");
log(`L8: ${await h1()}`);
await waitBtn("영수증 겹치기", 1600);
await hookChoice();
await clickCTA();
await LAB.elimLab();
await clickCTA();
await clickCTA();
await clickCTA();
await multiPick([0, 1]);
await binSortAuto([
  ["3x\\+2y=7", "더한다"], ["2x\\+y=5", "뺀다"], ["x\\+3y=4", "뺀다"],
  ["−x\\+2y=3", "더한다"], ["5x\\+2y=8", "뺀다"],
]);
await oxPick(false);
await drill([8, 2, 4, 14, 7, 3]);
await homeFromDone();
log("L8 완료");

/* ================= L9 연립방정식의 활용 ================= */
await openLesson("활용 — 학습");
log(`L9: ${await h1()}`);
await waitBtn("옛 문제 펼치기", 1600);
await hookChoice();
await clickCTA(); // 훅 → concept
await clickCTA(); // concept → recap
await clickCTA(); // recap → quiz
await quiz(0);
await orderAuto(["x, y로 놓기", "방정식으로 세우기", "가감법으로 풀기", "확인하기"]);
await quiz(0);
await oxPick(false);
await drill([12, 23, 12, 40, 4, 6]);
await homeFromDone();
log("L9 완료");
await shot("m2u2-alldone");

console.log(`=== 완료: 9/9 레슨 통과, pageErrors=${pageErrors} ===`);
await browser.close();
process.exit(pageErrors ? 1 : 0);
