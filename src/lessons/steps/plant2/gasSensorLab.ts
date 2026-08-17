// gasSensorLab — 중2 Ⅴ 식물과 에너지(v2), 책 174쪽 '디지털 탐구'의 조작판.
//  · 투명 용기에 상추 모종을 넣고 뚜껑에 이산화 탄소 센서·산소 센서를 꽂은 장치를 왼쪽에 그린다.
//  · 전등을 켜면 10분(= 20초로 압축)이 흐르며 오른쪽 두 그래프가 왼쪽에서 오른쪽으로 자라난다.
//    이산화 탄소는 줄고(ppm 단위 — 공기 중 양이 아주 적다), 산소는 는다(% 단위).
//  · 마지막 국면: 두 그래프 중 '산소 농도 그래프'를 직접 탭해 지목해야 마지막 목표가 채워진다.
//
// 좌표는 논리 360×330 기준으로 설계하고 shell.frame()이 준 sc를 곱해 그린다(포인터는 /sc로 역변환).
// 수치는 전부 결정적이다(Math.random 금지):
//   이산화 탄소 co2(t) = 420 + 480 · e^(−2.2t)      (t = 진행률 0~1)
//   산소       o2(t)  = 20.9 + 0.7 · (1 − e^(−2t))
// 지수 곡선이라 처음엔 빠르고 점점 완만해지며 420ppm·21.6%에 '거의' 닿는다 — 세로축 눈금 라벨의
// 최댓값·최솟값이 바로 그 두 값이고, 상태 필의 실시간 값은 언제나 곡선과 같은 식에서 나온다.

import { createLoop } from "../../../core/anim";
import { clamp } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { Curio } from "../../../ui/curio";
import {
  alpha,
  badge,
  buildLab,
  drawLeaf,
  drawMatter,
  drawSunbeam,
  labButton,
  plantColor,
  safeCapture,
  type PlantTone,
} from "../../../ui/plantKit2";
import type { StepRenderer } from "../../types";

interface GasSensorStep { title: string; lead?: string; cta?: string; curio?: Curio }

type Phase = "idle" | "run" | "done";

const STAGE_H = 330;   // 무대 높이(= 논리 y의 최댓값)
const TOTAL_MIN = 10;  // 관찰 시간(분)
const RUN_MS = 20000;  // 10분을 20초로 압축

const co2At = (t: number): number => 420 + 480 * Math.exp(-2.2 * t);
const o2At = (t: number): number => 20.9 + 0.7 * (1 - Math.exp(-2 * t));

// ── 왼쪽 절반(x 8~168) 장치 좌표 ─────────────────────────────
const CONT = { x: 22, y: 98, w: 132, h: 188 };   // 투명 용기
const LID = { x: 16, y: 88, w: 144, h: 16 };     // 뚜껑
const LAMP = { cx: 88, cy: 78, r: 18 };          // LED 전등(반원)
const BEAM = { x0: 28, x1: 148, y0: 104, y1: 286 };

interface SensorSpec { x: number; y0: number; y1: number; tone: PlantTone; label: string; labelY: number }
const SENSORS: SensorSpec[] = [
  { x: 56, y0: 104, y1: 144, tone: "carbon", label: "이산화 탄소", labelY: 164 },
  { x: 124, y0: 104, y1: 132, tone: "oxygen", label: "산소", labelY: 152 },
];

// 잎 4장 — 줄기 끝(88, 224~268)에서 뻗어 나가도록 중심·각도를 역산했다.
interface LeafSpec { x: number; y: number; len: number; wid: number; rot: number }
const LEAVES: LeafSpec[] = [
  { x: 61, y: 241, len: 55, wid: 24, rot: -0.18 },
  { x: 115, y: 246, len: 55, wid: 23, rot: 0.22 },
  { x: 67, y: 219, len: 46, wid: 20, rot: 0.4 },
  { x: 108, y: 216, len: 45, wid: 19, rot: -0.46 },
];

// 잎에서 떠오르는 산소 알갱이의 출발점(4알) · 잎으로 빨려 드는 이산화 탄소 알갱이의 경로(3알)
const OXY_SEEDS: [number, number][] = [[64, 214], [108, 210], [58, 236], [118, 240]];
const CO2_TRIPS: { from: [number, number]; to: [number, number] }[] = [
  { from: [30, 190], to: [58, 232] },
  { from: [146, 180], to: [110, 215] },
  { from: [148, 226], to: [118, 246] },
];

