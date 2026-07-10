// stemLab, 줄기와 잎 선반 랩(Ⅵ 통계 — 교과서 240~241쪽 줄기와 잎 그림).
// 소재는 농구부 시즌 득점(사용자 확정 2026-07-10 — 교과서 '함께하기'의 스포츠 득점 설정 계승, 수치는 자체 제작).
// 국면 3개: 1 흩어진 득점 카드를 하나씩 집어 올바른 줄기 행(십의 자리)에 탭으로 꽂기(오답 교정) →
//   2 잎 정렬 버튼 → 각 행이 크기순 정렬 + "잎이 가장 많은 줄기" 미션 →
//   3 읽기 미션(득점 3위 경기 찾기, (2|1은 21점) 표기 읽기).
// 연출은 CSS transition + setTimeout 체인. rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface StemStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 232;

/* 농구부 시즌 12경기 득점(등장 순서 = 무작위 느낌, 줄기 0~4 · 줄기 2가 최다 4잎 · 3위 36점) */
const DATA = [24, 9, 32, 18, 45, 21, 38, 15, 29, 36, 24, 12];
const STEMS = [0, 1, 2, 3, 4];
const ROW_Y = (si: number): number => 34 + si * 40;

export const stemLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as StemStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "sort", label: "선반에 꽂기", sub: "0/12" },
    { id: "order", label: "잎 정렬", sub: "크기순" },
    { id: "read", label: "그림 읽기", sub: "득점 3위" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mstm-stage" });
  const rows = STEMS.map(
    (st, si) =>
      `<g class="mstm-row" data-s="${si}">` +
      `<rect class="rowbg" x="16" y="${ROW_Y(si) - 16}" width="${W - 32}" height="34" rx="8" fill="#FFFFFF" stroke="#DDE3EC" stroke-width="1.4"/>` +
      `<text x="36" y="${ROW_Y(si) + 6}" text-anchor="middle" font-size="14" font-weight="900" fill="#2839A0">${st}</text>` +
      `<line x1="52" y1="${ROW_Y(si) - 12}" x2="52" y2="${ROW_Y(si) + 14}" stroke="${GEO.ink}" stroke-width="2"/>` +
      `<g class="leaves"></g></g>`,
  ).join("");
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    rows +
    `<text x="24" y="16" font-size="9.5" font-weight="800" fill="${GEO.soft}">줄기(십의 자리) | 잎(일의 자리)</text>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const cardHost = el("div", { class: "mstm-card" });
  const eqs = el("div", { class: "mq6-eqs" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, cardHost, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "우리 학교 농구부의 <b>시즌 12경기 득점</b>이 뒤죽박죽! 마라톤 접수처처럼 <b>앞자리(줄기) 선반</b>에 꽂아 정리해요.",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const svg = stage.querySelector("svg") as SVGSVGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let idx = 0;
  const placed: number[][] = STEMS.map(() => []);
  let finished = false;
  let phase: 1 | 2 | 3 = 1;

  const leafX = (k: number): number => 70 + k * 24;

  function drawLeaves(): void {
    STEMS.forEach((_, si) => {
      const g = svg.querySelector(`.mstm-row[data-s="${si}"] .leaves`) as SVGGElement;
      g.innerHTML = placed[si]
        .map(
          (v, k) =>
            `<text x="${leafX(k)}" y="${ROW_Y(si) + 6}" text-anchor="middle" font-size="13.5" font-weight="800" fill="${GEO.ink}">${v % 10}</text>`,
        )
        .join("");
    });
  }

  function showCard(): void {
    clear(cardHost);
    if (idx >= DATA.length) return;
    const v = DATA[idx];
    cardHost.appendChild(
      el("div", { class: "mstm-now mq6-pop", html: `${idx + 1}번째 경기: <b>${v}</b>점 · 꽂을 <b>줄기 행</b>을 탭!` }),
    );
  }

  /* ── 국면 1: 행 탭으로 꽂기 ── */
  svg.addEventListener("pointerdown", (e) => {
    if (finished || phase !== 1 || idx >= DATA.length) return;
    const t = (e.target as Element).closest(".mstm-row") as SVGGElement | null;
    if (!t) return;
    const si = Number(t.dataset.s);
    const v = DATA[idx];
    if (Math.floor(v / 10) === si) {
      haptic(HAPTIC.correct);
      placed[si].push(v);
      drawLeaves();
      idx += 1;
      chips.el.querySelector(`[data-g="sort"] span`)!.textContent = `${idx}/12`;
      if (idx >= DATA.length) {
        chips.on("sort", "12개 완료");
        later(startOrder, 700);
      } else showCard();
    } else {
      haptic(HAPTIC.cross);
      const bg = t.querySelector(".rowbg") as SVGRectElement;
      bg.style.transition = "stroke .15s";
      bg.setAttribute("stroke", "#F04452");
      later(() => bg.setAttribute("stroke", "#DDE3EC"), 500);
      toast(`${v}의 십의 자리는 ${Math.floor(v / 10)}! ${Math.floor(v / 10)}번 선반으로.`);
    }
  });

  /* ── 국면 2: 잎 정렬 ── */
  function startOrder(): void {
    if (finished) return;
    phase = 2;
    clear(cardHost);
    inst.innerHTML = `다 꽂았어요! 이제 각 행의 잎을 <b>작은 수부터</b> 정렬해요`;
    helper.innerHTML = "정렬 버튼 하나면 분포가 그림처럼 드러나요!";
    const btn = el("button", { class: "mq6-btn mq6-pulse", text: "잎 크기순 정렬", attrs: { type: "button" } }) as HTMLButtonElement;
    clear(ctl);
    ctl.appendChild(btn);
    later(() => btn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    btn.addEventListener("click", () => {
      btn.disabled = true;
      haptic(HAPTIC.correct);
      STEMS.forEach((_, si) => placed[si].sort((a, b) => a - b));
      drawLeaves();
      toast("(2|1은 21점) 이렇게 읽어요!");
      later(askLongest, 900);
    });
  }

  function askLongest(): void {
    inst.innerHTML = `잎이 <b>가장 많은</b> 줄기는 몇일까요?`;
    const row = el("div", { class: "mq6-choices" });
    [1, 2, 3].forEach((v) => {
      const b = el("button", { class: "mq6-choice", text: `줄기 ${v}`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 2) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("order", "줄기 2!");
          eqs.appendChild(
            el("div", { class: "mq6-eq mq6-pop", html: `줄기 2에 잎 4개(1 4 4 9), <b>20점대 경기가 가장 많아요</b>` }),
          );
          later(startRead, 1500);
        } else {
          haptic(HAPTIC.cross);
          toast("각 행의 잎 개수를 세어 봐요. 제일 긴 행은?");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 국면 3: 읽기 미션 ── */
  function startRead(): void {
    if (finished) return;
    phase = 3;
    clear(eqs);
    inst.innerHTML = `읽기 미션: 득점이 <b>3번째로 높은</b> 경기의 점수는? 힌트: 맨 아래(큰 줄기)의 오른쪽 끝에서 거꾸로 세어 봐요. 45, 38, 그다음!`;
    const row = el("div", { class: "mq6-choices" });
    [36, 32, 38].forEach((v) => {
      const b = el("button", { class: "mq6-choice", text: `${v}점`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (v === 36) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("read", "36점");
          eqs.appendChild(
            el("div", { class: "mq6-concl mq6-pop", html: `1위 45, 2위 38, 3위 <b>36</b>! 줄기와 잎 그림은 <b>원래 값이 다 보이는</b> 정리법이에요` }),
          );
          later(finish, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast(v === 38 ? "38은 2위! 하나 더 내려가요." : "32는 4위예요. 위에서 세 번째를 찾아요.");
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    helper.innerHTML = "앞자리로 묶고(줄기) 뒷자리를 나란히(잎). 정리했을 뿐인데 분포가 공짜로 보여요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  inst.innerHTML = `경기 득점이 한 장씩 나와요. <b>십의 자리에 맞는 선반</b>을 탭하세요`;
  showCard();
  drawLeaves();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
