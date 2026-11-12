// [중2 Ⅷ v5] g2u8l7 balloonLab: 「풍선이 커지면 딱지 사이는 어떻게 될까요?」
// 책의 어디에서: 탐구 '풍선 모형으로 우주 팽창 알아보기'(풍선을 조금 불어 집게로 막고, 붙임딱지 ㄱ, ㄴ, ㄷ을 서로 다른 간격으로 붙이고, 줄자로 간격을 잰다. 바람을 더 넣고 다시 잰다).
// 한 통찰: 풍선 표면이 늘어나면 딱지 사이의 간격이 모두 늘어나고, 멀리 떨어진 딱지일수록 더 많이 멀어진다.
// 학생이 정하는 것: 딱지를 붙일 자리, 재기와 불기의 차례.
// 실패하는 길: 처음 간격을 재지 않고 바람부터 넣으면 '처음' 칸이 비어 견줄 수 없다(바람을 빼고 다시 해야 한다).
// 간격은 풍선 표면을 따라 잰 길이다(풍선의 반지름 × 두 딱지 사이의 각). 작은 풍선의 반지름은 8 cm, 큰 풍선은 12 cm.

import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { S, sBox, sCanvas, sDisk, sFrame, sHold, sInk, sLine, sLog, sRelease, sRow, sText, type LabStep } from "./kit";

const NAMES = ["ㄱ", "ㄴ", "ㄷ"];
const PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
];
const R0 = 52; // 작은 풍선(화면)
const R1 = 78; // 큰 풍선(화면)
const CM0 = 8;
const CM1 = 12;

