// [중2 Ⅶ v5] 고품질 유기적 스컬프팅 해부학 3D 오른손 모델 및 전자기 3D 그래픽 공용 부품.
// - three를 정적 import하지 않는다(import type만 사용). 호출부가 ui/space3d에서 내려받은 THREE를 넘긴다.
// - 각 부위를 원기둥·상자 조립이 아닌 연속 로프팅(Lofted BufferGeometry + 정점 색상 블렌딩 + 매끄러운 법선)과
//   곡면 손톱(Curved Nail Shell)으로 조형해 실제 손 모형처럼 자연스러운 실루엣과 손바닥/손등 대비를 구현한다.
//   1) buildPalmHand3d: 편 오른손(g2u7l8 palmLab).
//      로컬 축: +X = 엄지(전류 I), +Y = 네 손가락(자기장 B), +Z = 손바닥 법선(힘 F = I × B).
//      손바닥(+Z): 밝은 살구 톤 + 오목한 손바닥 굴곡·엄지두덩·새끼두덩 + 고해상도 손금 + 청록 발광 링 + '손바닥' 표시.
//      손등(-Z): 뚜렷하게 짙은 음영 피부 톤 + 손등 힘줄 융기·주먹 관절 + 곡면 광택 손톱 5개 + '손등' 표시.
//   2) buildGripHand3d: 코일 감아 쥔 오른손(g2u7l7 gripLab).
//      연속 로프팅된 굽은 손바닥·엄지두덩과 3마디 관절 주름이 살아 있는 네 손가락, 곡면 손톱 5개, 엄지("따봉" 실루엣)를 조형.
//      기본 자세(rotZ = 0, dir = +1): 뒤쪽(-Z)에 손바닥을 두고 네 손가락이 위에서 앞쪽(+Z)을 따라 아래(-Y)로 감기며 엄지가 오른쪽(+X).
//      rotZ = π(dir = -1): 네 손가락이 앞쪽(+Z)에서 위(+Y)로 감기며 엄지가 왼쪽(-X), 손목은 자연스럽게 뒤쪽 아래를 향한다.

import type * as T from "three";

export interface FatArrow3d {
  g: T.Group;
  set(tail: T.Vector3, dir: T.Vector3, len: number): void;
  setColor(hex: number): void;
  setOpacity(alpha: number): void;
  dir(): T.Vector3;
}

export interface StudioSceneOpts {
  floorY?: number;
  grid?: boolean;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp01((x - e0) / (e1 - e0 || 1e-6));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** 스튜디오 4점 조명 + 은은한 실험실 바닥 격자 및 반사 원반. */
export function setupStudioLights(THREE: typeof T, scene: T.Scene, o: StudioSceneOpts = {}): void {
  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0x18243b, 1.12));

  const key = new THREE.DirectionalLight(0xfff6eb, 2.25);
  key.position.set(4.8, 8.8, 7.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x7cc8ff, 1.25);
  rim.position.set(-6.2, 4.6, -5.2);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffe1be, 0.72);
  fill.position.set(1.6, -3.0, 5.8);
  scene.add(fill);

  if (o.grid !== false) {
    const fy = o.floorY ?? -1.52;
    const floorGlowCv = document.createElement("canvas");
    floorGlowCv.width = 256;
    floorGlowCv.height = 256;
    const fctx = floorGlowCv.getContext("2d")!;
    const fg = fctx.createRadialGradient(128, 128, 8, 128, 128, 126);
    fg.addColorStop(0, "rgba(38, 66, 112, 0.34)");
    fg.addColorStop(0.55, "rgba(20, 36, 66, 0.16)");
    fg.addColorStop(1, "rgba(10, 18, 34, 0)");
    fctx.fillStyle = fg;
    fctx.fillRect(0, 0, 256, 256);
    const floorTex = new THREE.CanvasTexture(floorGlowCv);
    floorTex.colorSpace = THREE.SRGBColorSpace;
    const floorDisc = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 11),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false }),
    );
    floorDisc.rotation.x = -Math.PI / 2;
    floorDisc.position.y = fy - 0.01;
    scene.add(floorDisc);

    const grid = new THREE.GridHelper(16, 28, 0x3f6090, 0x223654);
    grid.position.y = fy;
    const gm = grid.material as T.Material | T.Material[];
    const mats = Array.isArray(gm) ? gm : [gm];
    mats.forEach((m) => {
      m.transparent = true;
      m.opacity = 0.22;
    });
    scene.add(grid);
  }
}

/** 모서리가 매끈하게 챔퍼·라운딩된 3D 박스 지오메트리(자석·받침대·전원 장치용). */
export function makeRoundedBoxGeo(
  THREE: typeof T,
  w: number,
  h: number,
  d: number,
  r = 0.045,
  bevelSegs = 3,
): T.ExtrudeGeometry {
  const rr = Math.min(r, w * 0.28, h * 0.28, d * 0.28);
  const iw = Math.max(0.002, w - rr * 2);
  const ih = Math.max(0.002, h - rr * 2);
  const id = Math.max(0.002, d - rr * 2);
  const x0 = -iw / 2;
  const y0 = -ih / 2;
  const sh = new THREE.Shape();
  sh.moveTo(x0 + rr * 0.35, y0);
  sh.lineTo(x0 + iw - rr * 0.35, y0);
  sh.quadraticCurveTo(x0 + iw, y0, x0 + iw, y0 + rr * 0.35);
  sh.lineTo(x0 + iw, y0 + ih - rr * 0.35);
  sh.quadraticCurveTo(x0 + iw, y0 + ih, x0 + iw - rr * 0.35, y0 + ih);
  sh.lineTo(x0 + rr * 0.35, y0 + ih);
  sh.quadraticCurveTo(x0, y0 + ih, x0, y0 + ih - rr * 0.35);
  sh.lineTo(x0, y0 + rr * 0.35);
  sh.quadraticCurveTo(x0, y0, x0 + rr * 0.35, y0);
  const geo = new THREE.ExtrudeGeometry(sh, {
    depth: id,
    bevelEnabled: true,
    bevelThickness: rr,
    bevelSize: rr,
    bevelSegments: bevelSegs,
    curveSegments: 8,
  });
  geo.translate(0, 0, -id / 2);
  geo.computeVertexNormals();
  return geo;
}

/** 바닥 부드러운 접촉 그림자(Contact Shadow) 원반 생성. */
export function makeContactShadow3d(THREE: typeof T, rx: number, rz: number, opacity = 0.42): T.Mesh {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  g.addColorStop(0, `rgba(3, 8, 18, ${opacity.toFixed(2)})`);
  g.addColorStop(0.55, `rgba(4, 10, 22, ${(opacity * 0.48).toFixed(2)})`);
  g.addColorStop(1, "rgba(4, 10, 22, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(rx * 2, rz * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** 두 점을 잇는 둥근 원기둥. */
export function rodBetween3d(THREE: typeof T, a: T.Vector3, b: T.Vector3, r: number, mat: T.Material, parent: T.Object3D, segs = 18): T.Mesh {
  const len = Math.max(0.001, a.distanceTo(b));
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, segs), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  parent.add(m);
  return m;
}

/** 굵고 선명한 3D 벡터 화살표(어두운 외곽선 껍질 + 칼라 링 + 선택적 onTop). */
export function makeFatArrow3d(
  THREE: typeof T,
  o: { color: number; body: number; head: number; headLen: number; outline?: number; opacity?: number; onTop?: boolean; emissive?: number },
): FatArrow3d {
  const g = new THREE.Group();
  const isTrans = o.opacity !== undefined && o.opacity < 0.99;
  const mat = new THREE.MeshStandardMaterial({
    color: o.color,
    emissive: o.emissive ?? o.color,
    emissiveIntensity: 0.36,
    roughness: 0.3,
    metalness: 0.1,
    transparent: isTrans || o.onTop === true,
    opacity: o.opacity ?? 1,
  });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(o.body * 0.96, o.body * 1.04, 1, 18), mat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(o.head, o.headLen, 24), mat);
  const baseCap = new THREE.Mesh(new THREE.SphereGeometry(o.body * 1.04, 14, 10), mat);
  g.add(body, head, baseCap);

  let bodyO: T.Mesh | null = null;
  let headO: T.Mesh | null = null;
  let capO: T.Mesh | null = null;
  let om: T.MeshBasicMaterial | null = null;
  const ow = 0.022;
  if (o.outline !== undefined) {
    om = new THREE.MeshBasicMaterial({
      color: o.outline,
      side: THREE.BackSide,
      transparent: isTrans || o.onTop === true,
      opacity: o.opacity ?? 1,
    });
    bodyO = new THREE.Mesh(new THREE.CylinderGeometry(o.body * 0.96 + ow, o.body * 1.04 + ow, 1, 18), om);
    headO = new THREE.Mesh(new THREE.ConeGeometry(o.head + ow * 1.65, o.headLen + ow * 2.5, 24), om);
    capO = new THREE.Mesh(new THREE.SphereGeometry(o.body * 1.04 + ow, 14, 10), om);
    g.add(bodyO, headO, capO);
  }
  if (o.onTop) {
    g.traverse((m) => {
      const mm = (m as T.Mesh).material as T.Material | undefined;
      if (!mm) return;
      mm.depthTest = false;
      mm.depthWrite = false;
      m.renderOrder = (mm as T.MeshBasicMaterial).side === THREE.BackSide ? 6 : 7;
    });
  }
  const up = new THREE.Vector3(0, 1, 0);
  return {
    g,
    set(tail: T.Vector3, dir: T.Vector3, len: number): void {
      const d = dir.clone().normalize();
      const bl = Math.max(0.015, len - o.headLen);
      g.position.copy(tail);
      g.quaternion.setFromUnitVectors(up, d);
      body.scale.y = bl;
      body.position.y = bl / 2;
      head.position.y = bl + o.headLen / 2;
      baseCap.position.y = 0;
      if (bodyO && headO && capO) {
        bodyO.scale.y = bl + ow * 1.6;
        bodyO.position.y = bl / 2;
        headO.position.y = bl + o.headLen / 2 - ow * 0.4;
        capO.position.y = 0;
      }
    },
    setColor(hex: number): void {
      mat.color.setHex(hex);
      mat.emissive.setHex(hex);
    },
    setOpacity(alpha: number): void {
      mat.transparent = alpha < 0.99 || o.onTop === true;
      mat.opacity = alpha;
      if (om) {
        om.transparent = alpha < 0.99 || o.onTop === true;
        om.opacity = alpha;
      }
    },
    dir(): T.Vector3 {
      return up.clone().applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
    },
  };
}

