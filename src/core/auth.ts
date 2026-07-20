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
// 구글 웹 클라이언트 ID(공개 식별자 — 비밀 아님). 있으면 구글 로그인은 GIS ID 토큰 방식이 우선:
// 구글 계정 선택 화면에 수파베이스 프로젝트 도메인(tzidcrq….supabase.co)이 노출되는 문제의 무료
// 해법(2026-07-21 사용자 확정 — 커스텀 도메인 유료안 기각). 없으면 기존 리다이렉트 그대로라
// 콘솔 설정 전 배포·로컬 dev·e2e 전부 무영향. 설정 절차는 SUPABASE_SETUP.md.
const GOOGLE_CLIENT_ID = cleanEnv(env.VITE_GOOGLE_CLIENT_ID);

export type OAuthProvider = "google" | "kakao";
/** signInWith 결과 — done: 이 페이지 안에서 로그인 완결(GIS), redirect: 공급자 페이지로 떠남,
 *  cancel: 사용자가 원탭 카드를 닫음(에러 아님 — 스낵 금지), error: 시작 실패. */
export type SignInResult = "done" | "redirect" | "cancel" | "error";

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  provider: string | null;
}

export function isAuthConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// 운영 계정 — 이 이메일로 로그인하면 결제 없이 프리미엄 전체 권한(콘텐츠 검수·운영용).
// dogjung86@naver.com은 카카오 로그인 계정의 이메일. 결제 상태(store.premium)와 별개의
// 겹층이라 서버에 저장하지 않는다 — main.ts가 onAuthChange로 store.setPremiumOverride에 주입.
const PRIVILEGED_EMAILS = new Set(["sciencegive@gmail.com", "dogjung86@naver.com"]);

export function isPrivilegedUser(u: AuthUser | null): boolean {
  return !!u?.email && PRIVILEGED_EMAILS.has(u.email.trim().toLowerCase());
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

/** 이 기기에 세션 토큰 흔적이 있는지 — 부팅 직후 initAuth의 복원이 아직 안 끝난 시점에
 *  "곧 로그인될 기기"를 화면 쪽이 미리 알아채는 용도(마이 탭 로그인 유도 생략 판단). */
export function hasStoredSession(): boolean {
  return storageHasSession();
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

// ---------- 구글 GIS(Identity Services) — ID 토큰 로그인 ----------
// 원탭 카드가 이 페이지 안에서 ID 토큰을 주고 signInWithIdToken으로 세션을 만든다(리다이렉트 0회).
// 구글이 표시하는 도메인 = 이 페이지(stickstep.com). 원탭이 못 뜨는 상황(쿨다운·브라우저에 구글
// 미로그인·스크립트 차단·FedCM 거부)은 전부 기존 리다이렉트 플로우로 폴백 — 로그인이 막히는 일은 없다.
interface GsiPromptMoment {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
}
interface GsiId {
  initialize(cfg: Record<string, unknown>): void;
  prompt(cb?: (m: GsiPromptMoment) => void): void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

let gsiPromise: Promise<GsiId | null> | null = null;
function loadGsi(): Promise<GsiId | null> {
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve) => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id);
        return;
      }
      try {
        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.onload = (): void => resolve(window.google?.accounts?.id ?? null);
        s.onerror = (): void => resolve(null);
        document.head.appendChild(s);
        window.setTimeout(() => resolve(window.google?.accounts?.id ?? null), 8000); // 로드 안전망(중복 resolve 무해)
      } catch {
        resolve(null);
      }
    });
  }
  return gsiPromise;
}

/** OpenID nonce — 원본은 signInWithIdToken에, SHA-256 해시는 GIS에(수파베이스 공식 패턴).
 *  crypto.subtle이 없는 비보안 컨텍스트면 nonce 없이 진행(수파베이스가 토큰에 nonce 없으면 검사 생략). */
async function makeNonce(): Promise<{ raw: string; hashed: string } | null> {
  try {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    return { raw, hashed };
  } catch {
    return null;
  }
}

