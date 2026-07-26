// elecWater3d — 전류·전압 물 비유 **3D** 랩(중2 VII L3, 책 248~249쪽 그림 VII-5의 입체판). 가로 모드.
//   · 똑같이 생긴 콘크리트 블록 두 개가 나란히 선다(그림 VII-5 구도 그대로).
//     왼쪽 물 회로 = 펌프가 물을 위 수로로 끌어올려 **높이 차**를 만들고 → 물이 흘러 →
//     떨어지며 **물레방아**를 돌린다. 오른쪽 전기 회로 = 전지가 **전압**을 만들고 → 전류가 흘러 → 전구가 켜진다.
//     두 블록의 홈(수로)은 완전히 같은 자리 — 한쪽엔 물이, 한쪽엔 전선이 놓인다.
//   · 세기 3단(펌프 세기 ↔ 전지 개수)이 물 높이·물살·회전 속도와 전압·전류·밝기를 **동시에** 바꾼다.
//   · 요소를 탭하면 역할 카드가 뜨고, 물 요소 → 전기 요소 순으로 탭하면 **비유 설명**이 완성된다(5쌍).
//   · three는 space3d 동적 import, dispose 규율 준수. 원본 2D 랩(elecWater.ts)은 그대로 보존.

import { el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { SpaceStage, THREE as T } from "../../ui/space3d";
import type { RotateStage } from "../../ui/rotateStage";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// ── 논리 좌표(블록 하나: x −100..100 · y −18..160 · z −52..+28) ─────────────
// 두 블록은 같은 지오메트리를 쓰고 x = ∓COL 에 놓인다(거울이 아니라 **평행 이동** — 그림 VII-5처럼
// 같은 방향에서 본 같은 모양이라 "같은 자리 = 같은 역할"이 눈으로 읽힌다).
const COL = 122; // 블록 중심 간 거리의 절반
const YAW = 0.28; // 두 블록 공통 요각(≈16°) — 왼쪽 면과 윗면이 함께 보이는 입체 구도

const POOL_FLOOR = 14; // 아래 수로 바닥(=아래 단 윗면)
const POOL_SURF = 26; // 아래 수로 수면
const WALL_TOP = 100; // 뒷벽 윗면 = 위 수로 바닥
const RES_TOP = 150; // 위 수로 벽 상단
const WHEEL = { x: 62, y: 52, r: 25, z: 2, halfW: 10 };
const FALL_X = 72; // 낙수 중심(물레방아 중심에서 10 = 0.4R 오른쪽 → 물받이를 때려 시계 방향 회전)
const PUMP_X = -70;
const GATE_X = 0;
const BULB = { x: 62, y: 52, z: 2, r: 13 };

// 세기 3단 — 펌프 세기 ↔ 전지 개수. depth = 위 수로 물 깊이(높이 차를 만든다).
const STEPS = [
  { name: "약하게", depth: 12, rate: 0.36, volt: "1.5 V", cells: 1, hi: "낮음" },
  { name: "보통", depth: 26, rate: 0.68, volt: "3.0 V", cells: 2, hi: "보통" },
  { name: "세게", depth: 40, rate: 1, volt: "4.5 V", cells: 3, hi: "높음" },
];

type ElemId = "pump" | "valve" | "flow" | "pipe" | "wheel" | "battery" | "switch" | "current" | "wire" | "bulb";

interface ElemDef {
  id: ElemId;
  side: "water" | "elec";
  name: string;
  /** 혼자 탭했을 때의 역할 설명 */
  role: string;
  /** 히트 프록시 중심(로컬 좌표)과 반지름 */
  at: [number, number, number];
  r: number;
  /** 이름표 위치(로컬) */
  lab: [number, number, number];
}

// 탭 표시(점선 링)가 서로 겹치지 않도록 중심·반지름을 계산해 배치했다 — 위치를 바꾸면
// 이웃 링과의 거리 ≥ 두 반지름의 합인지 확인할 것(겹치면 "어디를 누르라는 건지" 모호해진다).
const ELEMS: ElemDef[] = [
  {
    id: "pump", side: "water", name: "펌프", at: [PUMP_X, 156, -6], r: 24, lab: [PUMP_X - 34, 163, -6],
    role: "물을 낮은 곳에서 높은 곳으로 끌어올려요. 그 덕분에 위아래 <b>높이 차</b>가 생기고, 물이 스스로 흘러내릴 수 있어요.",
  },
  {
    id: "valve", side: "water", name: "밸브", at: [GATE_X, 138, -32], r: 20, lab: [GATE_X, 168, -32],
    role: "물길을 여닫는 장치예요. 잠그면 물이 지나가지 못해 아래로 내려가지 못해요.",
  },
  {
    id: "flow", side: "water", name: "물의 흐름", at: [-40, 120, -30], r: 21, lab: [-46, 152, -30],
    role: "높이 차 때문에 한쪽 방향으로 흐르는 물이에요. 1초에 흐르는 물의 양이 많을수록 물살이 세죠.",
  },
  {
    id: "pipe", side: "water", name: "수로", at: [-16, 20, 8], r: 26, lab: [-16, 54, 20],
    role: "물이 새지 않게 이어 준 물길이에요. 한 바퀴 이어져 있어야 물이 계속 돌 수 있어요.",
  },
  {
    id: "wheel", side: "water", name: "물레방아", at: [WHEEL.x, WHEEL.y, WHEEL.z], r: 30, lab: [42, 92, 12],
    role: "떨어지는 물에게서 에너지를 받아 돌아가요. 물살이 셀수록 빠르게 돌죠.",
  },
  {
    id: "battery", side: "elec", name: "전지", at: [PUMP_X, 58, 4], r: 26, lab: [PUMP_X - 34, 58, 4],
    role: "<b>전압</b>을 만들어요. 전압은 전류를 흐르게 하는 능력이에요 — 전지가 없으면 전류도 없어요.",
  },
  {
    id: "switch", side: "elec", name: "스위치", at: [GATE_X, 112, -32], r: 20, lab: [GATE_X, 142, -32],
    role: "전선 길을 여닫는 장치예요. 열면 길이 끊겨 전류가 흐르지 못해요.",
  },
  {
    id: "current", side: "elec", name: "전류", at: [-46, 106, -32], r: 21, lab: [-52, 136, -32],
    role: "전선 속 전하가 한 방향으로 흐르는 것이 전류예요(단위 A, 암페어).",
  },
  {
    id: "wire", side: "elec", name: "전선", at: [-16, 20, 10], r: 26, lab: [-16, 54, 20],
    role: "전하가 흐르도록 이어 준 길이에요. 길이 한 바퀴 이어져 있어야 전류가 흐를 수 있어요.",
  },
  {
    id: "bulb", side: "elec", name: "전구", at: [BULB.x, BULB.y, BULB.z], r: 28, lab: [42, 92, 12],
    role: "흐르는 전류에게서 에너지를 받아 빛과 열을 내요. 전류가 셀수록 밝아지죠.",
  },
];
const elemOf = (id: ElemId): ElemDef => ELEMS.find((e) => e.id === id)!;

interface PairDef {
  w: ElemId;
  e: ElemId;
  tag: string;
  text: string;
}
const PAIRS: PairDef[] = [
  {
    w: "pump", e: "battery", tag: "흐름을 만드는 것",
    text: "물의 높이 차를 만들어 물레방아를 돌리듯이, 전지의 <b>전압</b>도 전류를 흐르게 해 전구를 켜요. 펌프를 세게 하면 높이 차가 커지고, 전지를 더 이어 붙이면 전압이 커져요.",
  },
  {
    w: "flow", e: "current", tag: "흐름 그 자체",
    text: "높이 차 때문에 물이 한 방향으로 흐르는 것이 물의 흐름이라면, 전압 때문에 전하가 한 방향으로 흐르는 것이 <b>전류</b>예요. 물살이 셀수록 방아가 빨리 돌듯, 전류가 셀수록 전구가 밝아요.",
  },
  {
    w: "wheel", e: "bulb", tag: "에너지를 쓰는 곳",
    text: "물레방아가 흐르는 물에게서 에너지를 받아 돌아가듯이, <b>전구</b>는 흐르는 전류에게서 에너지를 받아 빛과 열을 내요.",
  },
  {
    w: "pipe", e: "wire", tag: "흐르는 길",
    text: "물이 지나갈 길을 이어 준 것이 수로, 전하가 지나갈 길을 이어 준 것이 <b>전선</b>이에요. 길이 한 바퀴 이어져 있어야 계속 흐를 수 있어요.",
  },
  {
    w: "valve", e: "switch", tag: "길을 여닫는 곳",
    text: "밸브를 잠그면 물레방아가 멈추듯, <b>스위치</b>를 열면 전구가 꺼져요. 길이 한 곳만 끊겨도 회로 전체의 흐름이 멈춰요.",
  },
];
const MATCH_COLORS = ["#F0A422", "#37B6D8", "#8A6BFF", "#4CAF6E", "#E86FCE"];

// ── 색 ──────────────────────────────────────────────────────
const C = {
  concrete: 0xc4c9d1,
  concreteDark: 0xa9b0ba,
  concreteEdge: 0xd7dbe2,
  water: 0x3ba7e6,
  waterLite: 0x86d3ff,
  wood: 0xc9a05e,
  woodDark: 0x8a6a34,
  steel: 0x8c99ac,
  red: 0xd0402c,
  copper: 0xd08a3a,
  amber: 0xffc46e,
  battery: 0x23272e,
  gold: 0xd8b04a,
};

export const waterCircuit3d: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge", dataset: { g: "power" } }, el("b", { text: "세기 바꾸기" }), el("span", { text: "약하게↔세게" })),
    el("div", { class: "pn-badge", dataset: { g: "valve" } }, el("b", { text: "밸브·스위치" }), el("span", { text: "잠갔다 열기" })),
    el("div", { class: "pn-badge", dataset: { g: "match" } }, el("b", { text: "대응 찾기" }), el("span", { text: "짝 5쌍" })),
  );
  const preview = el(
    "div",
    { class: "sp3-enter" },
    el("div", { class: "sp3-enter-art", html: enterArtSvg() }),
    el("div", {
      class: "sp3-enter-txt",
      html:
        "물을 끌어올리는 <b>펌프</b>와 떨어지는 물을 받아 도는 <b>물레방아</b> — 똑같이 생긴 전기 회로와 나란히 놓고 <b>같은 것끼리</b> 이어 봐요.<br>화면이 자동으로 <b>가로</b>로 돌아가요.",
    }),
  );
  const enterBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "가로 화면으로 크게 열기" }));
  const helper = el("div", {
    class: "helper",
    html: "물이 계속 흐르려면 <b>높이 차</b>를 만들어 주는 펌프가 필요해요 — 전기 회로에서 그 역할을 하는 게 <b>전지(전압)</b>랍니다.",
  });
  host.append(goalChips, helper, preview, enterBtn); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let stepIdx = 1; // 세기 0~2
  let open = true; // 밸브·스위치
  const triedSteps = new Set<number>();
  const valveDone = { closed: false, reopened: false };
  const matched = new Map<ElemId, number>(); // 물 id → 색 인덱스
  let selWater: ElemId | null = null;
  let selected: ElemId | null = null;
  const goals = new Set<string>();
  let finished = false;
  let disposed = false;

  function collect(id: "power" | "valve" | "match", subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    missionEls?.[id]?.classList.add("on");
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>전압은 전류를 흐르게 하는 능력</b> — 펌프가 만든 높이 차가 물을 흐르게 하듯, 전지의 전압이 전류를 흐르게 해요. 펌프를 세게 = 전압을 크게 = <b>전류도 세게</b>!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      window.setTimeout(() => showToast("비유 완성! 세로로 돌아가 계속해요", 3200), 1400);
    }
  }

  // ---- 가로 스테이지 ----
  let rot: RotateStage | null = null;
  let st: SpaceStage | null = null;
  let loop: Loop | null = null;
  let toastEl: HTMLElement | null = null;
  let toastTimer = 0;
  let guideTimer = 0;
  let cardEl: HTMLElement | null = null;
  let statusPill: HTMLElement | null = null;
  let missionEls: Record<string, HTMLElement> | null = null;

  function showToast(msg: string, ms = 2400): void {
    if (!toastEl) return;
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl?.classList.remove("show"), ms);
  }

  /** 설명 카드 — 단독 탭(역할) / 짝 완성(비유) 두 모드 */
  function showCard(html: string): void {
    if (!cardEl) return;
    cardEl.innerHTML = html;
    cardEl.classList.add("show");
  }

  function roleCard(e: ElemDef): void {
    const pair = PAIRS.find((p) => p.w === e.id || p.e === e.id)!;
    const mate = elemOf(e.side === "water" ? pair.e : pair.w);
    const done = matched.has(pair.w);
    const ask = done
      ? `<div class="ew-ct">${pair.text}</div>`
      : `<div class="ew-ask">${e.side === "water" ? "전기 회로" : "물 회로"}에서 <b>같은 역할</b>을 하는 것은 무엇일까요? 찾아서 탭해 봐요.</div>`;
    showCard(
      `<div class="ew-cname">${e.name}${done ? ` <i>= ${mate.name}</i>` : ""}</div><div class="ew-crole">${e.role}</div>${ask}`,
    );
  }

  function pairCard(p: PairDef): void {
    showCard(
      `<div class="ew-cname">${elemOf(p.w).name} <em>=</em> ${elemOf(p.e).name} <i>${p.tag}</i></div><div class="ew-ct">${p.text}</div>`,
    );
  }

  /** 안내 카드 — 가로 화면을 연 직후 "뭘 눌러야 하지?"를 없애는 첫 화면(그리고 미션 완료 뒤 다음 할 일). */
  function guideCard(): void {
    if (matched.size < PAIRS.length) {
      // 짧게 두 줄 — 카드가 길수록 무대를 가린다(세기·밸브 안내는 하단 버튼이 스스로 말한다)
      showCard(
        `<div class="ew-cname">이렇게 해요</div>` +
          `<div class="ew-crole"><b>①</b> 왼쪽에서 <b>깜빡이는 동그라미</b>를 탭 → <b>②</b> 오른쪽에서 <b>같은 역할</b>을 탭! 짝 <b>5쌍</b>을 맞춰요.</div>`,
      );
      return;
    }
    const rest: string[] = [];
    if (!goals.has("power")) rest.push("아래 <b>세기</b>를 <b>약하게</b>와 <b>세게</b>로 모두 바꿔 보기 — 물의 높이 차가 커지면 물살도 전류도 세져요");
    if (!goals.has("valve")) rest.push("<b>밸브·스위치</b>를 잠갔다 다시 열어 보기 — 물과 전류가 함께 멈추고 함께 흘러요");
    if (!rest.length) return;
    showCard(
      `<div class="ew-cname">5쌍 완성! 남은 미션</div><div class="ew-crole">${rest.map((r) => `· ${r}`).join("<br>")}</div>`,
    );
  }

  async function enter(): Promise<void> {
    if (rot || disposed) return;
    haptic(HAPTIC.select);
    const { enterRotateStage } = await import("../../ui/rotateStage");
    if (disposed) return;
    rot = enterRotateStage({ title: "물의 흐름 ↔ 전류 — 같은 것끼리 탭!", onLeave: () => leave() });

    const canvas = el("canvas", { class: "sp3-canvas" }) as HTMLCanvasElement;
    statusPill = el("div", { class: "pill sp3-pill" }, el("span", { class: "pdot", style: "background:#37B6D8" }), el("span", { text: "" }));
    cardEl = el("div", { class: "ew-card" });

    // 하단 바: 미션 칩 · 세기 3단 · 밸브 토글
    const missions = el("div", { class: "ew-miss" });
    missionEls = {};
    ([
      ["power", "세기"],
      ["valve", "밸브·스위치"],
      ["match", "대응 5쌍"],
    ] as [string, string][]).forEach(([id, name]) => {
      const sp = el("span", { text: name });
      if (goals.has(id)) sp.classList.add("on");
      missionEls![id] = sp;
      missions.appendChild(sp);
    });

    const segBtns: HTMLButtonElement[] = STEPS.map(
      (sd, i) => el("button", { attrs: { type: "button", "aria-pressed": String(i === stepIdx) }, text: sd.name }) as HTMLButtonElement,
    );
    const seg = el("div", { class: "ew-seg", attrs: { role: "group", "aria-label": "펌프 세기(전압)" } }, ...segBtns);
    const syncSeg = (): void => {
      segBtns.forEach((b, i) => {
        b.classList.toggle("on", i === stepIdx);
        b.setAttribute("aria-pressed", String(i === stepIdx));
      });
    };
    segBtns.forEach((b, i) =>
      b.addEventListener("click", () => {
        if (stepIdx === i) return;
        stepIdx = i;
        syncSeg();
        haptic(HAPTIC.select);
        triedSteps.add(i);
        if (triedSteps.has(0) && triedSteps.has(2)) collect("power", "높이 차 ↔ 전압!");
        else
          showToast(
            i === 2
              ? "물을 <b>더 높이</b> 끌어올렸어요 — 높이 차가 커지니 물살도, 전류도 세져요!"
              : i === 0
                ? "펌프를 약하게 — 높이 차가 작아지니 물살이 <b>졸졸</b>, 전구도 어두워져요."
                : "가운데 세기예요. 양 끝(약하게·세게)도 눌러 비교해 봐요!",
            2600,
          );
      }),
    );

    const valveBtn = el(
      "button",
      { class: "ew-valve", attrs: { type: "button", "aria-pressed": "false" } },
      el("span", { text: "밸브·스위치 잠그기" }),
    ) as HTMLButtonElement;
    valveBtn.addEventListener("click", () => {
      open = !open;
      (valveBtn.querySelector("span") as HTMLElement).textContent = open ? "밸브·스위치 잠그기" : "밸브·스위치 열기";
      valveBtn.classList.toggle("on", !open);
      haptic(HAPTIC.select);
      if (!open) {
        valveDone.closed = true;
        showToast("길이 막히면 — <b>물도 전류도 함께 멈춰요</b>", 2400);
      } else if (valveDone.closed) {
        valveDone.reopened = true;
        showToast("다시 열면 — 둘 다 <b>동시에</b> 다시 흘러요!", 2200);
        collect("valve", "함께 멈춘다!");
      }
    });

    const bar = el("div", { class: "ew-bar" }, missions, seg, valveBtn);
    toastEl = el("div", { class: "sp3-toast ew-toast" });
    rot.stage.append(canvas, statusPill, cardEl, bar, toastEl);
    guideCard(); // 열자마자 "뭘 눌러야 하지?"가 없도록 — 첫 화면은 안내 카드

    // ---- three.js ----
    const S = await import("../../ui/space3d");
    if (disposed || !rot) return;
    const THREE = S.THREE;
    st = S.createSpaceStage(canvas, { fov: 38 });
    if (!st) {
      (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = "이 기기는 3D를 지원하지 않아요";
      helper.innerHTML =
        "3D를 열 수 없어요. 글로 기억해요 — <b>펌프=전지 · 물의 흐름=전류 · 물레방아=전구 · 수로=전선 · 밸브=스위치</b>. 펌프가 만든 높이 차가 물을 흐르게 하듯, 전지의 <b>전압</b>이 전류를 흐르게 해요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
      return;
    }
    const scene = st.scene;
    scene.background = new THREE.Color(0x0b1524);
    scene.add(new THREE.AmbientLight(0x9fb2d4, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(-180, 300, 320);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x93b6ff, 0.75);
    fill.position.set(240, 80, -200);
    scene.add(fill);

    // ── 공용 재질 ──
    const matConcrete = new THREE.MeshStandardMaterial({ color: C.concrete, roughness: 0.92, metalness: 0.02 });
    const matConcreteDark = new THREE.MeshStandardMaterial({ color: C.concreteDark, roughness: 0.94, metalness: 0.02 });
    const matEdge = new THREE.MeshStandardMaterial({ color: C.concreteEdge, roughness: 0.86, metalness: 0.02 });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xbfe0ff, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false,
    });
    const matWater = new THREE.MeshStandardMaterial({ color: C.water, roughness: 0.14, metalness: 0.06, transparent: true, opacity: 0.84 });
    // 수면(윗면)만 밝게 — 물이 "담겨 있다"가 한눈에 읽히도록(BoxGeometry 재질 순서 +x,−x,+y,−y,+z,−z)
    const matWaterTop = new THREE.MeshStandardMaterial({ color: 0x8fdcff, roughness: 0.06, metalness: 0.12, transparent: true, opacity: 0.94 });
    const waterFaces = [matWater, matWater, matWaterTop, matWater, matWater, matWater];
    const matSteel = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.4, metalness: 0.55 });
    const matRed = new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.42, metalness: 0.2 });
    const matWood = new THREE.MeshStandardMaterial({ color: C.wood, roughness: 0.72, metalness: 0.04 });
    const matWoodDark = new THREE.MeshStandardMaterial({ color: C.woodDark, roughness: 0.76, metalness: 0.04 });
    const matCopper = new THREE.MeshStandardMaterial({ color: C.copper, roughness: 0.34, metalness: 0.62 });
    const matBead = new THREE.MeshBasicMaterial({ color: 0xe8f8ff });
    const matAmberBead = new THREE.MeshBasicMaterial({ color: 0xffd98a });
    const matHi = new THREE.MeshBasicMaterial({ color: 0x9be0ff }); // 높이 차 표시(조명 무관하게 또렷하게)
    const fallTex = waterfallTexture(THREE);
    const matFall = new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.74, depthWrite: false, side: THREE.DoubleSide });

    const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: T.Material | T.Material[]): T.Mesh => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      return mesh;
    };
    const cyl = (r: number, h: number, x: number, y: number, z: number, m: T.Material, axis: "y" | "z" | "x" = "y"): T.Mesh => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), m);
      if (axis === "z") mesh.rotation.x = Math.PI / 2;
      if (axis === "x") mesh.rotation.z = Math.PI / 2;
      mesh.position.set(x, y, z);
      return mesh;
    };

    /** 두 회로가 공유하는 콘크리트 블록(그림 VII-5의 그 덩어리). */
    function buildBlock(): T.Group {
      const g = new THREE.Group();
      g.add(box(214, 18, 96, 0, -9, -12, matConcreteDark)); // 바닥 받침
      g.add(box(200, 100, 40, 0, 50, -32, matConcrete)); // 뒷벽(위 수로를 떠받친다)
      g.add(box(200, 14, 40, 0, 7, 8, matConcrete)); // 아래 단
      g.add(box(200, 16, 2.5, 0, 22, 27, matGlass)); // 아래 수로 앞 유리
      g.add(box(6, 16, 42, -97, 22, 8, matEdge), box(6, 16, 42, 97, 22, 8, matEdge)); // 아래 수로 양 끝
      // 위 수로(홈) — 뒷벽 · 앞 유리 2장(가운데 x 52~80은 배출구로 비워 둔다) · 양 끝벽
      const rh = RES_TOP - WALL_TOP;
      const rm = (RES_TOP + WALL_TOP) / 2;
      g.add(box(200, rh, 6, 0, rm, -49, matConcrete));
      g.add(box(152, rh, 2.5, -24, rm, -13, matGlass));
      g.add(box(20, rh, 2.5, 90, rm, -13, matGlass));
      g.add(box(6, rh, 42, -97, rm, -32, matEdge), box(6, rh, 42, 97, rm, -32, matEdge));
      g.add(box(200, 3, 42, 0, WALL_TOP + 1.4, -32, matEdge)); // 수로 바닥 마감
      return g;
    }

    // ══ 물 회로 ══════════════════════════════════════════════
    const waterG = new THREE.Group();
    waterG.position.x = -COL;
    waterG.add(buildBlock());
    scene.add(waterG);

    // 아래 수로 물
    const poolWater = box(194, POOL_SURF - POOL_FLOOR, 38, 0, (POOL_FLOOR + POOL_SURF) / 2, 7, waterFaces);
    waterG.add(poolWater);
    // 위 수로 물 — 밸브(x=0) 기준 좌/우 두 덩이(잠그면 오른쪽이 빠진다)
    const resWaterL = box(1, 1, 1, 0, 0, 0, waterFaces);
    const resWaterR = box(1, 1, 1, 0, 0, 0, waterFaces);
    waterG.add(resWaterL, resWaterR);

    // 펌프 — 흡입관(아래 수로에 잠김) → 상승관 → 붉은 펌프 머리 → 뒤로 꺾여 수로에 쏟는다
    waterG.add(cyl(6.5, 6, PUMP_X, 17, -6, matSteel));
    waterG.add(cyl(5, 132, PUMP_X, 84, -6, matSteel));
    waterG.add(cyl(9.5, 22, PUMP_X, 161, -6, matRed));
    waterG.add(cyl(4, 4, PUMP_X, 173, -6, matSteel));
    waterG.add(cyl(4.5, 32, PUMP_X, 168, -22, matSteel, "z"));
    waterG.add(cyl(4.5, 14, PUMP_X, 163, -36, matSteel));
    const pumpPour = box(8, 1, 8, PUMP_X, 0, -36, matFall); // 펌프가 쏟는 물줄기(길이 동적)
    waterG.add(pumpPour);

    // 밸브(수문) — 위 수로를 가로지르는 판이 경첩에서 젖혀 열린다.
    // 기둥은 윗부분만(아래까지 세우면 닫힌 판을 정면에서 가려 "잠김"이 안 읽힌다)
    waterG.add(box(7, 7, 38, GATE_X, 149, -32, matSteel));
    waterG.add(cyl(3, 24, GATE_X, 138, -49, matSteel), cyl(3, 24, GATE_X, 138, -15, matSteel));
    const gate = new THREE.Group();
    gate.position.set(GATE_X, 148, -32);
    const gatePlate = box(5, 46, 32, 0, -23, 0, matRed);
    gate.add(gatePlate);
    waterG.add(gate);
    const gateWheel = new THREE.Mesh(new THREE.TorusGeometry(7, 1.6, 8, 18), matRed);
    gateWheel.position.set(GATE_X, 158, -32);
    gateWheel.rotation.x = Math.PI / 2;
    waterG.add(gateWheel);

    // 배출 홈통 — 수로 물을 앞으로 빼내 물레방아 위에서 떨어뜨린다
    waterG.add(box(26, 3, 18, 66, 98.5, -5, matEdge));
    waterG.add(box(3, 11, 18, 53, 103, -5, matEdge), box(3, 11, 18, 79, 103, -5, matEdge));
    const chuteWater = box(22, 3, 16, 66, 101.5, -5, matWater);
    waterG.add(chuteWater);

    // 낙수 2단: 홈통 → 물레방아 / 물레방아 → 아래 수로
    const fallA = box(12, 26, 8, FALL_X, 86.5, WHEEL.z, matFall);
    const fallB = box(9, 9, 8, 77, 30, WHEEL.z, matFall);
    waterG.add(fallA, fallB);

    // 물레방아 — 테 2개 + 살 8 + 물받이 8
    const wheelG = new THREE.Group();
    wheelG.position.set(WHEEL.x, WHEEL.y, WHEEL.z);
    for (const zz of [-WHEEL.halfW, WHEEL.halfW]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(WHEEL.r, 1.7, 8, 40), matWood);
      rim.position.z = zz;
      wheelG.add(rim);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (const zz of [-WHEEL.halfW, WHEEL.halfW]) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, WHEEL.r, 8), matWoodDark);
        spoke.position.set(Math.cos(a) * WHEEL.r * 0.5, Math.sin(a) * WHEEL.r * 0.5, zz);
        spoke.rotation.z = a - Math.PI / 2;
        wheelG.add(spoke);
      }
      const paddle = box(2.6, 12, WHEEL.halfW * 2 - 2, Math.cos(a) * (WHEEL.r - 5), Math.sin(a) * (WHEEL.r - 5), 0, matWood);
      paddle.rotation.z = a - Math.PI / 2;
      wheelG.add(paddle);
    }
    wheelG.add(cyl(3.6, WHEEL.halfW * 2 + 8, 0, 0, 0, matWoodDark, "z"));
    waterG.add(wheelG);
    waterG.add(cyl(2.6, 18, WHEEL.x, WHEEL.y, -5, matSteel, "z")); // 축 받침

    // 높이 차 표시 — 아래 수면 ~ 위 수면(블록 앞쪽에 띄워 가려지지 않게)
    const HI_X = -88;
    const HI_Z = 34;
    const hiShaft = box(2.6, 1, 2.6, HI_X, 0, HI_Z, matHi);
    const hiTopCone = new THREE.Mesh(new THREE.ConeGeometry(5.5, 10, 12), matHi);
    const hiBotCone = new THREE.Mesh(new THREE.ConeGeometry(5.5, 10, 12), matHi);
    hiBotCone.rotation.z = Math.PI;
    const hiTickTop = box(46, 1.6, 1.6, HI_X + 24, 0, HI_Z, matHi);
    const hiTickBot = box(46, 1.6, 1.6, HI_X + 24, POOL_SURF, HI_Z, matHi);
    waterG.add(hiShaft, hiTopCone, hiBotCone, hiTickTop, hiTickBot);
    const hiLabel = S.makeLabel("높이 차", { size: 14, color: "#9BE0FF" });
    waterG.add(hiLabel);

    // ══ 전기 회로 ════════════════════════════════════════════
    const elecG = new THREE.Group();
    elecG.position.x = COL;
    elecG.add(buildBlock());
    scene.add(elecG);

    // 전지(직렬로 쌓인다 — 세기 3단 = 1·2·3개)
    const CELL_H = 26;
    const cells: T.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const cg = new THREE.Group();
      cg.position.set(PUMP_X, POOL_FLOOR + CELL_H * i, 4);
      const body = cyl(9, CELL_H - 3, 0, (CELL_H - 3) / 2 + 0.6, 0, new THREE.MeshStandardMaterial({ color: C.battery, roughness: 0.45, metalness: 0.35 }));
      const band = cyl(9.2, 4, 0, 4.4, 0, new THREE.MeshStandardMaterial({ color: C.gold, roughness: 0.35, metalness: 0.7 }));
      const cap = cyl(5.6, 2.6, 0, CELL_H - 1.2, 0, new THREE.MeshStandardMaterial({ color: 0xc9cfd8, roughness: 0.3, metalness: 0.75 }));
      const nub = cyl(3.4, 3.2, 0, CELL_H + 1.4, 0, new THREE.MeshStandardMaterial({ color: 0xd9dee6, roughness: 0.3, metalness: 0.75 }));
      cg.add(body, band, cap, nub);
      elecG.add(cg);
      cells.push(cg);
    }
    const voltLabel = S.makeLabel("1.5 V", { size: 13, color: "#FFD98C" });
    elecG.add(voltLabel);

    // 스위치 — 수로 홈 안의 칼날 스위치(레버가 들리면 길이 끊긴다)
    elecG.add(box(34, 3, 22, GATE_X, 102.5, -32, matEdge));
    elecG.add(cyl(2.6, 9, GATE_X - 11, 108, -32, matSteel), cyl(2.6, 9, GATE_X + 11, 108, -32, matSteel));
    const lever = new THREE.Group();
    lever.position.set(GATE_X - 11, 111, -32);
    const leverBar = box(24, 3, 4, 12, 0, 0, matSteel);
    lever.add(leverBar);
    elecG.add(lever);

    // 전선 — 전지 (+) → 위 수로 홈 → 오른쪽 → 앞으로 내려와 전구 → 아래 수로 홈 → (−)
    const wireTop = new THREE.Group();
    const wireBot = new THREE.Group();
    elecG.add(wireTop, wireBot);
    let wireTopMesh: T.Mesh | null = null;
    const rebuildTopWire = (batTop: number): void => {
      if (wireTopMesh) {
        wireTopMesh.geometry.dispose();
        wireTop.remove(wireTopMesh);
      }
      const pts = [
        new THREE.Vector3(PUMP_X, batTop, 4),
        new THREE.Vector3(PUMP_X, 104, 4),
        new THREE.Vector3(PUMP_X, 106, -32),
        new THREE.Vector3(-20, 106, -32),
      ];
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
      wireTopMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 2.2, 8, false), matCopper);
      wireTop.add(wireTopMesh);
    };
    {
      // 스위치 오른쪽 ~ 전구 ~ 아래 수로 ~ 전지 (−) — 고정 구간
      const pts = [
        new THREE.Vector3(12, 106, -32),
        new THREE.Vector3(56, 106, -32),
        new THREE.Vector3(64, 103, -30),
        new THREE.Vector3(66, 100, 2),
        new THREE.Vector3(BULB.x, 72, 2),
      ];
      const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
      wireBot.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 2.2, 8, false), matCopper));
      const pts2 = [
        new THREE.Vector3(BULB.x, 32, 2),
        new THREE.Vector3(66, 22, 6),
        new THREE.Vector3(70, 20, 10),
        new THREE.Vector3(PUMP_X, 20, 10),
        new THREE.Vector3(PUMP_X, POOL_FLOOR + 3, 4),
      ];
      const curve2 = new THREE.CatmullRomCurve3(pts2, false, "catmullrom", 0.4);
      wireBot.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, 70, 2.2, 8, false), matCopper));
    }

    // 전구 — 소켓 + 유리구 + 필라멘트 + 글로우
    elecG.add(cyl(8.5, 12, BULB.x, 36, BULB.z, matSteel));
    const bulbGlassMat = new THREE.MeshStandardMaterial({
      color: 0xdfefff, roughness: 0.08, metalness: 0.05, transparent: true, opacity: 0.26, depthWrite: false,
    });
    const bulbGlass = new THREE.Mesh(new THREE.SphereGeometry(BULB.r, 28, 20), bulbGlassMat);
    bulbGlass.position.set(BULB.x, BULB.y + 4, BULB.z);
    elecG.add(bulbGlass);
    const filMat = new THREE.MeshBasicMaterial({ color: 0xffd27a });
    const filament = new THREE.Mesh(new THREE.TorusGeometry(4.6, 1.1, 8, 16), filMat);
    filament.position.set(BULB.x, BULB.y + 3, BULB.z);
    filament.rotation.x = Math.PI / 2;
    elecG.add(filament);
    const bulbGlow = S.makeGlow(46, "rgba(255,206,110,.55)", 0.26);
    bulbGlow.position.set(BULB.x, BULB.y + 4, BULB.z + 2);
    elecG.add(bulbGlow);
    const bulbLight = new THREE.PointLight(0xffd08a, 0, 150, 1.6);
    bulbLight.position.set(BULB.x, BULB.y + 4, BULB.z + 12);
    elecG.add(bulbLight);

    // ── 흐름 알갱이(물살 · 전류) ──
    const BEADS = 22;
    const beadGeo = new THREE.SphereGeometry(2.9, 10, 10);
    const waterBeads: T.Mesh[] = [];
    const elecBeads: T.Mesh[] = [];
    for (let i = 0; i < BEADS; i++) {
      const wb = new THREE.Mesh(beadGeo, matBead);
      waterG.add(wb);
      waterBeads.push(wb);
      const eb = new THREE.Mesh(beadGeo, matAmberBead);
      elecG.add(eb);
      elecBeads.push(eb);
    }

    // ── 이름표 + 히트 프록시 + **탭 표시(점선 링)** ──
    // 링은 스프라이트라 항상 카메라를 정면으로 본다 = 어느 각도에서도 동그라미로 읽힌다.
    // "지금 눌러야 할 쪽"만 깜빡이게 해 물 → 전기 순서를 말 없이 알려 준다.
    const proxyMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0, depthWrite: false });
    const ringTex = tapRingTexture(THREE);
    const proxies: { def: ElemDef; mesh: T.Mesh; mat: T.MeshBasicMaterial; label: T.Sprite; ring: T.Sprite }[] = [];
    for (const def of ELEMS) {
      const g = def.side === "water" ? waterG : elecG;
      const mat = proxyMat.clone();
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.r, 16, 12), mat);
      mesh.position.set(def.at[0], def.at[1], def.at[2]);
      mesh.userData.elem = def.id;
      g.add(mesh);
      const ring = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: ringTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false }),
      );
      ring.position.copy(mesh.position);
      ring.scale.setScalar(def.r * 1.72); // 히트 반경(r)보다 약간 큰 정도 — 2.35×는 부담스럽다는 실사용 피드백으로 축소
      ring.renderOrder = 4;
      ring.userData.elem = def.id;
      g.add(ring);
      const label = S.makeLabel(def.name, { size: 12.5, color: "#DCEAFF" });
      label.position.set(def.lab[0], def.lab[1], def.lab[2]);
      label.material.opacity = 0.72;
      label.userData.elem = def.id;
      g.add(label);
      proxies.push({ def, mesh, mat, label, ring });
    }
    // 회로 이름 — 상단 HUD(상태 필·토스트·나가기)를 피해 각 블록의 **오른쪽 위**로(사용자 확정)
    const titleW = S.makeLabel("물의 회로", { size: 16, color: "#9BE0FF" });
    titleW.position.set(70, 172, -20);
    waterG.add(titleW);
    const titleE = S.makeLabel("전기 회로", { size: 16, color: "#FFD98C" });
    titleE.position.set(70, 172, -20);
    elecG.add(titleE);

    // ---- 경로(알갱이가 따라 흐르는 길) ----
    const V = (x: number, y: number, z: number): T.Vector3 => new THREE.Vector3(x, y, z);
    const makeCurve = (pts: T.Vector3[]): T.CatmullRomCurve3 => new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.25);
    const waterCurveAt = (level: number): T.CatmullRomCurve3 =>
      makeCurve([
        V(78, 21, 12),
        V(-60, 21, 12),
        V(PUMP_X, 20, -6),
        V(PUMP_X, 130, -6),
        V(PUMP_X, 150, -36),
        V(PUMP_X, level - 4, -32),
        V(-30, level - 4, -32),
        V(52, level - 4, -32),
        V(68, 102, -28),
        V(FALL_X, 99, WHEEL.z),
        V(FALL_X, 74, WHEEL.z),
        V(80, 44, WHEEL.z),
        V(78, 24, 8),
      ]);
    const elecCurve = makeCurve([
      V(PUMP_X, 60, 4),
      V(PUMP_X, 104, 4),
      V(PUMP_X, 106, -32),
      V(-30, 106, -32),
      V(56, 106, -32),
      V(64, 103, -30),
      V(66, 100, 2),
      V(BULB.x, 72, 2),
      V(BULB.x, 32, 2),
      V(68, 21, 8),
      V(-30, 20, 10),
      V(PUMP_X, 20, 10),
      V(PUMP_X, 30, 4),
    ]);
    let waterCurve = waterCurveAt(WALL_TOP + STEPS[stepIdx].depth);
    let curveLevel = WALL_TOP + STEPS[stepIdx].depth;

    // ---- 입력: 탭 = 요소 선택 / 드래그 = 시점 회전 ----
    let spinY = 0;
    let downAt: { x: number; y: number } | null = null;
    let dragging = false;
    let lastX = 0;
    canvas.addEventListener("pointerdown", (e) => {
      if (!rot) return;
      const p = rot.mapPoint(e);
      downAt = p;
      lastX = p.x;
      dragging = false;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* 합성 이벤트 */
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!downAt || !rot) return;
      const p = rot.mapPoint(e);
      if (!dragging && Math.abs(p.x - downAt.x) + Math.abs(p.y - downAt.y) > 10) dragging = true;
      if (dragging) {
        spinY = Math.max(-0.42, Math.min(0.34, spinY + (p.x - lastX) * 0.0035));
        lastX = p.x;
      }
    });
    canvas.addEventListener("pointerup", (e) => {
      if (downAt && !dragging) pick(e);
      downAt = null;
      dragging = false;
    });
    canvas.addEventListener("pointercancel", () => {
      downAt = null;
      dragging = false;
    });

    function pick(e: PointerEvent): void {
      if (!rot || !st) return;
      const { w, h } = rot.size();
      const p = rot.mapPoint(e);
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((p.x / w) * 2 - 1, -((p.y / h) * 2 - 1)), st.camera);
      const hits = ray.intersectObjects(
        proxies.flatMap((pr) => [pr.mesh, pr.label as unknown as T.Object3D]),
        false,
      );
      const id = hits.length ? (hits[0].object.userData.elem as ElemId | undefined) : undefined;
      if (!id) {
        // 빈 곳을 탭하면 카드를 접는다(무대를 가리지 않게)
        cardEl?.classList.remove("show");
        selected = null;
        return;
      }
      tapElem(id);
    }

    function tapElem(id: ElemId): void {
      const def = elemOf(id);
      selected = id;
      haptic(HAPTIC.select);
      if (def.side === "water") {
        selWater = id;
        roleCard(def);
        return;
      }
      // 전기 요소 — 앞서 고른 물 요소와 짝이 맞는지 판정
      if (!selWater) {
        roleCard(def);
        return;
      }
      const pair = PAIRS.find((pp) => pp.w === selWater)!;
      if (pair.e === id) {
        if (!matched.has(pair.w)) {
          matched.set(pair.w, matched.size % MATCH_COLORS.length);
          haptic(HAPTIC.correct);
          pairCard(pair);
          showToast(`정답! <b>${elemOf(pair.w).name} = ${elemOf(pair.e).name}</b> — ${pair.tag}`, 2400);
          if (matched.size === PAIRS.length) {
            collect("match", "5쌍 완성!");
            // 마지막 짝 설명을 읽을 시간을 준 뒤 남은 미션을 안내한다
            window.clearTimeout(guideTimer);
            guideTimer = window.setTimeout(() => guideCard(), 3600);
          }
        } else {
          pairCard(pair);
        }
        selWater = null;
      } else {
        haptic(HAPTIC.wrong);
        roleCard(def);
        showToast("음… 역할이 달라요. 다시 골라 봐요!", 1800);
      }
    }
    if ((import.meta as unknown as { env: { DEV: boolean } }).env.DEV) {
      (window as unknown as Record<string, unknown>).__ewx = {
        tap: (id: ElemId) => tapElem(id),
        // 요소의 무대 좌표(가로 기준) — e2e가 진짜 포인터 탭을 쏘아 레이캐스트 경로까지 검증한다
        screenOf: (id: ElemId) => {
          const pr = proxies.find((x) => x.def.id === id)!;
          const { w, h } = rot!.size();
          const v = pr.mesh.getWorldPosition(new THREE.Vector3()).project(st!.camera);
          return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h };
        },
        setStep: (i: number) => segBtns[i]?.click(),
        toggleValve: () => valveBtn.click(),
        state: () => ({ matched: matched.size, goals: Array.from(goals), stepIdx, open, ang: probe.ang, rate: probe.rate, level: probe.level }),
      };
    }

    // ---- 프레임 ----
    const probe = { ang: 0, rate: 0, level: 0 }; // DEV 훅(e2e)이 물레방아 회전·물살을 읽는 창
    let level = WALL_TOP + STEPS[stepIdx].depth;
    let rightFill = 1; // 밸브 아래쪽(오른쪽) 수로에 물이 남아 있는 정도
    let rate = 0;
    let omega = 0;
    let wheelAng = 0;
    let phase = 0;
    let bright = 0;
    let gateAng = 1.42;
    let leverAng = 0;
    let selPulse = 0;
    let lastSel: ElemId | null = null;

    loop = createLoop((dt, tMs) => {
      if (!rot || !st) return;
      const { w, h } = rot.size();
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      st.resize(w, h);

      const sd = STEPS[stepIdx];
      const targetRate = open ? sd.rate : 0;
      rate += (targetRate - rate) * Math.min(1, 0.09 * dt);
      level += (WALL_TOP + sd.depth - level) * Math.min(1, 0.08 * dt);
      rightFill += ((open ? 1 : 0) - rightFill) * Math.min(1, 0.055 * dt);
      bright += (rate - bright) * Math.min(1, 0.12 * dt);

      // 카메라 — 프레임을 항상 채우도록 거리 역산(필요 반폭 265 · 반높이 132).
      // 겨냥점을 장면 중심(y≈88)보다 낮게 잡아 무대를 위쪽으로 올린다(하단 HUD·설명 카드 자리 확보).
      const vhalf = Math.tan(((st.camera.fov / 2) * Math.PI) / 180);
      const dist = Math.max(265 / (vhalf * st.camera.aspect), 132 / vhalf) * 1.04;
      st.camera.position.set(0, 78 + dist * 0.19, dist * 0.982);
      st.camera.lookAt(0, 78, 0);
      waterG.rotation.y = YAW + spinY;
      elecG.rotation.y = YAW + spinY;

      // 위 수로 물 — 밸브 좌/우 두 덩이
      const depthL = level - WALL_TOP;
      const depthR = depthL * rightFill;
      resWaterL.scale.set(94, Math.max(0.4, depthL), 32);
      resWaterL.position.set(-48, WALL_TOP + depthL / 2, -32);
      resWaterR.scale.set(94, Math.max(0.4, depthR), 32);
      resWaterR.position.set(48, WALL_TOP + depthR / 2, -32);
      resWaterR.visible = depthR > 0.8;
      chuteWater.visible = rate > 0.03;
      chuteWater.scale.y = 0.6 + rate * 0.7;

      // 펌프가 쏟는 물줄기 — 토출구(y 156)에서 수면까지(가장 높은 수위에서도 보이게)
      const pourLen = Math.max(2, 156 - level);
      pumpPour.scale.set(0.9 + rate * 0.7, pourLen, 0.9 + rate * 0.7);
      pumpPour.position.set(PUMP_X, level + pourLen / 2, -36);
      pumpPour.visible = rate > 0.03;

      // 낙수 — 세기에 따라 굵어지고, 잠그면 사라진다
      const fw = 0.5 + rate * 0.6;
      fallA.scale.set(fw, 1, fw);
      fallA.visible = rate > 0.04;
      fallB.scale.set(fw, 1, fw);
      fallB.visible = rate > 0.04;
      fallTex.offset.y -= 0.055 * dt * (0.4 + rate);

      // 물레방아 — 물살이 돌린다(감쇠 포함, 잠그면 서서히 멈춘다)
      omega += (rate * 0.075 - omega) * Math.min(1, 0.045 * dt);
      wheelAng -= omega * dt;
      wheelG.rotation.z = wheelAng;
      probe.ang = wheelAng;
      probe.rate = rate;
      probe.level = level;

      // 밸브(수문) · 스위치 레버
      gateAng += ((open ? 1.42 : 0) - gateAng) * Math.min(1, 0.16 * dt);
      gate.rotation.z = gateAng;
      leverAng += ((open ? 0 : 0.62) - leverAng) * Math.min(1, 0.18 * dt);
      lever.rotation.z = leverAng;

      // 전지 개수 · 전압 라벨
      const batTop = POOL_FLOOR + CELL_H * sd.cells + 3;
      cells.forEach((cg, i) => (cg.visible = i < sd.cells));
      voltLabel.position.set(PUMP_X - 2, batTop + 16, 4);
      if (voltLabel.userData.txt !== sd.volt) {
        voltLabel.userData.txt = sd.volt;
        const nl = S.makeLabel(sd.volt, { size: 13, color: "#FFD98C" });
        voltLabel.material.map?.dispose();
        voltLabel.material.map = nl.material.map;
        voltLabel.material.needsUpdate = true;
        voltLabel.scale.copy(nl.scale);
      }
      if (wireTopMesh === null || wireTop.userData.top !== batTop) {
        wireTop.userData.top = batTop;
        rebuildTopWire(batTop);
      }

      // 높이 차 표시 — 아래 수면 ~ 위 수면
      const hiH = level - POOL_SURF;
      hiShaft.scale.set(1, hiH, 1);
      hiShaft.position.set(HI_X, POOL_SURF + hiH / 2, HI_Z);
      hiTopCone.position.set(HI_X, level - 5, HI_Z);
      hiBotCone.position.set(HI_X, POOL_SURF + 5, HI_Z);
      hiTickTop.position.set(HI_X + 24, level, HI_Z);
      hiLabel.position.set(HI_X - 16, POOL_SURF + hiH / 2, HI_Z);

      // 전구 밝기
      filMat.color.setRGB(0.35 + bright * 0.65, 0.28 + bright * 0.55, 0.18 + bright * 0.3);
      bulbGlow.material.opacity = 0.05 + bright * 0.62;
      bulbGlow.scale.setScalar(46 * (0.6 + bright * 0.6));
      bulbLight.intensity = bright * 420;
      bulbGlassMat.opacity = 0.22 + bright * 0.16;

      // 흐름 알갱이 — 두 회로가 같은 위상으로 흐른다
      if (Math.abs(level - curveLevel) > 0.6) {
        curveLevel = level;
        waterCurve = waterCurveAt(level);
      }
      phase = (phase + dt * 0.0016 * (0.25 + rate)) % 1;
      const flowing = rate > 0.04;
      for (let i = 0; i < BEADS; i++) {
        const t = (phase + i / BEADS) % 1;
        const wb = waterBeads[i];
        wb.visible = flowing;
        if (flowing) wb.position.copy(waterCurve.getPointAt(t));
        const eb = elecBeads[i];
        eb.visible = flowing;
        if (flowing) eb.position.copy(elecCurve.getPointAt(t));
      }

      // 탭 표시 · 선택 하이라이트 — 지금 눌러야 할 쪽(물 → 전기)만 점선 링이 깜빡인다
      if (selected !== lastSel) {
        lastSel = selected;
        selPulse = 1;
      }
      selPulse = Math.max(0, selPulse - 0.012 * dt);
      const activeSide: "water" | "elec" = selWater ? "elec" : "water";
      const blink = 0.28 + Math.sin(tMs / 380) * 0.18; // 은은하게(0.1~0.46) — 과한 깜빡임 축소
      for (const pr of proxies) {
        const pair = PAIRS.find((pp) => pp.w === pr.def.id || pp.e === pr.def.id)!;
        const ci = matched.get(pair.w);
        const isSel = selected === pr.def.id || selWater === pr.def.id;
        const on = ci != null;
        pr.mat.opacity = isSel ? 0.13 + selPulse * 0.13 : on ? 0.04 : 0;
        if (isSel) pr.mat.color.setHex(0xffe08a);
        else if (on) pr.mat.color.set(MATCH_COLORS[ci!]);
        // 링: 짝 완성 = 짝 색으로 상시 · 선택 = 금색 크게 · 지금 차례 = 깜빡임 · 그 외 = 흐릿
        const wantsTap = !on && pr.def.side === activeSide;
        pr.ring.material.opacity = isSel ? 0.9 : on ? 0.24 : wantsTap ? blink : 0.05;
        pr.ring.material.color.set(isSel ? "#FFE08A" : on ? MATCH_COLORS[ci!] : pr.def.side === "water" ? "#7FD3FF" : "#FFC46E");
        pr.ring.scale.setScalar(pr.def.r * 1.72 * (isSel ? 1.1 : wantsTap ? 1 + Math.sin(tMs / 380) * 0.035 : 1));
        pr.label.material.opacity = isSel ? 1 : on ? 0.95 : wantsTap ? 0.94 : 0.5;
        const ls = pr.label.userData.baseScale as T.Vector3 | undefined;
        if (!ls) pr.label.userData.baseScale = pr.label.scale.clone();
        else pr.label.scale.copy(ls).multiplyScalar(isSel ? 1.14 : 1);
      }
      // "물의 흐름"·"전류" 이름표는 수면·전선 위에 붙어 다닌다
      const flowLabel = proxies.find((pr) => pr.def.id === "flow");
      if (flowLabel) flowLabel.label.position.y = level + 14;
      const flowProxy = proxies.find((pr) => pr.def.id === "flow");
      if (flowProxy) flowProxy.mesh.position.y = level - 4;

      if (statusPill) {
        (statusPill.querySelectorAll("span")[1] as HTMLElement).textContent = open
          ? `높이 차 ${sd.hi} ↔ 전압 ${sd.volt}`
          : "잠김 — 물도 전류도 정지";
      }

      st.render();
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
    toastEl = null;
    cardEl = null;
    statusPill = null;
    missionEls = null;
    window.clearTimeout(toastTimer);
    window.clearTimeout(guideTimer);
    enterBtn.classList.remove("pulse");
    (enterBtn.querySelector("span") as HTMLElement).textContent = finished ? "비유 실험 다시 열기" : "가로 화면으로 이어서 열기";
    if (!finished) helper.innerHTML = "아직 남은 미션이 있어요 — 다시 열어서 <b>세기·밸브·대응 5쌍</b>을 모두 마쳐 봐요!";
  }

  enterBtn.addEventListener("click", () => void enter());

  api.setCTA("가로 화면에서 비유를 완성해요", { enabled: false });
  return () => {
    disposed = true;
    loop?.stop();
    st?.dispose();
    rot?.dispose();
    window.clearTimeout(toastTimer);
    window.clearTimeout(guideTimer);
  };
};

