// dayNightGasLab — 낮·밤에 식물로 드나드는 기체를 유저가 예측해 맞히는 캔버스 랩(중2 Ⅴ L6, 184~185쪽).
//  · 무대는 낮(밝은 하늘·해) ↔ 밤(남색 하늘·달·별)을 0.4초 색 보간으로 오간다.
//  · 왼쪽 위 막대 2개 = 광합성(초록)·호흡(주황). 광합성은 밤에 0이 되지만 호흡 막대는 낮·밤 모두 35%로 살아 있다.
//  · 오른쪽 위 잎 확대 인셋 = 세포 하나 안의 엽록체(낮에만 빛남)와 마이토콘드리아(항상 맥동).
//  · 식물 좌우의 기체 화살표(이산화 탄소·산소)는 유저가 탭해서 안(흡수)↔밖(방출)으로 뒤집고,
//    "이대로 확인하기"로 지금 상태(낮/밤)에 대해 채점한다. 틀리면 채점하지 않고 교정 힌트만 준다.
// 조작 실체: 캔버스 탭 → 논리 좌표(360×330)로 역변환 → 화살표 원 판정 / 호흡 막대 사각 판정.
// 과학 가드: 호흡은 낮과 밤 모두 항상 일어난다. 낮에는 광합성이 호흡보다 많아 겉보기 출입이 반대로 보일 뿐이다.
//           교과서 미도입 용어(보상점·순광합성·총광합성)는 쓰지 않는다.

import { clamp, el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import {
  BASE_W, alpha, badge, buildLab, contact, drawChloroplast, drawLeaf, drawMatter, drawPot,
  labButton, plantColor, safeCapture, type Matter,
} from "../../../ui/plantKit2";
import type { Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface DayNightStep { title: string; lead?: string; cta?: string; curio?: Curio }

type Dir = "in" | "out";
type Mode = "day" | "night";

const STAGE_H = 330;

// ── 논리 좌표(360×330) — 그림과 탭 판정이 같은 상수를 쓴다 ──────────────
const CO2_HIT = { cx: 70, cy: 166, r: 46 };   // 왼쪽: 이산화 탄소 화살표
const O2_HIT = { cx: 290, cy: 166, r: 46 };   // 오른쪽: 산소 화살표
const RESP_BAR = { x: 24, y: 108, w: 110, h: 12 }; // 왼쪽 위 주황 막대(호흡)
const RESP_PAD = 16;                              // 막대 판정 여유 반경
const PHOTO_BAR = { x: 24, y: 74, w: 110, h: 12 };

// 별은 인덱스 기반 고정 배열(Math.random 금지). [x, y, 반지름]
const STARS: readonly (readonly [number, number, number])[] = [
  [157, 22, 1.6], [204, 30, 1.2], [152, 66, 1.1], [212, 74, 1.5], [176, 96, 1.3],
  [196, 124, 1.1], [164, 140, 1.4], [22, 214, 1.5], [52, 240, 1.1], [318, 214, 1.3],
  [344, 246, 1.5], [286, 264, 1.1], [108, 272, 1.3], [252, 292, 1.2],
];

type RoundCtx = CanvasRenderingContext2D & { roundRect(x: number, y: number, w: number, h: number, r: number): void };
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  (ctx as RoundCtx).roundRect(x, y, w, h, r);
}

/** 점이 사각형에서 pad 이내인가(모서리는 반경 판정과 같다). */
function nearRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }, pad: number): boolean {
  const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
  const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
  return Math.hypot(dx, dy) <= pad;
}

function inCircle(px: number, py: number, c: { cx: number; cy: number; r: number }): boolean {
  return Math.hypot(px - c.cx, py - c.cy) <= c.r;
}

