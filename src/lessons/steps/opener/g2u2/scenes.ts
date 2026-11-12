// 중2 Ⅱ 도입 아홉 장면. 모두 같은 꼴이다: 내기(예측, 정오를 매기지 않는다) → 손으로 한 일이 장면을 바꾼다 → 예측과 견준다.
// 도입은 소재와 질문만 내놓고 까닭(원리)은 말하지 않는다. 바로 뒤의 랩이 받는다.
//   sea    (l1) 지구의 물을 다 모으면: 꾹 눌러 물을 모은다
//   grain  (l2) 암석을 확대하면: 돋보기를 댄다
//   lava   (l3) 용암과 마그마: 꾹 눌러 시간을 보낸다
//   jar    (l4) 흙탕물 병: 꾹 눌러 가만히 둔다
//   snow   (l5) 눈 더미: 꾹 눌러 누른다
//   pebble (l6) 강가의 자갈: 두 번 눌러 강을 거슬러 오른다
//   bottle (l7) 물을 채운 유리병: 꾹 눌러 얼린다
//   paper  (l8) 찢어진 종이: 눌러 맞댄다
//   ice    (l9) 언 호수의 얼음판: 눌러 민다
import type { OpenerCtx } from "../opener";
import { bet, clamp01, ctlBtn, head, hint, hold, layer, part, wrap, haptic, HAPTIC } from "./common";

export function sea(c: OpenerCtx): void {
  layer(c, "seaBase");
  const wet = part(c, "opn-g2u2-se-wet"), ball = part(c, "opn-g2u2-se-ball");
  bet(c, "지구의 물을 전부 모아 공 하나로 뭉치면 얼마나 클까요?", ["지구만큼 크다", "지구의 절반쯤 된다", "구슬처럼 작다"], "예측 완료! 버튼을 <b>꾹 눌러</b> 지구의 물을 모아 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "꾹 눌러 물 모으기");
    hint(c, "hold:go");
    hold(c, b, 2000, (p) => {
      wet.style.opacity = String(1 - p);
      ball.style.transform = `scale(${p.toFixed(3)})`;
    }, () => wrap(c, `${head(pred, "구슬")} 바다와 강, 빙하의 물을 다 모아도 <b>작은 구슬</b>만 해요. 지구의 나머지는 무엇일까요?`));
  });
}

export function grain(c: OpenerCtx): void {
  layer(c, "grainBase");
  bet(c, "이 암석을 돋보기로 크게 보면 어떻게 보일까요?", ["한 가지 색으로 고르다", "색이 다른 알갱이들이 보인다", "작은 구멍만 보인다"], "예측 완료! 버튼을 눌러 <b>돋보기</b>를 대 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "돋보기 대 보기");
    hint(c, "go");
    b.addEventListener("click", () => {
      b.disabled = true;
      haptic(HAPTIC.tap);
      c.stage.classList.add("zoom");
      c.later(() => wrap(c, `${head(pred, "색이 다른")} 흰색, 분홍색, 검은색 <b>알갱이</b>가 섞여 있어요. 이 알갱이들은 무엇이고 어떻게 구별할까요?`), 900);
    });
  });
}

export function lava(c: OpenerCtx): void {
  layer(c, "lavaBase");
  const top = part(c, "opn-g2u2-lv-topcool"), deep = part(c, "opn-g2u2-lv-deepcool"), heat = part(c, "opn-g2u2-lv-heat");
  bet(c, "땅 위로 흘러나온 것과 땅속 깊이 있는 것, 어느 쪽이 먼저 식을까요?", ["땅 위로 흘러나온 쪽", "땅속 깊이 있는 쪽", "똑같이 식는다"], "예측 완료! 버튼을 <b>꾹 눌러</b> 시간을 보내 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "꾹 눌러 시간 보내기");
    hint(c, "hold:go");
    hold(c, b, 2400, (p) => {
      top.style.opacity = String(clamp01(p * 1.8));
      heat.style.opacity = String(1 - clamp01(p * 1.8));
      deep.style.opacity = String(p * 0.16);
    }, () => wrap(c, `${head(pred, "땅 위")} 땅 위의 것은 벌써 굳었는데 땅속의 것은 아직 뜨거워요. 식는 <b>빠르기</b>가 다르면 굳은 돌도 다를까요?`));
  });
}

export function jar(c: OpenerCtx): void {
  layer(c, "jarBase");
  const m = [1, 2, 3].map((i) => part(c, `opn-g2u2-jr-m${i}`)), s = [1, 2, 3].map((i) => part(c, `opn-g2u2-jr-s${i}`));
  bet(c, "자갈, 모래, 진흙을 물에 넣고 흔들었어요. 무엇이 가장 먼저 가라앉을까요?", ["자갈", "모래", "진흙"], "예측 완료! 버튼을 <b>꾹 눌러</b> 병을 가만히 두어 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "꾹 눌러 가만히 두기");
    hint(c, "hold:go");
    hold(c, b, 2600, (p) => {
      [0, 1, 2].forEach((i) => {
        const k = clamp01(p * 3 - i);
        s[i].style.opacity = String(k);
        m[i].style.opacity = String(1 - k);
      });
    }, () => wrap(c, `${head(pred, "자갈")} 굵은 <b>자갈</b>부터 가라앉아 층이 생겼어요. 이런 층이 아주 오랫동안 쌓이면 어떻게 될까요?`));
  });
}