// ── 오른쪽 절반(x 184~352) 그래프 2개 ────────────────────────
interface GraphSpec {
  key: "co2" | "o2";
  x0: number; x1: number; y0: number; y1: number;
  min: number; max: number;             // 세로축 범위(= 눈금 라벨의 최솟값·최댓값)
  tone: PlantTone;
  name: string; nameY: number;          // 세로축 이름 배지
  top: string; bottom: string;          // 눈금 라벨(최댓값·최솟값만)
  result: string; resultY: number;      // 판독 성공 배지
  hit: { x0: number; y0: number; x1: number; y1: number };
  at(t: number): number;
}

const GRAPHS: GraphSpec[] = [
  {
    key: "co2",
    x0: 232, x1: 346, y0: 82, y1: 138,
    min: 420, max: 900,
    tone: "carbon",
    name: "이산화 탄소(ppm)", nameY: 64,
    top: "900ppm", bottom: "420ppm",
    result: "이산화 탄소 · 감소", resultY: 168,
    // 위쪽 여백은 무대 상태 필(.stage-hud)이 덮는 자리라 y 50부터 잡는다.
    hit: { x0: 186, y0: 50, x1: 356, y1: 180 },
    at: co2At,
  },
  {
    key: "o2",
    x0: 232, x1: 346, y0: 212, y1: 266,
    min: 20.9, max: 21.6,
    tone: "oxygen",
    name: "산소(%)", nameY: 194,
    top: "21.6%", bottom: "20.9%",
    result: "산소 · 증가", resultY: 296,
    hit: { x0: 186, y0: 182, x1: 356, y1: 314 },
    at: o2At,
  },
];

