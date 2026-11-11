// [중1 Ⅴ v5] u5l1 arrowLab: 「힘을 화살표로 어떻게 나타낼까요?」
// 책의 어디에서: 힘의 효과(모양, 운동 상태)와 해 보기 '힘을 받은 물체 표현하기'.
// 한 통찰: 힘은 화살표로 나타낸다. 길이가 크기, 화살촉이 방향, 시작점이 힘이 작용하는 곳이다.
// 학생이 정하는 것: 화살표의 방향과 길이(모눈 한 칸이 10 N). 상자를 점선 자리까지 보내고, 찰흙을 점선 모양으로 누른다.
// 실패하는 길: 길이가 모자라면 못 미치고, 넘치면 지나치고, 방향이 틀리면 딴 쪽으로 간다(그 결과를 보여 준 뒤 제자리로 돌린다).
// 흐름: 상자를 오른쪽 점선으로 → 왼쪽 점선으로 → 찰흙을 점선 모양으로 → 판정 → 결론.
// 옛 랩(forceStudio)은 공을 마음대로 쏘는 놀이였다. 여기서는 목표에 맞는 힘을 화살표로 '주문'해야 한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawCrate, drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const C = 28; // 모눈 한 칸(px) = 10 N
const X0 = 19; // 0번 칸의 왼쪽 끝
const MISSIONS = [
  { from: 2, to: 5 }, // 오른쪽으로 3칸
  { from: 9, to: 5 }, // 왼쪽으로 4칸
];
const CLAY_NEED = 2; // 찰흙을 점선 모양으로 만드는 칸 수

