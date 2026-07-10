// isoBuildLab, 각도 조립소(중2 수학 Ⅳ L2, 책 145~146쪽). 밑변 BC를 고정하고 ∠B·∠C를
// 5° 스테퍼로 조종하면 두 반직선의 교점 A가 계산으로 태어난다. 변 AB·AC 길이 리드아웃을
// 지켜보다 "두 각이 같아지는 순간 두 변도 같아진다"를 발견한다(지난 시간 성질의 거꾸로 방향).
// 국면 1(same): ∠B=40°·∠C=65°에서 출발(AB≠AC), 두 각을 같게 → 리드아웃 = 점등 + 코발트 글로우 + 틱.
// 국면 2(again): 직전 달성값과 다른 각도로 다시 같게 → "몇 도든" 일반화.
// 국면 3(state): 발견을 문장으로 판정(mq6), 오답 2종은 방향 반대(지난 성질)·정삼각형 과잉 조건.
// A 좌표는 전부 계산(눈대중 금지): h = BC/(cot∠B + cot∠C), Ax = Bx + h·cot∠B (두 반직선의 교차).
// 판정은 정수 각 비교(∠B===∠C)라 흔들림 없음. 두 각의 합 130° 초과는 dim+토스트("화면을 뚫고 나가요").
// rAF 금지: 재그리기는 SVG innerHTML 교체, 스테퍼 버튼·리드아웃은 DOM 유지. 스타일: math2.css .ibl-* 섹션.
// CSS는 math2.css의 해당 랩 섹션에 병합 완료(단일 진실 공급원).
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO, rad, angleArc, dot, ptLabel, lineSvg, tickMark, gsym } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

// 무대 기하(전부 상수 + 계산). 밑변 BC는 가로 고정, 두 각의 합이 130°일 때도 A가 프레임 안에 남는 치수.
const BX = 75;
const BY = 238;
const CX = 265;
const CY = 238;
const BASE = CX - BX; // 190px
const MIN = 25;
const MAX = 75;
const STEP = 5;
const SUMCAP = 130; // 초과 시 A(y = 238 − h)가 화면 위로 뚫고 나간다
const COBALT = "#1971C2"; // 단원 액센트(이등변 판정 연출)

