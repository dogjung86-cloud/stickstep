// [중2 Ⅷ v5] g2u8l4 starTempLab: 「별의 색은 무엇이 정할까요?」
// 책의 어디에서: 본문(표면 온도가 낮은 별은 붉은색 빛을, 높은 별은 파란색 빛을 더 많이 낸다), 해 보기 과정 2(시리우스, 안타레스, 알데바란의 색 견주기).
// 한 통찰: 별의 색은 표면 온도가 정한다. 표면 온도가 낮을수록 붉고 높을수록 하얗고 파랗다.
// 학생이 정하는 것: 별의 표면 온도. 세 별의 색에 맞을 때까지 온도를 맞춘다(색이 다르면 맞지 않는다).
// 두 빛의 양은 온도에 따른 빛의 세기 식(파장 650 nm와 450 nm)으로 계산한다. 별의 색은 kit의 tempColor.
// 화면의 온도는 ℃로 적는다(중2는 켈빈을 배우지 않는다). 계산은 켈빈(℃ + 273)으로 한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvRange, bvTimers } from "../bio6/b6Lab";
import { josa, rgb, S, sBox, sCanvas, sDisk, sFrame, sLog, sText, tempColor, type LabStep } from "./kit";

const KELVIN = (i: number): number => 3000 + i * 100 + 273; // 막대의 한 칸은 100 ℃, 3000 ℃에서 12000 ℃까지
const celsius = (k: number): number => Math.round((k - 273) / 100) * 100;
const colorName = (k: number): string => (k < 3700 ? "적색" : k < 5200 ? "주황색" : k < 6000 ? "황색" : k < 7500 ? "황백색" : k < 10000 ? "백색" : "청백색");
const planck = (nm: number, k: number): number => 1 / ((nm / 1000) ** 5 * (Math.exp(14388 / ((nm / 1000) * k)) - 1));
const TARGETS = [
  { name: "안타레스", color: "적색", k: 3473, dot: "#FF6A4D" },
  { name: "알데바란", color: "주황색", k: 3873, dot: "#FFAA5C" },
  { name: "시리우스", color: "백색", k: 9873, dot: "#F2F6FF" },
];

export const starTempLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  let k = KELVIN(30);
  let kShow = k;
  let cur = 0; // 맞출 별의 차례
  let finished = false;
  const log = sLog(TARGETS.map((t) => t.name), 3, true);
  const bSet = bvBtn("main", "이 색으로 정하기");
  const range = bvRange({
    cls: "g2u8x-r",
    min: 0,
    max: 90,
    value: 30,
    label: "별의 표면 온도",
    ticks: ["3000 ℃", "6000 ℃", "9000 ℃", "12000 ℃"],
    onInput: (v) => {
      k = KELVIN(v);
    },
  });
  f.slot.setControls(range.el, bSet, log.el);

  const brief = (): void => f.say(`<b>${TARGETS[cur].name}</b>${josa(TARGETS[cur].name, "과", "와").slice(TARGETS[cur].name.length)} 같은 색이 되게 <b>표면 온도</b>를 맞추고 '이 색으로 정하기'를 눌러요.`);
  bSet.addEventListener("click", () => {
    if (finished) return;
    const t = TARGETS[cur];
    const mine = colorName(k);
    if (mine !== t.color) {
      haptic(HAPTIC.wrong);
      f.say(`지금은 <b>${mine}</b>이에요. ${josa(t.name, "은", "는")} ${t.color} 별이에요. 온도를 <b>${k > t.k ? "낮춰" : "높여"}</b> 보세요.`);
      return;
    }
    haptic(HAPTIC.correct);
    log.set(cur, `${t.color}`);
    cur += 1;
    f.pips(cur);
    if (cur < 3) {
      f.say(`맞았어요! ${t.name}의 표면 온도는 <b>약 ${celsius(t.k)} ℃</b>예요. 다음은 <b>${TARGETS[cur].name}</b>예요.`);
    } else {
      finished = true;
      cur = 2;
      bSet.disabled = true;
      range.input.disabled = true;
      f.say(`맞았어요! ${t.name}의 표면 온도는 <b>약 ${celsius(t.k)} ℃</b>예요. 세 별을 견주어 볼까요?`);
      tm.later(askFinal, 1700);
    }
  });

  function askFinal(): void {
    f.say("세 별의 색과 온도를 떠올리며 아래 질문에 답해 보세요.");
    f.slot.ask(
      "세 별 가운데 표면 온도가 가장 높은 별은?",
      [{ t: "백색 별 시리우스", ok: true }, { t: "적색 별 안타레스" }, { t: "주황색 별 알데바란" }],
      (ok) => api.recordQuiz(ok),
      { why: "적색은 약 3200 ℃, 주황색은 약 3600 ℃, 백색은 <b>약 9600 ℃</b>였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("관측 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("별의 색을 정하는 것은 <b>표면 온도</b>예요. 온도가 낮을수록 붉은색 빛을 많이 내 <b>붉게</b>, 높을수록 파란색 빛을 많이 내 <b>하얗고 파랗게</b> 보여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    kShow += (k - kShow) * Math.min(1, dt * 0.25);
    const col = tempColor(kShow);
    // 내 별
    const cx = 86;
    const cy = h / 2 + 12;
    const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 70);
    g.addColorStop(0, rgb(col, 0.55));
    g.addColorStop(1, rgb(col, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 180, h);
    sDisk(ctx, cx, cy, 34, rgb(col));
    sText(ctx, `${celsius(kShow)} ℃`, cx, cy + 54, { color: "#fff", px: 14, w: 800 });
    sText(ctx, colorName(kShow), cx, cy + 72, { color: S.gold, px: 13, w: 800 });
    // 맞출 별 셋
    TARGETS.forEach((t, i) => {
      const x = 30 + i * 54;
      const done = i < cur || finished;
      sDisk(ctx, x, 26, 11, t.dot, i === cur && !finished ? "#fff" : undefined, 2);
      sText(ctx, t.name, x, 48, { color: i === cur && !finished ? "#fff" : done ? S.ok : S.dim, px: 12, w: i === cur ? 800 : 700 });
    });
    // 별이 내는 두 빛의 양
    const r = planck(650, kShow);
    const b = planck(450, kShow);
    const m = Math.max(r, b);
    const bx = w - 132;
    const base = h - 40;
    const top = 44;
    sText(ctx, "별이 내는 빛", bx + 55, 24, { color: S.dim, px: 12 });
    [
      { v: r / m, c: "#FF6B5C", n: "붉은색 빛" },
      { v: b / m, c: "#6FA8FF", n: "파란색 빛" },
    ].forEach((bar, i) => {
      const x = bx + i * 60;
      const hh = bar.v * (base - top);
      sBox(ctx, x + 6, top, 38, base - top, 6, "rgba(255,255,255,.06)");
      sBox(ctx, x + 6, base - hh, 38, hh, 6, bar.c);
      sText(ctx, bar.n, x + 25, base + 15, { color: S.ink, px: 12 });
    });
  });

  brief();
  api.setCTA("세 별의 색을 맞춰 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
