// 랩의 다른 느낌 샘플 검사. 샘플 셋(종이 콜라주, 손그림 공책, 입체 모형)을 실제로 조작하며 본다.
//   A. 토글: 꺼져 있으면(표식 없음, ?u2style=0) 정본 랩이 뜨고, 켜면 샘플이 뜬다. 골라 켜기도 된다.
//   B. 한 화면: 화면 세 가지(390×700, 360×700, 430×932)에서 오답 경로로 끝까지 가며 시점마다 잰다(정본의 한 화면 검사와 같은 기준).
//   C. 정답 경로: 채점 판정을 맞히며 결론까지. 결론 글과 '다음' 버튼, 채점 한 번.
//   D. 입체 모형: 그림이 실제로 그려졌는가, 끌면 도는가, 모형의 구조를 눌러도 멈추는가. WebGL이 없으면 평면 랩으로 물러나는가.
//   E. 화면 글: 걷는 동안 뜬 글에서 대시, '교과서', 출판사 이름, '분자', 이모지, 이 책에 없는 용어를 찾는다.
//   PORT=5567 node qa/check-labstyle.mjs [캡처 폴더]
import fs from "node:fs";
import path from "node:path";
import { SAMPLES, BUDGET, launchStyled, openLesson, goStep, measure, stepInfo, screenText, concluded, ctaState, tap, W, ds } from "./labstyle-lib.mjs";

const SHOTS = process.argv[2] || "";
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let PASS = 0;
let FAIL = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) PASS++;
  else {
    FAIL++;
    fails.push(label);
    console.log("  ✗", label);
  }
};
const seen = new Map();
const collect = async (page, where) => (await screenText(page)).forEach((t) => seen.set(t, where));

// ═════════════════════════════ A. 토글 ═════════════════════════════
console.log("══ A. 토글 ══");
for (const [style, label] of [[null, "표식 없음"], ["0", "?u2style=0"]]) {
  const { browser, page, errors } = await launchStyled({ style });
  for (const s of SAMPLES) {
    await openLesson(page, s.lab.li);
    await goStep(page, s.lab.si);
    const info = await stepInfo(page);
    ok(!/\bls-/.test(info.step) && info.stage.includes(s.base), `[${label}] ${s.name}: 정본 랩이 뜬다(${info.stage})`);
  }
  if (style === null) {
    const flag = await page.evaluate(() => sessionStorage.getItem("ss.u2style"));
    ok(flag === null, "표식 없이 열면 세션에 아무것도 남지 않는다");
  }
  ok(errors.length === 0, `[${label}] 페이지 오류 ${errors.length}건`);
  await browser.close();
}
{
  // 골라 켜기: collage만 켜면 나머지 둘은 정본
  const { browser, page } = await launchStyled({ style: "collage" });
  for (const s of SAMPLES) {
    await openLesson(page, s.lab.li);
    await goStep(page, s.lab.si);
    const info = await stepInfo(page);
    ok(info.step.includes(s.cls) === (s.style === "collage"), `[collage만] ${s.name}: ${s.style === "collage" ? "샘플" : "정본"}`);
  }
  await browser.close();
}
{
  // 주소로 켜기: ?u2style 로 열면 세션에 남고, 식물세포 랩(같은 스텝 타입의 다른 모드)은 정본 그대로다
  const { browser, page } = await launchStyled({ style: null });
  await page.goto(`http://localhost:${process.env.PORT || "5567"}/?u2style`, { waitUntil: "domcontentloaded" });
  await W(page, 1200);
  await openLesson(page, 1);
  await goStep(page, 2);
  ok((await stepInfo(page)).step.includes("ls-model"), "주소 ?u2style 로 켜면 샘플이 뜬다");
  ok((await page.evaluate(() => sessionStorage.getItem("ss.u2style"))) === "1", "켠 것이 세션에 남는다");
  await openLesson(page, 1);
  await goStep(page, 4);
  const plant = await stepInfo(page);
  ok(!/\bls-/.test(plant.step) && plant.stage.includes("cwk-stage"), "식물세포 랩은 켜져 있어도 정본 그대로");
  await browser.close();
}

