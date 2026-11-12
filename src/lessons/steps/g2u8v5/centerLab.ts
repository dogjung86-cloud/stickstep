// [중2 Ⅷ v5] g2u8l7 centerLab: 「어느 은하에서 봐야 다른 은하가 멀어질까요?」
// 책의 어디에서: 본문(은하가 실제로 달아나는 것이 아니라 우주 공간이 팽창한다. 우주의 어느 곳에서 관측하더라도 외부 은하가 멀어진다. 팽창하는 우주에는 중심이 없다).
// 한 통찰: 공간이 고르게 늘어나면 어느 은하에서 봐도 다른 은하가 모두 멀어지고, 멀리 있는 은하일수록 더 많이 멀어진다. 그래서 중심이 없다.
// 학생이 정하는 것: 어느 은하에서 볼지. 은하는 모눈(공간)의 제자리에 그대로 있고 모눈만 늘어난다. 은하의 크기는 변하지 않는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers, bvTween } from "../bio6/b6Lab";
import { S, sArrow, sCanvas, sFrame, sLine, sLog, sSegs, sText, type LabStep } from "./kit";

type V = "0" | "1" | "2";
const GAL: { name: string; x: number; y: number; c: string }[] = [
  { name: "우리은하", x: 0, y: 0, c: "#FFE9A8" },
  { name: "은하 가", x: 1, y: 1, c: "#9CC4FF" },
  { name: "은하 나", x: -1, y: -1, c: "#FFB48A" },
  { name: "은하 다", x: 2, y: -1, c: "#C9B6FF" },
  { name: "은하 라", x: -2, y: 1, c: "#9FE8C8" },
];
const CELL = 38;
const BIG = 1.35;

export const centerLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let view = 0;
  let k = 1; // 공간이 늘어난 배율
  let busy = false;
  let finished = false;
  const log = sLog(["우리은하", "은하 가", "은하 나"], 3, true);
  const bGrow = bvBtn("main", "공간 늘리기");
  const seg = sSegs<V>(
    [
      { k: "0", t: "우리은하에서" },
      { k: "1", t: "은하 가에서" },
      { k: "2", t: "은하 나에서" },
    ],
    "0",
    (v) => {
      view = Number(v);
      k = 1;
      bGrow.disabled = false;
      f.say(`<b>${GAL[view].name}</b>에 서서 다른 은하를 봐요. <b>공간 늘리기</b>를 눌러 보세요.`);
    },
  );
  f.slot.setControls(seg.el, bGrow, log.el);

  bGrow.addEventListener("click", () => {
    if (busy || finished) return;
    haptic(HAPTIC.tap);
    busy = true;
    bGrow.disabled = true;
    seg.lock(true);
    bvTween(tm, 1500, (t) => (k = 1 + (BIG - 1) * t), () => {
      busy = false;
      seg.lock(false);
      haptic(HAPTIC.correct);
      log.set(view, "멀어짐");
      const n = [0, 1, 2].filter((i) => log.has(i)).length;
      f.pips(n);
      f.say(`${GAL[view].name}에서 보니 다른 은하가 <b>모두 멀어졌어요</b>. 멀리 있던 은하일수록 화살표가 길어요.${n < 3 ? " <b>다른 은하</b>에서도 봐요." : ""}`);
      if (n === 3) {
        finished = true;
        tm.later(() => {
          seg.lock(true);
          askFinal();
        }, 2000);
      }
    });
  });

  function askFinal(): void {
    f.say("세 은하에서 본 모습을 떠올리며 아래 질문에 답해 보세요.");
    f.slot.ask(
      "우주 팽창의 중심은 어디일까요?",
      [{ t: "중심이 따로 없어요", ok: true }, { t: "우리은하가 중심이에요" }, { t: "가장 먼 은하가 중심이에요" }],
      (ok) => api.recordQuiz(ok),
      { why: "<b>어느 은하에서 봐도</b> 다른 은하가 모두 멀어졌어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("탐험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("은하가 스스로 달아나는 것이 아니라 <b>공간이 늘어나요</b>. 어느 은하에서 봐도 다른 은하가 멀어지고 먼 은하일수록 더 많이 멀어져서, 팽창하는 우주에는 <b>중심이 없어요</b>.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const me = GAL[view];
    const g = CELL * k;
    // 모눈(공간)
    for (let i = -8; i <= 8; i++) {
      const x = cx + (i - me.x) * g;
      const y = cy + (i - me.y) * g;
      sLine(ctx, x, 0, x, h, "rgba(143,180,255,.2)", 1);
      sLine(ctx, 0, y, w, y, "rgba(143,180,255,.2)", 1);
    }
    GAL.forEach((q, i) => {
      const dx = q.x - me.x;
      const dy = q.y - me.y;
      const x = cx + dx * g;
      const y = cy + dy * g;
      // 처음 자리에서 지금 자리까지의 화살표
      if (i !== view && k > 1.02) {
        const ox = cx + dx * CELL;
        const oy = cy + dy * CELL;
        ctx.fillStyle = "rgba(255,255,255,.3)";
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fill();
        sArrow(ctx, ox, oy, x, y, S.gold, 2.2, 7);
      }
      // 은하(크기는 변하지 않는다)
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.5);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
      gr.addColorStop(0, "#fff");
      gr.addColorStop(0.3, q.c);
      gr.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gr;
      ctx.scale(1, 0.55);
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (x > 20 && x < w - 20 && y > 10 && y < h - 10) sText(ctx, q.name, x, y > h - 40 ? y - 17 : y + 17, { color: i === view ? "#fff" : S.dim, px: 12, w: i === view ? 800 : 700 });
    });
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.stroke();
    sText(ctx, k > 1.02 ? "모눈 한 칸이 넓어졌어요" : "흰 동그라미가 내가 선 곳", 10, 14, { color: S.dim, px: 12, align: "left" });
  });

  f.say("모눈은 <b>우주 공간</b>이고, 은하들은 모눈 위에 놓여 있어요. <b>공간 늘리기</b>를 눌러 우주를 팽창시켜 보세요.");
  api.setCTA("세 은하에서 팽창을 지켜보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
