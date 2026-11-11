// [중1 Ⅴ v5] u5l4 springLab5: 「많이 늘이면 힘도 커질까요?」
// 한 통찰: 용수철이 되당기는 힘(탄성력)은 늘어난 길이에 비례하고, 방향은 당긴 쪽과 반대다.
// 실험: 한쪽을 고정한 용수철의 고리를 끌어 4, 8, 12 cm 늘이고 힘 센서의 값을 읽는다(늘어난 길이와 힘의 그래프).
// 조작: 고리를 끈다. 눈금 4, 8, 12 cm에 잠깐 멈추면 그 값이 아래 그래프에 점으로 찍힌다. 손을 놓으면 고리가 되돌아간다.
// 수치는 정본과 같다(1 cm에 0.5 N: 4 cm 2 N, 8 cm 4 N, 12 cm 6 N). 뒤의 문제가 이 값을 쓴다.
// 무대는 옛 springLab의 것(벽, 코일, 자, 두 힘 화살표)을 살렸고 그래프를 높이 고정 조작 칸으로 옮겼다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow, drawSpring } from "../../../ui/forceProps";
import type { StepRenderer } from "../../types";
import { bvCapture, bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}
const X0 = 28; // 벽
const L0 = 74; // 용수철의 처음 길이(px)
const CM = 13; // 1 cm = 13px
const K = 0.5; // 1 cm에 0.5 N
const MARKS = [4, 8, 12];

