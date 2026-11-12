// 중2 Ⅵ 도입 다섯 장면. 형식은 모두 같다: 내기(정오를 매기지 않는 예측)를 먼저 걸고 → 버튼을 눌러 장면을 바꾸고 → 끝에서 예측과 견준다.
// 도입은 까닭(원리)을 말하지 않는다. 끝의 물음을 바로 뒤의 랩이 받는다.
//   peanut (g2u6l1) 땅콩을 흰 종이에 문지른다 → 음식물 속 영양소 검출 랩
//   chew   (g2u6l2) 밥을 오래 씹는다 → 침의 소화 작용 랩
//   breath (g2u6l4) 줄자를 가슴에 두르고 숨을 쉰다 → 호흡운동 모형 랩
//   water  (g2u6l5) 물을 여러 컵 마신 날의 오줌 → 콩팥단위에서 오줌 만들기 랩
//   run    (g2u6l6) 제자리 뛰기 → 세포호흡 랩
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}
function btn(text: string): HTMLButtonElement {
  return el("button", { class: "opn-g2u6-btn wide", text, attrs: { type: "button" } }) as HTMLButtonElement;
}
const all = <T extends Element>(c: OpenerCtx, sel: string): T[] => Array.from(c.stage.querySelectorAll<T>(sel));
const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측대로" : "예측과 달리");

/** 묶음 가운데 n번째만 보이게 한다(class의 둘째 낱말 끝의 숫자로 가른다). */
function show(c: OpenerCtx, prefix: string, n: number): void {
  all<SVGGElement>(c, ".opn-g2u6-g").forEach((g) => {
    const m = g.getAttribute("class")?.match(new RegExp(`(?:^|\\s)${prefix}(\\d)(?:\\s|$)`));
    if (m) g.classList.toggle("on", Number(m[1]) === n);
  });
}

/** 버튼 하나를 여러 번 누르는 장면의 공통 틀. */
function pressScene(
  c: OpenerCtx,
  o: { art: string; question: string; choices: string[]; good: string; label: string | ((n: number) => string); steps: number; paint: (n: number) => void; mid: (n: number) => string; end: (picked: string) => string },
): void {
  layer(c, o.art);
  let n = 0;
  o.paint(0);
  c.step.dataset.opnPhase = "ask";
  c.ask(o.question, {
    choices: o.choices,
    neutral: true,
    good: o.good,
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const label = (k: number): string => (typeof o.label === "string" ? o.label : o.label(k));
      const b = btn(label(0));
      c.controls.replaceChildren(b);
      b.addEventListener("click", () => {
        if (n >= o.steps) return;
        haptic(HAPTIC.tap);
        n += 1;
        o.paint(n);
        c.step.dataset.opnN = String(n);
        if (n < o.steps) {
          b.textContent = label(n);
          c.say(o.mid(n));
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(o.end(picked));
        c.finish();
      });
    },
  });
}

export function peanut(c: OpenerCtx): void {
  pressScene(c, {
    art: "peanutBase",
    question: "껍질을 깐 땅콩을 흰 종이에 대고 꾹꾹 문지르면 종이에는?",
    choices: ["투명한 얼룩이 남는다", "아무 흔적도 없다", "물기가 묻었다가 곧 마른다"],
    good: "예측 완료! 버튼을 눌러 땅콩을 <b>문질러</b> 보세요.",
    label: "땅콩 문지르기",
    steps: 3,
    paint: (n) => {
      show(c, "s", n);
      const rub = all<SVGGElement>(c, ".opn-g2u6-rub")[0];
      if (n > 0 && rub) {
        rub.classList.add("on");
        c.later(() => rub.classList.remove("on"), 500);
      }
    },
    mid: (n) => (n === 1 ? "종이에 작은 얼룩이 생겼어요. <b>더</b> 문질러 봐요." : "얼룩이 번지고 있어요. <b>한 번 더</b> 문질러요."),
    end: (picked) => `${head(picked, "투명한")} 마르지 않는 <b>기름 얼룩</b>이 남았어요. 음식물 속에는 또 무엇이 들어 있을까요?`,
  });
}

