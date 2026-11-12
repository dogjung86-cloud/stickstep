// [중2 Ⅶ v5] g2u7l8 motorLab: 「전동기 속 코일은 왜 돌까요?」
// 책의 어디에서: 본문과 그림 '전동기의 구조와 원리'(자석 사이의 코일에 전류가 흐르면 코일의 왼쪽 부분과 오른쪽 부분은 전류의 방향이 반대라
//   힘도 반대로 받아 회전한다).
// 한 통찰: 코일의 양쪽 부분은 전류의 방향이 서로 반대라 받는 힘의 방향도 반대다. 그래서 코일이 돈다.
// 학생이 정하는 것: 전류를 흐르게 할지, 전류의 방향, 자석의 극(차례는 자유).
// 실패하는 길: 전류를 끊으면 힘이 사라져 코일이 서서히 멈춘다.
// 옛 판은 전동기를 눌러 보는 그림(hotspot)으로만 다뤘다. 여기서는 양쪽 부분이 받는 힘을 그 자리에서 계산해 그리고 코일을 돌린다.
// 힘은 전류(코일 변의 방향)와 자기장(N극에서 S극)의 벡터곱으로 계산한다. 왼쪽에 온 변에는 늘 같은 방향의 전류가 흐른다고 둔다(실제 전동기의 정류자가 하는 일).

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xLog, xRow, xText, type LabStep } from "./kit";

const A = 58; // 코일의 반 너비
const B = 46; // 코일의 반 깊이

