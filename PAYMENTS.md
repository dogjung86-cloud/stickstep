# PAYMENTS.md — 토스페이먼츠 결제 연동 정본 (2026-08-13)

PG 심사 대기 기간에 **테스트 키로 전 구간을 가동**해 두고, 계약 완료 후 **키 2개만 교체**하면
실결제가 열리는 구조다. 이 문서가 결제 관련 구조·키 교체·운영 절차의 단일 정본이다.

## 구조 — "주문은 서버가, 가격도 서버가"

```
페이월(paywall.ts) ─ CTA → 주문 확인 시트(보호자 동의 체크·전상법 고지·BIZ_INFO)
  → buyPremium(core/purchase.ts)
    ① pay-order(수파베이스 엣지 함수) ─ JWT 검증 → 가격 재계산·대조 → orders(pending) 생성
    ② 토스 v2 SDK(js.tosspayments.com/v2/standard) requestPayment(method: CARD — 카드/간편 통합결제창)
    ③ 결제창 인증 → successUrl(/?pay=ok&paymentKey&orderId&amount) 리다이렉트 복귀
  → capturePaymentReturn(main.ts 부팅 최상단 — 주소 즉시 청소, OAuth ?code 오인 차단)
  → resumePaymentConfirm ─ 세션 복원 대기 → ④ pay-confirm(엣지 함수)
    → 토스 승인 API(POST /v1/payments/confirm, Basic base64("시크릿키:"), 멱등 키 = orderId)
    → orders paid 갱신 + entitlements(과목별 이용권) 지급 → 클라 store 반영 + 성공 스낵
```

- **가격 검증**: pay-order가 정가 사다리·얼리버드 균일가·30일 패스 세 "판매 성립 가격"만 승인
  (클라 조작·스테일 차단). 가격표는 `src/core/purchase.ts` ↔ `supabase/functions/pay-order/index.ts`
  양쪽에 있고 **qa/e2e-pay.mjs [P]부가 일치를 기계 검증**한다 — 가격 바꿀 때 반드시 둘 다 + 함수 재배포.
- **이용권 서버 진실 = entitlements 테이블**: 소장 = expires_at null, 30일 패스 = 승인 시각+30일
  (만료 집행은 로그인 시 refreshEntitlements가 교체 반영 — 오프라인 기기는 다음 접속 때).
  progress.premium은 편의 동기화 값 유지(진실 아님). RLS = 본인 행 읽기만, 쓰기는 엣지 함수(service role)뿐.
- **멱등**: 같은 주문 재승인 호출(성공 페이지 새로고침)은 지급 보증 후 결과만 반환. 패스 만료는
  승인 시각 앵커라 재호출로 늘어나지 않고, 더 긴 기존 이용권을 절대 단축하지 않는다.
- **보호자 동의 증적**: 시트 체크 → orders.guardian_consent + consent_ua(전상법 13조 2항 대응).
  시트에 의무 고지 원문·사업자 정보(BIZ_INFO)·환불 요약 표기.

## 키 체계 — 지금 어떤 키로 돌고 있나

| 자리 | 현재 값 | 교체 방법 |
|---|---|---|
| 클라이언트 키 | **내 상점(MID sticksbzvn) 테스트 키**(코드 기본값, purchase.ts) | `VITE_TOSS_CLIENT_KEY` env가 있으면 그걸 사용 |
| 시크릿 키 | supabase secrets `TOSS_SECRET_KEY` = **sticksbzvn 테스트 키** | supabase 대시보드 → Edge Functions → Secrets에서 교체 |
| 보안 키(웹훅 서명) | supabase secrets `TOSS_WEBHOOK_SECRET`에 보관(아직 미사용 — 웹훅 도입 대비) | 〃 |

- 우리 연동(v2 통합결제창 requestPayment)이 쓰는 키는 개발자센터의 **"API 개별 연동 키"**(test_ck_/test_sk_,
  MID별)다 — "주문서형·결제창형 연동 키"(test_gck_/gsk_)는 결제위젯용이라 해당 없음.
- 클라이언트 키는 **공개 식별값**(토스 문서 명시)이라 코드·번들 노출 무해. 시크릿 키는 서버(엣지 함수)에만.
- 두 키는 **같은 상점 짝**이어야 한다(짝이 어긋나면 승인 단계에서 상점 불일치 오류).
- 테스트 키 가동 중에는 체크아웃 시트에 "테스트 결제" 배지가 뜬다(live_ck_ 키면 자동 소멸).

### 1단계 — 내 상점(MID: sticksbzvn) 테스트 키로 교체 ✓ 완료(2026-08-14)

사용자 제공 API 개별 연동 테스트 키로 교체 완료 — 클라 = purchase.ts 기본값, 서버 =
TOSS_SECRET_KEY 시크릿, 보안 키 = TOSS_WEBHOOK_SECRET 시크릿. 검증: 결제창이 sticksbzvn 상점
설정(간편결제 목록 카카오페이·토스페이)으로 렌더 + 승인 API 인증 정상(가짜 키 프로브 =
NOT_FOUND_PAYMENT_SESSION, UNAUTHORIZED 아님). 이후 테스트 결제는 개발자센터 테스트 결제내역에 찍힌다.

### 2단계 — 라이브 전환(계약·심사 완료 후)

