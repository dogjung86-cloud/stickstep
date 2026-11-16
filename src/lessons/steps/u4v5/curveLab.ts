// [중1 Ⅳ v5] u4l5, u4l6 온도 측정 랩: 「녹는 동안(끓는 동안, 어는 동안) 온도는 어떻게 될까요?」
// 책의 실험 셋을 따로따로 손으로 한다. 1분마다 온도를 재어 그래프에 점을 찍고, 상태가 변하던 구간을 가려낸다.
//   melt   탐구: 얼음이 든 플라스크를 찬물에 담그고 1분마다 온도를 잰다(얼음이 녹는 동안 0℃).
//   boil   탐구: 물을 가열하며 1분마다 온도를 잰다(끓는 동안 100℃). 불의 세기를 학생이 정하고 두 가지를 다 해서 견준다
//          (도입의 물음 "센 불이면 더 뜨거울까"에 그래프로 답한다. 센 불은 더 빨리 끓을 뿐 멈춘 온도는 같다).
//   freeze 해 보기: 시험관의 물을 얼음(과 소금)에 넣고 온도를 잰다. 비커에 얼음만 넣을지 얼음과 소금을 넣을지 학생이 정한다
//          (얼음만 넣으면 0℃ 아래로 내려가지 않아 물이 얼지 않는다. 소금을 섞어 다시 한다).
// 무대: 왼쪽은 장치와 그 속의 물질(단원의 메타볼과 입자 뷰. 물리 수치 불변), 오른쪽은 온도 그래프. 꾹 누르는 동안 시간이 흐르고 1분마다 점이 찍힌다.
// 옛 랩(−20℃에서 120℃까지 한 줄로 이어 그리는 곡선)의 구성은 가져오지 않았다. 온도와 시간의 값은 이 랩에서 정한 값이다(0℃와 100℃는 자연값).
//
// 그림(2026-11-15 손질, 감사 상 1, 중 1, 하 1):
//   평평한 구간: 예전에는 덩어리 하나의 온도를 0℃ 근처에서 천천히 넘겨 얼음이 통째로 물러졌다(글은 "얼음과 물").
//     이제 녹이기와 얼리기는 무대에 시뮬레이션을 둘 둔다(아래에 액체 무리, 위에 고체 무리. 공용 시뮬레이션과 렌더러는 그대로 쓴다).
//     상태가 변하는 동안 입자가 한 무리에서 다른 무리로 하나씩 옮겨 가서, 얼음 덩어리가 줄고 물이 는다(어는 쪽은 반대).
//     녹이기: 얼음이 물 위에 뜬다(얼음 무리의 바닥 = 물의 윗면). 얼리기: 시험관 아래부터 얼고 물이 그 위에 얹힌다(물 무리의 바닥 = 얼음의 윗면).
//   장치: 같은 네모 통 대신 책의 장치로. 녹이기는 찬물 비커 속 삼각 플라스크, 얼리기는 얼음(과 소금) 비커 속 시험관, 끓이기는 쇠그물 위 비커와 불.
//     셋 다 디지털 온도계의 감지 막대 끝이 물질 속에 있다. 그래프와 온도 숫자가 가장 크게 남게 장치는 옅게 그린다.
//     바깥 비커의 찬물과 얼음은 안쪽 용기 바깥만 칠해서, 물질 덩어리가 용기 벽 밖으로 조금 비어져 보이는 것도 가린다.
//   끓이기 판정: 두 줄이 100℃에 닿은 점에서 시간 축으로 점선을 내리고(4분, 8분) 그 사이를 노란 괄호로 묶는다. 두 줄은 다시 밝게.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { colFor } from "../../../renderers/palette";
import { fitStageCanvas } from "../../../ui/canvas";
import type { MatterSim, SimBounds } from "../../../engine/matterSim";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards } from "../bio6/b6Lab";
import { deg, seeded, u4Hold, u4Lab, u4Matter, u4Predict, type U4Matter, type U4Step } from "./u4Kit";

