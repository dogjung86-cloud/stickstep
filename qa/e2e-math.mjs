// 중1 수학 Ⅰ 수와 연산 — 12레슨 전 스텝 실플레이 E2E. node qa/e2e-math.mjs (PORT 기본 5173)
// 훅(장면 버튼+예측), 랩(체·칩·트리·벤·별·수직선·셈돌·산책·패턴·분배), 넘패드 드릴, 퀴즈 전 유형.
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
  localStorage.setItem(KEY, JSON.stringify({
    version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "math",
    premium: true, reviewMode: false, goalMin: 10, streak: 2, lastStudyDay: null, totalXp: 0, lessons: {}, minigame: {},
  }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

const W = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `qa/shots/${name}.png` });
const h1 = () => page.evaluate(() => document.querySelector(".step .h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 34));
const clickCTA = async (timeout = 20000) => {
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
const waitBtn = async (re, wait = 420, timeout = 16000) => {
  await page.waitForFunction(
    (re) => [...document.querySelectorAll("button")].some((b) => b.offsetParent && !b.disabled && new RegExp(re).test(b.textContent)),
    re,
    { timeout },
  );
  await clickBtn(re, wait);
};
const hookChoice = async () => {
  await page.waitForSelector(".hook-choices.show .hook-choice", { timeout: 12000 });
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
const orderAuto = async (res) => {
  for (const re of res) {
    await page.evaluate((re) => {
      const chip = [...document.querySelectorAll("button")].filter((x) => x.offsetParent && !x.disabled)
        .find((x) => new RegExp(re).test(x.textContent) && !x.className.includes("cta"));
      chip?.click();
    }, re);
    await W(240);
  }
  await clickCTA(); await sheetContinue();
};
const pairMatchAuto = async (pairs) => {
  await page.waitForSelector(".pm-chip", { timeout: 9000 });
  for (const [aRe, bRe] of pairs) {
    await page.evaluate(([aRe, bRe]) => {
      const a = [...document.querySelectorAll(".pm-chip.pm-a")].find((c) => new RegExp(aRe).test(c.textContent) && !c.disabled);
      a?.click();
      const b = [...document.querySelectorAll(".pm-chip.pm-b")].find((c) => new RegExp(bRe).test(c.textContent) && !c.disabled);
      b?.click();
    }, [aRe, bRe]);
    await W(320);
  }
  await sheetContinue(); // pairMatch는 전부 맞추면 CTA 없이 시트가 바로 열린다
};

// ---- 넘패드 드릴: 답 문자열을 키 순서로 입력("-13/10", "2.5", "16") ----
const npKey = async (label) => {
  await page.evaluate((label) => {
    const k = [...document.querySelectorAll(".mnp-k")].find((x) => x.textContent.trim() === label && !x.disabled);
    if (!k) throw new Error(`no key ${label}`);
    k.click();
  }, label);
  await W(70);
};
const drillAnswer = async (ans) => {
  const s = String(ans);
  if (s.startsWith("-")) await npKey("+/−");
  for (const ch of s.replace(/^-/, "")) {
    if (ch === "/") await npKey("↓ 분모");
    else if (ch === ".") await npKey("·");
    else await npKey(ch);
  }
  await clickCTA(); // 확인하기
  await W(1050); // 정답 플래시 + 자동 진행
};
const drill = async (answers) => {
  await page.waitForSelector(".mdr-q", { timeout: 9000 });
  for (const a of answers) await drillAnswer(a);
  await clickCTA(); // 요약 → 계속하기
};

// ---- 지도에서 레슨 열기 ----
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

// ---- 보드 SVG 좌표 클릭(수직선 등) ----
const clickSvgAt = async (sel, fx, fy) => {
  const box = await page.evaluate((sel) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }, sel);
  if (!box) throw new Error(`no svg ${sel}`);
  await page.mouse.click(box.x + box.w * fx, box.y + box.h * fy);
  await W(420);
};

const log = (m) => console.log("  ·", m);
console.log("=== 중1 수학 Ⅰ e2e 시작 ===");

// 홈 지도 확인 + 스크린샷
await page.waitForSelector(".unit-band.num", { timeout: 9000 });
await shot("math-home");
log("홈: 수학 지도 OK");

/* ================= L1 소수 ================= */
await openLesson("^소수");
log(`L1: ${await h1()}`);
await clickBtn("땅속에서 깨우기");
await W(900);
await shot("math-l1-hook");
await hookChoice();
await clickCTA(); // 랩으로
// 체: 2→3→5→7 순서 탭
await page.waitForSelector(".sv-cell", { timeout: 9000 });
await W(1700); // 1 지워지는 인트로
const tapCell = async (n, wait) => {
  await page.evaluate((n) => {
    const c = [...document.querySelectorAll(".sv-cell")].find((x) => x.textContent.trim() === String(n));
    c?.click();
  }, n);
  await W(wait);
};
await tapCell(2, 2600);
await tapCell(3, 1900);
await tapCell(5, 1400);
await tapCell(7, 3200);
await shot("math-l1-sieve");
await clickCTA(); // concept
await clickCTA(); // recap
await page.evaluate(() => document.querySelector(".rc-card.has-more")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(500);
await shot("math-l1-recap");
await clickCTA();
await quiz(2);
await quiz(2);
await oxPick(false);
await binSortAuto([["^2$", "소수"], ["15", "합성수"], ["23", "소수"], ["27", "합성수"], ["31", "소수"], ["51", "합성수"]]);
await drill([2, 6, 1, 3, 2, 6]);
await page.waitForSelector("#sc-done, .done-mid", { timeout: 9000 }).catch(() => {});
await clickBtn("홈으로", 900).catch(() => {});
log("L1 완료");

/* ================= L2 거듭제곱 ================= */
await openLesson("거듭제곱");
log(`L2: ${await h1()}`);
for (let i = 0; i < 5; i++) await clickBtn("반으로 접기", 460);
await hookChoice();
await clickCTA();
// powBuild: 탭-탭 병합
await page.waitForSelector(".pw-chip", { timeout: 9000 });
const mergeOnce = async (base) => {
  const done = await page.evaluate((base) => {
    const chips = [...document.querySelectorAll(".pw-chip")].filter((c) => c.firstChild?.nodeValue?.trim() === String(base));
    if (chips.length < 2) return false;
    const down = (el) => {
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 7, isPrimary: true, clientX: 10, clientY: 10 }));
      el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 7, isPrimary: true, clientX: 10, clientY: 10 }));
    };
    down(chips[0]);
    down(chips[1]);
    return true;
  }, base);
  await W(620);
  return done;
};
await W(700);
for (let i = 0; i < 2; i++) await mergeOnce(2); // 3개 → 1개
await W(2400); // 스테이지 전환
for (let i = 0; i < 3; i++) await mergeOnce(3); // 4개 → 1개
await W(2400);
await mergeOnce(2);
await mergeOnce(5);
await mergeOnce(5);
await W(800);
await shot("math-l2-pow");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await oxPick(false);
await pairMatchAuto([["2³", "세제곱"], ["3²", "^3의 제곱"], ["5⁴", "네제곱"], ["10²", "10의 제곱"]]);
await drill([16, 27, 100, 25, 32, 1]);
await clickBtn("홈으로", 900).catch(() => {});
log("L2 완료");

