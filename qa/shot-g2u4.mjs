import { chromium } from "playwright-core";
const PORT = process.env.PORT || "5173";
const b = await chromium.launch({ channel: "chrome", headless: true });
const page = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
await page.addInitScript(() => {
  const lessons = {};
  for (let i = 1; i <= 6; i++) lessons[`g2u4l${i}`] = { done: true, acc: 95, bestXp: 120 };
  localStorage.setItem("science-app.v1", JSON.stringify({ version:1, onboarded:true, grade:"중2", goalMin:10, streak:2, lastStudyDay:null, totalXp:900, lessons, minigame:{} }));
});
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);
const W = (ms) => page.waitForTimeout(ms);
const shot = async (n) => { await page.screenshot({ path: `qa/shots/g2u4-${n}.png` }); console.log("shot", n); };
const clickBtn = async (re, wait=400) => { await page.evaluate((re) => { const bs=[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&!x.disabled); (bs.find(x=>new RegExp(re).test(x.textContent)))?.click(); }, re); await W(wait); };
const clickCTA = async () => { await page.waitForFunction(()=>{const b=document.querySelector("button.cta");return b&&!b.disabled;},{timeout:16000}); await page.evaluate(()=>document.querySelector("button.cta").click()); await W(560); };
const seg = async (t) => { await page.evaluate((t)=>{[...document.querySelectorAll(".stage-hud .seg button,.stage-seg button")].find(x=>x.textContent.trim()===t)?.click();},t); await W(450); };
const stepPlus = async (re,n)=>{for(let i=0;i<n;i++){await page.evaluate((re)=>{const row=[...document.querySelectorAll(".ck-step")].find(r=>new RegExp(re).test(r.querySelector("b")?.textContent??""));const bs=row.querySelectorAll(".ck-btn");bs[bs.length-1].click();},re);await W(90);}};
const openL = async (idx) => { await page.evaluate(()=>{const t=[...document.querySelectorAll(".unit-tab")].find(x=>x.textContent.includes("물질의 구성"));t?.click();}); await W(650); await page.evaluate((idx)=>document.querySelectorAll(".gm-node")[idx]?.click(),idx); await W(850); };
const exitL = async () => { await page.evaluate(()=>[...document.querySelectorAll(".lheader .xbtn")].at(-1)?.click()); await W(800); };

// 홈
await page.evaluate(()=>{const t=[...document.querySelectorAll(".unit-tab")].find(x=>x.textContent.includes("물질의 구성"));t?.click();}); await W(800);
await shot("home");
// L1 elementLab — 염화나트륨 격자
await page.evaluate(()=>document.querySelectorAll(".gm-node")[0]?.click()); await W(850);
await page.evaluate(()=>{const c=document.querySelector(".hook-cup:not(.zoomed)");c?.click();}); await W(400);
await page.evaluate(()=>{const c=document.querySelector(".hook-cup:not(.zoomed)");c?.click();}); await W(500);
await shot("l1-hook");
await clickCTA();
await seg("염화 나트륨"); await W(600);
await shot("l1-nacl");
await exitL();
// L2 moleculeLab — CO2 완성
await openL(1);
for (let i=0;i<3;i++){ await page.evaluate(()=>{const c=document.querySelector(".hook-cup:not(.cold)");c?.click();}); await W(350); }
await clickCTA();
await clickBtn("탄소 .*넣기|C.*넣기",500); await clickBtn("산소 .*넣기|O.*넣기",500); await clickBtn("산소 .*넣기|O.*넣기",1600);
await shot("l2-co2");
await exitL();
// L3 atomLab — 탄소(6,6,6)
await openL(2);
await clickBtn("더 확대",500); await clickBtn("더 확대",700);
await page.evaluate(()=>document.querySelectorAll(".hook-choices.show .hook-choice")[0]?.click()); await W(300);
await shot("l3-hook");
await clickCTA();
await stepPlus("양성자",6); await stepPlus("중성자",6); await stepPlus("전자",6); await W(700);
await shot("l3-carbon");
await exitL();
// L4 periodicLab
await openL(3);
await clickBtn("정리하기",900);
await clickCTA();
await page.evaluate(()=>{const c=[...document.querySelectorAll(".pt-cell b")].find(b=>b.textContent==="Na");c?.parentElement.click();}); await W(400);
await shot("l4-table");
await exitL();
// L5 ionLab — O2-
await openL(4);
await clickBtn("한 모금",1100);
await page.evaluate(()=>document.querySelectorAll(".hook-choices.show .hook-choice")[0]?.click()); await W(300);
await clickCTA();
// molecule NH3 완성 스냅
await clickBtn("질소 .*넣기|N.*넣기",400); await clickBtn("수소 .*넣기|H.*넣기",400); await clickBtn("수소 .*넣기|H.*넣기",400); await clickBtn("수소 .*넣기|H.*넣기",1500);
await shot("l5-nh3");
await clickBtn("수소 .*넣기|H.*넣기",400); await clickBtn("수소 .*넣기|H.*넣기",400); await clickBtn("산소 .*넣기|O.*넣기",1500);
await clickBtn("쪼개기",1600);
await shot("l5-split");
await clickCTA();
await seg("산소");
await clickBtn("전자 1개 붙이기",400); await clickBtn("전자 1개 붙이기",900);
await shot("l5-ion");
await exitL();
// L6 ionMoveLab
await openL(5);
await clickBtn("가까이 밀기",1000);
await page.evaluate(()=>document.querySelectorAll(".hook-choices.show .hook-choice")[0]?.click()); await W(300);
await clickCTA();
await clickBtn("전류 켜기",3600);
await shot("l6-move");
await exitL();
console.log("done");
await b.close();
