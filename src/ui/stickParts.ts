// 파츠 조합형 스틱맨 아바타(v2, 2026-11): 발주 래스터 프리셋(avatar.ts PROFILE)과 별개의 코드 SVG 레이어 시스템.
// 슬롯별 파츠를 같은 좌표계(viewBox 0 0 96 96, 머리 중심 48,45)에 겹쳐 "내가 꾸민 스틱맨"을 만든다.
// 그림(파츠·팔레트)은 stickArt.ts, 여기는 조합·정규화·프리셋·픽커 메타를 맡는다.
// 벡터라 지도 워커·완료 연출에 재사용 가능(발주 래스터는 조합 폭발·애니 불가로 부적합, 사용자 확정 2026-07-12).
//
// 레이어 순서: 배경 → 옷 뒤판(후드·망토) → 뒷머리 → 옷 → 얼굴형 → 볼 → 눈 → 입 → 앞머리 → 머리 위 장식
//             → 안경 → 모자·머리 장식 → 손에 든 것.
// 저장 호환(중요): store.avatarCustom은 슬롯별 인덱스다. 파츠·색 추가는 각 배열 끝에 append만 하고,
// 순서 변경·삭제는 하지 않는다. v2에서 새로 생긴 슬롯(색·볼·옷·소품·배경)은 구버전 저장분에 없으므로
// normStick이 0으로 채운다. 0번은 전부 "예전 모습"이라 예전에 꾸민 조합이 그대로 보인다.

import type { StickAvatarCfg } from "../core/store";
import {
  ACCS,
  ACC_COLS,
  BGS,
  CHEEKS,
  EYES,
  FACES,
  GLASSES,
  HAIRS,
  HAIR_COLS,
  MOUTHS,
  PROPS,
  SKINS,
  TOPS,
  TOP_COLS,
  type Paint,
} from "./stickArt";

/** 모든 슬롯이 채워진 조합(정규화 결과). 저장 타입 StickAvatarCfg는 v2 슬롯이 선택형이다. */
export type StickCfg = Required<StickAvatarCfg>;
export type StickKey = keyof StickCfg;

const COUNT: Record<StickKey, number> = {
  face: FACES.length,
  hair: HAIRS.length,
  eyes: EYES.length,
  mouth: MOUTHS.length,
  glasses: GLASSES.length,
  acc: ACCS.length,
  skin: SKINS.length,
  hairColor: HAIR_COLS.length,
  cheek: CHEEKS.length,
  top: TOPS.length,
  topColor: TOP_COLS.length,
  accColor: ACC_COLS.length,
  prop: PROPS.length,
  bg: BGS.length,
};
const KEYS = Object.keys(COUNT) as StickKey[];

/** 처음 모습 = 게스트 스틱(새싹 머리). 프리셋 '기본'과 같은 조합이라 "기본을 고르면 처음 모습으로"가 성립한다. */
export const DEFAULT_STICK: StickCfg = {
  face: 0,
  hair: 1,
  eyes: 0,
  mouth: 0,
  glasses: 0,
  acc: 0,
  skin: 0,
  hairColor: 0,
  cheek: 0,
  top: 0,
  topColor: 0,
  accColor: 0,
  prop: 0,
  bg: 0,
};

function clampIdx(count: number, i: unknown): number {
  const n = Math.floor(Number(i) || 0);
  return n >= 0 && n < count ? n : 0;
}

/** 저장값 정규화: 없는 슬롯(구버전 저장분)과 범위 밖 인덱스(손상 저장분)는 0으로 되돌린다. */
export function normStick(raw: Partial<StickAvatarCfg> | null | undefined): StickCfg {
  const r: Partial<StickAvatarCfg> = raw ?? DEFAULT_STICK;
  const out = {} as StickCfg;
  for (const k of KEYS) out[k] = clampIdx(COUNT[k], r[k]);
  return out;
}

