#!/usr/bin/env bash
# 사회 Ⅲ u3l1 컷 재발주(그림-텍스트 불일치: 유라시아 실루엣이 보여야 함 — 2026-07-19).
# 다른 세션의 codex "발주 exec"가 끝나기를 기다렸다가(90초 연속 부재) 자동 발주한다
# (병렬 codex 금지 — wait-order-g2u4.sh 대기 문법. 상주 앱 서버는 CommandLine " exec "로 구분).
# bash qa/order-soc3-fix.sh (app 루트에서) → node qa/process-geo.mjs 로 webp 변환
set -u
cd "$(dirname "$0")/.."

busy() {
  powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"name='codex.exe'\" | Where-Object { \$_.CommandLine -match ' exec ' }).Count" 2>/dev/null | tr -d '\r'
}
absent=0
for i in $(seq 1 720); do   # 최대 2시간 대기
  n="$(busy)"
  if [ "${n:-0}" != "0" ] && [ -n "$n" ]; then
    absent=0
  else
    absent=$((absent + 10))
    if [ "$absent" -ge 90 ]; then
      echo "[wait-order] codex exec 90s absent — starting u3l1 re-order"
      break
    fi
  fi
  sleep 10
done
if [ "$absent" -lt 90 ]; then
  echo "[wait-order] TIMEOUT: codex exec still busy after 2h — order NOT placed"
  exit 1
fi

echo "=== u3l1 재발주: 유라시아 실루엣 경계 긋기 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/soc3_fix_prompts.txt 파일을 읽어라. [0] 하나가 스틱맨 컷 프롬프트다.
프롬프트 앞에 파일 위쪽 "스타일 블록 A"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 프롬프트의 file= 에 적힌 그대로(public/soc/cuts/u3l1.png — 기존 파일 덮어쓰기).
이미지 안에 글자·숫자·알파벳·기호 절대 금지. 스틱맨 손이 보이면 손가락은 정확히 5개.
대륙 실루엣이 핵심이다: 하나로 이어진 유라시아 덩어리(왼쪽 1/5 유럽은 작고 반도가 많음,
오른쪽 4/5 아시아는 훨씬 큼), 그 사이 세로 산줄기를 따라 스틱맨이 경계선을 긋는다.
아프리카·아메리카 모양 금지, 두 대륙으로 쪼개진 그림 금지.
이미지 후 "IMG 0: SAVED <경로>"를 출력하고, 끝나면 "DONE 1/1"을 출력하라.
PROMPT

echo "=== SOC3 FIX ORDER DONE ==="
ls -la public/soc/cuts/u3l1.png 2>/dev/null
