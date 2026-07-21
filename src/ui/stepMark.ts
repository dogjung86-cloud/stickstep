/**
 * 깃발을 향해 걷는 발자국 마크.
 *
 * 도형은 홈 트레일의 미니 발자국(#bsfp)과 같은 실루엣이다. prefix별 클래스를
 * 사용해 페이월과 스플래시가 같은 도형에 서로 다른 등장 타이밍을 줄 수 있다.
 */
export function stepMarkSvg(prefix: string): string {
  const fpPath =
    `<path d="M0,-5.6 C1.8,-5.6 3.2,-4.4 3.2,-2.6 C3.2,-0.8 2.5,0.8 1.7,1.4 C1.2,1.8 -1.2,1.8 -1.7,1.4 C-2.5,0.8 -3.2,-0.8 -3.2,-2.6 C-3.2,-4.4 -1.8,-5.6 0,-5.6 Z"/>` +
    `<rect x="-2" y="2.9" width="4" height="2.7" rx="1.35"/>`;
  const gradientId = `${prefix}-gold`;
  const foot = (x: number, y: number, deg: number, step: string, opacity: number): string =>
    `<g transform="translate(${x} ${y}) rotate(${deg}) scale(1.45)"><g class="${prefix}-fp ${step}" fill="url(#${gradientId})" opacity="${opacity}">${fpPath}</g></g>`;

  return (
    `<svg class="${prefix}-mark" viewBox="0 0 136 40" fill="none" aria-hidden="true">` +
    `<defs><linearGradient id="${gradientId}" x1="0" y1="1" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#EFA32B"/><stop offset="1" stop-color="#FFCF4D"/>` +
    `</linearGradient></defs>` +
    foot(9, 27, 98, "f1", 0.3) +
    foot(28, 13, 82, "f2", 0.44) +
    foot(47, 27, 98, "f3", 0.58) +
    foot(66, 13, 82, "f4", 0.72) +
    foot(85, 27, 98, "f5", 0.86) +
    foot(104, 13, 82, "f6", 1) +
    `<g class="${prefix}-flag" fill="var(--n800)">` +
    `<rect x="123" y="5" width="2.6" height="24" rx="1.3"/>` +
    `<path d="M125.6 6 H135 L131.3 9.6 L135 13.2 H125.6 Z"/>` +
    `</g></svg>`
  );
}
