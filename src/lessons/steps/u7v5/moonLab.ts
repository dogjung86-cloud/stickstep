// u7MoonLab: 달의 위상 랩(u7l5). 교과서 탐구 "모형을 이용하여 달의 위상 변화 관찰하기"(248~249쪽)를 학생이 직접 한다.
//   교과서: 가운데 스마트 기기(지구), 둘레 여덟 자리에 반쪽을 칠한 공(달). 노란 쪽이 늘 태양을 향하게 놓고 자리마다 사진을 찍어
//           찍힌 모습을 차례로 늘어놓고 견준다.
//   랩   : 달을 궤도의 여덟 자리로 옮기고 자리마다 "사진 찍기"를 누른다. 오른쪽 위 창이 지구에서 본 모습(카메라)이고,
//           찍은 사진이 조작 칸의 여덟 칸에 자리 차례대로 쌓인다. 여덟 장이 모이면 달라지는 모양이 한 줄로 보인다.
// 판(흐름)은 교과서 탐구에서 새로 짰다. 3D 킷(ui/space3d, 실사 질감)은 도구로 쓴다(명암이 곧 개념이라 3D로 만든다).
// 정본 moonPhase3d는 네 위상의 이름을 목표로 걸고 그 자리에 머물면 모았다. 여기서는 학생이 자리를 정해 찍고, 이름은 사진이 모인 뒤에 붙는다.
// 무대 어디를 눌러도 달이 그 방향으로 오고, 손을 떼면 가장 가까운 자리에 선다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import { bvBtn, bvCapture } from "../bio6/b6Lab";
import { u7Frame, u7Dev } from "./kit";

interface MoonStep {
  title: string;
  cta?: string;
}

const ORBIT_R = 3.3;
const STAGE_H = 230;
const INSET = 88; // 지구에서 본 달 창(px)
const INSET_PAD = 8;
const N = 8; // 자리 수(45° 간격). 0번이 태양 쪽이고 반시계로 센다
const STEP = (Math.PI * 2) / N;

// 자리마다: 찍힌 모습을 부르는 말, 사진 아래 이름표(네 자리만), 찍은 뒤 도움말
const SPOTS: { look: string; name: string; say: string }[] = [
  { look: "안 보여요", name: "삭", say: "달이 <b>태양 쪽</b>에 있으면 밝은 면이 반대편이라 안 보여요." },
  { look: "오른쪽이 가늘게 밝아요", name: "", say: "오른쪽이 가늘게 밝아요. <b>초승달</b>이에요." },
  { look: "오른쪽 반달", name: "상현달", say: "태양과 <b>직각</b>인 자리에서는 오른쪽 절반이 보여요." },
  { look: "오른쪽이 볼록해요", name: "", say: "밝은 부분이 더 차올랐어요. 둥근 달에 가까워요." },
  { look: "둥근 달", name: "보름달", say: "달이 <b>태양 반대쪽</b>에 있으면 밝은 면이 다 보여요." },
  { look: "왼쪽이 볼록해요", name: "", say: "이번에는 오른쪽부터 줄어들어요. 왼쪽이 볼록해요." },
  { look: "왼쪽 반달", name: "하현달", say: "반대편 <b>직각</b> 자리에서는 왼쪽 절반이 보여요." },
  { look: "왼쪽이 가늘게 밝아요", name: "", say: "왼쪽이 가늘게 밝아요. <b>그믐달</b>이에요." },
];

