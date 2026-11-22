// u7TourLab: 태양계 구성 천체(u7l1). 태양계를 이루는 여섯 갈래의 천체(태양, 행성, 왜소 행성, 소행성, 혜성, 위성)를
// 가로 화면의 3D 태양계에서 하나씩 찾아 만나고, 돌아와서 단서 카드 여섯 장을 알맞은 천체 바구니에 담는다.
// 3D 무대의 뼈대는 정본 steps/solarTour.ts에서 왔다(qa/u7v5-port-landscape.py가 옮겨 적었다). 2026-11-15 그래픽 손질부터는 이 파일이 정본이다
// (작은 천체의 생김새, 화면 글자 이름표, 비율 알림, 바구니의 작은 그림, 입구 그림을 이 파일에서 고쳤다. 옮겨 적기 도구를 다시 돌리지 않는다).
// 바꾼 것: 세로 화면의 틀(한 화면, 찾을 것 여섯 가지, 판정, 결론은 조작 칸에) · 찾을 것(안쪽 2곳, 바깥 2곳, 소행성대 → 천체의 갈래 여섯)
//          · 가로 화면에서 다 찾으면 그 자리에서 알리고 돌아가는 버튼을 준다.
//          · 돌아온 뒤의 정리(2026-11-22): 여섯 천체에 세 특징을 O, X로 채우던 표를 걷고, 단서 카드를 한 장씩 읽어 천체 바구니에 담는다.
import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import { icon } from "../../../core/icons";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T, PlanetKind } from "../../../ui/space3d";
import type { RotateStage } from "../../../ui/rotateStage";
import { u7Frame, u7Goals, u7Dev } from "./kit";

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
    fact: "수소와 헬륨 기체로 이루어진 거대한 별로, 태양계에서 <b>유일하게 스스로 빛과 열을 내요</b>.",
    dist: "지구에서 약 1억 5천만 km, 빛으로 8분 20초",
    size: "지름 약 139만 km · 지구의 109배",
    grav: "표면 중력 지구의 약 28배",
    more: "태양계 전체 질량의 약 99.8%를 차지해요. 표면(광구)에는 흑점이 나타나고, 대기에서는 홍염과 플레어가 나타나죠. 강한 중력으로 여덟 행성과 소행성, 혜성을 모두 붙잡아 두는 태양계의 중심 별이에요.",
  },
  {
    key: "mercury", kind: "mercury", name: "수성", d: 16, r: 1.0, group: "terra",
    fact: "대기가 거의 없어서 <b>낮과 밤의 온도 차가 매우 커요</b>. 표면에는 운석 구덩이가 많아요.",
    dist: "지구와 가장 가까울 때 약 7,700만 km",
    size: "지름 4,880 km · 지구의 0.38배",
    grav: "중력 지구의 0.38배",
    more: "태양에서 가장 가까운 첫 번째 행성이에요. 대기가 거의 없어 낮에는 약 430℃까지 오르고 밤에는 약 −180℃까지 내려가, 낮과 밤의 온도 차가 600℃가 넘어요.",
  },
  {
    key: "venus", kind: "venus", name: "금성", d: 22, r: 1.55, group: "terra",
    fact: "<b>이산화 탄소로 이루어진 두꺼운 대기</b>가 있어서 표면 온도가 매우 높아요.",
    dist: "지구와 가장 가까울 때 약 4,100만 km",
    size: "지름 12,104 km · 지구의 0.95배",
    grav: "중력 지구의 0.9배",
    more: "크기는 지구와 비슷하지만 환경은 정반대예요. 두꺼운 이산화 탄소 대기가 열을 가두어 표면 온도가 약 470℃나 되거든요. 태양에서 두 번째로 가까운데도 수성보다 더 뜨거운 까닭이에요.",
  },
  {
    key: "earth", kind: "earth", name: "지구", d: 29, r: 1.65, group: "terra",
    fact: "표면에 <b>액체 상태의 물</b>이 있고 생명체가 살아가요. 지구 둘레를 도는 달은 지구의 <b>위성</b>이에요.",
    dist: "태양에서 약 1억 5천만 km",
    size: "지름 12,756 km · 행성 비교 기준(1)",
    grav: "중력 비교 기준(1)",
    more: "태양과의 거리가 알맞고 적절한 대기가 있어, 표면에 액체 상태의 물이 풍부하고 생명체가 살아가요. 위성인 달 한 개를 거느리고 있어요.",
  },
  {
    key: "mars", kind: "mars", name: "화성", d: 36, r: 1.3, group: "terra",
    fact: "<b>표면이 붉고</b> 과거에 물이 흘렀던 흔적이 있어요. 양극 지방에는 얼음과 드라이아이스로 된 흰 <b>극관</b>이 보여요.",
    dist: "가장 가까울 때 약 5,500만 km",
    size: "지름 6,792 km · 지구의 0.53배",
    grav: "중력 지구의 0.38배",
    more: "표면에 산화 철 성분이 많아 붉게 보여요. 물이 흘렀던 골짜기 흔적과 계절에 따라 크기가 변하는 극관이 있어, 인류가 탐사 로봇을 가장 많이 보낸 행성이에요.",
  },
  {
    key: "jupiter", kind: "jupiter", name: "목성", d: 58, r: 5.2, group: "jovian",
    fact: "태양계에서 <b>가장 큰 행성</b>이에요. 가로줄 무늬와 거대한 대기 소용돌이인 <b>대적점</b>이 보여요.",
    dist: "가장 가까울 때 약 5억 9천만 km",
    size: "지름 142,984 km · 지구의 11.2배",
    grav: "중력 지구의 약 2.5배",
    more: "부피가 지구의 1,300배나 되는 가장 큰 행성이에요. 지구보다 큰 소용돌이인 대적점이 있고, 빠르게 자전해서 표면에 가로줄 무늬가 나타나요. 수많은 위성과 희미한 고리도 가지고 있어요.",
  },
  {
    key: "saturn", kind: "saturn", name: "토성", d: 72, r: 4.5, group: "jovian",
    fact: "암석과 얼음 조각으로 이루어진 <b>뚜렷한 고리</b>가 있어요. 거느린 위성도 매우 많아요.",
    dist: "가장 가까울 때 약 12억 km",
    size: "지름 120,536 km · 지구의 9.4배",
    grav: "중력 지구의 1.07배",
    more: "넓은 고리는 하나의 단단한 판이 아니라 수많은 얼음과 암석 조각이 모여 돌고 있는 거예요. 태양계 행성 가운데 평균 밀도가 가장 작고, 물의 밀도보다도 작아요.",
  },
  {
    key: "uranus", kind: "uranus", name: "천왕성", d: 84, r: 2.8, group: "jovian",
    fact: "청록색을 띠며, <b>자전축이 공전 궤도면과 거의 나란</b>해서 옆으로 누운 채 자전해요.",
    dist: "가장 가까울 때 약 26억 km",
    size: "지름 51,118 km · 지구의 4배",
    grav: "중력 지구의 0.89배",
    more: "자전축이 크게 기울어져 옆으로 누운 채 돌기 때문에 희미한 고리도 세로로 서 있어요. 대기에 메테인이 포함되어 있어 청록색으로 보여요.",
  },
  {
    key: "neptune", kind: "neptune", name: "해왕성", d: 94, r: 2.7, group: "jovian",
    fact: "태양에서 가장 먼 파란색 행성이에요. 표면에 대기 소용돌이인 <b>대흑점</b>이 나타나기도 해요.",
    dist: "가장 가까울 때 약 43억 km",
    size: "지름 49,528 km · 지구의 3.9배",
    grav: "중력 지구의 1.14배",
    more: "태양에서 여덟 번째 행성이에요. 강한 바람이 불어 표면에 어두운 소용돌이인 대흑점이 생겼다 사라지곤 하며, 천왕성과 마찬가지로 희미한 고리와 많은 위성이 있어요.",
  },
  {
    // 왜소 행성 선경험(레슨 끝 문제와 분류 스텝의 '왜소 행성'을 투어에서 먼저 만난다).
    // BODIES에 있어도 미션(TERRA/JOVIAN/belt)에는 안 잡힘: 목표 로직 불변.
    key: "pluto", kind: "moon", name: "명왕성", d: 104, r: 0.55, group: "etc",
    fact: "공처럼 둥글지만 <b>행성보다 훨씬 작고 가벼워서</b> <b>왜소 행성</b>으로 분류하는 천체예요.",
    dist: "태양에서 약 59억 km, 지구의 약 40배",
    size: "지름 2,377 km · 달보다 작아요",
    grav: "중력 지구의 약 1/15",
    more: "2006년까지는 아홉 번째 행성으로 불렸어요. 하지만 주변에서 비슷한 천체들이 잇달아 발견되면서, 모양은 둥글지만 궤도 주변의 다른 천체들을 끌어들일 만큼 질량이 크지 않아 왜소 행성으로 다시 분류되었어요.",
  },
];

