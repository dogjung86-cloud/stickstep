// hookHis2 — 역사① Ⅱ 단원(문명의 발생과 고대 세계) 훅 장면 7종. hook.ts의 디스패처가
// renderHis2 하나만 불러 쓴다(공유 파일 hook.ts의 append를 최소화하는 서브 디스패처 문법).
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수,
// 스틱맨만 손그림 라인(#3C4654). CSS 상태 클래스 접두사는 hh2-(styles/his.css).
//   sprout     L2 — 학교 텃밭 물 주기: 심으면 곁을 못 떠난다(농경 → 정착 = 신석기 혁명)
//   receipt    L3 — 편의점 영수증: 인류 최초의 문자 기록도 거래 장부였다
//   aptmap     L4 — 아파트 단지 배치도: 4500년 전의 계획 도시 모헨조다로
//   parcel     L5 — 하루 만에 온 택배: 역마다 말을 갈아탄 '왕의 길'
//   olympic    L6 — 올림픽 중계: 폴리스들의 올림피아 제전이 뿌리
//   romanclock L7 — 시계판의 로마 숫자: 일상에 남은 로마의 흔적
//   silkscarf  L9 — 실크 스카프 라벨: 비단이 걸어간 길, 비단길
// 훅 문법: 조작 먼저 → 예측은 공용 ask()(choices[0]=정답, good≠bad — 오답은 오개념 교정).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;
type HookOpts = { choices?: string[] };

/* ── L2: 텃밭 물 주기(sprout) ──────────────────────────────── */
function renderSprout(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-garden" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-gd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFEAF8"/><stop offset="1" stop-color="#EDF7FB"/></linearGradient>
        <linearGradient id="hh2-gd-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5C34"/><stop offset=".6" stop-color="#6E4524"/><stop offset="1" stop-color="#523018"/></linearGradient>
        <linearGradient id="hh2-gd-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87A3E"/><stop offset="1" stop-color="#84582A"/></linearGradient>
        <linearGradient id="hh2-gd-can" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD6E2"/><stop offset=".55" stop-color="#3FA3AE"/><stop offset="1" stop-color="#0E7C8A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="140" rx="12" fill="url(#hh2-gd-sky)"/>
      <circle cx="256" cy="34" r="14" fill="#FFD98A" stroke="#E0A72E" stroke-width="2"/>
      <rect x="24" y="112" width="184" height="14" rx="4" fill="url(#hh2-gd-wood)" stroke="#5E4626" stroke-width="1.8"/>
      <path d="M30 126 h172 l-6 52 h-160 z" fill="url(#hh2-gd-soil)" stroke="#3E2410" stroke-width="2"/>
      <path d="M40 132 q76 8 152 0" stroke="#8A5C34" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <g class="hh2-gd-seed">
        <ellipse cx="118" cy="136" rx="7" ry="4.5" fill="#E8C88E" stroke="#8A6534" stroke-width="1.4"/>
      </g>
      <g class="hh2-gd-plant">
        <path class="st" d="M118 138 q-1 -14 0 -22" stroke="#4E8E3E" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path class="lf a" d="M118 124 q-10 -3 -13 -11 q10 0 13 8 z" fill="#8FCE6E" stroke="#4E8E3E" stroke-width="1.6"/>
        <path class="lf b" d="M118 120 q10 -3 13 -11 q-10 0 -13 8 z" fill="#7FC25E" stroke="#4E8E3E" stroke-width="1.6"/>
      </g>
      <rect x="222" y="88" width="52" height="38" rx="5" fill="#FDFCF5" stroke="#8A6A3E" stroke-width="2"/>
      <path d="M248 126 v18" stroke="#8A6A3E" stroke-width="3" stroke-linecap="round"/>
      <text x="248" y="104" text-anchor="middle" font-size="9.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">방울토마토</text>
      <text x="248" y="118" text-anchor="middle" font-size="8.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">매일 물 주기!</text>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="52" cy="70" r="9" fill="#FFE8CE"/>
        <path d="M52 79 v24 M52 86 l-11 7 M52 86 l12 4 M52 103 l-9 14 M52 103 l9 14"/>
      </g>
      <g class="hh2-gd-drops" opacity="0">
        <path d="M96 96 q2 5 0 7 M106 90 q2 5 0 7 M116 96 q2 5 0 7 M126 90 q2 5 0 7" stroke="#5AB4D6" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </svg>
    <button type="button" class="hh2-gd-can" aria-label="물뿌리개로 물 주기">
      <svg viewBox="0 0 64 44" fill="none" aria-hidden="true">
        <path d="M18 14 h24 v22 q-12 5 -24 0 z" fill="url(#hh2-gd-can)" stroke="#0A5964" stroke-width="2"/>
        <path d="M42 20 l14 -8 M56 12 l-3 7 M56 12 l-7 -1" stroke="#0A5964" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M18 20 q-8 4 0 10" stroke="#0A5964" stroke-width="2.4" fill="none"/>
        <ellipse cx="24" cy="18" rx="5" ry="1.8" fill="#fff" opacity=".4"/>
      </svg>
      <span>물 주기</span>
    </button>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "텃밭 상자에 방울토마토 모종을 심었어요. 아래 <b>물뿌리개를 탭</b>해서 첫 물을 줘 볼까요?";

  let watered = false;
  let timer = 0;
  const btn = fig.querySelector(".hh2-gd-can") as HTMLButtonElement;
  btn.addEventListener("click", () => {
    if (watered) return;
    watered = true;
    haptic(HAPTIC.tap);
    fig.classList.add("watered");
    face("cheer");
    helper.innerHTML = "새싹이 쏙! 그런데 팻말을 보니 <b>매일</b> 물을 줘야 한대요. 열매까지는 몇 달이 걸리고요.";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "곡식이 자랄 때까지 곁에서 돌봐야 해서",
          "농사가 사냥보다 재미있어서",
          "밭 근처에만 마실 물이 있어서",
        ],
        good: "맞아요! 심은 작물은 물 주고 돌보고 거둘 때까지 <b>곁을 떠날 수 없어요</b>. 그래서 약 1만 년 전 농경을 시작한 사람들은 떠돌이 생활을 접고 <b>정착</b>했죠 — 인류의 생활을 통째로 바꾼 이 변화, 지금 만나러 가요!",
        bad: "재미나 물 때문이 아니라 <b>돌봄의 시간</b> 때문이에요 — 심은 곡식이 열매 맺기까지 몇 달을 곁에서 지켜야 하니, 옮겨 다니던 사람들이 한곳에 눌러앉게 된 거죠. 이 변화가 인류의 생활을 통째로 바꿨답니다!",
        onDone: finish,
      });
    }, 950);
  });
  return () => window.clearTimeout(timer);
}

