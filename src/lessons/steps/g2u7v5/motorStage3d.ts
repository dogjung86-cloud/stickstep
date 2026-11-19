// [중2 Ⅶ v5] g2u7l8 motorLab의 입체 무대(2026-11-15, 사용자 요청 "자석 사이에서 사각형 고리가 회전하는 것을 3D로").
// 두 자석(N극, S극) 사이에서 네 변의 코일이 회전축을 따라 돈다. 앞쪽 축 끝에는 둘로 나뉜 고리(정류자)와 그것에 닿은 두 브러시가 있다
// (이름표는 달지 않는다. 책 그림처럼 생김새만 보인다).
// 카메라는 책 그림(전동기의 구조)처럼 앞에서 조금 내려다보고, 깊이 방향(전류가 흐르는 양쪽 변)이 비스듬히 읽히게 오른쪽으로 조금만 틀어 고정한다.
//   더 틀면 카메라 쪽 자석이 코일 오른쪽 변의 뒤쪽을 가린다(2026-11-15 첫 장면에서 겪음. 아래 카메라 주석의 검산).
//   손으로 끌어 돌리지 않는다(세포 입체 무대에서 사용자가 정한 것과 같은 결).
// three는 여기서 쓰지 않고 mountMotor3d 안에서 ui/space3d를 동적 import로 부른다(이 파일은 정적으로 불러도 번들이 늘지 않는다).
//
// 좌표(three의 오른손 좌표): x 오른쪽, y 위, z 보는 사람 쪽(앞). 회전축은 z축, 코일의 양쪽 변은 축과 나란하다.
// 검산 메모(2026-11-15):
//   · 힘 = 전류 × 자기장. N극이 왼쪽이면 자기장 B = +x. cur = 1이면 왼쪽에 온 변의 전류 I = −z(뒤쪽으로).
//     I × B = (0, 0, −1) × (1, 0, 0) = (0·0 − (−1)·0, (−1)·1 − 0·0, 0·0 − 0·1) = (0, −1, 0), 아래쪽이다.
//     오른쪽 변은 I = +z라 (0, 0, 1) × (1, 0, 0) = (0, 1, 0), 위쪽이다. 2026-11-14에 2D 그림에서 바로잡은 부호(왼쪽 변 아래)와 같다.
//     왼쪽이 내려가고 오른쪽이 올라가니 앞에서 볼 때 시계 반대 방향이고, three의 rotation.z가 커지는 쪽이다(motorLab의 th와 같다).
//     오른손으로도 맞다: 네 손가락을 자기장(오른쪽)으로, 엄지를 전류(뒤쪽)로 두면 손바닥이 아래를 향한다.
//   · 축을 가로지르는 앞뒤 변: 코일이 θ만큼 돌았을 때 그 변의 전류는 (±cosθ, ±sinθ, 0)이라 (±cosθ, ±sinθ, 0) × (1, 0, 0) = (0, 0, ∓sinθ).
//     코일 면이 자기장과 나란할 때(θ = 0, 처음 붙잡은 자리) 이 변은 자기장과 나란해 힘이 0이다. 기울어도 힘이 축 방향(±z)이라 축을 돌리지 못하고,
//     앞뒤 두 변의 힘은 서로 반대라 상쇄된다. 그래서 힘 화살표는 양쪽 변에만 그린다(개발 서버의 __motor()가 이 값들을 돌려준다).
//   · 양쪽 변의 힘은 코일이 어디에 있든 위아래(±y)다(변이 늘 z와 나란하고 자기장이 x라서). 코일 면이 세워질 때(θ = ±90°) 축을 돌리는 힘이 0이 되고,
//     그때 정류자가 전류를 바꿔 왼쪽에 온 변에는 늘 같은 방향의 전류가 흐른다(motorLab과 같은 약속).

import type * as T from "three";

