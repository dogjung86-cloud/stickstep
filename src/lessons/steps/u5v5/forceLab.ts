// [중1 Ⅴ v5] u5l1 forceLab: 「힘을 화살표로 어떻게 나타낼까요?」
// 한 통찰: 힘은 화살표 하나로 나타낸다. 길게 그리면 센 힘, 촉이 향하는 쪽이 힘의 방향, 시작점이 힘이 작용하는 곳.
// 조작: 물체에서 끌어 화살표를 그리고 손을 뗀다. 공은 그 힘만큼 굴러가고(움직임의 변화), 찰흙은 그만큼 눌린다(모양의 변화).
// 흐름: 살살 밀기 → 세게 밀기 → 반대쪽으로 밀기 → 찰흙 누르기 → 판정 → 결론. 그린 화살표는 무대에 흐리게 남아 길이를 견줄 수 있다.
// 무대는 옛 forceStudio의 것(공, 찰흙, 힘 화살표)을 살렸고 틀과 흐름을 고쳤다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Floor, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const MAXL = 120; // 화살표의 가장 긴 길이(px)
const MAXN = 30; // 그때의 힘(N)
const toN = (len: number): number => Math.round((len / MAXL) * MAXN);

export const forceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();
  const log = u5Log([{ name: "살살 밀기" }, { name: "세게 밀기" }, { name: "반대쪽으로 밀기" }, { name: "찰흙 누르기" }]);
  f.slot.setControls(log.el);

  let phase = 0; // 0 살살, 1 세게, 2 반대쪽, 3 찰흙, 4 끝
  let drag: { len: number; dir: number } | null = null; // 공: dir ±1, 찰흙: 아래로
  let busy = false;
  const ghosts: { len: number; dir: number; row: number }[] = [];
  const ball = { x: 70, v: 0, home: 70, spin: 0, from: 70 };
  let squash = 0; // 찰흙이 눌린 정도 0~1
  let squashTo = 0;

  const GY = (h: number): number => h - 40;
  const R = 17;
  const says = [
    "<b>공</b>에 손을 대고 오른쪽으로 <b>짧게</b> 끌었다 놓아요. 끈 만큼 화살표가 그려져요.",
    "이번에는 오른쪽으로 <b>길게</b> 끌어 보세요. 공이 어디까지 가는지 견줘 봐요.",
    "이제 <b>왼쪽</b>으로 끌어 보세요. 화살촉이 향하는 쪽을 잘 봐요.",
    "<b>찰흙</b> 위에 손을 대고 <b>아래로</b> 끌어 눌러 보세요. 이번에는 무엇이 변할까요?",
  ];
  const setPhase = (p: number): void => {
    phase = p;
    f.pips(p);
    if (p < 4) {
      f.say(says[p]);
      log.mark(p);
    }
    if (p === 2) {
      ball.home = st.w() - 70;
      ball.x = ball.home;
    }
  };

  st.cv.addEventListener("pointerdown", (e) => {
    if (busy || phase > 3) return;
    const p = st.pt(e);
    const w = st.w();
    const h = st.h();
    const ox = phase === 3 ? w / 2 : ball.x;
    const oy = phase === 3 ? GY(h) - 70 : GY(h) - R;
    if (Math.hypot(p.x - ox, p.y - oy) > 70) return;
    bvCapture(st.cv, e.pointerId);
    drag = { len: 0, dir: 1 };
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = st.pt(e);
    if (phase === 3) {
      drag.len = clamp(p.y - (GY(st.h()) - 70), 0, 56);
    } else {
      const dx = p.x - ball.x;
      drag.dir = dx >= 0 ? 1 : -1;
      drag.len = clamp(Math.abs(dx), 0, MAXL);
    }
  });
  const release = (): void => {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (phase === 3) {
      if (d.len < 20) {
        f.say("조금 더 <b>아래로</b> 끌어 눌러 보세요.");
        return;
      }
      busy = true;
      squashTo = d.len / 56;
      haptic(HAPTIC.correct);
      log.set(3, "모양이 변했어요", "납작해짐");
      f.say("찰흙이 납작해졌어요. 손을 떼도 그대로예요. 힘이 <b>모양</b>을 바꿨어요.");
      tm.later(() => {
        setPhase(4);
        askFinal();
      }, 1500);
      return;
    }
    const n = toN(d.len);
    if (n < 3) return;
    const need = phase === 0 ? d.dir > 0 && n <= 12 : phase === 1 ? d.dir > 0 && n >= 20 : d.dir < 0;
    if (!need) {
      f.say(phase === 0 ? "너무 세요. 더 <b>짧게</b> 끌어 살살 밀어 보세요." : phase === 1 ? "더 <b>길게</b> 끌어 세게 밀어 보세요." : "이번에는 <b>왼쪽</b>으로 끌어 보세요.");
      haptic(HAPTIC.wrong);
      return;
    }
    busy = true;
    ghosts.push({ len: d.len, dir: d.dir, row: phase });
    ball.from = ball.x;
    ball.v = n * 0.2 * d.dir;
    const row = phase;
    const wait = (): void => {
      if (Math.abs(ball.v) > 0.02) {
        tm.later(wait, 120);
        return;
      }
      const dist = Math.round(Math.abs(ball.x - ball.from));
      log.set(row, `${n} N`, row === 2 ? "왼쪽으로 굴러감" : dist > 60 ? "멀리 굴러감" : "조금 굴러감");
      haptic(HAPTIC.correct);
      tm.later(() => {
        ball.x = ball.home;
        busy = false;
        setPhase(row + 1);
      }, 900);
    };
    tm.later(wait, 200);
  };
  st.cv.addEventListener("pointerup", release);
  st.cv.addEventListener("pointercancel", release);

  function askFinal(): void {
    f.say("그린 화살표 세 개를 견줘 보세요. 길이가 서로 달라요.");
    f.slot.ask(
      "화살표를 길게 그리면 공이 더 멀리 갔어요. 화살표의 길이는 무엇을 나타낼까요?",
      [{ t: "힘의 크기", ok: true }, { t: "힘의 방향" }, { t: "힘이 작용하는 곳" }],
      (ok) => api.recordQuiz(ok),
      { why: "길게 그릴수록 <b>센 힘</b>이었어요. 방향은 화살촉이 알려 줘요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("힘은 물체의 <b>움직임</b>이나 <b>모양</b>을 바꿔요. 힘은 화살표로 나타내요. 시작점은 힘이 작용하는 곳, 길이는 크기, 촉은 방향이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    const gy = GY(h);
    u5Floor(ctx, w, gy, h);
    // 지나간 화살표(흐리게, 위에서부터 차례로)
    ghosts.forEach((g, i) => {
      const y = 76 + i * 22;
      const x0 = g.dir > 0 ? 40 : w - 40;
      drawForceArrow(ctx, x0, y, g.len * g.dir, 0, { color: U5.push, alpha: 0.55, width: 3 });
      u5Text(ctx, `${toN(g.len)} N`, x0 + (g.len + 26) * g.dir, y, { color: U5.dim, px: 12 });
    });
    if (phase <= 2) {
      // 공
      if (Math.abs(ball.v) > 0.02) {
        ball.x += ball.v * dt;
        ball.spin += (ball.v * dt) / R;
        ball.v -= Math.sign(ball.v) * Math.min(Math.abs(ball.v), 0.13 * dt);
        if (ball.x < R + 4 || ball.x > w - R - 4) {
          ball.x = clamp(ball.x, R + 4, w - R - 4);
          ball.v = 0;
        }
      }
      const by = gy - R;
      ctx.fillStyle = "rgba(42,58,94,.5)";
      ctx.beginPath();
      ctx.ellipse(ball.x, gy + 3, R * 0.9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(ball.x - 6, by - 7, 2, ball.x, by, R);
      g.addColorStop(0, "#FFFFFF");
      g.addColorStop(0.55, "#C9DBF5");
      g.addColorStop(1, "#7E9BCB");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ball.x, by, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,86,130,.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ball.x, by, R * 0.55, ball.spin, ball.spin + 2.2);
      ctx.stroke();
      if (drag && drag.len > 4) {
        drawForceArrow(ctx, ball.x, by, drag.len * drag.dir, 0, { color: U5.push, width: 5 });
        u5Read(ctx, w, String(toN(drag.len)), "N", "힘의 크기");
      } else if (!busy) {
        const pulse = 0.5 + 0.5 * Math.sin(t / 300);
        ctx.strokeStyle = `rgba(90,162,248,${0.35 + pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, by, R + 6 + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      u5Pill(ctx, phase === 2 ? "왼쪽으로 밀기" : phase === 0 ? "살살 밀기" : "세게 밀기", U5.push);
    } else {
      // 찰흙: 눌린 만큼 낮고 넓어진다(부피는 그대로)
      squash += (squashTo - squash) * Math.min(1, 0.18 * dt);
      const live = drag ? drag.len / 56 : squash;
      const k = 1 - live * 0.55;
      const cw = 84 / Math.sqrt(k);
      const chh = 54 * k;
      const cx = w / 2;
      ctx.fillStyle = "rgba(42,58,94,.5)";
      ctx.beginPath();
      ctx.ellipse(cx, gy + 3, cw * 0.56, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createLinearGradient(0, gy - chh, 0, gy);
      g.addColorStop(0, "#E9A77A");
      g.addColorStop(0.6, "#C97B4E");
      g.addColorStop(1, "#9A5630");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(cx - cw / 2, gy - chh, cw, chh, [Math.min(26, chh * 0.6), Math.min(26, chh * 0.6), 8, 8]);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - cw / 2 + 14, gy - chh + 5);
      ctx.lineTo(cx - 4, gy - chh + 5);
      ctx.stroke();
      if (drag && drag.len > 4) {
        drawForceArrow(ctx, cx, gy - 70, 0, drag.len, { color: U5.push, width: 5 });
        u5Read(ctx, w, String(toN(drag.len * (MAXL / 56))), "N", "힘의 크기");
      } else if (!busy && phase === 3) {
        const pulse = 0.5 + 0.5 * Math.sin(t / 300);
        ctx.fillStyle = `rgba(90,162,248,${0.5 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(cx, gy - 70, 6 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        u5Text(ctx, "여기서 아래로", cx, gy - 90, { color: U5.dim });
      }
      u5Pill(ctx, squash > 0.2 ? "모양이 변했어요" : "찰흙 누르기", U5.gold);
    }
  });

  setPhase(0);
  api.setCTA("화살표를 그려 힘을 줘 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
