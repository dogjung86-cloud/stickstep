// [중2 Ⅶ v5] g2u7l5 seriesCurLab: 「전구를 지나면 전류는?」
// 책의 어디에서: 본문(저항을 직렬로 연결하면 각 저항에 흐르는 전류의 세기는 같다).
// 한 통찰: 직렬은 전류가 지나는 길이 하나라, 중간에 새거나 쌓일 곳이 없다. 그래서 전구를 지나기 전에도, 사이에서도, 지난 뒤에도 전류의 세기가 같다.
// 걸음: ① 예측(전구를 지나면 줄어들까) → ② 가, 나, 다에 전류계를 대고 같은 시간 동안 지나가는 알갱이를 센다 → ③ 뒤 전구를 저항이 큰 것으로 바꿔 다시 센다 → ④ 판정.
// 학생이 정하는 것: 어느 자리부터 잴지, 언제 저항을 바꿀지.
// 실패하는 길: 한 자리만 재서는 "어디서나 같다"를 말할 수 없다(세 자리를 모두 재야 다음 걸음이 열린다).
// 깨려는 생각: "전류는 앞 전구가 쓰고 남은 것이 뒤로 간다", "두 전구가 똑같아서 같은 것이다".
// 값: 전지 3 V. 전구 15 Ω 둘이면 3 ÷ 30 = 0.1 A. 뒤를 45 Ω으로 바꾸면 3 ÷ 60 = 0.05 A.
// 알갱이: 간격 20, 0.1 A일 때 1초에 60을 간다. 2초 동안 세면 0.1 A는 6개, 0.05 A는 3개(전류의 세기에 비례).

import { haptic, HAPTIC } from "../../../core/haptics";
import { drawBattery, drawBulb, drawWire } from "../../../ui/elecKit";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { BAT, C, G, cRes, cSpot, cTag, hit, pathAt, pathLen, type Pt } from "./circuitKit";
import { X, xArrow, xCanvas, xFrame, xLog, xPill, xText, type LabStep } from "./kit";

const TOP = 74;
const LOOP: Pt[] = [[BAT.out, G.By], [G.R, G.By], [G.R, TOP], [G.L, TOP], [G.L, G.By], [BAT.in, G.By]];
const LEN = pathLen(LOOP);
const GAP = 20; // 알갱이 사이의 거리
const SPEED = 600; // 1 A일 때 1초에 가는 거리
const COUNT_SEC = 2;
interface Spot {
  id: string;
  name: string;
  where: string;
  x: number;
  y: number;
  d: number; // 길을 따라 잰 거리
  tx: number;
  ty: number;
}
const SPOTS: Spot[] = [
  { id: "a", name: "가", where: "첫 전구 앞", x: G.R, y: 132, d: G.R - BAT.out + (G.By - 132), tx: G.R - 42, ty: 132 },
  { id: "b", name: "나", where: "둘 사이", x: 173, y: TOP, d: G.R - BAT.out + (G.By - TOP) + (G.R - 173), tx: 173, ty: TOP + 28 },
  { id: "c", name: "다", where: "둘을 지난 뒤", x: G.L, y: 132, d: G.R - BAT.out + (G.By - TOP) + (G.R - G.L) + (132 - TOP), tx: G.L + 42, ty: 132 },
];

