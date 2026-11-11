#!/usr/bin/env bash
# 검사용 개발 모드 번들을 임시 폴더에 만든다(서버 없이 보는 방법. qa/u4v5-lib.mjs 머리말).
# 쓰는 법: bash qa/u4v5-build.sh <폴더>
set -e
NODE_ENV=development npx vite build --mode development --outDir "$1" --emptyOutDir 2>&1 | tail -1
