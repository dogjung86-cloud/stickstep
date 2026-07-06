// hookGas — VI 단원(기체의 성질) 훅 장면 4종. hook.ts의 디스패처가 불러 쓴다.
// 프리미엄 SVG 문법(그라데이션+키라이트+접촉 그림자) 준수. 북극곰은 손그림 라인 캐릭터(스틱맨 계열).

import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import type { AvatarKind } from "../../ui/avatar";

type Face = (k: AvatarKind) => void;

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

// ── L1: 북극곰의 얇은 얼음판(압력 예측) ──────────────────────
function polarSvg(): string {
  return `<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <linearGradient id="hg-ice" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#EAF6FF"/><stop offset="1" stop-color="#BCDCF2"/>
      </linearGradient>
      <linearGradient id="hg-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8FC0EC"/><stop offset="1" stop-color="#4E86C4"/>
      </linearGradient>
    </defs>
    <!-- 물 + 얇은 얼음판 -->
    <rect x="10" y="118" width="220" height="34" rx="8" fill="url(#hg-water)" opacity=".55"/>
    <rect x="24" y="112" width="192" height="12" rx="6" fill="url(#hg-ice)" stroke="#9CC6E4" stroke-width="1.6"/>
    <path d="M40 116h18M100 119h22M168 116h16" stroke="#FFFFFF" stroke-width="1.8" opacity=".7"/>
    <!-- 금(선택 후 표시) -->
    <g class="hg-cracks" stroke="#6E9CC4" stroke-width="1.8" opacity="0">
      <path d="M120 113l-10 5 6 4M120 113l12 4-4 5M120 113l-2 9"/>
    </g>
    <!-- 북극곰(손그림 라인) — 서 있는 자세 -->
    <g class="hg-bear">
      <g class="hg-bear-stand" stroke="#3C4654" stroke-width="2.4" fill="#FFFFFF">
        <ellipse cx="120" cy="86" rx="20" ry="14"/>
        <circle cx="142" cy="74" r="9"/>
        <circle cx="147" cy="69" r="2.6" fill="#3C4654" stroke="none"/>
        <path d="M139 68l-2-4M146 66l1-4" stroke-width="2"/>
        <path d="M108 98v13M116 98v13M126 98v13M134 98v13"/>
        <path d="M101 84q-5-2-4-7" fill="none"/>
      </g>
      <g class="hg-bear-crawl" stroke="#3C4654" stroke-width="2.4" fill="#FFFFFF" opacity="0">
        <ellipse cx="120" cy="100" rx="26" ry="10"/>
        <circle cx="150" cy="96" r="8.5"/>
        <circle cx="155" cy="92" r="2.4" fill="#3C4654" stroke="none"/>
        <path d="M100 108h-7M112 109h-7M130 109h7M142 108h7"/>
      </g>
    </g>
    <ellipse class="hg-bear-sh" cx="120" cy="112" rx="26" ry="3" fill="#2A3A5E" opacity=".14"/>
  </svg>`;
}

export function renderPolar(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hg-polar", attrs: { role: "img", "aria-label": "얇은 얼음판 앞의 북극곰" } });
  fig.innerHTML = polarSvg();
  const standBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "서서 성큼성큼" }));
  const crawlBtn = el("button", { class: "swapbtn", attrs: { type: "button" } }, el("span", { text: "엎드려 스르륵" }));
  const btnRow = el("div", { class: "gp-controls" }, standBtn, crawlBtn);
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, btnRow, choicesBox);
  helper.innerHTML = "저 얇은 얼음판을 건너야 해요. 북극곰에게 <b>어떻게 건너라고</b> 할까요?";

  let timer = 0;
  let solved = false;
  standBtn.addEventListener("click", () => {
    if (solved) return;
    haptic(HAPTIC.wrong);
    face("surprised");
    fig.classList.remove("cracking");
    void fig.offsetWidth;
    fig.classList.add("cracking");
    helper.innerHTML = "쩌적—! 얼음에 <b>금이 가요</b>! 다른 방법을 골라 보세요.";
  });
  crawlBtn.addEventListener("click", () => {
    if (solved) return;
    solved = true;
    (standBtn as HTMLButtonElement).disabled = true;
    (crawlBtn as HTMLButtonElement).disabled = true;
    haptic(HAPTIC.select);
    face("smile");
    fig.classList.remove("cracking");
    fig.classList.add("crawling");
    helper.innerHTML = "무사히 통과! 그런데 <b>몸무게는 그대로</b>인데, 왜 엎드리면 안전했을까요?";
    timer = window.setTimeout(() => {
      face("curious");
      ask(
        choicesBox,
        s.choices ?? ["바닥에 닿는 면적이 넓어져 한 곳에 실리는 힘이 줄었다", "엎드리면 몸무게가 가벼워진다", "얼음이 곰의 체온에 더 단단해진다"],
        helper,
        "예측 완료! 실험실에서 <b>힘과 면적, 그리고 기체의 압력</b>까지 파헤쳐 봐요.",
        finish,
      );
    }, 900);
  });
  return () => window.clearTimeout(timer);
}

