#!/usr/bin/env bash
# 중2 Ⅵ 동물과 에너지 발주 40장 — codex auth의 ChatGPT 내장 image_gen 사용.
#   컷 12(스틱맨 개념 컷) + 해부도 15 + 음식 누끼 13.
# **반드시 순차 실행**(병렬 codex exec 금지 — 다른 배치 이미지가 뒤바뀐 실사고 이력).
# 다른 세션이 codex exec를 돌리고 있지 않은지 먼저 확인할 것.
#
#   bash qa/order-anim.sh            # 전체
#   bash qa/order-anim.sh cuts       # 컷만
#   bash qa/order-anim.sh figs       # 해부도만
#   bash qa/order-anim.sh food       # 음식만
# 발주 뒤: node qa/process-geo.mjs (webp 변환, 원본 png 삭제)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/anim/cuts public/anim/figs public/anim/food
WHAT="${1:-all}"

run() { # run <제목> <프롬프트본문>
  echo "=== $1 ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
$2
PROMPT
}

if [ "$WHAT" = "all" ] || [ "$WHAT" = "cuts" ]; then
run "BATCH 1/8: cuts 0~3 (영양소·시약·소화·소화효소)" \
'qa/anim_cut_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·단어·말풍선·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'

run "BATCH 2/8: cuts 4~7 (융털·심장·혈액·순환)" \
'qa/anim_cut_prompts.txt 파일을 읽어라. [4][5][6][7] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·단어·말풍선·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'

run "BATCH 3/8: cuts 8~11 (호흡·기체교환·배설·세포호흡)" \
'qa/anim_cut_prompts.txt 파일을 읽어라. [8][9][10][11] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·단어·말풍선·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'
fi

if [ "$WHAT" = "all" ] || [ "$WHAT" = "figs" ]; then
run "BATCH 4/8: figs 0~3 (소화계·융털벽·융털속·심장단면)" \
'qa/anim_fig_prompts.txt 파일을 읽어라. [0][1][2][3] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 B"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 대로(portrait 3:4 / landscape 4:3).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
**이미지 안에 글자·숫자·라벨·화살표·지시선(leader line)·콜아웃 절대 금지** — 한글 라벨은 앱이 따로 얹는다.
해부학적으로 정확해야 하며, 프롬프트가 "명확히 구분되어야 한다"고 적은 구조는 반드시 눈으로 구분되게 그려라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'

run "BATCH 5/8: figs 4~7 (혈관3종·혈액시험관·혈구·순환베이스)" \
'qa/anim_fig_prompts.txt 파일을 읽어라. [4][5][6][7] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 B"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 대로.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
**이미지 안에 글자·숫자·라벨·화살표·지시선·콜아웃 절대 금지.**
[4]는 세 혈관의 **벽 두께 차이**와 정맥 속 판막이, [6]은 세 혈구의 **크기 차이**가 한눈에 읽혀야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'

run "BATCH 6/8: figs 8~11 (호흡계·허파꽈리·호흡모형·배설계)" \
'qa/anim_fig_prompts.txt 파일을 읽어라. [8][9][10][11] 네 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 B"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 대로.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
**이미지 안에 글자·숫자·라벨·화살표·지시선·콜아웃 절대 금지.**
[10]은 실제 교실에서 만드는 준비물 모형이라 컵·빨대·고무풍선·고무 막이 각각 무엇인지 알아볼 수 있어야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/4"를 출력하라.'

run "BATCH 7/8: figs 12~14 (콩팥단면·콩팥단위·마이토콘드리아)" \
'qa/anim_fig_prompts.txt 파일을 읽어라. [12][13][14] 세 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 B"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 대로.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
**이미지 안에 글자·숫자·라벨·화살표·지시선·콜아웃 절대 금지.**
[13]은 실뭉치 모양 모세혈관 덩이·그것을 감싼 컵 모양 주머니·구불구불한 긴 관·관을 감싼 별도의 혈관 그물
네 구조가 반드시 서로 구분되어야 한다(이 그림이 레슨의 핵심 도해다).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.'
fi

if [ "$WHAT" = "all" ] || [ "$WHAT" = "food" ]; then
run "BATCH 8a/8: food 0~6 (밥·빵·감자·고기·달걀·두부·버터)" \
'qa/anim_food_prompts.txt 파일을 읽어라. [0][1][2][3][4][5][6] 일곱 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 C"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. **배경은 완전히 투명(FULLY TRANSPARENT, PNG alpha)**이어야 한다.
이미지 안에 글자·숫자·라벨 절대 금지. 접시·식탁·바닥·배경 그림자 금지(프롬프트가 그릇을 지정한 경우만 예외).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.'

run "BATCH 8b/8: food 7~12 (땅콩·사과·당근·멸치·우유·물)" \
'qa/anim_food_prompts.txt 파일을 읽어라. [7][8][9][10][11][12] 여섯 개의 이미지 프롬프트가 있다.
각 프롬프트 앞에 파일 위쪽 "스타일 블록 C"를 통째로 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 정사각 1:1.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. **배경은 완전히 투명(FULLY TRANSPARENT, PNG alpha)**이어야 한다.
이미지 안에 글자·숫자·라벨 절대 금지. 접시·식탁·바닥·배경 그림자 금지(프롬프트가 잔을 지정한 경우만 예외).
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.'
fi

echo "=== ANIM ORDER DONE ==="
ls public/anim/cuts public/anim/figs public/anim/food 2>/dev/null
echo "다음: node qa/process-geo.mjs  (webp 변환·원본 png 삭제)"
