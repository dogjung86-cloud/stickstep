// [중2 Ⅵ v3] L3 twoLoopsLab — 「혈액 방울의 두 바퀴」.
// 한 통찰: 한 바퀴 순환에 심장을 두 번 — 온몸순환(좌심실→…→우심방)과 허파순환(우심실→…→좌심방).
// (교과서 216~217쪽 그림 VI-9 「혈액의 순환 경로」의 여행판. 색 = 산소 많음(선홍)/적음(암적).)
// 조작: 갈림길마다 행선지 버튼 2개 중 선택(틀리면 교정) → 토큰 이동(CSS translate) → 판정(b4Ask).
// 그림 관례: 정면 뷰라 화면 왼쪽 = 몸의 오른쪽(우심방·우심실). rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface TlpStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

function stageScene(): string {
  const chamber = (x: number, y: number, label: string, thick: boolean): string =>
    `<rect x="${x}" y="${y}" width="56" height="34" rx="12" fill="#FFF2F3" stroke="#C2626F" stroke-width="${thick ? 5 : 2.6}"/>
     <text x="${x + 28}" y="${y + 21.5}" text-anchor="middle" font-size="12" font-weight="800" fill="#A94854">${label}</text>`;
  const vessel = (d: string, c: string): string => `<path d="${d}" stroke="${c}" stroke-width="11" stroke-linecap="round" fill="none" opacity="0.5"/>`;
  const vlabel = (x: number, y: number, t: string): string =>
    `<g><rect x="${x - 26}" y="${y - 10}" width="52" height="20" rx="10" fill="#FFFFFF" stroke="#E3E8EF" stroke-width="1.6"/>
     <text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="11.5" font-weight="800" fill="#4E5968">${t}</text></g>`;
  return `<svg viewBox="0 0 340 268" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 경로(혈관) : 왼쪽 = 몸의 오른쪽 -->
    ${vessel("M140 122 C60 122 46 190 140 226", "#7F9DC4")}
    ${vessel("M198 226 C296 190 282 122 198 140", "#E05B6E")}
    ${vessel("M140 108 C92 100 88 66 140 44", "#C46A7C")}
    ${vessel("M198 44 C250 66 246 100 198 108", "#7F9DC4")}
    ${vlabel(62, 172, "대정맥")}
    ${vlabel(278, 172, "대동맥")}
    ${vlabel(96, 62, "폐동맥")}
    ${vlabel(246, 62, "폐정맥")}
    <!-- 허파 -->
    <g>
      <path d="M142 18 c-16 0 -26 14 -26 28 c0 10 8 16 16 14 c10 -3 14 -14 14 -24 v-12 c0 -4 -2 -6 -4 -6 Z" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2.8"/>
      <path d="M196 18 c16 0 26 14 26 28 c0 10 -8 16 -16 14 c-10 -3 -14 -14 -14 -24 v-12 c0 -4 2 -6 4 -6 Z" fill="#BBE3F5" stroke="#7CB2D4" stroke-width="2.8"/>
      <text x="169" y="40" text-anchor="middle" font-size="12.5" font-weight="800" fill="#3E759B">허파</text>
    </g>
    <!-- 심장(방 4개) -->
    <g>
      ${chamber(112, 92, "우심방", false)}
      ${chamber(172, 92, "좌심방", false)}
      ${chamber(112, 132, "우심실", true)}
      ${chamber(172, 132, "좌심실", true)}
    </g>
    <!-- 온몸(조직세포) -->
    <g>
      <rect x="112" y="210" width="116" height="40" rx="14" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.8"/>
      <circle cx="140" cy="230" r="8" fill="#FFE1B0" stroke="#D9A85C" stroke-width="2.2"/>
      <circle cx="170" cy="230" r="8" fill="#FFE1B0" stroke="#D9A85C" stroke-width="2.2"/>
      <circle cx="200" cy="230" r="8" fill="#FFE1B0" stroke="#D9A85C" stroke-width="2.2"/>
      <text x="170" y="262" text-anchor="middle" font-size="12" font-weight="800" fill="#A9832B">온몸의 조직세포</text>
    </g>
    <!-- 혈액 방울 토큰 -->
    <g class="tlp-token">
      <circle r="11" fill="${B6.oxyBlood}" stroke="#8F1D2C" stroke-width="2.6"/>
      <circle cx="-3.4" cy="-3.4" r="3.4" fill="#FFFFFF" opacity="0.55"/>
    </g>
  </svg>`;
}

