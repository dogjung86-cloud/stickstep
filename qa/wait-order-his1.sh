#!/usr/bin/env bash
# 다른 세션의 codex "발주 exec"가 완전히 끝나기를 기다렸다가(90초 연속 부재) h1u1 이미지를 발주한다.
# 병렬 codex 금지 규칙 준수용 대기 러너. bash qa/wait-order-his1.sh
# 주의: 프로세스명(codex.exe)만 보면 Codex 데스크톱 앱의 상주 서버(app-server — 영원히 안 꺼짐)에
# 걸려 무한 대기한다(실사고). CommandLine에 " exec "가 있는 프로세스만 발주로 간주한다.
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
      echo "[wait-order] codex exec 90s absent — starting his1 order"
      bash qa/order-his1.sh
      exit $?
    fi
  fi
  sleep 10
done
echo "[wait-order] TIMEOUT: codex exec still busy after 2h — order NOT placed"
exit 1
