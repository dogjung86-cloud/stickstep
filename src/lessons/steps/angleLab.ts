// angleLab, 각도 공방(Ⅳ 기본 도형 — 교과서 148~149쪽 각 ∠AOB·직각·평각).
// 꼭짓점 O·고정변 OB 위에서 가동변 OA를 드래그로 회전(0~180°), "각의 크기 = 회전한 양"을 몸으로 익힌다.
// 미션 4연속(예각 → 직각 90° 스냅 → 둔각 → 평각 180° 스냅). 판정은 pointerup에서만,
// 드래그 중에는 호·각도 숫자·분류 배지를 즉시 갱신한다(트랜지션 없음).
// 모션은 전부 CSS transition/keyframes + setTimeout 체인(타이머는 Set으로 모아 cleanup 일괄 해제). rAF 금지.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { icon } from "../../core/icons";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import {
  GEO,
  polar,
  angleOf,
  arcPath,
  angleArc,
  rightMark,
  dot,
  ptLabel,
  lineSvg,
  capturePointer,
} from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface AngleStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface Mission {
  name: string; // 필 라벨(짧게)
  text: string; // 미션 카드 문구
  check(rd: number): boolean; // 판정은 반올림 정수로(화면 표시와 일치)
  snap?: number; // 성공 시 스냅할 각도
  doneMsg: string;
  hint(rd: number): string; // 미달 시 토스트
}

const MISSIONS: Mission[] = [
  {
    name: "예각",
    text: "예각을 만들어 보세요 (90°보다 작게)",
    check: (rd) => rd > 0 && rd < 90,
    doneMsg: "예각 통과! 뾰족하게 잘 만들었어요.",
    hint: (rd) => `지금 ${rd}°, 90°보다 작아야 예각!`,
  },
  {
    name: "직각",
    text: "정확히 직각! 90°에 맞춰 보세요",
    check: (rd) => rd >= 88 && rd <= 92,
    snap: 90,
    doneMsg: "직각! 크기가 평각의 절반인 각이에요.",
    hint: (rd) => (rd < 88 ? `지금 ${rd}°, 조금만 더 벌려서 90°에!` : `지금 ${rd}°, 조금만 좁혀서 90°에!`),
  },
  {
    name: "둔각",
    text: "둔각을 만들어 보세요 (90°와 180° 사이)",
    check: (rd) => rd > 90 && rd < 180,
    doneMsg: "둔각 통과! 직각과 평각 사이예요.",
    hint: (rd) => (rd <= 90 ? "직각(90°)보다 크게 벌려 보세요!" : "평각(180°)보다는 작아야 둔각!"),
  },
  {
    name: "평각",
    text: "평각을 만들어 보세요, 쭉 펴서 180°",
    check: (rd) => rd >= 177,
    snap: 180,
    doneMsg: "직선처럼 보여도 어엿한 각이에요, 평각!",
    hint: () => "끝까지 쭉! 180°까지 벌려요.",
  },
];

/* 무대 기하(SVG 좌표) */
const W = 340;
const H = 222;
const OX = 170;
const OY = 182;
const ARM = 128; // 변의 길이(그리기용 — 각의 크기와 무관함을 완료 문구가 짚는다)

/* 호 색: 각이 커질수록 그린 → 시안 → 앰버 → 로즈로 점진 변화 */
const STOPS: [number, string][] = [
  [0, GEO.hlD],
  [90, GEO.hlB],
  [132, GEO.hlA],
  [180, GEO.hlC],
];

function mixHex(c0: string, c1: string, t: number): string {
  const ch = (h: string, i: number): number => parseInt(h.slice(i, i + 2), 16);
  const v = (i: number): number => Math.round(ch(c0, i) + (ch(c1, i) - ch(c0, i)) * t);
  return `rgb(${v(1)},${v(3)},${v(5)})`;
}