/** 고해상도 다크 글래스 알약형 3D 배지 스프라이트. */
export function makeBadgeSprite3d(
  THREE: typeof T,
  text: string,
  o: { color?: string; border?: string; bg?: string; scale?: number; bold?: boolean } = {},
): T.Sprite {
  const cv = document.createElement("canvas");
  const ctx = cv.getContext("2d")!;
  const font = `${o.bold === false ? 700 : 800} 48px Pretendard, system-ui, sans-serif`;
  ctx.font = font;
  const tw = ctx.measureText(text).width;
  const pw = Math.ceil(tw + 58);
  const ph = 84;
  cv.width = pw;
  cv.height = ph;
  ctx.font = font;

  const grad = ctx.createLinearGradient(0, 4, 0, ph - 4);
  if (o.bg) {
    grad.addColorStop(0, o.bg);
    grad.addColorStop(1, o.bg);
  } else {
    grad.addColorStop(0, "rgba(15, 28, 50, 0.92)");
    grad.addColorStop(1, "rgba(8, 16, 30, 0.92)");
  }
  ctx.beginPath();
  ctx.roundRect(4, 4, pw - 8, ph - 8, 38);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = o.border ?? "rgba(255, 255, 255, 0.32)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = o.color ?? "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 4;
  ctx.fillText(text, pw / 2, ph / 2 + 2);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  const sc = o.scale ?? 0.36;
  sp.scale.set((pw / ph) * sc, sc, 1);
  sp.renderOrder = 10;
  return sp;
}

// ============================================================================
// 해부학 피부 정점 컬러 & 연속 로프팅(Lofting) 지오메트리 엔진
// ============================================================================

interface SkinPalette {
  /** 손바닥(+N) 밝은 복숭아 살구색 (sRGB 0..1) */
  palm: [number, number, number];
  /** 손바닥 주름·오목부 따뜻한 음영 */
  palmCrease: [number, number, number];
  /** 손가락 끝·엄지두덩 혈색 */
  flush: [number, number, number];
  /** 손등(-N) 차분하고 짙은 음영 살색 */
  dorsal: [number, number, number];
  /** 손등 주먹 관절·힘줄 깊은 음영 */
  dorsalDeep: [number, number, number];
}

const PALM_HAND_PALETTE: SkinPalette = {
  palm: [1.0, 0.905, 0.82], // #FFE7D1 (밝은 살구빛 손바닥)
  palmCrease: [0.89, 0.68, 0.55],
  flush: [0.98, 0.79, 0.7],
  dorsal: [0.74, 0.49, 0.35], // #BD7D59 (손바닥과 즉시 구분되는 깊은 음영 손등)
  dorsalDeep: [0.64, 0.4, 0.28],
};

const GRIP_HAND_PALETTE: SkinPalette = {
  palm: [0.99, 0.87, 0.77],
  palmCrease: [0.86, 0.65, 0.52],
  flush: [0.96, 0.75, 0.65],
  dorsal: [0.82, 0.58, 0.43],
  dorsalDeep: [0.71, 0.47, 0.34],
};

