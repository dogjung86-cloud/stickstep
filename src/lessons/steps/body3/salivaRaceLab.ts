// [중2 Ⅵ v3] L2 salivaRaceLab — 「침 vs 증류수 레이스」.
// 한 통찰: 침(아밀레이스)이 녹말을 엿당 같은 당분으로 바꾼다 — L1의 검출 반응이 오늘의 수사 도구.
// (교과서 206~207쪽 탐구 「침의 소화 작용 탐구하기」: (가) 녹말+증류수 / (나) 녹말+침,
//  35~40℃ 물에 담근 뒤 아이오딘·베네딕트 반응으로 비교.)
// 조작: 담그기 버튼(빨리 감기) → 아이오딘 검사 → 판정 → 베네딕트 검사 → 판정 → 온도 판정.
// rAF·캔버스 없음 — SVG 한 장 + 클래스 전환. 타이머는 Set으로 cleanup.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface SlrStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

/** 시험관 한 벌 — id로 좌우 배치, 라벨은 (가)/(나). */
function tube(x: number, tag: "ga" | "na"): string {
  return `<g class="slr-tube slr-${tag}">
    <path d="M${x} 46 v86 a17 17 0 0 0 34 0 v-86" stroke="#8FA0AE" stroke-width="3.2" fill="#FFFFFF" fill-opacity="0.4"/>
    <rect class="slr-liq" x="${x + 2}" y="84" width="30" height="44" fill="#F1EDE0"/>
    <path class="slr-liq-b" d="M${x + 2} 124 a15 15 0 0 0 30 0 Z" fill="#F1EDE0"/>
    <ellipse cx="${x + 17}" cy="84" rx="15" ry="3.6" fill="#FFFFFF" opacity="0.55"/>
    <path d="M${x - 3} 46 h40" stroke="#8FA0AE" stroke-width="3.2" stroke-linecap="round"/>
  </g>`;
}

function stageScene(): string {
  return `<svg viewBox="0 0 340 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="slrBath" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FDEFE0"/><stop offset="1" stop-color="#F7DFC2"/>
      </linearGradient>
    </defs>
    <ellipse cx="170" cy="200" rx="140" ry="8" fill="#2A3A5E" opacity="0.10"/>
    <!-- 온수 수조 -->
    <g class="slr-bathg">
      <path d="M92 128 l8 66 h140 l8 -66" stroke="#D9A76A" stroke-width="3" fill="url(#slrBath)"/>
      <ellipse cx="170" cy="128" rx="78" ry="10" fill="#FBEBD4" stroke="#D9A76A" stroke-width="3"/>
      <path class="slr-steam" d="M136 116 q4 -8 0 -16 M170 120 q4 -8 0 -16 M204 116 q4 -8 0 -16" stroke="#D9C7A8" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0"/>
      <!-- 온도계 -->
      <g class="slr-thermo">
        <rect x="252" y="70" width="10" height="86" rx="5" fill="#FFFFFF" stroke="#B9C2CC" stroke-width="2.4"/>
        <rect class="slr-mercury" x="255" y="130" width="4" height="22" rx="2" fill="#F03E3E"/>
        <circle cx="257" cy="156" r="7" fill="#F03E3E" stroke="#B9C2CC" stroke-width="2.4"/>
        <path d="M266 96 h8 M266 112 h6 M266 128 h8 M266 144 h6" stroke="#B9C2CC" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>
    ${tube(118, "ga")}
    ${tube(188, "na")}
    <!-- 방울(검사 시약) -->
    <g class="slr-dropga"><path d="M131 58 c0 -5 4 -10 4 -10 c0 0 4 5 4 10 a4 4 0 0 1 -8 0 Z" fill="#7B4A12"/></g>
    <g class="slr-dropna"><path d="M201 58 c0 -5 4 -10 4 -10 c0 0 4 5 4 10 a4 4 0 0 1 -8 0 Z" fill="#7B4A12"/></g>
  </svg>`;
}

