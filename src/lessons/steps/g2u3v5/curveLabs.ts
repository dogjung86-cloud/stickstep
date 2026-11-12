// [중2 Ⅲ v5] g2u3l5 거울과 렌즈: 랩 세 판(렌더러 둘).
//
// 1) g2u3CurveLab (mode: "mirror" | "lens") 「볼록 거울과 오목 거울은 어떻게 다를까요?」 「볼록 렌즈와 오목 렌즈는 어떻게 다를까요?」
//    책의 어디에서: 탐구 '거울과 렌즈에 의한 상의 특징 관찰하기'(볼록 거울, 오목 거울, 볼록 렌즈, 오목 렌즈 앞의 물체를 가까울 때와 멀 때 관찰해 표에 그린다).
//    학생이 정하는 것: 거울(렌즈)의 종류, 물체까지의 거리, 지금 보이는 모습을 '가까울 때' 칸에 적을지 '멀 때' 칸에 적을지.
//    실패하는 길: 물체가 멀리 있는데 '가까울 때' 칸을 누르면 적히지 않는다. 가깝지도 멀지도 않은 자리, 상이 흐려지는 자리에서도 적히지 않는다
//    (책의 도움말: 오목 거울은 물체를 거의 닿을 만큼 가깝게 두고 관찰한다).
//    한 통찰: 볼록 거울과 오목 렌즈의 상은 늘 작고 바로 선다. 오목 거울과 볼록 렌즈의 상은 가까우면 크고 바로, 멀면 작고 거꾸로 선다.
//    상의 배율은 계산한다: m = f / (f − d). 볼록 거울과 오목 렌즈는 f가 음수다. 화면에 '초점, 실상, 허상'은 쓰지 않는다.
//    옛 랩(opticView, mirrorLens)은 3D 촛불 관찰소와 가로 작도 벤치였다. 표를 채우는 관찰 실험이 아니었다.
//
// 2) g2u3UseLab 「굽은 길에는 어떤 거울을 세울까요?」
//    책의 어디에서: 해 보기 '일상생활에서 사용하는 거울과 렌즈 분류하기', 그림 Ⅲ-9(굽은 도로의 거울은 볼록 거울로 넓은 범위를 본다).
//    학생이 정하는 것: 세 갈래 길 건너편에 세울 거울(평면거울, 볼록 거울, 오목 거울).
//    실패하는 길: 평면거울과 오목 거울을 세우면 거울에 비치는 범위가 좁아 양옆에서 오는 차가 보이지 않는다.
//    한 통찰: 볼록 거울은 상이 작은 대신 넓은 범위를 보여 준다. 비치는 범위는 거울 양 끝에서의 반사를 계산해 그린다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { eyeProp } from "../../../ui/lightKit";
import type { StepRenderer } from "../../types";
import { bvRange, bvTimers } from "../bio6/b6Lab";
import { LX, lxCanvas, lxFrame, lxLog, lxPill, lxSeg, lxText, rad } from "./lxKit";

interface S {
  title: string;
  cta?: string;
  mode?: "mirror" | "lens";
}

