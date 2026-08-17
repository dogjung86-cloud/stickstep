// anHeartLab — 중2 Ⅵ L6 "심장 펌프실".
// ① 이완(받기) → 수축(내보내기)을 직접 눌러 혈액이 **심방 → 심실 → 동맥** 한 방향으로만 흐르는 것을 보고
// ② 판막을 떼어 역류를 겪고 ③ 심방과 심실의 벽 두께를 탭해 비교한다.
// 색 규약: 산소를 많이 포함한 혈액 = 붉은색, 적게 포함한 혈액 = 푸른색(혈관 종류가 아니라 산소량).

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  TISSUE, VESSEL, canvasPoint, drawRBC, drawTube, drawValve, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 470;

type Pt = { x: number; y: number };
type Side = "right" | "left";

interface Chamber {
  id: string;
  name: string;
  side: Side;
  /** 심실인가(벽이 두껍고 동맥으로 내보낸다). */
  ventricle: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 벽 두께(상대값) — 좌심실이 가장 두껍다. */
  wall: number;
  role: string;
}

const CHAMBERS: Chamber[] = [
  { id: "ra", name: "우심방", side: "right", ventricle: false, x: 98, y: 118, w: 70, h: 58, wall: 3, role: "대정맥에서 혈액을 받아들여요" },
  { id: "la", name: "좌심방", side: "left", ventricle: false, x: 194, y: 118, w: 70, h: 58, wall: 3, role: "폐정맥에서 혈액을 받아들여요" },
  { id: "rv", name: "우심실", side: "right", ventricle: true, x: 100, y: 198, w: 70, h: 104, wall: 7, role: "폐동맥으로 혈액을 내보내요" },
  { id: "lv", name: "좌심실", side: "left", ventricle: true, x: 192, y: 198, w: 72, h: 116, wall: 12, role: "대동맥으로 온몸에 혈액을 내보내요" },
];

// 혈관 — 심방에 들어오는 정맥, 심실에서 나가는 동맥.
const VESSELS: { id: string; name: string; pts: Pt[]; rich: boolean; label: Pt }[] = [
  { id: "vc", name: "대정맥", rich: false, pts: [{ x: 104, y: 40 }, { x: 112, y: 78 }, { x: 128, y: 120 }], label: { x: 58, y: 78 } },
  { id: "pa", name: "폐동맥", rich: false, pts: [{ x: 148, y: 200 }, { x: 152, y: 130 }, { x: 156, y: 36 }], label: { x: 152, y: 22 } },
  { id: "pv", name: "폐정맥", rich: true, pts: [{ x: 262, y: 40 }, { x: 250, y: 78 }, { x: 232, y: 120 }], label: { x: 292, y: 44 } },
  { id: "ao", name: "대동맥", rich: true, pts: [{ x: 214, y: 200 }, { x: 210, y: 120 }, { x: 206, y: 34 }], label: { x: 234, y: 22 } },
];

// 판막 4개 — 심방↔심실 사이, 심실↔동맥 사이.
const VALVES: { id: string; x: number; y: number; side: Side; kind: "av" | "art" }[] = [
  { id: "v-ra", x: 130, y: 188, side: "right", kind: "av" },
  { id: "v-la", x: 228, y: 188, side: "left", kind: "av" },
  { id: "v-rv", x: 148, y: 200, side: "right", kind: "art" },
  { id: "v-lv", x: 214, y: 200, side: "left", kind: "art" },
];

const FILL_PATH: Record<Side, Pt[]> = {
  right: [{ x: 104, y: 40 }, { x: 116, y: 92 }, { x: 130, y: 146 }, { x: 132, y: 190 }, { x: 134, y: 244 }],
  left: [{ x: 262, y: 40 }, { x: 248, y: 92 }, { x: 230, y: 146 }, { x: 228, y: 190 }, { x: 226, y: 250 }],
};
const EJECT_PATH: Record<Side, Pt[]> = {
  right: [{ x: 136, y: 258 }, { x: 146, y: 210 }, { x: 152, y: 130 }, { x: 156, y: 36 }],
  left: [{ x: 226, y: 268 }, { x: 216, y: 212 }, { x: 210, y: 120 }, { x: 206, y: 34 }],
};
const BACK_PATH: Record<Side, Pt[]> = {
  right: [{ x: 134, y: 244 }, { x: 132, y: 190 }, { x: 130, y: 146 }],
  left: [{ x: 226, y: 250 }, { x: 228, y: 190 }, { x: 230, y: 146 }],
};

interface Cell {
  path: Pt[];
  t: number;
  speed: number;
  rich: boolean;
  spin: number;
}

function along(path: Pt[], t: number): Pt {
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    segs.push(d);
    total += d;
  }
  let want = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(1, want / segs[i]);
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * f,
        y: path[i].y + (path[i + 1].y - path[i].y) * f,
      };
    }
    want -= segs[i];
  }
  return path[path.length - 1];
}

