// isoFoldLab, 접기 실험실(중2 수학 Ⅳ L1 기함, 책 142~144쪽). 이 단원의 심장 '증명의 필요성'을
// 3국면으로 체험한다: ① 이등변삼각형을 반으로 접어 두 밑각이 포개짐을 관찰(+접은 선의 수직이등분 관찰)
// ② 모양을 바꿔 또 접기 → "세상의 이등변삼각형은 무한개, 전부는 못 접는다" 판정
// ③ 증명 조립: 각 A의 이등분선 → 합동 근거 3개 수집(순환 논법 함정 카드 포함) → SAS 도장 →
//    ∠B=∠C 확정 → 모양이 계속 바뀌어도 결론이 유지되는 피날레(관찰은 유한, 증명은 무한을 한 방에).
//    도장·대응각·피날레는 자동 진행이 아니라 걸음마다 유저 버튼으로 확인한다(실사용 피드백).
// '증명' 단어는 국면 ② 판정의 답에서 처음 등장, 정식 정의는 다음 concept 몫.
// 접기 순간 ∠B·∠C 라벨은 페이드 아웃(포개짐 라벨과 겹쳐 안 읽히던 실사용 피드백),
// "포개짐!"은 접은 선 위 중앙에 흰 할로 텍스트로 얹는다.
// rAF 금지(CSS 트랜지션 + setTimeout 체인, 타이머 Set). 스타일: math2.css .ifl-* 섹션.
import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { angleArc, dot, polar, ptLabel, rightMark, tickMark } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface LabStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 꼭지각 프리셋(레그 길이 고정 → 반폭·높이 계산). */
const SHAPES = [
  { apex: 52, name: "보통" },
  { apex: 32, name: "뾰족" },
  { apex: 84, name: "넓적" },
] as const;
const LEG = 158;
const CX = 170;
const BASE_Y = 212;

function geom(apex: number): { hw: number; h: number; bAng: number } {
  const half = (apex * Math.PI) / 360;
  return { hw: LEG * Math.sin(half), h: LEG * Math.cos(half), bAng: 90 - apex / 2 };
}