/* ── L3: 편의점 영수증(receipt) ────────────────────────────── */
function renderReceipt(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-receipt" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-rc-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset=".55" stop-color="#B67F42"/><stop offset="1" stop-color="#8E5D2A"/></linearGradient>
        <linearGradient id="hh2-rc-pap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F4"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh2-rc-table)"/>
      <ellipse cx="150" cy="182" rx="110" ry="9" fill="#4A2A08" opacity=".2"/>
      <g class="hh2-rc-folded" role="button" tabindex="0" aria-label="접힌 영수증 — 탭해서 펼치기">
        <path d="M96 96 l52 -14 56 10 -6 44 -52 12 -54 -8 z" fill="url(#hh2-rc-pap)" stroke="#B9C1CC" stroke-width="2"/>
        <path d="M148 82 l-4 56 M96 96 l54 10 54 -14" stroke="#C9D2DE" stroke-width="1.6" fill="none"/>
        <path d="M104 104 h28 M108 116 h22" stroke="#D7DCE2" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="hh2-rc-open">
        <rect x="86" y="18" width="128" height="176" rx="6" fill="url(#hh2-rc-pap)" stroke="#B9C1CC" stroke-width="2"/>
        <path d="M86 26 l8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8" transform="translate(0 -8)" stroke="#C9D2DE" stroke-width="1.4" fill="none" opacity="0"/>
        <text x="150" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">스틱 마트</text>
        <path d="M96 52 h108" stroke="#C9D2DE" stroke-width="1.6" stroke-dasharray="3 3"/>
        <text x="100" y="72" font-size="10.5" font-weight="700" fill="#4E5968" font-family="Pretendard, sans-serif">우유</text>
        <text x="200" y="72" text-anchor="end" font-size="10.5" font-weight="800" fill="#33405A" font-family="Pretendard, sans-serif">1개</text>
        <text x="100" y="92" font-size="10.5" font-weight="700" fill="#4E5968" font-family="Pretendard, sans-serif">단팥빵</text>
        <text x="200" y="92" text-anchor="end" font-size="10.5" font-weight="800" fill="#33405A" font-family="Pretendard, sans-serif">2개</text>
        <text x="100" y="112" font-size="10.5" font-weight="700" fill="#4E5968" font-family="Pretendard, sans-serif">바나나맛 우유</text>
        <text x="200" y="112" text-anchor="end" font-size="10.5" font-weight="800" fill="#33405A" font-family="Pretendard, sans-serif">1개</text>
        <path d="M96 126 h108" stroke="#C9D2DE" stroke-width="1.6" stroke-dasharray="3 3"/>
        <text x="100" y="146" font-size="11" font-weight="900" fill="#191F28" font-family="Pretendard, sans-serif">합계</text>
        <text x="200" y="146" text-anchor="end" font-size="11" font-weight="900" fill="#0E7C8A" font-family="Pretendard, sans-serif">4,700원</text>
        <text x="150" y="170" text-anchor="middle" font-size="9" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">오늘 날짜 · 시간까지 정확히!</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="120" r="9" fill="#FFE8CE"/>
        <path d="M44 129 v22 M44 136 l12 6 M44 136 l-11 7 M44 151 l-9 14 M44 151 l9 14"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "주머니에서 나온 <b>접힌 영수증</b> — 버리기 전에 <b>탭해서</b> 펼쳐 봐요!";

  let opened = false;
  let timer = 0;
  const folded = fig.querySelector(".hh2-rc-folded") as SVGGElement;
  const open = (): void => {
    if (opened) return;
    opened = true;
    haptic(HAPTIC.select);
    fig.classList.add("open");
    face("curious");
    helper.innerHTML = "무엇을 몇 개 샀는지, 언제 샀는지까지 또박또박 — 거래의 <b>완벽한 기록</b>이네요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "오늘 영수증 같은 곡식·가축의 거래 기록",
          "왕을 찬양하는 웅장한 노래",
          "별자리를 관찰한 일기",
        ],
        good: "맞아요! 남아 있는 인류의 <b>가장 오래된 문자 기록들 상당수가 거래와 회계 장부</b>예요 — 「양 열 마리, 보리 몇 자루」처럼요. 문자는 잊지 않기 위한 실용의 발명품이었죠. 5천 년 전 수메르 시장에서 직접 확인해요!",
        bad: "멋진 노래나 일기를 상상하기 쉽지만 — 실제로 남은 최초의 기록들 상당수는 <b>「양 열 마리, 소 한 마리」 같은 거래 장부</b>였어요. 기억 대신 증거가 필요했으니까요. 문자가 태어나던 5천 년 전 시장으로 가 봐요!",
        onDone: finish,
      });
    }, 950);
  };
  folded.addEventListener("click", open);
  folded.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); open(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L4: 아파트 단지 배치도(aptmap) ────────────────────────── */
function renderAptmap(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-apt" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-ap-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA3AE"/><stop offset=".6" stop-color="#0E7C8A"/><stop offset="1" stop-color="#0A5F6B"/></linearGradient>
        <linearGradient id="hh2-ap-pap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF2F6"/></linearGradient>
        <linearGradient id="hh2-ap-leg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B95A1"/><stop offset="1" stop-color="#5B6570"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="#EAF3EC"/>
      <path d="M6 168 h288 v36 h-288 z" fill="#CDE4D2"/>
      <ellipse cx="150" cy="186" rx="104" ry="7" fill="#2A3A5E" opacity=".1"/>
      <rect x="142" y="150" width="9" height="40" rx="3" fill="url(#hh2-ap-leg)"/>
      <g class="hh2-ap-board" role="button" tabindex="0" aria-label="단지 안내판 — 탭해서 확대">
        <rect x="58" y="26" width="184" height="128" rx="10" fill="url(#hh2-ap-board)" stroke="#073E46" stroke-width="2.4"/>
        <rect x="68" y="48" width="164" height="96" rx="6" fill="url(#hh2-ap-pap)" stroke="#0A5F6B" stroke-width="1.6"/>
        <text x="150" y="42" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">단지 안내도</text>
        <rect x="76" y="58" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <rect x="118" y="58" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <rect x="160" y="58" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <rect x="202" y="58" width="22" height="20" rx="4" fill="#FBE3B4" stroke="#C2843A" stroke-width="1.4"/>
        <rect x="76" y="94" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <rect x="118" y="94" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <rect x="160" y="94" width="34" height="20" rx="4" fill="#BFE3E8" stroke="#3FA3AE" stroke-width="1.4"/>
        <circle cx="213" cy="104" r="10" fill="#CDE9CD" stroke="#4E8E3E" stroke-width="1.4"/>
        <path d="M76 86 h148 M112 58 v56 M154 58 v56 M196 58 v56" stroke="#8FB8C2" stroke-width="2"/>
        <path d="M76 122 h148" stroke="#8FB8C2" stroke-width="3"/>
        <text x="150" y="136" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">동 사이 도로 · 놀이터 · 주차장</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="34" cy="140" r="9" fill="#FFE8CE"/>
        <path d="M34 149 v22 M34 156 l12 5 M34 156 l-11 7 M34 171 l-8 14 M34 171 l8 14"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "친구네 아파트 입구의 <b>단지 안내도</b>예요. <b>탭해서</b> 자세히 봐요!";

  let zoomed = false;
  let timer = 0;
  const board = fig.querySelector(".hh2-ap-board") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "동과 동 사이 도로가 <b>바둑판</b>처럼 반듯해요. 놀이터·주차장 자리까지 처음부터 <b>계획된</b> 거죠!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "있었다 — 도로와 하수 시설까지 갖춘 도시",
          "없었다 — 계획 도시는 현대의 발명품이다",
          "있었지만 건물은 왕궁 한 채뿐이었다",
        ],
        good: "놀랍게도 <b>있었어요!</b> 4500년 전 인더스강의 <b>모헨조다로</b>는 바둑판 도로에 하수 시설, 대형 목욕장, 곡물 창고까지 갖춘 계획도시였답니다. 이집트·인도·중국 — 개성 만점 문명들을 만나러 가요!",
        bad: "현대의 발명품 같지만 — 4500년 전 인더스강 유역의 <b>모헨조다로</b>가 이미 계획도시였어요! 바둑판 도로, 집집마다 이어진 하수 시설, 대형 목욕장과 곡물 창고까지. 왕궁 한 채가 아니라 <b>도시 전체가 설계</b>된 거죠. 직접 보러 가요!",
        onDone: finish,
      });
    }, 950);
  };
  board.addEventListener("click", zoom);
  board.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L5: 하루 만에 온 택배(parcel) ─────────────────────────── */
