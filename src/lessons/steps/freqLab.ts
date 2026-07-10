// freqLab, 도수분포표 체급 랩(Ⅵ 통계 — 교과서 242~244쪽 계급·도수·도수분포표).
// 국면 3개: 1 참가자 몸무게가 한 명씩 나오면 알맞은 계급(이상~미만) 열을 탭해 바를 채운다
//   (경계값 50.0kg 함정 포함) → 2 계급 크기 비교(25kg: 뭉개짐 / 5kg: 적당 / 1kg: 번잡 — 토글 체험) →
//   3 표 읽기 미션(도수가 가장 큰 계급).
// 연출은 CSS transition + setTimeout 체인. rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { GEO } from "../../ui/geoKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface FreqStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 226;

/* 참가자 몸무게 12명(40~64kg) — 수동 분류 6명 + 자동 6명. 50.0이 경계 함정. */
const WEIGHTS = [47.2, 53.5, 44.1, 50.0, 58.4, 49.6, 46.3, 55.2, 52.8, 61.5, 52.1, 54.4];
const MANUAL = 6;
/* 계급: 40~45, 45~50, 50~55, 55~60, 60~65 */
const BINS = [40, 45, 50, 55, 60, 65];
const binOf = (v: number): number => Math.min(4, Math.floor((v - 40) / 5));
const COL_X = (bi: number): number => 38 + bi * 60;

