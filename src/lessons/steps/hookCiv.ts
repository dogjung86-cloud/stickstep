// hookCiv — I 단원(과학과 인류의 지속가능한 삶) 훅 장면들(hook.ts가 위임).
//   "colorcups"  L2 · 검/파/흰 컵 3개를 햇빛에 — 어느 컵 물이 가장 뜨거워질까? 예측 → 온도계 레이스
//   "speaker"    L4 · 스마트 스피커에 말 걸기 — 어떻게 알아들었을까? 예측(인공지능)
//   "smokestack" L5 · 공장 연기를 뿜을수록 지구 온도계가 오른다 — 온실 기체 예측
// 파운드리 재질 문법(근-동조 그라데이션·키라이트·접촉 그림자·최암색 외곽선)을 따르고,
// 스틱맨 캐릭터만 손그림 라인을 유지한다.

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";

interface HookStepLike {
  choices?: string[];
}

function askChoices(
  box: HTMLElement,
  opts: string[],
  helper: HTMLElement,
  doneMsg: string,
  finish: () => void,
): void {
  opts.forEach((label) => {
    const b = el("button", { class: "hook-choice", attrs: { "aria-pressed": "false" }, text: label });
    b.addEventListener("click", () => {
      if (box.classList.contains("locked")) return;
      box.classList.add("locked");
      haptic(HAPTIC.select);
      box.querySelectorAll(".hook-choice").forEach((x) => {
        x.classList.add(x === b ? "sel" : "dim");
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
        (x as HTMLButtonElement).disabled = x !== b;
      });
      helper.innerHTML = doneMsg;
      finish();
    });
    box.appendChild(b);
  });
  box.classList.add("show");
}

