// [중2 Ⅷ v5] g2u8l3 absLab: 「같은 거리에 놓으면 어느 별이 가장 밝을까요?」
// 책의 어디에서: 그림 '별의 겉보기 등급과 절대 등급'(시리우스, 북극성, 데네브를 10 pc에 놓았을 때의 등급), 해 보기(북극성과 시리우스).
// 한 통찰: 별을 모두 같은 거리(10 pc)에 놓고 비교해야 실제 밝기를 알 수 있다. 가까이 있던 별은 어두워지고 멀리 있던 별은 밝아진다.
// 학생이 정하는 것: 어느 별을 10 pc 자리로 옮길지. 예측을 먼저 건다(채점하지 않는다).
// 값: 겉보기 등급과 절대 등급은 자연값(시리우스 −1.5와 1.4, 북극성 2.1과 −3.7, 데네브 1.3과 −8.7). 거리는 두 등급에서 계산한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers, bvTween } from "../bio6/b6Lab";
import { josa, S, sCanvas, sDisk, sFrame, sGlow, sLine, sLog, sRow, sText, type LabStep } from "./kit";

interface Star {
  name: string;
  m: number; // 겉보기 등급
  M: number; // 절대 등급
  color: string;
  t: number; // 옮긴 정도 0~1
  moved: boolean;
}
const mag = (v: number): string => (v < 0 ? `−${Math.abs(v).toFixed(1)}` : v.toFixed(1));
const distOf = (st: Star): number => 10 ** ((st.m - st.M) / 5 + 1);
const distText = (d: number): string => (d < 10 ? `약 ${d.toFixed(1)} pc` : `약 ${Math.round(d / 10) * 10} pc`);

