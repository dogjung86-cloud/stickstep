// 세포 구조 랩(u2l2)의 무대를 빨리 들여다보는 도구: 동물, 식물의 여러 시점을 찍어 한 폴더에 둔다.
//   PORT=5567 node qa/cell3d-peek.mjs <출력 폴더> [animal|plant|both] [flat]
//   flat을 붙이면 평면 무대(WebGL을 쓸 수 없는 기기에서 뜨는 것)로 찍는다.
import fs from "node:fs";
import path from "node:path";
import { launch, openLesson, goStep, W, tap, ds, waitFor, waitAsk, pickRight, pickWrong } from "./u2v5-lib.mjs";

const OUT = process.argv[2] || "qa/shots/cell3d";
const WHICH = process.argv[3] || "both";
const FLAT = process.argv.includes("flat");
fs.mkdirSync(OUT, { recursive: true });

const { browser, page, errors } = await launch({ width: 390, height: 700 });
if (FLAT) await page.evaluate(() => sessionStorage.setItem("ss.cellflat", "1"));
const shot = async (name) => {
  const box = await page.evaluate(() => {
    const r = document.querySelector(".screen.active .bv-stage").getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: box });
  await page.screenshot({ path: path.join(OUT, `${name}-full.png`) });
};
const ready = async () => {
  if (FLAT) return true;
  return waitFor(page, () => document.querySelector(".screen.active .step.bv-step")?.dataset.cwkReady === "1");
};

for (const mode of WHICH === "both" ? ["animal", "plant"] : [WHICH]) {
  const tagName = `${mode}${FLAT ? "-flat" : ""}`;
  await openLesson(page, 1);
  await goStep(page, mode === "plant" ? 4 : 2);
  console.log(tagName, "stage:", await ds(page, "cwkStage"), "ready:", await ready());
  await W(page, 1500);
  await shot(`${tagName}-1-mount`);
  const keys = mode === "plant" ? ["chl", "wall"] : ["mem", "nuc", "mito"];
  let i = 2;
  for (const k of keys) {
    await tap(page, `.bv-card[data-k="${k}"]`);
    await W(page, 2300);
    await shot(`${tagName}-${i++}-off-${k}`);
  }
  await waitFor(page, () => {
    const b = document.querySelector(".screen.active .cwk-diag");
    return !!b && !b.hidden;
  });
  await tap(page, ".cwk-diag");
  await waitAsk(page);
  await W(page, 1200);
  await shot(`${tagName}-${i++}-ask1`);
  await pickWrong(page);
  await W(page, 700);
  await shot(`${tagName}-${i++}-ask1-wrong`);
  await tap(page, ".bv-q.show .bv-next");
  await W(page, 1300);
  await shot(`${tagName}-${i++}-ask2`);
  await page.evaluate(() => [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].find((b) => b.dataset.ok === "1")?.click());
  await W(page, 700);
  await shot(`${tagName}-${i++}-ask2-right`);
  await tap(page, ".bv-q.show .bv-next");
  await W(page, 900);
  await shot(`${tagName}-${i++}-done`);
}
console.log("page errors:", errors.length, errors.slice(0, 3).join(" | "));
await browser.close();
void pickRight;
