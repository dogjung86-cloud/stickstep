// 중1 과학 랩과 도입 재제작(v5)의 병행 토글(2026-11-12). 단원마다 따로 켠다.
//   켜기: 주소 ?u3v5 (세션 "ss.u3v5"="1"로 남아 같은 탭에서는 유지된다)   끄기: ?u3v5=0
//   여섯 단원을 한꺼번에: ?g1v5 (세션 "ss.g1v5")   끄기: ?g1v5=0 (단원별 표식도 함께 지운다)
//   바로 열기(개발 서버 전용): ?open=u3l2 처럼 레슨 id를 주면 그 레슨을 바로 연다. 토글과 함께 쓴다: ?u3v5&open=u3l2
// 꺼져 있거나 그 단원의 새 판이 아직 없으면(null) CURRICULUM에는 정본이 그대로 실린다(같은 객체).
// 중1 Ⅱ는 v5가 이미 정본이다. Ⅱ단원의 개념 글을 다시 쓴 판은 v6이라 부르고 주소는 ?u2v6 이다(?g1v5 로도 함께 켜진다).

// 중2 과학 전면 재제작(v5, 2026-11-12): 단원마다 ?g2u3v5 (세션 "ss.g2u3v5"), 여덟 단원을 한꺼번에 ?g2v5 (세션 "ss.g2v5"). 끄기는 =0.
//   바로 열기는 ?g2u3v5&open=g2u3l2
const PARAM = {
  u1: "u1v5", u2: "u2v6", u3: "u3v5", u4: "u4v5", u5: "u5v5", u6: "u6v5", u7: "u7v5",
  g2u1: "g2u1v5", g2u2: "g2u2v5", g2u3: "g2u3v5", g2u4: "g2u4v5", g2u5: "g2u5v5", g2u6: "g2u6v5", g2u7: "g2u7v5", g2u8: "g2u8v5",
} as const;
export type V5Key = keyof typeof PARAM;
const KEYS = Object.keys(PARAM) as V5Key[];

const query = ((): URLSearchParams | null => {
  try {
    return new URLSearchParams(location.search);
  } catch {
    return null;
  }
})();

/** 주소 꼬리표를 세션 표식으로 옮기고, 지금 켜져 있는지 돌려준다. */
const flag = (name: string): boolean => {
  try {
    const v = query?.get(name) ?? null;
    if (v === "0" || v === "off") sessionStorage.removeItem(`ss.${name}`);
    else if (v !== null) sessionStorage.setItem(`ss.${name}`, "1");
    return sessionStorage.getItem(`ss.${name}`) === "1";
  } catch {
    return false;
  }
};

/** 학년 묶음 토글(?g1v5, ?g2v5): 끄면 그 학년의 단원별 표식도 함께 지운다. */
const all = (name: string, keys: V5Key[]): boolean => {
  try {
    const v = query?.get(name) ?? null;
    if (v === "0" || v === "off") for (const k of keys) sessionStorage.removeItem(`ss.${PARAM[k]}`);
  } catch {
    /* 저장소를 못 쓰는 환경: 꺼진 것으로 본다 */
  }
  return flag(name);
};
const isG2 = (k: V5Key): boolean => k.startsWith("g2");
const ALL_G1 = all("g1v5", KEYS.filter((k) => !isG2(k)));
const ALL_G2 = all("g2v5", KEYS.filter(isG2));

const ON = Object.fromEntries(KEYS.map((k) => [k, flag(PARAM[k]) || (isG2(k) ? ALL_G2 : ALL_G1)])) as Record<V5Key, boolean>;

/** 이 단원의 새 판이 켜져 있는가 */
export const v5On = (key: V5Key): boolean => ON[key];

/** 켜져 있고 새 판이 있으면 새 판을, 아니면 정본을 그대로 돌려준다. */
export function pickV5<U>(key: V5Key, base: U, next: U | null): U {
  return next && ON[key] ? next : base;
}

/** 부팅하자마자 열 레슨(판정용 바로 열기, 개발 서버에서만 쓴다). 없으면 null */
export const V5_OPEN = ((): string | null => {
  const id = query?.get("open") ?? "";
  return /^(u[1-7]|g2u[1-8])l\d+$/.test(id) ? id : null;
})();
