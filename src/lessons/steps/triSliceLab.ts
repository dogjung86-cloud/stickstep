// triSliceLab, 평행 슬라이서(중2 수학 Ⅴ L6, 삼각형과 평행선. 책 204~205쪽).
// 국면 1(explore): BC와 평행한 슬라이서 DE를 세로로 드래그, 정수비 위치(1:3·1:1·2:1·3:1)에
//   pointerup 스냅. AD:DB와 AE:EC 리드아웃이 어디서나 같음을 세 곳 방문으로 발견.
// 국면 2(mid→ask): 1:1 자리에 놓고 "DE는 BC의 얼마?" 판정(mq6) — 부분:부분(AD:DB=1:1)과
//   부분:전체(AD:AB=1:2)의 혼동이 함정. 정답 후 실측 공개(길이 모델 BC=12 → 스냅마다
//   DE=3·6·8·9 전부 자연수).
// 국면 3(tilt): 기울이기 토글로 E만 AC를 따라 내려가 평행 붕괴 → 1:1 vs 2:1 어긋남 경고,
//   되돌리면 재일치 — "평행일 때만" 성립을 붕괴로 체험.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머는 Set으로 모아 cleanup에서 일괄 해제).
// 스타일: math2.css .tsl- 섹션(+ 중2 Ⅴ 판정 질문 톤 .mq6-q.m2u5q).
import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, dot, ptLabel, arrowHead, angleOf, lineSvg, capturePointer } from "../../ui/geoKit";
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

const A: Pt = { x: 170, y: 36 };
const B: Pt = { x: 60, y: 224 };
const C: Pt = { x: 290, y: 224 };
const RB = "#C2255C"; // 단원 액센트(마트료시카 라즈베리)
/** 스냅 위치: t = AD:AB(부분:전체) 비율. 라벨은 AD:DB(부분:부분) 정수비. */
const SNAPS = [
  { t: 0.25, label: "1:3" },
  { t: 0.5, label: "1:1" },
  { t: 2 / 3, label: "2:1" },
  { t: 0.75, label: "3:1" },
];
const TMIN = 0.17;
const TMAX = 0.83;
const BC_LEN = 12; // 길이 모델: BC=12 → 스냅 위치에서 DE=3·6·8·9 전부 자연수

