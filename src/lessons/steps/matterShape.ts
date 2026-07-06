// matterShape — 그릇 랩(IV 단원 L2). 프로토타입 labShape의 계승 + 메타볼 무대.
// 고체/액체/기체를 고르고 그릇(컵↔접시)을 바꿔 본다:
//   고체 = 모양 유지 · 액체 = 그릇 모양대로, 부피 그대로 · 기체 = 공간 전체를 채움.
// 상태 2가지 이상 + 그릇 바꾸기 1번이면 목표 달성.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { createMatterStage } from "../../ui/matterStage";
import { colFor } from "../../renderers/palette";
import { icon } from "../../core/icons";
import { contactShadow, glassStrokeStyle } from "../../ui/labProps";
import type { SimBounds } from "../../engine/matterSim";
import type { StepRenderer } from "../types";

interface MatterShapeStep {
  title: string;
  lead?: string;
  cta?: string;
}

const PRESET = {
  sol: { T: -12, name: "고체", word: "얼음" },
  liq: { T: 24, name: "액체", word: "물" },
  gas: { T: 112, name: "기체", word: "수증기" },
} as const;
type StateKey = keyof typeof PRESET;

function cupWalls(w: number, h: number): SimBounds {
  const cw = Math.min(w * 0.46, 170);
  return { x0: (w - cw) / 2, y0: h * 0.24, x1: (w + cw) / 2, y1: h - 14 };
}
function dishWalls(w: number, h: number): SimBounds {
  const cw = w * 0.86;
  return { x0: (w - cw) / 2, y0: h * 0.6, x1: (w + cw) / 2, y1: h - 14 };
}

/** 그릇 벽 — 유리 재질(그라데이션 벽 + 스펙큘러 + 림 틱), 열린 윗면은 점선(프로토타입 계승). */
function drawContainer(ctx: CanvasRenderingContext2D, b: SimBounds): void {
  contactShadow(ctx, (b.x0 + b.x1) / 2, b.y1 + 12, (b.x1 - b.x0) * 0.6, 0.26);
  const r = 8;
  ctx.strokeStyle = glassStrokeStyle(ctx, b.y0, b.y1 + 4);
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(b.x0 - 4, b.y0);
  ctx.lineTo(b.x0 - 4, b.y1 + 4 - r);
  ctx.quadraticCurveTo(b.x0 - 4, b.y1 + 4, b.x0 - 4 + r, b.y1 + 4);
  ctx.lineTo(b.x1 + 4 - r, b.y1 + 4);
  ctx.quadraticCurveTo(b.x1 + 4, b.y1 + 4, b.x1 + 4, b.y1 + 4 - r);
  ctx.lineTo(b.x1 + 4, b.y0);
  ctx.stroke();
  // 좌측 스펙큘러 + 림 틱
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(b.x0 + 1, b.y0 + 10);
  ctx.lineTo(b.x0 + 1, b.y1 - 10);
  ctx.stroke();
  ctx.strokeStyle = "rgba(226,240,255,.9)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(b.x0 - 7, b.y0);
  ctx.lineTo(b.x0 + 2, b.y0);
  ctx.moveTo(b.x1 - 2, b.y0);
  ctx.lineTo(b.x1 + 7, b.y0);
  ctx.stroke();
  // 열린 윗면(점선)
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = "rgba(178,204,238,.35)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(b.x0 + 6, b.y0);
  ctx.lineTo(b.x1 - 6, b.y0);
  ctx.stroke();
  ctx.setLineDash([]);
}

