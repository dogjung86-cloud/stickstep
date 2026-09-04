// bio4Kit — 중1 Ⅱ 「생물의 구성과 다양성」 v3 공용 킷.
// 색·조사(助詞) 처리·공용 상수의 단일 진실 공급원. 랩·그림·콘텐츠가 함께 쓴다.
// (현행 unit2 계열(bio3Figures 등)은 비교 대상 보존을 위해 여기서 참조하지 않는다.)

/** v3 전용 팔레트 — 토큰(--subj-bio #12B886)과 한 식구, 무대 위 보조색만 여기서. */
export const B4 = {
  bio: "#12B886", // 단원 액센트(토큰과 동일값 — 캔버스/SVG 하드코딩용)
  bioDeep: "#0CA678",
  ink: "#191F28",
  membrane: "#F59F00", // 세포막(앰버)
  nucleus: "#7048E8", // 핵(바이올렛)
  mito: "#F03E3E", // 마이토콘드리아(레드)
  chloro: "#2F9E44", // 엽록체(그린)
  wall: "#846358", // 세포벽(브라운)
  cytoAnimal: "#FFE8CC", // 동물세포 세포질(살구)
  cytoPlant: "#E9FAC8", // 식물세포 세포질(연연두)
  water: "#4DABF7",
  danger: "#F04452",
} as const;

/** 받침 유무로 조사를 고른다 — "엽록체은" 같은 문장 사고 방지(SCI_GUIDE 관행).
 *  pair 예: "이/가", "은/는", "을/를", "과/와", "으로/로" */
export function josa(word: string, pair: string): string {
  const [withBatchim, without] = pair.split("/");
  const last = word.replace(/<[^>]*>/g, "").trim().slice(-1);
  const code = last.charCodeAt(0);
  const hasBatchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return word + (hasBatchim ? withBatchim : without);
}

/** 발주 이미지 베이스 경로(public/bio4/...) — lazy 금지(스크롤 컨테이너 사고 14). */
export const B4_BASE = ((import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/") + "bio4/";

// ── 랩 내 판정 선택지 공용(.hook-choices/.hook-q 스타일 재사용) ──────────
// 훅의 hookAsk와 달리 정오(ok)를 onPick으로 돌려준다 — recordQuiz 여부는 랩이 결정.
// 질문은 반드시 선택지 위(.hook-q)에 뜬다(전 과목 배치 규칙).
import { el } from "../core/dom";
import { haptic, HAPTIC } from "../core/haptics";

export interface B4Choice {
  t: string;
  ok: boolean;
}

/** b4Ask 부가 옵션(2026-09-04 오답 피드백 재설계 — 사용자 피드백 "오답이면 누른 보기 밑에 정답이 떠야").
 *  why: 오답일 때 정답 카드 안에 붙는 이유 한 줄(HTML 허용, 40자 이하 — 폰에서 2줄).
 *  onNext: 다음 국면 콜백. 정답이면 nextDelay(기본 1100ms) 뒤 자동, 오답이면 정답 카드의 "다음" 필을 눌러야 넘어간다.
 *    (랩이 tm.later(askNext, 1400)로 다음 질문을 덮어쓰면 정답 표시를 1.5초 만에 잃던 결함의 수정 — 랩은 타이머 대신 이걸 쓴다.)
 *  predict: 예측 질문(정답 공개 없음) — 어느 보기를 골라도 기록만 하고 다음 국면으로 자동 진행. 실험이 답을 보여주는 자리에. */
export interface B4AskOpts {
  why?: string;
  onNext?: () => void;
  nextDelay?: number;
  predict?: boolean;
}

/** 랩 판정 상자. 오답이면 정답 보기를 누른 보기 바로 아래로 옮겨 초록 카드("정답" 태그 + 문장 + 이유 + "다음" 필)로
 *  바꾸고 나머지 보기는 접는다(.gone) — 판정 국면 높이가 보기 3개 상태를 넘지 않아 한 화면 예산이 유지된다.
 *  카드는 .hook-choice.reveal(div)이라 기존 e2e 선택자(.hook-choice.reveal / .miss)가 그대로 맞는다. */
export function b4Ask(
  box: HTMLElement,
  question: string,
  choices: B4Choice[],
  onPick: (ok: boolean) => void,
  opts: B4AskOpts = {},
): void {
  box.innerHTML = "";
  box.style.display = "";
  // ui.css의 .hook-choices는 기본 display:none이고 .show일 때만 flex다(hookAsk와 동일 계약).
  // 이 줄이 빠지면 판정 질문이 DOM에만 있고 화면엔 안 보인다 — 합성 클릭 e2e는 보이지 않는
  // 버튼도 눌러 통과하므로 가시성 검증은 offsetParent로 해야 한다(2026-08-10 실사용 적발).
  box.classList.add("show");
  const qEl = el("div", { class: "hook-q", html: question });
  box.appendChild(qEl);
  const order = choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const good = choices.find((y) => y.ok);
  let picked = false;
  // 자동 진행(정답·예측) — 그 사이 랩이 상자를 갈아치웠으면(showBtn 등) 건너뛴다.
  const goNext = (): void => {
    const fn = opts.onNext;
    if (!fn) return;
    window.setTimeout(() => {
      if (box.isConnected && box.contains(qEl)) fn();
    }, opts.nextDelay ?? 1100);
  };
  order.forEach((idx) => {
    const c = choices[idx];
    const b = el("button", { class: "hook-choice", text: c.t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (picked) return;
      picked = true;
      const btns = [...box.querySelectorAll<HTMLButtonElement>(".hook-choice")];
      if (opts.predict) {
        // 예측: 정오 표시 없이 고른 보기만 남기고 다음 국면으로(실험이 답을 보여준다).
        haptic(HAPTIC.tap);
        btns.forEach((x) => {
          x.classList.add(x === b ? "sel" : "dim");
          x.disabled = true;
        });
        onPick(c.ok);
        goNext();
        return;
      }
      haptic(c.ok ? HAPTIC.correct : HAPTIC.wrong);
      btns.forEach((x) => {
        const mine = x === b;
        x.classList.add(mine ? (c.ok ? "sel" : "miss") : "dim");
        x.disabled = !mine;
      });
      if (c.ok) {
        onPick(true);
        goNext();
        return;
      }
      // 오답 — 정답 보기를 누른 보기 바로 아래의 초록 카드로 바꾸고, 나머지 보기는 접는다.
      const goodBtn = btns.find((x) => x.textContent === good?.t);
      btns.forEach((x) => {
        if (x !== b && x !== goodBtn) x.classList.add("gone");
      });
      const card = el(
        "div",
        { class: "hook-choice reveal hook-ans" },
        el("span", { class: "hook-ans-row" }, el("span", { class: "hook-ans-tag", text: "정답" }), el("span", { class: "hook-ans-t", text: good?.t ?? "" })),
      );
      if (opts.why || opts.onNext) {
        const foot = el("span", { class: "hook-ans-foot" });
        if (opts.why) foot.appendChild(el("span", { class: "hook-why", html: opts.why }));
        const fn = opts.onNext;
        if (fn) {
          const next = el("button", { class: "hook-next", text: "다음", attrs: { type: "button" } }) as HTMLButtonElement;
          next.addEventListener("click", () => {
            next.disabled = true;
            haptic(HAPTIC.tap);
            fn();
          });
          foot.appendChild(next);
        }
        card.appendChild(foot);
      }
      goodBtn?.remove();
      b.after(card);
      onPick(false);
    });
    box.appendChild(b);
  });
  window.setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 130);
}