// ── L3: 뽁뽁이 터뜨리기(압력 체감) ───────────────────────────
function wrapSvg(): string {
  let caps = "";
  const XS = [70, 120, 170];
  const YS = [52, 96, 140];
  let i = 0;
  for (const cy of YS) {
    for (const cx of XS) {
      caps += `<g class="hg-cap" data-i="${i}" style="cursor:pointer">
        <circle cx="${cx}" cy="${cy}" r="19" fill="url(#hg-capg)" stroke="#9CC0DE" stroke-width="1.4"/>
        <ellipse cx="${cx - 6}" cy="${cy - 7}" rx="6.5" ry="4" fill="#FFFFFF" opacity=".65" transform="rotate(-18 ${cx - 6} ${cy - 7})"/>
        <g class="hg-pop" stroke="#F0A422" stroke-width="2" opacity="0">
          <path d="M${cx - 24} ${cy - 14}l-6-5M${cx + 24} ${cy - 14}l6-5M${cx - 24} ${cy + 14}l-6 5M${cx + 24} ${cy + 14}l6 5"/>
        </g>
      </g>`;
      i++;
    }
  }
  return `<svg viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" aria-hidden="true">
    <defs>
      <radialGradient id="hg-capg" cx=".38" cy=".32" r=".95">
        <stop offset="0" stop-color="#F2FAFF" stop-opacity=".95"/><stop offset=".6" stop-color="#D6EBFA" stop-opacity=".8"/><stop offset="1" stop-color="#AFCEE8" stop-opacity=".9"/>
      </radialGradient>
    </defs>
    <rect x="34" y="18" width="172" height="158" rx="12" fill="rgba(214,235,250,.25)" stroke="#B8D6EC" stroke-width="1.6"/>
    ${caps}
  </svg>`;
}

export function renderBubblewrap(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hg-wrap", attrs: { role: "img", "aria-label": "뽁뽁이 누르기" } });
  fig.innerHTML = wrapSvg();
  scene.appendChild(fig);
  helper.innerHTML = "유리컵을 지켜 준 <b>뽁뽁이</b>예요. 볼록한 캡을 <b>꾹꾹 눌러</b> 보세요!";

  let popped = 0;
  fig.addEventListener("click", (e) => {
    const cap = (e.target as Element).closest(".hg-cap");
    if (!cap || cap.classList.contains("done")) return;
    cap.classList.add("done");
    popped++;
    haptic(HAPTIC.correct);
    if (popped === 1) {
      face("surprised");
      helper.innerHTML = "뽁! 손끝으로 눌러 <b>부피가 줄자</b> 속 공기가 <b>세게 되밀다가</b> 터졌어요. 더 눌러 봐요!";
    }
    if (popped >= 3) {
      face("curious");
      helper.innerHTML = "이 <b>눌리면 되미는 성질</b> 덕분에 뽁뽁이가 충격을 받아 줘요. 압력과 부피의 관계 — 실험실에서 계속!";
      finish();
    }
  });
  return () => undefined;
}

// ── L4: 은박 풍선 안↔밖(온도 체감) ───────────────────────────
function foilSvg(): string {
  return `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <radialGradient id="hg-foil" cx=".36" cy=".3" r=".9">
        <stop offset="0" stop-color="#FFD7DE"/><stop offset=".45" stop-color="#F06A7E"/><stop offset="1" stop-color="#B23346"/>
      </radialGradient>
      <linearGradient id="hg-win" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#AFE0F8"/><stop offset="1" stop-color="#6FA8D8"/>
      </linearGradient>
    </defs>
    <!-- 창문(밖 = 겨울) -->
    <rect x="150" y="20" width="76" height="92" rx="8" fill="url(#hg-win)" opacity=".7" stroke="#8FB3D6" stroke-width="2"/>
    <path d="M188 20v92M150 66h76" stroke="#8FB3D6" stroke-width="2"/>
    <g class="hg-snow" fill="#FFFFFF" opacity=".85">
      <circle cx="166" cy="38" r="2"/><circle cx="205" cy="50" r="1.7"/><circle cx="178" cy="84" r="2"/><circle cx="214" cy="96" r="1.6"/><circle cx="160" cy="100" r="1.5"/>
    </g>
    <ellipse cx="88" cy="166" rx="34" ry="5" fill="#2A3A5E" opacity=".10"/>
    <!-- 하트 은박 풍선 -->
    <g class="hg-heart">
      <path class="hg-heart-body" d="M88 96 C74 80 48 82 48 62 C48 46 62 38 74 44 C82 48 86 54 88 58 C90 54 94 48 102 44 C114 38 128 46 128 62 C128 82 102 80 88 96Z" fill="url(#hg-foil)" stroke="#8E2438" stroke-width="1.6"/>
      <ellipse cx="72" cy="54" rx="9" ry="5.5" fill="#FFFFFF" opacity=".5" transform="rotate(-22 72 54)"/>
      <g class="hg-wrinkle" stroke="#8E2438" stroke-width="1.2" opacity="0">
        <path d="M66 56q6 4 2 10M96 50q-2 8 6 10M84 74q4-6 12-4M74 68q8 2 6 10"/>
      </g>
      <path d="M88 97q-4 22 0 44" stroke="#8B95A1" stroke-width="2"/>
    </g>
    <!-- 스틱맨(줄 잡음) -->
    <g stroke="#3C4654" stroke-width="2.6">
      <circle cx="88" cy="132" r="8.5" fill="#fff"/>
      <path d="M88 141v20M88 146l-10 5M88 146l9-8M88 161l-8 13M88 161l8 13"/>
    </g>
  </svg>`;
}

