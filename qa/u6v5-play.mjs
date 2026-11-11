// 중1 Ⅵ v5의 랩 다섯 판과 도입 네 장면을 처음부터 끝까지 한 길로 조작한다.
// on(label)은 그 시점에 부르는 콜백(측정, 캡처). 랩의 첫 판정은 일부러 한 번 틀린다(오답 화면을 본다).
import { W, click, choose, setRange, waitAsk, askText, pick, tapNext, waitDs, waitFor, hold, ds } from "./u6v5-lib.mjs";

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
  async l1lab(page, on) {
    await W(page, 900);
    await on("l1lab-start");
    for (let i = 0; i < 3; i++) { await click(page, ".bv-btn.main"); await W(page, 350); }
    await W(page, 600);
    await on("l1lab-full");
    for (let i = 0; i < 3; i++) { await click(page, ".u6x-row2 .bv-btn:not(.main)"); await W(page, 350); }
    const q = await answer(page, on, "l1lab-q1", true);
    await answer(page, on, "l1lab-q2", false, q);
    await done(page, on, "l1lab");
  },
  async l2lab(page, on) {
    await W(page, 900);
    await on("l2lab-start");
    await setRange(page, 12);
    await W(page, 600);
    await click(page, ".bv-btn.main");
    await W(page, 400);
    await on("l2lab-mid");
    await setRange(page, 18);
    await W(page, 600);
    await click(page, ".bv-btn.main");
    await W(page, 700);
    await on("l2lab-curve");
    const q = await answer(page, on, "l2lab-q1", true);
    await answer(page, on, "l2lab-q2", false, q);
    await done(page, on, "l2lab");
  },
  async l3lab(page, on) {
    await W(page, 900);
    await on("l3lab-start");
    await setRange(page, 15);
    await W(page, 600);
    await on("l3lab-mid");
    await setRange(page, 30);
    await W(page, 900);
    await on("l3lab-top");
    await answer(page, on, "l3lab-q1", true);
    await waitDs(page, "u6Phase", "pump");
    await W(page, 500);
    await on("l3lab-jar");
    for (let i = 0; i < 3; i++) { await click(page, ".bv-btn.main"); await W(page, 450); }
    await W(page, 600);
    await on("l3lab-puffed");
    for (let i = 0; i < 3; i++) { await click(page, ".u6x-row2 .bv-btn:not(.main)"); await W(page, 450); }
    await done(page, on, "l3lab");
  },
  async l4lab(page, on) {
    await W(page, 900);
    await on("l4lab-start");
    await setRange(page, 8);
    await W(page, 2200);
    await on("l4lab-hot");
    await setRange(page, 0);
    await W(page, 2600);
    await on("l4lab-ice");
    const q = await answer(page, on, "l4lab-q1", true);
    await answer(page, on, "l4lab-q2", false, q);
    await done(page, on, "l4lab");
  },
  async l5lab(page, on) {
    await W(page, 900);
    await on("l5lab-start");
    await page.evaluate(() => document.querySelector(".screen.active .u6x-hold").scrollIntoView({ block: "nearest" }));
    const p = await page.evaluate(() => { const r = document.querySelector(".screen.active .u6x-hold").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await W(page, 1400);
    await on("l5lab-heating");
    if (!(await waitDs(page, "u6Phase", "down", 80))) throw new Error("l5lab: 구름 높이에 닿지 못함");
    await W(page, 300);
    await on("l5lab-cloud");
    await page.mouse.up();
    await answer(page, on, "l5lab-q1", true);
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
