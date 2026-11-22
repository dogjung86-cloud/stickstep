// [중1 Ⅱ v5] u2l10 foodWebLab: 「생태계에서 생물 한 종류가 사라지면 어떻게 될까?」
// 한 통찰: 생물다양성이 높은 생태계는 한 생물이 사라져도 대신할 생물이 있어 안정적으로 유지된다.
// 무대: 먹이 관계 두 그림을 나란히 놓는다. 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다.
//   (가) 생물 4종류: 토끼풀 → 들쥐 → 족제비 → 수리부엉이 (외길)
//   (나) 온대 숲의 생물 9종류: 도토리나무, 산딸기, 토끼풀 / 다람쥐, 들쥐, 멧토끼 / 족제비, 살모사 / 수리부엉이 (먹이 관계 14갈래, ui/bio6Web.ts)
// 조작: 카드 셋(족제비, 들쥐, 토끼풀). 누르면 두 생태계에서 그 생물이 함께 빠지고, 다시 누르면 돌아온다(한 번에 하나).
//   먹이가 모두 끊긴 생물은 위험해지고, 그 생물만 먹던 생물도 잇달아 위험해진다(아래 규칙으로 계산한다).
//   결과(계산): 족제비를 빼면 (가)는 수리부엉이 위험, (나)는 수리부엉이가 멧토끼와 살모사를 먹어 안전.
//   들쥐를 빼면 (가)는 족제비, 수리부엉이가 차례로 위험, (나)는 족제비와 살모사가 다람쥐를 먹어 안전.
//   토끼풀을 빼면 (가)는 셋 모두 위험, (나)는 들쥐와 멧토끼가 산딸기와 도토리나무를 먹어 안전.
// 흐름: 처음 뺄 때 예측(채점하지 않음) → 셋을 다 빼 보면 확인 버튼 → 판정(채점): (나)의 수리부엉이가 버틴 까닭.
// 규칙: 뺀 생물과 위험해진 생물을 '없는 먹이'로 치고, 먹이가 하나도 남지 않은 생물을 위험으로 표시하기를 더 늘지 않을 때까지 되풀이한다.

import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { FOOD_WEBS, WEB_NAME as NAME, cascade, webGroup, type WebId as Id } from "../../../ui/bio6Web";
import type { StepRenderer } from "../../types";
import { bvBtn, bvCard, bvCards, bvFrame, bvTimers, type BvCard } from "./b6Lab";

interface FwbStep {
  title: string;
  cta?: string;
  curio?: Curio;
}

function stageSvg(): string {
  return `<svg class="fwb-svg" viewBox="0 0 346 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="생물의 종류가 적은 생태계와 많은 생태계의 먹이 관계">
    <rect x="3" y="4" width="87" height="222" rx="13" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)"/>
    <rect x="95" y="4" width="248" height="222" rx="13" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)"/>
    <text x="12" y="23" font-size="13.5" font-weight="800" fill="#fff">(가)</text>
    <text x="12" y="41" font-size="12.5" font-weight="700" fill="#9FB3D1">생물 4종류</text>
    <text x="104" y="23" font-size="13.5" font-weight="800" fill="#fff">(나)</text>
    <text x="131" y="23" font-size="12.5" font-weight="700" fill="#9FB3D1">생물 9종류</text>
    <g class="fwb-res" data-w="A"><rect x="40" y="10" width="46" height="20" rx="10"/><text x="63" y="24.4" text-anchor="middle" font-size="12.5" font-weight="800"></text></g>
    <g class="fwb-res" data-w="B"><rect x="246" y="10" width="90" height="20" rx="10"/><text x="291" y="24.4" text-anchor="middle" font-size="12.5" font-weight="800"></text></g>
    ${webGroup("A")}${webGroup("B")}
  </svg>`;
}

