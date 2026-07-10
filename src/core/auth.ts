// 인증 — Supabase OAuth(구글·카카오). core/sync.ts와 함께 "로그인 = 기기 간 동기화"를 만든다.
// 정책(불변): 로그인은 강요하지 않는다 — 학습·구매 모두 무로그인 가능, 기록은 기기 저장이 기본.
// 환경변수(VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY, .env.local)가 없으면 전부 조용히 no-op —
// dev·e2e·기존 배포 어디서도 백엔드 없이 그대로 동작한다(연동 절차는 SUPABASE_SETUP.md).
// supabase-js는 three와 같은 규칙으로 동적 import — 로그인 안 한 기기는 번들을 아예 받지 않는다.
import type { SupabaseClient, User } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
const SUPABASE_URL = typeof env.VITE_SUPABASE_URL === "string" ? env.VITE_SUPABASE_URL : "";
const SUPABASE_ANON_KEY = typeof env.VITE_SUPABASE_ANON_KEY === "string" ? env.VITE_SUPABASE_ANON_KEY : "";

export type OAuthProvider = "google" | "kakao";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: string | null;
  avatarUrl: string | null; // 구글·카카오 프로필 사진(없으면 스틱맨 아바타 폴백)
}

export function isAuthConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let clientPromise: Promise<SupabaseClient> | null = null;
let user: AuthUser | null = null;
const listeners = new Set<(u: AuthUser | null) => void>();

function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    typeof meta.name === "string" ? meta.name : typeof meta.full_name === "string" ? meta.full_name : null;
  const avatarUrl =
    typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null;
  return { id: u.id, email: u.email ?? null, name, provider: u.app_metadata?.provider ?? null, avatarUrl };
}

function emit(): void {
  for (const fn of [...listeners]) fn(user);
}

export function currentUser(): AuthUser | null {
  return user;
}

/** 인증 상태 구독. 등록 즉시 현재 상태로 1회 호출된다. 해제 함수를 반환. */
export function onAuthChange(fn: (u: AuthUser | null) => void): () => void {
  listeners.add(fn);
  fn(user);
  return () => {
    listeners.delete(fn);
  };
}

/** supabase 세션 저장 키 — "로그인한 적 있는 기기"인지 번들 로드 전에 판별하는 용도. */
function sessionStorageKey(): string {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return "";
  }
}

/** supabase 클라이언트(지연 생성). sync.ts가 DB 접근에도 쓴다. */
export async function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: "pkce" } });
      c.auth.onAuthStateChange((_event, session) => {
        // supabase 규칙: 이 콜백 안에서 supabase 호출 금지(교착) — 다음 틱으로 미뤄 알린다.
        const next = toAuthUser(session?.user);
        window.setTimeout(() => {
          user = next;
          emit();
        }, 0);
      });
      const { data } = await c.auth.getSession();
      user = toAuthUser(data.session?.user);
      emit();
      return c;
    })();
  }
  return clientPromise;
}

/** 앱 시작 시 1회 — OAuth 리다이렉트 복귀이거나 세션 흔적이 있는 기기만 클라이언트를 깨운다. */
export async function initAuth(): Promise<void> {
  if (!isAuthConfigured()) return;
  const returning = location.search.includes("code=") || location.hash.includes("access_token=");
  let hasSession = false;
  try {
    hasSession = !!localStorage.getItem(sessionStorageKey());
  } catch {
    /* 사생활 보호 모드 등 — 세션 없음으로 간주 */
  }
  if (!returning && !hasSession) return;
  await getSupabase(); // detectSessionInUrl(기본 켜짐)이 PKCE 코드 교환까지 처리
  if (returning) {
    try {
      history.replaceState(null, "", location.pathname); // 주소창의 ?code=… 청소
    } catch {
      /* 무시 */
    }
  }
}

/** 소셜 로그인 시작 — 성공 시 공급자 페이지로 이동한다(이 페이지는 떠남). */
export async function signInWith(provider: OAuthProvider): Promise<boolean> {
  if (!isAuthConfigured()) return false;
  try {
    const c = await getSupabase();
    const { error } = await c.auth.signInWithOAuth({
      provider,
      options: { redirectTo: location.origin + location.pathname },
    });
    return !error;
  } catch {
    return false;
  }
}

/** 로그아웃 — 서버 세션만 정리한다. 기기의 학습 기록(store)은 그대로 둔다(정책). */
export async function signOut(): Promise<void> {
  if (!clientPromise) return;
  try {
    const c = await getSupabase();
    await c.auth.signOut();
  } catch {
    /* 네트워크 실패여도 아래에서 로컬 상태는 로그아웃 처리 */
  }
  user = null;
  emit();
}
