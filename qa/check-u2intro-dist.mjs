// 중1 Ⅱ 도입 샘플 "운영 번들" 검사: 빌드한 번들에서 토글과 세 샘플이 개발 서버와 똑같이 도는지 본다.
//   ① 아무 표식 없이 열면 세 레슨의 도입이 지금 판(hook) 그대로이고 세션에 남는 것이 없다
//   ② ?u2intro=now:<레슨> 은 지금 판을, ?u2intro=<레슨> 은 샘플을 연다. ?u2intro=0 으로 끈다
//   ③ 세 샘플이 끝까지 돌고(한 화면, 그림이 선다) 아래 버튼으로 정본의 다음 스텝이 열린다
//   npm run build 뒤 미리보기 서버(u2-intro-dist-4557)를 띄우고:  PPORT=4557 node qa/check-u2intro-dist.mjs
import * as L0 from "./u2intro-lib.mjs";

process.env.BASE = process.env.BASE || `http://localhost:${process.env.PPORT || "4557"}`;
// BASE는 헬퍼가 들여올 때 읽으므로, 값을 정한 뒤에 새로 들여온다
const L = await import(`./u2intro-lib.mjs?base=${encodeURIComponent(process.env.BASE)}`);
void L0;

let PASS = 0;
let FAIL = 0;
const ok = (cond, label) => {
  if (cond) PASS++;
  else FAIL++;
  console.log(cond ? "  ✓" : "  ✗", label);
};
const { browser, page, errors } = await L.launch({ query: null });
console.log(`운영 번들 검사: ${L.BASE}`);

// ① 꺼져 있을 때
for (const id of ["u2l2", "u2l4", "u2l9"]) {
  await L.openSample(page, id, { now: true });
  ok((await L.stepType(page)) === "hook", `${id} 지금 판으로 열면 도입이 hook 그대로`);
}
ok((await page.evaluate(() => sessionStorage.getItem("ss.u2intro"))) === null, "지금 판으로 열기는 세션에 토글을 남기지 않는다");
ok((await page.evaluate(() => document.querySelectorAll("[data-ok], [data-oi]").length)) === 0, "운영 화면에 정답 표식이 없다");

// ②③ 샘플
const PLAY = { longcell: L.playLongCell, baskets: L.playBaskets, factory: L.playFactory };
for (const S of L.SAMPLES) {
  await L.openSample(page, S.id);
  ok((await L.stepType(page)) === "opener", `${S.id} ?u2intro=${S.id} 로 열면 샘플 도입이 선다`);
  const art = await page.evaluate(() => {
    const st = document.querySelector(".screen.active .opn-stage");
    return { paths: st.querySelectorAll("svg path").length, w: Math.round(st.getBoundingClientRect().width) };
  });
  ok(art.paths > 40, `${S.id} 손그림이 선다(선 ${art.paths}개)`);
  let fit = true;
  await PLAY[S.scene](page, {
    on: async () => {
      const m = await L.measure(page);
      if (m.stepH > m.view || m.clipped.length) fit = false;
    },
  });
  ok(fit, `${S.id} 모든 시점이 한 화면이고 잘린 글이 없다`);
  const st = await L.ctaState(page);
  ok(st.enabled && st.text === S.cta, `${S.id} 끝나면 아래 버튼 열림("${st.text}")`);
  await L.cta(page);
  ok((await L.stepType(page)) !== "opener", `${S.id} 아래 버튼으로 다음 스텝이 열린다`);
}
ok((await page.evaluate(() => sessionStorage.getItem("ss.u2intro"))) === "1", "샘플을 열면 세션에 토글이 남는다");
await page.goto(`${L.BASE}/?u2intro=0`, { waitUntil: "domcontentloaded" });
await L.W(page, 900);
ok((await page.evaluate(() => sessionStorage.getItem("ss.u2intro"))) === null, "?u2intro=0 으로 끄면 세션 표식이 지워진다");
ok(errors.length === 0, `페이지 오류 없음 ${JSON.stringify(errors)}`);

// ④ 운영 번들에서는 주소로 프리미엄 잠금을 건너뛰지 못한다(프리미엄도 검토 모드도 아닌 사용자)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 700 } });
  const p2 = await ctx.newPage();
  await p2.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: false, reviewMode: false, goalMin: 10, streak: 1, totalXp: 0, lessons: {}, minigame: {},
    }));
  });
  const opened = async (id) => {
    await p2.goto(`${L.BASE}/?u2intro=${id}`, { waitUntil: "domcontentloaded" });
    await p2.waitForTimeout(1800);
    return p2.evaluate(() => !!document.querySelector(".screen.active .step"));
  };
  ok((await opened("u2l4")) === false, "프리미엄이 아닌 사용자는 ?u2intro=u2l4 로 잠긴 레슨이 열리지 않는다");
  ok((await opened("u2l2")) === true, "무료 레슨(u2l2)은 ?u2intro=u2l2 로 열린다");
  await ctx.close();
}
await browser.close();
console.log(`\n운영 번들 검사: ${PASS}/${PASS + FAIL} 통과`);
if (FAIL) process.exit(1);
