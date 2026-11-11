// u7ZodiacLab: 지구의 공전과 별자리(u7l4). 교과서 "계절에 따라 보이는 별자리가 달라지는 까닭 알아보기"(246쪽)를 손으로 한다.
//   교과서: 가운데 전등(태양), 둘레에 별자리판 넷. 관찰자(지구)가 회전의자로 전등 둘레를 돌며
//           자리마다 전등 쪽에 있는 별자리와 전등 반대쪽에 있는 별자리를 적는다.
//   랩   : 지구를 태양 둘레에서 옮기면 태양 쪽 별자리와 한밤중에 보이는 별자리가 그 자리에서 바뀐다(황도 12궁, 그림 Ⅶ-8).
// 무대는 정본 zodiacRing의 3D(태양 빛이 지구의 낮과 밤을 가른다)를 살리고 틀과 흐름을 고쳤다:
//   한 화면 · 별자리 이름은 3D 글자 대신 화면 글자(12.5px)로 따라붙는다 · 읽을 값(태양 쪽, 한밤중)은 조작 칸 맨 위 두 줄
//   · 같은 별자리(궁수자리)가 한밤중에 보이는 달과 안 보이는 달을 차례로 찾는다 · 까닭은 판정으로, 결론은 조작 칸에.
// 무대 어디를 눌러도 지구가 그 방향으로 온다.

import { el } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import { bvCapture } from "../bio6/b6Lab";
import { u7Frame, u7Goals, u7Dev } from "./kit";
import { ZODIAC, constellationTexture } from "./zodiacShapes";

interface ZodiacStep {
  title: string;
  cta?: string;
}

const ORBIT_R = 5.4;
const RING_R = 11;
const TARGET = 0; // 궁수자리

