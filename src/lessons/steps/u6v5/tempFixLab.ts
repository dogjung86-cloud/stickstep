// u6TempFixLab (u6l5): 「온도에 따른 부피 변화로 생활 속 문제를 풀어 볼까?」
// 나온 곳: 해 보기 "기체의 온도와 부피 관계를 이용하여 생활 속 문제 해결하기", 스스로 확인하기의 달걀 삶기(껍데기 안쪽의 공기),
//          그림 "열기구의 원리"(가열하면 풍선이 부풀고, 기체 일부가 밖으로 밀려 나가 가벼워져 떠오른다).
// 학생이 정하는 것: 문제 1 달걀을 어떻게 삶을지(끓는 물에 바로 넣기, 찬물부터 천천히 데우기). 문제 2 풍선 속 공기의 온도(막대).
// 실패하는 길: 끓는 물에 바로 넣으면 껍데기 안쪽의 공기가 갑자기 데워져 빠르게 부풀고 껍데기에 금이 간다.
//             (구름 높이는 바구니 바닥이 오른쪽 점선에 닿는 높이다.) 열기구는 덜 데우면 뜨지 않고, 식히지 않으면 내려오지 않는다.
// 판정: 바로 넣은 달걀이 터지기 쉬운 까닭 → 떠오를 때 풍선 속 입자 수(무대에 남은 두 기록으로 답한다).
// 입자 수는 온도에 맞춰 셈한다(20 ℃ 30개 기준, 풍선이 다 부푼 뒤에는 절대 온도에 반비례).
// 옛 판(버너를 꾹 눌러 목표 높이 띠에 맞추는 비행 놀이)과 다른 점: 온도를 어느 쪽으로, 얼마나 빨리 바꿀지를 학생이 정해 문제를 푼다.
// 밀폐 용기 뚜껑은 다루지 않았다(단단한 그릇은 부피가 아니라 압력이 달라지는 예라 부피 이야기로 보여 주면 틀린다).
// 무대(2026-11-15 손질): 달걀은 옆모습(왼쪽 뾰족한 쪽, 오른쪽 뭉툭한 쪽)으로 그리고, 공기 방은 뭉툭한 끝 껍데기 바로 안쪽의 납작한 방으로
//   오른쪽 확대 동그라미에 크게 보인다(노른자는 그리지 않는다). 판정 1 때는 두 방법의 결과(빠르게 크게 부풀어 금 간 달걀,
//   천천히 부풀며 공기가 조금씩 빠져나간 달걀)를 나란히 둔다. 열기구는 무대 높이의 절반쯤으로 키우고, 데울 때 입구 아래로
//   입자가 빠져나가는 흐름을 굵은 화살과 함께 보인다(식히면 다시 들어온다). 판정 2 때는 땅에서와 가장 높이 떴을 때의 풍선을 나란히 두고
//   빠져나간 입자를 입구 아래에 남겨 센다.
import { haptic, HAPTIC } from "../../../core/haptics";
import { bvBtn, bvCard, bvCards, bvRange } from "../bio6/b6Lab";
import type { StepRenderer } from "../../types";
import { u6Lab, rr, txt, pill, clamp01, ease, noteRow, chip, dots, stepDots, drawDots, type Dot } from "./u6Kit";

const T0 = 20;
const T_FULL = 45; // 여기까지는 풍선이 부풀기만 한다
const T_LIFT = 70; // 이보다 뜨거우면 뜬다
const T_MAX = 120;
const N0 = 30;
const GROUND = 212;
const CLOUD = 0.5;
const SPAN = 80; // 가장 높이 떴을 때 바구니가 땅에서 올라간 높이(px)
const ZX = 236; // 달걀 공기 방 확대 동그라미
const ZY = 118;
const ZR = 58;
const countAt = (t: number): number => (t <= T_FULL ? N0 : Math.round((N0 * (273 + T_FULL)) / (273 + t)));

// ── 그림 도우미: 달걀(옆모습, 오른쪽이 뭉툭한 쪽)과 공기 방 확대 ──
/** 옆에서 본 달걀. 오른쪽(cos > 0)이 뭉툭한 쪽, 왼쪽이 뾰족한 쪽이다. */
function eggPath(cx: number, cy: number, rx: number, ry: number): Path2D {
  const p = new Path2D();
  for (let i = 0; i <= 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const x = cx + rx * c;
    const y = cy + ry * Math.sin(t) * (1 + 0.15 * c);
    if (i) p.lineTo(x, y);
    else p.moveTo(x, y);
  }
  p.closePath();
  return p;
}

