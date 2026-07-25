// cellJobLab — "모양이 다르면 하는 일도 다르다"를 손으로 확인하는 배치 랩(중1 Ⅱ L4).
//  · 세포 3종(신경세포 = 가늘고 긺 · 적혈구 = 가운데가 오목한 원반 · 상피세포 = 납작하고 편평)을
//    알맞은 자리(신호 통로 · 혈관 · 몸의 표면)로 끌어다 놓는다.
//  · 맞으면 그 일이 실제로 작동한다 — 신호가 세포를 타고 흐르고, 적혈구가 산소를 싣고 혈관을 지나가고,
//    상피세포가 표면을 빈틈없이 덮는다.
//  · 틀리면 되돌려 놓고 "그 모양이 왜 그 일에 안 맞는지"를 토스트로 짚는다(모양↔기능 연결이 학습 목표).
//  · 목표 3개 = 배치 3자리.
//
// 드래그는 safePointerCapture 문법 필수(합성 PointerEvent에서 throw로 리스너가 죽는 것을 막는 장치).

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { safePointerCapture } from "../../ui/bodyKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-cell.css";

interface CellJobStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "nerve" | "blood" | "skin";
type CellId = "neuron" | "rbc" | "epi";

const CVH = 388;
const BASE_W = 360;
const MEM = "#12B886";
const NERVE_C = "#7C6BFF";
const BLOOD_C = "#E23B4B";
const OXY_C = "#4CA6F5";
const EPI_C = "#3FC0A8";
const TRAY_Y = 336;

// 무대 위쪽 14~52는 HUD 필 자리 — 첫 자리는 그 아래에서 시작한다.
interface Slot { id: Goal; y0: number; y1: number; name: string; job: string; color: string }
const SLOTS: Slot[] = [
  { id: "nerve", y0: 56, y1: 132, name: "신호 통로", job: "멀리까지 신호를 전해요", color: NERVE_C },
  { id: "blood", y0: 140, y1: 216, name: "혈관", job: "좁은 길로 산소를 실어 날라요", color: BLOOD_C },
  { id: "skin", y0: 224, y1: 300, name: "몸의 표면", job: "빈틈없이 덮어 보호해요", color: EPI_C },
];
const SX0 = 16;
const SX1 = 344;

interface CellTok {
  id: CellId;
  goal: Goal;
  label: string;
  home: { x: number; y: number };
  x: number;
  y: number;
  placed: boolean;
}

/** 틀린 자리마다 "그 모양이 왜 이 일에 안 맞는지"를 말해 준다. */
const WRONG: Record<CellId, Record<Goal, string>> = {
  neuron: {
    nerve: "",
    blood: "신경세포는 가늘고 아주 길어서 좁은 혈관을 타고 흐를 수 없어요",
    skin: "가늘고 긴 몸으로는 표면을 빈틈없이 덮을 수 없어요",
  },
  rbc: {
    nerve: "적혈구는 짧은 원반이라 멀리까지 신호를 이어 줄 수 없어요",
    blood: "",
    skin: "둥근 원반을 늘어놓으면 사이사이에 틈이 생겨 표면을 덮지 못해요",
  },
  epi: {
    nerve: "납작한 세포는 길이가 짧아서 신호를 멀리 전할 수 없어요",
    blood: "납작하고 넓은 세포는 좁은 혈관을 지나가기 어려워요",
    skin: "",
  },
};

/** 긴 설명은 줄바꿈이 되는 helper가 맡는다(캔버스 위 토스트는 한 줄이라 잘린다). */
const DONE_MSG: Record<Goal, string> = {
  nerve: "<b>신경세포</b>는 가늘고 아주 길어서 먼 곳까지 신호를 전해요.",
  blood: "<b>적혈구</b>는 가운데가 오목한 원반이라 산소를 많이 싣고 좁은 혈관도 지나가요.",
  skin: "<b>상피세포</b>는 납작하고 편평해서 표면을 빈틈없이 덮어 보호해요.",
};
/** 자리를 찾은 뒤 트레이 빈자리에 남는 요약 카드(세포 → 자리). */
const PAIR_NAME: Record<CellId, string> = {
  neuron: "신호 통로",
  rbc: "혈관",
  epi: "몸의 표면",
};

