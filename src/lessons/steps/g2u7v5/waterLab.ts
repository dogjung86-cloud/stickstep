// [중2 Ⅶ v5] g2u7l3 waterLab: 「물길과 전기 회로는 어디가 닮았을까요?」 (가로 화면)
// 책의 어디에서: 본문과 그림 '물의 흐름과 전류'(펌프, 수도관, 수도꼭지, 물레방아 ↔ 전지, 전선, 스위치, 전구), 스스로 확인하기 2번(물의 흐름에 비유해 설명하기).
// 한 통찰: 펌프가 물의 높이 차를 만들어 물을 계속 흐르게 하듯, 전지는 전압으로 전류를 계속 흐르게 한다.
// 학생이 정하는 것: 펌프의 세기(전지의 수), 수도꼭지(스위치)를 여닫는 것, 어느 부분이 어느 부분과 짝인지 눌러 찾는 것.
// 실패하는 길: 펌프가 없으면 수도꼭지를 열어도 물이 흐르지 않고, 수도꼭지를 잠그면 펌프가 있어도 흐르지 않는다(전기 회로도 똑같이 멈춘다).
// 옛 랩(waterCircuit3d)은 3D 장면에서 짝을 눌렀다. 여기서는 두 그림을 나란히 놓고 같은 조작 하나로 함께 움직여 견준다.
// 세로 화면의 무대에는 같은 그림을 작게 보여 주고, 조작은 가로 화면에서 한다. 가로 화면은 한 화면 검사의 대상이 아니다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawSwitch, drawWire } from "../../../ui/elecKit";
import type { RotateStage } from "../../../ui/rotateStage";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xSegs, xText, type LabStep } from "./kit";

type PairKey = "pump" | "gap" | "flow" | "tap" | "wheel";
const PAIRS: { k: PairKey; a: string; b: string }[] = [
  { k: "pump", a: "펌프", b: "전지" },
  { k: "gap", a: "물의 높이 차", b: "전압" },
  { k: "flow", a: "물의 흐름", b: "전류" },
  { k: "tap", a: "수도꼭지", b: "스위치" },
  { k: "wheel", a: "물레방아", b: "전구" },
];
interface View {
  level: 0 | 1 | 2;
  open: boolean;
  found: Set<PairKey>;
  hot: PairKey | null;
  spin: number;
  ph: number;
}
type Rect = [number, number, number, number];

