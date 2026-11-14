// [중2 Ⅵ v5] 순환 여행 랩의 입체 무대(three.js). 진행과 글은 rideLab.ts, 좌표와 약속은 rideStage.ts.
// 손으로 돌리는 기능은 없다(2026-11-11 사용자 결정). 카메라는 랩이 정한 구도로 스스로 움직이고(혈액을 따라 내려가고 올라간다),
// 가만히 있을 때는 아주 조금 좌우로 흔들려 깊이가 보일 뿐이다(움직임 줄이기 설정이면 멈춘다).
// 누르는 것은 무대 위의 단추(DOM)뿐이다. 캔버스는 누르기를 받지 않는다(넓은 화면의 확대와 무관하게 단추가 받는다).
// 규칙(SCI_GUIDE 3D 절과 넓은 화면 절):
//   three는 ui/space3d를 동적 import해서 그 안의 THREE로만 쓴다. 렌더러는 이 파일이 직접 만든다(픽셀 비를 정하려고).
//   픽셀 비는 stageDpr()를 이 무대의 확대 배율에 맞춘 값이고(넓은 화면에서 이 무대는 --lk가 아닌 자기 배율로 커진다),
//   크기는 clientWidth·clientHeight(확대 전 px)로 잡고, 전체 픽셀 수에 상한(MAX_PX)을 둔다.
//   화면 밖이거나 탭이 숨으면 그리지 않는다. 움직일 것이 없으면 초당 스무 장 안쪽으로만 그린다.
//   dispose에서 기하, 재질, 텍스처, 렌더러를 모두 풀고 컨텍스트를 돌려준다.
//   직접 쓴 셰이더는 끝에 colorspace_fragment를 넣는다(빠지면 색이 어둡고 탁하다, 세포 랩에서 겪었다).

import type * as T from "three";
import { createLoop, type Loop } from "../../../core/anim";
import { stageDpr, wideStageScale, zoomOf } from "../../../core/wide";
import {
  AIRWAY, ALV_MACRO, ALV_O2, BED_BODY, BED_LUNG, BODY_FLIGHTS, BREATH_DUR, BREATH_FROM, BREATH_IN, CELLS_MACRO, CELL_CO2, CELL_WASTE,
  FRAMES, HEART_C, HEART_OUT, LOBES, LUNG_FLIGHTS, MACRO_R, MICRO_AIRWAY, MICRO_ALV, MICRO_AT, MICRO_CELLS, MICRO_WALL,
  PATHS, RC, RH, ROOM, RW, SLOT, VALVES,
  along, beatAmt, cargoAt, clamp01, ease, followFrame, isMicro, lerp, makeOverlay, oxygen, poly, progress, smooth, startState, tagAnchor,
  type FillKey, type Flight, type FrameKey, type Gas, type MacroSeg, type MicroSeg, type Pick, type Poly, type Pt, type RideStage, type RideStageOpts, type RideState, type Room, type Slot, type TagKey,
} from "./rideStage";

// ── 이 기기에서 입체 무대를 쓸 수 있는가 ───────────────────────────
let glOk: boolean | null = null;
export function canRide3d(): boolean {
  try {
    if (sessionStorage.getItem("ss.rideflat") === "1") return false; // 검사와 견주어 보기용: 평면 무대로
  } catch {
    /* 세션 저장소를 못 쓰는 환경 */
  }
  if (glOk === null) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2"); // three r185는 WebGL2만 쓴다
      glOk = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); // 알아보는 데 쓴 컨텍스트는 바로 돌려준다
    } catch {
      glOk = false;
    }
  }
  return glOk;
}

const S = 1 / 72; // 설계 판 1px = 0.0139
const FOV = 30;
const MAX_PX = 1_700_000; // 그리는 픽셀 수의 상한(넓은 화면, 고해상도 모니터)
const TILT = 0.1; // 카메라를 조금 위에서 내려다본다(거리에 대한 비)

const VERT = `varying vec3 vN; varying vec3 vV; varying float vU;
  void main(){ vU = uv.x; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
/** 혈관(속의 혈액): 지나온 만큼(uFill) 혈액의 색으로, 나머지는 아직 지나지 않은 길의 색으로. 흐르는 쪽으로 옅은 무늬가 지나간다. */
const FRAG_TUBE = `uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uE; uniform float uFill; uniform float uMix; uniform float uT; uniform float uLen; uniform float uA; uniform float uHint; uniform float uBand;
  varying vec3 vN; varying vec3 vV; varying float vU;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    float ndl = max(dot(n, normalize(vec3(-0.4, 0.7, 0.6))), 0.0);
    float rim = pow(1.0 - abs(dot(n, v)), 2.0);
    float on = step(vU, uFill);
    vec3 blood = mix(uC0, mix(uC0, uC1, smoothstep(0.0, 1.0, vU)), uMix);
    float band = 0.5 + 0.5 * sin((vU * uLen - uT) * 16.0);
    vec3 c = mix(uE, blood, on);
    c *= 0.66 + 0.46 * ndl;
    c += on * uBand * band;
    c = mix(c, vec3(1.0), rim * 0.16 + uHint * 0.55 * (0.5 + 0.5 * sin(vU * uLen * 9.0 - uT * 7.0)));
    gl_FragColor = vec4(c, max(mix(0.5, 1.0, on), uHint) * uA);
    #include <colorspace_fragment>
  }`;
const VERT_B = `varying vec3 vN; varying vec3 vV;
  void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
/** 막과 벽(심장의 근육, 허파, 세포막, 허파꽈리, 혈관벽): 가장자리로 갈수록 진하고 가운데는 비쳐서 속이 보인다. */
const FRAG_BAND = `uniform vec3 uColor; uniform float uB0; uniform float uB1; uniform float uTint; uniform float uA; uniform float uGlow;
  varying vec3 vN; varying vec3 vV;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(vV);
    float f = 1.0 - abs(dot(n, v));
    float band = smoothstep(uB0, uB1, f);
    float hl = pow(max(dot(n, normalize(vec3(-0.45, 0.62, 0.64))), 0.0), 36.0) * 0.16;
    vec3 col = mix(uColor * (0.86 + 0.22 * band) + uGlow * 0.35, vec3(1.0), hl);
    gl_FragColor = vec4(col, clamp(max(mix(uTint, 1.0, band), hl) * uA + uGlow * 0.25 * uA, 0.0, 1.0));
    #include <colorspace_fragment>
  }`;

type V3 = T.Vector3;

