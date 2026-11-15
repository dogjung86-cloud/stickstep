// [중2 Ⅶ v5] g2u7l8 swingLab: 「전기 그네는 어느 쪽으로 움직일까요?」 (3D)
// 책의 어디에서: 해 보기 '자기장 안에서 전류가 흐르는 코일이 받는 힘 관찰하기'(말굽자석 사이에 건 코일 그네. 스위치를 닫아 보고, 전류의 방향을 바꾸고,
//   말굽자석의 두 극을 바꾸고, 전류를 세게 해 본다)와 그림 '전류의 방향이나 자기장의 방향이 바뀔 때 코일이 받는 힘'.
// 한 통찰: 전류나 자기장 가운데 하나의 방향을 바꾸면 힘의 방향이 반대가 되고, 전류가 셀수록 힘이 크다.
// 학생이 정하는 것: 스위치를 누르는 것, 전류의 방향, 자석의 극, 전류의 세기(차례는 자유).
// 실패하는 길: 스위치를 누르지 않으면 그네는 움직이지 않는다. 스위치를 오래 누르고 있으면 코일이 뜨거워져 전류를 끊어야 한다.
// 옛 랩(swingLab3d)은 가로 화면의 3D 장면에서 차례로 눌렀다. 여기서는 세로 한 화면에서 학생이 고른 조합마다 힘을 계산한다.
// 걸음(2026-11-14 보강): 전류의 방향이나 자석의 극을 처음 바꿀 때는 예측을 먼저 하고, 스위치를 눌러 확인한다.
// 힘의 방향은 전류(선의 방향)와 자기장(N극에서 S극)의 벡터곱으로 계산한다.
// 무대(2026-11-15 그래픽 감사 C105): WebGL2가 되면 swingStage3d의 입체 무대(전동기 무대처럼 앞에서 조금 내려다본 고정 시점, 끌어 돌리지 않는다.
//   U자가 보이는 말굽자석, 굵은 화살표와 테두리)로 그리고, 안 되면 같은 시점의 평면 그림으로 그린다. 걸음과 판정은 두 무대가 같다.
//   three는 열릴 때만 내려받는다(swingStage3d가 ui/space3d를 동적 import).

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xCanvas, xFrame, xHold, xRow, xSegs, xText, type LabStep } from "./kit";
import { SW, canSwing3d, mountSwing3d, type Swing3d, type SwingView } from "./swingStage3d";

