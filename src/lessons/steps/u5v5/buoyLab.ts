// [중1 Ⅴ v5] u5l6 buoyLab: 「물에 담그면 저울 눈금은 어떻게 될까요?」
// 한 통찰: 물은 잠긴 물체를 위로 밀어 올린다(부력). 그 크기는 줄어든 눈금만큼이고, 잠긴 부피가 클수록 크다. 다 잠긴 뒤에는 더 깊어도 그대로다.
// 실험: 힘 센서에 매단 추를 물에 잠기기 전, 절반 잠겼을 때, 완전히 잠겼을 때 차례로 재고 줄어든 값을 구한다.
// 조작: 추를 위아래로 끈다. 각 자리에 잠깐 멈추면 아래 표에 값이 적힌다. 마지막(더 깊이)은 먼저 예상하고 해 본다.
// 수치는 정본과 같다(공기 중 20 N, 완전히 잠기면 14 N, 부력 6 N). 뒤의 문제가 이 값을 묻는다.
// 무대는 옛 buoyancyLab의 것(스탠드, 힘 센서, 추, 비커, 두 힘 화살표)을 살렸다. 안내 글자가 눈금과 겹치던 그래프는 표로 바꿨다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Log, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const WH = 44; // 추의 높이(px)
const WY = 126; // 물의 겉면(추가 잠기기 전)
const TOP = 104; // 추 바닥의 가장 높은 자리
const BOT = 208; // 추 바닥의 가장 낮은 자리(비커 바닥 바로 위)
const AIR = 20;
const LIFT = 6;

