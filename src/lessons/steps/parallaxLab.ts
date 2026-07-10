// parallaxLab — 연주 시차 단계 관측소(중2 VIII L1, 책 282~283쪽).
// 사용자 요구: "연주시차를 단계별로 — 선이 하나씩 그어지며 각 단계 설명".
//   0 지구가 궤도를 공전(무대 소개) → 1 3월 지구 정지 + 시선 ㉮가 자라남 →
//   2 지구가 반년을 마저 돌아 9월로(3월 자리엔 유령) + 시선 ㉯ → 3 두 시선 사이 각 = 시차 →
//   4 절반 강조 = 연주 시차 → 5 별을 위아래로 드래그해 "가까울수록 크다" 체험.
// 각도는 기하로 정확히: 시차각 = 2·atan(궤도 반지름 / (궤도까지 세로 거리)). 과장 모형임을 명시.
// 목표: ① 여섯 달 관측(단계2) ② 연주 시차 찾기(단계4) ③ 가까이·멀리 양 끝 방문(단계5).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ParallaxStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: { q: string; a: string };
}

const CVH = 400; // 캔버스 높이
const BG_Y = 58; // 배경별 자(눈금) y
const ORB_Y = 322; // 공전 궤도 중심 y
const ORB_RY = 20; // 궤도 세로 반지름(원근 납작)
const STAR_NEAR = 206; // 별 y 최댓값(가장 가까이)
const STAR_FAR = 92; // 별 y 최솟값(가장 멀리)
const A_COL = "255,196,90"; // 3월 시선(앰버 — 입사각 관례색)
const B_COL = "126,214,255"; // 9월 시선(시안)
const HALF_COL = "156,168,255"; // 연주 시차(스타 라벤더)

// 단계 대본 — cap(무대 안내)·help(설명 카드)
const SCRIPT: { cap: string; help: string; btn?: string }[] = [
  {
    cap: "지구가 태양 둘레를 돌고 있어요",
    help: "우리의 관측소는 <b>지구</b> — 그런데 지구는 1년에 태양을 한 바퀴 돌아요. <b>여섯 달이 지나면 궤도 반대편</b>, 관측소가 통째로 자리를 옮기는 셈이에요.",
    btn: "3월의 지구에서 관측",
  },
  {
    cap: "3월 — 첫 번째 관측",
    help: "3월의 지구에서 별을 보면, 별은 멀리 있는 <b>배경별 사이 노란 ▼ 위치</b>에 보여요. 이 위치를 기억해 두세요.",
    btn: "여섯 달 뒤 다시 관측",
  },
  {
    cap: "9월 — 궤도 반대편에서",
    help: "여섯 달 뒤, 지구는 궤도 반대편에 왔어요. 같은 별인데 <b>파란 ▼ 위치</b>로 옮겨 보여요! 별이 움직인 게 아니라 <b>우리가 움직여서 방향이 달라진 것</b>이에요.",
    btn: "두 방향의 차이는?",
  },
  {
    cap: "두 시선 사이의 각 = 시차",
    help: "두 관측 방향의 차이를 각으로 나타낸 것이 <b>시차</b>예요. 관측 위치가 멀리 떨어질수록, 물체가 가까울수록 시차는 커져요.",
    btn: "연주 시차는?",
  },
  {
    cap: "시차의 절반 = 연주 시차",
    help: "지구 공전 때문에 생기는 이 시차의 <b>절반</b>을 <b>연주 시차</b>라고 해요. 6개월 간격 관측으로 재고, 절반(태양–별 기준)으로 약속한 거예요. 실제 별의 연주 시차는 <b>1°의 3600분의 1(1″)보다도 작아서</b> 이 그림은 아주 크게 과장했어요.",
    btn: "별을 움직여 실험!",
  },
  {
    cap: "별을 잡고 위(멀리)·아래(가까이)로!",
    help: "이제 <b>별을 드래그</b>해 보세요. 별이 <b>가까울수록 연주 시차가 커지고</b>, 멀수록 작아져요 — 그래서 연주 시차를 재면 <b>별까지의 거리</b>를 알 수 있어요(반비례!).",
  },
];

