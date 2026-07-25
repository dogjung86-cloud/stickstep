// kingdomKeyLab — 예/아니요 갈림길(검색표)을 따라가며 생물 카드를 5계로 분류하는 랩.
//  · 갈림길 순서(정본, 바꾸지 말 것)
//    ① 유전물질이 핵막으로 싸여 있나요? → 아니요 = 원핵생물계
//    ② (예) 균계·식물계·동물계가 아닌 무리인가요? → 예 = 원생생물계
//    ③ (아니요) 광합성을 하나요? → 예 = 식물계
//    ④ (아니요) 세포벽이 없고 스스로 움직이나요? → 예 = 동물계 / 아니요 = 균계
//  · 카드마다 특징 3~4줄이 붙어 있어 그 카드만 읽고도 판단할 수 있다(자기완결).
//  · 틀리면 **몇 번 갈림길에서 어긋났는지**를 카드의 특징으로 짚어 주고 다시 고르게 한다.
//
// ── 과학 정확성 가드(위반 금지) ───────────────────────────────────────────────
//  · 원핵생물계는 **핵막이 없을 뿐 세포벽은 있다**(세포벽이 없는 무리가 아니다).
//  · 균계는 세포벽이 있고 광합성을 하지 않으며, 죽은 생물이나 배설물을 분해해 양분을 얻는다.
//  · 효모는 세포 하나로 이루어졌지만 균계다(세포 수는 계를 가르는 기준이 아니다).
//  · 다시마는 광합성을 해도 뿌리·줄기·잎의 구분이 없어 **식물계가 아니라 원생생물계**다.
//  · 원생생물계는 "핵막이 있는 생물 중 균계·식물계·동물계가 아닌 나머지" 무리다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import { kingdomTableHtml } from "../../ui/bio3Figures";
import type { StepRenderer } from "../types";
import "../../styles/bio3.css";
import "../../styles/bio3-class.css";

interface KingdomKeyStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "pro" | "prot" | "rest";
type Ctx = CanvasRenderingContext2D;
type Kingdom = "원핵생물계" | "원생생물계" | "식물계" | "동물계" | "균계";
type SKind = "rod" | "pine" | "amoeba" | "mushroom" | "yeast" | "kelp" | "fern" | "bird";

// 무대 높이(가로 폭 비례). 생물 카드를 무대 **위**로 올리면서, 카드·검색표·예/아니요가
// 한 화면에 들어오도록 낮췄다(구 380 — 실사용 피드백 2026-07-26: 카드가 무대 아래라
// 특징을 읽고 다시 스크롤을 올려 검색표를 봐야 했다).
const CVH = 338;
const BASE_X = 360;
const TAU = Math.PI * 2;

const BIO = "#12B886";
const DIM = "rgba(126, 147, 179, .42)";
const NODE_BG = "rgba(16, 28, 48, .72)";
const DARK = "#0B1524";

// 무대 위쪽 y 14~48은 .stage-hud 읽기 필(DOM)이 차지한다 — 첫 질문 노드는 그 아래에서 시작한다.
const QX = 118, QW = 132, QH = 42;
// 갈림길 세로 간격 66 → 56(박스 높이 42 + 여백 14). 카드를 무대 위로 올리면서 전체를
// 한 화면에 담기 위해 압축했다 — 간격만 줄이고 **잎 노드는 하나도 잘리지 않게** CVH를 함께 맞춘다.
const QY = [72, 132, 192, 252];
const RX = 288, RW = 112, RH = 38;
const TOKX = 28;

const KING_COLOR: Record<Kingdom, string> = {
  원핵생물계: "#A896FF",
  원생생물계: "#3FC5DC",
  식물계: "#5AD48F",
  동물계: "#6FA8FF",
  균계: "#F79A4A",
};
/** 결과 노드 자리 — 앞의 넷은 오른쪽 열, 균계는 ④의 아래쪽 끝. */
const KING_POS: Record<Kingdom, { x: number; y: number }> = {
  원핵생물계: { x: RX, y: QY[0] },
  원생생물계: { x: RX, y: QY[1] },
  식물계: { x: RX, y: QY[2] },
  동물계: { x: RX, y: QY[3] },
  균계: { x: QX, y: 312 },
};
/** 각 계에 이르는 정답 경로(예 = true). 갈림길 순서는 위 주석의 정본과 같다. */
const PATH: Record<Kingdom, boolean[]> = {
  원핵생물계: [false],
  원생생물계: [true, true],
  식물계: [true, false, true],
  동물계: [true, false, false, true],
  균계: [true, false, false, false],
};

