// 중2 Ⅴ 도입 다섯 장면. 형식은 모두 같다: 내기(정오를 매기지 않는 예측)를 먼저 걸고 → 버튼을 눌러 장면을 바꾸고 → 끝에서 예측과 비교한다.
// 도입은 까닭(원리)을 말하지 않는다. 끝의 물음을 바로 뒤의 랩이 받는다.
// (2026-11-16 글 다듬기: jar의 중간 말은 수정안대로 밤의 호흡과 낮의 광합성으로 두 기체가 순환한다고 말한다. 예측은 그 앞에 끝난다.)
//   iodine (g2u5l2) 밥, 식빵, 달걀흰자에 갈색 용액을 한 방울씩 → 잎의 녹말 확인 랩이 쓰는 용액을 미리 만난다
//   shade  (g2u5l3) 창가와 방 안쪽의 상추를 두 주 동안 둔다 → 빛의 세기 실험 설계 랩
//   flood  (g2u5l4) 받침에 물이 고이도록 물을 준다 → 빛이 없는 용기 속 잎과 뿌리 랩
//   jar    (g2u5l5) 뚜껑을 닫은 유리병 속 식물과 낮밤 → 빛의 세기와 기체 출입 랩
//   thin   (g2u5l6) 어린 사과를 솎아 내고 가을까지 기다린다 → 양분의 이동 랩
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}
function btn(text: string, wide = true): HTMLButtonElement {
  return el("button", { class: `opn-g2u5-btn${wide ? " wide" : ""}`, text, attrs: { type: "button" } }) as HTMLButtonElement;
}
const all = <T extends Element>(c: OpenerCtx, sel: string): T[] => Array.from(c.stage.querySelectorAll<T>(sel));
const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측한 대로" : "예측과 달리");

/** 묶음 가운데 n번째만 보이게 한다(class 끝의 숫자로 가른다). */
function show(c: OpenerCtx, prefix: string, n: number): void {
  all<SVGGElement>(c, `[class*="${prefix}"]`).forEach((g) => {
    const m = g.getAttribute("class")?.match(new RegExp(`(?:^|\\s)${prefix}(\\d)(?:\\s|$)`));
    if (m) g.classList.toggle("on", Number(m[1]) === n);
  });
}

