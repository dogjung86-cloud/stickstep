// 중2 Ⅳ 도입 다섯 장면. 형식은 모두 같다: 내기(정오를 매기지 않는 예측)를 먼저 걸고 → 버튼을 눌러 장면을 바꾸고 → 끝에서 예측과 견준다.
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
const head = (picked: string, right: string): string => (picked.startsWith(right) ? "예측대로" : "예측과 달리");

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
  c.ask("물방울을 반으로, 또 반으로 계속 나누면 어떻게 될까요?", {
    choices: ["아무리 나눠도 물이다", "점점 다른 물질이 된다", "언젠가 물이 사라진다"],
    neutral: true,
    good: "예측 완료! 버튼을 눌러 물방울을 <b>나눠</b> 보세요.",
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
          c.say(n === 1 ? "두 방울이 됐어요. 둘 다 물이에요. <b>더</b> 나눠 보세요." : "네 방울도 모두 물이에요. 한 번 <b>더</b> 나눠요.");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, "아무리")} 작게 나눠도 여전히 <b>물</b>이에요. 나누는 대신 전기를 쓰면 어떨까요?`);
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
  c.ask("옛 과학자는 원소마다 동그라미 그림을 정했어요. 원소가 계속 발견되면요?", {
    choices: ["그림이 비슷해져 헷갈린다", "그림이 늘어 더 편해진다", "그림 몇 개로 충분하다"],
    neutral: true,
    good: "예측 완료! 버튼을 눌러 새 원소를 <b>발견</b>해 보세요.",
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
          c.say(n === 1 ? "그림 기호가 여섯 개가 됐어요. <b>더</b> 발견해 보세요." : "아홉 개예요. 슬슬 비슷한 그림이 보여요. 한 번 <b>더</b>!");
          return;
        }
        b.disabled = true;
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, "그림이 비슷")} 그림이 서로 비슷해 <b>헷갈려요</b>. 그래서 지금은 알파벳으로 나타내요.`);
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
  c.ask("원자를 아주 크게 확대해 볼 수 있다면 속은 어떤 모습일까요?", {
    choices: ["속에 더 작은 것이 있다", "속까지 꽉 찬 알갱이다", "속이 텅 비어 있다"],
    neutral: true,
    good: "예측 완료! 버튼을 <b>꾹 눌러</b> 원자를 확대해 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "꾹 눌러 확대하기");
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
        const h = picked.startsWith("속에 더") ? "예측대로" : picked.startsWith("속이 텅") ? "빈 곳도 많지만" : "예측과 달리";
        c.say(`${h} 가운데에 무언가 있고 둘레에도 <b>더 작은 것</b>이 있어요. 정체가 무엇일까요?`);
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
  c.ask("나트륨은 물과 격렬하게 반응했어요. 나트륨이 든 소금을 물에 넣으면요?", {
    choices: ["조용히 녹는다", "기체를 내며 반응한다", "불꽃이 인다"],
    neutral: true,
    good: "예측 완료! 버튼을 눌러 소금을 물에 <b>넣어</b> 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "소금 넣기");
      let n = 0;
      b.addEventListener("click", () => {
        haptic(HAPTIC.tap);
        n += 1;
        c.step.dataset.opnN = String(n);
        if (n === 1) {
          spoon?.classList.add("tip");
          grains?.classList.add("on");
          b.textContent = "저어 주기";
          c.say("소금 알갱이가 물속으로 가라앉아요. 아직 조용해요. <b>저어</b> 볼까요?");
          return;
        }
        b.disabled = true;
        grains?.classList.add("gone");
        haptic(HAPTIC.correct);
        c.face("surprised");
        c.say(`${head(picked, "조용히")} 소금은 <b>조용히 녹기만</b> 했어요. 같은 나트륨인데 왜 다를까요?`);
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
  c.ask("젖은 거름종이에 파란 황산 구리 수용액을 한 방울 떨어뜨리면요?", {
    choices: ["사방으로 둥글게 번진다", "한쪽으로만 번진다", "번지지 않고 그대로다"],
    neutral: true,
    good: "예측 완료! 버튼을 눌러 한 방울 <b>떨어뜨려</b> 보세요.",
    onDone: (picked) => {
      c.step.dataset.opnPhase = "play";
      c.face("curious");
      const b = ctlBtn(c, "한 방울 떨어뜨리기");
      b.addEventListener("click", () => {
        b.disabled = true;
        haptic(HAPTIC.tap);
        dropEl?.classList.add("fall");
        c.later(() => spot?.classList.add("on"), 350);
        c.later(() => {
          haptic(HAPTIC.correct);
          c.face("surprised");
          c.step.dataset.opnN = "1";
          c.say(`${head(picked, "사방")} 파란색은 <b>사방으로 둥글게</b> 번졌어요. 여기에 전기를 흘리면 달라질까요?`);
          c.finish();
        }, 2100);
      });
    },
  });
}
