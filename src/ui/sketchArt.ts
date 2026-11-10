// 코드 그림 샘플의 창구. 토글(core/sketchMode)이 꺼져 있으면 전부 null/false 를 돌려줘서
// 호출한 쪽이 현행 래스터 경로를 그대로 탄다. 그림 원본은 qa/sketch/scenes/ 의 장면 코드이고
// node qa/sketch/build.mjs 가 public/sketch/*.svg 와 sketchArt.generated.ts 를 만든다.
import "../styles/sketch.css";
import { sketchOn } from "../core/sketchMode";
import { SKETCH_ACCOUNT, SKETCH_AVATAR, SKETCH_COMIC, SKETCH_SPLASH, type SketchBubble } from "./sketchArt.generated";

/** 만화 컷: 이 컷의 코드 그림이 있으면 그림 경로와 (머리 기준점에서 계산한) 말풍선을 돌려준다. */
export function sketchPanel(img: string | undefined): { img: string; bubbles?: SketchBubble[] } | null {
  if (!sketchOn() || !img) return null;
  return SKETCH_COMIC[img] ?? null;
}

/** 원형 스틱맨 쌤: 코드 그림(인라인 SVG)으로 채웠으면 true. 표정 교체도 같은 경로라 바로 바뀐다. */
export function mountSketchAvatar(wrap: HTMLElement, kind: string): boolean {
  const svg = sketchOn() ? SKETCH_AVATAR[kind] : undefined;
  wrap.classList.toggle("sk", !!svg);
  if (!svg) return false;
  wrap.innerHTML = svg;
  return true;
}

/** 스플래시 플립북 컷 목록(놀이 컷 + 정착 컷). */
export function sketchSplash(): { frames: string[]; study: string } | null {
  return sketchOn() ? SKETCH_SPLASH : null;
}

/** 로그인 화면("공부하자!")과 계정 관리 화면(책 읽기) 그림 경로. */
export function sketchSrc(which: "study" | "account"): string | null {
  if (!sketchOn()) return null;
  return which === "study" ? SKETCH_SPLASH.study : SKETCH_ACCOUNT;
}
