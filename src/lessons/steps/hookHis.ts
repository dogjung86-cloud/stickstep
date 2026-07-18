// hookHis — 역사① Ⅰ 단원(역사 학습의 기초) 훅 장면 5종. hook.ts의 디스패처가 불러 쓴다.
// 파운드리 SVG 문법(근-동조 그라데이션+키라이트+접촉 그림자+최암색 외곽선) 준수.
// 스틱맨 캐릭터만 손그림 라인(#3C4654) 유지. CSS 상태 클래스 접두사는 hh1-.
//   saveicon    L1 — 문서 앱 '저장' 버튼의 정체: 탭 → 실물 플로피 디스크 등장(일상 속 역사)
//   gamechar    L2 — 게임 카드 뒤집기: 멋진 장수가 알고 보니 기록 속 실존 인물
//   timecapsule L3 — 타임캡슐 개봉 연도 2394: 오늘의 물건이 미래의 역사 자료
//   dangi       L4 — 달력의 낯선 숫자 4359: 연도는 '기준'을 정해 센다(단기·서기)
//   milmyeon    L5 — 밀면집 벽의 유래 액자: 음식 한 그릇에 담긴 6·25 피란의 역사
// 훅 문법: 조작 먼저 → 예측은 공용 ask()(choices[0]=정답, good≠bad — 오답은 오개념 교정).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

// ── L1: 저장 아이콘의 정체(플로피 디스크) ────────────────────
function floppySvg(): string {
  return `<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="hh1-fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4E6AD8"/><stop offset=".55" stop-color="#3B4EC2"/><stop offset="1" stop-color="#2A3894"/></linearGradient>
      <linearGradient id="hh1-fl-lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EAF2"/></linearGradient>
      <linearGradient id="hh1-fl-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D2DE"/><stop offset="1" stop-color="#9AA6B6"/></linearGradient>
    </defs>
    <ellipse cx="60" cy="108" rx="40" ry="6" fill="#2A3A5E" opacity=".12"/>
    <path d="M18 22 h74 l10 10 v66 h-84 z" fill="url(#hh1-fl)" stroke="#1E2A6E" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="36" y="22" width="40" height="26" rx="2" fill="url(#hh1-fl-sh)" stroke="#1E2A6E" stroke-width="1.6"/>
    <rect x="62" y="26" width="9" height="18" rx="1.5" fill="#39424E"/>
    <rect x="28" y="60" width="64" height="34" rx="3" fill="url(#hh1-fl-lab)" stroke="#1E2A6E" stroke-width="1.6"/>
    <path d="M34 70 h52 M34 78 h52 M34 86 h34" stroke="#8B95A1" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="34" cy="30" rx="9" ry="3.4" fill="#fff" opacity=".35" transform="rotate(-18 34 30)"/>
  </svg>`;
}

