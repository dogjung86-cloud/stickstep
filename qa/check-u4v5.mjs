// 중1 Ⅳ v5(랩과 도입)의 간소 검사: 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가 본다.
//   시점마다(처음, 조작 중, 판정, 오답, 결론) 스크롤 높이가 한 화면(554px) 안인지, 화면이 밀리지 않았는지,
//   누르는 곳이 48px 이상인지, 잘린 글과 작은 글자가 없는지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
//   랩의 첫 판정에서는 한 번 틀려 본다(틀림 표시, 정답 카드, '다음'). 그 길에서 모은 화면 글에 대시, '교과서', 이모지, '분자'가 없는지도 본다.
//   끝으로 토글을 끈 채 첫 레슨이 지금 화면(훅)으로 열리는지 본다.
// 실행: DIST=<개발 모드 번들 폴더> node qa/check-u4v5.mjs [캡처 폴더]   (번들 만드는 법은 qa/u4v5-lib.mjs 머리말)
//       PORT=5574 node qa/check-u4v5.mjs                                  (개발 서버가 떠 있을 때)
//       ONLY=u4l2 를 붙이면 그 레슨만 돈다.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import * as L from "./u4v5-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/u4v5";
mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || "";
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const { browser, page, errors } = await L.launch();
const W = (ms) => L.W(page, ms);
let texts = [];
let quizzes = 0;

async function at(id, mark, shot = true) {
  const m = await L.measure(page);
  // 궁금증 카드는 랩을 마친 뒤 맨 아래에 붙는다(Ⅱ단원과 같은 약속). 그 높이는 한 화면 예산에서 뺀다.
  ok(m.content - m.curio <= m.view && m.scrollTop === 0, `${id} ${mark}: 스크롤 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.taps.every((t) => t.h >= 47.5), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 47.5).map((t) => t.t + ":" + t.h).join(", ")}`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.small.length === 0, `${id} ${mark}: 작은 글자 ${m.small.map((s) => s.t + ":" + s.px).join(", ")}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음`);
  texts.push(m.text);
  if (shot) await page.screenshot({ path: join(OUT, `${id}-${mark}.png`) });
  console.log(`  ${id} ${mark}: ${m.content}/${m.view}`);
}