// ═════════════════════════════ B. 한 화면(오답 경로) ═════════════════════════════
console.log("\n══ B. 한 화면 ══");
const VIEWS = [
  { w: 390, h: 700, name: "390×700", minFont: 12 },
  { w: 360, h: 700, name: "360×700", minFont: 11 },
  { w: 430, h: 932, name: "430×932", minFont: 12 },
];
for (const view of VIEWS) {
  console.log(`■ ${view.name}`);
  const { browser, page, errors } = await launchStyled({ width: view.w, height: view.h });
  for (const s of SAMPLES) {
    await openLesson(page, s.lab.li);
    await goStep(page, s.lab.si);
    ok((await stepInfo(page)).step.includes(s.cls), `[${view.name}] ${s.name}: 샘플이 떴다`);
    let slotTop = null;
    const rows = [];
    const on = async (label) => {
      const m = await measure(page);
      await collect(page, `${s.name} ${label}`);
      const tag = `[${view.name}] ${s.name} ${label}`;
      rows.push(m.total);
      if (SHOTS && view.w === 390) await page.screenshot({ path: path.join(SHOTS, `${s.style}-${label}.png`) });
      const afterDone = label === "done";
      if (view.h === 700 && view.w === 390) ok(m.usable === BUDGET, `${tag} 스크롤 영역 ${m.usable} (기준 ${BUDGET})`);
      if (!afterDone) ok(m.total <= m.usable, `${tag} 전체 ${m.total} ≤ ${m.usable}`);
      else ok(m.curio && m.slot.top + m.slot.h <= m.usable, `${tag} 결론까지는 한 화면(조작 칸 끝 ${m.slot.top + m.slot.h})`);
      ok(m.stage.top <= 150, `${tag} 무대 시작 ${m.stage.top} ≤ 150`);
      if (slotTop === null) slotTop = m.slot.top;
      ok(m.slot.top === slotTop, `${tag} 조작 칸 자리 ${m.slot.top} = ${slotTop}`);
      ok(!m.helperOver, `${tag} 도움말 두 줄 안: "${m.helperText}"`);
      ok(!m.slotOver, `${tag} 조작 칸 넘침 없음`);
      const small = m.taps.filter((t) => t.h < 48);
      ok(small.length === 0, `${tag} 누르는 곳 48px 이상${small.length ? `: ${small.map((t) => `${t.t}(${t.h})`).join(", ")}` : ""}`);
      ok(m.cut.length === 0, `${tag} 잘린 글자 없음${m.cut.length ? `: ${m.cut.join(" | ")}` : ""}`);
      ok(m.minFont >= view.minFont, `${tag} 무대 글자 ${m.minFont}px ≥ ${view.minFont}${m.minFont < view.minFont ? ` ("${m.minFontText}")` : ""}`);
      ok(m.frameScroll === 0, `${tag} #frame 스크롤 ${m.frameScroll}`);
    };
    await s.lab.play(page, { wrong: true, on });
    console.log(`  ${s.name.padEnd(8)} ${rows.length}시점 최대 ${Math.max(...rows)}px`);
  }
  ok(errors.length === 0, `[${view.name}] 페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ C. 정답 경로 ═════════════════════════════
console.log("\n══ C. 정답 경로 ══");
{
  const { browser, page, errors } = await launchStyled({});
  const DONE = {
    collage: "같은 특징이 많을수록 가까운 사이",
    sketch: "더 많이 살아남아 자손을 남겨요",
    model: "한 구조가 멈추면 그 일도 멈춰요",
  };
  for (const s of SAMPLES) {
    await openLesson(page, s.lab.li);
    await goStep(page, s.lab.si);
    const before = await ctaState(page);
    ok(!before.enabled, `${s.name}: 처음에는 '다음'이 잠겨 있다("${before.text}")`);
    await s.lab.play(page, { on: async (label) => collect(page, `${s.name} 정답 ${label}`) });
    const text = await concluded(page);
    ok((text ?? "").includes(DONE[s.style]), `${s.name}: 결론 "${(text ?? "").slice(0, 30)}"`);
    const after = await ctaState(page);
    ok(after.enabled, `${s.name}: 끝나면 '다음'이 열린다("${after.text}")`);
  }
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ D. 입체 모형 ═════════════════════════════
console.log("\n══ D. 입체 모형 ══");
{
  const { browser, page, errors } = await launchStyled({});
  const model = SAMPLES.find((s) => s.style === "model");
  await openLesson(page, model.lab.li);
  await goStep(page, model.lab.si);
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    ready = (await ds(page, "lsmReady")) === "1";
    if (!ready) await W(page, 150);
  }
  ok(ready, "모형이 준비됐다(three 조각을 내려받아 장면을 지었다)");
  await W(page, 600);
  // 그려졌는가: 무대를 찍어 색이 여러 가지인지 본다(빈 캔버스면 바탕색뿐이다)
  const box = await page.evaluate(() => {
    const r = document.querySelector(".screen.active .lsm-canvas").getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const colors = await page.evaluate(async (b) => {
    // 캔버스의 지금 그림을 2D 캔버스에 옮겨 가운데 줄의 색을 센다(같은 프레임 안에서 옮겨야 그림이 남아 있다)
    const cv = document.querySelector(".screen.active .lsm-canvas");
    return await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
      const c = document.createElement("canvas");
      c.width = 120;
      c.height = 80;
      const g = c.getContext("2d");
      g.drawImage(cv, 0, 0, 120, 80);
      const d = g.getImageData(0, 0, 120, 80).data;
      const set = new Set();
      let opaque = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 200) opaque++;
        set.add(`${d[i] >> 4},${d[i + 1] >> 4},${d[i + 2] >> 4}`);
      }
      res({ kinds: set.size, opaque, w: b.w });
    })));
  }, box);
  ok(colors.kinds >= 12 && colors.opaque > 800, `모형이 그려졌다(색 ${colors.kinds}가지, 불투명한 점 ${colors.opaque}개)`);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  ok((await ds(page, "lsmOff")) === "", "처음에는 아무 구조도 멈춰 있지 않다");
  // 모형의 핵을 누르면 핵이 멈춘다(이끎선의 점이 가리키는 자리 바로 옆, 핵의 가운데를 누른다. 돌리기 전이라 핵 앞을 가리는 것이 없다)
  const nucAt = await page.evaluate(() => {
    const c = document.querySelector('.screen.active .lsm-lines g[data-k="nuc"] circle');
    const r = document.querySelector(".screen.active .lsm-canvas").getBoundingClientRect();
    return { x: r.x + Number(c.getAttribute("cx")) - 14, y: r.y + Number(c.getAttribute("cy")) + 12 };
  });
  await page.mouse.click(nucAt.x, nucAt.y);
  await W(page, 400);
  ok((await ds(page, "lsmOff")) === "nuc", "모형의 핵을 누르면 핵이 멈춘다");
  ok(await page.evaluate(() => document.querySelector('.screen.active .bv-card[data-k="nuc"]').classList.contains("stopped")), "핵 카드도 '멈춤'으로 바뀐다");
  await page.touchscreen.tap(nucAt.x, nucAt.y);
  await W(page, 300);
  ok((await ds(page, "lsmOff")) === "", "다시 누르면(손가락으로) 일한다");
  // 끌면 돈다(실제 마우스 끌기). 끌기는 누르기로 치지 않는다
  await page.mouse.move(cx - 60, cy + 40);
  await page.mouse.down();
  await page.mouse.move(cx - 20, cy + 42, { steps: 4 });
  await page.mouse.move(cx + 50, cy + 44, { steps: 6 });
  await page.mouse.up();
  await W(page, 200);
  ok(await page.evaluate(() => document.querySelector(".screen.active .lsm-stage").classList.contains("turned")), "가로로 끌면 모형이 돈다(끌기 안내가 사라진다)");
  ok((await ds(page, "lsmOff")) === "", "끌기만 해서는 아무 구조도 멈추지 않는다");
  // 스텝을 떠나면 그리기 루프와 WebGL을 반납한다(오류 없이 다른 스텝으로 넘어간다)
  await tap(page, ".xbtn.fwd");
  await W(page, 700);
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

{
  // WebGL을 쓸 수 없는 기기: 입체 모형 대신 정본의 평면 랩이 뜨고, 끝까지 할 수 있다
  const { browser, page, errors } = await launchStyled({ args: ["--disable-3d-apis"] });
  const model = SAMPLES.find((s) => s.style === "model");
  await openLesson(page, model.lab.li);
  await goStep(page, model.lab.si);
  const info = await stepInfo(page);
  ok(!info.step.includes("ls-model") && info.stage.includes("cwk-stage"), `WebGL이 없으면 평면 랩으로 물러난다(${info.stage})`);
  await model.lab.play(page, {});
  ok((await ctaState(page)).enabled, "물러난 평면 랩도 끝까지 된다");
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ E. 화면 글 ═════════════════════════════
console.log("\n══ E. 화면 글 ══");
{
  const RULES = [
    ["대시", /[—–]|(?<=[가-힣a-zA-Z0-9.!?])\s-\s(?=[가-힣a-zA-Z0-9])/],
    ["'교과서'", /교과서/],
    ["출판사 이름", /미래엔|비상교육|천재교육|동아출판|지학사|금성출판|교학사|YBM/],
    ["'분자'", /분자/],
    ["이모지", /\p{Extended_Pictographic}/u],
    ["이 책에 없는 구조 이름", /세포질|액포|리보솜|소포체|골지|리소좀|염색체|소기관/],
    ["'미토콘드리아' 표기", /미토콘드리아/],
    ["금지 개념", /자연선택|진화/],
    ["'스틱맨'", /스틱맨/],
  ];
  const hits = [];
  for (const [line, where] of seen) for (const [name, re] of RULES) if (re.test(line)) hits.push(`${name}: "${line.slice(0, 70)}" (${where})`);
  ok(seen.size > 60, `화면에서 모은 글 ${seen.size}줄`);
  ok(hits.length === 0, `규칙 위반 ${hits.length}건`);
  hits.forEach((h) => console.log("     ", h));
}

console.log(`\n샘플 검사: PASS ${PASS} · FAIL ${FAIL}`);
if (FAIL) {
  console.log(fails.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
