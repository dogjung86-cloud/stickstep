// rotateStage — 가로 모드 오버레이(VII 단원 3D 랩용).
//   · 화면 전체를 덮는 fixed 오버레이 안에 90° 회전한 무대를 만든다.
//     폰을 돌리지 않아도 가로로 긴 장면(태양계 일렬, 일식 정렬)을 넓게 쓸 수 있다.
//   · 뷰포트가 이미 가로면(폰을 실제로 돌림·태블릿·데스크톱) 회전을 걷어내고 그대로 채운다
//     (native 모드). resize마다 재판정하므로 랩 도중 폰을 돌려도 무대가 따라간다 —
//     랩들이 매 프레임 rot.size()로 캔버스를 맞추는 관례가 전제다.
//   · 회전된 요소의 포인터 좌표는 mapPoint()로 무대 로컬 좌표(가로 기준)로 변환한다.
//   · leave()/dispose()가 오버레이·스크롤 잠금을 원상 복구한다.

import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";

export interface RotateStage {
  /** 회전된 무대(가로 좌표계). 여기에 canvas·HUD를 넣는다. */
  stage: HTMLElement;
  /** 무대 크기(가로 기준 px). w = 화면 세로, h = 화면 가로. */
  size(): { w: number; h: number };
  /** 포인터 이벤트 → 무대 로컬 좌표(가로 기준). */
  mapPoint(e: { clientX: number; clientY: number }): { x: number; y: number };
  /** 오버레이 닫기(나가기 버튼과 동일). */
  leave(): void;
  dispose(): void;
}

export function enterRotateStage(o: { title: string; onLeave: () => void }): RotateStage {
  const stage = el("div", { class: "rot-stage" });
  const exitBtn = el(
    "button",
    { class: "rot-exit", attrs: { type: "button", "aria-label": "가로 화면 나가기" } },
    el("span", { text: "세로로 돌아가기" }),
  );
  const titleChip = el("div", { class: "rot-title", text: o.title });
  const inner = el("div", { class: "rot-inner" }, stage, titleChip, exitBtn);
  const overlay = el("div", { class: "rot-overlay" }, inner);

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.appendChild(overlay);

  let W = window.innerHeight;
  let H = window.innerWidth;
  let native = false; // 뷰포트가 이미 가로면 true — 90° 회전 없이 그대로 채운다
  function layout(): void {
    native = window.innerWidth > window.innerHeight;
    inner.classList.toggle("native", native);
    W = native ? window.innerWidth : window.innerHeight;
    H = native ? window.innerHeight : window.innerWidth;
    inner.style.width = `${W}px`;
    inner.style.height = `${H}px`;
  }
  layout();
  window.addEventListener("resize", layout);

  requestAnimationFrame(() => overlay.classList.add("in"));

  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener("resize", layout);
    document.body.style.overflow = prevOverflow;
    overlay.classList.remove("in");
    window.setTimeout(() => overlay.remove(), 260);
  };
  const leave = (): void => {
    if (disposed) return;
    haptic(HAPTIC.tap);
    o.onLeave();
  };
  exitBtn.addEventListener("click", leave);

  return {
    stage,
    size: () => ({ w: W, h: H }),
    // 세로 모드: inner가 90° 회전돼 있어 무대 로컬 x축은 화면 아래, y축은 화면 왼쪽 방향.
    // native(이미 가로) 모드: 회전이 없으니 화면 좌표 그대로.
    mapPoint(e) {
      const r = overlay.getBoundingClientRect();
      return native
        ? { x: e.clientX - r.left, y: e.clientY - r.top }
        : { x: e.clientY - r.top, y: r.right - e.clientX };
    },
    leave,
    dispose,
  };
}
