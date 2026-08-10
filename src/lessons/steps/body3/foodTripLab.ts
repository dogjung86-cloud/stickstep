// [중2 Ⅵ v3] L2 foodTripLab — 「소화 여행 3편」.
// 한 통찰: 소화효소는 담당 영양소에만 작용한다 — 같은 길을 가도 분해되는 정거장이 다르다.
// (교과서 208~209쪽 그림 VI-4 「영양소의 소화 과정」의 여행판: 녹말=입·작은창자 /
//  단백질=위·작은창자 / 지방=작은창자. 최종 산물 = 포도당·아미노산·지방산+모노글리세라이드.)
// 조작: 영양소 카드 선택 → "다음 정거장" 버튼 반복 → 정거장 연출 → 여행 끝 판정(b4Ask) → 다음 영양소.
// rAF·캔버스 없음 — 토큰은 CSS translate 트랙 이동, 상태는 그룹 표시 전환.

import { el } from "../../../core/dom";
import { haptic, HAPTIC } from "../../../core/haptics";
import { curioCard, type Curio } from "../../../ui/curio";
import { b4Ask } from "../../../ui/bio4Kit";
import { B6 } from "../../../ui/body3Kit";
import type { StepRenderer } from "../../types";

interface FtpStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

type NutId = "starch" | "protein" | "fat";

/** 구슬 사슬/조각/낱알 — 영양소 상태 표현(색만 다름). */
function beads(kind: "chain" | "piece" | "grain" | "blob" | "drops" | "fatFinal", color: string): string {
  if (kind === "chain")
    return `<path d="M-30 0 h60" stroke="${color}" stroke-width="3"/>` +
      [-30, -18, -6, 6, 18, 30].map((x) => `<circle cx="${x}" cy="0" r="6" fill="${color}"/>`).join("");
  if (kind === "piece")
    return [-26, -20, 2, 8, 24].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 3 : -3}" r="6" fill="${color}"/>`).join("") +
      `<path d="M-26 0 h6 M2 0 h6" stroke="${color}" stroke-width="3"/>`;
  if (kind === "grain")
    return [-28, -14, 0, 14, 28].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 4 : -4}" r="5" fill="${color}"/>`).join("");
  if (kind === "blob") return `<ellipse cx="0" cy="0" rx="16" ry="12" fill="${color}"/><ellipse cx="-5" cy="-4" rx="5" ry="3.4" fill="#FFFFFF" opacity="0.5"/>`;
  if (kind === "drops") return [-18, -6, 6, 18].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 4 : -4}" r="5.5" fill="${color}"/>`).join("");
  // fatFinal: 지방산(짧은 막대) + 모노글리세라이드(작은 원)
  return `<rect x="-27" y="-2.5" width="13" height="5" rx="2.5" fill="${color}"/><rect x="-9" y="-2.5" width="13" height="5" rx="2.5" fill="${color}"/>
    <rect x="9" y="-2.5" width="13" height="5" rx="2.5" fill="${color}"/><circle cx="30" cy="0" r="5" fill="#FFC078"/>`;
}

const NUTS: Record<NutId, {
  name: string; color: string; final: string;
  states: [string, string, string, string]; // 입 뒤 · 위 뒤 · 작은창자 뒤 · 도착(=작은창자 뒤와 동일 표시)
  msgs: { mouth: string; stomach: string; small: string; arrive: string };
  badge: { mouth?: string; stomach?: string; small: string };
}> = {
  starch: {
    name: "녹말",
    color: B6.carb,
    final: "포도당",
    states: ["piece", "piece", "grain", "grain"],
    msgs: {
      mouth: "입에서 <b>침</b>이 섞였어요 — 침 속 <b>아밀레이스</b>가 녹말 사슬을 잘라 <b>엿당</b>으로! 여행의 첫 가위질이에요.",
      stomach: "위에서는… 아무 일도 없어요. 위의 소화효소(펩신)는 <b>녹말 담당이 아니거든요</b>. 엿당인 채로 통과!",
      small: "작은창자에서 <b>이자액의 아밀레이스</b>가 마지막 가위질 — 엿당이 <b>포도당</b> 낱알로 완전히 분해됐어요!",
      arrive: "여행 끝! 녹말은 <b>포도당</b>이 되어 작은창자에서 흡수될 준비를 마쳤어요.",
    },
    badge: { mouth: "아밀레이스(침)", small: "아밀레이스(이자액)" },
  },
  protein: {
    name: "단백질",
    color: B6.protein,
    final: "아미노산",
    states: ["chain", "piece", "grain", "grain"],
    msgs: {
      mouth: "입에서는 이로 잘게 부서지고 침과 섞일 뿐 — 침의 아밀레이스는 <b>단백질을 못 잘라요</b>. 사슬 그대로 통과!",
      stomach: "위에 도착! 위액 속 <b>펩신</b>이 <b>염산의 도움</b>을 받아 단백질 사슬을 싹둑싹둑 — 첫 분해예요. 염산은 음식물 속 세균도 잡아 주죠.",
      small: "작은창자에서 <b>이자액의 트립신</b>이 이어받아 조각을 더 잘게 — 마침내 <b>아미노산</b> 낱알이 됐어요!",
      arrive: "여행 끝! 단백질은 <b>아미노산</b>이 되어 흡수될 준비 완료.",
    },
    badge: { stomach: "펩신+염산", small: "트립신(이자액)" },
  },
  fat: {
    name: "지방",
    color: B6.fat,
    final: "지방산·모노글리세라이드",
    states: ["blob", "blob", "fatFinal", "fatFinal"],
    msgs: {
      mouth: "입에서는 변화 없음 — 침의 아밀레이스는 <b>지방 담당이 아니에요</b>. 기름 방울 그대로 출발!",
      stomach: "위에서도 변화 없음 — 펩신은 <b>단백질 전담</b>이라 지방은 건드리지 못해요. 끝까지 버티는 기름 방울!",
      small: "드디어 작은창자! <b>쓸개즙</b>이 기름 방울을 잘게 흩어 주고(소화효소는 아니지만 소화를 돕죠), <b>이자액의 라이페이스</b>가 <b>지방산과 모노글리세라이드</b>로 분해했어요!",
      arrive: "여행 끝! 지방은 <b>지방산과 모노글리세라이드</b>가 되어 흡수될 준비를 마쳤어요.",
    },
    badge: { small: "쓸개즙+라이페이스" },
  },
};

