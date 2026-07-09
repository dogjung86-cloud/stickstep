// walkLab, 외각의 합 걷기 랩(Ⅴ 평면도형 — 교과서 192~193쪽 다각형의 외각의 크기의 합).
// 국면 3개: 1 울퉁불퉁 오각형 둘레를 스틱맨이 걷기(버튼마다 한 변 + 모퉁이 회전, 회전 게이지 누적,
//   모퉁이 각은 제각각인데 완주하면 딱 360°) → 2 삼각형 코스로 재확인(코스가 달라도 360°) →
//   3 정팔각형 미션(한 모퉁이에 똑같이 나누면 360÷8=45°, 블록 코딩과 같은 원리).
// 스틱맨 이동은 CSS transform 트랜지션, 회전 각 표기는 반올림 보정(마지막 모퉁이가 잔여분 흡수, 합 360 고정).
// rAF 금지, 타이머는 Set 일괄 해제.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, angleOf, normDeg, arcPath } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface WalkStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 252;

/* 코스(볼록 다각형, 걷는 순서대로) — 반올림 검산: 외각 합이 정확히 360이 되도록 마지막이 잔여 흡수 */
const PENTA = [
  { x: 62, y: 196 },
  { x: 182, y: 222 },
  { x: 294, y: 176 },
  { x: 252, y: 62 },
  { x: 98, y: 50 },
];
const TRI = [
  { x: 70, y: 196 },
  { x: 282, y: 172 },
  { x: 152, y: 58 },
];