export const cellJobLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CellJobStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "nerve" } }, el("b", { text: "신호 통로" }), el("span", { text: "자리 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "blood" } }, el("b", { text: "혈관" }), el("span", { text: "자리 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "skin" } }, el("b", { text: "몸의 표면" }), el("span", { text: "자리 찾기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "모양이 다른 세포 세 가지가 있어요. 아래 <b>세포를 끌어</b> 그 모양이 어울리는 자리에 놓아 보세요.",
  });
  const canvas = el("canvas", {
    class: "b3-canvas cjl-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "신호 통로·혈관·몸의 표면 세 자리에 세포를 끌어다 놓는 무대",
    },
  });
  const readPill = el("span", { text: "세포 0 / 3 배치" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage cjl-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${MEM}` }), readPill)),
    toast,
  );
  host.append(goalsEl, helper, stage);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ────────────────────────────────────────────────────────────
  let W = BASE_W;
  let k = 1;
  let toastTimer = 0;
  let finished = false;
  let drag: CellTok | null = null;
  let grabDX = 0;
  let grabDY = 0;
  const goals = new Set<Goal>();
  const doneAt = new Map<Goal, number>(); // 배치 시각(연출 시작점)

  const cells: CellTok[] = [
    { id: "neuron", goal: "nerve", label: "신경세포", home: { x: 62, y: TRAY_Y }, x: 62, y: TRAY_Y, placed: false },
    { id: "rbc", goal: "blood", label: "적혈구", home: { x: 180, y: TRAY_Y }, x: 180, y: TRAY_Y, placed: false },
    { id: "epi", goal: "skin", label: "상피세포", home: { x: 298, y: TRAY_Y }, x: 298, y: TRAY_Y, placed: false },
  ];

  const fpx = (v: number): number => Math.max(v, 12 / k);

  const toastMsg = (msg: string, ms = 3000): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), ms);
  };

  const collect = (id: Goal, tMs: number): void => {
    if (goals.has(id)) return;
    goals.add(id);
    doneAt.set(id, tMs);
    (goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    (goalsEl.querySelector(`[data-g="${id}"] span`) as HTMLElement).textContent = "맞았어요";
    haptic(HAPTIC.correct);
    toastMsg("자리를 찾았어요");
    readPill.textContent = `세포 ${goals.size} / 3 배치`;
    helper.innerHTML = DONE_MSG[id] + (goals.size === 3
      ? " 세포는 이렇게 <b>하는 일에 알맞은 모양</b>을 하고 있어요. 모양을 보면 그 세포가 어떤 일을 하는지 짐작할 수 있답니다."
      : ` 남은 세포 ${3 - goals.size}개도 놓아 볼까요?`);
    if (goals.size === 3 && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "세포의 모양과 하는 일 정리하기");
    }
  };

  const slotAt = (px: number, py: number): Slot | null => {
    if (px < SX0 - 10 || px > SX1 + 10) return null;
    for (const sl of SLOTS) if (py >= sl.y0 && py <= sl.y1) return sl;
    return null;
  };

  // ── 세포 그림(트레이와 무대에서 같은 손그림을 쓴다) ────────────────────
  function drawNeuron(ctx: CanvasRenderingContext2D, x: number, y: number, len: number): void {
    ctx.save();
    ctx.translate(x, y);
    // 가지돌기
    ctx.strokeStyle = NERVE_C;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (0.62 + i * 0.19);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 15);
      ctx.stroke();
    }
    // 축삭(아주 길다)
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    // 끝가지
    for (let i = -1; i <= 1; i++) {
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(len, 0);
      ctx.lineTo(len + 12, i * 9);
      ctx.stroke();
    }
    // 몸통과 핵
    ctx.fillStyle = NERVE_C;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 9.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(20,24,60,.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawRbc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, "#FF8A94");
    g.addColorStop(0.45, BLOOD_C);
    g.addColorStop(1, "#B31E2C");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    // 가운데가 오목한 원반
    ctx.fillStyle = "rgba(120,14,26,.45)";
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,190,196,.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.44, r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEpi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
    const h = w * 0.36;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(63,192,168,.4)";
    ctx.strokeStyle = EPI_C;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 6, -h / 2);
    ctx.lineTo(w / 2 - 6, -h / 2);
    ctx.lineTo(w / 2, 0);
    ctx.lineTo(w / 2 - 6, h / 2);
    ctx.lineTo(-w / 2 + 6, h / 2);
    ctx.lineTo(-w / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1B7A6A";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.09, h * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── 자리(무대) ───────────────────────────────────────────────────────
  function drawSlot(ctx: CanvasRenderingContext2D, sl: Slot, tMs: number): void {
    const done = goals.has(sl.id);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.045)";
    ctx.strokeStyle = done ? sl.color : "rgba(150,180,220,.3)";
    ctx.lineWidth = done ? 2 : 1.2;
    if (!done && drag) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.roundRect(SX0, sl.y0, SX1 - SX0, sl.y1 - sl.y0, 14);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    // 이름 + 하는 일
    const fs = fpx(12.5);
    ctx.font = `800 ${fs}px Pretendard, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = done ? sl.color : "#D6E4F5";
    ctx.fillText(sl.name, SX0 + 12, sl.y0 + 8);
    const nameW = ctx.measureText(sl.name).width;
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillStyle = "#8FA6C2";
    ctx.fillText(`· ${sl.job}`, SX0 + 18 + nameW, sl.y0 + 8);
    ctx.restore();

    const cy = sl.y0 + 50;
    if (sl.id === "nerve") drawNerveScene(ctx, cy, done, tMs);
    else if (sl.id === "blood") drawBloodScene(ctx, cy, done, tMs);
    else drawSkinScene(ctx, cy, done, tMs);
  }

  /** 신호 통로 — 배치되면 신호가 세포를 타고 끝까지 흐른다. */
  function drawNerveScene(ctx: CanvasRenderingContext2D, cy: number, done: boolean, tMs: number): void {
    const x0 = SX0 + 40;
    const x1 = SX1 - 30;
    ctx.save();
    // 출발점(등 쪽)과 도착점(손 쪽)
    ctx.strokeStyle = "rgba(160,186,220,.45)";
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0 - 18, cy);
    ctx.lineTo(x1 + 18, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const [px, label] of [[x0 - 22, "머리"], [x1 + 22, "손끝"]] as [number, string][]) {
      ctx.fillStyle = "rgba(124,107,255,.28)";
      ctx.strokeStyle = NERVE_C;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(px, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9FB3D4";
      ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, px, cy + 13);
    }
    if (done) {
      const len = x1 - x0 - 12;
      drawNeuron(ctx, x0, cy, len);
      const ph = ((tMs - (doneAt.get("nerve") ?? tMs)) / 1500) % 1;
      const sx = x0 + len * ph;
      const glow = ctx.createRadialGradient(sx, cy, 0, sx, cy, 13);
      glow.addColorStop(0, "rgba(214,208,255,.95)");
      glow.addColorStop(1, "rgba(124,107,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, cy, 13, 0, Math.PI * 2);
      ctx.fill();
      if (ph > 0.94) {
        ctx.strokeStyle = `rgba(214,208,255,${(1 - ph) * 12})`;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(x1 + 22, cy, 11 + (ph - 0.94) * 90, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /** 혈관 — 배치되면 적혈구가 산소를 싣고 좁은 관을 지나간다. */
  function drawBloodScene(ctx: CanvasRenderingContext2D, cy: number, done: boolean, tMs: number): void {
    const half = 14;
    ctx.save();
    ctx.fillStyle = "rgba(226,59,75,.12)";
    ctx.beginPath();
    ctx.rect(SX0 + 10, cy - half, SX1 - SX0 - 20, half * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(226,59,75,.6)";
    ctx.lineWidth = 2.4;
    for (const sy of [-half, half]) {
      ctx.beginPath();
      ctx.moveTo(SX0 + 10, cy + sy);
      ctx.lineTo(SX1 - 10, cy + sy);
      ctx.stroke();
    }
    if (done) {
      const span = SX1 - SX0 - 40;
      for (let i = 0; i < 3; i++) {
        const ph = (((tMs - (doneAt.get("blood") ?? tMs)) / 3400) + i / 3) % 1;
        const x = SX0 + 24 + span * ph;
        drawRbc(ctx, x, cy, 11);
        // 싣고 가는 산소
        for (let j = 0; j < 2; j++) {
          ctx.fillStyle = OXY_C;
          ctx.beginPath();
          ctx.arc(x - 4 + j * 8, cy - 9 - (j % 2) * 2, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = OXY_C;
      ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillText("산소를 싣고", SX1 - 12, cy - half - 3);
    }
    ctx.restore();
  }

  /** 몸의 표면 — 배치되면 상피세포가 한 장씩 늘어나 표면을 빈틈없이 덮는다. */
  function drawSkinScene(ctx: CanvasRenderingContext2D, cy: number, done: boolean, tMs: number): void {
    const y = cy - 4; // 아래 "몸 속" 글자까지 자리 안에 들어오게
    ctx.save();
    // 몸 바깥 / 몸 속
    ctx.fillStyle = "rgba(255,196,120,.10)";
    ctx.beginPath();
    ctx.rect(SX0 + 10, y, SX1 - SX0 - 20, 16);
    ctx.fill();
    ctx.fillStyle = "#8FA6C2";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("몸 바깥", SX0 + 12, y - 11);
    ctx.textBaseline = "top";
    ctx.fillText("몸 속", SX0 + 12, y + 16);
    if (done) {
      const w = 44;
      const n = 7;
      const shown = clamp(Math.floor((tMs - (doneAt.get("skin") ?? tMs)) / 260) + 1, 1, n);
      for (let i = 0; i < shown; i++) {
        drawEpi(ctx, SX0 + 36 + i * w, y, w + 2);
      }
      if (shown >= n) {
        ctx.fillStyle = EPI_C;
        ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText("빈틈없이", SX1 - 12, y - 11);
      }
    } else {
      ctx.strokeStyle = "rgba(160,186,220,.4)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(SX0 + 26, y);
      ctx.lineTo(SX1 - 26, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // ── 트레이 토큰 ──────────────────────────────────────────────────────
  function drawToken(ctx: CanvasRenderingContext2D, t: CellTok, active: boolean): void {
    const w = 100;
    const h = 56;
    ctx.save();
    ctx.translate(t.x, t.y);
    if (active) {
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = active ? "rgba(24,44,68,.98)" : "rgba(18,34,54,.94)";
    ctx.strokeStyle = active ? MEM : "rgba(150,180,220,.4)";
    ctx.lineWidth = active ? 2.4 : 1.4;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (t.id === "neuron") drawNeuron(ctx, -34, 0, 58);
    else if (t.id === "rbc") drawRbc(ctx, 0, 0, 17);
    else drawEpi(ctx, 0, 0, 62);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#C8D8EE";
    ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(t.label, t.x, t.y + h / 2 + 7);
    ctx.restore();
  }

  /** 자리를 찾은 세포 자리에 남기는 요약 카드 — 트레이가 빈 공백으로 남지 않게. */
  function drawPairCard(ctx: CanvasRenderingContext2D, t: CellTok): void {
    const w = 108;
    const h = 56;
    const color = t.goal === "nerve" ? NERVE_C : t.goal === "blood" ? BLOOD_C : EPI_C;
    ctx.save();
    ctx.translate(t.home.x, t.home.y);
    ctx.fillStyle = "rgba(18,34,54,.7)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 12);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#9FB3D4";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillText(t.label, 0, -15);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 3);
    ctx.moveTo(-3.5, -0.5);
    ctx.lineTo(0, 3);
    ctx.lineTo(3.5, -0.5);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `800 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillText(PAIR_NAME[t.id], 0, 15);
    ctx.restore();
  }

  // ── 포인터 ───────────────────────────────────────────────────────────
  const ptOf = (e: PointerEvent): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };

  const onDown = (e: PointerEvent): void => {
    const p = ptOf(e);
    for (const t of cells) {
      if (t.placed) continue;
      if (Math.abs(p.x - t.x) <= 54 && Math.abs(p.y - t.y) <= 34) {
        drag = t;
        grabDX = t.x - p.x;
        grabDY = t.y - p.y;
        safePointerCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
        return;
      }
    }
  };

  const onMove = (e: PointerEvent): void => {
    if (!drag) return;
    const p = ptOf(e);
    drag.x = p.x + grabDX;
    drag.y = p.y + grabDY;
  };

  const onUp = (): void => {
    const t = drag;
    drag = null;
    if (!t) return;
    const sl = slotAt(t.x, t.y);
    if (sl && sl.id === t.goal) {
      t.placed = true;
      collect(t.goal, performance.now());
      return;
    }
    t.x = t.home.x;
    t.y = t.home.y;
    haptic(HAPTIC.wrong);
    toastMsg("그 자리가 아니에요");
    if (sl && goals.has(sl.id)) helper.innerHTML = "그 자리는 이미 알맞은 세포가 일하고 있어요. 다른 자리를 찾아볼까요?";
    else helper.innerHTML = sl ? `${WRONG[t.id][sl.id]}. 다시 놓아 볼까요?` : "세 자리 중 한 곳에 놓아 보세요.";
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 프레임 ───────────────────────────────────────────────────────────
  const loop: Loop = createLoop((_dt, tMs) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    k = W / BASE_W;
    ctx.clearRect(0, 0, W, fit.h);
    ctx.save();
    ctx.scale(k, k);

    for (const sl of SLOTS) drawSlot(ctx, sl, tMs);
    for (const t of cells) {
      if (t.placed) drawPairCard(ctx, t);
      else if (t !== drag) drawToken(ctx, t, false);
    }
    if (drag) drawToken(ctx, drag, true);

    ctx.restore();
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("세포 3종을 알맞은 자리에 놓아 보세요", { enabled: false });
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
