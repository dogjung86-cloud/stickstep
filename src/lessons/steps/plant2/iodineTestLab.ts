// iodineTestLab — '광합성 산물 확인하기' 탐구를 5단계로 직접 실행하는 캔버스 랩.
//  phase 0 암처리 : 상추 모종 두 개 중 하나에만 어둠상자를 덮고 하루를 보낸다.
//  phase 1 잎 따기 : 두 모종에서 잎을 한 장씩 딴다(암처리한 잎도 색은 그대로 초록이다).
//  phase 2 탈색   : 잎 조각이 든 에탄올 시험관을 뜨거운 물 비커에 담근다(물중탕).
//  phase 3 헹구기 : 탈색한 잎을 증류수로 헹군다.
//  phase 4 검정   : 아이오딘–아이오딘화 칼륨 용액을 두 잎에 떨어뜨린다 → 빛 받은 잎만 청람색.
//  phase 5 비교   : 두 잎을 나란히 놓고 결과를 읽는다.
// 과학 가드 — ① 아이오딘 반응이 확인하는 것은 포도당이 아니라 '녹말'이다.
//             ② 에탄올은 불이 잘 붙어 직접 가열하면 안 된다(반드시 물중탕, direct 함정 버튼).
//             ③ 탈색하는 까닭은 엽록소의 초록색이 색깔 변화를 가리기 때문이다.
//             ④ 하루 암처리는 원래 잎에 있던 녹말을 다 쓰게 만들려는 것이다.
// 규격 — 논리 좌표 BASE_W(360)×340, 그리기는 ctx.scale(sc)로 한 번에 확대하고
//        포인터는 /sc로 되돌린다. 난수 금지(모든 연출은 dt·tMs 기반), 타이머는 Set에 모은다.