export const u7ZodiacLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ZodiacStep;
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-zodiac", api });
  const doneCta = s.cta ?? "개념 정리하기";

  const canvas = el("canvas", { class: "u7x-cv" }) as HTMLCanvasElement;
  const pill = el("div", { class: "bv-pill u7x-pill", text: "1월" });
  const names = ZODIAC.map((n) => el("span", { class: "u7x-zname", text: n }));
  const nameLayer = el("div", { class: "u7x-znames", attrs: { "aria-hidden": "true" } }, ...names);
  f.stage.append(canvas, nameLayer, pill);

  const sunRow = el("b", { text: "궁수자리" });
  const nightRow = el("b", { text: "쌍둥이자리" });
  const read = el(
    "div",
    { class: "u7x-read" },
    el("div", { class: "u7x-read-row sun" }, el("span", { text: "태양 쪽" }), sunRow, el("i", { text: "햇빛에 묻혀 안 보여요" })),
    el("div", { class: "u7x-read-row night" }, el("span", { text: "한밤중 남쪽" }), nightRow, el("i", { text: "잘 보여요" })),
  );
  const goals = u7Goals(2, [
    { id: "night", name: "궁수자리가 한밤중에", sub: "몇 월일까요" },
    { id: "sun", name: "궁수자리가 태양 쪽에", sub: "몇 월일까요" },
  ]);
  f.slot.setControls(read, goals.el);
  f.say("<b>지구</b>를 끌어 태양 둘레를 돌려 보세요. 아래 두 줄이 어떻게 바뀌나요?");
  f.pips(1);
  api.setCTA("지구를 옮겨 별자리를 찾아요", { enabled: false });

  let earthA = Math.PI; // 1월 자리
  let month = 0;
  let dragging = false;
  let lastA = earthA;
  let moved = 0;
  let hold = 0;
  let phase: "free" | "night" | "sun" | "wait" | "ask" | "done" = "free";
  let disposed = false;
  host.dataset.u7Phase = phase;

  const setPhase = (p: typeof phase): void => {
    phase = p;
    host.dataset.u7Phase = p;
  };

  function conclude(): void {
    setPhase("done");
    f.pips(4);
    f.say("지구를 더 돌려 보며 다른 달의 별자리도 확인해 보세요.");
    f.slot.conclude("지구가 태양 둘레를 <b>1년에 한 바퀴</b> 돌아요(공전). 그래서 태양 쪽 별자리와 <b>한밤중에 보이는 별자리</b>가 달마다 바뀌어, 계절마다 보이는 별자리가 달라져요.");
    api.enableCTA(doneCta);
  }

  function ask(): void {
    setPhase("ask");
    f.pips(3);
    f.say("7월에는 한밤중에 보이던 궁수자리가 1월에는 태양 쪽에 있어요.");
    f.slot.ask(
      "1월에 <b>궁수자리를 볼 수 없는</b> 까닭은 무엇일까요?",
      [{ t: "태양과 같은 쪽에 있어서", ok: true }, { t: "지구 그림자에 가려서" }, { t: "별자리가 사라져서" }],
      (ok) => api.recordQuiz(ok),
      { why: "태양 쪽 별자리는 낮 하늘에 떠서 햇빛에 묻혀요.", onNext: conclude },
    );
  }

  // ---- 3D(동적 로드) ----
  let st: SpaceStage | null = null;
  let THREE: typeof T | null = null;
  let earth: T.Mesh | null = null;
  let halo: T.Sprite | null = null;
  let loop: Loop | null = null;
  const figures: T.Sprite[] = [];
  let sunLine: T.Line | null = null;
  let nightLine: T.Line | null = null;
  const posOf = (a: number, r: number): [number, number, number] => [Math.cos(a) * r, 0, -Math.sin(a) * r];

  void (async () => {
    const S = await import("../../../ui/space3d");
    if (disposed) return;
    const T3 = S.THREE;
    THREE = T3;
    st = S.createSpaceStage(canvas, { fov: 46 });
    if (!st) {
      f.stage.classList.add("u7x-fallback");
      api.recordQuiz(true);
      conclude();
      f.say("이 기기에서는 입체 무대를 켤 수 없어요. 아래 글로 알아 두세요.");
      return;
    }
    const { scene, camera } = st;
    scene.add(S.makeStars(500, 150));
    scene.add(S.makePlanet("sun", 1.5, 40));
    scene.add(S.makeGlow(8, "rgba(255,190,80,.85)", 0.14));
    scene.add(new T3.PointLight(0xfff2dc, 2.6, 0, 0));
    scene.add(new T3.AmbientLight(0x3c4c6c, 0.75));
    scene.add(S.makeOrbitLine(ORBIT_R, "#7C98C4", 0.6, 128));
    earth = S.makePlanet("earth", 1.05, 48);
    scene.add(earth);
    halo = S.makeGlow(3.6, "rgba(150,190,255,.5)", 0.34);
    scene.add(halo);
    for (let k = 0; k < 12; k++) {
      const [cx, , cz] = posOf((k / 12) * Math.PI * 2, RING_R);
      const tex = new T3.CanvasTexture(constellationTexture(ZODIAC[k]));
      tex.colorSpace = T3.SRGBColorSpace;
      const fig = new T3.Sprite(new T3.SpriteMaterial({ map: tex, color: 0xbfd2f0, transparent: true, opacity: 0.95, depthWrite: false }));
      fig.position.set(cx, 0.6, cz);
      fig.scale.setScalar(3.2);
      scene.add(fig);
      figures.push(fig);
    }
    const mkLine = (color: number): T.Line => {
      const geo = new T3.BufferGeometry().setFromPoints([new T3.Vector3(), new T3.Vector3()]);
      const line = new T3.Line(geo, new T3.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
      scene.add(line);
      return line;
    };
    sunLine = mkLine(0xffaa50);
    nightLine = mkLine(0x8cbeff);
    // 구도(가로 346, 세로 230): 고리의 가로 반폭 11 + 그림 반폭 1.6 = 12.6. 가로 시야 반각 32.5°에서 필요한 거리 19.8.
    // 세로는 내려다보는 각을 44°로 낮춰 고리가 납작하게 들어오게 한다. 거리 24. 가까운 쪽 별자리와 이름표가 아래로 잘리지 않게 보는 점을 앞으로 당겼다.
    camera.position.set(0, 16.9, 19.0);
    camera.lookAt(0, -0.6, 2.7);
    loop = createLoop((dt) => frame(dt));
    loop.start();
  })();

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
  const moveTo = (a: number): void => {
    let d = a - lastA;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    moved += Math.abs((d * 180) / Math.PI);
    earthA = a;
    lastA = a;
  };
  canvas.addEventListener("pointerdown", (e) => {
    const a = pointerAngle(e);
    if (a == null) return;
    dragging = true;
    lastA = earthA;
    moveTo(a);
    bvCapture(canvas, e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const a = pointerAngle(e);
    if (a != null) moveTo(a);
  });
  const up = (): void => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  // 검사용: 달(1~12)을 주면 지구를 그 달의 자리로 옮긴다
  u7Dev(host, {
    month: (m: number) => {
      lastA = earthA;
      moveTo(((m - 1) / 12) * Math.PI * 2 + Math.PI);
    },
  });

  function frame(dt: number): void {
    if (!st || !THREE || !earth || !halo || !sunLine || !nightLine) return;
    const w = canvas.clientWidth || 346;
    const h = canvas.clientHeight || 230;
    st.resize(w, h);

    const norm = ((earthA % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sunSideA = norm + Math.PI;
    month = Math.round(((sunSideA / (Math.PI * 2)) * 12) % 12) % 12;
    const nightK = (month + 6) % 12;
    pill.textContent = `${month + 1}월`;
    sunRow.textContent = `${ZODIAC[month]}자리`;
    nightRow.textContent = `${ZODIAC[nightK]}자리`;
    host.dataset.u7Month = String(month + 1);

    const [ex, , ez] = posOf(norm, ORBIT_R);
    earth.position.set(ex, 0, ez);
    earth.rotation.y += 0.02 * dt;
    halo.position.set(ex, 0, ez);
    halo.material.opacity = dragging ? 0.95 : 0.6;

    const v = new THREE.Vector3();
    for (let k = 0; k < 12; k++) {
      const fm = figures[k].material as T.SpriteMaterial;
      const cls = k === month ? "sun" : k === nightK ? "night" : "";
      fm.color.set(k === month ? 0x7a6a58 : k === nightK ? 0xffe08c : 0xbfd2f0);
      fm.opacity = k === month ? 0.55 : 1;
      // 이름표는 화면 글자로 따라붙는다(그림 바로 아래)
      v.copy(figures[k].position).project(st.camera);
      const tag = names[k];
      tag.style.transform = `translate(-50%, 0) translate(${(((v.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - v.y) / 2) * h + 12).toFixed(1)}px)`;
      if (tag.dataset.c !== cls) {
        tag.dataset.c = cls;
        tag.className = `u7x-zname ${cls}`;
      }
    }
    const setLine = (line: T.Line, a: number): void => {
      const [x2, , z2] = posOf(a, RING_R - 1.4);
      const pos = line.geometry.attributes.position as T.BufferAttribute;
      pos.setXYZ(0, ex, 0, ez);
      pos.setXYZ(1, x2, 0, z2);
      pos.needsUpdate = true;
    };
    setLine(sunLine, sunSideA);
    setLine(nightLine, norm);

    // 차례: 자유롭게 돌려 보기 → 궁수자리가 한밤중인 달 → 궁수자리가 태양 쪽인 달
    if (phase === "free" && moved > 50) {
      setPhase("night");
      f.pips(2);
      f.say("이제 <b>궁수자리</b>가 한밤중 남쪽 하늘에 오도록 지구를 옮겨 보세요.");
    }
    const want = phase === "night" ? nightK === TARGET : phase === "sun" ? month === TARGET : false;
    hold = want ? hold + dt * 16.7 : 0;
    if (hold > 450) {
      hold = 0;
      haptic(HAPTIC.ctaUnlock);
      if (phase === "night") {
        goals.done("night", `${month + 1}월이에요`);
        setPhase("sun");
        f.say(`${month + 1}월이에요. 이번에는 궁수자리가 <b>태양 쪽</b>에 오도록 옮겨 보세요.`);
      } else {
        goals.done("sun", `${month + 1}월이에요`);
        setPhase("wait");
        f.say("1월이에요. 반년 만에 궁수자리는 <b>볼 수 없는 별자리</b>가 됐어요.");
        window.setTimeout(() => !disposed && ask(), 1500);
      }
    }
    st.render();
  }

  return () => {
    disposed = true;
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
  };
};
