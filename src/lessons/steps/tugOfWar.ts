// tugOfWar — 힘의 평형 랩(V 단원 L2). 스틱맨 줄다리기.
//   · 좌우 팀에 스틱맨을 넣고 빼면(1명 = 100 N) 합력만큼 줄이 실제로 끌려간다
//   · 알짜힘 화살표(빨강)가 실시간 — 반대 방향 힘은 빼기, 같은 쪽은 더하기 (교과서 V-3)
//   · 두 팀이 같아지는 순간 알짜힘 0 = 힘의 평형 — 줄이 멈춘다 (조건: 크기 같음+방향 반대+한 줄)
// 목표: ① 오른쪽 승리 ② 왼쪽 승리 ③ 평형 만들기(줄 정지 유지).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawStickman, posePull } from "../../ui/stick";
import { drawRope, drawForceArrow, drawGround } from "../../ui/forceProps";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface TugStep {
  title: string;
  lead?: string;
  cta?: string;
}

const N_PER = 100; // 한 명 = 100 N

export const tugOfWar: StepRenderer = (host, step, api) => {
  const s = step as unknown as TugStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  // ---- 무대 ----
  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:232px" });
  const netVal = el("span", { text: "0" });
  const netPill = el("span", { text: "알짜힘 0 N — 아직 아무도 없어요" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F25757" }), netPill),
      el("div", { class: "tempread" }, netVal, el("small", { text: " N" })),
    ),
    toastEl,
  );

  // ---- 팀 컨트롤 ----
  function stepper(label: string, color: string): { root: HTMLElement; minus: HTMLButtonElement; plus: HTMLButtonElement; count: HTMLElement } {
    const minus = el("button", { class: "tg-btn", text: "−", attrs: { type: "button", "aria-label": `${label} 한 명 빼기` } });
    const plus = el("button", { class: "tg-btn", text: "+", attrs: { type: "button", "aria-label": `${label} 한 명 넣기` } });
    const count = el("b", { text: "0명" });
    const root = el(
      "div",
      { class: "tg-ctrl" },
      el("span", { class: "tg-dot", style: `background:${color}` }),
      el("span", { class: "tg-name", text: label }),
      minus,
      count,
      plus,
    );
    return { root, minus, plus, count };
  }
  const leftC = stepper("왼쪽 팀", "#37C08E");
  const rightC = stepper("오른쪽 팀", "#4EA3F5");
  const controls = el("div", { class: "tg-controls" }, leftC.root, rightC.root);

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge force", dataset: { g: "right" } }, el("b", { text: "오른쪽 승리" }), el("span", { text: "알짜힘 →" })),
    el("div", { class: "pn-badge force", dataset: { g: "left" } }, el("b", { text: "왼쪽 승리" }), el("span", { text: "알짜힘 ←" })),
    el("div", { class: "pn-badge force", dataset: { g: "bal" } }, el("b", { text: "힘의 평형" }), el("span", { text: "알짜힘 0" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "<b>+</b> 버튼으로 양 팀에 사람을 넣어 보세요. 한 명이 당기는 힘은 <b>100 N</b>이에요.",
  });
  host.append(goalChips, stage, controls, helper);

  // ---- 상태 ----
  let nL = 0;
  let nR = 0;
  let ribbonX = 0; // 리본의 중앙 이탈(px)
  let vx = 0;
  let balancedMs = 0;
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  function announce(): void {
    const L = nL * N_PER;
    const R = nR * N_PER;
    const net = R - L;
    netVal.textContent = String(Math.abs(net));
    if (nL + nR === 0) netPill.textContent = "알짜힘 0 N — 아직 아무도 없어요";
    else if (net === 0) netPill.textContent = `${L} N ↔ ${R} N — 힘의 평형!`;
    else netPill.textContent = `알짜힘 ${Math.abs(net)} N ${net > 0 ? "→" : "←"} (${R} N − ${L} N)`;
  }

  function collect(id: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    (goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    toast(msg);
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "완벽해요! 반대 방향 두 힘의 합력은 <b>큰 힘 − 작은 힘</b>, 방향은 <b>큰 힘 쪽</b>. 그리고 크기가 같아지면 알짜힘이 0 — 아무리 세게 당겨도 줄은 <b>움직이지 않아요</b>. 이게 <b>힘의 평형</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    } else if (!finished) {
      const remain: string[] = [];
      if (!goals.has("right")) remain.push("오른쪽 승리");
      if (!goals.has("left")) remain.push("왼쪽 승리");
      if (!goals.has("bal")) remain.push("힘의 평형");
      helper.innerHTML = `좋아요! 다음 목표: <b>${remain[0]}</b>${remain.length > 1 ? ` (남은 목표 ${remain.length}개)` : ""}`;
    }
  }

  function setCount(side: "L" | "R", delta: number): void {
    if (side === "L") nL = clamp(nL + delta, 0, 4);
    else nR = clamp(nR + delta, 0, 4);
    leftC.count.textContent = `${nL}명`;
    rightC.count.textContent = `${nR}명`;
    haptic(HAPTIC.tap);
    announce();
    if (!goals.has("bal") && nL + nR > 0 && nL === nR) {
      // 평형 후보 — 정지 유지 시간은 루프에서 잰다
      helper.innerHTML = "양쪽이 똑같아요! 줄이 <b>멈추는지</b> 잠깐 지켜보세요…";
    }
  }
  leftC.minus.addEventListener("click", () => setCount("L", -1));
  leftC.plus.addEventListener("click", () => setCount("L", 1));
  rightC.minus.addEventListener("click", () => setCount("R", -1));
  rightC.plus.addEventListener("click", () => setCount("R", 1));

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const { ctx, w, h } = fitCanvas(canvas, 232);
    const groundY = h * 0.8;
    const ropeY = groundY - 34;
    const winDist = w * 0.16;

    // 물리: 알짜힘 → 리본 가속. 평형이면 감쇠 정지.
    const net = (nR - nL) * N_PER;
    vx += (net / 900) * dt;
    vx *= Math.pow(0.94, dt);
    ribbonX += vx * dt;
    ribbonX = clamp(ribbonX, -winDist - 26, winDist + 26);

    // 승리 판정
    if (!finished && Math.abs(ribbonX) > winDist && nL + nR > 0) {
      if (ribbonX > 0) collect("right", "오른쪽 팀 승리 — 알짜힘이 오른쪽!");
      else collect("left", "왼쪽 팀 승리 — 알짜힘이 왼쪽!");
      ribbonX = 0;
      vx = 0;
    }
    // 평형 판정: 양쪽 같고(0명 제외) 리본 거의 정지 1.4초
    if (nL === nR && nL > 0 && Math.abs(vx) < 0.05) {
      balancedMs += dt * 16.7;
      if (balancedMs > 1400) collect("bal", "알짜힘 0 — 힘의 평형이에요!");
    } else {
      balancedMs = 0;
    }

    // ---- 그리기 ----
    drawGround(ctx, w, groundY, h);
    // 중앙선
    ctx.strokeStyle = "rgba(216,232,252,.4)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(w / 2, ropeY - 46);
    ctx.lineTo(w / 2, groundY + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    // 승리선
    for (const sx of [w / 2 - winDist, w / 2 + winDist]) {
      ctx.strokeStyle = "rgba(240,164,34,.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx, groundY - 8);
      ctx.lineTo(sx, groundY + 6);
      ctx.stroke();
    }

    // 스틱맨 배치 — 리본과 함께 끌려간다
    const effL = nR > 0 || nL > 0 ? clamp(nL / 4 + 0.25, 0, 1) : 0;
    const effR = nR > 0 || nL > 0 ? clamp(nR / 4 + 0.25, 0, 1) : 0;
    const handsL: { x: number; y: number }[] = [];
    const handsR: { x: number; y: number }[] = [];
    const SP = Math.min(46, w * 0.11);
    for (let i = 0; i < nL; i++) {
      const bx = w / 2 - 78 - i * SP + ribbonX;
      contactShadow(ctx, bx, groundY + 4, 26, 0.22);
      const j = drawStickman(ctx, bx, groundY, 74, posePull(effL, tMs, i * 3 + 1), { flip: false, face: "dot" });
      handsL.push(j.handF);
    }
    for (let i = 0; i < nR; i++) {
      const bx = w / 2 + 78 + i * SP + ribbonX;
      contactShadow(ctx, bx, groundY + 4, 26, 0.22);
      const j = drawStickman(ctx, bx, groundY, 74, posePull(effR, tMs, i * 3 + 2), { flip: true, face: "dot" });
      handsR.push(j.handF);
    }

    // 밧줄 — 양 팀 첫 사람 손 사이(없으면 기본 위치)
    const ends = {
      lx: handsL[0]?.x ?? w / 2 - 90 + ribbonX,
      ly: handsL[0]?.y ?? ropeY,
      rx: handsR[0]?.x ?? w / 2 + 90 + ribbonX,
      ry: handsR[0]?.y ?? ropeY,
    };
    const tension = nL > 0 && nR > 0 ? 0.92 : nL + nR > 0 ? 0.55 : 0.25;
    drawRope(ctx, ends.lx, ends.ly, ends.rx, ends.ry, tension, tMs);
    // 리본(중앙 표시)
    const ribX = (ends.lx + ends.rx) / 2;
    const ribY = (ends.ly + ends.ry) / 2 + (1 - tension) * 9;
    ctx.fillStyle = "#F25757";
    ctx.beginPath();
    ctx.moveTo(ribX, ribY + 2);
    ctx.lineTo(ribX - 5, ribY + 16);
    ctx.lineTo(ribX + 5, ribY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 힘 화살표 — 왼쪽 합(초록←), 오른쪽 합(파랑→), 알짜힘(빨강, 중앙 위)
    const arrowY = ropeY - 52;
    const scaleN = 0.16;
    ctx.font = "700 11.5px Pretendard, sans-serif";
    if (nL > 0) {
      const len = nL * N_PER * scaleN;
      drawForceArrow(ctx, w / 2 - 8, arrowY, -len, 0, { color: "#37C08E", width: 4 });
      ctx.fillStyle = "#7BE0B8";
      ctx.textAlign = "right";
      ctx.fillText(`${nL * N_PER} N`, w / 2 - 14 - len, arrowY + 18);
    }
    if (nR > 0) {
      const len = nR * N_PER * scaleN;
      drawForceArrow(ctx, w / 2 + 8, arrowY, len, 0, { color: "#4EA3F5", width: 4 });
      ctx.fillStyle = "#9CC8F5";
      ctx.textAlign = "left";
      ctx.fillText(`${nR * N_PER} N`, Math.min(w / 2 + 14 + len, w - 52), arrowY + 18);
    }
    if (net !== 0 && nL + nR > 0) {
      drawForceArrow(ctx, w / 2, arrowY - 30, net * scaleN, 0, { color: "#F25757", width: 4.6, label: `알짜힘 ${Math.abs(net)} N` });
    } else if (nL > 0 && nL === nR) {
      ctx.font = "700 12px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFD98A";
      ctx.fillText("알짜힘 0 — 평형", w / 2, arrowY - 34);
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 232);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("세 가지 목표를 모두 달성하세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