/* ── 슬롯 메타(픽커가 순회) ──────────────────────────────── */
export interface StickColorRow {
  key: StickKey;
  label: string;
  swatches: { name: string; css: string }[];
}
export interface StickSlot {
  key: StickKey;
  label: string;
  parts: { name: string }[];
  /** 썸네일이 비추는 영역(viewBox). 눈·입처럼 작은 파츠는 그 부위만 크게 잡는다. */
  view: string;
  /** 썸네일에서만 걷어 내는 슬롯. 예: 눈을 고를 때 선글라스가 눈을 가리면 고를 수가 없다. */
  hide?: StickKey[];
  /** 이 범주에 딸린 색 줄(피부색·머리색·옷 색·모자 색) */
  color?: StickColorRow;
  /** 썸네일을 배경까지 그린 동그란 아바타로 보여 준다(배경 범주) */
  round?: boolean;
}

export const STICK_SLOTS: StickSlot[] = [
  {
    key: "face",
    label: "얼굴형",
    parts: FACES,
    view: "13 11 70 70",
    color: { key: "skin", label: "피부색", swatches: SKINS.map((s) => ({ name: s.name, css: s.fill })) },
  },
  {
    key: "hair",
    label: "머리",
    parts: HAIRS,
    view: "5 -1 86 86",
    hide: ["acc"],
    color: { key: "hairColor", label: "머리색", swatches: HAIR_COLS.map((s) => ({ name: s.name, css: s.fill })) },
  },
  { key: "eyes", label: "눈", parts: EYES, view: "28 26 40 40", hide: ["glasses"] },
  { key: "mouth", label: "입", parts: MOUTHS, view: "31 38 34 34" },
  { key: "cheek", label: "볼", parts: CHEEKS, view: "23 25 50 50", hide: ["glasses"] },
  { key: "glasses", label: "안경", parts: GLASSES, view: "22 22.6 52 52" },
  {
    key: "acc",
    label: "모자·장식",
    parts: ACCS,
    view: "5 -3 86 86",
    color: { key: "accColor", label: "모자 색", swatches: ACC_COLS.map((s) => ({ name: s.name, css: s.fill })) },
  },
  {
    key: "top",
    label: "옷",
    parts: TOPS,
    view: "18 40 60 60",
    hide: ["prop"],
    color: { key: "topColor", label: "옷 색", swatches: TOP_COLS.map((s) => ({ name: s.name, css: s.fill })) },
  },
  { key: "prop", label: "소품", parts: PROPS, view: "36 38 60 60" },
  { key: "bg", label: "배경", parts: BGS, view: "0 0 96 96", round: true },
];

/* ── 캐릭터 프리셋(마이 탭 '캐릭터 고르기') ──────────────────
   직접 꾸미기와 완전히 분리된 "완성 캐릭터"(2026-07-15 사용자 확정: 고른 캐릭터를 이어서 꾸미게 하지 않는다).
   고르면 store.avatarPreset만 바뀌고 내가 꾸민 조합(store.avatarCustom)은 그대로 남는다.
   추가는 배열 끝에 append만(저장 인덱스 보존). 0번 '기본'은 DEFAULT_STICK과 같아야 한다. */
export interface StickPreset {
  name: string;
  cfg: StickCfg;
}
const preset = (name: string, cfg: Partial<StickAvatarCfg>): StickPreset => ({ name, cfg: normStick({ ...ZERO, ...cfg }) });
const ZERO: StickCfg = { ...DEFAULT_STICK, hair: 0 };

