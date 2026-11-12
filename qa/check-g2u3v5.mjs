// 중2 Ⅲ v5 단원 검사(390×700, 한 번에 끝까지).
//   PORT=5583 node qa/check-g2u3v5.mjs            개발 서버로
//   DIST=<개발 모드 번들 폴더> node qa/check-g2u3v5.mjs   서버 없이
//   ONLY=g2u3l1,g2u3l4  레슨 골라 돌리기 · OUT=<폴더>  시점마다 캡처 저장
// 레슨마다 도입과 랩을 처음부터 끝까지 한 길로(정답 쪽) 가고, 랩의 첫 채점 판정에서 한 번 틀려 본다.
// 시점마다 스크롤 높이가 보이는 높이(554) 안인지, 잘린 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
// 그 길에서 모은 화면 글에 대시, '교과서', 이모지가 없는지도 본다. 문제(선택형, OX, 복수 선택)는 정답을 눌러 정답으로 채점되는지만 본다.
// 끝에 토글을 끈 채 첫 레슨이 지금 판(옛 훅)으로 열리는지 한 번 본다.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./g2u3v5-lib.mjs";
import { LABS, OPENERS } from "./g2u3v5-play.mjs";

const OUT = process.env.OUT || "";
if (OUT) mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
const LESSONS = ["g2u3l1", "g2u3l2", "g2u3l3", "g2u3l4", "g2u3l5", "g2u3l6", "g2u3l7", "g2u3l8"].filter((id) => !ONLY.length || ONLY.includes(id));

let pass = 0;
const fails = [];
const check = (name, cond, detail = "") => {
  if (cond) pass++;
  else {
    fails.push(`${name}${detail ? " :: " + detail : ""}`);
    console.log("  ✗", name, detail);
  }
};
const BAD = [/[—–]/, /교과서/, /\p{Extended_Pictographic}/u, /\s-\s/];

const { browser, page, errors } = await L.launch();
const seen = [];

