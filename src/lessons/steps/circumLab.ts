// circumLab, 등거리 수색대(중2 수학 Ⅳ L4 기함, 책 150~153쪽). 세 집에서 같은 거리인 지점 찾기.
// ① 감으로 핀 드래그(세 거리 리드아웃) → 정확히 맞추기가 거의 불가능함을 몸으로
// ② 수직이등분선 밴드 도구: "이 선 위는 A·B 등거리" → 두 밴드의 교점에 스냅 → 세 거리 일치
//    → 세 집을 지나는 원(외접원의 씨앗) 그리기
// ③ 마을 모양 탐사: 직각 마을(교점=빗변 한가운데!)·길쭉한 마을(교점이 마을 밖!) → 위치 판정.
// '외심/외접원' 명칭은 다음 concept 몫 — 랩은 "등거리 지점/세 집을 지나는 원"까지만.
// 수직이등분선은 중1 기왕 용어라 자유 사용. rAF 금지(트윈은 setTimeout 체인), capturePointer.
// 스타일: math2.css .ccl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { dot, rightMark, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Pt = { x: number; y: number };

/** 세 점 등거리점(수직이등분선 교점) 계산. */
function circumOf(A: Pt, B: Pt, C: Pt): { o: Pt; r: number } {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const ux =
    ((A.x * A.x + A.y * A.y) * (B.y - C.y) +
      (B.x * B.x + B.y * B.y) * (C.y - A.y) +
      (C.x * C.x + C.y * C.y) * (A.y - B.y)) / d;
  const uy =
    ((A.x * A.x + A.y * A.y) * (C.x - B.x) +
      (B.x * B.x + B.y * B.y) * (A.x - C.x) +
      (C.x * C.x + C.y * C.y) * (B.x - A.x)) / d;
  const o = { x: ux, y: uy };
  return { o, r: Math.hypot(A.x - o.x, A.y - o.y) };
}

const VB_W = 340;
const VB_H = 272;

/* 마을 3종: 처음(예각·부등변) → 직각 마을 → 길쭉한 마을(둔각) */
const TOWNS: { A: Pt; B: Pt; C: Pt }[] = [
  { A: { x: 172, y: 46 }, B: { x: 56, y: 210 }, C: { x: 300, y: 188 } },
  { A: { x: 76, y: 64 }, B: { x: 76, y: 206 }, C: { x: 296, y: 206 } }, // 직각(B에서)
  { A: { x: 128, y: 128 }, B: { x: 48, y: 196 }, C: { x: 312, y: 196 } }, // 둔각(A에서) → 등거리점이 마을 밖
];
const NAMES = ["지우네", "하람이네", "도윤이네"] as const;
const HOUSE_HUE = ["#1971C2", "#7A9A1E", "#B36CCB"] as const;

