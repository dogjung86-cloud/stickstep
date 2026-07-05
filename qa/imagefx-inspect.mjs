// ImageFX/Flow UI를 매핑한다: 프롬프트 입력·생성 버튼·로그인/구독 벽 여부.
import { chromium } from "playwright-core";
const port = process.argv[2] || "9224";
const url = process.argv[3] || "https://labs.google/fx/tools/image-fx";
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
try {
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const textareas = [...document.querySelectorAll('textarea,[contenteditable="true"],input[type="text"]')]
      .filter(vis).map((e) => ({ tag: e.tagName, ph: e.getAttribute("placeholder") || e.getAttribute("aria-label") || "", }));
    const buttons = [...document.querySelectorAll('button,[role="button"],a')].filter(vis)
      .map((e) => (e.innerText || e.getAttribute("aria-label") || "").trim()).filter((t) => t && t.length < 40).slice(0, 40);
    const body = document.body.innerText;
    return {
      url: location.href, title: document.title,
      textareas,
      buttonSample: [...new Set(buttons)].slice(0, 30),
      paywall: /subscribe|subscription|upgrade|구독|업그레이드|Google AI Pro|Ultra/i.test(body),
      signin: /sign in|log in|로그인|continue with google/i.test(body),
      imgs: document.querySelectorAll("img").length,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await page.close();
} catch (e) { console.log("ERROR:", e.message); }
finally { await browser.close().catch(() => {}); }
