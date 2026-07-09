// anglePairLab, 동위각·엇각 위치 찾기 랩(Ⅳ L8, 교과서 157쪽 "같은 자리, 엇갈린 자리").
// 무대: 평행이 아닌 두 직선 l(수평 −6°)·m(수평 +9°)을 직선 n(62°)이 가로질러 만든 8개 각.
// 라벨은 교과서 관례의 시계 방향: 각 교점에서 위-왼 → 위-오른 → 아래-오른 → 아래-왼 순서로
//   P(n×l) = a·b·c·d, Q(n×m) = e·f·g·h. 이 라벨이어야 교과서 표준 짝
//   (동위각 a-e·b-f·c-g·d-h, 엇각 c-e·d-f)이 기하적으로 정확히 성립한다.
// 미션 5연속: 동위각 2쌍(복제 부채꼴이 n을 따라 미끄러져 겹침) → 엇각 2쌍(두 교점의
//   중간점 기준 180° 회전해 겹침) → 함정(바깥쪽 각 a의 엇각은 없다, [없어요!] 버튼이 정답).
// 오개념 장치: 두 직선이 평행이 아니라서 짝의 크기가 서로 다르다(∠d 68° vs ∠h 53°),
//   미션 ② 직후 "동위각·엇각은 크기가 아니라 위치의 이름"을 헬퍼로 명시한다.
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(rAF 금지), 타이머는 Set으로 cleanup.
// 전용 CSS는 styles/math.css의 .mqp-* 섹션.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, polar, arcPath, angleArc, lineThrough, lineSvg, dot, gsym, normDeg } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface AnglePairStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type AngId = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

interface Zone {
  id: AngId;
  cx: number;
  cy: number;
  a0: number; // 부채꼴 시작(수학 각도, 반시계로 a1까지)
  a1: number;
  mid: number;
  span: number;
}

interface Mission {
  kind: "co" | "alt" | "trap";
  from: AngId;
  target: AngId | null; // null = 함정([없어요!] 버튼이 정답)
  q: string;
  hint: string;
  toastMsg: string;
  helperMsg: string;
}

const NS = "http://www.w3.org/2000/svg";
const TILT_L = -6; // 직선 l 기울기(수학 각도)
const TILT_M = 9; // 직선 m 기울기, 일부러 l과 평행이 아니다
const TILT_N = 62; // 가로지르는 직선 n

