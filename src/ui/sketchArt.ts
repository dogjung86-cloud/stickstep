// 코드로 그린 스틱맨 그림의 창구.
// 그림 원본은 qa/sketch/scenes/ 의 장면 코드이고, node qa/sketch/build.mjs 가
// public/sketch/*.svg(만화, 스플래시, 로그인과 계정, 과목 카드)와 sketchArt.generated.ts(표)를 만든다.
// 이미지 생성 모델을 쓰지 않는다. 그림을 고치려면 장면 코드를 고치고 다시 뽑는다.
import "../styles/sketch.css";
import { ACCOUNT_ART, COMIC_ART, SPLASH_ART, SUBJECT_ART, TEACHER_SVG, type SketchPanelArt } from "./sketchArt.generated";

/** 만화 컷의 그림과 말풍선. 콘텐츠에서 `{ ...comicArt("u1l1", 0), stage, title, caption }` 꼴로 쓴다.
 *  말풍선 자리는 그림이 기록한 화자 머리 좌표에서 계산한 값이라 손으로 잡지 않는다. */
export function comicArt(lesson: string, i: number): SketchPanelArt {
  const p = COMIC_ART[lesson]?.[i];
  if (!p) throw new Error(`코드 그림이 없다: ${lesson} 컷 ${i} (qa/sketch/scenes/comic-${lesson}.mjs 를 만들고 build.mjs 를 돌릴 것)`);
  return p;
}

/** 한 편의 컷 수 */
export function comicLength(lesson: string): number {
  return COMIC_ART[lesson]?.length ?? 0;
}

/** 원형 스틱맨 쌤(smile, surprised, curious, wave, cheer)의 인라인 SVG. 표정 교체가 내려받기 없이 바로 된다. */
export function teacherSvg(kind: string): string {
  return TEACHER_SVG[kind] ?? TEACHER_SVG.smile;
}

/** 스플래시 플립북: 놀이 컷(넘기는 순서)과 "공부하자!" 정착 컷 */
export const SPLASH_FRAMES: string[] = SPLASH_ART.frames;
export const STUDY_ART: string = SPLASH_ART.study;

/** 계정 관리 화면의 책 읽는 그림 */
export { ACCOUNT_ART };

/** 과목 카드 그림(sci, math, soc, his). 없으면 undefined */
export function subjectArt(key: string): string | undefined {
  return SUBJECT_ART[key];
}
