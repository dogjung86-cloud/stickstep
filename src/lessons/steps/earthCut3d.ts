// earthCut3d — 지구 내부 층상 구조 3D 랩(중2 II L1). 교과서 그림 II-3의 입체 조작판.
//   · 가로 모드(rotateStage): 지구를 4분의 1 뜯어낸 컷어웨이 — 단면에 지각·맨틀·외핵·내핵 띠.
//   · 층을 탭하면 정보 카드(깊이·상태·특징), 좌우로 끌면 지구가 돌아간다.
//   · 단면은 CanvasTexture 반원 디스크 2장(경계 원호 + 근-동조 그라데이션 띠).
// 목표: 네 층 모두 탐사(지각→내핵). 완료 시 조사 방법(시추·화산 분출물·지진파) 정리.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { RotateStage } from "../../ui/rotateStage";

interface EarthStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// 반지름 스케일: 1유닛 = 1000 km. 지각만 보이게 과장(실제 5~35 km — 문구로 명시).
const R_EARTH = 6.4;
const R_MANTLE = 6.05; // 지각 시각 두께 0.35(과장)
const R_OUTER = 3.5; // 깊이 2900 km → 반지름 6400-2900
const R_INNER = 1.3; // 깊이 5100 km → 반지름 6400-5100

interface LayerInfo {
  id: "crust" | "mantle" | "outer" | "inner";
  name: string;
  depth: string;
  state: string;
  desc: string;
  color: string;
}
const LAYERS: LayerInfo[] = [
  {
    id: "crust", name: "지각", depth: "지표 ~ 약 35 km", state: "고체",
    desc: "가장 바깥의 얇은 층 — 여러 암석으로 이루어져요. 대륙 지각(평균 약 35 km)이 해양 지각(평균 약 5 km)보다 두꺼워요. 그림은 알아보기 쉽게 두껍게 그렸어요.",
    color: "#9CC97E",
  },
  {
    id: "mantle", name: "맨틀", depth: "지각 아래 ~ 약 2900 km", state: "고체",
    desc: "지구 전체 부피의 약 80 %를 차지하는 가장 두꺼운 층이에요. 지각과는 다른 종류의 암석으로 이루어져 있어요. 지각과의 경계면은 '모호면'이라고 불러요.",
    color: "#F08A5C",
  },
  {
    id: "outer", name: "외핵", depth: "약 2900 ~ 5100 km", state: "액체(추정)",
    desc: "지진파 연구로 액체 상태로 추정해요. 지각·맨틀보다 밀도가 큰 물질로 이루어져 있어요.",
    color: "#FFB84A",
  },
  {
    id: "inner", name: "내핵", depth: "약 5100 ~ 6400 km(중심)", state: "고체(추정)",
    desc: "지구의 중심 — 고체 상태로 추정해요. 외핵과 함께 지구에서 가장 밀도가 큰 부분이에요.",
    color: "#FFE27A",
  },
];

/** 단면 디스크 텍스처 — 층 띠(근-동조 그라데이션 + 경계 원호). CircleGeometry의 UV는
 *  원 전체 바운딩 기준이라, 원판 중심·반지름을 캔버스 중심·반폭에 맞추면 정확히 맞는다. */
