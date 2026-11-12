// [중2 Ⅶ v5] g2u7l4 ohmLab: 「전압을 올리면 전류는 얼마나 세질까요?」
// 책의 어디에서: 탐구 '전류, 전압, 저항 사이의 관계 탐구하기'(전원 장치, 길이가 다른 니크롬선 두 개, 전압 센서, 전류 센서. 전압을 조금씩 올리며 전류를 보고,
//   전압을 0으로 낮춘 뒤 짧은 니크롬선으로 바꿔 되풀이한다. 두 그래프를 그린다).
// 한 통찰: 전류의 세기는 전압에 비례한다. 같은 전압이면 짧은 니크롬선에 더 센 전류가 흐른다.
// 학생이 정하는 것: 어느 니크롬선을 연결할지, 전압을 얼마로 맞출지, 어느 값을 그래프에 찍을지.
// 실패하는 길: 전압을 0으로 낮추지 않고 니크롬선을 바꾸려 하면 바뀌지 않는다(안전 수칙). 점이 셋보다 적으면 직선이 그려지지 않는다.
// 옛 랩(ohmLab)은 막대를 밀면 그래프가 저절로 그려졌다. 여기서는 학생이 고른 값만 점으로 찍히고, 점이 모여야 직선이 보인다.
// 값: 긴 니크롬선 30 Ω, 짧은 니크롬선 15 Ω(자체 설정). 전압은 1.5 V씩 6 V까지.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xSegs, xText, type LabStep } from "./kit";

export const OHM = { long: 30, short: 15, step: 1.5 };
type Wire = "long" | "short";
const COLOR: Record<Wire, string> = { long: "#6FB6FF", short: "#FFB25A" };
const NAME: Record<Wire, string> = { long: "긴 니크롬선", short: "짧은 니크롬선" };
export const mA = (wire: Wire, i: number): number => Math.round(((i * OHM.step) / OHM[wire]) * 1000);

