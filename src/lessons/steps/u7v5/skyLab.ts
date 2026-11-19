// u7SkyLab: 하루 동안 별의 움직임(u7l4).
// 가로 화면 3D(enterRotateStage + space3d)로 두 장면을 유기적으로 연결한다:
//   1. 우주에서 보기(mode = "space"): 고정된 천구 속에서 지구가 서 → 동으로 자전할 때,
//      우리나라(북위 37°) 관측자의 지평선이 함께 돌며 별이 동 → 서로 움직이는 것처럼 보이는 원리를 본다.
//   2. 천구 안에서 보기(mode = "dome"): 북위 37° 우리나라의 투명한 3D 천구 반구에서
//      '전체 천구'와 '동·남·서·북' 하늘을 시점 전환하며 하나의 천구 운동이 네 방향에서 어떻게 다르게 보이는지 관측한다.
//   3. 북쪽 하늘에서 제자리에서 움직이지 않는 별(북극성)을 직접 누른 뒤, 세로 화면으로 돌아와 도는 방향을 판정하고 정리한다.
// 모든 별의 위치는 위도 37°N의 정확한 구면 좌표 s(δ, H) = cos δ (cos H · M + sin H · W) + sin δ · P 로 계산한다.

import { el, clamp } from "../../../core/dom";
import { createLoop, type Loop } from "../../../core/anim";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import type { SpaceStage, THREE as T } from "../../../ui/space3d";
import type { RotateStage } from "../../../ui/rotateStage";
import { u7Frame, u7Goals, u7Dev } from "./kit";

interface SkyStep {
  title: string;
  cta?: string;
}

type Mode = "space" | "dome";
type Dir = "E" | "S" | "W" | "N";
type DomeView = "all" | Dir;

const DIRS: Dir[] = ["E", "S", "W", "N"];
const DIR_NAME: Record<Dir, string> = { E: "동쪽", S: "남쪽", W: "서쪽", N: "북쪽" };
const DIR_SHORT: Record<Dir, string> = { E: "동", S: "남", W: "서", N: "북" };
const DIR_OBSERVED: Record<Dir, string> = {
  E: "동쪽 하늘의 별은 오른쪽 위로 비스듬히 떠올라요.",
  S: "남쪽 하늘의 별은 왼쪽에서 오른쪽으로 지나가요.",
  W: "서쪽 하늘의 별은 오른쪽 아래로 비스듬히 져요.",
  N: "북쪽 하늘의 별은 한 별을 중심으로 원을 그리며 돌아요.",
};

const DEG = Math.PI / 180;
const LAT = 37 * DEG; // 우리나라 대표 위도 북위 37°
const SIN_PHI = Math.sin(LAT);
const COS_PHI = Math.cos(LAT);

// Dome 좌표계: +X 동, -X 서, +Y 천정(위), +Z 남, -Z 북
const POLE: [number, number, number] = [0, SIN_PHI, -COS_PHI];
const MERID: [number, number, number] = [0, COS_PHI, SIN_PHI];
const WEST: [number, number, number] = [-1, 0, 0];

const R_DOME = 10;
const R_SKY = 8.2;
const R_EARTH = 2.55;
const MAXQ = 24; // 15분 단위 × 24 = 6시간(저녁 8시 ~ 새벽 2시, 지구 90° 자전)
const NEED_EARTH = 12; // 3시간 이상 자전시키면 1단계 완료
const NEED_SKY = 14; // 3시간 30분 이상 밀면 해당 방위 관측 완료
const TRAIL_SEGS = 24;

// 북두칠성 상대 기하(적위 61°~70°, 북극성에서 20°~29° 거리). 위도 37°N 북쪽 하늘에서 저녁 8시~새벽 2시 내내 화면 안에 선명히 보인다.
const DIPPER: { dec: number; ha0: number }[] = [
  { dec: 69.5, ha0: -78 }, // 두베(국자 끝 1)
  { dec: 65.5, ha0: -78 }, // 메라크(국자 끝 2, 두베로 이으면 북극성)
  { dec: 63.6, ha0: -94 }, // 페크다
  { dec: 66.2, ha0: -100 }, // 메그레즈
  { dec: 65.6, ha0: -114 }, // 알리오트
  { dec: 64.8, ha0: -128 }, // 미자르
  { dec: 60.8, ha0: -140 }, // 알카이드
];
const DIPPER_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];

interface TrailStar {
  dec: number; // deg
  ha0: number; // deg at t = 0
  mag: number; // 0.6..1.15
  dipper?: boolean;
  arrow?: boolean;
}

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTrailCatalog(): TrailStar[] {
  const list: TrailStar[] = [];
  // 1) 북두칠성 7별
  DIPPER.forEach((d, idx) => {
    list.push({ dec: d.dec, ha0: d.ha0, mag: 1.08, dipper: true, arrow: idx === 0 || idx === 6 });
  });
  // 2) 북쪽 주극성(북극성 둘레 동심원이 사방으로 균형 있게 보이도록)
  const circumpolar: [number, number, boolean][] = [
    [76, -150, true], [75, -35, false], [74, 85, true], [73, 195, false],
    [65, 18, true], [63, 130, true], [60, 225, false], [67, -145, false],
    [54, 48, false], [52, 160, false],
  ];
  for (const [dec, ha0, arrow] of circumpolar) list.push({ dec, ha0, mag: arrow ? 0.95 : 0.78, arrow });
  // 3) 동쪽 하늘에서 떠오르는 별(H0: -158° ~ -78°, 6시간 내내 지평선 위 중단부에 밝은 별과 화살촉이 고르게 보이도록)
  const eastStars: [number, number, boolean][] = [
    [34, -135, true], [24, -148, true], [14, -142, true], [4, -134, true],
    [-6, -126, true], [20, -118, true], [8, -108, true], [0, -100, true],
    [-12, -92, true], [30, -108, false], [16, -156, false], [-2, -148, false],
    [28, -90, false], [-16, -78, false],
  ];
  for (const [dec, ha0, arrow] of eastStars) list.push({ dec, ha0, mag: arrow ? 0.96 : 0.78, arrow });
  // 4) 남쪽 하늘을 왼쪽 → 오른쪽으로 지나는 별(H0: -60° ~ -12°)
  const southStars: [number, number, boolean][] = [
    [24, -54, true], [12, -46, true], [0, -40, true], [-12, -36, true],
    [-22, -32, false], [30, -32, false], [6, -60, false], [-6, -20, true],
    [18, -22, false],
  ];
  for (const [dec, ha0, arrow] of southStars) list.push({ dec, ha0, mag: arrow ? 0.96 : 0.78, arrow });
  // 5) 서쪽 하늘로 지는 별(H0: +14° ~ +68°)
  const westStars: [number, number, boolean][] = [
    [34, 24, true], [22, 32, true], [10, 38, true], [0, 44, true],
    [-10, 48, true], [28, 56, false], [14, 18, false], [4, 62, false],
    [-16, 32, false], [38, 44, false],
  ];
  for (const [dec, ha0, arrow] of westStars) list.push({ dec, ha0, mag: arrow ? 0.96 : 0.78, arrow });
  return list;
}

const TRAIL_STARS = buildTrailCatalog();

/** 위도 37°N 천구 단위 벡터 s(δ, H). H가 커질수록(시간이 흐를수록) 별은 동 → 남 → 서, 북쪽은 시계 반대 방향으로 움직인다. */
function starDir(decDeg: number, haRad: number): [number, number, number] {
  const d = decDeg * DEG;
  const cd = Math.cos(d);
  const sd = Math.sin(d);
  const ch = Math.cos(haRad);
  const sh = Math.sin(haRad);
  return [
    cd * sh * WEST[0],
    cd * ch * MERID[1] + sd * POLE[1],
    cd * ch * MERID[2] + sd * POLE[2],
  ];
}

