#!/usr/bin/env bash
# 역사① Ⅰ(h1u1) 이미지 발주 — codex auth의 ChatGPT image_gen(순차 3배치, 병렬 codex 금지).
# bash qa/order-his1.sh  (app 루트에서)
# 이후: node qa/process-geo.mjs (his/cuts webp) + node qa/process-comics.mjs (comics webp)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/his/cuts public/comics/h1u1l1 public/comics/h1u1l5

echo "=== BATCH 1/3: his/cuts 5장 (개념 컷) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1_prompts.txt 파일을 읽어라. [0]~[4] 다섯 개의 이미지 프롬프트가 있다(역사 I 개념 컷).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로. 이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/5"를 출력하라.
PROMPT

echo "=== BATCH 2/3: comics/h1u1l1 7컷 (역사가의 대결) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1_prompts.txt 파일을 읽어라. [c0]~[c6] 일곱 개의 만화 컷 프롬프트가 있다(h1u1l1).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 인물은 입을 벌리고
손짓하는 "말하는 연기"만, 인물 머리 위쪽 상단 1/3은 여백으로 비워 둘 것, 주인공은 가로 중앙.
등장인물 일관성: 안경+나비넥타이 역사가 / 납작모자+목도리 역사가 / 학생 — 컷마다 같은 모습.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/3: comics/h1u1l5 6컷 (밀면 탐구) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1_prompts.txt 파일을 읽어라. [m0]~[m5] 여섯 개의 만화 컷 프롬프트가 있다(h1u1l5).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 인물은 입을 벌리고
손짓하는 "말하는 연기"만, 인물 머리 위쪽 상단 1/3은 여백으로 비워 둘 것, 주인공은 가로 중앙.
학생 캐릭터는 배치 2의 STUDENT와 같은 모습을 유지하라.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== HIS1 ORDER DONE ==="
ls public/his/cuts public/comics/h1u1l1 public/comics/h1u1l5 2>/dev/null
