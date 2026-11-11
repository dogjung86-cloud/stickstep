// [중1 Ⅴ v5] u5l2 tugLab: 「리본은 언제 움직이고 언제 멈출까요?」
// 한 통찰: 물체는 받은 힘을 모두 합친 만큼만 움직인다. 크기가 같고 방향이 반대인 두 힘은 서로 지워져 물체가 멈춰 있다.
// 조작: 양 팀의 사람 수를 더하고 뺀다(한 명이 100 N). 무대의 화살표 길이와 아래 셈이 그 자리에서 바뀌고 리본이 끌려간다.
// 흐름: 오른쪽이 이기게 → 사람이 있는데도 멈추게 → 판정(300 N 대 100 N) → 그 장면을 무대에서 확인 → 결론.
// 무대는 옛 tugOfWar의 것(밧줄, 리본, 당기는 사람, 힘 화살표)을 살렸다.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { drawForceArrow, drawRope } from "../../../ui/forceProps";
import { drawStickman, posePull, poseStand } from "../../../ui/stick";
import type { StepRenderer } from "../../types";
import { bvTimers } from "../bio6/b6Lab";
import { clamp, U5, u5Canvas, u5Floor, u5Frame, u5Pill, u5Read, u5Text } from "./u5Kit";

interface S {
  title: string;
  cta?: string;
}

