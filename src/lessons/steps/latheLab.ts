// latheLab, 회전체 물레(Ⅴ 입체도형 기함 — 교과서 210~213쪽 회전체와 그 성질).
// 미션 레일: 직사각형→원기둥, 직각삼각형→원뿔, 반원→구를 가로 스와이프(물레 돌리기)로 빚는다.
//   회전 잔상 = 프로필을 scaleX(cosθ)로 눌러 겹치는 스냅샷(360° 채우면 실루엣 완성 + 이름 판정).
// 국면 2 단면 탐정: 원뿔을 회전축 포함/수직 두 방향으로 자르기 전 예측 → 단면 확인
//   (포함=이등변삼각형, 수직=원). 국면 3: 사다리꼴 프로필 → 원뿔대.
// rAF 금지: 잔상 갱신은 pointermove에서만, 연출은 CSS transition + setTimeout 체인.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, capturePointer } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LatheStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 252;
const AX = 170; // 회전축 x
const CY = 126; // 무대 중심 y

/* 프로필: 축(x=0) 기준 오른쪽 반단면의 꼭짓점(위→아래). semi는 호를 폴리라인으로. */
interface Profile {
  key: string;
  name: string;
  pts: [number, number][];
  solid: string; // 완성 회전체 이름(정답)
  wrong: [string, string];
  /** 타원을 그릴 y와 반지름(완성 실루엣 장식). */
  rims: [number, number][];
}
const semiPts = (): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i <= 14; i++) {
    const a = -90 + (180 * i) / 14;
    out.push([78 * Math.cos((a * Math.PI) / 180), 78 * Math.sin((a * Math.PI) / 180)]);
  }
  return out;
};
const PROFILES: Profile[] = [
  { key: "rect", name: "직사각형", pts: [[0, -62], [52, -62], [52, 62], [0, 62]], solid: "원기둥", wrong: ["원뿔", "구"], rims: [[-62, 52], [62, 52]] },
  { key: "tri", name: "직각삼각형", pts: [[0, -66], [56, 66], [0, 66]], solid: "원뿔", wrong: ["원기둥", "삼각기둥"], rims: [[66, 56]] },
  { key: "semi", name: "반원", pts: semiPts(), solid: "구", wrong: ["원기둥", "원뿔"], rims: [] },
  { key: "trap", name: "사다리꼴", pts: [[0, -52], [30, -52], [58, 52], [0, 52]], solid: "원뿔대", wrong: ["원뿔", "원기둥"], rims: [[-52, 30], [52, 58]] },
];