/** 전압과 전류의 그래프 판. 두 랩이 함께 쓴다. */
export function viGraph(ctx: CanvasRenderingContext2D, x0: number, y0: number, gw: number, gh: number, pts: Record<Wire, Set<number>>, o: { live?: { wire: Wire; i: number }; lines?: Partial<Record<Wire, boolean>>; pick?: { wire: Wire; i: number } | null } = {}): void {
  const X6 = (v: number): number => x0 + (v / 6) * gw;
  const Y4 = (m: number): number => y0 - (m / 400) * gh;
  ctx.save();
  ctx.strokeStyle = "rgba(178,204,238,.16)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(X6(i * 1.5), y0);
    ctx.lineTo(X6(i * 1.5), y0 - gh);
    ctx.moveTo(x0, Y4(i * 100));
    ctx.lineTo(x0 + gw, Y4(i * 100));
    ctx.stroke();
  }
  ctx.strokeStyle = X.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0 - gh - 6);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x0 + gw + 6, y0);
  ctx.stroke();
  ctx.restore();
  for (let i = 0; i <= 4; i++) xText(ctx, String(i * 1.5), X6(i * 1.5), y0 + 11, { px: 12, color: X.dim, w: 600 });
  for (let i = 1; i <= 4; i++) xText(ctx, String(i * 100), x0 - 5, Y4(i * 100), { px: 12, color: X.dim, w: 600, align: "right" });
  xText(ctx, "전압(V)", x0 + gw, y0 + 25, { px: 12, color: X.ink, align: "right" });
  xText(ctx, "전류(mA)", x0 - 26, y0 - gh - 16, { px: 12, color: X.ink, align: "left" });
  (["long", "short"] as Wire[]).forEach((wire) => {
    if (o.lines?.[wire]) {
      ctx.save();
      ctx.strokeStyle = COLOR[wire];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X6(0), Y4(0));
      ctx.lineTo(X6(6), Y4(mA(wire, 4)));
      ctx.stroke();
      ctx.restore();
      xText(ctx, wire === "long" ? "긴 선" : "짧은 선", X6(6) - 4, Y4(mA(wire, 4)) - 11, { px: 12, color: COLOR[wire], align: "right" });
    }
    pts[wire].forEach((i) => {
      const hot = o.pick?.wire === wire && o.pick.i === i;
      ctx.fillStyle = COLOR[wire];
      ctx.beginPath();
      ctx.arc(X6(i * 1.5), Y4(mA(wire, i)), hot ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (hot) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  });
  if (o.live) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(X6(o.live.i * 1.5), Y4(mA(o.live.wire, o.live.i)), 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export const ohmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let wire: Wire = "long";
  let vi = 0;
  let finished = false;
  let warn = 0;
  const pts: Record<Wire, Set<number>> = { long: new Set(), short: new Set() };
  const lineOk = (w: Wire): boolean => [1, 2, 3, 4].filter((i) => pts[w].has(i)).length >= 3;

  const pick = xSegs<Wire>(
    [
      { k: "long", t: "긴 니크롬선" },
      { k: "short", t: "짧은 니크롬선" },
    ],
    "long",
    (k) => {
      wire = k;
      f.say(`<b>${NAME[k]}</b>을 연결했어요. 전압을 올리며 전류를 보고, 그래프에 찍어 보세요.`);
    },
    () => {
      if (vi === 0) return true;
      haptic(HAPTIC.wrong);
      warn = 1;
      f.say("니크롬선은 전압을 <b>0으로 낮춘 뒤</b>에 바꿔요. 전류가 흐르는 채로 바꾸면 위험해요.");
      return false;
    },
  );
  const volt = bvRange({
    cls: "g2u7x-r",
    min: 0,
    max: 4,
    value: 0,
    label: "전원 장치의 전압",
    ticks: ["0 V", "1.5", "3", "4.5", "6 V"],
    onInput: (v) => {
      vi = v;
      rec.disabled = finished;
    },
  });
  const rec = bvBtn("main", "지금 값을 그래프에 찍기");
  f.slot.setControls(pick.el, volt.el, rec);

  rec.addEventListener("click", () => {
    if (finished) return;
    if (pts[wire].has(vi)) {
      f.say("이미 찍은 값이에요. <b>전압을 바꿔서</b> 다른 값을 찍어 보세요.");
      return;
    }
    haptic(HAPTIC.tap);
    pts[wire].add(vi);
    const done = (lineOk("long") ? 1 : 0) + (lineOk("short") ? 1 : 0);
    f.pips(done);
    if (lineOk(wire)) {
      haptic(HAPTIC.correct);
      if (done === 2) {
        finished = true;
        rec.disabled = true;
        volt.input.disabled = true;
        pick.lock(true);
        f.say("두 니크롬선 모두 점들이 <b>원점을 지나는 직선</b> 위에 놓였어요.");
        tm.later(ask1, 2600);
      } else f.say(`점들이 <b>직선</b>으로 이어졌어요. 전압을 0으로 낮추고 ${wire === "long" ? "짧은" : "긴"} 니크롬선으로 바꿔 보세요.`);
    } else f.say(`${vi * OHM.step} V일 때 <b>${mA(wire, vi)} mA</b>를 찍었어요. 전압을 바꿔 가며 더 찍어 보세요.`);
  });

  function ask1(): void {
    f.slot.ask(
      "한 니크롬선에서 전압을 2배로 올리면 전류의 세기는?",
      [{ t: "2배가 돼요", ok: true }, { t: "그대로예요" }, { t: "절반이 돼요" }],
      (ok) => api.recordQuiz(ok),
      { why: "긴 선은 3 V에 100 mA, 6 V에 <b>200 mA</b>가 흘렀어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(3);
    f.slot.ask(
      "같은 전압에서 더 센 전류가 흐른 쪽은?",
      [{ t: "짧은 니크롬선", ok: true }, { t: "긴 니크롬선" }, { t: "둘이 같았어요" }],
      () => undefined,
      { why: "3 V에서 긴 선은 100 mA, 짧은 선은 <b>200 mA</b>였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전류의 세기는 <b>전압에 비례</b>해요. 전압이 2배, 3배가 되면 전류도 2배, 3배가 돼요. 같은 전압이면 짧은 니크롬선에 더 센 전류가 흘러요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    if (warn > 0) warn = Math.max(0, warn - dt / 50);
    const shake = warn > 0 ? Math.sin(t / 22) * 3 * warn : 0;
    // 전원 장치
    xBox(ctx, 12, 14, 124, 58, 12, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전원 장치", 74, 28, { px: 12, color: X.dim });
    xText(ctx, `${(vi * OHM.step).toFixed(1)} V`, 74, 52, { px: 20, w: 800, color: vi ? X.cur : X.ink });
    // 니크롬선(길이가 다르다)
    const len = wire === "long" ? 104 : 52;
    const wx = 74 - len / 2 + shake;
    ctx.strokeStyle = "rgba(143,164,194,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, 72);
    ctx.lineTo(22, 104);
    ctx.lineTo(wx, 104);
    ctx.moveTo(126, 72);
    ctx.lineTo(126, 104);
    ctx.lineTo(wx + len, 104);
    ctx.stroke();
    ctx.strokeStyle = vi ? `rgba(255,${190 - vi * 22},${120 - vi * 22},1)` : "#C9D1DE";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= len; i += 4) {
      const y = 104 + (i % 8 ? 5 : -5);
      if (i === 0) ctx.moveTo(wx, 104);
      ctx.lineTo(wx + i, i === len ? 104 : y);
    }
    ctx.stroke();
    xText(ctx, NAME[wire], 74, 124, { px: 12, color: COLOR[wire] });
    // 센서의 값
    xBox(ctx, 12, 140, 58, 50, 10, "rgba(255,255,255,.07)", X.line);
    xBox(ctx, 78, 140, 58, 50, 10, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전압 센서", 41, 153, { px: 12, color: X.dim, w: 600 });
    xText(ctx, "전류 센서", 107, 153, { px: 12, color: X.dim, w: 600 });
    xText(ctx, `${(vi * OHM.step).toFixed(1)} V`, 41, 174, { px: 14, w: 800 });
    xText(ctx, `${mA(wire, vi)} mA`, 107, 174, { px: 14, w: 800, color: COLOR[wire] });
    xText(ctx, "1 mA는 1 A의 천분의 일", 74, 208, { px: 12, color: X.dim, w: 600 });
    viGraph(ctx, 200, 190, 128, 140, pts, { live: { wire, i: vi }, lines: { long: lineOk("long"), short: lineOk("short") } });
    ctx.restore();
  });

  f.say("전원 장치에 <b>긴 니크롬선</b>을 연결했어요. 전압을 올리며 전류를 보고, 그래프에 점을 찍어 보세요.");
  api.setCTA("두 니크롬선의 그래프를 그려 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
