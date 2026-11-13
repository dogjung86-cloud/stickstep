// 중1 Ⅶ v5 단원 검사(작업서 6절의 간소 검사 하나).
// 390×700에서 레슨마다 도입과 랩을 처음부터 끝까지 한 길로 가고, 랩의 첫 판정에서 한 번은 틀려 본다.
// 시점마다(처음, 조작 중, 판정, 오답, 결론) 스크롤 높이가 554 이하인지, 잘린 글과 낮은 버튼이 없는지,
// 무대 안 글자가 12px 이상인지, 페이지 오류가 없는지, 끝 버튼으로 다음 스텝이 열리는지 본다.
// 그 길에서 모은 화면 글에 대시, '교과서', 이모지, '분자'가 없는지도 본다. 시점마다 캡처를 남긴다(눈검수용).
// 실행(서버 없이): NODE_ENV=development npx vite build --mode development --outDir dist-dev
//                  node qa/check-u7v5.mjs [캡처 폴더]        ONLY=u7l5,u7l4 로 레슨을 고를 수 있다
// 실행(개발 서버): PORT=5577 node qa/check-u7v5.mjs [캡처 폴더]
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { launch, openLesson, stepType, ds, waitDs, dev, stagePt, stepText, BUDGET, W, cta, ctaState, tap, waitFor, setRange, waitAsk, askText, pickWrong, tapNext, pickRight, waitDone, measure, goStep } from "./u7v5-lib.mjs";
import { measure as omeasure, choose, waitPhase, stagePt as opnPt } from "./u2intro-lib.mjs";

const OUT = process.argv[2] ?? "qa/shots/u7v5";
mkdirSync(OUT, { recursive: true });
const ONLY = (process.env.ONLY ?? "").split(",").filter(Boolean);

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log("  FAIL " + msg); } };
const texts = [];
const { browser, page, errors } = await launch();
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });

/** 랩 화면의 한 시점을 잰다. */
async function at(id, mark, { cap = true, curio = false } = {}) {
  const m = await measure(page);
  ok(curio || m.total <= m.usable, `${id} ${mark}: 높이 ${m.total}/${m.usable}`);
  ok(!m.helperOver, `${id} ${mark}: 도움말이 두 줄을 넘음 "${m.helperText}"`);
  ok(!m.slotOver, `${id} ${mark}: 조작 칸이 넘침`);
  ok(m.cut.length === 0, `${id} ${mark}: 잘린 글 ${m.cut.join(" | ")}`);
  ok(m.taps.every((t) => t.h >= 44), `${id} ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 44).map((t) => `${t.t}:${t.h}`).join(",")}`);
  ok(m.minFont >= 11.9, `${id} ${mark}: 무대 글자 ${m.minFont}px "${m.minFontText}"`);
  ok(m.frameScroll === 0, `${id} ${mark}: 화면이 밀림 ${m.frameScroll}`);
  texts.push(await stepText(page));
  console.log(`  ${id} ${mark}: ${m.total}/${m.usable}px, 무대 글자 ${m.minFont}px`);
  if (cap) await shot(`${id}-${mark}`);
  return m;
}

/** 판정: 한 번 틀리고(오답 화면을 잰다) '다음'으로 결론까지. */
async function judge(id, { second = false } = {}) {
  ok(await waitAsk(page), `${id}: 판정 질문이 뜨지 않음`);
  await W(page, 300);
  await at(id, "3ask");
  const picked = await pickWrong(page);
  ok(!!picked, `${id}: 틀린 보기를 누르지 못함`);
  await W(page, 600);
  await at(id, "4wrong");
  const card = await page.evaluate(() => {
    const b = document.querySelector(".screen.active .bv-q.show .bv-choice.miss");
    const a = document.querySelector(".screen.active .bv-q.show .bv-ans.no");
    return { miss: !!b && /오답이에요/.test(b.textContent), ans: a?.textContent?.trim() ?? "" };
  });
  ok(card.miss && /정답/.test(card.ans), `${id}: 오답 표시나 정답 카드가 없음`);
  await W(page, 1500);
  ok(!!(await page.evaluate(() => document.querySelector(".screen.active .bv-q.show .bv-choice.miss"))), `${id}: 기다리자 저절로 넘어감`);
  const first = await askText(page);
  await tapNext(page);
  if (second) {
    ok(await waitAsk(page, first), `${id}: 둘째 질문이 뜨지 않음`);
    await W(page, 300);
    await at(id, "3ask2");
    await pickRight(page);
  }
  ok(await waitDone(page), `${id}: 결론이 뜨지 않음`);
  await W(page, 400);
}

