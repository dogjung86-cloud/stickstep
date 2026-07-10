// galaxy3d — 우리은하 3D 관측선(중2 VIII L5, 책 294~295쪽). 가로 모드(rotateStage).
// 사용자 요구: "우리은하를 3D로 회전 — 위/옆 모습, 은하 중심 탭 = 은하수 사진,
//   태양계 위치·중심~태양계 3만 광년·지름 10만 광년을 이 화면에서 전부 설명".
//   · 디스크 = NASA 실사(milkyway-top.webp)를 additive 평면으로(검은 배경이 자연히 사라짐)
//     + 입자 볼륨(원반 두께·중심 벌지) — 옆에서 봐도 "납작 + 가운데 불룩"이 살아 있다
//   · 헤일로 = 구상 성단 글로우 12개(L6 연계), 지름·반경 눈금 라벨 상시 표시
//   · 드래그 = 시점 회전(위 ↔ 옆), 탭 = 태양계/은하 중심(중심 탭 → 은하수 파노라마 사진 카드:
//     "원반 안에서 중심 방향을 보면 이렇게 보인다" — 은하수의 정체가 위치로 읽힌다)
// 목표 4: 위에서 보기 · 옆에서 보기 · 태양계 찾기 · 은하 중심(은하수) 보기.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { RotateStage } from "../../ui/rotateStage";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
}

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

const R_DISK = 10; // 은하 반지름(three 단위) = 5만 광년
const R_SUN = 6; // 태양계 반지름 위치 = 3만 광년
const CAM_DIST = 20.5;

