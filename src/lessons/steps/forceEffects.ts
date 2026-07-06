// forceEffects — 힘이 물체에 주는 네 가지 효과를 상황 애니메이션으로 수집한다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { contactShadow } from "../../ui/labProps";
import type { StepRenderer } from "../types";

interface ForceEffectsStep {
  title: string;
  lead?: string;
  cta?: string;
}

type BadgeId = "shape" | "start" | "stop" | "direction";
type CaseId = "can" | "golf" | "baseball" | "volleyball";

const TAU = Math.PI * 2;
const ANIM_MS = 1200;

const BADGES: { id: BadgeId; name: string; desc: string }[] = [
  { id: "shape", name: "모양 변화", desc: "찌그러짐" },
  { id: "start", name: "움직이기 시작", desc: "출발" },
  { id: "stop", name: "멈추기", desc: "정지" },
  { id: "direction", name: "방향 바뀜", desc: "꺾임" },
];

const CASES: { id: CaseId; label: string; badge: BadgeId; toast: string }[] = [
  { id: "can", label: "캔 쥐기", badge: "shape", toast: "모양 변화 배지" },
  { id: "golf", label: "골프공 치기", badge: "start", toast: "움직이기 시작 배지" },
  { id: "baseball", label: "야구공 받기", badge: "stop", toast: "멈추기 배지" },
  { id: "volleyball", label: "배구공 받아치기", badge: "direction", toast: "방향 바뀜 배지" },
];

interface ActiveAnim {
  id: CaseId;
  badge: BadgeId;
  elapsed: number;
  awarded: boolean;
}

