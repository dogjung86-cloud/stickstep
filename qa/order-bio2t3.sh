#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/.."
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/bio2t3_prompts.txt 파일을 읽어라. [0]~[2] 프롬프트가 있다.
"공통 스타일" 블록을 붙여 내장 image_gen으로 생성. Google 금지, 내장 image_gen만. 이미지 안 글자 금지.
반드시 배경을 완전히 투명하게(알파). 저장(순서대로): [0]→public/bio2/levels/circulatory.png [1]→leaf-cell.png [2]→palisade.png (모두 public/bio2/levels/)
각 이미지 후 "IMG i: SAVED <경로>", 끝나면 "DONE 3/3".
PROMPT
echo "=== T3 DONE ==="