export const seriesCurLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let phase: "predict" | "m1" | "m2" | "end" = "predict";
  let big = false; // 뒤 전구를 45 Ω 저항으로 바꿨는지
  let guess: boolean | null = null;
  let off = 0; // 알갱이가 지금까지 간 거리
  let lastT = 0;
  let counting: { sp: Spot; from: number; n: number } | null = null;
  const got = new Map<string, number>(); // 자리 → 센 알갱이 수
  const amps = (): number => (big ? 0.05 : 0.1);
  const ampText = (): string => (big ? "0.05 A" : "0.1 A");

  const log = xLog(SPOTS.map((q) => `${q.name} (${q.where})`), 1, true);
  const swap = bvBtn("main", "뒤 전구를 저항이 큰 것으로 바꾸기");
  swap.disabled = true;
  f.slot.setControls(log.el, swap);

  const done = (): boolean => got.size === SPOTS.length;
  function afterCount(): void {
    f.pips(1 + (phase === "m2" ? 1 : 0) + (done() ? 1 : 0));
    if (!done()) {
      const left = SPOTS.filter((q) => !got.has(q.id)).map((q) => q.name).join(", ");
      f.say(`${ampText()}예요. 다른 자리(<b>${left}</b>)에서도 똑같이 세어 보세요.`);
      return;
    }
    if (phase === "m1") {
      f.say(`${guess ? "예측대로" : "줄어들지 않고"} 세 곳 모두 <b>0.1 A</b>예요. 이번에는 뒤 전구를 바꿔 봐요.`);
      swap.disabled = false;
      api.setCTA("뒤 전구를 바꿔 다시 재 보세요", { enabled: false });
    } else {
      phase = "end";
      f.say("이번에도 세 곳 모두 <b>0.05 A</b>예요. 길이 하나라 새거나 쌓일 곳이 없어요.");
      tm.later(ask1, 2800);
    }
  }
  swap.addEventListener("click", () => {
    if (phase !== "m1" || !done()) return;
    haptic(HAPTIC.tap);
    phase = "m2";
    big = true;
    got.clear();
    SPOTS.forEach((_, i) => log.clear(i));
    swap.disabled = true;
    swap.textContent = "뒤를 45 Ω 저항으로 바꿨어요";
    f.pips(2);
    f.say("알갱이가 <b>모든 곳에서 함께</b> 느려졌어요. 가, 나, 다를 다시 재 보세요.");
    api.setCTA("가, 나, 다를 다시 재 보세요", { enabled: false });
  });
  st.cv.addEventListener("pointerdown", (e) => {
    if ((phase !== "m1" && phase !== "m2") || counting) return;
    const k = st.w() / 346;
    const p = st.pt(e);
    const sp = hit(SPOTS.filter((q) => !got.has(q.id)), p.x / k, p.y / k, 30);
    if (!sp) return;
    haptic(HAPTIC.tap);
    counting = { sp, from: off, n: 0 };
    f.say(`<b>${sp.name}</b>에 전류계를 댔어요. 2초 동안 지나가는 알갱이를 세요.`);
  });

  function predict(): void {
    f.slot.ask(
      "전류의 세기를 가, 나, 다에서 재면 어떨까요?",
      [{ t: "세 곳 모두 같아요", ok: true }, { t: "전구를 지날수록 줄어요" }, { t: "두 전구 사이가 가장 세요" }],
      (ok) => {
        guess = ok;
      },
      {
        predict: true,
        onNext: () => {
          phase = "m1";
          f.slot.showControls();
          f.pips(1);
          f.say("점선 동그라미 <b>가, 나, 다</b>를 하나씩 눌러 전류계를 대 보세요.");
          api.setCTA("가, 나, 다에서 전류를 재 보세요", { enabled: false });
        },
      },
    );
  }
  function ask1(): void {
    f.slot.ask(
      "뒤 전구를 저항이 큰 것으로 바꾸자 전류는?",
      [{ t: "세 곳 모두 똑같이 약해졌어요", ok: true }, { t: "바꾼 곳 뒤(다)만 약해졌어요" }, { t: "세 곳 모두 그대로였어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "가, 나, 다 모두 <b>0.05 A</b>로 함께 약해졌어요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "직렬연결에서 전류가 어디서나 같은 까닭은?",
      [{ t: "길이 하나라 새거나 쌓일 곳이 없어서", ok: true }, { t: "두 전구의 저항이 같아서" }, { t: "전구가 전류를 조금씩 써 버려서" }],
      () => undefined,
      { why: "<b>길이 하나</b>뿐이라 들어간 만큼 그대로 나와요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("직렬연결은 전류가 지나는 <b>길이 하나</b>예요. 중간에 새거나 쌓일 곳이 없어서, 전구를 지나도 전류의 세기는 <b>어디서나 같아요</b>.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, _h, t) => {
    const k = w / 346;
    const dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    off += dt * SPEED * amps();
    if (counting) {
      const c = counting;
      const lim = c.from + COUNT_SEC * SPEED * amps();
      const now = Math.min(off, lim);
      // 문(자리 d)을 지나간 알갱이의 수: 알갱이는 off + n × GAP 자리에 있다
      const n = Math.floor((now - c.sp.d) / GAP) - Math.floor((c.from - c.sp.d) / GAP);
      if (n !== c.n) {
        c.n = n;
        haptic(HAPTIC.tap);
      }
      if (off >= lim) {
        counting = null;
        got.set(c.sp.id, n);
        log.set(SPOTS.indexOf(c.sp), `알갱이 ${n}개, ${ampText()}`);
        afterCount();
      }
    }
    ctx.save();
    ctx.scale(k, k);
    const P = (pts: Pt[]): void => drawWire(ctx, pts.map(([x, y]) => ({ x, y })), { on: false, width: 3.5 });
    P(LOOP);
    // 전류 알갱이(길을 따라 같은 간격으로)
    ctx.save();
    ctx.fillStyle = "rgba(255,196,64,.96)";
    ctx.shadowColor = "rgba(255,196,64,.9)";
    ctx.shadowBlur = 7;
    for (let d = off % GAP; d < LEN; d += GAP) {
      const [x, y] = pathAt(LOOP, d);
      ctx.beginPath();
      ctx.arc(x, y, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    drawBattery(ctx, BAT.x, G.By, G.bw, 30, false);
    xText(ctx, "전지 3 V", BAT.x, G.By - 25, { px: 12, color: X.dim });
    xArrow(ctx, 228, G.By - 14, 258, G.By - 14, X.cur, 2.4, 7);
    xText(ctx, "전류", 243, G.By - 27, { px: 12, color: X.cur });
    drawBulb(ctx, 228, TOP - 4, 19, big ? 0.1 : 0.3);
    xText(ctx, "15 Ω", 228, TOP - 34, { px: 12, color: X.dim });
    if (big) cRes(ctx, 118, TOP, { ohm: "45 Ω" });
    else {
      drawBulb(ctx, 118, TOP - 4, 19, 0.3);
      xText(ctx, "15 Ω", 118, TOP - 34, { px: 12, color: X.dim });
    }
    SPOTS.forEach((q) => {
      const n = got.get(q.id);
      const cnt = counting && counting.sp === q ? counting : null;
      if (cnt) {
        // 알갱이를 세는 문
        ctx.save();
        ctx.strokeStyle = C.amp;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        const vert = q.y !== TOP;
        ctx.beginPath();
        ctx.moveTo(q.x - (vert ? 11 : 0), q.y - (vert ? 0 : 11));
        ctx.lineTo(q.x + (vert ? 11 : 0), q.y + (vert ? 0 : 11));
        ctx.stroke();
        ctx.restore();
        cTag(ctx, q.tx, q.ty, `${q.name} ${cnt.n}개`, C.amp, 58);
      } else if (n !== undefined) cTag(ctx, q.tx, q.ty, `${q.name} ${ampText()}`, C.amp, big ? 76 : 68);
      else {
        if ((phase === "m1" || phase === "m2") && !counting) cSpot(ctx, q.x, q.y, C.amp, t);
        cTag(ctx, q.tx, q.ty, q.name, X.ink, 28);
      }
    });
    ctx.restore();
    xPill(ctx, "직렬: 길이 하나", X.cur);
  });

  f.say("전류는 (+)극에서 나와 전구 둘을 차례로 지나요. 먼저 <b>예측</b>해 보세요.");
  api.setCTA("먼저 예측해 보세요", { enabled: false });
  predict();
  return () => {
    tm.clear();
    st.stop();
  };
};
