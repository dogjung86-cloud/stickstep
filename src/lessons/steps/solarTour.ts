// solarTour — 태양계 3D 가로 투어(VII 단원 L1). 교과서 그림 VII-1(230~231쪽)의 입체판.
//   · 가로 모드(rotateStage): 태양부터 해왕성까지 한 줄로 늘어선 태양계를
//     좌우로 쓸어 순항하고, 천체를 탭하면 다가가서 특징 카드를 읽는다.
//   · 달(지구의 위성)·소행성대(화성~목성 사이)·혜성(꼬리는 태양 반대쪽!)까지 배치.
// 목표: ① 지구형 행성 2곳 방문 ② 목성형 행성 2곳 방문 ③ 혜성 꼬리 확인.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";
import type { SpaceStage, THREE as T, PlanetKind } from "../../ui/space3d";
import type { RotateStage } from "../../ui/rotateStage";

interface TourStep {
  title: string;
  lead?: string;
  cta?: string;
}

interface Body {
  key: string;
  kind: PlanetKind;
  name: string;
  x: number;
  r: number;
  group: "star" | "terra" | "jovian" | "etc";
  fact: string;
}

const BODIES: Body[] = [
  { key: "sun", kind: "sun", name: "태양", x: 0, r: 15, group: "star", fact: "태양계에서 <b>유일하게 스스로 빛을 내는</b> 천체예요. 주로 수소와 헬륨으로 이루어져 있어요." },
  { key: "mercury", kind: "mercury", name: "수성", x: 33, r: 1.1, group: "terra", fact: "대기가 거의 없어서 <b>낮과 밤의 온도 차가 매우 커요</b>. 표면에는 운석 구덩이가 많아요." },
  { key: "venus", kind: "venus", name: "금성", x: 50, r: 1.7, group: "terra", fact: "<b>이산화 탄소로 이루어진 두꺼운 대기</b>가 있어서 표면 온도가 매우 높아요." },
  { key: "earth", kind: "earth", name: "지구", x: 69, r: 1.8, group: "terra", fact: "표면에 <b>액체 상태의 물</b>이 있고, 생명체가 살아요. 옆을 도는 달은 지구의 <b>위성</b>!" },
  { key: "mars", kind: "mars", name: "화성", x: 88, r: 1.4, group: "terra", fact: "<b>붉은 표면</b> — 과거에 물이 흘렀던 흔적이 있고, 얼음과 드라이아이스로 된 <b>극관</b>이 있어요." },
  { key: "jupiter", kind: "jupiter", name: "목성", x: 134, r: 6.4, group: "jovian", fact: "태양계에서 <b>가장 큰 행성</b>. 줄무늬와 <b>대적점</b>(거대한 대기 소용돌이)이 보여요." },
  { key: "saturn", kind: "saturn", name: "토성", x: 168, r: 5.5, group: "jovian", fact: "<b>뚜렷한 고리</b>를 두르고 있어요. 위성도 아주 많답니다." },
  { key: "uranus", kind: "uranus", name: "천왕성", x: 197, r: 3.2, group: "jovian", fact: "청록색 행성. <b>자전축이 공전 궤도면과 거의 나란</b>해서 누워서 도는 셈이에요 — 고리도 세로로!" },
  { key: "neptune", kind: "neptune", name: "해왕성", x: 220, r: 3.1, group: "jovian", fact: "파란 행성. <b>대흑점</b>이라는 대기의 소용돌이가 나타나요." },
];

