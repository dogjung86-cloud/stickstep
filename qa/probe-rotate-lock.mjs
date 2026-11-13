// probe-rotate-lock.mjs: 가로 모드 랩(rotateStage)이 기기 회전에 고정되는지 잰다.
// PORT=<포트> node qa/probe-rotate-lock.mjs [스크린샷 폴더]
//   세로(390×750)에서 가로 랩을 열고 → 가로(844×334, 주소창이 높이를 먹은 폰 가로) → 다시 세로로 바꾸며
//   무대의 논리 크기(style width/height), 화면 위 크기, 배율, 안쪽 요소의 무대 기준 상대 위치를 비교한다.
//   통과 조건: 논리 크기와 상대 배치가 회전 내내 같고, 세로로 돌아오면 화면 위 크기도 처음과 같다.
import { chromium } from "playwright-core";

const PORT = process.env.PORT || "3000";
const OUT = process.argv[2] || "";
const PORTRAIT = { width: 390, height: 750 };
const LANDSCAPE = { width: 844, height: 334 };
let fails = 0;
const check = (ok, label) => {
  console.log(ok ? "PASS" : "FAIL", label);
  if (!ok) fails++;
};

const LABS = [
  { id: "u7l1", name: "tourLab" },
  { id: "u7l6", name: "eclipseLab" },
  { id: "g2u7l3", name: "waterLab" },
];

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function measure(page) {
  return page.evaluate(() => {
    const inner = document.querySelector(".rot-inner");
    const stage = document.querySelector(".rot-stage");
    const ir = inner.getBoundingClientRect();
    const native = inner.classList.contains("native");
    const lw = parseFloat(inner.style.width), lh = parseFloat(inner.style.height);
    // 화면 위 크기를 무대의 가로 기준으로 되돌린다(세로 화면에서는 90° 돌아 있으므로 가로와 세로가 바뀐다)
    const sw = native ? ir.width : ir.height, sh = native ? ir.height : ir.width;
    // 안쪽 요소의 무대 기준 상대 배치(논리 좌표): offset 계열은 변환의 영향을 받지 않는다
    const kids = [...stage.children].map((c) => `${c.className.split(" ")[0]}@${c.offsetLeft},${c.offsetTop},${c.offsetWidth}x${c.offsetHeight}`);
    return { vw: innerWidth, vh: innerHeight, native, logical: `${lw}x${lh}`, onScreen: `${Math.round(sw)}x${Math.round(sh)}`, scale: +(sw / lw).toFixed(3), kids: kids.join(" | ") };
  });
}

for (const lab of LABS) {
  const page = await browser.newPage({ viewport: PORTRAIT, deviceScaleFactor: 2 });
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  await page.addInitScript(() =>
    localStorage.setItem("science-app.v1", JSON.stringify({ version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci", premium: true, reviewMode: true, goalMin: 10, lessons: {}, minigame: {} })),
  );
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(async (id) => {
    const { nav } = await import("/src/core/router.ts");
    const { createLessonPlayer } = await import("/src/lessons/player.ts");
    const { findLesson } = await import("/src/content/curriculum.ts");
    nav.go(createLessonPlayer(findLesson(id).lesson, () => {}));
  }, lab.id);
  await page.waitForTimeout(800);
  // 가로 화면을 여는 버튼이 나올 때까지 스텝을 앞으로 넘긴다(검토 모드라 앞으로 가기 화살표가 있다)
  let opened = false;
  for (let i = 0; i < 14 && !opened; i++) {
    opened = await page.evaluate(() => {
      const b = [...document.querySelectorAll(".screen.active button")].find((x) => x.offsetParent && !x.disabled && /가로 화면/.test(x.textContent));
      b?.click();
      return !!b;
    });
    if (opened) break;
    await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await page.waitForTimeout(600);
  }
  try {
    await page.waitForSelector(".rot-overlay.in", { timeout: 12000 });
  } catch {
    check(false, `${lab.name}: 가로 화면을 열지 못함`);
    await page.close();
    continue;
  }
  await page.waitForTimeout(1800);

  const a = await measure(page);
  if (OUT) await page.screenshot({ path: `${OUT}/${lab.name}-1-portrait.png` });
  await page.setViewportSize(LANDSCAPE);
  await page.waitForTimeout(700);
  const b = await measure(page);
  if (OUT) await page.screenshot({ path: `${OUT}/${lab.name}-2-landscape.png` });
  await page.setViewportSize(PORTRAIT);
  await page.waitForTimeout(700);
  const c = await measure(page);
  if (OUT) await page.screenshot({ path: `${OUT}/${lab.name}-3-portrait-again.png` });

  console.log(`\n[${lab.name}]`);
  for (const [k, m] of [["세로", a], ["가로", b], ["다시 세로", c]]) console.log(`  ${k}: 뷰포트 ${m.vw}x${m.vh} native=${m.native} 논리 ${m.logical} 화면 ${m.onScreen} 배율 ${m.scale}`);
  if (a.kids !== b.kids) console.log("  배치 세로:", a.kids, "\n  배치 가로:", b.kids);
  check(a.logical === b.logical && a.logical === c.logical, `${lab.name}: 논리 크기가 회전 내내 같다`);
  check(a.kids === b.kids && a.kids === c.kids, `${lab.name}: 안쪽 배치가 회전 내내 같다`);
  check(a.onScreen === c.onScreen && c.scale === 1, `${lab.name}: 세로로 돌아오면 처음 크기 그대로다`);

  // 나가기: 오버레이가 사라지고 스크롤 잠금이 풀린다
  await page.evaluate(() => document.querySelector(".rot-exit")?.click());
  await page.waitForTimeout(700);
  const gone = await page.evaluate(() => ({ ov: !!document.querySelector(".rot-overlay"), of: document.body.style.overflow, fs: !!document.fullscreenElement }));
  check(!gone.ov && gone.of !== "hidden" && !gone.fs, `${lab.name}: 나가면 세로 화면으로 돌아온다`);
  await page.close();
}

await browser.close();
console.log(fails ? `\n실패 ${fails}건` : "\n모두 통과");
process.exit(fails ? 1 : 0);