type Mode = "melt" | "boil" | "freeze";
type Kind = "melt" | "weak" | "strong" | "ice" | "salt";
interface Model {
  /** m분의 온도(℃) */
  T: (m: number) => number;
  /** 무대에서 고체로 그리는 입자의 몫(0~1). 상태가 변하는 구간 동안 고체와 액체가 함께 있다. */
  solid: (m: number) => number;
  /** 액체 무리의 시뮬레이션 온도(끓는 동안은 조금씩 넘어가게 해 김이 나게 한다) */
  liq: (m: number) => number;
  /** 고체 무리의 시뮬레이션 온도 */
  sol: (m: number) => number;
  /** 상태가 변하는 구간(분). 없으면 null */
  flat: [number, number] | null;
  end: number;
  state: (m: number) => string;
  bath: string;
}
const lin = (m: number, m0: number, t0: number, k: number): number => t0 + (m - m0) * k;
const MODELS: Record<Kind, Model> = {
  melt: {
    T: (m) => (m < 2 ? lin(m, 0, -5, 2.5) : m < 7 ? 0 : lin(m, 7, 0, 5 / 3)),
    solid: (m) => (m < 2 ? 1 : m < 7 ? 1 - (m - 2) / 5 : 0),
    liq: (m) => (m < 7 ? 3 : 3 + (m - 7) * 5),
    sol: (m) => (m < 2 ? lin(m, 0, -8, 3) : -2),
    flat: [2, 7],
    end: 10,
    state: (m) => (m < 2 ? "얼음" : m < 7 ? "얼음과 물" : "물"),
    bath: "찬물",
  },
  weak: {
    T: (m) => (m < 8 ? lin(m, 0, 20, 10) : 100),
    solid: () => 0,
    liq: (m) => (m < 8 ? lin(m, 0, 20, 9) : 96.5 + (m - 8) * 0.9),
    sol: () => -20,
    flat: [8, 10],
    end: 10,
    state: (m) => (m < 8 ? "물" : "물과 수증기"),
    bath: "약한 불",
  },
  strong: {
    T: (m) => (m < 4 ? lin(m, 0, 20, 20) : 100),
    solid: () => 0,
    liq: (m) => (m < 4 ? lin(m, 0, 20, 18) : 96.5 + (m - 4) * 0.33),
    sol: () => -20,
    flat: [4, 10],
    end: 10,
    state: (m) => (m < 4 ? "물" : "물과 수증기"),
    bath: "센 불",
  },
  ice: {
    T: (m) => 0.6 + 14.4 * Math.exp(-0.55 * m),
    solid: () => 0,
    liq: (m) => 4 + 30 * Math.exp(-0.55 * m),
    sol: () => -20,
    flat: null,
    end: 8,
    state: () => "물",
    bath: "얼음",
  },
  salt: {
    T: (m) => (m < 3 ? lin(m, 0, 15, -5) : m < 7 ? 0 : lin(m, 7, 0, -3)),
    solid: (m) => (m < 3 ? 0 : m < 7 ? (m - 3) / 4 : 1),
    liq: (m) => (m < 3 ? lin(m, 0, 34, -10) : 4),
    sol: (m) => (m < 7 ? -3 : lin(m, 7, -3, -4)),
    flat: [3, 7],
    end: 10,
    state: (m) => (m < 3 ? "물" : m < 7 ? "물과 얼음" : "얼음"),
    bath: "얼음과 소금",
  },
};
const AXIS: Record<Mode, { lo: number; hi: number; ticks: number[] }> = {
  melt: { lo: -6, hi: 6, ticks: [-5, 0, 5] },
  boil: { lo: 0, hi: 120, ticks: [0, 50, 100] },
  freeze: { lo: -10, hi: 20, ticks: [-10, 0, 10, 20] },
};
const MS_PER_MIN = 560;
/** 끓이기 두 줄의 색(센 불은 불빛 주황, 약한 불은 랩의 줄 색). 지난 실험의 줄은 같은 색을 옅게. */
const LINE: Record<Kind, string> = { melt: "#B9ADFF", weak: "#B9ADFF", strong: "#FFB867", ice: "#9FB3CC", salt: "#B9ADFF" };

// ── 장치의 모양(왼쪽 칸 w×h, 폰 390에서 약 145×230). 위쪽 72px는 상태 알약과 '열에너지' 꼬리표 자리라 비운다 ──
/** 물질 입자의 수와 크기, 고체 격자의 열 수. 녹이기와 얼리기는 용기에 맞게 작게 쌓는다. */
const SIM: Record<Mode, { n: number; r: number; cols: number }> = {
  melt: { n: 20, r: 5, cols: 5 },
  freeze: { n: 21, r: 4.6, cols: 3 },
  boil: { n: 32, r: 6, cols: 0 },
};
/** 녹이기: 찬물 비커(bk) 속의 삼각 플라스크(바닥 fb, 바닥 반폭 bw, 어깨 sh, 목 반폭 nw, 입구 rim). */
function meltGeo(w: number, h: number) {
  const cx = w / 2;
  const bk = { x0: 6, x1: w - 6, top: 112, bot: h - 30 };
  const fb = bk.bot - 2.5;
  const bw = Math.min(56, cx - 12);
  const g = { cx, bk, water: 128, fb, bw, nw: 11, sh: 108, rim: 90 };
  return { ...g, sim: { x0: cx - bw + 15, x1: cx + bw - 15, y0: g.sh + 12, y1: fb - 4 } as SimBounds };
}
/** 얼리기: 얼음(과 소금) 비커(bk, 얼음이 찬 높이 fill) 속의 시험관(안쪽 반폭 ti, 바닥 tb, 입구 rim). */
function freezeGeo(w: number, h: number) {
  const cx = w / 2;
  const bk = { x0: 6, x1: w - 6, top: 104, bot: h - 30 };
  const g = { cx, bk, fill: 118, ti: 19, tb: bk.bot - 7, rim: 90 };
  return { ...g, sim: { x0: cx - 16.5, x1: cx + 16.5, y0: g.rim + 6, y1: g.tb - 2 } as SimBounds };
}
/** 끓이기: 쇠그물 위의 비커(bk). 아래에 불. */
function boilGeo(w: number, h: number) {
  const bk = { x0: 14, x1: w - 14, top: 94, bot: Math.min(186, h - 44) };
  return { cx: w / 2, bk, sim: { x0: bk.x0 + 4, x1: bk.x1 - 4, y0: bk.top + 6, y1: bk.bot - 4 } as SimBounds };
}
const simBox = (mode: Mode, w: number, h: number): SimBounds => (mode === "melt" ? meltGeo(w, h).sim : mode === "freeze" ? freezeGeo(w, h).sim : boilGeo(w, h).sim);

const GLASS = "rgba(196,216,242,.62)"; // 물질이 든 안쪽 용기의 유리
const OUTER = "rgba(169,193,220,.42)"; // 바깥 비커의 유리
const SHINE = "rgba(255,255,255,.14)"; // 유리의 빛(왼쪽 위에서)

interface CurveStep extends U4Step {
  mode?: Mode;
}

