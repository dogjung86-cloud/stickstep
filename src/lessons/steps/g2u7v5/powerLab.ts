// [중2 Ⅶ v5] g2u7l6 powerLab: 「같은 시간에 전기 에너지를 가장 많이 쓰는 것은?」
// 책의 어디에서: 탐구 '전기 기구에서 에너지가 전환될 때의 소비 전력 조사하기'(전기 기구마다 전기 에너지가 주로 어떤 에너지로 바뀌는지와 소비 전력을 조사하고,
//   소비 전력이 큰 기구의 특징을 정리한다).
// 한 통찰: 전기 기구가 1초 동안 쓰는 전기 에너지가 소비 전력(W)이다. 열을 내는 기구의 소비 전력이 크다.
// 학생이 정하는 것: 어느 전기 기구를 켤지, 얼마 동안 켤지(1초, 10초).
// 실패하는 길: 한두 개만 켜 봐서는 어떤 기구가 많이 쓰는지 견줄 수 없다(여섯 개를 모두 켜야 표가 찬다).
// 옛 판에는 랩이 없었다(개념 글과 분류 문제뿐). 조사 활동을 '켜서 재 보는' 실험으로 새로 만들었다.
// 값(자체 설정, 흔한 제품의 값): 휴대 전화 충전 5 W, LED 전등 10 W, 선풍기 40 W, 텔레비전 150 W, 세탁기 500 W, 전기다리미 1200 W.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvTimers, bvTween } from "../bio6/b6Lab";
import { X, xBox, xCanvas, xFrame, xSegs, xText, type LabStep } from "./kit";

const APPS = [
  { k: "phone", name: "휴대 전화 충전", short: "충전기", w: 5, to: ["화학 에너지"] },
  { k: "led", name: "LED 전등", short: "LED 전등", w: 10, to: ["빛에너지"] },
  { k: "fan", name: "선풍기", short: "선풍기", w: 40, to: ["운동 에너지"] },
  { k: "tv", name: "텔레비전", short: "텔레비전", w: 150, to: ["빛에너지", "소리 에너지"] },
  { k: "wash", name: "세탁기", short: "세탁기", w: 500, to: ["운동 에너지"] },
  { k: "iron", name: "전기다리미", short: "전기다리미", w: 1200, to: ["열에너지"] },
];
const TO_COLOR: Record<string, string> = { 빛에너지: "#FFD86B", "소리 에너지": "#9BE8C4", "운동 에너지": "#8FC0FF", 열에너지: "#FF9D8A", "화학 에너지": "#C9A7FF" };