/* ================= L3 소인수분해 ================= */
await openLesson("소인수분해");
log(`L3: ${await h1()}`);
await hookChoice(); // lockcode는 바로 ask
await clickCTA();
// factorTree: 60(2×30→2×15→3×5) → 다른 길(6×10) → 90(9×10)
await page.waitForSelector(".ft-stage svg", { timeout: 9000 });
const tapNode = async (v) => {
  await page.evaluate((v) => {
    const g = [...document.querySelectorAll(`.ft-stage g[data-v="${v}"]`)].pop();
    g?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, v);
  await W(380);
};
const pick = async (re) => { await clickBtn(re, 520); };
await tapNode(60); await pick("^2×30");
await tapNode(30); await pick("^2×15");
await tapNode(15); await pick("^3×5");
await W(2600); // 미션1 완료 + 리셋
await tapNode(60); await pick("^6×10");
await tapNode(6); await pick("^2×3");
await tapNode(10); await pick("^2×5");
await W(2600);
await tapNode(90); await pick("^9×10");
await tapNode(9); await pick("^3×3");
await tapNode(10); await pick("^2×5");
await W(900);
await shot("math-l3-tree");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(2);
await quiz(0);
await multiQuiz([0, 1, 2]);
await drill([7, 2, 3, 2, 100, 11]);
await clickBtn("홈으로", 900).catch(() => {});
log("L3 완료");

/* ================= L4 최대공약수 ================= */
await openLesson("최대공약수");
log(`L4: ${await h1()}`);
await hookChoice();
await W(600);
await clickCTA();
// venn gcd: 탭-탭 짝짓기 (좌 2↔우 2)×2, (좌 3↔우 3)
await page.waitForSelector(".vn-chip", { timeout: 9000 });
await W(1500); // 칩 스폰
const vennPair = async (base) => {
  const ok = await page.evaluate((base) => {
    const chips = [...document.querySelectorAll(".vn-chip")].filter((c) => c.textContent.trim() === String(base) && !c.classList.contains("locked"));
    if (chips.length < 2) return false;
    chips.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x);
    const tap = (el) => {
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 9, isPrimary: true, clientX: 5, clientY: 5 }));
      el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 9, isPrimary: true, clientX: 5, clientY: 5 }));
    };
    tap(chips[0]);
    tap(chips[chips.length - 1]);
    return true;
  }, base);
  await W(700);
  return ok;
};
await vennPair(2);
await vennPair(2);
await vennPair(3);
await W(900);
await waitBtn("공약수 전부 보기", 700);
await shot("math-l4-venn");
await clickCTA(); // starDraw로
// 별그리기(직접 드로잉): 점을 순서대로 탭 — 첫 탭이 보폭을 정한다
await page.waitForSelector(".sd-stage svg", { timeout: 9000 });
const starTap = async (i, nPts) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / nPts;
  await clickSvgAt(".sd-stage svg", (180 + 90 * Math.cos(a)) / 360, (126 + 90 * Math.sin(a)) / 240);
  await W(180);
};
for (const i of [2, 4, 0]) await starTap(i, 6); // 보폭 2 → 3점만 밟고 실패
await W(1000);
await waitBtn("다시 그리기", 800);
for (const i of [3, 0]) await starTap(i, 6); // 보폭 3 → 실패 → 6점의 비밀
await W(1200);
await waitBtn("5점", 800);
for (const i of [2, 4, 1, 3, 0]) await starTap(i, 5); // 보폭 2 → 5점 별 성공
await W(1400);
await waitBtn("8점", 800);
for (const i of [3, 6, 1, 4, 7, 2, 5, 0]) await starTap(i, 8); // 보폭 3 → 8점 별 성공
await W(2100);
await shot("math-l4-star");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([6, 4, 7, 1, 12]);
await clickBtn("홈으로", 900).catch(() => {});
log("L4 완료");

