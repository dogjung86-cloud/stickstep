// u7EclipseLab: 일식과 월식(u7l6). 교과서 "태양과 달이 가려지는 원리 알아보기"(252쪽: 손전등, 큰 공, 작은 공을 한 줄로 놓고
// 작은 공을 돌리며 두 공에 생기는 그림자를 본다)를 가로 화면의 3D에서 한다. 그림 Ⅶ-10과 같은 배치다.
// 3D 무대는 정본 steps/eclipse3d.ts에서 옮겨 왔다(qa/u7v5-port-landscape.py). 2026-11-15 그래픽 감사 손질부터는 이 파일을 손으로 고친다
// (부분일식, 부분월식의 그림자, 지상 보기 알림 자리, 판정 무대, 실사 들어가기 그림). 옮겨 적는 도구를 다시 돌리면 이 손질이 지워진다.
// 바꾼 것: 세로 화면의 틀(한 화면, 할 일 세 가지는 한 일로 부르고 해낸 뒤에 이름을 붙인다, 판정, 결론은 조작 칸에)
//          · 가로 화면에서 다 해내면 그 자리에서 알리고 돌아가는 버튼을 준다.
import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import type { RotateStage } from "../../../ui/rotateStage";
import { u7Frame, u7Goals, u7Dev } from "./kit";
import { ecDefs, discImage, moonBrightDef, shadowPolys, pts, type DiscKind } from "./eclipseKit";

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
// 지상 뷰 달 스케일: 실제 개기일식의 우연(달·태양의 겉보기 크기가 거의 같다)을 재현한다.
// 지상 카메라에서 달까지 4.74 vs 태양까지 26.24 → 겉보기 반각을 태양과 같게 만드는 스케일,
// ×1.06은 가장자리로 태양이 새지 않게 하는 여유(2026-07-26 사용자 피드백: 검은 해 + 코로나 링).
const ECLIPSE_SCALE = ((ORBIT_R - GROUND_EYE) * (SUN_R / (EARTH_X - GROUND_EYE - SUN_X)) * 1.06) / MOON_R;

function wrapDeg(d: number): number {
  return ((d + 180) % 360 + 360) % 360 - 180;
}

function wrapRad(r: number): number {
  return ((r + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
}

interface AxisShadow {
  /** x: 축의 y, y: 축의 z, z: 그림자 반지름, w: 진하기(0~1) */
  ax: T.Vector4;
  /** x: 경계 x, y: 1이면 그보다 큰 x 쪽만, -1이면 작은 x 쪽만 */
  side: T.Vector2;
}

/** 햇빛(+x 방향)과 나란한 그림자 기둥을 행성 재질에 얹는다(2026-11-15 그래픽 감사: 부분일식, 부분월식이 알림 글로만 있었다).
 *  축(y, z)에서 반지름 안쪽의 면을 tint로 어둡게 하고, 경계는 soft만큼 부드럽다. 재질의 실사 질감이 바뀌어도(needsUpdate) 그대로 붙는다. */
function axisShadow(THREE: typeof T, mat: T.MeshLambertMaterial, tint: [number, number, number], soft: number): AxisShadow {
  const ax = new THREE.Vector4(0, 0, 0, 0);
  const side = new THREE.Vector2(0, 1);
  const f = (v: number): string => v.toFixed(3);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uAx = { value: ax };
    sh.uniforms.uAxSide = { value: side };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAxW;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvAxW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vAxW;\nuniform vec4 uAx;\nuniform vec2 uAxSide;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float axIn = (1.0 - smoothstep(uAx.z - ${f(soft)}, uAx.z + ${f(soft)}, length(vAxW.yz - uAx.xy))) * uAx.w * step(0.0, (vAxW.x - uAxSide.x) * uAxSide.y);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(${f(tint[0])}, ${f(tint[1])}, ${f(tint[2])}), axIn);`,
      );
  };
  mat.needsUpdate = true;
  return { ax, side };
}

/** 부분월식의 '한 입 베어 문' 그림자(2026-11-15 그래픽 감사). 무대 카메라가 궤도면 가까이에서 보므로 그림자 기둥을
 *  실제 입체대로 그리면 경계가 옆으로 누워 달 가운데가 통째로 어두워 보인다. 그래서 카메라에서 본 평면(view 좌표)에 큰 원을 두고
 *  그 안쪽 면을 어둡게 한다: 원은 달에서 그림자 축 쪽으로 놓여 달이 그림자 쪽으로 다가갈수록 깊이 들어온다(경계는 둥글다). */
function viewBite(THREE: typeof T, mat: T.MeshLambertMaterial, tint: [number, number, number], soft: number): T.Vector4 {
  const bite = new THREE.Vector4(0, 0, 0, 0); // x, y: 원의 중심(view 좌표), z: 반지름, w: 진하기
  const f = (v: number): string => v.toFixed(3);
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => {
    prev.call(mat, sh, r);
    sh.uniforms.uBite = { value: bite };
    if (!sh.vertexShader.includes("vAxW")) {
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vAxW;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvAxW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vAxW;");
    }
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec4 uBite;")
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float biteIn = (1.0 - smoothstep(uBite.z - ${f(soft)}, uBite.z + ${f(soft)}, length((viewMatrix * vec4(vAxW, 1.0)).xy - uBite.xy))) * uBite.w;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(${f(tint[0])}, ${f(tint[1])}, ${f(tint[2])}), biteIn);`,
      );
  };
  mat.needsUpdate = true;
  return bite;
}