for (const id of LESSONS) {
  console.log("▶", id);
  await L.openLesson(page, id);
  let n = 0;
  let quizzes = 0;
  const ctx = {
    page,
    L,
    check: (name, cond, detail) => check(`${id} ${name}`, cond, detail),
    async fit(tag) {
      const f = await L.fit(page);
      check(`${id} [${tag}] 한 화면`, f.content <= f.view + 1, `${f.content}/${f.view}`);
      check(`${id} [${tag}] 잘린 글자 없음`, f.cut.length === 0, f.cut.join(" | "));
      check(`${id} [${tag}] 도움말 두 줄 안`, !f.helperOver);
      check(`${id} [${tag}] 누르는 곳 44px 이상`, f.taps.length === 0, JSON.stringify(f.taps));
      seen.push({ where: `${id} ${tag}`, text: await L.texts(page) });
    },
    async shot(tag) {
      if (OUT) await page.screenshot({ path: join(OUT, `${id}-${String(++n).padStart(2, "0")}-${tag}.png`) });
    },
    /** 판정: 한 번 틀려 보거나(wrong) 맞히고 '다음'. */
    async judge(tag, wrong) {
      check(`${id} [${tag}] 판정이 뜸`, await L.waitAsk(page));
      await L.W(page, 350);
      await ctx.fit(`${tag} 판정`);
      await L.answer(page, !wrong);
      await L.W(page, 450);
      const v = await L.verdict(page);
      check(`${id} [${tag}] 판정 표시`, wrong ? v.cls === "miss" && v.word === "오답이에요" && v.ans.length > 0 : v.cls === "ok" && v.word === "정답이에요", JSON.stringify(v));
      await ctx.fit(`${tag} ${wrong ? "오답" : "정답"}`);
      await ctx.shot(`${tag}-${wrong ? "miss" : "ok"}`);
      await L.W(page, 1200);
      check(`${id} [${tag}] 기다려도 넘어가지 않음`, (await L.verdict(page)).cls !== "");
      await L.tapNext(page);
    },
    /** 랩의 끝: 결론과 열린 끝 버튼. */
    async done(tag) {
      check(`${id} [${tag}] 결론이 뜸`, await L.waitDone(page));
      await L.W(page, 450);
      await ctx.fit(`${tag} 결론`);
      await ctx.shot(`${tag}-done`);
      check(`${id} [${tag}] 끝 버튼 열림`, (await L.ctaState(page)).enabled);
    },
  };
  let firstJudge = true;
  for (let guard = 0; guard < 40; guard++) {
    const s = await L.readStep(page);
    if (s.kind === "home" || !s.kind) break;
    if (s.kind === "opener") {
      const play = OPENERS[s.scene];
      check(`${id} 도입 장면 등록(${s.scene})`, !!play);
      await ctx.fit("도입 처음");
      if (play) {
        check(`${id} 도입 예측이 뜸`, await L.waitPhase(page, "ask"));
        await L.W(page, 300);
        await ctx.fit("도입 예측");
        await ctx.shot("opener-ask");
        await L.choose(page, 1);
        check(`${id} 도입 조작 국면`, await L.waitPhase(page, "play"));
        await L.W(page, 300);
        await ctx.fit("도입 조작");
        await play(ctx);
        check(`${id} 도입 끝`, await L.waitPhase(page, "done", 150));
        await L.W(page, 500);
        await ctx.fit("도입 끝");
        await ctx.shot("opener-done");
        check(`${id} 도입 끝 버튼 열림`, (await L.ctaState(page)).enabled);
      }
      await L.cta(page);
    } else if (s.kind === "lab") {
      const play = LABS[s.lab];
      check(`${id} 랩 조작 등록(${s.lab})`, !!play, s.title);
      await ctx.fit(`${s.lab} 처음`);
      await ctx.shot(`${s.lab}-start`);
      if (play) {
        await play(ctx, firstJudge);
        firstJudge = false;
        await L.cta(page);
      } else await L.fwd(page);
    } else if (s.kind === "quiz") {
      quizzes++;
      const r = await L.answerQuiz(page);
      check(`${id} 문제 ${quizzes} 정답 채점`, r === "ok", `${r} :: ${s.title}`);
      seen.push({ where: `${id} 문제 ${quizzes}`, text: await L.texts(page) });
      if (r !== "ok") await L.fwd(page);
    } else {
      seen.push({ where: `${id} ${s.title}`, text: await L.texts(page) });
      if (/정리|이름|용어/.test(s.title) || true) await ctx.shot("read");
      await L.fwd(page);
    }
    const after = await L.readStep(page);
    if (after.kind === s.kind && after.title === s.title && after.lab === s.lab) {
      check(`${id} 다음 스텝으로 넘어감`, false, s.title);
      await L.fwd(page);
    }
  }
  check(`${id} 문제가 넷 이상`, quizzes >= 3, String(quizzes));
}

// 화면 글 검사
for (const { where, text } of seen) for (const re of BAD) check(`글 규칙 ${re} (${where})`, !re.test(text), (text.match(re) || [""])[0] + " … " + text.slice(Math.max(0, text.search(re) - 20), text.search(re) + 20).replace(/\n/g, " "));

// 토글을 끈 화면
if (!ONLY.length) {
  await L.openLesson(page, "g2u3l1", false);
  const off = await page.evaluate(() => {
    const s = document.querySelector(".screen.active .step");
    return { opener: s.classList.contains("opn-step"), hook: !!s.querySelector(".hook-scene") };
  });
  check("토글을 끄면 지금 판(옛 훅)", !off.opener && off.hook, JSON.stringify(off));
}

check("페이지 오류 없음", errors.length === 0, errors.slice(0, 5).join(" | "));
await L.shutdown(browser);
console.log(`\n${fails.length ? "FAIL" : "ALL PASS"}  통과 ${pass}  실패 ${fails.length}`);
if (fails.length) {
  fails.forEach((f) => console.log("  -", f));
  process.exit(1);
}
