// 파츠 조합형 스틱맨 아바타 — 발주 래스터 프리셋(avatar.ts PROFILE)과 별개의 코드 SVG 레이어 시스템.
// 슬롯별 파츠를 같은 좌표계(viewBox 0 0 96 96, 머리 중심 48,45)에 겹쳐 "내가 꾸민 스틱맨"을 만든다.
// 벡터라 지도 워커·완료 연출에 재사용 가능(발주 래스터는 조합 폭발·애니 불가로 부적합 — 사용자 확정 2026-07-12).
// 레이어 순서: hairBack → 어깨(버스트) → 얼굴형 → 눈 → 입 → hairFront → 안경 → 소품(모자류).
// 선맛: 잉크 단색 + 포인트 컬러(토스 블루·새싹 그린·혀 핑크)만 — 스틱맨 손그림 정체성 유지.
// 파츠 추가는 각 배열 끝에 append만(저장된 인덱스가 살아 있도록 순서 변경·삭제 금지 — avatar.ts와 같은 규약).

import type { StickAvatarCfg } from "../core/store";

const INK = "#2A3542";
const BLUE = "#3182F6";
const BLUE_D = "#1B64DA";
const GREEN = "#2EA96C";
const PINK = "#F0879E";

export interface StickPart {
  name: string;
  /** 머리 뒤에 깔리는 레이어(양갈래·포니테일·긴 머리의 뒷부분). */
  back?: string;
  /** 얼굴 위에 얹는 레이어. */
  front?: string;
}

/* ── 얼굴형 ──────────────────────────────────────────────── */
const FACES: StickPart[] = [
  { name: "동글", front: `<circle cx="48" cy="45" r="24.5" fill="#fff" stroke="${INK}" stroke-width="3"/>` },
  { name: "갸름", front: `<ellipse cx="48" cy="45.5" rx="21.5" ry="25.5" fill="#fff" stroke="${INK}" stroke-width="3"/>` },
  { name: "각진", front: `<rect x="26.5" y="21" width="43" height="48" rx="15" fill="#fff" stroke="${INK}" stroke-width="3"/>` },
  { name: "통통", front: `<ellipse cx="48" cy="46" rx="26" ry="23.5" fill="#fff" stroke="${INK}" stroke-width="3"/>` },
];

/* ── 머리 ────────────────────────────────────────────────── */
// 앞머리 크라운(초승달) — 단발보다 짧은 공용 형태(양갈래·포니테일·긴 머리가 공유).
const CROWN = `<path d="M27,44 C25,27 36,17.5 48,17.5 C60,17.5 71,27 69,44 C66,30 58,25.5 48,25.5 C38,25.5 30,30 27,44 z" fill="${INK}"/>`;
const HAIRS: StickPart[] = [
  { name: "민머리" },
  {
    name: "새싹",
    front:
      `<path d="M48,22 L48,15.5" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M48,16 C46,10.5 40.5,8.5 35.5,10 C37.5,15.5 43,17.8 48,16 z" fill="${GREEN}"/>` +
      `<path d="M48,16 C50,10.5 55.5,8.5 60.5,10 C58.5,15.5 53,17.8 48,16 z" fill="${GREEN}"/>`,
  },
  {
    // 옛 이름 '단발' — 진짜 단발(옆머리 가닥)이 8번으로 들어오며 개명(이름은 저장에 안 실려 자유).
    name: "바가지",
    front: `<path d="M27,50 C24,28 35,17 48,17 C61,17 72,28 69,50 C67,32 59,26 48,26 C37,26 29,32 27,50 z" fill="${INK}"/>`,
  },
  {
    name: "까치머리",
    front: `<path d="M31,30 L26,19 L35,25 L36.5,14.5 L43,22 L48,12 L53,22 L59.5,14.5 L61,25 L70,19 L65,30 C60,24 54,21.5 48,21.5 C42,21.5 36,24 31,30 z" fill="${INK}"/>`,
  },
  {
    name: "곱슬",
    front: `<circle cx="35" cy="26" r="8.5" fill="${INK}"/><circle cx="48" cy="21.5" r="9.5" fill="${INK}"/><circle cx="61" cy="26" r="8.5" fill="${INK}"/>`,
  },
  {
    name: "양갈래",
    back: `<ellipse cx="21.5" cy="52" rx="7.5" ry="13" transform="rotate(10 21.5 52)" fill="${INK}"/><ellipse cx="74.5" cy="52" rx="7.5" ry="13" transform="rotate(-10 74.5 52)" fill="${INK}"/>`,
    front: CROWN + `<circle cx="25.5" cy="41" r="2.7" fill="${BLUE}"/><circle cx="70.5" cy="41" r="2.7" fill="${BLUE}"/>`,
  },
  {
    name: "포니테일",
    back: `<path d="M62,22 C71,16.5 79,19.5 80.5,27.5 C81,37.5 76.5,50 73.5,60 C72,50 70.5,38 67.5,30 C66,26.5 64,24 62,22 z" fill="${INK}"/>`,
    front: CROWN + `<circle cx="67" cy="25" r="2.7" fill="${BLUE}"/>`,
  },
  {
    name: "긴 생머리",
    back:
      `<path d="M26.5,33 C21,45 20,62 21.5,79 L33.5,79 C29.5,62 29.5,46 32,35 z" fill="${INK}"/>` +
      `<path d="M69.5,33 C75,45 76,62 74.5,79 L62.5,79 C66.5,62 66.5,46 64,35 z" fill="${INK}"/>`,
    front: CROWN,
  },
  {
    // 마이페이지 리디자인 목업에서 차용(2026-07-15) — 바가지 크라운 + 턱선까지 내려오는 옆머리 가닥.
    name: "단발",
    front:
      `<path d="M27,50 C24,28 35,17 48,17 C61,17 72,28 69,50 C67,32 59,26 48,26 C37,26 29,32 27,50 z" fill="${INK}"/>` +
      `<path d="M26.2,37.5 C23.2,45 22.8,54.5 24.8,62 C26.6,64 30.4,64.3 32.2,62.8 C30,53.5 29.9,45.5 30.8,40 z" fill="${INK}"/>` +
      `<path d="M69.8,37.5 C72.8,45 73.2,54.5 71.2,62 C69.4,64 65.6,64.3 63.8,62.8 C66,53.5 66.1,45.5 65.2,40 z" fill="${INK}"/>`,
  },
];

