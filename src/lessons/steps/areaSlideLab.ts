// areaSlideLab, 꼭짓점 미끄럼틀(중2 수학 Ⅳ L10, 평행선과 넓이. 책 179~187쪽).
// 국면 1(slide): 평행한 두 레일 사이에 밑변 BC(8칸)를 고정하고 꼭짓점 A를 위 레일에서
//   좌우로 끈다. 변 AB·AC 길이는 실시간으로 변하는데 넓이 리드아웃(8×7÷2=28칸)만
//   꿈쩍 않는 대비가 발견 장치. 좌우 누적 240px 이상 끌면 달성.
// 국면 2(why): "왜 안 변할까" 판정(mq6), 정답은 밑변 고정+평행 레일=높이 일정.
// 국면 3(fence): 훅(bentfence) 회수 미션. ㄱ자 경계(A-D-C)의 텃밭 ABCD에서 대각선 AC를
//   긋고, D를 지나 AC에 평행한 레일을 따라 D를 BC의 연장선 위 E까지 미끄러뜨리면
//   △ACD=△ACE(같은 밑변 AC·같은 높이)라 사각형이 삼각형 ABE로 펴진다. 넓이는 신발끈
//   공식으로 실시간 계산해 처음부터 끝까지 49칸 그대로임을 숫자로 보여 준다.
// 좌표는 전부 20px 모눈 위 계산값(눈대중 금지): 레일 y=100/240(높이 7칸),
//   B(80,240)·C(240,240)(밑변 8칸, 스펙 y=92/232를 모눈선 위로 정렬해 칸 수 불변),
//   밭 A(80,100)·B(60,240)·C(240,240)·D(180,100), 레일 방향 = AC 벡터 (160,140),
//   E = D + 1·(160,140) = (340,240)이 정확히 BC의 연장선(y=240) 위에 떨어진다(t=1).
//   D가 레일 위에 있는 한 신발끈 합의 D 항이 소거돼 넓이가 대수적으로 불변(주석 검산 완료).
// rAF 금지: CSS 트랜지션 + setTimeout 체인(timers Set). E 유령 마커 펄스만 SMIL.
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, dot, ptLabel, rightMark, arrowHead, angleOf, lineSvg, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Pt {
  x: number;
  y: number;
}

const VW = 360;
const VH = 300;
const U = 20; // 모눈 1칸(px)
const CB = "#1971C2"; // 단원 액센트(블루프린트 코발트)
const CB_TINT = "rgba(25,113,194,.13)";

/* 국면 1~2: 레일 2개 + 밑변 고정 삼각형 */
const RT = 100; // 위 레일 l
const RB = 240; // 아래 레일 m(= 밑변이 놓인 직선)
const B1: Pt = { x: 80, y: RB };
const C1: Pt = { x: 240, y: RB };
const AX0 = 160;
const AXMIN = 26;
const AXMAX = 334;

/* 국면 3: 텃밭 ABCD와 계산된 E */
const FA: Pt = { x: 80, y: 100 };
const FB: Pt = { x: 60, y: 240 };
const FC: Pt = { x: 240, y: 240 };
const FD0: Pt = { x: 180, y: 100 };
const ACV: Pt = { x: FC.x - FA.x, y: FC.y - FA.y }; // (160,140): 레일 방향
const L2 = ACV.x * ACV.x + ACV.y * ACV.y; // 45200
const FE: Pt = { x: FD0.x + ACV.x, y: FD0.y + ACV.y }; // (340,240): (RB−D.y)/ACV.y = 1이라 연장선 위

/** 신발끈 공식 → 모눈 칸 수. */
function cellsOf(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2 / (U * U);
}