const EXTRA: Record<string, Pick<Body, "name" | "fact" | "dist" | "size" | "grav" | "more">> = {
  moon: {
    name: "달",
    fact: "<b>행성인 지구의 둘레</b>를 도는 천체라서 지구의 <b>위성</b>이라고 불러요.",
    dist: "지구에서 약 38만 km, 빛으로 1.3초",
    size: "지름 3,475 km · 지구의 0.27배",
    grav: "중력 지구의 1/6",
    more: "지구의 하나뿐인 자연 위성이에요. 스스로 빛을 내지 못하고 태양 빛을 반사해서 밝게 보이죠. 대기가 없어 낮과 밤의 온도 차가 크고 표면에 운석 구덩이가 많아요.",
  },
  belt: {
    name: "소행성대",
    fact: "크기도 모양도 제각각인 울퉁불퉁한 <b>소행성</b>들이 <b>대부분 화성과 목성 궤도 사이</b>에 띠처럼 모여 태양 둘레를 돌아요.",
    dist: "화성 궤도와 목성 궤도 사이의 띠",
    size: "가장 큰 세레스도 지름 약 940 km",
    grav: "너무 작아 중력이 아주 약해요",
    more: "크고 작은 암석 천체들이 화성과 목성 궤도 사이에 띠 모양으로 모여 태양 주위를 돌고 있어요. 모양이 둥글지 않고 길쭉하거나 울퉁불퉁한 것이 특징이에요.",
  },
  comet: {
    name: "혜성",
    fact: "<b>얼음과 먼지</b>로 이루어진 작은 천체로, 태양 가까이를 지날 때 <b>태양 반대쪽으로 긴 꼬리</b>가 생겨요.",
    dist: "길쭉한 타원 궤도, 가까워졌다 멀어졌다",
    size: "핵의 지름은 보통 수 km",
    grav: "아주 약해요",
    more: "납작한 타원이나 포물선 궤도를 그리며 태양 주위를 돌아요. 태양에 가까워지면 얼음이 녹으며 기체와 먼지가 뿜어져 나와 태양 반대 방향으로 긴 꼬리가 만들어져요.",
  },
};

// 찾을 천체 여섯 가지(태양계 구성 천체의 여섯 갈래)와 그 갈래에 드는 무대의 천체. 돌아온 뒤에는 이 차례로 바구니가 놓인다
const KINDS: { id: string; name: string; found: string; keys: string[] }[] = [
  { id: "sun", name: "태양", found: "스스로 빛나요", keys: ["sun"] },
  { id: "planet", name: "행성", found: "태양 주위를 돌아요", keys: ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] },
  { id: "moon", name: "위성", found: "행성 주위를 돌아요", keys: ["moon"] },
  { id: "belt", name: "소행성", found: "화성과 목성 사이", keys: ["belt"] },
  { id: "comet", name: "혜성", found: "긴 꼬리가 생겨요", keys: ["comet"] },
  { id: "dwarf", name: "왜소 행성", found: "행성보다 작아요", keys: ["pluto"] },
];
const DEV_KEYS = ["sun", "earth", "moon", "belt", "comet", "pluto"];
// 돌아온 뒤 천체 바구니에 담는 단서 카드 여섯 장. kind는 알맞은 바구니, note는 담긴 뒤 바구니에 남는 짧은 말,
// hint는 틀렸을 때 가로 화면에서 본 것을 짚는 말(도움말 두 줄 안쪽). 차례는 고정이고, 채점은 첫 카드의 첫 답 한 번이다.
// 첫 카드는 위성이다(위성을 행성이나 왜소 행성과 헷갈리는지가 이 레슨에서 가장 많이 틀리는 곳이다).
const CLUES: { kind: string; t: string; note: string; hint: string }[] = [
  { kind: "moon", t: "태양이 아니라 <b>행성의 둘레</b>를 도는 짝꿍 천체예요.", note: "행성 둘레를 돌아요", hint: "달은 지구 곁에서 지구 둘레를 돌았어요. 다시 골라 보세요." },
  { kind: "comet", t: "태양 곁을 지날 때 <b>태양 반대쪽으로 긴 꼬리</b>를 늘어뜨리는 얼음과 먼지 덩어리예요.", note: "태양 반대쪽 꼬리", hint: "가로 화면에서 꼬리는 늘 태양 반대쪽을 향했어요." },
  { kind: "dwarf", t: "공처럼 둥근 모양인데 <b>크기와 질량이 행성에 한참 못 미치는</b> 천체예요.", note: "둥글지만 작아요", hint: "명왕성은 둥글지만 행성보다 훨씬 작았어요." },
  { kind: "sun", t: "태양계 한가운데에서 <b>스스로 빛을 내는 단 하나</b>의 천체예요.", note: "스스로 빛나요", hint: "행성과 달은 태양 쪽 절반만 밝았어요. 스스로 빛나는 건 하나뿐이에요." },
  { kind: "belt", t: "울퉁불퉁한 모양으로, <b>대부분 화성과 목성 궤도 사이</b>에서 태양 둘레를 돌아요.", note: "대부분 화성과 목성 사이", hint: "화성과 목성 궤도 사이에 울퉁불퉁한 바위가 띠처럼 모여 있었어요." },
  { kind: "planet", t: "태양 둘레를 도는 크고 둥근 천체로, <b>수성부터 해왕성까지 여덟 개</b>예요.", note: "태양 둘레를 돌아요", hint: "수성부터 해왕성까지 태양 둘레를 도는 여덟 개를 떠올려 보세요." },
];

