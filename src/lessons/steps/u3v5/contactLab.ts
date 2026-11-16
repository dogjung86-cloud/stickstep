// [중1 Ⅲ v5] u3l2 u3ContactLab: 「뜨거운 물과 찬물이 닿으면?」
// 한 통찰: 온도가 다른 두 물체가 닿으면 열은 온도가 높은 쪽에서 낮은 쪽으로 이동하고, 두 온도가 같아지면 멈춘다(열평형).
// 책의 탐구(열량계의 뜨거운 물에 찬물이 든 알루미늄 컵을 넣고 온도 센서로 두 온도를 잰다)를 한 무대에 옮겼다.
//   왼쪽: 열량계와 컵(두 물의 입자, 컵 벽을 건너는 굵은 '열' 화살 하나)
//   오른쪽: 시간과 온도 그래프 두 칸(위: 찬 컵을 넣었을 때, 아래: 뜨거운 컵을 넣었을 때)
// 2026-11-15 그래픽 감사 고침: 판정은 "두 번의 실험에서 열은 언제나 어느 쪽으로?"인데 무대에는 마지막 실험만 남았고, 선 색이 물의 이름이라
//   뜨거운 컵의 선이 파랑이었다. 이제 두 실험이 위아래 칸에 함께 남고, 칸마다 처음에 뜨거웠던 물의 선은 주황, 차가웠던 물의 선은 파랑이다
//   (책 그림 Ⅲ-2. 빨강은 오답 색이라 뜨거운 쪽은 주황으로). 선 끝에 '컵 속 물', '바깥 물' 이름, 처음 자리에 뜨거운 선에서 찬 선으로 가는 '열' 화살.
//   측정 중에는 컵 벽을 건너는 굵은 '열' 화살 하나를 무대에서 가장 크게 그린다(책 그림 Ⅲ-3).
//   칸에는 그 칸의 마지막 '센' 실험(뚜껑을 닫고 온도 차이가 20℃ 넘는 실험)이 남는다. 세지 않는 실험은 컵을 꺼낼 때까지만 보인다.
// 학생이 정하는 것: 컵 속 물의 온도, 그리고 실험의 차례(컵 넣기 → 뚜껑 닫기 → 측정 시작).
//   컵이 바깥 물보다 차가울 때와 뜨거울 때를 한 번씩 넣어 보면 열의 방향이 뒤집힌다.
// 실패하는 길: 뚜껑을 닫지 않고 측정하면 열이 공기 중으로 빠져나가 두 온도가 만난 뒤에도 계속 내려간다(그 실험은 세지 않는다).
//   컵과 바깥 물의 온도가 거의 같으면 열이 이동하지 않는다.
// 흐름: 찬 컵 실험 → (예측) → 뜨거운 컵 실험 → 판정 → 결론. 순서는 학생이 바꿔도 된다.
// 셈: 바깥 물이 컵 속 물의 두 배라고 두었다. 같아지는 온도 = (2 × 바깥 + 컵) ÷ 3.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { tempColor, drawGlowParticle, makeParticles, stepFree, type Box, type FreeParticle } from "../../../ui/thermo";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { u3Frame, u3Canvas, water, pill, txt, rr, SUB, HOT, COLD, type Ctx } from "./kit";

interface ContactStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

const OUT0 = 60; // 바깥 물의 처음 온도
const TAU = 62; // 온도 차가 줄어드는 빠르기(프레임)
const RUN = 230; // 한 번의 실험 길이(프레임)
const ROOM = 20; // 방 온도
const LIFT = 74; // 넣기 전 컵이 떠 있는 높이
const HEAT = "#FFD666"; // '열' 화살의 색
const speedOf = (T: number): number => 0.16 + Math.pow(T / 100, 1.5) * 2.6;

type PanelKey = "cold" | "hot";
interface Run {
  cupHot: boolean; // 컵 속 물이 바깥 물보다 뜨거웠다
  equal: boolean; // 두 물의 온도가 거의 같았다
  leaky: boolean;
  fin: number;
  cup: [number, number][];
  out: [number, number][];
  done: boolean;
}
// 그래프 두 칸(설계 좌표). 세로는 0~100℃.
const PANEL: Record<PanelKey, { title: string; x0: number; x1: number; y0: number; y1: number; ty: number }> = {
  cold: { title: "찬물 컵을 넣었을 때", x0: 224, x1: 334, y0: 26, y1: 104, ty: 13 },
  hot: { title: "뜨거운 물 컵을 넣었을 때", x0: 224, x1: 334, y0: 132, y1: 210, ty: 120 },
};

