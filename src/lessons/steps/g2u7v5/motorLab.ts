// [중2 Ⅶ v5] g2u7l8 motorLab: 「전동기 속 코일은 왜 돌까요?」
// 다루는 내용: 본문과 그림(자석 사이의 코일에 전류가 흐르면 코일의 왼쪽 부분과 오른쪽 부분은 전류의 방향이 반대라
//   힘도 반대로 받아 회전한다).
// 한 통찰: 코일의 양쪽 부분은 전류의 방향이 서로 반대라 받는 힘의 방향도 반대다. 그래서 코일이 돈다.
// 학생이 정하는 것: 전류를 흐르게 할지, 전류의 방향, 자석의 극(차례는 자유).
// 실패하는 길: 전류를 끊으면 힘이 사라져 코일이 서서히 멈춘다.
// 옛 판은 전동기를 눌러 보는 그림(hotspot)으로만 다뤘다. 여기서는 양쪽 부분이 받는 힘을 그 자리에서 계산해 그리고 코일을 돌린다.
// 걸음(2026-11-14 보강): 코일을 붙잡은 채 전류를 흘려 왼쪽 변의 힘부터 본다 → 오른쪽 변의 힘을 예측한다 → 코일을 놓아 도는 것을 본다 → 전류와 자석을 바꾼다.
// 그림은 비스듬히 내려다본 모습이라 화면에서 오른쪽 위가 뒤쪽(먼 쪽)이다. 오른쪽 x, 위 y, 보는 사람 쪽 z로 두면 힘 = 전류 × 자기장.
//   전류가 뒤쪽(−z)으로 흐르고 자기장이 오른쪽(+x)이면 (−z) × x = −y, 아래쪽 힘이다(2026-11-14에 부호를 바로잡았다. 그전에는 위쪽으로 그렸다).
// 힘은 전류(코일 변의 방향)와 자기장(N극에서 S극)의 벡터곱으로 계산한다. 왼쪽에 온 변에는 늘 같은 방향의 전류가 흐른다고 둔다(실제 전동기의 정류자가 하는 일).
// 입체 무대(2026-11-15, 사용자 요청): WebGL2가 되면 motorStage3d의 3D 장면(두 자석, 네 변 코일, 회전축, 정류자와 브러시, 고정 카메라)으로 그리고,
//   안 되면 아래의 2D 그림을 평면 무대로 그린다. 걸음과 판정은 두 무대가 같다. 3D 좌표에서 다시 한 힘 검산은 motorStage3d 머리말.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xLog, xRow, xText, type LabStep } from "./kit";
import { canMotor3d, mountMotor3d, type Motor3d } from "./motorStage3d";

const A = 58; // 코일의 반 너비
const B = 46; // 코일의 반 깊이