/** 인형(위아래가 다른 물체). (cx, cy)가 가운데, h가 키. inv면 거꾸로 선다. */
function doll(ctx: CanvasRenderingContext2D, cx: number, cy: number, h: number, o: { inv?: boolean; alpha?: number; ghost?: boolean } = {}): void {
  ctx.save();
  ctx.translate(cx, cy);
  if (o.inv) ctx.rotate(Math.PI);
  ctx.globalAlpha = o.alpha ?? 1;
  const r = h * 0.2;
  if (o.ghost) {
    ctx.strokeStyle = "rgba(232,238,249,.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, -h / 2 + r, r, 0, Math.PI * 2);
    ctx.moveTo(-h * 0.26, h / 2);
    ctx.lineTo(0, -h / 2 + r * 2);
    ctx.lineTo(h * 0.26, h / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    return;
  }
  // 몸(빨간 옷)
  ctx.fillStyle = "#F0625A";
  ctx.beginPath();
  ctx.moveTo(-h * 0.26, h / 2);
  ctx.lineTo(0, -h / 2 + r * 1.7);
  ctx.lineTo(h * 0.26, h / 2);
  ctx.closePath();
  ctx.fill();
  // 머리와 노란 모자
  ctx.fillStyle = "#F6D6BE";
  ctx.beginPath();
  ctx.arc(0, -h / 2 + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFC83D";
  ctx.beginPath();
  ctx.arc(0, -h / 2 + r, r, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-r * 1.3, -h / 2 + r - 1, r * 2.6, Math.max(2, h * 0.04));
  ctx.restore();
}

// ══════════════════════════════════════════════════════════
// 1) 거울과 렌즈 관찰
// ══════════════════════════════════════════════════════════
type Dev = "cvx" | "ccv";
const NEAR_MAX = 5; // 막대 값 5까지가 '가까울 때'
const FAR_MIN = 14; // 14부터가 '멀 때'
const VIEW = { x: 262, y: 118, r: 68 };

export const curveLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const lens = s.mode === "lens";
  const f = lxFrame(host, { title: s.title, steps: 4, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = lens ? "lens" : "mirror";
  host.dataset.lx = "watch";
  const word = lens ? "렌즈" : "거울";

  let dev: Dev = "cvx";
  let v = 3;
  let end = false;
  const filled: Record<Dev, [string, string]> = { cvx: ["", ""], ccv: ["", ""] };

  /** 모이게 하는 쪽(오목 거울, 볼록 렌즈)인가 */
  const gather = (): boolean => (lens ? dev === "cvx" : dev === "ccv");
  /** 배율. 양수면 바로 선 상, 음수면 거꾸로 선 상. d는 f의 몇 배인가(막대 1칸이 0.15배). */
  const mag = (): number => {
    const d = v * 0.15;
    return gather() ? 1 / (1 - d) : 1 / (1 + d);
  };
  const blurry = (): boolean => gather() && Math.abs(v * 0.15 - 1) < 0.16;
  const look = (): string => {
    if (blurry()) return "흐려서 알아볼 수 없어요";
    const m = mag();
    return `${Math.abs(m) > 1.04 ? "크고" : "작고"} ${m > 0 ? "바로" : "거꾸로"} 선 상`;
  };

  const seg = lxSeg<Dev>(
    lens
      ? [
          { k: "cvx", t: "볼록 렌즈", sub: "가운데가 두꺼워요" },
          { k: "ccv", t: "오목 렌즈", sub: "가장자리가 두꺼워요" },
        ]
      : [
          { k: "cvx", t: "볼록 거울", sub: "가운데가 볼록해요" },
          { k: "ccv", t: "오목 거울", sub: "가운데가 오목해요" },
        ],
    "cvx",
    (k) => {
      if (end) return;
      dev = k;
      haptic(HAPTIC.tap);
      paintCells();
      f.say(`<b>${name()}</b>${lens ? "예요" : "이에요"}. 물체를 가까이 댔다가 멀리 옮기며 보이는 모습을 살펴보세요.`);
    },
    "low",
  );
  const name = (): string => (lens ? (dev === "cvx" ? "볼록 렌즈" : "오목 렌즈") : dev === "cvx" ? "볼록 거울" : "오목 거울");
  const range = bvRange({
    cls: "g2u3x-r",
    min: 1,
    max: 20,
    value: v,
    label: `물체를 ${word}에서 멀리 옮기기`,
    onInput: (x) => {
      v = x;
    },
  });
  const cells = [0, 1].map((i) => {
    const nm = el("span", { class: "g2u3x-log-n", text: i === 0 ? `${word}에 가까울 때` : `${word}에서 멀 때` });
    const val = el("b", { class: "g2u3x-log-v", text: "눌러서 적기" });
    const b = el("button", { class: "g2u3x-cell", attrs: { type: "button" } }, nm, val) as HTMLButtonElement;
    b.dataset.k = i === 0 ? "near" : "far";
    b.addEventListener("click", () => record(i as 0 | 1));
    return { b, val };
  });
  f.slot.setControls(seg.el, range.el, el("div", { class: "g2u3x-row2" }, cells[0].b, cells[1].b));

  function paintCells(): void {
    cells.forEach((c, i) => {
      const t = filled[dev][i];
      c.val.textContent = t || "눌러서 적기";
      c.b.classList.toggle("on", !!t);
    });
    (["cvx", "ccv"] as Dev[]).forEach((d) => {
      if (filled[d][0] && filled[d][1]) seg.done(d);
    });
  }
  function record(i: 0 | 1): void {
    if (end) return;
    const near = v <= NEAR_MAX;
    const far = v >= FAR_MIN;
    if (blurry()) {
      haptic(HAPTIC.wrong);
      f.say("지금은 상이 <b>흐려서</b> 적을 수 없어요. 물체를 더 가까이 대거나 더 멀리 옮겨 보세요.");
      return;
    }
    if (i === 0 && !near) {
      haptic(HAPTIC.wrong);
      f.say(`지금은 물체가 ${word}에서 떨어져 있어요. '가까울 때' 칸은 물체를 <b>바짝 대고</b> 적어요.`);
      return;
    }
    if (i === 1 && !far) {
      haptic(HAPTIC.wrong);
      f.say(`'멀 때' 칸은 물체를 ${word}에서 <b>더 멀리</b> 옮긴 뒤에 적어요.`);
      return;
    }
    const m = mag();
    let t = `${Math.abs(m) > 1.04 ? "크고" : "작고"} ${m > 0 ? "바로" : "거꾸로"}`;
    if (i === 1 && !gather()) t = "더 작고 바로";
    filled[dev][i] = t;
    haptic(HAPTIC.correct);
    paintCells();
    const n = (["cvx", "ccv"] as Dev[]).reduce((a, d) => a + filled[d].filter(Boolean).length, 0);
    f.pips(n);
    host.dataset.lxN = String(n);
    if (n < 4) {
      const other = dev === "cvx" ? "ccv" : "cvx";
      const here = filled[dev][0] && filled[dev][1];
      f.say(here ? `${name()}의 두 칸을 채웠어요. 이제 <b>${lens ? (other === "cvx" ? "볼록 렌즈" : "오목 렌즈") : other === "cvx" ? "볼록 거울" : "오목 거울"}</b>로 바꿔 관찰해 보세요.` : `'${t}'라고 적었어요. 물체를 옮겨 <b>나머지 칸</b>도 채워 보세요.`);
      return;
    }
    end = true;
    host.dataset.lx = "ask";
    f.say("네 칸을 모두 채웠어요. 두 표를 견줘 봐요.");
    tm.later(() => {
      if (lens)
        f.slot.ask(
          "가까이 있는 작은 글씨를 크게 보려면 어떤 렌즈를 써야 할까요?",
          [{ t: "볼록 렌즈", ok: true }, { t: "오목 렌즈" }, { t: "어느 렌즈나 똑같아요" }],
          (ok) => api.recordQuiz(ok),
          { why: "가까울 때 <b>크고 바로</b> 보인 것은 볼록 렌즈였어요. 오목 렌즈는 늘 작게 보였어요.", onNext: finish },
        );
      else
        f.slot.ask(
          "물체를 아무리 멀리 옮겨도 거꾸로 선 상이 생기지 않는 거울은 무엇일까요?",
          [{ t: "볼록 거울", ok: true }, { t: "오목 거울" }, { t: "두 거울 모두" }],
          (ok) => api.recordQuiz(ok),
          { why: "볼록 거울은 두 칸 모두 <b>바로</b> 선 상이었어요. 오목 거울은 멀 때 거꾸로 섰어요.", onNext: finish },
        );
    }, 1500);
  }
  function finish(): void {
    host.dataset.lx = "done";
    f.say("관찰 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude(
      lens
        ? "<b>볼록 렌즈</b>의 상은 가까우면 크고 바로, 멀면 작고 거꾸로 서요. <b>오목 렌즈</b>의 상은 늘 작고 바로 서요."
        : "<b>볼록 거울</b>의 상은 늘 작고 바로 서요. <b>오목 거울</b>의 상은 가까우면 크고 바로, 멀면 작고 거꾸로 서요.",
    );
    api.enableCTA(s.cta ?? "다음");
  }

  // 옆에서 본 실험 모습
  const GY = 168; // 바닥
  const drawSide = (ctx: CanvasRenderingContext2D): void => {
    ctx.strokeStyle = "rgba(178,204,238,.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, GY);
    ctx.lineTo(182, GY);
    ctx.stroke();
    const px = 6.2; // 막대 한 칸의 길이
    if (lens) {
      const lx0 = 52;
      // 렌즈(옆모습)
      ctx.save();
      ctx.fillStyle = "rgba(150,210,255,.45)";
      ctx.strokeStyle = "rgba(200,232,255,.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (dev === "cvx") {
        ctx.moveTo(lx0, GY - 78);
        ctx.quadraticCurveTo(lx0 + 13, GY - 44, lx0, GY - 10);
        ctx.quadraticCurveTo(lx0 - 13, GY - 44, lx0, GY - 78);
      } else {
        ctx.moveTo(lx0 - 8, GY - 78);
        ctx.lineTo(lx0 + 8, GY - 78);
        ctx.quadraticCurveTo(lx0 + 1, GY - 44, lx0 + 8, GY - 10);
        ctx.lineTo(lx0 - 8, GY - 10);
        ctx.quadraticCurveTo(lx0 - 1, GY - 44, lx0 - 8, GY - 78);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      doll(ctx, lx0 + 14 + v * px, GY - 17, 34);
      eyeProp(ctx, 18, GY - 44, 0, 12);
      lxText(ctx, "눈", 18, GY - 66, { color: LX.dim });
      lxText(ctx, name(), lx0 + 4, GY + 16, { color: LX.ink });
    } else {
      const mx = 170;
      // 거울(옆모습): 반사하는 면은 왼쪽
      ctx.save();
      ctx.strokeStyle = "#DCE8F8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      const bow = dev === "cvx" ? -12 : 12;
      ctx.moveTo(mx, GY - 80);
      ctx.quadraticCurveTo(mx + bow, GY - 44, mx, GY - 8);
      ctx.stroke();
      ctx.strokeStyle = "rgba(140,160,195,.8)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const y = GY - 80 + 72 * t;
        const x = mx + bow * 2 * t * (1 - t) + 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 7, y + 6);
        ctx.stroke();
      }
      ctx.restore();
      doll(ctx, mx - 18 - v * px, GY - 17, 34);
      eyeProp(ctx, 14, GY - 44, 0, 12);
      lxText(ctx, "눈", 14, GY - 66, { color: LX.dim });
      lxText(ctx, name(), mx - 26, GY + 16, { color: LX.ink });
    }
    lxText(ctx, "물체", lens ? 52 + 14 + v * 6.2 : 170 - 18 - v * 6.2, GY - 46, { color: LX.dim });
  };

  st.run((ctx) => {
    drawSide(ctx);
    // 보이는 모습(둥근 창)
    ctx.save();
    ctx.beginPath();
    ctx.arc(VIEW.x, VIEW.y, VIEW.r, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(VIEW.x - 18, VIEW.y - 22, 6, VIEW.x, VIEW.y, VIEW.r);
    g.addColorStop(0, lens ? "#34507C" : "#4A5E80");
    g.addColorStop(1, lens ? "#1B2E52" : "#243550");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    const H0 = 46; // 실제 크기로 그린 인형의 키
    doll(ctx, VIEW.x, VIEW.y, H0, { ghost: true });
    if (blurry()) {
      const bg = ctx.createRadialGradient(VIEW.x, VIEW.y, 4, VIEW.x, VIEW.y, VIEW.r);
      bg.addColorStop(0, "rgba(240,98,90,.55)");
      bg.addColorStop(0.6, "rgba(246,214,190,.3)");
      bg.addColorStop(1, "rgba(246,214,190,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(VIEW.x - VIEW.r, VIEW.y - VIEW.r, VIEW.r * 2, VIEW.r * 2);
    } else {
      const m = mag();
      doll(ctx, VIEW.x, VIEW.y, H0 * Math.abs(m), { inv: m < 0, alpha: 0.96 });
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(214,230,250,.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(VIEW.x, VIEW.y, VIEW.r, 0, Math.PI * 2);
    ctx.stroke();
    lxText(ctx, `${word}${lens ? "로" : "에"} 보이는 모습`, VIEW.x, VIEW.y + VIEW.r + 16, { color: LX.ink });
    lxText(ctx, "점선: 실제 크기", VIEW.x, VIEW.y + VIEW.r + 32, { color: LX.dim });
    lxPill(ctx, look(), blurry() ? LX.red : LX.gold);
  });

  paintCells();
  f.say(`<b>볼록 ${word}</b>${lens ? "로" : "에"} 인형을 ${lens ? "봐요" : "비춰요"}. 물체를 가까이 댔다가 멀리 옮기며, 보이는 모습을 <b>두 칸</b>에 적어 보세요.`);
  api.setCTA("네 칸을 모두 채워 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};

// ══════════════════════════════════════════════════════════
// 2) 세 갈래 길의 거울
// ══════════════════════════════════════════════════════════
type Kind = "plane" | "convex" | "concave";
const BEND: Record<Kind, number> = { plane: 0, convex: 36, concave: -5 }; // 거울 끝에서 면에 수직인 선이 벌어진 각(도)
const MC = { x: 173, y: 34, a: 16 }; // 거울의 가운데와 반폭
const DRV = { x: 173, y: 196 }; // 내 차(운전자)
const CARS = [
  { x: 62, y: 74 },
  { x: 284, y: 74 },
];

/** 거울 한쪽 끝(sgn: −1 왼쪽, 1 오른쪽)에서 반사한 빛의 방향. */
function endRay(kind: Kind, sgn: number): { px: number; py: number; rx: number; ry: number } {
  const px = MC.x + sgn * MC.a;
  const py = MC.y;
  const b = rad(BEND[kind]) * sgn;
  const nx = Math.sin(b);
  const ny = Math.cos(b);
  const L = Math.hypot(px - DRV.x, py - DRV.y);
  const dx = (px - DRV.x) / L;
  const dy = (py - DRV.y) / L;
  const k = dx * nx + dy * ny;
  return { px, py, rx: dx - 2 * k * nx, ry: dy - 2 * k * ny };
}
/** 거울에 비치는 범위 안에 있는가(거울에서 본 방향이 두 끝 광선 사이). */
function inView(kind: Kind, x: number, y: number): boolean {
  const l = endRay(kind, -1);
  const r = endRay(kind, 1);
  const a0 = Math.atan2(r.ry, r.rx);
  const a1 = Math.atan2(l.ry, l.rx);
  const a = Math.atan2(y - MC.y, x - MC.x);
  return a > Math.min(a0, a1) && a < Math.max(a0, a1);
}

export const useLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = lxFrame(host, { title: s.title, steps: 3, api });
  const st = lxCanvas(f.stage);
  const tm = bvTimers();
  host.dataset.lxLab = "use";
  host.dataset.lx = "pick";

  let kind: Kind | null = null;
  let asked = false;
  const tried = new Set<Kind>();
  const NAMES: Record<Kind, string> = { plane: "평면거울", convex: "볼록 거울", concave: "오목 거울" };
  const log = lxLog(["평면거울", "볼록 거울", "오목 거울"]);
  const seg = lxSeg<Kind>(
    [
      { k: "plane", t: "평면거울" },
      { k: "convex", t: "볼록 거울" },
      { k: "concave", t: "오목 거울" },
    ],
    "plane",
    (k) => {
      if (asked) return;
      kind = k;
      tried.add(k);
      haptic(HAPTIC.tap);
      const n = CARS.filter((c) => inView(k, c.x, c.y)).length;
      log.set(["plane", "convex", "concave"].indexOf(k), `차 ${n}대 보임`);
      f.pips(Math.min(2, tried.size));
      if (k === "convex") f.say(tried.size > 1 ? "볼록 거울에는 <b>넓은 범위</b>가 비쳐 양쪽에서 오는 차가 모두 보여요." : "양쪽 차가 모두 보여요! <b>다른 거울</b>도 세워 비치는 범위를 견줘 보세요.");
      else f.say(`${NAMES[k]}에는 <b>좁은 범위</b>만 비쳐요. 양옆에서 달려오는 차가 보이지 않아요.`);
      if (tried.has("convex") && tried.size >= 2) {
        asked = true;
        host.dataset.lx = "ask";
        tm.later(() => {
          f.slot.ask(
            "얼굴을 가까이 대고 크게 비춰 보는 화장 거울에는 어떤 거울이 알맞을까요?",
            [{ t: "오목 거울", ok: true }, { t: "볼록 거울" }, { t: "평면거울" }],
            (ok) => api.recordQuiz(ok),
            { why: "가까이 있는 물체가 <b>크고 바로</b> 보이는 거울은 오목 거울이었어요.", onNext: finish },
          );
        }, 2400);
      }
    },
    "low",
  );
  seg.btns.plane.classList.remove("on");
  f.slot.setControls(seg.el, el("div", { class: "g2u3x-cap", text: "거울마다 보이는 차" }), log.el);

  function finish(): void {
    host.dataset.lx = "done";
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("볼록 거울은 상이 작은 대신 <b>넓은 범위</b>를 보여 줘요. 그래서 굽은 길의 거울이나 자동차 옆 거울에 써요.");
    api.enableCTA(s.cta ?? "다음");
  }

  const car = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, vert: boolean, seen: boolean, t: number): void => {
    ctx.save();
    ctx.translate(x, y);
    if (vert) ctx.rotate(Math.PI / 2);
    if (seen) {
      ctx.strokeStyle = `rgba(81,207,102,${0.6 + 0.3 * Math.sin(t / 200)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-22, -15, 44, 30, 9);
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-16, -9, 32, 18, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(11,21,36,.55)";
    ctx.fillRect(-7, -6.5, 12, 13);
    ctx.restore();
  };

  st.run((ctx, t) => {
    // 길(위에서 본 모습): 가로 길과 아래에서 올라오는 길
    ctx.fillStyle = "#33415C";
    ctx.fillRect(0, 48, 346, 54);
    ctx.fillRect(144, 102, 58, 128);
    ctx.strokeStyle = "rgba(255,255,255,.35)";
    ctx.setLineDash([10, 9]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 75);
    ctx.lineTo(346, 75);
    ctx.moveTo(173, 110);
    ctx.lineTo(173, 230);
    ctx.stroke();
    ctx.setLineDash([]);
    // 건물(양옆을 가린다)
    ctx.fillStyle = "#5C6B88";
    ctx.beginPath();
    ctx.roundRect(6, 108, 132, 116, 8);
    ctx.roundRect(208, 108, 132, 116, 8);
    ctx.fill();
    lxText(ctx, "건물", 72, 166, { color: LX.dim });
    lxText(ctx, "건물", 274, 166, { color: LX.dim });
    // 거울에 비치는 범위
    if (kind) {
      const l = endRay(kind, -1);
      const r = endRay(kind, 1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 48, 346, 54);
      ctx.rect(144, 102, 58, 128);
      ctx.clip();
      ctx.fillStyle = "rgba(255,216,74,.34)";
      ctx.beginPath();
      ctx.moveTo(l.px, l.py);
      ctx.lineTo(l.px + l.rx * 500, l.py + l.ry * 500);
      ctx.lineTo(r.px + r.rx * 500, r.py + r.ry * 500);
      ctx.lineTo(r.px, r.py);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    CARS.forEach((c) => car(ctx, c.x, c.y, "#FF8787", false, !!kind && inView(kind, c.x, c.y), t));
    car(ctx, DRV.x, DRV.y, "#4DABF7", true, false, t);
    lxText(ctx, "내 차", DRV.x + 44, DRV.y, { color: LX.ink });
    // 거울
    ctx.save();
    ctx.strokeStyle = "#E8EEF9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    const bow = kind === "convex" ? 9 : kind === "concave" ? -4 : 0;
    ctx.moveTo(MC.x - MC.a, MC.y);
    ctx.quadraticCurveTo(MC.x, MC.y + bow * 2, MC.x + MC.a, MC.y);
    ctx.stroke();
    ctx.strokeStyle = "#93A3C0";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(MC.x, MC.y - 2);
    ctx.lineTo(MC.x, 14);
    ctx.stroke();
    ctx.restore();
    lxText(ctx, kind ? NAMES[kind] : "거울을 세울 자리", MC.x + 66, 24, { color: LX.ink });
    if (kind) lxPill(ctx, "노란 곳: 거울에 비치는 범위", LX.gold, false, 198);
  });

  f.say("건물에 가려 양옆에서 오는 차가 보이지 않아요. 길 건너편에 세울 <b>거울</b>을 골라 비치는 범위를 견줘 보세요.");
  api.setCTA("양쪽 차가 다 보이게 해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