/** 평면 무대(WebGL2가 없는 기기): 입체 무대와 같은 시점(오른쪽 앞에서 조금 내려다봄)으로 투영한 그림 */
function drawSwingFlat(ctx: CanvasRenderingContext2D, w: number, v: SwingView): void {
  const k = w / 346;
  ctx.save();
  ctx.scale(k, k);
  const s = 56;
  const ox = 186;
  const oy = 129;
  // 입체 무대의 카메라(az 0.78, el 0.38)의 오른쪽, 위쪽 벡터로 투영한다(원근 없이)
  const P = (x: number, y: number, z: number): [number, number] => [ox + s * (x * 0.711 - z * 0.703), oy + s * (0.261 * x - 0.929 * y + 0.264 * z)];
  const poly = (pts: [number, number][], fill: string, stroke = "rgba(11,21,36,.55)"): void => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };
  const line = (a: [number, number], b: [number, number], col: string, lw: number): void => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.stroke();
  };
  const { armY, armT, depth, bendX, tipX, pivotY, wireX, half, baseY } = SW;
  const ro = armY + armT / 2;
  const ri = armY - armT / 2;
  const d2 = depth / 2;
  // 받침
  poly([P(-2.65, baseY, 1.5), P(1.95, baseY, 1.5), P(1.95, baseY, -1.5), P(-2.65, baseY, -1.5)], "#26324B");
  // 말굽자석: 굽은 몸통(회색)의 앞면과 두 팔(윗면, 끝면, 앞면)
  const arc = (r: number, a0: number, a1: number, z: number): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const a = a0 + ((a1 - a0) * i) / 20;
      out.push(P(bendX + Math.cos(a) * r, Math.sin(a) * r, z));
    }
    return out;
  };
  poly([...arc(ro, Math.PI / 2, Math.PI * 1.5, -d2), ...arc(ri, Math.PI * 1.5, Math.PI / 2, -d2)], "#7F8BA0");
  poly([...arc(ro, Math.PI / 2, Math.PI * 1.5, d2), ...arc(ri, Math.PI * 1.5, Math.PI / 2, d2)], "#A7B2C4");
  const top = v.nBottom ? "#3D8FE8" : "#E0503A";
  const bot = v.nBottom ? "#E0503A" : "#3D8FE8";
  for (const [yc, col] of [[-armY, bot], [armY, top]] as [number, string][]) {
    const y0 = yc - armT / 2;
    const y1 = yc + armT / 2;
    poly([P(bendX, y1, d2), P(tipX, y1, d2), P(tipX, y1, -d2), P(bendX, y1, -d2)], col); // 윗면
    poly([P(tipX, y0, d2), P(tipX, y0, -d2), P(tipX, y1, -d2), P(tipX, y1, d2)], col); // 끝면
    poly([P(bendX, y0, d2), P(tipX, y0, d2), P(tipX, y1, d2), P(bendX, y1, d2)], col); // 앞면
  }
  // 자기장(두 극 사이 앞쪽 면, 힘이 향하는 쪽의 반대편. 입체 무대와 같은 자리)
  const by = v.nBottom ? 1 : -1;
  const side = v.out > 0 ? 1 : -1;
  for (const fx of side > 0 ? [-0.18, -0.55] : [0.5, 0.7]) {
    const [ax, ay] = P(fx, -by * (ri - 0.06), d2 - 0.08);
    const [bx, byy] = P(fx, by * (ri - 0.06), d2 - 0.08);
    xArrow(ctx, ax, ay, bx, byy, "rgba(255,123,107,.92)", 3, 9);
  }
  // 그네(가로대를 축으로 angle만큼)
  const rot = (x: number, y: number): [number, number] => [wireX + x * Math.cos(v.angle) - (y - pivotY) * Math.sin(v.angle), pivotY + x * Math.sin(v.angle) + (y - pivotY) * Math.cos(v.angle)];
  const bot0 = rot(0, 0);
  const copper = "#D9944A";
  line(P(bot0[0], bot0[1], -half), P(wireX, pivotY, -half), copper, 2.4);
  line(P(bot0[0], bot0[1], -half), P(bot0[0], bot0[1], half), "#7A4B1E", 5);
  line(P(bot0[0], bot0[1], -half), P(bot0[0], bot0[1], half), copper, 3);
  line(P(bot0[0], bot0[1], half), P(wireX, pivotY, half), copper, 2.4);
  const upPos = P(-0.3, ro + 0.08, 0);
  const downPos = P(bendX + 0.25, -armY, d2);
  xText(ctx, "S극", ...(v.nBottom ? upPos : downPos), { px: 12.5, w: 800, color: "#fff" });
  xText(ctx, "N극", ...(v.nBottom ? downPos : upPos), { px: 12.5, w: 800, color: "#fff" });
  const lf = P(side > 0 ? -1.08 : tipX + 0.5, 0, d2 + 0.05);
  xText(ctx, "자기장", lf[0], lf[1], { px: 12, color: "#FFB3A6" });
  if (v.held) {
    const c0 = P(bot0[0], bot0[1] + 0.1, v.cur * 0.1);
    const c1 = P(bot0[0], bot0[1] + 0.1, v.cur * 0.9);
    xArrow(ctx, ...c0, ...c1, "#6E3F16", 6, 13);
    xArrow(ctx, ...c0, ...c1, X.cur, 3.2, 10);
    const lc = v.cur < 0 ? P(bot0[0], bot0[1] + 0.3, -1.25) : P(0.6, -0.55, 1.0);
    xText(ctx, "전류", lc[0], lc[1], { px: 12, color: "#FFD98A" });
    const flen = v.strong ? 1.05 : 0.85;
    const f0 = P(bot0[0] + v.out * 0.07, bot0[1], 0);
    const f1 = P(bot0[0] + v.out * flen, bot0[1], 0);
    xArrow(ctx, ...f0, ...f1, "#0B2A33", 6.4, 14);
    xArrow(ctx, ...f0, ...f1, X.force, 3.6, 11);
    const lfo = side > 0 ? P(bot0[0] + flen + 0.18, bot0[1] - 0.4, 0) : P(bot0[0] - flen - 0.32, bot0[1] + 0.18, 0);
    xText(ctx, "힘", lfo[0], lfo[1], { px: 13, color: "#8FF0DF" });
  }
  ctx.restore();
}

