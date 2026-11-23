// [중2 Ⅷ v5] g2u8l7 centerLab: 「어느 은하에서 봐야 다른 은하가 멀어질까요?」
// 다루는 내용: 본문(은하가 실제로 달아나는 것이 아니라 우주 공간이 팽창한다. 우주의 어느 곳에서 관측하더라도 외부 은하가 멀어진다. 팽창하는 우주에는 중심이 없다).
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
const CELL = 30; // 모눈 한 칸(늘리기 전)
const BIG = 1.5; // 공간이 늘어나는 배율. 세 관측 자리 어디서나 네 은하가 무대 가장자리 20px 안쪽에 든다(가장 먼 은하가 ±3칸 × 45 = 135px)

export const centerLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api, tall: true });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let view = 0;
  let k = 1; // 공간이 늘어난 배율
  let busy = false;
  let finished = false;
  const log = sLog(["우리은하", "은하 가", "은하 나"], 3, true);
  const bGrow = bvBtn("main", "우주 공간 팽창시키기");
  const seg = sSegs<V>(
    [
      { k: "0", t: "우리은하에서 관측" },
      { k: "1", t: "은하 가에서 관측" },
      { k: "2", t: "은하 나에서 관측" },
    ],
    "0",
    (v) => {
      view = Number(v);
      k = 1;
      bGrow.disabled = false;
      // 관측 자리의 이름(우리은하, 은하 가, 은하 나)은 모두 받침 없이 끝나 '(흰 원)로'가 맞다
      f.say(`관측 위치를 <b>${GAL[view].name}</b>(흰 원)로 옮겼어요. <b>우주 공간 팽창시키기</b>를 눌러 다른 은하들이 어떻게 보이는지 확인해 보세요.`);
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
      f.say(`<b>${GAL[view].name}</b>에서 관측하니 다른 모든 은하가 <b>사방으로 멀어졌어요</b>! 멀리 있는 은하일수록 이동 화살표가 더 길어요.${n < 3 ? " 이제 위 탭에서 <b>다른 은하</b>도 골라 관측해 보세요." : ""}`);
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
    f.say("우리은하, 은하 가, 은하 나 세 곳에서 모두 우주 팽창을 관측했어요!");
    f.slot.ask(
      "세 은하에서 관측한 결과로 볼 때, 팽창하는 우주의 중심은 어디인가요?",
      [{ t: "특별한 중심이 따로 없어요", ok: true }, { t: "우리은하가 우주의 중심이에요" }, { t: "가장 멀리 있는 은하가 중심이에요" }],
      (ok) => api.recordQuiz(ok),
      { why: "우주 공간이 모든 곳에서 고르게 팽창하므로, <b>어느 은하에서 관측하더라도</b> 다른 은하들이 모두 멀어져요. 따라서 팽창의 중심은 없어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("우주 공간이 고르게 팽창하기 때문에 어느 은하에서 보든 다른 은하들이 멀어지며, 우주 팽창에는 중심이 없다는 것을 확인했어요!");
    f.slot.conclude("은하가 스스로 달아나는 것이 아니라 <b>공간이 늘어나요</b>. 어느 은하에서 봐도 다른 은하가 멀어지고 먼 은하일수록 더 많이 멀어져서, 팽창하는 우주에는 <b>중심이 없어요</b>.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const me = GAL[view];
    const g = CELL * k;
    // 안내 글은 늘어난 뒤의 은하와 겹치지 않는 쪽(위 또는 아래)에 둔다
    const capBottom = GAL.some((q, i) => i !== view && cx + (q.x - me.x) * CELL * BIG < 175 && cy + (q.y - me.y) * CELL * BIG < 44);
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
    });
    // 이름표: 내가 선 은하는 흰 동그라미 바깥 아래에. 다른 은하는 화살표(처음 자리에서 지금 자리까지)와 겹치지 않는 자리를
    // 차례로 찾는다(내가 선 곳에서 먼 쪽 위아래, 반대쪽 위아래, 왼쪽, 오른쪽).
    const arrows = GAL.map((q, i) => (i === view || k <= 1.02 ? null : [cx + (q.x - me.x) * CELL, cy + (q.y - me.y) * CELL, cx + (q.x - me.x) * g, cy + (q.y - me.y) * g]));
    ctx.save();
    ctx.font = "700 12px Pretendard, system-ui, sans-serif";
    // 가리면 안 되는 것: 흰 동그라미와 그 아래 이름표, 다섯 은하의 몸
    const meW = ctx.measureText(me.name).width;
    const blocks: [number, number, number, number][] = [
      [cx - 21, cy - 21, cx + 21, cy + 21],
      [cx - meW / 2, cy + 24, cx + meW / 2, cy + 38],
      ...GAL.map((q): [number, number, number, number] => {
        const gx = cx + (q.x - me.x) * g;
        const gy = cy + (q.y - me.y) * g;
        return [gx - 14, gy - 8, gx + 14, gy + 8];
      }),
    ];
    const hits = (x0: number, y0: number, x1: number, y1: number): boolean =>
      x0 < 4 || x1 > w - 4 || y0 < 3 || y1 > h - 3 ||
      blocks.some((b) => x0 < b[2] + 2 && x1 > b[0] - 2 && y0 < b[3] + 2 && y1 > b[1] - 2) ||
      arrows.some((a) => {
        if (!a) return false;
        for (let t = 0; t <= 1; t += 1 / 16) {
          const px = a[0] + (a[2] - a[0]) * t;
          const py = a[1] + (a[3] - a[1]) * t;
          if (px > x0 - 4 && px < x1 + 4 && py > y0 - 4 && py < y1 + 4) return true;
        }
        return false;
      });
    GAL.forEach((q, i) => {
      const x = cx + (q.x - me.x) * g;
      const y = cy + (q.y - me.y) * g;
      if (i === view) return sText(ctx, q.name, x, y + 31, { color: "#fff", px: 12, w: 800 });
      if (x < 20 || x > w - 20 || y < 10 || y > h - 10) return;
      const tw = ctx.measureText(q.name).width;
      const out = y < cy - 2 ? -17 : 17;
      const cands: [number, number, CanvasTextAlign][] = [
        [x, y + out, "center"],
        [x, y - out, "center"],
        [x - 17, y, "right"],
        [x + 17, y, "left"],
      ];
      const box = ([lx, ly, al]: [number, number, CanvasTextAlign]): [number, number, number, number] => {
        const x0 = al === "center" ? lx - tw / 2 : al === "right" ? lx - tw : lx;
        return [x0, ly - 7, x0 + tw, ly + 7];
      };
      const pick = cands.find((c) => !hits(...box(c))) ?? cands[0];
      sText(ctx, q.name, pick[0], pick[1], { color: S.dim, px: 12, align: pick[2] });
    });
    ctx.restore();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.stroke();
    sText(ctx, k > 1.02 ? "모눈 한 칸이 넓어졌어요" : "흰 동그라미가 내가 선 곳", 10, capBottom ? h - 13 : 14, { color: S.dim, px: 12, align: "left" });
  });

  f.say("모눈은 <b>우주 공간</b>이고, 은하들은 모눈 위에 놓여 있어요. <b>우주 공간 팽창시키기</b>를 눌러 보세요.");
  api.setCTA("세 은하에서 팽창을 지켜보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
