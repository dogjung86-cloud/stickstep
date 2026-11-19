// [중2 Ⅶ v5] g2u7l7 gripLab: 「오른손으로 N극을 찾아요」 (가로 화면 3D 오른손 체험)
// 한 통찰: 오른손 네 손가락을 코일 앞쪽 전류 방향으로 감아 쥐면 엄지가 N극(코일 속 자기장 방향)을 가리키며, 반대로 N극을 알면 전류 방향도 찾을 수 있다.
// 걸음:
//   세로 진입 화면(코일·나침반 미리보기 + 3개 미션 현황 + 가로 화면 열기 버튼)
//   → 가로 3D 무대(실제 3D 구리 나선 코일·나침반 2개·입체 자기장 선·감아 쥔 3D 오른손으로 3단계 체험)
//   → 세로 복귀 후 확인 판정 2문항 + 핵심 정리.
// 방향 약속(magKit.ts와 동일):
//   · dir = +1: 앞쪽 가닥 전류가 아래(-Y) → 코일 속 자기장이 오른쪽(+X) → 오른쪽 끝이 N극, 양 끝 나침반 빨간 바늘이 오른쪽(+X).
//   · dir = -1: 앞쪽 가닥 전류가 위(+Y) → 코일 속 자기장이 왼쪽(-X) → 왼쪽 끝이 N극, 양 끝 나침반 빨간 바늘이 왼쪽(-X).
// three와 rotateStage는 열릴 때만 동적 import한다(초기 번들 분리). WebGL2가 없으면 같은 HUD/단계로 2D 캔버스 폴백을 그린다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { RotateStage } from "../../../ui/rotateStage";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import { bvBtn, bvTimers } from "../bio6/b6Lab";
import { mCoil, mCoilEnds, mCompass, mSlot } from "./magKit";
import { X, xArrow, xBox, xCanvas, xFrame, xLog, xText, type LabStep } from "./kit";
import {
  buildGripHand3d,
  makeBadgeSprite3d,
  makeContactShadow3d,
  makeFatArrow3d,
  makeRoundedBoxGeo,
  rodBetween3d,
  setupStudioLights,
  type FatArrow3d,
  type GripHand3d,
} from "./hand3d";

type RoundId = 0 | 1 | 2;
type StepKey = "grip" | "pole" | "thumb" | "cur" | "done";
type CamPreset = "front" | "iso" | "top";

interface RoundDef {
  id: RoundId;
  dir: 1 | -1; // +1: 앞쪽 아래 → 오른쪽 N극, -1: 앞쪽 위 → 왼쪽 N극
  reverse: boolean; // true면 나침반이 먼저 보이고 전류를 거꾸로 찾음
}
const ROUNDS: RoundDef[] = [
  { id: 0, dir: -1, reverse: false },
  { id: 1, dir: 1, reverse: false },
  { id: 2, dir: 1, reverse: true },
];

interface Choice {
  id: string;
  label: string;
  tone: "field" | "cur" | "force" | "main";
  ok: boolean;
}

const CAM_PRESETS: Record<CamPreset, { az: number; el: number; dist: number; tx: number; ty: number; tz: number }> = {
  front: { az: 0.07, el: 0.27, dist: 9.05, tx: 0.26, ty: -0.06, tz: 0.0 },
  iso: { az: 0.35, el: 0.4, dist: 9.35, tx: 0.26, ty: -0.06, tz: 0.0 },
  top: { az: 0.06, el: 1.08, dist: 9.5, tx: 0.26, ty: -0.06, tz: 0.0 },
};

