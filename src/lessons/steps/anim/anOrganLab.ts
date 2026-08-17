// anOrganLab — 중2 Ⅵ L3 "소화계 조립소".
// ① 소화관 6기관을 입 → 항문 순서로 놓고 ② 소화샘 4개를 제자리에 붙여 소화액 관을 잇고
// ③ "음식물이 실제로 지나가는 길"만 골라낸다.
// 소화관(음식물이 지나가는 길)과 소화샘(소화액만 보내는 곳)의 구분이 이 랩의 과녁이다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, anMat, capturePointer, canvasPoint, drawTube, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 510;

interface Organ {
  id: string;
  name: string;
  /** true면 소화관(음식물이 지나가는 길), false면 소화샘(소화액만 보낸다). */
  tract: boolean;
  x: number;
  y: number;
  /** 소화관 순서(1~6). 소화샘은 0. */
  order: number;
  /** 소화샘이 소화액을 보내는 지점. */
  duct?: { x: number; y: number };
  note: string;
}

const ORGANS: Organ[] = [
  { id: "mouth", name: "입", tract: true, order: 1, x: 180, y: 62, note: "이로 부수고 침과 섞어요" },
  { id: "esoph", name: "식도", tract: true, order: 2, x: 180, y: 118, note: "위로 내려보내는 통로예요" },
  { id: "stomach", name: "위", tract: true, order: 3, x: 140, y: 172, note: "위액이 나와 단백질을 분해해요" },
  { id: "small", name: "작은창자", tract: true, order: 4, x: 180, y: 258, note: "소화의 마무리 + 영양소 흡수" },
  { id: "large", name: "큰창자", tract: true, order: 5, x: 180, y: 326, note: "주로 물을 흡수해요" },
  { id: "anus", name: "항문", tract: true, order: 6, x: 180, y: 362, note: "남은 찌꺼기가 나가요" },
  { id: "saliva", name: "침샘", tract: false, order: 0, x: 122, y: 58, duct: { x: 172, y: 66 }, note: "침을 입으로 보내요" },
  { id: "liver", name: "간", tract: false, order: 0, x: 238, y: 156, duct: { x: 224, y: 184 }, note: "쓸개즙을 만들어요" },
  { id: "gall", name: "쓸개", tract: false, order: 0, x: 224, y: 194, duct: { x: 196, y: 240 }, note: "쓸개즙을 저장했다 작은창자로" },
  { id: "pancreas", name: "이자", tract: false, order: 0, x: 122, y: 216, duct: { x: 166, y: 242 }, note: "이자액을 작은창자로 보내요" },
];

const TRAY_ROW = [46, 114, 182, 250, 318];
const TRAY_Y = [416, 466];
const TILE_W = 62;
const TILE_H = 32;

