// classifyLab — "기준을 바꾸면 결과가 달라진다"를 손으로 발견시키는 분류 랩.
//  · 국면 1(느낌 기준): 색깔·귀여움·먹을 수 있음처럼 사람의 느낌에 기대는 기준으로 12종을 두 무리로 나눈다.
//    애매한 생물에 물음표가 붙고, [다른 친구는 어떻게 나눴을까요]를 누르면 그 생물들이 반대쪽으로 옮겨 간다.
//    같은 기준인데 결과가 달라지는 것을 눈으로 본다.
//  · 국면 2(고유한 특징): 광합성·날개·젖처럼 생물이 가진 고유한 특징으로 나누면 물음표가 사라지고,
//    친구가 나눈 결과도 똑같다. "누가 나눠도 같은 결과"가 분류 기준의 조건이다.
//  · 국면 3(박쥐의 자리): 같은 고유한 특징이라도 무엇을 보느냐에 따라 무리가 달라진다.
//    날개로 나누면 박쥐는 갈매기와, 젖으로 나누면 박쥐는 다람쥐와 묶인다. 두 결과를 나란히 놓고 판정한다.
//
// ── 과학 정확성 가드(위반 금지) ───────────────────────────────────────────────
// 분류 기준은 **생물이 가지고 있는 고유한 특징**이어야 한다. 사람의 느낌(귀엽다·맛있다)이나 보는 사람에
// 따라 달라지는 성질은 기준이 될 수 없다. 그리고 겉모습 한 가지만으로는 생물 사이의 가까운 정도를 알 수 없다.
// 박쥐는 날개가 있어 갈매기와 비슷해 보이지만, 새끼를 낳아 젖을 먹이고 몸이 털로 덮여 있어 다람쥐와 한 무리다.

import { clamp, el } from "../../core/dom";
import { createLoop, type Loop } from "../../core/anim";
import { fitCanvas } from "../../ui/canvas";
import { haptic, HAPTIC } from "../../core/haptics";
import { curioCard, type Curio } from "../../ui/curio";
import type { StepRenderer } from "../types";
import "../../styles/bio3.css";
import "../../styles/bio3-class.css";

interface ClassifyStep { title: string; lead?: string; cta?: string; curio?: Curio }
type Goal = "mixed" | "unique" | "bat";
type Phase = "mixed" | "unique" | "bat";
type Ctx = CanvasRenderingContext2D;
type Shape =
  | "grain" | "grass" | "weed" | "tree" | "pine"
  | "fish" | "frog" | "dog" | "whale" | "gull" | "bat" | "squirrel";

// 무대 높이 — 아래 기준 버튼과 한 화면에 들어오도록 낮췄다(구 440). 조작하는 동안 무대의
// 분류 결과가 바뀌는 장면을 함께 봐야 하기 때문이다(실사용 피드백 2026-07-26 — 누르고 나서
// 위로 스크롤해야 결과가 보였다). diversityLab이 같은 문제를 먼저 푼 선례다.
// 조작부를 무대 위로 올리지 않은 이유 = "연타하는 손이 무대를 가린다"는 전 과목 배치 규칙.
// 논리 좌표계는 언제나 360 × CVH — 캔버스 실폭에 비례해 통째로 확대·축소된다.
const CVH = 262;
const BASE_X = 360; // 논리 좌표계의 가로 기준(캔버스 실폭에 비례해 배치)
const TAU = Math.PI * 2;

const PLANT_INK = "#57D9A3";
const ANIMAL_INK = "#CFE0F5";
const FOCUS_INK = "#FFC078";
const YES_INK = "#12B886";
const NO_INK = "#6EA8FF";
const DARK = "#0B1524";

// 무대 위쪽 y 14~48은 .stage-hud의 읽기 필(DOM)이 차지한다 — 캔버스 내용은 그 아래에서 시작한다.
// 필은 DOM이라 화면이 좁아져도 줄지 않는데 캔버스는 폭에 비례해 줄어든다 — 좁은 화면(360)에서
// 무리 이름표가 필 밑으로 파고들지 않도록 시작선을 넉넉히 잡았다.
const HEAD_Y = 68;
const ZONE = { top: 86, bottom: 248, lx: 8, rx: 188, w: 164 };
const DIV_X = 180; // 두 무리를 가르는 점선

interface BeingDef {
  id: string; name: string; shape: Shape; plant: boolean;
  photo: boolean; wing: boolean; milk: boolean;
  green: boolean; cute: boolean; eat: boolean;
  trait: string;
}

