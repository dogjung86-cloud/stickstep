// anVilliLab — 중2 Ⅵ L5 "표면적 공장".
// 작은창자 안쪽 벽을 ① 매끈한 벽 ② 주름 ③ 주름 + 융털 로 바꾸며 영양소를 흘려보낸다.
// "닿는 길이"는 지어낸 값이 아니라 **그려진 벽의 실제 길이를 재서** 계산한다(기하 검산 가능).
// 흡수율도 연출이 아니라 "지나가는 알갱이가 벽면에 닿았는가"를 판정한 결과다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { buildLab, labLife } from "../../../ui/animalLab";
import {
  fitLabCanvas,
  SUBSTANCE, TISSUE, VESSEL, canvasPoint, drawToken, drawTube, labelChip, roundRect, withAlpha, cssVar,
} from "../../../ui/animalKit";
import type { StepRenderer } from "../../types";

const BASE_W = 360;
const CVH = 452;

const X0 = 18;
const X1 = 342;
const FLAT_Y = 250;
const RIDGE = 30; // 주름 높이
const VILLUS = 27; // 융털 길이
const PITCH = 7.2; // 융털 간격
const WIDTH = 4.4; // 융털 굵기

type Mode = 0 | 1 | 2;
const MODE_NAME = ["매끈한 벽", "주름만", "주름 + 융털"] as const;
const SHORT = ["매끈", "주름", "주름+융털"] as const;

/** 벽면의 표면 y — 위로 솟을수록 값이 작다. 이 함수 하나가 그림·길이·흡수 판정의 단일 진실이다. */
function surfaceY(x: number, mode: Mode): number {
  if (mode === 0) return FLAT_Y;
  const ridge = FLAT_Y - RIDGE * Math.abs(Math.sin((x - X0) / 16));
  if (mode === 1) return ridge;
  const phase = (x - X0) % PITCH;
  return phase < WIDTH ? ridge - VILLUS : ridge;
}

