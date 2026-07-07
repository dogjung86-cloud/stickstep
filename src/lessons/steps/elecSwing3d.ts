// elecSwing3d — 자기장 속 전류가 흐르는 코일이 받는 힘(전기 그네) 3D 랩.
//   (중2 VII L8, 책 266~267쪽 '해 보기' + 그림 VII-13·14 재현 — 2D로는 방향 감이 안 잡혀 3D 채택)
//   말굽자석(N 위·S 아래) 틈에 사각 코일의 아래변이 들어가 있고, 전류를 켜면
//   그네가 바깥/안쪽으로 힘을 받아 기운다. 전류 방향·자석 극·전류 세기를 바꾸면
//   힘의 방향·크기가 그대로 반응한다. 자기장(빨강↓)·전류(앰버)·힘(시안) 화살표 상시 표시.
//   과학: F 방향 = 오른손(네 손가락=자기장, 엄지=전류, 손바닥=힘). 여기서는 부호 곱으로 정확 계산.
//   three는 space3d 동적 import, dispose 규율 준수.

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

export const swingLab3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge", dataset: { g: "on" } }, el("b", { text: "전류 켜기" }), el("span", { text: "그네가 움직일까?" })),
    el("div", { class: "pn-badge", dataset: { g: "dir" } }, el("b", { text: "전류 방향" }), el("span", { text: "바꿔 보기" })),
    el("div", { class: "pn-badge", dataset: { g: "pole" } }, el("b", { text: "자석 극" }), el("span", { text: "바꿔 보기" })),
    el("div", { class: "pn-badge", dataset: { g: "amp" } }, el("b", { text: "전류 세기" }), el("span", { text: "약하게↔세게" })),
  );

  const canvas = el("canvas", { class: "lt-canvas", style: "height:340px" });
  const statusPill = el(
    "div",
    { class: "pill ov-status" },
    el("span", { class: "pdot", style: "background:#7ED6FF" }),
    el("span", { text: "전류를 켜 보세요" }),
  );
  const stage = el("div", { class: "stage" }, canvas, statusPill);

  const onBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button", "aria-pressed": "false" } }, el("span", { text: "전류 켜기" }));
  const dirBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "전류 방향 바꾸기" }));
  const poleBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "자석 극 바꾸기" }));
  const btnRow = el("div", { class: "gp-controls" }, onBtn, dirBtn, poleBtn);

  // 전류 세기 슬라이더
  let amp = 0.7; // 0.25~1
  const fill = el("i", { class: "px-fill", style: "background:linear-gradient(90deg,#7A4A18,#F0A422)" });
  const knob = el("i", { class: "px-knob" });
  const track = el("div", { class: "px-track" }, fill, knob);
  const val = el("b", { class: "px-val", text: "" });
  const sliderRow = el(
    "div",
    { class: "px-sl", attrs: { role: "slider", tabindex: "0", "aria-label": "전류 세기" } },
    el("b", { text: "전류 세기" }),
    track,
    val,
  );
  const sliders = el("div", { class: "px-sliders show" }, sliderRow);
  let ampLo = false;
  let ampHi = false;
  const syncSlider = (): void => {
    const t = (amp - 0.25) / 0.75;
    fill.style.width = `${Math.round(t * 100)}%`;
    knob.style.left = `${Math.round(t * 100)}%`;
    val.textContent = `${Math.round(amp * 100)}%`;
    if (on) {
      if (amp <= 0.35) ampLo = true;
      if (amp >= 0.95) ampHi = true;
      if (ampLo && ampHi) collect("amp", "기움도 커져요!");
    }
  };
  let drag = false;
  const setFrom = (cx: number): void => {
    const tr = track.getBoundingClientRect();
    amp = 0.25 + clamp((cx - tr.left) / tr.width, 0, 1) * 0.75;
    syncSlider();
  };
  sliderRow.addEventListener("pointerdown", (e) => {
    drag = true;
    capturePointer(sliderRow, e);
    setFrom(e.clientX);
  });
  sliderRow.addEventListener("pointermove", (e) => {
    if (drag) setFrom(e.clientX);
  });
  sliderRow.addEventListener("pointerup", () => (drag = false));
  sliderRow.addEventListener("pointercancel", () => (drag = false));

  const helper = el("div", {
    class: "helper",
    html: "말굽자석의 틈에 <b>코일 그네</b>가 걸려 있어요. 전류를 켜면 무슨 일이 생길까요?",
  });
  host.append(goalChips, stage, btnRow, sliders, helper);

  // ---- 상태 ----
  let on = false;
  let curDir: 1 | -1 = 1; // 코일 아래변 전류 방향(+z/−z)
  let poleDir: 1 | -1 = 1; // 자기장 방향(1: N위→아래로 향하는 자기장)
  let theta = 0; // 그네 각(rad)
  let omega = 0;
  const goals = new Set<string>();
  let finished = false;
  let disposed = false;

  function collect(id: "on" | "dir" | "pole" | "amp", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    const MSG: Record<string, string> = {
      on: "그네가 힘을 받아 기울었어요! 자기장 속에서 <b>전류가 흐르는 코일은 힘을 받아요</b>.",
      dir: "전류 방향을 바꾸니 <b>힘의 방향도 반대</b>가 됐어요!",
      pole: "자석 극(자기장 방향)을 바꿔도 <b>힘의 방향이 반대</b>가 돼요!",
      amp: "전류가 셀수록 <b>힘도 커져요</b> — 기움이 커진 것 보이죠?",
    };
    helper.innerHTML = MSG[id];
    if (goals.size === 4 && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "전동기 원리로");
      window.setTimeout(() => {
        helper.innerHTML =
          "정리! 힘의 방향은 <b>오른손</b>으로 찾아요 — 네 손가락을 <b>자기장</b> 방향으로 펴고 엄지를 <b>전류</b> 방향으로 향하면, <b>손바닥이 미는 쪽</b>이 힘의 방향! 전류·자기장이 셀수록 힘도 커요.";
      }, 2000);
    }
  }

  // ---- three.js ----
  let st: SpaceStage | null = null;
  let three: typeof T | null = null;
  let loop: Loop | null = null;
  let coil: T.Group | null = null;
  let forceArrow: T.ArrowHelper | null = null;
  let fieldArrows: T.ArrowHelper[] = [];
  let currentCones: T.Mesh[] = [];
  let poleN: T.Mesh | null = null;
  let poleS: T.Mesh | null = null;
  let labelN: T.Sprite | null = null;
  let labelS: T.Sprite | null = null;

  const PIVOT_Y = 168;
  const BOT_Y = 46; // 코일 아래변 높이(자석 틈 중앙)
  const HALF_Z = 30; // 코일 반폭

  async function boot(): Promise<void> {
    const mod = await import("../../ui/space3d");
    if (disposed) return;
    three = mod.THREE;
    const THREE = three;
    st = mod.createSpaceStage(canvas, { fov: 40 });
    if (!st) {
      helper.innerHTML =
        "이 기기에서 3D 화면을 열 수 없어요. 핵심 — 자기장 속 전류가 흐르는 코일은 <b>힘</b>을 받고, <b>전류나 자기장의 방향을 바꾸면 힘의 방향도 반대</b>가 돼요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "전동기 원리로");
      return;
    }
    st.scene.background = new THREE.Color(0x0b1524);
    st.scene.fog = new THREE.Fog(0x0b1524, 800, 1500);
    st.scene.add(new THREE.AmbientLight(0x8fa8cc, 0.6));
    const key = new THREE.DirectionalLight(0xdce8ff, 0.7);
    key.position.set(-200, 320, 260);
    st.scene.add(key);

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
    const floor = new THREE.Mesh(new THREE.CircleGeometry(700, 48), new THREE.MeshBasicMaterial({ map: floorTex }));
    floor.rotation.x = -Math.PI / 2;
    st.scene.add(floor);

    // ── 받침대(그네 지지) ──
    const steel = new THREE.MeshStandardMaterial({ color: 0x5e7090, metalness: 0.5, roughness: 0.45 });
    for (const z of [-70, 70]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, PIVOT_Y, 12), steel);
      post.position.set(0, PIVOT_Y / 2, z);
      st.scene.add(post);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 156, 12), steel);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(0, PIVOT_Y, 0);
    st.scene.add(bar);

    // ── 말굽자석(U자: 등판 −x, 팔이 +x로 — 틈은 y 26~66) ──
    const magSteel = new THREE.MeshStandardMaterial({ color: 0x8c99ac, metalness: 0.6, roughness: 0.35 });
    const back = new THREE.Mesh(new THREE.BoxGeometry(26, 92, 34), magSteel);
    back.position.set(-92, BOT_Y, 0);
    st.scene.add(back);
    const matN = new THREE.MeshStandardMaterial({ color: 0xe0452e, metalness: 0.35, roughness: 0.4 });
    const matS = new THREE.MeshStandardMaterial({ color: 0x3a6cd8, metalness: 0.35, roughness: 0.4 });
    poleN = new THREE.Mesh(new THREE.BoxGeometry(120, 26, 34), matN);
    poleN.position.set(-32, BOT_Y + 33, 0);
    st.scene.add(poleN);
    poleS = new THREE.Mesh(new THREE.BoxGeometry(120, 26, 34), matS);
    poleS.position.set(-32, BOT_Y - 33, 0);
    st.scene.add(poleS);
    labelN = mod.makeLabel("N", { size: 30, color: "#FF9A86" });
    labelN.position.set(24, BOT_Y + 33, 0);
    labelN.scale.multiplyScalar(0.5);
    st.scene.add(labelN);
    labelS = mod.makeLabel("S", { size: 30, color: "#9CC2FF" });
    labelS.position.set(24, BOT_Y - 33, 0);
    labelS.scale.multiplyScalar(0.5);
    st.scene.add(labelS);

    // ── 코일 그네(피벗 y=PIVOT_Y, 아래변이 자석 틈 안) ──
    coil = new THREE.Group();
    const copper = new THREE.MeshStandardMaterial({ color: 0xc97f3a, metalness: 0.55, roughness: 0.35 });
    const drop = PIVOT_Y - BOT_Y;
    for (const z of [-HALF_Z, HALF_Z]) {
      const side = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, drop, 10), copper);
      side.position.set(0, -drop / 2, z);
      coil.add(side);
    }
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, HALF_Z * 2, 10), copper);
    bottom.rotation.x = Math.PI / 2;
    bottom.position.set(0, -drop, 0);
    coil.add(bottom);
    // 전류 방향 원뿔 2개(아래변 위)
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xffc46e });
    for (const zOff of [-10, 12]) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(4.2, 11, 12), coneMat);
      cone.position.set(0, -drop + 9, zOff);
      cone.rotation.x = Math.PI / 2; // +z 방향 기본
      coil.add(cone);
      currentCones.push(cone);
    }
    coil.position.set(0, PIVOT_Y, 0);
    st.scene.add(coil);

    // ── 화살표: 자기장(틈 안 3개, N→S) / 힘(아래변에서 ±x) ──
    for (const z of [-16, 0, 16]) {
      const a = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-44, BOT_Y + 18, z), 36, 0xff7a5e, 12, 7);
      st.scene.add(a);
      fieldArrows.push(a);
    }
    forceArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, BOT_Y, 0), 46, 0x7ed6ff, 16, 10);
    forceArrow.visible = false;
    st.scene.add(forceArrow);
    const lblB = mod.makeLabel("자기장", { size: 22, color: "#FF9A86" });
    lblB.position.set(-44, BOT_Y - 34, 0);
    lblB.scale.multiplyScalar(0.42);
    st.scene.add(lblB);

    st.camera.position.set(215, 150, 320);
    st.camera.lookAt(-10, 92, 0);

    // ---- 프레임 ----
    loop = createLoop((dt, tMs) => {
      if (!st || disposed) return;
      const r = canvas.getBoundingClientRect();
      st.resize(Math.max(2, Math.round(r.width)), Math.max(2, Math.round(r.height)));

      // 힘: F ∝ 전류(부호·세기) × 자기장(부호) — +면 바깥(+x)쪽
      const force = on ? curDir * poleDir * amp : 0;
      const target = force * 0.5;
      // 스프링-감쇠 진자
      omega += (target - theta) * 0.09 - omega * 0.12;
      theta += omega * dt;
      coil!.rotation.z = theta;

      // 힘 화살표
      if (forceArrow) {
        forceArrow.visible = on;
        if (on) {
          const dir = force >= 0 ? 1 : -1;
          forceArrow.setDirection(new three!.Vector3(dir, 0, 0));
          forceArrow.setLength(26 + Math.abs(force) * 46, 14, 9);
          // 아래변 위치 따라 이동
          const bx = Math.sin(theta) * (PIVOT_Y - BOT_Y) * -1;
          forceArrow.position.set(bx, BOT_Y + (1 - Math.cos(theta)) * (PIVOT_Y - BOT_Y), 0);
        }
      }
      // 전류 원뿔 방향 + 점멸
      const blink = on ? 0.75 + Math.sin(tMs / 160) * 0.25 : 0.25;
      currentCones.forEach((cone) => {
        cone.rotation.x = curDir > 0 ? Math.PI / 2 : -Math.PI / 2;
        (cone.material as T.MeshBasicMaterial).opacity = blink;
        (cone.material as T.MeshBasicMaterial).transparent = true;
        cone.visible = on;
      });
      // 자기장 화살표 방향(극 반전 시)
      fieldArrows.forEach((a) => a.setDirection(new three!.Vector3(0, -poleDir, 0)));

      // 상태 필
      const pillTxt = !on
        ? "전류 꺼짐 — 그네가 가만히 있어요"
        : `힘의 방향: ${force >= 0 ? "자석 바깥쪽" : "자석 안쪽"} · 세기 ${Math.round(Math.abs(force) * 100)}%`;
      (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = pillTxt;

      st.render();

      if (on && Math.abs(theta) > 0.22) collect("on", "힘을 받았다!");
    });
    loop.start();
  }

  onBtn.addEventListener("click", () => {
    on = !on;
    (onBtn.querySelector("span") as HTMLElement).textContent = on ? "전류 끄기" : "전류 켜기";
    onBtn.classList.remove("pulse");
    onBtn.setAttribute("aria-pressed", String(on));
    haptic(HAPTIC.select);
    if (on) syncSlider();
  });
  dirBtn.addEventListener("click", () => {
    curDir = curDir > 0 ? -1 : 1;
    haptic(HAPTIC.select);
    if (on && goals.has("on")) {
      collect("dir", "힘도 반대로!");
      helper.innerHTML = "전류의 방향을 바꿨어요 — 그네가 <b>반대쪽</b>으로 기우는 것 보이죠?";
    }
  });
  poleBtn.addEventListener("click", () => {
    poleDir = poleDir > 0 ? -1 : 1;
    haptic(HAPTIC.select);
    // N/S 라벨·색 스왑
    if (poleN && poleS && labelN && labelS) {
      const top = poleDir > 0;
      (poleN.material as T.MeshStandardMaterial).color.set(top ? 0xe0452e : 0x3a6cd8);
      (poleS.material as T.MeshStandardMaterial).color.set(top ? 0x3a6cd8 : 0xe0452e);
      labelN.position.y = top ? BOT_Y + 33 : BOT_Y - 33;
      labelS.position.y = top ? BOT_Y - 33 : BOT_Y + 33;
    }
    if (on && goals.has("on")) {
      collect("pole", "자기장 반대 = 힘 반대!");
      helper.innerHTML = "자석의 극(자기장 방향)을 바꿨어요 — 이번에도 힘이 <b>반대</b>!";
    }
  });
  syncSlider();

  void boot();

  api.setCTA("네 가지를 모두 실험해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    st = null;
  };
};
