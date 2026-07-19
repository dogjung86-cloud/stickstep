#!/usr/bin/env bash
# 역사① Ⅱ(h1u2) 이미지 발주 — codex auth의 ChatGPT image_gen(순차 5배치, 병렬 codex 금지).
# bash qa/order-his2.sh  (app 루트에서)
# 이후: node qa/process-geo.mjs (his/cuts webp) + node qa/process-comics.mjs (comics webp)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/his/cuts public/comics/h1u2l1 public/comics/h1u2l3 public/comics/h1u2l6 public/comics/h1u2l8

echo "=== BATCH 1/5: his/cuts 9장 (개념 컷 u2l1~u2l9) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [0]~[8] 아홉 개의 이미지 프롬프트가 있다(역사 II 개념 컷).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/9"를 출력하라.
PROMPT

echo "=== BATCH 2/5: comics/h1u2l1 7컷 (인류 진화 릴레이) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [a0]~[a6] 일곱 개의 만화 컷 프롬프트가 있다(h1u2l1).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 인물은 입을 벌리고
손짓하는 "말하는 연기"만, 인물 머리 위쪽 상단 1/3은 여백으로 비워 둘 것, 주인공은 가로 중앙.
GAG: 표시가 있는 컷은 그 문장의 개그 포인트(과장 연기·자빠짐·눈 튀어나옴)를 살리고,
DIGNIFIED 표시 컷([a5])은 개그 없이 차분하고 존중하는 톤으로 그려라.
등장인물 일관성: RUNNER1(구부정)/RUNNER2(횃불)/RUNNER3(다부짐)/RUNNER4(붓)/HOST(메가폰) — 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/5: comics/h1u2l3 7컷 (인류 최초의 영수증) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [b0]~[b6] 일곱 개의 만화 컷 프롬프트가 있다(h1u2l3).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 점토판 위 쐐기 자국은 "추상적인 쐐기 모양 홈"으로만
(실제 문자 금지), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
GAG: 표시가 있는 컷은 그 문장의 개그 포인트를 살려라(양 세기 실패·기록에 진 상인의 자빠짐·박물관 턱 빠짐).
등장인물 일관성: SELLER(앞치마)/BUYER(어깨끈 가방)/SCRIBE(갈대 펜) — 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 4/5: comics/h1u2l6 7컷 (도자기 조각 투표) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [c0]~[c6] 일곱 개의 만화 컷 프롬프트가 있다(h1u2l6).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 도편에 새기는 표시는 "추상적 긁힘 선"으로만(실제
글자 금지), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
GAG: 표시가 있는 컷은 그 문장의 개그 포인트를 살리고(사금파리 투표용지·보따리 퇴장·제비뽑기 당첨 얼음),
DIGNIFIED 표시 컷([c6])은 개그 없이 차분하고 존중하는 톤으로 그려라.
등장인물 일관성: CITIZEN A(수염)/CITIZEN B(곱슬)/POLITICIAN(화려한 망토) — 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 5/5: comics/h1u2l8 7컷 (통일 3종 세트) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [d0]~[d6] 일곱 개의 만화 컷 프롬프트가 있다(h1u2l8).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 간판·목간의 글자는 "서로 다른 추상 낙서 모양"으로만
(실제 한자 금지), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
GAG: 표시가 있는 컷은 그 문장의 개그 포인트를 살려라(칼 모양 돈·자 길이 제각각·바퀴 폭 통일·병마용 압도).
단 EMPEROR(면류관 황제)는 어느 컷에서도 우스꽝스럽게 그리지 말 것 — 항상 근엄하고 품위 있게(개그는
상인·관리·구경꾼 몫). 등장인물 일관성: MERCHANT(봇짐)/EMPEROR(면류관)/OFFICIAL(두루마리) — 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== HIS2 ORDER DONE ==="
ls public/his/cuts public/comics/h1u2l1 public/comics/h1u2l3 public/comics/h1u2l6 public/comics/h1u2l8 2>/dev/null
