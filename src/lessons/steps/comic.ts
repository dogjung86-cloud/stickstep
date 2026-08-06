// comic — 스틱맨 쌤이 과학사 이야기를 만화 컷으로 들려주며 개념을 가르치는 스텝.
// 하단 CTA로 컷을 한 장씩 넘기고, 마지막 컷에서 다음 단계로 넘어간다.
// 이미지(Imagen 발주)가 아직 없거나 로드 실패하면 스틱맨 SVG로 폴백.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { renderBlock } from "../../ui/blocks";
import { stickman } from "../../ui/figures";
import { stickAvatar } from "../../ui/avatar";
import type { StepRenderer } from "../types";

/** 컷 위 한글 말풍선 — dsl.ts CutBubble 하이브리드 표준의 comic판.
 *  발주 컷엔 글자·말풍선 없이 인물 연기만, 앱이 이미지 % 좌표에 한글을 얹는다.
 *  x·y = 컷 프레임 기준 %(말풍선 중심·아래 꼭지). flip이면 꼬리가 위(인물 아래 배치용). */
interface PanelBubble {
  text: string;
  x: number;
  y: number;
  flip?: boolean;
}
interface Panel {
  img?: string;
  stage: string;
  title: string;
  caption: string;
  term?: { name: string; def: string };
  bubbles?: PanelBubble[];
}
interface ComicStep {
  title?: string;
  lead?: string;
  narrator?: string;
  panels: Panel[];
  cta?: string;
}

const STAGE_COLOR: Record<string, string> = {
  인트로: "#3182F6", "문제 인식": "#3182F6", "가설 설정": "#FF9500",
  "탐구 설계": "#8A6BFF", "탐구 계획": "#8A6BFF", "탐구 수행": "#12B886",
  "자료 해석": "#0CA6C0", "결론 도출": "#04B45F",
  // 열 단원(III)
  전도: "#FF6B4A", 대류: "#0CA6C0", 복사: "#F04452", 정리: "#04B45F",
  // 역사 트랙 — 탐구 5단계 + 서사 배지
  "주제 선정": "#3182F6", "자료 수집": "#E8850C", "분석·해석": "#8A6BFF", 검증: "#0CA6C0", "정리·발표": "#04B45F",
  랑케: "#3D5BC0", "카의 생각": "#0E7C8A", 사관: "#8A6BFF", 대결: "#E8590C",
  // 사회 Ⅶ — 장영실 서사(귀속→성취)
  "타고난 자리": "#8A6A3E", "재능의 부름": "#E8850C", "스스로 얻은 자리": "#0E7C8A", "두 이름표": "#862E9C",
  // 역사 Ⅰ 만화 확대 3편(2026-08-03) — 실록 수호 · 카데시 사료 비판 · 서력의 탄생
  위기: "#E8590C", "마지막 한 벌": "#C2843A", "짐 꾸리기": "#E8850C", 피란길: "#8A6A3E",
  지킴: "#0E7C8A", 결실: "#04B45F", 유산: "#3D5BC0",
  "파라오의 명령": "#C2843A", "새기는 손": "#E8850C", "상대의 기록": "#3D5BC0", "평화 조약": "#04B45F",
  발굴: "#8A6A3E", "어긋난 기록": "#E8590C", "사료 비판": "#0E7C8A",
  임무: "#3182F6", "새 기준": "#3D5BC0", "원년 선언": "#0E7C8A", "사라진 0": "#E8590C",
  "한 묶음 100년": "#C2843A", 세계로: "#8A6BFF", "오늘의 교실": "#04B45F",
  // 역사 Ⅱ 만화 확대 5편(2026-08-03) — 알타미라 · 갑골 발견 · 키루스 · 폼페이 · 비단길
  탐사: "#8A6A3E", 발견: "#0CA6C0", 의심: "#E8590C", 증거: "#C2843A", 인정: "#04B45F",
  약방: "#8A6A3E", 싹쓸이: "#E8850C", 추적: "#3182F6",
  입성: "#3D5BC0", 관용: "#0E7C8A", 귀향: "#04B45F", 기록: "#C2843A",
  "긴 잠": "#5C677D", 일상: "#04B45F",
  공방: "#8A6A3E", 릴레이: "#E8850C", 열광: "#C2843A", "엉뚱한 소문": "#8A6BFF",
  걱정: "#E8590C", "길의 이름": "#0E7C8A",
  // 역사 Ⅲ 만화 확대 5편(2026-08-03) — 효문제 · 아스카 · 0의 발명 · 카롤루스 · 구텐베르크
  "분열의 시대": "#5C677D", 천도: "#3182F6", "새 옷": "#E8850C", "새 성씨": "#3D5BC0",
  배움: "#0CA6C0", 융합: "#C2843A",
  출항: "#3182F6", 마중: "#0CA6C0", 완공: "#04B45F", 개화: "#C2843A",
  뒤죽박죽: "#E8590C", 관찰: "#3182F6", 어리둥절: "#8A6BFF", 완성: "#04B45F", 황금기: "#C2843A",
  고민: "#5C677D", 초빙: "#3182F6", 필사: "#8A6A3E", "새 글씨": "#0CA6C0",
  "몰래 연습": "#8A6BFF", 씨앗: "#04B45F",
  발명: "#3182F6", "첫 인쇄": "#0CA6C0", "쏟아지는 책": "#E8850C", 확산: "#C2843A",
  // 역사 Ⅳ 만화 확대 6편(2026-08-03) — 전연의 맹 · 나침반 · 백자 · 호쿠사이 · 아크바르 · 루터
  결단: "#3D5BC0", 대치: "#5C677D", 담판: "#C2843A", 찬반: "#E8590C",
  "캄캄한 밤": "#5C677D", "먼 바다": "#0CA6C0", 교역: "#C2843A", 세관: "#8A6A3E",
  "은의 물길": "#3D5BC0", 도전: "#E8850C", 비법: "#0E7C8A",
  "괴짜 화가": "#8A6BFF", 목판: "#8A6A3E", "맞잡은 손": "#C2843A", "토론의 방": "#3182F6",
  "아흔다섯 질문": "#E8590C", "갈리는 입장": "#8A6BFF", "두 갈래": "#5C677D",
  // 사회 Ⅸ — 프닉스 언덕의 하루(아테네 민회 서사)
  "이른 아침": "#E8850C", 민회: "#1864AB", 추첨: "#C2843A", "해 질 무렵": "#E8590C",
  // 사회 Ⅻ — 당연한 것들의 역사(세계 인권 선언 서사)
  현재: "#3182F6", 옛날: "#8A6A3E", 전환: "#E8850C", 약속: "#AE3EC9",
};
function stageColor(stage: string): string {
  for (const key of Object.keys(STAGE_COLOR)) if (stage.includes(key)) return STAGE_COLOR[key];
  return "#3182F6";
}
const base = (import.meta as unknown as { env: { BASE_URL: string } }).env?.BASE_URL || "/";

