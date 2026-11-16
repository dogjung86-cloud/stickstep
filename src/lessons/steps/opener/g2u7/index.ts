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
      q: "플라스틱 빗으로 머리를 빗은 뒤 빗을 살짝 떼면 머리카락은 어떻게 될까요?",
      choices: ["빗을 따라 끌려 올라온다", "차분하게 가라앉아 있다", "빗 반대쪽으로 밀려난다"],
      start: "예측 완료! <b>빗질하기</b>를 세 번 눌러 머리를 빗어 보세요.",
      acts: [{ btn: "빗질하기", times: 3 }],
      end: (hit) => `${head(hit)} 머리카락이 빗을 <b>따라 끌려 올라와요</b>. 머리를 빗었을 뿐인데 왜 빗에 달라붙을까요?`,
    }),
    "g2u7-foil": run({
      art: "foilBase",
      q: "털옷에 문지른 풍선을 알루미늄박 인형 가까이로 내려 보면 인형은 어떻게 될까요?",
      choices: ["풍선에 끌려 벌떡 일어선다", "누운 채로 움직이지 않는다", "풍선 반대쪽으로 밀려난다"],
      start: "예측 완료! <b>풍선 내리기</b> 버튼을 꾹 눌러 풍선을 인형 가까이로 내려 보세요.",
      acts: [{ btn: "풍선 내리기 (길게 누르기)", hold: 1100 }],
      end: (hit) => `${head(hit)} 풍선이 닿지도 않았는데 알루미늄박 인형이 풍선 쪽으로 <b>끌려 일어섰어요</b>. 어떻게 닿지 않고도 힘이 작용했을까요?`,
    }),
    "g2u7-clock": run({
      art: "clockBase",
      q: "멈춰 있는 시계에 새 전지를 끼우면 초침이 다시 움직여요. 전지는 회로에서 어떤 역할을 할까요?",
      choices: ["전류가 계속 흐르도록 밀어 준다", "도선 속에 없던 전자를 새로 만들어 채운다", "바늘을 자석처럼 직접 끌어당긴다"],
      start: "예측 완료! <b>전지 끼우기</b>를 눌러 시계에 전지를 연결해 보세요.",
      acts: [{ btn: "전지 끼우기" }],
      end: () => "초침이 다시 힘차게 돌아가요! 전지가 회로 속에서 어떤 역할을 하는지 <b>전선 내부</b>를 확대해 확인해 볼까요?",
    }),
    "g2u7-dim": run({
      art: "dimBase",
      q: "전지 한 개로 켠 전구 회로에 전지를 한 개 더 직렬로 이어 끼우면 전구는 어떻게 될까요?",
      choices: ["처음보다 더 밝아진다", "밝기가 변함없이 그대로이다", "처음보다 더 어두워진다"],
      start: "예측 완료! <b>전지 하나 더 끼우기</b>를 눌러 전구 밝기를 확인해 보세요.",
      acts: [{ btn: "전지 하나 더 끼우기" }],
      end: (hit) => `${head(hit)} 전압이 높아지자 전구가 <b>훨씬 더 밝아졌어요</b>. 전압을 올리면 전류는 얼마나 더 세질까요?`,
    }),
    "g2u7-tap": run({
      art: "tapBase",
      q: "멀티탭 하나에 전기스탠드와 휴대 전화 충전기가 함께 꽂혀 있어요. 스탠드 플러그를 뽑으면 휴대 전화 충전은 어떻게 될까요?",
      choices: ["멈추지 않고 계속 충전된다", "스탠드와 함께 충전도 멈춘다", "충전 속도가 갑자기 빨라진다"],
      start: "예측 완료! <b>스탠드 플러그 뽑기</b>를 눌러 휴대 전화 화면을 확인해 보세요.",
      acts: [{ btn: "스탠드 플러그 뽑기" }],
      end: (hit) => `${head(hit)} 스탠드만 꺼지고 휴대 전화 충전은 <b>그대로 계속돼요</b>. 멀티탭 속 전선은 어떻게 연결되어 있을까요?`,
    }),
    "g2u7-meter": run({
      art: "meterBase",
      q: "선풍기와 헤어드라이어를 각각 켰을 때, 집 안의 전기 계량기 원판을 더 빠르게 돌리는 기구는 어느 것일까요?",
      choices: ["헤어드라이어", "선풍기", "두 기구가 똑같다"],
      start: "예측 완료! 먼저 <b>선풍기 켜기</b>를 눌러 계량기가 도는 빠르기를 확인해 보세요.",
      acts: [{ btn: "선풍기 켜기", say: "선풍기를 켜자 계량기의 빨간 표시가 <b>천천히</b> 지나가요. 이번에는 헤어드라이어를 켜 볼까요?" }, { btn: "헤어드라이어로 바꿔 켜기" }],
      end: (hit) => `${head(hit)} 뜨거운 바람을 내는 헤어드라이어가 계량기를 <b>훨씬 빠르게</b> 돌려요! 기구마다 1초 동안 쓰는 전기 에너지가 어떻게 다를까요?`,
    }),
    "g2u7-wire": run({
      art: "wireBase",
      q: "나침반 위로 곧은 전선이 지나가고 있어요. 스위치를 눌러 전선에 전류를 흘려주면 나침반 바늘은 어떻게 될까요?",
      choices: ["일정한 각도만큼 한쪽으로 돌아간다", "북쪽을 가리킨 채 그대로 있다", "멈추지 않고 빙글빙글 계속 돈다"],
      start: "예측 완료! <b>스위치 누르기</b> 버튼을 길게 눌러 전류를 흘려 보세요.",
      acts: [{ btn: "스위치 누르기 (길게 누르기)", hold: 900 }],
      end: (hit) => `${head(hit)} 전선에 전류가 흐르는 동안 나침반 바늘이 <b>한쪽으로 돌아갔어요</b>! 근처에 자석을 가져오지 않았는데 왜 바늘이 움직였을까요?`,
    }),
    "g2u7-bike": run({
      art: "bikeBase",
      q: "전기 자전거의 바퀴를 힘차게 돌리는 전동기예요. 전동기 안에는 무엇이 들어 있을까요?",
      choices: ["자석과 코일", "연료를 태우는 작은 엔진", "감아 둔 강철 태엽"],
      start: "예측 완료! <b>전동기 열어 보기</b>를 눌러 내부 구조를 확인해 보세요.",
      acts: [{ btn: "전동기 열어 보기" }],
      end: (hit) => `${head(hit)} 전동기 속에는 <b>자석</b>과 <b>코일</b>이 들어 있어요! 자석 사이의 코일에 전류가 흐르면 어떤 일이 일어날까요?`,
    }),
  },
  art: () => import("../../../../ui/introArt.g2u7.generated"),
};