export const forceEffects: StepRenderer = (host, step, api) => {
  const s = step as unknown as ForceEffectsStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const badgeEls = new Map<BadgeId, HTMLElement>();
  const badges = el("div", { class: "pn-badges" });
  for (const b of BADGES) {
    const chip = el(
      "div",
      { class: "pn-badge force", attrs: { "aria-label": `${b.name} — ${b.desc}` } },
      el("b", { text: b.name }),
      el("span", { text: b.desc }),
    );
    badges.appendChild(chip);
    badgeEls.set(b.id, chip);
  }

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:240px" });
  const toastEl = el("div", { class: "toast" });
  const modeText = el("span", { text: "상황을 선택해요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#F0A422" }), modeText),
    ),
    toastEl,
    el("div", { class: "stage-cap", text: "빨간 화살표가 힘이 작용하는 순간이에요" }),
  );

  const cases = el("div", { class: "fe-cases" });
  const caseBtns = new Map<CaseId, HTMLButtonElement>();
  for (const c of CASES) {
    const btn = el("button", { class: "fe-case", attrs: { type: "button" }, text: c.label });
    btn.addEventListener("click", () => play(c.id));
    cases.appendChild(btn);
    caseBtns.set(c.id, btn);
  }

  const helper = el("div", {
    class: "helper",
    html: "네 가지 상황을 눌러 힘이 물체의 <b>무엇을 바꾸는지</b> 모아 보세요.",
  });
  host.append(badges, stage, cases, helper);

  const got = new Set<BadgeId>();
  let active: ActiveAnim | null = null;
  let finished = false;
  let toastTimer = 0;

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1500);
  }

  function play(id: CaseId): void {
    const c = CASES.find((x) => x.id === id)!;
    active = { id, badge: c.badge, elapsed: 0, awarded: false };
    modeText.textContent = c.label;
    caseBtns.forEach((b, key) => b.classList.toggle("on", key === id));
    haptic(HAPTIC.tap);
  }

  function collect(id: BadgeId): void {
    const badge = BADGES.find((b) => b.id === id)!;
    if (got.has(id)) {
      toast(`${badge.name}은 이미 모았어요`);
      haptic(HAPTIC.cross);
      return;
    }
    got.add(id);
    badgeEls.get(id)!.classList.add("on");
    toast(CASES.find((c) => c.badge === id)!.toast);
    haptic(HAPTIC.ctaUnlock);
    if (got.size === BADGES.length && !finished) {
      finished = true;
      helper.innerHTML =
        "수집 완료! 힘은 물체의 <b>모양</b>을 바꾸거나, <b>움직이기 시작</b>하게 하거나, <b>멈추게</b> 하거나, <b>방향</b>을 바꿀 수 있어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음 — 화살표로 그리기");
    } else if (!finished) {
      helper.innerHTML = `${got.size}개 모았어요. 남은 상황도 눌러 보세요.`;
    }
  }

  const loop: Loop = createLoop((dt) => {
    const { ctx, w, h } = fitCanvas(canvas, 240);
    drawFloor(ctx, w, h);
    if (active) {
      active.elapsed += dt * 16.7;
      const p = clamp(active.elapsed / ANIM_MS, 0, 1);
      if (!active.awarded && p >= 0.55) {
        active.awarded = true;
        collect(active.badge);
      }
      drawCase(ctx, w, h, active.id, p);
      if (p >= 1 && active.elapsed > ANIM_MS + 360) active = null;
    } else {
      drawIdle(ctx, w, h);
    }
  });

  const onResize = (): void => {
    fitCanvas(canvas, 240);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    fitCanvas(canvas, 240);
    loop.start();
  });

  api.setCTA("네 가지 상황을 모두 눌러 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};

function ease(t: number): number {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
}

function drawFloor(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const g = ctx.createLinearGradient(0, h * 0.58, 0, h);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(110,140,184,.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.56, w, h * 0.44);
}

function drawIdle(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const y = h * 0.58;
  drawCan(ctx, w * 0.26, y + 38, 0);
  drawBall(ctx, w * 0.54, y + 22, 14, "#EAF2FF", "#8FB3E8");
  drawGlove(ctx, w * 0.76, y + 26, 0.85);
}

function drawCase(ctx: CanvasRenderingContext2D, w: number, h: number, id: CaseId, p: number): void {
  if (id === "can") drawCanCase(ctx, w, h, p);
  else if (id === "golf") drawGolfCase(ctx, w, h, p);
  else if (id === "baseball") drawBaseballCase(ctx, w, h, p);
  else drawVolleyballCase(ctx, w, h, p);
}

function drawCanCase(ctx: CanvasRenderingContext2D, w: number, h: number, p: number): void {
  const cx = w / 2;
  const baseY = h * 0.73;
  const crush = ease((p - 0.25) / 0.45);
  drawCan(ctx, cx, baseY, crush);
  const a = pulseAlpha(p, 0.18, 0.66);
  drawForceArrow(ctx, cx - 76, baseY - 44, 42, 0, a);
  drawForceArrow(ctx, cx + 76, baseY - 44, -42, 0, a);
  drawHand(ctx, cx - 104, baseY - 40, 1);
  drawHand(ctx, cx + 104, baseY - 40, -1);
}

function drawGolfCase(ctx: CanvasRenderingContext2D, w: number, h: number, p: number): void {
  const ground = h * 0.72;
  const move = ease((p - 0.35) / 0.5);
  const x = w * 0.28 + move * w * 0.46;
  const y = ground - 18;
  drawClub(ctx, w * 0.2 + Math.min(p, 0.5) * 64, ground - 8, p);
  for (let i = 0; i < 4; i++) {
    const a = move * (0.22 - i * 0.04);
    if (a <= 0) continue;
    drawBall(ctx, x - (i + 1) * 20, y, 12 - i, "#EAF2FF", "#8FB3E8", a);
  }
  drawBall(ctx, x, y, 13, "#F7FBFF", "#9FB9D8");
  drawForceArrow(ctx, w * 0.28, y, 48, 0, pulseAlpha(p, 0.22, 0.48));
}

function drawBaseballCase(ctx: CanvasRenderingContext2D, w: number, h: number, p: number): void {
  const y = h * 0.58;
  const gloveX = w * 0.66;
  const fly = ease(p / 0.56);
  const x = w * 0.16 + fly * (gloveX - w * 0.16);
  for (let i = 0; i < 3 && p < 0.58; i++) {
    drawBall(ctx, x - (i + 1) * 22, y, 10 - i, "#FFF7EC", "#D98C45", 0.2 - i * 0.04);
  }
  drawGlove(ctx, gloveX + 18, y + 8, 1);
  drawBall(ctx, x, y, 12, "#FFF7EC", "#D98C45");
  drawForceArrow(ctx, gloveX + 2, y, -48, 0, pulseAlpha(p, 0.42, 0.72));
}

function drawVolleyballCase(ctx: CanvasRenderingContext2D, w: number, h: number, p: number): void {
  const handY = h * 0.75;
  const hit = ease(p / 0.48);
  const rebound = ease((p - 0.48) / 0.48);
  const x = w * 0.48 + rebound * w * 0.18;
  const y = p < 0.48 ? h * 0.22 + hit * (handY - h * 0.22 - 24) : handY - 24 - rebound * h * 0.38;
  drawVolleyHands(ctx, w * 0.5, handY);
  drawBall(ctx, x, y, 18, "#FFF2D5", "#E6A63D");
  drawForceArrow(ctx, w * 0.5, handY - 24, 22, -52, pulseAlpha(p, 0.4, 0.72));
  if (rebound > 0.1) {
    ctx.strokeStyle = "rgba(255,194,77,.28)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, handY - 22);
    ctx.quadraticCurveTo(w * 0.57, h * 0.45, x, y);
    ctx.stroke();
  }
}

function pulseAlpha(p: number, a: number, b: number): number {
  const t = clamp((p - a) / (b - a), 0, 1);
  return Math.sin(t * Math.PI);
}

function drawCan(ctx: CanvasRenderingContext2D, cx: number, baseY: number, crush: number): void {
  const w = 48 * (1 - crush * 0.32);
  const h = 76 * (1 - crush * 0.12);
  const dent = crush * 12;
  contactShadow(ctx, cx, baseY + 8, 48, 0.24);
  const x0 = cx - w / 2;
  const y0 = baseY - h;
  const body = ctx.createLinearGradient(x0, y0, x0 + w, baseY);
  body.addColorStop(0, "rgba(255,255,255,.28)");
  body.addColorStop(0.22, "rgba(255,194,77,.9)");
  body.addColorStop(0.72, "rgba(224,137,8,.92)");
  body.addColorStop(1, "rgba(154,90,8,.9)");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(x0 + 5, y0 + 8);
  ctx.bezierCurveTo(x0 - dent, y0 + h * 0.34, x0 + dent, y0 + h * 0.66, x0 + 6, baseY - 8);
  ctx.quadraticCurveTo(cx, baseY + 2, x0 + w - 6, baseY - 8);
  ctx.bezierCurveTo(x0 + w - dent, y0 + h * 0.66, x0 + w + dent, y0 + h * 0.34, x0 + w - 5, y0 + 8);
  ctx.quadraticCurveTo(cx, y0 - 2, x0 + 5, y0 + 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(154,90,8,.9)";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.26)";
  ctx.beginPath();
  ctx.ellipse(cx, y0 + 8, w * 0.4, 7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,236,186,.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0 + w * 0.22, y0 + 18);
  ctx.lineTo(x0 + w * 0.22 - dent * 0.2, baseY - 14);
  ctx.stroke();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c0: string,
  c1: string,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  contactShadow(ctx, x, y + r + 7, r * 1.8, 0.18 * alpha);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.2, x, y, r * 1.1);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.34, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(70,85,105,.45)";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.18, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawForceArrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, alpha: number): void {
  if (alpha <= 0.01) return;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tipX = x + dx;
  const tipY = y + dy;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#F04452";
  ctx.fillStyle = "#F04452";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX - ux * 10, tipY - uy * 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * 15 + px * 7, tipY - uy * 15 + py * 7);
  ctx.lineTo(tipX - ux * 15 - px * 7, tipY - uy * 15 - py * 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHand(ctx: CanvasRenderingContext2D, x: number, y: number, dir: 1 | -1): void {
  ctx.fillStyle = "rgba(255,236,210,.95)";
  ctx.strokeStyle = "rgba(126,88,56,.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - 11, y - 12, 22, 24, 9);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + dir * 8, y - 8);
  ctx.lineTo(x + dir * 22, y - 12);
  ctx.moveTo(x + dir * 9, y);
  ctx.lineTo(x + dir * 25, y);
  ctx.moveTo(x + dir * 8, y + 8);
  ctx.lineTo(x + dir * 22, y + 11);
  ctx.stroke();
}

function drawClub(ctx: CanvasRenderingContext2D, x: number, y: number, p: number): void {
  const swing = -0.9 + Math.min(1, p / 0.35) * 1.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(swing);
  ctx.strokeStyle = "rgba(210,226,248,.82)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -72);
  ctx.lineTo(0, -6);
  ctx.stroke();
  ctx.fillStyle = "rgba(180,198,224,.9)";
  ctx.beginPath();
  ctx.roundRect(-14, -8, 28, 12, 5);
  ctx.fill();
  ctx.restore();
}

function drawGlove(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  contactShadow(ctx, 0, 28, 32, 0.18);
  const g = ctx.createLinearGradient(-24, -24, 22, 24);
  g.addColorStop(0, "#C9803F");
  g.addColorStop(1, "#7A451F");
  ctx.fillStyle = g;
  ctx.strokeStyle = "rgba(84,45,20,.75)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.bezierCurveTo(-20, -26, 12, -30, 26, -10);
  ctx.bezierCurveTo(30, 4, 22, 26, 0, 28);
  ctx.bezierCurveTo(-18, 26, -30, 14, -24, -2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,220,172,.55)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-10 + i * 8, -18);
    ctx.quadraticCurveTo(-16 + i * 8, 2, -2 + i * 5, 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawVolleyHands(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  drawHand(ctx, x - 20, y, 1);
  drawHand(ctx, x + 20, y, -1);
  ctx.strokeStyle = "rgba(210,226,248,.32)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 38, y + 22);
  ctx.lineTo(x - 70, y + 58);
  ctx.moveTo(x + 38, y + 22);
  ctx.lineTo(x + 70, y + 58);
  ctx.stroke();
}
