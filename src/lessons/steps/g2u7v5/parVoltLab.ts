// [중2 Ⅶ v5] g2u7l5 parVoltLab: 「병렬의 전압은 왜 같을까요?」
// 책의 어디에서: 본문(저항을 병렬로 연결하면 각 저항에 걸리는 전압은 전체 전압과 같다), 그림 '전기 기구의 병렬연결'.
// 한 통찰: 병렬로 이은 저항은 한쪽 끝이 모두 (+)극에 이어진 도선에, 다른 쪽 끝이 모두 (−)극에 이어진 도선에 닿아 있다. 양 끝이 같은 두 곳이니 저항이 달라도 걸리는 전압이 같다.
// 걸음: ① 전지의 두 극에 이어진 도선을 칠한다 → ② 예측한 뒤 A(10 Ω)와 B(20 Ω)의 전압을 잰다 → ③ 같은 저항을 직렬로 바꿔 칠하고 재서 견준다 → ④ 판정.
// 학생이 정하는 것: 어느 극부터 칠할지, 어느 저항부터 잴지, 언제 직렬로 바꿀지.
// 실패하는 길: 도선을 칠하지 않으면 전압계를 댈 수 없다. 한 저항만 재서는 "같다"를 말할 수 없다.
// 깨려는 생각: 앞 랩(직렬)에서 배운 "큰 저항에 전압이 더 걸린다"를 병렬에도 그대로 옮기는 것.
// 값: 전지 3 V, A 10 Ω, B 20 Ω. 병렬이면 둘 다 3 V. 직렬이면 0.1 A가 흘러 1 V와 2 V.
// 도선의 색: (+)극에서 저항을 만나기 전까지는 모두 같은 높이(빨강), (−)극 쪽은 모두 낮은 높이(파랑). 직렬의 두 저항 사이는 중간 높이(보라). 전압을 물길의 높이 차에 견준 레슨 3을 잇는다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { BAT, C, G, cPaint, cProbe, cRes, cSpotBox, cTag, hit, pathLen, type Pt } from "./circuitKit";
import { X, xCanvas, xFrame, xLog, xPill, xRow, xText, type LabStep } from "./kit";

const YA = 60;
const YB = 130;
const RX = 173;
const TOP = 96; // 직렬로 바꿨을 때의 윗줄
const SAX = 114;
const SBX = 232;
// 병렬: (+)극 쪽 도선(전지에서 나와 두 저항의 오른쪽 끝까지), (−)극 쪽 도선(두 저항의 왼쪽 끝에서 전지까지)
const P_HI: Pt[] = [[BAT.out, G.By], [G.R, G.By], [G.R, YA], [RX + 23, YA]];
const P_HI2: Pt[] = [[G.R, YB], [RX + 23, YB]];
const P_LO: Pt[] = [[BAT.in, G.By], [G.L, G.By], [G.L, YA], [RX - 23, YA]];
const P_LO2: Pt[] = [[G.L, YB], [RX - 23, YB]];
const FORK = G.R - BAT.out + (G.By - YB); // 전지에서 아래 갈래가 갈라지는 곳까지의 거리
// 직렬
const S_HI: Pt[] = [[BAT.out, G.By], [G.R, G.By], [G.R, TOP], [SBX + 23, TOP]];
const S_MID: Pt[] = [[SBX - 23, TOP], [SAX + 23, TOP]];
const S_LO: Pt[] = [[BAT.in, G.By], [G.L, G.By], [G.L, TOP], [SAX - 23, TOP]];