export function renderSaveIcon(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hh1-doc" });
  fig.innerHTML = `
    <div class="hh1-appbar"><i></i><i></i><i></i><span>과학 숙제.txt</span></div>
    <div class="hh1-page">
      <div class="hh1-line w80"></div><div class="hh1-line w96"></div><div class="hh1-line w62"></div>
      <div class="hh1-line w88"></div><div class="hh1-line w40"></div>
      <span class="hh1-caret"></span>
    </div>
    <div class="hh1-toolbar">
      <button type="button" class="hh1-save" aria-label="저장 버튼">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 4h13l3 3v13H4z"/><rect x="8" y="4" width="8" height="5"/><rect x="7" y="13" width="10" height="7"/>
        </svg>
      </button>
      <span class="hh1-savetip">저장</span>
    </div>
    <div class="hh1-toast">저장 완료!</div>`;
  const floppy = el("div", { class: "hh1-floppy" });
  floppy.innerHTML = `${floppySvg()}<b>플로피 디스크<span>약 30년 전의 저장 장치</span></b>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, floppy, choicesBox);
  helper.innerHTML = "글쓰기 앱으로 숙제 중! 다 썼으면 왼쪽 아래 <b>저장 버튼을 탭</b>하세요.";

  let done = false;
  let timer = 0;
  const btn = fig.querySelector(".hh1-save") as HTMLButtonElement;
  const onSave = (): void => {
    if (done) return;
    done = true;
    haptic(HAPTIC.tap);
    fig.classList.add("saved");
    face("surprised");
    helper.innerHTML = "잠깐 — 저장 버튼의 <b>네모난 모양</b>… 어디서 온 걸까요? 그때, 책상 서랍에서 나온 물건 하나!";
    timer = window.setTimeout(() => {
      floppy.classList.add("in");
      helper.innerHTML = "저장 아이콘과 <b>똑같이 생긴 실물</b>이 있었어요! 이 모양의 정체는 뭘까요?";
      timer = window.setTimeout(() => {
        ask(choicesBox, helper, {
          choices: s.choices ?? [
            "옛날 컴퓨터 저장 장치의 모습이 아이콘으로 남은 것",
            "네모가 그리기 쉬워서 정한 디자인일 뿐",
            "요즘 새로 나온 최신 장치의 모습",
          ],
          good: "맞아요! 아이콘이 먼저가 아니라 <b>물건이 먼저</b> — 30년 전 저장 장치 '플로피 디스크'의 모습이 버튼에 그대로 남았어요. 우리가 매일 누르는 버튼에도 과거가 살아 있죠. 그런데 이런 '과거의 이야기', 즉 <b>역사</b>란 정확히 뭘까요? 두 역사가의 대결로 확인해요!",
          bad: "순서가 반대예요 — 아이콘이 먼저가 아니라 <b>물건이 먼저</b>랍니다. 옛날 컴퓨터의 저장 장치 '플로피 디스크' 모습이 그대로 아이콘이 된 거예요. 일상 곳곳에 이렇게 과거가 남아 있어요. 그렇다면 '역사'란 정확히 뭘까요? 두 역사가의 대결로 확인해요!",
          onDone: finish,
        });
      }, 900);
    }, 780);
  };
  btn.addEventListener("click", onSave);
  return () => window.clearTimeout(timer);
}

// ── L2: 게임 카드 뒤집기(실존 인물) ──────────────────────────
export function renderGameChar(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hh1-game" });
  fig.innerHTML = `
    <div class="hh1-hud"><span>전설의 장수전</span><i>NEW</i></div>
    <button type="button" class="hh1-cardflip" aria-label="캐릭터 카드 — 탭해서 정보 보기">
      <span class="hh1-cardface front">
        <svg viewBox="0 0 150 190" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hh1-gc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E3A8C"/><stop offset="1" stop-color="#141C4E"/></linearGradient>
            <linearGradient id="hh1-gc-arm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8EEF6"/><stop offset=".6" stop-color="#B9C6D8"/><stop offset="1" stop-color="#8A9AB2"/></linearGradient>
            <linearGradient id="hh1-gc-cape" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E86A5E"/><stop offset="1" stop-color="#B23428"/></linearGradient>
          </defs>
          <rect x="4" y="4" width="142" height="182" rx="12" fill="url(#hh1-gc-bg)"/>
          <circle cx="75" cy="52" r="21" fill="#FFD98A" opacity=".2"/>
          <path d="M40 158 q35 14 70 0 l0 20 q-35 10 -70 0 z" fill="url(#hh1-gc-cape)" opacity=".8"/>
          <ellipse cx="75" cy="156" rx="34" ry="5" fill="#000" opacity=".3"/>
          <g stroke="#E8EEF6" stroke-width="3" fill="none" stroke-linecap="round">
            <circle cx="75" cy="58" r="12" fill="#FFE8CE" stroke="#3C4654" stroke-width="2.6"/>
            <path d="M75 70 v34 M75 78 l-18 10 M75 78 l16 -8 M75 104 l-12 26 M75 104 l12 26" stroke="#3C4654" stroke-width="2.6"/>
          </g>
          <path d="M63 46 q12 -10 24 0 l-2 8 q-10 -6 -20 0 z" fill="url(#hh1-gc-arm)" stroke="#5A6B7E" stroke-width="1.6"/>
          <path d="M67 40 h16" stroke="#C2933A" stroke-width="3" stroke-linecap="round"/>
          <path d="M91 70 l26 -22 4 5 -24 24 z" fill="url(#hh1-gc-arm)" stroke="#5A6B7E" stroke-width="1.6"/>
          <circle cx="120" cy="45" r="4" fill="#FFD98A"/>
          <rect x="16" y="16" width="42" height="15" rx="7.5" fill="#FFD98A"/>
          <text x="37" y="27.5" text-anchor="middle" font-size="9.5" font-weight="900" fill="#5E4626" font-family="Pretendard, sans-serif">★ 전설</text>
        </svg>
      </span>
      <span class="hh1-cardface back">
        <svg viewBox="0 0 150 190" fill="none" aria-hidden="true">
          <defs><linearGradient id="hh1-gc-pa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF3DC"/><stop offset=".6" stop-color="#F0DFB4"/><stop offset="1" stop-color="#DCC48E"/></linearGradient></defs>
          <rect x="4" y="4" width="142" height="182" rx="12" fill="url(#hh1-gc-pa)" stroke="#8A6A3E" stroke-width="2"/>
          <rect x="18" y="20" width="114" height="26" rx="13" fill="#0E7C8A"/>
          <text x="75" y="37.5" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">기록 속 실존 인물!</text>
          <path d="M26 62 h98 M26 80 h98 M26 98 h72" stroke="#B99B66" stroke-width="4" stroke-linecap="round" opacity=".7"/>
          <path d="M26 124 q8 -12 20 0 q8 10 20 0 q8 -12 20 0 q8 10 20 0" stroke="#8A6A3E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <text x="75" y="162" text-anchor="middle" font-size="10" font-weight="800" fill="#7A5A2E" font-family="Pretendard, sans-serif">천 년 전 기록에 남은 장수</text>
        </svg>
      </span>
    </button>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "새 게임의 간판 캐릭터예요. <b>카드를 탭</b>해서 캐릭터 정보를 확인해요!";

  let flipped = false;
  let timer = 0;
  const card = fig.querySelector(".hh1-cardflip") as HTMLButtonElement;
  card.addEventListener("click", () => {
    if (flipped) return;
    flipped = true;
    haptic(HAPTIC.select);
    card.classList.add("flip");
    face("surprised");
    helper.innerHTML = "카드 뒷면에 <b>「기록 속 실존 인물」</b>이라고 적혀 있어요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "실제 역사 속 인물을 바탕으로 만든 캐릭터",
          "전부 상상으로만 지어낸 인물",
          "게임 회사 사장님을 그린 것",
        ],
        good: "맞아요! 게임·드라마·영화는 <b>역사에서 이야기를 빌려</b> 와요. 역사를 알면 그 재미가 두 배가 되죠. 그런데 역사는 재미 말고도 우리에게 주는 게 많아요 — 왜 배우는지 지금부터 알아봐요!",
        bad: "카드 뒷면을 다시 봐요 — <b>천 년 전 기록에 남은 실존 인물</b>이래요! 게임·드라마·영화 속 인물과 사건은 실제 역사에서 온 경우가 많답니다. 역사를 알면 재미가 두 배 — 그리고 역사가 주는 건 재미만이 아니에요!",
        onDone: finish,
      });
    }, 950);
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 타임캡슐(2394년 개봉) ────────────────────────────────
export function renderTimeCapsule(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hh1-capsule" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh1-tc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0F5"/><stop offset="1" stop-color="#E8F4FB"/></linearGradient>
        <linearGradient id="hh1-tc-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5C34"/><stop offset=".55" stop-color="#6E4524"/><stop offset="1" stop-color="#523018"/></linearGradient>
        <linearGradient id="hh1-tc-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D8E4F0"/><stop offset=".55" stop-color="#A8BACE"/><stop offset="1" stop-color="#7E92A8"/></linearGradient>
        <linearGradient id="hh1-tc-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0F6FC"/><stop offset="1" stop-color="#B9C8D8"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="110" rx="12" fill="url(#hh1-tc-sky)"/>
      <path d="M6 96 h288 v102 h-288 z" fill="url(#hh1-tc-soil)"/>
      <path d="M6 96 h288" stroke="#4E8A3A" stroke-width="7" stroke-linecap="round"/>
      <path d="M20 92 q4 -7 8 0 M34 93 q3 -6 6 0 M262 92 q4 -7 8 0" stroke="#3E7A2E" stroke-width="2.4" stroke-linecap="round"/>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="52" cy="52" r="9" fill="#FFE8CE"/>
        <path d="M52 61 v22 M52 68 l-11 6 M52 68 l12 -7 M52 83 l-9 12 M52 83 l9 12"/>
      </g>
      <path d="M66 58 l10 4 -2 6 -10 -3" fill="#C2843A" stroke="#8A5A26" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="180" y="30" width="86" height="40" rx="8" fill="#FDFCF5" stroke="#8A6A3E" stroke-width="2"/>
      <path d="M198 70 l-8 14" stroke="#8A6A3E" stroke-width="3" stroke-linecap="round"/>
      <text x="223" y="47" text-anchor="middle" font-size="11" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">타임캡슐</text>
      <text x="223" y="61" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0A5964" font-family="Pretendard, sans-serif">2394년에 열어 주세요</text>
      <g class="hh1-tc-boxg" role="button" tabindex="0" aria-label="땅속 타임캡슐 상자 — 탭해서 열기">
        <ellipse cx="150" cy="172" rx="46" ry="8" fill="#000" opacity=".25"/>
        <rect x="112" y="128" width="76" height="44" rx="8" fill="url(#hh1-tc-box)" stroke="#4E6078" stroke-width="2.2"/>
        <rect class="hh1-tc-lid" x="106" y="118" width="88" height="16" rx="7" fill="url(#hh1-tc-lid)" stroke="#4E6078" stroke-width="2.2"/>
        <circle cx="150" cy="150" r="9" fill="#FFD98A" stroke="#C2933A" stroke-width="2"/>
        <path d="M150 145 v10 M145 150 h10" stroke="#8A6534" stroke-width="1.8" stroke-linecap="round"/>
        <ellipse cx="128" cy="134" rx="8" ry="2.6" fill="#fff" opacity=".4"/>
      </g>
      <g class="hh1-tc-items">
        <g class="it a"><rect x="96" y="88" width="30" height="20" rx="3" fill="#FDFCF5" stroke="#8B95A1" stroke-width="1.6"/><path d="M101 94 h20 M101 99 h20 M101 103 h12" stroke="#B9C1CC" stroke-width="1.6" stroke-linecap="round"/><text x="111" y="86" text-anchor="middle" font-size="8" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">시험지</text></g>
        <g class="it b"><rect x="138" y="80" width="16" height="28" rx="4" fill="#39424E" stroke="#141C26" stroke-width="1.6"/><rect x="141" y="84" width="10" height="17" rx="1.5" fill="#7EC8FF"/><text x="146" y="76" text-anchor="middle" font-size="8" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">휴대 전화</text></g>
        <g class="it c"><path d="M170 100 q6 -12 20 -8 q8 2 6 9 q-2 6 -12 5 z" fill="#E86A5E" stroke="#B23428" stroke-width="1.6"/><path d="M172 100 q8 2 22 -3" stroke="#FDFCF5" stroke-width="2" stroke-linecap="round"/><text x="186" y="82" text-anchor="middle" font-size="8" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">운동화</text></g>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "학교 100주년 기념으로 <b>타임캡슐</b>을 묻는 날! 땅속 <b>상자를 탭</b>해서 안에 뭘 넣었는지 봐요.";

  let opened = false;
  let timer = 0;
  const boxg = fig.querySelector(".hh1-tc-boxg") as SVGGElement;
  const open = (): void => {
    if (opened) return;
    opened = true;
    haptic(HAPTIC.tap);
    fig.classList.add("open");
    face("curious");
    helper.innerHTML = "시험지·휴대 전화·운동화… 지금은 흔한 물건들이에요. 팻말엔 <b>「2394년에 열어 주세요」</b>!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "2026년의 생활을 알려 주는 소중한 역사 자료가 된다",
          "그냥 오래된 쓰레기가 된다",
          "미래에도 흔한 물건이라 아무 의미 없다",
        ],
        good: "정확해요! 미래 사람들에게 오늘의 물건은 <b>과거를 알려 주는 보물</b>이 돼요. 역사가들이 옛사람이 남긴 흔적으로 과거를 연구하는 것과 똑같죠 — 그 재료의 이름이 <b>사료</b>랍니다. 어떤 것들이 사료가 되는지 만나러 가요!",
        bad: "지금 보면 평범해도, 400년 뒤엔 2026년의 교실·놀이·생활을 생생히 알려 주는 <b>귀한 자료</b>가 돼요. 실제로 서울시는 1994년에 물건 600점을 묻었고 2394년에 열 예정이랍니다. 이런 '과거의 흔적'을 역사가는 <b>사료</b>라고 불러요!",
        onDone: finish,
      });
    }, 950);
  };
  boxg.addEventListener("click", open);
  boxg.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      open();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 달력의 낯선 숫자(단기 4359) ──────────────────────────