/** 둥근 사각형 경로(캔버스 소품 공용 — 유리 용기·뚜껑·판독 안내 틀). */
function roundPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export const gasSensorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as GasSensorStep;

  let phase: Phase = "idle";
  let elapsed = 0;   // 0~10(분)
  let lampGlow = 0;  // 0~1 — 전등이 켜지고 꺼질 때 부드럽게 오르내린다
  let sc = 1;        // 논리→화면 배율(매 프레임 갱신)

  const readText = (): string => {
    const t = elapsed / TOTAL_MIN;
    return `${Math.round(elapsed)}분 · 이산화 탄소 ${Math.round(co2At(t))}ppm · 산소 ${o2At(t).toFixed(1)}%`;
  };

  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "light", name: "전등 켜기", hint: "빛 비추기" },
      { id: "watch", name: "10분 관찰", hint: "끝까지 보기" },
      { id: "read", name: "곡선 읽기", hint: "산소 그래프 탭" },
    ],
    helper: "전등을 켜고 <b>10분</b> 동안 두 센서의 값이 어떻게 변하는지 지켜보세요.",
    read: "전등을 켜면 관찰이 시작돼요",
    curio: s.curio,
    ariaLabel: "투명 용기 속 상추에 전등을 비추고 이산화 탄소 센서와 산소 센서의 농도 변화를 두 그래프로 관찰하는 무대",
    onAll: () => {
      shell.helper.innerHTML =
        "빛을 비추자 <b>이산화 탄소는 줄고 산소는 늘었어요</b>. 광합성에 이산화 탄소가 쓰이고, 산소가 만들어진다는 증거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  // 상태 필은 매 프레임 갱신 후보라 값이 바뀔 때만 쓴다.
  let lastRead = "";
  const setRead = (text: string): void => {
    if (text === lastRead) return;
    lastRead = text;
    shell.setRead(text);
  };

  // ── 조작부(무대 아래) ──────────────────────────────────────
  const lightBtn = labButton("전등 켜기", () => startRun(), { tone: "primary" });
  lightBtn.dataset.act = "light";
  const fastBtn = labButton("빨리 감기", () => skipAhead(), { sub: "10분을 건너뛰어요" });
  fastBtn.dataset.act = "fast";
  shell.controls.classList.add("two");
  shell.controls.append(lightBtn, fastBtn);

  const setBtnLabel = (btn: HTMLButtonElement, text: string): void => {
    const b = btn.querySelector("b");
    if (b) b.textContent = text;
  };

  function startRun(): void {
    if (phase !== "idle") return;
    phase = "run";
    lightBtn.classList.add("on");
    setBtnLabel(lightBtn, "관찰 중…");
    setRead(readText());
    shell.collect("light", "빛을 비추자 잎에서 변화가 시작돼요");
  }

  function finish(): void {
    if (phase === "done") return;
    phase = "done";
    elapsed = TOTAL_MIN;
    setBtnLabel(lightBtn, "관찰 끝");
    setRead("10분이 지났어요. 두 곡선을 확인해요");
    shell.helper.innerHTML =
      "곡선이 다 그려졌어요. 두 그래프 중 <b>산소 농도 그래프</b>를 탭해 지목해 보세요.";
    shell.collect("watch", "이산화 탄소는 줄고 산소는 늘었어요");
  }

  // 남은 시간을 즉시 끝까지 — 성급한 학생과 E2E를 위한 탈출구(전등이 꺼져 있으면 함께 켠다).
  function skipAhead(): void {
    if (phase === "idle") startRun();
    if (phase === "run") finish();
  }

  // ── 캔버스 탭(곡선 판독) ───────────────────────────────────
  const onDown = (e: PointerEvent): void => {
    safeCapture(shell.canvas, e.pointerId);
    if (phase !== "done" || shell.has("read")) return;
    const r = shell.canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / sc;
    const py = (e.clientY - r.top) / sc;
    const picked = GRAPHS.find(
      (g) => px >= g.hit.x0 && px <= g.hit.x1 && py >= g.hit.y0 && py <= g.hit.y1,
    );
    if (!picked) {
      shell.toast("두 그래프 중 하나를 탭해 지목해 보세요");
      return;
    }
    if (picked.key === "o2") {
      setRead(readText());
      shell.collect("read", "올라가는 곡선이 산소예요");
    } else {
      // 오답은 채점하지 않는다 — 왜 아닌지만 짚고 다시 시도하게 둔다.
      haptic(HAPTIC.wrong);
      shell.toast("그 곡선은 시간이 갈수록 내려가고 있어요. 광합성에 쓰인 기체겠죠?");
    }
  };
  shell.canvas.addEventListener("pointerdown", onDown);

  // ── 그리기 ────────────────────────────────────────────────
  const S = (v: number): number => v * sc;

  const drawText = (
    ctx: CanvasRenderingContext2D,
    text: string, x: number, y: number,
    opts: { size?: number; align?: CanvasTextAlign; color?: string; weight?: number } = {},
  ): void => {
    ctx.save();
    // 캔버스 글자 하한 12px(무대 위 작은 글자 규칙).
    ctx.font = `${opts.weight ?? 800} ${Math.max(12, (opts.size ?? 12.5) * sc)}px Pretendard, sans-serif`;
    ctx.textAlign = opts.align ?? "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2.4, 3 * sc);
    ctx.strokeStyle = alpha("ink", 0.72);
    ctx.strokeText(text, S(x), S(y));
    ctx.fillStyle = opts.color ?? alpha("paper", 0.95);
    ctx.fillText(text, S(x), S(y));
    ctx.restore();
  };

  const drawLamp = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    // 천장 고정대
    ctx.fillStyle = alpha("carbon", 0.85);
    roundPath(ctx, S(LAMP.cx - 6), S(52), S(12), S(14), S(3));
    ctx.fill();
    // 반원 갓
    const g = ctx.createLinearGradient(S(LAMP.cx - LAMP.r), S(LAMP.cy - LAMP.r), S(LAMP.cx + LAMP.r), S(LAMP.cy));
    g.addColorStop(0, alpha("paper", 0.72));
    g.addColorStop(0.55, plantColor("carbon"));
    g.addColorStop(1, alpha("ink", 0.8));
    ctx.fillStyle = g;
    ctx.strokeStyle = alpha("ink", 0.75);
    ctx.lineWidth = 1.4 * sc;
    ctx.beginPath();
    ctx.arc(S(LAMP.cx), S(LAMP.cy), S(LAMP.r), Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 빛이 나오는 면
    if (lampGlow > 0.02) {
      const glow = ctx.createRadialGradient(S(LAMP.cx), S(LAMP.cy + 2), S(2), S(LAMP.cx), S(LAMP.cy + 2), S(46));
      glow.addColorStop(0, alpha("sun", 0.5 * lampGlow));
      glow.addColorStop(1, alpha("sun", 0));
      ctx.fillStyle = glow;
      ctx.fillRect(S(LAMP.cx - 50), S(LAMP.cy - 6), S(100), S(56));
    }
    ctx.fillStyle = lampGlow > 0.02 ? plantColor("sun") : alpha("paper", 0.32);
    roundPath(ctx, S(LAMP.cx - 20), S(LAMP.cy - 3), S(40), S(8), S(4));
    ctx.fill();
    ctx.restore();
  };

  const drawGlassBack = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    const g = ctx.createLinearGradient(S(CONT.x), S(CONT.y), S(CONT.x + CONT.w), S(CONT.y + CONT.h));
    g.addColorStop(0, "rgba(228,244,255,.17)");
    g.addColorStop(0.5, "rgba(150,196,232,.07)");
    g.addColorStop(1, "rgba(228,244,255,.13)");
    ctx.fillStyle = g;
    roundPath(ctx, S(CONT.x), S(CONT.y), S(CONT.w), S(CONT.h), S(16));
    ctx.fill();
    ctx.restore();
  };

  const drawGlassFront = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    roundPath(ctx, S(CONT.x), S(CONT.y), S(CONT.w), S(CONT.h), S(16));
    ctx.strokeStyle = "rgba(228,244,255,.5)";
    ctx.lineWidth = 1.6 * sc;
    ctx.stroke();
    // 좌상단 키라이트(스펙큘러 스트릭)
    ctx.strokeStyle = "rgba(255,255,255,.2)";
    ctx.lineWidth = 3 * sc;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(S(36), S(124));
    ctx.lineTo(S(36), S(198));
    ctx.moveTo(S(46), S(124));
    ctx.lineTo(S(46), S(162));
    ctx.stroke();
    ctx.restore();
  };

  const drawLid = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    const g = ctx.createLinearGradient(0, S(LID.y), 0, S(LID.y + LID.h));
    g.addColorStop(0, alpha("paper", 0.55));
    g.addColorStop(0.5, plantColor("carbon"));
    g.addColorStop(1, alpha("ink", 0.78));
    ctx.fillStyle = g;
    ctx.strokeStyle = alpha("ink", 0.7);
    ctx.lineWidth = 1.4 * sc;
    roundPath(ctx, S(LID.x), S(LID.y), S(LID.w), S(LID.h), S(7));
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawSensors = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    for (const sensor of SENSORS) {
      // 가는 회색 막대
      ctx.strokeStyle = plantColor("carbon");
      ctx.lineWidth = 3.6 * sc;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(S(sensor.x), S(sensor.y0));
      ctx.lineTo(S(sensor.x), S(sensor.y1));
      ctx.stroke();
      ctx.strokeStyle = alpha("paper", 0.42);
      ctx.lineWidth = 1.1 * sc;
      ctx.beginPath();
      ctx.moveTo(S(sensor.x - 1), S(sensor.y0 + 3));
      ctx.lineTo(S(sensor.x - 1), S(sensor.y1 - 3));
      ctx.stroke();
      // 끝 알갱이(센서 머리) — 색으로 어느 기체를 재는지 알린다
      ctx.fillStyle = plantColor(sensor.tone);
      ctx.strokeStyle = alpha("paper", 0.8);
      ctx.lineWidth = 1.3 * sc;
      ctx.beginPath();
      ctx.arc(S(sensor.x), S(sensor.y1 + 3), S(5), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawPlant = (ctx: CanvasRenderingContext2D): void => {
    ctx.save();
    // 흙
    ctx.fillStyle = plantColor("soil");
    ctx.beginPath();
    ctx.ellipse(S(88), S(272), S(46), S(12), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = alpha("ink", 0.25);
    ctx.beginPath();
    ctx.ellipse(S(88), S(276), S(46), S(8), 0, 0, Math.PI * 2);
    ctx.fill();
    // 짧은 줄기
    ctx.strokeStyle = plantColor("stem");
    ctx.lineWidth = 5.2 * sc;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(S(88), S(268));
    ctx.quadraticCurveTo(S(85), S(248), S(88), S(224));
    ctx.stroke();
    ctx.strokeStyle = alpha("stemHi", 0.75);
    ctx.lineWidth = 1.6 * sc;
    ctx.beginPath();
    ctx.moveTo(S(86.4), S(266));
    ctx.quadraticCurveTo(S(83.4), S(248), S(86.4), S(226));
    ctx.stroke();
    ctx.restore();
    for (const leaf of LEAVES) {
      drawLeaf(ctx, S(leaf.x), S(leaf.y), S(leaf.len), S(leaf.wid), leaf.rot);
    }
  };

  // drawMatter는 내부에서 globalAlpha를 1로 덮으므로 나타남·사라짐은 '크기'로 준다
  // (산소는 떠오르며 작아지고, 이산화 탄소는 잎에 빨려 들며 작아진다 — 흡수가 그대로 읽힌다).
  const drawParticles = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    if (lampGlow < 0.05) return;
    // 잎에서 떠오르는 산소
    for (let i = 0; i < OXY_SEEDS.length; i++) {
      const [bx, by] = OXY_SEEDS[i];
      const p = ((tMs / 3400) + i / OXY_SEEDS.length) % 1;
      const x = bx + Math.sin(p * 5.2 + i * 1.7) * 4;
      const y = by - p * 74;
      const grow = clamp(Math.min(1, p / 0.14) * Math.min(1, (1 - p) / 0.24), 0, 1) * lampGlow;
      if (grow < 0.12) continue;
      drawMatter(ctx, S(x), S(y), S(6 * grow), "oxygen");
    }
    // 잎으로 빨려 드는 이산화 탄소
    for (let i = 0; i < CO2_TRIPS.length; i++) {
      const trip = CO2_TRIPS[i];
      const p = ((tMs / 3800) + i / CO2_TRIPS.length) % 1;
      const x = trip.from[0] + (trip.to[0] - trip.from[0]) * p;
      const y = trip.from[1] + (trip.to[1] - trip.from[1]) * p;
      const grow = clamp(Math.min(1, p / 0.12) * Math.min(1, (1 - p) / 0.3), 0, 1) * lampGlow;
      if (grow < 0.12) continue;
      drawMatter(ctx, S(x), S(y), S(6.5 * grow), "carbon");
    }
  };

  const drawGraph = (ctx: CanvasRenderingContext2D, g: GraphSpec, tMs: number): void => {
    const prog = elapsed / TOTAL_MIN;
    const gx = (t: number): number => g.x0 + (g.x1 - g.x0) * t;
    const gy = (v: number): number => g.y1 - ((v - g.min) / (g.max - g.min)) * (g.y1 - g.y0);

    ctx.save();
    // 격자(가로 2분 간격 · 세로 4칸)
    ctx.strokeStyle = "rgba(255,255,255,.1)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const x = g.x0 + ((g.x1 - g.x0) * i) / 5;
      ctx.beginPath();
      ctx.moveTo(S(x), S(g.y0));
      ctx.lineTo(S(x), S(g.y1));
      ctx.stroke();
    }
    for (let j = 1; j <= 3; j++) {
      const y = g.y0 + ((g.y1 - g.y0) * j) / 4;
      ctx.beginPath();
      ctx.moveTo(S(g.x0), S(y));
      ctx.lineTo(S(g.x1), S(y));
      ctx.stroke();
    }
    // 축(세로 = 농도, 가로 = 시간)
    ctx.strokeStyle = "rgba(255,255,255,.46)";
    ctx.lineWidth = 1.6 * sc;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(S(g.x0), S(g.y0));
    ctx.lineTo(S(g.x0), S(g.y1));
    ctx.lineTo(S(g.x1), S(g.y1));
    ctx.stroke();
    ctx.restore();

    // 곡선 — 관찰이 진행되는 동안 왼쪽에서 오른쪽으로 자라난다
    if (prog > 0.002) {
      ctx.save();
      ctx.strokeStyle = plantColor(g.tone);
      ctx.lineWidth = 3.2 * sc;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.shadowColor = alpha(g.tone, 0.6);
      ctx.shadowBlur = 9 * sc;
      ctx.beginPath();
      const steps = 56;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * prog;
        const x = S(gx(t));
        const y = S(gy(g.at(t)));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
    // 선두 점(지금 센서가 읽는 값)
    if (phase !== "idle") {
      const hx = S(gx(prog));
      const hy = S(gy(g.at(prog)));
      ctx.save();
      if (phase === "run") {
        const pulse = 0.5 + 0.5 * Math.sin(tMs / 260);
        ctx.fillStyle = alpha(g.tone, 0.34 * (1 - pulse));
        ctx.beginPath();
        ctx.arc(hx, hy, (5 + 5 * pulse) * sc, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = plantColor(g.tone);
      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.lineWidth = 1.6 * sc;
      ctx.beginPath();
      ctx.arc(hx, hy, 4.2 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 눈금 라벨(최댓값·최솟값만 — 배지 없이 작은 흰 글자) + 시간 축
    const tick = alpha("paper", 0.86);
    drawText(ctx, g.top, g.x0 - 6, g.y0, { size: 12, align: "right", weight: 750, color: tick });
    drawText(ctx, g.bottom, g.x0 - 6, g.y1, { size: 12, align: "right", weight: 750, color: tick });
    drawText(ctx, "0분", g.x0, g.y1 + 11, { size: 12, align: "left", weight: 750, color: tick });
    drawText(ctx, "10분", g.x1, g.y1 + 11, { size: 12, align: "right", weight: 750, color: tick });
    // 세로축 이름 배지 · 판독 성공 배지
    badge(ctx, S((g.x0 + g.x1) / 2), S(g.nameY), g.name, g.tone, sc);
    if (shell.has("read")) badge(ctx, S((g.x0 + g.x1) / 2), S(g.resultY), g.result, g.tone, sc);
  };

  const drawPickHint = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    if (phase !== "done" || shell.has("read")) return;
    const pulse = 0.5 + 0.5 * Math.sin(tMs / 460);
    ctx.save();
    ctx.setLineDash([7 * sc, 6 * sc]);
    ctx.lineWidth = 1.6 * sc;
    ctx.strokeStyle = alpha("paper", 0.24 + 0.24 * pulse);
    for (const g of GRAPHS) {
      roundPath(ctx, S(g.hit.x0), S(g.hit.y0), S(g.hit.x1 - g.hit.x0), S(g.hit.y1 - g.hit.y0), S(14));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  };

  const loop = createLoop((dt, tMs) => {
    const fr = shell.frame();
    const ctx = fr.ctx;
    sc = fr.sc;
    ctx.clearRect(0, 0, fr.w, fr.h);

    // 시간 진행(dt 기반 — 10분을 RUN_MS에 압축)
    if (phase === "run") {
      elapsed = Math.min(TOTAL_MIN, elapsed + ((dt * 16.7) / RUN_MS) * TOTAL_MIN);
      if (elapsed >= TOTAL_MIN) finish();
      else setRead(readText());
    }
    lampGlow = clamp(lampGlow + (phase === "idle" ? -1 : 1) * dt * 0.055, 0, 1);

    drawGlassBack(ctx);
    drawSunbeam(ctx, S(BEAM.x0), S(BEAM.x1), S(BEAM.y0), S(BEAM.y1), lampGlow, tMs);
    drawPlant(ctx);
    drawParticles(ctx, tMs);
    drawLid(ctx);
    drawSensors(ctx);
    drawGlassFront(ctx);
    drawLamp(ctx); // 전등은 마지막 — 글로우가 뚜껑·유리 위로 번져야 빛이 '내려오는' 것으로 읽힌다
    for (const sensor of SENSORS) {
      drawText(ctx, sensor.label, sensor.x, sensor.labelY, { size: 12 });
    }
    drawPickHint(ctx, tMs);
    for (const g of GRAPHS) drawGraph(ctx, g, tMs);
  });

  // 마운트 직후엔 캔버스 폭이 아직 0일 수 있어 다음 프레임에 시작한다.
  const raf = requestAnimationFrame(() => loop.start());

  api.setCTA("전등을 켜고 10분을 관찰해 보세요", { enabled: false });

  return () => {
    cancelAnimationFrame(raf);
    loop.stop();
    shell.canvas.removeEventListener("pointerdown", onDown);
    shell.dispose();
  };
};
