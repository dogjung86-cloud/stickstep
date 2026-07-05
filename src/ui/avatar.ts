// 스틱맨 쌤 아바타 — 만화 컷과 같은 손그림 래스터(발주본)를 앱 전역에서 공용.
// 만화·hook·recap 어디서든 같은 얼굴이 나오도록 여기서만 가져다 쓴다.
// 이미지가 없거나 로드에 실패하면 기존 SVG(stickmanHead/stickman)로 우아하게 폴백.
// 파일: public/comics/avatar/0..4.png (발주 프롬프트 qa/avatar_prompts.txt)

import { el } from "../core/dom";
import { stickman, stickmanHead } from "./figures";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export type AvatarKind = "smile" | "surprised" | "curious" | "wave" | "cheer";
const FILE: Record<AvatarKind, number> = { smile: 0, surprised: 1, curious: 2, wave: 3, cheer: 4 };
const FULL_BODY: AvatarKind[] = ["wave", "cheer"];

/** 아바타 요소 생성. setStickAvatar(el, kind)로 표정을 바꿀 수 있다. */
export function stickAvatar(kind: AvatarKind = "smile"): HTMLElement {
  const wrap = el("span", { class: `stick-avatar ${FULL_BODY.includes(kind) ? "full" : ""}` });
  mount(wrap, kind);
  return wrap;
}

/** 표정/포즈 교체(예: 컵을 만지면 놀란 얼굴). */
export function setStickAvatar(wrap: HTMLElement, kind: AvatarKind): void {
  wrap.classList.toggle("full", FULL_BODY.includes(kind));
  mount(wrap, kind);
}

function mount(wrap: HTMLElement, kind: AvatarKind): void {
  wrap.innerHTML = "";
  const img = el("img", {
    attrs: { src: `${base}comics/avatar/${FILE[kind]}.png`, alt: "", loading: "eager", "aria-hidden": "true" },
  });
  img.addEventListener("error", () => {
    wrap.innerHTML = FULL_BODY.includes(kind) ? stickman() : stickmanHead();
  });
  wrap.appendChild(img);
}
