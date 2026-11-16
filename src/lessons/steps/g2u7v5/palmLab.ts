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
import { X, xArrow, xCanvas, xFrame, xText, type LabStep } from "./kit";

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
        ? "오른손을 편 상태에서 <b>네 손가락</b>은 자기장 방향(N극→S극), <b>엄지손가락</b>은 전류 방향으로 맞춰 보세요."
        : r === 1
          ? "이번에는 <b>전류의 방향만</b> 바뀌었어요. 엄지를 돌려 다시 맞춰 보세요."
          : "이번에는 <b>자석의 두 극</b>이 바뀌었어요. 네 손가락을 돌려 다시 맞춰 보세요.",
    );
    f.slot.ask(
      `자기장은 ${fing}, 전류는 ${thumb}으로 향할 때, 도선이 받는 힘의 방향은 어느 쪽인가요?`,
      [{ t: up ? "위쪽" : "아래쪽", ok: true }, { t: up ? "아래쪽" : "위쪽" }, { t: "힘을 받지 않아요" }],
      (ok) => {
        if (r === 0) api.recordQuiz(ok);
        shown = true;
        showAt = now;
        f.say(`도선이 <b>${up ? "위쪽" : "아래쪽"}</b>으로 힘을 받아 움직여요! 오른손 손바닥이 향한 방향과 일치하는지 확인해 보세요.`);
      },
      { why: `오른손 네 손가락을 ${fing}, 엄지손가락을 ${thumb}으로 향하게 펴면 손바닥이 <b>${up ? "위쪽" : "아래쪽"}</b>을 향해요.`, onNext: next },
    );
  }
  function next(): void {
    r += 1;
    if (r < ROUNDS.length) ask();
    else {
      f.pips(3);
      f.say("오른손을 펴서 자기장과 전류 방향에 맞추면 손바닥이 힘의 방향을 가리킨다는 것을 익혔어요!");
      f.slot.conclude("오른손을 펴서 <b>네 손가락</b>을 자기장의 방향(N극→S극), <b>엄지손가락</b>을 전류의 방향에 맞추면 <b>손바닥</b>이 향하는 쪽이 도선이 받는 <b>힘의 방향</b>이에요. 전류나 자기장 중 하나의 방향이 바뀌면 힘의 방향도 반대가 돼요.");
      api.enableCTA(s.cta ?? "다음");
    }
  }

  // 그림(2026-11-15 그래픽 감사 C107): 자석 둘과 도선을 모두 같은 비스듬한 시점의 입체(윗면, 옆면이 보이는 상자)로 그리고, 바닥 격자와 그림자로 깊이를 준다.
  //   도선은 앞 끝이 굵고 밝으며 뒤 끝으로 갈수록 가늘고 어둡다(멀어지는 쪽). 예전에는 자석만 정면 사각형이라 '뒤쪽'이 '오른쪽 위'와 섞여 읽혔다.
  //   깊이 z(뒤쪽이 +)는 오른쪽 위로 물러난다: 화면 x에 0.55z, 화면 y에 −0.38z.
  //   이름표: 자기장은 위 자기장 화살표 위, 전류는 화살표 머리 곁에서 힘과 반대쪽, 힘은 화살표 끝 왼쪽(답한 뒤 도선이 움직여도 자기장 선과 겹치지 않는다).
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
    const cy = 112;
    const P = (x: number, y: number, z: number): [number, number] => [cx + x + z * 0.55, cy - y - z * 0.38];
    const nC = "#E0503A";
    const sC = "#3D8FE8";
    const FLOOR = -54;
    const MZ = 50; // 자석의 깊이(반)
    const quad = (pts: [number, number][], fill: string, stroke = "rgba(11,21,36,.55)"): void => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };
    // 바닥 격자(깊이의 실마리)
    ctx.save();
    ctx.strokeStyle = "rgba(178,204,238,.13)";
    ctx.lineWidth = 1;
    for (let x = -150; x <= 150; x += 30) {
      ctx.beginPath();
      ctx.moveTo(...P(x, FLOOR, -84));
      ctx.lineTo(...P(x, FLOOR, 84));
      ctx.stroke();
    }
    for (let z = -84; z <= 84; z += 28) {
      ctx.beginPath();
      ctx.moveTo(...P(-150, FLOOR, z));
      ctx.lineTo(...P(150, FLOOR, z));
      ctx.stroke();
    }
    ctx.restore();
    // 자석: 윗면(밝게), 오른쪽 옆면(어둡게), 앞면
    const shade = (hex: string, f: number): string => {
      const n = parseInt(hex.slice(1), 16);
      const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, v * f)));
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    };
    const magnet = (x0: number, x1: number, col: string, name: string): void => {
      const y0 = FLOOR;
      const y1 = -FLOOR;
      quad([P(x0, y1, -MZ), P(x1, y1, -MZ), P(x1, y1, MZ), P(x0, y1, MZ)], shade(col, 1.22));
      quad([P(x1, y0, -MZ), P(x1, y0, MZ), P(x1, y1, MZ), P(x1, y1, -MZ)], shade(col, 0.72));
      quad([P(x0, y0, -MZ), P(x1, y0, -MZ), P(x1, y1, -MZ), P(x0, y1, -MZ)], col);
      const c = P((x0 + x1) / 2, 0, -MZ);
      xText(ctx, name, c[0], c[1], { px: 14, w: 800, color: "#fff" });
    };
    magnet(-140, -104, rd.nLeft ? nC : sC, rd.nLeft ? "N극" : "S극");
    // 자기장(N극에서 S극): 도선 위아래 두 줄. 화살 끝이 오른쪽 자석 앞면에 가리지 않게 ±72까지
    const d = rd.nLeft ? 1 : -1;
    for (const y of [50, -50]) {
      const p = P(-d * 72, y, 0);
      const q = P(d * 72, y, 0);
      xArrow(ctx, p[0], p[1], q[0], q[1], "rgba(255,123,107,.72)", 2.2, 8);
    }
    // 이름표는 화살 꼬리 위(±54: 왼쪽 자석 옆면의 오른쪽 위 모서리 x≈96에 걸치지 않는다)
    const fl = P(-d * 54, 50 + 13, 0);
    xText(ctx, "자기장", fl[0], fl[1], { px: 12, color: X.field });
    // 도선(앞에서 뒤로 뻗은 곧은 도선). 답하면 힘을 받아 움직인다. 앞 끝이 굵고 밝고, 뒤로 갈수록 가늘고 어둡다
    const lift = a * up * 12;
    const Z = 72;
    // 바닥에 비친 그림자
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,.28)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(...P(0, FLOOR, -Z));
    ctx.lineTo(...P(0, FLOOR, Z));
    ctx.stroke();
    ctx.restore();
    const N = 8;
    ctx.lineCap = "round";
    for (let i = N - 1; i >= 0; i--) {
      const za = -Z + (2 * Z * i) / N;
      const zb = -Z + (2 * Z * (i + 1)) / N;
      const f = 1 - (i + 0.5) / N; // 앞이 1
      const pa = P(0, lift, za);
      const pb = P(0, lift, zb);
      for (const [col, lw] of [[shade("#7A4B1E", 0.75 + 0.25 * f), 6 + 4 * f], [shade("#D9944A", 0.62 + 0.38 * f), 3.4 + 2.6 * f]] as [string, number][]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      }
    }
    magnet(104, 140, rd.nLeft ? sC : nC, rd.nLeft ? "S극" : "N극");
    const p0 = P(0, lift, -Z);
    const p1 = P(0, lift, Z);
    xText(ctx, "앞", p0[0] - 15, p0[1] - 2, { px: 12, color: X.dim });
    xText(ctx, "뒤", p1[0] + 15, p1[1] + 4, { px: 12, color: X.dim });
    // 전류(도선의 가운데 절반)
    const from = rd.back ? P(0, lift, -Z * 0.5) : P(0, lift, Z * 0.5);
    const to = rd.back ? P(0, lift, Z * 0.5) : P(0, lift, -Z * 0.5);
    xArrow(ctx, from[0], from[1], to[0], to[1], "#6E3F16", 5.4, 12);
    xArrow(ctx, from[0], from[1], to[0], to[1], X.cur, 2.8, 9);
    // 전류 이름표: 화살표 머리 곁, 힘이 향하는 쪽의 반대편(힘이 위면 오른쪽 아래, 아래면 왼쪽 위)
    const side = up > 0 ? 1 : -1;
    xText(ctx, "전류", to[0] + side * 19, to[1] + side * 13, { px: 12, color: X.cur });
    if (a > 0) {
      ctx.globalAlpha = a;
      const m = P(0, lift, 0);
      xArrow(ctx, m[0], m[1] - up * 7, m[0], m[1] - up * 36, "#0B2A33", 6.4, 14);
      xArrow(ctx, m[0], m[1] - up * 7, m[0], m[1] - up * 36, X.force, 3.6, 11);
      xText(ctx, "힘", m[0] - 15, m[1] - up * 30, { px: 13, color: X.force });
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