export function modelRideStage(box: HTMLElement, o: RideStageOpts): RideStage {
  box.classList.add("g2u6x-rd-3d");
  const canvas = document.createElement("canvas");
  canvas.className = "g2u6x-rd-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "위에 허파, 가운데에 심장, 아래에 온몸의 조직세포가 있고 혈관이 이들을 잇는 혈액 순환의 입체 모형");
  box.prepend(canvas);
  const ov = makeOverlay(box, o.onPick);

  let st: RideState = startState();
  let dead = false;
  let loop: Loop | null = null;
  let io: IntersectionObserver | null = null;
  let ro: ResizeObserver | null = null;
  let seen = true;
  let wake = (): void => {};
  let release: (() => void) | null = null;
  const still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  void (async () => {
    let S3: typeof import("../../../ui/space3d");
    try {
      S3 = await import("../../../ui/space3d");
    } catch {
      if (!dead) o.onFail?.();
      return;
    }
    if (dead) return;
    const THREE: typeof T = S3.THREE;
    let renderer: T.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      o.onFail?.();
      return;
    }
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, RW / RH, 0.02, 60);
    const probe = new THREE.PerspectiveCamera(FOV, RW / RH, 0.02, 60); // 단추 자리를 셈하는 카메라(구도의 끝 모습)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9bbd, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.55);
    key.position.set(-2.2, 3.2, 4.2);
    scene.add(key);

    // ── 만들고 푸는 것을 한곳에 모은다 ──
    const geos: T.BufferGeometry[] = [];
    const mats: T.Material[] = [];
    const texes: T.Texture[] = [];
    const G = <K extends T.BufferGeometry>(g: K): K => (geos.push(g), g);
    const M = <K extends T.Material>(m: K): K => (mats.push(m), m);
    const col = (h: string): T.Color => new THREE.Color(h);
    const W = (p: Pt, z = 0): V3 => new THREE.Vector3((p[0] - 173) * S, (220 - p[1]) * S, z);
    const L = (p: Pt, z = 0): V3 => new THREE.Vector3(p[0] - 173, 220 - p[1], z); // 확대 판 안의 좌표(판 px)
    const std = (c: string, emi = 0.28, rough = 0.55): T.MeshStandardMaterial =>
      M(new THREE.MeshStandardMaterial({ color: col(c), emissive: col(c), emissiveIntensity: emi, roughness: rough, metalness: 0 }));
    const band = (c: string, o2: { b0?: number; b1?: number; tint?: number } = {}): T.ShaderMaterial =>
      M(
        new THREE.ShaderMaterial({
          vertexShader: VERT_B,
          fragmentShader: FRAG_BAND,
          uniforms: { uColor: { value: col(c) }, uB0: { value: o2.b0 ?? 0.25 }, uB1: { value: o2.b1 ?? 0.95 }, uTint: { value: o2.tint ?? 0.1 }, uA: { value: 1 }, uGlow: { value: 0 } },
          transparent: true,
          depthWrite: false,
        }),
      );
    const tubeMat = (c0: string, c1: string, len: number, mix = 1): T.ShaderMaterial =>
      M(
        new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG_TUBE,
          uniforms: {
            uC0: { value: col(c0) },
            uC1: { value: col(c1) },
            uE: { value: col(RC.empty) },
            uFill: { value: 0 },
            uMix: { value: mix },
            uT: { value: 0 },
            uLen: { value: len },
            uA: { value: 1 },
            uHint: { value: 0 },
            uBand: { value: 0.03 },
          },
          transparent: true,
        }),
      );
    const tubeGeo = (pts: V3[], r: number, seg = 90, rad = 10, taper?: (u: number) => number): T.TubeGeometry => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const g = G(new THREE.TubeGeometry(curve, seg, r, rad, false));
      if (taper) {
        // 고리마다 가운데에서의 거리를 taper(u)배로 바꾼다(TubeGeometry는 고리 하나에 rad + 1개의 점)
        const pos = g.attributes.position as T.BufferAttribute;
        const c = new THREE.Vector3();
        for (let i = 0; i <= seg; i++) {
          const k = taper(i / seg);
          curve.getPointAt(i / seg, c);
          for (let j = 0; j <= rad; j++) {
            const ix = i * (rad + 1) + j;
            pos.setXYZ(ix, c.x + (pos.getX(ix) - c.x) * k, c.y + (pos.getY(ix) - c.y) * k, c.z + (pos.getZ(ix) - c.z) * k);
          }
        }
        g.computeVertexNormals();
      }
      return g;
    };
    const sphere = G(new THREE.SphereGeometry(1, 28, 20));
    const sphereLo = G(new THREE.SphereGeometry(1, 12, 9));
    /** 둥근 테두리(윤곽 pts, 평면 XY)를 앞뒤로 두께 depth만큼 부풀린 판. 심장과 허파의 겉모양. */
    const slab = (outline: Pt[], depth: number, edge = 0.55): T.BufferGeometry => {
      const g = G(new THREE.SphereGeometry(1, 56, 30));
      const pos = g.attributes.position as T.BufferAttribute;
      const radiusAt = (th: number): number => {
        const dx = Math.cos(th);
        const dy = Math.sin(th);
        let best = 0;
        for (let i = 0; i < outline.length; i++) {
          const [x1, y1] = outline[i];
          const [x2, y2] = outline[(i + 1) % outline.length];
          const ex = x2 - x1;
          const ey = y2 - y1;
          const den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-9) continue;
          const t = (x1 * ey - y1 * ex) / den;
          const u = (x1 * dy - y1 * dx) / den;
          if (t > best && u >= -1e-6 && u <= 1 + 1e-6) best = t;
        }
        return best;
      };
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const th = Math.atan2(y, x);
        const u = Math.hypot(x, y);
        const phi = Math.atan2(z, u);
        const c = Math.pow(Math.max(0, Math.cos(phi)), edge);
        const s = Math.sign(z) * Math.pow(Math.abs(Math.sin(phi)), edge);
        const r = radiusAt(th) * c;
        pos.setXYZ(i, Math.cos(th) * r, Math.sin(th) * r, s * depth);
      }
      g.computeVertexNormals();
      return g;
    };
    const glowTex = (inner: string, outer: string): T.CanvasTexture => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d") as CanvasRenderingContext2D;
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, inner);
      gr.addColorStop(1, outer);
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      texes.push(t);
      return t;
    };

    // 큰 그림, 확대 판 둘(조직세포 곁, 허파꽈리 곁)
    const macro = new THREE.Group();
    const microBody = new THREE.Group();
    const microLung = new THREE.Group();
    scene.add(macro, microBody, microLung);
    (["body", "lung"] as const).forEach((k) => {
      const g = k === "body" ? microBody : microLung;
      g.position.copy(W(MICRO_AT[k].at));
      g.scale.setScalar(S / MICRO_AT[k].k);
      g.visible = false;
    });
    /** 구역마다 투명도를 함께 바꿀 재질들 */
    const fade: Record<"macro" | "body" | "lung", { m: T.Material; base: number; isShader: boolean; tr: boolean }[]> = { macro: [], body: [], lung: [] };
    const reg = (where: "macro" | "body" | "lung", m: T.Material): T.Material => {
      const sh = (m as T.ShaderMaterial).isShaderMaterial === true;
      fade[where].push({ m, base: sh ? 1 : m.opacity, isShader: sh, tr: m.transparent });
      return m;
    };
    const mesh = (where: "macro" | "body" | "lung", geo: T.BufferGeometry, mat: T.Material, parent: T.Object3D): T.Mesh => {
      reg(where, mat);
      const m = new THREE.Mesh(geo, mat);
      parent.add(m);
      return m;
    };

    // ── 큰 그림: 구역의 빛(정리 때 두 순환을 칠한다. 교과서 그림의 주황, 하늘색 바탕) ──
    const loopGlow = (c: string, at: Pt, sx: number, sy: number): T.Mesh => {
      const m = new THREE.Mesh(G(new THREE.PlaneGeometry(1, 1)), M(new THREE.MeshBasicMaterial({ map: glowTex(c, "rgba(0,0,0,0)"), transparent: true, depthWrite: false, opacity: 0 })));
      m.position.copy(W(at, -1.1));
      m.scale.set(sx * S, sy * S, 1);
      macro.add(m);
      return m;
    };
    const glowBody = loopGlow("rgba(255,169,77,.55)", [150, 330], 460, 300);
    const glowLung = loopGlow("rgba(116,192,252,.5)", [173, 100], 430, 270);

    // ── 큰 그림: 허파 ──
    LOBES.forEach((lb) => {
      const out: Pt[] = [];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        // 가운데 쪽(심장 쪽 아래)을 조금 깎아 허파 모양으로
        const inner = (lb.c[0] < 173 ? Math.cos(a) : -Math.cos(a)) > 0.3 && Math.sin(a) < 0 ? 0.86 : 1;
        out.push([Math.cos(a) * lb.rx * S * inner, Math.sin(a) * lb.ry * S]);
      }
      const m = mesh("macro", slab(out, 0.32), band(RC.lung, { tint: 0.1, b0: 0.3 }), macro);
      m.position.copy(W(lb.c, -0.42));
      m.renderOrder = 1;
    });
    AIRWAY.forEach((pts, i) => mesh("macro", tubeGeo(smooth(pts, 8).map((p) => W(p, -0.2)), (i ? 3 : 4.2) * S, 24, 8), std(RC.air, 0.18), macro));
    ALV_MACRO.forEach((a) => {
      const m = mesh("macro", sphereLo, band("#FFD6DF", { tint: 0.32, b0: 0.2 }), macro);
      m.position.copy(W(a.c, -0.06));
      m.scale.setScalar(a.r * S);
      m.renderOrder = 2;
    });

    // ── 큰 그림: 혈관(지나온 길이 혈액의 색으로 채워진다) ──
    const fills: Record<FillKey, { mats: T.ShaderMaterial[]; t0: number; t1: number }> = {} as Record<FillKey, { mats: T.ShaderMaterial[]; t0: number; t1: number }>;
    /** 혈관의 z(깊이): 심장 위로 나오는 두 동맥 줄기는 심방 앞을 지나게 조금 앞으로 */
    const zOf = (seg: MacroSeg, p: Pt): number => {
      if (seg === "pa" || seg === "ao") return 0.2 * Math.exp(-Math.pow((p[1] - 205) / 34, 2));
      // 폐정맥은 대동맥 활과 엇갈리는 자리에서 그 뒤로 지나간다(같은 높이에 그리면 대동맥의 가지처럼 보였다. 2026-11-15 눈검수)
      if (seg === "pv") return -0.26 * Math.exp(-Math.pow((p[1] - 136) / 24, 2));
      return 0;
    };
    const vesselTube = (seg: "ao" | "vc" | "pa" | "pv", from: number, to: number): void => {
      const pts = PATHS[seg].pts;
      const n = pts.length;
      const sub = pts.slice(Math.floor(from * (n - 1)), Math.ceil(to * (n - 1)) + 1);
      const len = poly(sub).len * S;
      const rich = seg === "ao" || seg === "pv";
      const mat = tubeMat(rich ? RC.rich : RC.poor, rich ? RC.rich : RC.poor, len);
      mesh("macro", tubeGeo(sub.map((p) => W(p, zOf(seg, p))), MACRO_R[seg] * S, 110, 12), mat, macro).renderOrder = 3;
      fills[seg] = { mats: [mat], t0: from, t1: to };
    };
    vesselTube("ao", 0.115, 1); // 대동맥판막에서부터
    vesselTube("vc", 0, 0.9); // 우심방 벽까지
    vesselTube("pa", 0.17, 1); // 폐동맥판막에서부터
    vesselTube("pv", 0, 0.88);
    const bedTubes = (key: "bed" | "lbed", strands: Pt[][], c0: string, c1: string, r: number, z: number): void => {
      const list: T.ShaderMaterial[] = [];
      strands.forEach((s) => {
        const pts = smooth(s, 8);
        const mat = tubeMat(c0, c1, poly(pts).len * S);
        mesh("macro", tubeGeo(pts.map((p) => W(p, z)), r * S, 70, 8), mat, macro).renderOrder = 3;
        list.push(mat);
      });
      fills[key] = { mats: list, t0: 0, t1: 1 };
    };
    bedTubes("bed", BED_BODY, RC.rich, RC.poor, 2.4, 0.02);
    bedTubes("lbed", BED_LUNG, RC.poor, RC.rich, 2.2, 0);

    // ── 큰 그림: 온몸의 조직세포 ──
    CELLS_MACRO.forEach((c, i) => {
      const m = mesh("macro", sphereLo, band(RC.cell, { tint: 0.22, b0: 0.2 }), macro);
      m.position.copy(W(c.c, -0.04 - (i % 2) * 0.05));
      m.scale.set(c.r * S, c.r * S * 0.92, c.r * S * 0.8);
      m.renderOrder = 2;
      const nuc = mesh("macro", sphereLo, std("#C46A3C", 0.2), macro);
      nuc.position.copy(W([c.c[0] + 3, c.c[1] - 2], 0.02));
      nuc.scale.setScalar(c.r * S * 0.34);
    });

    // ── 큰 그림: 심장 ──
    const heart = new THREE.Group();
    heart.position.copy(W(HEART_C));
    macro.add(heart);
    const hOut = HEART_OUT.map(([x, y]) => [(x - HEART_C[0]) * S, -(y - HEART_C[1]) * S] as Pt);
    const shellMat = band(RC.muscle, { tint: 0.07, b0: 0.32, b1: 0.97 });
    const shell = mesh("macro", slab(hOut, 0.46, 0.5), shellMat, heart);
    shell.renderOrder = 4;
    const HL = (p: Pt, z = 0): V3 => new THREE.Vector3((p[0] - HEART_C[0]) * S, -(p[1] - HEART_C[1]) * S, z);
    const rooms = {} as Record<Room, T.Mesh>;
    (Object.keys(ROOM) as Room[]).forEach((k) => {
      const r = ROOM[k];
      const m = mesh("macro", sphere, std(r.rich ? RC.rich : RC.poor, 0.34, 0.45), heart);
      m.position.copy(HL(r.c, 0.02));
      m.scale.set(r.rx * S, r.ry * S, 0.24);
      rooms[k] = m;
    });
    // 판막: 두 장의 얇은 막. 방실판막은 열리면 심실 쪽으로 늘어지고, 동맥 쪽 판막은 열리면 위로 젖혀진다.
    const avMat = std(RC.valve, 0.3, 0.6); // 방실판막
    const slMat = std(RC.valve, 0.3, 0.6); // 동맥 쪽 판막
    const flaps: { piv: T.Group; side: number; up: boolean; key: string }[] = [];
    VALVES.forEach((v) => {
      [-1, 1].forEach((side) => {
        const piv = new THREE.Group();
        piv.position.copy(HL([v.c[0] + (side * v.w) / 2, v.c[1]], 0.24));
        const plate = mesh("macro", G(new THREE.BoxGeometry((v.w / 2) * S, 3.4 * S, 0.2)), v.up ? slMat : avMat, piv);
        plate.position.set((-side * (v.w / 4)) * S, 0, 0);
        heart.add(piv);
        flaps.push({ piv, side, up: v.up, key: v.key });
      });
    });

    // ── 정맥이 심장으로 들어가는 방향을 보이는 화살(폐정맥에서 틀렸을 때) ──
    const arrowGeo = G(new THREE.ConeGeometry(4.2 * S, 10 * S, 14));
    const arrowMat = std("#FFFFFF", 0.6, 0.4);
    const pvArrows = [0.32, 0.52, 0.72].map((t) => {
      const m = mesh("macro", arrowGeo, arrowMat, macro);
      const p = along(PATHS.pv, t);
      const q = along(PATHS.pv, t + 0.03);
      m.position.copy(W(p, 0.12));
      m.rotation.z = Math.atan2(-(q[1] - p[1]), q[0] - p[0]) - Math.PI / 2;
      m.visible = false;
      return m;
    });

    // ── 정리: 두 순환이 심장 안에서 이어지는 곳(우심방 → 우심실, 좌심방 → 좌심실)의 화살 ──
    const linkGeo = G(new THREE.ConeGeometry(6.5 * S, 15 * S, 16));
    const linkMat = std("#FFFFFF", 0.7, 0.4);
    const links = (["tri", "mit"] as const).map((k) => {
      const v = VALVES.find((x) => x.key === k) as (typeof VALVES)[number];
      const m = mesh("macro", linkGeo, linkMat, macro);
      m.position.copy(W([v.c[0], v.c[1] + 2], 0.42));
      m.rotation.z = Math.PI; // 아래(심실 쪽)를 향한다
      m.visible = false;
      return m;
    });

    // ── 혈액 한 방울(적혈구): 가운데가 오목한 원반. 산소(적혈구에 붙음)와 이산화 탄소, 영양소(혈장에 실림)를 함께 그린다 ──
    const prof: T.Vector2[] = [];
    const PR = [[0, 0.2], [0.35, 0.24], [0.62, 0.38], [0.84, 0.44], [0.97, 0.3], [1, 0], [0.97, -0.3], [0.84, -0.44], [0.62, -0.38], [0.35, -0.24], [0, -0.2]];
    PR.forEach(([x, y]) => prof.push(new THREE.Vector2(x, y)));
    const rbcGeo = G(new THREE.LatheGeometry(prof.reverse(), 36));
    // 기체 알갱이의 재질은 구역마다 따로 둔다(큰 그림과 확대 판이 서로 다른 투명도로 넘어가므로 함께 쓰면 엉킨다)
    // 빛을 받지 않는 재질로 범례 색 그대로 그리고, 벽과 빛보다 나중에(맨 위에) 그린다(벽이나 빛에 덮여 산소가 회보라로 보였다. 2026-11-15 눈검수)
    const dotMat = (c: string): T.MeshBasicMaterial => M(new THREE.MeshBasicMaterial({ color: col(c), transparent: true, depthTest: false, depthWrite: false }));
    const gasSet = (): Record<Gas, T.MeshBasicMaterial> => ({ o2: dotMat(RC.o2), co2: dotMat(RC.co2), nut: dotMat(RC.nut), waste: dotMat(RC.waste) });
    const gasMats = { macro: gasSet(), body: gasSet(), lung: gasSet() };
    interface Hero {
      g: T.Group;
      disc: T.Mesh;
      mat: T.MeshStandardMaterial;
      beads: T.Mesh[]; // b0~b3
      plasma: T.Mesh[]; // p0~p2 (이산화 탄소)
      nut: T.Mesh[]; // n0, n1
      glow?: T.Sprite;
    }
    const makeHero = (where: "macro" | "body" | "lung", parent: T.Object3D, unit: number, withGlow: boolean): Hero => {
      const g = new THREE.Group();
      parent.add(g);
      const mat = M(new THREE.MeshStandardMaterial({ color: col(RC.rich), emissive: col(RC.rich), emissiveIntensity: 0.32, roughness: 0.42, metalness: 0, transparent: true }));
      reg(where, mat);
      const disc = new THREE.Mesh(rbcGeo, mat);
      disc.renderOrder = 7;
      disc.scale.set(17 * unit, 17 * unit * 0.95, 17 * unit);
      disc.rotation.x = 1.15;
      g.add(disc);
      const bead = (gm: Gas, r: number): T.Mesh => {
        const m = mesh(where, sphereLo, gasMats[where][gm], g);
        m.scale.setScalar(r * unit);
        m.renderOrder = 8;
        return m;
      };
      const h: Hero = {
        g,
        disc,
        mat,
        beads: (["b0", "b1", "b2", "b3"] as const).map(() => bead("o2", 4.6)),
        plasma: (["p0", "p1", "p2"] as const).map(() => bead("co2", 4.4)),
        nut: (["n0", "n1"] as const).map(() => bead("nut", 4.4)),
      };
      // 이 랩의 주인공(따라가는 혈액 한 방울)은 옅은 빛을 둘러 함께 흐르는 다른 적혈구와 구별한다
      const sm = M(new THREE.SpriteMaterial({ map: glowTex("rgba(255,236,240,.85)", "rgba(255,120,140,0)"), transparent: true, depthWrite: false }));
      if (!withGlow) reg(where, sm);
      const sp = new THREE.Sprite(sm);
      sp.scale.setScalar((withGlow ? 78 : 64) * unit);
      sp.renderOrder = 1;
      sp.position.z = -8 * unit; // 적혈구 뒤에 둔다(앞에 두면 알갱이와 적혈구를 하얗게 덮는다)
      if (!withGlow) sm.opacity = 0.55;
      g.add(sp);
      h.glow = sp;
      return h;
    };
    // 큰 그림에서는 혈관보다 크게(어디서든 보이게) 그리고 빛을 두른다. 확대 판에서는 모세혈관에 꼭 맞는 크기다.
    const heroMacro = makeHero("macro", macro, S * 0.36, true);
    const heroBody = makeHero("body", microBody, 1, false);
    const heroLung = makeHero("lung", microLung, 1, false);

    // ── 확대 판: 조직세포 곁의 모세혈관 ──
    /** 확대 판의 혈관 하나: 혈액(속)과 벽(바깥 막). end, start는 이어지는 혈관의 굵기(끝이나 처음의 15%에서 그 굵기로 옮겨 간다). */
    const microTube = (where: "body" | "lung", parent: T.Group, seg: MicroSeg, c0: string, c1: string, wallC: string, to?: MicroSeg, from?: MicroSeg): { core: T.ShaderMaterial; wall: T.ShaderMaterial } => {
      const raw = PATHS[seg].pts;
      const ext = (a: Pt, b: Pt): Pt => {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const n = Math.hypot(dx, dy) || 1;
        return [a[0] + (dx / n) * 4, a[1] + (dy / n) * 4];
      };
      const pts = [ext(raw[0], raw[1]), ...raw, ext(raw[raw.length - 1], raw[raw.length - 2])].map((p) => L(p, 0));
      const w = MICRO_WALL[seg];
      const ramp = (key: "r" | "wall") => (u: number): number => {
        let k = 1;
        if (to && u > 0.82) k = lerp(1, MICRO_WALL[to][key] / w[key], ease((u - 0.82) / 0.18));
        if (from && u < 0.18) k = lerp(MICRO_WALL[from][key] / w[key], 1, ease(u / 0.18));
        return k;
      };
      const core = tubeMat(c0, c1, PATHS[seg].len / 40, 0);
      core.uniforms.uFill.value = 1;
      core.uniforms.uBand.value = 0;
      mesh(where, tubeGeo(pts, w.r, 90, 14, to || from ? ramp("r") : undefined), core, parent).renderOrder = 3;
      const wall = band(wallC, { tint: 0.16, b0: 0.18, b1: 0.9 });
      const wm = mesh(where, tubeGeo(pts, w.wall, 90, 18, to || from ? ramp("wall") : undefined), wall, parent);
      wm.renderOrder = 5;
      return { core, wall };
    };
    const mArt = microTube("body", microBody, "mart", RC.rich, RC.rich, "#F2A3AE", "mcap");
    const mCap = microTube("body", microBody, "mcap", RC.rich, RC.poor, "#F6C9D0");
    const mVen = microTube("body", microBody, "mven", RC.poor, RC.poor, "#C9A4D6", undefined, "mcap");
    mArt.wall.uniforms.uTint.value = 0.34; // 동맥의 벽은 두껍고 진하게
    mVen.wall.uniforms.uTint.value = 0.22;
    mCap.wall.uniforms.uTint.value = 0.06; // 모세혈관의 벽은 매우 얇다
    MICRO_CELLS.forEach((c, i) => {
      const m = mesh("body", sphere, band(RC.cell, { tint: 0.14, b0: 0.24 }), microBody);
      m.position.copy(L(c.c, -c.r * 0.5));
      m.scale.set(c.r, c.r * 0.94, c.r * 0.78);
      m.renderOrder = 2;
      const nuc = mesh("body", sphere, std("#C46A3C", 0.22), microBody);
      const off: Pt = [[-14, -12], [12, 12], [10, -10], [-10, 10], [8, 12], [-6, -8], [6, 6], [-6, 8]][i] as Pt;
      nuc.position.copy(L([c.c[0] + off[0], c.c[1] + off[1]], -c.r * 0.45));
      nuc.scale.setScalar(c.r * 0.3);
    });
    const cellCo2 = CELL_CO2.map((p) => {
      const m = mesh("body", sphereLo, gasMats.body.co2, microBody);
      m.position.copy(L(p, 4));
      m.scale.setScalar(4.4);
      m.renderOrder = 8;
      return m;
    });
    const cellWaste = CELL_WASTE.map((p) => {
      const m = mesh("body", sphereLo, gasMats.body.waste, microBody);
      m.position.copy(L(p, 4));
      m.scale.setScalar(4.4);
      m.renderOrder = 8;
      return m;
    });

    // ── 확대 판: 허파꽈리를 감싼 모세혈관 ──
    MICRO_AIRWAY.forEach((pts, i) => mesh("lung", tubeGeo(smooth(pts, 8).map((p) => L(p, -30)), i ? 9 : 12, 30, 12), std(RC.air, 0.16), microLung));
    const alvMats: T.ShaderMaterial[] = [];
    const alvMeshes = MICRO_ALV.map((a) => {
      const mat = band("#BFE3FF", { tint: 0.08, b0: 0.22 });
      alvMats.push(mat);
      const m = mesh("lung", sphere, mat, microLung);
      m.position.copy(L(a.c, -a.r * 0.6));
      m.scale.set(a.r, a.r, a.r * 0.8);
      m.renderOrder = 2;
      return m;
    });
    const lCap = microTube("lung", microLung, "lcap", RC.poor, RC.rich, "#F6C9D0");
    lCap.wall.uniforms.uTint.value = 0.06;
    const alvO2 = ALV_O2.map((p) => {
      const m = mesh("lung", sphereLo, gasMats.lung.o2, microLung);
      m.position.copy(L(p, 2));
      m.scale.setScalar(4.6);
      m.renderOrder = 8;
      return m;
    });
    const breathO2 = BREATH_IN.map(() => {
      const m = mesh("lung", sphereLo, gasMats.lung.o2, microLung);
      m.scale.setScalar(4.6);
      m.renderOrder = 8;
      m.visible = false;
      return m;
    });

    // ── 날아가는 알갱이(교환 장면). 확대 판마다 한 벌 ──
    const flyers = (where: "body" | "lung", parent: T.Group, list: Flight[]): T.Mesh[] =>
      list.map((fl) => {
        const m = mesh(where, sphereLo, gasMats[where][fl.g], parent);
        m.scale.setScalar(fl.g === "o2" ? 4.6 : 4.4);
        m.renderOrder = 8;
        m.visible = false;
        return m;
      });
    const bodyFly = flyers("body", microBody, BODY_FLIGHTS);
    const lungFly = flyers("lung", microLung, LUNG_FLIGHTS);
    const bumpBead = mesh("body", sphereLo, gasMats.body.o2, microBody);
    bumpBead.scale.setScalar(4.6);
    bumpBead.renderOrder = 8;
    bumpBead.visible = false;

    // ── 확대 판 안에서 함께 흐르는 다른 적혈구(교환이 시작되면 흐른다) ──
    const crowd = (where: "body" | "lung", parent: T.Group, n: number): T.InstancedMesh => {
      const crowdMat = M(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0 }));
      reg(where, crowdMat);
      const im = new THREE.InstancedMesh(rbcGeo, crowdMat, n);
      im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      parent.add(im);
      return im;
    };
    const crowdBody = crowd("body", microBody, 7);
    const crowdLung = crowd("lung", microLung, 5);
    const BODY_LINE = poly([...PATHS.mart.pts, ...PATHS.mcap.pts.slice(1), ...PATHS.mven.pts.slice(1)]);
    const bodyBounds = [PATHS.mart.len / BODY_LINE.len, (PATHS.mart.len + PATHS.mcap.len) / BODY_LINE.len];

    // ── 그리기 ──
    let drawn = false;
    let w0 = 0;
    let h0 = 0;
    let pr0 = 0;
    const size = (): void => {
      const w = box.clientWidth || RW;
      const h = box.clientHeight || RH;
      // stageDpr()는 무대가 --lk만큼 커진다고 보고 셈한다. 이 무대는 자기 배율(zoomOf)로 커지므로 그만큼 바꿔 쓴다.
      let pr = Math.min((stageDpr() / wideStageScale()) * zoomOf(box), 4);
      if (w * h * pr * pr > MAX_PX) pr = Math.sqrt(MAX_PX / (w * h));
      if (w === w0 && h === h0 && Math.abs(pr - pr0) < 0.01) return;
      w0 = w;
      h0 = h;
      pr0 = pr;
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      probe.aspect = w / h;
      probe.updateProjectionMatrix();
    };
    size();
    ro = new ResizeObserver(() => {
      size();
      wake();
    });
    ro.observe(box);

    // 구도: 카메라가 보는 점과 거리(세로로 보이는 폭에서 셈한다)
    const tanH = Math.tan(((FOV / 2) * Math.PI) / 180);
    interface Cam {
      t: V3;
      d: number;
    }
    const heroPt = (now: number): Pt | null => {
      if (isMicro(st.seg)) return null;
      return along(PATHS[st.seg as MacroSeg], progress(st, now));
    };
    let lastFollow: Pt = [205, 264];
    const goal = (f: FrameKey, now: number): Cam => {
      if (f === "body" || f === "lung") {
        const k = MICRO_AT[f].k;
        return { t: W(MICRO_AT[f].at), d: ((RH * S) / k / 2) / tanH };
      }
      const fr = f === "follow" ? followFrame((lastFollow = heroPt(now) ?? lastFollow)) : FRAMES[f];
      return { t: W(fr.c), d: ((RH / fr.z) * S) / 2 / tanH };
    };
    let camFrom: Cam = goal("all", performance.now());
    let camKey = `${st.frame}:${st.ft0}`;
    const cam: Cam = { t: camFrom.t.clone(), d: camFrom.d };
    const setCam = (c: T.PerspectiveCamera, at: Cam, sway: number): void => {
      c.position.set(at.t.x + Math.sin(sway) * at.d, at.t.y + at.d * TILT, at.t.z + Math.cos(sway) * at.d);
      c.lookAt(at.t);
      c.updateMatrixWorld();
    };
    const toPx = (v: V3, c: T.PerspectiveCamera): Pt => {
      const p = v.clone().project(c);
      return [((p.x + 1) / 2) * RW, ((1 - p.y) / 2) * RH];
    };
    const microAmt = (now: number): { body: number; lung: number } => {
      const k = clamp01((now - st.ft0) / Math.max(1, st.fdur));
      const isB = st.frame === "body";
      const isL = st.frame === "lung";
      // 들어갈 때는 끝의 절반 동안 나타나고, 나올 때는 처음 절반 동안 사라진다
      const inn = clamp01((k - 0.45) / 0.5);
      const out = 1 - clamp01(k / 0.5);
      return { body: isB ? inn : prevMicro === "body" ? out : 0, lung: isL ? inn : prevMicro === "lung" ? out : 0 };
    };
    let prevMicro: "" | "body" | "lung" = "";
    let lastFrame: FrameKey = st.frame;
    const setAlpha = (where: "macro" | "body" | "lung", a: number): void => {
      const grp = where === "macro" ? macro : where === "body" ? microBody : microLung;
      grp.visible = a > 0.01;
      fade[where].forEach((e) => {
        if (e.isShader) (e.m as T.ShaderMaterial).uniforms.uA.value = a;
        else {
          e.m.opacity = e.base * a;
          const tr = e.tr || a < 0.999;
          if (e.m.transparent !== tr) {
            e.m.transparent = tr;
            e.m.needsUpdate = true;
          }
        }
      });
    };

    const tmp = new THREE.Vector3();
    // 매 장면 새로 만들지 않고 다시 쓰는 것들(저사양 폰에서 쓰레기 수거를 줄인다)
    const C_POOR = col(RC.poor);
    const C_RICH = col(RC.rich);
    const cTmp = new THREE.Color();
    const m4 = new THREE.Matrix4();
    const qTmp = new THREE.Quaternion();
    const eTmp = new THREE.Euler();
    const S_CROWD = new THREE.Vector3(13, 12, 13);
    const setL = (o: T.Object3D, p: Pt, z: number): void => {
      o.position.set(p[0] - 173, 220 - p[1], z);
    };
    const heroAt = (seg: MicroSeg, now: number): Pt => along(PATHS[seg], progress(st, now));
    /** 적혈구 하나를 그린다: 자리, 색(산소), 실은 것. 산소는 적혈구에 붙고, 혈장의 알갱이는 길을 따라 적혈구 앞뒤에 있다(혈관 안).
     *  toV는 그 판의 좌표(px)를 적혈구의 부모 좌표로, zh는 적혈구의 깊이, k는 실은 것의 거리 배율(큰 그림에서는 작게). */
    const paintHero = (h: Hero, path: Poly, t: number, toV: (p: Pt, z: number) => V3, zh: number, k: number, o2: number, cargo: { beads: number; co2: number; nut: number }, time: number): void => {
      h.g.position.copy(toV(along(path, t), zh));
      h.mat.color.copy(C_POOR).lerp(C_RICH, o2);
      h.mat.emissive.copy(h.mat.color);
      h.disc.rotation.y = still ? 0.4 : time * 0.6;
      const put = (slot: Slot, m: T.Mesh, show: boolean): void => {
        m.visible = show;
        if (show) m.position.copy(toV(cargoAt(path, t, slot, k), zh)).sub(h.g.position);
      };
      (["b0", "b1", "b2", "b3"] as const).forEach((sl, i) => put(sl, h.beads[i], i < cargo.beads));
      (["p0", "p1", "p2"] as const).forEach((sl, i) => put(sl, h.plasma[i], i < cargo.co2));
      (["n0", "n1"] as const).forEach((sl, i) => put(sl, h.nut[i], i < cargo.nut));
    };
    const toW = (p: Pt, z: number): V3 => W(p, z);
    const toL = (p: Pt, z: number): V3 => L(p, z);
    /** 교환 장면의 알갱이: 적혈구에 붙었다가 떨어지거나, 세포(허파꽈리)에서 와서 붙는다 */
    const flights = (list: Flight[], ms: T.Mesh[], dt: number, slotAtT: (t: number, slot: Slot) => Pt, active: boolean): Set<string> => {
      const onHero = new Set<string>(); // 지금 적혈구에 붙어 있는 자리
      list.forEach((fl, i) => {
        const m = ms[i];
        if (!active) {
          m.visible = false;
          if (fl.from === "hero") onHero.add(fl.slot);
          return;
        }
        const k = clamp01((dt - fl.t0) / (fl.t1 - fl.t0));
        const heroP = (t: number): Pt => slotAtT(t < 0 ? dt : t, fl.slot);
        if (k <= 0) {
          if (fl.from === "hero") {
            onHero.add(fl.slot);
            m.visible = false;
          } else {
            m.visible = true;
            setL(m, fl.from as Pt, 6);
          }
          return;
        }
        if (k >= 1) {
          if (fl.to === "hero") {
            onHero.add(fl.slot);
            m.visible = false;
          } else {
            m.visible = true;
            setL(m, fl.to as Pt, 6);
          }
          return;
        }
        const a: Pt = fl.from === "hero" ? heroP(fl.t0) : (fl.from as Pt);
        const b: Pt = fl.to === "hero" ? heroP(-1) : (fl.to as Pt);
        const e = ease(k);
        m.visible = true;
        setL(m, [lerp(a[0], b[0], e), lerp(a[1], b[1], e)], 10 + Math.sin(Math.PI * k) * 14);
      });
      return onHero;
    };

    let lastT = performance.now();
    let lastDraw = 0;
    let frameNo = 0;
    const tick = (): void => {
      if (dead) return;
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      // 움직이는 것이 없으면 초당 스무 장만
      const busy =
        now - st.t0 < st.dur + 100 || now - st.ft0 < st.fdur + 100 || now - st.ot0 < st.odur + 100 || (st.ex && now - st.et0 < 4600) || (st.beat && now - st.bt0 < st.bhold + 500) || (st.hint && now - st.ht0 < 2400);
      if (!busy && now - lastDraw < 50 && drawn) return;
      lastDraw = now;
      frameNo += 1;
      // 검사 도구가 그린 장수를 센다(개발 서버에서만. 화면 밖이나 랩을 떠난 뒤에 멈추는지 본다)
      if (import.meta.env.DEV) (window as unknown as { __rideFrames?: number }).__rideFrames = ((window as unknown as { __rideFrames?: number }).__rideFrames ?? 0) + 1;
      const time = still ? 0 : now / 1000;
      if (frameNo % 45 === 0) size(); // 넓은 화면의 배율이 바뀌었을 수 있다(창 크기, 회전)

      // 구도가 바뀌면 지금 카메라에서 출발한다
      const k2 = `${st.frame}:${st.ft0}`;
      if (k2 !== camKey) {
        camKey = k2;
        camFrom = { t: cam.t.clone(), d: cam.d };
        prevMicro = lastFrame === "body" || lastFrame === "lung" ? lastFrame : "";
        lastFrame = st.frame;
      }
      const g = goal(st.frame, now);
      const fk = ease(clamp01((now - st.ft0) / Math.max(1, st.fdur)));
      cam.t.lerpVectors(camFrom.t, g.t, fk);
      cam.d = Math.exp(lerp(Math.log(camFrom.d), Math.log(g.d), fk));
      const sway = still ? 0 : 0.05 * Math.sin(time * 0.45);
      setCam(camera, cam, sway);

      // 큰 그림과 확대 판 사이의 넘어감
      const mic = microAmt(now);
      setAlpha("body", mic.body);
      setAlpha("lung", mic.lung);
      setAlpha("macro", 1 - Math.max(mic.body, mic.lung));

      // 지나온 길 채우기
      const pr = progress(st, now);
      (Object.keys(fills) as FillKey[]).forEach((fk2) => {
        const f = fills[fk2];
        let v = st.done.includes(fk2) ? 1 : 0;
        if (st.seg === fk2) v = clamp01((pr - f.t0) / (f.t1 - f.t0));
        f.mats.forEach((m) => {
          m.uniforms.uFill.value = v;
          m.uniforms.uT.value = time * 0.5;
          m.uniforms.uHint.value = 0;
          if (st.dim.includes(fk2)) m.uniforms.uA.value *= 0.28; // 헷갈리게 하는 이웃 혈관은 그동안 흐리게
        });
      });
      if (st.hint === "vc") {
        const hk = clamp01((now - st.ht0) / 2400);
        fills.vc.mats[0].uniforms.uHint.value = hk < 1 ? 0.6 + 0.4 * Math.sin(now / 130) : 0;
      }
      pvArrows.forEach((a, i) => {
        const on = st.hint === "pvdir" && now - st.ht0 < 2600;
        a.visible = on;
        if (on) {
          const ph = ((now - st.ht0) / 700 + i * 0.33) % 1;
          (a.material as T.MeshStandardMaterial).emissiveIntensity = 0.4 + 0.6 * Math.sin(ph * Math.PI);
        }
      });

      // 두 순환의 구역
      const gl = (m: T.Mesh, on: boolean): void => {
        const mm = m.material as T.MeshBasicMaterial;
        mm.opacity += ((on ? 1 : 0) - mm.opacity) * Math.min(1, dt * 3);
      };
      gl(glowBody, st.loops >= 1);
      gl(glowLung, st.loops >= 2);
      links.forEach((m) => {
        m.visible = st.links;
        if (st.links) linkMat.emissiveIntensity = 0.55 + (still ? 0 : 0.35 * Math.sin(now / 240));
      });

      // 심장 박동: 수축하는 방이 줄어들고 판막이 열리고 닫힌다
      const sq = beatAmt(st, now);
      (Object.keys(rooms) as Room[]).forEach((rk) => {
        const atr = rk === "ra" || rk === "la";
        const on = (st.beat === "atria" && atr) || (st.beat === "vent" && !atr);
        const s = 1 - (on ? 0.14 * sq : 0);
        const r = ROOM[rk];
        rooms[rk].scale.set(r.rx * S * s, r.ry * S * s, 0.24 * s);
      });
      shell.scale.setScalar(st.beat === "vent" ? 1 - 0.03 * sq : 1);
      // 쉬고 있을 때와 심방이 수축할 때: 방실판막은 열림(아래로), 동맥 쪽 판막은 닫힘. 심실이 수축할 때: 방실판막 닫힘, 동맥 쪽 판막 열림(위로).
      const ventOn = st.beat === "vent" ? sq : 0;
      // 심실이 수축할 때 닫히는 방실판막과 열리는 동맥 쪽 판막이 빛난다(그 순간 도움말이 판막을 말한다)
      avMat.emissiveIntensity = 0.3 + 0.9 * ventOn;
      slMat.emissiveIntensity = 0.3 + 0.5 * ventOn;
      flaps.forEach((fl) => {
        // 왼쪽 막(side -1)은 오른쪽으로 뻗어 있다. 끝이 아래로 내려가면 시계 방향(-), 위로 올라가면 반시계 방향(+)
        const open = fl.up ? ventOn : 1 - ventOn;
        const a = (fl.up ? 1.25 : 1.05) * open;
        fl.piv.rotation.z = (fl.up ? -fl.side : fl.side) * a;
      });

      // 혈액 한 방울
      let heroScreen: Pt | null = null;
      const o2 = oxygen(st, now);
      const macroOn = !isMicro(st.seg);
      heroMacro.g.visible = macroOn;
      if (macroOn) {
        const rich = o2 > 0.5;
        paintHero(heroMacro, PATHS[st.seg as MacroSeg], pr, toW, 0.34, 0.38, o2, { beads: rich ? 4 : 0, co2: rich ? 0 : 3, nut: 0 }, time);
        heroScreen = toPx(heroMacro.g.position, camera);
        if (heroMacro.glow) (heroMacro.glow.material as T.SpriteMaterial).opacity = 0.75 + (still ? 0 : 0.25 * Math.sin(now / 260));
      }
      // 확대 판: 온몸
      const exT = now - st.et0;
      if (microBody.visible) {
        const inBody = st.seg === "mart" || st.seg === "mcap" || st.seg === "mven";
        heroBody.g.visible = inBody;
        const exOn = st.ex === "body";
        const hp: Pt = inBody ? heroAt(st.seg as MicroSeg, now) : [262, 126];
        const after = st.seg === "mven" || (st.seg === "mcap" && exOn && exT > 3600);
        const onHero = flights(BODY_FLIGHTS, bodyFly, exT, (t, sl) => cargoAt(PATHS.mcap, progress(st, st.et0 + t), sl), exOn && st.seg === "mcap");
        if (inBody) {
          const cargo = exOn
            ? { beads: ["b0", "b1", "b2", "b3"].filter((s) => onHero.has(s)).length, co2: 0, nut: ["n0", "n1"].filter((s) => onHero.has(s)).length }
            : after
              ? { beads: 0, co2: 3, nut: 0 }
              : { beads: 4, co2: 0, nut: 2 };
          paintHero(heroBody, PATHS[st.seg as MicroSeg], pr, toL, 6, 1, o2, cargo, time);
          heroScreen = toPx(microBody.localToWorld(tmp.set(hp[0] - 173, 220 - hp[1], 6)), camera);
          if (exOn) {
            // 받은 이산화 탄소와 노폐물은 혈장에 실려 함께 간다
            (["p0", "p1", "p2"] as const).forEach((s, i) => {
              const m = heroBody.plasma[i];
              m.visible = onHero.has(s);
              const fl = BODY_FLIGHTS.find((f) => f.slot === s);
              if (fl) m.material = gasMats.body[fl.g];
            });
          }
        }
        // 세포 안의 이산화 탄소: 교환이 진행되면 세포를 떠난 만큼 줄어든다(남은 것은 보인다)
        cellCo2.forEach((m, i) => (m.visible = !(exOn && exT > 1100 + i * 220) && !after));
        cellWaste.forEach((m, i) => (m.visible = !(exOn && exT > 1500 + i * 600) && !after));
        // 벽에 막혀 되돌아오는 산소(동맥에서 내보내려 할 때)
        const bump = st.ex === "bumpArt" && exT < 1300;
        bumpBead.visible = bump;
        if (bump) {
          const k = exT < 650 ? exT / 650 : 1 - (exT - 650) / 650;
          const a: Pt = [hp[0] + SLOT.b1[0], hp[1] + SLOT.b1[1]];
          const b: Pt = [hp[0] + 30, hp[1] + 4];
          setL(bumpBead, [lerp(a[0], b[0], ease(k)), lerp(a[1], b[1], ease(k))], 12);
          heroBody.beads[1].visible = false;
        }
        mArt.wall.uniforms.uGlow.value = st.ex === "bumpArt" && exT < 1500 ? 0.6 + 0.4 * Math.sin(exT / 90) : 0;
        mVen.wall.uniforms.uGlow.value = st.ex === "bumpVen" && exT < 1500 ? 0.6 + 0.4 * Math.sin(exT / 90) : 0;
        // 모세혈관 안의 색은 처음부터 동맥 쪽(선홍)에서 정맥 쪽(어두움)으로 서서히 바뀐다. 색이 바뀌는 곳이 곧 물질을 주고받는 곳이다
        // (교환 전에 통째로 선홍색으로 두었더니 정맥 입구에서 색이 뚝 바뀌어 정맥에서 주고받는 것처럼 보였다. 2026-11-15 눈검수)
        mCap.core.uniforms.uMix.value = 1;
        mCap.core.uniforms.uT.value = time * 0.6;
        mArt.core.uniforms.uT.value = time * 0.6;
        mVen.core.uniforms.uT.value = time * 0.6;
        // 함께 흐르는 적혈구: 교환이 시작되면 흐르고, 모세혈관을 지나며 색이 바뀐다
        const flowing = exOn || after;
        for (let i = 0; i < 7; i++) {
          let u = (i / 7 + (flowing ? (now / 9000) % 1 : 0)) % 1;
          if (!flowing) u = (i / 7) * bodyBounds[0];
          const p = along(BODY_LINE, u);
          tmp.set(p[0] - 173, 220 - p[1], 3);
          m4.compose(tmp, qTmp.setFromEuler(eTmp.set(1.1, i * 0.7 + time * 0.5, 0)), S_CROWD);
          crowdBody.setMatrixAt(i, m4);
          const cc = u < bodyBounds[0] ? 1 : u > bodyBounds[1] ? 0 : 1 - (u - bodyBounds[0]) / (bodyBounds[1] - bodyBounds[0]);
          crowdBody.setColorAt(i, cTmp.copy(C_POOR).lerp(C_RICH, flowing ? cc : 1));
        }
        crowdBody.instanceMatrix.needsUpdate = true;
        if (crowdBody.instanceColor) crowdBody.instanceColor.needsUpdate = true;
      }
      // 확대 판: 허파
      if (microLung.visible) {
        const inLung = st.seg === "lcap";
        heroLung.g.visible = inLung;
        const lungOn = st.ex === "lung";
        const breathOn = st.ex === "breath" || lungOn;
        const lp = inLung ? heroAt("lcap", now) : PATHS.lcap.pts[0];
        const onHero = flights(LUNG_FLIGHTS, lungFly, exT, (t, sl) => cargoAt(PATHS.lcap, progress(st, st.et0 + t), sl), lungOn && inLung);
        const afterLung = st.done.includes("lbed");
        if (inLung) {
          const cargo = lungOn
            ? { beads: ["b0", "b1", "b2", "b3"].filter((s) => onHero.has(s)).length, co2: ["p0", "p1", "p2"].filter((s) => onHero.has(s)).length, nut: 0 }
            : { beads: 0, co2: 3, nut: 0 };
          paintHero(heroLung, PATHS.lcap, pr, toL, 6, 1, o2, cargo, time);
          heroScreen = toPx(microLung.localToWorld(tmp.set(lp[0] - 173, 220 - lp[1], 6)), camera);
          if (lungOn) {
            (["b0", "b1", "b2", "b3"] as const).forEach((s, i) => (heroLung.beads[i].visible = onHero.has(s)));
            (["p0", "p1", "p2"] as const).forEach((s, i) => (heroLung.plasma[i].visible = onHero.has(s)));
          }
        }
        // 숨: 허파꽈리가 부풀고 숨관가지 끝에서 산소가 들어온다
        const bt = st.ex === "breath" ? exT : lungOn ? BREATH_DUR : -1;
        const swell = st.ex === "breath" && exT < BREATH_DUR ? Math.sin(Math.PI * clamp01(exT / BREATH_DUR)) : 0;
        alvMeshes.forEach((m, i) => {
          const a = MICRO_ALV[i];
          const s = 1 + 0.06 * swell;
          m.scale.set(a.r * s, a.r * s, a.r * 0.8 * s);
        });
        breathO2.forEach((m, i) => {
          const b = BREATH_IN[i];
          m.visible = breathOn && bt >= b.t0;
          if (!m.visible) return;
          const k = ease(clamp01((bt - b.t0) / 800));
          setL(m, [lerp(BREATH_FROM[0], b.to[0], k), lerp(BREATH_FROM[1], b.to[1], k)], 4);
        });
        alvO2.forEach((m) => (m.visible = true));
        lCap.core.uniforms.uMix.value = 1;
        lCap.core.uniforms.uT.value = time * 0.6;
        alvMats.forEach((m) => (m.uniforms.uGlow.value = st.ex === "breath" ? 0.25 * swell : 0));
        const flowing = lungOn || afterLung;
        for (let i = 0; i < 5; i++) {
          const u = (i / 5 + (flowing ? (now / 8000) % 1 : 0)) % 1;
          const p = along(PATHS.lcap, u);
          tmp.set(p[0] - 173, 220 - p[1], 3);
          m4.compose(tmp, qTmp.setFromEuler(eTmp.set(1.1, i * 0.9 + time * 0.5, 0)), S_CROWD);
          crowdLung.setMatrixAt(i, m4);
          crowdLung.setColorAt(i, cTmp.copy(C_POOR).lerp(C_RICH, flowing ? u : 0));
        }
        crowdLung.instanceMatrix.needsUpdate = true;
        if (crowdLung.instanceColor) crowdLung.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);

      // 이름표와 단추의 자리
      const fNow = st.frame;
      const micNow = fNow === "body" || fNow === "lung" ? fNow : "";
      const settled = clamp01((now - st.ft0) / Math.max(1, st.fdur)) >= 1;
      ov.layout(
        (k: TagKey) => {
          const a = tagAnchor(k);
          if (!a) return null;
          if ((a.micro ?? "") !== micNow) return null;
          if (!settled && (micNow !== "" || prevMicro !== "")) return null;
          let v: V3;
          if (a.micro) {
            const grp = a.micro === "body" ? microBody : microLung;
            v = grp.localToWorld(L(a.p, 20));
          } else v = W(a.p, k === "bodyLoop" || k === "lungLoop" ? 0 : 0.3);
          const p = toPx(v, camera);
          return [p[0] + (a.dx ?? 0), p[1] + (a.dy ?? 0)];
        },
        (pk: Pick) => {
          if (pk.at) return pk.at;
          // 네 방의 단추: 구도가 끝난 모습에서 방의 가운데
          setCam(probe, goal(st.frame, st.ft0 + st.fdur + 1), 0);
          const r = ROOM[pk.key as Room];
          return r ? toPx(W(r.c, 0.02), probe) : [RW / 2, RH / 2];
        },
        heroScreen,
      );
      if (!drawn) {
        drawn = true;
        box.classList.add("ready");
        o.onReady?.();
      }
    };

    // 화면 밖이거나 탭이 숨으면 그리지 않는다
    loop = createLoop(() => tick());
    wake = (): void => {
      if (!dead && seen && document.visibilityState !== "hidden") loop?.start();
    };
    io = new IntersectionObserver((ents) => {
      seen = ents.some((e) => e.isIntersecting);
      if (seen) wake();
      else loop?.stop();
    });
    io.observe(box);
    const onVis = (): void => {
      if (document.visibilityState === "hidden") loop?.stop();
      else wake();
    };
    document.addEventListener("visibilitychange", onVis);
    const onResize = (): void => {
      size();
      wake();
    };
    window.addEventListener("resize", onResize);
    wake();
    release = () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      crowdBody.dispose();
      crowdLung.dispose();
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texes.forEach((t) => t.dispose());
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  })();

  return {
    kind: "3d",
    set(next) {
      st = next;
      ov.sync(next);
      // 화면 전환이 그리기 루프를 멈춰 둔 채 무대가 살아 있을 수 있다. 상태가 바뀌면 다시 켠다(돌고 있으면 아무 일도 없다)
      if (!dead) wake();
    },
    dispose() {
      if (dead) return;
      dead = true;
      io?.disconnect();
      ro?.disconnect();
      loop?.stop();
      release?.();
      ov.dispose();
      canvas.remove();
      box.classList.remove("g2u6x-rd-3d", "ready");
    },
  };
}
