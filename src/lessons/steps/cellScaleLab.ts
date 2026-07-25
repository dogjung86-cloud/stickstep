// cellScaleLab — "세포는 왜 맨눈으로 안 보일까"를 배율 눈금으로 체험시키는 스크럽 랩(중1 Ⅱ L1).
//  · 슬라이더(1배 → 40배 → 400배)를 올리면 손등 → 피부 표면 무늬 → 세포로 화면이 이어서 확대된다.
//    세 층은 각자의 기준 배율(1·40·400)을 가지고 "현재 배율 ÷ 기준 배율"만큼 확대되며 크로스페이드되므로,
//    다른 그림으로 갈아탄 느낌이 아니라 한 번의 줌으로 읽힌다.
//  · 40 µm 눈금자를 무대 아래에 상시 표기한다. 1배에서 손등 폭 60 mm가 관찰 창에 담긴다고 두면
//    눈금 길이 = 0.221 × 배율(px)이라, 1배에서는 점보다도 작고(그래서 맨눈으로 안 보이고)
//    400배에서 비로소 세포 하나와 나란해진다. "안 보인다"를 말이 아니라 눈금으로 체험시키는 장치.
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
/** 1배에서 관찰 창에 담기는 실제 폭(µm) — 손등 약 60 mm. 배율 m에서는 60000/m µm가 담긴다. */
const FIELD_1X = 60000;
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
  const cells: CellShape[] = [];
  {
    const cx = VIEW.x + VIEW.w / 2;
    const cy = VIEW.y + VIEW.h / 2;
    const step2 = 96;
    for (let row = -1; row <= 1; row++) {
      for (let col = -2; col <= 2; col++) {
        const ox = cx + col * step2 + (row & 1 ? step2 / 2 : 0) + (rnd() - 0.5) * 12;
        const oy = cy + row * (step2 * 0.86) + (rnd() - 0.5) * 12;
        const n = 7;
        const pts: [number, number][] = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + rnd() * 0.22;
          const r = 40 + rnd() * 13;
          pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r * 0.92]);
        }
        cells.push({ pts, nx: ox + (rnd() - 0.5) * 16, ny: oy + (rnd() - 0.5) * 12, nr: 12 + rnd() * 3 });
      }
    }
  }

  // 피부 표면 무늬(소구·소릉)용 고정 난수
  const pores: [number, number][] = [];
  for (let i = 0; i < 14; i++) pores.push([rnd() * 520 - 260, rnd() * 460 - 230]);

  // 손등 땀구멍·잔털용 고정 난수(손 국소 좌표)
  const handPores: [number, number][] = [];
  for (let i = 0; i < 30; i++) handPores.push([rnd() * 226 - 116, rnd() * 178 - 34]);
  const handHairs: [number, number, number][] = [];
  for (let i = 0; i < 10; i++) handHairs.push([rnd() * 214 - 110, rnd() * 156 - 22, rnd() - 0.5]);

  // ── 손 ──────────────────────────────────────────────────────────────
  // 부품(둥근 사각형)을 이어 붙이면 손이 아니라 벙어리장갑으로 읽힌다 — 손등·엄지·네 손가락을
  // **실루엣 한 경로**로 그리고, 굴곡(너클 융기·손가락 사이 골·폄근 힘줄·정맥)은 전부 그 위에
  // 얹는 음영으로 만든다. 좌표는 손 중심 기준 국소계이고 y가 음수인 쪽이 손끝이다.
  interface Digit { bx: number; by: number; ang: number; len: number; w0: number; w1: number }
  interface DigitPts {
    bl: [number, number]; br: [number, number]; tl: [number, number]; tr: [number, number];
    capL: [number, number]; capR: [number, number]; knuckle: [number, number];
    dir: [number, number]; perp: [number, number]; w0: number; ang: number;
  }
  /** 검지·중지·약지·새끼 — 길이·굵기·벌어진 각이 전부 달라야 갈퀴가 아니라 손가락으로 읽힌다. */
  const FINGERS: Digit[] = [
    { bx: -88, by: -48, ang: -0.1, len: 152, w0: 21, w1: 15.5 },
    { bx: -29, by: -60, ang: -0.01, len: 168, w0: 22, w1: 16 },
    { bx: 29, by: -54, ang: 0.075, len: 156, w0: 21, w1: 15 },
    { bx: 82, by: -34, ang: 0.2, len: 122, w0: 18, w1: 13 },
  ];
  /** 엄지는 위에서 보면 단축돼 짧고 두껍다. 왼쪽에서 뻗으므로 이 손은 오른손이다. */
  const THUMB: Digit = { bx: -114, by: 40, ang: -0.98, len: 62, w0: 26, w1: 17 };

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
      knuckle: [d.bx + dx * 8, d.by + dy * 8],
      dir: [dx, dy], perp: [px, py], w0: d.w0, ang: d.ang,
    };
  };
  const FP = FINGERS.map(digitPts);
  const TP = digitPts(THUMB);

  /**
   * 이웃한 두 손가락이 갈라지는 점. **너클보다 손끝 쪽**에 있어야 손가락이 손에 붙어 보인다 —
   * 너클 높이까지 내려오면 네 개의 막대가 따로 꽂힌 그림이 되고, 그 사이를 위로 부풀리면
   * 손가락마다 혹이 달린 반죽처럼 보인다. 이 점이 곧 두 손가락 옆선의 만남이다.
   */
  const crotchOf = (a: DigitPts, b: DigitPts): [number, number] =>
    [(a.br[0] + b.bl[0]) / 2, (a.br[1] + b.bl[1]) / 2 - 24];
  const CROTCH: [number, number][] = [crotchOf(FP[0], FP[1]), crotchOf(FP[1], FP[2]), crotchOf(FP[2], FP[3])];

  /** 손목 → 엄지 → 네 손가락 → 손날 → 손목으로 한 바퀴 도는 실루엣. */
  function handOutline(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(-100, 178);
    ctx.quadraticCurveTo(-137, 126, TP.bl[0], TP.bl[1]);      // 엄지 두덩(굵은 밑동에서 자라야 붙어 보인다)
    ctx.quadraticCurveTo(-158, 52, TP.tl[0], TP.tl[1]);
    ctx.bezierCurveTo(TP.capL[0], TP.capL[1], TP.capR[0], TP.capR[1], TP.tr[0], TP.tr[1]);
    ctx.quadraticCurveTo(-128, -6, TP.br[0], TP.br[1]);       // 엄지 안쪽선
    ctx.quadraticCurveTo(-88, -14, FP[0].bl[0], FP[0].bl[1]); // 엄지·검지 물갈퀴(안으로 파인다)
    for (let i = 0; i < FP.length; i++) {
      const f = FP[i];
      const from = i === 0 ? f.bl : CROTCH[i - 1];
      const to = i === FP.length - 1 ? f.br : CROTCH[i];
      ctx.quadraticCurveTo(
        (from[0] + f.tl[0]) / 2 - f.perp[0] * 3, (from[1] + f.tl[1]) / 2 - f.perp[1] * 3,
        f.tl[0], f.tl[1],
      );
      ctx.bezierCurveTo(f.capL[0], f.capL[1], f.capR[0], f.capR[1], f.tr[0], f.tr[1]);
      ctx.quadraticCurveTo(
        (f.tr[0] + to[0]) / 2 + f.perp[0] * 3, (f.tr[1] + to[1]) / 2 + f.perp[1] * 3,
        to[0], to[1],
      );
    }
    ctx.bezierCurveTo(118, 28, 112, 104, 92, 178);            // 새끼손가락 쪽 손날
    ctx.lineTo(-100, 178);
    ctx.closePath();
  }

  // ── 층 그리기(전부 논리 좌표 · 라벨은 층 밖에서 따로) ────────────────
  function drawHand(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save();
    ctx.translate(cx + 24, cy);

    handOutline(ctx);
    const skin = ctx.createLinearGradient(-160, -180, 140, 170);
    skin.addColorStop(0, "#F9DAC0");
    skin.addColorStop(0.46, "#EBBA97");
    skin.addColorStop(1, "#C58860");
    ctx.fillStyle = skin;
    ctx.fill();

    // 굴곡은 전부 실루엣 안쪽에만
    ctx.save();
    handOutline(ctx);
    ctx.clip();
    ctx.lineCap = "round";
    const wash = (g: CanvasGradient): void => { ctx.fillStyle = g; ctx.fillRect(-230, -250, 420, 470); };

    const bulge = ctx.createRadialGradient(-40, 4, 6, -26, 26, 176);
    bulge.addColorStop(0, "rgba(255,241,224,.5)");
    bulge.addColorStop(0.5, "rgba(255,230,206,.15)");
    bulge.addColorStop(1, "rgba(255,224,198,0)");
    wash(bulge);
    const edge = ctx.createLinearGradient(4, 0, 126, 0);
    edge.addColorStop(0, "rgba(146,84,50,0)");
    edge.addColorStop(1, "rgba(120,64,38,.5)");
    wash(edge);
    const thenar = ctx.createLinearGradient(-56, 0, -136, 0);   // 엄지 두덩 쪽도 어두워야 가운데가 능선이 된다
    thenar.addColorStop(0, "rgba(142,80,48,0)");
    thenar.addColorStop(1, "rgba(126,68,40,.34)");
    wash(thenar);
    const wrist = ctx.createLinearGradient(0, 72, 0, 176);
    wrist.addColorStop(0, "rgba(140,80,48,0)");
    wrist.addColorStop(1, "rgba(116,62,38,.44)");
    wash(wrist);
    const webShade = ctx.createRadialGradient(-104, 16, 6, -104, 16, 76);
    webShade.addColorStop(0, "rgba(126,68,40,.32)");
    webShade.addColorStop(1, "rgba(126,68,40,0)");
    wash(webShade);

    // 손가락 원통 음영 — 평평한 판이 아니라 둥근 마디로 읽히게 하는 결정적 한 겹.
    // 축에 수직인 그라데이션(왼쪽 어둡게 → 밝은 능선 → 오른쪽 어둡게)을 그 손가락 안에만 칠한다.
    // 음영 영역은 **실루엣에서 그 손가락이 차지하는 만큼**과 정확히 같아야 한다 — 밑동을 손등
    // 쪽으로 늘이면 손등 위에 반투명 관 네 개가 겹쳐 놓인 그림이 된다(실제로 그렇게 보였다).
    const cylinder = (f: DigitPts, from: [number, number], to: [number, number], k: number): void => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(f.tl[0], f.tl[1]);
      ctx.bezierCurveTo(f.capL[0], f.capL[1], f.capR[0], f.capR[1], f.tr[0], f.tr[1]);
      ctx.lineTo(to[0], to[1]);
      ctx.closePath();
      ctx.clip();
      const g = ctx.createLinearGradient(f.bl[0], f.bl[1], f.br[0], f.br[1]);
      g.addColorStop(0, `rgba(146,86,52,${0.26 * k})`);
      g.addColorStop(0.32, `rgba(255,242,226,${0.26 * k})`);
      g.addColorStop(0.62, `rgba(255,236,216,${0.04 * k})`);
      g.addColorStop(1, `rgba(124,68,40,${0.32 * k})`);
      ctx.fillStyle = g;
      ctx.fillRect(-230, -250, 420, 470);
      ctx.restore();
    };
    for (let i = 0; i < FP.length; i++) {
      cylinder(FP[i], i === 0 ? FP[0].bl : CROTCH[i - 1], i === 3 ? FP[3].br : CROTCH[i], 1);
    }
    cylinder(TP, TP.bl, TP.br, 0.6);

    // 살 밑의 굴곡은 윤곽이 없다 — 굵기를 줄여 가며 여러 겹 겹쳐야 번진 그늘이 된다.
    // 한 겹으로 굵게 그으면 그늘이 아니라 띠·꿰맨 자국으로 읽힌다(실제로 그렇게 보였다).
    const softLine = (color: string, layers: [number, number][], draw: () => void): void => {
      for (const [w, a] of layers) {
        ctx.strokeStyle = `rgba(${color},${a})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        draw();
        ctx.stroke();
      }
    };

    // 너클 아래 그늘 — 손등이 손가락으로 넘어가며 한 번 꺼진다(없으면 손등이 판판해 보인다)
    softLine("138,78,46", [[46, 0.045], [32, 0.055], [20, 0.055]], () => {
      ctx.moveTo(FP[0].knuckle[0] - 26, FP[0].knuckle[1] + 32);
      ctx.bezierCurveTo(
        FP[1].knuckle[0], FP[1].knuckle[1] + 20, FP[2].knuckle[0], FP[2].knuckle[1] + 20,
        FP[3].knuckle[0] + 20, FP[3].knuckle[1] + 36,
      );
    });

    // 손가락 사이 골 — 갈라지는 점에서 손등 쪽으로 짧게 번지는 그늘
    for (let i = 0; i < CROTCH.length; i++) {
      const a = FP[i], b = FP[i + 1];
      const wx = CROTCH[i][0], wy = CROTCH[i][1];
      const dx = (a.dir[0] + b.dir[0]) / 2, dy = (a.dir[1] + b.dir[1]) / 2;
      softLine("112,60,34", [[17, 0.075], [10, 0.085], [5, 0.085]], () => {
        ctx.moveTo(wx + dx * 2, wy + dy * 2);
        ctx.lineTo(wx - dx * 16, wy - dy * 16);
      });
    }

    // 폄근 힘줄 — 손목에서 너클로 부챗살. 수렴점을 화면 한참 아래에 두어야 살 밑의 결로 보인다
    // (가까운 한 점으로 모으면 손등이 아니라 빛 번짐처럼 읽힌다).
    for (const f of FP) {
      const kx = f.knuckle[0], ky = f.knuckle[1];
      const mx = (kx + 6) / 2 + 8, my = (ky + 190) / 2;
      ctx.strokeStyle = "rgba(255,236,216,.07)";
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(6, 190);
      ctx.quadraticCurveTo(mx, my, kx, ky + 26);
      ctx.stroke();
    }

    // 정맥 — 살 밑으로 비치는 것이라 윤곽이 없다. 넓고 흐리게 깔고 가는 심만 얹는다
    // (선 하나로 진하게 그으면 혈관이 아니라 갈라진 금으로 읽힌다).
    softLine("116,140,160", [[16, 0.03], [11, 0.032], [7, 0.03]], () => {
      ctx.moveTo(70, 154);
      ctx.bezierCurveTo(44, 112, 12, 90, -14, 66);
      ctx.moveTo(-14, 66); ctx.bezierCurveTo(-34, 50, -50, 28, -60, 4);
      ctx.moveTo(-14, 66); ctx.bezierCurveTo(0, 42, 10, 22, 16, 0);
    });

    // 너클 융기 + 관절 주름
    for (const f of FP) {
      const kx = f.knuckle[0], ky = f.knuckle[1];
      const g = ctx.createRadialGradient(kx - 6, ky - 8, 2, kx, ky, f.w0 * 1.45);
      g.addColorStop(0, "rgba(255,246,232,.62)");
      g.addColorStop(0.55, "rgba(245,210,180,.18)");
      g.addColorStop(1, "rgba(205,155,120,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(kx, ky, f.w0 * 1.3, f.w0 * 1.02, f.ang, 0, Math.PI * 2);
      ctx.fill();
      // 융기 아래 접힘 — 선으로 읽히면 꿰맨 자국이 된다. 아주 옅게, 짧게.
      ctx.strokeStyle = "rgba(142,82,50,.085)";
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.arc(kx, ky + f.w0 * 0.7, f.w0 * 0.82, Math.PI * 1.3, Math.PI * 1.7);
      ctx.stroke();
      ctx.strokeStyle = "rgba(150,90,56,.24)";
      ctx.lineWidth = 1.6;
      for (let j = 0; j < 2; j++) {
        const t = 16 + j * 8;
        const ax = kx + f.dir[0] * t, ay = ky + f.dir[1] * t;
        const w = f.w0 * (0.72 - j * 0.08);
        ctx.beginPath();
        ctx.moveTo(ax - f.perp[0] * w, ay - f.perp[1] * w);
        ctx.quadraticCurveTo(ax + f.dir[0] * 4, ay + f.dir[1] * 4, ax + f.perp[0] * w, ay + f.perp[1] * w);
        ctx.stroke();
      }
    }

    // 엄지손톱 — 위에서 본 손에서 손톱만큼 강한 "손" 신호가 없다(네 손가락은 끝이 화면 밖이라 없다)
    {
      const tx = (TP.tl[0] + TP.tr[0]) / 2, ty = (TP.tl[1] + TP.tr[1]) / 2;
      const nx = tx - TP.dir[0] * 14, ny = ty - TP.dir[1] * 14;
      const rot = Math.atan2(TP.dir[1], TP.dir[0]);
      const ng = ctx.createLinearGradient(
        nx - TP.perp[0] * 12, ny - TP.perp[1] * 12, nx + TP.perp[0] * 12, ny + TP.perp[1] * 12,
      );
      ng.addColorStop(0, "rgba(255,240,226,.85)");
      ng.addColorStop(0.5, "rgba(250,220,202,.72)");
      ng.addColorStop(1, "rgba(224,180,156,.72)");
      ctx.beginPath();
      ctx.ellipse(nx, ny, 15, 11.5, rot, 0, Math.PI * 2);
      ctx.fillStyle = ng;
      ctx.fill();
      ctx.strokeStyle = "rgba(168,112,78,.4)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.strokeStyle = "rgba(160,104,72,.3)";   // 밑동(큐티클) 그늘
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(nx - TP.dir[0] * 4, ny - TP.dir[1] * 4, 9, rot + Math.PI * 0.45, rot + Math.PI * 1.55);
      ctx.stroke();
    }

    // 살결(땀구멍·잔털) — 진하면 살결이 아니라 긁힌 자국으로 읽힌다
    ctx.fillStyle = "rgba(152,98,66,.19)";
    for (const [px, py] of handPores) { ctx.beginPath(); ctx.arc(px, py, 1.3, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = "rgba(122,80,54,.13)";
    ctx.lineWidth = 1;
    for (const [hx, hy, hb] of handHairs) {
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + 3 + hb * 4, hy - 5, hx + 7 + hb * 6, hy - 9);
      ctx.stroke();
    }

    // 좌상단 림 라이트(안쪽 테두리)
    handOutline(ctx);
    const rim = ctx.createLinearGradient(-160, -170, 70, 100);
    rim.addColorStop(0, "rgba(255,247,235,.7)");
    rim.addColorStop(0.5, "rgba(255,240,224,.1)");
    rim.addColorStop(1, "rgba(255,236,218,0)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.restore();

    // 외곽선은 살의 최암색(균일한 검정 금지 — 파운드리 재질 문법)
    handOutline(ctx);
    ctx.strokeStyle = "#A2643F";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    drawBracket(ctx, cx, cy, VIEW.w / 40);
  }

  function drawSkin(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const g = ctx.createLinearGradient(cx - 260, cy - 240, cx + 260, cy + 240);
    g.addColorStop(0, "#F3CDAF");
    g.addColorStop(0.5, "#E5B08B");
    g.addColorStop(1, "#D19A73");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 320, cy - 300, 640, 600);
    // 피부 표면의 골(소구)이 만드는 그물 무늬
    ctx.lineCap = "round";
    const fam = (angle: number, gap: number, alpha: number, width: number): void => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.strokeStyle = `rgba(150,96,64,${alpha})`;
      ctx.lineWidth = width;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-360, i * gap);
        for (let x = -360; x <= 360; x += 40) ctx.lineTo(x, i * gap + Math.sin((x + i * 90) / 60) * 4);
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

  function drawCellLayer(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#F2E4F6";
    ctx.fillRect(VIEW.x - 320, VIEW.y - 320, VIEW.w + 640, VIEW.h + 640);
    for (const c of cells) {
      ctx.beginPath();
      ctx.moveTo(c.pts[0][0], c.pts[0][1]);
      for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i][0], c.pts[i][1]);
      ctx.closePath();
      const g = ctx.createRadialGradient(c.nx, c.ny, 4, c.nx, c.ny, 62);
      g.addColorStop(0, "#DCEFF9");
      g.addColorStop(1, "#BCD8E8");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = MEM;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      // 핵
      ctx.beginPath();
      ctx.ellipse(c.nx, c.ny, c.nr, c.nr * 0.86, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#4A5FD6";
      ctx.fill();
      ctx.strokeStyle = "#2B3AA8";
      ctx.lineWidth = 1.6;
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
    const note = barPx < 2
      ? "점보다 작아요 — 맨눈으로는 안 보여요"
      : barPx < 26
        ? "겨우 보이기 시작했어요 — 아직 작아요"
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
    const wA = 1 - smooth(0.1, 0.44, uD);
    const wB = smooth(0.2, 0.5, uD) * (1 - smooth(0.7, 0.93, uD));
    const wC = smooth(0.72, 0.97, uD);
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
    layer(1, wA, () => drawHand(ctx, cx, cy));
    layer(40, wB, () => drawSkin(ctx, cx, cy));
    layer(400, wC, () => drawCellLayer(ctx));
    drawRulerOnCell(ctx, mag, rulerT * wC);
    // 관찰 창 안쪽 그림자
    const vig = ctx.createRadialGradient(cx, cy, VIEW.w * 0.28, cx, cy, VIEW.w * 0.72);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(4,10,20,.42)");
    ctx.fillStyle = vig;
    ctx.fillRect(VIEW.x, VIEW.y, VIEW.w, VIEW.h);
    drawViewLabel(ctx, wC > 0.5 ? "피부를 이루는 세포" : wB > 0.45 ? "피부 표면 무늬" : "손등 (맨눈)", Math.max(wA, wB, wC));
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