/** 정거장 좌표(토큰 translate 목표) — 방 라벨을 가리지 않게 가장자리로 비껴 둔다. */
const POS: Record<string, [number, number]> = {
  LV: [243, 149],
  aorta: [278, 165],
  body: [170, 230],
  vena: [62, 165],
  RA: [101, 109],
  RV: [101, 149],
  pulmA: [98, 78],
  lung: [169, 62],
  pulmV: [244, 78],
  LA: [243, 109],
};

export const twoLoopsLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as TlpStep;
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
    el("div", { class: "pn-badge b6", dataset: { g: "bodyLoop" } }, el("b", { text: "온몸순환" }), el("span", { text: "출발 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "lungLoop" } }, el("b", { text: "허파순환" }), el("span", { text: "대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "twice" } }, el("b", { text: "심장 몇 번?" }), el("span", { text: "판정 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "당신은 <b>좌심실</b>에서 출발하는 혈액 방울! 산소를 가득 실었어요(선홍색). 첫 갈림길 — 좌심실의 문을 나서면 어느 혈관일까요? 아래에서 골라요.",
  });

  const board = el("div", { class: "b6-board tlp-board", html: stageScene() });
  const badge = el("div", { class: "ftp-badge tlp-badge", text: "" });
  badge.style.opacity = "0";
  board.appendChild(badge);

  const btnA = el("button", { class: "tlp-choice", attrs: { type: "button" } }) as HTMLButtonElement;
  const btnB = el("button", { class: "tlp-choice", attrs: { type: "button" } }) as HTMLButtonElement;
  const choiceRow = el("div", { class: "tlp-choicerow" }, btnA, btnB);

  const qBox = el("div", { class: "hook-choices tlp-q" });
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
        "완주! <b>온몸순환</b>(좌심실→대동맥→온몸→대정맥→우심방)과 <b>허파순환</b>(우심실→폐동맥→허파→폐정맥→좌심방)은 이어진 한 길 — 한 바퀴에 심장을 <b>두 번</b> 지나요.";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  const token = (): SVGGElement => board.querySelector(".tlp-token") as SVGGElement;
  function moveTo(key: string): void {
    const [x, y] = POS[key];
    token().setAttribute("transform", `translate(${x} ${y})`);
  }
  function setBlood(oxy: boolean): void {
    (token().querySelector("circle") as SVGElement).setAttribute("fill", oxy ? B6.oxyBlood : B6.deoxyBlood);
  }
  function showBadge(text: string): void {
    badge.textContent = text;
    badge.style.opacity = "1";
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
    later(() => (badge.style.opacity = "0"), 2100);
  }
  moveTo("LV");

  /** 갈림길 정의 — [정답 라벨, 오답 라벨, 오답 교정문]. */
  const DECISIONS = [
    {
      good: "대동맥으로 나간다",
      bad: "폐동맥으로 나간다",
      fix: "폐동맥은 <b>우심실</b>의 문이에요. 좌심실의 문은 온몸을 향한 가장 굵은 혈관 — <b>대동맥</b>이랍니다.",
      go: (): void => {
        helper.innerHTML = "<b>대동맥</b>을 타고 힘차게 출발! 온몸의 모세혈관으로 향해요.";
        moveTo("aorta");
        later(() => {
          moveTo("body");
          later(() => {
            setBlood(false);
            showBadge("산소·영양소 배달 완료!");
            helper.innerHTML =
              "온몸의 조직세포에 <b>산소와 영양소</b>를 내려 주고, <b>이산화 탄소와 노폐물</b>을 받았어요 — 색이 어두워졌죠(산소 부족). 이제 심장으로 돌아갈 길은?";
            later(nextDecision, 900);
          }, 900);
        }, 800);
      },
    },
    {
      good: "대정맥을 타고 우심방으로",
      bad: "폐정맥을 타고 좌심방으로",
      fix: "폐정맥은 <b>허파에서 오는</b> 길이에요. 온몸을 돈 혈액은 <b>대정맥</b>을 타고 <b>우심방</b>으로 돌아간답니다.",
      go: (): void => {
        helper.innerHTML = "<b>대정맥</b>을 타고 심장으로!";
        moveTo("vena");
        later(() => {
          moveTo("RA");
          later(() => {
            collect("bodyLoop", "좌심실→우심방!");
            helper.innerHTML =
              "<b>우심방</b> 도착 — 온몸순환 완주! 심장 안에서 판막 문을 지나 <b>우심실</b>로 내려가요. 숨 고르고, 다음 여행 준비!";
            later(() => {
              moveTo("RV");
              later(() => {
                helper.innerHTML = "이제 <b>우심실</b>에서 두 번째 출발이에요. 아직 산소가 부족한 상태(암적색) — 어디로 가야 산소를 채울까요?";
                later(nextDecision, 700);
              }, 900);
            }, 1200);
          }, 900);
        }, 800);
      },
    },
    {
      good: "폐동맥으로 나가 허파로",
      bad: "대동맥으로 나가 온몸으로",
      fix: "산소가 부족한 채로 온몸에 또 가면 배달할 산소가 없어요! 우심실의 문은 허파로 가는 <b>폐동맥</b>이랍니다.",
      go: (): void => {
        helper.innerHTML = "<b>폐동맥</b>을 타고 허파로!";
        moveTo("pulmA");
        later(() => {
          moveTo("lung");
          later(() => {
            setBlood(true);
            showBadge("이산화 탄소 내리고, 산소 싣고!");
            helper.innerHTML =
              "허파의 모세혈관에서 <b>이산화 탄소를 내보내고 산소를 받았어요</b> — 다시 선홍색! 이제 심장으로 돌아갈 길은?";
            later(nextDecision, 900);
          }, 900);
        }, 800);
      },
    },
    {
      good: "폐정맥을 타고 좌심방으로",
      bad: "대정맥을 타고 우심방으로",
      fix: "대정맥은 <b>온몸에서 오는</b> 길이에요. 허파에서 온 혈액은 <b>폐정맥</b>을 타고 <b>좌심방</b>으로 들어간답니다.",
      go: (): void => {
        helper.innerHTML = "<b>폐정맥</b>을 타고 심장으로!";
        moveTo("pulmV");
        later(() => {
          moveTo("LA");
          later(() => {
            collect("lungLoop", "우심실→좌심방!");
            helper.innerHTML = "<b>좌심방</b> 도착 — 허파순환 완주! 판막을 지나 <b>좌심실</b>로 내려가면… 처음 그 자리예요.";
            later(() => {
              moveTo("LV");
              later(() => {
                choiceRow.style.display = "none";
                askTwice();
              }, 1000);
            }, 1100);
          }, 900);
        }, 800);
      },
    },
  ];

  let di = -1;
  let moving = false;
  function nextDecision(): void {
    di++;
    if (di >= DECISIONS.length) return;
    const d = DECISIONS[di];
    const flip = Math.random() < 0.5;
    btnA.textContent = flip ? d.bad : d.good;
    btnB.textContent = flip ? d.good : d.bad;
    choiceRow.style.display = "";
    later(() => choiceRow.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
  }
  function pick(btn: HTMLButtonElement): void {
    if (moving || di < 0 || di >= DECISIONS.length) return;
    const d = DECISIONS[di];
    if (btn.textContent === d.good) {
      moving = true;
      haptic(HAPTIC.tap);
      choiceRow.style.display = "none";
      d.go();
      later(() => (moving = false), 600);
    } else {
      haptic(HAPTIC.wrong);
      board.classList.remove("shake");
      void board.offsetWidth;
      board.classList.add("shake");
      helper.innerHTML = d.fix;
    }
  }
  btnA.addEventListener("click", () => pick(btnA));
  btnB.addEventListener("click", () => pick(btnB));
  later(nextDecision, 600);

  let asked = false;
  function askTwice(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "방금 여행처럼, 혈액이 우리 몸을 <b>한 바퀴</b>(온몸+허파) 도는 동안 심장을 <b>몇 번</b> 지날까요?",
      [
        { t: "두 번 — 온몸순환과 허파순환 사이마다", ok: true },
        { t: "한 번 — 출발할 때 한 번뿐", ok: false },
        { t: "네 번 — 방을 지날 때마다 한 번씩", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 온몸을 돌고 <b>한 번</b>(우심방·우심실), 허파를 돌고 <b>또 한 번</b>(좌심방·좌심실) — 두 순환은 이어진 과정이라 심장을 <b>두 번</b> 지나죠."
          : "여행을 되감아 봐요 — 온몸을 돌고 심장에 들렀고(우심방·우심실), 허파를 돌고 또 들렀죠(좌심방·좌심실). 방 4개를 지나지만 심장이라는 역은 <b>두 번</b> 거치는 거랍니다.";
        collect("twice", "심장은 두 번!");
      },
    );
  }

  host.append(goalChips, helper, board, choiceRow, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("갈림길에서 길을 골라 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
