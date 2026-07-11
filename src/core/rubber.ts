// 러버밴딩 — 드래그가 경계를 지나면 저항이 점점 세지는 곡선(애플 Designing Fluid Interfaces 공식).
// 하드 스톱("벽에 쾅")은 화면이 멈춘 것처럼 읽히므로, 경계 밖에서는 손가락 이동의 일부만 따라가게 한다.
// 사용법: 경계 초과량 over(px, 부호 유지)를 넣으면 화면에 적용할 오프셋(px)이 나온다.
//   .sl-thumb는 base.css의 --rb 변수를 받는다 — 드래그 중 setProperty("--rb", `${rubber(over, w)}px`),
//   릴리스 때 "0px"로 되돌리면 .28s 스프링으로 스냅백(파일럿: heatParticles·matterTemp, 2026-07-12).
export function rubber(over: number, dim: number, c = 0.55): number {
  return (over * dim * c) / (dim + c * Math.abs(over));
}