export function snow(c: OpenerCtx): void {
  layer(c, "snowBase");
  const soft = part(c, "opn-g2u2-sn-soft"), plate = part(c, "opn-g2u2-sn-plate"), hard = part(c, "opn-g2u2-sn-hard");
  bet(c, "폭신한 눈 더미를 판으로 세게 누르면 어떻게 될까요?", ["녹아서 물이 된다", "단단한 덩어리가 된다", "다시 부풀어 오른다"], "예측 완료! 버튼을 <b>꾹 눌러</b> 눈을 눌러 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "꾹 눌러 누르기");
    hint(c, "hold:go");
    hold(c, b, 2000, (p) => {
      plate.style.transform = `translateY(${(p * 158).toFixed(1)}px)`;
      soft.style.transform = `scaleY(${(1 - p * 0.62).toFixed(3)})`;
      soft.style.opacity = String(1 - clamp01(p * 2 - 1));
      hard.style.opacity = String(clamp01(p * 2 - 1));
    }, () => wrap(c, `${head(pred, "단단한")} 녹이지 않았는데 폭신한 눈이 <b>단단한 덩어리</b>가 됐어요. 땅속의 암석도 세게 눌리면 달라질까요?`));
  });
}

export function pebble(c: OpenerCtx): void {
  layer(c, "pebbleBase");
  bet(c, "강가의 둥근 자갈은 어디에서 왔을까요?", ["산의 큰 바위가 부서져서", "강바닥에서 저절로 생겨서", "바다에서 밀려 올라와서"], "예측 완료! 버튼을 눌러 강을 <b>거슬러 올라가</b> 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "강을 거슬러 올라가기");
    hint(c, "go");
    let n = 0;
    b.addEventListener("click", () => {
      if (n >= 2) return;
      n += 1;
      haptic(HAPTIC.tap);
      c.stage.classList.add(`up${n}`);
      if (n === 1) {
        c.say("강 중간의 돌은 더 크고 <b>덜 둥글어요</b>. 한 번 더 올라가 보세요.");
        return;
      }
      b.disabled = true;
      c.later(() => wrap(c, `${head(pred, "산의")} 산의 모난 바위가 부서지고 깎여 여기까지 왔어요. 이 자갈은 앞으로 또 <b>무엇이 될까요</b>?`), 800);
    });
  });
}

export function bottle(c: OpenerCtx): void {
  layer(c, "bottleBase");
  const ice = part(c, "opn-g2u2-bt-ice"), crack = part(c, "opn-g2u2-bt-crack"), cold = part(c, "opn-g2u2-bt-cold");
  bet(c, "물을 가득 채워 뚜껑을 닫은 유리병을 꽁꽁 얼리면 어떻게 될까요?", ["병에 금이 간다", "병이 안쪽으로 찌그러진다", "아무 일도 없다"], "예측 완료! 버튼을 <b>꾹 눌러</b> 병을 얼려 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "꾹 눌러 얼리기");
    hint(c, "hold:go");
    hold(c, b, 2200, (p) => {
      cold.style.opacity = String(clamp01(p * 3));
      ice.style.opacity = String(clamp01(p * 1.3));
      crack.style.opacity = String(clamp01(p * 4 - 3));
    }, () => wrap(c, `${head(pred, "병에 금")} 물이 얼자 병에 <b>금</b>이 갔어요. 바위틈에 스며든 물이 얼어도 이런 일이 생길까요?`));
  });
}

export function paper(c: OpenerCtx): void {
  layer(c, "paperBase");
  bet(c, "찢어진 두 조각이 원래 한 장이었는지 알려면 무엇을 봐야 할까요?", ["찢어진 가장자리의 모양", "글줄과 그림이 이어지는지", "두 가지를 모두"], "예측 완료! 버튼을 눌러 두 조각을 <b>맞대</b> 보세요.", () => {
    const b = ctlBtn(c, "go", "두 조각 맞대기");
    hint(c, "go");
    b.addEventListener("click", () => {
      b.disabled = true;
      haptic(HAPTIC.tap);
      c.stage.classList.add("join");
      c.later(() => wrap(c, "가장자리가 맞물리고 <b>글줄과 그림</b>까지 이어져요. 바다를 사이에 둔 대륙도 이렇게 맞춰 볼 수 있을까요?"), 900);
    });
  });
}

export function ice(c: OpenerCtx): void {
  layer(c, "iceBase");
  bet(c, "언 호수의 얼음판을 밀면 어디가 가장 요란할까요?", ["얼음판의 한가운데", "얼음판끼리 맞닿은 가장자리", "어디나 똑같다"], "예측 완료! 버튼을 눌러 왼쪽 <b>얼음판</b>을 밀어 보세요.", (pred) => {
    const b = ctlBtn(c, "go", "얼음판 밀기");
    hint(c, "go");
    b.addEventListener("click", () => {
      b.disabled = true;
      haptic(HAPTIC.tap);
      c.stage.classList.add("push");
      c.later(() => wrap(c, `${head(pred, "얼음판끼리")} 한가운데는 조용하고 <b>맞닿은 가장자리</b>만 부서져요. 지구에서 지진이 잦은 곳도 정해져 있을까요?`), 900);
    });
  });
}