/** sRGB 0..1 → Three.js 선형 정점 컬러 변환(WebGLRenderer SRGB 출력 시 정확한 피부 발색 보장). */
function srgbToLin(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function skinRgbLinear(
  pal: SkinPalette,
  palmarness: number, // -1(완전 손등) .. +1(완전 손바닥)
  flushAmt = 0,
  creaseAmt = 0,
): [number, number, number] {
  const tPalm = smoothstep(-0.22, 0.34, palmarness);
  let r = mix(pal.dorsal[0], pal.palm[0], tPalm);
  let g = mix(pal.dorsal[1], pal.palm[1], tPalm);
  let b = mix(pal.dorsal[2], pal.palm[2], tPalm);

  if (flushAmt > 0.001) {
    const f = clamp01(flushAmt);
    r = mix(r, pal.flush[0], f * 0.55);
    g = mix(g, pal.flush[1], f * 0.55);
    b = mix(b, pal.flush[2], f * 0.55);
  }
  if (creaseAmt > 0.001) {
    const cr = clamp01(creaseAmt);
    const target = tPalm > 0.5 ? pal.palmCrease : pal.dorsalDeep;
    r = mix(r, target[0], cr);
    g = mix(g, target[1], cr);
    b = mix(b, target[2], cr);
  }
  return [srgbToLin(r), srgbToLin(g), srgbToLin(b)];
}

interface LoftRing {
  center: T.Vector3;
  /** 진행 방향 단위 벡터 */
  tangent: T.Vector3;
  /** 손바닥(지문 패드) 쪽을 가리키는 법선 단위 벡터 */
  palmarNormal: T.Vector3;
  /** 좌우 반폭 (B = tangent × palmarNormal 방향) */
  rx: number;
  /** 손바닥(+N) 쪽 두께 */
  rzPalm: number;
  /** 손등(-N) 쪽 두께 */
  rzDorsal: number;
  /** 관절 주름 오목/볼록 계수 */
  crease?: number;
  /** 손끝·관절 혈색 */
  flush?: number;
  /** 손등 마디 잔주름 돌기 */
  dorsalFold?: number;
}

/**
 * 다중 단면 링(LoftRing[])을 매끄러운 단일 닫힌 피부 메쉬(BufferGeometry)로 스티칭한다.
 * D자형 손가락 단면(손등은 편평한 아치형, 손바닥은 통통한 지문 패드)과 부드러운 둥근 끝 캡을 생성한다.
 */
function buildLoftedFingerGeo(
  THREE: typeof T,
  rings: LoftRing[],
  pal: SkinPalette,
  radialSegs = 24,
  capStart = false,
  capEnd = true,
): T.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const B = new THREE.Vector3();

  const ringCount = rings.length;
  for (let i = 0; i < ringCount; i++) {
    const rg = rings[i];
    B.crossVectors(rg.tangent, rg.palmarNormal).normalize();
    const N = rg.palmarNormal;

    for (let j = 0; j < radialSegs; j++) {
      const th = (j / radialSegs) * Math.PI * 2;
      const ct = Math.cos(th);
      const st = Math.sin(th); // >0 손바닥(+N), <0 손등(-N)

      // 손등(st < 0)은 살짝 각진 뼈대 평면감(squircle), 손바닥(st > 0)은 통통한 지문 살집
      let xOff = rg.rx * ct;
      let zOff: number;
      if (st >= 0) {
        const pad = Math.pow(st, 0.92);
        zOff = rg.rzPalm * pad;
      } else {
        const dor = Math.pow(-st, 0.82);
        const fold = (rg.dorsalFold ?? 0) * Math.pow(-st, 2.0);
        zOff = -(rg.rzDorsal + fold) * dor;
        xOff *= 1 - 0.05 * (-st);
      }

      const px = rg.center.x + B.x * xOff + N.x * zOff;
      const py = rg.center.y + B.y * xOff + N.y * zOff;
      const pz = rg.center.z + B.z * xOff + N.z * zOff;
      positions.push(px, py, pz);

      const cr = (rg.crease ?? 0) * (st >= 0 ? st * 0.85 : -st * 0.55);
      const [crR, crG, crB] = skinRgbLinear(pal, st, rg.flush ?? 0, cr);
      colors.push(crR, crG, crB);
    }
  }

  for (let i = 0; i < ringCount - 1; i++) {
    const base0 = i * radialSegs;
    const base1 = (i + 1) * radialSegs;
    for (let j = 0; j < radialSegs; j++) {
      const jNext = (j + 1) % radialSegs;
      const v00 = base0 + j;
      const v01 = base0 + jNext;
      const v10 = base1 + j;
      const v11 = base1 + jNext;
      indices.push(v00, v10, v11, v00, v11, v01);
    }
  }

  if (capStart) {
    const r0 = rings[0];
    const poleIdx = positions.length / 3;
    const p = r0.center.clone().addScaledVector(r0.tangent, -r0.rx * 0.25);
    positions.push(p.x, p.y, p.z);
    const [crR, crG, crB] = skinRgbLinear(pal, 0, r0.flush ?? 0, 0);
    colors.push(crR, crG, crB);
    for (let j = 0; j < radialSegs; j++) {
      const jNext = (j + 1) % radialSegs;
      indices.push(j, jNext, poleIdx);
    }
  }

  if (capEnd) {
    const rLast = rings[ringCount - 1];
    const lastBase = (ringCount - 1) * radialSegs;
    const poleIdx = positions.length / 3;
    const p = rLast.center
      .clone()
      .addScaledVector(rLast.tangent, rLast.rx * 0.36)
      .addScaledVector(rLast.palmarNormal, rLast.rzPalm * 0.08);
    positions.push(p.x, p.y, p.z);
    const [crR, crG, crB] = skinRgbLinear(pal, 0.35, 0.75, 0);
    colors.push(crR, crG, crB);
    for (let j = 0; j < radialSegs; j++) {
      const jNext = (j + 1) % radialSegs;
      indices.push(lastBase + j, poleIdx, lastBase + jNext);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** 고해상도 절차적 손톱 텍스처(반달 루눌라 + 은은한 분홍 조상 + 자연스러운 아이보리 끝단). */
function makeNailTex(THREE: typeof T): T.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;

  // u(가로 0..1: 좌→우), v(세로 0..1: 뿌리 큐티클→손톱 끝)
  // Three.js UV(0,0)=하단(뿌리), UV(0,1)=상단(끝단) → 캔버스 y=128이 뿌리, y=0이 끝단
  const bg = ctx.createLinearGradient(0, 128, 0, 0);
  bg.addColorStop(0.0, "#DFA89E"); // 큐티클 경계
  bg.addColorStop(0.16, "#F3CCC4"); // 루눌라 위쪽 분홍 조상
  bg.addColorStop(0.76, "#F7D6CE"); // 중심 손톱판
  bg.addColorStop(0.84, "#FFF6EE"); // 아이보리 프리엣지 경계
  bg.addColorStop(1.0, "#FFFBF6"); // 손톱 끝
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 128, 128);

  // 뿌리 쪽 반달(루눌라, lunula)
  ctx.fillStyle = "rgba(255, 249, 245, 0.78)";
  ctx.beginPath();
  ctx.ellipse(64, 118, 42, 26, 0, Math.PI, 0, false);
  ctx.fill();

  // 양옆 손톱 주름 미세 음영
  const sideGrad = ctx.createLinearGradient(0, 0, 128, 0);
  sideGrad.addColorStop(0, "rgba(150, 92, 78, 0.34)");
  sideGrad.addColorStop(0.14, "rgba(150, 92, 78, 0)");
  sideGrad.addColorStop(0.86, "rgba(150, 92, 78, 0)");
  sideGrad.addColorStop(1, "rgba(150, 92, 78, 0.34)");
  ctx.fillStyle = sideGrad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 손가락 등 쪽에 밀착되는 곡면 해부학 손톱 지오메트리(절대 손가락 끝 밖으로 네모나게 튀어나오지 않는다!).
 * 로컬 좌표: +Y = 손가락 끝 방향(길이 len), +Z = 손톱 바깥(등 쪽 볼록 법선), X = 좌우 폭(width).
 */
function makeCurvedNailGeo(THREE: typeof T, width: number, len: number, archH: number): T.BufferGeometry {
  const nu = 12;
  const nv = 12;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  for (let iv = 0; iv <= nv; iv++) {
    const v = iv / nv; // 0(큐티클 뿌리) .. 1(손톱 끝)
    // 뿌리와 끝단 모두 자연스러운 U자/아몬드 라운딩
    const rootRound = v < 0.22 ? Math.sqrt(Math.max(0.12, 1 - Math.pow((0.22 - v) / 0.22, 2) * 0.55)) : 1;
    const tipRound = v > 0.78 ? Math.sqrt(Math.max(0.18, 1 - Math.pow((v - 0.78) / 0.22, 2) * 0.62)) : 1;
    const halfW = (width * 0.5) * rootRound * tipRound * (0.94 + 0.06 * v);
    const y = (v - 0.5) * len;
    const longArch = Math.sin(v * Math.PI) * (len * 0.045);

    for (let iu = 0; iu <= nu; iu++) {
      const u = iu / nu; // 0..1
      const s = u * 2 - 1; // -1..+1
      const x = s * halfW;
      // 가로 C-커브: 중앙이 높고 양옆 가장자리가 살 속 손톱 주름으로 자연스럽게 파고듦
      const z = (1 - s * s) * archH + longArch;
      pos.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = nu + 1;
  for (let iv = 0; iv < nv; iv++) {
    for (let iu = 0; iu < nu; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      // +Y가 위, +X가 오른쪽일 때 (b - a)×(c - a) = (+X)×(+Y) = +Z(손톱 바깥 법선!)
      idx.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** 손가락 끝마디 등 쪽 정확한 표면에 곡면 손톱과 얇은 큐티클 테두리를 장착한다. */
function attachAnatomicalNail(
  THREE: typeof T,
  parent: T.Object3D,
  center: T.Vector3,
  tipDir: T.Vector3,
  dorsalNormal: T.Vector3,
  width: number,
  len: number,
  nailMat: T.Material,
  cuticleMat: T.Material,
): void {
  const Tdir = tipDir.clone().normalize();
  const Ndir = dorsalNormal.clone().addScaledVector(Tdir, -dorsalNormal.dot(Tdir)).normalize();
  const Bdir = new THREE.Vector3().crossVectors(Tdir, Ndir).normalize();
  // 오른손 좌표계 기저(Bdir, Tdir, Ndir): Bdir × Tdir = (T×N)×T = Ndir (det = +1)
  const basis = new THREE.Matrix4().makeBasis(Bdir, Tdir, Ndir);

  const grp = new THREE.Group();
  grp.position.copy(center);
  grp.quaternion.setFromRotationMatrix(basis);

  const bedGeo = makeCurvedNailGeo(THREE, width * 1.1, len * 1.08, width * 0.24);
  const bedMesh = new THREE.Mesh(bedGeo, cuticleMat);
  bedMesh.position.z = -0.003;

  const plateGeo = makeCurvedNailGeo(THREE, width, len, width * 0.27);
  const plateMesh = new THREE.Mesh(plateGeo, nailMat);
  plateMesh.position.y = len * 0.02;
  plateMesh.position.z = 0.003;

  grp.add(bedMesh, plateMesh);
  parent.add(grp);
}

/**
 * 편 오른손의 손목~손바닥~주먹 관절 아치까지 한 덩어리로 유기적 조형하는 로프팅 지오메트리.
 * - 로컬 +X: 엄지 쪽(요측), -X: 새끼손가락 쪽(척측)
 * - 로컬 +Y: 손가락 방향, -Y: 손목 방향
 * - 로컬 +Z: 밝은 손바닥(엄지두덩·새끼두덩·손바닥 오목부), -Z: 음영 손등(힘줄 4줄·주먹 관절 4개)
 */
function buildSculptedFlatPalmGeo(THREE: typeof T, pal: SkinPalette): T.BufferGeometry {
  const ny = 36;
  const nr = 52;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  // 네 손가락 밑동 X 좌표(검지 +0.285, 중지 +0.095, 약지 -0.10, 소지 -0.285)
  const knuckleXs = [0.285, 0.095, -0.10, -0.285];
  const webXs = [0.19, -0.002, -0.192];

  for (let iy = 0; iy < ny; iy++) {
    const v = iy / (ny - 1); // 0(손목 아래 -0.60) .. 1(주먹 관절 능선 +0.48)
    const baseY = mix(-0.6, 0.47, v);

    // 손목(좁은 타원) → 손바닥 허리 → 손바닥 상단 폭 비대칭 윤곽
    const palmBody = smoothstep(0.04, 0.34, v);
    const upperTaper = smoothstep(0.68, 1.0, v);
    const thumbBulge = Math.exp(-Math.pow((v - 0.44) / 0.22, 2)) * 0.085;
    const xMax = mix(0.245, 0.385, palmBody) + thumbBulge - upperTaper * 0.012;
    const ulnarCurve = Math.sin(clamp01((v - 0.15) / 0.85) * Math.PI) * 0.025;
    const xMin = mix(-0.235, -0.372, palmBody) - ulnarCurve + upperTaper * 0.008;

    const xMid = 0.5 * (xMax + xMin);
    const halfSpanX = 0.5 * (xMax - xMin);
    const baseZ = mix(0.145, 0.086, smoothstep(0.08, 0.92, v));

    for (let ir = 0; ir < nr; ir++) {
      const th = (ir / nr) * Math.PI * 2;
      const ct = Math.cos(th);
      const st = Math.sin(th); // >0 손바닥(+Z), <0 손등(-Z)

      const sgnC = ct >= 0 ? 1 : -1;
      const xNorm = sgnC * Math.pow(Math.abs(ct), 0.86);
      const x = xMid + halfSpanX * xNorm;

      const archOffset = 0.042 * Math.exp(-Math.pow((x - 0.08) / 0.28, 2)) - 0.055 * smoothstep(0.0, 0.36, -x);
      let webDip = 0;
      for (const wx of webXs) {
        webDip += 0.022 * Math.exp(-Math.pow((x - wx) / 0.048, 2));
      }
      const y = baseY + smoothstep(0.62, 1.0, v) * (archOffset - webDip);

      let z: number;
      let creaseAmt = 0;
      let flushAmt = 0;

      if (st >= 0) {
        // ━━ 손바닥(+Z) 해부학 지형 + 실제 3D 손금 홈(생명선·두뇌선·감정선) ━━
        const dome = Math.pow(st, 0.78);
        const thenar =
          0.078 *
          Math.exp(-Math.pow((x - 0.21) / 0.165, 2) - Math.pow((y - -0.14) / 0.24, 2));
        const hypothenar =
          0.046 *
          Math.exp(-Math.pow((x - -0.23) / 0.13, 2) - Math.pow((y - -0.08) / 0.28, 2));
        let digitalPads = 0;
        for (const kx of knuckleXs) {
          digitalPads +=
            0.024 *
            Math.exp(-Math.pow((x - kx) / 0.085, 2) - Math.pow((y - 0.34) / 0.11, 2));
        }
        const hollow =
          -0.028 *
          Math.exp(-Math.pow((x - 0.01) / 0.17, 2) - Math.pow((y - 0.06) / 0.19, 2));
        const wristCrease = -0.012 * Math.exp(-Math.pow((y - -0.44) / 0.04, 2));

        // 3D 해부학 손금(평면 데칼 잘림 없이 피부 곡면 자체에 새겨진다!)
        // 1) 감정선(위쪽 가로 곡선: x ∈ [-0.32, 0.16])
        const yHeart = 0.2 + 0.16 * (x + 0.32) + 0.06 * Math.pow(x + 0.32, 2);
        const gHeart =
          x > -0.33 && x < 0.18
            ? Math.exp(-Math.pow((y - yHeart) / 0.022, 2)) * smoothstep(-0.33, -0.25, x) * smoothstep(0.18, 0.08, x)
            : 0;
        // 2) 두뇌선(중간 사선: x ∈ [-0.24, 0.31])
        const yHead = 0.12 - 0.28 * (0.31 - x);
        const gHead =
          x > -0.24 && x < 0.32
            ? Math.exp(-Math.pow((y - yHead) / 0.022, 2)) * smoothstep(-0.24, -0.14, x) * smoothstep(0.32, 0.24, x)
            : 0;
        // 3) 생명선(엄지두덩 둘레 호: 중심 (0.33, -0.18) 반지름 0.27)
        const dLife = Math.hypot((x - 0.34) * 1.05, (y - -0.16) * 0.82);
        const gLife =
          x < 0.32 && y > -0.42 && y < 0.14
            ? Math.exp(-Math.pow((dLife - 0.255) / 0.022, 2)) * smoothstep(-0.42, -0.32, y) * smoothstep(0.14, 0.05, y)
            : 0;

        const groove = (gHeart + gHead + gLife) * 0.014;
        z = (baseZ + thenar + hypothenar + digitalPads + hollow + wristCrease - groove) * dome;
        creaseAmt = clamp01(((-hollow * 9 + -wristCrease * 16) + (gHeart + gHead + gLife) * 0.72) * st);
        flushAmt = clamp01((thenar * 5.2 + digitalPads * 8.5) * st);
      } else {
        // ━━ 손등(-Z) 해부학 지형 ━━
        const dome = Math.pow(-st, 0.8);
        const dorsalArch = 0.016 * Math.cos(clamp01(Math.abs(x) / 0.38) * (Math.PI * 0.5));
        let tendons = 0;
        let knuckles = 0;
        const tSpan = clamp01((y - -0.42) / 0.86);
        for (const kx of knuckleXs) {
          const txAtY = mix(0.0, kx, tSpan);
          tendons +=
            0.012 *
            smoothstep(0.08, 0.35, tSpan) *
            Math.exp(-Math.pow((x - txAtY) / 0.042, 2));
          const ky = 0.43 + (kx === 0.095 ? 0.03 : kx === -0.285 ? -0.045 : 0.0);
          knuckles +=
            0.032 *
            Math.exp(-Math.pow((x - kx) / 0.072, 2) - Math.pow((y - ky) / 0.075, 2));
        }
        const ulnarStyloid =
          0.022 *
          Math.exp(-Math.pow((x - -0.21) / 0.065, 2) - Math.pow((y - -0.48) / 0.07, 2));

        z = -(baseZ * 0.94 + dorsalArch + tendons + knuckles + ulnarStyloid) * dome;
        flushAmt = clamp01(knuckles * 12 * (-st));
        creaseAmt = clamp01((0.015 - tendons) * 14 * (-st));
      }

      positions.push(x, y, z);
      const [crR, crG, crB] = skinRgbLinear(pal, st, flushAmt, creaseAmt);
      colors.push(crR, crG, crB);
    }
  }

  for (let iy = 0; iy < ny - 1; iy++) {
    const b0 = iy * nr;
    const b1 = (iy + 1) * nr;
    for (let ir = 0; ir < nr; ir++) {
      const irN = (ir + 1) % nr;
      indices.push(b0 + ir, b1 + ir, b1 + irN, b0 + ir, b1 + irN, b0 + irN);
    }
  }

  // 상단 능선 캡(네 손가락 뿌리와 매끄럽게 겹쳐지도록 닫음)
  const topBase = (ny - 1) * nr;
  const topPole = positions.length / 3;
  positions.push(0.0, 0.45, 0.0);
  const [tpR, tpG, tpB] = skinRgbLinear(pal, 0.0, 0.15, 0);
  colors.push(tpR, tpG, tpB);
  for (let ir = 0; ir < nr; ir++) {
    indices.push(topBase + ir, topPole, topBase + ((ir + 1) % nr));
  }

  // 하단 손목 캡
  const botPole = positions.length / 3;
  positions.push(0.0, -0.61, 0.0);
  colors.push(tpR, tpG, tpB);
  for (let ir = 0; ir < nr; ir++) {
    indices.push(ir, (ir + 1) % nr, botPole);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** 손바닥(+Z) 중앙 청록 타깃 패드 + '손바닥' 텍스처(손금은 3D 메쉬 자체에 스컬프팅됨). */
function makePalmDecalTex(THREE: typeof T): T.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 256);

  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 112);
  g.addColorStop(0, "rgba(63, 214, 192, 0.82)");
  g.addColorStop(0.62, "rgba(63, 214, 192, 0.3)");
  g.addColorStop(1, "rgba(63, 214, 192, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(128, 128, 112, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(10, 132, 118, 0.95)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(128, 128, 76, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#053631";
  ctx.font = "900 44px Pretendard, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("손바닥", 128, 131);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 손등(-Z) 중앙 '손등' 소프트 타이포 텍스처(어두운 패치 박스 없이 손등 피부 위에 자연스럽게 표기). */
function makeDorsalDecalTex(THREE: typeof T): T.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 128);

  ctx.beginPath();
  ctx.roundRect(24, 22, 208, 84, 42);
  ctx.fillStyle = "rgba(74, 42, 26, 0.42)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 232, 214, 0.55)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#FFF1E6";
  ctx.font = "800 48px Pretendard, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("손등", 128, 66);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 3D 편 오른손 제어 핸들. */
export interface PalmHand3d {
  group: T.Group;
  fieldArrow: FatArrow3d;
  curArrow: FatArrow3d;
  forceArrow: FatArrow3d;
  palmGlow: T.Mesh;
  setFocus(mode: "none" | "field" | "cur" | "force" | "all", pulseT?: number): void;
  setForceReveal(t: number): void;
  setOpacity(alpha: number): void;
}

/**
 * 고품질 스컬프팅 해부학 3D 편 오른손 모델(손바닥 vs 손등 대비 및 손가락 관절·손톱 디테일 극대화).
 * - 로컬 +Y: 네 손가락(자기장 B)
 * - 로컬 +X: 엄지손가락(전류 I)
 * - 로컬 +Z: 밝은 손바닥 + 손금 + '손바닥' 패드 + 청록 힘 화살표(F = I × B)
 * - 로컬 -Z: 한 톤 짙은 손등 + 힘줄 융기 + 주먹 관절 + 곡면 광택 손톱 5개 + '손등' 표시
 */
export function buildPalmHand3d(THREE: typeof T): PalmHand3d {
  const group = new THREE.Group();
  const fadeMats: T.Material[] = [];

  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.48,
    metalness: 0.01,
    clearcoat: 0.12,
    clearcoatRoughness: 0.62,
    sheen: 0.28,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xffd6be),
  });
  fadeMats.push(skinMat);

  const nailTex = makeNailTex(THREE);
  const nailMat = new THREE.MeshPhysicalMaterial({
    map: nailTex,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.88,
    clearcoatRoughness: 0.14,
  });
  const cuticleMat = new THREE.MeshPhysicalMaterial({
    color: 0x9e6245,
    roughness: 0.58,
    metalness: 0.01,
  });
  const shirtRimMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf2ff, roughness: 0.38, clearcoat: 0.1 });
  const cuffMat = new THREE.MeshPhysicalMaterial({ color: 0x243d67, roughness: 0.52, metalness: 0.06, clearcoat: 0.12 });
  const cuffTrimMat = new THREE.MeshPhysicalMaterial({ color: 0x62a2f8, roughness: 0.3, metalness: 0.15 });
  fadeMats.push(nailMat, cuticleMat, shirtRimMat, cuffMat, cuffTrimMat);

  // ── 1. 일체형 로프팅 손바닥·손등·손목 본체 ──
  const palmGeo = buildSculptedFlatPalmGeo(THREE, PALM_HAND_PALETTE);
  const palmMesh = new THREE.Mesh(palmGeo, skinMat);
  group.add(palmMesh);

  // 엄지-검지 사이 자연스러운 물갈퀴(First dorsal interosseous web) 곡면 메쉬
  {
    const webRings: LoftRing[] = [];
    const nW = 9;
    for (let i = 0; i < nW; i++) {
      const u = i / (nW - 1);
      const cx = mix(0.24, 0.39, u);
      const cy = mix(-0.18, 0.16, u) - Math.sin(u * Math.PI) * 0.03;
      const cz = mix(0.015, 0.0, u);
      webRings.push({
        center: new THREE.Vector3(cx, cy, cz),
        tangent: new THREE.Vector3(0.42, 0.9, -0.04).normalize(),
        palmarNormal: new THREE.Vector3(0, 0, 1),
        rx: mix(0.11, 0.065, u),
        rzPalm: mix(0.088, 0.052, u),
        rzDorsal: mix(0.078, 0.048, u),
        flush: 0.12,
      });
    }
    group.add(new THREE.Mesh(buildLoftedFingerGeo(THREE, webRings, PALM_HAND_PALETTE, 18, true, true), skinMat));
  }

  // 실험실 셔츠 이너 칼라 + 네이비 소매 커프(-Y)
  const shirtRim = new THREE.Mesh(new THREE.CylinderGeometry(0.268, 0.276, 0.075, 28), shirtRimMat);
  shirtRim.scale.set(1.08, 1, 0.66);
  shirtRim.position.set(0.005, -0.61, 0.0);
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.292, 0.325, 0.25, 28), cuffMat);
  cuff.scale.set(1.12, 1, 0.69);
  cuff.position.set(0.005, -0.75, 0.0);
  const cuffTrim = new THREE.Mesh(new THREE.TorusGeometry(0.292, 0.022, 12, 32), cuffTrimMat);
  cuffTrim.rotation.x = Math.PI / 2;
  cuffTrim.scale.set(1.12, 0.69, 1);
  cuffTrim.position.set(0.005, -0.635, 0.0);
  group.add(shirtRim, cuff, cuffTrim);

  // 손바닥(+Z) 중앙 청록 패드 + '손바닥' 패치(손바닥 오목부 위에 선명히 안착)
  const palmDecalMat = new THREE.MeshBasicMaterial({
    map: makePalmDecalTex(THREE),
    transparent: true,
    depthWrite: false,
  });
  const palmDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), palmDecalMat);
  palmDecal.position.set(-0.02, 0.04, 0.146);
  group.add(palmDecal);

  // 손등(-Z) 볼록 아치 모양을 그대로 따라가는 곡면 '손등' 패치(절대 피부에 파묻히지 않는다!)
  const dorsalDecalMat = new THREE.MeshBasicMaterial({
    map: makeDorsalDecalTex(THREE),
    transparent: true,
    depthWrite: false,
  });
  const dorsalPatchGeo = new THREE.PlaneGeometry(0.32, 0.16);
  const dorsalDecal = new THREE.Mesh(dorsalPatchGeo, dorsalDecalMat);
  dorsalDecal.position.set(0.0, 0.02, -0.162);
  dorsalDecal.rotation.y = Math.PI;
  group.add(dorsalDecal);

  // 손바닥 발광 오라 링(+Z)
  const palmGlowMat = new THREE.MeshBasicMaterial({
    color: 0x3fd6c0,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const palmGlow = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.23, 40), palmGlowMat);
  palmGlow.position.set(-0.02, 0.04, 0.152);
  group.add(palmGlow);

  // ── 2. 연속 로프팅 네 손가락(+Y: 검지 +X → 소지 -X, 마디 주름·지문 살집·곡면 손톱 완벽 구현) ──
  const fingerSpecs = [
    { x: 0.285, baseY: 0.42, len: 0.9, r: 0.088, fan: -0.028, bendZ: 0.018 }, // 검지
    { x: 0.095, baseY: 0.45, len: 1.0, r: 0.092, fan: -0.004, bendZ: 0.015 }, // 중지
    { x: -0.10, baseY: 0.43, len: 0.92, r: 0.087, fan: 0.02, bendZ: 0.02 }, // 약지
    { x: -0.285, baseY: 0.36, len: 0.74, r: 0.076, fan: 0.052, bendZ: 0.026 }, // 소지
  ];

  for (const fg of fingerSpecs) {
    const rings: LoftRing[] = [];
    const nSeg = 20;
    const dir = new THREE.Vector3(-Math.sin(fg.fan), Math.cos(fg.fan), 0).normalize();
    const pNorm = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i < nSeg; i++) {
      const u = i / (nSeg - 1); // 0(뿌리) .. 1(손끝)
      const dist = u * fg.len;
      // 손가락 특유의 아주 미세한 자연 곡률(뻣뻣한 막대기 느낌 제거)
      const zArc = Math.sin(u * Math.PI) * fg.bendZ;
      const center = new THREE.Vector3(fg.x + dir.x * dist, fg.baseY + dir.y * dist, zArc);

      // PIP(u≈0.44), DIP(u≈0.73) 관절 마디 폭 변화 및 관절 주름
      const pipBell = Math.exp(-Math.pow((u - 0.44) / 0.065, 2));
      const dipBell = Math.exp(-Math.pow((u - 0.73) / 0.055, 2));
      const webFlare = Math.exp(-Math.pow(u / 0.12, 2)) * 0.14;
      const tipTaper = u > 0.78 ? Math.sqrt(Math.max(0.14, 1 - Math.pow((u - 0.78) / 0.225, 2) * 0.86)) : 1;

      const baseScale = mix(1.04, 0.78, u) * tipTaper;
      const rx = fg.r * (baseScale + webFlare + 0.055 * pipBell + 0.035 * dipBell);

      // 손바닥 패드: 마디 사이 배(belly)는 볼록하고 관절선(PIP·DIP·기저)은 살짝 잘록
      const padBelly =
        0.08 * Math.sin(clamp01(u / 0.44) * Math.PI) +
        0.06 * Math.sin(clamp01((u - 0.44) / 0.29) * Math.PI) +
        0.09 * Math.sin(clamp01((u - 0.73) / 0.24) * Math.PI);
      const jointIndent = 0.09 * pipBell + 0.07 * dipBell;
      const rzPalm = fg.r * (0.86 * baseScale + padBelly - jointIndent);
      const rzDorsal = fg.r * (0.78 * baseScale + 0.03 * pipBell + 0.02 * dipBell);

      // 등 쪽 PIP·DIP 관절 잔주름 2겹
      const pipFold = Math.abs(Math.sin((u - 0.44) * 95)) * pipBell * fg.r * 0.06;
      const dipFold = dipBell * fg.r * 0.04;

      rings.push({
        center,
        tangent: dir,
        palmarNormal: pNorm,
        rx,
        rzPalm: Math.max(0.014, rzPalm),
        rzDorsal: Math.max(0.014, rzDorsal),
        crease: clamp01(pipBell * 0.85 + dipBell * 0.7),
        flush: clamp01(smoothstep(0.74, 1.0, u) * 0.7 + pipBell * 0.35 + dipBell * 0.25),
        dorsalFold: pipFold + dipFold,
      });
    }

    const fgGeo = buildLoftedFingerGeo(THREE, rings, PALM_HAND_PALETTE, 24, false, true);
    group.add(new THREE.Mesh(fgGeo, skinMat));

    // 끝마디 등 쪽(-Z)에 밀착된 곡면 광택 손톱(손끝 살집 안쪽 u = 0.855 위치에 안착)
    const uNail = 0.848;
    const dNail = uNail * fg.len;
    const zNailSurface = Math.sin(uNail * Math.PI) * fg.bendZ - fg.r * 0.5;
    const nailPos = new THREE.Vector3(fg.x + dir.x * dNail, fg.baseY + dir.y * dNail, zNailSurface);
    attachAnatomicalNail(
      THREE,
      group,
      nailPos,
      dir,
      new THREE.Vector3(0, 0.06, -1).normalize(),
      fg.r * 1.18,
      fg.r * 1.62,
      nailMat,
      cuticleMat,
    );
  }

  // ── 3. 연속 로프팅 오른손 엄지손가락(+X 방향, 엄지두덩에서 매끄럽게 솟아오름) ──
  {
    const thCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, -0.22, 0.035), // 제1중수골 기저(엄지두덩 내부)
      new THREE.Vector3(0.43, -0.13, 0.022), // MCP 관절
      new THREE.Vector3(0.68, -0.095, 0.012), // 근위지골
      new THREE.Vector3(0.84, -0.088, 0.008), // IP 관절
      new THREE.Vector3(1.03, -0.082, 0.006), // 엄지 끝
    ]);
    const thRings: LoftRing[] = [];
    const nT = 18;
    const rTh = 0.104;
    for (let i = 0; i < nT; i++) {
      const u = i / (nT - 1);
      const pt = thCurve.getPoint(u);
      const tan = thCurve.getTangent(u).normalize();
      // 엄지는 일반 손가락보다 지문 면이 살짝 손바닥·비스듬히 앞(+Z, 살짝 -Y)을 향한다
      const pNorm = new THREE.Vector3(0, -0.18, 0.98).normalize();
      const ipBell = Math.exp(-Math.pow((u - 0.64) / 0.08, 2));
      const mcpBell = Math.exp(-Math.pow((u - 0.3) / 0.09, 2));
      const tipTaper = u > 0.76 ? Math.sqrt(Math.max(0.16, 1 - Math.pow((u - 0.76) / 0.245, 2) * 0.84)) : 1;
      const baseScale = mix(1.22, 0.84, u) * tipTaper;

      thRings.push({
        center: pt,
        tangent: tan,
        palmarNormal: pNorm,
        rx: rTh * (baseScale + 0.06 * ipBell + 0.05 * mcpBell),
        rzPalm: Math.max(0.016, rTh * (0.86 * baseScale + 0.07 * Math.sin(clamp01((u - 0.6) / 0.36) * Math.PI) - 0.06 * ipBell)),
        rzDorsal: Math.max(0.016, rTh * (0.78 * baseScale + 0.03 * ipBell)),
        crease: clamp01(ipBell * 0.8 + mcpBell * 0.45),
        flush: clamp01(smoothstep(0.72, 1.0, u) * 0.7 + ipBell * 0.3),
        dorsalFold: ipBell * rTh * 0.05,
      });
    }
    group.add(new THREE.Mesh(buildLoftedFingerGeo(THREE, thRings, PALM_HAND_PALETTE, 24, true, true), skinMat));

    const uTNail = 0.83;
    const tPt = thCurve.getPoint(uTNail);
    const tTan = thCurve.getTangent(uTNail).normalize();
    const tDorsal = new THREE.Vector3(0, 0.18, -0.98).normalize();
    attachAnatomicalNail(
      THREE,
      group,
      tPt.clone().addScaledVector(tDorsal, rTh * 0.5),
      tTan,
      tDorsal,
      rTh * 1.24,
      rTh * 1.48,
      nailMat,
      cuticleMat,
    );
  }

  // ── 4. 손에 부착된 3색 정밀 벡터 화살표 ──
  const fieldArrow = makeFatArrow3d(THREE, {
    color: 0xff6e5e,
    body: 0.044,
    head: 0.112,
    headLen: 0.24,
    outline: 0x4a120e,
    opacity: 0.96,
  });
  fieldArrow.set(new THREE.Vector3(0.08, 0.74, 0.18), new THREE.Vector3(0, 1, 0), 1.06);
  group.add(fieldArrow.g);

  const curArrow = makeFatArrow3d(THREE, {
    color: 0xffd400,
    body: 0.046,
    head: 0.116,
    headLen: 0.24,
    outline: 0x6e3f16,
    opacity: 0.98,
  });
  curArrow.set(new THREE.Vector3(0.58, -0.09, 0.17), new THREE.Vector3(1, 0, 0), 0.98);
  group.add(curArrow.g);

  const forceArrow = makeFatArrow3d(THREE, {
    color: 0x3fd6c0,
    body: 0.064,
    head: 0.16,
    headLen: 0.3,
    outline: 0x0b2a33,
    opacity: 1,
    onTop: true,
  });
  forceArrow.set(new THREE.Vector3(-0.02, 0.04, 0.18), new THREE.Vector3(0, 0, 1), 1.02);
  forceArrow.g.visible = false;
  group.add(forceArrow.g);

  const setOpacity = (alpha: number): void => {
    const isTrans = alpha < 0.98;
    fadeMats.forEach((m) => {
      m.transparent = isTrans;
      m.opacity = alpha;
    });
    palmDecalMat.opacity = alpha;
    dorsalDecalMat.opacity = alpha;
  };

  const setFocus = (mode: "none" | "field" | "cur" | "force" | "all", pulseT = 0): void => {
    const pulse = 0.5 + 0.5 * Math.sin(pulseT * 5.2);
    fieldArrow.g.visible = mode === "field" || mode === "cur" || mode === "force" || mode === "all";
    curArrow.g.visible = mode === "cur" || mode === "force" || mode === "all";
    fieldArrow.setOpacity(mode === "field" ? 0.85 + 0.15 * pulse : mode === "all" ? 0.96 : 0.48);
    curArrow.setOpacity(mode === "cur" ? 0.85 + 0.15 * pulse : mode === "all" ? 0.96 : 0.48);
    palmGlowMat.opacity = mode === "force" ? 0.48 + 0.42 * pulse : mode === "all" ? 0.58 : 0.24;
    const sc = mode === "force" ? 1 + 0.14 * pulse : 1;
    palmGlow.scale.set(sc, sc, 1);
  };

  const setForceReveal = (t: number): void => {
    const clamped = Math.max(0, Math.min(1, t));
    forceArrow.g.visible = clamped > 0.02;
    if (clamped > 0.02) {
      const len = 0.3 + clamped * 0.92;
      forceArrow.set(new THREE.Vector3(-0.02, 0.04, 0.18), new THREE.Vector3(0, 0, 1), len);
      forceArrow.setOpacity(Math.min(1, clamped * 1.4));
    }
  };

  return { group, fieldArrow, curArrow, forceArrow, palmGlow, setFocus, setForceReveal, setOpacity };
}

