// 중2 수학 Ⅰ 유리수의 표현과 식의 계산 — 10레슨 전 스텝 실플레이 E2E.
// PORT=<포트> node qa/e2e-m2u1.mjs  (기본 5199)
// 규칙: 랩 애니 잠금 대비 "미완료 대상 재시도 루프"(untilChip), 실행 중 src 편집 금지,
// 드릴 종료 후는 CTA가 아니라 완료 화면 "홈으로" 버튼. e2e-math6.mjs 문법 계승.
import { chromium } from "playwright-core";
import fs from "node:fs";

const PORT = process.env.PORT || "5199";
fs.mkdirSync("qa/shots", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
let pageErrors = 0;
page.on("pageerror", (e) => { pageErrors++; console.log("PAGEERROR:", e.message); });

// HMR 면역(동시 세션 src 편집 대비): 웹소켓 제거·updateStyle 유지 — 스텝 러시 e2e 확정 문법
await page.route("**/@vite/client", (route) =>
  route.fulfill({
    contentType: "application/javascript",
    body: `export function createHotContext(){return{accept(){},dispose(){},on(){},off(){},send(){},prune(){},invalidate(){},data:{}}}
const sheets=new Map();
export function updateStyle(id,css){let s=sheets.get(id);if(!s){s=document.createElement("style");s.setAttribute("data-vite-dev-id",id);document.head.appendChild(s);sheets.set(id,s)}s.textContent=css}
export function removeStyle(id){const s=sheets.get(id);if(s){s.remove();sheets.delete(id)}}
export function injectQuery(u){return u}`,
  }),
);

await page.addInitScript(() => {
  const KEY = "science-app.v1";
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 3, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {},
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
  // pairs: [aRe, bRe][] — 왼쪽 pm-a 탭 → 오른쪽 pm-b 탭 (pairMatch.ts DOM)
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
  // 키가 나타나 활성화될 때까지 대기(스텝 전환·채점 잠금 과도기 흡수) 후 클릭
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
    // 만에 하나 오답 공개 상태면 계속하기로 전진(다음 typeAns가 잠긴 패드를 만나지 않게)
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
const tapSel = async (sel, idx = 0, wait = 320) => {
  const ok = await page.evaluate(([sel, idx]) => {
    const t = document.querySelectorAll(sel)[idx];
    if (!t) return false;
    t.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 23, isPrimary: true }));
    t.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 23, isPrimary: true }));
    if (t instanceof HTMLElement) t.click();
    return true;
  }, [sel, idx]);
  if (!ok) throw new Error(`tapSel 실패: ${sel}[${idx}] @ ${await h1()}`);
  await W(wait);
};
const homeFromDone = async () => {
  await waitBtn("홈으로", 900, 30000);
};
const log = (m) => console.log("  ·", m);

/* ══════════ 랩 드라이버(각 랩의 실제 DOM 기준) ══════════ */

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
/* 칩 탭 선택(pointerdown+up, move 없음) — likeTerms 계열 탭탭 폴백 */
const chipTap = async (re, wait = 380) => {
  const t = await page.evaluate((re) => {
    const c = [...document.querySelectorAll(".tm-chip")].find(
      (x) => x.offsetParent && new RegExp(re).test(x.textContent.replace(/\s+/g, "")),
    );
    if (!c) return false;
    c.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 32, isPrimary: true, clientX: 10, clientY: 10 }));
    c.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 32, isPrimary: true, clientX: 10, clientY: 10 }));
    return true;
  }, re);
  if (t) await W(wait);
  return t;
};

