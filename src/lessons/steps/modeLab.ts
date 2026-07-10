// modeLab, 최빈값 타워 랩(Ⅵ 통계 — 교과서 237~239쪽 최빈값·적절한 대푯값).
// 국면 3개: 1 판매 기록 카드 12장을 탭해 색깔 타워로 쌓기 → 최고 타워 = 최빈값 →
//   2 "평균 색깔 계산" 버튼 → 물음표 연출(색은 더하고 나눌 수 없다, 질적 자료 발견) →
//   3 상황 카드 3장(신발 재고·반 평균 키·연봉 자료)에 알맞은 대푯값 고르기.
// 연출은 CSS transition + setTimeout 체인(타이머 Set 일괄 해제). rAF 금지.

import { el, clear } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { mboard, mtoast, goalChips } from "../../ui/mathKit";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface ModeStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

const W = 340;
const H = 236;

/* 판매 기록(탭 순서대로 나오는 카드): 검정 5 · 파랑 3 · 빨강 2 · 초록 2 */
const SALES: { key: string; name: string; color: string }[] = [
  { key: "bk", name: "검정", color: "#2A3040" },
  { key: "bl", name: "파랑", color: "#3E6FD8" },
  { key: "bk", name: "검정", color: "#2A3040" },
  { key: "rd", name: "빨강", color: "#D9435C" },
  { key: "bl", name: "파랑", color: "#3E6FD8" },
  { key: "bk", name: "검정", color: "#2A3040" },
  { key: "gr", name: "초록", color: "#2F9E44" },
  { key: "bk", name: "검정", color: "#2A3040" },
  { key: "rd", name: "빨강", color: "#D9435C" },
  { key: "bl", name: "파랑", color: "#3E6FD8" },
  { key: "gr", name: "초록", color: "#2F9E44" },
  { key: "bk", name: "검정", color: "#2A3040" },
];
const TOWERS = [
  { key: "bk", name: "검정", color: "#2A3040", x: 62 },
  { key: "bl", name: "파랑", color: "#3E6FD8", x: 134 },
  { key: "rd", name: "빨강", color: "#D9435C", x: 206 },
  { key: "gr", name: "초록", color: "#2F9E44", x: 278 },
];

/* 구 "상황별 대표 선발전"은 제거(사용자 확정 2026-07-10): 볼펜 타워 무대와 무관한 상황(키·연봉)을
   같은 그림에 엮어 맥락이 어긋났다. 그 역할은 레슨 뒤 binSort "대표 선발 위원회"가 맡고,
   랩의 마지막 국면은 무대 그대로 쓰는 "최빈값 읽기(무슨 색?)"로 교체. */

