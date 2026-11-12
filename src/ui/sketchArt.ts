// 코드로 그린 스틱맨 그림의 창구.
// 그림 원본은 qa/sketch/scenes/ 의 장면 코드이고, node qa/sketch/build.mjs 가
// public/sketch/*.svg(만화, 개념 컷, 스플래시, 로그인과 계정, 과목 카드)와 sketchArt.generated.ts(표)를 만든다.
// 이미지 생성 모델을 쓰지 않는다. 그림을 고치려면 장면 코드를 고치고 다시 뽑는다.
import "../styles/sketch.css";
import {
  ACCOUNT_ART,
  COMIC_ART,
  COMIC_META,
  CUT_ART,
  SPLASH_ART,
  SUBJECT_ART,
  TEACHER_SVG,
  type SketchComicMeta,
  type SketchPanelArt,
} from "./sketchArt.generated";

/** 만화 컷 한 장의 그림, 말풍선, 때와 곳(장면 파일이 글까지 쓰는 편이면 컷의 글도). */
export function comicArt(lesson: string, i: number): SketchPanelArt {
  const p = COMIC_ART[lesson]?.[i];
  if (!p) throw new Error(`코드 그림이 없다: ${lesson} 컷 ${i} (qa/sketch/scenes/comic-${lesson}.mjs 를 만들고 build.mjs 를 돌릴 것)`);
  return p;
}

/** 한 편의 컷 수 */
export function comicLength(lesson: string): number {
  return COMIC_ART[lesson]?.length ?? 0;
}

export type ComicStoryPanel = SketchPanelArt & { stage: string; title: string; caption: string };
export interface ComicStory extends SketchComicMeta {
  /** 코드 그림 만화 표시(comic.ts): 배지 색을 처음 나온 차례대로, 말풍선과 때와 곳 상자를 그림과 같은 비율로 */
  code: true;
  panels: ComicStoryPanel[];
}

/** 만화 스텝 한 편 전체(머리말과 컷). 글과 그림 모두 장면 파일(qa/sketch/scenes/comic-<레슨>.mjs)이 정본이다.
 *  단원 파일에서 `comic(comicStory("u3l3"))`로 쓰고, 레슨 흐름에 맞춰 바꿀 것만 덮어쓴다(`{ ...comicStory("u3l3"), cta: "…" }`). */
export function comicStory(lesson: string): ComicStory {
  const meta = COMIC_META[lesson];
  const panels = COMIC_ART[lesson];
  if (!meta || !panels?.length) throw new Error(`만화 글이 없다: ${lesson} (qa/sketch/scenes/comic-${lesson}.mjs 의 META 와 panels 를 쓰고 build.mjs 를 돌릴 것)`);
  for (const p of panels) if (!p.stage || !p.title || !p.caption) throw new Error(`만화 글이 빠졌다: ${lesson} ${p.img}`);
  return { ...meta, code: true, panels: panels.map((p) => ({ ...p }) as ComicStoryPanel) };
}

/** 개념 컷의 코드 그림 경로("sketch/cuts/<테마>/<이름>.svg"). 없으면 undefined(dsl.ts 의 cut()이 발주 그림으로 돌아간다). */
export function cutArt(theme: string, name: string): string | undefined {
  return CUT_ART[`${theme}/${name}`];
}

/** 원형 스틱맨 쌤(smile, surprised, curious, wave, cheer)의 인라인 SVG. 표정 교체가 내려받기 없이 바로 된다. */
export function teacherSvg(kind: string): string {
  return TEACHER_SVG[kind] ?? TEACHER_SVG.smile;
}

/** 스플래시 플립북: 놀이 컷(넘기는 순서)과 "공부하자!" 정착 컷 */
export const SPLASH_FRAMES: string[] = SPLASH_ART.frames;
export const STUDY_ART: string = SPLASH_ART.study;
/** 정착 장면의 앞 자세 넷(앉음, 손 올림, 안경테에 닿음, 살짝 올림). 이어서 STUDY_ART(마지막 자세)에서 멈춘다. */
export const SPLASH_SETTLE: string[] = SPLASH_ART.settle;

/** 계정 관리 화면의 책 읽는 그림 */
export { ACCOUNT_ART };

/** 과목 카드 그림(sci, math, soc, his). 없으면 undefined */
export function subjectArt(key: string): string | undefined {
  return SUBJECT_ART[key];
}
