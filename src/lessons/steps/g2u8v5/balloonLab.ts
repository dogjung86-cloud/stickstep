// [중2 Ⅷ v5] g2u8l7 balloonLab: 「풍선이 커지면 딱지 사이는 어떻게 될까요?」
// 다루는 내용: 탐구 활동(풍선을 조금 불어 집게로 막고, 딱지 ㄱ, ㄴ, ㄷ을 서로 다른 간격으로 붙이고, 줄자로 간격을 잰다. 바람을 더 넣고 다시 잰다).
// 한 통찰: 풍선 표면이 늘어나면 딱지 사이의 간격이 모두 늘어나고, 멀리 떨어진 딱지일수록 더 많이 멀어진다.
// 학생이 정하는 것: 딱지를 붙일 자리, 재기와 불기의 차례.
// 실패하는 길: 처음 간격을 재지 않고 바람부터 넣으면 '처음' 칸이 비어 비교할 수 없다(바람을 빼고 다시 해야 한다).
// 간격은 풍선 표면을 따라 잰 길이다(풍선의 반지름 × 두 딱지 사이의 각). 작은 풍선의 반지름은 8 cm, 큰 풍선은 12 cm.
// 세 간격이 비슷하면 늘어난 양도 비슷해 '멀수록 더 많이'가 보이지 않는다. 그래서 딱지 ㄷ은 한 간격이 다른 간격의 1.5배를 넘게 붙이도록 안내하고,
// 넘지 않으면 다시 붙이게 한다(모든 간격이 1.5배로 늘므로 늘어난 양도 1.5배 넘게 차이 난다).
// 판정 때는 큰 풍선 뒤에 작은 풍선과 처음 딱지 자리를 점선으로 남기고, 줄자 값을 '처음→나중'과 '+늘어난 만큼'으로 적어 가장 많이 는 쌍을 밝힌다.

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
const SPREAD = 1.5; // 가장 먼 간격은 가장 가까운 간격의 1.5배를 넘게