/** 두 그림을 w×h 판에 그린다. 눌러 찾을 자리(왼쪽 그림과 오른쪽 그림 각각)를 돌려준다. */
function drawPair(ctx: CanvasRenderingContext2D, w: number, h: number, v: View, labels: boolean): Record<PairKey, Rect[]> {
  const big = w > 500;
  const fs = big ? 13.5 : 12;
  const pw = w / 2;
  const base = h * (big ? 0.68 : 0.84);
  const rise = h * (big ? 0.18 : 0.22) + (v.level === 2 ? h * (big ? 0.12 : 0.16) : 0);
  const top = base - rise;
  const on = v.level > 0 && v.open;
  const hits = {} as Record<PairKey, Rect[]>;
  const mark = (k: PairKey, r: Rect, name: string): void => {
    (hits[k] ??= []).push(r);
    const done = v.found.has(k);
    if (v.hot === k || done) {
      ctx.save();
      ctx.strokeStyle = v.hot === k ? "#FFE08A" : "rgba(255,224,138,.45)";
      ctx.lineWidth = v.hot === k ? 2.5 : 1.5;
      ctx.setLineDash(v.hot === k ? [] : [5, 4]);
      ctx.beginPath();
      ctx.roundRect(r[0], r[1], r[2], r[3], 10);
      ctx.stroke();
      ctx.restore();
    }
    if (labels && done) xText(ctx, name, r[0] + r[2] / 2, r[1] - 9, { px: fs, color: "#FFE08A", w: 800 });
  };
  // ── 왼쪽: 물길 ──
  const px = pw * 0.2;
  const fx = pw * 0.78;
  const wat = "#4FA8F2";
  // 아래 물길과 위 물길
  xBox(ctx, pw * 0.1, base, pw * 0.8, 12, 4, "rgba(79,168,242,.85)", "#2B6FB8");
  xBox(ctx, px - 6, top - 10, fx - px + 12, 10, 3, v.level > 0 ? "rgba(79,168,242,.85)" : "rgba(143,164,194,.18)", "#8FA4C2");
  // 펌프 관
  xBox(ctx, px - 7, top - 10, 14, base - top + 16, 4, "rgba(143,164,194,.35)", "#8FA4C2");
  if (v.level > 0) {
    ctx.fillStyle = wat;
    for (let i = 0; i < 5; i++) {
      const y = base - (((v.ph * (on ? 1 : 0) * 26 + i * 22) % (base - top)) + 2);
      ctx.fillRect(px - 3, y, 6, 8);
    }
  }
  xBox(ctx, px - 13, top - 30 - v.level * 5, 26, 22 + v.level * 5, 6, v.level > 0 ? "#E0503A" : "rgba(224,80,58,.3)", "#8E2A1C");
  // 수도꼭지
  const tx = (px + fx) / 2;
  xBox(ctx, tx - 4, top - 24, 8, 16, 2, "#B9C4D4", "#66738A");
  xBox(ctx, tx - 13, top - 30, 26, 7, 3, v.open ? "#37C08E" : "#F25757", "#3A465C");
  if (!v.open) xBox(ctx, tx - 2, top - 10, 4, 10, 1, "#3A465C");
  // 떨어지는 물과 물레방아
  const wy = (top + base) / 2 + 4;
  const wr = Math.min(rise * 0.42, big ? 34 : 22);
  if (on) {
    ctx.fillStyle = "rgba(79,168,242,.8)";
    ctx.fillRect(fx + 2, top - 2, 7, base - top + 2);
  }
  ctx.save();
  ctx.translate(fx - wr * 0.55, wy);
  ctx.rotate(v.spin);
  ctx.strokeStyle = "#D9A866";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, wr, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (wr + 4), Math.sin(a) * (wr + 4));
    ctx.stroke();
  }
  ctx.restore();
  // 높이 차 표시
  const gx = pw * 0.4;
  if (v.level > 0) {
    xArrow(ctx, gx, top + 6, gx, base - 3, "rgba(232,238,249,.7)", 1.6, 6);
    xArrow(ctx, gx, base - 6, gx, top + 3, "rgba(232,238,249,.7)", 1.6, 6);
  }
  if (on) {
    xArrow(ctx, tx + 46, top - 18, tx + 74, top - 18, wat, 2.2, 7);
    xArrow(ctx, pw * 0.6, base + 24, pw * 0.44, base + 24, wat, 2.2, 7);
  }
  // ── 오른쪽: 전기 회로 ──
  const ox = pw;
  const L = ox + pw * 0.2;
  const Rr = ox + pw * 0.78;
  const T = base - h * (big ? 0.36 : 0.38);
  const B = base + 6;
  const mid = (T + B) / 2;
  const flow = v.ph * 0.5;
  const wire = (pts: [number, number][]): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on, flow, dir: 1, width: big ? 4 : 3 });
  wire([[L, mid - 30], [L, T], [(L + Rr) / 2 - 24, T]]);
  wire([[(L + Rr) / 2 + 24, T], [Rr, T], [Rr, mid - 16]]);
  wire([[Rr, mid + 16], [Rr, B], [L, B], [L, mid + 30]]);
  drawSwitch(ctx, (L + Rr) / 2, T, v.open, 48);
  drawBulb(ctx, Rr, mid, big ? 22 : 16, on ? v.level / 2 : 0);
  if (v.level === 0) {
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#8FA4C2";
    ctx.strokeRect(L - 12, mid - 28, 24, 56);
    ctx.restore();
  } else if (v.level === 1) drawBattery(ctx, L, mid, 56, 24, false, true);
  else {
    drawBattery(ctx, L, mid - 15, 30, 22, false, true);
    drawBattery(ctx, L, mid + 15, 30, 22, false, true);
  }
  if (on) xArrow(ctx, (L + Rr) / 2 + 30, T - 16, (L + Rr) / 2 + 56, T - 16, X.cur, 2.2, 7);
  // 가운데 금
  ctx.strokeStyle = "rgba(143,164,194,.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pw, h * 0.12);
  ctx.lineTo(pw, base + 30);
  ctx.stroke();
  xText(ctx, "물길", pw * 0.5, big ? base + 44 : 16, { px: fs + 1, w: 800 });
  xText(ctx, "전기 회로", ox + pw * 0.5, big ? base + 44 : 16, { px: fs + 1, w: 800 });
  // 눌러 찾을 자리(왼쪽, 오른쪽)
  mark("pump", [px - 22, top - 40, 44, 44], "펌프");
  mark("pump", [L - 22, mid - 34, 44, 68], "전지");
  mark("gap", [gx - 22, top + 18, 44, base - top - 18], "높이 차");
  mark("gap", [L + 26, mid - 22, 50, 44], "전압");
  mark("flow", [tx + 38, top - 34, 46, 30], "물의 흐름");
  mark("flow", [(L + Rr) / 2 + 26, T - 34, 44, 30], "전류");
  mark("tap", [tx - 22, top - 40, 34, 44], "수도꼭지");
  mark("tap", [(L + Rr) / 2 - 24, T - 20, 48, 40], "스위치");
  mark("wheel", [fx - wr * 0.55 - wr - 4, wy - wr - 4, wr * 2 + 8, wr * 2 + 8], "물레방아");
  mark("wheel", [Rr - 24, mid - 26, 48, 52], "전구");
  return hits;
}

