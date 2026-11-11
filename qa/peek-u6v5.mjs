// 만드는 동안 한 스텝만 열어 보는 도구: node qa/peek-u6v5.mjs <레슨> <스텝 번호> <출력.png> [조작 이름]
// 조작은 qa/u6v5-play.mjs 의 PLAY 표에서 가져온다(없으면 연 화면만 찍는다).
import { launch, open, cta, W, measure } from "./u6v5-lib.mjs";

const [id, si, out, act] = process.argv.slice(2);
const { browser, page, errors } = await launch();
await open(page, id);
// 앞으로 가기 화살표로 스텝을 건넌다(검토 모드라 열려 있다)
for (let i = 0; i < Number(si); i++) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await W(page, 500);
}
if (act) {
  const { PLAY } = await import("./u6v5-play.mjs");
  await PLAY[act](page, async (label) => {
    const m = await measure(page);
    console.log(label, `${m.content}/${m.view}`, m.helperOver ? "도움말 넘침" : "", m.slotOver ? "칸 넘침" : "", m.cut.length ? "잘림 " + m.cut.join("|") : "");
    await page.screenshot({ path: out.replace(".png", `-${label}.png`) });
  });
} else {
  await W(page, 1500);
  const m = await measure(page);
  console.log(`${m.content}/${m.view}`, m.helperOver ? "도움말 넘침" : "", m.slotOver ? "칸 넘침" : "", JSON.stringify(m.taps));
  await page.screenshot({ path: out });
}
void cta;
if (errors.length) console.log("오류:", errors.slice(0, 5).join(" / "));
await browser.close();
