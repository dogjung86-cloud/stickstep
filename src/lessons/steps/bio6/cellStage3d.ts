// [중1 Ⅱ v5] u2l2 세포 구조 랩의 입체 무대(three.js). 동물세포와 식물세포.
// 2026-11-11 사용자 판정: "입체 느낌이 좋다. 다만 손으로 돌려 가며 살펴보는 기능은 넣지 않는다. Ⅱ단원에서는 세포만 입체로 한다."
//   각도는 고정이다. 가만히 두면 아주 조금 좌우로 흔들려 앞뒤 깊이가 보일 뿐이고, 손으로 돌릴 수 없다.
//   모형 속 구조를 누르면 카드와 같이 그 구조가 멈춘다(누르기만 받는다. 끌기는 화면 넘기기에 양보한다).
// 평면 무대(cellStageFlat.ts)와 같은 것: 구조의 색(bio6Kit.BV), 멈춘 결과(양분이 튕겨 나감, 조절의 고리가 사라지고 뒤죽박죽,
//   에너지가 꺼짐, 양분이 생기지 않음, 모양이 처짐), 판정 국면에서는 멈춘 구조를 회색으로 칠하지 않는 것, 이름표와 범례.
// 다른 것: 세포막은 선이 아니라 세포를 온통 둘러싼 막이고, 식물세포는 두꺼운 벽을 두른 납작한 육각 상자다.
//   벽 바로 안쪽에 세포막이 한 겹 보인다(과학 가드: 식물세포의 벽은 막 바깥).
// 규칙(SCI_GUIDE 3D 절): three는 ui/space3d를 동적 import로만 싣는다. 그리기 루프는 이 무대의 createLoop가 갖고, dispose에서 반납한다.
//   랩의 진행(멈춤, 굶음, 판정)은 랩 쪽 타이머가 돌린다. 그리기 루프가 멈춘 환경에서도 랩은 끝까지 진행된다.
//   켜지 못하면 onFail을 불러 랩이 평면 무대로 바꾸게 한다.
// CSS 접두는 .cwm-(styles/bio6.css). 직접 쓴 셰이더는 끝에 colorspace_fragment를 넣어야 색이 탁해지지 않는다(넣지 않으면 선형 값이 그대로 나가 어둡다).

import type * as T from "three";
import { createLoop, type Loop } from "../../../core/anim";
import { el } from "../../../core/dom";
import { BV } from "../../../ui/bio6Kit";
import type { SpaceStage } from "../../../ui/space3d";
import { BOLT, CELL_LEGEND, P_C, P_HEX, type CellKey, type CellStage, type CellStageOpts, type CellState } from "./cellStage";

type V3 = [number, number, number];

// ── 이 기기에서 입체 무대를 쓸 수 있는가 ───────────────────────────
let glOk: boolean | null = null;
export function canModel(): boolean {
  try {
    if (sessionStorage.getItem("ss.cellflat") === "1") return false; // 검사와 견주어 보기용: 평면 무대로
  } catch {
    /* 세션 저장소를 못 쓰는 환경 */
  }
  if (glOk === null) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2"); // three는 WebGL2만 쓴다
      glOk = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); // 알아보는 데 쓴 컨텍스트는 바로 돌려준다
    } catch {
      glOk = false;
    }
  }
  return glOk;
}

// ── 동물세포의 치수(세포 반지름을 1로) ─────────────────────────────
const A_NUC: V3 = [0.08, 0.04, -0.05];
const A_NUC_R = 0.36;
/** 핵의 짙은 얼룩이 놓이는 자리(256×128 무늬 판에서. 가로 64가 보는 쪽 정면이다) */
const NUC_SPOT: [number, number] = [79, 67];
/** 마이토콘드리아 셋: 자리와 누운 방향(오일러 각) */
const A_MITO: { p: V3; r: V3 }[] = [
  { p: [-0.54, 0.3, 0.28], r: [0.3, 0.2, 1.1] },
  { p: [0.56, -0.26, 0.3], r: [-0.2, 0.5, -0.9] },
  { p: [-0.28, -0.46, -0.3], r: [0.15, 0.3, 0.75] },
];
/** 양분 여섯 알이 들어오는 방향(세포 바깥에서 가운데 쪽으로). 보는 쪽에서 볼 때 세포의 옆, 위, 아래다.
 *  막 밖의 양분이 세포 앞에 겹쳐 안에 든 것처럼 보이지 않게 앞쪽(z)으로는 거의 내지 않았다. 이름표 자리도 피했다. */
const A_NUTR: V3[] = [[-1, 0.12, 0.1], [1, -0.08, 0.12], [-0.45, 0.9, 0.05], [0.5, 0.86, 0.08], [-0.7, -0.7, 0.1], [0.22, -0.97, 0.06]];
/** 양분 한 알의 한 바퀴(0~1)에서 막을 지나는 때와 쓰이기 시작하는 때. 막을 일찍 지나게 해 세포 안에 있는 시간을 길게 한다
 *  (밖에 오래 머물면 일하는 세포인데도 양분이 못 들어오는 것처럼 읽힌다. 2026-11-11 눈검수). */
const T_IN = 0.28;
const T_USE = 0.9;
/** 동물세포의 겉모양: 살짝 납작하고 울퉁불퉁한 공. 방향(단위 벡터)을 주면 겉까지의 점을 돌려준다. */
function blob(x: number, y: number, z: number, k = 1): V3 {
  const bump = 1 + 0.04 * Math.sin(x * 2.3 + 1.2) * Math.cos(y * 2.9) + 0.03 * Math.sin(z * 3.1 + 0.5);
  return [x * 1.1 * bump * k, y * 0.92 * bump * k, z * bump * k];
}

