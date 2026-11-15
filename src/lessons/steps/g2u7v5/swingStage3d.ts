// [중2 Ⅶ v5] g2u7l8 swingLab의 입체 무대(2026-11-15 그래픽 감사 C105. 전동기 입체 무대 motorStage3d와 같은 결).
// 말굽자석(가운데가 굽은 U자, 벌어진 쪽이 +x)을 옆으로 눕혀 받침에 놓고, 가로대에 매단 코일 그네의 아랫변이 두 극 사이를 지난다.
// 카메라는 책 그림 '전류의 방향이나 자기장의 방향이 바뀔 때 코일이 받는 힘'처럼 앞에서 조금 내려다보고 오른쪽으로 조금 틀어 고정한다.
//   손으로 끌어 돌리지 않는다(사용자가 거절한 방식. 전동기, 세포 입체 무대와 같은 결정).
// 화살표는 굵은 대와 테두리(전류 볼트 옐로 + 진갈색 테두리, 힘 청록 + 짙은 테두리, 자기장 빨강)이고, 힘 화살표는 늘 위에 그린다.
// three는 여기서 쓰지 않고 mountSwing3d 안에서 ui/space3d를 동적 import로 부른다(이 파일은 정적으로 불러도 번들이 늘지 않는다).
//
// 좌표(three의 오른손 좌표): x 오른쪽(자석의 벌어진 쪽), y 위, z 보는 사람 쪽(앞).
// 검산 메모(2026-11-15):
//   · 그네 아랫변은 z축과 나란하다. cur = −1(처음 방향)이면 전류 I = −z(뒤쪽으로). N극이 아래면 두 극 사이의 자기장 B = +y(아래 N극에서 위 S극으로).
//     힘 = I × B = (0, 0, −1) × (0, 1, 0) = (0·0 − (−1)·1, (−1)·0 − 0·0, 0·1 − 0·0) = (1, 0, 0), +x라 자석 바깥쪽이다(swingLab의 fx와 같다).
//   · 전류만 바꾸면 I = +z: (0, 0, 1) × (0, 1, 0) = (−1, 0, 0), 안쪽. 극만 바꾸면 B = −y라 안쪽. 둘 다 바꾸면 다시 바깥쪽.
//   · 오른손으로도 맞다: 네 손가락을 자기장(위)으로, 엄지를 전류(뒤쪽)로 두면 손바닥이 오른쪽(바깥쪽)을 향한다.

import type * as T from "three";

export interface SwingView {
  /** 스위치를 누르고 있다(전류가 흐른다) */
  held: boolean;
  /** 그네 아랫변의 전류(z 방향). −1이 처음 방향(뒤쪽으로) */
  cur: 1 | -1;
  /** N극이 아래 */
  nBottom: boolean;
  strong: boolean;
  /** 그네가 가로대를 축으로 돈 각(+면 아랫변이 +x, 바깥쪽) */
  angle: number;
  /** 힘의 x 방향(+1 바깥쪽) */
  out: number;
  /** 무대 위 상태 글 */
  tag: string;
}
export interface Swing3d {
  render(v: SwingView): void;
  dispose(): void;
}

