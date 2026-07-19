// circulationLab — 적혈구를 직접 끌어 두 순환 경로를 완주시키는 캔버스 랩.
//  · 적혈구 토큰을 손가락으로 경로를 따라 끌면(진행률로 판정) 심장을 지나며 혈액색이 바뀐다.
//  · 허파순환(우심실→폐동맥→허파→폐정맥→좌심방): 암적색 → 허파에서 선홍색으로.
//  · 온몸순환(좌심실→대동맥→온몸→대정맥→우심방): 선홍색 → 조직에서 암적색으로.
//  · 목표 ① 심장 4방·판막 살펴보기(탭) ② 허파순환 완주 ③ 온몸순환 완주.
// 조작 실체: 경로 폴리라인 위 최근접점으로 스냅하며 누적 진행률을 재고, 역주행은 무시한다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { bodyColor, safePointerCapture, drawValve } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface CirculationStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Mission = "heart" | "lung" | "body";

const CVH = 340;
const BLOOD_LOW = "#2F80ED";
const BLOOD_HIGH = "#E23B4B";
// 논리 좌표(캔버스 CSS 크기에 맞춰 스케일). 심장은 가운데, 허파는 위, 온몸은 오른쪽.
// 경로는 화면 좌표계(가로 360 기준)에서 설계하고 실제 폭에 비례 배치한다.
const BASE_W = 360;

// 허파순환 경로: 우심실(아래중앙 좌) → 폐동맥(왼 위로) → 허파 → 폐정맥(오 위) → 좌심방(중앙 우)
const LUNG_PATH: [number, number][] = [
  [163, 224], [120, 184], [110, 130], [150, 104], [180, 96],
  [210, 104], [250, 130], [240, 184], [197, 184],
];
// 온몸순환 경로: 좌심실(아래중앙 우) → 대동맥(오른쪽 아래로) → 온몸 → 대정맥(되돌아) → 우심방
const BODY_PATH: [number, number][] = [
  [197, 224], [250, 234], [300, 244], [316, 272], [300, 296],
  [240, 302], [170, 284], [163, 239],
];

function pathLen(pts: [number, number][]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}
// t(0..1)에서의 점
function pointAt(pts: [number, number][], t: number): [number, number] {
  const total = pathLen(pts);
  let target = clamp(t, 0, 1) * total;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    }
    target -= seg;
  }
  return pts[pts.length - 1];
}
// 점 p에서 경로에 가장 가까운 t(0..1)와 거리
function nearestT(pts: [number, number][], px: number, py: number): { t: number; dist: number } {
  const total = pathLen(pts);
  let acc = 0;
  let best = { t: 0, dist: Infinity };
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const seg = Math.hypot(dx, dy) || 1;
    const u = clamp(((px - ax) * dx + (py - ay) * dy) / (seg * seg), 0, 1);
    const cx = ax + dx * u;
    const cy = ay + dy * u;
    const dist = Math.hypot(px - cx, py - cy);
    if (dist < best.dist) best = { t: (acc + u * seg) / total, dist };
    acc += seg;
  }
  return best;
}