export interface MotorView {
  /** 전류가 흐르나 */
  on: boolean;
  /** 1이면 왼쪽에 온 변의 전류가 뒤쪽(−z)으로 흐른다 */
  cur: 1 | -1;
  /** N극이 왼쪽 */
  nLeft: boolean;
  /** 코일이 돈 각(앞에서 볼 때 시계 반대 방향이 +) */
  th: number;
  /** 붙잡은 첫 걸음에는 오른쪽 변의 힘을 숨긴다(예측하기 전) */
  rightForce: boolean;
  /** 코일을 붙잡고 있다(돌지 않는다) */
  held: boolean;
  /** 무대 위 상태 글(빈 글이면 숨긴다) */
  tag: string;
}
export interface Motor3d {
  render(v: MotorView): void;
  dispose(): void;
}

let glOk: boolean | null = null;
/** 이 기기에서 입체 무대를 쓸 수 있는가(three는 WebGL2만 쓴다). 세션 저장소 ss.motorflat = "1"이면 평면 무대로(견주어 보기용). */
export function canMotor3d(): boolean {
  try {
    if (sessionStorage.getItem("ss.motorflat") === "1") return false;
  } catch {
    /* 세션 저장소를 못 쓰는 환경 */
  }
  if (glOk === null) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      glOk = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); // 알아보는 데 쓴 컨텍스트는 바로 돌려준다
    } catch {
      glOk = false;
    }
  }
  return glOk;
}

// 치수(코일 반 너비를 1로)
const R = 1; // 코일의 반 너비(축에서 양쪽 변까지)
const D = 0.95; // 코일의 반 깊이(축 방향)
const ROD = 0.05; // 코일 도선의 굵기(반지름)
const GAP = 1.45; // 자석 안쪽 면의 x
const MAG_W = 0.85; // 자석 한 덩이의 너비(x)
const MAG_D = 2.2; // 자석의 깊이(z, 코일 깊이를 다 덮는다)
const COM_R = 0.14; // 정류자 반지름
const COM_Z0 = D + 0.2; // 정류자 뒤 끝
const COM_LEN = 0.28;
/** 힘 화살표를 다는 자리(변의 가운데보다 조금 뒤). 가운데에 달면 내려다보는 카메라에서 앞쪽 변과 정류자에 겹친다 */
const F_Z = -0.3;
const BASE_Y = -1.06; // 받침 윗면

