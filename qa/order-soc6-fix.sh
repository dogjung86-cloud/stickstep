#!/usr/bin/env bash
# 사회 Ⅵ 실사풍 재발주 — codex 사용량 한도 소진(2026-07-19)으로 실패했던 배치 2의 재시도.
# [8] wheatharvest · [9] beachcleanup · [10] artesianbore 3장만 — [11] kiwiorchard는
# 위키미디어 합격본(kiwifruit.webp, PD)이 이미 임베드돼 발주하지 않는다.
# bash qa/order-soc6-fix.sh  (app 루트에서) → node qa/process-soc6-only.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."
mkdir -p public/soc/oceania

echo "=== SOC6 FIX: soc/oceania [8]~[10] (실사풍 3장) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc6_prompts.txt 파일을 읽어라. [8], [9], [10] 세 항목만 낱개 실사풍 프롬프트로 쓴다([11]은 생성하지 마라).
각 프롬프트 앞에 파일 위쪽 "스타일 블록 P"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 값 그대로.
이미지 안에 글자·간판·로고·워터마크 절대 금지. 실존 유명 장소 복제가 아니라 양식의 전형으로.
사람은 원경·비식별만 — 일상 활동 중인 존엄한 모습으로.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/3"을 출력하라.
PROMPT

echo "=== SOC6 FIX DONE ==="
ls public/soc/oceania/*.png 2>/dev/null
