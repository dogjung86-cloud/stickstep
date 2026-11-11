// 중1 Ⅱ v5 한 화면 예산 기계 검사.
// 랩 열세 판을 실제로 조작하면서 마운트, 조작 중, 판정, 오답 시점마다 치수를 잰다.
//   ONLY=l4-fit,l5-level 처럼 랩을 골라 돌릴 수 있다.
//   ① 스텝 전체 높이 ≤ 스크롤 영역(390×700에서 554px). 완료 뒤(궁금증 카드가 붙은 뒤)는 예외로 둔다.
//   ② 무대는 150px 안에서 시작하고, 조작 칸 자리는 처음부터 끝까지 움직이지 않는다(화면 밀림 0)
//   ③ 도움말은 두 줄 안, 조작 칸 안의 내용은 칸을 넘지 않는다
//   ④ 누르는 곳은 높이 48px 이상, 한 줄 글자는 잘리지 않는다
//   ⑤ 무대 안 글자는 12px 이상(390 폭 기준. 360 폭에서는 무대가 줄어 11px까지 허용)
//   ⑥ #frame이 스크롤되지 않는다
// 화면 세 가지(390×700 기준, 360×700 작은 폰, 430×932 큰 폰)에서 돈다.
//   PORT=5547 node qa/check-u2v5-fit.mjs [캡처 폴더]
import fs from "node:fs";
import path from "node:path";
import { LABS, BUDGET, launch, openLesson, goStep, measure } from "./u2v5-lib.mjs";

const SHOTS = process.argv[2] || "";
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const PICK = (process.env.ONLY || "").split(",").map((x) => x.trim()).filter(Boolean);
const VIEWS = [
  { w: 390, h: 700, name: "390×700", minFont: 12 },
  { w: 360, h: 700, name: "360×700", minFont: 11 },
  { w: 430, h: 932, name: "430×932", minFont: 12 },
];

let PASS = 0;
let FAIL = 0;
const fails = [];
const check = (cond, label) => {
  if (cond) PASS++;
  else {
    FAIL++;
    fails.push(label);
    console.log("  ✗", label);
  }
};

for (const view of VIEWS) {
  console.log(`\n■ ${view.name}`);
  const { browser, page, errors } = await launch({ width: view.w, height: view.h });
  for (const lab of LABS.filter((l) => !PICK.length || PICK.includes(l.key))) {
    const meta = await openLesson(page, lab.li);
    await goStep(page, lab.si);
    let slotTop = null;
    const rows = [];
    const on = async (label) => {
      const m = await measure(page);
      const tag = `[${view.name}] ${lab.key} ${label}`;
      rows.push(`${label}:${m.total}`);
      if (SHOTS && view.w === 390) await page.screenshot({ path: path.join(SHOTS, `${lab.key}-${label}.png`) });
      const afterDone = label === "done";
      if (view.h === 700 && view.w === 390) check(m.usable === BUDGET, `${tag} 스크롤 영역 ${m.usable} (기준 ${BUDGET})`);
      if (!afterDone) check(m.total <= m.usable, `${tag} 전체 ${m.total} ≤ ${m.usable}`);
      else check(m.curio && m.slot.top + m.slot.h <= m.usable, `${tag} 결론까지는 한 화면(조작 칸 끝 ${m.slot.top + m.slot.h}), 그 아래는 궁금증 카드`);
      check(m.stage.top <= 150, `${tag} 무대 시작 ${m.stage.top} ≤ 150`);
      if (slotTop === null) slotTop = m.slot.top;
      check(m.slot.top === slotTop, `${tag} 조작 칸 자리 ${m.slot.top} = ${slotTop}`);
      check(!m.helperOver, `${tag} 도움말 두 줄 안: "${m.helperText}"`);
      check(!m.slotOver, `${tag} 조작 칸 넘침 없음`);
      const small = m.taps.filter((t) => t.h < 48);
      check(small.length === 0, `${tag} 누르는 곳 48px 이상${small.length ? `: ${small.map((t) => `${t.t}(${t.h})`).join(", ")}` : ""}`);
      check(m.cut.length === 0, `${tag} 잘린 글자 없음${m.cut.length ? `: ${m.cut.join(" | ")}` : ""}`);
      check(m.minFont >= view.minFont, `${tag} 무대 글자 ${m.minFont}px ≥ ${view.minFont}${m.minFont < view.minFont ? ` ("${m.minFontText}")` : ""}`);
      check(m.frameScroll === 0, `${tag} #frame 스크롤 ${m.frameScroll}`);
    };
    check(meta.types[lab.si].endsWith("Lab"), `[${view.name}] ${lab.key} 스텝 타입 ${meta.types[lab.si]}`);
    await lab.play(page, { wrong: true, on });
    console.log(`  ${lab.key.padEnd(11)} ${rows.length}시점 최대 ${Math.max(...rows.map((r) => Number(r.split(":")[1])))}px`);
  }
  check(errors.length === 0, `[${view.name}] 페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

console.log(`\n한 화면 검사: PASS ${PASS} · FAIL ${FAIL}`);
if (FAIL) {
  console.log(fails.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
