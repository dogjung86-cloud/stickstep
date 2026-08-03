#!/usr/bin/env bash
# 역사① Ⅱ(h1u2) 만화 확대 발주 — codex ChatGPT image_gen(순차 5배치, 병렬 codex 금지).
# bash qa/order-his2x.sh  (app 루트에서) → node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/h1u2l2 public/comics/h1u2l4 public/comics/h1u2l5 public/comics/h1u2l7 public/comics/h1u2l9

order() {
  local tag="$1" range="$2" folder="$3" extra="$4"
  echo "=== BATCH $tag: comics/$folder 7컷 ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
qa/his2x_prompts.txt 파일을 읽어라. [$range] 일곱 개의 만화 컷 프롬프트가 있다($folder).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·한자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다 — 뼈 새김·낙서·
쐐기 자국은 추상 표식만), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙 부근.
전투·유혈·무기로 사람을 겨누는 장면·인명 피해 절대 금지. 종교 상징물·신앙 대상 절대 금지.
$extra
프롬프트 파일 맨 위 등장인물 고정 블록을 지켜 컷마다 같은 모습을 유지하라. 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT
}

order "1/5" "s0]~[s6" "h1u2l2" "FATHER(모자+콧수염 신사)는 존엄 유지하되 놀람 연기 허용, 개그는 MARIA·학자들 몫."
order "2/5" "g0]~[g6" "h1u2l4" "WANG(청 학자 모자+두루마기)은 존엄 유지 — 열정 연기 허용, 우스꽝 금지. 개그는 약방 점원 몫."
order "3/5" "c0]~[c6" "h1u2l5" "CYRUS(뾰족 왕관 페르시아 왕)는 항상 존엄·온화 — 개그 전면 금지. 입성은 열린 성문과 평화 행렬로만."
order "4/5" "p0]~[p6" "h1u2l7" "화산은 연기 기둥만(자연 현상) — 무너지는 건물·인명 피해·쓰러진 사람 절대 금지. p3은 인물 0의 정적 풍경."
order "5/5" "k0]~[k6" "h1u2l9" "가격은 동전 더미 크기로만(숫자 금지). 상상 구름 속 비단 나무는 명확히 생각 구름 안에만."

echo "=== HIS2X ORDER DONE ==="
ls public/comics/h1u2l2 public/comics/h1u2l4 public/comics/h1u2l5 public/comics/h1u2l7 public/comics/h1u2l9 2>/dev/null
