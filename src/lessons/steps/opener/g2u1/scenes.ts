// 중2 Ⅰ 도입 아홉 장면. 모두 같은 형식이다: 내기(정오를 매기지 않는 예측) → 손으로 한 일이 장면을 바꾼다 → 예측과 견주고 질문을 남긴다.
// 도입은 까닭(밀도, 용해도, 녹는점 같은 원리)을 말하지 않는다. 바로 뒤의 랩이 받는다.
import { haptic, HAPTIC } from "../../../../core/haptics";
import type { OpenerCtx } from "../opener";
import { bet, ctlBtn, head, hit, hold, layer, metaOf, part, wrap } from "./common";

const ease = (x: number): number => x * x * (3 - 2 * x);

/** g2u1l1 「똑같아 보이는 두 반지, 저울은?」 반지를 눌러 접시에 올리면 저울이 한쪽으로 기운다. */
export function rings(c: OpenerCtx): void {
  const M = metaOf(c).rings;
  layer(c, "ringsBase");
  const beam = part(c, ".opn-g2u1-rg-beam");
  let n = 0;
  const els = [part(c, ".opn-g2u1-rg-ring.r1"), part(c, ".opn-g2u1-rg-ring.r2")];
  const put = (i: number, dy: number): void => {
    const g = els[i];
    if (g) g.style.transform = `translate(${M.pan[i][0] - M.ring[i][0]}px, ${M.pan[i][1] - M.ring[i][1] + dy}px)`;
  };
  bet(c, "크기도 색도 똑같은 반지 둘이에요. 하나는 백금, 하나는 은이에요. 저울에 올리면?", ["한쪽으로 기운다", "수평을 이룬다"], "<b>반지</b>를 눌러 접시에 하나씩 올려 보세요.", (picked) => {
    M.ring.forEach(([x, y], i) =>
      hit(c, `반지 ${i + 1} 접시에 올리기`, x - 60, y - 60, 120, 120, (b) => {
        b.disabled = true;
        put(i, 0);
        n += 1;
        c.step.dataset.opnN = String(n);
        if (n < 2) return;
        c.later(() => {
          if (beam) beam.style.transform = "rotate(-9.6deg)";
          put(0, M.drop);
          put(1, -M.drop);
          c.later(() => wrap(c, `${head(picked, "한쪽으로")} 저울이 <b>한쪽으로 기울었어요</b>. 크기도 색도 같은데 무엇이 다를까요?`), 700);
        }, 600);
      }),
    );
  });
}

/** g2u1l2 「가만히 누우면 뜰까요?」 수영장과 소금 호수에 눕힌다. */
export function sea(c: OpenerCtx): void {
  const M = metaOf(c).sea;
  layer(c, "seaBase");
  let n = 0;
  bet(c, "왼쪽은 수영장, 오른쪽은 소금이 아주 많이 녹은 호수예요. 가만히 누우면?", ["호수에서만 둥둥 뜬다", "둘 다 똑같이 뜬다", "둘 다 가라앉는다"], "<b>두 물</b>을 차례로 눌러 눕혀 보세요.", (picked) => {
    M.hit.forEach(([x, y, w, h], i) =>
      hit(c, i ? "소금 호수에 눕기" : "수영장에 눕기", x, y, w, h, (b) => {
        b.disabled = true;
        const man = part(c, `.opn-g2u1-se-man.m${i + 1}`);
        if (man) man.style.transform = `translateY(${i ? 14 : M.sink}px)`;
        man?.classList.add("in");
        n += 1;
        c.step.dataset.opnN = String(n);
        if (n === 2) c.later(() => wrap(c, `${head(picked, "호수에서만")} 수영장에서는 몸이 잠기는데 호수에서는 <b>둥둥</b> 떠요. 두 물은 무엇이 다를까요?`), 1100);
      }),
    );
  });
}