export const anHeartLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "심장의 네 방과 판막을 이완·수축시켜 혈액의 흐름 방향을 관찰하는 펌프 모형",
    height: CVH,
    goals: [
      { id: "flow", title: "한 방향 흐름", sub: "이완 → 수축 3번" },
      { id: "valve", title: "판막을 떼면?", sub: "역류 관찰" },
      { id: "wall", title: "벽 두께 비교", sub: "심방 vs 심실" },
    ],
    helper: "<b>이완(혈액 받기)</b>을 누르면 정맥의 혈액이 심방을 지나 심실로 들어와요. 먼저 눌러 볼까요?",
    finish: "정리됐어요! <b>심방</b>은 정맥에서 혈액을 <b>받아들이고</b>, <b>심실</b>은 동맥으로 <b>내보내요</b>. 판막이 있어 혈액은 <b>심방 → 심실 → 동맥</b> 한 방향으로만 흐르고, 온몸으로 멀리 보내야 하는 <b>좌심실의 벽이 가장 두꺼워요</b>.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("three");
  const fillBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "이완<span class='an-btn-sub'>혈액 받기</span>" });
  const ejectBtn = el("button", { class: "an-btn", attrs: { type: "button" }, html: "수축<span class='an-btn-sub'>내보내기</span>" });
  const valveBtn = el("button", { class: "an-btn on", attrs: { type: "button" }, html: "판막 있음<span class='an-btn-sub'>눌러서 떼기</span>" });
  lab.controls.append(fillBtn, ejectBtn, valveBtn);

  let phase: "idle" | "fill" | "eject" = "idle";
  let phaseT = 0;
  let cycles = 0;
  let valvesOn = true;
  let cells: Cell[] = [];
  let toast = "";
  let toastUntil = 0;
  let refluxSeen = false;
  const tapped = new Set<string>();
  let pickedChamber: Chamber | null = null;

  const say = (m: string, ms = 3600): void => { toast = m; toastUntil = performance.now() + ms; };

  function spawn(kind: "fill" | "eject" | "back"): void {
    const paths = kind === "fill" ? FILL_PATH : kind === "eject" ? EJECT_PATH : BACK_PATH;
    for (const side of ["right", "left"] as Side[]) {
      for (let i = 0; i < 5; i++) {
        cells.push({
          path: paths[side],
          t: -i * 0.16,
          speed: kind === "back" ? 0.5 : 0.62,
          rich: side === "left",
          spin: Math.random() * Math.PI,
        });
      }
    }
  }

  function doFill(): void {
    if (phase !== "idle") return;
    phase = "fill";
    phaseT = 0;
    cells = [];
    spawn("fill");
    haptic(HAPTIC.tap);
    lab.setHelper("심방을 지나 심실이 채워졌어요. 이제 <b>수축(내보내기)</b>을 눌러 동맥으로 밀어내 보세요.");
  }

  function doEject(): void {
    if (phase !== "idle") return;
    phase = "eject";
    phaseT = 0;
    cells = [];
    spawn("eject");
    if (!valvesOn) {
      spawn("back"); // 판막이 없으면 일부가 심방으로 거꾸로 샌다
      if (!refluxSeen) {
        refluxSeen = true;
        lab.collect("valve", "혈액이 거꾸로");
        say("판막이 없으니 혈액이 심방으로 거꾸로 새요! 판막은 역류를 막아 줘요.", 5000);
        lab.setHelper("보셨죠? <b>판막</b>이 없으면 혈액이 거꾸로 흘러요. 판막은 <b>심방과 심실 사이</b>, <b>심실과 동맥 사이</b>에 있어 한 방향만 허락해요. 이제 판막을 다시 붙이고, <b>심방과 심실의 벽</b>을 탭해 두께를 비교해 보세요.");
      }
    } else {
      cycles++;
      if (cycles >= 3 && !lab.has("flow")) {
        lab.collect("flow", "심방→심실→동맥");
        lab.setHelper("혈액은 늘 <b>심방 → 심실 → 동맥</b> 한 방향이었죠. 그럼 <b>판막 있음</b> 버튼을 눌러 판막을 떼고 다시 수축시켜 볼까요?");
      }
    }
    haptic(HAPTIC.tap);
  }

  life.on(fillBtn, "click", doFill);
  life.on(ejectBtn, "click", doEject);
  life.on(valveBtn, "click", () => {
    valvesOn = !valvesOn;
    valveBtn.classList.toggle("on", valvesOn);
    valveBtn.innerHTML = valvesOn
      ? "판막 있음<span class='an-btn-sub'>눌러서 떼기</span>"
      : "판막 없음<span class='an-btn-sub'>눌러서 붙이기</span>";
    haptic(HAPTIC.tap);
    say(valvesOn ? "판막을 다시 붙였어요." : "판막을 떼었어요. 수축을 눌러 무슨 일이 생기는지 봐요.");
  });

  const onTap = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    const hit = CHAMBERS.find((c) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h);
    if (!hit) return;
    haptic(HAPTIC.tap);
    pickedChamber = hit;
    tapped.add(hit.ventricle ? "ventricle" : "atrium");
    say(`${hit.name}, 벽 두께 ${hit.wall}단계 · ${hit.role}`, 4600);
    if (tapped.has("atrium") && tapped.has("ventricle") && !lab.has("wall")) {
      lab.collect("wall", "심실이 더 두꺼움");
    }
  };
  life.on(lab.canvas, "pointerdown", onTap);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawHeartBody(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(180, 96);
    ctx.bezierCurveTo(252, 92, 288, 132, 284, 200);
    ctx.bezierCurveTo(280, 280, 240, 340, 184, 356);
    ctx.bezierCurveTo(126, 340, 86, 280, 82, 200);
    ctx.bezierCurveTo(78, 132, 112, 92, 180, 96);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 96, 0, 356);
    g.addColorStop(0, TISSUE.heart.mid);
    g.addColorStop(1, TISSUE.heart.lo);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = TISSUE.heart.lo;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }

  function drawChambers(ctx: CanvasRenderingContext2D): void {
    for (const c of CHAMBERS) {
      const active = pickedChamber?.id === c.id;
      ctx.save();
      // 벽 — 두께를 실제 픽셀로 표현한다(좌심실이 가장 두껍다).
      ctx.fillStyle = withAlpha(TISSUE.heart.lo, 0.95);
      roundRect(ctx, c.x - c.wall, c.y - c.wall, c.w + c.wall * 2, c.h + c.wall * 2, 16);
      ctx.fill();
      // 방 안 — 그 쪽 혈액의 산소량 색
      const m = c.side === "left" ? VESSEL.rich : VESSEL.poor;
      const g = ctx.createLinearGradient(0, c.y, 0, c.y + c.h);
      g.addColorStop(0, m.mid);
      g.addColorStop(1, m.lo);
      ctx.fillStyle = g;
      roundRect(ctx, c.x, c.y, c.w, c.h, 12);
      ctx.fill();
      ctx.strokeStyle = active ? "#FFFFFF" : withAlpha(m.lo, 0.9);
      ctx.lineWidth = active ? 2.6 : 1.2;
      ctx.stroke();
      ctx.restore();
      labelChip(ctx, c.x + c.w / 2, c.y + c.h / 2, c.name, {
        size: 10,
        bg: withAlpha("#0B1524", 0.78),
      });
    }
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 혈관
    for (const v of VESSELS) {
      drawTube(ctx, v.pts, 13, v.rich ? "rich" : "poor");
      labelChip(ctx, v.label.x, v.label.y, v.name, {
        size: 9.5,
        bg: withAlpha(v.rich ? VESSEL.rich.lo : VESSEL.poor.lo, 0.92),
      });
    }

    drawHeartBody(ctx);
    drawChambers(ctx);

    // 판막 — 국면에 따라 열림/닫힘. 판막을 떼면 아예 그리지 않는다.
    if (valvesOn) {
      for (const v of VALVES) {
        const open = v.kind === "av" ? (phase === "fill" ? 1 : 0.06) : (phase === "eject" ? 1 : 0.06);
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(Math.PI / 2); // 위→아래 흐름이라 판막을 세로로 세운다
        drawValve(ctx, 0, 0, 22, open, 1);
        ctx.restore();
      }
      labelChip(ctx, 180, 188, "판막", { size: 9, bg: withAlpha("#0B1524", 0.72) });
    } else {
      labelChip(ctx, 180, 188, "판막 없음", { size: 9, bg: withAlpha("#F04452", 0.92) });
    }

    // 혈구 이동
    if (phase !== "idle") {
      phaseT += dt * 0.016;
      for (const c of cells) c.t += dt * 0.014 * c.speed * 1.6;
      if (phaseT > 1.5) {
        phase = "idle";
        cells = [];
      }
    }
    for (const c of cells) {
      if (c.t < 0 || c.t > 1) continue;
      const p = along(c.path, c.t);
      drawRBC(ctx, p.x, p.y, 5.6, c.spin);
    }

    // 아래 안내 — 지금 무엇을 보고 있는지
    ctx.fillStyle = withAlpha("#0B1524", 0.6);
    roundRect(ctx, 8, 372, 344, 88, 12);
    ctx.fill();
    ctx.font = "800 11px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(
      phase === "fill" ? "이완, 정맥 → 심방 → 심실" : phase === "eject" ? "수축, 심실 → 동맥" : "버튼을 눌러 심장을 움직여 보세요",
      20, 392,
    );
    ctx.fillStyle = withAlpha("#FFFFFF", 0.7);
    ctx.font = "700 10px Pretendard, sans-serif";
    ctx.fillText(`한 방향 흐름 ${Math.min(cycles, 3)}/3 · 벽을 탭하면 두께를 알려 줘요`, 20, 412);
    ctx.fillStyle = withAlpha(VESSEL.rich.mid, 1);
    ctx.fillText("● 산소를 많이 포함한 혈액", 20, 432);
    ctx.fillStyle = withAlpha(VESSEL.poor.mid, 1);
    ctx.fillText("● 산소를 적게 포함한 혈액", 196, 432);

    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 364, toast, { size: 10, bg: withAlpha("#0B1524", 0.93), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(phase === "idle" ? `박동 ${cycles}회` : phase === "fill" ? "이완 중" : "수축 중");
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
  };
};
