// [중2 Ⅵ v3] L6 bodyTeamLab — 「세포의 주문서」.
// 한 통찰: 네 기관계가 협력해야 세포호흡이 돌고, 그 사이 운반은 언제나 순환계다.
// (교과서 230~231쪽 그림 VI-15 + 「해 보기」 기관계 모식도의 배차 게임판.)
// 조작: 조직세포의 주문 카드 → 담당 기관계 탭(오답 교정) → 순환 트럭 배달(CSS) → 허브 판정(b4Ask).
// rAF·캔버스 없음.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface BtmStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type OrganId = "dig" | "resp" | "excr";

// 상자 중심 = (62,60)(278,60)(278,196)(62,196) — 순환 도로 링이 네 중심을 전부 관통한다.
/** 트럭 정차 지점 — 각 상자 곁, 도로 레일 위(위 줄은 상자 아래·아래 줄은 상자 위). */
const PARK: Record<OrganId, [number, number]> = { dig: [62, 98], resp: [278, 98], excr: [278, 158] };
const CELL_PARK: [number, number] = [62, 158];

function stageScene(): string {
  const box = (x: number, y: number, w: number, label: string, tone: string, ink: string, part: string): string =>
    `<g class="btm-st" data-organ="${part}" role="button" tabindex="0" aria-label="${label}">
      <rect x="${x - w / 2}" y="${y - 24}" width="${w}" height="48" rx="14" fill="${tone}" stroke="${ink}" stroke-width="2.8"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#333D4B">${label}</text>
    </g>`;
  return `<svg viewBox="0 0 340 256" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 순환 고리(도로) — 네 상자의 중심을 관통해 전부 도로 위에 얹힌다 -->
    <rect x="62" y="60" width="216" height="136" rx="34" fill="none" stroke="#F3C0C6" stroke-width="14" opacity="0.6"/>
    <text x="170" y="48" text-anchor="middle" font-size="12" font-weight="800" fill="#C9303E">순환계(운반 도로)</text>
    ${box(62, 60, 92, "소화계", "#FFF4E6", "#F3C9A8", "dig")}
    ${box(278, 60, 92, "호흡계", "#E3F2FB", "#7CB2D4", "resp")}
    ${box(278, 196, 92, "배설계", "#FBF3DC", "#D9C08C", "excr")}
    <!-- 조직세포(주문자) -->
    <g>
      <rect x="16" y="172" width="92" height="48" rx="14" fill="#FFF7E8" stroke="#E3C58A" stroke-width="2.8"/>
      <text x="62" y="192" text-anchor="middle" font-size="13" font-weight="800" fill="#A9832B">조직세포</text>
      <g class="btm-fire">
        <path d="M54 206 c3 -6 5 -8 8 -11 c3 3 5 5 8 11 a8 8 0 0 1 -16 0 Z" fill="#FF922B"/>
        <path d="M58 207 c1.4 -3 2.6 -4.4 4 -6 c1.4 1.6 2.6 3 4 6 a4 4 0 0 1 -8 0 Z" fill="${B6.energy}"/>
      </g>
    </g>
    <!-- 순환 트럭(토큰) -->
    <g class="btm-truck">
      <rect x="-16" y="-11" width="24" height="16" rx="4" fill="#E23B4B" stroke="#A61E2E" stroke-width="2.2"/>
      <rect x="8" y="-6" width="10" height="11" rx="3" fill="#FFFFFF" stroke="#A61E2E" stroke-width="2"/>
      <circle cx="-8" cy="7" r="3.6" fill="#333D4B"/>
      <circle cx="8" cy="7" r="3.6" fill="#333D4B"/>
      <circle class="btm-cargo" cx="-4" cy="-16" r="6" fill="${B6.glucose}"/>
    </g>
  </svg>`;
}

/** 주문 4건 — 담당 기관계, 트럭 화물색, 방향(pick: 기관계→세포 / drop: 세포→기관계). */
const ORDERS: {
  id: string;
  card: string;
  organ: OrganId;
  cargo: string;
  dir: "pick" | "drop";
  done: string;
  fix: string;
}[] = [
  {
    id: "glc",
    card: "포도당(영양소)이 필요해요!",
    organ: "dig",
    cargo: B6.glucose,
    dir: "pick",
    done: "<b>소화계</b>가 흡수한 포도당을 순환 트럭이 세포까지 배달했어요!",
    fix: "영양소를 흡수해 들여오는 곳은 <b>소화계</b>예요 — 음식물을 소화해 포도당을 만드는 그 길이죠.",
  },
  {
    id: "o2",
    card: "산소가 필요해요!",
    organ: "resp",
    cargo: B6.o2,
    dir: "pick",
    done: "<b>호흡계</b>가 들숨으로 받은 산소를 트럭이 실어 왔어요!",
    fix: "산소를 몸속으로 받아들이는 곳은 <b>호흡계</b> — 허파꽈리 승강장에서 산소가 혈액에 탔었죠.",
  },
  {
    id: "co2",
    card: "이산화 탄소를 내보내 주세요!",
    organ: "resp",
    cargo: B6.co2,
    dir: "drop",
    done: "세포가 내놓은 이산화 탄소를 트럭이 <b>호흡계</b>로 날라 날숨으로 내보냈어요!",
    fix: "이산화 탄소는 기체 — 날숨으로 내보내는 <b>호흡계</b>의 몫이에요. 배설계는 요소 담당이죠.",
  },
  {
    id: "urea",
    card: "노폐물(요소)을 내보내 주세요!",
    organ: "excr",
    cargo: B6.urea,
    dir: "drop",
    done: "요소를 트럭이 <b>배설계</b>로 날라 오줌으로 내보냈어요! 주문 전부 완료!",
    fix: "요소는 콩팥 정수장에서 오줌으로 걸러 내보내죠 — 담당은 <b>배설계</b>예요.",
  },
];