export const STICK_PRESETS: StickPreset[] = [
  // 0 기본 = 게스트 스틱(DEFAULT_STICK와 동일 조합). 아무것도 안 고른 첫 아바타가 곧 이 캐릭터라
  // '기본'을 누르면 처음 모습으로 돌아간다(사용자 확정 2026-07-16).
  preset("기본", { hair: 1 }),
  preset("방글", { hair: 2, eyes: 1, mouth: 1, skin: 1, hairColor: 2, cheek: 1, top: 1, topColor: 4, bg: 2 }),
  preset("모범생", { face: 1, hair: 8, mouth: 3, glasses: 2, skin: 1, top: 4, prop: 3, bg: 0 }),
  preset("힙스터", { face: 2, hair: 4, mouth: 4, glasses: 4, skin: 3, hairColor: 1, top: 2, topColor: 11, bg: 4 }),
  preset("게이머", { hair: 3, eyes: 2, mouth: 2, acc: 3, skin: 2, hairColor: 6, accColor: 3, top: 8, topColor: 8, bg: 7 }),
  preset("캡틴", { face: 3, eyes: 1, mouth: 5, acc: 2, skin: 2, accColor: 1, top: 3, topColor: 6, prop: 8, bg: 1 }),
  // ── v2 추가 ──
  preset("과학자", { hair: 15, hairColor: 1, eyes: 6, mouth: 6, glasses: 5, skin: 1, top: 6, topColor: 2, prop: 2, bg: 11 }),
  preset("탐험가", { hair: 5, hairColor: 4, mouth: 1, cheek: 2, acc: 11, accColor: 1, skin: 2, top: 5, topColor: 3, prop: 4, bg: 1 }),
  preset("우주인", { hair: 14, hairColor: 2, eyes: 8, mouth: 2, acc: 12, skin: 1, top: 8, topColor: 0, prop: 7, bg: 7 }),
  preset("마법사", { face: 4, hair: 13, hairColor: 7, eyes: 5, mouth: 4, acc: 13, accColor: 5, skin: 8, top: 9, topColor: 8, prop: 5, bg: 8 }),
  preset("챔피언", { face: 2, hair: 3, eyes: 7, mouth: 6, acc: 4, accColor: 1, skin: 4, top: 8, topColor: 6, prop: 10, bg: 9 }),
  preset("야옹이", { hair: 8, hairColor: 5, eyes: 3, mouth: 8, cheek: 1, acc: 8, accColor: 4, skin: 10, top: 2, topColor: 7, bg: 5 }),
];

/** 저장된 프리셋 인덱스 정규화: 범위 밖(손상 저장분)은 null(프리셋 아님)로.
 *  주의: null 가드가 먼저다. Number(null)은 0이라 가드 없이는 "프리셋 아님"이
 *  프리셋 0번("기본")으로 둔갑해 커스텀·기본 아바타가 영영 안 보인다(실사고 2026-07-16). */
export function normPreset(i: number | null | undefined): number | null {
  if (i == null) return null;
  const n = Math.floor(Number(i));
  return Number.isFinite(n) && n >= 0 && n < STICK_PRESETS.length ? n : null;
}

/* ── 무작위 조합(픽커의 주사위) ──────────────────────────────
   아무 조합이나 뽑으면 안경·모자·소품이 전부 붙어 지저분해진다. 장식류는 확률로 걸러서
   "그럴듯한 한 명"이 나오게 한다. */
export function randomStick(rnd: () => number = Math.random): StickCfg {
  const pick = (n: number): number => Math.floor(rnd() * n);
  /** 0번(없음)을 뺀 나머지에서 뽑되, chance 확률로만 붙인다. */
  const maybe = (n: number, chance: number): number => (rnd() < chance ? 1 + pick(n - 1) : 0);
  return {
    face: pick(COUNT.face),
    hair: pick(COUNT.hair),
    eyes: pick(COUNT.eyes),
    mouth: pick(COUNT.mouth),
    glasses: maybe(COUNT.glasses, 0.3),
    acc: maybe(COUNT.acc, 0.4),
    // 피부색은 자연스러운 톤(0~5)이 더 자주 나오게 한다.
    skin: rnd() < 0.7 ? pick(6) : 6 + pick(COUNT.skin - 6),
    hairColor: pick(COUNT.hairColor),
    cheek: maybe(COUNT.cheek, 0.35),
    top: pick(COUNT.top),
    topColor: pick(COUNT.topColor),
    accColor: pick(COUNT.accColor),
    prop: maybe(COUNT.prop, 0.4),
    bg: pick(COUNT.bg),
  };
}

