// 인증 — Supabase OAuth(구글·카카오). core/sync.ts와 함께 "로그인 = 기기 간 동기화"를 만든다.
// 정책(불변): 로그인은 강요하지 않는다 — 학습·구매 모두 무로그인 가능, 기록은 기기 저장이 기본.
// 환경변수(VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY, .env.local)가 없으면 전부 조용히 no-op —
// dev·e2e·기존 배포 어디서도 백엔드 없이 그대로 동작한다(연동 절차는 SUPABASE_SETUP.md).
// supabase-js는 three와 같은 규칙으로 동적 import — 로그인 안 한 기기는 번들을 아예 받지 않는다.
import type { SupabaseClient, User } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
// BOM·공백 제거 필수: 배포 파이프라인이 환경변수 값 앞에 U+FEFF를 붙인 실사고 — 헤더에 들어가면
// fetch가 "String contains non ISO-8859-1 code point"로 전부 죽는다(로컬은 멀쩡해 재현 안 됨).
const cleanEnv = (v: unknown): string => (typeof v === "string" ? v.replace(/\uFEFF/g, "").trim() : "");
const SUPABASE_URL = cleanEnv(env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = cleanEnv(env.VITE_SUPABASE_ANON_KEY);

export type OAuthProvider = "google" | "kakao";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: string | null;
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
  // 소셜 프로필 사진(avatar_url·picture)은 의도적으로 읽지 않는다 — 미성년 사용자 개인정보라
  // 화면 어디에도 쓰지 않는다(2026-07-12 결정). 아바타는 앱 자체 스틱맨으로 그린다.
  return { id: u.id, email: u.email ?? null, name, provider: u.app_metadata?.provider ?? null };
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
      // detectSessionInUrl을 끄고 코드 교환을 initAuth가 직접 실행한다 — 자동 교환은 실패해도
      // 원인을 밖으로 내주지 않아 실기기(안드로이드 소셜 복귀) 디버깅이 불가능했다.
      const c = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { flowType: "pkce", detectSessionInUrl: false },
      });
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

// OAuth 복귀 URL에 실려 온 에러(사용자 거부·프로바이더 설정 문제 등) — 로그인 화면이 1회 소비해 표시한다.
let lastAuthError: string | null = null;

export function consumeAuthError(): string | null {
  const e = lastAuthError;
  lastAuthError = null;
  return e;
}

function storageHasSession(): boolean {
  try {
    return !!localStorage.getItem(sessionStorageKey());
  } catch {
    return false; // 사생활 보호 모드 등 — 세션 없음으로 간주
  }
}

/** 다른 컨텍스트(새 탭·카카오톡 인앱 브라우저 등)에서 완결된 로그인을 이 탭이 알아채게 한다.
 *  안드로이드 소셜 로그인은 앱 전환 뒤 새 탭으로 돌아오는 일이 흔한데, 그 탭이 세션을 저장하면
 *  원래 탭은 storage 이벤트/재노출 시점에 클라이언트를 깨워 세션을 집어 든다. */
function watchExternalSession(): void {
  const pickup = (): void => {
    if (user || !storageHasSession()) return;
    void getSupabase().then((c) => c.auth.getSession()); // getClient가 세션을 읽고 emit까지 처리
  };
  try {
    window.addEventListener("storage", (e) => {
      if (e.key === sessionStorageKey()) pickup();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") pickup();
    });
  } catch {
    /* 무시 */
  }
}

/** 앱 시작 시 1회 — OAuth 리다이렉트 복귀이거나 세션 흔적이 있는 기기만 클라이언트를 깨운다. */
export async function initAuth(): Promise<void> {
  if (!isAuthConfigured()) return;
  watchExternalSession();

  // OAuth 실패 복귀(?error=…) — 원인을 담아 두고 주소만 청소(성공 경로보다 먼저 확인)
  const search = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const errDesc =
    search.get("error_description") ?? hash.get("error_description") ?? search.get("error") ?? hash.get("error");
  if (errDesc) {
    lastAuthError = errDesc.replace(/\+/g, " ");
    try {
      history.replaceState(null, "", location.pathname);
    } catch {
      /* 무시 */
    }
  }

  const code = search.get("code");
  if (code) {
    // OAuth 성공 복귀 — 코드 교환을 직접 실행하고, 실패 이유를 반드시 남긴다(조용한 실패 금지).
    try {
      history.replaceState(null, "", location.pathname); // 재시도·새로고침이 만료 코드를 재사용하지 않게 먼저 청소
    } catch {
      /* 무시 */
    }
    try {
      const c = await getSupabase();
      const { error } = await c.auth.exchangeCodeForSession(code);
      if (error) lastAuthError = error.message;
    } catch (e) {
      lastAuthError = e instanceof Error ? e.message : String(e);
    }
    return;
  }
  if (storageHasSession()) await getSupabase(); // 세션 복원(getClient의 getSession이 emit까지 처리)
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

/** 회원탈퇴 — 서버의 계정과 학습 기록을 완전히 삭제한다(개인정보처리방침 7조의 구현).
 *  anon 키로는 auth.users를 지울 수 없어 schema.sql의 delete_user RPC(security definer)를 호출한다 —
 *  auth.users 삭제가 profiles·progress로 cascade. 기기의 학습 기록(store)은 지우지 않는다(무로그인 정책과 같은 결). */
export async function deleteAccount(): Promise<{ ok: boolean; reason?: string }> {
  if (!isAuthConfigured() || !user) return { ok: false, reason: "로그인 상태가 아니에요" };
  try {
    const c = await getSupabase();
    const { error } = await c.rpc("delete_user");
    if (error) return { ok: false, reason: error.message };
    // 서버 계정은 이미 삭제됨 — 세션 토큰은 이 기기에서만 정리한다(서버 호출은 이미 무효).
    try {
      await c.auth.signOut({ scope: "local" });
    } catch {
      /* 무시 — 아래에서 상태는 로그아웃 처리 */
    }
    user = null;
    emit();
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
