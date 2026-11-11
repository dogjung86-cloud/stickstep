// 세포 구조 랩(u2l2)의 무대 검사. 진행은 하나이고 무대는 둘이다(입체 cellStage3d.ts, 평면 cellStageFlat.ts).
//   A. 입체 무대: 동물, 식물 모두 실제로 그려지는가. 손으로 돌릴 수 없는가(안내 글이 없고, 끌어도 돌지 않고, 아무것도 멈추지 않는다).
//      모형 속 구조를 누르면 카드와 같이 멈추는가. 스텝을 떠나면 오류 없이 반납하는가.
//   B. 한 화면: 화면 세 가지에서 처음, 조작 중, 판정, 오답, 정답, 결론이 모두 한 화면 안인가(입체 무대로).
//   C. 평면 무대: WebGL을 쓸 수 없으면 평면 도해로 뜨고 끝까지 되는가. 세션 표식 "ss.cellflat"으로도 평면이 뜨는가.
//   D. 여러 번 열고 닫아도 WebGL 컨텍스트가 쌓이지 않는가.
//   PORT=5567 node qa/check-cell3d.mjs
import { chromium } from "playwright-core";
import { PORT, BUDGET, LABS, openLesson, goStep, W, tap, ds, waitFor, ctaState, measure } from "./u2v5-lib.mjs";

let PASS = 0;
let FAIL = 0;
const fails = [];
const ok = (cond, label) => {
  if (cond) PASS++;
  else {
    FAIL++;
    fails.push(label);
  }
  console.log(cond ? "  ✓" : "  ✗", label);
};
const CELLS = [
  { mode: "animal", name: "동물세포", lab: LABS.find((l) => l.key === "l2-animal"), keys: ["mem", "nuc", "mito"], inner: "nuc", outer: "mem" },
  { mode: "plant", name: "식물세포", lab: LABS.find((l) => l.key === "l2-plant"), keys: ["chl", "wall"], inner: "chl", outer: "wall" },
];

async function open({ width = 390, height = 700, args = [], flat = false } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  const gl = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (/WebGL|context/i.test(m.text()) && (m.type() === "warning" || m.type() === "error")) gl.push(m.text().slice(0, 140));
  });
  await page.addInitScript((f) => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
    if (f) sessionStorage.setItem("ss.cellflat", "1");
  }, flat);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  return { browser, page, errors, gl };
}
const ready = (page) => waitFor(page, () => document.querySelector(".screen.active .step.bv-step")?.dataset.cwkReady === "1");
/** 이름표의 이끎선이 가리키는 점(화면 좌표). 입체 무대가 그리는 점이라, 모형의 그 구조가 화면 어디에 있는지 알려 준다. */
const leadAt = (page, k) =>
  page.evaluate((key) => {
    const c = document.querySelector(`.screen.active .cwm-over g[data-k="${key}"] circle`);
    const r = document.querySelector(".screen.active .cwm-canvas").getBoundingClientRect();
    return { x: r.x + Number(c.getAttribute("cx")), y: r.y + Number(c.getAttribute("cy")) };
  }, k);
/** 캔버스의 지금 그림에서 색의 가짓수와 불투명한 점의 수를 센다(빈 캔버스면 0에 가깝다). */
const painted = (page) =>
  page.evaluate(async () => {
    const cv = document.querySelector(".screen.active .cwm-canvas");
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
      res({ kinds: set.size, opaque });
    })));
  });