const STOPS = ["mouth", "stomach", "small", "arrive"] as const;
const STOP_Y = [40, 100, 160, 208];

function stageScene(): string {
  const station = (y: number, label: string): string =>
    `<g><rect x="52" y="${y - 19}" width="72" height="38" rx="12" fill="#FFFFFF" stroke="#F1D9D5" stroke-width="2.4"/>
     <text x="88" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="800" fill="#4E5968">${label}</text></g>`;
  return `<svg viewBox="0 0 340 236" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M88 40 v168" stroke="#F1D9D5" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 9"/>
    <path d="M200 40 v168" stroke="#F8E4E0" stroke-width="3" stroke-dasharray="2 8"/>
    ${station(40, "입")}
    <text x="132" y="74" font-size="11" font-weight="700" fill="#B0B8C1">식도</text>
    ${station(100, "위")}
    ${station(160, "작은창자")}
    <g><rect x="44" y="190" width="88" height="36" rx="12" fill="#FFF0F0" stroke="#F3B9B9" stroke-width="2.4"/>
     <text x="88" y="213" text-anchor="middle" font-size="13" font-weight="800" fill="#E23B4B">흡수 준비!</text></g>
    <g class="ftp-token" aria-hidden="true"></g>
  </svg>`;
}

export const foodTripLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as FtpStep;
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
    el("div", { class: "pn-badge b6", dataset: { g: "starch" } }, el("b", { text: "녹말 여행" }), el("span", { text: "출발 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "protein" } }, el("b", { text: "단백질 여행" }), el("span", { text: "출발 대기" })),
    el("div", { class: "pn-badge b6", dataset: { g: "fat" } }, el("b", { text: "지방 여행" }), el("span", { text: "출발 대기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "소화관은 하나의 긴 여행길이에요. 첫 여행자로 <b>녹말</b>을 골라, <b>다음 정거장</b> 버튼으로 길을 따라가 보세요.",
  });

  const board = el("div", { class: "b6-board ftp-board", html: stageScene() });
  const badge = el("div", { class: "ftp-badge", text: "" });
  badge.style.opacity = "0";
  board.appendChild(badge);

  const nutRow = el("div", { class: "ftp-nutrow" });
  const nutBtns = new Map<NutId, HTMLButtonElement>();
  (Object.keys(NUTS) as NutId[]).forEach((id) => {
    const n = NUTS[id];
    const b = el("button", { class: "ftp-nut", attrs: { type: "button" } }, el("span", { class: "ftp-nutdot" }), el("span", { text: n.name })) as HTMLButtonElement;
    (b.querySelector(".ftp-nutdot") as HTMLElement).style.background = n.color;
    b.addEventListener("click", () => selectNut(id));
    nutBtns.set(id, b);
    nutRow.appendChild(b);
  });
  const goBtn = el("button", { class: "ftp-go", text: "다음 정거장으로", attrs: { type: "button" } }) as HTMLButtonElement;
  goBtn.style.display = "none";

  const qBox = el("div", { class: "hook-choices ftp-q" });
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
        "세 여행 완주! 소화효소는 <b>자기 담당 영양소에만</b> 작용해요 — 녹말은 <b>입·작은창자</b>, 단백질은 <b>위·작은창자</b>, 지방은 <b>작은창자</b>에서 분해된답니다.";
      api.enableCTA(s.cta ?? "흡수 이야기로");
    }
  }

  // ── 상태 ──
  let cur: NutId | null = null;
  let stopIdx = -1; // -1 = 출발 전(입 위쪽)
  let busy = false;
  const token = (): SVGGElement => board.querySelector(".ftp-token") as SVGGElement;

  function drawToken(kind: string, color: string, y: number): void {
    const t = token();
    t.innerHTML = beads(kind as Parameters<typeof beads>[0], color);
    t.setAttribute("transform", `translate(200 ${y})`);
    t.classList.remove("hop");
    void (t as unknown as HTMLElement).getBoundingClientRect?.();
    t.classList.add("hop");
  }

  function showBadge(text: string): void {
    badge.textContent = text;
    badge.style.opacity = "1";
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
    later(() => (badge.style.opacity = "0"), 1900);
  }

  function selectNut(id: NutId): void {
    if (busy || goals.has(id) || (cur && !goals.has(cur))) return;
    cur = id;
    stopIdx = -1;
    nutBtns.forEach((b, k) => b.classList.toggle("cur", k === id));
    const n = NUTS[id];
    drawToken(id === "fat" ? "blob" : "chain", n.color, 14);
    goBtn.style.display = "";
    helper.innerHTML = `<b>${n.name}</b>이 출발선에 섰어요. <b>다음 정거장</b> 버튼으로 여행을 시작해요!`;
    later(() => goBtn.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  goBtn.addEventListener("click", () => {
    if (!cur || busy) return;
    if (stopIdx >= STOPS.length - 1) return;
    busy = true;
    haptic(HAPTIC.tap);
    stopIdx++;
    const n = NUTS[cur];
    const stop = STOPS[stopIdx];
    const y = STOP_Y[stopIdx];
    const kind = stopIdx === 0 ? n.states[0] : stopIdx === 1 ? n.states[1] : n.states[2];
    drawToken(kind, n.color, y);
    const badgeText = stop === "mouth" ? n.badge.mouth : stop === "stomach" ? n.badge.stomach : stop === "small" ? n.badge.small : undefined;
    if (badgeText) later(() => showBadge(badgeText), 420);
    helper.innerHTML = n.msgs[stop];
    later(() => {
      busy = false;
      if (stop === "arrive") {
        goBtn.style.display = "none";
        askTrip(cur!);
      }
    }, stop === "arrive" ? 600 : 900);
  });

  const TRIP_Q: Record<NutId, { q: string; c: { t: string; ok: boolean }[]; sub: string }> = {
    starch: {
      q: "방금 여행에서, 녹말이 <b>처음으로 분해되기 시작한</b> 정거장은 어디였나요?",
      c: [
        { t: "입 — 침의 아밀레이스", ok: true },
        { t: "위 — 펩신", ok: false },
        { t: "작은창자 — 이자액", ok: false },
      ],
      sub: "입에서 첫 가위질!",
    },
    protein: {
      q: "단백질이 <b>처음으로 분해된</b> 정거장은 어디였나요?",
      c: [
        { t: "위 — 펩신이 염산의 도움으로", ok: true },
        { t: "입 — 침의 아밀레이스", ok: false },
        { t: "식도 — 지나가면서 저절로", ok: false },
      ],
      sub: "위에서 첫 분해!",
    },
    fat: {
      q: "지방이 소화효소에 분해된 정거장은 어디<b>뿐</b>이었나요?",
      c: [
        { t: "작은창자 — 라이페이스(+쓸개즙의 도움)", ok: true },
        { t: "입에서부터 줄곧 분해됐다", ok: false },
        { t: "위와 작은창자 두 곳", ok: false },
      ],
      sub: "작은창자 한 곳!",
    },
  };

  function askTrip(id: NutId): void {
    const def = TRIP_Q[id];
    b4Ask(qBox, def.q, def.c, (ok) => {
      if (id === "starch") api.recordQuiz(ok);
      const n = NUTS[id];
      helper.innerHTML = ok
        ? `정답! ${n.msgs.arrive} 최종 산물 이름표 — <b>${n.final}</b>, 꼭 기억해요.`
        : `여행 장면을 되감아 봐요 — ${n.msgs.arrive} 정답 정거장과 최종 산물 <b>${n.final}</b>을 함께 붙잡아 두세요.`;
      collect(id, `${n.final}!`);
      later(() => {
        qBox.style.display = "none";
        qBox.innerHTML = "";
        nutBtns.get(id)!.classList.add("done");
        cur = null;
        if (!finished) {
          const next = (Object.keys(NUTS) as NutId[]).find((k) => !goals.has(k));
          if (next) helper.innerHTML = `다음 여행자 — <b>${NUTS[next].name}</b> 카드를 골라 주세요!`;
        }
      }, 1500);
    });
  }

  host.append(goalChips, helper, board, nutRow, goBtn, qBox);
  if (s.curio) host.appendChild(curioCard(s.curio));

  api.setCTA("영양소를 골라 여행을 시작해요", { enabled: false });
  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
  };
};
