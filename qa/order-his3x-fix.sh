#!/usr/bin/env bash
# his3x 재발주 fix — h1u3l1(치비 캐릭터풍 이탈)·h1u3l3(컷 간 스타일 요동, 동화풍 4컷) 각 7컷 전체.
# 반드시 본 발주 "HIS3X ORDER DONE" 마커 확인 후 실행(병렬 codex 금지).
# bash qa/order-his3x-fix.sh  (app 루트에서) → ONLY=h1u3 node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."

STYLE_FIX='스타일 강제(1차본이 동화책 일러스트풍으로 이탈한 재발주다 — 반드시 지켜라):
인물은 미니멀 스틱 피겨만 허용. 머리 = 속이 빈 단순한 원(살구톤·볼륨감 있는 치비 두상 절대 금지),
눈 = 작은 점 2개, 입 = 작은 선/타원. 머리카락은 최소한의 외곽선이나 작은 상투 실루엣만 —
빽빽하게 채운 머리숱 절대 금지. 통통한 볼·그림책 아동 캐릭터 스타일 절대 금지.
발주 전에 public/comics/h1u3l5/3.png 과 public/comics/h1u3l8/2.png 를 열어 인물 스타일을 확인하고
그 스타일 그대로 그려라(합격 기준본).'

order() {
  local tag="$1" range="$2" folder="$3" extra="$4"
  echo "=== FIX BATCH $tag: comics/$folder 7컷 재발주 ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
qa/his3x_prompts.txt 파일을 읽어라. [$range] 일곱 개의 만화 컷 프롬프트가 있다($folder).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로(기존 png 덮어쓰기).
$STYLE_FIX
핵심 계약: 이미지 안에 글자·숫자·한자·가나·말풍선 절대 금지, 인물은 말하는 연기만, 상단 1/3 여백.
전투·유혈 절대 금지. 불상·불화·십자가 등 종교 상징물 절대 금지(절·탑은 건물 외관만).
$extra
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT
}

order "1/2" "a0]~[a6" "h1u3l1" "EMPEROR(효문제)는 존엄 유지 — 개그는 모피 모자 대신들 몫. 개혁 전 모피 깃 로브 → a2부터 한족 예복."
order "2/2" "b0]~[b6" "h1u3l3" "탑·절은 건물 외관만(불상·범종 금지). b6은 b2와 같은 나무·같은 책상의 세월 흐른 거울 구도."

echo "=== HIS3X FIX DONE ==="
ls public/comics/h1u3l1 public/comics/h1u3l3 2>/dev/null