export const modeLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ModeStep;
  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const chips = goalChips([
    { id: "tower", label: "타워 쌓기", sub: "0/12" },
    { id: "noavg", label: "평균 불가", sub: "색깔은?" },
    { id: "read", label: "최빈값 읽기", sub: "무슨 색?" },
  ]);

  const board = mboard(620);
  const stage = el("div", { class: "mmo-stage" });
  stage.innerHTML =
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none">` +
    `<line x1="20" y1="${H - 30}" x2="${W - 20}" y2="${H - 30}" stroke="#8C5A2E" stroke-width="3" stroke-linecap="round"/>` +
    TOWERS.map((t) => `<text x="${t.x}" y="${H - 12}" text-anchor="middle" font-size="11" font-weight="800" fill="#5C6E80">${t.name}</text>`).join("") +
    `<g class="mmo-blocks"></g><g class="mmo-crown"></g>` +
    `</svg>`;
  const panel = el("div", { class: "mq6-panel" });
  const inst = el("div", { class: "mq6-inst", html: "문구점에 <b>어제 팔린 볼펜 기록 12장</b>이 도착했어요. 카드를 탭해 같은 색 타워에 쌓으면, 가장 많이 팔린 색이 저절로 보여요" });
  const cardHost = el("div", { class: "mmo-card" });
  const eqs = el("div", { class: "mq6-eqs" });
  // 판단 질문 전용 줄 — 항상 선택지 버튼 바로 위 + 강조색(질문이 정보 줄에 섞여 안 보인다는 실사용 피드백).
  const qline = el("div", { class: "mq6-q" });
  const ctl = el("div", { class: "mq6-ctl" });
  panel.append(inst, cardHost, eqs, qline, ctl);
  board.append(stage, panel);
  const toast = mtoast(board);
  const helper = el("div", {
    class: "helper",
    html: "판매 기록을 색깔별로 쌓다 보면 사장님의 답이 저절로 보여요!",
  });
  host.append(chips.el, helper, board); // 지시(helper)는 조작 요소 위, 사용자 확정(2026-07-10)
  if (s.curio) host.appendChild(curioCard(s.curio));

  const gBlocks = stage.querySelector(".mmo-blocks") as SVGGElement;
  const gCrown = stage.querySelector(".mmo-crown") as SVGGElement;

  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  let idx = 0;
  const counts: Record<string, number> = { bk: 0, bl: 0, rd: 0, gr: 0 };
  let finished = false;
  function showCard(): void {
    clear(cardHost);
    if (idx >= SALES.length) return;
    const c = SALES[idx];
    const btn = el(
      "button",
      { class: "mmo-cardbtn mq6-pop", attrs: { type: "button" } },
      el("span", { class: "mmo-dot", style: `background:${c.color}` }),
      el("span", { html: `판매 기록 ${idx + 1}: <b>${c.name}</b> 볼펜` }),
    ) as HTMLButtonElement;
    btn.addEventListener("click", () => {
      if (finished) return;
      haptic(HAPTIC.tap);
      btn.disabled = true;
      const t = TOWERS.find((x) => x.key === c.key)!;
      const level = counts[c.key];
      counts[c.key] += 1;
      const y = H - 30 - (level + 1) * 22;
      gBlocks.insertAdjacentHTML(
        "beforeend",
        `<rect x="${t.x - 22}" y="${y}" width="44" height="19" rx="4.5" fill="${t.color}" stroke="#1A2430" stroke-width="1.2" opacity="0" style="transition: opacity .25s, transform .25s; transform: translateY(-10px)"/>`,
      );
      later(() => {
        const r = gBlocks.lastElementChild as SVGRectElement;
        r.style.opacity = "1";
        r.style.transform = "translateY(0)";
      }, 20);
      idx += 1;
      chips.el.querySelector(`[data-g="tower"] span`)!.textContent = `${idx}/12`;
      if (idx >= SALES.length) later(finishTowers, 500);
      else showCard();
    });
    cardHost.appendChild(btn);
  }

  function finishTowers(): void {
    clear(cardHost);
    haptic(HAPTIC.done);
    chips.on("tower", "12장 완료");
    // 최고 타워에 왕관
    const t = TOWERS[0]; // 검정 5개가 최다
    const y = H - 30 - counts.bk * 22 - 16;
    gCrown.innerHTML =
      `<g class="mq6-pop"><path d="M${t.x - 13} ${y} l5 -11 8 8 8 -8 5 11 Z" fill="#F2B430" stroke="#B98A00" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<text x="${t.x}" y="${y - 16}" text-anchor="middle" font-size="11" font-weight="900" fill="#B98A00">최다!</text></g>`;
    inst.innerHTML = `검정 타워가 <b>5칸</b>으로 우승! 가장 많이 나타난 값이에요`;
    toast("가장 높은 타워 = 가장 자주 팔린 색!");
    later(startNoAvg, 1600);
  }

  /* ── 국면 2: 평균 불가 체험 ── */
  function startNoAvg(): void {
    if (finished) return;
    inst.innerHTML = `그런데 궁금해요. 이 자료의 <b>평균</b>을 구할 수 있을까요?`;
    helper.innerHTML = "평균 = 다 더해서 개수로 나누기. 검정+파랑+빨강을... 더한다고요?";
    const btn = el("button", { class: "mq6-btn mq6-pulse", text: "평균 색깔 계산하기", attrs: { type: "button" } }) as HTMLButtonElement;
    clear(ctl);
    ctl.appendChild(btn);
    later(() => btn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
    btn.addEventListener("click", () => {
      btn.disabled = true;
      haptic(HAPTIC.cross);
      eqs.appendChild(
        el("div", { class: "mq6-eq mq6-pop", html: `(검정+파랑+빨강+초록) ÷ 12 = <b>???</b>` }),
      );
      later(() => {
        eqs.appendChild(
          el("div", {
            class: "mq6-concl mq6-pop",
            html: `색깔은 <b>더할 수도 나눌 수도 없어요!</b> 수가 아닌 자료의 대표는 <b>가장 많이 나타난 값</b>뿐`,
          }),
        );
        chips.on("noavg", "계산 불가!");
        haptic(HAPTIC.correct);
        later(startRead, 1800);
      }, 1200);
    });
  }

  /* ── 국면 3: 최빈값 읽기(무대의 타워 그대로 사용) ── */
  function startRead(): void {
    if (finished) return;
    clear(eqs);
    clear(ctl);
    inst.innerHTML = "색깔처럼 수가 아닌 자료의 대표, <b>가장 많이 나타난 값</b>의 정식 이름은 <b>최빈값</b>이에요(가장 자주라는 뜻)";
    qline.innerHTML = "그럼 이 판매 기록의 <b>최빈값</b>은 무슨 색일까요? 타워를 보고 골라요";
    helper.innerHTML = "왕관이 힌트예요!";
    const row = el("div", { class: "mq6-choices" });
    ["검정", "파랑", "빨강"].forEach((name) => {
      const b = el("button", { class: "mq6-choice", text: name, attrs: { type: "button" } }) as HTMLButtonElement;
      b.addEventListener("click", () => {
        if (finished) return;
        if (name === "검정") {
          haptic(HAPTIC.correct);
          row.querySelectorAll("button").forEach((x) => ((x as HTMLButtonElement).disabled = true));
          b.classList.add("ok");
          qline.innerHTML = "";
          eqs.appendChild(
            el("div", {
              class: "mq6-concl mq6-pop",
              html: "검정이 <b>5자루</b>로 최다, 이 자료의 최빈값은 <b>검정</b>! 사장님의 주문도 검정 볼펜이에요",
            }),
          );
          chips.on("read", "검정!");
          later(finish, 1400);
        } else {
          haptic(HAPTIC.cross);
          toast("가장 높은 타워를 봐요!");
        }
      });
      row.appendChild(b);
    });
    ctl.appendChild(row);
    later(() => qline.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80); // 화면 밖 등장 보정
  }

  function finish(): void {
    if (finished) return;
    finished = true;
    inst.innerHTML = "타워 정리 완료! 가장 높은 타워가 자료의 대표예요";
    helper.innerHTML = "가장 자주 나타난 값이 <b>최빈값</b>. 수가 아닌 자료의 유일한 대표이자, 장사의 대푯값이에요!";
    haptic(HAPTIC.done);
    api.recordQuiz(true);
    api.enableCTA(s.cta ?? "다음");
  }

  showCard();
  api.setCTA("목표를 모두 달성하면 열려요", { enabled: false });

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
