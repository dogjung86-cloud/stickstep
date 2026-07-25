// photoCurveLab — 광합성에 영향을 미치는 환경요인 3종(빛의 세기·이산화 탄소 농도·온도)을
// 슬라이더로 직접 밀어 "광합성량 곡선"을 그려 보는 랩(책 178~179쪽 그림 Ⅴ-3).
//  · 왼쪽 무대: 물속에 잠긴 물풀 — 광합성량이 클수록 잎에서 산소 기포가 잦고 빠르게 올라오고,
//    세로 게이지가 함께 찬다. 알맞은 온도를 넘으면 잎이 시들고 "너무 뜨거워요" 배지가 뜬다.
//  · 오른쪽 무대: 가로축 = 지금 고른 요인, 세로축 = 광합성량. 민 지점까지 곡선이 그려져 남고,
//    이미 끝까지 민 요인의 곡선은 옅은 색으로 함께 보인다.
//  · 빛·이산화 탄소는 어느 지점부터 일정해지고(엽록체 수가 한정돼 있어서), 온도는 빠르게 감소한다.
// 조작 실체: 요인 세그(labSeg) + 네이티브 range 슬라이더(요인별 진행값을 기억·복원).
// 규격: 논리 좌표 360×320 기준으로 그리고 shell.frame()의 sc로 스케일한다. Math.random 금지.

import { clamp, el } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import type { Curio } from "../../../ui/curio";
import {
  BASE_W, alpha, badge, buildLab, drawLeaf, drawMatter, drawSunbeam, labSeg, plantColor,
} from "../../../ui/plantKit2";
import type { StepRenderer } from "../../types";

interface CurveStep { title: string; lead?: string; cta?: string; curio?: Curio }

type FactorId = "light" | "co2" | "temp";

interface FactorSpec {
  /** 세그·목표 칩·상태 필에 쓰는 짧은 이름 */
  name: string;
  /** 그래프 가로축 이름 */
  axis: string;
  /** 곡선이 꺾이는 지점(0~1) — 그리기 표본과 안내 토스트가 함께 쓴다 */
  breakpoint: number;
  ticks: readonly [string, string, string];
  ends: readonly [string, string];
  goalToast: string;
  /** 슬라이더 값(0~100) → 화면 표기 */
  value(v: number): string;
  /** 0~1 정규화 입력 → 광합성량 0~1 */
  amount(x: number): number;
}

const ORDER: readonly FactorId[] = ["light", "co2", "temp"];

const F: Record<FactorId, FactorSpec> = {
  light: {
    name: "빛의 세기",
    axis: "빛의 세기",
    breakpoint: 0.55,
    ticks: ["0", "50", "100"],
    ends: ["약함 0", "강함 100"],
    goalToast: "빛이 세지면 늘다가 일정해져요",
    value: (v) => `${Math.round(v)}`,
    amount: (x) => Math.min(1, x / 0.55),
  },
  co2: {
    name: "이산화 탄소",
    axis: "이산화 탄소 농도",
    breakpoint: 0.45,
    ticks: ["0%", "0.05%", "0.10%"],
    ends: ["0%", "0.10%"],
    goalToast: "농도가 높아져도 어느 순간부터는 일정해요",
    value: (v) => `${(v / 1000).toFixed(2)}%`,
    amount: (x) => Math.min(1, x / 0.45),
  },
  temp: {
    name: "온도",
    axis: "온도",
    breakpoint: 0.62,
    ticks: ["0℃", "25℃", "50℃"],
    ends: ["0℃", "50℃"],
    goalToast: "알맞은 온도를 넘으면 빠르게 감소해요",
    value: (v) => `${Math.round(v / 2)}℃`,
    amount: (x) => (x <= 0.62 ? x / 0.62 : Math.max(0.05, 1 - (x - 0.62) * 3.4)),
  },
};

const isFactor = (v: string): v is FactorId => v === "light" || v === "co2" || v === "temp";

// ── 무대 배치(논리 좌표 360×320) ─────────────────────────────
const STAGE_H = 320;
const TANK = { x: 14, y: 56, w: 136, h: 232 };
const WATER_Y = 70;
const GAUGE = { x: 24, y: 92, w: 14, h: 166 }; // 아래(258)에서 위로 찬다
const LEAF = { x: 100, y: 202, len: 84, wid: 38, rot: -0.16 };
const BUB = { x: 108, y: 190 };
const PLOT = { x0: 200, y0: 244, w: 136, h: 160 };