/* ================= L5 최소공배수 ================= */
await openLesson("최소공배수");
log(`L5: ${await h1()}`);
await hookChoice();
await W(4200); // 시계 감기 연출
await clickCTA();
// venn lcm: 칩 전부 탭 (5개) → 검산 → 서로소 스테이지(4개)
await page.waitForSelector(".vn-chip", { timeout: 9000 });
const tapAllVenn = async () => {
  const n = await page.evaluate(() => {
    const chips = [...document.querySelectorAll(".vn-chip")];
    chips.forEach((c, i) => setTimeout(() => c.click(), i * 130));
    return chips.length;
  });
  await W(n * 130 + 800);
};
await tapAllVenn();
await waitBtn("검산하기", 900);
await W(2200); // 서로소 스테이지 전환
await tapAllVenn();
await W(700);
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(false);
await binSortAuto([
  ["공통 소인수만", "최대공약수"], ["작은 쪽", "최대공약수"], ["큰 쪽", "최소공배수"],
  ["전부", "최소공배수"], ["약수를 나눈다", "최대공약수"], ["서로소면", "최소공배수"],
]);
await drill([12, 24, 35, 30, 18]);
await clickBtn("홈으로", 900).catch(() => {});
log("L5 완료");

/* ================= L6 음수 ================= */
await openLesson("정수·유리수");
log(`L6: ${await h1()}`);
await clickBtn("냉동실 보기", 800);
await hookChoice();
await clickCTA();
// numline place: -3, +2, -1.5, +2.5
await page.waitForSelector(".nl-stage svg", { timeout: 9000 });
const lineX = (v) => (180 + v * 32) / 360; // X0=180, UNIT=32, vb 360
for (const v of [-3, 2, -1.5, 2.5]) {
  await clickSvgAt(".nl-stage svg", lineX(v), 86 / 150);
  await W(700);
}
await W(600);
await shot("math-l6-numline");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(4);
await binSortAuto([["−7|^-7", "^정수"], ["3.5", "아닌"], ["^0$", "^정수"], ["3/2", "아닌"], ["9/3", "^정수"], ["0.8", "아닌"]]);
await quiz(0);
await oxPick(true);
await drill([-7, -3, -5, "-3/2", 2.5, -70]);
await clickBtn("홈으로", 900).catch(() => {});
log("L6 완료");