function timeLabel(q: number): string {
  const total = 20 * 60 + Math.round(q) * 15;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const part = h24 >= 20 && h24 < 21 ? "저녁" : h24 >= 21 || h24 === 0 ? "밤" : "새벽";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${part} ${h12}시${m ? ` ${m}분` : ""}`;
}

/** 부드러운 별빛 스프라이트 텍스처. */
function makeStarSpriteTex(THREE: typeof T, coreHex: string, haloRgba: string): T.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(0.22, coreHex);
  g.addColorStop(0.52, haloRgba);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 지평선 바닥 원판 텍스처(깊은 밤하늘 지면 + 방위 십자선 + 부드러운 가장자리). */
function makeGroundTex(THREE: typeof T): T.CanvasTexture {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  const c = S / 2;
  const bg = ctx.createRadialGradient(c, c, 12, c, c, c);
  bg.addColorStop(0, "#1A2C46");
  bg.addColorStop(0.62, "#101E34");
  bg.addColorStop(0.92, "#0B1628");
  bg.addColorStop(1, "#070E1C");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  // 동심원 지평 눈금
  ctx.strokeStyle = "rgba(130,168,230,0.16)";
  ctx.lineWidth = 2;
  for (const frac of [0.35, 0.7, 0.96]) {
    ctx.beginPath();
    ctx.arc(c, c, c * frac, 0, Math.PI * 2);
    ctx.stroke();
  }
  // 동서 · 남북 방위 기준선
  ctx.strokeStyle = "rgba(145,182,240,0.22)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(20, c);
  ctx.lineTo(S - 20, c);
  ctx.moveTo(c, 20);
  ctx.lineTo(c, S - 20);
  ctx.stroke();
  ctx.setLineDash([]);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const u7SkyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SkyStep;
  const f = u7Frame(host, { title: s.title, steps: 4, cls: "u7x-enter", api });
  const doneCta = s.cta ?? "자전과 일주 운동 정리하기";

  const enterBtn = el(
    "button",
    { class: "u7x-enterbtn pulse", attrs: { type: "button" } },
    el("span", { text: "가로 화면으로 천구 열기" }),
  ) as HTMLButtonElement;
  const art = el("div", { class: "u7x-enter-art", html: enterArtSvg() });
  f.stage.append(art, enterBtn);

  const goalsUi = u7Goals(1, [
    { id: "earth", name: "지구 자전과 천구 연결하기", sub: "지구가 돌 때 별은 어떻게 보일까요?" },
    { id: "skies", name: "동·남·서·북 하늘 모두 관측하기", sub: "하나의 천구에서 네 방향을 바라봐요" },
    { id: "pole", name: "북쪽 하늘에서 북극성 찾기", sub: "제자리에서 움직이지 않는 별은?" },
  ]);
  const FOUND: Record<string, string> = {
    earth: "지구 서 → 동 자전, 별은 동 → 서",
    skies: "동·남·서·북 네 하늘 모두 관측",
    pole: "북극성 발견!",
  };
  f.slot.setControls(el("div", { class: "u7x-cap", text: "가로 화면에서 세 가지 탐구를 차례로 해 보세요" }), goalsUi.el);
  f.say("가로 화면을 열어 <b>지구의 자전</b>과 <b>천구 속 별의 움직임</b>을 3D로 연결해 보세요.");
  f.pips(1);

  const goals = new Set<string>();
  const seenDirs = new Set<Dir>();
  const maxQByDir: Record<Dir, number> = { E: 0, S: 0, W: 0, N: 0 };
  let maxQSpace = 0;
  let poleFound = false;
  let finished = false;
  let asked = false;
  let disposed = false;

  host.dataset.u7Phase = "play";
  host.dataset.u7Found = "0";
  host.dataset.u7Seen = "0";

  // 가로 3D 상태
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let loop: Loop | null = null;
  let doneBar: HTMLElement | null = null;
  let guideEl: HTMLElement | null = null;
  let miniDomeEl: HTMLElement | null = null;

  let mode: Mode = "space";
  let domeView: DomeView = "all";
  let q = 0; // 0..24 (0 = 저녁 8시, 24 = 새벽 2시)

  // 테스트/개발용 핸들러
  let applyModeFn: ((m: Mode) => void) | null = null;
  let applyViewFn: ((v: DomeView) => void) | null = null;
  let applyTimeFn: ((v: number) => void) | null = null;
  let syncUiFn: (() => void) | null = null;

  function showDone(): void {
    if (!finished || !rot || doneBar) return;
    const back = el("button", { class: "u7x-rotdone-btn", attrs: { type: "button" }, text: "돌아가서 정리하기" });
    back.addEventListener("click", () => rot?.leave());
    doneBar = el("div", { class: "u7x-rotdone" }, el("span", { text: "세 가지 탐구를 모두 완료했어요!" }), back);
    rot.stage.appendChild(doneBar);
    guideEl?.classList.add("hide");
    if (rot.size().w < 860) miniDomeEl?.classList.add("hide");
  }

  function collect(id: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    goalsUi.done(id, FOUND[id]);
    host.dataset.u7Found = String(goals.size);
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      showDone();
    }
  }

  function setJudgeArt(revealed: boolean): void {
    art.classList.add("judge");
    art.innerHTML = judgeArtSvg(revealed);
    host.dataset.u7Art = revealed ? "a" : "q";
  }

  function askDirection(): void {
    asked = true;
    host.dataset.u7Phase = "ask";
    f.pips(3);
    setJudgeArt(false);
    f.say("가로 화면에서 관측한 <b>북쪽 하늘</b>의 자취예요. 밝은 점과 화살표를 보고 답해 보세요.");
    f.slot.ask(
      "북쪽 하늘의 별들은 북극성을 중심으로 <b>어느 방향</b>으로 돌았나요?",
      [{ t: "시계 반대 방향", ok: true }, { t: "시계 방향" }],
      (ok) => {
        setJudgeArt(true);
        api.recordQuiz(ok);
      },
      {
        why: "별이 이동한 자취의 끝(밝은 점과 화살표)을 따라가 보면 시계 반대 방향으로 돌았어요.",
        onNext: conclude,
      },
    );
  }

  function conclude(): void {
    host.dataset.u7Phase = "done";
    setJudgeArt(true);
    f.pips(4);
    f.say("가로 화면을 다시 열어 지구 자전과 천구 전체의 별 움직임을 언제든 비교해 볼 수 있어요.");
    f.slot.conclude(
      "별이 실제로 도는 것이 아니라 <b>지구가 서쪽에서 동쪽으로 하루에 한 바퀴씩 자전</b>하기 때문에, 별이 반대 방향(동쪽에서 서쪽)으로 하루에 한 바퀴 도는 것처럼 보여요.",
    );
    api.enableCTA(doneCta);
  }

  async function enter(): Promise<void> {
    if (rot) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../../ui/rotateStage");
    if (disposed) return;

    rot = enterRotateStage({
      title: "하루 동안 별의 움직임",
      onLeave: () => leave(),
    });

    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;

    // ── 상단 왼쪽: 1. 우주 / 2. 천구 안 전환 탭 ──
    const tabSpace = el(
      "button",
      { class: "u7x-sky-tab on", attrs: { type: "button", "aria-pressed": "true" }, dataset: { m: "space" } },
      el("span", { text: "1. 우주" }),
    ) as HTMLButtonElement;
    const tabDome = el(
      "button",
      { class: "u7x-sky-tab", attrs: { type: "button", "aria-pressed": "false" }, dataset: { m: "dome" } },
      el("span", { text: "2. 천구 안" }),
    ) as HTMLButtonElement;
    const tabsBar = el("div", { class: "u7x-sky-tabs" }, tabSpace, tabDome);

    // ── 둘째 줄 안내 알약 ──
    const guideDot = el("span", { class: "pdot", style: "background:#FFC24E" });
    const guideText = el("span", { text: "아래 시각 막대를 오른쪽으로 밀어 지구를 자전시켜 보세요." });
    const guide = el("div", { class: "pill sp3-pill u7x-rpill u7x-sky-guide" }, guideDot, guideText);
    guideEl = guide;

    // ── 1단계 전용: 오른쪽 위 '지구 위 관측자 시선' 연동 미니 창 ──
    const miniSkyCv = el("canvas", { class: "u7x-sky-minicv", attrs: { width: "280", height: "96" } }) as HTMLCanvasElement;
    const miniCard = el(
      "div",
      { class: "u7x-sky-mini" },
      el("div", { class: "u7x-sky-mini-k", text: "지구 위 관측자 시선" }),
      miniSkyCv,
      el("div", { class: "u7x-sky-mini-s", text: "별은 동 → 서로 이동" }),
    );

    // ── 2단계(동·남·서·북 하늘) 전용: 오른쪽 위 실시간 '전체 천구' 연동 미니 창 ──
    const miniDomeTitle = el("div", { class: "u7x-sky-mini-k", text: "전체 천구 · 동쪽 시선" });
    const miniDomeCv = el("canvas", { class: "u7x-sky-minidomecv", attrs: { width: "360", height: "224" } }) as HTMLCanvasElement;
    const miniDomeSub = el("div", { class: "u7x-sky-mini-s", text: "눌러서 전체 천구 보기" });
    const miniDomeCard = el(
      "button",
      { class: "u7x-sky-minidome", attrs: { type: "button", hidden: "", "aria-label": "전체 천구 화면으로 전환" } },
      miniDomeTitle,
      miniDomeCv,
      miniDomeSub,
    ) as HTMLButtonElement;
    miniDomeEl = miniDomeCard;

    // ── 3D 투영 라벨 레이어 ──
    const labelLayer = el("div", { class: "u7x-sky-labels" });
    const mkLbl = (text: string, cls = ""): HTMLElement => {
      const node = el("div", { class: `u7x-sky-lbl ${cls}`, text });
      labelLayer.appendChild(node);
      return node;
    };
    // 우주 장면 라벨
    const lblSpacePole = mkLbl("북극성 (자전축 끝)", "gold");
    const lblSpaceSpin = mkLbl("지구 자전 (서 → 동)", "amber");
    const lblSpaceKorea = mkLbl("우리나라 (관측자)", "cyan");
    const lblSpaceSky = mkLbl("천구 (별은 제자리 고정)", "dim");
    // 천구 장면 라벨
    const lblCardE = mkLbl("동", "cardinal");
    const lblCardS = mkLbl("남", "cardinal");
    const lblCardW = mkLbl("서", "cardinal");
    const lblCardN = mkLbl("북", "cardinal");
    const lblDomePole = mkLbl("북극성", "gold");
    const lblDomeAxis = mkLbl("자전축 방향 (고도 37°)", "dim");
    const lblDomeObs = mkLbl("관측자", "cyan");
    const lblSideL = el("div", { class: "u7x-sky-side left" });
    const lblSideR = el("div", { class: "u7x-sky-side right" });
    labelLayer.append(lblSideL, lblSideR);
    // 북극성 발견 전 반짝반짝 힌트 + 발견 후 강조 고리(화면 투영)
    const poleHint = el("div", { class: "u7x-sky-polehint" }, el("i", { class: "h1" }), el("i", { class: "h2" }), el("b"));
    const poleRing = el("div", { class: "u7x-sky-polering" });
    labelLayer.append(poleHint, poleRing);

    // ── 하단 조작 도크(한 줄): 왼쪽(상태/방향 버튼) + 오른쪽(시각 슬라이더) ──
    const spaceNextBtn = el(
      "button",
      { class: "u7x-sky-go", attrs: { type: "button" } },
      el("span", { text: "2. 천구 안으로 들어가기" }),
    ) as HTMLButtonElement;
    const spaceBadge = el("div", { class: "u7x-sky-spbadge" }, el("b", { text: "지구 서 → 동" }), el("span", { text: "별은 고정" }));
    const spaceLeft = el("div", { class: "u7x-sky-dockl" }, spaceBadge, spaceNextBtn);

    const viewBtns = new Map<DomeView, HTMLButtonElement>();
    const domeLeft = el("div", { class: "u7x-sky-views", attrs: { hidden: "" } });
    const VIEW_LIST: { v: DomeView; label: string }[] = [
      { v: "all", label: "전체" },
      { v: "E", label: "동" },
      { v: "S", label: "남" },
      { v: "W", label: "서" },
      { v: "N", label: "북" },
    ];
    for (const item of VIEW_LIST) {
      const b = el(
        "button",
        {
          class: `u7x-sky-vbtn${item.v === "all" ? " wide on" : ""}`,
          attrs: { type: "button", "aria-pressed": String(item.v === "all") },
          dataset: { v: item.v },
        },
        el("span", { text: item.label }),
      ) as HTMLButtonElement;
      viewBtns.set(item.v, b);
      domeLeft.appendChild(b);
    }

    // 회전된 모바일(rotate 90deg)에서도 완벽하게 동작하는 커스텀 포인터 시각 막대
    const clockOut = el("div", { class: "u7x-sky-clock", text: timeLabel(0) });
    const trackFill = el("div", { class: "u7x-sky-fill" });
    const trackThumb = el("div", { class: "u7x-sky-thumb" });
    const trackRail = el("div", { class: "u7x-sky-rail" }, trackFill, trackThumb);
    const sliderHit = el(
      "div",
      {
        class: "u7x-sky-slider",
        attrs: {
          role: "slider",
          tabindex: "0",
          "aria-label": "관측 시각 조절",
          "aria-valuemin": "0",
          "aria-valuemax": String(MAXQ),
          "aria-valuenow": "0",
          "aria-valuetext": timeLabel(0),
        },
      },
      trackRail,
      el(
        "div",
        { class: "u7x-sky-ticks" },
        el("span", { text: "저녁 8시" }),
        el("span", { text: "밤 11시" }),
        el("span", { text: "새벽 2시" }),
      ),
    );
    const timeRight = el("div", { class: "u7x-sky-time" }, clockOut, sliderHit);
    const dock = el("div", { class: "u7x-sky-dock" }, spaceLeft, domeLeft, timeRight);

    rot.stage.append(canvas, labelLayer, tabsBar, guide, miniCard, miniDomeCard, dock);

    // ── Three.js 동적 로드 ──
    const S = await import("../../../ui/space3d");
    if (disposed || !rot) return;
    const THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 44 });
    if (!st) {
      guideText.textContent = "이 기기에서는 3D 화면을 열 수 없어요";
      finished = true;
      asked = true;
      api.recordQuiz(true);
      rot?.leave();
      conclude();
      f.say("이 기기에서는 3D 화면을 열 수 없어 핵심 내용으로 바로 정리할게요.");
      return;
    }

    const { scene, camera } = st;
    scene.background = new THREE.Color(0x060c1b);

    // 배경 원거리 별빛(두 장면 공통)
    scene.add(S.makeStars(600, 160));

    // 조명(우주 장면 지구용; 천구 장면은 BasicMaterial이라 조명 영향을 받지 않는다)
    scene.add(new THREE.AmbientLight(0x88a4d4, 1.05));
    const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.0);
    keyLight.position.set(12, 9, 18);
    scene.add(keyLight);

    const starTexBlue = makeStarSpriteTex(THREE, "#DCEAFF", "rgba(145,190,255,0.45)");
    const starTexGold = makeStarSpriteTex(THREE, "#FFF0BE", "rgba(255,212,110,0.55)");

    // =========================================================================
    // 장면 1: 우주에서 보기(고정된 천구 속 서 → 동 자전하는 지구)
    // =========================================================================
    const spaceGroup = new THREE.Group();
    scene.add(spaceGroup);

    // 1) 바깥 고정 천구(와이어프레임 경위선 + 밝은 천구 적도)
    const skyWireGroup = new THREE.Group();
    spaceGroup.add(skyWireGroup);
    const addCircle = (
      parent: T.Group,
      radius: number,
      y: number,
      color: number,
      opacity: number,
      plane: "xz" | "xy" | "yz" = "xz",
      segs = 72,
    ): void => {
      const pts: T.Vector3[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        if (plane === "xz") pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
        else if (plane === "xy") pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
        else pts.push(new THREE.Vector3(0, Math.sin(a) * radius, Math.cos(a) * radius));
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
      );
      parent.add(line);
    };
    addCircle(skyWireGroup, R_SKY, 0, 0x76a8ff, 0.34, "xz", 96); // 천구 적도
    for (const latDeg of [-45, 45]) {
      const r = R_SKY * Math.cos(latDeg * DEG);
      const y = R_SKY * Math.sin(latDeg * DEG);
      addCircle(skyWireGroup, r, y, 0x4f74b5, 0.16, "xz", 72);
    }
    for (let m = 0; m < 4; m++) {
      const mer = new THREE.Group();
      addCircle(mer, R_SKY, 0, 0x4f74b5, 0.14, "xy", 72);
      mer.rotation.y = (m * Math.PI) / 4;
      skyWireGroup.add(mer);
    }
    // 반투명 천구 유리 껍질
    const skyShell = new THREE.Mesh(
      new THREE.SphereGeometry(R_SKY, 40, 24),
      new THREE.MeshBasicMaterial({ color: 0x162b56, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }),
    );
    skyWireGroup.add(skyShell);

    // 고정된 천구 별들(지구가 돌아도 절대 움직이지 않는다)
    {
      const r = rng(107);
      const count = 170;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = r() * 2 - 1;
        const th = r() * Math.PI * 2;
        const sr = Math.sqrt(1 - u * u);
        pos[i * 3] = sr * Math.cos(th) * (R_SKY - 0.08);
        pos[i * 3 + 1] = u * (R_SKY - 0.08);
        pos[i * 3 + 2] = sr * Math.sin(th) * (R_SKY - 0.08);
        const b = 0.65 + r() * 0.35;
        col[i * 3] = b * 0.9;
        col[i * 3 + 1] = b * 0.95;
        col[i * 3 + 2] = b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      skyWireGroup.add(
        new THREE.Points(g, new THREE.PointsMaterial({ size: 2.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.92 })),
      );
      // 천구 적도·중위도 대표 밝은 별(고정됨이 뚜렷하게 보이도록)
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const elev = ((i % 3) - 1) * 22 * DEG;
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: i % 4 === 0 ? starTexGold : starTexBlue, transparent: true, depthWrite: false }),
        );
        sp.position.set(
          Math.cos(elev) * Math.cos(ang) * (R_SKY - 0.1),
          Math.sin(elev) * (R_SKY - 0.1),
          Math.cos(elev) * Math.sin(ang) * (R_SKY - 0.1),
        );
        sp.scale.set(0.62, 0.62, 1);
        skyWireGroup.add(sp);
      }
      // 천구 북극(북극성)
      const poleSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTexGold, transparent: true, depthWrite: false }));
      poleSp.position.set(0, R_SKY, 0);
      poleSp.scale.set(1.35, 1.35, 1);
      skyWireGroup.add(poleSp);
    }

    // 자전축 막대(남극 → 북극 → 북극성)
    {
      const axisPts = [new THREE.Vector3(0, -R_SKY * 0.85, 0), new THREE.Vector3(0, R_SKY, 0)];
      const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPts);
      const axisLine = new THREE.Line(
        axisGeo,
        new THREE.LineDashedMaterial({ color: 0xffdf8e, dashSize: 0.45, gapSize: 0.3, transparent: true, opacity: 0.72 }),
      );
      axisLine.computeLineDistances();
      spaceGroup.add(axisLine);
    }

    // 2) 중심의 자전하는 지구 + 우리나라(북위 37°, 동경 127°) 관측자 + 미니 천구 지평선
    const earthGroup = new THREE.Group();
    spaceGroup.add(earthGroup);
    const earthMesh = S.makePlanet("earth", R_EARTH, 48);
    earthGroup.add(earthMesh);

    // Three.js SphereGeometry UV 기준: 동경 127° → phi = (127 + 180)° = 307°, 위도 37°N → theta = 53°
    const koreaPhi = 307 * DEG;
    const koreaUp = new THREE.Vector3(
      -Math.cos(koreaPhi) * COS_PHI,
      SIN_PHI,
      Math.sin(koreaPhi) * COS_PHI,
    ).normalize();
    const koreaNorth = new THREE.Vector3(0, 1, 0).addScaledVector(koreaUp, -koreaUp.y).normalize();
    const koreaEast = new THREE.Vector3().crossVectors(koreaNorth, koreaUp).normalize();
    const koreaBasis = new THREE.Matrix4().makeBasis(koreaEast, koreaUp, koreaNorth.clone().negate());

    const observerMount = new THREE.Group();
    observerMount.position.copy(koreaUp).multiplyScalar(R_EARTH);
    observerMount.quaternion.setFromRotationMatrix(koreaBasis);
    earthGroup.add(observerMount);

    // 우리나라 관측자의 작은 지평선 원판 + 미니 천구 반구(2단계 천구와 직접 이어지는 시각 장치!)
    const miniHoriz = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 32),
      new THREE.MeshBasicMaterial({ color: 0x38d9a9, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
    );
    miniHoriz.rotation.x = -Math.PI / 2;
    miniHoriz.position.y = 0.04;
    observerMount.add(miniHoriz);

    const miniHorizRim = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 32 }, (_, i) => {
          const a = (i / 32) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * 1.1, 0.05, Math.sin(a) * 1.1);
        }),
      ),
      new THREE.LineBasicMaterial({ color: 0x63e6be, transparent: true, opacity: 0.9 }),
    );
    observerMount.add(miniHorizRim);

    const miniDomeShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x74c0fc, transparent: true, opacity: 0.16, wireframe: true, depthWrite: false }),
    );
    miniDomeShell.position.y = 0.04;
    observerMount.add(miniDomeShell);

    // 관측자 핀
    const pinMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.45, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd43b }),
    );
    pinMesh.position.y = 0.24;
    observerMount.add(pinMesh);
    const pinHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff3bf }),
    );
    pinHead.position.y = 0.5;
    observerMount.add(pinHead);

    // 관측자 위치의 자전축 방향 선(미니 천구의 북극성 방향 표시)
    const koreaWorldPos = new THREE.Vector3();

    // 지구 앞쪽 적도 자전 화살표(서 → 동, 월드 고정)
    {
      const rA = R_EARTH + 0.72;
      const arcPts: T.Vector3[] = [];
      for (let i = 0; i <= 32; i++) {
        const a = (-52 + (104 * i) / 32) * DEG; // 왼쪽(-x, 서) → 앞(+z) → 오른쪽(+x, 동)
        arcPts.push(new THREE.Vector3(Math.sin(a) * rA, -0.35, Math.cos(a) * rA));
      }
      const curve = new THREE.CatmullRomCurve3(arcPts);
      const arrowTube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 36, 0.065, 8, false),
        new THREE.MeshBasicMaterial({ color: 0xffbe3d }),
      );
      spaceGroup.add(arrowTube);
      const tipPos = curve.getPoint(1);
      const tipTan = curve.getTangent(1);
      const arrowCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.22, 0.56, 12),
        new THREE.MeshBasicMaterial({ color: 0xffd45e }),
      );
      arrowCone.position.copy(tipPos);
      arrowCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tipTan);
      spaceGroup.add(arrowCone);
    }

    // t = 0일 때 우리나라가 카메라 앞쪽 왼쪽(-42°), t = 3h일 때 정면(+3°), t = 6h일 때 오른쪽(+48°)으로 서 → 동 회전
    const EARTH_BASE_Y = 101 * DEG;

    // =========================================================================
    // 장면 2: 천구 안에서 보기(위도 37°N 우리나라 3D 천구 반구)
    // =========================================================================
    const domeGroup = new THREE.Group();
    domeGroup.visible = false;
    scene.add(domeGroup);

    // 1) 지면 원판 + 지평선 고리 + 야간 능선 실루엣
    const groundDisc = new THREE.Mesh(
      new THREE.CircleGeometry(R_DOME, 72),
      new THREE.MeshBasicMaterial({ map: makeGroundTex(THREE), side: THREE.DoubleSide }),
    );
    groundDisc.rotation.x = -Math.PI / 2;
    domeGroup.add(groundDisc);

    const horizonRing = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 96 }, (_, i) => {
          const a = (i / 96) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * R_DOME, 0.03, Math.sin(a) * R_DOME);
        }),
      ),
      new THREE.LineBasicMaterial({ color: 0x6f97d8, transparent: true, opacity: 0.72 }),
    );
    domeGroup.add(horizonRing);

    // 지평선 둘레 낮은 산 능선(관측자 시점에서 밤하늘 지평선 실감)
    {
      const ridgeVerts: number[] = [];
      const N = 128;
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * Math.PI * 2;
        const a1 = ((i + 1) / N) * Math.PI * 2;
        const hFn = (a: number): number =>
          0.32 + 0.24 * Math.sin(a * 5 + 0.7) + 0.16 * Math.cos(a * 9 - 0.4) + 0.08 * Math.sin(a * 17);
        const r0 = R_DOME - 0.06;
        const x0 = Math.cos(a0) * r0, z0 = Math.sin(a0) * r0, y0 = Math.max(0.08, hFn(a0));
        const x1 = Math.cos(a1) * r0, z1 = Math.sin(a1) * r0, y1 = Math.max(0.08, hFn(a1));
        ridgeVerts.push(x0, 0, z0, x1, 0, z1, x1, y1, z1, x0, 0, z0, x1, y1, z1, x0, y0, z0);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(ridgeVerts, 3));
      domeGroup.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x050a16, side: THREE.DoubleSide })));
    }

    // 중심 관측자 모형(전체 천구 보기에서만 보인다)
    const obsFigure = new THREE.Group();
    const obsBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.78, 12), new THREE.MeshBasicMaterial({ color: 0x63e6be }));
    obsBody.position.y = 0.4;
    const obsHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), new THREE.MeshBasicMaterial({ color: 0xb2f2bb }));
    obsHead.position.y = 0.96;
    obsFigure.add(obsBody, obsHead);
    domeGroup.add(obsFigure);

    // 2) 투명 천구 반구 껍질 + 자오선 + 기울어진 천구 적도 + 나란한 일주권 안내선(전체 천구에서 핵심!)
    const domeShellMat = new THREE.MeshBasicMaterial({
      color: 0x1a315e,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const domeShell = new THREE.Mesh(new THREE.SphereGeometry(R_DOME, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), domeShellMat);
    domeGroup.add(domeShell);

    const guideMats: T.LineBasicMaterial[] = [];
    // 남북 자오선 호
    {
      const pts: T.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * Math.PI;
        pts.push(new THREE.Vector3(0, Math.sin(a) * R_DOME, -Math.cos(a) * R_DOME));
      }
      const mat = new THREE.LineBasicMaterial({ color: 0x5c7eb8, transparent: true, opacity: 0.28 });
      guideMats.push(mat);
      domeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    // 나란한 일주권 원(적위 65°, 25°, 0° — 모두 자전축에 수직인 나란한 원!)
    for (const [decDeg, color] of [[65, 0x8cb8ff], [25, 0x6f9ef0], [0, 0x63e6be]] as [number, number][]) {
      const segPts: T.Vector3[] = [];
      for (let i = 0; i <= 96; i++) {
        const ha = -Math.PI + (i / 96) * Math.PI * 2;
        const [sx, sy, sz] = starDir(decDeg, ha);
        if (sy >= 0) segPts.push(new THREE.Vector3(sx * R_DOME, sy * R_DOME, sz * R_DOME));
        else if (segPts.length > 1) {
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: decDeg === 0 ? 0.34 : 0.24 });
          guideMats.push(mat);
          domeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segPts.slice()), mat));
          segPts.length = 0;
        } else {
          segPts.length = 0;
        }
      }
      if (segPts.length > 1) {
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: decDeg === 0 ? 0.34 : 0.24 });
        guideMats.push(mat);
        domeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(segPts), mat));
      }
    }

    // 기울어진 자전축 점선(관측자 → 북극성, 지평선과 37°)
    const poleVec = new THREE.Vector3(POLE[0] * R_DOME, POLE[1] * R_DOME, POLE[2] * R_DOME);
    const domeAxisMat = new THREE.LineDashedMaterial({ color: 0xffdf8e, dashSize: 0.45, gapSize: 0.32, transparent: true, opacity: 0.55 });
    const domeAxisLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.1, 0), poleVec]),
      domeAxisMat,
    );
    domeAxisLine.computeLineDistances();
    domeGroup.add(domeAxisLine);

    // 북극성(움직이지 않는 중심 별)
    const polarisSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: starTexGold, transparent: true, depthWrite: false }),
    );
    polarisSprite.position.copy(poleVec).multiplyScalar(0.985);
    polarisSprite.scale.set(0.88, 0.88, 1);
    domeGroup.add(polarisSprite);

    // 3) 배경 별무리(천구 축 P를 중심으로 -dH 만큼 강체 회전, 지평선 위만 보이도록)
    const bgStarsGroup = new THREE.Group();
    domeGroup.add(bgStarsGroup);
    const poleAxisUnit = new THREE.Vector3(POLE[0], POLE[1], POLE[2]).normalize();
    {
      const r = rng(313);
      const count = 260;
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = r() * 2 - 1;
        const th = r() * Math.PI * 2;
        const sr = Math.sqrt(1 - u * u);
        pos[i * 3] = sr * Math.cos(th) * (R_DOME - 0.15);
        pos[i * 3 + 1] = u * (R_DOME - 0.15);
        pos[i * 3 + 2] = sr * Math.sin(th) * (R_DOME - 0.15);
        const b = 0.45 + r() * 0.48;
        col[i * 3] = b * 0.88;
        col[i * 3 + 1] = b * 0.93;
        col[i * 3 + 2] = b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      // 지평선 아래(y < 0)를 깔끔히 가리는 클리핑 없이 지면 아래는 지면 원판과 어두운 하반구가 자연스럽게 가려 주지만,
      // 외부 전체 보기에서는 아래로 삐져나오지 않게 반구 위쪽 점만 그리거나 y<0 가리기용 셰이더/매프레임 가시 처리를 한다.
      // 여기서는 단순하고 확실하게: 매 시각 갱신 시 별점 y >= 0.08인 점만 그린다(배경 별 좌표는 원본 배열 보관).
      bgStarsGroup.userData.base = pos.slice();
      bgStarsGroup.userData.geo = g;
      bgStarsGroup.add(
        new THREE.Points(g, new THREE.PointsMaterial({ size: 2.1, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.78 })),
      );
    }

    // 4) 대표 일주 운동 별 + 실시간 자취 선 + 진행 방향 화살촉
    interface StarObj {
      spec: TrailStar;
      sprite: T.Sprite;
      line: T.Line;
      posArr: Float32Array;
      colArr: Float32Array;
      arrow: T.Mesh | null;
    }
    const arrowGeo = new THREE.ConeGeometry(0.14, 0.42, 8);
    const arrowMatBlue = new THREE.MeshBasicMaterial({ color: 0xbfe0ff });
    const arrowMatGold = new THREE.MeshBasicMaterial({ color: 0xffe49c });

    const starObjs: StarObj[] = TRAIL_STARS.map((spec) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: spec.dipper ? starTexGold : starTexBlue, transparent: true, depthWrite: false }),
      );
      const sc = (spec.dipper ? 0.78 : 0.56) * spec.mag;
      sprite.scale.set(sc, sc, 1);
      domeGroup.add(sprite);

      const posArr = new Float32Array((TRAIL_SEGS + 1) * 3);
      const colArr = new Float32Array((TRAIL_SEGS + 1) * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92 }),
      );
      domeGroup.add(line);

      let arrow: T.Mesh | null = null;
      if (spec.arrow) {
        arrow = new THREE.Mesh(arrowGeo, spec.dipper ? arrowMatGold : arrowMatBlue);
        arrow.visible = false;
        domeGroup.add(arrow);
      }
      return { spec, sprite, line, posArr, colArr, arrow };
    });

    // 북두칠성 별자리 잇는 선
    const dipperPosArr = new Float32Array(DIPPER_EDGES.length * 2 * 3);
    const dipperGeo = new THREE.BufferGeometry();
    dipperGeo.setAttribute("position", new THREE.BufferAttribute(dipperPosArr, 3));
    const dipperLines = new THREE.LineSegments(
      dipperGeo,
      new THREE.LineBasicMaterial({ color: 0xffe29a, transparent: true, opacity: 0.65 }),
    );
    domeGroup.add(dipperLines);

    // =========================================================================
    // 시각 갱신 함수 (우주 지구 자전 + 미니 창 + 천구 별 자취를 한 번에 동기화)
    // =========================================================================
    const tmpVec = new THREE.Vector3();
    const tmpVec2 = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();
    const upY = new THREE.Vector3(0, 1, 0);

    function drawMiniObserver(hours: number): void {
      const ctx = miniSkyCv.getContext("2d");
      if (!ctx) return;
      const w = miniSkyCv.width;
      const h = miniSkyCv.height;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#081226");
      bg.addColorStop(1, "#162A52");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // 남쪽 하늘을 바라보는 관측자: 왼쪽이 동, 오른쪽이 서. 지구가 서 → 동으로 돌수록 별은 왼쪽(동) → 오른쪽(서)으로 이동!
      const frac = hours / 6;
      const miniStars: [number, number, number][] = [
        [34, 28, 3.6],
        [92, 46, 3.0],
        [146, 24, 3.4],
      ];
      for (const [x0, y0, r] of miniStars) {
        const x1 = x0 + frac * 98;
        const y1 = y0 - Math.sin(frac * Math.PI) * 8;
        if (frac > 0.02) {
          const grad = ctx.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, "rgba(150,200,255,0.12)");
          grad.addColorStop(1, "rgba(215,236,255,0.92)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo((x0 + x1) / 2, y0 - 6, x1, y1);
          ctx.stroke();
          // 작은 화살촉
          ctx.fillStyle = "#E6F1FF";
          ctx.beginPath();
          ctx.moveTo(x1 + 6, y1);
          ctx.lineTo(x1 - 3, y1 - 4.5);
          ctx.lineTo(x1 - 3, y1 + 4.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = "#FFF4CC";
        ctx.beginPath();
        ctx.arc(x1, y1, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 땅과 동·서 표식
      ctx.fillStyle = "#060B18";
      ctx.fillRect(0, h - 22, w, 22);
      ctx.font = "800 18px Pretendard, sans-serif";
      ctx.fillStyle = "#B8D0F8";
      ctx.textAlign = "left";
      ctx.fillText("동", 14, h - 6);
      ctx.textAlign = "right";
      ctx.fillText("서", w - 14, h - 6);
      ctx.textAlign = "center";
      ctx.fillStyle = "#6F8FC0";
      ctx.fillText("남쪽 하늘", w / 2, h - 6);
    }

    /** 2단계(동·남·서·북 하늘)에서 오른쪽 위에 함께 띄우는 실시간 '전체 천구' 미니 창.
     *  현재 보고 있는 방향의 시선 부채꼴을 밝게 비추고, 전체 천구 별 자취를 시각 막대와 1:1로 동기화해 그린다. */
    function drawMiniDome(hours: number, activeDir: Dir): void {
      const ctx = miniDomeCv.getContext("2d");
      if (!ctx) return;
      const w = miniDomeCv.width;
      const h = miniDomeCv.height;
      ctx.clearRect(0, 0, w, h);

      // 배경
      const bg = ctx.createRadialGradient(w / 2, h * 0.45, 16, w / 2, h * 0.5, w * 0.65);
      bg.addColorStop(0, "#102042");
      bg.addColorStop(1, "#060D1D");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // 전체 천구 3D 카메라(orbitAz ≈ 0.60, orbitEl ≈ 0.43)와 같은 각도의 직교 투영
      const AZ = 0.6;
      const EL = 0.43;
      const ca = Math.cos(AZ), sa = Math.sin(AZ);
      const ce = Math.cos(EL), se = Math.sin(EL);
      const cx = w * 0.5;
      const cy = h * 0.67;
      const sc = 114;
      const proj = (x: number, y: number, z: number): [number, number] => [
        cx + (x * ca - z * sa) * sc,
        cy - (-x * sa * se + y * ce - z * ca * se) * sc,
      ];

      // 1) 바닥 지평선 원판
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const [px, py] = proj(Math.cos(a), 0, Math.sin(a));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(18, 35, 64, 0.9)";
      ctx.fill();
      ctx.strokeStyle = "rgba(115, 156, 224, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 방위 십자 점선
      ctx.save();
      ctx.strokeStyle = "rgba(130, 168, 228, 0.22)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 5]);
      for (const [[x1, z1], [x2, z2]] of [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]]) {
        const [p1x, p1y] = proj(x1, 0, z1);
        const [p2x, p2y] = proj(x2, 0, z2);
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
      }
      ctx.restore();

      // 2) 현재 보고 있는 방향(동/남/서/북) 시선 부채꼴(바닥 + 천구 벽면 하이라이트)
      const DIR_ANG: Record<Dir, number> = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
      const DIR_VEC: Record<Dir, [number, number, number]> = { E: [1, 0, 0], S: [0, 0, 1], W: [-1, 0, 0], N: [0, 0, -1] };
      const aMid = DIR_ANG[activeDir];
      const halfSpread = 34 * DEG;

      // 바닥 부채꼴
      ctx.beginPath();
      const [ox, oy] = proj(0, 0, 0);
      ctx.moveTo(ox, oy);
      for (let i = 0; i <= 16; i++) {
        const a = aMid - halfSpread + (halfSpread * 2 * i) / 16;
        const [px, py] = proj(Math.cos(a), 0, Math.sin(a));
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(99, 230, 190, 0.28)";
      ctx.fill();
      ctx.strokeStyle = "rgba(99, 230, 190, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 천구 벽면 시선 창(고도 0° ~ 62°)
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = aMid - halfSpread + (halfSpread * 2 * i) / 12;
        const [px, py] = proj(Math.cos(a), 0, Math.sin(a));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const elevTop = 62 * DEG;
      for (let i = 12; i >= 0; i--) {
        const a = aMid - halfSpread + (halfSpread * 2 * i) / 12;
        const [px, py] = proj(Math.cos(a) * Math.cos(elevTop), Math.sin(elevTop), Math.sin(a) * Math.cos(elevTop));
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(116, 192, 252, 0.14)";
      ctx.fill();
      ctx.strokeStyle = "rgba(116, 192, 252, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 관측자 → 현재 시선 화살표
      const [ax, ay] = proj(Math.cos(aMid) * 0.64, 0.04, Math.sin(aMid) * 0.64);
      ctx.strokeStyle = "#63E6BE";
      ctx.lineWidth = 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      // 3) 투명 천구 외곽 반구 호
      ctx.beginPath();
      ctx.arc(cx, cy, sc, Math.PI, 0, false);
      ctx.strokeStyle = "rgba(128, 170, 240, 0.42)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 4) 나란한 일주권 안내선(적위 65°, 25°, 0°)
      for (const [decDeg, col] of [[65, "rgba(140,184,255,0.28)"], [25, "rgba(115,162,240,0.22)"], [0, "rgba(99,230,190,0.34)"]] as [number, string][]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = decDeg === 0 ? 1.8 : 1.3;
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= 72; i++) {
          const ha = -Math.PI + (i / 72) * Math.PI * 2;
          const [sx, sy, sz] = starDir(decDeg, ha);
          if (sy >= 0) {
            const [px, py] = proj(sx, sy, sz);
            if (!pen) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            pen = true;
          } else {
            pen = false;
          }
        }
        ctx.stroke();
      }

      // 5) 기울어진 자전축(고도 37°) + 북극성 점
      const [ppx, ppy] = proj(POLE[0], POLE[1], POLE[2]);
      ctx.save();
      ctx.strokeStyle = "rgba(255, 223, 142, 0.6)";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ppx, ppy);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#FFF1B8";
      ctx.beginPath();
      ctx.arc(ppx, ppy, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // 6) 실시간 동기화 별 + 자취(현재 보고 있는 방향의 별을 더 밝게 강조!)
      const dH = hours * 15 * DEG;
      const [lx, , lz] = DIR_VEC[activeDir];
      for (let si = 0; si < TRAIL_STARS.length; si++) {
        // 미니 창이 과밀하지 않도록 대표 별 약 22개(북두칠성 주요 별 + 각 방위 화살표 별)를 그린다
        const spec = TRAIL_STARS[si];
        if (!spec.arrow && si % 2 === 1) continue;
        const ha0 = spec.ha0 * DEG;
        const [ex, ey, ez] = starDir(spec.dec, ha0 + dH);
        const inView = ex * lx + ez * lz > 0.3;

        if (dH > 0.01) {
          ctx.beginPath();
          let pen = false;
          const nStep = 14;
          for (let k = 0; k <= nStep; k++) {
            const [sx, sy, sz] = starDir(spec.dec, ha0 + (dH * k) / nStep);
            if (sy >= 0.02) {
              const [px, py] = proj(sx, sy, sz);
              if (!pen) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
              pen = true;
            } else {
              pen = false;
            }
          }
          ctx.strokeStyle = inView ? "rgba(255, 228, 148, 0.92)" : "rgba(148, 192, 255, 0.36)";
          ctx.lineWidth = inView ? 2.4 : 1.3;
          ctx.lineCap = "round";
          ctx.stroke();
        }
        if (ey >= 0.03) {
          const [px, py] = proj(ex, ey, ez);
          ctx.fillStyle = inView ? "#FFF5CC" : "rgba(204, 226, 255, 0.72)";
          ctx.beginPath();
          ctx.arc(px, py, inView ? 3.5 : 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7) 중심 관측자 점 + 동·남·서·북 방위 표시
      ctx.fillStyle = "#63E6BE";
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "800 18px Pretendard, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cardPts: [Dir, number, number][] = [
        ["E", 1.15, 0],
        ["S", 0, 1.16],
        ["W", -1.15, 0],
        ["N", 0, -1.15],
      ];
      for (const [d, rx, rz] of cardPts) {
        const [bx, by] = proj(rx, 0.02, rz);
        const on = d === activeDir;
        if (on) {
          ctx.fillStyle = "#4A54E1";
          ctx.beginPath();
          ctx.roundRect(bx - 16, by - 13, 32, 26, 13);
          ctx.fill();
          ctx.strokeStyle = "#8F9BFF";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
        ctx.fillStyle = on ? "#FFFFFF" : "#A9C2EB";
        ctx.fillText(DIR_SHORT[d], bx, by + 1);
      }
    }

    function updateSkyPositions(): void {
      const hours = q / 4;
      const dH = hours * 15 * DEG;

      // 1) 우주 장면: 지구가 서 → 동(+Y 반시계)으로 자전! 바깥 천구는 고정!
      earthGroup.rotation.y = EARTH_BASE_Y + dH;
      drawMiniObserver(hours);
      if (mode === "dome" && domeView !== "all") drawMiniDome(hours, domeView);

      // 2) 천구 장면: 배경 별 강체 회전(-dH around POLE) + 지평선 아래 숨김
      const basePos = bgStarsGroup.userData.base as Float32Array;
      const bgGeo = bgStarsGroup.userData.geo as T.BufferGeometry;
      const bgAttr = bgGeo.attributes.position as T.BufferAttribute;
      tmpQuat.setFromAxisAngle(poleAxisUnit, -dH);
      for (let i = 0; i < basePos.length; i += 3) {
        tmpVec.set(basePos[i], basePos[i + 1], basePos[i + 2]).applyQuaternion(tmpQuat);
        if (tmpVec.y < 0.08) {
          bgAttr.setXYZ(i / 3, 0, -999, 0);
        } else {
          bgAttr.setXYZ(i / 3, tmpVec.x, tmpVec.y, tmpVec.z);
        }
      }
      bgAttr.needsUpdate = true;

      // 3) 대표 일주 운동 별 + 자취 선 + 진행 방향 화살촉
      const rStar = R_DOME - 0.14;
      for (const obj of starObjs) {
        const ha0 = obj.spec.ha0 * DEG;
        const haCur = ha0 + dH;
        const [cx, cy, cz] = starDir(obj.spec.dec, haCur);
        const visibleNow = cy >= 0.035;
        obj.sprite.visible = visibleNow;
        if (visibleNow) obj.sprite.position.set(cx * rStar, cy * rStar, cz * rStar);

        // 자취 점 계산(지평선 위 구간만 연결)
        let nPts = 0;
        if (dH > 0.004) {
          const steps = Math.max(4, Math.ceil((dH / (90 * DEG)) * TRAIL_SEGS));
          for (let i = 0; i <= steps; i++) {
            const frac = i / steps;
            const [sx, sy, sz] = starDir(obj.spec.dec, ha0 + dH * frac);
            if (sy < 0.025) continue;
            const idx = nPts * 3;
            obj.posArr[idx] = sx * rStar;
            obj.posArr[idx + 1] = sy * rStar;
            obj.posArr[idx + 2] = sz * rStar;
            const glow = 0.14 + 0.86 * frac * frac;
            if (obj.spec.dipper) {
              obj.colArr[idx] = 1.0 * glow;
              obj.colArr[idx + 1] = 0.88 * glow;
              obj.colArr[idx + 2] = 0.58 * glow;
            } else {
              obj.colArr[idx] = 0.62 * glow;
              obj.colArr[idx + 1] = 0.82 * glow;
              obj.colArr[idx + 2] = 1.0 * glow;
            }
            nPts++;
          }
        }
        const g = obj.line.geometry as T.BufferGeometry;
        g.setDrawRange(0, nPts >= 2 ? nPts : 0);
        (g.attributes.position as T.BufferAttribute).needsUpdate = true;
        (g.attributes.color as T.BufferAttribute).needsUpdate = true;
        obj.line.visible = nPts >= 2;

        if (obj.arrow) {
          if (visibleNow && nPts >= 3 && dH >= 14 * DEG) {
            const iEnd = (nPts - 1) * 3;
            const iPrev = (nPts - 2) * 3;
            tmpVec.set(obj.posArr[iEnd], obj.posArr[iEnd + 1], obj.posArr[iEnd + 2]);
            tmpVec2.set(obj.posArr[iPrev], obj.posArr[iPrev + 1], obj.posArr[iPrev + 2]);
            const dirVec = tmpVec.clone().sub(tmpVec2);
            if (dirVec.lengthSq() > 0.0001) {
              dirVec.normalize();
              obj.arrow.visible = true;
              obj.arrow.position.copy(tmpVec).addScaledVector(dirVec, -0.05);
              obj.arrow.quaternion.setFromUnitVectors(upY, dirVec);
            } else {
              obj.arrow.visible = false;
            }
          } else {
            obj.arrow.visible = false;
          }
        }
      }

      // 4) 북두칠성 연결선
      let dIdx = 0;
      for (const [a, b] of DIPPER_EDGES) {
        const sa = starObjs[a].sprite;
        const sb = starObjs[b].sprite;
        if (sa.visible && sb.visible) {
          dipperPosArr[dIdx++] = sa.position.x;
          dipperPosArr[dIdx++] = sa.position.y;
          dipperPosArr[dIdx++] = sa.position.z;
          dipperPosArr[dIdx++] = sb.position.x;
          dipperPosArr[dIdx++] = sb.position.y;
          dipperPosArr[dIdx++] = sb.position.z;
        }
      }
      dipperGeo.setDrawRange(0, dIdx / 3);
      (dipperGeo.attributes.position as T.BufferAttribute).needsUpdate = true;
    }

    // =========================================================================
    // 카메라 목표 계산 & 부드러운 시점 전환
    // =========================================================================
    let orbitAz = 0.62; // 전체 천구 / 우주 보기 수평 회전각
    let orbitEl = 0.42; // 전체 천구 / 우주 보기 고도각
    const camPosTarget = new THREE.Vector3(0, 7.2, 27.5);
    const camLookCur = new THREE.Vector3(0, 0.2, 0);
    const camLookTarget = new THREE.Vector3(0, 0.2, 0);
    let camFovTarget = 42;
    let snapCam = true;

    function computeCameraTargets(): void {
      if (!rot) return;
      const { w, h } = rot.size();
      const aspect = w / Math.max(1, h);

      if (mode === "space") {
        // 1. 우주 보기: 바깥 천구(R_SKY=8.2)와 북극성 라벨이 상단/하단 HUD 사이에 넉넉히 들어오도록 거리 계산
        const dist = aspect < 1.55 ? 34.5 : h < 450 ? 33.5 : 30.5;
        const az = clamp(orbitAz - 0.62, -0.75, 0.75);
        const elAng = clamp(orbitEl, 0.16, 0.85);
        camPosTarget.set(
          Math.sin(az) * Math.cos(elAng) * dist,
          Math.sin(elAng) * dist,
          Math.cos(az) * Math.cos(elAng) * dist,
        );
        camLookTarget.set(0, h < 450 ? 0.6 : 0.35, 0);
        camFovTarget = 42;
        return;
      }

      if (domeView === "all") {
        // 전체 천구 보기(바깥 남동쪽 위에서 위도 37° 천구 반구 전체와 동·남·서·북이 모두 들어오게)
        const dist = aspect < 1.55 ? 31.5 : h < 450 ? 31.0 : 27.5;
        const elAng = clamp(orbitEl, 0.22, 0.92);
        camPosTarget.set(
          Math.sin(orbitAz) * Math.cos(elAng) * dist,
          2.2 + Math.sin(elAng) * dist,
          Math.cos(orbitAz) * Math.cos(elAng) * dist,
        );
        camLookTarget.set(0, 2.7, 0);
        camFovTarget = 44;
        return;
      }

      // 동·남·서·북 하늘: 천구 안쪽 관측자 시선으로 부드럽게 진입!
      const back = 2.8;
      camFovTarget = aspect < 1.55 ? 56 : 50;
      if (domeView === "E") {
        camPosTarget.set(-back, 1.55, 0);
        camLookTarget.set(R_DOME, 3.85, 0);
      } else if (domeView === "S") {
        camPosTarget.set(0, 1.55, -back);
        camLookTarget.set(0, 3.85, R_DOME);
      } else if (domeView === "W") {
        camPosTarget.set(back, 1.55, 0);
        camLookTarget.set(-R_DOME, 3.85, 0);
      } else {
        // 북쪽 하늘: 북극성(고도 37°)이 상단 완료 배너 아래 중앙에 넉넉히 자리 잡도록
        camPosTarget.set(0, 1.45, back);
        camLookTarget.set(0, h < 450 ? 4.35 : 4.85, -R_DOME);
      }
    }

    // =========================================================================
    // UI 갱신 & 미션 판정
    // =========================================================================
    function syncSliderUi(): void {
      const pct = (q / MAXQ) * 100;
      trackFill.style.width = `${pct.toFixed(1)}%`;
      trackThumb.style.left = `${pct.toFixed(1)}%`;
      const txt = timeLabel(q);
      clockOut.textContent = txt;
      sliderHit.setAttribute("aria-valuenow", String(Math.round(q)));
      sliderHit.setAttribute("aria-valuetext", txt);
    }

    function syncGuide(): void {
      if (finished) {
        guideDot.style.background = "#40C057";
        guideText.textContent = "모든 탐구를 마쳤어요! 돌아가서 정리해 보세요.";
        return;
      }
      if (mode === "space") {
        if (!goals.has("earth")) {
          guideDot.style.background = "#FFC24E";
          guideText.textContent = "아래 시각 막대를 밀어 지구를 서 → 동으로 자전시켜 보세요.";
        } else {
          guideDot.style.background = "#63E6BE";
          guideText.textContent = "지구가 서 → 동으로 돌면 별은 동 → 서로 보여요! '2. 천구 안'으로 들어가 보세요.";
        }
        return;
      }
      // dome 모드
      if (seenDirs.size === 4 && !poleFound) {
        guideDot.style.background = "#FFD43B";
        if (domeView === "N") {
          guideText.textContent = "북쪽 하늘에서 제자리에서 움직이지 않는 별을 찾아 눌러 보세요.";
        } else {
          guideText.textContent = "네 하늘을 모두 봤어요! '북' 하늘을 눌러 움직이지 않는 별을 찾아 보세요.";
        }
        return;
      }
      if (poleFound && !goals.has("earth")) {
        guideDot.style.background = "#63E6BE";
        guideText.textContent = "북극성을 찾았어요! 왼쪽 위 '1. 우주'에서 지구 자전도 확인해 보세요.";
        return;
      }
      if (domeView === "all") {
        guideDot.style.background = "#74C0FC";
        guideText.textContent = "전체 천구예요. 아래 동·남·서·북 버튼을 눌러 네 방향 하늘을 관측해 보세요.";
      } else if (seenDirs.has(domeView)) {
        guideDot.style.background = "#63E6BE";
        const remain = DIRS.filter((d) => !seenDirs.has(d)).map((d) => DIR_SHORT[d]).join("·");
        guideText.textContent = remain
          ? `${DIR_OBSERVED[domeView]} 아직 안 본 방향(${remain})도 눌러 보세요.`
          : DIR_OBSERVED[domeView];
      } else {
        guideDot.style.background = "#FFC24E";
        guideText.textContent = `${DIR_NAME[domeView]} 하늘이에요. 시각 막대를 끝까지 밀어 별의 움직임을 확인해 보세요.`;
      }
    }

    function syncControlsUi(): void {
      const isSpace = mode === "space";
      tabSpace.classList.toggle("on", isSpace);
      tabSpace.classList.toggle("done", goals.has("earth"));
      tabSpace.setAttribute("aria-pressed", String(isSpace));
      tabDome.classList.toggle("on", !isSpace);
      tabDome.classList.toggle("done", goals.has("skies") && goals.has("pole"));
      tabDome.setAttribute("aria-pressed", String(!isSpace));
      tabDome.classList.toggle("pulse", isSpace && goals.has("earth") && !goals.has("skies"));

      miniCard.hidden = !isSpace;
      const showMiniDome = !isSpace && domeView !== "all";
      miniDomeCard.hidden = !showMiniDome;
      if (!isSpace && domeView !== "all") {
        miniDomeTitle.textContent = `전체 천구 · ${DIR_NAME[domeView]} 시선`;
        miniDomeCard.classList.toggle("hide", finished && (rot?.size().w ?? 999) < 860);
        drawMiniDome(q / 4, domeView);
      }
      spaceLeft.hidden = !isSpace;
      domeLeft.hidden = isSpace;
      spaceNextBtn.classList.toggle("hot", goals.has("earth"));

      for (const [v, b] of viewBtns) {
        const active = v === domeView;
        b.classList.toggle("on", active);
        b.setAttribute("aria-pressed", String(active));
        if (v !== "all") b.classList.toggle("done", seenDirs.has(v));
      }
      spaceGroup.visible = isSpace;
      domeGroup.visible = !isSpace;
      obsFigure.visible = !isSpace && domeView === "all";
      const SIDES: Record<Dir, [string, string]> = { E: ["북", "남"], S: ["동", "서"], W: ["남", "북"], N: ["서", "동"] };
      const showSides = !isSpace && domeView !== "all";
      lblSideL.classList.toggle("on", showSides);
      lblSideR.classList.toggle("on", showSides);
      if (!isSpace && domeView !== "all") {
        lblSideL.textContent = SIDES[domeView][0];
        lblSideR.textContent = SIDES[domeView][1];
      }
      host.dataset.u7Mode = mode;
      host.dataset.u7View = isSpace ? "space" : domeView;
      syncGuide();
    }

    function setMode(m: Mode): void {
      if (mode === m) return;
      mode = m;
      haptic(HAPTIC.select);
      orbitAz = 0.62;
      orbitEl = 0.42;
      if (m === "dome" && domeView === "all" && q === 0) {
        q = 12; // 전체 천구에 들어올 때 별 자취가 바로 보이도록 3시간 자취 표시
      }
      snapCam = true;
      syncSliderUi();
      updateSkyPositions();
      computeCameraTargets();
      syncControlsUi();
    }

    function setDomeView(v: DomeView): void {
      if (mode !== "dome") {
        mode = "dome";
        snapCam = true;
      }
      if (domeView === v && mode === "dome") {
        syncControlsUi();
        return;
      }
      domeView = v;
      haptic(HAPTIC.select);
      if (v !== "all" && !seenDirs.has(v)) {
        // 아직 관측하지 않은 방향은 저녁 8시부터 시작해 손으로 밀며 자취가 자라는 느낌을 준다
        q = 0;
        syncSliderUi();
        updateSkyPositions();
      } else if (v === "N" && seenDirs.size === 4 && !poleFound) {
        q = MAXQ;
        syncSliderUi();
        updateSkyPositions();
      }
      computeCameraTargets();
      syncControlsUi();
    }

    function setTime(val: number): void {
      q = clamp(val, 0, MAXQ);
      syncSliderUi();
      updateSkyPositions();

      if (mode === "space") {
        maxQSpace = Math.max(maxQSpace, q);
        if (maxQSpace >= NEED_EARTH && !goals.has("earth")) {
          collect("earth");
          syncControlsUi();
        }
      } else if (domeView !== "all") {
        maxQByDir[domeView] = Math.max(maxQByDir[domeView], q);
        if (maxQByDir[domeView] >= NEED_SKY && !seenDirs.has(domeView)) {
          seenDirs.add(domeView);
          host.dataset.u7Seen = String(seenDirs.size);
          haptic(HAPTIC.tap);
          if (seenDirs.size === DIRS.length) {
            collect("skies");
            if (!poleFound) {
              // 네 하늘을 모두 본 뒤 자동으로 북쪽 하늘 6시간 자취로 안내
              window.setTimeout(() => {
                if (disposed || !rot || poleFound) return;
                mode = "dome";
                domeView = "N";
                q = MAXQ;
                syncSliderUi();
                updateSkyPositions();
                computeCameraTargets();
                syncControlsUi();
              }, 750);
            }
          }
          syncControlsUi();
        }
      }
    }

    // 이벤트 연결
    tabSpace.addEventListener("click", () => setMode("space"));
    tabDome.addEventListener("click", () => setMode("dome"));
    spaceNextBtn.addEventListener("click", () => setMode("dome"));
    miniDomeCard.addEventListener("click", () => setDomeView("all"));
    for (const [v, b] of viewBtns) b.addEventListener("click", () => setDomeView(v));

    // 커스텀 포인터 시각 막대(rot.mapPoint로 양끝을 같은 좌표계로 변환 → 회전/비회전/배율 모두 100% 정확!)
    let scrubbing = false;
    const scrubAt = (e: PointerEvent): void => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      const r = trackRail.getBoundingClientRect();
      const x0 = rot.mapPoint({ clientX: r.left, clientY: r.top }).x;
      const x1 = rot.mapPoint({ clientX: r.right, clientY: r.bottom }).x;
      const frac = (p.x - x0) / Math.max(1, x1 - x0);
      setTime(clamp(frac, 0, 1) * MAXQ);
    };
    sliderHit.addEventListener("pointerdown", (e) => {
      scrubbing = true;
      sliderHit.setPointerCapture(e.pointerId);
      scrubAt(e);
    });
    sliderHit.addEventListener("pointermove", (e) => {
      if (scrubbing) scrubAt(e);
    });
    sliderHit.addEventListener("pointerup", () => {
      scrubbing = false;
    });
    sliderHit.addEventListener("pointercancel", () => {
      scrubbing = false;
    });
    sliderHit.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        setTime(q + 2);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        setTime(q - 2);
      }
    });

    // 캔버스 포인터: 전체/우주 보기에서는 부드러운 3D 회전, 북쪽 하늘에서는 북극성 누르기!
    let ptrDown = false;
    let ptrMoved = 0;
    let lastPt = { x: 0, y: 0 };

    const projectWorld = (v: T.Vector3, w: number, h: number): { x: number; y: number; visible: boolean } => {
      const p = v.clone().project(camera);
      const visible = p.z >= -1 && p.z <= 1 && p.x >= -1.06 && p.x <= 1.06 && p.y >= -1.06 && p.y <= 1.06;
      return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h, visible };
    };

    const tryPickPolaris = (pt: { x: number; y: number }): void => {
      if (!rot || mode !== "dome" || domeView !== "N" || poleFound || seenDirs.size < DIRS.length) return;
      const { w, h } = rot.size();
      const polePt = projectWorld(polarisSprite.position, w, h);
      if (polePt.visible && Math.hypot(pt.x - polePt.x, pt.y - polePt.y) <= 40) {
        poleFound = true;
        haptic(HAPTIC.correct);
        collect("pole");
        syncControlsUi();
      } else {
        haptic(HAPTIC.tap);
        guideDot.style.background = "#FFA94D";
        guideText.textContent = "그 별은 원을 그리며 움직였어요. 동심원 가운데에서 점으로 남은 별을 눌러 보세요.";
      }
    };

    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      ptrDown = true;
      ptrMoved = 0;
      lastPt = rot.mapPoint(e);
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!ptrDown || !rot) return;
      const cur = rot.mapPoint(e);
      const dx = cur.x - lastPt.x;
      const dy = cur.y - lastPt.y;
      ptrMoved += Math.hypot(dx, dy);
      lastPt = cur;
      if (mode === "space" || domeView === "all") {
        orbitAz -= dx * 0.0055;
        orbitEl = clamp(orbitEl + dy * 0.0045, 0.18, 0.9);
        computeCameraTargets();
      }
    });
    canvas.addEventListener("pointerup", (e) => {
      if (!ptrDown || !rot) return;
      ptrDown = false;
      if (ptrMoved < 10) tryPickPolaris(rot.mapPoint(e));
    });
    canvas.addEventListener("pointercancel", () => {
      ptrDown = false;
    });

    // 개발/검사용 훅 연결
    applyModeFn = (m) => setMode(m);
    applyViewFn = (v) => setDomeView(v);
    applyTimeFn = (v) => setTime(v);
    syncUiFn = () => syncControlsUi();

    // 3D 라벨 배치 헬퍼
    const placeLbl = (node: HTMLElement, worldPos: T.Vector3 | null, w: number, h: number, dy = 0): void => {
      if (!worldPos) {
        node.classList.remove("on");
        return;
      }
      const p = projectWorld(worldPos, w, h);
      const topSafe = h < 450 ? 34 : 44;
      const inSafe = p.visible && p.x > 22 && p.x < w - 22 && p.y + dy > topSafe && p.y + dy < h - 72;
      node.classList.toggle("on", inSafe);
      if (inSafe) node.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y + dy).toFixed(1)}px, 0) translate(-50%, -50%)`;
    };

    // 초기화
    syncSliderUi();
    updateSkyPositions();
    syncControlsUi();
    showDone();

    let lastW = 0;
    let lastH = 0;
    const wEast = new THREE.Vector3(R_DOME + 0.45, 0.55, 0);
    const wSouth = new THREE.Vector3(0, 0.55, R_DOME + 0.45);
    const wWest = new THREE.Vector3(-R_DOME - 0.45, 0.55, 0);
    const wNorth = new THREE.Vector3(0, 0.55, -R_DOME - 0.45);
    const wSpacePole = new THREE.Vector3(0, R_SKY + 0.85, 0);
    const wSpaceSpin = new THREE.Vector3(0, -1.55, R_EARTH + 1.0);
    const wSpaceSky = new THREE.Vector3(-R_SKY * 0.72, R_SKY * 0.56, 0);
    const wDomeAxisMid = poleVec.clone().multiplyScalar(0.55);
    const wDomeObs = new THREE.Vector3(0, 1.55, 0);

    loop = createLoop((dt) => {
      if (!st || !rot) return;
      const { w, h } = rot.size();
      if (w !== lastW || h !== lastH) {
        lastW = w;
        lastH = h;
        st.resize(w, h);
        computeCameraTargets();
      }

      const k = snapCam ? 1 : Math.min(1, 0.14 * dt);
      snapCam = false;
      camera.position.lerp(camPosTarget, k);
      camLookCur.lerp(camLookTarget, k);
      camera.lookAt(camLookCur);
      if (Math.abs(camera.fov - camFovTarget) > 0.05) {
        camera.fov += (camFovTarget - camera.fov) * k;
        camera.updateProjectionMatrix();
      }

      // 전체 천구 vs 방향별 하늘에서 안내선 진하기 조절
      const isOverview = mode === "dome" && domeView === "all";
      const targetGuideOp = isOverview ? 0.3 : 0.07;
      for (const gm of guideMats) gm.opacity += (targetGuideOp - gm.opacity) * Math.min(1, 0.15 * dt);
      domeShellMat.opacity += ((isOverview ? 0.14 : 0.04) - domeShellMat.opacity) * Math.min(1, 0.15 * dt);
      domeAxisMat.opacity += ((isOverview ? 0.62 : domeView === "N" && poleFound ? 0.38 : 0.08) - domeAxisMat.opacity) * Math.min(1, 0.15 * dt);

      // 북쪽 하늘에서 움직이지 않는 별을 찾는 동안 북극성이 반짝반짝 빛나며 힌트를 준다
      const showPoleHint = mode === "dome" && domeView === "N" && seenDirs.size === DIRS.length && !poleFound;
      if (showPoleHint) {
        const tw = 0.5 + 0.5 * Math.sin(performance.now() * 0.0062);
        const sPole = 0.92 + tw * 0.42;
        polarisSprite.scale.set(sPole, sPole, 1);
      } else {
        polarisSprite.scale.set(0.88, 0.88, 1);
      }

      st.render();

      // 3D 투영 라벨 갱신
      if (mode === "space") {
        observerMount.getWorldPosition(koreaWorldPos);
        koreaWorldPos.y += 1.05;
        placeLbl(lblSpacePole, wSpacePole, w, h, h < 450 ? 2 : -4);
        placeLbl(lblSpaceSpin, wSpaceSpin, w, h, 8);
        placeLbl(lblSpaceKorea, koreaWorldPos, w, h, -14);
        placeLbl(lblSpaceSky, wSpaceSky, w, h, 0);
        placeLbl(lblCardE, null, w, h);
        placeLbl(lblCardS, null, w, h);
        placeLbl(lblCardW, null, w, h);
        placeLbl(lblCardN, null, w, h);
        placeLbl(lblDomePole, null, w, h);
        placeLbl(lblDomeAxis, null, w, h);
        placeLbl(lblDomeObs, null, w, h);
        poleHint.classList.remove("on");
        poleRing.classList.remove("on");
      } else {
        placeLbl(lblSpacePole, null, w, h);
        placeLbl(lblSpaceSpin, null, w, h);
        placeLbl(lblSpaceKorea, null, w, h);
        placeLbl(lblSpaceSky, null, w, h);

        placeLbl(lblCardE, wEast, w, h);
        placeLbl(lblCardS, wSouth, w, h);
        placeLbl(lblCardW, wWest, w, h);
        placeLbl(lblCardN, wNorth, w, h);

        // 북극성 라벨: 찾은 뒤에만 표시(낮은 가로 폰에서는 완료 배너와 겹치지 않게 아래에 놓는다)
        placeLbl(lblDomePole, poleFound ? polarisSprite.position : null, w, h, h < 450 ? 28 : -26);
        placeLbl(lblDomeAxis, isOverview ? wDomeAxisMid : null, w, h, -14);
        placeLbl(lblDomeObs, isOverview ? wDomeObs : null, w, h, -10);

        const pp = projectWorld(polarisSprite.position, w, h);
        const poleOk = pp.visible && pp.x > 16 && pp.x < w - 16 && pp.y > 40 && pp.y < h - 72;

        // 북극성 찾기 반짝반짝 힌트
        poleHint.classList.toggle("on", showPoleHint && poleOk);
        if (showPoleHint && poleOk) {
          poleHint.style.transform = `translate3d(${pp.x.toFixed(1)}px, ${pp.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }

        // 북극성 강조 고리(찾은 뒤)
        poleRing.classList.toggle("on", poleFound && poleOk);
        if (poleFound && poleOk) {
          poleRing.style.transform = `translate3d(${pp.x.toFixed(1)}px, ${pp.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
      }
    });
    loop.start();
  }

  function leave(): void {
    loop?.stop();
    loop = null;
    st?.dispose();
    st = null;
    rot?.dispose();
    rot = null;
    doneBar = null;
    guideEl = null;
    miniDomeEl = null;
    applyModeFn = null;
    applyViewFn = null;
    applyTimeFn = null;
    syncUiFn = null;
    enterBtn.classList.remove("pulse");

    if (finished) {
      enterBtn.querySelector("span")!.textContent = "가로 화면 다시 보기";
      if (!asked) askDirection();
    } else {
      enterBtn.querySelector("span")!.textContent = "가로 화면 다시 열기";
      f.say("아직 완료하지 않은 탐구가 남았어요. 가로 화면을 다시 열어 <b>세 가지 탐구</b>를 모두 해 보세요.");
    }
  }

  enterBtn.addEventListener("click", () => void enter());

  // 개발/검사용 훅(check-u7v5.mjs에서 결정론적으로 조작. mode: 0=우주 1=천구, view: 0=전체 1=동 2=남 3=서 4=북)
  const DEV_VIEWS: DomeView[] = ["all", "E", "S", "W", "N"];
  u7Dev(host, {
    mode: (m: number) => applyModeFn?.(m ? "dome" : "space"),
    view: (v: number) => applyViewFn?.(DEV_VIEWS[v] ?? "all"),
    time: (val: number) => applyTimeFn?.(val),
    pickPole: () => {
      if (!poleFound) {
        poleFound = true;
        collect("pole");
        syncUiFn?.();
      }
    },
  });

  api.setCTA("가로 화면에서 세 가지 탐구를 완료해 보세요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
  };
};

/** 세로 입장 화면 미리보기 SVG: 왼쪽 자전하는 지구 + 오른쪽 3D 천구 반구와 별 자취. */
function enterArtSvg(): string {
  return `<svg viewBox="0 0 280 96" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="sk-eb" cx=".38" cy=".35" r=".65">
        <stop offset="0" stop-color="#58B4FF"/><stop offset=".65" stop-color="#225CB8"/><stop offset="1" stop-color="#0E2554"/>
      </radialGradient>
      <radialGradient id="sk-gl" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#FFF2B8" stop-opacity=".95"/><stop offset="1" stop-color="#FFF2B8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="280" height="96" rx="16" fill="#0A1426"/>
    <!-- 왼쪽: 천구 속 자전하는 지구 -->
    <circle cx="62" cy="48" r="34" stroke="#4D74B8" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="3 3"/>
    <line x1="62" y1="11" x2="62" y2="85" stroke="#FFDF8E" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="3 3"/>
    <circle cx="62" cy="48" r="16" fill="url(#sk-eb)"/>
    <path d="M54 44c3-5 10-6 13-2 3 4-1 10-7 11-5 1-8-4-6-9Z" fill="#46B87A" opacity=".85"/>
    <path d="M40 53c9 7 35 7 44 0" stroke="#FFC24E" stroke-width="2" stroke-linecap="round"/>
    <path d="M79 49l6 4-6 4" stroke="#FFC24E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="62" cy="13" r="5" fill="url(#sk-gl)"/><circle cx="62" cy="13" r="1.8" fill="#FFF7D6"/>
    <!-- 연결 화살표 -->
    <path d="M108 48h26m-6-5 6 5-6 5" stroke="#89B0EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- 오른쪽: 위도 37° 3D 천구 반구 -->
    <ellipse cx="204" cy="74" rx="54" ry="12" fill="#132645" stroke="#5E85C7" stroke-width="1.2"/>
    <path d="M150 74a54 54 0 0 1 108 0" fill="#172D56" fill-opacity=".32" stroke="#6E99DF" stroke-opacity=".5" stroke-width="1.2"/>
    <line x1="204" y1="74" x2="176" y2="41" stroke="#FFDF8E" stroke-opacity=".65" stroke-width="1.2" stroke-dasharray="3 3"/>
    <path d="M174 28c14 14 36 28 58 34" stroke="#9EC5FF" stroke-opacity=".8" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M190 22c15 12 36 24 55 28" stroke="#CFE4FF" stroke-opacity=".85" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="176" cy="41" r="6" fill="url(#sk-gl)"/><circle cx="176" cy="41" r="2.2" fill="#FFF7D6"/>
    <circle cx="245" cy="50" r="2.2" fill="#DCEBFF"/><circle cx="232" cy="62" r="2" fill="#DCEBFF"/>
  </svg>`;
}

/** 세로 판정·결론용 북쪽 하늘 자취 SVG(revealed=true일 때만 시계 반대 방향 큰 화살표 표시). */
function judgeArtSvg(revealed: boolean): string {
  const W = 318;
  const H = 140;
  const cx = W / 2;
  const cy = 62;
  const arcs: { r: number; a0: number; a1: number; gold?: boolean }[] = [
    { r: 28, a0: 155, a1: 65 },
    { r: 36, a0: 42, a1: -44 },
    { r: 46, a0: -120, a1: -206, gold: true },
    { r: 54, a0: 60, a1: -28, gold: true },
    { r: 62, a0: 168, a1: 82 },
  ];
  const arcMarkup = arcs
    .map(({ r, a0, a1, gold }) => {
      const r0 = a0 * DEG;
      const r1 = a1 * DEG;
      const x0 = cx + r * Math.cos(r0);
      const y0 = cy + r * Math.sin(r0);
      const x1 = cx + r * Math.cos(r1);
      const y1 = cy + r * Math.sin(r1);
      // 각도가 줄어드는 쪽(SVG y-down에서 시계 반대 방향) 접선
      const ux = Math.sin(r1);
      const uy = -Math.cos(r1);
      const stroke = gold ? "#FFE49C" : "#9EC6FF";
      return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${stroke}" stroke-opacity=".72" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M${(x1 - ux * 6 - uy * 3.5).toFixed(1)} ${(y1 - uy * 6 + ux * 3.5).toFixed(1)}L${(x1 - ux * 1).toFixed(1)} ${(y1 - uy * 1).toFixed(1)}L${(x1 - ux * 6 + uy * 3.5).toFixed(1)} ${(y1 - uy * 6 - ux * 3.5).toFixed(1)}" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="${gold ? 2.6 : 2.1}" fill="${gold ? "#FFF1C4" : "#E8F2FF"}"/>`;
    })
    .join("");

  const bigArrow = revealed
    ? (() => {
        const R = 36;
        const a0 = 36 * DEG;
        const a1 = -62 * DEG;
        const x0 = cx + R * Math.cos(a0);
        const y0 = cy + R * Math.sin(a0);
        const x1 = cx + R * Math.cos(a1);
        const y1 = cy + R * Math.sin(a1);
        const ux = Math.sin(a1);
        const uy = -Math.cos(a1);
        return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 0 ${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#FFD25E" stroke-width="3" stroke-linecap="round"/>
          <polygon points="${(x1 + ux * 8).toFixed(1)},${(y1 + uy * 8).toFixed(1)} ${(x1 - ux * 2 - uy * 5.5).toFixed(1)},${(y1 - uy * 2 + ux * 5.5).toFixed(1)} ${(x1 - ux * 2 + uy * 5.5).toFixed(1)},${(y1 - uy * 2 - ux * 5.5).toFixed(1)}" fill="#FFD25E"/>`;
      })()
    : "";

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="북쪽 하늘에서 북극성을 중심으로 별이 움직인 자취">
    <defs><linearGradient id="skj-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070E20"/><stop offset="1" stop-color="#192B52"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="url(#skj-bg)"/>
    ${arcMarkup}
    ${bigArrow}
    <circle cx="${cx}" cy="${cy}" r="10" stroke="#FFE09C" stroke-opacity=".85" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="3.3" fill="#FFF5D4"/>
    <text class="u7x-st sun" x="${cx}" y="${cy - 15}" text-anchor="middle">북극성</text>
    <path d="M0 ${H}V116Q90 105 170 116T${W} 112V${H}Z" fill="#060B18"/>
    <text class="u7x-st" x="${cx}" y="${H - 8}" text-anchor="middle">북쪽 하늘</text>
    <text class="u7x-st dim" x="14" y="${H - 8}" text-anchor="start">서</text>
    <text class="u7x-st dim" x="${W - 14}" y="${H - 8}" text-anchor="end">동</text>
  </svg>`;
}
