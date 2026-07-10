// probBarLab, 확률 눈금 랩(Ⅵ L5: 확률의 성질 발견). 투명 주머니 속 마카롱 6개의 구성을 바꿔 가며
// "딸기가 나올 확률" 마커가 0~1 눈금 어디에 꽂히는지 지켜본다. meanPullLab 뼈대 계승(칩, helper, 보드).
// 국면: 1 [확률 계산] 딸기 2·초코 4, 마커가 왼쪽 밖에서 1/3 지점으로 미끄러져 꽂힘 →
//   2 [전부 초코로 바꾸기] 전부 브라운으로 물들고 마커 0(절대 일어나지 않는 사건) →
//   3 [전부 딸기로 바꾸기] 전부 레드, 마커 1(반드시 일어나는 사건) →
//   판정 "만들 수 없는 확률은?"(정답 1.5)로 울타리 0≤p≤1을 확정한다.
// 애니는 인라인 CSS 트랜지션+setTimeout 체인(rAF 금지). 마커 이징은 오버슈트 없는 곡선을 쓴다:
// 스프링이면 마커가 잠깐 0 왼쪽/1 오른쪽을 넘어가 "울타리" 개념과 모순되기 때문.
// 눈금·색은 concept의 probLineFig(mathFigures2)와 같은 문법이라 랩과 정리 그림이 이어져 보인다.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips, mfmt } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ProbBarStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type Mac = "str" | "cho";

const W = 340;
const H = 252;
const SY = 198; // 확률 눈금 y
const SX0 = 38;
const SX1 = 302;
const SX = (p: number): number => SX0 + p * (SX1 - SX0);

// 마카롱 자리: 아래 4개 + 위 2개(주머니 안에 옹기종기). 위 2개가 처음의 딸기라 "2개"가 한눈에 읽힌다.
const MACS: [number, number][] = [
  [132, 103], [157, 107], [183, 107], [208, 103],
  [145, 79], [195, 79],
];

const INK = "#2A3648";
const STR_DEEP = "#8F1D1D"; // 딸기(레드) 재질 최암색
const CHO_DEEP = "#4A2E18"; // 초코(브라운) 재질 최암색

const DEFS =
  `<radialGradient id="pbl-str" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#FBB1B9"/><stop offset=".55" stop-color="#E56672"/><stop offset="1" stop-color="#C93A48"/></radialGradient>` +
  `<radialGradient id="pbl-cho" cx=".36" cy=".3" r=".95"><stop offset="0" stop-color="#C89B6E"/><stop offset=".55" stop-color="#96633A"/><stop offset="1" stop-color="#6E4526"/></radialGradient>` +
  `<linearGradient id="pbl-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF2FF" stop-opacity=".85"/><stop offset=".5" stop-color="#DCE9FC" stop-opacity=".38"/><stop offset="1" stop-color="#C7DAF6" stop-opacity=".62"/></linearGradient>` +
  `<linearGradient id="pbl-mk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F98C7E"/><stop offset=".55" stop-color="#E85A4E"/><stop offset="1" stop-color="#C92A2A"/></linearGradient>`;

/** 마카롱 한 개: 딸기·초코 두 얼굴을 겹쳐 두고 opacity 크로스페이드로 "물든다". */
function macaronSvg(x: number, y: number, kind: Mac): string {
  const face = (k: Mac): string =>
    `<g class="pbl-f ${k}" style="opacity:${kind === k ? 1 : 0}">` +
    `<circle cx="${x}" cy="${y}" r="14" fill="url(#pbl-${k})" stroke="${k === "str" ? STR_DEEP : CHO_DEEP}" stroke-width="1.5"/>` +
    `<rect x="${x - 10.5}" y="${y - 1.2}" width="21" height="3.4" rx="1.7" fill="${k === "str" ? "#FFE3E7" : "#E9CDA9"}" opacity=".92"/>` +
    `<ellipse cx="${x - 4.8}" cy="${y - 6}" rx="4.6" ry="2.9" fill="#FFFFFF" opacity=".5" transform="rotate(-20 ${x - 4.8} ${y - 6})"/>` +
    `</g>`;
  return `<g class="pbl-mac">${face("str")}${face("cho")}</g>`;
}

