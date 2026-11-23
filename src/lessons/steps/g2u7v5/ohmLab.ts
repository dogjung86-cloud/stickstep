// [중2 Ⅶ v5] g2u7l4 ohmLab: 「전압을 올리면 전류는 얼마나 세질까요?」
// 다루는 내용: 탐구 활동(전원 장치, 길이가 다른 니크롬선 두 개, 전압 센서, 전류 센서. 전압을 조금씩 올리며 전류를 보고,
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
  let ready = false;
  let finished = false;
  let warn = 0;
  let eFlow = 0;
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
      f.say(`회로에 <b>${NAME[k]}</b>을 연결했어요. 전압을 바꾸며 전류의 세기를 확인하고 그래프에 점을 찍어 보세요.`);
    },
    () => {
      if (vi === 0) return true;
      haptic(HAPTIC.wrong);
      warn = 1;
      f.say("니크롬선을 교체할 때는 먼저 전압을 <b>0 V로 낮춰야</b> 해요. 전류가 흐르는 상태에서 바꾸면 뜨겁고 위험해요!");
      return false;
    },
  );
  const volt = bvRange({
    cls: "g2u7x-r",
    min: 0,
    max: 4,
    value: 0,
    label: "전원 장치의 전압 (V)",
    ticks: ["0 V", "1.5 V", "3.0 V", "4.5 V", "6.0 V"],
    onInput: (v) => {
      vi = v;
      rec.disabled = finished;
    },
  });
  const rec = bvBtn("main", "측정한 값 그래프에 찍기");
  f.slot.setControls(pick.el, volt.el, rec);

  rec.addEventListener("click", () => {
    if (finished) return;
    if (ready) {
      haptic(HAPTIC.tap);
      finished = true;
      rec.disabled = true;
      volt.input.disabled = true;
      pick.lock(true);
      ask1();
      return;
    }
    if (pts[wire].has(vi)) {
      f.say("이미 그래프에 기록한 전압이에요. 슬라이더로 <b>전압을 바꿔서</b> 다른 점을 찍어 보세요.");
      return;
    }
    haptic(HAPTIC.tap);
    pts[wire].add(vi);
    const done = (lineOk("long") ? 1 : 0) + (lineOk("short") ? 1 : 0);
    f.pips(done);
    if (lineOk(wire)) {
      haptic(HAPTIC.correct);
      if (done === 2) {
        ready = true;
        rec.textContent = "그래프 결과 확인하기";
        f.say("두 선 모두 <b>원점을 지나는 직선</b>이 완성됐어요! 비교해 본 뒤 <b>그래프 결과 확인하기</b>를 눌러 보세요.");
      } else f.say(`점들이 <b>원점을 지나는 직선</b>으로 이어졌어요! 이제 전압을 0 V로 낮추고 <b>${wire === "long" ? "짧은" : "긴"} 니크롬선</b>으로 바꿔 실험해 보세요.`);
    } else f.say(`전압이 ${vi * OHM.step} V일 때 전류 <b>${mA(wire, vi)} mA</b>에 점을 찍었어요. 다른 전압에서도 측정해 보세요.`);
  });

  function ask1(): void {
    f.slot.ask(
      "같은 니크롬선에서 전압을 2배로 높이면 전류의 세기는 어떻게 되나요?",
      [{ t: "2배로 세져요", ok: true }, { t: "그대로예요" }, { t: "절반으로 줄어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "긴 니크롬선에 3 V를 걸었을 때 100 mA, 6 V를 걸었을 때 <b>200 mA</b>가 흘러 전압에 비례했어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(3);
    f.slot.ask(
      "같은 전압을 걸었을 때 전류가 더 세게 흐른 것은 어느 쪽인가요?",
      [{ t: "짧은 니크롬선", ok: true }, { t: "긴 니크롬선" }, { t: "두 니크롬선이 같았어요" }],
      () => undefined,
      { why: "예를 들어 3 V일 때 긴 니크롬선에는 100 mA, 짧은 니크롬선에는 <b>200 mA</b>가 흘렀어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("전류의 세기는 전압에 비례하며, 니크롬선에 따라 기울기가 다르다는 것을 확인했어요!");
    f.slot.conclude("전류의 세기는 <b>전압에 비례</b>해요. 전압이 2배, 3배로 높아지면 전류의 세기도 2배, 3배로 세져요. 또한 같은 전압일 때는 긴 니크롬선보다 짧은 니크롬선에 더 센 전류가 흘러요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    if (warn > 0) warn = Math.max(0, warn - dt / 50);
    const shake = warn > 0 ? Math.sin(t / 22) * 3 * warn : 0;
    // 그림(2026-11-15 그래픽 감사 C095): 탐구 활동의 장치 그림처럼 계기를 회로에 잇는다. 전류 센서는 전원 장치의 (+)단자와 니크롬선 사이 한 줄(직렬)에,
    //   전압 센서는 집게 둘을 니크롬선 양 끝에 물려 나란히(병렬) 단다. 숫자 상자는 그대로 두고 잇는 선만 더했다.
    const lead = "rgba(143,164,194,.85)";
    const line = (pts: [number, number][], color: string, lw: number): void => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineJoin = "round";
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    };
    const clip = (x: number, y: number, color: string): void => {
      // 집게: 작은 사다리꼴 머리
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 2);
      ctx.lineTo(x + 4, y + 2);
      ctx.lineTo(x + 3, y + 10);
      ctx.lineTo(x - 3, y + 10);
      ctx.closePath();
      ctx.fill();
    };
    // 전원 장치(아래 두 단자: 왼쪽 (−), 오른쪽 (+))
    xBox(ctx, 12, 10, 112, 48, 12, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전원 장치", 68, 23, { px: 12, color: X.dim });
    xText(ctx, `${(vi * OHM.step).toFixed(1)} V`, 68, 43, { px: 18, w: 800, color: vi ? X.cur : X.ink });
    for (const [x, s] of [[16, "−"], [114, "+"]] as [number, string][]) {
      ctx.fillStyle = "#8FA4C2";
      ctx.beginPath();
      ctx.arc(x, 58, 4, 0, Math.PI * 2);
      ctx.fill();
      xText(ctx, s, x + (s === "+" ? -10 : 10), 64, { px: 12, color: X.dim, w: 800 });
    }
    // 니크롬선(길이가 다르다): 가운데 x 68, 높이 128
    const len = wire === "long" ? 104 : 52;
    const wx = 68 - len / 2 + shake;
    const WY = 128;
    // 전류 센서: (+)단자 → 센서 → 니크롬선 오른쪽 끝(한 줄로)
    xBox(ctx, 100, 70, 68, 40, 10, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전류 센서", 134, 81, { px: 12, color: X.dim, w: 600 });
    xText(ctx, `${mA(wire, vi)} mA`, 134, 99, { px: 14, w: 800, color: COLOR[wire] });
    line([[114, 58], [114, 70]], lead, 2);
    line([[154, 110], [154, WY], [wx + len, WY]], lead, 2);
    // (−)단자 → 니크롬선 왼쪽 끝
    line([[16, 58], [16, WY], [wx, WY]], lead, 2);
    // 니크롬선(원자핵 방해물 + 이동하는 전자 흐름으로 길이·저항 차이를 직관적으로 보인다)
    const curMa = mA(wire, vi);
    eFlow = (eFlow + (dt / 60) * (curMa / 110)) % 1;
    if (vi > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 168, 92, ${(0.12 + vi * 0.08).toFixed(2)})`;
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(wx, WY);
      ctx.lineTo(wx + len, WY);
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = vi ? `rgba(255,${190 - vi * 22},${120 - vi * 22},1)` : "#C9D1DE";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= len; i += 4) {
      const y = WY + (i % 8 ? 5 : -5);
      if (i === 0) ctx.moveTo(wx, WY);
      ctx.lineTo(wx + i, i === len ? WY : y);
    }
    ctx.stroke();
    // 원자핵 방해물(긴 선은 7개, 짧은 선은 3개)
    const cores = wire === "long" ? 7 : 3;
    for (let c = 0; c < cores; c++) {
      const cx0 = wx + ((c + 0.5) / cores) * len;
      ctx.fillStyle = "rgba(255,157,138,.78)";
      ctx.beginPath();
      ctx.arc(cx0, WY + (c % 2 ? -2.2 : 2.2), 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // 전류가 흐를 때 니크롬선을 지나는 전자 흐름(전압이 높고 저항이 작을수록 빠르게 이동)
    if (vi > 0) {
      const nDot = wire === "long" ? 5 : 3;
      ctx.fillStyle = "#88CCFF";
      for (let d = 0; d < nDot; d++) {
        const u = (d / nDot + eFlow) % 1;
        const ex = wx + u * len;
        const ey = WY + Math.sin(u * Math.PI * cores * 2) * 3.8;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    xText(ctx, NAME[wire], 60, WY - 16, { px: 12, color: COLOR[wire] });
    // 전압 센서: 집게 둘을 니크롬선 양 끝에(나란히)
    const volt = "#9BE8C4";
    xBox(ctx, 22, 160, 92, 40, 10, "rgba(255,255,255,.07)", X.line);
    xText(ctx, "전압 센서", 68, 171, { px: 12, color: X.dim, w: 600 });
    xText(ctx, `${(vi * OHM.step).toFixed(1)} V`, 68, 189, { px: 14, w: 800 });
    for (const x of [wx, wx + len]) {
      const bx = Math.min(104, Math.max(32, x));
      line([[bx, 160], [bx, WY + 18], [x, WY + 10]], volt, 1.5);
      clip(x, WY, volt);
    }
    xText(ctx, "1 mA는 1 A의 천분의 일", 68, 216, { px: 12, color: X.dim, w: 600 });
    viGraph(ctx, 200, 190, 128, 140, pts, { live: { wire, i: vi }, lines: { long: lineOk("long"), short: lineOk("short") } });
    ctx.restore();
  });

  f.say("전원 장치에 <b>긴 니크롬선</b>을 연결했어요. 슬라이더로 전압을 바꾸며 전류의 세기를 확인하고 그래프에 점을 찍어 보세요.");
  api.setCTA("두 니크롬선의 그래프를 완성해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
