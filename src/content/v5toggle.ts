// 중1 과학 랩과 도입 재제작(v5)의 병행 토글(2026-11-12). 단원마다 따로 켠다.
//   켜기: 주소 ?u3v5 (세션 "ss.u3v5"="1"로 남아 같은 탭에서는 유지된다)   끄기: ?u3v5=0
//   여섯 단원을 한꺼번에: ?g1v5 (세션 "ss.g1v5")   끄기: ?g1v5=0 (단원별 표식도 함께 지운다)
//   바로 열기(개발 서버 전용): ?open=u3l2 처럼 레슨 id를 주면 그 레슨을 바로 연다. 토글과 함께 쓴다: ?u3v5&open=u3l2
// 꺼져 있거나 그 단원의 v5가 아직 없으면(null) CURRICULUM에는 정본이 그대로 실린다(같은 객체).
// 중1 Ⅱ는 v5가 이미 정본이라 여기에 없다.

const KEYS = ["u1", "u3", "u4", "u5", "u6", "u7"] as const;
export type V5Key = (typeof KEYS)[number];

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

const ALL = ((): boolean => {
  try {
    const v = query?.get("g1v5") ?? null;
    if (v === "0" || v === "off") for (const k of KEYS) sessionStorage.removeItem(`ss.${k}v5`);
  } catch {
    /* 저장소를 못 쓰는 환경: 꺼진 것으로 본다 */
  }
  return flag("g1v5");
})();

const ON = Object.fromEntries(KEYS.map((k) => [k, flag(`${k}v5`) || ALL])) as Record<V5Key, boolean>;

/** 이 단원의 v5가 켜져 있는가 */
export const v5On = (key: V5Key): boolean => ON[key];

/** 켜져 있고 v5가 있으면 v5를, 아니면 정본을 그대로 돌려준다. */
export function pickV5<U>(key: V5Key, base: U, next: U | null): U {
  return next && ON[key] ? next : base;
}

/** 부팅하자마자 열 레슨(판정용 바로 열기, 개발 서버에서만 쓴다). 없으면 null */
export const V5_OPEN = ((): string | null => {
  const id = query?.get("open") ?? "";
  return /^u[1-7]l\d+$/.test(id) ? id : null;
})();
