// bodyIntegrateLab — 물질 토큰을 순환계를 거쳐 목적지 기관계로 끌어 기관계의 협력을 체험하는 통합 랩.
//  · 영양소: 소화계 → 순환계 → 조직세포.  산소: 호흡계 → 순환계 → 조직세포.
//  · 이산화 탄소: 조직세포 → 순환계 → 호흡계.  요소: 조직세포 → 순환계 → 배설계.
//  · 순환계를 거치지 않고 목적지로 바로 끌면 "모든 물질은 순환계가 운반해요"로 교정한다.
//  · 목표 ① 영양소 전달 ② 산소 전달 ③ 노폐물 배출(이산화 탄소·요소 둘 다).
// 조작 실체: 토큰을 pointerdown/move/up으로 끌어 기관계 상자에 드롭한다. 경로 순서로 통과가 갈린다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { bodyColor, safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface BodyIntegrateStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "nutrient" | "oxygen" | "waste";
type SysId = "digest" | "resp" | "hub" | "excr" | "tissue";
type MatId = "nutrient" | "oxygen" | "co2" | "urea";

const CVH = 372;
const BASE_W = 360;

interface Sys { cx: number; cy: number; w: number; h: number; label: string; key: "organ" | "airway" | "kidney" | "cell" | "heart" }
const SYS: Record<SysId, Sys> = {
  resp: { cx: 180, cy: 58, w: 112, h: 66, label: "호흡계", key: "airway" },
  digest: { cx: 60, cy: 182, w: 104, h: 68, label: "소화계", key: "organ" },
  hub: { cx: 180, cy: 182, w: 112, h: 80, label: "순환계", key: "heart" },
  excr: { cx: 300, cy: 182, w: 104, h: 68, label: "배설계", key: "kidney" },
  tissue: { cx: 180, cy: 316, w: 118, h: 68, label: "조직세포", key: "cell" },
};

interface MatDef { id: MatId; label: string; start: SysId; route: SysId[]; colorKey: string }
const MAT_DEFS: MatDef[] = [
  { id: "nutrient", label: "영양소", start: "digest", route: ["hub", "tissue"], colorKey: "nutrient" },
  { id: "oxygen", label: "산소", start: "resp", route: ["hub", "tissue"], colorKey: "oxygen" },
  { id: "co2", label: "이산화 탄소", start: "tissue", route: ["hub", "resp"], colorKey: "carbon" },
  { id: "urea", label: "요소", start: "tissue", route: ["hub", "excr"], colorKey: "urea" },
];

interface Mat { id: MatId; label: string; route: SysId[]; color: string; idx: number; x: number; y: number }

