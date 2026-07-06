// radiation — 복사 랩(L3).
// 모닥불의 열이 물질을 거치지 않고 파동처럼 "직접" 날아와 스틱맨을 데운다.
// 변인 1 = 거리: 스틱맨을 끌어 가까이/멀리 — 복사는 멀어질수록 약해진다.
// 변인 2 = 차단: 가림판을 넣으면 '즉시' 사라지고(직진), 빼면 곧바로 되살아난다.
// 목표 배지 3개(다가가기·떨어지기·차단→복구)를 모두 모으면 완료.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { tempColor, drawFlame } from "../../ui/thermo";
import { contactShadow, glassStrokeStyle, softGlow, windStrokeStyle } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface RadiationStep {
  title: string;
  lead?: string;
  cta?: string;
}

export const radiation: StepRenderer = (host, step, api) => {
  const s = step as unknown as RadiationStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "rd-canvas", style: "height:240px" });
  const gaugeFill = el("i", {});
  const gaugeVal = el("b", { text: "0%" });
  const gauge = el(
    "div",
    { class: "cv-gauge rd-gauge" },
    el("span", { text: "따뜻함" }),
    el("div", { class: "cv-gauge-track" }, gaugeFill),
    gaugeVal,
  );
  const distLabel = el("span", { text: "모닥불 곁에서" });
  const hud = el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot" }), distLabel), gauge);
  const stage = el("div", { class: "stage rd-stage" }, canvas, hud);
  const shieldBtn = el("button", { class: "swapbtn", html: "<span>가림판 넣기</span>" });
  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "near" } }, el("b", { text: "바짝 다가가기" }), el("span", { text: "따뜻함은?" })),
    el("div", { class: "pn-badge", dataset: { g: "far" } }, el("b", { text: "멀리 떨어지기" }), el("span", { text: "약해질까?" })),
    el("div", { class: "pn-badge", dataset: { g: "shield" } }, el("b", { text: "차단했다 빼기" }), el("span", { text: "직진 증거" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "불에 <b>닿지 않았는데도</b> 따뜻해요. 스틱맨을 좌우로 끌어 <b>모닥불과의 거리</b>부터 바꿔 보세요.",
  });
  host.append(goalChips, stage, shieldBtn, helper);

  // ---- 상태 ----
  let manX = 0.78; // 화면 비율 좌표
  let shieldOn = false;
  let shieldX = 0.5;
  let shieldDrop = 0; // 삽입 애니메이션 0..1
  let warmth = 0.65;
  let blockedSeen = false;
  let finished = false;
  let dragging: "man" | "shield" | null = null;
  const goals = new Set<string>();

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 1 && id !== "shield") return;
    if (goals.has("near") && goals.has("far") && !goals.has("shield") && !shieldOn)
      helper.innerHTML = "가까우면 후끈, 멀면 미지근 — <b>복사는 멀어질수록 약해져요</b>. 이번엔 <b>가림판</b>을 넣으면 어떻게 될까요?";
  }

  const FIRE_X = 0.17;

  shieldBtn.addEventListener("click", () => {
    haptic(HAPTIC.select);
    shieldOn = !shieldOn;
    if (shieldOn) shieldDrop = 0;
    shieldBtn.innerHTML = `<span>${shieldOn ? "가림판 빼기" : "가림판 넣기"}</span>`;
    if (shieldOn) helper.innerHTML = "가림판을 넣었어요. 따뜻함 게이지를 보세요 — <b>바로</b> 달라지죠?";
  });

  // ---- 드래그(가림판·스틱맨) ----
  function px(e: PointerEvent): number {
    const rect = canvas.getBoundingClientRect();
    return (e.clientX - rect.left) / rect.width;
  }
  canvas.addEventListener("pointerdown", (e) => {
    const x = px(e);
    if (shieldOn && Math.abs(x - shieldX) < 0.09) dragging = "shield";
    else if (Math.abs(x - manX) < 0.13) dragging = "man";
    else return;
    canvas.setPointerCapture(e.pointerId);
    haptic(HAPTIC.tap);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const x = px(e);
    if (dragging === "shield") shieldX = clamp(x, FIRE_X + 0.14, manX - 0.1);
    else manX = clamp(x, 0.52, 0.9);
  });
  const drop = (): void => {
    dragging = null;
  };
  canvas.addEventListener("pointerup", drop);
  canvas.addEventListener("pointercancel", drop);

  // ---- 스틱맨(캔버스 라인 아트) ----
  function drawMan(ctx: CanvasRenderingContext2D, x: number, y: number, warm: number, tMs: number): void {
    const shiver = warm < 0.18 ? Math.sin(tMs / 38) * 1.3 : 0;
    ctx.save();
    ctx.translate(x + shiver, y);
    // 온기 글로우
    if (warm > 0.2) {
      const g = ctx.createRadialGradient(0, -26, 4, 0, -26, 54);
      g.addColorStop(0, tempColor(warm, 0.22 * warm));
      g.addColorStop(1, tempColor(warm, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, -26, 54, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#DCE8FA";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    // 머리
    ctx.beginPath();
    ctx.arc(0, -46, 11, 0, Math.PI * 2);
    ctx.stroke();
    // 표정
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(-3.6, -48, 1.1, 0, Math.PI * 2);
    ctx.moveTo(4.8, -48);
    ctx.arc(3.6, -48, 1.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    if (warm > 0.4) ctx.arc(0, -44.5, 4.4, 0.25, Math.PI - 0.25);
    else {
      ctx.moveTo(-3.4, -41.5);
      ctx.lineTo(3.4, -41.5);
    }
    ctx.stroke();
    // 몸(앉은 자세, 불 쪽으로 손)
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(0, -12);
    ctx.moveTo(0, -28);
    ctx.lineTo(-15, -20);
    ctx.moveTo(0, -26);
    ctx.lineTo(-14, -14);
    ctx.moveTo(0, -12);
    ctx.lineTo(-13, -4);
    ctx.lineTo(-13, 4);
    ctx.moveTo(0, -12);
    ctx.lineTo(9, -3);
    ctx.lineTo(9, 4);
    ctx.stroke();
    // 추울 때 덜덜 마크
    if (warm < 0.18) {
      ctx.strokeStyle = "rgba(160,190,235,.8)";
      ctx.lineWidth = 1.6;
      for (const sx of [-22, 20]) {
        ctx.beginPath();
        ctx.moveTo(sx, -50);
        ctx.lineTo(sx + 4, -46);
        ctx.lineTo(sx, -42);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---- 루프 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 240);
    const fx = FIRE_X * w;
    const fy = h - 46;
    const mx = manX * w;
    const groundY = h - 22;

    // 바닥 — 양끝이 사라지는 그라데이션 스트로크
    ctx.strokeStyle = windStrokeStyle(ctx, 12, w - 12, "150,182,226", 0.3);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(12, groundY + 12);
    ctx.lineTo(w - 12, groundY + 12);
    ctx.stroke();

    if (shieldOn) shieldDrop = clamp(shieldDrop + 0.08 * dt, 0, 1);

    // 차단 여부
    const blocked = shieldOn && shieldDrop > 0.85 && shieldX > FIRE_X && shieldX < manX;

    // 복사 파동(부채꼴 링) — 가림판이 있으면 그 앞에서 잘린다
    ctx.save();
    if (blocked) {
      ctx.beginPath();
      ctx.rect(0, 0, shieldX * w - 10, h);
      ctx.clip();
    }
    const maxR = w * 0.86;
    for (let k = 0; k < 5; k++) {
      const r = ((tMs * 0.055 + (k * maxR) / 5) % maxR) + 14;
      const a = Math.max(0, (1 - r / maxR)) * 0.34;
      ctx.strokeStyle = `rgba(255,159,67,${a.toFixed(3)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(fx, fy - 16, r, -0.72, 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // 모닥불(돌·장작·불꽃) — 접촉 그림자 + 열원 글로우 + 나무 결 그라데이션 + 돌 볼륨
    contactShadow(ctx, fx, fy + 15, 46, 0.32);
    softGlow(ctx, fx, fy - 10, 72, "255,159,67", 0.2 + Math.sin(tMs / 95) * 0.04);
    const logGrad = ctx.createLinearGradient(0, fy - 4, 0, fy + 8);
    logGrad.addColorStop(0, "rgba(226,176,124,.95)");
    logGrad.addColorStop(1, "rgba(136,96,62,.9)");
    ctx.strokeStyle = logGrad;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(fx - 20, fy + 6);
    ctx.lineTo(fx + 20, fy - 2);
    ctx.moveTo(fx - 20, fy - 2);
    ctx.lineTo(fx + 20, fy + 6);
    ctx.stroke();
    // 장작 윗면 하이라이트(불빛을 받는 면)
    ctx.strokeStyle = "rgba(255,214,160,.45)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fx - 19, fy + 4.6);
    ctx.lineTo(fx + 19, fy - 3.4);
    ctx.moveTo(fx - 19, fy - 3.4);
    ctx.lineTo(fx + 19, fy + 4.6);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const ang = Math.PI + (i / 6) * Math.PI;
      const sx = fx + Math.cos(ang) * 30;
      const sy = fy + 10 + Math.sin(ang) * 4;
      const rock = ctx.createRadialGradient(sx - 1.4, sy - 1.7, 0.6, sx, sy, 4.8);
      rock.addColorStop(0, "rgba(198,214,238,.72)");
      rock.addColorStop(1, "rgba(96,116,150,.5)");
      ctx.fillStyle = rock;
      ctx.beginPath();
      ctx.arc(sx, sy, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }
    drawFlame(ctx, fx, fy + 2, 44, tMs);

    // 가림판 — 금속 패널: 접촉 그림자 + 원통 그라데이션 + 그라데이션 테두리 + 스펙큘러
    if (shieldOn) {
      const sx = shieldX * w;
      const dropY = (1 - Math.pow(1 - shieldDrop, 3)) * 0; // 위에서 스르륵
      const top = 26 - (1 - shieldDrop) * 60 + dropY;
      const sh = groundY - top + 8;
      contactShadow(ctx, sx, top + sh + 3, 26, 0.3 * shieldDrop);
      const grd = ctx.createLinearGradient(sx - 8, 0, sx + 8, 0);
      grd.addColorStop(0, "rgba(210,222,240,.85)");
      grd.addColorStop(0.5, "rgba(255,255,255,.95)");
      grd.addColorStop(1, "rgba(180,196,220,.85)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.roundRect(sx - 8, top, 16, sh, 8);
      ctx.fill();
      // 불 쪽(왼쪽) 면 — 복사를 받아 살짝 달아오른 기운
      if (blocked) {
        const heat = ctx.createLinearGradient(sx - 8, 0, sx - 1, 0);
        heat.addColorStop(0, "rgba(255,159,67,.34)");
        heat.addColorStop(1, "rgba(255,159,67,0)");
        ctx.fillStyle = heat;
        ctx.beginPath();
        ctx.roundRect(sx - 8, top, 16, sh, 8);
        ctx.fill();
      }
      ctx.strokeStyle = glassStrokeStyle(ctx, top, top + sh);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(sx - 8, top, 16, sh, 8);
      ctx.stroke();
      // 좌측 스펙큘러 스트릭
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx - 4.6, top + 12);
      ctx.lineTo(sx - 4.6, top + sh - 14);
      ctx.stroke();
      // 드래그 손잡이
      ctx.fillStyle = "rgba(25,31,40,.55)";
      ctx.beginPath();
      ctx.arc(sx, top + 16, 5.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sx - 6.4, top + 16);
      ctx.lineTo(sx + 6.4, top + 16);
      ctx.stroke();
    }

    // 따뜻함 계산 — 복사는 '직진'이라 차단은 즉시, 거리에 따라 약해진다
    const dist = (manX - FIRE_X) * w;
    const distWarm = clamp(1 - (dist - w * 0.3) / (w * 0.6), 0.24, 0.95);
    const target = blocked ? 0.04 : distWarm;
    warmth += (target - warmth) * Math.min(1, (blocked ? 0.3 : 0.12) * dt);

    drawMan(ctx, mx, groundY, warmth, tMs);
    // 드래그 힌트(양방향 화살)
    ctx.strokeStyle = "rgba(160,190,235,.5)";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(mx - 20, groundY + 6);
    ctx.lineTo(mx + 20, groundY + 6);
    ctx.moveTo(mx - 20, groundY + 6);
    ctx.lineTo(mx - 15, groundY + 2.5);
    ctx.moveTo(mx - 20, groundY + 6);
    ctx.lineTo(mx - 15, groundY + 9.5);
    ctx.moveTo(mx + 20, groundY + 6);
    ctx.lineTo(mx + 15, groundY + 2.5);
    ctx.moveTo(mx + 20, groundY + 6);
    ctx.lineTo(mx + 15, groundY + 9.5);
    ctx.stroke();

    // 게이지 + 거리 라벨
    distLabel.textContent = manX < 0.62 ? "모닥불 바로 곁" : manX > 0.82 ? "모닥불에서 멀리" : "모닥불에서 적당히";
    const pct = Math.round(warmth * 100);
    gaugeFill.style.width = `${pct}%`;
    gaugeFill.style.background = tempColor(clamp(warmth, 0, 1));
    gaugeVal.textContent = `${pct}%`;

    // 목표 체크 — ① 거리(가까이/멀리: 과도 상태가 아닌 '그 거리의 평형값' 기준) ② 차단→복구
    if (!blocked && distWarm > 0.85 && warmth > 0.78) collect("near", "후끈!");
    if (!blocked && !shieldOn && distWarm < 0.32 && warmth < 0.36) collect("far", "미지근…");
    if (!blockedSeen && blocked && warmth < 0.1) {
      blockedSeen = true;
      helper.innerHTML =
        "따뜻함이 <b>순식간에 사라졌어요</b>. 복사는 열이 <b>직진</b>으로 오기 때문에, 사이를 막으면 바로 차단돼요. 이제 <b>가림판을 빼</b> 보세요.";
    }
    if (blockedSeen && !goals.has("shield") && !shieldOn && warmth > Math.min(0.5, distWarm - 0.06)) collect("shield", "즉시 복구!");
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "이게 <b>복사</b>예요 — 열이 <b>물질을 통하지 않고 직접</b> 이동해요. 그래서 <b>멀어질수록 약해지고</b>, 사이를 막으면 <b>즉시 끊기죠</b>. 태양의 열도 텅 빈 우주를 건너 지구까지 와요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  });

  api.setCTA("가림판으로 복사를 실험하세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
