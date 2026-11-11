// [도입] u2l3 droplens: 「물방울 속 글자, 어떻게 보일까?」
// 형식: 내기를 걸고(커진다, 작아진다, 흐려진다), 물방울을 손으로 옮겨 글자 위를 지나가며 확인한다.
//   1 종이에 글자 여섯 자, 왼쪽 여백에 물방울 하나. 처음 화면에서 바로 예측한다.
//   2 그림을 옆으로 살짝 끌면 물방울이 따라 움직인다(손가락은 물방울 아래에 두어도 된다). 글자를 누르면 그리로 간다.
//     물방울 아래에 든 글자만 커진다. 세 글자를 지나가면 끝.
//   3 쌤이 예측과 견주어 말하고 랩(표본 만들기)으로 넘긴다.
// 물체는 종이와 물방울 둘이다. 움직임은 CSS 변형뿐이다.

import { clamp, el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

const WORD = ["작", "은", "글", "씨", "예", "요"];
const PICKS = ["더 크게 보여요", "더 작게 보여요", "흐려져 안 보여요"];

export function dropLens(c: OpenerCtx): void {
  const M = c.meta.droplens;
  const S = c.meta.stage;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;

  const chars = M.letters.map((x, i) =>
    el("span", { class: "opn-dl-ch", text: WORD[i], attrs: { "data-i": String(i) }, style: { left: pct(x, S.w), top: pct(M.y, S.h) } }),
  );
  const drop = el("div", {
    class: "opn-dl-drop",
    html: c.art.droplensDrop,
    style: { left: pct(M.x0 - M.dropW / 2, S.w), top: pct(M.y - M.dropW / 2, S.h), width: pct(M.dropW, S.w), height: pct(M.dropW, S.h) },
  });
  c.stage.append(el("div", { class: "opn-layer", html: c.art.droplensBase }), ...chars, drop);

  let phase: "ask" | "play" | "done" = "ask";
  let pick = PICKS[0];
  let x: number = M.x0;
  const seen = new Set<number>();
  const k = (): number => (c.stage.clientWidth || S.w) / S.w;

  function setX(nx: number, ms = 0): void {
    x = clamp(nx, M.minX, M.maxX);
    drop.style.transition = ms ? `transform ${ms}ms var(--ease-out)` : "none";
    drop.style.transform = `translateX(${(x - M.x0) * k()}px)`;
    M.letters.forEach((lx, i) => {
      const near = Math.max(0, 1 - Math.abs(lx - x) / M.reach);
      chars[i].style.transform = `translate(-50%, -50%) scale(${1 + 0.85 * near})`;
      if (near > 0.72 && !seen.has(i)) {
        seen.add(i);
        haptic(HAPTIC.tap);
      }
    });
    c.step.dataset.opnSeen = String(seen.size);
    if (phase === "play" && seen.size >= 3) wrapUp();
  }

  function wrapUp(): void {
    phase = "done";
    c.step.dataset.opnPhase = "end";
    c.face("smile");
    c.say(`${pick === PICKS[0] ? "예측대로 커 보여요!" : "물방울 아래만 커 보여요!"} 볼록한 물방울이 <b>돋보기</b>가 됐어요. 세포도 이렇게 키워 볼까요?`);
    c.finish();
  }

  // 옆으로 끌기(짧게): 손가락이 움직인 만큼 물방울이 움직인다. 거의 움직이지 않고 떼면 누른 글자로 간다
  let dragging = false;
  let sx = 0;
  let x0 = 0;
  let moved = false;
  c.stage.addEventListener("pointerdown", (e) => {
    if (phase === "ask") return;
    dragging = true;
    moved = false;
    sx = e.clientX;
    x0 = x;
    try {
      c.stage.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
  });
  c.stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const d = e.clientX - sx;
    if (Math.abs(d) > 5) moved = true;
    if (!moved) return;
    c.stage.classList.add("moved");
    setX(x0 + (d / k()) * 1.6); // 손가락이 간 거리의 1.6배: 짧게 끌어도 끝까지 간다
  });
  const up = (e: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    // 끌다가 떼면 가장 가까운 글자 위에 멈춘다. 끌지 않고 떼면 누른 글자로 간다
    const r = c.stage.getBoundingClientRect();
    const tx = moved ? x : ((e.clientX - r.left) / r.width) * S.w;
    const near = M.letters.reduce((a, b) => (Math.abs(b - tx) < Math.abs(a - tx) ? b : a));
    c.stage.classList.add("moved");
    setX(near, 320);
  };
  c.stage.addEventListener("pointerup", up);
  c.stage.addEventListener("pointercancel", () => (dragging = false));

  c.step.dataset.opnPhase = "ask";
  setX(M.x0);
  c.ask("글자 위에 <b>물방울</b>을 올리면 글자가 어떻게 보일까요?", {
    choices: PICKS,
    neutral: true,
    good: "예측 완료! 그림을 옆으로 밀어 <b>물방울</b>을 글자 위로 옮겨 보세요.",
    onDone: (picked) => {
      pick = PICKS.find((p) => p === picked) ?? PICKS[0];
      phase = "play";
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
    },
  });
}
