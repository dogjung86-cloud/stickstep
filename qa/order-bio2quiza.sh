#!/usr/bin/env bash
# 중1 II 문제 그림 발주 A. bash qa/order-bio2quiza.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio2/quiz
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/bio2quiza_prompts.txt 파일을 읽어라. [0]~[5] 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일" 블록을 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안 글자·숫자·라벨 절대 금지.
저장 경로(순서대로):
[0]->public/bio2/quiz/microscope.png
[1]->public/bio2/quiz/mag-compare.png
[2]->public/bio2/quiz/variation-snails.png
[3]->public/bio2/quiz/finch-beaks.png
[4]->public/bio2/quiz/species-mule.png
[5]->public/bio2/quiz/habitat-loss.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄, 끝나면 "DONE n/6" 출력.
PROMPT
echo "=== BIO2QUIZ A DONE ==="
ls public/bio2/quiz 2>/dev/null
