#!/usr/bin/env bash
# 다른 세션의 codex가 완전히 끝나기를 기다렸다가(90초 연속 부재) g2u4 시험 사진을 발주한다.
# 병렬 codex 금지 규칙 준수용 대기 러너. bash qa/wait-order-g2u4.sh
set -u
cd "$(dirname "$0")/.."
absent=0
for i in $(seq 1 720); do   # 최대 2시간 대기
  if tasklist 2>/dev/null | grep -qi "codex.exe"; then
    absent=0
  else
    absent=$((absent + 10))
    if [ "$absent" -ge 90 ]; then
      echo "[wait-order] codex 90s absent — starting g2u4 order"
      bash qa/order-examg2u4.sh
      exit $?
    fi
  fi
  sleep 10
done
echo "[wait-order] TIMEOUT: codex still busy after 2h — order NOT placed"
exit 1
