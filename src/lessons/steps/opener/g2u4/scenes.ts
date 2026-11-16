// 중2 Ⅳ 도입 다섯 장면. 형식은 모두 같다: 내기(정오를 매기지 않는 예측)를 먼저 걸고 → 버튼을 눌러 장면을 바꾸고 → 끝에서 예측과 비교한다.
// 도입은 까닭(원리)을 말하지 않는다. 끝의 물음을 바로 뒤의 랩이 받는다.
//   split (g2u4l1) 물방울을 반으로, 또 반으로 나눈다 → 물 분해 랩
//   marks (g2u4l2) 원소가 발견될 때마다 그림 기호가 늘어난다 → 원소 기호 짓기 랩
//   peek  (g2u4l3) 꾹 눌러 원자를 확대한다 → 원자핵 속 들여다보기 랩
//   salt  (g2u4l5) 소금을 물에 넣고 젓는다(앞 레슨에서 나트륨은 물과 격렬하게 반응했다) → 분자와 이온 랩
//   blot  (g2u4l6) 젖은 거름종이에 파란 방울을 떨어뜨린다 → 이온의 이동 랩
import { el } from "../../../../core/dom";
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";

function layer(c: OpenerCtx, key: string): HTMLElement {
  const node = el("div", { class: "opn-layer", html: (c.art as unknown as Record<string, string>)[key] ?? "" });
  c.stage.append(node);
  return node;
}
function ctlBtn(c: OpenerCtx, text: string): HTMLButtonElement {
  const b = el("button", { class: "opn-g2u4-btn", text, attrs: { type: "button" } }) as HTMLButtonElement;
  c.controls.replaceChildren(b);
  return b;
}
const q = <T extends Element>(c: OpenerCtx, sel: string): T[] => Array.from(c.stage.querySelectorAll<T>(sel));
/** 끝맺음 말의 머리. right에는 그 장면의 옳은 예측(보기 배열의 [0], hookAsk 약속) 글을 통째로 넘긴다(보기 글을 고쳐도 열쇠가 따라간다). */
const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측한 대로" : "예측과는 달리");

export function split(c: OpenerCtx): void {
  layer(c, "splitBase");
  const sets = q<SVGGElement>(c, ".opn-g2u4-sp-d");
  let n = 0;
  const paint = (): void => {
    sets.forEach((g, i) => g.classList.toggle("on", i === n));
    c.step.dataset.opnN = String(n);
  };
  paint();
  c.step.dataset.opnPhase = "ask";
  const choices = ["아무리 잘게 나누어도 성질은 여전히 물이다", "나누다 보면 점점 다른 성질의 물질로 변한다", "계속 나누다 보면 어느 순간 물이 아예 사라진다"];
  c.ask("물방울을 반으로, 또 반으로 계속 잘게 나누면 어떻게 될까요?", {
    choices,
    neutral: true,
    good: "생각을 정했군요! 아래 버튼을 눌러 물방울을 <b>반으로 나누어</b> 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "반으로 나누기");
      b.addEventListener("click", () => {
        if (n >= 3) return;
        haptic(HAPTIC.tap);
        n += 1;
        paint();
        if (n < 3) {
          c.say(n === 1 ? "물방울이 두 개로 나뉘었지만 둘 다 여전히 물이에요. <b>한 번 더</b> 나누어 보세요." : "네 방울로 나뉘었지만 모두 똑같은 물이에요. <b>한 번만 더</b> 나누어 볼까요?");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, choices[0])} 단순하게 쪼개기만 해서는 아무리 작게 나누어도 여전히 <b>물</b>이에요. 그렇다면 물에 전류를 흘려 주면 어떻게 될까요?`);
        c.finish();
      });
    },
  });
}

export function marks(c: OpenerCtx): void {
  layer(c, "marksBase");
  const sets = q<SVGGElement>(c, ".opn-g2u4-mk-b");
  const dz = q<SVGGElement>(c, ".opn-g2u4-mk-dz")[0];
  let n = 0;
  const paint = (): void => {
    sets.forEach((g, i) => g.classList.toggle("on", i <= n));
    dz?.classList.toggle("on", n >= 3);
    c.step.dataset.opnN = String(n);
  };
  paint();
  c.step.dataset.opnPhase = "ask";
  // 옛 열쇠 "그림이 비슷"은 새 첫 보기("그림이 복잡하고…")의 머리와 맞지 않아, 보기 글 자체(choices[0])를 열쇠로 쓴다
  const choices = ["그림이 복잡하고 서로 비슷해져서 구별하기 헷갈린다", "그림 기호가 많아질수록 외우고 쓰기가 더 편해진다", "원소가 늘어나도 처음 만든 그림 몇 개만으로 충분하다"];
  c.ask("옛날 과학자들은 원소마다 동그라미 모양의 그림 기호를 만들어 사용했어요. 만약 새로운 원소가 계속해서 많이 발견되면 어떻게 될까요?", {
    choices,
    neutral: true,
    good: "생각을 정했군요! 아래 버튼을 눌러 새로운 원소를 <b>발견</b>해 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      const b = ctlBtn(c, "새 원소 발견하기");
      b.addEventListener("click", () => {
        if (n >= 3) return;
        haptic(HAPTIC.tap);
        n += 1;
        paint();
        if (n < 3) {
          c.face("curious");
          c.say(n === 1 ? "원소의 그림 기호가 여섯 개로 늘어났어요. <b>한 번 더</b> 발견해 보세요." : "아홉 개가 되었어요! 슬슬 서로 비슷한 그림이 보이기 시작하네요. <b>한 번만 더</b> 눌러 볼까요?");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, choices[0])} 원소가 많아지니 그림 기호가 서로 비슷해서 <b>구별하기 헷갈려요</b>. 그래서 오늘날에는 알파벳 글자를 이용한 기호로 원소를 나타내요.`);
        c.finish();
      });
    },
  });
}

