// zodiacRing — 지구의 공전과 별자리 변화 3D 랩(VII 단원 L4). 교과서 그림 VII-8(247쪽)의 입체판.
//   · three.js: 태양(중심 광원) 둘레의 지구를 궤도에서 끌면 달(月)이 바뀌고,
//     "태양 쪽 별자리(못 봄)"와 "한밤중 남쪽 하늘 별자리(잘 봄)"가 실시간 표시된다.
//   · 태양 점광 덕에 지구의 밤낮 반구가 실제로 갈린다 — 밤 쪽에서 반대편 별자리를 본다는
//     개념이 그림이 아니라 조명으로 체험된다.
// 목표: ① 지구를 끌어 두 별자리 비교 ② 물고기자리가 태양 쪽인 달 찾기(4월)
//       ③ 궁수자리가 한밤에 잘 보이는 달 찾기(7월).

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import type { StepRenderer } from "../types";
import type { SpaceStage, THREE as T } from "../../ui/space3d";

interface ZodiacStep {
  title: string;
  lead?: string;
  cta?: string;
}

// index i = (i+1)월에 태양 쪽에 있는 별자리(그림 VII-8)
const ZODIAC = ["궁수", "염소", "물병", "물고기", "양", "황소", "쌍둥이", "게", "사자", "처녀", "천칭", "전갈"];

const ORBIT_R = 5.2;
const RING_R = 11;