export const matterShape: StepRenderer = (host, step, api) => {
  const s = step as unknown as MatterShapeStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  let shape: "cup" | "dish" = "cup";

  const stage = createMatterStage({
    height: "min(280px,34dvh)",
    sim: { count: 40, r: 6, temp: PRESET.sol.T, cols: 8, walls: cupWalls },
    overlay: (ctx) => drawContainer(ctx, stage.sim.bounds()),
  });
  const stDot = el("span", { class: "pdot" });
  const stName = el("span", { text: "고체" });
  const stWord = el("div", { class: "tempread", style: "font-size:20px", text: "얼음" });
  stage.hud.append(el("div", { class: "pill" }, stDot, stName), stWord);

  // ---- 상태 세그먼트 + 그릇 바꾸기 ----
  const seg = el("div", { class: "seg" });
  const segBtns = new Map<StateKey, HTMLButtonElement>();
  (Object.keys(PRESET) as StateKey[]).forEach((key) => {
    const b = el("button", {
      class: key === "sol" ? "on" : "",
      text: PRESET[key].name,
      attrs: { type: "button", "aria-pressed": String(key === "sol") },
    });
    seg.appendChild(b);
    segBtns.set(key, b);
  });
  const swapLabel = el("span", { style: "color:var(--faint);font-weight:600", text: "컵 → 접시" });
  const swapBtn = el(
    "button",
    { class: "swapbtn", attrs: { type: "button" } },
    el("span", { html: icon("swap", 17) }),
    el("span", { text: "그릇 바꾸기 " }),
    swapLabel,
  );
  const helper = el("div", { class: "helper" });
  host.append(stage.el, seg, swapBtn, helper);

  // ---- 상태 ----
  let cur: StateKey = "sol";
  const tried = new Set<StateKey>(["sol"]);
  let swapped = false;
  let finished = false;

  const HELPERS: Record<StateKey, string> = {
    sol: "<b>모양 유지.</b> 그릇이 바뀌어도 고체는 자기 모양을 그대로 지켜요.",
    liq: "<b>모양은 그릇대로, 부피는 그대로.</b> 담기는 모습만 바뀌고 양은 똑같아요.",
    gas: "<b>모양도 부피도 자유롭게.</b> 뚜껑 있는 그릇 안이라면, 공간 전체를 가득 채워요.",
  };

  function refresh(): void {
    const p = PRESET[cur];
    stName.textContent = p.name;
    stWord.textContent = p.word;
    stDot.style.background = colFor(p.T, 66, 1);
    stDot.style.boxShadow = `0 0 8px ${colFor(p.T, 60, 0.8)}`;
    swapLabel.textContent = shape === "cup" ? "컵 → 접시" : "접시 → 컵";
    if (!finished) helper.innerHTML = HELPERS[cur];
    stage.setTemp(p.T);
    if (!finished && tried.size >= 2 && swapped) {
      finished = true;
      helper.innerHTML =
        "확인 완료! 고체는 <b>모양·부피 모두 일정</b>, 액체는 <b>모양만 그릇대로</b>, 기체는 <b>모양도 부피도 그릇대로</b>예요. 입자가 자유로울수록 그릇에 몸을 맞추죠.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "계속하기");
    }
  }

  segBtns.forEach((b, key) => {
    b.addEventListener("click", () => {
      if (key === cur) return;
      segBtns.forEach((x, k) => {
        x.classList.toggle("on", k === key);
        x.setAttribute("aria-pressed", String(k === key));
      });
      cur = key;
      tried.add(key);
      haptic(HAPTIC.tap);
      refresh();
    });
  });
  swapBtn.addEventListener("click", () => {
    shape = shape === "cup" ? "dish" : "cup";
    swapped = true;
    haptic(10);
    stage.sim.setWalls(shape === "cup" ? cupWalls : dishWalls);
    stage.toast(shape === "cup" ? "좁고 깊은 컵으로" : "넓고 얕은 접시로");
    refresh();
  });

  // ---- 루프 ----
  const loop: Loop = createLoop((dt, tMs) => stage.tick(dt, tMs));
  const onResize = (): void => stage.resize();
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    stage.resize();
    stage.sim.buildLattice(true);
    refresh();
    loop.start();
  });

  api.setCTA("상태와 그릇을 바꿔 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
    stage.dispose();
  };
};