function renderParcel(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-parcel" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-pc-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8FA0B6"/><stop offset=".5" stop-color="#7A8CA4"/><stop offset="1" stop-color="#64768E"/></linearGradient>
        <linearGradient id="hh2-pc-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCA97A"/><stop offset=".55" stop-color="#BE8250"/><stop offset="1" stop-color="#94602F"/></linearGradient>
        <linearGradient id="hh2-pc-slip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F4"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="#EDEAE2"/>
      <rect x="96" y="12" width="108" height="152" rx="6" fill="url(#hh2-pc-door)" stroke="#4E6078" stroke-width="2.4"/>
      <circle cx="188" cy="92" r="4" fill="#39424E"/>
      <path d="M6 164 h288 v40 h-288 z" fill="#D8D2C2"/>
      <ellipse cx="150" cy="180" rx="96" ry="7" fill="#2A3A5E" opacity=".12"/>
      <g class="hh2-pc-boxg" role="button" tabindex="0" aria-label="문 앞 택배 상자 — 탭해서 송장 보기">
        <path d="M104 130 h72 v42 h-72 z" fill="url(#hh2-pc-box)" stroke="#6E4626" stroke-width="2.2"/>
        <path d="M104 130 h72 l-8 -14 h-56 z" fill="#D8A26E" stroke="#6E4626" stroke-width="2"/>
        <path d="M140 116 v56" stroke="#E8C48E" stroke-width="5"/>
        <rect x="112" y="140" width="28" height="18" rx="2.5" fill="url(#hh2-pc-slip)" stroke="#8B95A1" stroke-width="1.4"/>
        <path d="M116 146 h20 M116 151 h14" stroke="#B9C1CC" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="118" cy="122" rx="7" ry="2" fill="#fff" opacity=".35"/>
      </g>
      <g class="hh2-pc-zoom">
        <rect x="42" y="26" width="216" height="128" rx="10" fill="url(#hh2-pc-slip)" stroke="#8B95A1" stroke-width="2.2"/>
        <text x="150" y="48" text-anchor="middle" font-size="12" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">배송 조회</text>
        <path d="M66 92 h168" stroke="#C9D2DE" stroke-width="3" stroke-linecap="round"/>
        <circle cx="66" cy="92" r="7" fill="#0E7C8A"/>
        <circle cx="122" cy="92" r="7" fill="#0E7C8A"/>
        <circle cx="178" cy="92" r="7" fill="#0E7C8A"/>
        <circle cx="234" cy="92" r="7" fill="#04B45F"/>
        <path d="M231 92 l2.4 2.4 4 -4.6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <text x="66" y="114" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">어제 20:10</text>
        <text x="66" y="126" text-anchor="middle" font-size="8" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">주문</text>
        <text x="122" y="114" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">밤 01:40</text>
        <text x="122" y="126" text-anchor="middle" font-size="8" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">허브 통과</text>
        <text x="178" y="114" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">새벽 05:20</text>
        <text x="178" y="126" text-anchor="middle" font-size="8" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">지역 터미널</text>
        <text x="234" y="114" text-anchor="middle" font-size="8.5" font-weight="900" fill="#04833F" font-family="Pretendard, sans-serif">오늘 07:30</text>
        <text x="234" y="126" text-anchor="middle" font-size="8" font-weight="700" fill="#8B95A1" font-family="Pretendard, sans-serif">배송 완료</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="120" r="9" fill="#FFE8CE"/>
        <path d="M44 129 v22 M44 136 l12 6 M44 136 l-11 7 M44 151 l-9 14 M44 151 l9 14"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "문 앞에 <b>택배 상자</b>가 벌써! 어제 주문했는데요. <b>상자를 탭</b>해서 배송 기록을 봐요.";

  let opened = false;
  let timer = 0;
  const boxg = fig.querySelector(".hh2-pc-boxg") as SVGGElement;
  const open = (): void => {
    if (opened) return;
    opened = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "밤사이 <b>허브와 터미널을 거치며</b> 릴레이로 달려왔네요. 그런데 2500년 전에도 이런 시스템이 있었대요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "길을 닦고 역마다 말을 갈아타게 했다",
          "제국이 작아서 하루면 끝에서 끝까지 갔다",
          "전령 한 명이 같은 말로 쉬지 않고 달렸다",
        ],
        good: "정확해요! 페르시아의 <b>「왕의 길」</b> — 약 2,400km 도로에 일정한 거리마다 <b>역</b>을 두고, 전령이 <b>말을 갈아타며</b> 밤낮으로 달렸어요. 오늘 새벽 택배의 허브 릴레이와 같은 원리죠! 이 길을 만든 제국을 만나러 가요.",
        bad: "페르시아는 이집트에서 인더스강까지 이르는 <b>대제국</b>이었고, 말 한 마리로는 그 거리를 감당할 수 없어요. 비결은 시스템 — 「왕의 길」 위 <b>역마다 새 말로 갈아타는 릴레이</b>였답니다. 택배 허브와 같은 원리죠!",
        onDone: finish,
      });
    }, 1000);
  };
  boxg.addEventListener("click", open);
  boxg.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); open(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L6: 올림픽 중계(olympic) ──────────────────────────────── */
function renderOlympic(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-tv" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-tv-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#39424E"/><stop offset="1" stop-color="#141C26"/></linearGradient>
        <linearGradient id="hh2-tv-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E3C64"/><stop offset="1" stop-color="#0F2440"/></linearGradient>
        <linearGradient id="hh2-tv-track" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C86A4E"/><stop offset="1" stop-color="#A84E36"/></linearGradient>
        <radialGradient id="hh2-tv-flame" cx=".5" cy=".35" r="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".6" stop-color="#F2A33E"/><stop offset="1" stop-color="#D86A1E"/></radialGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="#F2EDE4"/>
      <rect x="30" y="20" width="240" height="150" rx="12" fill="url(#hh2-tv-body)"/>
      <g class="hh2-tv-scrg" role="button" tabindex="0" aria-label="올림픽 중계 화면 — 탭해서 자세히 보기">
        <rect x="42" y="32" width="216" height="126" rx="7" fill="url(#hh2-tv-scr)"/>
        <path d="M42 122 h216 v36 h-216 z" fill="url(#hh2-tv-track)"/>
        <path d="M42 130 h216 M42 140 h216 M42 150 h216" stroke="#E8D4C2" stroke-width="1.4" opacity=".55"/>
        <g stroke="#F2F6FB" stroke-width="2.2" fill="none">
          <circle cx="118" cy="118" r="6" fill="#FFE8CE"/>
          <path d="M118 124 l-3 12 M118 124 l6 10 M121 136 l-2 12 M124 134 l8 8 M118 130 l-10 4 M118 128 l11 -2"/>
        </g>
        <g stroke="#C9D2DE" stroke-width="2" fill="none" opacity=".8">
          <circle cx="86" cy="120" r="5.4" fill="#E8D0B4"/>
          <path d="M86 125 l-3 11 M86 125 l5 9 M89 136 l-2 10 M86 129 l-9 3 M86 128 l9 -1"/>
        </g>
        <g class="hh2-tv-torch">
          <path d="M206 96 l7 -18 7 18 q-7 5 -14 0 z" fill="#E8C48E" stroke="#8A6534" stroke-width="1.6"/>
          <path d="M213 80 q-9 -10 -2 -22 q2 8 8 10 q-2 -10 6 -16 q0 10 5 14 q4 6 -3 12 q-7 6 -14 2 z" fill="url(#hh2-tv-flame)"/>
        </g>
        <path d="M196 44 q17 -10 34 0 l-4 7 q-13 -7 -26 0 z" fill="none" stroke="#8FCE6E" stroke-width="2.4" stroke-linejoin="round"/>
        <text x="150" y="52" text-anchor="middle" font-size="10" font-weight="900" fill="#F2F6FB" font-family="Pretendard, sans-serif">달리기 결승</text>
        <rect x="50" y="40" width="34" height="13" rx="6.5" fill="#E2574C"/>
        <text x="67" y="49.5" text-anchor="middle" font-size="8" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">생중계</text>
      </g>
      <rect x="138" y="170" width="24" height="12" rx="3" fill="#39424E"/>
      <rect x="112" y="182" width="76" height="8" rx="4" fill="#39424E"/>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="270" cy="176" r="8" fill="#FFE8CE"/>
        <path d="M270 184 v16 M270 189 l-9 5 M270 189 l9 5 M270 200 l-7 10 M270 200 l7 10" transform="translate(0 -6)"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "TV에서 <b>올림픽 결승전</b>이 한창이에요! <b>화면을 탭</b>해서 자세히 볼까요?";

  let tapped = false;
  let timer = 0;
  const scr = fig.querySelector(".hh2-tv-scrg") as SVGGElement;
  const tap = (): void => {
    if (tapped) return;
    tapped = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "타오르는 <b>성화</b>, 승자의 <b>월계관</b>… 온 세계가 4년마다 모이는 이 대회, 어디서 시작됐을까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "고대 그리스 폴리스들의 제전에서",
          "근대 유럽에서 처음 발명된 대회다",
          "고대 로마의 검투 경기에서",
        ],
        good: "맞아요! 수많은 폴리스로 흩어져 살던 그리스인들이 4년마다 올림피아에 모여 열던 <b>올림피아 제전</b>이 뿌리예요 — 같은 그리스인임을 확인하던 축제였죠. 그 폴리스의 세계로 들어가요!",
        bad: "1896년에 부활한 근대 올림픽의 <b>원조</b>는 2700여 년 전 그리스의 올림피아 제전이에요 — 폴리스로 흩어진 그리스인들이 결속을 다지던 축제였죠. 검투 경기는 로마 콜로세움의 것! 폴리스의 세계로 확인하러 가요.",
        onDone: finish,
      });
    }, 950);
  };
  scr.addEventListener("click", tap);
  scr.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); tap(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L7: 시계판의 로마 숫자(romanclock) ────────────────────── */
function renderRomanclock(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-clock" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-ck-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EDE4"/><stop offset="1" stop-color="#E2D8C8"/></linearGradient>
        <radialGradient id="hh2-ck-face" cx=".42" cy=".36" r="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F4F8"/><stop offset="1" stop-color="#D8E0EA"/></radialGradient>
        <linearGradient id="hh2-ck-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87A3E"/><stop offset="1" stop-color="#84582A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="url(#hh2-ck-wall)"/>
      <g class="hh2-ck-body" role="button" tabindex="0" aria-label="벽시계 — 탭해서 숫자 확대">
        <circle cx="150" cy="100" r="74" fill="url(#hh2-ck-rim)" stroke="#5E4626" stroke-width="2.6"/>
        <circle cx="150" cy="100" r="64" fill="url(#hh2-ck-face)" stroke="#8A6A3E" stroke-width="1.6"/>
        <text x="150" y="55" text-anchor="middle" font-size="13" font-weight="900" fill="#33405A" font-family="Georgia, serif">XII</text>
        <text x="199" y="105" text-anchor="middle" font-size="13" font-weight="900" fill="#33405A" font-family="Georgia, serif">III</text>
        <text x="150" y="153" text-anchor="middle" font-size="13" font-weight="900" fill="#33405A" font-family="Georgia, serif">VI</text>
        <text x="101" y="105" text-anchor="middle" font-size="13" font-weight="900" fill="#33405A" font-family="Georgia, serif">IX</text>
        <circle cx="150" cy="100" r="3.6" fill="#33405A"/>
        <path d="M150 100 L150 62" stroke="#33405A" stroke-width="4" stroke-linecap="round"/>
        <path d="M150 100 L182 118" stroke="#33405A" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="122" cy="66" rx="14" ry="6" fill="#fff" opacity=".5" transform="rotate(-28 122 66)"/>
      </g>
      <g class="hh2-ck-zoom">
        <circle cx="150" cy="104" r="66" fill="#FDFEFF" stroke="#8A6A3E" stroke-width="5"/>
        <path d="M198 152 l24 24" stroke="#6E4E26" stroke-width="10" stroke-linecap="round"/>
        <text x="150" y="92" text-anchor="middle" font-size="26" font-weight="900" fill="#33405A" font-family="Georgia, serif">XII · III</text>
        <text x="150" y="128" text-anchor="middle" font-size="26" font-weight="900" fill="#33405A" font-family="Georgia, serif">VI · IX</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="46" cy="152" r="9" fill="#FFE8CE"/>
        <path d="M46 161 v20 M46 167 l-11 6 M46 167 l12 4 M46 181 l-8 14 M46 181 l8 14"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "거실에 새로 건 벽시계 — 그런데 숫자가 1, 2, 3이 아니에요! <b>시계를 탭</b>해서 확대해요.";

  let zoomed = false;
  let timer = 0;
  const body = fig.querySelector(".hh2-ck-body") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "<b>XII, III, VI, IX</b> — 막대기와 브이(V), 엑스(X)로 조합된 낯선 글자들이에요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "고대 로마 사람들이 쓰던 숫자",
          "시계 회사가 만든 장식 무늬",
          "그리스 알파벳",
        ],
        good: "맞아요! <b>로마 숫자</b>예요 — I은 1, V는 5, X는 10. 2천 년 전 로마인의 숫자가 지금도 시계판과 책 차례에 살아 있죠. 이렇게 흔적을 잔뜩 남긴 로마는 대체 어떤 나라였을까요?",
        bad: "장식처럼 보이지만 뜻이 있는 <b>고대 로마의 숫자</b>랍니다 — I=1, V=5, X=10, 그래서 XII는 12! 그리스 알파벳(α, β)과는 달라요. 2천 년 전의 숫자가 아직 우리 곁에 있는 것처럼, 로마가 남긴 유산은 정말 많아요. 만나러 가요!",
        onDone: finish,
      });
    }, 950);
  };
  body.addEventListener("click", zoom);
  body.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/* ── L9: 실크 스카프 라벨(silkscarf) ───────────────────────── */
