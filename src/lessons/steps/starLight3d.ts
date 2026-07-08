// starLight3d — 별빛 퍼짐 3D 관측소(중2 VIII L2, 책 284~285쪽 그림 VIII-3의 입체판).
// 사용자 요구: "거리 2배 → 면적 4배 → 밝기 1/4을 입체적으로, three.js로 퀄리티 있게. 회전·줌 금지."
//   · 별(광원)에서 사각뿔 빛다발이 퍼지고, 광자 알갱이 240개가 뿔 안을 날아간다(개수 불변!)
//   · 격자 스크린을 드래그로 밀면(거리 ×1~×3, 정수 스냅) 빛 단면이 1칸→4칸→9칸으로 커지고
//     한 칸의 밝기는 1 → 1/4 → 1/9로 어두워진다 — 역제곱이 조작 그 자체로 읽힌다
//   · 카메라는 계산으로 고정(구도 검산) — 회전·줌 입력을 아예 붙이지 않는다
// 목표: ① ×2에서 4칸 발견 ② ×3에서 9칸 ③ 다시 ×1로 — 빛알 개수는 그대로(잃은 빛은 없다).

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { capturePointer } from "../../ui/lightKit";
import { curioCard } from "../../ui/curio";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: { q: string; a: string };
}

const U = 2.1; // 거리 1단위(three 단위)
const A = 1.0; // 거리 1에서 빛 단면 한 변(= 격자 1칸)
const PHOTONS = 240;
const D_MIN = 1;
const D_MAX = 3;

