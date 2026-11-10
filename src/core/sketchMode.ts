// 코드 그림 샘플 토글 (sketch-art-sample 브랜치, 사용자 판정용).
// 주소에 ?sketch 를 붙이면 이 탭이 닫힐 때까지 코드로 그린 스틱맨 그림을 쓰고, ?sketch=0 이면 끈다.
// 꺼져 있으면(기본) 앱은 현행 래스터 그림 그대로다.
const KEY = "ss.sketch";

let on = false;
try {
  const q = new URLSearchParams(location.search);
  if (q.has("sketch")) sessionStorage.setItem(KEY, q.get("sketch") === "0" ? "0" : "1");
  on = sessionStorage.getItem(KEY) === "1";
} catch {
  /* 저장소를 못 쓰는 환경이면 꺼 둔다 */
}

export function sketchOn(): boolean {
  return on;
}
