// [중2 Ⅷ v5] g2u8l5 우리은하 가로 3D 무대 모듈(galaxyLab.ts가 동적 import).
// 위에서 본 막대나선 모양(실사 상상도 + 입체 나선팔 입자)과 옆에서 본 중심부가 볼록한 원반 모양을
// 한 3D 모형에서 자유롭게 돌려 보며, 태양계의 위치(중심에서 약 8500 pc 나선팔, 전체 지름 약 30000 pc)와
// 바라보는 방향(은하 중심 방향 vs 바깥쪽 방향)에 따른 은하수 밝기 차이를 탐구한다.
// 지킬 것(2026-11-19 검토에서 고친 것):
//  - 옆에서 보기는 태양계와 은하 중심을 잇는 선이 화면에 가로로 눕는 방향(방위각 90도)에서 본다. 그래야 태양계가 중심에서 반지름의 57%만큼
//    떨어져 보인다. 처음에는 방위각 0.22라 태양계가 카메라와 중심 사이에 놓여, 옆모습에서 중심의 볼록한 부분 안에 있는 것처럼 보였다.
//  - 지름 자는 보는 방위각을 따라 돌아 늘 화면에 가로로 놓인다(원반은 어느 쪽에서 봐도 폭이 지름이라, 자가 비스듬하면 지름보다 짧아 보인다).
//  - 오른쪽 작은 카드 자리를 비우느라 보는 점을 화면 오른쪽으로 미는데, 이 밂도 화면 기준(rightOf)으로 한다.

import { clamp } from "../../../core/dom";
import * as S3 from "../../../ui/space3d";
import { starPhoto } from "./kit";

const { THREE } = S3;

export type GalView = "top" | "side";
export type GalDir = "in" | "out" | null;

export interface GalaxyStage3D {
  resize(w: number, h: number): void;
  setView(v: GalView): void;
  setGuess(x: number, z: number): void;
  clearGuess(): void;
  revealSun(on: boolean): void;
  setDir(d: GalDir): void;
  pickDisc(nx: number, ny: number): [number, number] | null;
  /** (x, y, z)에서 지금 화면의 오른쪽으로 off만큼 옮긴 자리(이름표를 자와 선 옆에 붙일 때 쓴다). */
  rightOf(x: number, y: number, z: number, off: number): [number, number, number];
  nudgeOrbit(dAz: number, dEl: number): GalView | null;
  project(x: number, y: number, z: number, w: number, h: number): { x: number; y: number; ok: boolean };
  step(dt: number, tMs: number): void;
  dispose(): void;
}

