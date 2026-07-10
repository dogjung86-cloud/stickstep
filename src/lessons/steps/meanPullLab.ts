// meanPullLab, 평균 끌림 랩(Ⅵ L1 — 교과서 236쪽 "평균이 대푯값으로 적절하지 않은 경우"의 체험판).
// 시소·무게중심 은유 없이 자료 그 자체를 보여 준다(사용자 확정: 통계는 개념을 하나씩) —
// 수직선 위 밥값 점 5개(7,8,8,9,X)와 평균 마커 ▲, 무게중심 사실은 curio로만 남긴다.
// 국면 3개: 1 [평균 계산] 탭 → 마커 등장(모두 비슷한 날, 평균 8) →
//   2 마지막 점 X를 33까지 드래그 → 평균 마커가 실시간으로 끌려감 + "평균 미만 인원" 카운터 →
//   3 "이 자료의 대표로 어울리는 금액은?" 8/13/33 선택 → 8(크기순 가운데, 다음 concept 중앙값의 선경험).
// 판정은 드롭(pointerup), 이동 중엔 매 move 재렌더(rAF 금지).

import { el, clear, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface MeanPullStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 206;
const LO = 0;
const HI = 35; // 수직선 범위(천 원)
const AXY = 148; // 수직선 y
const X = (v: number): number => 26 + ((v - LO) / (HI - LO)) * (W - 52);

const NAVY = "#364FC7";

export const meanPullLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as MeanPullStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "avg", label: "평균 계산", sub: "평범한 날" },
    { id: "pull", label: "극단값 사건", sub: "33까지" },
    { id: "rep", label: "새 대표 찾기", sub: "어울리는 값" },
  ]);

  const board = mboard(560);
  const stage = el("div", { class: "mpl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mpl-axis"></g><g class="mpl-ghost"></g><g class="mpl-dots"></g><g class="mpl-mark"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst", html: "다섯 명의 밥값이 수직선 위에 올라왔어요. 먼저 <b>평균 계산</b>을 눌러 보세요" });
  const meter = el("div", { class: "mq6-gauge" });
  const eqs = el("div", { class: "mq6-eqs" });
  // 판단 질문 전용 줄 — 항상 선택지 버튼 바로 위 + 강조색(실사용 피드백 2026-07-10).
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, meter, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "먹방 사건이 나기 전, 다들 비슷하게 먹은 <b>평범한 날</b>부터 시작해요. 마지막 친구(빨강)도 아직은 8천 원!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gAxis = svg.querySelector(".mpl-axis") as SVGGElement;
  const gGhost = svg.querySelector(".mpl-ghost") as SVGGElement;
  const gDots = svg.querySelector(".mpl-dots") as SVGGElement;
  const gMark = svg.querySelector(".mpl-mark") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  const vals = [7, 8, 8, 9, 8]; // 마지막 변량(먹방 친구)이 국면 2에서 8→33이 된다
  let phase: 1 | 2 | 3 = 1;
  let showMark = false;
  let finished = false;
  let lock = false;
  let dragging = false;

  const mean = (): number => vals.reduce((a, b) => a + b, 0) / vals.length;
  const fmtMean = (): string => {
    const m = mean();
    return m % 1 === 0 ? String(m) : m.toFixed(1);
  };
  const belowCount = (): number => vals.filter((v) => v < mean()).length;

  function drawAxis(): void {
    let out = `<line x1="${X(LO)}" y1="${AXY}" x2="${X(HI)}" y2="${AXY}" stroke="${GEO.faint}" stroke-width="2" stroke-linecap="round"/>`;
    for (let v = LO; v <= HI; v += 1) {
      if (v % 5 !== 0) continue;
      out += `<line x1="${X(v).toFixed(1)}" y1="${AXY - 5}" x2="${X(v).toFixed(1)}" y2="${AXY + 5}" stroke="#C2CBD6" stroke-width="1.4"/>`;
      if (v < HI)
        out += `<text x="${X(v).toFixed(1)}" y="${AXY + 20}" text-anchor="middle" font-size="10" font-weight="700" fill="${GEO.soft}">${v}</text>`;
    }
    out += `<text x="${W - 10}" y="${AXY + 20}" text-anchor="end" font-size="9.5" font-weight="700" fill="${GEO.soft}">(천 원)</text>`;
    gAxis.innerHTML = out;
  }

  function drawGhost(): void {
    // 국면 2부터: 처음 평균(8) 자리를 점선 마커로 남겨 "얼마나 끌려갔나"가 보이게.
    // 라벨은 둘째 줄(AXY+46), 평균 라벨(AXY+34)과 줄을 나눠 겹침 방지.
    gGhost.innerHTML =
      phase >= 2
        ? `<path d="M${X(8).toFixed(1)} ${AXY + 4} l-9 14 h18 Z" fill="none" stroke="#9AA6C8" stroke-width="1.8" stroke-dasharray="4 3"/>` +
          `<text x="${X(8).toFixed(1)}" y="${AXY + 46}" text-anchor="middle" font-size="9" font-weight="800" fill="#9AA6C8">처음 평균 8</text>`
        : "";
  }

  function drawDots(): void {
    // 값이 가까우면(지름 이내) 위로 쌓는다 — 촘촘한 7~9가 탑처럼 모여 "옹기종기"가 읽히고,
    // 극단값은 탑에서 떨어져 나가 홀로 선 것이 한눈에 보인다.
    const placed: number[][] = []; // 층별로 이미 놓인 x들
    gDots.innerHTML =
      `<defs>` +
      `<radialGradient id="mpl-cool" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></radialGradient>` +
      `<radialGradient id="mpl-hot" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#F27D8E"/><stop offset="1" stop-color="#C93A52"/></radialGradient>` +
      `</defs>` +
      vals
        .map((v, i) => {
          const x = X(v);
          let stack = 0;
          while ((placed[stack] ?? []).some((px) => Math.abs(px - x) < 24)) stack += 1;
          (placed[stack] ??= []).push(x);
          const last = i === vals.length - 1;
          const cy = AXY - 16 - stack * 24;
          return (
            `<g class="mpl-dot${last ? " last" : ""}">` +
            `<circle cx="${x.toFixed(1)}" cy="${cy}" r="11.5" fill="url(#${last ? "mpl-hot" : "mpl-cool"})" stroke="${last ? "#B23A48" : "#1F2E8C"}" stroke-width="2"/>` +
            `<text x="${x.toFixed(1)}" y="${cy + 3.6}" text-anchor="middle" font-size="9.5" font-weight="900" fill="#FFFFFF">${v}</text>` +
            `</g>`
          );
        })
        .join("");
  }

  function drawMark(): void {
    if (!showMark) {
      gMark.innerHTML = "";
      return;
    }
    const gx = X(mean());
    gMark.innerHTML =
      `<g class="mq6-pop"><path d="M${gx.toFixed(1)} ${AXY + 4} l-9 14 h18 Z" fill="url(#mpl-mk)" stroke="#1F2E8C" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<text x="${gx.toFixed(1)}" y="${AXY + 34}" text-anchor="middle" font-size="10" font-weight="900" fill="${NAVY}">평균 ${fmtMean()}</text></g>` +
      `<defs><linearGradient id="mpl-mk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#364FC7"/></linearGradient></defs>`;
  }

  function updateMeter(): void {
    if (!showMark) {
      meter.innerHTML = "밥값 <b>7, 8, 8, 9, 8</b>천 원";
      return;
    }
    meter.innerHTML =
      `평균 <b>${fmtMean()}</b>천 원` +
      (phase >= 2 ? ` · 평균보다 적게 낸 사람 <b style="color:${vals[4] >= 20 ? "#C0355C" : "#2839A0"}">${belowCount()}명</b>` : "");
  }

  function redraw(): void {
    drawGhost();
    drawDots();
    drawMark();
    updateMeter();
  }

  /* ── 국면 1: 평범한 날의 평균 ── */
  function onAvgTap(): void {
    if (phase !== 1 || finished) return;
    showMark = true;
    lock = true;
    clear(ctl);
    redraw();
    haptic(HAPTIC.correct);
    toast("평균 마커 ▲ 등장!");
    eqs.appendChild(
      el("div", { class: "mq6-eq mq6-pop", html: "(7+8+8+9+8)÷5 = <b>8</b>. 모두의 밥값과 비슷한 <b>좋은 대표</b>예요!" }),
    );
    chips.on("avg", "8천 원");
    later(startPhase2, 1700);
  }

  /* ── 국면 2: 극단값 드래그 ── */
  function startPhase2(): void {
    if (finished) return;
    phase = 2;
    lock = false;
    clear(eqs);
    inst.innerHTML = "사건 발생! 먹방 친구의 점(빨강)을 <b>33</b>까지 끌어 보세요";
    helper.innerHTML = "점이 커지는 동안 <b>평균 마커 ▲</b>가 어디로 가는지, <b>평균보다 적게 낸 사람</b>이 몇 명이 되는지 지켜봐요!";
    redraw();
  }

  function judgeExtreme(): void {
    if (vals[4] >= 33) {
      vals[4] = 33;
      lock = true;
      redraw();
      haptic(HAPTIC.done);
      toast("평균이 8에서 13까지 끌려왔어요!");
      eqs.appendChild(
        el("div", {
          class: "mq6-eq mq6-pop",
          html: "(7+8+8+9+33)÷5 = <b>13</b>. 그런데 다섯 명 중 <b>네 명이 평균보다 적게</b> 냈고, 1만 3천 원을 낸 사람은 <b>아무도 없어요</b>",
        }),
      );
      chips.on("pull", "8→13");
      later(startPhase3, 2100);
    } else {
      toast("끝까지! 33까지 끌어 보세요");
    }
  }

  /* ── 국면 3: 새 대표 선택(중앙값의 선경험) ── */
  function startPhase3(): void {
    if (finished) return;
    phase = 3;
    redraw();
    inst.innerHTML = "평균 13은 대표 자격을 잃었어요. 힌트: 크기순으로 줄 세우면 <b>7, 8, 8, 9, 33</b>이에요";
    // 판단 질문은 강조 줄(qline)로 선택지 버튼 바로 위에 — helper는 화면 아래라 스크롤 전엔 안 보인다.
    qline.innerHTML = "이 자료의 대표로 <b>더 어울리는 금액</b>은 얼마일까요? 다섯 명 대부분이 낸 금액대를 찾아봐요";
    helper.innerHTML = "틀려도 괜찮아요, 왜 아닌지 알려 줄게요!";
    const row = el("div", { class: "mq6-choices" });
    ([
      [8, "8천 원"],
      [13, "1만 3천 원"],
      [33, "3만 3천 원"],
    ] as [number, string][]).forEach(([v, label]) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 8) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "네 명이 7~9천 원을 냈으니 <b>크기순 한가운데인 8</b>이 자료와 딱 어울려요. 이 값의 정식 이름을 다음 화면에서 만나요!",
            }),
          );
          chips.on("rep", "8천 원");
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 13 ? "13은 극단값에 끌려간 평균! 아무도 안 낸 금액이에요." : "33은 극단값 본인! 나머지 네 명과 너무 멀어요.");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "극단값 하나가 평균을 끌고 가면, <b>크기순 가운데 값</b>이 대표를 맡아요. 대푯값 선택의 핵심!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 포인터(국면 2 전용, 마지막 점만 드래그) ── */
  function svgX(e: PointerEvent): number {
    const rect = svg.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * W;
  }
  const xToVal = (x: number): number => clamp(Math.round(LO + ((x - 26) / (W - 52)) * (HI - LO)), LO, HI);

  svg.addEventListener("pointerdown", (e) => {
    if (phase !== 2 || lock || finished) return;
    if (Math.abs(svgX(e) - X(vals[4])) < 34) {
      capturePointer(svg, e.pointerId);
      dragging = true;
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || lock || finished) return;
    vals[4] = clamp(xToVal(svgX(e)), 8, 33);
    redraw();
  });
  svg.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    if (phase === 2 && !lock && !finished) judgeExtreme();
  });
  svg.addEventListener("pointercancel", () => (dragging = false));

  const avgBtn = el("button", { class: "mq6-btn mq6-pulse", text: "평균 계산", attrs: { type: "button" } });
  avgBtn.addEventListener("click", onAvgTap);
  ctl.appendChild(avgBtn);

  drawAxis();
  redraw();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
