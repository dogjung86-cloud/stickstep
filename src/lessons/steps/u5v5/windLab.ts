// [중1 Ⅴ v5] u5l7 windLab: 「힘을 받으면 공의 움직임은 어떻게 변할까요?」
// 한 통찰: 힘을 받으면 물체의 속력이나 운동 방향이 변한다. 운동 방향과 나란한 힘은 속력을, 나란하지 않은 힘은 방향을 바꾼다.
// 실험: 굴러가는 공에 바람을 보낸다(운동 방향과 나란하게, 그리고 나란하지 않게). 위에서 내려다본 모습.
// 조작: 바람 버튼 셋을 꾹 누른다(뒤에서, 앞에서, 옆에서). 누르는 동안만 바람이 불고 속력과 지나간 길이 그 자리에서 변한다.
// 무대는 옛 windSoccer의 것(위에서 본 공, 지나간 자국, 바람 줄기, 힘 화살표)을 살렸다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { U5, u5Canvas, u5Frame, u5Hold, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
type Wind = "back" | "front" | "side";
const V0 = 1.6; // 처음 속력(px/프레임). 화면의 숫자는 이 값을 2.0으로 본다
const DIR: Record<Wind, [number, number]> = { back: [1, 0], front: [-1, 0], side: [0, 1] };

