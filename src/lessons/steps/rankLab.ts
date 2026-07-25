// rankLab — 분류 체계 7단계(종 → 속 → 과 → 목 → 강 → 문 → 계)를 동심원의 확대로 체험하는 랩.
//  · 한가운데는 들고양이종. **종이 분류의 기본 단위**라는 것을 첫 국면에서 못 박는다.
//  · [한 단계 넓히기]를 누를 때마다 바깥에 새 원이 생기고, 그 단계에서 함께 묶이는 생물이 원 안으로 날아든다.
//    거꾸로 [한 단계 좁히기]를 누르면 방금 들어온 생물이 원 밖으로 빠져나간다.
//  · 단계마다 helper가 "여러 <아래 단계>이 모여 <위 단계>를 이뤄요"로 갱신되고, 무대 아래에 든 생물 수가 늘어난다.
//  · 마지막 국면은 판정 1회 — "다람쥐와 들고양이를 한 무리에 담으려면 어디까지 넓혀야 할까요?"
//
// ── 과학 정확성 가드(위반 금지) ───────────────────────────────────────────────
// 동심원은 **포함 관계**를 나타낸다. 좁은 단계는 넓은 단계 안에 통째로 들어가고, 그 반대는 성립하지 않는다.
// 무대에 등장하는 생물 수(최대 17종)는 이 무대에 올린 대표 생물의 수일 뿐, 실제 동물계의 종 수가 아니다.
// 계 단계에서 helper가 이 사실을 직접 말해 준다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3.css";
import "../../styles/bio3-class.css";

interface RankStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "wide" | "narrow" | "judge";
type Ctx = CanvasRenderingContext2D;
type CKind =
  | "cat" | "tiger" | "lion" | "dog" | "fox" | "bear"
  | "squirrel" | "bat" | "whale" | "fish" | "frog" | "bird"
  | "dragonfly" | "worm" | "octopus";

const CVH = 390;
const BASE_X = 360;
const TAU = Math.PI * 2;
const CX = 180;
// 무대 위쪽 y 14~48은 .stage-hud 읽기 필(DOM)이 차지하므로 가장 바깥 원이 그 아래에서 시작하게 잡는다.
const CY = 196;

const BIO = "#12B886";
const RING_DIM = "rgba(126, 147, 179, .38)";
const INK = "#CFE0F5";
const CORE_INK = "#FFD8A8";
const DARK = "#0B1524";

interface Rank {
  ch: string;   // 단계 이름 한 글자 — 동심원 띠 안에 그대로 쓴다
  full: string; // 이 무대에서의 실제 무리 이름
  r: number;    // 동심원 반지름(논리 좌표)
  join: string; // "여러 ○이 모여 …" 문구의 아래 단계 조사 포함형
}

// 반지름은 가장 바깥 띠의 생물 이름표(±24)까지 캔버스 안에 들어오도록 잡았다(최대 중심거리 140).
const RANKS: Rank[] = [
  { ch: "종", full: "들고양이종", r: 34, join: "" },
  { ch: "속", full: "고양이속", r: 54, join: "여러 <b>종</b>이 모여 <b>속</b>을 이뤄요." },
  { ch: "과", full: "고양이과", r: 74, join: "여러 <b>속</b>이 모여 <b>과</b>를 이뤄요." },
  { ch: "목", full: "식육목", r: 94, join: "여러 <b>과</b>가 모여 <b>목</b>을 이뤄요." },
  { ch: "강", full: "포유강", r: 114, join: "여러 <b>목</b>이 모여 <b>강</b>을 이뤄요." },
  { ch: "문", full: "척삭동물문", r: 132, join: "여러 <b>강</b>이 모여 <b>문</b>을 이뤄요." },
  { ch: "계", full: "동물계", r: 150, join: "여러 <b>문</b>이 모여 <b>계</b>를 이뤄요." },
];

