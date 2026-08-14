// URL 라우팅(해시) — 토스PG 심사 대응(2026-08-14 사용자 지시): 로그인·상품(프리미엄)·환불·과목·학년
// 화면에 공유 가능한 주소를 부여한다. 심사 제출 URL = /#/pricing(상품 확인)·/refund.html(환불 정본).
// 왜 해시(#/…)인가: vercel.json(rewrite) 없이 정적 배포 그대로 동작하고(vite base "./" 유지),
// OAuth 복귀(?code=…)·결제 복귀(?pay=…)의 쿼리 파싱과 충돌하지 않는다(해시는 서버로 가지 않는다).
// 계약(위반 금지):
// ① 쓰기는 전부 writeHash(replaceState) — pushState 금지. 하드웨어 뒤로가기 가드(main.ts
//    armHistory)가 히스토리 깊이를 소유하므로, 라우팅이 엔트리를 더 쌓으면 back 동작이 어긋난다.
// ② 읽기는 부팅 1회 + hashchange(주소창 직접 수정)뿐. popstate에 딸려 오는 hashchange는 main.ts가
//    무시한다(뒤로가기 한 번에 appBack과 해시 적용이 겹치는 이중 내비 차단).
// ③ 레슨·시험 등 학습 화면은 주소를 갖지 않는다(진행 상태가 URL로 복원될 수 없는 화면 — 마지막
//    주소를 유지해 새로고침 시 근처 화면으로 돌아간다).
import type { GnavKey } from "../ui/gnav";

export type RouteSubject = "sci" | "math" | "soc" | "his";
export type AppRoute =
  | { k: "tab"; tab: GnavKey }
  | { k: "subject"; s: RouteSubject }
  | { k: "grade"; g: "g1" | "g2" }
  | { k: "login" }
  | { k: "pricing" }
  | { k: "policy"; file: "refund.html" | "privacy.html" };

const TABS: readonly string[] = ["home", "subjects", "review", "challenge", "my"];
const SUBJECTS: readonly string[] = ["sci", "math", "soc", "his"];

/** 해시 → 라우트. 모르는 주소는 null — 부팅이면 스플래시로, hashchange면 무시. */
export function parseRoute(hash: string): AppRoute | null {
  const h = (hash || "").replace(/^#\/?/, "").replace(/\/+$/, "").toLowerCase();
  if (!h) return null;
  const [a, b] = h.split("/");
  if (TABS.includes(a) && !b) return { k: "tab", tab: a as GnavKey };
  if (a === "subject" && !!b && SUBJECTS.includes(b)) return { k: "subject", s: b as RouteSubject };
  if (a === "grade" && (b === "g1" || b === "g2")) return { k: "grade", g: b };
  if (a === "login") return { k: "login" };
  if (a === "pricing" || a === "premium") return { k: "pricing" };
  if (a === "refund") return { k: "policy", file: "refund.html" };
  if (a === "privacy") return { k: "policy", file: "privacy.html" };
  return null;
}

/** 주소창 해시만 바꿔 쓴다(히스토리 추가 없음). h는 "login"처럼 #/ 없이 — 빈 문자열이면 해시 제거.
 *  history.state를 보존해 armHistory가 심은 가드 상태를 지우지 않는다. */
export function writeHash(h: string): void {
  try {
    const next = h ? `#/${h}` : "";
    if (location.hash === next) return;
    history.replaceState(history.state, "", location.pathname + location.search + next);
  } catch {
    /* 사생활 보호 모드 등 — 주소는 부가 기능이라 실패해도 앱 동작은 그대로 */
  }
}
