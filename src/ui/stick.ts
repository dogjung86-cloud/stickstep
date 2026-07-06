// 캔버스 스틱맨 — V 단원(힘) 랩의 배우. 만화·아바타와 같은 손그림 라인 감성을
// 다크 무대 위에 흰 잉크로 그린다. 포즈는 파라미터(기울기·팔다리 각도)로 물리에 반응한다.
// 좌표계: (x, y) = 발바닥 기준점(지면), h = 키. flip = true면 왼쪽을 보고 섬.

const TAU = Math.PI * 2;

export interface StickPose {
  lean: number; // 몸통 기울기(rad). +면 진행 방향(오른쪽)으로 숙임, -면 뒤로 젖힘
  armF: number; // 앞팔 각도(어깨 기준, 0=수평 앞, +아래)
  armB: number; // 뒷팔 각도
  legF: number; // 앞다리 벌림(엉덩이 기준, 0=수직, +앞)
  legB: number; // 뒷다리 벌림(-뒤)
  kneeBend?: number; // 무릎 굽힘 0~1 (버티는 자세)
  headBob?: number; // 머리 미세 움직임(px)
}

export interface StickJoints {
  head: { x: number; y: number };
  shoulder: { x: number; y: number };
  hip: { x: number; y: number };
  handF: { x: number; y: number };
  handB: { x: number; y: number };
}

export interface StickOpts {
  color?: string; // 기본 잉크색(다크 무대용 밝은 회백)
  lineWidth?: number;
  flip?: boolean; // true = 왼쪽을 바라봄
  face?: "none" | "dot"; // 단순 눈점
  alpha?: number;
}

/** 스틱맨을 그리고 관절 좌표를 돌려준다(밧줄·상자 부착용). */
export function drawStickman(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  pose: StickPose,
  opts: StickOpts = {},
): StickJoints {
  const dir = opts.flip ? -1 : 1;
  const color = opts.color ?? "rgba(232,240,250,.95)";
  const lw = opts.lineWidth ?? Math.max(2.2, h * 0.045);
  const kb = pose.kneeBend ?? 0;

  const headR = h * 0.14;
  const legLen = h * 0.34 * (1 - kb * 0.18);
  const torsoLen = h * 0.34;
  const armLen = h * 0.3;

  // 엉덩이(다리 시작) — 무릎 굽힘만큼 낮아짐
  const hip = { x, y: y - legLen };
  // 어깨 — 몸통이 lean만큼 기움
  const shoulder = {
    x: hip.x + Math.sin(pose.lean) * torsoLen * dir,
    y: hip.y - Math.cos(pose.lean) * torsoLen,
  };
  const head = {
    x: shoulder.x + Math.sin(pose.lean) * headR * 1.7 * dir,
    y: shoulder.y - Math.cos(pose.lean) * headR * 1.7 + (pose.headBob ?? 0),
  };

  const armPt = (ang: number): { x: number; y: number } => ({
    x: shoulder.x + Math.cos(ang) * armLen * dir,
    y: shoulder.y + Math.sin(ang) * armLen,
  });
  const legPt = (spread: number): { x: number; y: number } => ({
    x: hip.x + Math.sin(spread) * legLen * dir,
    y,
  });
  const handF = armPt(pose.armF);
  const handB = armPt(pose.armB);
  const footF = legPt(pose.legF);
  const footB = legPt(pose.legB);

  ctx.save();
  ctx.globalAlpha = opts.alpha ?? 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 다리 (무릎 굽힘: 중간 관절을 진행 반대쪽으로 살짝)
  for (const foot of [footB, footF]) {
    ctx.beginPath();
    ctx.moveTo(hip.x, hip.y);
    if (kb > 0.04) {
      const kneeX = (hip.x + foot.x) / 2 + kb * h * 0.07 * dir;
      const kneeY = (hip.y + y) / 2 + kb * h * 0.03;
      ctx.quadraticCurveTo(kneeX, kneeY, foot.x, foot.y);
    } else {
      ctx.lineTo(foot.x, foot.y);
    }
    ctx.stroke();
  }
  // 몸통
  ctx.beginPath();
  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(shoulder.x, shoulder.y);
  ctx.stroke();
  // 팔 (뒤팔 먼저 — 겹침 순서)
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(handB.x, handB.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(handF.x, handF.y);
  ctx.stroke();
  // 머리(빈 원 — 손그림 감성)
  ctx.beginPath();
  ctx.arc(head.x, head.y, headR, 0, TAU);
  ctx.stroke();
  if (opts.face === "dot") {
    ctx.beginPath();
    ctx.arc(head.x + headR * 0.42 * dir, head.y - headR * 0.12, lw * 0.55, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  return { head, shoulder, hip, handF, handB };
}

// ── 프리셋 포즈 ─────────────────────────────────────────────

/** 가만히 서서 미세하게 숨쉬기 */
export function poseStand(tMs: number, seed = 0): StickPose {
  const b = Math.sin(tMs / 600 + seed) * 0.02;
  return { lean: b, armF: 1.15, armB: 1.35, legF: 0.14, legB: -0.14, headBob: Math.sin(tMs / 600 + seed) * 0.8 };
}

/** 줄다리기 — 뒤로 젖혀 버티며 당김. effort 0~1(힘 쓸수록 더 젖히고 떨림) */
export function posePull(effort: number, tMs: number, seed = 0): StickPose {
  const jitter = effort * Math.sin(tMs / 55 + seed * 7) * 0.02;
  return {
    lean: -(0.32 + effort * 0.3) + jitter,
    armF: 0.12, // 앞으로 뻗어 줄을 잡음(수평)
    armB: 0.3,
    legF: 0.42 + effort * 0.12, // 앞다리 버팀
    legB: -0.1,
    kneeBend: 0.35 + effort * 0.3,
    headBob: jitter * 18,
  };
}

/** 상자 밀기 — 앞으로 숙이고 팔을 뻗어 민다. effort 0~1 */
export function posePush(effort: number, tMs: number, seed = 0): StickPose {
  const jitter = effort * Math.sin(tMs / 60 + seed * 5) * 0.018;
  return {
    lean: 0.34 + effort * 0.3 + jitter,
    armF: -0.06, // 수평으로 뻗음
    armB: 0.16,
    legF: 0.1,
    legB: -(0.44 + effort * 0.16), // 뒷다리로 강하게 버팀
    kneeBend: 0.3 + effort * 0.28,
    headBob: jitter * 16,
  };
}

/** 발차기 — phase 0~1 (백스윙→임팩트→팔로스루) */
export function poseKick(phase: number): StickPose {
  const p = Math.max(0, Math.min(1, phase));
  const swing = Math.sin((p - 0.35) * Math.PI * 1.6); // -~1
  return {
    lean: 0.1 + p * 0.12,
    armF: 0.9 - p * 0.5,
    armB: 1.5 + p * 0.3,
    legF: 0.12 + swing * 0.62, // 차는 다리
    legB: -0.16,
    kneeBend: 0.12,
  };
}