import { clamp, el } from "../../../core/dom";
import { createLoop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import {
  alpha,
  badge,
  BASE_W,
  buildLab,
  drawLeaf,
  drawPot,
  drawSunbeam,
  labButton,
  plantColor,
  safeCapture,
  type PlantTone,
} from "../../../ui/plantKit2";
import {
  contactShadow,
  glassStrokeStyle,
  glassVessel,
  liquidFill,
  softGlow,
} from "../../../ui/labProps";
import type { Curio } from "../../../ui/curio";
import type { StepRenderer } from "../../types";

interface IodineStep { title: string; lead?: string; cta?: string; curio?: Curio }

type Phase = 0 | 1 | 2 | 3 | 4 | 5;
type RGB = [number, number, number];
interface Pal { hi: RGB; mid: RGB; lo: RGB; vein: string }
interface LeafPaint { hi: string; mid: string; lo: string; vein: string }

const TAU = Math.PI * 2;
const STAGE_H = 340;
const TABLE_Y = 288;

// phase 0~1 — 상추 모종 두 개(0 = 빛, 1 = 어둠상자)
const POT_X: number[] = [88, 272];
const POT_TOP = 204;
const POT_W = 74;
const POT_H = 46;
const PICK: number[][] = [[88, 134], [272, 134]];
const BOX_HOME: number[] = [180, 56];
const BOX_W = 98;
const BOX_H = 76;
const BOX_COVER: number[] = [272, 166];
const BOX_R = 40;

// phase 2 — 물중탕(비커 + 에탄올 시험관 2개)
const BEAKER = { x0: 126, y0: 150, x1: 234, y1: 286 };
const WATER_Y = 186;
const TUBE_W = 26;
const TUBE_H = 104;
const TUBE_HOME: number[][] = [[48, 172], [312, 172]];
const TUBE_DIP: number[][] = [[158, 164], [202, 164]];
const DIP_AT: number[] = [180, 196];
const DIP_R = 62;

// phase 1·3~5 — 페트리 접시와 잎
const DISH_X: number[] = [100, 260];
const DISH_CY = 268;
const DISH_RX = 50;
const LEAF_CY = 264;
const LEAF_R = 30;
const LEAF_ROT: number[] = [-0.06, 0.06];
const LABEL_X: number[] = [96, 256];
const LABEL_Y = 236;

// phase 4 — 스포이트(끌고 다니는 기준점 = 유리관 끝)
const DROPPER_HOME: number[] = [180, 120];

const STEP_LABELS = ["암처리", "잎 따기", "에탄올 물중탕", "증류수 헹굼", "아이오딘 용액"];

/** 색 문자열 → RGB(토큰이 hex가 아닐 때를 위한 폴백 포함). */
function rgbOf(color: string, fallback: RGB): RGB {
  const v = color.trim();
  if (v.startsWith("#")) {
    const body = v.slice(1);
    const full = body.length === 3 ? body.split("").map((c) => c + c).join("") : body;
    const n = parseInt(full.slice(0, 6), 16);
    if (full.length >= 6 && !Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = v.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return fallback;
}
function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const u = clamp(t, 0, 1);
  return [
    Math.round(a[0] + (b[0] - a[0]) * u),
    Math.round(a[1] + (b[1] - a[1]) * u),
    Math.round(a[2] + (b[2] - a[2]) * u),
  ];
}
function css(c: RGB, a = 1): string {
  return a >= 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
const smoothT = (t: number): number => {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
};

export const iodineTestLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as IodineStep;

  const FINAL_HELP =
    "빛을 받은 잎에서만 <b>청람색</b>이 나타났어요. 아이오딘–아이오딘화 칼륨 용액은 <b>녹말</b>과 반응해요. " +
    "광합성으로 만들어진 포도당이 <b>녹말</b>로 바뀌어 잎에 저장된 거예요.";
  const HELP: string[] = [
    "상추 모종 두 개는 지금 둘 다 초록이에요. <b>어둠상자</b>를 끌어 오른쪽 모종에 덮고 하루를 보내요.",
    "두 모종에서 <b>잎을 한 장씩</b> 탭해서 따 보세요.",
    "잎 조각이 든 <b>에탄올 시험관</b>을 끌어 뜨거운 물이 든 비커에 담가요.",
    "탈색한 잎을 <b>증류수로 헹구</b>어 에탄올을 씻어 내요.",
    "<b>스포이트</b>를 끌어 두 잎에 아이오딘–아이오딘화 칼륨 용액을 떨어뜨려 보세요.",
    FINAL_HELP,
  ];
  const WARN_HTML = "에탄올은 불이 잘 붙어요. 반드시 <b>뜨거운 물에 담가</b> 데워요";
  const WARN_TEXT = "에탄올은 불이 잘 붙어요. 반드시 뜨거운 물에 담가 데워요";

  const shell = buildLab(host, {
    title: s.title,
    lead: s.lead,
    height: STAGE_H,
    goals: [
      { id: "dark", name: "암처리", hint: "어둠상자 덮기" },
      { id: "bleach", name: "탈색", hint: "물중탕" },
      { id: "iodine", name: "아이오딘 검정", hint: "떨어뜨리기" },
    ],
    helper: HELP[0],
    read: "암처리 전",
    curio: s.curio,
    ariaLabel:
      "상추 모종 하나에 어둠상자를 덮어 하루를 보낸 뒤, 두 모종에서 딴 잎을 에탄올로 탈색하고 " +
      "아이오딘 용액을 떨어뜨려 녹말을 확인하는 실험 무대",
    onAll: () => {
      shell.helper.innerHTML = FINAL_HELP;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    },
  });

  const canvas = shell.canvas;

  // ── 절차 목록(무대 아래 첫 요소) + 조작부 ────────────────────
  const stepsEl = el("div", { class: "pgx-steps", attrs: { role: "list", "aria-label": "실험 절차" } });
  const stepEls = STEP_LABELS.map((name, i) => {
    const node = el(
      "div",
      { class: "pgx-step", dataset: { step: String(i) }, attrs: { role: "listitem" } },
      el("span", { text: name }),
    );
    stepsEl.appendChild(node);
    return node;
  });
  host.insertBefore(stepsEl, shell.controls);

  shell.controls.classList.add("two");
  const directBtn = labButton("알코올램프로 직접 가열", () => onDirect(), { sub: "눌러 보면 알아요" });
  directBtn.dataset.act = "direct";
  const rinseBtn = labButton("증류수로 헹구기", () => onRinse(), { tone: "primary", sub: "에탄올 씻어 내기" });
  rinseBtn.dataset.act = "rinse";
  shell.controls.append(directBtn, rinseBtn);

  // 무대 위쪽·가운데가 관찰 대상이라 팝업은 아래로 내린다(base.css .toast.low).
  const toastEl = shell.stage.querySelector(".toast") as HTMLElement | null;
  if (toastEl) toastEl.classList.add("low");
  const toastHtml = (plain: string, html: string): void => {
    shell.toast(plain);
    if (toastEl) toastEl.innerHTML = html;
  };

  // ── 상태 ─────────────────────────────────────────────────────
  let phase: Phase = 0;
  let sc = (canvas.getBoundingClientRect().width || BASE_W) / BASE_W;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const box = { x: BOX_HOME[0], y: BOX_HOME[1], tx: BOX_HOME[0], ty: BOX_HOME[1] };
  const tubes = [0, 1].map((i) => ({
    x: TUBE_HOME[i][0], y: TUBE_HOME[i][1], tx: TUBE_HOME[i][0], ty: TUBE_HOME[i][1],
    dipped: false, dec: 0,
  }));
  const dropper = { x: DROPPER_HOME[0], y: DROPPER_HOME[1], tx: DROPPER_HOME[0], ty: DROPPER_HOME[1] };

  let dayRunning = false;
  let dayT = 0;
  const picked = [false, false];
  const flyT = [0, 0];
  let rinsing = false;
  let rinseT = 0;
  let dropFly: { which: number; t: number } | null = null;
  const stain = [0, 0];
  let warnT = 0;
  let bleachDone = false;
  let iodineDone = false;
  let drag: { kind: "box" | "tube" | "dropper"; idx: number; dx: number; dy: number } | null = null;

  // ── 색(잎 상태) ──────────────────────────────────────────────
  const PAL_GREEN: Pal = {
    hi: rgbOf(plantColor("leafHi"), [127, 214, 109]),
    mid: rgbOf(plantColor("leaf"), [57, 168, 90]),
    lo: rgbOf(plantColor("leafLo"), [23, 100, 58]),
    vein: alpha("vein", 0.8),
  };
  const PAL_PALE: Pal = { hi: [246, 243, 232], mid: [227, 221, 201], lo: [188, 180, 156], vein: "rgba(150,142,116,.5)" };
  const PAL_BLUE: Pal = { hi: [92, 110, 205], mid: [43, 58, 143], lo: [21, 29, 84], vein: "rgba(226,232,255,.32)" };
  const PAL_BROWN: Pal = { hi: [224, 196, 156], mid: [195, 154, 99], lo: [148, 110, 66], vein: "rgba(122,92,52,.45)" };
  const paintOf = (a: Pal, b: Pal, t: number): LeafPaint => ({
    hi: css(mixRgb(a.hi, b.hi, t)),
    mid: css(mixRgb(a.mid, b.mid, t)),
    lo: css(mixRgb(a.lo, b.lo, t)),
    vein: t < 0.5 ? a.vein : b.vein,
  });
  const GREEN_PAINT = paintOf(PAL_GREEN, PAL_GREEN, 0);

  // ── 단계 전환 ────────────────────────────────────────────────
  const syncSteps = (): void => {
    stepEls.forEach((n, i) => {
      n.classList.toggle("now", i === phase);
      n.classList.toggle("done", i < phase);
    });
  };
  const syncControls = (): void => {
    directBtn.disabled = phase !== 2;
    rinseBtn.disabled = phase !== 3 || rinsing;
    canvas.classList.toggle("grab", phase === 0 || phase === 2 || phase === 4);
  };
  const setPhase = (p: Phase): void => {
    phase = p;
    shell.helper.innerHTML = HELP[p];
    if (p === 1) shell.setRead("잎 0/2");
    else if (p === 2) shell.setRead("탈색 0/2");
    else if (p === 3) shell.setRead("헹구기 전");
    else if (p === 4) shell.setRead("검정 0/2");
    else if (p === 5) shell.setRead("청람색 확인");
    syncSteps();
    syncControls();
  };

  const coverBox = (): void => {
    box.tx = BOX_COVER[0];
    box.ty = BOX_COVER[1];
    dayRunning = true;
    haptic(HAPTIC.select);
    shell.collect("dark", "원래 있던 녹말을 다 쓰게 만들어요");
    shell.setRead("하루 경과 중");
    later(() => {
      dayRunning = false;
      dayT = 0;
      box.tx = BOX_HOME[0];
      box.ty = BOX_HOME[1];
      setPhase(1);
    }, 1250);
  };
  const pickLeaf = (i: number): void => {
    picked[i] = true;
    haptic(HAPTIC.tap);
    const n = picked.filter(Boolean).length;
    shell.setRead(`잎 ${n}/2`);
    if (n === 2) later(() => setPhase(2), 760);
  };
  const dipTube = (i: number): void => {
    tubes[i].dipped = true;
    tubes[i].tx = TUBE_DIP[i][0];
    tubes[i].ty = TUBE_DIP[i][1];
    haptic(HAPTIC.select);
    shell.setRead(`탈색 ${tubes.filter((t) => t.dipped).length}/2`);
  };
  function onDirect(): void {
    if (phase !== 2) return;
    warnT = 1;
    haptic(HAPTIC.wrong);
    toastHtml(WARN_TEXT, WARN_HTML);
    shell.helper.innerHTML = `${WARN_HTML}. 에탄올 시험관을 <b>비커의 뜨거운 물</b>에 담가 보세요.`;
  }
  function onRinse(): void {
    if (phase !== 3 || rinsing) return;
    rinsing = true;
    haptic(HAPTIC.tap);
    shell.setRead("헹구는 중");
    syncControls();
    later(() => setPhase(4), 1250);
  }

  // ── 포인터 ───────────────────────────────────────────────────
  const dist = (ax: number, ay: number, bx: number, by: number): number => Math.hypot(ax - bx, ay - by);
  const toLocal = (e: PointerEvent): number[] => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / sc, (e.clientY - r.top) / sc];
  };

  const onDown = (e: PointerEvent): void => {
    const [px, py] = toLocal(e);
    if (phase === 0 && !dayRunning) {
      const inBox = Math.abs(px - box.x) <= BOX_W / 2 + 4 && Math.abs(py - box.y) <= BOX_H / 2 + 4;
      if (inBox || dist(px, py, box.x, box.y) <= 30) {
        drag = { kind: "box", idx: 0, dx: box.x - px, dy: box.y - py };
        safeCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
      }
      return;
    }
    if (phase === 1) {
      for (let i = 0; i < 2; i++) {
        if (!picked[i] && dist(px, py, PICK[i][0], PICK[i][1]) <= LEAF_R) {
          pickLeaf(i);
          return;
        }
      }
      return;
    }
    if (phase === 2) {
      for (let i = 0; i < 2; i++) {
        const t = tubes[i];
        if (!t.dipped && dist(px, py, t.x, t.y) <= 30) {
          drag = { kind: "tube", idx: i, dx: t.x - px, dy: t.y - py };
          safeCapture(canvas, e.pointerId);
          haptic(HAPTIC.tap);
          return;
        }
      }
      return;
    }
    if (phase === 4 && !dropFly) {
      const onTip = dist(px, py, dropper.x, dropper.y) <= 30;
      const onBody = dist(px, py, dropper.x, dropper.y - 34) <= 30;
      if (onTip || onBody) {
        drag = { kind: "dropper", idx: 0, dx: dropper.x - px, dy: dropper.y - py };
        safeCapture(canvas, e.pointerId);
        haptic(HAPTIC.tap);
      }
    }
  };

  const onMove = (e: PointerEvent): void => {
    if (!drag) return;
    const [px, py] = toLocal(e);
    const nx = clamp(px + drag.dx, 24, BASE_W - 24);
    const ny = clamp(py + drag.dy, 24, STAGE_H - 20);
    if (drag.kind === "box") {
      box.x = nx; box.y = ny; box.tx = nx; box.ty = ny;
    } else if (drag.kind === "tube") {
      const t = tubes[drag.idx];
      t.x = nx; t.y = ny; t.tx = nx; t.ty = ny;
    } else {
      dropper.x = nx; dropper.y = ny; dropper.tx = nx; dropper.ty = ny;
    }
  };

  const onUp = (): void => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.kind === "box") {
      if (dist(box.x, box.y, BOX_COVER[0], BOX_COVER[1]) <= BOX_R) coverBox();
      else {
        box.tx = BOX_HOME[0];
        box.ty = BOX_HOME[1];
        shell.toast("오른쪽 모종을 덮어 하루 동안 어둠 속에 두세요");
      }
      return;
    }
    if (d.kind === "tube") {
      const t = tubes[d.idx];
      if (dist(t.x, t.y, DIP_AT[0], DIP_AT[1]) <= DIP_R) dipTube(d.idx);
      else {
        t.tx = TUBE_HOME[d.idx][0];
        t.ty = TUBE_HOME[d.idx][1];
        shell.toast("비커의 뜨거운 물 속에 시험관을 담가요");
      }
      return;
    }
    for (let i = 0; i < 2; i++) {
      if (stain[i] > 0) continue;
      if (dist(dropper.x, dropper.y, DISH_X[i], LEAF_CY) <= LEAF_R) {
        dropper.tx = DISH_X[i];
        dropper.ty = LEAF_CY - 34;
        dropFly = { which: i, t: 0 };
        haptic(HAPTIC.tap);
        later(() => {
          dropper.tx = DROPPER_HOME[0];
          dropper.ty = DROPPER_HOME[1];
        }, 820);
        return;
      }
    }
    dropper.tx = DROPPER_HOME[0];
    dropper.ty = DROPPER_HOME[1];
    shell.toast("잎 위에 스포이트를 대고 놓아 보세요");
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ── 소품 그리기(논리 좌표) ───────────────────────────────────
  const paintLeaf = (
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, len: number, wid: number, rot: number, p: LeafPaint,
  ): void => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(-len / 2, -wid / 2, len / 2, wid / 2);
    g.addColorStop(0, p.hi);
    g.addColorStop(0.55, p.mid);
    g.addColorStop(1, p.lo);
    ctx.fillStyle = g;
    ctx.strokeStyle = p.lo;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.bezierCurveTo(-len * 0.2, -wid / 2, len * 0.2, -wid / 2, len / 2, 0);
    ctx.bezierCurveTo(len * 0.2, wid / 2, -len * 0.2, wid / 2, -len / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = p.vein;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-len * 0.42, 0);
    ctx.lineTo(len * 0.44, 0);
    ctx.stroke();
    ctx.lineWidth = 0.9;
    for (let i = -2; i <= 2; i++) {
      const bx = len * i * 0.15;
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx + len * 0.1, -wid * 0.3);
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx + len * 0.1, wid * 0.3);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawTable = (ctx: CanvasRenderingContext2D): void => {
    const line = ctx.createLinearGradient(16, 0, BASE_W - 16, 0);
    line.addColorStop(0, "rgba(184,208,242,0)");
    line.addColorStop(0.5, "rgba(184,208,242,.24)");
    line.addColorStop(1, "rgba(184,208,242,0)");
    ctx.fillStyle = line;
    ctx.fillRect(16, TABLE_Y, BASE_W - 32, 1.6);
    const under = ctx.createLinearGradient(0, TABLE_Y, 0, TABLE_Y + 30);
    under.addColorStop(0, "rgba(9,18,34,.45)");
    under.addColorStop(1, "rgba(9,18,34,0)");
    ctx.fillStyle = under;
    ctx.fillRect(0, TABLE_Y, BASE_W, 30);
  };

  const drawGuide = (
    ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, tMs: number,
  ): void => {
    ctx.save();
    ctx.strokeStyle = alpha("sun", 0.38 + 0.18 * Math.sin(tMs / 320));
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = -((tMs / 34) % 14);
    const mx = (x0 + x1) / 2;
    const my = Math.min(y0, y1) - 24;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx, my, x1, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    const ang = Math.atan2(y1 - my, x1 - mx);
    ctx.beginPath();
    ctx.moveTo(x1 - Math.cos(ang - 0.42) * 11, y1 - Math.sin(ang - 0.42) * 11);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(ang + 0.42) * 11, y1 - Math.sin(ang + 0.42) * 11);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x1, y1, 12 + 3 * Math.sin(tMs / 300), 0, TAU);
    ctx.stroke();
    ctx.restore();
  };

  const drawPlant = (ctx: CanvasRenderingContext2D, i: number, tMs: number): void => {
    const cx = POT_X[i];
    const sway = Math.sin(tMs / 1150 + i * 1.7) * 1.6;
    contactShadow(ctx, cx, POT_TOP + POT_H, POT_W * 0.62, 0.36);
    drawPot(ctx, cx, POT_TOP, POT_W, POT_H);
    const stem = ctx.createLinearGradient(cx - 5, 0, cx + 5, 0);
    stem.addColorStop(0, plantColor("stemHi"));
    stem.addColorStop(0.5, plantColor("stem"));
    stem.addColorStop(1, plantColor("stemLo"));
    ctx.save();
    ctx.strokeStyle = stem;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, POT_TOP + 8);
    ctx.quadraticCurveTo(cx + sway, 176, cx + sway, 144);
    ctx.stroke();
    ctx.restore();
    drawLeaf(ctx, cx - 25 + sway * 0.4, 190, 46, 22, Math.PI + 0.32);
    drawLeaf(ctx, cx + 25 + sway * 0.4, 181, 46, 22, -0.3);
    drawLeaf(ctx, cx - 21 + sway * 0.7, 160, 38, 18, Math.PI + 0.5);
    drawLeaf(ctx, cx + 21 + sway * 0.7, 154, 38, 18, -0.46);
    if (!picked[i]) {
      paintLeaf(ctx, PICK[i][0] + sway, PICK[i][1], 48, 23, -0.1, GREEN_PAINT);
      if (phase === 1) {
        ctx.save();
        ctx.strokeStyle = alpha("sun", 0.5 + 0.28 * Math.sin(tMs / 300));
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -((tMs / 40) % 12);
        ctx.beginPath();
        ctx.arc(PICK[i][0] + sway, PICK[i][1], 24, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const drawFlyingLeaf = (ctx: CanvasRenderingContext2D, i: number): void => {
    const e = 1 - Math.pow(1 - flyT[i], 3);
    const x = PICK[i][0] + (DISH_X[i] - PICK[i][0]) * e;
    const y = PICK[i][1] + (LEAF_CY - PICK[i][1]) * e - Math.sin(Math.PI * e) * 16;
    paintLeaf(ctx, x, y, 48 + 14 * e, 23 + 3 * e, -0.1 + (LEAF_ROT[i] + 0.1) * e, GREEN_PAINT);
  };

  const drawBox = (ctx: CanvasRenderingContext2D): void => {
    const cx = box.x;
    const cy = box.y;
    const wTop = BOX_W * 0.78;
    const top = cy - BOX_H / 2;
    const bot = cy + BOX_H / 2;
    contactShadow(ctx, cx, bot + 2, BOX_W * 0.55, 0.4);
    const body = ctx.createLinearGradient(cx - BOX_W / 2, top, cx + BOX_W / 2, bot);
    body.addColorStop(0, "#3B4557");
    body.addColorStop(0.52, "#1B2231");
    body.addColorStop(1, "#0A0E17");
    ctx.beginPath();
    ctx.moveTo(cx - wTop / 2, top);
    ctx.lineTo(cx + wTop / 2, top);
    ctx.lineTo(cx + BOX_W / 2, bot);
    ctx.lineTo(cx - BOX_W / 2, bot);
    ctx.closePath();
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = "#05080F";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    const lid = ctx.createLinearGradient(cx - wTop / 2, top - 7, cx + wTop / 2, top + 7);
    lid.addColorStop(0, "#4E586E");
    lid.addColorStop(0.58, "#2A3243");
    lid.addColorStop(1, "#151B27");
    ctx.beginPath();
    ctx.ellipse(cx, top, wTop / 2, 7, 0, 0, TAU);
    ctx.fillStyle = lid;
    ctx.fill();
    ctx.strokeStyle = "#05080F";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.save();
    ctx.strokeStyle = "rgba(214,232,255,.14)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - wTop * 0.3, top + 14);
    ctx.lineTo(cx - BOX_W * 0.32, bot - 14);
    ctx.stroke();
    ctx.strokeStyle = "rgba(176,198,232,.4)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, top - 1, 11, Math.PI * 1.16, Math.PI * 1.84);
    ctx.stroke();
    ctx.restore();
  };

  const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.14, x, y, r);
    g.addColorStop(0, "#FFF6D2");
    g.addColorStop(0.55, plantColor("sun"));
    g.addColorStop(1, "#E28C22");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = alpha("sun", 0.85);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3));
      ctx.lineTo(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8));
      ctx.stroke();
    }
  };

  const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
    const g = ctx.createRadialGradient(x - r * 0.32, y - r * 0.36, r * 0.12, x, y, r);
    g.addColorStop(0, "#FDFBF1");
    g.addColorStop(0.6, "#E6E1CE");
    g.addColorStop(1, "#B9B4A1");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(120,124,140,.7)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "rgba(150,150,140,.35)";
    const craters: number[][] = [[-0.32, -0.18, 0.26], [0.28, 0.1, 0.2], [-0.06, 0.36, 0.15]];
    for (const [ox, oy, cr] of craters) {
      ctx.beginPath();
      ctx.arc(x + ox * r, y + oy * r, cr * r, 0, TAU);
      ctx.fill();
    }
  };

  const drawDayVeil = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    const night = Math.sin(Math.PI * clamp(dayT, 0, 1));
    ctx.fillStyle = alpha("night", 0.62 * night);
    ctx.fillRect(0, 0, BASE_W, STAGE_H + 40);
    // 별(밤에만) — 고정 좌표라 난수 없음
    const stars: number[][] = [[40, 46], [96, 32], [150, 58], [214, 36], [268, 60], [316, 40], [58, 88], [330, 92]];
    ctx.fillStyle = `rgba(236,244,255,${0.75 * night})`;
    for (const [sx0, sy0] of stars) {
      const tw = 0.6 + 0.4 * Math.sin(tMs / 420 + sx0);
      ctx.beginPath();
      ctx.arc(sx0, sy0, 1.5 * tw, 0, TAU);
      ctx.fill();
    }
    const x = 62 + 236 * clamp(dayT, 0, 1);
    ctx.save();
    ctx.strokeStyle = "rgba(214,232,255,.22)";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(62, 118);
    ctx.lineTo(298, 118);
    ctx.stroke();
    ctx.restore();
    if (dayT < 0.34 || dayT > 0.72) drawSun(ctx, x, 118, 13);
    else drawMoon(ctx, x, 118, 13);
  };

  const drawDish = (ctx: CanvasRenderingContext2D, i: number): void => {
    const cx = DISH_X[i];
    contactShadow(ctx, cx, DISH_CY + 16, DISH_RX * 0.94, 0.36);
    ctx.save();
    // 접시 바닥
    ctx.beginPath();
    ctx.ellipse(cx, DISH_CY + 5, DISH_RX, 13, 0, 0, TAU);
    ctx.fillStyle = "rgba(190,220,255,.07)";
    ctx.fill();
    ctx.strokeStyle = glassStrokeStyle(ctx, DISH_CY - 10, DISH_CY + 20);
    ctx.lineWidth = 2.2;
    ctx.stroke();
    // 접시 림
    ctx.beginPath();
    ctx.ellipse(cx, DISH_CY - 4, DISH_RX, 13, 0, 0, TAU);
    ctx.fillStyle = "rgba(176,212,255,.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(226,240,255,.72)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // 좌상단 키라이트
    ctx.beginPath();
    ctx.ellipse(cx, DISH_CY - 4, DISH_RX - 6, 10, 0, Math.PI * 1.04, Math.PI * 1.56);
    ctx.strokeStyle = "rgba(255,255,255,.42)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const dishLeafPaint = (i: number): LeafPaint => {
    if (phase <= 3) return paintOf(PAL_PALE, PAL_PALE, 0);
    return i === 0 ? paintOf(PAL_PALE, PAL_BLUE, stain[0]) : paintOf(PAL_PALE, PAL_BROWN, stain[1]);
  };

  const drawDishLeaf = (ctx: CanvasRenderingContext2D, i: number): void => {
    paintLeaf(ctx, DISH_X[i], LEAF_CY, 62, 26, LEAF_ROT[i], dishLeafPaint(i));
    if (phase === 3 && rinsing) {
      ctx.save();
      ctx.globalAlpha = 0.5 * Math.sin(Math.PI * clamp(rinseT, 0, 1));
      ctx.fillStyle = "rgba(226,244,255,.7)";
      ctx.beginPath();
      ctx.ellipse(DISH_X[i] - 8, LEAF_CY - 4, 16, 6, -0.3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawTube = (ctx: CanvasRenderingContext2D, i: number): void => {
    const t = tubes[i];
    const hw = TUBE_W / 2;
    const top = t.y - TUBE_H / 2;
    const bot = t.y + TUBE_H / 2;
    const path = (): void => {
      ctx.beginPath();
      ctx.moveTo(t.x - hw, top);
      ctx.lineTo(t.x - hw, bot - hw);
      ctx.quadraticCurveTo(t.x - hw, bot, t.x, bot);
      ctx.quadraticCurveTo(t.x + hw, bot, t.x + hw, bot - hw);
      ctx.lineTo(t.x + hw, top);
    };
    if (!t.dipped) contactShadow(ctx, t.x, bot + 4, 22, 0.3);
    ctx.save();
    path();
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = "rgba(190,220,255,.06)";
    ctx.fillRect(t.x - hw, top, TUBE_W, TUBE_H);
    // 에탄올 — 탈색될수록 엽록소가 녹아 나와 초록으로 물든다
    const liqTop = top + 30;
    const col = mixRgb([200, 224, 255], [64, 158, 88], t.dec);
    const lg = ctx.createLinearGradient(0, liqTop, 0, bot);
    lg.addColorStop(0, css(col, 0.2 + 0.44 * t.dec));
    lg.addColorStop(1, css(col, 0.12 + 0.3 * t.dec));
    ctx.fillStyle = lg;
    ctx.fillRect(t.x - hw, liqTop, TUBE_W, bot - liqTop);
    ctx.strokeStyle = "rgba(226,242,255,.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(t.x - hw, liqTop);
    ctx.lineTo(t.x + hw, liqTop);
    ctx.stroke();
    paintLeaf(ctx, t.x, t.y + 20, 28, 14, 1.25, paintOf(PAL_GREEN, PAL_PALE, t.dec));
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = glassStrokeStyle(ctx, top, bot);
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    path();
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.3)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(t.x - hw + 5, top + 14);
    ctx.lineTo(t.x - hw + 5, bot - 24);
    ctx.stroke();
    ctx.strokeStyle = "rgba(226,240,255,.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(t.x - hw - 3, top);
    ctx.lineTo(t.x - hw + 6, top);
    ctx.moveTo(t.x + hw - 6, top);
    ctx.lineTo(t.x + hw + 3, top);
    ctx.stroke();
    ctx.restore();
  };

  const drawBeakerBack = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    contactShadow(ctx, (BEAKER.x0 + BEAKER.x1) / 2, BEAKER.y1 + 3, 64, 0.4);
    softGlow(ctx, (BEAKER.x0 + BEAKER.x1) / 2, BEAKER.y1 - 12, 80, "255,152,86", 0.2);
    liquidFill(ctx, BEAKER.x0 + 2, WATER_Y, BEAKER.x1 - 2, BEAKER.y1 - 2, "126,186,236", 0.34);
    ctx.save();
    ctx.fillStyle = "rgba(236,246,255,.85)";
    for (let i = 0; i < 8; i++) {
      const bx = BEAKER.x0 + 16 + ((i * 41) % 78);
      const p = ((tMs / 1500) + i * 0.127) % 1;
      const by = BEAKER.y1 - 10 - p * (BEAKER.y1 - WATER_Y - 16);
      ctx.globalAlpha = 0.4 * (1 - p);
      ctx.beginPath();
      ctx.arc(bx, by, 1.5 + (i % 3) * 0.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawBeakerFront = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    ctx.fillStyle = "rgba(126,186,236,.13)";
    ctx.fillRect(BEAKER.x0 + 2, WATER_Y, BEAKER.x1 - BEAKER.x0 - 4, BEAKER.y1 - 2 - WATER_Y);
    glassVessel(ctx, BEAKER);
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const p = ((tMs / 2300) + i * 0.33) % 1;
      const y = BEAKER.y0 - 4 - p * 44;
      const bx = 152 + i * 28;
      ctx.strokeStyle = `rgba(226,240,255,${0.3 * Math.sin(Math.PI * p)})`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(bx, y + 15);
      ctx.quadraticCurveTo(bx + 8 * Math.sin(p * 6 + i), y + 7, bx, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawWarn = (ctx: CanvasRenderingContext2D): void => {
    const x = 96;
    const y = 62;
    ctx.save();
    ctx.globalAlpha = clamp(warnT * 1.5, 0, 1);
    const g = ctx.createLinearGradient(x, y + 16, x, y - 16);
    g.addColorStop(0, "#FFD880");
    g.addColorStop(0.5, "#F98A2E");
    g.addColorStop(1, "#D9452B");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.bezierCurveTo(x + 11, y - 2, x + 9, y + 14, x, y + 15);
    ctx.bezierCurveTo(x - 9, y + 14, x - 11, y - 2, x, y - 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#F04452";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 15.5, y + 15.5);
    ctx.lineTo(x + 15.5, y - 15.5);
    ctx.stroke();
    ctx.restore();
  };

  const drawWashBottle = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    const bx = DISH_X[0] + (DISH_X[1] - DISH_X[0]) * smoothT(rinseT);
    const by = 194;
    const w = 32;
    const h = 46;
    ctx.save();
    const body = ctx.createLinearGradient(bx - w / 2, by - h / 2, bx + w / 2, by + h / 2);
    body.addColorStop(0, "rgba(238,247,255,.95)");
    body.addColorStop(0.5, "rgba(196,216,240,.85)");
    body.addColorStop(1, "rgba(136,162,196,.8)");
    rrect(ctx, bx - w / 2, by - h / 2, w, h, 8);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = "rgba(92,118,152,.9)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 마개 + 굽은 노즐
    rrect(ctx, bx - 8, by - h / 2 - 9, 16, 10, 3);
    ctx.fillStyle = "rgba(120,146,182,.95)";
    ctx.fill();
    ctx.strokeStyle = "rgba(70,94,126,.95)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(160,186,220,.95)";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx + 2, by - h / 2 - 6);
    ctx.quadraticCurveTo(bx + 16, by - h / 2 - 6, bx + 16, by + 6);
    ctx.stroke();
    // 좌상단 키라이트
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(bx - w / 2 + 6, by - h / 2 + 8);
    ctx.lineTo(bx - w / 2 + 6, by + h / 2 - 10);
    ctx.stroke();
    if (rinsing && rinseT > 0.03 && rinseT < 0.99) {
      const sx0 = bx + 16;
      const sg = ctx.createLinearGradient(0, by + 8, 0, LEAF_CY - 6);
      sg.addColorStop(0, "rgba(180,222,255,.85)");
      sg.addColorStop(1, "rgba(180,222,255,.12)");
      ctx.strokeStyle = sg;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(sx0, by + 8);
      ctx.lineTo(sx0, LEAF_CY - 6);
      ctx.stroke();
      ctx.fillStyle = "rgba(214,240,255,.9)";
      for (let i = 0; i < 3; i++) {
        const p = ((tMs / 460) + i * 0.33) % 1;
        const dy = by + 10 + p * (LEAF_CY - by - 16);
        ctx.beginPath();
        ctx.arc(sx0, dy, 2, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const drawDroplet = (ctx: CanvasRenderingContext2D): void => {
    if (!dropFly) return;
    const x = DISH_X[dropFly.which];
    const p = clamp(dropFly.t, 0, 1);
    const y = (LEAF_CY - 30) + 28 * p * p;
    const g = ctx.createRadialGradient(x - 1.6, y - 2, 0.6, x, y, 6);
    g.addColorStop(0, "rgba(255,235,196,.95)");
    g.addColorStop(0.5, "#B87A3C");
    g.addColorStop(1, "#6D411C");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y - 6.4);
    ctx.bezierCurveTo(x + 4.6, y - 1, x + 3.6, y + 4.8, x, y + 4.8);
    ctx.bezierCurveTo(x - 3.6, y + 4.8, x - 4.6, y - 1, x, y - 6.4);
    ctx.closePath();
    ctx.fill();
  };

  const drawDropper = (ctx: CanvasRenderingContext2D): void => {
    const x = dropper.x;
    const tip = dropper.y;
    const bodyBot = tip - 9;
    const bodyTop = tip - 48;
    const w = 11;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - w / 2, bodyTop);
    ctx.lineTo(x - w / 2, bodyBot);
    ctx.lineTo(x - 1.8, tip);
    ctx.lineTo(x + 1.8, tip);
    ctx.lineTo(x + w / 2, bodyBot);
    ctx.lineTo(x + w / 2, bodyTop);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    const liq = ctx.createLinearGradient(0, bodyTop + 9, 0, tip);
    liq.addColorStop(0, "rgba(186,124,60,.88)");
    liq.addColorStop(1, "rgba(108,64,26,.96)");
    ctx.fillStyle = liq;
    ctx.fillRect(x - w, bodyTop + 9, w * 2, tip - bodyTop);
    ctx.restore();
    ctx.strokeStyle = glassStrokeStyle(ctx, bodyTop, tip);
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.stroke();
    const by = bodyTop - 12;
    const bulb = ctx.createLinearGradient(x - 9, by - 13, x + 9, by + 13);
    bulb.addColorStop(0, "#F4BCC1");
    bulb.addColorStop(0.5, "#C8636C");
    bulb.addColorStop(1, "#7C2E37");
    ctx.fillStyle = bulb;
    ctx.beginPath();
    ctx.ellipse(x, by, 9, 13, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#5C1F27";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.ellipse(x - 3.2, by - 5, 2.6, 4, -0.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  // ── 무대 조립 ────────────────────────────────────────────────
  const drawStage = (ctx: CanvasRenderingContext2D, tMs: number): void => {
    drawTable(ctx);
    if (phase <= 1) {
      drawSunbeam(ctx, 26, BASE_W - 26, 6, 150, 0.5, tMs);
      if (phase === 1) {
        drawDish(ctx, 0);
        drawDish(ctx, 1);
      }
      drawPlant(ctx, 0, tMs);
      drawPlant(ctx, 1, tMs);
      if (phase === 1) {
        for (let i = 0; i < 2; i++) if (picked[i]) drawFlyingLeaf(ctx, i);
      }
      drawBox(ctx);
      if (phase === 0 && !drag && !dayRunning) {
        drawGuide(ctx, box.x, box.y + BOX_H / 2, BOX_COVER[0], BOX_COVER[1], tMs);
      }
      if (dayRunning) drawDayVeil(ctx, tMs);
      return;
    }
    if (phase === 2) {
      drawBeakerBack(ctx, tMs);
      drawTube(ctx, 0);
      drawTube(ctx, 1);
      drawBeakerFront(ctx, tMs);
      for (let i = 0; i < 2; i++) {
        if (!tubes[i].dipped && !drag) drawGuide(ctx, tubes[i].x, tubes[i].y, DIP_AT[0], DIP_AT[1] - 30, tMs);
      }
      if (warnT > 0) drawWarn(ctx);
      return;
    }
    drawDish(ctx, 0);
    drawDish(ctx, 1);
    drawDishLeaf(ctx, 0);
    drawDishLeaf(ctx, 1);
    if (phase === 3) drawWashBottle(ctx, tMs);
    if (phase === 4) {
      if (dropFly) drawDroplet(ctx);
      drawDropper(ctx);
      if (!drag && !dropFly) {
        const next = stain[0] <= 0 ? 0 : stain[1] <= 0 ? 1 : -1;
        if (next >= 0) drawGuide(ctx, dropper.x, dropper.y, DISH_X[next], LEAF_CY - 18, tMs);
      }
    }
  };

  // ── 라벨(화면 좌표 — badge가 sc를 직접 받는다) ───────────────
  const drawLabels = (ctx: CanvasRenderingContext2D): void => {
    const B = (x: number, y: number, text: string, tone: PlantTone): void => {
      badge(ctx, x * sc, y * sc, text, tone, sc);
    };
    if (phase <= 1) {
      B(88, 106, "빛을 받은 모종", "leaf");
      B(272, 106, "어둠상자를 씌운 모종", "night");
      if (dayRunning) {
        const x = 62 + 236 * clamp(dayT, 0, 1);
        B(x, 148, dayT < 0.34 ? "낮" : dayT > 0.72 ? "다음 날 낮" : "밤", dayT >= 0.34 && dayT <= 0.72 ? "night" : "sun");
      }
      return;
    }
    if (phase === 2) {
      B(180, 244, "뜨거운 물", "water");
      ctx.save();
      ctx.font = `800 ${12.5 * sc}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3 * sc;
      ctx.strokeStyle = "rgba(8,18,34,.75)";
      ctx.strokeText("80~100℃", 180 * sc, 266 * sc);
      ctx.fillStyle = "#EAF3FF";
      ctx.fillText("80~100℃", 180 * sc, 266 * sc);
      ctx.restore();
      for (let i = 0; i < 2; i++) {
        // 끌고 있는 시험관의 이름표는 숨긴다(비커 라벨과 겹치는 순간 방지).
        const held = drag !== null && drag.kind === "tube" && drag.idx === i;
        if (!tubes[i].dipped && !held) B(tubes[i].x, tubes[i].y + 66, "에탄올", "glucose");
      }
      if (warnT > 0) B(96, 100, "직접 가열 금지", "phloem");
      return;
    }
    if (phase === 3) {
      B(DISH_X[0] + (DISH_X[1] - DISH_X[0]) * smoothT(rinseT), 140, "증류수", "water");
    }
    if (phase === 4) B(180, 28, "아이오딘 용액", "starch");
    if (phase === 5) {
      B(LABEL_X[0], LABEL_Y, "빛 받은 잎 · 청람색", "night");
      B(LABEL_X[1], LABEL_Y, "빛 못 받은 잎 · 변화 없음", "soil");
    } else if (!(phase === 3 && rinsing)) {
      // 헹구는 동안은 물줄기가 잎까지 닿는 길이라 이름표를 잠시 비운다.
      B(LABEL_X[0], LABEL_Y, "빛 받은 잎", "leaf");
      B(LABEL_X[1], LABEL_Y, "빛 못 받은 잎", "night");
    }
  };

  // ── 루프 ─────────────────────────────────────────────────────
  const loop = createLoop((dt, tMs) => {
    const f = shell.frame();
    sc = f.sc;
    const ctx = f.ctx;
    const dtMs = Math.min(60, dt * 16.7);
    const ease = (cur: number, target: number): number => cur + (target - cur) * Math.min(1, dtMs / 90);

    box.x = ease(box.x, box.tx);
    box.y = ease(box.y, box.ty);
    for (const t of tubes) {
      t.x = ease(t.x, t.tx);
      t.y = ease(t.y, t.ty);
      if (t.dipped) t.dec = clamp(t.dec + dtMs / 1400, 0, 1);
    }
    dropper.x = ease(dropper.x, dropper.tx);
    dropper.y = ease(dropper.y, dropper.ty);
    if (dayRunning) dayT = clamp(dayT + dtMs / 1200, 0, 1);
    for (let i = 0; i < 2; i++) if (picked[i]) flyT[i] = clamp(flyT[i] + dtMs / 560, 0, 1);
    if (rinsing) rinseT = clamp(rinseT + dtMs / 1150, 0, 1);
    if (dropFly) {
      dropFly.t += dtMs / 380;
      if (dropFly.t >= 1) {
        stain[dropFly.which] = 0.001;
        dropFly = null;
        // 상태 필도 함께 올린다(떨어뜨린 방울 수 — 0/2에 멈춰 있던 실사고).
        if (phase === 4) shell.setRead(`검정 ${stain.filter((v) => v > 0).length}/2`);
      }
    }
    for (let i = 0; i < 2; i++) if (stain[i] > 0) stain[i] = clamp(stain[i] + dtMs / 620, 0, 1);
    if (warnT > 0) warnT = Math.max(0, warnT - dtMs / 2400);

    if (phase === 2 && !bleachDone && tubes[0].dec >= 1 && tubes[1].dec >= 1) {
      bleachDone = true;
      shell.collect("bleach", "엽록소를 빼내야 색깔 변화가 보여요");
      shell.setRead("탈색 완료");
      later(() => setPhase(3), 800);
    }
    if (phase === 4 && !iodineDone && stain[0] >= 1 && stain[1] >= 1) {
      iodineDone = true;
      shell.collect("iodine", "빛을 받은 잎만 청람색으로 변했어요");
      later(() => setPhase(5), 600);
    }

    ctx.clearRect(0, 0, f.w, f.h);
    ctx.save();
    ctx.scale(sc, sc);
    drawStage(ctx, tMs);
    ctx.restore();
    drawLabels(ctx);
  });

  syncSteps();
  syncControls();
  api.setCTA("어둠상자부터 덮어 보세요", { enabled: false });
  const rafId = requestAnimationFrame(() => loop.start());

  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
    shell.dispose();
  };
};
