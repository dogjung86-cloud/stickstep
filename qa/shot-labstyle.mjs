// 랩의 다른 느낌 샘플: 판정 자료용 캡처. 샘플마다 지금 랩과 샘플을 같은 조작으로 끝까지 가며 시점마다 찍는다(390×700, 2배 해상도).
//   PORT=5567 node qa/shot-labstyle.mjs <출력 폴더>
// 파일 이름: <방향>-<now|new>-<시점>.png (방향: collage, sketch, model. 시점: mount, 조작 중 여러 장, ask, ask-wrong, done)
// 오답 카드(ask-wrong)까지 찍으려고 채점 판정을 일부러 한 번 틀린다. 나란히 놓은 비교 그림은 qa/make-labstyle-compare.py가 만든다.
import fs from "node:fs";
import path from "node:path";
import { SAMPLES, launchStyled, openLesson, goStep, measure, ds, W } from "./labstyle-lib.mjs";

const OUT = process.argv[2];
if (!OUT) {
  console.log("쓰는 법: PORT=5567 node qa/shot-labstyle.mjs <출력 폴더>");
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

for (const [style, tag] of [["0", "now"], ["1", "new"]]) {
  const { browser, page, errors } = await launchStyled({ style });
  for (const s of SAMPLES) {
    await openLesson(page, s.lab.li);
    await goStep(page, s.lab.si);
    if (tag === "new" && s.style === "model") {
      for (let i = 0; i < 60 && (await ds(page, "lsmReady")) !== "1"; i++) await W(page, 150);
      await W(page, 900);
    }
    const rows = [];
    const on = async (label) => {
      // 움직임이 가라앉은 뒤에 찍는다(새끼가 자라는 시간, 쪽지가 붙는 시간)
      await W(page, s.style === "sketch" && /^step/.test(label) ? 900 : 250);
      await page.screenshot({ path: path.join(OUT, `${s.style}-${tag}-${label}.png`) });
      rows.push(`${label}:${(await measure(page)).total}`);
    };
    await s.lab.play(page, { wrong: true, on });
    console.log(`${tag} ${s.name}: ${rows.join(" ")}`);
  }
  if (errors.length) console.log("페이지 오류:", errors.slice(0, 3).join(" / "));
  await browser.close();
}