type Key = "weasel" | "mouse" | "clover";
const KEYS: Key[] = ["weasel", "mouse", "clover"];
const SAY_ON: Record<Key, string> = {
  weasel: "(가)의 수리부엉이는 먹이인 족제비가 사라지자 먹을 것이 없어 <b>위험해졌어요</b>. 반면 (나)의 수리부엉이는 멧토끼와 살모사를 먹으며 버텨요.",
  mouse: "(가)는 들쥐가 사라지자 족제비와 수리부엉이까지 <b>연달아 위험해졌어요</b>. 반면 (나)의 족제비와 살모사는 다람쥐를 먹으며 버텨요.",
  clover: "(가)는 토끼풀이 사라지자 모든 생물이 <b>위험해졌어요</b>. 반면 (나)에는 도토리나무와 산딸기가 남아 있어 생태계가 유지돼요.",
};
/** 낱말 뒤의 주격 조사(받침이 있으면 "이", 없으면 "가"). */
const iga = (w: string): string => {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  return c >= 0 && c < 11172 && c % 28 !== 0 ? "이" : "가";
};
const ic = (bg: string, body: string): string => `<svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="34" height="34" rx="10" fill="${bg}"/>${body}</svg>`;
// 카드 그림: 족제비(긴 몸과 꼬리, 밝은 목), 들쥐(둥근 몸, 큰 귀, 가는 꼬리), 토끼풀(잎 석 장과 흰 꽃). 다른 랩 카드와 같은 34×34 문법
const ICON: Record<Key, string> = {
  weasel: ic("#FFF1E0", `<path d="M8.6 20.2C6.2 20.4 4.4 19 3.8 16.2" stroke="#7A4A17" stroke-width="2.4" stroke-linecap="round"/><path d="M4.6 17.6C4.2 16.9 3.9 16.4 3.8 16.2" stroke="#3B220A" stroke-width="2.6" stroke-linecap="round"/><path d="M8 21.4C8 18 11 16.2 15.6 16.2H21.4C24 16.2 25.8 17.4 25.8 19.6C25.8 22.2 23.6 23.6 20.8 23.6H11.6C9.2 23.6 8 22.8 8 21.4Z" fill="#C8873F" stroke="#7A4A17" stroke-width="1.3" stroke-linejoin="round"/><path d="M11.4 23.4V26.2M14.8 23.6V26.4M20 23.6V26.4M23.2 23V25.8" stroke="#7A4A17" stroke-width="1.6" stroke-linecap="round"/><circle cx="25.4" cy="15.4" r="4.4" fill="#C8873F" stroke="#7A4A17" stroke-width="1.3"/><circle cx="23.4" cy="11.6" r="1.7" fill="#C8873F" stroke="#7A4A17" stroke-width="1.1"/><path d="M24 18.2C25.6 19.8 28 19.6 29.4 17.2C28.2 17.6 26 17.8 24 18.2Z" fill="#F7E8D0"/><path d="M29.2 15.8L30.6 16.2" stroke="#3B220A" stroke-width="1.6" stroke-linecap="round"/><circle cx="26.6" cy="14.4" r="1" fill="#2B1A08"/>`),
  mouse: ic("#F2EEE9", `<path d="M9 22.6C6 23.6 3.6 21.8 3.6 18.6" stroke="#8C6E52" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="15.6" cy="20.6" rx="8.4" ry="6" fill="#A68A6D" stroke="#5E4A36" stroke-width="1.3"/><path d="M12 25.8L11.2 27.6M18.6 26.2L19 27.8" stroke="#5E4A36" stroke-width="1.4" stroke-linecap="round"/><circle cx="21.6" cy="11.6" r="3.2" fill="#E9B8A6" stroke="#5E4A36" stroke-width="1.2"/><circle cx="23.4" cy="16.6" r="4.6" fill="#A68A6D" stroke="#5E4A36" stroke-width="1.3"/><path d="M26.6 14.4L30.2 17.4L26.8 19.2" fill="#A68A6D" stroke="#5E4A36" stroke-width="1.2" stroke-linejoin="round"/><circle cx="30" cy="17.3" r="1" fill="#3A2A1C"/><circle cx="24.6" cy="15.4" r=".95" fill="#2A1E12"/><path d="M27.4 18.6L31 19.6M27.2 19.6L30.4 21.4" stroke="#7A6450" stroke-width=".7" stroke-linecap="round"/>`),
  clover: ic("#EAF7E2", `<path d="M17 18.4C17.4 22.4 18.6 26 20.6 29" stroke="#3E8A28" stroke-width="1.8" stroke-linecap="round"/>${[-90, 30, 150]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      const cx = 17 + Math.cos(r) * 5;
      const cy = 14.4 + Math.sin(r) * 5;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="#6CC24A" stroke="#2F7D1C" stroke-width="1.2"/><path d="M${(17 + Math.cos(r) * 2.4).toFixed(1)} ${(14.4 + Math.sin(r) * 2.4).toFixed(1)}L${(17 + Math.cos(r) * 7).toFixed(1)} ${(14.4 + Math.sin(r) * 7).toFixed(1)}" stroke="#B9E59E" stroke-width="1" stroke-linecap="round"/>`;
    })
    .join("")}<circle cx="17" cy="14.4" r="1.4" fill="#2F7D1C"/><circle cx="27.4" cy="24.2" r="3.4" fill="#FFFFFF" stroke="#A9B7A0" stroke-width="1"/><path d="M26 23.4h2.8M25.8 25h3.2" stroke="#DDE6D6" stroke-width=".8"/><path d="M26.4 27.4C25.4 28.6 23.6 29.4 21.6 29.6" stroke="#3E8A28" stroke-width="1.2" stroke-linecap="round"/>`),
};

export const foodWebLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FwbStep;
  const tm = bvTimers();
  // 세 줄 도움말을 처음부터 잡아 둔다(생물을 뺐을 때의 글이 세 줄이다. 랩 도중에 무대가 밀리지 않게)
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "fwb-stage", qCls: "fwb-q", api, tall: true });
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;

  let off: Key | null = null;
  let predicted = false;
  let phase: "play" | "ask" | "done" = "play";
  const tried = new Set<Key>();
  let run = 0;

  const cards = {} as Record<Key, BvCard>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("fwb-card col", { name: `${NAME[k]} 빼 보기`, sub: "두 생태계에서 제거", icon: ICON[k], key: k });
  });
  const cmpBtn = bvBtn("main fwb-cmp", "두 생태계 비교해 정리하기");
  cmpBtn.hidden = true;

  const webEl = (w: "A" | "B"): SVGGElement => svg.querySelector(`.fwb-web[data-w="${w}"]`) as SVGGElement;
  const resEl = (w: "A" | "B"): SVGGElement => svg.querySelector(`.fwb-res[data-w="${w}"]`) as SVGGElement;

  /** 한 생물을 뺀 모습으로 바꾼다(null이면 모두 돌아온다). 위험은 차례대로 번진다. */
  function apply(k: Key | null, instant = false): void {
    off = k;
    run += 1;
    const mine = run;
    (["A", "B"] as const).forEach((w) => {
      const g = webEl(w);
      g.querySelectorAll(".fwb-node").forEach((n) => n.classList.remove("off", "risk"));
      g.querySelectorAll(".fwb-edge").forEach((e) => e.classList.remove("cut"));
      const res = resEl(w);
      res.classList.remove("show", "bad", "good");
      if (!k) {
        host.dataset[w === "A" ? "fwbRiskA" : "fwbRiskB"] = "0";
        return;
      }
      const waves = cascade(FOOD_WEBS[w], k);
      const kill = (id: Id, cls: string): void => {
        g.querySelector(`.fwb-node[data-n="${id}"]`)?.classList.add(cls);
        g.querySelectorAll(`.fwb-edge[data-a="${id}"], .fwb-edge[data-b="${id}"]`).forEach((e) => e.classList.add("cut"));
      };
      kill(k, "off");
      waves.forEach((wave, i) => {
        const fn = (): void => {
          if (mine !== run) return;
          wave.forEach((id) => kill(id, "risk"));
        };
        if (instant) fn();
        else tm.later(fn, 520 * (i + 1));
      });
      const n = waves.flat().length;
      host.dataset[w === "A" ? "fwbRiskA" : "fwbRiskB"] = String(n);
      const show = (): void => {
        if (mine !== run) return;
        (res.querySelector("text") as SVGTextElement).textContent = n ? `위험 ${n}` : w === "B" ? "모두 안전해요" : "위험 0";
        res.classList.add("show", n ? "bad" : "good");
      };
      if (instant) show();
      else tm.later(show, 520 * (waves.length + 1));
    });
    KEYS.forEach((x) => {
      cards[x].on(x === k);
      cards[x].sub(x === k ? "다시 누르면 복원" : "두 생태계에서 제거");
    });
    host.dataset.fwbOff = k ?? "";
    host.dataset.fwbTried = KEYS.filter((x) => tried.has(x)).join(",");
    host.dataset.fwbPhase = phase;
  }

  function toggle(k: Key): void {
    if (off === k) {
      apply(null);
      f.say(`${NAME[k]}${iga(NAME[k])} 생태계로 돌아왔어요. 이번에는 아래에서 <b>다른 생물</b>도 빼 보세요.`);
      return;
    }
    apply(k);
    f.say(SAY_ON[k]);
    if (!tried.has(k)) {
      tried.add(k);
      cards[k].done();
      f.pips(tried.size);
      host.dataset.fwbTried = KEYS.filter((x) => tried.has(x)).join(",");
      if (tried.size === KEYS.length) {
        // 마지막 결과를 볼 시간을 준 뒤 버튼을 띄운다
        tm.later(() => {
          if (phase === "play") cmpBtn.hidden = false;
        }, 2200);
      }
    }
  }

  function press(k: Key): void {
    if (phase !== "play") return;
    haptic(HAPTIC.tap);
    if (!predicted) {
      predicted = true;
      f.say("생물을 빼기 전에 먼저 결과를 예측해 볼까요?");
      f.slot.ask(
        `만약 두 생태계에서 <b>${NAME[k]}</b>${iga(NAME[k])} 갑자기 사라지면 어느 생태계가 더 큰 타격을 입을까요?`,
        [{ t: "생물 종류가 적은 (가) 생태계", ok: true }, { t: "생물 종류가 많은 (나) 생태계" }, { t: "두 생태계 모두 비슷하게 흔들린다" }],
        () => undefined,
        {
          predict: true,
          nextDelay: 650,
          onNext: () => {
            f.slot.showControls();
            toggle(k);
          },
        },
      );
      return;
    }
    toggle(k);
  }
  KEYS.forEach((k) => cards[k].el.addEventListener("click", () => press(k)));

  cmpBtn.addEventListener("click", () => {
    haptic(HAPTIC.tap);
    phase = "ask";
    apply("weasel", true);
    f.say("족제비가 사라진 두 생태계의 모습이에요. 맨 위에 있는 <b>수리부엉이</b>의 상태를 비교해 보세요.");
    f.slot.ask(
      // 360 폭 폰에서도 질문과 보기 셋이 한 화면에 들게 짧게 쓴다(수리부엉이는 매보다 이름이 길다)
      "족제비가 사라져도 (나)의 수리부엉이는 살아남았어요. (가)와 다른 까닭은 무엇인가요?",
      [{ t: "족제비 대신 먹을 수 있는 다른 먹이 생물이 있어서", ok: true }, { t: "(나)의 수리부엉이가 힘이 더 세서" }, { t: "(나)에는 족제비가 더 많이 살아서" }],
      (ok) => api.recordQuiz(ok),
      { why: "생물다양성이 높은 (나)의 수리부엉이는 족제비 말고도 <b>멧토끼와 살모사</b>를 먹을 수 있어요. 먹이 그물의 한 갈래가 끊어져도 다른 갈래가 남아 생태계가 유지돼요.", onNext: finish },
    );
  });

  function finish(): void {
    phase = "done";
    host.dataset.fwbPhase = phase;
    f.pips(4);
    f.say("생물의 종류가 다양해 먹이 그물이 복잡할수록 생물 한 종류가 사라져도 생태계가 쉽게 무너지지 않아요!");
    f.slot.conclude("생물다양성이 낮은 생태계는 한 생물이 사라지면 연쇄적으로 흔들리지만, <b>생물다양성이 높은 생태계</b>는 먹이 그물이 복잡하여 어느 한 생물이 사라져도 <b>대신할 다른 생물</b>이 있기 때문에 안정적으로 유지돼요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, ...KEYS.map((k) => cards[k])), cmpBtn);
  apply(null);
  f.say("화살표는 먹히는 생물(먹이)에서 먹는 생물 쪽을 가리켜요. 아래 카드를 눌러 두 생태계에서 <b>생물을 한 종류씩 빼</b> 보세요.");
  api.setCTA("세 종류의 생물을 모두 하나씩 빼 보세요", { enabled: false });
  return () => tm.clear();
};