/** 판정에서 한 번 틀려 보고(틀림 표시와 정답 카드를 확인) '다음'으로 넘어간다. */
async function wrongOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(350);
  await at(id, mark + "-ask");
  const t = await L.pickWrong(page);
  ok(!!t, `${id} ${mark}: 틀린 보기를 찾지 못함(정답 표식이 없는 번들인가)`);
  await W(450);
  const v = await L.verdict(page);
  ok(v && v.cls === "miss" && v.word === "오답이에요" && v.ans && v.next, `${id} ${mark}: 오답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-wrong");
  await W(1300);
  ok((await L.verdict(page))?.cls === "miss", `${id} ${mark}: '다음'을 누르기 전에 넘어감`);
  await L.tapNext(page);
  await W(500);
}
async function rightOnce(id, mark) {
  ok(await L.waitAsk(page), `${id} ${mark}: 판정이 뜨지 않음`);
  await W(300);
  await L.pickRightOnly(page);
  await W(400);
  const v = await L.verdict(page);
  ok(v && v.cls === "ok" && v.word === "정답이에요" && v.next, `${id} ${mark}: 정답 표시가 다름 ${JSON.stringify(v)}`);
  await at(id, mark + "-right", false);
  await L.tapNext(page);
  await W(500);
}
async function endLab(id, mark, wantCta) {
  ok(await L.waitDone(page), `${id} ${mark}: 결론이 뜨지 않음`);
  await W(500);
  await at(id, mark + "-done");
  const c = await L.ctaState(page);
  ok(c.enabled && (!wantCta || c.text === wantCta), `${id} ${mark}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  const before = (await L.stepKind(page)) + " " + (await L.readStep(page)).title;
  await L.cta(page);
  await W(500);
  const after = (await L.stepKind(page)) + " " + (await L.readStep(page)).title;
  ok(after !== before && after.trim() !== "", `${id} ${mark}: 다음 스텝이 열리지 않음(${before} → ${after})`);
}
async function endOpener(id, wantCta) {
  ok(await L.waitPhase(page, "done"), `${id} 도입: 끝에 닿지 못함(${await L.ds(page, "opnPhase")})`);
  await W(1300);
  await at(id, "intro-done");
  const c = await L.ctaState(page);
  ok(c.enabled && c.text === wantCta, `${id} 도입: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await L.cta(page);
  await W(500);
  ok((await L.stepKind(page)).startsWith("u4lab"), `${id} 도입: 다음이 새 랩이 아님(${await L.stepKind(page)})`);
}
/** 랩 뒤의 개념, 정리, 문제를 끝까지 간다. 개념과 정리는 한 화면에 다 들어오지 않아도 된다(읽는 화면). 문제는 정답을 눌러 정답으로 채점되는지 본다. */
async function tail(id) {
  for (let guard = 0; guard < 30; guard++) {
    await W(500);
    const k = await L.readStep(page);
    if (!k.kind || k.kind === "home") break;
    texts.push(k.text);
    if (k.kind === "quiz") {
      const r = await L.answerQuiz(page);
      ok(r === "ok", `${id} 문제 "${k.title.slice(0, 20)}": ${r}`);
      quizzes += 1;
    } else if (k.kind === "read") {
      // 개념, 정리, 끌어 놓는 활동: 캡처만 하고 끝 버튼(잠겨 있으면 검토 모드의 앞으로 가기)으로 지나간다
      await page.screenshot({ path: join(OUT, `${id}-tail${guard}.png`) });
      const c = await L.ctaState(page);
      if (c.enabled) await L.cta(page);
      else await L.click(page, ".xbtn.fwd");
    } else {
      ok(false, `${id}: 랩 뒤에 랩이 또 나옴(${k.title})`);
      break;
    }
  }
}
async function predict(id, mark, word) {
  ok(await L.waitAsk(page), `${id} ${mark}: 예측이 뜨지 않음`);
  await W(300);
  await at(id, mark + "-start");
  ok(!!(await L.pickText(page, word)), `${id} ${mark}: 예측 보기 "${word}"가 없음`);
  await W(900);
}

const PLAYS = {
  u4l1: async (id) => {
    ok((await L.stepKind(page)) === "opener:u4-lid", `${id}: 새 도입이 아님(${await L.stepKind(page)})`);
    await at(id, "intro-ask");
    await L.choose(page, "동시에");
    await W(500);
    await at(id, "intro-picked");
    await L.hold(page, ".opn-u4-btn", 1500);
    await W(200);
    await at(id, "intro-mid");
    await L.hold(page, ".opn-u4-btn", 2000);
    await endOpener(id, "실험실 열기");
    // 확산 랩
    await predict(id, "ink", "바닥에만");
    await L.click(page, ".u4x-ink-add");
    // 먼저 일부러 저어 본다(금방 섞이지만 새 물로 다시 해야 한다)
    ok(await L.waitVisible(page, '.u4x-ink-way[data-k="stir"]'), `${id} ink: 젓기와 가만히 두기 선택이 뜨지 않음`);
    await at(id, "ink-choose");
    await L.click(page, '.u4x-ink-way[data-k="stir"]');
    ok(await L.waitVisible(page, ".u4x-ink-redo"), `${id} ink: 저은 뒤 다시 하기 버튼이 뜨지 않음`);
    await at(id, "ink-stirred");
    await L.click(page, ".u4x-ink-redo");
    await W(200);
    await L.click(page, ".u4x-ink-add");
    ok(await L.waitVisible(page, '.u4x-ink-way[data-k="wait"]'), `${id} ink: 두 번째 선택이 뜨지 않음`);
    await L.click(page, '.u4x-ink-way[data-k="wait"]');
    ok(await L.waitVisible(page, ".u4x-ink-ta"), `${id} ink: 시간 막대가 뜨지 않음`);
    await L.sweep(page, ".u4x-ink-ta", 0, 55, 6);
    await at(id, "ink-mid");
    await L.setRange(page, ".u4x-ink-ta", 20); // 되돌려 본다(되돌아가지 않아야 한다)
    ok(Number(await L.ds(page, "u4Ink")) >= 0.5, `${id} ink: 시간 막대가 되돌아감`);
    await L.sweep(page, ".u4x-ink-ta", 55, 100, 5);
    ok(await L.waitVisible(page, ".u4x-ink-next"), `${id} ink: 다음 실험 버튼이 뜨지 않음`);
    await at(id, "ink-a-end");
    await L.click(page, ".u4x-ink-next");
    await W(300);
    await L.click(page, ".u4x-ink-vinbtn");
    ok(await L.waitVisible(page, ".u4x-ink-tb"), `${id} ink: 두 번째 시간 막대가 뜨지 않음`);
    await L.sweep(page, ".u4x-ink-tb", 0, 50, 5);
    await at(id, "ink-dish-mid");
    await L.sweep(page, ".u4x-ink-tb", 50, 100, 5);
    await wrongOnce(id, "ink");
    await endLab(id, "ink", "다음 실험, 증발");
    // 증발 랩
    await predict(id, "evap", "그대로");
    await L.click(page, '.u4x-evap-card[data-k="lump"]');
    await W(300);
    await at(id, "evap-ready");
    await L.hold(page, ".u4x-hold", 1500);
    await at(id, "evap-mid");
    await L.hold(page, ".u4x-hold", 2200);
    ok(await L.waitVisible(page, '.u4x-evap-card[data-k="spread"]'), `${id} evap: 두 번째 고르기가 뜨지 않음`);
    await at(id, "evap-second");
    await L.click(page, '.u4x-evap-card[data-k="spread"]');
    await W(300);
    await L.hold(page, ".u4x-hold", 3600);
    await wrongOnce(id, "evap");
    await endLab(id, "evap", "이름 붙이기");
    await tail(id);
  },
  u4l2: async (id) => {
    ok((await L.stepKind(page)) === "opener:u4-spill", `${id}: 새 도입이 아님(${await L.stepKind(page)})`);
    await at(id, "intro-ask");
    await L.choose(page, "둘 다 주울");
    await W(500);
    await at(id, "intro-picked");
    for (let i = 0; i < 3; i++) {
      await page.evaluate((k) => [...document.querySelectorAll(".screen.active .opn-u4-hit.ice")][k]?.click(), i);
      await W(350);
    }
    ok(await L.waitPhase(page, "juice", 30), `${id} 도입: 얼음 셋을 담아도 주스 차례가 오지 않음`);
    await W(500);
    await at(id, "intro-mid");
    await L.click(page, ".opn-u4-hit.juice");
    await endOpener(id, "실험실 열기");
    // 옮겨 담기 랩: 두 그릇에 담아 보고 기록한다. 물에서 한 번 틀리게 기록해 본다
    await W(700);
    await at(id, "move-start");
    const record = async (shape, vol) => {
      await L.click(page, ".u4x-move-rec");
      await W(250);
      await L.click(page, `.u4x-seg[data-k="shape"] .u4x-seg-b[data-v="${shape}"]`);
      await L.click(page, `.u4x-seg[data-k="vol"] .u4x-seg-b[data-v="${vol}"]`);
    };
    await L.click(page, ".u4x-move-swap");
    await W(1200);
    await at(id, "move-ice-dish");
    await record("same", "same");
    await at(id, "move-form");
    await L.click(page, ".u4x-move-ok");
    await W(400);
    await L.click(page, '.u4x-move-card[data-k="liq"]');
    await W(1300);
    await at(id, "move-water-dish");
    await L.click(page, ".u4x-move-swap");
    await W(1300);
    await at(id, "move-water-cup");
    await record("diff", "diff"); // 일부러 부피를 틀리게 적는다
    await L.click(page, ".u4x-move-ok");
    await W(400);
    await at(id, "move-slip");
    await record("diff", "same");
    await L.click(page, ".u4x-move-ok");
    await W(400);
    await L.click(page, '.u4x-move-card[data-k="gas"]');
    await W(1500);
    await at(id, "move-gas-cup");
    await L.click(page, ".u4x-move-swap");
    await W(1200);
    await at(id, "move-gas-dish");
    await record("diff", "diff");
    await L.click(page, ".u4x-move-ok");
    await endLab(id, "move", "다음, 입자 모형 만들기");
    // 입자 모형 만들기 랩: 먼저 일부러 고체인 채로 낸다
    await W(900);
    await at(id, "build-start");
    await L.click(page, ".u4x-build-fix");
    await W(400);
    ok((await L.ds(page, "u4Build")) === "0", `${id} build: 다른 상태의 모형인데 넘어감`);
    await at(id, "build-slip");
    await L.sweep(page, ".u4x-build-range", 0, 45, 6, 80);
    await W(1500);
    await at(id, "build-liq");
    await L.click(page, ".u4x-build-fix");
    await W(900);
    await at(id, "build-liq-ok");
    ok(await L.waitVisible(page, ".u4x-build-fix"), `${id} build: 다음 주문으로 넘어가지 않음`);
    await L.sweep(page, ".u4x-build-range", 45, 100, 6, 80);
    await W(1500);
    await at(id, "build-gas");
    await L.click(page, ".u4x-build-fix");
    ok(await L.waitVisible(page, ".u4x-build-fix"), `${id} build: 세 번째 주문으로 넘어가지 않음`);
    await L.sweep(page, ".u4x-build-range", 100, 0, 8, 80);
    await W(2500);
    await at(id, "build-sol");
    await L.click(page, ".u4x-build-fix");
    await endLab(id, "build", "이름 붙이기");
    await tail(id);
  },
  u4l3: async (id) => {
    ok((await L.stepKind(page)) === "comic", `${id}: 만화로 시작하지 않음(${await L.stepKind(page)})`);
    for (let i = 0; i < 12 && (await L.stepKind(page)) === "comic"; i++) await L.cta(page);
    ok((await L.stepKind(page)) === "u4lab:u4x-watch", `${id}: 만화 다음이 얼음 접시 랩이 아님(${await L.stepKind(page)})`);
    // 얼음 접시 랩: 먼저 일부러 찬물을 담아 본다
    await W(500);
    await at(id, "watch-start");
    await L.click(page, '.u4x-watch-water[data-k="cold"]');
    await W(300);
    await L.click(page, ".u4x-watch-put");
    ok(await L.waitVisible(page, ".u4x-watch-redo"), `${id} watch: 찬물인데 다시 하기가 뜨지 않음`);
    await at(id, "watch-cold");
    await L.click(page, ".u4x-watch-redo");
    await W(300);
    await L.click(page, ".u4x-watch-put");
    ok(await L.waitVisible(page, '.u4x-watch-spot[data-k="top"]'), `${id} watch: 살필 곳이 뜨지 않음`);
    await at(id, "watch-look");
    for (const k of ["top", "water", "under"]) {
      await L.click(page, `.u4x-watch-spot[data-k="${k}"]`);
      await W(400);
    }
    await at(id, "watch-seen");
    await wrongOnce(id, "watch");
    ok(await L.waitVisible(page, ".u4x-watch-paper.sa"), `${id} watch: 종이 버튼이 뜨지 않음`);
    await at(id, "watch-paper");
    await L.click(page, ".u4x-watch-paper.sa");
    await W(1500);
    await L.click(page, ".u4x-watch-paper.sb");
    await W(900);
    await at(id, "watch-red");
    await endLab(id, "watch", "다음 실험, 두 컵");
    // 두 컵(얼음과 드라이아이스) 랩
    await W(500);
    await at(id, "dry-first");
    await L.click(page, ".u4x-dry-cover");
    await predict(id, "dry", "두 컵 모두");
    await L.hold(page, ".u4x-hold", 1500);
    await at(id, "dry-mid");
    await L.hold(page, ".u4x-hold", 2200);
    await wrongOnce(id, "dry");
    await endLab(id, "dry", "이름 붙이기");
    // 용어 스텝을 지나 이름 랩으로
    await W(500);
    await page.screenshot({ path: join(OUT, `${id}-words.png`) });
    texts.push((await L.readStep(page)).text);
    await L.cta(page);
    ok((await L.stepKind(page)) === "u4lab:u4x-names", `${id}: 용어 다음이 이름 랩이 아님(${await L.stepKind(page)})`);
    // 이름 랩: 먼저 일부러 다른 변화(응고)를 일으켜 본다
    await W(700);
    await at(id, "names-start");
    await L.sweep(page, ".u4x-names-range", 50, -10, 6, 70);
    await W(600);
    ok((await L.ds(page, "u4Mission")) === "0", `${id} names: 다른 변화를 일으켰는데 넘어감`);
    await at(id, "names-slip");
    await L.sweep(page, ".u4x-names-range", -10, 115, 10, 70); // 되돌아와서 기화
    await W(700);
    ok((await L.ds(page, "u4Mission")) === "1", `${id} names: 기화가 인정되지 않음`);
    await at(id, "names-vapor");
    await L.sweep(page, ".u4x-names-range", 115, 60, 5, 70); // 액화
    await W(500);
    await L.sweep(page, ".u4x-names-range", 60, -15, 6, 70); // 응고
    await W(700);
    await at(id, "names-freeze");
    await L.sweep(page, ".u4x-names-range", -15, 30, 5, 70); // 융해
    await endLab(id, "names", "개념 정리하기");
    await tail(id);
  },
  u4l4: async (id) => {
    ok((await L.stepKind(page)) === "opener:u4-wrap", `${id}: 새 도입이 아님(${await L.stepKind(page)})`);
    await at(id, "intro-ask");
    await L.choose(page, "평평");
    await W(500);
    await L.hold(page, ".opn-u4-btn", 1300);
    await at(id, "intro-mid");
    await L.hold(page, ".opn-u4-btn", 1700);
    ok(await L.waitPhase(page, "cool", 30), `${id} 도입: 볼록해진 뒤 식히기로 넘어가지 않음`);
    await W(300);
    await at(id, "intro-bulge");
    await L.hold(page, ".opn-u4-btn", 3000);
    await endOpener(id, "실험실 열기");
    // 올리브유 랩
    await W(500);
    await at(id, "olive-start");
    await L.click(page, ".u4x-olive-weigh");
    await predict(id, "olive", "줄어든다");
    await L.hold(page, ".u4x-hold", 1400);
    await at(id, "olive-mid");
    await L.hold(page, ".u4x-hold", 2200);
    ok(await L.waitVisible(page, ".u4x-olive-again"), `${id} olive: 다시 재기 버튼이 뜨지 않음`);
    await at(id, "olive-frozen");
    await L.click(page, ".u4x-olive-rush"); // 일부러 닦지 않고 바로 잰다
    await W(400);
    await at(id, "olive-wet");
    await L.click(page, ".u4x-olive-again");
    await wrongOnce(id, "olive");
    await endLab(id, "olive", "다음 실험, 풍선");
    // 풍선 랩
    await predict(id, "balloon", "그대로다");
    await L.hold(page, ".u4x-hold", 1500);
    await at(id, "balloon-mid");
    await L.hold(page, ".u4x-hold", 2200);
    await wrongOnce(id, "balloon");
    ok(await L.waitVisible(page, ".u4x-hold"), `${id} balloon: 식히기 버튼이 뜨지 않음`);
    await at(id, "balloon-cool");
    await L.hold(page, ".u4x-hold", 3600);
    await endLab(id, "balloon", "개념 정리하기");
    await tail(id);
  },
  u4l5: async (id) => {
    ok((await L.stepKind(page)) === "opener:u4-ramen", `${id}: 새 도입이 아님(${await L.stepKind(page)})`);
    await at(id, "intro-ask");
    await L.choose(page, "더 올라간다");
    await W(500);
    await L.click(page, ".opn-u4-btn");
    await W(500);
    await at(id, "intro-mid");
    await L.click(page, ".opn-u4-btn");
    await W(400);
    await L.click(page, ".opn-u4-btn");
    await endOpener(id, "실험실 열기");
    // 녹이기
    await predict(id, "melt", "계속 올라간다");
    await L.hold(page, ".u4x-hold", 900);
    await at(id, "melt-go");
    await runTo(id, "melt", 5);
    await at(id, "melt-flat");
    await runTo(id, "melt", 10);
    await wrongOnce(id, "melt");
    await endLab(id, "melt", "다음 실험, 물 끓이기");
    // 끓이기: 센 불 먼저, 그다음 약한 불
    await W(600);
    await at(id, "boil-start");
    await L.click(page, '.u4x-curve-pick[data-k="strong"]');
    await W(300);
    await runTo(id, "boil", 10);
    ok(await L.waitVisible(page, ".u4x-curve-redo"), `${id} boil: 불을 바꿔 다시 하기가 뜨지 않음`);
    await at(id, "boil-first");
    await L.click(page, ".u4x-curve-redo");
    await W(300);
    await runTo(id, "boil", 6);
    await at(id, "boil-second");
    await runTo(id, "boil", 10);
    await wrongOnce(id, "boil");
    await endLab(id, "boil", "이름 붙이기");
    await tail(id);
  },
  u4l6: async (id) => {
    ok((await L.stepKind(page)) === "comic", `${id}: 만화로 시작하지 않음(${await L.stepKind(page)})`);
    for (let i = 0; i < 12 && (await L.stepKind(page)) === "comic"; i++) await L.cta(page);
    ok((await L.stepKind(page)) === "u4lab:u4x-curve", `${id}: 만화 다음이 얼리기 랩이 아님(${await L.stepKind(page)})`);
    // 얼리기: 먼저 일부러 얼음만 채운다
    await predict(id, "freeze", "계속 내려간다");
    ok(await L.waitVisible(page, '.u4x-curve-pick[data-k="ice"]'), `${id} freeze: 비커 고르기가 뜨지 않음`);
    await at(id, "freeze-pick");
    await L.click(page, '.u4x-curve-pick[data-k="ice"]');
    await W(300);
    await runTo(id, "freeze", 8);
    ok(await L.waitVisible(page, ".u4x-curve-redo"), `${id} freeze: 얼음만인데 다시 하기가 뜨지 않음`);
    await at(id, "freeze-fail");
    await L.click(page, ".u4x-curve-redo");
    await W(300);
    await runTo(id, "freeze", 5);
    await at(id, "freeze-flat");
    await runTo(id, "freeze", 10);
    await wrongOnce(id, "freeze");
    await endLab(id, "freeze", "다음, 주변의 온도");
    // 주변 온도 랩: 먼저 일부러 방출하는 변화(응고)를 고른다
    await W(500);
    await at(id, "around-start");
    const press = async (k) => {
      await L.click(page, `.u4x-around-card[data-k="${k}"]`);
      await W(1900);
    };
    await press("frz");
    await at(id, "around-slip");
    await press("melt");
    await at(id, "around-cool");
    await press("vap");
    await press("subl");
    await W(1500);
    await at(id, "around-found");
    await press("cond");
    await press("depo");
    await endLab(id, "around", "이름 붙이기");
    await tail(id);
  },
};
/** 꾹 눌러 지금 실험의 시간을 to분까지 보낸다. */
async function runTo(id, mark, to) {
  for (let i = 0; i < 40; i++) {
    const m = Number(await L.ds(page, "u4M"));
    if (!(await L.visible(page, ".u4x-hold"))) return; // 실험이 끝나 버튼이 걷혔다
    if (to < 8 && m >= to - 0.05) return; // 중간 시점(끝까지 가는 호출은 버튼이 걷힐 때까지 누른다)
    await L.hold(page, ".u4x-hold", Math.min(1500, Math.max(250, (to - m) * 560 + (to >= 8 ? 200 : 0))));
  }
  ok(false, `${id} ${mark}: ${to}분까지 가지 못함`);
}

for (const [id, play] of Object.entries(PLAYS)) {
  if (ONLY && ONLY !== id) continue;
  console.log(id);
  texts = [];
  await L.openLesson(page, id);
  await play(id);
  const all = texts.join("\n");
  ok(!/[—–]|\s-\s/.test(all), `${id}: 화면 글에 대시가 있음`);
  ok(!/교과서|분자/.test(all), `${id}: 화면 글에 금지 낱말(교과서, 분자)이 있음`);
  ok(!/\p{Extended_Pictographic}/u.test(all.replace(/[℃→←↔]/g, "")), `${id}: 화면 글에 이모지가 있음`);
}
const v5Errors = errors.length; // 여기까지가 새 판에서 난 오류다(토글을 끈 화면의 오류는 따로 적기만 한다)
if (!ONLY) {
  // 토글을 끄면 지금 운영 화면(정본 훅)이어야 한다
  await L.openLesson(page, "u4l1", false);
  ok((await L.stepKind(page)) === "hook", `토글을 껐는데 정본 훅이 아님(${await L.stepKind(page)})`);
}
ok(v5Errors === 0, `페이지 오류 ${v5Errors}건: ${errors.slice(0, 3).join(" / ")}`);
if (errors.length > v5Errors) console.log(`  (참고) 토글을 끈 지금 화면에서 난 오류 ${errors.length - v5Errors}건: ${errors.slice(v5Errors).join(" / ")}`);
await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
