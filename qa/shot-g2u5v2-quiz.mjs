import { chromium } from "playwright-core";
const PORT = process.env.PORT || "5199";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
await p.route("**/@vite/client", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: `const s=new Map();
export function createHotContext(){return {on(){},send(){},accept(){},dispose(){},prune(){},invalidate(){},decline(){}}}
export function updateStyle(i,c){let e=s.get(i);if(!e){e=document.createElement("style");document.head.appendChild(e);s.set(i,e);}e.textContent=c;}
export function removeStyle(i){const e=s.get(i);if(e)e.remove();s.delete(i);}
export const injectQuery=(u)=>u; export default {};` }));
await p.addInitScript(() => localStorage.setItem("science-app.v1", JSON.stringify({
  version: 1, onboarded: true, grade: "g2", viewGrade: "g2", viewSubject: "sci",
  premium: true, reviewMode: true, totalXp: 900, lessons: {}, minigame: {} })));
await p.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await p.waitForTimeout(900);
await p.evaluate(async () => {
  const { nav } = await import("/src/core/router.ts");
  const { createLessonPlayer } = await import("/src/lessons/player.ts");
  const { findLesson } = await import("/src/content/curriculum.ts");
  const f = findLesson("g2u5l2");
  nav.go(createLessonPlayer(f.lesson, { onExit: () => {}, onComplete: () => {} }));
});
await p.waitForTimeout(700);
for (let i = 0; i < 6; i++) {
  await p.evaluate(() => document.querySelector(".screen.active .xbtn.fwd").click());
  await p.waitForTimeout(320);
}
await p.waitForTimeout(500);
await p.screenshot({ path: "qa/shots/g2u5v2-l2-quiz1.png", fullPage: true });
console.log("HEAD:", await p.evaluate(() => document.querySelector(".screen.active .h1")?.textContent?.slice(0, 40)));
await b.close();