// 12종 — 원 자료의 분류 활동 구성(식물 5 · 동물 7)을 따른다.
const BEINGS: BeingDef[] = [
  { id: "bori", name: "보리", shape: "grain", plant: true, photo: true, wing: false, milk: false, green: true, cute: false, eat: true, trait: "보리는 뿌리·줄기·잎이 있고 스스로 광합성을 해요" },
  { id: "bunga", name: "붕어", shape: "fish", plant: false, photo: false, wing: false, milk: false, green: false, cute: false, eat: true, trait: "붕어는 물속에서 헤엄치고 알을 낳아요" },
  { id: "gaeguri", name: "개구리", shape: "frog", plant: false, photo: false, wing: false, milk: false, green: true, cute: true, eat: false, trait: "개구리는 알을 낳고 어릴 때는 물속에서 살아요" },
  { id: "ganga", name: "강아지풀", shape: "grass", plant: true, photo: true, wing: false, milk: false, green: true, cute: false, eat: false, trait: "강아지풀은 길가에서 자라며 광합성을 해요" },
  { id: "gae", name: "개", shape: "dog", plant: false, photo: false, wing: false, milk: true, green: false, cute: true, eat: false, trait: "개는 새끼를 낳아 젖을 먹여요" },
  { id: "gorae", name: "고래", shape: "whale", plant: false, photo: false, wing: false, milk: true, green: false, cute: true, eat: false, trait: "고래는 바다에 살지만 새끼를 낳아 젖을 먹여요" },
  { id: "myeong", name: "명아주", shape: "weed", plant: true, photo: true, wing: false, milk: false, green: true, cute: false, eat: true, trait: "명아주는 들에서 자라는 풀이고 광합성을 해요" },
  { id: "beot", name: "벚나무", shape: "tree", plant: true, photo: true, wing: false, milk: false, green: true, cute: false, eat: true, trait: "벚나무는 봄에 꽃이 피고 잎에서 광합성을 해요" },
  { id: "galmaegi", name: "갈매기", shape: "gull", plant: false, photo: false, wing: true, milk: false, green: false, cute: true, eat: false, trait: "갈매기는 날개가 있고 알을 낳아요" },
  { id: "bakjwi", name: "박쥐", shape: "bat", plant: false, photo: false, wing: true, milk: true, green: false, cute: false, eat: false, trait: "박쥐는 날개가 있지만 새끼를 낳아 젖을 먹여요" },
  { id: "daram", name: "다람쥐", shape: "squirrel", plant: false, photo: false, wing: false, milk: true, green: false, cute: true, eat: false, trait: "다람쥐는 새끼를 낳아 젖을 먹여요" },
  { id: "sonamu", name: "소나무", shape: "pine", plant: true, photo: true, wing: false, milk: false, green: true, cute: false, eat: false, trait: "소나무는 잎이 바늘 모양이고 광합성을 해요" },
];

interface Criterion {
  id: string;
  kind: "mixed" | "unique";
  label: string;
  yes: string;
  no: string;
  pick: (b: BeingDef) => boolean;
  /** 보는 사람에 따라 판단이 갈리는 생물 — 친구의 분류에서 반대쪽으로 옮겨 간다. */
  vague: string[];
  note: string;
  friend: string;
}

const CRITERIA: Criterion[] = [
  {
    id: "green", kind: "mixed", label: "몸 색깔이 초록인가요",
    yes: "초록이에요", no: "초록이 아니에요",
    pick: (b) => b.green, vague: ["beot", "gaeguri", "bunga"],
    note: "벚나무 잎은 계절마다, 개구리와 붕어는 개체마다 색이 달라요.",
    friend: "친구는 벚나무·개구리·붕어를 반대쪽에 두었어요. 같은 기준인데 결과가 달라졌어요.",
  },
  {
    id: "cute", kind: "mixed", label: "귀엽게 생겼나요",
    yes: "귀여워요", no: "귀엽지 않아요",
    pick: (b) => b.cute, vague: ["bakjwi", "gaeguri", "gorae", "galmaegi"],
    note: "귀엽다는 판단은 보는 사람의 마음에 달려 있어요.",
    friend: "친구는 박쥐·개구리·고래·갈매기를 반대쪽에 두었어요. 같은 기준인데 결과가 달라졌어요.",
  },
  {
    id: "eat", kind: "mixed", label: "먹을 수 있나요",
    yes: "먹을 수 있어요", no: "먹을 수 없어요",
    pick: (b) => b.eat, vague: ["myeong", "gaeguri", "beot", "ganga"],
    note: "명아주는 나물로 먹기도 하고, 벚나무는 열매만 먹어요.",
    friend: "친구는 명아주·개구리·벚나무·강아지풀을 반대쪽에 두었어요. 같은 기준인데 결과가 달라졌어요.",
  },
  {
    id: "photo", kind: "unique", label: "광합성을 하나요",
    yes: "광합성을 해요", no: "광합성을 하지 않아요",
    pick: (b) => b.photo, vague: [],
    note: "물음표가 하나도 없어요. 광합성은 생물이 실제로 가지고 있는 고유한 특징이니까요.",
    friend: "친구가 나눈 결과도 똑같아요. 고유한 특징으로 나누면 누가 나눠도 같은 무리가 돼요.",
  },
  {
    id: "wing", kind: "unique", label: "날개가 있나요",
    yes: "날개가 있어요", no: "날개가 없어요",
    pick: (b) => b.wing, vague: [],
    note: "갈매기와 박쥐가 한 무리가 됐어요. 날개도 눈으로 확인할 수 있는 고유한 특징이에요.",
    friend: "친구가 나눈 결과도 똑같아요. 고유한 특징으로 나누면 누가 나눠도 같은 무리가 돼요.",
  },
  {
    id: "milk", kind: "unique", label: "새끼를 낳아 젖을 먹이나요",
    yes: "젖을 먹여요", no: "젖을 먹이지 않아요",
    pick: (b) => b.milk, vague: [],
    note: "이번에는 박쥐가 개·고래·다람쥐와 한 무리가 됐어요. 조금 전과 무리가 달라졌네요.",
    friend: "친구가 나눈 결과도 똑같아요. 고유한 특징으로 나누면 누가 나눠도 같은 무리가 돼요.",
  },
];

interface Being extends BeingDef {
  x: number; y: number; tx: number; ty: number; rad: number; bob: number; vagueNow: boolean;
}