export function peek(c: OpenerCtx): void {
  layer(c, "peekBase");
  const shell = q<SVGGElement>(c, ".opn-g2u4-pk-shell")[0];
  const inner = q<SVGGElement>(c, ".opn-g2u4-pk-in")[0];
  const mark = q<SVGGElement>(c, ".opn-g2u4-pk-q")[0];
  const paint = (p: number): void => {
    if (shell) shell.style.opacity = String(1 - 0.82 * p);
    if (inner) inner.style.opacity = String(Math.max(0, (p - 0.25) / 0.75));
    if (mark) mark.style.opacity = String(Math.max(0, 1 - p * 2.5));
    c.step.dataset.opnP = p.toFixed(2);
  };
  paint(0);
  c.step.dataset.opnPhase = "ask";
  // 이 버튼은 누르고 있는 동안 확대된다(톡 누르면 거의 그대로). 수정안이 뺀 "꾹 눌러"를 버튼과 안내에 남긴다.
  const choices = ["내부에 원자를 이루는 더 작은 입자들이 있다", "단단한 공처럼 속까지 빈틈없이 꽉 찬 알갱이다", "아무런 입자도 없이 속이 완전히 텅 비어 있다"];
  c.ask("물질을 이루는 기본 입자인 원자를 아주 크게 확대해 볼 수 있다면, 원자 내부는 어떤 모습일까요?", {
    choices,
    neutral: true,
    good: "생각을 정했군요! 아래 버튼을 <b>꾹 눌러</b> 원자를 크게 확대해 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "꾹 눌러 원자 크게 확대하기");
      let p = 0;
      let holding = false;
      let last = 0;
      let raf = 0;
      let ended = false;
      const add = (d: number): void => {
        if (ended) return;
        p = Math.min(1, p + d);
        paint(p);
        if (p < 1) return;
        ended = true;
        holding = false;
        b.classList.remove("on");
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        // 고른 보기마다 말이 다르다(보기 글 자체를 열쇠로). 무대의 알갱이는 멈춘 그림이라 수정안의 "움직이고 있어요"는 "있어요"로 둔다.
        c.say(
          picked === choices[0]
            ? `${head(picked, choices[0])} 원자 한가운데에 중심 입자가 있고 그 둘레에도 <b>더 작은 입자들</b>이 있어요! 이 입자들의 정체는 무엇일까요?`
            : picked === choices[2]
              ? "대부분 빈 공간이지만, 한가운데에 중심 입자가 있고 그 둘레에도 <b>더 작은 입자들</b>이 있어요! 이 입자들의 정체는 무엇일까요?"
              : `${head(picked, choices[0])} 속이 꽉 차 있지 않고, 한가운데와 둘레에 <b>더 작은 입자들</b>이 있어요! 이 입자들의 정체는 무엇일까요?`,
        );
        c.finish();
      };
      const tick = (t: number): void => {
        if (!holding || !c.alive()) return;
        add((t - last) / 2600);
        last = t;
        if (holding) raf = requestAnimationFrame(tick);
      };
      const release = (): void => {
        holding = false;
        cancelAnimationFrame(raf);
        b.classList.remove("on");
      };
      b.addEventListener("pointerdown", (e) => {
        if (ended || holding) return;
        try {
          b.setPointerCapture(e.pointerId);
        } catch {
          /* 합성 이벤트에는 붙잡을 포인터가 없다 */
        }
        holding = true;
        last = performance.now();
        b.classList.add("on");
        haptic(HAPTIC.tap);
        raf = requestAnimationFrame(tick);
      });
      b.addEventListener("pointerup", release);
      b.addEventListener("pointercancel", release);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
      b.addEventListener("click", (e) => {
        if (e.detail === 0) add(0.34); // 키보드: 누를 때마다 3분의 1씩
      });
      c.onCleanup(() => cancelAnimationFrame(raf));
    },
  });
}

