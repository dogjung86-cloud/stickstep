// cellScaleLab — "세포는 왜 맨눈으로 안 보일까"를 배율 눈금으로 체험시키는 스크럽 랩(중1 Ⅱ L1).
//  · 슬라이더(1배 → 40배 → 400배)를 올리면 손등 → 피부 표면 무늬 → 세포로 화면이 이어서 확대된다.
//    세 층은 각자의 기준 배율(1·40·400)을 가지고 "현재 배율 ÷ 기준 배율"만큼 확대되며 크로스페이드되므로,
//    다른 그림으로 갈아탄 느낌이 아니라 한 번의 줌으로 읽힌다.
//  · 40 µm 눈금자를 무대 아래에 상시 표기한다. 1배에서 손 전체(폭 250 mm)가 관찰 창에 담기므로
//    눈금 길이 = 0.053 × 배율(px)이라, 1배에서는 점보다도 작고(그래서 맨눈으로 안 보이고)
//    400배에서 비로소 세포 하나와 나란해진다. "안 보인다"를 말이 아니라 눈금으로 체험시키는 장치.
//    **세포 크기는 이 눈금에서 역산한다(CELL_PX)** — 숫자를 따로 적으면 FIELD_1X를 바꾸는 순간
//    "눈금과 세포가 나란하다"는 랩의 결론이 조용히 거짓이 된다.
//  · 목표 2개: 400배까지 올려 세포 보기 · 눈금자를 세포에 대어 크기 확인하기.
//  · 슬라이더 경계 밖은 core/rubber.ts 러버밴딩(모션 격상 ③ — 파일럿 heatParticles와 같은 3줄).
//
// 캔버스는 논리 좌표 360폭으로 설계하고 프레임마다 ctx.scale(k)로 실제 폭에 맞춘다.
// 글자는 fpx()로 화면 12px 아래로 내려가지 않게 보정한다(실기기 가독성 규칙).

import { clamp, el, smooth } from "../../core/dom";
import { rubber } from "../../core/rubber";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3-cell.css";

interface CellScaleStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "mag" | "ruler";

const CVH = 344;
const BASE_W = 360;
const MAG_MAX = 400;
const LOG_MAX = Math.log(MAG_MAX);
/**
 * 1배에서 관찰 창에 담기는 실제 폭(µm) — **손 전체가 들어오도록 250 mm**(창이 가로 332 : 세로 250이라
 * 세로로 188 mm, 손목까지 약 175 mm인 손이 꽉 찬다). 배율 m에서는 250000/m µm가 담긴다.
 * 이 값이 곧 40배(6.3 mm 피부 조각)·400배(625 µm 시야)의 현실성을 정한다 — 광학현미경 400배의
 * 실제 시야가 0.5 mm 안팎이라 이 세팅이 교과서 값과 맞는다.
 */
const FIELD_1X = 250000;
const RULER_UM = 40;
const VIEW = { x: 14, y: 12, w: 332, h: 250 };
const MEM = "#12B886";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CellShape {
  pts: [number, number][];
  nx: number; ny: number; nr: number;
}

