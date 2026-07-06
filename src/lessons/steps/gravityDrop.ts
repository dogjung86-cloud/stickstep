// gravityDrop — 중력 랩(V 단원 L3). 둥근 지구 주위 "아무 데나" 탭해서 사과를 놓는다.
//   · 위·옆·아래 어디서 놓아도 사과는 지구 중심 방향으로 떨어진다 (교과서 160쪽 활동의 놀이터화)
//   · 지구↔달 토글: 같은 사과인데 낙하가 느려지고 무게 58.8 N → 9.8 N (1/6), 질량 6 kg은 그대로
// 목표: 서로 다른 방향 3곳에서 떨어뜨리기 + 달에서 1회.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { drawForceArrow } from "../../ui/forceProps";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface GravityDropStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Apple {
  x: number;
  y: number;
  vx: number;
  vy: number;
  landed: boolean;
  landT: number; // 착지 시각(스쿼시 연출)
  ang: number; // 착지 각도(표면 고정용)
}

const TAU = Math.PI * 2;
const EARTH_W = 58.8;
const MOON_W = 9.8;

export const gravityDrop: StepRenderer = (host, step, api) => {
  const s = step as unknown as GravityDropStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:260px" });
  const weightVal = el("span", { text: EARTH_W.toFixed(1) });
  const massPill = el("span", { text: "질량 6 kg — 어디서나 그대로" });
  const toastEl = el("div", { class: "toast" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el(
      "div",
      { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#37C08E" }), massPill),
      el("div", { class: "tempread" }, weightVal, el("small", { text: " N" })),
    ),
    toastEl,
    el("div", { class: "stage-cap", text: "빈 우주 아무 데나 눌러 사과를 놓아 보세요" }),
  );

  const seg = el("div", { class: "seg" });
  const earthBtn = el("button", { class: "on", text: "지구에서", attrs: { type: "button", "aria-pressed": "true" } });
  const moonBtn = el("button", { text: "달에서", attrs: { type: "button", "aria-pressed": "false" } });
  seg.append(earthBtn, moonBtn);

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge force", dataset: { g: "top" } }, el("b", { text: "위에서" }), el("span", { text: "중심으로?" })),
    el("div", { class: "pn-badge force", dataset: { g: "side" } }, el("b", { text: "옆에서" }), el("span", { text: "중심으로?" })),
    el("div", { class: "pn-badge force", dataset: { g: "bottom" } }, el("b", { text: "아래에서" }), el("span", { text: "중심으로?" })),
    el("div", { class: "pn-badge force", dataset: { g: "moon" } }, el("b", { text: "달에서도" }), el("span", { text: "1/6 무게" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지구 <b>위쪽·옆·아래쪽</b> 우주 공간을 눌러 사과를 놓아 보세요. 사과가 어느 쪽으로 떨어질까요?",
  });
  host.append(goalChips, stage, seg, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let world: "earth" | "moon" = "earth";
  const apples: Apple[] = [];
  const goals = new Set<string>();
  let finished = false;
  let toastTimer = 0;
  let W = 340;
  let H = 260;

  const cx = (): number => W / 2;
  const cy = (): number => H * 0.54;
  const R = (): number => Math.min(H * 0.26, W * 0.19);

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
  }

  function collect(id: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = id === "moon" ? "무게 9.8 N!" : "중심으로!";
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "확인 완료! 중력은 <b>어디서나 지구(달) 중심 방향</b>으로 물체를 당겨요. 그리고 달에서는 중력이 약해서 <b>무게만 1/6</b>이 되고, 사과라는 물질의 양 — <b>질량 6 kg — 은 변하지 않았어요</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 입력: 탭해서 사과 놓기 ----
  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const d = Math.hypot(px - cx(), py - cy());
    if (d < R() + 14) return; // 행성 내부/표면은 무시
    if (apples.length > 7) apples.shift();
    apples.push({ x: px, y: py, vx: 0, vy: 0, landed: false, landT: 0, ang: 0 });
    haptic(HAPTIC.tap);
  };
  canvas.addEventListener("pointerdown", onDown);

  earthBtn.addEventListener("click", () => setWorld("earth"));
  moonBtn.addEventListener("click", () => setWorld("moon"));
  function setWorld(v: "earth" | "moon"): void {
    if (world === v) return;
    world = v;
    apples.length = 0;
    earthBtn.classList.toggle("on", v === "earth");
    moonBtn.classList.toggle("on", v === "moon");
    earthBtn.setAttribute("aria-pressed", String(v === "earth"));
    moonBtn.setAttribute("aria-pressed", String(v === "moon"));
    weightVal.textContent = v === "earth" ? EARTH_W.toFixed(1) : MOON_W.toFixed(1);
    haptic(HAPTIC.tap);
    toast(v === "earth" ? "지구 — 사과 무게 58.8 N" : "달 — 같은 사과, 무게는 9.8 N");
    if (!finished) {
      helper.innerHTML =
        v === "moon"
          ? "달에서도 사과를 놓아 보세요. <b>더 천천히</b>, 하지만 역시 <b>중심으로</b> 떨어져요. 질량은 그대로 6 kg!"
          : "지구예요. 위·옆·아래 여러 방향에서 놓아 보세요.";
    }
  }

  // ---- 프레임 ----
  const loop: Loop = createLoop((dt, tMs) => {
    const fit = fitCanvas(canvas, 260);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    const PC = { x: cx(), y: cy() };
    const PR = R();

    // 별 배경(고정 시드 — 은은히 깜빡)
    for (let i = 0; i < 26; i++) {
      const sx = ((i * 89.7) % 1) * W + ((i * 37) % 13);
      const sy = ((i * 53.3) % 1) * H;
      const tw = 0.25 + 0.2 * Math.sin(tMs / 900 + i * 1.7);
      ctx.fillStyle = `rgba(214,230,250,${tw})`;
      ctx.fillRect((sx * 7919) % W, (sy * 104729) % H, 1.6, 1.6);
    }

    // ---- 행성 ----
    if (world === "earth") {
      const glow = ctx.createRadialGradient(PC.x, PC.y, PR * 0.6, PC.x, PC.y, PR * 1.5);
      glow.addColorStop(0, "rgba(90,160,255,.18)");
      glow.addColorStop(1, "rgba(90,160,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(PC.x, PC.y, PR * 1.5, 0, TAU);
      ctx.fill();
      const body = ctx.createRadialGradient(PC.x - PR * 0.35, PC.y - PR * 0.4, PR * 0.15, PC.x, PC.y, PR);
      body.addColorStop(0, "#7FC4FF");
      body.addColorStop(0.55, "#3D8DE8");
      body.addColorStop(1, "#1E5CB8");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(PC.x, PC.y, PR, 0, TAU);
      ctx.fill();
      // 대륙(간단한 블롭 2개)
      ctx.fillStyle = "rgba(94,200,140,.85)";
      ctx.beginPath();
      ctx.ellipse(PC.x - PR * 0.3, PC.y - PR * 0.15, PR * 0.34, PR * 0.22, -0.5, 0, TAU);
      ctx.ellipse(PC.x + PR * 0.28, PC.y + PR * 0.3, PR * 0.26, PR * 0.17, 0.4, 0, TAU);
      ctx.fill();
      // 하이라이트
      ctx.fillStyle = "rgba(255,255,255,.28)";
      ctx.beginPath();
      ctx.ellipse(PC.x - PR * 0.36, PC.y - PR * 0.44, PR * 0.3, PR * 0.16, -0.7, 0, TAU);
      ctx.fill();
    } else {
      const body = ctx.createRadialGradient(PC.x - PR * 0.35, PC.y - PR * 0.4, PR * 0.15, PC.x, PC.y, PR);
      body.addColorStop(0, "#E8EDF4");
      body.addColorStop(0.6, "#AFBBCB");
      body.addColorStop(1, "#77839A");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(PC.x, PC.y, PR, 0, TAU);
      ctx.fill();
      // 크레이터
      ctx.fillStyle = "rgba(90,102,124,.5)";
      for (const [ox, oy, r] of [[-0.3, -0.1, 0.14], [0.25, 0.22, 0.11], [0.05, -0.38, 0.09], [-0.12, 0.36, 0.08]] as const) {
        ctx.beginPath();
        ctx.arc(PC.x + PR * ox, PC.y + PR * oy, PR * r, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.beginPath();
      ctx.ellipse(PC.x - PR * 0.36, PC.y - PR * 0.44, PR * 0.3, PR * 0.15, -0.7, 0, TAU);
      ctx.fill();
    }
    // 중심점 십자
    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(PC.x - 5, PC.y);
    ctx.lineTo(PC.x + 5, PC.y);
    ctx.moveTo(PC.x, PC.y - 5);
    ctx.lineTo(PC.x, PC.y + 5);
    ctx.stroke();

    // ---- 사과 물리 + 그리기 ----
    const g = world === "earth" ? 0.16 : 0.16 / 6;
    for (const a of apples) {
      if (!a.landed) {
        const dx = PC.x - a.x;
        const dy = PC.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-4;
        a.vx += (dx / d) * g * dt;
        a.vy += (dy / d) * g * dt;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        if (d <= PR + 7) {
          a.landed = true;
          a.landT = tMs;
          a.ang = Math.atan2(a.y - PC.y, a.x - PC.x);
          a.x = PC.x + Math.cos(a.ang) * (PR + 6);
          a.y = PC.y + Math.sin(a.ang) * (PR + 6);
          haptic(6);
          judgeDrop(a.ang);
        }
      }
      // 낙하 궤적(중심을 향한 점선)
      if (!a.landed) {
        ctx.strokeStyle = "rgba(242,120,96,.35)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const dd = Math.hypot(PC.x - a.x, PC.y - a.y);
        ctx.lineTo(a.x + ((PC.x - a.x) / dd) * (dd - PR), a.y + ((PC.y - a.y) / dd) * (dd - PR));
        ctx.stroke();
        ctx.setLineDash([]);
        // 중력 화살표
        const al = 26;
        drawForceArrow(ctx, a.x, a.y, ((PC.x - a.x) / dd) * al, ((PC.y - a.y) / dd) * al, { color: "#F25757", width: 3.4 });
      }
      // 사과 본체(착지 직후 스쿼시)
      const sq = a.landed ? Math.max(0, 1 - (tMs - a.landT) / 220) : 0;
      const rx = 7 * (1 + sq * 0.25);
      const ry = 7 * (1 - sq * 0.3);
      ctx.save();
      ctx.translate(a.x, a.y);
      if (a.landed) ctx.rotate(a.ang + Math.PI / 2);
      const ag = ctx.createRadialGradient(-2, -2.4, 1, 0, 0, 8);
      ag.addColorStop(0, "#FF9A8A");
      ag.addColorStop(0.55, "#F25742");
      ag.addColorStop(1, "#C93A28");
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.fill();
      // 꼭지+잎
      ctx.strokeStyle = "#7A4A22";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -ry + 1);
      ctx.lineTo(0, -ry - 3.4);
      ctx.stroke();
      ctx.fillStyle = "#4FBF7E";
      ctx.beginPath();
      ctx.ellipse(2.6, -ry - 2.6, 2.8, 1.5, 0.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.4)";
      ctx.beginPath();
      ctx.arc(-2.2, -2.6, 1.7, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  });

  // 낙하 방향 판정(행성 기준 어느 쪽 하늘에서 떨어졌나)
  function judgeDrop(ang: number): void {
    const deg = ((ang * 180) / Math.PI + 360) % 360;
    if (world === "moon") {
      collect("moon", "달에서도 중심으로 — 무게는 9.8 N!");
      return;
    }
    if (deg > 210 && deg < 330) collect("top", "위에서 놓아도 중심으로!");
    else if (deg > 30 && deg < 150) collect("bottom", "아래에서 놓아도 중심으로!");
    else collect("side", "옆에서 놓아도 중심으로!");
    if (goals.size === 3 && !goals.has("moon") && !finished) {
      helper.innerHTML = "사방 어디서든 <b>중심으로</b>! 이제 <b>달에서</b> 버튼을 누르고 한 번 더 놓아 보세요.";
    }
  }

  const onResize = (): void => {
    fitCanvas(canvas, 260);
  };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => {
    onResize();
    loop.start();
  });

  api.setCTA("네 목표를 모두 채워 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
  };
};
