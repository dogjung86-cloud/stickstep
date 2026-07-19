#!/usr/bin/env bash
# 다른 세션의 codex "발주 exec"가 완전히 끝나기를 기다렸다가 Ⅵ 이미지를 발주한다.
# 병렬 codex 금지 규칙 준수용 대기 러너. bash qa/wait-order-soc6.sh
# 주의 1: 프로세스명(codex.exe)만 보면 Codex 데스크톱 앱의 상주 서버(app-server)에 걸려
#         무한 대기한다(실사고) — CommandLine에 " exec "가 있는 프로세스만 발주로 간주.
# 주의 2: 멀티 배치 발주 스크립트의 "배치 사이 공백"에 발화하면 병렬 codex가 된다(h1u2 실사고 —
#         image_gen MCP transport 사망). 연속 부재 기준을 90→180초로 강화해 공백 오인을 줄인다.
set -u
cd "$(dirname "$0")/.."
busy() {
  powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"name='codex.exe'\" | Where-Object { \$_.CommandLine -match ' exec ' }).Count" 2>/dev/null | tr -d '\r'
}
absent=0
for i in $(seq 1 1080); do   # 최대 3시간 대기
  n="$(busy)"
  if [ "${n:-0}" != "0" ] && [ -n "$n" ]; then
    absent=0
  else
    absent=$((absent + 10))
    if [ "$absent" -ge 180 ]; then
      echo "[wait-order] codex exec 180s absent — starting soc6 order"
      bash qa/order-soc6.sh
      exit $?
    fi
  fi
  sleep 10
done
echo "[wait-order] TIMEOUT: codex exec still busy after 3h — order NOT placed"
exit 1