// ── 생물 실루엣(전부 손코딩 — 발주 이미지에 의존하지 않는다) ──────────────────
function drawShape(ctx: Ctx, shape: Shape, x: number, y: number, r: number, color: string): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.3, r * 0.15);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const eye = (ex: number, ey: number, er: number): void => {
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, TAU);
    ctx.fill();
    ctx.fillStyle = color;
  };
  switch (shape) {
    case "grain": { // 보리 — 줄기 + 이삭 + 까끄라기
      ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, y - r * 0.15); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const yy = y - r * 0.15 - i * r * 0.26;
        ctx.beginPath(); ctx.ellipse(x - r * 0.24, yy, r * 0.22, r * 0.13, -0.6, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + r * 0.24, yy, r * 0.22, r * 0.13, 0.6, 0, TAU); ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(x, y - r * 0.95); ctx.lineTo(x - r * 0.3, y - r * 1.45);
      ctx.moveTo(x, y - r * 0.95); ctx.lineTo(x + r * 0.3, y - r * 1.45);
      ctx.stroke();
      break;
    }
    case "grass": { // 강아지풀 — 휘어진 줄기 + 복슬한 이삭 + 잎
      ctx.beginPath();
      ctx.moveTo(x - r * 0.1, y + r);
      ctx.quadraticCurveTo(x + r * 0.2, y + r * 0.1, x + r * 0.12, y - r * 0.4);
      ctx.stroke();
      ctx.save();
      ctx.translate(x + r * 0.12, y - r * 0.45);
      ctx.rotate(-0.2);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.42, r * 0.26, r * 0.52, 0, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.05, y + r * 0.45);
      ctx.quadraticCurveTo(x - r * 0.72, y + r * 0.15, x - r * 0.86, y - r * 0.32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.05, y + r * 0.2);
      ctx.quadraticCurveTo(x + r * 0.75, y - r * 0.05, x + r * 0.84, y - r * 0.5);
      ctx.stroke();
      break;
    }
    case "weed": { // 명아주 — 곧은 줄기 + 마름모 잎 세 쌍
      ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, y - r * 0.95); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const yy = y + r * 0.45 - i * r * 0.5;
        const w = r * (0.62 - i * 0.1);
        for (const dir of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x, yy);
          ctx.quadraticCurveTo(x + dir * w * 0.6, yy - r * 0.3, x + dir * w, yy - r * 0.42);
          ctx.quadraticCurveTo(x + dir * w * 0.55, yy - r * 0.02, x, yy);
          ctx.fill();
        }
      }
      break;
    }
    case "tree": { // 벚나무 — 줄기 + 둥근 수관 + 꽃점
      ctx.save();
      ctx.strokeStyle = "#9A7B5A";
      ctx.lineWidth = Math.max(1.6, r * 0.2);
      ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, y - r * 0.05); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.35); ctx.lineTo(x - r * 0.38, y + r * 0.02);
      ctx.moveTo(x, y + r * 0.35); ctx.lineTo(x + r * 0.38, y + r * 0.02);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath(); ctx.arc(x - r * 0.4, y - r * 0.3, r * 0.42, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.4, y - r * 0.3, r * 0.42, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y - r * 0.66, r * 0.5, 0, TAU); ctx.fill();
      ctx.save();
      ctx.fillStyle = "#FFC9DE";
      for (const [dx, dy] of [[-0.5, -0.55], [0.36, -0.62], [0, -0.22], [0.55, -0.2]]) {
        ctx.beginPath(); ctx.arc(x + r * dx, y + r * dy, r * 0.1, 0, TAU); ctx.fill();
      }
      ctx.restore();
      break;
    }
    case "pine": { // 소나무 — 줄기 + 삼각 층 3장
      ctx.save();
      ctx.strokeStyle = "#9A7B5A";
      ctx.lineWidth = Math.max(1.6, r * 0.2);
      ctx.beginPath(); ctx.moveTo(x, y + r); ctx.lineTo(x, y + r * 0.35); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const base = y + r * 0.45 - i * r * 0.46;
        const w = r * (0.78 - i * 0.16);
        ctx.beginPath();
        ctx.moveTo(x, base - r * 0.75);
        ctx.lineTo(x + w, base);
        ctx.lineTo(x - w, base);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "fish": { // 붕어 — 몸통 + 꼬리지느러미 + 등지느러미
      ctx.beginPath(); ctx.ellipse(x, y, r * 0.78, r * 0.5, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y);
      ctx.lineTo(x - r * 1.08, y - r * 0.42);
      ctx.lineTo(x - r * 1.08, y + r * 0.42);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.2, y - r * 0.42);
      ctx.lineTo(x + r * 0.06, y - r * 0.86);
      ctx.lineTo(x + r * 0.3, y - r * 0.34);
      ctx.closePath(); ctx.fill();
      eye(x + r * 0.44, y - r * 0.1, r * 0.11);
      break;
    }
    case "frog": { // 개구리 — 넓은 몸통 + 눈 두 개 + 뒷다리
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.16, r * 0.72, r * 0.5, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.42, r * 0.24, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.3, y - r * 0.42, r * 0.24, 0, TAU); ctx.fill();
      eye(x - r * 0.3, y - r * 0.45, r * 0.1);
      eye(x + r * 0.3, y - r * 0.45, r * 0.1);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.62, y + r * 0.36);
      ctx.quadraticCurveTo(x - r * 1.0, y + r * 0.6, x - r * 0.72, y + r * 0.8);
      ctx.moveTo(x + r * 0.62, y + r * 0.36);
      ctx.quadraticCurveTo(x + r * 1.0, y + r * 0.6, x + r * 0.72, y + r * 0.8);
      ctx.stroke();
      break;
    }
    case "dog": { // 개 — 몸통 + 머리 + 접힌 귀 + 네 다리 + 꼬리
      ctx.beginPath(); ctx.ellipse(x - r * 0.12, y + r * 0.05, r * 0.6, r * 0.36, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.6, y - r * 0.3, r * 0.32, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.42, y - r * 0.52);
      ctx.lineTo(x + r * 0.36, y - r * 0.02);
      ctx.lineTo(x + r * 0.66, y - r * 0.5);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + r * 0.9, y - r * 0.22, r * 0.16, r * 0.12, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      for (const dx of [-0.5, -0.16, 0.16, 0.42]) {
        ctx.moveTo(x + r * dx, y + r * 0.3);
        ctx.lineTo(x + r * dx, y + r * 0.86);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.68, y - r * 0.06);
      ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.3, x - r * 0.9, y - r * 0.62);
      ctx.stroke();
      eye(x + r * 0.68, y - r * 0.38, r * 0.09);
      break;
    }
    case "whale": { // 고래 — 큰 몸통 + 꼬리 + 물줄기
      ctx.beginPath();
      ctx.moveTo(x - r * 0.9, y + r * 0.05);
      ctx.quadraticCurveTo(x - r * 0.2, y - r * 0.66, x + r * 0.62, y - r * 0.18);
      ctx.quadraticCurveTo(x + r * 0.9, y + r * 0.06, x + r * 0.5, y + r * 0.42);
      ctx.quadraticCurveTo(x - r * 0.2, y + r * 0.7, x - r * 0.9, y + r * 0.05);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.82, y + r * 0.05);
      ctx.lineTo(x - r * 1.15, y - r * 0.4);
      ctx.lineTo(x - r * 1.12, y + r * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.02, y - r * 0.55);
      ctx.quadraticCurveTo(x + r * 0.14, y - r * 0.95, x + r * 0.32, y - r * 1.05);
      ctx.moveTo(x + r * 0.02, y - r * 0.55);
      ctx.quadraticCurveTo(x - r * 0.06, y - r * 0.95, x - r * 0.22, y - r * 1.02);
      ctx.stroke();
      eye(x + r * 0.44, y - r * 0.12, r * 0.09);
      break;
    }
    case "gull": { // 갈매기 — 날개를 활짝 편 옆모습(몸통 + 좌우 날개 + 부리 + 꼬리)
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
      eye(x + r * 0.42, y - r * 0.15, r * 0.08);
      break;
    }
    case "bat": { // 박쥐 — 몸통 + 뾰족한 귀 + 물결 날개
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.06, r * 0.26, r * 0.42, 0, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.24, y - r * 0.34);
      ctx.lineTo(x - r * 0.3, y - r * 0.78);
      ctx.lineTo(x - r * 0.02, y - r * 0.44);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.24, y - r * 0.34);
      ctx.lineTo(x + r * 0.3, y - r * 0.78);
      ctx.lineTo(x + r * 0.02, y - r * 0.44);
      ctx.closePath(); ctx.fill();
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + dir * r * 0.2, y - r * 0.24);
        ctx.quadraticCurveTo(x + dir * r * 0.72, y - r * 0.62, x + dir * r * 1.12, y - r * 0.28);
        ctx.quadraticCurveTo(x + dir * r * 0.92, y + r * 0.06, x + dir * r * 0.98, y + r * 0.34);
        ctx.quadraticCurveTo(x + dir * r * 0.7, y + r * 0.1, x + dir * r * 0.56, y + r * 0.42);
        ctx.quadraticCurveTo(x + dir * r * 0.4, y + r * 0.16, x + dir * r * 0.2, y + r * 0.34);
        ctx.closePath();
        ctx.fill();
      }
      eye(x - r * 0.1, y - r * 0.18, r * 0.075);
      eye(x + r * 0.1, y - r * 0.18, r * 0.075);
      break;
    }
    case "squirrel": { // 다람쥐 — 몸통 + 머리 + 복슬 꼬리
      ctx.beginPath(); ctx.ellipse(x - r * 0.06, y + r * 0.2, r * 0.42, r * 0.36, -0.2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x + r * 0.38, y - r * 0.26, r * 0.28, 0, TAU); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + r * 0.24, y - r * 0.44);
      ctx.lineTo(x + r * 0.26, y - r * 0.76);
      ctx.lineTo(x + r * 0.5, y - r * 0.5);
      ctx.closePath(); ctx.fill();
      ctx.save();
      ctx.lineWidth = Math.max(2.4, r * 0.34);
      ctx.beginPath();
      ctx.moveTo(x - r * 0.4, y + r * 0.4);
      ctx.quadraticCurveTo(x - r * 1.06, y + r * 0.28, x - r * 0.86, y - r * 0.58);
      ctx.stroke();
      ctx.restore();
      eye(x + r * 0.5, y - r * 0.32, r * 0.085);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