export const comic: StepRenderer = (host, step, api) => {
  const s = step as unknown as ComicStep;
  if (s.title) host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  host.appendChild(
    el(
      "div",
      { class: "comic-narrator" },
      el("div", { class: "comic-avatar" }, stickAvatar("smile")),
      el("div", { class: "comic-bubble", html: s.narrator ?? "스틱맨 쌤이 <b>과학사 이야기</b>로 탐구 과정을 알려줄게요. 컷을 한 장씩 넘겨 보세요." }),
    ),
  );

  const dots = el("div", { class: "comic-dots" });
  const panelEl = el("div", { class: "comic-panel" });
  host.append(dots, panelEl);

  let i = 0;
  // 프레임 원비율 추종(2026-08-03): 첫 컷 로드에서 실측한 비율 — 한 만화 = 한 비율(폴더 균일)이라
  // 이후 컷은 로드 전에 선적용돼 높이 점프가 없다. 로드 전 기본 예약은 CSS의 4:3.
  let artRatio: string | null = null;

  function fallback(): HTMLElement {
    return el("div", { class: "comic-fallback", html: stickman() });
  }

  function renderDots(): void {
    clear(dots);
    s.panels.forEach((_, k) => {
      const d = el("i", { class: k === i ? "on" : k < i ? "past" : "" });
      dots.appendChild(d);
    });
  }

  function render(): void {
    const p = s.panels[i];
    const color = stageColor(p.stage);
    clear(panelEl);

    const prevBtn = el(
      "button",
      { class: "comic-prev", attrs: { type: "button", "aria-label": "이전 컷" } },
      el("span", { text: "‹ 이전 컷" }),
    ) as HTMLButtonElement;
    prevBtn.disabled = i === 0;
    prevBtn.addEventListener("click", () => {
      if (i === 0) return;
      i -= 1;
      haptic(HAPTIC.tap);
      render();
    });
    const head = el(
      "div",
      { class: "comic-head" },
      el("span", { class: "comic-badge", style: `--bc:${color}`, text: p.stage }),
      el(
        "span",
        { class: "comic-nav" },
        prevBtn,
        el("span", { class: "comic-count", text: `${i + 1} / ${s.panels.length}` }),
      ),
    );
    const title = el("div", { class: "comic-title", html: p.title });

    const art = el("div", { class: "comic-art" });
    if (artRatio) art.style.aspectRatio = artRatio;
    if (p.img) {
      const img = el("img", { class: "comic-img", attrs: { src: base + p.img, alt: p.title, loading: "eager" } }) as HTMLImageElement;
      const applyRatio = () => {
        if (!img.naturalWidth || !img.naturalHeight) return;
        artRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
        art.style.aspectRatio = artRatio;
      };
      if (img.complete) applyRatio();
      else img.addEventListener("load", applyRatio, { once: true });
      img.addEventListener("error", () => {
        clear(art);
        art.classList.add("is-fallback");
        art.appendChild(fallback());
      });
      art.appendChild(img);
      // 말풍선 하이브리드 — 이미지 % 좌표에 얹는 HTML(로드 실패 시 clear(art)가 함께 걷어낸다).
      // wrap 변형: cut()의 nowrap 한 줄과 달리 만화 대사는 2줄까지 줄바꿈 허용(폰 폭 390 가독성).
      for (const b of p.bubbles ?? []) {
        art.appendChild(
          el("span", {
            class: `cut-bubble wrap${b.flip ? " flip" : ""}`,
            style: `left:${b.x}%;top:${b.y}%`,
            html: b.text,
          }),
        );
      }
    } else {
      art.classList.add("is-fallback");
      art.appendChild(fallback());
    }

    const cap = el("div", { class: "comic-caption", html: p.caption });
    panelEl.append(head, title, art, cap);
    if (p.term) panelEl.appendChild(renderBlock({ k: "term", name: p.term.name, def: p.term.def, icon: "bulb" }));

    // reflow 후 .in 부여 — rAF에 의존하지 않고 항상 보이면서 전환 애니메이션도 재생.
    panelEl.classList.remove("in");
    void panelEl.offsetWidth;
    panelEl.classList.add("in");
    renderDots();

    const last = i === s.panels.length - 1;
    api.setCTA(last ? (s.cta ?? "개념 정리하기") : "다음 컷", {
      enabled: true,
      onClick: last ? api.next : advance,
      pop: true,
    });
  }

  function advance(): void {
    if (i < s.panels.length - 1) {
      i += 1;
      haptic(HAPTIC.select);
      render();
    }
  }

  render();
};
