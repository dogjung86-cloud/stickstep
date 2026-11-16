// [중2 Ⅶ v5] g2u7l5 parCurLab: 「갈림길에서 전류는?」
// 책의 어디에서: 본문(저항을 병렬로 연결하면 전체 전류가 각 저항에 나뉘어 흐른다), 그림 '전기 기구의 병렬연결'.
// 한 통찰: 병렬에서는 갈래마다 같은 전압이 걸린다. 그래서 저항이 작은 갈래에 전류가 더 많이 흐르고, 갈래의 전류를 더하면 나뉘기 전의 전류다.
// 걸음: ① 15 Ω과 15 Ω에서 나뉘기 전, 갈래 A, 갈래 B, 합친 뒤를 잰다 → ② 예측한 뒤 B의 저항을 바꿔 잰다 → ③ 남은 저항으로도 잰다 → ④ 판정.
// 학생이 정하는 것: 갈래 B의 저항, 전류계를 댈 자리.
// 실패하는 길: 갈래 하나만 재서는 "나뉜다"와 "더하면 전체"를 볼 수 없다(나뉘기 전과 두 갈래를 모두 재야 기록된다).
// 깨려는 생각: "갈림길에서는 늘 반반이다", "한 갈래의 저항을 바꾸면 다른 갈래의 전류도 바뀐다".
// 값: 전지 3 V, A는 15 Ω이라 늘 0.2 A. B가 15 Ω이면 0.2 A(전체 0.4 A), 30 Ω이면 0.1 A(0.3 A), 10 Ω이면 0.3 A(0.5 A).

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { BAT, C, G, cRes, cSpot, cTag, hit, type Pt } from "./circuitKit";
import { X, xCanvas, xFrame, xLog, xPill, xSegs, xText, type LabStep } from "./kit";

type RB = "15" | "30" | "10";
const YA = 66;
const YB = 126;
const RX = 150;
const CASES: Record<RB, { b: number; all: number; row: string }> = {
  "15": { b: 0.2, all: 0.4, row: "0.2 A + 0.2 A = 0.4 A" },
  "30": { b: 0.1, all: 0.3, row: "0.2 A + 0.1 A = 0.3 A" },
  "10": { b: 0.3, all: 0.5, row: "0.2 A + 0.3 A = 0.5 A" },
};
const ORDER: RB[] = ["15", "30", "10"];
interface Spot {
  id: "in" | "A" | "B" | "out";
  x: number;
  y: number;
  tx: number;
  ty: number;
}
const SPOTS: Spot[] = [
  { id: "in", x: G.R, y: 162, tx: G.R - 40, ty: 162 },
  { id: "A", x: 238, y: YA, tx: 238, ty: YA - 24 },
  { id: "B", x: 238, y: YB, tx: 238, ty: YB - 24 },
  { id: "out", x: G.L, y: 162, tx: G.L + 40, ty: 162 },
];
const fmt = (a: number): string => `${a.toFixed(1)} A`;