export const arrowLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 3, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();
  const log = u5Log([{ name: "상자를 오른쪽 점선으로" }, { name: "상자를 왼쪽 점선으로" }, { name: "찰흙을 점선 모양으로" }]);
  f.slot.setControls(log.el);

  let m = 0; // 지금 임무(0, 1 상자 / 2 찰흙 / 3 끝)
  let drag: { x: number; y: number; n: number; dir: number } | null = null;
  let busy = false;
  let boxX = MISSIONS[0].from; // 상자의 칸(소수 허용: 움직이는 동안)
  let bad = 0; // 실패 표시(0~1로 사그라든다)
  let squash = 0; // 찰흙이 눌린 칸 수(움직이는 동안 소수)
  const kept: { col: number; n: number; dir: number }[] = []; // 성공한 화살표(무대에 남긴다)

  const GY = (h: number): number => h - 30;
  const cx = (col: number): number => X0 + col * C + C / 2;
  const says = [
    "상자에 손을 대고 <b>오른쪽</b>으로 끌어 화살표를 그려요. 모눈 한 칸이 <b>10 N</b>이에요. 상자를 점선 자리에 딱 맞게 보내요.",
    "이번에는 점선이 <b>왼쪽</b>에 있어요. 방향과 길이를 맞춰 화살표를 그려 보세요.",
    "찰흙 <b>위</b>에 손을 대고 <b>아래로</b> 끌어요. 찰흙이 점선 모양이 되게 눌러 보세요.",
  ];
  const setM = (n: number): void => {
    m = n;
    f.pips(n);
    if (n < 2) boxX = MISSIONS[n].from;
    if (n < 3) {
      f.say(says[n]);
      log.mark(n);
    }
  };
  const tween = (from: number, to: number, ms: number, set: (v: number) => void, done: () => void): void => {
    const t0 = performance.now();
    const tick = (): void => {
      const k = clamp((performance.now() - t0) / ms, 0, 1);
      set(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) tm.later(tick, 16);
      else done();
    };
    tick();
  };

  st.cv.addEventListener("pointerdown", (e) => {
    if (busy || m > 2) return;
    const p = st.pt(e);
    const ox = m === 2 ? st.w() / 2 : cx(boxX);
    const oy = m === 2 ? GY(st.h()) - 2 * C : GY(st.h()) - C / 2;
    if (Math.hypot(p.x - ox, p.y - oy) > 64) return;
    bvCapture(st.cv, e.pointerId);
    drag = { x: p.x, y: p.y, n: 0, dir: 1 };
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = st.pt(e);
    if (m === 2) {
      drag.n = clamp(Math.round((p.y - drag.y) / C), 0, 3);
    } else {
      const dx = p.x - drag.x;
      const n = clamp(Math.round(Math.abs(dx) / C), 0, 6);
      if (n !== drag.n) haptic(HAPTIC.tap);
      drag.n = n;
      drag.dir = dx >= 0 ? 1 : -1;
    }
  });
  const release = (): void => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.n < 1) return;
    busy = true;
    if (m === 2) {
      tween(0, d.n, 500, (v) => (squash = v), () => {
        if (d.n === CLAY_NEED) {
          haptic(HAPTIC.correct);
          log.set(2, "아래로 20 N", "모양이 변함");
          f.say("찰흙이 점선 모양이 됐어요. 손을 떼도 그대로예요. 힘이 <b>모양</b>을 바꿨어요.");
          tm.later(() => {
            setM(3);
            askFinal();
          }, 1500);
          return;
        }
        fail(d.n < CLAY_NEED ? "덜 눌렸어요. 화살표를 <b>더 길게</b> 그려 보세요." : "너무 납작해졌어요. 화살표를 <b>더 짧게</b> 그려 보세요.", () => (squash = 0));
      });
      return;
    }
    const ms = MISSIONS[m];
    const start = ms.from;
    const dest = clamp(start + d.dir * d.n, 0, 11);
    tween(start, dest, 420 + d.n * 90, (v) => (boxX = v), () => {
      if (dest === ms.to) {
        haptic(HAPTIC.correct);
        kept.push({ col: start, n: d.n, dir: d.dir });
        log.set(m, `${d.dir > 0 ? "오른쪽" : "왼쪽"}으로 ${d.n * 10} N`, `${d.n}칸 감`);
        const next = m + 1;
        tm.later(() => {
          busy = false;
          setM(next);
        }, 1000);
        return;
      }
      const want = ms.to - start;
      const wrongWay = Math.sign(want) !== d.dir;
      const gap = Math.abs(want) - d.n;
      fail(wrongWay ? "점선과 <b>반대쪽</b>으로 갔어요. 화살촉이 점선을 향하게 그려요." : gap > 0 ? `<b>${gap}칸</b> 모자라요. 화살표를 더 길게 그려 보세요.` : `<b>${-gap}칸</b> 지나쳤어요. 화살표를 더 짧게 그려 보세요.`, () => (boxX = start));
    });
  };
  const fail = (html: string, reset: () => void): void => {
    haptic(HAPTIC.wrong);
    bad = 1;
    f.say(html);
    tm.later(() => {
      reset();
      busy = false;
    }, 1100);
  };
  st.cv.addEventListener("pointerup", release);
  st.cv.addEventListener("pointercancel", release);

  function askFinal(): void {
    f.slot.ask(
      "같은 방향으로 화살표를 2배 길게 그렸어요. 무엇이 달라졌을까요?",
      [{ t: "힘의 크기가 2배가 됐어요", ok: true }, { t: "힘의 방향이 반대가 됐어요" }, { t: "힘이 작용하는 곳이 바뀌었어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "길이가 <b>힘의 크기</b>예요. 3칸은 30 N, 4칸은 40 N이었어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("힘은 물체의 <b>움직임</b>이나 <b>모양</b>을 바꿔요. 힘은 화살표로 나타내요. 시작점은 힘이 작용하는 곳, 길이는 크기, 촉은 방향이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    const gy = GY(h);
    bad = Math.max(0, bad - 0.02 * dt);
    // 모눈(한 칸 10 N)
    ctx.strokeStyle = "rgba(160,190,235,.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 12; i++) {
      const x = X0 + i * C;
      ctx.beginPath();
      ctx.moveTo(x, 62);
      ctx.lineTo(x, gy);
      ctx.stroke();
    }
    for (let y = gy; y >= 62; y -= C) {
      ctx.beginPath();
      ctx.moveTo(X0, y);
      ctx.lineTo(X0 + 12 * C, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(178,204,238,.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
    u5Text(ctx, "한 칸 = 10 N", w - 14, gy + 16, { color: U5.dim, px: 12, align: "right" });
    // 성공한 화살표는 흐리게 남는다(길이를 견주는 근거)
    kept.forEach((k, i) => {
      // 상자 임무 중에는 그린 자리에, 찰흙 임무부터는 위쪽에 나란히 올려 둔다(찰흙과 겹치지 않게)
      const ky = m >= 2 ? 92 + i * 30 : gy - C / 2;
      const x = cx(k.col) + (k.dir * C) / 2;
      ctx.strokeStyle = "rgba(201,219,245,.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx(k.col) - C / 2 + 2, ky - C / 2 + 2, C - 4, C - 4);
      drawForceArrow(ctx, x, ky, k.dir * k.n * C, 0, { color: U5.push, alpha: m >= 2 ? 0.75 : 0.38, width: 3.5 });
      u5Text(ctx, `${k.n * 10} N`, x + k.dir * (k.n * C + 24), ky, { color: U5.dim, px: 12 });
    });
    if (m < 2 || (m === 3 && squash === 0)) {
      const ms = MISSIONS[Math.min(m, 1)];
      // 점선 자리
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = U5.gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(cx(ms.to) - C / 2 + 2, gy - C + 2, C - 4, C - 4);
      ctx.setLineDash([]);
      const bx = cx(boxX);
      drawCrate(ctx, bx, gy, C - 2, C - 2, t, 0);
      if (bad > 0) {
        ctx.strokeStyle = `rgba(242,87,87,${bad})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(bx - C / 2, gy - C, C, C);
      }
      if (drag && drag.n > 0) {
        drawForceArrow(ctx, bx + (drag.dir * C) / 2, gy - C / 2, drag.dir * drag.n * C, 0, { color: U5.push, width: 5 });
        u5Read(ctx, w, String(drag.n * 10), "N", `${drag.dir > 0 ? "오른쪽" : "왼쪽"}으로 ${drag.n}칸`);
      } else if (!busy) {
        const pulse = 0.5 + 0.5 * Math.sin(t / 300);
        ctx.strokeStyle = `rgba(90,162,248,${0.35 + pulse * 0.45})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - C / 2 - 4 - pulse * 2, gy - C - 4 - pulse * 2, C + 8 + pulse * 4, C + 8 + pulse * 4);
      }
    } else {
      // 찰흙: 높이 2칸, 눌린 칸마다 반 칸씩 낮아지고 그만큼 넓어진다(부피는 그대로)
      const mid = w / 2;
      const draw = (n: number, dotted: boolean): void => {
        const hh = 2 * C - n * (C / 2);
        const ww = (2 * C * 2 * C) / hh;
        if (dotted) {
          ctx.setLineDash([5, 4]);
          ctx.strokeStyle = U5.gold;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(mid - ww / 2, gy - hh, ww, hh, 10);
          ctx.stroke();
          ctx.setLineDash([]);
          return;
        }
        const g = ctx.createLinearGradient(0, gy - hh, 0, gy);
        g.addColorStop(0, "#E9A77A");
        g.addColorStop(0.6, "#C97B4E");
        g.addColorStop(1, "#9A5630");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(mid - ww / 2, gy - hh, ww, hh, [Math.min(18, hh * 0.45), Math.min(18, hh * 0.45), 6, 6]);
        ctx.fill();
      };
      const live = drag ? drag.n : squash;
      draw(live, false);
      draw(CLAY_NEED, true);
      const top = gy - (2 * C - live * (C / 2));
      if (bad > 0) {
        ctx.fillStyle = `rgba(242,87,87,${bad * 0.35})`;
        ctx.fillRect(mid - 70, top, 140, gy - top);
      }
      if (drag && drag.n > 0) {
        drawForceArrow(ctx, mid, gy - 2 * C - drag.n * C, 0, drag.n * C, { color: U5.push, width: 5 });
        u5Read(ctx, w, String(drag.n * 10), "N", `아래로 ${drag.n}칸`);
      } else if (!busy && m === 2) {
        const pulse = 0.5 + 0.5 * Math.sin(t / 300);
        ctx.fillStyle = `rgba(90,162,248,${0.5 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(mid, gy - 2 * C - 10, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        u5Text(ctx, "여기서 아래로", mid, gy - 2 * C - 30, { color: U5.dim });
      }
    }
    u5Pill(ctx, m === 0 ? "오른쪽 점선까지" : m === 1 ? "왼쪽 점선까지" : m === 2 ? "점선 모양으로 누르기" : "그린 화살표 견주기", U5.push);
  });

  setM(0);
  api.setCTA("화살표를 그려 힘을 줘 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
