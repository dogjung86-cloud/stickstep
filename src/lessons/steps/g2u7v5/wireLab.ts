// [중2 Ⅶ v5] g2u7l3 wireLab: 「스위치를 닫으면 전선 속 전자는 어떻게 움직일까요?」
// 책의 어디에서: 디지털 해 보기 '전기 회로에서 전류가 흐르는 과정 살펴보기'(스위치를 닫기 전과 닫은 후 전자의 움직임 견주기)와 그림 '전자의 이동'.
// 한 통찰: 스위치가 열려 있으면 전자는 제멋대로 움직이고, 닫으면 전지의 (−)극에서 (+)극 쪽으로 한 방향으로 이동한다. 전류의 방향은 그 반대다.
// 학생이 정하는 것: 스위치를 여닫는 것, 전지를 돌려 끼우는 것(차례는 자유).
// 실패하는 길: 스위치를 열어 둔 채 전지만 돌려 끼우면 전구는 켜지지 않고 전자도 흐르지 않는다.
// 옛 판에는 이 탐구를 맡은 랩이 없었다(물길 비유 랩 하나뿐). 전선 속을 크게 본 회로를 새로 만들었다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawElectron, drawSwitch } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xCanvas, xFrame, xLog, xPill, xRow, xText, type LabStep } from "./kit";

// 회로의 길(전지의 왼쪽 끝에서 나와 한 바퀴 돌아 오른쪽 끝으로)
const PATH: [number, number][] = [[132, 186], [40, 186], [40, 70], [306, 70], [306, 186], [214, 186]];
const SEG = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
const TOTAL = SEG.reduce((a, b) => a + b, 0);
const at = (u: number): [number, number, number] => {
  let d = ((u % TOTAL) + TOTAL) % TOTAL;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i]) {
      const k = d / SEG[i];
      const a = PATH[i];
      const b = PATH[i + 1];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, Math.atan2(b[1] - a[1], b[0] - a[0])];
    }
    d -= SEG[i];
  }
  return [PATH[0][0], PATH[0][1], 0];
};