export function renderFoilballoon(scene: HTMLElement, helper: HTMLElement, finish: () => void, face: Face): () => void {
  const fig = el("div", { class: "hg-foilwrap", attrs: { role: "img", "aria-label": "은박 풍선을 든 스틱맨" } });
  fig.innerHTML = foilSvg();
  const goBtn = el("button", { class: "swapbtn pulse", attrs: { type: "button" } }, el("span", { text: "겨울 밖으로 나가기" }));
  scene.append(fig, goBtn);
  helper.innerHTML = "따뜻한 실내, 은박 풍선이 <b>팽팽</b>해요. 밖은 영하의 겨울! 나가 볼까요?";

  let outside = false;
  let trips = 0;
  goBtn.addEventListener("click", () => {
    outside = !outside;
    fig.classList.toggle("cold", outside);
    goBtn.querySelector("span")!.textContent = outside ? "따뜻한 안으로 들어오기" : "겨울 밖으로 나가기";
    haptic(HAPTIC.select);
    if (outside) {
      face("surprised");
      helper.innerHTML = "앗, 풍선이 <b>쭈글쭈글</b>해졌어요! 바람이 샌 걸까요? 다시 안으로 들어가 봐요.";
    } else {
      trips++;
      face(trips >= 2 ? "curious" : "smile");
      helper.innerHTML =
        trips >= 2
          ? "바람이 샌 게 아니라 <b>온도</b> 때문이었어요 — 차가우면 쪼그라들고 따뜻하면 되살아나요. 실험실에서 정확히 재 봐요!"
          : "다시 <b>팽팽</b>! 신기하죠? 한 번 더 나갔다 와 볼까요?";
      if (trips >= 2) finish();
    }
  });
  return () => undefined;
}

// ── L5: 찌그러진 탁구공 구출(뜨거운 물) ──────────────────────
function pingpongSvg(): string {
  return `<svg viewBox="0 0 240 190" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <radialGradient id="hg-ball" cx=".36" cy=".3" r=".9">
        <stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F2E9DC"/><stop offset="1" stop-color="#C9B792"/>
      </radialGradient>
      <linearGradient id="hg-hot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFB894"/><stop offset="1" stop-color="#E86A4A"/>
      </linearGradient>
    </defs>
    <ellipse cx="160" cy="176" rx="52" ry="5" fill="#2A3A5E" opacity=".12"/>
    <!-- 뜨거운 물 컵 -->
    <path d="M116 92v66a8 8 0 0 0 8 8h72a8 8 0 0 0 8-8V92" stroke="#9DAABD" stroke-width="3" fill="rgba(210,230,250,.14)"/>
    <path d="M120 104h80v52a6 6 0 0 1-6 6h-68a6 6 0 0 1-6-6z" fill="url(#hg-hot)" opacity=".6"/>
    <g class="hg-steam" stroke="#E8EFF8" stroke-width="2.2" opacity=".7">
      <path d="M138 92q4-10-2-18M162 90q5-9-1-17M186 92q4-10-2-18"/>
    </g>
    <g class="hg-splash" stroke="#FFD9C4" stroke-width="2.4" opacity="0">
      <path d="M136 100l-7-8M186 100l7-8M146 96l-3-10M176 96l3-10M161 94v-11"/>
    </g>
    <!-- 찌그러진 탁구공(드래그 대상) -->
    <g class="hg-pp">
      <ellipse class="hg-pp-sh" cx="44" cy="150" rx="16" ry="3.4" fill="#2A3A5E" opacity=".16"/>
      <g class="hg-pp-ball">
        <circle cx="44" cy="128" r="17" fill="url(#hg-ball)" stroke="#A08A5E" stroke-width="1.6"/>
        <path class="hg-dent" d="M33 120q10 10 5 16q8 2 12-4q-2-10-9-13q-6-2-8 1Z" fill="#B4A176" opacity=".9"/>
        <ellipse cx="38" cy="120" rx="5" ry="3.4" fill="#FFFFFF" opacity=".7" transform="rotate(-24 38 120)"/>
      </g>
    </g>
  </svg>`;
}