function sectionTexture(THREE: typeof T): T.CanvasTexture {
  const S = 1024;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const c = S / 2;
  const px = (r: number): number => (r / R_EARTH) * (S / 2 - 4);
  const band = (r0: number, r1: number, stops: [number, string][]): void => {
    const g = ctx.createRadialGradient(c, c, px(r1), c, c, px(r0));
    for (const [o, col] of stops) g.addColorStop(o, col);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, px(r0), 0, Math.PI * 2);
    ctx.arc(c, c, px(r1), 0, Math.PI * 2, true);
    ctx.fill();
  };
  // 내핵(중심 원반)
  const gi = ctx.createRadialGradient(c, c, 0, c, c, px(R_INNER));
  gi.addColorStop(0, "#FFF6D0");
  gi.addColorStop(0.7, "#FFD65A");
  gi.addColorStop(1, "#F5B83A");
  ctx.fillStyle = gi;
  ctx.beginPath();
  ctx.arc(c, c, px(R_INNER), 0, Math.PI * 2);
  ctx.fill();
  // 외핵 · 맨틀 · 지각 띠
  band(R_OUTER, R_INNER, [[0, "#F5A93E"], [0.55, "#EE8C2C"], [1, "#E07020"]]);
  band(R_MANTLE, R_OUTER, [[0, "#D96636"], [0.45, "#B84A26"], [1, "#8F331B"]]);
  band(R_EARTH, R_MANTLE, [[0, "#8FB278"], [0.55, "#6B8F58"], [1, "#4E6B40"]]);
  // 경계 원호(밝은 라인)
  ctx.strokeStyle = "rgba(255,240,214,.55)";
  ctx.lineWidth = 3;
  for (const r of [R_MANTLE, R_OUTER, R_INNER]) {
    ctx.beginPath();
    ctx.arc(c, c, px(r), 0, Math.PI * 2);
    ctx.stroke();
  }
  // 외핵 액체 느낌 — 동심 물결 몇 줄
  ctx.strokeStyle = "rgba(255,214,138,.22)";
  ctx.lineWidth = 2;
  for (let k = 1; k <= 4; k++) {
    ctx.beginPath();
    ctx.arc(c, c, px(R_INNER + ((R_OUTER - R_INNER) * k) / 5), 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const earthCut3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as EarthStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges" },
    ...LAYERS.map((L) =>
      el("div", { class: "pn-badge geo", dataset: { g: L.id } }, el("b", { text: L.name }), el("span", { text: "?" })),
    ),
  );

  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", { class: "sp3-enter-txt", html: "지구를 <b>4분의 1 뜯어내고</b> 속을 들여다봐요.<br>화면이 자동으로 <b>가로</b>로 돌아가요." }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "땅을 아무리 깊이 파도 지구 반지름의 0.2 %도 못 내려가요. 그런데 속을 어떻게 알았을까요? 일단 <b>뜯어 봅시다!</b>",
  });
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === LAYERS.length && !finished) {
      finished = true;
      helper.innerHTML =
        "네 층 탐사 완료! 시추와 화산 분출물 조사로는 <b>지표 부근</b>만 알 수 있어요. 깊은 속은 지구 내부를 통과하는 <b>지진파 연구</b>로 알아냈답니다 — 그래서 외핵·내핵의 상태도 '추정'이에요.";
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

  let spinY = 0; // 드래그 회전(기준 각도에 더해짐)
  let selected: LayerInfo | null = null;
  let selPulse = 0;

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "지구 내부 — 층을 탭해 탐사해요",
      onLeave: () => leave(),
    });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    const pill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#C89459" }), el("span", { text: "단면의 층을 탭해 보세요 · 끌면 돌아가요" }));
    const infoCard = el("div", { class: "sp3-infocard hide" });
    rot.stage.append(canvas, pill, infoCard);
    const pillText = pill.querySelectorAll("span")[1] as HTMLElement;

    const S = await import("../../ui/space3d");
    if (disposed || !rot) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 40 });
    if (!st) {
      pillText.textContent = "이 기기는 3D를 지원하지 않아요";
      helper.innerHTML =
        "3D를 켤 수 없어요. 글로 기억해요 — 지구 속은 <b>지각(고체·가장 얇음) → 맨틀(고체·부피 80 %) → 외핵(액체 추정) → 내핵(고체 추정)</b> 네 층이에요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(700, 200));

    const group = new THREE.Group();
    scene.add(group);

    // 겉면(지구 표면) — 4분의 1 뜯어낸 구
    const CUT = Math.PI * 1.5; // 남은 표면 각(φ: 0 ~ 270°)
    const surfMat = new THREE.MeshLambertMaterial({ map: S.planetTexture("earth") });
    const surf = new THREE.Mesh(new THREE.SphereGeometry(R_EARTH, 72, 48, 0, CUT), surfMat);
    group.add(surf);
    // 안쪽 층 구면(뜯어낸 창으로 보이는 돔들)
    const domeSpec: [number, string, number][] = [
      [R_MANTLE, "#B84A26", 0.15],
      [R_OUTER, "#EE8C2C", 0.3],
      [R_INNER, "#FFD65A", 0.55],
    ];
    const domes: T.Mesh[] = [];
    for (const [r, colr, emis] of domeSpec) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 56, 40, 0, CUT),
        new THREE.MeshLambertMaterial({ color: colr, emissive: new THREE.Color(colr), emissiveIntensity: emis }),
      );
      group.add(m);
      domes.push(m);
    }

    // 절단면 2장 — 반원 디스크(극축을 세로로) + 층 띠 텍스처.
    // THREE SphereGeometry의 정점: x=-r·cosφ·sinθ, z=r·sinφ·sinθ (φ=phiStart..+phiLength).
    // 표면이 φ∈[0,270°]에 남으므로 뜯긴 창은 φ∈(270°,360°) — 이등분 방향은 (-0.707, 0, -0.707).
    // 절단 평면: φ=0 → XY평면의 -X 반원(법선 ±Z), φ=270° → YZ평면의 -Z 반원(법선 ±X).
    const secTex = sectionTexture(THREE);
    const faceMat = new THREE.MeshBasicMaterial({ map: secTex, side: THREE.DoubleSide });
    const faceGeom = new THREE.CircleGeometry(R_EARTH, 72, Math.PI / 2, Math.PI); // -X쪽 반원(90°~270°), XY평면
    const faceA = new THREE.Mesh(faceGeom, faceMat); // φ=0 절단면(XY평면 그대로)
    const faceB = new THREE.Mesh(faceGeom.clone(), faceMat); // φ=270° 절단면 — -X반원을 -Z반원으로
    faceB.rotation.y = -Math.PI / 2;
    group.add(faceA, faceB);

    // 은은한 대기 글로우
    const glow = S.makeGlow(19, "rgba(120,170,255,.3)", 0.22);
    scene.add(glow);

    const sunLight = new THREE.DirectionalLight(0xfff2dc, 1.9);
    sunLight.position.set(-14, 9, 16);
    scene.add(sunLight, new THREE.AmbientLight(0x5a6a86, 1.05));

    // 뜯어낸 창의 이등분(-0.707,0,-0.707)을 rotY(3π/4)로 정확히 +Z(카메라)로 돌리면
    // 절단면 두 장이 정면으로 활짝 열려 화면을 다 채운다 — 교과서 구도처럼 비스듬히:
    // 살짝 덜 돌려(−0.55rad) 오른쪽엔 겉면(대륙·바다), 왼쪽엔 절단면이 원근으로 보이게.
    const BASE_Y = Math.PI * 0.75 - 0.55;
    group.rotation.y = BASE_Y;
    group.rotation.x = 0.14;

    // 카메라 — 가로 프레임: 지구를 왼쪽에, 오른쪽은 정보 카드 여백
    const camPos = new THREE.Vector3(3.4, 4.2, 19.5);
    camera.position.copy(camPos);
    camera.lookAt(1.6, -0.3, 0);

    // 층 이름표 — 뜯어낸 창 이등분 방향 위 각 층 중간 반지름, 위→아래 계단식으로 흩어 겹침 방지
    const mids = [R_EARTH + 0.5, (R_MANTLE + R_OUTER) / 2 + 0.3, (R_OUTER + R_INNER) / 2 + 0.15, R_INNER * 0.5];
    const labYs = [1.5, 0.8, 0.1, -0.55];
    LAYERS.forEach((L, i) => {
      const sp = S.makeLabel(L.name, { size: i === 0 ? 0.8 : 0.92, color: "#F2E8D8" });
      const bx = Math.SQRT1_2 * mids[i];
      sp.position.set(-bx, labYs[i], -bx);
      group.add(sp);
    });

    // ---- 입력: 탭=층 선택 / 드래그=회전 ----
    let downAt: { x: number; y: number } | null = null;
    let dragging = false;
    let lastX = 0;
    canvas.addEventListener("pointerdown", (e) => {
      const p = rot!.mapPoint(e);
      downAt = p;
      lastX = p.x;
      dragging = false;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!downAt) return;
      const p = rot!.mapPoint(e);
      if (!dragging && Math.abs(p.x - downAt.x) + Math.abs(p.y - downAt.y) > 9) dragging = true;
      if (dragging) {
        spinY = clamp(spinY + (p.x - lastX) * 0.004, -0.85, 0.6);
        lastX = p.x;
      }
    });
    const up = (e: PointerEvent): void => {
      if (downAt && !dragging) pick(e);
      downAt = null;
      dragging = false;
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", () => {
      downAt = null;
      dragging = false;
    });

    function pick(e: PointerEvent): void {
      if (!rot || !st || !THREE) return;
      const { w, h } = rot.size();
      const p = rot.mapPoint(e);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1)), st.camera);
      const hits = ray.intersectObjects([faceA, faceB, surf, ...domes], false);
      if (!hits.length) return;
      const r = hits[0].point.length();
      const L =
        r <= R_INNER + 0.12 ? LAYERS[3] : r <= R_OUTER + 0.12 ? LAYERS[2] : r <= R_MANTLE + 0.1 ? LAYERS[1] : LAYERS[0];
      selected = L;
      selPulse = 1;
      haptic(HAPTIC.select);
      infoCard.classList.remove("hide");
      infoCard.innerHTML =
        `<div class="ic-name" style="color:${L.color}">${L.name}</div>` +
        `<div class="ic-row"><b>깊이</b>${L.depth}</div>` +
        `<div class="ic-row"><b>상태</b>${L.state}</div>` +
        `<div class="ic-desc">${L.desc}</div>`;
      pillText.textContent = `${L.name} — ${L.state}`;
      collect(L.id, L.state);
    }

    // ---- 프레임 ----
    loop = createLoop((dt, tMs) => {
      if (!rot || !st || !THREE) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);

      group.rotation.y = BASE_Y + spinY;

      // 선택 펄스 — 해당 층이 잠깐 밝아진다
      selPulse = Math.max(0, selPulse - 0.03 * dt);
      domes.forEach((d, i) => {
        const mat = d.material as T.MeshLambertMaterial;
        const base = domeSpec[i][2];
        const isSel =
          selected != null &&
          ((i === 0 && selected.id === "mantle") || (i === 1 && selected.id === "outer") || (i === 2 && selected.id === "inner"));
        mat.emissiveIntensity = base + (isSel ? selPulse * 0.5 : 0) + (i === 2 ? Math.sin(tMs / 600) * 0.06 : 0);
      });
      const sm = surfMat as T.MeshLambertMaterial;
      sm.emissive.setHex(selected?.id === "crust" ? 0x2a4a22 : 0x000000);
      sm.emissiveIntensity = selected?.id === "crust" ? Math.max(0.15, selPulse) : 0;

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
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 열어 보기";
      enterBtn.classList.remove("pulse");
    } else {
      helper.innerHTML = "아직 탐사하지 못한 층이 있어요 — 다시 열어서 <b>네 층을 모두</b> 눌러 봐요!";
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("네 층을 모두 탐사해요", { enabled: false });
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
      <radialGradient id="ez-sec" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFE9A0"/><stop offset=".28" stop-color="#F5A93E"/><stop offset=".62" stop-color="#B84A26"/><stop offset=".94" stop-color="#6B8F58"/><stop offset="1" stop-color="#3E5A34"/>
      </radialGradient>
      <radialGradient id="ez-sea" cx=".35" cy=".3" r=".85">
        <stop offset="0" stop-color="#7FB2F0"/><stop offset=".6" stop-color="#2E6FD4"/><stop offset="1" stop-color="#1B4B9E"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <circle cx="34" cy="24" r="1.2" fill="#DCE8FF"/><circle cx="246" cy="18" r="1.2" fill="#DCE8FF"/>
    <circle cx="216" cy="80" r="1" fill="#DCE8FF"/><circle cx="70" cy="80" r="1" fill="#DCE8FF"/>
    <circle cx="132" cy="48" r="36" fill="url(#ez-sea)"/>
    <path d="M132 48 L132 12 A36 36 0 0 1 168 48 Z" fill="url(#ez-sec)"/>
    <path d="M132 48 L168 48 M132 48 L132 12" stroke="#F2E8D8" stroke-width="1.4" opacity=".7"/>
    <circle cx="132" cy="48" r="7" fill="#FFE9A0"/>
    <path d="M247 40l8 8-8 8" stroke="#C89459" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