async function finish(id, wantCta, { curio = false } = {}) {
  await at(id, "5done", { curio });
  const c = await ctaState(page);
  ok(c.enabled && c.text === wantCta, `${id}: 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  const before = await stepKey();
  await cta(page);
  await W(page, 500);
  ok((await stepKey()) !== before, `${id}: 끝 버튼을 눌러도 다음 스텝이 열리지 않음`);
}
const stepKey = () => page.evaluate(() => {
  const s = document.querySelector(".screen.active .step");
  return s ? s.className + "|" + (s.textContent ?? "").slice(0, 40) : "";
});
const isLab = async (id) => ok((await stepType(page)) === "u7lab", `${id}: 새 랩이 아님(${await stepType(page)})`);
const mouseDrag = async (from, to, steps = 10) => {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
  await page.mouse.up();
};
const webgl = () => page.evaluate(() => !document.querySelector(".screen.active .bv-stage.u7x-fallback"));

/** 새로 쓴 문제: 지금 스텝에서 skip번 앞으로 가서 정답 보기(저작 번호 ans)를 누르고 정답으로 채점되는지 본다. */
async function newQuiz(id, skip, ans) {
  await goStep(page, skip);
  const has = await page.evaluate((a) => !!document.querySelector(`.screen.active .opts .opt[data-oi="${a}"]`), ans);
  ok(has, `${id}: 새 문제 자리에 선택형 문제가 없음`);
  if (!has) return;
  texts.push(await stepText(page));
  ok(await page.evaluate(() => (document.querySelector(".screen.active .scroll")?.scrollHeight ?? 0) > 0), `${id}: 새 문제 화면이 비어 있음`);
  await page.evaluate((a) => document.querySelector(`.screen.active .opts .opt[data-oi="${a}"]`).click(), ans);
  await W(page, 250);
  await cta(page);
  await W(page, 700);
  const good = await page.evaluate((a) => document.querySelector(`.screen.active .opts .opt[data-oi="${a}"]`)?.classList.contains("ok") ?? false, ans);
  ok(good, `${id}: 새 문제의 정답 보기가 정답으로 채점되지 않음`);
  texts.push(await stepText(page));
  await shot(`${id}-9newq`);
}

// ── 랩 ─────────────────────────────────────────────────────────────
const LABS = {
  // u7l1: 태양계의 천체 여섯 가지(가로 3D)
  async u7l1(id) {
    await isLab(id);
    await at(id, "1first");
    await tap(page, ".u7x-enterbtn");
    const open = await waitFor(page, () => !!document.querySelector(".rot-overlay.in .sp3-canvas"), null, 80);
    ok(open, `${id}: 가로 화면이 열리지 않음`);
    await W(page, 2500);
    const has3d = await page.evaluate(() => !!document.querySelector(".rot-overlay .sp3-missions"));
    if (!has3d || !(await dev(page, "visit", 0))) {
      console.log(`  ${id}: 3D를 켜지 못해 가로 화면 조작은 건너뜀`);
      ok(await waitDone(page), `${id}: 3D가 없을 때의 결론이 뜨지 않음`);
    } else {
      await W(page, 900);
      await shot(`${id}-2card`);
      texts.push(await stepText(page));
      for (let i = 1; i < 6; i++) {
        await dev(page, "close");
        await W(page, 350);
        await dev(page, "visit", i);
        await W(page, 500);
      }
      await dev(page, "close");
      await W(page, 900);
      ok((await ds(page, "u7Found")) === "6", `${id}: 여섯 가지를 다 만나지 못함(${await ds(page, "u7Found")})`);
      ok(await page.evaluate(() => !!document.querySelector(".rot-overlay .u7x-rotdone")), `${id}: 가로 화면에 끝 알림이 없음`);
      await shot(`${id}-2alldone`);
      texts.push(await stepText(page));
      await page.evaluate(() => document.querySelector(".rot-overlay .u7x-rotdone-btn")?.click());
      await W(page, 700);
      ok(await waitDs(page, "u7Phase", "table"), `${id}: 특징 표가 열리지 않음(${await ds(page, "u7Phase")})`);
      await W(page, 300);
      await at(id, "3table");
      const chip = (k) => tap(page, `.u7x-segbtn[data-k="${k}"]`);
      await chip("sun"); await chip("planet"); await tap(page, ".bv-btn.main"); // 틀린 답: 태양과 행성이 스스로 빛난다
      await W(page, 500);
      ok((await ds(page, "u7Feature")) === "0" && (await ds(page, "u7Miss")) === "1", `${id}: 틀린 표가 그대로 적힘`);
      await at(id, "4wrong");
      await chip("planet"); await tap(page, ".bv-btn.main");
      ok(await waitDs(page, "u7Feature", "1", 20), `${id}: 첫 특징이 적히지 않음`);
      for (const k of ["planet", "belt", "comet", "dwarf"]) await chip(k);
      await tap(page, ".bv-btn.main");
      ok(await waitDs(page, "u7Feature", "2", 20), `${id}: 둘째 특징이 적히지 않음`);
      await chip("moon"); await tap(page, ".bv-btn.main");
      ok(await waitDone(page), `${id}: 결론이 뜨지 않음`);
      await W(page, 400);
    }
    await finish(id, "이름표 붙이기");
    await newQuiz(id, 4, 1);
  },
  // u7l2: 행성을 두 무리로
  async u7l2(id) {
    await isLab(id);
    await at(id, "1first");
    await tap(page, '.bv-card[data-k="mass"]');
    await W(page, 300);
    await tap(page, '.bv-card[data-k="moons"]');
    ok(await waitDs(page, "u7Phase", "split"), `${id}: 가르기 국면으로 가지 않음`);
    await W(page, 300);
    await setRange(page, ".u7x-range", 2);
    await tap(page, ".bv-btn.main");
    await W(page, 500);
    await at(id, "2wrongcut");
    ok((await ds(page, "u7Phase")) === "split", `${id}: 엉뚱한 자리에서 갈랐는데 넘어감`);
    await setRange(page, ".u7x-range", 4);
    await tap(page, ".bv-btn.main");
    await judge(id);
    await finish(id, "용어로 정리하기");
    await newQuiz(id, 3, 0);
  },
  // u7l3: 태양(만화 다음)
  async u7l3(id) {
    await isLab(id);
    await W(page, 400);
    await at(id, "1first");
    const miss = await stagePt(page, 173, 40);
    await page.mouse.click(miss.x, miss.y);
    const p = await stagePt(page, 173 + Math.cos(0.4) * 0.36 * 74, 116 + Math.sin(0.4) * 0.36 * 74 * 0.92);
    await page.mouse.click(p.x, p.y);
    ok(await waitDs(page, "u7Done", "1"), `${id}: 흑점을 눌러도 반응이 없음`);
    await W(page, 300);
    await at(id, "2spot");
    await tap(page, '.u7x-segbtn[data-v="ecl"]');
    ok(await waitDs(page, "u7Done", "2"), `${id}: 달이 가려도 코로나 단계가 지나가지 않음`);
    await setRange(page, ".u7x-range", 100);
    ok(await waitDs(page, "u7Done", "3"), `${id}: 흑점 수를 늘려도 반응이 없음`);
    await W(page, 400);
    await at(id, "2corona");
    await judge(id);
    await finish(id, "사진에 이름 붙이기", { curio: true });
    await newQuiz(id, 3, 0);
  },
  // u7l4: 별의 움직임, 계절과 별자리
  async u7l4(id) {
    await isLab(id);
    await W(page, 300);
    await at(id + "a", "1first");
    for (const d of ["E", "S", "W", "N"]) {
      await tap(page, `.u7x-segbtn[data-d="${d}"]`);
      await W(page, 200);
      for (const v of [6, 12, 20]) { await setRange(page, ".u7x-range", v, false); await W(page, 80); }
      if (d === "S") await at(id + "a", "2south");
    }
    ok(await waitDs(page, "u7Phase", "pole"), `${id}a: 북극성 찾기로 가지 않음`);
    await W(page, 300);
    const off = await stagePt(page, 90, 60);
    await page.mouse.click(off.x, off.y);
    await W(page, 200);
    await at(id + "a", "2pole");
    const pole = await stagePt(page, 173, 96);
    await page.mouse.click(pole.x, pole.y);
    await judge(id + "a");
    await finish(id + "a", "이름 붙이기");

    await goStep(page, 2); // 개념과 그림 문제를 건너 별자리 랩으로
    await isLab(id);
    await W(page, 1800);
    await at(id + "b", "1first");
    if (await webgl()) {
      const a = await stagePt(page, 80, 115), b = await stagePt(page, 150, 190);
      await mouseDrag(a, b, 12);
      ok(await waitDs(page, "u7Phase", "night", 30), `${id}b: 지구를 끌어도 다음 일로 가지 않음(${await ds(page, "u7Phase")})`);
      await dev(page, "month", 7);
      ok(await waitDs(page, "u7Phase", "sun", 40), `${id}b: 7월에서 넘어가지 않음`);
      await W(page, 300);
      await at(id + "b", "2july");
      await dev(page, "month", 1);
      await judge(id + "b");
    } else console.log(`  ${id}b: 3D를 켜지 못해 조작은 건너뜀`);
    ok(await waitDone(page), `${id}b: 결론이 뜨지 않음`);
    await finish(id + "b", "이름 붙이기");
    await newQuiz(id, 3, 0);
  },
  // u7l5: 달의 위상
  async u7l5(id) {
    await isLab(id);
    await W(page, 1800);
    await at(id, "1first");
    if (await webgl()) {
      const a = await stagePt(page, 60, 150), b = await stagePt(page, 110, 190);
      await mouseDrag(a, b, 8);
      await W(page, 700);
      const shootAt = async (k) => { await dev(page, "spot", k); await W(page, 250); await tap(page, ".u7x-shutter"); await W(page, 350); };
      for (const k of [0, 1, 2, 3]) await shootAt(k);
      ok((await ds(page, "u7Found")) === "4", `${id}: 네 자리를 찍지 못함(${await ds(page, "u7Found")})`);
      await tap(page, ".u7x-shutter"); // 이미 찍은 자리에서 한 번 더
      await W(page, 300);
      ok((await ds(page, "u7Found")) === "4", `${id}: 찍은 자리를 다시 찍었는데 장수가 늘어남`);
      await at(id, "2half");
      for (const k of [4, 5, 6, 7]) await shootAt(k);
      ok((await ds(page, "u7Found")) === "8", `${id}: 여덟 자리를 찍지 못함(${await ds(page, "u7Found")})`);
      await judge(id);
    } else console.log(`  ${id}: 3D를 켜지 못해 조작은 건너뜀`);
    ok(await waitDone(page), `${id}: 결론이 뜨지 않음`);
    await finish(id, "이름 정리하기");
    await newQuiz(id, 4, 0);
  },
  // u7l6: 일식과 월식(가로 3D 하나 + 위에서 내려다본 2D 넷)
  async u7l6(id) {
    await isLab(id);
    await at(id, "1first");
    await tap(page, ".u7x-enterbtn");
    ok(await waitFor(page, () => !!document.querySelector(".rot-overlay.in .sp3-canvas"), null, 80), `${id}: 가로 화면이 열리지 않음`);
    await W(page, 2500);
    const has3d = await page.evaluate(() => !!document.querySelector(".rot-overlay .sp3-tiltbtn")) && (await ds(page, "u7Phase")) === "play";
    if (!has3d) {
      console.log(`  ${id}: 3D를 켜지 못해 가로 화면 조작은 건너뜀`);
      ok(await waitDone(page), `${id}: 3D가 없을 때의 결론이 뜨지 않음`);
    } else {
      await dev(page, "phi", 180);
      ok(await waitDs(page, "u7Found", "1", 40), `${id}: 일식 자리에서 반응이 없음`);
      await W(page, 500);
      await shot(`${id}-2solar`);
      texts.push(await stepText(page));
      await page.evaluate(() => document.querySelector(".rot-overlay .sp3-groundbtn")?.click());
      ok(await waitDs(page, "u7Found", "2", 40), `${id}: 땅에서 보기가 되지 않음`);
      await shot(`${id}-2ground`);
      await page.evaluate(() => document.querySelector(".rot-overlay .sp3-groundbtn")?.click());
      await W(page, 900);
      await dev(page, "phi", 0);
      ok(await waitDs(page, "u7Found", "3", 40), `${id}: 월식 자리에서 반응이 없음`);
      await W(page, 600);
      ok(await page.evaluate(() => !!document.querySelector(".rot-overlay .u7x-rotdone")), `${id}: 가로 화면에 끝 알림이 없음`);
      await shot(`${id}-2lunar`);
      texts.push(await stepText(page));
      await page.evaluate(() => document.querySelector(".rot-overlay .u7x-rotdone-btn")?.click());
      await W(page, 700);
      await judge(id, { second: true });
    }
    await finish(id, "그때 달의 모양 보기");

    // 둘째 랩: 한 줄일 때 달의 위상(달을 끌어 망 자리에, 검사 손잡이로 삭 자리에)
    await isLab(id);
    await W(page, 300);
    await at(id + "b", "1first");
    await mouseDrag(await stagePt(page, 170, 184), await stagePt(page, 236, 127));
    ok(await waitDs(page, "u7Found", "1", 30), `${id}b: 달을 망 자리로 끌어도 반응이 없음`);
    await W(page, 400);
    await at(id + "b", "2full");
    await dev(page, "elong", 60);
    await W(page, 200);
    await at(id + "b", "2crescent", { cap: true });
    await dev(page, "elong", 0);
    ok(await waitDs(page, "u7Found", "2", 30), `${id}b: 삭 자리에서 반응이 없음`);
    await at(id + "b", "2new");
    await judge(id + "b", { second: true });
    await finish(id + "b", "이름 정리하기");
    await goStep(page, 1); // 개념 스텝을 지나 셋째 랩으로

    // 셋째 랩: 일식이 보이는 곳(사람을 그림자 밖, 옅은 곳, 짙은 곳에)
    await isLab(id);
    await W(page, 300);
    await at(id + "c", "1first");
    await dev(page, "at", -46);
    ok(await waitDs(page, "u7Found", "1", 30) && (await ds(page, "u7Kind")) === "none", `${id}c: 그림자 밖에서 반응이 없음`);
    await at(id + "c", "2none");
    { const q = await stagePt(page, 321 - 95 * Math.cos(18 * Math.PI / 180), 115 - 95 * Math.sin(18 * Math.PI / 180)); await page.mouse.click(q.x, q.y); }
    ok(await waitDs(page, "u7Found", "2", 30) && (await ds(page, "u7Kind")) === "partial", `${id}c: 옅은 곳을 눌러도 부분일식이 아님(${await ds(page, "u7Kind")})`);
    await W(page, 300);
    await at(id + "c", "2partial");
    { const q = await stagePt(page, 228, 119); await page.mouse.click(q.x, q.y); } // 한가운데 가까이를 누르면 가운데에 선다
    ok(await waitDs(page, "u7Found", "3", 30) && (await ds(page, "u7Kind")) === "total", `${id}c: 짙은 곳에서 개기일식이 아님(${await ds(page, "u7Kind")})`);
    await W(page, 300);
    await at(id + "c", "2total");
    await judge(id + "c");
    await finish(id + "c", "가려지는 쪽 보기");

    // 넷째 랩: 태양이 가려지는 쪽(예상 → 달을 움직인다)
    await isLab(id);
    await W(page, 300);
    await at(id + "d", "1predict");
    ok(!!(await pickWrong(page)), `${id}d: 예상 보기를 누르지 못함`);
    ok(await waitDs(page, "u7Phase", "play", 30), `${id}d: 예상 뒤에 조작으로 넘어가지 않음`);
    await W(page, 300);
    await mouseDrag(await stagePt(page, 147, 76), await stagePt(page, 144, 95));
    ok(await waitDs(page, "u7Found", "1", 30) && (await ds(page, "u7Kind")) === "partial", `${id}d: 달을 끌어도 가려지기 시작하지 않음`);
    await at(id + "d", "2in");
    await dev(page, "moon", 0);
    ok(await waitDs(page, "u7Found", "2", 30), `${id}d: 한 줄에서 개기일식이 아님`);
    await at(id + "d", "2total");
    await dev(page, "moon", -6);
    ok(await waitDs(page, "u7Found", "3", 30), `${id}d: 지나간 뒤 다시 보이는 단계가 없음`);
    await at(id + "d", "2out");
    await judge(id + "d");
    await finish(id + "d", "월식 자세히 보기");

    // 다섯째 랩: 월식(예상 → 달을 그림자에 넣었다 뺀다)
    await isLab(id);
    await W(page, 300);
    await at(id + "e", "1predict");
    ok(!!(await pickWrong(page)), `${id}e: 예상 보기를 누르지 못함`);
    ok(await waitDs(page, "u7Phase", "play", 30), `${id}e: 예상 뒤에 조작으로 넘어가지 않음`);
    await W(page, 300);
    await mouseDrag(await stagePt(page, 204, 167), await stagePt(page, 210, 146));
    ok(await waitDs(page, "u7Found", "1", 30) && (await ds(page, "u7Kind")) === "partial", `${id}e: 달을 끌어도 부분월식이 아님(${await ds(page, "u7Kind")})`);
    await at(id + "e", "2in");
    await dev(page, "moon", 0);
    ok(await waitDs(page, "u7Found", "2", 30), `${id}e: 한 줄에서 개기월식이 아님`);
    await at(id + "e", "2total");
    await dev(page, "moon", -9);
    ok(await waitDs(page, "u7Found", "3", 30), `${id}e: 빠져나오는 단계가 없음`);
    await at(id + "e", "2out");
    await judge(id + "e");
    await finish(id + "e", "정리하기");
    await newQuiz(id, 5, 0);
  },
};


// ── 도입 ───────────────────────────────────────────────────────────
async function oat(id, mark) {
  const m = await omeasure(page);
  ok(m.content <= m.view && m.scrollTop === 0, `${id} 도입 ${mark}: 높이 ${m.content}/${m.view}, 밀림 ${m.scrollTop}`);
  ok(m.titleLines === 1, `${id} 도입 ${mark}: 제목 ${m.titleLines}줄`);
  ok(m.clipped.length === 0, `${id} 도입 ${mark}: 잘린 글 ${m.clipped.join(" | ")}`);
  ok(m.taps.every((t) => t.h >= 44), `${id} 도입 ${mark}: 낮은 버튼 ${m.taps.filter((t) => t.h < 44).map((t) => t.t + t.h).join(",")}`);
  ok(m.bubbleLines <= 3, `${id} 도입 ${mark}: 말이 ${m.bubbleLines}줄`);
  texts.push(await stepText(page));
  console.log(`  ${id} 도입 ${mark}: ${m.content}/${m.view}px, 말 ${m.bubbleLines}줄`);
  await shot(`${id}-0${mark}`);
}
const holdOn = async (sel, ms) => {
  const r = await page.evaluate((s) => { const b = document.querySelector(`.screen.active ${s}`).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel);
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await W(page, ms);
  await page.mouse.up();
  await W(page, 250);
};
async function playOpener(id, { pick, mid, rest, want }) {
  ok((await stepType(page)) === "opener", `${id}: 새 도입이 아님(${await stepType(page)})`);
  await oat(id, "ask");
  ok(!!(await choose(page, pick)), `${id}: 예측 보기 "${pick}"를 누르지 못함`);
  await W(page, 600);
  await mid();
  await oat(id, "mid");
  await rest();
  ok(await waitPhase(page, "done", 80), `${id}: 도입이 끝나지 않음(${await ds(page, "opnPhase")})`);
  await W(page, 1400);
  await oat(id, "done");
  const c = await ctaState(page);
  ok(c.enabled && c.text === want, `${id}: 도입 끝 버튼 "${c.text}" enabled=${c.enabled}`);
  await cta(page);
  await W(page, 500);
}
const OPENERS = {
  u7l1: (id) => playOpener(id, { pick: "아주 밝은 별", want: "태양계로 출발", mid: () => holdOn(".opn-u7-hit", 800), rest: () => holdOn(".opn-u7-hit", 1500) }),
  u7l2: (id) => playOpener(id, { pick: "6개쯤", want: "여덟 행성 견주기", mid: () => holdOn(".opn-u7-btn.hold", 1100), rest: () => holdOn(".opn-u7-btn.hold", 2200) }),
  u7l4: (id) => playOpener(id, { pick: "왼쪽으로", want: "밤하늘 살펴보기", mid: async () => { await tap(page, '.opn-u7-btn[data-n="2"]'); await W(page, 600); }, rest: () => tap(page, '.opn-u7-btn[data-n="3"]') }),
  u7l5: (id) => playOpener(id, { pick: "가느다란", want: "달을 직접 옮겨 보기", mid: () => holdOn(".opn-u7-btn.hold", 1300), rest: () => holdOn(".opn-u7-btn.hold", 2300) }),
  u7l6: (id) => playOpener(id, { pick: "구름", want: "세 천체를 한 줄로", mid: () => holdOn(".opn-u7-btn.hold", 1100), rest: () => holdOn(".opn-u7-btn.hold", 2200) }),
};

for (const id of Object.keys(LABS)) {
  if (ONLY.length && !ONLY.includes(id)) continue;
  console.log(id);
  await openLesson(page, id);
  if (OPENERS[id]) await OPENERS[id](id);
  else await goStep(page, 1); // 만화로 시작하는 레슨은 만화를 건너 랩으로
  await LABS[id](id);
}

// 토글을 끄면 지금의 화면 그대로(정본 훅과 정본 랩)
if (!ONLY.length) {
  await openLesson(page, "u7l1", { on: false });
  const t0 = await stepType(page);
  ok(t0 !== "opener" && t0 !== "u7lab", `토글을 껐는데 새 도입이 열림(${t0})`);
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .step .hook-scene, .screen.active .step .hk-space-wrap, .screen.active .step .helper")), "토글을 끈 u7l1의 첫 스텝이 정본 훅이 아님");
  await goStep(page, 1);
  ok(await page.evaluate(() => !!document.querySelector(".screen.active .step .sp3-enter") && !document.querySelector(".screen.active .step.u7x-step")), "토글을 끈 u7l1의 랩이 정본이 아님");
  await shot("off-u7l1-lab");
}

// 내용 파일의 글(개념, 정리, 문제)도 같은 규칙으로 본다
{
  const fs = await import("node:fs");
  const src = fs.readFileSync("src/content/unit7.ts", "utf8").replace(/^\s*\/\/.*$/gm, "");
  const lits = [...src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1]).filter((t) => /[가-힣]/.test(t)).join("\n");
  ok(!/[—–]/.test(lits), "내용 파일에 대시");
  ok(!/교과서|분자/.test(lits), "내용 파일에 '교과서'나 '분자'");
  ok(!/\p{Extended_Pictographic}/u.test(lits), "내용 파일에 이모지");
}

// 화면 글 검사
const all = texts.join("\n");
ok(!/[—–]/.test(all), `화면 글에 대시: ${(all.match(/.{0,12}[—–].{0,12}/) ?? [""])[0]}`);
ok(!/교과서/.test(all), "화면 글에 '교과서'");
ok(!/분자/.test(all), "화면 글에 '분자'");
ok(!/\p{Extended_Pictographic}/u.test(all.replace(/[✓✕›‹←→↗↘·]/g, "")), `화면 글에 이모지: ${(all.match(/\p{Extended_Pictographic}/u) ?? [""])[0]}`);
ok(errors.length === 0, `페이지 오류 ${errors.length}건: ${errors.slice(0, 4).join(" / ")}`);

await browser.close();
console.log(`\n${fail ? "FAIL" : "PASS"} ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