export const solarTour: StepRenderer = (host, step, api) => {
  const s = step as unknown as TourStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "terra" } }, el("b", { text: "안쪽 행성" }), el("span", { text: "2곳 방문" })),
    el("div", { class: "pn-badge", dataset: { g: "jovian" } }, el("b", { text: "바깥 행성" }), el("span", { text: "2곳 방문" })),
    el("div", { class: "pn-badge", dataset: { g: "comet" } }, el("b", { text: "혜성" }), el("span", { text: "꼬리 방향?" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: tourArtSvg() }),
    el("div", { class: "sp3-enter-txt", html: "태양부터 해왕성까지 <b>한 줄로 늘어선 태양계</b>를 순항해요.<br>화면이 자동으로 <b>가로</b>로 돌아가요." }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 출발하기" }));
  const helper = el("div", {
    class: "helper",
    html: "좌우로 <b>쓸어서</b> 이동하고, 천체를 <b>탭</b>하면 가까이 가서 소개 카드를 읽을 수 있어요. 혜성도 찾아보세요!",
  });
  host.append(goalChips, preview, enterBtn, helper);

  const visited = new Set<string>();
  const goals = new Set<string>();
  let finished = false;

  function checkGoals(): void {
    const terra = ["mercury", "venus", "earth", "mars"].filter((k) => visited.has(k)).length;
    const jovian = ["jupiter", "saturn", "uranus", "neptune"].filter((k) => visited.has(k)).length;
    const put = (id: string, subText: string): void => {
      if (goals.has(id)) return;
      goals.add(id);
      const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
      chip.classList.add("on");
      chip.querySelector("span")!.textContent = subText;
      haptic(HAPTIC.ctaUnlock);
    };
    if (terra >= 2) put("terra", "암석 표면!");
    if (jovian >= 2) put("jovian", "크고 기체!");
    if (visited.has("comet")) put("comet", "태양 반대쪽!");
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "투어 완료! 태양 둘레에는 <b>행성 8개</b>와 위성·소행성·혜성·왜소 행성이 함께 돌아요. 안쪽 행성과 바깥 행성이 <b>서로 닮은꼴로 두 무리</b>라는 것, 눈치챘나요? 다음 시간에 분류해 봐요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- 가로 스테이지 + 3D ----
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let loop: Loop | null = null;
  let disposed = false;

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "태양계 순항 — 쓸어서 이동 · 탭해서 방문", onLeave: () => leave() });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    const pill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), el("span", { text: "방문 0곳" }));
    const card = el("div", { class: "sp3-card" });
    rot.stage.append(canvas, pill, card);
    const pillText = pill.querySelectorAll("span")[1] as HTMLElement;

    const S = await import("../../ui/space3d");
    if (disposed || !rot) return;
    const THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 38 });
    if (!st) {
      pillText.textContent = "이 기기는 3D를 지원하지 않아요";
      helper.innerHTML = "3D를 켤 수 없어요. 표로 기억해요 — 태양 곁부터 <b>수·금·지·화·목·토·천·해</b> 8개 행성이 돌고 있어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(1000, 320));
    // 투어는 전시 조명 — 좌상단·카메라 쪽에서 키라이트 + 넉넉한 앰비언트(행성 정면이 늘 밝게)
    const sunLight = new THREE.DirectionalLight(0xfff2dc, 2.1);
    sunLight.position.set(-60, 40, 90);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x4a5a78, 1.0));

    const meshes = new Map<string, T.Object3D>();
    for (const b of BODIES) {
      const m = S.makePlanet(b.kind, b.r, b.r > 4 ? 56 : 40);
      m.position.set(b.x, 0, 0);
      m.userData.key = b.key;
      scene.add(m);
      meshes.set(b.key, m);
      if (b.key === "sun") {
        const glow = S.makeGlow(58, "rgba(255,180,70,.85)", 0.14);
        glow.position.set(0, 0, 0);
        scene.add(glow);
      }
      if (b.key === "saturn") {
        const ring = S.makeRing(b.r * 1.35, b.r * 2.1, "saturn");
        ring.rotation.x = -Math.PI / 2 + 0.42;
        m.add(ring);
      }
      if (b.key === "uranus") {
        const ring = S.makeRing(b.r * 1.4, b.r * 1.9, "faint");
        m.add(ring);
        m.rotation.z = Math.PI / 2 - 0.14; // 자전축이 궤도면과 나란 — 고리가 세로로 선다
        (ring as T.Mesh).rotation.x = -Math.PI / 2;
      }
    }
    // 달(지구 위성)
    const moon = S.makePlanet("moon", 0.5, 28);
    moon.userData.key = "moon";
    scene.add(moon);
    meshes.set("moon", moon);
    // 소행성대(화성~목성 사이 띠) + 히트 프록시
    const beltGeo = new THREE.BufferGeometry();
    const beltN = 240;
    const bp = new Float32Array(beltN * 3);
    const rnd = (a: number, b2: number): number => a + Math.random() * (b2 - a);
    for (let i = 0; i < beltN; i++) {
      bp[i * 3] = rnd(100, 118);
      bp[i * 3 + 1] = rnd(-2.4, 2.4);
      bp[i * 3 + 2] = rnd(-6, 6);
    }
    beltGeo.setAttribute("position", new THREE.BufferAttribute(bp, 3));
    const belt = new THREE.Points(beltGeo, new THREE.PointsMaterial({ color: 0x9aa6ba, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.85 }));
    scene.add(belt);
    const beltProxy = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    beltProxy.position.set(109, 0, 0);
    beltProxy.userData.key = "belt";
    scene.add(beltProxy);
    meshes.set("belt", beltProxy);
    // 혜성 + 꼬리(태양 반대쪽으로 8개 글로우) — 작고 움직여서 탭 판정용 프록시를 크게 둔다
    const comet = S.makePlanet("moon", 0.55, 20);
    comet.userData.key = "comet";
    scene.add(comet);
    meshes.set("comet", comet);
    const cometProxy = new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    cometProxy.userData.key = "comet";
    scene.add(cometProxy);
    const tail: T.Sprite[] = [];
    for (let i = 0; i < 8; i++) {
      const sp = S.makeGlow(2.2 - i * 0.2, "rgba(150,210,255,.55)", 0.25);
      sp.material.opacity = 0.8 - i * 0.09;
      scene.add(sp);
      tail.push(sp);
    }

    const EXTRA: Record<string, { name: string; fact: string }> = {
      moon: { name: "달", fact: "지구 주위를 도는 <b>위성</b>이에요. 위성은 태양이 아니라 <b>행성</b> 주위를 돌아요!" },
      belt: { name: "소행성대", fact: "모양이 불규칙한 소행성들이 잔뜩! 주로 <b>화성과 목성의 공전 궤도 사이</b>에 있어요." },
      comet: { name: "혜성", fact: "얼음과 먼지 덩어리. 태양에 가까워지면 녹으면서 꼬리가 생기는데, 꼬리는 늘 <b>태양 반대쪽</b>을 향해요!" },
    };

    let camX = 27;
    let vx = 0;
    let focus: string | null = null;
    let camPos = new THREE.Vector3(camX, 5, 34);
    let camTarget = new THREE.Vector3(camX, 0, 0);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);

    // ---- 입력: 팬 + 탭 ----
    let downP: { x: number; y: number } | null = null;
    let lastPX = 0;
    let moved = false;
    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      downP = p;
      lastPX = p.x;
      moved = false;
      vx = 0;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!downP || !rot) return;
      const p = rot.mapPoint(e);
      if (Math.hypot(p.x - downP.x, p.y - downP.y) > 8) moved = true;
      if (moved && !focus) {
        const dx = p.x - lastPX;
        camX = clamp(camX - dx * 0.075, -8, 232);
        vx = -dx * 0.075;
      }
      lastPX = p.x;
    });
    const up = (e: PointerEvent): void => {
      if (!rot || !st) {
        downP = null;
        return;
      }
      if (downP && !moved) {
        // 탭 → 천체 선택
        const { w, h } = rot.size();
        const p = rot.mapPoint(e);
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1)), st.camera);
        const hits = ray.intersectObjects([...meshes.values(), cometProxy], false);
        if (hits.length) {
          const key = hits[0].object.userData.key as string;
          openCard(key);
        } else if (focus) {
          closeCard();
        }
      }
      downP = null;
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", () => {
      downP = null;
    });

    function openCard(key: string): void {
      focus = key;
      const b = BODIES.find((x) => x.key === key);
      const info = b ? { name: b.name, fact: b.fact } : EXTRA[key];
      if (!info) return;
      visited.add(key);
      haptic(HAPTIC.select);
      card.innerHTML = "";
      card.append(
        el("b", { text: info.name }),
        el("p", { html: info.fact }),
        el("button", { class: "sp3-cardclose", attrs: { type: "button" }, text: "계속 순항하기" }),
      );
      card.classList.add("show");
      (card.querySelector(".sp3-cardclose") as HTMLButtonElement).addEventListener("click", closeCard);
      pillText.textContent = `방문 ${visited.size}곳 — ${info.name}`;
      checkGoals();
    }
    function closeCard(): void {
      if (focus) {
        const obj = meshes.get(focus);
        if (obj) camX = clamp(obj.position.x, -8, 232);
      }
      focus = null;
      card.classList.remove("show");
      haptic(HAPTIC.tap);
    }

    // ---- 프레임 ----
    let t = 0;
    loop = createLoop((dt) => {
      if (!rot || !st) return;
      t += dt * 16.7;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);

      // 자전·위성·혜성
      for (const b of BODIES) {
        const m = meshes.get(b.key)!;
        if (b.key !== "sun") m.rotation.y += 0.0045 * dt;
        else m.rotation.y += 0.0012 * dt;
      }
      const earthM = meshes.get("earth")!;
      const ma = t * 0.0011;
      moon.position.set(earthM.position.x + Math.cos(ma) * 3.6, 0.3, Math.sin(ma) * 3.6);
      moon.rotation.y += 0.004 * dt;
      // 혜성 — 태양을 도는 길쭉한 타원 궤도
      const ca = t * 0.00028 + 1.2;
      const cx = 62 + Math.cos(ca) * 74;
      const cz = -Math.sin(ca) * 26 - 14;
      comet.position.set(cx, 1.6, cz);
      cometProxy.position.copy(comet.position);
      const away = new THREE.Vector3(cx, 1.6, cz).sub(new THREE.Vector3(0, 0, 0)).normalize();
      tail.forEach((sp, i) => {
        sp.position.set(cx + away.x * (i + 1) * 1.5, 1.6 + away.y, cz + away.z * (i + 1) * 1.5);
      });

      // 카메라
      if (focus) {
        const obj = meshes.get(focus)!;
        const r = (BODIES.find((x) => x.key === focus)?.r ?? 2) + 1;
        camPos = new THREE.Vector3(obj.position.x + r * 0.7, r * 1.1, r * 3.6 + 3.5);
        camTarget = obj.position.clone();
      } else {
        if (!downP) {
          camX = clamp(camX + vx * dt, -8, 232);
          vx *= Math.max(0, 1 - 0.06 * dt);
        }
        camPos = new THREE.Vector3(camX, 5, 34);
        camTarget = new THREE.Vector3(camX, 0, 0);
        pillText.textContent = visited.size ? `방문 ${visited.size}곳 — 천체를 탭!` : "천체를 탭해 보세요";
      }
      st.camera.position.lerp(camPos, Math.min(1, 0.11 * dt));
      st.camera.lookAt(camTarget);
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
      enterBtn.querySelector("span")!.textContent = "다시 순항하기";
      enterBtn.classList.remove("pulse");
    } else {
      helper.innerHTML = "아직 방문할 곳이 남았어요 — 다시 출발해서 <b>목표 세 개</b>를 채워 봐요!";
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("태양계를 순항해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

function tourArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="tr-sun" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFE9A8"/><stop offset=".6" stop-color="#FFC24E"/><stop offset="1" stop-color="#F59E2C"/>
      </radialGradient>
      <linearGradient id="tr-jup" x1="0" y1="-10" x2="0" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#EADFC6"/><stop offset=".5" stop-color="#D3AC7C"/><stop offset="1" stop-color="#A9714C"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0B1524"/>
    <circle cx="36" cy="20" r="1.2" fill="#DCE8FF"/><circle cx="240" cy="18" r="1.2" fill="#DCE8FF"/>
    <circle cx="200" cy="80" r="1" fill="#DCE8FF"/><circle cx="130" cy="12" r="1" fill="#DCE8FF"/>
    <circle cx="-6" cy="48" r="34" fill="url(#tr-sun)"/>
    <circle cx="52" cy="48" r="3" fill="#9C9894"/>
    <circle cx="72" cy="48" r="4.6" fill="#E2B96B"/>
    <circle cx="94" cy="48" r="4.8" fill="#2E6FD4"/>
    <circle cx="115" cy="48" r="3.8" fill="#C05B3C"/>
    <circle cx="152" cy="48" r="13" fill="url(#tr-jup)"/>
    <g transform="translate(196 48) rotate(-14)">
      <circle r="10" fill="#E8D9A8"/>
      <ellipse rx="17" ry="4.6" stroke="#D9C08A" stroke-width="2.6"/>
    </g>
    <circle cx="232" cy="48" r="7" fill="#8FD8DD"/>
    <circle cx="258" cy="48" r="6.6" fill="#3D63D2"/>
    <path d="M120 78q30-8 60 0" stroke="#3D5378" stroke-width="1.6" stroke-dasharray="3 4"/>
  </svg>`;
}