const TOP = RANKS.length - 1;

const NOTE: string[] = [
  "분류의 기본 단위는 <b>종</b>이에요. 들고양이 한 종에서 출발해요.",
  "고양이속에 들고양이와 고양이가 함께 들어왔어요.",
  "고양이과에는 삵·호랑이·사자도 함께 들어와요.",
  "식육목에는 개·곰·여우처럼 이빨이 발달한 무리가 함께 들어와요.",
  "포유강에는 다람쥐·박쥐·고래도 들어와요. 모두 새끼를 낳아 젖을 먹여요.",
  "척삭동물문에는 붕어·개구리·갈매기처럼 등뼈가 있는 무리가 들어와요.",
  "동물계는 가장 큰 무리예요. 무대에는 17종만 올렸지만 실제로는 훨씬 더 많아요.",
];

interface MemberDef { id: string; name: string; band: number; shape: CKind; tap: string }

const MEMBERS: MemberDef[] = [
  { id: "wildcat", name: "들고양이", band: 0, shape: "cat", tap: "들고양이 — 분류의 기본 단위인 종이에요" },
  { id: "cat", name: "고양이", band: 1, shape: "cat", tap: "고양이 — 들고양이와 같은 고양이속이에요" },
  { id: "sark", name: "삵", band: 2, shape: "cat", tap: "삵 — 속은 다르지만 같은 고양이과예요" },
  { id: "tiger", name: "호랑이", band: 2, shape: "tiger", tap: "호랑이 — 고양이과에서 함께 묶여요" },
  { id: "lion", name: "사자", band: 2, shape: "lion", tap: "사자 — 고양이과에서 함께 묶여요" },
  { id: "dog", name: "개", band: 3, shape: "dog", tap: "개 — 과는 다르지만 같은 식육목이에요" },
  { id: "bear", name: "곰", band: 3, shape: "bear", tap: "곰 — 식육목에서 함께 묶여요" },
  { id: "fox", name: "여우", band: 3, shape: "fox", tap: "여우 — 식육목에서 함께 묶여요" },
  { id: "squirrel", name: "다람쥐", band: 4, shape: "squirrel", tap: "다람쥐 — 목은 다르지만 같은 포유강이에요" },
  { id: "bat", name: "박쥐", band: 4, shape: "bat", tap: "박쥐 — 날개가 있어도 포유강이에요" },
  { id: "whale", name: "고래", band: 4, shape: "whale", tap: "고래 — 바다에 살아도 포유강이에요" },
  { id: "carp", name: "붕어", band: 5, shape: "fish", tap: "붕어 — 강은 다르지만 같은 척삭동물문이에요" },
  { id: "frog", name: "개구리", band: 5, shape: "frog", tap: "개구리 — 척삭동물문에서 함께 묶여요" },
  { id: "gull", name: "갈매기", band: 5, shape: "bird", tap: "갈매기 — 척삭동물문에서 함께 묶여요" },
  { id: "dragonfly", name: "잠자리", band: 6, shape: "dragonfly", tap: "잠자리 — 문은 다르지만 같은 동물계예요" },
  { id: "worm", name: "지렁이", band: 6, shape: "worm", tap: "지렁이 — 동물계에서 함께 묶여요" },
  { id: "octopus", name: "문어", band: 6, shape: "octopus", tap: "문어 — 동물계에서 함께 묶여요" },
];

const COUNT_AT: number[] = RANKS.map((_, i) => MEMBERS.filter((m) => m.band <= i).length);

// ── 생물 실루엣(손코딩) ───────────────────────────────────────────────────────
interface QuadOpt { ear: "point" | "round" | "drop"; tail: "long" | "bushy" | "stub"; mane?: boolean; stripes?: boolean; bulk?: number }