export const contactLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ContactStep;
  const tm = bvTimers();
  const f = u3Frame(host, { title: s.title, steps: 3, cls: "u3x-contact", api, tall: true });

  let cup0 = 10; // 넣기 전 컵 속 물의 온도(막대)
  let inserted = false;
  let lift = 1; // 1: 컵이 열량계 위에 있다, 0: 들어갔다
  let t = 0; // 넣은 뒤 흐른 시간(프레임)
  let run0 = { cup: cup0, fin: 0 };
  let settled = false;
  let lid = false; // 열량계의 뚜껑
  let measuring = false; // 측정 시작을 눌렀는가
  let leaky = false; // 뚜껑 없이 측정한 실험
  let coldDone = false;
  let hotDone = false;
  let predicted = false;
  let phase: "play" | "ask" | "done" = "play";
  // 칸마다 보이는 실험(shown)과 남겨 둔 '센' 실험(kept)
  const shown: Record<PanelKey, Run | null> = { cold: null, hot: null };
  const kept: Record<PanelKey, Run | null> = { cold: null, hot: null };
  let live: Run | null = null;

  const finOf = (c: number): number => (2 * OUT0 + c) / 3;
  const tempsAt = (tt: number): { out: number; cup: number } => {
    const k = Math.exp(-tt / TAU);
    // 뚜껑이 없으면 두 물 모두 방 온도(20℃) 쪽으로 식어 간다
    const leak = (v: number): number => (leaky ? ROOM + (v - ROOM) * Math.exp(-tt / 260) : v);
    return { out: leak(run0.fin + (OUT0 - run0.fin) * k), cup: leak(run0.fin + (run0.cup - run0.fin) * k) };
  };

  // 입자: 바깥 물은 컵 양옆 두 칸, 컵 속은 한 칸
  const boxL: Box = { x: 27, y: 124, w: 30, h: 78 };
  const boxR: Box = { x: 123, y: 124, w: 30, h: 78 };
  const psL = makeParticles(7, boxL);
  const psR = makeParticles(7, boxR);
  const psC: FreeParticle[] = makeParticles(8, { x: 71, y: 126, w: 38, h: 56 });

  /** 굵은 화살(몸통 + 머리). dir +1이면 오른쪽, -1이면 왼쪽. 몸통 가운데에 '열'. */
  function heatArrow(ctx: Ctx, xFrom: number, xTo: number, y: number, half: number, alpha: number): void {
    const dir = xTo > xFrom ? 1 : -1;
    const head = 15;
    const hx = xTo - dir * head;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(255,214,102,.75)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(xFrom, y - half);
    ctx.lineTo(hx, y - half);
    ctx.lineTo(hx, y - half - 7);
    ctx.lineTo(xTo, y);
    ctx.lineTo(hx, y + half + 7);
    ctx.lineTo(hx, y + half);
    ctx.lineTo(xFrom, y + half);
    ctx.closePath();
    ctx.fillStyle = HEAT;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#8A5A00";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
    txt(ctx, "열", (xFrom + hx) / 2, y + 0.5, { size: 13, color: "#3A2600", weight: 800 });
    ctx.restore();
  }

  function drawScene(ctx: Ctx, dt: number, tMs: number, out: number, cup: number): void {
    const dy = -LIFT * lift;
    // 열량계: 두꺼운 단열 벽
    rr(ctx, 12, 102, 156, 112, 12);
    ctx.fillStyle = "#33415C";
    ctx.fill();
    rr(ctx, 22, 106, 136, 102, 7);
    ctx.fillStyle = "#0E1A2E";
    ctx.fill();
    water(ctx, 22, 116, 136, 208, tempColor(out / 100, 0.2), tempColor(out / 100, 0.8), 6);
    stepFree(psL, boxL, dt, speedOf(out), 13);
    stepFree(psR, boxR, dt, speedOf(out), 13);
    for (const p of [...psL, ...psR]) drawGlowParticle(ctx, p.x, p.y, 4, out / 100, 1.8);
    // 컵(알루미늄)
    const cx = 64;
    const cy = 110 + dy;
    rr(ctx, cx, cy, 52, 80, 6);
    ctx.fillStyle = "#101C30";
    ctx.fill();
    water(ctx, cx + 3, cy + 10, 46, cy + 77, tempColor(cup / 100, 0.22), tempColor(cup / 100, 0.8), 4);
    const boxC: Box = { x: cx + 7, y: cy + 16, w: 38, h: 56 };
    for (const p of psC) {
      // 컵이 움직이면 입자도 함께 옮긴다
      p.y += boxC.y - lastCupY;
      p.py += boxC.y - lastCupY;
    }
    lastCupY = boxC.y;
    stepFree(psC, boxC, dt, speedOf(cup), 12);
    for (const p of psC) drawGlowParticle(ctx, p.x, p.y, 4, cup / 100, 1.8);
    ctx.strokeStyle = "#C9D3E0";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 2);
    ctx.lineTo(cx, cy + 2);
    ctx.lineTo(cx, cy + 76);
    ctx.quadraticCurveTo(cx, cy + 80, cx + 5, cy + 80);
    ctx.lineTo(cx + 47, cy + 80);
    ctx.quadraticCurveTo(cx + 52, cy + 80, cx + 52, cy + 76);
    ctx.lineTo(cx + 52, cy + 2);
    ctx.lineTo(cx + 55, cy - 2);
    ctx.stroke();
    // 열 화살 하나: 컵의 오른쪽 벽을 건넌다(온도가 높은 물에서 낮은 물로). 온도 차가 클수록 굵고 진하다. 무대에서 가장 크다.
    const diff = out - cup;
    if (measuring && lift < 0.05 && Math.abs(diff) > 1.5) {
      const into = diff > 0; // 바깥 물에서 컵 속 물로
      const a = Math.min(1, Math.abs(diff) / 22);
      const sl = Math.sin(tMs / 260) * 2.5;
      const y = cy + 42;
      if (into) heatArrow(ctx, 156 + sl, 88 + sl, y, 6 + 3 * a, 0.55 + 0.45 * a);
      else heatArrow(ctx, 88 - sl, 156 - sl, y, 6 + 3 * a, 0.55 + 0.45 * a);
    }
    // 뚜껑: 닫으면 덮개가 놓이고, 연 채로 측정하면 열이 위로 빠져나간다
    if (lid) {
      rr(ctx, 6, 94, 168, 13, 5);
      ctx.fillStyle = "#6B7C96";
      ctx.fill();
      txt(ctx, "뚜껑", 150, 84, { size: 12, color: SUB, weight: 600 });
    } else if (measuring && leaky && !settled) {
      ctx.strokeStyle = "rgba(255,150,70,.8)";
      ctx.lineWidth = 2;
      for (const x of [34, 48, 132, 146]) {
        const ph = tMs / 220 + x;
        ctx.beginPath();
        ctx.moveTo(x, 104);
        ctx.quadraticCurveTo(x + 5 * Math.sin(ph), 92, x, 80);
        ctx.stroke();
      }
    }
    pill(ctx, `컵 ${Math.round(cup)}℃`, 50, 15, { size: 12, dot: tempColor(cup / 100) });
    pill(ctx, `바깥 ${Math.round(out)}℃`, 128, 15, { size: 12, dot: tempColor(out / 100) });
  }
  let lastCupY = 110 - LIFT + 16;
  psC.forEach((p) => {
    p.y -= LIFT;
    p.py -= LIFT;
  });

  // ── 그래프 두 칸 ──
  function drawPanel(ctx: Ctx, key: PanelKey): void {
    const P = PANEL[key];
    const px = (tt: number): number => P.x0 + (Math.min(tt, RUN) / RUN) * (P.x1 - P.x0);
    const py = (v: number): number => P.y1 - (v / 100) * (P.y1 - P.y0);
    txt(ctx, P.title, 204, P.ty, { size: 12, color: "#C9D5E8", align: "left", weight: 700 });
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(P.x0, py(50));
    ctx.lineTo(P.x1, py(50));
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(P.x0, P.y0 - 2);
    ctx.lineTo(P.x0, P.y1);
    ctx.lineTo(P.x1 + 4, P.y1);
    ctx.stroke();
    txt(ctx, "100", P.x0 - 4, py(100), { size: 12, color: SUB, align: "right", weight: 600 });
    txt(ctx, "0", P.x0 - 4, py(0), { size: 12, color: SUB, align: "right", weight: 600 });
    const r = shown[key];
    if (!r) {
      txt(ctx, "실험 전", (P.x0 + P.x1) / 2, (P.y0 + P.y1) / 2, { size: 12, color: SUB, weight: 600 });
      return;
    }
    const cupC = r.equal ? SUB : r.cupHot ? HOT : COLD;
    const outC = r.equal ? SUB : r.cupHot ? COLD : HOT;
    if (r.done && !r.leaky) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(232,238,249,.45)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(P.x0, py(r.fin));
      ctx.lineTo(P.x1, py(r.fin));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const line = (pts: [number, number][], color: string): void => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      pts.forEach(([tt, v], i) => (i ? ctx.lineTo(px(tt), py(v)) : ctx.moveTo(px(tt), py(v))));
      ctx.stroke();
    };
    // 찬 선을 먼저, 뜨거운 선을 위에
    if (r.cupHot) {
      line(r.out, outC);
      line(r.cup, cupC);
    } else {
      line(r.cup, cupC);
      line(r.out, outC);
    }
    // 처음 자리의 '열' 화살: 뜨거운 선에서 찬 선으로(그래프에서 늘 위에서 아래로)
    if (!r.equal && r.cup.length > 1) {
      const hi = Math.max(r.cup[0][1], r.out[0][1]);
      const lo = Math.min(r.cup[0][1], r.out[0][1]);
      const x = P.x0 + 9;
      const y0 = py(hi) + 5;
      const y1 = py(lo) - 4;
      if (y1 - y0 > 8) {
        ctx.strokeStyle = HEAT;
        ctx.fillStyle = HEAT;
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1 - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y1 + 1);
        ctx.lineTo(x - 5, y1 - 6);
        ctx.lineTo(x + 5, y1 - 6);
        ctx.closePath();
        ctx.fill();
        const ly = (y0 + y1) / 2;
        rr(ctx, x + 5, ly - 9, 17, 18, 6);
        ctx.fillStyle = "rgba(11,21,36,.9)";
        ctx.fill();
        txt(ctx, "열", x + 13.5, ly + 0.5, { size: 12.5, color: HEAT, weight: 800 });
      }
    }
    // 글이 길어져(계속 내려가요 → 열이 새어 계속 식어요) 12px로 줄이고 가운데를 283으로 옮겼다. 폭 약 100px(한글이 1em인 글꼴이면 약 117px):
    // 축(224)과 무대 끝(346) 사이에 든다
    if (r.done && r.leaky) txt(ctx, "열이 새어 계속 식어요", (P.x0 + P.x1) / 2 + 4, P.y1 - 10, { size: 12, color: "#FF8F8F", weight: 800 });
    if (r.done && !r.leaky && !r.equal) {
      // 선 끝의 이름: 위에서 내려온 선(처음에 뜨거웠던 물)은 끝 위에, 아래에서 올라온 선은 끝 아래에
      const yEnd = py(r.fin);
      const hotName = r.cupHot ? "컵 속 물" : "바깥 물";
      const coldName = r.cupHot ? "바깥 물" : "컵 속 물";
      txt(ctx, hotName, P.x1, yEnd - 11, { size: 12, color: HOT, align: "right", weight: 800 });
      txt(ctx, coldName, P.x1, yEnd + 12, { size: 12, color: COLD, align: "right", weight: 800 });
    }
  }

  const cv = u3Canvas(f.stage, (ctx, dt, tMs) => {
    host.dataset.u3Phase = phase;
    host.dataset.u3Settled = settled ? (leaky ? "leak" : "1") : "0";
    host.dataset.u3Panels = `${kept.cold ? 1 : 0}${kept.hot ? 1 : 0}`;
    const target = inserted ? 0 : 1;
    lift += (target - lift) * Math.min(1, 0.16 * dt);
    if (Math.abs(target - lift) < 0.004) lift = target;
    let out = OUT0;
    let cup = cup0;
    if (inserted) {
      if (measuring && lift < 0.2 && !settled) {
        t = Math.min(RUN, t + dt);
        const v = tempsAt(t);
        if (live) {
          live.out.push([t, v.out]);
          live.cup.push([t, v.cup]);
        }
        if (t >= RUN) onSettled();
      }
      const v = measuring ? tempsAt(t) : { out: OUT0, cup: cup0 };
      out = v.out;
      cup = v.cup;
    }
    drawScene(ctx, dt, tMs, out, cup);
    drawPanel(ctx, "cold");
    drawPanel(ctx, "hot");
    txt(ctx, "시간", PANEL.hot.x1 + 4, 222, { size: 12, color: SUB, align: "right", weight: 600 });
  });

  const range = bvRange({
    cls: "u3x-range",
    min: 5,
    max: 95,
    value: cup0,
    label: "컵 속 물의 온도",
    ticks: [{ t: "5℃", p: 0 }, { t: "바깥 물(60℃)", p: 61 }, { t: "95℃", p: 100 }],
    onInput: (v) => {
      cup0 = v;
      hint();
    },
  });
  const put = bvBtn("", "컵 넣기");
  const lidBtn = bvBtn("", "뚜껑 닫기");
  const btn = bvBtn("main", "측정 시작");
  const row = el("div", { class: "u3x-row" }, put, lidBtn);
  const sync = (): void => {
    put.textContent = inserted ? "컵 꺼내기" : "컵 넣기";
    put.disabled = measuring && !settled;
    lidBtn.textContent = lid ? "뚜껑 열기" : "뚜껑 닫기";
    lidBtn.classList.toggle("on", lid);
    lidBtn.disabled = !inserted || measuring;
    btn.disabled = !inserted || measuring;
    range.input.disabled = inserted;
  };

  function hint(): void {
    if (phase !== "play" || inserted) return;
    if (!coldDone && !hotDone) f.say("<b>60℃ 물</b>이 담긴 열량계예요. 컵 속 물의 온도를 정해 열량계에 넣고, 뚜껑을 닫은 뒤 측정을 시작해 보세요.");
    else if (coldDone && !hotDone) f.say(cup0 >= 80 ? "좋아요! 이제 컵을 넣고 뚜껑을 닫은 뒤 측정을 시작해 보세요." : "이번에는 온도 막대를 오른쪽으로 밀어 컵 속 물을 <b>바깥 물보다 뜨겁게</b>(80℃ 이상) 맞춰 보세요.");
    else if (!coldDone && hotDone) f.say(cup0 <= 40 ? "좋아요! 이제 컵을 넣고 뚜껑을 닫은 뒤 측정을 시작해 보세요." : "이번에는 온도 막대를 왼쪽으로 밀어 컵 속 물을 <b>바깥 물보다 차갑게</b>(40℃ 이하) 맞춰 보세요.");
  }

  function onSettled(): void {
    settled = true;
    if (live) live.done = true;
    if (leaky) {
      haptic(HAPTIC.wrong);
      f.say("뚜껑이 열려 있어서 열이 <b>바깥 공기로</b> 빠져나갔어요! 두 온도가 같아진 뒤에도 계속 식네요. 컵을 꺼내고 뚜껑을 닫아 다시 측정해 보세요.");
      sync();
      return;
    }
    t = 1e6; // 두 온도를 같아진 값에 딱 맞춘다
    if (live) {
      live.out.push([RUN, run0.fin]);
      live.cup.push([RUN, run0.fin]);
    }
    haptic(HAPTIC.ctaUnlock);
    const fin = Math.round(run0.fin);
    const d = run0.cup - OUT0;
    if (Math.abs(d) < 1.5) f.say("두 물의 온도가 같아서 열이 이동하지 않았어요. 컵을 꺼낸 뒤 온도 차이를 크게 벌려 다시 해 보세요.");
    else if (d <= -20) {
      coldDone = true;
      kept.cold = live;
      f.say(`열이 <b>바깥 물에서 컵 속 물로</b> 이동했어요! 바깥 물은 식고 컵 속 물은 데워져 두 온도가 <b>${fin}℃</b>에서 같아졌어요.`);
    } else if (d >= 20) {
      hotDone = true;
      kept.hot = live;
      f.say(`열이 <b>컵 속 물에서 바깥 물로</b> 이동했어요! 컵 속 물은 식고 바깥 물은 데워져 두 온도가 <b>${fin}℃</b>에서 같아졌어요.`);
    } else f.say(`두 온도가 <b>${fin}℃</b>에서 같아졌지만, 처음 온도 차이가 작아서 변화가 잘 보이지 않네요. 컵을 꺼내 온도 차이를 더 크게 해 보세요.`);
    f.pips((coldDone ? 1 : 0) + (hotDone ? 1 : 0));
    sync();
    if (coldDone && hotDone) {
      put.disabled = true;
      tm.later(askFinal, 2600);
    }
  }

  function takeOut(): void {
    inserted = false;
    settled = false;
    measuring = false;
    lid = false;
    t = 0;
    live = null;
    // 세지 않은 실험은 꺼내면 걷고, 그 칸에 남겨 둔 실험을 다시 보인다
    shown.cold = kept.cold;
    shown.hot = kept.hot;
    sync();
    if ((coldDone || hotDone) && !predicted) {
      predicted = true;
      const toHot = coldDone;
      if (toHot) {
        cup0 = 90;
        range.set(90);
      } else {
        cup0 = 10;
        range.set(10);
      }
      f.say("바깥 물을 새로운 60℃ 물로 바꿨어요. 두 번째 실험을 하기 전에 먼저 <b>예측</b>해 볼까요?");
      f.slot.ask(
        toHot ? "이번에 넣을 컵 속 물은 바깥 물보다 <b>더 뜨거워요</b>. 열은 어느 쪽으로 이동할까요?" : "이번에 넣을 컵 속 물은 바깥 물보다 <b>더 차가워요</b>. 열은 어느 쪽으로 이동할까요?",
        [{ t: "컵 속 물에서 바깥 물로" }, { t: "바깥 물에서 컵 속 물로" }],
        () => undefined,
        {
          predict: true,
          onNext: () => {
            f.slot.showControls();
            hint();
            api.setCTA("실험으로 예측을 확인해 보세요", { enabled: false });
          },
        },
      );
    } else hint();
  }

  put.addEventListener("click", () => {
    if (phase !== "play" || (measuring && !settled)) return;
    haptic(HAPTIC.tap);
    if (inserted) {
      takeOut();
      return;
    }
    inserted = true;
    sync();
    f.say("컵을 넣었어요. 열이 밖으로 새지 않도록 <b>뚜껑 닫기</b>를 누른 뒤 <b>측정 시작</b>을 눌러 보세요.");
  });
  lidBtn.addEventListener("click", () => {
    if (phase !== "play" || !inserted || measuring) return;
    haptic(HAPTIC.tap);
    lid = !lid;
    sync();
  });
  btn.addEventListener("click", () => {
    if (phase !== "play" || !inserted || measuring) return;
    haptic(HAPTIC.tap);
    measuring = true;
    leaky = !lid;
    settled = false;
    t = 0;
    run0 = { cup: cup0, fin: finOf(cup0) };
    const d = cup0 - OUT0;
    live = { cupHot: d > 0, equal: Math.abs(d) < 1.5, leaky, fin: run0.fin, cup: [[0, cup0]], out: [[0, OUT0]], done: false };
    shown[d > 0 ? "hot" : "cold"] = live;
    sync();
    f.say("측정이 시작되었어요! 컵 벽을 통과하는 <b>열의 이동 화살표</b>와 온도 변화 그래프를 살펴보세요.");
  });

  function askFinal(): void {
    phase = "ask";
    shown.cold = kept.cold;
    shown.hot = kept.hot;
    f.say("찬물 컵과 뜨거운 물 컵을 넣었을 때의 두 그래프가 완성되었어요! 두 결과를 비교해 보고 답해 보세요.");
    f.slot.ask(
      "두 실험에서 열은 항상 어느 쪽으로 이동했나요?",
      [{ t: "온도가 높은 물에서 낮은 물로", ok: true }, { t: "항상 바깥 물에서 컵 속 물로" }, { t: "항상 컵 속 물에서 바깥 물로" }],
      (ok) => api.recordQuiz(ok),
      { why: "컵 속 물이 차가울 때는 <b>바깥 물에서 컵 속으로</b>, 뜨거울 때는 <b>컵 속에서 바깥 물로</b> 열이 이동했어요.", onNext: finish },
    );
  }

  function finish(): void {
    phase = "done";
    f.pips(3);
    f.say("온도가 다른 두 물이 만날 때 열이 어떻게 이동하는지 밝혀냈어요!");
    f.slot.conclude("열은 항상 <b>온도가 높은 물체에서 낮은 물체로</b> 이동해요. 두 물체의 온도가 같아지면 열의 이동이 멈추는데, 이 상태를 <b>열평형</b>이라고 해요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(range.el, row, btn);
  sync();
  hint();
  api.setCTA("찬 컵과 뜨거운 컵으로 실험해 보세요", { enabled: false });
  return () => {
    tm.clear();
    cv.stop();
  };
};