export const balloonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = sFrame(host, { title: s.title, steps: 3, api, tall: true });
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
  // 두 칸 버튼이라 두 줄이 된다. '(길게 누르기)'는 한 덩어리로 둘째 줄에 오게 붙여 둔다
  const bBlow = sHold("", "바람 더 불어 넣기 (길게\u00a0누르기)", (v) => {
    blowing = v && tags.length === 3 && grow < 1 && !finished;
  });
  const bReset = bvBtn("", "바람 빼고 다시 하기");
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
      f.say("붙임딱지는 <b>풍선 표면 안쪽</b>에 붙여야 해요. 풍선 가운데 쪽을 눌러 보세요.");
      return;
    }
    const v: [number, number, number] = [x, y, Math.sqrt(1 - d * d)];
    if (tags.some((t) => Math.hypot(t[0] - x, t[1] - y) < 0.3)) {
      haptic(HAPTIC.wrong);
      f.say("이미 붙인 딱지와 너무 가까워요. <b>조금 떨어진 곳</b>을 눌러 붙여 보세요.");
      return;
    }
    tags.push(v);
    if (tags.length === 3) {
      const d = PAIRS.map(([a, b]) => arc(a, b, 1));
      if (Math.max(...d) < SPREAD * Math.min(...d)) {
        tags.pop();
        haptic(HAPTIC.wrong);
        f.say("세 딱지 사이의 간격이 너무 비슷해요! 가까운 딱지와 먼 딱지를 비교할 수 있도록, 딱지 ㄷ은 다른 간격보다 <b>1.5배 이상</b> 멀리 떨어진 곳에 붙여 보세요.");
        return;
      }
    }
    haptic(HAPTIC.tap);
    paint();
    f.say(tags.length === 1 ? "딱지 <b>ㄱ</b>을 붙였어요. 이번에는 딱지 ㄴ을 붙여 보세요." : tags.length === 2 ? "딱지 ㄷ은 한 간격이 다른 간격보다 <b>1.5배 넘게</b> 멀어지게 붙여요." : "붙임딱지 ㄱ, ㄴ, ㄷ을 모두 붙였어요! 풍선에 바람을 더 넣기 전에 먼저 무엇을 해야 할까요? 아래 버튼에서 골라 보세요.");
  });
  bMeas.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    showTape = 1;
    if (grow === 0) {
      before = PAIRS.map(([a, b]) => arc(a, b, CM0));
      f.pips(1);
      f.say("작은 풍선일 때의 처음 간격(cm)을 모두 기록했어요! 이제 <b>바람 더 불어 넣기</b>를 길게 눌러 풍선을 크게 키워 보세요.");
    } else {
      after = PAIRS.map(([a, b]) => arc(a, b, CM1));
      if (before) {
        finished = true;
        f.pips(2);
        f.say("풍선이 커진 뒤의 나중 간격까지 모두 측정했어요! 처음 간격과 비교해 볼까요?");
        tm.later(askFinal, 1600);
      } else f.say("나중 간격만 기록되어 있어요. 바람을 넣기 전의 <b>처음 간격을 재지 않아서</b> 얼마나 늘어났는지 비교할 수 없어요! <b>바람 빼고 다시 하기</b>를 눌러 처음 간격부터 먼저 재 보세요.");
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
    f.say("점선은 처음의 작은 풍선이에요. <b>처음 간격과 나중 간격</b>, 그리고 <b>늘어난 길이(+)</b>를 비교해 보세요.");
    // 보기는 고른 칸과 오답 카드의 정답 줄에 한 줄로 들어가는 길이로 둔다(두 줄이면 오답 화면이 조작 칸 208을 넘는다)
    f.slot.ask(
      "풍선이 크게 부풀어 오르자 붙임딱지 ㄱ, ㄴ, ㄷ 사이의 간격은 어떻게 변했나요?",
      [{ t: "모두 늘었고, 멀던 딱지 사이가 가장 많이 늘었어요", ok: true }, { t: "가까운 딱지 사이만 늘고 먼 딱지 사이는 그대로예요" }, { t: "세 간격 모두 변하지 않고 그대로예요" }],
      (ok) => api.recordQuiz(ok),
      { why: `풍선 표면이 고르게 늘어나면서 세 간격이 모두 늘어났고, 처음에 가장 멀리 떨어져 있던 <b>${NAMES[PAIRS[top][0]]}과 ${NAMES[PAIRS[top][1]]}</b> 사이가 가장 많이 멀어졌어요.`, onNext: finish },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("풍선 표면이 팽창하면 딱지 크기는 그대로인 채 딱지 사이의 간격이 모두 멀어진다는 것을 확인했어요!");
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
        f.say(before ? "풍선이 크게 부풀었어요! 이제 <b>줄자로 간격 재기</b>를 눌러 늘어난 간격을 다시 재 보세요." : "풍선이 크게 부풀었어요. 어라, 바람을 넣기 전에 <b>처음 간격</b>을 재지 않았네요! 일단 줄자로 간격을 재 볼까요?");
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
    const cmp = finished && !!before && !!after; // 판정 때: 처음과 나중을 한 무대에서 비교한다
    if (cmp) {
      // 처음의 작은 풍선과 딱지 자리(점선)
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(cx, cy, R0, 0, Math.PI * 2);
      ctx.stroke();
      const p0 = tags.map((t) => [cx + t[0] * R0, cy + t[1] * R0] as [number, number]);
      ctx.strokeStyle = "rgba(255,243,176,.55)";
      ctx.lineWidth = 1.4;
      PAIRS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(p0[a][0], p0[a][1]);
        ctx.lineTo(p0[b][0], p0[b][1]);
        ctx.stroke();
      });
      ctx.strokeStyle = "rgba(255,216,74,.85)";
      ctx.lineWidth = 1.5;
      p0.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }
    if (showTape && tags.length === 3) {
      const cm = grow >= 1 ? CM1 : CM0;
      // 늘어난 만큼은 화면에 적힌 두 값(소수 첫째 자리)의 차로 적는다(적힌 숫자끼리 빼면 늘 맞게)
      const gain = cmp ? PAIRS.map((_, i) => (Math.round(after![i] * 10) - Math.round(before![i] * 10)) / 10) : [];
      const best = cmp ? gain.indexOf(Math.max(...gain)) : -1;
      const gx = (pos[0][0] + pos[1][0] + pos[2][0]) / 3;
      const gy = (pos[0][1] + pos[1][1] + pos[2][1]) / 3;
      PAIRS.forEach(([a, b], i) => sLine(ctx, pos[a][0], pos[a][1], pos[b][0], pos[b][1], i === best ? S.gold : "#FFF3B0", i === best ? 3.4 : 2.5));
      PAIRS.forEach(([a, b], i) => {
        // 값은 선의 가운데에서 세 딱지의 한가운데 반대쪽으로 비켜 적는다(딱지에 가리지 않게)
        const mx = (pos[a][0] + pos[b][0]) / 2;
        const my = (pos[a][1] + pos[b][1]) / 2;
        const dl = Math.hypot(mx - gx, my - gy) || 1;
        if (!cmp) {
          sText(ctx, arc(a, b, cm).toFixed(1), mx + ((mx - gx) / dl) * 15, my + ((my - gy) / dl) * 15, { color: "#fff", px: 12.5, w: 800 });
          return;
        }
        const lx = Math.max(34, Math.min(w - 34, mx + ((mx - gx) / dl) * 27));
        const ly = Math.max(20, Math.min(h - 22, my + ((my - gy) / dl) * 27));
        sText(ctx, `${before![i].toFixed(1)}→${after![i].toFixed(1)}`, lx, ly - 7, { color: "#fff", px: 12, w: 800 });
        sText(ctx, `+${gain[i].toFixed(1)}`, lx, ly + 8, { color: i === best ? S.gold : "#FFF3B0", px: i === best ? 13.5 : 12, w: 800 });
      });
    }
    // 딱지(크기는 변하지 않는다)
    pos.forEach((p, i) => {
      sDisk(ctx, p[0], p[1], 10, "#FFD84A", "#8A6500", 1.5);
      sInk(ctx, NAMES[i], p[0], p[1] + 0.5, { color: "#3A2A00", px: 12 });
    });
    sText(ctx, grow >= 1 ? (cmp ? "큰 풍선과 처음의 작은 풍선(점선)" : "큰 풍선") : grow > 0 ? "커지는 중" : "작은 풍선", 12, 16, { color: S.dim, px: 12, align: "left" });
    if (cmp) sText(ctx, "단위: cm", 12, h - 14, { color: S.dim, px: 12, align: "left" });
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