export function renderPingpong(
  scene: HTMLElement,
  helper: HTMLElement,
  s: { choices?: string[] },
  finish: () => void,
  face: Face,
): () => void {
  const fig = el("div", { class: "hg-ppwrap", attrs: { role: "img", "aria-label": "찌그러진 탁구공을 뜨거운 물에 넣기" } });
  fig.innerHTML = pingpongSvg();
  const choicesBox = el("div", { class: "hook-choices" });
  scene.append(fig, choicesBox);
  helper.innerHTML = "아끼는 탁구공이 밟혀서 <b>찌그러졌어요</b>. 공을 잡아 <b>뜨거운 물</b>에 퐁당 넣어 보세요.";

  const ball = fig.querySelector(".hg-pp") as SVGGElement;
  let dragging = false;
  let ox = 0;
  let oy = 0;
  let px = 0;
  let py = 0;
  let done = false;
  let timer = 0;

  const toLocal = (e: PointerEvent): [number, number] => {
    const r = fig.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 240, ((e.clientY - r.top) / r.height) * 190];
  };
  const setBall = (transition: string): void => {
    ball.style.transition = transition;
    ball.style.transform = `translate(${(px / 240) * 100}%, ${(py / 190) * 100}%)`;
  };
  fig.addEventListener("pointerdown", (e) => {
    if (done) return;
    const [lx, ly] = toLocal(e);
    if (Math.hypot(lx - (44 + px), ly - (128 + py)) > 34) return;
    dragging = true;
    ox = lx - px;
    oy = ly - py;
    fig.setPointerCapture?.(e.pointerId);
    haptic(HAPTIC.tap);
  });
  fig.addEventListener("pointermove", (e) => {
    if (!dragging || done) return;
    const [lx, ly] = toLocal(e);
    px = lx - ox;
    py = ly - oy;
    setBall("none"); // 드는 동안은 손을 그대로 따라옴
  });
  const drop = (): void => {
    if (!dragging || done) return;
    dragging = false;
    const bx = 44 + px;
    const by = 128 + py;
    // 컵 입구(116~200) 위쪽 공중에서 놓아야 퐁당 — 물높이(104)보다 충분히 위
    const overCup = bx > 122 && bx < 194 && by < 112;
    if (overCup) {
      done = true;
      // 1단계: 수면까지 자유낙하(ease-in) → 2단계: 살짝 가라앉았다 떠오르며 복원
      px = 160 - 44;
      py = 118 - 128;
      setBall("transform .34s cubic-bezier(.5,.05,.8,.4)");
      haptic(HAPTIC.select);
      timer = window.setTimeout(() => {
        fig.classList.add("splashed");
        haptic(HAPTIC.correct);
        face("surprised");
        helper.innerHTML = "퐁당… <b>펑!</b> 찌그러진 곳이 도로 펴졌어요! 물이 들어간 걸까요?";
        py = 112 - 128; // 반 잠긴 채 동동
        setBall("transform .5s var(--spring)");
        window.setTimeout(() => fig.classList.add("healed"), 240);
        timer = window.setTimeout(() => {
          face("curious");
          ask(
            choicesBox,
            s.choices ?? ["공 속 기체가 데워져 부피가 늘며 밀어냈다", "뜨거운 물이 공 안으로 스며들었다", "플라스틱이 녹아서 저절로 펴졌다"],
            helper,
            "예측 완료! 실험실에서 <b>열기구</b>로 온도와 부피의 관계를 크게 확인해 봐요.",
            finish,
          );
        }, 1100);
      }, 340);
    } else {
      // 빗나감 — 제자리로 사뿐히 복귀
      px = 0;
      py = 0;
      setBall("transform .5s var(--spring)");
      if (bx > 100) helper.innerHTML = "아깝다! 공을 <b>컵 바로 위까지</b> 들고 가서 놓아야 퐁당 들어가요.";
    }
  };
  fig.addEventListener("pointerup", drop);
  fig.addEventListener("pointercancel", drop);
  return () => window.clearTimeout(timer);
}