export const freqLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FreqStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "tally", label: "체급 배정", sub: "0/6" },
    { id: "size", label: "계급 크기", sub: "적당히!" },
    { id: "read", label: "표 읽기", sub: "최다 계급" },
  ]);

  const board = mboard(600);
  const stage = el("div", { class: "mfq-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    BINS.slice(0, 5)
      .map((lo, bi) => {
        const x = COL_X(bi);
        return (
          `<g class="mfq-col" data-b="${bi}">` +
          `<rect class="colbg" x="${x - 26}" y="26" width="52" height="150" rx="9" fill="#FFFFFF" stroke="#DDE3EC" stroke-width="1.4"/>` +
          `<text x="${x}" y="${H - 30}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#2839A0">${lo}~${BINS[bi + 1]}</text>` +
          `<text x="${x}" y="${H - 18}" text-anchor="middle" font-size="8" font-weight="700" fill="${GEO.soft}">이상  미만</text>` +
          `<g class="marks"></g><text class="cnt" x="${x}" y="42" text-anchor="middle" font-size="12" font-weight="900" fill="#364FC7"></text></g>`
        );
      })
      .join("") +
    `<text x="24" y="16" font-size="9.5" font-weight="800" fill="${GEO.soft}">체급(kg)별 참가자 세기</text>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst" });
  const cardHost = el("div", { class: "mfq-card" });
  const eqs = el("div", { class: "mq6-eqs" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, cardHost, eqs, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "태권도 대회 접수처가 됐어요! 참가자를 <b>이상~미만</b> 규칙대로 체급에 배정해요.",
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
  const counts = [0, 0, 0, 0, 0];
  let finished = false;
  let phase: 1 | 2 | 3 = 1;

  function drawMarks(): void {
    counts.forEach((c, bi) => {
      const g = svg.querySelector(`.mfq-col[data-b="${bi}"] .marks`) as SVGGElement;
      const x = COL_X(bi);
      let m = "";
      for (let k = 0; k < c; k++) {
        const y = 168 - k * 22;
        m += `<rect x="${x - 18}" y="${y - 14}" width="36" height="17" rx="4" fill="url(#mfq-blk)" stroke="#1F2E8C" stroke-width="1.1"/>`;
      }
      g.innerHTML =
        `<defs><linearGradient id="mfq-blk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B99EE"/><stop offset="1" stop-color="#4759CE"/></linearGradient></defs>` + m;
      const cnt = svg.querySelector(`.mfq-col[data-b="${bi}"] .cnt`) as SVGTextElement;
      cnt.textContent = c > 0 ? `${c}` : "";
    });
  }

  function showCard(): void {
    clear(cardHost);
    if (idx >= MANUAL) return;
    const v = WEIGHTS[idx];
    cardHost.appendChild(
      el("div", { class: "mstm-now mq6-pop", html: `참가자 ${idx + 1}: <b>${v.toFixed(1)} kg</b> · 체급 열을 탭!` }),
    );
  }

  /* ── 국면 1: 수동 배정 ── */
  svg.addEventListener("pointerdown", (e) => {
    if (finished || phase !== 1 || idx >= MANUAL) return;
    const t = (e.target as Element).closest(".mfq-col") as SVGGElement | null;
    if (!t) return;
    const bi = Number(t.dataset.b);
    const v = WEIGHTS[idx];
    if (binOf(v) === bi) {
      haptic(HAPTIC.correct);
      counts[bi] += 1;
      drawMarks();
      if (v === 50.0) toast("딱 50.0은 50~55 계급! 이상은 포함, 미만은 불포함");
      idx += 1;
      chips.el.querySelector(`[data-g="tally"] span`)!.textContent = `${Math.min(idx, MANUAL)}/6`;
      if (idx >= MANUAL) {
        chips.on("tally", "6명 배정!");
        later(autoFill, 700);
      } else showCard();
    } else {
      haptic(HAPTIC.cross);
      const bg = t.querySelector(".colbg") as SVGRectElement;
      bg.setAttribute("stroke", "#F04452");
      later(() => bg.setAttribute("stroke", "#DDE3EC"), 500);
      toast(
        v % 5 === 0 || Math.abs(v - Math.round(v)) < 0.001
          ? "경계값 주의! 이상(포함)~미만(불포함)으로 판정해요."
          : `${v.toFixed(1)}kg은 ${BINS[binOf(v)]}이상 ~ ${BINS[binOf(v) + 1]}미만!`,
      );
    }
  });

  function autoFill(): void {
    inst.innerHTML = "나머지 6명은 접수 도우미가 착착!";
    let k = MANUAL;
    const step2 = (): void => {
      if (k >= WEIGHTS.length) {
        later(startSize, 900);
        return;
      }
      counts[binOf(WEIGHTS[k])] += 1;
      k += 1;
      drawMarks();
      haptic(HAPTIC.tap);
      later(step2, 260);
    };
    step2();
  }

  /* ── 국면 2: 계급 크기 실험 ── */
  function startSize(): void {
    if (finished) return;
    phase = 2;
    clear(cardHost);
    inst.innerHTML = `지금 표는 한 구간(계급)의 너비가 <b>5kg</b>이라 칸이 5개예요. 구간의 너비를 바꾸면 표가 어떻게 달라질까요? <b>세 버튼을 모두</b> 눌러 비교해요`;
    helper.innerHTML = "구간이 너무 넓으면 다 뭉개지고, 너무 잘면 번잡해요. 적당함이 실력!";
    const row = el("div", { class: "mq6-choices" });
    const seen = new Set<string>();
    [
      { k: "25", label: "너비 25kg으로: 칸 1개", msg: "40~65kg 전원이 한 칸에! 누가 어디쯤인지 전혀 안 보여요", good: false },
      { k: "5", label: "너비 5kg 그대로: 칸 5개", msg: "산 모양이 또렷! 분포가 한눈에 보여요", good: true },
      { k: "1", label: "너비 1kg으로: 칸 25개", msg: "칸 25개가 대부분 0명이나 1명... 세기만 번잡해요", good: false },
    ].forEach(({ k, label, msg, good }) => {
      const b = el("button", { class: "mq6-choice", text: label, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished || phase !== 2) return;
        haptic(good ? HAPTIC.correct : HAPTIC.cross);
        toast(msg);
        b.classList.add(good ? "ok" : "no");
        seen.add(k);
        if (seen.size >= 3) {
          chips.on("size", "5~15칸!");
          eqs.appendChild(
            el("div", { class: "mq6-eq mq6-pop", html: `계급의 개수는 <b>5~15개</b> 정도가 적당해요(자료 양에 맞게)` }),
          );
          later(startRead, 1500);
        }
      });
      row.appendChild(b);
    });
    clear(ctl);
    ctl.appendChild(row);
    later(() => row.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  /* ── 국면 3: 표 읽기 ── */
  function startRead(): void {
    if (finished) return;
    phase = 3;
    clear(eqs);
    inst.innerHTML = `완성된 표에서, <b>도수가 가장 큰 계급</b>은?`;
    const row = el("div", { class: "mq6-choices" });
    [
      ["50~55", true],
      ["45~50", false],
      ["55~60", false],
    ].forEach(([label, good]) => {
      const b = el("button", { class: "mq6-choice", text: `${label} kg`, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (good) {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          chips.on("read", "50~55");
          eqs.appendChild(
            el("div", { class: "mq6-concl mq6-pop", html: `50이상~55미만에 <b>5명</b>! 각 칸에 든 개수가 그 계급의 <b>도수</b>예요` }),
          );
          later(finish, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast("블록이 가장 높이 쌓인 열을 찾아요!");
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
    helper.innerHTML = "구간(계급)으로 나누고 개수(도수)를 세면 <b>도수분포표</b>. 큰 자료를 다루는 기본기예요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  inst.innerHTML = `참가자가 한 명씩 와요. <b>맞는 체급 열</b>을 탭해 배정하세요`;
  showCard();
  drawMarks();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
