// hookForce — V 단원(힘의 작용) 훅 장면 6종. hook.ts의 디스패처가 불러 쓴다.
// 프리미엄 SVG 문법(그라데이션+키라이트+접촉 그림자, 캐릭터는 손그림 라인) 준수.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

/** 공용: 예측 선택지(채점 없음) — hook.ts의 askChoices와 동일 규약 */
function ask(box: HTMLElement, opts: string[], helper: HTMLElement, doneMsg: string, finish: () => void): void {
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

// ── L1: 풍선 줄 당기기(관찰) ─────────────────────────────────
function balloonSvg(): string {
  return `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <radialGradient id="hf-bal" cx=".36" cy=".3" r=".85">
        <stop offset="0" stop-color="#FF9A93"/><stop offset=".55" stop-color="#F0564C"/><stop offset="1" stop-color="#C43A32"/>
      </radialGradient>
    </defs>
    <ellipse cx="120" cy="168" rx="34" ry="5" fill="#2A3A5E" opacity=".10"/>
    <g class="hf-balloon">
      <ellipse cx="120" cy="52" rx="30" ry="36" fill="url(#hf-bal)"/>
      <ellipse cx="109" cy="38" rx="10" ry="6.5" fill="#FFFFFF" opacity=".45" transform="rotate(-24 109 38)"/>
      <path d="M116 87l4-5 4 5z" fill="#C43A32"/>
      <path class="hf-string" d="M120 88q-3 26 0 52" stroke="#8B95A1" stroke-width="2"/>
    </g>
    <!-- 스틱맨(손그림 라인) — 줄 끝을 잡음 -->
    <g stroke="#3C4654" stroke-width="2.6">
      <circle cx="120" cy="118" r="9" fill="#fff"/>
      <path d="M120 127v22M120 133l-11 5M120 133l9-9M120 149l-8 14M120 149l8 14"/>
    </g>
  </svg>`;
}

export function renderBalloon(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const wrap = el("div", { class: "hf-balloon-wrap", attrs: { role: "img", "aria-label": "헬륨 풍선을 잡은 스틱맨" } });
  wrap.innerHTML = balloonSvg();
  scene.appendChild(wrap);
  helper.innerHTML = "풍선을 잡고 <b>아래로 끌었다 놓아</b> 보세요.";

  let rounds = 0;
  let dragging = false;
  let startY = 0;
  let pull = 0;
  const g = wrap.querySelector(".hf-balloon") as SVGGElement;

  const apply = (): void => {
    g.style.transform = `translateY(${pull}px)`;
  };
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    startY = e.clientY - pull;
    wrap.setPointerCapture(e.pointerId);
    g.style.transition = "none";
    haptic(HAPTIC.tap);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    pull = clamp(e.clientY - startY, 0, 64);
    apply();
  });
  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    if (pull > 30) {
      rounds++;
      face(rounds >= 2 ? "curious" : "surprised");
      if (rounds === 1) helper.innerHTML = "쑥 내려왔다가 <b>다시 위로</b>! 한 번 더 해 보세요.";
      if (rounds === 2) {
        helper.innerHTML = "당길 때 <b>내려오고</b>, 놓으면 <b>올라가요</b> — 풍선의 움직임이 계속 변하고 있어요.";
        finish();
      }
    }
    pull = 0;
    g.style.transition = "transform .55s var(--spring)";
    apply();
    haptic(HAPTIC.select);
  };
  wrap.addEventListener("pointerup", release);
  wrap.addEventListener("pointercancel", release);
  return () => undefined;
}

// ── L2: 멈춘 줄다리기(관찰+예측) ─────────────────────────────
function tugSvg(): string {
  const man = (x: number, flip: boolean): string => {
    const d = flip ? -1 : 1;
    return `<g stroke="#3C4654" stroke-width="2.6" class="hf-tugman">
      <circle cx="${x}" cy="96" r="8" fill="#fff"/>
      <path d="M${x} 104 l${-6 * d} 16 M${x - 6 * d} 120 l${13 * d} -4 M${x} 104 l${-2 * d} 18 M${x - 2 * d} 122 l${10 * d} 12 M${x - 2 * d} 122 l${-10 * d} 10"/>
    </g>`;
  };
  return `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-rope" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E2BE8A"/><stop offset="1" stop-color="#B98A50"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="140" rx="86" ry="6" fill="#2A3A5E" opacity=".08"/>
    <path d="M120 96v42" stroke="#C4CAD2" stroke-width="1.6" stroke-dasharray="4 5"/>
    <rect class="hf-rope" x="52" y="112" width="136" height="5" rx="2.5" fill="url(#hf-rope)"/>
    <path class="hf-ribbon" d="M120 118l-5 12h10z" fill="#F25757"/>
    ${man(44, false)}${man(196, true)}
    <g class="hf-strain" stroke="#F0A422" stroke-width="2" opacity="0">
      <path d="M60 92l-4-6M64 90l-2-7M180 92l4-6M176 90l2-7"/>
    </g>
  </svg>`;
}

