#!/usr/bin/env bash
# 역사① Ⅳ(h1u4) 이미지 발주 — codex auth의 ChatGPT image_gen(순차 4배치, 병렬 codex 금지).
# bash qa/order-his4.sh  (app 루트에서)
# 이후: node qa/process-geo.mjs (his/cuts webp) + node qa/process-comics.mjs (comics webp)
# 멀티 배치 중 추가 발주는 프로세스 부재가 아니라 아래 "HIS4 ORDER DONE" 종료 마커를 tail로 기다린 뒤 던질 것.
# 발주 전 확인: ① codex 사용량 한도(소량 exec로 확인 — 2026-07-25 13:28 해제 실측 기록) ② 다른 세션의
# codex exec 부재(CommandLine의 " exec "로 판별 — app-server는 상주라 이름만 보면 무한 대기).
set -u
cd "$(dirname "$0")/.."
mkdir -p public/his/cuts public/comics/h1u4l3 public/comics/h1u4l4 public/comics/h1u4l8

echo "=== BATCH 1/4: his/cuts 10장 (개념 컷 u4l1~u4l10) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4_prompts.txt 파일을 읽어라. [0]~[9] 열 개의 이미지 프롬프트가 있다(역사 IV 개념 컷).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개. 종교 창시자·신앙 대상은 어떤 형태로도 그리지 마라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/10"을 출력하라.
PROMPT

echo "=== BATCH 2/4: comics/h1u4l3 7컷 (백만이라 불린 사나이) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4_prompts.txt 파일을 읽어라. [a0]~[a6] 일곱 개의 만화 컷 프롬프트가 있다(h1u4l3).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 문서·지도는 "추상
낙서 선"만(실제 문자 금지), 인물은 입을 벌리고 손짓하는 "말하는 연기"만, 상단 1/3 여백, 주인공 가로 중앙.
GAG 표시 컷은 그 문장의 개그 포인트(지폐 충격·귀향 몰라봄·백만이 시선)를 살리고, [a2] 궁정 컷은
개그 없이 온화한 위엄으로. 주인공 MARCO(곱슬머리·여행 모자, 후반 컷은 턱수염)와 KHAN(술 달린 관·긴
수염, 존엄 유지)은 컷마다 같은 모습. 전투·유혈 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/4: comics/h1u4l4 7컷 (기린을 실은 보물선) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4_prompts.txt 파일을 읽어라. [b0]~[b6] 일곱 개의 만화 컷 프롬프트가 있다(h1u4l4).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
GAG 표시 컷은 개그 포인트(조선소 크기 충격·기린 올려보다 자빠짐·사다리 먹이 주기)를 살려라.
존엄 규칙: EMPEROR(면류관 황제)와 ZHENGHE(사령관)는 어느 컷에서도 우스꽝스럽게 그리지 말 것 —
개그는 선원·구경꾼·기린의 몫. GIRAFFE(반쯤 감긴 순한 눈)는 컷마다 같은 모습. 전투·유혈 금지.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 4/4: comics/h1u4l8 7컷 (배가 산을 넘은 날) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his4_prompts.txt 파일을 읽어라. [c0]~[c6] 일곱 개의 만화 컷 프롬프트가 있다(h1u4l8).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지, 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙.
정복 존중 규칙(최우선): 전투·유혈·무기로 사람을 겨누는 장면 전면 금지 — [c5] 함락 컷은 열린 성문과
깃발 든 행렬로만, 개그 없이 무겁고 존중하는 톤(DIGNIFIED). [c0]도 개그 금지.
GAG 표시 컷은 개그 포인트(대포 크기에 자빠짐·명령에 귀 의심)를 살리되 SULTAN(깃털 터번 술탄)은
언제나 침착하고 존엄하게 — 리액션은 병사들의 몫. [c4] 배가 산을 넘는 컷은 개그가 아니라 경이로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== HIS4 ORDER DONE ==="
ls public/his/cuts public/comics/h1u4l3 public/comics/h1u4l4 public/comics/h1u4l8 2>/dev/null
