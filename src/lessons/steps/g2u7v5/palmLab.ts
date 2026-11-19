// [중2 Ⅶ v5] g2u7l8 palmLab: 「손바닥으로 힘의 방향 찾기」 (가로 화면 3D 오른손 체험)
// 한 통찰: 말굽자석 코일 그네와 전동기 모두에서 오른손을 펴 네 손가락을 자기장(N→S), 엄지를 전류에 맞추면 손바닥이 힘의 방향을 가리킨다.
// 걸음:
//   세로 진입 화면(개요 그림 + 3개 미션 현황 + 가로 화면 열기 버튼)
//   → 가로 3D 무대(실제 말굽자석 코일 그네 2라운드 + 전동기 코일 1라운드에서 3D 오른손을 직접 맞춰 힘과 회전 방향을 예측·실행)
//   → 세로 복귀 후 확인 판정 2문항 + 핵심 정리.
// 좌표(three 오른손 좌표): +X 오른쪽, +Y 위, +Z 보는 사람 쪽(앞). 힘 F = I × B.
//   · 라운드 0(그네 ①): N극 아래(B = +Y), 전류 뒤(I = -Z) → F = (-Z)×(+Y) = +X(자석 바깥쪽).
//   · 라운드 1(그네 ②): N극 아래(B = +Y), 전류 앞(I = +Z) → F = (+Z)×(+Y) = -X(자석 안쪽).
//   · 라운드 2(전동기): N극 왼쪽(B = +X), 왼쪽 주황 변 전류 뒤(I = -Z → F = -Y 아래), 오른쪽 보라 변 전류 앞(I = +Z → F = +Y 위) → 시계 반대 방향 회전.
// three와 rotateStage는 열릴 때만 동적 import한다(초기 번들 분리). WebGL2가 없으면 같은 HUD/단계로 2D 캔버스 폴백을 그린다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { RotateStage } from "../../../ui/rotateStage";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { X, xArrow, xBox, xCanvas, xFrame, xLog, xText, type LabStep } from "./kit";
import {
  buildPalmHand3d,
  makeBadgeSprite3d,
  makeContactShadow3d,
  makeFatArrow3d,
  makeRoundedBoxGeo,
  rodBetween3d,
  setupStudioLights,
  targetQuatForPalm,
  type FatArrow3d,
  type PalmHand3d,
} from "./hand3d";

type RoundId = 0 | 1 | 2;
type StepKey =
  | "field"
  | "cur"
  | "force"
  | "done"
  | "m_left_align"
  | "m_left_force"
  | "m_right_force"
  | "m_spin";

type CamPreset = "iso" | "front" | "top";

interface Choice {
  id: string;
  label: string;
  tone: "field" | "cur" | "force" | "main";
  ok: boolean;
}

const CAM_SWING: Record<CamPreset, { az: number; el: number; dist: number; tx: number; ty: number; tz: number }> = {
  iso: { az: 0.56, el: 0.34, dist: 7.45, tx: 0.3, ty: -0.02, tz: 0.0 },
  front: { az: 0.12, el: 0.2, dist: 7.55, tx: 0.28, ty: -0.04, tz: 0.0 },
  top: { az: 0.36, el: 1.06, dist: 7.65, tx: 0.28, ty: -0.06, tz: 0.0 },
};

const CAM_MOTOR: Record<CamPreset, { az: number; el: number; dist: number; tx: number; ty: number; tz: number }> = {
  iso: { az: 0.34, el: 0.39, dist: 8.4, tx: 0.26, ty: -0.04, tz: 0.1 },
  front: { az: 0.08, el: 0.19, dist: 8.3, tx: 0.26, ty: -0.04, tz: 0.12 },
  top: { az: 0.22, el: 1.14, dist: 8.6, tx: 0.26, ty: -0.04, tz: 0.08 },
};