export const balloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api });
  const st = sCanvas(f.stage);
  const tm = bvTimers();

  const tags: [number, number, number][] = []; // 풍선 표면 위의 방향(단위 벡터)
  let grow = 0; // 0 작은 풍선, 1 큰 풍선
  let blowing = false;
  let before: number[] | null = null;
  let after: number[] | null = null;
  let showTape = 0;
  let finished = false;

  const arc = (i: number, j: number, cm: number): number => {
    const a = tags[i];
    const b = tags[j];
    return cm * Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  };
  const log = sLog(PAIRS.map(([a, b]) => `${NAMES[a]}${NAMES[b]}`), 3, true);
  const bMeas = bvBtn("main", "줄자로 간격 재기");
  const bBlow = sHold("", "바람 더 넣기 (꾹)", (v) => {
    blowing = v && tags.length === 3 && grow < 1 && !finished;
  });
  const bReset = bvBtn("", "바람 빼고 처음부터");
  f.slot.setControls(sRow(bMeas, bBlow), bReset, log.el);

  const paint = (): void => {
    bMeas.disabled = tags.length < 3 || finished || (grow > 0 && grow < 1);
    bBlow.disabled = tags.length < 3 || finished || grow >= 1;
    bReset.disabled = finished || (grow === 0 && !before);
    PAIRS.forEach((_, i) => {
      if (!before && !after) log.clear(i);
      else if (before && !after) log.set(i, `${before[i].toFixed(1)}→`);
      else if (!before && after) log.set(i, `?→${after[i].toFixed(1)}`, true);
      else log.set(i, `${before![i].toFixed(1)}→${after![i].toFixed(1)}`);
    });
  };
  if (import.meta.env.DEV) f.stage.dataset.r = String(R0);

  st.cv.addEventListener("pointerdown", (e) => {
    if (tags.length >= 3 || finished) return;
    const p = st.pt(e);
    const x = (p.x - st.w() / 2 + 14) / R0;
    const y = (p.y - (st.h() / 2 + 6)) / R0;
    const d = Math.hypot(x, y);
    if (d > 0.86) {
      f.say("딱지는 <b>풍선 위</b>에 붙여요. 풍선의 가운데 쪽을 눌러 보세요.");
      return;
    }
    const v: [number, number, number] = [x, y, Math.sqrt(1 - d * d)];
    if (tags.some((t) => Math.hypot(t[0] - x, t[1] - y) < 0.3)) {
      haptic(HAPTIC.wrong);
      f.say("딱지가 겹쳐요. 다른 딱지에서 <b>조금 떨어진 곳</b>에 붙여 보세요.");
      return;
    }
    tags.push(v);
    haptic(HAPTIC.tap);
    paint();
    f.say(tags.length < 3 ? `딱지 <b>${NAMES[tags.length - 1]}</b>을 붙였어요. 다음 딱지는 간격이 다르게 붙여 보세요.` : "딱지 셋을 다 붙였어요. 이제 <b>간격을 잴지</b>, <b>바람을 더 넣을지</b> 차례를 정해 보세요.");
  });
  bMeas.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    showTape = 1;
    if (grow === 0) {
      before = PAIRS.map(([a, b]) => arc(a, b, CM0));
      f.pips(1);
      f.say("처음 간격을 쟀어요(단위는 cm). 이제 <b>바람을 더 넣어</b> 풍선을 키워 보세요.");
    } else {
      after = PAIRS.map(([a, b]) => arc(a, b, CM1));
      if (before) {
        finished = true;
        f.pips(2);
        f.say("풍선이 커진 뒤의 간격을 쟀어요. 처음 간격과 견주어 볼까요?");
        tm.later(askFinal, 1600);
      } else f.say("나중 간격만 쟀어요. <b>처음 간격을 재지 않아</b> 얼마나 늘었는지 알 수 없어요. 바람을 빼고 처음부터 다시 해 보세요.");
    }
    paint();
  });
  bReset.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    grow = 0;
    before = null;
    after = null;
    showTape = 0;
    paint();
    f.say("바람을 빼서 처음 크기로 돌아왔어요. 이번에는 <b>먼저 간격을 재고</b> 바람을 넣어 보세요.");
  });

  function askFinal(): void {
    const far = PAIRS.map((_, i) => after![i] - before![i]);
    const top = far.indexOf(Math.max(...far));
    f.slot.ask(
      "풍선이 커지자 딱지 사이의 간격은?",
      [{ t: "세 간격이 모두 늘어났어요", ok: true }, { t: "가까운 딱지끼리만 늘어났어요" }, { t: "세 간격 모두 그대로예요" }],
      (ok) => api.recordQuiz(ok),
      { why: `가장 멀던 <b>${NAMES[PAIRS[top][0]]}과 ${NAMES[PAIRS[top][1]]}</b> 사이가 가장 많이 늘었어요.`, onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("풍선 표면이 늘어나자 딱지 사이의 간격이 <b>모두 늘어났어요</b>. 멀리 떨어진 딱지일수록 더 많이 멀어졌어요. 딱지의 크기는 그대로예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, _t, dt) => {
    if (blowing) {
      const was = grow;
      grow = Math.min(1, grow + dt / 80);
      showTape = 0;
      if (grow >= 1 && was < 1) {
        blowing = false;
        sRelease(bBlow);
        haptic(HAPTIC.correct);
        paint();
        f.say(before ? "풍선이 커졌어요. 집게로 막고 <b>간격을 다시</b> 재 보세요." : "풍선이 커졌어요. 그런데 <b>처음 간격</b>을 재 두지 않았네요. 일단 재 볼까요?");
      }
    }
    const cx = w / 2 - 14;
    const cy = h / 2 + 6;
    const R = R0 + (R1 - R0) * grow;
    // 풍선
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, "#B9C8FF");
    g.addColorStop(1, "#5E74D8");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    // 꼭지와 집게
    ctx.fillStyle = "#5E74D8";
    ctx.beginPath();
    ctx.moveTo(cx + R - 2, cy);
    ctx.lineTo(cx + R + 16, cy - 7);
    ctx.lineTo(cx + R + 16, cy + 7);
    ctx.closePath();
    ctx.fill();
    if (!blowing) {
      sBox(ctx, cx + R + 13, cy - 11, 20, 22, 4, "#C9CED6", "#6B7684", 1.5);
      sText(ctx, "집게", cx + R + 23, cy + 24, { color: S.dim, px: 12 });
    } else sText(ctx, "후우", cx + R + 30, cy, { color: "#fff", px: 13, w: 800 });
    // 줄자(딱지 사이를 잇는 선)와 값
    const pos = tags.map((t) => [cx + t[0] * R, cy + t[1] * R] as [number, number]);
    if (showTape && tags.length === 3) {
      const cm = grow >= 1 ? CM1 : CM0;
      PAIRS.forEach(([a, b]) => {
        sLine(ctx, pos[a][0], pos[a][1], pos[b][0], pos[b][1], "#FFF3B0", 2.5);
        sText(ctx, arc(a, b, cm).toFixed(1), (pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2 - 9, { color: "#fff", px: 12.5, w: 800 });
      });
    }
    // 딱지(크기는 변하지 않는다)
    pos.forEach((p, i) => {
      sDisk(ctx, p[0], p[1], 10, "#FFD84A", "#8A6500", 1.5);
      sInk(ctx, NAMES[i], p[0], p[1] + 0.5, { color: "#3A2A00", px: 12 });
    });
    sText(ctx, grow >= 1 ? "큰 풍선" : grow > 0 ? "커지는 중" : "작은 풍선", 12, 16, { color: S.dim, px: 12, align: "left" });
    if (tags.length < 3) sText(ctx, `풍선을 눌러 딱지 ${NAMES[tags.length]}을 붙여요`, w / 2, h - 14, { color: S.gold, px: 12.5, w: 800 });
  });

  paint();
  f.say("바람을 조금 넣고 집게로 막은 풍선이에요. 먼저 풍선을 눌러 <b>붙임딱지 ㄱ, ㄴ, ㄷ</b>을 서로 다른 간격으로 붙여 보세요.");
  api.setCTA("풍선의 간격을 두 번 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
