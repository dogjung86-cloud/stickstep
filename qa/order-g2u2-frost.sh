#!/usr/bin/env bash
# g2u2 v2 확대분 — 동결 쐐기 실사 1장(위키 수급 탈락분의 codex 폴백). 병렬 codex 금지 확인 후 실행.
set -u
cd "$(dirname "$0")/.."
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지). 종횡비 정사각 1:1, 사진 같은 실사풍.
장면: 추운 겨울 산의 큰 회색 바위. 바위 한가운데 갈라진 틈에 하얀 얼음이 꽉 차 있고, 그 얼음이 틈을
밀어 벌려 바위가 두 쪽으로 갈라지는 중이다. 틈과 얼음이 화면의 주인공이 되게 가까이에서 찍은 구도.
바위 표면에 서리와 약간의 눈. 이미지 안에 글자·숫자·로고 절대 금지, 사람·손·동물 금지.
저장 경로: public/exam/g2u2/frost-split.png
완료 후 "IMG: SAVED public/exam/g2u2/frost-split.png"를 출력하라.
PROMPT
echo "DONE"
