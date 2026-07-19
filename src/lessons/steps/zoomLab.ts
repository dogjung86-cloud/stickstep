// zoomLab, 확대 복사기(중2 수학 Ⅴ L1, 책 190~193쪽). '닮음' 명명 전의 발견 랩:
// 배율 스테퍼(0.5~3.0, 0.5 스텝)로 사본 삼각형을 목표 윤곽에 포개는 3국면.
// ① ×2.0 포개기(대응점 연결선) ② ×0.5, 축소도 같은 원리 ③ 함정: 가로만 2배는 찌그러짐 + 판정 질문.
// 주의: 이 랩에서 '닮음' 단어 금지(다음 concept가 명명), "모양이 같다/포개진다"로만 서술.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .zml- 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { dot, ptLabel } from "../../ui/geoKit";
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

/** 원본 도형의 국소 좌표(B 기준). 밑변 60·높이 45, 꼭대기가 22 지점인 부등변 예각 삼각형. */
const SHP = { ax: 22, ay: -45, base: 60 } as const;
const ORG = { x: 16, y: 226 }; // 원본 앵커(B)
const TGT = { x: 128, y: 240 }; // 사본·목표 앵커(E)
const INK_O = "#12579B";
const INK_C = "#C2255C";
const INK_C_D = "#8C1843";

const n1 = (v: number): string => (Math.round(v * 10) / 10).toString();

function tri(anchor: Pt, kx: number, ky: number): { a: Pt; b: Pt; c: Pt } {
  return {
    a: { x: anchor.x + SHP.ax * kx, y: anchor.y + SHP.ay * ky },
    b: { x: anchor.x, y: anchor.y },
    c: { x: anchor.x + SHP.base * kx, y: anchor.y },
  };
}

const triPath = (t: { a: Pt; b: Pt; c: Pt }): string =>
  `M${n1(t.a.x)} ${n1(t.a.y)} L${n1(t.b.x)} ${n1(t.b.y)} L${n1(t.c.x)} ${n1(t.c.y)} Z`;