const onAB = (t: number): Pt => ({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
const onAC = (t: number): Pt => ({ x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t });

/** 평행 인디케이터: 선분 위 같은 방향 화살촉 하나. */
function paraMark(p: Pt, q: Pt, color: string): string {
  const a = angleOf(p.x, p.y, q.x, q.y);
  const m = { x: p.x + (q.x - p.x) * 0.42, y: p.y + (q.y - p.y) * 0.42 };
  return arrowHead(m.x, m.y, a, color, 6.5);
}

export const triSliceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "ratio", label: "같은 비", sub: "세 곳에서 확인" },
    { id: "whole", label: "전체와 부분", sub: "잠김" },
    { id: "para", label: "평행일 때만", sub: "잠김" },
  ]);

  const board = mboard(520);
  const readout = el("div", { class: "tsl-read", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" fill="none" role="img" aria-label="평행 슬라이서 실험 무대">` +
    `<g class="tsl-base"></g><g class="tsl-side"></g><g class="tsl-slice"></g><g class="tsl-mark"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(readout, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "BC와 <b>평행한 슬라이서 DE</b>가 삼각형을 자르고 있어요. 가운데 손잡이를 잡고 <b>위아래로</b> 끌어 여러 곳에서 잘라 보세요!",
  });
  host.append(chips.el, helper, board); // 칩 → helper(지시) → 보드, 확정 배치
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gBase = svg.querySelector(".tsl-base") as SVGGElement;
  const gSide = svg.querySelector(".tsl-side") as SVGGElement;
  const gSlice = svg.querySelector(".tsl-slice") as SVGGElement;
  const gMark = svg.querySelector(".tsl-mark") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  /* ── 상태 ── */
  let phase: "explore" | "mid" | "ask" | "reveal" | "tilt" | "done" = "explore";
  let t = 0.42; // D(슬라이서)의 AB 위 파라미터(AD:AB) — 스냅 밖에서 시작해 첫 드래그를 유도
  let tE = 0.42; // E의 AC 위 파라미터(평행이면 t와 같다)
  let started = false;
  let dragging = false;
  let tick = 0;
  const visited = new Set<number>();
  let lengthsOn = false;

  function popRead(): void {
    readout.classList.remove("mq6-pop");
    void readout.offsetWidth;
    readout.classList.add("mq6-pop");
  }

  /** 비 표기: 스냅 위치는 정수비 라벨, 그 밖에서는 소수 1자리 라이브. */
  function ratioStr(v: number): string {
    const sn = SNAPS.find((z) => Math.abs(z.t - v) < 0.004);
    if (sn) return sn.label;
    return v <= 0.5 ? `1 : ${((1 - v) / v).toFixed(1)}` : `${(v / (1 - v)).toFixed(1)} : 1`;
  }

  function paintBase(): void {
    gBase.innerHTML =
      `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${C.x} ${C.y} Z" fill="rgba(194,37,92,.05)" stroke="${GEO.ink}" stroke-width="2.2" stroke-linejoin="round"/>` +
      paraMark(B, C, GEO.hlD) +
      dot(A.x, A.y) + dot(B.x, B.y) + dot(C.x, C.y) +
      ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(B.x, B.y, "B", -12, 12) + ptLabel(C.x, C.y, "C", 12, 12);
  }

  function paint(): void {
    const D = onAB(t);
    const E = onAC(tE);
    const same = Math.abs(tE - t) < 0.004;
    gSide.innerHTML =
      lineSvg(A.x, A.y, D.x, D.y, GEO.hlA, 5) +
      lineSvg(D.x, D.y, B.x, B.y, GEO.hlB, 5) +
      lineSvg(A.x, A.y, E.x, E.y, GEO.hlA, 5) +
      lineSvg(E.x, E.y, C.x, C.y, GEO.hlB, 5);
    const gx = (D.x + E.x) / 2;
    const gy = (D.y + E.y) / 2;
    gSlice.innerHTML =
      lineSvg(D.x, D.y, E.x, E.y, same ? RB : GEO.no, 3.6) +
      (same ? paraMark(D, E, GEO.hlD) : "") +
      dot(D.x, D.y, RB, 4.5) + dot(E.x, E.y, RB, 4.5) +
      ptLabel(D.x, D.y, "D", -12, -8, RB) + ptLabel(E.x, E.y, "E", 12, -8, RB) +
      (started
        ? ""
        : arrowHead(gx, gy - 24, 90, "#B6C2D2", 6) + arrowHead(gx, gy + 24, 270, "#B6C2D2", 6)) +
      `<g><circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="14" fill="rgba(194,37,92,.14)"/>` +
      `<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="7.5" fill="#FFFFFF" stroke="${RB}" stroke-width="2.8"/>` +
      `<line x1="${(gx - 3.5).toFixed(1)}" y1="${gy.toFixed(1)}" x2="${(gx + 3.5).toFixed(1)}" y2="${gy.toFixed(1)}" stroke="${RB}" stroke-width="1.6"/></g>`;
    gMark.innerHTML = lengthsOn
      ? `<text x="${gx.toFixed(1)}" y="${(gy - 22).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="900" fill="${RB}">DE = ${Math.round(BC_LEN * t)}</text>` +
        `<text x="175" y="248" text-anchor="middle" font-size="13" font-weight="900" fill="#B87708">BC = ${BC_LEN}</text>`
      : "";
    readout.classList.toggle("bad", !same);
    readout.innerHTML =
      `<span><i class="tsl-a">AD</i>:<i class="tsl-b">DB</i> = <b>${ratioStr(t)}</b></span>` +
      `<span class="tsl-eq">${same ? "=" : "≠"}</span>` +
      `<span><i class="tsl-a">AE</i>:<i class="tsl-b">EC</i> = <b>${ratioStr(tE)}</b></span>`;
  }

  /* ── 국면 1·2: 스냅 방문 ── */
  function onSnap(idx: number): void {
    if (phase === "explore") {
      if (!visited.has(idx)) {
        visited.add(idx);
        if (visited.size === 1) {
          toast(`여기서는 AD:DB도 AE:EC도 ${SNAPS[idx].label}. 우연일까요? 다른 곳도 잘라 봐요!`);
        } else if (visited.size === 2) {
          toast("여기서도 두 비가 똑같아요! 한 곳만 더 확인해 봐요.");
        } else {
          chips.on("ratio", "어디서나 같아요");
          haptic(HAPTIC.correct);
          toast("세 곳 모두 두 비가 같았어요. 평행하게 자르면 양쪽 변은 늘 같은 비로 잘려요!");
          phase = "mid";
          helper.innerHTML = "그럼 길이는요? 슬라이서를 <b>딱 한가운데(1:1 자리)</b>에 놓아 보세요.";
          if (idx === 1) later(beginAsk, 1600);
        }
      } else {
        toast("이미 확인한 자리예요. 다른 곳에서도 잘라 봐요!");
      }
      return;
    }
    if (phase === "mid") {
      if (idx === 1) beginAsk();
      else toast(t < 0.5 ? "한가운데는 조금 더 아래예요!" : "한가운데는 조금 더 위예요!");
    }
  }

  function beginAsk(): void {
    // 예약 호출 대비 이중 가드: 이미 질문 중이거나, 그 사이 1:1 자리를 벗어났으면 무시
    // (벗어난 경우엔 mid 국면의 스냅 판정이 다시 불러 준다).
    if (phase !== "mid" || Math.abs(t - 0.5) > 0.004) return;
    phase = "ask";
    qline.innerHTML = "AD:DB가 <b>1:1</b>일 때, DE의 길이는 BC의 얼마일까요?";
    const items = [
      {
        t: "절반이요, DE:BC는 AD:AB 즉 1:2를 따라요",
        good: true,
        fb: "정답! DE를 정하는 건 부분:부분(AD:DB)이 아니라 부분:전체(AD:AB)예요. AD:DB가 1:1이면 AD는 AB의 절반, 그래서 DE도 BC의 절반이죠.",
      },
      {
        t: "같아요, 1:1이니까요",
        good: false,
        fb: "1:1은 AD와 DB, 부분끼리의 비예요. DE:BC를 정하는 건 부분:전체의 비 AD:AB죠. AD:DB가 1:1이면 AD:AB는 1:2, 그래서 DE는 BC와 같은 게 아니라 절반이에요.",
      },
      {
        t: "3분의 1이요",
        good: false,
        fb: "1:3 자리와 헷갈렸어요! AD:DB가 1:1이면 AB는 똑같은 두 조각이고 AD는 전체의 절반이에요. 그래서 AD:AB는 1:2, DE도 BC의 절반이죠.",
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
        later(reveal, 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function reveal(): void {
    phase = "reveal";
    qline.innerHTML = "";
    clear(ctl);
    lengthsOn = true;
    paint();
    popRead();
    chips.on("whole", "DE는 BC의 절반");
    toast("실측 공개! DE = 6, BC = 12. AD:AB = 1:2 그대로예요.");
    helper.innerHTML =
      "어느 자리든 DE:BC는 <b>AD:AB(부분:전체)</b>를 따라요. 그런데 이 모든 규칙, <b>평행이 아니어도</b> 통할까요?";
    later(startTilt, 2400);
  }

  /* ── 국면 3: 평행 붕괴 ── */
  function animE(target: number, done: () => void): void {
    const from = tE;
    const steps = 16;
    for (let k = 1; k <= steps; k++) {
      later(() => {
        const p = k / steps;
        const e = p * p * (3 - 2 * p);
        tE = k === steps ? target : from + (target - from) * e;
        paint();
        if (k === steps) done();
      }, 26 * k);
    }
  }

  function startTilt(): void {
    phase = "tilt";
    helper.innerHTML =
      "아래 <b>기울이기</b> 버튼으로 E만 슬쩍 아래로 밀어 볼게요. 평행이 깨지면 두 비는 어떻게 될까요?";
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "기울이기" }));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      lengthsOn = false;
      animE(2 / 3, () => {
        haptic(HAPTIC.wrong);
        popRead();
        toast("AD:DB는 1:1인데 AE:EC는 2:1! 평행이 깨지자 같은 비 규칙도 깨졌어요.");
        helper.innerHTML = "DE가 BC와 평행이 아니면 두 비는 어긋나요. <b>평행으로 되돌리기</b>로 확인 사살!";
        showRestore();
      });
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function showRestore(): void {
    clear(actions);
    const b = el(
      "button",
      { class: "ct-btn hero", attrs: { type: "button" } },
      el("span", { text: "평행으로 되돌리기" }),
    );
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      animE(0.5, () => {
        haptic(HAPTIC.correct);
        popRead();
        chips.on("para", "평행이 생명!");
        toast("다시 평행, 다시 같은 비!");
        complete();
      });
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function complete(): void {
    phase = "done";
    clear(actions);
    haptic(HAPTIC.done);
    helper.innerHTML =
      "정리! BC와 평행하게 자르면 ① 양쪽 변은 <b>같은 비</b>로 잘리고 ② DE:BC는 <b>AD:AB(부분:전체)</b>를 따라요. 평행이 아니면 둘 다 무너져요.";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터(스냅 확정은 pointerup, 캡처는 try/catch 내장 헬퍼) ── */
  function toPt(e: PointerEvent): Pt {
    const r = svg.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 340, y: ((e.clientY - r.top) / r.height) * 260 };
  }

  function moveSlice(p: Pt): void {
    const nt = clamp((p.y - A.y) / (B.y - A.y), TMIN, TMAX);
    if (Math.abs(nt - t) < 0.001) return;
    t = nt;
    tE = nt;
    const k = Math.round(t * 20);
    if (k !== tick) {
      tick = k;
      haptic(HAPTIC.tap);
    }
    paint();
  }

  svg.addEventListener("pointerdown", (e) => {
    if (phase !== "explore" && phase !== "mid") return;
    const p = toPt(e);
    const D = onAB(t);
    const E = onAC(t);
    if (p.x < D.x - 16 || p.x > E.x + 16 || Math.abs(p.y - D.y) > 30) return;
    dragging = true;
    started = true;
    capturePointer(svg, e.pointerId);
    moveSlice(p);
  });
  svg.addEventListener("pointermove", (e) => {
    if (dragging) moveSlice(toPt(e));
  });
  const drop = (): void => {
    if (!dragging) return;
    dragging = false;
    let best = 0;
    for (let k = 1; k < SNAPS.length; k++) {
      if (Math.abs(SNAPS[k].t - t) < Math.abs(SNAPS[best].t - t)) best = k;
    }
    t = SNAPS[best].t;
    tE = t;
    haptic(HAPTIC.select);
    paint();
    onSnap(best);
  };
  svg.addEventListener("pointerup", drop);
  svg.addEventListener("pointercancel", drop);

  paintBase();
  paint();
  api.setCTA("평행의 비밀을 모으면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
