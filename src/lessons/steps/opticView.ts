// opticView v2 — 거울·렌즈 관찰소(중2 III L5 일반 랩, 책 106~111쪽). three.js 세로 랩.
//   사용자 확정 설계: **거울/렌즈가 정면에 크게 보이고**, 촛불이 가까이/멀리 갈 때
//   그 "속에 보이는 모습"이 실시간으로 변한다 — 크기·바로/거꾸로에 **왜곡까지**.
//   · 구현: 촛불만 찍는 RTT(고정 프레이밍 카메라, 레이어 3) → 원판 ShaderMaterial이
//     거울/렌즈 공식(1/v+1/u=1/f)의 배율 m으로 스케일, m<0이면 상하 뒤집기,
//     장치별 방사 왜곡 계수 k로 가장자리 압축(볼록 거울·오목 렌즈) / 중심 확대(돋보기) 표현.
//   · 거울은 좌우 반전(uMirrorX), 렌즈는 그대로 — 물리 관례 준수.
//   UI에 '초점·실상·허상' 용어 금지(이 책은 상의 겉모습만 서술). three는 space3d 동적 import.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
}

type Mode = "cvMirror" | "ccMirror" | "cvLens" | "ccLens";
const MODES: Mode[] = ["cvMirror", "ccMirror", "cvLens", "ccLens"];
const MODE_NAME: Record<Mode, string> = {
  cvMirror: "볼록 거울",
  ccMirror: "오목 거울",
  cvLens: "볼록 렌즈",
  ccLens: "오목 렌즈",
};
const F0 = 118; // 초점 거리(월드 단위) — UI에는 용어 노출 금지
const U_MIN = 50;
const U_MAX = 420;

const isMirror = (m: Mode): boolean => m === "cvMirror" || m === "ccMirror";

/** 얇은 거울/렌즈 공식 — 실물 쪽 양수 규약(lightBench.solve와 동일 수학). */
function solve(mode: Mode, u: number): { v: number; m: number; virtual: boolean; ok: boolean } {
  const f = mode === "ccMirror" || mode === "cvLens" ? F0 : -F0;
  const denom = 1 / f - 1 / u;
  if (Math.abs(denom) < 1e-6) return { v: 0, m: 0, virtual: false, ok: false };
  const v = 1 / denom;
  return { v, m: -v / u, virtual: v < 0, ok: true };
}

/** 장치별 시각 왜곡 계수 — 양수: 가장자리로 갈수록 압축(넓게 담는 느낌), 음수: 중심 확대(돋보기 느낌) */
function distortK(mode: Mode, m: number): number {
  if (mode === "cvMirror") return 0.55;
  if (mode === "ccLens") return 0.48;
  if (mode === "ccMirror") return m > 0 ? -0.22 : 0.14;
  return m > 0 ? -0.26 : 0.12; // cvLens
}

