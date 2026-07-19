#!/usr/bin/env bash
# 사회 Ⅵ(오세아니아와 극지방) 발주 — 스틱맨 컷 8장 + 실사풍 3장(codex ChatGPT image_gen, 순차 2배치).
# bash qa/order-soc6.sh  (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/cuts public/soc/oceania

echo "=== BATCH 1/2: soc/cuts u6l1~u6l8 (스틱맨 컷 8장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc6_prompts.txt 파일을 읽어라. [0]~[7]은 낱개 스틱맨 컷 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로. 이미지 안에 글자·숫자·말풍선·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
오세아니아 실루엣이 나오는 컷([0])은 프롬프트의 모양 특징을 반드시 지켜라 —
"크고 평평한 둥근 한 덩어리(오스트레일리아) + 남동쪽에 길쭉한 두 조각 섬(뉴질랜드) +
바다에 점점이 흩어진 작은 섬들". 아프리카·아메리카·단일 덩어리 모양 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== BATCH 2/2: soc/oceania [8]~[11] (실사풍 4장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc6_prompts.txt 파일을 읽어라. [8]~[11]은 낱개 실사풍 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로.
이미지 안에 글자·간판·로고·워터마크 절대 금지. 실존 유명 장소 복제가 아니라 양식의 전형으로.
사람은 원경·비식별만 — 일상 활동 중인 존엄한 모습으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== SOC6 ORDER DONE ==="
ls public/soc/cuts/u6*.png public/soc/oceania/*.png 2>/dev/null
