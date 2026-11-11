// 도입 샘플 엿보기: 한 장면을 끝까지 조작하며 시점마다 캡처한다(개발 중 눈으로 확인하는 용도).
// PORT=5557 node qa/u2intro-peek.mjs <레슨> <출력 폴더> [폭] [높이] [예측 낱말]
import { mkdirSync } from "node:fs";
import * as L from "./u2intro-lib.mjs";

const id = process.argv[2] || "u2l4";
const out = process.argv[3] || "qa/shots/u2intro";
const w = Number(process.argv[4] || 390), h = Number(process.argv[5] || 700);
const pick = process.argv[6];
mkdirSync(out, { recursive: true });
const S = L.SAMPLES.find((s) => s.id === id);
const { browser, page, errors } = await L.launch({ width: w, height: h, query: null });
await L.openSample(page, id);
const on = async (mark) => {
  const m = await L.measure(page);
  console.log(`${mark}: 스텝 ${m.stepH}px / 화면 ${m.view}px, 글자 ${m.chars}, 제목 ${m.titleLines}줄, 말 ${m.bubbleLines}줄, 잘림 ${JSON.stringify(m.clipped)}, 작은 글자 ${JSON.stringify(m.fonts.filter((f) => f.px < 12))}`);
  await page.screenshot({ path: `${out}/${id}-${w}-${mark}.png` });
};
const play = { longcell: L.playLongCell, baskets: L.playBaskets, factory: L.playFactory }[S.scene];
await play(page, { on, ...(pick ? { pick } : {}) });
console.log("CTA", JSON.stringify(await L.ctaState(page)), "오류", errors);
await browser.close();
