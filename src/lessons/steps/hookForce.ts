// hookForce — V 단원(힘의 작용) 훅 장면 6종. hook.ts의 디스패처가 불러 쓴다.
// 프리미엄 SVG 문법(그라데이션+키라이트+접촉 그림자, 캐릭터는 손그림 라인) 준수.

import { el, clamp } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { ask } from "./hookAsk";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

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
      ask(choicesBox, helper, {
        choices: s.choices ?? ["두 힘이 똑같아서 합쳐서 0이 됐다", "줄이 무거워서 못 움직인다", "둘 다 사실 힘을 안 주고 있다"],
        good: "정확해요! <b>두 힘의 크기가 같고 방향이 반대</b>라 합이 0 — 그래서 안 움직여요. 실험실에서 직접 확인!",
        bad: "줄이 무겁거나 힘을 안 준 게 아니에요 — 양쪽이 <b>똑같은 크기의 힘을 반대로</b> 줘서 <b>합이 0</b>이 된 거예요. 그래서 꿈쩍 안 하죠. 실험실에서 확인해요.",
        onDone: finish,
      });
    }, 1100);
  });
  return () => window.clearTimeout(timer);
}

// ── L4: 활쏘기(탄성력 체감) ──────────────────────────────────
function bowSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-limb" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#D8A868"/><stop offset=".5" stop-color="#B98A50"/><stop offset="1" stop-color="#7E5A2E"/>
      </linearGradient>
      <radialGradient id="hf-target" cx=".42" cy=".38" r=".9">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE6F2"/>
      </radialGradient>
    </defs>
    <ellipse cx="52" cy="152" rx="40" ry="5" fill="#2A3A5E" opacity=".10"/>
    <ellipse cx="196" cy="152" rx="30" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 과녁 -->
    <g class="hf-bow-target">
      <path d="M186 150l10-16 10 16" stroke="#8B95A1" stroke-width="3"/>
      <circle cx="196" cy="96" r="27" fill="url(#hf-target)" stroke="#9DAABD" stroke-width="2"/>
      <circle cx="196" cy="96" r="18" fill="#F0564C" opacity=".9"/>
      <circle cx="196" cy="96" r="9.5" fill="#FFF4F2"/>
      <circle cx="196" cy="96" r="3.4" fill="#C43A32"/>
    </g>
    <!-- 스틱맨(손그림 라인) -->
    <g class="hf-archer" stroke="#3C4654" stroke-width="2.6">
      <circle cx="34" cy="74" r="8.5" fill="#fff"/>
      <path d="M34 83v32M34 90l32 5M34 92l20 8M34 115l-9 26M34 115l11 25"/>
    </g>
    <!-- 활: 림 + 시위 + 화살 (JS가 d를 갱신) -->
    <path class="hf-limbs" d="" stroke="url(#hf-limb)" stroke-width="5"/>
    <path class="hf-limbs-hl" d="" stroke="#F2D9AE" stroke-width="1.4" opacity=".7"/>
    <path class="hf-string" d="" stroke="#E4ECF6" stroke-width="1.7"/>
    <g class="hf-arrow">
      <path d="M56 96h64" stroke="#C9D4E2" stroke-width="3"/>
      <path d="M126 96l-10-4.5v9z" fill="#8FA6C2"/>
      <path d="M56 96l-7-5M56 96l-7 5M63 96l-7-5M63 96l-7 5" stroke="#F0A422" stroke-width="2"/>
    </g>
  </svg>`;
}

export function renderBow(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const wrap = el("div", { class: "hf-bow", attrs: { role: "img", "aria-label": "활시위를 당겨 과녁 맞히기" } });
  wrap.innerHTML = bowSvg();
  scene.appendChild(wrap);
  helper.innerHTML = "활시위를 <b>뒤로 쭉 당겼다가 놓아</b> 보세요.";

  const limbs = wrap.querySelector(".hf-limbs") as SVGPathElement;
  const limbsHl = wrap.querySelector(".hf-limbs-hl") as SVGPathElement;
  const string = wrap.querySelector(".hf-string") as SVGPathElement;
  const arrow = wrap.querySelector(".hf-arrow") as SVGGElement;

  const BX = 70; // 활 그립 x
  let d = 0; // 당김량 0..30
  let dragging = false;
  let startX = 0;
  let flying = false;
  let shots = 0;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number): void => {
    timers.push(window.setTimeout(fn, ms));
  };

  function paint(): void {
    const tipX = BX + 16 - d * 0.16;
    const topY = 44 + d * 0.10;
    const botY = 148 - d * 0.10;
    const bellyX = BX + 30 + d * 0.30;
    limbs.setAttribute("d", `M${tipX} ${topY} Q${bellyX} 96 ${tipX} ${botY}`);
    limbsHl.setAttribute("d", `M${tipX - 1.5} ${topY + 3} Q${bellyX - 3} 96 ${tipX - 1.5} ${botY - 3}`);
    const nockX = BX + 2 - d;
    string.setAttribute("d", `M${tipX} ${topY} L${nockX} 96 L${tipX} ${botY}`);
    if (!flying) arrow.style.transform = `translateX(${-d}px)`;
  }
  paint();

  function relax(from: number): void {
    // rAF 없이 시위 복원(살짝 오버슈트)
    d = from;
    const seq = [from * 0.45, -3.5, 1.6, 0];
    seq.forEach((v, i) =>
      later(() => {
        d = v;
        paint();
      }, 26 * (i + 1)),
    );
  }

  function shoot(): void {
    flying = true;
    haptic(HAPTIC.correct);
    arrow.style.transition = "transform .26s cubic-bezier(.3,.6,.35,1)";
    arrow.style.transform = "translateX(64px)"; // 촉이 과녁에 명중
    shots++;
    if (shots === 1) {
      face("surprised");
      helper.innerHTML = "명중! 손은 <b>뒤로</b> 당겼는데 화살은 <b>앞으로</b> 날아갔어요. 한 발 더!";
    } else {
      face("curious");
      helper.innerHTML = "휘었던 활이 <b>제 모양으로 돌아가면서</b> 시위가 화살을 밀어냈어요. 이 힘의 규칙을 실험실에서 파헤쳐 봐요.";
      finish();
    }
    later(() => {
      // 새 화살 장전
      arrow.style.transition = "none";
      arrow.style.opacity = "0";
      arrow.style.transform = "translateX(0)";
      later(() => {
        arrow.style.transition = "opacity .3s";
        arrow.style.opacity = "1";
        flying = false;
      }, 60);
    }, 900);
  }

  wrap.addEventListener("pointerdown", (e) => {
    if (flying) return;
    const r = wrap.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 240;
    const py = ((e.clientY - r.top) / r.height) * 170;
    if (px > 150 || Math.abs(py - 96) > 58) return;
    dragging = true;
    startX = e.clientX;
    haptic(HAPTIC.tap);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!dragging || flying) return;
    const r = wrap.getBoundingClientRect();
    d = clamp(((startX - e.clientX) / r.width) * 240, 0, 30);
    paint();
  });
  const release = (): void => {
    if (!dragging) return;
    dragging = false;
    if (flying) return;
    if (d >= 15) {
      relax(d);
      shoot();
    } else {
      relax(d);
      if (!shots) helper.innerHTML = "조금 더 <b>세게 당겼다가</b> 놓아 보세요!";
    }
  };
  wrap.addEventListener("pointerup", release);
  wrap.addEventListener("pointercancel", release);
  return () => timers.forEach((t) => window.clearTimeout(t));
}

// ── L5: 빙판 vs 자갈길(미끄러짐 관찰+예측) ───────────────────
function iceslipSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hf-ice" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#E4F2FD"/><stop offset="1" stop-color="#AFD3EF"/>
      </linearGradient>
      <linearGradient id="hf-dirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D4AC72"/><stop offset="1" stop-color="#9A7440"/>
      </linearGradient>
    </defs>
    <!-- 바닥: 빙판 ↔ 자갈길 (컨테이너 클래스로 전환) -->
    <g class="hf-ground-ice">
      <rect x="10" y="128" width="220" height="15" rx="7" fill="url(#hf-ice)" stroke="#8FB9DC" stroke-width="1.4"/>
      <path d="M28 134h26M84 138h30M150 133h24M196 137h18" stroke="#FFFFFF" stroke-width="2" opacity=".65"/>
    </g>
    <g class="hf-ground-dirt" opacity="0">
      <rect x="10" y="128" width="220" height="15" rx="7" fill="url(#hf-dirt)" stroke="#7E5A2E" stroke-width="1.4"/>
      <path d="M26 134l4 0M52 138l4 0M78 133l4 0M104 137l5 0M132 134l4 0M158 138l4 0M186 133l4 0M208 137l4 0" stroke="#6E4E24" stroke-width="2.6"/>
    </g>
    <!-- 스틱맨(발끝 기준, 이동은 .hfw, 넘어짐은 .hfw-body 회전) -->
    <g class="hfw">
      <ellipse class="hfw-sh" cx="0" cy="130" rx="14" ry="3" fill="#2A3A5E" opacity=".14"/>
      <g class="hfw-body" stroke="#3C4654" stroke-width="2.6">
        <circle cx="0" cy="70" r="8.5" fill="#fff"/>
        <path d="M0 79v33"/>
        <path class="hfw-armF" d="M0 88l10 12"/>
        <path class="hfw-armB" d="M0 88l-10 11"/>
        <path class="hfw-legF" d="M0 112l8 16"/>
        <path class="hfw-legB" d="M0 112l-8 16"/>
      </g>
      <g class="hfw-burst" stroke="#F0A422" stroke-width="2.2" opacity="0">
        <path d="M14 118l7-6M18 126l9-2M12 110l4-8"/>
      </g>
    </g>
  </svg>`;
}