export const u7MoonLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MoonStep;
  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-moon", api });
  const doneCta = s.cta ?? "개념 정리하기";

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "달을 끌어 보세요" });
  const sunTag = el("div", { class: "u7x-tag u7x-moon-sun", text: "태양" });
  const earthTag = el("div", { class: "u7x-tag u7x-moon-earth", text: "지구" });
  const inset = el("div", { class: "u7x-inset", attrs: { "aria-hidden": "true" } }, el("span", { text: "지구에서 본 달" }));
  const dots = Array.from({ length: N }, () => el("i", { class: "u7x-mpos" }));
  f.stage.append(canvas, ...dots, pill, sunTag, earthTag, inset);

  // 조작 칸: 사진 여덟 칸(자리 차례) + 사진 찍기
  const films = SPOTS.map((_, k) => {
    const cv = el("canvas", { class: "u7x-film-cv", attrs: { width: "76", height: "76" } }) as HTMLCanvasElement;
    const nm = el("i", { text: "" });
    const cell = el("div", { class: "u7x-film", dataset: { k: String(k) } }, cv, nm);
    return { cell, cv, nm, taken: false };
  });
  const strip = el("div", { class: "u7x-films" }, ...films.map((x) => x.cell));
  const shutter = bvBtn("main", "이 자리에서 사진 찍기");
  shutter.classList.add("u7x-shutter");
  f.slot.setControls(el("div", { class: "u7x-cap", text: "찍은 사진(자리 차례대로 놓여요)" }), strip, shutter);
  f.say("달을 끌어 자리에 놓고 <b>사진 찍기</b>를 눌러요. 여덟 자리를 모두 찍어 견줘 봐요.");
  f.pips(1);
  api.setCTA("여덟 자리의 달을 찍어요", { enabled: false });
  host.dataset.u7Phase = "play";
  host.dataset.u7Found = "0";

  let theta = STEP * 3; // 0 = 태양 쪽(삭), 반시계로 커진다
  let target: number | null = null; // 손을 뗀 뒤 가서 설 각도
  let dragging = false;
  let wantShot = false;
  let phase: "play" | "wait" | "ask" | "done" = "play";
  let disposed = false;
  const norm = (a: number): number => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const spotOf = (a: number): number => Math.round(norm(a) / STEP) % N;
  const count = (): number => films.filter((x) => x.taken).length;

  function conclude(): void {
    phase = "done";
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("달을 다시 옮겨 보며 확인해도 좋아요. 달의 <b>절반</b>은 늘 밝아요.");
    f.slot.conclude("달은 <b>햇빛을 받는 절반</b>만 밝아요. 달이 지구 둘레를 돌면 그 절반을 <b>보는 방향</b>이 달라져서, 달의 모양이 날마다 달라 보여요.");
    api.enableCTA(doneCta);
  }

  function askWhy(): void {
    phase = "ask";
    host.dataset.u7Phase = "ask";
    f.pips(2);
    f.say("여덟 장을 모두 찍었어요. 무대의 달을 보면서 답해 보세요.");
    f.slot.ask(
      "달의 <b>모양이 달라 보인</b> 까닭은 무엇일까요?",
      [{ t: "밝은 쪽을 보는 방향이 달라져서", ok: true }, { t: "지구 그림자가 가려서" }, { t: "달이 내는 빛이 변해서" }],
      (ok) => api.recordQuiz(ok),
      { why: "달의 절반은 어느 자리에서나 햇빛을 받아 밝았어요.", onNext: conclude },
    );
  }

  shutter.addEventListener("click", () => {
    if (phase !== "play" || !st) return;
    const k = spotOf(target ?? theta);
    theta = k * STEP; // 자리에 정확히 세우고 찍는다
    target = null;
    if (films[k].taken) {
      haptic(HAPTIC.tap);
      f.say("이 자리는 이미 찍었어요. 달을 <b>빈 자리</b>로 옮겨 보세요.");
      return;
    }
    wantShot = true;
  });

  function took(k: number): void {
    films[k].taken = true;
    films[k].cell.classList.add("on");
    dots[k].classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    host.dataset.u7Found = String(count());
    if (count() < N) {
      f.say(`${SPOTS[k].say} 달을 다음 자리로 옮겨요.`);
      return;
    }
    // 여덟 장이 모였다: 네 자리에 이름을 붙이고 까닭을 묻는다
    phase = "wait";
    host.dataset.u7Phase = "wait";
    shutter.disabled = true;
    films.forEach((x, i) => (x.nm.textContent = SPOTS[i].name));
    f.say("여덟 장이 모였어요. 밝은 부분이 <b>오른쪽부터 차올랐다가 오른쪽부터 줄어요</b>.");
    window.setTimeout(() => !disposed && askWhy(), 2200);
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
    sunBall.position.set(6.5, 0, 0);
    scene.add(sunBall);
    sunParts.push(sunBall);
    const glow = S.makeGlow(4.6, "rgba(255,190,80,.85)", 0.14);
    glow.position.set(6.5, 0, 0);
    scene.add(glow);
    sunParts.push(glow);
    const light = new THREE.DirectionalLight(0xfff2dc, 2.5);
    light.position.set(10, 0, 0);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x3a4a68, 0.55));
    // 햇빛의 방향(태양에서 지구 쪽으로)
    for (const z of [-1.5, 0, 1.5]) {
      const a = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(5.5, 0, z), 0.95, 0xffc24e, 0.34, 0.2);
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

    // 구도(가로 346, 세로 230): 궤도 왼쪽 끝(-3.7)부터 태양 오른쪽 끝(7.3)까지 들어와야 한다.
    // 가로 시야 반각 = atan(tan(23°) × 1.5) = 32.5°, 필요한 거리 = 5.5 / tan(32.5°) = 8.6. 지금 거리 9.8.
    // 오른쪽 위에 창이 있으므로 태양이 창 아래에 오게 한다.
    camera.position.set(1.8, 7.3, 6.5);
    camera.lookAt(1.8, 0, 0.15);
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
    target = null;
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
    if (!dragging) return;
    dragging = false;
    target = spotOf(theta) * STEP; // 가장 가까운 자리에 선다
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  // 검사용: 자리 번호(0~7)를 주면 달을 그 자리에 세운다
  u7Dev(host, {
    spot: (k: number) => {
      theta = k * STEP;
      target = null;
    },
  });

  function frame(dt: number): void {
    if (!st || !THREE || !earth || !moon || !earthCam || !halo) return;
    const w = canvas.clientWidth || 346;
    const h = canvas.clientHeight || STAGE_H;
    st.resize(w, h);

    if (target != null) {
      let d = target - theta;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) < 0.01) {
        theta = target;
        target = null;
      } else theta += d * Math.min(1, 0.25 * dt);
    }
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

    const k = spotOf(theta);
    pill.textContent = films[k].taken && SPOTS[k].name && phase !== "play" ? `${SPOTS[k].look}, ${SPOTS[k].name}` : SPOTS[k].look;
    host.dataset.u7Spot = String(k);

    // 이름표와 자리 표시는 화면 글자로 따라붙는다
    const v = new THREE.Vector3();
    const place = (tag: HTMLElement, x: number, z: number, dy: number): void => {
      v.set(x, 0, z).project(st!.camera);
      tag.style.transform = `translate(-50%, -50%) translate(${(((v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - v.y) / 2) * h + dy).toFixed(1)}px)`;
    };
    place(sunTag, 6.5, 0, 36);
    place(earthTag, 0, 0, 38);
    dots.forEach((d, i) => {
      place(d, Math.cos(i * STEP) * ORBIT_R, -Math.sin(i * STEP) * ORBIT_R, 0);
      d.classList.toggle("here", i === k && !dragging);
    });

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

    // 사진 찍기: 방금 그린 창을 그 자리의 칸에 옮겨 담는다(같은 프레임 안이라 그림이 남아 있다)
    if (wantShot) {
      wantShot = false;
      const pr = canvas.width / w;
      const ctx = films[k].cv.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#070d1a";
        ctx.fillRect(0, 0, 76, 76);
        ctx.drawImage(canvas, (ix + 12) * pr, (INSET_PAD + 4) * pr, (INSET - 24) * pr, (INSET - 24) * pr, 0, 0, 76, 76);
      }
      took(k);
    }
  }

  return () => {
    disposed = true;
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
  };
};