export const salivaRaceLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as SlrStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge b6", dataset: { g: "iodine" } }, el("b", { text: "아이오딘 단서" }), el("span", { text: "담그기 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "benedict" } }, el("b", { text: "베네딕트 단서" }), el("span", { text: "검사 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "temp" } }, el("b", { text: "온도의 비밀" }), el("span", { text: "판정 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "두 시험관에 <b>같은 녹말 용액</b>을 담고, <b>(가)엔 증류수</b>, <b>(나)엔 침</b>을 넣었어요. 이제 <b>35~40℃ 물</b>에 담가 10분을 기다릴 차례. 아래 버튼으로 시작해요.",
  });

  const board = el("div", { class: "b6-board slr-board", html: stageScene() });
  const labGa = el("div", { class: "slr-tag slr-tag-ga", text: "(가) 녹말+증류수" });
  const labNa = el("div", { class: "slr-tag slr-tag-na", text: "(나) 녹말+침" });
  board.append(labGa, labNa);

  const dipBtn = el("button", { class: "slr-btn", text: "따뜻한 물에 담그기", attrs: { type: "button" } }) as HTMLButtonElement;
  const ioBtn = el("button", { class: "slr-btn", text: "아이오딘 용액 검사", attrs: { type: "button" } }) as HTMLButtonElement;
  const bnBtn = el("button", { class: "slr-btn", text: "베네딕트 검사(+가열)", attrs: { type: "button" } }) as HTMLButtonElement;
  ioBtn.style.display = "none";
  bnBtn.style.display = "none";
  const btnRow = el("div", { class: "slr-btnrow" }, dipBtn, ioBtn, bnBtn);

  const qBox = el("div", { class: "hook-choices slr-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chipEl = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chipEl.classList.add("on");
    chipEl.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "실험 종결! 침 속 소화효소 <b>아밀레이스</b>가 <b>녹말을 엿당 같은 당분으로</b> 분해했어요. 밥을 오래 씹으면 달아지는 이유가 이거랍니다.";
      api.enableCTA(s.cta ?? "소화계 지도 보기");
    }
  }

  const setLiq = (tag: "ga" | "na", c: string): void =>
    board.querySelectorAll(`.slr-${tag} .slr-liq, .slr-${tag} .slr-liq-b`).forEach((n) => n.setAttribute("fill", c));

  // ── 1. 담그기(10분 빨리 감기) ──
  let dipped = false;
  dipBtn.addEventListener("click", () => {
    if (dipped) return;
    dipped = true;
    haptic(HAPTIC.tap);
    dipBtn.disabled = true;
    board.classList.add("warm");
    helper.innerHTML = "<b>35~40℃</b> 물에 두 시험관을 담갔어요. 시간을 빨리 감아 <b>10분 뒤</b>로 가 볼게요…";
    later(() => {
      board.classList.add("waited");
      dipBtn.style.display = "none";
      ioBtn.style.display = "";
      helper.innerHTML = "10분이 지났어요. 겉보기엔 둘 다 그대로인데… 속은 어떨까요? 먼저 <b>아이오딘 용액</b>으로 녹말이 남아 있는지 검사해 봐요.";
      later(() => ioBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }, 1600);
  });

  // ── 2. 아이오딘 검사 ──
  let ioDone = false;
  ioBtn.addEventListener("click", () => {
    if (!dipped || ioDone) return;
    ioDone = true;
    haptic(HAPTIC.tap);
    ioBtn.disabled = true;
    board.classList.add("dripio");
    later(() => {
      board.classList.remove("dripio");
      setLiq("ga", B6.iodine);
      helper.innerHTML = "(가)는 <b>청람색</b>, 녹말이 그대로 남아 있어요!";
      later(() => {
        helper.innerHTML = "(가)는 <b>청람색</b>(녹말 있음), 그런데 침을 넣은 <b>(나)는 색이 변하지 않았어요</b>. 10분 사이 (나)에서 무슨 일이 있었던 걸까요?";
        later(() => {
          b4Ask(
            qBox,
            "침을 넣은 (나)에서 아이오딘 반응이 나타나지 않은 까닭은 뭘까요?",
            [
              { t: "침이 녹말을 다른 물질로 바꿔 놓아서", ok: true },
              { t: "침이 아이오딘 용액의 색을 지워 버려서", ok: false },
              { t: "(나)에는 처음부터 녹말이 없어서", ok: false },
            ],
            (ok) => {
              helper.innerHTML = ok
                ? "그거예요! (나)의 <b>녹말이 사라졌다</b>는 뜻이죠. 침이 녹말을 무언가 다른 것으로 바꿔 놓은 거예요. 그럼 무엇으로 바뀌었을까요? 이어서 <b>베네딕트 검사</b>!"
                : "두 시험관의 녹말 용액은 처음에 <b>똑같이</b> 넣었어요. 달라진 건 침뿐, 침이 <b>녹말을 다른 물질로 바꿔</b> 놓아서 아이오딘이 잡을 녹말이 없어진 거예요. 무엇으로 바뀌었는지 <b>베네딕트 검사</b>로 확인해요!";
              collect("iodine", "(나)의 녹말 실종!");
              later(() => {
                qBox.style.display = "none";
                qBox.innerHTML = "";
                bnBtn.style.display = "";
                bnBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }, 1300);
            },
          );
        }, 700);
      }, 1300);
    }, 800);
  });

  // ── 3. 베네딕트 검사 ──
  let bnDone = false;
  bnBtn.addEventListener("click", () => {
    if (!ioDone || bnDone) return;
    bnDone = true;
    haptic(HAPTIC.tap);
    bnBtn.disabled = true;
    // 새 시험관 세트로 리셋하는 연출(같은 실험을 남은 용액으로) — 색 원복 후 검사
    setLiq("ga", "#F1EDE0");
    setLiq("na", "#F1EDE0");
    helper.innerHTML = "남겨 둔 용액으로 이번엔 <b>베네딕트 용액</b>을 넣고 뜨거운 물에 담가요…";
    board.classList.add("dripbn");
    later(() => {
      board.classList.remove("dripbn");
      board.classList.add("hotbath");
      later(() => {
        setLiq("na", B6.benedict);
        helper.innerHTML = "이번엔 반대! 증류수 (가)는 그대로인데, 침을 넣은 <b>(나)만 황적색</b>이 됐어요. 황적색의 의미는, <b>당분 발견</b>!";
        later(() => {
          b4Ask(
            qBox,
            "두 검사를 종합하면, 침은 녹말을 <b>무엇으로</b> 바꿨을까요?",
            [
              { t: "엿당 같은 당분", ok: true },
              { t: "단백질", ok: false },
              { t: "지방", ok: false },
            ],
            (ok) => {
              api.recordQuiz(ok);
              helper.innerHTML = ok
                ? "정답! 침 속 소화효소 <b>아밀레이스</b>가 녹말을 <b>엿당</b>으로 분해한 거예요. 그런데 마지막 수수께끼, 왜 하필 <b>35~40℃</b> 물에 담갔을까요?"
                : "베네딕트가 잡는 건 <b>당분</b>이에요. 침 속 <b>아밀레이스</b>가 녹말을 <b>엿당</b>으로 분해했답니다. 그런데 마지막 수수께끼, 왜 하필 <b>35~40℃</b> 물에 담갔을까요?";
              collect("benedict", "(나)에 당분 등장!");
              later(() => {
                qBox.style.display = "none";
                qBox.innerHTML = "";
                askTemp();
              }, 1500);
            },
          );
        }, 800);
      }, 1200);
    }, 800);
  });

  function askTemp(): void {
    b4Ask(
      qBox,
      "이 실험에서 물 온도를 <b>35~40℃</b>로 맞춘 까닭은 뭘까요?",
      [
        { t: "우리 몸속 온도와 비슷하게 하려고", ok: true },
        { t: "녹말을 열로 익혀 분해하려고", ok: false },
        { t: "시험관 유리를 소독하려고", ok: false },
      ],
      (ok) => {
        helper.innerHTML = ok
          ? "맞아요! 침은 원래 <b>몸속(체온 안팎)</b>에서 일하는 소화액이니, 실험도 그 온도를 맞춰 준 거예요. 소화효소는 체온 근처에서 가장 활발하답니다."
          : "열로 익히려는 게 아니에요. 35~40℃는 <b>우리 몸속 온도</b>와 비슷한 값이죠. 침이 실제로 일하는 환경을 만들어 준 거예요. 소화효소는 체온 근처에서 가장 활발하답니다.";
        collect("temp", "체온 맞춤 실험!");
      },
    );
  }

  host.append(goalChips, helper, board, btnRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("담그기 버튼부터 눌러 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
