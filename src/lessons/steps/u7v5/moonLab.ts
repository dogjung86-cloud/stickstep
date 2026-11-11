// u7MoonLab: 달의 위상 랩(u7l5). 교과서 탐구 "모형을 이용하여 달의 위상 변화 관찰하기"(248~249쪽)를 손으로 한다.
//   교과서: 가운데 스마트 기기(지구), 둘레 여덟 자리에 반쪽을 칠한 공(달), 노란 쪽이 늘 태양을 향한다. 자리마다 사진을 찍어 견준다.
//   랩   : 달을 궤도에서 끌면 오른쪽 위 창(지구에서 본 달)이 그 자리의 모습을 바로 보여 준다.
// 무대는 정본 moonPhase3d의 3D(실사 질감의 지구와 달, 오른쪽의 태양)를 살리고 틀과 흐름을 고쳤다:
//   한 화면(무대 230, 조작 칸 208) · 찾을 것은 모양으로 먼저 부르고 찾은 뒤에 이름(삭, 상현달, 보름달, 하현달)을 붙인다
//   · 까닭은 판정으로 묻고(근거는 무대에 남는다: 달의 절반은 늘 밝다) · 결론은 조작 칸에 뜬다.
// 무대 어디를 눌러도 달이 그 방향으로 온다(달 자체는 작아도 누르는 곳은 무대 전체다).

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import { bvCapture } from "../bio6/b6Lab";
import { u7Frame, u7Goals, u7Dev } from "./kit";

interface MoonStep {
  title: string;
  cta?: string;
}

const ORBIT_R = 3.3;
const STAGE_H = 230;
const INSET = 84; // 지구에서 본 달 창(px)
const INSET_PAD = 8;

type Key = "new" | "first" | "full" | "last";
const LOOK: Record<string, string> = {
  new: "안 보여요",
  waxc: "오른쪽이 가늘게 밝아요",
  first: "오른쪽 반달",
  waxg: "오른쪽이 볼록해요",
  full: "둥근 달",
  wang: "왼쪽이 볼록해요",
  last: "왼쪽 반달",
  wanc: "왼쪽이 가늘게 밝아요",
};
const NAME: Record<Key, string> = { new: "삭", first: "상현달", full: "보름달", last: "하현달" };
const FOUND: Record<Key, string> = {
  new: "달이 <b>태양 쪽</b>에 있으면 밝은 면이 반대편이라 안 보여요. 이때가 <b>삭</b>이에요.",
  first: "태양과 <b>직각</b>인 자리에서는 오른쪽 절반만 보여요. <b>상현달</b>이에요.",
  full: "달이 <b>태양 반대쪽</b>에 있으면 밝은 면이 다 보여요. <b>보름달</b>이에요.",
  last: "반대편 <b>직각</b> 자리에서는 왼쪽 절반만 보여요. <b>하현달</b>이에요.",
};

function lookKey(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  if (d < 20 || d >= 340) return "new";
  if (d < 70) return "waxc";
  if (d < 110) return "first";
  if (d < 160) return "waxg";
  if (d < 200) return "full";
  if (d < 250) return "wang";
  if (d < 290) return "last";
  return "wanc";
}

