#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. 맨 아래 [7rr] 재발주 프롬프트 하나가 있다.
프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 public/his/cuts/u3l8.png (기존 파일 덮어쓰기).
이미지 안에 글자·숫자·기호·말풍선 절대 금지. 스틱맨 손가락은 정확히 5개.
핵심: 길이 세 갈래로 갈라지는 삼거리 + 화살표 판 3개짜리 이정표 + 각자 다른 길로 걸어가며
손 흔드는 세 스틱맨. 테이블·책·지도는 그리지 마라.
완료 후 "IMG 7rr: SAVED public/his/cuts/u3l8.png"와 "FIX2 DONE"을 출력하라.
PROMPT
echo "=== HIS3 FIX2 DONE ==="
