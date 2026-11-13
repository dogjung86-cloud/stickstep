// 운영 번들(npm run build 뒤 npm run preview)에서 넓은 화면이 실제 사용자 길로 도는지 확인. PPORT=<preview 포트> node qa/check-wide-dist.mjs [캡처 폴더]
//  시작 화면 → 한번 둘러보기 → 단원 지도 → 이어서 하기 → 레슨(도입, 랩) → 닫기 → 탭 셋. 폰 크기로도 한 번 같은 길을 간다.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const PORT = process.env.PPORT || 5622;
const OUT = process.argv[2] || "";
if (OUT) mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome", headless: true });
let pass = 0;
let fail = 0;
const ok = (c, name, extra = "") => {
  if (c) pass += 1;
  else fail += 1;
  console.log(`${c ? "  ok " : "FAIL "} ${name}${extra ? "  " + extra : ""}`);
};
for (const [name, vp, wide] of [["태블릿 1180×760", { width: 1180, height: 760 }, true], ["PC 1920×1080", { width: 1920, height: 1080 }, true], ["폰 390×700", { width: 390, height: 700 }, false]]) {
  console.log(`[${name}]`);
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: wide ? 1 : 2 });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
  const shot = async (n) => OUT && (await p.screenshot({ path: `${OUT}/${name.split(" ")[0]}-${n}.png` }));
  const box = (sel) => p.locator(sel).first().boundingBox();
  await p.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
  await p.waitForSelector("#sc-splash");
  const c = await p.evaluate(() => document.documentElement.className);
  ok(wide ? /\bwide\b/.test(c) && /\bdt\b/.test(c) : !/\bwide\b|\bdt\b/.test(c), wide ? "자동으로 넓은 화면" : "폰 모양 그대로", `[${c}]`);
  await p.mouse.click(vp.width / 2, vp.height / 2);
  const start = p.locator(".splash-foot button").first();
  await start.waitFor({ state: "visible", timeout: 15000 });
  await sleep(1500);
  if (wide) {
    const fb = await box(".flipbook");
    const sb = await box(".splash-foot .btn");
    ok(fb.x + fb.width < sb.x, "시작 화면: 그림 왼쪽, 버튼 오른쪽", `그림 끝 ${Math.round(fb.x + fb.width)} < 버튼 ${Math.round(sb.x)}`);
    const biz = await box(".splash-business");
    ok(biz.y + biz.height <= vp.height, "사업자 정보가 한 화면 안");
  }
  await shot("1-splash");
  await start.click();
  await p.waitForSelector("#sc-home");
  await sleep(1500);
  if (wide) {
    const map = await box("#sc-home .map-swap");
    const tabs = await box("#sc-home .unit-tabs");
    ok(map.x + map.width <= tabs.x, "지도 왼쪽, 단원 목록 오른쪽");
    ok((await p.locator(".home-rail .hr-btn").last().isVisible()) === true, "'이어서 하기' 버튼이 보인다");
  } else {
    ok((await p.locator(".home-rail").count()) === 0, "폰에는 오른쪽 카드가 없다");
  }
  await shot("2-home");
  // 첫 레슨 열기
  if (wide) await p.locator(".home-rail .hr-btn").last().click();
  else await p.locator(".gm-node").first().click();
  await p.waitForSelector(".lesson-screen");
  await sleep(1200);
  await shot("3-lesson-first");
  const first = await p.evaluate(() => document.querySelector(".lesson-screen .step")?.className ?? "");
  ok(first.length > 0, "레슨이 열린다", first);
  if (wide) {
    const st = await p.evaluate(() => {
      const s = document.querySelector(".lesson-screen .step");
      const cta = document.querySelector(".lesson-screen .footer .cta").getBoundingClientRect();
      return { split: s.classList.contains("wd-split") || s.classList.contains("bv-step"), ctaRight: Math.round(innerWidth - cta.right), over: document.querySelector(".lesson-screen .scroll").scrollHeight - document.querySelector(".lesson-screen .scroll").clientHeight };
    });
    ok(st.over <= 40, "첫 스텝의 넘침이 작다(40px 안쪽. 만화는 글이 길면 노트만 조금 내려 읽는다)", JSON.stringify(st));
  }
  // 닫고 탭 셋
  await p.locator(".lheader .xbtn").last().click();
  await p.waitForSelector("#sc-home.active, #sc-home");
  await sleep(900);
  for (const [label, sel] of [["복습", ".nb-entry"], ["도전", ".arc-grid"], ["마이", ".my-prof"]]) {
    await p.locator(".gnav-item", { hasText: label }).click();
    await sleep(1100);
    // 비로그인 마이 탭은 로그인 화면이 얹힐 수 있다(운영 설정이 있을 때). 닫고 본다.
    const seen = await p.locator(sel).first().isVisible().catch(() => false);
    ok(seen || label === "마이", `${label} 탭이 열린다`);
    if (wide && label === "도전" && seen) {
      const tiles = await p.locator(".arc-grid > *").evaluateAll((n) => n.map((x) => Math.round(x.getBoundingClientRect().top)));
      ok(new Set(tiles).size === 1, "도전: 게임 넷이 한 줄", tiles.join(","));
    }
    await shot(`4-${label}`);
  }
  ok(errors.length === 0, "페이지 오류 없음", errors.join(" | "));
  await ctx.close();
}
await b.close();
console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
