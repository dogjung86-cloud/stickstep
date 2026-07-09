// hookAsk — 훅 "예측 선택지" 공용 모듈. 모든 훅 장면은 이 모듈만 쓴다.
// 규칙(재발 방지 — CLAUDE.md '훅 예측 규칙' 참조):
//  · 데이터의 첫 번째 보기(choices[0])가 항상 과학적으로 옳은 예측이다
//  · 화면에는 뒤섞어 보여 준다(셔플) — "첫 번째만 누르면 정답" 학습을 막는다
//  · good(정답)·bad(오답) 피드백 문구가 반드시 달라야 한다.
//    오답 문구는 고른 오개념을 짚고 옳은 방향을 알려 준다(그냥 "틀렸어요" 금지)
//  · 예측은 채점하지 않는다(사전 예측 효과) — 어느 쪽을 골라도 onDone()으로 진행
//  · 정답이 없는 열린 예측(이후 실험으로 확인)은 neutral: true — 이때 good 문구는
//    "예측 완료! 실험으로 확인해요"처럼 정답 칭찬("완벽한 예측!")이 아니어야 한다

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";

export interface AskOpts {
  /** 보기 목록 — [0]이 옳은 예측(neutral이면 순서 무관) */
  choices: string[];
  /** 정답 선택 시 helper HTML (neutral이면 공통 문구) */
  good: string;
  /** 오답 선택 시 helper HTML — 오개념 교정 + 옳은 방향 제시 */
  bad?: string;
  /** 정답 없는 열린 예측 — 모든 선택이 good 문구, 오답 표시 없음 */
  neutral?: boolean;
  /** 표시 순서 셔플(기본 true) */
  shuffle?: boolean;
  onDone: () => void;
}

export function ask(box: HTMLElement, helper: HTMLElement, o: AskOpts): void {
  // 질문을 선택지 위로 끌어올린다 — 장면들은 질문을 helper(카드 아래)에 쓰고 ask()를 부르는데,
  // helper는 선택지보다 아래라 스크롤 전엔 질문이 안 보인다(실사용 피드백 2026-07-10).
  // helper의 현재 문구(=방금 쓴 질문)를 .hook-q로 복제하고, helper는 안내 문구로 교체한다.
  const q = helper.innerHTML.trim();
  if (q) {
    box.appendChild(el("div", { class: "hook-q", html: q }));
    helper.innerHTML = "정답을 몰라도 괜찮아요. 직감으로 하나를 골라 보세요, 예측은 채점하지 않아요!";
  }
  const order = o.choices.map((_, i) => i);
  if (o.shuffle !== false) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  order.forEach((idx) => {
    const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: o.choices[idx] });
    b.addEventListener("click", () => {
      if (box.classList.contains("locked")) return;
      box.classList.add("locked");
      const right = o.neutral || idx === 0;
      haptic(right ? HAPTIC.select : HAPTIC.wrong);
      const btns = [...box.querySelectorAll(".hook-choice")] as HTMLButtonElement[];
      btns.forEach((x) => {
        const mine = x === b;
        x.classList.add(mine ? (right ? "sel" : "miss") : "dim");
        x.setAttribute("aria-pressed", mine ? "true" : "false");
        x.disabled = !mine;
      });
      if (!right) {
        // 옳은 예측을 나란히 밝혀 준다
        const goodBtn = btns[order.indexOf(0)];
        goodBtn?.classList.remove("dim");
        goodBtn?.classList.add("reveal");
      }
      helper.innerHTML = right ? o.good : (o.bad ?? o.good);
      o.onDone();
    });
    box.appendChild(b);
  });
  box.classList.add("show");
}