export const parVoltLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let mode: "par" | "ser" = "par";
  let phase: "paint" | "ask" | "mp" | "ms" | "end" = "paint";
  let hi = -1; // 칠한 정도(0에서 1). -1은 아직
  let lo = -1;
  let guess = false;
  let ph = 0;
  let lastT = 0;
  const got = new Set<string>();

  const bHi = bvBtn("", "(+)극 쪽 도선 칠하기");
  const bLo = bvBtn("", "(−)극 쪽 도선 칠하기");
  const log = xLog(["병렬일 때 A와 B", "직렬일 때 A와 B"], 1, true);
  const toSer = bvBtn("main", "같은 저항을 직렬로 바꿔 견주기");
  toSer.disabled = true;
  f.slot.setControls(xRow(bHi, bLo), log.el, toSer);

  const paint = (which: "hi" | "lo"): void => {
    if (phase !== "paint") return;
    haptic(HAPTIC.tap);
    if (which === "hi") {
      if (hi >= 0) return;
      hi = 0;
      bHi.disabled = true;
      f.say("(+)극에서 저항을 만나기 전까지의 도선이에요. 모두 <b>같은 높이</b>(빨강)예요.");
    } else {
      if (lo >= 0) return;
      lo = 0;
      bLo.disabled = true;
      f.say("(−)극에 곧바로 이어진 도선이에요. 모두 <b>같은 낮은 높이</b>(파랑)예요.");
    }
    if (hi >= 0 && lo >= 0) {
      phase = "ask";
      f.pips(1);
      tm.later(predict, 2400);
    }
  };
  bHi.addEventListener("click", () => paint("hi"));
  bLo.addEventListener("click", () => paint("lo"));

  function predict(): void {
    f.say("두 저항 모두 빨간 도선과 파란 도선 <b>사이</b>에 놓여 있어요.");
    api.setCTA("먼저 예측해 보세요", { enabled: false });
    f.slot.ask(
      "A는 10 Ω, B는 20 Ω이에요. 걸리는 전압은?",
      [{ t: "둘 다 3 V로 같아요", ok: true }, { t: "저항이 큰 B에 더 많이 걸려요" }, { t: "저항이 작은 A에 더 많이 걸려요" }],
      (ok) => {
        guess = ok;
      },
      {
        predict: true,
        onNext: () => {
          phase = "mp";
          f.slot.showControls();
          f.say("<b>점선</b>을 눌러 A와 B에 전압계를 대 보세요.");
          api.setCTA("A와 B의 전압을 재 보세요", { enabled: false });
        },
      },
    );
  }
  function measured(): void {
    if (!(got.has("A") && got.has("B"))) {
      f.say(`${got.has("A") ? "A" : "B"}를 쟀어요. 이번에는 <b>${got.has("A") ? "B" : "A"}</b>의 전압도 재 보세요.`);
      return;
    }
    if (phase === "mp") {
      log.set(0, "3 V와 3 V");
      f.pips(2);
      f.say(`${guess ? "예측대로" : "저항이 달라도"} 둘 다 <b>3 V</b>예요. 같은 저항을 직렬로 바꾸면 어떨까요?`);
      toSer.disabled = false;
      api.setCTA("직렬로 바꿔 견줘 보세요", { enabled: false });
    } else if (phase === "ms") {
      phase = "end";
      log.set(1, "1 V와 2 V");
      f.pips(3);
      f.say("직렬은 높이 차 3 V를 <b>나눠</b> 쓰고, 병렬은 저마다 <b>3 V를 다</b> 써요.");
      api.setCTA("두 연결을 모두 쟀어요", { enabled: false });
      tm.later(() => {
        // 판정은 병렬 회로를 앞에 두고 묻는다
        mode = "par";
        got.add("A");
        got.add("B");
        ask1();
      }, 3200);
    }
  }
  toSer.addEventListener("click", () => {
    if (phase !== "mp" || !(got.has("A") && got.has("B"))) return;
    haptic(HAPTIC.tap);
    phase = "ms";
    mode = "ser";
    got.clear();
    toSer.disabled = true;
    toSer.textContent = "직렬로 바꿨어요";
    f.say("직렬은 두 저항 사이의 도선이 <b>중간 높이</b>(보라)예요. 전압을 재 보세요.");
    api.setCTA("직렬에서도 A와 B를 재 보세요", { enabled: false });
  });
  st.cv.addEventListener("pointerdown", (e) => {
    if (phase !== "mp" && phase !== "ms") return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const sp = hit(spots().filter((q) => !got.has(q.id)), p.x / k, p.y / k, 30);
    if (!sp) return;
    haptic(HAPTIC.tap);
    got.add(sp.id);
    measured();
  });
  const spots = (): { id: string; x: number; y: number }[] =>
    mode === "par"
      ? [
          { id: "A", x: RX, y: YA },
          { id: "B", x: RX, y: YB },
        ]
      : [
          { id: "A", x: SAX, y: TOP },
          { id: "B", x: SBX, y: TOP },
        ];

  function ask1(): void {
    f.slot.ask(
      "병렬연결에서 두 저항의 전압이 같은 까닭은?",
      [{ t: "양 끝이 같은 두 도선에 이어져서", ok: true }, { t: "두 저항의 크기가 같아서" }, { t: "전류가 똑같이 나뉘어 흘러서" }],
      (ok) => api.recordQuiz(ok),
      { why: "둘 다 <b>(+)극 쪽 도선과 (−)극 쪽 도선</b> 사이에 있어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "병렬로 이은 B를 50 Ω으로 바꾸면 B의 전압은?",
      [{ t: "3 V 그대로예요", ok: true }, { t: "3 V보다 커져요" }, { t: "3 V보다 작아져요" }],
      () => undefined,
      { why: "양 끝이 닿은 곳이 그대로라 전압도 <b>3 V 그대로</b>예요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("병렬연결에서는 저항마다 양 끝이 <b>같은 두 곳</b>에 이어져 있어요. 그래서 저항의 크기가 달라도 걸리는 전압은 모두 <b>전지의 전압과 같아요</b>.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t) => {
    const k = w / 346;
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    ph += dt;
    if (hi >= 0 && hi < 1) hi = Math.min(1, hi + dt / 1.3);
    if (lo >= 0 && lo < 1) lo = Math.min(1, lo + dt / 1.3);
    ctx.save();
    ctx.scale(k, k);
    const W = (pts: Pt[], sp: number): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on: true, flow: ph * sp, dir: 1, width: 3.5 });
    const R = (pts: Pt[]): Pt[] => [...pts].reverse();
    if (mode === "par") {
      // 전류: A에 0.3 A, B에 0.15 A, 합쳐서 0.45 A(알갱이의 빠르기만 다르게)
      W([[BAT.out, G.By], [G.R, G.By], [G.R, YB]], 1.5);
      W([[G.R, YB], [G.R, YA], [RX + 23, YA]], 1);
      W(P_HI2, 0.5);
      W([[RX - 23, YA], [G.L, YA], [G.L, YB]], 1);
      W(R(P_LO2), 0.5);
      W([[G.L, YB], [G.L, G.By], [BAT.in, G.By]], 1.5);
      const d1 = pathLen(P_HI);
      if (hi > 0) {
        cPaint(ctx, P_HI, C.hi, hi);
        cPaint(ctx, P_HI2, C.hi, (hi * d1 - FORK) / pathLen(P_HI2));
      }
      if (lo > 0) {
        cPaint(ctx, P_LO, C.lo, lo);
        cPaint(ctx, P_LO2, C.lo, (lo * d1 - FORK) / pathLen(P_LO2));
      }
      cRes(ctx, RX, YA, { name: "A", ohm: "10 Ω" });
      cRes(ctx, RX, YB, { name: "B", ohm: "20 Ω" });
      if (hi >= 1) xText(ctx, "높음", G.R + 21, 160, { px: 12, color: C.hi });
      if (lo >= 1) xText(ctx, "낮음", G.L - 21, 160, { px: 12, color: C.lo });
    } else {
      W(S_HI, 0.6);
      W(S_MID, 0.6);
      W(R(S_LO), 0.6);
      cPaint(ctx, S_HI, C.hi);
      cPaint(ctx, S_MID, C.mid);
      cPaint(ctx, S_LO, C.lo);
      cRes(ctx, SAX, TOP, { name: "A", ohm: "10 Ω", below: true });
      cRes(ctx, SBX, TOP, { name: "B", ohm: "20 Ω", below: true });
      xText(ctx, "높음", G.R + 21, 160, { px: 12, color: C.hi });
      xText(ctx, "낮음", G.L - 21, 160, { px: 12, color: C.lo });
      xText(ctx, "중간", RX, TOP - 14, { px: 12, color: C.mid });
    }
    drawBattery(ctx, BAT.x, G.By, G.bw, 30, false);
    xText(ctx, "전지 3 V", BAT.x, G.By + 26, { px: 12, color: X.dim });
    const live = phase === "mp" || phase === "ms";
    spots().forEach((q) => {
      const below = mode === "par";
      const ty = below ? q.y + 26 : q.y - 34;
      if (got.has(q.id)) {
        cProbe(ctx, q.x - 23, q.x + 23, q.y, ty);
        cTag(ctx, q.x, ty, mode === "par" ? "3 V" : q.id === "A" ? "1 V" : "2 V", C.volt);
      } else if (live) cSpotBox(ctx, q.x, q.y, C.volt, t);
    });
    ctx.restore();
    xPill(ctx, mode === "par" ? "병렬: 갈래를 나눠 이음" : "직렬: 한 줄로 이음", X.cur);
  });

  f.say("전압은 물길의 <b>높이 차</b>와 같았죠. 전지의 두 극에 이어진 도선을 칠해 봐요.");
  api.setCTA("두 극에 이어진 도선을 칠해 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
