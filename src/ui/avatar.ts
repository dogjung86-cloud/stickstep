// 스틱맨 쌤 아바타 — 만화 컷과 같은 손그림 래스터(발주본)를 앱 전역에서 공용.
// 만화·hook·recap 어디서든 같은 얼굴이 나오도록 여기서만 가져다 쓴다.
// 이미지가 없거나 로드에 실패하면 기존 SVG(stickmanHead/stickman)로 우아하게 폴백.
// 파일: public/comics/avatar/0..4.png (발주 프롬프트 qa/avatar_prompts.txt)
// + 유저 프로필 아바타(선생님과 별개의 학생 캐릭터들)는 아래 PROFILE 섹션 — public/avatars/*.webp.

import { el } from "../core/dom";
import type { StickAvatarCfg } from "../core/store";
import { stickman, stickmanHead } from "./figures";
import { normPreset, STICK_PRESETS, stickAvatarSvg } from "./stickParts";

const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export type AvatarKind = "smile" | "surprised" | "curious" | "wave" | "cheer";
const FILE: Record<AvatarKind, number> = { smile: 0, surprised: 1, curious: 2, wave: 3, cheer: 4 };
const FULL_BODY: AvatarKind[] = ["wave", "cheer"];

/** 선생님 아바타 5종 — comic·hook·recap 등 "쌤" 연출 전용(표정 교체용). */
export const AVATAR_KINDS: AvatarKind[] = ["smile", "surprised", "curious", "wave", "cheer"];

/* ============================================================
   유저 프로필 아바타 — 마이 탭 픽커·홈 앱바가 사용(store.avatarId = 아래 배열 인덱스).
   0..4 = 기존 선생님 발주본(하위 호환 — 저장된 avatarId가 살아 있도록 순서 변경·삭제 금지.
          단 픽커에는 노출하지 않는다: 프로필은 학생 캐릭터만 — 사용자 확정 2026-07-12),
   5..  = 학생 캐릭터 발주본(qa/avatar2_prompts.txt → public/avatars/*.webp).
   새 캐릭터 추가는 항상 뒤에 append — 픽커·앱바는 자동 확장된다.
   ============================================================ */
const TEACHER_FILES = AVATAR_KINDS.map((k) => `comics/avatar/${FILE[k]}.png`);
const USER_FILES = [
  "ponytail", // 5 포니테일 소녀
  "afro", // 6 곱슬 아프로 소년(주근깨)
  "bob", // 7 단발 소녀(사각 안경)
  "spiky", // 8 까치머리 소년(반창고)
  "pigtails", // 9 양갈래 소녀(주근깨)
  "beanie", // 10 니트 비니
  "specs", // 11 뿔테 안경 소년
  "longhair", // 12 긴 생머리 소녀(별핀)
  "headset", // 13 헤드폰
  "cap", // 14 야구모자 소년
  "perm", // 15 뽀글 파마 소녀
  "sprout", // 16 새싹 머리
].map((n) => `avatars/${n}.webp`);
const PROFILE_FILES = [...TEACHER_FILES, ...USER_FILES];
/** 기존 선생님 전신 2종(wave·cheer)만 세로 크롭 보정이 필요하다. */
const PROFILE_FULL = new Set(AVATAR_KINDS.map((k, i) => (FULL_BODY.includes(k) ? i : -1)).filter((i) => i >= 0));

export const PROFILE_COUNT = PROFILE_FILES.length;
/** 픽커에 노출하는 시작 인덱스 — 선생님 5종(0..4)은 저장 호환용으로만 남고 픽커에서 뺀다. */
export const PROFILE_PICK_START = TEACHER_FILES.length;
/** 고른 적 없는 기본 아바타 = 학생 '새싹 머리'(성별 중립) — 선생님 wave 기본은 픽커 미노출로 폐기. */
const DEFAULT_PROFILE = PROFILE_FILES.indexOf("avatars/sprout.webp");

/** null·범위 밖은 기본 학생 캐릭터(새싹 머리). 저장된 선생님 인덱스(0..4)는 그대로 존중한다. */
export function profileIdOf(id: number | null | undefined): number {
  const i = id ?? DEFAULT_PROFILE;
  return PROFILE_FILES[i] ? i : DEFAULT_PROFILE;
}

/** 프로필 아바타 요소 생성(원형 프레임 안에서 object-fit cover).
 *  우선순위: preset(캐릭터 프리셋) → custom(직접 꾸민 조합) → 래스터 avatarId(구버전 저장 호환). */
export function profileAvatar(
  id: number | null | undefined,
  custom?: StickAvatarCfg | null,
  preset?: number | null,
): HTMLElement {
  const wrap = el("span", { class: "stick-avatar" });
  setProfileAvatar(wrap, id, custom, preset);
  return wrap;
}

/** 프로필 아바타 교체(마이 탭 픽커 선택 반영). */
export function setProfileAvatar(
  wrap: HTMLElement,
  id: number | null | undefined,
  custom?: StickAvatarCfg | null,
  preset?: number | null,
): void {
  const p = normPreset(preset);
  if (p != null) {
    wrap.classList.remove("full");
    wrap.innerHTML = stickAvatarSvg(STICK_PRESETS[p].cfg);
    return;
  }
  if (custom) {
    wrap.classList.remove("full");
    wrap.innerHTML = stickAvatarSvg(custom);
    return;
  }
  const i = profileIdOf(id);
  wrap.classList.toggle("full", PROFILE_FULL.has(i));
  wrap.innerHTML = "";
  const img = el("img", {
    attrs: { src: `${base}${PROFILE_FILES[i]}`, alt: "", loading: "eager", "aria-hidden": "true" },
  });
  img.addEventListener("error", () => {
    wrap.innerHTML = PROFILE_FULL.has(i) ? stickman() : stickmanHead();
  });
  wrap.appendChild(img);
}

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