export const absLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 4, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  const stars: Star[] = [
    { name: "시리우스", m: -1.5, M: 1.4, color: "#DDE8FF", t: 0, moved: false },
    { name: "북극성", m: 2.1, M: -3.7, color: "#FFF1C2", t: 0, moved: false },
    { name: "데네브", m: 1.3, M: -8.7, color: "#E4ECFF", t: 0, moved: false },
  ];
  let busy = false;
  let started = false;
  const log = sLog(stars.map((x) => x.name), 1, true);
  // 세 칸 버튼이라 두 줄이 될 수 있다. '10 pc'는 붙여 둔다(줄 버튼은 낱말 단위로 끊는다: g2u8v5.css .g2u8x-row .bv-btn)
  const btns = stars.map((x) => bvBtn("", `${x.name} 10\u00a0pc으로`));
  const paint = (): void => btns.forEach((b, i) => (b.disabled = busy || stars[i].moved));

  btns.forEach((b, i) =>
    b.addEventListener("click", () => {
      const x = stars[i];
      if (busy || x.moved) return;
      haptic(HAPTIC.tap);
      busy = true;
      paint();
      const near = distOf(x) < 10;
      f.say(`원래 ${distText(distOf(x))} 거리에 있던 ${josa(x.name, "을", "를")} 기준 거리인 <b>10 pc</b> 위치로 ${near ? "멀리 옮기고" : "가까이 당겨 오고"} 있어요.`);
      bvTween(tm, 1400, (t) => (x.t = t), () => {
        x.moved = true;
        busy = false;
        haptic(HAPTIC.correct);
        log.set(i, `${mag(x.m)}등급 → ${mag(x.M)}등급`);
        const n = stars.filter((v) => v.moved).length;
        f.pips(n);
        paint();
        f.say(`${josa(x.name, "은", "는")} 10 pc 위치로 ${near ? "멀어지면서 <b>더 어두워졌어요</b>" : "가까워지면서 <b>훨씬 밝아졌어요</b>"}! 등급이 ${mag(x.m)}등급에서 <b>${mag(x.M)}등급</b>으로 바뀌었어요.`);
        if (n === 3) tm.later(askFinal, 1700);
      });
    }),
  );

  function askFinal(): void {
    // 음수 등급은 무대와 같은 마이너스 기호(−)로 적는다
    f.say("세 별을 모두 10 pc 거리에 나란히 놓자 실제 밝기는 <b>데네브(−8.7등급)</b>가 가장 밝다는 것이 드러났어요!");
    f.slot.ask(
      "10 pc 위치로 옮겼을 때 처음보다 어두워진 시리우스는 원래 어디에 있던 별인가요?",
      [{ t: "10 pc보다 가까운 곳", ok: true }, { t: "10 pc보다 먼 곳" }, { t: "정확히 10 pc 거리" }],
      (ok) => api.recordQuiz(ok),
      {
        why: "시리우스는 약 2.6 pc에 있던 가까운 별이라, 10 pc으로 <b>멀어지면서</b> 겉보기 등급(−1.5)보다 절대 등급(1.4)이 커졌어요.",
        onNext: () => {
          f.say("이번엔 두 등급 숫자의 크기를 비교해 별까지의 거리를 판정해 봐요.");
          f.slot.ask(
            "어떤 별의 <b>겉보기 등급이 3등급, 절대 등급이 −2등급</b>이에요. 이 별까지의 거리는?",
            [{ t: "10 pc보다 멀리 있다", ok: true }, { t: "10 pc보다 가까이 있다" }, { t: "정확히 10 pc 거리에 있다" }],
            (ok) => api.recordQuiz(ok),
            {
              why: "10 pc에 놓았을 때(−2등급)보다 지금 더 어둡게(3등급, 숫자가 크게) 보이므로 <b>10 pc보다 멀리</b> 있는 별이에요.",
              onNext: finish,
            },
          );
        },
      },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("별들을 모두 같은 거리(10 pc)에 놓아야 실제 밝기를 비교할 수 있고, 두 등급으로 거리도 알 수 있어요!");
    f.slot.conclude("별을 모두 <b>10 pc</b>에 놓은 <b>절대 등급</b>으로 실제 밝기를 비교해요. <b>겉보기 &lt; 절대</b>이면 10 pc보다 가깝고, <b>겉보기 &gt; 절대</b>이면 10 pc보다 멀어요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h) => {
    const x0 = 58;
    const per = (w - x0 - 26) / 3; // 거리가 10배 될 때마다의 간격
    const X = (d: number): number => x0 + Math.log10(d) * per;
    const axisY = h - 26;
    const allMoved = stars.every((v) => v.moved);
    // 지구와 거리 눈금
    sDisk(ctx, 22, axisY - 82, 9, S.earth, "#fff", 1.5);
    sText(ctx, "지구", 22, axisY - 62, { color: S.ink, px: 12 });
    sLine(ctx, x0, axisY, w - 10, axisY, S.line, 1.2);
    [1, 10, 100, 1000].forEach((d) => {
      sLine(ctx, X(d), axisY - 4, X(d), axisY + 4, S.line, 1.2);
      sText(ctx, `${d} pc`, X(d), axisY + 15, { color: d === 10 ? S.ok : S.dim, px: 12, w: d === 10 ? 800 : 700 });
    });
    sLine(ctx, X(10), 12, X(10), axisY - 6, "rgba(127,227,196,.7)", 1.6, [5, 5]);
    if (allMoved) {
      sText(ctx, "겉보기 < 절대", (x0 + X(10)) / 2, 13, { color: "#9CC2FF", px: 12, w: 800 });
      sText(ctx, "10 pc보다 먼 곳: 겉보기 > 절대", (X(10) + w - 10) / 2, 13, { color: S.gold, px: 12, w: 800 });
    } else if (started) {
      sText(ctx, "별이 클수록 밝게 보여요", w - 10, 12, { color: S.dim, px: 12, align: "right" });
    }
    // 별 셋
    stars.forEach((x, i) => {
      const y = 40 + i * 51;
      const d0 = distOf(x);
      const px = X(d0) + (X(10) - X(d0)) * x.t;
      const m = x.m + (x.M - x.m) * x.t;
      if (x.t > 0) {
        sDisk(ctx, X(d0), y, 3.2, "rgba(255,255,255,.32)");
        sLine(ctx, X(d0), y, px, y, "rgba(255,255,255,.22)", 1.2, [3, 4]);
        if (x.moved) sText(ctx, `겉보기 ${mag(x.m)}`, X(d0), y + 14, { color: "rgba(220,232,250,.7)", px: 12, align: d0 > 200 ? "right" : "center" });
      }
      sGlow(ctx, px, y, Math.max(5, 15 - 1.5 * m), x.color, 0.3);
      const right = px > w - 96;
      sText(ctx, x.name, px + (right ? -18 : 18), y - 9, { color: S.ink, px: 12.5, align: right ? "right" : "left" });
      sText(ctx, `${mag(m)}등급`, px + (right ? -18 : 18), y + 8, { color: x.moved ? S.ok : S.gold, px: 12.5, align: right ? "right" : "left", w: 800 });
    });
  });

  paint();
  f.say("지구에서 본 세 별이에요. 지금은 가까이 있는 <b>시리우스</b>가 가장 밝게 보여요. 먼저 예측해 보세요.");
  api.setCTA("세 별을 10 pc 자리로 옮겨 보세요", { enabled: false });
  f.slot.ask(
    "세 별을 모두 같은 거리(10 pc)에 나란히 놓아도 여전히 시리우스가 가장 밝을까요?",
    [{ t: "시리우스가 그대로 가장 밝다" }, { t: "멀리 있던 다른 별이 더 밝게 보인다" }, { t: "세 별의 밝기가 똑같아진다" }],
    () => undefined,
    {
      predict: true,
      onNext: () => {
        started = true;
        f.slot.setControls(sRow(...btns), log.el);
        f.say("예측 완료! 별을 하나씩 <b>10 pc 자리</b>(초록 점선)로 옮겨 등급이 어떻게 변하는지 보세요.");
      },
    },
  );
  return () => {
    tm.clear();
    st.stop();
  };
};