// ── 식물세포의 치수 ─────────────────────────────────────────────────
/** 설계 판 1px = 모형 0.011. 평면 무대와 같은 육각형을 쓴다(가운데를 원점으로, 위가 +y). */
const PX = 0.011;
const toModel = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [(x - P_C[0]) * PX, -(y - P_C[1]) * PX]);
const HEX = toModel(P_HEX);
/** 세포벽이 멈췄을 때 세포(막과 그 속)가 옮겨 가는 모양: 육각형 안쪽에 꼭 맞는 타원(가로 반지름, 세로 반지름).
 *  각만 풀리고 크기는 거의 그대로다(위아래와 비스듬한 변에 닿는다). 벽은 육각형 그대로 제자리에 남으므로 벽은 늘 막 바깥이다.
 *  거쳐 온 길(2026-11-11 눈검수): 벽 밖으로 퍼지게 하면 끊어진 벽의 선이 세포 속을 지나 "벽이 막 안쪽에 있다"로 읽혔고,
 *  눈에 띄게 작게 하면 "세포가 쪼그라들어 벽에서 떨어졌다"(물이 빠진 세포)로 읽혔다. */
const SAG_A = 1.163;
const SAG_B = 0.9;
/** 납작한 육각 상자의 앞뒤 반 두께 */
const P_DEPTH = 0.5;
/** 모서리의 둥글기(작을수록 상자, 1이면 공) */
const P_EDGE = 0.5;
const P_NUC: V3 = [-0.16, -0.1, -0.06];
const P_NUC_R = 0.3;
/** 누운 각 a는 평면 무대와 같은 값(화면에서 시계 방향, 도) */
const P_MITO: { p: V3; a: number }[] = [
  { p: [0.63, -0.35, 0.14], a: -14 },
  { p: [-0.67, -0.44, -0.08], a: 28 },
];
const P_CHL: { p: V3; a: number }[] = [
  { p: [-0.58, 0.44, 0.12], a: -16 },
  { p: [0.52, 0.35, -0.08], a: 12 },
  { p: [0.32, -0.59, 0.16], a: -24 },
  { p: [0.87, 0.0, -0.02], a: 80 },
];
/** 햇빛 줄기가 닿는 엽록체(핵을 가로지르지 않는 세 곳. 평면 무대와 같다) */
const P_RAYS = [0, 1, 3];

/** 가운데에서 각 th 방향으로 쏜 선이 다각형의 테두리와 만나는 거리. */
function polyRadius(pts: [number, number][], th: number): number {
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  let best = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    const ex = x2 - x1;
    const ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (x1 * ey - y1 * ex) / den;
    const u = (x1 * dy - y1 * dx) / den;
    if (t > best && u >= -1e-6 && u <= 1 + 1e-6) best = t;
  }
  return best;
}
const RN = 180;
/** 식물세포의 테두리 반지름 표(각도 RN칸). sag는 세포벽이 일을 멈춘 정도(0~1): 0이면 모서리만 살짝 둥글린 육각형, 1이면 그 안쪽에 꼭 맞는 타원. */
function radiusTable(sag: number): Float32Array {
  const raw = new Float32Array(RN);
  for (let i = 0; i < RN; i++) raw[i] = polyRadius(HEX, (i / RN) * Math.PI * 2);
  const w = Math.max(1, Math.round((RN * 0.09) / (Math.PI * 2)));
  const out = new Float32Array(RN);
  for (let i = 0; i < RN; i++) {
    let s = 0;
    for (let j = -w; j <= w; j++) s += raw[(i + j + RN) % RN];
    const hex = s / (2 * w + 1);
    const th = (i / RN) * Math.PI * 2;
    const oval = 1 / Math.hypot(Math.cos(th) / SAG_A, Math.sin(th) / SAG_B);
    out[i] = hex + (oval - hex) * sag;
  }
  return out;
}
const radiusAt = (tb: Float32Array, th: number): number => {
  const f = (((th / (Math.PI * 2)) % 1) + 1) % 1 * RN;
  const i = Math.floor(f) % RN;
  const k = f - Math.floor(f);
  return tb[i] * (1 - k) + tb[(i + 1) % RN] * k;
};
/** 식물세포의 겉모양: 방향(단위 벡터) → 겉의 점. 정면에서 보면 육각형이고, 앞뒤로는 모서리가 둥근 납작한 상자다. */
function tablet(tb: Float32Array, x: number, y: number, z: number): V3 {
  const th = Math.atan2(y, x);
  const u = Math.hypot(x, y);
  const phi = Math.atan2(z, u);
  const c = Math.pow(Math.max(0, Math.cos(phi)), P_EDGE);
  const s = Math.sign(z) * Math.pow(Math.abs(Math.sin(phi)), P_EDGE);
  const r = radiusAt(tb, th) * c;
  return [Math.cos(th) * r, Math.sin(th) * r, s * P_DEPTH];
}

const SUN = `<svg class="cwm-sun" viewBox="0 0 60 56" aria-hidden="true">
  <circle cx="30" cy="28" r="26" fill="#FFE066" opacity=".16"/>
  <path d="M30 2v9M30 45v9M4 28h9M47 28h9M11.6 9.6l6.4 6.4M42 40l6.4 6.4M11.6 46.4l6.4 -6.4M42 16l6.4 -6.4" stroke="#FFD43B" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="30" cy="28" r="12" fill="#FFE066" stroke="#F59F00" stroke-width="1.4"/>
</svg>`;

const VERT = `varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix * mv; }`;
/** 막과 벽: 보는 쪽에서 가장자리로 갈수록(겉이 옆으로 누울수록) 진한 띠가 되고, 가운데는 비쳐서 속이 보인다. 왼쪽 위에 빛이 맺힌다. */
const FRAG_BAND = `uniform vec3 uColor; uniform float uGray; uniform float uFade; uniform float uB0; uniform float uB1; uniform float uTint; uniform float uPx; uniform float uDash;
  varying vec3 vN; varying vec3 vV; varying vec3 vP;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    float f = 1.0 - abs(dot(n, v));
    // 띠의 굵기: 겉이 옆으로 누운 정도로 정하되, 화면에서 너무 가늘어지는 곳은 uPx(기기 픽셀)만큼은 지킨다
    float d = (1.0 - f) / max(fwidth(f), 0.0001);
    float edge = uPx > 0.0 ? 1.0 - smoothstep(uPx * 2.0, uPx * 2.0 + 3.0, d) : 0.0;
    float band = max(smoothstep(uB0, uB1, f), edge);
    // 멈춘 벽은 띠가 군데군데 끊어진다(둘레를 따라 스물두 토막. 평면 무대의 점선과 같은 뜻)
    float seg = step(0.42, fract(atan(vP.y, vP.x) * 22.0 / 6.2831853));
    vec3 c = mix(uColor, vec3(0.27, 0.31, 0.38), uGray);
    float hl = pow(max(dot(n, normalize(vec3(-0.45, 0.62, 0.64))), 0.0), 42.0) * 0.14 * (1.0 - uGray);
    vec3 col = mix(c * (0.9 + 0.16 * band), vec3(1.0), hl);
    // 끊어진 벽은 띠만 남긴다(가운데의 옅은 비침까지 토막 나면 부챗살 같은 줄이 생긴다)
    gl_FragColor = vec4(col, max(mix(uTint * (1.0 - uDash), 1.0, band) * uFade, hl) * mix(1.0, seg, uDash));
    #include <colorspace_fragment>
  }`;
