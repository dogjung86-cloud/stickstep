// nutrientTestLab — 시약병을 시험관으로 끌어다 떨궈 영양소 반응색을 확인하는 캔버스 랩.
//  · 네 시약병(아이오딘·뷰렛·수단 III·베네딕트)을 각각 맞는 음식 시험관 위로 드래그해 방울을 떨군다.
//  · 방울이 닿으면 용액색이 반응색으로 물들고, 베네딕트는 가열 스위치를 켜야 황적색이 된다.
//  · 목표 ① 녹말(청람) ② 단백질(보라) ③ 지방·당류(선홍·황적) 둘 다.
// 조작 실체: 병을 끌어 시험관 입구에 놓으면(drop) 방울 낙하 애니메이션 + 색 전환. 가열은 별도 탭.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { bodyColor, safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface NutrientTestStep { title: string; lead?: string; cta?: string; curio?: Curio }
type TestId = "starch" | "protein" | "fat" | "sugar";

const CVH = 300;
const BASE_W = 360;

interface Tube { id: TestId; food: string; reagent: string; color: string; result: string; needHeat: boolean; }
const TUBES: Tube[] = [
  { id: "starch", food: "밥물", reagent: "아이오딘", color: "#2E4BA8", result: "청람색 — 녹말", needHeat: false },
  { id: "protein", food: "달걀흰자", reagent: "뷰렛", color: "#8B3FA8", result: "보라색 — 단백질", needHeat: false },
  { id: "fat", food: "식용유", reagent: "수단 III", color: "#E23B4B", result: "선홍색 — 지방", needHeat: false },
  { id: "sugar", food: "과일즙", reagent: "베네딕트", color: "#E07B2E", result: "황적색 — 당류", needHeat: true },
];
const TUBE_X = [64, 148, 232, 316]; // 논리 x
const BOTTLE_HOME: [number, number][] = [[52, 250], [136, 250], [220, 250], [304, 250]];

