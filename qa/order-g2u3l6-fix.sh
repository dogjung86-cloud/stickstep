#!/usr/bin/env bash
# 중2 III L6 만화 4번째 컷(3.png) 단건 재발주 — 다른 배치와 충돌해 잎 단면 그림이 저장된 사고 복구.
# bash qa/order-g2u3l6-fix.sh  (app 루트에서)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/g2u3l6

codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/g2u3l6_imagen_prompts.txt 파일을 읽어라. 그중 [3] 프롬프트 하나만 사용한다.
[3] 프롬프트를 그대로 사용해 내장 image_gen 도구로 이미지를 1장 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용.
저장 경로: public/comics/g2u3l6/3.png (정사각, 기존 파일 덮어쓰기).
생성 후 "IMG 3: SAVED public/comics/g2u3l6/3.png"를 보고하고 "DONE 1/1"을 출력하라.
이미지 안에 글자·숫자가 절대 들어가면 안 된다.
PROMPT
