#!/usr/bin/env bash
# 사회 Ⅴ(아메리카) 발주 — 스틱맨 컷 7장 + 문화경관 실사풍 8장(codex ChatGPT image_gen, 순차 3배치).
# bash qa/order-soc5.sh  (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/cuts public/soc/america

echo "=== BATCH 1/3: soc/cuts u5l1~u5l7 (스틱맨 컷 7장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc5_prompts.txt 파일을 읽어라. [0]~[6]은 낱개 스틱맨 컷 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로. 이미지 안에 글자·숫자·말풍선·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
아메리카 대륙 실루엣이 나오는 컷([0])은 프롬프트의 모양 특징(넓은 북쪽 덩어리 — 가느다란
지협 — 아래로 길게 뻗은 남쪽 세모)을 반드시 지켜라 — 아프리카·단일 덩어리 모양 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/3: soc/america [7]~[10] (문화경관 실사풍 4장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc5_prompts.txt 파일을 읽어라. [7]~[10]은 낱개 문화경관 실사풍 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로.
이미지 안에 글자·간판·현수막·로고·워터마크 절대 금지. 실존 유명 장소 복제가 아니라 양식의 전형으로.
사람은 원경·비식별만 — 일상 활동 중인 존엄한 모습으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== BATCH 3/3: soc/america [11]~[14] (문화경관 실사풍 4장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc5_prompts.txt 파일을 읽어라. [11]~[14]는 낱개 문화경관 실사풍 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로.
이미지 안에 글자·간판·로고·워터마크 절대 금지. 실존 유명 시설 복제가 아니라 양식의 전형으로.
사람은 원경·비식별만.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== SOC5 ORDER DONE ==="
ls public/soc/cuts public/soc/america 2>/dev/null