export const springLab5: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 3, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let ext = 0; // 늘어난 길이(cm)
  let vel = 0;
  let dragging = false;
  let grab = 0;
  let dwell = 0; // 눈금에 머문 시간(ms)
  let flash = 0;
  let locked = false;
  const got = new Set<number>();

  // 그래프(조작 칸). 가로 0~12 cm, 세로 0~6 N.
  const graph = el("div", { class: "u5x-graph" });
  const GX = (cm: number): number => 46 + (cm / 12) * 270;
  const GY = (n: number): number => 150 - (n / 6) * 120;
  const paintGraph = (): void => {
    let g = "";
    for (let n = 0; n <= 6; n += 2) g += `<line x1="46" x2="316" y1="${GY(n)}" y2="${GY(n)}" stroke="#E5E8EB"/><text x="38" y="${GY(n) + 4}" text-anchor="end">${n}</text>`;
    for (let c = 0; c <= 12; c += 4) g += `<line x1="${GX(c)}" x2="${GX(c)}" y1="30" y2="150" stroke="#E5E8EB"/><text x="${GX(c)}" y="168" text-anchor="middle">${c}</text>`;
    g += `<line x1="46" x2="316" y1="150" y2="150" stroke="#8B95A1" stroke-width="1.5"/><line x1="46" x2="46" y1="30" y2="150" stroke="#8B95A1" stroke-width="1.5"/>`;
    g += `<text x="46" y="18" text-anchor="start" class="ax">힘(N)</text><text x="316" y="188" text-anchor="end" class="ax">늘어난 길이(cm)</text>`;
    if (got.size === 3) g += `<line x1="${GX(0)}" y1="${GY(0)}" x2="${GX(12)}" y2="${GY(6)}" stroke="#F0A422" stroke-width="3" stroke-linecap="round"/>`;
    MARKS.forEach((m) => {
      const on = got.has(m);
      g += on
        ? `<circle cx="${GX(m)}" cy="${GY(m * K)}" r="6.5" fill="#F0A422" stroke="#fff" stroke-width="2"/><text x="${GX(m) - 10}" y="${GY(m * K) - 10}" text-anchor="end" class="pt">${m * K} N</text>`
        : `<circle cx="${GX(m)}" cy="150" r="4" fill="#fff" stroke="#B0B8C1" stroke-width="1.5"/>`;
    });
    if (dragging || ext > 0.05) g += `<circle cx="${GX(clamp(ext, 0, 12))}" cy="${GY(clamp(ext, 0, 12) * K)}" r="4" fill="#3182F6" opacity=".55"/>`;
    graph.innerHTML = `<svg viewBox="0 0 346 196" role="img" aria-label="늘어난 길이와 힘의 그래프">${g}</svg>`;
  };
  f.slot.setControls(graph);

  const hookX = (): number => X0 + L0 + ext * CM;
  const SY = 104;
  const sayNext = (): void => {
    const left = MARKS.filter((m) => !got.has(m));
    if (left.length === 3) f.say("용수철 끝의 <b>고리</b>를 잡고 오른쪽으로 끌어요. 자의 <b>4 cm</b> 눈금에서 잠깐 멈춰 보세요.");
    else if (left.length) f.say(`점이 찍혔어요. 이번에는 <b>${left[0]} cm</b> 눈금까지 늘여 잠깐 멈춰 보세요.`);
  };

  st.cv.addEventListener("pointerdown", (e) => {
    if (locked) return;
    const p = st.pt(e);
    if (Math.hypot(p.x - (hookX() + 12), p.y - SY) > 52) return;
    bvCapture(st.cv, e.pointerId);
    dragging = true;
    grab = p.x - hookX();
    vel = 0;
    haptic(HAPTIC.tap);
  });
  st.cv.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const p = st.pt(e);
    const v = clamp((p.x - grab - X0 - L0) / CM, 0, 12.6);
    if (Math.abs(v - ext) > 0.04) dwell = 0;
    ext = v;
  });
  const up = (): void => {
    if (!dragging) return;
    dragging = false;
    dwell = 0;
  };
  st.cv.addEventListener("pointerup", up);
  st.cv.addEventListener("pointercancel", up);

  const record = (m: number): void => {
    got.add(m);
    flash = 1;
    haptic(HAPTIC.correct);
    f.pips(got.size);
    paintGraph();
    if (got.size === 3) {
      locked = true;
      dragging = false;
      f.say("점 세 개가 <b>반듯한 직선</b> 위에 놓였어요. 놓으면 고리는 당긴 쪽과 <b>반대로</b> 돌아가요.");
      tm.later(askFinal, 2600);
    } else sayNext();
  };

  function askFinal(): void {
    f.slot.ask(
      "용수철이 늘어난 길이를 2배로 하면, 용수철이 되당기는 힘은 어떻게 될까요?",
      [{ t: "2배로 커져요", ok: true }, { t: "그대로예요" }, { t: "절반으로 줄어요" }],
      (ok) => api.recordQuiz(ok),
      { why: "4 cm에 2 N, 8 cm에 4 N이었어요. 길이가 2배면 힘도 <b>2배</b>예요.", onNext: finish },
    );
  }
  function finish(): void {
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("모양이 변한 용수철이 원래대로 돌아가려는 힘이 <b>탄성력</b>이에요. 많이 늘일수록 커지고, 방향은 당긴 쪽과 <b>반대</b>예요.");
    api.enableCTA(s.cta ?? "다음");
  }

  let lastPaint = 0;
  st.run((ctx, w, h, t, dt) => {
    // 놓으면 되돌아가며 떤다
    if (!dragging && (ext > 0.01 || Math.abs(vel) > 0.01)) {
      vel += -ext * 0.09 * dt;
      vel *= Math.pow(0.9, dt);
      ext = Math.max(0, ext + vel * dt);
      if (ext === 0) vel = Math.abs(vel) * 0.4;
      if (ext < 0.02 && Math.abs(vel) < 0.02) {
        ext = 0;
        vel = 0;
      }
    }
    // 눈금에 머물면 기록
    if (dragging) {
      const m = MARKS.find((k) => Math.abs(ext - k) < 0.3 && !got.has(k));
      if (m) {
        dwell += dt * 16.7;
        if (dwell > 450) {
          ext = m;
          record(m);
          dwell = 0;
        }
      } else dwell = 0;
    }
    if (t - lastPaint > 80) {
      lastPaint = t;
      paintGraph();
    }
    flash = Math.max(0, flash - 0.05 * dt);
    const hx = hookX();
    const force = ext * K;
    // 벽
    const wg = ctx.createLinearGradient(X0 - 16, 0, X0, 0);
    wg.addColorStop(0, "#5B6B88");
    wg.addColorStop(1, "#93A3C0");
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.roundRect(X0 - 16, SY - 44, 16, 88, 4);
    ctx.fill();
    drawSpring(ctx, X0, SY, hx, SY, { coils: 11, radius: 12, endLen: 8 });
    // 고리
    ctx.strokeStyle = "#E8EEF9";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(hx + 12, SY, 11, 0, Math.PI * 2);
    ctx.stroke();
    if (!dragging && ext < 0.05 && !locked) {
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
      const big = c % 4 === 0;
      ctx.beginPath();
      ctx.moveTo(x, ry);
      ctx.lineTo(x, ry - (big ? 10 : 5));
      ctx.stroke();
      if (big) {
        const tgt = !got.has(c) && c > 0;
        u5Text(ctx, c === 0 ? "0" : `${c} cm`, x, ry + 13, { px: 12, color: got.has(c) ? U5.gold : tgt ? U5.ink : U5.dim });
        if (got.has(c)) {
          ctx.fillStyle = U5.gold;
          ctx.beginPath();
          ctx.arc(x, ry - 16, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // 고리 위치를 자에 내려 긋는 선
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(90,162,248,.6)";
    ctx.beginPath();
    ctx.moveTo(hx, SY + 14);
    ctx.lineTo(hx, ry);
    ctx.stroke();
    ctx.setLineDash([]);
    // 두 힘: 손이 당기는 힘(오른쪽)과 용수철이 되당기는 힘(왼쪽). 1 N에 9px.
    if (force > 0.15) {
      const ay = SY - 34;
      drawForceArrow(ctx, hx + 12, ay, force * 9, 0, { color: U5.push, width: 4 });
      drawForceArrow(ctx, hx + 12, ay, -force * 9, 0, { color: U5.back, width: 4 });
      if (force > 1.4) {
        u5Text(ctx, "되당기는 힘", hx + 6, ay - 14, { color: "#FFB3B3", px: 12, align: "right" });
        if (hx + 70 < w - 62) u5Text(ctx, "당기는 힘", hx + 18, ay - 14, { color: "#B5D4FF", px: 12, align: "left" });
      }
    }
    if (flash > 0) {
      ctx.fillStyle = `rgba(240,164,34,${flash * 0.1})`;
      ctx.fillRect(0, 0, w, h);
    }
    u5Read(ctx, w, force.toFixed(1), "N", "힘 센서");
    u5Pill(ctx, `늘어난 길이 ${ext.toFixed(1)} cm`, U5.gold);
  });

  paintGraph();
  sayNext();
  api.setCTA("4, 8, 12 cm에서 힘을 재 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
