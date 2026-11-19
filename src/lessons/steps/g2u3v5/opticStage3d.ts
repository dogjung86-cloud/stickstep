// [중2 Ⅲ v5] g2u3l5 거울과 렌즈 입체 무대(curveLabs.ts가 동적 import).
// 왼쪽 칸(x 0..194)에는 입체 광학 실험대(레일, 3D 인형, 곡면 거울/유리 렌즈의 실제 두께와 곡률, 눈 모형, 빛줄기)를,
// 오른쪽 칸(x 198..334, y 44..176)에는 거울에 비친 방 안 모습 / 렌즈로 들여다본 방 안 모습(배율·화각·상하 반전 반영)을
// 단일 WebGLRenderer의 이중 시저 뷰포트로 그린다. '초점·실상·허상' 용어는 일절 쓰지 않는다.

import { clamp } from "../../../core/dom";
import * as S3 from "../../../ui/space3d";

const { THREE } = S3;

export type OpticMode = "mirror" | "lens";
export type OpticDev = "cvx" | "ccv";

export const PORTAL_RECT = { x: 198, y: 44, w: 136, h: 132, cx: 266, cy: 110 };

export interface OpticStage3D {
  nudgeYaw(delta: number): void;
  render(
    w: number,
    h: number,
    state: { lens: boolean; dev: OpticDev; v: number; mag: number; blurry: boolean },
  ): { eye: [number, number]; optic: [number, number]; doll: [number, number] };
  dispose(): void;
}

/** 위아래·좌우 비대칭이 뚜렷한 3D 인형(노란 챙모자, 빨간 코트, 오른손 하늘색 별 지팡이). */
function buildDoll3D(): S3.THREE.Group {
  const g = new THREE.Group();

  // 받침 원판
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.4, 0.08, 24),
    new THREE.MeshStandardMaterial({ color: 0x3b4a66, roughness: 0.5, metalness: 0.25 }),
  );
  base.position.y = 0.04;
  g.add(base);

  // 다리 두 짝
  const legMat = new THREE.MeshStandardMaterial({ color: 0x2c3e66, roughness: 0.6 });
  for (const sx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.34, 14), legMat);
    leg.position.set(sx, 0.24, 0);
    g.add(leg);
  }

  // 빨간 코트 몸통 + 흰 단추
  const coat = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.34, 0.68, 24),
    new THREE.MeshStandardMaterial({ color: 0xeb524a, roughness: 0.42, metalness: 0.05 }),
  );
  coat.position.y = 0.72;
  g.add(coat);

  const btnMat = new THREE.MeshBasicMaterial({ color: 0xfff5e6 });
  for (const by of [0.64, 0.82]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), btnMat);
    b.position.set(0, by, 0.26);
    g.add(b);
  }

  // 양팔(오른손은 위로 들어 별 지팡이를 든다)
  const armMat = new THREE.MeshStandardMaterial({ color: 0xf0625a, roughness: 0.45 });
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.42, 12), armMat);
  armL.position.set(-0.27, 0.76, 0.02);
  armL.rotation.z = 0.38;
  g.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.46, 12), armMat);
  armR.position.set(0.28, 0.96, 0.05);
  armR.rotation.z = -0.65;
  g.add(armR);

  const wandStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.52, 10),
    new THREE.MeshBasicMaterial({ color: 0xffe8a3 }),
  );
  wandStick.position.set(0.45, 1.22, 0.08);
  wandStick.rotation.z = -0.18;
  const wandStar = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.MeshStandardMaterial({ color: 0x62d4ff, emissive: 0x1c7ed6, emissiveIntensity: 0.55, roughness: 0.2 }),
  );
  wandStar.position.set(0.49, 1.48, 0.08);
  g.add(wandStick, wandStar);

  // 머리 + 눈
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xf8d7be, roughness: 0.55 }),
  );
  head.position.y = 1.28;
  g.add(head);

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e2638 });
  for (const ex of [-0.085, 0.085]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyeMat);
    e.position.set(ex, 1.3, 0.23);
    g.add(e);
  }

  // 노란 모자와 앞 챙(위아래 구별이 한눈에 되게)
  const capMat = new THREE.MeshStandardMaterial({ color: 0xffc83d, roughness: 0.36 });
  const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.262, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.54), capMat);
  capDome.position.y = 1.31;
  const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.045, 24), capMat);
  capBrim.position.set(0, 1.34, 0.06);
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff3bf }));
  pom.position.set(0, 1.59, 0);
  g.add(capDome, capBrim, pom);

  return g;
}

