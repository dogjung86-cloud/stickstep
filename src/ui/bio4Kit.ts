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

export function b4Ask(
  box: HTMLElement,
  question: string,
  choices: B4Choice[],
  onPick: (ok: boolean) => void,
): void {
  box.innerHTML = "";
  box.style.display = "";
  box.appendChild(el("div", { class: "hook-q", html: question }));
  const order = choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let picked = false;
  order.forEach((idx) => {
    const c = choices[idx];
    const b = el("button", { class: "hook-choice", text: c.t, attrs: { type: "button" } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      if (picked) return;
      picked = true;
      haptic(c.ok ? HAPTIC.correct : HAPTIC.wrong);
      const btns = [...box.querySelectorAll<HTMLButtonElement>(".hook-choice")];
      btns.forEach((x) => {
        const mine = x === b;
        x.classList.add(mine ? (c.ok ? "sel" : "miss") : "dim");
        x.disabled = !mine;
      });
      if (!c.ok) {
        const goodBtn = btns.find((x) => x.textContent === choices.find((y) => y.ok)?.t);
        goodBtn?.classList.remove("dim");
        goodBtn?.classList.add("reveal");
      }
      onPick(c.ok);
    });
    box.appendChild(b);
  });
  window.setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "nearest" }), 130);
}
