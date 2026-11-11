// 랩의 다른 느낌 샘플 검증 공용 부품. 조작은 정본의 것(qa/u2v5-lib.mjs)을 그대로 쓴다:
// 샘플 랩은 정본 랩과 같은 뼈대, 같은 조작부, 같은 표식(data-knl-*, data-bki-*, .cwk-diag)을 지키므로 같은 조작 스크립트로 돈다.
import { chromium } from "playwright-core";
import { LABS } from "./u2v5-lib.mjs";

export * from "./u2v5-lib.mjs";
export const PORT = process.env.PORT || "5567";

/** 샘플 셋: 정본 LABS의 열쇠, 토글 이름, 켜졌을 때 스텝에 붙는 클래스, 꺼졌을 때의 무대 클래스 */
export const SAMPLES = [
  { key: "l8-kin", style: "collage", cls: "ls-collage", base: "knl-stage", name: "종이 콜라주" },
  { key: "l7-beak", style: "sketch", cls: "ls-sketch", base: "bki-stage", name: "손그림 공책" },
  { key: "l2-animal", style: "model", cls: "ls-model", base: "cwk-stage", name: "입체 모형" },
].map((s) => ({ ...s, lab: LABS.find((l) => l.key === s.key) }));

/** 앱을 연다. style: "0"(지금 랩), "1"(샘플 모두), "collage" 등. null이면 아무 표식도 심지 않는다(처음 온 사용자와 같다). */
export async function launchStyled({ width = 390, height = 700, style = "1", args = [] } = {}) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (style !== null) await page.addInitScript((v) => { window.__u2style = v; }, style);
  await page.addInitScript(() => {
    localStorage.setItem("science-app.v1", JSON.stringify({
      version: 1, onboarded: true, grade: "g1", viewGrade: "g1", viewSubject: "sci",
      premium: true, reviewMode: true, goalMin: 10, streak: 1, totalXp: 800, lessons: {}, minigame: {},
    }));
  });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  return { browser, page, errors };
}

/** 지금 스텝의 클래스와 무대 클래스 */
export const stepInfo = (page) =>
  page.evaluate(() => {
    const st = document.querySelector(".screen.active .step.bv-step");
    return { step: st?.className ?? "", stage: st?.querySelector(".bv-stage")?.className ?? "" };
  });

/** 화면에 보이는 글을 줄 단위로 모은다(무대, 도움말, 조작 칸, 판정, 결론). */
export const screenText = (page) =>
  page.evaluate(() => {
    const st = document.querySelector(".screen.active .step.bv-step");
    if (!st) return [];
    const out = new Set();
    const walk = document.createTreeWalker(st, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const t = walk.currentNode.textContent.replace(/\s+/g, " ").trim();
      if (t) out.add(t);
    }
    st.querySelectorAll("[aria-label]").forEach((e) => out.add(e.getAttribute("aria-label")));
    return [...out];
  });
