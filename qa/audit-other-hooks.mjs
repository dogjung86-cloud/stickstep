// 다른 단원의 도입(훅) 처음 화면을 같은 자로 잰다(견주기용). 장면 이름으로 레슨을 찾아 연다.
// PORT=5557 node qa/audit-other-hooks.mjs <출력 폴더> <장면 이름...>
import { mkdirSync } from "node:fs";
import * as L from "./u2intro-lib.mjs";

const OUT = process.argv[2] || "qa/shots/other-hooks";
const SCENES = process.argv.slice(3);
mkdirSync(OUT, { recursive: true });
const { browser, page } = await L.launch({ query: "" });
for (const scene of SCENES) {
  const info = await page.evaluate(async (sc) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const c = await import("/src/content/curriculum.ts");
    for (const u of [...c.CURRICULUM, ...c.CURRICULUM_G2]) {
      for (const l of u.lessons) {
        if (l.steps[0]?.type === "hook" && l.steps[0].scene === sc) {
          nav.reset(createLessonPlayer(l, { onExit: () => {}, onComplete: () => {} }));
          await new Promise((r) => setTimeout(r, 900));
          return { id: l.id, title: l.title, next: l.steps[1]?.type };
        }
      }
    }
    return null;
  }, scene);
  if (!info) {
    console.log(scene, "없음");
    continue;
  }
  await page.evaluate(() => document.querySelectorAll(".snack, .toast").forEach((e) => e.remove()));
  const m = await L.measure(page);
  const hasChoices = await page.evaluate(() => !!document.querySelector(".screen.active .hook-choices"));
  await page.screenshot({ path: `${OUT}/${info.id}-${scene}.png` });
  console.log(`${info.id} ${scene}: 처음 ${m.content}px(${(m.content / m.view).toFixed(2)}화면), 글자 ${m.chars}, 장면 시작 ${m.stage?.top}px, 예측 칸 ${hasChoices ? "있음" : "없음"}, 다음 스텝 ${info.next}`);
}
await browser.close();