export const parCurLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api, tall: true });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let rb: RB = "15";
  let finished = false;
  let asked = false;
  let asking = false;
  let pa = 0; // 알갱이의 자리(갈래 A, 갈래 B, 나뉘기 전과 합친 뒤)
  let pb = 0;
  let pm = 0;
  const got = new Set<string>();
  const doneCase = new Set<RB>();
  const log = xLog(ORDER.map((k) => `15 Ω과 ${k} Ω`), 1, true);
  const val = (id: Spot["id"]): number => (id === "A" ? 0.2 : id === "B" ? CASES[rb].b : CASES[rb].all);
  const need = (): Spot["id"][] => (doneCase.size === 0 ? ["in", "A", "B", "out"] : ["in", "A", "B"]);

  const seg = xSegs<RB>(
    ORDER.map((k) => ({ k, t: `저항 B: ${k} Ω` })),
    "15",
    (k) => apply(k),
    (k) => {
      if (asking || finished) return false;
      if (!doneCase.has("15")) {
        f.say("먼저 현재 회로에서 <b>점선 네 곳</b>을 모두 눌러 각 지점의 전류를 측정해 보세요.");
        return false;
      }
      if (asked) return true;
      predict(k);
      return false;
    },
  );
  f.slot.setControls(seg.el, log.el);

  function apply(k: RB): void {
    rb = k;
    got.clear();
    if (doneCase.has(k)) {
      SPOTS.forEach((q) => got.add(q.id));
      f.say(`이미 잰 회로예요. 두 갈래의 전류를 더하면 <b>${fmt(CASES[k].all)}</b>였어요.`);
    } else f.say(`B를 <b>${k} Ω</b>으로 바꿨어요. 나뉘기 전과 두 갈래의 전류를 재 보세요.`);
  }
  function predict(k: RB): void {
    asking = true;
    api.setCTA("먼저 예측해 보세요", { enabled: false });
    const up = k === "30";
    f.slot.ask(
      `아래쪽 갈래 B의 저항을 15 Ω에서 ${k} Ω으로 ${up ? "크게 하면" : "작게 하면"} 두 갈래의 전류는 어떻게 될까요?`,
      [{ t: `B에 흐르는 전류만 ${up ? "줄어들어요" : "늘어나요"}`, ok: true }, { t: `A에 흐르는 전류가 ${up ? "줄어들어요" : "늘어나요"}` }, { t: "두 갈래에 여전히 똑같이 나뉘어 흘러요" }],
      () => undefined,
      {
        predict: true,
        onNext: () => {
          asked = true;
          asking = false;
          f.slot.showControls();
          seg.set(k);
          apply(k);
          api.setCTA("나뉘기 전과 두 갈래를 재 보세요", { enabled: false });
        },
      },
    );
  }
  function measured(id: Spot["id"]): void {
    const left = need().filter((q) => !got.has(q));
    if (left.length || doneCase.has(rb)) {
      const name = { in: "나뉘기 전", A: "갈래 A", B: "갈래 B", out: "합친 뒤" };
      if (left.length) f.say(`<b>${fmt(val(id))}</b>예요. 남은 점선(${left.map((q) => name[q]).join(", ")})도 재 보세요.`);
      return;
    }
    doneCase.add(rb);
    log.set(ORDER.indexOf(rb), CASES[rb].row);
    f.pips(doneCase.size);
    if (rb === "15") f.say("전체 전류 0.4 A가 갈림길에서 <b>0.2 A씩</b> 똑같이 나뉘어 흐른 뒤, 다시 만나 0.4 A로 합쳐져요. 이제 아래에서 저항 B의 크기를 바꿔 보세요.");
    else if (rb === "30") f.say("위쪽 A는 0.2 A 그대로인데, 저항이 커진 B의 전류만 <b>0.1 A</b>로 줄었어요! 두 갈래를 더하면 전체 전류인 0.3 A와 같아요.");
    else f.say("이번에는 저항이 작아진 B로 더 센 전류(<b>0.3 A</b>)가 흘러요! A(0.2 A)와 B(0.3 A)를 더하면 전체 전류인 0.5 A가 돼요.");
    if (doneCase.size === ORDER.length && !finished) {
      finished = true;
      seg.lock(true);
      api.setCTA("세 경우를 모두 쟀어요", { enabled: false });
      tm.later(ask1, 3200);
    } else if (doneCase.size > 1) api.setCTA("남은 저항으로도 바꿔 재 보세요", { enabled: false });
  }
  st.cv.addEventListener("pointerdown", (e) => {
    if (finished || asking) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const sp = hit(SPOTS.filter((q) => !got.has(q.id) && (q.id !== "out" || doneCase.size === 0)), p.x / k, p.y / k, 30);
    if (!sp) return;
    haptic(HAPTIC.tap);
    got.add(sp.id);
    measured(sp.id);
  });

  function ask1(): void {
    f.slot.ask(
      "병렬연결에서 저항이 작은 갈래로 전류가 더 많이 흐르는 까닭은 무엇인가요?",
      [{ t: "전압이 같을 때 저항이 작을수록 전류가 세서", ok: true }, { t: "저항이 작은 갈래에 전압이 더 크게 걸려서" }, { t: "저항이 작은 갈래가 전지에 더 가까이 있어서" }],
      (ok) => api.recordQuiz(ok),
      { why: "병렬 회로의 두 갈래에는 똑같이 3 V가 걸려요. 전류 = 전압 ÷ 저항이므로 <b>저항이 작을수록</b> 더 센 전류가 흘러요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "병렬 회로의 두 갈래에 흐르는 전류가 각각 0.3 A와 0.1 A라면, 두 갈래가 합쳐진 뒤 흐르는 전체 전류는 몇 A일까요?",
      [{ t: "0.4 A", ok: true }, { t: "0.2 A" }, { t: "0.3 A" }],
      () => undefined,
      { why: "각 갈래에 흐르는 전류를 모두 더하면 전체 전류와 같아요(0.3 A + 0.1 A = <b>0.4 A</b>).", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("병렬 회로에서 전류는 저항에 반비례하여 나뉘어 흐르고, 합치면 전체 전류와 같다는 것을 확인했어요!");
    f.slot.conclude("병렬연결에서는 전체 전류가 갈림길에서 각 갈래로 <b>나뉘어 흘러요</b>. 각 갈래에 걸리는 전압이 같으므로 <b>저항이 작은 갈래</b>에 더 센 전류가 흐르며, 각 갈래의 전류를 모두 더하면 <b>회로 전체의 전류</b>와 같아요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t, dt) => {
    const k = w / 346;
    const cs = CASES[rb];
    // 알갱이의 빠르기는 전류의 세기에 비례한다(0.1 A에 1)
    pa += (dt / 60) * 2 * 1.1;
    pb += (dt / 60) * cs.b * 10 * 1.1;
    pm += (dt / 60) * cs.all * 10 * 1.1;
    ctx.save();
    ctx.scale(k, k);
    const W = (pts: Pt[], flow: number): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on: true, flow, dir: 1, width: 3.5 });
    const paths: [Pt[], number, number][] = [
      [[[BAT.out, G.By], [G.R, G.By], [G.R, YB]], pm, cs.all],
      [[[G.R, YB], [G.R, YA], [RX + 23, YA]], pa, 0.2],
      [[[G.R, YB], [RX + 23, YB]], pb, cs.b],
      [[[RX - 23, YA], [G.L, YA], [G.L, YB]], pa, 0.2],
      [[[RX - 23, YB], [G.L, YB]], pb, cs.b],
      [[[G.L, YB], [G.L, G.By], [BAT.in, G.By]], pm, cs.all],
    ];
    paths.forEach(([pts, flow]) => W(pts, flow));
    // 전류 띠(2026-11-15 그래픽 감사 C097): 굵기를 그 길의 전류에 비례하게(0.1 A에 3.6). 나뉘기 전과 합친 뒤가 가장 굵고,
    // 저항이 작은 갈래가 더 굵다. 멈춘 화면에서도 어느 갈래에 더 많이 흐르는지 그림이 말한다. 알갱이가 비쳐 보이게 옅게 덮는다
    ctx.save();
    ctx.strokeStyle = "rgba(255,212,0,.36)";
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    paths.forEach(([pts, , amp]) => {
      ctx.lineWidth = amp * 36;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    });
    ctx.restore();
    drawBattery(ctx, BAT.x, G.By, G.bw, 30, false);
    xText(ctx, "전지 3 V", BAT.x, G.By - 25, { px: 12, color: X.dim });
    cRes(ctx, RX, YA, { name: "A", ohm: "15 Ω" });
    cRes(ctx, RX, YB, { name: "B", ohm: `${rb} Ω` });
    SPOTS.forEach((q) => {
      if (got.has(q.id)) cTag(ctx, q.tx, q.ty, fmt(val(q.id)), C.amp);
      else if (!finished && !asking && (q.id !== "out" || doneCase.size === 0)) cSpot(ctx, q.x, q.y, C.amp, t);
    });
    ctx.restore();
    xPill(ctx, "병렬: 길이 두 갈래", X.cur);
  });

  f.say("전류가 갈림길에서 위아래 두 갈래로 나뉘어 흘러요. <b>점선 네 곳</b>을 차례로 눌러 전류의 세기를 비교해 보세요.");
  api.setCTA("네 곳의 전류를 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
