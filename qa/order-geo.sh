#!/usr/bin/env bash
# 지권의 변화(중2 II) 이미지 26장 발주 — codex auth의 ChatGPT image_gen 사용.
# bash qa/order-geo.sh  (app 루트에서) — 3회 연속 실행(암석 12 / 광물 6 / 증거 8)
set -u
cd "$(dirname "$0")/.."
mkdir -p public/geo/rocks public/geo/minerals public/geo/evid

echo "=== RUN 1: rocks (12) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/geo_prompts.txt 파일을 읽어라. [0]~[11] 열두 개의 암석 표본 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일 A" 블록을 붙여 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자·숫자 절대 금지.
저장 경로(순서대로):
[0]→public/geo/rocks/granite.png [1]→public/geo/rocks/basalt.png [2]→public/geo/rocks/rhyolite.png
[3]→public/geo/rocks/gabbro.png [4]→public/geo/rocks/conglomerate.png [5]→public/geo/rocks/sandstone.png
[6]→public/geo/rocks/mudstone.png [7]→public/geo/rocks/limestone.png [8]→public/geo/rocks/schist.png
[9]→public/geo/rocks/gneiss.png [10]→public/geo/rocks/quartzite.png [11]→public/geo/rocks/marble.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/12"를 출력하라.
PROMPT

echo "=== RUN 2: minerals (6) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/geo_prompts.txt 파일을 읽어라. [12]~[17] 여섯 개의 광물 표본 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일 A" 블록을 붙여 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자·숫자 절대 금지.
저장 경로(순서대로):
[12]→public/geo/minerals/quartz.png [13]→public/geo/minerals/feldspar.png [14]→public/geo/minerals/biotite.png
[15]→public/geo/minerals/hornblende.png [16]→public/geo/minerals/calcite.png [17]→public/geo/minerals/magnetite.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/6"을 출력하라.
PROMPT

echo "=== RUN 3: evidence & problems (8) ==="
codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<'PROMPT'
qa/geo_prompts.txt 파일을 읽어라. [18]~[25] 여덟 개의 사진 프롬프트가 있다.
각 프롬프트 앞에 "공통 스타일 B" 블록을 붙여 내장 image_gen 도구로 정사각 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 이미지 안에 글자(읽을 수 있는 문자)는 절대 금지.
저장 경로(순서대로):
[18]→public/geo/evid/dolharubang.png [19]→public/geo/evid/haetae.png [20]→public/geo/evid/strata-cliff.png
[21]→public/geo/evid/dino-tracks.png [22]→public/geo/evid/gravestone.png [23]→public/geo/evid/mesosaurus.png
[24]→public/geo/evid/glossopteris.png [25]→public/geo/evid/glacial.png
각 이미지 생성 후 "IMG i: SAVED <경로>" 한 줄씩 보고하고, 끝나면 "DONE n/8"을 출력하라.
PROMPT

echo "=== ALL GEO ORDERS DONE ==="
ls public/geo/rocks public/geo/minerals public/geo/evid 2>/dev/null