export function salt(c: OpenerCtx): void {
  layer(c, "saltBase");
  const spoon = q<SVGGElement>(c, ".opn-g2u4-st-spoon")[0];
  const grains = q<SVGGElement>(c, ".opn-g2u4-st-gr")[0];
  c.step.dataset.opnPhase = "ask";
  // 옛 열쇠 "조용히"는 새 첫 보기("기포나 불꽃 없이…")의 머리와 맞지 않아, 보기 글 자체(choices[0])를 열쇠로 쓴다.
  // 앞 레슨 1족 랩에서 나트륨은 불꽃 없이 기체만 냈다(불꽃은 칼륨). 그래서 질문의 "기포와 불꽃을 내며"는 "기포를 내며"로 둔다.
  const choices = ["기포나 불꽃 없이 물에 조용히 녹는다", "금속 나트륨처럼 기체를 내며 격렬하게 반응한다", "물 위에서 불꽃이 일어난다"];
  c.ask("앞서 금속 나트륨은 물에 넣었을 때 기포를 내며 격렬하게 반응했어요. 그렇다면 나트륨 성분이 들어 있는 소금(염화 나트륨)을 물에 넣으면 어떻게 될까요?", {
    choices,
    neutral: true,
    good: "생각을 정했군요! 아래 버튼을 눌러 소금을 물에 <b>넣어</b> 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "물에 소금 넣기");
      let n = 0;
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        n += 1;
        c.step.dataset.opnN = String(n);
        if (n === 1) {
          spoon?.classList.add("tip");
          grains?.classList.add("on");
          // 수정안의 "유리 막대로 저어 주기"는 무대에 유리 막대가 없어 "저어 주기"로 둔다
          b.textContent = "저어 주기";
          c.say("하얀 소금 알갱이가 물속으로 가라앉았어요. 아직 아무런 반응 없이 조용하네요. 이제 <b>저어</b> 볼까요?");
          return;
        }
        b.disabled = true;
        grains?.classList.add("gone");
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, choices[0])} 소금은 기포나 불꽃을 내지 않고 물에 <b>조용히 녹기만</b> 했어요! 똑같이 나트륨이 들어 있는데 왜 성질이 전혀 다를까요?`);
        c.finish();
      });
    },
  });
}

export function blot(c: OpenerCtx): void {
  layer(c, "blotBase");
  const spot = q<SVGGElement>(c, ".opn-g2u4-bl-spot")[0];
  const dropEl = q<SVGGElement>(c, ".opn-g2u4-bl-drop")[0];
  c.step.dataset.opnPhase = "ask";
  const choices = ["사방으로 고르게 둥근 모양으로 번진다", "어느 한쪽 방향으로만 길게 이동한다", "조금도 번지지 않고 떨어진 자리에 그대로 맺혀 있다"];
  c.ask("전류를 흘리지 않은 젖은 거름종이 한가운데에 파란색 황산 구리(Ⅱ) 수용액을 한 방울 떨어뜨리면 어떻게 될까요?", {
    choices,
    neutral: true,
    good: "생각을 정했군요! 아래 버튼을 눌러 수용액을 한 방울 <b>떨어뜨려</b> 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "수용액 한 방울 떨어뜨리기");
      b.addEventListener("click", () => {
        b.disabled = true;
        haptic(HAPTIC.tap);
        dropEl?.classList.add("fall");
        c.later(() => spot?.classList.add("on"), 350);
        c.later(() => {
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.step.dataset.opnN = "1";
          c.say(`${head(picked, choices[0])} 전류를 흘리지 않았을 때는 파란색 방울이 <b>사방으로 둥글게</b> 번졌어요. 그렇다면 이 거름종이 양 끝에 전류를 흘려 주면 어떻게 달라질까요?`);
          c.finish();
        }, 2100);
      });
    },
  });
}
