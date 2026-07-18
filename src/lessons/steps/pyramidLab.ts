// pyramidLab — 인구 피라미드 판독 미니 랩(사회 Ⅱ L6). 성취기준 02-03 "구조를 비교하여 추론"의
// 자료 해석 장치 — 어려운 단원 서사형 원칙(개념 하나씩·탭만·드래그 없음)에 맞춘 소형 랩.
//   · 세 나라 세그(파키스탄·일본·카타르) → 피라미드가 계단 애니로 그려짐 → 나라마다 판독 질문
//     하나("더 넓은 층/불룩한 쪽을 그래프에서 직접 탭") → 존 탭 판정.
//   · 데이터는 UN 세계 인구 전망(2021) 근사 — 비상 34쪽 표의 앵커 값(파키스탄 0~4세 6.5/6.2%,
//     일본 65~69세 2.9/3.1% 등)과 정합하는 교육 모형. 축 상한은 미래엔 그래프와 동일(8·5·15%).
// 목표: ① 파키스탄 판독 ② 일본 판독 ③ 카타르 판독.
import { el } from "../../core/dom";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";

interface PyramidStep {
  title: string;
  lead?: string;
  cta?: string;
  curio?: Curio;
}

interface CountryDef {
  id: string;
  name: string;
  axisMax: number; // 한쪽 축 상한(%)
  m: number[]; // 0-4 → 85+ (18계급, 남)
  f: number[];
  question: string;
  mode: "band" | "sex"; // band = 유소년/노년 비교, sex = 남/여 비교
  answer: string; // 정답 존 id
  explain: string;
  wrong: Record<string, string>;
}

const AGES = ["0~4", "5~9", "10~14", "15~19", "20~24", "25~29", "30~34", "35~39", "40~44", "45~49", "50~54", "55~59", "60~64", "65~69", "70~74", "75~79", "80~84", "85+"];

const COUNTRIES: CountryDef[] = [
  {
    id: "pk",
    name: "파키스탄",
    axisMax: 8,
    m: [6.5, 6.1, 5.7, 5.5, 4.9, 4.3, 3.6, 3.0, 2.5, 2.1, 1.7, 1.4, 1.1, 0.9, 0.6, 0.35, 0.15, 0.06],
    f: [6.2, 5.8, 5.5, 5.5, 4.8, 4.2, 3.6, 3.0, 2.5, 2.1, 1.7, 1.4, 1.1, 0.9, 0.65, 0.4, 0.2, 0.08],
    question: "그래프의 <b>아래(유소년층)</b>와 <b>위(노년층)</b> — 어느 쪽이 더 넓은가요? 그 층을 <b>그래프에서 탭</b>!",
    mode: "band",
    answer: "young",
    explain: "아래가 묵직한 피라미드형! 태어나는 아이가 많아 유소년층이 두껍죠 — 앞으로 일할 사람이 계속 늘어나는 구조예요.",
    wrong: { old: "위(노년층)는 아주 좁아요 — 이 나라는 아래(유소년층)가 묵직한 피라미드형이에요.", mid: "가운데 말고, 아래(유소년층)와 위(노년층)를 비교해 봐요 — 어느 쪽이 넓나요?" },
  },
  {
    id: "jp",
    name: "일본",
    axisMax: 5,
    m: [1.7, 2.0, 2.1, 2.3, 2.5, 2.5, 2.6, 2.9, 3.3, 3.9, 3.4, 2.9, 2.8, 2.9, 3.4, 2.4, 1.6, 1.2],
    f: [1.6, 1.9, 2.0, 2.2, 2.3, 2.4, 2.5, 2.8, 3.2, 3.8, 3.4, 3.0, 2.9, 3.1, 3.8, 3.0, 2.4, 2.9],
    question: "이번엔 일본 — <b>아래(유소년층)</b>와 <b>위(노년층)</b>, 어느 쪽이 더 넓은가요? 그 층을 <b>탭</b>!",
    mode: "band",
    answer: "old",
    explain: "위가 더 넓은 역삼각형에 가까워요. 태어나는 아이는 줄고 노년층은 늘어나는 저출산·고령화의 모습이죠.",
    wrong: { young: "아래(유소년층)가 홀쭉해요 — 파키스탄과 반대로, 일본은 위(노년층)가 더 넓답니다.", mid: "가운데 말고, 아래(유소년층)와 위(노년층)를 비교해 봐요!" },
  },
  {
    id: "qa",
    name: "카타르",
    axisMax: 15,
    m: [1.5, 1.4, 1.2, 1.3, 4.5, 10.2, 13.0, 12.0, 9.5, 6.5, 4.5, 2.8, 1.5, 0.7, 0.3, 0.12, 0.05, 0.02],
    f: [1.5, 1.4, 1.3, 1.2, 1.7, 2.5, 3.0, 2.9, 2.4, 1.8, 1.3, 0.9, 0.5, 0.3, 0.15, 0.07, 0.03, 0.01],
    question: "석유 부국 카타르 — <b>남자(왼쪽)</b>와 <b>여자(오른쪽)</b>, 어느 쪽이 불룩한가요? 그쪽을 <b>탭</b>!",
    mode: "sex",
    answer: "male",
    explain: "청장년 남자만 불쑥! 건설 현장 등에서 일하려고 외국에서 온 남성 노동자가 많아서예요 — 태어나서가 아니라 이주해 와서 생긴 모양이죠.",
    wrong: { female: "여자 쪽은 홀쭉해요 — 일자리를 찾아 이주해 온 청장년 남성 쪽이 불룩하답니다." },
  },
];

