// 중2 Ⅷ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u8-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u8-tree", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u8.mjs → node qa/sketch/build-intro.mjs g2u8 → src/ui/introArt.g2u8.generated.ts
//
// 일곱 장면이 같은 꼴이다(g2u8l7은 만화로 시작한다): 내기(예측)를 먼저 걸고 → 조작 줄의 버튼으로 손수 해 보고 → 끝에서 예측과 견준다.
// 예측의 답은 조작이 보여 주므로 정오를 매기지 않는다(neutral). 까닭(원리)은 말하지 않고 질문으로 남긴다(뒤의 랩이 받는다).
// 그림의 묶음은 무대의 on1 클래스로 바뀐다(styles/g2u8v5.css의 도입 구간).
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx, OpenerPack, OpenerScene } from "../opener";

interface Act {
  btn: string;
  /** 꾹 누르기(ms). 없으면 한 번 누르기 */
  hold?: number;
  /** 여러 번 눌러야 하는 조작의 횟수 */
  times?: number;
  /** 이 조작 뒤의 쌤의 말(마지막 조작은 end가 대신한다) */
  say?: string;
}
interface Cfg {
  art: string;
  q: string;
  /** [0]이 조작이 보여 줄 결과와 같은 예측 */
  choices: [string, string, string];
  start: string;
  acts: Act[];
  /** 끝의 말. hit: 예측이 결과와 같았나(null이면 견주지 않는 장면) */
  end: (hit: boolean) => string;
  compare?: boolean;
}

const run = (cfg: Cfg): OpenerScene => (c: OpenerCtx): void => {
  c.stage.append(el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[cfg.art] ?? "" }));
  let pred = "";
  let step = 0;
  let count = 0;

  const done = (): void => {
    c.controls.replaceChildren();
    c.later(() => {
      haptic(HAPTIC.correct);
      c.face("surprised");
      c.say(cfg.end(pred === cfg.choices[0]));
      c.finish();
    }, 900);
  };
  const fire = (b: HTMLButtonElement): void => {
    const act = cfg.acts[step];
    count += 1;
    haptic(HAPTIC.tap);
    c.stage.classList.remove("nudge");
    void c.stage.offsetWidth;
    c.stage.classList.add("nudge");
    if (count < (act.times ?? 1)) return;
    b.disabled = true;
    step += 1;
    count = 0;
    c.stage.classList.add(`on${step}`);
    c.step.dataset.opnAct = String(step);
    if (step >= cfg.acts.length) done();
    else {
      if (act.say) c.say(act.say);
      c.later(show, 700);
    }
  };
  function show(): void {
    const act = cfg.acts[step];
    const b = el("button", { class: "opn-g2u8-btn", text: act.btn, attrs: { type: "button" } }) as HTMLButtonElement;
    if (act.hold) {
      b.dataset.hold = "1";
      let timer = 0;
      const stop = (): void => {
        if (timer) c.cancel(timer);
        timer = 0;
        b.classList.remove("on");
        c.stage.classList.remove("holding");
      };
      b.addEventListener("pointerdown", (e) => {
        if (b.disabled || timer) return;
        try {
          b.setPointerCapture(e.pointerId);
        } catch {
          /* 합성 사건에는 붙잡을 포인터가 없다 */
        }
        b.classList.add("on");
        c.stage.classList.add("holding");
        timer = c.later(() => {
          stop();
          fire(b);
        }, act.hold!);
      });
      ["pointerup", "pointercancel"].forEach((t) => b.addEventListener(t, stop));
      b.addEventListener("contextmenu", (e) => e.preventDefault());
      b.addEventListener("click", (e) => {
        if ((e as MouseEvent).detail === 0 && !b.disabled) fire(b);
      });
    } else b.addEventListener("click", () => !b.disabled && fire(b));
    c.controls.replaceChildren(b);
  }

  c.step.dataset.opnPhase = "ask";
  c.ask(cfg.q, {
    choices: cfg.choices,
    neutral: true,
    good: cfg.start,
    onDone: (picked) => {
      pred = picked.replace(/^내 예측/, "").trim();
      c.step.dataset.opnPhase = "play";
      c.stage.classList.add("play");
      c.face("curious");
      show();
    },
  });
};
const head = (hit: boolean): string => (hit ? "예측대로" : "예측과 달리");