const LAB = {
  /* divLab: 예측 → 크랭크 → 정지/선언 (stop·nostop·third) — 선택지·크랭크·선언을 매 회 시도 */
  async divLab() {
    await page.waitForSelector(".dvl-machine", { timeout: 9000 });
    const step = async () => {
      await tapIf(".mq6-choice", 800); // 예측·분수 선택(있을 때만)
      if (!(await clickBtnIf("영원히 안 멈춰요", 1000))) await clickBtnIf("한 칸 더", 1000);
    };
    await untilChip("stop", step, 10, "1/4 완주");
    await W(1000);
    await untilChip("nostop", step, 18, "1/6 선언");
    await W(1000);
    await untilChip("third", step, 18, "세 번째 실험");
  },
  /* cycleLab: 마디 선택 → 검사 (one·three·late) */
  async cycleLab() {
    await page.waitForSelector(".cyl-strip", { timeout: 9000 });
    const seg = async (a, b) => {
      await tapIf(`.cyl-strip:not(.fold) .cyl-d[data-i="${a}"]`, 300);
      if (b !== a) await tapIf(`.cyl-strip:not(.fold) .cyl-d[data-i="${b}"]`, 300);
      await clickBtnIf("반복 검사", 4600); // 행진 연출 대기
    };
    await untilChip("one", () => seg(0, 0), 4, "마디 7");
    await W(1100);
    await untilChip("three", () => seg(0, 2), 4, "마디 135");
    await W(1100);
    await untilChip("late", () => seg(1, 2), 4, "마디 58");
  },
  /* denomLab: 분모 탭 → ×5 → 저주 → 룰렛 (ten·curse·wheel)
     국면 전환은 자동이 아니라 진행 버튼(다음 손님/마지막 방) — 결론 읽기 게이트(2026-07-19) */
  async denomLab() {
    await page.waitForSelector(".dnl-frac", { timeout: 9000 });
    await tapIf(".dnl-dnum.hint", 1600); // 분모 열기(첫 합체 자동 연출)
    await untilChip("ten", async () => {
      await tapIf(".dnl-dnum.hint", 1200);
      await clickBtnIf("×5", 1500);
    }, 8, "10 변신");
    await W(900);
    await untilChip("curse", async () => {
      await clickBtnIf("다음 손님", 1300); // 국면 1 결론 게이트
      await tapIf(".dnl-dnum.hint", 900);
      await clickBtnIf("×2", 1000);
      await clickBtnIf("×5", 1000);
      await clickBtnIf("순환소수 판정", 1200);
    }, 10, "3의 저주");
    await W(900);
    await untilChip("wheel", async () => {
      await clickBtnIf("마지막 방", 1300); // 국면 2 결론 게이트
      await clickBtnIf("다음 자리", 1300);
      // 여섯 자리 뒤 예측은 정답을 골라야 진행이 풀린다(비둘기집)
      if (!(await clickBtnIf("밟았던 자리", 1700))) await W(200);
    }, 20, "나머지 룰렛");
  },
  /* shiftLab: ×10 → 빼기 → 나누기 → 다음 판 → ×10(함정) → ×100 → 완주 (shift·erase·frac) */
  async shiftLab() {
    await page.waitForSelector(".sfl-stage", { timeout: 9000 });
    await waitBtn("×10", 2100);
    await waitBtn("빼기", 2400);
    await waitBtn("나누기", 2100);
    await waitBtn("다음 판", 900);
    // 판 2: ×10 함정 → 어긋남 연출·복귀 대기 → ×100 정공
    await waitBtn("×10", 3400);
    await waitBtn("×100", 2800);
    await waitBtn("빼기", 2400);
    await waitBtn("나누기", 2400);
    for (const id of ["shift", "erase", "frac"]) if (!(await chipOn(id))) throw new Error(`shiftLab 칩 미점등: ${id}`);
  },
  /* powMulLab: 예측 → 상자 탭탭 병합 → 선언 → 복제 (merge·base·clone) */
  async powMulLab() {
    await page.waitForSelector(".pml-box", { timeout: 9000 });
    const tapBox = async (i) => {
      await page.evaluate((i) => {
        const b = [...document.querySelectorAll(".pml-box")].filter((x) => x.offsetParent)[i];
        if (!b) return;
        b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 33, isPrimary: true, clientX: 8, clientY: 8 }));
        b.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 33, isPrimary: true, clientX: 8, clientY: 8 }));
      }, i);
      await W(600);
    };
    await untilChip("merge", async () => {
      await tapIf(".pml-choice", 800); // 국면 1 예측(있을 때만)
      await tapBox(0);
      await tapBox(1);
    }, 8, "병합");
    await W(1100);
    await untilChip("base", async () => {
      await tapBox(0); await tapBox(1);
      await clickBtnIf("합칠 수 없어요", 900);
    }, 8, "밑 다름 선언");
    await W(1100);
    await untilChip("clone", async () => {
      await tapIf(".pml-choice", 800);
      await clickBtnIf("2번 반복", 1400);
    }, 8, "복제");
  },
  /* powDivLab: 위·아래 칩 짝 상쇄 → 예측 → 상자 분배 (one·fate·dist) */
  async powDivLab() {
    await page.waitForSelector(".pdl-chip", { timeout: 9000 });
    const pair = async () => {
      await page.evaluate(() => {
        const alive = [...document.querySelectorAll(".pdl-chip")].filter(
          (c) => c.offsetParent && !c.classList.contains("poof") && !c.classList.contains("cut") && !c.classList.contains("mini"),
        );
        const top = alive.find((c) => (c.getAttribute("aria-label") || "").includes("분자"));
        const bot = alive.find((c) => (c.getAttribute("aria-label") || "").includes("분모"));
        top?.click();
        bot?.click();
      });
      await W(950);
    };
    for (let i = 0; i < 4; i++) await pair(); // 국면 1(a⁵/a³ 3쌍 + 여유)
    await W(1200);
    await untilChip("one", async () => {
      await tapIf(".pdl-choice", 900); // 국면 2 예측(있을 때만)
      await pair();
    }, 10, "전멸=1");
    await W(1200);
    await untilChip("fate", async () => {
      await tapIf(".pdl-choice", 900);
      await pair();
    }, 10, "세 운명");
    await W(1200);
    await untilChip("dist", async () => {
      await tapIf(".pdl-choice", 900);
      await tapIf(".pdl-box", 1400);
    }, 8, "괄호 분배");
  },
  /* monoLab: 칩 탭 → 존 탭 (sort·pow·flip) */
  async monoLab() {
    await page.waitForSelector(".mnl-zones", { timeout: 9000 });
    const put = async (chipRe, zone) => {
      await chipTap(chipRe, 350);
      await tapIf(`.mnl-zone.z${zone}`, 700);
    };
    await untilChip("sort", async () => {
      await put("^3$", "num"); await put("^a$", "var"); await put("^2$", "num"); await put("^b$", "var");
    }, 5, "헤쳐 모여");
    await W(1300);
    await untilChip("pow", async () => {
      await put("^5$", "num"); await put("a²|a2", "var"); await put("^3$", "num"); await put("^a$", "var");
    }, 5, "지수 합");
    await W(1300);
    const fracPair = async (topRe, botRe) => {
      await page.evaluate(([tRe, bRe]) => {
        const rows = [...document.querySelectorAll(".mnl-fracwrap .mnl-frow")];
        if (rows.length < 2) return;
        const pick = (row, re) =>
          [...row.querySelectorAll(".tm-chip")]
            .filter((c) => c.offsetParent && !c.classList.contains("mnl-x"))
            .find((c) => new RegExp(re).test(c.textContent.replace(/\s+/g, "")));
        const top = pick(rows[0], tRe);
        const bot = pick(rows[rows.length - 1], bRe);
        top?.click();
        window.setTimeout(() => bot?.click(), 260);
      }, [topRe, botRe]);
      await W(1100);
    };
    await untilChip("flip", async () => {
      await clickBtnIf("뒤집기", 1700);
      await fracPair("^6$|^3$", "^2$"); // 6↔2 (약분 뒤 3이면 재시도 무해)
      await fracPair("a", "^a$"); // a²↔a
    }, 10, "역수 뒤집기");
  },
  /* polyAddLab: 상자 탭 → 칩 탭탭 병합 → 선언 (open·flipsign·declare) */
  async polyAddLab() {
    await page.waitForSelector(".pal-box", { timeout: 9000 });
    const openBoxes = async () => {
      await tapIf(".pal-box:not(.open)", 1700);
      await tapIf(".pal-box:not(.open)", 1900);
    };
    const mergeAll = async () => {
      // 같은 종류 칩 탭탭 병합: x²끼리, x끼리, 상수끼리(부호는 − U+2212 포함)
      for (const re of ["x²|x2", "^[+−-]?\\d*x$", "^[+−-]?\\d+$"]) {
        for (let k = 0; k < 3; k++) {
          const two = await page.evaluate((re) => {
            const alive = [...document.querySelectorAll(".tm-chip")].filter((c) => c.offsetParent);
            const list = alive.filter((c) => new RegExp(re).test(c.textContent.replace(/\s+/g, "")));
            if (list.length < 2) return false;
            const tap = (el) => {
              el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 34, isPrimary: true, clientX: 6, clientY: 6 }));
              el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 34, isPrimary: true, clientX: 6, clientY: 6 }));
            };
            tap(list[0]);
            setTimeout(() => tap(list[1]), 260);
            return true;
          }, re);
          await W(1000);
          if (!two) break;
        }
      }
    };
    await untilChip("open", async () => { await openBoxes(); await mergeAll(); }, 6, "괄호 열기");
    await W(1300);
    await untilChip("flipsign", async () => { await openBoxes(); await mergeAll(); }, 8, "부호 반전");
    await W(1300);
    await untilChip("declare", async () => { await clickBtnIf("더는 못 합쳐요", 900); }, 6, "정리 끝 선언");
  },
  /* expandLab: 경계 탭 절단 → 예측·절단 → ÷ 두 번+선언 (cutk·minus·undo) */
  async expandLab() {
    await page.waitForSelector(".exl-stage svg", { timeout: 9000 });
    const VW = 360, VH = 162;
    // 국면 1: 경계(bx=221 — 4a=128·b=62 기하 검산판, y 중앙 88) 탭 → 자동 절단
    await untilChip("cutk", async () => {
      await svgPtE(".exl-stage svg", 221, 88, VW, VH);
    }, 6, "쪼개기");
    await W(1400);
    // 국면 2: 예측 후 경계(bx=211 — 3a=102 기하 검산판, h=68 중앙 74) 탭
    await untilChip("minus", async () => {
      await tapIf(".mq6-choice", 900);
      await svgPtE(".exl-stage svg", 211, 74, VW, VH);
    }, 8, "음수 분배");
    await W(1400);
    // 국면 3: ÷2a 버튼 2개 → 선언
    await untilChip("undo", async () => {
      await tapIf(".exl-divbtn:not(.gone)", 1200);
      await tapIf(".exl-divbtn:not(.gone)", 1200);
      await tapIf(".exl-declare", 900);
    }, 8, "되돌리기");
  },
};