function drawQuad(ctx: Ctx, x: number, y: number, r: number, color: string, o: QuadOpt): void {
  const k = o.bulk ?? 1;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, r * 0.14);
  // 꼬리
  ctx.save();
  if (o.tail === "bushy") ctx.lineWidth = Math.max(2.2, r * 0.3);
  ctx.beginPath();
  if (o.tail === "stub") {
    ctx.moveTo(x - r * 0.62, y - r * 0.02);
    ctx.lineTo(x - r * 0.8, y - r * 0.14);
  } else if (o.tail === "bushy") {
    ctx.moveTo(x - r * 0.6, y + r * 0.1);
    ctx.quadraticCurveTo(x - r * 1.06, y - r * 0.02, x - r * 0.88, y - r * 0.56);
  } else {
    ctx.moveTo(x - r * 0.62, y - r * 0.02);
    ctx.quadraticCurveTo(x - r * 1.02, y - r * 0.2, x - r * 0.92, y - r * 0.62);
  }
  ctx.stroke();
  ctx.restore();
  // 몸통
  ctx.beginPath();
  ctx.ellipse(x - r * 0.1, y + r * 0.06, r * 0.58 * k, r * 0.33 * k, 0, 0, TAU);
  ctx.fill();
  // 다리
  ctx.beginPath();
  for (const dx of [-0.46, -0.16, 0.16, 0.42]) {
    ctx.moveTo(x + r * dx, y + r * 0.3);
    ctx.lineTo(x + r * dx, y + r * 0.82);
  }
  ctx.stroke();
  // 갈기
  if (o.mane) {
    ctx.beginPath();
    ctx.arc(x + r * 0.6, y - r * 0.24, r * 0.46, 0, TAU);
    ctx.fill();
  }
  // 머리
  ctx.beginPath();
  ctx.arc(x + r * 0.6, y - r * 0.24, r * 0.3 * k, 0, TAU);
  ctx.fill();
  // 귀
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    if (o.ear === "round") {
      ctx.arc(x + r * (0.6 + dir * 0.22), y - r * 0.5, r * 0.14, 0, TAU);
      ctx.fill();
    } else if (o.ear === "drop") {
      ctx.ellipse(x + r * (0.6 + dir * 0.24), y - r * 0.32, r * 0.1, r * 0.2, dir * 0.4, 0, TAU);
      ctx.fill();
    } else {
      ctx.moveTo(x + r * (0.6 + dir * 0.08), y - r * 0.46);
      ctx.lineTo(x + r * (0.6 + dir * 0.3), y - r * 0.72);
      ctx.lineTo(x + r * (0.6 + dir * 0.36), y - r * 0.38);
      ctx.closePath();
      ctx.fill();
    }
  }
  // 줄무늬
  if (o.stripes) {
    ctx.save();
    ctx.strokeStyle = DARK;
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath();
    for (const dx of [-0.32, -0.08, 0.16]) {
      ctx.moveTo(x + r * dx, y - r * 0.16);
      ctx.lineTo(x + r * dx, y + r * 0.2);
    }
    ctx.stroke();
    ctx.restore();
  }
  // 눈
  ctx.save();
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.arc(x + r * 0.72, y - r * 0.3, Math.max(1, r * 0.08), 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawCreature(ctx: Ctx, kind: CKind, x: number, y: number, r: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, r * 0.15);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const eye = (ex: number, ey: number, er: number): void => {
    ctx.save();
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  switch (kind) {
    case "cat": drawQuad(ctx, x, y, r, color, { ear: "point", tail: "long" }); break;
    case "tiger": drawQuad(ctx, x, y, r, color, { ear: "round", tail: "long", stripes: true, bulk: 1.12 }); break;
    case "lion": drawQuad(ctx, x, y, r, color, { ear: "round", tail: "long", mane: true, bulk: 1.08 }); break;
    case "dog": drawQuad(ctx, x, y, r, color, { ear: "drop", tail: "long" }); break;
    case "fox": drawQuad(ctx, x, y, r, color, { ear: "point", tail: "bushy" }); break;
    case "bear": drawQuad(ctx, x, y, r, color, { ear: "round", tail: "stub", bulk: 1.28 }); break;
    case "squirrel": {
      ctx.beginPath(); ctx.ellipse(x - r * 0.06, y + r * 0.22, r * 0.4, r * 0.34, -0.2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.36, y - r * 0.24, r * 0.27, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.22, y - r * 0.42);
      ctx.lineTo(x + r * 0.24, y - r * 0.74);
      ctx.lineTo(x + r * 0.48, y - r * 0.48);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.lineWidth = Math.max(2.4, r * 0.34);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.38, y + r * 0.42);
      ctx.quadraticCurveTo(x - r * 1.02, y + r * 0.3, x - r * 0.84, y - r * 0.54);
      ctx.stroke();
      ctx.restore();
      eye(x + r * 0.48, y - r * 0.3, Math.max(1, r * 0.08));
      break;
    }
    case "bat": {
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.06, r * 0.24, r * 0.4, 0, 0, TAU); ctx.fill();
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + dir * r * 0.2, y - r * 0.22);
        ctx.quadraticCurveTo(x + dir * r * 0.7, y - r * 0.6, x + dir * r * 1.08, y - r * 0.26);
        ctx.quadraticCurveTo(x + dir * r * 0.86, y + r * 0.08, x + dir * r * 0.92, y + r * 0.34);
        ctx.quadraticCurveTo(x + dir * r * 0.62, y + r * 0.1, x + dir * r * 0.2, y + r * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + dir * r * 0.22, y - r * 0.34);
        ctx.lineTo(x + dir * r * 0.28, y - r * 0.72);
        ctx.lineTo(x + dir * r * 0.02, y - r * 0.42);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "whale": {
      ctx.beginPath();
      ctx.moveTo(x - r * 0.86, y + r * 0.06);
      ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.62, x + r * 0.6, y - r * 0.16);
      ctx.quadraticCurveTo(x + r * 0.88, y + r * 0.06, x + r * 0.48, y + r * 0.4);
      ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.66, x - r * 0.86, y + r * 0.06);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.78, y + r * 0.06);
      ctx.lineTo(x - r * 1.1, y - r * 0.36);
      ctx.lineTo(x - r * 1.08, y + r * 0.38);
      ctx.closePath(); ctx.fill();
      eye(x + r * 0.42, y - r * 0.1, Math.max(1, r * 0.08));
      break;
    }
    case "fish": {
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.74, r * 0.46, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.66, y);
      ctx.lineTo(x - r * 1.04, y - r * 0.4);
      ctx.lineTo(x - r * 1.04, y + r * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.18, y - r * 0.4);
      ctx.lineTo(x + r * 0.06, y - r * 0.82);
      ctx.lineTo(x + r * 0.28, y - r * 0.32);
      ctx.closePath(); ctx.fill();
      eye(x + r * 0.42, y - r * 0.1, Math.max(1, r * 0.09));
      break;
    }
    case "frog": {
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.16, r * 0.68, r * 0.46, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.4, r * 0.22, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.28, y - r * 0.4, r * 0.22, 0, TAU); ctx.fill();
      eye(x - r * 0.28, y - r * 0.43, Math.max(1, r * 0.09));
      eye(x + r * 0.28, y - r * 0.43, Math.max(1, r * 0.09));
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y + r * 0.34);
      ctx.quadraticCurveTo(x - r * 0.96, y + r * 0.56, x - r * 0.68, y + r * 0.76);
      ctx.moveTo(x + r * 0.6, y + r * 0.34);
      ctx.quadraticCurveTo(x + r * 0.96, y + r * 0.56, x + r * 0.68, y + r * 0.76);
      ctx.stroke();
      break;
    }
    case "bird": { // 날개를 편 새 — 좌우로 뻗은 날개 + 몸통 + 부리
      ctx.lineWidth = Math.max(1.8, r * 0.22);
      ctx.beginPath();
      ctx.moveTo(x - r * 1.05, y - r * 0.34);
      ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.9, x, y - r * 0.18);
      ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.9, x + r * 1.05, y - r * 0.34);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x - r * 0.05, y + r * 0.16, r * 0.38, r * 0.26, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.34, y + r * 0.1);
      ctx.lineTo(x - r * 0.74, y + r * 0.32);
      ctx.lineTo(x - r * 0.34, y + r * 0.36);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.34, y - r * 0.08, r * 0.21, 0, TAU); ctx.fill();
      ctx.save();
      ctx.fillStyle = "#F5A623";
      ctx.beginPath();
      ctx.moveTo(x + r * 0.5, y - r * 0.12);
      ctx.lineTo(x + r * 0.84, y - r * 0.03);
      ctx.lineTo(x + r * 0.5, y + r * 0.04);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      eye(x + r * 0.42, y - r * 0.15, Math.max(1, r * 0.08));
      break;
    }
    case "dragonfly": {
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.06, r * 0.16, r * 0.62, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - r * 0.62, r * 0.2, 0, TAU); ctx.fill();
      ctx.save();
      ctx.globalAlpha *= 0.75;
      for (const dir of [-1, 1]) {
        ctx.beginPath(); ctx.ellipse(x + dir * r * 0.52, y - r * 0.24, r * 0.46, r * 0.12, dir * 0.22, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + dir * r * 0.46, y + r * 0.14, r * 0.4, r * 0.11, -dir * 0.22, 0, TAU); ctx.fill();
      }
      ctx.restore();
      eye(x - r * 0.08, y - r * 0.66, Math.max(1, r * 0.08));
      eye(x + r * 0.08, y - r * 0.66, Math.max(1, r * 0.08));
      break;
    }
    case "worm": {
      ctx.save();
      ctx.lineWidth = Math.max(2.6, r * 0.34);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.9, y + r * 0.4);
      ctx.bezierCurveTo(x - r * 0.2, y - r * 0.6, x + r * 0.3, y + r * 0.7, x + r * 0.9, y - r * 0.3);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(x + r * 0.9, y - r * 0.3, r * 0.22, 0, TAU); ctx.fill();
      break;
    }
    case "octopus": {
      ctx.beginPath(); ctx.ellipse(x, y - r * 0.28, r * 0.46, r * 0.44, 0, 0, TAU); ctx.fill();
      ctx.lineWidth = Math.max(1.4, r * 0.16);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const sx = x - r * 0.42 + (i * r * 0.84) / 4;
        ctx.moveTo(sx, y + r * 0.02);
        ctx.quadraticCurveTo(sx + (i - 2) * r * 0.16, y + r * 0.52, sx + (i - 2) * r * 0.3, y + r * 0.82);
      }
      ctx.stroke();
      eye(x - r * 0.16, y - r * 0.36, Math.max(1, r * 0.09));
      eye(x + r * 0.16, y - r * 0.36, Math.max(1, r * 0.09));
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