export const dayNightGasLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DayNightStep;

  const BASE_HELP =
    "화살표를 <b>탭</b>해 방향을 정하고 <b>이대로 확인하기</b>를 눌러요. 낮과 밤, 잎으로 드나드는 기체가 달라져요.";

  let allDone = false;

  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "day", name: "낮의 출입", hint: "화살표 맞히기" },
      { id: "night", name: "밤의 출입", hint: "화살표 맞히기" },
      { id: "always", name: "항상 호흡", hint: "막대 탭" },
    ],
    helper: BASE_HELP,
    read: "낮 · 빛이 있어요",
    curio: s.curio,
    ariaLabel: "낮과 밤을 바꾸며 식물로 드나드는 이산화 탄소와 산소의 방향을 정하는 무대. 왼쪽 위에 광합성과 호흡 막대, 오른쪽 위에 잎 세포 확대 창이 있다",
    onAll: () => {
      allDone = true;
      shell.helper.innerHTML =
        "광합성은 <b>빛이 있는 낮</b>에 주로 일어나지만, 호흡은 <b>낮과 밤 모두 항상</b> 일어나요. " +
        "낮에는 광합성이 호흡보다 많아서 이산화 탄소를 흡수하고 산소를 내보내는 것처럼 보이는 거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  // ── 상태 ────────────────────────────────────────────────────────────
  let mode: Mode = "day";
  let co2Dir: Dir = "in";
  let o2Dir: Dir = "in";
  let co2FlipAt = -1;
  let o2FlipAt = -1;
  let touchedArrow = false;   // 한 번이라도 화살표를 뒤집었는가(탭 유도 링 표시용)
  let nowMs = 0;              // 루프가 갱신하는 현재 시각(핸들러에서 참조)
  // 낮(1) ↔ 밤(0) 색 보간 — tMs 기반 0.4초
  let dayFrom = 1;
  let dayTo = 1;
  let dayAt = -1;

  const dayFactor = (t: number): number => {
    if (dayAt < 0) return dayTo;
    const k = clamp((t - dayAt) / 400, 0, 1);
    const e = k * k * (3 - 2 * k);
    return dayFrom + (dayTo - dayFrom) * e;
  };

  const setHelp = (html: string): void => { if (!allDone) shell.helper.innerHTML = html; };

  // ── 조작부(무대 아래) ───────────────────────────────────────────────
  // 낮/밤은 한 줄에 둘, 확인 버튼은 아래 통줄(중첩 그리드라 안쪽 줄의 margin-top은 지운다).
  const row = el("div", { class: "pgx-controls two", style: "margin-top:0" });
  const dayBtn = labButton("낮으로", () => setMode("day"));
  const nightBtn = labButton("밤으로", () => setMode("night"));
  const checkBtn = labButton("이대로 확인하기", () => check(), { tone: "primary" });
  dayBtn.dataset.act = "day";
  nightBtn.dataset.act = "night";
  checkBtn.dataset.act = "check";
  dayBtn.classList.add("on");
  row.append(dayBtn, nightBtn);
  shell.controls.append(row, checkBtn);

  function setMode(next: Mode): void {
    dayBtn.classList.toggle("on", next === "day");
    nightBtn.classList.toggle("on", next === "night");
    if (next === mode) return;
    mode = next;
    dayFrom = dayFactor(nowMs);
    dayTo = next === "day" ? 1 : 0;
    dayAt = nowMs;
    shell.setRead(next === "day" ? "낮 · 빛이 있어요" : "밤 · 빛이 없어요");
    setHelp(BASE_HELP);
  }

  function check(): void {
    const ok = mode === "day"
      ? co2Dir === "in" && o2Dir === "out"
      : co2Dir === "out" && o2Dir === "in";
    if (!ok) {
      haptic(HAPTIC.wrong);
      setHelp(mode === "day"
        ? "빛이 있을 때 잎에서 무엇이 만들어졌는지 떠올려 봐요."
        : "빛이 없으면 광합성은 멈춰요. 그래도 계속되는 과정이 있죠?");
      shell.toast("아직 방향이 맞지 않아요. 화살표를 다시 정해 보세요");
      return;
    }
    const msg = mode === "day"
      ? "낮에는 광합성이 호흡보다 많아 이산화 탄소를 흡수하고 산소를 내보내요"
      : "밤에는 호흡만 해서 산소를 흡수하고 이산화 탄소를 내보내요";
    setHelp(BASE_HELP);
    if (shell.has(mode)) shell.toast(msg);
    else shell.collect(mode, msg);
  }

  // ── 캔버스 탭 ───────────────────────────────────────────────────────
  const onDown = (e: PointerEvent): void => {
    const r = shell.canvas.getBoundingClientRect();
    const sc = (r.width || BASE_W) / BASE_W;
    const px = (e.clientX - r.left) / sc;
    const py = (e.clientY - r.top) / sc;
    // 판정 순서: 호흡 막대 → 이산화 탄소 화살표 → 산소 화살표(영역이 겹치는 경계에서 위쪽이 이긴다).
    if (nearRect(px, py, RESP_BAR, RESP_PAD)) {
      safeCapture(shell.canvas, e.pointerId);
      haptic(HAPTIC.tap);
      if (mode === "night") {
        if (shell.has("always")) shell.toast("밤에도 호흡은 계속돼요");
        else shell.collect("always", "밤에도 호흡은 계속돼요");
      } else {
        shell.toast("밤에는 어떨까요? 밤으로 바꾼 뒤 다시 확인해요");
      }
      return;
    }
    if (inCircle(px, py, CO2_HIT)) {
      co2Dir = co2Dir === "in" ? "out" : "in";
      co2FlipAt = nowMs;
      touchedArrow = true;
      safeCapture(shell.canvas, e.pointerId);
      haptic(HAPTIC.tap);
      return;
    }
    if (inCircle(px, py, O2_HIT)) {
      o2Dir = o2Dir === "in" ? "out" : "in";
      o2FlipAt = nowMs;
      touchedArrow = true;
      safeCapture(shell.canvas, e.pointerId);
      haptic(HAPTIC.tap);
    }
  };
  shell.canvas.addEventListener("pointerdown", onDown);

  // ── 그리기 ──────────────────────────────────────────────────────────
  // skyH = 캔버스 높이를 논리 단위로 환산한 값(좁은 화면에서 아래가 비지 않게 끝까지 칠한다).
  function drawSky(ctx: CanvasRenderingContext2D, dayF: number, skyH: number): void {
    ctx.fillStyle = plantColor("paper");
    ctx.fillRect(0, 0, BASE_W, skyH);
    const g = ctx.createLinearGradient(0, 0, 0, skyH);
    g.addColorStop(0, alpha("water", 0.36));
    g.addColorStop(0.6, alpha("water", 0.12));
    g.addColorStop(1, alpha("leafHi", 0.3));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, BASE_W, skyH);
    if (dayF < 0.998) {
      ctx.fillStyle = alpha("night", 1 - dayF);
      ctx.fillRect(0, 0, BASE_W, skyH);
    }
  }

  function drawSun(ctx: CanvasRenderingContext2D, dayF: number, tMs: number): void {
    if (dayF < 0.02) return;
    ctx.save();
    ctx.globalAlpha = dayF;
    ctx.translate(181, 44);
    ctx.rotate((tMs / 9000) % (Math.PI * 2));
    ctx.strokeStyle = alpha("sun", 0.6);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 21, Math.sin(a) * 21);
      ctx.lineTo(Math.cos(a) * 27, Math.sin(a) * 27);
      ctx.stroke();
    }
    ctx.rotate(-((tMs / 9000) % (Math.PI * 2)));
    const g = ctx.createRadialGradient(-5, -6, 2, 0, 0, 17);
    g.addColorStop(0, plantColor("paper"));
    g.addColorStop(0.45, plantColor("sun"));
    g.addColorStop(1, plantColor("sun"));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawNightSky(ctx: CanvasRenderingContext2D, dayF: number, tMs: number): void {
    const nightF = 1 - dayF;
    if (nightF < 0.02) return;
    ctx.save();
    ctx.globalAlpha = nightF;
    for (let i = 0; i < STARS.length; i++) {
      const [x, y, r] = STARS[i];
      const tw = 0.55 + 0.45 * Math.sin(tMs / 620 + i * 1.7);
      ctx.fillStyle = alpha("paper", 0.55 + 0.4 * tw);
      ctx.beginPath();
      ctx.arc(x, y, r * (0.8 + 0.3 * tw), 0, Math.PI * 2);
      ctx.fill();
    }
    // 달 — 원 하나를 그린 뒤 밤하늘 색 원으로 한 입 베어 초승달을 만든다.
    ctx.fillStyle = plantColor("paper");
    ctx.beginPath();
    ctx.arc(181, 44, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = plantColor("night");
    ctx.beginPath();
    ctx.arc(189, 39, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlant(ctx: CanvasRenderingContext2D, tMs: number): void {
    contact(ctx, 180, 270, 44, 0.16);
    drawPot(ctx, 180, 230, 76, 38);
    // 줄기(아래가 굵은 사다리꼴) — 바람에 아주 살짝 흔들린다.
    const sway = Math.sin(tMs / 1400) * 1.4;
    ctx.save();
    const gs = ctx.createLinearGradient(174, 0, 186, 0);
    gs.addColorStop(0, plantColor("stemHi"));
    gs.addColorStop(0.5, plantColor("stem"));
    gs.addColorStop(1, plantColor("stemLo"));
    ctx.fillStyle = gs;
    ctx.strokeStyle = plantColor("stemLo");
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(175.5, 234);
    ctx.lineTo(184.5, 234);
    ctx.quadraticCurveTo(183.5 + sway * 0.5, 195, 182.5 + sway, 158);
    ctx.lineTo(178 + sway, 158);
    ctx.quadraticCurveTo(177 + sway * 0.5, 195, 175.5, 234);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // 잎 3장 — 밑동이 줄기에 닿도록 중심·회전을 역산했다(밑동 = 중심 − (len/2)(cos, sin)).
    drawLeaf(ctx, 144 + sway * 0.6, 196, 64, 26, -2.75);
    drawLeaf(ctx, 216 + sway * 0.6, 196, 64, 26, -0.39);
    drawLeaf(ctx, 204 + sway, 156, 56, 22, -0.6);
  }

  function drawBars(ctx: CanvasRenderingContext2D, dayF: number, tMs: number): void {
    ctx.save();
    rr(ctx, 12, 48, 134, 88, 14);
    ctx.fillStyle = alpha("paper", 0.92);
    ctx.fill();
    ctx.strokeStyle = alpha("leafLo", 0.24);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = "900 12px Pretendard, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = alpha("ink", 0.84);
    ctx.fillText("광합성", PHOTO_BAR.x, 66);
    ctx.fillText("호흡", RESP_BAR.x, 100);

    const track = (b: { x: number; y: number; w: number; h: number }): void => {
      rr(ctx, b.x, b.y, b.w, b.h, b.h / 2);
      ctx.fillStyle = alpha("ink", 0.1);
      ctx.fill();
    };
    track(PHOTO_BAR);
    track(RESP_BAR);

    // 광합성 — 낮 100% · 밤 0%(전환 중에는 보간값)
    if (dayF > 0.01) {
      const w = PHOTO_BAR.w * dayF;
      const g = ctx.createLinearGradient(PHOTO_BAR.x, 0, PHOTO_BAR.x + PHOTO_BAR.w, 0);
      g.addColorStop(0, plantColor("leafHi"));
      g.addColorStop(1, plantColor("leaf"));
      rr(ctx, PHOTO_BAR.x, PHOTO_BAR.y, Math.max(PHOTO_BAR.h, w), PHOTO_BAR.h, PHOTO_BAR.h / 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
    // 호흡 — 낮·밤 모두 35%로 계속 살아 있다(살짝 숨 쉬는 빛).
    const pulse = 0.5 + 0.5 * Math.sin(tMs / 620);
    const gr = ctx.createLinearGradient(RESP_BAR.x, 0, RESP_BAR.x + RESP_BAR.w, 0);
    gr.addColorStop(0, alpha("sugar", 0.72));
    gr.addColorStop(1, plantColor("sugar"));
    ctx.save();
    ctx.shadowColor = alpha("sugar", 0.3 + 0.35 * pulse);
    ctx.shadowBlur = 5 + 5 * pulse;
    rr(ctx, RESP_BAR.x, RESP_BAR.y, RESP_BAR.w * 0.35, RESP_BAR.h, RESP_BAR.h / 2);
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.restore();

    // 호흡 막대를 탭하라는 얇은 안내 테두리(목표 달성 전).
    if (!shell.has("always")) {
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -(tMs / 90) % 8;
      ctx.strokeStyle = alpha("sugar", 0.75);
      ctx.lineWidth = 1.4;
      rr(ctx, RESP_BAR.x - 4, RESP_BAR.y - 4, RESP_BAR.w + 8, RESP_BAR.h + 8, (RESP_BAR.h + 8) / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawMito(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, alpha("sugar", 0.9));
    g.addColorStop(0.55, plantColor("sugar"));
    g.addColorStop(1, alpha("sugar", 0.75));
    rr(ctx, -rx, -ry, rx * 2, ry * 2, ry);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = alpha("ink", 0.4);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // 안쪽 주름(크리스타)
    ctx.strokeStyle = alpha("paper", 0.85);
    ctx.lineWidth = 1.3;
    for (let i = -1; i <= 1; i++) {
      const cx = i * rx * 0.48;
      ctx.beginPath();
      ctx.moveTo(cx - ry * 0.5, -ry * 0.6);
      ctx.quadraticCurveTo(cx + ry * 0.5, 0, cx - ry * 0.5, ry * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawInset(ctx: CanvasRenderingContext2D, dayF: number, tMs: number): void {
    // 잎 ↔ 인셋을 잇는 점선(확대 창이라는 표시)
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = alpha("leafLo", 0.5);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(228, 139);   // 위쪽 잎 끝(227, 140)에서 시작
    ctx.lineTo(246, 114);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    rr(ctx, 216, 8, 134, 104, 14);
    ctx.fillStyle = alpha("paper", 0.94);
    ctx.fill();
    ctx.strokeStyle = alpha("leafLo", 0.3);
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 세포 하나(세포벽 + 안쪽 막)
    rr(ctx, 226, 18, 114, 44, 12);
    ctx.fillStyle = alpha("leafHi", 0.3);
    ctx.fill();
    ctx.strokeStyle = plantColor("leafLo");
    ctx.lineWidth = 1.6;
    ctx.stroke();
    rr(ctx, 229.5, 21.5, 107, 37, 10);
    ctx.strokeStyle = alpha("leafLo", 0.35);
    ctx.lineWidth = 1;
    ctx.stroke();

    drawChloroplast(ctx, 254, 40, 20, 11, -0.3, dayF);
    const beat = 1 + 0.06 * Math.sin(tMs / 340);
    drawMito(ctx, 310, 40, 15 * beat, 8 * beat);
    ctx.restore();

    badge(ctx, 252, 74, "엽록체", "leafLo", 1);
    badge(ctx, 283, 99, "마이토콘드리아", "ink", 1);
  }

  function drawGas(
    ctx: CanvasRenderingContext2D,
    hit: { cx: number; cy: number; r: number },
    kind: Matter, name: string, dir: Dir, flipAt: number, tMs: number,
  ): void {
    const toPlant = hit.cx < BASE_W / 2 ? 1 : -1;      // 식물(가운데) 쪽 x 방향
    const d = dir === "in" ? toPlant : -toPlant;        // 화살표가 가리키는 방향
    const tail = hit.cx - d * 40;
    const head = hit.cx + d * 40;
    const y = hit.cy + 2;

    // 뒤집기 연출 — 260ms 동안 가로로 납작해졌다 펴진다.
    const f = flipAt < 0 ? 1 : clamp((tMs - flipAt) / 260, 0, 1);
    const squeeze = 0.12 + 0.88 * Math.abs(Math.cos(f * Math.PI));

    ctx.save();
    // 탭 유도 링(한 번도 안 뒤집었을 때만)
    if (!touchedArrow) {
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -(tMs / 70) % 11;
      ctx.strokeStyle = alpha("ink", 0.22);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hit.cx, hit.cy, hit.r - 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.translate(hit.cx, y);
    ctx.scale(squeeze, 1);
    ctx.translate(-hit.cx, -y);

    const tone = kind === "carbon" ? "carbon" : "oxygen";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = alpha(tone, 0.95);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(tail, y);
    ctx.lineTo(head - d * 13, y);
    ctx.stroke();
    ctx.fillStyle = alpha(tone, 0.95);
    ctx.beginPath();
    ctx.moveTo(head, y);
    ctx.lineTo(head - d * 15, y - 10);
    ctx.lineTo(head - d * 15, y + 10);
    ctx.closePath();
    ctx.fill();

    // 알갱이가 화살표 방향으로 흐른다(방향을 눈으로 확인).
    // 크기로 등·퇴장을 만든다 — drawMatter가 내부에서 globalAlpha를 1로 덮으므로 투명도 페이드는 통하지 않는다.
    for (let i = 0; i < 2; i++) {
      let p = (tMs / 1600 + i * 0.5) % 1;
      if (p < 0) p += 1;
      const mx = tail + (head - tail) * p;
      drawMatter(ctx, mx, y, 5.5 + 5.5 * Math.sin(Math.PI * p), kind);
    }
    ctx.restore();

    badge(ctx, hit.cx, hit.cy - 26, name, "ink", 1);
    badge(ctx, hit.cx, hit.cy + 30, dir === "in" ? "흡수" : "방출", "ink", 1);
  }

  // ── 루프 ────────────────────────────────────────────────────────────
  const loop: Loop = createLoop((_dt, tMs) => {
    nowMs = tMs;
    const fit = shell.frame();
    const ctx = fit.ctx;
    ctx.clearRect(0, 0, fit.w, fit.h);
    ctx.save();
    ctx.scale(fit.sc, fit.sc);   // 이후 좌표·글자 크기는 전부 논리 단위(12px = 12*sc)
    const dayF = dayFactor(tMs);
    drawSky(ctx, dayF, fit.h / fit.sc);
    drawNightSky(ctx, dayF, tMs);
    drawSun(ctx, dayF, tMs);
    drawPlant(ctx, tMs);
    drawGas(ctx, CO2_HIT, "carbon", "이산화 탄소", co2Dir, co2FlipAt, tMs);
    drawGas(ctx, O2_HIT, "oxygen", "산소", o2Dir, o2FlipAt, tMs);
    drawBars(ctx, dayF, tMs);
    drawInset(ctx, dayF, tMs);
    if (shell.has("always")) badge(ctx, 180, 292, "밤에도 호흡은 계속돼요", "ink", 1);
    ctx.restore();
  });

  const rafId = requestAnimationFrame(() => loop.start());

  api.setCTA("낮과 밤의 기체 출입을 맞혀 보세요", { enabled: false });

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    shell.canvas.removeEventListener("pointerdown", onDown);
    shell.dispose();   // 토스트 타이머 해제
  };
};
