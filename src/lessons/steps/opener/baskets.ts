// [도입 샘플 2] u2l9 baskets: 「버섯은 어느 바구니에 넣을까?」
// 형식: 자신 있게 놓아 본다 → 뜻밖에 돌려보낸다. 놓는 일이 곧 예측이고, 결과가 그 자리에서 나온다(보기 고르기가 없다).
//   1 위에 식물 바구니(소나무)와 동물 바구니(박새), 아래 쟁반에 버섯. 버섯을 끌어 올려 넣거나 바구니를 누른다.
//   2 어느 쪽에 넣어도 바구니가 버섯을 돌려보낸다. 바구니 위에 돌려보낸 까닭이 이름표로 남는다
//     (식물 바구니: 광합성을 못 해요. 동물 바구니: 스스로 움직이지 못해요). 까닭 없는 퇴짜는 "정해진 답 맞히기"로 읽힌다.
//   3 두 쪽을 다 해 보면 끝: 식물도 동물도 아니라면 어느 계일까. 다섯 무리(계)와 검색표를 한 줄로 알리고 랩에 넘긴다.
// 도입이 랩에 넘기는 물음은 "어느 계인가"다. 랩의 검색표가 같은 두 특징을 물음으로 차례로 따져 균계에 닿는다.
// 생물은 랩(kingdomPathLab)이 보내는 다섯 가운데 셋(소나무, 박새, 버섯)이다.
// 무대는 아래로 길다(960×860). 좌표는 폭 960 기준 하나로 셈한다. 움직임은 CSS 전환과 setTimeout만 쓴다.