/** 무대(캔버스)에 전동기를 올린다. 입체 무대를 열 수 없으면 null(호출부가 평면 무대를 그린다). */
export async function mountMotor3d(cv: HTMLCanvasElement, box: HTMLElement): Promise<Motor3d | null> {
  const S = await import("../../../ui/space3d");
  const THREE = S.THREE;
  const made = S.createSpaceStage(cv, { fov: 34 });
  if (!made) return null;
  const stage = made;
  const { scene, camera } = stage;
  scene.add(new THREE.HemisphereLight(0xe4efff, 0x22304a, 1.05));
  const sun = new THREE.DirectionalLight(0xfff7ec, 2.2);
  sun.position.set(3, 7, 6);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7cc4ff, 0.9);
  rim.position.set(-4.5, 3.5, -4);
  scene.add(rim);

  const std = (color: number, metal = 0.14, rough = 0.48): T.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
  const paint = (color: number): T.MeshPhysicalMaterial =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.36, metalness: 0.08, clearcoat: 0.2, clearcoatRoughness: 0.4 });
  const roundBox = (w: number, h: number, d: number, r = 0.024): T.ExtrudeGeometry => {
    const rr = Math.min(r, w * 0.25, h * 0.25, d * 0.25);
    const iw = w - rr * 2;
    const ih = h - rr * 2;
    const id = d - rr * 2;
    const sh = new THREE.Shape();
    sh.moveTo(-iw / 2, -ih / 2);
    sh.lineTo(iw / 2, -ih / 2);
    sh.lineTo(iw / 2, ih / 2);
    sh.lineTo(-iw / 2, ih / 2);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: id, bevelEnabled: true, bevelThickness: rr, bevelSize: rr, bevelSegments: 3 });
    g.translate(0, 0, -id / 2);
    g.computeVertexNormals();
    return g;
  };
  const boxAt = (w: number, h: number, d: number, mat: T.Material, x: number, y: number, z: number, parent: T.Object3D = scene): T.Mesh => {
    const m = new THREE.Mesh(roundBox(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  /** 두 점을 잇는 원기둥(도선, 축) */
  const rodBetween = (a: T.Vector3, b: T.Vector3, r: number, mat: T.Material, parent: T.Object3D): T.Mesh => {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 14), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    parent.add(m);
    return m;
  };
  const v3 = (x: number, y: number, z: number): T.Vector3 => new THREE.Vector3(x, y, z);

  /** 굵은 화살표(원기둥 대 + 원뿔 머리). outline이 있으면 뒷면을 칠한 조금 큰 껍데기로 테두리를 두른다. 화살표는 +y를 향해 만들고 돌려 놓는다.
   *  onTop이면 가려지지 않게 늘 위에 그린다(힘 화살표: 내려다보는 카메라에서 왼쪽 변의 아래쪽 힘이 앞 변과 겹친다). */
  const fatArrow = (o: { color: number; body: number; head: number; headLen: number; outline?: number; opacity?: number; onTop?: boolean }) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: o.color, transparent: o.opacity !== undefined, opacity: o.opacity ?? 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(o.body, o.body, 1, 12), mat);
    const head = new THREE.Mesh(new THREE.ConeGeometry(o.head, o.headLen, 18), mat);
    g.add(body, head);
    let bodyO: T.Mesh | null = null;
    let headO: T.Mesh | null = null;
    const ow = 0.022;
    if (o.outline !== undefined) {
      const om = new THREE.MeshBasicMaterial({ color: o.outline, side: THREE.BackSide });
      bodyO = new THREE.Mesh(new THREE.CylinderGeometry(o.body + ow, o.body + ow, 1, 12), om);
      headO = new THREE.Mesh(new THREE.ConeGeometry(o.head + ow * 1.7, o.headLen + ow * 2.6, 18), om);
      g.add(bodyO, headO);
    }
    if (o.onTop) {
      g.traverse((m) => {
        const mm = (m as T.Mesh).material as T.Material | undefined;
        if (!mm) return;
        mm.depthTest = false;
        mm.depthWrite = false;
        m.renderOrder = (mm as T.MeshBasicMaterial).side === THREE.BackSide ? 3 : 4; // 테두리 먼저, 그 위에 몸통(이름표는 5)
      });
    }
    const up = v3(0, 1, 0);
    return {
      g,
      /** 꼬리 자리, 방향(단위 벡터), 길이 */
      set(tail: T.Vector3, dir: T.Vector3, len: number): void {
        const bl = Math.max(0.01, len - o.headLen);
        g.position.copy(tail);
        g.quaternion.setFromUnitVectors(up, dir);
        body.scale.y = bl;
        body.position.y = bl / 2;
        head.position.y = bl + o.headLen / 2;
        if (bodyO && headO) {
          bodyO.scale.y = bl + ow * 2;
          bodyO.position.y = bl / 2;
          headO.position.y = bl + o.headLen / 2 - ow * 0.4;
        }
      },
      /** 지금 화살표가 가리키는 방향(월드) */
      dir(): T.Vector3 {
        return up.clone().applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
      },
    };
  };

  // ── 받침, 자석 ──
  boxAt(4.9, 0.12, 3.5, std(0x223048, 0.25, 0.48), 0, BASE_Y - 0.06, 0.4);
  const magH = 2.1;
  const magY = BASE_Y + magH / 2;
  const magX = GAP + MAG_W / 2;
  const nMat = paint(0xe0503a);
  const sMat = paint(0x3d8fe8);
  const magL = boxAt(MAG_W, magH, MAG_D, nMat, -magX, magY, 0);
  const magR = boxAt(MAG_W, magH, MAG_D, sMat, magX, magY, 0);
  const lN = S.makeLabel("N극", { size: 0.6, color: "#FFFFFF" });
  const lS = S.makeLabel("S극", { size: 0.6, color: "#FFFFFF" });
  scene.add(lN, lS);

  // ── 회전축(받침 기둥은 두지 않는다: 코일 한가운데에 겹쳐 보였다) ──
  const steel = std(0xa6b6ce, 0.68, 0.28);
  rodBetween(v3(0, 0, -D - 0.45), v3(0, 0, COM_Z0 + COM_LEN + 0.25), 0.05, steel, scene);

  // ── 코일(축을 따라 돈다: 두 활성 변은 주황/보라로 구분해 수직 통과 뒤 전류·힘 유지를 쉽게 관찰한다) ──
  const coil = new THREE.Group();
  scene.add(coil);
  const copper = std(0xe2984c, 0.65, 0.28);
  const sideAMat = std(0xff922b, 0.44, 0.28); // 변 a: 주황
  const sideBMat = std(0xb197fc, 0.44, 0.28); // 변 b: 보라
  rodBetween(v3(-R, 0, -D), v3(-R, 0, D), ROD * 1.18, sideAMat, coil); // 변 a(주황)
  rodBetween(v3(R, 0, -D), v3(R, 0, D), ROD * 1.18, sideBMat, coil); // 변 b(보라)
  rodBetween(v3(-R, 0, -D), v3(R, 0, -D), ROD, copper, coil); // 뒤 변
  rodBetween(v3(-R, 0, D), v3(-COM_R, 0, D), ROD, copper, coil); // 앞 변(왼쪽 토막)
  rodBetween(v3(R, 0, D), v3(COM_R, 0, D), ROD, copper, coil); // 앞 변(오른쪽 토막)
  rodBetween(v3(-COM_R, 0, D), v3(-COM_R, 0, COM_Z0 + 0.04), ROD * 0.8, copper, coil); // 정류자로 가는 끝
  rodBetween(v3(COM_R, 0, D), v3(COM_R, 0, COM_Z0 + 0.04), ROD * 0.8, copper, coil);
  const eboniteHub = new THREE.Mesh(new THREE.CylinderGeometry(COM_R * 0.86, COM_R * 0.86, COM_LEN * 1.06, 24), std(0x19202e, 0.1, 0.76));
  eboniteHub.rotation.x = Math.PI / 2;
  eboniteHub.position.z = COM_Z0 + COM_LEN / 2;
  coil.add(eboniteHub);
  for (const c of [Math.PI / 2, (3 * Math.PI) / 2]) {
    // 정류자: 둘로 나뉜 고리(코일과 함께 돈다). 원기둥을 z축으로 눕히면 각 π/2가 +x(오른쪽), 3π/2가 −x(왼쪽)다
    const half = new THREE.Mesh(new THREE.CylinderGeometry(COM_R, COM_R, COM_LEN, 28, 1, false, c - 1.32, 2.64), std(0xcf8438, 0.72, 0.26));
    half.rotation.x = Math.PI / 2;
    half.position.z = COM_Z0 + COM_LEN / 2;
    coil.add(half);
  }
  // 브러시 + 황동 홀더(돌지 않는다): 정류자의 왼쪽과 오른쪽에 닿아 있다
  for (const sx of [-1, 1]) {
    boxAt(0.12, 0.12, 0.2, std(0x363f50, 0.16, 0.76), sx * (COM_R + 0.06), 0, COM_Z0 + COM_LEN / 2);
    boxAt(0.08, 0.14, 0.22, std(0xe2b454, 0.76, 0.26), sx * (COM_R + 0.14), 0, COM_Z0 + COM_LEN / 2);
  }

  /** 코일 면 안쪽에 놓이는 얇은 2D 평면 전류 화살표(도선과 겹치거나 Z-fighting 없이 선명하게 읽힌다).
   *  로컬 XZ 평면에서 +Z를 향해 만들고 set(center, dirOnXZ, len)으로 배치한다. */
  const flatCurArrow = (shaftW: number, headW: number, headL: number) => {
    const g = new THREE.Group();
    const makeShape = (len: number, pad: number): T.Shape => {
      const halfL = len / 2;
      const hl = Math.min(headL + pad * 1.4, len * 0.55);
      const sw = shaftW / 2 + pad;
      const hw = headW / 2 + pad * 1.35;
      const neck = halfL - hl;
      const sh = new THREE.Shape();
      sh.moveTo(-sw, -halfL - pad);
      sh.lineTo(sw, -halfL - pad);
      sh.lineTo(sw, neck);
      sh.lineTo(hw, neck);
      sh.lineTo(0, halfL + pad * 1.6);
      sh.lineTo(-hw, neck);
      sh.lineTo(-sw, neck);
      sh.closePath();
      return sh;
    };
    const fillMat = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide });
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x4e2b0c, side: THREE.DoubleSide });
    let fillMesh: T.Mesh | null = null;
    let rimMesh: T.Mesh | null = null;
    const build = (len: number): void => {
      if (fillMesh) {
        fillMesh.geometry.dispose();
        g.remove(fillMesh);
      }
      if (rimMesh) {
        rimMesh.geometry.dispose();
        g.remove(rimMesh);
      }
      const rimGeo = new THREE.ShapeGeometry(makeShape(len, 0.022));
      rimGeo.rotateX(Math.PI / 2); // XY 평면(+Y 앞) → XZ 평면(+Z 앞)
      const fillGeo = new THREE.ShapeGeometry(makeShape(len, 0));
      fillGeo.rotateX(Math.PI / 2);
      rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -0.004;
      fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.y = 0.004;
      // 아래쪽 면에서도 노란 몸통이 테두리 위에 보이도록 반대쪽 얇은 면 추가
      const fillBot = new THREE.Mesh(fillGeo, fillMat);
      fillBot.position.y = -0.01;
      g.add(rimMesh, fillMesh, fillBot);
    };
    let builtLen = -1;
    return {
      g,
      set(center: T.Vector3, dir: T.Vector3, len: number): void {
        if (Math.abs(len - builtLen) > 0.001) {
          build(len);
          builtLen = len;
        }
        g.position.copy(center);
        // 로컬 +Z를 dir(XZ 평면 단위벡터)로 회전
        g.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
      },
    };
  };

  // ── 화살표: 전류(코일 안쪽 얇은 2D 화살표), 힘(청록), 자기장(빨강) ──
  const sideA = flatCurArrow(0.068, 0.21, 0.25);
  const sideB = flatCurArrow(0.068, 0.21, 0.25);
  const backArr = flatCurArrow(0.056, 0.17, 0.2);
  const frontL = flatCurArrow(0.052, 0.15, 0.17);
  const frontR = flatCurArrow(0.052, 0.15, 0.17);
  coil.add(sideA.g, sideB.g, backArr.g, frontL.g, frontR.g);
  const forceA = { color: 0x3fd6c0, body: 0.06, head: 0.15, headLen: 0.28, outline: 0x0b2a33, onTop: true };
  const fLeft = fatArrow(forceA);
  const fRight = fatArrow(forceA);
  scene.add(fLeft.g, fRight.g);
  const fieldArr = [0.5, -0.5].map(() => fatArrow({ color: 0xff7b6b, body: 0.035, head: 0.1, headLen: 0.22, opacity: 0.75 }));
  fieldArr.forEach((a) => scene.add(a.g));
  const lField = S.makeLabel("자기장", { size: 0.46, color: "#FFB3A6" });
  const lCur = S.makeLabel("전류", { size: 0.46, color: "#FFD98A" });
  const lAxis = S.makeLabel("회전축", { size: 0.42, color: "#C9D6EC" });
  const lF1 = S.makeLabel("힘", { size: 0.5, color: "#8FF0DF" });
  const lF2 = S.makeLabel("힘", { size: 0.5, color: "#8FF0DF" });
  lAxis.position.set(0.46, -0.42, COM_Z0 + COM_LEN + 0.12); // 정류자 앞으로 나온 축 끝의 오른쪽 아래(뒤에 두면 뒤 변의 전류 화살표를 덮는다)
  scene.add(lField, lCur, lAxis, lF1, lF2);

  // 상태 글(무대 왼쪽 위)
  const tag = document.createElement("div");
  tag.className = "g2u7x-tag";
  box.appendChild(tag);

  // 카메라: 앞에서 오른쪽으로 az만큼, 위로 el만큼 고정. 검산: 오른쪽 변 가운데(1, 0, 0)와 뒤 끝(1, 0, −D)에서 카메라로 가는 선은
  // 자석 안쪽 면(x = GAP)을 지날 때 높이 1.4 남짓이라 자석 윗면(약 1.04)보다 높다. az를 0.45로 키우면 뒤 끝이 S극에 가린다.
  const target = v3(0, 0.02, 0.3);
  const az = 0.32;
  const el = 0.45;
  const dist = 7.15;
  camera.position.set(target.x + dist * Math.sin(az) * Math.cos(el), target.y + dist * Math.sin(el), target.z + dist * Math.cos(az) * Math.cos(el));
  camera.lookAt(target);

  // 이번 프레임에 계산한 벡터(검사용)
  let last: Record<string, unknown> = {};
  const devCv = cv as unknown as { __motor?: () => unknown };
  if (import.meta.env.DEV) devCv.__motor = () => last;

  function render(v: MotorView): void {
    const w = box.clientWidth || 346;
    const h = box.clientHeight || 230;
    // 크기나 넓은 화면의 무대 배율이 바뀌었을 때만 다시 잡는다(three는 캔버스 크기를 내림으로 잡는다)
    if (cv.width !== Math.floor(w * S.stagePixelRatio(cv, w, h))) stage.resize(w, h);
    const c = Math.cos(v.th);
    const s = Math.sin(v.th);
    coil.rotation.z = v.th;
    // 자석
    const B = v3(v.nLeft ? 1 : -1, 0, 0);
    magL.material = v.nLeft ? nMat : sMat;
    magR.material = v.nLeft ? sMat : nMat;
    lN.position.set(v.nLeft ? -magX : magX, magY + 0.05, MAG_D / 2 + 0.1);
    lS.position.set(v.nLeft ? magX : -magX, magY + 0.05, MAG_D / 2 + 0.1);
    // 자기장(N극에서 S극으로), 코일 뒤쪽 두 줄
    fieldArr.forEach((a, i) => a.set(v3(-B.x * 1.32, i === 0 ? 0.5 : -0.5, -D - 0.32), B, 2.64));
    lField.position.set(-B.x * 0.62, 0.84, -D - 0.32);
    // 변 a(코일 틀에서 x = −R)가 왼쪽에 있나. 왼쪽에 온 변에는 늘 같은 방향의 전류(cur = 1이면 −z)
    const aLeft = c >= 0;
    const aZ = (aLeft ? -1 : 1) * v.cur; // 변 a의 전류(z 방향)
    const Ia = v3(0, 0, aZ);
    const Ib = v3(0, 0, -aZ);
    const backX = -aZ; // 뒤 변: 변 a 쪽에서 뒤로 온 전류가 변 b 쪽으로(코일 틀의 x)
    const frontX = aZ;
    // 코일 안쪽의 얇은 2D 전류 화살표(도선과 겹치지 않고 코일 테두리 바로 안쪽을 따라 선명하게 흐른다)
    const L = 1.08;
    sideA.set(v3(-R + 0.22, 0, 0), Ia, L);
    sideB.set(v3(R - 0.22, 0, 0), Ib, L);
    backArr.set(v3(0.45, 0, -D + 0.2), v3(backX, 0, 0), 0.62);
    frontL.set(v3(-0.56, 0, D - 0.2), v3(frontX, 0, 0), 0.48);
    frontR.set(v3(0.56, 0, D - 0.2), v3(frontX, 0, 0), 0.48);
    for (const a of [sideA, sideB, backArr, frontL, frontR]) a.g.visible = v.on;
    // 양쪽 변의 자리(월드)와 힘 = 전류 × 자기장
    const pa = v3(-R * c, -R * s, F_Z);
    const pb = v3(R * c, R * s, F_Z);
    const Fa = new THREE.Vector3().crossVectors(Ia, B);
    const Fb = new THREE.Vector3().crossVectors(Ib, B);
    const [pL, FL, pR, FR] = aLeft ? [pa, Fa, pb, Fb] : [pb, Fb, pa, Fa];
    const FLEN = 0.8; // 코일이 세워질 때(위 변이 y = 1)도 화살표 끝이 무대 안에 들게
    fLeft.set(pL.clone().addScaledVector(FL, ROD + 0.02), FL, FLEN);
    fRight.set(pR.clone().addScaledVector(FR, ROD + 0.02), FR, FLEN);
    fLeft.g.visible = v.on;
    fRight.g.visible = v.on && v.rightForce;
    // 이름표는 붙잡고 있을 때만(돌 때는 화살표가 양쪽 변을 따라 자리를 바꿔 이름표가 어지럽다)
    lF1.visible = fLeft.g.visible && v.held;
    lF2.visible = fRight.g.visible && v.held;
    lF1.position.copy(pL).addScaledVector(FL, FLEN + 0.3);
    lF2.position.copy(pR).addScaledVector(FR, FLEN + 0.3);
    // 전류 이름표: 왼쪽 변의 앞쪽 곁(붙잡고 있을 때만)
    lCur.visible = v.on && v.held;
    lCur.position.set(pL.x - 0.38, pL.y + 0.2, 0.55);
    lAxis.visible = v.held; // 돌 때는 숨긴다(세워진 코일의 아래 변 힘 화살표에 겹친다)
    tag.textContent = v.tag;
    tag.style.display = v.tag ? "" : "none";
    stage.render();
    if (import.meta.env.DEV) {
      // 축을 가로지르는 앞뒤 변(월드 전류)과 그 힘: 축 방향(z)뿐이고 θ = 0이면 0이다
      const Iback = v3(backX * c, backX * s, 0);
      const Ifront = v3(frontX * c, frontX * s, 0);
      const arr = (p: T.Vector3): number[] => [p.x, p.y, p.z].map((n) => Math.round(n * 1000) / 1000);
      last = {
        th: v.th,
        field: arr(B),
        left: { pos: arr(pL), cur: arr(aLeft ? Ia : Ib), force: arr(FL), drawn: arr(fLeft.dir()), shown: fLeft.g.visible },
        right: { pos: arr(pR), cur: arr(aLeft ? Ib : Ia), force: arr(FR), drawn: arr(fRight.dir()), shown: fRight.g.visible },
        back: { cur: arr(Iback), force: arr(new THREE.Vector3().crossVectors(Iback, B)) },
        front: { cur: arr(Ifront), force: arr(new THREE.Vector3().crossVectors(Ifront, B)) },
      };
    }
  }

  return {
    render,
    dispose(): void {
      tag.remove();
      if (import.meta.env.DEV) delete devCv.__motor;
      stage.dispose();
    },
  };
}