export const isoBuildLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "same", label: "같게 맞추기", sub: "두 각을 똑같이" },
    { id: "again", label: "다른 각도로도", sub: "잠김" },
    { id: "state", label: "방향 판정", sub: "잠김" },
  ]);

  const board = mboard(500);
  const lenCard = el("div", { class: "mdr-q ibl-len", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 272" xmlns="http://www.w3.org/2000/svg" fill="none"><g class="ibl-scene"></g></svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q m2u4q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(lenCard, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "두 각을 스테퍼로 조절해 <b>∠B와 ∠C를 같게</b> 만들어 보세요. 변의 길이 리드아웃을 지켜봐요!",
  });
  host.append(chips.el, helper, board); // 배치: 칩 → helper(지시) → 보드(사용자 확정 2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gScene = svgWrap.querySelector(".ibl-scene") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let bAng = 40; // ∠B (정수, 5° 스텝)
  let cAng = 65; // ∠C
  let firstEq = -1; // 국면 1에서 처음 달성한 등각값
  let wasEq = false; // 리드아웃 pop 재생용 직전 상태
  let phase: "same" | "again" | "state" | "done" = "same";

  const cot = (d: number): number => 1 / Math.tan(rad(d));

  /** 무대 전체 재그리기(SVG innerHTML 교체) + 리드아웃 갱신. 좌표는 전부 계산. */
  function paint(): void {
    const h = BASE / (cot(bAng) + cot(cAng)); // A의 높이(두 직선 교차)
    const ax = BX + h * cot(bAng);
    const ay = BY - h;
    const rB = rad(bAng);
    const rC = rad(cAng);
    const lenAB = h / Math.sin(rB);
    const lenAC = h / Math.sin(rC);
    const eq = bAng === cAng; // 정수 비교 판정(길이 동치와 완전히 일치)

    // 반직선은 A 너머로 살짝 이어 "교점에서 만난다"를 보여준다(프레임 위 이탈은 계산으로 캡)
    const extB = Math.min(16, Math.max(0, (ay - 6) / Math.sin(rB)));
    const extC = Math.min(16, Math.max(0, (ay - 6) / Math.sin(rC)));
    const tBx = ax + extB * Math.cos(rB);
    const tBy = ay - extB * Math.sin(rB);
    const tCx = ax - extC * Math.cos(rC);
    const tCy = ay - extC * Math.sin(rC);
    // A 라벨은 두 연장선 사이(위쪽 이등분 방향)로 밀어 선과 겹치지 않게
    let mx = Math.cos(rB) - Math.cos(rC);
    let my = -Math.sin(rB) - Math.sin(rC);
    const ml = Math.hypot(mx, my) || 1;
    mx = (mx / ml) * 20;
    my = (my / ml) * 20 + 4;

    let svg = "";
    svg += lineSvg(BX, BY, tBx, tBy, GEO.faint, 2); // ∠B의 반직선(연장부만 보임)
    svg += lineSvg(CX, CY, tCx, tCy, GEO.faint, 2); // ∠C의 반직선
    svg += lineSvg(BX, BY, CX, CY, GEO.ink, 3); // 밑변 BC(고정)
    svg += angleArc(BX, BY, 30, 0, bAng, GEO.hlA, `${bAng}°`, { fill: true, labelR: 47, fontSize: 12, width: 2.6 });
    svg += angleArc(CX, CY, 30, 180 - cAng, 180, GEO.hlB, `${cAng}°`, { fill: true, labelR: 47, fontSize: 12, width: 2.6 });
    if (eq) {
      svg += lineSvg(BX, BY, ax, ay, "rgba(25,113,194,.26)", 10); // 코발트 글로우 언더레이
      svg += lineSvg(CX, CY, ax, ay, "rgba(25,113,194,.26)", 10);
    }
    svg += lineSvg(BX, BY, ax, ay, eq ? COBALT : GEO.ink, eq ? 3.4 : 3); // 변 AB
    svg += lineSvg(CX, CY, ax, ay, eq ? COBALT : GEO.ink, eq ? 3.4 : 3); // 변 AC
    if (eq) {
      svg += tickMark(BX, BY, ax, ay, 1, COBALT); // 같은 길이 틱 1개씩
      svg += tickMark(CX, CY, ax, ay, 1, COBALT);
    }
    svg += dot(BX, BY, GEO.ink, 4) + dot(CX, CY, GEO.ink, 4) + dot(ax, ay, COBALT, 4.5);
    svg += ptLabel(BX, BY, "B", 0, 18) + ptLabel(CX, CY, "C", 0, 18) + ptLabel(ax, ay, "A", mx, my, COBALT);
    gScene.innerHTML = svg;

    const ab = (lenAB / 40).toFixed(1); // 픽셀/40 상대값, 소수 1자리
    const ac = (lenAC / 40).toFixed(1);
    lenCard.innerHTML =
      `<span class="ibl-side">${gsym("AB", "seg")} <b>${ab}</b></span>` +
      `<span class="ibl-cmp">${eq ? "=" : "/"}</span>` +
      `<span class="ibl-side">${gsym("AC", "seg")} <b>${ac}</b></span>` +
      `<span class="ibl-cap">${eq ? "두 변의 길이가 똑같아요!" : "변 AB·AC의 길이를 재는 중"}</span>`;
    lenCard.classList.toggle("eq", eq);
    if (eq && !wasEq) {
      lenCard.classList.remove("mq6-pop");
      void lenCard.offsetWidth; // 애니메이션 재시작
      lenCard.classList.add("mq6-pop");
    }
    wasEq = eq;
    readB.innerHTML = `${gsym("B", "angle")} = <b>${bAng}°</b>`;
    readC.innerHTML = `${gsym("C", "angle")} = <b>${cAng}°</b>`;
  }

  function judge(): void {
    if (bAng !== cAng) return;
    if (phase === "same") {
      firstEq = bAng;
      phase = "again";
      chips.on("same", "변도 같아짐!");
      haptic(HAPTIC.correct);
      toast("두 각이 같아지니 두 변도 똑같아졌어요!");
      const sub = chips.el.querySelector('[data-g="again"] span') as HTMLElement | null;
      if (sub) sub.textContent = "다른 크기로 =";
      helper.innerHTML = `우연일까요? 이번엔 <b>방금(${firstEq}°)과 다른 크기</b>로 두 각을 다시 같게 만들어 보세요.`;
    } else if (phase === "again") {
      if (bAng === firstEq) {
        toast(`방금과 같은 ${firstEq}°예요. 다른 크기로 같게 만들어 봐요!`);
        return;
      }
      phase = "state";
      chips.on("again", "몇 도든!");
      haptic(HAPTIC.correct);
      toast("몇 도든, 두 각이 같으면 이등변!");
      helper.innerHTML = "몇 도로 맞춰도 두 변이 같아져요! 마지막으로, 오늘의 발견을 <b>정확한 문장</b>으로 골라 보세요.";
      updateBtns(); // 판정 국면에선 스테퍼 잠금
      later(askState, 1400);
    }
  }

  /** 판정 질문(mq6 문법): 성질의 방향을 정확히 진술하기. */
  function askState(): void {
    qline.innerHTML = "오늘의 발견을 정확히 말하면?";
    const items = [
      {
        t: "두 변의 길이가 같으면 두 밑각의 크기가 같다",
        good: false,
        fb: "그건 지난 시간에 증명한 성질이에요(방향이 반대!). 오늘은 각에서 출발해 변을 알아냈죠. 화살표의 방향이 달라요.",
      },
      {
        t: "두 내각의 크기가 같으면, 그 삼각형은 두 변의 길이가 같다",
        good: true,
        fb: "정확해요! 변을 재지 않고 각 두 개만 보고도 두 변이 같다고 말할 수 있어요. 오늘의 발견이에요.",
      },
      {
        t: "세 내각이 모두 같아야만 이등변삼각형이 된다",
        good: false,
        fb: "세 각이 모두 같으면 정삼각형까지 가 버려요. 이등변이 되는 데는 두 내각만 같으면 충분해요!",
      },
    ];
    const row = el("div", { class: "mq6-choices" });
    let done = false;
    const btns: { bt: HTMLButtonElement; good: boolean }[] = [];
    for (const it of items) {
      const bt = el("button", { class: "mq6-choice wide", text: it.t, attrs: { type: "button" } }) as HTMLButtonElement;
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
          chips.on("state", "각에서 변으로!");
          phase = "done";
          haptic(HAPTIC.done);
          helper.innerHTML =
            "각 두 개만 재면 <b>변의 길이가 같다</b>는 걸 알 수 있어요. 자와 줄자 없이도요! " +
            "이 발견의 정식 이름이 기다리고 있어요.";
          api.recordQuiz(true);
          api.enableCTA(s.cta ?? "정리하러 가기");
        }, 2000);
      });
      btns.push({ bt, good: it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 스테퍼(∠B −/+ · ∠C −/+): 버튼 DOM 유지, 막힌 방향은 dim + 이유 토스트 ── */
  function stepBtn(which: "b" | "c", d: 1 | -1): HTMLButtonElement {
    const name = which === "b" ? "B" : "C";
    const bt = el(
      "button",
      { class: "ct-btn", attrs: { type: "button", "aria-label": `각 ${name} ${d > 0 ? "키우기" : "줄이기"}` } },
      el("span", { text: d > 0 ? "+" : "−" }),
    ) as HTMLButtonElement;
    bt.addEventListener("click", () => {
      if (phase === "state" || phase === "done") return;
      const cur = which === "b" ? bAng : cAng;
      const other = which === "b" ? cAng : bAng;
      const next = cur + d * STEP;
      if (next < MIN || next > MAX) {
        toast(`각도는 ${MIN}°부터 ${MAX}°까지만 움직일 수 있어요.`);
        return;
      }
      if (next + other > SUMCAP) {
        toast("삼각형이 화면을 뚫고 나가요! 두 각의 합은 130°까지만 돼요.");
        return;
      }
      if (which === "b") bAng = next;
      else cAng = next;
      haptic(HAPTIC.tap);
      paint();
      updateBtns();
      judge();
    });
    return bt;
  }

  const readB = el("span", { class: "ibl-read angb", attrs: { "aria-live": "polite" } });
  const readC = el("span", { class: "ibl-read angc", attrs: { "aria-live": "polite" } });
  const bMinus = stepBtn("b", -1);
  const bPlus = stepBtn("b", 1);
  const cMinus = stepBtn("c", -1);
  const cPlus = stepBtn("c", 1);
  actions.append(
    el("div", { class: "ibl-step" }, bMinus, readB, bPlus),
    el("div", { class: "ibl-step" }, cMinus, readC, cPlus),
  );

  function updateBtns(): void {
    const locked = phase === "state" || phase === "done";
    const mark = (bt: HTMLButtonElement, blocked: boolean): void => {
      bt.classList.toggle("ibl-dim", blocked);
      bt.setAttribute("aria-disabled", String(blocked));
    };
    mark(bMinus, locked || bAng - STEP < MIN);
    mark(bPlus, locked || bAng + STEP > MAX || bAng + STEP + cAng > SUMCAP);
    mark(cMinus, locked || cAng - STEP < MIN);
    mark(cPlus, locked || cAng + STEP > MAX || bAng + cAng + STEP > SUMCAP);
  }

  paint();
  updateBtns();
  api.setCTA("판정까지 마치면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
