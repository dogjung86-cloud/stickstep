// moonPhase3d — 달의 위상 변화 3D 랩(VII 단원 L5). 교과서 그림 VII-9의 입체 조작판.
//   · 진짜 3D: 태양광(오른쪽)이 달을 비추고, 카메라가 지구 자리에 서면
//     그 명암이 그대로 "달의 위상"이 된다 — 그림 암기가 아니라 원리 체험.
//   · 우주 뷰(단일): 달을 궤도에서 드래그, 우하단 인셋이 "지구에서 본 달"을 실시간으로 보여 준다.
//     태양 구체와 빛 화살표가 항상 프레임 안 — 빛의 방향이 위상의 원인임이 한 화면에 담긴다.
// 목표: 삭 → 상현(오른쪽 반달) → 망 → 하현(왼쪽 반달) 네 위상 찾기.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";
import type { SpaceStage, THREE as T } from "../../ui/space3d";

interface MoonPhaseStep {
  title: string;
  lead?: string;
  cta?: string;
}

const ORBIT_R = 3.3;

/** 위상 각(도, 0=삭 기준 반시계) → 위상 이름. */
function phaseName(deg: number): { key: string; label: string } {
  const d = ((deg % 360) + 360) % 360;
  if (d < 22 || d >= 338) return { key: "new", label: "삭 — 달이 안 보여요" };
  if (d < 68) return { key: "waxc", label: "초승달" };
  if (d < 112) return { key: "first", label: "상현 — 오른쪽 반달" };
  if (d < 158) return { key: "waxg", label: "상현 → 망 사이" };
  if (d < 202) return { key: "full", label: "망 — 보름달" };
  if (d < 248) return { key: "wang", label: "망 → 하현 사이" };
  if (d < 292) return { key: "last", label: "하현 — 왼쪽 반달" };
  return { key: "wanc", label: "그믐달" };
}

