// [중1 Ⅴ v5] u5l4 springLab5: 「용수철을 늘이면 힘은 어떻게 변할까요?」
// 책의 어디에서: 탐구 '용수철의 탄성력 측정하기'(용수철을 일정한 길이만큼 늘이며 힘 센서의 값을 표에 적고 그래프로 그린다).
// 한 통찰: 용수철이 되당기는 힘(탄성력)은 늘어난 길이에 비례하고, 방향은 당긴 쪽과 반대다.
// 학생이 정하는 것: 늘이는 길이(1 cm 단위로 자유롭게)와 기록할 때. 세 번 재면 그래프에 직선이 그어지고, 그 그래프로 5 N이 되는 길이를 맞힌다.
// 실패하는 길: 늘이지 않고 기록하거나 같은 길이를 또 기록하면 점이 늘지 않는다. 5 N 맞히기에서는 센서의 값을 가려 두므로 길이가 틀리면 어긋난 값이 드러난다.
// 흐름: 길이 셋을 골라 기록 → 직선 → (센서를 가린 채) 5 N이 되게 늘이기 → 판정(14 cm면) → 결론. '손 놓기'를 누르면 고리가 당긴 쪽과 반대로 돌아간다.
// 옛 랩(springLab)은 정해 준 4, 8, 12 cm에서 저절로 기록됐다. 수치는 1 cm에 0.5 N으로 같다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow, drawSpring } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const X0 = 28; // 벽
const L0 = 74; // 용수철의 처음 길이(px)
const CM = 13; // 1 cm = 13px
const K = 0.5; // 1 cm에 0.5 N
const GOAL = 5; // 맞힐 힘(N)