export const circulationLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CirculationStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge body", dataset: { g: "heart" } }, el("b", { text: "심장 4방" }), el("span", { text: "판막 보기" })),
    el("div", { class: "pn-badge body", dataset: { g: "lung" } }, el("b", { text: "허파순환" }), el("span", { text: "적혈구 끌기" })),
    el("div", { class: "pn-badge body", dataset: { g: "body" } }, el("b", { text: "온몸순환" }), el("span", { text: "적혈구 끌기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "먼저 <b>심장을 탭</b>해 네 방과 판막을 확인하고, <b>적혈구를 끌어</b> 두 순환을 완주해 보세요. 혈액이 산소를 얻고 내놓는 순간 길의 색도 바뀌어요.",
  });
  const colorKey = el(
    "div", { class: "cl-color-key", attrs: { "aria-label": "혈액 색 범례" } },
    el("span", { class: "low" }, el("i"), el("b", { text: "파랑" }), document.createTextNode(" 산소가 적은 혈액")),
    el("span", { class: "high" }, el("i"), el("b", { text: "빨강" }), document.createTextNode(" 산소가 많은 혈액")),
  );
  const canvas = el("canvas", {
    class: "body-lab-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "심장의 네 방과 허파순환·온몸순환 경로 위에서 적혈구를 끌어 이동시키는 무대" },
  });
  const readPill = el("span", { text: "심장을 먼저 탭하세요" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div", { class: "stage body-lab-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${"#E23B4B"}` }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, colorKey, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_W;
  let H = CVH;
  const scale = (): number => W / BASE_W;
  const goals = new Set<Mission>();
  let finished = false;
  let heartSeen = false;
  let toastTimer = 0;
  // 현재 끌고 있는 경로와 진행률
  let active: Mission | null = null;
  let lungT = 0;
  let bodyT = 0;
  let dragging = false;
  let heartPulse = 0;
  let lungColorNotified = false;
  let bodyColorNotified = false;

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1650);
  };
  const collect = (id: Mission, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = "완주";
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "완주했어요! 혈액은 <b>심방→심실→동맥→모세혈관→정맥</b> 한 방향으로 흘러요. 허파순환에서 산소를 얻어 <b>선홍색</b>이 되고, 온몸에 산소를 주면 <b>암적색</b>이 돼요. 폐동맥에는 산소가 적은 피, 폐정맥에는 산소가 많은 피가 흐른답니다.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "호흡의 원리로 가기");
    }
  };

  // 좌표 변환(논리→화면)
  const sx = (x: number): number => x * scale();
  const sy = (y: number): number => y * scale();

  const heartHit = (px: number, py: number): boolean => {
    // 심장 중심 (180, 199) 반경 60 논리
    return Math.hypot(px - 180, py - 199) < 62;
  };

  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    // 심장 탭 → 4방·판막 표시
    if (!heartSeen && heartHit(px, py)) {
      heartSeen = true;
      readPill.textContent = "좌심실에서 적혈구를 끌어 보세요";
      haptic(HAPTIC.select);
      collect("heart", "심방은 받아들이고 심실은 내보내요. 판막이 역류를 막아요");
      return;
    }
    if (!heartSeen) { toastMsg("먼저 심장을 탭해 방과 판막을 확인해요"); return; }
    // 각 경로 시작점 근처면 그 경로를 잡는다
    const lh = nearestT(LUNG_PATH, px, py);
    const bh = nearestT(BODY_PATH, px, py);
    if (!goals.has("lung") && lh.dist < 26 && lh.t < 0.35) {
      active = "lung"; dragging = true; lungT = Math.max(lungT, lh.t);
    } else if (!goals.has("body") && bh.dist < 26 && bh.t < 0.35) {
      active = "body"; dragging = true; bodyT = Math.max(bodyT, bh.t);
    } else if (!goals.has("lung") && lh.dist < 24) {
      active = "lung"; dragging = true;
    } else if (!goals.has("body") && bh.dist < 24) {
      active = "body"; dragging = true;
    } else return;
    safePointerCapture(canvas, e.pointerId);
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging || !active) return;
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    const pts = active === "lung" ? LUNG_PATH : BODY_PATH;
    const hit = nearestT(pts, px, py);
    if (hit.dist > 40) return; // 경로에서 너무 벗어나면 무시
    if (active === "lung") lungT = clamp(Math.max(lungT, hit.t), 0, 1);
    else bodyT = clamp(Math.max(bodyT, hit.t), 0, 1);
    const prog = active === "lung" ? lungT : bodyT;
    if (active === "lung" && prog >= 0.5 && !lungColorNotified) {
      lungColorNotified = true;
      toastMsg("허파에서 이산화 탄소를 내보내고 산소를 받아 혈액이 빨간색으로 변했어요");
      readPill.textContent = "허파에서 산소를 받아 빨간색으로 변했어요";
    }
    if (active === "body" && prog >= 0.5 && !bodyColorNotified) {
      bodyColorNotified = true;
      toastMsg("온몸 조직에 산소를 주고 이산화 탄소를 받아 혈액이 파란색으로 변했어요");
      readPill.textContent = "조직에 산소를 주어 파란색으로 변했어요";
    }
    if (prog > 0.985) {
      if (active === "lung") collect("lung", "허파순환 완주 — 허파에서 산소를 얻어 선홍색이 됐어요");
      else collect("body", "온몸순환 완주 — 조직에 산소를 주고 암적색이 됐어요");
      dragging = false; active = null;
    }
  };
  const onUp = (): void => { dragging = false; };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  function drawHeart(ctx: CanvasRenderingContext2D): void {
    const cx = sx(180);
    const cy = sy(199);
    const rx = sx(58);
    const ry = sy(60);
    // 심장 외곽(부드러운 하트형 대신 해부적 4방 상자)
    ctx.save();
    const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    g.addColorStop(0, bodyColor("organHi"));
    g.addColorStop(0.55, bodyColor("organ"));
    g.addColorStop(1, bodyColor("organLo"));
    ctx.fillStyle = g;
    ctx.strokeStyle = bodyColor("organLo");
    ctx.lineWidth = 2;
    if (heartSeen) ctx.shadowColor = "rgba(226,59,75,.45)", ctx.shadowBlur = 12 + heartPulse * 5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    // 4방 나눔선
    ctx.strokeStyle = bodyColor("organLo");
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.lineTo(cx, cy + ry);
    ctx.moveTo(cx - rx, cy);
    ctx.lineTo(cx + rx, cy);
    ctx.stroke();
    if (heartSeen) {
      // 방 이름
      ctx.fillStyle = "#fff";
      ctx.font = `800 ${11 * scale()}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("우심방", cx - rx * 0.5, cy - ry * 0.5);
      ctx.fillText("좌심방", cx + rx * 0.5, cy - ry * 0.5);
      ctx.fillText("우심실", cx - rx * 0.5, cy + ry * 0.5);
      ctx.fillText("좌심실", cx + rx * 0.5, cy + ry * 0.5);
      // 판막(심방-심실 사이)
      drawValve(ctx, cx - rx * 0.5, cy, 0, 9 * scale());
      drawValve(ctx, cx + rx * 0.5, cy, 0, 9 * scale());
    } else {
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.font = `800 ${12 * scale()}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("심장 탭!", cx, cy);
    }
    ctx.restore();
  }

  function drawPath(ctx: CanvasRenderingContext2D, pts: [number, number][], prog: number, kind: Mission): void {
    // 경로 배경(옅은 안내선)
    ctx.save();
    ctx.lineWidth = 15 * scale();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(150,170,200,.18)";
    ctx.beginPath();
    ctx.moveTo(sx(pts[0][0]), sy(pts[0][1]));
    for (let i = 1; i < pts.length; i++) ctx.lineTo(sx(pts[i][0]), sy(pts[i][1]));
    ctx.stroke();
    // 진행 구간: 허파순환은 절반 지점(허파, 약 0.5)에서 색 전환, 온몸순환은 절반에서 전환
    const done = goals.has(kind);
    const drawUntil = done ? 1 : prog;
    if (drawUntil > 0.001) {
      const steps = 40;
      for (let i = 1; i <= steps; i++) {
        const t0 = ((i - 1) / steps) * drawUntil;
        const t1 = (i / steps) * drawUntil;
        const [x0, y0] = pointAt(pts, t0);
        const [x1, y1] = pointAt(pts, t1);
        // 허파순환: 전반(폐동맥) 암적, 후반(폐정맥) 선홍. 온몸순환: 전반(대동맥) 선홍, 후반(대정맥) 암적.
        const mid = 0.5;
        let oxygenated: boolean;
        if (kind === "lung") oxygenated = t1 > mid;
        else oxygenated = t1 < mid;
        ctx.strokeStyle = oxygenated ? BLOOD_HIGH : BLOOD_LOW;
        ctx.lineWidth = 11 * scale();
        ctx.beginPath();
        ctx.moveTo(sx(x0), sy(y0));
        ctx.lineTo(sx(x1), sy(y1));
        ctx.stroke();
      }
    }
    ctx.restore();
    // 적혈구 토큰(진행 끝점)
    if (!done && heartSeen && !goals.has(kind)) {
      const [tx, ty] = pointAt(pts, prog);
      const oxy = kind === "lung" ? prog > 0.5 : prog < 0.5;
      ctx.save();
      ctx.translate(sx(tx), sy(ty));
      const rr = 10 * scale();
      const g = ctx.createRadialGradient(-rr * 0.3, -rr * 0.35, rr * 0.1, 0, 0, rr);
      g.addColorStop(0, "rgba(255,255,255,.85)");
      g.addColorStop(0.4, oxy ? BLOOD_HIGH : BLOOD_LOW);
      g.addColorStop(1, oxy ? BLOOD_HIGH : BLOOD_LOW);
      ctx.fillStyle = g;
      ctx.strokeStyle = bodyColor("organLo");
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      // 적혈구: 가운데 오목한 원반
      ctx.ellipse(0, 0, rr, rr * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.beginPath();
      ctx.ellipse(0, 0, rr * 0.4, rr * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      // 잡아끌기 유도 화살표(진행 0일 때)
      if (prog < 0.02 && !dragging) {
        ctx.strokeStyle = "rgba(226,59,75,.7)";
        ctx.lineWidth = 2.4 * scale();
        ctx.beginPath();
        ctx.moveTo(rr + 4, 0);
        ctx.lineTo(rr + 16, 0);
        ctx.moveTo(rr + 11, -5);
        ctx.lineTo(rr + 16, 0);
        ctx.lineTo(rr + 11, 5);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawLungBadge(ctx: CanvasRenderingContext2D): void {
    // HUD와 혈관에 가리지 않는 흰 배경 라벨.
    const badge = (x: number, y: number, text: string, color: string): void => {
      ctx.font = `900 ${11 * scale()}px Pretendard, sans-serif`;
      const width = ctx.measureText(text).width + 20 * scale();
      const height = 25 * scale();
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4 * scale();
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
        .roundRect(sx(x) - width / 2, sy(y) - height / 2, width, height, 12 * scale());
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, sx(x), sy(y));
    };
    ctx.save();
    badge(180, 63, "허파(폐)", "#1763A6");
    badge(294, 323, "온몸 조직", "#7A4E18");
    ctx.restore();
  }

  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    H = fit.h;
    void H;
    heartPulse = heartSeen ? (Math.sin(tMs / 380) * 0.5 + 0.5) : 0;
    ctx.clearRect(0, 0, W, fit.h);
    drawPath(ctx, LUNG_PATH, lungT, "lung");
    drawPath(ctx, BODY_PATH, bodyT, "body");
    drawHeart(ctx);
    // 경로와 심장을 모두 그린 뒤 라벨을 올려 혈관에 가리지 않게 한다.
    drawLungBadge(ctx);
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("심장을 탭하고 두 순환을 완주해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
};