export function iodine(c: OpenerCtx): void {
  layer(c, "iodineBase");
  c.step.dataset.opnPhase = "ask";
  c.ask("갈색 아이오딘-아이오딘화 칼륨 용액을 밥, 식빵, 달걀흰자에 떨어뜨리면 색이 변하는 것은 무엇일까요?", {
    choices: ["밥과 식빵", "달걀흰자", "세 음식 모두"],
    neutral: true,
    good: "좋아요! 음식 버튼을 하나씩 눌러 용액을 <b>한 방울씩</b> 떨어뜨려 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const names = ["밥", "식빵", "달걀흰자"];
      const done = new Set<number>();
      const bs = names.map((name, i) => {
        const b = btn(name, false);
        b.addEventListener("click", () => {
          if (done.has(i)) return;
          haptic(HAPTIC.tap);
          done.add(i);
          b.disabled = true;
          all<SVGGElement>(c, `.opn-g2u5-io-b.b${i}`).forEach((g) => g.classList.add("on"));
          c.step.dataset.opnN = String(done.size);
          if (done.size < 3) {
            c.say(i === 2 ? "달걀흰자는 용액 색깔인 갈색 <b>그대로</b>예요. 남은 음식도 확인해 봐요." : `${name}에 용액을 떨어뜨리자 진한 <b>청람색</b>으로 변했어요! 남은 음식도 확인해 봐요.`);
            return;
          }
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.say(`${head(picked, "밥과")} 녹말이 들어 있는 밥과 식빵만 <b>청람색</b>으로 변했어요. 그렇다면 빛을 받은 식물 잎에도 녹말이 있을까요?`);
          c.finish();
        });
        return b;
      });
      c.controls.replaceChildren(...bs);
    },
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

export function shade(c: OpenerCtx): void {
  pressScene(c, {
    art: "shadeBase",
    question: "같은 날 심은 상추 화분을 창가와 방 안쪽에 각각 두었어요. 2주 뒤에는 어떻게 될까요?",
    choices: ["창가 쪽 상추가 더 잘 자란다", "두 상추가 비슷하게 자란다", "방 안쪽 상추가 더 잘 자란다"],
    good: "좋아요! 버튼을 눌러 <b>1주씩</b> 시간이 지난 모습을 확인해 보세요.",
    label: "1주일 뒤 모습 보기",
    steps: 2,
    paint: (n) => {
      show(c, "a", n);
      show(c, "b", n);
    },
    mid: () => "1주일이 지났어요. 창가에 둔 상추 잎이 조금 더 넓어졌네요. <b>1주일 뒤</b> 모습도 확인해 봐요.",
    end: (picked) => `${head(picked, "창가")} 밝은 빛을 받은 창가의 상추만 쑥쑥 자랐어요. 그렇다면 빛이 강할수록 광합성량도 <b>끝없이</b> 늘어날까요?`,
  });
}

export function flood(c: OpenerCtx): void {
  pressScene(c, {
    art: "floodBase",
    question: "물을 너무 많이 주어서 화분 속 뿌리가 늘 물에 잠겨 있으면 식물은 어떻게 될까요?",
    choices: ["점점 시들어 간다", "물을 많이 마셔서 더 잘 자란다", "아무 변화 없이 그대로 자란다"],
    good: "좋아요! 버튼을 눌러 화분에 물을 <b>계속</b> 부어 보세요.",
    label: "화분에 물 더 주기",
    steps: 3,
    paint: (n) => {
      show(c, "w", n);
      show(c, "p", n);
      c.stage.classList.toggle("wet", n >= 2);
      const d = all<SVGGElement>(c, ".opn-g2u5-fl-d")[0];
      if (n > 0 && d) {
        d.classList.add("on");
        c.later(() => d.classList.remove("on"), 500);
      }
    },
    // 그림에는 흙 속 공기 방울이 없고 첫 번째 물은 받침에 얕게 고인다(intro-g2u5.mjs의 w1). 수정안의 '가득 찼어요', '공기 방울이 사라졌어요'는 그림에 맞게 덜어 냈다.
    mid: (n) => (n === 1 ? "화분 받침에 물이 고였어요. 여기서 물을 <b>한 번 더</b> 줘 볼까요?" : "흙 속 빈틈에 물이 찼어요. 버튼을 한 번 더 눌러 <b>며칠 뒤 모습</b>을 확인해 보세요."),
    end: (picked) => `${head(picked, "점점")} 물이 충분한데도 오히려 식물이 <b>시들어 버렸어요</b>. 물에 잠긴 뿌리에 무엇이 부족했던 걸까요?`,
  });
}

export function jar(c: OpenerCtx): void {
  pressScene(c, {
    art: "jarBase",
    question: "물을 충분히 준 뒤 뚜껑을 꼭 닫은 유리병 속 식물은 빛이 드는 창가에서 얼마나 살 수 있을까요?",
    // choices[0]이 옳은 예측이다. 끝의 head(picked, "몇 년")이 이 보기의 앞머리와 맞물린다(보기를 바꾸면 함께 바꾼다).
    choices: ["몇 년 동안이나 살 수 있다", "숨이 막혀 며칠을 못 넘긴다", "한 달 정도만 버틴다"],
    good: "좋아요! 버튼을 눌러 유리병 속 식물의 <b>낮과 밤</b>을 살펴보세요.",
    label: (n) => (n % 2 ? "낮으로 바꾸기" : "밤으로 바꾸기"),
    steps: 4,
    paint: (n) => {
      c.stage.classList.toggle("night", n % 2 === 1);
      show(c, "p", n >= 3 ? 1 : 0);
    },
    mid: (n) =>
      n === 1
        ? "어두운 밤에는 식물이 호흡만 하여 <b>산소</b>를 흡수하고 <b>이산화 탄소</b>를 내보내요. 이제 낮으로 바꿔 볼까요?"
        : n === 2
          ? "밝은 낮이 되자 밤에 나왔던 <b>이산화 탄소</b>를 써서 광합성으로 다시 <b>산소</b>를 만들어요! 한 번 더 밤으로 바꿔 보세요."
          : "이렇게 낮과 밤이 반복되면서 병 속의 산소와 이산화 탄소가 <b>끊임없이 순환</b>해요. 마지막으로 낮 모습을 확인해 보세요.",
    end: (picked) => `${head(picked, "몇 년")} 병 안에서 산소와 이산화 탄소가 <b>순환하기 때문에</b> 식물이 몇 년 동안이나 살 수 있어요. 빛의 세기에 따라 잎의 기체 출입은 어떻게 달라질까요?`,
  });
}

export function thin(c: OpenerCtx): void {
  pressScene(c, {
    art: "thinBase",
    question: "사과나무에 열린 어린 열매를 절반쯤 솎아 내면, 남아 있는 사과는 가을에 어떻게 될까요?",
    choices: ["더 크게 자란다", "솎아 내지 않을 때와 크기가 같다", "오히려 더 작아진다"],
    good: "좋아요! 버튼을 눌러 어린 열매를 <b>세 개</b> 솎아 내 보세요.",
    label: (n) => (n >= 3 ? "가을이 된 모습 보기" : "어린 열매 솎아 내기"),
    steps: 4,
    paint: (n) => {
      [1, 3, 5].forEach((f, i) => all<SVGGElement>(c, `.opn-g2u5-th-f.f${f}`).forEach((g) => g.classList.toggle("off", n > i)));
      c.stage.classList.toggle("ripe", n >= 4);
    },
    mid: (n) => (n < 3 ? `어린 열매 ${n}개를 솎아 냈어요. 버튼을 눌러 <b>${3 - n}개 더</b> 솎아 내 보세요.` : "가지에 열매 세 개만 남겼어요. 이제 <b>가을이 된 모습</b>을 확인해 볼까요?"),
    end: (picked) => `${head(picked, "더 크게")} 잎에서 만든 양분이 남아 있는 사과 <b>세 개에 집중되어</b> 훨씬 더 크게 자랐어요. 잎에서 만든 양분은 어떤 통로를 따라 이동할까요?`,
  });
}