export const anglePairLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AnglePairStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "co", label: "동위각", sub: "0/2쌍" },
    { id: "alt", label: "엇각", sub: "0/2쌍" },
    { id: "trap", label: "안쪽만!", sub: "바깥은 없음" },
  ]);

  /* ── 무대 기하: 교점 2곳과 각 8개 ── */
  const Q = { x: 142, y: 186 }; // n×m(아래 교점)
  const P = polar(Q.x, Q.y, 118, TILT_N); // n×l(위 교점), n을 따라 118px 위 = (197.4, 81.8)
  const MID = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 }; // 엇각 회전의 중심

  const zone = (id: AngId, c: { x: number; y: number }, a0: number, a1: number): Zone => {
    const span = normDeg(a1 - a0);
    return { id, cx: c.x, cy: c.y, a0, a1, mid: a0 + span / 2, span };
  };
  // 시계 방향 라벨: 위-왼, 위-오른, 아래-오른, 아래-왼 (c가 아래-오른이어야 엇각 c-e가 성립)
  const ZONES: Record<AngId, Zone> = {
    a: zone("a", P, TILT_N, TILT_L + 180),
    b: zone("b", P, TILT_L, TILT_N),
    c: zone("c", P, TILT_N + 180, TILT_L),
    d: zone("d", P, TILT_L + 180, TILT_N + 180),
    e: zone("e", Q, TILT_N, TILT_M + 180),
    f: zone("f", Q, TILT_M, TILT_N),
    g: zone("g", Q, TILT_N + 180, TILT_M),
    h: zone("h", Q, TILT_M + 180, TILT_N + 180),
  };
  const dDeg = Math.round(ZONES.d.span); // 68
  const hDeg = Math.round(ZONES.h.span); // 53

  const A = (k: string): string => gsym(k, "angle");

  const MISSIONS: Mission[] = [
    {
      kind: "co",
      from: "a",
      target: "e",
      q: `${A("a")}와 같은 위치에 있는 각(동위각)을 탭!`,
      hint: "교차점에서 같은 방향 모퉁이를 찾아요",
      toastMsg: "같은 모퉁이 발견!",
      helperMsg: "교차로가 달라도 <b>같은 모퉁이</b>, 그래서 동위각(같을 동, 자리 위)이에요!",
    },
    {
      kind: "co",
      from: "d",
      target: "h",
      q: `${A("d")}의 동위각은?`,
      hint: "교차점에서 같은 방향 모퉁이를 찾아요",
      toastMsg: "동위각 2쌍 완성!",
      helperMsg:
        `어라, ${A("d")}는 ${dDeg}°인데 ${A("h")}는 ${hDeg}°네요? 괜찮아요, 동위각·엇각은 ` +
        "크기가 아니라 <b>위치의 이름</b>이거든요. 크기가 언제 같아지는지는 다음 레슨의 비밀!",
    },
    {
      kind: "alt",
      from: "c",
      target: "e",
      q: `${A("c")}와 엇갈린 위치에 있는 각(엇각)을 탭!`,
      hint: "두 직선 사이 안쪽, 반대편 대각!",
      toastMsg: "엇갈린 짝 발견!",
      helperMsg: "두 직선 사이 <b>안쪽에서 서로 엇갈린 짝</b>! 그래서 엇각이라고 해요.",
    },
    {
      kind: "alt",
      from: "d",
      target: "f",
      q: `${A("d")}의 엇각은?`,
      hint: "두 직선 사이 안쪽, 반대편 대각!",
      toastMsg: "엇각 2쌍 완성!",
      helperMsg: `${A("d")}와 ${A("f")}도 안쪽에서 엇갈린 짝이에요. 크기는 역시 제각각, 엇각도 위치의 이름이니까요!`,
    },
    {
      kind: "trap",
      from: "a",
      target: null,
      q: `그럼 ${A("a")}의 엇각은 어디일까요?`,
      hint: "그 각은 아니에요. 바깥쪽 각에도 엇갈린 짝이 있을까요?",
      toastMsg: "함정 통과!",
      helperMsg:
        `맞아요! 엇각은 두 직선 사이 <b>안쪽 각(${A("c")}, ${A("d")}, ${A("e")}, ${A("f")})</b>끼리만 ` +
        "생각해요. 바깥쪽 각은 엇각이 없어요!",
    },
  ];

  /* ── 무대 SVG 조립 ── */
  const wedge = (z: Zone, r: number): string =>
    `M${z.cx.toFixed(1)} ${z.cy.toFixed(1)} L${arcPath(z.cx, z.cy, r, z.a0, z.a1).slice(1)} Z`;

  const zoneSvg = (z: Zone): string => {
    const lp = polar(z.cx, z.cy, 46, z.mid);
    return (
      `<g class="mqp-zone" data-ang="${z.id}" role="button" aria-label="각 ${z.id}">` +
      `<path class="mqp-hit" d="${wedge(z, 46)}" fill="transparent"/>` +
      angleArc(z.cx, z.cy, 30, z.a0, z.a1, GEO.soft, undefined, { fill: true, width: 2 }) +
      `<text class="mqp-tag" x="${lp.x.toFixed(1)}" y="${(lp.y + 4).toFixed(1)}" text-anchor="middle">` +
      `∠<tspan font-style="italic">${z.id}</tspan></text>` +
      `</g>`
    );
  };

  const lL = lineThrough(P.x, P.y, TILT_L, 210);
  const lM = lineThrough(Q.x, Q.y, TILT_M, 210);
  const lN = lineThrough(MID.x, MID.y, TILT_N, 128);
  let bg = "";
  bg += lineSvg(lL.x1, lL.y1, lL.x2, lL.y2, GEO.ink, 2.6);
  bg += lineSvg(lM.x1, lM.y1, lM.x2, lM.y2, GEO.ink, 2.6);
  bg += lineSvg(lN.x1, lN.y1, lN.x2, lN.y2, GEO.ink, 2.2);
  const lnLab = (x: number, y: number, t: string): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="12.5" font-weight="700" font-style="italic" fill="#64748B">${t}</text>`;
  bg += lnLab(326, 88, "l") + lnLab(326, 150, "m") + lnLab(240, 25, "n");
  bg += dot(P.x, P.y, GEO.ink, 3) + dot(Q.x, Q.y, GEO.ink, 3);

  const board = mboard(400);
  const qCard = el("div", { class: "mdr-q mqp-q" });
  const svgWrap = el("div", { class: "mqp-stage" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 260" xmlns="${NS}" fill="none">` +
    bg +
    (["a", "b", "c", "d", "e", "f", "g", "h"] as AngId[]).map((id) => zoneSvg(ZONES[id])).join("") +
    `<g class="mqp-fx"></g></svg>`;
  board.append(qCard, svgWrap);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "두 직선 <i>l</i>, <i>m</i> 위로 직선 <i>n</i>이 비스듬히 지나가면서 각이 8개 생겼어요. 미션 카드가 부르는 각을 무대에서 찾아 탭해 보세요!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const fxG = svg.querySelector(".mqp-fx") as SVGGElement;
  const zoneEl = (id: AngId): SVGGElement | null =>
    svg.querySelector(`.mqp-zone[data-ang="${id}"]`) as SVGGElement | null;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let mi = 0;
  let coOk = 0;
  let altOk = 0;
  let locking = false;
  let finished = false;

  const setSub = (id: string, txt: string): void => {
    const sp = chips.el.querySelector(`[data-g="${id}"] span`) as HTMLElement | null;
    if (sp) sp.textContent = txt;
  };

  /* ── 미션 카드 ── */
  function askMission(): void {
    const m = MISSIONS[mi];
    qCard.innerHTML =
      `<div class="mqp-qrow"><span class="mqp-k">미션 ${mi + 1}/5</span>` +
      `<span class="mqp-qt">${m.q}</span></div>`;
    zoneEl(m.from)?.classList.add("src");
    if (m.kind === "trap") {
      const none = el("button", { class: "mqp-none", html: "없어요!", attrs: { type: "button" } });
      none.addEventListener("click", () => {
        if (locking || finished) return;
        succeedTrap(none);
      });
      qCard.appendChild(none);
    }
  }

  /* ── 정답 연출: 복제 부채꼴 비행 ── */
  function fly(m: Mission): void {
    const zf = ZONES[m.from];
    const zt = ZONES[m.target as AngId];
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", wedge(zf, 30));
    p.setAttribute("class", "mqp-fly");
    p.style.transition = "transform .9s var(--ease-out), opacity .4s ease";
    if (m.kind === "alt") {
      // 두 교점의 중간점을 중심으로 180° 회전(px 원점은 view-box 좌표)
      p.style.setProperty("transform-box", "view-box");
      p.style.transformOrigin = `${MID.x.toFixed(1)}px ${MID.y.toFixed(1)}px`;
    }
    fxG.appendChild(p);
    later(() => {
      p.style.transform =
        m.kind === "co"
          ? `translate(${(zt.cx - zf.cx).toFixed(1)}px, ${(zt.cy - zf.cy).toFixed(1)}px)` // n 방향 벡터
          : "rotate(180deg)";
    }, 240);
    later(() => p.classList.add("fade"), 1400);
    later(() => p.remove(), 1850);
  }

  /** 미션 ② 직후: 평행이 아니라 크기가 다름을 각도 수치로 보여준다. */
  function revealDegrees(): void {
    for (const id of ["d", "h"] as AngId[]) {
      const z = ZONES[id];
      const p = polar(z.cx, z.cy, 19, z.mid);
      const t = document.createElementNS(NS, "text");
      t.setAttribute("class", "mqp-deg");
      t.setAttribute("x", p.x.toFixed(1));
      t.setAttribute("y", (p.y + 3).toFixed(1));
      t.setAttribute("text-anchor", "middle");
      t.textContent = `${Math.round(z.span)}°`;
      zoneEl(id)?.appendChild(t);
    }
  }

  function succeed(g: SVGGElement, m: Mission): void {
    locking = true;
    haptic(HAPTIC.correct);
    g.classList.add("hit");
    toast(m.toastMsg);
    if (m.kind === "co") {
      coOk += 1;
      if (coOk < 2) setSub("co", `${coOk}/2쌍`);
      else chips.on("co", "2/2쌍!");
    } else {
      altOk += 1;
      if (altOk < 2) setSub("alt", `${altOk}/2쌍`);
      else chips.on("alt", "2/2쌍!");
    }
    fly(m);
    later(() => {
      helper.innerHTML = m.helperMsg;
      if (mi === 1) revealDegrees();
    }, 1150);
    later(() => {
      zoneEl(m.from)?.classList.remove("src");
      g.classList.remove("hit");
      mi += 1;
      locking = false;
      askMission();
    }, 1800);
  }

  function succeedTrap(btn: HTMLButtonElement): void {
    locking = true;
    haptic(HAPTIC.correct);
    btn.classList.add("ok");
    btn.disabled = true;
    chips.on("trap");
    toast(MISSIONS[mi].toastMsg);
    helper.innerHTML = MISSIONS[mi].helperMsg;
    zoneEl("a")?.classList.remove("src");
    for (const id of ["c", "d", "e", "f"] as AngId[]) zoneEl(id)?.classList.add("in");
    for (const id of ["a", "b", "g", "h"] as AngId[]) zoneEl(id)?.classList.add("dim");
    later(finish, 2300);
  }

  function finish(): void {
    finished = true;
    qCard.innerHTML =
      `<div class="mqp-qrow"><span class="mqp-k">완료</span>` +
      `<span class="mqp-qt">같은 모퉁이는 동위각, 안쪽 엇갈린 짝은 엇각!</span></div>`;
    helper.innerHTML =
      "<b>동위각은 같은 모퉁이, 엇각은 안쪽에서 엇갈린 짝</b>. 크기는 아직 제각각이라는 것, 기억해 두세요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function wrongFlash(g: SVGGElement, hint: string): void {
    haptic(HAPTIC.cross);
    g.classList.remove("no");
    void g.getBoundingClientRect(); // 플래시 애니메이션 재시작
    g.classList.add("no");
    toast(hint);
    later(() => g.classList.remove("no"), 560);
  }

  svg.addEventListener("click", (e) => {
    if (locking || finished) return;
    const g = (e.target as Element | null)?.closest?.(".mqp-zone") as SVGGElement | null;
    if (!g) return;
    const id = (g.dataset.ang ?? "") as AngId;
    const m = MISSIONS[mi];
    if (m.kind === "trap") {
      wrongFlash(g, m.hint); // 함정: 어떤 부채꼴을 탭해도 오답
      return;
    }
    if (id === m.target) succeed(g, m);
    else if (id === m.from) {
      haptic(HAPTIC.tap);
      toast("그 각이 바로 기준 각이에요. 짝을 찾아요!");
    } else wrongFlash(g, m.hint);
  });

  askMission();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