export function chew(c: OpenerCtx): void {
  pressScene(c, {
    art: "chewBase",
    question: "밥 한 숟가락을 삼키지 않고 오래 씹으면 맛은?",
    choices: ["점점 단맛이 난다", "맛이 그대로다", "점점 쓴맛이 난다"],
    good: "예측 완료! 버튼을 눌러 밥을 <b>꼭꼭</b> 씹어 보세요.",
    label: "꼭꼭 씹기",
    steps: 3,
    paint: (n) => show(c, "p", n),
    mid: (n) => (n === 1 ? "열 번쯤 씹었어요. 아직 밥맛 그대로예요. <b>더</b> 씹어 봐요." : "조금 달아진 것 같아요. <b>계속</b> 씹어요."),
    end: (picked) => `${head(picked, "점점 단")} 밥이 <b>달아졌어요</b>. 입안에서 밥에 무슨 일이 일어난 걸까요?`,
  });
}

export function breath(c: OpenerCtx): void {
  pressScene(c, {
    art: "breathBase",
    question: "줄자를 가슴에 두르고 숨을 크게 들이쉬면 가슴둘레는?",
    choices: ["늘어난다", "그대로다", "줄어든다"],
    good: "예측 완료! 버튼을 눌러 숨을 <b>크게</b> 쉬어 보세요.",
    label: (n) => (n === 0 ? "숨 들이쉬기" : "숨 내쉬기"),
    steps: 2,
    paint: (n) => {
      show(c, "b", n === 1 ? 1 : 0);
      show(c, "a", n);
    },
    mid: () => "가슴이 넓어져 줄자의 고리가 <b>커졌어요</b>. 이제 숨을 내쉬어요.",
    end: (picked) => `${head(picked, "늘어")} 들이쉴 때 가슴이 <b>넓어졌어요</b>. 허파에는 근육이 없는데 공기는 어떻게 들어왔을까요?`,
  });
}

export function water(c: OpenerCtx): void {
  pressScene(c, {
    art: "waterBase",
    question: "물을 평소보다 많이 마신 날, 오줌은 어떻게 될까요?",
    choices: ["양이 늘고 색이 옅어진다", "양만 늘고 색은 그대로다", "양도 색도 그대로다"],
    good: "예측 완료! 버튼을 눌러 물을 <b>한 컵씩</b> 마셔 보세요.",
    label: "물 한 컵 마시기",
    steps: 3,
    paint: (n) => {
      show(c, "u", n);
      all<SVGGElement>(c, ".opn-g2u6-w").forEach((g, i) => g.classList.toggle("off", i < n));
    },
    mid: (n) => (n === 1 ? "한 컵 마셨어요. 오줌이 조금 늘었어요. <b>더</b> 마셔요." : "두 컵째예요. 오줌의 색이 <b>옅어지고</b> 있어요."),
    end: (picked) => `${head(picked, "양이 늘고")} 오줌이 <b>많아지고 옅어졌어요</b>. 오줌에는 물 말고 무엇이 들어 있을까요?`,
  });
}

export function run(c: OpenerCtx): void {
  pressScene(c, {
    art: "runBase",
    question: "제자리 뛰기를 1분 동안 하면 숨과 심장 박동은?",
    choices: ["둘 다 빨라진다", "숨만 빨라진다", "심장 박동만 빨라진다"],
    good: "예측 완료! 버튼을 눌러 <b>제자리 뛰기</b>를 해 보세요.",
    label: "제자리 뛰기",
    steps: 3,
    paint: (n) => show(c, "p", n),
    mid: (n) => (n === 1 ? "숨이 조금 가빠졌어요. <b>계속</b> 뛰어요." : "심장이 쿵쿵 뛰고 땀이 나요. <b>조금만 더</b> 뛰어요."),
    end: (picked) => `${head(picked, "둘 다")} 숨도 심장도 <b>빨라지고</b> 몸이 더워졌어요. 온몸의 세포는 왜 이렇게 바빠졌을까요?`,
  });
}