export const starLight3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge star", dataset: { g: "x2" } }, el("b", { text: "거리 ×2" }), el("span", { text: "몇 칸을 비출까?" })),
    el("div", { class: "pn-badge star", dataset: { g: "x3" } }, el("b", { text: "거리 ×3" }), el("span", { text: "몇 칸?" })),
    el("div", { class: "pn-badge star", dataset: { g: "back" } }, el("b", { text: "다시 ×1" }), el("span", { text: "빛알 개수는?" })),
  );

  const canvas = el("canvas", { class: "lt-canvas", style: "height:340px" });
  const statusPill = el(
    "div",
    { class: "pill ov-status" },
    el("span", { class: "pdot", style: "background:#FFD98A" }),
    el("span", { text: "스크린을 옆으로 밀어 보세요" }),
  );
  const toastEl = el("div", { class: "toast" });
  const capEl = el("div", { class: "stage-cap", text: "격자판을 잡고 좌우로 — 별에서 멀리, 또 가까이" });
  const stage = el("div", { class: "stage" }, canvas, statusPill, toastEl, capEl);

  const helper = el("div", {
    class: "helper",
    html: "별빛은 사방으로 <b>퍼지며</b> 나아가요. 같은 빛다발이 거리 2배에서는 <b>2×2 = 4칸</b>을 비추니, 한 칸이 받는 빛은 <b>1/4</b>이 돼요.",
  });
  host.append(goalChips, stage, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let d = 1; // 스크린 거리(×1~×3)
  let dShown = -1; // 텍스처 dirty 판정
  let dragging = false;
  let dragX0 = 0;
  let dragD0 = 1;
  const goals = new Set<string>();
  const visited = new Set<number>();
  let finished = false;
  let disposed = false;
  let toastTimer = 0;

  visited.add(1); // 시작 위치

  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  function collect(id: "x2" | "x3" | "back", subText: string, msg: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    toast(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 광원에서 나온 빛알의 <b>개수는 어디서든 그대로</b> — 다만 거리가 멀어질수록 <b>거리×거리 칸</b>으로 퍼질 뿐이에요. 그래서 밝기는 <b>거리의 제곱에 반비례</b>(×2 → 1/4, ×3 → 1/9)해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  // ---- three.js ----
  let st: SpaceStage | null = null;
  let three: typeof T | null = null;
  let loop: Loop | null = null;
  let screenGroup: T.Group | null = null;
  let gridTex: T.CanvasTexture | null = null;
  let gridCv: HTMLCanvasElement | null = null;
  let photonAttr: T.BufferAttribute | null = null;
  // 광자 알갱이 — 단면 정규 좌표(u,v)와 진행 위치 x(0..1)를 유지(발산 궤적)
  const ph: { u: number; v: number; x: number; sp: number }[] = [];
  let beamInner: T.Mesh | null = null; // 별→스크린 밝은 뿔
  let ghost1: T.LineLoop | null = null;
  let ghost2: T.LineLoop | null = null;

  const snapOf = (v: number): number | null => {
    const r = Math.round(v);
    return Math.abs(v - r) < 0.22 && r >= D_MIN && r <= D_MAX ? r : null;
  };

  // 격자 스크린 텍스처 — d가 변할 때만 다시 그린다
  const TEX = 512;
  const PLATE = 3.45; // 스크린 판 한 변(three 단위)
  const px = (u: number): number => (u / PLATE) * TEX + TEX / 2; // three→텍스처 px(중앙 기준)
  function redrawGrid(): void {
    if (!gridCv || !gridTex) return;
    const ctx = gridCv.getContext("2d")!;
    ctx.clearRect(0, 0, TEX, TEX);
    // 유리판 배경
    ctx.fillStyle = "rgba(13,24,44,.94)";
    ctx.fillRect(0, 0, TEX, TEX);
    // 빛 단면(중앙 정사각, 한 변 A·d) — 밝기 1/d²
    const side = A * d;
    const lum = 1 / (d * d);
    const x0 = px(-side / 2);
    const x1 = px(side / 2);
    const g = ctx.createRadialGradient(TEX / 2, TEX / 2, 8, TEX / 2, TEX / 2, ((x1 - x0) / 2) * 1.35);
    g.addColorStop(0, `rgba(255,246,220,${0.28 + 0.68 * lum})`);
    g.addColorStop(0.75, `rgba(255,224,150,${0.22 + 0.6 * lum})`);
    g.addColorStop(1, `rgba(255,214,120,${0.16 + 0.5 * lum})`);
    ctx.fillStyle = g;
    ctx.fillRect(x0, x0, x1 - x0, x1 - x0);
    // 살짝 번지는 가장자리
    ctx.strokeStyle = `rgba(255,236,180,${0.25 + 0.45 * lum})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, x0, x1 - x0, x1 - x0);
    // 격자선(1칸 = A) — 빛 위에 얹어 "몇 칸을 덮는지"가 읽히게
    ctx.strokeStyle = "rgba(146,170,206,.55)";
    ctx.lineWidth = 2;
    for (let k = -1.5; k <= 1.5; k += 1) {
      const p = px(k * A);
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, TEX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(TEX, p);
      ctx.stroke();
    }
    // 판 테두리
    ctx.strokeStyle = "rgba(196,216,244,.8)";
    ctx.lineWidth = 5;
    ctx.strokeRect(2, 2, TEX - 4, TEX - 4);
    gridTex.needsUpdate = true;
  }

  function judge(snap: number): void {
    visited.add(snap);
    if (snap === 2) {
      if (ghost1) ghost1.visible = true;
      collect("x2", "4칸 · ¼ 밝기", "2배 멀어지니 2×2 = 4칸 — 한 칸은 1/4 밝기!");
    }
    if (snap === 3) {
      if (ghost2) ghost2.visible = true;
      collect("x3", "9칸 · 1/9 밝기", "3배 — 3×3 = 9칸, 한 칸은 1/9!");
    }
    if (snap === 1 && goals.has("x3")) {
      collect("back", "240알 그대로!", "빛알은 한 알도 안 사라졌어요 — 퍼졌을 뿐!");
    }
  }

  function syncPill(): void {
    const span = statusPill.lastElementChild as HTMLElement;
    const snap = snapOf(d);
    if (snap != null && Math.abs(d - snap) < 0.05) {
      const cells = snap * snap;
      const frac = snap === 1 ? "그대로" : `1/${cells}`;
      span.textContent = `거리 ×${snap} → ${cells}칸 → 한 칸 밝기 ${frac}`;
    } else {
      span.textContent = `거리 ×${d.toFixed(1)} — 눈금에 맞춰 보세요`;
    }
  }

  async function boot(): Promise<void> {
    const mod = await import("../../ui/space3d");
    if (disposed) return;
    three = mod.THREE;
    const THREE = three;
    st = mod.createSpaceStage(canvas, { fov: 44 });
    if (!st) {
      helper.innerHTML =
        "이 기기에서 3D 화면을 열 수 없어요. 핵심 — 별빛은 퍼지며 나아가 거리 2배에서 <b>4칸(밝기 1/4)</b>, 3배에서 <b>9칸(1/9)</b>을 비춰요. 밝기는 <b>거리 제곱에 반비례</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
      return;
    }
    st.scene.background = new THREE.Color(0x070d1a);
    st.scene.add(new THREE.AmbientLight(0x93a8cc, 0.55));
    st.scene.add(mod.makeStars(420, 70));

    // ── 별(광원) ──
    const starGrp = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfff2cc }));
    starGrp.add(core);
    starGrp.add(mod.makeGlow(2.2, "#FFE9A8", 0.1));
    starGrp.add(new THREE.PointLight(0xffe0a0, 1.4, 30, 1.6));
    st.scene.add(starGrp);

    // ── 빛 사각뿔 — 단위 뿔(꼭짓점 원점, x=U에서 반너비 A/2)을 scale=d로 확대하면
    //    스크린 단면과 정확히 일치한다(발산 기하가 코드 그 자체)
    function pyramidGeom(): T.BufferGeometry {
      const g = new THREE.BufferGeometry();
      const h = A / 2;
      const c = [
        [U, -h, -h],
        [U, h, -h],
        [U, h, h],
        [U, -h, h],
      ];
      const verts: number[] = [];
      for (let i = 0; i < 4; i++) {
        const a = c[i];
        const b = c[(i + 1) % 4];
        verts.push(0, 0, 0, a[0], a[1], a[2], b[0], b[1], b[2]);
      }
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
      return g;
    }
    const beamMatOuter = new THREE.MeshBasicMaterial({
      color: 0xffdf9e,
      transparent: true,
      opacity: 0.075,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beamOuter = new THREE.Mesh(pyramidGeom(), beamMatOuter);
    beamOuter.scale.setScalar(D_MAX + 0.18);
    st.scene.add(beamOuter);
    const beamMatInner = beamMatOuter.clone();
    beamMatInner.opacity = 0.16;
    beamInner = new THREE.Mesh(pyramidGeom(), beamMatInner);
    beamInner.scale.setScalar(d);
    st.scene.add(beamInner);

    // ── 광자 알갱이(개수 불변의 증인) ──
    for (let i = 0; i < PHOTONS; i++) {
      ph.push({
        u: (Math.random() * 2 - 1) * 0.94,
        v: (Math.random() * 2 - 1) * 0.94,
        x: Math.random(),
        sp: 0.1 + Math.random() * 0.1,
      });
    }
    photonAttr = new THREE.BufferAttribute(new Float32Array(PHOTONS * 3), 3);
    const pgeom = new THREE.BufferGeometry();
    pgeom.setAttribute("position", photonAttr);
    st.scene.add(
      new THREE.Points(
        pgeom,
        new THREE.PointsMaterial({
          color: 0xffe9b0,
          size: 0.075,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );

    // ── 격자 스크린 ──
    gridCv = document.createElement("canvas");
    gridCv.width = TEX;
    gridCv.height = TEX;
    gridTex = new THREE.CanvasTexture(gridCv);
    gridTex.colorSpace = THREE.SRGBColorSpace;
    screenGroup = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(PLATE, PLATE),
      new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, side: THREE.DoubleSide }),
    );
    plate.rotation.y = -Math.PI / 2; // 법선이 별(-x) 쪽을 보게
    screenGroup.add(plate);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.1, PLATE + 0.3),
      new THREE.MeshStandardMaterial({ color: 0x9fb6da, roughness: 0.5, metalness: 0.35 }),
    );
    bar.position.y = PLATE / 2 + 0.08;
    screenGroup.add(bar);
    screenGroup.position.x = d * U;
    st.scene.add(screenGroup);
    redrawGrid();

    // ── 유령 프레임(방문 흔적): ×1 = 1×1, ×2 = 2×2 윤곽 ──
    function frameLoop(side: number, opacity: number): T.LineLoop {
      const h = side / 2;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([0, -h, -h, 0, h, -h, 0, h, h, 0, -h, h]), 3));
      return new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: 0xffe9a8, transparent: true, opacity }));
    }
    ghost1 = frameLoop(A, 0.4);
    ghost1.position.x = 1 * U;
    ghost1.visible = false;
    st.scene.add(ghost1);
    ghost2 = frameLoop(A * 2, 0.34);
    ghost2.position.x = 2 * U;
    ghost2.visible = false;
    st.scene.add(ghost2);

    // ── 바닥 그리드 + 거리 눈금 ──
    const floorY = -PLATE / 2 - 0.34;
    const gridHelp = new THREE.GridHelper(16, 16, 0x2a3c5e, 0x1a2946);
    gridHelp.position.set(3.2, floorY, 0);
    (gridHelp.material as T.Material).transparent = true;
    (gridHelp.material as T.Material & { opacity: number }).opacity = 0.5;
    st.scene.add(gridHelp);
    // makeLabel의 size는 "월드 단위 높이"(VII 태양계는 수백 단위 좌표계, 여기는 7 단위) — 0.5 스케일
    for (let k = 1; k <= 3; k++) {
      const lbl = mod.makeLabel(k === 1 ? "거리 ×1" : `×${k}`, { size: 0.52, color: "#AFC4E8" });
      lbl.position.set(k * U, floorY + 0.34, 1.9);
      st.scene.add(lbl);
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.5), new THREE.MeshBasicMaterial({ color: 0x5e7ca8 }));
      tick.position.set(k * U, floorY + 0.02, 1.2);
      st.scene.add(tick);
    }
    const starLbl = mod.makeLabel("별", { size: 0.56, color: "#FFE9B0" });
    starLbl.position.set(0, 1.15, 0);
    st.scene.add(starLbl);

    // ── 카메라(고정 — 회전·줌 입력 없음) — 구도는 계산으로 확보 ──
    function layoutCamera(): void {
      if (!st) return;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = 340;
      st.resize(w, h);
      const aspect = w / h;
      const vfov = (44 * Math.PI) / 180;
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      // 씬 스팬: 별 글로우(-1.2) ~ 스크린 ×3(6.3)+프레임 여유 → 중심 x 3.0, 반폭 4.1
      // 카메라는 +x쪽으로 비틀어(방위 ~31°) 격자 스크린의 "면"이 보이게 — 정측면이면
      // 몇 칸을 덮는지 안 읽힌다(사용자 피드백). 비튼 만큼 겉보기 폭이 줄어 halfW 보정.
      const C = new THREE.Vector3(3.0, -0.1, 0);
      const halfW = 3.75;
      const halfH = PLATE / 2 + 0.75;
      const dist = Math.max(halfW / Math.tan(hfov / 2), halfH / Math.tan(vfov / 2)) + 0.4;
      const dir = new THREE.Vector3(0.62, 0.4, 1).normalize();
      st.camera.position.copy(C.clone().add(dir.multiplyScalar(dist)));
      st.camera.lookAt(C);
    }
    layoutCamera();
    window.addEventListener("resize", layoutCamera);
    const oldDispose = st.dispose;
    st.dispose = () => {
      window.removeEventListener("resize", layoutCamera);
      oldDispose();
    };

    // ── 프레임 루프 ──
    let settledMs = 0;
    loop = createLoop((dt) => {
      if (!st || disposed) return;
      const dtSec = (dt * 16.7) / 1000;

      // 광자 진행 — x 정규(0..1) 그대로, 실좌표는 발산 궤적(스크린까지)
      for (let i = 0; i < PHOTONS; i++) {
        const p = ph[i];
        p.x += p.sp * dtSec;
        if (p.x >= 1) {
          p.x -= 1;
          p.u = (Math.random() * 2 - 1) * 0.94;
          p.v = (Math.random() * 2 - 1) * 0.94;
        }
        const X = p.x * d * U;
        const spread = (A / 2) * (X / U); // 거리에 비례해 퍼짐
        photonAttr!.setXYZ(i, X, p.u * spread, p.v * spread);
      }
      photonAttr!.needsUpdate = true;

      // 스크린·뿔·텍스처 동기화
      if (screenGroup) screenGroup.position.x = d * U;
      if (beamInner) beamInner.scale.setScalar(d);
      if (Math.abs(d - dShown) > 0.008) {
        dShown = d;
        redrawGrid();
        syncPill();
      }

      // 스냅 정착 판정(드래그 없이 정수 근처 300ms)
      const snap = snapOf(d);
      if (!dragging && snap != null && Math.abs(d - snap) < 0.03) {
        settledMs += dt * 16.7;
        if (settledMs > 300) judge(snap);
      } else settledMs = 0;

      st.render();
    });
    loop.start();
  }

  // ---- 입력: 가로 드래그 = 스크린 이동(회전·줌 없음) ----
  const onDown = (e: PointerEvent): void => {
    dragging = true;
    dragX0 = e.clientX;
    dragD0 = d;
    capturePointer(canvas, e);
    canvas.classList.add("dragging");
    capEl.style.transition = "opacity .4s";
    capEl.style.opacity = "0";
    haptic(HAPTIC.tap);
  };
  const onMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const perPx = (D_MAX - D_MIN) / (rect.width * 0.55); // 화면 절반 남짓 드래그로 전 구간
    d = clamp(dragD0 + (e.clientX - dragX0) * perPx, D_MIN, D_MAX);
  };
  const onUp = (): void => {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    const snap = snapOf(d);
    if (snap != null && Math.abs(d - snap) > 0.001) {
      d = snap;
      haptic(HAPTIC.tap);
    }
  };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "ArrowRight") d = clamp(Math.round(d) + 1, D_MIN, D_MAX);
    else if (e.key === "ArrowLeft") d = clamp(Math.round(d) - 1, D_MIN, D_MAX);
    else return;
    e.preventDefault();
  };
  canvas.setAttribute("tabindex", "0");
  canvas.setAttribute("aria-label", "격자 스크린 거리 조절. 좌우 드래그 또는 화살표 키.");
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("keydown", onKey);

  void boot();

  api.setCTA("×2 → ×3 → 다시 ×1", { enabled: false });
  return () => {
    disposed = true;
    window.clearTimeout(toastTimer);
    loop?.stop();
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("keydown", onKey);
    st?.dispose();
    st = null;
  };
};