const QUESTIONS = [
  "유전물질이 <em>핵막</em>으로 싸여 있나요?",
  "균계·식물계·동물계가 <em>아닌</em> 무리인가요?",
  "<em>광합성</em>을 하나요?",
  "<em>세포벽이 없고</em> 스스로 움직이나요?",
];
const Q_SHORT = ["핵막", "나머지 무리", "광합성", "세포벽·운동"];
const Q_HELP = [
  "카드의 특징을 읽고 <b>①번 갈림길</b>부터 따라가요. 유전물질이 핵막에 싸여 있는지 보세요.",
  "<b>②번 갈림길</b>이에요. 균계·식물계·동물계의 특징이 하나도 없으면 나머지 무리예요.",
  "<b>③번 갈림길</b>이에요. 스스로 양분을 만드는지 보세요.",
  "<b>④번 갈림길</b>이에요. 세포벽이 있는지, 스스로 움직이는지 보세요.",
];
/** 갈림길마다 되새길 규칙 — 오답 교정문의 뒤쪽에 붙는다. */
const RULE = [
  "핵막이 없는 무리만 원핵생물계예요. 핵막이 없을 뿐 세포벽은 있어요.",
  "핵막이 있는 생물 중 균계·식물계·동물계가 아닌 나머지가 원생생물계예요.",
  "광합성을 해서 스스로 양분을 만드는 무리가 식물계예요.",
  "세포벽이 없고 스스로 움직이면 동물계, 세포벽이 있고 분해해 양분을 얻으면 균계예요.",
];

/** 받침 여부로 은/는을 고른다(대장균은 · 다시마는). */
function josa(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "는";
  return code % 28 === 0 ? "는" : "은";
}

interface Card {
  id: string;
  name: string;
  kingdom: Kingdom;
  shape: SKind;
  facts: string[];
  /** 갈림길마다 그 답의 근거가 되는 이 카드의 특징(오답 교정에 쓴다). */
  why: string[];
  reason: string;
}

