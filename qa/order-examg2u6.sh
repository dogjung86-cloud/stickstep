#!/usr/bin/env bash
# g2u6 v2 시험 그림 발주 — 신규 2장(혈액 성분 4종 · 침 대조 실험 장치).
# 나머지 9장은 기존 public/body/figs 발주분 재사용(사용자 확정 2026-08-02).
# codex auth의 ChatGPT 내장 image_gen 사용. 병렬 codex 금지 — 실행 전 codex exec 부재를 확인할 것
# (프로세스명이 아니라 CommandLine의 " exec " 로 판별 · Codex 데스크톱 앱 상주 서버는 늘 떠 있다).
# bash qa/order-examg2u6.sh   (app 루트에서). 발주 후 node qa/process-geo.mjs 로 webp 변환.
set -u
cd "$(dirname "$0")/.."
mkdir -p public/exam/g2u6

echo "=== g2u6 시험 그림 2장 발주 ([0] 혈액 성분 · [1] 침 대조 실험) ==="
# ⚠ `- <<'PROMPT' < /dev/null` 조합은 heredoc이 /dev/null에 덮여 "No prompt provided via stdin"으로
# 죽는다(리다이렉션은 왼쪽부터 적용된다). 지시문은 파일로 만들어 stdin에 넣는다.
INSTR="$(mktemp)"
cat > "$INSTR" <<'PROMPT'
qa/g2u6exam_fig_prompts.txt 파일을 읽어라. [0][1] 두 개의 프롬프트가 있다.
각 프롬프트 앞에 파일의 "스타일 블록 B"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비는 각 프롬프트에 적힌 그대로(3:2 · 4:3).
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
이미지 안에 글자·숫자·알파벳·기호·화살표·지시선·라벨 절대 금지. 온도계 눈금도 그리지 마라.
[0]은 왼쪽부터 조각 여러 개 · 가운데가 오목한 붉은 원반 · 핵이 있는 가장 큰 세포 · 옅은 노란 액체 순서를 반드시 지켜라.
[1]의 시험관 두 개는 액체 색과 높이까지 완전히 똑같아야 한다.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/2"를 출력하라.
PROMPT
codex exec --skip-git-repo-check -s danger-full-access -m gpt-5.6-sol -c model_reasoning_effort="high" -c mcp_servers="{}" -C "$(pwd)" - < "$INSTR"
rm -f "$INSTR"

echo "=== ORDER DONE — 이제 node qa/process-geo.mjs 로 webp 변환 ==="
ls -1 public/exam/g2u6 2>/dev/null