export const palmLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api, tall: true });
  const preview = xCanvas(f.stage);
  const tm = bvTimers();

  const completed = new Set<RoundId>();
  let judged = false;
  let rot: RotateStage | null = null;
  let stopLandscape: (() => void) | null = null;

  // 세로 진입 화면 조작 칸(208px 안에 깔끔하게 수용: 48 + 8 + 126 = 182px)
  const openBtn = bvBtn("main", "가로 화면으로 3D 오른손 체험 열기");
  const missionLog = xLog(
    [
      "1. 코일 그네 (전류 뒤쪽)",
      "2. 코일 그네 (전류 앞쪽)",
      "3. 전동기 코일 (양쪽 변 회전)",
    ],
    1,
    true,
  );
  f.slot.setControls(openBtn, missionLog.el);

  function syncPortraitLog(): void {
    ([0, 1, 2] as RoundId[]).forEach((id) => {
      if (completed.has(id)) missionLog.set(id, "완료");
      else missionLog.clear(id);
    });
    f.pips(Math.min(2, completed.size));
  }

  // 세로 화면 미리보기(346×230): 말굽자석 코일 그네 + 오른손 법칙 핵심 도식
  preview.run((ctx, w, _h, t) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    // 배경 은은한 스포트라이트
    const bg = ctx.createRadialGradient(173, 108, 12, 173, 115, 165);
    bg.addColorStop(0, "rgba(63,214,192,.14)");
    bg.addColorStop(1, "rgba(11,21,36,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 346, 230);

    // 왼쪽: 말굽자석과 코일 그네 일러스트
    const sw = Math.sin(t / 950) * 6;
    xBox(ctx, 26, 62, 74, 24, 6, "#3D8FE8", "rgba(255,255,255,.22)");
    xBox(ctx, 26, 134, 74, 24, 6, "#E0503A", "rgba(255,255,255,.22)");
    ctx.strokeStyle = "#9AA7BD";
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(36, 110, 36, Math.PI / 2, (3 * Math.PI) / 2, false);
    ctx.stroke();
    xText(ctx, "S극", 68, 74, { px: 12, w: 800, color: "#fff" });
    xText(ctx, "N극", 68, 146, { px: 12, w: 800, color: "#fff" });
    // 자기장 화살표(아래 → 위)
    xArrow(ctx, 56, 130, 56, 92, X.field, 2.2, 7);
    xArrow(ctx, 74, 130, 74, 92, X.field, 2.2, 7);
    // 코일 그네 도선
    ctx.strokeStyle = "#E09A4F";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(92, 24);
    ctx.lineTo(92 + sw, 112);
    ctx.stroke();
    ctx.fillStyle = "#FFD400";
    ctx.beginPath();
    ctx.arc(92 + sw, 112, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6E3F16";
    ctx.lineWidth = 2;
    ctx.stroke();
    xArrow(ctx, 102 + sw, 112, 144 + sw, 112, X.force, 3.2, 9);
    xText(ctx, "힘", 136 + sw, 98, { px: 12.5, w: 800, color: X.force });
    xText(ctx, "코일 그네", 82, 178, { px: 12, color: X.dim });

    // 오른쪽: 오른손 3요소 요약 카드
    xBox(ctx, 160, 36, 174, 152, 14, "rgba(255,255,255,.06)", "rgba(178,204,238,.28)");
    xText(ctx, "3D 오른손 맞추기", 247, 58, { px: 13.5, w: 800, color: "#FFE08A" });
    const rows: [string, string, string][] = [
      ["네 손가락", "자기장(N→S)", X.field],
      ["엄지", "전류의 방향", X.cur],
      ["손바닥", "받는 힘 방향", X.force],
    ];
    rows.forEach(([part, role, col], i) => {
      const y = 92 + i * 32;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(176, y, 4.8, 0, Math.PI * 2);
      ctx.fill();
      xText(ctx, part, 187, y, { px: 12.5, w: 800, color: col, align: "left" });
      xText(ctx, role, 324, y, { px: 12, color: X.ink, align: "right" });
    });

    const doneText = completed.size === 3 ? "3단계 모두 완료! 결과를 확인해요" : `완료한 체험 ${completed.size} / 3`;
    xText(ctx, doneText, 173, 212, { px: 12.5, w: 700, color: completed.size === 3 ? "#7FE3C4" : X.dim });
    ctx.restore();
  });

  // ── 세로 복귀 후 판정 2문항 ──
  function startVerdict(): void {
    judged = true;
    f.pips(2);
    f.say("3D 코일 그네와 전동기에서 오른손으로 힘의 방향을 모두 찾아냈어요! 배운 내용을 확인해 볼까요?");
    f.slot.ask(
      "오른손을 편 상태에서 네 손가락을 자기장 방향, 엄지손가락을 전류 방향에 맞추면 도선이 받는 힘의 방향은 어디인가요?",
      [
        { t: "손바닥이 향하는 방향", ok: true },
        { t: "손등이 향하는 방향" },
        { t: "엄지손가락이 향하는 방향" },
      ],
      (ok) => api.recordQuiz(ok),
      {
        why: "오른손에서 <b>네 손가락은 자기장(N→S)</b>, <b>엄지는 전류</b>, <b>손바닥은 힘</b>의 방향을 나타내요.",
        onNext: ask2,
      },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "말굽자석 사이 코일 그네에서 자석의 극은 그대로 두고 전류의 방향만 반대로 바꾸면 힘의 방향은 어떻게 되나요?",
      [
        { t: "반대 방향으로 바뀌어요", ok: true },
        { t: "처음과 같은 방향으로 계속 힘을 받아요" },
        { t: "힘이 사라져 움직이지 않아요" },
      ],
      () => undefined,
      {
        why: "네 손가락(자기장)은 그대로인데 엄지(전류)가 반대가 되면, 손바닥이 정반대를 향하므로 <b>힘의 방향도 반대</b>가 돼요.",
        onNext: finish,
      },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("오른손으로 코일 그네와 전동기의 힘 방향을 찾는 법을 완벽히 익혔어요!");
    f.slot.conclude(
      "오른손을 펴서 <b>네 손가락</b>을 자기장(N극→S극), <b>엄지손가락</b>을 전류 방향에 맞추면 <b>손바닥</b>이 향하는 쪽이 도선이 받는 <b>힘의 방향</b>이에요. 전동기에서는 양쪽 변의 전류 방향이 반대라 손바닥이 서로 반대를 향하면서 코일이 회전해요.",
    );
    api.enableCTA(s.cta ?? "다음");
  }

  // ── 가로 화면 3D 체험 열기 ──
  async function openLandscape(): Promise<void> {
    if (rot || judged) return;
    haptic(HAPTIC.tap);
    const [{ enterRotateStage }, S] = await Promise.all([
      import("../../../ui/rotateStage"),
      import("../../../ui/space3d"),
    ]);
    if (!tm.alive()) return;
    const THREE = S.THREE;

    let round: RoundId = completed.has(0) ? (completed.has(1) ? 2 : 1) : 0;
    let stp: StepKey = round === 2 ? "m_left_align" : "field";
    let camPreset: CamPreset = "iso";

    // 사용자 선택 벡터(3D 오른손 목표 자세)
    let handB = new THREE.Vector3(0, 1, 0);
    let handI = new THREE.Vector3(0, 0, -1);
    let handTargetPos = new THREE.Vector3(0.45, -0.04, 0.0);
    let handVisible = true;
    let handOpacityGoal = 0.9;
    let handOpacityCur = 0.0;
    let forceReveal = 0;
    let swingAngle = 0;
    let swingVel = 0;
    let motorTh = 0;
    let motorSpeed = 0;
    let motorLeftForceShown = false;
    let motorRightForceShown = false;
    let motorSpinning = false;
    let wrongFlash = 0;

    // 카메라 오빗 상태
    const camCur = { ...CAM_SWING.iso };
    const camGoal = { ...CAM_SWING.iso };
    let dragging = false;
    let dragLast = { x: 0, y: 0 };

    const cleanupLocal = (): void => {
      stopLandscape?.();
      stopLandscape = null;
      rot?.dispose();
      rot = null;
    };

    const rStage = enterRotateStage({
      title: "3D 오른손으로 힘의 방향 찾기",
      onLeave: () => {
        cleanupLocal();
        syncPortraitLog();
        if (completed.size === 3 && !judged) startVerdict();
        else if (!judged) {
          f.say(`지금까지 <b>${completed.size} / 3단계</b>를 완료했어요. <b>가로 화면으로 3D 오른손 체험 열기</b>를 눌러 남은 단계를 마저 체험해 보세요.`);
        }
      },
    });
    rot = rStage;
    const stageEl = rStage.stage;
    stageEl.classList.add("g2u7x-r3-stage");

    // 캔버스 생성
    const cv = el("canvas", { class: "g2u7x-r3-cv" }) as HTMLCanvasElement;
    stageEl.appendChild(cv);

    // ── 상단 HUD: 라운드 탭 + 시점 전환 ──
    const roundBtns = ([0, 1, 2] as RoundId[]).map((id) => {
      const names = ["1. 코일 그네 ①", "2. 코일 그네 ②", "3. 전동기 회전"];
      const b = el("button", { class: "g2u7x-r3-pill", text: names[id], attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.r = String(id);
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setupRound(id);
      });
      return b;
    });
    const camBtns = (["iso", "front", "top"] as CamPreset[]).map((k) => {
      const labels: Record<CamPreset, string> = { iso: "비스듬히", front: "앞에서", top: "위에서" };
      const b = el("button", { class: "g2u7x-r3-cam", text: labels[k], attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.cam = k;
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        camPreset = k;
        applyCamPreset();
        paintHud();
      });
      return b;
    });
    const topHud = el(
      "div",
      { class: "g2u7x-r3-top" },
      el("div", { class: "g2u7x-r3-group" }, ...roundBtns),
      el("div", { class: "g2u7x-r3-group" }, ...camBtns),
    );
    const sayBar = el("div", { class: "g2u7x-r3-say" });
    const stepBar = el("div", { class: "g2u7x-r3-steps" });
    const btnRow = el("div", { class: "g2u7x-r3-btns" });
    const dragHint = el("div", { class: "g2u7x-r3-hint", text: "화면을 끌어 3D 각도를 돌려 볼 수 있어요" });
    const dock = el("div", { class: "g2u7x-r3-dock" }, stepBar, btnRow);
    stageEl.append(topHud, sayBar, dragHint, dock);

    function applyCamPreset(): void {
      const src = round === 2 ? CAM_MOTOR[camPreset] : CAM_SWING[camPreset];
      Object.assign(camGoal, src);
    }

    // ── 3D 씬 구축 (WebGL2 가능 시) ──
    const glStage: SpaceStage | null = S.createSpaceStage(cv, { fov: 36 });
    let hand3d: PalmHand3d | null = null;
    let handPedestal: T.Group | null = null;
    let handPedRingMat: T.MeshBasicMaterial | null = null;
    let swingRoot: T.Group | null = null;
    let swingPendulum: T.Group | null = null;
    let swingCurArr: FatArrow3d | null = null;
    let swingForceArr: FatArrow3d | null = null;
    let swingFieldArrs: FatArrow3d[] = [];
    let swingCurBeads: T.Mesh[] = [];
    let swingPostF: T.MeshStandardMaterial | null = null;
    let swingPostB: T.MeshStandardMaterial | null = null;
    let motorRoot: T.Group | null = null;
    let motorCoilGroup: T.Group | null = null;
    let motorFL: FatArrow3d | null = null;
    let motorFR: FatArrow3d | null = null;
    let motorCurL: { g: T.Group; set: (center: T.Vector3, dir: T.Vector3) => void } | null = null;
    let motorCurR: { g: T.Group; set: (center: T.Vector3, dir: T.Vector3) => void } | null = null;
    let motorFocusRing: T.Mesh | null = null;
    let mSpL: T.Sprite | null = null;
    let mSpR: T.Sprite | null = null;

    if (glStage) {
      const { scene } = glStage;
      setupStudioLights(THREE, scene, { floorY: -1.48, grid: true });
      const std = (color: number, metal = 0.16, rough = 0.42): T.MeshStandardMaterial =>
        new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });
      const paint = (color: number, rough = 0.34): T.MeshPhysicalMaterial =>
        new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0.08, clearcoat: 0.22, clearcoatRoughness: 0.38 });

      // ━━━ A. 3D 말굽자석 코일 그네 무대 (왼쪽 배치: 오른손과 분리) ━━━
      swingRoot = new THREE.Group();
      swingRoot.position.set(-1.08, 0, 0);
      scene.add(swingRoot);

      // 받침대 + 바닥 접촉 그림자 + 상단 테두리 몰딩
      const sShadow = makeContactShadow3d(THREE, 2.55, 1.65, 0.48);
      sShadow.position.set(-0.2, -1.465, 0);
      swingRoot.add(sShadow);
      const sBase = new THREE.Mesh(makeRoundedBoxGeo(THREE, 4.46, 0.16, 2.74, 0.036), std(0x1f2d46, 0.28, 0.48));
      sBase.position.set(-0.2, -1.36, 0);
      const sBaseTop = new THREE.Mesh(makeRoundedBoxGeo(THREE, 4.34, 0.03, 2.62, 0.012), std(0x2c3f60, 0.35, 0.38));
      sBaseTop.position.set(-0.2, -1.275, 0);
      swingRoot.add(sBase, sBaseTop);

      // 말굽자석(브러시드 강철 곡선 요크 + 챔퍼 마감 S극 파랑 / N극 빨강)
      const armY = 0.88;
      const armT = 0.44;
      const depth = 1.15;
      const bendX = -1.35;
      const tipX = 0.88;
      const ro = armY + armT / 2;
      const ri = armY - armT / 2;
      const bendShape = new THREE.Shape();
      bendShape.absarc(0, 0, ro, Math.PI / 2, (3 * Math.PI) / 2, false);
      bendShape.absarc(0, 0, ri, (3 * Math.PI) / 2, Math.PI / 2, true);
      const bendGeo = new THREE.ExtrudeGeometry(bendShape, {
        depth: depth - 0.05,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.022,
        bevelSegments: 4,
        curveSegments: 36,
      });
      const steelMat = std(0xa5b6cf, 0.72, 0.28);
      const bendMesh = new THREE.Mesh(bendGeo, steelMat);
      bendMesh.position.set(bendX, 0, -(depth - 0.05) / 2);
      swingRoot.add(bendMesh);

      const armLen = tipX - bendX;
      const sArm = new THREE.Mesh(makeRoundedBoxGeo(THREE, armLen, armT, depth, 0.024), paint(0x3487e5));
      sArm.position.set(bendX + armLen / 2, armY, 0);
      const nArm = new THREE.Mesh(makeRoundedBoxGeo(THREE, armLen, armT, depth, 0.024), paint(0xe34b39));
      nArm.position.set(bendX + armLen / 2, -armY, 0);
      // 요크-자석 접합 메탈 심(Seam band)
      const seamS = new THREE.Mesh(makeRoundedBoxGeo(THREE, 0.045, armT + 0.012, depth + 0.012, 0.008), std(0xd0ddef, 0.78, 0.22));
      seamS.position.set(bendX + 0.02, armY, 0);
      const seamN = seamS.clone();
      seamN.position.set(bendX + 0.02, -armY, 0);
      swingRoot.add(sArm, nArm, seamS, seamN);

      const spS = makeBadgeSprite3d(THREE, "S극", { color: "#FFFFFF", border: "#7EC0FF", bg: "rgba(24,76,148,0.92)", scale: 0.3 });
      spS.position.set(-0.38, armY, depth / 2 + 0.18);
      const spN = makeBadgeSprite3d(THREE, "N극", { color: "#FFFFFF", border: "#FFA396", bg: "rgba(154,34,24,0.92)", scale: 0.3 });
      spN.position.set(-0.38, -armY, depth / 2 + 0.18);
      swingRoot.add(spS, spN);

      // 자기장 화살표(아래 N극 → 위 S극)
      const fSpan = 2 * ri - 0.14;
      swingFieldArrs = [-0.62, -0.18, 0.34].map((fx) => {
        const a = makeFatArrow3d(THREE, { color: 0xff7566, body: 0.032, head: 0.088, headLen: 0.18, opacity: 0.78 });
        a.set(new THREE.Vector3(fx, -fSpan / 2, -0.22), new THREE.Vector3(0, 1, 0), fSpan);
        swingRoot!.add(a.g);
        return a;
      });
      const spB = makeBadgeSprite3d(THREE, "자기장 (N→S)", { color: "#FFB7AD", border: "#FF7B6B", scale: 0.25 });
      spB.position.set(-1.12, 0.04, 0.62);
      swingRoot.add(spB);

      // 실험실 스탠드 기둥 + 상단 절연 가로대 + 황동 걸림 고리 + 전원 단자
      const pivotY = 2.15;
      const wireX = 0.22;
      const halfZ = 0.92;
      const frameMat = std(0x7c8ea8, 0.65, 0.32);
      const brassMat = std(0xe5b95c, 0.78, 0.24);
      rodBetween3d(THREE, new THREE.Vector3(wireX, pivotY, -1.26), new THREE.Vector3(wireX, pivotY, 1.26), 0.046, frameMat, swingRoot);
      rodBetween3d(THREE, new THREE.Vector3(wireX, -1.26, -1.2), new THREE.Vector3(wireX, pivotY, -1.2), 0.05, frameMat, swingRoot);
      const standFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.08, 22), std(0x4c5f7c, 0.55, 0.38));
      standFlange.position.set(wireX, -1.23, -1.2);
      const standJoint = new THREE.Mesh(makeRoundedBoxGeo(THREE, 0.15, 0.15, 0.16, 0.025), std(0x4c5f7c, 0.55, 0.38));
      standJoint.position.set(wireX, pivotY, -1.2);
      swingRoot.add(standFlange, standJoint);

      // 상단 가로대 황동 피벗 고리 2개 + 받침대 위 전원 단자 포스트 2개
      for (const pz of [-halfZ, halfZ]) {
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.09, 18), brassMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.set(wireX, pivotY, pz);
        swingRoot.add(collar);
      }
      swingPostF = std(0xe34b39, 0.28, 0.38);
      swingPostB = std(0x3487e5, 0.28, 0.38);
      const postFront = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.072, 0.14, 18), swingPostF);
      postFront.position.set(1.42, -1.2, 0.92);
      const postBack = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.072, 0.14, 18), swingPostB);
      postBack.position.set(1.42, -1.2, -0.92);
      swingRoot.add(postFront, postBack);

      // 코일 그네 본체(회전 그룹) + 흐르는 전류 빛 구슬
      swingPendulum = new THREE.Group();
      swingPendulum.position.set(wireX, pivotY, 0);
      swingRoot.add(swingPendulum);
      const copper = std(0xe59a4c, 0.72, 0.24);
      rodBetween3d(THREE, new THREE.Vector3(0, 0, halfZ), new THREE.Vector3(0, -pivotY, halfZ), 0.038, copper, swingPendulum);
      rodBetween3d(THREE, new THREE.Vector3(0, 0, -halfZ), new THREE.Vector3(0, -pivotY, -halfZ), 0.038, copper, swingPendulum);
      rodBetween3d(THREE, new THREE.Vector3(0, -pivotY, -halfZ - 0.05), new THREE.Vector3(0, -pivotY, halfZ + 0.05), 0.064, copper, swingPendulum);
      for (const cz of [-halfZ, halfZ]) {
        const corner = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 12), copper);
        corner.position.set(0, -pivotY, cz);
        swingPendulum.add(corner);
      }

      const beadMat = new THREE.MeshBasicMaterial({ color: 0xfff08a });
      const beadGeo = new THREE.SphereGeometry(0.054, 12, 10);
      swingCurBeads = Array.from({ length: 5 }, () => {
        const b = new THREE.Mesh(beadGeo, beadMat);
        swingPendulum!.add(b);
        return b;
      });

      // 그네 전류 & 힘 화살표
      swingCurArr = makeFatArrow3d(THREE, { color: 0xffd400, body: 0.052, head: 0.125, headLen: 0.24, outline: 0x6e3f16, onTop: true });
      swingForceArr = makeFatArrow3d(THREE, { color: 0x3fd6c0, body: 0.066, head: 0.16, headLen: 0.29, outline: 0x0b2a33, onTop: true });
      swingForceArr.g.visible = false;
      swingPendulum.add(swingCurArr.g, swingForceArr.g);

      const spFront = makeBadgeSprite3d(THREE, "앞", { color: "#DCE6F7", border: "rgba(255,255,255,0.28)", scale: 0.21 });
      spFront.position.set(wireX + 0.36, 0.02, halfZ + 0.36);
      const spBack = makeBadgeSprite3d(THREE, "뒤", { color: "#DCE6F7", border: "rgba(255,255,255,0.28)", scale: 0.21 });
      spBack.position.set(wireX + 0.14, 0.26, -halfZ - 0.36);
      swingRoot.add(spFront, spBack);

      // ━━━ B. 3D 전동기 코일 무대 (라운드 2, 왼쪽 배치: 오른손과 분리) ━━━
      motorRoot = new THREE.Group();
      motorRoot.position.set(-1.18, 0, 0);
      motorRoot.scale.setScalar(0.84);
      motorRoot.visible = false;
      scene.add(motorRoot);

      const mShadow = makeContactShadow3d(THREE, 2.95, 1.95, 0.48);
      mShadow.position.set(0, -1.465, 0.25);
      motorRoot.add(mShadow);
      const mBase = new THREE.Mesh(makeRoundedBoxGeo(THREE, 5.24, 0.16, 3.34, 0.038), std(0x1f2d46, 0.28, 0.48));
      mBase.position.set(0, -1.36, 0.25);
      motorRoot.add(mBase);

      const mGap = 1.65;
      const mW = 0.86;
      const mH = 2.05;
      const mD = 2.25;
      const mY = -1.28 + mH / 2;
      const mL = new THREE.Mesh(makeRoundedBoxGeo(THREE, mW, mH, mD, 0.036), paint(0xe34b39));
      mL.position.set(-(mGap + mW / 2), mY, 0);
      const mR = new THREE.Mesh(makeRoundedBoxGeo(THREE, mW, mH, mD, 0.036), paint(0x3487e5));
      mR.position.set(mGap + mW / 2, mY, 0);
      motorRoot.add(mL, mR);

      const mSpN = makeBadgeSprite3d(THREE, "N극", { color: "#FFFFFF", border: "#FFA396", bg: "rgba(154,34,24,0.92)", scale: 0.32 });
      mSpN.position.set(-(mGap + mW / 2), 0.15, mD / 2 + 0.18);
      const mSpS = makeBadgeSprite3d(THREE, "S극", { color: "#FFFFFF", border: "#7EC0FF", bg: "rgba(24,76,148,0.92)", scale: 0.32 });
      mSpS.position.set(mGap + mW / 2, 0.15, mD / 2 + 0.18);
      motorRoot.add(mSpN, mSpS);

      // 자기장 화살표(왼쪽 N → 오른쪽 S)
      for (const fy of [-0.55, 0.55]) {
        const fa = makeFatArrow3d(THREE, { color: 0xff7566, body: 0.034, head: 0.095, headLen: 0.2, opacity: 0.72 });
        fa.set(new THREE.Vector3(-1.45, fy, -1.26), new THREE.Vector3(1, 0, 0), 2.9);
        motorRoot.add(fa.g);
      }
      const mSpB = makeBadgeSprite3d(THREE, "자기장 (N→S)", { color: "#FFB7AD", border: "#FF7B6B", scale: 0.25 });
      mSpB.position.set(0, 0.74, -1.26);
      motorRoot.add(mSpB);

      // 회전축 + 코일 (왼쪽 변 A = 주황 #FF922B, 오른쪽 변 B = 보라 #B197FC)
      rodBetween3d(THREE, new THREE.Vector3(0, 0, -1.45), new THREE.Vector3(0, 0, 1.74), 0.048, std(0xa8bbd4, 0.72, 0.26), motorRoot);
      motorCoilGroup = new THREE.Group();
      motorRoot.add(motorCoilGroup);
      const mRCoil = 1.05;
      const mDCoil = 0.95;
      const orangeMat = std(0xff922b, 0.45, 0.28);
      const violetMat = std(0xb197fc, 0.45, 0.28);
      const wireCopper = std(0xe2984c, 0.65, 0.28);
      rodBetween3d(THREE, new THREE.Vector3(-mRCoil, 0, -mDCoil), new THREE.Vector3(-mRCoil, 0, mDCoil), 0.068, orangeMat, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(mRCoil, 0, -mDCoil), new THREE.Vector3(mRCoil, 0, mDCoil), 0.068, violetMat, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(-mRCoil, 0, -mDCoil), new THREE.Vector3(mRCoil, 0, -mDCoil), 0.052, wireCopper, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(-mRCoil, 0, mDCoil), new THREE.Vector3(-0.16, 0, mDCoil), 0.052, wireCopper, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(mRCoil, 0, mDCoil), new THREE.Vector3(0.16, 0, mDCoil), 0.052, wireCopper, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(-0.16, 0, mDCoil), new THREE.Vector3(-0.16, 0, mDCoil + 0.25), 0.04, wireCopper, motorCoilGroup);
      rodBetween3d(THREE, new THREE.Vector3(0.16, 0, mDCoil), new THREE.Vector3(0.16, 0, mDCoil + 0.25), 0.04, wireCopper, motorCoilGroup);

      // 정류자 절연 에보나이트 허브 + 구리 반원 링 2조각 + 카본 브러시 홀더
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.3, 24), std(0x1b2230, 0.1, 0.75));
      hub.rotation.x = Math.PI / 2;
      hub.position.z = mDCoil + 0.36;
      motorCoilGroup.add(hub);
      for (const cAng of [Math.PI / 2, (3 * Math.PI) / 2]) {
        const half = new THREE.Mesh(
          new THREE.CylinderGeometry(0.155, 0.155, 0.28, 28, 1, false, cAng - 1.32, 2.64),
          std(0xcf8438, 0.72, 0.26),
        );
        half.rotation.x = Math.PI / 2;
        half.position.z = mDCoil + 0.36;
        motorCoilGroup.add(half);
      }
      for (const sx of [-1, 1]) {
        const brush = new THREE.Mesh(makeRoundedBoxGeo(THREE, 0.14, 0.13, 0.22, 0.018), std(0x363f50, 0.18, 0.75));
        brush.position.set(sx * 0.225, 0, mDCoil + 0.36);
        const holder = new THREE.Mesh(makeRoundedBoxGeo(THREE, 0.1, 0.15, 0.24, 0.016), brassMat);
        holder.position.set(sx * 0.31, 0, mDCoil + 0.36);
        motorRoot.add(brush, holder);
      }

      const makeFlatCur2d = (len: number) => {
        const g = new THREE.Group();
        const mk = (pad: number): T.Shape => {
          const halfL = len / 2;
          const hl = 0.25 + pad * 1.4;
          const sw = 0.036 + pad;
          const hw = 0.115 + pad * 1.35;
          const neck = halfL - hl;
          const sh = new THREE.Shape();
          sh.moveTo(-sw, -halfL - pad);
          sh.lineTo(sw, -halfL - pad);
          sh.lineTo(sw, neck);
          sh.lineTo(hw, neck);
          sh.lineTo(0, halfL + pad * 1.5);
          sh.lineTo(-hw, neck);
          sh.lineTo(-sw, neck);
          sh.closePath();
          return sh;
        };
        const rimGeo = new THREE.ShapeGeometry(mk(0.022));
        rimGeo.rotateX(Math.PI / 2);
        const fillGeo = new THREE.ShapeGeometry(mk(0));
        fillGeo.rotateX(Math.PI / 2);
        const rimMat = new THREE.MeshBasicMaterial({ color: 0x4e2b0c, side: THREE.DoubleSide });
        const fillMat = new THREE.MeshBasicMaterial({ color: 0xffd400, side: THREE.DoubleSide });
        const rimM = new THREE.Mesh(rimGeo, rimMat);
        rimM.position.y = -0.004;
        const topM = new THREE.Mesh(fillGeo, fillMat);
        topM.position.y = 0.004;
        const botM = new THREE.Mesh(fillGeo, fillMat);
        botM.position.y = -0.01;
        g.add(rimM, topM, botM);
        return {
          g,
          set(center: T.Vector3, dir: T.Vector3): void {
            g.position.copy(center);
            g.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
          },
        };
      };
      motorCurL = makeFlatCur2d(1.1);
      motorCurR = makeFlatCur2d(1.1);
      motorCoilGroup.add(motorCurL.g, motorCurR.g);

      motorFL = makeFatArrow3d(THREE, { color: 0x3fd6c0, body: 0.068, head: 0.16, headLen: 0.3, outline: 0x0b2a33, onTop: true });
      motorFR = makeFatArrow3d(THREE, { color: 0x3fd6c0, body: 0.068, head: 0.16, headLen: 0.3, outline: 0x0b2a33, onTop: true });
      motorFL.g.visible = false;
      motorFR.g.visible = false;
      motorRoot.add(motorFL.g, motorFR.g);

      mSpL = makeBadgeSprite3d(THREE, "주황 변(뒤로)", { color: "#FFD09E", border: "#FF922B", scale: 0.24 });
      mSpL.position.set(-mRCoil, 0.48, 0.58);
      mSpR = makeBadgeSprite3d(THREE, "보라 변(앞으로)", { color: "#DFD0FF", border: "#B197FC", scale: 0.24 });
      mSpR.position.set(mRCoil, 0.48, 0.58);
      motorRoot.add(mSpL, mSpR);

      // 현재 오른손을 대고 있는 변 강조 링
      motorFocusRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.025, 12, 32),
        new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.75 }),
      );
      motorRoot.add(motorFocusRing);

      // ━━━ C. 자석 바깥 오른쪽 독립 받침대 + 스컬프팅 해부학 3D 편 오른손 모델 ━━━
      handPedestal = new THREE.Group();
      handPedestal.position.set(1.78, -1.32, 0.05);
      const pShadow = makeContactShadow3d(THREE, 1.32, 1.32, 0.46);
      pShadow.position.y = -0.14;
      const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.06, 0.13, 44), std(0x182742, 0.35, 0.4));
      const pedDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.9, 0.03, 44), std(0x23385c, 0.4, 0.3));
      pedDeck.position.y = 0.072;
      handPedRingMat = new THREE.MeshBasicMaterial({ color: 0x3fd6c0, transparent: true, opacity: 0.88 });
      const pedRing = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.03, 14, 48), handPedRingMat);
      pedRing.rotation.x = Math.PI / 2;
      pedRing.position.y = 0.075;
      const pedInnerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.54, 0.565, 40),
        new THREE.MeshBasicMaterial({ color: 0x7cb8ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
      );
      pedInnerRing.rotation.x = -Math.PI / 2;
      pedInnerRing.position.y = 0.09;
      const pedLabel = makeBadgeSprite3d(THREE, "3D 오른손 모델", { color: "#BEFFF4", border: "#3FD6C0", scale: 0.25 });
      pedLabel.position.set(0, 0.18, 0.0);
      handPedestal.add(pShadow, pedBase, pedDeck, pedRing, pedInnerRing, pedLabel);
      scene.add(handPedestal);

      hand3d = buildPalmHand3d(THREE);
      hand3d.group.scale.setScalar(0.86);
      scene.add(hand3d.group);
    }

    // ── 라운드/단계 설정 ──
    function setupRound(id: RoundId): void {
      round = id;
      wrongFlash = 0;
      forceReveal = 0;
      swingAngle = 0;
      swingVel = 0;
      motorTh = 0;
      motorSpeed = 0;
      motorLeftForceShown = false;
      motorRightForceShown = false;
      motorSpinning = false;
      handVisible = true;
      handOpacityGoal = 1.0;

      if (swingRoot) swingRoot.visible = id !== 2;
      if (motorRoot) motorRoot.visible = id === 2;
      if (handPedestal) {
        handPedestal.visible = true;
        handPedestal.position.x = id === 2 ? 2.35 : 1.75;
      }
      if (handPedRingMat) handPedRingMat.color.setHex(id === 2 ? 0xff922b : 0x3fd6c0);

      if (id === 0) {
        stp = "field";
        // 시작 시 오른손은 약간 비정렬 자세로 자석 바깥 오른쪽에서 대기
        handB.set(0, -1, 0);
        handI.set(0, 0, 1);
        handTargetPos.set(1.75, 0.04, 0.05);
      } else if (id === 1) {
        stp = "field";
        handB.set(0, -1, 0);
        handI.set(0, 0, -1);
        handTargetPos.set(1.75, 0.04, 0.05);
      } else {
        stp = "m_left_align";
        handB.set(1, 0, 0); // 자기장은 이미 오른쪽(N→S)
        handI.set(0, 0, 1); // 엄지는 아직 틀린 방향(앞쪽) → 학생이 뒤쪽으로 맞춘다
        handTargetPos.set(2.35, 0.08, 0.05);
      }

      if (swingCurArr) {
        const cz = id === 0 ? -1 : 1;
        swingCurArr.set(new THREE.Vector3(0, -2.15 + 0.14, -cz * 0.45), new THREE.Vector3(0, 0, cz), 0.92);
      }
      if (swingPostF && swingPostB) {
        swingPostF.color.setHex(id === 0 ? 0xe34b39 : 0x3487e5);
        swingPostB.color.setHex(id === 0 ? 0x3487e5 : 0xe34b39);
      }
      if (swingForceArr) swingForceArr.g.visible = false;
      if (motorFL) motorFL.g.visible = false;
      if (motorFR) motorFR.g.visible = false;

      applyCamPreset();
      paintHud();
    }

    function currentPromptAndChoices(): { say: string; steps: [string, boolean, boolean][]; choices: Choice[] } {
      if (round === 0 || round === 1) {
        const back = round === 0;
        const stepList: [string, boolean, boolean][] = [
          ["① 네 손가락 (자기장)", stp === "field", stp !== "field"],
          ["② 엄지 (전류)", stp === "cur", stp === "force" || stp === "done"],
          ["③ 손바닥 (힘 확인)", stp === "force", stp === "done"],
        ];
        if (stp === "field") {
          return {
            say: "<b>1단계</b> · 말굽자석의 자기장은 아래 <b>N극 → 위 S극</b>이에요. 3D 오른손의 <b>네 손가락</b>을 맞춰 보세요.",
            steps: stepList,
            choices: [
              { id: "b_up", label: "네 손가락: 위쪽 (N→S)", tone: "field", ok: true },
              { id: "b_down", label: "네 손가락: 아래쪽", tone: "field", ok: false },
            ],
          };
        }
        if (stp === "cur") {
          return {
            say: `<b>2단계</b> · 아랫변의 노란 전류 화살표가 <b>${back ? "뒤쪽" : "앞쪽"}</b>을 향해요. <b>엄지손가락</b>을 맞춰 보세요.`,
            steps: stepList,
            choices: back
              ? [
                  { id: "i_back", label: "엄지: 뒤쪽 (전류)", tone: "cur", ok: true },
                  { id: "i_front", label: "엄지: 앞쪽", tone: "cur", ok: false },
                ]
              : [
                  { id: "i_front", label: "엄지: 앞쪽 (전류)", tone: "cur", ok: true },
                  { id: "i_back", label: "엄지: 뒤쪽", tone: "cur", ok: false },
                ],
          };
        }
        if (stp === "force") {
          return {
            say: "<b>3단계</b> · 맞춘 3D 오른손의 밝은 <b>손바닥</b>이 밀고 있는 방향을 눌러 전류를 흘려 보세요!",
            steps: stepList,
            choices: back
              ? [
                  { id: "f_out", label: "손바닥: 자석 바깥쪽 (오른쪽)", tone: "force", ok: true },
                  { id: "f_in", label: "손바닥: 자석 안쪽 (왼쪽)", tone: "force", ok: false },
                ]
              : [
                  { id: "f_in", label: "손바닥: 자석 안쪽 (왼쪽)", tone: "force", ok: true },
                  { id: "f_out", label: "손바닥: 자석 바깥쪽 (오른쪽)", tone: "force", ok: false },
                ],
          };
        }
        return {
          say: back
            ? "정확해요! 손바닥이 <b>자석 바깥쪽</b>을 향해 코일 그네가 바깥으로 밀려났어요!"
            : "정확해요! 전류만 반대가 되자 손바닥이 뒤집히며 코일 그네가 <b>자석 안쪽</b>으로 끌려들어가요!",
          steps: stepList,
          choices: [
            {
              id: round === 0 ? "go_r1" : "go_r2",
              label: round === 0 ? "2단계: 전류 반대 코일 그네로" : "3단계: 전동기 코일 체험으로",
              tone: "main",
              ok: true,
            },
          ],
        };
      }

      // 라운드 2: 3D 전동기 코일
      const mSteps: [string, boolean, boolean][] = [
        ["① 왼쪽 주황 변 힘", stp === "m_left_align" || stp === "m_left_force", stp === "m_right_force" || stp === "m_spin" || stp === "done"],
        ["② 오른쪽 보라 변 힘", stp === "m_right_force", stp === "m_spin" || stp === "done"],
        ["③ 코일 회전 실행", stp === "m_spin", stp === "done"],
      ];
      if (stp === "m_left_align") {
        return {
          say: "<b>전동기 ①</b> · 왼쪽 <b>주황 변</b>은 자기장이 오른쪽(N→S), 전류가 <b>뒤쪽</b>이에요. 오른손 <b>엄지</b>를 맞춰 보세요.",
          steps: mSteps,
          choices: [
            { id: "mi_back", label: "엄지: 뒤쪽 (주황 변 전류)", tone: "cur", ok: true },
            { id: "mi_front", label: "엄지: 앞쪽", tone: "cur", ok: false },
          ],
        };
      }
      if (stp === "m_left_force") {
        return {
          say: "<b>전동기 ①</b> · 왼쪽 주황 변에 맞춘 3D 오른손의 <b>손바닥</b>이 향하는 힘의 방향은 어디인가요?",
          steps: mSteps,
          choices: [
            { id: "mf_down", label: "손바닥: 아래쪽", tone: "force", ok: true },
            { id: "mf_up", label: "손바닥: 위쪽", tone: "force", ok: false },
          ],
        };
      }
      if (stp === "m_right_force") {
        return {
          say: "<b>전동기 ②</b> · 오른손을 <b>오른쪽 보라 변</b>(전류 앞쪽)으로 옮겼어요! 손바닥이 향하는 힘의 방향은?",
          steps: mSteps,
          choices: [
            { id: "mr_up", label: "손바닥: 위쪽", tone: "force", ok: true },
            { id: "mr_down", label: "손바닥: 아래쪽", tone: "force", ok: false },
          ],
        };
      }
      if (stp === "m_spin") {
        return {
          say: "<b>전동기 ③</b> · 왼쪽 변은 <b>아래</b>, 오른쪽 변은 <b>위</b>로 힘을 받아요! 코일은 어느 방향으로 돌까요?",
          steps: mSteps,
          choices: [
            { id: "spin_ccw", label: "시계 반대 방향 회전 실행!", tone: "force", ok: true },
            { id: "spin_cw", label: "시계 방향", tone: "force", ok: false },
          ],
        };
      }
      return {
        say: "멋져요! 양쪽 변에 서로 반대 방향의 힘이 작용해 전동기 코일이 힘차게 회전해요!",
        steps: mSteps,
        choices: [
          {
            id: completed.size === 3 ? "finish_all" : "next_missing",
            label: completed.size === 3 ? "돌아가서 정리하기" : "남은 단계 체험하기",
            tone: "main",
            ok: true,
          },
        ],
      };
    }

    function onChoice(c: Choice): void {
      if (c.id === "go_r1") {
        haptic(HAPTIC.tap);
        setupRound(1);
        return;
      }
      if (c.id === "go_r2") {
        haptic(HAPTIC.tap);
        setupRound(2);
        return;
      }
      if (c.id === "finish_all") {
        rStage.leave();
        return;
      }
      if (c.id === "next_missing") {
        const miss = ([0, 1, 2] as RoundId[]).find((id) => !completed.has(id)) ?? 0;
        setupRound(miss);
        return;
      }

      // 손 방향 실시간 반영(틀린 선택을 눌러도 실제로 그 방향으로 돌아가며 오개념을 직관적으로 교정)
      if (c.id === "b_up") handB.set(0, 1, 0);
      if (c.id === "b_down") handB.set(0, -1, 0);
      if (c.id === "i_back" || c.id === "mi_back") handI.set(0, 0, -1);
      if (c.id === "i_front" || c.id === "mi_front") handI.set(0, 0, 1);

      if (!c.ok) {
        haptic(HAPTIC.wrong);
        wrongFlash = 1;
        if (stp === "field") {
          sayBar.innerHTML = "자기장은 아래 <b>N극에서 위 S극</b>으로 향해요. 빨간 화살표를 따라 네 손가락을 <b>위쪽</b>으로 맞춰 보세요.";
        } else if (stp === "cur" || stp === "m_left_align") {
          sayBar.innerHTML = "노란 전류 화살표의 끝을 잘 살펴보세요! 엄지손가락이 노란 화살표와 <b>같은 방향</b>을 가리켜야 해요.";
        } else if (stp === "m_spin") {
          sayBar.innerHTML = "왼쪽 변이 아래로 내려가고 오른쪽 변이 위로 올라가면 앞에서 볼 때 <b>시계 반대 방향</b>으로 돌아요!";
        } else {
          sayBar.innerHTML = "3D 오른손에서 청록색으로 빛나는 <b>손바닥 면</b>이 어느 쪽을 향하고 있는지 살펴보세요!";
        }
        return;
      }

      haptic(HAPTIC.correct);
      if (round === 0 || round === 1) {
        if (stp === "field") {
          stp = "cur";
        } else if (stp === "cur") {
          stp = "force";
        } else if (stp === "force") {
          stp = "done";
          completed.add(round);
          swingVel = round === 0 ? 0.045 : -0.045;
          if (swingForceArr) {
            const dirX = round === 0 ? 1 : -1;
            swingForceArr.set(new THREE.Vector3(dirX * 0.08, -2.15, 0), new THREE.Vector3(dirX, 0, 0), 1.05);
            swingForceArr.g.visible = true;
          }
        }
      } else {
        if (stp === "m_left_align") {
          stp = "m_left_force";
        } else if (stp === "m_left_force") {
          motorLeftForceShown = true;
          if (motorFL) {
            motorFL.set(new THREE.Vector3(-1.05, -0.08, -0.25), new THREE.Vector3(0, -1, 0), 0.92);
            motorFL.g.visible = true;
          }
          // 오른손이 오른쪽 보라 변 조건(전류 앞쪽 +Z)으로 부드럽게 회전하며 받침대 테두리도 보라색으로 전환!
          stp = "m_right_force";
          handB.set(1, 0, 0);
          handI.set(0, 0, 1);
          handTargetPos.set(2.35, 0.08, 0.05);
          if (handPedRingMat) handPedRingMat.color.setHex(0xb197fc);
        } else if (stp === "m_right_force") {
          motorRightForceShown = true;
          if (motorFR) {
            motorFR.set(new THREE.Vector3(1.05, 0.08, -0.25), new THREE.Vector3(0, 1, 0), 0.92);
            motorFR.g.visible = true;
          }
          stp = "m_spin";
          handOpacityGoal = 0.35;
        } else if (stp === "m_spin") {
          stp = "done";
          motorSpinning = true;
          handOpacityGoal = 0.0;
          handVisible = false;
          if (handPedestal) handPedestal.visible = false;
          // 회전 시작 시 회전하는 전동기가 화면 중앙에 오도록 부드럽게 초점 이동
          camGoal.tx = -1.18;
          camGoal.dist = 6.5;
          completed.add(2);
        }
      }
      paintHud();
    }

    function paintHud(): void {
      const info = currentPromptAndChoices();
      sayBar.innerHTML = info.say;
      sayBar.dataset.round = String(round);
      sayBar.dataset.step = stp;
      sayBar.dataset.done = completed.size === 3 ? "1" : "0";

      roundBtns.forEach((b, i) => {
        const id = i as RoundId;
        b.classList.toggle("on", round === id);
        b.classList.toggle("done", completed.has(id));
      });
      camBtns.forEach((b) => b.classList.toggle("on", b.dataset.cam === camPreset));

      stepBar.innerHTML = "";
      info.steps.forEach(([txt, active, done]) => {
        stepBar.appendChild(el("span", { class: `g2u7x-r3-chip${active ? " on" : ""}${done ? " done" : ""}`, text: txt }));
      });

      btnRow.innerHTML = "";
      btnRow.style.gridTemplateColumns = `repeat(${info.choices.length}, 1fr)`;
      info.choices.forEach((c) => {
        const b = el("button", { class: `g2u7x-r3-btn ${c.tone}`, text: c.label, attrs: { type: "button" } }) as HTMLButtonElement;
        b.dataset.cid = c.id;
        b.addEventListener("click", () => onChoice(c));
        btnRow.appendChild(b);
      });
    }

    // ── 드래그 오빗(회전 무대 mapPoint 사용) ──
    const onDown = (e: PointerEvent): void => {
      if ((e.target as HTMLElement)?.closest("button")) return;
      dragging = true;
      dragLast = rStage.mapPoint(e);
      dragHint.classList.add("off");
    };
    const onMove = (e: PointerEvent): void => {
      if (!dragging) return;
      const p = rStage.mapPoint(e);
      const dx = p.x - dragLast.x;
      const dy = p.y - dragLast.y;
      dragLast = p;
      camGoal.az = clamp(camGoal.az - dx * 0.0075, -1.25, 1.45);
      camGoal.el = clamp(camGoal.el + dy * 0.0065, 0.08, 1.25);
    };
    const onUp = (): void => {
      dragging = false;
    };
    cv.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // DEV 검증 훅(오른손 외적 I × B === F 및 det === +1 확인)
    const devCv = cv as unknown as { __palm?: () => unknown };
    if (import.meta.env.DEV) {
      devCv.__palm = () => {
        const I = handI.clone().normalize();
        const B = handB.clone().normalize();
        const F = new THREE.Vector3().crossVectors(I, B).normalize();
        const m = new THREE.Matrix4().makeBasis(I, B, F);
        const arr = (v: T.Vector3) => [v.x, v.y, v.z].map((n) => Math.round(n * 1000) / 1000);
        return { round, step: stp, doneCount: completed.size, handI: arr(I), handB: arr(B), handF: arr(F), det: Math.round(m.determinant() * 1000) / 1000 };
      };
    }

    // 2D 폴백 그리기(WebGL2 없는 환경에서도 동일한 3단계 체험 보장)
    const ctx2d = glStage ? null : cv.getContext("2d");
    function drawFallback2d(w: number, h: number, tSec: number): void {
      if (!ctx2d) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx2d.save();
      ctx2d.scale(dpr, dpr);
      ctx2d.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h * 0.52;
      if (round !== 2) {
        // 말굽자석 그네 2D 표현
        xBox(ctx2d, cx - 150, cy - 68, 120, 28, 6, "#3688E4");
        xBox(ctx2d, cx - 150, cy + 40, 120, 28, 6, "#E24D3B");
        xText(ctx2d, "S극", cx - 90, cy - 54, { px: 14, w: 800, color: "#fff" });
        xText(ctx2d, "N극", cx - 90, cy + 54, { px: 14, w: 800, color: "#fff" });
        xArrow(ctx2d, cx - 80, cy + 34, cx - 80, cy - 34, X.field, 3, 9);
        const sx = cx + 10 + swingAngle * 90;
        ctx2d.strokeStyle = "#E09648";
        ctx2d.lineWidth = 5;
        ctx2d.beginPath();
        ctx2d.moveTo(cx + 10, cy - 95);
        ctx2d.lineTo(sx, cy);
        ctx2d.stroke();
        ctx2d.fillStyle = X.cur;
        ctx2d.beginPath();
        ctx2d.arc(sx, cy, 9, 0, Math.PI * 2);
        ctx2d.fill();
        xText(ctx2d, round === 0 ? "전류 뒤쪽" : "전류 앞쪽", sx, cy + 26, { px: 13, w: 700, color: X.cur });
        if (stp === "done") {
          const d = round === 0 ? 1 : -1;
          xArrow(ctx2d, sx + d * 12, cy, sx + d * 78, cy, X.force, 4, 11);
          xText(ctx2d, "힘", sx + d * 88, cy, { px: 14, w: 800, color: X.force });
        }
      } else {
        xBox(ctx2d, cx - 170, cy - 55, 60, 110, 8, "#E24D3B");
        xBox(ctx2d, cx + 110, cy - 55, 60, 110, 8, "#3688E4");
        xText(ctx2d, "N극", cx - 140, cy, { px: 15, w: 800, color: "#fff" });
        xText(ctx2d, "S극", cx + 140, cy, { px: 15, w: 800, color: "#fff" });
        const a = motorSpinning ? motorTh : 0;
        const dx = Math.cos(a) * 65;
        const dy = Math.sin(a) * 42;
        ctx2d.strokeStyle = "#FF922B";
        ctx2d.lineWidth = 6;
        ctx2d.beginPath();
        ctx2d.moveTo(cx - dx, cy - dy - 26);
        ctx2d.lineTo(cx - dx, cy - dy + 26);
        ctx2d.stroke();
        ctx2d.strokeStyle = "#B197FC";
        ctx2d.beginPath();
        ctx2d.moveTo(cx + dx, cy + dy - 26);
        ctx2d.lineTo(cx + dx, cy + dy + 26);
        ctx2d.stroke();
        if (motorLeftForceShown) xArrow(ctx2d, cx - dx, cy - dy, cx - dx, cy - dy + 52, X.force, 4, 10);
        if (motorRightForceShown) xArrow(ctx2d, cx + dx, cy + dy, cx + dx, cy + dy - 52, X.force, 4, 10);
      }
      // 오른손 요약 배지
      const F = new THREE.Vector3().crossVectors(handI, handB);
      xText(
        ctx2d,
        `오른손 손바닥 방향: ${F.x > 0.5 ? "오른쪽" : F.x < -0.5 ? "왼쪽" : F.y > 0.5 ? "위쪽" : "아래쪽"}`,
        cx,
        cy + 92 + Math.sin(tSec * 3) * 2,
        { px: 13.5, w: 800, color: X.force },
      );
      ctx2d.restore();
    }

    setupRound(round);

    let elapsed = 0;
    const loop: Loop = createLoop((dt) => {
      const dtSec = Math.min(0.05, dt / 60);
      elapsed += dtSec;
      const { w, h } = rStage.size();

      // 물리 & 애니메이션 업데이트
      if (round !== 2) {
        const targetAng = stp === "done" ? (round === 0 ? 0.34 : -0.3) : 0;
        const kSpring = 0.025;
        swingVel += (targetAng - swingAngle) * kSpring * dt;
        swingVel *= Math.pow(0.86, dt);
        swingAngle += swingVel * dt;
      } else {
        const goalSpeed = motorSpinning ? 0.042 : 0;
        motorSpeed += (goalSpeed - motorSpeed) * Math.min(1, dt * 0.05);
        motorTh += motorSpeed * dt;
      }
      if (stp === "done" && round !== 2) forceReveal = Math.min(1, forceReveal + dtSec * 2.8);
      else if (stp === "m_left_force" || stp === "m_right_force") forceReveal = Math.min(0.55, forceReveal + dtSec * 1.4);
      else forceReveal = Math.max(0, forceReveal - dtSec * 3.0);

      if (wrongFlash > 0) wrongFlash = Math.max(0, wrongFlash - dtSec * 2.2);

      if (!glStage) {
        drawFallback2d(w, h, elapsed);
        return;
      }

      // 3D 캔버스 리사이즈
      if (cv.width !== Math.floor(w * S.stagePixelRatio(cv, w, h)) || cv.height !== Math.floor(h * S.stagePixelRatio(cv, w, h))) {
        glStage.resize(w, h);
      }

      // 카메라 보간(높이가 낮은 모바일 가로 화면에서는 거리를 넓혀 상하 HUD와 겹치지 않게 여백을 확보한다)
      const compactScale = h < 480 ? 1.24 : 1.0;
      const lerpCam = Math.min(1, dtSec * 6.5);
      camCur.az += (camGoal.az - camCur.az) * lerpCam;
      camCur.el += (camGoal.el - camCur.el) * lerpCam;
      camCur.dist += (camGoal.dist - camCur.dist) * lerpCam;
      camCur.tx += (camGoal.tx - camCur.tx) * lerpCam;
      camCur.ty += (camGoal.ty - camCur.ty) * lerpCam;
      camCur.tz += (camGoal.tz - camCur.tz) * lerpCam;
      const effDist = camCur.dist * compactScale;
      const { camera } = glStage;
      camera.position.set(
        camCur.tx + effDist * Math.sin(camCur.az) * Math.cos(camCur.el),
        camCur.ty + effDist * Math.sin(camCur.el),
        camCur.tz + effDist * Math.cos(camCur.az) * Math.cos(camCur.el),
      );
      camera.lookAt(camCur.tx, camCur.ty, camCur.tz);

      // 그네 & 전동기 업데이트
      if (swingPendulum && round !== 2) {
        swingPendulum.rotation.z = swingAngle;
        const totalL = 2.15 + 1.84 + 2.15;
        swingCurBeads.forEach((b, bi) => {
          const raw = (elapsed * 0.44 + bi / swingCurBeads.length) % 1;
          const u = round === 0 ? raw : 1 - raw;
          const d = u * totalL;
          if (d < 2.15) {
            b.position.set(0, -d, 0.92);
          } else if (d < 2.15 + 1.84) {
            b.position.set(0, -2.15, 0.92 - (d - 2.15));
          } else {
            b.position.set(0, -2.15 + (d - 3.99), -0.92);
          }
        });
      }
      if (motorCoilGroup && round === 2) {
        motorCoilGroup.rotation.z = motorTh;
        const c = Math.cos(motorTh);
        const s = Math.sin(motorTh);
        const aLeft = c >= 0;
        const aZ = aLeft ? -1 : 1; // 왼쪽 변은 늘 뒤쪽(-Z)
        motorCurL?.set(new THREE.Vector3(-1.05 + 0.22, 0, 0), new THREE.Vector3(0, 0, aZ));
        motorCurR?.set(new THREE.Vector3(1.05 - 0.22, 0, 0), new THREE.Vector3(0, 0, -aZ));
        const pa = new THREE.Vector3(-1.05 * c, -1.05 * s, -0.25);
        const pb = new THREE.Vector3(1.05 * c, 1.05 * s, -0.25);
        const pL = aLeft ? pa : pb;
        const pR = aLeft ? pb : pa;
        if (motorLeftForceShown && motorFL) motorFL.set(pL.clone().add(new THREE.Vector3(0, -0.08, 0)), new THREE.Vector3(0, -1, 0), motorSpinning ? 0.72 : 0.86);
        if (motorRightForceShown && motorFR) motorFR.set(pR.clone().add(new THREE.Vector3(0, 0.08, 0)), new THREE.Vector3(0, 1, 0), motorSpinning ? 0.72 : 0.86);
        if (mSpL) mSpL.visible = !motorSpinning;
        if (mSpR) mSpR.visible = !motorSpinning;
        if (motorFocusRing) {
          motorFocusRing.visible = stp === "m_left_align" || stp === "m_left_force" || stp === "m_right_force";
          const fx = stp === "m_right_force" ? 1.05 : -1.05;
          motorFocusRing.position.set(fx, 0, 0.45);
          const pulse = 1 + 0.1 * Math.sin(elapsed * 5);
          motorFocusRing.scale.set(pulse, pulse, 1);
        }
      }

      // 3D 오른손 보간 + 단계 강조
      if (hand3d) {
        handOpacityCur += ((handVisible ? handOpacityGoal : 0) - handOpacityCur) * Math.min(1, dtSec * 7);
        hand3d.group.visible = handOpacityCur > 0.02;
        hand3d.setOpacity(handOpacityCur);
        const qGoal = targetQuatForPalm(THREE, handI, handB);
        hand3d.group.quaternion.slerp(qGoal, Math.min(1, dtSec * 8.5));

        const posGoal = handTargetPos.clone();
        if (wrongFlash > 0) posGoal.x += Math.sin(elapsed * 45) * 0.06 * wrongFlash;
        hand3d.group.position.lerp(posGoal, Math.min(1, dtSec * 7.5));

        const focusMode =
          stp === "field"
            ? "field"
            : stp === "cur" || stp === "m_left_align"
              ? "cur"
              : stp === "force" || stp === "m_left_force" || stp === "m_right_force"
                ? "force"
                : "all";
        hand3d.setFocus(focusMode, elapsed);
        // 손이 자석 밖에 분리되어 있으므로, 실행(done) 시 손바닥에서도 힘 화살표가 나란히 뻗어 코일 그네 힘과 1:1 대응시킨다
        hand3d.setForceReveal(
          stp === "done"
            ? forceReveal
            : stp === "force" || stp === "m_left_force" || stp === "m_right_force"
              ? 0.42
              : 0,
        );
      }

      // 자기장 화살표 은은한 숨결
      const fAlpha = stp === "field" ? 0.72 + 0.25 * Math.sin(elapsed * 5) : 0.65;
      swingFieldArrs.forEach((a) => a.setOpacity(fAlpha));

      glStage.render();
    }).start();

    stopLandscape = () => {
      loop.stop();
      cv.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (import.meta.env.DEV) delete devCv.__palm;
      glStage?.dispose();
    };
  }

  openBtn.addEventListener("click", () => {
    void openLandscape();
  });

  syncPortraitLog();
  f.say("실제 <b>말굽자석 코일 그네</b>와 <b>전동기</b>에 3D 오른손을 직접 맞춰 볼게요. 아래 버튼을 눌러 가로 화면 체험을 열어 보세요.");
  api.setCTA("가로 화면에서 3단계 오른손 체험을 완료해 보세요", { enabled: false });

  return () => {
    tm.clear();
    preview.stop();
    stopLandscape?.();
    stopLandscape = null;
    rot?.dispose();
    rot = null;
  };
};
