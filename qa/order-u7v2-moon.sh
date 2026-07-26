#!/usr/bin/env bash
# u7 v2 확대분 — 그믐달 실사 1장(NASA·ISS 후보 방향 부적합의 codex 폴백 · 초승 crescent-moon 선례의
# 좌우 대칭 사양). 병렬 codex 금지 확인 후 실행. 방향이 채점 기준: 발주 후 Read 눈검수로
# "왼쪽 가장자리만 가늘게 밝음" 조건 자체를 판정한다.
set -u
cd "$(dirname "$0")/.."
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
내장 image_gen 도구로 이미지 1장을 생성하라(Google 도구 금지). 종횡비 정사각 1:1, 사진 같은 실사풍.
장면: 검고 맑은 밤하늘에 뜬 그믐달. 달의 왼쪽 가장자리만 가늘고 길게 초승 모양으로 밝게 빛나고,
나머지 오른쪽 대부분은 어둡다. 반드시 왼쪽이 밝아야 한다(오른쪽이 밝으면 실패). 밝은 조각의 폭은
달 지름의 4분의 1 이하로 가늘게. 달 표면의 크레이터 질감이 밝은 부분에 살짝 보이게. 하늘에 별 몇 개.
이미지 안에 글자·숫자·로고 절대 금지, 사람·건물·나무·지평선 금지(하늘과 달만).
저장 경로: public/exam/u7/waning-crescent.png
완료 후 "IMG: SAVED public/exam/u7/waning-crescent.png"를 출력하라.
PROMPT
echo "DONE"