export const gripLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  const f = xFrame(host, { title: s.title, steps: 3, api, tall: true });
  const preview = xCanvas(f.stage);
  const tm = bvTimers();

  const completed = new Set<RoundId>();
  let judged = false;
  let rot: RotateStage | null = null;
  let stopLandscape: (() => void) | null = null;

  const openBtn = bvBtn("main", "가로 화면으로 3D 오른손 체험 열기");
  const missionLog = xLog(
    [
      "1. 앞쪽 전류 위로 (N극 찾기)",
      "2. 앞쪽 전류 아래로 (극 뒤집기)",
      "3. 나침반으로 전류 거꾸로 찾기",
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

  // 세로 진입 화면 미리보기(346×230)
  preview.run((ctx, w, _h, t) => {
    const k = w / 346;
    ctx.save();
    ctx.scale(k, k);
    const bg = ctx.createRadialGradient(173, 102, 16, 173, 108, 165);
    bg.addColorStop(0, "rgba(255,123,107,.13)");
    bg.addColorStop(1, "rgba(11,21,36,0)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 346, 230);

    const cx = 173;
    const cy = 92;
    const ends = mCoilEnds(cx, cy);
    ctx.strokeStyle = "rgba(255,196,90,.72)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(ends.lx, ends.y);
    ctx.lineTo(ends.lx, 152);
    ctx.lineTo(ends.rx, 152);
    ctx.lineTo(ends.rx, ends.y);
    ctx.stroke();
    xBox(ctx, cx - 38, 140, 76, 24, 7, "rgba(11,21,36,.92)", X.line);
    xText(ctx, "전원 장치", cx, 152.5, { px: 12, color: X.dim });

    mCoil(ctx, cx, cy, { cur: true, dir: -1 });
    const wob = Math.sin(t / 700) * 0.08;
    mCompass(ctx, 56, cy, Math.PI + wob, 20);
    mCompass(ctx, 290, cy, Math.PI + wob, 20);
    xArrow(ctx, cx + 34, cy, cx - 34, cy, X.field, 2.8, 9);
    xText(ctx, "N극", 98, cy - 34, { px: 12.5, w: 800, color: "#FFB3A6" });
    xText(ctx, "S극", 248, cy - 34, { px: 12.5, w: 800, color: "#9CC8FF" });
    xText(ctx, "네 손가락 = 앞쪽 전류   |   엄지 = N극", 173, 184, { px: 12.5, w: 700, color: "#FFE08A" });
    const doneText = completed.size === 3 ? "3단계 모두 완료! 결과를 확인해요" : `완료한 체험 ${completed.size} / 3`;
    xText(ctx, doneText, 173, 210, { px: 12.5, w: 700, color: completed.size === 3 ? "#7FE3C4" : X.dim });
    ctx.restore();
  });

  // ── 세로 복귀 후 확인 판정 2문항 ──
  function startVerdict(): void {
    judged = true;
    f.pips(2);
    f.say("3D 코일에 오른손을 직접 감아 쥐며 N극과 전류 방향의 관계를 확인했어요! 핵심을 점검해 볼까요?");
    f.slot.ask(
      "코일에 오른손을 감아 쥘 때, 네 손가락과 엄지손가락은 각각 무엇의 방향을 나타내나요?",
      [
        { t: "네 손가락: 전류, 엄지: N극(자기장)", ok: true },
        { t: "네 손가락: N극(자기장), 엄지: 전류" },
        { t: "네 손가락과 엄지 모두 전류 방향" },
      ],
      (ok) => api.recordQuiz(ok),
      {
        why: "오른손의 <b>네 손가락</b>을 코일에 흐르는 전류 방향으로 감아 쥐면 <b>엄지손가락</b>이 코일 속 자기장(N극) 쪽을 가리켜요.",
        onNext: ask2,
      },
    );
  }
  function ask2(): void {
    f.slot.ask(
      "코일 앞쪽 도선에서 전류가 아래쪽으로 흐를 때, 코일의 어느 쪽 끝이 N극이 되나요?",
      [
        { t: "오른쪽 끝", ok: true },
        { t: "왼쪽 끝" },
        { t: "N극이 생기지 않아요" },
      ],
      () => undefined,
      {
        why: "오른손 네 손가락을 코일 앞쪽에서 <b>아래쪽</b>으로 감아 쥐면 엄지가 <b>오른쪽</b>을 가리켜 오른쪽 끝이 N극이 돼요.",
        onNext: finish,
      },
    );
  }
  function finish(): void {
    f.pips(3);
    f.say("오른손 네 손가락과 엄지손가락으로 코일의 전류 방향과 N극을 찾는 법을 익혔어요!");
    f.slot.conclude(
      "오른손의 <b>네 손가락</b>을 코일에 흐르는 전류의 방향으로 감아 쥐면, <b>엄지손가락</b>이 가리키는 쪽이 코일의 <b>N극</b>(자기장이 나오는 쪽)이 돼요. 전류의 방향이 반대가 되면 N극과 S극의 위치도 서로 바뀌어요.",
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
    let stp: StepKey = round === 2 ? "thumb" : "grip";
    let camPreset: CamPreset = "front";

    // 오른손 자세: +1이면 앞쪽 아래/엄지 오른쪽(rotZ = 0), -1이면 앞쪽 위/엄지 왼쪽(rotZ = PI)
    let handDir: 1 | -1 = 1;
    let handRotZCur = 0;
    let fieldReveal = 0;
    let compassReveal = 0;
    let needleAngCur = Math.PI / 2; // 대기 시 북쪽(+Z/-Z) 방향에서 시작해 정답 시 좌/우로 회전
    let wrongFlash = 0;

    const camCur = { ...CAM_PRESETS.front };
    const camGoal = { ...CAM_PRESETS.front };
    let dragging = false;
    let dragLast = { x: 0, y: 0 };

    const cleanupLocal = (): void => {
      stopLandscape?.();
      stopLandscape = null;
      rot?.dispose();
      rot = null;
    };

    const rStage = enterRotateStage({
      title: "3D 오른손으로 코일의 N극 찾기",
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

    const cv = el("canvas", { class: "g2u7x-r3-cv" }) as HTMLCanvasElement;
    stageEl.appendChild(cv);

    // 상단 HUD
    const roundBtns = ROUNDS.map((rd) => {
      const names = ["1. 앞쪽 전류 위", "2. 앞쪽 전류 아래", "3. 거꾸로 찾기"];
      const b = el("button", { class: "g2u7x-r3-pill", text: names[rd.id], attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.r = String(rd.id);
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        setupRound(rd.id);
      });
      return b;
    });
    const camBtns = (["front", "iso", "top"] as CamPreset[]).map((k) => {
      const labels: Record<CamPreset, string> = { front: "정면", iso: "비스듬히", top: "위에서" };
      const b = el("button", { class: "g2u7x-r3-cam", text: labels[k], attrs: { type: "button" } }) as HTMLButtonElement;
      b.dataset.cam = k;
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        camPreset = k;
        Object.assign(camGoal, CAM_PRESETS[k]);
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
    const dragHint = el("div", { class: "g2u7x-r3-hint", text: "화면을 끌어 3D 코일과 오른손을 돌려 볼 수 있어요" });
    const dock = el("div", { class: "g2u7x-r3-dock" }, stepBar, btnRow);
    stageEl.append(topHud, sayBar, dragHint, dock);

    // ── 3D 씬 구축 ──
    const glStage: SpaceStage | null = S.createSpaceStage(cv, { fov: 35 });
    let hand3d: GripHand3d | null = null;
    let frontCurArrs: FatArrow3d[] = [];
    let coreFieldArr: FatArrow3d | null = null;
    let fieldLoopsGroup: T.Group | null = null;
    let fieldLoopMats: T.MeshStandardMaterial[] = [];
    let fieldLoopCurves: T.CatmullRomCurve3[] = [];
    let fieldPulses: T.Mesh[] = [];
    let helixCurveRef: T.CatmullRomCurve3 | null = null;
    let coilCurBeads: T.Mesh[] = [];
    let compassNeedles: T.Group[] = [];
    let compassCovers: T.Mesh[] = [];
    let compassQBadges: T.Sprite[] = [];
    let spPoleN: T.Sprite | null = null;
    let spPoleS: T.Sprite | null = null;
    let spCurUnknown: T.Sprite | null = null;
    let termLeftMat: T.MeshStandardMaterial | null = null;
    let termRightMat: T.MeshStandardMaterial | null = null;

    if (glStage) {
      const { scene } = glStage;
      setupStudioLights(THREE, scene, { floorY: -1.46, grid: true });
      const std = (color: number, metal = 0.2, rough = 0.42): T.MeshStandardMaterial =>
        new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough });

      // 고해상도 나침반 눈금판 캔버스 텍스처 생성
      const makeCompassDialTex = (): T.CanvasTexture => {
        const dcv = document.createElement("canvas");
        dcv.width = 256;
        dcv.height = 256;
        const dctx = dcv.getContext("2d")!;
        const c = 128;
        const rg = dctx.createRadialGradient(c, c, 8, c, c, 124);
        rg.addColorStop(0, "#FFFFFF");
        rg.addColorStop(0.76, "#EEF4FC");
        rg.addColorStop(1, "#CFDDF0");
        dctx.fillStyle = rg;
        dctx.beginPath();
        dctx.arc(c, c, 124, 0, Math.PI * 2);
        dctx.fill();

        // 눈금 링
        dctx.strokeStyle = "rgba(38, 58, 92, 0.35)";
        dctx.lineWidth = 2;
        dctx.beginPath();
        dctx.arc(c, c, 108, 0, Math.PI * 2);
        dctx.stroke();

        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          const major = i % 6 === 0;
          const r0 = major ? 88 : 98;
          const r1 = 108;
          dctx.strokeStyle = major ? "rgba(24, 40, 68, 0.72)" : "rgba(48, 70, 108, 0.35)";
          dctx.lineWidth = major ? 3.2 : 1.6;
          dctx.beginPath();
          dctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
          dctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
          dctx.stroke();
        }
        // 십자 기준선
        dctx.strokeStyle = "rgba(56, 84, 130, 0.22)";
        dctx.lineWidth = 2;
        dctx.beginPath();
        dctx.moveTo(c - 78, c);
        dctx.lineTo(c + 78, c);
        dctx.moveTo(c, c - 78);
        dctx.lineTo(c, c + 78);
        dctx.stroke();

        dctx.font = "900 26px Pretendard, system-ui, sans-serif";
        dctx.textAlign = "center";
        dctx.textBaseline = "middle";
        dctx.fillStyle = "#C93B2B";
        dctx.fillText("북", c, 56);
        dctx.fillStyle = "#2E466D";
        dctx.fillText("남", c, 200);
        dctx.fillText("동", 200, c);
        dctx.fillText("서", 56, c);

        const tex = new THREE.CanvasTexture(dcv);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };
      const dialTex = makeCompassDialTex();

      // ━━━ 왼쪽 영역: 3D 구리 코일 + 양 끝 정밀 3D 나침반 + 입체 자기장 선 (손과 완전히 분리!) ━━━
      const coilRoot = new THREE.Group();
      coilRoot.position.set(-1.52, 0, 0);
      coilRoot.scale.setScalar(0.84);
      scene.add(coilRoot);

      // 받침판 + 바닥 그림자
      const bShadow = makeContactShadow3d(THREE, 3.15, 1.55, 0.48);
      bShadow.position.set(0, -1.52, 0);
      coilRoot.add(bShadow);
      const base = new THREE.Mesh(makeRoundedBoxGeo(THREE, 5.65, 0.15, 2.46, 0.036), std(0x1f2d46, 0.28, 0.48));
      base.position.set(0, -1.42, 0);
      const baseTop = new THREE.Mesh(makeRoundedBoxGeo(THREE, 5.52, 0.028, 2.34, 0.012), std(0x2b3e5f, 0.34, 0.38));
      baseTop.position.set(0, -1.335, 0);
      coilRoot.add(base, baseTop);

      // 반투명 아크릴 보빈 원통 코어 + 양 끝 알루미늄 플랜지 링
      const coreGeo = new THREE.CylinderGeometry(0.535, 0.535, 2.36, 40);
      coreGeo.rotateZ(Math.PI / 2);
      const coreMat = new THREE.MeshPhysicalMaterial({
        color: 0x486e9e,
        roughness: 0.16,
        metalness: 0.06,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
        transparent: true,
        opacity: 0.34,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coilRoot.add(coreMesh);
      const flangeMat = std(0x96adc9, 0.68, 0.26);
      for (const ex of [-1.18, 1.18]) {
        const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.055, 40, 1, true), flangeMat);
        flange.rotation.z = Math.PI / 2;
        flange.position.x = ex;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.032, 14, 40), flangeMat);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = ex;
        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.535, 0.024, 12, 36), flangeMat);
        innerRing.rotation.y = Math.PI / 2;
        innerRing.position.x = ex;
        coilRoot.add(flange, ring, innerRing);
      }

      // 오른나사 감김 3D 에나멜 구리 코일(6.5바퀴: 왼쪽→오른쪽 진행 시 앞쪽 +Z에서 아래 -Y로 흐름!)
      const coilR = 0.6;
      const turns = 6.5;
      const coilLen = 2.24;
      const hPts: T.Vector3[] = [];
      const segs = 220;
      for (let i = 0; i <= segs; i++) {
        const u = i / segs;
        const x = -coilLen / 2 + u * coilLen;
        const th = u * turns * Math.PI * 2;
        hPts.push(new THREE.Vector3(x, -Math.sin(th) * coilR, Math.cos(th) * coilR));
      }
      const helixCurve = new THREE.CatmullRomCurve3(hPts);
      helixCurveRef = helixCurve;
      const copperMat = new THREE.MeshPhysicalMaterial({
        color: 0xe69849,
        metalness: 0.74,
        roughness: 0.22,
        clearcoat: 0.35,
        clearcoatRoughness: 0.22,
      });
      const helixMesh = new THREE.Mesh(new THREE.TubeGeometry(helixCurve, 240, 0.054, 14, false), copperMat);
      coilRoot.add(helixMesh);

      // 코일 도선을 따라 흐르는 전류 빛 입자(역추론 라운드 정답 전에는 숨김)
      const curBeadMat = new THREE.MeshBasicMaterial({ color: 0xfff08a });
      const curBeadGeo = new THREE.SphereGeometry(0.068, 12, 10);
      coilCurBeads = Array.from({ length: 8 }, () => {
        const m = new THREE.Mesh(curBeadGeo, curBeadMat);
        coilRoot.add(m);
        return m;
      });

      // 정밀 실험실 직류 전원 장치(계기판 창 + 전압 노브 + 전원 램프 + 단자)
      const pBox = new THREE.Mesh(makeRoundedBoxGeo(THREE, 1.84, 0.48, 0.96, 0.036), std(0x1b2940, 0.3, 0.44));
      pBox.position.set(0, -1.09, 0.08);
      const pPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.72, 0.22),
        new THREE.MeshBasicMaterial({ color: 0x0d1b2e }),
      );
      pPanel.position.set(-0.34, -1.05, 0.565);
      const pKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.08, 22), std(0x9fb3ce, 0.65, 0.28));
      pKnob.rotation.x = Math.PI / 2;
      pKnob.position.set(0.36, -1.05, 0.58);
      const pLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.032, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0x51cf66 }),
      );
      pLed.position.set(0.64, -0.98, 0.565);
      coilRoot.add(pBox, pPanel, pKnob, pLed);

      termLeftMat = std(0xe34b39, 0.3, 0.36);
      termRightMat = std(0x3487e5, 0.3, 0.36);
      const brassTermMat = std(0xe5b95c, 0.78, 0.24);
      const termL = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.075, 0.14, 20), termLeftMat);
      termL.position.set(-0.62, -0.84, 0.26);
      const capL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16), brassTermMat);
      capL.position.set(-0.62, -0.75, 0.26);
      const termR = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.075, 0.14, 20), termRightMat);
      termR.position.set(0.62, -0.84, 0.26);
      const capR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16), brassTermMat);
      capR.position.set(0.62, -0.75, 0.26);
      coilRoot.add(termL, capL, termR, capR);

      const spPower = makeBadgeSprite3d(THREE, "전원 장치", { color: "#DCE6F7", border: "rgba(255,255,255,0.26)", scale: 0.24 });
      spPower.position.set(0, -1.16, 0.62);
      coilRoot.add(spPower);

      const leadL = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-coilLen / 2, 0, coilR),
        new THREE.Vector3(-coilLen / 2, -0.68, coilR * 0.68),
        new THREE.Vector3(-0.62, -0.82, 0.26),
      ]);
      const leadR = new THREE.CatmullRomCurve3([
        new THREE.Vector3(coilLen / 2, 0, -coilR),
        new THREE.Vector3(coilLen / 2, -0.68, -coilR * 0.2),
        new THREE.Vector3(0.62, -0.82, 0.26),
      ]);
      coilRoot.add(
        new THREE.Mesh(new THREE.TubeGeometry(leadL, 24, 0.038, 12, false), copperMat),
        new THREE.Mesh(new THREE.TubeGeometry(leadR, 24, 0.038, 12, false), copperMat),
      );

      // 앞쪽 가닥(+Z) 위 볼트 옐로 전류 화살표 3개(손이 분리되어 가리지 않고 3줄 모두 선명하게 보인다!)
      frontCurArrs = [-0.74, 0, 0.74].map(() => {
        const a = makeFatArrow3d(THREE, {
          color: 0xffd400,
          body: 0.044,
          head: 0.112,
          headLen: 0.22,
          outline: 0x6e3f16,
          onTop: true,
        });
        coilRoot.add(a.g);
        return a;
      });
      spCurUnknown = makeBadgeSprite3d(THREE, "앞쪽 전류 방향은?", { color: "#FFE08A", border: "#FFD400", scale: 0.3 });
      spCurUnknown.position.set(0, 0.94, 0.62);
      spCurUnknown.visible = false;
      coilRoot.add(spCurUnknown);

      // 코일 속 중심 자기장 화살표 + 입체 자기장 선 4가닥 + 흐름 빛 구슬(정답 확인 시 피어오름)
      coreFieldArr = makeFatArrow3d(THREE, {
        color: 0xff6b5b,
        body: 0.052,
        head: 0.136,
        headLen: 0.28,
        outline: 0x4a120e,
        onTop: true,
      });
      coreFieldArr.g.visible = false;
      coilRoot.add(coreFieldArr.g);

      fieldLoopsGroup = new THREE.Group();
      coilRoot.add(fieldLoopsGroup);
      fieldLoopMats = [];
      fieldLoopCurves = [];
      fieldPulses = [];
      const loopPlanes = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      const loopCones: T.Mesh[] = [];
      const pulseGeo = new THREE.SphereGeometry(0.052, 12, 10);
      for (const ang of loopPlanes) {
        const pts: T.Vector3[] = [];
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const phi = u * Math.PI;
          const x = Math.cos(phi) * 1.86;
          const rad = 0.22 + Math.sin(phi) * 1.25;
          pts.push(new THREE.Vector3(x, Math.sin(ang) * rad, Math.cos(ang) * rad));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        fieldLoopCurves.push(curve);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xff7b6b,
          emissive: 0xff5a4a,
          emissiveIntensity: 0.55,
          roughness: 0.32,
          transparent: true,
          opacity: 0,
        });
        fieldLoopMats.push(mat);
        fieldLoopsGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 52, 0.025, 10, false), mat));
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.082, 0.21, 16), mat);
        cone.position.set(0, Math.sin(ang) * 1.47, Math.cos(ang) * 1.47);
        cone.rotation.z = Math.PI / 2;
        fieldLoopsGroup.add(cone);
        loopCones.push(cone);

        const pMesh = new THREE.Mesh(pulseGeo, mat);
        fieldLoopsGroup.add(pMesh);
        fieldPulses.push(pMesh);
      }
      fieldLoopsGroup.userData.cones = loopCones;

      // 양 끝 N극 / S극 배지
      spPoleN = makeBadgeSprite3d(THREE, "N극", { color: "#FFFFFF", border: "#FFA396", bg: "rgba(165,38,26,0.94)", scale: 0.36 });
      spPoleS = makeBadgeSprite3d(THREE, "S극", { color: "#FFFFFF", border: "#7EC0FF", bg: "rgba(26,78,148,0.94)", scale: 0.36 });
      spPoleN.visible = false;
      spPoleS.visible = false;
      coilRoot.add(spPoleN, spPoleS);

      // 양쪽 끝 정밀 3D 나침반 2개(x = -2.08, +2.08)
      compassNeedles = [];
      compassCovers = [];
      compassQBadges = [];
      for (const cx of [-2.08, 2.08]) {
        const cGroup = new THREE.Group();
        cGroup.position.set(cx, -0.15, 0);
        coilRoot.add(cGroup);

        // 받침 스탠드 기둥 + 플랜지
        rodBetween3d(THREE, new THREE.Vector3(0, -1.2, 0), new THREE.Vector3(0, -0.1, 0), 0.095, std(0x566c8e, 0.55, 0.34), cGroup);
        const cFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.06, 24), std(0x3a4d6b, 0.5, 0.38));
        cFlange.position.y = -1.17;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.6, 0.15, 40), std(0x18263e, 0.38, 0.38));
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.57, 0.052, 16, 44), std(0xc4d4ea, 0.78, 0.22));
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.068;
        const dial = new THREE.Mesh(
          new THREE.CylinderGeometry(0.52, 0.52, 0.02, 40),
          new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.58, metalness: 0.04 }),
        );
        dial.position.y = 0.076;
        cGroup.add(cFlange, body, rim, dial);

        // 마름모 각면 입체 자침(빨간 N극 + 파란 S극 + 황동 중심 캡)
        const needle = new THREE.Group();
        needle.position.y = 0.122;
        const redTip = new THREE.Mesh(new THREE.ConeGeometry(0.112, 0.44, 4), std(0xe64837, 0.24, 0.3));
        redTip.scale.set(1, 1, 0.42);
        redTip.rotation.z = -Math.PI / 2;
        redTip.position.x = 0.22;
        const blueTip = new THREE.Mesh(new THREE.ConeGeometry(0.112, 0.44, 4), std(0x368ae6, 0.24, 0.3));
        blueTip.scale.set(1, 1, 0.42);
        blueTip.rotation.z = Math.PI / 2;
        blueTip.position.x = -0.22;
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, 0.075, 20), brassTermMat);
        const pinCap = new THREE.Mesh(new THREE.SphereGeometry(0.058, 16, 12), brassTermMat);
        pinCap.position.y = 0.036;
        needle.add(redTip, blueTip, pin, pinCap);
        cGroup.add(needle);
        compassNeedles.push(needle);

        // 투명 유리 덮개 림
        const glassLens = new THREE.Mesh(
          new THREE.CylinderGeometry(0.54, 0.54, 0.018, 36),
          new THREE.MeshPhysicalMaterial({
            color: 0xdff0ff,
            roughness: 0.08,
            clearcoat: 0.9,
            transparent: true,
            opacity: 0.18,
          }),
        );
        glassLens.position.y = 0.165;
        cGroup.add(glassLens);

        // 정답 확인 전 가림 셔터 돔
        const cover = new THREE.Mesh(
          new THREE.CylinderGeometry(0.555, 0.555, 0.19, 36),
          new THREE.MeshPhysicalMaterial({ color: 0x1e3252, roughness: 0.32, metalness: 0.15, transparent: true, opacity: 0.94 }),
        );
        cover.position.y = 0.14;
        cGroup.add(cover);
        compassCovers.push(cover);

        const qSp = makeBadgeSprite3d(THREE, "?", { color: "#FFE08A", border: "#FFD400", scale: 0.42 });
        qSp.position.set(cx, 0.29, 0.18);
        coilRoot.add(qSp);
        compassQBadges.push(qSp);
      }

      // ━━━ 오른쪽 독립 영역: 스컬프팅 해부학 3D 감아 쥔 오른손 (코일과 완전 분리!) ━━━
      const handZone = new THREE.Group();
      handZone.position.set(2.84, 0.08, 0.08);
      scene.add(handZone);

      const hShadow = makeContactShadow3d(THREE, 1.45, 1.45, 0.46);
      hShadow.position.set(0, -1.46, 0);
      const hPed = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.16, 0.13, 44), std(0x182742, 0.35, 0.4));
      hPed.position.set(0, -1.32, 0);
      const hDeck = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.0, 0.03, 44), std(0x23385c, 0.4, 0.3));
      hDeck.position.set(0, -1.248, 0);
      const hRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.07, 0.032, 14, 48),
        new THREE.MeshBasicMaterial({ color: 0xffd400, transparent: true, opacity: 0.84 }),
      );
      hRing.rotation.x = Math.PI / 2;
      hRing.position.set(0, -1.24, 0);
      const hLabel = makeBadgeSprite3d(THREE, "3D 오른손 감아 쥐기", { color: "#FFE696", border: "#FFD400", scale: 0.25 });
      hLabel.position.set(0, -1.14, 0.0);
      handZone.add(hShadow, hPed, hDeck, hRing, hLabel);

      hand3d = buildGripHand3d(THREE);
      hand3d.group.position.y = 0.16;
      hand3d.group.scale.setScalar(0.94);
      handZone.add(hand3d.group);
    }

    function syncCoilArrows(): void {
      const rd = ROUNDS[round];
      const showCur = !rd.reverse || stp === "done";
      const xs = [-0.74, 0, 0.74];
      frontCurArrs.forEach((a, i) => {
        a.g.visible = showCur;
        const dirY = rd.dir === 1 ? -1 : 1; // dir=+1이면 앞쪽 아래(-Y), dir=-1이면 앞쪽 위(+Y)
        a.set(new THREE.Vector3(xs[i], -dirY * 0.34, 0.67), new THREE.Vector3(0, dirY, 0), 0.68);
      });
      coilCurBeads.forEach((b) => {
        b.visible = showCur;
      });
      if (spCurUnknown) spCurUnknown.visible = !showCur;
      if (termLeftMat && termRightMat) {
        termLeftMat.color.setHex(rd.dir === 1 ? 0xe34b39 : 0x3487e5);
        termRightMat.color.setHex(rd.dir === 1 ? 0x3487e5 : 0xe34b39);
      }
      if (coreFieldArr) {
        coreFieldArr.set(new THREE.Vector3(-rd.dir * 0.96, 0, 0), new THREE.Vector3(rd.dir, 0, 0), 1.92);
      }
      if (spPoleN && spPoleS) {
        spPoleN.position.set(rd.dir * 1.38, 0.74, 0.14);
        spPoleS.position.set(-rd.dir * 1.38, 0.74, 0.14);
      }
      if (fieldLoopsGroup) {
        const cones = (fieldLoopsGroup.userData.cones ?? []) as T.Mesh[];
        cones.forEach((c) => {
          c.rotation.z = rd.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
        });
      }
    }

    function setupRound(id: RoundId): void {
      round = id;
      const rd = ROUNDS[id];
      stp = rd.reverse ? "thumb" : "grip";
      wrongFlash = 0;
      fieldReveal = 0;
      compassReveal = rd.reverse ? 1 : 0;
      // 시작 시 오른손은 정답과 반대 자세로 두어 학생이 직접 돌려 맞추게 한다
      handDir = rd.dir === 1 ? -1 : 1;
      handRotZCur = handDir === 1 ? 0 : Math.PI;
      needleAngCur = rd.reverse ? (rd.dir === 1 ? 0 : Math.PI) : Math.PI / 2;

      syncCoilArrows();
      paintHud();
    }

    function currentPromptAndChoices(): { say: string; steps: [string, boolean, boolean][]; choices: Choice[] } {
      const rd = ROUNDS[round];
      if (!rd.reverse) {
        const up = rd.dir === -1;
        const stepList: [string, boolean, boolean][] = [
          ["① 네 손가락 (전류)", stp === "grip", stp !== "grip"],
          ["② 엄지 (N극 찾기)", stp === "pole", stp === "done"],
          ["③ 나침반·자기장 확인", false, stp === "done"],
        ];
        if (stp === "grip") {
          return {
            say: `<b>1단계</b> · 코일 앞쪽 가닥의 노란 전류 화살표가 <b>${up ? "위쪽" : "아래쪽"}</b>이에요. 3D 오른손의 <b>네 손가락</b>을 맞춰 감아 보세요.`,
            steps: stepList,
            choices: [
              { id: "g_up", label: "앞쪽에서 위로 감기", tone: "cur", ok: up },
              { id: "g_down", label: "앞쪽에서 아래로 감기", tone: "cur", ok: !up },
            ],
          };
        }
        if (stp === "pole") {
          return {
            say: "<b>2단계</b> · 잘 감아 쥐었어요! 3D 오른손의 <b>빨간 엄지손가락</b>이 가리키는 쪽은 어느 끝인가요?",
            steps: stepList,
            choices: [
              { id: "p_left", label: "왼쪽 끝이 N극", tone: "field", ok: up },
              { id: "p_right", label: "오른쪽 끝이 N극", tone: "field", ok: !up },
            ],
          };
        }
        return {
          say: `정확해요! <b>${up ? "왼쪽" : "오른쪽"} 끝이 N극</b>이 되어 양쪽 나침반의 빨간 바늘이 모두 <b>${up ? "왼쪽" : "오른쪽"}</b>을 가리켜요!`,
          steps: stepList,
          choices: [
            {
              id: round === 0 ? "go_r1" : "go_r2",
              label: round === 0 ? "2단계: 전류 반대 코일 체험으로" : "3단계: 나침반으로 거꾸로 찾기",
              tone: "main",
              ok: true,
            },
          ],
        };
      }

      // 라운드 2: 나침반으로 전류 방향 거꾸로 찾기
      const stepList: [string, boolean, boolean][] = [
        ["① 엄지 (N극 맞추기)", stp === "thumb", stp !== "thumb"],
        ["② 네 손가락 (전류 찾기)", stp === "cur", stp === "done"],
        ["③ 앞쪽 전류 확인", false, stp === "done"],
      ];
      if (stp === "thumb") {
        return {
          say: "<b>거꾸로 찾기 ①</b> · 나침반 빨간 바늘이 <b>오른쪽</b>을 가리켜 오른쪽 끝이 N극이에요. 3D 오른손의 <b>엄지</b>를 맞춰 보세요.",
          steps: stepList,
          choices: [
            { id: "t_right", label: "엄지: 오른쪽 끝(N극)", tone: "field", ok: true },
            { id: "t_left", label: "엄지: 왼쪽 끝", tone: "field", ok: false },
          ],
        };
      }
      if (stp === "cur") {
        return {
          say: "<b>거꾸로 찾기 ②</b> · 엄지를 오른쪽(N극)으로 맞추니 3D 오른손의 <b>네 손가락</b>이 앞쪽에서 어느 쪽으로 감기나요?",
          steps: stepList,
          choices: [
            { id: "c_down", label: "앞쪽에서 아래쪽으로 흘러요", tone: "cur", ok: true },
            { id: "c_up", label: "앞쪽에서 위쪽으로 흘러요", tone: "cur", ok: false },
          ],
        };
      }
      return {
        say: "완벽해요! 코일 앞쪽 전류가 아래쪽으로 흐를 때 오른쪽 끝이 N극이 돼요!",
        steps: stepList,
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

      // 손 회전 즉시 반영
      if (c.id === "g_up" || c.id === "t_left") handDir = -1;
      if (c.id === "g_down" || c.id === "t_right") handDir = 1;

      if (!c.ok) {
        haptic(HAPTIC.wrong);
        wrongFlash = 1;
        if (stp === "grip") {
          sayBar.innerHTML = "코일 앞쪽 구리선의 <b>노란 화살표</b>를 따라 네 손가락이 같은 방향으로 감기게 맞춰 보세요.";
        } else if (stp === "pole") {
          sayBar.innerHTML = "3D 오른손에서 <b>빨간 화살표가 달린 엄지손가락</b>이 왼쪽과 오른쪽 중 어디를 가리키는지 살펴보세요!";
        } else if (stp === "thumb") {
          sayBar.innerHTML = "나침반 빨간 바늘(N극)이 오른쪽을 가리키고 있어요. 엄지를 <b>오른쪽</b>으로 돌려 맞춰 보세요.";
        } else {
          sayBar.innerHTML = "맞춰 둔 3D 오른손의 <b>네 손가락(노란 곡선 화살표)</b>이 코일 앞쪽에서 어느 쪽으로 향하는지 확인해 보세요!";
        }
        return;
      }

      haptic(HAPTIC.correct);
      if (stp === "grip") stp = "pole";
      else if (stp === "pole") {
        stp = "done";
        completed.add(round);
      } else if (stp === "thumb") stp = "cur";
      else if (stp === "cur") {
        stp = "done";
        completed.add(round);
      }
      syncCoilArrows();
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

    // 드래그 오빗
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
      camGoal.az = clamp(camGoal.az - dx * 0.0075, -1.15, 1.15);
      camGoal.el = clamp(camGoal.el + dy * 0.0065, 0.06, 1.25);
    };
    const onUp = (): void => {
      dragging = false;
    };
    cv.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    const devCv = cv as unknown as { __grip?: () => unknown };
    if (import.meta.env.DEV) {
      devCv.__grip = () => ({
        round,
        step: stp,
        doneCount: completed.size,
        coilDir: ROUNDS[round].dir,
        handDir,
        matched: handDir === ROUNDS[round].dir,
      });
    }

    // 2D 폴백(WebGL2 없는 환경)
    const ctx2d = glStage ? null : cv.getContext("2d");
    function drawFallback2d(w: number, h: number): void {
      if (!ctx2d) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx2d.save();
      ctx2d.scale(dpr, dpr);
      ctx2d.clearRect(0, 0, w, h);
      const rd = ROUNDS[round];
      const cx = w / 2;
      const cy = h * 0.52;
      const showCur = !rd.reverse || stp === "done";
      const showCmp = rd.reverse || stp === "done";
      mCoil(ctx2d, cx, cy, { cur: showCur, dir: rd.dir });
      for (const ox of [-118, 118]) {
        if (showCmp) mCompass(ctx2d, cx + ox, cy, rd.dir === 1 ? 0 : Math.PI, 24);
        else mSlot(ctx2d, cx + ox, cy, "?", 24);
      }
      xText(ctx2d, `오른손 엄지 방향: ${handDir === 1 ? "오른쪽" : "왼쪽"}`, cx, cy + 56, { px: 14, w: 800, color: X.field });
      if (stp === "done") {
        xArrow(ctx2d, cx - rd.dir * 42, cy, cx + rd.dir * 42, cy, X.field, 3.2, 10);
        xText(ctx2d, "N극", cx + rd.dir * 72, cy - 36, { px: 14, w: 800, color: "#FFB3A6" });
        xText(ctx2d, "S극", cx - rd.dir * 72, cy - 36, { px: 14, w: 800, color: "#9CC8FF" });
      }
      ctx2d.restore();
    }

    setupRound(round);

    let elapsed = 0;
    const loop: Loop = createLoop((dt) => {
      const dtSec = Math.min(0.05, dt / 60);
      elapsed += dtSec;
      const { w, h } = rStage.size();
      const rd = ROUNDS[round];

      const rotGoal = handDir === 1 ? 0 : Math.PI;
      handRotZCur += (rotGoal - handRotZCur) * Math.min(1, dtSec * 8.5);

      const solved = stp === "done";
      fieldReveal += ((solved ? 1 : 0) - fieldReveal) * Math.min(1, dtSec * 4.5);
      compassReveal += ((solved || rd.reverse ? 1 : 0) - compassReveal) * Math.min(1, dtSec * 5.5);
      const needleGoal = solved || rd.reverse ? (rd.dir === 1 ? 0 : Math.PI) : Math.PI / 2;
      needleAngCur += (needleGoal - needleAngCur) * Math.min(1, dtSec * 7.5);
      if (wrongFlash > 0) wrongFlash = Math.max(0, wrongFlash - dtSec * 2.2);

      if (!glStage) {
        drawFallback2d(w, h);
        return;
      }

      if (cv.width !== Math.floor(w * S.stagePixelRatio(cv, w, h)) || cv.height !== Math.floor(h * S.stagePixelRatio(cv, w, h))) {
        glStage.resize(w, h);
      }

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

      // 3D 오른손 회전 + 단계 강조(코일과 분리되어 있으므로 완전 솔리드 1.0 유지!)
      if (hand3d) {
        hand3d.setPose(handRotZCur);
        hand3d.group.position.x = wrongFlash > 0 ? Math.sin(elapsed * 45) * 0.06 * wrongFlash : 0;
        hand3d.setOpacity(1.0);
        const focus = stp === "grip" || stp === "cur" ? "fingers" : stp === "pole" || stp === "thumb" ? "thumb" : "both";
        hand3d.setFocus(focus, elapsed);
      }

      // 코일 나선 도선 위 흐르는 전류 빛 입자(오른나사 감김: dir=+1이면 u 증가, dir=-1이면 u 감소)
      if (helixCurveRef && coilCurBeads.length > 0) {
        coilCurBeads.forEach((b, bi) => {
          if (!b.visible) return;
          const raw = (elapsed * 0.16 + bi / coilCurBeads.length) % 1;
          const u = rd.dir === 1 ? raw : 1 - raw;
          b.position.copy(helixCurveRef!.getPoint(u));
        });
      }

      // 나침반 가림막 & 바늘 회전
      compassCovers.forEach((c) => {
        c.visible = compassReveal < 0.85;
        (c.material as T.MeshPhysicalMaterial).opacity = 0.92 * (1 - compassReveal);
      });
      compassQBadges.forEach((b) => {
        b.visible = compassReveal < 0.35;
      });
      compassNeedles.forEach((n) => {
        n.rotation.y = needleAngCur;
      });

      // 정답 시 입체 자기장 선 & 흐름 펄스 & N/S극 배지 페이드인
      if (coreFieldArr) {
        coreFieldArr.g.visible = fieldReveal > 0.03;
        coreFieldArr.setOpacity(fieldReveal * 0.95);
      }
      if (fieldLoopsGroup) {
        fieldLoopsGroup.visible = fieldReveal > 0.03;
        const pulse = 0.44 + 0.16 * Math.sin(elapsed * 4.0);
        fieldLoopMats.forEach((m) => {
          m.opacity = fieldReveal * pulse;
        });
        fieldPulses.forEach((pm, li) => {
          const curve = fieldLoopCurves[li];
          if (!curve) return;
          const raw = (elapsed * 0.38 + li * 0.25) % 1;
          const u = rd.dir === 1 ? raw : 1 - raw;
          pm.position.copy(curve.getPoint(u));
        });
      }
      if (spPoleN && spPoleS) {
        const showPoles = solved || rd.reverse;
        spPoleN.visible = showPoles;
        spPoleS.visible = showPoles;
      }

      glStage.render();
    }).start();

    stopLandscape = () => {
      loop.stop();
      cv.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (import.meta.env.DEV) delete devCv.__grip;
      glStage?.dispose();
    };
  }

  openBtn.addEventListener("click", () => {
    void openLandscape();
  });

  syncPortraitLog();
  f.say("3D 구리 코일에 <b>오른손을 직접 감아 쥐며</b> N극과 전류 방향을 찾아볼게요. 아래 버튼을 눌러 가로 화면 체험을 열어 보세요.");
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