/* SVG viewBox 좌표에 pointerdown+up(탭) */
const svgPtE = async (sel, vx, vy, VW, VH) => {
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
  await W(1400);
};

// 실패 시 화면·상태 증거를 남긴다
process.on("uncaughtException", async (e) => {
  console.log("FATAL:", e.message);
  try {
    const st = await page.evaluate(() => JSON.stringify({
      h1: document.querySelector(".step .h1")?.textContent?.slice(0, 30),
      keys: document.querySelectorAll(".mnp-k").length,
      keysVis: [...document.querySelectorAll(".mnp-k")].filter((k) => k.offsetParent).length,
      sheet: !!document.querySelector(".sheet.open"),
      cta: document.querySelector("button.cta")?.textContent?.trim(),
      mdrq: document.querySelector(".mdr-q")?.textContent?.slice(0, 30),
      done: !!document.querySelector(".done, [class*='done-']"),
    }));
    console.log("STATE:", st);
    await page.screenshot({ path: "qa/shots/m2u1-fail.png" });
  } catch {}
  await browser.close();
  process.exit(1);
});

console.log("=== 중2 수학 Ⅰ e2e 시작 (10레슨) ===");
await page.waitForSelector(".unit-tab", { timeout: 9000 });
const nodeCount = await page.evaluate(() => document.querySelectorAll(".gm-node").length);
log(`홈 지도 노드: ${nodeCount}`);
await shot("m2u1-home");

