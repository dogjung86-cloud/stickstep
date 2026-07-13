#!/usr/bin/env bash
# 중1 과학 II 생물의 구성과 다양성 시험용 이미지 16장. 내장 image_gen만 사용, 4장씩 순차 발주.
# bash qa/order-examu2.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/u2

run_batch() {
  local from="$1" to="$2" label="$3"
  echo "=== ${label}: exam/u2 images [${from}]~[${to}] ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
qa/examu2_imagen_prompts.txt 파일을 읽어라. [${from}]부터 [${to}]까지의 이미지 프롬프트만 처리한다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 서로 다른 이미지를 한 장씩 생성하라.
Google 도구, 외부 이미지 검색, Python 합성 금지. 반드시 내장 image_gen만 사용. 모든 결과는 정사각 1:1이다.
저장 경로는 각 프롬프트의 file= 값 그대로다. 이미지 안에 글자·숫자·알파벳·기호·로고·워터마크를 넣지 마라.
요구한 생물 수, 해부 특징, 비교 구도와 금지 요소를 생성 후 스스로 눈으로 검사하고, 실패하면 같은 파일을 다시 생성하라.
각 이미지 후 "IMG i: SAVED <path>"를 출력하고 끝나면 "DONE"을 출력하라.
PROMPT
}

run_batch 0 3 "BATCH 1/4 — 세포 형태와 현미경 관찰"
run_batch 4 7 "BATCH 2/4 — 프레파라트와 변이·종 비교"
run_batch 8 11 "BATCH 3/4 — 5계 표본과 단절된 숲"
run_batch 12 15 "BATCH 4/4 — 생태통로·습지 복원·종자은행"

echo "=== 발주 완료 → node qa/process-geo.mjs 로 webp 변환 ==="