export function renderDangi(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hh1-cal" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 220" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh1-ca-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2EDE4"/><stop offset="1" stop-color="#E2D8C8"/></linearGradient>
        <linearGradient id="hh1-ca-pap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF0F4"/></linearGradient>
        <linearGradient id="hh1-ca-head" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FA3AE"/><stop offset=".6" stop-color="#0E7C8A"/><stop offset="1" stop-color="#0A5F6B"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="208" rx="12" fill="url(#hh1-ca-wall)"/>
      <circle cx="150" cy="22" r="4" fill="#8A6534"/>
      <g class="hh1-ca-body">
        <ellipse cx="150" cy="196" rx="70" ry="6" fill="#2A3A5E" opacity=".12"/>
        <rect x="70" y="26" width="160" height="164" rx="10" fill="url(#hh1-ca-pap)" stroke="#B9C1CC" stroke-width="1.8"/>
        <path d="M120 26 v-10 M180 26 v-10" stroke="#8B95A1" stroke-width="3" stroke-linecap="round"/>
        <rect x="70" y="26" width="160" height="38" rx="10" fill="url(#hh1-ca-head)"/>
        <rect x="70" y="52" width="160" height="12" fill="url(#hh1-ca-pap)"/>
        <text x="150" y="52" text-anchor="middle" font-size="17" font-weight="900" fill="#fff" font-family="Pretendard, sans-serif">2026년 7월</text>
        ${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5, 6].map((c) => `<rect x="${82 + c * 20}" y="${74 + r * 17}" width="16" height="13" rx="3" fill="${c === 0 ? "#FBE3E3" : "#F1F4F8"}"/>`).join("")).join("")}
        <g class="hh1-ca-small" role="button" tabindex="0" aria-label="달력 아래 작은 글씨 — 탭해서 확대">
          <rect x="88" y="162" width="124" height="18" rx="9" fill="#F1F4F8" stroke="#D7DCE2" stroke-width="1.2"/>
          <text x="150" y="174.5" text-anchor="middle" font-size="9" font-weight="800" fill="#8B95A1" font-family="Pretendard, sans-serif">단기 4359년 · 7월</text>
        </g>
      </g>
      <g class="hh1-ca-zoom">
        <ellipse cx="150" cy="188" rx="86" ry="7" fill="#2A3A5E" opacity=".14"/>
        <circle cx="150" cy="108" r="74" fill="#FDFEFF" stroke="#8A6A3E" stroke-width="5"/>
        <circle cx="150" cy="108" r="74" fill="none" stroke="#5E4626" stroke-width="1.6" opacity=".5"/>
        <path d="M203 162 l26 26" stroke="#6E4E26" stroke-width="11" stroke-linecap="round"/>
        <text x="150" y="98" text-anchor="middle" font-size="15" font-weight="800" fill="#5B6570" font-family="Pretendard, sans-serif">단기</text>
        <text x="150" y="130" text-anchor="middle" font-size="30" font-weight="900" fill="#0E7C8A" font-family="Pretendard, sans-serif">4359년</text>
        <path d="M108 74 q18 -16 40 -12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "할머니 댁 벽걸이 달력이에요. 그런데 아래에 <b>작은 글씨</b>가 있네요 — <b>탭해서 확대</b>해 봐요!";

  let zoomed = false;
  let timer = 0;
  const small = fig.querySelector(".hh1-ca-small") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("surprised");
    helper.innerHTML = "올해는 분명 2026년인데, 달력엔 <b>4359년</b>이라는 숫자도 함께 적혀 있어요!";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "연도를 세는 기준이 달라서 — 고조선 건국부터 세면 4359년",
          "달력이 잘못 인쇄된 것",
          "미래의 연도를 미리 적어 둔 것",
        ],
        good: "맞아요! 연도는 <b>기준을 정해</b> 세요. 2026은 예수가 태어난 해 기준(서기), 4359는 고조선 건국(기원전 2333년) 기준(단기) — 2333+2026=4359, 계산도 딱 맞죠? 시간을 세는 법, 지금부터 정복해요!",
        bad: "오타가 아니에요 — 연도는 <b>기준</b>을 정해 세는 거예요. 2026은 예수 탄생 기준(서기), 4359는 고조선 건국(기원전 2333년) 기준(단기)! 2333+2026=4359, 계산도 딱 맞아요. 기준이 다르면 같은 해도 숫자가 달라진답니다.",
        onDone: finish,
      });
    }, 950);
  };
  small.addEventListener("click", zoom);
  small.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      zoom();
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L5: 밀면집 벽의 유래 액자 ────────────────────────────────
export function renderMilmyeon(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hh1-noodle" });
  fig.innerHTML = `
    <svg viewBox="0 0 300 220" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hh1-nd-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EEDF"/><stop offset="1" stop-color="#E6D9C2"/></linearGradient>
        <linearGradient id="hh1-nd-table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9A76C"/><stop offset=".55" stop-color="#B67F42"/><stop offset="1" stop-color="#8E5D2A"/></linearGradient>
        <radialGradient id="hh1-nd-bowl" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".62" stop-color="#E9EEF4"/><stop offset="1" stop-color="#C6D2E0"/></radialGradient>
        <linearGradient id="hh1-nd-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C89A5E"/><stop offset=".55" stop-color="#A87A3E"/><stop offset="1" stop-color="#84582A"/></linearGradient>
      </defs>
      <rect x="6" y="6" width="288" height="150" rx="12" fill="url(#hh1-nd-wall)"/>
      <path d="M6 156 h288 v58 h-288 z" fill="url(#hh1-nd-table)"/>
      <g class="hh1-nd-frameg" role="button" tabindex="0" aria-label="벽의 낡은 액자 — 탭해서 확대">
        <rect x="96" y="22" width="108" height="76" rx="6" fill="url(#hh1-nd-frame)" stroke="#5E4626" stroke-width="2.2"/>
        <rect x="106" y="32" width="88" height="56" rx="3" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.4"/>
        <path d="M114 46 h72 M114 58 h72 M114 70 h48" stroke="#B99B66" stroke-width="3" stroke-linecap="round" opacity=".8"/>
        <ellipse cx="116" cy="38" rx="8" ry="2.4" fill="#fff" opacity=".5"/>
      </g>
      <g class="hh1-nd-zoomf">
        <rect x="34" y="14" width="232" height="118" rx="10" fill="url(#hh1-nd-frame)" stroke="#5E4626" stroke-width="2.6"/>
        <rect x="48" y="27" width="204" height="92" rx="5" fill="#FBF3DC" stroke="#8A6A3E" stroke-width="1.6"/>
        <text x="150" y="56" text-anchor="middle" font-size="14.5" font-weight="900" fill="#4A3410" font-family="Pretendard, sans-serif">1953년, 피란살이 부엌에서</text>
        <text x="150" y="80" text-anchor="middle" font-size="12" font-weight="800" fill="#7A5A2E" font-family="Pretendard, sans-serif">고향의 국수를 그리며 만들었습니다</text>
        <text x="150" y="103" text-anchor="middle" font-size="10.5" font-weight="800" fill="#9A7A46" font-family="Pretendard, sans-serif">— 삼 대째 잇는 밀면 —</text>
      </g>
      <g class="hh1-nd-bowlg">
        <ellipse cx="150" cy="196" rx="58" ry="8" fill="#4A2A08" opacity=".3"/>
        <path d="M96 168 q54 -14 108 0 q-6 30 -54 30 t-54 -30 z" fill="url(#hh1-nd-bowl)" stroke="#8A96A6" stroke-width="2"/>
        <path d="M110 166 q40 -9 80 0" stroke="#D8E2EC" stroke-width="2" opacity=".8"/>
        <path d="M118 164 q16 -8 30 -2 q14 -8 26 0 q-12 6 -26 3 q-16 5 -30 -1 z" fill="#F0E6C8" stroke="#C8B48A" stroke-width="1.4"/>
        <circle cx="150" cy="158" r="7" fill="#FDF4E0" stroke="#C8B48A" stroke-width="1.4"/>
        <path class="hh1-nd-steam s1" d="M128 146 q4 -8 0 -14 q-4 -6 0 -12" stroke="#B9C6D4" stroke-width="2.6" stroke-linecap="round"/>
        <path class="hh1-nd-steam s2" d="M150 142 q4 -8 0 -14 q-4 -6 0 -12" stroke="#B9C6D4" stroke-width="2.6" stroke-linecap="round"/>
        <path class="hh1-nd-steam s3" d="M172 146 q4 -8 0 -14 q-4 -6 0 -12" stroke="#B9C6D4" stroke-width="2.6" stroke-linecap="round"/>
      </g>
      <g stroke="#3C4654" stroke-width="2.4" fill="none">
        <circle cx="44" cy="130" r="9" fill="#FFE8CE"/>
        <path d="M44 139 v22 M44 146 l-10 7 M44 146 l11 5 M44 161 l-8 13 M44 161 l8 13"/>
        <path d="M55 151 q10 4 18 10" stroke="#8A6534" stroke-width="2.2"/>
      </g>
    </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "부산의 오래된 <b>밀면집</b>이에요. 벽에 낡은 액자가 걸려 있네요 — <b>탭해서</b> 읽어 봐요!";

  let zoomed = false;
  let timer = 0;
  const frameg = fig.querySelector(".hh1-nd-frameg") as SVGGElement;
  const zoom = (): void => {
    if (zoomed) return;
    zoomed = true;
    haptic(HAPTIC.select);
    fig.classList.add("zoom");
    face("curious");
    helper.innerHTML = "「1953년, 피란살이 부엌에서 고향의 국수를 그리며」… 전쟁 중에 <b>새 국수</b>가 태어났다니, 왜일까요?";
    timer = window.setTimeout(() => {
      ask(choicesBox, helper, {
        choices: s.choices ?? [
          "피란민이 고향의 냉면을 구할 수 있는 재료로 다시 만들어서",
          "부산 사람들이 원래 밀가루 음식을 좋아해서",
          "외국 요리사가 새로 개발한 요리라서",
        ],
        good: "맞아요! 6·25 전쟁 때 부산으로 피란 온 사람들이 고향의 냉면을 그리워했지만 재료(메밀)를 구하기 어려웠고, 구호물자로 흔했던 <b>밀가루</b>로 면을 뽑아 밀면이 태어났어요. 음식 한 그릇에도 역사가 담겨 있죠 — 이런 궁금증을 푸는 방법이 바로 <b>역사 탐구</b>예요!",
        bad: "취향이나 우연이 아니라 <b>역사가 배경</b>이에요 — 6·25 전쟁 때 부산으로 피란 온 사람들이 냉면 재료(메밀)를 구하기 어려워, 구호물자로 흔했던 밀가루로 고향의 맛을 다시 만든 게 밀면의 시작이랍니다. 이런 궁금증을 푸는 방법이 <b>역사 탐구</b>예요!",
        onDone: finish,
      });
    }, 1000);
  };
  frameg.addEventListener("click", zoom);
  frameg.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      zoom();
    }
  });
  return () => window.clearTimeout(timer);
}
