// 중1 Ⅵ v5 단원 검사(한 번에): 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가며
//   시점마다 스크롤 높이가 한 화면(554px) 안인지, 도움말과 조작 칸이 넘치지 않는지, 잘린 글이 없는지,
//   끝 버튼으로 다음 스텝이 열리는지, 페이지 오류가 없는지 본다. 랩의 첫 판정은 한 번 틀려 본다.
//   그 길에서 뜬 화면 글에 대시, '교과서', 이모지, '분자'가 없는지도 본다. 끝으로 토글을 끈 첫 레슨이 정본 훅으로 열리는지 본다.
// 실행(서버 없이): bash qa/build-u6v5-dev.sh && node qa/check-u6v5.mjs [캡처 폴더]
// 실행(dev 서버): PORT=5576 node qa/check-u6v5.mjs [캡처 폴더]
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { launch, open, measure, cta, ctaState, stepKind, W } from "./u6v5-lib.mjs";
import { PLAY } from "./u6v5-play.mjs";

const OUT = process.argv[2] ?? "qa/shots/u6v5/check";
mkdirSync(OUT, { recursive: true });
let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.log("  FAIL " + msg);
  }
};
const LESSONS = [
  { id: "u6l1", op: "l1op", lab: "l1lab", labAt: 1 },
  { id: "u6l2", op: null, lab: "l2lab", labAt: 1 },
  { id: "u6l3", op: "l3op", lab: "l3lab", labAt: 1 },
  { id: "u6l4", op: "l4op", lab: "l4lab", labAt: 1 },
  { id: "u6l5", op: "l5op", lab: "l5lab", labAt: 1 },
];
const BAD = [/[—–]/, /\s-\s/, /교과서/, /분자/, /\p{Extended_Pictographic}/u];
const { browser, page, errors } = await launch();
const texts = new Set();
const at = async (label) => {
  const m = await measure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${label}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(!m.helperOver, `${label}: 도움말이 두 줄을 넘음`);
  ok(!m.slotOver, `${label}: 조작 칸이 넘침`);
  ok(m.cut.length === 0, `${label}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.titleLines === 1, `${label}: 제목 ${m.titleLines}줄`);
  ok(m.bubbleLines <= 2, `${label}: 쌤의 말 ${m.bubbleLines}줄`);
  ok(m.taps.every((t) => t.h >= 44), `${label}: 낮은 버튼 ${m.taps.filter((t) => t.h < 44).map((t) => t.t + t.h).join(",")}`);
  m.text.forEach((t) => texts.add(t));
  await page.screenshot({ path: join(OUT, `${label}.png`) });
};

for (const L of LESSONS) {
  console.log(L.id);
  await open(page, L.id);
  try {
    if (L.op) {
      ok((await stepKind(page)) === "opener", `${L.id}: 새 도입으로 열리지 않음(${await stepKind(page)})`);
      await PLAY[L.op](page, at);
      const c = await ctaState(page);
      ok(c.enabled, `${L.id}: 도입 끝 버튼이 열리지 않음("${c.text}")`);
      await cta(page);
    } else {
      // 만화로 시작하는 레슨: 검토 모드의 앞으로 가기로 랩까지 간다
      ok((await stepKind(page)) !== "opener", `${L.id}: 만화가 아니라 도입으로 열림`);
      await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
      await W(page, 700);
    }
    ok((await stepKind(page)) === "lab", `${L.id}: 새 랩이 열리지 않음(${await stepKind(page)})`);
    await PLAY[L.lab](page, at);
    const c = await ctaState(page);
    ok(c.enabled, `${L.id}: 랩 끝 버튼이 열리지 않음("${c.text}")`);
    await cta(page);
    const k = await stepKind(page);
    ok(k !== "lab" && k !== "opener" && k !== "", `${L.id}: 랩 뒤의 스텝이 열리지 않음(${k})`);
  } catch (e) {
    ok(false, `${L.id}: ${e.message}`);
  }
}

// 새로 쓴 문제(선택형, 복수 선택, OX): 정답을 눌러 정답으로 채점되는지 본다(차례 놓기 두 문제는 누르지 않는다)
const QUIZ = {
  u6l1: [[4, [0, 1, 2]], [7, 0], [8, "o"]],
  u6l2: [[7, 0], [9, 0]],
  u6l3: [[4, 2], [8, "x"]],
  u6l4: [[4, 2], [5, [0, 1, 2]], [8, "x"]],
  u6l5: [[6, 0]],
};
const tapSel = (sel) => page.evaluate((s) => document.querySelector(`.screen.active ${s}`)?.dispatchEvent(new MouseEvent("click", { bubbles: true })), sel);
for (const [id, list] of Object.entries(QUIZ)) {
  for (const [si, ans] of list) {
    await open(page, id);
    for (let i = 0; i < si; i++) {
      await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
      await W(page, 430);
    }
    await W(page, 500);
    if (ans === "o" || ans === "x") await tapSel(`.ox-btn.${ans}`);
    else for (const i of [].concat(ans)) {
      await tapSel(`.opts .opt[data-oi="${i}"]`);
      await W(page, 140);
    }
    await W(page, 250);
    await cta(page);
    const good = await page.evaluate(() => [...document.querySelectorAll(".sheet")].some((s) => s.className.includes("open") && s.className.includes("good")));
    ok(good, `${id} 스텝 ${si + 1}: 정답을 눌렀는데 정답 시트가 아님`);
    const m = await measure(page);
    m.text.forEach((t) => texts.add(t));
  }
}

// 화면 글 검사
const all = [...texts];
for (const t of all) for (const re of BAD) ok(!re.test(t), `금지 표현 ${re}: ${t.slice(0, 60)}`);
console.log(`화면 글 ${all.length}조각, ${all.join("").replace(/\s+/g, "").length}자`);

// 토글을 끄면 정본 그대로(첫 레슨의 첫 스텝이 지금의 훅)
await open(page, "u6l1", { on: false });
const k0 = await stepKind(page);
ok(k0 !== "opener" && k0 !== "lab", `토글을 껐는데 새 도입이 열림(${k0})`);
await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
await W(page, 800);
ok((await stepKind(page)) !== "lab", "토글을 껐는데 새 랩이 열림");

ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 3).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