export const springLab5: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 4, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let ext = 0; // 늘어난 길이(cm)
  let vel = 0;
  let dragging = false;
  let held = false; // 늘인 채 붙잡고 있다(손 놓기를 누르기 전까지)
  let grab = 0;
  let flash = 0;
  let phase: "measure" | "goal" | "end" = "measure";
  let reveal = 0; // 5 N 맞히기에서 확인을 누른 뒤 잠깐 값을 보여 준다
  const got: number[] = [];

  // 그래프(조작 칸). 가로 0~12 cm, 세로 0~6 N.
  const graph = el("div", { class: "u5x-graph short" });
  const GX = (cm: number): number => 46 + (cm / 12) * 270;
  const GY = (n: number): number => 112 - (n / 6) * 90;
  const paintGraph = (): void => {
    let g = "";
    for (let n = 0; n <= 6; n += 2) g += `<line x1="46" x2="316" y1="${GY(n)}" y2="${GY(n)}" stroke="#E5E8EB"/><text x="38" y="${GY(n) + 4}" text-anchor="end">${n}</text>`;
    for (let c = 0; c <= 12; c += 2) g += `<line x1="${GX(c)}" x2="${GX(c)}" y1="22" y2="112" stroke="#EEF0F2"/><text x="${GX(c)}" y="128" text-anchor="middle">${c}</text>`;
    g += `<line x1="46" x2="316" y1="112" y2="112" stroke="#8B95A1" stroke-width="1.5"/><line x1="46" x2="46" y1="22" y2="112" stroke="#8B95A1" stroke-width="1.5"/>`;
    g += `<text x="46" y="14" text-anchor="start" class="ax">세로: 힘(N), 가로: 늘어난 길이(cm)</text>`;
    if (got.length >= 3) g += `<line x1="${GX(0)}" y1="${GY(0)}" x2="${GX(12)}" y2="${GY(6)}" stroke="#F0A422" stroke-width="3" stroke-linecap="round"/>`;
    if (phase === "goal") g += `<line x1="46" x2="316" y1="${GY(GOAL)}" y2="${GY(GOAL)}" stroke="#3182F6" stroke-width="1.5" stroke-dasharray="4 4"/><text x="52" y="${GY(GOAL) - 6}" text-anchor="start" class="pt b">5 N</text>`;
    got.forEach((m) => {
      g += `<circle cx="${GX(m)}" cy="${GY(m * K)}" r="6" fill="#F0A422" stroke="#fff" stroke-width="2"/>`;
    });
    graph.innerHTML = `<svg viewBox="0 0 346 138" role="img" aria-label="늘어난 길이와 힘의 그래프">${g}</svg>`;
  };
  const recBtn = bvBtn("main u5x-rec", "기록하기");
  const letBtn = bvBtn("u5x-let", "손 놓기");
  f.slot.setControls(graph, el("div", { class: "u5x-segs" }, recBtn, letBtn));

  const hookX = (): number => X0 + L0 + ext * CM;
  const SY = 104;

  st.cv.addEventListener("pointerdown", (e) => {
    if (phase === "end") return;
    const p = st.pt(e);
    if (Math.hypot(p.x - (hookX() + 12), p.y - SY) > 56) return;
    bvCapture(st.cv, e.pointerId);
    dragging = true;
    held = true;
    grab = p.x - hookX();
    vel = 0;
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = st.pt(e);
    ext = clamp((p.x - grab - X0 - L0) / CM, 0, 12);
  });
  const up = (): void => {
    if (!dragging) return;
    dragging = false;
    ext = Math.round(ext); // 눈금에 맞춰 붙잡는다
    if (ext === 0) held = false;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  letBtn.addEventListener("click", () => {
    if (!held || dragging) return;
    haptic(HAPTIC.tap);
    held = false;
    if (phase === "measure") f.say("고리가 당긴 쪽과 <b>반대로</b> 돌아갔어요. 다시 끌어서 다른 길이를 재 보세요.");
  });
  recBtn.addEventListener("click", () => {
    if (phase === "end" || dragging) return;
    if (!held || ext < 1) {
      haptic(HAPTIC.wrong);
      f.say("먼저 <b>고리</b>를 끌어 용수철을 늘인 뒤에 기록해요.");
      return;
    }
    if (phase === "goal") {
      reveal = 1;
      if (ext * K === GOAL) {
        haptic(HAPTIC.correct);
        phase = "end";
        f.pips(4);
        f.say("힘 센서가 정확히 <b>5 N</b>이에요. 그래프의 직선만 보고 길이를 맞혔어요.");
        paintGraph();
        tm.later(askFinal, 2200);
      } else {
        haptic(HAPTIC.wrong);
        f.say(`열어 보니 <b>${(ext * K).toFixed(1)} N</b>이에요. 그래프에서 5 N일 때의 길이를 다시 읽어 보세요.`);
        tm.later(() => (reveal = 0), 1600);
      }
      return;
    }
    if (got.includes(ext)) {
      haptic(HAPTIC.wrong);
      f.say("이미 기록한 길이예요. <b>다른 길이</b>로 늘여서 재 보세요.");
      return;
    }
    got.push(ext);
    flash = 1;
    haptic(HAPTIC.correct);
    f.pips(got.length);
    paintGraph();
    if (got.length < 3) f.say(`${ext} cm에 <b>${(ext * K).toFixed(1)} N</b>. 점이 찍혔어요. 다른 길이로 ${3 - got.length}번 더 재 보세요.`);
    else {
      phase = "goal";
      paintGraph();
      recBtn.textContent = "센서 열어 확인하기";
      f.say("점 세 개가 <b>직선</b> 위에 있어요. 이번에는 센서를 가렸어요. 그래프를 보고 <b>5 N</b>이 되게 늘여 보세요.");
      api.setCTA("5 N이 되는 길이를 맞혀 보세요", { enabled: false });
    }
  });

  function askFinal(): void {
    f.slot.ask(
      "이 용수철을 14 cm 늘이면 힘 센서의 값은 얼마일까요?",
      [{ t: "7 N", ok: true }, { t: "6 N" }, { t: "14 N" }],
      (ok) => api.recordQuiz(ok),
      { why: "1 cm에 0.5 N씩 커져요. 길이에 <b>비례</b>하니 14 cm면 7 N이에요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("용수철이 원래 길이로 돌아가려고 되당기는 힘은 <b>늘어난 길이에 비례</b>해요. 방향은 당긴 쪽과 <b>반대</b>예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    // 손을 놓으면 되돌아가며 떤다
    if (!held && !dragging && (ext > 0.01 || Math.abs(vel) > 0.01)) {
      vel += -ext * 0.09 * dt;
      vel *= Math.pow(0.9, dt);
      ext = Math.max(0, ext + vel * dt);
      if (ext === 0) vel = Math.abs(vel) * 0.4;
      if (ext < 0.02 && Math.abs(vel) < 0.02) {
        ext = 0;
        vel = 0;
      }
    }
    flash = Math.max(0, flash - 0.05 * dt);
    const hx = hookX();
    const force = ext * K;
    const wg = ctx.createLinearGradient(X0 - 16, 0, X0, 0);
    wg.addColorStop(0, "#5B6B88");
    wg.addColorStop(1, "#93A3C0");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.roundRect(X0 - 16, SY - 44, 16, 88, 4);
    ctx.fill();
    drawSpring(ctx, X0, SY, hx, SY, { coils: 11, radius: 12, endLen: 8 });
    ctx.strokeStyle = "#E8EEF9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(hx + 12, SY, 11, 0, Math.PI * 2);
    ctx.stroke();
    if (!dragging && !held && ext < 0.05 && phase !== "end") {
      const pulse = 0.5 + 0.5 * Math.sin(t / 300);
      ctx.strokeStyle = `rgba(90,162,248,${0.35 + pulse * 0.45})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx + 12, SY, 18 + pulse * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 자: 처음 길이의 끝이 0
    const ry = SY + 40;
    ctx.strokeStyle = "rgba(232,238,249,.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(X0 + L0, ry);
    ctx.lineTo(X0 + L0 + 12 * CM, ry);
    ctx.stroke();
    for (let c = 0; c <= 12; c++) {
      const x = X0 + L0 + c * CM;
      const big = c % 2 === 0;
      ctx.beginPath();
      ctx.moveTo(x, ry);
      ctx.lineTo(x, ry - (big ? 10 : 5));
      ctx.stroke();
      if (c % 4 === 0) u5Text(ctx, c === 0 ? "0" : `${c} cm`, x, ry + 13, { px: 12, color: U5.dim });
      if (got.includes(c)) {
        ctx.fillStyle = U5.gold;
        ctx.beginPath();
        ctx.arc(x, ry - 16, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(90,162,248,.6)";
    ctx.beginPath();
    ctx.moveTo(hx, SY + 14);
    ctx.lineTo(hx, ry);
    ctx.stroke();
    ctx.setLineDash([]);
    // 두 힘: 손이 당기는 힘(오른쪽)과 용수철이 되당기는 힘(왼쪽). 1 N에 9px. 센서를 가린 동안에는 길이를 고정해 그린다.
    const hide = phase === "goal" && reveal === 0;
    if (force > 0.15) {
      const ay = SY - 34;
      const len = hide ? 22 : force * 9;
      drawForceArrow(ctx, hx + 12, ay, len, 0, { color: U5.push, width: 4 });
      drawForceArrow(ctx, hx + 12, ay, -len, 0, { color: U5.back, width: 4 });
      u5Text(ctx, "되당기는 힘", hx + 6, ay - 14, { color: "#FFB3B3", px: 12, align: "right" });
      if (hx + 70 < w - 62) u5Text(ctx, "당기는 힘", hx + 18, ay - 14, { color: "#B5D4FF", px: 12, align: "left" });
    }
    if (flash > 0) {
      ctx.fillStyle = `rgba(240,164,34,${flash * 0.1})`;
      ctx.fillRect(0, 0, w, h);
    }
    u5Read(ctx, w, hide ? "?" : force.toFixed(1), "N", hide ? "힘 센서(가림)" : "힘 센서");
    u5Pill(ctx, `늘어난 길이 ${dragging ? ext.toFixed(1) : ext.toFixed(0)} cm`, U5.gold);
  });

  paintGraph();
  f.say("용수철 끝의 <b>고리</b>를 끌어 원하는 만큼 늘이고 <b>기록하기</b>를 눌러요. 길이를 바꿔 세 번 재 보세요.");
  api.setCTA("길이를 바꿔 세 번 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