/* ================= L7 절댓값 ================= */
await openLesson("절댓값");
log(`L7: ${await h1()}`);
await clickBtn("반경 그리기", 2200);
await hookChoice();
await clickCTA();
// numline abs: -3 → +3 → 0 탭
await page.waitForSelector(".nl-stage svg", { timeout: 9000 });
for (const v of [-3, 3, 0]) {
  await clickSvgAt(".nl-stage svg", lineX(v), 86 / 150);
  await W(1100);
}
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await orderAuto(["산소", "에탄올", "수은", "얼음", "납"]);
await W(200);
await shot("math-l7-temp");
await quiz(0);
await drill([7, 4.5, 0, "3/4", 5, 3]);
await clickBtn("홈으로", 900).catch(() => {});
log("L7 완료");

/* ================= L8 덧셈 ================= */
await openLesson("^덧셈");
log(`L8: ${await h1()}`);
await clickBtn("합계 공개", 1100);
await hookChoice();
await clickCTA();
// counter add: 3문제
await page.waitForSelector(".ct-stone", { timeout: 9000 });
await W(1400);
const tapStone = async (cls) => {
  return page.evaluate((cls) => {
    const s = [...document.querySelectorAll(`.ct-stone.${cls}`)].find((x) => !x.classList.contains("poof"));
    if (!s) return false;
    const r = s.getBoundingClientRect();
    const opts = { bubbles: true, pointerId: 11, isPrimary: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    s.dispatchEvent(new PointerEvent("pointerdown", opts));
    s.dispatchEvent(new PointerEvent("pointerup", opts));
    return true;
  }, cls);
};
// 상쇄 가능한 쌍이 없어질 때까지 탭-탭(스폰 중 busy로 버려진 탭은 재시도로 흡수)
const stoneCount = () =>
  page.evaluate(() => ({
    pos: document.querySelectorAll(".ct-stone.pos:not(.poof)").length,
    neg: document.querySelectorAll(".ct-stone.neg:not(.poof)").length,
  }));
const waitStones = async (total) => {
  await page.waitForFunction(
    (total) => document.querySelectorAll(".ct-stone:not(.poof)").length >= total,
    total,
    { timeout: 12000 },
  );
  await W(800); // born 애니 + busy 해제 여유
};
const annihilateAll = async () => {
  for (let i = 0; i < 16; i++) {
    const c = await stoneCount();
    if (!c.pos || !c.neg) break;
    await tapStone("pos");
    await W(300);
    await tapStone("neg");
    await W(1150);
  }
};
await waitStones(8); // (+3)+(-5)
await annihilateAll();
await waitBtn("그냥 세어 보기", 1400); // (-2)+(-4)
await page.waitForFunction(() => /\(\+4\)/.test(document.querySelector(".nw-expr")?.textContent ?? ""), { timeout: 12000 });
await waitStones(8); // (+4)+(-4)
await annihilateAll();
await W(1600);
await clickCTA(); // numWalk로
// numWalk: 3문제 — 아무 곳(0) 예측 탭 → 걷기 대기
await page.waitForSelector(".nw-stage svg", { timeout: 9000 });
for (let i = 0; i < 3; i++) {
  await W(700);
  await clickSvgAt(".nw-stage svg", lineX(0) * (336 / 360) + 24 / 360, 118 / 168).catch(() => {});
  await W(6200);
}
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([16, -2, -8, 1.9, "-13/10", 23]);
await clickBtn("홈으로", 900).catch(() => {});
log("L8 완료");

/* ================= L9 뺄셈 ================= */
await openLesson("^뺄셈");
log(`L9: ${await h1()}`);
await clickBtn("밤으로 넘기기", 800);
await hookChoice();
await clickCTA();
// counter sub: 0쌍 2회 → 빨강 2개를 통으로
await page.waitForSelector(".ct-stone", { timeout: 9000 });
await W(1600);
await waitBtn("0쌍 넣기", 1100);
await waitBtn("0쌍 넣기", 1100);
const stoneToBin = async () => {
  await tapStone("neg");
  await W(300);
  await page.evaluate(() => {
    const bin = document.querySelector(".ct-bin");
    const r = bin.getBoundingClientRect();
    const opts = { bubbles: true, pointerId: 12, isPrimary: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    bin.dispatchEvent(new PointerEvent("pointerdown", opts));
    bin.dispatchEvent(new PointerEvent("pointerup", opts));
    bin.click();
  });
  await W(1000);
};
// 빨간 돌 2개가 통으로 사라질 때까지 재시도(스폰 직후 busy 탭 유실 흡수)
for (let i = 0; i < 8; i++) {
  const negLeft = await page.evaluate(() => document.querySelectorAll(".ct-stone.neg:not(.poof)").length);
  if (negLeft === 0) break;
  await stoneToBin();
}
await W(1500);
await shot("math-l9-counter");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([7, 10, -9, -6, "-1/12", -7, 5]);
await clickBtn("홈으로", 900).catch(() => {});
log("L9 완료");

/* ================= L10 곱셈 ================= */
await openLesson("^곱셈");
log(`L10: ${await h1()}`);
await clickBtn("재생", 1900);
await waitBtn("거꾸로 재생", 2100);
await hookChoice();
await clickCTA();
// patternLab: (−3), (−6), (+3), (+6) 순서로 정답 선택 → 규칙 카드
await page.waitForSelector(".pt-choices", { timeout: 9000 });
const pickChoice = async (re) => {
  await page.waitForFunction((re) => {
    return [...document.querySelectorAll(".pt-choice")].some((b) => new RegExp(re).test(b.textContent) && b.offsetParent);
  }, re, { timeout: 9000 });
  await page.evaluate((re) => {
    const b = [...document.querySelectorAll(".pt-choice")].find((x) => new RegExp(re).test(x.textContent) && x.offsetParent);
    b?.click();
  }, re);
  await W(700);
};
await pickChoice("\\(−3\\)");
await pickChoice("\\(−6\\)");
await W(1500); // 2막 전환
await pickChoice("\\(\\+3\\)");
await pickChoice("\\(\\+6\\)");
await W(1200);
await page.evaluate(() => document.querySelector(".pt-rule")?.click());
await W(800);
await shot("math-l10-pattern");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(2);
await oxPick(false);
await quiz(0);
await binSortAuto([
  ["\\(−2\\)×\\(−5\\)", "양수"], ["\\(\\+3\\)×\\(−7\\)", "음수"], ["\\(−2\\)³", "음수"],
  ["\\(−1\\)", "양수"], ["−3²", "음수"], ["\\(−4\\)", "음수"],
]);
await drill([-30, 20, "-1/3", 42, -8, -9]);
await clickBtn("홈으로", 900).catch(() => {});
log("L10 완료");

/* ================= L11 나눗셈·분배 ================= */
await openLesson("나눗셈");
log(`L11: ${await h1()}`);
await clickBtn("스톱워치 시작", 2100);
await hookChoice();
await clickCTA();
// areaSplit: 키보드로 핸들 이동 2곳 → 100−2 → 넘패드 490
await page.waitForSelector(".as-stage svg", { timeout: 9000 });
await page.focus(".as-stage svg").catch(() => {});
await page.evaluate(() => document.querySelector(".as-stage svg")?.focus());
await page.keyboard.press("ArrowRight");
await W(400);
await page.keyboard.press("ArrowLeft");
await W(900);
await waitBtn("100", 1200); // 98=100−2 버튼
await W(600);
// 넘패드 490 + 확인
await npKey("4"); await npKey("9"); await npKey("0");
await waitBtn("^확인하기$", 900);
await W(700);
await shot("math-l11-area");
await clickCTA(); // concept
await clickCTA(); // recap
await clickCTA();
await quiz(0);
await quiz(0);
await quiz(0);
await oxPick(true);
await drill([-9, -2.1, -20, -14, 5, 485]);
await clickBtn("홈으로", 900).catch(() => {});
log("L11 완료");

/* ================= L12 보스전 ================= */
await openLesson("보스전");
log(`L12: ${await h1()}`);
await clickBtn("댓글창 구경하기", 2100);
await hookChoice();
await clickCTA(); // concept(계산 순서)
await clickCTA(); // recap(총정리)
await page.evaluate(() => document.querySelector(".rc-card.has-more")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
await W(400);
await shot("math-l12-recap");
await clickCTA();
await quiz(0);
await multiQuiz([0, 2, 4]);
await quiz(0);
await drill([-10, -20, 4, 13, 9, 2, "7/12", -1, 294, -5]);
await W(400);
await shot("math-l12-done");
await clickBtn("홈으로", 900).catch(() => {});
log("L12 완료");

// 최종 지도 상태
await W(800);
await shot("math-home-done");
const doneCount = await page.evaluate(() => document.querySelectorAll(".gm-node.done").length);
console.log(`=== 완료 노드: ${doneCount}/12 · 페이지 에러: ${pageErrors} ===`);
await browser.close();
if (pageErrors > 0 || doneCount < 12) process.exit(1);
console.log("E2E PASS");
