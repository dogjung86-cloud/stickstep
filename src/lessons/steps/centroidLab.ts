// centroidLab, 균형점 수색대(중2 수학 Ⅴ L9 기함, 책 208~210쪽). circumLab의 "좌절 → 도구" 문법 계승.
// ① 감 드래그: 핀을 놓으면 판이 진짜 균형점 쪽으로 기우뚱(좌절 설계, 성공 반경 10px)
// ② 도구: 꼭짓점에서 맞은편 변 한가운데로 선 긋기 → 두 선의 교점에 핀 스냅 → 수평! → 셋째 선도 같은 점
// ③ 측정: A의 선이 교점에서 2:1로 나뉨 → 꼭짓점 A를 끌어 모양을 바꿔도 유지.
// '무게중심'·'중선'이라는 이름은 이 랩에서 쓰지 않는다(다음 concept가 명명) — "균형점", "꼭짓점 선"으로.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .ctd-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { dot, ptLabel, tickMark, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Pt = { x: number; y: number };

const mid = (p: Pt, q: Pt): Pt => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
const dist = (p: Pt, q: Pt): number => Math.hypot(p.x - q.x, p.y - q.y);

export const centroidLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "hunt", label: "감으로 수색", sub: "핀 놓아 보기" },
    { id: "tool", label: "선 세 개, 점 하나", sub: "잠김" },
    { id: "ratio", label: "언제나 2:1", sub: "잠김" },
  ]);

  const board = mboard(540);
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 272" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs><linearGradient id="ctd-face" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#F8AFC9"/><stop offset=".55" stop-color="#E86A9C"/><stop offset="1" stop-color="#C2255C"/>` +
    `</linearGradient>` +
    `<radialGradient id="ctd-pinb" cx=".36" cy=".3" r=".95">` +
    `<stop offset="0" stop-color="#F49CBE"/><stop offset="1" stop-color="#C2255C"/>` +
    `</radialGradient></defs>` +
    `<g class="ctd-plate"></g><g class="ctd-lines"></g><g class="ctd-marks"></g>` +
    `<g class="ctd-measure"></g><g class="ctd-pin"></g><g class="ctd-badge"></g>` +
    `</svg>`;
  const readout = el("div", { class: "ctd-read", attrs: { "aria-live": "polite" } });
  const actions = el("div", { class: "lk-actions" });
  board.append(svgWrap, readout, actions);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "삼각형 판이에요. 손끝(핀)을 끌어 판이 <b>수평</b>이 될 지점에 놓아 보세요!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gPlate = svg.querySelector(".ctd-plate") as SVGGElement;
  const gLines = svg.querySelector(".ctd-lines") as SVGGElement;
  const gMarks = svg.querySelector(".ctd-marks") as SVGGElement;
  const gMeasure = svg.querySelector(".ctd-measure") as SVGGElement;
  const gPin = svg.querySelector(".ctd-pin") as SVGGElement;
  const gBadge = svg.querySelector(".ctd-badge") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // 판 꼭짓점(③ 국면에서 A가 움직인다)
  const V: Record<"A" | "B" | "C", Pt> = { A: { x: 168, y: 44 }, B: { x: 50, y: 232 }, C: { x: 298, y: 214 } };
  const G = (): Pt => ({ x: (V.A.x + V.B.x + V.C.x) / 3, y: (V.A.y + V.B.y + V.C.y) / 3 });

  let phase: "hunt" | "tool" | "ratio" | "done" = "hunt";
  let pin: Pt = { x: 120, y: 150 };
  let tries = 0;
  const drawn: ("A" | "B" | "C")[] = [];
  let moves = 0; // ③ 국면 모양 변경 횟수
  let dragging = false;

  const svgPt = (e: PointerEvent): Pt => {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 340, y: ((e.clientY - r.top) / r.height) * 272 };
  };

  /** 판(삼각형) 그리기 — tilt는 핀 기준 회전 각도(도). */
  function paintPlate(tilt = 0): void {
    const hl = mid(V.A, V.B);
    gPlate.innerHTML =
      `<g class="ctd-tilt" style="transform-box: view-box; transform-origin:${pin.x}px ${pin.y}px; transition: transform .5s var(--spring, cubic-bezier(.34,1.35,.5,1)); transform: rotate(${tilt}deg)${tilt ? " translateY(3px)" : ""}">` +
      `<path d="M${V.A.x} ${V.A.y} L${V.B.x} ${V.B.y} L${V.C.x} ${V.C.y} Z" fill="url(#ctd-face)" stroke="#8C1843" stroke-width="2.6" stroke-linejoin="round"/>` +
      `<ellipse cx="${hl.x - 6}" cy="${hl.y - 6}" rx="16" ry="6" fill="#fff" opacity=".26" transform="rotate(-32 ${hl.x} ${hl.y})"/>` +
      `</g>` +
      dot(V.A.x, V.A.y, "#8C1843") + dot(V.B.x, V.B.y, "#8C1843") + dot(V.C.x, V.C.y, "#8C1843") +
      ptLabel(V.A.x, V.A.y, "A", 0, -10) + ptLabel(V.B.x, V.B.y, "B", -11, 12) + ptLabel(V.C.x, V.C.y, "C", 11, 12);
  }

  function paintPin(level = false): void {
    gPin.innerHTML =
      `<g style="cursor: grab">` +
      `<circle cx="${pin.x}" cy="${pin.y}" r="17" fill="rgba(194,37,92,.10)"/>` +
      `<circle cx="${pin.x}" cy="${pin.y}" r="8.5" fill="url(#ctd-pinb)" stroke="#7A1338" stroke-width="2"/>` +
      `<circle cx="${pin.x - 2.4}" cy="${pin.y - 2.6}" r="2.4" fill="#fff" opacity=".55"/>` +
      `</g>` +
      (level
        ? `<g><rect x="${pin.x - 30}" y="${pin.y - 36}" width="60" height="19" rx="9" fill="#F0FBF5" stroke="#04B45F" stroke-width="1.6"/>` +
          `<text x="${pin.x}" y="${pin.y - 23}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#1E7A31">수평!</text></g>`
        : "");
  }

  /** 기우뚱 연출: 핀에서 균형점 쪽이 내려앉는 방향으로 판을 살짝 회전. */
  function tiltPlate(): void {
    const g = G();
    const sign = g.x >= pin.x ? 1 : -1;
    const mag = Math.min(8, 3 + dist(pin, g) / 26);
    paintPlate(sign * mag);
    haptic(HAPTIC.wrong);
    later(() => paintPlate(0), 700);
  }

  function updateReadout(): void {
    if (phase === "hunt") {
      readout.innerHTML = `<span class="ctd-try">시도 <b>${tries}</b>번</span><span class="ctd-hint">판이 기우는 쪽에 무게가 남아 있어요</span>`;
    }
  }

  /* ── ① 감 수색 ── */
  function onPinDrop(): void {
    if (phase !== "hunt") return;
    tries += 1;
    updateReadout();
    const g = G();
    if (dist(pin, g) < 10) {
      pin = { ...g };
      paintPlate(0);
      paintPin(true);
      haptic(HAPTIC.correct);
      toast("우연히 찾았어요! 그런데 매번 감으로 찾을 수는 없겠죠? 정확한 방법이 필요해요.");
      later(startTool, 1600);
      return;
    }
    tiltPlate();
    paintPin(false);
    if (tries === 1) toast("기우뚱! 무게가 한쪽으로 쏠렸어요. 다른 곳도 시험해 봐요.");
    if (tries >= 3) {
      toast("감으로는 어렵죠? 도구를 꺼낼 시간이에요.");
      later(startTool, 1400);
    }
  }

  function startTool(): void {
    if (phase !== "hunt") return;
    phase = "tool";
    chips.on("hunt", `${tries}번 수색`);
    readout.innerHTML = "";
    helper.innerHTML =
      "비법: <b>꼭짓점</b>에서 <b>맞은편 변의 한가운데</b>로 선을 그어요. 선 두 개가 만나는 곳을 노려 봐요!";
    paintActions();
  }

  /* ── ② 도구: 꼭짓점 선 긋기 ── */
  function paintActions(): void {
    clear(actions);
    if (phase !== "tool") return;
    (["A", "B", "C"] as const).forEach((k) => {
      if (drawn.includes(k)) return;
      const b = el(
        "button",
        { class: "ct-btn hero", attrs: { type: "button" } },
        el("span", { text: `${k}에서 긋기` }),
      ) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        b.disabled = true;
        drawMedian(k);
      });
      actions.appendChild(b);
    });
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function medianOf(k: "A" | "B" | "C"): { from: Pt; to: Pt } {
    if (k === "A") return { from: V.A, to: mid(V.B, V.C) };
    if (k === "B") return { from: V.B, to: mid(V.A, V.C) };
    return { from: V.C, to: mid(V.A, V.B) };
  }

  function medianSvg(k: "A" | "B" | "C", animate: boolean): string {
    const { from, to } = medianOf(k);
    const len = dist(from, to);
    const other: Record<"A" | "B" | "C", [Pt, Pt]> = { A: [V.B, V.C], B: [V.A, V.C], C: [V.A, V.B] };
    const [p, q] = other[k];
    return (
      `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#7A1338" stroke-width="2.4" stroke-dasharray="${len}"` +
      (animate
        ? ` stroke-dashoffset="${len}" style="transition: stroke-dashoffset .7s var(--ease, cubic-bezier(.22,1,.36,1))"`
        : ` stroke-dashoffset="0"`) +
      `/>` +
      tickMark(p.x, p.y, to.x, to.y, 1, "#0DA5C6") +
      tickMark(to.x, to.y, q.x, q.y, 1, "#0DA5C6") +
      dot(to.x, to.y, "#0DA5C6", 3.4)
    );
  }

  function drawMedian(k: "A" | "B" | "C"): void {
    haptic(HAPTIC.select);
    drawn.push(k);
    const gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gEl.innerHTML = medianSvg(k, true);
    gLines.appendChild(gEl);
    later(() => {
      const line = gEl.querySelector("line") as SVGLineElement;
      line.style.strokeDashoffset = "0";
    }, 30);
    later(() => {
      if (drawn.length === 2) {
        const g = G();
        gMarks.innerHTML = `<circle cx="${g.x}" cy="${g.y}" r="7" fill="none" stroke="#04B45F" stroke-width="2.6" class="ctd-pulse"/>`;
        pin = { ...g };
        paintPlate(0);
        paintPin(true);
        haptic(HAPTIC.correct);
        toast("두 선이 만나는 점에 핀을 옮기니 딱 수평이에요!");
        helper.innerHTML =
          "수평 성공! 그런데 궁금하죠. <b>세 번째 꼭짓점</b>에서 그은 선은 이 점을 빗나갈까요? 마저 그어 봐요.";
        paintActions();
      } else if (drawn.length === 3) {
        haptic(HAPTIC.done);
        toast("세 번째 선도 정확히 같은 점을 지나요. 세 선은 늘 한 점에서 만나요!");
        chips.on("tool", "교점 = 균형점");
        later(startRatio, 1700);
      }
    }, 800);
  }

  /* ── ③ 2:1 측정 + 모양 변형 ── */
  function startRatio(): void {
    phase = "ratio";
    clear(actions);
    paintMeasure();
    helper.innerHTML =
      "A에서 그은 선이 교점에서 두 토막(주황 2 : 하늘 1)으로 나뉘어요. 이제 <b>꼭짓점 A를 끌어</b> 모양을 바꿔도 2:1이 유지되는지 확인해 봐요!";
    later(() => helper.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function paintMeasure(): void {
    const g = G();
    const { from, to } = medianOf("A");
    gMeasure.innerHTML =
      `<line x1="${from.x}" y1="${from.y}" x2="${g.x}" y2="${g.y}" stroke="#F08C00" stroke-width="5" stroke-linecap="round" opacity=".85"/>` +
      `<line x1="${g.x}" y1="${g.y}" x2="${to.x}" y2="${to.y}" stroke="#0DA5C6" stroke-width="5" stroke-linecap="round" opacity=".85"/>` +
      `<rect x="${(from.x + g.x) / 2 - 13}" y="${(from.y + g.y) / 2 - 11}" width="26" height="18" rx="7" fill="#FFF4E3" stroke="#F08C00" stroke-width="1.4"/>` +
      `<text x="${(from.x + g.x) / 2}" y="${(from.y + g.y) / 2 + 3}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#9C5A10">2</text>` +
      `<rect x="${(g.x + to.x) / 2 - 13}" y="${(g.y + to.y) / 2 - 11}" width="26" height="18" rx="7" fill="#E9FAFF" stroke="#0DA5C6" stroke-width="1.4"/>` +
      `<text x="${(g.x + to.x) / 2}" y="${(g.y + to.y) / 2 + 3}" text-anchor="middle" font-size="12.5" font-weight="900" fill="#0B7285">1</text>`;
    readout.innerHTML =
      `<span class="ctd-ratio">꼭짓점~교점 : 교점~한가운데 = <b>2 : 1</b></span>` +
      (phase === "ratio" && moves < 2 ? `<span class="ctd-hint">A를 끌어 보세요 (${moves}/2)</span>` : "");
  }

  /** ③ 국면 전체 다시 그리기(A 드래그 중). */
  function repaintAll(): void {
    paintPlate(0);
    gLines.innerHTML = "";
    (["A", "B", "C"] as const).forEach((k) => {
      const gEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gEl.innerHTML = medianSvg(k, false);
      gLines.appendChild(gEl);
    });
    const g = G();
    pin = { ...g };
    gMarks.innerHTML = `<circle cx="${g.x}" cy="${g.y}" r="7" fill="none" stroke="#04B45F" stroke-width="2.6"/>`;
    paintPin(true);
    paintMeasure();
  }

  function finish(): void {
    phase = "done";
    chips.on("ratio", "모양이 변해도");
    haptic(HAPTIC.done);
    gBadge.innerHTML =
      `<rect x="56" y="4" width="228" height="30" rx="10" fill="#F0FBF5" stroke="#04B45F" stroke-width="2"/>` +
      `<text x="170" y="24" text-anchor="middle" font-size="12.5" font-weight="900" fill="#1E7A31">균형점은 늘 꼭짓점에서 2, 변에서 1!</text>`;
    helper.innerHTML =
      "어떤 모양이어도 세 선은 <b>한 점</b>에서 만나고, 그 점은 각 선을 <b>2:1</b>로 나눠요. 이 점과 선의 정식 이름을 배우러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "이름 붙이러 가기");
  }

  /* ── 포인터: 핀 드래그(①) / A 드래그(③) ── */
  svg.addEventListener("pointerdown", (e: PointerEvent) => {
    const p = svgPt(e);
    if (phase === "hunt" && dist(p, pin) < 32) {
      dragging = true;
      capturePointer(svg, e.pointerId);
      e.preventDefault();
      return;
    }
    if (phase === "ratio" && dist(p, V.A) < 32) {
      dragging = true;
      capturePointer(svg, e.pointerId);
      e.preventDefault();
    }
  });
  svg.addEventListener("pointermove", (e: PointerEvent) => {
    if (!dragging) return;
    const p = svgPt(e);
    if (phase === "hunt") {
      pin = { x: Math.max(24, Math.min(316, p.x)), y: Math.max(24, Math.min(250, p.y)) };
      paintPin(false);
    } else if (phase === "ratio") {
      V.A = { x: Math.max(96, Math.min(252, p.x)), y: Math.max(34, Math.min(118, p.y)) };
      repaintAll();
    }
  });
  svg.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    if (phase === "hunt") {
      onPinDrop();
    } else if (phase === "ratio") {
      moves += 1;
      haptic(HAPTIC.tap);
      paintMeasure();
      if (moves === 1) toast("모양이 바뀌어도 2:1 그대로!");
      if (moves >= 2) finish();
    }
  });

  paintPlate(0);
  paintPin(false);
  updateReadout();
  api.setCTA("균형의 비밀을 밝히면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
