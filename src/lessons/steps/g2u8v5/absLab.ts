// [중2 Ⅷ v5] g2u8l3 absLab: 「같은 거리에 놓으면 어느 별이 가장 밝을까요?」
// 책의 어디에서: 그림 '별의 겉보기 등급과 절대 등급'(시리우스, 북극성, 데네브를 10 pc에 놓았을 때의 등급), 해 보기(북극성과 시리우스).
// 한 통찰: 별을 모두 같은 거리(10 pc)에 놓고 견줘야 실제 밝기를 알 수 있다. 가까이 있던 별은 어두워지고 멀리 있던 별은 밝아진다.
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
  const f = sFrame(host, { title: s.title, steps: 3, api });
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
  const btns = stars.map((x) => bvBtn("", `${x.name} 옮기기`));
  const paint = (): void => btns.forEach((b, i) => (b.disabled = busy || stars[i].moved));

  btns.forEach((b, i) =>
    b.addEventListener("click", () => {
      const x = stars[i];
      if (busy || x.moved) return;
      haptic(HAPTIC.tap);
      busy = true;
      paint();
      const near = distOf(x) < 10;
      f.say(`${josa(x.name, "을", "를")} ${distText(distOf(x))} 자리에서 <b>10 pc</b> 자리로 ${near ? "물려" : "당겨"} 놓고 있어요.`);
      bvTween(tm, 1400, (t) => (x.t = t), () => {
        x.moved = true;
        busy = false;
        haptic(HAPTIC.correct);
        log.set(i, `${mag(x.m)}등급 → ${mag(x.M)}등급`);
        const n = stars.filter((v) => v.moved).length;
        f.pips(n);
        paint();
        f.say(`${josa(x.name, "은", "는")} ${near ? "멀어져서 <b>어두워졌어요</b>" : "가까워져서 <b>밝아졌어요</b>"}. ${mag(x.m)}등급에서 ${mag(x.M)}등급이 됐어요.`);
        if (n === 3) tm.later(askFinal, 1700);
      });
    }),
  );

  function askFinal(): void {
    f.say("세 별이 모두 10 pc에 섰어요. 이제 <b>데네브</b>가 가장 밝아요. 아래 질문에 답해 보세요.");
    f.slot.ask(
      "10 pc으로 옮기자 어두워진 시리우스는 원래 어디에 있었나요?",
      [{ t: "10 pc보다 가까이", ok: true }, { t: "10 pc보다 멀리" }, { t: "딱 10 pc 자리에" }],
      (ok) => api.recordQuiz(ok),
      { why: "약 2.6 pc에서 10 pc으로 <b>멀어져서</b> 어두워졌어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("별을 모두 <b>같은 거리(10 pc)</b>에 놓고 견줘야 실제 밝기를 알 수 있어요. 가까워서 밝게 보이던 시리우스보다 북극성과 데네브가 실제로는 더 밝아요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h) => {
    const x0 = 58;
    const per = (w - x0 - 26) / 3; // 거리가 10배 될 때마다의 간격
    const X = (d: number): number => x0 + Math.log10(d) * per;
    const axisY = h - 26;
    // 지구와 거리 눈금
    sDisk(ctx, 22, axisY - 82, 9, S.earth, "#fff", 1.5);
    sText(ctx, "지구", 22, axisY - 62, { color: S.ink, px: 12 });
    sLine(ctx, x0, axisY, w - 10, axisY, S.line, 1.2);
    [1, 10, 100, 1000].forEach((d) => {
      sLine(ctx, X(d), axisY - 4, X(d), axisY + 4, S.line, 1.2);
      sText(ctx, `${d} pc`, X(d), axisY + 15, { color: d === 10 ? S.ok : S.dim, px: 12, w: d === 10 ? 800 : 700 });
    });
    sLine(ctx, X(10), 12, X(10), axisY - 6, "rgba(127,227,196,.7)", 1.6, [5, 5]);
    // 별 셋
    stars.forEach((x, i) => {
      const y = 36 + i * 52;
      const d0 = distOf(x);
      const px = X(d0) + (X(10) - X(d0)) * x.t;
      const m = x.m + (x.M - x.m) * x.t;
      if (x.t > 0) {
        sDisk(ctx, X(d0), y, 3, "rgba(255,255,255,.25)");
        sLine(ctx, X(d0), y, px, y, "rgba(255,255,255,.22)", 1.2, [3, 4]);
      }
      sGlow(ctx, px, y, Math.max(5, 15 - 1.5 * m), x.color, 0.3);
      const right = px > w - 96;
      sText(ctx, x.name, px + (right ? -18 : 18), y - 9, { color: S.ink, px: 12.5, align: right ? "right" : "left" });
      sText(ctx, `${mag(m)}등급`, px + (right ? -18 : 18), y + 8, { color: x.moved ? S.ok : S.gold, px: 12.5, align: right ? "right" : "left", w: 800 });
    });
    if (started) sText(ctx, "별이 클수록 밝게 보여요", w - 10, 12, { color: S.dim, px: 12, align: "right" });
  });

  paint();
  f.say("지구에서 본 세 별이에요. 지금은 가까이 있는 <b>시리우스</b>가 가장 밝게 보여요. 먼저 예측해 보세요.");
  api.setCTA("세 별을 10 pc 자리로 옮겨 보세요", { enabled: false });
  f.slot.ask(
    "세 별을 모두 같은 거리에 놓아도 시리우스가 가장 밝을까요?",
    [{ t: "그대로 가장 밝다" }, { t: "다른 별이 더 밝아진다" }, { t: "셋이 똑같아진다" }],
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