export const waterLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();
  const v: View = { level: 1, open: true, found: new Set(), hot: null, spin: 0, ph: 0 };
  const tried = { off: false, strong: false };
  let rot: RotateStage | null = null;
  let rotLoop: Loop | null = null;
  let finished = false;
  let asked = false;

  const tick = (dt: number): void => {
    const on = v.level > 0 && v.open;
    v.ph += (dt / 60) * (on ? v.level : 0);
    v.spin += (dt / 60) * (on ? v.level * 1.6 : 0);
  };
  st.run((ctx, w, h, _t, dt) => {
    if (!rot) tick(dt);
    drawPair(ctx, w, h, v, false);
  });

  const go = bvBtn("main", "가로 화면에서 실험하기");
  f.slot.setControls(go);
  const missionDone = (): boolean => v.found.size === PAIRS.length && tried.off && tried.strong;

  go.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    void enter();
  });

  async function enter(): Promise<void> {
    if (rot) return;
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (!tm.alive()) return;
    rot = enterRotateStage({ title: "닮은 곳을 눌러 짝을 찾아요", onLeave: leave });
    const cv = el("canvas", { class: "g2u7x-wcv" }) as HTMLCanvasElement;
    const status = el("div", { class: "g2u7x-wsay" });
    const lv = xSegs(
      [
        { k: "0", t: "펌프·전지 없음" },
        { k: "1", t: "약하게" },
        { k: "2", t: "세게" },
      ],
      String(v.level) as "0" | "1" | "2",
      (k) => {
        v.level = Number(k) as 0 | 1 | 2;
        if (v.level === 2) tried.strong = true;
        if (v.level === 0) tried.off = true;
        say();
      },
    );
    const tapBtn = el("button", { class: "g2u7x-wtap", text: "수도꼭지·스위치 잠그기", attrs: { type: "button" } }) as HTMLButtonElement;
    tapBtn.addEventListener("click", () => {
      haptic(HAPTIC.tap);
      v.open = !v.open;
      if (!v.open) tried.off = true;
      tapBtn.textContent = v.open ? "수도꼭지·스위치 잠그기" : "수도꼭지·스위치 열기";
      say();
    });
    const bar = el("div", { class: "g2u7x-wbar" }, lv.el, tapBtn);
    rot.stage.append(cv, status, bar);
    let hits = {} as Record<PairKey, Rect[]>;
    const say = (msg?: string): void => {
      const left = PAIRS.filter((p) => !v.found.has(p.k)).length;
      const on = v.level > 0 && v.open;
      const base = msg ?? (!on ? (v.level === 0 ? "펌프도 전지도 없어 물도 전류도 흐르지 않아요." : "수도꼭지를 잠그고 스위치를 열자 물도 전류도 멈췄어요.") : v.level === 2 ? "높이 차가 커지자 물이 세게 흐르고 전구도 더 밝아요." : "두 그림에서 닮은 곳을 눌러 보세요.");
      status.innerHTML = missionDone() ? "다 찾았어요! <b>세로로 돌아가기</b>를 눌러 마무리해요." : `${base} <b>남은 짝 ${left}개</b>${tried.strong ? "" : " · 세게 해 보기"}${tried.off ? "" : " · 잠가 보기"}`;
      status.dataset.done = missionDone() ? "1" : "0";
    };
    cv.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      for (const pair of PAIRS) {
        if ((hits[pair.k] ?? []).some(([x, y, w2, h2]) => p.x >= x - 6 && p.x <= x + w2 + 6 && p.y >= y - 6 && p.y <= y + h2 + 6)) {
          haptic(v.found.has(pair.k) ? HAPTIC.tap : HAPTIC.correct);
          v.found.add(pair.k);
          v.hot = pair.k;
          say(`<b>${pair.a}</b>의 짝은 <b>${pair.b}</b>예요.`);
          return;
        }
      }
    });
    if (import.meta.env.DEV) (cv as unknown as { __hits: () => unknown }).__hits = () => hits;
    say();
    rotLoop = createLoop((dt) => {
      if (!rot) return;
      const { w, h } = rot.size();
      const d = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) {
        cv.width = Math.round(w * d);
        cv.height = Math.round(h * d);
        cv.style.width = `${w}px`;
        cv.style.height = `${h}px`;
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, w, h);
      tick(dt);
      hits = drawPair(ctx, w, h, v, true);
    }).start();
  }
  function leave(): void {
    rotLoop?.stop();
    rotLoop = null;
    rot?.dispose();
    rot = null;
    v.hot = null;
    f.pips(missionDone() ? 1 : 0);
    if (missionDone() && !asked) {
      asked = true;
      finished = true;
      v.level = 1;
      v.open = true;
      tm.later(ask1, 500);
    } else if (!finished) f.say("아직 찾지 못한 짝이 있어요. <b>가로 화면</b>에서 닮은 곳을 모두 눌러 보세요.");
  }
  function ask1(): void {
    f.say("두 그림을 견줘 봤어요. 아래 질문에 답해 보세요.");
    f.slot.ask(
      "물길의 펌프와 같은 일을 하는 것은?",
      [{ t: "전지", ok: true }, { t: "전구" }, { t: "스위치" }],
      (ok) => api.recordQuiz(ok),
      { why: "펌프가 물을 퍼 올려 흐르게 하듯 <b>전지</b>가 전류를 흐르게 해요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.pips(2);
    f.slot.ask(
      "펌프를 세게 해 물의 높이 차가 커지자 물의 흐름은?",
      [{ t: "더 세졌어요", ok: true }, { t: "그대로였어요" }, { t: "더 약해졌어요" }],
      () => undefined,
      { why: "전지를 2개로 늘리자 <b>전구도 더 밝아졌어요</b>.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("펌프가 물의 <b>높이 차</b>를 만들어 물을 계속 흐르게 하듯, 전지는 <b>전압</b>으로 전류를 계속 흐르게 해요. 전압은 전류를 흐르게 하는 능력이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.say("왼쪽은 물길, 오른쪽은 전기 회로예요. <b>가로 화면</b>에서 두 그림을 함께 움직이며 닮은 곳을 찾아요.");
  api.setCTA("가로 화면에서 짝을 찾아보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
    rotLoop?.stop();
    rot?.dispose();
    rot = null;
  };
};