/** 작은 달걀(냄비 속이나 비교판): 껍데기 면, 빛, 금. 뭉툭한 끝의 확대 표시 원을 돌려준다. */
function smallEgg(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, cracked: boolean): { x: number; y: number } {
  const egg = eggPath(cx, cy, rx, ry);
  const g = ctx.createRadialGradient(cx - rx * 0.35, cy - ry * 0.45, 2, cx, cy, rx * 1.2);
  g.addColorStop(0, "#FFFDF7");
  g.addColorStop(0.6, "#F4E7D2");
  g.addColorStop(1, "#DCC7A4");
  ctx.fillStyle = g;
  ctx.fill(egg);
  ctx.strokeStyle = "#C2AA82";
  ctx.lineWidth = 1.5;
  ctx.stroke(egg);
  if (cracked) {
    ctx.strokeStyle = "#6B5236";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + rx * 0.62, cy - ry * 0.78);
    ctx.lineTo(cx + rx * 0.74, cy - ry * 0.4);
    ctx.lineTo(cx + rx * 0.64, cy - ry * 0.1);
    ctx.lineTo(cx + rx * 0.78, cy + ry * 0.2);
    ctx.lineTo(cx + rx * 0.7, cy + ry * 0.5);
    ctx.stroke();
  }
  return { x: cx + rx * 0.8, y: cy };
}

interface AirCell {
  /** 공기 방의 깊이(확대 그림에서 껍데기 끝에서 안쪽으로, px) */
  depth: number;
  /** 공기의 온도(입자 색과 빠르기) */
  airT: number;
  cracked: boolean;
  /** 천천히 부풀며 껍데기의 작은 구멍으로 빠져나가는 공기 방울 */
  seep: boolean;
  /** 금이 간 틈으로 흰자가 비어져 나온 것 */
  leak: boolean;
  /** 동그라미 아래에 '공기 방' 이름표 */
  label?: boolean;
  /** 달걀이 물속에 있는가(아니면 둘레가 공기) */
  inWater?: boolean;
}

