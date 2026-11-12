// [중2 Ⅷ v5] g2u8l2 spreadLab: 「거리가 2배가 되면 빛은 몇 칸에 퍼질까요?」
// 책의 어디에서: 그림 '거리에 따른 별의 밝기 변화'(거리 r, 2r, 3r에서 별빛을 받는 면적이 1, 4, 9배).
// 한 통찰: 별빛은 퍼지면서 거리의 제곱만큼 넓은 면에 나뉘므로, 한 칸이 받는 빛은 거리의 제곱에 반비례한다.
// 학생이 정하는 것: 판을 어느 거리에 세울지. 예측을 먼저 건다(채점하지 않는다).
// 그림은 계산으로 그린다: 별에서 나간 빛알 36개(6×6 방향)는 개수가 변하지 않고, 판의 거리에 비례해 벌어진다. 판의 칸 크기는 늘 같다.

import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { S, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sSegs, sText, type LabStep } from "./kit";

type K = "1" | "2" | "3";
const U = 26; // 한 칸의 한 변
const SKX = 0.5; // 깊이 방향의 기울임(가로)
const SKY = -0.36; // 깊이 방향의 기울임(세로)

export const spreadLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let k = 1;
  let kShow = 1;
  let started = false;
  let finished = false;
  const seen = new Set<number>();
  const log = sLog(["거리 1배", "거리 2배", "거리 3배"], 1, true);

  const visit = (n: number): void => {
    k = n;
    seen.add(n);
    log.set(n - 1, `${n * n}칸, 한 칸에 ${36 / (n * n)}알`);
    f.pips(seen.size);
    f.say(n === 1 ? "거리 1배: 빛알 36개가 <b>1칸</b>에 모두 들어와요." : `거리 ${n}배: 같은 빛알 36개가 <b>${n * n}칸</b>에 나뉘어, 한 칸에는 <b>${36 / (n * n)}알</b>만 들어와요.`);
    if (seen.size === 3 && !finished) {
      finished = true;
      tm.later(() => {
        seg.lock(true);
        askFinal();
      }, 1500);
    }
  };
  const seg = sSegs<K>(
    [
      { k: "1", t: "거리 1배" },
      { k: "2", t: "거리 2배" },
      { k: "3", t: "거리 3배" },
    ],
    "1",
    (v) => visit(Number(v)),
  );

  function askFinal(): void {
    f.say("기록을 보고 아래 질문에 답해 보세요.");
    f.slot.ask(
      "거리가 3배인 판에서 한 칸이 받는 빛은 1배일 때의?",
      [{ t: "9분의 1", ok: true }, { t: "3분의 1" }, { t: "6분의 1" }],
      (ok) => api.recordQuiz(ok),
      { why: "36알이 <b>9칸</b>에 나뉘어 한 칸에 <b>4알</b>이 들어왔어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("거리가 2배, 3배가 되면 빛을 받는 넓이는 <b>4배, 9배</b>가 되고, 한 칸이 받는 빛은 <b>4분의 1, 9분의 1</b>이 돼요. 밝기는 거리의 제곱에 반비례해요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    const sx = 34;
    const sy = h / 2 + 14;
    const step = (w - sx - 62) / 3;
    kShow += (k - kShow) * Math.min(1, dt * 0.2);
    // 판 위의 점 (세로 y, 깊이 z)를 화면으로
    const P = (n: number, y: number, z: number): [number, number] => [sx + n * step + z * SKX, sy + y + z * SKY];
    const quad = (n: number, y0: number, z0: number, y1: number, z1: number): void => {
      const a = P(n, y0, z0);
      const b = P(n, y0, z1);
      const c = P(n, y1, z1);
      const d = P(n, y1, z0);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
    };
    // 별에서 가장 먼 판의 네 귀퉁이로 가는 빛
    const far = (3 * U) / 2;
    [
      [-far, -far],
      [-far, far],
      [far, far],
      [far, -far],
    ].forEach(([y, z]) => {
      const p = P(3, y, z);
      sLine(ctx, sx, sy, p[0], p[1], "rgba(255,209,102,.4)", 1.2);
    });
    // 세 거리의 판
    for (let n = 1; n <= 3; n++) {
      const half = (n * U) / 2;
      const on = started && n === k;
      quad(n, -half, -half, half, half);
      ctx.fillStyle = on ? "rgba(255,233,168,.16)" : "rgba(143,180,255,.05)";
      ctx.fill();
      ctx.strokeStyle = on ? S.gold : "rgba(178,204,238,.4)";
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      for (let i = 1; i < n; i++) {
        const v = -half + i * U;
        const a = P(n, v, -half);
        const b = P(n, v, half);
        const c = P(n, -half, v);
        const d = P(n, half, v);
        sLine(ctx, a[0], a[1], b[0], b[1], on ? S.gold : "rgba(178,204,238,.3)", 1);
        sLine(ctx, c[0], c[1], d[0], d[1], on ? S.gold : "rgba(178,204,238,.3)", 1);
      }
      const base = P(n, half, -half);
      sText(ctx, `${n}배`, base[0] - 4, base[1] + 14, { color: on ? S.gold : S.dim, px: 12.5, w: on ? 800 : 700 });
    }
    // 고른 판의 한 칸을 밝혀 준다
    if (started) {
      const half = (k * U) / 2;
      quad(k, -half, -half, -half + U, -half + U);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    // 빛알 36개(방향은 그대로, 거리만큼 벌어진다)
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 6; j++) {
        const y = ((i + 0.5) / 6 - 0.5) * U * kShow;
        const z = ((j + 0.5) / 6 - 0.5) * U * kShow;
        const p = P(kShow, y, z);
        sDisk(ctx, p[0], p[1], 2.1, "#FFE9A8");
      }
    sGlow(ctx, sx, sy, 15, S.star, 0.4);
    sText(ctx, "별", sx, sy + 26, { color: S.ink, px: 12.5 });
    // 읽을 값
    sText(ctx, `빛을 받는 칸 ${k * k}칸`, w - 12, 20, { color: S.ink, px: 13, align: "right", w: 800 });
    sText(ctx, `흰 테두리 한 칸에 ${36 / (k * k)}알`, w - 12, 39, { color: S.gold, px: 13, align: "right", w: 800 });
    sText(ctx, "빛알은 모두 36개", 12, 20, { color: S.dim, px: 12, align: "left" });
  });

  f.say("별에서 나온 <b>빛알 36개</b>가 판에 닿아요. 먼저 예측해 보세요.");
  api.setCTA("판을 세 거리에 세워 보세요", { enabled: false });
  f.slot.ask(
    "판을 2배 거리로 옮기면 빛이 닿는 칸은 몇 칸이 될까요?",
    [{ t: "2칸" }, { t: "4칸" }, { t: "1칸 그대로" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        started = true;
        f.slot.setControls(seg.el, log.el);
        visit(1);
        f.say("예측 완료! <b>거리 2배</b>, <b>거리 3배</b>를 눌러 판을 옮기고 칸과 빛알을 세어 보세요.");
      },
    },
  );
  return () => {
    tm.clear();
    st.stop();
  };
};