/* ================= L1 유한소수와 무한소수 ================= */
await openLesson("유한·무한");
log(`L1: ${await h1()}`);
await waitBtn("1÷3 눌러 보기", 1400);
await hookChoice();
await clickCTA();
await LAB.divLab();
await clickCTA(); // 랩 CTA → concept
await clickCTA(); // concept → recap
await clickCTA(); // recap → binSort
await binSortAuto([
  ["^0\\.5$", "유한"], ["0\\.666", "무한"], ["1\\.125", "유한"],
  ["3\\.141592", "무한"], ["0\\.121212", "무한"], ["0\\.3000", "유한"],
]);
await quiz(0);
await oxPick(false);
await drill(["0.75", "0.35", "1.125", "0.52", "0.375", "0.35"]);
await homeFromDone();
log("L1 완료");

/* ================= L2 순환소수 ================= */
await openLesson("순환소수");
log(`L2: ${await h1()}`);
await waitBtn("노래 재생하기", 1400);
await hookChoice();
await clickCTA();
await LAB.cycleLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await multiPick([0, 1]);
await binSortAuto([
  ["0\\.777", "한 글자"], ["0\\.353535", "두 글자"], ["1\\.246246", "세 글자"],
  ["4\\.090909", "두 글자"], ["6\\.888", "한 글자"], ["2\\.481481", "세 글자"],
]);
await drill([5, 12, 348, 70, 2, 1]);
await homeFromDone();
log("L2 완료");