export const classifyLab: StepRenderer = (host, step, api) => {
  const s = step as unknown as ClassifyStep;

  host.appendChild(el("div", { class: "h1", html: s.title }));
  if (s.lead) host.appendChild(el("div", { class: "sub", html: s.lead }));

  const goalsEl = el(
    "div", { class: "pn-badges force3" },
    el("div", { class: "pn-badge bio", dataset: { g: "mixed" } }, el("b", { text: "기준 바꾸기" }), el("span", { text: "느낌 기준" })),
    el("div", { class: "pn-badge bio", dataset: { g: "unique" } }, el("b", { text: "고유한 특징" }), el("span", { text: "다시 나누기" })),
    el("div", { class: "pn-badge bio", dataset: { g: "bat" } }, el("b", { text: "박쥐의 자리" }), el("span", { text: "두 기준 비교" })),
  );
  const helper = el("div", {
    class: "helper",
    html: "생물 12종이 섞여 있어요. 아래 <b>기준</b>을 하나 골라 두 무리로 나눠 보세요. 생물을 탭하면 특징도 볼 수 있어요.",
  });
  const canvas = el("canvas", {
    class: "b3-canvas",
    style: `height:${CVH}px`,
    attrs: {
      tabindex: "0", role: "img",
      "aria-label": "생물 12종을 고른 기준에 따라 두 무리로 나누는 무대",
    },
  });
  const readPill = el("span", { text: "아직 나누지 않았어요" });
  const toast = el("div", { class: "toast low" });
  const stage = el(
    "div", { class: "stage b3-stage" },
    canvas,
    el("div", { class: "stage-hud" }, el("div", { class: "pill" }, el("span", { class: "pdot", style: `background:${YES_INK}` }), readPill)),
    toast,
  );
  const controls = el("div", { class: "b3-controls cls-controls" });
  host.append(goalsEl, helper, stage, controls);
  if (s.curio) host.appendChild(curioCard(s.curio));

  let W = BASE_X;
  const scale = (): number => W / BASE_X;
  const sc = (v: number): number => v * scale();
  /** 캔버스 글자는 어떤 화면에서도 12px 아래로 내려가지 않게 한다. */
  const fs = (v: number): number => Math.max(12, sc(v));
  /** 무대 높이를 가로 폭에 비례시켜, 넓은 화면에서 아래쪽 내용이 잘리지 않게 한다. */
  const sizeCanvas = (): void => {
    const w = canvas.getBoundingClientRect().width || BASE_X;
    const h = `${Math.round(CVH * (w / BASE_X))}px`;
    if (canvas.style.height !== h) canvas.style.height = h;
  };

  const goals = new Set<Goal>();
  let phase: Phase = "mixed";
  let current: Criterion | null = null;
  let friendOn = false;
  let batStage = 0; // 0 = 날개 기준만 · 1 = 두 기준 나란히 · 2 = 판정 완료
  let batFade = 0;
  let toastTimer = 0;
  let finished = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  };

  const beings: Being[] = BEINGS.map((d, i) => ({
    ...d,
    x: 0, y: 0, tx: 0, ty: 0, rad: 18, bob: i * 0.9, vagueNow: false,
  }));
  const find = (id: string): Being => beings.find((b) => b.id === id) as Being;

  const toastMsg = (msg: string): void => {
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const collect = (id: Goal, chipText: string, msg: string): void => {
    if (goals.has(id)) return;
    goals.add(id);
    const chip = goalsEl.querySelector(`[data-g="${id}"]`) as HTMLElement;
    chip.classList.add("on");
    chip.querySelector("span")!.textContent = chipText;
    haptic(HAPTIC.ctaUnlock);
    toastMsg(msg);
  };

  // ── 배치 ─────────────────────────────────────────────────────────────
  // 무대를 낮춘 만큼 한 무리에 7종 이상 몰리면 3열로 접는다(날개 기준은 한쪽에 10종).
  const place = (list: Being[], side: 0 | 1): void => {
    const n = list.length;
    const cols = n > 6 ? 3 : 2;
    const rows = Math.max(1, Math.ceil(n / cols));
    const zx = side === 0 ? ZONE.lx : ZONE.rx;
    const cw = ZONE.w / cols;
    const ch = (ZONE.bottom - ZONE.top) / rows;
    list.forEach((b, i) => {
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, n - row * cols);
      const pad = ((cols - inRow) * cw) / 2; // 마지막 줄이 덜 찼으면 가운데로 모은다
      b.tx = zx + pad + ((i % cols) + 0.5) * cw;
      b.ty = ZONE.top + (row + 0.5) * ch - Math.min(7, ch * 0.1);
      // 칸에 이름표까지 들어가야 하니 세로 칸과 가로 칸 중 좁은 쪽을 따른다.
      b.rad = clamp(Math.min(ch * 0.24, cw * 0.3), 9.5, 16);
    });
  };

  const spreadStart = (): void => {
    beings.forEach((b, i) => {
      b.tx = 45 + (i % 4) * 90;
      b.ty = 102 + Math.floor(i / 4) * 50;
      b.rad = 14;
      b.x = b.tx;
      b.y = b.ty;
    });
  };
  spreadStart();

  const resplit = (): void => {
    if (!current) return;
    const c = current;
    const yes: Being[] = [];
    const no: Being[] = [];
    for (const b of beings) {
      const vague = c.vague.includes(b.id);
      const inYes = friendOn && vague ? !c.pick(b) : c.pick(b);
      b.vagueNow = vague;
      (inYes ? yes : no).push(b);
    }
    place(yes, 0);
    place(no, 1);
  };

  // ── 기준 고르기 ───────────────────────────────────────────────────────
  const applyCriterion = (c: Criterion): void => {
    current = c;
    friendOn = false;
    resplit();
    haptic(HAPTIC.select);
    readPill.textContent = c.label;
    // 물음표 표시의 뜻은 helper가 맡는다 — 무대를 낮춘 뒤로 캔버스 아래에 안내 줄을 둘 자리가 없다.
    helper.innerHTML = c.kind === "mixed"
      ? `<b>${c.label}</b> 기준으로 나눴어요. ${c.note} 물음표는 사람마다 다르게 볼 수 있다는 표시예요.`
      : `<b>${c.label}</b> 기준으로 나눴어요. ${c.note}`;
    renderControls();
  };

  const showFriend = (): void => {
    if (!current || friendOn) return;
    const c = current;
    friendOn = true;
    resplit();
    haptic(HAPTIC.tap);
    renderControls();
    if (c.kind === "mixed") {
      helper.innerHTML = `${c.friend} 이렇게 <b>사람에 따라 답이 달라지는 성질</b>은 분류 기준이 될 수 없어요.`;
      collect("mixed", "결과가 달라요", "같은 기준인데 친구와 결과가 달라졌어요");
      if (phase === "mixed") {
        phase = "unique";
        later(() => {
          helper.innerHTML = "이번에는 <b>생물이 가지고 있는 고유한 특징</b>으로 나눠 볼까요. 아래 기준 중 하나를 골라 보세요.";
          renderControls();
        }, 1500);
      }
    } else {
      helper.innerHTML = `${c.friend} 그래서 분류 기준은 <b>생물이 가지는 고유한 특징</b>이어야 해요.`;
      collect("unique", "누가 해도 같아요", "고유한 특징으로 나누면 결과가 하나예요");
      if (phase === "unique") {
        phase = "bat";
        later(() => {
          helper.innerHTML = "그런데 고유한 특징끼리도 결과가 갈릴 수 있어요. <b>박쥐</b>가 어느 무리에 들어갔는지 따라가 볼까요?";
          renderControls();
        }, 1500);
      }
    }
  };

  // ── 국면 3: 박쥐의 자리 ───────────────────────────────────────────────
  const enterBat = (): void => {
    batStage = 0;
    batFade = 0.0001;
    current = null;
    haptic(HAPTIC.select);
    readPill.textContent = "박쥐를 따라가요";
    helper.innerHTML = "<b>날개가 있나요</b> 기준으로 나누면 박쥐는 갈매기와 한 무리가 돼요.";
    renderControls();
  };

  const openBatSecond = (): void => {
    batStage = 1;
    haptic(HAPTIC.tap);
    helper.innerHTML = "<b>새끼를 낳아 젖을 먹이나요</b> 기준으로 나누면 박쥐는 다람쥐와 한 무리가 돼요. 같은 박쥐인데 무리가 달라졌어요.";
    renderControls();
  };

  const finishBat = (): void => {
    batStage = 2;
    readPill.textContent = "박쥐 = 다람쥐와 한 무리";
    helper.innerHTML = "겉모습 하나만으로는 생물 사이의 가까운 정도를 알 수 없어요. <b>여러 고유한 특징</b>을 함께 보아야 해요.";
    collect("bat", "다람쥐와 한 무리", "박쥐는 갈매기보다 다람쥐와 더 가까워요");
    renderControls();
    if (!finished) {
      finished = true;
      api.recordQuiz(true);
      api.enableCTA(s.cta ?? "분류 기준 정리하기");
    }
  };

  // ── 조작부 ────────────────────────────────────────────────────────────
  const critButton = (c: Criterion): HTMLButtonElement => {
    const b = el("button", {
      class: `b3-chip ${current?.id === c.id ? "on" : ""}`,
      attrs: { type: "button" },
      dataset: { clsCrit: c.id },
      text: c.label,
    });
    b.addEventListener("click", () => applyCriterion(c));
    return b;
  };

  const bigButton = (label: string, onClick: () => void, act: string, enabled = true): HTMLButtonElement => {
    const b = el("button", { class: "btn b3-btn", attrs: { type: "button" }, text: label, dataset: { clsAct: act } });
    b.disabled = !enabled;
    b.addEventListener("click", onClick);
    return b;
  };

  function renderControls(): void {
    controls.replaceChildren();
    if (phase === "mixed" || phase === "unique") {
      const kind = phase;
      const list = CRITERIA.filter((c) => c.kind === kind);
      controls.appendChild(el("div", {
        class: "cls-kicker",
        text: kind === "mixed" ? "기준 고르기" : "이번에는 고유한 특징으로",
      }));
      const box = el("div", { class: "cls-crits" });
      for (const c of list) box.appendChild(critButton(c));
      controls.appendChild(box);
      const ready = !!current && current.kind === kind;
      controls.appendChild(bigButton(
        ready && friendOn ? "친구의 분류를 확인했어요" : "다른 친구는 어떻게 나눴을까요",
        showFriend, "friend", ready && !friendOn,
      ));
      return;
    }
    // phase === "bat"
    if (batStage === 0) {
      if (batFade <= 0) {
        controls.appendChild(bigButton("박쥐를 따라가 보기", enterBat, "bat"));
        return;
      }
      controls.appendChild(bigButton("젖 기준으로도 나눠 보기", openBatSecond, "bat2"));
      return;
    }
    if (batStage === 1) {
      const q = el("div", { class: "hook-q", html: "박쥐는 <b>어느 쪽</b>과 더 가까운 생물일까요?" });
      const wrap = el("div", { class: "hook-choices show" });
      const choices = [
        { t: "날개가 있는 갈매기와 더 가까워요", ok: false },
        { t: "젖을 먹이는 다람쥐와 더 가까워요", ok: true },
      ];
      for (const c of choices) {
        const b = el("button", { class: "hook-choice", attrs: { type: "button" }, dataset: { clsPick: String(c.ok) }, text: c.t });
        b.addEventListener("click", () => {
          if (batStage !== 1) return;
          if (!c.ok) {
            haptic(HAPTIC.wrong);
            b.classList.add("miss");
            helper.innerHTML = "날개는 <b>하늘을 나는 데 알맞은 겉모습</b>일 뿐이에요. 박쥐의 날개는 갈매기의 날개와 짜임이 달라요. 다시 골라 볼까요?";
            return;
          }
          haptic(HAPTIC.correct);
          for (const other of Array.from(wrap.children) as HTMLElement[]) other.classList.add("dim");
          b.classList.remove("dim");
          b.classList.add("reveal");
          later(finishBat, 420);
        });
        wrap.appendChild(b);
      }
      controls.append(q, wrap);
      return;
    }
    controls.appendChild(el("div", {
      class: "cls-verdict",
      html: "박쥐는 날개가 있어 갈매기와 비슷해 보이지만, 새끼를 낳아 젖을 먹이고 몸이 털로 덮여 있어요. 그래서 <b>박쥐는 갈매기보다 다람쥐와 더 가까워요</b>.",
    }));
    controls.appendChild(el("div", {
      class: "cls-verdict",
      html: "분류 기준은 <b>생물이 가지고 있는 고유한 특징</b>이어야 하고, 여러 특징을 함께 볼수록 생물 사이의 가까운 정도를 더 잘 나타내요.",
    }));
  }

  // ── 무대 탭: 생물 특징 보기 ───────────────────────────────────────────
  const onTap = (e: PointerEvent): void => {
    if (phase === "bat" && batFade > 0) return;
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale();
    const py = (e.clientY - r.top) / scale();
    let best: Being | null = null;
    let bestD = Infinity;
    for (const b of beings) {
      const d = Math.hypot(px - b.x, py - b.y);
      // 생물이 작아져도 손가락이 닿게 — 반지름에 비례하되 최소 20(논리)까지는 받아 준다.
      if (d < Math.max(20, b.rad * 1.7) && d < bestD) { bestD = d; best = b; }
    }
    if (!best) return;
    haptic(HAPTIC.tap);
    toastMsg(best.trait);
  };
  canvas.addEventListener("pointerdown", onTap);

  // ── 그리기 ────────────────────────────────────────────────────────────
  const capsule = (ctx: Ctx, cx: number, cy: number, w: number, text: string, color: string): void => {
    ctx.save();
    ctx.font = `800 ${fs(12.5)}px Pretendard, sans-serif`;
    const h = Math.max(26, sc(28));
    ctx.fillStyle = "rgba(11, 21, 36, .78)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, cy);
    ctx.restore();
  };

  const drawGroups = (ctx: Ctx, t: number): void => {
    // 무리 이름표
    if (current) {
      capsule(ctx, sc(ZONE.lx + ZONE.w / 2), sc(HEAD_Y), sc(ZONE.w), current.yes, YES_INK);
      capsule(ctx, sc(ZONE.rx + ZONE.w / 2), sc(HEAD_Y), sc(ZONE.w), current.no, NO_INK);
      ctx.save();
      ctx.strokeStyle = "rgba(126,147,179,.35)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(sc(DIV_X), sc(ZONE.top - 8));
      ctx.lineTo(sc(DIV_X), sc(ZONE.bottom));
      ctx.stroke();
      ctx.restore();
    } else {
      capsule(ctx, sc(DIV_X), sc(HEAD_Y), sc(286), "생물 12종 — 아직 나누지 않았어요", "#9CB2D2");
    }
    // 생물
    for (const b of beings) {
      const r = sc(b.rad);
      const x = sc(b.x);
      const y = sc(b.y + Math.sin(t / 760 + b.bob) * 1.2);
      drawShape(ctx, b.shape, x, y, r, b.plant ? PLANT_INK : ANIMAL_INK);
      ctx.save();
      ctx.fillStyle = "#DCE7F7";
      ctx.font = `700 ${fs(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(b.name, x, y + r + sc(4));
      ctx.restore();
      if (b.vagueNow) {
        const br = Math.max(9, sc(8.5));
        const bx = x + r * 0.9 + br * 0.3;
        const by = y - r * 0.85;
        ctx.save();
        ctx.fillStyle = "#F59F00";
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
        ctx.fillStyle = DARK;
        ctx.font = `900 ${fs(12)}px Pretendard, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", bx, by + 0.5);
        ctx.restore();
      }
    }
  };

  /** 국면 3 — 두 기준의 결과를 **좌우로 나란히** 놓고 박쥐만 따라간다.
      낮아진 무대(360×262)에서는 위아래 두 줄보다 좌우 두 칸이 잘 읽힌다 — 같은 박쥐가 두 기준에서
      각각 누구와 묶이는지를 한 화면에서 견줄 수 있다(기준 버튼도 함께 보인다). */
  const COL_W = 164;
  const COL_X = [8, 188];
  const BOX_Y = [84, 170];
  const BOX_H = 80;

  interface BatCell { b?: Being; cap?: string; focus?: boolean }

  const drawBatView = (ctx: Ctx, t: number): void => {
    const colHead = (ci: number, no: string, q: string, alpha: number): void => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = sc(COL_X[ci] + COL_W / 2);
      ctx.font = `800 ${fs(11.5)}px Pretendard, sans-serif`;
      ctx.fillStyle = "#8FA6C6";
      ctx.fillText(no, cx, sc(62));
      ctx.fillStyle = "#DCE7F7";
      ctx.fillText(q, cx, sc(76));
      ctx.restore();
    };
    const cap = (text: string, x: number, y: number, alpha: number): void => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#7E93B3";
      ctx.font = `700 ${fs(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, sc(x), sc(y));
      ctx.restore();
    };
    const box = (ci: number, bi: number, label: string, color: string, alpha: number, cells: BatCell[]): void => {
      const x = COL_X[ci];
      const y = BOX_Y[bi];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = "rgba(18, 30, 52, .55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(sc(x), sc(y), sc(COL_W), sc(BOX_H), sc(13));
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = `800 ${fs(11.5)}px Pretendard, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(label, sc(x + 11), sc(y + 8));
      ctx.restore();
      cells.forEach((c, i) => {
        const cx = x + (COL_W * (i + 0.5)) / cells.length;
        // 44 = 칸 라벨(위)과 이름표(아래) 사이 — 강조 고리를 두른 박쥐 이름까지 칸 안에 들어온다.
        if (c.b) token(c.b, cx, y + 44, alpha, !!c.focus);
        else if (c.cap) cap(c.cap, cx, y + 44, alpha);
      });
    };
    const token = (b: Being, x: number, y: number, alpha: number, focus: boolean): void => {
      ctx.save();
      ctx.globalAlpha = alpha;
      const r = sc(11);
      if (focus) {
        ctx.strokeStyle = FOCUS_INK;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -t / 60;
        ctx.beginPath();
        ctx.arc(sc(x), sc(y), r * 1.5, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      drawShape(ctx, b.shape, sc(x), sc(y), r, focus ? FOCUS_INK : (b.plant ? PLANT_INK : ANIMAL_INK));
      ctx.fillStyle = focus ? FOCUS_INK : "#DCE7F7";
      ctx.font = `700 ${fs(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      // 강조 고리(반지름 1.5r) 밖으로 이름을 내려 고리와 겹치지 않게 한다.
      ctx.fillText(b.name, sc(x), sc(y) + r * (focus ? 1.6 : 1) + sc(4));
      ctx.restore();
    };

    const a0 = clamp(batFade * 2, 0, 1);
    const a1 = batStage >= 1 ? clamp((batFade - 0.5) * 2.4, 0, 1) : 0;

    // 기준 ① 날개 — 있어요 2종(갈매기·박쥐) / 없어요 10종
    colHead(0, "기준 ①", "날개가 있나요", a0);
    box(0, 0, "날개가 있어요", YES_INK, a0, [{ b: find("galmaegi") }, { b: find("bakjwi"), focus: true }]);
    box(0, 1, "날개가 없어요", NO_INK, a0, [{ b: find("daram") }, { cap: "그 밖 9종" }]);

    if (batStage >= 1) {
      // 기준 ② 젖 — 먹여요 4종(개·고래·다람쥐·박쥐) / 먹이지 않아요 8종
      colHead(1, "기준 ②", "젖을 먹이나요", a1);
      box(1, 0, "젖을 먹여요", YES_INK, a1, [
        { b: find("bakjwi"), focus: true }, { b: find("daram") }, { cap: "개 · 고래" },
      ]);
      box(1, 1, "젖을 먹이지 않아요", NO_INK, a1, [{ b: find("galmaegi") }, { cap: "그 밖 7종" }]);

      // 같은 박쥐가 오른쪽 기준에서는 누구와 묶이는지 — 두 칸을 잇는 길
      const ly = sc(BOX_Y[0] + 44);
      const from = COL_X[0] + COL_W * 0.75 + 19;
      const to = COL_X[1] + COL_W / 6 - 19;
      ctx.save();
      ctx.globalAlpha = a1;
      ctx.strokeStyle = FOCUS_INK;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t / 50;
      ctx.beginPath();
      ctx.moveTo(sc(from), ly);
      ctx.lineTo(sc(to - 3), ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(sc(to), ly);
      ctx.lineTo(sc(to - 9), ly - sc(5));
      ctx.lineTo(sc(to - 9), ly + sc(5));
      ctx.closePath();
      ctx.fillStyle = FOCUS_INK;
      ctx.fill();
      ctx.restore();
    } else if (a0 > 0.8) {
      // 오른쪽 칸은 아직 비어 있다 — 다음에 무엇을 할지 무대가 먼저 알려 준다.
      ctx.save();
      ctx.globalAlpha = clamp((a0 - 0.8) * 5, 0, 1);
      ctx.strokeStyle = "rgba(126,147,179,.5)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.roundRect(sc(COL_X[1]), sc(BOX_Y[0]), sc(COL_W), sc(BOX_Y[1] + BOX_H - BOX_Y[0]), sc(13));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#7E93B3";
      ctx.font = `700 ${fs(12)}px Pretendard, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = sc(COL_X[1] + COL_W / 2);
      ctx.fillText("아래 버튼을 눌러", cx, sc(150));
      ctx.fillText("다른 기준으로도", cx, sc(168));
      ctx.fillText("나눠 보세요", cx, sc(186));
      ctx.restore();
    }
  };

  const loop: Loop = createLoop((dt, tMs) => {
    sizeCanvas();
    const fit = fitCanvas(canvas);
    const ctx = fit.ctx;
    W = fit.w;
    ctx.clearRect(0, 0, W, fit.h);
    if (batFade > 0) batFade = clamp(batFade + dt * 0.016, 0, 1);
    if (phase === "bat" && batFade > 0) {
      drawBatView(ctx, tMs);
      return;
    }
    for (const b of beings) {
      b.x += (b.tx - b.x) * Math.min(1, dt * 0.1);
      b.y += (b.ty - b.y) * Math.min(1, dt * 0.1);
    }
    drawGroups(ctx, tMs);
  });

  renderControls();
  const onResize = (): void => { sizeCanvas(); fitCanvas(canvas); };
  window.addEventListener("resize", onResize);
  const rafId = requestAnimationFrame(() => { onResize(); loop.start(); });

  api.setCTA("기준을 바꿔 가며 나눠 보세요", { enabled: false });
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
