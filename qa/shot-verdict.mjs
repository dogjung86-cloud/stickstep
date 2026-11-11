// 판정 표시 눈검수용 캡처: 랩 몇 판에서 질문이 뜬 때, 틀린 직후, 맞힌 직후를 폰 화면째 찍는다.
//   PORT=5567 node qa/shot-verdict.mjs <출력 폴더> [랩 열쇠,쉼표로]
// 캡처만 본 사람이 "맞혔는지 틀렸는지 한눈에 아는가"를 판정하게 넘긴다(만든 세션이 스스로 판정하지 않는다).
import fs from "node:fs";
import path from "node:path";
import { LABS, launch, openLesson, goStep } from "./u2v5-lib.mjs";

const OUT = process.argv[2] || "qa/shots/verdict";
const PICK = (process.argv[3] || "l1-magnify,l2-animal,l5-level,l7-beak,l8-kin,l10-web").split(",");
fs.mkdirSync(OUT, { recursive: true });

const labs = LABS.filter((l) => PICK.includes(l.key));
console.log("랩:", labs.map((l) => l.key).join(", ") || "(없음. 열쇠: " + LABS.map((l) => l.key).join(" ") + ")");
for (const wrong of [true, false]) {
  const { browser, page } = await launch({ width: 390, height: 700 });
  for (const lab of labs) {
    await openLesson(page, lab.li);
    await goStep(page, lab.si);
    const on = async (label) => {
      const want = wrong ? ["ask", "ask-wrong", "ask2-right"] : ["ask-right"];
      if (!want.includes(label)) return;
      const name = label === "ask" ? "1-질문" : label === "ask-wrong" ? "2-틀린직후" : label === "ask-right" ? "3-맞힌직후" : "4-둘째질문-맞힌직후";
      await page.screenshot({ path: path.join(OUT, `${lab.key}-${name}.png`) });
    };
    await lab.play(page, { wrong, on });
  }
  await browser.close();
}
console.log("저장:", OUT, fs.readdirSync(OUT).length, "장");
