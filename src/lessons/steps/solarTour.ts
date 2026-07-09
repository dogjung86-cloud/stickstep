// solarTour — 태양계 3D 순항(VII 단원 L1). 교과서 그림 VII-1(230~231쪽)의 입체판.
//   · 가로 모드(rotateStage): 태양을 중심으로 여덟 행성이 실제처럼 궤도를 도는 태양계.
//     한 손가락 드래그 = 시점 회전, 두 손가락 핀치(또는 휠·± 버튼) = 줌, 천체 탭 = 다가가서 카드.
//   · 행성 재질은 space3d의 실사 텍스처(Solar System Scope), 배경은 은하수 구.
//   · 소행성대(화성~목성 사이 암석 인스턴스)와 혜성(꼬리는 태양 반대쪽)도 탭 대상.
// 목표(미션): ① 안쪽 행성 2곳 ② 바깥 행성 2곳 ③ 소행성대 방문.

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
  d: number; // 궤도 반지름(연출 축척)
  r: number; // 구 반지름
  group: "star" | "terra" | "jovian" | "etc";
  fact: string;
  dist: string; // 지구와의 거리
  size: string; // 크기(지구 비교)
  grav: string; // 중력(지구 비교)
  more: string; // 읽을거리
}

const BODIES: Body[] = [
  {
    key: "sun", kind: "sun", name: "태양", d: 0, r: 9, group: "star",
    fact: "태양계에서 <b>유일하게 스스로 빛을 내는</b> 천체예요. 주로 수소와 헬륨으로 이루어져 있어요.",
    dist: "지구에서 약 1억 5천만 km — 빛으로 8분 20초",
    size: "지름 약 139만 km · 지구의 109배",
    grav: "표면 중력 지구의 약 28배",
    more: "태양계 전체 질량의 99.8%가 태양 몫이에요. 표면(광구)에는 흑점이, 대기에서는 홍염과 플레어가 나타나요. 태양의 중력이 여덟 행성과 소행성·혜성을 전부 붙잡아 두고 있죠 — 태양계의 중심이자 우리와 가장 가까운 별!",
  },
  {
    key: "mercury", kind: "mercury", name: "수성", d: 16, r: 1.0, group: "terra",
    fact: "대기가 거의 없어서 <b>낮과 밤의 온도 차가 매우 커요</b>. 표면에는 운석 구덩이가 많아요.",
    dist: "지구와 가장 가까울 때 약 7,700만 km",
    size: "지름 4,880 km · 지구의 0.38배",
    grav: "중력 지구의 0.38배",
    more: "태양에 가장 가까운 첫 번째 행성. 대기가 거의 없어 낮에는 약 430℃, 밤에는 약 −180℃ — 온도 차가 600℃를 넘어요. 88일 만에 태양을 한 바퀴 도는 잰걸음 행성이에요.",
  },
  {
    key: "venus", kind: "venus", name: "금성", d: 22, r: 1.55, group: "terra",
    fact: "<b>이산화 탄소로 이루어진 두꺼운 대기</b>가 있어서 표면 온도가 매우 높아요.",
    dist: "가장 가까울 때 약 4,100만 km — 행성 중 최단",
    size: "지름 12,104 km · 지구의 0.95배",
    grav: "중력 지구의 0.9배",
    more: "크기는 지구와 쌍둥이지만 환경은 정반대 — 두꺼운 이산화 탄소 대기의 온실 효과로 표면이 약 470℃예요. 태양에서 두 번째인데도 수성보다 뜨거운 이유죠. 자전이 아주 느려서 하루가 1년보다 길고, 다른 행성과 반대 방향으로 돌아요.",
  },
  {
    key: "earth", kind: "earth", name: "지구", d: 29, r: 1.65, group: "terra",
    fact: "표면에 <b>액체 상태의 물</b>이 있고, 생명체가 살아요. 옆을 도는 달은 지구의 <b>위성</b>!",
    dist: "우리 집 — 태양에서 약 1억 5천만 km",
    size: "지름 12,756 km · 비교 기준(=1)",
    grav: "중력 = 1 (기준)",
    more: "표면에 액체 상태의 물이 넉넉히 있는 유일한 행성이자, 지금까지 생명체가 확인된 유일한 곳이에요. 적당한 태양과의 거리, 적당한 대기가 만든 기적 같은 균형이죠. 커다란 위성인 달이 함께 돌아요.",
  },
  {
    key: "mars", kind: "mars", name: "화성", d: 36, r: 1.3, group: "terra",
    fact: "<b>붉은 표면</b> — 과거에 물이 흘렀던 흔적이 있고, 얼음과 드라이아이스로 된 <b>극관</b>이 있어요.",
    dist: "가장 가까울 때 약 5,500만 km",
    size: "지름 6,792 km · 지구의 0.53배",
    grav: "중력 지구의 0.38배",
    more: "표면을 덮은 붉은 녹(산화 철) 먼지 때문에 붉게 보여요. 물이 흘렀던 골짜기 흔적, 계절마다 커졌다 작아지는 극관, 그리고 높이 약 22km로 태양계에서 가장 큰 화산까지 — 탐사 로봇이 가장 많이 굴러다니는 행성이에요.",
  },
  {
    key: "jupiter", kind: "jupiter", name: "목성", d: 58, r: 5.2, group: "jovian",
    fact: "태양계에서 <b>가장 큰 행성</b>. 줄무늬와 <b>대적점</b>(거대한 대기 소용돌이)이 보여요.",
    dist: "가장 가까울 때 약 5억 9천만 km",
    size: "지름 142,984 km · 지구의 11.2배",
    grav: "중력 지구의 약 2.5배",
    more: "지구 1,300개가 들어가는 태양계 최대 행성. 대적점은 지구보다 큰 대기 소용돌이로 300년 넘게 관측되고 있어요. 위성이 95개가 넘고, 이렇게 큰데도 약 10시간에 한 바퀴 돌 만큼 자전이 빨라요.",
  },
  {
    key: "saturn", kind: "saturn", name: "토성", d: 72, r: 4.5, group: "jovian",
    fact: "<b>뚜렷한 고리</b>를 두르고 있어요. 위성도 아주 많답니다.",
    dist: "가장 가까울 때 약 12억 km",
    size: "지름 120,536 km · 지구의 9.4배",
    grav: "중력 지구의 1.07배",
    more: "고리는 판이 아니라 수많은 얼음 조각과 돌 부스러기의 무리예요. 그리고 토성은 밀도가 물보다 작은 유일한 행성 — 토성이 들어갈 만큼 큰 욕조가 있다면 물에 둥둥 뜰 거예요!",
  },
  {
    key: "uranus", kind: "uranus", name: "천왕성", d: 84, r: 2.8, group: "jovian",
    fact: "청록색 행성. <b>자전축이 공전 궤도면과 거의 나란</b>해서 누워서 도는 셈이에요 — 고리도 세로로!",
    dist: "가장 가까울 때 약 26억 km",
    size: "지름 51,118 km · 지구의 4배",
    grav: "중력 지구의 0.89배",
    more: "자전축이 궤도면과 거의 나란해서 옆으로 누운 채 굴러가듯 공전해요 — 그래서 고리도 세로로 서 있죠. 태양계에서 가장 추운 대기(약 −224℃)를 가진 얼음 행성이에요.",
  },
  {
    key: "neptune", kind: "neptune", name: "해왕성", d: 94, r: 2.7, group: "jovian",
    fact: "파란 행성. <b>대흑점</b>이라는 대기의 소용돌이가 나타나요.",
    dist: "가장 가까울 때 약 43억 km",
    size: "지름 49,528 km · 지구의 3.9배",
    grav: "중력 지구의 1.14배",
    more: "태양에서 가장 먼 여덟 번째 행성. 시속 2,000km가 넘는 태양계 최강의 바람이 불고, 대흑점이라는 커다란 소용돌이가 나타났다 사라져요. 망원경 관측이 아니라 계산으로 위치를 먼저 예측해 발견한 첫 행성이기도 해요.",
  },
  {
    // 왜소 행성 선경험(레슨 마무리 문제·binSort의 '왜소 행성'을 투어에서 먼저 만난다).
    // BODIES에 있어도 미션(TERRA/JOVIAN/belt)에는 안 잡힘 — 목표 로직 불변.
    key: "pluto", kind: "moon", name: "명왕성", d: 104, r: 0.55, group: "etc",
    fact: "해왕성 바깥을 도는 작은 얼음 천체, <b>왜소 행성</b>이에요. 둥글지만 자기 궤도 주변을 <b>홀로 지배하지 못해서</b> 행성과 달라요.",
    dist: "태양에서 약 59억 km — 지구의 약 40배",
    size: "지름 2,377 km · 달보다 작아요",
    grav: "중력 지구의 약 1/15",
    more: "2006년까지는 아홉 번째 행성으로 불렸어요. 하지만 명왕성 곁에서 비슷한 얼음 천체들이 잇달아 발견되면서, '둥글지만 궤도 주변을 홀로 지배하지 못하는 천체'는 왜소 행성으로 새로 분류하게 됐죠. 태양계 가장자리엔 이런 얼음 천체가 아주 많답니다.",
  },
];