// ═════════════════════════════ A. 입체 무대 ═════════════════════════════
console.log("══ A. 입체 무대 ══");
{
  const { browser, page, errors } = await open();
  for (const c of CELLS) {
    await openLesson(page, c.lab.li);
    await goStep(page, c.lab.si);
    ok((await ds(page, "cwkStage")) === "3d" && (await ready(page)), `${c.name}: 입체 무대가 선다(three 조각을 내려받아 장면을 지었다)`);
    await W(page, 500);
    const p = await painted(page);
    ok(p.kinds >= 12 && p.opaque > 800, `${c.name}: 모형이 그려졌다(색 ${p.kinds}가지, 불투명한 점 ${p.opaque}개)`);
    const text = await page.evaluate(() => document.querySelector(".screen.active .bv-stage").textContent);
    ok(!/돌리|돌려/.test(text), `${c.name}: 손으로 돌리라는 안내가 없다`);
    ok((await ds(page, "cwkOff")) === "", `${c.name}: 처음에는 아무 구조도 멈춰 있지 않다`);

    // 끌어도 돌지 않는다: 가로로 길게 끈 뒤에도 구조가 화면의 같은 자리에 있고, 아무것도 멈추지 않는다
    const before = await leadAt(page, c.inner);
    const box = await page.evaluate(() => {
      const r = document.querySelector(".screen.active .cwm-canvas").getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    await page.mouse.move(box.x + box.w * 0.3, box.y + box.h * 0.82);
    await page.mouse.down();
    await page.mouse.move(box.x + box.w * 0.5, box.y + box.h * 0.83, { steps: 5 });
    await page.mouse.move(box.x + box.w * 0.72, box.y + box.h * 0.84, { steps: 6 });
    await page.mouse.up();
    await W(page, 300);
    const after = await leadAt(page, c.inner);
    ok(Math.hypot(after.x - before.x, after.y - before.y) < 6, `${c.name}: 가로로 끌어도 모형이 돌지 않는다(구조의 자리 차이 ${Math.hypot(after.x - before.x, after.y - before.y).toFixed(1)}px)`);
    ok((await ds(page, "cwkOff")) === "", `${c.name}: 끌기만 해서는 아무 구조도 멈추지 않는다`);

    // 모형 속 구조를 누르면 카드와 같이 멈춘다
    const at = await leadAt(page, c.inner);
    const hit = c.inner === "nuc" ? { x: at.x - 14, y: at.y + 12 } : { x: at.x - 6, y: at.y + 6 };
    await page.mouse.click(hit.x, hit.y);
    await W(page, 400);
    ok((await ds(page, "cwkOff")) === c.inner, `${c.name}: 모형의 속 구조를 누르면 그 구조가 멈춘다(${await ds(page, "cwkOff")})`);
    ok(await page.evaluate((k) => document.querySelector(`.screen.active .bv-card[data-k="${k}"]`).classList.contains("stopped"), c.inner), `${c.name}: 카드도 '멈춤'으로 바뀐다`);
    await page.touchscreen.tap(hit.x, hit.y);
    await W(page, 400);
    ok((await ds(page, "cwkOff")) === "", `${c.name}: 다시 누르면(손가락으로) 일한다`);
    // 겉을 가리키는 점은 테두리 바로 위에 있으므로 가운데 쪽으로 6px 들어와서 누른다
    const e0 = await leadAt(page, c.outer);
    const mid = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    const len = Math.hypot(mid.x - e0.x, mid.y - e0.y);
    const edge = { x: e0.x + ((mid.x - e0.x) / len) * 6, y: e0.y + ((mid.y - e0.y) / len) * 6 };
    await page.mouse.click(edge.x, edge.y);
    await W(page, 400);
    ok((await ds(page, "cwkOff")) === c.outer, `${c.name}: 모형의 겉을 누르면 맨 바깥 구조가 멈춘다(${await ds(page, "cwkOff")})`);
    await page.mouse.click(edge.x, edge.y);
    await W(page, 300);

    // 스텝을 떠나면 그리기 루프와 WebGL을 반납한다(오류 없이 다른 스텝으로 넘어간다)
    await tap(page, ".xbtn.fwd");
    await W(page, 700);
  }
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ B. 한 화면 ═════════════════════════════
console.log("\n══ B. 한 화면(입체 무대) ══");
for (const view of [{ w: 390, h: 700, minFont: 12 }, { w: 360, h: 700, minFont: 11 }, { w: 430, h: 932, minFont: 12 }]) {
  const { browser, page, errors } = await open({ width: view.w, height: view.h });
  for (const c of CELLS) {
    await openLesson(page, c.lab.li);
    await goStep(page, c.lab.si);
    await ready(page);
    let slotTop = null;
    let worst = 0;
    const bad = [];
    const marks = [];
    const on = async (label) => {
      const m = await measure(page);
      marks.push(label);
      worst = Math.max(worst, label === "done" ? 0 : m.total);
      if (slotTop === null) slotTop = m.slot.top;
      if (label !== "done" && m.total > m.usable) bad.push(`${label} 전체 ${m.total} > ${m.usable}`);
      if (label === "done" && m.slot.top + m.slot.h > m.usable) bad.push(`done 조작 칸 끝 ${m.slot.top + m.slot.h}`);
      if (m.slot.top !== slotTop) bad.push(`${label} 조작 칸 자리 ${m.slot.top} ≠ ${slotTop}`);
      if (m.helperOver) bad.push(`${label} 도움말 넘침`);
      if (m.slotOver) bad.push(`${label} 조작 칸 넘침`);
      if (m.taps.some((t) => t.h < 48)) bad.push(`${label} 누르는 곳 48px 미만`);
      if (m.cut.length) bad.push(`${label} 잘린 글자 ${m.cut.join("|")}`);
      if (m.minFont < view.minFont) bad.push(`${label} 무대 글자 ${m.minFont}px("${m.minFontText}")`);
      if (m.frameScroll !== 0) bad.push(`${label} #frame 밀림`);
    };
    await c.lab.play(page, { wrong: true, on });
    ok(view.w !== 390 || (await page.evaluate(() => document.querySelector(".screen.active .scroll").clientHeight)) === BUDGET, `[${view.w}×${view.h}] 스크롤 영역 ${BUDGET}`);
    ok(marks.includes("ask-wrong") && marks.includes("ask2-right") && marks.includes("done"), `[${view.w}×${view.h}] ${c.name}: 처음, 조작, 판정, 오답, 정답, 결론을 모두 쟀다(${marks.length}시점)`);
    ok(bad.length === 0, `[${view.w}×${view.h}] ${c.name}: 한 화면 안(최대 ${worst}px)${bad.length ? " · " + bad.join(" / ") : ""}`);
    ok((await ds(page, "cwkStage")) === "3d", `[${view.w}×${view.h}] ${c.name}: 끝까지 입체 무대`);
  }
  ok(errors.length === 0, `[${view.w}×${view.h}] 페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ C. 평면 무대 ═════════════════════════════
console.log("\n══ C. 평면 무대로 물러나기 ══");
for (const how of [{ name: "WebGL을 쓸 수 없는 기기", args: ["--disable-3d-apis"], flat: false }, { name: '세션 표식 "ss.cellflat"', args: [], flat: true }]) {
  const { browser, page, errors } = await open({ args: how.args, flat: how.flat });
  for (const c of CELLS) {
    await openLesson(page, c.lab.li);
    await goStep(page, c.lab.si);
    const info = await page.evaluate(() => {
      const st = document.querySelector(".screen.active .step.bv-step");
      return { stage: st?.dataset.cwkStage, svg: !!st?.querySelector(".bv-stage svg.cwk-svg"), canvas: !!st?.querySelector(".bv-stage canvas"), cls: st?.querySelector(".bv-stage")?.className ?? "" };
    });
    ok(info.stage === "flat" && info.svg && !info.canvas && !info.cls.includes("cwm-stage"), `${how.name} · ${c.name}: 평면 도해가 뜬다`);
    await c.lab.play(page, { wrong: c.mode === "plant" });
    ok((await ctaState(page)).enabled, `${how.name} · ${c.name}: 평면 무대로도 끝까지 된다`);
  }
  ok(errors.length === 0, `${how.name}: 페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

// ═════════════════════════════ D. 열고 닫기 ═════════════════════════════
console.log("\n══ D. 여러 번 열고 닫기 ══");
{
  const { browser, page, errors, gl } = await open();
  let allReady = true;
  for (let i = 0; i < 20; i++) {
    const c = CELLS[i % 2];
    await openLesson(page, c.lab.li);
    await goStep(page, c.lab.si);
    if (!((await ds(page, "cwkStage")) === "3d" && (await ready(page)))) allReady = false;
    await W(page, 150);
  }
  const p = await painted(page);
  ok(allReady && p.kinds >= 12, `스무 번 열고 닫아도 입체 무대가 선다(마지막 그림의 색 ${p.kinds}가지)`);
  ok(gl.length === 0, `WebGL 경고 ${gl.length}건 ${gl.slice(0, 2).join(" / ")}`);
  ok(errors.length === 0, `페이지 오류 ${errors.length}건 ${errors.slice(0, 2).join(" / ")}`);
  await browser.close();
}

console.log(`\n세포 무대 검사: PASS ${PASS} · FAIL ${FAIL}`);
if (FAIL) {
  console.log(fails.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
