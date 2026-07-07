// driftLab — 대륙 이동설 랩(중2 II L8). 교과서 그림 II-19의 조작판.
//   · PALEOMAP 시대 지도 11장(280→0 Ma, 촘촘한 중간 지대 포함)을 타임라인 스크럽으로 크로스페이드
//     (사용자의 earth-history-2d3d 슬라이더 문법 계승: 목표 나이 관성 수렴 + smoothstep 블렌드).
//   · 증거 오버레이 3종(화석·빙하 흔적·산맥) — 현재는 대륙마다 흩어져 있지만,
//     판게아로 감으면 표지가 한 줄로 이어진다(베게너의 논리를 눈으로).
//   · 지도: C.R. Scotese, PALEOMAP Project (public/geo/maps, photos/CREDITS.md 표기).
// 목표: ① 판게아 도달 ② 증거 3종 모두 켜서 이어짐 확인 ③ 현재로 돌아와 흩어짐 확인.

import { el, clamp } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface DriftStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

const ERAS = [
  { ma: 0, file: "Map01a_PALEOMAP_PaleoAtlas_000.webp", label: "현재" },
  { ma: 20, file: "ma020.webp", label: "약 2천만 년 전" },
  { ma: 35, file: "ma035.webp", label: "약 3천5백만 년 전" },
  { ma: 66, file: "Map16a_KT_Boundary_066.webp", label: "약 6천5백만 년 전" },
  { ma: 90, file: "ma090.webp", label: "약 9천만 년 전" },
  { ma: 120, file: "ma120.webp", label: "약 1억 2천만 년 전" },
  { ma: 150, file: "Map33a_LtJ_Tithonian_150.webp", label: "약 1억 5천만 년 전" },
  { ma: 175, file: "ma175.webp", label: "약 1억 7천5백만 년 전" },
  { ma: 200, file: "Map43a_Triassic-Jurassic_Boundary_200.webp", label: "약 2억 년 전 — 분리 시작" },
  { ma: 240, file: "ma240.webp", label: "약 2억 4천만 년 전" },
  { ma: 280, file: "Map54a_EP_Artinskian_280.webp", label: "약 2억 8천만 년 전 — 판게아" },
];
const MAX_MA = 280;

type EvidId = "fossil" | "glacier" | "range";
interface Mark {
  now: [number, number]; // 현재 지도 위 정규화 좌표(x,y)
  pan: [number, number]; // 판게아 지도 위 좌표
}
// 좌표는 등장방형(equirectangular) 지도 기준 근사 — 끝점(현재·판게아)에서 가장 정확하게 보이도록.
const EVIDENCE: Record<EvidId, { name: string; color: string; marks: Mark[] }> = {
  fossil: {
    name: "화석 분포",
    color: "#5FD9A8",
    marks: [
      { now: [0.395, 0.63], pan: [0.475, 0.665] }, // 메소사우루스 — 남미 동해안
      { now: [0.535, 0.645], pan: [0.505, 0.67] }, // 메소사우루스 — 아프리카 서해안
      { now: [0.345, 0.67], pan: [0.455, 0.7] }, // 글로소프테리스 — 남미
      { now: [0.565, 0.655], pan: [0.52, 0.7] }, // 글로소프테리스 — 아프리카
      { now: [0.715, 0.4], pan: [0.565, 0.71] }, // 글로소프테리스 — 인도
      { now: [0.87, 0.64], pan: [0.61, 0.7] }, // 글로소프테리스 — 오스트레일리아
      { now: [0.62, 0.9], pan: [0.55, 0.75] }, // 글로소프테리스 — 남극
    ],
  },
  glacier: {
    name: "빙하 흔적",
    color: "#8FC6FF",
    marks: [
      { now: [0.335, 0.72], pan: [0.465, 0.73] }, // 남미 남부
      { now: [0.56, 0.68], pan: [0.515, 0.735] }, // 아프리카 남부
      { now: [0.712, 0.41], pan: [0.56, 0.74] }, // 인도
      { now: [0.885, 0.675], pan: [0.605, 0.735] }, // 오스트레일리아
      { now: [0.5, 0.93], pan: [0.545, 0.775] }, // 남극
    ],
  },
  range: {
    name: "산맥 연결",
    color: "#F5B357",
    marks: [
      { now: [0.283, 0.3], pan: [0.462, 0.42] }, // 애팔래치아(북미 동부)
      { now: [0.489, 0.2], pan: [0.497, 0.4] }, // 칼레도니아(영국·스칸디나비아)
      { now: [0.522, 0.165], pan: [0.512, 0.39] },
    ],
  },
};