/** 세포 속: 안쪽 벽(뒤쪽 면)만 그린다. 가운데는 밝고 가장자리로 갈수록 짙어져, 속이 들여다보이는 방이 된다. */
const FRAG_CYTO = `uniform vec3 uIn; uniform vec3 uOut; varying vec3 vN; varying vec3 vV;
  void main(){
    float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
    gl_FragColor = vec4(mix(uIn, uOut, smoothstep(0.3, 0.98, f)), 0.97);
    #include <colorspace_fragment>
  }`;

/** 입체 무대를 box(.bv-stage)에 놓는다. three는 여기서 동적으로 싣는다. */
export function modelCellStage(box: HTMLElement, o: CellStageOpts): CellStage {
  const plant = o.plant;
  const tagKeys: CellKey[] = plant ? ["chl", "wall"] : ["mem", "nuc", "mito"];
  const NAME: Record<CellKey, string> = { mem: "세포막", nuc: "핵", mito: "마이토콘드리아", chl: "엽록체", wall: "세포벽" };
  box.classList.add("cwm-stage");
  if (plant) box.classList.add("plant");

  // ── 무대의 요소: 캔버스 + 겹쳐 그리는 선(햇빛 줄기, 이름표의 이끎선) + 이름표 + 범례 ──
  const canvas = el("canvas", { class: "cwm-canvas", attrs: { role: "img", "aria-label": plant ? "햇빛을 받으며 일하는 식물세포의 입체 모형" : "일하고 있는 동물세포의 입체 모형" } }) as HTMLCanvasElement;
  const over = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  over.setAttribute("class", "cwm-over");
  over.setAttribute("aria-hidden", "true");
  over.innerHTML =
    (plant ? P_RAYS.map((_, i) => `<line class="cwm-ray cwk-ray" style="--d:${(-i * 0.6).toFixed(2)}s"/>`).join("") : "") +
    tagKeys.map((k) => `<g class="cwm-lead" data-k="${k}"><line/><circle r="2.4"/></g>`).join("");
  const tags = {} as Record<CellKey, HTMLElement>;
  tagKeys.forEach((k) => (tags[k] = el("div", { class: `cwm-tag t-${k}`, text: NAME[k] })));
  box.append(canvas, over);
  if (plant) box.insertAdjacentHTML("beforeend", SUN);
  box.append(...tagKeys.map((k) => tags[k]), el("div", { class: "cwk-legend", html: CELL_LEGEND }));

  let st: CellState = { off: null, starve: false, diag: false, hideTags: false };
  let dead = false;
  let st3: SpaceStage | null = null;
  let loop: Loop | null = null;
  let ro: ResizeObserver | null = null;
  let extra: (() => void) | null = null;
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  void (async () => {
    let S: typeof import("../../../ui/space3d");
    try {
      S = await import("../../../ui/space3d");
    } catch {
      if (!dead) o.onFail?.();
      return;
    }
    if (dead) return;
    const THREE: typeof T = S.THREE;
    st3 = S.createSpaceStage(canvas, { fov: 30 });
    if (!st3) {
      o.onFail?.();
      return;
    }
    const stage = st3;
    stage.renderer.setClearColor(0x000000, 0);
    stage.camera.position.set(0, 1.1, 4.62);
    stage.camera.lookAt(0, -0.03, 0);
    const scene = stage.scene;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb4bfd4, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(-2.4, 3.2, 3.6);
    scene.add(key);

    const YAW = plant ? -0.3 : -0.35; // 고정된 각도. 손으로 돌릴 수 없다
    const SWAY = still ? 0 : 0.07; // 가만히 있을 때의 흔들림(깊이가 보일 만큼만)
    const cell = new THREE.Group(); // 세포 전체(흔들림, 숨, 떨림이 여기에 걸린다)
    scene.add(cell);
    const inner = new THREE.Group(); // 세포 속 구조(식물세포의 벽이 무너지면 함께 눌린다)
    cell.add(inner);
    const V = (p: V3): T.Vector3 => new THREE.Vector3(p[0], p[1], p[2]);
    const GRAY = new THREE.Color("#8E97A6");
    const texes: T.Texture[] = [];
    const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): T.CanvasTexture => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      draw(c.getContext("2d") as CanvasRenderingContext2D);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      texes.push(t);
      return t;
    };
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75); // space3d가 잡는 값과 같다
    const bandMat = (color: string, b0: number, b1: number, tint: number, px: number): T.ShaderMaterial =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(color) }, uGray: { value: 0 }, uFade: { value: 1 }, uB0: { value: b0 }, uB1: { value: b1 }, uTint: { value: tint }, uPx: { value: px * dpr }, uDash: { value: 0 } },
        vertexShader: VERT,
        fragmentShader: FRAG_BAND,
      });
    const cytoMat = (inC: string, outC: string): T.ShaderMaterial =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uIn: { value: new THREE.Color(inC) }, uOut: { value: new THREE.Color(outC) } },
        vertexShader: VERT,
        fragmentShader: FRAG_CYTO,
      });

    // ── 세포의 겉(막과 벽)과 속 ────────────────────────────────────
    // 공을 눌러 만든다. 공의 이음매(경도 0)는 뒤쪽으로 돌려 둔다.
    const shellGeo = new THREE.SphereGeometry(1, plant ? 96 : 64, plant ? 64 : 44);
    shellGeo.rotateY(-Math.PI / 2);
    const pos = shellGeo.attributes.position as T.BufferAttribute;
    const dirs = new Float32Array(pos.array as Float32Array); // 꼭짓점마다의 방향(바뀌지 않는다)
    let table = radiusTable(0);
    const shape = (): void => {
      for (let i = 0; i < pos.count; i++) {
        const x = dirs[i * 3];
        const y = dirs[i * 3 + 1];
        const z = dirs[i * 3 + 2];
        const p = plant ? tablet(table, x, y, z) : blob(x, y, z);
        pos.setXYZ(i, p[0], p[1], p[2]);
      }
      pos.needsUpdate = true;
      shellGeo.computeVertexNormals();
      shellGeo.computeBoundingSphere();
    };
    shape();
    // 식물세포의 벽은 따로 굳혀 둔 모양을 쓴다. 벽이 멈춰도 벽의 자리는 육각형 그대로 남고(끊어진 띠), 안의 세포만 모양을 잃는다.
    // 벽까지 함께 무너뜨리면 "있던 벽"이 아니라 세포를 두른 테두리 빛처럼 읽혔다(2026-11-11 눈검수)
    const wallGeo = plant ? shellGeo.clone() : shellGeo;
    const table0 = table;

    // 맨 바깥 겉: 동물세포는 세포막, 식물세포는 세포벽
    const outerMat = plant ? bandMat("#A78479", 0.44, 0.52, 0.04, 0) : bandMat(BV.mem, 0.58, 0.66, 0.06, 3.4);
    const outer = new THREE.Mesh(wallGeo, outerMat);
    outer.renderOrder = 5;
    cell.add(outer);
    // 식물세포는 벽이 두껍다: 벽의 안쪽 면을 벽 색으로 채워, 벽과 세포막 사이가 비지 않게 한다. 벽 바로 안쪽에 세포막이 한 겹 더 있다
    const IN = plant ? 0.9 : 0.985;
    const wallBase = new THREE.Color(BV.wall);
    const wallBackMat = new THREE.MeshBasicMaterial({ color: BV.wall, side: THREE.BackSide, transparent: true, depthWrite: false });
    if (plant) {
      const wallBack = new THREE.Mesh(wallGeo, wallBackMat);
      wallBack.renderOrder = 0;
      cell.add(wallBack);
      const memIn = new THREE.Mesh(shellGeo, bandMat(BV.mem, 0.64, 0.72, 0, 0));
      memIn.scale.set(IN, IN, IN);
      memIn.renderOrder = 4;
      cell.add(memIn);
    }
    const cyto = new THREE.Mesh(shellGeo, plant ? cytoMat("#F6FCE3", "#CBE6A0") : cytoMat("#FFF4E3", "#FAD2A6"));
    cyto.scale.setScalar(plant ? IN - 0.01 : IN);
    cyto.renderOrder = 1;
    cell.add(cyto);

    // ── 핵 ────────────────────────────────────────────────────────
    // 겉에 옅은 얼룩을 둔다(민무늬 공은 흔들려도 입체로 읽히지 않는다)
    const nucTex = canvasTex(256, 128, (g) => {
      g.fillStyle = "#ffffff";
      g.fillRect(0, 0, 256, 128);
      [[40, 50, 26], [118, 84, 20], [176, 40, 30], [226, 92, 18], [84, 22, 14], [150, 108, 14]].forEach(([x, y, r]) => {
        const rg = g.createRadialGradient(x, y, 0, x, y, r);
        rg.addColorStop(0, "rgba(120,110,170,.55)");
        rg.addColorStop(1, "rgba(120,110,170,0)");
        g.fillStyle = rg;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      });
      // 보는 쪽에 짙은 얼룩 하나(평면 무대의 핵과 같은 인상. 민무늬 구슬로 보이지 않게)
      const dk = g.createRadialGradient(NUC_SPOT[0], NUC_SPOT[1], 0, NUC_SPOT[0], NUC_SPOT[1], 21);
      dk.addColorStop(0, "rgba(46,24,120,.9)");
      dk.addColorStop(0.72, "rgba(46,24,120,.78)");
      dk.addColorStop(1, "rgba(46,24,120,0)");
      g.fillStyle = dk;
      g.fillRect(NUC_SPOT[0] - 22, NUC_SPOT[1] - 22, 44, 44);
    });
    const nucR = plant ? P_NUC_R : A_NUC_R;
    const nucMat = new THREE.MeshStandardMaterial({ color: BV.nuc, map: nucTex, roughness: 0.42, metalness: 0.02 });
    const nucBase = new THREE.Color(BV.nuc);
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(nucR, 40, 28), nucMat);
    nuc.position.copy(V(plant ? P_NUC : A_NUC));
    nuc.userData.k = "nuc";
    inner.add(nuc);
    // 조절의 고리(핵에서 퍼져 나간다). 늘 보는 쪽을 향한다
    const rings = [0, 1].map(() => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(nucR + 0.03, 0.009, 8, 56), new THREE.MeshBasicMaterial({ color: "#A58BFF", transparent: true, opacity: 0, depthWrite: false }));
      m.renderOrder = 3;
      scene.add(m);
      return m;
    });

    // ── 마이토콘드리아(길이를 따라 물결 주름이 있는 길쭉한 알. 카드의 그림과 같은 무늬) ──
    const wavy = (body: string, line: string): T.CanvasTexture =>
      canvasTex(192, 128, (g) => {
        g.fillStyle = body;
        g.fillRect(0, 0, 192, 128);
        g.strokeStyle = line;
        g.lineWidth = 7;
        g.lineCap = "round";
        g.lineJoin = "round";
        [32, 96, 160].forEach((x) => {
          g.beginPath();
          for (let y = 26; y <= 102; y += 2) {
            const px = x + 11 * Math.sin(((y - 26) / 76) * Math.PI * 4);
            if (y === 26) g.moveTo(px, y);
            else g.lineTo(px, y);
          }
          g.stroke();
        });
      });
    const mitoTex = wavy("#F4524F", "#FFDCDC");
    const mitoOffTex = wavy("#8E97A6", "#C9CFD9"); // 멈춘 모습(회색). 탐색 국면에서만 쓴다
    const mitoGeo = new THREE.CapsuleGeometry(plant ? 0.095 : 0.105, plant ? 0.22 : 0.25, 8, 18);
    const mitoDefs: { p: V3; r: V3 }[] = plant ? P_MITO.map((m, i) => ({ p: m.p, r: [0.2 - i * 0.3, 0.25, Math.PI / 2 - (m.a * Math.PI) / 180] as V3 })) : A_MITO;
    const mitos = mitoDefs.map((m) => {
      const mat = new THREE.MeshStandardMaterial({ map: mitoTex, roughness: 0.5, emissive: new THREE.Color("#FF4D4D"), emissiveIntensity: 0.25 });
      const mesh = new THREE.Mesh(mitoGeo, mat);
      mesh.position.copy(V(m.p));
      mesh.rotation.set(m.r[0], m.r[1], m.r[2]);
      mesh.userData.k = "mito";
      inner.add(mesh);
      return mesh;
    });

    // ── 엽록체(식물세포. 초록 렌즈. 보는 쪽에 짧은 줄 넷: 카드의 그림과 같은 모양) ──
    // 줄은 둘레를 다 두르지 않는다(다 두르면 수박이나 애벌레로 읽혔다). 엽록체마다 누운 방향이 달라 무늬 판을 따로 그린다.
    const CHL_S: V3 = [0.118, 0.21, 0.092];
    const barred = (body: string, line: string, u: number, v: number): T.CanvasTexture =>
      canvasTex(128, 192, (g) => {
        g.fillStyle = body;
        g.fillRect(0, 0, 128, 192);
        g.strokeStyle = line;
        g.lineWidth = 5.5;
        g.lineCap = "round";
        [-0.158, -0.053, 0.053, 0.158].forEach((dv, k) => {
          const y = (v + dv) * 192;
          const half = (k === 0 || k === 3 ? 0.1 : 0.135) * 128; // 가장자리의 줄은 조금 짧게
          [-128, 0, 128].forEach((wrap) => {
            g.beginPath();
            g.moveTo(u * 128 - half + wrap, y);
            g.lineTo(u * 128 + half + wrap, y);
            g.stroke();
          });
        });
      });
    const chlGeo = new THREE.SphereGeometry(1, 28, 20);
    const chlOn: T.CanvasTexture[] = [];
    const chlOff: T.CanvasTexture[] = [];
    cell.rotation.y = YAW;
    const chls = (plant ? P_CHL : []).map((c) => {
      const mesh = new THREE.Mesh(chlGeo, new THREE.MeshStandardMaterial({ roughness: 0.55, emissive: new THREE.Color("#2FA84A"), emissiveIntensity: 0.22 }));
      mesh.position.copy(V(c.p));
      mesh.rotation.set(0.25, 0.2, Math.PI / 2 - (c.a * Math.PI) / 180); // 긴 쪽(공의 극)을 눕힌다
      mesh.scale.set(CHL_S[0], CHL_S[1], CHL_S[2]);
      mesh.userData.k = "chl";
      inner.add(mesh);
      // 이 엽록체에서 보는 쪽을 향한 겉의 자리(무늬 판의 u, v)를 구해 거기에 줄을 그린다
      cell.updateMatrixWorld(true);
      const d = stage.camera.position.clone().sub(mesh.getWorldPosition(new THREE.Vector3())).normalize().applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()).invert());
      const p = new THREE.Vector3(d.x * CHL_S[0], d.y * CHL_S[1], d.z * CHL_S[2]).normalize();
      const u = (((Math.atan2(p.z, -p.x) / (Math.PI * 2)) % 1) + 1) % 1;
      const v = Math.acos(Math.max(-1, Math.min(1, p.y))) / Math.PI;
      const on = barred("#4BC464", "#27873E", u, v);
      chlOn.push(on);
      chlOff.push(barred("#8E97A6", "#858E9D", u, v)); // 멈춘 엽록체의 줄은 거의 보이지 않게(진하면 마디진 벌레처럼 읽힌다)
      (mesh.material as T.MeshStandardMaterial).map = on;
      return mesh;
    });

    // ── 에너지(파란 번개): 마이토콘드리아마다 셋씩, 바깥으로 튀어 나가며 사라진다 ──
    const boltTex = canvasTex(96, 96, (g) => {
      g.translate(48, 48);
      g.scale(5, 5);
      const p = new Path2D(BOLT);
      g.lineJoin = "round";
      g.strokeStyle = "#fff";
      g.lineWidth = 2.6;
      g.stroke(p);
      g.fillStyle = BV.spark;
      g.fill(p);
    });
    const nucP = V(plant ? P_NUC : A_NUC);
    const sparks = mitoDefs.flatMap((m, mi) =>
      [0, 1, 2].map((j) => {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: boltTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
        sp.renderOrder = 6;
        inner.add(sp);
        // 핵에서 멀어지는 쪽으로, 셋이 조금씩 다른 방향(식물세포는 납작하므로 앞뒤로는 덜 벌린다)
        const out = V(m.p).sub(nucP).normalize();
        const side = new THREE.Vector3(Math.sin(j * 2.1 + mi), Math.cos(j * 2.1 + mi * 1.7), Math.sin(j * 1.3 + 2) * (plant ? 0.3 : 1)).multiplyScalar(0.75);
        return { sp, mi, dir: out.add(side).normalize(), ph: (j * 0.34 + mi * 0.21) % 1 };
      }),
    );
    const sparkReach = plant ? 0.27 : 0.29; // 번개가 막 밖으로 나가 보이지 않을 만큼만

    // ── 양분 ──────────────────────────────────────────────────────
    const nutrGeo = new THREE.SphereGeometry(0.052, 16, 12);
    const nutrMat = new THREE.MeshStandardMaterial({ color: BV.nutr, roughness: 0.35, emissive: new THREE.Color("#8A6A00"), emissiveIntensity: 0.4 });
    // 동물세포: 세포 밖에서 막을 지나 들어온다(세포를 따라 흔들리지 않는다)
    const nutrOut = (plant ? [] : A_NUTR).map((d, i) => {
      const dir = V(d).normalize();
      const mesh = new THREE.Mesh(nutrGeo, nutrMat);
      scene.add(mesh);
      return { mesh, dir, p0: V(blob(dir.x, dir.y, dir.z, 1.3)), pm: V(blob(dir.x, dir.y, dir.z, 1.0)), pb: V(blob(dir.x, dir.y, dir.z, 1.1)), ti: 0, target: new THREE.Vector3(), pile: new THREE.Vector3(), ph: (i * 0.168) % 1, held: false, fade: 1 };
    });
    // 식물세포: 엽록체에서 생겨 가장 가까운 마이토콘드리아로 간다
    // 엽록체마다 두 알이 반 박자 어긋나 나온다(한 알씩이면 일하는 세포에도 양분이 한두 알뿐이라, 엽록체가 멈춘 세포와의 차이가 약했다)
    const nutrIn = chls.flatMap((c, i) => {
      const from = c.position.clone();
      let to = mitos[0].position;
      mitos.forEach((m) => {
        if (m.position.distanceTo(from) < to.distanceTo(from)) to = m.position;
      });
      return [0, 1].map((j) => {
        const via = from.clone().lerp(to, 0.5).add(new THREE.Vector3((i + j) % 2 ? 0.11 : -0.11, j ? 0.07 : -0.05, 0.08));
        const mesh = new THREE.Mesh(nutrGeo, nutrMat);
        inner.add(mesh);
        return { mesh, from, via, to: to.clone(), ph: (i * 0.168 + j * 0.5) % 1 };
      });
    });

    // ── 세포 속에서 떠다니는 작은 알갱이(살아 움직이는 느낌. 에너지가 꺼지면 멎는다) ──
    const jigGeo = new THREE.SphereGeometry(0.024, 10, 8);
    const jigMat = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85 });
    const jigAt: V3[] = plant
      ? [[-0.3, 0.55, 0.1], [0.2, 0.6, -0.1], [0.3, -0.15, 0.2], [-0.3, -0.55, 0.05], [0.6, -0.72, -0.1], [-0.9, 0.0, 0.1], [0.05, 0.25, 0.25]]
      : [[0.3, 0.42, 0.3], [0.5, 0.18, -0.25], [-0.1, 0.55, -0.1], [-0.55, -0.1, -0.2], [0.2, -0.55, 0.2], [0.1, -0.2, 0.6], [-0.3, 0.1, 0.62], [0.62, 0.3, 0.1], [-0.6, 0.38, -0.3]];
    const jigs = jigAt.map((b, i) => {
      const mesh = new THREE.Mesh(jigGeo, jigMat);
      inner.add(mesh);
      return { mesh, b: V(b), a: 1.1 + (i % 4) * 0.37, c: i * 1.9 };
    });

    // ── 이름표의 이끎선과 햇빛 줄기: 이름표 쪽 끝은 고정, 가리키는 점은 모형을 따라간다 ──
    const leads = {} as Record<CellKey, { line: SVGLineElement; dot: SVGCircleElement }>;
    tagKeys.forEach((k) => {
      const g = over.querySelector(`g[data-k="${k}"]`) as SVGGElement;
      leads[k] = { line: g.querySelector("line") as SVGLineElement, dot: g.querySelector("circle") as SVGCircleElement };
    });
    const rays = [...over.querySelectorAll<SVGLineElement>(".cwm-ray")];
    let W = 346;
    let H = 230;
    const tagEnd = {} as Record<CellKey, [number, number]>;
    const fit = (): void => {
      W = box.clientWidth || 346;
      H = box.clientHeight || 230;
      stage.resize(W, H);
      over.setAttribute("viewBox", `0 0 ${W} ${H}`);
      tagKeys.forEach((k) => {
        const t = tags[k];
        const left = t.offsetLeft < W / 2;
        tagEnd[k] = [left ? t.offsetLeft + t.offsetWidth : t.offsetLeft, t.offsetTop + t.offsetHeight / 2];
      });
    };
    fit();
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(fit);
      ro.observe(box);
    }
    const tmp = new THREE.Vector3();
    const toPx = (v: T.Vector3): [number, number] => {
      tmp.copy(v).project(stage.camera);
      return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H];
    };
    const setLead = (k: CellKey, x: number, y: number): void => {
      const [ex, ey] = tagEnd[k];
      const L = leads[k];
      L.line.setAttribute("x1", ex.toFixed(1));
      L.line.setAttribute("y1", ey.toFixed(1));
      L.line.setAttribute("x2", x.toFixed(1));
      L.line.setAttribute("y2", y.toFixed(1));
      L.dot.setAttribute("cx", x.toFixed(1));
      L.dot.setAttribute("cy", y.toFixed(1));
    };

    // ── 누르기: 모형에서 맨 앞에 맞은 구조를 멈춘다(속 구조가 아니면 맨 바깥 겉: 세포막 또는 세포벽) ──
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const parts: T.Object3D[] = [nuc, ...mitos, ...chls];
    canvas.addEventListener("click", (e) => {
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, stage.camera);
      const hit = ray.intersectObjects(parts, false)[0];
      if (hit) o.onTap(hit.object.userData.k as CellKey);
      else if (ray.intersectObject(outer, false).length) o.onTap(plant ? "wall" : "mem");
    });

    // ── 그리기 ───────────────────────────────────────────────────
    let time = 0;
    let lifeT = 0; // 살아 움직이는 시간(에너지가 꺼지면 멈춘다)
    let jigT = 0;
    let act = 1; // 에너지가 도는 정도(0~1)
    let ringFx = 1;
    let sag = 0; // 세포벽이 무너진 정도(0~1)
    const gray: Record<CellKey, number> = { mem: 0, nuc: 0, mito: 0, chl: 0, wall: 0 };
    const ease = (x: number): number => x * x * (3 - 2 * x);
    const nucWorld = new THREE.Vector3();
    const world = new THREE.Vector3();
    let mitoPick = 0;
    let drawn = false;

    loop = createLoop((dtN) => {
      const dt = Math.min(0.05, dtN * 0.0167);
      time += dt;
      const off = st.off;
      const stopped = off === "mito" || st.starve; // 에너지가 끊긴 세포
      const chaos = off === "nuc";
      act += ((stopped ? 0 : 1) - act) * Math.min(1, dt * 5);
      ringFx += ((chaos ? 0 : 1) - ringFx) * Math.min(1, dt * 8);
      lifeT += dt * act;
      jigT += dt * (chaos ? 5.5 : 1) * act;

      // 모형: 각도는 고정이고 조금 흔들릴 뿐이다. 살아 있으면 숨 쉬듯 커졌다 작아지고, 뒤죽박죽일 때는 떤다
      cell.rotation.y = YAW + SWAY * Math.sin(time * 0.5);
      cell.scale.setScalar(still ? 1 : 1 + 0.014 * Math.sin(lifeT * 2.4));
      cell.position.set(chaos ? 0.014 * Math.sin(time * 52) : 0, chaos ? 0.011 * Math.sin(time * 61) : 0, 0);

      // 멈춘 구조는 회색이 된다(판정 국면에서는 색으로 드러내지 않는다)
      (Object.keys(gray) as CellKey[]).forEach((k) => {
        const to = off === k && !st.diag ? 1 : 0;
        gray[k] += (to - gray[k]) * Math.min(1, dt * 7);
      });
      outerMat.uniforms.uGray.value = plant ? gray.wall : gray.mem;
      nucMat.color.copy(nucBase).lerp(GRAY, gray.nuc);
      mitos.forEach((m) => {
        const mat = m.material as T.MeshStandardMaterial;
        const tex = gray.mito > 0.5 ? mitoOffTex : mitoTex;
        if (mat.map !== tex) mat.map = tex;
        mat.emissiveIntensity = (0.22 + 0.16 * Math.sin(lifeT * 4.5)) * act * (1 - gray.mito);
      });
      chls.forEach((c, i) => {
        const mat = c.material as T.MeshStandardMaterial;
        const tex = gray.chl > 0.5 ? chlOff[i] : chlOn[i];
        if (mat.map !== tex) mat.map = tex;
        mat.emissiveIntensity = 0.22 * (1 - gray.chl);
        // 빛을 받아 일하는 맥박(엽록체가 멈추면 멎는다)
        const beat = off === "chl" || still ? 1 : 1 + 0.07 * (0.5 + 0.5 * Math.sin(time * 3.9 + i * 1.6));
        c.scale.set(CHL_S[0] * beat, CHL_S[1] * beat, CHL_S[2] * beat);
      });

      // 식물세포: 세포벽이 멈추면 벽은 끊어진 띠가 되고, 안의 세포는 각을 잃고 둥글어진다(속 구조도 함께 모인다)
      if (plant) {
        const to = off === "wall" ? 1 : 0;
        if (Math.abs(to - sag) > 0.002) {
          sag += (to - sag) * Math.min(1, dt * 6);
          if (Math.abs(to - sag) <= 0.002) sag = to;
          table = radiusTable(sag);
          shape();
        }
        outerMat.uniforms.uFade.value = 1 - 0.2 * gray.wall;
        outerMat.uniforms.uDash.value = gray.wall;
        wallBackMat.color.copy(wallBase).lerp(GRAY, gray.wall);
        wallBackMat.opacity = 1 - gray.wall;
        // 끊어진 벽은 육각형 그대로 제자리에 남는다(조금 얇아질 뿐이다). 세포는 그 안에서 둥글어지고, 속 구조도 함께 모인다
        outer.scale.set(1, 1, 1 - 0.3 * gray.wall);
        inner.scale.set(1 - 0.05 * sag, 1 - 0.05 * sag, 1);
      }

      // 양분(동물세포): 막을 지난 뒤에는 그때 가장 가까이 있는 마이토콘드리아로 간다
      nutrOut.forEach((n, i) => {
        if (n.ph < T_IN) {
          // 막을 지나기 전에만 갈 곳을 고른다(가는 도중에 바꾸면 길이 꺾인다)
          let bestD = 1e9;
          mitos.forEach((m, mi) => {
            m.getWorldPosition(world);
            const dd = world.distanceTo(n.pm);
            if (dd < bestD) {
              bestD = dd;
              n.ti = mi;
            }
          });
        }
        mitos[n.ti].getWorldPosition(n.target);
        n.pile.copy(n.target).addScaledVector(n.dir, 0.17 + (i % 3) * 0.03);
        const speed = chaos ? (i % 2 ? 1 / 7 : 1 / 1.5) : off === "mem" ? 1 / 2.4 : 1 / 3.7;
        // 한 바퀴의 시계는 멈추지 않는다. 쌓인 알갱이는 held로 붙잡아 두기만 한다
        // (시계를 멈추면 여섯 알의 박자가 하나로 겹쳐, 다시 일할 때 한꺼번에 밖에 있거나 한꺼번에 안에 있게 된다)
        n.ph = (n.ph + dt * speed) % 1;
        if (off === "mito") {
          if (n.ph >= T_USE) n.held = true;
        } else if (n.held) {
          n.held = false;
          n.fade = 0; // 쌓여 있던 알갱이는 사라지고, 제 박자의 자리에서 다시 나타난다
        }
        n.fade = Math.min(1, n.fade + dt * 3.5);
        let sc = n.fade;
        if (off === "mem") {
          // 세포막 바로 바깥에서 튕겨 돌아간다
          const u = n.ph < 0.5 ? n.ph * 2 : (1 - n.ph) * 2;
          n.mesh.position.copy(n.p0).lerp(n.pb, ease(u));
        } else if (n.held) {
          n.mesh.position.copy(n.pile); // 쓰이지 못하고 쌓인다
        } else if (n.ph < T_IN) {
          n.mesh.position.copy(n.p0).lerp(n.pm, n.ph / T_IN);
        } else if (n.ph < T_USE) {
          n.mesh.position.copy(n.pm).lerp(off === "mito" ? n.pile : n.target, ease((n.ph - T_IN) / (T_USE - T_IN)));
        } else {
          n.mesh.position.copy(n.target);
          sc *= 1 - (n.ph - T_USE) / (1 - T_USE);
        }
        n.mesh.scale.setScalar(Math.max(0.01, sc));
      });
      // 양분(식물세포): 엽록체에서 생겨 마이토콘드리아로. 엽록체가 멈추면 생기지 않는다
      nutrIn.forEach((n) => {
        n.ph = (n.ph + dt / 3.7) % 1;
        n.mesh.visible = off !== "chl";
        let sc = 1;
        if (n.ph < 0.12) {
          n.mesh.position.copy(n.from);
          sc = n.ph / 0.12;
        } else if (n.ph < 0.5) n.mesh.position.copy(n.from).lerp(n.via, ease((n.ph - 0.12) / 0.38));
        else if (n.ph < 0.88) n.mesh.position.copy(n.via).lerp(n.to, ease((n.ph - 0.5) / 0.38));
        else {
          n.mesh.position.copy(n.to);
          sc = 1 - (n.ph - 0.88) / 0.12;
        }
        n.mesh.scale.setScalar(Math.max(0.01, sc));
      });

      // 에너지 번개
      sparks.forEach((sp) => {
        const cyc = chaos ? [0.42, 0, 2.9][sp.mi] : 1.4;
        const on = cyc > 0 ? act : 0;
        if (cyc > 0) sp.ph = (sp.ph + dt / cyc) % 1;
        const p = sp.ph;
        const m = mitoDefs[sp.mi].p;
        const d = 0.13 + sparkReach * p;
        // 세포 안에 머물게 한다(막이나 벽 위에 놓이면 에너지가 세포 밖에서 생기는 것처럼 읽힌다)
        const lx = m[0] + sp.dir.x * d;
        const ly = m[1] + sp.dir.y * d;
        const far = plant ? Math.hypot(lx, ly) / (radiusAt(table, Math.atan2(ly, lx)) * 0.62) : Math.hypot(lx / 1.1, ly / 0.92) / 0.58;
        const k = far > 1 ? 1 / far : 1;
        sp.sp.position.set(lx * k, ly * k, m[2] + sp.dir.z * d);
        (sp.sp.material as T.SpriteMaterial).opacity = on * Math.pow(Math.sin(Math.PI * p), 0.6);
        sp.sp.scale.setScalar(0.15 + 0.1 * p);
      });

      // 조절의 고리
      nuc.getWorldPosition(nucWorld);
      rings.forEach((r, j) => {
        const p = (time / 2.4 + j * 0.5) % 1;
        r.position.copy(nucWorld);
        r.quaternion.copy(stage.camera.quaternion);
        r.scale.setScalar(1 + 1.0 * p);
        (r.material as T.MeshBasicMaterial).opacity = (1 - p) * (1 - p) * 0.75 * ringFx;
      });

      // 떠다니는 알갱이
      jigs.forEach((j) => {
        j.mesh.position.set(j.b.x + 0.05 * Math.sin(jigT * j.a + j.c), j.b.y + 0.05 * Math.sin(jigT * j.a * 1.31 + j.c * 2), j.b.z + 0.04 * Math.cos(jigT * j.a * 0.83 + j.c));
      });

      // 이름표의 이끎선
      cell.updateMatrixWorld();
      if (plant) {
        chls[1].getWorldPosition(world);
        const [cx, cy] = toPx(world);
        setLead("chl", cx + 6, cy - 6);
        // 세포벽: 오른쪽 아래 모서리 쪽의 벽
        const th = -1.2;
        const lat = 0.445 - 0.39 * gray.wall; // 끊어진 벽은 가운데 높이의 테두리에만 띠가 보인다
        const wp = tablet(table0, Math.cos(th) * Math.cos(lat), Math.sin(th) * Math.cos(lat), Math.sin(lat));
        const [wx, wy] = toPx(cell.localToWorld(world.set(wp[0], wp[1], wp[2] * outer.scale.z)));
        setLead("wall", wx, wy);
        P_RAYS.forEach((ci, i) => {
          chls[ci].getWorldPosition(world);
          const [x, y] = toPx(world);
          rays[i].setAttribute("x1", "30");
          rays[i].setAttribute("y1", "28");
          rays[i].setAttribute("x2", x.toFixed(1));
          rays[i].setAttribute("y2", y.toFixed(1));
        });
      } else {
        const [nx, ny] = toPx(nucWorld);
        setLead("nuc", nx + 16, ny - 14);
        // 세포막: 화면에서 본 세포의 왼쪽 위 가장자리
        const [cx, cy] = toPx(world.set(0, 0, 0));
        const [rx] = toPx(world.set(1.1, 0, 0).applyQuaternion(stage.camera.quaternion));
        const R = Math.abs(rx - cx);
        setLead("mem", cx - R * 0.95, cy - R * 0.27);
        // 마이토콘드리아: 가장 앞에 나와 있는 것(조금 더 앞선 것이 생길 때만 갈아탄다)
        let best = mitoPick;
        let bestZ = -1e9;
        mitos.forEach((m, i) => {
          m.getWorldPosition(world);
          const z = world.z + world.x * 0.5 - world.y * 0.5 + (i === mitoPick ? 0.25 : 0);
          if (z > bestZ) {
            bestZ = z;
            best = i;
          }
        });
        mitoPick = best;
        mitos[mitoPick].getWorldPosition(world);
        const [mx, my] = toPx(world);
        setLead("mito", mx, my);
      }

      stage.render();
      if (!drawn) {
        drawn = true;
        box.classList.add("ready");
        o.onReady?.();
      }
    }).start();
    extra = () => texes.forEach((t) => t.dispose());
  })();

  return {
    kind: "3d",
    set(next) {
      st = next;
      box.classList.toggle("notag", next.hideTags);
      // 화면 전환이 그리기 루프를 멈춰 둔 채 무대가 살아 있을 수 있다. 상태가 바뀌면 다시 켠다(돌고 있으면 아무 일도 없다)
      if (!dead) loop?.start();
    },
    dispose() {
      dead = true;
      ro?.disconnect();
      loop?.stop();
      extra?.();
      st3?.dispose();
      box.classList.remove("cwm-stage", "plant", "ready");
    },
  };
}