const EXTRA: Record<string, Pick<Body, "name" | "fact" | "dist" | "size" | "grav" | "more">> = {
  moon: {
    name: "달",
    fact: "지구 주위를 도는 <b>위성</b>이에요. 위성은 태양이 아니라 <b>행성</b> 주위를 돌아요!",
    dist: "지구에서 약 38만 km — 빛으로 1.3초",
    size: "지름 3,475 km · 지구의 0.27배",
    grav: "중력 지구의 1/6",
    more: "지구의 하나뿐인 위성. 스스로 빛나지 않고 태양 빛을 반사해서 보여요. 중력이 지구의 1/6이라 달에서는 몸무게가 1/6로 줄어요 — 우주인이 껑충껑충 뛰어다니는 이유죠.",
  },
  belt: {
    name: "소행성대",
    fact: "모양이 불규칙한 소행성들이 잔뜩! 주로 <b>화성과 목성의 공전 궤도 사이</b>에 있어요.",
    dist: "화성 궤도와 목성 궤도 사이의 띠",
    size: "가장 큰 세레스도 지름 약 940 km",
    grav: "너무 작아 중력이 아주 약해요",
    more: "행성이 되지 못하고 남은 크고 작은 암석 덩어리 수백만 개가 띠를 이루어 태양 주위를 돌아요. 그림에선 빽빽해 보이지만 실제 소행성 사이는 텅텅 비어 있어서, 탐사선이 그냥 통과할 수 있을 정도랍니다.",
  },
  comet: {
    name: "혜성",
    fact: "얼음과 먼지 덩어리. 태양에 가까워지면 녹으면서 꼬리가 생기는데, 꼬리는 늘 <b>태양 반대쪽</b>을 향해요!",
    dist: "길쭉한 타원 궤도 — 가까워졌다 멀어졌다",
    size: "핵의 지름은 보통 수 km",
    grav: "아주 약해요",
    more: "태양에 가까워지면 얼음이 녹아 가스와 먼지를 뿜고, 그게 태양풍에 밀려 태양 반대쪽으로 긴 꼬리를 만들어요. 유명한 핼리 혜성은 약 76년마다 돌아와요 — 다음 방문은 2061년이에요!",
  },
};

