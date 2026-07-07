#!/usr/bin/env bash
# 중1 II 개체=사람(투명 배경 테스트). bash qa/order-bio2c.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p public/bio2/levels

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/bio2c_prompts.txt 파일을 읽어라. [0] 프롬프트가 있다.
"공통 스타일" 블록을 붙여 내장 image_gen 도구로 생성하라.
Google 도구 금지, 내장 image_gen만 사용. 이미지 안 글자·숫자 절대 금지.
중요: 배경을 완전히 투명하게(알파 채널 PNG) 만들어라 — 피사체만 남기고 배경색·바닥·풍경 금지.
저장: [0]→public/bio2/levels/human.png
생성 후 "IMG 0: SAVED public/bio2/levels/human.png" 보고, 끝나면 "DONE 1/1" 출력.
PROMPT

echo "=== BIO2C DONE ==="
ls -la public/bio2/levels/human.png 2>/dev/null