// ── L2: 색깔 컵 온도 레이스 ──────────────────────────────────
export function renderColorCups(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const fig = el("div", { class: "hk-civ-day" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="ccSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#AFD8FF"/><stop offset="1" stop-color="#E8F4FF"/>
      </linearGradient>
      <radialGradient id="ccSun" cx=".42" cy=".38" r=".68">
        <stop offset="0" stop-color="#FFF6D8"/><stop offset=".5" stop-color="#FFD25E"/><stop offset="1" stop-color="#F5A028"/>
      </radialGradient>
      <linearGradient id="ccTable" x1="0" y1="128" x2="0" y2="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#E8D5B8"/><stop offset="1" stop-color="#C7AC84"/>
      </linearGradient>
      <linearGradient id="ccB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A6470"/><stop offset=".45" stop-color="#333B46"/><stop offset="1" stop-color="#22282F"/></linearGradient>
      <linearGradient id="ccU" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FB2F0"/><stop offset=".45" stop-color="#3D7BDC"/><stop offset="1" stop-color="#2A5CB8"/></linearGradient>
      <linearGradient id="ccW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#EEF2F7"/><stop offset="1" stop-color="#CBD5E2"/></linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#ccSky)"/>
    <g>
      <circle cx="42" cy="38" r="24" fill="url(#ccSun)" opacity=".45"/>
      <circle cx="42" cy="38" r="13" fill="url(#ccSun)"/>
      <path d="M64 44l18 12M68 34l22 6M60 54l16 16" stroke="#FFC24E" stroke-width="2.2" opacity=".8"/>
    </g>
    <path d="M4 142h232v8a16 16 0 0 1-16 16H20a16 16 0 0 1-16-16z" fill="url(#ccTable)"/>
    <path d="M4 142h232" stroke="#A98D62" stroke-width="1.4" opacity=".7"/>
    ${[
      { x: 74, grad: "ccB", edge: "#171B21" },
      { x: 130, grad: "ccU", edge: "#1D4188" },
      { x: 186, grad: "ccW", edge: "#9DAABD" },
    ]
      .map(
        (c, i) => `
      <ellipse cx="${c.x}" cy="142" rx="21" ry="3.4" fill="#2A3A5E" opacity=".12"/>
      <path d="M${c.x - 18} 100h36l-4 42h-28z" fill="url(#${c.grad})"/>
      <path d="M${c.x - 18} 100h36l-4 42h-28z" stroke="${c.edge}" stroke-width="1.5"/>
      <ellipse cx="${c.x}" cy="100" rx="18" ry="4.6" fill="#8FC6F4"/>
      <ellipse cx="${c.x}" cy="100" rx="18" ry="4.6" stroke="${c.edge}" stroke-width="1.2" fill="none"/>
      <path d="M${c.x - 12} 106q3 6 1 12" stroke="#fff" stroke-width="2" opacity=".45"/>
      <!-- 온도계 -->
      <g class="cc-thermo cc-t${i}">
        <rect x="${c.x - 3}" y="52" width="6" height="40" rx="3" fill="#FFF" stroke="#9DAABD" stroke-width="1.2"/>
        <rect class="cc-merc" x="${c.x - 1.4}" y="86" width="2.8" height="4" rx="1.4" fill="#F04452"/>
        <circle cx="${c.x}" cy="92" r="4.6" fill="#F04452" stroke="#C22B3C" stroke-width="1.2"/>
      </g>`,
      )
      .join("")}
  </svg>`;
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), choicesBox);
  helper.innerHTML = "검은 종이·파란 종이·흰 종이로 감싼 <b>같은 물</b> 세 컵을 햇빛에 두었어요. 2시간 뒤 <b>어느 컵이 가장 뜨거울까요?</b>";
  face("curious");

  let timer = 0;
  askChoices(
    choicesBox,
    s.choices ?? ["검은색 컵", "파란색 컵", "흰색 컵", "셋 다 같다"],
    helper,
    "온도계가 올라갑니다 — 지켜보세요!",
    () => {
      fig.classList.add("heat");
      haptic(HAPTIC.tap);
      timer = window.setTimeout(() => {
        face("surprised");
        helper.innerHTML = "<b>검은색</b>이 가장 많이 올랐어요! 그런데 '그런 것 같다'로 끝나면 과학이 아니죠 — <b>공정한 실험</b>으로 확인해 봐요.";
        finish();
      }, 1700);
    },
  );
  return () => window.clearTimeout(timer);
}

// ── L4: 스마트 스피커 ────────────────────────────────────────
export function renderSpeaker(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): () => void {
  const fig = el("div", { class: "hk-civ-room" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="spRoom" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#F4EEE4"/><stop offset="1" stop-color="#E4D9C8"/>
      </linearGradient>
      <linearGradient id="spTable" x1="0" y1="120" x2="0" y2="146" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#D9B98C"/><stop offset="1" stop-color="#B08D58"/>
      </linearGradient>
      <linearGradient id="spBody" x1="150" y1="0" x2="196" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#5A6470"/><stop offset=".45" stop-color="#3A424E"/><stop offset="1" stop-color="#262C35"/>
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#spRoom)"/>
    <path d="M4 126h232v24a16 16 0 0 1-16 16H20a16 16 0 0 1-16-16z" fill="url(#spTable)"/>
    <path d="M4 126h232" stroke="#96632F" stroke-width="1.4" opacity=".6"/>
    <!-- 창문 -->
    <rect x="22" y="24" width="58" height="44" rx="6" fill="#BFE0FF" stroke="#B9C4D4" stroke-width="2"/>
    <path d="M51 24v44M22 46h58" stroke="#B9C4D4" stroke-width="2"/>
    <!-- 말풍선(음악 요청) -->
    <g class="sp-say">
      <path d="M52 88q-18 0-18-14t18-14h30q18 0 18 14t-16 14l2 10z" fill="#fff" stroke="#C9D2DC" stroke-width="1.6"/>
      <path d="M58 80q-4-8 3-11M69 81q-3-9 4-12t9 3" stroke="#3182F6" stroke-width="2.6" fill="none"/>
      <circle cx="58" cy="81" r="2.8" fill="#3182F6"/><circle cx="70" cy="83" r="2.8" fill="#3182F6"/>
    </g>
    <!-- 스피커 -->
    <ellipse cx="172" cy="126" rx="26" ry="4" fill="#2A3A5E" opacity=".16"/>
    <path d="M152 126v-34a20 20 0 0 1 40 0v34z" fill="url(#spBody)"/>
    <path d="M152 126v-34a20 20 0 0 1 40 0v34z" stroke="#171B21" stroke-width="1.5"/>
    <path d="M158 96q4-14 14-16" stroke="#7C8794" stroke-width="1.6" opacity=".6"/>
    <g class="sp-dots" fill="#4ADEC2">
      <circle cx="164" cy="86" r="2.4"/><circle cx="172" cy="84" r="2.4"/><circle cx="180" cy="86" r="2.4"/>
    </g>
    <!-- 응답 음표/링 -->
    <g class="sp-notes" stroke="#12B8A6" stroke-width="2.4">
      <path d="M204 76q8-4 8-12M210 92q10-6 10-16" fill="none"/>
      <circle cx="204" cy="77" r="3" fill="#12B8A6"/><circle cx="210" cy="93" r="3" fill="#12B8A6"/>
    </g>
    <g class="sp-ring" stroke="#4ADEC2" fill="none">
      <path d="M146 82a30 30 0 0 1 0 20M140 76a40 40 0 0 1 0 32" stroke-width="2" opacity=".7"/>
    </g>
    <!-- 스틱맨(손그림) -->
    <ellipse cx="52" cy="150" rx="16" ry="2.8" fill="#2A3A5E" opacity=".12"/>
    <g stroke="#3C4654" stroke-width="2.4">
      <circle cx="52" cy="106" r="7.5" fill="#fff"/>
      <path d="M52 114v14M52 119l-9 3M52 119l11-5M52 128l-6 12M52 128l7 12"/>
    </g>
  </svg>`;
  const talkBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "“신나는 음악 틀어 줘!” 말 걸기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), talkBtn, choicesBox);
  helper.innerHTML = "책상 위의 <b>스마트 스피커</b>예요. 버튼을 눌러 말을 걸어 보세요!";

  let asked = false;
  let timer = 0;
  talkBtn.addEventListener("click", () => {
    if (asked) return;
    asked = true;
    fig.classList.add("talk");
    talkBtn.classList.remove("pulse");
    talkBtn.classList.add("done-static");
    (talkBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    timer = window.setTimeout(() => {
      fig.classList.add("reply");
      face("surprised");
      helper.innerHTML = "스피커가 알아듣고 <b>음악을 골라 틀었어요!</b> 사람도 아닌데, 어떻게 말을 알아들었을까요?";
      window.setTimeout(() => {
        face("curious");
        askChoices(
          choicesBox,
          s.choices ?? ["스피커 안에서 사람이 듣고 있다", "컴퓨터가 말을 학습해서 알아듣는다", "아무 음악이나 무작위로 튼 것이다"],
          helper,
          "예측 완료! 이런 <b>첨단 과학기술</b>들을 카드로 하나씩 뒤집어 봐요.",
          finish,
        );
      }, 900);
    }, 800);
  });
  return () => window.clearTimeout(timer);
}

// ── L5: 공장 연기와 지구 온도계 ──────────────────────────────
export function renderSmokestack(
  scene: HTMLElement,
  helper: HTMLElement,
  s: HookStepLike,
  finish: () => void,
  face: (k: AvatarKind) => void,
): void {
  const fig = el("div", { class: "hk-civ-earth smoke0" });
  fig.innerHTML = `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <linearGradient id="ssSky" x1="0" y1="0" x2="0" y2="170" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0E1830"/><stop offset="1" stop-color="#23345C"/>
      </linearGradient>
      <radialGradient id="ssEa" cx=".38" cy=".32" r=".8">
        <stop offset="0" stop-color="#7FB2F0"/><stop offset=".6" stop-color="#2E6FD4"/><stop offset="1" stop-color="#1B4B9E"/>
      </radialGradient>
      <linearGradient id="ssFac" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A97AC"/><stop offset="1" stop-color="#5F6C82"/></linearGradient>
    </defs>
    <rect x="4" y="4" width="232" height="162" rx="16" fill="url(#ssSky)"/>
    <circle cx="30" cy="24" r="1.3" fill="#DCE8FF"/><circle cx="214" cy="30" r="1.3" fill="#DCE8FF"/><circle cx="196" cy="132" r="1.1" fill="#DCE8FF"/>
    <!-- 지구 -->
    <circle cx="96" cy="88" r="46" fill="url(#ssEa)"/>
    <path d="M66 74q10-10 22-6t16 12q-14 6-24 2t-14-8zM96 116q12-6 24-2-8 10-24 2z" fill="#7CA65A" opacity=".9"/>
    <circle cx="96" cy="88" r="46" stroke="#1B3A78" stroke-width="1.5"/>
    <ellipse cx="80" cy="66" rx="14" ry="9" fill="#fff" opacity=".25"/>
    <!-- 온실 기체 담요(누적) -->
    <circle class="ss-blanket ss-b0" cx="96" cy="88" r="52" stroke="#8E9BAF" stroke-width="4" opacity="0"/>
    <circle class="ss-blanket ss-b1" cx="96" cy="88" r="58" stroke="#7C8AA0" stroke-width="5" opacity="0"/>
    <circle class="ss-blanket ss-b2" cx="96" cy="88" r="65" stroke="#6A7890" stroke-width="6" opacity="0"/>
    <!-- 공장 -->
    <path d="M158 132h62v18h-62z" fill="url(#ssFac)"/>
    <path d="M158 132l20-12v12l20-12v12l22-12v30h-62z" fill="url(#ssFac)"/>
    <path d="M158 132l20-12v12l20-12v12l22-12" stroke="#41506C" stroke-width="1.4"/>
    <rect x="168" y="104" width="9" height="30" fill="url(#ssFac)" stroke="#41506C" stroke-width="1.2"/>
    <rect x="196" y="98" width="9" height="36" fill="url(#ssFac)" stroke="#41506C" stroke-width="1.2"/>
    <!-- 연기 -->
    <g class="ss-smoke" fill="#9AA6B8">
      <circle class="s1" cx="172" cy="96" r="7"/>
      <circle class="s2" cx="178" cy="84" r="9"/>
      <circle class="s3" cx="200" cy="90" r="8"/>
      <circle class="s4" cx="208" cy="76" r="10"/>
      <circle class="s5" cx="188" cy="66" r="12"/>
    </g>
    <!-- 지구 온도계 -->
    <g>
      <rect x="30" y="26" width="10" height="76" rx="5" fill="#fff" stroke="#8FA0B8" stroke-width="1.4"/>
      <rect class="ss-merc" x="32.6" y="88" width="4.8" height="8" rx="2.4" fill="#F04452"/>
      <circle cx="35" cy="106" r="7" fill="#F04452" stroke="#C22B3C" stroke-width="1.4"/>
      <path d="M42 40h6M42 56h6M42 72h6" stroke="#8FA0B8" stroke-width="1.6"/>
    </g>
  </svg>`;
  const puffBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "공장 연기 뿜기 (0/3)" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(el("div", { class: "hk-space-wrap" }, fig), puffBtn, choicesBox);
  helper.innerHTML = "지구 옆에 공장이 들어섰어요. 버튼을 눌러 <b>연기(온실 기체)</b>를 뿜어 보고, 온도계를 지켜보세요.";

  let puffs = 0;
  puffBtn.addEventListener("click", () => {
    if (puffs >= 3) return;
    puffs += 1;
    fig.classList.remove(`smoke${puffs - 1}`);
    fig.classList.add(`smoke${puffs}`);
    puffBtn.querySelector("span")!.textContent = `공장 연기 뿜기 (${puffs}/3)`;
    haptic(HAPTIC.tap);
    if (puffs === 1) helper.innerHTML = "연기 속 <b>온실 기체</b>가 지구를 얇게 감쌌어요. 온도계가 조금 올랐죠?";
    if (puffs === 2) {
      face("surprised");
      helper.innerHTML = "담요가 <b>두 겹</b>이 됐어요 — 지구가 내보내려던 열이 빠져나가지 못해요!";
    }
    if (puffs === 3) {
      puffBtn.classList.remove("pulse");
      puffBtn.classList.add("done-static");
      (puffBtn as HTMLButtonElement).disabled = true;
      face("curious");
      helper.innerHTML = "온도계가 쭉 올랐어요. 이대로 계속 뿜으면 <b>지구는 어떻게 될까요?</b>";
      askChoices(
        choicesBox,
        s.choices ?? ["기후가 변하고 빙하가 녹는다", "지구가 알아서 식혀 준다", "아무 일도 일어나지 않는다"],
        helper,
        "예측 완료! 그래서 필요한 게 <b>지속가능한 삶</b> — 무엇을 할 수 있는지 직접 분류해 봐요.",
        finish,
      );
    }
  });
}
