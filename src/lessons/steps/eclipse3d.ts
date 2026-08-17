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
const ORBIT_R = 7;
const SUN_X = -16.5;
const SUN_R = 3;
const MOON_R = 0.9;
const GROUND_EYE = 2.26; // 지상 카메라: 지구 중심에서 태양 쪽으로 이만큼(표면 2.1 바로 위)
// 지상 뷰 달 스케일 — 실제 개기일식의 우연(달·태양의 겉보기 크기가 거의 같다)을 재현한다.
// 지상 카메라에서 달까지 4.74 vs 태양까지 26.24 → 겉보기 반각을 태양과 같게 만드는 스케일,
// ×1.06은 가장자리로 태양이 새지 않게 하는 여유(2026-07-26 사용자 피드백 — 검은 해 + 코로나 링).
const ECLIPSE_SCALE = ((ORBIT_R - GROUND_EYE) * (SUN_R / (EARTH_X - GROUND_EYE - SUN_X)) * 1.06) / MOON_R;

function wrapDeg(d: number): number {
  return ((d + 180) % 360 + 360) % 360 - 180;
}

function wrapRad(r: number): number {
  return ((r + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
}

export const eclipse3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as EclipseStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "solar" } }, el("b", { text: "일식" }), el("span", { text: "태양-달-지구" })),
    el("div", { class: "pn-badge", dataset: { g: "ground" } }, el("b", { text: "지상에서" }), el("span", { text: "가려진 태양" })),
    el("div", { class: "pn-badge", dataset: { g: "lunar" } }, el("b", { text: "월식" }), el("span", { text: "태양-지구-달" })),
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
    html: "달이 지구를 돌다 보면 <b>태양·지구와 일렬</b>이 되는 순간이 있어요. 그때 무슨 일이 생기는지 직접 만들어 봐요!",
  });
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

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
        "정리! <b>일식 = 태양-달-지구</b>(삭), 달이 태양을 가려요. <b>월식 = 태양-지구-달</b>(망), 달이 지구 그림자에 들어가 <b>붉게</b> 보여요. 매달 안 생기는 건 달 궤도가 살짝 기울어 있어서예요.";
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
  const TILT = 0.3; // rad(~17°) — 과장 표현, 문구에 실제 5° 명시. 커진 달(0.9)이 지구 그림자를 확실히 비껴가는 값
  let wasMiss = false; // 빗나감 진입 햅틱(1회) 에지 검출
  // 부분일식·부분월식 선경험 — 개기 정렬(<7°) 직전의 7~14° 구간에 한 번씩 토스트.
  // 목표(collect) 조건은 개기 정렬 기준 그대로 — 부분 구간은 안내만 한다.
  let partialSide: "" | "solar" | "lunar" = "";

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "일식과 월식, 달을 끌어서 일렬로",
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
      helper.innerHTML = "3D를 켤 수 없어요. 그림으로 기억해요. <b>일식 = 태양-달-지구(삭)</b>, <b>월식 = 태양-지구-달(망), 붉은 달</b>.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(800, 220));

    // 태양(왼쪽) — 교과서 그림 VII-10과 같은 배치.
    // 크기 위계(사용자 확정 2026-07-26): 태양은 "제일 크다"만 읽히면 충분 — 조작 대상인 지구·달이
    // 화면의 주인공이 되도록 태양 구체·글로우를 줄이고 카메라를 당긴다(아래 spaceCamPos).
    const sunBall = S.makePlanet("sun", SUN_R, 48);
    sunBall.position.set(SUN_X, 0, 0);
    scene.add(sunBall);
    const sunGlow = S.makeGlow(13, "rgba(255,180,70,.9)", 0.16);
    sunGlow.position.set(SUN_X, 0, 0);
    scene.add(sunGlow);
    // 코로나 — 검은 해 테두리를 감싸는 흰 빛(지상 뷰 전용). 지름 14 = 태양 지름의 2.3배,
    // inner 0.45 ≈ 태양 반지름 지점까지 백색 코어 → 가려진 원반 가장자리에서 가장 밝게 빛난다.
    const corona = S.makeGlow(14, "rgba(224,236,255,.85)", 0.45);
    corona.position.set(SUN_X, 0, 0);
    corona.material.opacity = 0;
    scene.add(corona);
    const sunLight = new THREE.DirectionalLight(0xfff2dc, 2.6);
    sunLight.position.set(SUN_X, 0, 0);
    sunLight.target.position.set(EARTH_X, 0, 0);
    scene.add(sunLight, sunLight.target);
    scene.add(new THREE.AmbientLight(0x44536e, 0.7));

    const earth = S.makePlanet("earth", 2.1, 56);
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
    const moon = S.makePlanet("moon", MOON_R, 40);
    scene.add(moon);
    const moonMat = moon.material as T.MeshLambertMaterial;
    const moonHalo = S.makeGlow(3.6, "rgba(140,180,255,.4)", 0.3);
    scene.add(moonHalo);

    // 그림자 원뿔(교과서 그림처럼 시각화 — 용어는 쓰지 않는다)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0a1020, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide });
    const earthCone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 15, 40, 1, true), shadowMat);
    earthCone.rotation.z = -Math.PI / 2; // 꼭짓점이 +X(태양 반대쪽)
    earthCone.position.set(EARTH_X + 7.5, 0, 0);
    scene.add(earthCone);
    const moonCone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 10, 32, 1, true), shadowMat.clone());
    scene.add(moonCone);
    // 지구 표면의 달 그림자 자국(일식 지역)
    const spot = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 30),
      new THREE.MeshBasicMaterial({ color: 0x060a14, transparent: true, opacity: 0, depthWrite: false }),
    );
    scene.add(spot);

    // 프레임 = 태양 왼쪽 끝부터 달 궤도 오른쪽 끝까지. 무대 비율은 기기마다 달라서(폰 회전 무대
    // ≈2.2:1, 태블릿·데스크톱 실가로 ≈1.3~1.8:1) 카메라 거리를 비율에서 역산한다 — 고정 거리를
    // 쓰면 좁은 비율에서 태양과 궤도 오른쪽이 프레임 밖으로 잘린다.
    const FRAME_L = SUN_X - SUN_R; // 태양 구체 왼쪽 끝
    const FRAME_R = EARTH_X + ORBIT_R + MOON_R; // 달 궤도 오른쪽 끝
    const FRAME_HW = (FRAME_R - FRAME_L) / 2 + 1.2;
    const FRAME_HH = ORBIT_R + 1.6; // 궤도 z 반경(화면 세로로 투영) + 여유
    const TAN_V = Math.tan((34 / 2) * Math.PI / 180); // fov 34의 세로 반각
    const camDir = new THREE.Vector3(0, 12, 31).normalize(); // 살짝 위에서 내려다보는 방향(고정)
    const spaceCamTarget = new THREE.Vector3((FRAME_L + FRAME_R) / 2, 0, 0);
    const spaceCamPos = new THREE.Vector3();
    const frameCamera = (w: number, h: number): void => {
      const aspect = Math.max(1, w / Math.max(1, h));
      const dist = Math.max(FRAME_HW / (TAN_V * aspect), FRAME_HH / TAN_V);
      spaceCamPos.copy(camDir).multiplyScalar(dist).add(spaceCamTarget);
    };
    frameCamera(rot.size().w, rot.size().h);
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
    // 터치는 이중 문법(2026-07-26 사용자 피드백 — 달이 손가락에 가려지는 문제 해결):
    //   · 끌기 = 상대 조종 — 달을 직접 잡지 않고 빈 우주를 끌어도 각도 변화량만큼 따라온다.
    //   · 짧은 탭 = 그 각도로 글라이드(frame에서 보간) — 손을 뗀 뒤 움직이니 달이 항상 보인다.
    // 마우스·합성 이벤트(e2e 그리드 스캔)는 기존 절대 매핑(누른 각도로 즉시 이동)을 유지한다.
    let dragPid = -1;
    let touchRel = false;
    let lastT: number | null = null;
    let downX = 0;
    let downY = 0;
    let moved = false;
    let glideTo: number | null = null;
    let hintShown = false;
    canvas.addEventListener("pointerdown", (e) => {
      if (groundView) return;
      dragPid = e.pointerId; // 새 포인터가 항상 조종권을 가져간다(멀티터치·합성 id 불일치 안전)
      dragging = true;
      moved = false;
      downX = e.clientX;
      downY = e.clientY;
      glideTo = null;
      touchRel = e.pointerType === "touch";
      const t = pointerPhi(e);
      if (touchRel) {
        lastT = t;
        if (!hintShown) {
          hintShown = true;
          showToast("빈 우주를 끌거나 탭해도 달이 움직여요. 손가락으로 달을 가리지 않아도 돼요!");
        }
      } else if (t != null) phi = t;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging || groundView || e.pointerId !== dragPid) return;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 9) moved = true;
      const t = pointerPhi(e);
      if (t == null) return;
      if (touchRel) {
        if (lastT != null) phi += clamp(wrapRad(t - lastT), -0.5, 0.5); // 지구 중심 부근 각 점프 억제
        lastT = t;
      } else phi = t;
    });
    const endDrag = (e: PointerEvent): void => {
      if (e.pointerId !== dragPid) return;
      dragging = false;
      dragPid = -1;
      if (e.type === "pointerup" && touchRel && !moved) {
        const t = pointerPhi(e);
        if (t != null) glideTo = t; // 탭 = 그 자리로 글라이드
      }
      touchRel = false;
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

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
        showToast("궤도를 다시 평평하게, 이제 일렬 정렬을 만들 수 있어요");
      }
    });

    // 토스트 2계층(2026-07-26 사용자 피드백 — 시간제만으론 읽기 전에 사라진다):
    //   · showToast = 1회성 안내(첫 터치 힌트·기울기 토글). 3초 뒤 프레임 루프가 거둔다.
    //   · 상태 토스트 = 프레임 루프가 직접 관리 — 달이 그 자리(정렬·부분·빗나감)에 머무는
    //     동안 계속 떠 있고, 벗어나면 내려간다. 1회성이 점유 중이면 끝난 뒤 이어받는다.
    let eventToastMs = 0;
    let stateToastKey = "";
    const showToast = (msg: string): void => {
      toast.textContent = msg;
      toast.classList.add("show");
      stateToastKey = "";
      eventToastMs = 3000;
    };

    // ---- 프레임 ----
    loop = createLoop((dt) => {
      if (!rot || !st || !THREE) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);
      frameCamera(w, h); // 기기 회전·리사이즈에도 태양~궤도 전체가 프레임 안에 남는다

      // 탭 글라이드 — 손을 뗀 뒤 목표 각도로 스르륵(달이 손가락에 가려지지 않게)
      if (glideTo != null && !dragging) {
        if (groundView) {
          glideTo = null; // 지상 뷰의 스냅 보정과 겹치지 않게
        } else {
          const gd = wrapRad(glideTo - phi);
          if (Math.abs(gd) < 0.012) {
            phi = glideTo;
            glideTo = null;
          } else phi += gd * Math.min(1, 0.16 * dt);
        }
      }
      const gliding = glideTo != null;

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

      // 달 그림자 원뿔 — 태양 반대 방향으로(달 높이를 따라간다). 꼭짓점 = mx + 길이/2
      moonCone.position.set(mx + 5, my, mz);
      moonCone.rotation.z = -Math.PI / 2;

      const deg = ((phi * 180) / Math.PI + 360) % 360;
      const dSolar = Math.abs(wrapDeg(deg - 180)); // 태양 쪽
      const dLunar = Math.abs(wrapDeg(deg)); // 반대쪽
      const onPlane = Math.abs(my) < 0.45; // 그림자가 실제로 닿으려면 궤도면 근처여야 한다
      const solarAligned = dSolar < 7 && onPlane;
      const lunarAligned = dLunar < 7 && onPlane;

      // 기울기 모드에서 삭·망 자리에 왔지만 빗나가는 순간 — 희소성의 핵심 장면(설명은 상태 토스트가 담당)
      const nearMiss = tiltT > 0.6 && !onPlane && (dSolar < 9 || dLunar < 9);
      if (nearMiss && !wasMiss) haptic(HAPTIC.tap);
      wasMiss = nearMiss;

      // 부분일식·부분월식(7~14° 어중간한 정렬 — 궤도면 위일 때만. 글라이드로 스치는 중엔 침묵)
      const partialSolar = !solarAligned && dSolar < 14 && onPlane && !groundView && !gliding;
      const partialLunar = !lunarAligned && dLunar < 14 && onPlane && !groundView && !gliding;
      if (partialSolar && partialSide !== "solar") {
        partialSide = "solar"; // 진입 햅틱 1회(설명은 상태 토스트가 담당)
        haptic(HAPTIC.tap);
      } else if (partialLunar && partialSide !== "lunar") {
        partialSide = "lunar";
        haptic(HAPTIC.tap);
      } else if (!partialSolar && !partialLunar && dSolar > 16 && dLunar > 16) {
        partialSide = "";
      }

      // 상태 필 — 매 프레임 현재 상태를 그대로 말한다. 수집 순간에만 쓰면 이미 목표를 모은 뒤
      // 재정렬할 때 접근 중 문구("부분일식")에 갇힌다(2026-07-26 사용자 실기기 리포트).
      if (!groundView) {
        pillText.textContent = nearMiss
          ? "그림자가 비껴가요. 궤도가 기울어 있으니까!"
          : solarAligned
            ? "일식, 태양·달·지구가 일렬!"
            : lunarAligned
              ? "월식, 태양·지구·달이 일렬!"
              : partialSolar
                ? "부분일식, 태양 쪽으로 조금만 더!"
                : partialLunar
                  ? "부분월식, 더 깊이 넣어 보세요!"
                  : dSolar < 40
                    ? "태양 쪽으로 조금만 더…"
                    : dLunar < 40
                      ? "태양 반대쪽으로 조금만 더…"
                      : "달을 좌우로 끌어 보세요";
      }

      // 상태 토스트 — 달이 그 자리에 머무는 동안 설명이 계속 떠 있는다
      const stateToast: [string, string] | null =
        groundView && solarAligned
          ? ["ground", "개기일식, 달이 태양을 완전히 가리면, 평소 안 보이던 태양의 대기가 드러나요"]
          : nearMiss
            ? dSolar < 9
              ? ["miss-s", "빗나갔어요! 삭이어도 달 그림자가 지구 위·아래로 비껴가요. 그래서 일식은 가끔만 일어나요"]
              : ["miss-l", "빗나갔어요! 망이어도 달이 지구 그림자를 위·아래로 비껴가요. 그래서 월식도 드물죠"]
            : solarAligned
              ? ["solar", "일식! 달 그림자가 닿은 지역에서 태양이 가려져요. 이때 달의 위상은 삭"]
              : lunarAligned
                ? ["lunar", "월식! 달이 지구 그림자에 들어가 붉게 보여요. 이때 달의 위상은 망"]
                : partialSolar
                  ? ["p-solar", "태양이 일부만 가려졌어요. 부분일식! 더 정확히 일렬로 맞추면 개기일식이 돼요"]
                  : partialLunar
                    ? ["p-lunar", "달이 지구 그림자에 일부만 걸쳤어요. 부분월식! 더 깊이 넣으면 개기월식이 돼요"]
                    : null;
      eventToastMs = Math.max(0, eventToastMs - dt * 16.7);
      if (eventToastMs === 0) {
        if (stateToast) {
          if (stateToastKey !== stateToast[0]) {
            stateToastKey = stateToast[0];
            toast.textContent = stateToast[1];
          }
          toast.classList.add("show");
        } else {
          stateToastKey = "";
          toast.classList.remove("show");
        }
      }

      // 일식: 지구 표면 그림자 자국 + 지상 보기 버튼
      const spotMat = spot.material as T.MeshBasicMaterial;
      if (solarAligned) {
        alignedSolarMs += dt * 16.7;
        spot.position.set(EARTH_X - 2.12, 0, mz * 0.1);
        spot.rotation.y = -Math.PI / 2;
        spotMat.opacity = Math.min(0.75, spotMat.opacity + 0.06 * dt);
        if (alignedSolarMs > 320 && !goals.has("solar")) collect("solar", "삭 자리!");
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
        if (alignedLunarMs > 320 && !goals.has("lunar")) collect("lunar", "붉은 달!");
      } else {
        alignedLunarMs = 0;
        // 지상 뷰에서는 검은 실루엣 연출이 색을 소유한다 — 여기서 흰색으로 되돌리면 서로 싸운다
        if (!groundView) moonMat.color.lerp(new THREE.Color(0xffffff), Math.min(1, 0.06 * dt));
      }

      // 카메라 + 개기일식 지상 뷰
      if (groundView && solarAligned) {
        groundMs += dt * 16.7;
        // 스냅 보정: 지상에서 보는 동안 달이 태양 정중앙으로 스르륵 정렬.
        phi += wrapDeg(180 - deg) * 0.0022 * Math.PI * dt;
        // 개기일식의 실제 모습(2026-07-26 사용자 피드백): 달이 태양과 같은 겉보기 크기로 정확히
        // 겹치고(ECLIPSE_SCALE), 역광이라 새까만 실루엣이 되며, 그 테두리로 코로나가 빛난다.
        moon.scale.lerp(new THREE.Vector3(ECLIPSE_SCALE, ECLIPSE_SCALE, ECLIPSE_SCALE), Math.min(1, 0.08 * dt));
        moonMat.color.lerp(new THREE.Color(0x05070c), Math.min(1, 0.09 * dt));
        orbit.visible = false;
        moonCone.visible = false;
        earthCone.visible = false;
        const gp = new THREE.Vector3(EARTH_X - GROUND_EYE, 0.02, 0);
        st.camera.position.lerp(gp, Math.min(1, 0.1 * dt));
        st.camera.lookAt(SUN_X, 0, 0);
        (st.camera as T.PerspectiveCamera).fov = 32;
        st.camera.updateProjectionMatrix();
        corona.material.opacity = Math.min(0.95, corona.material.opacity + 0.05 * dt);
        sunGlow.material.opacity = 0.1; // 개기 순간엔 하늘이 어두워진다 — 코로나가 주인공
        pillText.textContent = "개기일식, 검은 해 둘레로 코로나!";
        if (groundMs > 900 && !goals.has("ground")) collect("ground", "코로나!");
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
      helper.innerHTML = "아직 목표가 남았어요. 다시 열어서 <b>일식·월식</b>을 마저 만들어 봐요!";
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
    <circle cx="34" cy="48" r="15" fill="url(#ec-sun)"/>
    <path d="M106 48h40" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="3 4"/>
    <circle cx="130" cy="48" r="9" fill="url(#ec-moon)"/>
    <path d="M140 43l45 13v-16z" fill="#0A1020" opacity=".55"/>
    <circle cx="200" cy="48" r="16" fill="url(#ec-earth)"/>
    <ellipse cx="186.5" cy="48" rx="3.4" ry="5.2" fill="#060A14" opacity=".7"/>
    <path d="M258 40l8 8-8 8" stroke="#8FB3E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