interface Member extends MemberDef { ang: number; R: number; t: number; x: number; y: number }

export const rankLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as RankStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "wide" } }, el("b", { text: "계까지 넓히기" }), el("span", { text: "가장 큰 무리로" })),
    el("div", { class: "pn-badge bio", dataset: { g: "narrow" } }, el("b", { text: "종까지 좁히기" }), el("span", { text: "기본 단위로" })),
    el("div", { class: "pn-badge bio", dataset: { g: "judge" } }, el("b", { text: "단계 판정" }), el("span", { text: "한 번 맞히기" })),
  );
  const helper = el("div", {
    class: "helper",
    html: `${NOTE[0]} 아래 <b>한 단계 넓히기</b>를 눌러 무리를 넓혀 보세요.`,
  });
  const canvas = el("canvas", {
    class: "b3-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "들고양이종을 한가운데 두고 속·과·목·강·문·계로 넓어지는 동심원 무대",
    },
  });
  const readPill = el("span", { text: "들고양이종에서 출발해요" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${BIO}` }), readPill)),
    toast,
  );

  const stepsEl = el("div", { class: "rnk-steps" });
  const stepPills = RANKS.map((rk) => {
    const p = el("div", { class: "rnk-step", text: rk.ch });
    stepsEl.appendChild(p);
    return p;
  });
  const nameEl = el("div", { class: "rnk-name" });
  const slot = el("div", { class: "rnk-slot" });
  const controls = el(
    "div", { class: "b3-controls" },
    el("div", { class: "rnk-read" }, stepsEl, nameEl),
    slot,
  );
  host.append(goalsEl, helper, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_X;
  const scale = (): number => W / BASE_X;
  const sc = (v: number): number => v * scale();
  const fs = (v: number): number => Math.max(12, sc(v));
  /** 무대 높이를 가로 폭에 비례시켜, 넓은 화면에서 아래쪽 내용이 잘리지 않게 한다. */
  const sizeCanvas = (): void => {
    const w = canvas.getBoundingClientRect().width || BASE_X;
    const h = `${Math.round(CVH * (w / BASE_X))}px`;
    if (canvas.style.height !== h) canvas.style.height = h;
  };

  const goals = new Set<Goal>();
  let level = 0;
  let judging = false;
  let finished = false;
  let toastTimer = 0;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  const ringT: number[] = RANKS.map((_, i) => (i === 0 ? 1 : 0));

  const members: Member[] = MEMBERS.map((d) => {
    if (d.band === 0) return { ...d, ang: 0, R: 0, t: 1, x: CX, y: CY + 4 };
    const peers = MEMBERS.filter((m) => m.band === d.band);
    const idx = peers.findIndex((m) => m.id === d.id);
    // 위쪽 한 줄(단계 이름이 지나가는 자리)은 비워 둔다.
    const a0 = -Math.PI / 2 + 0.62;
    const span = TAU - 1.24;
    // 띠마다 위상을 어긋나게 준다 — 안 그러면 같은 인원수의 띠가 모두 같은 각도에 놓여 한 줄로 뭉친다.
    const frac = (((idx + 0.5) / peers.length) + d.band * 0.41) % 1;
    const ang = a0 + frac * span;
    const R = (RANKS[d.band].r + RANKS[d.band - 1].r) / 2;
    return { ...d, ang, R, t: 0, x: CX + Math.cos(ang) * R, y: CY + Math.sin(ang) * R };
  });

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2300);
  };

  const collect = (id: Goal, chipText: string, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = chipText;
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
    if (goals.size === 3 && !finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "분류 체계 정리하기");
    }
  };

  const syncRead = (): void => {
    stepPills.forEach((p, i) => {
      p.classList.toggle("on", i <= level);
      p.classList.toggle("now", i === level);
    });
    nameEl.innerHTML = `<b>${RANKS[level].full}</b> <span>· ${RANKS[level].ch} 단계 · 무대에 든 생물 ${COUNT_AT[level]}종</span>`;
    readPill.textContent = `${RANKS[level].full} · ${COUNT_AT[level]}종`;
  };

  const setLevel = (next: number, byUser: boolean): void => {
    const target = clamp(next, 0, TOP);
    if (target === level) return;
    const up = target > level;
    level = target;
    haptic(HAPTIC.tap);
    syncRead();
    if (byUser) {
      helper.innerHTML = up && level > 0
        ? `${RANKS[level].join} ${NOTE[level]}`
        : NOTE[level];
    }
    if (!judging) renderSlot(); // 판정 중에는 물음이 갈아 끼워지지 않게 둔다
    if (level === TOP) {
      collect("wide", "동물계 도착", "가장 큰 무리인 계까지 넓혔어요");
    }
    if (level === 0 && goals.has("wide")) {
      collect("narrow", "종이 기본 단위", "다시 종까지 좁혔어요. 종이 분류의 기본 단위예요");
      if (!goals.has("judge")) {
        later(() => {
          judging = true;
          helper.innerHTML = "마지막으로 한 가지만 판정해 볼까요. 아래 물음에 답해 보세요.";
          renderSlot();
        }, 1200);
      }
    }
  };

  // ── 조작부 ────────────────────────────────────────────────────────────
  function renderSlot(): void {
    slot.replaceChildren();
    if (judging && !goals.has("judge")) {
      slot.appendChild(el("div", {
        class: "rnk-q",
        html: "<b>다람쥐</b>와 <b>들고양이</b>를 한 무리에 담으려면 어느 단계까지 넓혀야 할까요?",
      }));
      const row = el("div", { class: "b3-row" });
      const choices = [
        { ch: "목", ok: false, why: "식육목에는 개·곰·여우가 들어오지만 다람쥐는 아직 들어오지 않아요." },
        { ch: "강", ok: true, why: "다람쥐는 포유강에서 처음 함께 들어왔어요. 둘 다 새끼를 낳아 젖을 먹여요." },
        { ch: "문", ok: false, why: "문까지 넓히면 붕어·개구리까지 함께 들어와요. 더 좁은 단계로도 담을 수 있어요." },
      ];
      for (const c of choices) {
        const b = el("button", { class: "b3-chip", attrs: { type: "button" }, dataset: { rnkPick: c.ch }, text: c.ch });
        b.addEventListener("click", () => {
          if (goals.has("judge")) return;
          if (!c.ok) {
            haptic(HAPTIC.wrong);
            b.classList.add("done");
            helper.innerHTML = `${c.why} 다시 골라 볼까요?`;
            return;
          }
          haptic(HAPTIC.correct);
          b.classList.add("on");
          helper.innerHTML = `${c.why} 두 생물이 같은 무리가 되는 <b>가장 좁은 단계</b>가 정답이에요.`;
          setLevel(4, false);
          collect("judge", "정확해요", "다람쥐와 들고양이는 포유강에서 만나요");
          later(() => {
            judging = false;
            renderSlot();
          }, 900);
        });
        row.appendChild(b);
      }
      slot.appendChild(row);
      return;
    }
    const nav = el("div", { class: "rnk-nav" });
    const wide = el("button", { class: "btn b3-btn", attrs: { type: "button" }, dataset: { rnkAct: "wide" }, text: "한 단계 넓히기" });
    wide.disabled = level >= TOP;
    wide.addEventListener("click", () => setLevel(level + 1, true));
    const narrow = el("button", { class: "btn b3-btn rnk-sub", attrs: { type: "button" }, dataset: { rnkAct: "narrow" }, text: "한 단계 좁히기" });
    narrow.disabled = level <= 0;
    narrow.addEventListener("click", () => setLevel(level - 1, true));
    nav.append(wide, narrow);
    slot.appendChild(nav);
    if (goals.has("judge")) {
      slot.appendChild(el("div", {
        class: "rnk-verdict",
        html: "좁은 단계일수록 <b>비슷한 생물끼리</b> 모이고, 넓은 단계일수록 <b>더 많은 생물</b>이 함께 들어와요. 가장 작은 기본 단위는 <b>종</b>이에요.",
      }));
    }
  }

  // ── 무대 탭: 생물 이름 보기 ───────────────────────────────────────────
  const onTap = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    let best: Member | null = null;
    let bestD = 22;
    for (const m of members) {
      if (m.t < 0.6) continue;
      const d = Math.hypot(px - m.x, py - m.y);
      if (d < bestD) { bestD = d; best = m; }
    }
    if (!best) return;
    haptic(HAPTIC.tap);
    toastMsg(best.tap);
  };
  canvas.addEventListener("pointerdown", onTap);

  // ── 그리기 ────────────────────────────────────────────────────────────
  const drawRings = (ctx: Ctx): void => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      const t = ringT[i];
      if (t < 0.02) {
        // 아직 열지 않은 단계는 점선으로 희미하게 — 앞으로 넓혀 갈 길이 보인다.
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = RING_DIM;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.arc(sc(CX), sc(CY), sc(RANKS[i].r), 0, TAU);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      const rr = RANKS[i].r * (0.86 + 0.14 * t);
      ctx.save();
      ctx.globalAlpha = t;
      // 가장 바깥 원 안쪽을 옅게 채워 "이 안에 든 무리"가 보이게 한다.
      if (i === level) {
        ctx.fillStyle = "rgba(18, 184, 134, .07)";
        ctx.beginPath();
        ctx.arc(sc(CX), sc(CY), sc(rr), 0, TAU);
        ctx.fill();
      }
      ctx.strokeStyle = i === level ? BIO : RING_DIM;
      ctx.lineWidth = i === level ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.arc(sc(CX), sc(CY), sc(rr), 0, TAU);
      ctx.stroke();
      // 단계 이름 한 글자를 그 띠 안(위쪽)에 쓴다
      const inner = i === 0 ? 0 : RANKS[i - 1].r;
      const ly = CY - (rr + inner * (0.86 + 0.14 * t)) / 2;
      ctx.fillStyle = i === level ? BIO : "#8FA3C0";
      ctx.font = `${i === level ? 900 : 700} ${fs(i === level ? 14 : 12.5)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(RANKS[i].ch, sc(CX), sc(ly));
      ctx.restore();
    }
  };

  const drawMembers = (ctx: Ctx, t: number): void => {
    for (const m of members) {
      if (m.t < 0.02) continue;
      const fly = 1 + (1 - m.t) * 0.6;
      const R = m.R * fly;
      m.x = m.band === 0 ? CX : CX + Math.cos(m.ang) * R;
      m.y = m.band === 0 ? CY + 3 : CY + Math.sin(m.ang) * R;
      const bob = Math.sin(t / 820 + m.ang * 3) * 0.9;
      const r = sc(m.band === 0 ? 11 : 11.5);
      ctx.save();
      ctx.globalAlpha = clamp(m.t * 1.3 - 0.15, 0, 1);
      drawCreature(ctx, m.shape, sc(m.x), sc(m.y + bob), r, m.band === 0 ? CORE_INK : INK);
      // 방금 들어온 무리(현재 바깥 띠)만 이름을 붙인다 — 나머지는 탭하면 이름이 나온다.
      if (m.band === level) {
        ctx.fillStyle = m.band === 0 ? CORE_INK : "#DCE7F7";
        ctx.font = `700 ${fs(12)}px Pretendard, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(m.name, sc(m.x), sc(m.y + bob) + r + sc(3));
      }
      ctx.restore();
    }
  };

  const loop: Loop = createLoop((dt, tMs) => {
    sizeCanvas();
    const fit = fitCanvas(canvas);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    for (let i = 0; i < ringT.length; i++) {
      const target = i <= level ? 1 : 0;
      ringT[i] += (target - ringT[i]) * Math.min(1, dt * 0.12);
    }
    for (const m of members) {
      const target = m.band <= level ? 1 : 0;
      m.t += (target - m.t) * Math.min(1, dt * 0.1);
    }
    drawRings(ctx);
    drawMembers(ctx, tMs);
  });

  syncRead();
  renderSlot();
  const onResize = (): void => { sizeCanvas(); fitCanvas(canvas); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("계까지 넓혔다가 다시 종까지 좁혀 보세요", { enabled: false });
  return () => {
    cancelAnimationFrame(rafId);
    window.clearTimeout(toastTimer);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    loop.stop();
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onTap);
  };
};