export const wireLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let closed = false;
  let flip = false; // false: 전지의 왼쪽이 (−)극
  let finished = false;
  let glow = 0;
  const seen = { closed: false, flipped: false };
  const es = Array.from({ length: 24 }, (_, i) => ({ u: (i / 24) * TOTAL, jx: 0, jy: 0 }));

  const sw = bvBtn("main", "스위치 닫기");
  const turn = bvBtn("", "전지 방향 반대로 끼우기");
  const log = xLog(["스위치를 열었을 때", "스위치를 닫았을 때", "전지 방향을 바꿨을 때"], 1, true);
  f.slot.setControls(xRow(sw, turn), log.el);

  const after = (): void => {
    f.pips((seen.closed ? 1 : 0) + (seen.flipped ? 1 : 0));
    if (seen.closed && seen.flipped && !finished) {
      finished = true;
      sw.disabled = true;
      turn.disabled = true;
      tm.later(ask1, 2600);
    }
  };
  sw.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    closed = !closed;
    sw.textContent = closed ? "스위치 열기" : "스위치 닫기";
    if (closed) {
      if (!seen.closed) log.set(0, "불규칙하게 운동, 전구 꺼짐");
      seen.closed = true;
      log.set(1, "(−)극→(+)극 이동, 전구 켜짐");
      f.say("전구가 환하게 켜졌어요! 전선 속 전자가 전지의 <b>(−)극에서 (+)극 쪽으로</b> 일제히 이동해요.");
    } else f.say("스위치를 열자 전구가 꺼졌어요. 전자는 멈추지 않고 <b>여러 방향으로 제멋대로</b> 움직여요.");
    after();
  });
  turn.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    flip = !flip;
    if (closed) {
      seen.flipped = true;
      log.set(2, "반대 방향으로 이동");
      f.say("전지의 (+)극과 (−)극 방향을 바꾸자 전자도 <b>반대 방향으로</b> 이동해요. 이번에도 전지의 (−)극에서 (+)극 쪽으로 향해요.");
    } else f.say("스위치가 열려 있어서 아직 전류가 흐르지 않아요. <b>스위치를 닫아</b> 전자가 어느 쪽으로 이동하는지 확인해 보세요.");
    after();
  });

  function ask1(): void {
    f.slot.ask(
      "스위치가 열려 있을 때 전선 속 전자들은 어떻게 움직였나요?",
      [{ t: "여러 방향으로 제멋대로 움직였어요", ok: true }, { t: "모두 제자리에 멈춰 있었어요" }, { t: "한 방향으로 줄지어 이동했어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "전자는 스위치가 열려 있어도 멈추지 않고 움직여요. 스위치를 닫았을 때만 <b>일정한 한 방향</b>으로 이동했어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(3);
    f.slot.ask(
      "전류의 방향과 전자의 이동 방향은 어떤 관계인가요?",
      [{ t: "서로 반대 방향이에요", ok: true }, { t: "서로 같은 방향이에요" }, { t: "전자는 이동하지 않아요" }],
      () => undefined,
      { why: "전류는 <b>(+)극에서 (−)극</b>으로 흐르고, 전자는 반대로 <b>(−)극에서 (+)극</b>으로 이동해요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("스위치를 닫으면 전자가 (−)극에서 (+)극으로 이동하며 전류가 흐른다는 것을 확인했어요!");
    f.slot.conclude("스위치를 닫으면 전선 속 전자가 전지의 <b>(−)극에서 (+)극 쪽으로</b> 일정한 방향을 따라 이동해요. 전류의 방향은 (+)극에서 (−)극으로, 전자의 이동 방향과 <b>반대</b>예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const dir = flip ? -1 : 1; // 전자가 길을 따라가는 방향
    glow += ((closed ? 1 : 0) - glow) * Math.min(1, dt * 0.1);
    // 전선(속이 보이게 굵게)
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(143,164,194,.26)";
    ctx.lineWidth = 20;
    ctx.beginPath();
    PATH.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.strokeStyle = "rgba(143,164,194,.6)";
    ctx.lineWidth = 1.2;
    for (const o of [-10, 10]) {
      ctx.beginPath();
      [[132, 186 + o], [40 - o, 186 + o], [40 - o, 70 - o], [306 + o, 70 - o], [306 + o, 186 + o], [214, 186 + o]].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
    // 전자
    es.forEach((e, i) => {
      if (closed) {
        e.u += dir * 0.75 * dt;
        e.jx *= 0.9;
        e.jy *= 0.9;
        e.jy += Math.sin(t / 130 + i * 2.1) * 0.25;
      } else {
        e.u += Math.sin(t / 170 + i * 1.7) * 0.5 * dt;
        e.jy = Math.sin(t / 110 + i * 2.9) * 6;
      }
      const [x, y, a] = at(e.u);
      // 스위치가 열린 틈과 전구, 전지 자리는 건너뛴다
      if (y === 70 && x > 222 && x < 278 && !closed) return;
      drawElectron(ctx, x - Math.sin(a) * e.jy, y + Math.cos(a) * e.jy, 5.5);
    });
    // 소품
    drawBulb(ctx, 150, 62, 19, glow);
    drawSwitch(ctx, 250, 70, closed, 50);
    drawBattery(ctx, 173, 186, 84, 32, flip);
    xText(ctx, "전구", 188, 50, { px: 12, color: X.dim });
    xText(ctx, "스위치", 250, 96, { px: 12, color: X.dim });
    xText(ctx, "전지", 173, 160, { px: 12, color: X.dim });
    if (glow > 0.6) {
      // 같은 왼쪽 변에서 견준다: 전자의 이동과 전류의 방향은 서로 반대다
      const up = dir > 0;
      xArrow(ctx, 62, up ? 156 : 100, 62, up ? 100 : 156, X.minus, 3);
      xArrow(ctx, 80, up ? 100 : 156, 80, up ? 156 : 100, X.cur, 3);
      xText(ctx, "전자의 이동", 96, 118, { px: 12.5, color: X.minus, align: "left" });
      xText(ctx, "전류의 방향", 96, 144, { px: 12.5, color: X.cur, align: "left" });
    }
    ctx.restore();
    xPill(ctx, closed ? "스위치 닫힘" : "스위치 열림", closed ? X.cur : "#9AA7BD");
  });

  f.say("전선 내부를 확대한 전기 회로예요. 파란 입자는 <b>전자(−)</b>를 나타내요. 스위치를 닫아 보고, 전지 방향도 반대로 바꿔 보세요.");
  api.setCTA("스위치와 전지 방향을 조작해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