// 8장 — 다섯 계를 모두 담고, 마지막 카드에서 목표가 완성되도록 순서를 정했다.
const CARDS: Card[] = [
  {
    id: "coli", name: "대장균", kingdom: "원핵생물계", shape: "rod",
    facts: [
      "세포 하나로 이루어져 있어요.",
      "유전물질이 <b>핵막에 싸여 있지 않아요</b>.",
      "세포벽이 있고, 가는 꼬리로 움직여요.",
    ],
    why: ["대장균은 유전물질이 핵막에 싸여 있지 않아요."],
    reason: "핵막이 없는 무리는 원핵생물계예요. 핵막이 없을 뿐 <b>세포벽은 있어요</b>.",
  },
  {
    id: "pine", name: "소나무", kingdom: "식물계", shape: "pine",
    facts: [
      "핵막이 있는 세포가 여럿 모여 있어요.",
      "뿌리·줄기·잎이 뚜렷해요.",
      "잎에서 <b>광합성</b>을 해 스스로 양분을 만들어요.",
    ],
    why: [
      "소나무의 세포에는 핵막이 있어요.",
      "소나무는 뿌리·줄기·잎이 뚜렷하고 광합성을 해요. 식물계로 더 좁혀 갈 수 있는 무리예요.",
      "소나무는 잎에서 광합성을 해요.",
    ],
    reason: "광합성을 해서 스스로 양분을 만드는 무리가 식물계예요.",
  },
  {
    id: "amoeba", name: "아메바", kingdom: "원생생물계", shape: "amoeba",
    facts: [
      "핵막이 있는 세포 <b>하나</b>로 이루어져 있어요.",
      "정해진 모양 없이 몸을 늘여 움직이며 먹이를 잡아요.",
      "뿌리·줄기·잎의 구분도, 균사도 없어요.",
    ],
    why: [
      "아메바의 세포에는 핵막이 있어요.",
      "아메바는 균계·식물계·동물계 어느 쪽 특징도 갖고 있지 않아요.",
    ],
    reason: "핵막이 있는 생물 중 균계·식물계·동물계가 아닌 <b>나머지</b> 무리가 원생생물계예요.",
  },
  {
    id: "mushroom", name: "송이버섯", kingdom: "균계", shape: "mushroom",
    facts: [
      "핵막이 있는 세포가 여럿 모여 있어요.",
      "몸이 실 같은 균사로 이루어져 있고 <b>세포벽이 있어요</b>.",
      "광합성을 하지 않고, 죽은 생물이나 배설물을 <b>분해해</b> 양분을 얻어요.",
      "스스로 움직이지 않아요.",
    ],
    why: [
      "송이버섯의 세포에는 핵막이 있어요.",
      "송이버섯은 균사로 이루어져 있고 분해해 양분을 얻어요. 균계로 더 좁혀 갈 수 있는 무리예요.",
      "송이버섯은 광합성을 하지 않고 분해해서 양분을 얻어요.",
      "송이버섯은 세포벽이 있고 스스로 움직이지 않아요.",
    ],
    reason: "세포벽이 있고 광합성을 하지 않으며 분해해 양분을 얻는 무리가 균계예요.",
  },
  {
    id: "yeast", name: "효모", kingdom: "균계", shape: "yeast",
    facts: [
      "핵막이 있는 세포 <b>하나</b>로 이루어져 있어요.",
      "세포벽이 있고 광합성을 하지 않아요.",
      "양분을 분해해 얻고, 몸에 혹이 돋아 나며 수가 늘어요.",
    ],
    why: [
      "효모의 세포에는 핵막이 있어요.",
      "효모는 세포벽이 있고 분해해 양분을 얻어요. 균계로 더 좁혀 갈 수 있는 무리예요.",
      "효모는 광합성을 하지 않아요.",
      "효모는 세포벽이 있고 스스로 헤엄쳐 다니지 않아요.",
    ],
    reason: "효모는 세포 <b>하나</b>로 이루어졌지만 균계예요. 세포 수가 아니라 세포벽과 양분을 얻는 방법이 갈림길이에요.",
  },
  {
    id: "kelp", name: "다시마", kingdom: "원생생물계", shape: "kelp",
    facts: [
      "핵막이 있는 세포가 여럿 모여 있어요.",
      "<b>광합성</b>을 해요.",
      "겉모습은 잎 같지만 <b>뿌리·줄기·잎의 구분이 없어요</b>.",
    ],
    why: [
      "다시마의 세포에는 핵막이 있어요.",
      "다시마는 광합성을 하지만 뿌리·줄기·잎의 구분이 없어요. 식물계에 넣을 수 없는 나머지 무리예요.",
    ],
    reason: "다시마는 광합성을 해도 <b>식물계가 아니라 원생생물계</b>예요. 미역·김도 같은 무리랍니다.",
  },
  {
    id: "fern", name: "고사리", kingdom: "식물계", shape: "fern",
    facts: [
      "핵막이 있는 세포가 여럿 모여 있어요.",
      "뿌리·줄기·잎이 뚜렷하고 잎에서 <b>광합성</b>을 해요.",
      "꽃이 피지 않고 포자로 번식해요.",
    ],
    why: [
      "고사리의 세포에는 핵막이 있어요.",
      "고사리는 뿌리·줄기·잎이 뚜렷하고 광합성을 해요. 식물계로 더 좁혀 갈 수 있는 무리예요.",
      "고사리는 잎에서 광합성을 해요.",
    ],
    reason: "꽃이 피지 않고 포자로 번식해도, 광합성을 하고 뿌리·줄기·잎이 있으면 식물계예요.",
  },
  {
    id: "bird", name: "박새", kingdom: "동물계", shape: "bird",
    facts: [
      "핵막이 있는 세포가 여럿 모여 있어요.",
      "<b>세포벽이 없고</b> 스스로 날아다녀요.",
      "벌레와 씨앗을 먹어 양분을 얻어요.",
    ],
    why: [
      "박새의 세포에는 핵막이 있어요.",
      "박새는 세포벽이 없고 스스로 움직여 먹이를 먹어요. 동물계로 더 좁혀 갈 수 있는 무리예요.",
      "박새는 광합성을 하지 않아요.",
      "박새는 세포벽이 없고 스스로 움직여 먹이를 먹어요.",
    ],
    reason: "세포벽이 없고 스스로 움직이며 먹이를 먹는 무리가 동물계예요.",
  },
];