export const moonPhase3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as MoonPhaseStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:350px" }) as HTMLCanvasElement;
  const phasePill = el("span", { text: "달을 끌어 보세요" });
  const inset = el(
    "div",
    { class: "sp3-inset", attrs: { "aria-hidden": "true" } },
    el("span", { class: "sp3-inset-label", text: "지구에서 본 달" }),
  );
  const cap = el("div", { class: "stage-cap", text: "달을 잡아 궤도를 따라 끌어 보세요" });
  const sunTag = el("div", { class: "sp3-suntag", attrs: { "aria-hidden": "true" }, text: "태양" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#C9BA8E" }), phasePill)),
    sunTag,
    inset,
    cap,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "new" } }, el("b", { text: "삭" }), el("span", { text: "태양 쪽" })),
    el("div", { class: "pn-badge", dataset: { g: "first" } }, el("b", { text: "상현" }), el("span", { text: "직각(위)" })),
    el("div", { class: "pn-badge", dataset: { g: "full" } }, el("b", { text: "망" }), el("span", { text: "반대쪽" })),
    el("div", { class: "pn-badge", dataset: { g: "last" } }, el("b", { text: "하현" }), el("span", { text: "직각(아래)" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "오른쪽의 <b>태양</b>이 빛을 보내요. 달을 궤도 위에서 끌면서, 우하단 <b>지구에서 본 달</b>이 어떻게 변하는지 보세요!",
  });
  host.append(goalChips, helper, stage); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  // ---- 상태 ----
  let theta = Math.PI * 0.5; // 위상각(rad), 0 = 태양 쪽(삭). 상현에서 시작 직전이 아닌 90°=상현… 초기엔 135°쯤 애매한 곳에서 출발
  theta = Math.PI * 0.75;
  let dragging = false;
  let capFaded = false;
  let heldKey = "";
  let heldMs = 0;
  const goals = new Set<string>();
  let finished = false;
  let disposed = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    const hints: Record<string, string> = {
      new: "삭! 달이 <b>태양과 같은 방향</b>이라 밝은 면이 모두 저쪽 — 지구에선 안 보여요. 이제 <b>위쪽(직각)</b>으로 끌어 보세요.",
      first: "상현! 태양·지구·달이 <b>직각</b>이라 <b>오른쪽 반원</b>만 밝아요. 이제 <b>태양 반대쪽</b>으로!",
      full: "망! 달이 <b>태양 반대쪽</b>이라 밝은 면 전체가 보여요 — 보름달. 마지막, <b>아래쪽 직각</b>으로!",
      last: "하현! 이번엔 <b>왼쪽 반원</b>이 밝아요. 상현과 반대죠.",
    };
    if (!finished) helper.innerHTML = hints[id] ?? "";
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "완벽해요! 달은 스스로 빛나지 않고 <b>태양 빛을 반사한 부분만</b> 밝게 보여요. 달이 지구를 <b>약 한 달에 한 바퀴</b> 돌면서 태양·지구·달의 위치가 달라지니, 밝게 보이는 모양(위상)도 달라지는 거예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- three.js 씬(동적 로드) ----
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let earth: T.Mesh | null = null;
  let moon: T.Mesh | null = null;
  let moonHalo: T.Sprite | null = null;
  let earthCam: T.PerspectiveCamera | null = null;
  let loop: Loop | null = null;

  const fadeCap = (): void => {
    if (capFaded) return;
    capFaded = true;
    cap.classList.add("fade");
  };

  void (async () => {
    const S = await import("../../ui/space3d");
    if (disposed) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 46 });
    if (!st) {
      stage.classList.add("sp3-fallback");
      helper.innerHTML =
        "이 기기에서 3D를 켤 수 없어요. 그림으로 기억해요 — <b>삭=태양 쪽(안 보임)</b>, <b>상현=직각·오른쪽 반달</b>, <b>망=반대쪽·보름달</b>, <b>하현=직각·왼쪽 반달</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(700, 120));

    // 태양(오른쪽) — 화면 안에 보이는 구체 + 글로우 + 방향광.
    // "빛이 어디서 오는지"가 위상의 핵심이라 태양이 항상 프레임 안에 있어야 한다.
    const sunBall = S.makePlanet("sun", 0.85, 36);
    sunBall.position.set(5.4, 0, 0);
    scene.add(sunBall);
    const sunGlow = S.makeGlow(5.2, "rgba(255,190,80,.85)", 0.14);
    sunGlow.position.set(5.4, 0, 0);
    scene.add(sunGlow);
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.5);
    sun.position.set(10, 0, 0);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x3a4a68, 0.6));
    // 태양 빛 방향 화살표(태양이 이미 빛나고 있으니 가운데 하나만)
    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(4.7, 0, 0),
      1.6,
      0xffc24e,
      0.5,
      0.26,
    );
    (arrow.line.material as T.LineBasicMaterial).transparent = true;
    (arrow.line.material as T.LineBasicMaterial).opacity = 0.75;
    (arrow.cone.material as T.MeshBasicMaterial).transparent = true;
    (arrow.cone.material as T.MeshBasicMaterial).opacity = 0.75;
    scene.add(arrow);

    earth = S.makePlanet("earth", 1.0, 56);
    scene.add(earth);
    const orbit = S.makeOrbitLine(ORBIT_R, "#6E8CB8", 0.5);
    scene.add(orbit);
    moon = S.makePlanet("moon", 0.3, 40);
    scene.add(moon);
    // 달 위치 표시 헤일로(잡기 쉬운 손잡이 느낌)
    moonHalo = S.makeGlow(1.5, "rgba(140,180,255,.4)", 0.3);
    scene.add(moonHalo);

    // 태양(x=5.4)까지 한 프레임에 담기게 살짝 오른쪽·위에서 내려다본다
    camera.position.set(1.2, 7.9, 7.2);
    camera.lookAt(1.2, 0, 0);
    earthCam = new THREE.PerspectiveCamera(21, 1, 0.05, 300);

    loop = createLoop((dt) => frame(dt));
    loop.start();
  })();

  function moonPos(): { x: number; z: number } {
    return { x: Math.cos(theta) * ORBIT_R, z: -Math.sin(theta) * ORBIT_R };
  }

  // ---- 입력: 궤도 드래그 ----
  function pointerTheta(e: PointerEvent): number | null {
    if (!st || !THREE) return null;
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx, ny), st.camera);
    const hit = new THREE.Vector3();
    if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return null;
    return Math.atan2(-hit.z, hit.x);
  }

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    fadeCap();
    const t = pointerTheta(e);
    if (t != null) theta = t;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 */
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const t = pointerTheta(e);
    if (t != null) theta = t;
  });
  const endDrag = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // ---- 프레임 ----
  function frame(dt: number): void {
    if (!st || !THREE || !earth || !moon || !earthCam || !moonHalo) return;
    const w = canvas.clientWidth || 340;
    const h = 350;
    st.resize(w, h);

    earth.rotation.y += 0.0035 * dt;
    const p = moonPos();
    moon.position.set(p.x, 0, p.z);
    moon.rotation.y = theta + Math.PI; // 같은 면이 지구를 향하게(동주기 자전)
    moonHalo.position.set(p.x, 0, p.z);
    moonHalo.material.opacity = dragging ? 0.9 : 0.55;

    // 지구 시점 카메라: 지구 표면에서 달을 바라본다(위쪽 = 북쪽)
    const dir = new THREE.Vector3(p.x, 0, p.z).normalize();
    earthCam.position.copy(dir.clone().multiplyScalar(1.12));
    earthCam.up.set(0, 1, 0);
    earthCam.lookAt(p.x, 0, p.z);
    earthCam.aspect = 1;
    earthCam.updateProjectionMatrix();

    // 위상 판정 + HUD
    const deg = ((theta * 180) / Math.PI + 360) % 360;
    const ph = phaseName(deg);
    phasePill.textContent = ph.label;
    if (ph.key === heldKey) {
      heldMs += dt * 16.7;
    } else {
      heldKey = ph.key;
      heldMs = 0;
    }
    if (heldMs > 340 && (ph.key === "new" || ph.key === "first" || ph.key === "full" || ph.key === "last")) {
      const sub: Record<string, string> = { new: "안 보여요!", first: "오른쪽 밝음", full: "보름달!", last: "왼쪽 밝음" };
      collect(ph.key, sub[ph.key]);
    }

    // 렌더 — 우주 뷰 + 우하단 인셋(지구에서 본 달)
    const r = st.renderer;
    r.setScissorTest(false);
    r.setViewport(0, 0, w, h);
    st.render();
    const iw = 108;
    const pad = 10;
    const ix = w - iw - pad;
    r.setScissorTest(true);
    r.setViewport(ix, pad, iw, iw);
    r.setScissor(ix, pad, iw, iw);
    r.setClearColor(0x0b1524, 1);
    r.clear(true, true, false);
    r.render(st.scene, earthCam);
    r.setScissorTest(false);
  }

  api.setCTA("삭·상현·망·하현을 찾아요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
  };
};
