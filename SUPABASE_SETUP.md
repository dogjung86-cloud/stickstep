# Supabase 설정 가이드 — 로그인·동기화 켜기

코드는 이미 준비되어 있고, 아래 절차만 마치면 로그인이 실제로 동작해요.
**환경변수를 넣기 전까지 앱은 지금처럼 로그인 없이 동작합니다**(스텁 모드) — 서두르지 않아도 돼요.

## 1. 프로젝트 만들기 (5분)

1. https://supabase.com 가입 → **New project**
2. 리전은 **Northeast Asia (Seoul)** 선택 — 학생 대상 서비스라 국내 지연시간이 중요해요.
3. 프로젝트가 뜨면 **Settings → API**에서 두 값을 복사:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` 키 → `VITE_SUPABASE_ANON_KEY`
4. `app/.env.local` 파일을 만들고 붙여넣기 (`.env.example` 참고):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

## 2. 테이블 만들기 (1분)

대시보드 → **SQL Editor** → `supabase/schema.sql` 내용 전체를 붙여넣고 **Run**.
(profiles·progress 테이블 + 본인 행만 접근하는 RLS + 가입 트리거가 만들어져요.)

## 3. 구글 로그인 (10분)

1. https://console.cloud.google.com → 프로젝트 생성 → **APIs & Services → Credentials**
2. **OAuth client ID** 생성(유형: Web application)
   - Authorized redirect URIs에 추가: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
     (정확한 값은 Supabase 대시보드 → Authentication → Providers → Google 화면에 표시돼요)
3. 발급된 Client ID·Client Secret을 Supabase → **Authentication → Providers → Google**에 붙여넣고 Enable.
4. OAuth 동의 화면(브랜딩)에 앱 이름 "스틱스텝" 설정 — 심사 전까지는 테스트 사용자만 로그인돼요.

## 4. 카카오 로그인 (10분)

1. https://developers.kakao.com → 애플리케이션 추가
2. **앱 키 → REST API 키** = Client ID로 사용
3. **카카오 로그인 활성화** + Redirect URI 등록: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
4. **보안 → Client Secret 생성** = Client Secret으로 사용
5. **동의항목**에서 "카카오계정(이메일)" 동의 설정 (이메일이 있어야 계정 식별이 안정적)
6. Supabase → **Authentication → Providers → Kakao**에 키 입력 + Enable.

> 네이버는 Supabase가 공식 지원하지 않아 앱에서 "준비 중"으로 표시돼요.
> 나중에 붙이려면 커스텀 OIDC나 엣지 펑션 경유가 필요 — 출시 후 수요 보고 판단.

## 5. 리다이렉트 URL 등록 (2분)

Supabase → **Authentication → URL Configuration**:
- Site URL: 배포 주소 (예: `https://stickstep.vercel.app`)
- Additional Redirect URLs에 개발 주소 추가: `http://localhost:5199`
  (dev 서버에서 로그인 테스트하려면 필수)

## 6. 확인

```
npm run dev
```
홈 우상단 user 버튼 → 로그인 화면에서 "Google로 계속하기"가 실제 구글 화면으로 넘어가면 성공.
로그인하면 학습 기록이 자동으로 서버와 병합·동기화돼요(코드: `src/core/sync.ts`).

## 동작 방식 요약

- `src/core/auth.ts` — OAuth·세션. 환경변수 없으면 전부 no-op, supabase-js는 동적 import라
  로그인 안 한 기기는 번들을 아예 받지 않아요.
- `src/core/sync.ts` — 병합 원칙 "학습은 잃지 않는다": 레슨·시험·게임 기록은 항목별 최대/OR,
  스틱(XP)은 큰 쪽, 스트릭은 더 최근에 공부한 기기 기준. 검토 모드·화면 설정은 동기화 안 함.
- 저장할 때마다 2.5초 디바운스로 서버에 밀어올리고, 로그인 직후에는 서버 기록을 내려받아
  기기 기록과 병합한 뒤 다시 올려요.
