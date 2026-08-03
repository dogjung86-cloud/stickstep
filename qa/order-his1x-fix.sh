#!/usr/bin/env bash
# his1x 재발주 fix — h1u1l4/1.png 단건(1차본은 황제 초상이 동아시아풍 관모로 나옴 — 로마 황제여야 함).
# 반드시 본 발주 "HIS1X ORDER DONE" 마커 확인 후 실행(병렬 codex 금지).
# bash qa/order-his1x-fix.sh  (app 루트에서) → node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his1x_prompts.txt 파일을 읽어라. [r1] 프롬프트(h1u1l4/1.png)를 다음 수정 지시와 함께 재생성하라.
파일의 "스타일 블록 C"를 앞에 붙여 내장 image_gen 도구로 생성. Google 도구 금지. 종횡비 가로 4:3.
저장 경로: public/comics/h1u1l4/1.png (덮어쓰기).
수정 지시(핵심): 두루마리 속 황제 초상은 반드시 **고대 로마 황제** 프로필이어야 한다 —
laurel wreath(월계관)를 쓰고 toga를 걸친 stern Roman emperor profile bust, like a portrait on an
ancient Roman coin. 절대 동아시아(중국·한국)식 황제 관모·곤룡포 금지(1차본의 오류).
NO East Asian imperial hat, NO Chinese/Korean emperor style.
그 외 구도는 [r1] 그대로: MONK가 초상 두루마리를 밀어내고, 뒤에 teal 리본의 새 두루마리,
APPRENTICE가 책상 뒤에서 빼꼼. 이미지 안 글자·숫자 절대 금지, 상단 1/3 여백, 종교 상징물 금지.
완료 후 "IMG r1: SAVED public/comics/h1u1l4/1.png"와 "FIX DONE 1/1"을 출력하라.
PROMPT

echo "=== HIS1X FIX DONE ==="