export const motorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let on = false;
  let cur: 1 | -1 = 1;
  let nLeft = true;
  let finished = false;
  let th = 0.25; // 코일이 돈 각
  let speed = 0;
  const seen = { on: false, cur: false, pole: false };

  const sw = bvBtn("main", "전류 흐르게 하기");
  const bCur = bvBtn("", "전류 방향 바꾸기");
  const bPole = bvBtn("", "자석의 극 바꾸기");
  const log = xLog(["코일이 도는 방향"], 1, true);
  f.slot.setControls(sw, xRow(bCur, bPole), log.el);

  /** 왼쪽에 온 변이 받는 힘의 방향(+1 위). 전류 z × 자기장 x = y */
  const up = (): number => cur * (nLeft ? 1 : -1);
  const turnName = (): string => (up() > 0 ? "시계 방향" : "시계 반대 방향");
  const after = (): void => {
    log.set(0, on ? turnName() : "멈춤");
    f.pips((seen.on ? 1 : 0) + (seen.cur ? 1 : 0) + (seen.pole ? 1 : 0));
    if (seen.on && seen.cur && seen.pole && !finished) {
      finished = true;
      sw.disabled = true;
      bCur.disabled = true;
      bPole.disabled = true;
      tm.later(ask, 3000);
    }
  };
  sw.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    on = !on;
    sw.textContent = on ? "전류 끊기" : "전류 흐르게 하기";
    if (on) {
      seen.on = true;
      f.say("코일의 왼쪽과 오른쪽이 <b>반대 방향</b>으로 힘을 받아 돌아요. 화살표를 견줘 보세요.");
    } else f.say("전류를 끊자 힘이 사라져 코일이 <b>서서히 멈춰요</b>.");
    after();
  });
  bCur.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    cur = cur === 1 ? -1 : 1;
    if (on) {
      seen.cur = true;
      f.say("전류의 방향을 바꾸자 양쪽의 힘이 모두 뒤집혀 코일이 <b>반대로</b> 돌아요.");
    } else f.say("전류의 방향을 바꿨어요. <b>전류를 흐르게 해서</b> 코일이 어느 쪽으로 도는지 봐요.");
    after();
  });
  bPole.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    nLeft = !nLeft;
    if (on) {
      seen.pole = true;
      f.say("자석의 극을 바꾸자 자기장의 방향이 바뀌어 코일이 <b>반대로</b> 돌아요.");
    } else f.say("자석의 극을 바꿨어요. <b>전류를 흐르게 해서</b> 코일이 어느 쪽으로 도는지 봐요.");
    after();
  });

  function ask(): void {
    f.slot.ask(
      "코일의 왼쪽 부분이 위쪽으로 힘을 받을 때 오른쪽 부분이 받는 힘은?",
      [{ t: "아래쪽", ok: true }, { t: "위쪽" }, { t: "힘을 받지 않아요" }],
      (ok) => api.recordQuiz(ok),
      { why: "두 부분은 <b>전류의 방향이 반대</b>라 힘의 방향도 반대예요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("코일의 왼쪽 부분과 오른쪽 부분은 전류의 방향이 반대라 <b>힘도 반대 방향</b>으로 받아요. 그래서 코일이 돌아요. 이것이 <b>전동기</b>의 원리예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, _t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const cx = 173;
    const cy = 122;
    const P = (x: number, y: number, z: number): [number, number] => [cx + x + z * 0.5, cy - y - z * 0.3];
    // 돌기: 왼쪽 변이 위로 힘을 받으면 시계 방향(각이 줄어든다)
    const goal = on ? -up() * 0.045 : 0;
    speed += (goal - speed) * Math.min(1, dt * 0.03);
    th += speed * dt;
    // 자석
    const nC = "#E0503A";
    const sC = "#3D8FE8";
    xBox(ctx, 14, 70, 54, 104, 10, nLeft ? nC : sC, "rgba(255,255,255,.25)");
    xBox(ctx, 278, 70, 54, 104, 10, nLeft ? sC : nC, "rgba(255,255,255,.25)");
    xText(ctx, nLeft ? "N극" : "S극", 41, 122, { px: 15, w: 800, color: "#fff" });
    xText(ctx, nLeft ? "S극" : "N극", 305, 122, { px: 15, w: 800, color: "#fff" });
    // 자기장(N극에서 S극)
    const d = nLeft ? 1 : -1;
    for (const y of [92, 152]) xArrow(ctx, cx - d * 92, y, cx + d * 92, y, "rgba(255,123,107,.55)", 2, 8);
    xText(ctx, "자기장", 100, 80, { px: 12, color: X.field });
    // 회전축
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "rgba(232,238,249,.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(...P(0, 0, -B - 34));
    ctx.lineTo(...P(0, 0, B + 34));
    ctx.stroke();
    ctx.restore();
    // 코일(네 꼭짓점)
    const c = Math.cos(th);
    const sn = Math.sin(th);
    const q = [P(-A * c, -A * sn, -B), P(-A * c, -A * sn, B), P(A * c, A * sn, B), P(A * c, A * sn, -B)];
    ctx.lineJoin = "round";
    for (const [col, lw] of [["#7A4B1E", 7], ["#D9944A", 4]] as [string, number][]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.stroke();
    }
    if (on) {
      // 지금 왼쪽에 온 변과 오른쪽에 온 변
      const first = -A * c < 0; // q[0]~q[1] 변이 왼쪽에 있나
      const left = first ? [q[0], q[1]] : [q[3], q[2]];
      const right = first ? [q[3], q[2]] : [q[0], q[1]];
      const side = (pts: number[][], cdir: number, fdir: number, name: string): void => {
        const [a, b] = cdir > 0 ? pts : [pts[1], pts[0]];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const ax = [a[0] + (b[0] - a[0]) * 0.2, a[1] + (b[1] - a[1]) * 0.2, a[0] + (b[0] - a[0]) * 0.8, a[1] + (b[1] - a[1]) * 0.8] as const;
        xArrow(ctx, ...ax, "#6E3F16", 5.2, 12);
        xArrow(ctx, ...ax, X.cur, 2.6, 9);
        xArrow(ctx, mx, my, mx, my - fdir * 38, X.force, 3.2, 10);
        xText(ctx, name, mx, my - fdir * 50, { px: 12.5, color: X.force });
      };
      side(left, cur, up(), "힘");
      side(right, -cur, -up(), "힘");
    }
    xText(ctx, on ? "노란 화살표는 전류, 청록 화살표는 힘" : "전류가 흐르지 않아요", cx, 212, { px: 12, color: X.dim });
    ctx.restore();
  });

  log.set(0, "멈춤");
  f.say("두 자석 사이에 코일이 있어요. <b>전류를 흐르게 해서</b> 코일의 양쪽이 받는 힘을 견줘 보세요.");
  api.setCTA("전류와 자석을 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
