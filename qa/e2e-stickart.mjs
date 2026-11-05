// 잉크 스틱맨(과학) 동작 검증: 관절·머리 애니메이션이 걸린 장면과 캔버스 랩이 전환 뒤에도 그대로 도는지 본다.
// PORT=<포트> node qa/e2e-stickart.mjs
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const OUT = "qa/shots/stickart-e2e";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const base = `http://localhost:${process.env.PORT || 5199}/qa-stickscenes.html`;
let pass = 0;
let fail = 0;
const check = (name, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
};

async function open(q, width = 420) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  page.errs = [];
  page.on("pageerror", (e) => page.errs.push(e.message));
  await page.goto(`${base}?${q}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__qa !== undefined, null, { timeout: 90000 });
  await page.waitForTimeout(600);
  return page;
}
const clickBtn = (page, txt) =>
  page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((e) => e.textContent.includes(t));
    if (!b) return false;
    b.click();
    return true;
  }, txt);

// 1) 빙판길: 관절 클래스 4개가 잉크 획에 살아 있고, 걷기 → 미끄러짐이 돈다
{
  const p = await open("scenes=iceslip");
  const parts = await p.evaluate(() => ["armF", "armB", "legF", "legB"].map((k) => !!document.querySelector(`.hfw-${k}[fill]`)));
  check("iceslip 관절 클래스 유지", parts.every(Boolean), parts.join(","));
  check("iceslip 머리 잉크", await p.evaluate(() => !!document.querySelector(".hfw-body [data-ink]")));
  const clicked = await clickBtn(p, "빙판길 걷기");
  await p.waitForTimeout(500);
  const walking = await p.evaluate(() => getComputedStyle(document.querySelector(".hfw-legF")).animationName);
  check("iceslip 걷기 다리 애니메이션", clicked && walking !== "none", walking);
  await p.waitForTimeout(1900);
  const slipped = await p.evaluate(() => document.querySelector(".hf-iceslip").classList.contains("slipped"));
  check("iceslip 미끄러짐 상태", slipped);
  await p.locator(".qa-card svg").first().screenshot({ path: `${OUT}/iceslip-slipped.png` });
  check("iceslip 오류 없음", p.errs.length === 0, p.errs[0]);
  await p.close();
}

// 2) 멈춘 시계: 머리 기우뚱 그룹 유지
{
  const p = await open("scenes=deadclock");
  const t = await p.evaluate(() => getComputedStyle(document.querySelector(".he-shead")).transform);
  check("deadclock 머리 기우뚱", t !== "none", t);
  check("deadclock 머리 잉크", await p.evaluate(() => !!document.querySelector(".he-shead [data-ink]")));
  await p.close();
}

// 3) 전기 자전거: 출발 후 흔들림
{
  const p = await open("scenes=ebike");
  await clickBtn(p, "출발");
  await p.waitForTimeout(500);
  const a = await p.evaluate(() => getComputedStyle(document.querySelector(".he-bike")).animationName);
  check("ebike 주행 애니메이션", a !== "none", a);
  check("ebike 라이더 잉크", await p.evaluate(() => !!document.querySelector(".he-bike [data-ink]")));
  await p.close();
}

// 4) 약수터: 마시기 → 포즈 교체(팔이 바뀐다)
{
  const p = await open("scenes=springwater");
  await clickBtn(p, "바가지");
  await p.waitForTimeout(1200);
  const drank = await p.evaluate(() => document.querySelector(".hcw")?.classList.contains("drank"));
  check("springwater 마시기 상태", !!drank);
  await p.locator(".qa-card svg").first().screenshot({ path: `${OUT}/springwater-drank.png` });
  await p.close();
}

// 5) 사해: 눌렀다 떠오르기
{
  const p = await open("scenes=deadsea");
  check("deadsea 잉크", await p.evaluate(() => !!document.querySelector(".hc-floatman [data-ink]")));
  await p.close();
}

// 6) 줄다리기: 인원 추가 후 캔버스에 사람이 그려지고 밧줄 끝이 손에 닿는다(오류 없음)
{
  const p = await open("types=tugOfWar");
  await p.evaluate(() => {
    const plus = [...document.querySelectorAll("button")].filter((b) => b.textContent.trim() === "+");
    for (let i = 0; i < 3; i++) plus[0].click();
    for (let i = 0; i < 2; i++) plus[1].click();
  });
  await p.waitForTimeout(1500);
  await p.locator(".qa-card canvas").first().screenshot({ path: `${OUT}/tug-3v2.png` });
  check("tugOfWar 오류 없음", p.errs.length === 0, p.errs[0]);
  await p.close();
}

// 7) 상자 밀기: 꾹 눌러 미는 자세
{
  const p = await open("types=frictionPush");
  const box = await p.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((e) => e.textContent.includes("밀기"));
    const r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await p.locator(".qa-card canvas").first().screenshot({ path: `${OUT}/friction-idle.png` });
  await p.mouse.move(box.x, box.y);
  await p.mouse.down();
  await p.waitForTimeout(1300);
  await p.locator(".qa-card canvas").first().screenshot({ path: `${OUT}/friction-push.png` });
  await p.mouse.up();
  check("frictionPush 오류 없음", p.errs.length === 0, p.errs[0]);
  await p.close();
}

// 8) 렌더 비용: 캔버스 인물 1명당 시간(머리 캐시 포함)
{
  const p = await open("types=tugOfWar");
  const ms = await p.evaluate(async () => {
    const { drawInkStickman, posePull } = await import("/src/ui/stick.ts");
    const cv = document.createElement("canvas");
    cv.width = 800;
    cv.height = 400;
    const ctx = cv.getContext("2d");
    const t0 = performance.now();
    for (let i = 0; i < 400; i++) drawInkStickman(ctx, 100 + (i % 8) * 60, 300, 74, posePull(0.7, i * 16, i), { look: "ponytail", mood: "focus" });
    return (performance.now() - t0) / 400;
  });
  check("캔버스 인물 1명 2ms 미만", ms < 2, `${ms.toFixed(3)}ms`);
  await p.close();
}

await browser.close();
console.log(`\n${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