export const isoFoldLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as LabStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "fold", label: "접어서 확인", sub: "밑각 포개기" },
    { id: "limit", label: "전부는 못 접어", sub: "잠김" },
    { id: "prove", label: "증명 조립", sub: "잠김" },
  ]);

  const board = mboard(540);
  const counter = el("div", { class: "ifl-counter", attrs: { "aria-live": "polite" } });
  const svgWrap = el("div", { class: "mcl-plane" });
  svgWrap.innerHTML =
    `<svg viewBox="0 0 340 250" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<g class="ifl-static"></g><g class="ifl-half"></g><g class="ifl-marks"></g><g class="ifl-badge"></g>` +
    `</svg>`;
  const actions = el("div", { class: "lk-actions" });
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  const panel = el("div", { class: "mq6-panel" }, qline, ctl);
  board.append(counter, svgWrap, actions, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "두 변의 길이가 같은 이등변삼각형이에요. <b>반으로 접기</b>를 눌러 아래 두 각(밑각)을 포개 보세요!",
  });
  host.append(chips.el, helper, board);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = svgWrap.querySelector("svg") as SVGSVGElement;
  const gStatic = svg.querySelector(".ifl-static") as SVGGElement;
  const gHalf = svg.querySelector(".ifl-half") as SVGGElement;
  const gMarks = svg.querySelector(".ifl-marks") as SVGGElement;
  const gBadge = svg.querySelector(".ifl-badge") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let shapeIdx = 0;
  let folded = false;
  let confirms = 0; // 접어서 확인한 모양 수
  let phase: "fold" | "vary" | "limit" | "prove" | "done" = "fold";

  /** 국면 1·2의 삼각형(왼쪽 반 고정 + 오른쪽 반 접힘 그룹)을 그린다.
   *  각 이름 라벨(∠B·∠C)은 접는 순간 페이드 아웃할 수 있게 호와 분리해 둔다.
   *  ∠C 라벨을 접힘 그룹 안에 두면 scaleX(-1)로 글자가 거울상이 되는 함정도 함께 피한다. */
  function paintTriangle(): void {
    const { hw, h, bAng } = geom(SHAPES[shapeIdx].apex);
    const A = { x: CX, y: BASE_Y - h };
    const B = { x: CX - hw, y: BASE_Y };
    const C = { x: CX + hw, y: BASE_Y };
    const lbB = polar(B.x, B.y, 39, bAng / 2);
    const lbC = polar(C.x, C.y, 39, 180 - bAng / 2);
    gStatic.innerHTML =
      `<path d="M${A.x} ${A.y} L${B.x} ${B.y} L${CX} ${BASE_Y} Z" fill="#D9E9F9" stroke="#12579B" stroke-width="2.2" stroke-linejoin="round"/>` +
      angleArc(B.x, B.y, 26, 0, bAng, "#F08C00") +
      `<text class="ifl-lbB" x="${lbB.x.toFixed(1)}" y="${(lbB.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#F08C00" style="transition: opacity .3s">∠B</text>` +
      dot(A.x, A.y, "#12579B") + dot(B.x, B.y, "#12579B") + dot(C.x, C.y, "#12579B") +
      ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(B.x, B.y, "B", -11, 13) + ptLabel(C.x, C.y, "C", 11, 13);
    gHalf.innerHTML =
      `<g class="ifl-flap" style="transform-box: view-box; transform-origin:${CX}px ${BASE_Y}px; transition: transform .85s var(--ease, cubic-bezier(.22,1,.36,1))">` +
      `<path d="M${A.x} ${A.y} L${C.x} ${C.y} L${CX} ${BASE_Y} Z" fill="#BBD7F2" stroke="#12579B" stroke-width="2.2" stroke-linejoin="round"/>` +
      angleArc(C.x, C.y, 26, 180 - bAng, 180, "#0DA5C6") +
      `</g>` +
      `<text class="ifl-lbC" x="${lbC.x.toFixed(1)}" y="${(lbC.y + 4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#0DA5C6" style="transition: opacity .3s">∠C</text>`;
    gMarks.innerHTML = "";
    gBadge.innerHTML = "";
  }

  /** 접기: 오른쪽 반을 접는 선(x=CX 수직선) 기준으로 반전. 각 이름 라벨은 겹치기 전에 끈다. */
  function fold(): void {
    if (folded) return;
    folded = true;
    haptic(HAPTIC.select);
    for (const lb of Array.from(svg.querySelectorAll<SVGTextElement>(".ifl-lbB, .ifl-lbC"))) lb.style.opacity = "0";
    const flap = gHalf.querySelector(".ifl-flap") as SVGGElement;
    flap.style.transform = "scaleX(-1)";
    later(() => {
      const { hw, h, bAng } = geom(SHAPES[shapeIdx].apex);
      gMarks.innerHTML =
        `<line x1="${CX}" y1="${BASE_Y - h}" x2="${CX}" y2="${BASE_Y}" stroke="#C2255C" stroke-width="2" stroke-dasharray="6 4"/>` +
        rightMark(CX, BASE_Y, 90, 11, "#C2255C") +
        tickMark(CX - hw, BASE_Y, CX, BASE_Y, 1, "#C2255C") +
        tickMark(CX, BASE_Y, CX + hw, BASE_Y, 1, "#C2255C") +
        angleArc(CX - hw, BASE_Y, 33, 0, bAng, "#04B45F", undefined, { width: 3.2 }) +
        `<text x="${CX}" y="172" text-anchor="middle" font-size="13.5" font-weight="900" fill="#04B45F" stroke="#FFFFFF" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">포개짐!</text>`;
      haptic(HAPTIC.correct);
      toast("∠C가 ∠B 위에 딱 포개져요. 두 밑각의 크기가 같아요!");
      if (confirms === 0) {
        chips.on("fold", "포개짐!");
        helper.innerHTML =
          "접은 선(빨강)도 봐요. 밑변과 <b>직각</b>으로 만나고 밑변을 <b>반반</b>으로 갈라요. 이제 <b>펼치기</b>!";
      } else {
        helper.innerHTML = "이 모양도 포개져요! <b>펼치기</b>를 눌러 계속해요.";
      }
      confirms += 1;
      updateCounter();
      paintActions();
    }, 900);
  }

  function unfold(): void {
    if (!folded) return;
    folded = false;
    haptic(HAPTIC.tap);
    paintTriangle();
    if (phase === "fold") {
      phase = "vary";
      helper.innerHTML =
        "그런데 방금 건 <b>이 삼각형 하나</b>의 이야기예요. 모양이 다른 이등변삼각형도 그럴까요? <b>다른 모양으로</b>를 눌러요!";
    } else if (phase === "vary" && confirms >= 3) {
      phase = "limit";
      helper.innerHTML = "또 포개졌어요. 그런데 이 확인 놀이, 언제까지 해야 끝날까요?";
      later(askLimit, 500);
    }
    paintActions();
  }

  function updateCounter(): void {
    counter.innerHTML =
      `<span class="ifl-cnt-n">확인한 삼각형 <b>${confirms}개</b></span>` +
      `<span class="ifl-cnt-inf">세상의 이등변삼각형 <b>무한개</b></span>`;
  }

  /** 국면별 조작 버튼. */
  function paintActions(): void {
    clear(actions);
    if (phase === "limit" || phase === "prove" || phase === "done") return;
    const mk = (label: string, fn: () => void, hero = true): HTMLButtonElement => {
      const b = el("button", { class: `ct-btn${hero ? " hero" : ""}`, attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (b.disabled) return;
        fn();
      });
      return b;
    };
    if (!folded) {
      actions.appendChild(mk("반으로 접기", fold));
      if (phase === "vary") {
        actions.appendChild(
          mk("다른 모양으로", () => {
            shapeIdx = (shapeIdx + 1) % SHAPES.length;
            haptic(HAPTIC.tap);
            paintTriangle();
            helper.innerHTML = `<b>${SHAPES[shapeIdx].name}한 이등변삼각형</b>으로 바꿨어요. 이 모양도 밑각이 포개질까요? 접어 보세요!`;
          }, false),
        );
      }
    } else {
      actions.appendChild(mk("펼치기", unfold, false));
    }
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 2: 무한 검증 불가 판정 ── */
  function askLimit(): void {
    qline.innerHTML = "몇 개를 접어 보면 <b>세상 모든 이등변삼각형</b>에서 밑각이 같다고 확신할 수 있을까요?";
    const items = [
      {
        t: "아무리 접어도 부족해요, 모든 경우를 한 방에 끝낼 다른 방법이 필요해요",
        good: true,
        fb: "바로 그거예요! 그 방법의 이름이 증명, 이미 아는 옳은 사실만으로 참임을 밝히는 기술이에요. 지금 바로 조립해 봐요.",
      },
      {
        t: "100개쯤 접으면 충분해요",
        good: false,
        fb: "101번째 삼각형은요? 이등변삼각형은 무한히 많아서 아무리 접어도 '전부'가 될 수 없어요. 관찰은 추측까지, 확신은 다른 무기가 필요해요.",
      },
      {
        t: "3개나 접었으니 이미 충분해요",
        good: false,
        fb: "3개는 '그런 것 같다'는 추측의 근거일 뿐이에요. 확인 안 한 삼각형이 무한개 남아 있죠. 모든 경우를 한 번에 해치우는 무기가 필요해요!",
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
          chips.on("limit", "무한은 못 이겨");
          startProve();
        }, 2400);
      });
      btns.push({ bt, good: !!it.good });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 3: 증명 조립 ── */
  function startProve(): void {
    phase = "prove";
    shapeIdx = 0;
    folded = false;
    const { hw, h } = geom(SHAPES[0].apex);
    const A = { x: CX, y: BASE_Y - h };
    gHalf.innerHTML = "";
    gMarks.innerHTML = "";
    gBadge.innerHTML = "";
    gStatic.innerHTML =
      `<path d="M${A.x} ${A.y} L${CX - hw} ${BASE_Y} L${CX + hw} ${BASE_Y} Z" fill="#EAF3FC" stroke="#12579B" stroke-width="2.4" stroke-linejoin="round"/>` +
      dot(A.x, A.y, "#12579B") + dot(CX - hw, BASE_Y, "#12579B") + dot(CX + hw, BASE_Y, "#12579B") +
      ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(CX - hw, BASE_Y, "B", -11, 13) + ptLabel(CX + hw, BASE_Y, "C", 11, 13);
    helper.innerHTML =
      "무기의 재료는 <b>중1의 삼각형 합동</b>이에요. 먼저 삼각형을 둘로 나눌 <b>보조선</b>부터 그어요!";
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: "각 A를 반반으로 가르는 선 긋기" })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      drawBisector();
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function drawBisector(): void {
    const { hw, h, bAng } = geom(SHAPES[0].apex);
    const A = { x: CX, y: BASE_Y - h };
    const a0 = 270 - SHAPES[0].apex / 2; // 각 A의 왼쪽 변 방향(수학 각도)
    gMarks.innerHTML =
      `<line x1="${A.x}" y1="${A.y}" x2="${CX}" y2="${BASE_Y}" stroke="#C2255C" stroke-width="2.4" stroke-dasharray="${h}" stroke-dashoffset="${h}" style="transition: stroke-dashoffset .8s var(--ease, cubic-bezier(.22,1,.36,1))"/>` +
      dot(CX, BASE_Y, "#C2255C", 3.4) + ptLabel(CX, BASE_Y, "D", 0, 16, "#C2255C") +
      angleArc(A.x, A.y, 26, a0, 270, "#E8A93E") +
      angleArc(A.x, A.y, 26, 270, a0 + SHAPES[0].apex, "#0DA5C6") +
      `<g class="ifl-tint" style="opacity:0; transition: opacity .6s">` +
      `<path d="M${A.x} ${A.y} L${CX - hw} ${BASE_Y} L${CX} ${BASE_Y} Z" fill="#F08C00" opacity=".14"/>` +
      `<path d="M${A.x} ${A.y} L${CX + hw} ${BASE_Y} L${CX} ${BASE_Y} Z" fill="#0DA5C6" opacity=".14"/>` +
      `</g>` +
      angleArc(CX - hw, BASE_Y, 24, 0, bAng, "#F08C00", "∠B") +
      angleArc(CX + hw, BASE_Y, 24, 180 - bAng, 180, "#0DA5C6", "∠C");
    const line = gMarks.querySelector("line") as SVGLineElement;
    later(() => { line.style.strokeDashoffset = "0"; }, 30);
    later(() => {
      (gMarks.querySelector(".ifl-tint") as SVGGElement).style.opacity = "1";
      helper.innerHTML =
        "삼각형이 <b>△ABD</b>(주황)와 <b>△ACD</b>(하늘)로 나뉘었어요. 이 둘이 합동이라는 <b>근거 3개</b>를 아래에서 전부 골라 탭하세요. 가짜 근거도 섞여 있어요!";
      askEvidence();
    }, 950);
  }

  function askEvidence(): void {
    qline.innerHTML = "△ABD와 △ACD가 합동인 근거는? (진짜 근거 3개를 전부 탭)";
    const cards = [
      { id: "side", label: "AB = AC (이등변삼각형이라는 약속)", good: true },
      { id: "angle", label: "∠BAD = ∠CAD (방금 그은 선이 각 A를 반반으로)", good: true },
      { id: "fake", label: "∠B = ∠C (두 밑각이 같으니까)", good: false },
      { id: "common", label: "AD는 공통 (두 삼각형이 함께 쓰는 변)", good: true },
    ];
    const row = el("div", { class: "mq6-choices" });
    let gotCount = 0;
    for (const ev of cards) {
      const bt = el("button", { class: "mq6-choice wide", text: ev.label, attrs: { type: "button" } });
      bt.addEventListener("click", () => {
        if (bt.disabled) return;
        bt.disabled = true;
        if (!ev.good) {
          bt.classList.add("no");
          haptic(HAPTIC.wrong);
          toast("잠깐, ∠B=∠C는 지금 밝히려는 목표예요! 목표를 근거로 쓰면 뱅글뱅글 도는 억지 논리가 돼요. 근거는 이미 아는 사실만.");
          return;
        }
        bt.classList.add("ok");
        haptic(HAPTIC.correct);
        gotCount += 1;
        if (gotCount === 3) {
          toast("근거 완성: 변, 그 사이 각, 변. 중1에서 배운 SAS 합동 조건 그대로예요!");
          helper.innerHTML = "근거 3개가 전부 모였어요. 변·끼인각·변! 이제 직접 <b>합동 도장</b>을 찍어 확정하세요.";
          offerStep("SAS 합동 도장 찍기", stamp);
        }
      });
      row.appendChild(bt);
    }
    clear(ctl);
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /** 국면 3의 걸음 버튼: 결론이 저절로 흐르지 않게 한 걸음씩 유저가 확인한다(실사용 피드백). */
  function offerStep(label: string, fn: () => void): void {
    clear(actions);
    const b = el("button", { class: "ct-btn hero", attrs: { type: "button" } }, el("span", { text: label })) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (b.disabled) return;
      b.disabled = true;
      haptic(HAPTIC.select);
      fn();
    });
    actions.appendChild(b);
    later(() => actions.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  function stamp(): void {
    qline.innerHTML = "";
    clear(ctl);
    clear(actions);
    gBadge.innerHTML =
      `<g class="ifl-stamp" style="transform-box: view-box; transform-origin:170px 118px; transform: scale(2.2); opacity:0; transition: transform .45s var(--spring, cubic-bezier(.34,1.35,.5,1)), opacity .3s">` +
      `<rect x="96" y="96" width="148" height="44" rx="10" fill="#FFFFFF" stroke="#1971C2" stroke-width="2.6"/>` +
      `<text x="170" y="115" text-anchor="middle" font-size="13" font-weight="900" fill="#12579B">△ABD ≡ △ACD</text>` +
      `<text x="170" y="131" text-anchor="middle" font-size="10.5" font-weight="800" fill="#5A6B7E">SAS 합동</text>` +
      `</g>`;
    const st = gBadge.querySelector(".ifl-stamp") as SVGGElement;
    later(() => {
      st.style.opacity = "1";
      st.style.transform = "scale(1)";
      haptic(HAPTIC.done);
    }, 40);
    later(() => {
      helper.innerHTML = "<b>△ABD ≡ △ACD</b> 도장 완료! 합동인 두 삼각형에서 ∠B와 ∠C는 어떤 사이가 됐을까요?";
      offerStep("∠B와 ∠C 확인하기", conclude);
    }, 950);
  }

  function conclude(): void {
    clear(actions);
    const { hw, bAng } = geom(SHAPES[0].apex);
    gBadge.innerHTML +=
      angleArc(CX - hw, BASE_Y, 30, 0, bAng, "#04B45F", "", { width: 3.4 }) +
      angleArc(CX + hw, BASE_Y, 30, 180 - bAng, 180, "#04B45F", "", { width: 3.4 }) +
      `<text x="170" y="242" text-anchor="middle" font-size="13.5" font-weight="900" fill="#04B45F">그러므로 ∠B = ∠C</text>`;
    haptic(HAPTIC.correct);
    toast("합동인 두 삼각형의 대응각이니까요. 접지 않고도 확정!");
    later(() => {
      helper.innerHTML = "∠B = ∠C 확정! 그런데 이 논리, <b>모양이 달라도</b> 통할까요? 마지막 시험이에요.";
      offerStep("모양 바꿔서 시험하기", finaleMorph);
    }, 1400);
  }

  /** 피날레: 꼭지각이 연속으로 변해도(뾰족↔넓적) 결론 유지 — 증명은 무한을 한 방에.
   *  도장·결론 배지를 먼저 걷어낸다(배지가 삼각형을 가려 "마지막 모양만 보이던" 실사용 피드백).
   *  모양 전환은 하드 컷이 아니라 setTimeout 체인 보간(rAF 금지 — chopstick 트윈 문법)으로
   *  삼각형·꼭짓점 라벨·이등분선·초록 두 각이 실제로 "변하면서" 지나간다. */
  function finaleMorph(): void {
    clear(actions);
    gBadge.style.transition = "opacity .3s";
    gBadge.style.opacity = "0";
    later(() => {
      gBadge.innerHTML = "";
      gBadge.style.opacity = "1";
    }, 320);
    const paintMorph = (apex: number): void => {
      const { hw, h, bAng } = geom(apex);
      const A = { x: CX, y: BASE_Y - h };
      const bx = CX - hw;
      const cx = CX + hw;
      gStatic.innerHTML =
        `<path d="M${A.x} ${A.y.toFixed(1)} L${bx.toFixed(1)} ${BASE_Y} L${cx.toFixed(1)} ${BASE_Y} Z" fill="#EAF3FC" stroke="#12579B" stroke-width="2.4" stroke-linejoin="round"/>` +
        dot(A.x, A.y, "#12579B") + dot(bx, BASE_Y, "#12579B") + dot(cx, BASE_Y, "#12579B") +
        ptLabel(A.x, A.y, "A", 0, -10) + ptLabel(bx, BASE_Y, "B", -11, 13) + ptLabel(cx, BASE_Y, "C", 11, 13);
      gMarks.innerHTML =
        `<line x1="${A.x}" y1="${A.y.toFixed(1)}" x2="${CX}" y2="${BASE_Y}" stroke="#C2255C" stroke-width="2" stroke-dasharray="5 4" opacity=".6"/>` +
        angleArc(bx, BASE_Y, 26, 0, bAng, "#04B45F", "", { width: 3 }) +
        angleArc(cx, BASE_Y, 26, 180 - bAng, 180, "#04B45F", "", { width: 3 });
    };
    const legs: [number, number][] = [[52, 32], [32, 84], [84, 52]];
    const STEP = 36;
    const FRAMES = 18;
    const PAUSE = 300;
    const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
    legs.forEach(([from, to], li) => {
      const base = 380 + li * (FRAMES * STEP + PAUSE);
      for (let f = 1; f <= FRAMES; f++) {
        later(() => {
          paintMorph(from + (to - from) * ease(f / FRAMES));
          if (f === FRAMES) haptic(HAPTIC.tap);
        }, base + f * STEP);
      }
    });
    const settled = 380 + legs.length * (FRAMES * STEP + PAUSE);
    later(() => {
      gBadge.innerHTML =
        `<rect x="70" y="14" width="200" height="30" rx="10" fill="#F0FBF5" stroke="#04B45F" stroke-width="2"/>` +
        `<text x="170" y="34" text-anchor="middle" font-size="12.5" font-weight="900" fill="#1E7A31">어떤 모양이든 이 논리는 통해요!</text>`;
    }, settled + 150);
    later(() => {
      phase = "done";
      chips.on("prove", "무한을 한 방에");
      haptic(HAPTIC.done);
      helper.innerHTML =
        "접기(관찰)는 <b>하나씩</b>, 논리는 <b>모든 이등변삼각형을 한 방에</b> 해치워요. 이 무기의 정식 이름을 배우러 가요!";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "이름 붙이러 가기");
    }, settled + 800);
  }

  paintTriangle();
  updateCounter();
  paintActions();
  api.setCTA("증명을 완성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