/** 뭉툭한 끝을 크게 본 동그라미: 껍데기, 흰자, 껍데기 바로 안쪽의 납작한 공기 방과 그 속 입자. */
function cellZoom(ctx: CanvasRenderingContext2D, mx: number, my: number, r: number, c: AirCell, air: Dot[], dt: number, tMs: number): void {
  const k = r / 58;
  const tip = mx + 36 * k; // 껍데기 끝(바깥)
  const shell = 6 * k;
  const ecx = tip - 100 * k;
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, r, 0, Math.PI * 2);
  ctx.clip();
  // 둘레: 물속이면 밝은 물빛(공기 방의 어두운 색과 헷갈리지 않게), 냄비 위면 공기
  ctx.fillStyle = "#13223A";
  ctx.fillRect(mx - r, my - r, r * 2, r * 2);
  ctx.fillStyle = c.inWater === false ? "rgba(150,180,220,.16)" : "rgba(110,170,235,.55)";
  ctx.fillRect(mx - r, my - r, r * 2, r * 2);
  const outer = eggPath(ecx, my, 100 * k, 70 * k);
  const inner = eggPath(ecx, my, 100 * k - shell, 70 * k - shell);
  ctx.fillStyle = "#EEDDC0";
  ctx.fill(outer);
  ctx.fillStyle = "#FBF6EA";
  ctx.fill(inner);
  // 공기 방: 흰자 쪽으로 볼록한 속껍질(큰 원의 호)과 껍데기 사이
  const Rm = 82 * k;
  const innerTip = tip - shell;
  const mcx = innerTip + Rm - c.depth * k;
  ctx.save();
  ctx.clip(inner);
  ctx.beginPath();
  ctx.arc(mcx, my, Rm, 0, Math.PI * 2);
  ctx.fillStyle = "#1B2C4A";
  ctx.fill();
  ctx.clip();
  // 입자: 공기 방을 감싸는 네모 안에서 튕긴다(그림은 공기 방 모양으로 자른다)
  const half = Math.sqrt(Math.max(0, Rm * Rm - (Rm - c.depth * k) * (Rm - c.depth * k)));
  const bx0 = innerTip - c.depth * k + 3;
  const bx1 = innerTip - 2;
  const sp = (0.25 + (c.airT / 95) * 1.4) * k;
  for (const p of air) {
    p.x += p.vx * sp * dt;
    p.y += p.vy * sp * dt;
    if (p.x < -30 || p.x > 30) p.vx = -p.vx;
    if (p.y < -30 || p.y > 30) p.vy = -p.vy;
    p.x = Math.max(-30, Math.min(30, p.x));
    p.y = Math.max(-30, Math.min(30, p.y));
  }
  const hue = 205 + (c.airT / 95) * 180;
  const pts: Dot[] = air.map((p) => ({ x: bx0 + ((p.x + 30) / 60) * Math.max(2, bx1 - bx0), y: my + (p.y / 30) * Math.max(4, half * 0.8), vx: 0, vy: 0 }));
  drawDots(ctx, pts, 0, 0, hue, 2.6 * k);
  ctx.restore();
  // 속껍질(공기 방의 경계)
  ctx.save();
  ctx.clip(inner);
  ctx.beginPath();
  ctx.arc(mcx, my, Rm, Math.PI * 0.5, Math.PI * 1.5);
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "#C2AA82";
  ctx.lineWidth = 1.6;
  ctx.stroke(outer);
  if (c.cracked) {
    // 껍데기의 금(뭉툭한 끝)
    ctx.strokeStyle = "#5B4630";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(tip - 14 * k, my - 34 * k);
    ctx.lineTo(tip - 3 * k, my - 24 * k);
    ctx.lineTo(tip - 11 * k, my - 14 * k);
    ctx.lineTo(tip + 1 * k, my - 4 * k);
    ctx.stroke();
    if (c.leak) {
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath();
      ctx.ellipse(tip + 9 * k, my - 20 * k, 9 * k, 5 * k, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (c.seep) {
    for (let i = 0; i < 3; i++) {
      const t = (tMs / 1300 + i / 3) % 1;
      ctx.strokeStyle = `rgba(230,244,255,${(0.95 * (1 - t)).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(tip + 4 * k + t * 12 * k, my - 6 * k - i * 9 * k - t * 26 * k, (2 + t * 1.6) * k, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(mx, my, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(205,224,252,.75)";
  ctx.lineWidth = 2.4;
  ctx.stroke();
  if (c.label) {
    const lx = innerTip - c.depth * k * 0.5;
    ctx.fillStyle = "#E8EEF9";
    ctx.beginPath();
    ctx.moveTo(lx, my + r + 3);
    ctx.lineTo(lx - 4, my + r + 9);
    ctx.lineTo(lx + 4, my + r + 9);
    ctx.closePath();
    ctx.fill();
    txt(ctx, "공기 방", lx, my + r + 18, { align: "center", size: 12, weight: 800, color: "#E8EEF9" });
  }
}

/** 확대 표시: 작은 원에서 확대 동그라미로 이어지는 점선 두 줄 */
function zoomCone(ctx: CanvasRenderingContext2D, ax: number, ay: number, ar: number, bx: number, by: number, br: number, a0: number, a1: number): void {
  ctx.strokeStyle = "rgba(205,224,252,.45)";
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  for (const a of [a0, a1]) {
    const d = Math.atan2(by + br * Math.sin(a) - ay, bx + br * Math.cos(a) - ax);
    ctx.beginPath();
    ctx.moveTo(ax + ar * Math.cos(d), ay + ar * Math.sin(d));
    ctx.lineTo(bx + br * Math.cos(a), by + br * Math.sin(a));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(205,224,252,.85)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/** 열기구. baseY는 바구니 바닥, R은 풍선 반지름, w는 데워진 정도(0~1, 색), ps는 풍선 속 입자(가운데 기준). */
function balloonArt(ctx: CanvasRenderingContext2D, bx: number, baseY: number, R: number, w: number, fill: number, ps: Dot[], flame: boolean, tMs: number): { mouth: number; by: number } {
  const mouth = baseY - 30;
  const by = mouth - 8 - R;
  // 줄과 바구니
  ctx.strokeStyle = "#C9B28A";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(bx - 10, baseY - 15);
  ctx.lineTo(bx - R * 0.5, by + R * 0.84);
  ctx.moveTo(bx + 10, baseY - 15);
  ctx.lineTo(bx + R * 0.5, by + R * 0.84);
  ctx.stroke();
  rr(ctx, bx - 12, baseY - 15, 24, 15, 3);
  ctx.fillStyle = "#B07A3E";
  ctx.fill();
  ctx.strokeStyle = "#7E5426";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (flame) {
    const fh = 14 + Math.sin(tMs / 60) * 1.8;
    ctx.fillStyle = "rgba(255,170,60,.92)";
    ctx.beginPath();
    ctx.moveTo(bx - 5, baseY - 17);
    ctx.quadraticCurveTo(bx, baseY - 17 - fh * 1.8, bx + 5, baseY - 17);
    ctx.fill();
  }
  // 풍선(위는 둥글고 아래로 좁아져 입구가 열려 있다)
  const env = new Path2D();
  env.arc(bx, by, R, Math.PI * 0.82, Math.PI * 0.18);
  env.quadraticCurveTo(bx + R * (0.3 + 0.3 * fill), by + R * 1.05, bx + 9, mouth);
  env.lineTo(bx - 9, mouth);
  env.quadraticCurveTo(bx - R * (0.3 + 0.3 * fill), by + R * 1.05, bx + R * Math.cos(Math.PI * 0.82), by + R * Math.sin(Math.PI * 0.82));
  env.closePath();
  ctx.fillStyle = `rgba(${Math.round(120 + 135 * w)}, ${Math.round(150 - 40 * w)}, ${Math.round(210 - 150 * w)}, .30)`;
  ctx.fill(env);
  // 세로 줄무늬(풍선 천)
  ctx.save();
  ctx.clip(env);
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.lineWidth = 1.2;
  for (const f of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.ellipse(bx, by + R * 0.1, Math.abs(f) * R + 0.5, R * 1.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = `rgba(${Math.round(200 + 55 * w)}, ${Math.round(215 - 45 * w)}, ${Math.round(245 - 120 * w)}, .95)`;
  ctx.lineWidth = 2.2;
  ctx.stroke(env);
  drawDots(ctx, ps, bx, by, 205 + w * 180, 2.7);
  return { mouth, by };
}

/** 굵은 화살(입자가 드나드는 흐름) */
function flowArrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, alpha: number): void {
  if (alpha <= 0.01) return;
  const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(a) * 7, y1 - Math.sin(a) * 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(a - 0.55) * 11, y1 - Math.sin(a - 0.55) * 11);
  ctx.lineTo(x1 - Math.cos(a + 0.55) * 11, y1 - Math.sin(a + 0.55) * 11);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha /= alpha;
}

export const tempFixLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as { title: string; cta?: string };
  const lab = u6Lab(host, api, { title: s.title, steps: 3, cls: "u6x-fix", label: "달걀 삶기와 열기구 띄우기", wait: "달걀을 터지지 않게 삶아 보세요" });
  const { frame, tm } = lab;
  let scene: "egg" | "balloon" = "egg";
  let phase: "egg" | "ask" | "up" | "down" | "done" = "egg";

  // ── 문제 1: 달걀 삶기 ──
  type Way = "fast" | "slow";
  let way: Way | null = null;
  let run = 0; // 삶는 동작의 진행(0~1)
  let cracked = false;
  let solved = false;
  let triedFast = false;
  const fast = bvCard("u6x-end", { name: "끓는 물에 바로 넣기", sub: "100 ℃ 물에 풍덩", key: "fast" });
  const slow = bvCard("u6x-end", { name: "찬물부터 천천히 데우기", sub: "20 ℃부터 서서히", key: "slow" });
  const next = bvBtn("main", "다음 문제로");
  next.disabled = true;
  const eggNote = noteRow();
  frame.slot.setControls(bvCards(1, fast, slow), next);
  const cook = (w: Way): void => {
    if (phase !== "egg" || (run > 0 && run < 1)) return;
    way = w;
    run = 0.001;
    cracked = false;
    haptic(HAPTIC.tap);
    fast.on(w === "fast");
    slow.on(w === "slow");
    host.dataset.u6Way = w;
    frame.say(w === "fast" ? "냉장고에서 꺼낸 달걀을 끓는 물에 넣었어요. <b>공기 방</b>을 지켜보세요." : "찬물에 넣고 불을 켰어요. 물이 천천히 데워져요. <b>공기 방</b>을 지켜보세요.");
  };
  fast.el.addEventListener("click", () => cook("fast"));
  slow.el.addEventListener("click", () => cook("slow"));
  const eggDone = (): void => {
    host.dataset.u6Cooked = String(Number(host.dataset.u6Cooked ?? 0) + 1);
    if (way === "fast") {
      triedFast = true;
      haptic(HAPTIC.wrong);
      frame.say(solved ? "껍데기에 <b>금</b>이 갔어요. 속 공기가 갑자기 데워져 빠르게 부풀었어요." : "껍데기에 <b>금</b>이 갔어요. 새 달걀로 <b>다른 방법</b>을 써 보세요.");
    } else {
      solved = true;
      haptic(HAPTIC.correct);
      frame.pips(1);
      next.disabled = false;
      api.setCTA("'다음 문제로'를 눌러 이어 가요", { enabled: false });
      frame.say(triedFast ? "무사히 삶았어요. 속 공기가 <b>천천히</b> 부풀며 조금씩 빠져나갔어요." : "무사히 삶았어요! 비교를 위해 <b>끓는 물에 바로 넣기</b>도 눌러 보거나 <b>다음 문제로</b> 넘어가 보세요.");
    }
  };
  next.addEventListener("click", () => {
    if (!solved || phase !== "egg") return;
    phase = "ask";
    lab.phase("ask");
    frame.say("달걀 껍데기 안쪽에는 공기가 든 작은 방이 있어요.");
    frame.slot.ask(
      "끓는 물에 <b>바로 넣은</b> 달걀이 터지기 쉬운 까닭은?",
      [{ t: "속 공기가 갑자기 데워져 빠르게 부풀어서", ok: true }, { t: "속 공기가 식어 부피가 줄어들어서" }, { t: "끓는 물이 껍데기를 녹여서" }],
      (ok) => lab.grade(ok),
      { why: "갑자기 데우면 공기 방 속 기체의 부피가 <b>급격히 늘어나</b> 껍데기를 세게 밀어내요.", onNext: toBalloon },
    );
  });

  // ── 문제 2: 열기구 ──
  let target = T0;
  let temp = T0;
  let alt = 0;
  let minN = N0;
  const ps: Dot[] = dots(N0, 26, 0.9);
  const leaving: { x: number; y: number; a: number }[] = [];
  const upChip = chip("구름 높이까지 띄우기");
  const downChip = chip("다시 땅에 내리기");
  const chips = document.createElement("div");
  chips.className = "u6x-chips";
  chips.append(upChip.el, downChip.el);
  const range = bvRange({
    cls: "u6x-rg u6x-rg-temp",
    min: 2,
    max: 12,
    value: 2,
    label: "풍선 속 공기의 온도",
    ticks: ["20 ℃", "70 ℃", "120 ℃"],
    onInput: (v) => {
      target = v * 10;
      host.dataset.u6Target = String(target);
    },
  });
  function toBalloon(): void {
    scene = "balloon";
    phase = "up";
    lab.phase("up");
    api.setCTA("열기구를 띄워 보세요", { enabled: false });
    frame.say("이번에는 열기구예요. 온도 슬라이더를 오른쪽으로 밀어 공기를 데우고 <b>구름 높이</b>까지 띄워 보세요.");
    frame.slot.setControls(range.el, eggNote.el, chips);
  }
  const askCount = (): void => {
    lab.phase("ask2");
    frame.pips(2);
    range.input.disabled = true;
    frame.say("무대의 두 풍선을 비교해 보세요. 땅에서와 가장 높이 떴을 때예요.");
    frame.slot.ask(
      "떠오를 때 풍선 속 <b>입자 수</b>는 어떻게 됐나요?",
      [{ t: "줄었어요", ok: true }, { t: "늘었어요" }, { t: "그대로였어요" }],
      (ok) => lab.grade(ok),
      {
        why: "데워져 부푼 공기 일부가 아래 입구로 <b>밀려 나갔어요</b>.",
        onNext: () => {
          phase = "done";
          lab.phase("done");
          frame.pips(3);
          frame.say("온도를 바꾸면 기체의 부피가 달라져요.");
          frame.slot.conclude("기체는 데우면 부피가 <b>늘고</b> 식히면 <b>줄어요</b>. 이 관계를 알면 달걀을 터뜨리지 않고 삶을 수 있고, 열기구를 띄우고 내릴 수 있어요.");
          api.enableCTA(s.cta ?? "개념 정리하기");
        },
      },
    );
  };

  lab.phase("egg");
  frame.say("냉장고에서 갓 꺼낸 차가운 달걀이에요. 껍데기가 깨지지 않게 삶을 <b>방법</b>을 골라 보세요.");

  // 공기 방 속 입자(확대 그림): 놀이용 하나, 비교판용 둘
  const airZ: Dot[] = dots(6, 30, 1);
  const airA: Dot[] = dots(6, 30, 1);
  const airB: Dot[] = dots(6, 30, 1);
  let eggBoard = 0;

  const drawEgg = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    if (run > 0 && run < 1) {
      run = Math.min(1, run + (way === "fast" ? 0.012 : 0.006) * dt);
      if (way === "fast" && run > 0.45 && !cracked) cracked = true;
      if (run >= 1) eggDone();
    }
    eggBoard = ease(eggBoard, phase === "egg" ? 0 : 1, 0.2, dt);
    // 물과 속 공기의 온도, 공기 방이 부푼 정도
    const water = way === "slow" ? 20 + 80 * run : way === "fast" ? 100 : 20;
    const airT = way === "fast" ? 5 + 90 * clamp01(run / 0.5) : way === "slow" ? 5 + 90 * run : 5;
    const grow = way ? (cracked ? 1.45 : 1 + 0.45 * (way === "fast" ? clamp01(run / 0.45) : run * 0.7)) : 1;
    const speed = way === "fast" && run < 0.5 ? 1 : way === "slow" && run < 1 ? 0.28 : 0;
    if (eggBoard < 0.99) {
      ctx.globalAlpha = 1 - eggBoard;
      // 냄비와 물
      const px0 = 12;
      const px1 = 172;
      // 물은 맑은 물빛이고, 데워질수록 바닥에 옅은 주황 기운이 돈다
      const wg = ctx.createLinearGradient(0, 112, 0, 208);
      wg.addColorStop(0, "rgba(160,205,250,.14)");
      wg.addColorStop(1, "rgba(100,165,240,.26)");
      rr(ctx, px0, 112, px1 - px0, 96, 12);
      ctx.fillStyle = wg;
      ctx.fill();
      if (water > 40) {
        const hg = ctx.createLinearGradient(0, 160, 0, 208);
        hg.addColorStop(0, "rgba(255,170,100,0)");
        hg.addColorStop(1, `rgba(255,170,100,${(0.24 * ((water - 40) / 60)).toFixed(3)})`);
        rr(ctx, px0, 160, px1 - px0, 48, 12);
        ctx.fillStyle = hg;
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(200,220,250,.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px0, 98);
      ctx.lineTo(px0, 198);
      ctx.quadraticCurveTo(px0, 208, px0 + 10, 208);
      ctx.lineTo(px1 - 10, 208);
      ctx.quadraticCurveTo(px1, 208, px1, 198);
      ctx.lineTo(px1, 98);
      ctx.stroke();
      if (water > 30) {
        // 불과 끓는 방울
        for (let i = 0; i < 4; i++) {
          const fx = px0 + 26 + i * 36;
          const fh = 6 + Math.sin(tMs / 80 + i) * 2;
          ctx.fillStyle = "rgba(255,160,60,.9)";
          ctx.beginPath();
          ctx.moveTo(fx - 5, 222);
          ctx.quadraticCurveTo(fx, 222 - fh * 2, fx + 5, 222);
          ctx.fill();
        }
        if (water > 90) {
          for (let i = 0; i < 5; i++) {
            const t = (tMs / 700 + i / 5) % 1;
            ctx.strokeStyle = `rgba(230,244,255,${0.7 * (1 - t)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(px0 + 14 + ((i * 37) % 140), 204 - t * 86, 2 + t * 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      // 달걀(옆모습: 왼쪽 뾰족한 쪽, 오른쪽 뭉툭한 쪽). 넣기 전에는 냄비 위에 있다
      const drop = way === "fast" ? clamp01(run / 0.12) : 1;
      const ex = 88;
      const ey = way === "fast" ? 62 + 98 * drop : way === "slow" ? 160 : 62;
      const end = smallEgg(ctx, ex, ey, 36, 25, cracked);
      if (way === "slow" && run > 0.2 && run < 1) {
        // 천천히 부푼 공기는 껍데기의 작은 구멍으로 조금씩 빠져나간다
        for (let i = 0; i < 2; i++) {
          const t = (tMs / 1100 + i / 2) % 1;
          ctx.strokeStyle = `rgba(230,244,255,${0.9 * (1 - t)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(end.x + 6 + t * 6, ey - 6 - t * 36, 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // 뭉툭한 끝의 공기 방을 크게(오른쪽 동그라미)
      zoomCone(ctx, end.x, end.y, 9, ZX, ZY, ZR, Math.PI + 0.75, Math.PI - 0.75);
      cellZoom(ctx, ZX, ZY, ZR, { depth: 10 + 18 * ((grow - 1) / 0.45), airT, cracked, seep: way === "slow" && run > 0.2 && run < 1, leak: cracked, label: true, inWater: ey > 110 }, airZ, dt, tMs);
      pill(ctx, `물 ${Math.round(water)} ℃`, 12, 7, { dot: water > 60 ? "#FF9F5A" : "#5AA2F8" });
      pill(ctx, `속 공기 ${Math.round(airT)} ℃`, 334, 7, { align: "right" });
      // 공기 방이 부푸는 빠르기
      txt(ctx, "부푸는", 324, 50, { align: "center", color: "#9FB2D0" });
      txt(ctx, "빠르기", 324, 65, { align: "center", color: "#9FB2D0" });
      rr(ctx, 315, 78, 18, 92, 9);
      ctx.fillStyle = "rgba(255,255,255,.08)";
      ctx.fill();
      if (speed > 0) {
        rr(ctx, 315, 78 + 92 * (1 - speed), 18, 92 * speed, 9);
        ctx.fillStyle = speed > 0.6 ? "#FFB37A" : "#7EC8E3";
        ctx.fill();
      }
      txt(ctx, speed > 0.6 ? "빨라요" : speed > 0 ? "느려요" : "멈춤", 324, 186, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
      if (run >= 1) txt(ctx, cracked ? "껍데기에 금이 갔어요" : "무사히 삶았어요", 92, 98, { align: "center", size: 13, weight: 800, color: cracked ? "#FFB37A" : "#BFE9FF" });
      ctx.globalAlpha = 1;
    }
    if (eggBoard > 0.01) {
      // 판정 1: 두 방법의 결과를 나란히(빠르게 크게 부풀어 금 간 달걀, 천천히 부풀며 공기가 조금씩 빠져나간 달걀)
      ctx.globalAlpha = eggBoard;
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(173, 10);
      ctx.lineTo(173, 222);
      ctx.stroke();
      const cols: [number, string, boolean, Dot[], string, string][] = [
        [88, "끓는 물에 바로", true, airA, "빠르게 부풀어 금이 가요", "#FFB37A"],
        [258, "찬물부터 천천히", false, airB, "천천히 부풀어 무사해요", "#BFE9FF"],
      ];
      for (const [x, title, fast, air, result, col] of cols) {
        txt(ctx, title, x, 15, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
        const end = smallEgg(ctx, x - 36, 50, 27, 19, fast);
        zoomCone(ctx, end.x, end.y, 7, x + 4, 128, 56, -Math.PI / 2 - 1.0, -Math.PI / 2 + 0.75);
        cellZoom(ctx, x + 4, 128, 56, { depth: fast ? 32 : 21, airT: 95, cracked: fast, seep: !fast, leak: fast }, air, dt, tMs);
        txt(ctx, result, x, 206, { align: "center", size: 12.5, weight: 800, color: col });
      }
      ctx.globalAlpha = 1;
    }
  };

  let noteKey = "";
  let maxT = T0; // 가장 높이 떴을 때의 온도
  let flowOut = 0; // 밀려 나가는 흐름의 세기(화살)
  let flowIn = 0; // 다시 들어오는 흐름의 세기
  const entering: { x: number; y: number; a: number }[] = [];
  const psGround: Dot[] = dots(N0, 30, 0.9);
  const psTop: Dot[] = dots(N0, 40, 0.9);
  let balloonBoard = 0;
  const drawBalloon = (ctx: CanvasRenderingContext2D, dt: number, tMs: number): void => {
    temp = ease(temp, target, 0.045, dt);
    const fill = clamp01((temp - T0) / (T_FULL - T0));
    const lift = clamp01((temp - T_LIFT) / (T_MAX - 10 - T_LIFT));
    alt = ease(alt, lift, 0.035, dt);
    if (alt < 0.004 && lift === 0) alt = 0;
    const n = countAt(temp);
    maxT = Math.max(maxT, temp);
    minN = Math.min(minN, n);
    const R = 34 + 10 * fill;
    while (ps.length > n) {
      ps.pop();
      leaving.push({ x: (Math.random() - 0.5) * 12, y: 0, a: 1 });
      flowOut = 1;
    }
    while (ps.length < n) {
      ps.push({ x: (Math.random() - 0.5) * 8, y: R - 10, vx: (Math.random() - 0.5) * 1.2, vy: -0.8 });
      entering.push({ x: (Math.random() - 0.5) * 12, y: 30, a: 0 });
      flowIn = 1;
    }
    flowOut = Math.max(0, flowOut - 0.006 * dt);
    flowIn = Math.max(0, flowIn - 0.006 * dt);
    const w = (temp - T0) / (T_MAX - T0);
    if (phase === "up" && alt >= CLOUD) {
      phase = "down";
      lab.phase("down");
      upChip.done();
      haptic(HAPTIC.select);
      api.setCTA("열기구를 다시 내려 보세요", { enabled: false });
      frame.say("구름 높이에 도착했어요! 이번엔 슬라이더를 왼쪽으로 되돌려 공기를 <b>식혀</b> 땅에 착륙해 보세요.");
    } else if (phase === "down" && alt === 0 && target <= T_LIFT) {
      phase = "ask";
      downChip.done();
      haptic(HAPTIC.select);
      tm.later(askCount, 700);
    }
    const key = `${Math.round(temp)}|${n}`;
    if (key !== noteKey) {
      noteKey = key;
      eggNote.set(`풍선 속 공기 <b>${Math.round(temp)} ℃</b>`, `입자 <b>${n}개</b>`);
      host.dataset.u6Alt = alt.toFixed(2);
    }
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "rgba(40,84,150,.55)");
    sky.addColorStop(1, "rgba(120,170,220,.25)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 346, GROUND);
    ctx.fillStyle = "#2F5A46";
    ctx.fillRect(0, GROUND, 346, 230 - GROUND);
    balloonBoard = ease(balloonBoard, phase === "ask" || phase === "done" ? 1 : 0, 0.2, dt);
    if (balloonBoard < 0.99) {
      ctx.globalAlpha = 1 - balloonBoard;
      const cy = GROUND - CLOUD * SPAN; // 바구니 바닥이 이 선에 닿으면 구름 높이다
      ctx.strokeStyle = "rgba(255,255,255,.4)";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(214, cy);
      ctx.lineTo(346, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, "구름 높이", 338, cy - 11, { align: "right", color: "#E8EEF9" });
      ctx.fillStyle = "rgba(255,255,255,.2)";
      for (const [x, cw] of [[214, 46], [286, 34]]) {
        rr(ctx, x, cy - 44 + Math.sin(tMs / 1400 + x) * 2, cw, 14, 7);
        ctx.fill();
      }
      const bx = 92;
      const baseY = GROUND - alt * SPAN;
      stepDots(ps, R, dt, 0.6 + w * 1.1);
      const { mouth, by } = balloonArt(ctx, bx, baseY, R, w, fill, ps, target > temp + 2, tMs);
      // 밀려 나가는 입자: 입구 아래로 굵은 화살을 따라 빠져나간다
      flowArrow(ctx, bx - 12, mouth + 2, bx - 34, mouth + 26, "#FFB37A", flowOut);
      flowArrow(ctx, bx + 12, mouth + 2, bx + 34, mouth + 26, "#FFB37A", flowOut);
      for (const d of leaving) {
        d.y += 0.45 * dt;
        d.a -= 0.008 * dt;
        const sx = d.x > 0 ? 1 : -1;
        const x = bx + d.x + sx * (8 + d.y * 0.9);
        const y = mouth + 2 + d.y;
        ctx.fillStyle = `rgba(255,190,120,${(Math.max(0, d.a) * 0.35).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,214,150,${Math.max(0, d.a).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = leaving.length - 1; i >= 0; i--) if (leaving[i].a <= 0) leaving.splice(i, 1);
      // 식히면 바깥 공기가 입구로 다시 들어온다
      flowArrow(ctx, bx - 30, mouth + 28, bx - 12, mouth + 6, "#8FC5FF", flowIn);
      flowArrow(ctx, bx + 30, mouth + 28, bx + 12, mouth + 6, "#8FC5FF", flowIn);
      for (const d of entering) {
        d.y -= 0.6 * dt;
        d.a += 0.03 * dt;
        const sx = d.x > 0 ? 1 : -1;
        const x = bx + d.x + sx * (6 + d.y * 0.8);
        const y = mouth + d.y;
        ctx.fillStyle = `rgba(160,205,255,${clamp01(1.2 - d.a).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = entering.length - 1; i >= 0; i--) if (entering[i].y <= 0) entering.splice(i, 1);
      pill(ctx, `땅에서 입자 ${N0}개`, 334, 7, { dot: "#5AA2F8", align: "right" });
      if (phase !== "up") pill(ctx, `가장 높이 떴을 때 ${minN}개`, 334, 38, { dot: "#FF9F5A", align: "right" });
      // 온도와 입자 수: 풍선의 오른쪽 아래(높이 떠도 오른쪽 위 이름표와 겹치지 않게)
      txt(ctx, `${Math.round(temp)} ℃`, bx + R * 0.9 + 8, by + R * 0.55, { size: 14, weight: 800, color: "#FFFFFF" });
      txt(ctx, `입자 ${n}개`, bx + R * 0.9 + 8, by + R * 0.55 + 17, { color: "#C9D6EC" });
      ctx.globalAlpha = 1;
    }
    if (balloonBoard > 0.01) {
      // 판정 2: 땅에서와 가장 높이 떴을 때를 나란히. 빠져나간 입자는 입구 아래에 남겨 센다
      ctx.globalAlpha = balloonBoard;
      const out = N0 - minN;
      while (psTop.length > minN) psTop.pop();
      const wTop = (maxT - T0) / (T_MAX - T0);
      const left = balloonArt(ctx, 86, GROUND, 34, 0, 0, psGround, false, tMs);
      stepDots(psGround, 34, dt, 0.6);
      void left;
      stepDots(psTop, 44, dt, 0.6 + wTop * 1.1);
      const right = balloonArt(ctx, 252, 170, 44, wTop, 1, psTop, false, tMs);
      flowArrow(ctx, 240, right.mouth + 2, 218, right.mouth + 26, "#FFB37A", 1);
      flowArrow(ctx, 264, right.mouth + 2, 286, right.mouth + 26, "#FFB37A", 1);
      for (let i = 0; i < out; i++) {
        // 빠져나간 입자: 두 화살의 끝을 따라 늘어선다
        const sx = i % 2 ? 1 : -1;
        const t = 1.3 + Math.floor(i / 2) * 0.35;
        const x = 252 + sx * (12 + 22 * t);
        const y = right.mouth + 2 + 24 * t;
        ctx.fillStyle = "rgba(255,190,120,.3)";
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFD696";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      txt(ctx, "땅에서", 86, 15, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
      txt(ctx, `입자 ${N0}개`, 86, 33, { align: "center", size: 13, weight: 800, color: "#9FC9FF" });
      txt(ctx, "가장 높이 떴을 때", 252, 15, { align: "center", size: 13, weight: 800, color: "#E8EEF9" });
      txt(ctx, `입자 ${minN}개`, 252, 33, { align: "center", size: 13, weight: 800, color: "#FFB37A" });
      if (out > 0) txt(ctx, `빠져나간 입자 ${out}개`, 252, 204, { align: "center", size: 12, weight: 800, color: "#FFD696" });
      ctx.globalAlpha = 1;
    }
  };

  lab.run((ctx, dt, tMs) => (scene === "egg" ? drawEgg(ctx, dt, tMs) : drawBalloon(ctx, dt, tMs)));
  return () => lab.cleanup();
};