// 별자리 스틱 그림 — 꼭짓점이 별, 선이 이어진 모양(간략화한 성좌선).
// 좌표는 0..1 정규화, l = 잇는 별 인덱스 쌍.
const SHAPES: Record<string, { p: [number, number][]; l: [number, number][] }> = {
  궁수: { // 주전자(teapot) 모양
    p: [[0.32, 0.45], [0.58, 0.42], [0.66, 0.62], [0.34, 0.66], [0.45, 0.28], [0.78, 0.3], [0.18, 0.52]],
    l: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1], [1, 5], [0, 6], [6, 3]],
  },
  염소: { // 웃는 입꼬리 삼각(고전 모양)
    p: [[0.18, 0.35], [0.35, 0.55], [0.55, 0.62], [0.75, 0.5], [0.82, 0.32]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  물병: { // 물결 두 줄
    p: [[0.2, 0.38], [0.35, 0.28], [0.5, 0.38], [0.65, 0.28], [0.8, 0.38], [0.2, 0.65], [0.35, 0.55], [0.5, 0.65], [0.65, 0.55], [0.8, 0.65]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  물고기: { // V자 끈 + 양 끝 물고기 고리
    p: [[0.22, 0.3], [0.37, 0.5], [0.5, 0.64], [0.63, 0.5], [0.78, 0.3], [0.14, 0.24], [0.26, 0.18], [0.86, 0.24], [0.74, 0.18]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 0], [4, 7], [7, 8], [8, 4]],
  },
  양: { // 완만한 호 끝이 꺾인 뿔
    p: [[0.15, 0.58], [0.4, 0.44], [0.65, 0.4], [0.85, 0.5], [0.8, 0.66]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  황소: { // V자 얼굴 + 긴 뿔
    p: [[0.14, 0.2], [0.42, 0.52], [0.5, 0.68], [0.58, 0.52], [0.86, 0.16]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  쌍둥이: { // 나란한 두 사람
    p: [[0.32, 0.2], [0.32, 0.5], [0.3, 0.8], [0.64, 0.18], [0.66, 0.5], [0.68, 0.8]],
    l: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4]],
  },
  게: { // 거꾸로 된 Y
    p: [[0.5, 0.26], [0.5, 0.52], [0.28, 0.74], [0.72, 0.74]],
    l: [[0, 1], [1, 2], [1, 3]],
  },
  사자: { // 낫(갈기) + 꼬리 삼각
    p: [[0.24, 0.32], [0.33, 0.2], [0.44, 0.24], [0.47, 0.4], [0.37, 0.5], [0.55, 0.6], [0.8, 0.54], [0.74, 0.74]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 5]],
  },
  처녀: { // Y + 치맛자락
    p: [[0.3, 0.18], [0.46, 0.4], [0.66, 0.24], [0.5, 0.56], [0.34, 0.76], [0.62, 0.78]],
    l: [[0, 1], [2, 1], [1, 3], [3, 4], [3, 5]],
  },
  천칭: { // 저울 삼각 + 다리
    p: [[0.5, 0.24], [0.26, 0.48], [0.74, 0.48], [0.3, 0.74], [0.7, 0.74]],
    l: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]],
  },
  전갈: { // 길게 휘는 꼬리와 독침
    p: [[0.18, 0.24], [0.28, 0.4], [0.34, 0.56], [0.44, 0.7], [0.6, 0.76], [0.74, 0.7], [0.8, 0.56], [0.72, 0.46]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
};

/** 별자리 스틱 그림 스프라이트(흰색으로 그려 material.color로 틴트). */
function constellationTexture(name: string): HTMLCanvasElement {
  const S = 112;
  const pad = 10;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const shape = SHAPES[name] ?? SHAPES["게"];
  const px = (f: number): number => pad + f * (S - pad * 2);
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (const [a, b] of shape.l) {
    ctx.beginPath();
    ctx.moveTo(px(shape.p[a][0]), px(shape.p[a][1]));
    ctx.lineTo(px(shape.p[b][0]), px(shape.p[b][1]));
    ctx.stroke();
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(255,255,255,.9)";
  ctx.shadowBlur = 5;
  for (const [fx, fy] of shape.p) {
    ctx.beginPath();
    ctx.arc(px(fx), px(fy), 3.1, 0, Math.PI * 2);
    ctx.fill();
  }
  return cv;
}

export const zodiacRing: StepRenderer = (host, step, api) => {
  const s = step as unknown as ZodiacStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const canvas = el("canvas", { class: "mstage-cvblock", style: "height:340px" }) as HTMLCanvasElement;
  const monthPill = el("span", { text: "지구를 끌어 보세요" });
  const cap = el("div", { class: "stage-cap", text: "파란 지구를 잡아 궤도를 따라 끌어요" });
  const stage = el(
    "div",
    { class: "stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: "background:#5AA2F8" }), monthPill)),
    cap,
  );

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "look" } }, el("b", { text: "두 별자리" }), el("span", { text: "비교하기" })),
    el("div", { class: "pn-badge", dataset: { g: "fish" } }, el("b", { text: "물고기자리" }), el("span", { text: "태양 쪽인 달?" })),
    el("div", { class: "pn-badge", dataset: { g: "archer" } }, el("b", { text: "궁수자리" }), el("span", { text: "한밤에 보려면?" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "지구는 태양 둘레를 <b>1년에 한 바퀴</b> 돌아요(공전). 지구를 끌면서 — <b>태양 쪽</b> 별자리와 <b>반대쪽</b> 별자리가 어떻게 바뀌는지 보세요!",
  });
  host.append(goalChips, stage, helper);

  // ---- 상태 ----
  let month = 0; // 0 = 1월
  let earthA = Math.PI; // 지구 각도(= 1월 위치)
  let dragging = false;
  let dragDeg = 0;
  let lastA = earthA;
  let capFaded = false;
  let holdFish = 0;
  let holdArcher = 0;
  const goals = new Set<string>();
  let finished = false;
  let disposed = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    const hints: Record<string, string> = {
      look: "느낌이 오죠? <b>태양 쪽 별자리는 태양 빛 때문에 못 보고</b>, 반대쪽 별자리는 <b>한밤중 남쪽 하늘</b>에서 잘 보여요. 이제 <b>물고기자리가 태양 쪽</b>이 되는 달을 찾아보세요!",
      fish: "4월이에요! 그럼 반대로, <b>궁수자리를 한밤중에</b> 보고 싶다면 몇 월로 가야 할까요?",
      archer: "7월! 궁수자리의 <b>반대쪽(태양 쪽)엔 쌍둥이자리</b>가 있죠. 태양이 걸린 별자리는 여름에, 그 별자리는 겨울에 잘 보이는 식이에요.",
    };
    if (!finished) helper.innerHTML = hints[id] ?? "";
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! 지구가 <b>공전</b>하니 태양이 걸려 있는 별자리(황도 12궁)가 달마다 바뀌고, 그래서 <b>계절마다 잘 보이는 별자리가 달라져요</b>. 태양이 별자리 사이를 1년에 한 바퀴 도는 것처럼 보이는 걸 <b>연주 운동</b>이라 해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }

  // ---- three.js 씬(동적 로드) ----
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let earth: T.Mesh | null = null;
  let earthHalo: T.Sprite | null = null;
  let loop: Loop | null = null;
  const figures: T.Sprite[] = [];
  const labels: T.Sprite[] = [];
  let sunLine: T.Line | null = null;
  let nightLine: T.Line | null = null;
  let sunTag: T.Sprite | null = null;
  let nightTag: T.Sprite | null = null;

  const posOf = (a: number, r: number): [number, number, number] => [Math.cos(a) * r, 0, -Math.sin(a) * r];

  void (async () => {
    const S = await import("../../ui/space3d");
    if (disposed) return;
    THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 46 });
    if (!st) {
      stage.classList.add("sp3-fallback");
      helper.innerHTML =
        "이 기기에서 3D를 켤 수 없어요. 그림으로 기억해요 — 지구가 공전하면 <b>태양 쪽 별자리(못 봄)</b>와 <b>반대쪽 별자리(한밤에 잘 봄)</b>가 달마다 바뀌어요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(650, 150));

    // 태양(중심) — 점광이 지구의 밤낮을 가른다
    const sunBall = S.makePlanet("sun", 1.5, 40);
    scene.add(sunBall);
    const sunGlow = S.makeGlow(9, "rgba(255,190,80,.85)", 0.14);
    scene.add(sunGlow);
    scene.add(new THREE.PointLight(0xfff2dc, 2.6, 0, 0));
    scene.add(new THREE.AmbientLight(0x3c4c6c, 0.75));

    // 지구 궤도 + 지구
    scene.add(S.makeOrbitLine(ORBIT_R, "#6E8CB8", 0.5, 128));
    earth = S.makePlanet("earth", 0.62, 48);
    scene.add(earth);
    earthHalo = S.makeGlow(2.6, "rgba(140,180,255,.4)", 0.3);
    scene.add(earthHalo);

    // 황도 12궁 — 별자리 스틱 그림(꼭짓점 별 + 성좌선) + 이름 라벨(안쪽)
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      const [cx, , cz] = posOf(a, RING_R);
      const tex = new THREE.CanvasTexture(constellationTexture(ZODIAC[k]));
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: tex, color: 0xbfd2f0, transparent: true, opacity: 0.95, depthWrite: false });
      const figure = new THREE.Sprite(mat);
      figure.position.set(cx, 0.5, cz);
      figure.scale.setScalar(3.1);
      scene.add(figure);
      figures.push(figure);
      const label = S.makeLabel(`${ZODIAC[k]}자리`, { size: 1.5 });
      const [lx, , lz] = posOf(a, RING_R - 2.9);
      label.position.set(lx, 0.1, lz);
      scene.add(label);
      labels.push(label);
    }

    // 시선(지구→태양 쪽 / 지구→한밤 쪽) + 설명 태그
    const T3 = S.THREE;
    const mkLine = (color: number, opacity: number): T.Line => {
      const geo = new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3()]);
      const line = new T3.Line(geo, new T3.LineBasicMaterial({ color, transparent: true, opacity }));
      scene.add(line);
      return line;
    };
    sunLine = mkLine(0xffaa50, 0.55);
    nightLine = mkLine(0x8cbeff, 0.6);
    sunTag = S.makeLabel("태양 쪽 — 못 봐요", { size: 1.35, color: "#FFC896" });
    nightTag = S.makeLabel("한밤 남쪽 — 잘 보여요", { size: 1.35, color: "#BCD8FF" });
    scene.add(sunTag, nightTag);

    // 카메라 — 비스듬히 내려다보는 입체 시점
    camera.position.set(0, 24.5, 15.5);
    camera.lookAt(0, 0, 0);

    loop = createLoop((dt) => frame(dt));
    loop.start();
  })();

  // ---- 입력: 지구 드래그(y=0 평면 레이캐스트 → 각도) ----
  function pointerAngle(e: PointerEvent): number | null {
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
    const a = pointerAngle(e);
    if (a == null) return;
    dragging = true;
    lastA = a;
    if (!capFaded) {
      capFaded = true;
      cap.classList.add("fade");
    }
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 */
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    if (a == null) return;
    let d = a - lastA;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    earthA += d;
    dragDeg += Math.abs((d * 180) / Math.PI);
    lastA = a;
    if (dragDeg > 55) collect("look", "달라진다!");
  });
  const up = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  // ---- 프레임 ----
  function frame(dt: number): void {
    if (!st || !THREE || !earth || !earthHalo) return;
    const w = canvas.clientWidth || 340;
    st.resize(w, 340);

    // 달 계산(2D 버전과 동일한 각도 규약)
    const norm = ((earthA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sunSideA = norm + Math.PI;
    month = Math.round((((sunSideA / (Math.PI * 2)) * 12) % 12 + 12) % 12) % 12;
    monthPill.textContent = `${month + 1}월 — 태양 쪽 ${ZODIAC[month]}자리`;

    const [ex, , ez] = posOf(norm, ORBIT_R);
    earth.position.set(ex, 0, ez);
    earth.rotation.y += 0.02 * dt;
    earthHalo.position.set(ex, 0, ez);
    earthHalo.material.opacity = dragging ? 0.85 : 0.5;

    // 별자리 상태(태양 쪽 = 흐리게 / 한밤 쪽 = 금빛)
    const nightK = (month + 6) % 12;
    for (let k = 0; k < 12; k++) {
      const fm = figures[k].material as T.SpriteMaterial;
      const lm = labels[k].material as T.SpriteMaterial;
      if (k === month) {
        fm.color.set(0x6a7690);
        fm.opacity = 0.5;
        lm.color.set(0x8892aa);
      } else if (k === nightK) {
        fm.color.set(0xffe08c);
        fm.opacity = 1;
        lm.color.set(0xffe9ae);
      } else {
        fm.color.set(0xbfd2f0);
        fm.opacity = 0.95;
        lm.color.set(0xffffff);
      }
    }

    // 시선 두 줄 + 태그
    const [sx, , sz] = posOf(sunSideA, RING_R - 1.2);
    const [nx2, , nz2] = posOf(norm, RING_R - 1.2);
    const setLine = (line: T.Line, x2: number, z2: number): void => {
      const pos = line.geometry.attributes.position as T.BufferAttribute;
      pos.setXYZ(0, ex, 0, ez);
      pos.setXYZ(1, x2, 0, z2);
      pos.needsUpdate = true;
    };
    setLine(sunLine!, sx, sz);
    setLine(nightLine!, nx2, nz2);
    sunTag!.position.set((ex + sx * 1.6) / 2.6, 1.5, (ez + sz * 1.6) / 2.6);
    nightTag!.position.set((ex + nx2 * 1.6) / 2.6, 1.5, (ez + nz2 * 1.6) / 2.6);

    // 목표 홀드 판정
    if (goals.has("look") && month === 3) {
      holdFish += dt * 16.7;
      if (holdFish > 480) collect("fish", "4월!");
    } else holdFish = 0;
    if (goals.has("fish") && month === 6) {
      holdArcher += dt * 16.7;
      if (holdArcher > 480) collect("archer", "7월!");
    } else holdArcher = 0;

    st.render();
  }

  api.setCTA("지구를 돌려 별자리를 찾아요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
  };
};