export const powerLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 4, api });
  const st = xCanvas(f.stage);
  const tm = bvTimers();

  let secs = 1;
  let cur = -1;
  let prog = 0; // 켜 둔 시간의 진행 0~1
  let busy = false;
  let finished = false;
  let ten = false;
  const tried = new Set<number>();

  const cards = APPS.map((a) => bvCard("col g2u7x-c", { name: a.short, sub: "눌러서 켜기", key: a.k }));
  const time = xSegs(
    [
      { k: "1", t: "1초 동안 켜기" },
      { k: "10", t: "10초 동안 켜기" },
    ],
    "1",
    (k) => {
      secs = Number(k);
    },
  );
  f.slot.setControls(bvCards(3, ...cards), time.el);

  cards.forEach((c, i) =>
    c.el.addEventListener("click", () => {
      if (busy || finished) return;
      haptic(HAPTIC.tap);
      busy = true;
      cur = i;
      prog = 0;
      cards.forEach((x, j) => x.on(j === i));
      bvTween(tm, 1100, (t) => (prog = t), () => {
        busy = false;
        const a = APPS[i];
        tried.add(i);
        if (secs === 10) ten = true;
        c.done();
        c.sub(`${a.w} W`);
        haptic(HAPTIC.correct);
        f.pips((tried.size >= 3 ? 1 : 0) + (tried.size === APPS.length ? 1 : 0) + (ten ? 1 : 0));
        if (tried.size === APPS.length && ten) {
          finished = true;
          time.lock(true);
          f.say("여섯 개를 모두 켜 봤어요. 표에서 <b>소비 전력</b>이 큰 기구와 작은 기구를 견줘 보세요.");
          tm.later(ask1, 2800);
        } else if (tried.size === APPS.length) f.say("이번에는 <b>10초 동안</b> 켜서 쓴 전기 에너지가 몇 배가 되는지 봐요.");
        else if (secs === 1) f.say(`1초 동안 <b>${a.w} J</b>을 썼어요. 1초에 쓰는 양이 소비 전력이라 <b>${a.w} W</b>예요.`);
        else f.say(`10초 동안 <b>${a.w * 10} J</b>을 썼어요. 1초에 ${a.w} J씩 10번이에요.`);
      });
    }),
  );

  function ask1(): void {
    f.slot.ask(
      "1초 동안 40 J의 전기 에너지를 쓰는 선풍기의 소비 전력은?",
      [{ t: "40 W", ok: true }, { t: "4 W" }, { t: "400 W" }],
      (ok) => api.recordQuiz(ok),
      { why: "소비 전력은 <b>1초 동안</b> 쓰는 전기 에너지의 양이에요.", onNext: ask2 },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "소비 전력이 가장 컸던 기구는 전기 에너지를 주로 무엇으로 바꾸나요?",
      [{ t: "열에너지", ok: true }, { t: "빛에너지" }, { t: "소리 에너지" }],
      () => undefined,
      { why: "1200 W인 <b>전기다리미</b>는 열을 내는 기구였어요.", onNext: finish },
    );
  }
  function finish(): void {
    f.pips(4);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("전기 기구가 <b>1초 동안</b> 쓰는 전기 에너지의 양이 <b>소비 전력</b>이에요(단위 W). 전기다리미처럼 열을 내는 기구는 소비 전력이 커요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    // 오른쪽: 기록 표
    xBox(ctx, 186, 12, 148, 206, 14, "rgba(255,255,255,.06)", X.line);
    xText(ctx, "소비 전력", 260, 28, { px: 12.5, color: X.dim });
    APPS.forEach((a, i) => {
      const y = 54 + i * 28;
      xText(ctx, a.short, 198, y, { px: 12.5, align: "left", color: tried.has(i) ? X.ink : X.dim, w: 700 });
      xText(ctx, tried.has(i) ? `${a.w} W` : "?", 324, y, { px: 13, align: "right", color: tried.has(i) ? X.cur : X.dim, w: 800 });
    });
    // 왼쪽: 지금 켠 기구
    if (cur < 0) {
      xText(ctx, "전기 기구를", 92, 100, { px: 13.5, color: X.dim });
      xText(ctx, "눌러서 켜 보세요", 92, 122, { px: 13.5, color: X.dim });
    } else {
      const a = APPS[cur];
      const j = Math.round(a.w * secs * prog);
      xText(ctx, a.name, 92, 26, { px: 14, w: 800 });
      xText(ctx, `${(secs * prog).toFixed(secs === 1 ? 1 : 0)}초`, 92, 48, { px: 12.5, color: X.dim });
      xText(ctx, `${j} J`, 92, 78, { px: 26, w: 800, color: X.cur });
      xText(ctx, "쓴 전기 에너지", 92, 100, { px: 12, color: X.dim });
      // 전기 에너지가 바뀌는 곳
      xBox(ctx, 12, 124, 160, 30, 10, "rgba(255,196,90,.14)", X.cur);
      xText(ctx, "전기 에너지", 92, 139.5, { px: 12.5, color: X.cur });
      a.to.forEach((name, n) => {
        const bw = a.to.length === 1 ? 160 : 76;
        const bx = 12 + n * 84;
        xText(ctx, "↓", bx + bw / 2, 166, { px: 14, color: X.dim });
        xBox(ctx, bx, 178, bw, 30, 10, "rgba(255,255,255,.07)", TO_COLOR[name]);
        xText(ctx, name, bx + bw / 2, 193.5, { px: 12.5, color: TO_COLOR[name] });
      });
    }
    ctx.restore();
  });

  f.say("전기 기구를 하나씩 켜서 <b>쓴 전기 에너지</b>를 재요. 여섯 개 모두, 10초 동안도 켜 봐요.");
  api.setCTA("여섯 기구를 모두 켜 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