/* ================= L3 유한소수 판별법 ================= */
await openLesson("판별법");
log(`L3: ${await h1()}`);
await waitBtn("생일 나눠 보기", 1400);
await hookChoice();
await clickCTA();
await LAB.denomLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await multiPick([0, 1]);
await oxPick(false);
await quiz(0);
await drill([1, 2, 1, 1, 7, 11]);
await homeFromDone();
log("L3 완료");

/* ================= L4 순환소수를 분수로 ================= */
await openLesson("분수 표현");
log(`L4: ${await h1()}`);
await waitBtn("양변에 ×3 하기", 1400);
await hookChoice();
await clickCTA();
await LAB.shiftLab();
await clickCTA();
await clickCTA();
await clickCTA();
await orderAuto(["x로 놓는다", "10의 거듭제곱", "변끼리 뺀다", "계수로 나누고"]);
await quiz(0);
await oxPick(true);
await multiPick([0, 1, 3]);
await drill(["7/9", "3/11", "4/3", "5/11", "8/3", "1/11"]);
await homeFromDone();
log("L4 완료");

/* ================= L5 지수법칙 1 ================= */
await openLesson("지수법칙 1");
log(`L5: ${await h1()}`);
await waitBtn("8시간 재우기", 1400);
await hookChoice();
await clickCTA();
await LAB.powMulLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await oxPick(false);
await quiz(0);
await pairMatchAuto([
  ["a.?4.?×", "a.?6"], ["\\(a.?4\\)", "a.?8"], ["a×a", "a.?7"], ["\\(a.?3\\)", "a.?9"],
]);
await drill([7, 10, 8, 10, 10, 7]);
await homeFromDone();
log("L5 완료");

/* ================= L6 지수법칙 2 ================= */
await openLesson("지수법칙 2");
log(`L6: ${await h1()}`);
await waitBtn("남은 용량 보기", 1400);
await hookChoice();
await clickCTA();
await LAB.powDivLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(true);
await multiPick([0, 1]);
await drill([5, 1, 4, 5, 5, 8]);
await homeFromDone();
log("L6 완료");

/* ================= L7 단항식의 곱셈과 나눗셈 ================= */
await openLesson("단항식 계산");
log(`L7: ${await h1()}`);
await waitBtn("패널 펼치기", 1400);
await hookChoice();
await clickCTA();
await LAB.monoLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([15, 4, 6, 6, 2, 4]);
await homeFromDone();
log("L7 완료");

/* ================= L8 다항식의 덧셈과 뺄셈 ================= */
await openLesson("다항식 정리");
log(`L8: ${await h1()}`);
await waitBtn("영수증 합치기", 1400);
await hookChoice();
await clickCTA();
await LAB.polyAddLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await binSortAuto([
  ["^3x", "이차항"], ["−5x$|-5x$", "일차항"], ["\\+7", "상수항"],
  ["−x²|−x2|-x", "이차항"], ["\\+x$", "일차항"], ["−12|-12", "상수항"],
]);
await drill([3, "-2", 4, "-3", 4, 5]);
await homeFromDone();
log("L8 완료");

/* ================= L9 전개 ================= */
await openLesson("전개");
log(`L9: ${await h1()}`);
await waitBtn("화면 나눠 보기", 1400);
await hookChoice();
await clickCTA();
await LAB.expandLab();
await clickCTA();
await clickCTA();
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([6, 10, 3, 12, 1, 3]);
await homeFromDone();
log("L9 완료");

/* ================= L10 식의 계산의 활용 ================= */
await openLesson("활용");
log(`L10: ${await h1()}`);
await waitBtn("조각 맞추기", 1400);
await hookChoice();
await clickCTA();
await clickCTA(); // concept
await clickCTA(); // recap
await orderAuto(["거듭제곱", "역수", "차례", "동류항"]);
await quiz(0);
await quiz(0);
await oxPick(false);
await drill([6, 6, 8, 4, 3, 32]);
await homeFromDone();
log("L10 완료");

console.log(`=== e2e 종료: pageErrors=${pageErrors} ===`);
await shot("m2u1-done");
await browser.close();
if (pageErrors > 0) process.exit(1);
