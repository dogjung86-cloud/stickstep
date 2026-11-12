// 중2 Ⅴ 도입 다섯 장면. 형식은 모두 같다: 내기(정오를 매기지 않는 예측)를 먼저 걸고 → 버튼을 눌러 장면을 바꾸고 → 끝에서 예측과 견준다.
// 도입은 까닭(원리)을 말하지 않는다. 끝의 물음을 바로 뒤의 랩이 받는다.
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
const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측대로" : "예측과 달리");

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
  c.ask("갈색 아이오딘 용액을 밥, 식빵, 달걀흰자에 떨어뜨리면 색이 변하는 것은?", {
    choices: ["밥과 식빵", "달걀흰자", "셋 모두"],
    neutral: true,
    good: "예측 완료! 음식을 눌러 용액을 <b>한 방울씩</b> 떨어뜨려 보세요.",
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
            c.say(i === 2 ? "달걀흰자는 갈색 방울 <b>그대로</b>예요. 다른 것도 해 봐요." : `${name}에 떨어뜨리자 <b>청람색</b>으로 변했어요. 다른 것도 해 봐요.`);
            return;
          }
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.say(`${head(picked, "밥과")} 밥과 식빵만 <b>청람색</b>이 됐어요. 둘에는 녹말이 들어 있어요. 잎에도 있을까요?`);
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
    question: "같은 날 심은 상추를 창가와 방 안쪽에 두었어요. 두 주 뒤에는?",
    choices: ["창가 쪽이 더 잘 자란다", "둘이 비슷하게 자란다", "방 안쪽이 더 잘 자란다"],
    good: "예측 완료! 버튼을 눌러 <b>한 주씩</b> 시간을 보내 보세요.",
    label: "한 주 보내기",
    steps: 2,
    paint: (n) => {
      show(c, "a", n);
      show(c, "b", n);
    },
    mid: () => "한 주가 지났어요. 창가의 상추가 조금 더 커 보여요. <b>한 주 더</b> 보내요.",
    end: (picked) => `${head(picked, "창가")} 창가의 상추만 쑥 자랐어요. 빛이 셀수록 <b>끝없이</b> 더 잘 자랄까요?`,
  });
}

export function flood(c: OpenerCtx): void {
  pressScene(c, {
    art: "floodBase",
    question: "화분 받침에 물이 늘 고여 뿌리가 물에 잠겨 있으면 식물은?",
    choices: ["점점 시들어 간다", "더 잘 자란다", "아무 일도 없다"],
    good: "예측 완료! 버튼을 눌러 물을 <b>듬뿍</b> 줘 보세요.",
    label: "물 더 주기",
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
    mid: (n) => (n === 1 ? "받침에 물이 고였어요. 아직은 괜찮아 보여요. <b>더</b> 줘 봐요." : "흙이 흠뻑 젖고 잎이 처지기 시작했어요. <b>한 번 더</b> 줘요."),
    end: (picked) => `${head(picked, "점점")} 잎이 축 처졌어요. 물에 잠긴 뿌리에는 <b>무엇이 모자랐을까요?</b>`,
  });
}

export function jar(c: OpenerCtx): void {
  pressScene(c, {
    art: "jarBase",
    question: "뚜껑을 꼭 닫은 유리병 속의 식물은 얼마나 살 수 있을까요?",
    choices: ["몇 해도 살 수 있다", "며칠을 못 넘긴다", "한 달쯤 버틴다"],
    good: "예측 완료! 버튼을 눌러 <b>낮과 밤</b>을 보내 보세요.",
    label: (n) => (n % 2 ? "아침 맞기" : "밤 맞기"),
    steps: 4,
    paint: (n) => {
      c.stage.classList.toggle("night", n % 2 === 1);
      show(c, "p", n >= 3 ? 1 : 0);
    },
    mid: (n) => (n === 1 ? "밤이 됐어요. 병 속의 식물은 그대로예요. <b>아침</b>을 맞아요." : n === 2 ? "다시 낮이에요. 여전히 싱싱해요. 이렇게 <b>여러 달</b>이 지나요." : "잎이 더 늘었어요. 뚜껑은 한 번도 열지 않았어요."),
    end: (picked) => `${head(picked, "몇 해")} 이런 병 속 식물은 <b>몇 해</b>도 살아요. 낮과 밤에 잎에서 무슨 일이 일어날까요?`,
  });
}

export function thin(c: OpenerCtx): void {
  pressScene(c, {
    art: "thinBase",
    question: "사과나무의 어린 열매를 절반쯤 따 내면 남은 사과는?",
    choices: ["더 크게 자란다", "크기가 그대로다", "함께 작아진다"],
    good: "예측 완료! 버튼을 눌러 어린 열매를 <b>솎아 내</b> 보세요.",
    label: (n) => (n >= 3 ? "가을까지 기다리기" : "어린 열매 솎아 내기"),
    steps: 4,
    paint: (n) => {
      [1, 3, 5].forEach((f, i) => all<SVGGElement>(c, `.opn-g2u5-th-f.f${f}`).forEach((g) => g.classList.toggle("off", n > i)));
      c.stage.classList.toggle("ripe", n >= 4);
    },
    mid: (n) => (n < 3 ? "하나를 따 냈어요. 잎의 수는 그대로예요. <b>더</b> 솎아 내요." : "여섯 개 가운데 셋만 남았어요. 이제 <b>가을까지</b> 기다려요."),
    end: (picked) => `${head(picked, "더 크게")} 남은 사과가 <b>큼직하게</b> 익었어요. 잎이 만든 양분은 어떻게 열매까지 갔을까요?`,
  });
}
