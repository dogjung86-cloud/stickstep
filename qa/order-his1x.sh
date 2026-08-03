#!/usr/bin/env bash
# 역사① Ⅰ(h1u1) 만화 확대 발주 — codex auth의 ChatGPT image_gen(순차 3배치, 병렬 codex 금지).
# bash qa/order-his1x.sh  (app 루트에서)
# 이후: node qa/process-comics.mjs (comics webp 변환 — 원본 png 삭제)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/h1u1l2 public/comics/h1u1l3 public/comics/h1u1l4

echo "=== BATCH 1/3: comics/h1u1l2 7컷 (기록을 지킨 사람들) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1x_prompts.txt 파일을 읽어라. [p0]~[p6] 일곱 개의 만화 컷 프롬프트가 있다(h1u1l2).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(앱이 한글 말풍선을 얹는다), 인물은 입을 벌리고
손짓하는 "말하는 연기"만, 인물 머리 위쪽 상단 1/3은 여백으로 비워 둘 것, 주인공은 가로 중앙 부근.
전투·무기·불타는 건물·병사는 절대 그리지 않는다(전쟁은 전령·행렬로만 상징).
등장인물 일관성: AHN = 갓 + 긴 흰 수염 노선비 / SON = 갓 + 짧은 검은 수염 선비 — 컷마다 같은 모습.
스틱맨 손이 보이면 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 2/3: comics/h1u1l3 7컷 (둘 다 이겼다고?) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1x_prompts.txt 파일을 읽어라. [q0]~[q6] 일곱 개의 만화 컷 프롬프트가 있다(h1u1l3).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(점토판 쐐기 자국은 추상 눌림 자국만 — 실제 문자
금지), 인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙 부근.
전투·유혈·무기로 사람을 겨누는 장면 절대 금지 — 벽화 속 파라오도 활을 하늘로만 들며 표적 없음.
PHARAOH(네메스 머리쓰개)와 HKING(원뿔 관)은 존엄 유지 — 개그 연기는 조각가·학자 몫.
등장인물 일관성: PHARAOH 줄무늬 머리쓰개 / SCULPTOR 끌+나무망치 / HKING 원뿔 관 / HSCRIBE 둥근 모자 /
SCHOLAR1 탐험 모자 / SCHOLAR2 안경 — 컷마다 같은 모습. 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== BATCH 3/3: comics/h1u1l4 7컷 (0년이 없는 이유) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1x_prompts.txt 파일을 읽어라. [r0]~[r6] 일곱 개의 만화 컷 프롬프트가 있다(h1u1l4).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·말풍선 절대 금지(연표 리본은 눈금 새김만 — 숫자 금지), 인물은
말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙 부근.
종교 상징물(십자가·성상·신앙 대상 인물) 절대 금지 — 수도원은 돌벽 방·책상·양피지·촛불만.
MONK(로브 수도사)는 온화한 존엄 유지 — 개그 연기(자빠짐·소용돌이 눈)는 APPRENTICE·STUDENT 몫.
등장인물 일관성: MONK 통짜 로브 / APPRENTICE 작은 로브 조수 / TEACHER 현대 교사 / STUDENT 현대 학생 —
컷마다 같은 모습. 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT

echo "=== HIS1X ORDER DONE ==="
ls public/comics/h1u1l2 public/comics/h1u1l3 public/comics/h1u1l4 2>/dev/null