/** 회전 대칭 렌즈 단면 생성(볼록 렌즈: 가운데 두꺼움, 오목 렌즈: 가운데 얇고 가장자리 두꺼움). */
function buildLensMesh(convex: boolean): S3.THREE.Group {
  const grp = new THREE.Group();
  const R = 1.02;
  const pts: S3.THREE.Vector2[] = [];
  const N = 24;
  // LatheGeometry는 Y축 둘레 회전이므로 반지름 r(X), 두께 z(Y)로 그린 뒤 Z축이 광축이 되게 눕힌다.
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const r = u * R;
    const halfT = convex ? 0.08 + 0.28 * (1 - u * u) : 0.07 + 0.26 * (u * u);
    pts.push(new THREE.Vector2(r, halfT));
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    const r = u * R;
    const halfT = convex ? 0.08 + 0.28 * (1 - u * u) : 0.07 + 0.26 * (u * u);
    pts.push(new THREE.Vector2(r, -halfT));
  }
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.rotateZ(Math.PI / 2); // 광축을 X축으로 정렬
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x9bd6ff,
    emissive: 0x16385c,
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0.05,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
  });
  grp.add(new THREE.Mesh(geo, glassMat));

  // 황동 테두리 림 + 스탠드 기둥
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(R + 0.04, 0.055, 14, 44),
    new THREE.MeshStandardMaterial({ color: 0xc8a45d, roughness: 0.35, metalness: 0.65 }),
  );
  rim.rotation.y = Math.PI / 2;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.62, 14),
    new THREE.MeshStandardMaterial({ color: 0x6b7c96, roughness: 0.45, metalness: 0.4 }),
  );
  stem.position.y = -R - 0.3;
  grp.add(rim, stem);
  return grp;
}

/** 곡면 거울 생성(반사면이 -X 쪽 물체를 향한다. 볼록 거울: -X로 불룩 튀어나옴, 오목 거울: +X로 오목하게 들어감). */
function buildMirrorMesh(convex: boolean): S3.THREE.Group {
  const grp = new THREE.Group();
  const R = 1.05;
  const sphR = 2.15;
  const thetaMax = Math.asin(R / sphR);
  // 기본 구면 캡(극점이 +Y)을 만든 뒤 극점이 -X 또는 +X를 향하도록 회전
  const capGeo = new THREE.SphereGeometry(sphR, 40, 20, 0, Math.PI * 2, 0, thetaMax);
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xe6f0ff,
    emissive: 0x2b4368,
    emissiveIntensity: 0.32,
    roughness: 0.1,
    metalness: 0.85,
    side: THREE.DoubleSide,
  });
  const cap = new THREE.Mesh(capGeo, mirrorMat);
  if (convex) {
    // 극점이 -X(물체 쪽으로 볼록 튀어나옴)
    cap.rotation.z = Math.PI / 2;
    cap.position.x = sphR * Math.cos(thetaMax);
  } else {
    // 극점이 +X(물체에서 볼 때 안으로 오목하게 들어감)
    cap.rotation.z = -Math.PI / 2;
    cap.position.x = -sphR * Math.cos(thetaMax);
  }
  grp.add(cap);

  // 뒷면 하우징 링 + 스탠드
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(R, 0.06, 14, 44),
    new THREE.MeshStandardMaterial({ color: 0x5c6f8c, roughness: 0.42, metalness: 0.45 }),
  );
  bezel.rotation.y = Math.PI / 2;
  const backDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, 0.1, 36),
    new THREE.MeshStandardMaterial({ color: 0x2d3b52, roughness: 0.65 }),
  );
  backDisc.rotation.z = Math.PI / 2;
  backDisc.position.x = convex ? 0.08 : 0.28;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.085, 0.62, 14),
    new THREE.MeshStandardMaterial({ color: 0x6b7c96, roughness: 0.45, metalness: 0.4 }),
  );
  stem.position.set(convex ? 0.08 : 0.22, -R - 0.3, 0);
  grp.add(bezel, backDisc, stem);
  return grp;
}