function renderSilkscarf(scene: HTMLElement, helper: HTMLElement, s: HookOpts, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hh2-scarf" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh2-sc-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2D9E4"/><stop offset=".55" stop-color="#E0B4C8"/><stop offset="1" stop-color="#C88EA8"/></linearGradient>
        <linearGradient id="hh2-sc-silk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BFE8F0"/><stop offset=".4" stop-color="#7FC8DC"/><stop offset=".7" stop-color="#3FA3AE"/><stop offset="1" stop-color="#0E7C8A"/></linearGradient>
        <linearGradient id="hh2-sc-tag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F4"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="198" rx="12" fill="#F7F2EA"/>
      <ellipse cx="150" cy="178" rx="104" ry="8" fill="#2A3A5E" opacity=".1"/>
      <path d="M62 92 h176 v78 h-176 z" fill="url(#hh2-sc-box)" stroke="#A86E8C" stroke-width="2.2"/>
      <path d="M56 78 h188 v20 h-188 z" fill="#E8C2D4" stroke="#A86E8C" stroke-width="2.2"/>
      <path d="M96 108 q28 -18 54 0 q26 16 54 -2 q-6 30 -54 26 q-44 4 -54 -24 z" fill="url(#hh2-sc-silk)" stroke="#0A5964" stroke-width="1.8"/>
      <path d="M104 112 q24 -12 44 0 M112 126 q22 10 44 2" stroke="#EAF9FB" stroke-width="2" fill="none" opacity=".7"/>
      <ellipse cx="118" cy="106" rx="12" ry="4" fill="#fff" opacity=".45" transform="rotate(-14 118 106)"/>
      <g class="hh2-sc-tagg" role="button" tabindex="0" aria-label="스카프에 달린 라벨 — 탭해서 확대">
        <path d="M196 118 l14 -8" stroke="#8B95A1" stroke-width="1.8"/>
        <rect x="206" y="102" width="44" height="26" rx="5" fill="url(#hh2-sc-tag)" stroke="#8B95A1" stroke-width="1.8" transform="rotate(8 228 115)"/>
        <path d="M214 112 h26 M214 119 h18" stroke="#B9C1CC" stroke-width="2" stroke-linecap="round" transform="rotate(8 228 115)"/>
      </g>
      <g class="hh2-sc-zoom">
        <rect x="70" y="30" width="160" height="76" rx="12" fill="url(#hh2-sc-tag)" stroke="#8B95A1" stroke-width="2.4"/>
        <circle cx="88" cy="46" r="4" fill="none" stroke="#8B95A1" stroke-width="2"/>
        <text x="150" y="64" text-anchor="middle" font-size="19" font-weight="900" fill="#33405A" font-family="Pretendard, sans-serif">SILK 100%</text>
        <text x="150" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">실크(비단) · 부드럽게 손세탁</text>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="40" cy="130" r="9" fill="#FFE8CE"/>
        <path d="M40 139 v22 M40 146 l12 5 M40 146 l-11 7 M40 161 l-9 14 M40 161 l9 14"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "할머니 생신 선물로 고른 <b>스카프</b> — 유난히 부드럽고 반짝여요. <b>라벨을 탭</b>해 봐요!";

  let zoomed = false;
  let timer = 0;
  const tag = fig.querySelector(".hh2-sc-tagg") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "<b>실크(비단) 100%</b>! 그러고 보니 「비단길」이라는 길 이름, 들어 본 적 있죠?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "중국의 비단이 이 길로 서쪽까지 팔려 가서",
          "길바닥이 비단처럼 부드러워서",
          "비단 장수들이 직접 길을 닦아서",
        ],
        good: "맞아요! 그 길의 대표 상품이 이름이 됐어요 — 중국의 <b>비단</b>이 사막을 건너 로마까지 팔려 갔거든요. 비단만이 아니라 포도·석류, 그리고 <b>불교</b>까지 오간 길이죠. 길 위의 고대 세계로 떠나요!",
        bad: "길바닥 촉감도, 길을 닦은 사람도 아니에요 — 이 길로 오간 <b>대표 상품이 중국의 비단</b>이라 붙은 이름이랍니다. 로마 사람들이 이 감촉에 반해 비단을 샀거든요! 비단과 함께 불교까지 여행한 그 길로 떠나 봐요.",
        onDone: finish,
      });
    }, 950);
  };
  tag.addEventListener("click", zoom);
  tag.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); zoom(); }
  });
  return () => window.clearTimeout(timer);
}

/** Ⅱ 단원 훅 서브 디스패처 — hook.ts는 이 함수 하나만 부른다. 모르는 장면이면 null. */
export function renderHis2(
  name: string,
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookOpts,
  finish: () => void,
  face: Face,
): (() => void) | null {
  if (name === "sprout") return renderSprout(scene, helper, s, finish, face);
  if (name === "receipt") return renderReceipt(scene, helper, s, finish, face);
  if (name === "aptmap") return renderAptmap(scene, helper, s, finish, face);
  if (name === "parcel") return renderParcel(scene, helper, s, finish, face);
  if (name === "olympic") return renderOlympic(scene, helper, s, finish, face);
  if (name === "romanclock") return renderRomanclock(scene, helper, s, finish, face);
  if (name === "silkscarf") return renderSilkscarf(scene, helper, s, finish, face);
  return null;
}