/** 0~1 확률 눈금(정적 배경). 양 끝 캡션의 톤(레드·그린)이 눈금의 의미를 함께 말한다. */
function scaleSvg(): string {
  let out = `<line x1="${SX0 - 8}" y1="${SY}" x2="${SX1 + 8}" y2="${SY}" stroke="#C2CBD6" stroke-width="2.6" stroke-linecap="round"/>`;
  [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
    const major = v === 0 || v === 0.5 || v === 1;
    out += `<line x1="${SX(v).toFixed(1)}" y1="${SY - (major ? 7 : 5)}" x2="${SX(v).toFixed(1)}" y2="${SY + (major ? 7 : 5)}" stroke="${major ? "#8093A8" : "#A9B2C0"}" stroke-width="${major ? 2 : 1.5}"/>`;
  });
  ([[0, "0"], [0.5, "1/2"], [1, "1"]] as [number, string][]).forEach(([v, t]) => {
    out += `<text x="${SX(v).toFixed(1)}" y="${SY + 22}" text-anchor="middle" font-size="11.5" font-weight="900" fill="${INK}">${t}</text>`;
  });
  out += `<text x="${SX0}" y="${SY + 40}" text-anchor="middle" font-size="10" font-weight="800" fill="#C0355C">절대 안 일어남</text>`;
  out += `<text x="${SX1}" y="${SY + 40}" text-anchor="middle" font-size="10" font-weight="800" fill="#0B7A4A">반드시 일어남</text>`;
  return out;
}