interface Bubble { x: number; y: number; r: number; k: number }

/** 라운드 사각 경로 — roundRect 타입 확장 없이 arcTo로 만든다. */
function roundPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export const photoCurveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CurveStep;

  // ── 상태 ───────────────────────────────────────────────────
  const val: Record<FactorId, number> = { light: 0, co2: 0, temp: 0 };   // 지금 슬라이더 값(0~100)
  const drawnTo: Record<FactorId, number> = { light: 0, co2: 0, temp: 0 }; // 그려 둔 최대 지점
  const bubbles: Bubble[] = [];
  let cur: FactorId = "light";
  let plateauTold = false;
  let emitPhase = 0;
  let emitSeq = 0;

  const xOf = (v: number): number => v / 100;
  const amountNow = (): number => F[cur].amount(xOf(val[cur]));
  const levelWord = (y: number): string => (y < 0.35 ? "낮음" : y < 0.7 ? "보통" : "높음");
  const readText = (): string =>
    `${F[cur].name} ${F[cur].value(val[cur])} · 광합성량 ${levelWord(amountNow())}`;

  // ── 골격 ───────────────────────────────────────────────────
  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "light", name: "빛의 세기", hint: "끝까지 밀기" },
      { id: "co2", name: "이산화 탄소", hint: "끝까지 밀기" },
      { id: "temp", name: "온도", hint: "끝까지 밀기" },
    ],
    helper: "요인을 하나 골라 슬라이더를 <b>끝까지</b> 밀어 보세요. 잎에서 올라오는 <b>산소 기포</b>와 오른쪽 그래프가 함께 움직여요.",
    read: readText(),
    curio: s.curio,
    ariaLabel: "물속 물풀에서 올라오는 산소 기포와 환경요인별 광합성량 그래프를 함께 보여 주는 무대",
    onAll: () => {
      shell.helper.innerHTML = "빛의 세기와 이산화 탄소 농도는 어느 지점부터 <b>일정</b>해지고, 온도는 알맞은 값을 넘으면 <b>빠르게 줄어요</b>. 세 요인이 모두 알맞을 때 광합성이 가장 활발해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  // ── 조작부: 요인 세그 + 슬라이더 카드 ───────────────────────
  const headName = el("b", { text: F[cur].name });
  const headVal = el("span", { text: F[cur].value(val[cur]) });
  const endLo = el("span", { text: F[cur].ends[0] });
  const endHi = el("span", { text: F[cur].ends[1] });
  const range = el("input", {
    class: "pgx-range",
    dataset: { act: "factor" },
    attrs: {
      type: "range", min: "0", max: "100", step: "1", value: "0",
      "aria-label": `${F[cur].name} 슬라이더`,
    },
  });
  const card = el(
    "div", { class: "pgx-slider" },
    el("div", { class: "pgx-slider-head" }, headName, headVal),
    range,
    el("div", { class: "pgx-scale" }, endLo, endHi),
  );
  const seg = labSeg(
    [
      { id: "light", label: "빛의 세기" },
      { id: "co2", label: "이산화 탄소" },
      { id: "temp", label: "온도" },
    ],
    (id) => { if (isFactor(id)) pickFactor(id); },
    "light",
  );
  shell.controls.append(seg, card);

  function syncHead(): void {
    headName.textContent = F[cur].name;
    headVal.textContent = F[cur].value(val[cur]);
    endLo.textContent = F[cur].ends[0];
    endHi.textContent = F[cur].ends[1];
    shell.setRead(readText());
  }

  function pickFactor(id: FactorId): void {
    cur = id;
    // 요인을 바꾸면 슬라이더는 그 요인의 기존 진행값으로 돌아간다.
    range.value = String(val[cur]);
    range.setAttribute("aria-label", `${F[cur].name} 슬라이더`);
    syncHead();
  }

  function onInput(): void {
    const v = clamp(Math.round(Number(range.value) || 0), 0, 100);
    val[cur] = v;
    if (v > drawnTo[cur]) drawnTo[cur] = v;
    syncHead();
    // 일정해지는 구간에 처음 들어섰을 때 한 번만 까닭을 알려 준다.
    if (!plateauTold && v < 95 && cur !== "temp" && xOf(v) >= F[cur].breakpoint) {
      plateauTold = true;
      shell.toast("엽록체 수가 정해져 있어서 더는 늘지 않아요");
    }
    if (v >= 95 && !shell.has(cur)) {
      const done = cur;
      shell.collect(done, F[done].goalToast);
      const next = ORDER.find((f) => !shell.has(f));
      if (next) {
        shell.helper.innerHTML = `좋아요! 이번엔 <b>${F[next].name}</b>를 골라 슬라이더를 끝까지 밀어 보세요.`;
      }
    }
  }
  range.addEventListener("input", onInput);

  // ── 산소 기포(결정적 — 인덱스와 누적 시간으로만 만든다) ─────
  function stepBubbles(dt: number): void {
    const amt = amountNow();
    const rate = amt < 0.04 ? 0 : 0.25 + amt * 3; // 초당 생성 개수 = f(광합성량)
    if (rate === 0) emitPhase = 0;
    else emitPhase += ((dt * 16.7) / 1000) * rate;
    let guard = 0;
    while (emitPhase >= 1 && guard < 4) {
      emitPhase -= 1;
      guard += 1;
      const k = emitSeq;
      emitSeq += 1;
      bubbles.push({
        k,
        x: BUB.x + (((k * 13) % 5) - 2) * 4.6,
        y: BUB.y + ((k * 7) % 3) * 3,
        r: 3.4 + ((k * 5) % 3) * 0.8,
      });
    }
    if (bubbles.length > 26) bubbles.splice(0, bubbles.length - 26);
    const rise = 0.55 + amt * 0.5;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      bubbles[i].y -= dt * rise;
      if (bubbles[i].y < WATER_Y + 2) bubbles.splice(i, 1);
    }
  }

  // ── 왼쪽 무대: 물통·물풀·기포·게이지 ────────────────────────
  function drawTank(ctx: CanvasRenderingContext2D, sc: number, tMs: number): void {
    const S = (v: number): number => v * sc;
    const amt = amountNow();
    const hot = cur === "temp" ? clamp((xOf(val.temp) - 0.62) / 0.26, 0, 1) : 0;
    const bottom = TANK.y + TANK.h;

    // 유리 물통 + 물
    ctx.save();
    roundPath(ctx, S(TANK.x), S(TANK.y), S(TANK.w), S(TANK.h), S(14));
    ctx.save();
    ctx.clip();
    ctx.fillStyle = alpha("paper", 0.05);
    ctx.fillRect(S(TANK.x), S(TANK.y), S(TANK.w), S(TANK.h));
    const wg = ctx.createLinearGradient(0, S(WATER_Y), 0, S(bottom));
    wg.addColorStop(0, alpha("water", 0.34));
    wg.addColorStop(1, alpha("water", 0.14));
    ctx.fillStyle = wg;
    ctx.fillRect(S(TANK.x), S(WATER_Y), S(TANK.w), S(bottom - WATER_Y));
    if (hot > 0.02) {
      ctx.fillStyle = `rgba(255,118,66,${(0.17 * hot).toFixed(3)})`;
      ctx.fillRect(S(TANK.x), S(WATER_Y), S(TANK.w), S(bottom - WATER_Y));
    }
    ctx.restore();
    roundPath(ctx, S(TANK.x), S(TANK.y), S(TANK.w), S(TANK.h), S(14));
    ctx.strokeStyle = alpha("paper", 0.26);
    ctx.lineWidth = Math.max(1, S(1.4));
    ctx.stroke();
    // 수면
    ctx.strokeStyle = alpha("paper", 0.34);
    ctx.lineWidth = Math.max(1, S(1.6));
    ctx.beginPath();
    ctx.moveTo(S(TANK.x + 5), S(WATER_Y));
    ctx.lineTo(S(TANK.x + TANK.w - 5), S(WATER_Y));
    ctx.stroke();
    ctx.restore();

    // 햇빛 — 빛의 세기를 고른 동안에는 슬라이더가 곧 광선의 세기다.
    const beam = cur === "light" ? xOf(val.light) : 0.72;
    drawSunbeam(ctx, S(18), S(146), S(50), S(198), beam, tMs);

    // 물풀 줄기 + 잎
    ctx.save();
    ctx.strokeStyle = plantColor("stem");
    ctx.lineWidth = Math.max(1.5, S(5));
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(S(118), S(bottom - 4));
    ctx.quadraticCurveTo(S(114), S(246), S(104), S(214));
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, S(LEAF.x), S(LEAF.y), S(LEAF.len), S(LEAF.wid), LEAF.rot, { wilt: hot });

    // 산소 기포
    for (const b of bubbles) {
      const wob = Math.sin(b.y * 0.12 + b.k * 1.7) * 2.6;
      drawMatter(ctx, S(b.x + wob), S(b.y), S(b.r), "oxygen");
    }

    // 광합성량 게이지
    ctx.save();
    roundPath(ctx, S(GAUGE.x), S(GAUGE.y), S(GAUGE.w), S(GAUGE.h), S(GAUGE.w / 2));
    ctx.fillStyle = alpha("paper", 0.12);
    ctx.fill();
    const fh = GAUGE.h * clamp(amt, 0, 1);
    if (fh > 1.5) {
      roundPath(ctx, S(GAUGE.x), S(GAUGE.y + GAUGE.h - fh), S(GAUGE.w), S(fh), S(GAUGE.w / 2));
      const fg = ctx.createLinearGradient(0, S(GAUGE.y + GAUGE.h), 0, S(GAUGE.y));
      fg.addColorStop(0, plantColor("leafLo"));
      fg.addColorStop(0.55, plantColor("leaf"));
      fg.addColorStop(1, plantColor("leafHi"));
      ctx.fillStyle = fg;
      ctx.fill();
    }
    // 눈금(4분할)
    ctx.strokeStyle = alpha("paper", 0.22);
    ctx.lineWidth = Math.max(1, S(1));
    ctx.beginPath();
    for (let i = 1; i <= 3; i++) {
      const gyv = S(GAUGE.y + (GAUGE.h * i) / 4);
      ctx.moveTo(S(GAUGE.x), gyv);
      ctx.lineTo(S(GAUGE.x + GAUGE.w), gyv);
    }
    ctx.stroke();
    ctx.restore();

    badge(ctx, S(72), S(274), "광합성량", "leaf", sc);
    if (hot > 0.35) badge(ctx, S(82), S(128), "너무 뜨거워요", "sun", sc);
  }

  // ── 오른쪽 무대: 광합성량 그래프 ────────────────────────────
  function curvePath(
    ctx: CanvasRenderingContext2D, sc: number, id: FactorId, xMax: number,
  ): void {
    const gx = (x: number): number => (PLOT.x0 + x * PLOT.w) * sc;
    const gy = (y: number): number => (PLOT.y0 - y * PLOT.h) * sc;
    const f = F[id];
    const xs: number[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) xs.push((xMax * i) / steps);
    if (f.breakpoint < xMax) xs.push(f.breakpoint); // 꺾이는 지점은 정확히 찍는다
    xs.sort((a, b) => a - b);
    ctx.beginPath();
    for (let i = 0; i < xs.length; i++) {
      const px = gx(xs[i]);
      const py = gy(f.amount(xs[i]));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function drawGraph(ctx: CanvasRenderingContext2D, sc: number): void {
    const S = (v: number): number => v * sc;
    const gx = (x: number): number => S(PLOT.x0 + x * PLOT.w);
    const gy = (y: number): number => S(PLOT.y0 - y * PLOT.h);

    // 격자
    ctx.save();
    ctx.strokeStyle = alpha("paper", 0.09);
    ctx.lineWidth = Math.max(1, S(1));
    ctx.beginPath();
    for (let i = 1; i <= 4; i++) {
      const vx = gx(i / 4);
      ctx.moveTo(vx, gy(0));
      ctx.lineTo(vx, gy(1));
      const vy = gy(i / 4);
      ctx.moveTo(gx(0), vy);
      ctx.lineTo(gx(1), vy);
    }
    ctx.stroke();

    // 축(화살표는 양의 끝에만)
    ctx.strokeStyle = alpha("paper", 0.52);
    ctx.lineWidth = Math.max(1.2, S(1.6));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(S(PLOT.x0 - 3), S(PLOT.y0));
    ctx.lineTo(S(346), S(PLOT.y0));
    ctx.moveTo(S(340), S(PLOT.y0 - 4.5));
    ctx.lineTo(S(346), S(PLOT.y0));
    ctx.lineTo(S(340), S(PLOT.y0 + 4.5));
    ctx.moveTo(S(PLOT.x0), S(PLOT.y0 + 3));
    ctx.lineTo(S(PLOT.x0), S(74));
    ctx.moveTo(S(PLOT.x0 - 4.5), S(80));
    ctx.lineTo(S(PLOT.x0), S(74));
    ctx.lineTo(S(PLOT.x0 + 4.5), S(80));
    ctx.stroke();
    ctx.restore();

    // 이미 끝까지 민 다른 요인의 곡선 — 옅게 함께
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const id of ORDER) {
      if (id === cur || drawnTo[id] < 95) continue;
      ctx.strokeStyle = alpha("leaf", 0.3);
      ctx.lineWidth = Math.max(1.4, S(2));
      curvePath(ctx, sc, id, 1);
    }
    // 지금 요인의 곡선 — 민 지점까지 진하게 남는다
    const done = xOf(drawnTo[cur]);
    if (done > 0.004) {
      ctx.strokeStyle = plantColor("leafHi");
      ctx.lineWidth = Math.max(2, S(3));
      ctx.shadowColor = alpha("leafHi", 0.5);
      ctx.shadowBlur = S(8);
      curvePath(ctx, sc, cur, done);
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 지금 값 표시(내림 구간을 되짚어 볼 수 있게 진행점과 따로 찍는다)
    const nx = xOf(val[cur]);
    const ny = F[cur].amount(nx);
    ctx.save();
    ctx.strokeStyle = alpha("sun", 0.42);
    ctx.lineWidth = Math.max(1, S(1.2));
    ctx.setLineDash([S(3), S(4)]);
    ctx.beginPath();
    ctx.moveTo(gx(nx), gy(ny));
    ctx.lineTo(gx(nx), gy(0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = plantColor("sun");
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(1.2, S(1.8));
    ctx.beginPath();
    ctx.arc(gx(nx), gy(ny), Math.max(3.4, S(5)), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 눈금 숫자 · 축 이름
    ctx.save();
    ctx.font = `800 ${12.5 * sc}px Pretendard, sans-serif`;
    ctx.fillStyle = alpha("paper", 0.72);
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    const ticks = F[cur].ticks;
    ctx.fillText(ticks[0], gx(0), S(249));
    ctx.fillText(ticks[1], gx(0.5), S(249));
    ctx.fillText(ticks[2], gx(1), S(249));
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = alpha("paper", 0.88);
    ctx.font = `800 ${13 * sc}px Pretendard, sans-serif`;
    ctx.fillText("광합성량", S(206), S(64));
    ctx.restore();
    badge(ctx, S(268), S(282), F[cur].axis, "leaf", sc);
  }

  // ── 루프 ───────────────────────────────────────────────────
  const loop = createLoop((dt, tMs) => {
    const fr = shell.frame();
    // 무대가 논리 높이보다 납작해지지 않게 sc를 가두고(잘림 방지) 가운데 정렬한다.
    const sc = Math.min(fr.sc, fr.h / STAGE_H);
    const ox = (fr.w - BASE_W * sc) / 2;
    fr.ctx.clearRect(0, 0, fr.w, fr.h);
    stepBubbles(dt);
    fr.ctx.save();
    fr.ctx.translate(ox, 0);
    drawTank(fr.ctx, sc, tMs);
    drawGraph(fr.ctx, sc);
    fr.ctx.restore();
  });
  const startId = requestAnimationFrame(() => loop.start());

  api.setCTA("세 가지 요인을 모두 확인해 보세요", { enabled: false });

  return () => {
    cancelAnimationFrame(startId);
    loop.stop();
    range.removeEventListener("input", onInput);
    shell.dispose();
  };
};