export const nutrientTestLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as NutrientTestStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge body", dataset: { g: "starch" } }, el("b", { text: "녹말" }), el("span", { text: "시약 떨구기" })),
    el("div", { class: "pn-badge body", dataset: { g: "protein" } }, el("b", { text: "단백질" }), el("span", { text: "시약 떨구기" })),
    el("div", { class: "pn-badge body", dataset: { g: "energy" } }, el("b", { text: "지방·당류" }), el("span", { text: "둘 다" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "아래 <b>시약병을 끌어</b> 알맞은 음식 시험관 입구에 떨궈 보세요. 베네딕트를 넣은 시험관은 <b>가열</b>해야 색이 나타나요.",
  });
  const canvas = el("canvas", {
    class: "body-lab-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "네 시험관과 네 시약병이 놓인 실험대. 시약병을 시험관으로 끌어 방울을 떨군다." },
  });
  const readPill = el("span", { text: "시약병을 끌어 보세요" });
  const heatBtn = el("button", { class: "body-lab-btn ntl-heat-btn", attrs: { type: "button" }, text: "가열하기(베네딕트)" }) as HTMLButtonElement;
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div", { class: "stage body-lab-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#E07B2E" }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, stage, heatBtn);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_W;
  const scale = (): number => W / BASE_W;
  const sx = (x: number): number => x * scale();
  const sy = (y: number): number => y * scale();

  const added = new Set<TestId>(); // 시약이 떨어진 시험관
  const revealed = new Set<TestId>(); // 색이 나타난 시험관(가열 필요분 포함)
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let heated = false;
  // 드래그 상태
  let dragIdx = -1;
  const pos: [number, number][] = BOTTLE_HOME.map(([x, y]) => [x, y]);
  const dropAnim = new Map<TestId, number>(); // 방울 낙하 진행(ms)

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  };
  const collect = (id: string, sub: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "모두 확인했어요! <b>아이오딘은 녹말(청람색), 뷰렛은 단백질(보라색), 수단 III은 지방(선홍색), 베네딕트는 가열해 당류(황적색)</b>를 확인해요. 각 시약은 특정 영양소에만 반응해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "소화의 길로 가기");
    }
  };
  const checkReveal = (id: TestId): void => {
    if (id === "starch") collect("starch", "청람색");
    else if (id === "protein") collect("protein", "보라색");
    else if (revealed.has("fat") && revealed.has("sugar")) collect("energy", "선홍·황적색");
  };

  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    for (let i = 0; i < TUBES.length; i++) {
      if (added.has(TUBES[i].id)) continue;
      if (Math.hypot(px - pos[i][0], py - pos[i][1]) < 30) {
        dragIdx = i;
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        readPill.textContent = `${TUBES[i].reagent}를 시험관 위로`;
        return;
      }
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (dragIdx < 0) return;
    const r = canvas.getBoundingClientRect();
    pos[dragIdx] = [(e.clientX - r.left) / scale(), (e.clientY - r.top) / scale()];
  };
  const onUp = (): void => {
    if (dragIdx < 0) return;
    const i = dragIdx;
    const tube = TUBES[i];
    const [bx, by] = pos[i];
    // 시험관 입구(TUBE_X[i], y≈70) 근처에 놓으면 방울 떨어뜨리기
    const overOwn = Math.abs(bx - TUBE_X[i]) < 44 && by < 150;
    // 다른 시험관 위에 놓으면 "반응 없음" 안내(시약 특이성 체험)
    let overOther = -1;
    for (let k = 0; k < TUBES.length; k++) {
      if (k === i) continue;
      if (Math.abs(bx - TUBE_X[k]) < 40 && by < 150) overOther = k;
    }
    if (overOwn) {
      added.add(tube.id);
      dropAnim.set(tube.id, 0);
      haptic(HAPTIC.select);
      if (!tube.needHeat) {
        revealed.add(tube.id);
        toastMsg(tube.result);
        checkReveal(tube.id);
        readPill.textContent = "다른 시약도 떨궈 보세요";
      } else {
        toastMsg("베네딕트를 넣었어요. 이제 가열해야 색이 나타나요");
        readPill.textContent = "가열하기 버튼을 눌러요";
      }
    } else if (overOther >= 0) {
      toastMsg(`${tube.reagent}는 ${TUBES[overOther].food}의 영양소와는 반응하지 않아요`);
    }
    // 제자리로 복귀(아직 안 쓴 병은 홈으로)
    if (!added.has(tube.id)) pos[i] = [...BOTTLE_HOME[i]] as [number, number];
    else pos[i] = [...BOTTLE_HOME[i]] as [number, number];
    dragIdx = -1;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const onHeat = (): void => {
    if (heated) return;
    if (!added.has("sugar")) { toastMsg("먼저 과일즙 시험관에 베네딕트를 떨궈요"); return; }
    heated = true;
    heatBtn.classList.add("done");
    heatBtn.disabled = true;
    revealed.add("sugar");
    haptic(HAPTIC.select);
    toastMsg("가열하니 황적색 — 당류 확인!");
    checkReveal("sugar");
  };
  heatBtn.addEventListener("click", onHeat);

  function drawTube(ctx: CanvasRenderingContext2D, i: number): void {
    const tube = TUBES[i];
    const x = sx(TUBE_X[i]);
    const topY = sy(70);
    const w = sx(44);
    const botY = sy(180);
    // 시험관 유리
    ctx.save();
    ctx.strokeStyle = "rgba(150,180,220,.7)";
    ctx.lineWidth = 2 * scale();
    ctx.fillStyle = "rgba(200,225,255,.08)";
    ctx.beginPath();
    ctx.moveTo(x - w / 2, topY);
    ctx.lineTo(x - w / 2, botY - w / 2);
    ctx.quadraticCurveTo(x - w / 2, botY, x, botY);
    ctx.quadraticCurveTo(x + w / 2, botY, x + w / 2, botY - w / 2);
    ctx.lineTo(x + w / 2, topY);
    ctx.fill();
    ctx.stroke();
    // 용액
    const liqTop = sy(112);
    const filled = revealed.has(tube.id);
    const heating = tube.needHeat && added.has(tube.id) && !revealed.has(tube.id);
    ctx.fillStyle = filled ? tube.color : (added.has(tube.id) ? "rgba(150,180,220,.35)" : "rgba(180,205,240,.5)");
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 2, liqTop);
    ctx.lineTo(x - w / 2 + 2, botY - w / 2);
    ctx.quadraticCurveTo(x - w / 2 + 2, botY - 2, x, botY - 2);
    ctx.quadraticCurveTo(x + w / 2 - 2, botY - 2, x + w / 2 - 2, botY - w / 2);
    ctx.lineTo(x + w / 2 - 2, liqTop);
    ctx.closePath();
    ctx.fill();
    // 라벨(음식명)
    ctx.fillStyle = bodyColor("cell");
    ctx.font = `800 ${11 * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(tube.food, x, sy(200));
    // 가열 불꽃
    if (heating) {
      const fy = botY + sy(6);
      ctx.strokeStyle = "#F0A422";
      ctx.lineWidth = 2.4 * scale();
      ctx.lineCap = "round";
      for (const dx of [-8, 0, 8]) {
        ctx.beginPath();
        ctx.moveTo(x + sx(dx), fy + sy(10));
        ctx.quadraticCurveTo(x + sx(dx) + sx(4), fy, x + sx(dx), fy - sy(6));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBottle(ctx: CanvasRenderingContext2D, i: number, dt: number): void {
    const tube = TUBES[i];
    const [lx, ly] = pos[i];
    const x = sx(lx);
    const y = sy(ly);
    // 방울 낙하 애니메이션
    if (dropAnim.has(tube.id)) {
      const t = (dropAnim.get(tube.id) ?? 0) + dt * 16.7;
      dropAnim.set(tube.id, t);
      const p = clamp(t / 500, 0, 1);
      const dropY = sy(70) + (sy(112) - sy(70)) * p;
      ctx.fillStyle = tube.color;
      ctx.globalAlpha = 1 - p * 0.3;
      ctx.beginPath();
      ctx.arc(sx(TUBE_X[i]), dropY, 5 * scale(), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (p >= 1) dropAnim.delete(tube.id);
    }
    if (added.has(tube.id) && i !== dragIdx) return; // 다 쓴 병은 숨김(단 드래그 중 제외)
    ctx.save();
    ctx.translate(x, y);
    // 병 몸통
    const g = ctx.createLinearGradient(-sx(15), 0, sx(15), 0);
    g.addColorStop(0, tube.color);
    g.addColorStop(0.5, "rgba(255,255,255,.5)");
    g.addColorStop(1, tube.color);
    ctx.fillStyle = i === dragIdx ? tube.color : "rgba(255,255,255,.9)";
    ctx.strokeStyle = tube.color;
    ctx.lineWidth = 2 * scale();
    const bw = sx(30);
    const bh = sy(36);
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void }).roundRect(-bw / 2, -bh / 2, bw, bh, 6 * scale());
    ctx.fill();
    ctx.stroke();
    // 스포이트 뚜껑
    ctx.fillStyle = tube.color;
    ctx.fillRect(-sx(4), -bh / 2 - sy(10), sx(8), sy(10));
    // 라벨(시약명)
    ctx.fillStyle = i === dragIdx ? "#fff" : tube.color;
    ctx.font = `800 ${9.5 * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tube.reagent, 0, sy(2));
    ctx.restore();
  }

  const loop: Loop = createLoop((dt) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    // 실험대 선반
    ctx.fillStyle = "rgba(150,170,200,.22)";
    ctx.fillRect(0, sy(184), W, sy(10));
    for (let i = 0; i < TUBES.length; i++) drawTube(ctx, i);
    // 드래그 중인 병을 맨 위에
    for (let i = 0; i < TUBES.length; i++) if (i !== dragIdx) drawBottle(ctx, i, dt);
    if (dragIdx >= 0) drawBottle(ctx, dragIdx, dt);
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("네 반응을 모두 확인해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    heatBtn.removeEventListener("click", onHeat);
  };
};
