// 중1 Ⅱ 도입 샘플 캡처: 세 샘플의 흐름을 폰 크기(390×700)로 찍고, 지금 판의 도입도 같은 크기로 찍는다.
// PORT=5557 node qa/shot-u2intro.mjs <출력 폴더>
// 파일 이름: <레슨>-new-<차례>-<시점>.png(샘플), <레슨>-now-<차례>-<시점>.png(지금 판)
import { mkdirSync } from "node:fs";
import * as L from "./u2intro-lib.mjs";

const OUT = process.argv[2] || "qa/shots/u2intro-set";
mkdirSync(OUT, { recursive: true });
const { browser, page, errors } = await L.launch({ query: null });
const clear = () => page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
let n = 0;
const shot = async (id, kind, mark) => {
  await clear();
  n += 1;
  const name = `${id}-${kind}-${String(n).padStart(2, "0")}-${mark}.png`;
  await page.screenshot({ path: `${OUT}/${name}` });
  console.log(name);
};
const key = async (k, until) => {
  let guard = 0;
  while (!(await until()) && guard++ < 60) {
    await page.focus(".screen.active .opn-stage");
    await page.keyboard.press(k);
    await L.W(page, 200);
  }
  await page.evaluate(() => document.activeElement?.blur());
};

// ── 샘플 ──
// u2l4 유난히 긴 세포
n = 0;
await L.openSample(page, "u2l4");
await L.waitPhase(page, "ask");
await L.W(page, 500);
await shot("u2l4", "new", "처음");
await L.choose(page, "한 뼘");
await L.waitPhase(page, "pull");
await L.W(page, 600);
await shot("u2l4", "new", "예측한뒤");
{
  const a = await L.stagePt(page, 860, 440), b = await L.stagePt(page, 420, 440);
  await L.drag(page, a, b, 8);
  await L.W(page, 600);
  await shot("u2l4", "new", "조금밀었을때");
  await key("ArrowRight", async () => Number(await L.ds(page, "opnCm")) >= 58);
  await L.W(page, 400);
  await shot("u2l4", "new", "절반넘게");
  await key("ArrowRight", async () => (await L.ds(page, "opnPhase")) !== "pull");
  await L.waitPhase(page, "done");
  await L.W(page, 900);
  await shot("u2l4", "new", "끝");
}

// u2l9 두 바구니
n = 0;
await L.openSample(page, "u2l9");
await L.waitPhase(page, "play");
await L.W(page, 500);
await shot("u2l9", "new", "처음");
{
  // 끄는 도중(식물 바구니 위)
  const a = await L.stagePt(page, 480, 700), b = await L.stagePt(page, 250, 300);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / 8, a.y + ((b.y - a.y) * i) / 8);
    await L.W(page, 16);
  }
  await L.W(page, 250);
  await shot("u2l9", "new", "끄는중");
  await page.mouse.up();
  await L.waitFor(page, () => !document.querySelector(".screen.active .opn-stage").classList.contains("busy"), null, 60, 50);
  await L.W(page, 500);
  await shot("u2l9", "new", "식물바구니가돌려보냄");
  await page.evaluate(() => document.querySelector(".screen.active .opn-bk-hit[data-side=animal]")?.click());
  await L.waitPhase(page, "done");
  await L.W(page, 1200);
  await shot("u2l9", "new", "끝");
}

// u2l2 빵 공장
n = 0;
await L.openSample(page, "u2l2");
await L.waitPhase(page, "ask");
await L.W(page, 900);
await shot("u2l2", "new", "처음");
await L.choose(page, "발전기");
await L.waitPhase(page, "play");
await L.W(page, 700);
await shot("u2l2", "new", "예측한뒤");
for (const [k, name] of [["door", "출입문을멈춤"], ["ctrl", "통제실을멈춤"], ["gen", "발전기를멈춤"]]) {
  await page.evaluate((x) => document.querySelector(`.screen.active .opn-fc-card[data-key=${x}]`)?.click(), k);
  await L.W(page, 3000);
  await shot("u2l2", "new", name);
  await page.evaluate((x) => document.querySelector(`.screen.active .opn-fc-card[data-key=${x}]`)?.click(), k);
  await L.W(page, 600);
}
await L.waitPhase(page, "done");
await L.W(page, 900);
await shot("u2l2", "new", "끝");

// ── 지금 판 ──
const NOW = [
  { id: "u2l2", taps: [".hb4-bf-room[data-r=door]", ".hb4-bf-room[data-r=ctrl]", ".hb4-bf-room[data-r=gen]"], wrong: "빈 주머니" },
  { id: "u2l4", taps: [".hb4-bd"], wrong: "혈관" },
  { id: "u2l9", taps: [".hb4-mr"], wrong: "초록색" },
];
for (const S of NOW) {
  n = 0;
  await L.openSample(page, S.id, { now: true });
  await L.W(page, 700);
  await shot(S.id, "now", "처음");
  for (const sel of S.taps) {
    await page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);
    await L.W(page, 300);
  }
  await L.waitFor(page, () => !!document.querySelector(".screen.active .hook-choices.show"), null, 80, 50);
  await L.W(page, 800);
  await shot(S.id, "now", "예측");
  await L.choose(page, S.wrong);
  await L.W(page, 900);
  await shot(S.id, "now", "답한뒤");
}
if (errors.length) console.log("페이지 오류:", errors);
await browser.close();
