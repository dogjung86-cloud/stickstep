// CDP로 붙어 ImageFX 로그인 상태를 확인한다.
// 사용: node qa/imagefx-check.mjs <cdpPort>
import { chromium } from "playwright-core";

const port = process.argv[2] || "9224";
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
try {
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto("https://labs.google/fx/tools/image-fx", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const txt = document.body.innerText.slice(0, 400);
    const hasPromptBox = !!document.querySelector('textarea, [contenteditable="true"], input[type="text"]');
    const signInHit = /sign in|로그인|log in|계속하기|continue with google/i.test(document.body.innerText);
    // Google account chip
    const acct = [...document.querySelectorAll("a,button,img")].map((e) => e.getAttribute?.("aria-label") || e.alt || "").filter((s) => /account|계정|@/.test(s)).slice(0, 3);
    return { url: location.href, title: document.title, hasPromptBox, signInHit, acct, snippet: txt.replace(/\s+/g, " ") };
  });
  console.log(JSON.stringify(info, null, 2));
} catch (e) {
  console.log("ERROR:", e.message);
} finally {
  await browser.close().catch(() => {});
}