export const GAL_R = 10.6; // 반지름 약 15000 pc (지름 약 30000 pc)
export const SUN_Z = 6.0; // 중심에서 약 8500 pc 떨어진 나선팔 자리 (8500 / 15000 * 10.6 ≈ 6.0)

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function softDotTexture(stops: [number, string][]): S3.THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
  for (const [p, c] of stops) g.addColorStop(p, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGalaxyStage3D(canvas: HTMLCanvasElement): GalaxyStage3D | null {
  const st = S3.createSpaceStage(canvas, { fov: 38 });
  if (!st) return null;
  const { scene, camera } = st;

  let disposed = false;
  scene.add(S3.makeStars(900, 220));

  const galaxyGroup = new THREE.Group();
  scene.add(galaxyGroup);

  // 1) 위에서 본 실사 상상도 원반(가장자리 원형 알파 페이드 + 옆에서 볼 때는 입체 별 구름이 주인공이 되도록 시선각 페이드)
  const discGeo = new THREE.PlaneGeometry(24, 24);
  const discUniforms = {
    uTex: { value: new THREE.Texture() },
    uReady: { value: 0 },
  };
  const discMat = new THREE.ShaderMaterial({
    uniforms: discUniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTex;
      uniform float uReady;
      varying vec2 vUv;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float r = length(vUv - vec2(0.5));
        float radial = 1.0 - smoothstep(0.35, 0.49, r);
        float face = smoothstep(0.08, 0.42, abs(dot(vN, vV)));
        vec4 tx = uReady > 0.5 ? texture2D(uTex, vUv) : vec4(0.14, 0.2, 0.36, 1.0);
        gl_FragColor = vec4(tx.rgb * 1.12, radial * face * 0.88);
        #include <colorspace_fragment>
      }
    `,
  });
  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.rotation.x = -Math.PI / 2;
  galaxyGroup.add(discMesh);

  new THREE.TextureLoader().load(
    starPhoto("milkyway-top.webp"),
    (tex) => {
      if (disposed || discMat.userData.__disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      discUniforms.uTex.value.dispose();
      discUniforms.uTex.value = tex;
      discUniforms.uReady.value = 1;
    },
    undefined,
    () => undefined,
  );

  // 2) 입체 막대나선은하 별·성운 구름(중심부의 땅콩형 팽대부 + 4개 나선팔 원반 두께 + 분홍 성운 매듭)
  const rnd = mulberry32(20260805);
  const gauss = (): number => {
    const u = Math.max(1e-5, rnd());
    const v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
  };

  const starTex = softDotTexture([
    [0, "rgba(255,255,255,1)"],
    [0.32, "rgba(235,244,255,0.82)"],
    [1, "rgba(150,190,255,0)"],
  ]);

  const N_BULGE = 1350;
  const N_ARM = 3200;
  const N_HII = 220;
  const N_ALL = N_BULGE + N_ARM + N_HII;
  const pos = new Float32Array(N_ALL * 3);
  const col = new Float32Array(N_ALL * 3);
  const barAngle = 0.46; // milkyway-top.webp의 중심 막대 기울기와 정합
  const cb = Math.cos(barAngle);
  const sb = Math.sin(barAngle);

  let p = 0;
  const put = (x: number, y: number, z: number, r: number, g: number, b: number): void => {
    pos[p * 3] = x;
    pos[p * 3 + 1] = y;
    pos[p * 3 + 2] = z;
    col[p * 3] = r;
    col[p * 3 + 1] = g;
    col[p * 3 + 2] = b;
    p++;
  };

  // (a) 중심 막대 + 볼록한 팽대부(옆에서 볼 때 가운데가 뚜렷하게 볼록 솟아 보인다)
  for (let i = 0; i < N_BULGE; i++) {
    const u = Math.pow(rnd(), 0.62);
    const bx = gauss() * 1.95 * (0.45 + u * 0.85);
    const bz = gauss() * 0.92 * (0.45 + u * 0.75);
    const rPlanar = Math.hypot(bx * 0.55, bz);
    const bulgeH = 1.28 * Math.exp(-rPlanar * rPlanar * 0.36);
    const by = gauss() * (0.22 + bulgeH * 0.62);
    const rx = bx * cb - bz * sb;
    const rz = bx * sb + bz * cb;
    const warm = 0.62 + rnd() * 0.24;
    put(rx, by, rz, 1.0 * warm, (0.84 + rnd() * 0.12) * warm, (0.56 + rnd() * 0.2) * warm);
  }

  // (b) 네 갈래 나선팔 + 원반 별(납작한 원반 두께)
  const armOffsets = [0, Math.PI * 0.52, Math.PI, Math.PI * 1.52];
  for (let i = 0; i < N_ARM; i++) {
    const arm = armOffsets[i % 4];
    const t = Math.pow(rnd(), 0.78); // 0..1 반지름 진행
    const r = 1.8 + t * (GAL_R - 1.5);
    const wind = 2.45 * Math.log(r / 1.8 + 0.35);
    const scatter = gauss() * (0.22 + 0.26 * t) + (rnd() < 0.24 ? (rnd() - 0.5) * 1.5 : 0);
    const th = arm + barAngle + wind + scatter;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const diskH = 0.16 + 0.28 * Math.exp(-r / 5.5);
    const y = gauss() * diskH;
    const blueMix = clamp((r - 2.2) / 7.5 + (rnd() - 0.4) * 0.4, 0, 1);
    const br = (0.65 + 0.35 * (1 - t * 0.55)) * (0.7 + rnd() * 0.3);
    const cr = mix(1.0, 0.64, blueMix) * br;
    const cg = mix(0.88, 0.8, blueMix) * br;
    const cb2 = mix(0.68, 1.0, blueMix) * br;
    put(x, y, z, cr, cg, cb2);
  }

  // (c) 나선팔 위의 붉은빛·분홍빛 성운 매듭
  for (let i = 0; i < N_HII; i++) {
    const arm = armOffsets[i % 4];
    const t = 0.12 + rnd() * 0.78;
    const r = 2.2 + t * (GAL_R - 2.2);
    const th = arm + barAngle + 2.45 * Math.log(r / 1.8 + 0.35) + gauss() * 0.12;
    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;
    const y = gauss() * 0.14;
    put(x, y, z, 1.0, 0.52 + rnd() * 0.2, 0.76 + rnd() * 0.2);
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const starMat = new THREE.PointsMaterial({
    size: 0.24,
    map: starTex,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const starCloud = new THREE.Points(starGeo, starMat);
  galaxyGroup.add(starCloud);

  // 옆에서 볼 때 원반 한가운데를 가로지르는 얇은 암흑 성운 띠 + 중심 팽대부 광채
  const dustTex = softDotTexture([
    [0, "rgba(8,12,24,0.68)"],
    [0.55, "rgba(10,15,28,0.34)"],
    [1, "rgba(10,15,28,0)"],
  ]);
  const dustCount = 260;
  const dPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2.0 + rnd() * (GAL_R - 2.3);
    const th = rnd() * Math.PI * 2;
    dPos[i * 3] = Math.cos(th) * r;
    dPos[i * 3 + 1] = (rnd() - 0.5) * 0.16;
    dPos[i * 3 + 2] = Math.sin(th) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 1.35,
    map: dustTex,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  galaxyGroup.add(new THREE.Points(dustGeo, dustMat));

  const coreGlow = S3.makeGlow(6.8, "rgba(255,222,148,.92)", 0.22);
  galaxyGroup.add(coreGlow);

  // 은하 가장자리 안내 테(투명한 점선 느낌의 얇은 궤도 원)
  galaxyGroup.add(S3.makeOrbitLine(GAL_R, "#6B89BA", 0.26, 128));

  // 3) 학생 예측 마커(하늘색 고리)
  const guessGroup = new THREE.Group();
  guessGroup.visible = false;
  const guessRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.62, 32),
    new THREE.MeshBasicMaterial({ color: 0x74c0fc, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false }),
  );
  guessRing.rotation.x = -Math.PI / 2;
  const guessDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xd0ebff }),
  );
  guessGroup.add(guessRing, guessDot);
  galaxyGroup.add(guessGroup);

  // 4) 실제 태양계 비콘 + 지름 약 30000 pc 자 + 중심에서 약 8500 pc 자
  const realGroup = new THREE.Group();
  realGroup.visible = false;
  const sunBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd43b }),
  );
  sunBeacon.position.set(0, 0.08, SUN_Z);
  const sunRing = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.72, 36),
    new THREE.MeshBasicMaterial({ color: 0xffe066, side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false }),
  );
  sunRing.rotation.x = -Math.PI / 2;
  sunRing.position.set(0, 0.06, SUN_Z);
  const sunGlow = S3.makeGlow(2.6, "rgba(255,212,59,.9)", 0.24);
  sunGlow.position.set(0, 0.08, SUN_Z);

  // 지름 약 30000 pc 가로 기준선 (y = 0.05, x = -GAL_R .. +GAL_R)
  const mkLine = (pts: [number, number, number][], color: number, opacity = 0.9): S3.THREE.Line =>
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: false }),
    );
  const diamGroup = new THREE.Group();
  diamGroup.add(
    mkLine([[-GAL_R, 0.08, 0], [GAL_R, 0.08, 0]], 0xdce8ff, 0.86),
    mkLine([[-GAL_R, 0.08, -0.55], [-GAL_R, 0.08, 0.55]], 0xffffff, 0.92),
    mkLine([[GAL_R, 0.08, -0.55], [GAL_R, 0.08, 0.55]], 0xffffff, 0.92),
    mkLine([[-GAL_R, -0.45, 0], [-GAL_R, 0.45, 0]], 0xffffff, 0.75),
    mkLine([[GAL_R, -0.45, 0], [GAL_R, 0.45, 0]], 0xffffff, 0.75),
  );
  // 중심 ~ 태양계 약 8500 pc 초록 기준선
  const radLine = mkLine([[0, 0.12, 0], [0, 0.12, SUN_Z]], 0x63e6be, 0.96);
  realGroup.add(diamGroup, radLine, sunBeacon, sunRing, sunGlow);
  galaxyGroup.add(realGroup);

  // 5) 시선 방향 입체 원뿔(은하 중심 방향 -Z vs 은하 바깥쪽 방향 +Z)
  const sightGroup = new THREE.Group();
  sightGroup.visible = false;
  sightGroup.position.set(0, 0.1, SUN_Z);
  const coneLen = 6.2;
  const coneGeo = new THREE.ConeGeometry(2.15, coneLen, 36, 1, true);
  // 꼭짓점이 원점(태양계)에 오고 밑면이 +Z로 뻗도록 이동·회전
  coneGeo.translate(0, -coneLen / 2, 0);
  coneGeo.rotateX(-Math.PI / 2);
  const coneMat = new THREE.ShaderMaterial({
    uniforms: { uCol: { value: new THREE.Color(0xffd43b) } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying float vZ;
      void main() {
        vZ = clamp(position.z / ${coneLen.toFixed(2)}, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uCol;
      varying float vZ;
      void main() {
        float fade = (1.0 - smoothstep(0.25, 1.0, vZ)) * 0.36;
        gl_FragColor = vec4(uCol, fade);
        #include <colorspace_fragment>
      }
    `,
  });
  const sightCone = new THREE.Mesh(coneGeo, coneMat);
  const sightArrow = mkLine([[0, 0, 0], [0, 0, coneLen * 0.86]], 0xffe066, 0.95);
  sightGroup.add(sightCone, sightArrow);
  galaxyGroup.add(sightGroup);

  // 카메라 구면 좌표: top(위에서 보기: el ≈ 1.44 rad) ↔ side(옆에서 보기: el ≈ 0.07 rad)
  let targetAz = 0;
  let targetEl = 1.44;
  let curAz = 0;
  let curEl = 1.44;
  let camDist = 31;
  let shift = 1.5; // 오른쪽 미니 카드 여백 확보를 위해 보는 점을 화면 오른쪽으로 미는 양(은하는 그만큼 왼쪽에 놓인다)
  const lookTarget = new THREE.Vector3(shift, 0, 0.4);

  function updateCamDist(w: number, h: number): void {
    const aspect = Math.max(1, w / Math.max(1, h));
    const tanV = Math.tan((38 / 2) * (Math.PI / 180));
    const needW = 14.2 / (tanV * aspect);
    const needH = 12.6 / tanV;
    camDist = Math.max(26, needW, needH);
    shift = aspect > 1.65 ? 2.1 : 1.2;
  }

  return {
    resize(w, h) {
      st.resize(w, h);
      updateCamDist(w, h);
    },
    setView(v) {
      if (v === "top") {
        targetAz = 0;
        targetEl = 1.45;
      } else {
        // 태양계(0, 0, +6)와 은하 중심을 잇는 선이 화면에 가로로 눕는 방향. 태양계가 중심의 왼쪽, 반지름의 57% 자리에 보인다
        targetAz = Math.PI / 2;
        targetEl = 0.06;
      }
    },
    setGuess(x, z) {
      guessGroup.visible = true;
      guessGroup.position.set(x, 0.09, z);
    },
    clearGuess() {
      guessGroup.visible = false;
    },
    revealSun(on) {
      realGroup.visible = on;
      if (on) guessGroup.visible = false;
    },
    setDir(d) {
      if (!d) {
        sightGroup.visible = false;
        return;
      }
      sightGroup.visible = true;
      // d === "in": 태양계(0,0,+6)에서 은하 중심(0,0,0) 쪽인 -Z 방향(Y축 180° 회전)
      sightGroup.rotation.y = d === "in" ? Math.PI : 0;
      (coneMat.uniforms.uCol.value as S3.THREE.Color).set(d === "in" ? 0xffd43b : 0x74c0fc);
      (sightArrow.material as S3.THREE.LineBasicMaterial).color.set(d === "in" ? 0xffe066 : 0xa5d8ff);
    },
    pickDisc(nx, ny) {
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hit = new THREE.Vector3();
      if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return null;
      if (Math.hypot(hit.x, hit.z) > GAL_R) return null;
      return [hit.x, hit.z];
    },
    rightOf(x, y, z, off) {
      return [x + Math.cos(curAz) * off, y, z - Math.sin(curAz) * off];
    },
    nudgeOrbit(dAz, dEl) {
      targetAz = clamp(targetAz + dAz, -1.9, 1.9);
      targetEl = clamp(targetEl + dEl, 0.03, 1.5);
      return targetEl < 0.35 ? "side" : targetEl > 1.05 ? "top" : null;
    },
    project(x, y, z, w, h) {
      const v = new THREE.Vector3(x, y, z).project(camera);
      return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, ok: v.z < 1 };
    },
    step(dt, tMs) {
      const k = Math.min(1, 0.14 * dt);
      curAz += (targetAz - curAz) * k;
      curEl += (targetEl - curEl) * k;
      const ce = Math.cos(curEl);
      // 보는 점: 화면 오른쪽으로 shift, 위에서 볼 때는 카메라 쪽(화면 아래)으로 조금 더
      const topness = clamp((curEl - 0.3) / 1.0, 0, 1);
      lookTarget.set(Math.cos(curAz) * shift + Math.sin(curAz) * 0.4 * topness, 0, -Math.sin(curAz) * shift + Math.cos(curAz) * 0.4 * topness);
      diamGroup.rotation.y = curAz; // 지름 자는 늘 화면에 가로로
      camera.position.set(
        lookTarget.x + Math.sin(curAz) * ce * camDist,
        lookTarget.y + Math.sin(curEl) * camDist,
        lookTarget.z + Math.cos(curAz) * ce * camDist,
      );
      camera.lookAt(lookTarget);

      const pulse = 1 + Math.sin(tMs / 280) * 0.14;
      sunRing.scale.setScalar(pulse);
      guessRing.scale.setScalar(1 + Math.sin(tMs / 320) * 0.1);
      // 위에서 볼 때는 실사 상상도 나선팔이 선명히 살아나고, 옆에서 볼 때는 입체 별 구름과 볼록한 팽대부가 주인공이 된다
      const edgeFactor = 1 - clamp((curEl - 0.1) / 0.8, 0, 1);
      starMat.opacity = 0.4 + edgeFactor * 0.54;
      coreGlow.scale.set(6.8, 6.8 * (0.65 + 0.35 * (1 - edgeFactor * 0.35)), 1);

      st.render();
    },
    dispose() {
      disposed = true;
      discUniforms.uTex.value.dispose();
      st.dispose();
    },
  };
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
