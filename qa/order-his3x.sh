#!/usr/bin/env bash
# 역사① Ⅲ(h1u3) 만화 확대 발주 — codex ChatGPT image_gen(순차 5배치, 병렬 codex 금지).
# 반드시 his2x 발주의 "HIS2X ORDER DONE" 마커 확인 후 실행.
# bash qa/order-his3x.sh  (app 루트에서) → node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/h1u3l1 public/comics/h1u3l3 public/comics/h1u3l5 public/comics/h1u3l8 public/comics/h1u3l10

order() {
  local tag="$1" range="$2" folder="$3" extra="$4"
  echo "=== BATCH $tag: comics/$folder 7컷 ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
qa/his3x_prompts.txt 파일을 읽어라. [$range] 일곱 개의 만화 컷 프롬프트가 있다($folder).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·한자·가나·말풍선 절대 금지(글씨·활자·족보·낙서는 추상 표식만),
인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙 부근.
전투·유혈 절대 금지. 불상·불화·십자가 등 종교 상징물·신앙 대상 절대 금지(절·수도원은 건물 외관만).
$extra
프롬프트 파일 등장인물 고정 블록을 지켜 컷마다 같은 모습을 유지하라. 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT
}

order "1/5" "a0]~[a6" "h1u3l1" "EMPEROR(효문제)는 존엄 유지 — 개그는 모피 모자 대신들 몫. 개혁 전 모피 깃 로브 → a2부터 한족 예복."
order "2/5" "b0]~[b6" "h1u3l3" "탑·절은 건물 외관만(불상·범종 금지). b6은 b2와 같은 나무·같은 책상의 세월 흐른 거울 구도."
order "3/5" "e0]~[e6" "h1u3l5" "수는 절대 숫자로 쓰지 않는다 — 구슬 개수·빈 칸·모래에 그린 동그라미로만. SAGE는 존엄, 자빠짐 개그는 PUPIL 몫."
order "4/5" "d0]~[d6" "h1u3l8" "CHARLES(카롤루스)는 존엄 — d4 밤 연습 컷은 따뜻한 인간미로(우스꽝 금지). 종교 상징물 0."
order "5/5" "f0]~[f6" "h1u3l10" "활자·인쇄면·필사면은 추상 각인·줄 무늬만(실제 글자 금지). 동전 더미 대비(수레 한가득 vs 동전 두 닢)를 명확히."

echo "=== HIS3X ORDER DONE ==="
ls public/comics/h1u3l1 public/comics/h1u3l3 public/comics/h1u3l5 public/comics/h1u3l8 public/comics/h1u3l10 2>/dev/null
