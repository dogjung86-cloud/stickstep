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
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let phase: "A" | "B" | "end" = "A";
  let pick: { wire: Wire; i: number } | null = null;
  const got: Record<Wire, Set<number>> = { long: new Set(), short: new Set() };
  const rGot = new Set<number>();
  let rPick = 0;

  const log = xLog(["긴 니크롬선 (전압 ÷ 전류)", "짧은 니크롬선 (전압 ÷ 전류)"]);
  const next = bvBtn("main", "저항 크기 바꿔 보기");
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
    f.say(ready ? "어느 점을 골라도 전압 ÷ 전류 값은 긴 선이 <b>30 Ω</b>, 짧은 선이 <b>15 Ω</b>으로 일정해요! 이 일정한 값이 바로 각 니크롬선의 <b>저항</b>이에요." : "같은 직선 위의 <b>다른 점</b>도 눌러 전압 ÷ 전류 값이 같은지 확인해 보세요. 두 직선 모두 두 점 이상 눌러 보세요.");
  });
  next.addEventListener("click", () => {
    if (phase !== "A") return;
    haptic(HAPTIC.tap);
    phase = "B";
    const goAsk = bvBtn("main", "확인 문제 풀기");
    goAsk.disabled = true;
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
          goAsk.disabled = false;
          f.say("전압이 같을 때 저항이 2배 커지면 전류는 <b>절반(1/2)</b>이 돼요! 확인한 뒤 <b>확인 문제 풀기</b>를 눌러 보세요.");
        } else f.say(`저항 ${rPick} Ω에 6 V를 걸자 전류가 <b>${Math.round(6000 / rPick)} mA</b> 흘러요. 다른 크기의 저항도 연결해 보세요.`);
      },
    );
    goAsk.addEventListener("click", () => {
      if (phase !== "B" || rGot.size < RS.length) return;
      haptic(HAPTIC.tap);
      seg.lock(true);
      goAsk.disabled = true;
      ask();
    });
    seg.btn("0").hidden = true;
    seg.el.style.gridTemplateColumns = "repeat(3, 1fr)";
    f.slot.setControls(seg.el, goAsk);
    f.say("이번에는 전압을 <b>6 V</b>로 일정하게 유지하고 저항 크기만 바꿔 볼게요. 15 Ω, 30 Ω, 60 Ω을 차례로 연결해 보세요.");
  });

  function ask(): void {
    phase = "end";
    f.slot.ask(
      "저항이 30 Ω인 니크롬선에 3 V의 전압을 걸어 주면 몇 A의 전류가 흐를까요?",
      [{ t: "0.1 A", ok: true }, { t: "10 A" }, { t: "90 A" }],
      (ok) => api.recordQuiz(ok),
      { why: "전류 = 전압 ÷ 저항이므로, 3 V ÷ 30 Ω = <b>0.1 A</b>(100 mA)의 전류가 흘러요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("전류는 전압에 비례하고 저항에 반비례한다는 관계를 발견했어요!");
    f.slot.conclude("도선에 흐르는 전류의 세기는 전압에 비례하고 저항에 반비례해요(<b>전류 = 전압 ÷ 저항</b>). 전류를 I, 전압을 V, 저항을 R라 하면 <b>I = V/R</b> 또는 <b>V = IR</b>로 나타낼 수 있어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    if (phase === "A") {
      viGraph(ctx, G.x0, G.y0, G.gw, G.gh, { long: ALL, short: ALL }, { lines: { long: true, short: true }, pick });
      // 두 직선을 모두 확인하면 3 V 기준선으로 '기울기가 가파를수록 저항이 작다' 오개념을 바로잡아 준다
      if (got.long.size >= 2 && got.short.size >= 2) {
        const x3 = G.x0 + (3 / 6) * G.gw;
        const y100 = G.y0 - (100 / 400) * G.gh;
        const y200 = G.y0 - (200 / 400) * G.gh;
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "rgba(255,212,0,.78)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x3, G.y0);
        ctx.lineTo(x3, y200);
        ctx.stroke();
        ctx.restore();
        xText(ctx, "3 V 비교: 2배", x3 - 8, y200 - 14, { px: 12, color: "#FFE08A", align: "right" });
        ctx.fillStyle = "#FFE08A";
        for (const yy of [y100, y200]) {
          ctx.beginPath();
          ctx.arc(x3, yy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      xBox(ctx, 212, 34, 126, 146, 14, "rgba(255,255,255,.07)", X.line);
      if (pick) {
        const v = pick.i * OHM.step;
        const ma = mA(pick.wire, pick.i);
        const a = ma / 1000;
        xText(ctx, pick.wire === "long" ? "긴 니크롬선" : "짧은 니크롬선", 275, 51, { px: 12.5, color: pick.wire === "long" ? "#6FB6FF" : "#FFB25A" });
        // 단위 변환 강조 배지(mA → A)
        xBox(ctx, 220, 64, 110, 24, 7, "rgba(255,212,0,.14)", "rgba(255,212,0,.45)", 1.2);
        xText(ctx, `${ma} mA → ${a} A`, 275, 76.5, { px: 12, w: 800, color: "#FFE08A" });
        xText(ctx, "÷ 1000 단위 변환", 275, 98, { px: 12, color: X.dim });
        xText(ctx, `${v} V ÷ ${a} A`, 275, 122, { px: 14.5, w: 800 });
        xText(ctx, `= ${OHM[pick.wire]} Ω`, 275, 152, { px: 23, w: 800, color: X.cur });
      } else {
        xText(ctx, "점을 누르면", 275, 86, { px: 13, color: X.dim });
        xText(ctx, "mA를 A로 바꿔", 275, 108, { px: 12.5, color: "#FFE08A" });
        xText(ctx, "전압 ÷ 전류를", 275, 128, { px: 13, color: X.dim });
        xText(ctx, "계산해요", 275, 148, { px: 13, color: X.dim });
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

  f.say("앞 실험에서 얻은 전압과 전류 그래프예요. 그래프 위의 <b>점들을 직접 눌러</b> 각 점의 (전압 ÷ 전류) 값을 구해 보세요.");
  api.setCTA("그래프의 점들을 눌러 규칙을 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