/**
 * 편 오른손의 목표 회전 사원수 계산.
 * 로컬 +X → iVec(엄지, 전류), 로컬 +Y → bVec(네 손가락, 자기장), 로컬 +Z → iVec × bVec(손바닥, 힘).
 */
export function targetQuatForPalm(THREE: typeof T, iVec: T.Vector3, bVec: T.Vector3): T.Quaternion {
  const I = iVec.clone().normalize();
  const B = bVec.clone().normalize();
  const F = new THREE.Vector3().crossVectors(I, B).normalize();
  const Bortho = new THREE.Vector3().crossVectors(F, I).normalize();
  const m = new THREE.Matrix4().makeBasis(I, Bortho, F);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/** 3D 코일 감아 쥔 오른손 제어 핸들. */
export interface GripHand3d {
  group: T.Group;
  thumbArrow: FatArrow3d;
  fingerArrows: T.Group;
  /**
   * 전완 회내·회외 각도(0: 앞쪽 전류 아래 / 엄지 오른쪽, π: 앞쪽 전류 위 / 엄지 왼쪽).
   * 손목 축(Y)을 중심으로 실제 사람 팔목처럼 자연스럽게 회전한다.
   */
  setPose(rot: number): void;
  setFocus(mode: "fingers" | "thumb" | "both", pulseT?: number): void;
  setOpacity(alpha: number): void;
}

/**
 * 코일을 감아 쥔 오른손의 손목 ~ 손바닥/손등 ~ 주먹 관절(MCP) 기저까지 한 덩어리로 조형하는 로프팅 지오메트리.
 * 기준 자세(rot = 0, 앞쪽 전류 아래 · 엄지 오른쪽, 사진 grip.webp와 동일한 해부학 구도):
 * - 로컬 +X: 엄지 쪽(요측), -X: 새끼손가락 쪽(척측)
 * - 로컬 +Y: 위쪽(손목 -0.78 → MCP 기저 -0.05)
 * - 로컬 +Z: 손바닥 면(엄지두덩·새끼두덩·손금), -Z: 손등 면(힘줄 4줄·MCP 주먹 관절·척골 경상돌기)
 */
function buildSculptedGripPalmGeo(THREE: typeof T, pal: SkinPalette): T.BufferGeometry {
  const ny = 32;
  const nr = 48;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const knuckleXs = [0.325, 0.108, -0.112, -0.325];
  const webXs = [0.216, -0.002, -0.218];

  for (let iy = 0; iy < ny; iy++) {
    const v = iy / (ny - 1); // 0(손목 하단 -0.78) .. 1(MCP 관절선 -0.05)
    const baseY = mix(-0.78, -0.05, v);
    const baseZ = mix(-0.06, -0.265, smoothstep(0.1, 0.96, v));

    const palmExpand = smoothstep(0.08, 0.5, v);
    const thumbFlare = Math.exp(-Math.pow((v - 0.54) / 0.24, 2)) * 0.058;
    const xMax = mix(0.238, 0.372, palmExpand) + thumbFlare;
    const ulnarFlare = Math.sin(clamp01((v - 0.18) / 0.82) * Math.PI) * 0.022;
    const xMin = mix(-0.228, -0.358, palmExpand) - ulnarFlare;

    const xMid = 0.5 * (xMax + xMin);
    const halfSpanX = 0.5 * (xMax - xMin);
    const halfThick = mix(0.148, 0.095, smoothstep(0.08, 0.94, v));

    for (let ir = 0; ir < nr; ir++) {
      const th = (ir / nr) * Math.PI * 2;
      const ct = Math.cos(th);
      const st = Math.sin(th); // >0 손바닥(+Z), <0 손등(-Z)

      const sgnC = ct >= 0 ? 1 : -1;
      const xNorm = sgnC * Math.pow(Math.abs(ct), 0.86);
      const x = xMid + halfSpanX * xNorm;

      const archY = 0.03 * Math.exp(-Math.pow((x - 0.08) / 0.28, 2)) - 0.04 * smoothstep(0.0, 0.35, -x);
      let webDip = 0;
      for (const wx of webXs) {
        webDip += 0.018 * Math.exp(-Math.pow((x - wx) / 0.046, 2));
      }
      const y = baseY + smoothstep(0.65, 1.0, v) * (archY - webDip);

      let zOff: number;
      let creaseAmt = 0;
      let flushAmt = 0;

      if (st >= 0) {
        // ── 손바닥(+Z) 해부학 지형: 엄지두덩·새끼두덩·손금 음각 ──
        const dome = Math.pow(st, 0.8);
        const thenar =
          0.072 *
          Math.exp(-Math.pow((x - 0.205) / 0.16, 2) - Math.pow((y - -0.38) / 0.19, 2));
        const hypothenar =
          0.042 *
          Math.exp(-Math.pow((x - -0.22) / 0.13, 2) - Math.pow((y - -0.36) / 0.21, 2));
        const hollow =
          -0.022 *
          Math.exp(-Math.pow((x - 0.01) / 0.16, 2) - Math.pow((y - -0.24) / 0.14, 2));
        const wristCrease = -0.01 * Math.exp(-Math.pow((y - -0.64) / 0.035, 2));

        // 생명선 & 감정선 음각
        const dLife = Math.hypot((x - 0.33) * 1.05, (y - -0.4) * 0.9);
        const gLife =
          x < 0.31 && y > -0.62 && y < -0.14
            ? Math.exp(-Math.pow((dLife - 0.24) / 0.02, 2)) * smoothstep(-0.62, -0.52, y) * smoothstep(-0.14, -0.22, y)
            : 0;
        const yHeart = -0.19 + 0.12 * (x + 0.3);
        const gHeart =
          x > -0.31 && x < 0.16
            ? Math.exp(-Math.pow((y - yHeart) / 0.02, 2)) * smoothstep(-0.31, -0.22, x) * smoothstep(0.16, 0.06, x)
            : 0;

        const groove = (gLife + gHeart) * 0.012;
        zOff = (halfThick + thenar + hypothenar + hollow + wristCrease - groove) * dome;
        creaseAmt = clamp01(((-hollow * 9 + -wristCrease * 15) + (gLife + gHeart) * 0.68) * st);
        flushAmt = clamp01(thenar * 4.8 * st);
      } else {
        // ── 손등(-Z) 해부학 지형: 신근 힘줄 4줄·MCP 주먹 관절 4개·척골 경상돌기 ──
        const dome = Math.pow(-st, 0.8);
        const dorsalArch = 0.015 * Math.cos(clamp01(Math.abs(x) / 0.37) * (Math.PI * 0.5));
        let tendons = 0;
        let knuckles = 0;
        const tSpan = clamp01((y - -0.64) / 0.58);
        for (const kx of knuckleXs) {
          const txAtY = mix(0.0, kx, tSpan);
          tendons +=
            0.011 *
            smoothstep(0.08, 0.36, tSpan) *
            Math.exp(-Math.pow((x - txAtY) / 0.04, 2));
          const ky = -0.09 + (kx === 0.108 ? 0.022 : kx === -0.325 ? -0.032 : 0.0);
          knuckles +=
            0.03 *
            Math.exp(-Math.pow((x - kx) / 0.068, 2) - Math.pow((y - ky) / 0.065, 2));
        }
        const ulnarStyloid =
          0.02 *
          Math.exp(-Math.pow((x - -0.205) / 0.06, 2) - Math.pow((y - -0.67) / 0.06, 2));

        zOff = -(halfThick * 0.94 + dorsalArch + tendons + knuckles + ulnarStyloid) * dome;
        flushAmt = clamp01(knuckles * 11 * (-st));
        creaseAmt = clamp01((0.014 - tendons) * 13 * (-st));
      }

      positions.push(x, y, baseZ + zOff);
      const [crR, crG, crB] = skinRgbLinear(pal, st, flushAmt, creaseAmt);
      colors.push(crR, crG, crB);
    }
  }

  for (let iy = 0; iy < ny - 1; iy++) {
    const b0 = iy * nr;
    const b1 = (iy + 1) * nr;
    for (let ir = 0; ir < nr; ir++) {
      const irN = (ir + 1) % nr;
      indices.push(b0 + ir, b1 + ir, b1 + irN, b0 + ir, b1 + irN, b0 + irN);
    }
  }

  const topBase = (ny - 1) * nr;
  const topPole = positions.length / 3;
  positions.push(0.0, -0.06, -0.265);
  const [tpR, tpG, tpB] = skinRgbLinear(pal, 0.0, 0.15, 0);
  colors.push(tpR, tpG, tpB);
  for (let ir = 0; ir < nr; ir++) {
    indices.push(topBase + ir, topPole, topBase + ((ir + 1) % nr));
  }

  const botPole = positions.length / 3;
  positions.push(0.0, -0.79, -0.06);
  colors.push(tpR, tpG, tpB);
  for (let ir = 0; ir < nr; ir++) {
    indices.push(ir, (ir + 1) % nr, botPole);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 고품질 유기적 스컬프팅 해부학 3D 감아 쥔 오른손(실제 사람 팔목의 회내·회외 Y축 회전 기반).
 * 코일과 분리된 전용 공간에 독립 배치해 손의 형태와 손가락 감는 방향이 한눈에 읽히게 한다.
 * - rot = 0 (dir = +1, 앞쪽 전류 아래 · 오른쪽 N극 — 개념 사진 grip.webp와 동일한 해부학 구도):
 *   · 아래쪽에 밝은 손바닥이 보이고, 네 손가락이 코일 뒤(-Z)에서 위(+Y)를 넘어 앞쪽(+Z)으로 내려오며 곡면 손톱 4개가 아래를 향한다.
 *   · 엄지는 오른쪽(+X)을 가리키며, 앞쪽(+Z)에는 도톰한 엄지 지문 살집이, 뒤쪽(-Z)에는 엄지손톱이 자연스럽게 놓인다.
 * - rot = Math.PI (dir = -1, 앞쪽 전류 위 · 왼쪽 N극):
 *   · 전완(Y축)이 실제 사람 손목처럼 180° 회내(pronation)하여 손등과 네 손가락이 앞쪽(+Z)에서 위(+Y)로 힘차게 감아 올라간다.
 *   · 엄지는 왼쪽(-X)을 가리키며, 등 쪽의 엄지손톱이 앞-위(+Z, +Y)를 자연스럽게 향해 어느 각도에서도 해부학적으로 정확하다!
 */
export function buildGripHand3d(THREE: typeof T): GripHand3d {
  const group = new THREE.Group();
  const handCore = new THREE.Group();
  group.add(handCore);

  const fadeMats: T.Material[] = [];
  const skinMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.46,
    metalness: 0.01,
    clearcoat: 0.12,
    clearcoatRoughness: 0.58,
    sheen: 0.26,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color(0xffd6be),
  });
  const nailTex = makeNailTex(THREE);
  const nailMat = new THREE.MeshPhysicalMaterial({
    map: nailTex,
    roughness: 0.18,
    metalness: 0.02,
    clearcoat: 0.88,
    clearcoatRoughness: 0.14,
  });
  const cuticleMat = new THREE.MeshPhysicalMaterial({ color: 0x9b6043, roughness: 0.56, metalness: 0.01 });
  const shirtRimMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf2ff, roughness: 0.38, clearcoat: 0.1 });
  const cuffMat = new THREE.MeshPhysicalMaterial({ color: 0x243d67, roughness: 0.52, metalness: 0.06, clearcoat: 0.12 });
  const cuffTrimMat = new THREE.MeshPhysicalMaterial({ color: 0x62a2f8, roughness: 0.3, metalness: 0.15 });
  fadeMats.push(skinMat, nailMat, cuticleMat, shirtRimMat, cuffMat, cuffTrimMat);

  // ── 0. 네 손가락 안에 쥐어진 반투명 아크릴 안내 원통(중심 y = +0.11, 코일 축 대응 표시) ──
  const cylY = 0.11;
  const cylR = 0.235;
  const guideRod = new THREE.Mesh(
    new THREE.CylinderGeometry(cylR, cylR, 1.36, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x67a4e8,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 0.4,
      transparent: true,
      opacity: 0.28,
    }),
  );
  guideRod.rotation.z = Math.PI / 2;
  guideRod.position.y = cylY;
  handCore.add(guideRod);

  const etchMat = new THREE.MeshStandardMaterial({
    color: 0xe6a663,
    metalness: 0.55,
    roughness: 0.35,
    transparent: true,
    opacity: 0.36,
  });
  for (const ex of [-0.46, -0.23, 0, 0.23, 0.46]) {
    const tr = new THREE.Mesh(new THREE.TorusGeometry(cylR + 0.002, 0.011, 8, 28), etchMat);
    tr.rotation.y = Math.PI / 2;
    tr.position.set(ex, cylY, 0);
    handCore.add(tr);
  }
  for (const gx of [-0.68, 0.68]) {
    const capRing = new THREE.Mesh(
      new THREE.TorusGeometry(cylR, 0.02, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x9ecbff, metalness: 0.48, roughness: 0.28 }),
    );
    capRing.rotation.y = Math.PI / 2;
    capRing.position.set(gx, cylY, 0);
    handCore.add(capRing);
  }

  // ── 1. 손목 ~ 손바닥(+Z)/손등(-Z) ~ MCP 관절선 일체형 스컬프팅 본체 + 소매 ──
  handCore.add(new THREE.Mesh(buildSculptedGripPalmGeo(THREE, GRIP_HAND_PALETTE), skinMat));

  // 엄지-검지 사이 물갈퀴 근육(First dorsal interosseous web)
  {
    const thWebCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, -0.38, -0.11),
      new THREE.Vector3(0.35, -0.21, -0.13),
      new THREE.Vector3(0.34, -0.08, -0.23),
    ]);
    const mRings: LoftRing[] = [];
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const pt = thWebCurve.getPoint(u);
      const tan = thWebCurve.getTangent(u).normalize();
      const inNorm = new THREE.Vector3(-0.12, 0.1, 0.98).normalize();
      const r = mix(0.158, 0.116, u);
      mRings.push({
        center: pt,
        tangent: tan,
        palmarNormal: inNorm,
        rx: r * 1.22,
        rzPalm: r * 0.92,
        rzDorsal: r * 0.88,
        flush: 0.16,
      });
    }
    handCore.add(new THREE.Mesh(buildLoftedFingerGeo(THREE, mRings, GRIP_HAND_PALETTE, 20, true, true), skinMat));
  }

  // 손목 하단에 자연스럽게 이어진 셔츠 칼라 + 네이비 실험복 소매(Y축 회내·회외 시 손목과 일체로 회전!)
  {
    const sRim = new THREE.Mesh(new THREE.CylinderGeometry(0.258, 0.268, 0.08, 28), shirtRimMat);
    sRim.position.set(0.005, -0.78, -0.06);
    sRim.scale.set(1.1, 1, 0.72);

    const cuffM = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.32, 0.25, 28), cuffMat);
    cuffM.position.set(0.005, -0.92, -0.06);
    cuffM.scale.set(1.12, 1, 0.74);

    const trimM = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.022, 12, 32), cuffTrimMat);
    trimM.rotation.x = Math.PI / 2;
    trimM.position.set(0.005, -0.805, -0.06);
    trimM.scale.set(1.12, 0.74, 1);

    handCore.add(sRim, cuffM, trimM);
  }

  // ── 2. 연속 로프팅된 4개의 감아 쥔 손가락(MCP 뒤-아래 → 뒤쪽 상승 → 위쪽 아치 → 앞쪽 하강 + 곡면 손톱 4개) ──
  const gripFingers = [
    { x: 0.325, r: 0.095, reach: 1.0, fan: -0.02 }, // 검지
    { x: 0.108, r: 0.1, reach: 1.05, fan: 0.0 }, // 중지(가장 김)
    { x: -0.112, r: 0.094, reach: 1.0, fan: 0.02 }, // 약지
    { x: -0.325, r: 0.083, reach: 0.88, fan: 0.045 }, // 소지
  ];

  for (const fs of gripFingers) {
    const sy = fs.reach;
    const fCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(fs.x, -0.09, -0.265), // MCP 주먹 관절(원통 뒤-아래, 손바닥/손등 상단과 일체 연결)
      new THREE.Vector3(fs.x + fs.fan * 0.08, 0.15 * sy, -0.335), // 근위지골(rot=0에선 뒤쪽 상승, rot=π에선 앞쪽 상승!)
      new THREE.Vector3(fs.x + fs.fan * 0.15, 0.39 * sy, -0.205), // PIP 관절
      new THREE.Vector3(fs.x + fs.fan * 0.22, 0.455 * sy, 0.075), // 중위지골 상단 아치(원통 위를 감아 넘음)
      new THREE.Vector3(fs.x + fs.fan * 0.28, 0.235 * sy, 0.325), // DIP 관절(rot=0에서 앞쪽 하강)
      new THREE.Vector3(fs.x + fs.fan * 0.32, -0.085 * sy, 0.295), // 손가락 끝(rot=0에서 앞쪽 아래를 가리킴)
    ]);

    const fRings: LoftRing[] = [];
    const nF = 28;
    for (let i = 0; i < nF; i++) {
      const u = i / (nF - 1);
      const pt = fCurve.getPoint(u);
      const tan = fCurve.getTangent(u).normalize();
      // 원통 중심 (x, cylY, 0)을 향하는 안쪽 방향이 손바닥 패드 법선!
      const toAxis = new THREE.Vector3(0, cylY - pt.y, -pt.z);
      toAxis.addScaledVector(tan, -toAxis.dot(tan)).normalize();

      const mcpBell = Math.exp(-Math.pow((u - 0.06) / 0.08, 2));
      const pipBell = Math.exp(-Math.pow((u - 0.42) / 0.065, 2));
      const dipBell = Math.exp(-Math.pow((u - 0.76) / 0.055, 2));
      const tipTaper = u > 0.8 ? Math.sqrt(Math.max(0.15, 1 - Math.pow((u - 0.8) / 0.205, 2) * 0.85)) : 1;
      const baseScale = mix(1.05, 0.76, u) * tipTaper;

      const rx = fs.r * (baseScale + 0.075 * mcpBell + 0.055 * pipBell + 0.035 * dipBell);
      const rzPalm = fs.r * (0.84 * baseScale + 0.05 * Math.sin(u * Math.PI * 3) - 0.07 * pipBell - 0.05 * dipBell);
      const rzDorsal = fs.r * (0.8 * baseScale + 0.06 * mcpBell + 0.045 * pipBell + 0.025 * dipBell);
      const fold = (Math.abs(Math.sin((u - 0.42) * 90)) * pipBell + dipBell * 0.7) * fs.r * 0.055;

      fRings.push({
        center: pt,
        tangent: tan,
        palmarNormal: toAxis,
        rx,
        rzPalm: Math.max(0.014, rzPalm),
        rzDorsal: Math.max(0.014, rzDorsal),
        crease: clamp01(pipBell * 0.85 + dipBell * 0.7),
        flush: clamp01(smoothstep(0.76, 1.0, u) * 0.68 + mcpBell * 0.35 + pipBell * 0.35),
        dorsalFold: fold,
      });
    }
    handCore.add(new THREE.Mesh(buildLoftedFingerGeo(THREE, fRings, GRIP_HAND_PALETTE, 24, true, true), skinMat));

    // 끝마디 바깥쪽 곡면 광택 손톱(가장자리가 손끝 살집에 밀착되어 측면 실루엣에서도 들뜸 0)
    const uNail = 0.865;
    const nPt = fCurve.getPoint(uNail);
    const nTan = fCurve.getTangent(uNail).normalize();
    const outNorm = new THREE.Vector3(0, nPt.y - cylY, nPt.z);
    outNorm.addScaledVector(nTan, -outNorm.dot(nTan)).normalize();
    attachAnatomicalNail(
      THREE,
      handCore,
      nPt.clone().addScaledVector(outNorm, fs.r * 0.46),
      nTan,
      outNorm,
      fs.r * 1.15,
      fs.r * 1.48,
      nailMat,
      cuticleMat,
    );
  }

  // ── 3. 해부학적으로 정확한 오른손 엄지 + 엄지손톱 ──
  // rot = 0(손바닥이 앞 +Z, 엄지 오른쪽 +X): 앞쪽(+Z)엔 도톰한 엄지 지문 살집, 뒤쪽(-Z)엔 엄지손톱이 위치(사진 grip.webp 동일).
  // rot = π(손등이 앞 +Z, 엄지 왼쪽 -X): Y축 180° 회내로 엄지손톱이 자연스럽게 앞-위(+Z, +Y)를 향한다!
  {
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, -0.37, -0.1), // 제1중수골 기저(엄지두덩 내부)
      new THREE.Vector3(0.47, -0.2, -0.06), // MCP 관절
      new THREE.Vector3(0.75, -0.1, -0.03), // 근위지골
      new THREE.Vector3(0.97, -0.055, -0.015), // IP 관절
      new THREE.Vector3(1.19, -0.03, -0.005), // 엄지 끝
    ]);
    const tRings: LoftRing[] = [];
    const nT = 18;
    const rTh = 0.108;
    // rot = 0에서 지문 패드는 앞(+Z, 살짝 -Y/안쪽), 등 쪽(손톱)은 뒤(-Z, 살짝 +Y)
    const pNorm = new THREE.Vector3(-0.04, -0.22, 0.974).normalize();
    for (let i = 0; i < nT; i++) {
      const u = i / (nT - 1);
      const pt = tCurve.getPoint(u);
      const tan = tCurve.getTangent(u).normalize();
      const mcpBell = Math.exp(-Math.pow((u - 0.28) / 0.09, 2));
      const ipBell = Math.exp(-Math.pow((u - 0.64) / 0.08, 2));
      const tipTaper = u > 0.76 ? Math.sqrt(Math.max(0.16, 1 - Math.pow((u - 0.76) / 0.245, 2) * 0.84)) : 1;
      const baseScale = mix(1.18, 0.84, u) * tipTaper;
      const padBelly = 0.065 * Math.sin(clamp01((u - 0.62) / 0.35) * Math.PI);

      tRings.push({
        center: pt,
        tangent: tan,
        palmarNormal: pNorm,
        rx: rTh * (baseScale + 0.05 * mcpBell + 0.06 * ipBell),
        rzPalm: Math.max(0.016, rTh * (0.86 * baseScale + padBelly - 0.055 * ipBell)),
        rzDorsal: Math.max(0.016, rTh * (0.79 * baseScale + 0.035 * ipBell)),
        crease: clamp01(ipBell * 0.78 + mcpBell * 0.4),
        flush: clamp01(smoothstep(0.72, 1.0, u) * 0.7 + ipBell * 0.3),
        dorsalFold: ipBell * rTh * 0.05,
      });
    }
    handCore.add(new THREE.Mesh(buildLoftedFingerGeo(THREE, tRings, GRIP_HAND_PALETTE, 24, true, true), skinMat));

    const uTNail = 0.825;
    const tPt = tCurve.getPoint(uTNail);
    const tTan = tCurve.getTangent(uTNail).normalize();
    const tDorsal = new THREE.Vector3(0.04, 0.22, -0.974).normalize();
    attachAnatomicalNail(
      THREE,
      handCore,
      tPt.clone().addScaledVector(tDorsal, rTh * 0.48),
      tTan,
      tDorsal,
      rTh * 1.22,
      rTh * 1.46,
      nailMat,
      cuticleMat,
    );
  }

  // ── 4. 앞쪽(+Z) 네 손가락 위를 따라 감기는 발광 곡선 전류 화살표(항상 카메라 쪽 앞면에 표시) ──
  const fingerArrows = new THREE.Group();
  fingerArrows.position.set(0, cylY, 0);
  group.add(fingerArrows);
  const fArrMat = new THREE.MeshStandardMaterial({
    color: 0xffd400,
    emissive: 0xffc400,
    emissiveIntensity: 0.44,
    roughness: 0.28,
    transparent: true,
    opacity: 0.98,
  });
  const fArrOutlineMat = new THREE.MeshBasicMaterial({
    color: 0x5c3310,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.98,
  });
  for (const ax of [-0.15, 0.19]) {
    const aPts: T.Vector3[] = [];
    const ar = 0.47;
    for (let i = 0; i <= 16; i++) {
      const deg = 38 - (74 * i) / 16; // +38°(앞-위) → -36°(앞-아래): 원통 앞면을 따라 깔끔하게 감김
      const rad = (deg * Math.PI) / 180;
      aPts.push(new THREE.Vector3(ax, Math.sin(rad) * ar, Math.cos(rad) * ar));
    }
    const curve = new THREE.CatmullRomCurve3(aPts);
    fingerArrows.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.032, 12, false), fArrMat));
    fingerArrows.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.047, 12, false), fArrOutlineMat));
    const end = aPts[aPts.length - 1];
    const prev = aPts[aPts.length - 2];
    const tan = end.clone().sub(prev).normalize();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 18), fArrMat);
    cone.position.copy(end).addScaledVector(tan, 0.075);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan);
    const coneO = new THREE.Mesh(new THREE.ConeGeometry(0.108, 0.238, 18), fArrOutlineMat);
    coneO.position.copy(cone.position);
    coneO.quaternion.copy(cone.quaternion);
    fingerArrows.add(cone, coneO);
  }

  // ── 5. 엄지 끝에서 +X로 뻗는 빨간 N극(자기장) 화살표 ──
  const thumbArrow = makeFatArrow3d(THREE, {
    color: 0xff6b5b,
    body: 0.052,
    head: 0.134,
    headLen: 0.27,
    outline: 0x4a120e,
    opacity: 0.98,
  });
  thumbArrow.set(new THREE.Vector3(1.22, -0.025, -0.005), new THREE.Vector3(1, 0, 0), 0.88);
  handCore.add(thumbArrow.g);

  let poseSwingFade = 1;
  const setPose = (rot: number): void => {
    // -rot(Y축 음의 회전): 오른쪽(+X) 엄지가 앞쪽(+Z)을 거쳐 왼쪽(-X)으로 자연스럽게 회내(pronation)한다!
    handCore.rotation.y = -rot;
    fingerArrows.rotation.z = rot;
    poseSwingFade = 0.35 + 0.65 * Math.abs(Math.cos(rot));
  };

  const setOpacity = (alpha: number): void => {
    const isTrans = alpha < 0.98;
    fadeMats.forEach((m) => {
      m.transparent = isTrans;
      m.opacity = alpha;
    });
  };

  const setFocus = (mode: "fingers" | "thumb" | "both", pulseT = 0): void => {
    const p = 0.5 + 0.5 * Math.sin(pulseT * 5.2);
    const fOp = (mode === "fingers" ? 0.84 + 0.16 * p : mode === "both" ? 0.96 : 0.45) * poseSwingFade;
    fArrMat.opacity = fOp;
    fArrOutlineMat.opacity = fOp;
    thumbArrow.setOpacity(mode === "thumb" ? 0.85 + 0.15 * p : mode === "both" ? 0.98 : 0.45);
  };

  return { group, thumbArrow, fingerArrows, setPose, setFocus, setOpacity };
}
