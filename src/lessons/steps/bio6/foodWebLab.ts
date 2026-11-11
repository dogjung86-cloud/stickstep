// [중1 Ⅱ v5] u2l10 foodWebLab: 「생물 하나를 빼면 어떻게 될까?」
// 한 통찰: 생물다양성이 높은 생태계는 한 생물이 사라져도 대신할 생물이 있어 안정적으로 유지된다.
// 무대: 먹이 관계 두 그림을 나란히 놓는다. 화살표는 먹히는 생물에서 먹는 생물 쪽을 가리킨다.
//   (가) 생물 4종류: 벼 → 메뚜기 → 개구리 → 매 (외길)
//   (나) 생물 9종류: 배추, 벼, 옥수수 / 메뚜기, 배추흰나비 / 개구리, 참새 / 뱀 / 매 (먹이 관계 15갈래, 원전 그림 그대로)
// 조작: 카드 셋(개구리, 메뚜기, 벼). 누르면 두 생태계에서 그 생물이 함께 빠지고, 다시 누르면 돌아온다(한 번에 하나).
//   먹이가 모두 끊긴 생물은 위험해지고, 그 생물만 먹던 생물도 잇달아 위험해진다(아래 규칙으로 계산한다).
// 흐름: 처음 뺄 때 예측(채점하지 않음) → 셋을 다 빼 보면 확인 버튼 → 판정(채점): (나)의 매가 버틴 까닭.
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

type Key = "frog" | "hopper" | "rice";
const KEYS: Key[] = ["frog", "hopper", "rice"];
const SAY_ON: Record<Key, string> = {
  frog: "(가)의 매는 먹이가 개구리뿐이라 <b>위험해요</b>. (나)의 매는 참새와 뱀을 먹으며 버텨요.",
  hopper: "(가)는 개구리와 매까지 <b>잇달아 위험해요</b>. (나)의 개구리는 배추흰나비를 먹으며 버텨요.",
  rice: "(가)는 벼가 사라지자 <b>모두 위험해요</b>. (나)에는 배추와 옥수수가 남아 있어요.",
};
const ic = (bg: string, body: string): string => `<svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="34" height="34" rx="10" fill="${bg}"/>${body}</svg>`;
const ICON: Record<Key, string> = {
  frog: ic("#E6F7E0", `<ellipse cx="17" cy="20" rx="10" ry="7" fill="#74B816" stroke="#3E6B0A" stroke-width="1.4"/><circle cx="11.5" cy="12.5" r="3.6" fill="#94D82D" stroke="#3E6B0A" stroke-width="1.4"/><circle cx="22.5" cy="12.5" r="3.6" fill="#94D82D" stroke="#3E6B0A" stroke-width="1.4"/><circle cx="11.5" cy="12.5" r="1.3" fill="#1F2D0A"/><circle cx="22.5" cy="12.5" r="1.3" fill="#1F2D0A"/><path d="M12.5 21.5q4.5 3 9 0" stroke="#3E6B0A" stroke-width="1.3" stroke-linecap="round"/>`),
  hopper: ic("#F1F8DC", `<path d="M7 20c4 -5 11 -6 18 -3 -2 4 -9 6 -18 3z" fill="#A9D154" stroke="#5C7F12" stroke-width="1.4" stroke-linejoin="round"/><path d="M16 19l-3 -8 7 6M22 18l4 -6M9 21l-2 4M14 22l-1 4" stroke="#5C7F12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="23.4" cy="17" r="1.1" fill="#2F4208"/>`),
  rice: ic("#FFF6DB", `<path d="M17 28V13" stroke="#8A9A2F" stroke-width="1.8" stroke-linecap="round"/><path d="M17 20c-5 -1 -7 -4 -8 -8M17 23c5 -1 7 -4 8 -8" stroke="#8A9A2F" stroke-width="1.5" stroke-linecap="round" fill="none"/><g fill="#E8B93E" stroke="#A9781A" stroke-width="1"><ellipse cx="17" cy="8" rx="2.3" ry="3.4"/><ellipse cx="13" cy="11.5" rx="2.1" ry="3.1" transform="rotate(-24 13 11.5)"/><ellipse cx="21" cy="11.5" rx="2.1" ry="3.1" transform="rotate(24 21 11.5)"/></g>`),
};