export const zoomLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "two", label: "2배로 포개기", sub: "×2.0 도전" },
    { id: "half", label: "반으로 줄여도", sub: "잠김" },
    { id: "ratio", label: "일정한 비율", sub: "잠김" },
  ]);

  const board = mboard(540);
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<defs>` +
    `<linearGradient id="zmlGO" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#EAF3FC"/><stop offset=".55" stop-color="#D4E7F8"/><stop offset="1" stop-color="#BBD7F2"/>` +
    `</linearGradient>` +
    `<linearGradient id="zmlGC" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#FBE4EE"/><stop offset=".55" stop-color="#F8D8E6"/><stop offset="1" stop-color="#F2C8DA"/>` +
    `</linearGradient>` +
    `</defs>` +
    `<line x1="8" y1="240" x2="332" y2="240" stroke="#E2E9F2" stroke-width="1.6"/>` +
    `<g class="zml-orig"></g>` +
    `<g class="zml-copy" style="transform-box: view-box; transform-origin: ${TGT.x}px ${TGT.y}px; transition: filter .3s ease"></g>` +
    // 유령(목표)은 사본 위 레이어: 사본이 크게 커진 상태에서도 작은 목표 윤곽이 가려지지 않고,
    // 포갠 순간엔 점선이 사본 위에 겹쳐 "딱 맞음"이 읽힌다(점선 + 5% 면이라 사본을 해치지 않음)
    `<g class="zml-ghost"></g><g class="zml-marks"></g>` +
    `</svg>`;
  const ctlRow = el("div", { class: "zml-ctl" });
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u5q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(svgWrap, ctlRow, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "왼쪽 파란 도형(A·B·C)의 <b>사본</b>이 오른쪽에 있어요. 배율 버튼으로 사본을 키워 <b>점선 목표</b>에 딱 포개 보세요!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gGhost = svg.querySelector(".zml-ghost") as SVGGElement;
  const gOrig = svg.querySelector(".zml-orig") as SVGGElement;
  const gCopy = svg.querySelector(".zml-copy") as SVGGElement;
  const gMarks = svg.querySelector(".zml-marks") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let k = 1; // 현재 배율(0.5 스텝이라 이진 표현이 정확, === 비교 안전)
  let phase: 1 | 2 | 3 = 1;
  let busy = false; // 스냅 연출 중 스테퍼 잠금
  let stepLocked = false; // 국면 3부터 스테퍼 영구 잠금

  function paintOrig(): void {
    const t = tri(ORG, 1, 1);
    gOrig.innerHTML =
      `<path d="${triPath(t)}" fill="url(#zmlGO)" stroke="${INK_O}" stroke-width="2.2" stroke-linejoin="round"/>` +
      dot(t.a.x, t.a.y, INK_O, 3.4) + dot(t.b.x, t.b.y, INK_O, 3.4) + dot(t.c.x, t.c.y, INK_O, 3.4) +
      ptLabel(t.a.x, t.a.y, "A", 0, -10, INK_O) + ptLabel(t.b.x, t.b.y, "B", -10, 13, INK_O) +
      ptLabel(t.c.x, t.c.y, "C", 10, 13, INK_O) +
      `<text x="${ORG.x + 30}" y="256" text-anchor="middle" font-size="12" font-weight="800" fill="#64748B">원본</text>`;
  }

  function paintGhost(t: number): void {
    const g = tri(TGT, t, t);
    gGhost.innerHTML =
      `<path d="${triPath(g)}" fill="${INK_C}" fill-opacity=".05" stroke="${INK_C}" stroke-width="2" stroke-dasharray="7 5" opacity=".55" stroke-linejoin="round"/>` +
      `<text x="${n1(TGT.x + (SHP.base * t) / 2)}" y="256" text-anchor="middle" font-size="12" font-weight="800" fill="${INK_C}" opacity=".7">목표</text>`;
  }

  function paintCopy(kx: number, ky: number): void {
    const t = tri(TGT, kx, ky);
    gCopy.innerHTML =
      `<path d="${triPath(t)}" fill="url(#zmlGC)" stroke="${INK_C}" stroke-width="2.2" stroke-linejoin="round"/>` +
      dot(t.a.x, t.a.y, INK_C, 3.4) + dot(t.b.x, t.b.y, INK_C, 3.4) + dot(t.c.x, t.c.y, INK_C, 3.4) +
      ptLabel(t.a.x, t.a.y, "D", 0, -10, INK_C_D) + ptLabel(t.b.x, t.b.y, "E", -10, 13, INK_C_D) +
      ptLabel(t.c.x, t.c.y, "F", 10, 13, INK_C_D);
  }

  /** 대응점 연결선 A→D·B→E·C→F(스냅 연출, 잠깐 표시). */
  function paintPairs(t: number): void {
    const o = tri(ORG, 1, 1);
    const c = tri(TGT, t, t);
    const segs: [Pt, Pt][] = [[o.a, c.a], [o.b, c.b], [o.c, c.c]];
    gMarks.innerHTML = segs
      .map(([p, q], i) =>
        `<line x1="${n1(p.x)}" y1="${n1(p.y)}" x2="${n1(q.x)}" y2="${n1(q.y)}" stroke="#F08C00" stroke-width="1.8" stroke-dasharray="4 4" opacity="0" style="transition: opacity .4s ease ${(i * 0.13).toFixed(2)}s"/>`)
      .join("");
    later(() => {
      gMarks.querySelectorAll("line").forEach((l) => ((l as SVGLineElement).style.opacity = ".85"));
    }, 30);
  }

  /* ── 배율 스테퍼 ── */
  const read = el("span", { class: "zml-read", attrs: { "aria-live": "polite" } });
  const paintRead = (): void => {
    read.innerHTML = `배율 <b>×${k.toFixed(1)}</b>`;
  };
  const mkStep = (label: string, d: number): HTMLButtonElement => {
    const b = el("button", { class: "ct-btn", attrs: { type: "button", "aria-label": d > 0 ? "배율 키우기" : "배율 줄이기" } }, el("span", { text: label }));
    b.addEventListener("click", () => {
      if (busy || stepLocked) return;
      const next = Math.min(3, Math.max(0.5, k + d));
      if (next === k) return;
      k = next;
      haptic(HAPTIC.tap);
      paintCopy(k, k);
      paintRead();
      judge();
    });
    return b;
  };
  const minusBt = mkStep("−", -0.5);
  const plusBt = mkStep("+", 0.5);
  ctlRow.append(minusBt, read, plusBt);

  /** 목표 배율에 닿으면 스냅: 글로우 + 대응점 연결선 + 칩, 이후 다음 국면으로. */
  function snap(t: number, onHit: () => void, onNext: () => void): void {
    busy = true;
    haptic(HAPTIC.correct);
    gCopy.style.filter = "drop-shadow(0 0 7px rgba(194,37,92,.8))";
    paintPairs(t);
    onHit();
    later(() => {
      gMarks.innerHTML = "";
      gCopy.style.filter = "";
      busy = false;
      onNext();
    }, 2200);
  }

  function judge(): void {
    if (phase === 1 && k === 2) {
      snap(2, () => {
        chips.on("two", "딱 포개짐!");
        toast("모든 변이 똑같이 2배가 되니 모양이 그대로예요!");
      }, () => {
        phase = 2;
        paintGhost(0.5);
        helper.innerHTML = "이번엔 목표가 <b>절반 크기</b>로 줄었어요. 배율을 얼마에 맞추면 포개질까요?";
      });
    } else if (phase === 2 && k === 0.5) {
      snap(0.5, () => {
        chips.on("half", "모양 그대로!");
        toast("줄일 때도 같은 원리예요. 모든 변을 똑같이 반으로 줄이면 모양이 그대로죠!");
      }, startTrap);
    }
  }

  /* ── 국면 3: 가로만 2배 함정 ── */
  function startTrap(): void {
    phase = 3;
    stepLocked = true;
    minusBt.classList.add("zml-dim");
    plusBt.classList.add("zml-dim");
    k = 1;
    paintCopy(1, 1);
    paintRead();
    paintGhost(2);
    helper.innerHTML = "마지막 실험이에요. 이번엔 배율 버튼 대신 <b>가로만 2배</b>! 가로만 늘려도 ×2.0 목표에 포개질까요?";
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "가로만 2배" }));
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      paintCopy(2, 1);
      read.innerHTML = `<span class="zml-warn">가로 ×2.0 · 세로 ×1.0</span>`;
      gCopy.classList.add("zml-shake");
      later(() => {
        haptic(HAPTIC.wrong);
        toast("가로는 2배인데 세로는 1배 그대로라 납작해요. 목표 점선과 어긋났어요!");
      }, 550);
      later(askTrap, 2000);
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function askTrap(): void {
    qline.innerHTML = "가로만 2배로 늘린 도형, 원본과 <b>모양이 같을까요?</b>";
    const items = [
      {
        t: "네, 어차피 커졌으니 같은 모양이에요",
        good: false,
        fb: "커지긴 했지만 세로는 그대로라 납작하게 찌그러졌어요. 목표 점선과 어긋난 게 그 증거죠. 커지는 것과 모양이 그대로인 건 다른 문제예요!",
      },
      {
        t: "아니요, 모든 길이를 같은 비율로 늘려야 모양이 그대로예요",
        good: true,
        fb: "정답! 가로·세로·빗변까지 전부 같은 비율로 늘려야 원래 모양이 지켜져요. ×2.0 배율이 딱 그랬죠.",
      },
      {
        t: "세로만 늘렸다면 같은 모양이 됐을 거예요",
        good: false,
        fb: "세로만 늘리면 이번엔 홀쭉하게 찌그러져요. 어느 한 방향만 늘리면 반드시 모양이 망가지죠. 답은 모든 방향을 같은 비율로!",
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
          finale();
        }, 2600);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /** 피날레: 세로까지 2배로 바로잡아 다시 포개 보이고 완료. */
  function finale(): void {
    gCopy.classList.remove("zml-shake");
    k = 2;
    paintCopy(2, 2);
    paintRead();
    gCopy.style.filter = "drop-shadow(0 0 7px rgba(194,37,92,.8))";
    paintPairs(2);
    haptic(HAPTIC.done);
    toast("세로까지 2배로 맞추니 다시 딱 포개져요. 비율이 지켜지면 모양이 지켜져요!");
    chips.on("ratio", "그게 비결!");
    helper.innerHTML =
      "가로·세로·빗변까지 <b>모든 길이를 일정한 비율로</b> 바꿔야 모양이 그대로예요. 이 관계의 정식 이름을 배우러 가요!";
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "이름 붙이러 가기");
    later(() => {
      gMarks.innerHTML = "";
      gCopy.style.filter = "";
    }, 2400);
  }

  paintOrig();
  paintGhost(2);
  paintCopy(1, 1);
  paintRead();
  api.setCTA("사본을 전부 포개면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