// SVG 기하
const PW = 340;
const PH = 252;
const AXIS_X = PW / 2;
const TOP = 18;
const BAR_H = 11.4;
const BAR_GAP = 1.2;
const HALF_W = 128;

export const pyramidLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as PyramidStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalChips = el(
    "div",
    { class: "pn-badges force3" },
    el("div", { class: "pn-badge world", dataset: { g: "pk" } }, el("b", { text: "파키스탄" }), el("span", { text: "판독" })),
    el("div", { class: "pn-badge world", dataset: { g: "jp" } }, el("b", { text: "일본" }), el("span", { text: "판독" })),
    el("div", { class: "pn-badge world", dataset: { g: "qa" } }, el("b", { text: "카타르" }), el("span", { text: "판독" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "인구 피라미드는 <b>왼쪽이 남자, 오른쪽이 여자</b>, 아래에서 위로 나이가 많아져요. 나라를 바꿔 가며 <b>질문에 맞는 곳을 그래프에서 직접 탭</b>해 보세요.",
  });
  host.append(goalChips, helper);

  const seg = el("div", { class: "seg", style: "margin-top:4px" });
  const board = el("div", { class: "pyr-board" });
  const qCard = el("div", { class: "pyr-q" });
  host.append(seg, board, qCard);
  if (s.curio) host.appendChild(curioCard(s.curio));

  const goals = new Set<string>();
  let finished = false;
  function collect(id: string): void {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalChips.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = "완료!";
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === COUNTRIES.length && !finished) {
      finished = true;
      helper.innerHTML =
        "세 나라 판독 완료! <b>아래가 넓으면 아이가 많은 나라, 위가 넓으면 노년이 많은 나라</b> — 피라미드의 모양이 그 나라의 오늘과 내일을 말해 줘요.";
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다음");
    }
  }

  const btns = new Map<string, HTMLButtonElement>();
  for (const c of COUNTRIES) {
    const b = el("button", { text: c.name, attrs: { type: "button", "aria-pressed": "false" } }) as HTMLButtonElement;
    b.addEventListener("click", () => {
      haptic(HAPTIC.select);
      show(c.id);
    });
    btns.set(c.id, b);
    seg.appendChild(b);
  }

  let cur = "";
  let toastTimer = 0;
  function show(id: string): void {
    if (cur === id) return;
    cur = id;
    const c = COUNTRIES.find((k) => k.id === id)!;
    for (const [k, b] of btns) {
      b.classList.toggle("on", k === id);
      b.setAttribute("aria-pressed", String(k === id));
    }
    board.innerHTML = pyramidSvg(c, goals.has(c.id));
    qCard.classList.remove("ok");
    qCard.innerHTML = goals.has(c.id) ? `<b>${c.name}</b> — ${c.explain}` : c.question;
    if (goals.has(c.id)) qCard.classList.add("ok");
    // 존 탭 바인딩
    board.querySelectorAll<SVGElement>(".pyr-zone").forEach((z) => {
      z.addEventListener("click", () => {
        if (goals.has(c.id) || finished) return;
        const zid = z.dataset.z!;
        if (zid === c.answer) {
          haptic(HAPTIC.correct);
          collect(c.id);
          qCard.classList.add("ok");
          qCard.innerHTML = `<b>정답!</b> ${c.explain}`;
          board.innerHTML = pyramidSvg(c, true);
        } else {
          haptic(HAPTIC.wrong);
          qCard.innerHTML = c.wrong[zid] ?? "다시 봐요 — 질문이 가리키는 곳을 탭!";
          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => {
            if (!goals.has(c.id)) qCard.innerHTML = c.question;
          }, 2600);
        }
      });
    });
  }

  show("pk");
  api.setCTA("세 나라를 모두 판독해요", { enabled: false });
  return () => window.clearTimeout(toastTimer);
};