export function renderTugRope(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hf-tug", attrs: { role: "img", "aria-label": "팽팽하게 멈춘 줄다리기" } });
  fig.innerHTML = tugSvg();
  const pullBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "양쪽 다 힘껏 당겨라!" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, pullBtn, choicesBox);
  helper.innerHTML = "양 팀이 줄을 잡았어요. 버튼을 눌러 <b>힘껏 당기게</b> 해 보세요.";

  let timer = 0;
  let done = false;
  pullBtn.addEventListener("click", () => {
    if (done) return;
    done = true;
    pullBtn.classList.remove("pulse");
    (pullBtn as HTMLButtonElement).disabled = true;
    fig.classList.add("straining");
    haptic(HAPTIC.wrong);
    face("surprised");
    helper.innerHTML = "양쪽 다 <b>있는 힘껏</b> 당기는 중… 그런데 줄이 <b>꿈쩍도 안 해요!</b>";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["두 힘이 똑같아서 합쳐서 0이 됐다", "줄이 무거워서 못 움직인다", "둘 다 사실 힘을 안 주고 있다"],
        helper,
        "예측 완료! 실험실에서 <b>직접 줄다리기</b>를 시켜 보며 확인해요.",
        finish,
      );
    }, 1100);
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 볼펜 딸깍(용수철) ────────────────────────────────────
function penSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-penbody" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#5B9DF5"/><stop offset=".5" stop-color="#3182F6"/><stop offset="1" stop-color="#2266CC"/>
      </linearGradient>
      <linearGradient id="hf-pentube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#F4F8FE"/><stop offset="1" stop-color="#D2DEEE"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="150" rx="80" ry="6" fill="#2A3A5E" opacity=".08"/>
    <!-- 볼펜 몸통(투명 단면) -->
    <rect x="40" y="66" width="150" height="34" rx="12" fill="url(#hf-pentube)" stroke="#9DAABD" stroke-width="1.8"/>
    <rect x="40" y="69" width="150" height="6" rx="3" fill="#FFFFFF" opacity=".6"/>
    <!-- 용수철(심 뒤) — CSS로 압축 -->
    <g class="hf-pen-spring" stroke="#8CA0BC" stroke-width="2.6">
      <path d="M138 83 l6 -9 l6 9 l6 -9 l6 9 l6 -9 l6 9" fill="none"/>
    </g>
    <!-- 심 + 촉 -->
    <g class="hf-pen-ink">
      <rect x="58" y="78" width="82" height="10" rx="5" fill="url(#hf-penbody)"/>
      <path class="hf-pen-tip" d="M58 83l-16 0" stroke="#1D5DBF" stroke-width="6"/>
      <path d="M42 83l-7 0" stroke="#123F86" stroke-width="3.4"/>
    </g>
    <!-- 누름 버튼 -->
    <g class="hf-pen-btn">
      <rect x="190" y="74" width="26" height="18" rx="6" fill="url(#hf-penbody)"/>
      <rect x="190" y="76" width="26" height="4" rx="2" fill="#9CC4FA" opacity=".8"/>
    </g>
  </svg>`;
}

export function renderPen(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("button", { class: "hf-pen in", attrs: { type: "button", "aria-label": "볼펜 딸깍 누르기" } });
  fig.innerHTML = penSvg();
  scene.appendChild(fig);
  helper.innerHTML = "볼펜을 <b>딸깍</b> 눌러 보세요. 몸통 속이 훤히 보여요!";

  let clicks = 0;
  fig.addEventListener("click", () => {
    clicks++;
    const out = clicks % 2 === 1;
    fig.classList.toggle("out", out);
    fig.classList.toggle("in", !out);
    haptic(HAPTIC.select);
    if (clicks === 1) {
      face("surprised");
      helper.innerHTML = "딸깍! 심이 나오면서 안쪽 <b>용수철이 꾹 눌렸어요</b>. 한 번 더 딸깍!";
    } else if (clicks >= 2) {
      face("curious");
      helper.innerHTML = "눌렸던 용수철이 <b>제 모양으로 돌아가면서</b> 심을 도로 데려갔어요. 이 힘의 정체를 실험실에서 파헤쳐 봐요.";
      finish();
    }
  });
  return () => undefined;
}

// ── L5: 겹친 책 당기기(안 빠짐) ──────────────────────────────
function booksSvg(): string {
  return `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-bookA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#5B9DF5"/><stop offset="1" stop-color="#2E6FD6"/>
      </linearGradient>
      <linearGradient id="hf-bookB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFC24D"/><stop offset="1" stop-color="#E8961E"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="120" rx="88" ry="7" fill="#2A3A5E" opacity=".10"/>
    <!-- 서로 겹쳐 물린 책 두 권 — 가운데에서 책장이 한 장씩 엇갈림 -->
    <g class="hf-bookL">
      <rect x="24" y="72" width="86" height="28" rx="5" fill="url(#hf-bookA)"/>
      <rect x="24" y="74.5" width="86" height="4" rx="2" fill="#BFDCFF" opacity=".8"/>
      <rect x="104" y="76" width="34" height="4.6" rx="2.3" fill="#EAF2FF" stroke="#9CC4FA" stroke-width="1"/>
      <rect x="104" y="85.4" width="34" height="4.6" rx="2.3" fill="#EAF2FF" stroke="#9CC4FA" stroke-width="1"/>
      <rect x="104" y="94.8" width="30" height="4.6" rx="2.3" fill="#EAF2FF" stroke="#9CC4FA" stroke-width="1"/>
    </g>
    <g class="hf-bookR">
      <rect x="130" y="72" width="86" height="28" rx="5" fill="url(#hf-bookB)"/>
      <rect x="130" y="74.5" width="86" height="4" rx="2" fill="#FFE6B8" opacity=".85"/>
      <rect x="102" y="80.7" width="34" height="4.6" rx="2.3" fill="#FFF3DC" stroke="#F2C879" stroke-width="1"/>
      <rect x="102" y="90.1" width="34" height="4.6" rx="2.3" fill="#FFF3DC" stroke="#F2C879" stroke-width="1"/>
    </g>
    <g class="hf-strain2" stroke="#F0A422" stroke-width="2" opacity="0">
      <path d="M30 66l-5-6M38 64l-3-7M210 66l5-6M202 64l3-7"/>
    </g>
  </svg>`;
}

export function renderBooks(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("button", { class: "hf-books", attrs: { type: "button", "aria-label": "겹친 책 양쪽으로 당기기" } });
  fig.innerHTML = booksSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "책장을 서로 겹친 두 책이에요. <b>눌러서 양쪽으로 당겨</b> 보세요.";

  let tries = 0;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (tries >= 2) return;
    tries++;
    fig.classList.remove("tugging");
    void fig.offsetWidth; // 애니메이션 재시작
    fig.classList.add("tugging");
    haptic(HAPTIC.wrong);
    if (tries === 1) {
      face("surprised");
      helper.innerHTML = "안 빠져요! 풀로 붙인 것도 아닌데… <b>한 번 더</b> 세게!";
    } else {
      face("curious");
      helper.innerHTML = "그래도 안 빠져요! 도대체 <b>무엇이 책장을 붙잡고</b> 있을까요?";
      timer = window.setTimeout(() => {
        ask(
          choicesBox,
          s.choices ?? ["겹친 책장 사이사이에서 미끄럼을 방해하는 힘이 있다", "책이 서로 자석처럼 끌어당긴다", "공기가 책을 눌러서 못 빠진다"],
          helper,
          "예측 완료! 실험실에서 <b>바닥과 무게를 바꿔 가며</b> 이 힘을 시험해 봐요.",
          finish,
        );
      }, 700);
    }
  });
  return () => window.clearTimeout(timer);
}

// ── L6: 빈 페트병 밀어 넣기(부력 체감) ───────────────────────
function bottleSvg(): string {
  return `<svg viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#BFE0FF"/><stop offset="1" stop-color="#8FC0F2"/>
      </linearGradient>
      <linearGradient id="hf-bottle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#EAF6FF" stop-opacity=".9"/><stop offset=".5" stop-color="#D2E9FB" stop-opacity=".65"/><stop offset="1" stop-color="#B4D4EE" stop-opacity=".9"/>
      </linearGradient>
    </defs>
    <ellipse cx="120" cy="182" rx="84" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 수조 -->
    <path d="M44 92v78a6 6 0 0 0 6 6h140a6 6 0 0 0 6-6V92" stroke="#9DAABD" stroke-width="3" fill="rgba(210,230,250,.14)"/>
    <path d="M48 104h144v66a4 4 0 0 1-4 4H52a4 4 0 0 1-4-4z" fill="url(#hf-water)" opacity=".75"/>
    <path class="hf-wave" d="M48 104q18-6 36 0t36 0 36 0 36 0" stroke="#E8F4FF" stroke-width="2.4"/>
    <!-- 빈 페트병(CSS로 잠김) -->
    <g class="hf-bottle-g">
      <rect x="102" y="34" width="36" height="62" rx="12" fill="url(#hf-bottle)" stroke="#8FB3D6" stroke-width="2"/>
      <rect x="112" y="22" width="16" height="14" rx="4" fill="#5B9DF5"/>
      <rect x="106" y="46" width="7" height="40" rx="3.5" fill="#FFFFFF" opacity=".55"/>
    </g>
    <g class="hf-push-arrows" stroke="#F25757" stroke-width="3" opacity="0">
      <path d="M96 120v-14M96 106l-5 6M96 106l5 6"/>
      <path d="M144 120v-14M144 106l-5 6M144 106l5 6"/>
    </g>
  </svg>`;
}

export function renderBottle(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hf-bottle", attrs: { role: "img", "aria-label": "빈 페트병을 물에 밀어 넣기" } });
  fig.innerHTML = bottleSvg();
  scene.appendChild(fig);
  helper.innerHTML = "빈 페트병을 <b>꾹 눌러</b> 물속에 밀어 넣어 보세요. (누르고 있기!)";

  let rounds = 0;
  let holding = false;
  const done = (): void => {
    face("curious");
    helper.innerHTML = "손을 떼면 <b>퐁!</b> 하고 튀어 올라요. 물이 병을 <b>위로 밀어 올리는</b> 이 힘… 실험실에서 크기를 재 봐요.";
    finish();
  };
  fig.addEventListener("pointerdown", (e) => {
    holding = true;
    fig.classList.add("dunked");
    (fig as HTMLElement).setPointerCapture?.(e.pointerId);
    haptic(HAPTIC.tap);
    if (rounds === 0) {
      face("surprised");
      helper.innerHTML = "손끝에 <b>밀어 올리는 힘</b>이 느껴져요! 이제 손을 떼 보세요.";
    }
  });
  const up = (): void => {
    if (!holding) return;
    holding = false;
    fig.classList.remove("dunked");
    haptic(HAPTIC.select);
    rounds++;
    if (rounds === 1) helper.innerHTML = "퐁! 다시 떠올랐어요. <b>한 번 더</b> 눌러 봐요.";
    if (rounds >= 2) done();
  };
  fig.addEventListener("pointerup", up);
  fig.addEventListener("pointercancel", up);
  return () => undefined;
}

// ── L7: 굴러가다 멈추는 공(관찰+예측) ────────────────────────
function rollSvg(): string {
  return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <radialGradient id="hf-ball" cx=".35" cy=".3" r=".9">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#E4EDF8"/><stop offset="1" stop-color="#9AB2CE"/>
      </radialGradient>
      <linearGradient id="hf-grass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8CCB9E"/><stop offset="1" stop-color="#5DA874"/>
      </linearGradient>
    </defs>
    <rect x="10" y="112" width="220" height="14" rx="7" fill="url(#hf-grass)"/>
    <path d="M22 112l3-7M40 112l3-8M62 112l2-7M86 112l3-8M112 112l2-7M138 112l3-8M164 112l2-7M190 112l3-8M212 112l2-7" stroke="#4C9464" stroke-width="2"/>
    <g class="hf-roll">
      <ellipse class="hf-roll-sh" cx="0" cy="122" rx="18" ry="3.5" fill="#2A3A5E" opacity=".16"/>
      <g class="hf-roll-spin">
        <circle cx="0" cy="98" r="14" fill="url(#hf-ball)" stroke="#6E86A6" stroke-width="1.8"/>
        <circle cx="0" cy="98" r="4.6" fill="rgba(52,74,106,.75)"/>
      </g>
    </g>
    <!-- 발로 찬 스틱맨 -->
    <g stroke="#3C4654" stroke-width="2.6">
      <circle cx="26" cy="58" r="8" fill="#fff"/>
      <path d="M26 66v20M26 72l-9 7M26 72l10 3M26 86l-7 14M26 86l12 8"/>
    </g>
  </svg>`;
}

export function renderRollStop(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("button", { class: "hf-rollwrap", attrs: { type: "button", "aria-label": "공 차기" } });
  fig.innerHTML = rollSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "스틱맨이 공을 찼어요. <b>눌러서</b> 공을 굴려 보세요.";

  let played = false;
  let timer = 0;
  fig.addEventListener("click", () => {
    if (played) return;
    played = true;
    fig.classList.add("rolling");
    (fig as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("surprised");
    helper.innerHTML = "굴러간다… 굴러간다… 어라, <b>점점 느려지더니 멈췄어요!</b> 아무도 안 건드렸는데요.";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["잔디와 공 사이의 힘이 운동을 방해했다", "공이 힘을 다 써 버렸다", "지구가 공을 뒤로 당겼다"],
        helper,
        "예측 완료! 실험실에서 <b>바람으로 힘을 줘 가며</b> 힘과 운동의 관계를 확인해요.",
        finish,
      );
    }, 2400);
  });
  return () => window.clearTimeout(timer);
}