export const bodyTeamLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as BtmStep;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge b6", dataset: { g: "inbound" } }, el("b", { text: "반입 주문 2건" }), el("span", { text: "배차 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "outbound" } }, el("b", { text: "반출 주문 2건" }), el("span", { text: "대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "hub" } }, el("b", { text: "운반의 주인공" }), el("span", { text: "판정 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "조직세포가 <b>세포호흡</b>을 돌리려고 주문을 넣었어요. 주문 카드를 읽고, 무대에서 <b>담당 기관계를 탭</b>해 배차하세요!",
  });

  const board = el("div", { class: "b6-board btm-board", html: stageScene() });
  const orderCard = el("div", { class: "btm-order", text: "" });
  board.appendChild(orderCard);

  const qBox = el("div", { class: "hook-choices btm-q" });
  qBox.style.display = "none";

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string, subText: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chipEl = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chipEl.classList.add("on");
    chipEl.querySelector("span")!.textContent = subText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      helper.innerHTML =
        "정리! <b>소화계(영양소)·호흡계(산소↔이산화 탄소)·배설계(요소)</b>가 각자 문을 맡고, 그 사이 모든 운반은 <b>순환계</b>가 해요 — 넷의 협력이 세포호흡을 떠받치죠.";
      api.enableCTA(s.cta ?? "정리하기");
    }
  }

  const truck = (): HTMLElement => board.querySelector(".btm-truck") as unknown as HTMLElement;
  const cargo = (): SVGCircleElement => board.querySelector(".btm-cargo") as SVGCircleElement;
  function truckTo(x: number, y: number): void {
    truck().style.transform = `translate(${x}px, ${y}px)`;
  }
  truckTo(CELL_PARK[0], CELL_PARK[1]);
  cargo().style.opacity = "0";

  let oi = 0;
  let busy = false;
  let delivered = { pick: 0, drop: 0 };

  function showOrder(): void {
    if (oi >= ORDERS.length) return;
    orderCard.textContent = `주문 ${oi + 1} — ${ORDERS[oi].card}`;
    orderCard.classList.remove("pop");
    void orderCard.offsetWidth;
    orderCard.classList.add("pop");
  }
  showOrder();

  board.addEventListener("click", (ev) => {
    const st = (ev.target as Element | null)?.closest(".btm-st") as HTMLElement | null;
    if (!st || busy || oi >= ORDERS.length) return;
    const order = ORDERS[oi];
    const organ = st.dataset.organ as OrganId;
    if (organ !== order.organ) {
      haptic(HAPTIC.wrong);
      board.classList.remove("shake");
      void board.offsetWidth;
      board.classList.add("shake");
      helper.innerHTML = order.fix;
      return;
    }
    busy = true;
    haptic(HAPTIC.tap);
    st.classList.add("hit");
    const [px, py] = PARK[order.organ];
    const c = cargo();
    c.setAttribute("fill", order.cargo);
    if (order.dir === "pick") {
      // 기관계에서 실어 세포로
      truckTo(px, py);
      later(() => {
        c.style.opacity = "1";
        truckTo(CELL_PARK[0], CELL_PARK[1]);
        later(() => {
          c.style.opacity = "0";
          arrive(order);
        }, 900);
      }, 900);
    } else {
      // 세포에서 실어 기관계로
      c.style.opacity = "1";
      truckTo(px, py);
      later(() => {
        c.style.opacity = "0";
        later(() => {
          truckTo(CELL_PARK[0], CELL_PARK[1]);
          arrive(order);
        }, 350);
      }, 950);
    }
  });
  board.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === " " || k.key === "Enter") {
      const t = (k.target as Element)?.closest(".btm-st");
      if (t) {
        k.preventDefault();
        (t as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    }
  });

  function arrive(order: (typeof ORDERS)[number]): void {
    helper.innerHTML = order.done;
    board.classList.add("burn");
    later(() => board.classList.remove("burn"), 900);
    delivered[order.dir === "pick" ? "pick" : "drop"]++;
    if (delivered.pick === 2) collect("inbound", "포도당·산소 도착!");
    if (delivered.drop === 2) collect("outbound", "이산화 탄소·요소 반출!");
    oi++;
    busy = false;
    if (oi < ORDERS.length) {
      later(showOrder, 1100);
    } else {
      orderCard.textContent = "주문 완료 — 세포호흡 가동 중!";
      later(askHub, 1200);
    }
  }

  let asked = false;
  function askHub(): void {
    if (asked) return;
    asked = true;
    b4Ask(
      qBox,
      "주문 네 건이 전부 끝났어요. 기관계들 <b>사이에서 물질을 실어 나른</b> 주인공은 누구였나요?",
      [
        { t: "순환계 — 모든 배달은 혈액의 몫", ok: true },
        { t: "소화계 — 영양소를 만드니까", ok: false },
        { t: "호흡계 — 산소를 들여오니까", ok: false },
      ],
      (ok) => {
        api.recordQuiz(ok);
        helper.innerHTML = ok
          ? "정확해요! 소화계·호흡계·배설계는 각자의 <b>문</b>이고, 문과 세포 사이 <b>모든 운반은 순환계</b>가 맡아요 — 트럭이 늘 같은 도로 위를 달렸죠."
          : "소화계와 호흡계는 물질을 <b>들여오는 문</b>일 뿐, 문에서 세포까지 나른 건 언제나 도로 위의 <b>순환계</b>였어요 — 트럭이 달린 그 분홍 고리요!";
        collect("hub", "순환계가 허브!");
      },
    );
  }

  host.append(goalChips, helper, board, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("주문 카드를 읽고 배차해 보세요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