export const opticView: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    ...MODES.map((m) =>
      el("div", { class: "pn-badge", dataset: { g: m } }, el("b", { text: MODE_NAME[m] }), el("span", { text: "가까이·멀리" })),
    ),
  );

  const canvas = el("canvas", { class: "lt-canvas", style: "height:360px" });
  const statusPill = el(
    "div",
    { class: "pill ov-status" },
    el("span", { class: "pdot", style: "background:#E86FCE" }),
    el("span", { text: "관찰 준비 중…" }),
  );
  const seg = el("div", { class: "seg stage-seg", style: "margin-top:0" });
  const segBtns: HTMLButtonElement[] = MODES.map((m) => {
    const b = el("button", { text: MODE_NAME[m], attrs: { type: "button", "aria-pressed": String(m === "cvMirror") } });
    if (m === "cvMirror") b.classList.add("on");
    b.addEventListener("click", () => setMode(m));
    seg.appendChild(b);
    return b;
  });
  const stage = el("div", { class: "stage" }, canvas, el("div", { class: "stage-hud" }, seg), statusPill);

  // 거리 슬라이더(px-sl 문법 축약판)
  let u = 300;
  const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#7A4A18,#F0A422)" });
  const knob = el("i", { class: "px-knob" });
  const track = el("div", { class: "px-track" }, fill, knob);
  const val = el("b", { class: "px-val", text: "" });
  const sliderRow = el(
    "div",
    { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "촛불과 장치 사이 거리" } },
    el("b", { text: "촛불 거리" }),
    track,
    val,
  );
  const sliders = el("div", { class: "px-sliders show" }, sliderRow);
  const syncSlider = (): void => {
    const t = (u - U_MIN) / (U_MAX - U_MIN);
    fill.style.width = `${Math.round(t * 100)}%`;
    knob.style.left = `${Math.round(t * 100)}%`;
    val.textContent = u <= 90 ? "가까이" : u >= 300 ? "멀리" : "중간";
    sliderRow.setAttribute("aria-valuenow", String(Math.round(u)));
  };
  const setFromClientX = (cx: number): void => {
    const tr = track.getBoundingClientRect();
    u = U_MIN + clamp((cx - tr.left) / tr.width, 0, 1) * (U_MAX - U_MIN);
    syncSlider();
  };
  let sliderDrag = false;
  sliderRow.addEventListener("pointerdown", (e) => {
    sliderDrag = true;
    capturePointer(sliderRow, e);
    setFromClientX(e.clientX);
  });
  sliderRow.addEventListener("pointermove", (e) => {
    if (sliderDrag) setFromClientX(e.clientX);
  });
  sliderRow.addEventListener("pointerup", () => (sliderDrag = false));
  sliderRow.addEventListener("pointercancel", () => (sliderDrag = false));
  sliderRow.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") u = clamp(u + 24, U_MIN, U_MAX);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") u = clamp(u - 24, U_MIN, U_MAX);
    else return;
    e.preventDefault();
    syncSlider();
  });
  syncSlider();

  const helper = el("div", {
    class: "helper",
    html: "정면의 거울을 바라보고 있어요. 촛불을 <b>가까이, 또 멀리</b> 옮기며 거울 <b>속 모습</b>이 어떻게 변하는지 지켜보세요!",
  });
  host.append(goalChips, stage, sliders, helper);

  // ---- 상태 ----
  let mode: Mode = "cvMirror";
  const seen: Record<Mode, { near: boolean; far: boolean }> = {
    cvMirror: { near: false, far: false },
    ccMirror: { near: false, far: false },
    cvLens: { near: false, far: false },
    ccLens: { near: false, far: false },
  };
  const doneModes = new Set<Mode>();
  let finished = false;
  let disposed = false;

  function updateSeg(): void {
    segBtns.forEach((b, i) => {
      b.classList.toggle("on", MODES[i] === mode);
      b.setAttribute("aria-pressed", String(MODES[i] === mode));
    });
  }

  function modeDone(m: Mode): void {
    if (doneModes.has(m)) return;
    doneModes.add(m);
    haptic(HAPTIC.ctaUnlock);
    const chip = goalChips.querySelector(`[data-g="${m}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = "관찰 완료!";
    const MSG: Record<Mode, string> = {
      cvMirror: "볼록 거울 — <b>언제나 작고 바로 선 모습</b>, 대신 한 화면에 넓게 담겨요(도로 반사경!).",
      ccMirror: "오목 거울 — 가까이선 <b>크고 바로</b>(화장 거울!), 멀어지면 <b>거꾸로</b> 뒤집혀요.",
      cvLens: "볼록 렌즈 — 가까이선 <b>크고 바로</b>(돋보기!), 멀어지면 <b>작고 거꾸로</b> 보여요.",
      ccLens: "오목 렌즈 — <b>언제나 작고 바로 선 모습</b>. 볼록 거울과 닮은꼴이에요.",
    };
    helper.innerHTML = MSG[m];
    if (doneModes.size === MODES.length && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      window.setTimeout(() => {
        helper.innerHTML =
          "정리! <b>볼록 거울·오목 렌즈</b>는 언제나 작고 바로, <b>오목 거울·볼록 렌즈</b>는 가까우면 크고 바로 — 멀어지면 <b>거꾸로</b>. '왜' 그런지 빛의 경로가 궁금하면 다음 <b>심화 벤치</b>에서 작도로 확인해요!";
      }, 2200);
    }
  }

  function setMode(m: Mode): void {
    if (mode === m) return;
    mode = m;
    u = 300;
    syncSlider();
    haptic(HAPTIC.select);
    updateSeg();
    applyMode();
    const GUIDE: Record<Mode, string> = {
      cvMirror: "볼록 거울이에요. 촛불을 <b>가까이, 또 멀리</b> — 거울 속 크기를 지켜봐요.",
      ccMirror: "오목 거울! 멀리서 천천히 <b>가까이</b> — 어느 순간 거울 속 모습이…?",
      cvLens: "볼록 렌즈예요. 렌즈 <b>너머의 촛불</b>이 렌즈 속에서 어떻게 보이는지! 가까이·멀리!",
      ccLens: "오목 렌즈예요. 거리를 바꿔도 렌즈 속 모습이 어떤지 확인!",
    };
    helper.innerHTML = GUIDE[m];
  }

  // ---- three.js ----
  let st: SpaceStage | null = null;
  let three: typeof T | null = null;
  let loop: Loop | null = null;
  let candle: T.Group | null = null;
  let flameGlow: T.Sprite | null = null;
  let flameLight: T.PointLight | null = null;
  let rtt: T.WebGLRenderTarget | null = null;
  let rttCam: T.PerspectiveCamera | null = null;
  let screenMat: T.ShaderMaterial | null = null;
  let rimMat: T.MeshStandardMaterial | null = null;
  let label: T.Sprite | null = null;
  let makeLabelFn: ((text: string, o?: { size?: number; color?: string }) => T.Sprite) | null = null;

  const DISC_Y = 104; // 원판 중심 높이
  const DISC_R = 86;

  function makeCandle(THREE: typeof T): { group: T.Group; flame: T.Sprite } {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 10, 46, 24),
      new THREE.MeshStandardMaterial({ color: 0xf2e4c8, roughness: 0.55, metalness: 0.05 }),
    );
    body.position.y = 23;
    g.add(body);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 6, 8), new THREE.MeshBasicMaterial({ color: 0x3a3026 }));
    wick.position.y = 48;
    g.add(wick);
    const flame = makeFlameSprite(THREE, "#FFC36E", "#FFF3C4");
    flame.position.y = 57;
    flame.scale.set(22, 30, 1);
    g.add(flame);
    return { group: g, flame };
  }

  function makeFlameSprite(THREE: typeof T, outer: string, inner: string): T.Sprite {
    const cv = document.createElement("canvas");
    cv.width = 64;
    cv.height = 96;
    const c = cv.getContext("2d")!;
    const grad = c.createRadialGradient(32, 60, 3, 32, 56, 44);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, outer);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(32, 4);
    c.quadraticCurveTo(54, 44, 32, 90);
    c.quadraticCurveTo(10, 44, 32, 4);
    c.closePath();
    c.fill();
    const tex = new THREE.CanvasTexture(cv);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    return new THREE.Sprite(mat);
  }

  /** 모드 전환 시 촛불 위치·라벨·거울/렌즈 톤 갱신(지오메트리 재생성 없음) */
  function applyMode(): void {
    if (!st || !three || !screenMat || !rimMat) return;
    const mirror = isMirror(mode);
    // 촛불: 거울 = 앞(+z, 왼쪽에 비켜서) / 렌즈 = 뒤(−z, 축 위 — 렌즈를 '통해' 본다)
    if (candle) {
      candle.position.x = mirror ? -150 : 0;
      candle.position.z = mirror ? u : -u;
    }
    screenMat.uniforms.uMirrorX.value = mirror ? -1 : 1;
    screenMat.uniforms.uTint.value.set(mirror ? 0x24344e : 0x1b3a4a);
    rimMat.color.set(mirror ? 0x4e6488 : 0x3e6a86);
    if (label && makeLabelFn && st) {
      st.scene.remove(label);
      (label.material as T.SpriteMaterial).map?.dispose();
      (label.material as T.SpriteMaterial).dispose();
      label = makeLabelFn(MODE_NAME[mode], { size: 26, color: "#C2D2EE" });
      label.position.set(0, DISC_Y - DISC_R - 22, 6);
      label.scale.multiplyScalar(0.55);
      st.scene.add(label);
    }
  }

  async function boot(): Promise<void> {
    const mod = await import("../../ui/space3d");
    if (disposed) return;
    three = mod.THREE;
    makeLabelFn = mod.makeLabel;
    const THREE = three;
    st = mod.createSpaceStage(canvas, { fov: 42 });
    if (!st) {
      helper.innerHTML =
        "이 기기에서 3D 화면을 열 수 없어요. 핵심만 정리하면 — <b>볼록 거울·오목 렌즈는 언제나 작고 바로</b>, <b>오목 거울·볼록 렌즈는 가까우면 크게, 멀면 거꾸로</b>예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    st.scene.background = new THREE.Color(0x0b1524);
    st.scene.fog = new THREE.Fog(0x0b1524, 900, 1700);

    st.scene.add(new THREE.AmbientLight(0x8fa8cc, 0.55));
    const key = new THREE.DirectionalLight(0xdce8ff, 0.5);
    key.position.set(-180, 320, 300);
    st.scene.add(key);
    flameLight = new THREE.PointLight(0xffc36e, 1.15, 420, 1.6);
    st.scene.add(flameLight);

    // 바닥
    const floorTex = (() => {
      const cv = document.createElement("canvas");
      cv.width = 512;
      cv.height = 512;
      const c = cv.getContext("2d")!;
      const g = c.createRadialGradient(256, 256, 40, 256, 256, 250);
      g.addColorStop(0, "#16233A");
      g.addColorStop(1, "#0B1524");
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(cv);
    })();
    const floor = new THREE.Mesh(new THREE.CircleGeometry(820, 48), new THREE.MeshBasicMaterial({ map: floorTex }));
    floor.rotation.x = -Math.PI / 2;
    floor.layers.enable(3); // 거울 속에도 바닥이 담겨 '넓게 보이는' 광각 느낌이 산다
    st.scene.add(floor);
    // 거리 눈금(깊이 방향 — 촛불이 다니는 길)
    const axisMat = new THREE.LineBasicMaterial({ color: 0x3a4d6e, transparent: true, opacity: 0.8 });
    for (const sideX of [-150, 0]) {
      const g1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sideX, 0.4, -460), new THREE.Vector3(sideX, 0.4, 460)]);
      const line = new THREE.Line(g1, axisMat);
      line.layers.enable(3);
      st.scene.add(line);
    }
    for (let z = -420; z <= 420; z += 60) {
      for (const sideX of [-150, 0]) {
        const tg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(sideX - 7, 0.4, z), new THREE.Vector3(sideX + 7, 0.4, z)]);
        const tick = new THREE.Line(tg, axisMat);
        tick.layers.enable(3);
        st.scene.add(tick);
      }
    }

    // 촛불(레이어 3에도 등록 — RTT 전용 카메라가 이것만 찍는다)
    const c1 = makeCandle(THREE);
    candle = c1.group;
    flameGlow = c1.flame;
    candle.traverse((o) => o.layers.enable(3));
    st.scene.add(candle);

    // RTT — 촛불 고정 프레이밍(거울 속 배율은 셰이더 uMag가 공식대로 담당)
    rtt = new THREE.WebGLRenderTarget(256, 256);
    rttCam = new THREE.PerspectiveCamera(48, 1, 1, 2000); // 넓게 찍고 uMag 보정 — 축소 시 경계 노출 방지
    rttCam.layers.set(3);

    // ---- 정면 광학 장치: 원판(셰이더 스크린) + 림 + 스탠드 ----
    screenMat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: rtt.texture },
        uMag: { value: 1 },
        uFlip: { value: 1 },
        uMirrorX: { value: -1 },
        uK: { value: 0.5 },
        uWash: { value: 0 },
        uTint: { value: new THREE.Color(0x24344e) },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D uTex; uniform float uMag; uniform float uFlip; uniform float uMirrorX;
        uniform float uK; uniform float uWash; uniform vec3 uTint;
        varying vec2 vUv;
        void main(){
          vec2 p = vUv*2.0-1.0;
          float r2 = dot(p,p);
          vec2 q = p*(1.0+uK*r2);
          q.x *= uMirrorX; q.y *= uFlip;
          q /= uMag;
          vec2 uv = clamp(q*0.5+0.5, 0.002, 0.998); // 경계는 가장자리 픽셀 연장 — 사각 테두리 방지
          vec3 base = uTint*(0.9+0.25*(1.0-vUv.y));
          vec4 c = texture2D(uTex, uv);
          vec3 col = mix(base, c.rgb, c.a) + c.rgb*(1.0-c.a)*0.55; // 가산 불꽃 글로우 보존
          // 흐릿한 유리 하이라이트 + 가장자리 비네트
          float r = sqrt(r2);
          col += vec3(0.10,0.13,0.17)*smoothstep(0.55,0.0,length(p-vec2(-0.4,0.45)));
          col *= 1.0-0.28*smoothstep(0.72,1.0,r);
          col = mix(col, vec3(0.65,0.8,0.95), uWash*0.85);
          gl_FragColor = vec4(col,1.0);
        }`,
    });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(DISC_R, 64), screenMat);
    disc.position.set(0, DISC_Y, 0);
    st.scene.add(disc);
    rimMat = new THREE.MeshStandardMaterial({ color: 0x4e6488, metalness: 0.6, roughness: 0.4 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(DISC_R + 2, 3.2, 14, 64), rimMat);
    rim.position.set(0, DISC_Y, 0);
    st.scene.add(rim);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, DISC_Y - DISC_R + 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x3a4a66, metalness: 0.4, roughness: 0.5 }),
    );
    pole.position.y = (DISC_Y - DISC_R + 8) / 2;
    st.scene.add(pole);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 24, 5, 24),
      new THREE.MeshStandardMaterial({ color: 0x2e3c54, metalness: 0.3, roughness: 0.6 }),
    );
    base.position.y = 2.5;
    st.scene.add(base);

    applyMode();

    // 카메라 — 정면 고정(원판이 화면 중앙에 크게)
    st.camera.position.set(0, 168, 545);
    st.camera.lookAt(0, DISC_Y - 6, 0);

    // ---- 프레임 ----
    loop = createLoop((_dt, tMs) => {
      if (!st || disposed || !screenMat) return;
      const r = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width));
      const h = Math.max(2, Math.round(r.height));
      st.resize(w, h);

      const sol = solve(mode, u);
      const nearInf = !sol.ok || Math.abs(sol.m) > 7;
      const mAbs = clamp(Math.abs(sol.m), 0.12, 4.6);
      const mirror = isMirror(mode);

      // 촛불 위치 + 플리커
      candle!.position.x = mirror ? -150 : 0;
      candle!.position.z = mirror ? u : -u;
      const flick = 1 + Math.sin(tMs / 90) * 0.08 + Math.sin(tMs / 47 + 1.7) * 0.05;
      flameGlow!.scale.set(22 * flick, 30 * (2 - flick), 1);
      flameLight!.position.set(candle!.position.x, 60, candle!.position.z + 14);
      flameLight!.intensity = 1.05 + Math.sin(tMs / 90) * 0.14;

      // RTT — 촛불 고정 프레이밍(정면에서)
      rttCam!.position.set(candle!.position.x, 46, candle!.position.z + 175);
      rttCam!.lookAt(candle!.position.x, 40, candle!.position.z);
      const rd = st.renderer;
      rd.setRenderTarget(rtt!);
      rd.setClearColor(0x000000, 0);
      rd.clear(true, true, false);
      rd.render(st.scene, rttCam!);
      rd.setRenderTarget(null);

      // 셰이더 유니폼 — 공식 배율·뒤집힘·왜곡 (1.35 = RTT fov 48 프레이밍 보정)
      screenMat.uniforms.uMag.value = mAbs * 1.35;
      screenMat.uniforms.uFlip.value = sol.m > 0 ? 1 : -1;
      screenMat.uniforms.uK.value = distortK(mode, sol.m);
      screenMat.uniforms.uWash.value = nearInf ? 1 : 0;

      // 상태 필
      let txt: string;
      if (nearInf) txt = "상이 아주 멀리 사라지는 순간!";
      else {
        const upright = sol.m > 0;
        const size = mAbs > 1.04 ? "커요" : mAbs < 0.96 ? "작아요" : "실물 크기";
        const where = mirror ? (sol.virtual ? "거울 뒤" : "거울 앞") : sol.virtual ? "촛불 쪽" : "렌즈 뒤";
        txt = `${upright ? "바로 선" : "거꾸로 선"} 모습 · ${size} (${Math.round(mAbs * 100)}%) · ${where}`;
      }
      (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = txt;

      st.render();

      // 미션 판정 — 가까이/멀리 모두 관찰
      const stSeen = seen[mode];
      if (u <= 84) stSeen.near = true;
      if (u >= 296) stSeen.far = true;
      if (stSeen.near && stSeen.far) modeDone(mode);
    });
    loop.start();
  }

  void boot();

  api.setCTA("네 장치를 모두 관찰해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    rtt?.dispose();
    st?.dispose();
    st = null;
  };
};
