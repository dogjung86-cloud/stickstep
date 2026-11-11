// 중1 Ⅵ v5의 랩 다섯 판과 도입 네 장면을 처음부터 끝까지 한 길로 조작한다.
// on(label)은 그 시점에 부르는 콜백(측정, 캡처). 랩의 첫 판정은 일부러 한 번 틀린다(오답 화면을 본다).
import { W, click, choose, setRange, waitAsk, askText, pick, tapNext, waitDs, waitFor, hold, ds, stagePt } from "./u6v5-lib.mjs";

/** 판정 한 번. wrong이면 틀린 보기를 누른다. 결과가 뜬 화면에서 on을 부르고 '다음'을 누른다. */
async function answer(page, on, label, wrong = false, prev = "") {
  if (!(await waitAsk(page, prev))) throw new Error(`${label}: 판정 질문이 뜨지 않음`);
  await W(page, 350);
  const q = await askText(page);
  await on(`${label}-ask`);
  await pick(page, !wrong);
  await W(page, 500);
  await on(`${label}-${wrong ? "wrong" : "right"}`);
  await tapNext(page);
  return q;
}
const done = async (page, on, label) => {
  if (!(await waitDs(page, "u6Phase", "done", 150))) throw new Error(`${label}: 끝에 닿지 못함(${await ds(page, "u6Phase")})`);
  await waitFor(page, () => !!document.querySelector(".screen.active .bv-done.show"), null, 60);
  await W(page, 500);
  await on(`${label}-done`);
};