export const motorLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const tm = bvTimers();

  let on = false;
  let cur: 1 | -1 = 1;
  let nLeft = true;
  let slow = false;
  let ready = false;
  let finished = false;
  let th = 0; // 코일이 돈 각
  let hold: "off" | "left" | "both" | "free" = "off"; // 코일을 붙잡고 있는 걸음. free부터 코일이 돈다
  let speed = 0;
  const seen = { on: false, cur: false, pole: false };

  const sw = bvBtn("main", "전류 흘려주기");
  const slowBtn = bvBtn("", "천천히 보기");
  const bCur = bvBtn("", "전류 방향 바꾸기");
  const bPole = bvBtn("", "자석의 극 바꾸기");
  const log = xLog(["코일이 회전하는 방향 (앞에서 볼 때)"], 1, true);
  f.slot.setControls(xRow(sw, slowBtn), xRow(bCur, bPole), log.el);

  /** 왼쪽에 온 변이 받는 힘의 방향(+1 위). cur = 1이면 왼쪽 변의 전류가 뒤쪽(먼 쪽)으로 흐른다: (−z) × (+x) = −y */
  const up = (): number => -cur * (nLeft ? 1 : -1);
  const dirName = (v: number): string => (v > 0 ? "위" : "아래");
  const turnName = (): string => (up() > 0 ? "시계 방향" : "시계 반대 방향");
  const after = (): void => {
    log.set(0, hold !== "free" ? "회전 전 (고정됨)" : on ? turnName() : "정지");
    f.pips((seen.on ? 1 : 0) + (seen.cur ? 1 : 0) + (seen.pole ? 1 : 0));
    if (seen.on && seen.cur && seen.pole && !ready && !finished) {
      ready = true;
      sw.disabled = false;
      sw.classList.add("main");
      sw.textContent = "확인 문제 풀기";
      f.say("전류와 자석 극에 따른 회전 방향 변화를 모두 확인했어요! 준비되면 <b>확인 문제 풀기</b>를 눌러 보세요.");
    }
  };
  slowBtn.disabled = true;
  bCur.disabled = true;
  bPole.disabled = true;
  slowBtn.addEventListener("click", () => {
    if (finished || hold !== "free") return;
    haptic(HAPTIC.tap);
    slow = !slow;
    slowBtn.classList.toggle("main", slow);
    slowBtn.textContent = slow ? "원래 속도로" : "천천히 보기";
    if (slow) f.say("<b>0.25배속</b>으로 천천히 돌려 봐요. 주황 변과 보라 변이 수직을 지날 때 힘 방향이 어떻게 유지되는지 관찰해 보세요!");
    else f.say("원래 속도로 돌아왔어요. 양쪽 변이 계속 반대 방향으로 힘을 받아 회전해요.");
    after();
  });
  sw.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    if (ready) {
      finished = true;
      sw.disabled = true;
      slowBtn.disabled = true;
      bCur.disabled = true;
      bPole.disabled = true;
      ask();
      return;
    }
    if (hold === "off") {
      hold = "left";
      on = true;
      sw.disabled = true;
      f.say(`코일을 붙잡아 고정한 채 전류를 흘려주었어요. 왼쪽 <b>주황 변</b>은 <b>${dirName(up())}</b>로 힘을 받아요.`);
      tm.later(predict, 2000);
      return;
    }
    if (hold === "both") {
      hold = "free";
      seen.on = true;
      sw.classList.remove("main");
      sw.textContent = "전류 끊기";
      slowBtn.disabled = false;
      bCur.disabled = false;
      bPole.disabled = false;
      f.say("주황 변과 보라 변이 서로 반대 방향으로 힘을 받아 코일이 <b>회전해요</b>! 천천히 보기와 전류·자석 바꾸기도 해 보세요.");
      api.setCTA("전류와 자석을 바꿔 보세요", { enabled: false });
      after();
      return;
    }
    on = !on;
    sw.textContent = on ? "전류 끊기" : "전류 흘려주기";
    if (on) f.say("코일의 주황 변과 보라 변이 <b>서로 반대 방향</b>으로 힘을 받아 회전해요. 양쪽 힘 화살표를 비교해 보세요.");
    else f.say("전류를 끊자 코일이 받는 힘이 사라져 <b>서서히 멈춰요</b>.");
    after();
  });
  function predict(): void {
    const l = up();
    f.slot.ask(
      "코일의 오른쪽 변에는 왼쪽 변과 반대 방향으로 전류가 흘러요. 오른쪽 변은 어느 쪽으로 힘을 받을까요?",
      [{ t: `왼쪽 변과 반대로 ${dirName(-l)}쪽`, ok: true }, { t: `왼쪽 변과 같게 ${dirName(l)}쪽` }, { t: "힘을 받지 않아요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          hold = "both";
          f.slot.showControls();
          sw.disabled = false;
          sw.textContent = "붙잡은 코일 놓기";
          f.say(`오른쪽 변은 전류의 방향이 반대이므로 힘도 반대 방향(<b>${dirName(-l)}</b>)으로 받아요! 이제 <b>붙잡은 코일 놓기</b>를 눌러 보세요.`);
          api.setCTA("붙잡은 코일을 놓아 보세요", { enabled: false });
        },
      },
    );
  }
  bCur.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    cur = cur === 1 ? -1 : 1;
    if (on) {
      seen.cur = true;
      f.say("전류의 방향을 바꾸자 양쪽의 힘이 모두 뒤집혀 코일이 <b>반대로</b> 돌아요.");
    } else f.say("전류의 방향을 바꿨어요. <b>전류 흘려주기</b>를 눌러 코일이 어느 쪽으로 회전하는지 확인해 보세요.");
    after();
  });
  bPole.addEventListener("click", () => {
    if (finished) return;
    haptic(HAPTIC.tap);
    nLeft = !nLeft;
    if (on) {
      seen.pole = true;
      f.say("자석의 극을 바꾸자 자기장의 방향이 바뀌어 코일이 <b>반대로</b> 돌아요.");
    } else f.say("자석의 극을 바꿨어요. <b>전류 흘려주기</b>를 눌러 코일이 어느 쪽으로 회전하는지 확인해 보세요.");
    after();
  });

  function ask(): void {
    f.slot.ask(
      "전동기 속 코일이 한쪽으로 그냥 밀려나지 않고 제자리에서 회전하는 까닭은 무엇인가요?",
      [{ t: "양쪽 변이 서로 반대 방향으로 힘을 받아서", ok: true }, { t: "양쪽 변이 같은 방향으로 힘을 받아서" }, { t: "한쪽 변만 힘을 받고 다른 쪽은 받지 않아서" }],
      (ok) => api.recordQuiz(ok),
      { why: "코일의 왼쪽 변과 오른쪽 변은 <b>전류가 흐르는 방향이 서로 반대</b>이므로, 한쪽은 위쪽, 다른 쪽은 아래쪽으로 힘을 받아 회전해요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("코일의 양쪽 변이 서로 반대 방향으로 힘을 받아 회전하는 전동기의 원리를 확인했어요!");
    f.slot.conclude("자석 사이에 놓인 코일의 왼쪽 변과 오른쪽 변에는 전류가 서로 반대 방향으로 흘러요. 따라서 양쪽 변이 <b>서로 반대 방향의 힘</b>(위쪽과 아래쪽)을 받아 코일이 회전하며, 이것이 <b>전동기</b>의 원리예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  /** 코일 돌리기(두 무대가 함께 쓴다): 왼쪽 변이 위로 힘을 받으면 시계 방향(각이 줄어든다) */
  const advance = (dt: number): void => {
    const base = slow ? 0.011 : 0.045;
    const goal = on && hold === "free" ? -up() * base : 0;
    speed += (goal - speed) * Math.min(1, dt * 0.04);
    th += speed * dt;
  };
  /** 평면 무대(WebGL2가 없는 기기): 비스듬히 내려다본 2D 그림 */
  const drawFlat = (ctx: CanvasRenderingContext2D, w: number): void => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const cx = 173;
    const cy = 112;
    const P = (x: number, y: number, z: number): [number, number] => [cx + x + z * 0.5, cy - y - z * 0.3];
    // 자석
    const nC = "#E0503A";
    const sC = "#3D8FE8";
    xBox(ctx, 14, 60, 54, 104, 10, nLeft ? nC : sC, "rgba(255,255,255,.25)");
    xBox(ctx, 278, 60, 54, 104, 10, nLeft ? sC : nC, "rgba(255,255,255,.25)");
    xText(ctx, nLeft ? "N극" : "S극", 41, 112, { px: 15, w: 800, color: "#fff" });
    xText(ctx, nLeft ? "S극" : "N극", 305, 112, { px: 15, w: 800, color: "#fff" });
    // 자기장(N극에서 S극)
    const d = nLeft ? 1 : -1;
    for (const y of [82, 142]) xArrow(ctx, cx - d * 92, y, cx + d * 92, y, "rgba(255,123,107,.55)", 2, 8);
    xText(ctx, "자기장", 108, 70, { px: 12, color: X.field, align: "right" });
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
    // 코일(네 꼭짓점: 변 A는 주황, 변 B는 보라로 구분)
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
    const seg = (a: [number, number], b: [number, number], col: string): void => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    };
    seg(q[0], q[1], "#FF922B");
    seg(q[3], q[2], "#B197FC");
    if (on) {
      // 지금 왼쪽에 온 변과 오른쪽에 온 변
      const first = -A * c < 0; // q[0]~q[1] 변이 왼쪽에 있나
      const left = first ? [q[0], q[1]] : [q[3], q[2]];
      const right = first ? [q[3], q[2]] : [q[0], q[1]];
      const side = (pts: number[][], cdir: number, fdir: number, name: string, force = true): void => {
        const [a, b] = cdir > 0 ? pts : [pts[1], pts[0]];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const ax = [a[0] + (b[0] - a[0]) * 0.2, a[1] + (b[1] - a[1]) * 0.2, a[0] + (b[0] - a[0]) * 0.8, a[1] + (b[1] - a[1]) * 0.8] as const;
        xArrow(ctx, ...ax, "#6E3F16", 5.2, 12);
        xArrow(ctx, ...ax, X.cur, 2.6, 9);
        if (!force) return;
        xArrow(ctx, mx, my, mx, my - fdir * 30, X.force, 3.2, 10);
        xText(ctx, name, mx, my - fdir * 41, { px: 12.5, color: X.force });
      };
      side(left, cur, up(), "힘");
      side(right, -cur, -up(), "힘", hold !== "left");
    }
    xText(ctx, hold === "left" || hold === "both" ? "코일을 붙잡고 있어요(오른쪽 위가 뒤쪽)" : on ? "" : "전류가 흐르지 않아요", cx, 212, { px: 12, color: X.dim });
    ctx.restore();
  };
  let stopFlat: (() => void) | null = null;
  const startFlat = (): void => {
    if (stopFlat) return;
    const st = xCanvas(f.stage);
    st.run((ctx, w, _h, _t, dt) => {
      advance(dt);
      drawFlat(ctx, w);
    });
    stopFlat = () => st.stop();
    f.stage.dataset.motor = "flat";
  };
  // 입체 무대: three는 열릴 때만 내려받는다. 열 수 없으면(WebGL2 없음, 만들기 실패, 내려받기 실패) 평면 무대로
  let m3: Motor3d | null = null;
  let loop: Loop | null = null;
  if (canMotor3d()) {
    const cv = el("canvas", { class: "g2u7x-cv3d still" }) as HTMLCanvasElement;
    f.stage.appendChild(cv);
    void mountMotor3d(cv, f.stage)
      .catch(() => null)
      .then((m) => {
        if (!tm.alive()) return m?.dispose();
        if (!m) {
          cv.remove();
          startFlat();
          return;
        }
        m3 = m;
        f.stage.dataset.motor = "3d";
        loop = createLoop((dt) => {
          advance(dt);
          const tag = hold === "left" || hold === "both" ? "코일을 붙잡고 있어요" : !on ? "전류가 흐르지 않아요" : slow ? "0.25배속 (주황·보라 변 관찰)" : "";
          m.render({ on, cur, nLeft, th, rightForce: hold !== "left", held: hold !== "free", tag });
        }).start();
      });
  } else startFlat();

  log.set(0, "회전 전 (고정됨)");
  f.say("자석 사이에 놓인 코일을 잠시 고정해 두었어요. 먼저 <b>전류 흘려주기</b>를 눌러 코일의 왼쪽 변이 어느 쪽으로 힘을 받는지 확인해 보세요.");
  api.setCTA("전류와 자석을 바꿔 보세요", { enabled: false });
  return () => {
    tm.clear();
    loop?.stop();
    loop = null;
    m3?.dispose();
    m3 = null;
    stopFlat?.();
    stopFlat = null;
  };
};