/** 탭 표시용 점선 링 텍스처(흰색 — 스프라이트 재질 color로 물/전기 색을 입힌다). */
function tapRingTexture(THREE: typeof T): T.CanvasTexture {
  const S = 128;
  const cv = document.createElement("canvas");
  cv.width = S;
  cv.height = S;
  const ctx = cv.getContext("2d")!;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  ctx.setLineDash([11, 11]);
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S / 2 - 6, 0, Math.PI * 2);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 낙수용 세로 줄무늬 텍스처 — offset.y를 굴려 흐르게 한다. */
function waterfallTexture(THREE: typeof T): T.CanvasTexture {
  const W = 64;
  const H = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "rgba(120,196,240,.55)");
  g.addColorStop(0.35, "rgba(196,236,255,.92)");
  g.addColorStop(0.62, "rgba(150,214,255,.85)");
  g.addColorStop(1, "rgba(110,186,232,.5)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 10 + Math.random() * 34;
    ctx.strokeStyle = `rgba(255,255,255,${(0.18 + Math.random() * 0.4).toFixed(2)})`;
    ctx.lineWidth = 1 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y + len);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1.6);
  return tex;
}

// 세로 진입 카드 미니 아트 — 높이 차가 만드는 흐름(왼쪽)과 전압이 만드는 흐름(오른쪽)
function enterArtSvg(): string {
  const wheel = `
    <circle cx="150" cy="74" r="16" stroke="#C9A05E" stroke-width="3.2"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      return `<line x1="150" y1="74" x2="${(150 + Math.cos(a) * 16).toFixed(1)}" y2="${(74 + Math.sin(a) * 16).toFixed(1)}" stroke="#8A6A34" stroke-width="2.4"/>`;
    }).join("")}`;
  return `<svg viewBox="0 0 360 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect width="360" height="128" fill="#0B1524"/>
    <text x="18" y="20" font-family="Pretendard, sans-serif" font-size="11.5" font-weight="800" fill="#9BE0FF">물의 회로</text>
    <text x="206" y="20" font-family="Pretendard, sans-serif" font-size="11.5" font-weight="800" fill="#FFD98C">전기 회로</text>
    <!-- 물: 위 수로(높은 곳) → 낙수 → 물레방아 → 아래 수로 → 펌프 -->
    <path d="M24 34h126" stroke="#2A4A6E" stroke-width="10"/>
    <path d="M24 34h126" stroke="#4FA6E0" stroke-width="6"/>
    <path d="M24 106h132" stroke="#2A4A6E" stroke-width="10"/>
    <path d="M24 106h132" stroke="#4FA6E0" stroke-width="6"/>
    <path d="M156 40v18" stroke="#8ED2FF" stroke-width="5" opacity=".9"/>
    <path d="M156 90v10" stroke="#8ED2FF" stroke-width="4" opacity=".8"/>
    ${wheel}
    <rect x="16" y="40" width="16" height="62" rx="5" fill="#7C889C"/>
    <rect x="12" y="24" width="24" height="18" rx="6" fill="#D0402C"/>
    <!-- 높이 차 -->
    <path d="M44 34v72" stroke="#9BE0FF" stroke-width="1.4" stroke-dasharray="4 4"/>
    <path d="M44 38l-4 6h8zM44 102l-4-6h8z" fill="#9BE0FF"/>
    <text x="50" y="74" font-family="Pretendard, sans-serif" font-size="10.5" font-weight="800" fill="#9BE0FF">높이 차</text>
    <!-- 전기: 같은 자리에 전선·전구·전지 -->
    <path d="M212 34h130v0" stroke="#D08A3A" stroke-width="5"/>
    <path d="M212 106h130" stroke="#D08A3A" stroke-width="5"/>
    <path d="M342 34v26M342 88v18" stroke="#D08A3A" stroke-width="5"/>
    <circle cx="342" cy="74" r="15" fill="rgba(255,214,120,.24)"/>
    <circle cx="342" cy="74" r="9.5" fill="rgba(255,214,120,.95)"/>
    <rect x="204" y="52" width="16" height="54" rx="4" fill="#2A2F38"/>
    <rect x="208" y="46" width="8" height="7" rx="2" fill="#D8B04A"/>
    <path d="M212 46V34" stroke="#D08A3A" stroke-width="5"/>
    <text x="228" y="72" font-family="Pretendard, sans-serif" font-size="10.5" font-weight="800" fill="#FFD98C">전압</text>
    <circle cx="268" cy="34" r="3" fill="#FFC46E"/><circle cx="296" cy="34" r="3" fill="#FFC46E"/>
    <circle cx="268" cy="106" r="3" fill="#FFC46E"/><circle cx="296" cy="106" r="3" fill="#FFC46E"/>
    <circle cx="80" cy="34" r="3" fill="#8ED2FF"/><circle cx="108" cy="34" r="3" fill="#8ED2FF"/>
    <circle cx="80" cy="106" r="3" fill="#8ED2FF"/><circle cx="108" cy="106" r="3" fill="#8ED2FF"/>
  </svg>`;
}
