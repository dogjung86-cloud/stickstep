// 중2 Ⅶ 도입(opener) 장면 묶음. opener.ts가 이 묶음을 싣는다(opener.ts와 dsl.ts를 고치지 않는다).
// 장면 이름은 "g2u7-"로 시작한다. 내용 파일에서 opener({ title, scene: "g2u7-comb", wait, cta }).
// 그림: qa/sketch/scenes/intro-g2u7.mjs → node qa/sketch/build-intro.mjs g2u7 → src/ui/introArt.g2u7.generated.ts
//
// 여덟 장면이 같은 꼴이다: 내기(예측)를 먼저 걸고 → 조작 줄의 버튼으로 손수 해 보고 → 끝에서 예측과 견준다.
// 예측의 답은 조작이 보여 주므로 정오를 매기지 않는다(neutral). 까닭(원리)은 말하지 않고 질문으로 남긴다(뒤의 랩이 받는다).
// 그림의 묶음은 무대의 on1, on2 클래스로 바뀐다(styles/g2u7v5.css의 도입 구간).
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
    const b = el("button", { class: "opn-g2u7-btn", text: act.btn, attrs: { type: "button" } }) as HTMLButtonElement;
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

export const G2U7_OPENERS: OpenerPack = {
  scenes: {
    "g2u7-comb": run({
      art: "combBase",
      q: "플라스틱 빗으로 머리를 빗은 뒤 빗을 떼면 머리카락은?",
      choices: ["빗을 따라 올라온다", "가라앉은 그대로 있다", "빗에서 멀어진다"],
      start: "예측 완료! <b>빗질하기</b>를 여러 번 눌러 머리를 빗어 보세요.",
      acts: [{ btn: "빗질하기", times: 3 }],
      end: (hit) => `${head(hit)} 머리카락이 빗을 <b>따라 올라와요</b>. 빗었을 뿐인데 왜 달라붙을까요?`,
    }),
    "g2u7-foil": run({
      art: "foilBase",
      q: "털옷에 문지른 풍선을 알루미늄박 인형 위로 가져가면 인형은?",
      choices: ["풍선 쪽으로 일어선다", "누운 그대로 있다", "풍선에게서 밀려난다"],
      start: "예측 완료! <b>풍선 내리기</b>를 꾹 눌러 풍선을 인형 가까이 가져가요.",
      acts: [{ btn: "풍선 내리기 (꾹 누르기)", hold: 1100 }],
      end: (hit) => `${head(hit)} 인형이 풍선 쪽으로 <b>일어섰어요</b>. 풍선은 닿지도 않았는데 말이에요.`,
    }),
    "g2u7-clock": run({
      art: "clockBase",
      q: "멈춘 시계에 새 전지를 끼우려고 해요. 전지는 시계 속에서 어떤 일을 할까요?",
      choices: ["전기를 흐르게 한다", "전기를 만들어 채운다", "초침을 직접 민다"],
      start: "예측 완료! <b>전지 끼우기</b>를 눌러 시계에 전지를 넣어 보세요.",
      acts: [{ btn: "전지 끼우기" }],
      end: () => "초침이 다시 움직여요. 전지가 한 일은 <b>전선 속</b>을 들여다보며 확인해 봐요.",
    }),
    "g2u7-dim": run({
      art: "dimBase",
      q: "전지 하나로 전구를 켰어요. 전지를 하나 더 이어 끼우면 전구는?",
      choices: ["더 밝아진다", "밝기가 그대로다", "더 어두워진다"],
      start: "예측 완료! <b>전지 하나 더 끼우기</b>를 눌러 보세요.",
      acts: [{ btn: "전지 하나 더 끼우기" }],
      end: (hit) => `${head(hit)} 전구가 <b>더 밝아졌어요</b>. 전류는 얼마나 더 세졌을까요?`,
    }),
    "g2u7-tap": run({
      art: "tapBase",
      q: "멀티탭에 스탠드와 충전 중인 휴대 전화가 꽂혀 있어요. 스탠드 플러그를 뽑으면 충전은?",
      choices: ["계속된다", "함께 멈춘다", "더 빨라진다"],
      start: "예측 완료! <b>스탠드 플러그 뽑기</b>를 눌러 보세요.",
      acts: [{ btn: "스탠드 플러그 뽑기" }],
      end: (hit) => `${head(hit)} 스탠드만 꺼지고 충전은 <b>계속돼요</b>. 멀티탭 속은 어떻게 이어져 있을까요?`,
    }),
    "g2u7-meter": run({
      art: "meterBase",
      q: "선풍기와 헤어드라이어 가운데 전기 계량기를 더 빨리 돌리는 것은?",
      choices: ["헤어드라이어", "선풍기", "둘이 똑같다"],
      start: "예측 완료! 먼저 <b>선풍기 켜기</b>를 눌러 계량기를 보세요.",
      acts: [{ btn: "선풍기 켜기", say: "계량기의 빨간 표시가 <b>천천히</b> 움직여요. 이번에는 헤어드라이어를 켜 봐요." }, { btn: "헤어드라이어로 바꿔 켜기" }],
      end: (hit) => `${head(hit)} 헤어드라이어가 <b>훨씬 빨리</b> 돌려요. 두 기구는 무엇이 다를까요?`,
    }),
    "g2u7-wire": run({
      art: "wireBase",
      q: "나침반 위로 전선이 지나가요. 스위치를 눌러 전류를 흘리면 바늘은?",
      choices: ["한쪽으로 돌아간다", "그대로 있다", "빙글빙글 계속 돈다"],
      start: "예측 완료! <b>스위치</b>를 꾹 눌러 전류를 흘려 보세요.",
      acts: [{ btn: "스위치 누르기 (꾹 누르기)", hold: 900 }],
      end: (hit) => `${head(hit)} 바늘이 <b>한쪽으로 돌아갔어요</b>. 자석을 가져온 것도 아닌데 왜 돌았을까요?`,
    }),
    "g2u7-bike": run({
      art: "bikeBase",
      q: "전기 자전거의 바퀴를 돌리는 전동기예요. 속에는 무엇이 들어 있을까요?",
      choices: ["자석과 코일", "작은 엔진", "감아 둔 태엽"],
      start: "예측 완료! <b>전동기 열어 보기</b>를 눌러 속을 들여다봐요.",
      acts: [{ btn: "전동기 열어 보기" }],
      end: (hit) => `${head(hit)} 속에는 <b>자석</b>과 <b>코일</b>이 들어 있어요. 이 둘이 어떻게 바퀴를 돌릴까요?`,
    }),
  },
  art: () => import("../../../../ui/introArt.g2u7.generated"),
};
