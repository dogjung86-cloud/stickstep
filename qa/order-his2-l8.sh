#!/usr/bin/env bash
# h1u2 배치 5 단독 재실행 — 병렬 codex 사고(fix 배치와 동시 실행 → image_gen MCP transport 사망)로
# l8이 0장으로 죽은 것의 복구. bash qa/order-his2-l8.sh
set -u
cd "$(dirname "$0")/.."
busy() {
  powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"name='codex.exe'\" | Where-Object { \$_.CommandLine -match ' exec ' }).Count" 2>/dev/null | tr -d '\r'
}
absent=0
for i in $(seq 1 360); do
  n="$(busy)"
  if [ "${n:-0}" != "0" ] && [ -n "$n" ]; then
    absent=0
  else
    absent=$((absent + 10))
    if [ "$absent" -ge 60 ]; then
      break
    fi
  fi
  sleep 10
done

echo "=== BATCH 5 RERUN: comics/h1u2l8 7컷 (통일 3종 세트) ==="
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
echo "=== L8 RERUN DONE ==="
ls public/comics/h1u2l8 2>/dev/null