export const windLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 3, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  const ball = { x: 30, y: 100, vx: V0, vy: 0 };
  let trail: { x: number; y: number }[] = [];
  let wind: Wind | null = null;
  let finished = false;
  let resetAt = 0;
  const seen: Record<Wind, boolean> = { back: false, front: false, side: false };
  const log = u5Log([{ name: "뒤에서 불 때" }, { name: "앞에서 불 때" }, { name: "옆에서 불 때" }]);
  log.el.classList.add("tight");

  const restart = (): void => {
    ball.x = 24;
    ball.y = st.h() / 2 + 6;
    ball.vx = V0;
    ball.vy = 0;
    trail = [];
  };
  const mk = (k: Wind, text: string): HTMLButtonElement => {
    const b = u5Hold("u5x-wind", text, (v) => {
      if (finished) return;
      if (v) {
        wind = k;
        resetAt = 0;
        if (k !== "side" && Math.abs(ball.vy) > 0.2) restart();
      } else if (wind === k) wind = null;
    });
    b.dataset.k = k;
    return b;
  };
  const row = el("div", { class: "u5x-winds" }, mk("back", "뒤에서 →"), mk("front", "앞에서 ←"), mk("side", "옆에서 ↓"));
  f.slot.setControls(row, log.el);

  const count = (): number => Number(seen.back) + Number(seen.front) + Number(seen.side);
  const observe = (k: Wind): void => {
    if (seen[k]) return;
    seen[k] = true;
    haptic(HAPTIC.correct);
    log.set(k === "back" ? 0 : k === "front" ? 1 : 2, k === "back" ? "점점 빨라짐" : k === "front" ? "점점 느려짐" : "가는 방향이 휘어짐");
    f.pips(count());
    if (count() === 3) {
      finished = true;
      tm.later(() => {
        wind = null;
        f.say("바람이 운동 방향과 <b>나란하면</b> 속력이, <b>나란하지 않으면</b> 가는 방향이 변했어요.");
        tm.later(askFinal, 2200);
      }, 900);
    } else {
      const left = [!seen.back && "뒤에서", !seen.front && "앞에서", !seen.side && "옆에서"].filter(Boolean).join(", ");
      f.say(`기록했어요. 이번에는 <b>${left}</b> 바람을 꾹 눌러 보세요.`);
    }
  };

  function askFinal(): void {
    f.slot.ask(
      "굴러가던 공이 점점 느려지다가 멈췄어요. 공이 받은 힘의 방향은?",
      [{ t: "굴러가는 방향과 반대쪽", ok: true }, { t: "굴러가는 방향과 같은 쪽" }, { t: "힘을 받지 않았어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "<b>앞에서</b> 바람이 불 때 공이 느려졌어요. 힘이 없으면 속력은 그대로였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("힘을 받으면 물체의 <b>속력</b>이나 <b>운동 방향</b>이 변해요. 힘이 운동 방향과 나란하면 속력이, 나란하지 않으면 운동 방향이 변해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  let streak = 0;
  let started = false;
  st.run((ctx, w, h, t, dt) => {
    const mid = h / 2 + 6;
    if (!started) {
      started = true;
      restart();
    }
    // 바람의 힘
    if (wind) {
      const [dx, dy] = DIR[wind];
      ball.vx += dx * 0.02 * dt;
      ball.vy += dy * 0.02 * dt;
      if (wind === "front" && ball.vx < 0) ball.vx = 0;
      const sp = Math.hypot(ball.vx, ball.vy);
      if (wind === "back" && sp > V0 * 1.7) observe("back");
      if (wind === "front" && sp < V0 * 0.35) observe("front");
      if (wind === "side" && Math.abs(Math.atan2(ball.vy, ball.vx)) > 0.5) observe("side");
    } else if (!resetAt && (Math.abs(ball.vx - V0) > 0.05 || Math.abs(ball.vy) > 0.05)) resetAt = t + 1500;
    if (resetAt && t > resetAt && !wind) {
      resetAt = 0;
      restart();
    }
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x > w + 12 || ball.y > h + 12 || ball.x < -14) restart();
    if (!trail.length || Math.hypot(ball.x - trail[trail.length - 1].x, ball.y - trail[trail.length - 1].y) > 9) trail.push({ x: ball.x, y: ball.y });
    if (trail.length > 40) trail.shift();
    // 바닥의 기준선(처음 가던 길)
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = "rgba(232,238,249,.28)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    ctx.setLineDash([]);
    u5Text(ctx, "처음 가던 길", w - 14, mid - 12, { color: U5.dim, px: 12, align: "right" });
    // 바람 줄기
    if (wind) {
      const [dx, dy] = DIR[wind];
      streak += 4 * dt;
      ctx.strokeStyle = "rgba(160,205,255,.5)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let i = 0; i < 9; i++) {
        const bx = (i * 83 + (dx ? streak * dx : 0) + 2000 * w) % w;
        const by = 64 + ((i * 47 + (dy ? streak * dy : 0)) % (h - 80));
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + dx * 22, by + dy * 22);
        ctx.stroke();
      }
    }
    // 지나간 자국(간격이 넓을수록 빠르다)
    trail.forEach((p, i) => {
      ctx.fillStyle = `rgba(240,164,34,${0.15 + (i / trail.length) * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    });
    // 공
    const g = ctx.createRadialGradient(ball.x - 4, ball.y - 5, 1, ball.x, ball.y, 12);
    g.addColorStop(0, "#FFFFFF");
    g.addColorStop(0.6, "#D5E2F7");
    g.addColorStop(1, "#8FA8D2");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 12, 0, Math.PI * 2);
    ctx.fill();
    if (wind) {
      const [dx, dy] = DIR[wind];
      drawForceArrow(ctx, ball.x, ball.y, dx * 34, dy * 34, { color: U5.back, width: 4 });
      u5Text(ctx, "바람의 힘", ball.x + dx * 20 + (dy ? 40 : 0), ball.y + (dy ? 26 : -22), { color: "#FFB3B3", px: 12 });
    }
    const sp = Math.hypot(ball.vx, ball.vy);
    u5Read(ctx, w, ((sp / V0) * 2).toFixed(1), "m/s", "속력");
    u5Pill(ctx, wind === "back" ? "뒤에서 바람이 불어요" : wind === "front" ? (sp < 0.05 ? "공이 멈췄어요" : "앞에서 바람이 불어요") : wind === "side" ? "옆에서 바람이 불어요" : "바람 없음: 그대로 굴러가요", wind ? U5.back : U5.up);
  });

  f.say("위에서 본 모습이에요. 바람이 없으면 공은 <b>같은 속력</b>으로 곧게 가요. 바람 버튼을 <b>꾹</b> 눌러 보세요.");
  api.setCTA("세 방향에서 바람을 보내 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