/** 칸 수 표기: 정수는 정수로, 아니면 소수 1자리. */
const cellFmt = (v: number): string => {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

export const areaSlideLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "slide", label: "레일 슬라이드", sub: "A를 끌어요" },
    { id: "why", label: "이유 판정", sub: "잠김" },
    { id: "fence", label: "경계 펴기", sub: "잠김" },
  ]);

  const board = mboard(500);
  const readout = el("div", { class: "asl-read", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  let grid = "";
  for (let x = U; x < VW; x += U)
    grid += `<line x1="${x}" y1="0" x2="${x}" y2="${VH}" stroke="#E2E9F2" stroke-width="1"/>`;
  for (let y = U; y < VH; y += U)
    grid += `<line x1="0" y1="${y}" x2="${VW}" y2="${y}" stroke="#E2E9F2" stroke-width="1"/>`;
  svgWrap.innerHTML =
    `<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="평행선과 넓이 실험 무대">` +
    `<g class="asl-gridg">${grid}</g>` +
    `<g class="asl-base"></g>` +
    `<g class="asl-fillg"></g>` +
    `<g class="asl-con"></g>` +
    `<g class="asl-top"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q asl-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(readout, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "꼭짓점 A를 잡고 <b>레일을 따라 좌우로</b> 끌어 보세요. 넓이 숫자를 지켜봐요!",
  });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 사용자 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gBase = svg.querySelector(".asl-base") as SVGGElement;
  const gFill = svg.querySelector(".asl-fillg") as SVGGElement;
  const gCon = svg.querySelector(".asl-con") as SVGGElement;
  const gTop = svg.querySelector(".asl-top") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "slide" | "why" | "fence" | "done" = "slide";
  let ax = AX0; // A의 x(위 레일 위)
  let acc = 0; // A 누적 이동(px)
  let aCol = Math.round(AX0 / U);
  let started = false; // 첫 드래그(체브론 제거)
  let peakToast = false;
  let dt = 0; // D의 레일 파라미터 t(0=출발, 1=E)
  let dCol = 0;
  let hasAC = false;
  let railOn = false;
  let dStarted = false;
  let dToast = false;
  let dragKind: "A" | "D" | null = null;

  const aAC = angleOf(FA.x, FA.y, FC.x, FC.y); // AC 방향(수학 각도)
  const posD = (t: number): Pt => ({ x: FD0.x + ACV.x * t, y: FD0.y + ACV.y * t });

  function popRead(): void {
    readout.classList.remove("mq6-pop");
    void readout.offsetWidth;
    readout.classList.add("mq6-pop");
  }

  /** 페이드 인 g(스르륵 등장). dy를 주면 살짝 내려앉는다. rAF 없이 타이머로. */
  function mkG(html: string, dy = 0): void {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = html;
    g.style.opacity = "0";
    if (dy) g.style.transform = `translateY(${dy}px)`;
    g.style.transition = "opacity .55s var(--ease-out), transform .55s var(--ease-out)";
    gCon.appendChild(g);
    later(() => {
      g.style.opacity = "1";
      g.style.transform = "translateY(0)";
    }, 30);
  }

  /* ══════════ 국면 1~2: 레일 슬라이드 ══════════ */

  function paintBase1(): void {
    gBase.innerHTML =
      lineSvg(14, RT, 346, RT, "#94A3B8", 2.2) +
      lineSvg(14, RB, 346, RB, "#94A3B8", 2.2) +
      arrowHead(312, RT, 0, "#94A3B8", 6.5) +
      arrowHead(312, RB, 0, "#94A3B8", 6.5) +
      `<text x="350" y="${RT + 4}" font-size="12.5" font-weight="800" font-style="italic" fill="#64748B">l</text>` +
      `<text x="350" y="${RB + 4}" font-size="12.5" font-weight="800" font-style="italic" fill="#64748B">m</text>`;
  }

  /** 변 길이 라벨(삼각형 바깥쪽, 변과 나란히 눕힘), "변은 변하는데 넓이는 그대로"의 대비 장치.
   *  가로쓰기 고정이면 비스듬한 변을 가로질러 안 읽힌다(실사용 피드백) — 변 방향 회전이 정답. */
  function edgeLen(P: Pt, Q: Pt, other: Pt, name: string): string {
    const mx = (P.x + Q.x) / 2;
    const my = (P.y + Q.y) / 2;
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const L = Math.hypot(dx, dy) || 1;
    let nx = (-dy / L) * 14;
    let ny = (dx / L) * 14;
    if (nx * (mx - other.x) + ny * (my - other.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    let rot = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (rot > 90) rot -= 180;
    if (rot < -90) rot += 180;
    const tx = (mx + nx).toFixed(1);
    const ty = (my + ny + 4).toFixed(1);
    return `<text transform="rotate(${rot.toFixed(1)} ${tx} ${ty})" x="${tx}" y="${ty}" text-anchor="middle" font-size="12" font-weight="700" fill="#7B8FA6">${name} ${cellFmt(L / U)}칸</text>`;
  }

  function paintTri(): void {
    gFill.innerHTML = `<path d="M${ax.toFixed(1)} ${RT} L${B1.x} ${B1.y} L${C1.x} ${C1.y} Z" fill="${CB_TINT}" stroke="${CB}" stroke-width="2.8" stroke-linejoin="round"/>`;
    const A: Pt = { x: ax, y: RT };
    const flipLbl = ax > 292; // 높이 라벨 좌우 반전(오른쪽 끝에서 잘림 방지)
    gTop.innerHTML =
      lineSvg(ax, RT, ax, RB, GEO.hlB, 2.2, "5 4") +
      rightMark(ax, RB, 0, 9, GEO.hlB) +
      `<text x="${(flipLbl ? ax - 11 : ax + 11).toFixed(1)}" y="175" text-anchor="${flipLbl ? "end" : "start"}" font-size="13" font-weight="900" fill="#0B7285" stroke="#FFFFFF" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">높이 7칸</text>` +
      `<text x="${(B1.x + C1.x) / 2}" y="${RB + 20}" text-anchor="middle" font-size="13" font-weight="900" fill="#B87708">밑변 8칸</text>` +
      edgeLen(A, B1, C1, "AB") +
      edgeLen(A, C1, B1, "AC") +
      dot(B1.x, B1.y) +
      dot(C1.x, C1.y) +
      ptLabel(B1.x, B1.y, "B", 0, 19) +
      ptLabel(C1.x, C1.y, "C", 0, 19) +
      (started
        ? ""
        : arrowHead(ax - 24, RT, 180, "#B6C2D2", 6) + arrowHead(ax + 24, RT, 0, "#B6C2D2", 6)) +
      `<g><circle cx="${ax.toFixed(1)}" cy="${RT}" r="13" fill="rgba(25,113,194,.15)"/>` +
      `<circle cx="${ax.toFixed(1)}" cy="${RT}" r="7" fill="#FFFFFF" stroke="${CB}" stroke-width="2.8"/></g>` +
      ptLabel(ax, RT, "A", 0, -17, CB);
  }

  function moveA(p: Pt): void {
    if (phase !== "slide" && phase !== "why") return;
    const x = clamp(p.x, AXMIN, AXMAX);
    if (Math.abs(x - ax) < 0.5) return;
    acc += Math.abs(x - ax);
    ax = x;
    const col = Math.round(ax / U);
    if (col !== aCol) {
      aCol = col;
      haptic(HAPTIC.tap);
    }
    paintTri();
    if (!peakToast && (ax < B1.x - 12 || ax > C1.x + 12)) {
      peakToast = true;
      toast("A가 밑변 바깥까지 나가도 높이는 두 레일 사이 거리, 그대로 7칸이에요!");
    }
    if (phase === "slide" && acc >= 240) goalSlide();
  }

  function goalSlide(): void {
    phase = "why";
    chips.on("slide", "넓이 그대로!");
    haptic(HAPTIC.correct);
    toast("모양은 완전히 달라졌는데 넓이는 그대로 28칸!");
    helper.innerHTML =
      "밑변 8칸과 높이 7칸이 꿈쩍도 안 했어요. 아래 질문에서 <b>이유를 골라</b> 보세요!";
    later(askWhy, 1400);
  }

  function askWhy(): void {
    qline.innerHTML = "A가 어디로 가도 왜 넓이는 <b>항상 28칸</b>일까요?";
    const items: { t: string; good: boolean; fb: string }[] = [
      {
        t: "삼각형의 세 변의 길이가 변하지 않아서요",
        good: false,
        fb: "변의 길이는 계속 변하고 있었어요! AB·AC 숫자를 보세요. 넓이를 지킨 건 변이 아니라 밑변과 높이예요. 평행한 레일 위에서는 높이가 늘 같죠.",
      },
      {
        t: "밑변은 그대로고, 레일이 평행해서 높이도 그대로니까요",
        good: true,
        fb: "정답! 밑변 BC는 고정, 높이는 평행한 두 레일 사이 거리라 A가 어디에 있어도 같아요. 밑변×높이÷2가 꿈쩍 안 하죠.",
      },
      {
        t: "우연히 그 자리들만 넓이가 같은 거예요",
        good: false,
        fb: "레일 위 어느 점이든 예외가 없었죠? 평행선 사이의 거리(높이)는 어디서 재도 일정하기 때문이에요. 우연이 아니라 평행의 성질!",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let picked = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (picked) return;
        picked = true;
        haptic(it.good ? HAPTIC.correct : HAPTIC.wrong);
        for (const z of btns) {
          z.bt.disabled = true;
          if (z.good) z.bt.classList.add("ok");
        }
        if (!it.good) bt.classList.add("no");
        toast(it.fb);
        later(() => {
          chips.on("why", "높이가 같아서!");
          qline.innerHTML = "";
          clear(ctl);
          later(buildFence, 500);
        }, 2300);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ══════════ 국면 3: 경계 펴기 미션 ══════════ */

  const acStr =
    `<line x1="${FA.x}" y1="${FA.y}" x2="${FC.x}" y2="${FC.y}" stroke="${GEO.hlA}" stroke-width="2.4" stroke-dasharray="7 5" stroke-linecap="round"/>` +
    arrowHead((FA.x + FC.x) / 2, (FA.y + FC.y) / 2, aAC, GEO.hlA, 7);

  /** 레일 + (진행 중일 때만) BC 연장선·유령 E 마커. */
  function railStr(withGhost: boolean): string {
    const p0 = posD(-0.3);
    const p1 = posD(1.05);
    const m = posD(0.52);
    let str =
      lineSvg(p0.x, p0.y, p1.x, p1.y, "#94A3B8", 2.2) +
      arrowHead(m.x, m.y, aAC, GEO.hlA, 7) +
      `<text x="150" y="48" text-anchor="middle" font-size="12.5" font-weight="700" fill="#64748B">AC와 평행한 레일</text>`;
    if (withGhost) {
      str +=
        `<line x1="${FC.x}" y1="${FC.y}" x2="352" y2="${FC.y}" stroke="#94A3B8" stroke-width="1.8" stroke-dasharray="4 4"/>` +
        `<text x="292" y="259" text-anchor="middle" font-size="12" font-weight="700" fill="#7B8FA6">BC의 연장선</text>` +
        `<g><circle cx="${FE.x}" cy="${FE.y}" r="8.5" fill="rgba(18,184,134,.10)" stroke="#12B886" stroke-width="2" stroke-dasharray="4 3">` +
        `<animate attributeName="stroke-opacity" values="1;.3;1" dur="1.5s" repeatCount="indefinite"/></circle>` +
        `<text x="${FE.x}" y="${FE.y - 14}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#0CA678">E</text></g>`;
    }
    return str;
  }

  function paintFence(): void {
    if (phase === "done") {
      gFill.innerHTML =
        `<path d="M${FA.x} ${FA.y} L${FB.x} ${FB.y} L${FE.x} ${FE.y} Z" fill="${CB_TINT}" stroke="${CB}" stroke-width="2.8" stroke-linejoin="round"/>` +
        `<path d="M${FA.x} ${FA.y} L${FC.x} ${FC.y} L${FE.x} ${FE.y} Z" fill="rgba(240,140,0,.15)"/>`;
      gTop.innerHTML =
        `<g opacity=".3"><path d="M${FA.x} ${FA.y} L${FD0.x} ${FD0.y} L${FC.x} ${FC.y}" stroke="${GEO.hlC}" stroke-width="2.6" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>` +
        ptLabel(FD0.x, FD0.y, "D", 0, -14, GEO.hlC) +
        `</g>` +
        `<path d="M${FA.x} ${FA.y} L${FE.x} ${FE.y}" stroke="${GEO.hlC}" stroke-width="3.6" stroke-linecap="round"/>` +
        lineSvg(FA.x, FA.y, FA.x, RB, GEO.hlB, 2.2, "5 4") +
        rightMark(FA.x, RB, 0, 9, GEO.hlB) +
        `<text x="${FA.x + 11}" y="175" font-size="13" font-weight="900" fill="#0B7285" stroke="#FFFFFF" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round">높이 7칸</text>` +
        `<text x="150" y="${RB + 20}" text-anchor="middle" font-size="13" font-weight="900" fill="#B87708">밑변 14칸</text>` +
        dot(FA.x, FA.y) +
        dot(FB.x, FB.y) +
        dot(FC.x, FC.y) +
        dot(FE.x, FE.y, "#0CA678", 4.5) +
        ptLabel(FA.x, FA.y, "A", 0, -16) +
        ptLabel(FB.x, FB.y, "B", 0, 19) +
        ptLabel(FC.x, FC.y, "C", 0, 19) +
        ptLabel(FE.x, FE.y, "E", 0, 19, "#0CA678");
      return;
    }
    const D = posD(dt);
    const dx = D.x.toFixed(1);
    const dy = D.y.toFixed(1);
    gFill.innerHTML =
      `<path d="M${FA.x} ${FA.y} L${FB.x} ${FB.y} L${FC.x} ${FC.y} L${dx} ${dy} Z" fill="${CB_TINT}" stroke="${CB}" stroke-width="2.4" stroke-linejoin="round"/>` +
      (hasAC
        ? `<path d="M${FA.x} ${FA.y} L${FC.x} ${FC.y} L${dx} ${dy} Z" fill="rgba(240,140,0,.15)"/>`
        : "");
    const chevA = posD(dt + 0.13);
    const chevB = posD(dt - 0.13);
    gTop.innerHTML =
      `<path d="M${FA.x} ${FA.y} L${dx} ${dy} L${FC.x} ${FC.y}" stroke="${GEO.hlC}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>` +
      dot(FA.x, FA.y) +
      dot(FB.x, FB.y) +
      dot(FC.x, FC.y) +
      ptLabel(FA.x, FA.y, "A", 0, -16) +
      ptLabel(FB.x, FB.y, "B", 0, 19) +
      ptLabel(FC.x, FC.y, "C", 0, 19) +
      (railOn && !dStarted
        ? arrowHead(chevA.x, chevA.y, aAC, "#B6C2D2", 6) + arrowHead(chevB.x, chevB.y, aAC + 180, "#B6C2D2", 6)
        : "") +
      `<g><circle cx="${dx}" cy="${dy}" r="13" fill="rgba(232,84,126,${railOn ? ".18" : ".10"})"/>` +
      `<circle cx="${dx}" cy="${dy}" r="7" fill="#FFFFFF" stroke="${GEO.hlC}" stroke-width="2.8"/></g>` +
      ptLabel(D.x, D.y, "D", 13, -11, GEO.hlC);
    readout.innerHTML = `밭 넓이 = <b>${cellFmt(cellsOf([FA, FB, FC, D]))}칸</b>`;
  }

  function buildFence(): void {
    phase = "fence";
    dt = 0;
    dCol = 0;
    hasAC = false;
    railOn = false;
    dStarted = false;
    dToast = false;
    dragKind = null;
    gBase.innerHTML = "";
    gCon.innerHTML = "";
    gCon.removeAttribute("opacity");
    paintFence();
    helper.innerHTML =
      "아까 그 학교 텃밭이에요! 경계가 <b>A-D-C로 꺾인</b> ㄱ자 담장이죠. 넓이는 그대로 두고 곧게 펴 볼 거예요. 먼저 <b>대각선 AC 긋기</b> 버튼!";
    clear(actions);
    const b = el(
      "button",
      { class: "ct-btn hero", attrs: { type: "button" } },
      el("span", { text: "대각선 AC 긋기" }),
    );
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      hasAC = true;
      mkG(acStr);
      paintFence(); // 주황 조각(△ACD) 채움 등장
      toast("대각선 AC가 밭을 두 삼각형으로 나눴어요.");
      later(() => {
        railOn = true;
        mkG(railStr(true), -10);
        paintFence();
        helper.innerHTML =
          "D를 지나며 <b>AC와 평행한 레일</b>이 나타났어요! D를 잡고 레일을 따라 끌어서 <b>BC의 연장선 위 E</b>까지 보내세요. 넓이 숫자를 지켜봐요!";
        clear(actions);
      }, 750);
    });
    actions.appendChild(b);
    later(() => helper.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function moveD(p: Pt): void {
    if (phase !== "fence" || !railOn) return;
    const t = clamp(((p.x - FD0.x) * ACV.x + (p.y - FD0.y) * ACV.y) / L2, -0.22, 1);
    if (Math.abs(t - dt) < 0.002) return;
    const step = Math.round(t * 8);
    if (step !== dCol) {
      dCol = step;
      haptic(HAPTIC.tap);
    }
    dt = t;
    paintFence();
    if (!dToast && Math.abs(dt) > 0.4) {
      dToast = true;
      toast("D가 레일 위를 미끄러져도 밭 넓이는 그대로 49칸!");
    }
    const D = posD(dt);
    if (Math.hypot(D.x - FE.x, D.y - FE.y) <= 14) complete();
  }

  function complete(): void {
    phase = "done";
    dragKind = null;
    dt = 1;
    haptic(HAPTIC.correct);
    paintFence();
    gCon.innerHTML = acStr + railStr(false); // 유령 E·연장선 정리, 작도선은 흐릿하게 남긴다
    gCon.setAttribute("opacity", ".5");
    readout.innerHTML = `밭 넓이 = <b>${cellFmt(cellsOf([FA, FB, FE]))}칸</b><span class="asl-same">처음 그대로!</span>`;
    popRead();
    chips.on("fence", "곧게 폈다!");
    toast("경계가 펴졌어요! △ACD와 △ACE의 넓이가 같아서(같은 밑변 AC·같은 높이) 밭 전체 넓이도 그대로예요.");
    helper.innerHTML =
      "꺾여 있던 경계가 넓이 그대로 <b>직선 A-E</b>가 됐어요! 평행선 위에서 꼭짓점을 미끄러뜨리면 모양은 변해도 넓이는 지켜져요. 정리하러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "정리하러 가기");
    haptic(HAPTIC.done);
  }

  /* ── 포인터(드래그는 레일 투영 스냅, 캡처는 try/catch 내장 헬퍼) ── */
  function pt(e: PointerEvent): Pt {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VW, y: ((e.clientY - r.top) / r.height) * VH };
  }

  svg.addEventListener("pointerdown", (e) => {
    const p = pt(e);
    if (phase === "slide" || phase === "why") {
      if (Math.hypot(p.x - ax, p.y - RT) <= 30) {
        dragKind = "A";
        capturePointer(svg, e.pointerId);
        if (!started) {
          started = true;
          paintTri();
        }
        moveA(p);
      }
    } else if (phase === "fence") {
      const D = posD(dt);
      if (Math.hypot(p.x - D.x, p.y - D.y) <= 30) {
        if (!railOn) {
          toast("먼저 대각선 AC부터! 아래 버튼을 눌러요.");
          return;
        }
        dragKind = "D";
        capturePointer(svg, e.pointerId);
        if (!dStarted) {
          dStarted = true;
          paintFence();
        }
        moveD(p);
      }
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragKind === "A") moveA(pt(e));
    else if (dragKind === "D") moveD(pt(e));
  });
  const drop = (): void => {
    dragKind = null;
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintBase1();
  paintTri();
  readout.innerHTML = "밑변 8칸 × 높이 7칸 ÷ 2 = <b>28칸</b>";
  api.setCTA("경계를 펴면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