export const u4CurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CurveStep;
  const mode: Mode = s.mode ?? "melt";
  // 끓이기와 얼리기에는 세 줄이 되는 도움말이 있어(센 불의 결과, 얼음만으로 얼지 않음) 처음부터 세 줄 상자를 잡는다
  const lab = u4Lab(host, api, s, { steps: 3, cls: `u4x-curve is-${mode}`, tall: mode !== "melt" });
  const { f, tm } = lab;
  const cool = mode === "freeze";
  const two = mode !== "boil"; // 녹이기와 얼리기: 고체 무리와 액체 무리를 따로 둔다
  const P = SIM[mode];

  const simEl = el("div", { class: "u4x-heat-sim" });
  const graph = el("canvas", { class: "u4x-heat-graph" });
  const tag = el("div", { class: "u4x-heat-tag", text: cool ? "열에너지를 방출하는 중" : "열에너지를 흡수하는 중" });
  const temp = el("div", { class: "u4x-heat-temp", text: "" });
  f.stage.append(simEl, graph, tag, temp);

  let kind: Kind = mode === "melt" ? "melt" : mode === "boil" ? "weak" : "salt";
  let m = 0; // 지금 실험에서 흐른 시간(분)
  let running = false; // 실험이 준비되어 시간을 보낼 수 있는가
  let holding = false;
  let flatSeen = false;
  let zones = false; // 구간 이름표 (가)(나)(다)
  let marks = false; // 끓이기 판정: 100℃에 닿은 때를 시간 축에
  let chosen = mode === "melt"; // 데우거나 식히는 것을 정했는가(정하기 전에는 이름표를 그리지 않는다)
  let pred = "";
  const past: { kind: Kind; pts: number[] }[] = []; // 끝낸 실험의 1분마다의 온도
  let pts: number[] = [];

  // ── 물질: 액체 무리(아래 층)와 고체 무리(위 층, 장치 그림과 상태 알약을 맡는다) ──
  // 두 무리의 바닥(그릇 바닥에서 띄운 높이). 녹이기는 얼음이 물 위에 뜨고, 얼리기는 물이 얼음 위에 얹힌다.
  let liqLift = 0;
  let solLift = 0;
  const liqWalls = (w: number, h: number): SimBounds => {
    const b = simBox(mode, w, h);
    return { ...b, y1: b.y1 - liqLift };
  };
  const solWalls = (w: number, h: number): SimBounds => {
    const b = simBox(mode, w, h);
    return { ...b, y1: b.y1 - solLift };
  };
  const want = (): number => Math.round(P.n * MODELS[kind].solid(m));
  let lq: U4Matter | null = null;
  if (two) {
    lq = u4Matter(lab, {
      box: simEl,
      sim: { count: P.n, r: P.r, cols: P.cols, temp: MODELS[kind].liq(0), walls: liqWalls },
      onReady: () => {
        if (lq) lq.ms.sim.parts.length = P.n - want();
      },
    });
    lq.pill.remove();
    lq.read.remove();
  }
  const dot = el("span", { class: "pdot" });
  const name = el("span", { text: "" });
  const mt = u4Matter(lab, {
    box: simEl,
    sim: { count: P.n, r: P.r, cols: P.cols, temp: two ? MODELS[kind].sol(0) : MODELS[kind].liq(0), walls: two ? solWalls : liqWalls },
    overlay: (ctx, w, h) => apparatus(ctx, w, h),
    onFrame: () => paint(),
    onReady: () => {
      if (two) mt.ms.sim.parts.length = want();
      trimPairs();
    },
  });
  mt.pill.append(dot, name);
  mt.read.remove();
  const liqSim: MatterSim = lq ? lq.ms.sim : mt.ms.sim;
  const solSim: MatterSim | null = two ? mt.ms.sim : null;

  // 고체 무리의 결합선(입자의 눈 폴백에서 그린다)은 지금 있는 입자끼리만. 격자를 다시 짜면 목록이 새로 생긴다.
  let fullPairs: [number, number][] = [];
  let setPairs: [number, number][] | null = null;
  function trimPairs(): void {
    if (!solSim) return;
    if (solSim.pairs !== setPairs) fullPairs = solSim.pairs;
    const n = solSim.parts.length;
    setPairs = fullPairs.filter(([a, b]) => a < n && b < n);
    solSim.pairs = setPairs;
  }
  /** 물 입자 n개가 그릇 바닥에 고였을 때의 깊이(입자 하나가 차지하는 넓이 ÷ 그릇 폭). */
  const waterDepth = (n: number, b: SimBounds): number => (n * 0.87 * (2.05 * P.r) ** 2) / (b.x1 - b.x0) + P.r * 0.6;
  /** 얼음 입자 n개가 아래부터 쌓였을 때의 높이(격자 줄 간격 r×2.35×0.9, 줄 수는 끊기지 않게 분수로). */
  const iceHeight = (n: number): number => (n ? 2 + 2.24 * P.r + Math.max(0, n / P.cols - 1) * P.r * 2.35 * 0.9 : 0);

  /** 상태가 변하는 동안 입자를 한 무리에서 다른 무리로 옮기고, 두 무리의 바닥을 맞춘다. */
  function sync(): void {
    if (!solSim) return;
    const k = want();
    // 녹을 때: 얼음 덩어리 위쪽부터 하나씩 물이 된다(그 자리에서 떨어져 아래의 물에 합쳐진다)
    while (solSim.parts.length > k) {
      const p = solSim.parts.pop()!;
      liqSim.parts.push({ x: p.x, y: p.y, vx: 0, vy: 0.3 });
    }
    // 얼 때: 얼음의 다음 자리에서 가장 가까운 물 입자가 얼음이 된다
    while (solSim.parts.length < k && liqSim.parts.length) {
      const home = solSim.homes[solSim.parts.length];
      let bi = 0;
      let bd = Infinity;
      liqSim.parts.forEach((p, i) => {
        const d = home ? (p.x - home.x) ** 2 + (p.y - home.y) ** 2 : -p.y;
        if (d < bd) {
          bd = d;
          bi = i;
        }
      });
      const [p] = liqSim.parts.splice(bi, 1);
      solSim.parts.push({ x: p.x, y: p.y, vx: 0, vy: 0 });
    }
    if (mode === "melt") {
      const lift = liqSim.parts.length ? waterDepth(liqSim.parts.length, simBox(mode, solSim.w, solSim.h)) - 3 : 0;
      if (Math.abs(lift - solLift) > 0.3) {
        solLift = lift;
        solSim.buildLattice(false); // 격자 자리를 새 바닥 위로(얼음이 물 위로 떠오른다)
      }
    } else liqLift = Math.max(0, iceHeight(solSim.parts.length) - 3);
    trimPairs();
    host.dataset.u4Solid = String(solSim.parts.length);
    host.dataset.u4Liquid = String(liqSim.parts.length);
  }

  // ── 장치(위 층의 덧그림. 물질 위에 그려지므로 물질이 비어져 보이는 곳을 가릴 수 있다) ──
  function label(ctx: CanvasRenderingContext2D, w: number, h: number, t: string, color: string): void {
    ctx.font = "800 12.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(t, w / 2, h - 7);
  }
  /** 비커 몸통(위가 열림). 닫으면 안쪽 넓이가 된다. */
  function body(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, bot: number, r = 9): void {
    ctx.moveTo(x0, top);
    ctx.lineTo(x0, bot - r);
    ctx.quadraticCurveTo(x0, bot, x0 + r, bot);
    ctx.lineTo(x1 - r, bot);
    ctx.quadraticCurveTo(x1, bot, x1, bot - r);
    ctx.lineTo(x1, top);
  }
  function beakerLine(ctx: CanvasRenderingContext2D, b: { x0: number; x1: number; top: number; bot: number }, color: string, lw: number): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(b.x0 - 4, b.top);
    body(ctx, b.x0, b.x1, b.top, b.bot);
    ctx.lineTo(b.x1 + 4, b.top);
    ctx.stroke();
    ctx.strokeStyle = SHINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x0 + 4, b.top + 8);
    ctx.lineTo(b.x0 + 4, b.bot - 14);
    ctx.stroke();
  }
  /** 디지털 온도계의 감지 막대: 손잡이(어두운 회색)와 가는 금속 막대. 끝(tip)은 물질 속에 있다. */
  function probe(ctx: CanvasRenderingContext2D, x: number, top: number, tip: number): void {
    const g = ctx.createLinearGradient(x - 4.5, 0, x + 4.5, 0);
    g.addColorStop(0, "#8A9AB0");
    g.addColorStop(0.5, "#66768C");
    g.addColorStop(1, "#4C5A6E");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(20,30,48,.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x - 4.5, top, 9, 18, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(214,226,240,.85)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, top + 18);
    ctx.lineTo(x, tip);
    ctx.stroke();
    ctx.fillStyle = "#F1F5FB";
    ctx.beginPath();
    ctx.arc(x, tip, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  function cube(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, rot: number): void {
    ctx.save();
    ctx.translate(x + sz / 2, y + sz / 2);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(-sz / 2, -sz / 2, sz / 2, sz / 2);
    g.addColorStop(0, "rgba(236,246,255,.4)");
    g.addColorStop(0.6, "rgba(190,222,250,.2)");
    g.addColorStop(1, "rgba(160,200,240,.16)");
    ctx.fillStyle = g;
    ctx.strokeStyle = "rgba(200,228,252,.42)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(-sz / 2, -sz / 2, sz, sz, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  // 소금 알갱이 자리(그릴 때마다 같은 자리)
  const salt = (() => {
    const rnd = seeded(41);
    return Array.from({ length: 64 }, () => ({ u: rnd(), v: rnd(), r: 1.1 + rnd() * 0.5 }));
  })();

  function apparatus(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (mode === "melt") drawMelt(ctx, w, h);
    else if (mode === "freeze") drawFreeze(ctx, w, h);
    else drawBoil(ctx, w, h);
    ctx.restore();
  }

  /** 녹이기: 찬물이 든 비커 속에 얼음이 든 삼각 플라스크. */
  function drawMelt(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const { cx, bk, water, fb, bw, nw, sh, rim } = meltGeo(w, h);
    const flask = (): void => {
      ctx.moveTo(cx - nw, rim);
      ctx.lineTo(cx - nw, sh);
      ctx.lineTo(cx - bw, fb - 10);
      ctx.quadraticCurveTo(cx - bw, fb, cx - bw + 10, fb);
      ctx.lineTo(cx + bw - 10, fb);
      ctx.quadraticCurveTo(cx + bw, fb, cx + bw, fb - 10);
      ctx.lineTo(cx + nw, sh);
      ctx.lineTo(cx + nw, rim);
    };
    // 찬물: 비커 안, 물 높이 아래, 플라스크 바깥만
    ctx.save();
    ctx.beginPath();
    body(ctx, bk.x0, bk.x1, water, bk.bot);
    ctx.closePath();
    flask();
    ctx.closePath();
    ctx.clip("evenodd");
    const g = ctx.createLinearGradient(0, water, 0, bk.bot);
    g.addColorStop(0, "rgba(30,70,118,.95)");
    g.addColorStop(1, "rgba(18,42,74,.96)");
    ctx.fillStyle = g;
    ctx.fillRect(0, water - 1, w, bk.bot - water + 2);
    ctx.restore();
    const hw = nw + ((bw - nw) * (water - sh)) / (fb - 10 - sh);
    ctx.strokeStyle = "rgba(116,192,252,.5)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bk.x0 + 2, water);
    ctx.lineTo(cx - hw - 2, water);
    ctx.moveTo(cx + hw + 2, water);
    ctx.lineTo(bk.x1 - 2, water);
    ctx.stroke();
    beakerLine(ctx, bk, OUTER, 1.4);
    ctx.strokeStyle = GLASS;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    flask();
    ctx.moveTo(cx - nw - 3, rim);
    ctx.lineTo(cx + nw + 3, rim);
    ctx.stroke();
    ctx.strokeStyle = SHINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - nw - 5, sh + 10);
    ctx.lineTo(cx - bw + 7, fb - 18);
    ctx.stroke();
    probe(ctx, cx + 4.5, rim - 19, fb - 15);
    label(ctx, w, h, MODELS.melt.bath, "#CFE3FF");
  }

  /** 얼리기: 얼음(과 소금)을 채운 비커 속에 물이 든 시험관. 정하기 전에는 빈 비커. */
  function drawFreeze(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const { cx, bk, fill, ti, tb, rim } = freezeGeo(w, h);
    const tube = (): void => {
      ctx.moveTo(cx - ti, rim);
      ctx.lineTo(cx - ti, tb - ti);
      ctx.arc(cx, tb - ti, ti, Math.PI, 0, true);
      ctx.lineTo(cx + ti, rim);
    };
    // 비커 속(시험관 바깥): 정하기 전에는 무대 바탕과 같은 빛(비어 보인다), 정한 뒤에는 얼음과 소금
    ctx.save();
    ctx.beginPath();
    body(ctx, bk.x0, bk.x1, chosen ? fill : bk.top + 6, bk.bot);
    ctx.closePath();
    tube();
    ctx.closePath();
    ctx.clip("evenodd");
    ctx.fillStyle = chosen ? (kind === "salt" ? "rgba(30,48,74,.95)" : "rgba(24,44,72,.95)") : "rgba(12,22,38,.92)";
    ctx.fillRect(0, bk.top, w, bk.bot - bk.top + 2);
    if (chosen) {
      const span = (cx - ti - 4 - (bk.x0 + 3)) / 2;
      for (const side of [-1, 1])
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 2; c++) {
            const x0 = side < 0 ? bk.x0 + 3 : cx + ti + 4;
            const sz = 14 - ((r + c) % 2) * 2;
            cube(ctx, x0 + c * span + (r % 2) * 2 + 1, fill + 4 + r * 17.5, sz, ((r * 2 + c + (side > 0 ? 1 : 0)) % 3 - 1) * 0.16);
          }
      if (kind === "salt") {
        ctx.fillStyle = "rgba(255,255,255,.9)";
        for (const g of salt) {
          ctx.beginPath();
          ctx.arc(bk.x0 + 4 + g.u * (bk.x1 - bk.x0 - 8), fill + 2 + g.v * (bk.bot - fill - 6), g.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    beakerLine(ctx, bk, OUTER, 1.4);
    ctx.strokeStyle = GLASS;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    tube();
    ctx.moveTo(cx - ti - 3, rim);
    ctx.lineTo(cx + ti + 3, rim);
    ctx.stroke();
    ctx.strokeStyle = SHINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - ti + 4, rim + 8);
    ctx.lineTo(cx - ti + 4, tb - ti - 2);
    ctx.stroke();
    probe(ctx, cx + 3, rim - 18, tb - 9);
    if (chosen) label(ctx, w, h, MODELS[kind].bath, "#CFE3FF");
  }

  /** 끓이기: 쇠그물 위의 비커와 그 아래 불. */
  function drawBoil(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const { cx, bk } = boilGeo(w, h);
    // 쇠그물
    ctx.strokeStyle = "rgba(169,193,220,.38)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(4, bk.bot + 3);
    ctx.lineTo(w - 4, bk.bot + 3);
    ctx.stroke();
    beakerLine(ctx, bk, GLASS, 1.6);
    // 눈금 몇 줄(옅게)
    ctx.strokeStyle = "rgba(196,216,242,.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
      const y = bk.bot - i * 20;
      ctx.moveTo(bk.x1 - 4, y);
      ctx.lineTo(bk.x1 - (i === 2 ? 14 : 10), y);
    }
    ctx.stroke();
    probe(ctx, cx + 24, bk.top - 19, bk.bot - 16);
    if (!chosen) return;
    const n = kind === "strong" ? 5 : 3;
    const fh = kind === "strong" ? 20 : 11;
    for (let i = 0; i < n; i++) {
      const x = w / 2 + (i - (n - 1) / 2) * 15;
      const flick = holding ? Math.sin(performance.now() / 90 + i) * 2.5 : 0;
      ctx.fillStyle = "#FF922B";
      ctx.beginPath();
      ctx.moveTo(x - 6, h - 20);
      ctx.quadraticCurveTo(x - 7, h - 20 - fh * 0.5, x, h - 20 - fh - flick);
      ctx.quadraticCurveTo(x + 7, h - 20 - fh * 0.5, x + 6, h - 20);
      ctx.fill();
    }
    label(ctx, w, h, MODELS[kind].bath, "#FFD8A8");
  }

  function paint(): void {
    const M = MODELS[kind];
    const T = M.T(m);
    sync();
    liqSim.setTemp(M.liq(m));
    solSim?.setTemp(M.sol(m));
    name.textContent = M.state(m);
    temp.textContent = deg(T);
    dot.style.background = colFor(T, 66, 1);
    draw();
    host.dataset.u4M = m.toFixed(1);
    host.dataset.u4Kind = kind;
  }

  function draw(): void {
    // 그래프 판은 확대 전 무대 px로 잡고 픽셀만 촘촘히 깐다(fitStageCanvas). 넓은 화면의 zoom 아래에서
    // getBoundingClientRect(공용 fitCanvas)로 재면 판이 배율만큼 커져 눈금과 글자가 쪼그라들었다(2026-11-15).
    const { ctx, w, h } = fitStageCanvas(graph);
    ctx.clearRect(0, 0, w, h);
    const ax = AXIS[mode];
    const padL = 34, padR = 24, padT = 50, padB = 30;
    const pw = w - padL - padR, ph = h - padT - padB;
    const xOf = (mm: number): number => padL + (mm / 10) * pw;
    const yOf = (T: number): number => padT + (1 - (T - ax.lo) / (ax.hi - ax.lo)) * ph;
    ctx.strokeStyle = "rgba(148,176,214,.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padL, padT - 6);
    ctx.lineTo(padL, padT + ph);
    ctx.lineTo(padL + pw, padT + ph);
    ctx.stroke();
    ctx.font = "700 12px Pretendard, sans-serif";
    ctx.fillStyle = "#8CA2C0";
    ctx.textAlign = "left";
    ctx.fillText("온도(℃)", 6, padT - 16);
    ctx.textAlign = "center";
    // 판정 표시가 있으면 가운데 눈금(5)은 비운다(그 자리 가까이 '4분'이 온다)
    for (const mm of marks ? [0, 10] : [0, 5, 10]) ctx.fillText(String(mm), xOf(mm), h - 12);
    ctx.textAlign = "right";
    ctx.fillText("분", w - 2, h - 12);
    for (const T of ax.ticks) {
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = T === 0 || T === 100 ? "rgba(148,176,214,.42)" : "rgba(148,176,214,.16)";
      ctx.beginPath();
      ctx.moveTo(padL, yOf(T));
      ctx.lineTo(padL + pw, yOf(T));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText(T < 0 ? `−${-T}` : String(T), padL - 5, yOf(T) + 4);
    }
    const line = (ps: number[], partial: number | null, K: Kind, dim: boolean): void => {
      if (!ps.length) return;
      const boilLine = mode === "boil";
      ctx.globalAlpha = dim ? (boilLine ? 0.6 : 0.42) : 1; // 끓이기의 지난 줄은 제 색을 알아볼 만큼만 옅게
      ctx.strokeStyle = boilLine ? LINE[K] : dim ? "#9FB3CC" : "#B9ADFF";
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ps.forEach((T, i) => (i ? ctx.lineTo(xOf(i), yOf(T)) : ctx.moveTo(xOf(i), yOf(T))));
      if (partial !== null) ctx.lineTo(xOf(partial), yOf(MODELS[K].T(partial)));
      ctx.stroke();
      ps.forEach((T, i) => {
        ctx.fillStyle = dim && !boilLine ? "#9FB3CC" : colFor(T, 68, 1);
        ctx.beginPath();
        ctx.arc(xOf(i), yOf(T), 3.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    // 끓이기 판정 때는 두 줄을 다시 밝게(둘 다 견줄 근거다)
    past.forEach((p) => line(p.pts, null, p.kind, !marks));
    line(pts, running ? m : null, kind, false);
    // 견줄 실험의 이름표(끓이기: 약한 불과 센 불)
    ctx.font = "800 12px Pretendard, sans-serif";
    if (mode === "boil") {
      const all = [...past.map((p) => p.kind), ...(pts.length ? [kind] : [])];
      all.forEach((K) => {
        const reach = MODELS[K].flat?.[0] ?? 0;
        const now = K === kind && pts.length > 0;
        ctx.fillStyle = LINE[K]; // 이름표는 제 줄의 색(지난 실험은 줄처럼 옅게)
        ctx.globalAlpha = marks || now ? 1 : 0.7;
        ctx.textAlign = "center";
        const done = K !== kind || m >= reach;
        if (done) ctx.fillText(MODELS[K].bath, xOf(reach) + (K === "strong" ? -4 : 0), yOf(100) - 10);
        ctx.globalAlpha = 1;
      });
    }
    // 끓이기 판정: 두 줄이 100℃에 닿은 점에서 시간 축으로 점선, 축 아래에 그때의 분, 두 때 사이를 괄호로
    if (marks) {
      const axisY = padT + ph;
      const xs: number[] = [];
      for (const p of past) {
        const reach = MODELS[p.kind].flat?.[0] ?? 0;
        const x = xOf(reach);
        xs.push(x);
        ctx.strokeStyle = LINE[p.kind];
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, yOf(100) + 5);
        ctx.lineTo(x, axisY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = LINE[p.kind];
        ctx.font = "800 12px Pretendard, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${reach}분`, x, h - 12);
      }
      if (xs.length === 2) {
        const [a, b] = xs.sort((u, v) => u - v);
        ctx.strokeStyle = "#FFE58A";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(a, axisY - 3);
        ctx.lineTo(a, axisY - 10);
        ctx.lineTo(b, axisY - 10);
        ctx.lineTo(b, axisY - 3);
        ctx.stroke();
      }
    }
    // 구간 이름표 (가)(나)(다)
    const fl = MODELS[kind].flat;
    if (zones && fl) {
      ctx.fillStyle = "#FFE58A";
      ctx.textAlign = "center";
      [["(가)", fl[0] / 2], ["(나)", (fl[0] + fl[1]) / 2], ["(다)", (fl[1] + 10) / 2]].forEach(([t, mm]) => ctx.fillText(t as string, xOf(mm as number), padT - 2));
      ctx.strokeStyle = "rgba(255,229,138,.5)";
      ctx.setLineDash([3, 4]);
      for (const mm of fl) {
        ctx.beginPath();
        ctx.moveTo(xOf(mm), padT + 4);
        ctx.lineTo(xOf(mm), padT + ph);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }

  // ── 시간 보내기 ──
  const HOLD: Record<Mode, string> = { melt: "꾹 눌러 얼음 녹이기", boil: "꾹 눌러 물 가열하기", freeze: "꾹 눌러 물 냉각하기" };
  const hold = u4Hold(
    lab,
    HOLD[mode],
    (ms) => {
      if (!running) return false;
      const M = MODELS[kind];
      const before = Math.floor(m);
      m = Math.min(M.end, m + ms / MS_PER_MIN);
      for (let i = before + 1; i <= Math.floor(m); i++) {
        pts[i] = M.T(i);
        haptic(HAPTIC.tap);
      }
      if (M.flat && !flatSeen && m >= M.flat[0] + 0.6) {
        flatSeen = true;
        haptic(HAPTIC.cross);
        f.pips(Math.max(1, past.length));
        mt.ms.toast(`${deg(M.T(m))}에서 멈췄어요`);
        f.say(SAY[kind].flat);
      }
      if (M.flat && flatSeen && m >= M.flat[1] + 0.5 && m < M.end - 0.01 && SAY[kind].after) f.say(SAY[kind].after as string);
      if (m >= M.end) {
        running = false;
        endRun();
        return false;
      }
      return true;
    },
    (on) => {
      holding = on;
      f.stage.classList.toggle("act", on && running);
    },
  );

  // 녹이기의 바깥 물은 무대 그림의 이름표(MODELS.melt.bath)와 처음 도움말처럼 '찬물'이다(0℃보다 따뜻하면 −5℃ 얼음을 녹인다)
  const SAY: Record<Kind, { go: string; flat: string; after?: string }> = {
    melt: {
      go: "−5℃ 얼음이 든 플라스크를 <b>찬물</b>에 담갔어요. 버튼을 꾹 누르고 있으면 1분마다 온도가 그래프에 기록돼요.",
      flat: "얼음이 녹기 시작했어요! 열에너지를 계속 받고 있는데도 온도가 <b>0℃에서 일정하게 유지돼요</b>. 끝까지 눌러 보세요.",
      after: "얼음이 모두 녹아 물이 되자 온도가 <b>다시 올라가기 시작해요</b>!",
    },
    weak: {
      go: "<b>약한 불</b>로 물을 가열해요. 버튼을 꾹 누르고 있으면 1분마다 온도가 그래프에 기록돼요.",
      flat: "물이 끓기 시작했어요! 계속 가열하는데도 온도가 <b>100℃에서 일정하게 유지돼요</b>. 끝까지 가열해 보세요.",
    },
    strong: {
      go: "<b>센 불</b>로 물을 가열해요. 버튼을 꾹 누르고 있으면 1분마다 온도가 그래프에 기록돼요.",
      flat: "물이 끓기 시작했어요! 계속 가열하는데도 온도가 <b>100℃에서 일정하게 유지돼요</b>. 끝까지 가열해 보세요.",
    },
    ice: { go: "물이 든 시험관을 <b>얼음만</b> 채운 비커에 넣었어요. 버튼을 꾹 눌러 냉각하면서 온도 변화를 살펴보세요.", flat: "" },
    salt: {
      go: "시험관을 <b>얼음과 소금</b>을 섞어 채운 비커에 넣었어요. 버튼을 꾹 눌러 냉각하면서 온도 변화를 살펴보세요.",
      flat: "물이 얼기 시작했어요! 계속 차갑게 식히고 있는데도 온도가 <b>0℃에서 일정하게 유지돼요</b>. 끝까지 눌러 보세요.",
      after: "물이 모두 얼어 얼음이 되자 온도가 <b>다시 내려가기 시작해요</b>!",
    },
  };

  function begin(k: Kind): void {
    kind = k;
    chosen = true;
    m = 0;
    pts = [MODELS[k].T(0)];
    flatSeen = false;
    running = true;
    hold.disabled = false;
    f.say(SAY[k].go);
    f.slot.setControls(hold);
    api.setCTA(mode === "boil" ? "끓을 때까지 가열해 보세요" : "끝까지 지켜보세요", { enabled: false });
  }

  function endRun(): void {
    hold.disabled = true;
    f.stage.classList.remove("act");
    haptic(HAPTIC.correct);
    if (mode === "melt" || kind === "salt") {
      zones = true;
      f.pips(2);
      const head = pred.startsWith("그대로") ? "예측대로" : "예측과 달리";
      f.say(`${head} ${mode === "melt" ? "녹는" : "어는"} 동안 온도가 <b>멈춰</b> 있었어요. 그래프를 세 구간으로 나눠 봤어요.`);
      tm.later(judge, 1100);
      return;
    }
    if (kind === "ice") {
      // 얼음만으로는 얼지 않는다: 그린 곡선을 남겨 두고 소금을 섞어 다시 한다
      haptic(HAPTIC.wrong);
      past.push({ kind, pts });
      pts = [];
      f.say("온도가 0℃ 근처까지만 내려가고 더 이상 낮아지지 않아 물이 <b>얼지 않았어요</b>! 물이 얼게 하려면 주변을 0℃보다 더 차갑게 만들어야 해요.");
      const redo = bvBtn("main u4x-curve-redo", "얼음에 소금을 섞어 더 차갑게 냉각하기");
      redo.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        begin("salt");
      });
      f.slot.setControls(redo);
      return;
    }
    // 끓이기: 두 가지 불을 다 해 본다
    past.push({ kind, pts });
    pts = [];
    f.pips(past.length);
    if (past.length < 2) {
      const other: Kind = kind === "weak" ? "strong" : "weak";
      f.say(`끓는 동안 온도는 <b>100℃ 그대로</b>였어요. 이번에는 <b>${MODELS[other].bath}</b>로 바꿔 다시 끓여 봐요.`);
      // 조사: bath는 "약한 불", "센 불"(둘 다 ㄹ 받침)이라 '로'
      const redo = bvBtn("main u4x-curve-redo", `${MODELS[other].bath}로 바꿔 다시 끓이기`);
      redo.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        begin(other);
      });
      f.slot.setControls(redo);
      return;
    }
    marks = true;
    host.dataset.u4Marks = "1";
    f.say("센 불로 가열하니 100℃에 더 빨리 도달했어요! 하지만 끓는 동안 일정하게 유지된 온도는 약한 불일 때와 똑같이 <b>100℃</b>예요.");
    tm.later(judge, 1100);
  }

  function judge(): void {
    const done = (html: string) => () => lab.finish(html);
    if (mode === "boil") {
      f.slot.ask(
        "약한 불에서 센 불로 바꿨을 때 <b>달라진 것</b>은 무엇인가요?",
        [{ t: "끓는 온도(100℃)에 도달하기까지 걸린 시간", ok: true }, { t: "물이 끓는 동안 유지되는 온도" }, { t: "물이 끓기 시작하는 온도" }],
        (ok) => api.recordQuiz(ok),
        {
          // 이 단원은 '끓는점, 녹는점' 용어를 쓰지 않는다(unit4.ts 머리말). 수정안의 "(끓는점)"을 뺐다
          why: "불을 세게 하면 열을 빠르게 받아 100℃에 <b>더 빨리 도달할 뿐</b>, 끓는 동안의 온도는 100℃로 같았어요.",
          onNext: done("액체가 끓는 동안에는 가열을 계속해도 열에너지가 모두 상태 변화(기화)에 쓰이므로 온도가 <b>일정하게 유지</b>돼요."),
        },
      );
      return;
    }
    const melt = mode === "melt";
    f.slot.ask(
      melt ? "고체인 얼음이 녹아 물로 변하는 <b>융해가 일어나는 구간</b>은 어디일까요?" : "물이 <b>얼고 있던</b> 때는 그래프의 어느 구간일까요?",
      // 보기를 풀어 쓴 글은 녹이기의 그래프에만 맞는다(얼리기의 (가)(다)는 온도가 내려가는 구간이다). 얼리기는 예전 보기 그대로
      melt
        ? [{ t: "온도가 일정한 (나) 구간", ok: true }, { t: "온도가 올라가는 (가) 구간" }, { t: "다 녹은 뒤 온도가 올라가는 (다) 구간" }]
        : [{ t: "(나) 구간", ok: true }, { t: "(가) 구간" }, { t: "(다) 구간" }],
      (ok) => api.recordQuiz(ok),
      {
        why: melt ? "얼음이 녹는 동안에는 온도가 <b>0℃에서 멈춰</b> 있었어요. 평평한 (나) 구간이에요." : "물이 어는 동안에는 온도가 <b>0℃에서 멈춰</b> 있었어요. 평평한 (나) 구간이에요.",
        onNext: done(
          melt
            ? "고체가 액체로 녹는(융해) 동안에는 열에너지를 흡수해도 온도가 <b>일정하게 유지</b>돼요. 흡수한 열에너지가 모두 <b>상태 변화</b>에 쓰이기 때문이에요."
            : "물이 어는 동안에는 식혀도 온도가 <b>일정</b>해요. 얼면서 열에너지를 <b>내놓기</b> 때문이에요.",
        ),
      },
    );
  }

  // ── 처음 ──
  // 예측의 첫 보기는 "그대로"로 시작해야 한다(실험 끝의 말머리가 pred.startsWith("그대로")로 가른다)
  if (mode === "melt") {
    f.say("<b>−5℃ 얼음</b>이 든 플라스크예요. 찬물에 담가 천천히 녹일 거예요. 먼저 예측해 보세요.");
    u4Predict(lab, "얼음이 <b>녹는 동안</b> 온도계의 온도는 어떻게 변할까요?", ["그대로 일정하게 유지된다", "계속 올라간다", "조금씩 내려간다"], (picked) => {
      pred = picked;
      begin("melt");
    });
  } else if (mode === "freeze") {
    f.say("<b>물</b>이 든 시험관에 온도 센서를 꽂았어요. 이 물을 얼릴 거예요. 먼저 예측해 보세요.");
    u4Predict(lab, "물이 <b>어는 동안</b> 온도계의 온도는 어떻게 변할까요?", ["그대로 일정하게 유지된다", "계속 내려간다", "조금씩 올라간다"], (picked) => {
      pred = picked;
      const cIce = bvCard("u4x-curve-pick", { name: "얼음만 넣기", sub: "0℃ 정도의 냉각제", key: "ice" });
      const cSalt = bvCard("u4x-curve-pick", { name: "얼음 + 소금 넣기", sub: "영하로 내려가는 냉각제", key: "salt" });
      cIce.el.addEventListener("click", () => begin("ice"));
      cSalt.el.addEventListener("click", () => begin("salt"));
      f.say("시험관을 넣을 비커에 <b>무엇을 채울지</b> 골라 보세요.");
      f.slot.setControls(bvCards(2, cIce, cSalt));
      api.setCTA("비커에 채울 것을 골라 보세요", { enabled: false });
    });
  } else {
    const cWeak = bvCard("u4x-curve-pick", { name: "약한 불", sub: "열을 천천히 공급", key: "weak" });
    const cStrong = bvCard("u4x-curve-pick", { name: "센 불", sub: "열을 빠르게 공급", key: "strong" });
    cWeak.el.addEventListener("click", () => begin("weak"));
    cStrong.el.addEventListener("click", () => begin("strong"));
    f.say("<b>20℃ 물</b>을 끓일 거예요. 먼저 <b>불의 세기</b>를 골라 보세요. 두 가지 다 해 볼 거예요.");
    f.slot.setControls(bvCards(2, cWeak, cStrong));
    api.setCTA("불의 세기를 골라 보세요", { enabled: false });
  }
  return lab.cleanup;
};