export const G2U8_OPENERS: OpenerPack = {
  scenes: {
    "g2u8-tree": run({
      art: "treeBase",
      q: "가까운 나무가 먼 학교 건물의 오른쪽에 보여요. 오른쪽으로 걸어가며 보면 나무는?",
      choices: ["학교의 왼쪽으로 옮겨 가 보인다", "그 자리에 그대로 보인다", "오른쪽으로 더 멀어져 보인다"],
      start: "예측 완료! <b>오른쪽으로 걷기</b>를 꾹 눌러 걸어가며 나무를 보세요.",
      acts: [{ btn: "오른쪽으로 걷기 (꾹 누르기)", hold: 1200 }],
      end: (hit) => `${head(hit)} 나무가 학교의 <b>왼쪽으로 옮겨 갔어요</b>. 나무도 학교도 가만히 있는데 왜 그럴까요?`,
    }),
    "g2u8-lamps": run({
      art: "lampsBase",
      q: "똑같은 가로등이 길을 따라 서 있어요. 불을 켜면 멀리 있는 가로등은?",
      choices: ["가까운 것보다 어둡게 보인다", "모두 같은 밝기로 보인다", "가까운 것보다 밝게 보인다"],
      start: "예측 완료! <b>가로등 켜기</b>를 눌러 보세요.",
      acts: [{ btn: "가로등 켜기" }],
      end: (hit) => `${head(hit)} 먼 가로등일수록 <b>어둡게</b> 보여요. 거리가 2배가 되면 밝기는 얼마나 줄까요?`,
    }),
    "g2u8-rank": run({
      art: "rankBase",
      q: "옛 과학자는 맨눈에 가장 밝게 보이는 별들에 어떤 이름을 붙였을까요?",
      choices: ["1등성", "6등성", "10등성"],
      start: "예측 완료! <b>밝은 별부터 줄 세우기</b>를 눌러 보세요.",
      acts: [{ btn: "밝은 별부터 줄 세우기" }],
      end: (hit) => `${head(hit)} 가장 밝은 별이 <b>1등성</b>이에요. 숫자가 작을수록 밝다니, 등급은 어떻게 매길까요?`,
    }),
    "g2u8-lava": run({
      art: "lavaBase",
      q: "화산에서 나온 용암이 멀리 흘러가요. 분화구에서 막 나온 용암과 멀리 간 용암의 색은?",
      choices: ["막 나온 쪽이 더 노랗고 밝다", "멀리 간 쪽이 더 노랗고 밝다", "어디서나 같은 색이다"],
      start: "예측 완료! <b>용암 흘려보내기</b>를 눌러 보세요.",
      acts: [{ btn: "용암 흘려보내기" }],
      end: (hit) => `${head(hit)} 분화구 가까이는 <b>노랗고</b>, 멀리 갈수록 <b>검붉어요</b>. 흘러가는 동안 무엇이 달라졌을까요?`,
    }),
    "g2u8-band": run({
      art: "bandBase",
      q: "밤하늘을 가로지르는 뿌연 띠, 은하수를 망원경으로 보면 무엇이 보일까요?",
      choices: ["수많은 별", "길게 뜬 구름", "텅 빈 하늘"],
      start: "예측 완료! <b>망원경으로 보기</b>를 꾹 눌러 띠를 들여다보세요.",
      acts: [{ btn: "망원경으로 보기 (꾹 누르기)", hold: 1000 }],
      end: (hit) => `${head(hit)} 뿌연 띠는 <b>수많은 별</b>이었어요. 그런데 별들이 왜 띠 모양으로 보일까요?`,
    }),
    "g2u8-dark": run({
      art: "darkBase",
      q: "별이 빽빽한 밤하늘에 검은 얼룩이 있어요. 그 자리에는 정말 별이 없을까요?",
      choices: ["별은 있는데 무언가가 가리고 있다", "그 자리에만 별이 없다", "하늘에 구멍이 뚫려 있다"],
      start: "예측 완료! <b>얼룩 걷어 보기</b>를 눌러 뒤쪽을 확인해 보세요.",
      acts: [{ btn: "얼룩 걷어 보기" }],
      end: (hit) => `${head(hit)} 얼룩 뒤에도 <b>별이 있었어요</b>. 별빛을 가리고 있던 것은 무엇일까요?`,
    }),
    "g2u8-thermo": run({
      art: "thermoBase",
      q: "이마에 대지 않고 체온을 재는 온도계는 원래 무엇을 재던 기술에서 나왔을까요?",
      choices: ["멀리 있는 별의 온도", "끓는 물의 온도", "깊은 땅속의 온도"],
      start: "예측 완료! <b>기술의 고향 찾아가기</b>를 눌러 보세요.",
      acts: [{ btn: "기술의 고향 찾아가기" }],
      end: (hit) => `${head(hit)} <b>멀리 있는 천체의 온도</b>를 재던 기술이었어요. 우주 탐사는 또 무엇을 남겼을까요?`,
    }),
  },
  art: () => import("../../../../ui/introArt.g2u8.generated"),
};