function signInWithGoogleIdToken(): Promise<"done" | "cancel" | "fallback"> {
  return (async () => {
    const gsi = await loadGsi();
    if (!gsi) return "fallback" as const;
    const nonce = await makeNonce();
    return new Promise<"done" | "cancel" | "fallback">((resolve) => {
      let settled = false;
      const settle = (r: "done" | "cancel" | "fallback"): void => {
        if (!settled) {
          settled = true;
          resolve(r);
        }
      };
      // 모멘트 콜백이 어떤 이유로도 안 오면(원탭 API 변동 등) 리다이렉트로 탈출 — busy 영구 잠금 방지.
      window.setTimeout(() => settle("fallback"), 25000);
      try {
        gsi.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            void (async () => {
              if (!resp?.credential) {
                settle("fallback");
                return;
              }
              try {
                const c = await getSupabase();
                const { error } = await c.auth.signInWithIdToken({
                  provider: "google",
                  token: resp.credential,
                  ...(nonce ? { nonce: nonce.raw } : {}),
                });
                if (error) {
                  lastAuthError = error.message;
                  settle("fallback"); // 교환 실패(클라이언트 ID 미등록 등) — 리다이렉트가 마지막 그물
                } else {
                  settle("done"); // onAuthStateChange가 emit·동기화까지 이어 간다(리다이렉트 복귀와 동일 경로)
                }
              } catch (e) {
                lastAuthError = e instanceof Error ? e.message : String(e);
                settle("fallback");
              }
            })();
          },
          ...(nonce ? { nonce: nonce.hashed } : {}),
          use_fedcm_for_prompt: true,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
        });
        gsi.prompt((m) => {
          // 카드가 아예 못 뜸(쿨다운·구글 미로그인) → 폴백. 사용자가 직접 닫음 → 조용한 취소.
          // FedCM 모드에선 일부 모멘트 API가 제한 — 실패해도 credential 콜백·타임아웃이 안전망.
          try {
            if (m?.isNotDisplayed?.() || m?.isSkippedMoment?.()) settle("fallback");
            else if (m?.isDismissedMoment?.() && m.getDismissedReason?.() !== "credential_returned") settle("cancel");
          } catch {
            /* 무시 */
          }
        });
      } catch {
        settle("fallback");
      }
    });
  })();
}

/** 소셜 로그인 시작 — 구글은 GIS 원탭(페이지 안 완결) 우선, 그 외·폴백은 공급자 페이지로 리다이렉트. */
export async function signInWith(provider: OAuthProvider): Promise<SignInResult> {
  if (!isAuthConfigured()) return "error";
  if (provider === "google" && GOOGLE_CLIENT_ID) {
    const r = await signInWithGoogleIdToken();
    if (r !== "fallback") return r; // "done" | "cancel"
  }
  try {
    const c = await getSupabase();
    const { error } = await c.auth.signInWithOAuth({
      provider,
      options: { redirectTo: location.origin + location.pathname },
    });
    return error ? "error" : "redirect";
  } catch {
    return "error";
  }
}

/** 닉네임 서버 반영(profiles.nickname — 가입 트리거가 행을 만들므로 update만) —
 *  미로그인·미설정 환경에선 조용히 no-op. 성공 여부만 반환(실패해도 기기 저장이 진실). */
export async function pushNickname(nickname: string | null): Promise<boolean> {
  if (!isAuthConfigured() || !user) return false;
  try {
    const c = await getSupabase();
    const { error } = await c.from("profiles").update({ nickname }).eq("id", user.id);
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
    const { error } = await c.auth.signOut();
    // supabase는 서버 호출이 실패하면(네트워크 등) 로컬 세션을 지우지 않고 에러만 "반환"한다
    // (throw가 아니라서 catch에 안 걸린다). 그대로 두면 남은 토큰을 다음 부팅·visibilitychange
    // pickup()이 집어 들어 "로그아웃했는데 로그인된 화면이 다시 뜨는" 사고가 된다(실사용 보고,
    // 2026-07-21). 로컬 범위 로그아웃으로 이 기기의 토큰을 마저 걷어낸다.
    if (error) await c.auth.signOut({ scope: "local" });
  } catch {
    /* 네트워크 실패여도 아래에서 로컬 상태는 로그아웃 처리 */
  }
  try {
    localStorage.removeItem(sessionStorageKey()); // 최종 보증 — 이 키가 남아 있는 한 재로그인 경로가 살아 있다
  } catch {
    /* 사생활 보호 모드 등 — 무시 */
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
