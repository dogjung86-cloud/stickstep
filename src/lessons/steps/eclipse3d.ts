// eclipse3d — 일식과 월식 3D 정렬 랩(VII 단원 L6). 교과서 그림 VII-10의 입체 조작판.
//   · 가로 모드(rotateStage): 태양—지구—달을 한 화면에 길게 놓고 달을 궤도에서 끈다.
//   · 달 그림자·지구 그림자를 원뿔로 보여 주고, 일렬이 되는 순간 일식/월식이 일어난다.
//   · 일식 정렬 시 "지상에서 보기" — 달이 태양을 가리고 코로나가 드러나는 개기일식 뷰.
// 목표: ① 일식 만들기(태양—달—지구) ② 지상에서 개기일식 보기 ③ 월식 만들기(붉은 달).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { RotateStage } from "../../ui/rotateStage";

interface EclipseStep {
  title: string;
  lead?: string;
  cta?: string;
}

const EARTH_X = 12;
const ORBIT_R = 6.2;
const SUN_X = -21;

function wrapDeg(d: number): number {
  return ((d + 180) % 360 + 360) % 360 - 180;
}

export const eclipse3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as EclipseStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "solar" } }, el("b", { text: "일식" }), el("span", { text: "태양—달—지구" })),
    el("div", { class: "pn-badge", dataset: { g: "ground" } }, el("b", { text: "지상에서" }), el("span", { text: "가려진 태양" })),
    el("div", { class: "pn-badge", dataset: { g: "lunar" } }, el("b", { text: "월식" }), el("span", { text: "태양—지구—달" })),
  );

  // 세로 화면: 진입 카드
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", { class: "sp3-enter-txt", html: "태양·지구·달을 <b>한 줄로 길게</b> 놓고 조작해요.<br>화면이 자동으로 <b>가로</b>로 돌아가요." }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "달이 지구를 돌다 보면 <b>태양·지구와 일렬</b>이 되는 순간이 있어요 — 그때 무슨 일이 생기는지 직접 만들어 봐요!",
  });
  host.append(goalChips, preview, enterBtn, helper);

  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>일식 = 태양—달—지구</b>(삭) — 달이 태양을 가려요. <b>월식 = 태양—지구—달</b>(망) — 달이 지구 그림자에 들어가 <b>붉게</b> 보여요. 매달 안 생기는 건 달 궤도가 살짝 기울어 있어서예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 가로 스테이지 + 3D ----
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let loop: Loop | null = null;
  let disposed = false;

  let phi = Math.PI * 0.55; // 달 각도(0 = 태양 반대쪽 = 월식 자리, 180° = 태양 쪽)
  let dragging = false;
  let groundView = false;
  let alignedSolarMs = 0;
  let alignedLunarMs = 0;
  let groundMs = 0;
  // "왜 매달 일어나지 않을까" 모드 — 달 궤도를 기울여(실제 약 5°, 여기선 과장) 빗나감을 보여 준다
  let tiltOn = false;
  let tiltT = 0; // 0..1 애니메이션
  const TILT = 0.22; // rad(~12.6°) — 과장 표현, 문구에 실제 5° 명시
  let missToastMs = 0;
  // 부분일식·부분월식 선경험 — 개기 정렬(<7°) 직전의 7~14° 구간에 한 번씩 토스트.
  // 목표(collect) 조건은 개기 정렬 기준 그대로 — 부분 구간은 안내만 한다.
  let partialSide: "" | "solar" | "lunar" = "";

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "일식과 월식 — 달을 끌어서 일렬로",
      onLeave: () => {
        leave();
      },
    });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    const phasePill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), el("span", { text: "달을 좌우로 끌어 보세요" }));
    const groundBtn = el("button", { class: "sp3-groundbtn hide", attrs: { type: "button" } }, el("span", { text: "지상에서 보기" }));
    const tiltBtn = el("button", { class: "sp3-tiltbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "왜 매달 안 일어날까?" }));
    const toast = el("div", { class: "sp3-toast" });
    rot.stage.append(canvas, phasePill, groundBtn, tiltBtn, toast);
    const pillText = phasePill.querySelectorAll("span")[1] as HTMLElement;

    const S = await import("../../ui/space3d");
    if (disposed || !rot) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 34 });
    if (!st) {
      pillText.textContent = "이 기기는 3D를 지원하지 않아요";
      helper.innerHTML = "3D를 켤 수 없어요. 그림으로 기억해요 — <b>일식 = 태양—달—지구(삭)</b>, <b>월식 = 태양—지구—달(망), 붉은 달</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(800, 220));

    // 태양(왼쪽) — 교과서 그림 VII-10과 같은 배치
    const sunBall = S.makePlanet("sun", 5, 48);
    sunBall.position.set(SUN_X, 0, 0);
    scene.add(sunBall);
    const sunGlow = S.makeGlow(24, "rgba(255,180,70,.9)", 0.16);
    sunGlow.position.set(SUN_X, 0, 0);
    scene.add(sunGlow);
    const corona = S.makeGlow(40, "rgba(214,230,255,.5)", 0.1);
    corona.position.set(SUN_X, 0, 0);
    corona.material.opacity = 0;
    scene.add(corona);
    const sunLight = new THREE.DirectionalLight(0xfff2dc, 2.6);
    sunLight.position.set(SUN_X, 0, 0);
    sunLight.target.position.set(EARTH_X, 0, 0);
    scene.add(sunLight, sunLight.target);
    scene.add(new THREE.AmbientLight(0x44536e, 0.7));

    const earth = S.makePlanet("earth", 1.5, 56);
    earth.position.set(EARTH_X, 0, 0);
    scene.add(earth);
    // 달 궤도(기울기 모드에서 z축 회전) + 비교용 평면 유령 궤도
    const orbit = S.makeOrbitLine(ORBIT_R, "#6E8CB8", 0.45);
    const orbitGroup = new THREE.Group();
    orbitGroup.position.set(EARTH_X, 0, 0);
    orbitGroup.add(orbit);
    scene.add(orbitGroup);
    const flatGhost = S.makeOrbitLine(ORBIT_R, "#4A5F86", 0.3);
    flatGhost.position.set(EARTH_X, 0, 0);
    flatGhost.visible = false;
    scene.add(flatGhost);
    const moon = S.makePlanet("moon", 0.44, 40);
    scene.add(moon);
    const moonMat = moon.material as T.MeshLambertMaterial;
    const moonHalo = S.makeGlow(2.1, "rgba(140,180,255,.4)", 0.3);
    scene.add(moonHalo);

    // 그림자 원뿔(교과서 그림처럼 시각화 — 용어는 쓰지 않는다)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0a1020, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide });
    const earthCone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 15, 40, 1, true), shadowMat);
    earthCone.rotation.z = -Math.PI / 2; // 꼭짓점이 +X(태양 반대쪽)
    earthCone.position.set(EARTH_X + 7.5, 0, 0);
    scene.add(earthCone);
    const moonCone = new THREE.Mesh(new THREE.ConeGeometry(0.44, 8.5, 32, 1, true), shadowMat.clone());
    scene.add(moonCone);
    // 지구 표면의 달 그림자 자국(일식 지역)
    const spot = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 30),
      new THREE.MeshBasicMaterial({ color: 0x060a14, transparent: true, opacity: 0, depthWrite: false }),
    );
    scene.add(spot);

    // 태양(왼쪽 끝)부터 달 궤도 바깥(오른쪽)까지 한 프레임 — 가로 ~2.1:1 화면 기준으로 산출.
    // 필요 반폭 ≈ (20 − (−26.5))/2 + 여유 ≈ 24.5 → dist ≥ 24.5/tan(hfov/2 ≈ 33.5°) ≈ 37.
    const spaceCamPos = new THREE.Vector3(-3.2, 13, 35.5);
    const spaceCamTarget = new THREE.Vector3(-3.2, 0, 0);
    camera.position.copy(spaceCamPos);
    camera.lookAt(spaceCamTarget);

    // ---- 입력 ----
    function pointerPhi(e: PointerEvent): number | null {
      if (!rot || !st || !THREE) return null;
      const { w, h } = rot.size();
      const p = rot.mapPoint(e);
      const nx = (p.x / w) * 2 - 1;
      const ny = -((p.y / h) * 2 - 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), st.camera);
      const hit = new THREE.Vector3();
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return null;
      return Math.atan2(-(hit.z - 0), hit.x - EARTH_X);
    }
    canvas.addEventListener("pointerdown", (e) => {
      if (groundView) return;
      dragging = true;
      const t = pointerPhi(e);
      if (t != null) phi = t;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging || groundView) return;
      const t = pointerPhi(e);
      if (t != null) phi = t;
    });
    const up = (): void => {
      dragging = false;
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    groundBtn.addEventListener("click", () => {
      groundView = !groundView;
      groundBtn.querySelector("span")!.textContent = groundView ? "우주로 돌아가기" : "지상에서 보기";
      haptic(HAPTIC.select);
    });

    tiltBtn.addEventListener("click", () => {
      tiltOn = !tiltOn;
      tiltBtn.querySelector("span")!.textContent = tiltOn ? "궤도 평평하게 되돌리기" : "왜 매달 안 일어날까?";
      tiltBtn.setAttribute("aria-pressed", String(tiltOn));
      tiltBtn.classList.toggle("on", tiltOn);
      haptic(HAPTIC.select);
      if (tiltOn) {
        showToast("달 궤도는 지구 궤도면보다 약 5° 기울어 있어요(그림은 과장). 달을 태양 쪽으로 끌어 보세요!");
      } else {
        showToast("궤도를 다시 평평하게 — 이제 일렬 정렬을 만들 수 있어요");
      }
    });

    let toastTimer = 0;
    const showToast = (msg: string): void => {
      toast.textContent = msg;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
    };

    // ---- 프레임 ----
    loop = createLoop((dt) => {
      if (!rot || !st || !THREE) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);

      // 궤도 기울기(기울기 모드) — z축 회전이라 교점(빗나가지 않는 자리)은 옆구리 쪽
      tiltT = clamp(tiltT + (tiltOn ? 0.045 : -0.06) * dt, 0, 1);
      const rz = TILT * tiltT;
      orbitGroup.rotation.z = rz;
      flatGhost.visible = tiltT > 0.05 && !groundView;

      const mx = EARTH_X + Math.cos(phi) * ORBIT_R * Math.cos(rz);
      const my = Math.cos(phi) * ORBIT_R * Math.sin(rz);
      const mz = -Math.sin(phi) * ORBIT_R;
      moon.position.set(mx, my, mz);
      moon.rotation.y = phi + Math.PI;
      moonHalo.position.set(mx, my, mz);
      moonHalo.material.opacity = dragging ? 0.85 : 0.5;
      earth.rotation.y += 0.004 * dt;

      // 달 그림자 원뿔 — 태양 반대 방향으로(달 높이를 따라간다)
      moonCone.position.set(mx + 4.25, my, mz);
      moonCone.rotation.z = -Math.PI / 2;

      const deg = ((phi * 180) / Math.PI + 360) % 360;
      const dSolar = Math.abs(wrapDeg(deg - 180)); // 태양 쪽
      const dLunar = Math.abs(wrapDeg(deg)); // 반대쪽
      const onPlane = Math.abs(my) < 0.45; // 그림자가 실제로 닿으려면 궤도면 근처여야 한다
      const solarAligned = dSolar < 7 && onPlane;
      const lunarAligned = dLunar < 7 && onPlane;

      // 기울기 모드에서 삭·망 자리에 왔지만 빗나가는 순간 — 희소성의 핵심 장면
      missToastMs = Math.max(0, missToastMs - dt * 16.7);
      const nearMiss = tiltT > 0.6 && !onPlane && (dSolar < 9 || dLunar < 9);
      if (nearMiss) {
        if (missToastMs === 0) {
          showToast(
            dSolar < 9
              ? "빗나갔어요! 삭이어도 달 그림자가 지구 위·아래로 비껴가요 — 그래서 일식은 가끔만 일어나요"
              : "빗나갔어요! 망이어도 달이 지구 그림자를 위·아래로 비껴가요 — 그래서 월식도 드물죠",
          );
          missToastMs = 3200;
          haptic(HAPTIC.tap);
        }
        pillText.textContent = "그림자가 비껴가요 — 궤도가 기울어 있으니까!";
      }

      // 부분일식·부분월식(7~14° 어중간한 정렬 — 궤도면 위일 때만)
      const partialSolar = !solarAligned && dSolar < 14 && onPlane && !groundView;
      const partialLunar = !lunarAligned && dLunar < 14 && onPlane && !groundView;
      if (partialSolar && partialSide !== "solar") {
        partialSide = "solar";
        showToast("태양이 일부만 가려졌어요 — 부분일식! 더 정확히 일렬로 맞추면 개기일식이 돼요");
        haptic(HAPTIC.tap);
      } else if (partialLunar && partialSide !== "lunar") {
        partialSide = "lunar";
        showToast("달이 지구 그림자에 일부만 걸쳤어요 — 부분월식! 더 깊이 넣으면 개기월식이 돼요");
        haptic(HAPTIC.tap);
      } else if (!partialSolar && !partialLunar && dSolar > 16 && dLunar > 16) {
        partialSide = "";
      }

      // 일식: 지구 표면 그림자 자국 + 지상 보기 버튼
      const spotMat = spot.material as T.MeshBasicMaterial;
      if (solarAligned) {
        alignedSolarMs += dt * 16.7;
        spot.position.set(EARTH_X - 1.52, 0, mz * 0.1);
        spot.rotation.y = -Math.PI / 2;
        spotMat.opacity = Math.min(0.75, spotMat.opacity + 0.06 * dt);
        if (alignedSolarMs > 320 && !goals.has("solar")) {
          collect("solar", "삭 자리!");
          showToast("일식! 달 그림자가 닿은 지역에서 태양이 가려져요 — 이때 달의 위상은 삭");
          pillText.textContent = "일식 — 태양·달·지구가 일렬!";
        }
        if (goals.has("solar")) groundBtn.classList.remove("hide");
      } else {
        alignedSolarMs = 0;
        spotMat.opacity = Math.max(0, spotMat.opacity - 0.08 * dt);
        if (!groundView) groundBtn.classList.toggle("hide", !goals.has("solar") || !solarAligned);
      }

      // 월식: 붉은 달
      if (lunarAligned) {
        alignedLunarMs += dt * 16.7;
        moonMat.color.lerp(new THREE.Color(0xff5f3c), Math.min(1, 0.08 * dt));
        if (alignedLunarMs > 320 && !goals.has("lunar")) {
          collect("lunar", "붉은 달!");
          showToast("월식! 달이 지구 그림자에 들어가 붉게 보여요 — 이때 달의 위상은 망");
          pillText.textContent = "월식 — 태양·지구·달이 일렬!";
        }
      } else {
        alignedLunarMs = 0;
        moonMat.color.lerp(new THREE.Color(0xffffff), Math.min(1, 0.06 * dt));
        if (!solarAligned && !groundView && !nearMiss) {
          pillText.textContent = partialSolar
            ? "부분일식 — 태양 쪽으로 조금만 더!"
            : partialLunar
              ? "부분월식 — 더 깊이 넣어 보세요!"
              : dSolar < 40
                ? "태양 쪽으로 조금만 더…"
                : dLunar < 40
                  ? "태양 반대쪽으로 조금만 더…"
                  : "달을 좌우로 끌어 보세요";
        }
      }

      // 카메라 + 개기일식 지상 뷰
      if (groundView && solarAligned) {
        groundMs += dt * 16.7;
        // 스냅 보정: 지상에서 보는 동안 달이 태양 정중앙으로 스르륵 정렬 + 겉보기 크기 확대
        phi += wrapDeg(180 - deg) * 0.0022 * Math.PI * dt;
        moon.scale.lerp(new THREE.Vector3(1.6, 1.6, 1.6), Math.min(1, 0.08 * dt));
        orbit.visible = false;
        moonCone.visible = false;
        earthCone.visible = false;
        const gp = new THREE.Vector3(EARTH_X - 1.62, 0.06, 0);
        st.camera.position.lerp(gp, Math.min(1, 0.1 * dt));
        st.camera.lookAt(SUN_X, 0, 0);
        (st.camera as T.PerspectiveCamera).fov = 26;
        st.camera.updateProjectionMatrix();
        corona.material.opacity = Math.min(0.95, corona.material.opacity + 0.05 * dt);
        sunGlow.material.opacity = 0.35;
        if (groundMs > 900 && !goals.has("ground")) {
          collect("ground", "코로나!");
          showToast("개기일식 — 달이 태양을 완전히 가리면, 평소 안 보이던 태양의 대기가 드러나요");
        }
      } else {
        groundMs = 0;
        moon.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, 0.1 * dt));
        orbit.visible = true;
        moonCone.visible = true;
        earthCone.visible = true;
        st.camera.position.lerp(spaceCamPos, Math.min(1, 0.09 * dt));
        st.camera.lookAt(spaceCamTarget);
        (st.camera as T.PerspectiveCamera).fov = 34;
        st.camera.updateProjectionMatrix();
        corona.material.opacity = Math.max(0, corona.material.opacity - 0.06 * dt);
        sunGlow.material.opacity = 1;
        if (groundView && !solarAligned) {
          groundView = false;
          groundBtn.querySelector("span")!.textContent = "지상에서 보기";
        }
      }
      groundBtn.classList.toggle("hide", !(solarAligned && goals.has("solar")));
      st.render();
    });
    loop.start();
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
    rot?.dispose();
    rot = null;
    groundView = false;
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 열어 보기";
      enterBtn.classList.remove("pulse");
    } else {
      helper.innerHTML = "아직 목표가 남았어요 — 다시 열어서 <b>일식·월식</b>을 마저 만들어 봐요!";
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("일식과 월식을 만들어요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

function enterArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="ec-sun" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFE9A8"/><stop offset=".6" stop-color="#FFC24E"/><stop offset="1" stop-color="#F59E2C"/>
      </radialGradient>
      <radialGradient id="ec-earth" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#7FB2F0"/><stop offset=".6" stop-color="#2E6FD4"/><stop offset="1" stop-color="#1B4B9E"/>
      </radialGradient>
      <radialGradient id="ec-moon" cx=".35" cy=".3" r=".8">
        <stop offset="0" stop-color="#F0EAD2"/><stop offset="1" stop-color="#B8AB84"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <circle cx="30" cy="30" r="1.2" fill="#DCE8FF"/><circle cx="250" cy="20" r="1.2" fill="#DCE8FF"/>
    <circle cx="212" cy="76" r="1" fill="#DCE8FF"/><circle cx="120" cy="14" r="1" fill="#DCE8FF"/>
    <circle cx="34" cy="48" r="20" fill="url(#ec-sun)"/>
    <path d="M110 48h44" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="3 4"/>
    <circle cx="132" cy="48" r="7" fill="url(#ec-moon)"/>
    <path d="M139 44l52 12v-16z" fill="#0A1020" opacity=".55"/>
    <circle cx="200" cy="48" r="14" fill="url(#ec-earth)"/>
    <ellipse cx="188" cy="48" rx="3" ry="4.6" fill="#060A14" opacity=".7"/>
    <path d="M258 40l8 8-8 8" stroke="#8FB3E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