export const probBarLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ProbBarStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "calc", label: "계산", sub: "딸기 2개" },
    { id: "zero", label: "확률 0", sub: "전부 초코" },
    { id: "fence", label: "울타리", sub: "못 만드는 값" },
  ]);

  const kinds: Mac[] = ["cho", "cho", "cho", "cho", "str", "str"];

  const board = mboard(560);
  const stage = el("div", { class: "pbl-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" style="width:100%;height:auto;display:block">` +
    `<defs>${DEFS}</defs>` +
    // 투명 주머니: 접촉 그림자 → 유리 몸통 → 마카롱 → 유리 하이라이트(마카롱 위) → 입구 테
    `<ellipse cx="170" cy="133" rx="63" ry="7.5" fill="#2A3A5E" opacity=".1"/>` +
    `<path d="M114 50 C105 116 133 129 170 129 C207 129 235 116 226 50 Z" fill="url(#pbl-glass)" stroke="#9FB4D8" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<g class="pbl-macs">${MACS.map(([x, y], i) => macaronSvg(x, y, kinds[i])).join("")}</g>` +
    `<path d="M124 60 C118 92 125 112 137 121" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".35"/>` +
    `<rect x="106" y="40" width="128" height="13" rx="6.5" fill="url(#pbl-glass)" stroke="#9FB4D8" stroke-width="1.5"/>` +
    scaleSvg() +
    `<g class="pbl-marker" style="transform:translateX(-46px);transition:transform .95s cubic-bezier(.22,1,.36,1)">` +
    `<path d="M0 ${SY - 3} L-9 ${SY - 19} L9 ${SY - 19} Z" fill="url(#pbl-mk)" stroke="${STR_DEEP}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<text class="pbl-mklab" x="0" y="${SY - 26}" text-anchor="middle" font-size="11" font-weight="900" fill="${STR_DEEP}"></text>` +
    `</g>` +
    `</svg>`;

  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", {
    class: "mq6-inst",
    html: "주머니엔 딸기 2개, 초코 4개가 들어 있어요. <b>딸기 마카롱</b>이 나올 확률을 계산해 봐요",
  });
  const gauge = el("div", { class: "mq6-gauge" });
  const eqs = el("div", { class: "mq6-eqs" });
  // 판단 질문 전용 줄: 항상 선택지 버튼 바로 위(mq6 공용 문법)
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, gauge, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "주머니에서 마카롱 한 개를 임의로 꺼내는 상황이에요. 아래 눈금은 확률의 자리, 마커가 어디까지 갈 수 있는지 양 끝을 직접 확인해 봐요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위(전 단원 공통 배치)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;
  const macEls = Array.from(svg.querySelectorAll<SVGGElement>(".pbl-mac"));
  const mark = svg.querySelector(".pbl-marker") as SVGGElement;
  const mklab = svg.querySelector(".pbl-mklab") as SVGTextElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let phase: 1 | 2 | 3 | 4 = 1;
  let finished = false;

  function paintGauge(): void {
    const str = kinds.filter((k) => k === "str").length;
    gauge.innerHTML = `딸기 <b style="color:#C92A2A">${str}</b>개 · 초코 <b style="color:#6E4526">${6 - str}</b>개`;
  }

  /** 구성 바꾸기: 바뀌는 마카롱만 순서대로 물들인다(크로스페이드 스태거). */
  function setMacs(target: Mac): void {
    let order = 0;
    macEls.forEach((slot, i) => {
      if (kinds[i] === target) return;
      kinds[i] = target;
      const delay = order * 70;
      order += 1;
      slot.querySelectorAll<SVGGElement>(".pbl-f").forEach((f) => {
        f.style.transition = `opacity .5s ease ${delay}ms`;
        f.style.opacity = f.classList.contains(target) ? "1" : "0";
      });
    });
  }

  /** 마커 미끄러짐 + 착지 후 값 라벨 갱신. */
  function moveMarker(p: number, label: string): void {
    mark.style.transform = `translateX(${SX(p).toFixed(1)}px)`;
    later(() => {
      mklab.textContent = label;
    }, 980);
  }

  function actionBtn(label: string, aria: string, fn: () => void): HTMLElement {
    const b = el("button", { class: "mq6-btn mq6-pulse", text: label, attrs: { type: "button", "aria-label": aria } });
    b.addEventListener("click", fn);
    return b;
  }

  /** 새 조작 버튼이 랩 중간에 등장하는 지점은 스크롤 보정(전 단원 공통 규칙). */
  function showBtn(label: string, aria: string, fn: () => void): void {
    clear(ctl);
    ctl.appendChild(actionBtn(label, aria, fn));
    later(() => ctl.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  }

  /* ── 국면 1: 딸기 2·초코 4의 확률 계산 ── */
  function onCalc(): void {
    if (phase !== 1 || finished) return;
    phase = 2;
    clear(ctl);
    haptic(HAPTIC.tap);
    moveMarker(1 / 3, "1/3");
    later(() => {
      haptic(HAPTIC.correct);
      toast("마커가 1/3 지점에 콕 꽂혔어요!");
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `딸기가 나올 확률 ${mfmt("2÷6={1/3}")}` }));
      chips.on("calc", "1/3");
      inst.innerHTML = "딸기를 몽땅 없애면 마커는 어디로 갈까요? <b>전부 초코</b>로 바꿔 봐요";
    }, 1050);
    later(() => showBtn("전부 초코로 바꾸기", "전부 초코로", onAllCho), 1900);
  }

  /* ── 국면 2: 전부 초코, 확률 0 ── */
  function onAllCho(): void {
    if (phase !== 2 || finished) return;
    phase = 3;
    clear(ctl);
    haptic(HAPTIC.tap);
    setMacs("cho");
    later(paintGauge, 620);
    later(() => moveMarker(0, "0"), 780);
    later(() => {
      haptic(HAPTIC.correct);
      toast("왼쪽 끝, 더는 내려갈 곳이 없어요!");
      eqs.appendChild(
        el("div", { class: "mq6-eq mq6-pop", html: `딸기가 하나도 없어요: ${mfmt("0÷6=0")}, 절대 일어나지 않는 사건!` }),
      );
      chips.on("zero", "절대 안 일어남");
      inst.innerHTML = "그럼 반대로, <b>전부 딸기</b>라면 어디까지 올라갈까요?";
    }, 1850);
    later(() => showBtn("전부 딸기로 바꾸기", "전부 딸기로", onAllStr), 2700);
  }

  /* ── 국면 3: 전부 딸기, 확률 1 → 판정 ── */
  function onAllStr(): void {
    if (phase !== 3 || finished) return;
    phase = 4;
    clear(ctl);
    haptic(HAPTIC.tap);
    setMacs("str");
    later(paintGauge, 620);
    later(() => moveMarker(1, "1"), 780);
    later(() => {
      haptic(HAPTIC.correct);
      toast("오른쪽 끝, 더는 올라갈 곳이 없어요!");
      eqs.appendChild(el("div", { class: "mq6-eq mq6-pop", html: `전부 딸기: ${mfmt("6÷6=1")}, 반드시 일어나는 사건!` }));
      inst.innerHTML = "0도 1도 직접 만들어 봤어요. 이제 마지막 질문!";
    }, 1850);
    later(askJudge, 2500);
  }

  function askJudge(): void {
    if (finished) return;
    qline.innerHTML = "마카롱을 <b>어떻게 넣어도</b> 만들 수 없는 확률은?";
    helper.innerHTML = "틀려도 괜찮아요, 방금 만든 양 끝을 떠올려 봐요!";
    const row = el("div", { class: "mq6-choices" });
    (["0", "1", "1.5"] as const).forEach((v) => {
      const b = el("button", { class: "mq6-choice", text: v, attrs: { type: "button" } });
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === "1.5") {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "확률은 <b>0에서 1 사이</b>! 분자(딸기 수)가 분모(전체)를 넘을 수 없으니까요",
            }),
          );
          chips.on("fence", "0≤p≤1");
          helper.innerHTML = "마커의 산책로는 0부터 1까지. 어떤 사건이든 확률은 이 울타리 안이에요!";
          later(finish, 1500);
        } else {
          haptic(HAPTIC.cross);
          toast("방금 직접 만들었잖아요! 전부 초코(0), 전부 딸기(1). 만들 수 없는 건 1을 넘는 1.5랍니다.");
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
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  paintGauge();
  ctl.appendChild(actionBtn("확률 계산", "확률 계산", onCalc));
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
