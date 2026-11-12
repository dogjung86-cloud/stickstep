// [중2 Ⅶ v5] g2u7l4 formulaLab: 「그래프에서 어떤 식을 얻을 수 있을까요?」
// 책의 어디에서: 본문과 그림 '전압과 전류의 관계', '저항과 전류의 관계'(전류는 전압에 비례하고 저항에 반비례한다 → 전류 = 전압 ÷ 저항, V = IR).
// 한 통찰: 한 니크롬선에서는 어느 점에서나 전압 ÷ 전류가 같다(그 값이 저항). 전압이 같으면 저항이 2배일 때 전류는 절반이다. 그래서 전류 = 전압 ÷ 저항.
// 학생이 정하는 것: 그래프의 어느 점으로 나눗셈을 해 볼지, 어느 저항을 연결해 볼지(차례는 자유).
// 실패하는 길: 점을 한 개만 눌러서는 "늘 같다"를 말할 수 없어 다음으로 넘어가지 못한다(선마다 두 점 이상).
// 옛 판은 식을 개념 글에서 알려 주었다. 여기서는 앞 실험의 그래프를 학생이 직접 나누어 식을 얻는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xLog, xSegs, xText, type LabStep } from "./kit";
import { OHM, mA, viGraph } from "./ohmLab";

type Wire = "long" | "short";
const ALL = new Set([1, 2, 3, 4]);
const RS = [15, 30, 60];

