#!/usr/bin/env bash
# 사회 Ⅻ(인권과 기본권) 발주 — 스틱맨 컷 7장 + 만화 「당연한 것들의 역사」 4컷(codex ChatGPT image_gen, 순차 2배치).
# bash qa/order-soc12.sh  (app 루트에서) → node qa/process-soc12-only.mjs 로 webp 변환(자기 배치 스코프)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/cuts public/comics/s1u12l1

echo "=== BATCH 1/2: soc/cuts u12l1~u12l7 (스틱맨 컷 7장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc12_prompts.txt 파일을 읽어라. [0]~[6]은 낱개 스틱맨 컷 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로. 이미지 안에 글자·숫자·말풍선·기호 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 스틱맨은 무성별 기본형(머리카락·치마 등 성별 표지 금지).
인권 침해 장면 재현·피해자 클로즈업 금지, 특정 집단 표지(휠체어·피부색 구분) 금지,
무기·수갑·감옥·국기 금지(판사의 작은 나무 법봉 픽토그램만 허용).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/2: comics/s1u12l1 [c0]~[c3] (당연한 것들의 역사 만화 4컷) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc12_prompts.txt 파일을 읽어라. [c0]~[c3]은 만화 「당연한 것들의 역사」 4컷 프롬프트다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 T"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로. 이미지 안에 글자·숫자·말풍선 절대 금지 —
인물은 입을 벌리고 손짓하는 "말하는 연기"만, 위쪽 1/3은 여백으로 비워 둔다.
과거 컷의 일하는 사람들은 원경의 작고 담담한 모습만(클로즈업·쓰러짐·우는 얼굴 금지),
악역 인물·실존 인물 금지, 국기·현수막·문구 팻말·무기·농기구 금지, 광장 컷은 편 손바닥만(주먹 0).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.
PROMPT

echo "=== SOC12 ORDER DONE ==="
ls public/soc/cuts/u12*.png public/comics/s1u12l1/*.png 2>/dev/null