/** 관찰자 3D 눈 모형(+X 쪽을 바라본다). */
function buildEye3D(): S3.THREE.Group {
  const g = new THREE.Group();
  const sclera = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xf4f7fc, roughness: 0.3 }),
  );
  const iris = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.05, 20),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
  );
  iris.rotation.z = Math.PI / 2;
  iris.position.x = 0.255;
  const pupil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16),
    new THREE.MeshBasicMaterial({ color: 0x0b1324 }),
  );
  pupil.rotation.z = Math.PI / 2;
  pupil.position.x = 0.262;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.06, 0.95, 12),
    new THREE.MeshStandardMaterial({ color: 0x526480, roughness: 0.5 }),
  );
  stem.position.y = -0.58;
  g.add(sclera, iris, pupil, stem);
  return g;
}

/** 체커보드 바닥 텍스처(포털 시점의 공간감·화각 변화를 선명하게 보여 준다). */
function makeCheckerTexture(): S3.THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext("2d")!;
  const N = 8;
  const s = 256 / N;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#384E73" : "#273958";
      ctx.fillRect(x * s, y * s, s, s);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function createOpticStage3D(canvas: HTMLCanvasElement): OpticStage3D | null {
  let renderer: S3.THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setScissorTest(true);

  // ── 1. 왼쪽 입체 광학 실험대 씬 ──
  const benchScene = new THREE.Scene();
  const benchCam = new THREE.PerspectiveCamera(34, 1, 0.1, 80);

  benchScene.add(new THREE.AmbientLight(0x8aa4d6, 0.95));
  const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.65);
  keyLight.position.set(-3, 7, 6);
  benchScene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x7cc4ff, 0.75);
  rimLight.position.set(5, 3, -5);
  benchScene.add(rimLight);

  // 광학 레일(x = -3.6 .. +3.6, y = -1.25) + 눈금
  const railGroup = new THREE.Group();
  const railBody = new THREE.Mesh(
    new THREE.BoxGeometry(7.3, 0.18, 0.92),
    new THREE.MeshStandardMaterial({ color: 0x1e2d47, roughness: 0.55, metalness: 0.25 }),
  );
  railBody.position.set(0, -1.34, 0);
  railGroup.add(railBody);
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x6f8bb8 });
  for (let i = -14; i <= 14; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, i % 5 === 0 ? 0.42 : 0.22), tickMat);
    tick.position.set(i * 0.24, -1.24, 0.22);
    railGroup.add(tick);
  }
  benchScene.add(railGroup);

  const eyeModel = buildEye3D();
  benchScene.add(eyeModel);

  const dollBench = buildDoll3D();
  dollBench.scale.setScalar(0.84);
  benchScene.add(dollBench);

  const mirrorCvx = buildMirrorMesh(true);
  const mirrorCcv = buildMirrorMesh(false);
  const lensCvx = buildLensMesh(true);
  const lensCcv = buildLensMesh(false);
  const opticAnchor = new THREE.Group();
  opticAnchor.add(mirrorCvx, mirrorCcv, lensCvx, lensCcv);
  benchScene.add(opticAnchor);

  // 입체 빛줄기 2가닥(위·아래 나란히 출발해 거울/렌즈에서 퍼지거나 모인다)
  const rayLines: S3.THREE.Line[] = [-0.42, 0.42].map(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffdf7a, transparent: true, opacity: 0.72 }));
    benchScene.add(line);
    return line;
  });

  // ── 2. 오른쪽 거울·렌즈 시점 포털 씬(미니어처 실험실 방 + 인형) ──
  const portalScene = new THREE.Scene();
  portalScene.background = new THREE.Color(0x1b2d4e);
  const portalCam = new THREE.PerspectiveCamera(40, 1, 0.1, 60);

  portalScene.add(new THREE.AmbientLight(0xa2bce8, 1.05));
  const pLight = new THREE.DirectionalLight(0xfff6e5, 1.55);
  pLight.position.set(2.5, 5, 6);
  portalScene.add(pLight);

  const checkerTex = makeCheckerTexture();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ map: checkerTex, roughness: 0.75 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1);
  portalScene.add(floor);

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 9),
    new THREE.MeshStandardMaterial({ color: 0x263c63, roughness: 0.85 }),
  );
  backWall.position.set(0, 3.8, -4.2);
  portalScene.add(backWall);

  // 배경 소품(왼쪽 창문 격자 + 오른쪽 초록 화분: 볼록 거울/오목 렌즈에서 넓은 시야가 들어오는 것을 직관적으로 보여 줌)
  const winGroup = new THREE.Group();
  winGroup.position.set(-2.35, 1.85, -4.12);
  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.65), new THREE.MeshBasicMaterial({ color: 0x6cb4f5 }));
  const frameMat = new THREE.MeshBasicMaterial({ color: 0xdbe7f8 });
  const barH = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.07, 0.05), frameMat);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.72, 0.05), frameMat);
  winGroup.add(winPane, barH, barV);
  portalScene.add(winGroup);

  const plantGroup = new THREE.Group();
  plantGroup.position.set(2.25, 0, -2.9);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.25, 0.48, 18),
    new THREE.MeshStandardMaterial({ color: 0xc96f46, roughness: 0.6 }),
  );
  pot.position.y = 0.24;
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 20, 16),
    new THREE.MeshStandardMaterial({ color: 0x3eb368, roughness: 0.55 }),
  );
  bush.position.y = 0.78;
  plantGroup.add(pot, bush);
  portalScene.add(plantGroup);

  const dollPortal = buildDoll3D();
  portalScene.add(dollPortal);
  // 흐릿한 자리(blurry)에서 겹쳐 보이는 잔상 인형
  const dollBlurA = buildDoll3D();
  const dollBlurB = buildDoll3D();
  portalScene.add(dollBlurA, dollBlurB);

  let yawOffset = 0;

  return {
    nudgeYaw(delta) {
      yawOffset = clamp(yawOffset + delta, -0.38, 0.38);
    },
    render(w, h, state) {
      const pr = S3.stagePixelRatio(canvas, w, h);
      if (renderer.getPixelRatio() !== pr || canvas.width !== Math.round(w * pr) || canvas.height !== Math.round(h * pr)) {
        renderer.setPixelRatio(pr);
        renderer.setSize(w, h, false);
      }

      const { lens, dev, v, mag, blurry } = state;
      const sx = w / 346;
      const sy = h / 230;

      // ── Viewport A: 왼쪽 3D 광학 실험대 (설계 x: 2..194, y: 24..226) ──
      const bx = Math.round(2 * sx);
      const bw = Math.max(1, Math.round(192 * sx));
      const bh = Math.max(1, Math.round(202 * sy));
      const by = Math.round(h - (24 + 202) * sy); // WebGL y는 아래에서 위로

      mirrorCvx.visible = !lens && dev === "cvx";
      mirrorCcv.visible = !lens && dev === "ccv";
      lensCvx.visible = lens && dev === "cvx";
      lensCcv.visible = lens && dev === "ccv";

      const opticX = lens ? -0.55 : 1.92;
      opticAnchor.position.set(opticX, -0.22, 0);

      const eyeX = -3.05;
      eyeModel.position.set(eyeX, -0.32, 0);

      // 인형 자리: 거울 판은 눈과 거울 사이(가까울수록 거울 쪽), 렌즈 판은 렌즈 너머(멀수록 +X로)
      const tNorm = (v - 1) / 19; // 0(가까움) .. 1(멂)
      const dollX = lens ? opticX + 0.78 + tNorm * 3.55 : opticX - 0.75 - tNorm * 3.35;
      dollBench.position.set(dollX, -1.25, 0);
      // 인형이 거울(오른쪽)이나 렌즈/눈(왼쪽)을 자연스럽게 바라보게 살짝 비스듬히 배치
      dollBench.rotation.y = lens ? -0.55 : 0.55;

      // 입체 빛줄기 갱신
      const gather = lens ? dev === "cvx" : dev === "ccv";
      [-0.36, 0.36].forEach((ry, idx) => {
        const posAttr = rayLines[idx].geometry.attributes.position as S3.THREE.BufferAttribute;
        const startX = dollX + (lens ? -0.18 : 0.18);
        const startY = -0.35 + ry * 0.65;
        const hitY = -0.22 + ry;
        let endX: number;
        let endY: number;
        if (lens) {
          endX = eyeX + 0.3;
          endY = gather ? -0.22 - ry * 0.65 : -0.22 + ry * 1.65;
        } else {
          endX = eyeX + 0.45;
          endY = gather ? -0.22 - ry * 0.85 : -0.22 + ry * 1.75;
        }
        posAttr.setXYZ(0, startX, startY, 0);
        posAttr.setXYZ(1, opticX, hitY, 0);
        posAttr.setXYZ(2, endX, endY, 0);
        posAttr.needsUpdate = true;
      });

      const baseAz = 0.28 + yawOffset;
      const benchDist = 9.2;
      benchCam.aspect = bw / bh;
      benchCam.updateProjectionMatrix();
      benchCam.position.set(Math.sin(baseAz) * benchDist - 0.25, 2.35, Math.cos(baseAz) * benchDist);
      benchCam.lookAt(-0.25, -0.48, 0);

      renderer.setClearColor(0x000000, 0);
      renderer.setViewport(bx, by, bw, bh);
      renderer.setScissor(bx, by, bw, bh);
      renderer.clear(true, true, false);
      renderer.render(benchScene, benchCam);

      const projBench = (wx: number, wy: number, wz: number): [number, number] => {
        const p = new THREE.Vector3(wx, wy, wz).project(benchCam);
        const px = 2 + ((p.x + 1) * 0.5) * 192;
        const py = 24 + ((1 - p.y) * 0.5) * 202;
        return [px, py];
      };
      const anchors = {
        eye: projBench(eyeX, 0.12, 0),
        optic: projBench(opticX, 0.98, 0),
        doll: projBench(dollX, -1.42, 0),
      };

      // ── Viewport B: 오른쪽 거울·렌즈 시점 포털 (설계 PORTAL_RECT) ──
      const px = Math.round(PORTAL_RECT.x * sx);
      const pw = Math.max(1, Math.round(PORTAL_RECT.w * sx));
      const ph = Math.max(1, Math.round(PORTAL_RECT.h * sy));
      const py = Math.round(h - (PORTAL_RECT.y + PORTAL_RECT.h) * sy);

      portalScene.background = new THREE.Color(blurry ? 0x3b3552 : lens ? 0x1e3358 : 0x243856);
      portalCam.aspect = pw / ph;

      // 기준 크기(m = 1)일 때 인형이 포털 높이의 약 48%를 차지하도록 기준 거리를 맞춘다.
      const absM = clamp(Math.abs(mag), 0.22, 2.45);
      // 볼록 거울/오목 렌즈(!gather)는 화각도 넓어져 창문과 화분이 함께 들어온다.
      const wideFov = !gather ? 40 + (1 - absM) * 26 : 40;
      portalCam.fov = wideFov;
      portalCam.updateProjectionMatrix();

      const refTan = Math.tan((40 / 2) * (Math.PI / 180));
      const curTan = Math.tan((wideFov / 2) * (Math.PI / 180));
      const baseCamZ = 4.35 * (refTan / curTan);
      const camZ = clamp(baseCamZ / absM, 1.65, 13.5);

      const inv = !blurry && mag < 0;
      portalCam.up.set(0, inv ? -1 : 1, 0);
      portalCam.position.set(0, 0.82, camZ);
      portalCam.lookAt(0, 0.82, 0);

      dollPortal.visible = !blurry;
      dollPortal.rotation.y = lens ? 0 : Math.PI * 0.04;
      dollBlurA.visible = blurry;
      dollBlurB.visible = blurry;
      if (blurry) {
        portalCam.up.set(0, 1, 0);
        portalCam.position.set(0, 0.82, 2.5);
        portalCam.lookAt(0, 0.82, 0);
        dollBlurA.position.set(-0.22, 0.08, 0);
        dollBlurB.position.set(0.22, -0.08, 0.15);
      }

      renderer.setViewport(px, py, pw, ph);
      renderer.setScissor(px, py, pw, ph);
      renderer.render(portalScene, portalCam);

      return anchors;
    },
    dispose() {
      const cleanScene = (sc: S3.THREE.Scene): void => {
        sc.traverse((obj) => {
          const mesh = obj as S3.THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = (mesh as { material?: S3.THREE.Material | S3.THREE.Material[] }).material;
          const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
          for (const m of mats) {
            const mm = m as unknown as Record<string, unknown>;
            if (mm.map && typeof (mm.map as S3.THREE.Texture).dispose === "function") (mm.map as S3.THREE.Texture).dispose();
            m.dispose();
          }
        });
        sc.clear();
      };
      cleanScene(benchScene);
      cleanScene(portalScene);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
