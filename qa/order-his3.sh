#!/usr/bin/env bash
# 역사① Ⅲ(h1u3) 이미지 발주 — codex auth의 ChatGPT image_gen(순차 5배치, 병렬 codex 금지).
# bash qa/order-his3.sh  (app 루트에서)
# 이후: node qa/process-geo.mjs (his/cuts webp) + node qa/process-comics.mjs (comics webp)
# 멀티 배치 중 추가 발주는 프로세스 부재가 아니라 아래 "HIS3 ORDER DONE" 종료 마커를 tail로 기다린 뒤 던질 것.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/his/cuts public/comics/h1u3l2 public/comics/h1u3l4 public/comics/h1u3l7 public/comics/h1u3l9

echo "=== BATCH 1/5: his/cuts 10장 (개념 컷 u3l1~u3l10) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [0]~[9] 열 개의 이미지 프롬프트가 있다(역사 III 개념 컷).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 종교 창시자·신앙 대상(부처상·신상 등)은 어떤 형태로도 그리지 마라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/10"을 출력하라.
PROMPT

echo "=== BATCH 2/5: comics/h1u3l2 7컷 (현장의 서역 유학기) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [a0]~[a6] 일곱 개의 만화 컷 프롬프트가 있다(h1u3l2).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 인물은 입을 벌리고
손짓하는 "말하는 연기"만, 인물 머리 위쪽 상단 1/3은 여백으로 비워 둘 것, 주인공은 가로 중앙.
종교 가드: 부처상·불상·신상을 어느 컷에도 그리지 마라 — 사원은 건물과 탑만.
GAG: 표시 컷은 그 문장의 개그 포인트를 살리고(물주머니 쏟기·자빠지는 구경꾼·상상 구름 원숭이),
DIGNIFIED 표시 컷([a2])은 개그 없이 결연하고 존중하는 톤으로. 주인공 MONK(삭발 승려·짐 프레임 배낭)는
모든 컷에서 같은 모습이며 품위를 지킨다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/5: comics/h1u3l4 7컷 (장안 24시) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [b0]~[b6] 일곱 개의 만화 컷 프롬프트가 있다(h1u3l4).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 필담 종이·편지는 "추상 낙서 선"으로만(실제 한자
금지), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙. 종교 가드: 신상·불상 금지 — 사원과
예배소는 건물 외관(탑·돔·지붕)만.
GAG: 표시 컷은 개그 포인트(끝없는 줄·필담 폭소·거대 봇짐 휘청)를 살려라.
등장인물 일관성: SILLA(둥근 챙 모자·봇짐)/WA(납작 사각 모자·두루마리 통)/PERSIAN(곱슬 수염·터번) —
컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 4/5: comics/h1u3l7 7컷 (이슬람 상인의 배낭) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [c0]~[c6] 일곱 개의 만화 컷 프롬프트가 있다(h1u3l7).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지 — 특히 인도 셈법 컷([c2])의 모래판에는 실제 숫자
대신 추상 점·빈 동그라미만. 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
종교 가드(최우선): 종교 창시자·신앙 대상은 어떤 형태로도 그리지 마라 — 특히 무함마드는 실루엣·뒷모습
포함 절대 묘사 금지. 모든 장면은 상인 TRADER·학자·낙타 CAMEL·건물(돔·미너렛·아치)·물건으로만 구성.
GAG: 표시 컷은 개그 포인트(낙타 한숨·종이 감동·기절하는 학자)를 살려라. TRADER(터번·짧은 수염)와
CAMEL(반쯤 감긴 눈 쌍봉낙타)은 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 5/5: comics/h1u3l9 7컷 (카노사의 굴욕) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [d0]~[d6] 일곱 개의 만화 컷 프롬프트가 있다(h1u3l9).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로
중앙. 종교 가드: 예수상·십자가상 등 신앙 대상을 그리지 마라 — 장면은 인물·성문·눈보라·건물로만.
존엄 규칙(최우선): POPE(주교관 교황)와 EMPEROR(관·망토 황제)는 어느 컷에서도 우스꽝스럽게 그리지
말 것 — 분노·좌절 장면에서도 위엄 유지. 개그는 제후·시종·구경꾼 몫(뒷걸음 제후들·눈에 파묻힌 시종).
DIGNIFIED 표시 컷([d1]·[d5])은 개그 전면 금지 — [d5] 눈밭의 황제는 무겁고 존중하는 톤으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== HIS3 ORDER DONE ==="
ls public/his/cuts public/comics/h1u3l2 public/comics/h1u3l4 public/comics/h1u3l7 public/comics/h1u3l9 2>/dev/null