/* ── 합성 ────────────────────────────────────────────────── */
export interface StickSvgOpts {
  /** "bust" 상반신(기본) · "head" 얼굴 확대(탭바 21px처럼 아주 작게 쓸 때) · 그 밖의 문자열은 viewBox로 쓴다. */
  view?: string;
  /** false면 배경을 그리지 않는다(파츠 썸네일). */
  bg?: boolean;
  /** 이 슬롯들을 0번(없음·기본)으로 접어 그린다. */
  hide?: StickKey[];
}
const VIEWS: Record<string, string> = { bust: "0 0 96 96", head: "14 10 68 68" };

let seq = 0;

/** 조합을 SVG 마크업으로 합성: .stick-avatar 프레임이 100%로 채워 쓴다.
 *  그룹 클래스(sa-bob·sa-eyes·sa-prop)는 꾸미기 시트 미리보기의 숨쉬기·깜빡임에만 쓰인다(stickavatar.css). */
export function stickAvatarSvg(raw: Partial<StickAvatarCfg> | null | undefined, opts: StickSvgOpts = {}): string {
  const c = normStick(raw);
  for (const k of opts.hide ?? []) c[k] = 0;
  const uid = String(++seq);
  const p: Paint = { skin: SKINS[c.skin], hair: HAIR_COLS[c.hairColor], top: TOP_COLS[c.topColor], acc: ACC_COLS[c.accColor], uid };

  const hair = HAIRS[c.hair];
  const acc = ACCS[c.acc];
  const top = TOPS[c.top];
  const hatted = acc.hatLine != null;

  // 모자를 쓰면 머리카락이 모자 속으로 들어간다. 전용 모양이 있으면 그것을, 없으면 모자 선 위를 잘라 낸다.
  let defs = "";
  let hairBack = hair.back?.(p) ?? "";
  let hairFront = hair.front?.(p) ?? "";
  if (hatted) {
    if (hair.hat) {
      hairBack = hair.hat.back?.(p) ?? "";
      hairFront = hair.hat.front?.(p) ?? "";
    } else {
      const y = acc.hatLine as number;
      defs = `<clipPath id="hc${uid}"><rect x="-10" y="${y}" width="116" height="${110 - y}"/></clipPath>`;
      const clip = (s: string): string => (s ? `<g clip-path="url(#hc${uid})">${s}</g>` : "");
      hairBack = clip(hairBack);
      hairFront = clip(hairFront) + (hair.tuck?.(p) ?? "");
    }
  }
  const knot = hatted || acc.top ? "" : hair.knot?.(p) ?? "";

  const viewBox = VIEWS[opts.view ?? "bust"] ?? opts.view ?? VIEWS.bust;
  return (
    `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
    defs +
    (opts.bg === false ? "" : `<g class="sa-bg">${BGS[c.bg].draw(p)}</g>`) +
    (top.back?.(p) ?? "") +
    `<g class="sa-bob">${hairBack}</g>` +
    (top.front?.(p) ?? "") +
    `<g class="sa-bob">` +
    (FACES[c.face].front?.(p) ?? "") +
    (CHEEKS[c.cheek].front?.(p) ?? "") +
    `<g class="sa-eyes">${EYES[c.eyes].front?.(p) ?? ""}</g>` +
    (MOUTHS[c.mouth].front?.(p) ?? "") +
    hairFront +
    (acc.knotOver ? "" : knot) +
    (GLASSES[c.glasses].front?.(p) ?? "") +
    (acc.front?.(p) ?? "") +
    (acc.knotOver ? knot : "") +
    `</g>` +
    `<g class="sa-prop">${PROPS[c.prop].front?.(p) ?? ""}</g>` +
    `</svg>`
  );
}