const TERRA = ["mercury", "venus", "earth", "mars"];
const JOVIAN = ["jupiter", "saturn", "uranus", "neptune"];

export const solarTour: StepRenderer = (host, step, api) => {
  const s = step as unknown as TourStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "terra" } }, el("b", { text: "안쪽 행성" }), el("span", { text: "2곳 방문" })),
    el("div", { class: "pn-badge", dataset: { g: "jovian" } }, el("b", { text: "바깥 행성" }), el("span", { text: "2곳 방문" })),
    el("div", { class: "pn-badge", dataset: { g: "belt" } }, el("b", { text: "소행성대" }), el("span", { text: "찾아서 탭" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: tourArtSvg() }),
    el("div", { class: "sp3-enter-txt", html: "태양 둘레를 도는 <b>진짜 궤도 태양계</b>를 순항해요.<br>돌리고(<b>드래그</b>) · 줌하고(<b>두 손가락</b>) · 다가가요(<b>탭</b>). 화면이 자동으로 <b>가로</b>로 돌아가요.<span class='sp3-credit'>행성 텍스처: Solar System Scope(CC BY 4.0) · 사진: NASA</span>" }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 출발하기" }));
  const helper = el("div", {
    class: "helper",
    html: "한 손가락으로 <b>빙 돌리고</b>, 두 손가락으로 <b>당겨서 확대</b>해 보세요. 천체를 <b>탭</b>하면 다가가서 소개 카드를 읽을 수 있어요. 화성과 목성 사이의 <b>소행성대</b>, 해왕성 바깥 끝자락의 <b>명왕성</b>도 찾아보세요!",
  });
  host.append(goalChips, preview, enterBtn, helper);

  const visited = new Set<string>();
  const goals = new Set<string>();
  let finished = false;
  let missionEl: HTMLElement | null = null;

  function syncMission(id: string, on: boolean): void {
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
    if (chip && on) chip.classList.add("on");
    const mchip = missionEl?.querySelector(`[data-g="${id}"]`) as HTMLElement | null;
    if (mchip && on) mchip.classList.add("on");
  }

  function checkGoals(): void {
    const terra = TERRA.filter((k) => visited.has(k)).length;
    const jovian = JOVIAN.filter((k) => visited.has(k)).length;
    const put = (id: string, subText: string): void => {
      if (goals.has(id)) return;
      goals.add(id);
      const chip = goalChips.querySelector(`[data-g="${id}"] span`) as HTMLElement | null;
      if (chip) chip.textContent = subText;
      syncMission(id, true);
      haptic(HAPTIC.ctaUnlock);
    };
    if (terra >= 2) put("terra", "암석 표면!");
    if (jovian >= 2) put("jovian", "크고 기체!");
    if (visited.has("belt")) put("belt", "화성~목성 사이!");
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
    rot = enterRotateStage({ title: "태양계 순항 — 드래그 회전 · 핀치 줌 · 탭 방문", onLeave: () => leave() });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    const pill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), el("span", { text: "방문 0곳" }));
    missionEl = el(
      "div",
      { class: "sp3-missions" },
      el("span", { dataset: { g: "terra" }, text: "안쪽 2곳" }),
      el("span", { dataset: { g: "jovian" }, text: "바깥 2곳" }),
      el("span", { dataset: { g: "belt" }, text: "소행성대" }),
    );
    goals.forEach((g) => syncMission(g, true));
    const zoomIn = el("button", { class: "sp3-zbtn", attrs: { type: "button", "aria-label": "확대" }, text: "+" });
    const zoomOut = el("button", { class: "sp3-zbtn", attrs: { type: "button", "aria-label": "축소" }, text: "−" });
    const zoomCtl = el("div", { class: "sp3-zoomctl" }, zoomIn, zoomOut);
    const card = el("div", { class: "sp3-card" });
    rot.stage.append(canvas, pill, missionEl, zoomCtl, card);
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
    const { scene } = st;
    scene.add(S.makeStars(1200, 420));
    scene.add(S.makeMilkyWay(460));
    // 태양광(중심 점광) + 부드러운 앰비언트 — 밤면이 새까맣지 않게
    const sunLight = new THREE.PointLight(0xfff2dc, 2.4, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x51617f, 0.85));

    const meshes = new Map<string, T.Object3D>();
    const angles = new Map<string, number>();
    const labels: T.Sprite[] = [];

    for (const b of BODIES) {
      const m = S.makePlanet(b.kind, b.r, b.r > 4 ? 56 : 40);
      m.userData.key = b.key;
      scene.add(m);
      meshes.set(b.key, m);
      angles.set(b.key, (b.d * 2.399) % (Math.PI * 2)); // 저마다 다른 출발 각도
      if (b.d > 0) scene.add(S.makeOrbitLine(b.d, "#5E7CA8", 0.28, 160));
      const label = S.makeLabel(b.name);
      label.position.set(0, b.r + 1.9, 0);
      m.add(label);
      labels.push(label);
      if (b.key === "sun") {
        const glow = S.makeGlow(40, "rgba(255,180,70,.85)", 0.14);
        m.add(glow);
      }
      if (b.key === "saturn") {
        const ring = S.makeRing(b.r * 1.3, b.r * 2.2, "saturn");
        ring.rotation.x = -Math.PI / 2 + 0.45;
        m.add(ring);
      }
      if (b.key === "uranus") {
        const ring = S.makeRing(b.r * 1.45, b.r * 2.0, "faint");
        m.add(ring);
        m.rotation.z = Math.PI / 2 - 0.14; // 누운 자전축 — 고리가 세로로 선다
        (ring as T.Mesh).rotation.x = -Math.PI / 2;
      }
    }

    // 달(지구 위성)
    const moon = S.makePlanet("moon", 0.5, 28);
    moon.userData.key = "moon";
    scene.add(moon);
    meshes.set("moon", moon);

    // 소행성대 — 화성(36)~목성(58) 사이 암석 인스턴스 띠
    const BELT_N = 260;
    const rockGeo = new THREE.DodecahedronGeometry(0.34, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x9aa2b2 });
    const belt = new THREE.InstancedMesh(rockGeo, rockMat, BELT_N);
    {
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const eul = new THREE.Euler();
      const rnd = (a: number, b2: number): number => a + Math.random() * (b2 - a);
      for (let i = 0; i < BELT_N; i++) {
        const a = Math.random() * Math.PI * 2;
        const rr = rnd(43, 51);
        eul.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        q.setFromEuler(eul);
        m4.compose(
          new THREE.Vector3(Math.cos(a) * rr, rnd(-1.3, 1.3), Math.sin(a) * rr),
          q,
          new THREE.Vector3(rnd(0.5, 1.7), rnd(0.5, 1.4), rnd(0.5, 1.5)),
        );
        belt.setMatrixAt(i, m4);
      }
      belt.instanceMatrix.needsUpdate = true;
    }
    scene.add(belt);
    // 벨트 탭 판정용 투명 도넛 프록시
    const beltProxy = new THREE.Mesh(
      new THREE.TorusGeometry(47, 4.6, 10, 56),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    );
    beltProxy.rotation.x = Math.PI / 2;
    beltProxy.userData.key = "belt";
    scene.add(beltProxy);
    meshes.set("belt", beltProxy);
    const beltLabel = S.makeLabel("소행성대", { color: "#C9D4E8" });
    beltLabel.position.set(0, 3.4, -47);
    scene.add(beltLabel);
    labels.push(beltLabel);

    // 혜성 + 꼬리(태양 반대쪽 글로우 8개)
    const comet = S.makePlanet("moon", 0.55, 20);
    comet.userData.key = "comet";
    scene.add(comet);
    meshes.set("comet", comet);
    const cometProxy = new THREE.Mesh(new THREE.SphereGeometry(3.2, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    cometProxy.userData.key = "comet";
    scene.add(cometProxy);
    // 명왕성 탭 판정용 투명 프록시(혜성 프록시 문법 재사용 — 작은 천체는 직접 탭이 어렵다)
    const plutoProxy = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    plutoProxy.userData.key = "pluto";
    scene.add(plutoProxy);
    const tail: T.Sprite[] = [];
    for (let i = 0; i < 8; i++) {
      const sp = S.makeGlow(2.4 - i * 0.22, "rgba(150,210,255,.55)", 0.25);
      sp.material.opacity = 0.8 - i * 0.09;
      scene.add(sp);
      tail.push(sp);
    }

    // ---- 카메라: 구면 궤도 + 핀치 줌 ----
    let camTheta = 0.35;
    let camPhi = 1.02;
    let camR = 120;
    let camRTarget = 120;
    const target = new THREE.Vector3(0, 0, 0);
    const targetGoal = new THREE.Vector3(0, 0, 0);
    let focus: string | null = null;
    let overviewR = 120;

    function applyCamera(): void {
      if (!st) return;
      target.lerp(targetGoal, 0.12);
      camR += (camRTarget - camR) * 0.12;
      const sp = Math.sin(camPhi);
      st.camera.position.set(
        target.x + camR * sp * Math.sin(camTheta),
        target.y + camR * Math.cos(camPhi),
        target.z + camR * sp * Math.cos(camTheta),
      );
      st.camera.lookAt(target);
    }

    // ---- 입력: 회전 드래그 · 핀치 줌 · 탭 ----
    const pointers = new Map<number, { x: number; y: number }>();
    let downAt: { x: number; y: number } | null = null;
    let moved = false;
    let pinchDist = 0;

    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      pointers.set(e.pointerId, p);
      if (pointers.size === 1) {
        downAt = p;
        moved = false;
      } else if (pointers.size === 2) {
        const [a, b2] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b2.x, a.y - b2.y);
      }
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!rot || !pointers.has(e.pointerId)) return;
      const p = rot.mapPoint(e);
      const prev = pointers.get(e.pointerId)!;
      pointers.set(e.pointerId, p);
      if (pointers.size === 2) {
        const [a, b2] = [...pointers.values()];
        const d = Math.hypot(a.x - b2.x, a.y - b2.y);
        if (pinchDist > 0) camRTarget = clamp(camRTarget * (pinchDist / d), 14, 220);
        pinchDist = d;
        moved = true;
        return;
      }
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      if (downAt && Math.hypot(p.x - downAt.x, p.y - downAt.y) > 9) moved = true;
      if (moved) {
        camTheta -= dx * 0.0052;
        camPhi = clamp(camPhi - dy * 0.0042, 0.22, 1.42);
      }
    });
    const up = (e: PointerEvent): void => {
      if (!rot || !st) {
        pointers.delete(e.pointerId);
        return;
      }
      const wasTap = pointers.size === 1 && downAt && !moved;
      pointers.delete(e.pointerId);
      pinchDist = 0;
      if (wasTap) {
        const { w, h } = rot.size();
        const p = rot.mapPoint(e);
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1)), st.camera);
        const hits = ray.intersectObjects([...meshes.values(), cometProxy, plutoProxy], false);
        if (hits.length) openCard(hits[0].object.userData.key as string);
        else if (focus) closeCard();
      }
      downAt = null;
    };
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", (e) => {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      downAt = null;
    });
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        camRTarget = clamp(camRTarget * (1 + e.deltaY * 0.0012), 14, 220);
      },
      { passive: false },
    );
    const zoomBy = (f: number): void => {
      camRTarget = clamp(camRTarget * f, 14, 220);
      haptic(HAPTIC.tap);
    };
    zoomIn.addEventListener("click", () => zoomBy(0.72));
    zoomOut.addEventListener("click", () => zoomBy(1.38));

    function focusDistOf(key: string): number {
      const b = BODIES.find((x) => x.key === key);
      if (b) return b.r * 4.4 + 2.2;
      if (key === "belt") return 30;
      return 5;
    }

    function openCard(key: string): void {
      const b = BODIES.find((x) => x.key === key);
      const info = b ?? EXTRA[key];
      if (!info) return;
      if (focus !== key) {
        overviewR = focus ? overviewR : camRTarget; // 첫 포커스 때의 전체 뷰 반경 기억
      }
      focus = key;
      visited.add(key);
      haptic(HAPTIC.select);
      camRTarget = focusDistOf(key);
      card.innerHTML = "";
      const stats = el(
        "div",
        { class: "sp3-stats" },
        statChip("지구와 거리", info.dist),
        statChip("크기", info.size),
        statChip("중력", info.grav),
      );
      card.append(
        el("b", { text: info.name }),
        stats,
        el("p", { html: info.fact }),
        el("p", { class: "sp3-more", html: info.more }),
        el("button", { class: "sp3-cardclose", attrs: { type: "button" }, text: "계속 순항하기" }),
      );
      card.classList.add("show");
      (card.querySelector(".sp3-cardclose") as HTMLButtonElement).addEventListener("click", closeCard);
      pillText.textContent = `방문 ${visited.size}곳 — ${info.name}`;
      checkGoals();
    }
    function statChip(k: string, v: string): HTMLElement {
      return el("div", { class: "sp3-stat" }, el("i", { text: k }), el("span", { text: v }));
    }
    function closeCard(): void {
      focus = null;
      targetGoal.set(0, 0, 0);
      camRTarget = Math.max(overviewR, 60);
      card.classList.remove("show");
      haptic(HAPTIC.tap);
    }

    // ---- 프레임 ----
    let t = 0;
    const wOf = (d: number): number => 0.00042 * Math.pow(16 / Math.max(d, 1), 1.5) * 16; // 안쪽일수록 빠르게
    loop = createLoop((dt) => {
      if (!rot || !st) return;
      t += dt * 16.7;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);

      // 공전 + 자전
      for (const b of BODIES) {
        const m = meshes.get(b.key)!;
        if (b.d > 0) {
          const a = (angles.get(b.key) ?? 0) + wOf(b.d) * dt;
          angles.set(b.key, a);
          m.position.set(Math.cos(a) * b.d, 0, Math.sin(a) * b.d);
        }
        if (b.key === "uranus") m.rotation.y += 0.004 * dt;
        else if (b.key !== "sun") m.rotation.y += 0.0035 * dt;
        else m.rotation.y += 0.0009 * dt;
      }
      const earthM = meshes.get("earth")!;
      const ma = t * 0.0011;
      moon.position.set(earthM.position.x + Math.cos(ma) * 3.1, 0.25, earthM.position.z + Math.sin(ma) * 3.1);
      moon.rotation.y += 0.004 * dt;
      belt.rotation.y += 0.00018 * dt;
      plutoProxy.position.copy(meshes.get("pluto")!.position);

      // 혜성 — 길쭉한 타원(태양이 한 초점)
      const ce = 0.62;
      const caM = t * 0.00013 + 2.1;
      const cr = (30 * (1 - ce * ce)) / (1 + ce * Math.cos(caM));
      const cx = Math.cos(caM) * cr;
      const cz = Math.sin(caM) * cr * 0.9 - 8;
      comet.position.set(cx, 1.4, cz);
      cometProxy.position.copy(comet.position);
      const away = new THREE.Vector3(cx, 1.4, cz).normalize();
      tail.forEach((sp, i) => {
        sp.position.set(cx + away.x * (i + 1) * 1.5, 1.4 + away.y, cz + away.z * (i + 1) * 1.5);
      });

      // 라벨 — 가까이 다가가면 페이드
      const labelFade = clamp((camR - 22) / 30, 0, 1) * 0.95;
      for (const lb of labels) (lb.material as T.SpriteMaterial).opacity = labelFade;

      // 포커스 대상 추적
      if (focus) {
        const obj = meshes.get(focus)!;
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        if (focus === "belt") {
          // 도넛 중심이 아니라 카메라 쪽 벨트 자락을 본다
          wp.set(Math.sin(camTheta) * 47 * 0.2, 0, Math.cos(camTheta) * 47 * 0.2);
        }
        targetGoal.copy(wp);
      }
      if (!focus) {
        pillText.textContent = visited.size ? `방문 ${visited.size}곳 — 천체를 탭!` : "돌리고 · 줌하고 · 탭해 보세요";
      }

      applyCamera();
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
    missionEl = null;
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 순항하기";
      enterBtn.classList.remove("pulse");
    } else {
      helper.innerHTML = "아직 방문할 곳이 남았어요 — 다시 출발해서 <b>미션 세 개</b>를 채워 봐요!";
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
    <g transform="translate(140 128)">
      <circle r="86" stroke="#31446E" stroke-width="1.2"/>
      <circle r="62" stroke="#31446E" stroke-width="1.2"/>
      <circle r="108" stroke="#31446E" stroke-width="1.2" stroke-dasharray="2 5"/>
    </g>
    <circle cx="140" cy="128" r="42" fill="url(#tr-sun)" opacity=".9"/>
    <circle cx="140" cy="66" r="4.6" fill="#2E6FD4"/>
    <circle cx="86" cy="62" r="3.4" fill="#C05B3C"/>
    <g transform="translate(216 44) rotate(-14)">
      <circle r="9" fill="#E8D9A8"/>
      <ellipse rx="15" ry="4" stroke="#D9C08A" stroke-width="2.4"/>
    </g>
    <circle cx="52" cy="34" r="11" fill="url(#tr-jup)"/>
    <ellipse cx="55" cy="37" rx="3.4" ry="2" fill="#C4553E"/>
  </svg>`;
}