export const bodyIntegrateLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BodyIntegrateStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge body", dataset: { g: "nutrient" } }, el("b", { text: "영양소" }), el("span", { text: "조직세포로" })),
    el("div", { class: "pn-badge body", dataset: { g: "oxygen" } }, el("b", { text: "산소" }), el("span", { text: "조직세포로" })),
    el("div", { class: "pn-badge body", dataset: { g: "waste" } }, el("b", { text: "노폐물" }), el("span", { text: "0 / 2 배출" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "물질을 <b>순환계(심장·혈액)로 먼저 옮긴 뒤</b>, 알맞은 기관계나 조직세포로 끌어 협력 경로를 완성하세요.",
  });
  const systemKey = el(
    "div", { class: "bil-system-key", attrs: { "aria-label": "기관계와 조직세포" } },
    el("span", { class: "digest", text: "소화계 · 영양소 흡수" }),
    el("span", { class: "resp", text: "호흡계 · 기체 교환" }),
    el("span", { class: "circ", text: "순환계 · 물질 운반" }),
    el("span", { class: "excr", text: "배설계 · 노폐물 배출" }),
    el("span", { class: "cell", text: "조직세포 · 세포호흡" }),
  );
  const canvas = el("canvas", {
    class: "body-lab-canvas",
    style: `height:${CVH}px`,
    attrs: { tabindex: "0", role: "img", "aria-label": "소화계·호흡계·배설계·조직세포와 가운데 순환계가 놓인 무대. 물질 토큰을 끌어 경로로 잇는다." },
  });
  const readPill = el("span", { text: "물질을 순환계로 끌어요" });
  const toast = el("div", { class: "toast" });
  const stage = el(
    "div", { class: "stage body-lab-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#E23B4B" }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, systemKey, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const COLOR: Record<MatId, string> = {
    nutrient: bodyColor("nutrient") || "#12B886",
    oxygen: bodyColor("oxygen") || "#2F80ED",
    co2: bodyColor("carbon") || "#5A6B7B",
    urea: bodyColor("urea") || "#C98A2B",
  };
  const sysCenter = (id: SysId): [number, number] => [SYS[id].cx, SYS[id].cy];
  const stationOffset = (id: MatId, station: SysId): [number, number] => {
    if (station === "digest") return [0, 48];
    if (station === "resp") return id === "oxygen" ? [0, 50] : [-44, -50];
    if (station === "tissue") return id === "co2" ? [-70, 0] : id === "urea" ? [70, 0] : [0, 48];
    if (station === "excr") return [0, 48];
    return ({ nutrient: [-44, 52], oxygen: [44, 52], co2: [-44, -52], urea: [44, -52] } as Record<MatId, [number, number]>)[id];
  };
  const mats: Mat[] = MAT_DEFS.map((d) => {
    const [cx, cy] = sysCenter(d.start);
    const [ox, oy] = stationOffset(d.id, d.start);
    return { id: d.id, label: d.label, route: d.route, color: COLOR[d.id], idx: 0, x: cx + ox, y: cy + oy };
  });
  const byId = (id: MatId): Mat => mats.find((m) => m.id === id)!;

  let W = BASE_W;
  const scale = (): number => W / BASE_W;
  const sx = (x: number): number => x * scale();
  const sy = (y: number): number => y * scale();

  const goals = new Set<Goal>();
  const delivered = new Set<MatId>();
  let finished = false;
  let toastTimer = 0;
  let dragId: MatId | null = null;
  let dragX = 0;
  let dragY = 0;

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const collect = (id: Goal, sub: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = sub;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML = "통합 완성! <b>순환계</b>가 소화계의 영양소와 호흡계의 산소를 조직세포로 나르고, 조직세포에서 생긴 <b>이산화 탄소는 호흡계로, 요소는 배설계로</b> 운반해 몸 밖으로 내보내요.";
      readPill.textContent = "기관계 협력 완성";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "대단원 정리하기");
    }
  };
  const refreshWaste = (): void => {
    const n = (delivered.has("co2") ? 1 : 0) + (delivered.has("urea") ? 1 : 0);
    const chip = goalsEl.querySelector(`[data-g="waste"]`) as HTMLElement;
    if (!goals.has("waste")) chip.querySelector("span")!.textContent = `${n} / 2 배출`;
    if (n === 2) collect("waste", "배출 완료");
  };

  const draggable = (m: Mat): boolean => !finished && !delivered.has(m.id);

  const systemAt = (px: number, py: number): SysId | null => {
    for (const id of Object.keys(SYS) as SysId[]) {
      const b = SYS[id];
      if (Math.abs(px - b.cx) <= b.w / 2 + 6 && Math.abs(py - b.cy) <= b.h / 2 + 6) return id;
    }
    return null;
  };
  const stationCenter = (m: Mat): [number, number] => {
    const at: SysId = m.idx === 0 ? (MAT_DEFS.find((d) => d.id === m.id)!.start) : m.route[m.idx - 1];
    const [cx, cy] = sysCenter(at);
    const [ox, oy] = stationOffset(m.id, at);
    return [cx + ox, cy + oy];
  };
  const wrongMsg = (m: Mat, expected: SysId): string => {
    if (expected === "hub") return "먼저 순환계로 옮겨요 — 모든 물질은 순환계가 실어 날라요";
    if (m.id === "co2") return "이산화 탄소는 호흡계(허파)로 내보내요";
    if (m.id === "urea") return "요소 같은 노폐물은 배설계(콩팥)로 내보내요";
    return "영양소와 산소는 온몸의 조직세포로 전달돼요";
  };
  const deliverMsg = (id: MatId): string => ({
    nutrient: "영양소가 조직세포에 도착했어요",
    oxygen: "산소가 조직세포에 도착했어요",
    co2: "이산화 탄소를 호흡계로 내보냈어요",
    urea: "요소를 배설계로 내보냈어요",
  }[id]);

  const onDown = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    for (let i = mats.length - 1; i >= 0; i--) {
      const m = mats[i];
      if (!draggable(m)) continue;
      if (Math.hypot(px - m.x, py - m.y) < 20) {
        dragId = m.id;
        dragX = px;
        dragY = py;
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        return;
      }
    }
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragId) return;
    const r = canvas.getBoundingClientRect();
    dragX = clamp((e.clientX - r.left) / scale(), 0, BASE_W);
    dragY = clamp((e.clientY - r.top) / scale(), 0, CVH);
  };
  const onUp = (): void => {
    if (!dragId) return;
    const m = byId(dragId);
    dragId = null;
    const drop = systemAt(dragX, dragY);
    const expected = m.route[m.idx];
    if (drop === expected) {
      m.idx += 1;
      const [cx, cy] = sysCenter(expected);
      const [ox, oy] = stationOffset(m.id, expected);
      m.x = cx + ox;
      m.y = cy + oy;
      haptic(HAPTIC.select);
      if (m.idx === m.route.length) {
        delivered.add(m.id);
        toastMsg(deliverMsg(m.id));
        if (m.id === "nutrient") collect("nutrient", "전달 완료");
        else if (m.id === "oxygen") collect("oxygen", "전달 완료");
        else refreshWaste();
      } else {
        toastMsg("순환계가 물질을 실어 날라요");
        readPill.textContent = `${m.label}을(를) 목적지로 마저 끌어요`;
      }
    } else {
      haptic(HAPTIC.wrong);
      toastMsg(wrongMsg(m, expected));
      const [bx, by] = stationCenter(m);
      m.x = bx;
      m.y = by;
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 그리기 ────────────────────────────────────────────────
  function drawRoute(ctx: CanvasRenderingContext2D, route: SysId[], color: string, lane: number, tMs: number): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.54;
    ctx.lineWidth = 4.5 * scale();
    ctx.lineCap = "round";
    ctx.setLineDash([8 * scale(), 7 * scale()]);
    ctx.lineDashOffset = -(tMs / 75) * scale();
    for (let i = 1; i < route.length; i++) {
      const a = SYS[route[i - 1]];
      const b = SYS[route[i]];
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const len = Math.hypot(dx, dy) || 1;
      const ox = (-dy / len) * lane;
      const oy = (dx / len) * lane;
      const ax = sx(a.cx + ox);
      const ay = sy(a.cy + oy);
      const bx = sx(b.cx + ox);
      const by = sy(b.cy + oy);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      const mx = ax + (bx - ax) * .56;
      const my = ay + (by - ay) * .56;
      const ux = (bx - ax) / Math.hypot(bx - ax, by - ay);
      const uy = (by - ay) / Math.hypot(bx - ax, by - ay);
      const rr = 7 * scale();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(mx + ux * rr, my + uy * rr);
      ctx.lineTo(mx - ux * rr - uy * rr * .72, my - uy * rr + ux * rr * .72);
      ctx.lineTo(mx - ux * rr + uy * rr * .72, my - uy * rr - ux * rr * .72);
      ctx.closePath();
      ctx.fill();
      ctx.setLineDash([8 * scale(), 7 * scale()]);
    }
    ctx.restore();
  }
  function drawSystemIcon(ctx: CanvasRenderingContext2D, id: SysId, x: number, y: number): void {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (id === "resp") {
      ctx.fillStyle = "#DDF1FF"; ctx.strokeStyle = "#2F80ED"; ctx.lineWidth = 1.7 * scale();
      ctx.beginPath(); ctx.ellipse(x - 10 * scale(), y, 9 * scale(), 13 * scale(), -.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + 10 * scale(), y, 9 * scale(), 13 * scale(), .18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 18 * scale()); ctx.lineTo(x, y - 5 * scale()); ctx.moveTo(x, y - 7 * scale()); ctx.lineTo(x - 8 * scale(), y); ctx.moveTo(x, y - 7 * scale()); ctx.lineTo(x + 8 * scale(), y); ctx.stroke();
    } else if (id === "digest") {
      ctx.strokeStyle = "#0CA678"; ctx.lineWidth = 5 * scale();
      ctx.beginPath(); ctx.moveTo(x - 9 * scale(), y - 13 * scale()); ctx.bezierCurveTo(x + 10 * scale(), y - 18 * scale(), x + 14 * scale(), y - 1 * scale(), x + 2 * scale(), y + 2 * scale()); ctx.bezierCurveTo(x - 12 * scale(), y + 5 * scale(), x - 7 * scale(), y + 17 * scale(), x + 11 * scale(), y + 13 * scale()); ctx.stroke();
    } else if (id === "excr") {
      ctx.fillStyle = "#FFD59A"; ctx.strokeStyle = "#C47A14"; ctx.lineWidth = 1.7 * scale();
      ctx.beginPath(); ctx.ellipse(x - 10 * scale(), y, 8 * scale(), 13 * scale(), .35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x + 10 * scale(), y, 8 * scale(), 13 * scale(), -.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (id === "tissue") {
      ctx.fillStyle = "#E9DEFF"; ctx.strokeStyle = "#7950F2"; ctx.lineWidth = 1.4 * scale();
      [[-11,-5],[0,-9],[11,-4],[-7,7],[6,8]].forEach(([dx,dy]) => { ctx.beginPath(); ctx.arc(x + dx * scale(), y + dy * scale(), 7 * scale(), 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
    } else {
      ctx.fillStyle = "#E23B4B"; ctx.font = `900 ${29 * scale()}px Pretendard, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("♥", x, y);
    }
    ctx.restore();
  }
  function drawSystem(ctx: CanvasRenderingContext2D, id: SysId, tMs: number): void {
    const b = SYS[id];
    const x = sx(b.cx - b.w / 2);
    const y = sy(b.cy - b.h / 2);
    const w = sx(b.w);
    const h = sy(b.h);
    const lo = (b.key === "heart" ? "organLo" : `${b.key}Lo`) as Parameters<typeof bodyColor>[0];
    ctx.save();
    // 드롭 대상 하이라이트(드래그 중 다음 목적지)
    if (dragId) {
      const m = byId(dragId);
      if (m.route[m.idx] === id) {
        const pulse = Math.sin(tMs / 300) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(226,59,75,${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 2.6 * scale();
        ctx.setLineDash([8 * scale(), 6 * scale()]);
        ctx.beginPath();
        (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
          .roundRect(x - 4, y - 4, w + 8, h + 8, 16 * scale());
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.strokeStyle = bodyColor(lo) || "rgba(60,60,60,.7)";
    ctx.lineWidth = 2.2 * scale();
    ctx.shadowColor = id === "hub" ? "rgba(226,59,75,.42)" : "rgba(19,31,49,.2)";
    ctx.shadowBlur = (id === "hub" ? 10 + (Math.sin(tMs / 360) * .5 + .5) * 6 : 6) * scale();
    ctx.shadowOffsetY = 3 * scale();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
      .roundRect(x, y, w, h, 16 * scale());
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    drawSystemIcon(ctx, id, sx(b.cx), sy(b.cy - (id === "hub" ? 11 : 10)));
    ctx.fillStyle = "#172033";
    ctx.shadowColor = "transparent";
    ctx.font = `900 ${(id === "hub" ? 14 : 13) * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.label, sx(b.cx), sy(b.cy + (id === "hub" ? 15 : 17)));
    if (id === "hub") {
      ctx.font = `800 ${9.5 * scale()}px Pretendard, sans-serif`;
      ctx.fillStyle = "#667085";
      ctx.fillText("심장 · 혈액", sx(b.cx), sy(b.cy + 30));
    }
    ctx.restore();
  }
  function drawToken(ctx: CanvasRenderingContext2D, m: Mat, px: number, py: number, isDrag: boolean): void {
    const x = sx(px);
    const y = sy(py);
    const r = 12 * scale();
    ctx.save();
    if (isDrag) { ctx.shadowColor = "rgba(0,0,0,.32)"; ctx.shadowBlur = 12; }
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,.92)");
    g.addColorStop(0.4, m.color);
    g.addColorStop(1, m.color);
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(18,26,44,.55)";
    ctx.lineWidth = 1.5 * scale();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (isDrag || draggable(m)) {
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.5 * scale();
      ctx.beginPath();
      ctx.arc(x, y, r + 3 * scale(), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.font = `850 ${9.5 * scale()}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const labelY = y + r + 9 * scale();
    const labelW = ctx.measureText(m.label).width + 10 * scale();
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.strokeStyle = "rgba(23,32,51,.18)";
    ctx.lineWidth = 1 * scale();
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void })
      .roundRect(x - labelW / 2, labelY - 8 * scale(), labelW, 16 * scale(), 8 * scale());
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#172033";
    ctx.fillText(m.label, x, labelY);
    ctx.restore();
  }

  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    drawRoute(ctx, ["digest", "hub", "tissue"], COLOR.nutrient, -5, tMs);
    drawRoute(ctx, ["resp", "hub", "tissue"], COLOR.oxygen, -5, tMs);
    drawRoute(ctx, ["tissue", "hub", "resp"], COLOR.co2, 5, tMs);
    drawRoute(ctx, ["tissue", "hub", "excr"], COLOR.urea, 5, tMs);
    (Object.keys(SYS) as SysId[]).forEach((id) => drawSystem(ctx, id, tMs));
    for (const m of mats) {
      if (m.id === dragId || delivered.has(m.id)) continue;
      drawToken(ctx, m, m.x, m.y, false);
    }
    if (dragId) drawToken(ctx, byId(dragId), dragX, dragY, true);
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("세 가지 물질 이동을 모두 연결해 보세요", { enabled: false });
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