export const foodWebLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FwbStep;
  const tm = bvTimers();
  const f = bvFrame(host, { title: s.title, steps: 4, cls: "fwb-stage", qCls: "fwb-q", api });
  f.stage.innerHTML = stageSvg();
  const svg = f.stage.querySelector("svg") as SVGSVGElement;

  let off: Key | null = null;
  let predicted = false;
  let phase: "play" | "ask" | "done" = "play";
  const tried = new Set<Key>();
  let run = 0;

  const cards = {} as Record<Key, BvCard>;
  KEYS.forEach((k) => {
    cards[k] = bvCard("fwb-card col", { name: `${NAME[k]} 빼기`, sub: "두 생태계에서", icon: ICON[k], key: k });
  });
  const cmpBtn = bvBtn("main fwb-cmp", "두 생태계 견주어 보기");
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
        (res.querySelector("text") as SVGTextElement).textContent = n ? `위험 ${n}` : w === "B" ? "모두 버텨요" : "위험 0";
        res.classList.add("show", n ? "bad" : "good");
      };
      if (instant) show();
      else tm.later(show, 520 * (waves.length + 1));
    });
    KEYS.forEach((x) => {
      cards[x].on(x === k);
      cards[x].sub(x === k ? "누르면 되돌리기" : "두 생태계에서");
    });
    host.dataset.fwbOff = k ?? "";
    host.dataset.fwbTried = KEYS.filter((x) => tried.has(x)).join(",");
    host.dataset.fwbPhase = phase;
  }

  function toggle(k: Key): void {
    if (off === k) {
      apply(null);
      f.say(`${NAME[k]}가 돌아왔어요. 이번에는 <b>다른 생물</b>을 빼 보세요.`);
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
      f.say("빼기 전에 먼저 짐작해 봐요. 결과는 바로 그림에서 확인할 수 있어요.");
      f.slot.ask(
        `${NAME[k]}가 사라지면 어느 생태계가 더 크게 흔들릴까요?`,
        [{ t: "(가) 생태계", ok: true }, { t: "(나) 생태계" }, { t: "둘 다 똑같이" }],
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
    apply("frog", true);
    f.say("개구리를 뺀 두 생태계예요. 맨 위의 <b>매</b>를 견주어 봐요.");
    f.slot.ask(
      "(나)의 매는 개구리가 사라져도 버텼어요. 까닭은?",
      [{ t: "대신 먹을 생물이 있어서", ok: true }, { t: "(나)의 매가 힘이 더 세서" }, { t: "(나)에 사는 생물의 마릿수가 많아서" }],
      (ok) => api.recordQuiz(ok),
      { why: "(나)의 매는 <b>참새와 뱀</b>도 먹어요. 한 갈래가 끊겨도 다른 갈래가 남아요.", onNext: finish },
    );
  });

  function finish(): void {
    phase = "done";
    host.dataset.fwbPhase = phase;
    f.pips(4);
    f.say("두 생태계가 버티는 힘이 달랐어요. 아래에서 알게 된 것을 읽어 봐요.");
    f.slot.conclude("생물다양성이 높은 생태계는 한 생물이 사라져도 <b>대신할 생물</b>이 있어 안정적으로 유지돼요.");
    api.enableCTA(s.cta ?? "다음");
    if (s.curio) host.appendChild(curioCard(s.curio));
  }

  f.slot.setControls(bvCards(3, ...KEYS.map((k) => cards[k])), cmpBtn);
  apply(null);
  f.say("화살표는 먹이에서 먹는 생물 쪽을 가리켜요. 아래에서 <b>생물 하나를 빼</b> 보세요.");
  api.setCTA("세 생물을 하나씩 빼 보세요", { enabled: false });
  return () => tm.clear();
};