export const swingLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const tm = bvTimers();

  let held = false;
  let cur: 1 | -1 = -1; // 그네 아랫변에 흐르는 전류의 방향(z축)
  let nBottom = true; // N극이 아래
  let strong = false;
  let finished = false;
  let hot = 0; // 스위치를 누르고 있던 시간(초)
  let angle = 0;
  const seen = { press: false, cur: false, pole: false, strong: false };
  const guessed = { cur: false, pole: false };
  let asking = false;
  let pending = false; // 하나를 바꾼 뒤 아직 스위치로 확인하지 않았다
  /** 처음 바꿀 때는 예측부터. 예측을 띄웠으면 true(바꾸는 일은 답한 뒤에 한다). */
  const predictFirst = (which: "cur" | "pole", go: () => void): boolean => {
    if (pending) {
      f.say("먼저 <b>스위치를 눌러</b> 방금 바꾼 것부터 확인해 보세요.");
      return true;
    }
    if (guessed[which]) return false;
    if (!seen.press) {
      f.say("먼저 <b>스위치를 눌러</b> 그네가 어느 쪽으로 움직이는지 봐 두세요.");
      return true;
    }
    asking = true;
    f.slot.ask(
      which === "cur" ? "전류의 방향만 반대로 바꾸면 그네는?" : "자석의 두 극만 바꾸면 그네는?",
      [{ t: "방금과 반대쪽으로 움직여요", ok: true }, { t: "방금과 같은 쪽으로 움직여요" }, { t: "움직이지 않아요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          guessed[which] = true;
          asking = false;
          f.slot.showControls();
          go();
        },
      },
    );
    return true;
  };
  /** 그네가 받는 힘의 x방향(+1이 자석 바깥쪽). 전류 z × 자기장 y = −x */
  const fx = (): number => -cur * (nBottom ? 1 : -1);

  const sw = xHold("main", "스위치 누르고 있기", (v) => {
    if (finished) return;
    held = v;
    if (v) {
      pending = false;
      hot = 0;
      seen.press = true;
      if (cur === 1) seen.cur = true;
      if (!nBottom) seen.pole = true;
      if (strong) seen.strong = true;
      const out = fx() > 0;
      f.say(`그네가 자석 <b>${out ? "바깥쪽" : "안쪽"}</b>으로 ${strong ? "크게 " : ""}움직여요. 하나씩 바꿔 가며 비교해 보세요.`);
    }
    after();
  });
  const bCur = bvBtn("", "전류 방향 바꾸기");
  const bPole = bvBtn("", "자석의 극 바꾸기");
  const power = xSegs(
    [
      { k: "weak", t: "약한 전류" },
      { k: "strong", t: "센 전류" },
    ],
    "weak",
    (k) => {
      strong = k === "strong";
      f.say(strong ? "전류를 <b>세게</b> 했어요. 스위치를 눌러 그네가 얼마나 움직이는지 봐요." : "전류를 약하게 했어요. 스위치를 눌러 보세요.");
    },
  );
  f.slot.setControls(sw, xRow(bCur, bPole), power.el);
  const flipCur = (): void => {
    pending = true;
    cur = cur === 1 ? -1 : 1;
    f.say("<b>전류의 방향</b>을 바꿨어요. 스위치를 눌러 예측과 비교해 보세요.");
  };
  const flipPole = (): void => {
    pending = true;
    nBottom = !nBottom;
    f.say("<b>자석의 두 극</b>을 바꿨어요. 스위치를 눌러 예측과 비교해 보세요.");
  };
  bCur.addEventListener("click", () => {
    if (finished || asking || held) return;
    haptic(HAPTIC.tap);
    if (!predictFirst("cur", flipCur)) flipCur();
  });
  bPole.addEventListener("click", () => {
    if (finished || asking || held) return;
    haptic(HAPTIC.tap);
    if (!predictFirst("pole", flipPole)) flipPole();
  });
  function after(): void {
    f.pips((seen.press ? 1 : 0) + (seen.cur ? 1 : 0) + (seen.pole ? 1 : 0) + (seen.strong ? 1 : 0));
    if (!held && seen.press && seen.cur && seen.pole && seen.strong && !finished) {
      finished = true;
      sw.disabled = true;
      bCur.disabled = true;
      bPole.disabled = true;
      power.lock(true);
      tm.later(ask, 1600);
    }
  }
  function ask(): void {
    f.slot.ask(
      "전류의 방향과 자석의 극을 둘 다 바꾸면 그네가 움직이는 방향은?",
      [{ t: "처음과 같은 쪽", ok: true }, { t: "처음과 반대쪽" }, { t: "움직이지 않아요" }],
      (ok) => api.recordQuiz(ok),
      { why: "하나를 바꾸면 반대가 되고, 하나 더 바꾸면 <b>다시 처음</b>이 돼요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("자기장 안의 코일에 전류가 흐르면 코일은 <b>힘</b>을 받아요. 전류나 자기장의 방향을 바꾸면 힘의 방향이 반대가 되고, 전류가 셀수록 힘이 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  /** 한 장면 진행(두 무대가 함께 쓴다): 오래 누름, 그네의 각, 상태 글 */
  const advance = (dt: number): SwingView => {
    if (held) {
      hot += dt / 60;
      if (hot > 5) {
        // 오래 누르면 코일이 뜨거워진다(책의 안전 수칙)
        sw.dispatchEvent(new Event("pointercancel"));
        haptic(HAPTIC.wrong);
        f.say("코일이 <b>뜨거워져서</b> 전류를 끊었어요. 스위치는 오래 누르지 않아요.");
      }
    }
    const out = fx();
    // 흔들림은 무대 안에 들게(센 전류면 약한 전류의 두 배 가까이). 바깥쪽으로 크게 밀려도 아랫변과 힘 화살표가 무대 밖으로 나가지 않는다
    const goal = held ? out * (strong ? 0.24 : 0.13) : 0;
    angle += (goal - angle) * Math.min(1, dt * 0.07);
    f.stage.dataset.force = held ? (out > 0 ? "out" : "in") : "none";
    const tag = held ? `힘의 방향: 자석 ${out > 0 ? "바깥쪽" : "안쪽"}${strong ? ", 크게" : ""}` : `전류 ${cur === -1 ? "처음 방향" : "반대 방향"} · N극 ${nBottom ? "아래" : "위"}`;
    return { held, cur, nBottom, strong, angle, out, tag };
  };
  // 평면 무대: 입체 무대를 열 수 없을 때(WebGL2 없음, 만들기 실패, 내려받기 실패)
  let stopFlat: (() => void) | null = null;
  const startFlat = (): void => {
    if (stopFlat) return;
    const st = xCanvas(f.stage);
    const tag = el("div", { class: "g2u7x-tag" });
    f.stage.appendChild(tag);
    st.run((ctx, w, _h, _t, dt) => {
      const v = advance(dt);
      drawSwingFlat(ctx, w, v);
      tag.textContent = v.tag;
    });
    stopFlat = () => {
      st.stop();
      tag.remove();
    };
    f.stage.dataset.swing = "flat";
  };
  // 입체 무대: three는 열릴 때만 내려받는다
  let m3: Swing3d | null = null;
  let loop: Loop | null = null;
  if (canSwing3d()) {
    const cv = el("canvas", { class: "g2u7x-cv3d still" }) as HTMLCanvasElement;
    f.stage.appendChild(cv);
    void mountSwing3d(cv, f.stage)
      .catch(() => null)
      .then((m) => {
        if (!tm.alive()) return m?.dispose();
        if (!m) {
          cv.remove();
          startFlat();
          return;
        }
        m3 = m;
        f.stage.dataset.swing = "3d";
        loop = createLoop((dt) => m.render(advance(dt))).start();
      });
  } else startFlat();

  f.say("말굽자석 사이에 코일 그네를 걸었어요. <b>스위치를 누르고</b>, 전류와 자석을 하나씩 바꿔 보세요.");
  api.setCTA("네 가지를 모두 해 보세요", { enabled: false });
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