/* ── 눈 ──────────────────────────────────────────────────── */
const EYES: StickPart[] = [
  { name: "점눈", front: `<circle cx="39" cy="44" r="2.6" fill="${INK}"/><circle cx="57" cy="44" r="2.6" fill="${INK}"/>` },
  {
    name: "웃음눈",
    front: `<path d="M34.5,45.5 C36.5,41.5 41.5,41.5 43.5,45.5 M52.5,45.5 C54.5,41.5 59.5,41.5 61.5,45.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    name: "또랑눈",
    front:
      `<circle cx="39" cy="44" r="5.2" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="57" cy="44" r="5.2" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` +
      `<circle cx="40" cy="44.6" r="2" fill="${INK}"/><circle cx="58" cy="44.6" r="2" fill="${INK}"/>`,
  },
  {
    name: "반짝눈",
    front:
      `<circle cx="39" cy="44" r="4.4" fill="${INK}"/><circle cx="57" cy="44" r="4.4" fill="${INK}"/>` +
      `<circle cx="40.5" cy="42.5" r="1.5" fill="#fff"/><circle cx="58.5" cy="42.5" r="1.5" fill="#fff"/>`,
  },
  {
    name: "졸린눈",
    front: `<path d="M34.5,43.5 C36.5,46.5 41.5,46.5 43.5,43.5 M52.5,43.5 C54.5,46.5 59.5,46.5 61.5,43.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    name: "윙크",
    front: `<circle cx="39" cy="44" r="2.6" fill="${INK}"/><path d="M52.5,44.5 C54.5,41 59.5,41 61.5,44.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
];

/* ── 입·표정 ─────────────────────────────────────────────── */
const MOUTHS: StickPart[] = [
  { name: "미소", front: `<path d="M42,55.5 C45,58.8 51,58.8 54,55.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
  { name: "활짝", front: `<path d="M40,54 C42,61 54,61 56,54 z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` },
  { name: "오", front: `<ellipse cx="48" cy="57.5" rx="3.6" ry="4.4" fill="${INK}"/>` },
  { name: "새침", front: `<path d="M42.5,56.5 C46,54.8 50,58.2 53.5,56.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
  { name: "씨익", front: `<path d="M43.5,56.5 C47.5,59 53,57.5 55.5,53.5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
  {
    name: "메롱",
    front:
      `<path d="M42,55 C45,58 51,58 54,55" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M45.6,56.8 C45.6,61.5 50.4,61.5 50.4,57 z" fill="${PINK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  },
];

/* ── 안경 ────────────────────────────────────────────────── */
const GLASSES: StickPart[] = [
  { name: "없음" },
  {
    name: "둥근 안경",
    front:
      `<circle cx="39" cy="45" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="57" cy="45" r="8" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
      `<path d="M47,44.5 C47.6,43.8 48.4,43.8 49,44.5 M31,43.5 L26,42 M65,43.5 L70,42" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    name: "사각 안경",
    front:
      `<rect x="31" y="38.5" width="15" height="12.5" rx="3.5" fill="none" stroke="${INK}" stroke-width="2.5"/><rect x="50" y="38.5" width="15" height="12.5" rx="3.5" fill="none" stroke="${INK}" stroke-width="2.5"/>` +
      `<path d="M46,43.5 h4 M31,42.5 L26.5,41.5 M65,42.5 L69.5,41.5" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    name: "뿔테 안경",
    front:
      `<rect x="30.5" y="38" width="16" height="13" rx="4.5" fill="none" stroke="${INK}" stroke-width="3.5"/><rect x="49.5" y="38" width="16" height="13" rx="4.5" fill="none" stroke="${INK}" stroke-width="3.5"/>` +
      `<path d="M46.5,43 h3" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    // 마이페이지 리디자인 목업에서 차용(2026-07-15) — 뿔테 지오메트리를 잉크로 채운 렌즈.
    name: "선글라스",
    front:
      `<rect x="30.5" y="38" width="16" height="13" rx="4.5" fill="${INK}"/><rect x="49.5" y="38" width="16" height="13" rx="4.5" fill="${INK}"/>` +
      `<path d="M46.5,43 h3 M30.5,42.5 L26,41.5 M65.5,42.5 L70,41.5" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
];

/* ── 소품(머리에 쓰는 것 — 머리카락 위에 얹힌다) ─────────── */
const ACCS: StickPart[] = [
  { name: "없음" },
  {
    name: "비니",
    front:
      `<path d="M28,37 C28,22.5 37,15 48,15 C59,15 68,22.5 68,37 L68,40.5 C61,37.5 35,37.5 28,40.5 z" fill="${BLUE}" stroke="${BLUE_D}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M28,40 C35,37 61,37 68,40 L68,44.5 C61,41.5 35,41.5 28,44.5 z" fill="${BLUE_D}"/>` +
      `<circle cx="48" cy="13.5" r="3.6" fill="#fff" stroke="${INK}" stroke-width="2"/>`,
  },
  {
    name: "야구모자",
    front:
      `<path d="M28.5,34.5 C28.5,21 37.5,14.5 48,14.5 C58.5,14.5 67.5,21 67.5,34.5 C60,31.5 36,31.5 28.5,34.5 z" fill="${BLUE}" stroke="${BLUE_D}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M64,31.5 C73,31.5 79,34 79,37.5 C73.5,36 68,35.3 64.5,35.6 z" fill="${BLUE_D}"/>` +
      `<circle cx="48" cy="14" r="2.2" fill="${BLUE_D}"/>`,
  },
  {
    name: "헤드폰",
    front:
      `<path d="M27.5,40 C27.5,23 36.5,14.5 48,14.5 C59.5,14.5 68.5,23 68.5,40" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="22.5" y="38" width="9.5" height="15" rx="4.75" fill="${BLUE}" stroke="${INK}" stroke-width="2.5"/><rect x="64" y="38" width="9.5" height="15" rx="4.75" fill="${BLUE}" stroke="${INK}" stroke-width="2.5"/>`,
  },
];

/* ── 어깨(버스트) — y97로 열어 두면 아래 변이 viewBox 밖이라 선이 안 생긴다 ── */
const BUST =
  `<path d="M21.5,97 C23.5,79 33,71.5 48,71.5 C63,71.5 72.5,79 74.5,97" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
  `<path d="M42.5,73.5 L48,79 L53.5,73.5" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;

/* ── 슬롯 메타(픽커가 순회) ──────────────────────────────── */
export interface StickSlot {
  key: keyof StickAvatarCfg;
  label: string;
  parts: StickPart[];
}

export const STICK_SLOTS: StickSlot[] = [
  { key: "face", label: "얼굴형", parts: FACES },
  { key: "hair", label: "머리", parts: HAIRS },
  { key: "eyes", label: "눈", parts: EYES },
  { key: "mouth", label: "입·표정", parts: MOUTHS },
  { key: "glasses", label: "안경", parts: GLASSES },
  { key: "acc", label: "소품", parts: ACCS },
];

/** 처음 커스텀에 들어왔을 때의 시작 조합 — 브랜드 기본(새싹 머리)과 같은 결. */
export const DEFAULT_STICK: StickAvatarCfg = { face: 0, hair: 1, eyes: 0, mouth: 0, glasses: 0, acc: 0 };

function clampIdx(parts: StickPart[], i: number): number {
  const n = Math.floor(Number(i) || 0);
  return n >= 0 && n < parts.length ? n : 0;
}

/** 저장값 정규화 — 범위 밖 인덱스(파츠 삭제·손상 저장분)는 0으로 되돌린다. */
export function normStick(raw: Partial<StickAvatarCfg> | null | undefined): StickAvatarCfg {
  const r = raw ?? DEFAULT_STICK;
  return {
    face: clampIdx(FACES, r.face ?? 0),
    hair: clampIdx(HAIRS, r.hair ?? 0),
    eyes: clampIdx(EYES, r.eyes ?? 0),
    mouth: clampIdx(MOUTHS, r.mouth ?? 0),
    glasses: clampIdx(GLASSES, r.glasses ?? 0),
    acc: clampIdx(ACCS, r.acc ?? 0),
  };
}

/* ── 캐릭터 프리셋(마이 탭 '캐릭터 고르기') ──────────────────
   직접 꾸미기와 완전히 분리된 "완성 캐릭터"(2026-07-15 사용자 확정 — 고른 캐릭터를
   이어서 꾸미게 하지 않는다). 고르면 store.avatarPreset만 바뀌고 내가 꾸민 조합
   (store.avatarCustom)은 그대로 남는다. 추가는 배열 끝에 append만(저장 인덱스 보존). */
export interface StickPreset {
  name: string;
  cfg: StickAvatarCfg;
}

export const STICK_PRESETS: StickPreset[] = [
  // 0 기본 = 게스트 스틱(DEFAULT_STICK와 동일 조합) — 아무것도 안 고른 첫 아바타가 곧 이 캐릭터라
  // '기본'을 누르면 처음 모습으로 돌아간다(사용자 확정 2026-07-16). 구 '기본'(바가지)은 1번이 승계.
  { name: "기본", cfg: { face: 0, hair: 1, eyes: 0, mouth: 0, glasses: 0, acc: 0 } },
  { name: "방글", cfg: { face: 0, hair: 2, eyes: 1, mouth: 1, glasses: 0, acc: 0 } },
  { name: "모범생", cfg: { face: 1, hair: 8, eyes: 0, mouth: 3, glasses: 2, acc: 0 } },
  { name: "힙스터", cfg: { face: 2, hair: 4, eyes: 0, mouth: 4, glasses: 4, acc: 0 } },
  { name: "게이머", cfg: { face: 0, hair: 3, eyes: 2, mouth: 2, glasses: 0, acc: 3 } },
  { name: "캡틴", cfg: { face: 3, hair: 0, eyes: 1, mouth: 5, glasses: 0, acc: 2 } },
];

/** 저장된 프리셋 인덱스 정규화 — 범위 밖(손상 저장분)은 null(프리셋 아님)로.
 *  주의: null 가드가 먼저다 — Number(null)은 0이라 가드 없이는 "프리셋 아님"이
 *  프리셋 0번("기본")으로 둔갑해 커스텀·기본 아바타가 영영 안 보인다(실사고 2026-07-16). */
export function normPreset(i: number | null | undefined): number | null {
  if (i == null) return null;
  const n = Math.floor(Number(i));
  return Number.isFinite(n) && n >= 0 && n < STICK_PRESETS.length ? n : null;
}

/** 조합을 SVG 마크업으로 합성 — .stick-avatar 프레임이 100%로 채워 쓴다. */
export function stickAvatarSvg(raw: Partial<StickAvatarCfg> | null | undefined): string {
  const c = normStick(raw);
  const hair = HAIRS[c.hair];
  return (
    `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
    (hair.back ?? "") +
    BUST +
    (FACES[c.face].front ?? "") +
    (EYES[c.eyes].front ?? "") +
    (MOUTHS[c.mouth].front ?? "") +
    (hair.front ?? "") +
    (GLASSES[c.glasses].front ?? "") +
    (ACCS[c.acc].front ?? "") +
    `</svg>`
  );
}