function arcColor(d: number): string {
  for (let i = 1; i < STOPS.length; i++) {
    if (d <= STOPS[i][0]) {
      const [d0, c0] = STOPS[i - 1];
      const [d1, c1] = STOPS[i];
      return mixHex(c0, c1, (d - d0) / (d1 - d0));
    }
  }
  return GEO.hlC;
}

function classify(rd: number): { name: string; cls: string } {
  if (rd === 180) return { name: "평각", cls: "straight" };
  if (rd === 90) return { name: "직각", cls: "right" };
  return rd < 90 ? { name: "예각", cls: "acute" } : { name: "둔각", cls: "obtuse" };
}

export const angleLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as AngleStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "right", label: "직각 90°", sub: "평각의 절반" },
    { id: "straight", label: "평각 180°", sub: "한 직선" },
    { id: "all", label: "각도 컬렉션", sub: "0/4" },
  ]);

  const board = mboard(420);
  const mission = el("div", { class: "mdr-q mal-mission" });
  const stepsRow = el("div", { class: "mal-steps" });
  MISSIONS.forEach((m, i) => {
    stepsRow.appendChild(
      el(
        "div",
        { class: "mal-step", dataset: { mi: String(i) } },
        el("i", { text: String(i + 1) }),
        el("span", { text: m.name }),
      ),
    );
  });

  const stage = el("div", { class: "mal-stage" });
  const bp = polar(OX, OY, ARM, 0); // 고정변 OB의 끝
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="mal-arc"></g>` +
    // A가 지나는 자취(반원 트랙, 흐린 점선)
    `<path d="${arcPath(OX, OY, ARM, 0, 180)}" stroke="${GEO.faint}" stroke-width="1.5" stroke-dasharray="3 6" fill="none"/>` +
    lineSvg(OX, OY, bp.x, bp.y, GEO.ink, 3) +
    dot(bp.x, bp.y, GEO.pt, 4) +
    ptLabel(bp.x, bp.y, "B", 9, 17, GEO.soft) +
    `<g class="mal-oa"></g><g class="mal-mark"></g>` +
    dot(OX, OY, GEO.pt, 4.5) +
    ptLabel(OX, OY, "O", -13, 16, GEO.soft) +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/></svg>`;
  const read = el("div", { class: "mal-read" });
  const degEl = el("b", { text: "" });
  const badgeEl = el("span", { class: "mal-badge acute", text: "" });
  read.append(degEl, badgeEl);
  stage.appendChild(read);

  board.append(mission, stepsRow, stage);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "무대 아무 곳이나 드래그하면 변 OA가 따라 돌아요. 먼저 예각부터!",
  });
  host.append(chips.el, board, helper);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const gArc = svg.querySelector(".mal-arc") as SVGGElement;
  const gOA = svg.querySelector(".mal-oa") as SVGGElement;
  const gMark = svg.querySelector(".mal-mark") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let theta = 34; // 현재 각(도)
  let mi = 0; // 진행 중인 미션 인덱스
  let locking = false; // 미션 전환 연출 중 판정 잠금
  let finished = false;
  let dragging = false;
  let touched = false; // 첫 조작 전에는 안내 헬퍼 유지
  let markOn = false; // 직각 꺾쇠 표시 상태(재렌더 시 pop 애니 반복 방지)

  function liveLine(rd: number, name: string): string {
    if (rd === 180) return "지금 <b>180°</b> : 평각, 두 변이 한 직선이 됐어요!";
    if (rd === 90) return "지금 딱 <b>90°</b> : 직각이에요!";
    return `지금 <b>${rd}°</b> : ${name}이에요.`;
  }

  function render(): void {
    const rd = Math.round(theta);
    const col = arcColor(theta);
    gArc.innerHTML = angleArc(OX, OY, 46, 0, theta, col, rd >= 16 ? `${rd}°` : undefined, {
      fill: true,
      width: 3,
      labelR: 67,
      fontSize: 12.5,
    });
    const ap = polar(OX, OY, ARM, theta);
    const lp = polar(OX, OY, ARM + 15, theta);
    const knob = polar(OX, OY, ARM - 24, theta);
    gOA.innerHTML =
      lineSvg(OX, OY, ap.x, ap.y, GEO.ink, 3) +
      `<circle cx="${knob.x.toFixed(1)}" cy="${knob.y.toFixed(1)}" r="7.5" fill="#FFFFFF" stroke="${GEO.ink}" stroke-width="2"/>` +
      dot(ap.x, ap.y, GEO.pt, 4) +
      ptLabel(lp.x, lp.y, "A", 0, 4, GEO.ink);
    const wantMark = rd === 90;
    if (wantMark !== markOn) {
      markOn = wantMark;
      gMark.innerHTML = wantMark ? `<g class="mal-pop">${rightMark(OX, OY, 0, 13, GEO.hlB)}</g>` : "";
    }
    const c = classify(rd);
    degEl.textContent = `${rd}°`;
    badgeEl.textContent = c.name;
    badgeEl.className = `mal-badge ${c.cls}`;
    if (touched && !finished) helper.innerHTML = liveLine(rd, c.name);
  }

  function setMission(): void {
    const m = MISSIONS[mi];
    mission.innerHTML = `<span class="mal-k">미션 ${mi + 1}/4</span> ${m.text}`;
    mission.classList.remove("slide");
    void mission.offsetWidth; // 애니메이션 재시작
    mission.classList.add("slide");
    stepsRow.querySelectorAll(".mal-step").forEach((p, i) => p.classList.toggle("now", i === mi));
  }

  function finish(): void {
    finished = true;
    locking = false;
    mission.innerHTML = `<span class="mal-k">완료</span> 각도 컬렉션 완성! 네 가지 각을 모두 만들었어요.`;
    helper.innerHTML = "각의 크기는 변의 길이가 아니라 <b>벌어진 정도, 즉 회전한 양</b>이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  function judge(): void {
    if (finished || locking || mi >= MISSIONS.length) return;
    const m = MISSIONS[mi];
    const rd = Math.round(theta);
    if (!m.check(rd)) {
      haptic(HAPTIC.cross);
      toast(m.hint(rd));
      return;
    }
    locking = true;
    if (m.snap != null) {
      theta = m.snap;
      render();
    }
    haptic(HAPTIC.correct);
    toast(m.doneMsg);
    const pill = stepsRow.querySelector(`[data-mi="${mi}"]`) as HTMLElement;
    pill.classList.remove("now");
    pill.classList.add("done");
    pill.querySelector("i")!.innerHTML = icon("check", 11, { sw: 3.4 });
    mi += 1;
    if (mi < MISSIONS.length) {
      (chips.el.querySelector(`[data-g="all"] span`) as HTMLElement).textContent = `${mi}/4`;
    }
    if (mi === 2) chips.on("right"); // 예각+직각까지 → 목표 1(직각 발견)
    if (mi === MISSIONS.length) {
      chips.on("straight"); // 평각 발견
      chips.on("all", "4/4!");
      later(finish, 700);
      return;
    }
    later(() => {
      locking = false;
      setMission();
    }, 700);
  }

  function pointerAngle(e: PointerEvent): number {
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    let a = angleOf(OX, OY, sx, sy);
    if (a > 180) a = a < 270 ? 180 : 0; // 아래 반평면은 가까운 끝으로
    return clamp(a, 2, 180);
  }

  svg.addEventListener("pointerdown", (e) => {
    dragging = true;
    touched = true;
    capturePointer(svg, e.pointerId);
    theta = pointerAngle(e);
    render();
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    theta = pointerAngle(e);
    render();
  });
  svg.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    theta = pointerAngle(e);
    render();
    judge();
  });
  svg.addEventListener("pointercancel", () => {
    dragging = false;
  });

  setMission();
  render();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
