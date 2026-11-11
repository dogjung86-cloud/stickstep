// 개념 설명의 원형 스틱맨 쌤 5종 + 계정 관리 화면의 책 읽는 그림.
// 쌤은 만화와 같은 인물(삐친 머리 + 둥근 안경 + 흰 가운)에 표정을 켠 모습이다.
// 44px 원 안에서도 읽히도록 작은 그림은 떨림을 줄이고 선을 굵게 긋는다(wobK, lwK).
import { Sk, C, curve, dense, poly, rrect, qmark, rays, sparkle } from "../lib/sk.mjs";
import { drawFigure, drawHead, pose, TEACHER, KID } from "../lib/figure.mjs";
import { openBook } from "../lib/props.mjs";

const SMALL = { wobK: 0.45, lwK: 1.22, tex: false, tol: 0.2 };
const T = (face, extra = {}) => ({ ...TEACHER, face, ...extra });

// 상반신: 240×240. 지름 44px 원에 들어가므로 머리가 원을 거의 채우게 잡는다. 어깨는 가운 깃만 보인다.
const BH = { s: 0.92, x: 120, y: 143 };
function bust(id, face, deco, tilt = 0) {
  const sk = new Sk(240, 240, { id, ...SMALL, lwK: 1.04 });
  const sh = curve([[-6, 270], [10, 244], [50, 230], [92, 224], [120, 232], [148, 224], [190, 230], [230, 244], [246, 270]], false, 4);
  sk.fill([...sh, sh[0]], C.white, { dx: 0, dy: 0, wob: 0.6, seed: 201 });
  sk.ink(sh, { w: 11, seed: 202, wob: 1 });
  sk.at(BH.x, BH.y, BH.s, () => drawHead(sk, T(face)), tilt);
  if (deco) deco(sk);
  return sk;
}
// 온몸: 240×330
function full(id, face, P, deco) {
  const sk = new Sk(240, 330, { id, ...SMALL, lwK: 1.3 });
  drawFigure(sk, 116, 322, 0.5, P, T(face));
  if (deco) deco(sk);
  return sk;
}

export function avatars() {
  return [
    { name: "smile", sk: bust("va", "smile") },
    { name: "surprised", sk: bust("vb", "wide", sk => {
      rays(sk, BH.x, BH.y, 104, 118, 2, { a0: -2.46, a1: -2.2, color: C.ink, w: 8 });
      rays(sk, BH.x, BH.y, 104, 118, 2, { a0: -0.94, a1: -0.68, color: C.ink, w: 8 });
    }) },
    { name: "curious", sk: bust("vc", "curious", sk => qmark(sk, 196, 58, 0.52, { color: C.teal, w: 17 }), 0.1) },
    { name: "wave", sk: full("vd", "happy", pose({ elL: [-100, -344], haL: [-158, -432], tilt: -0.05 }), sk => {
      sk.ink(curve([[12, 96], [4, 108], [8, 122]]), { w: 7, color: C.gray, seed: 3, wob: 0.3 });
      sk.ink(curve([[62, 78], [72, 88], [72, 102]]), { w: 7, color: C.gray, seed: 4, wob: 0.3 });
    }) },
    { name: "cheer", sk: full("ve", "happy", pose({ elL: [-104, -362], haL: [-156, -452], elR: [104, -362], haR: [156, -452], tilt: 0.04 }), sk => {
      sparkle(sk, 22, 60, 12, { seed: 5, w: 6 });
      sparkle(sk, 214, 44, 10, { seed: 7, w: 6 });
    }) },
  ];
}

// 계정 관리 화면: 책상다리로 앉아 책을 읽는 모습 (560×500)
export function reading() {
  const sk = new Sk(560, 500, { id: "ra" });
  // 책 더미
  const stack = [[C.red, 0], [C.yellow, 8], [C.blue, -6]];
  stack.forEach(([col, dx], i) => {
    const b = rrect(404 + dx, 438 - i * 34, 124, 32, 7);
    sk.fill(b, col, { seed: 11 + i, tex: true, texAng: 0.02 }); sk.ink(b, { w: 9, seed: 21 + i });
    sk.ink(dense([[424 + dx, 444 - i * 34], [424 + dx, 464 - i * 34]]), { w: 5, color: C.white, seed: 31 + i, wob: 0.3 });
  });
  const fx = 232, fy = 468, fs = 1.04;
  const P = pose({ hip: [0, -36], neck: [0, -164], head: [0, -258], tilt: 0.04, knL: [-104, -36], ftL: [34, -4], knR: [104, -36], ftR: [-34, -4],
    elL: [-96, -112], haL: [-118, -66], elR: [96, -112], haR: [118, -66] });
  drawFigure(sk, fx, fy, fs, P, { ...KID, face: "happy", bare: true, hands: false });
  openBook(sk, fx, fy - fs * 22, 1.46, { color: C.teal, seed: 41 });
  sparkle(sk, 60, 150, 15, { seed: 45 });
  sparkle(sk, 402, 96, 12, { seed: 47 });
  return sk;
}