export const circumLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "hunt", label: "감으로 도전", sub: "핀을 끌어요" },
    { id: "snap", label: "교점 발견", sub: "잠김" },
    { id: "spot", label: "위치 탐사", sub: "잠김" },
  ]);

  const board = mboard(560);
  const reads = el("div", { class: "ccl-reads", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="ccl-map"></g><g class="ccl-bands"></g><g class="ccl-tri"></g>` +
    `<g class="ccl-lines"></g><g class="ccl-circle"></g><g class="ccl-pin"></g><g class="ccl-badge"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(reads, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "분홍 <b>핀</b>을 끌어서 세 집에서 <b>같은 거리</b>인 지점을 찾아보세요. 위 리드아웃이 실시간으로 알려 줘요!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gMap = svg.querySelector(".ccl-map") as SVGGElement;
  const gBands = svg.querySelector(".ccl-bands") as SVGGElement;
  const gTri = svg.querySelector(".ccl-tri") as SVGGElement;
  const gLines = svg.querySelector(".ccl-lines") as SVGGElement;
  const gCircle = svg.querySelector(".ccl-circle") as SVGGElement;
  const gPin = svg.querySelector(".ccl-pin") as SVGGElement;
  const gBadge = svg.querySelector(".ccl-badge") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let pts = { ...TOWNS[0] };
  let P: Pt = { x: 150, y: 150 };
  let phase: "hunt" | "band" | "snapped" | "tour" | "done" = "hunt";
  let bands = 0; // 켜진 수직이등분선 수
  let dragging = false;
  let dragDist = 0;
  let snapped = false;
  const visited = new Set<number>(); // 탐사한 마을

  const distTo = (h: Pt): number => Math.hypot(P.x - h.x, P.y - h.y);
  /** px → 분 단위(÷14, 소수 1자리) — "걸리는 시간" 서사 유지. */
  const mins = (px: number): string => (px / 14).toFixed(1);

  function house(h: Pt, i: number): string {
    return (
      `<g>` +
      `<rect x="${h.x - 9}" y="${h.y - 4}" width="18" height="14" rx="2.5" fill="${HOUSE_HUE[i]}" opacity=".9" stroke="#33475C" stroke-width="1.3"/>` +
      `<path d="M${h.x - 12} ${h.y - 3} L${h.x} ${h.y - 13} L${h.x + 12} ${h.y - 3} Z" fill="#D9694A" stroke="#8C3A2A" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<text x="${h.x}" y="${h.y + 24}" text-anchor="middle" font-size="10" font-weight="800" fill="#5A6B7E">${NAMES[i]}</text>` +
      `</g>`
    );
  }

  function paintMap(): void {
    const { A, B, C } = pts;
    gMap.innerHTML =
      `<rect x="6" y="6" width="${VB_W - 12}" height="${VB_H - 12}" rx="14" fill="#F6FAFE"/>` +
      `<path d="M20 236 q70 -20 140 -6 q86 16 160 -16" stroke="#DCE8F2" stroke-width="8" fill="none" stroke-linecap="round"/>` +
      house(A, 0) + house(B, 1) + house(C, 2);
  }

  function paintPin(): void {
    if (phase === "tour" || phase === "done") {
      gPin.innerHTML = "";
      return;
    }
    gPin.innerHTML =
      `<g class="ccl-pinG" style="cursor:grab">` +
      `<circle cx="${P.x}" cy="${P.y}" r="16" fill="rgba(210,52,90,.12)"/>` +
      `<path d="M${P.x} ${P.y - 20} q9 0 9 9 q0 7 -9 16 q-9 -9 -9 -16 q0 -9 9 -9 z" fill="#E8547E" stroke="#8C1D33" stroke-width="1.6"/>` +
      `<circle cx="${P.x}" cy="${P.y - 11}" r="3.2" fill="#FFE1E8"/>` +
      `</g>`;
  }

  function paintLines(): void {
    if (phase === "tour" || phase === "done") {
      gLines.innerHTML = "";
      return;
    }
    const hs = [pts.A, pts.B, pts.C];
    gLines.innerHTML = hs
      .map(
        (h, i) =>
          `<line x1="${P.x}" y1="${P.y}" x2="${h.x}" y2="${h.y}" stroke="${HOUSE_HUE[i]}" stroke-width="1.8" stroke-dasharray="5 4" opacity=".7"/>`,
      )
      .join("");
  }

  function paintReads(): void {
    if (phase === "tour" || phase === "done") {
      reads.innerHTML = "";
      return;
    }
    const ds = [distTo(pts.A), distTo(pts.B), distTo(pts.C)];
    const eq = Math.max(...ds) - Math.min(...ds) < 1.2;
    reads.innerHTML = ds
      .map(
        (d, i) =>
          `<span class="ccl-read${eq ? " eq" : ""}" style="--hue:${HOUSE_HUE[i]}">${NAMES[i]} <b>${mins(d)}분</b></span>`,
      )
      .join("");
  }

  /** 선분 pq의 수직이등분선 밴드. */
  function bandSvg(p: Pt, qq: Pt, color: string): string {
    const mx = (p.x + qq.x) / 2;
    const my = (p.y + qq.y) / 2;
    const dx = qq.x - p.x;
    const dy = qq.y - p.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const t = 400;
    return (
      `<line x1="${mx - nx * t}" y1="${my - ny * t}" x2="${mx + nx * t}" y2="${my + ny * t}" stroke="${color}" stroke-width="9" opacity=".14"/>` +
      `<line x1="${mx - nx * t}" y1="${my - ny * t}" x2="${mx + nx * t}" y2="${my + ny * t}" stroke="${color}" stroke-width="2.2" stroke-dasharray="7 5"/>`
    );
  }

  function paintBands(): void {
    let html = "";
    if (bands >= 1) html += bandSvg(pts.A, pts.B, "#1971C2");
    if (bands >= 2) {
      html += bandSvg(pts.B, pts.C, "#0DA5C6");
      const { o } = circumOf(pts.A, pts.B, pts.C);
      html += `<circle cx="${o.x}" cy="${o.y}" r="9" fill="none" stroke="#E8A93E" stroke-width="2.6" class="ccl-pulse"/>`;
    }
    gBands.innerHTML = html;
  }

  /** 점을 선분 pq의 수직이등분선 위로 사영. */
  function projToBisector(p: Pt, qq: Pt, pt: Pt): Pt {
    const mx = (p.x + qq.x) / 2;
    const my = (p.y + qq.y) / 2;
    const dx = qq.x - p.x;
    const dy = qq.y - p.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;
    const t = (pt.x - mx) * nx + (pt.y - my) * ny;
    return { x: mx + nx * t, y: my + ny * t };
  }

  function repaint(): void {
    paintLines();
    paintPin();
    paintReads();
  }

  /* ── 국면 1 → 2 전환: 도구 버튼 ── */
  function offerTools(): void {
    helper.innerHTML =
      "감으로는 소수점까지 안 맞죠? 도구를 꺼내요. <b>수직이등분선</b> 위의 점은 어디든 선분의 양 끝에서 <b>같은 거리</b>였죠(중1의 그 성질!).";
    clear(actions);
    const b1 = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "지우네·하람이네 수직이등분선 켜기" })) as HTMLButtonElement;
    b1.addEventListener("click", () => {
      if (b1.disabled) return;
      b1.disabled = true;
      haptic(HAPTIC.select);
      bands = 1;
      paintBands();
      toast("파란 선 위라면 어디든 지우네 = 하람이네! 핀을 선 근처로 끌면 착 붙어요.");
      helper.innerHTML = "핀을 파란 선에 붙여 따라가 보세요. 두 집의 거리가 <b>늘 같게</b> 유지되죠? 남은 건 도윤이네!";
      later(() => {
        const b2 = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "하람이네·도윤이네 수직이등분선 켜기" })) as HTMLButtonElement;
        b2.addEventListener("click", () => {
          if (b2.disabled) return;
          b2.disabled = true;
          haptic(HAPTIC.select);
          bands = 2;
          paintBands();
          toast("두 선이 한 점에서 만나요! 핀을 반짝이는 교점으로 끌어 보세요.");
          helper.innerHTML = "두 선의 <b>교점</b>(주황 링)으로 핀을 끌면, 세 거리가 어떻게 될까요?";
        });
        actions.appendChild(b2);
        later(() => b2.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
      }, 2400);
    });
    actions.appendChild(b1);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function onSnapped(): void {
    if (snapped) return;
    snapped = true;
    phase = "snapped";
    haptic(HAPTIC.correct);
    chips.on("snap", "세 거리 일치!");
    toast("교점에서 세 거리가 정확히 같아요. 단 하나의 공평한 지점!");
    helper.innerHTML =
      "이 지점에서 세 집까지 거리가 전부 같아요. 그럼 이 점을 중심으로 <b>세 집을 모두 지나는 원</b>도 그릴 수 있겠죠?";
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "세 집을 지나는 원 그리기" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      const { o, r } = circumOf(pts.A, pts.B, pts.C);
      const circ = (2 * Math.PI * r).toFixed(1);
      gCircle.innerHTML =
        `<circle cx="${o.x}" cy="${o.y}" r="${r}" stroke="#1971C2" stroke-width="2.8" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" style="transition: stroke-dashoffset 1.2s var(--ease, cubic-bezier(.22,1,.36,1))"/>` +
        dot(o.x, o.y, "#1971C2", 4.5);
      const c = gCircle.querySelector("circle") as SVGCircleElement;
      later(() => { c.style.strokeDashoffset = "0"; }, 40);
      later(() => {
        haptic(HAPTIC.done);
        toast("세 집이 정확히 한 원 위에! 이 원과 중심의 정식 이름은 잠시 뒤에 배워요.");
        later(startTour, 1700);
      }, 1300);
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 3: 마을 모양 탐사 ── */
  function startTour(): void {
    phase = "tour";
    gBands.innerHTML = "";
    repaint();
    paintTourShape(0, true);
    helper.innerHTML =
      "마을 모양이 바뀌면 이 지점은 어디로 이사 갈까요? 아래 버튼으로 <b>두 마을 모두</b> 탐사해 보세요!";
    paintTourActions();
  }

  function paintTourActions(): void {
    clear(actions);
    const mk = (label: string, idx: number): HTMLButtonElement => {
      const b = el("button", { class: `ct-btn${visited.has(idx) ? "" : " hero"}`, attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        for (const x of Array.from(actions.querySelectorAll("button"))) (x as HTMLButtonElement).disabled = true;
        morphTo(idx);
      });
      return b;
    };
    if (!visited.has(1)) actions.appendChild(mk("반듯한 직각 마을로", 1));
    if (!visited.has(2)) actions.appendChild(mk("길쭉한 마을로", 2));
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function morphTo(idx: number): void {
    haptic(HAPTIC.select);
    gBadge.innerHTML = "";
    const from = { A: { ...pts.A }, B: { ...pts.B }, C: { ...pts.C } };
    const to = TOWNS[idx];
    const STEPS = 14;
    for (let i = 1; i <= STEPS; i++) {
      later(() => {
        const t = i / STEPS;
        pts = {
          A: { x: from.A.x + (to.A.x - from.A.x) * t, y: from.A.y + (to.A.y - from.A.y) * t },
          B: { x: from.B.x + (to.B.x - from.B.x) * t, y: from.B.y + (to.B.y - from.B.y) * t },
          C: { x: from.C.x + (to.C.x - from.C.x) * t, y: from.C.y + (to.C.y - from.C.y) * t },
        };
        paintMap();
        paintTourShape(idx, i === STEPS);
      }, i * 30);
    }
    later(() => {
      visited.add(idx);
      afterMorph(idx);
    }, STEPS * 30 + 350);
  }

  /** 탐사 중 삼각형 + 등거리점 + 원을 함께 그린다. */
  function paintTourShape(idx: number, final: boolean): void {
    const { A, B, C } = pts;
    const { o, r } = circumOf(A, B, C);
    gTri.innerHTML =
      `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" fill="rgba(25,113,194,.08)" stroke="#12579B" stroke-width="2" stroke-linejoin="round"/>` +
      (idx === 1 && final ? rightMark(B.x, B.y, 0, 12, "#C2255C") : "");
    gCircle.innerHTML =
      `<circle cx="${o.x}" cy="${o.y}" r="${r}" stroke="#1971C2" stroke-width="2.4" opacity=".85"/>` +
      dot(o.x, o.y, "#E8547E", 5) +
      (final && idx === 1
        ? `<line x1="${A.x}" y1="${A.y}" x2="${C.x}" y2="${C.y}" stroke="#E8A93E" stroke-width="3" stroke-dasharray="7 5"/>`
        : "");
  }

  function afterMorph(idx: number): void {
    const { o } = circumOf(pts.A, pts.B, pts.C);
    if (idx === 1) {
      gBadge.innerHTML =
        `<rect x="${o.x - 62}" y="${o.y - 40}" width="124" height="24" rx="9" fill="#FFF8E8" stroke="#E8A93E" stroke-width="1.6"/>` +
        `<text x="${o.x}" y="${o.y - 24}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#9C5A10">빗변의 한가운데!</text>`;
      toast("직각 마을에서는 등거리 지점이 가장 긴 변(빗변)의 정확히 한가운데에 앉아요!");
      haptic(HAPTIC.correct);
    } else {
      gBadge.innerHTML =
        `<rect x="${o.x - 46}" y="${o.y + 12}" width="92" height="24" rx="9" fill="#FDF0F3" stroke="#E8547E" stroke-width="1.6"/>` +
        `<text x="${o.x}" y="${o.y + 28}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#C2255C">마을 밖!</text>`;
      toast("길쭉한 마을에서는 등거리 지점이 마을(삼각형) 바깥으로 나가 버려요!");
      haptic(HAPTIC.correct);
    }
    if (visited.size >= 2) later(askSpot, 1900);
    else later(paintTourActions, 1500);
  }

  function askSpot(): void {
    clear(actions);
    qline.innerHTML = "탐사 결과! <b>반듯한 직각 마을</b>에서 등거리 지점은 어디에 있었나요?";
    const items = [
      {
        t: "가장 긴 변(빗변)의 정확히 한가운데요",
        good: true,
        fb: "정확해요! 직각삼각형에서는 등거리 지점이 늘 빗변의 중점이에요. 빗변의 절반이 곧 원의 반지름이 되는, 시험이 사랑하는 성질이죠.",
      },
      {
        t: "삼각형 안쪽 깊숙한 곳이요",
        good: false,
        fb: "안쪽은 처음 마을(세 각이 모두 뾰족)의 이야기예요. 직각 마을에서는 정확히 변 위, 그것도 빗변의 한가운데였죠. 마을 모양 따라 지점이 이사를 다녀요!",
      },
      {
        t: "마을 바깥이요",
        good: false,
        fb: "바깥으로 나간 건 길쭉한 마을(한 각이 둔각)이었어요. 직각 마을에서는 딱 변 위, 빗변의 한가운데! 두 결과를 구분해 두면 시험에서 안 헷갈려요.",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (done) return;
        done = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          qline.innerHTML = "";
          clear(ctl);
          phase = "done";
          chips.on("spot", "위치까지 정복");
          haptic(HAPTIC.done);
          helper.innerHTML =
            "감 대신 <b>수직이등분선 두 개의 교점</b>. 세 꼭짓점에서 같은 거리인 단 하나의 점과 그 원, 정식 이름을 배우러 가요!";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "이름 붙이러 가기");
        }, 2300);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 핀 드래그 ── */
  function toLocal(e: PointerEvent): Pt {
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VB_W,
      y: ((e.clientY - rect.top) / rect.height) * VB_H,
    };
  }

  function dragTo(e: PointerEvent): void {
    if (!dragging || phase === "snapped" || phase === "tour" || phase === "done") return;
    const p = toLocal(e);
    const prev = { ...P };
    let next = { x: Math.max(16, Math.min(VB_W - 16, p.x)), y: Math.max(24, Math.min(VB_H - 12, p.y)) };
    // 밴드 스냅: 켜진 수직이등분선 근처(12px)면 선 위로 사영
    if (bands >= 1) {
      const pr1 = projToBisector(pts.A, pts.B, next);
      if (Math.hypot(pr1.x - next.x, pr1.y - next.y) < 12) next = pr1;
    }
    if (bands >= 2) {
      const pr2 = projToBisector(pts.B, pts.C, next);
      if (Math.hypot(pr2.x - next.x, pr2.y - next.y) < 12) next = pr2;
      const { o } = circumOf(pts.A, pts.B, pts.C);
      if (Math.hypot(o.x - next.x, o.y - next.y) < 15) {
        P = o;
        repaint();
        dragging = false;
        onSnapped();
        return;
      }
    }
    P = next;
    dragDist += Math.hypot(P.x - prev.x, P.y - prev.y);
    repaint();
    // 국면 1 목표: 충분히 헤매 보기(누적 260px) → 도구 개방
    if (phase === "hunt" && dragDist > 260) {
      phase = "band";
      chips.on("hunt", "어렵죠?");
      haptic(HAPTIC.correct);
      later(offerTools, 350);
    }
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase === "snapped" || phase === "tour" || phase === "done") return;
    const p = toLocal(e);
    if (Math.hypot(p.x - P.x, p.y - P.y) < 34) {
      dragging = true;
      capturePointer(svg, e.pointerId);
      dragTo(e);
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) dragTo(e);
  });
  const drop = (): void => {
    dragging = false;
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintMap();
  repaint();
  api.setCTA("위치 탐사까지 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
