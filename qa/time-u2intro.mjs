// 도입의 걸리는 시간 어림: 한 번 끝까지 하는 동안 화면에 뜬 글자 수와 조작 수를 센다. 지금 판 여덟 개와 샘플 셋을 같은 식으로 잰다.
// PORT=5557 node qa/time-u2intro.mjs
// 어림식: 뜬 글자 수(공백 제외, 잠깐 떴다 바뀐 글도 모두) ÷ 7(초당 읽는 글자) + 누른 횟수 × 1초 + 손댈 수 없이 기다리거나 끄는 시간.
// 읽는 빠르기는 사람마다 달라 어림일 뿐이다. 지금 판과 샘플을 같은 자로 견주는 데 뜻이 있다.
import * as L from "./u2intro-lib.mjs";

const { browser, page } = await L.launch({ query: null });
const texts = new Set();
const grab = async () => {
  const t = await page.evaluate(() => {
    const step = document.querySelector(".screen.active .step");
    if (!step) return [];
    const out = [];
    for (const sel of [".opn-title", ".opn-bubble", ".h1", ".sub", ".comic-bubble", ".helper", ".hook-q", ".hook-choice", ".opn-fc-card b", ".hb4-bh-cap"]) {
      for (const e of step.querySelectorAll(sel)) if (e.getClientRects().length) out.push((e.innerText || "").trim());
    }
    return out;
  });
  t.forEach((x) => x && texts.add(x));
};
const count = () => [...texts].reduce((s, t) => s + t.replace(/\s+/g, "").length, 0);
const polled = async (fn) => {
  let run = true;
  const poll = (async () => { while (run) { await grab(); await L.W(page, 150); } })();
  await fn();
  run = false;
  await poll;
  await grab();
};

console.log("── 지금 판 ──");
const NOW = [
  { id: "u2l2", taps: [".hb4-bf-room[data-r=door]", ".hb4-bf-room[data-r=ctrl]", ".hb4-bf-room[data-r=gen]"], wait: 0 },
  { id: "u2l3", taps: [".hb4-wl"], wait: 1.8 },
  { id: "u2l4", taps: [".hb4-bd"], wait: 1.75 },
  { id: "u2l5", taps: [".hb4-bh", ".hb4-bh"], wait: 1.2 },
  { id: "u2l6", taps: [".dk-spot[data-d=gull]", ".dk-spot[data-d=flower]", ".dk-spot[data-d=fish]"], wait: 0 },
  { id: "u2l8", taps: [".ms-shelf[data-side=fruit]", ".ms-shelf[data-side=veg]"], wait: 1.2 },
  { id: "u2l9", taps: [".hb4-mr"], wait: 2.5 },
  { id: "u2l10", taps: [".bg-switch"], wait: 2.2 },
];
for (const S of NOW) {
  texts.clear();
  await L.openSample(page, S.id, { now: true });
  await polled(async () => {
    await L.W(page, 500);
    for (const sel of S.taps) {
      await page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);
      await L.W(page, 500);
    }
    await L.waitFor(page, () => !!document.querySelector(".screen.active .hook-choices.show"), null, 80, 50);
    await L.W(page, 500);
    await L.choose(page, 0);
    await L.W(page, 1200);
  });
  const chars = count();
  console.log(`${S.id}: 뜬 글 ${texts.size}개 ${chars}자, 누름 ${S.taps.length + 1}번, 기다림 ${S.wait}초 → 어림 ${Math.round(chars / 7 + S.taps.length + 1 + S.wait)}초`);
}

console.log("── 샘플 ──");
const RUNS = [
  { id: "u2l4", play: (on) => L.playLongCell(page, { pick: "한 뼘", how: "drag", on }), taps: 1, extra: 6, note: "예측 1번 + 밀기 4번쯤(6초)" },
  { id: "u2l9", play: (on) => L.playBaskets(page, { how: "drag", on }), taps: 2, extra: 2.6, note: "놓기 2번(돌려받는 데 1.3초씩)" },
  { id: "u2l2", play: (on) => L.playFactory(page, { how: "card", on }), taps: 7, extra: 4.5, note: "예측 1번 + 멈추고 되살리기 6번(바뀐 모습 보기 1.5초씩)" },
];
for (const R of RUNS) {
  texts.clear();
  await L.openSample(page, R.id);
  await polled(() => R.play(async () => grab()));
  const chars = count();
  console.log(`${R.id}: 뜬 글 ${texts.size}개 ${chars}자, ${R.note} → 어림 ${Math.round(chars / 7 + R.taps + R.extra)}초`);
}
await browser.close();