export const parallaxLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ParallaxStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", {
    class: "mstage-cvblock",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", "aria-label": "연주 시차 관측소. 마지막 단계에서 별을 위아래로 드래그해요." },
  });
  const anglePill = el("div", { class: "pill", style: "display:none" }, el("span", { class: "pdot", style: "background:#9CA8FF" }), el("span", { text: "" }));
  const capEl = el("div", { class: "stage-cap", text: SCRIPT[0].cap });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, anglePill), capEl);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge star", dataset: { g: "two" } }, el("b", { text: "여섯 달 관측" }), el("span", { text: "시선 두 줄" })),
    el("div", { class: "pn-badge star", dataset: { g: "half" } }, el("b", { text: "연주 시차" }), el("span", { text: "절반의 각" })),
    el("div", { class: "pn-badge star", dataset: { g: "dist" } }, el("b", { text: "거리 실험" }), el("span", { text: "가까이·멀리" })),
  );
  const nextBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: SCRIPT[0].btn! }));
  const btnRow = el("div", { class: "gp-controls" }, nextBtn);
  const helper = el("div", { class: "helper", html: SCRIPT[0].help });
  host.append(goalChips, helper, stage, btnRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let W = 340;
  let stepIdx = 0;
  let theta = Math.PI * 0.55; // 지구 공전 각(0=오른쪽 9월, π=왼쪽 3월)
  let thetaTarget: number | null = null; // 단계 1·2에서 수렴 목표
  let growA = 0; // 시선 ㉮ 자라남 0..1
  let growB = 0;
  let growArc = 0; // 시차 호
  let growHalf = 0; // 연주 시차 강조
  let starY = 148; // 별 y(작을수록 멀리)
  let dragging = false;
  let visitedNear = false;
  let visitedFar = false;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  const toastEl = el("div", { class: "toast" });
  stage.appendChild(toastEl);

  const sx = (): number => W / 2;
  const orbR = (): number => Math.min(W * 0.32, 118);
  const earthPos = (th: number): { x: number; y: number } => ({ x: sx() + Math.cos(th) * orbR(), y: ORB_Y + Math.sin(th) * ORB_RY });
  // 시차각(별 꼭짓점) — 기하 그대로
  const fullAngle = (): number => 2 * Math.atan(orbR() / (ORB_Y - starY));

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1900);
  }

  function collect(id: string, subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 지구 공전 궤도의 <b>양 끝에서 본 별의 방향 차(시차)의 절반</b>이 연주 시차 — 별이 <b>가까울수록 크고, 멀수록 작아요</b>. 그래서 연주 시차는 별까지의 <b>거리를 재는 자</b>가 돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  function setStep(i: number): void {
    stepIdx = i;
    capEl.textContent = SCRIPT[i].cap;
    helper.innerHTML = SCRIPT[i].help;
    if (SCRIPT[i].btn) {
      (nextBtn.querySelector("span") as HTMLElement).textContent = SCRIPT[i].btn!;
      nextBtn.style.display = "";
    } else {
      nextBtn.style.display = "none";
    }
    if (i === 1) thetaTarget = Math.PI; // 3월(왼쪽)으로
    if (i === 2) thetaTarget = Math.PI * 2; // 반 바퀴 더 돌아 9월(오른쪽)
    if (i >= 3) anglePill.style.display = "";
    haptic(HAPTIC.tap);
  }
  const onNext = (): void => {
    if (stepIdx < 5) setStep(stepIdx + 1);
  };
  nextBtn.addEventListener("click", onNext);

  // ---- 별 드래그(단계 5) ----
  const onDown = (e: PointerEvent): void => {
    if (stepIdx < 5) return;
    const r = canvas.getBoundingClientRect();
    const py = e.clientY - r.top;
    if (Math.abs(py - starY) > 56) return;
    dragging = true;
    capturePointer(canvas, e);
    canvas.classList.add("dragging");
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const r = canvas.getBoundingClientRect();
    starY = clamp(e.clientY - r.top, STAR_FAR, STAR_NEAR);
  };
  const onUp = (): void => {
    dragging = false;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ---- 그리기 헬퍼 ----
  function drawStarSprite(ctx: CanvasRenderingContext2D, x: number, y: number, rr: number, tMs: number): void {
    const tw = 0.86 + Math.sin(tMs / 420) * 0.14;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rr * 3.2);
    g.addColorStop(0, `rgba(255,236,170,${0.5 * tw})`);
    g.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFE9A8";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 2;
      const rad = i % 2 === 0 ? rr : rr * 0.42;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawEarth(ctx: CanvasRenderingContext2D, x: number, y: number, ghost = false): void {
    ctx.globalAlpha = ghost ? 0.38 : 1;
    const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 11);
    g.addColorStop(0, "#9CD2FF");
    g.addColorStop(0.55, "#3E8EE0");
    g.addColorStop(1, "#1D4E8F");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    // 대륙 힌트
    ctx.fillStyle = "rgba(126,214,150,.75)";
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 2, 3.4, 2.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 3.5, y + 3, 2.4, 1.7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 시선: 지구→별→배경 자까지, grow 비율만큼. 별 앞은 실선, 뒤는 점선(연장선).
  function drawSight(ctx: CanvasRenderingContext2D, ex: number, ey: number, col: string, grow: number): { mx: number } {
    const tx = sx();
    const ty = starY;
    const tBg = (BG_Y - ey) / (ty - ey); // 배경 자까지 파라미터(>1)
    const mx = ex + tBg * (tx - ex);
    const g1 = Math.min(1, grow * 1.6); // 지구→별 먼저
    const g2 = clamp((grow - 0.55) / 0.45, 0, 1); // 별→배경 연장
    ctx.lineCap = "round";
    // 본선(발광 2층)
    ctx.strokeStyle = `rgba(${col},.28)`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + (tx - ex) * g1, ey + (ty - ey) * g1);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${col},.95)`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + (tx - ex) * g1, ey + (ty - ey) * g1);
    ctx.stroke();
    // 연장선(점선)
    if (g2 > 0) {
      ctx.setLineDash([5, 6]);
      ctx.strokeStyle = `rgba(${col},.75)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + (mx - tx) * g2, ty + (BG_Y - ty) * g2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // 배경 자 마커 ▼
    if (g2 >= 1) {
      ctx.fillStyle = `rgba(${col},.95)`;
      ctx.beginPath();
      ctx.moveTo(mx, BG_Y - 4);
      ctx.lineTo(mx - 5.5, BG_Y - 14);
      ctx.lineTo(mx + 5.5, BG_Y - 14);
      ctx.closePath();
      ctx.fill();
    }
    return { mx };
  }

  // ---- 프레임 ----
  let shownAngle = "";
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    const cx = sx();

    // 공전/수렴 운동
    if (stepIdx === 0) {
      theta += dt * 0.014;
      if (theta > Math.PI * 2) theta -= Math.PI * 2;
    } else if (thetaTarget != null) {
      // 목표를 향해 진행 방향(반시계=각 증가)으로만 돌아 "여섯 달이 흐른다"가 몸으로 읽히게
      if (theta > thetaTarget) theta -= Math.PI * 2;
      theta += Math.min(thetaTarget - theta, dt * 0.052 * Math.max(0.25, thetaTarget - theta));
      if (thetaTarget - theta < 0.01) {
        theta = thetaTarget;
        thetaTarget = null;
      }
    }
    // 시선 자라남 — 지구가 관측 위치에 도착한 뒤
    const atA = Math.abs(((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI) < 0.02;
    const atB = Math.abs(((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) < 0.02 || Math.abs(theta - Math.PI * 2) < 0.02;
    if (stepIdx >= 1 && atA && thetaTarget == null) growA = Math.min(1, growA + dt * 0.028);
    if (stepIdx >= 2 && atB && thetaTarget == null) growB = Math.min(1, growB + dt * 0.028);
    if (stepIdx >= 2 && growB >= 1) collect("two", "관측 완료!", "같은 별이 다른 곳에 — 시차 발견!");
    if (stepIdx >= 3) growArc = Math.min(1, growArc + dt * 0.03);
    if (stepIdx >= 4) {
      growHalf = Math.min(1, growHalf + dt * 0.03);
      if (growHalf >= 1) collect("half", "절반의 각!", "시차 ÷ 2 = 연주 시차");
    }
    // 단계 5 거리 실험
    if (stepIdx >= 5) {
      if (starY > STAR_NEAR - 8) visitedNear = true;
      if (starY < STAR_FAR + 8) visitedFar = true;
      if (visitedNear && visitedFar) collect("dist", "반비례!", "가까우면 크게, 멀면 작게!");
    }

    // ── 배경: 배경별 자 ──
    ctx.strokeStyle = "rgba(148,168,196,.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(18, BG_Y);
    ctx.lineTo(W - 18, BG_Y);
    ctx.stroke();
    for (let gx = 28; gx <= W - 28; gx += (W - 56) / 10) {
      ctx.strokeStyle = "rgba(148,168,196,.22)";
      ctx.beginPath();
      ctx.moveTo(gx, BG_Y - 3);
      ctx.lineTo(gx, BG_Y + 3);
      ctx.stroke();
      // 작은 배경별(십자 반짝)
      const bs = 0.6 + ((gx * 7919) % 5) * 0.12;
      ctx.fillStyle = `rgba(214,226,246,${0.5 + 0.3 * Math.sin(tMs / 900 + gx)})`;
      ctx.beginPath();
      ctx.arc(gx, BG_Y - 12 - ((gx * 31) % 14), bs, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(196,212,232,.6)";
    ctx.fillText("멀리 있는 배경별", 18, BG_Y - 24);

    // ── 궤도 + 태양 ──
    ctx.strokeStyle = "rgba(148,168,196,.34)";
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, ORB_Y, orbR(), ORB_RY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const sunG = ctx.createRadialGradient(cx, ORB_Y, 0, cx, ORB_Y, 22);
    sunG.addColorStop(0, "rgba(255,214,120,.9)");
    sunG.addColorStop(0.4, "rgba(255,178,66,.55)");
    sunG.addColorStop(1, "rgba(255,178,66,0)");
    ctx.fillStyle = sunG;
    ctx.beginPath();
    ctx.arc(cx, ORB_Y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFC24D";
    ctx.beginPath();
    ctx.arc(cx, ORB_Y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "600 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,214,138,.85)";
    ctx.fillText("태양", cx, ORB_Y + 36);
    // 3월·9월 위치 라벨(단계 1부터)
    if (stepIdx >= 1) {
      const a = earthPos(Math.PI);
      ctx.fillStyle = `rgba(${A_COL},.9)`;
      ctx.fillText("3월", a.x, a.y + 26);
    }
    if (stepIdx >= 2) {
      const b = earthPos(0);
      ctx.fillStyle = `rgba(${B_COL},.9)`;
      ctx.fillText("9월", b.x, b.y + 26);
    }

    // ── 시선(유령 지구 포함) ──
    let mxA = 0;
    let mxB = 0;
    if (stepIdx >= 1) {
      const a = earthPos(Math.PI);
      if (stepIdx >= 2) drawEarth(ctx, a.x, a.y, true); // 3월의 기억(유령)
      if (growA > 0) mxA = drawSight(ctx, a.x, a.y, A_COL, growA).mx;
    }
    if (stepIdx >= 2 && growB > 0) {
      const b = earthPos(0);
      mxB = drawSight(ctx, b.x, b.y, B_COL, growB).mx;
    }
    void mxA;
    void mxB;

    // ── 시차 호(별 꼭짓점) ──
    const full = fullAngle();
    if (growArc > 0) {
      const baseA = Math.PI / 2; // 별에서 아래(태양 방향)
      const r0 = 40;
      ctx.strokeStyle = "rgba(226,238,255,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, starY, r0, baseA - (full / 2) * growArc, baseA + (full / 2) * growArc);
      ctx.stroke();
      if (growArc >= 1 && stepIdx === 3) {
        ctx.font = "700 11.5px Pretendard, sans-serif";
        ctx.fillStyle = "rgba(226,238,255,.9)";
        ctx.textAlign = "center";
        ctx.fillText("시차", cx, starY + r0 + 16);
      }
    }
    // 연주 시차 = 절반 강조(오른쪽 절반 + 이등분선)
    if (growHalf > 0) {
      const baseA = Math.PI / 2;
      const r1 = 40;
      // 이등분선(별→태양, 점선)
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = `rgba(${HALF_COL},.6)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, starY + 12);
      ctx.lineTo(cx, starY + (ORB_Y - starY - 26) * growHalf + 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = `rgba(${HALF_COL},.95)`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(cx, starY, r1, baseA, baseA + (full / 2) * growHalf);
      ctx.stroke();
      if (growHalf >= 0.99) {
        ctx.font = "700 11.5px Pretendard, sans-serif";
        ctx.fillStyle = `rgba(${HALF_COL},.95)`;
        ctx.textAlign = "right";
        ctx.fillText("연주 시차", cx - 14, starY + r1 + 16);
      }
    }

    // ── 별(+단계5 드래그 핸들) ──
    drawStarSprite(ctx, cx, starY, 11, tMs);
    if (stepIdx >= 5) {
      const pul = 16 + Math.sin(tMs / 300) * 2.5;
      ctx.strokeStyle = dragging ? "rgba(255,236,170,.9)" : "rgba(255,236,170,.5)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(cx, starY, pul, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // 위아래 힌트 화살표
      if (!dragging) {
        ctx.fillStyle = "rgba(255,236,170,.7)";
        for (const dir of [-1, 1]) {
          const ay = starY + dir * (pul + 12);
          ctx.beginPath();
          ctx.moveTo(cx, ay + dir * 6);
          ctx.lineTo(cx - 5, ay);
          ctx.lineTo(cx + 5, ay);
          ctx.closePath();
          ctx.fill();
        }
      }
      // 거리 라벨
      ctx.font = "600 10.5px Pretendard, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(196,212,232,.55)";
      ctx.fillText("멀리 ↑", W - 20, STAR_FAR - 6);
      ctx.fillText("가까이 ↓", W - 20, STAR_NEAR + 22);
    }

    // ── 지구(현재) ──
    const e = earthPos(theta);
    drawEarth(ctx, e.x, e.y);

    // HUD — 연주 시차 각(절반) 표기
    const halfDeg = ((full / 2) * 180) / Math.PI;
    const txt = stepIdx >= 4 ? `연주 시차 ${halfDeg.toFixed(0)}° (과장 모형)` : `시차 ${(halfDeg * 2).toFixed(0)}° (과장 모형)`;
    if (txt !== shownAngle) {
      shownAngle = txt;
      (anglePill.lastElementChild as HTMLElement).textContent = txt;
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, CVH);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("단계를 하나씩 진행해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    nextBtn.removeEventListener("click", onNext);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
