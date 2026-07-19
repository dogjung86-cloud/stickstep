#!/usr/bin/env bash
# u3l8 재발주 — 본 발주(order-his3.sh)의 "HIS3 ORDER DONE" 종료 마커를 확인한 뒤에만 실행할 것(병렬 codex 금지).
set -u
cd "$(dirname "$0")/.."
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his3_prompts.txt 파일을 읽어라. [7r] 재발주 프롬프트 하나가 있다(맨 아래).
프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 public/his/cuts/u3l8.png (기존 파일 덮어쓰기).
이미지 안에 글자·숫자·알파벳·기호·말풍선 절대 금지. 스틱맨 손가락은 정확히 5개.
핵심: 테이블 위 "한 장의 큰 지도"가 세 조각으로 찢기는 중이어야 하고, 지도 안에 대륙 윤곽 낙서와
강 한 줄기가 보여야 한다(책이나 문서 세 권으로 그리면 실패).
완료 후 "IMG 7r: SAVED public/his/cuts/u3l8.png"와 "FIX DONE"을 출력하라.
PROMPT
echo "=== HIS3 FIX DONE ==="