export const anOrganLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "몸속 소화 기관 이름표를 제자리에 놓아 소화관과 소화샘을 조립하는 모형",
    height: CVH,
    goals: [
      { id: "tract", title: "소화관 잇기", sub: "입 → 항문" },
      { id: "gland", title: "소화샘 붙이기", sub: "소화액 4가지" },
      { id: "sort", title: "지나가는 길", sub: "골라내기" },
    ],
    helper: "음식물이 지나가는 길부터 이어요. <b>입</b> 이름표를 끌어 맨 위 자리에 놓아 보세요.",
    finish: "완성! 음식물이 <b>직접 지나가는 길</b>이 소화관(입·식도·위·작은창자·큰창자·항문)이고, <b>소화액만 보내 주는 곳</b>이 소화샘(침샘·간·쓸개·이자)이에요. 둘을 합쳐 <b>소화계</b>라고 불러요.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("two");
  const resetBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "다시 놓기" });
  const sortBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "지나가는 길 골라내기", style: "display:none" });
  lab.controls.append(resetBtn, sortBtn);

  const placed = new Set<string>();
  const trayOrder = ORGANS.map((o) => o.id);
  let held: Organ | null = null;
  let drag: { x: number; y: number } | null = null;
  let downAt: { x: number; y: number } | null = null;
  let toast = "";
  let toastUntil = 0;
  let phase: "build" | "sort" = "build";
  const picked = new Set<string>();
  let wrongFlash = "";
  let wrongUntil = 0;

  const say = (m: string, ms = 3200): void => { toast = m; toastUntil = performance.now() + ms; };

  function trayPos(id: string): { x: number; y: number } {
    const i = trayOrder.indexOf(id);
    return { x: TRAY_ROW[i % 5], y: TRAY_Y[Math.floor(i / 5)] };
  }

  function checkBuild(): void {
    const tractDone = ORGANS.filter((o) => o.tract).every((o) => placed.has(o.id));
    if (tractDone && !lab.has("tract")) {
      lab.collect("tract", "6기관 완성");
      lab.setHelper("음식물의 길이 이어졌어요! 이제 <b>침샘·간·쓸개·이자</b>를 옆자리에 붙여 보세요. 이 넷은 음식물이 지나가진 않지만 <b>소화액</b>을 보내 줘요.");
    }
    const glandDone = ORGANS.filter((o) => !o.tract).every((o) => placed.has(o.id));
    if (glandDone && !lab.has("gland")) {
      lab.collect("gland", "소화액 관 연결");
      phase = "sort";
      sortBtn.style.display = "";
      lab.setHelper("마지막 질문이에요. <b>음식물이 직접 지나가는 기관</b>만 탭해서 골라 보세요. 여섯 곳이에요.");
      say("이제 음식물이 지나가는 기관만 탭하세요.");
    }
  }

  function drop(o: Organ, x: number, y: number): void {
    if (Math.hypot(x - o.x, y - o.y) <= 46) {
      placed.add(o.id);
      haptic(HAPTIC.tap);
      say(`${o.name}, ${o.note}`);
      checkBuild();
    } else {
      const near = ORGANS.find((t) => !placed.has(t.id) && Math.hypot(x - t.x, y - t.y) <= 34);
      if (near) say(`여기는 ${o.name}의 자리가 아니에요. 다시 살펴봐요.`);
    }
  }

  // ── 입력 ────────────────────────────────────────────────────────────────
  function tileAt(x: number, y: number): Organ | null {
    for (const o of ORGANS) {
      if (placed.has(o.id)) continue;
      const p = trayPos(o.id);
      if (Math.abs(x - p.x) <= TILE_W / 2 + 3 && Math.abs(y - p.y) <= TILE_H / 2 + 6) return o;
    }
    return null;
  }
  function placedAt(x: number, y: number): Organ | null {
    for (const o of ORGANS) {
      if (!placed.has(o.id)) continue;
      if (Math.hypot(x - o.x, y - o.y) <= 26) return o;
    }
    return null;
  }

  const onDown = (ev: Event): void => {
    const e = ev as PointerEvent;
    const p = canvasPoint(lab.canvas, e, BASE_W);
    if (phase === "sort") {
      const hit = placedAt(p.x, p.y);
      if (!hit) return;
      haptic(HAPTIC.tap);
      if (hit.tract) {
        if (!picked.has(hit.id)) {
          picked.add(hit.id);
          say(`${hit.name}, 음식물이 지나가요.`);
          if (picked.size === 6) {
            lab.collect("sort", "소화관 6곳");
          }
        }
      } else {
        wrongFlash = hit.id;
        wrongUntil = performance.now() + 1400;
        haptic(HAPTIC.wrong);
        say(`${hit.name}은(는) 소화샘이에요. 음식물은 지나가지 않고 소화액만 보내 줘요.`, 4200);
      }
      return;
    }
    if (held) { drop(held, p.x, p.y); held = null; drag = null; return; }
    const t = tileAt(p.x, p.y);
    if (!t) return;
    capturePointer(lab.canvas, e);
    held = t;
    drag = p;
    downAt = p;
    lab.canvas.classList.add("grabbing");
  };
  const onMove = (ev: Event): void => {
    if (held) drag = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
  };
  const onUp = (ev: Event): void => {
    if (!held) return;
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    lab.canvas.classList.remove("grabbing");
    const moved = downAt ? Math.hypot(p.x - downAt.x, p.y - downAt.y) : 0;
    if (moved < 8) {
      drag = null;
      say(`${held.name} 이름표를 들었어요. 놓을 자리를 탭하세요.`);
    } else {
      drop(held, p.x, p.y);
      held = null;
      drag = null;
    }
    downAt = null;
  };
  life.on(lab.canvas, "pointerdown", onDown);
  life.on(lab.canvas, "pointermove", onMove);
  life.on(lab.canvas, "pointerup", onUp);
  life.on(lab.canvas, "pointercancel", onUp);
  life.on(resetBtn, "click", () => {
    placed.clear();
    picked.clear();
    held = null;
    drag = null;
    phase = "build";
    sortBtn.style.display = "none";
    haptic(HAPTIC.tap);
    say("이름표를 모두 트레이로 되돌렸어요.");
  });
  life.on(sortBtn, "click", () => {
    picked.clear();
    phase = "sort";
    haptic(HAPTIC.tap);
    say("음식물이 지나가는 기관만 탭하세요. 여섯 곳이에요.");
  });

  // ── 그리기 ──────────────────────────────────────────────────────────────
  const BODY_DY = 26; // ORGANS 좌표를 26px 내린 만큼 그림도 같이 내린다

  function drawBody(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(0, BODY_DY);
    ctx.fillStyle = withAlpha("#4E7286", 0.16);
    ctx.beginPath();
    ctx.moveTo(180, 12);
    ctx.bezierCurveTo(214, 12, 226, 40, 224, 66);
    ctx.bezierCurveTo(276, 82, 288, 130, 286, 200);
    ctx.bezierCurveTo(286, 280, 268, 330, 250, 356);
    ctx.lineTo(110, 356);
    ctx.bezierCurveTo(92, 330, 74, 280, 74, 200);
    ctx.bezierCurveTo(72, 130, 84, 82, 136, 66);
    ctx.bezierCurveTo(134, 40, 146, 12, 180, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = withAlpha("#8FA6C2", 0.28);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function drawTract(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(0, BODY_DY);
    // 식도 → 위 → 작은창자 → 큰창자 → 항문. 놓인 기관만 진하게 드러난다.
    const on = (id: string): number => (placed.has(id) ? 1 : 0.22);

    ctx.save();
    ctx.globalAlpha = on("esoph");
    drawTube(ctx, [{ x: 180, y: 46 }, { x: 180, y: 118 }], 13, "gut");
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = on("stomach");
    ctx.beginPath();
    ctx.moveTo(178, 118);
    ctx.bezierCurveTo(140, 122, 112, 142, 118, 166);
    ctx.bezierCurveTo(124, 190, 158, 196, 172, 176);
    ctx.bezierCurveTo(180, 164, 176, 140, 178, 118);
    ctx.closePath();
    const g = ctx.createLinearGradient(110, 118, 180, 196);
    g.addColorStop(0, TISSUE.gut.mid);
    g.addColorStop(1, TISSUE.gut.lo);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = TISSUE.gut.lo;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = on("large");
    drawTube(ctx, [
      { x: 208, y: 200 }, { x: 246, y: 208 }, { x: 250, y: 300 }, { x: 180, y: 314 },
      { x: 112, y: 300 }, { x: 116, y: 208 }, { x: 152, y: 200 },
    ], 17, "gut");
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = on("small");
    const coil: { x: number; y: number }[] = [];
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      coil.push({ x: 180 + Math.sin(t * Math.PI * 6.2) * 44, y: 212 + t * 78 });
    }
    drawTube(ctx, coil, 11, "gut");
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = on("anus");
    drawTube(ctx, [{ x: 180, y: 314 }, { x: 180, y: 346 }], 11, "gut");
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = on("mouth");
    ctx.fillStyle = TISSUE.gut.mid;
    ctx.beginPath();
    ctx.ellipse(180, 36, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = TISSUE.gut.lo;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  function drawGlands(ctx: CanvasRenderingContext2D): void {
    for (const o of ORGANS) {
      if (o.tract) continue;
      const set = placed.has(o.id);
      ctx.save();
      ctx.globalAlpha = set ? 1 : 0.2;
      const m = TISSUE.gland;
      const g = ctx.createRadialGradient(o.x - 5, o.y - 5, 2, o.x, o.y, 20);
      g.addColorStop(0, m.hi);
      g.addColorStop(1, m.lo);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(o.x, o.y, o.id === "liver" ? 22 : 15, o.id === "liver" ? 16 : 11, o.id === "pancreas" ? -0.3 : 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = m.lo;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      if (set && o.duct) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = withAlpha(anMat("sugar").hi, 0.85);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(o.duct.x, o.duct.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }
  }

  function drawSlots(ctx: CanvasRenderingContext2D, t: number): void {
    for (const o of ORGANS) {
      if (placed.has(o.id)) continue;
      const active = held && held.id === o.id;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = active ? anMat("energy").mid : withAlpha("#8FA6C2", 0.4);
      ctx.lineWidth = active ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.arc(o.x, o.y, 20 + (active ? Math.sin(t / 260) * 2 : 0), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawTile(ctx: CanvasRenderingContext2D, o: Organ, x: number, y: number, scale = 1): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const m = o.tract ? TISSUE.gut : TISSUE.gland;
    const g = ctx.createLinearGradient(0, -TILE_H / 2, 0, TILE_H / 2);
    g.addColorStop(0, m.mid);
    g.addColorStop(1, m.lo);
    ctx.fillStyle = g;
    roundRect(ctx, -TILE_W / 2, -TILE_H / 2, TILE_W, TILE_H, 9);
    ctx.fill();
    ctx.strokeStyle = m.lo;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = withAlpha(m.hi, 0.4);
    roundRect(ctx, -TILE_W / 2 + 3, -TILE_H / 2 + 2.5, TILE_W - 6, 5, 3);
    ctx.fill();
    ctx.font = "800 12px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(o.name, 0, 0.5);
    ctx.restore();
  }

  const loop: Loop = createLoop((_dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    drawBody(ctx);
    drawTract(ctx);
    drawGlands(ctx);
    if (phase === "build") drawSlots(ctx, t);

    // 놓인 기관 이름표
    for (const o of ORGANS) {
      if (!placed.has(o.id)) continue;
      const chosen = picked.has(o.id);
      const wrong = wrongFlash === o.id && t < wrongUntil;
      labelChip(ctx, o.x, o.y + (o.tract ? 0 : -22), o.name, {
        size: 10,
        bg: wrong
          ? withAlpha("#F04452", 0.94)
          : chosen
            ? withAlpha("#04B45F", 0.94)
            : withAlpha("#0B1524", 0.8),
      });
      if (phase === "sort" && !chosen && !wrong) {
        ctx.save();
        ctx.strokeStyle = withAlpha("#FFFFFF", 0.32 + 0.18 * Math.sin(t / 300));
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(o.x, o.y, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 트레이
    ctx.fillStyle = withAlpha("#0B1524", 0.44);
    roundRect(ctx, 8, 390, 344, 112, 12);
    ctx.fill();
    for (const o of ORGANS) {
      if (placed.has(o.id)) continue;
      if (held?.id === o.id && drag) continue;
      const p = trayPos(o.id);
      drawTile(ctx, o, p.x, p.y, held?.id === o.id ? 1.06 : 1);
    }
    if (held && drag) drawTile(ctx, held, drag.x, drag.y, 1.08);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 382, toast, { size: 10, bg: withAlpha("#0B1524", 0.92), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(phase === "sort" ? `고른 소화관 ${picked.size}/6` : `놓은 기관 ${placed.size}/10`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