export const u7MoonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MoonStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-moon", api });
  const doneCta = s.cta ?? "개념 정리하기";

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "달을 끌어 보세요" });
  const sunTag = el("div", { class: "u7x-tag u7x-moon-sun", text: "태양" });
  const earthTag = el("div", { class: "u7x-tag u7x-moon-earth", text: "지구" });
  const inset = el("div", { class: "u7x-inset", attrs: { "aria-hidden": "true" } }, el("span", { text: "지구에서 본 달" }));
  f.stage.append(canvas, pill, sunTag, earthTag, inset);

  const goals = u7Goals(2, [
    { id: "new", name: "안 보이는 달", sub: "어디에 두면 될까요" },
    { id: "first", name: "오른쪽 반달", sub: "어디에 두면 될까요" },
    { id: "full", name: "둥근 달", sub: "어디에 두면 될까요" },
    { id: "last", name: "왼쪽 반달", sub: "어디에 두면 될까요" },
  ]);
  f.slot.setControls(el("div", { class: "u7x-cap", text: "달을 옮겨 네 가지 모습을 만들어요" }), goals.el);
  f.say("달을 궤도에서 끌어 보세요. 오른쪽 위 창이 <b>지구에서 본 달</b>이에요.");
  f.pips(1);
  api.setCTA("달의 네 모습을 찾아요", { enabled: false });
  host.dataset.u7Phase = "play";

  let theta = Math.PI * 0.72; // 0 = 태양 쪽(삭), 반시계로 커진다
  let dragging = false;
  let heldKey = "";
  let heldMs = 0;
  let phase: "play" | "ask" | "done" = "play";
  let disposed = false;

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("달을 다시 끌어 보며 확인해도 좋아요. 달의 <b>절반</b>은 늘 밝아요.");
    f.slot.conclude("달은 <b>햇빛을 받는 절반</b>만 밝아요. 달이 지구 둘레를 돌면 그 절반을 <b>보는 방향</b>이 달라져서, 달의 모양이 날마다 달라 보여요.");
    api.enableCTA(doneCta);
  }

  function askWhy(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    f.say("네 모습을 모두 찾았어요. 무대의 달을 보면서 답해 보세요.");
    f.slot.ask(
      "달의 <b>모양이 달라 보인</b> 까닭은 무엇일까요?",
      [{ t: "보는 방향이 달라져서", ok: true }, { t: "지구 그림자가 가려서" }, { t: "달이 내는 빛이 변해서" }],
      (ok) => api.recordQuiz(ok),
      { why: "달의 절반은 어느 자리에서나 햇빛을 받아 밝았어요.", onNext: conclude },
    );
  }

  function found(key: Key): void {
    if (!goals.done(key, `이름은 ${NAME[key]}`)) return;
    haptic(HAPTIC.ctaUnlock);
    host.dataset.u7Found = String(goals.count());
    if (phase !== "play") return;
    f.say(FOUND[key]);
    if (goals.count() === goals.total) window.setTimeout(() => !disposed && phase === "play" && askWhy(), 1500);
  }

  // ---- 3D(동적 로드) ----
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let earth: T.Mesh | null = null;
  let moon: T.Mesh | null = null;
  let halo: T.Sprite | null = null;
  let earthCam: T.PerspectiveCamera | null = null;
  const sunParts: T.Object3D[] = []; // 태양과 햇빛 화살표(지구에서 본 달 창에는 그리지 않는다)
  let loop: Loop | null = null;

  void (async () => {
    const S = await import("../../../ui/space3d");
    if (disposed) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 46 });
    if (!st) {
      // 3D를 켤 수 없는 기기: 무대 없이 결론만 알려 주고 지나가게 한다
      f.stage.classList.add("u7x-fallback");
      api.recordQuiz(true);
      conclude();
      f.say("이 기기에서는 입체 무대를 켤 수 없어요. 아래 글로 알아 두세요.");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(600, 120));
    const sunBall = S.makePlanet("sun", 0.8, 36);
    sunBall.position.set(5.5, 0, 0);
    scene.add(sunBall);
    sunParts.push(sunBall);
    const glow = S.makeGlow(4.6, "rgba(255,190,80,.85)", 0.14);
    glow.position.set(5.5, 0, 0);
    scene.add(glow);
    sunParts.push(glow);
    const light = new THREE.DirectionalLight(0xfff2dc, 2.5);
    light.position.set(10, 0, 0);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x3a4a68, 0.55));
    // 햇빛의 방향(태양에서 지구 쪽으로)
    for (const z of [-1.5, 0, 1.5]) {
      const a = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(4.55, 0, z), 0.95, 0xffc24e, 0.34, 0.2);
      for (const m of [a.line.material, a.cone.material] as T.Material[]) {
        m.transparent = true;
        m.opacity = 0.7;
      }
      scene.add(a);
      sunParts.push(a);
    }
    earth = S.makePlanet("earth", 0.95, 56);
    scene.add(earth);
    scene.add(S.makeOrbitLine(ORBIT_R, "#7C98C4", 0.6));
    moon = S.makePlanet("moon", 0.36, 40);
    scene.add(moon);
    halo = S.makeGlow(2.1, "rgba(150,190,255,.5)", 0.34);
    scene.add(halo);

    // 구도(가로 346, 세로 230): 궤도 왼쪽 끝(-3.7)부터 태양 오른쪽 끝(6.3)까지 x 10이 들어와야 한다.
    // 가로 시야 반각 = atan(tan(23°) × 1.5) = 32.5°, 필요한 거리 = 5 / tan(32.5°) = 7.9. 여유를 두고 9.4.
    // 오른쪽 위에 창이 있으므로 장면을 왼쪽 아래로 조금 내려 태양이 창 아래에 오게 한다.
    camera.position.set(1.75, 7.0, 5.5);
    camera.lookAt(1.75, 0, -0.45);
    earthCam = new THREE.PerspectiveCamera(22, 1, 0.05, 300);

    loop = createLoop((dt) => frame(dt));
    loop.start();
  })();

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
    const t = pointerTheta(e);
    if (t != null) theta = t;
    bvCapture(canvas, e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const t = pointerTheta(e);
    if (t != null) theta = t;
  });
  const end = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  u7Dev(host, { set: (deg: number) => (theta = (deg * Math.PI) / 180) });

  function frame(dt: number): void {
    if (!st || !THREE || !earth || !moon || !earthCam || !halo) return;
    const w = canvas.clientWidth || 346;
    const h = canvas.clientHeight || STAGE_H;
    st.resize(w, h);

    earth.rotation.y += 0.0035 * dt;
    const px = Math.cos(theta) * ORBIT_R;
    const pz = -Math.sin(theta) * ORBIT_R;
    moon.position.set(px, 0, pz);
    moon.rotation.y = theta + Math.PI; // 늘 같은 면이 지구를 향한다
    halo.position.set(px, 0, pz);
    halo.material.opacity = dragging ? 0.95 : 0.6;

    const dir = new THREE.Vector3(px, 0, pz).normalize();
    earthCam.position.copy(dir.clone().multiplyScalar(1.1));
    earthCam.up.set(0, 1, 0);
    earthCam.lookAt(px, 0, pz);

    const deg = ((theta * 180) / Math.PI + 360) % 360;
    const key = lookKey(deg);
    const named = (key === "new" || key === "first" || key === "full" || key === "last") && goals.has(key);
    pill.textContent = named ? `${LOOK[key]}, ${NAME[key as Key]}` : LOOK[key];
    host.dataset.u7Look = key;
    if (key === heldKey) heldMs += dt * 16.7;
    else {
      heldKey = key;
      heldMs = 0;
    }
    if (heldMs > 320 && (key === "new" || key === "first" || key === "full" || key === "last")) found(key);

    // 이름표는 화면 글자로 따라붙는다
    const place = (tag: HTMLElement, x: number, z: number, dy: number): void => {
      const v = new THREE!.Vector3(x, 0, z).project(st!.camera);
      tag.style.transform = `translate(-50%, 0) translate(${(((v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - v.y) / 2) * h + dy).toFixed(1)}px)`;
    };
    place(sunTag, 5.5, 0, 30);
    place(earthTag, 0, 0, 30);

    const r = st.renderer;
    r.setScissorTest(false);
    r.setViewport(0, 0, w, h);
    st.render();
    // 오른쪽 위 창: 지구에서 본 달
    const ix = w - INSET - INSET_PAD;
    const iy = h - INSET - INSET_PAD;
    r.setScissorTest(true);
    r.setViewport(ix, iy, INSET, INSET);
    r.setScissor(ix, iy, INSET, INSET);
    r.setClearColor(0x070d1a, 1);
    r.clear(true, true, false);
    for (const o of sunParts) o.visible = false; // 달 뒤의 태양이 비쳐 일식처럼 보이지 않게
    r.render(st.scene, earthCam);
    for (const o of sunParts) o.visible = true;
    r.setScissorTest(false);
    r.setClearColor(0x000000, 0);
  }

  return () => {
    disposed = true;
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
  };
};