import { clamp, el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { OpenerCtx } from "./opener";

type Side = "plant" | "animal";
const NAME: Record<Side, string> = { plant: "식물", animal: "동물" };
// 돌려보내는 까닭(바구니의 기준). 랩의 버섯 카드가 쓰는 말과 같다: 광합성을 하지 못하고, 움직이지 못한다
const WHY: Record<Side, { cap: string; say: string }> = {
  plant: { cap: "광합성을 못 해요", say: "버섯은 <b>광합성</b>을 못 하거든요." },
  animal: { cap: "스스로 움직이지 못해요", say: "버섯은 <b>스스로 움직이지</b> 못하거든요." },
};

export function baskets(c: OpenerCtx): void {
  const M = c.meta.baskets;
  const W = c.meta.stage.w;
  const H = M.h;
  const pct = (v: number, of: number): string => `${(v / of) * 100}%`;
  const mw = M.mushW * M.mushScale;
  const mh = M.mushH * M.mushScale;

  const base = el("div", { class: "opn-layer", html: c.art.basketsBase });
  const tag = (side: Side, x: number): HTMLElement =>
    el("div", { class: "opn-tag opn-bk-tag", text: NAME[side], style: { left: pct(x - 74, W), top: pct(M.top + 62, H), width: pct(148, W), height: pct(66, H) } });
  const no = (side: Side, x: number): HTMLElement =>
    el("div", { class: "opn-cap opn-bk-no", attrs: { "data-side": side }, style: { left: pct(x - 200, W), top: pct(M.capY, H), width: pct(400, W) } }, el("span", { text: WHY[side].cap }));
  const hit = (side: Side, x: number): HTMLButtonElement =>
    el("button", {
      class: "opn-bk-hit",
      attrs: { type: "button", "aria-label": `${NAME[side]} 바구니에 버섯 넣기`, "data-side": side },
      style: { left: pct(x - 200, W), top: pct(70, H), width: pct(400, W), height: pct(440, H) },
    }) as HTMLButtonElement;
  const hitP = hit("plant", M.plantX);
  const hitA = hit("animal", M.animalX);
  const mush = el("div", {
    class: "opn-bk-mush",
    html: c.art.basketsMush,
    attrs: { role: "img", "aria-label": "버섯" },
    style: { left: pct(M.homeX - mw / 2, W), top: pct(M.homeY - mh + 8, H), width: pct(mw, W), height: pct(mh, H) },
  });
  c.stage.append(base, tag("plant", M.plantX), tag("animal", M.animalX), no("plant", M.plantX), no("animal", M.animalX), hitP, hitA, mush);

  const tried: Side[] = [];
  let busy = false;
  let phase: "play" | "done" = "play";
  const k = (): number => (c.stage.clientWidth || W) / W; // 무대 단위 1이 화면 몇 px인가
  /** 버섯을 제자리(쟁반 위)에서 (dx, dy) 무대 단위만큼 옮긴다 */
  const place = (dx: number, dy: number, scale = 1, ms = 0, ease = "var(--ease-out)"): void => {
    mush.style.transition = ms ? `transform ${ms}ms ${ease}, opacity ${ms}ms` : "none";
    mush.style.transform = `translate(${dx * k()}px, ${dy * k()}px) scale(${scale})`;
  };
  const mark = (): void => {
    c.step.dataset.opnTried = tried.join(",");
  };

  function settle(): void {
    busy = false;
    c.stage.classList.remove("busy");
    if (tried.length < 2 || phase !== "play") return;
    phase = "done";
    c.stage.classList.add("both");
    c.face("surprised");
    c.say("식물도 동물도 아니래요! 과학자들은 생물을 다섯 무리로 나누고, 이 무리를 <b>계</b>라고 불러요. 버섯은 어느 계일까요? <b>검색표</b>로 찾아봐요.");
    c.finish();
  }

  function tryPut(side: Side): void {
    if (busy || phase !== "play") return;
    busy = true;
    c.stage.classList.add("busy", "tried");
    c.stage.classList.remove("over-plant", "over-animal");
    const cx = side === "plant" ? M.plantX : M.animalX;
    const dx = cx - M.homeX;
    const up = M.top - M.homeY; // 바구니 입 높이(제자리 기준)
    const again = tried.includes(side);
    const other: Side = side === "plant" ? "animal" : "plant";
    haptic(HAPTIC.tap);
    place(dx, up - 10, 0.8, 280); // 바구니 입 위로
    c.later(() => {
      mush.style.opacity = "0";
      place(dx, up + 110, 0.6, 200, "ease-in"); // 쏙 들어간다
    }, 300);
    c.later(() => {
      // 바구니가 흔들리며 돌려보낸다
      c.stage.classList.add(`shake-${side}`, `no-${side}`);
      haptic(HAPTIC.wrong);
      mush.style.opacity = "1";
      place(dx, up - 60, 0.75, 0);
      void mush.offsetWidth;
      place(0, 0, 1, 620, "var(--spring)");
      if (!again) tried.push(side);
      mark();
      if (tried.length >= 2) c.say(`${NAME[side]} 바구니도 돌려보냈어요. ${WHY[side].say}`);
      else if (again) c.say(`${NAME[side]} 바구니는 이미 돌려보냈어요. <b>${NAME[other]} 바구니</b>에도 넣어 보세요.`);
      else {
        c.face("curious");
        c.say(`어, ${NAME[side]} 바구니가 돌려보냈어요. ${WHY[side].say} 그럼 ${NAME[other]} 바구니일까요?`);
      }
    }, 680);
    c.later(() => c.stage.classList.remove(`shake-${side}`), 1200);
    c.later(settle, 1320);
  }

  // ── 끌어다 놓기 ── 끄는 동안 버섯을 손가락 위로 조금 띄운다(손가락에 가리지 않게)
  const LIFT = 56;
  let dragging = false;
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let dy = 0;
  mush.addEventListener("pointerdown", (e) => {
    if (busy || phase !== "play") return;
    dragging = true;
    sx = e.clientX;
    sy = e.clientY;
    dx = dy = 0;
    place(0, -LIFT, 1.04, 120);
    c.stage.classList.add("drag");
    haptic(HAPTIC.tap);
    try {
      mush.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트에는 붙잡을 포인터가 없다 */
    }
  });
  mush.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dx = clamp((e.clientX - sx) / k(), -M.homeX + 90, W - M.homeX - 90);
    dy = clamp((e.clientY - sy) / k(), -M.homeY + 200, H - M.homeY - 20);
    place(dx, dy - LIFT, 1.04);
    const over = M.homeY + dy - LIFT - mh / 2 < M.dropY; // 버섯의 가운데가 바구니 높이까지 올라왔는가
    c.stage.classList.toggle("over-plant", over && M.homeX + dx < M.dropL);
    c.stage.classList.toggle("over-animal", over && M.homeX + dx > M.dropR);
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    c.stage.classList.remove("drag");
    const x = M.homeX + dx;
    const over = M.homeY + dy - LIFT - mh / 2 < M.dropY;
    if (over && x < M.dropL) tryPut("plant");
    else if (over && x > M.dropR) tryPut("animal");
    else {
      c.stage.classList.remove("over-plant", "over-animal");
      place(0, 0, 1, 320, "var(--spring)");
    }
  };
  mush.addEventListener("pointerup", drop);
  mush.addEventListener("pointercancel", drop);
  hitP.addEventListener("click", () => tryPut("plant"));
  hitA.addEventListener("click", () => tryPut("animal"));

  c.step.dataset.opnPhase = "play";
  mark();
  c.say("식물 바구니에는 소나무, 동물 바구니에는 박새가 들어 있어요. <b>버섯</b>은 어디에 넣을까요? 끌어다 넣어 보세요.");
}