/** 스틱맨(걷는 자세) — 진행 방향 headDeg(수학 각도)를 향해 회전. */
function walker(headDeg: number): string {
  return (
    `<g class="mwk-man" transform-origin="0 0">` +
    `<g transform="rotate(${(-headDeg + 90).toFixed(1)})">` +
    `<circle cx="0" cy="-22" r="6.4" fill="#243040"/>` +
    `<path d="M0 -16 V4 M0 -10 L9 -18 M0 -10 L-9 -3 M0 4 L-7 15 M0 4 L8 13" stroke="#243040" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
    `</g></g>`
  );
}

export const walkLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as WalkStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "penta", label: "오각형 한 바퀴", sub: "합 ?°" },
    { id: "tri", label: "코스를 바꿔도", sub: "합 ?°" },
    { id: "octa", label: "똑같이 나누면", sub: "360÷n" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mwk-stage" });
  const panel = el("div", { class: "mwk-panel" });
  const gauge = el("div", { class: "mwk-gauge", html: `돈 각도 합계 <b>0°</b>` });
  const inst = el("div", { class: "mwk-inst" });
  const ctl = el("div", { class: "mwk-ctl" });
  panel.append(inst, gauge, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "훅의 로봇청소기처럼, 이번엔 <b>내가 직접</b> 다각형 둘레를 걸어요. 모퉁이에서 몸을 돌린 만큼이 쌓여요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let course = PENTA;
  let leg = 0; // 다음에 걸을 변 번호(0 = 시작점에서 첫 변)
  let sum = 0; // 표시용 누적(반올림 보정)
  let finished = false;
  let lock = false;

  /** 변 i의 진행 방향(수학 각도). */
  const heading = (i: number): number => {
    const a = course[i % course.length];
    const b = course[(i + 1) % course.length];
    return angleOf(a.x, a.y, b.x, b.y);
  };
  /** 모퉁이 i(도착 꼭짓점 (i+1)%n)에서의 외각(회전량, 반올림). 마지막 모퉁이는 360 잔여 흡수. */
  function turns(): number[] {
    const nleg = course.length;
    const raw: number[] = [];
    for (let i = 0; i < nleg; i++) {
      let d = normDeg(heading((i + 1) % nleg) - heading(i));
      if (d > 180) d -= 360; // (-180,180]
      raw.push(Math.abs(d));
    }
    const r = raw.map((v) => Math.round(v));
    const diff = 360 - r.reduce((a, b) => a + b, 0);
    r[r.length - 1] += diff;
    return r;
  }

  function buildStage(): void {
    const path = "M" + course.map((p) => `${p.x} ${p.y}`).join(" L") + " Z";
    stage.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
      `<path d="${path}" stroke="${GEO.faint}" stroke-width="3" stroke-linejoin="round" stroke-dasharray="7 7"/>` +
      course.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${GEO.ink}"/>`).join("") +
      `<circle cx="${course[0].x}" cy="${course[0].y}" r="9" fill="none" stroke="#2F9E44" stroke-width="2.4"/>` +
      `<text x="${course[0].x - 16}" y="${course[0].y + 20}" font-size="11" font-weight="800" fill="#1E7A31">출발</text>` +
      `<g class="mwk-trail"></g><g class="mwk-arcs"></g>` +
      walker(heading(0)) +
      `</svg>`;
    const man = stage.querySelector(".mwk-man") as SVGGElement;
    man.style.transform = `translate(${course[0].x}px, ${course[0].y}px)`;
  }

  function setGauge(): void {
    gauge.innerHTML = `돈 각도 합계 <b>${sum}°</b>`;
  }

  function walkBtn(label: string): HTMLButtonElement {
    const b = el("button", { class: "mwk-btn pulse", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
    clear(ctl);
    ctl.appendChild(b);
    return b;
  }

  /** 변 하나 걷기 + 모퉁이 회전 연출. */
  function doLeg(onDone: () => void): void {
    const nleg = course.length;
    const from = course[leg % nleg];
    const to = course[(leg + 1) % nleg];
    const man = stage.querySelector(".mwk-man") as SVGGElement;
    const inner = man.querySelector("g") as SVGGElement;
    lock = true;
    // 발자국 트레일
    (stage.querySelector(".mwk-trail") as SVGGElement).insertAdjacentHTML(
      "beforeend",
      `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#2F9E44" stroke-width="3.4" stroke-linecap="round" opacity=".8"/>`,
    );
    man.style.transition = "transform .85s ease-in-out";
    man.style.transform = `translate(${to.x}px, ${to.y}px)`;
    later(() => {
      // 모퉁이 회전: 외각 호 + 라벨 + 게이지
      const t = turns()[leg % nleg];
      const h0 = heading(leg % nleg);
      const h1 = heading((leg + 1) % nleg);
      const arcs = stage.querySelector(".mwk-arcs") as SVGGElement;
      // 진행 방향의 연장(h0)에서 새 방향(h1)까지의 쐐기 = 외각
      const back = h0; // 연장선 방향
      const sweepCCW = normDeg(h1 - back) <= 180;
      const a0 = sweepCCW ? back : h1;
      const a1 = sweepCCW ? h1 : back;
      arcs.insertAdjacentHTML(
        "beforeend",
        `<g class="mwk-pop">` +
          `<line x1="${to.x}" y1="${to.y}" x2="${(to.x + 26 * Math.cos((back * Math.PI) / 180)).toFixed(1)}" y2="${(to.y - 26 * Math.sin((back * Math.PI) / 180)).toFixed(1)}" stroke="${GEO.soft}" stroke-width="1.8" stroke-dasharray="4 3"/>` +
          `<path d="${arcPath(to.x, to.y, 17, a0, a1)}" stroke="#E8547E" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
          `<text x="${to.x}" y="${to.y - 24}" text-anchor="middle" font-size="11.5" font-weight="900" fill="#E8547E">+${t}°</text>` +
          `</g>`,
      );
      inner.setAttribute("transform", `rotate(${(-h1 + 90).toFixed(1)})`);
      sum += t;
      setGauge();
      haptic(HAPTIC.tap);
      leg += 1;
      lock = false;
      onDone();
    }, 950);
  }

  function runCourse(chipId: "penta" | "tri", after: () => void): void {
    const nleg = course.length;
    const btn = walkBtn("다음 모퉁이로");
    const step1 = (): void => {
      if (leg >= nleg) return;
      btn.disabled = true;
      doLeg(() => {
        if (leg >= nleg) {
          // 완주
          haptic(HAPTIC.done);
          toast(`제자리로! 합계 딱 ${sum}°`);
          chips.on(chipId, "360°!");
          inst.innerHTML = `모퉁이 각은 제각각이어도, 완주하면 <b>한 바퀴 = 360°</b>`;
          later(after, 1800);
        } else {
          btn.disabled = false;
          btn.textContent = leg === nleg - 1 ? "마지막 모퉁이!" : "다음 모퉁이로";
        }
      });
    };
    btn.addEventListener("click", () => {
      if (lock || finished) return;
      haptic(HAPTIC.tap);
      step1();
    });
  }

  function startPenta(): void {
    course = PENTA;
    leg = 0;
    sum = 0;
    buildStage();
    setGauge();
    inst.innerHTML = `버튼을 눌러 <b>한 변씩</b> 걸어요. 모퉁이에서 돈 각도가 게이지에 쌓여요`;
    runCourse("penta", startTri);
  }

  function startTri(): void {
    if (finished) return;
    course = TRI;
    leg = 0;
    sum = 0;
    buildStage();
    setGauge();
    inst.innerHTML = `코스 교체, 이번엔 <b>삼각형</b>! 모퉁이가 적으면 합계도 작아질까요?`;
    helper.innerHTML = "모퉁이가 3개뿐이지만 한 번에 도는 각이 커요. 확인해 봐요!";
    runCourse("tri", startOcta);
  }

  /* ── 국면 3: 정팔각형 미션 ── */
  function startOcta(): void {
    if (finished) return;
    inst.innerHTML = `미션: <b>정팔각형</b> 코스는 모퉁이 8개에서 <b>똑같은 각도</b>로 돌아요. 합계는 어차피 <b>360°</b>, 그걸 8모퉁이가 공평하게 나누면 한 모퉁이에 몇 도?`;
    helper.innerHTML = "방금 두 코스에서 확인한 그 법칙이 힌트예요!";
    clear(ctl);
    const row = el("div", { class: "mwk-choices" });
    [40, 45, 60].forEach((v) => {
      const b = el("button", { class: "mwk-choice", text: `${v}°`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 45) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("octa", "45°");
          inst.innerHTML = `<b>360°÷8=45°</b>! 정n각형의 한 외각은 언제나 360°÷n이에요`;
          later(finish, 1100);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 40 ? "360÷8을 다시 계산해 봐요, 40×8=320이라 모자라요!" : "60°면 6모퉁이 만에 한 바퀴, 그건 정육각형!");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "어떤 다각형이든 바깥 모퉁이 회전의 합은 <b>딱 한 바퀴, 360°</b>. 내각의 합과 달리 n이 늘어도 변하지 않아요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  startPenta();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
