#!/usr/bin/env bash
# 중2 Ⅵ 추가 개념 컷 4장(concept 스텝이 2개인 레슨의 두 번째 컷) — cuts 12~15.
# bash qa/order-anim-cuts2.sh   (app 루트에서, 순차 실행·병렬 금지)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/anim/cuts

echo "=== BATCH: cuts 12~15 (소화관/소화샘 · 단계 분해 · 부피압력 · 오줌 생성) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/anim_cut_prompts.txt 파일을 읽어라. [12][13][14][15] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·단어·말풍선·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== CUTS2 DONE ==="
ls public/anim/cuts
