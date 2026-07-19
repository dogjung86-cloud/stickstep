#!/usr/bin/env bash
# h1u2 재발주 배치 — 눈검수 기각분만 다시 생성(현재 [a4r] 1건).
# bash qa/order-his2-fix.sh  (app 루트에서, codex 발주 exec 부재를 확인하고 실행)
set -u
cd "$(dirname "$0")/.."
busy() {
  powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"name='codex.exe'\" | Where-Object { \$_.CommandLine -match ' exec ' }).Count" 2>/dev/null | tr -d '\r'
}
absent=0
for i in $(seq 1 720); do
  n="$(busy)"
  if [ "${n:-0}" != "0" ] && [ -n "$n" ]; then
    absent=0
  else
    absent=$((absent + 10))
    if [ "$absent" -ge 90 ]; then
      break
    fi
  fi
  sleep 10
done

echo "=== FIX BATCH: h1u2l1 컷4 재발주 ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/his2_prompts.txt 파일을 읽어라. [a4r] 프롬프트 하나만 처리한다(h1u2l1 컷4 재발주).
프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 가로 4:3.
저장 경로는 file= 에 적힌 그대로(기존 파일 덮어쓰기).
핵심 계약: 지도에는 아프리카와 유라시아만(아메리카·오스트레일리아 절대 금지), 발자국 트레일은
아프리카 한가운데에서 시작해 유럽·아시아로만 이어질 것. 이미지 안에 글자·숫자·말풍선 절대 금지,
인물은 말하는 연기만, 상단 1/3 여백, 등장인물은 RUNNER2(횃불)·HOST(메가폰) — 기존 컷과 같은 모습.
끝나면 "IMG 4r: SAVED public/comics/h1u2l1/4.png"와 "DONE 1/1"을 출력하라.
PROMPT
echo "=== FIX DONE ==="
