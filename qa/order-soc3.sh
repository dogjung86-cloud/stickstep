#!/usr/bin/env bash
# 사회 Ⅲ(유럽) 발주 — 스틱맨 컷 7장 + 문화경관 실사풍 14장(codex ChatGPT image_gen, 순차 3배치).
# bash qa/order-soc3.sh  (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/cuts public/soc/europe

echo "=== BATCH 1/3: soc/cuts u3l1~u3l7 (스틱맨 컷 7장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc3_prompts.txt 파일을 읽어라. [0]~[6] 일곱 개가 스틱맨 컷 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/3: soc/europe [7]~[13] (문화경관 실사풍 7장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc3_prompts.txt 파일을 읽어라. [7]~[13] 일곱 개가 문화경관 실사풍 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·간판·현수막·워터마크 절대 금지. 실존 유명 건축물·산·마을의 복제가 아니라 양식의 전형으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/3: soc/europe [14]~[20] (문화경관 실사풍 7장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc3_prompts.txt 파일을 읽어라. [14]~[20] 일곱 개가 문화경관 실사풍 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·간판·현수막·워터마크 절대 금지. 실존 유명 건축물·산·마을의 복제가 아니라 양식의 전형으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== SOC3 ORDER DONE ==="
ls public/soc/cuts public/soc/europe 2>/dev/null