export const tugLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as S;
  const f = u5Frame(host, { title: s.title, steps: 3, api });
  const st = u5Canvas(f.stage);
  const tm = bvTimers();

  let L = 0;
  let R = 0;
  let phase = 0; // 0 오른쪽 승리, 1 평형, 2 판정, 3 확인, 4 끝
  let off = 0; // 리본이 가운데에서 벗어난 거리(px, 오른쪽 +)
  let vel = 0;
  let won = 0; // 승부가 난 뒤 잠깐 멈춤(방향 ±1)
  let still = 0; // 평형으로 버틴 시간(ms)
  let lock = false;

  // 조작부: 팀마다 사람 수 더하기와 빼기
  const mk = (side: "L" | "R", name: string): { box: HTMLElement; out: HTMLElement; minus: HTMLButtonElement; plus: HTMLButtonElement } => {
    const out = el("b", { class: "u5x-tug-n", text: "0명" });
    const minus = el("button", { class: "u5x-tug-b", text: "−", attrs: { type: "button", "aria-label": `${name} 한 명 빼기` } }) as HTMLButtonElement;
    const plus = el("button", { class: "u5x-tug-b", text: "+", attrs: { type: "button", "aria-label": `${name} 한 명 더하기` } }) as HTMLButtonElement;
    minus.dataset.k = side + "-";
    plus.dataset.k = side + "+";
    const box = el("div", { class: `u5x-tug-team ${side}` }, el("span", { class: "u5x-tug-name", text: name }), el("div", { class: "u5x-tug-row" }, minus, out, plus));
    return { box, out, minus, plus };
  };
  const tl = mk("L", "왼쪽 팀");
  const tr = mk("R", "오른쪽 팀");
  const sum = el("div", { class: "u5x-sum" });
  f.slot.setControls(el("div", { class: "u5x-tug" }, tl.box, tr.box), sum);

  const paint = (): void => {
    tl.out.textContent = `${L}명`;
    tr.out.textContent = `${R}명`;
    tl.minus.disabled = lock || L <= 0;
    tl.plus.disabled = lock || L >= 3;
    tr.minus.disabled = lock || R <= 0;
    tr.plus.disabled = lock || R >= 3;
    const net = (R - L) * 100;
    sum.innerHTML =
      L + R === 0
        ? "아직 아무도 당기지 않아요."
        : `왼쪽 <b>${L * 100} N</b>, 오른쪽 <b>${R * 100} N</b><br>` + (net === 0 ? "두 힘이 서로 지워져 남는 힘은 <b>0 N</b>" : `${net > 0 ? "오른쪽" : "왼쪽"}으로 <b>${Math.abs(net)} N</b>이 남아요`);
  };
  const bump = (side: "L" | "R", d: number): void => {
    if (lock) return;
    haptic(HAPTIC.tap);
    if (side === "L") L = clamp(L + d, 0, 3);
    else R = clamp(R + d, 0, 3);
    still = 0;
    paint();
  };
  tl.minus.addEventListener("click", () => bump("L", -1));
  tl.plus.addEventListener("click", () => bump("L", 1));
  tr.minus.addEventListener("click", () => bump("R", -1));
  tr.plus.addEventListener("click", () => bump("R", 1));

  const setPhase = (p: number): void => {
    phase = p;
    f.pips(Math.min(p, 3));
    if (p === 0) f.say("<b>+</b>를 눌러 양 팀에 사람을 넣어요. 한 명이 <b>100 N</b>으로 당겨요. 먼저 <b>오른쪽 팀</b>이 이기게 해 보세요.");
    if (p === 1) f.say("이번에는 양쪽에 사람이 <b>있는데도</b> 리본이 꼼짝 않게 만들어 보세요.");
    if (p === 2) {
      lock = true;
      paint();
      f.say("양쪽이 똑같이 당기면 리본이 멈춰 있어요. 이제 셈으로 미리 맞혀 봐요.");
      tm.later(() => {
        f.slot.ask(
          "왼쪽 팀이 300 N, 오른쪽 팀이 100 N으로 당겨요. 리본에 남는 힘은?",
          [{ t: "왼쪽으로 200 N", ok: true }, { t: "왼쪽으로 400 N" }, { t: "오른쪽으로 200 N" }],
          (ok) => api.recordQuiz(ok),
          {
            why: "반대 방향의 두 힘은 큰 힘에서 작은 힘을 <b>빼요</b>. 방향은 큰 힘 쪽이에요.",
            onNext: () => {
              f.slot.showControls();
              L = 3;
              R = 1;
              off = 0;
              vel = 0;
              won = 0;
              paint();
              api.setCTA("리본이 어디로 가는지 지켜보세요", { enabled: false });
              setPhase(3);
            },
          },
        );
      }, 900);
    }
    if (p === 3) f.say("무대에서 확인해요. 왼쪽 300 N, 오른쪽 100 N이면 리본은 <b>왼쪽</b>으로 끌려가요.");
  };

  function finish(): void {
    phase = 4;
    f.pips(3);
    f.say("실험 끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("물체가 받는 힘을 모두 합친 것이 <b>알짜힘</b>이에요. 두 힘의 크기가 같고 방향이 반대면 알짜힘이 0이라 물체가 멈춰 있어요. 이것이 <b>힘의 평형</b>이에요.");
    api.enableCTA(s.cta ?? "다음");
  }

  st.run((ctx, w, h, t, dt) => {
    const gy = h - 34;
    const ry = gy - 50;
    const net = (R - L) * 100;
    // 물리: 남는 힘만큼 리본이 끌려간다
    if (won === 0 && phase < 4) {
      vel += net * 0.00035 * dt;
      vel *= Math.pow(0.9, dt);
      if (net === 0) vel *= Math.pow(0.6, dt);
      off += vel * dt;
      if (Math.abs(off) > 40) {
        won = Math.sign(off);
        haptic(HAPTIC.correct);
        const dir = won;
        tm.later(() => {
          if (phase === 3) {
            finish();
            return;
          }
          off = 0;
          vel = 0;
          won = 0;
          if (phase === 0) {
            if (dir > 0) setPhase(1);
            else f.say("왼쪽 팀이 이겼어요. <b>오른쪽 팀</b>에 사람을 더 넣어 보세요.");
          }
        }, 1300);
      }
      if (phase === 1 && L === R && L > 0) {
        still += dt * 16.7;
        if (still > 1600) setPhase(2);
      }
    }
    const cx = w / 2 + off;
    u5Floor(ctx, w, gy, h);
    // 가운데 표시
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(232,238,249,.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, ry - 34);
    ctx.lineTo(w / 2, gy);
    ctx.stroke();
    ctx.setLineDash([]);
    // 사람
    const effL = L ? clamp(0.4 + R * 0.2, 0, 1) : 0;
    const effR = R ? clamp(0.4 + L * 0.2, 0, 1) : 0;
    let endL = cx - 60;
    let endR = cx + 60;
    for (let i = 0; i < L; i++) {
      const j = drawStickman(ctx, cx - 48 - i * 27, gy, 54, posePull(effL, t, i), { flip: false });
      endL = Math.min(endL, j.handB.x - 4);
    }
    for (let i = 0; i < R; i++) {
      const j = drawStickman(ctx, cx + 48 + i * 27, gy, 54, posePull(effR, t, i + 4), { flip: true });
      endR = Math.max(endR, j.handB.x + 4);
    }
    if (L + R === 0) {
      drawStickman(ctx, 30, gy, 58, poseStand(t, 1), { alpha: 0.35 });
      drawStickman(ctx, w - 30, gy, 58, poseStand(t, 2), { flip: true, alpha: 0.35 });
    }
    drawRope(ctx, endL, ry, endR, ry, L + R ? 1 : 0.3, t);
    // 리본
    ctx.fillStyle = U5.back;
    ctx.beginPath();
    ctx.moveTo(cx - 5, ry - 2);
    ctx.lineTo(cx + 5, ry - 2);
    ctx.lineTo(cx + 5, ry + 20);
    ctx.lineTo(cx, ry + 14);
    ctx.lineTo(cx - 5, ry + 20);
    ctx.closePath();
    ctx.fill();
    // 힘 화살표(리본에서 양쪽으로, 100 N에 26px)
    const ay = ry - 26;
    if (L) {
      drawForceArrow(ctx, cx, ay, -L * 26, 0, { color: U5.back, width: 4 });
      u5Text(ctx, `${L * 100} N`, cx - L * 26 - 26, ay, { color: "#FFB3B3" });
    }
    if (R) {
      drawForceArrow(ctx, cx, ay, R * 26, 0, { color: U5.push, width: 4 });
      u5Text(ctx, `${R * 100} N`, cx + R * 26 + 26, ay, { color: "#B5D4FF" });
    }
    u5Read(ctx, w, String(Math.abs(net)), "N", net === 0 ? "남는 힘" : net > 0 ? "오른쪽으로 남는 힘" : "왼쪽으로 남는 힘");
    u5Pill(ctx, won ? (won > 0 ? "오른쪽 팀 승리" : "왼쪽 팀 승리") : L + R === 0 ? "아직 아무도 없어요" : net === 0 ? "팽팽해요" : net > 0 ? "오른쪽으로 끌려가요" : "왼쪽으로 끌려가요", net === 0 ? U5.up : U5.gold);
  });

  paint();
  setPhase(0);
  api.setCTA("양 팀에 사람을 넣어 보세요", { enabled: false });
  return () => {
    tm.clear();
    st.stop();
  };
};