export function renderIceslip(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hf-iceslip", attrs: { role: "img", "aria-label": "빙판길과 자갈길 걷기 비교" } });
  fig.innerHTML = iceslipSvg();
  const walkBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "빙판길 걷기" }));
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, walkBtn, choicesBox);
  helper.innerHTML = "어젯밤 내린 비가 꽁꽁 얼었어요. 버튼을 눌러 <b>빙판길을 걸어가게</b> 해 보세요.";

  const man = fig.querySelector(".hfw") as SVGGElement;
  let phase = 0; // 0 대기 → 1 빙판(꽈당) → 2 자갈길(성공)
  let timer = 0;

  const onEnd = (e: AnimationEvent): void => {
    if (e.animationName === "hfwMoveIce") {
      fig.classList.add("slipped");
      haptic(HAPTIC.wrong);
      face("surprised");
      helper.innerHTML = "꽈당! 아이고… 같은 신발, 같은 걸음인데 왜 넘어졌을까요? 이번엔 <b>자갈길</b>로!";
      timer = window.setTimeout(() => {
        walkBtn.querySelector("span")!.textContent = "자갈길 걷기";
        (walkBtn as HTMLButtonElement).disabled = false;
        walkBtn.classList.add("pulse");
      }, 800);
    } else if (e.animationName === "hfwMoveDirt") {
      face("curious");
      helper.innerHTML = "자갈길은 <b>끝까지 안정적으로</b> 걸었어요. 두 길의 차이는 뭘까요?";
      ask(choicesBox, helper, {
        choices: s.choices ?? ["매끄러운 바닥에서는 미끄럼을 막아 주는 힘이 약해진다", "빙판이 차가워서 다리에 힘이 빠진다", "자갈이 신발을 끌어당긴다"],
        good: "좋은 예측! 빙판은 <b>미끄럼을 막아 주는 힘(마찰)이 약해</b> 넘어져요. 실험실에서 바닥을 바꿔 가며 확인!",
        bad: "차가워서나 자갈이 당겨서가 아니에요 — 자갈길은 <b>미끄럼을 막는 힘(마찰)이 크고</b> 빙판은 그 힘이 약해요. 그래서 빙판에서 미끄러지죠. 실험실에서 확인해요.",
        onDone: finish,
      });
    }
  };
  man.addEventListener("animationend", onEnd);

  walkBtn.addEventListener("click", () => {
    if (phase >= 2) return;
    phase++;
    (walkBtn as HTMLButtonElement).disabled = true;
    walkBtn.classList.remove("pulse");
    haptic(HAPTIC.select);
    if (phase === 1) {
      fig.classList.add("walk-ice");
    } else {
      fig.classList.remove("walk-ice", "slipped");
      void fig.offsetWidth; // 애니메이션 리셋
      fig.classList.add("dirt", "walk-dirt");
    }
  });
  return () => {
    window.clearTimeout(timer);
    man.removeEventListener("animationend", onEnd);
  };
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
      ask(choicesBox, helper, {
        choices: s.choices ?? ["잔디와 공 사이의 힘이 운동을 방해했다", "공이 힘을 다 써 버렸다", "지구가 공을 뒤로 당겼다"],
        good: "맞아요! <b>잔디와 공 사이의 힘(마찰)</b>이 운동을 방해해 멈춰요. 실험실에서 힘과 운동을 확인!",
        bad: "힘을 다 쓰거나 지구가 뒤로 당긴 게 아니에요 — <b>잔디와 공 사이의 마찰</b>이 운동을 조금씩 방해해 멈춘 거예요. 실험실에서 바람으로 힘을 줘 가며 확인해요.",
        onDone: finish,
      });
    }, 2400);
  });
  return () => window.clearTimeout(timer);
}