/** g2u1l3 「설탕은 넣는 대로 다 녹을까요?」 한 숟갈씩 넣는다. */
export function cocoa(c: OpenerCtx): void {
  const M = metaOf(c).cocoa;
  layer(c, "cocoaBase");
  const fall = part(c, ".opn-g2u1-cc-fall");
  let n = 0;
  bet(c, "따뜻한 코코아에 설탕을 한 숟갈씩 계속 넣으며 저을 거예요. 어떻게 될까요?", ["어느 순간부터 바닥에 쌓인다", "넣는 대로 다 녹는다"], "버튼을 눌러 <b>설탕</b>을 넣어 보세요.", (picked) => {
    const b = ctlBtn(c, "설탕 한 숟갈 넣기");
    b.addEventListener("click", () => {
      if (n >= M.spoons) return;
      n += 1;
      haptic(HAPTIC.tap);
      c.step.dataset.opnN = String(n);
      fall?.classList.remove("go");
      void fall?.getBoundingClientRect();
      fall?.classList.add("go");
      b.textContent = n < M.spoons ? `설탕 한 숟갈 넣기 (${n}숟갈 넣음)` : "설탕 여섯 숟갈을 넣었어요";
      if (n > M.limit) c.later(() => c.stage.classList.add(`pile${n - M.limit}`), 500);
      if (n === M.limit) c.say("네 숟갈째도 저으니 <b>다 녹았어요</b>. 더 넣어 보세요.");
      if (n === M.limit + 1) c.later(() => c.say("어, 바닥에 <b>녹지 않은 설탕</b>이 보여요. 한 번 더!"), 500);
      if (n === M.spoons) {
        b.disabled = true;
        c.later(() => wrap(c, `${head(picked, "어느 순간")} 다섯째 숟갈부터는 저어도 <b>바닥에 쌓였어요</b>. 녹는 양에 끝이 있는 걸까요?`), 1000);
      }
    });
  });
}

/** g2u1l4 「한여름 낮, 물고기는 어디에?」 꾹 눌러 한낮으로 보낸다. */
export function fish(c: OpenerCtx): void {
  const M = metaOf(c).fish;
  layer(c, "fishBase");
  const sun = part(c, ".opn-g2u1-fs-sun");
  const fs = [1, 2, 3].map((i) => part(c, `.opn-g2u1-fs-fish.f${i}`));
  const paint = (p: number): void => {
    if (sun) sun.style.transform = `translateY(${-M.sunUp * ease(p)}px)`;
    fs.forEach((g, i) => {
      if (g) g.style.transform = `translateY(${-M.rise * ease(Math.max(0, Math.min(1, p * 1.25 - i * 0.1)))}px)`;
    });
    c.stage.classList.toggle("gulp", p > 0.85);
  };
  paint(0);
  bet(c, "이른 아침의 연못이에요. 해가 높이 떠 물이 따뜻해지면 물고기는?", ["수면 가까이 올라온다", "바닥 가까이 내려간다", "제자리에 그대로 있다"], "버튼을 <b>꾹 눌러</b> 한낮으로 보내 보세요.", (picked) => {
    hold(c, ctlBtn(c, "꾹 눌러 한낮으로"), 3000, paint, () => wrap(c, `${head(picked, "수면")} 물고기가 <b>수면</b>에서 입을 뻐끔거려요. 따뜻해진 물속에서 무엇이 모자라졌을까요?`));
  });
}

/** g2u1l5 「손 위의 금속 동전은?」 꾹 눌러 손에 올려 둔다. */
export function gallium(c: OpenerCtx): void {
  layer(c, "galliumBase");
  const coin = part(c, ".opn-g2u1-ga-coin");
  const pool = part(c, ".opn-g2u1-ga-pool");
  const paint = (p: number): void => {
    const k = ease(p);
    if (coin) {
      coin.style.transform = `scale(${1 - 0.8 * k})`;
      coin.style.opacity = String(1 - k * 0.9);
    }
    if (pool) {
      pool.style.transform = `scale(${0.3 + 0.7 * k})`;
      pool.style.opacity = String(Math.min(1, k * 1.6));
    }
  };
  paint(0);
  bet(c, "손바닥에 금속 동전 둘을 올렸어요. 왼쪽은 갈륨, 오른쪽은 철로 만들었어요. 그대로 두면?", ["갈륨 동전만 녹는다", "둘 다 따뜻해지기만 한다", "둘 다 녹는다"], "버튼을 <b>꾹 눌러</b> 손에 올려 두세요.", (picked) => {
    hold(c, ctlBtn(c, "꾹 눌러 손에 올려 두기"), 3200, paint, () => wrap(c, `${head(picked, "갈륨 동전만")} 갈륨 동전만 <b>녹아 흘렀어요</b>. 같은 손 위인데 철 동전은 왜 그대로일까요?`));
  });
}