function pyramidSvg(c: CountryDef, solved: boolean): string {
  const y = (i: number): number => TOP + (AGES.length - 1 - i) * (BAR_H + BAR_GAP);
  const wOf = (v: number): number => (v / c.axisMax) * HALF_W;
  let bars = "";
  for (let i = 0; i < AGES.length; i++) {
    const mw = wOf(c.m[i]);
    const fw = wOf(c.f[i]);
    const yy = y(i);
    bars += `<rect class="pyr-bar m" style="--i:${i}" x="${(AXIS_X - 1.5 - mw).toFixed(1)}" y="${yy.toFixed(1)}" width="${mw.toFixed(1)}" height="${BAR_H}" rx="2" fill="#4E7CB8"/>`;
    bars += `<rect class="pyr-bar f" style="--i:${i}" x="${AXIS_X + 1.5}" y="${yy.toFixed(1)}" width="${fw.toFixed(1)}" height="${BAR_H}" rx="2" fill="#E2758A"/>`;
  }
  // 연령 경계선(15세·65세)과 층 라벨
  const y15 = y(3) + BAR_H + BAR_GAP / 2; // 15~19 막대의 아래 = 15세 경계
  const y65 = y(13) + BAR_H + BAR_GAP / 2; // 65~69 막대의 아래 = 65세 경계
  const bandGuides = `
    <line x1="16" y1="${y15.toFixed(1)}" x2="${PW - 16}" y2="${y15.toFixed(1)}" stroke="#AAB4C4" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="16" y1="${y65.toFixed(1)}" x2="${PW - 16}" y2="${y65.toFixed(1)}" stroke="#AAB4C4" stroke-width="1" stroke-dasharray="4 4"/>
    <text x="${PW - 18}" y="${(y65 - 6).toFixed(1)}" class="pyr-band" text-anchor="end">노년층(65세~)</text>
    <text x="${PW - 18}" y="${(y65 + 14).toFixed(1)}" class="pyr-band" text-anchor="end">청장년층</text>
    <text x="${PW - 18}" y="${(y15 + 14).toFixed(1)}" class="pyr-band" text-anchor="end">유소년층(0~14세)</text>`;
  // 탭 존 — band 모드: 유소년/청장년/노년 가로 띠, sex 모드: 좌/우 반쪽
  const zones =
    c.mode === "band"
      ? `<rect class="pyr-zone" data-z="old" x="8" y="${TOP - 6}" width="${PW - 16}" height="${(y65 - TOP + 6).toFixed(1)}" rx="8"/>
         <rect class="pyr-zone" data-z="mid" x="8" y="${y65.toFixed(1)}" width="${PW - 16}" height="${(y15 - y65).toFixed(1)}" rx="8"/>
         <rect class="pyr-zone" data-z="young" x="8" y="${y15.toFixed(1)}" width="${PW - 16}" height="${(y(0) + BAR_H - y15 + 6).toFixed(1)}" rx="8"/>`
      : `<rect class="pyr-zone" data-z="male" x="8" y="${TOP - 6}" width="${(AXIS_X - 10).toFixed(1)}" height="${(y(0) + BAR_H - TOP + 12).toFixed(1)}" rx="8"/>
         <rect class="pyr-zone" data-z="female" x="${(AXIS_X + 2).toFixed(1)}" y="${TOP - 6}" width="${(AXIS_X - 10).toFixed(1)}" height="${(y(0) + BAR_H - TOP + 12).toFixed(1)}" rx="8"/>`;
  const axisLab = `
    <text x="${(AXIS_X - HALF_W / 2).toFixed(1)}" y="${PH - 4}" class="pyr-axis" text-anchor="middle">남자</text>
    <text x="${(AXIS_X + HALF_W / 2).toFixed(1)}" y="${PH - 4}" class="pyr-axis" text-anchor="middle">여자</text>
    <text x="${AXIS_X}" y="${TOP - 6}" class="pyr-axis" text-anchor="middle">나이 ↑ (맨 위 85세~)</text>
    <text x="${(AXIS_X - HALF_W).toFixed(1)}" y="${PH - 4}" class="pyr-axis" text-anchor="start">${c.axisMax}%</text>
    <text x="${(AXIS_X + HALF_W).toFixed(1)}" y="${PH - 4}" class="pyr-axis" text-anchor="end">${c.axisMax}%</text>`;
  return `<svg viewBox="0 0 ${PW} ${PH}" xmlns="http://www.w3.org/2000/svg" fill="none" role="img"
      aria-label="${c.name}의 인구 피라미드 — 연령별 남녀 인구 비율 막대그래프">
    <line x1="${AXIS_X}" y1="${TOP - 2}" x2="${AXIS_X}" y2="${(y(0) + BAR_H + 3).toFixed(1)}" stroke="#C4CFDC" stroke-width="1.2"/>
    ${bars}
    ${bandGuides}
    ${axisLab}
    ${solved ? "" : zones}
  </svg>`;
}
