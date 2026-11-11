// [중1 Ⅰ v5] u1l5 cleanLab: 「온실 기체를 줄이려면 무엇을 바꿀까?」
// 한 통찰: 과학기술(태양광 발전, 전기 자동차, 탄소 포집 장치)로 에너지는 그대로 쓰면서 온실 기체를 줄일 수 있다.
// 도입(blanket)이 "기체 층을 얇게 하려면 어떻게 할까요"로 넘긴 물음을 받는다. 하늘의 기체 층이 도입의 담요다.
// 조작: 카드 셋(발전소, 자동차, 공장 굴뚝)을 눌러 바꾼다. 다시 누르면 되돌아간다. 손을 대면 연기와 기체 층, 배출량 막대가 바로 바뀐다.
//       발전소가 석탄인 채 전기 자동차로 바꾸면 발전소 연기가 조금 는다(충전할 전기를 석탄으로 만든다). 틀린 차례도 해 볼 수 있다.
// 흐름: 셋을 모두 바꾼다 → 판정 → 결론.
// 배출량(막대의 길이, 숫자는 화면에 쓰지 않는다): 발전소 45, 자동차 25, 공장 30. 전기 자동차 + 석탄 발전이면 발전소 +10. 포집 뒤 공장 5.
// 가장 적은 상태에도 기체 층은 남는다(온실 기체는 원래 있다).

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import type { StepRenderer } from "../../types";
import { bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "../bio6/b6Lab";

interface CleanStep {
  title: string;
  cta?: string;
}

type Key = "plant" | "car" | "fac";
const KEYS: Key[] = ["plant", "car", "fac"];
const INFO: Record<Key, { name: string; old: string; neo: string }> = {
  plant: { name: "발전소", old: "석탄 발전", neo: "태양광 발전" },
  car: { name: "자동차", old: "휘발유 자동차", neo: "전기 자동차" },
  fac: { name: "공장 굴뚝", old: "연기 그대로", neo: "탄소 포집 장치" },
};

const puffs = (cls: string, x: number, y: number, n = 3, r = 7): string =>
  `<g class="u1c-puffs ${cls}">${Array.from({ length: n }, (_, i) => `<circle class="u1c-puff" style="animation-delay:${(-i * 0.9).toFixed(1)}s" cx="${x + (i % 2 ? 4 : -3)}" cy="${y}" r="${r}" fill="#B9A58F"/>`).join("")}</g>`;

function stageSvg(): string {
  const panel = (x: number): string =>
    `<path d="M${x} 186 l10 -30 h26 l-10 30 z" fill="#2F6FDB" stroke="#9CC4FF" stroke-width="1.2" stroke-linejoin="round"/><path d="M${x + 5} 171 h26 M${x + 18} 156 l-10 30" stroke="#9CC4FF" stroke-width="1"/>`;
  return `<svg viewBox="0 0 346 230" role="img" aria-label="발전소, 자동차, 공장과 하늘의 온실 기체 층">
    <defs>
      <linearGradient id="u1cGas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A27A" stop-opacity=".85"/><stop offset="1" stop-color="#C9A27A" stop-opacity=".12"/></linearGradient>
    </defs>
    <rect class="u1c-gas" x="0" y="0" width="346" height="58" fill="url(#u1cGas)"/>
    <text x="12" y="14" class="u1c-gaslb">온실 기체 층</text>
    <text x="334" y="72" text-anchor="end" class="u1x-lb sm">온실 기체 배출량</text>
    <rect x="234" y="77" width="100" height="8" rx="4" fill="#22344F"/>
    <rect class="u1c-bar" x="234" y="77" width="100" height="8" rx="4" fill="#FF9F43"/>
    <rect x="0" y="190" width="346" height="40" fill="#0F1C33"/>
    <line x1="0" y1="190" x2="346" y2="190" stroke="#2A3E60" stroke-width="1.2"/>

    <g class="u1c-old" data-k="plant">
      <rect x="38" y="108" width="13" height="40" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <rect x="62" y="98" width="13" height="50" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <rect x="22" y="146" width="76" height="44" rx="3" fill="#3A4B68" stroke="#8FA3C2" stroke-width="1.4"/>
      <rect x="32" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="54" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="76" y="158" width="12" height="12" fill="#FFD766" opacity=".8"/>
      ${puffs("p1", 44, 100)}${puffs("p2", 68, 90)}${puffs("extra", 56, 92, 3, 9)}
    </g>
    <g class="u1c-new" data-k="plant">
      ${panel(14)}${panel(44)}${panel(74)}
      <circle cx="96" cy="124" r="9" fill="#FFD766"/><path d="M96 108 v-5 M96 145 v-5 M80 124 h-5 M117 124 h-5 M85 113 l-4 -4 M107 113 l4 -4" stroke="#FFD766" stroke-width="2" stroke-linecap="round"/>
    </g>

    <g class="u1c-old" data-k="car">
      <path d="M134 178 v-12 q0 -4 5 -5 l12 -2 l9 -13 q2 -3 6 -3 h22 q4 0 6 3 l8 13 q10 1 10 8 v11 z" fill="#D9534F" stroke="#FFB3B0" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M163 158 l6 -10 h10 v10 z M183 148 h9 l6 10 h-15 z" fill="#CFE3FF"/>
      <circle cx="154" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/><circle cx="196" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/>
      ${puffs("c1", 126, 174, 3, 5)}
    </g>
    <g class="u1c-new" data-k="car">
      <path d="M134 178 v-12 q0 -4 5 -5 l12 -2 l9 -13 q2 -3 6 -3 h22 q4 0 6 3 l8 13 q10 1 10 8 v11 z" fill="#2FBF71" stroke="#A8F0C8" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M163 158 l6 -10 h10 v10 z M183 148 h9 l6 10 h-15 z" fill="#CFE3FF"/>
      <circle cx="154" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/><circle cx="196" cy="180" r="8" fill="#1B2536" stroke="#C9D5E8" stroke-width="1.6"/>
      <path d="M178 160 l-7 10 h6 l-3 9 l9 -12 h-6 z" fill="#FFF3B0"/>
    </g>

    <g data-k="fac">
      <rect x="270" y="104" width="15" height="46" fill="#5B6B85" stroke="#8FA3C2" stroke-width="1.2"/>
      <path d="M238 190 v-40 l18 -12 v12 l18 -12 v12 l18 -12 v52 z" fill="#3A4B68" stroke="#8FA3C2" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="248" y="166" width="12" height="12" fill="#FFD766" opacity=".8"/><rect x="268" y="166" width="12" height="12" fill="#FFD766" opacity=".8"/>
    </g>
    <g class="u1c-old" data-k="fac">${puffs("f1", 277, 96)}</g>
    <g class="u1c-new" data-k="fac">
      <rect x="262" y="92" width="31" height="18" rx="5" fill="#4C9BFF" stroke="#CFE3FF" stroke-width="1.3"/>
      <path d="M268 97 h19 M268 101 h19 M268 105 h19" stroke="#CFE3FF" stroke-width="1.2"/>
      <path d="M293 101 h18 v47" fill="none" stroke="#CFE3FF" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="300" y="148" width="24" height="42" rx="8" fill="#22436E" stroke="#CFE3FF" stroke-width="1.4"/>
      <circle cx="312" cy="176" r="4" fill="#B9A58F"/><circle cx="308" cy="166" r="3.4" fill="#B9A58F"/><circle cx="316" cy="162" r="3" fill="#B9A58F"/>
    </g>

    <text x="60" y="210" text-anchor="middle" class="u1x-lb">발전소</text>
    <text x="175" y="210" text-anchor="middle" class="u1x-lb">자동차</text>
    <text x="280" y="210" text-anchor="middle" class="u1x-lb">공장</text>
  </svg>`;
}

export const cleanLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as CleanStep;
  const tm = bvTimers();
  host.classList.add("u1x-step");
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "u1c-stage", qCls: "u1c-q", api });
  f.stage.innerHTML = stageSvg();
  const gas = f.stage.querySelector(".u1c-gas") as SVGRectElement;
  const bar = f.stage.querySelector(".u1c-bar") as SVGRectElement;
  const extra = f.stage.querySelector(".u1c-puffs.extra") as SVGGElement;
  const olds = Array.from(f.stage.querySelectorAll<SVGGElement>(".u1c-old"));
  const news = Array.from(f.stage.querySelectorAll<SVGGElement>(".u1c-new"));

  const clean: Record<Key, boolean> = { plant: false, car: false, fac: false };
  let locked = false;
  const cards = Object.fromEntries(KEYS.map((k) => [k, bvCard("col u1c-card", { name: INFO[k].name, sub: INFO[k].old, key: k })])) as Record<Key, BvCard>;

  const total = (): number => (clean.plant ? 0 : 45 + (clean.car ? 10 : 0)) + (clean.car ? 0 : 25) + (clean.fac ? 5 : 30);

  function paint(): void {
    olds.forEach((g) => (g.style.display = clean[g.dataset.k as Key] ? "none" : ""));
    news.forEach((g) => (g.style.display = clean[g.dataset.k as Key] ? "" : "none"));
    extra.style.display = clean.car && !clean.plant ? "" : "none";
    const t = total();
    gas.setAttribute("height", (18 + 0.4 * t).toFixed(1));
    bar.setAttribute("width", String(t));
    bar.setAttribute("fill", t > 60 ? "#FF9F43" : t > 25 ? "#FFD766" : "#63E6BE");
    KEYS.forEach((k) => {
      cards[k].sub(clean[k] ? INFO[k].neo : INFO[k].old);
      cards[k].on(clean[k]);
      cards[k].el.setAttribute("aria-pressed", String(clean[k]));
    });
    host.dataset.u1Total = String(t);
  }

  function sayFor(k: Key): string {
    if (k === "plant") return clean.plant ? "햇빛으로 전기를 만들어요. <b>석탄을 태우지 않아</b> 굴뚝 연기가 사라졌어요." : "다시 석탄을 태워 전기를 만들어요. 굴뚝에서 연기가 나와요.";
    if (k === "car") {
      if (!clean.car) return "다시 휘발유를 태우며 달려요. 배기구에서 연기가 나와요.";
      return clean.plant ? "햇빛으로 만든 전기로 달려요. 자동차에서도 발전소에서도 연기가 없어요." : "달릴 때는 연기가 없어요. 그런데 충전할 전기를 만드느라 <b>발전소 연기</b>가 늘었어요.";
    }
    return clean.fac ? "굴뚝에서 나오는 이산화 탄소를 <b>붙잡아 모아요</b>. 하늘로 올라가는 양이 줄었어요." : "장치를 떼자 굴뚝의 연기가 다시 하늘로 올라가요.";
  }

  KEYS.forEach((k) =>
    cards[k].el.addEventListener("click", () => {
      if (locked) return;
      haptic(HAPTIC.tap);
      clean[k] = !clean[k];
      paint();
      f.say(sayFor(k));
      const n = KEYS.filter((x) => clean[x]).length;
      f.pips(n);
      if (n === KEYS.length) {
        locked = true;
        haptic(HAPTIC.ctaUnlock);
        tm.later(() => f.say("셋을 모두 바꿨어요. <b>기체 층</b>이 얇아지고 배출량 막대가 짧아졌어요."), 1600);
        tm.later(askFinal, 3600);
      }
    }),
  );

  function askFinal(): void {
    f.say("전기도 자동차도 공장도 그대로 쓰고 있어요. 무대를 보고 골라 봐요.");
    f.slot.ask(
      "기체 층이 얇아졌어요. 방금 바꾼 <b>세 가지의 공통점</b>은?",
      [{ t: "하늘로 가는 온실 기체를 줄인다", ok: true }, { t: "에너지를 전혀 쓰지 않게 한다" }, { t: "지하자원을 더 많이 쓰게 한다" }],
      (ok) => api.recordQuiz(ok),
      { why: "전기와 자동차는 그대로 쓰면서 <b>나오는 기체만</b> 줄였어요.", onNext: finish },
    );
  }

  function finish(): void {
    f.pips(4);
    f.say("끝! 아래에서 오늘 알게 된 것을 읽어 봐요.");
    f.slot.conclude("과학기술은 에너지와 환경 문제를 푸는 데 쓰여요. <b>태양광 발전</b>, <b>전기 자동차</b>, <b>탄소 포집 장치</b>가 온실 기체를 줄여요.");
    api.enableCTA(s.cta ?? "다음");
  }

  f.slot.setControls(bvCards(3, cards.plant, cards.car, cards.fac), el("div", { class: "u1x-cap center", text: "카드를 누르면 바뀌고, 다시 누르면 되돌아가요." }));
  paint();
  f.say("카드를 눌러 <b>발전소, 자동차, 공장 굴뚝</b>을 하나씩 바꿔 봐요. 하늘의 기체 층을 지켜봐요.");
  api.setCTA("세 가지를 모두 바꿔 보세요", { enabled: false });
  return () => tm.clear();
};