export const galaxy3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force4" },
    el("div", { class: "pn-badge star", dataset: { g: "top" } }, el("b", { text: "위에서 보기" }), el("span", { text: "나선팔 확인" })),
    el("div", { class: "pn-badge star", dataset: { g: "side" } }, el("b", { text: "옆에서 보기" }), el("span", { text: "원반+불룩" })),
    el("div", { class: "pn-badge star", dataset: { g: "sun" } }, el("b", { text: "태양계 찾기" }), el("span", { text: "노란 점 탭" })),
    el("div", { class: "pn-badge star", dataset: { g: "core" } }, el("b", { text: "은하 중심" }), el("span", { text: "탭 — 은하수?" })),
  );

  // 세로 화면 — 가로 진입 카드(eclipse3d 문법)
  const enterArt = el("div", { class: "sp3-enter-art", html: enterArtSvg() });
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 관측 시작" }));
  const btnRow = el("div", { class: "gp-controls" }, enterBtn);
  const helper = el("div", {
    class: "helper",
    html: "우리은하를 <b>밖에서</b> 도는 관측선에 탑승해요. 드래그로 <b>위에서도, 옆에서도</b> 돌려 보고 — 태양계와 은하 중심을 찾아 탭해 보세요.",
  });
  host.append(goalChips, helper, enterArt, btnRow); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)

  const goals = new Set<string>();
  let finished = false;

  function collect(id: "top" | "side" | "sun" | "core", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    syncMissions();
    if (goals.size === 4 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 우리은하는 <b>지름 약 10만 광년</b>의 별 도시 — 위에서 보면 <b>막대+나선팔</b>, 옆에서 보면 <b>납작한 원반+불룩한 중심</b>이에요. 태양계는 중심에서 <b>약 3만 광년</b> 떨어진 변두리, 그리고 원반 안에서 중심 쪽을 바라본 모습이 바로 <b>은하수</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "정리하러 가기");
    }
  }

  // ---- 가로 스테이지 + 3D ----
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let loop: Loop | null = null;
  let disposed = false;
  let missionEls: HTMLElement[] = [];

  // 궤도 카메라(구면) — 시작은 비스듬(위·옆이 모두 남게)
  let azim = 0.9;
  let polar = 0.62; // 0 = 옆(에지온), π/2 = 정수리(탑뷰)
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let moved = 0;
  let topMs = 0;
  let sideMs = 0;

  function syncMissions(): void {
    const keys = ["top", "side", "sun", "core"];
    missionEls.forEach((m, i) => m.classList.toggle("on", goals.has(keys[i])));
  }

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({
      title: "우리은하 관측선 — 드래그로 돌리고, 탭으로 찾기",
      onLeave: () => leave(),
    });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    const pill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#9CA8FF" }), el("span", { text: "드래그 — 위에서, 옆에서" }));
    const missions = el("div", { class: "sp3-missions" });
    for (const t of ["위에서", "옆에서", "태양계", "은하 중심"]) {
      const m = el("span", { text: t });
      missions.appendChild(m);
      missionEls.push(m);
    }
    syncMissions();
    const toast = el("div", { class: "sp3-toast" });
    // 은하수 사진 카드(중심 탭 시)
    const photoCard = el(
      "div",
      { class: "g3d-photo" },
      el("img", { attrs: { src: `${base}photos/star/milkyway-pan.webp`, alt: "지구에서 은하 중심 방향을 본 은하수 파노라마" } }),
      el("div", { class: "g3d-photo-cap", html: "원반 <b>안</b>(태양계)에서 중심 방향을 보면 — 이 <b>은하수</b>로 보여요! 가장 밝고 두꺼운 부분이 방금 탭한 중심 방향(ESO 실사)" }),
      el("button", { class: "g3d-photo-x", attrs: { type: "button", "aria-label": "사진 닫기" }, text: "닫기" }),
    );
    rot.stage.append(canvas, pill, missions, toast, photoCard);
    const pillText = pill.querySelectorAll("span")[1] as HTMLElement;
    (photoCard.querySelector(".g3d-photo-x") as HTMLElement).addEventListener("click", () => {
      photoCard.classList.remove("show");
      haptic(HAPTIC.tap);
    });

    let toastTimer = 0;
    const showToast = (msg: string): void => {
      toast.textContent = msg;
      toast.classList.add("show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
    };

    const S = await import("../../ui/space3d");
    if (disposed || !rot) return;
    THREE = S.THREE;
    const T3 = THREE;
    st = S.createSpaceStage(canvas, { fov: 40 });
    if (!st) {
      pillText.textContent = "이 기기는 3D를 지원하지 않아요";
      helper.innerHTML =
        "3D를 켤 수 없어요. 핵심 — 우리은하는 지름 <b>약 10만 광년</b>, 위에서 보면 나선팔·옆에서 보면 불룩한 원반, 태양계는 중심에서 <b>약 3만 광년</b>, 은하수는 <b>안에서 본 우리은하</b>예요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "정리하러 가기");
      return;
    }
    const { scene, camera } = st;
    scene.add(new T3.AmbientLight(0x9daccc, 0.8));
    scene.add(S.makeStars(700, 90));

    // ── 디스크: NASA 실사 평면 — 원형 알파 페이드 마스크를 캔버스로 합성
    //    (사각 텍스처 그대로면 어두운 모서리가 "검은 다이아" 윤곽으로 드러난다 — 실측 피드백)
    const diskMat = new T3.MeshBasicMaterial({
      transparent: true,
      opacity: 0.98,
      depthWrite: false,
      side: T3.DoubleSide,
    });
    new T3.ImageLoader().load(`${base}photos/star/milkyway-top.webp`, (img) => {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 1024;
      const cctx = cv.getContext("2d")!;
      cctx.drawImage(img, 0, 0, 1024, 1024);
      // 반경 페이드: 중심~78%는 그대로, 바깥은 서서히 투명 → 사각 윤곽 소멸
      cctx.globalCompositeOperation = "destination-in";
      const mask = cctx.createRadialGradient(512, 512, 0, 512, 512, 512);
      mask.addColorStop(0, "rgba(0,0,0,1)");
      mask.addColorStop(0.78, "rgba(0,0,0,1)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      cctx.fillStyle = mask;
      cctx.fillRect(0, 0, 1024, 1024);
      const tex = new T3.CanvasTexture(cv);
      tex.colorSpace = T3.SRGBColorSpace;
      tex.anisotropy = 8;
      diskMat.map = tex;
      diskMat.needsUpdate = true;
    });
    const disk = new T3.Mesh(new T3.PlaneGeometry(R_DISK * 2.24, R_DISK * 2.24), diskMat);
    disk.rotation.x = -Math.PI / 2;
    scene.add(disk);

    // ── 원반 볼륨 입자(옆모습의 두께) + 중심 벌지 ──
    function pointsCloud(count: number, gen: (i: number) => [number, number, number], color: number, size: number, opacity: number): T.Points {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const [x, y, z] = gen(i);
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
      const g = new T3.BufferGeometry();
      g.setAttribute("position", new T3.BufferAttribute(pos, 3));
      return new T3.Points(g, new T3.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, blending: T3.AdditiveBlending }));
    }
    const rnd = (() => {
      let seed = 20260708;
      return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
    })();
    const gauss = (): number => (rnd() + rnd() + rnd() - 1.5) / 1.5;
    // 원반: 반지름 거듭제곱 분포 + 얇은 y(바깥일수록 더 얇게)
    scene.add(
      pointsCloud(1400, () => {
        const r = 1.6 + Math.pow(rnd(), 0.62) * (R_DISK - 1.6);
        const a = rnd() * Math.PI * 2;
        const th = 0.5 * (1 - (r / R_DISK) * 0.72);
        return [Math.cos(a) * r, gauss() * th, Math.sin(a) * r];
      }, 0xbfd0ee, 0.09, 0.5),
    );
    // 벌지(가운데 불룩) — 구형 가우시안, 웜 톤
    scene.add(
      pointsCloud(420, () => {
        const rr = Math.abs(gauss()) * 1.9;
        const a = rnd() * Math.PI * 2;
        const b = Math.acos(rnd() * 2 - 1);
        return [Math.sin(b) * Math.cos(a) * rr, Math.cos(b) * rr * 0.62, Math.sin(b) * Math.sin(a) * rr];
      }, 0xffe0b0, 0.11, 0.75),
    );
    const coreGlow = S.makeGlow(4.6, "#FFE2B0", 0.14);
    scene.add(coreGlow);

    // ── 헤일로 구상 성단(12곳 — L6 연계) ──
    for (let i = 0; i < 12; i++) {
      const rr = 4.5 + rnd() * 4.5;
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(rnd() * 2 - 1);
      const gl = S.makeGlow(0.55, "#C8B8FF", 0.2);
      gl.position.set(Math.sin(b) * Math.cos(a) * rr, Math.cos(b) * rr * 0.8, Math.sin(b) * Math.sin(a) * rr);
      scene.add(gl);
    }

    // ── 태양계 마커(중심에서 3만 광년 = R_SUN) + 링 ──
    const sunGrp = new T3.Group();
    const sunDot = new T3.Mesh(new T3.SphereGeometry(0.17, 20, 20), new T3.MeshBasicMaterial({ color: 0xffd876 }));
    sunGrp.add(sunDot);
    sunGrp.add(S.makeGlow(1.15, "#FFD876", 0.16));
    const ringGeo = new T3.RingGeometry(0.42, 0.5, 40);
    const ring = new T3.Mesh(ringGeo, new T3.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.85, side: T3.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    sunGrp.add(ring);
    sunGrp.position.set(R_SUN * Math.cos(-0.55), 0.05, R_SUN * Math.sin(-0.55));
    scene.add(sunGrp);
    const sunLbl = S.makeLabel("태양계", { size: 1.05, color: "#FFE9A8" });
    sunLbl.position.set(sunGrp.position.x, 1.35, sunGrp.position.z);
    scene.add(sunLbl);

    // 히트 프록시(투명 구 — 탭 대상 넉넉히)
    const proxyMat = new T3.MeshBasicMaterial({ visible: false });
    const sunProxy = new T3.Mesh(new T3.SphereGeometry(1.35, 10, 10), proxyMat);
    sunProxy.position.copy(sunGrp.position);
    scene.add(sunProxy);
    const coreProxy = new T3.Mesh(new T3.SphereGeometry(2.3, 10, 10), proxyMat.clone());
    scene.add(coreProxy);

    // ── 눈금: 지름(10만 광년) 화살표 + 중심~태양계(3만 광년) 점선 ──
    const lineMat = new T3.LineBasicMaterial({ color: 0x8fa6d0, transparent: true, opacity: 0.8 });
    const diaGeo = new T3.BufferGeometry().setFromPoints([new T3.Vector3(-R_DISK, -1.7, 0), new T3.Vector3(R_DISK, -1.7, 0)]);
    scene.add(new T3.Line(diaGeo, lineMat));
    for (const sx of [-1, 1]) {
      const capGeo = new T3.BufferGeometry().setFromPoints([
        new T3.Vector3(sx * R_DISK, -1.7, 0), new T3.Vector3(sx * (R_DISK - 0.5), -1.45, 0),
        new T3.Vector3(sx * R_DISK, -1.7, 0), new T3.Vector3(sx * (R_DISK - 0.5), -1.95, 0),
      ]);
      scene.add(new T3.LineSegments(capGeo, lineMat));
    }
    const diaLbl = S.makeLabel("지름 약 10만 광년", { size: 1.0, color: "#C8D4F0" });
    diaLbl.position.set(0, -2.55, 0);
    scene.add(diaLbl);
    const sunLineGeo = new T3.BufferGeometry().setFromPoints([new T3.Vector3(0, 0.06, 0), sunGrp.position.clone().setY(0.06)]);
    const sunLine = new T3.Line(sunLineGeo, new T3.LineDashedMaterial({ color: 0xffd876, dashSize: 0.32, gapSize: 0.22, transparent: true, opacity: 0.9 }));
    sunLine.computeLineDistances();
    scene.add(sunLine);
    const distLbl = S.makeLabel("약 3만 광년", { size: 0.86, color: "#FFE9A8" });
    const mid = sunGrp.position.clone().multiplyScalar(0.52);
    distLbl.position.set(mid.x, 0.75, mid.z);
    scene.add(distLbl);
    const coreLbl = S.makeLabel("은하 중심", { size: 0.95, color: "#FFD9A0" });
    coreLbl.position.set(0, 2.6, 0);
    scene.add(coreLbl);

    // ── 카메라 ──
    function applyCamera(): void {
      const y = Math.sin(polar) * CAM_DIST;
      const rxz = Math.cos(polar) * CAM_DIST;
      camera.position.set(Math.cos(azim) * rxz, y, Math.sin(azim) * rxz);
      camera.lookAt(0, 0, 0);
    }
    applyCamera();

    // ── 입력: 드래그 회전 + 탭 판정 ──
    const onDown = (e: PointerEvent): void => {
      if (!rot) return;
      dragging = true;
      moved = 0;
      const p = rot.mapPoint(e);
      lastX = p.x;
      lastY = p.y;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    };
    const onMove = (e: PointerEvent): void => {
      if (!dragging || !rot) return;
      const p = rot.mapPoint(e);
      const dx = p.x - lastX;
      const dy = p.y - lastY;
      lastX = p.x;
      lastY = p.y;
      moved += Math.abs(dx) + Math.abs(dy);
      azim += dx * 0.0052;
      polar = clamp(polar + dy * 0.0046, 0.05, 1.5);
    };
    const onUp = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      if (moved < 9 && rot && THREE && st) {
        // 탭 — 레이캐스트
        const { w, h } = rot.size();
        const p = rot.mapPoint(e);
        const ray = new T3.Raycaster();
        ray.setFromCamera(new T3.Vector2((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1)), st.camera);
        const hits = ray.intersectObjects([sunProxy, coreProxy], false);
        if (hits.length) {
          haptic(HAPTIC.select);
          if (hits[0].object === sunProxy) {
            collect("sun", "3만 광년 지점!");
            showToast("여기가 우리 집 — 중심에서 약 3만 광년 떨어진 나선팔 변두리예요!");
          } else {
            collect("core", "= 은하수 방향!");
            photoCard.classList.add("show");
          }
        }
      }
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", () => (dragging = false));

    // ── 프레임 ──
    loop = createLoop((dt, tMs) => {
      if (!rot || !st || !THREE) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);
      applyCamera();

      // 태양계 링 펄스
      const pul = 1 + Math.sin(tMs / 380) * 0.16;
      ring.scale.setScalar(pul);

      // 시점 목표 판정 — 위(polar>1.25)·옆(polar<0.2) 600ms 유지
      if (polar > 1.25) {
        topMs += dt * 16.7;
        if (topMs > 600) collect("top", "나선팔이 보여요!");
      } else topMs = 0;
      if (polar < 0.2) {
        sideMs += dt * 16.7;
        if (sideMs > 600) {
          collect("side", "납작+불룩!");
          if (!goals.has("side")) showToast("");
        }
      } else sideMs = 0;

      // 상태 필
      const mode = polar > 1.25 ? "위에서 — 막대·나선팔" : polar < 0.2 ? "옆에서 — 납작한 원반 + 불룩한 중심" : "드래그 — 위·옆으로 돌려 보세요";
      if (pillText.textContent !== mode) pillText.textContent = mode;

      st.render();
    });
    loop.start();
    showToast("한 손가락 드래그로 관측선을 돌려 보세요!");
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
    rot?.dispose(); // 오버레이 제거 — 빠뜨리면 fixed 오버레이가 남아 아래 화면 터치를 전부 가로챈다
    rot = null;
    missionEls = [];
    if (finished) {
      helper.innerHTML =
        "관측 완료! <b>지름 10만 광년 · 태양계는 3만 광년 변두리 · 은하수 = 안에서 본 우리은하</b> — 정리로 넘어가요.";
    } else {
      helper.innerHTML = "아직 목표가 남았어요 — 다시 탑승해서 <b>위·옆 시점과 태양계·은하 중심</b>을 마저 찾아봐요!";
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("네 가지 목표를 모두 찾아요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

function enterArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <circle cx="34" cy="24" r="1.2" fill="#DCE8FF"/><circle cx="246" cy="18" r="1.2" fill="#DCE8FF"/>
    <circle cx="220" cy="78" r="1" fill="#DCE8FF"/><circle cx="66" cy="80" r="1" fill="#DCE8FF"/>
    <ellipse cx="140" cy="48" rx="86" ry="20" fill="#2A3C66" opacity=".85"/>
    <ellipse cx="140" cy="48" rx="86" ry="20" stroke="#44598C" stroke-width="1.4"/>
    <ellipse cx="140" cy="47" rx="30" ry="13" fill="#FFE0B0"/>
    <ellipse cx="140" cy="47" rx="16" ry="8" fill="#FFF2D8"/>
    <circle cx="188" cy="52" r="3.6" fill="#FFD876"/>
    <circle cx="188" cy="52" r="7" stroke="#FFE9A8" stroke-width="1.2" opacity=".7"/>
    <circle cx="84" cy="18" r="2.4" fill="#C8B8FF"/><circle cx="212" cy="14" r="2" fill="#C8B8FF"/><circle cx="52" cy="70" r="2" fill="#C8B8FF"/>
    <path d="M252 40l10 8-10 8" stroke="#8FB3E8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M104 78q36 12 72 0" stroke="#5B6BE8" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>
  </svg>`;
}
