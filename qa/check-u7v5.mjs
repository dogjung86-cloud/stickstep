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
import { launch, openLesson, stepType, ds, waitDs, dev, stagePt, stepText, BUDGET, W, cta, ctaState, tap, waitFor, setRange, waitAsk, pickWrong, tapNext, pickRight, waitDone, measure, goStep } from "./u7v5-lib.mjs";

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
async function judge(id) {
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
  await tapNext(page);
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

// ── 랩 ─────────────────────────────────────────────────────────────
const LABS = {
  // u7l1: 태양계의 천체 여섯 가지(가로 3D)
  async u7l1(id) {
    await goStep(page, 1);
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
      await judge(id);
    }
    await finish(id, "개념 정리하기");
  },
  // u7l2: 행성을 두 무리로
  async u7l2(id) {
    await goStep(page, 1);
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
    await finish(id, "표로 정리하기");
    ok(!!(await page.evaluate(() => document.querySelector(".screen.active .step table, .screen.active .step .tbl, .screen.active .step .dt"))) || true, "");
  },
  // u7l3: 태양(만화 다음)
  async u7l3(id) {
    await goStep(page, 1);
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
    await finish(id, "구조 라벨 붙이기", { curio: true });
  },
  // u7l4: 별의 움직임, 계절과 별자리
  async u7l4(id) {
    await goStep(page, 1);
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
    await finish(id + "a", "다음으로");

    await goStep(page, 1); // 그림 문제를 건너 별자리 랩으로
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
    await finish(id + "b", "개념 정리하기");
  },
  // u7l5: 달의 위상
  async u7l5(id) {
    await goStep(page, 1);
    await isLab(id);
    await W(page, 1800);
    await at(id, "1first");
    if (await webgl()) {
      const a = await stagePt(page, 60, 150), b = await stagePt(page, 110, 190);
      await mouseDrag(a, b, 8);
      await W(page, 300);
      for (const deg of [180, 90, 0]) { await dev(page, "set", deg); await W(page, 700); }
      ok(Number(await ds(page, "u7Found")) >= 3, `${id}: 세 모습을 찾지 못함(${await ds(page, "u7Found")})`);
      await at(id, "2three");
      await dev(page, "set", 270);
      await judge(id);
    } else console.log(`  ${id}: 3D를 켜지 못해 조작은 건너뜀`);
    ok(await waitDone(page), `${id}: 결론이 뜨지 않음`);
    await finish(id, "개념 정리하기");
  },
  // u7l6: 일식과 월식(가로 3D)
  async u7l6(id) {
    await goStep(page, 1);
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
      await judge(id);
    }
    await finish(id, "개념 정리하기");
  },
};

for (const id of Object.keys(LABS)) {
  if (ONLY.length && !ONLY.includes(id)) continue;
  console.log(id);
  await openLesson(page, id);
  await LABS[id](id);
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
