// [중2 Ⅶ v5] g2u7l8 palmLab: 「손바닥으로 힘의 방향 찾기」
// 책의 어디에서: 본문(오른손의 엄지손가락을 전류의 방향, 네 손가락을 자기장의 방향으로 향하게 할 때 손바닥이 향하는 방향이 힘의 방향).
// 한 통찰: 자기장과 전류의 방향을 알면 오른손 손바닥으로 힘의 방향을 찾을 수 있다. 둘 가운데 하나가 뒤집히면 힘도 뒤집힌다.
// 걸음: ① N극이 왼쪽, 전류가 뒤쪽으로 → ② 전류만 앞쪽으로 뒤집음 → ③ 자석의 극까지 뒤집음. 답하면 도선이 그 자리에서 힘을 받아 움직인다.
// 학생이 정하는 것: 자기 오른손을 화면 앞에 펴고 맞춘 뒤 고르는 답.
// 실패하는 길: 왼손을 쓰거나 네 손가락을 S극에서 N극 쪽으로 펴면 손바닥이 반대를 향한다.
// 힘의 방향(검산): 오른쪽 x, 위 y, 보는 사람 쪽 z로 두면 힘은 전류 × 자기장.
//   ① 전류 −z(뒤쪽), 자기장 +x(오른쪽): (−z) × x = −y, 아래.  ② 전류 +z, 자기장 +x: z × x = +y, 위.  ③ 전류 +z, 자기장 −x: z × (−x) = −y, 아래.
// 그림: 비스듬히 내려다본 모습. 화면에서 오른쪽 위로 갈수록 뒤쪽(먼 쪽)이다.

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xText, type LabStep } from "./kit";

interface Round {
  nLeft: boolean;
  back: boolean; // 전류가 뒤쪽(먼 쪽)으로 흐르는지
}
const ROUNDS: Round[] = [
  { nLeft: true, back: true },
  { nLeft: true, back: false },
  { nLeft: false, back: false },
];
/** 힘이 위쪽이면 +1 */
const forceUp = (rd: Round): number => (rd.back ? -1 : 1) * (rd.nLeft ? 1 : -1);