/** g2u1l6 「우유는 한 가지 물질일까요?」 눌러서 확대해 본다. */
export function milk(c: OpenerCtx): void {
  layer(c, "milkBase");
  bet(c, "컵에 담긴 우유는 어디를 봐도 하얘요. 아주 크게 확대해 보면?", ["여러 가지 알갱이가 보인다", "어디나 똑같이 하얗다"], "버튼을 눌러 <b>확대</b>해 보세요.", (picked) => {
    const b = ctlBtn(c, "우유를 확대해 보기");
    b.addEventListener("click", () => {
      b.disabled = true;
      haptic(HAPTIC.tap);
      c.stage.classList.add("zoom");
      c.step.dataset.opnN = "1";
      c.later(() => wrap(c, `${head(picked, "여러 가지")} 물속에 <b>기름방울</b>과 작은 알갱이가 떠 있어요. 우유는 물질 하나가 아니었네요.`), 900);
    });
  });
}

/** g2u1l7 「섞은 간장과 올리브유를 두면?」 꾹 눌러 기다린다. */
export function soy(c: OpenerCtx): void {
  layer(c, "soyBase");
  const mix = part(c, ".opn-g2u1-sy-mix");
  const paint = (p: number): void => {
    if (mix) mix.style.opacity = String(1 - ease(p));
  };
  bet(c, "간장과 올리브유를 한 병에 넣고 세게 흔들었어요. 가만히 두면?", ["올리브유가 위로 뜬다", "간장이 위로 뜬다", "섞인 채 그대로다"], "버튼을 <b>꾹 눌러</b> 기다려 보세요.", (picked) => {
    hold(c, ctlBtn(c, "꾹 눌러 가만히 두기"), 3000, paint, () => wrap(c, `${head(picked, "올리브유")} 위에는 <b>올리브유</b>, 아래에는 <b>간장</b>이 모였어요. 간장만 따로 꺼낼 수 있을까요?`));
  });
}

/** g2u1l8 「시럽을 냉장고에 두면?」 꾹 눌러 차갑게 둔다. */
export function syrup(c: OpenerCtx): void {
  layer(c, "syrupBase");
  const x = part(c, ".opn-g2u1-sr-xtal");
  const cold = part(c, ".opn-g2u1-sr-cold");
  const paint = (p: number): void => {
    if (cold) cold.style.opacity = String(Math.min(1, p * 3));
    if (x) {
      const k = ease(Math.max(0, p * 1.3 - 0.3));
      x.style.opacity = String(Math.min(1, k * 2));
      x.style.transform = `scaleY(${0.2 + 0.8 * k})`;
    }
  };
  paint(0);
  bet(c, "뜨거운 물에 설탕을 듬뿍 녹여 만든 투명한 시럽이에요. 냉장고에 오래 두면?", ["바닥에 흰 알갱이가 생긴다", "투명한 그대로다", "전체가 하얗게 흐려진다"], "버튼을 <b>꾹 눌러</b> 냉장고에 넣어 두세요.", (picked) => {
    hold(c, ctlBtn(c, "꾹 눌러 냉장고에 두기"), 3000, paint, () => wrap(c, `${head(picked, "바닥에")} 아무것도 넣지 않았는데 <b>흰 알갱이</b>가 생겼어요. 이 알갱이는 어디에서 왔을까요?`));
  });
}

/** g2u1l9 「뚜껑에 맺힌 물방울은 짤까요?」 꾹 눌러 바닷물을 끓인다. */
export function pot(c: OpenerCtx): void {
  layer(c, "potBase");
  const paint = (p: number): void => {
    c.stage.classList.toggle("s1", p > 0.15);
    c.stage.classList.toggle("s2", p > 0.45);
    c.stage.classList.toggle("s3", p > 0.75);
  };
  bet(c, "짠 바닷물을 끓이면서 기울인 뚜껑에 맺힌 물방울을 컵에 모을 거예요. 컵의 물맛은?", ["짜지 않다", "바닷물만큼 짜다", "바닷물보다 더 짜다"], "버튼을 <b>꾹 눌러</b> 바닷물을 끓여 보세요.", (picked) => {
    c.stage.classList.add("fire");
    hold(c, ctlBtn(c, "꾹 눌러 끓이기"), 3400, paint, () => wrap(c, `${head(picked, "짜지 않다")} 컵에 모인 물은 <b>짜지 않아요</b>. 소금은 어디에 남았고, 물만 어떻게 건너왔을까요?`));
  });
}