export const formulaLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let phase: "A" | "B" | "end" = "A";
  let pick: { wire: Wire; i: number } | null = null;
  const got: Record<Wire, Set<number>> = { long: new Set(), short: new Set() };
  const rGot = new Set<number>();
  let rPick = 0;

  const log = xLog(["긴 니크롬선: 전압 ÷ 전류", "짧은 니크롬선: 전압 ÷ 전류"]);
  const next = bvBtn("main", "저항을 바꿔 보기");
  next.disabled = true;
  f.slot.setControls(log.el, next);

  const G = { x0: 46, y0: 190, gw: 150, gh: 140 };
  st.cv.addEventListener("pointerdown", (e) => {
    if (phase !== "A") return;
    const k = st.w() / 346;
    const p = st.pt(e);
    let best: { wire: Wire; i: number; d: number } | null = null;
    (["long", "short"] as Wire[]).forEach((wire) =>
      ALL.forEach((i) => {
        const d = Math.hypot(p.x / k - (G.x0 + ((i * 1.5) / 6) * G.gw), p.y / k - (G.y0 - (mA(wire, i) / 400) * G.gh));
        if (d < 26 && (!best || d < best.d)) best = { wire, i, d };
      }),
    );
    if (!best) return;
    const b = best as { wire: Wire; i: number };
    haptic(HAPTIC.tap);
    pick = { wire: b.wire, i: b.i };
    got[b.wire].add(b.i);
    log.set(b.wire === "long" ? 0 : 1, [...got[b.wire]].map(() => String(OHM[b.wire])).join(", "));
    const ready = got.long.size >= 2 && got.short.size >= 2;
    f.pips((got.long.size >= 2 ? 1 : 0) + (got.short.size >= 2 ? 1 : 0));
    next.disabled = !ready;
    f.say(ready ? "어느 점에서나 긴 선은 <b>30</b>, 짧은 선은 <b>15</b>예요. 이 값이 그 니크롬선의 <b>저항</b>이에요." : "같은 선의 <b>다른 점</b>도 눌러 나눠 보세요. 두 선 모두 두 점 이상 해 봐요.");
  });
  next.addEventListener("click", () => {
    if (phase !== "A") return;
    haptic(HAPTIC.tap);
    phase = "B";
    const seg = xSegs(
      [
        { k: "0", t: "고르기" },
        ...RS.map((r) => ({ k: String(r), t: `${r} Ω` })),
      ],
      "0",
      (k) => {
        rPick = Number(k);
        if (!rPick) return;
        rGot.add(rPick);
        if (rGot.size === RS.length) {
          haptic(HAPTIC.correct);
          f.pips(3);
          seg.lock(true);
          f.say("저항이 2배가 되면 전류는 <b>절반</b>이 돼요. 전류는 저항에 반비례해요.");
          tm.later(ask, 2600);
        } else f.say(`${rPick} Ω에 6 V를 걸자 <b>${Math.round(6000 / rPick)} mA</b>가 흘러요. 다른 저항도 연결해 보세요.`);
      },
    );
    seg.btn("0").hidden = true;
    seg.el.style.gridTemplateColumns = "repeat(3, 1fr)";
    f.slot.setControls(seg.el);
    f.say("이번에는 전압을 <b>6 V</b>로 두고 저항만 바꿔요. 세 저항을 모두 연결해 보세요.");
  });

  function ask(): void {
    phase = "end";
    f.slot.ask(
      "저항이 30 Ω인 니크롬선에 3 V의 전압을 걸면 전류는?",
      [{ t: "0.1 A", ok: true }, { t: "10 A" }, { t: "90 A" }],
      (ok) => api.recordQuiz(ok),
      { why: "전류 = 전압 ÷ 저항 = 3 ÷ 30 = <b>0.1 A</b>예요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전류는 전압에 비례하고 저항에 반비례해요. 그래서 <b>전류 = 전압 ÷ 저항</b>이에요. 전류를 I, 전압을 V, 저항을 R라고 하면 <b>V = IR</b>로 쓸 수 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    if (phase === "A") {
      viGraph(ctx, G.x0, G.y0, G.gw, G.gh, { long: ALL, short: ALL }, { lines: { long: true, short: true }, pick });
      xBox(ctx, 216, 40, 120, 132, 14, "rgba(255,255,255,.07)", X.line);
      if (pick) {
        const v = pick.i * OHM.step;
        const a = mA(pick.wire, pick.i) / 1000;
        xText(ctx, pick.wire === "long" ? "긴 니크롬선" : "짧은 니크롬선", 276, 58, { px: 12.5, color: pick.wire === "long" ? "#6FB6FF" : "#FFB25A" });
        xText(ctx, `${mA(pick.wire, pick.i)} mA = ${a} A`, 276, 84, { px: 12.5, color: X.dim });
        xText(ctx, `${v} V ÷ ${a} A`, 276, 112, { px: 15, w: 800 });
        xText(ctx, `= ${OHM[pick.wire]}`, 276, 142, { px: 24, w: 800, color: X.cur });
      } else {
        xText(ctx, "점을 누르면", 276, 92, { px: 13, color: X.dim });
        xText(ctx, "전압 ÷ 전류를", 276, 112, { px: 13, color: X.dim });
        xText(ctx, "계산해요", 276, 132, { px: 13, color: X.dim });
      }
    } else {
      // 저항과 전류의 그래프(전압 6 V)
      const x0 = 56;
      const y0 = 190;
      const gw = 250;
      const gh = 140;
      const RX = (r: number): number => x0 + (r / 60) * gw;
      const IY = (m: number): number => y0 - (m / 400) * gh;
      ctx.strokeStyle = "rgba(178,204,238,.16)";
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(RX(i * 15), y0);
        ctx.lineTo(RX(i * 15), y0 - gh);
        ctx.moveTo(x0, IY(i * 100));
        ctx.lineTo(x0 + gw, IY(i * 100));
        ctx.stroke();
      }
      ctx.strokeStyle = X.line;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0 - gh - 6);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0 + gw + 6, y0);
      ctx.stroke();
      for (let i = 0; i <= 4; i++) xText(ctx, String(i * 15), RX(i * 15), y0 + 11, { px: 12, color: X.dim, w: 600 });
      for (let i = 1; i <= 4; i++) xText(ctx, String(i * 100), x0 - 5, IY(i * 100), { px: 12, color: X.dim, w: 600, align: "right" });
      xText(ctx, "저항(Ω)", x0 + gw, y0 + 25, { px: 12, align: "right" });
      xText(ctx, "전류(mA)", x0 - 30, y0 - gh - 16, { px: 12, align: "left" });
      xText(ctx, "전압은 6 V로 같아요", x0 + gw, 22, { px: 12.5, color: X.cur, align: "right" });
      if (rGot.size === RS.length) {
        ctx.strokeStyle = "#7FE3C4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let r = 15; r <= 60; r += 1) (r === 15 ? ctx.moveTo : ctx.lineTo).call(ctx, RX(r), IY(6000 / r));
        ctx.stroke();
      }
      rGot.forEach((r) => {
        ctx.fillStyle = "#7FE3C4";
        ctx.beginPath();
        ctx.arc(RX(r), IY(6000 / r), r === rPick ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
        xText(ctx, `${Math.round(6000 / r)} mA`, RX(r) + (r === 60 ? -4 : 10), IY(6000 / r) - 14, { px: 12.5, color: "#7FE3C4", align: r === 60 ? "right" : "left" });
      });
    }
    ctx.restore();
  });

  f.say("앞 실험에서 그린 그래프예요. <b>점을 눌러</b> 그 점의 전압을 전류로 나눠 보세요.");
  api.setCTA("그래프의 점을 눌러 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