export const palmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let r = 0;
  let shown = false;
  let showAt = 0;
  let now = 0;

  function ask(): void {
    const rd = ROUNDS[r];
    shown = false;
    f.pips(r);
    const up = forceUp(rd) > 0;
    const fing = rd.nLeft ? "오른쪽" : "왼쪽";
    const thumb = rd.back ? "뒤쪽" : "앞쪽";
    f.say(
      r === 0
        ? "오른손을 펴서 <b>네 손가락</b>은 자기장(N극에서 S극), <b>엄지</b>는 전류 쪽으로 맞춰 보세요."
        : r === 1
          ? "이번에는 <b>전류의 방향만</b> 바뀌었어요. 엄지를 돌려 다시 맞춰 보세요."
          : "이번에는 <b>자석의 두 극</b>이 바뀌었어요. 네 손가락을 돌려 다시 맞춰 보세요.",
    );
    f.slot.ask(
      `자기장은 ${fing}, 전류는 ${thumb}으로 향해요. 도선이 받는 힘은?`,
      [{ t: up ? "위쪽" : "아래쪽", ok: true }, { t: up ? "아래쪽" : "위쪽" }, { t: "힘을 받지 않아요" }],
      (ok) => {
        if (r === 0) api.recordQuiz(ok);
        shown = true;
        showAt = now;
        f.say(`도선이 <b>${up ? "위" : "아래"}</b>로 힘을 받아요. 손바닥이 향한 쪽과 같은지 견줘 보세요.`);
      },
      { why: `네 손가락은 ${fing}, 엄지는 ${thumb}. 손바닥이 <b>${up ? "위" : "아래"}</b>를 향해요.`, onNext: next },
    );
  }
  function next(): void {
    r += 1;
    if (r < ROUNDS.length) ask();
    else {
      f.pips(3);
      f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
      f.slot.conclude("오른손의 <b>네 손가락</b>을 자기장, <b>엄지</b>를 전류의 방향에 맞추면 <b>손바닥</b>이 향하는 쪽이 힘의 방향이에요. 전류나 자기장 가운데 하나가 뒤집히면 힘도 뒤집혀요.");
      api.enableCTA(s.cta ?? "다음");
    }
  }

  st.run((ctx, w, _h, t) => {
    now = t;
    const k = w / 346;
    const rd = ROUNDS[Math.min(r, ROUNDS.length - 1)];
    const end = r >= ROUNDS.length;
    const a = end ? 1 : shown ? Math.min(1, (t - showAt) / 450) : 0;
    const up = forceUp(rd);
    ctx.save();
    ctx.scale(k, k);
    const cx = 173;
    const cy = 118;
    // 깊이 z(뒤쪽이 +)는 오른쪽 위로 물러난다
    const P = (x: number, y: number, z: number): [number, number] => [cx + x + z * 0.5, cy - y - z * 0.34];
    const nC = "#E0503A";
    const sC = "#3D8FE8";
    // 자석(좌우)
    xBox(ctx, 14, 62, 52, 112, 10, rd.nLeft ? nC : sC, "rgba(255,255,255,.25)");
    xBox(ctx, 280, 62, 52, 112, 10, rd.nLeft ? sC : nC, "rgba(255,255,255,.25)");
    xText(ctx, rd.nLeft ? "N극" : "S극", 40, 118, { px: 15, w: 800, color: "#fff" });
    xText(ctx, rd.nLeft ? "S극" : "N극", 306, 118, { px: 15, w: 800, color: "#fff" });
    // 자기장(N극에서 S극)
    const d = rd.nLeft ? 1 : -1;
    for (const y of [84, 152]) xArrow(ctx, cx - d * 96, y, cx + d * 96, y, "rgba(255,123,107,.6)", 2, 8);
    xText(ctx, "자기장", cx - d * 62, 72, { px: 12, color: X.field });
    // 도선(앞에서 뒤로 뻗은 곧은 도선). 답하면 힘을 받아 움직인다
    const lift = a * up * 16;
    const p0 = P(0, lift, -70);
    const p1 = P(0, lift, 70);
    ctx.lineCap = "round";
    for (const [col, lw] of [["#7A4B1E", 9], ["#D9944A", 5.5]] as [string, number][]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    xText(ctx, "앞", p0[0] - 13, p0[1] + 11, { px: 12, color: X.dim });
    xText(ctx, "뒤", p1[0] + 13, p1[1] - 11, { px: 12, color: X.dim });
    // 전류
    const from = rd.back ? p0 : p1;
    const to = rd.back ? p1 : p0;
    const ax = [from[0] + (to[0] - from[0]) * 0.28, from[1] + (to[1] - from[1]) * 0.28, from[0] + (to[0] - from[0]) * 0.72, from[1] + (to[1] - from[1]) * 0.72] as const;
    xArrow(ctx, ...ax, "#6E3F16", 5.2, 12);
    xArrow(ctx, ...ax, X.cur, 2.6, 9);
    xText(ctx, "전류", cx + 30, cy + lift * -1 + 16, { px: 12, color: X.cur });
    if (a > 0) {
      ctx.globalAlpha = a;
      const m = P(0, lift, 0);
      xArrow(ctx, m[0], m[1] - up * 6, m[0], m[1] - up * 44, X.force, 3.4, 11);
      xText(ctx, "힘", m[0] - 14, m[1] - up * 40, { px: 13, color: X.force });
      ctx.globalAlpha = 1;
    }
    xText(ctx, "도선을 비스듬히 내려다본 모습", cx, 214, { px: 12, color: X.dim });
    ctx.restore();
  });

  api.setCTA("오른손을 펴고 답해 보세요", { enabled: false });
  ask();
  return () => {
    tm.clear();
    st.stop();
  };
};
