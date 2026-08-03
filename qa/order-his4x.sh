#!/usr/bin/env bash
# 역사① Ⅳ(h1u4) 만화 확대 발주 — codex ChatGPT image_gen(순차 6배치, 병렬 codex 금지).
# 반드시 his3x 발주의 "HIS3X ORDER DONE" 마커 확인 후 실행.
# bash qa/order-his4x.sh  (app 루트에서) → node qa/process-comics.mjs
set -u
cd "$(dirname "$0")/.."
mkdir -p public/comics/h1u4l1 public/comics/h1u4l2 public/comics/h1u4l5 public/comics/h1u4l6 public/comics/h1u4l7 public/comics/h1u4l10

order() {
  local tag="$1" range="$2" folder="$3" extra="$4"
  echo "=== BATCH $tag: comics/$folder 7컷 ==="
  codex exec --skip-git-repo-check -s danger-full-access -C "$(pwd)" - <<PROMPT
qa/his4x_prompts.txt 파일을 읽어라. [$range] 일곱 개의 만화 컷 프롬프트가 있다($folder).
각 프롬프트 앞에 파일의 "스타일 블록 C"를 붙여 내장 image_gen 도구로 이미지를 생성하라.
Google 도구 금지, 반드시 내장 image_gen만 사용. 종횡비 전부 가로 4:3.
저장 경로는 각 프롬프트의 file= 에 적힌 그대로.
핵심 계약: 이미지 안에 글자·숫자·한자·말풍선 절대 금지(문서·장부·판화 속 글은 추상 표식만),
인물은 말하는 연기만, 상단 1/3 여백, 주인공 가로 중앙 부근.
전투·유혈·무기로 사람을 겨누는 장면 절대 금지. 십자가·성상 등 종교 상징물·신앙 대상 절대 금지.
$extra
프롬프트 파일 등장인물 고정 블록을 지켜 컷마다 같은 모습을 유지하라. 손가락은 정확히 5개.
각 이미지 후 "IMG i: SAVED <경로>"를 출력하고, 끝나면 "DONE n/7"을 출력하라.
PROMPT
}

order "1/6" "t0]~[t6" "h1u4l1" "군사 대치는 성벽·깃발·천막·사신으로만(무기 겨눔 0). 황제·재상·거란 사신은 존엄 — 개그는 관리들 몫."
order "2/6" "u0]~[u6" "h1u4l2" "나침반은 물그릇에 뜬 바늘로. 선장·아라비아 상인은 존엄 — 벌벌 개그는 신참 뱃사람 몫."
order "3/6" "v0]~[v6" "h1u4l5" "도자기 문양은 추상 덩굴무늬만. 실패 개그는 유럽 장인 몫 — 경덕진 도공은 장인의 존엄 유지."
order "4/6" "w0]~[w6" "h1u4l6" "호쿠사이는 애정 어린 괴짜 톤(존엄 유지). 판화 속 그림은 파도·산 형태만 — 글자 절대 금지."
order "5/6" "x0]~[x6" "h1u4l7" "아크바르는 존엄·경청 — 개그는 장부 관리 몫. 종교 학자들은 서로 다른 모자·복장으로만 구분(상징물 0)."
order "6/6" "y0]~[y6" "h1u4l10" "루터·성직자·구교·신교 모두 희화 절대 금지(개그는 인쇄소 조수·시민 몫). 성당은 문·탑 외관만. y1 문서의 줄 표식은 추상만."

echo "=== HIS4X ORDER DONE ==="
ls public/comics/h1u4l1 public/comics/h1u4l2 public/comics/h1u4l5 public/comics/h1u4l6 public/comics/h1u4l7 public/comics/h1u4l10 2>/dev/null
