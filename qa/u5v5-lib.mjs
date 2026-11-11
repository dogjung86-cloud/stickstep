// 중1 Ⅴ v5 검사 공용 부품: 열기, 스텝 넘기기, 재기, 무대 끌기, 판정 누르기.
import { launch as baseLaunch, W, waitFor, ctaState, cta, stepType, choose, ds, waitPhase } from "./u2intro-lib.mjs";
export { W, waitFor, ctaState, cta, stepType, choose, ds, waitPhase };

export const PORT = process.env.PORT || "5575";
export const BASE = `http://localhost:${PORT}`;

export async function launch() {
  const { browser, page, errors } = await baseLaunch({ query: null });
  // 다른 세션이 파일을 저장해도 페이지가 다시 읽히지 않게 HMR만 끈다(CSS 주입은 살린다)
  await page.route("**/@vite/client", (r) =>
    r.fulfill({
      contentType: "application/javascript",
      body: `export function updateStyle(id, css){ let el = document.querySelector('style[data-vite-dev-id="' + id + '"]'); if (!el) { el = document.createElement("style"); el.setAttribute("data-vite-dev-id", id); document.head.appendChild(el); } el.textContent = css; }
export function removeStyle(id){ document.querySelector('style[data-vite-dev-id="' + id + '"]')?.remove(); }
export function createHotContext(){ return { accept(){}, acceptExports(){}, dispose(){}, prune(){}, on(){}, off(){}, send(){}, invalidate(){}, data: {} }; }
export function injectQuery(u){ return u; }
export const ErrorOverlay = class {};
export default {};`,
    }),
  );
  return { browser, page, errors };
}

/** 레슨을 바로 연다. on=false면 토글을 끈 채(지금 운영 판). */
export async function openLesson(page, id, on = true) {
  await page.goto(`${BASE}/?${on ? "u5v5" : "u5v5=0"}&open=${id}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !!document.querySelector(".screen.active .step"), null, { timeout: 20000 });
  await page.waitForTimeout(900);
}

/** 검토 모드의 앞으로 가기 화살표로 다음 스텝으로. */
export async function fwd(page) {
  await page.evaluate(() => document.querySelector(".screen.active .xbtn.fwd")?.click());
  await page.waitForTimeout(700);
}

/** 스크롤 영역의 내용 높이와 보이는 높이. */
export const fit = (page) =>
  page.evaluate(() => {
    const sc = document.querySelector(".screen.active .scroll");
    return { content: sc.scrollHeight, view: sc.clientHeight, top: sc.scrollTop };
  });

/** 무대(캔버스 또는 도입 무대) 안의 한 점을 화면 좌표로. fx, fy는 0~1 비율 또는 px(1보다 크면). */
export const stageAt = (page, fx, fy, sel = ".bv-stage") =>
  page.evaluate(({ fx, fy, sel }) => {
    const r = document.querySelector(".screen.active " + sel).getBoundingClientRect();
    return { x: r.left + (fx <= 1 ? fx * r.width : fx), y: r.top + (fy <= 1 ? fy * r.height : fy), w: r.width, h: r.height };
  }, { fx, fy, sel });

export async function drag(page, from, to, { steps = 10, hold = 0, up = true } = {}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    await page.waitForTimeout(16);
  }
  if (hold) await page.waitForTimeout(hold);
  if (up) await page.mouse.up();
}

/** 버튼을 꾹 누른다(실제 포인터). */
export async function holdBtn(page, sel, ms) {
  const r = await page.evaluate((s) => {
    const b = document.querySelector(".screen.active " + s);
    if (!b) return null;
    const q = b.getBoundingClientRect();
    return { x: q.left + q.width / 2, y: q.top + q.height / 2 };
  }, sel);
  if (!r) throw new Error("버튼 없음: " + sel);
  await page.mouse.move(r.x, r.y);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

export const click = (page, sel) => page.evaluate((s) => { const b = document.querySelector(".screen.active " + s); b?.click(); return !!b; }, sel);

/** 랩의 판정 보기가 뜰 때까지 기다린다. */
export const waitAsk = (page, tries = 120) => waitFor(page, () => !!document.querySelector(".screen.active .bv-q.show .bv-choice:not(.gone):not(:disabled)"), null, tries);

/** 판정에서 맞는(또는 틀린) 보기를 누른다. 개발 서버의 data-ok 표식을 쓴다. */
export const answer = (page, ok) =>
  page.evaluate((ok) => {
    const bs = [...document.querySelectorAll(".screen.active .bv-q.show .bv-choice")].filter((b) => !b.disabled);
    const b = bs.find((x) => x.dataset.ok === (ok ? "1" : "0")) ?? bs[0];
    b?.click();
    return b?.textContent ?? null;
  }, ok);
export const next = (page) => click(page, ".bv-next");

/** 화면에 보이는 글을 모은다(금지어 검사용). */
export const texts = (page) =>
  page.evaluate(() => {
    const step = document.querySelector(".screen.active .step");
    const out = [];
    const walk = document.createTreeWalker(step, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.textContent.trim();
      if (t && n.parentElement.getClientRects().length) out.push(t);
    }
    const c = document.querySelector(".screen.active .btn.cta");
    if (c) out.push(c.textContent.trim());
    return out;
  });