/** 벽면을 촘촘히 따라가며 실제 길이를 잰다(1배 기준 = 매끈한 벽의 가로 길이). */
function wallLength(mode: Mode): number {
  const step = 0.25;
  let len = 0;
  let px = X0;
  let py = surfaceY(X0, mode);
  for (let x = X0 + step; x <= X1; x += step) {
    const y = surfaceY(x, mode);
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return len;
}

const LEN = [wallLength(0), wallLength(1), wallLength(2)];

interface Grain {
  x: number;
  y: number;
  vx: number;
  /** 관을 지나는 동안 가라앉는 속도. 총 낙차 drop(10~40px)에서 역산한다. */
  vy: number;
  key: string;
  taken: boolean;
}

const VX = 2.2;

export const anVilliLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; lead?: string; cta?: string; curio?: { q: string; a: string } };
  const life = labLife();

  const lab = buildLab(host, api, {
    title: s.title,
    lead: s.lead,
    aria: "작은창자 안쪽 벽의 모양을 바꿔 가며 영양소가 얼마나 흡수되는지 비교하는 모형",
    height: CVH,
    goals: [
      { id: "flat", title: "매끈한 벽", sub: "흡수율 재기" },
      { id: "villi", title: "주름 + 융털", sub: "얼마나 늘까?" },
      { id: "inside", title: "융털 속 구조", sub: "탭해서 확인" },
    ],
    helper: "먼저 <b>매끈한 벽</b>에서 <b>영양소 흘려보내기</b>를 눌러 얼마나 흡수되는지 재어 봐요.",
    finish: "확인했죠? 벽을 접고(<b>주름</b>) 그 위에 손가락 같은 돌기(<b>융털</b>)를 세우면 <b>닿는 표면이 훨씬 넓어져</b> 영양소를 훨씬 많이 흡수해요. 융털 속에는 <b>모세혈관</b>과 <b>암죽관</b>이 있어서 흡수한 영양소를 실어 간답니다.",
    cta: s.cta ?? "개념 정리하기",
    waitingCta: "세 가지 목표를 모두 달성해 보세요",
    curio: s.curio,
  });

  lab.controls.classList.add("three");
  const modeBtns = ([0, 1, 2] as Mode[]).map((m) =>
    el("button", { class: `an-btn${m === 0 ? " on" : ""}`, attrs: { type: "button" }, dataset: { m: String(m) }, text: MODE_NAME[m] }),
  );
  const runBtn = el("button", { class: "an-btn", attrs: { type: "button" }, text: "영양소 흘려보내기" });
  lab.controls.append(...modeBtns);
  const runRow = el("div", { class: "an-controls" }, runBtn);
  lab.controls.after(runRow);

  let mode: Mode = 0;
  let grains: Grain[] = [];
  let sent = 0;
  let taken = 0;
  let running = false;
  let zoom = false;
  const rate: (number | null)[] = [null, null, null];
  let toast = "";
  let toastUntil = 0;

  const say = (m: string, ms = 3600): void => { toast = m; toastUntil = performance.now() + ms; };

  function setMode(m: Mode): void {
    mode = m;
    grains = [];
    sent = 0;
    taken = 0;
    running = false;
    modeBtns.forEach((b) => b.classList.toggle("on", b.dataset.m === String(m)));
    say(`${MODE_NAME[m]} — 닿는 길이 ${(LEN[m] / LEN[0]).toFixed(1)}배`);
  }

  function finishRun(): void {
    running = false;
    const pct = sent ? Math.round((taken / sent) * 100) : 0;
    rate[mode] = pct;
    say(`${MODE_NAME[mode]}: 흘려보낸 ${sent}개 중 ${taken}개 흡수 — 흡수율 ${pct}%`, 5200);
    if (mode === 0 && !lab.has("flat")) {
      lab.collect("flat", `흡수율 ${pct}%`);
      lab.setHelper(`매끈한 벽은 흡수율이 <b>${pct}%</b>밖에 안 돼요. 이제 <b>주름 + 융털</b>로 바꿔 같은 실험을 해 보세요.`);
    }
    if (mode === 2 && !lab.has("villi")) {
      lab.collect("villi", `흡수율 ${pct}%`);
      lab.setHelper("훨씬 많이 흡수됐죠? 마지막으로 <b>융털 하나를 탭</b>해 속에 무엇이 들어 있는지 확인해 봐요.");
    }
  }

  life.on(runBtn, "click", () => {
    if (running) return;
    running = true;
    grains = [];
    sent = 0;
    taken = 0;
    haptic(HAPTIC.tap);
    say("영양소가 지나가는 중…", 2000);
  });
  modeBtns.forEach((b) => life.on(b, "click", () => { setMode(Number(b.dataset.m) as Mode); haptic(HAPTIC.tap); }));

  const onTap = (ev: Event): void => {
    const p = canvasPoint(lab.canvas, ev as PointerEvent, BASE_W);
    if (mode === 2 && p.y > 190 && p.y < 260) {
      zoom = !zoom;
      haptic(HAPTIC.tap);
      if (zoom && !lab.has("inside")) lab.collect("inside", "모세혈관·암죽관");
      say(zoom ? "융털 하나를 잘라 봤어요. 속에 모세혈관과 암죽관이 있어요." : "확대를 닫았어요.");
    } else if (p.y > 190 && p.y < 260) {
      say("융털이 있는 벽에서만 속을 들여다볼 수 있어요. 벽 모양을 바꿔 보세요.");
    }
  };
  life.on(lab.canvas, "pointerdown", onTap);

  // ── 그리기 ──────────────────────────────────────────────────────────────
  function drawWall(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(X0, 300);
    for (let x = X0; x <= X1; x += 0.6) ctx.lineTo(x, surfaceY(x, mode));
    ctx.lineTo(X1, 300);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 200, 0, 300);
    g.addColorStop(0, TISSUE.gut.mid);
    g.addColorStop(1, TISSUE.gut.lo);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = TISSUE.gut.lo;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // 벽 아래를 지나는 모세혈관 — 흡수한 영양소가 실려 가는 곳
    drawTube(ctx, [{ x: X0, y: 288 }, { x: 120, y: 292 }, { x: 240, y: 288 }, { x: X1, y: 292 }], 9, "capillary");
    labelChip(ctx, 300, 310, "모세혈관", { size: 9.5, bg: withAlpha(VESSEL.capillary.lo, 0.92) });
  }

  function drawZoom(ctx: CanvasRenderingContext2D): void {
    const bx = 196;
    const by = 40;
    ctx.save();
    ctx.fillStyle = withAlpha("#0B1524", 0.95);
    roundRect(ctx, bx, by, 150, 150, 14);
    ctx.fill();
    ctx.strokeStyle = withAlpha("#8FA6C2", 0.5);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // 융털 한 개 단면
    const cx = bx + 74;
    ctx.beginPath();
    ctx.moveTo(cx - 26, by + 136);
    ctx.quadraticCurveTo(cx - 30, by + 40, cx, by + 26);
    ctx.quadraticCurveTo(cx + 30, by + 40, cx + 26, by + 136);
    ctx.closePath();
    const g = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0);
    g.addColorStop(0, TISSUE.gut.lo);
    g.addColorStop(0.5, TISSUE.gut.mid);
    g.addColorStop(1, TISSUE.gut.lo);
    ctx.fillStyle = g;
    ctx.fill();
    // 암죽관(가운데 막힌 관) + 모세혈관 그물
    ctx.strokeStyle = "#F3EFDD";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, by + 44);
    ctx.lineTo(cx, by + 132);
    ctx.stroke();
    ctx.strokeStyle = VESSEL.capillary.mid;
    ctx.lineWidth = 2.6;
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sgn * 16, by + 132);
      ctx.quadraticCurveTo(cx + sgn * 22, by + 76, cx, by + 44);
      ctx.stroke();
    }
    ctx.restore();
    labelChip(ctx, cx, by + 150, "암죽관 · 모세혈관", { size: 9.5, bg: withAlpha("#0B1524", 0.92) });
  }

  const loop: Loop = createLoop((dt, t) => {
    const { ctx } = fitLabCanvas(lab.canvas, BASE_W, CVH);
    ctx.save();
    ctx.fillStyle = cssVar("--stage") || "#0B1524";
    ctx.fillRect(0, 0, BASE_W, CVH);

    // 관 위쪽(음식물이 흐르는 공간)
    ctx.fillStyle = withAlpha("#12233A", 0.9);
    roundRect(ctx, 8, 24, 344, 280, 14);
    ctx.fill();
    ctx.font = "700 10.5px Pretendard, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.3);
    ctx.fillText("작은창자 안쪽 — 소화된 영양소가 지나가는 공간", BASE_W / 2, 52);
    ctx.textAlign = "left";

    if (running && sent < 60) {
      if (Math.random() < 0.35 * dt) {
        sent++;
        const drop = 10 + Math.random() * 30; // 관을 통과하는 동안의 총 낙차
        grains.push({
          x: X0 - 6,
          y: 150 + Math.random() * 94,
          vx: VX,
          vy: (drop * VX) / (X1 - X0),
          key: Math.random() < 0.4 ? "sugar" : Math.random() < 0.6 ? "amino" : "fatty",
          taken: false,
        });
      }
    }
    for (const gr of grains) {
      if (gr.taken) {
        gr.y += dt * 1.6; // 흡수된 알갱이는 벽 아래 모세혈관으로 내려간다
      } else {
        gr.x += gr.vx * dt;
        gr.y += gr.vy * dt;
        // 벽면에 닿았는가 — 연출이 아니라 기하 판정이다.
        if (gr.x >= X0 && gr.x <= X1 && gr.y >= surfaceY(gr.x, mode) - 3) {
          gr.taken = true;
          taken++;
        }
      }
    }
    grains = grains.filter((gr) => gr.x < X1 + 12 && gr.y < 316);
    if (running && sent >= 60 && grains.every((gr) => gr.taken || gr.x > X1)) finishRun();

    drawWall(ctx);
    for (const gr of grains) {
      drawToken(ctx, gr.x, gr.y, gr.taken ? 4 : 5, gr.key, { alpha: gr.taken ? 0.6 : 1 });
    }

    // 계기판
    const ratio = (LEN[mode] / LEN[0]).toFixed(1);
    ctx.fillStyle = withAlpha("#0B1524", 0.62);
    roundRect(ctx, 8, 322, 344, 118, 12);
    ctx.fill();
    ctx.font = "800 11.5px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${MODE_NAME[mode]}`, 20, 338);
    ctx.fillStyle = SUBSTANCE.energy.mid;
    ctx.fillText(`영양소와 닿는 길이  ${ratio}배`, 20, 358);
    ctx.fillStyle = withAlpha("#FFFFFF", 0.86);
    ctx.fillText(`흘려보낸 ${sent}개 · 흡수 ${taken}개`, 20, 378);
    // 세 모드 흡수율 비교 — 조작 버튼(아래 DOM)과 헷갈리지 않게 '결과 기록'임을 명시한다.
    ctx.font = "800 10px Pretendard, sans-serif";
    ctx.fillStyle = withAlpha("#FFFFFF", 0.55);
    ctx.fillText("흡수율 기록", 20, 400);
    ([0, 1, 2] as Mode[]).forEach((m) => {
      const y = 410;
      const x = 20 + m * 112;
      const v = rate[m];
      ctx.fillStyle = withAlpha("#FFFFFF", 0.16);
      roundRect(ctx, x, y, 100, 22, 6);
      ctx.fill();
      if (v != null) {
        ctx.fillStyle = withAlpha(SUBSTANCE.sugar.mid, 0.9);
        roundRect(ctx, x, y, Math.max(6, v), 22, 6);
        ctx.fill();
      }
      ctx.font = "800 9.5px Pretendard, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(v == null ? `${SHORT[m]} 아직` : `${SHORT[m]} ${v}%`, x + 50, y + 11);
      ctx.textAlign = "left";
    });

    if (zoom && mode === 2) drawZoom(ctx);
    if (toast && t < toastUntil) {
      labelChip(ctx, BASE_W / 2, 314, toast, { size: 10, bg: withAlpha("#0B1524", 0.93), fg: "#FFE9A8" });
    }
    ctx.restore();
    lab.setPill(running ? "흘려보내는 중…" : `${MODE_NAME[mode]} · 닿는 길이 ${ratio}배`);
  });

  const start = requestAnimationFrame(() => loop.start());
  return () => {
    cancelAnimationFrame(start);
    loop.stop();
    life.dispose();
    runRow.remove();
  };
};