export const latheLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LatheStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "make", label: "3종 빚기", sub: "0/3" },
    { id: "cut", label: "단면 탐정", sub: "두 방향" },
    { id: "frus", label: "원뿔대", sub: "사다리꼴" },
  ]);

  const board = mboard(620);
  const stage = el("div", { class: "mlt-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<line x1="${AX}" y1="10" x2="${AX}" y2="${H - 10}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="7 6"/>` +
    `<text x="${AX + 12}" y="20" font-size="11" font-weight="800" fill="${GEO.soft}" font-style="italic">l</text>` +
    `<g class="mlt-ghost"></g><g class="mlt-sil"></g><g class="mlt-prof"></g><g class="mlt-cut"></g>` +
    `</svg>`;
  const gauge = el("div", { class: "mlt-gauge", html: `돌린 각도 <b>0°</b>` });
  const panel = el("div", { class: "mlt-panel" });
  const inst = el("div", { class: "mlt-inst" });
  const ctl = el("div", { class: "mlt-ctl" });
  panel.append(inst, gauge, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "도자기 물레처럼, 평면도형을 <b>축에 붙여 돌리면</b> 입체가 태어나요. 무대를 좌우로 문질러 돌려 봐요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gGhost = svg.querySelector(".mlt-ghost") as SVGGElement;
  const gSil = svg.querySelector(".mlt-sil") as SVGGElement;
  const gProf = svg.querySelector(".mlt-prof") as SVGGElement;
  const gCut = svg.querySelector(".mlt-cut") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let profIdx = 0;
  let spun = 0; // 누적 회전(도)
  let ghostAt = 0; // 마지막 잔상 스냅샷 각
  let made = 0;
  let phase: 1 | 2 | 3 = 1;
  let lock = false;
  let finished = false;
  let dragging = false;
  let lastX = 0;

  const prof = (): Profile => PROFILES[profIdx];

  function profPath(scaleX: number): string {
    const p = prof().pts;
    let d = "";
    p.forEach(([x, y], i) => {
      d += `${i === 0 ? "M" : "L"}${(AX + x * scaleX).toFixed(1)} ${(CY + y).toFixed(1)}`;
    });
    return d + " Z";
  }

  function drawProfile(): void {
    gProf.innerHTML =
      `<path class="mlt-live" d="${profPath(1)}" fill="#2F9E44" fill-opacity=".3" stroke="#1E7A31" stroke-width="2.6" stroke-linejoin="round"/>`;
  }

  /** 라이브 프로필: 현재 회전각 위치로 문짝처럼 눌려 보이게(cos), 뒤쪽이면 옅게. */
  function drawLive(): void {
    const live = gProf.querySelector(".mlt-live") as SVGPathElement | null;
    if (!live) return;
    const c = Math.cos((spun * Math.PI) / 180);
    const back = c < 0;
    live.setAttribute("d", profPath(c === 0 ? 0.02 : c));
    live.setAttribute("stroke", back ? "#8CA0B4" : "#1E7A31");
    live.setAttribute("fill-opacity", back ? ".12" : ".3");
  }

  /** 완성 실루엣: 프로필+미러 채움 + 테두리 타원. */
  function drawSilhouette(): void {
    const p = prof().pts;
    let d = "";
    p.forEach(([x, y], i) => {
      d += `${i === 0 ? "M" : "L"}${(AX + x).toFixed(1)} ${(CY + y).toFixed(1)}`;
    });
    for (let i = p.length - 1; i >= 0; i--) d += ` L${(AX - p[i][0]).toFixed(1)} ${(CY + p[i][1]).toFixed(1)}`;
    let rims = "";
    for (const [y, r] of prof().rims) {
      rims += `<ellipse cx="${AX}" cy="${(CY + y).toFixed(1)}" rx="${r}" ry="${(r * 0.3).toFixed(1)}" stroke="${GEO.ink}" stroke-width="2" fill="none" opacity=".8"/>`;
    }
    gSil.innerHTML =
      `<path d="${d} Z" fill="#2F9E44" fill-opacity=".14" stroke="${GEO.ink}" stroke-width="2.8" stroke-linejoin="round"/>` + rims;
  }

  function addGhost(deg: number): void {
    const c = Math.cos((deg * Math.PI) / 180);
    const back = c < 0;
    gGhost.insertAdjacentHTML(
      "beforeend",
      `<path d="${profPath(c)}" fill="none" stroke="${back ? "#A9B6C6" : "#2F9E44"}" stroke-width="1.5"${back ? ` stroke-dasharray="4 4"` : ""} opacity="${back ? 0.34 : 0.5}" stroke-linejoin="round"/>`,
    );
  }

  function resetLathe(): void {
    spun = 0;
    ghostAt = 0;
    gGhost.innerHTML = "";
    gSil.innerHTML = "";
    gCut.innerHTML = "";
    gauge.innerHTML = `돌린 각도 <b>0°</b>`;
    drawProfile();
  }

  function startMission(): void {
    resetLathe();
    inst.innerHTML = `<b>${prof().name}</b>을 축 <i>l</i>에 붙였어요. 무대를 문질러 <b>한 바퀴(360°)</b> 돌려 보세요`;
    clear(ctl);
  }

  function completeSpin(): void {
    lock = true;
    gGhost.innerHTML = "";
    gProf.innerHTML = "";
    drawSilhouette();
    haptic(HAPTIC.correct);
    toast("한 바퀴 완성! 이 입체의 이름은?");
    inst.innerHTML = `${prof().name}이 빚어 낸 <b>이 입체</b>의 이름은?`;
    const row = el("div", { class: "mlt-choices" });
    const opts = [prof().solid, ...prof().wrong].sort(() => 0.5 - Math.random());
    opts.forEach((name) => {
      const b = el("button", { class: "mlt-choice", text: name, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (name === prof().solid) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          if (phase === 1) {
            made += 1;
            chips.el.querySelector(`[data-g="make"] span`)!.textContent = `${made}/3`;
            if (made >= 3) {
              chips.on("make", "3/3");
              later(startCutPhase, 1400);
            } else {
              profIdx += 1;
              later(() => {
                lock = false;
                startMission();
              }, 1300);
            }
          } else {
            chips.on("frus", "완성!");
            later(finish, 1200);
          }
        } else {
          haptic(HAPTIC.cross);
          toast(
            name.includes("기둥")
              ? "기둥은 위아래가 같은 굵기! 이 실루엣을 다시 봐요."
              : name === "삼각기둥"
                ? "각진 기둥은 다각형을 밀어 만든 것, 돌려 만든 건 매끈해요!"
                : "실루엣의 위아래 모양을 다시 봐요!",
          );
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 국면 2: 단면 탐정(원뿔) ── */
  const cutDone = new Set<string>();
  function startCutPhase(): void {
    phase = 2;
    lock = false;
    profIdx = 1; // 원뿔
    resetLathe();
    gProf.innerHTML = "";
    drawSilhouette();
    inst.innerHTML = `방금 빚은 <b>원뿔</b>을 잘라 볼 차례! 자르는 방향을 골라요`;
    helper.innerHTML = "회전체 단면의 2대 법칙을 몸으로 확인해요. 어느 방향이든 자르기 전에 <b>예측</b> 먼저!";
    const row = el("div", { class: "mlt-choices" });
    [
      { k: "v", label: "회전축을 포함하게 세로로", ans: "이등변삼각형", alt: "원" },
      { k: "h", label: "회전축에 수직으로 가로로", ans: "원", alt: "삼각형" },
    ].forEach(({ k, label, ans, alt }) => {
      const b = el("button", { class: "mlt-choice wide", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (lock || finished || cutDone.has(k)) return;
        lock = true;
        // 예측 묻기
        const ask = el("div", { class: "mlt-choices" });
        const options = [ans, alt].sort(() => 0.5 - Math.random());
        inst.innerHTML = `${label} 자르면 단면은 무슨 모양일까요?`;
        options.forEach((name) => {
          const c = el("button", { class: "mlt-choice", text: name, attrs: { type: "button" } }) as HTMLButtonElement;
          c.addEventListener("click", () => {
            if (name !== ans) {
              haptic(HAPTIC.cross);
              toast(k === "v" ? "세로로 자르면 옆모습 그대로 잘려요!" : "가로로 자르면 뚱뚱한 띠의 테두리 모양!");
              return;
            }
            haptic(HAPTIC.correct);
            ask.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
            c.classList.add("ok");
            // 단면 연출
            if (k === "v") {
              gCut.innerHTML =
                `<path d="M${AX} ${CY - 66} L${AX + 56} ${CY + 66} L${AX - 56} ${CY + 66} Z" fill="#E8547E" fill-opacity=".3" stroke="#E8547E" stroke-width="2.6" stroke-linejoin="round"/>` +
                `<text x="${AX}" y="${CY + 88}" text-anchor="middle" font-size="12" font-weight="800" fill="#E8547E">단면: 이등변삼각형</text>`;
            } else {
              const yCut = CY + 8;
              const rr = 56 * ((yCut - (CY - 66)) / 132);
              gCut.innerHTML =
                `<ellipse cx="${AX}" cy="${yCut}" rx="${rr.toFixed(1)}" ry="${(rr * 0.3).toFixed(1)}" fill="#0DA5C6" fill-opacity=".3" stroke="#0DA5C6" stroke-width="2.6"/>` +
                `<circle cx="${AX + 106}" cy="${CY - 50}" r="${(rr * 0.7).toFixed(1)}" fill="#0DA5C6" fill-opacity=".2" stroke="#0DA5C6" stroke-width="2.2"/>` +
                `<text x="${AX + 106}" y="${CY - 50 + (rr * 0.7) + 16}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0DA5C6">위에서 보면 원!</text>`;
            }
            cutDone.add(k);
            b.classList.add("ok");
            b.disabled = true;
            ask.remove();
            lock = false;
            if (cutDone.size >= 2) {
              chips.on("cut", "두 방향!");
              inst.innerHTML = `수직 단면은 <b>항상 원</b>, 축 포함 단면은 <b>모두 합동</b>인 옆모습!`;
              later(startFrustum, 1900);
            } else {
              inst.innerHTML = `좋아요! 남은 방향으로도 잘라 봐요`;
            }
          });
          ask.appendChild(c);
        });
        ctl.appendChild(ask);
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
  }

  /* ── 국면 3: 원뿔대 ── */
  function startFrustum(): void {
    phase = 3;
    lock = false;
    profIdx = 3; // 사다리꼴
    startMission();
    helper.innerHTML = "마지막 주문! <b>사다리꼴</b>을 돌리면 어떤 그릇이 나올까요?";
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "평면도형 하나 + 축 하나 = 회전체! 어느 방향에서 봐도 똑같은 도자기의 비밀이었어요.";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  /* ── 물레 드래그(가로 스와이프 → 회전) ── */
  svg.addEventListener("pointerdown", (e) => {
    if (lock || finished || phase === 2) return;
    dragging = true;
    lastX = e.clientX;
    capturePointer(svg, e.pointerId);
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging || lock || finished) return;
    const dx = Math.abs(e.clientX - lastX);
    lastX = e.clientX;
    if (spun >= 360) return;
    spun = Math.min(360, spun + dx * 1.15);
    gauge.innerHTML = `돌린 각도 <b>${Math.round(spun)}°</b>`;
    while (ghostAt + 12 <= spun) {
      ghostAt += 12;
      addGhost(ghostAt);
    }
    drawLive();
    if (spun >= 360) {
      dragging = false;
      later(completeSpin, 250);
    }
  });
  svg.addEventListener("pointerup", () => (dragging = false));
  svg.addEventListener("pointercancel", () => (dragging = false));

  startMission();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