export const PLAY = {
  // ── 랩 ──
  async l1labA(page, on) {
    await W(page, 900);
    await on("l1labA-start");
    await click(page, ".bv-btn.main"); // 편평한 쪽, 힘 3
    await waitDs(page, "u6Tries", "1", 80);
    await W(page, 300);
    await on("l1labA-flat");
    await click(page, '.bv-card[data-k="sharp"]');
    await W(page, 250);
    await click(page, ".bv-btn.main");
    await waitDs(page, "u6Tries", "2", 80);
    await W(page, 300);
    await on("l1labA-sharp");
    await answer(page, on, "l1labA-q1", true);
    await done(page, on, "l1labA");
  },
  async l1labB(page, on) {
    await W(page, 900);
    await on("l1labB-start");
    await setRange(page, 1);
    await W(page, 900);
    await on("l1labB-soft");
    await click(page, '.bv-card[data-k="20"]');
    await setRange(page, 3);
    await W(page, 1200);
    await on("l1labB-hard");
    const q = await answer(page, on, "l1labB-q1", true);
    await waitDs(page, "u6Phase", "gas");
    await W(page, 700);
    await on("l1labB-gas");
    await click(page, ".bv-btn.main");
    await W(page, 1200);
    await on("l1labB-blown");
    await answer(page, on, "l1labB-q2", false, q);
    await done(page, on, "l1labB");
  },
  async l2lab(page, on) {
    await W(page, 900);
    await on("l2lab-start");
    await setRange(page, 2); // 센서를 연결하기 전에 민다: 공기가 샌다
    await W(page, 700);
    await on("l2lab-leak");
    await click(page, ".bv-btn.main"); // 되돌리지 않고 연결: 거절된다
    await W(page, 300);
    await setRange(page, 0);
    await W(page, 400);
    await click(page, ".bv-btn.main");
    await waitDs(page, "u6Phase", "play");
    for (const i of [2, 3, 4]) {
      await setRange(page, i);
      await W(page, 500);
      await click(page, ".bv-btn.main");
      await W(page, 350);
      if (i === 2) await on("l2lab-mid");
    }
    await W(page, 700);
    await on("l2lab-curve");
    const q = await answer(page, on, "l2lab-q1", true);
    await answer(page, on, "l2lab-q2", false, q);
    await done(page, on, "l2lab");
  },
  async l3lab(page, on) {
    await W(page, 900);
    await on("l3lab-start");
    await setRange(page, 0);
    await W(page, 900);
    await on("l3lab-deep");
    await setRange(page, 4);
    await W(page, 700);
    await on("l3lab-mid");
    await setRange(page, 5);
    await W(page, 900);
    await on("l3lab-high");
    const q = await answer(page, on, "l3lab-q1", true);
    await answer(page, on, "l3lab-q2", false, q);
    await done(page, on, "l3lab");
  },
  async l4labA(page, on) {
    await W(page, 700);
    await on("l4labA-predict");
    await pick(page, true); // 예측(정오 없음): 아무 보기나
    await waitDs(page, "u6Phase", "play");
    await W(page, 500);
    await on("l4labA-start");
    await click(page, '.bv-card[data-k="hot"]'); // 마개 없이 넣는다: 실패
    await W(page, 1500);
    await on("l4labA-open");
    await click(page, '.bv-card[data-k="table"]');
    await W(page, 900);
    await click(page, ".bv-btn.main");
    await W(page, 300);
    await click(page, '.bv-card[data-k="hot"]');
    await W(page, 3200);
    await on("l4labA-hot");
    await click(page, '.bv-card[data-k="ice"]');
    await W(page, 3600);
    await on("l4labA-ice");
    await answer(page, on, "l4labA-q1", true);
    await done(page, on, "l4labA");
  },
  async l4labB(page, on) {
    const tapGraph = async (t, v) => {
      // 그래프의 설계 좌표(346×230)를 화면 좌표로 바꿔 누른다
      const x = 176 + 22 + ((t - 20) / 60) * (330 - 176 - 40);
      const y = 188 - 12 - ((v - 28) / 10) * (188 - 48 - 24);
      const p = await stagePt(page, x / 346, y / 230);
      await page.mouse.click(p.x, p.y);
      await W(page, 350);
    };
    await W(page, 900);
    await on("l4labB-start");
    await tapGraph(20, 34); // 일부러 잘못 읽는다
    await on("l4labB-miss");
    await tapGraph(20, 30);
    for (const [t, v] of [[40, 32], [60, 34], [80, 36]]) {
      await click(page, ".bv-btn.main");
      await W(page, 2300);
      await tapGraph(t, v);
      if (t === 40) await on("l4labB-mid");
    }
    await W(page, 900);
    await on("l4labB-line");
    const q = await answer(page, on, "l4labB-q1", true);
    await answer(page, on, "l4labB-q2", false, q);
    await done(page, on, "l4labB");
  },
  async l5lab(page, on) {
    await W(page, 900);
    await on("l5lab-start");
    await click(page, '.bv-card[data-k="fast"]'); // 끓는 물에 바로: 터진다
    await waitDs(page, "u6Cooked", "1", 120);
    await W(page, 300);
    await on("l5lab-crack");
    await click(page, '.bv-card[data-k="slow"]');
    await W(page, 1500);
    await on("l5lab-slow");
    await waitDs(page, "u6Cooked", "2", 150);
    await W(page, 300);
    await on("l5lab-safe");
    await click(page, ".bv-btn.main");
    await answer(page, on, "l5lab-q1", true);
    await waitDs(page, "u6Phase", "up");
    await W(page, 500);
    await on("l5lab-balloon");
    await setRange(page, 12);
    if (!(await waitDs(page, "u6Phase", "down", 150))) throw new Error("l5lab: 구름 높이에 닿지 못함");
    await W(page, 600);
    await on("l5lab-cloud");
    await setRange(page, 2);
    await answer(page, on, "l5lab-q2", false);
    await done(page, on, "l5lab");
  },
  // ── 도입 ──
  async l1op(page, on) {
    await on("l1op-ask");
    await choose(page, "서서");
    await W(page, 500);
    await on("l1op-picked");
    await click(page, ".opn-u6-btn.stand");
    await W(page, 1500);
    await on("l1op-mid");
    await click(page, ".opn-u6-btn.flat");
    await opDone(page, on, "l1op");
  },
  async l3op(page, on) {
    await on("l3op-ask");
    await choose(page, "납작해진 채");
    await W(page, 500);
    await on("l3op-picked");
    await page.mouse.move(...Object.values(await hitPt(page)));
    await page.mouse.down();
    await W(page, 900);
    await on("l3op-pressed");
    await page.mouse.up();
    await W(page, 700);
    await on("l3op-mid");
    await hold(page, ".opn-u6-hit", 900);
    await opDone(page, on, "l3op");
  },
  async l4op(page, on) {
    await on("l4op-ask");
    await choose(page, "그대로");
    await W(page, 500);
    await on("l4op-picked");
    await click(page, ".opn-u6-btn.door");
    await W(page, 2000);
    await on("l4op-mid");
    await click(page, ".opn-u6-btn.door");
    await opDone(page, on, "l4op");
  },
  async l5op(page, on) {
    await on("l5op-ask");
    await choose(page, "더 찌그러져요");
    await W(page, 500);
    await on("l5op-picked");
    await hold(page, ".opn-u6-hit", 500); // 중간에 손을 뗀다
    await W(page, 500);
    await on("l5op-early");
    await page.mouse.move(...Object.values(await hitPt(page)));
    await page.mouse.down();
    await W(page, 2100);
    await on("l5op-popped");
    await page.mouse.up();
    await opDone(page, on, "l5op");
  },
};
const hitPt = (page) => page.evaluate(() => { const r = document.querySelector(".screen.active .opn-u6-hit").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
async function opDone(page, on, label) {
  if (!(await waitDs(page, "opnPhase", "done", 100))) throw new Error(`${label}: 끝에 닿지 못함(${await ds(page, "opnPhase")})`);
  await W(page, 1500);
  await on(`${label}-done`);
}