// ── 작은 천체의 생김새(코드로 만든 질감과 모양, 2026-11-15 그래픽 손질) ──────────────────────────
// 예전에는 명왕성과 혜성 핵이 달의 실사 질감(makePlanet("moon"))을 그대로 써서 달과 똑같았고, 혜성 꼬리는 둥근 빛 여덟 개였다.
// 명왕성: 뉴허라이즌스 사진(public/photos/star/pluto.webp)의 색을 따라 그린 등장방형 질감. 황갈색 바탕, 적도 남쪽의 짙은 적갈색 띠,
//         밝은 하트 모양 지대(왼쪽 잎이 더 매끈하고 밝다), 조금 밝은 북극 지대. 3D 공에 입히는 질감이라 사진을 그대로 쓸 수 없어 코드로 그린다.
// 혜성 핵: 두 덩이가 붙은 울퉁불퉁한 어두운 덩어리(67P 같은 모양). 꼬리: 태양 반대쪽으로 갈수록 넓어지고 옅어지는 빛 띠 한 장.
// 소행성: 울퉁불퉁한 바위 셋을 여러 크기와 방향으로 600개. 소행성대를 누르면 띠 위 가까운 곳을 겨누어 바위가 화면을 채운다.

/** 정수 격자의 해시(0~1). */
function hash3(x: number, y: number, z: number, s: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** 3차원 값 잡음(0~1). */
function vnoise3(x: number, y: number, z: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const c = (dx: number, dy: number, dz: number): number => hash3(xi + dx, yi + dy, zi + dz, s);
  const x00 = c(0, 0, 0) + (c(1, 0, 0) - c(0, 0, 0)) * u;
  const x10 = c(0, 1, 0) + (c(1, 1, 0) - c(0, 1, 0)) * u;
  const x01 = c(0, 0, 1) + (c(1, 0, 1) - c(0, 0, 1)) * u;
  const x11 = c(0, 1, 1) + (c(1, 1, 1) - c(0, 1, 1)) * u;
  const y0 = x00 + (x10 - x00) * v;
  const y1 = x01 + (x11 - x01) * v;
  return y0 + (y1 - y0) * w;
}
function fbm3(x: number, y: number, z: number, s: number, oct = 4): number {
  let a = 0.5;
  let t = 0;
  let n = 0;
  for (let i = 0; i < oct; i++) {
    t += a * vnoise3(x, y, z, s + i * 17);
    n += a;
    x *= 2.03;
    y *= 2.03;
    z *= 2.03;
    a *= 0.5;
  }
  return t / n;
}
const smooth = (e0: number, e1: number, x: number): number => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const mixC = (a: number[], b: number[], t: number): number[] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** 명왕성 질감(등장방형 1024×512). 경도 0이 하트의 가운데다. */
function plutoCanvas(): HTMLCanvasElement {
  const W = 1024;
  const Hh = 512;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = Hh;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, Hh);
  const d = img.data;
  const TAN = [206, 178, 146];
  const TAN_L = [230, 212, 186];
  const TAN_D = [164, 128, 98];
  const RED = [118, 50, 36];
  const RED_L = [150, 74, 52];
  const HEART = [244, 238, 228];
  const HEART_R = [234, 222, 204];
  const POLE = [200, 196, 190];
  const D2R = Math.PI / 180;
  for (let y = 0; y < Hh; y++) {
    const lat = 90 - (y / Hh) * 180;
    const cl = Math.cos(lat * D2R);
    const sl = Math.sin(lat * D2R);
    for (let x = 0; x < W; x++) {
      const lon = (x / W) * 360 - 180;
      const px = cl * Math.cos(lon * D2R);
      const pz = cl * Math.sin(lon * D2R);
      const n = fbm3(px * 3.2 + 7, sl * 3.2, pz * 3.2, 11);
      const fine = fbm3(px * 14, sl * 14, pz * 14, 29, 3);
      let c = mixC(TAN_D, TAN_L, smooth(0.32, 0.7, n));
      c = mixC(c, TAN, 0.35);
      // 북극 쪽: 조금 밝고 회색빛
      c = mixC(c, POLE, smooth(50, 72, lat + (n - 0.5) * 16) * 0.7);
      // 적도 남쪽의 짙은 적갈색 띠(경도 −150~−35, 위도 −30~+5, 가장자리는 잡음으로 들쭉날쭉)
      const dl = Math.abs(lat + 11) / 20;
      const dg = Math.abs(lon + 92) / 60;
      const band = Math.max(dl, dg) + (n - 0.5) * 0.9;
      const red = 1 - smooth(0.78, 1.0, band);
      c = mixC(c, mixC(RED, RED_L, smooth(0.35, 0.75, fine)), red * 0.92);
      // 하트 동쪽의 작은 짙은 얼룩들
      const spots = smooth(0.62, 0.7, fbm3(px * 6, sl * 6, pz * 6, 41)) * (1 - smooth(5, 25, Math.abs(lat + 8))) * smooth(40, 70, lon) * (1 - smooth(120, 150, lon));
      c = mixC(c, RED, spots * 0.7);
      // 하트: 왼쪽 잎(매끈, 아주 밝음) + 오른쪽 잎(조금 거칠다), 아래 끝이 남쪽으로 뾰족
      const l1 = Math.hypot((lon + 13) / 19, (lat - 10) / 27);
      const l2 = Math.hypot((lon - 17) / 22, (lat - 18) / 21);
      const tip = Math.hypot((lon + 3) / 11, (lat + 14) / 12);
      const hd = Math.min(l1, l2, tip) + (n - 0.5) * 0.35;
      const heart = 1 - smooth(0.82, 1.02, hd);
      const left = l1 < l2 ? 1 : 0;
      c = mixC(c, left ? HEART : mixC(HEART_R, TAN_L, smooth(0.5, 0.8, fine) * 0.35), heart);
      // 얕은 명암(구덩이와 산의 결)
      const k = 0.86 + 0.24 * fine;
      const i = (y * W + x) * 4;
      d[i] = Math.min(255, c[0] * k);
      d[i + 1] = Math.min(255, c[1] * k);
      d[i + 2] = Math.min(255, c[2] * k);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

/** 울퉁불퉁한 덩어리(정이십면체를 잡음으로 부풀린다). lobes면 두 덩이가 붙은 모양. 꼭짓점 색(밝고 어두운 얼룩)도 함께. */
function lumpyGeometry(TH: typeof T, o: { detail: number; amp: number; freq: number; seed: number; lobes?: boolean; smooth?: boolean; base: number[]; dark: number[]; light: number[] }): T.BufferGeometry {
  let g: T.BufferGeometry = new TH.IcosahedronGeometry(1, o.detail);
  if (o.smooth) g = mergeByPosition(TH, g); // 꼭짓점을 이어 붙여야 법선이 매끈해진다(정이십면체는 면마다 꼭짓점이 따로다)
  const pos = g.attributes.position as T.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const v = new TH.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    let r = 1 + o.amp * (fbm3(v.x * o.freq + 3, v.y * o.freq, v.z * o.freq, o.seed) - 0.5) * 2;
    if (o.lobes) {
      // 두 덩이: x축으로 길게, 가운데는 잘록하게(목)
      r *= 1 + 0.42 * v.x * v.x - 0.2 * Math.exp(-((v.x / 0.32) ** 2));
      if (v.x > 0) r *= 0.84; // 한쪽 덩이가 더 작다
    }
    pos.setXYZ(i, v.x * r, v.y * r * 0.86, v.z * r * 0.9);
    const t = fbm3(v.x * 5 + 9, v.y * 5, v.z * 5, o.seed + 5, 3);
    const c = t < 0.5 ? mixC(o.dark, o.base, smooth(0.25, 0.5, t)) : mixC(o.base, o.light, smooth(0.5, 0.78, t));
    // 꼭짓점 색은 선형 공간 값이다(sRGB 값을 그대로 넣으면 밝게 바랜다)
    col[i * 3] = (c[0] / 255) ** 2.2;
    col[i * 3 + 1] = (c[1] / 255) ** 2.2;
    col[i * 3 + 2] = (c[2] / 255) ** 2.2;
  }
  g.setAttribute("color", new TH.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/** 같은 자리의 꼭짓점을 하나로(색인 있는 기하로). */
function mergeByPosition(TH: typeof T, g: T.BufferGeometry): T.BufferGeometry {
  const pos = g.attributes.position as T.BufferAttribute;
  const map = new Map<string, number>();
  const out: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    let k = map.get(key);
    if (k === undefined) {
      k = out.length / 3;
      map.set(key, k);
      out.push(x, y, z);
    }
    idx.push(k);
  }
  const m = new TH.BufferGeometry();
  m.setAttribute("position", new TH.BufferAttribute(new Float32Array(out), 3));
  m.setIndex(idx);
  g.dispose();
  return m;
}

/** 혜성 꼬리 그림판(가로 = 꼬리 방향, 왼쪽 끝이 머리). 머리 쪽은 좁고 밝으며, 갈수록 넓어지고 옅어진다. */
function tailCanvas(): HTMLCanvasElement {
  const W = 512;
  const Hh = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = Hh;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(W, Hh);
  const d = img.data;
  for (let x = 0; x < W; x++) {
    const u = x / (W - 1);
    const half = 0.06 + 0.4 * Math.pow(u, 0.75); // 반폭(그림판 높이 대비)
    const along = Math.pow(1 - u, 1.35) * (0.55 + 0.45 * smooth(0, 0.06, u));
    for (let y = 0; y < Hh; y++) {
      const vv = Math.abs(y / (Hh - 1) - 0.5) / half;
      const across = Math.exp(-vv * vv * 2.2);
      const core = Math.exp(-vv * vv * 18) * (1 - u) * 0.55;
      const a = clamp(along * across + core * along, 0, 1);
      const i = (y * W + x) * 4;
      // 가운데는 희고, 가장자리와 끝은 푸르스름하게
      d[i] = 200 + 55 * (1 - Math.min(1, vv)) * (1 - u * 0.6);
      d[i + 1] = 225 + 30 * (1 - Math.min(1, vv));
      d[i + 2] = 255;
      d[i + 3] = Math.round(a * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// ── 바구니의 작은 그림(3D에서 본 천체) ───────────────────────────────
const P_URL = (f: string): string => `${import.meta.env.BASE_URL}photos/${f}`;
/** 사진 속 원판(가운데 cx, cy, 반지름 r, 사진 크기 w×h)을 지름 24px 원에 담는다. */
function photoDot(id: string, f: string, cx: number, cy: number, r: number, w: number, h: number): string {
  const s = 12 / r;
  return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><clipPath id="u7ti-${id}"><circle cx="12" cy="12" r="12"/></clipPath><image href="${P_URL(f)}" x="${(12 - cx * s).toFixed(2)}" y="${(12 - cy * s).toFixed(2)}" width="${(w * s).toFixed(2)}" height="${(h * s).toFixed(2)}" clip-path="url(#u7ti-${id})"/><path class="u7x-night" d="M12 0a12 12 0 0 0 0 24z" fill="rgba(5,9,18,.82)"/></svg>`;
}
const KIND_ICON: Record<string, string> = {
  sun: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><clipPath id="u7ti-sun"><circle cx="12" cy="12" r="11"/></clipPath><circle class="u7x-glow" cx="12" cy="12" r="12" fill="rgba(255,176,58,.5)"/><image href="${P_URL("sun_active.jpg")}" x="${(12 - 567 * (11 / 532)).toFixed(2)}" y="${(12 - 567 * (11 / 532)).toFixed(2)}" width="${(1100 * (11 / 532)).toFixed(2)}" height="${(1100 * (11 / 532)).toFixed(2)}" clip-path="url(#u7ti-sun)"/></svg>`,
  planet: photoDot("pl", "earth_apollo17.jpg", 958.4, 955.8, 858.1, 1920, 1921),
  moon: photoDot("mo", "moon_lro.jpg", 699.5, 699.5, 699.5, 1400, 1400),
  belt: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><defs><radialGradient id="u7ti-rk" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#9C958C"/><stop offset=".55" stop-color="#6E6760"/><stop offset="1" stop-color="#3F3A35"/></radialGradient></defs><path d="M5.2 8.6 9.4 4.9l5.6.3 4.5 3.9.8 5.6-3.4 4.6-6 .9-4.6-2.6-1.9-4.7z" fill="url(#u7ti-rk)" stroke="#2F2B27" stroke-width="1"/><circle cx="10.6" cy="10" r="1.6" fill="#4F4943"/><circle cx="15" cy="14.6" r="1.1" fill="#4F4943"/></svg>`,
  comet: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><defs><linearGradient id="u7ti-tl" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6FF" stop-opacity=".95"/><stop offset="1" stop-color="#8CC4FF" stop-opacity="0"/></linearGradient></defs><path d="M17.6 6.6C12 9 5 14.5 1.5 22.5 7.5 17.5 13.4 13.6 19 9.6z" fill="url(#u7ti-tl)"/><circle cx="18.4" cy="7.6" r="4" fill="rgba(200,230,255,.45)"/><circle cx="18.4" cy="7.6" r="2" fill="#5A544E"/></svg>`,
  dwarf: photoDot("dw", "star/pluto.webp", 622, 612, 536, 1280, 1280),
};

export const u7TourLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TourStep;

  const f = u7Frame(host, { title: s.title, steps: 3, cls: "u7x-enter", api });
  const doneCta = s.cta ?? "개념 정리하기";
  const enterBtn = el("button", { class: "u7x-enterbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 태양계 둘러보기" })) as HTMLButtonElement;
  f.stage.append(el("div", { class: "u7x-enter-art", html: tourArtSvg() }), enterBtn, el("div", { class: "u7x-credit", text: "행성 표면: Solar System Scope(CC BY 4.0) · 사진: NASA" }));
  const goalsUi = u7Goals(3, KINDS.map((k) => ({ id: k.id, name: k.name, sub: "눌러서 확인" })));
  f.slot.setControls(el("div", { class: "u7x-cap", text: "태양계를 이루는 여섯 종류의 천체를 찾아보세요" }), goalsUi.el);
  f.say("가로 화면을 열어 태양계를 둘러보며 <b>여섯 종류의 천체</b>를 모두 찾아 눌러 보세요.");
  f.pips(1);
  host.dataset.u7Phase = "tour";

  const visited = new Set<string>();
  let finished = false;
  let asked = false;
  let missionEl: HTMLElement | null = null;
  let doneBar: HTMLElement | null = null;
  let ratioNote: HTMLElement | null = null;
  let pillEl: HTMLElement | null = null;

  function syncMission(): void {
    for (const k of KINDS) {
      const chip = missionEl?.querySelector(`[data-g="${k.id}"]`) as HTMLElement | null;
      if (chip) chip.classList.toggle("on", goalsUi.has(k.id));
    }
    if (finished && rot && !doneBar) {
      // 가로 화면 안에서 끝을 알린다(세로 화면으로 돌아가야 정리가 이어진다)
      const back = el("button", { class: "u7x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
      back.addEventListener("click", () => rot?.leave());
      doneBar = el("div", { class: "u7x-rotdone" }, el("span", { text: "여섯 종류의 천체를 모두 확인했어요!" }), back);
      rot.stage.appendChild(doneBar);
      ratioNote?.classList.add("hide"); // 끝 알림과 겹치지 않게
      pillEl?.classList.add("hide"); // 둘째 줄의 상태 알약도 끝 알림과 겹친다(알림이 같은 말을 한다)
    }
  }

  function checkGoals(): void {
    for (const k of KINDS) {
      if (!goalsUi.has(k.id) && k.keys.some((x) => visited.has(x))) {
        goalsUi.done(k.id, k.found);
        haptic(HAPTIC.ctaUnlock);
      }
    }
    host.dataset.u7Found = String(goalsUi.count());
    if (goalsUi.count() === KINDS.length) finished = true;
    syncMission();
  }

  // 돌아온 뒤: 단서 카드를 한 장씩 읽고 알맞은 천체 바구니를 고른다. 바구니는 무대(그림과 이름, 담긴 단서)와 조작 칸(누르는 버튼)에
  // 같은 차례로 놓인다. 맞으면 누른 버튼에 체크, 무대 바구니에 단서의 짧은 말이 남고 다음 카드로 넘어간다.
  // 틀리면 누른 버튼에 가위표가 남고(그 카드 동안 다시 누를 수 없다), 도움말이 가로 화면에서 본 것을 짚어 다시 고르게 한다.
  // 태양 카드에서 틀리면 근거를 그림으로: 바구니의 행성, 위성, 왜소 행성 그림은 태양 반대쪽 절반이 어두워지고 태양만 빛난다.
  function startClues(): void {
    asked = true;
    host.dataset.u7Phase = "clues";
    f.pips(2);
    api.setCTA("단서에 맞는 천체 바구니를 골라 보세요", { enabled: false });
    const notes = new Map<string, HTMLElement>();
    const baskets = new Map<string, HTMLElement>();
    const board = el("div", { class: "u7x-bk-board" });
    for (const k of KINDS) {
      const note = el("i", { class: "u7x-bk-note" });
      const b = el("div", { class: "u7x-bk", dataset: { k: k.id } }, el("span", { class: "u7x-ficon", html: KIND_ICON[k.id] ?? "" }), el("b", { text: k.name }), note);
      notes.set(k.id, note);
      baskets.set(k.id, b);
      board.appendChild(b);
    }
    f.stage.replaceChildren(board);
    f.stage.classList.add("u7x-bkstage");
    const num = el("span", { class: "u7x-clue-n" });
    const txt = el("span", { class: "u7x-clue-t" });
    const card = el("div", { class: "u7x-clue", attrs: { role: "status" } }, num, txt);
    const btns = KINDS.map((k) => {
      const b = el("button", { class: "u7x-segbtn u7x-bkbtn", attrs: { type: "button" }, dataset: { k: k.id } }, el("span", { class: "u7x-bk-ic", attrs: { "aria-hidden": "true" } }), el("span", { text: k.name })) as HTMLButtonElement;
      b.addEventListener("click", () => pick(k.id, b));
      return b;
    });
    f.slot.setControls(card, el("div", { class: "u7x-seg three" }, ...btns));
    let ci = 0;
    let busy = false;
    let graded = false;
    const mark = (): void => {
      host.dataset.u7Clue = String(ci);
      host.dataset.u7Busy = busy ? "1" : "0";
      if (import.meta.env.DEV) host.dataset.u7Want = CLUES[ci]?.kind ?? "";
    };
    const show = (): void => {
      const c = CLUES[ci];
      num.textContent = `단서 ${ci + 1} / ${CLUES.length}`;
      txt.innerHTML = c.t;
      btns.forEach((b) => {
        b.classList.remove("ok", "miss");
        b.disabled = false;
        (b.firstElementChild as HTMLElement).innerHTML = "";
      });
      card.classList.remove("in");
      void card.offsetWidth;
      card.classList.add("in");
      f.say(ci === 0 ? "가로 화면에서 만난 천체를 떠올리며 <b>단서</b>에 맞는 바구니를 골라 보세요." : "다음 단서예요. 알맞은 천체 바구니를 골라 보세요.");
      busy = false;
      mark();
    };
    function pick(kind: string, b: HTMLButtonElement): void {
      if (busy || b.disabled) return;
      const c = CLUES[ci];
      const right = kind === c.kind;
      if (!graded) {
        graded = true;
        api.recordQuiz(right); // 채점은 첫 카드의 첫 답 한 번
      }
      const ic = b.firstElementChild as HTMLElement;
      if (!right) {
        haptic(HAPTIC.wrong);
        b.classList.add("miss");
        b.disabled = true;
        ic.innerHTML = icon("xThick", 11);
        const bk = baskets.get(kind);
        bk?.classList.remove("no");
        void bk?.offsetWidth;
        bk?.classList.add("no");
        if (c.kind === "sun") board.classList.add("u7x-lit");
        f.say(`아니에요. ${c.hint}`);
        host.dataset.u7Miss = String(Number(host.dataset.u7Miss ?? "0") + 1);
        mark();
        return;
      }
      haptic(HAPTIC.correct);
      busy = true;
      btns.forEach((x) => (x.disabled = true));
      b.classList.add("ok");
      ic.innerHTML = icon("check", 11);
      const bk = baskets.get(kind);
      bk?.classList.remove("no");
      bk?.classList.add("full");
      const note = notes.get(kind);
      if (note) note.textContent = c.note;
      const name = KINDS.find((k) => k.id === kind)?.name ?? "";
      f.say(`맞아요! 단서를 <b>${name}</b> 바구니에 담았어요.`);
      ci += 1;
      mark();
      window.setTimeout(() => {
        if (disposed) return;
        if (ci < CLUES.length) show();
        else conclude();
      }, 900);
    }
    show();
  }

  function conclude(): void {
    host.dataset.u7Phase = "done";
    f.pips(3);
    f.say("단서 여섯 장을 모두 알맞은 천체 바구니에 담았어요!");
    f.slot.conclude("태양계에서 스스로 빛을 내는 천체는 <b>태양</b>뿐이에요. <b>행성, 왜소 행성, 소행성, 혜성</b>은 태양 주위를 돌고, <b>위성</b>은 행성 주위를 돌아요.");
    api.enableCTA(doneCta);
  }

  // ---- 가로 스테이지 + 3D ----
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let loop: Loop | null = null;
  let disposed = false;

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "화면을 끌어 돌려 보며 여섯 종류의 천체를 찾아 눌러 보세요", onLeave: () => leave() });
    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    // 상태 알약은 둘째 줄(u7x-rpill)에 둔다: 글이 길어져 첫 줄의 가운데 제목과 겹치지 않게(폰 가로 폭 660~850px)
    const pill = el("div", { class: "pill sp3-pill u7x-rpill" }, el("span", { class: "pdot", style: "background:#FFB03A" }), el("span", { text: "천체를 눌러 보세요" }));
    pillEl = pill;
    missionEl = el("div", { class: "sp3-missions u7x-missions" }, ...KINDS.map((k) => el("span", { dataset: { g: k.id }, text: k.name })));
    // 이름표는 화면 글자(12.5px)로 천체를 따라다닌다. 크기와 거리가 실제 비율이 아님을 한 줄로 알린다.
    const labelLayer = el("div", { class: "u7x-tlabels", attrs: { "aria-hidden": "true" } });
    ratioNote = el("div", { class: "u7x-ratio", text: "천체의 크기와 거리는 보기 쉽게 조절한 모형이에요" });
    syncMission();
    const zoomIn = el("button", { class: "sp3-zbtn", attrs: { type: "button", "aria-label": "확대" }, text: "+" });
    const zoomOut = el("button", { class: "sp3-zbtn", attrs: { type: "button", "aria-label": "축소" }, text: "−" });
    const zoomCtl = el("div", { class: "sp3-zoomctl" }, zoomIn, zoomOut);
    const card = el("div", { class: "sp3-card u7x-tcard" });
    rot.stage.append(canvas, labelLayer, pill, ratioNote, missionEl, zoomCtl, card);
    const pillText = pill.querySelectorAll("span")[1] as HTMLElement;

    const S = await import("../../../ui/space3d");
    if (disposed || !rot) return;
    const THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 38 });
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
    const { scene } = st;
    scene.add(S.makeStars(1200, 420));
    scene.add(S.makeMilkyWay(460));
    // 태양광(중심 점광) + 부드러운 앰비언트: 밤면이 새까맣지 않게
    const sunLight = new THREE.PointLight(0xfff2dc, 2.4, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x51617f, 0.85));

    const meshes = new Map<string, T.Object3D>();
    const angles = new Map<string, number>();
    // 화면 글자 이름표: [이름표, 따라갈 물체(없으면 고정 자리), 물체 반지름, 앞설 차례(작을수록 먼저)]
    const tags: { el: HTMLElement; obj: T.Object3D | null; at: T.Vector3; r: number; prio: number; w: number; h: number }[] = [];
    const addTag = (text: string, obj: T.Object3D | null, r: number, prio: number, cls = "", at = new THREE.Vector3()): void => {
      const e = el("span", { class: `u7x-tlabel${cls ? " " + cls : ""}`, text });
      labelLayer.appendChild(e);
      tags.push({ el: e, obj, at, r, prio, w: 0, h: 0 });
    };
    const PRIO: Record<string, number> = { sun: 0, earth: 1, jupiter: 2, saturn: 3, mars: 4, venus: 5, mercury: 6, uranus: 7, neptune: 8, pluto: 9 };

    for (const b of BODIES) {
      let m: T.Mesh;
      if (b.key === "pluto") {
        const tex = new THREE.CanvasTexture(plutoCanvas());
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        m = new THREE.Mesh(new THREE.SphereGeometry(b.r, 48, 32), new THREE.MeshLambertMaterial({ map: tex }));
      } else m = S.makePlanet(b.kind, b.r, b.r > 4 ? 56 : 40);
      m.userData.key = b.key;
      scene.add(m);
      meshes.set(b.key, m);
      angles.set(b.key, (b.d * 2.399) % (Math.PI * 2)); // 저마다 다른 출발 각도
      if (b.d > 0) scene.add(S.makeOrbitLine(b.d, "#5E7CA8", 0.28, 160));
      addTag(b.name, m, b.r, PRIO[b.key] ?? 9, b.key === "sun" ? "sun" : "");
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
        m.rotation.z = Math.PI / 2 - 0.14; // 누운 자전축: 고리가 세로로 선다
        (ring as T.Mesh).rotation.x = -Math.PI / 2;
      }
    }

    // 달(지구 위성)
    const moon = S.makePlanet("moon", 0.5, 28);
    moon.userData.key = "moon";
    scene.add(moon);
    meshes.set("moon", moon);

    // 소행성대: 화성(36)~목성(58) 사이. 울퉁불퉁한 바위 셋 × 200(크기와 방향, 색을 저마다)
    const belt = new THREE.Group();
    {
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const eul = new THREE.Euler();
      const colr = new THREE.Color();
      let seed = 7;
      const rnd = (): number => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      const between = (a: number, b2: number): number => a + rnd() * (b2 - a);
      for (let kind = 0; kind < 3; kind++) {
        const geo = lumpyGeometry(THREE, { detail: 1, amp: 0.3, freq: 1.6, seed: 101 + kind * 31, base: [150, 140, 128], dark: [104, 96, 88], light: [184, 175, 162] });
        const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
        const N = 200;
        const inst = new THREE.InstancedMesh(geo, mat, N);
        for (let i = 0; i < N; i++) {
          const a = rnd() * Math.PI * 2;
          const rr = between(42.5, 51.5);
          eul.set(rnd() * 3, rnd() * 3, rnd() * 3);
          q.setFromEuler(eul);
          const sc = 0.16 + Math.pow(rnd(), 2.2) * 0.62; // 작은 것이 많고 큰 것은 드물다
          m4.compose(new THREE.Vector3(Math.cos(a) * rr, between(-1.2, 1.2), Math.sin(a) * rr), q, new THREE.Vector3(sc * between(0.8, 1.4), sc * between(0.6, 1), sc * between(0.7, 1.1)));
          inst.setMatrixAt(i, m4);
          const tone = between(0.72, 1.12);
          colr.setRGB(tone * between(0.95, 1.05), tone, tone * between(0.88, 1));
          inst.setColorAt(i, colr);
        }
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        belt.add(inst);
      }
    }
    scene.add(belt);
    // 벨트 탭 판정용 투명 도넛 프록시
    const beltProxy = new THREE.Mesh(
      new THREE.TorusGeometry(47, 4.6, 10, 56),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    );
    beltProxy.rotation.x = Math.PI / 2;
    beltProxy.userData.key = "belt";
    scene.add(beltProxy);
    meshes.set("belt", beltProxy);
    addTag("소행성대", null, 1.2, 4.5, "dim", new THREE.Vector3(0, 1.2, -47));

    // 혜성: 울퉁불퉁한 어두운 핵 + 머리의 희미한 빛(코마) + 태양 반대쪽으로 뻗는 꼬리 한 장
    const comet = new THREE.Mesh(
      lumpyGeometry(THREE, { detail: 4, amp: 0.13, freq: 2.2, seed: 77, lobes: true, smooth: true, base: [112, 104, 96], dark: [70, 64, 58], light: [150, 142, 132] }),
      new THREE.MeshLambertMaterial({ vertexColors: true }),
    );
    comet.scale.setScalar(0.42);
    comet.userData.key = "comet";
    scene.add(comet);
    meshes.set("comet", comet);
    const coma = S.makeGlow(2.6, "rgba(196,226,255,.55)", 0.2);
    coma.material.opacity = 0.75;
    scene.add(coma);
    const tailTex = new THREE.CanvasTexture(tailCanvas());
    tailTex.colorSpace = THREE.SRGBColorSpace;
    const tail = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: tailTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    tail.matrixAutoUpdate = false;
    tail.frustumCulled = false;
    scene.add(tail);
    // 누르기 판정용 투명 공: 색도 깊이도 쓰지 않는다(깊이를 쓰면 뒤의 꼬리와 은하수가 그 모양대로 가려져 보인다)
    const hidden = (): T.MeshBasicMaterial => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
    const cometProxy = new THREE.Mesh(new THREE.SphereGeometry(3.2, 10, 8), hidden());
    cometProxy.userData.key = "comet";
    scene.add(cometProxy);
    // 명왕성 탭 판정용 투명 프록시(혜성 프록시 문법 재사용: 작은 천체는 직접 탭이 어렵다)
    const plutoProxy = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 8), hidden());
    plutoProxy.userData.key = "pluto";
    scene.add(plutoProxy);

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
      if (key === "belt") return 13; // 띠 위 가까운 곳: 바위들이 화면을 채운다
      if (key === "comet") return 9; // 머리와 꼬리가 함께 보이게
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
        statChip("떨어진 거리", info.dist),
        statChip("크기", info.size),
        statChip("표면 중력", info.grav),
      );
      card.append(
        el("b", { text: info.name }),
        stats,
        el("p", { html: info.fact }),
        el("p", { class: "sp3-more", html: info.more }),
        el("button", { class: "sp3-cardclose", attrs: { type: "button" }, text: "계속 둘러보기" }),
      );
      card.classList.add("show");
      (card.querySelector(".sp3-cardclose") as HTMLButtonElement).addEventListener("click", closeCard);
      pillText.textContent = `${info.name} 살펴보는 중`;
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

    // 검사용(개발 서버에서만): 번호로 천체를 만난다
    u7Dev(host, { visit: (i: number) => openCard(DEV_KEYS[i]), close: () => closeCard() });

    // ---- 프레임 ----
    let t = 0;
    const wOf = (d: number): number => 0.00042 * Math.pow(16 / Math.max(d, 1), 1.5) * 16; // 안쪽일수록 빠르게
    const v3 = new THREE.Vector3();
    const v4 = new THREE.Vector3();
    const ax = new THREE.Vector3();
    const ay = new THREE.Vector3();
    const az = new THREE.Vector3();
    const mtx = new THREE.Matrix4();
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

      // 혜성: 길쭉한 타원(태양이 한 초점). 꼬리는 늘 태양 반대쪽이고, 태양에 가까울수록 길다
      const ce = 0.62;
      const caM = t * 0.00013 + 2.1;
      const cr = (30 * (1 - ce * ce)) / (1 + ce * Math.cos(caM));
      const cx = Math.cos(caM) * cr;
      const cz = Math.sin(caM) * cr * 0.9 - 8;
      comet.position.set(cx, 1.4, cz);
      comet.rotation.y += 0.002 * dt;
      comet.rotation.x += 0.0013 * dt;
      cometProxy.position.copy(comet.position);
      coma.position.copy(comet.position);
      const dSun = comet.position.length();
      const L = clamp(27 - 0.48 * dSun, 5, 19);
      ax.copy(comet.position).normalize(); // 태양 → 혜성 = 꼬리 방향
      v3.copy(comet.position).addScaledVector(ax, L / 2); // 꼬리 판의 가운데
      az.subVectors(st.camera.position, v3);
      az.addScaledVector(ax, -az.dot(ax)).normalize(); // 꼬리 축을 품고 사진기를 바라보는 면
      ay.crossVectors(az, ax).normalize();
      mtx.makeBasis(ax, ay, az);
      mtx.scale(v4.set(L, 0.9 + 0.3 * L, 1));
      mtx.setPosition(v3.copy(comet.position).addScaledVector(ax, L / 2 - 0.2));
      tail.matrix.copy(mtx);
      tail.matrixWorldNeedsUpdate = true;

      // 이름표: 화면 글자로 천체 위에. 가까이 다가가면 옅어지고, 겹치면 앞설 차례가 늦은 쪽을 숨긴다
      const fade = clamp((camR - 22) / 30, 0, 1) * 0.96;
      const placed: [number, number, number, number][] = [];
      const order = [...tags].sort((a2, b2) => a2.prio - b2.prio);
      for (const tg of order) {
        if (tg.obj) tg.obj.getWorldPosition(v3);
        else v3.copy(tg.at);
        v4.copy(v3);
        v3.project(st.camera);
        const behind = v3.z > 1 || fade <= 0.01;
        v4.y += tg.r;
        v4.project(st.camera);
        const sx = ((v3.x + 1) / 2) * w;
        const sy = ((1 - v3.y) / 2) * h;
        const rpx = Math.abs(((1 - v4.y) / 2) * h - sy);
        if (!tg.w) {
          tg.w = tg.el.offsetWidth;
          tg.h = tg.el.offsetHeight;
        }
        const x0 = sx - tg.w / 2;
        const y0 = sy - rpx - 6 - tg.h;
        const hit = behind || placed.some(([px, py, pw, ph]) => x0 < px + pw && x0 + tg.w > px && y0 < py + ph && y0 + tg.h > py);
        tg.el.style.opacity = hit ? "0" : fade.toFixed(2);
        tg.el.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px)`;
        if (!hit) placed.push([x0 - 3, y0 - 2, tg.w + 6, tg.h + 4]);
      }

      // 포커스 대상 추적
      if (focus) {
        const obj = meshes.get(focus)!;
        const wp = new THREE.Vector3();
        obj.getWorldPosition(wp);
        if (focus === "belt") {
          // 도넛 가운데가 아니라 사진기 쪽 띠 위의 한 점을 겨눈다(바위가 화면을 채운다)
          wp.set(Math.sin(camTheta) * 47, 0, Math.cos(camTheta) * 47);
        }
        targetGoal.copy(wp);
      }
      if (!focus) {
        pillText.textContent = finished ? "여섯 종류의 천체를 모두 확인했어요!" : visited.size ? `6가지 중 ${goalsUi.count()}가지 확인! 다른 천체도 눌러 보세요` : "화면을 끌어 돌려 보며 천체를 눌러 보세요";
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
    doneBar = null;
    ratioNote = null;
    pillEl = null;
    enterBtn.classList.remove("pulse");
    if (finished) {
      enterBtn.querySelector("span")!.textContent = "다시 둘러보기";
      if (!asked) startClues();
    } else {
      enterBtn.querySelector("span")!.textContent = "가로 화면 다시 열기";
      f.say("아직 확인하지 않은 천체가 남았어요. 가로 화면을 다시 열어 <b>남은 천체</b>를 찾아 눌러 보세요.");
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("가로 화면에서 여섯 천체를 찾아보세요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

/** 입구 그림: 태양 둘레를 도는 행성들(실사 원판, 모두 NASA 공공 저작물). 태양은 아래로 크게 걸치고, 지구, 화성, 목성, 토성이 저마다의 궤도 위에 있다.
 *  사진(public/photos)의 원판 가운데와 반지름은 사진마다 잰 값이다. 토성은 고리가 든 사진이라 검은 바탕을 화면 섞기(screen)로 지운다. */
function tourArtSvg(): string {
  const disk = (id: string, f: string, pcx: number, pcy: number, pr: number, pw: number, ph: number, x: number, y: number, r: number): string => {
    const s = r / pr;
    return `<clipPath id="tr-${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><image href="${P_URL(f)}" x="${(x - pcx * s).toFixed(2)}" y="${(y - pcy * s).toFixed(2)}" width="${(pw * s).toFixed(2)}" height="${(ph * s).toFixed(2)}" clip-path="url(#tr-${id})"/>`;
  };
  const SR = 42;
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <clipPath id="tr-frame"><rect x="0" y="0" width="280" height="96" rx="16"/></clipPath>
      <radialGradient id="tr-glow" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#FFD27A" stop-opacity=".6"/><stop offset="1" stop-color="#FF9A2E" stop-opacity="0"/></radialGradient>
    </defs>
    <g clip-path="url(#tr-frame)">
      <rect x="0" y="0" width="280" height="96" fill="#0B1524"/>
      <circle cx="36" cy="20" r="1.2" fill="#DCE8FF"/><circle cx="240" cy="18" r="1.2" fill="#DCE8FF"/>
      <circle cx="200" cy="80" r="1" fill="#DCE8FF"/><circle cx="130" cy="12" r="1" fill="#DCE8FF"/><circle cx="262" cy="56" r=".9" fill="#DCE8FF"/>
      <g transform="translate(140 116)">
        <circle r="62" stroke="#31446E" stroke-width="1.2"/>
        <circle r="86" stroke="#31446E" stroke-width="1.2"/>
        <circle r="108" stroke="#31446E" stroke-width="1.2" stroke-dasharray="2 5"/>
        <circle r="129" stroke="#31446E" stroke-width="1.2"/>
        <circle r="145" stroke="#31446E" stroke-width="1.2"/>
      </g>
      <circle cx="140" cy="116" r="${SR + 20}" fill="url(#tr-glow)"/>
      ${disk("sun", "sun_active.jpg", 567, 567, 532, 1100, 1100, 140, 116, SR)}
      ${disk("ea", "earth_apollo17.jpg", 958.4, 955.8, 858.1, 1920, 1921, 140, 54, 4.8)}
      ${disk("ma", "mars.jpg", 598.8, 600.3, 523.8, 1200, 1200, 82, 52, 3.6)}
      ${disk("ju", "jupiter.jpg", 472.1, 468.4, 428.1, 940, 940, 52, 22, 10.5)}
      <image href="${P_URL("saturn_cassini.jpg")}" x="238" y="19.8" width="34" height="16.5" style="mix-blend-mode:screen"/>
    </g>
  </svg>`;
}