export const driftLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as DriftStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge geo", dataset: { g: "pangea" } }, el("b", { text: "판게아" }), el("span", { text: "과거로!" })),
    el("div", { class: "pn-badge geo", dataset: { g: "evid" } }, el("b", { text: "증거 셋" }), el("span", { text: "이어질까?" })),
    el("div", { class: "pn-badge geo", dataset: { g: "back" } }, el("b", { text: "다시 현재" }), el("span", { text: "흩어짐" })),
  );

  // ---- 무대: 지도 2장 크로스페이드 + 증거 오버레이 캔버스 ----
  const imgA = el("img", { class: "df-map", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  const imgB = el("img", { class: "df-map df-blend", attrs: { alt: "", draggable: "false" } }) as HTMLImageElement;
  const overlay = el("canvas", { class: "df-overlay" }) as HTMLCanvasElement;
  const ageBadge = el("div", { class: "df-age", text: "현재" });
  const stage = el("div", { class: "stage df-stage" }, imgA, imgB, overlay, ageBadge);

  // ---- 타임라인(스크럽) ----
  const thumb = el("div", { class: "df-thumb" });
  const fill = el("div", { class: "df-fill" });
  const track = el(
    "div",
    {
      class: "df-track",
      attrs: {
        role: "slider", tabindex: "0", "aria-label": "시대 이동",
        "aria-valuemin": "0", "aria-valuemax": String(MAX_MA), "aria-valuenow": "0",
      },
    },
    fill,
    ...ERAS.map((e) => el("i", { class: "df-tick", style: `left:${(e.ma / MAX_MA) * 100}%` })),
    thumb,
  );
  const trackCaps = el("div", { class: "hp-slider-caps" }, el("span", { text: "현재" }), el("span", { text: "2억 8천만 년 전" }));
  const timeline = el("div", { class: "df-timeline" }, track, trackCaps);

  // ---- 증거 토글 ----
  const evRow = el("div", { class: "df-evrow" });
  const evOn: Record<EvidId, boolean> = { fossil: false, glacier: false, range: false };
  (Object.keys(EVIDENCE) as EvidId[]).forEach((id) => {
    const b = el("button", { class: "df-ev", attrs: { type: "button", "aria-pressed": "false" } },
      el("span", { class: "pdot", style: `background:${EVIDENCE[id].color}` }),
      el("span", { text: EVIDENCE[id].name }),
    );
    b.addEventListener("click", () => {
      evOn[id] = !evOn[id];
      b.classList.toggle("on", evOn[id]);
      b.setAttribute("aria-pressed", String(evOn[id]));
      haptic(HAPTIC.tap);
      checkEvidGoal();
    });
    evRow.appendChild(b);
  });

  const helper = el("div", {
    class: "helper",
    html: "베게너의 눈으로 봐요 — 타임라인을 <b>과거로</b> 밀면 대륙들이 모여요. <b>증거</b>를 켜고 무슨 일이 생기는지 지켜봐요!",
  });
  host.append(goalChips, stage, timeline, evRow, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  // ---- 상태 ----
  let age = 0;
  let target = 0;
  let pangeaMs = 0;
  let backArmed = false; // 판게아를 본 뒤에만 '다시 현재' 목표가 열린다
  const goals = new Set<string>();
  let finished = false;

  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "베게너의 증거 완성! <b>해안선</b>이 맞물리고, <b>화석·빙하 흔적·산맥</b>이 판게아에서 하나로 이어졌어요. 당시엔 대륙을 움직이는 <b>힘을 설명하지 못해</b> 인정받지 못했다는 것까지 기억!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "개념 정리하기");
    }
  }
  function checkEvidGoal(): void {
    if (age > 240 && evOn.fossil && evOn.glacier && evOn.range) collect("evid", "이어졌다!");
  }

  // ---- 지도 로딩(교차 페이드) ----
  const srcOf = (i: number): string => `${base}geo/maps/${ERAS[i].file}`;
  // 프리로드
  ERAS.forEach((e) => {
    const im = new Image();
    im.src = `${base}geo/maps/${e.file}`;
  });
  let curA = -1;
  let curB = -1;

  function blendAt(a: number): { ia: number; ib: number; t: number } {
    for (let i = 1; i < ERAS.length; i++) {
      if (a <= ERAS[i].ma) {
        const span = ERAS[i].ma - ERAS[i - 1].ma;
        return { ia: i - 1, ib: i, t: clamp((a - ERAS[i - 1].ma) / span, 0, 1) };
      }
    }
    return { ia: ERAS.length - 1, ib: ERAS.length - 1, t: 0 };
  }
  const smooth = (t: number): number => t * t * (3 - 2 * t);

  // ---- 스크럽 입력 ----
  let scrubbing = false;
  function setFromPointer(e: PointerEvent): void {
    const r = track.getBoundingClientRect();
    target = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1) * MAX_MA;
  }
  track.addEventListener("pointerdown", (e) => {
    scrubbing = true;
    try {
      track.setPointerCapture(e.pointerId);
    } catch {
      /* 합성 이벤트 등 캡처 불가 환경 */
    }
    setFromPointer(e);
    haptic(HAPTIC.tap);
  });
  track.addEventListener("pointermove", (e) => {
    if (scrubbing) setFromPointer(e);
  });
  const endScrub = (): void => {
    scrubbing = false;
  };
  track.addEventListener("pointerup", endScrub);
  track.addEventListener("pointercancel", endScrub);
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") target = clamp(target + 14, 0, MAX_MA);
    else if (e.key === "ArrowLeft") target = clamp(target - 14, 0, MAX_MA);
    else return;
    e.preventDefault();
  });

  // ---- 프레임 ----
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  let shownAge = -1;
  const loop: Loop = createLoop((dt, tMs) => {
    age += (target - age) * Math.min(1, 0.14 * dt);
    if (Math.abs(age - target) < 0.15) age = target;

    const { ia, ib, t } = blendAt(age);
    if (curA !== ia) {
      curA = ia;
      imgA.src = srcOf(ia);
    }
    if (curB !== ib) {
      curB = ib;
      imgB.src = srcOf(ib);
    }
    imgB.style.opacity = String(smooth(t));

    // 나이 배지 + aria
    const rounded = Math.round(age);
    if (rounded !== shownAge) {
      shownAge = rounded;
      const near = ERAS.reduce((p, c) => (Math.abs(c.ma - age) < Math.abs(p.ma - age) ? c : p), ERAS[0]);
      ageBadge.textContent = age < 6 ? "현재" : near.label;
      track.setAttribute("aria-valuenow", String(rounded));
      const pct = (age / MAX_MA) * 100;
      thumb.style.left = `${pct}%`;
      fill.style.width = `${pct}%`;
    }

    // 목표 판정
    if (age > 255) {
      pangeaMs += dt * 16.7;
      if (pangeaMs > 450) {
        collect("pangea", "한 덩어리!");
        backArmed = true;
      }
    } else pangeaMs = 0;
    checkEvidGoal();
    if (backArmed && goals.has("evid") && age < 8) collect("back", "흩어졌다!");

    // ---- 증거 오버레이 ----
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w > 0 && (overlay.width !== Math.round(w * DPR) || overlay.height !== Math.round(h * DPR))) {
      overlay.width = Math.round(w * DPR);
      overlay.height = Math.round(h * DPR);
    }
    const ctx = overlay.getContext("2d")!;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const u = smooth(clamp(age / MAX_MA, 0, 1)); // 0=현재 → 1=판게아
    const linkA = clamp((age - 235) / 40, 0, 1); // 판게아 근처에서 연결선 등장
    (Object.keys(EVIDENCE) as EvidId[]).forEach((id) => {
      if (!evOn[id]) return;
      const ev = EVIDENCE[id];
      const pts = ev.marks.map((m) => ({
        x: (m.now[0] + (m.pan[0] - m.now[0]) * u) * w,
        y: (m.now[1] + (m.pan[1] - m.now[1]) * u) * h,
      }));
      // 연결선(판게아 근처) — "모으면 이어진다"
      if (linkA > 0.02 && pts.length > 1) {
        ctx.strokeStyle = ev.color;
        ctx.globalAlpha = 0.55 * linkA;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // 표지 점(발광)
      for (const p of pts) {
        const pulse = 1 + Math.sin(tMs / 420 + p.x) * 0.15;
        ctx.fillStyle = ev.color;
        ctx.globalAlpha = 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(10,16,28,.55)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });
  });

  const rafId = requestAnimationFrame(() => loop.start());
  imgA.src = srcOf(0);
  imgB.src = srcOf(1);
  imgB.style.opacity = "0";

  api.setCTA("판게아를 찾아 증거를 모아요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
  };
};