export const u7EclipseLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as EclipseStep;

  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-enter", api });
  const doneCta = s.cta ?? "개념 정리하기";
  const enterBtn = el("button", { class: "u7x-enterbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 실험실 열기" })) as HTMLButtonElement;
  const art = el("div", { class: "u7x-enter-art", html: enterArtSvg() });
  f.stage.append(art, enterBtn);
  /** 판정과 결론 동안의 무대(기록 두 칸). */
  const setArt = (state: JudgeState): void => {
    art.classList.add("judge");
    art.innerHTML = judgeArtSvg(state);
    host.dataset.u7Art = state;
  };
  const goalsUi = u7Goals(1, [
    { id: "solar", name: "지구에 달의 그림자 만들기", sub: "달을 어디에 놓으면 될까요?" },
    { id: "ground", name: "그림자 속 지상에서 올려다보기", sub: "태양이 어떻게 보일까요?" },
    { id: "lunar", name: "달을 지구의 그림자 속으로 넣기", sub: "달을 어디에 놓으면 될까요?" },
  ]);
  const FOUND: Record<string, string> = { solar: "태양, 달, 지구 (일식)", ground: "코로나가 보이는 개기일식", lunar: "태양, 지구, 달 (월식)" };
  f.slot.setControls(el("div", { class: "u7x-cap", text: "가로 화면에서 세 가지 미션을 차례로 해 보세요" }), goalsUi.el);
  f.say("가로 화면을 열어 <b>달</b>을 끌어 움직이며 태양, 지구와 <b>한 줄</b>로 세워 보세요.");
  f.pips(1);
  host.dataset.u7Phase = "play";

  const goals = new Set<string>();
  let finished = false;
  let asked = false;
  let doneBar: HTMLElement | null = null;
  let pillEl: HTMLElement | null = null;

  function showDone(): void {
    if (!finished || !rot || doneBar) return;
    // 가로 화면 안에서 끝을 알린다(세로 화면으로 돌아가야 정리가 이어진다)
    const back = el("button", { class: "u7x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
    back.addEventListener("click", () => rot?.leave());
    doneBar = el("div", { class: "u7x-rotdone" }, el("span", { text: "세 가지 미션을 모두 완료했어요!" }), back);
    rot.stage.appendChild(doneBar);
    pillEl?.classList.add("hide"); // 둘째 줄의 상태 알약이 끝 알림과 겹친다(상태 설명은 아래 알림이 이어서 한다)
  }

  function collect(id: string, _subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    goalsUi.done(id, FOUND[id]);
    host.dataset.u7Found = String(goals.size);
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      showDone();
    }
  }

  function askOrder(): void {
    asked = true;
    host.dataset.u7Phase = "ask";
    f.pips(2);
    // 교과서의 기록 두 칸: 지구에 그림자가 생길 때와 달에 그림자가 생길 때 세 천체의 자리
    f.say("방금 만든 두 현상에서 세 천체가 어떤 순서로 늘어섰는지 확인해 봐요.");
    setArt("q1");
    f.slot.ask(
      "<b>지구에 달의 그림자</b>가 생겨 태양이 가려졌을 때, 한가운데에 놓인 천체는 무엇이었나요?",
      [{ t: "달", ok: true }, { t: "지구" }, { t: "태양" }],
      (ok) => {
        setArt("a1");
        api.recordQuiz(ok);
      },
      { why: "태양, 달, 지구 순서로 한 줄이 되어 달이 태양 빛을 가렸어요.", onNext: askLunar },
    );
  }

  function askLunar(): void {
    host.dataset.u7Phase = "ask2";
    setArt("q2");
    f.slot.ask(
      "이번에는 반대로 <b>달이 지구의 그림자 속</b>에 들어갔을 때, 한가운데에 놓인 천체는 무엇이었나요?",
      [{ t: "지구", ok: true }, { t: "달" }, { t: "태양" }],
      () => setArt("a2"),
      { why: "태양, 지구, 달 순서로 한 줄이 되어 지구의 그림자가 달을 가렸어요.", onNext: conclude },
    );
  }

  function conclude(): void {
    host.dataset.u7Phase = "done";
    setArt("a2");
    f.pips(3);
    f.say("가로 화면을 다시 열어 <b>왜 매달 일어나지 않을까요?</b> 버튼도 눌러 확인해 보세요!");
    f.slot.conclude("<b>태양, 달, 지구</b> 순서로 한 줄이 되면 달이 태양을 가리는 <b>일식</b>이 일어나고, <b>태양, 지구, 달</b> 순서로 한 줄이 되면 달이 지구의 그림자 속에 들어가는 <b>월식</b>이 일어나요.");
    api.enableCTA(doneCta);
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
  // "왜 매달 일어나지 않을까" 모드: 달 궤도를 기울여(실제 약 5°, 여기선 과장) 빗나감을 보여 준다
  let tiltOn = false;
  let tiltT = 0; // 0..1 애니메이션
  const TILT = 0.3; // rad(~17°): 과장 표현, 문구에 실제 5° 명시. 커진 달(0.9)이 지구 그림자를 확실히 비껴가는 값
  let wasMiss = false; // 빗나감 진입 햅틱(1회) 에지 검출
  // 부분일식·부분월식 선경험: 개기 정렬(<7°) 직전의 7~14° 구간에 한 번씩 토스트.
  // 목표(collect) 조건은 개기 정렬 기준 그대로: 부분 구간은 안내만 한다.
  let partialSide: "" | "solar" | "lunar" = "";

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "달을 끌어 태양·지구와 한 줄로 세워 보세요",
      onLeave: () => {
        leave();
      },
    });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    // 상태 알약은 둘째 줄(u7x-rpill)에 둔다: 글이 길어져 첫 줄의 가운데 제목과 겹치지 않게(폰 가로 폭 660~850px)
    const phasePill = el("div", { class: "pill sp3-pill u7x-rpill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), el("span", { text: "달을 끌어 공전 궤도를 따라 움직여 보세요" }));
    pillEl = phasePill;
    const groundBtn = el("button", { class: "sp3-groundbtn hide", attrs: { type: "button" } }, el("span", { text: "지구(그림자 속)에서 올려다보기" }));
    const tiltBtn = el("button", { class: "sp3-tiltbtn", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "왜 매달 일어나지 않을까요?" }));
    const toast = el("div", { class: "sp3-toast u7x-toast" });
    rot.stage.append(canvas, phasePill, groundBtn, tiltBtn, toast);
    const pillText = phasePill.querySelectorAll("span")[1] as HTMLElement;

    const S = await import("../../../ui/space3d");
    if (disposed || !rot) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 34 });
    if (!st) {
      pillText.textContent = "이 기기에서는 3D 화면을 열 수 없어요";
      finished = true;
      asked = true;
      api.recordQuiz(true);
      rot?.leave();
      conclude();
      f.say("이 기기에서는 3D 화면을 열 수 없어 핵심 내용으로 바로 정리할게요.");
      return;
    }
    const { scene, camera } = st;
    showDone();
    scene.add(S.makeStars(800, 220));

    // 태양(왼쪽): 교과서 그림 VII-10과 같은 배치.
    // 크기 위계(사용자 확정 2026-07-26): 태양은 "제일 크다"만 읽히면 충분: 조작 대상인 지구·달이
    // 화면의 주인공이 되도록 태양 구체·글로우를 줄이고 카메라를 당긴다(아래 spaceCamPos).
    const sunBall = S.makePlanet("sun", SUN_R, 48);
    sunBall.position.set(SUN_X, 0, 0);
    scene.add(sunBall);
    const sunGlow = S.makeGlow(13, "rgba(255,180,70,.9)", 0.16);
    sunGlow.position.set(SUN_X, 0, 0);
    scene.add(sunGlow);
    // 코로나: 검은 해 테두리를 감싸는 흰 빛(지상 뷰 전용). 지름 14 = 태양 지름의 2.3배,
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
    // 부분월식: 달의 일부에 지구 그림자(둥근 경계, 붉은 기 도는 어둠). 부분일식: 지구의 낮 쪽에 달의 옅은 그림자.
    const moonBite = viewBite(THREE, moonMat, [0.3, 0.15, 0.13], 0.05);
    const BITE_R = 2.1; // 그림자 원의 반지름(달 반지름 0.9의 2.3배쯤, 책 그림처럼 경계가 완만하게 둥글다)
    const earthShade = axisShadow(THREE, earth.material as T.MeshLambertMaterial, [0.32, 0.34, 0.44], 0.25);
    earthShade.side.set(EARTH_X, -1);
    earthShade.ax.z = 1.0;

    // 그림자 원뿔(교과서 그림처럼 시각화: 용어는 쓰지 않는다)
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
    // ≈2.2:1, 태블릿·데스크톱 실가로 ≈1.3~1.8:1) 카메라 거리를 비율에서 역산한다: 고정 거리를
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
    // 터치는 이중 문법(2026-07-26 사용자 피드백: 달이 손가락에 가려지는 문제 해결):
    //   · 끌기 = 상대 조종: 달을 직접 잡지 않고 빈 우주를 끌어도 각도 변화량만큼 따라온다.
    //   · 짧은 탭 = 그 각도로 글라이드(frame에서 보간): 손을 뗀 뒤 움직이니 달이 항상 보인다.
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
          showToast("빈 우주 공간을 끌거나 눌러도 달이 따라 움직여요!");
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
      groundBtn.querySelector("span")!.textContent = groundView ? "우주에서 내려다보기" : "지구(그림자 속)에서 올려다보기";
      haptic(HAPTIC.select);
    });

    tiltBtn.addEventListener("click", () => {
      tiltOn = !tiltOn;
      tiltBtn.querySelector("span")!.textContent = tiltOn ? "평평한 궤도로 되돌리기" : "왜 매달 일어나지 않을까요?";
      tiltBtn.setAttribute("aria-pressed", String(tiltOn));
      tiltBtn.classList.toggle("on", tiltOn);
      haptic(HAPTIC.select);
      if (tiltOn) {
        showToast("실제로는 달의 공전 궤도가 약 5° 기울어져 있어요(화면은 보기 쉽게 과장했어요). 달을 태양 쪽이나 반대쪽으로 끌어 보세요!");
      } else {
        showToast("궤도를 다시 평평하게 맞췄어요. 이제 세 천체를 한 줄로 세울 수 있어요.");
      }
    });

    // 토스트 2계층(2026-07-26 사용자 피드백: 시간제만으론 읽기 전에 사라진다):
    //   · showToast = 1회성 안내(첫 터치 힌트·기울기 토글). 3초 뒤 프레임 루프가 거둔다.
    //   · 상태 토스트 = 프레임 루프가 직접 관리: 달이 그 자리(정렬·부분·빗나감)에 머무는
    //     동안 계속 떠 있고, 벗어나면 내려간다. 1회성이 점유 중이면 끝난 뒤 이어받는다.
    let eventToastMs = 0;
    let stateToastKey = "";
    // 알림 글은 이 파일의 고정 글뿐이라 굵은 글씨(<b>)를 살려 innerHTML로 넣는다
    const showToast = (msg: string): void => {
      toast.innerHTML = msg;
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

      // 탭 글라이드: 손을 뗀 뒤 목표 각도로 스르륵(달이 손가락에 가려지지 않게)
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

      // 궤도 기울기(기울기 모드): z축 회전이라 교점(빗나가지 않는 자리)은 옆구리 쪽
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

      // 달 그림자 원뿔: 태양 반대 방향으로(달 높이를 따라간다). 꼭짓점 = mx + 길이/2
      moonCone.position.set(mx + 5, my, mz);
      moonCone.rotation.z = -Math.PI / 2;

      const deg = ((phi * 180) / Math.PI + 360) % 360;
      const dSolar = Math.abs(wrapDeg(deg - 180)); // 태양 쪽
      const dLunar = Math.abs(wrapDeg(deg)); // 반대쪽
      const onPlane = Math.abs(my) < 0.45; // 그림자가 실제로 닿으려면 궤도면 근처여야 한다
      const solarAligned = dSolar < 7 && onPlane;
      const lunarAligned = dLunar < 7 && onPlane;

      // 기울기 모드에서 삭·망 자리에 왔지만 빗나가는 순간: 희소성의 핵심 장면(설명은 상태 토스트가 담당)
      const nearMiss = tiltT > 0.6 && !onPlane && (dSolar < 9 || dLunar < 9);
      if (nearMiss && !wasMiss) haptic(HAPTIC.tap);
      wasMiss = nearMiss;

      // 부분일식·부분월식(7~14° 어중간한 정렬: 궤도면 위일 때만. 글라이드로 스치는 중엔 침묵)
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

      // 부분월식의 그림자: 14°에서 달의 가장자리에 닿기 시작해 7°(개기월식 문턱)에서 달을 다 덮는다(판정 문턱과 같은 값).
      // 그림자는 달에서 그림자 축(지구 중심을 지나는 햇빛의 선) 쪽에서 들어온다. 개기월식에 들면 걷히고 달 전체가 붉어진다(아래 붉은 달).
      {
        const vm = st.camera.matrixWorldInverse;
        const mv = new THREE.Vector3(mx, my, mz).applyMatrix4(vm);
        const av = new THREE.Vector3(mx, 0, 0).applyMatrix4(vm);
        let ux = av.x - mv.x;
        let uy = av.y - mv.y;
        const ul = Math.hypot(ux, uy) || 1;
        ux /= ul;
        uy /= ul;
        const fL = clamp((14 - dLunar) / 7, 0, 1);
        const reach = lunarAligned ? 0 : BITE_R + MOON_R - 2 * MOON_R * fL; // 달 중심에서 그림자 원의 중심까지
        moonBite.set(mv.x + ux * reach, mv.y + uy * reach, BITE_R, moonBite.w + ((partialLunar ? 1 : 0) - moonBite.w) * Math.min(1, 0.14 * dt));
        // 부분일식(과 개기일식 둘레)의 옅은 그림자: 달을 지나는 햇빛의 선이 지구에 닿는 곳
        earthShade.ax.x = my;
        earthShade.ax.y = mz;
        earthShade.ax.w += (((partialSolar || solarAligned) && !groundView ? 0.9 : 0) - earthShade.ax.w) * Math.min(1, 0.12 * dt);
      }

      // 상태 필: 매 프레임 현재 상태를 그대로 말한다. 수집 순간에만 쓰면 이미 목표를 모은 뒤
      // 재정렬할 때 접근 중 문구("부분일식")에 갇힌다(2026-07-26 사용자 실기기 리포트).
      if (!groundView) {
        pillText.textContent = nearMiss
          ? "궤도가 기울어 있어 그림자가 위아래로 비껴가요!"
          : solarAligned
            ? "일식! 태양, 달, 지구가 한 줄로 섰어요"
            : lunarAligned
              ? "월식! 태양, 지구, 달이 한 줄로 섰어요"
              : partialSolar
                ? "부분일식! 정중앙으로 조금만 더 맞춰 보세요"
                : partialLunar
                  ? "부분월식! 그림자 한가운데로 더 넣어 보세요"
                  : dSolar < 40
                    ? "태양과 지구 사이로 조금만 더 옮겨 보세요"
                    : dLunar < 40
                      ? "지구 뒤쪽 그림자로 조금만 더 옮겨 보세요"
                      : "달을 끌어 공전 궤도를 따라 움직여 보세요";
      }

      // 상태 토스트: 달이 그 자리에 머무는 동안 설명이 계속 떠 있는다
      // (일식 알림이 부르는 버튼 이름은 groundBtn의 글과 같아야 한다)
      const stateToast: [string, string] | null =
        groundView && solarAligned
          ? ["ground", "<b>개기일식!</b> 달이 밝은 태양(광구)을 완전히 가리면, 평소에는 안 보이던 태양의 대기(코로나)가 드러나요."]
          : nearMiss
            ? dSolar < 9
              ? ["miss-s", "달의 궤도가 기울어 있어서, 태양 쪽에 와도 달 그림자가 지구 위아래로 비껴가요. 그래서 일식이 매달 일어나지는 않아요!"]
              : ["miss-l", "달의 궤도가 기울어 있어서, 지구 반대쪽에 와도 달이 지구 그림자를 위아래로 비껴가요. 그래서 월식도 가끔만 일어나요!"]
            : solarAligned
              ? ["solar", "<b>일식!</b> 달의 그림자가 닿는 지구 지역에서 태양이 가려져요. 아래 <b>지구(그림자 속)에서 올려다보기</b> 버튼도 눌러 보세요!"]
              : lunarAligned
                ? ["lunar", "<b>월식!</b> 달이 지구의 그림자 속으로 들어가 어두워지며 붉게 보여요."]
                : partialSolar
                  ? ["p-solar", "태양의 일부만 가려지는 <b>부분일식</b>이에요! 태양 정중앙으로 조금 더 옮기면 개기일식이 돼요."]
                  : partialLunar
                    ? ["p-lunar", "달이 지구 그림자에 일부만 걸친 <b>부분월식</b>이에요! 그림자 한가운데로 더 옮기면 개기월식이 돼요."]
                    : null;
      eventToastMs = Math.max(0, eventToastMs - dt * 16.7);
      // 지상 보기에서는 알림을 아래 단추 줄 사이로 내린다(검은 해와 코로나를 덮지 않게)
      toast.classList.toggle("low", groundView);
      if (eventToastMs === 0) {
        if (stateToast) {
          if (stateToastKey !== stateToast[0]) {
            stateToastKey = stateToast[0];
            toast.innerHTML = stateToast[1];
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
        // 지상 뷰에서는 검은 실루엣 연출이 색을 소유한다: 여기서 흰색으로 되돌리면 서로 싸운다
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
        sunGlow.material.opacity = 0.1; // 개기 순간엔 하늘이 어두워진다: 코로나가 주인공
        pillText.textContent = "개기일식! 달 너머로 밝은 코로나가 보여요";
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
          groundBtn.querySelector("span")!.textContent = "지구(그림자 속)에서 올려다보기";
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
    doneBar = null;
    pillEl = null;
    groundView = false;
    enterBtn.classList.remove("pulse");
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "가로 화면 다시 보기";
      if (!asked) askOrder();
    } else {
      enterBtn.querySelector("span")!.textContent = "가로 화면 다시 열기";
      f.say("아직 완료하지 않은 미션이 남았어요. 가로 화면을 다시 열어 <b>세 가지 미션</b>을 모두 해 보세요.");
    }
  }

  enterBtn.addEventListener("click", () => void enter());
  // 검사용(개발 서버에서만): 달을 주어진 각도에 놓는다(180 = 태양 쪽, 0 = 태양 반대쪽)
  u7Dev(host, { phi: (deg: number) => (phi = (deg * Math.PI) / 180) });

  api.setCTA("가로 화면에서 세 가지 미션을 완료해 보세요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

/** 둥근 실사 원판(원으로 잘라 붙인다). night면 태양 반대쪽(오른쪽) 반을 밤으로 덮는다. */
function disc(id: string, kind: DiscKind, cx: number, cy: number, r: number, o: { night?: number; filter?: string } = {}): string {
  const nightHalf = o.night ? `<path d="M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}Z" fill="#06101f" opacity="${o.night}"/>` : "";
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
    <g clip-path="url(#${id})">${discImage(kind, cx, cy, r, o.filter ? ` filter="url(#${o.filter})"` : "")}${nightHalf}</g>`;
}

/** 들어가기 그림: 태양(왼쪽), 아직 한 줄에서 비켜 선 달, 지구. 천체는 실사 원판이고 햇빛을 받는 왼쪽만 밝다. */
function enterArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="ec-glow" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#FFB03A" stop-opacity=".45"/><stop offset="1" stop-color="#FFB03A" stop-opacity="0"/></radialGradient>
      ${moonBrightDef("ec-mbr")}
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <circle cx="30" cy="30" r="1.2" fill="#DCE8FF"/><circle cx="250" cy="20" r="1.2" fill="#DCE8FF"/>
    <circle cx="212" cy="76" r="1" fill="#DCE8FF"/><circle cx="120" cy="14" r="1" fill="#DCE8FF"/>
    <circle cx="34" cy="48" r="27" fill="url(#ec-glow)"/>
    ${disc("ec-sc", "sun", 34, 48, 15)}
    ${disc("ec-mc", "moon", 160, 20, 8, { night: 0.78, filter: "ec-mbr" })}
    ${disc("ec-ec", "earth", 200, 48, 16, { night: 0.6 })}
    <path d="M258 40l8 8-8 8" stroke="#8FB3E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/** 판정과 결론의 무대: 책 252쪽 해 보기의 기록 두 칸(위: 지구에 달의 그림자, 아래: 달에 지구의 그림자).
 *  질문하는 동안에는 그 칸에 결과만(지구에 생긴 그림자 자국, 붉은 달) 보이고, 답한 뒤에는 그때의 배치(태양, 달, 지구 / 태양, 지구, 달)를 그린다.
 *  예전에는 판정 내내 들어가기 그림(달이 가운데 위)이 그대로라 둘째 질문(답: 지구)에서 그림이 틀린 답을 가리켰다(2026-11-15 그래픽 감사).
 *  그림자는 eclipseKit의 접선 계산(shadowPolys) 그대로다. 크기와 거리는 실제 비율과 다르다. */
type JudgeState = "q1" | "a1" | "q2" | "a2";
const JW = 318;
const JH = 140;
function judgeArtSvg(state: JudgeState): string {
  const p = "ecj-";
  const panel = (y: number, empty: boolean): string =>
    `<rect x="0.75" y="${y + 0.75}" width="${JW - 1.5}" height="64.5" rx="12" fill="rgba(255,255,255,${empty ? ".015" : ".04"})" stroke="rgba(170,195,235,${empty ? ".22" : ".16"})" stroke-width="1.5"${empty ? ' stroke-dasharray="4 5"' : ""}/>`;
  const label = (x: number, y: number, t: string, cls = "", anchor = "middle"): string => `<text class="u7x-st ${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
  const Rs = 24;
  const rm = 8;
  const Re = 17;

  // 위 칸(일식): 태양, 달, 지구. 지구는 달의 짙은 그림자 끝이 지구 표면에 8만큼 들어가는 자리에 둔다.
  const rowSolar = (): string => {
    const cy = 30;
    const S = { x: 12, y: cy };
    const M = { x: 132, y: cy };
    const L = (Math.hypot(M.x - S.x, M.y - S.y) * rm) / (Rs - rm);
    const E = { x: Math.round(M.x + L + Re - 8), y: cy };
    const sh = shadowPolys(S, Rs, M, rm, 150);
    return `<defs><clipPath id="${p}ca"><rect x="0" y="0" width="${JW}" height="66" rx="12"/></clipPath><clipPath id="${p}sa"><rect x="0" y="0" width="${E.x}" height="66"/></clipPath></defs>
      <g clip-path="url(#${p}ca)">
        <circle cx="${S.x}" cy="${S.y}" r="${Rs * 1.8}" fill="url(#${p}glow)"/>
        <circle cx="${S.x}" cy="${S.y}" r="${Rs}" fill="url(#${p}sun)"/>
        <g clip-path="url(#${p}sa)"><polygon points="${pts(sh.faint)}" fill="#AFC3EA" opacity=".16"/><polygon points="${pts(sh.dark)}" fill="#070B16" opacity=".92"/></g>
        ${disc(`${p}ea`, "earth", E.x, E.y, Re, { night: 0.6 })}
        <g clip-path="url(#${p}ea)"><polygon points="${pts(sh.faint)}" fill="#050912" opacity=".3"/><polygon points="${pts(sh.dark)}" fill="#03050B" opacity=".95"/></g>
        ${disc(`${p}ma`, "moon", M.x, M.y, rm, { night: 0.8, filter: `${p}mbr` })}
      </g>
      ${label(4, cy + 30, "태양", "sun", "start")}${label(M.x, cy + 30, "달")}${label(E.x, cy + 30, "지구")}
      ${label(JW - 12, cy + 5, "일식", "dim", "end")}`;
  };
  // 아래 칸(월식): 태양, 지구, 달. 달은 지구의 짙은 그림자 한가운데(붉은 달).
  const rowLunar = (): string => {
    const cy = 104;
    const S = { x: 12, y: cy };
    const E = { x: 124, y: cy };
    const M = { x: 236, y: cy };
    const sh = shadowPolys(S, Rs, E, Re, 260);
    return `<defs><clipPath id="${p}cb"><rect x="0" y="74" width="${JW}" height="66" rx="12"/></clipPath></defs>
      <g clip-path="url(#${p}cb)">
        <circle cx="${S.x}" cy="${S.y}" r="${Rs * 1.8}" fill="url(#${p}glow)"/>
        <circle cx="${S.x}" cy="${S.y}" r="${Rs}" fill="url(#${p}sun)"/>
        <polygon points="${pts(sh.faint)}" fill="#AFC3EA" opacity=".12"/>
        <polygon points="${pts(sh.dark)}" fill="#02040A" opacity=".66"/>
        ${disc(`${p}eb`, "earth", E.x, E.y, Re, { night: 0.6 })}
        ${disc(`${p}mb`, "moon", M.x, M.y, rm, { filter: `${p}redf` })}
      </g>
      ${label(4, cy + 30, "태양", "sun", "start")}${label(E.x, cy + 30, "지구")}${label(M.x, cy + 30, "달")}
      ${label(JW - 12, cy + 5, "월식", "dim", "end")}`;
  };
  // 질문하는 동안의 결과 장면(배치는 그리지 않는다)
  const onlySpot = (): string => {
    const cx = 214;
    const cy = 33;
    const r = 26;
    return `<defs><clipPath id="${p}qs"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
      ${disc(`${p}qe`, "earth", cx, cy, r, { night: 0.6 })}
      <g clip-path="url(#${p}qs)">
        <ellipse cx="${cx - r + 7}" cy="${cy}" rx="10" ry="15" fill="#0A1020" opacity=".42"/>
        <ellipse cx="${cx - r + 4}" cy="${cy}" rx="4.5" ry="6.5" fill="#03050B" opacity=".9"/>
      </g>
      ${label(20, cy + 5, "지구에 생긴 달의 그림자", "dim", "start")}`;
  };
  const onlyRed = (): string => {
    const cx = 214;
    const cy = 107;
    return `${disc(`${p}qm`, "moon", cx, cy, 20, { filter: `${p}redf` })}
      ${label(20, cy + 5, "지구 그림자 속에 들어간 달", "dim", "start")}`;
  };

  const top = state === "q1" ? onlySpot() : rowSolar();
  const bottom = state === "q2" ? onlyRed() : state === "a2" ? rowLunar() : "";
  return `<svg viewBox="0 0 ${JW} ${JH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="기록 두 칸. 위 칸은 지구에 달의 그림자가 생긴 때, 아래 칸은 달이 지구의 그림자에 든 때">
    ${ecDefs(p)}
    <defs><filter id="${p}redf" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.6 0.4 0.1 0 0.04  0.17 0.12 0.03 0 0.006  0.07 0.05 0.015 0 0  0 0 0 1 0"/></filter></defs>
    ${panel(0, false)}${panel(74, state === "q1" || state === "a1")}
    ${top}${bottom}
  </svg>`;
}
