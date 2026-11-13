// 넓은 화면 자동 전환의 켜짐과 꺼짐 확인. 개발 서버 필요: PORT=<포트> node qa/check-wide-switch.mjs
//  [A] 폰 크기에서는 걸리지 않는다  [B] 랩 도중 기기를 세로로 돌렸다가 다시 가로로(뼈대가 원래대로, 다시 두 묶음으로)
//  [C] 마이 탭 스위치로 끄고 켜기  [D] 경계 크기(1023, 높이 599)
import { chromium } from "playwright-core";
const PORT = process.env.PORT || 5621;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ channel: "chrome", headless: true });
let pass = 0;
let fail = 0;
const ok = (c, name, extra = "") => {
  if (c) pass += 1;
  else fail += 1;
  console.log(`${c ? "  ok " : "FAIL "} ${name}${extra ? "  " + extra : ""}`);
};
async function open(vp, url) {
  const ctx = await b.newContext({ viewport: vp });
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    const s = JSON.parse(localStorage.getItem("science-app.v1") || "{}");
    s.reviewMode = true;
    s.onboarded = true;
    localStorage.setItem("science-app.v1", JSON.stringify(s));
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
  await p.goto(`http://localhost:${PORT}/${url}`, { waitUntil: "networkidle" });
  return { ctx, p, errors };
}
const cls = (p) => p.evaluate(() => document.documentElement.className);
const toLab = async (p) => {
  for (let i = 0; i < 30 && !(await p.locator(".step.bv-step").count()); i++) {
    await p.locator(".xbtn.fwd").click();
    await sleep(300);
  }
  await sleep(700);
};
const shape = (p) =>
  p.evaluate(() => {
    const st = document.querySelector(".step.bv-step");
    return {
      kids: [...st.children].map((c) => c.className.split(" ")[0]).join(","),
      slot: [...st.querySelector(".bv-slot").children].map((c) => c.className.split(" ")[0]).join(","),
      stageW: Math.round(st.querySelector(".bv-stage").getBoundingClientRect().width),
    };
  });

console.log("[A] 폰");
{
  const { ctx, p, errors } = await open({ width: 390, height: 700 }, "?open=u2l2");
  await p.waitForSelector(".lesson-screen");
  await toLab(p);
  const c = await cls(p);
  ok(!/\bwide\b|\bdt\b/.test(c), "폰 세로에서는 클래스가 붙지 않는다", `[${c}]`);
  const s = await shape(p);
  ok(s.kids === "bv-head,bv-helper,bv-stage,bv-slot", "랩 뼈대가 원래 차례", s.kids);
  await p.setViewportSize({ width: 844, height: 390 });
  await sleep(400);
  ok(!/\bwide\b/.test(await cls(p)), "폰 가로(844×390)에서도 붙지 않는다");
  await p.setViewportSize({ width: 932, height: 430 });
  await sleep(300);
  ok(!/\bwide\b/.test(await cls(p)), "큰 폰 가로(932×430)에서도 붙지 않는다");
  ok(errors.length === 0, "페이지 오류 없음", errors.join(" | "));
  await ctx.close();
}

console.log("[B] 랩 도중 회전");
{
  const { ctx, p, errors } = await open({ width: 1180, height: 760 }, "?open=u2l2");
  await p.waitForSelector(".lesson-screen");
  await toLab(p);
  ok(/\bwide\b/.test(await cls(p)) && /\bdt\b/.test(await cls(p)), "태블릿 가로에서 자동으로 켜진다");
  let s = await shape(p);
  ok(s.kids.startsWith("wd-main,wd-note"), "랩이 두 묶음으로 묶인다", s.kids);
  ok(s.stageW > 550, "무대가 커진다", `${s.stageW}px`);
  await p.locator(".bv-card").first().click();
  await sleep(1500);
  const done1 = await p.locator(".bv-card.done").count();
  ok(done1 === 1, "넓은 화면에서 카드 조작이 먹는다");
  await p.setViewportSize({ width: 760, height: 1180 }); // 세로로 돌림
  await sleep(500);
  ok(!/\bwide\b|\bdt\b/.test(await cls(p)), "세로로 돌리면 꺼진다");
  s = await shape(p);
  ok(s.kids === "bv-head,bv-helper,bv-stage,bv-slot", "뼈대가 원래 차례로 돌아온다", s.kids);
  ok(s.slot === "bv-ctl,bv-q,bv-done", "조작 칸 안도 원래 차례", s.slot);
  await p.locator(".bv-card").nth(1).click();
  await sleep(3200);
  ok((await p.locator(".bv-card.done").count()) === 2, "되돌린 뒤에도 랩이 이어진다(진행이 남아 있다)");
  await p.setViewportSize({ width: 1180, height: 760 }); // 다시 가로
  await sleep(500);
  s = await shape(p);
  ok(/\bwide\b/.test(await cls(p)) && s.kids.startsWith("wd-main,wd-note"), "다시 가로로 돌리면 두 묶음으로", s.kids);
  await p.locator(".bv-card").nth(2).click();
  await sleep(3400);
  await p.locator(".bv-btn.main").click();
  await p.waitForSelector(".wd-note .bv-choice", { timeout: 15000 });
  ok(true, "질문이 노트에 뜬다");
  await p.locator('.bv-choice[data-ok="1"]').first().click();
  await sleep(600);
  await p.locator(".bv-next").click();
  await sleep(1200);
  ok((await p.locator(".wd-log-i").count()) === 1, "답한 것이 기록에 한 줄 남는다");
  ok(errors.length === 0, "페이지 오류 없음", errors.join(" | "));
  await ctx.close();
}

console.log("[C] 마이 탭 스위치");
{
  const { ctx, p, errors } = await open({ width: 1180, height: 760 }, "#/my");
  await p.waitForSelector(".desktop-pref-row");
  await sleep(600);
  const row = p.locator(".desktop-pref-row");
  ok((await row.locator(".my-row-v").textContent()) === "켜짐", "처음 값은 켜짐");
  await row.click();
  await sleep(400);
  ok(!/\bwide\b|\bdt\b/.test(await cls(p)), "누르면 폰 모양으로");
  ok((await row.locator(".my-row-v").textContent()) === "꺼짐", "값이 꺼짐으로");
  await p.reload({ waitUntil: "networkidle" });
  await sleep(600);
  ok(!/\bwide\b/.test(await cls(p)), "새로 열어도 꺼진 채 유지");
  await p.locator(".desktop-pref-row").click();
  await sleep(400);
  ok(/\bwide\b/.test(await cls(p)), "다시 누르면 넓은 화면으로");
  ok(errors.length === 0, "페이지 오류 없음", errors.join(" | "));
  await ctx.close();
}

console.log("[D] 경계");
{
  const { ctx, p } = await open({ width: 1023, height: 760 }, "#/home");
  await sleep(600);
  ok(!/\bwide\b/.test(await cls(p)), "폭 1023에서는 꺼짐");
  await p.setViewportSize({ width: 1024, height: 600 });
  await sleep(300);
  ok(/\bwide\b/.test(await cls(p)), "1024×600에서는 켜짐");
  await p.setViewportSize({ width: 1024, height: 599 });
  await sleep(300);
  ok(!/\bwide\b/.test(await cls(p)), "높이 599에서는 꺼짐");
  await p.setViewportSize({ width: 830, height: 690 });
  await sleep(300);
  ok(!/\bwide\b/.test(await cls(p)), "펼친 폴드 가로(830×690)에서는 꺼짐");
  await ctx.close();
}
await b.close();
console.log(`\n${pass} 통과, ${fail} 실패`);
process.exit(fail ? 1 : 0);