// ── 생물 실루엣(손코딩) ───────────────────────────────────────────────────────
function drawSpecimen(ctx: Ctx, kind: SKind, x: number, y: number, r: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.3, r * 0.14);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const dot = (dx: number, dy: number, dr: number): void => {
    ctx.save();
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  switch (kind) {
    case "rod": { // 대장균 — 막대 몸통 + 채찍 같은 꼬리
      ctx.beginPath();
      ctx.roundRect(x - r * 0.72, y - r * 0.28, r * 1.3, r * 0.56, r * 0.28);
      ctx.fill();
      ctx.beginPath();
      for (const dy of [-0.16, 0.16]) {
        ctx.moveTo(x + r * 0.58, y + r * dy);
        ctx.quadraticCurveTo(x + r * 0.9, y + r * (dy + 0.3), x + r * 1.15, y + r * (dy - 0.1));
      }
      ctx.stroke();
      break;
    }
    case "pine": { // 소나무 — 줄기 + 삼각 층
      ctx.save();
      ctx.strokeStyle = "#9A7B5A";
      ctx.lineWidth = Math.max(1.6, r * 0.18);
      ctx.beginPath(); ctx.moveTo(x, y + r * 0.94); ctx.lineTo(x, y + r * 0.4); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const base = y + r * 0.5 - i * r * 0.44;
        const w = r * (0.72 - i * 0.15);
        ctx.beginPath();
        ctx.moveTo(x, base - r * 0.72);
        ctx.lineTo(x + w, base);
        ctx.lineTo(x - w, base);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "amoeba": { // 아메바 — 위족이 뻗은 불규칙 몸 + 핵
      ctx.beginPath();
      ctx.moveTo(x - r * 0.86, y - r * 0.1);
      ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.86, x + r * 0.06, y - r * 0.52);
      ctx.quadraticCurveTo(x + r * 0.44, y - r * 0.92, x + r * 0.78, y - r * 0.34);
      ctx.quadraticCurveTo(x + r * 1.0, y + r * 0.2, x + r * 0.4, y + r * 0.5);
      ctx.quadraticCurveTo(x + r * 0.1, y + r * 0.96, x - r * 0.38, y + r * 0.56);
      ctx.quadraticCurveTo(x - r * 0.94, y + r * 0.46, x - r * 0.86, y - r * 0.1);
      ctx.fill();
      dot(x + r * 0.08, y + r * 0.02, r * 0.19);
      break;
    }
    case "mushroom": { // 송이버섯 — 갓 + 자루
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y - r * 0.08);
      ctx.quadraticCurveTo(x, y - r * 1.0, x + r * 0.8, y - r * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x - r * 0.22, y - r * 0.12, r * 0.44, r * 0.98, r * 0.16);
      ctx.fill();
      break;
    }
    case "yeast": { // 효모 — 둥근 세포 + 돋아 나는 혹 + 핵
      ctx.beginPath(); ctx.ellipse(x - r * 0.12, y + r * 0.08, r * 0.58, r * 0.52, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + r * 0.56, y - r * 0.42, r * 0.28, r * 0.26, 0, 0, TAU); ctx.fill();
      dot(x - r * 0.12, y + r * 0.08, r * 0.17);
      break;
    }
    case "kelp": { // 다시마 — 물결치는 긴 엽상체 + 뿌리 모양 부착기
      ctx.save();
      ctx.lineWidth = Math.max(3, r * 0.42);
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.94);
      ctx.bezierCurveTo(x - r * 0.6, y + r * 0.3, x + r * 0.6, y - r * 0.2, x - r * 0.1, y - r * 0.92);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      for (const dx of [-0.34, 0, 0.34]) {
        ctx.moveTo(x, y + r * 0.9);
        ctx.lineTo(x + r * dx, y + r * 1.1);
      }
      ctx.stroke();
      break;
    }
    case "fern": { // 고사리 — 줄기 + 깃 모양 잔잎
      ctx.beginPath();
      ctx.moveTo(x - r * 0.1, y + r * 0.96);
      ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.1, x - r * 0.04, y - r * 0.86);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const ty = y + r * 0.68 - i * r * 0.38;
        const w = r * (0.66 - i * 0.1);
        for (const dir of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x + r * 0.05, ty);
          ctx.quadraticCurveTo(x + dir * w * 0.7, ty - r * 0.06, x + dir * w, ty - r * 0.28);
          ctx.quadraticCurveTo(x + dir * w * 0.5, ty + r * 0.06, x + r * 0.05, ty);
          ctx.fill();
        }
      }
      break;
    }
    case "bird": { // 박새 — 통통한 몸 + 날개 + 부리
      ctx.beginPath(); ctx.ellipse(x - r * 0.06, y + r * 0.16, r * 0.48, r * 0.4, -0.2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.42, y - r * 0.34, r * 0.3, 0, TAU); ctx.fill();
      ctx.save();
      ctx.fillStyle = DARK;
      ctx.beginPath(); ctx.ellipse(x - r * 0.14, y + r * 0.1, r * 0.26, r * 0.16, -0.3, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.5, y + r * 0.34);
      ctx.lineTo(x - r * 0.94, y + r * 0.56);
      ctx.lineTo(x - r * 0.5, y + r * 0.62);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.fillStyle = "#F5A623";
      ctx.beginPath();
      ctx.moveTo(x + r * 0.66, y - r * 0.38);
      ctx.lineTo(x + r * 0.98, y - r * 0.26);
      ctx.lineTo(x + r * 0.66, y - r * 0.18);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      dot(x + r * 0.5, y - r * 0.42, r * 0.09);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

export const kingdomKeyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as KingdomKeyStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "pro" } }, el("b", { text: "원핵생물계" }), el("span", { text: "1종 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "prot" } }, el("b", { text: "원생생물계" }), el("span", { text: "1종 찾기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "rest" } }, el("b", { text: "나머지 세 계" }), el("span", { text: "0 / 3" })),
  );
  const helper = el("div", { class: "helper", html: Q_HELP[0] });
  const canvas = el("canvas", {
    class: "b3-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "예와 아니요로 갈라지는 검색표 위에서 생물 카드가 다섯 계 중 하나로 내려가는 무대",
    },
  });
  const readPill = el("span", { text: "첫 번째 생물" });
  // 이 랩에는 토스트를 두지 않는다 — 목표 칩·helper·카드 피드백이 이미 같은 문장을 세 번 말하고,
  // 무대 하단에는 균계 잎과 ④번 노드가 붙어 있어 어디에 띄워도 노드를 가린다(실측).
  const stage = el(
    "div", { class: "stage b3-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${BIO}` }), readPill)),
  );
  const controls = el("div", { class: "b3-controls" });
  // 지금 분류 중인 생물 카드 — 무대(검색표) **위**에 둔다. 갈림길 질문에 답하려면
  // 카드의 특징을 보면서 검색표를 따라가야 하므로 둘이 한 화면에 있어야 한다.
  const specimen = el("div", { class: "kkl-specimen" });
  host.append(goalsEl, helper, specimen, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_X;
  const scale = (): number => W / BASE_X;
  const sc = (v: number): number => v * scale();
  const fs = (v: number): number => Math.max(12, sc(v));

  const goals = new Set<Goal>();
  const counts = new Map<Kingdom, number>();
  const restDone = new Set<Kingdom>();
  let ci = 0;
  let qi = 0;
  let locked = false;
  let done = false;
  let finished = false;
  let flash = 0;
  let fb: { kind: "good" | "bad"; html: string } | null = null;
  /** 지금 카드가 지나온 답 — 검색표에서 지나온 길만 초록으로 밝힌다. */
  let trail: boolean[] = [];
  let tokX = TOKX;
  let tokY = QY[0] - 28;
  let tarX = TOKX;
  let tarY = QY[0];
  /** 무대 높이를 가로 폭에 비례시켜, 넓은 화면에서 아래쪽 내용이 잘리지 않게 한다. */
  const sizeCanvas = (): void => {
    const w = canvas.getBoundingClientRect().width || BASE_X;
    const h = `${Math.round(CVH * (w / BASE_X))}px`;
    if (canvas.style.height !== h) canvas.style.height = h;
  };

  const collect = (id: Goal, chipText: string, _msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = chipText;
    haptic(HAPTIC.ctaUnlock);
    if (goals.size === 3 && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "다섯 계 정리하기");
    }
  };

  // ── 판정 ──────────────────────────────────────────────────────────────
  const classify = (card: Card): void => {
    locked = true;
    counts.set(card.kingdom, (counts.get(card.kingdom) ?? 0) + 1);
    const pos = KING_POS[card.kingdom];
    // 균계는 왼쪽 열 끝이라 노드 왼쪽에, 나머지는 가지 아래 빈자리에 내려 앉는다(가지 라벨과 겹치지 않게).
    if (card.kingdom === "균계") { tarX = pos.x - QW / 2 - 20; tarY = pos.y; }
    else { tarX = (QX + QW / 2 + RX - RW / 2) / 2; tarY = pos.y + 25; }
    flash = 1;
    haptic(HAPTIC.correct);
    readPill.textContent = `${card.name} → ${card.kingdom}`;
    helper.innerHTML = `${card.name}${josa(card.name)} <b>${card.kingdom}</b>예요.`;
    fb = { kind: "good", html: `<b>${card.name} · ${card.kingdom}</b><br>${card.reason}` };
    render();
    if (card.kingdom === "원핵생물계") collect("pro", `${card.name} 완료`, "핵막이 없는 무리 — 원핵생물계를 찾았어요");
    if (card.kingdom === "원생생물계") collect("prot", `${card.name} 완료`, "나머지 무리 — 원생생물계를 찾았어요");
    if (card.kingdom === "균계" || card.kingdom === "식물계" || card.kingdom === "동물계") {
      restDone.add(card.kingdom);
      const chip = goalsEl.querySelector('[data-g="rest"] span') as HTMLElement;
      if (!goals.has("rest")) chip.textContent = `${restDone.size} / 3`;
      if (restDone.size >= 3) collect("rest", "세 계 완료", "균계·식물계·동물계까지 모두 찾았어요");
    }
  };

  const answer = (v: boolean): void => {
    if (locked || done) return;
    const card = CARDS[ci];
    const want = PATH[card.kingdom][qi];
    if (v !== want) {
      haptic(HAPTIC.wrong);
      fb = {
        kind: "bad",
        html: `<b>${qi + 1}번 갈림길</b>을 다시 봐요. ${card.why[qi]} ${RULE[qi]}`,
      };
      render();
      return;
    }
    trail = trail.concat(v);
    haptic(HAPTIC.select);
    const ends = (qi === 0 && !v) || (qi === 1 && v) || (qi === 2 && v) || qi === 3;
    if (ends) {
      classify(card);
      return;
    }
    qi += 1;
    tarY = QY[qi];
    fb = null;
    helper.innerHTML = Q_HELP[qi];
    render();
  };

  const nextCard = (): void => {
    if (ci >= CARDS.length - 1) {
      done = true;
      fb = null;
      helper.innerHTML = "여덟 생물을 모두 갈림길에 태웠어요. <b>같은 순서의 물음</b>을 따라가면 누구나 같은 계에 도착해요.";
      readPill.textContent = "다섯 계 분류 완료";
      render();
      return;
    }
    ci += 1;
    qi = 0;
    locked = false;
    trail = [];
    fb = null;
    tokX = TOKX;
    tokY = QY[0] - 28;
    tarX = TOKX;
    tarY = QY[0];
    helper.innerHTML = Q_HELP[0];
    readPill.textContent = `${ci + 1}번째 생물`;
    render();
  };

  // ── 조작부 ────────────────────────────────────────────────────────────
  function render(): void {
    controls.replaceChildren();
    specimen.replaceChildren();
    if (done) {
      // 다 분류하고 나면 다섯 무리를 한 표로 견준다 — 검색표(어떻게 갈라지나) 다음의 정리다.
      // 표 데이터·마크업은 ui/bio3Figures의 kingdomTableHtml이 단일 진실 공급원(L9 recap과 공유).
      specimen.appendChild(el("div", { class: "kkl-sum" },
        el("div", { class: "kkl-sum-h", text: "다섯 무리를 한 표로" }),
        el("div", { html: kingdomTableHtml() }),
      ));
      controls.appendChild(el("div", {
        class: "kkl-verdict",
        html: "핵막이 없으면 <b>원핵생물계</b>, 핵막이 있는 나머지 무리는 <b>원생생물계</b>예요. 광합성을 하면 <b>식물계</b>, 세포벽이 없고 스스로 움직이면 <b>동물계</b>, 세포벽이 있고 분해해 양분을 얻으면 <b>균계</b>예요.",
      }));
      return;
    }
    const card = CARDS[ci];
    const cardEl = el(
      "div", { class: "kkl-card compact" },
      el(
        "div", { class: "kkl-head" },
        el("div", { class: "kkl-name", text: card.name }),
        el("div", { class: "kkl-idx", text: `${ci + 1} / ${CARDS.length}` }),
      ),
    );
    // 특징 목록은 **답하기 전까지만** 보여 준다. 답한 뒤에는 판단 근거로서의 역할이 끝났고,
    // 그 자리를 결과와 다음 버튼이 대신해야 카드가 커지지 않아 무대가 화면 밖으로 밀리지 않는다
    // (실사용 피드백 2026-07-26: "다음 생물 보기"가 맨 아래에 있어 스크롤해야 했다).
    if (!locked) {
      const facts = el("ul", { class: "kkl-facts" });
      for (const f of card.facts) facts.appendChild(el("li", { html: f }));
      cardEl.appendChild(facts);
    }
    specimen.appendChild(cardEl);
    // 갈림길 질문과 예/아니요는 **카드 안**에 둔다(실사용 피드백 2026-07-26) —
    // 판단 근거(특징)와 판단 행동(답)이 한 카드에 모여야 시선이 오가지 않는다.
    // 무대는 그 아래에서 '결과'(토큰이 내려가는 길)를 보여 주는 역할만 맡는다.
    if (!locked) {
      cardEl.appendChild(el("div", { class: "kkl-ask" },
        el("div", { class: "kkl-q", html: `<b>${qi + 1}</b>. ${QUESTIONS[qi]}` }),
        (() => {
          const yn = el("div", { class: "kkl-yn tight" });
          for (const [label, v] of [["예", true], ["아니요", false]] as [string, boolean][]) {
            const b = el("button", { class: "b3-chip", attrs: { type: "button" }, dataset: { kklAns: String(v) }, text: label });
            b.addEventListener("click", () => answer(v));
            yn.appendChild(b);
          }
          return yn;
        })(),
      ));
    }
    if (locked) {
      const ask = el("div", { class: "kkl-ask" });
      if (fb) ask.appendChild(el("div", { class: `kkl-fb ${fb.kind}`, html: fb.html }));
      const b = el("button", {
        class: "btn b3-btn kkl-next",
        attrs: { type: "button" },
        dataset: { kklAct: "next" },
        text: ci >= CARDS.length - 1 ? "분류 정리 보기" : "다음 생물 보기",
      });
      b.addEventListener("click", nextCard);
      ask.appendChild(b);
      cardEl.appendChild(ask);
      return;
    }
    if (fb) controls.appendChild(el("div", { class: `kkl-fb ${fb.kind}`, html: fb.html }));
  }

  // ── 그리기 ────────────────────────────────────────────────────────────
  const nodeBox = (ctx: Ctx, cx: number, cy: number, w: number, h: number, color: string, on: boolean): void => {
    ctx.fillStyle = NODE_BG;
    ctx.strokeStyle = on ? color : DIM;
    ctx.lineWidth = on ? 2 : 1.2;
    ctx.beginPath();
    ctx.roundRect(sc(cx - w / 2), sc(cy - h / 2), sc(w), sc(h), sc(12));
    ctx.fill();
    ctx.stroke();
  };

  const link = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number, label: string, lx: number, ly: number, on: boolean, align: CanvasTextAlign): void => {
    ctx.save();
    ctx.strokeStyle = on ? BIO : DIM;
    ctx.lineWidth = on ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.moveTo(sc(x1), sc(y1));
    ctx.lineTo(sc(x2), sc(y2));
    ctx.stroke();
    ctx.fillStyle = on ? BIO : "#8FA3C0";
    ctx.font = `800 ${fs(12)}px Pretendard, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(label, sc(lx), sc(ly));
    ctx.restore();
  };

  const drawKey = (ctx: Ctx): void => {
    // 갈림길 사이의 길 — 지나온 길만 초록
    const passed = (i: number, v: boolean): boolean => trail.length > i && trail[i] === v;
    for (let i = 0; i < 4; i++) {
      const yesRight = i > 0; // ①만 "아니요"가 오른쪽으로 빠진다
      const rightLabel = yesRight ? "예" : "아니요";
      const downLabel = yesRight ? "아니요" : "예";
      link(ctx, QX + QW / 2, QY[i], RX - RW / 2, QY[i], rightLabel, (QX + QW / 2 + RX - RW / 2) / 2, QY[i] - 13,
        passed(i, yesRight), "center");
      const nextY = i < 3 ? QY[i + 1] : KING_POS["균계"].y;
      link(ctx, QX, QY[i] + QH / 2, QX, nextY - (i < 3 ? QH / 2 : RH / 2), downLabel, QX + 10, (QY[i] + QH / 2 + nextY) / 2 - 3,
        passed(i, !yesRight), "left");
    }
    // 질문 노드
    for (let i = 0; i < 4; i++) {
      const on = !done && !locked && i === qi;
      nodeBox(ctx, QX, QY[i], QW, QH, BIO, on);
      ctx.save();
      ctx.fillStyle = on ? BIO : "#8FA3C0";
      ctx.beginPath();
      ctx.arc(sc(QX - QW / 2 + 18), sc(QY[i]), sc(9), 0, TAU);
      ctx.fill();
      ctx.fillStyle = DARK;
      ctx.font = `900 ${fs(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), sc(QX - QW / 2 + 18), sc(QY[i]) + 0.5);
      ctx.fillStyle = on ? "#EAF4FF" : "#A9BBD6";
      ctx.font = `${on ? 800 : 700} ${fs(12.5)}px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(Q_SHORT[i], sc(QX - QW / 2 + 33), sc(QY[i]));
      ctx.restore();
    }
    // 결과 노드
    const card = CARDS[ci];
    for (const k of Object.keys(KING_POS) as Kingdom[]) {
      const pos = KING_POS[k];
      const w = k === "균계" ? QW : RW;
      const isHit = locked && card.kingdom === k;
      const n = counts.get(k) ?? 0;
      ctx.save();
      if (isHit) {
        ctx.shadowColor = KING_COLOR[k];
        ctx.shadowBlur = 10 + flash * 14;
      }
      nodeBox(ctx, pos.x, pos.y, w, RH, KING_COLOR[k], isHit || n > 0);
      ctx.shadowBlur = 0;
      ctx.fillStyle = isHit || n > 0 ? KING_COLOR[k] : "#8FA3C0";
      ctx.font = `800 ${fs(12.5)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(k, sc(pos.x - (n > 0 ? 9 : 0)), sc(pos.y));
      if (n > 0) {
        ctx.fillStyle = KING_COLOR[k];
        ctx.beginPath();
        ctx.arc(sc(pos.x + w / 2 - 17), sc(pos.y), sc(9), 0, TAU);
        ctx.fill();
        ctx.fillStyle = DARK;
        ctx.font = `900 ${fs(12)}px Pretendard, sans-serif`;
        ctx.fillText(String(n), sc(pos.x + w / 2 - 17), sc(pos.y) + 0.5);
      }
      ctx.restore();
    }
  };

  const loop: Loop = createLoop((dt) => {
    sizeCanvas();
    const fit = fitCanvas(canvas);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    tokX += (tarX - tokX) * Math.min(1, dt * 0.12);
    tokY += (tarY - tokY) * Math.min(1, dt * 0.12);
    if (flash > 0) flash = clamp(flash - dt * 0.03, 0, 1);
    drawKey(ctx);
    if (!done) {
      const card = CARDS[ci];
      ctx.save();
      ctx.globalAlpha = locked ? 0.92 : 1;
      drawSpecimen(ctx, card.shape, sc(tokX), sc(tokY), sc(14), locked ? KING_COLOR[card.kingdom] : "#FFD8A8");
      ctx.restore();
    }
  });

  render();
  const onResize = (): void => { sizeCanvas(); fitCanvas(canvas); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("갈림길을 따라 여덟 생물을 분류해 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    loop.stop();
    window.removeEventListener("resize", onResize);
  };
};