export const buoyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();
  const log = u5Log([{ name: "물에 잠기기 전" }, { name: "절반 잠겼을 때" }, { name: "완전히 잠겼을 때" }, { name: "더 깊이 내렸을 때" }]);
  f.slot.setControls(log.el);

  let y = TOP; // 추 바닥의 높이
  let drag: { dy: number } | null = null;
  let stage = 0; // 다음에 기록할 줄(0~3), 4면 끝
  let dwell = 0;
  let lock = false;
  let predicted = false;

  const sub = (): number => clamp((y - WY) / WH, 0, 1); // 잠긴 비율
  const read = (): number => AIR - LIFT * sub();
  const says = [
    "힘 센서에 추를 매달았어요. 먼저 <b>물 밖</b>에서 눈금을 읽어요. 추를 그대로 두면 표에 적혀요.",
    "추를 <b>아래로 끌어</b> 물에 <b>절반쯤</b> 잠기게 하고 잠깐 멈춰 보세요.",
    "더 내려서 추가 <b>완전히</b> 잠기게 하고 잠깐 멈춰 보세요.",
    "이제 추를 비커 <b>바닥 가까이</b>까지 더 깊이 내려 보세요.",
  ];
  const setStage = (n: number): void => {
    stage = n;
    f.pips(n);
    dwell = 0;
    if (n < 4) {
      f.say(says[n]);
      log.mark(n);
    }
  };

  st.cv.addEventListener("pointerdown", (e) => {
    if (lock || stage === 0 || stage > 3) return;
    bvCapture(st.cv, e.pointerId);
    drag = { dy: st.pt(e).y - y };
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const ny = clamp(st.pt(e).y - drag.dy, TOP, BOT);
    if (Math.abs(ny - y) > 0.4) dwell = 0;
    y = ny;
  });
  const up = (): void => {
    drag = null;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  const record = (): void => {
    haptic(HAPTIC.correct);
    if (stage === 0) log.set(0, "20.0 N");
    if (stage === 1) {
      y = WY + WH / 2;
      log.set(1, "17.0 N", "3 N 줄어듦");
    }
    if (stage === 2) log.set(2, "14.0 N", "6 N 줄어듦");
    if (stage === 3) log.set(3, "14.0 N", "그대로");
    const n = stage + 1;
    if (n === 3 && !predicted) {
      // 마지막 실험은 먼저 예상한다(정오를 매기지 않는다)
      lock = true;
      drag = null;
      stage = 3;
      f.pips(3);
      f.say("많이 잠길수록 눈금이 줄었어요. 그럼 다 잠긴 추를 <b>더 깊이</b> 내리면 어떻게 될까요?");
      tm.later(() => {
        f.slot.ask(
          "완전히 잠긴 추를 더 깊이 내리면 눈금은?",
          [{ t: "14 N 그대로예요" }, { t: "14 N보다 더 줄어요" }, { t: "다시 늘어나요" }],
          () => undefined,
          {
            predict: true,
            onNext: () => {
              predicted = true;
              lock = false;
              f.slot.showControls();
              api.setCTA("추를 더 깊이 내려 보세요", { enabled: false });
              setStage(3);
            },
          },
        );
      }, 900);
      return;
    }
    if (n === 4) {
      lock = true;
      drag = null;
      stage = 4;
      f.pips(4);
      f.say("더 깊이 내려도 눈금은 <b>14 N 그대로</b>예요. 잠긴 부피가 더 늘지 않았기 때문이에요.");
      tm.later(askFinal, 2400);
      return;
    }
    setStage(n);
  };

  function askFinal(): void {
    f.slot.ask(
      "추가 완전히 잠겼을 때, 물이 추를 위로 밀어 올린 힘은 몇 N일까요?",
      [{ t: "6 N", ok: true }, { t: "14 N" }, { t: "20 N" }],
      (ok) => api.recordQuiz(ok),
      { why: "눈금이 20 N에서 14 N으로 <b>6 N</b> 줄었어요. 그만큼 물이 떠받쳤어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물이 물체를 위로 밀어 올리는 힘이 <b>부력</b>이에요. 크기는 줄어든 눈금만큼이고, 물에 <b>잠긴 부피</b>가 클수록 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    // 머문 자리가 지금 기록할 줄의 조건에 맞으면 기록
    if (!lock && stage < 4) {
      const sb = sub();
      const fit = stage === 0 ? sb === 0 : stage === 1 ? sb > 0.36 && sb < 0.64 : stage === 2 ? sb === 1 && y < BOT - 14 : y >= BOT - 8;
      if (fit) {
        dwell += dt * 16.7;
        if (dwell > (stage === 0 ? 1400 : 480)) record();
      } else dwell = 0;
    }
    const cx = w * 0.56;
    const sb = sub();
    const wy = WY - sb * 5; // 추가 잠긴 만큼 물이 올라온다
    // 스탠드
    ctx.strokeStyle = "rgba(190,204,230,.85)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 72, h - 12);
    ctx.lineTo(cx - 72, 22);
    ctx.lineTo(cx + 6, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 84, h - 12);
    ctx.lineTo(cx - 62, h - 12);
    ctx.stroke();
    // 힘 센서
    const sg = ctx.createLinearGradient(0, 26, 0, 58);
    sg.addColorStop(0, "#5E7FB8");
    sg.addColorStop(1, "#2E4878");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.roundRect(cx - 15, 24, 30, 34, 6);
    ctx.fill();
    ctx.fillStyle = "#0B1524";
    ctx.beginPath();
    ctx.roundRect(cx - 10, 30, 20, 11, 2);
    ctx.fill();
    ctx.fillStyle = "#7CF0B5";
    ctx.fillRect(cx - 7, 34, 14 * (read() / AIR), 3);
    // 줄
    ctx.strokeStyle = "rgba(232,238,249,.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, 58);
    ctx.lineTo(cx, y - WH);
    ctx.stroke();
    // 비커의 물(추 뒤)
    const bx0 = cx - 62;
    const bx1 = cx + 62;
    const by = h - 12;
    const wg = ctx.createLinearGradient(0, wy, 0, by);
    wg.addColorStop(0, "rgba(96,176,255,.42)");
    wg.addColorStop(1, "rgba(40,110,210,.55)");
    ctx.fillStyle = wg;
    ctx.fillRect(bx0 + 2, wy, bx1 - bx0 - 4, by - wy - 2);
    // 추
    const g = ctx.createLinearGradient(cx - 17, 0, cx + 17, 0);
    g.addColorStop(0, "#B98A1E");
    g.addColorStop(0.35, "#FFE08A");
    g.addColorStop(1, "#A8780F");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(cx - 17, y - WH, 34, WH, 5);
    ctx.fill();
    ctx.fillStyle = "#C99A28";
    ctx.fillRect(cx - 4, y - WH - 5, 8, 6);
    // 잠긴 부분에 물빛을 덧입힌다
    if (sb > 0) {
      ctx.fillStyle = "rgba(60,130,230,.38)";
      ctx.fillRect(cx - 17, Math.max(wy, y - WH), 34, y - Math.max(wy, y - WH));
    }
    // 물의 겉면과 비커
    ctx.strokeStyle = "rgba(190,225,255,.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx0 + 2, wy);
    ctx.lineTo(bx1 - 2, wy);
    ctx.stroke();
    ctx.strokeStyle = "rgba(220,232,250,.75)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx0 - 4, 96);
    ctx.lineTo(bx0, 100);
    ctx.lineTo(bx0, by);
    ctx.lineTo(bx1, by);
    ctx.lineTo(bx1, 100);
    ctx.lineTo(bx1 + 4, 96);
    ctx.stroke();
    // 두 힘: 중력(아래, 늘 20 N)과 물이 미는 힘(위, 잠긴 만큼). 1 N에 2.2px.
    drawForceArrow(ctx, cx + 30, y - WH / 2, 0, AIR * 2.2, { color: U5.back, width: 4 });
    u5Text(ctx, "중력 20 N", bx1 + 14, Math.min(y + 14, h - 16), { color: "#FFB3B3", px: 12, align: "left" });
    if (sb > 0.05) {
      drawForceArrow(ctx, cx - 30, y - WH / 2, 0, -(6 + LIFT * sb * 4.2), { color: U5.up, width: 4 });
      u5Text(ctx, `물이 미는 힘 ${(LIFT * sb).toFixed(1)} N`, 14, 58, { color: "#9BE8C4", px: 12.5, align: "left" });
    }
    if (!drag && !lock && stage > 0 && stage < 4) {
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      ctx.strokeStyle = `rgba(240,164,34,${0.4 + pulse * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 22 - pulse * 2, y - WH - 5 - pulse * 2, 44 + pulse * 4, WH + 10 + pulse * 4, 8);
      ctx.stroke();
    }
    u5Read(ctx, w, read().toFixed(1), "N", "힘 센서 눈금");
    u5Pill(ctx, sb === 0 ? "물 밖" : sb < 1 ? `${Math.round(sb * 100)}% 잠김` : y >= BOT - 8 ? "바닥 가까이" : "완전히 잠김", U5.push);
  });

  setStage(0);
  api.setCTA("추를 물에 담그며 눈금을 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