export const cellScaleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CellScaleStep;
  const rnd = mulberry32(20260726);

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges duo" },
    el("div", { class: "pn-badge bio", dataset: { g: "mag" } }, el("b", { text: "400배까지" }), el("span", { text: "세포 보기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "ruler" } }, el("b", { text: "눈금자" }), el("span", { text: "크기 재기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "손등을 맨눈으로 보고 있어요. 아래 <b>배율 슬라이더를 오른쪽으로 밀어</b> 점점 크게 확대해 보세요. 어디까지 올려야 세포가 보일까요?",
  });
  const canvas = el("canvas", {
    class: "b3-canvas zcl-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "배율을 올리면 손등에서 피부 표면 무늬를 거쳐 세포까지 확대되는 관찰 창과 40 마이크로미터 눈금자",
    },
  });
  const magPill = el("span", { text: "1배 · 맨눈" });
  const fieldPill = el("span", { text: "보이는 폭 60 mm" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage zcl-stage" },
    canvas,
    el(
      "div", { class: "stage-hud" },
      el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${MEM}` }), magPill),
      el("div", { class: "pill" }, fieldPill),
    ),
    toast,
  );

  // ── 배율 슬라이더(러버밴딩) ─────────────────────────────────────────
  const thumb = el("div", { class: "sl-thumb" }, el("i", {}));
  const fill = el("div", { class: "sl-fill" });
  const tick = (pct: number, label: string, edge: string): HTMLElement =>
    el("div", { class: `sl-tick zcl-tick ${edge}`, style: `left:${pct}%` }, el("span", { text: label }));
  const track = el(
    "div", { class: "sl-track plain zcl-track" },
    fill, thumb,
    tick(0, "1배", "zcl-s"),
    tick((Math.log(40) / LOG_MAX) * 100, "40배", ""),
    tick(100, "400배", "zcl-e"),
  );
  const slider = el(
    "div",
    {
      class: "slider zcl-slider",
      attrs: {
        role: "slider", tabindex: "0", "aria-label": "관찰 배율",
        "aria-valuemin": "1", "aria-valuemax": String(MAG_MAX), "aria-valuenow": "1", "aria-valuetext": "1배",
      },
    },
    track,
  );

  const rulerBtn = el("button", { class: "btn b3-btn zcl-btn", attrs: { type: "button" }, text: "눈금자를 세포에 대 보기" });
  rulerBtn.disabled = true;
  const controls = el("div", { class: "b3-controls" }, slider, rulerBtn);

  host.append(goalsEl, helper, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ── 상태 ────────────────────────────────────────────────────────────
  let W = BASE_W;
  let k = 1;
  let u = 0;      // 슬라이더 값 0..1 (배율의 로그 축)
  let uD = 0;     // 화면 표시용(관성)
  let dragging = false;
  let rulerOn = false;
  let rulerT = 0;
  let toastTimer = 0;
  let finished = false;
  const goals = new Set<Goal>();

  const magOf = (v: number): number => Math.exp(v * LOG_MAX);
  const fieldOf = (m: number): number => FIELD_1X / m; // µm
  /** 논리 px per µm — 눈금자와 세포 크기가 같은 자로 재어진다. */
  const pxPerUm = (m: number): number => VIEW.w / fieldOf(m);
  /** 화면에서 12px 아래로 내려가지 않는 논리 글자 크기. */
  const fpx = (v: number): number => Math.max(v, 12 / k);

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const collect = (id: Goal, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    (goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement).classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 2 && !finished) {
      finished = true;
      helper.innerHTML =
        "40 µm 눈금과 세포 하나가 거의 같아요. 1 mm를 25칸으로 나눈 한 칸 크기라, <b>세포는 대부분 맨눈으로 볼 수 없고</b> 현미경으로만 보여요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "세포 정리하기");
    }
  };

  // ── 세포 모양(한 번만 생성 — 매 프레임 흔들리지 않게) ────────────────
  /** 400배 화면에서 세포 하나(=눈금자 40 µm)가 차지하는 논리 px. 세포 지름·간격을 전부 여기서 뽑는다. */
  const CELL_PX = pxPerUm(400) * RULER_UM;
  const cells: CellShape[] = [];
  {
    const cx = VIEW.x + VIEW.w / 2;
    const cy = VIEW.y + VIEW.h / 2;
    const gap = CELL_PX * 1.06;
    // 400배 미만에서는 이 층이 축소돼 그려지므로 창보다 훨씬 넓게 깔아 둔다(그리기는 컬링).
    const cols = Math.ceil(480 / gap), rows = Math.ceil(360 / (gap * 0.86));
    for (let row = -rows; row <= rows; row++) {
      for (let col = -cols; col <= cols; col++) {
        const ox = cx + col * gap + (row & 1 ? gap / 2 : 0) + (rnd() - 0.5) * gap * 0.34;
        const oy = cy + row * (gap * 0.86) + (rnd() - 0.5) * gap * 0.34;
        const n = 7;
        const rot = rnd() * Math.PI * 2;   // 낱개 회전이 없으면 벌집 무늬로 읽힌다
        const pts: [number, number][] = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rot + rnd() * 0.22;
          const r = CELL_PX * (0.46 + rnd() * 0.18);
          pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r * 0.92]);
        }
        cells.push({
          pts,
          nx: ox + (rnd() - 0.5) * CELL_PX * 0.18,
          ny: oy + (rnd() - 0.5) * CELL_PX * 0.14,
          nr: CELL_PX * (0.15 + rnd() * 0.035),
        });
      }
    }
  }

  // 피부 표면 무늬(소구·소릉)용 고정 난수
  const pores: [number, number][] = [];
  for (let i = 0; i < 14; i++) pores.push([rnd() * 520 - 260, rnd() * 460 - 230]);

  // ── 손(1배 층) ───────────────────────────────────────────────────────
  // **플랫 일러스트 문법**(사용자 확정 2026-07-26): 면 하나 + 한쪽 그늘 + 코럴 외곽선 + 손톱이 전부다.
  // 사실적 질감(모공·잔털·힘줄·정맥)을 얹었더니 오히려 "퉁퉁 부은 손"으로 읽혔다 — 전부 걷어냈다.
  // 손은 잘라 보여 주지 않고 **손목까지 통째로** 담는다(잘린 손은 굵기만 보여 부어 보인다).
  // 좌표는 손 국소계(원점 = 손등 한가운데, y 음수가 손끝). 왼손을 손등 쪽에서 본 모습이라 엄지가 오른쪽이다.
  interface Digit { bx: number; by: number; ang: number; len: number; w0: number; w1: number }
  interface DigitPts {
    bl: [number, number]; br: [number, number]; tl: [number, number]; tr: [number, number];
    capL: [number, number]; capR: [number, number];
    dir: [number, number]; perp: [number, number]; w1: number;
  }
  /**
   * 새끼·약지·중지·검지(왼쪽부터). 길이·굵기·벌어진 각이 전부 달라야 갈퀴가 아니라 손가락으로 읽힌다.
   * **비율이 곧 두께감이다**(사용자 피드백 "너무 뚱뚱하다"로 재실측): 실물 손은
   * 손바닥 길이 ≈ 가운뎃손가락 길이, 손바닥 폭 ≈ 손가락 폭의 5배, 손목 폭 ≈ 손바닥 폭의 55%.
   * 손바닥이 손가락보다 길거나(1.5배였다) 손목이 안 좁아지면 그 즉시 부은 손으로 읽힌다.
   */
  const FINGERS: Digit[] = [
    { bx: -54, by: 10, ang: -0.27, len: 76, w0: 9.5, w1: 7.5 },
    { bx: -28, by: -6, ang: -0.13, len: 98, w0: 11, w1: 8.5 },
    { bx: -1, by: -10, ang: -0.01, len: 104, w0: 11.5, w1: 9 },
    { bx: 26, by: -4, ang: 0.12, len: 96, w0: 11, w1: 8.5 },
  ];
  /** 엄지는 위에서 보면 단축돼 짧고 두껍다. */
  const THUMB: Digit = { bx: 42, by: 42, ang: 1, len: 62, w0: 14, w1: 10 };
  const SKIN = "#FBDDCD", SHADE = "242,193,171", LINE = "#E29B80", NAIL = "#FDEEE5";

  const digitPts = (d: Digit): DigitPts => {
    const dx = Math.sin(d.ang), dy = -Math.cos(d.ang);  // 손끝 방향
    const px = Math.cos(d.ang), py = Math.sin(d.ang);   // 손가락 오른쪽 방향
    const tx = d.bx + dx * d.len, ty = d.by + dy * d.len;
    const cap = d.w1 * 1.33;                            // 반원 끝을 베지에로 근사하는 제어 거리
    return {
      bl: [d.bx - px * d.w0, d.by - py * d.w0],
      br: [d.bx + px * d.w0, d.by + py * d.w0],
      tl: [tx - px * d.w1, ty - py * d.w1],
      tr: [tx + px * d.w1, ty + py * d.w1],
      capL: [tx - px * d.w1 + dx * cap, ty - py * d.w1 + dy * cap],
      capR: [tx + px * d.w1 + dx * cap, ty + py * d.w1 + dy * cap],
      dir: [dx, dy], perp: [px, py], w1: d.w1,
    };
  };
  const FP = FINGERS.map(digitPts);
  const TP = digitPts(THUMB);

  /**
   * 이웃한 두 손가락이 갈라지는 점. **밑동보다 손끝 쪽**에 있어야 손가락이 손에 붙어 보인다 —
   * 밑동 높이까지 내리면 막대 네 개가 따로 꽂힌 그림이 되고, 그 사이를 위로 부풀리면 혹이 달린다.
   */
  const CROTCH: [number, number][] = [0, 1, 2].map((i): [number, number] => [
    (FP[i].br[0] + FP[i + 1].bl[0]) / 2, (FP[i].br[1] + FP[i + 1].bl[1]) / 2 - 11,
  ]);

  /** 손목 → 엄지 → 네 손가락(오른쪽부터) → 손날 → 손목으로 한 바퀴 도는 실루엣. */
  function handOutline(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(15, 210);                                       // 손목 오른쪽(화면 밖)
    ctx.bezierCurveTo(15, 150, 38, 104, TP.br[0], TP.br[1]);   // 손목 → 엄지 두덩(여기서 폭이 벌어진다)
    ctx.quadraticCurveTo(72, 40, TP.tr[0], TP.tr[1]);          // 엄지 바깥선
    ctx.bezierCurveTo(TP.capR[0], TP.capR[1], TP.capL[0], TP.capL[1], TP.tl[0], TP.tl[1]);
    ctx.quadraticCurveTo(60, 8, TP.bl[0], TP.bl[1]);           // 엄지 안쪽선
    ctx.quadraticCurveTo(30, 14, FP[3].br[0], FP[3].br[1]);    // 엄지·검지 물갈퀴(얕게 파인다)
    for (let i = FP.length - 1; i >= 0; i--) {
      const f = FP[i];
      const from = i === FP.length - 1 ? f.br : CROTCH[i];
      const to = i === 0 ? f.bl : CROTCH[i - 1];
      ctx.quadraticCurveTo(
        (from[0] + f.tr[0]) / 2 + f.perp[0] * 2, (from[1] + f.tr[1]) / 2 + f.perp[1] * 2,
        f.tr[0], f.tr[1],
      );
      ctx.bezierCurveTo(f.capR[0], f.capR[1], f.capL[0], f.capL[1], f.tl[0], f.tl[1]);
      ctx.quadraticCurveTo(
        (f.tl[0] + to[0]) / 2 - f.perp[0] * 2, (f.tl[1] + to[1]) / 2 - f.perp[1] * 2,
        to[0], to[1],
      );
    }
    // 손날은 새끼손가락 옆선이 내려오던 방향을 이어받아야 한다(제어점을 반대쪽에 두면 각이 진다)
    ctx.bezierCurveTo(-62, 30, -66, 56, -58, 84);
    ctx.quadraticCurveTo(-50, 140, -46, 210);                  // 손목 왼쪽(화면 밖 — 손바닥의 55% 폭)
    ctx.closePath();
  }

  /** 손가락 하나가 실루엣에서 차지하는 조각 — 그늘을 그 안에만 칠하려고 쓴다. */
  function digitPath(
    ctx: CanvasRenderingContext2D, f: DigitPts, from: [number, number], to: [number, number],
  ): void {
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(f.tr[0], f.tr[1]);
    ctx.bezierCurveTo(f.capR[0], f.capR[1], f.capL[0], f.capL[1], f.tl[0], f.tl[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.closePath();
  }

  // ── 층 그리기(전부 논리 좌표 · 라벨은 층 밖에서 따로) ────────────────
  function drawHand(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.translate(cx - 18, cy + 3);   // 실루엣 중심(x≈18)을 창 한가운데로. y+3은 손끝 여백

    handOutline(ctx);
    ctx.fillStyle = SKIN;
    ctx.fill();

    ctx.save();
    handOutline(ctx);
    ctx.clip();

    // 손가락마다 왼쪽은 밝은 테, 오른쪽은 한 톤 어두운 면. 플랫이라 경계를 좁게 끊는다
    // (넓게 번지면 사실화가 되고, 사실화는 이 크기에서 부은 손으로 읽힌다).
    const shadeDigit = (f: DigitPts, from: [number, number], to: [number, number]): void => {
      ctx.save();
      digitPath(ctx, f, from, to);
      ctx.clip();
      const g = ctx.createLinearGradient(f.bl[0], f.bl[1], f.br[0], f.br[1]);
      g.addColorStop(0, "rgba(255,247,241,.85)");
      g.addColorStop(0.2, "rgba(255,247,241,0)");
      g.addColorStop(0.6, `rgba(${SHADE},0)`);
      g.addColorStop(0.72, `rgba(${SHADE},.9)`);
      g.addColorStop(1, `rgba(${SHADE},.9)`);
      ctx.fillStyle = g;
      ctx.fillRect(-260, -280, 540, 560);
      ctx.restore();
    };
    for (let i = 0; i < FP.length; i++) {
      shadeDigit(FP[i], i === FP.length - 1 ? FP[i].br : CROTCH[i], i === 0 ? FP[i].bl : CROTCH[i - 1]);
    }
    shadeDigit(TP, TP.br, TP.bl);

    // 손등 자체의 그늘 — 오른쪽·아래 테두리를 따라 도는 한 겹
    const pg = ctx.createRadialGradient(-38, 8, 10, -18, 38, 116);
    pg.addColorStop(0, `rgba(${SHADE},0)`);
    pg.addColorStop(0.6, `rgba(${SHADE},0)`);
    pg.addColorStop(0.76, `rgba(${SHADE},.62)`);
    pg.addColorStop(1, `rgba(${SHADE},.62)`);
    ctx.fillStyle = pg;
    ctx.fillRect(-260, -280, 540, 560);

    // 손톱 다섯 — 손톱만큼 강한 "손" 신호가 없다
    for (const f of [...FP, TP]) {
      const tx = (f.tl[0] + f.tr[0]) / 2, ty = (f.tl[1] + f.tr[1]) / 2;
      const nx = tx - f.dir[0] * f.w1 * 1.05, ny = ty - f.dir[1] * f.w1 * 1.05;
      ctx.beginPath();
      ctx.ellipse(nx, ny, f.w1 * 1.02, f.w1 * 0.62, Math.atan2(f.dir[1], f.dir[0]), 0, Math.PI * 2);
      ctx.fillStyle = NAIL;
      ctx.fill();
      ctx.strokeStyle = "rgba(226,155,128,.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    handOutline(ctx);
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
    drawBracket(ctx, cx, cy, VIEW.w / 40);
  }

  function drawSkin(ctx: CanvasRenderingContext2D, cx: number, cy: number, mag: number): void {
    // 이 층은 mag/40배로 그려진다 — 40배보다 낮으면 축소돼 창보다 작아지므로, 그리는 범위를
    // 배율에 맞춰 넓힌다. 고정 범위로 두면 저배율에서 **피부가 네모난 조각으로** 떠 보인다.
    const ext = Math.min(1250, VIEW.w / 2 / (mag / 40) + 60);
    const g = ctx.createLinearGradient(cx - 260, cy - 240, cx + 260, cy + 240);
    g.addColorStop(0, "#F3CDAF");
    g.addColorStop(0.5, "#E5B08B");
    g.addColorStop(1, "#D19A73");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 3000, cy - 2800, 6000, 5600);
    // 피부 표면의 골(소구)이 만드는 그물 무늬
    ctx.lineCap = "round";
    const fam = (angle: number, gap: number, alpha: number, width: number): void => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = `rgba(150,96,64,${alpha})`;
      ctx.lineWidth = width;
      const n = Math.ceil(ext / gap);
      for (let i = -n; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(-ext, i * gap);
        for (let x = -ext; x <= ext; x += 40) ctx.lineTo(x, i * gap + Math.sin((x + i * 90) / 60) * 4);
        ctx.stroke();
      }
      ctx.restore();
    };
    fam(0.52, 66, 0.42, 4);
    fam(-0.52, 66, 0.42, 4);
    fam(1.57, 132, 0.18, 3);
    // 땀구멍과 털구멍
    ctx.fillStyle = "rgba(126,78,52,.5)";
    for (const [px, py] of pores) {
      ctx.beginPath();
      ctx.arc(cx + px, cy + py, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(112,72,48,.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 96, cy + 60);
    ctx.quadraticCurveTo(cx + 128, cy + 30, cx + 168, cy + 26);
    ctx.stroke();
    drawBracket(ctx, cx, cy, VIEW.w / 10);
  }

  function drawCellLayer(ctx: CanvasRenderingContext2D, mag: number): void {
    ctx.fillStyle = "#F2E4F6";
    ctx.fillRect(VIEW.x - 1100, VIEW.y - 1100, VIEW.w + 2200, VIEW.h + 2200);
    // 이 층은 mag/400배로 그려진다 — 400배 아래에서는 축소돼 훨씬 넓은 범위가 들어오므로
    // 세포를 넓게 깔아 두고 화면에 실제로 걸리는 것만 그린다(전부 그리면 1000개가 넘는다).
    const s = mag / 400;
    const mx = VIEW.x + VIEW.w / 2, my = VIEW.y + VIEW.h / 2;
    const hw = VIEW.w / 2 / s + CELL_PX, hh = VIEW.h / 2 / s + CELL_PX;
    for (const c of cells) {
      if (Math.abs(c.nx - mx) > hw || Math.abs(c.ny - my) > hh) continue;
      ctx.beginPath();
      ctx.moveTo(c.pts[0][0], c.pts[0][1]);
      for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
      ctx.closePath();
      const g = ctx.createRadialGradient(c.nx, c.ny, CELL_PX * 0.08, c.nx, c.ny, CELL_PX * 1.4);
      g.addColorStop(0, "#DCEFF9");
      g.addColorStop(1, "#BCD8E8");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = MEM;
      ctx.lineWidth = CELL_PX * 0.062;
      ctx.stroke();
      // 핵
      ctx.beginPath();
      ctx.ellipse(c.nx, c.ny, c.nr, c.nr * 0.86, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#4A5FD6";
      ctx.fill();
      ctx.strokeStyle = "#2B3AA8";
      ctx.lineWidth = CELL_PX * 0.038;
      ctx.stroke();
    }
  }

  /** 다음 배율에서 보게 될 영역 표시 — 확대와 함께 자라나 "여기를 더 본다"가 읽힌다. */
  function drawBracket(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    const h = size / 2;
    ctx.strokeStyle = "rgba(18,184,134,.95)";
    ctx.lineWidth = Math.max(1.2, size * 0.05);
    const arm = size * 0.3;
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + sx * h - sx * arm, cy + sy * h);
        ctx.lineTo(cx + sx * h, cy + sy * h);
        ctx.lineTo(cx + sx * h, cy + sy * h - sy * arm);
        ctx.stroke();
      }
    }
  }

  // ── 라벨·눈금자(층 밖 — 확대 배율에 휘둘리지 않게) ────────────────────
  function drawViewLabel(ctx: CanvasRenderingContext2D, text: string, alpha: number): void {
    if (alpha < 0.06) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const fs = fpx(12.5);
    ctx.font = `800 ${fs}px Pretendard, sans-serif`;
    const w = ctx.measureText(text).width + 22;
    const x = VIEW.x + 12;
    const y = VIEW.y + VIEW.h - 34;
    ctx.fillStyle = "rgba(11,21,36,.82)";
    ctx.strokeStyle = "rgba(255,255,255,.24)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, fs + 14, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#EAF6F1";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + 11, y + (fs + 14) / 2);
    ctx.restore();
  }

  function drawRulerStrip(ctx: CanvasRenderingContext2D, mag: number): void {
    const barPx = pxPerUm(mag) * RULER_UM;
    const x0 = 22;
    const y = 302;
    const fs = fpx(12);
    ctx.save();
    ctx.font = `800 ${fs}px Pretendard, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#F0A63A";
    ctx.fillText(`${RULER_UM} µm 눈금자`, x0, y - 12);
    // 눈금 막대(길이가 곧 배율의 증거)
    ctx.strokeStyle = "#F0A63A";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + Math.max(barPx, 0.6), y);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    for (const ex of [x0, x0 + Math.max(barPx, 0.6)]) {
      ctx.beginPath();
      ctx.moveTo(ex, y - 7);
      ctx.lineTo(ex, y + 7);
      ctx.stroke();
    }
    // 무대 폭(논리 360)을 넘지 않게 짧게 — 캔버스 텍스트는 줄바꿈이 없다.
    // 문턱은 배율이 아니라 실제 눈금 길이(px)로 — FIELD_1X가 바뀌어도 문구가 따라온다.
    const note = barPx < 2
      ? "점보다 작아요. 맨눈으로는 안 보여요"
      : barPx < 16
        ? "겨우 보이기 시작했어요. 아직 작아요"
        : "이제 눈금과 세포가 나란해요";
    ctx.font = `700 ${fpx(12)}px Pretendard, sans-serif`;
    ctx.fillStyle = "#7E93B3";
    ctx.fillText(note, x0, y + 26);
    ctx.restore();
  }

  /** 목표 ②: 눈금자를 세포 옆에 세워 크기를 견주는 연출. */
  function drawRulerOnCell(ctx: CanvasRenderingContext2D, mag: number, t: number): void {
    if (t <= 0.001) return;
    const barPx = pxPerUm(mag) * RULER_UM;
    const cx = VIEW.x + VIEW.w / 2;
    const cy = VIEW.y + VIEW.h / 2;
    const y = cy + 42; // 아래쪽 층 이름표와 겹치지 않는 높이
    const x0 = cx - barPx / 2;
    ctx.save();
    ctx.globalAlpha = clamp(t, 0, 1);
    ctx.strokeStyle = "#FFC65C";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + barPx * clamp(t * 1.4, 0, 1), y);
    ctx.stroke();
    ctx.lineWidth = 2.6;
    for (const ex of [x0, x0 + barPx]) {
      ctx.beginPath();
      ctx.moveTo(ex, y - 9);
      ctx.lineTo(ex, y + 9);
      ctx.stroke();
    }
    const fs = fpx(12.5);
    ctx.font = `800 ${fs}px Pretendard, sans-serif`;
    const label = `세포 하나 ≈ ${RULER_UM} µm`;
    const w = ctx.measureText(label).width + 20;
    const h = fs + 13;
    ctx.fillStyle = "rgba(11,21,36,.86)";
    ctx.strokeStyle = "#FFC65C";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, y - 16 - h, w, h, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFE3AE";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, y - 16 - h / 2);
    ctx.restore();
  }

  // ── 슬라이더 조작 ────────────────────────────────────────────────────
  function syncSlider(): void {
    const pct = u * 100;
    thumb.style.left = `${pct}%`;
    fill.style.width = `${pct}%`;
    const mag = magOf(u);
    slider.setAttribute("aria-valuenow", String(Math.round(mag)));
    slider.setAttribute("aria-valuetext", `${Math.round(mag)}배`);
    rulerBtn.disabled = mag < 200 || goals.has("ruler");
    if (mag >= 380 && !goals.has("mag")) {
      collect("mag", "400배! 이제 세포 하나하나가 보여요");
      helper.innerHTML =
        "세포가 보이기 시작했어요. 아래 <b>눈금자를 세포에 대 보기</b>를 눌러 세포 하나가 얼마나 작은지 재 볼까요?";
    } else if (mag >= 30 && mag < 380 && !goals.has("mag")) {
      helper.innerHTML =
        "피부 표면의 <b>그물 무늬</b>가 보여요. 아직 세포는 안 보여요. 배율을 더 올려 볼까요?";
    }
  }

  function setFromClientX(cx: number): void {
    const r = track.getBoundingClientRect();
    u = clamp((cx - r.left) / r.width, 0, 1);
    const over = cx < r.left ? cx - r.left : cx > r.right ? cx - r.right : 0;
    thumb.style.setProperty("--rb", `${rubber(over, r.width)}px`); // 경계 밖 러버밴딩
    syncSlider();
  }

  const onSliderDown = (e: PointerEvent): void => {
    dragging = true;
    slider.classList.add("drag");
    try { slider.setPointerCapture(e.pointerId); } catch { /* 합성 포인터는 캡처가 없다 */ }
    setFromClientX(e.clientX);
    haptic(HAPTIC.tap);
  };
  const onSliderMove = (e: PointerEvent): void => { if (dragging) setFromClientX(e.clientX); };
  const endDrag = (): void => {
    dragging = false;
    slider.classList.remove("drag");
    thumb.style.setProperty("--rb", "0px"); // 스냅백(.28s 스프링은 base.css .sl-thumb 몫)
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") u = clamp(u + 0.06, 0, 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") u = clamp(u - 0.06, 0, 1);
    else if (e.key === "End") u = 1;
    else if (e.key === "Home") u = 0;
    else return;
    e.preventDefault();
    syncSlider();
  };
  slider.addEventListener("pointerdown", onSliderDown);
  slider.addEventListener("pointermove", onSliderMove);
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);
  slider.addEventListener("keydown", onKey);

  const onRuler = (): void => {
    rulerOn = true;
    rulerBtn.disabled = true;
    haptic(HAPTIC.select);
    collect("ruler", "세포 하나가 눈금과 거의 같아요");
  };
  rulerBtn.addEventListener("click", onRuler);

  // ── 프레임 ───────────────────────────────────────────────────────────
  let lastMagShown = -1;
  const loop: Loop = createLoop((dt) => {
    const fit = fitCanvas(canvas, CVH);
    const ctx = fit.ctx;
    W = fit.w;
    k = W / BASE_W;
    ctx.clearRect(0, 0, W, fit.h);
    ctx.save();
    ctx.scale(k, k);

    uD += (u - uD) * Math.min(1, dt * 0.16);
    if (rulerOn) rulerT = clamp(rulerT + dt * 0.045, 0, 1);
    const mag = magOf(uD);

    // 관찰 창
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h, 16);
    ctx.clip();
    ctx.fillStyle = "#0E1B2C";
    ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);

    const cx = VIEW.x + VIEW.w / 2;
    const cy = VIEW.y + VIEW.h / 2;
    // 층 크로스페이드는 **아래 층을 불투명하게 깔고 위 층을 덮는 방식**이다. 둘 다 반투명으로
    // 겹치면 두 알파의 곱만큼 무대 배경이 비쳐 중간 배율이 흙빛으로 뜬다(실제로 그랬다).
    const tAB = smooth(0.2, 0.5, uD);    // 손 → 피부
    const tBC = smooth(0.7, 0.94, uD);   // 피부 → 세포
    const layer = (home: number, weight: number, draw: () => void): void => {
      if (weight < 0.005) return;
      ctx.save();
      ctx.globalAlpha = clamp(weight, 0, 1);
      ctx.translate(cx, cy);
      ctx.scale(mag / home, mag / home);
      ctx.translate(-cx, -cy);
      draw();
      ctx.restore();
    };
    layer(1, tAB > 0.995 ? 0 : 1, () => drawHand(ctx, cx, cy));
    layer(40, tBC > 0.995 ? 0 : tAB, () => drawSkin(ctx, cx, cy, mag));
    layer(400, tBC, () => drawCellLayer(ctx, mag));
    drawRulerOnCell(ctx, mag, rulerT * tBC);
    // 관찰 창 안쪽 그림자
    const vig = ctx.createRadialGradient(cx, cy, VIEW.w * 0.28, cx, cy, VIEW.w * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(4,10,20,.42)");
    ctx.fillStyle = vig;
    ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    drawViewLabel(ctx, tBC > 0.5 ? "피부를 이루는 세포" : tAB > 0.5 ? "피부 표면 무늬" : "손등 (맨눈)", 1);
    ctx.restore();

    ctx.strokeStyle = "rgba(120,150,190,.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h, 16);
    ctx.stroke();

    drawRulerStrip(ctx, mag);
    ctx.restore();

    const shown = Math.round(mag);
    if (shown !== lastMagShown) {
      lastMagShown = shown;
      magPill.textContent = shown <= 1 ? "1배 · 맨눈" : `${shown}배`;
      const f = fieldOf(mag);
      fieldPill.textContent = f >= 1000
        ? `보이는 폭 ${(f / 1000).toFixed(f >= 10000 ? 0 : 1)} mm`
        : `보이는 폭 ${Math.round(f)} µm`;
    }
  });

  const onResize = (): void => { fitCanvas(canvas, CVH); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); syncSlider(); loop.start(); });

  api.setCTA("배율을 올려 세포를 찾아보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    loop.stop();
    window.removeEventListener("resize", onResize);
    slider.removeEventListener("pointerdown", onSliderDown);
    slider.removeEventListener("pointermove", onSliderMove);
    slider.removeEventListener("pointerup", endDrag);
    slider.removeEventListener("pointercancel", endDrag);
    slider.removeEventListener("keydown", onKey);
    rulerBtn.removeEventListener("click", onRuler);
  };
};
