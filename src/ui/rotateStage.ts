// rotateStage: 가로 모드 오버레이(가로로 긴 장면을 쓰는 랩 공용).
//   · 화면 전체를 덮는 fixed 오버레이 안에 90° 회전한 무대를 만든다.
//     폰을 돌리지 않아도 가로로 긴 장면(태양계 일렬, 일식 정렬)을 넓게 쓸 수 있다.
//   · 들어올 때 뷰포트가 이미 가로면(태블릿, 데스크톱, 가로로 든 폰) 회전 없이 그대로 채운다(native).
//   · **열려 있는 동안 무대는 기기 회전에 고정된다(2026-11-13, 사용자 요청 "가로 모드에서는 완전 고정").**
//     예전에는 resize마다 방향을 다시 판정해 무대를 새 뷰포트에 맞춰 다시 짰다. 폰을 실제로 돌리면
//     주소창이 높이를 먹은 가로 뷰포트(예: 750×390 → 844×334)로 다시 짜여 화면이 줄고 배치가 움직였다.
//     지금은 두 겹으로 막는다.
//     ① 방향 잠금: 터치 기기에서 세로로 들어오면 전체 화면 + screen.orientation.lock으로 세로에 잠근다.
//        잠기면 폰을 돌려도 브라우저가 화면을 돌리지 않아 아무것도 변하지 않는다(안드로이드 크롬 계열).
//        나갈 때 잠금과 전체 화면을 푼다. 지원하지 않거나 거절되면(iOS 사파리 등) 조용히 ②로 간다.
//     ② 논리 크기 고정: 들어올 때의 방향(home)에서만 무대 크기를 뷰포트에 맞춘다. 반대 방향으로 돌면
//        무대의 논리 크기(W×H)와 안쪽 배치는 그대로 두고, 통째로 방향만 바꿔 한 가지 배율로 화면에 맞춘다.
//        랩 쪽에서는 size()가 변하지 않으니 다시 짜이는 것이 없다. 잠금이 없는 브라우저에서는 가로 뷰포트가
//        더 낮아 그만큼 고르게 줄어 보이는 것까지는 막을 수 없다(배치는 같다).
//   · 회전된 요소의 포인터 좌표는 mapPoint()로 무대 로컬 좌표(가로 기준)로 변환한다(배율 포함).
//   · leave()/dispose()가 오버레이, 스크롤 잠금, 방향 잠금, 전체 화면을 원상 복구한다.

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

  // home = 들어올 때의 방향. 이 방향에서만 무대 크기가 뷰포트를 따른다.
  let disposed = false;
  const homeNative = window.innerWidth > window.innerHeight;
  let W = homeNative ? window.innerWidth : window.innerHeight;
  let H = homeNative ? window.innerHeight : window.innerWidth;
  let native = homeNative; // 지금 뷰포트가 가로면 true: 90° 회전 없이 놓는다
  let scale = 1; // 반대 방향으로 돌았을 때 고정된 무대를 화면에 맞추는 배율(home에서는 늘 1)
  function layout(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    native = vw > vh;
    if (native === homeNative) {
      W = native ? vw : vh;
      H = native ? vh : vw;
      scale = 1;
    } else {
      // 반대 방향: 논리 크기는 그대로, 통째로 줄여 맞춘다(키우지는 않는다)
      scale = Math.min(1, (native ? vw : vh) / W, (native ? vh : vw) / H);
    }
    inner.classList.toggle("native", native);
    inner.style.width = `${W}px`;
    inner.style.height = `${H}px`;
    inner.style.transform = `translate(-50%, -50%)${native ? "" : " rotate(90deg)"}${scale === 1 ? "" : ` scale(${scale})`}`;
  }
  layout();
  window.addEventListener("resize", layout);

  // 방향 잠금(위 ①). 전체 화면 안에서만 잠글 수 있어 둘을 함께 건다. 누른 직후(사용자 동작)라야 허용된다.
  const so = screen.orientation as (ScreenOrientation & { lock?: (o: string) => Promise<void> }) | undefined;
  const root = document.documentElement;
  let ownsFullscreen = false;
  const releaseLock = (): void => {
    if (!ownsFullscreen) return;
    ownsFullscreen = false;
    try {
      so?.unlock?.();
    } catch {
      /* 잠긴 적이 없으면 던지는 브라우저가 있다 */
    }
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  };
  if (
    !homeNative &&
    window.matchMedia("(pointer: coarse)").matches &&
    typeof root.requestFullscreen === "function" &&
    typeof so?.lock === "function" &&
    !document.fullscreenElement
  ) {
    root
      .requestFullscreen({ navigationUI: "hide" })
      .then(async () => {
        ownsFullscreen = true;
        if (disposed) return releaseLock();
        try {
          await so.lock!(so.type.startsWith("portrait") ? so.type : "portrait-primary");
        } catch {
          releaseLock(); // 잠글 수 없으면 전체 화면도 되돌린다(②가 맡는다)
        }
      })
      .catch(() => {});
  }

  requestAnimationFrame(() => overlay.classList.add("in"));

  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    releaseLock();
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
    // 회전 상태: inner가 90° 돌아 있어 무대 로컬 x축은 화면 아래, y축은 화면 왼쪽 방향.
    // native 상태: 회전이 없으니 화면 좌표 그대로. 어느 쪽이든 고정 배율로 나눠 논리 좌표로 되돌린다.
    mapPoint(e) {
      const r = inner.getBoundingClientRect();
      return native
        ? { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
        : { x: (e.clientY - r.top) / scale, y: (r.right - e.clientX) / scale };
    },
    leave,
    dispose,
  };
}