1. `VITE_TOSS_CLIENT_KEY=live_ck_…`(Vercel), `TOSS_SECRET_KEY=live_sk_…`(supabase secrets) — 같은 상점 짝.
2. **결제 오픈 체크리스트**: ① 통신판매업 신고번호를 brand.ts BIZ_INFO에 추가
   ② 얼리버드 개시면 purchase.ts EARLY_BIRD.active=true ③ 이용약관 명문화(환불은 refund.html 참조 연결)
   ④ 실카드 소액 결제·취소 1회 검증.
3. 라이브 키는 어떤 파일에도 커밋 금지(시크릿은 supabase secrets, 클라 키는 Vercel env).

## 서버 배포·스키마

- 엣지 함수 소스 정본 = `supabase/functions/pay-order|pay-confirm/index.ts`(단일 파일, Deno).
  배포는 관리 API: `POST https://api.supabase.com/v1/projects/{ref}/functions/deploy?slug=<slug>`
  multipart(metadata{entrypoint_path:"index.ts", verify_jwt:false} + file). CORS·JWT는 함수 코드가 처리.
- 테이블 정본 = `supabase/schema.sql`의 "결제" 블록(orders·entitlements·RLS·터치 트리거) —
  적용 완료(2026-08-13). 재적용도 관리 API database/query로(블록 전체 멱등).
- 결제 e2e: `PORT=<dev포트> node qa/e2e-pay.mjs`(38검증 — 가격 동기·시트 계약·로그인 게이트·
  스텁 왕복·실패 복귀). 실서버 왕복 검증은 테스트 유저 시딩(관리 API로 auth 유저 생성 → password
  grant 세션 주입) 후 실플레이 — 세부 패턴은 메모리 project-toss-payments 참조.

## PG 심사 대응 (2026-08-14 — 토스 계약 담당자 필수질문 회신 세트)

- **심사 제출 URL**: 상품/서비스 = `https://stickstep.com/#/pricing`(URL 해시 라우팅 — core/route.ts,
  로그인 = `/#/login`, 과목 = `/#/subject/sci` 등) · 환불 정책 = `https://stickstep.com/refund.html`
  (정본) · 서비스 소개 = `/about.html`. QA = `PORT=<포트> node qa/e2e-route.mjs`.
- **심사용 테스트 계정**: `toss@stickstep.com` / `20262026` — Supabase auth 실계정
  (2026-08-14 관리 API로 생성, email_confirm 완료, 일반 권한 = 과학만 노출·비프리미엄이라 결제
  플로우 시연 가능). 로그인 경로 = 마이 탭 또는 `/#/login` → "이메일로 로그인" 토글.
  프리미엄·운영 권한 없음 — PRIVILEGED_EMAILS에 절대 넣지 말 것(넣으면 페이월이 안 떠 심사 불가).
  재발급(비번 변경 포함) = 관리 API `PUT /auth/v1/admin/users/{id}`(service role — PAT로
  api-keys?reveal=true에서 취득).
- **서비스 제공기간 신고 = 12개월**(2026-08-14 사용자 확정): 소장 = 유료 제공기간 12개월 + 이후
  무상 연장 구조(CLAUDE.md 페이월 v4 항목·refund.html 10절 정본). 6개월 초과 상품이라 **가상계좌는
  계약에 넣지 않는다**(토스 정책 — 카드·간편결제만). 단건 최고가 = 현 노출 기준 24,900원(과학 2종),
  전 과목 공개 시 45,200원(4과목).
- **결제경로 PPT**: `D:\Brilliant Science\output\toss-pg\` — 가이드 요건 = 표지 가맹점 정보(테스트
  계정 포함)·하단 사업자정보·환불규정·로그인 경로·상품 구매과정·카드 결제경로(비씨는 인증 직전까지),
  전 캡처에 주소창 도메인 + PC 시계 노출 의무.
- **잔여**: 통신판매업 신고번호(사용자 신고 예정 — 나오면 brand.ts BIZ_INFO + about.html 푸터 두 곳).
- **라이브 전환 시 추가 확인**: pay-confirm의 `DOCS_TEST_SECRET` 폴백(index.ts:10·:109 — 시크릿
  미설정 시 문서 공개 테스트 키로 조용히 폴백) 제거 또는 미설정 500 처리 — 라이브에서 시크릿 누락이
  "문서 상점으로 승인 시도"가 되는 사고 방지.

## 운영 메모

- **주문 원장 조회**: orders(user_id·plan·subject_ids·amount·status·receipt_url·test_mode).
  매출전표 URL = receipt_url. 테스트 결제는 test_mode=true로 구분.
- **환불 처리(수동, 취소 API 미구현)**: 토스 상점관리자에서 결제 취소 → entitlements에서 해당
  과목 행 삭제(또는 expires_at를 과거로) → orders.status='canceled'로 갱신. 정책은 refund.html 정본.
- 30일 패스 재구매(만료 후)는 정상 동작. **활성 패스 중 소장 업그레이드는 페이월이 "이용중"으로
  막는다** — 요청 들어오면 CS로 처리(백로그: 업그레이드 경로).
- 빌링(자동결제) 상점아이디는 만들지 않았다 — 전 SKU 단건 결제(월구독 기각)라 일반 결제창만 연동.