let glOk: boolean | null = null;
/** 이 기기에서 입체 무대를 쓸 수 있는가(three는 WebGL2만 쓴다). 세션 저장소 ss.swingflat = "1"이면 평면 무대로(비교해 보기용). */
export function canSwing3d(): boolean {
  try {
    if (sessionStorage.getItem("ss.swingflat") === "1") return false;
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

// 치수
export const SW = {
  /** 두 팔의 가운데 높이(±), 두께, 깊이 */
  armY: 0.78,
  armT: 0.42,
  depth: 1.0,
  /** 팔이 시작하는 곳(굽은 몸통의 가운데)과 극의 끝 */
  bendX: -1.25,
  tipX: 0.8,
  /** 그네: 가로대 높이, 아랫변의 x, 반 너비(z) */
  pivotY: 2.5,
  wireX: 0.25,
  half: 0.85,
  /** 받침 윗면 */
  baseY: -1.0,
};

/** 무대(캔버스)에 전기 그네를 올린다. 입체 무대를 열 수 없으면 null(호출부가 평면 무대를 그린다). */
export async function mountSwing3d(cv: HTMLCanvasElement, box: HTMLElement): Promise<Swing3d | null> {
  const S = await import("../../../ui/space3d");
  const THREE = S.THREE;
  const made = S.createSpaceStage(cv, { fov: 34 });
  if (!made) return null;
  const stage = made;
  const { scene, camera } = stage;
  scene.add(new THREE.AmbientLight(0xffffff, 1.45));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(3, 7, 6);
  scene.add(sun);

  const std = (color: number, metal = 0.1, rough = 0.55): T.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
  const boxAt = (w: number, h: number, d: number, mat: T.Material, x: number, y: number, z: number, parent: T.Object3D = scene): T.Mesh => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const v3 = (x: number, y: number, z: number): T.Vector3 => new THREE.Vector3(x, y, z);
  const rodBetween = (a: T.Vector3, b: T.Vector3, r: number, mat: T.Material, parent: T.Object3D): T.Mesh => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 14), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(v3(0, 1, 0), b.clone().sub(a).normalize());
    parent.add(m);
    return m;
  };
  /** 굵은 화살표(원기둥 대 + 원뿔 머리, 테두리는 뒷면을 칠한 조금 큰 껍데기). +y를 향해 만들고 돌려 놓는다. onTop이면 늘 위에 그린다. */
  const fatArrow = (o: { color: number; body: number; head: number; headLen: number; outline?: number; opacity?: number; onTop?: boolean }) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: o.color, transparent: o.opacity !== undefined, opacity: o.opacity ?? 1 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(o.body, o.body, 1, 12), mat);
    const head = new THREE.Mesh(new THREE.ConeGeometry(o.head, o.headLen, 18), mat);
    g.add(body, head);
    let bodyO: T.Mesh | null = null;
    let headO: T.Mesh | null = null;
    const ow = 0.024;
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
      dir(): T.Vector3 {
        return up.clone().applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
      },
    };
  };

  // ── 받침. 그네를 매단 틀(기둥, 가로대)은 그리지 않는다: 무대를 차지해 요점(자석 사이의 아랫변과 화살표)을 가렸다.
  //    그네의 두 옆변이 무대 위쪽 밖으로 뻗어 매달려 있음을 보인다 ──
  const { armY, armT, depth, bendX, tipX, pivotY, wireX, half, baseY } = SW;
  boxAt(4.6, 0.12, 3.0, std(0x26324b), -0.35, baseY - 0.06, 0);

  // ── 말굽자석: 굽은 몸통(회색 쇠)과 두 팔(극의 색) ──
  const ro = armY + armT / 2; // 굽은 몸통의 바깥 반지름
  const ri = armY - armT / 2; // 안쪽 반지름
  const bend = new THREE.Shape();
  bend.absarc(0, 0, ro, Math.PI / 2, (3 * Math.PI) / 2, false);
  bend.absarc(0, 0, ri, (3 * Math.PI) / 2, Math.PI / 2, true);
  const bendGeo = new THREE.ExtrudeGeometry(bend, { depth, bevelEnabled: false, curveSegments: 28 });
  const bendMesh = new THREE.Mesh(bendGeo, std(0xa7b2c4, 0.55, 0.38));
  bendMesh.position.set(bendX, 0, -depth / 2);
  scene.add(bendMesh);
  const armLen = tipX - bendX;
  const topMat = std(0x3d8fe8, 0.05, 0.6);
  const botMat = std(0xe0503a, 0.05, 0.6);
  boxAt(armLen, armT, depth, topMat, bendX + armLen / 2, armY, 0);
  boxAt(armLen, armT, depth, botMat, bendX + armLen / 2, -armY, 0);
  const lTop = S.makeLabel("S극", { size: 0.46, color: "#FFFFFF" });
  const lBot = S.makeLabel("N극", { size: 0.46, color: "#FFFFFF" });
  scene.add(lTop, lBot);

  // ── 그네(가로대를 축으로 흔들린다) ──
  const swing = new THREE.Group();
  swing.position.set(wireX, pivotY, 0);
  scene.add(swing);
  const copper = std(0xd9944a, 0.5, 0.4);
  rodBetween(v3(0, 0, half), v3(0, -pivotY, half), 0.035, copper, swing);
  rodBetween(v3(0, 0, -half), v3(0, -pivotY, -half), 0.035, copper, swing);
  rodBetween(v3(0, -pivotY, -half - 0.035), v3(0, -pivotY, half + 0.035), 0.05, copper, swing);

  // ── 화살표 ──
  // 자기장은 두 극 사이 앞쪽 면에 둘. 힘이 향하는 쪽의 반대편에 둔다(책 그림처럼. 힘 화살표와 겹치지 않게)
  const fieldArr = [0, 1].map(() => fatArrow({ color: 0xff7b6b, body: 0.042, head: 0.105, headLen: 0.2, opacity: 0.92 }));
  fieldArr.forEach((a) => scene.add(a.g));
  const curArr = fatArrow({ color: 0xffd400, body: 0.062, head: 0.135, headLen: 0.27, outline: 0x6e3f16 });
  const forceArr = fatArrow({ color: 0x3fd6c0, body: 0.07, head: 0.165, headLen: 0.31, outline: 0x0b2a33, onTop: true });
  swing.add(curArr.g, forceArr.g);
  const lField = S.makeLabel("자기장", { size: 0.42, color: "#FFB3A6" });
  const lCur = S.makeLabel("전류", { size: 0.42, color: "#FFD98A" });
  const lForce = S.makeLabel("힘", { size: 0.48, color: "#8FF0DF" });
  scene.add(lField, lCur);
  swing.add(lForce);

  // 상태 글(무대 왼쪽 위)
  const tag = document.createElement("div");
  tag.className = "g2u7x-tag";
  box.appendChild(tag);

  // 카메라: 앞에서 오른쪽으로 az만큼, 위로 el만큼 고정(전동기 무대와 같은 결). 자석과 아랫변이 무대를 채우게 가까이 둔다
  // az는 전동기 무대(0.32)보다 크게 튼다: 아랫변(전류, z)이 카메라 쪽으로 너무 줄어 보여 방향이 읽히지 않았다(0.42에서 겪음).
  // 이름표 자리는 이 카메라로 무대 좌표(346×230)에 투영해 서로, 극 이름표, 왼쪽 위 상태 글과 겹치지 않게 골랐다(아래 render의 주석).
  const target = v3(-0.15, 0.22, 0.1);
  const az = 0.78;
  const el = 0.38;
  const dist = 5.9;
  camera.position.set(target.x + dist * Math.sin(az) * Math.cos(el), target.y + dist * Math.sin(el), target.z + dist * Math.cos(az) * Math.cos(el));
  camera.lookAt(target);

  let last: Record<string, unknown> = {};
  const devCv = cv as unknown as { __swing?: () => unknown };
  if (import.meta.env.DEV) devCv.__swing = () => last;

  function render(v: SwingView): void {
    const w = box.clientWidth || 346;
    const h = box.clientHeight || 230;
    // 크기나 넓은 화면의 무대 배율이 바뀌었을 때만 다시 잡는다(three는 캔버스 크기를 내림으로 잡는다)
    if (cv.width !== Math.floor(w * S.stagePixelRatio(cv, w, h))) stage.resize(w, h);
    const by = v.nBottom ? 1 : -1; // 자기장(N극에서 S극)
    topMat.color.setHex(v.nBottom ? 0x3d8fe8 : 0xe0503a);
    botMat.color.setHex(v.nBottom ? 0xe0503a : 0x3d8fe8);
    const I = v3(0, 0, v.cur);
    const B = v3(0, by, 0);
    const F = new THREE.Vector3().crossVectors(I, B); // 힘 = 전류 × 자기장
    const side = F.x >= 0 ? 1 : -1; // 힘이 향하는 쪽(+1 바깥쪽)
    // 이름표 자리(이 카메라로 투영한 무대 좌표 346×230): 위 팔의 극 이름표는 윗면 가운데 (171, 59), 아래 팔은 앞면의 굽은 몸통 쪽 (120, 163),
    // 자기장 안쪽 (115, 120)·극 끝 쪽 (230, 171), 전류 뒤쪽 끝 위 (231~271, 86~100, 그네를 따라감)·앞쪽 끝 오른쪽 아래 (166, 200),
    // 힘은 바깥쪽이면 화살표 끝 오른쪽 아래 (275~313, 181), 안쪽이면 화살표 끝 왼쪽 위 (119~134, 74~91. 끝의 왼쪽 아래는 앞쪽으로 흐르는 전류 화살표의 머리 자리).
    // 상태 글은 왼쪽 위(y 38까지)라 모두 그 아래다. 여덟 경우(전류 둘 × 극 둘 × 세기 둘)에서 이름표끼리 겹치지 않고 무대 밖으로 나가지 않는다.
    // 극의 이름표는 극이 바뀌면 자리만 맞바꾼다
    const upPos = v3(-0.3, ro + 0.08, 0);
    const downPos = v3(bendX + 0.25, -armY, depth / 2 + 0.05);
    lTop.position.copy(v.nBottom ? upPos : downPos);
    lBot.position.copy(v.nBottom ? downPos : upPos);
    // 자기장: 두 극 사이 앞쪽 면에 둘, 힘이 향하는 쪽의 반대편(바깥쪽으로 밀리면 안쪽, 안쪽으로 밀리면 극 끝 쪽)
    const span = 2 * ri - 0.12;
    const fxs = side > 0 ? [-0.18, -0.55] : [0.5, 0.7];
    fieldArr.forEach((a, i) => a.set(v3(fxs[i], -by * (span / 2), depth / 2 - 0.08), B, span));
    lField.position.set(side > 0 ? -1.08 : tipX + 0.5, 0, depth / 2 + 0.05);
    // 그네
    swing.rotation.z = v.angle;
    swing.updateMatrix();
    const yb = -pivotY;
    // 전류 화살표는 아랫변 가운데에서 머리 쪽 끝까지(가운데에서 나가는 힘 화살표와 겹치지 않게)
    curArr.set(v3(0, yb + 0.1, v.cur * 0.1), I, 0.8);
    const flen = v.strong ? 1.05 : 0.85;
    forceArr.set(v3(F.x * 0.07, yb, 0), F, flen);
    if (side > 0) lForce.position.set(flen + 0.18, yb - 0.4, 0);
    else lForce.position.set(-(flen + 0.32), yb + 0.18, 0);
    // 전류 이름표: 화살표 머리가 있는 끝 쪽(뒤쪽이면 극 끝 위 빈자리에서 그네를 따라가고, 앞쪽이면 아랫변 앞 끝의 오른쪽 아래)
    if (v.cur < 0) lCur.position.copy(v3(0, yb + 0.3, -1.25).applyMatrix4(swing.matrix));
    else lCur.position.set(0.6, -0.55, 1.0);
    curArr.g.visible = v.held;
    forceArr.g.visible = v.held;
    lCur.visible = v.held;
    lForce.visible = v.held;
    tag.textContent = v.tag;
    stage.render();
    if (import.meta.env.DEV) {
      const arr = (p: T.Vector3): number[] => [p.x, p.y, p.z].map((n) => Math.round(n * 1000) / 1000);
      last = { field: arr(B), cur: arr(I), force: arr(F), drawn: arr(forceArr.dir()), shown: forceArr.g.visible, out: v.out };
    }
  }

  return {
    render,
    dispose(): void {
      tag.remove();
      if (import.meta.env.DEV) delete devCv.__swing;
      stage.dispose();
    },
  };
}
